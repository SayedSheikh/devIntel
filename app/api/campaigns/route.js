// app/api/campaigns/route.js
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const from = page * limit;
  const to = from + limit - 1;

  let query = supabase.from("campaigns").select(
    `id, name, description, status, target_role,
       target_count, deadline, created_at, owner_id`,
    { count: "exact" },
  );

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Campaign name is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name: body.name.trim(),
      description: body.description || null,
      target_role: body.target_role || null,
      target_count: parseInt(body.target_count) || 0,
      deadline: body.deadline || null,
      status: "active",
      owner_id: user.id,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Get recruiter name for notification ──
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const recruiterName = profile?.full_name || "A recruiter";

  // ── Notify all recruiters of new campaign ──
  await supabase.from("notifications").insert({
    type: "campaign_created",
    title: `New campaign: ${data.name}`,
    message: `${recruiterName} created a new campaign "${data.name}"${data.target_role ? ` for ${data.target_role}` : ""}`,
    payload: { campaign_id: data.id, campaign_name: data.name },
    created_by: user.id,
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.id) {
    return NextResponse.json(
      { error: "Campaign id is required" },
      { status: 400 },
    );
  }

  const VALID_STATUSES = ["active", "paused", "closed"];
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 },
    );
  }

  // ── Get campaign name + old status before updating ──
  const { data: existing } = await supabase
    .from("campaigns")
    .select("name, status, target_role")
    .eq("id", body.id)
    .single();

  const updates = {};
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  // ── Notify all recruiters of status change ──
  // Only notify if status actually changed
  if (body.status && existing?.status !== body.status) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const recruiterName = profile?.full_name || "A recruiter";
    const campaignName = existing?.name || "a campaign";

    const statusLabels = {
      active: "▶ Activated",
      paused: "⏸ Paused",
      closed: "✕ Closed",
    };

    await supabase.from("notifications").insert({
      type: "campaign_created",
      // reusing campaign_created type — same icon, same routing
      title: `${statusLabels[body.status] || body.status}: ${campaignName}`,
      message: `${recruiterName} changed "${campaignName}" status to ${body.status}`,
      payload: {
        campaign_id: body.id,
        campaign_name: campaignName,
        old_status: existing?.status,
        new_status: body.status,
      },
      created_by: user.id,
    });
  }

  return NextResponse.json({ data });
}
