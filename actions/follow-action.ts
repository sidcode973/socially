"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type ToggleFollowResult =
  | { ok: true; following: boolean }
  | { ok: false; error: string };

export async function toggleFollow(targetUserId: string): Promise<ToggleFollowResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, error: "You must be signed in to follow" };
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!me) return { ok: false, error: "User not found" };
    if (me.id === targetUserId) return { ok: false, error: "You can't follow yourself" };

    const existing = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: targetUserId,
        },
      },
    });

    if (existing) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: me.id,
            followingId: targetUserId,
          },
        },
      });
      revalidatePath("/");
      return { ok: true, following: false };
    }

    await prisma.follows.create({
      data: { followerId: me.id, followingId: targetUserId },
    });
    revalidatePath("/");
    return { ok: true, following: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}
