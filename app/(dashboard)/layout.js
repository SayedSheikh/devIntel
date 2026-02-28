// app/(dashboard)/layout.js
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

// ── Fetch profile WITHOUT connection() ──
// Layout must never block — we let Suspense handle the async boundary
async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Auto-create profile if it doesn't exist yet
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Recruiter",
        avatar_url:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: "recruiter",
      })
      .select()
      .single();
    return newProfile;
  }

  return profile;
}

// ── LayoutShell receives profile as prop — no async work inside ──
function LayoutShell({ profile, children }) {
  return (
    <div className="h-screen bg-slate-950 overflow-hidden flex">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ── AuthGuard wraps async profile fetch + redirect logic ──
// This is inside Suspense so it doesn't block the outer layout
async function AuthGuard({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile();

  return <LayoutShell profile={profile}>{children}</LayoutShell>;
}

// ── Layout skeleton shown while AuthGuard resolves ──
function LayoutSkeleton() {
  return (
    <div className="h-screen bg-slate-950 flex animate-pulse">
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0" />
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-slate-900 border-b border-slate-800" />
        <div className="flex-1 bg-slate-950" />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}
