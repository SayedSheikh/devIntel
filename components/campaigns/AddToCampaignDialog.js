// components/campaigns/AddToCampaignDialog.js
// Dialog to search developers and add them to a campaign
// Shows only developers NOT already in this campaign

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Loader2, Check } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// DeveloperPickerRow — top-level component, one developer in the search results
function DeveloperPickerRow({ developer, isAdded, isLoading, onAdd }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={developer.avatar_url} />
        <AvatarFallback className="bg-indigo-800 text-white text-xs font-bold">
          {getInitials(developer.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-medium truncate">
          {developer.full_name}
        </p>
        <p className="text-slate-500 text-xs truncate">
          {developer.location || developer.github_username || "No location"}
        </p>
      </div>
      <button
        onClick={() => !isAdded && onAdd(developer)}
        disabled={isAdded || isLoading}
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isAdded
            ? "bg-green-900/40 text-green-400 cursor-default"
            : "bg-indigo-900/40 text-indigo-400 hover:bg-indigo-600 hover:text-white"
        } disabled:opacity-50`}>
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isAdded ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

export default function AddToCampaignDialog({
  open,
  onClose,
  campaignId,
  existingDeveloperIds,
  onAdded,
}) {
  const [search, setSearch] = useState("");
  const [developers, setDevelopers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set(existingDeveloperIds || []));

  // Search developers as user types
  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const params = new URLSearchParams({ limit: "10" });
      if (search.trim()) params.set("q", search.trim());

      const response = await fetch(`/api/developers?${params}`);
      const result = await response.json();
      setDevelopers(result.data || []);
      setIsSearching(false);
    }, 300);
    // 300ms debounce — waits until user stops typing before fetching

    return () => clearTimeout(timeout);
  }, [search, open]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setAddedIds(new Set(existingDeveloperIds || []));
    }
  }, [open, existingDeveloperIds]);

  async function handleAdd(developer) {
    setAddingId(developer.id);

    const response = await fetch(`/api/campaigns/${campaignId}/developers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developer_id: developer.id }),
    });

    const result = await response.json();
    setAddingId(null);

    if (response.ok) {
      setAddedIds((prev) => new Set(prev).add(developer.id));
      if (onAdded) onAdded(result.data);
    } else {
      console.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Add Developer to Campaign
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Search and add developers to this campaign pipeline.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <Input
            placeholder="Search by name, skill, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            suppressHydrationWarning
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="min-h-48 max-h-72 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : developers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
              No developers found
            </div>
          ) : (
            developers.map((dev) => (
              <DeveloperPickerRow
                key={dev.id}
                developer={dev}
                isAdded={addedIds.has(dev.id)}
                isLoading={addingId === dev.id}
                onAdd={handleAdd}
              />
            ))
          )}
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
