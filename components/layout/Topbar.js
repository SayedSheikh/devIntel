// components/layout/Topbar.js
"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import NotificationBell from "@/components/layout/NotificationBell";
// ↑ Only new import — replaces the static Bell icon

const PAGE_TITLES = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your recruitment activity",
  },
  "/developers": {
    title: "Developers",
    subtitle: "Discover and track developer talent",
  },
  "/campaigns": {
    title: "Campaigns",
    subtitle: "Manage your hiring campaigns",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Insights and performance metrics",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Platform preferences and configuration",
  },
  "/hired": {
    title: "Hired Developers",
    subtitle: "Your successfully hired candidates",
  },
};

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Topbar({ profile }) {
  const pathname = usePathname();

  const currentKey = "/" + (pathname.split("/")[1] || "dashboard");
  const pageInfo = PAGE_TITLES[currentKey] || {
    title: "DevIntel",
    subtitle: "",
  };

  return (
    <header className="flex-shrink-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10">
      {/* ── Left: Page Title ── */}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-white truncate">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-slate-500 truncate hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* ── Live Notification Bell ── */}
        {/* Replaces the old static bell button */}
        {/* Shows live unread count, dropdown with all notifications */}
        <NotificationBell />

        {/* User Avatar + Dropdown — unchanged */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <Avatar className="w-8 h-8 ring-2 ring-slate-700">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-none">
                  {profile?.full_name?.split(" ")[0] || "Recruiter"}
                </p>
                <p className="text-xs text-slate-500 capitalize mt-0.5">
                  {profile?.role || "recruiter"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-800 border-slate-700 text-white">
            <DropdownMenuLabel className="text-slate-400 text-xs font-normal">
              Signed in as
              <p className="font-semibold text-white text-sm mt-0.5 truncate">
                {profile?.email || profile?.full_name}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
              Profile Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700" />

            <form action={signOut}>
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer">
                  Sign Out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
