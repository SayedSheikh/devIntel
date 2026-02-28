// hooks/useNotifications.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Module-level singleton — survives hot reload in dev
// Only one WebSocket connection ever exists for notifications
let _supabaseInstance = null;

function getSupabase() {
  if (!_supabaseInstance) {
    _supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return _supabaseInstance;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);

  // ── Fetch from API ──
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const result = await res.json();
      setNotifications(result.data || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Realtime subscription ──
  useEffect(() => {
    const supabase = getSupabase();

    // Remove any existing channel before creating new one
    // Prevents duplicate subscriptions on React StrictMode double-mount
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log("🔌 Setting up notifications realtime...");

    const channel = supabase
      .channel(`notifications-${Date.now()}`)
      // Using timestamp suffix prevents "channel already exists" error
      // that occurs in React StrictMode and hot reload
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          // console.log("🔔 Realtime notification received:", payload.new);
          setNotifications((prev) =>
            [{ ...payload.new, isRead: false }, ...prev].slice(0, 20),
          );
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe((status, err) => {
        console.log("📡 Notification channel status:", status);
        if (status === "SUBSCRIBED") {
          setConnected(true);
          // console.log("✅ Notifications realtime LIVE");
        }
        if (status === "CHANNEL_ERROR") {
          setConnected(false);
          // console.error("❌ Notifications realtime error:", err);
        }
        if (status === "TIMED_OUT") {
          setConnected(false);
          // console.warn("⚠️ Notifications realtime timed out");
        }
        if (status === "CLOSED") {
          setConnected(false);
          // console.warn("🔴 Notifications realtime closed");
        }
      });

    channelRef.current = channel;

    return () => {
      console.log("🧹 Cleaning up notifications channel");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // ── Mark specific as read ──
  const markRead = useCallback(async (ids) => {
    if (!ids?.length) return;
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - ids.length));
  }, []);

  // ── Mark all as read ──
  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    connected,
    markAllRead,
    markRead,
    refetch: fetchNotifications,
  };
}
