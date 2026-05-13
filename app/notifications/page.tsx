import { Suspense } from "react";
import NotificationsList from "@/components/layout/notification/NotificationsList";
import NotificationsSkeleton from "@/components/layout/notification/NotificationsSkeleton";
import MarkAsReadOnMount from "@/components/layout/notification/MarkAsReadOnMount";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <MarkAsReadOnMount />
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsList />
      </Suspense>
    </div>
  );
}
