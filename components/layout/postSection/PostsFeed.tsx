import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPosts } from "@/actions/post-action";
import PostItem from "@/components/PostItem";

export default async function PostsFeed() {
  const [posts, session] = await Promise.all([
    getPosts(),
    getServerSession(authOptions),
  ]);

  const isAuthenticated = !!session?.user?.email;
  const currentUserAvatar = session?.user?.image ?? null;

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No posts yet. Be the first to share something!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          currentUserAvatar={currentUserAvatar}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
