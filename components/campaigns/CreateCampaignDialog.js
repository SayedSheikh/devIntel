// components/campaigns/CreateCampaignDialog.js
"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { campaignKeys } from "@/lib/queries/campaigns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";

export default function CreateCampaignDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    description: "",
    target_role: "",
    target_count: "",
    deadline: "",
  });
  const [error, setError] = useState(null);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create campaign.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: campaignKeys.all() });
      setForm({
        name: "",
        description: "",
        target_role: "",
        target_count: "",
        deadline: "",
      });
      setError(null);
      onClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Campaign</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new hiring campaign to track candidates.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Campaign Name *</Label>
            <Input
              value={form.name}
              onChange={updateField("name")}
              placeholder="Senior React Engineers Q1 2026"
              disabled={isPending}
              suppressHydrationWarning
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Target Role</Label>
            <Input
              value={form.target_role}
              onChange={updateField("target_role")}
              placeholder="Senior Frontend Engineer"
              disabled={isPending}
              suppressHydrationWarning
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Target Headcount</Label>
              <Input
                value={form.target_count}
                onChange={updateField("target_count")}
                type="number"
                min="1"
                placeholder="5"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Deadline</Label>
              <Input
                value={form.deadline}
                onChange={updateField("deadline")}
                type="date"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Description</Label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Looking for engineers with React + TypeScript experience..."
              rows={3}
              disabled={isPending}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-md text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
