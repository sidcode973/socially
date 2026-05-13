"use client";

import { FileTextIcon, HeartIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PostItem from "@/components/PostItem";
import type { FeedPost } from "@/actions/post-action";

export default function ProfileTabs({
  posts,
  likedPosts,
  currentUserAvatar,
  isAuthenticated,
}: {
  posts: FeedPost[];
  likedPosts: FeedPost[];
  currentUserAvatar: string | null;
  isAuthenticated: boolean;
}) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="posts" className="flex-1">
          <FileTextIcon className="h-4 w-4 mr-2" />
          Posts
        </TabsTrigger>
        <TabsTrigger value="likes" className="flex-1">
          <HeartIcon className="h-4 w-4 mr-2" />
          Likes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No posts yet.
          </p>
        ) : (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserAvatar={currentUserAvatar}
              isAuthenticated={isAuthenticated}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="likes" className="space-y-4">
        {likedPosts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No liked posts yet.
          </p>
        ) : (
          likedPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserAvatar={currentUserAvatar}
              isAuthenticated={isAuthenticated}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
