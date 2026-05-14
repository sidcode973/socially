import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let token = null;
  try {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
  } catch {
    // If token check fails, treat as unauthenticated
  }

  // Protect /app and everything under it
  if (pathname.startsWith("/app") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
