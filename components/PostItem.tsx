"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { HeartIcon, MessageCircleIcon, SendIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  toggleLike,
  createComment,
  deletePost,
  type FeedPost,
} from "@/actions/post-action";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "less than a minute ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function PostItem({
  post,
  currentUserAvatar,
  isAuthenticated,
}: {
  post: FeedPost;
  currentUserAvatar: string | null;
  isAuthenticated: boolean;
}) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(post.comments.length > 0);
  const [commentDraft, setCommentDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (!isAuthenticated) {
      toast.error("Sign in to like posts");
      return;
    }
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleLike(post.id);
      if (!result.ok) {
        setLiked(wasLiked);
        setLikeCount((c) => c + (wasLiked ? 1 : -1));
        toast.error(result.error);
      }
    });
  }

  function handleComment() {
    if (!isAuthenticated) {
      toast.error("Sign in to comment");
      return;
    }
    if (!commentDraft.trim()) return;

    startTransition(async () => {
      const result = await createComment(post.id, commentDraft);
      if (result.ok) {
        toast.success("Comment posted");
        setCommentDraft("");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.ok) toast.success("Post deleted");
      else toast.error(result.error);
    });
  }

  const authorInitial = (post.author.name ?? post.author.username).charAt(0).toUpperCase();

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={post.author.image || "/avatar.png"} />
              <AvatarFallback>{authorInitial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  {post.author.name ?? post.author.username}
                </span>{" "}
                <span className="text-muted-foreground">@{post.author.username}</span>
                <span className="text-muted-foreground"> · {timeAgo(post.createdAt)}</span>
              </p>
            </div>
          </Link>

          {post.canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The post and all its comments
                    and likes will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isPending}
                    onClick={handleDelete}
                  >
                    {isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {post.content}
          </p>
        )}

        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt=""
            className="rounded-lg max-h-96 w-full object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-1 text-sm transition ${
              liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartIcon className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <MessageCircleIcon className="h-4 w-4" />
            <span>{post.commentCount}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-3 border-t border-border pt-3">
            {post.comments.map((c) => {
              const initial = (c.author.name ?? c.author.username).charAt(0).toUpperCase();
              return (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={c.author.image || "/avatar.png"} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">
                      <span className="font-semibold text-foreground">
                        {c.author.name ?? c.author.username}
                      </span>{" "}
                      <span className="text-muted-foreground">@{c.author.username}</span>
                      <span className="text-muted-foreground"> · {timeAgo(c.createdAt)}</span>
                    </p>
                    <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Composer */}
            {isAuthenticated && (
              <div className="flex gap-3 pt-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentUserAvatar || "/avatar.png"} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    disabled={isPending}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleComment}
                      disabled={isPending || !commentDraft.trim()}
                    >
                      <SendIcon className="h-4 w-4" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
