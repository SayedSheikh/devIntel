// components/campaigns/CampaignStatusMenu.js
// Dropdown menu to change campaign status
// Used in both CampaignCard and PipelineBoard header

"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { campaignKeys } from "@/lib/queries/campaigns";
import {
  Loader2,
  ChevronDown,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
    description: "Campaign is running",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "hover:bg-green-900/20",
    badge: "bg-green-900/40 text-green-400 border-green-800",
  },
  {
    value: "paused",
    label: "Paused",
    description: "Temporarily on hold",
    icon: PauseCircle,
    color: "text-yellow-400",
    bg: "hover:bg-yellow-900/20",
    badge: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Hiring complete or cancelled",
    icon: XCircle,
    color: "text-slate-400",
    bg: "hover:bg-slate-800",
    badge: "bg-slate-800 text-slate-400 border-slate-700",
  },
];

function getCurrentOption(status) {
  return STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
}

export default function CampaignStatusMenu({
  campaignId,
  currentStatus,
  onStatusChange,
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef(null);
  const current = getCurrentOption(currentStatus);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSelect(newStatus) {
    if (newStatus === currentStatus) {
      setOpen(false);
      return;
    }

    setOpen(false);
    setIsUpdating(true);

    const response = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: campaignId, status: newStatus }),
    });

    setIsUpdating(false);

    if (response.ok) {
      // Invalidate all campaign queries so list + pipeline header refresh
      await queryClient.invalidateQueries({ queryKey: campaignKeys.all() });
      if (onStatusChange) onStatusChange(newStatus);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button — shows current status badge */}
      <button
        onClick={() => setOpen(!open)}
        disabled={isUpdating}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium
          transition-all cursor-pointer select-none
          ${current.badge}
          ${isUpdating ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"}
        `}>
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <current.icon className="w-3 h-3" />
        )}
        <span className="capitalize">
          {isUpdating ? "Updating..." : current.label}
        </span>
        {!isUpdating && (
          <ChevronDown
            className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Change Status
            </p>
          </div>

          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isCurrent = option.value === currentStatus;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                  ${option.bg}
                  ${isCurrent ? "opacity-50 cursor-default" : "cursor-pointer"}
                `}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${option.color}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${option.color}`}>
                    {option.label}
                  </p>
                  <p className="text-slate-500 text-xs">{option.description}</p>
                </div>
                {isCurrent && (
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
