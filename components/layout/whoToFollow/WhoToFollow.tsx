import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import { getSuggestedUsers } from "@/actions/user-action";

export default async function WhoToFollow() {
  const [users, session] = await Promise.all([
    getSuggestedUsers(3),
    getServerSession(authOptions),
  ]);

  const isAuthenticated = !!session?.user?.email;

  if (users.length === 0) {
    // Database is empty besides the current user — nothing useful to show
    return null;
  }

  return (
    <div className="sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Who to Follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((u) => {
            const initial = (u.name ?? u.username).charAt(0).toUpperCase();

            // Body of each row — clickable for signed-in users, static for guests
            const rowContent = (
              <>
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={u.image || "/avatar.png"} />
                  <AvatarFallback>{initial}</AvatarFallback>
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
              </>
            );

            return (
              <div key={u.id} className="flex items-center justify-between gap-3">
                {isAuthenticated ? (
                  <Link
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    {rowContent}
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-default select-none"
                    title="Sign in to view profiles"
                  >
                    {rowContent}
                  </div>
                )}

                <FollowButton
                  targetUserId={u.id}
                  initialFollowing={u.isFollowedByMe}
                />
              </div>
            );
          })}

          {isAuthenticated ? (
            <Link
              href="/explore"
              className="block pt-2 text-center text-xs font-medium text-violet-500 hover:text-violet-400 transition"
            >
              See all →
            </Link>
          ) : (
            <p
              className="block pt-2 text-center text-xs font-medium text-muted-foreground cursor-default select-none"
              title="Sign in to explore people"
            >
              See all →
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
