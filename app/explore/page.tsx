import { getAllUsers } from "@/actions/user-action";
import UsersList from "@/components/layout/explore/UsersList";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  // Pre-fetch the first page on the server for fast initial paint
  const { users, hasMore } = await getAllUsers({ page: 0, take: 20 });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Explore People</h1>
        <p className="text-sm text-muted-foreground">
          Find and follow other members of Socially.
        </p>
      </div>

      <UsersList initialUsers={users} initialHasMore={hasMore} />
    </div>
  );
}
