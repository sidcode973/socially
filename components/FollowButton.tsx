"use client";

import { useState, useTransition } from "react";
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
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (result.ok) {
        setFollowing(result.following);
        toast.success(result.following ? "Following" : "Unfollowed");
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
      disabled={isPending}
    >
      {isPending ? "..." : following ? "Following" : "Follow"}
    </Button>
  );
}
