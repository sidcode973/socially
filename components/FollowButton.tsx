"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/actions/follow-action";

export default function FollowButton({
  targetUserId,
  initialFollowing = false,
}: {
  targetUserId: string;
  initialFollowing?: boolean;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user?.email;

  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) return; // Guard, button is also disabled
    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (result.ok) {
        setFollowing(result.following);
        toast.success(result.following ? "Followed" : "Unfollowed");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={following ? "outline" : "secondary"}
      onClick={handleClick}
      disabled={isPending || !isAuthenticated}
      title={!isAuthenticated ? "Sign in to follow" : undefined}
    >
      {isPending ? "..." : following ? "Unfollow" : "Follow"}
    </Button>
  );
}
