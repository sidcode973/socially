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
