"use server";

import { getServerSession } from "next-auth";
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

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

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
