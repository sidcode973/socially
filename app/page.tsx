import PostCard from "@/components/layout/postSection/PostSection";
import PostsFeed from "@/components/layout/postSection/PostsFeed";
import WhoToFollow from "@/components/layout/whoToFollow/WhoToFollow";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Middle column — ~60% of remaining width */}
      <div className="lg:col-span-7 space-y-6">
        <PostCard />
        <PostsFeed />
      </div>

      {/* Right column — Who to Follow */}
      <div className="hidden lg:block lg:col-span-5">
        <WhoToFollow />
      </div>
    </div>
  );
}
