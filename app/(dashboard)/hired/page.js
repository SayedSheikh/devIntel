// app/(dashboard)/hired/page.js
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import HiredClient from "@/components/hired/HiredClient";

async function getHiredDevelopers() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("campaign_developers")
    .select(
      `
      id, created_at, contacted_at, interviewed_at,
      campaign:campaigns (id, name, target_role, owner_id),
      developer:developers (
        id, full_name, email, location, avatar_url,
        github_username, skills, activity_score, experience_years
      )
    `,
    )
    .eq("status", "hired")
    .eq("campaigns.owner_id", user.id)
    .order("created_at", { ascending: false });

  // Filter out rows where campaign is null (not owned by this recruiter)
  return (data || []).filter((row) => row.campaign !== null);
}

function HiredSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-48" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function HiredContent() {
  const hired = await getHiredDevelopers();
  return <HiredClient hired={hired} />;
}

export default function HiredPage() {
  return (
    <Suspense fallback={<HiredSkeleton />}>
      <HiredContent />
    </Suspense>
  );
}
