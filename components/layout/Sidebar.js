// components/layout/Sidebar.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/actions/auth";
import { UserCheck } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Developers", href: "/developers", icon: Users },
  { label: "Campaigns", href: "/campaigns", icon: Target },
  { label: "Hired", href: "/hired", icon: UserCheck }, // ← add this
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── SidebarContent receives ALL state and setters as props ──
// This way it stays outside Sidebar (no closure issues)
// AND has access to everything it needs
function SidebarContent({
  collapsed,
  setCollapsed,
  isActive,
  setMobileOpen,
  profile,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-slate-800 px-4 flex-shrink-0",
          collapsed ? "justify-center" : "justify-between",
        )}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">DevIntel</p>
              <p className="text-slate-500 text-xs truncate">
                Recruitment Platform
              </p>
            </div>
          )}
        </Link>

        {/* Collapse button — only when expanded */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0 hidden lg:flex">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Expand button — only when collapsed ── */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors hidden lg:flex">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ── Nav Items ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              // setMobileOpen is now properly passed as a prop — no more crash
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
                collapsed && "justify-center px-2",
              )}>
              <Icon
                className={cn("flex-shrink-0 w-5 h-5", active && "scale-110")}
              />

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                </div>
              )}

              {collapsed && active && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile (bottom) ── */}
      <div className="flex-shrink-0 border-t border-slate-800 p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center",
          )}>
          <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-slate-700">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || "Recruiter"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <p className="text-xs text-slate-500 truncate capitalize">
                  {profile?.role || "recruiter"}
                </p>
              </div>
            </div>
          )}

          {!collapsed && (
            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ profile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // All state + setters passed explicitly as props to SidebarContent
  const sidebarProps = {
    collapsed,
    setCollapsed,
    isActive,
    setMobileOpen,
    profile,
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
        )}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile: Hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white">
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Mobile: Backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: Slide-in drawer ── */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
          <X className="w-4 h-4" />
        </button>
        <SidebarContent {...sidebarProps} />
      </aside>
    </>
  );
}
