// middleware.js — Updated version

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/developers") ||
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/analytics");

  // Routes that are only for non-authenticated users
  // (logged-in users should be sent to dashboard instead)
  const isAuthOnlyRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/check-email";
  // NOTE: '/reset-password' is NOT here because logged-in users with recovery sessions
  // need to be able to reach it to update their password

  // Unauthenticated user trying to access protected page → send to login
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user trying to visit login/signup pages → send to dashboard
  // Exception: users with recovery sessions should be allowed to reach /reset-password
  if (user && isAuthOnlyRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
