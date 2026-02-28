// components/campaigns/PipelineBoard.js
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { campaignKeys } from "@/lib/queries/campaigns";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import PipelineColumn from "@/components/campaigns/PipelineColumn";
import CampaignStatusMenu from "@/components/campaigns/CampaignStatusMenu";
import AddToCampaignDialog from "@/components/campaigns/AddToCampaignDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Plus } from "lucide-react";

// Pipeline stage configuration — order matters for advance/reverse logic
const PIPELINE_STAGES = [
  {
    status: "shortlisted",
    label: "Shortlisted",
    color: "bg-slate-400",
    bgColor: "bg-slate-600",
    borderColor: "border-slate-700",
  },
  {
    status: "contacted",
    label: "Contacted",
    color: "bg-blue-400",
    bgColor: "bg-blue-700",
    borderColor: "border-blue-900",
  },
  {
    status: "interviewing",
    label: "Interviewing",
    color: "bg-yellow-400",
    bgColor: "bg-yellow-700",
    borderColor: "border-yellow-900",
  },
  {
    status: "offered",
    label: "Offered",
    color: "bg-purple-400",
    bgColor: "bg-purple-700",
    borderColor: "border-purple-900",
  },
  {
    status: "hired",
    label: "Hired",
    color: "bg-green-400",
    bgColor: "bg-green-700",
    borderColor: "border-green-900",
  },
  {
    status: "rejected",
    label: "Rejected",
    color: "bg-red-400",
    bgColor: "bg-red-700",
    borderColor: "border-red-900",
  },
];

const ALL_STATUSES = PIPELINE_STAGES.map((s) => s.status);

export default function PipelineBoard({ campaign, initialCandidates }) {
  const queryClient = useQueryClient();

  const [candidates, setCandidates] = useState(initialCandidates);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [campaignStatus, setCampaignStatus] = useState(campaign.status);
  // campaignStatus: local copy so status menu updates instantly without refetch

  // ── Realtime subscription ──
  // Fires when another recruiter changes a candidate status in this campaign
  useRealtimeTable({
    table: "campaign_developers",
    channelName: `pipeline-${campaign.id}`,
    onUpdate: (updated) => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      );
    },
    onInsert: () => {
      // Refetch full list to get joined developer details
      // Realtime payload does not include joined relations
      fetch(`/api/campaigns/${campaign.id}/developers`)
        .then((r) => r.json())
        .then((result) => {
          if (result.data) setCandidates(result.data);
        });
    },
    onDelete: (deleted) => {
      setCandidates((prev) => prev.filter((c) => c.id !== deleted.id));
    },
  });

  // ── Optimistic status change handler ──
  // Updates UI immediately, reverts if API call fails
  const handleStatusChange = useCallback(
    async (candidateId, newStatus) => {
      const previousCandidates = candidates;

      // Optimistic update
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, status: newStatus } : c,
        ),
      );
      setUpdatingIds((prev) => new Set(prev).add(candidateId));

      const response = await fetch(`/api/campaigns/${campaign.id}/developers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidateId, status: newStatus }),
      });

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(candidateId);
        return next;
      });

      if (!response.ok) {
        // Revert on failure
        setCandidates(previousCandidates);
        console.error("Failed to update candidate status");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: campaignKeys.all() });
    },
    [campaign.id, candidates, queryClient],
  );

  // ── Group candidates by status for column rendering ──
  const candidatesByStatus = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.status] = candidates.filter((c) => c.status === stage.status);
    return acc;
  }, {});

  const totalCandidates = candidates.length;
  const hiredCount = candidatesByStatus["hired"]?.length || 0;
  const conversionRate =
    totalCandidates > 0 ? Math.round((hiredCount / totalCandidates) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 space-y-4">
        {/* Back link */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        {/* Campaign info + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left — icon + name + status menu */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-800 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-white">
                  {campaign.name}
                </h1>

                {/* ── Clickable status dropdown ── */}
                <CampaignStatusMenu
                  campaignId={campaign.id}
                  currentStatus={campaignStatus}
                  onStatusChange={setCampaignStatus}
                />
              </div>
              {campaign.target_role && (
                <p className="text-slate-400 text-sm mt-0.5">
                  {campaign.target_role}
                </p>
              )}
            </div>
          </div>

          {/* Right — stats + add button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Stats bar */}
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-none">
                  {totalCandidates}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Total</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-center">
                <p className="text-green-400 font-bold text-lg leading-none">
                  {hiredCount}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Hired</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-center">
                <p className="text-indigo-400 font-bold text-lg leading-none">
                  {conversionRate}%
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Rate</p>
              </div>
            </div>

            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Developer
            </Button>
          </div>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      {/* overflow-x-auto: horizontal scroll for 6 columns on smaller screens */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="flex gap-4 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.status}
              status={stage.status}
              label={stage.label}
              color={stage.color}
              bgColor={stage.bgColor}
              borderColor={stage.borderColor}
              candidates={candidatesByStatus[stage.status] || []}
              allStatuses={ALL_STATUSES}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {/* ── Add Developer Dialog ── */}
      <AddToCampaignDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        campaignId={campaign.id}
        existingDeveloperIds={candidates
          .map((c) => c.developer?.id)
          .filter(Boolean)}
        onAdded={(newCandidate) =>
          setCandidates((prev) => [...prev, newCandidate])
        }
      />
    </div>
  );
}
