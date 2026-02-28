// Replace the entire file with this updated version
"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Github,
  Clock,
  Star,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Activity,
  Code2,
  Briefcase,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { campaignsQueryOptions } from "@/lib/queries/campaigns";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date) {
  if (!date) return "Unknown";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProfileStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-slate-400 text-xs">{label}</p>
          <p className="text-white font-semibold text-lg leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ event }) {
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
        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[event.event_type] || "bg-slate-500"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-slate-300 text-sm">
          {event.title || event.event_type}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {timeAgo(event.occurred_at)}
        </p>
      </div>
    </div>
  );
}

function SkillList({ skills }) {
  if (!skills || skills.length === 0) {
    return <p className="text-slate-500 text-sm">No skills listed</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge
          key={skill}
          variant="secondary"
          className="bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500 transition-colors">
          {skill}
        </Badge>
      ))}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-slate-400" />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// AddToCampaignInline — top-level component, shown inside a dialog
function AddToCampaignInline({ developerId, onClose }) {
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery(
    campaignsQueryOptions({ status: "active" }),
  );
  const campaigns = data?.data || [];

  async function handleAdd(campaignId) {
    setAddingId(campaignId);
    setError(null);

    const response = await fetch(`/api/campaigns/${campaignId}/developers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developer_id: developerId }),
    });
    const result = await response.json();
    setAddingId(null);

    if (response.ok) {
      setAddedIds((prev) => new Set(prev).add(campaignId));
    } else {
      setError(result.error || "Failed to add");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}
      {isLoading ? (
        <p className="text-slate-400 text-sm text-center py-4">
          Loading campaigns...
        </p>
      ) : campaigns.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">
          No active campaigns found
        </p>
      ) : (
        campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">
                {campaign.name}
              </p>
              {campaign.target_role && (
                <p className="text-slate-500 text-xs">{campaign.target_role}</p>
              )}
            </div>
            <button
              onClick={() => handleAdd(campaign.id)}
              disabled={addedIds.has(campaign.id) || addingId === campaign.id}
              className={`ml-3 flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                addedIds.has(campaign.id)
                  ? "bg-green-900/30 text-green-400 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              } disabled:opacity-60`}>
              {addedIds.has(campaign.id)
                ? "✓ Added"
                : addingId === campaign.id
                  ? "..."
                  : "Add"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default function DeveloperProfileClient({ developer, activity }) {
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Link
        href="/developers"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Developers
      </Link>

      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="w-20 h-20 flex-shrink-0 ring-2 ring-slate-700">
            <AvatarImage src={developer.avatar_url} alt={developer.full_name} />
            <AvatarFallback className="bg-indigo-700 text-white text-2xl font-bold">
              {getInitials(developer.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {developer.full_name}
              </h1>
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-400 capitalize">
                {developer.profile_source || "manual"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              {developer.location && (
                <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {developer.location}
                </span>
              )}
              {developer.github_username && (
                <a
                  href={`https://github.com/${developer.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                  <Github className="w-3.5 h-3.5 flex-shrink-0" />
                  {developer.github_username}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                Active{" "}
                {timeAgo(developer.last_active_at || developer.created_at)}
              </span>
            </div>

            {developer.bio && (
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                {developer.bio}
              </p>
            )}
          </div>

          {/* Add to Campaign button */}
          <div className="flex-shrink-0">
            <Button
              onClick={() => setShowCampaignDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
              <Target className="w-4 h-4" />
              Add to Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <ProfileStatCard
          icon={Star}
          label="Activity Score"
          value={`${developer.activity_score ?? 0}/100`}
          color="bg-amber-600"
        />
        <ProfileStatCard
          icon={Briefcase}
          label="Experience"
          value={`${developer.experience_years ?? 0} yrs`}
          color="bg-indigo-600"
        />
        <ProfileStatCard
          icon={Calendar}
          label="Added On"
          value={formatDate(developer.created_at)}
          color="bg-emerald-600"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Skills" icon={Code2}>
          <SkillList skills={developer.skills} />
        </SectionCard>

        <SectionCard title="Recent Activity" icon={Activity}>
          {activity && activity.length > 0 ? (
            activity.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No activity recorded yet</p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Add to Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add to Campaign</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select an active campaign to add {developer.full_name} to.
            </DialogDescription>
          </DialogHeader>
          <AddToCampaignInline
            developerId={developer.id}
            onClose={() => setShowCampaignDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
