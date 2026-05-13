"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type CreatePostResult =
  | { ok: true; postId: string }
  | { ok: false; error: string };

export async function createPost(
  content: string,
  image?: string
): Promise<CreatePostResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { ok: false, error: "You must be signed in to post" };
    }

    const trimmedContent = content.trim();
    if (!trimmedContent && !image) {
      return { ok: false, error: "Post cannot be empty" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { ok: false, error: "User not found" };

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content: trimmedContent || null,
        image: image?.trim() || null,
      },
      select: { id: true },
    });

    revalidatePath("/");

    return { ok: true, postId: post.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create post",
    };
  }
}

// ────────────────── Read all posts (with author, comments, likes) ──────────────────

export type FeedComment = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
};

export type FeedPost = {
  id: string;
  content: string | null;
  image: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  canDelete: boolean;
  comments: FeedComment[];
};

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return me?.id ?? null;
}

export async function getPosts(): Promise<FeedPost[]> {
  const myId = await getCurrentUserId();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
        },
      },
      likes: myId
        ? { where: { userId: myId }, select: { id: true } }
        : { take: 0 },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    content: p.content,
    image: p.image,
    createdAt: p.createdAt,
    author: p.author,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: myId ? p.likes.length > 0 : false,
    canDelete: !!myId && myId === p.author.id,
    comments: p.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.author,
    })),
  }));
}

// ────────────────── Toggle like ──────────────────

export type ToggleLikeResult =
  | { ok: true; liked: boolean }
  | { ok: false; error: string };

export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  try {
    const myId = await getCurrentUserId();
    if (!myId) return { ok: false, error: "You must be signed in" };

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: myId, postId } },
    });

    if (existing) {
      await prisma.like.delete({
        where: { userId_postId: { userId: myId, postId } },
      });
      revalidatePath("/");
      return { ok: true, liked: false };
    }

    // Need the post's author to notify (skip if liking own post)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) return { ok: false, error: "Post not found" };

    const ops: Promise<unknown>[] = [
      prisma.like.create({ data: { userId: myId, postId } }),
    ];
    if (post.authorId !== myId) {
      ops.push(
        prisma.notification.create({
          data: {
            type: "LIKE",
            userId: post.authorId, // receiver
            creatorId: myId,       // sender
            postId,
          },
        })
      );
    }
    await Promise.all(ops);

    revalidatePath("/");
    return { ok: true, liked: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}

// ────────────────── Create comment ──────────────────

export type CreateCommentResult =
  | { ok: true; commentId: string }
  | { ok: false; error: string };

export async function createComment(
  postId: string,
  content: string
): Promise<CreateCommentResult> {
  try {
    const myId = await getCurrentUserId();
    if (!myId) return { ok: false, error: "You must be signed in" };

    const trimmed = content.trim();
    if (!trimmed) return { ok: false, error: "Comment cannot be empty" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) return { ok: false, error: "Post not found" };

    const comment = await prisma.comment.create({
      data: { authorId: myId, postId, content: trimmed },
      select: { id: true },
    });

    // Notify the post author (skip if commenting on own post)
    if (post.authorId !== myId) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          userId: post.authorId,
          creatorId: myId,
          postId,
          commentId: comment.id,
        },
      });
    }

    revalidatePath("/");
    return { ok: true, commentId: comment.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}

// ────────────────── Delete post ──────────────────

export type DeletePostResult = { ok: true } | { ok: false; error: string };

export async function deletePost(postId: string): Promise<DeletePostResult> {
  try {
    const myId = await getCurrentUserId();
    if (!myId) return { ok: false, error: "You must be signed in" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { ok: false, error: "Post not found" };
    if (post.authorId !== myId) {
      return { ok: false, error: "You can only delete your own posts" };
    }

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}
