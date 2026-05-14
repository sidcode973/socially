import UsersListSkeleton from "@/components/layout/explore/UsersListSkeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <UsersListSkeleton />
    </div>
  );
}
