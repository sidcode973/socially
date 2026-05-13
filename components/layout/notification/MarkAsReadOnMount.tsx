"use client";

import { useEffect } from "react";
import { markAllNotificationsRead } from "@/actions/notification-action";

export default function MarkAsReadOnMount() {
  useEffect(() => {
    markAllNotificationsRead().catch(() => {});
  }, []);

  return null;
}
