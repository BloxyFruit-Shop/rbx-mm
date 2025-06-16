import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "~/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        // forward incoming cookies
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  const { pathname } = request.nextUrl;

  // If user is logged in and tries to hit /login, send them to the home page
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in and tries to hit a protected route, redirect to /login
  if (!session && pathname.startsWith("/protected")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // All other cases: let the request through
  return NextResponse.next();
}

export const config = {
  // run this middleware on /protected/* AND on /login
  matcher: ["/protected/:path*", "/login"],
};
