// app/api/notifications/route.js
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: reads } = await supabase
    .from("notification_reads")
    .select("notification_id")
    .eq("recruiter_id", user.id);

  const readIds = new Set((reads || []).map((r) => r.notification_id));
  const enriched = (notifications || []).map((n) => ({
    ...n,
    isRead: readIds.has(n.id),
  }));

  const unreadCount = enriched.filter((n) => !n.isRead).length;

  return NextResponse.json({ data: enriched, unreadCount });
}

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  let notificationIds = body.ids || [];

  if (body.all) {
    const { data } = await supabase
      .from("notifications")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(100);
    notificationIds = (data || []).map((n) => n.id);
  }

  if (notificationIds.length === 0) {
    return NextResponse.json({ success: true });
  }

  const inserts = notificationIds.map((id) => ({
    notification_id: id,
    recruiter_id: user.id,
  }));

  const { error } = await supabase
    .from("notification_reads")
    .upsert(inserts, { onConflict: "notification_id,recruiter_id" });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
