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

  if (!session && pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
