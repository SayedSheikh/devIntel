// components/campaigns/PipelineColumn.js
// A single column in the kanban pipeline board
// Receives: title, color, candidates array, onStatusChange callback

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ChevronRight, ChevronLeft } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// CandidateCard — top-level component, renders one developer card in pipeline
function CandidateCard({
  candidate,
  allStatuses,
  currentStatusIndex,
  onStatusChange,
}) {
  const dev = candidate.developer;
  const canAdvance = currentStatusIndex < allStatuses.length - 1;
  const canReverse = currentStatusIndex > 0;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2.5 hover:border-slate-600 transition-colors">
      {/* Developer info */}
      <div className="flex items-start gap-2.5">
        <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-slate-700">
          <AvatarImage src={dev?.avatar_url} alt={dev?.full_name} />
          <AvatarFallback className="bg-indigo-800 text-white text-xs font-bold">
            {getInitials(dev?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">
            {dev?.full_name}
          </p>
          {dev?.location && (
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{dev.location}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-slate-400">{dev?.activity_score}</span>
        </div>
      </div>

      {/* Top 3 skills */}
      {dev?.skills && dev.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dev.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
              {skill}
            </span>
          ))}
          {dev.skills.length > 3 && (
            <span className="text-xs text-slate-600">
              +{dev.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status advance/reverse buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
        <button
          onClick={() =>
            canReverse &&
            onStatusChange(candidate.id, allStatuses[currentStatusIndex - 1])
          }
          disabled={!canReverse}
          className="p-1 rounded hover:bg-slate-800 text-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Move back">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs text-slate-600">
          {new Date(candidate.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>

        <button
          onClick={() =>
            canAdvance &&
            onStatusChange(candidate.id, allStatuses[currentStatusIndex + 1])
          }
          disabled={!canAdvance}
          className="p-1 rounded hover:bg-slate-800 text-slate-600 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Advance stage">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// PipelineColumn — top-level, exported
export default function PipelineColumn({
  status,
  label,
  color,
  bgColor,
  borderColor,
  candidates,
  allStatuses,
  onStatusChange,
}) {
  return (
    <div
      className={`flex-shrink-0 w-64 bg-slate-900 border ${borderColor} rounded-xl flex flex-col`}>
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <p className="text-white text-sm font-semibold">{label}</p>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgColor} text-white`}>
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-32">
        {candidates.length === 0 ? (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-800 rounded-lg">
            <p className="text-slate-600 text-xs">No candidates</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              allStatuses={allStatuses}
              currentStatusIndex={allStatuses.indexOf(status)}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
