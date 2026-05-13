"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type CurrentUserProfile = {
  name: string | null;
  username: string;
  bio: string | null;
  image: string | null;
  location: string | null;
  website: string | null;
  followers: number;
  following: number;
};

export async function getCurrentUsername(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { username: true },
  });

  return user?.username ?? null;
}

/**
 * If the JWT has an avatar (e.g. from Google) but the DB row's image is
 * null or stale, sync it. Used when the signIn callback never fired for
 * the user's current session (they were logged in before it was added).
 */
async function syncAvatarFromSessionIfNeeded() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.image) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, image: true },
  });

  if (user && user.image !== session.user.image) {
    await prisma.user.update({
      where: { id: user.id },
      data: { image: session.user.image },
    });
  }
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  // Backfill avatar from session if DB row is missing it
  await syncAvatarFromSessionIfNeeded();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      location: true,
      website: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    name: user.name,
    username: user.username,
    bio: user.bio,
    image: user.image,
    location: user.location,
    website: user.website,
    followers: user._count.followers,
    following: user._count.following,
  };
}

export type ProfileByUsername = {
  id: string;
  name: string | null;
  username: string;
  bio: string | null;
  image: string | null;
  location: string | null;
  website: string | null;
  followers: number;
  following: number;
  postsCount: number;
  isMe: boolean;
  isFollowedByMe: boolean;
};

export async function getProfileByUsername(
  username: string
): Promise<ProfileByUsername | null> {
  // Backfill avatar from session if DB row is missing it
  await syncAvatarFromSessionIfNeeded();

  const session = await getServerSession(authOptions);
  let myId: string | null = null;
  if (session?.user?.email) {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    myId = me?.id ?? null;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      location: true,
      website: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
      followers: myId
        ? { where: { followerId: myId }, select: { followerId: true } }
        : { take: 0 },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    image: user.image,
    location: user.location,
    website: user.website,
    followers: user._count.followers,
    following: user._count.following,
    postsCount: user._count.posts,
    isMe: myId !== null && myId === user.id,
    isFollowedByMe: myId !== null && user.followers.length > 0,
  };
}

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}): Promise<UpdateProfileResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, error: "You must be signed in" };
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name?.trim() || null,
        bio: data.bio?.trim() || null,
        location: data.location?.trim() || null,
        website: data.website?.trim() || null,
      },
    });

    revalidatePath("/profile/[username]", "page");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

export type SuggestedUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  followers: number;
};

export async function getSuggestedUsers(limit = 3): Promise<SuggestedUser[]> {
  const session = await getServerSession(authOptions);
  const currentEmail = session?.user?.email ?? null;

  // Find current user's id (if logged in) so we can exclude self + already-followed
  let currentUserId: string | null = null;
  if (currentEmail) {
    const me = await prisma.user.findUnique({
      where: { email: currentEmail },
      select: { id: true },
    });
    currentUserId = me?.id ?? null;
  }

  const users = await prisma.user.findMany({
    where: currentUserId
      ? {
          AND: [
            { NOT: { id: currentUserId } },
            { NOT: { followers: { some: { followerId: currentUserId } } } },
          ],
        }
      : undefined,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      _count: { select: { followers: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    image: u.image,
    followers: u._count.followers,
  }));
}
