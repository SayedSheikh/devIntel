// components/developers/AddDeveloperDialog.js
// Modal dialog for adding a new developer manually

"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { developerKeys } from "@/lib/queries/developers";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus } from "lucide-react";

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Docker",
  "Kubernetes",
  "AWS",
  "PostgreSQL",
];

export default function AddDeveloperDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    location: "",
    github_username: "",
    bio: "",
    experience_years: "",
    activity_score: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState(null);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills,
          experience_years: parseInt(form.experience_years) || 0,
          activity_score: parseInt(form.activity_score) || 0,
          profile_source: "manual",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to add developer.");
        return;
      }

      // Invalidate the developers list cache
      // This causes DeveloperListClient to refetch and show the new developer
      await queryClient.invalidateQueries({ queryKey: developerKeys.all() });

      // Reset form and close
      setForm({
        full_name: "",
        email: "",
        location: "",
        github_username: "",
        bio: "",
        experience_years: "",
        activity_score: "",
      });
      setSkills([]);
      setError(null);
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add Developer</DialogTitle>
          <DialogDescription className="text-slate-400">
            Manually add a developer to your talent pool.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Full Name *</Label>
            <Input
              value={form.full_name}
              onChange={updateField("full_name")}
              placeholder="Jane Smith"
              required
              disabled={isPending}
              suppressHydrationWarning
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Email + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Email</Label>
              <Input
                value={form.email}
                onChange={updateField("email")}
                type="email"
                placeholder="jane@example.com"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Location</Label>
              <Input
                value={form.location}
                onChange={updateField("location")}
                placeholder="San Francisco, CA"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* GitHub + Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">GitHub Username</Label>
              <Input
                value={form.github_username}
                onChange={updateField("github_username")}
                placeholder="janesmithdev"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">
                Experience (years)
              </Label>
              <Input
                value={form.experience_years}
                onChange={updateField("experience_years")}
                type="number"
                min="0"
                max="50"
                placeholder="5"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Activity Score */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">
              Activity Score (0–100)
            </Label>
            <Input
              value={form.activity_score}
              onChange={updateField("activity_score")}
              type="number"
              min="0"
              max="100"
              placeholder="75"
              disabled={isPending}
              suppressHydrationWarning
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Bio</Label>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Senior full-stack engineer specializing in React and distributed systems..."
              rows={3}
              disabled={isPending}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-md text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Skills</Label>
            {/* Added skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-indigo-900/50 text-indigo-300 border border-indigo-700 gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {/* Skill input */}
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type skill and press Enter"
                disabled={isPending}
                suppressHydrationWarning
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSkill(skillInput)}
                disabled={!skillInput.trim()}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {/* Skill suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s))
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="px-2 py-0.5 text-xs rounded border border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Developer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
