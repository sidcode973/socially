"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type NotificationItem = {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  read: boolean;
  createdAt: Date;
  creator: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  post: {
    id: string;
    content: string | null;
    image: string | null;
  } | null;
  comment: {
    id: string;
    content: string;
  } | null;
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

export async function getNotifications(): Promise<NotificationItem[]> {
  const myId = await getCurrentUserId();
  if (!myId) return [];

  const notifications = await prisma.notification.findMany({
    where: { userId: myId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: {
        select: { id: true, name: true, username: true, image: true },
      },
      post: {
        select: { id: true, content: true, image: true },
      },
      comment: {
        select: { id: true, content: true },
      },
    },
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
    creator: n.creator,
    post: n.post,
    comment: n.comment,
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const myId = await getCurrentUserId();
  if (!myId) return 0;

  return prisma.notification.count({
    where: { userId: myId, read: false },
  });
}

export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  const myId = await getCurrentUserId();
  if (!myId) return { ok: false };

  await prisma.notification.updateMany({
    where: { userId: myId, read: false },
    data: { read: true },
  });

  revalidatePath("/notifications");
  return { ok: true };
}
