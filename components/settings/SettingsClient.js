// components/settings/SettingsClient.js
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Palette } from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, defaultOn }) {
  const [on, setOn] = useState(defaultOn || false);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-slate-300 text-sm font-medium">{label}</p>
        {description && (
          <p className="text-slate-500 text-xs mt-0.5">{description}</p>
        )}
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={`
          relative inline-flex flex-shrink-0
          w-11 h-6 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          ${on ? "bg-indigo-600" : "bg-slate-700"}
        `}>
        {/* Thumb */}
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block
            w-5 h-5 rounded-full bg-white shadow-lg
            transform transition-transform duration-200 ease-in-out
            ${on ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

export default function SettingsClient({ profile }) {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile section */}
      <SettingsSection
        icon={User}
        title="Profile"
        description="Your public profile information">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-slate-700">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-indigo-700 text-white text-xl font-bold">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold">
              {profile?.full_name || "Recruiter"}
            </p>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <Badge
              variant="outline"
              className="mt-1 border-slate-600 text-slate-400 capitalize text-xs">
              {profile?.role || "recruiter"}
            </Badge>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications section */}
      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Control what you get notified about">
        <div className="space-y-1 divide-y divide-slate-800">
          <ToggleRow
            label="Developer activity alerts"
            description="When tracked developers update their profiles"
            defaultOn={true}
          />
          <ToggleRow
            label="Campaign updates"
            description="Status changes in your hiring campaigns"
            defaultOn={true}
          />
          <ToggleRow
            label="Weekly digest"
            description="Summary of your recruitment activity"
            defaultOn={false}
          />
          <ToggleRow
            label="New developer suggestions"
            description="AI-matched candidates for your campaigns"
            defaultOn={false}
          />
        </div>
      </SettingsSection>

      {/* Security section */}
      <SettingsSection
        icon={Shield}
        title="Security"
        description="Authentication and access control">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-slate-300 text-sm font-medium">
                Two-factor authentication
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Add an extra layer of security
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-slate-600 text-slate-500 text-xs">
              Coming soon
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-slate-800">
            <div>
              <p className="text-slate-300 text-sm font-medium">
                Active sessions
              </p>
              <p className="text-slate-500 text-xs mt-0.5">1 active session</p>
            </div>
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>
      </SettingsSection>

      {/* Appearance section */}
      <SettingsSection
        icon={Palette}
        title="Appearance"
        description="Customize how DevIntel looks">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-slate-300 text-sm font-medium">Theme</p>
            <p className="text-slate-500 text-xs mt-0.5">
              Currently using dark mode
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-slate-600 text-slate-500 text-xs">
            Dark
          </Badge>
        </div>
      </SettingsSection>
    </div>
  );
}
