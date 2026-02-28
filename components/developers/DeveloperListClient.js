// components/developers/DeveloperListClient.js
// The interactive developer discovery page
// Handles search, filters, and displays the developer table

"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { developersQueryOptions } from "@/lib/queries/developers";
import DeveloperTable from "./DeveloperTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Users, X, Loader2 } from "lucide-react";
import AddDeveloperDialog from "./AddDeveloperDialog";

// Common skill filters shown as quick-click badges
const COMMON_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "Docker",
  "Kubernetes",
  "AWS",
  "Go",
];

export default function DeveloperListClient() {
  // ── Filter State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  // Two separate states: searchQuery = what user is typing
  // activeSearch = what is actually sent to the API
  // This prevents a request on every keystroke

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  // Add this state at the top of DeveloperListClient
  const [showHired, setShowHired] = useState(false);

  // ── Fetch Data with TanStack Query ──
  const { data, isLoading, isFetching, error } = useQuery(
    developersQueryOptions({
      q: activeSearch,
      skills: selectedSkills,
      source: sourceFilter,
      page: currentPage,
      limit: 20,
    }),
  );
  // isLoading = true only on the FIRST load (no cached data)
  // isFetching = true whenever a request is in-flight (including refetches)
  // This distinction lets us show different UI states

  // ── Handlers ──

  // Execute search when user presses Enter or clicks search button
  const handleSearch = useCallback(() => {
    setActiveSearch(searchQuery);
    setCurrentPage(0);
    // Reset to first page when search changes
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setCurrentPage(0);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(
      (prev) =>
        prev.includes(skill)
          ? prev.filter((s) => s !== skill)
          : // Remove skill if already selected
            [...prev, skill],
      // Add skill if not selected
    );
    setCurrentPage(0);
  };

  const handleSourceChange = (value) => {
    setSourceFilter(value === "all" ? "" : value);
    setCurrentPage(0);
  };

  // ── Computed values ──
  const hasActiveFilters =
    activeSearch || selectedSkills.length > 0 || sourceFilter;
  const totalResults = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="p-6 space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Developer Pool</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isFetching && !isLoading
              ? "Updating..."
              : `${totalResults.toLocaleString()} developer${totalResults !== 1 ? "s" : ""} found`}
            {/* toLocaleString adds commas: 10000 → "10,000" */}
          </p>
        </div>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Developer
        </Button>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          {/* pointer-events-none: the icon doesn't intercept clicks on the input */}
          <Input
            placeholder="Search by name, location, skill, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9 bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 h-10"
            suppressHydrationWarning
          />
          {/* Clear button — only shown when there's text */}
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add this next to your existing filter buttons */}
        <button
          onClick={() => setShowHired(!showHired)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            showHired
              ? "bg-green-900/30 border-green-700 text-green-400"
              : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
          }`}>
          <span>{showHired ? "✓" : ""} Show Hired</span>
        </button>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          variant="outline"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-10 px-4">
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>

        {/* Source Filter Dropdown */}
        <Select onValueChange={handleSourceChange}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-700 text-white h-10">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="github">GitHub</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Skill Quick Filter Badges ── */}
      <div className="flex flex-wrap gap-2">
        {COMMON_SKILLS.map((skill) => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedSkills.includes(skill)
                ? "bg-indigo-600 text-white border border-indigo-500"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white"
            }`}>
            {selectedSkills.includes(skill) && <span className="mr-1">✓</span>}
            {skill}
          </button>
        ))}

        {/* Clear all filters button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveSearch("");
              setSelectedSkills([]);
              setSourceFilter("");
              setCurrentPage(0);
            }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50">
            <X className="w-3 h-3 inline mr-1" />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
          Failed to load developers: {error.message}
        </div>
      )}

      {/* ── Developer Table ── */}
      <DeveloperTable
        developers={data?.data || []}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-slate-500 text-sm">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0 || isFetching}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 disabled:opacity-40">
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages - 1 || isFetching}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 disabled:opacity-40">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Developer Dialog */}
      <AddDeveloperDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
