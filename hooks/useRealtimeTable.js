// hooks/useRealtimeTable.js
"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeTable({
  table,
  channelName,
  onInsert,
  onUpdate,
  onDelete,
}) {
  const supabase = createClient();

  // Store callbacks in refs so the effect never goes stale
  // This is the key fix — refs always point to latest callback
  // without needing them in the dependency array
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  // Keep refs in sync with latest props on every render
  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  });

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload) => {
          onInsertRef.current?.(payload.new);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        (payload) => {
          onUpdateRef.current?.(payload.new, payload.old);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table },
        (payload) => {
          onDeleteRef.current?.(payload.old);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Realtime subscribed: ${channelName}`);
        }
        if (status === "CHANNEL_ERROR") {
          console.error(`❌ Realtime error: ${channelName}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // Only re-subscribe if table or channelName changes
    // Callbacks are handled via refs above — no stale closure problem
  }, [table, channelName]);
}
