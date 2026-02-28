// lib/supabase/client.js
// Singleton browser client — same instance reused across all components
// NEVER call createBrowserClient() inside a component body
// Always import this single instance

import { createBrowserClient } from "@supabase/ssr";

let client = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return client;
}
