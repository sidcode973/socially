import Link from "next/link";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNotifications, type NotificationItem } from "@/actions/notification-action";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function NotifIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "LIKE")
    return <HeartIcon className="h-4 w-4 text-red-500 fill-current" />;
  if (type === "COMMENT")
    return <MessageCircleIcon className="h-4 w-4 text-violet-500" />;
  return <UserPlusIcon className="h-4 w-4 text-green-500" />;
}

function actionText(type: NotificationItem["type"]) {
  if (type === "LIKE") return "liked your post";
  if (type === "COMMENT") return "commented on your post";
  return "started following you";
}

export default async function NotificationsList() {
  const notifications = await getNotifications();

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No notifications yet. When someone likes, comments, or follows you,
            it&apos;ll show up here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Notifications
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({notifications.filter((n) => !n.read).length} new)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {notifications.map((n) => {
          const initial = (n.creator.name ?? n.creator.username).charAt(0).toUpperCase();

          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-lg p-3 transition ${
                n.read ? "" : "bg-muted/40"
              }`}
            >
              <Link href={`/profile/${n.creator.username}`} className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={n.creator.image || "/avatar.png"} />
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <NotifIcon type={n.type} />
                  <Link
                    href={`/profile/${n.creator.username}`}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {n.creator.name ?? n.creator.username}
                  </Link>
                  <span className="text-muted-foreground">{actionText(n.type)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>

                {/* Comment preview */}
                {n.type === "COMMENT" && n.comment && (
                  <p className="mt-2 text-sm text-muted-foreground border-l-2 border-border pl-3">
                    {n.comment.content}
                  </p>
                )}

                {/* Post preview */}
                {n.post && (n.type === "LIKE" || n.type === "COMMENT") && (
                  <div className="mt-2 rounded-md border border-border bg-background/50 px-3 py-2">
                    {n.post.content && (
                      <p className="text-sm text-foreground line-clamp-2">
                        {n.post.content}
                      </p>
                    )}
                    {n.post.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.post.image}
                        alt=""
                        className="mt-2 max-h-32 rounded object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
