// components/layout/NotificationBell.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, CheckCheck, Target, UserCheck, Plus } from "lucide-react";

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function NotificationIcon({ type }) {
  const styles = {
    stage_change: {
      icon: UserCheck,
      bg: "bg-indigo-900/50",
      color: "text-indigo-400",
    },
    campaign_created: {
      icon: Target,
      bg: "bg-emerald-900/50",
      color: "text-emerald-400",
    },
    developer_added: {
      icon: Plus,
      bg: "bg-blue-900/50",
      color: "text-blue-400",
    },
  };
  const style = styles[type] || styles.stage_change;
  const Icon = style.icon;
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
      <Icon className={`w-4 h-4 ${style.color}`} />
    </div>
  );
}

function NotificationRow({ notification, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
        hover:bg-slate-800/50 border-b border-slate-800 last:border-0
        ${!notification.isRead ? "bg-indigo-950/20" : ""}
      `}>
      <NotificationIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${notification.isRead ? "text-slate-400" : "text-white font-medium"}`}>
          {notification.title}
        </p>
        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-slate-600 text-xs mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const { notifications, unreadCount, isLoading, markAllRead, markRead } =
    useNotifications();

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);

    // Mark all unread as read when opening the panel
    if (nextOpen && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) markRead(unreadIds);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        title="Notifications">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <p className="text-white font-semibold text-sm">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  Activity will appear here when campaigns or candidates are
                  updated
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onClick={() => {
                    markRead([notification.id]);
                    if (notification.payload?.campaign_id) {
                      window.location.href = `/campaigns/${notification.payload.campaign_id}`;
                    }
                    setOpen(false);
                  }}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-800 px-4 py-2.5">
              <p className="text-slate-600 text-xs text-center">
                Showing last {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
