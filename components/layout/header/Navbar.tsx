"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { getUnreadNotificationCount } from "@/actions/notification-action";
import { getCurrentUsername } from "@/actions/user-action";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [unreadState, setUnread] = useState(0);
  const [usernameState, setUsername] = useState<string | null>(null);

  const user = session?.user;

  // Re-fetch only when logged in. No synchronous setState — values are
  // derived from `user` below so logout resets them automatically.
  useEffect(() => {
    if (!user) return;
    getUnreadNotificationCount().then(setUnread).catch(() => setUnread(0));
    getCurrentUsername().then(setUsername).catch(() => setUsername(null));
  }, [user, pathname]);

  // Derived values — when user is null, fall back to defaults
  const unread = user ? unreadState : 0;
  const username = user ? usernameState : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-wider font-mono text-foreground">
            Socially
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted text-foreground/80 transition"
              aria-label="Toggle theme"
            >
              <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Home */}
            <Link
              href="/"
              className="h-9 px-3 inline-flex items-center gap-2 rounded-md text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition"
            >
              <HomeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative h-9 px-3 inline-flex items-center gap-2 rounded-md text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition"
            >
              <span className="relative inline-flex">
                <BellIcon className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Notifications</span>
            </Link>

            {/* Profile link (when not logged in shows Login) */}
            {user ? (
              <Link
                href={username ? `/profile/${username}` : "/"}
                className="h-9 px-3 inline-flex items-center gap-2 rounded-md text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="h-9 px-3 inline-flex items-center gap-2 rounded-md text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Avatar dropdown — only when logged in */}
            {user && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="ml-2 h-8 w-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-violet-500/40 transition focus:outline-none focus-visible:ring-violet-500"
                  >
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name ?? "avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-violet-600 text-white text-xs font-semibold">
                        {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-[240px] rounded-lg border border-border bg-popover p-1 shadow-xl"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name ?? "avatar"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-violet-600 text-white text-sm font-semibold">
                            {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {user.name ?? "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />

                    {/* "Signed in as" label */}
                    <div className="px-3 py-1.5 text-xs text-muted-foreground">
                      Signed in as{" "}
                      <span className="text-foreground font-medium">{user.email}</span>
                    </div>

                    <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />

                    {/* Logout */}
                    <DropdownMenu.Item
                      onSelect={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer text-foreground hover:bg-muted focus:bg-muted outline-none"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
