import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfileByUsername } from "@/actions/user-action";
import { getUserPosts, getUserLikedPosts } from "@/actions/post-action";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

// Always render fresh — never serve a cached profile page
export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [user, posts, likedPosts, session] = await Promise.all([
    getProfileByUsername(username),
    getUserPosts(username),
    getUserLikedPosts(username),
    getServerSession(authOptions),
  ]);

  if (!user) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProfileHeader user={user} />
      <ProfileTabs
        posts={posts}
        likedPosts={likedPosts}
        currentUserAvatar={session?.user?.image ?? null}
        isAuthenticated={!!session?.user?.email}
      />
    </div>
  );
}
