import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">User not found</h1>
          <p className="text-sm text-muted-foreground">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
