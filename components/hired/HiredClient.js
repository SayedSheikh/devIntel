// components/hired/HiredClient.js
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserCheck, MapPin, Star, Target, ExternalLink } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// HiredRow — top-level component
function HiredRow({ row }) {
  const dev = row.developer;
  const campaign = row.campaign;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-green-800">
          <AvatarImage src={dev?.avatar_url} alt={dev?.full_name} />
          <AvatarFallback className="bg-green-900 text-green-300 text-sm font-bold">
            {getInitials(dev?.full_name)}
          </AvatarFallback>
        </Avatar>

        {/* Developer info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/developers/${dev?.id}`}
              className="text-white font-semibold text-sm hover:text-indigo-300 transition-colors">
              {dev?.full_name}
            </Link>
            <Badge className="bg-green-900/40 text-green-400 border border-green-800 text-xs px-2 py-0">
              Hired
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            {dev?.location && (
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <MapPin className="w-3 h-3" />
                {dev.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <Star className="w-3 h-3 text-amber-500" />
              {dev?.activity_score ?? 0}
            </span>
          </div>

          {/* Top skills */}
          {dev?.skills && dev.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {dev.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
                  {skill}
                </span>
              ))}
              {dev.skills.length > 4 && (
                <span className="text-xs text-slate-600">
                  +{dev.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Campaign info */}
        <div className="flex-shrink-0 text-right hidden sm:block">
          <Link
            href={`/campaigns/${campaign?.id}`}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs transition-colors justify-end">
            <Target className="w-3 h-3" />
            <span className="max-w-32 truncate">{campaign?.name}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <p className="text-slate-600 text-xs mt-1">
            Hired {formatDate(row.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

// EmptyState — top-level component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <UserCheck className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-white font-semibold text-lg">
        No hired developers yet
      </p>
      <p className="text-slate-400 text-sm mt-1 max-w-sm">
        Developers you mark as hired in your campaigns will appear here.
      </p>
      <Link
        href="/campaigns"
        className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
        View Campaigns
      </Link>
    </div>
  );
}

export default function HiredClient({ hired }) {
  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Hired Developers</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {hired.length > 0
            ? `${hired.length} developer${hired.length !== 1 ? "s" : ""} successfully hired`
            : "Track your successful hires here"}
        </p>
      </div>

      {hired.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {hired.map((row) => (
            <HiredRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
