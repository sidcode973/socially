import PostCard from "@/components/layout/postSection/PostSection";



export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Middle column — ~60% of remaining width */}
      <div className="lg:col-span-7 space-y-6">
        <PostCard />
      </div>

      {/* Right column — placeholder for "Who to Follow" */}
      <div className="hidden lg:block lg:col-span-5">
        {/* Who to Follow goes here */}
      </div>
    </div>
  );
}
