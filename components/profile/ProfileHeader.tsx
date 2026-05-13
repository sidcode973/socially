import { CalendarIcon, LinkIcon, MapPinIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import FollowButton from "@/components/FollowButton";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import type { ProfileByUsername } from "@/actions/user-action";

export default function ProfileHeader({ user }: { user: ProfileByUsername }) {
  const initial = (user.name ?? user.username).charAt(0).toUpperCase();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 border-2">
            <AvatarImage src={user.image || "/avatar.png"} />
            <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
          </Avatar>

          <h1 className="mt-4 text-xl font-bold text-foreground">
            {user.name ?? user.username}
          </h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>

          {user.bio && (
            <p className="mt-3 text-sm text-muted-foreground max-w-md whitespace-pre-wrap">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="mt-5 w-full max-w-sm">
            <Separator />
            <div className="flex justify-between py-3">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{user.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <Separator orientation="vertical" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{user.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <Separator orientation="vertical" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{user.postsCount}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>
            <Separator />
          </div>

          {/* Action button */}
          <div className="mt-5">
            {user.isMe ? (
              <EditProfileDialog
                initial={{
                  name: user.name,
                  bio: user.bio,
                  location: user.location,
                  website: user.website,
                }}
              />
            ) : (
              <FollowButton
                targetUserId={user.id}
                initialFollowing={user.isFollowedByMe}
              />
            )}
          </div>

          {/* Meta */}
          <div className="mt-5 w-full max-w-sm space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.location ?? "No location"}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 shrink-0" />
              {user.website ? (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-foreground transition"
                >
                  {user.website}
                </a>
              ) : (
                <span className="truncate">No website</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>Member of Socially</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
