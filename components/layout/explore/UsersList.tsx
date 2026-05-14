"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import { getAllUsers, type ExploreUser } from "@/actions/user-action";

const PAGE_SIZE = 20;

export default function UsersList({
  initialUsers,
  initialHasMore,
}: {
  initialUsers: ExploreUser[];
  initialHasMore: boolean;
}) {
  const [users, setUsers] = useState<ExploreUser[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Search — debounced refetch from page 0
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await getAllUsers({ page: 0, query, take: PAGE_SIZE });
        setUsers(result.users);
        setHasMore(result.hasMore);
        setPage(1);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Infinite scroll — load next page when sentinel enters viewport
  useEffect(() => {
    if (!hasMore || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTransition(async () => {
            const result = await getAllUsers({ page, query, take: PAGE_SIZE });
            setUsers((prev) => [...prev, ...result.users]);
            setHasMore(result.hasMore);
            setPage((p) => p + 1);
          });
        }
      },
      { rootMargin: "200px" }
    );

    const node = sentinelRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasMore, isPending, page, query]);

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Search */}
        <div className="relative mb-5">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        {/* User list */}
        {users.length === 0 && !isPending ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {query
              ? `No users found matching "${query}"`
              : "No users yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const initial = (u.name ?? u.username).charAt(0).toUpperCase();
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/40 transition"
                >
                  <Link
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={u.image || "/avatar.png"} />
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {u.name ?? u.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{u.username}
                      </p>
                      {u.bio && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {u.bio}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {u.followers}{" "}
                        {u.followers === 1 ? "follower" : "followers"}
                      </p>
                    </div>
                  </Link>

                  <FollowButton
                    targetUserId={u.id}
                    initialFollowing={u.isFollowedByMe}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Loader / sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="py-4 text-center">
            <p className="text-xs text-muted-foreground">
              {isPending ? "Loading..." : ""}
            </p>
          </div>
        )}

        {!hasMore && users.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">
            You&apos;ve reached the end
          </p>
        )}
      </CardContent>
    </Card>
  );
}
