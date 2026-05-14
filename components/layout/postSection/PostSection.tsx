"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { SendIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadButton, ImagePreview } from "@/components/ImageUpload";
import { createPost } from "@/actions/post-action";

export default function PostCard() {
  const { data: session } = useSession();
  const user = session?.user;

  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  function handleSubmit() {
    if (!content.trim() && !image.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await createPost(content, image || undefined);

      if (result.ok) {
        toast.success("Post created successfully");
        setContent("");
        setImage("");
      } else {
        toast.error(result.error || "Failed to create post");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={user.image || "/avatar.png"} />
            <AvatarFallback>
              {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              className="min-h-15 border-0 bg-transparent focus:ring-0 px-0 text-base"
            />

            {image && (
              <ImagePreview
                value={image}
                onRemove={() => setImage("")}
                disabled={isPending}
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          {!image ? (
            <ImageUploadButton onChange={setImage} disabled={isPending} />
          ) : (
            <span />
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || (!content.trim() && !image.trim())}
            size="sm"
          >
            <SendIcon className="h-4 w-4" />
            {isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
