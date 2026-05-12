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
