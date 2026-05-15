# Socially

A full-stack social media platform built with **Next.js 16**, **PostgreSQL**, and **Prisma**. Users can sign up, post content with images, follow others, like, comment, and receive notifications — all with a modern, themable, mobile-friendly UI.

> Built as a portfolio project to learn production-grade patterns: Server Components, Server Actions, JWT auth, OAuth flows, direct-to-CDN uploads, and self-referencing relational data.

---

## Live Demo

🔗 **Live:** https://socially-inky.vercel.app/
💻 **Code:** https://github.com/sidcode973/socially.git

---

## Features

### Authentication
- Email + password sign-up and sign-in (passwords hashed with **bcrypt**)
- **Google OAuth** via NextAuth — auto-creates the user row + syncs Google avatar on first sign-in
- **GitHub OAuth** (optional, ready to wire)
- JWT sessions stored as `HttpOnly` cookies — stateless, no DB hits per request
- Route-level protection via Next.js 16 `proxy.ts` middleware

### Posts
- Create posts with text, images, or both
- **Direct-to-Cloudinary uploads** using unsigned presets — files never touch the server
- Optimistic-UI likes with rollback on error
- Threaded comments with inline composer
- Delete posts with a confirmation `AlertDialog`

### Social graph
- Follow / unfollow with self-referencing many-to-many relations
- Composite primary keys prevent duplicate follows at the DB level
- "Who to Follow" sidebar with smart fallback (shows followed users if you've followed everyone)
- Dedicated **`/explore` page** with **debounced search** + **infinite scroll** via `IntersectionObserver`
- User profile pages at `/profile/[username]` with Posts and Likes tabs
- Edit-profile dialog (name, bio, location, website)

### Feed
- Feed shows only posts from people you follow + your own
- Empty-state UX:
  - Logged out → "Sign in to see your feed"
  - Logged in with no follows → "Find people to follow" CTA → `/explore`

### Notifications
- LIKE, COMMENT, and FOLLOW notifications generated as side effects
- Unread count badge on the navbar bell icon
- Auto-mark-as-read when opening the notifications page
- Skeleton loaders via Suspense + `loading.tsx`

### Theming & UX
- Light / dark mode via `next-themes` — all components use semantic tokens
- Toast notifications for every mutation (react-hot-toast)
- shadcn/ui primitives wrapped over Radix for accessibility
- Mobile-responsive layout (sidebar hides below `lg` breakpoint)

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js Server Actions + Route Handlers |
| Database | PostgreSQL via Prisma ORM (v7) |
| Auth | NextAuth.js v4 (JWT strategy) — Credentials, Google, GitHub |
| Media | Cloudinary (direct-to-browser uploads with unsigned presets) |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Theming | next-themes |
| Deployment | Vercel |

---

## Project Structure

```
actions/                                Server actions ("use server")
  auth-action.ts                          register a new user
  user-action.ts                          profile reads + edit + explore + suggestions
  post-action.ts                          CRUD + feed + likes + comments
  follow-action.ts                        toggle follow / unfollow
  notification-action.ts                  list + count + mark-as-read

app/
  api/auth/[...nextauth]/                 NextAuth HTTP handler
  login/                                  Sign-in page
  register/                               Sign-up page
  explore/                                Browse all users + search
  notifications/                          Notifications inbox
  profile/[username]/                     Dynamic profile route
  layout.tsx                              Root layout (Providers + Navbar + Sidebar)
  page.tsx                                Home feed
  providers.tsx                           SessionProvider + Toaster

components/
  ui/                                     shadcn primitives
                                          (avatar, button, card, dialog,
                                           alert-dialog, tabs, separator,
                                           skeleton, textarea)
  auth/
    Login.tsx
    Register.tsx
  layout/
    header/Navbar.tsx
    sidebar/Sidebar.tsx
    postSection/PostSection.tsx           post composer
    postSection/PostsFeed.tsx             feed wrapper (server)
    whoToFollow/WhoToFollow.tsx
    notification/NotificationsList.tsx
    notification/NotificationsSkeleton.tsx
    notification/MarkAsReadOnMount.tsx
    explore/UsersList.tsx                 search + infinite scroll
    explore/UsersListSkeleton.tsx
  profile/
    ProfileHeader.tsx
    ProfileTabs.tsx
    EditProfileDialog.tsx
  PostItem.tsx                            individual post card (client)
  FollowButton.tsx                        reusable Follow/Unfollow button
  ImageUpload.tsx                         Cloudinary upload + preview

lib/
  auth.ts                                 NextAuth authOptions (shared config)
  prisma.ts                               Prisma singleton
  utils.ts                                cn() helper

prisma/
  schema.prisma                           6 models: User, Post, Comment, Like,
                                          Follows, Notification

proxy.ts                                  Route guard (renamed from middleware.ts
                                          in Next.js 16)
```

---

## Database Schema

```
User
 ├─ posts          (1-n)
 ├─ comments       (1-n)
 ├─ likes          (1-n)
 ├─ followers      (n-n via Follows, self-reference "following")
 ├─ following      (n-n via Follows, self-reference "follower")
 └─ notifications  (1-n received, 1-n created)

Post
 ├─ author         (n-1 User, ON DELETE CASCADE)
 ├─ comments       (1-n)
 ├─ likes          (1-n)
 └─ notifications  (1-n)

Like
 └─ @@unique([userId, postId])    one like per user per post

Follows
 └─ @@id([followerId, followingId])    composite PK prevents duplicate follows

Notification
 ├─ type (LIKE | COMMENT | FOLLOW)
 ├─ userId      receiver
 ├─ creatorId   sender
 ├─ postId?     optional (set for LIKE / COMMENT)
 └─ commentId?  optional (set for COMMENT)
```

Counts (`followers`, `following`, `likes`, `comments`) are fetched via Prisma's `_count` aggregate so the app never loads relation rows just to count them.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or hosted — Neon, Supabase, Railway, etc.)
- A Cloudinary account (free tier is fine)
- (Optional) Google OAuth Client for social login

### Install

```bash
git clone <repo-url>
cd socially
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
AUTH_SECRET="generate_a_32_char_random_string"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Cloudinary (required for image upload in posts)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
```

Generate the auth secret:

```bash
openssl rand -base64 32
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

---

## Cloudinary Setup (for post images)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy your **Cloud name** from the dashboard
3. Go to **Settings → Upload → Upload presets → Add upload preset**
   - **Signing mode:** Unsigned
   - **Folder:** `socially/posts` (optional)
   - **Save** and copy the preset name
4. Paste both values into `.env.local`

The browser uploads directly to Cloudinary's CDN — your Next.js server never sees the file bytes. Only the resulting `secure_url` is stored in PostgreSQL.

---

## Google OAuth Setup

1. Visit [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Application type: Web application)
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
4. Copy the client ID + secret into `.env.local` (and Vercel env vars for prod)

On first Google sign-in, the `signIn` callback in `lib/auth.ts` automatically:
- Creates a `User` row with the Google email, name, and avatar
- Derives a unique username from the email local-part
- Syncs the avatar on subsequent sign-ins if Google's changed

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo into Vercel
3. **Add every variable from `.env.local`** to Vercel → Settings → Environment Variables
4. Make sure `package.json` has:
   ```json
   "scripts": {
     "build": "prisma generate && next build",
     "postinstall": "prisma generate"
   }
   ```
5. Deploy → run `npx prisma db push` against your production database

### Production gotchas

- **The `app/generated/prisma` folder is gitignored** — Vercel must run `prisma generate` during build (handled by the `postinstall` + `build` scripts above)
- **`.env.local` is never deployed** — env vars must be in the Vercel dashboard
- **`NEXTAUTH_URL`** must be set to the deployed domain or OAuth callbacks break

---

## Architecture Notes

- **Server Components by default.** Most components render on the server (Sidebar, PostsFeed, WhoToFollow, ProfileHeader, NotificationsList). Client components are reserved for interactivity (PostSection composer, PostItem, FollowButton, Navbar).

- **Server Actions for mutations.** Every write goes through a typed server action — no manual `fetch()` calls. Each action re-verifies the session and ownership before mutating data.

- **One Route Handler.** `app/api/auth/[...nextauth]/route.ts` is the only HTTP endpoint — it exists because OAuth providers and `SessionProvider` need plain HTTP.

- **Defense in depth.** Two layers of authorization:
  1. `proxy.ts` middleware reads the JWT cookie and redirects unauthenticated users from protected routes
  2. Every Server Action calls `getServerSession()` and re-verifies ownership before mutating

- **Cache invalidation.** Mutations call `revalidatePath()` on the relevant routes. Pages where freshness matters (profile, explore) are marked `export const dynamic = "force-dynamic"`.

- **Direct-to-CDN uploads.** Cloudinary uploads bypass the server entirely. No bandwidth cost, no upload pipeline to maintain.

---

## Scripts

```bash
npm run dev          # start dev server
npm run build        # production build (runs prisma generate first)
npm run start        # run production server
npm run lint         # run ESLint
npx prisma studio    # browse the database in a GUI
npx prisma db push   # push schema changes to the DB
```

---

## Roadmap

- [ ] Avatar upload via Cloudinary (currently uses Google's URL or initials fallback)
- [ ] Followers / Following list pages (`/profile/[username]/followers`)
- [ ] Real-time notifications via Pusher or WebSockets
- [ ] Post editing
- [ ] Direct messages
- [ ] Repost / quote-post

---

## License

MIT
