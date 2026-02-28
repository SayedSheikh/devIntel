// app/(dashboard)/analytics/page.js
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

async function getAnalyticsData() {
  await connection();
  const supabase = await createClient();

  const [
    { count: totalDevelopers },
    { count: totalCampaigns },
    { data: statusData },
    { data: topSkillsRaw },
    { data: activityData },
  ] = await Promise.all([
    supabase.from("developers").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
    supabase.from("campaign_developers").select("status"),
    supabase.from("developers").select("skills"),
    supabase
      .from("developer_activity")
      .select("occurred_at, event_type")
      .order("occurred_at", { ascending: false })
      .limit(100),
  ]);

  // Count status distribution
  const statusCounts = {};
  (statusData || []).forEach(({ status }) => {
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Count top skills
  const skillCounts = {};
  (topSkillsRaw || []).forEach(({ skills }) => {
    (skills || []).forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  // Activity by day (last 7 days)
  const activityByDay = {};
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  days.forEach((d) => {
    activityByDay[d] = 0;
  });
  (activityData || []).forEach(({ occurred_at }) => {
    const day = new Date(occurred_at).toISOString().split("T")[0];
    if (activityByDay[day] !== undefined) activityByDay[day]++;
  });
  const activitySeries = days.map((day) => ({
    day: new Date(day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: activityByDay[day],
  }));

  return {
    totalDevelopers: totalDevelopers || 0,
    totalCampaigns: totalCampaigns || 0,
    statusCounts,
    topSkills,
    activitySeries,
  };
}

function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-800 rounded-xl" />
        <div className="h-72 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

async function AnalyticsContent() {
  const analyticsData = await getAnalyticsData();
  return <AnalyticsClient data={analyticsData} />;
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  );
}
