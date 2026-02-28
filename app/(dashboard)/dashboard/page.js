// app/(dashboard)/page.js
// URL: /dashboard
// The main dashboard home page

import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Target, TrendingUp, UserCheck } from "lucide-react";
import Link from "next/link";

function StatCard({ title, value, subtitle, icon: Icon, color, href }) {
  return (
    <Link href={href || "#"} className="block group">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl flex-shrink-0 ml-4 ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ event }) {
  const typeColors = {
    profile_update: "bg-blue-500",
    new_repo: "bg-green-500",
    contribution: "bg-purple-500",
    stack_change: "bg-orange-500",
    status_change: "bg-indigo-500",
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
      <div
        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeColors[event.event_type] || "bg-slate-500"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-slate-300 text-sm">
          {event.title || event.event_type}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {new Date(event.occurred_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

async function DashboardContent() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { count: totalDevelopers },
    { count: totalCampaigns },
    { data: statusData },
    { count: recentHires },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("developers").select("*", { count: "exact", head: true }),
    supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("campaign_developers").select("status"),
    supabase
      .from("campaign_developers")
      .select("*", { count: "exact", head: true })
      .eq("status", "hired"),
    supabase
      .from("developer_activity")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(8),
  ]);

  const hiredCount =
    statusData?.filter((r) => r.status === "hired").length || 0;
  const totalTracked = statusData?.length || 0;
  const conversionRate =
    totalTracked > 0 ? Math.round((hiredCount / totalTracked) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Good to see you 👋</h2>
        <p className="text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your recruitment pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Developers"
          value={totalDevelopers || 0}
          subtitle="In your talent pool"
          icon={Users}
          color="bg-indigo-600"
          href="/developers"
        />
        <StatCard
          title="Active Campaigns"
          value={totalCampaigns || 0}
          subtitle="Currently running"
          icon={Target}
          color="bg-emerald-600"
          href="/campaigns"
        />
        <StatCard
          title="Candidates Tracked"
          value={totalTracked}
          subtitle="Across all campaigns"
          icon={TrendingUp}
          color="bg-violet-600"
          href="/campaigns"
        />
        <StatCard
          title="Hired (All Time)"
          value={recentHires || 0}
          subtitle={`${conversionRate}% conversion rate`}
          icon={UserCheck}
          color="bg-amber-600"
          href="/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add Developer", href: "/developers", emoji: "👤" },
              { label: "Create Campaign", href: "/campaigns", emoji: "🎯" },
              { label: "View Analytics", href: "/analytics", emoji: "📊" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">
                <span>{action.emoji}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <Link
              href="/developers"
              className="text-indigo-400 hover:text-indigo-300 text-xs">
              View all →
            </Link>
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((event) => (
              <ActivityItem key={event.id} event={event} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                <TrendingUp className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No activity yet</p>
              <p className="text-slate-600 text-sm mt-1">
                Add developers to see activity here.
              </p>
              <Link
                href="/developers"
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                Add First Developer
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-800 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-48 bg-slate-800 rounded-xl" />
            <div className="col-span-2 h-48 bg-slate-800 rounded-xl" />
          </div>
        </div>
      }>
      <DashboardContent />
    </Suspense>
  );
}
