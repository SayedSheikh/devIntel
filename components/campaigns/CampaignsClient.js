// components/campaigns/CampaignsClient.js
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { campaignsQueryOptions } from "@/lib/queries/campaigns";
import CampaignCard from "@/components/campaigns/CampaignCard";
import CreateCampaignDialog from "@/components/campaigns/CreateCampaignDialog";
import { Button } from "@/components/ui/button";
import { Plus, Target, Loader2 } from "lucide-react";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Closed", value: "closed" },
];

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Target className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-white font-semibold text-lg">No campaigns yet</p>
      <p className="text-slate-400 text-sm mt-1 max-w-sm">
        Create your first hiring campaign to start tracking candidates.
      </p>
      <Button
        onClick={onCreateClick}
        className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
        <Plus className="w-4 h-4" />
        Create First Campaign
      </Button>
    </div>
  );
}

export default function CampaignsClient() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data, isLoading, isFetching, error } = useQuery(
    campaignsQueryOptions({ status: statusFilter }),
  );

  const campaigns = data?.data || [];
  const totalResults = data?.total || 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Campaigns</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isFetching && !isLoading
              ? "Updating..."
              : `${totalResults} campaign${totalResults !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              statusFilter === filter.value
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
          Failed to load campaigns: {error.message}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && campaigns.length === 0 && !error && (
        <EmptyState onCreateClick={() => setShowCreateDialog(true)} />
      )}

      {/* Campaign cards grid */}
      {!isLoading && campaigns.length > 0 && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${isFetching ? "opacity-70" : "opacity-100"}`}>
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateCampaignDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}
