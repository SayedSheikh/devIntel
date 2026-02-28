// components/campaigns/CampaignCard.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, Calendar, Users, Clock, ArrowRight } from "lucide-react";
import CampaignStatusMenu from "@/components/campaigns/CampaignStatusMenu";

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CampaignCard({ campaign }) {
  // Local status state — updated optimistically when menu changes it
  const [status, setStatus] = useState(campaign.status);
  const isExpired =
    campaign.deadline && new Date(campaign.deadline) < new Date();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-4 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-800 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors">
              {campaign.name}
            </p>
            {campaign.target_role && (
              <p className="text-slate-400 text-xs mt-0.5 truncate">
                {campaign.target_role}
              </p>
            )}
          </div>
        </Link>

        {/* ── Clickable status badge — opens dropdown ── */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <CampaignStatusMenu
            campaignId={campaign.id}
            currentStatus={status}
            onStatusChange={setStatus}
          />
        </div>
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
          {campaign.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mt-auto pt-3 border-t border-slate-800">
        {campaign.target_count > 0 && (
          <span className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            {campaign.target_count} target
          </span>
        )}
        {campaign.deadline && (
          <span
            className={`flex items-center gap-1.5 text-xs ${isExpired ? "text-red-400" : "text-slate-400"}`}>
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            {isExpired ? "Expired " : "Due "}
            {formatDate(campaign.deadline)}
          </span>
        )}
        <Link
          href={`/campaigns/${campaign.id}`}
          className="flex items-center gap-1.5 text-indigo-400 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          View Pipeline <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
