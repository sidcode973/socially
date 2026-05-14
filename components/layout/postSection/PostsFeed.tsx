import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/actions/post-action";
import PostItem from "@/components/PostItem";

export default async function PostsFeed() {
  const [posts, session] = await Promise.all([
    getPosts(),
    getServerSession(authOptions),
  ]);

  const isAuthenticated = !!session?.user?.email;
  const currentUserAvatar = session?.user?.image ?? null;

  // Not signed in
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            Sign in to see your feed
          </h2>
          <p className="text-sm text-muted-foreground">
            Follow people and share posts to make this place your own.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Signed in, but feed is empty (no follows + no own posts yet)
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Your feed is quiet
          </h2>
          <p className="text-sm text-muted-foreground">
            Follow some people to see their posts here — or share something yourself.
          </p>
          <div className="flex justify-center pt-1">
            <Button asChild size="sm">
              <Link href="/explore">Find people to follow</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
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
