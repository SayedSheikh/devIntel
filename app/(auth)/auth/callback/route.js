// app/(auth)/auth/callback/route.js
// This handles TWO types of callbacks:
// 1. OAuth (GitHub/Google): after login, exchange code for session
// 2. Password Reset: after clicking reset link in email, exchange code for recovery session

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  // 'code' is present for both OAuth and password reset flows
  // Supabase uses PKCE (Proof Key for Code Exchange) for security
  // This one-time code must be exchanged for a real session token

  const next = searchParams.get("next") ?? "/dashboard";
  // Where to redirect after successful authentication
  // Default to /dashboard if not specified

  const error_param = searchParams.get("error");
  // If there was an error (e.g., user cancelled OAuth), Supabase puts the error here

  // If there's an error from the OAuth provider
  if (error_param) {
    console.error(
      "OAuth error:",
      error_param,
      searchParams.get("error_description"),
    );
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Authentication was cancelled or failed. Please try again.")}`,
    );
  }

  if (!code) {
    // No code and no error — something went wrong (e.g., direct navigation to this URL)
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
          // Sets the session cookie in the browser
          // This is what keeps the user logged in across page refreshes
        },
      },
    },
  );

  // Exchange the authorization code for a session
  // For password reset: this creates a "recovery" session
  // For OAuth: this creates a full authenticated session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Session exchange error:", error.message);
    // Common errors:
    // - "invalid request" = code already used (links are one-time)
    // - "code challenge and verifier does not match" = PKCE mismatch
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("This link has expired or already been used. Please try again.")}`,
    );
  }

  // Session is now set. Redirect to the intended destination.
  // For password reset: `next` will be '/reset-password'
  // For OAuth login: `next` will be '/dashboard'
  return NextResponse.redirect(`${origin}${next}`);
}
