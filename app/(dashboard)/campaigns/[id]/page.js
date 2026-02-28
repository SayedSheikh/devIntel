// app/(dashboard)/campaigns/[id]/page.js
// The pipeline board for a single campaign
// Server component fetches campaign + candidates, passes to client board

import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PipelineBoard from "@/components/campaigns/PipelineBoard";

async function getCampaignData(id) {
  await connection();
  const supabase = await createClient();

  const [{ data: campaign, error: campaignError }, { data: candidates }] =
    await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).single(),
      supabase
        .from("campaign_developers")
        .select(
          `
        id, status, notes, contacted_at, interviewed_at, created_at,
        developer:developers (
          id, full_name, email, location, avatar_url,
          github_username, skills, activity_score, experience_years
        )
      `,
        )
        .eq("campaign_id", id)
        .order("created_at", { ascending: true }),
    ]);

  if (campaignError || !campaign) return null;

  return { campaign, candidates: candidates || [] };
}

function PipelineSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-64" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 h-96 bg-slate-800 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

async function PipelineContent({ id }) {
  const result = await getCampaignData(id);
  if (!result) notFound();
  return (
    <PipelineBoard
      campaign={result.campaign}
      initialCandidates={result.candidates}
    />
  );
}

export default async function CampaignPipelinePage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PipelineSkeleton />}>
      <PipelineContent id={id} />
    </Suspense>
  );
}
