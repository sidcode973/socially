import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import { getSuggestedUsers } from "@/actions/user-action";

export default async function WhoToFollow() {
  const users = await getSuggestedUsers(3);

  if (users.length === 0) return null;

  return (
    <div className="sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Who to Follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3">
              <Link
                href={`/profile/${u.username}`}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={u.image || "/avatar.png"} />
                  <AvatarFallback>
                    {(u.name ?? u.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {u.name ?? u.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{u.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.followers} {u.followers === 1 ? "follower" : "followers"}
                  </p>
                </div>
              </Link>

              <FollowButton targetUserId={u.id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
