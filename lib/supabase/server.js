// lib/supabase/server.js
// This file creates a Supabase client for use on the server
// (Server Components, API routes, Server Actions, middleware)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// cookies() is a Next.js function that reads/writes cookies on the server

export async function createClient() {
  // cookies() must be called inside an async function
  // It returns the cookie store for the current request
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // getAll: tells Supabase how to READ cookies in this environment
        getAll() {
          return cookieStore.getAll();
        },
        // setAll: tells Supabase how to WRITE cookies in this environment
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies
            // This error is expected and safe to ignore here
            // The middleware will handle refreshing sessions
          }
        },
      },
    },
  );
}
