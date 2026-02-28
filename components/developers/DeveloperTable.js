// components/developers/DeveloperTable.js
// Renders the list of developers as a clean table

"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Github, Star, Clock } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Format the last active date into a human-readable string
function timeAgo(date) {
  if (!date) return "Unknown";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

// Activity score → visual indicator
function ActivityIndicator({ score }) {
  const level =
    score >= 80
      ? { label: "Very Active", color: "bg-green-500" }
      : score >= 50
        ? { label: "Active", color: "bg-blue-500" }
        : score >= 20
          ? { label: "Moderate", color: "bg-yellow-500" }
          : { label: "Low", color: "bg-slate-600" };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${level.color}`} />
      <span className="text-xs text-slate-400">{level.label}</span>
    </div>
  );
}

// Row skeleton for loading state
function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-800">
      <Skeleton className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-4 bg-slate-800 rounded w-36" />
        <Skeleton className="h-3 bg-slate-800 rounded w-24" />
      </div>
      <Skeleton className="h-5 bg-slate-800 rounded w-16 hidden sm:block" />
      <Skeleton className="h-5 bg-slate-800 rounded w-20 hidden md:block" />
      <Skeleton className="h-8 bg-slate-800 rounded w-16 hidden lg:block" />
    </div>
  );
}

export default function DeveloperTable({ developers, isLoading, isFetching }) {
  // Show skeleton rows on initial load
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
          <div className="grid grid-cols-4 gap-4">
            {["Developer", "Location", "Activity", "Skills"].map((h) => (
              <p
                key={h}
                className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {h}
              </p>
            ))}
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!developers || developers.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-white font-semibold text-lg">
            No developers found
          </p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Try adjusting your search or filters, or add your first developer to
            get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-opacity ${isFetching ? "opacity-70" : "opacity-100"}`}>
      {/* opacity-70 while fetching = visual feedback that data is refreshing */}

      {/* Table Header */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50 hidden sm:block">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Developer
            </p>
          </div>
          <div className="w-32 hidden md:block">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Location
            </p>
          </div>
          <div className="w-28 hidden lg:block">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Activity
            </p>
          </div>
          <div className="w-48 hidden lg:block">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Skills
            </p>
          </div>
          <div className="w-20">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide text-right">
              Profile
            </p>
          </div>
        </div>
      </div>

      {/* Table Rows */}
      <div>
        {developers.map((dev) => (
          <div
            key={dev.id}
            className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors group">
            {/* Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0 ring-1 ring-slate-700">
              <AvatarImage src={dev.avatar_url} alt={dev.full_name} />
              <AvatarFallback className="bg-indigo-900 text-indigo-300 text-sm font-bold">
                {getInitials(dev.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Name + Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium text-sm truncate">
                  {dev.full_name}
                </p>
                {/* Source badge */}
                {dev.profile_source && dev.profile_source !== "manual" && (
                  <Badge
                    variant="outline"
                    className="text-xs py-0 h-4 border-slate-600 text-slate-400 hidden sm:inline-flex">
                    {dev.profile_source}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {dev.github_username && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Github className="w-3 h-3" />
                    {dev.github_username}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {timeAgo(dev.last_active_at || dev.created_at)}
                </span>
              </div>
            </div>

            {/* Location */}
            {dev.location && (
              <div className="w-32 hidden md:flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <p className="text-xs text-slate-400 truncate">
                  {dev.location}
                </p>
              </div>
            )}

            {/* Activity */}
            <div className="w-28 hidden lg:block">
              <ActivityIndicator score={dev.activity_score} />
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-slate-500">
                  {dev.activity_score}/100
                </span>
              </div>
            </div>

            {/* Skills (first 3 only) */}
            <div className="w-48 hidden lg:flex flex-wrap gap-1">
              {(dev.skills || []).slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs py-0 h-5 bg-slate-800 text-slate-300 border border-slate-700">
                  {skill}
                </Badge>
              ))}
              {(dev.skills || []).length > 3 && (
                <span className="text-xs text-slate-500">
                  +{dev.skills.length - 3}
                </span>
              )}
            </div>

            {/* View Profile Link */}
            <div className="w-20 flex justify-end flex-shrink-0">
              <Link
                href={`/developers/${dev.id}`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded bg-indigo-900/20 hover:bg-indigo-900/40">
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
