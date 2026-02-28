// app/api/campaigns/[id]/developers/route.js
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: campaignId } = await params;

  const { data, error } = await supabase
    .from("campaign_developers")
    .select(
      `
      id, status, notes, contacted_at, interviewed_at, created_at,
      developer:developers (
        id, full_name, email, location, avatar_url,
        github_username, skills, activity_score, experience_years
      )
    `,
    )
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data || [] });
}

export async function POST(request, { params }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: campaignId } = await params;
  const body = await request.json();

  if (!body.developer_id) {
    return NextResponse.json(
      { error: "developer_id is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("campaign_developers")
    .insert({
      campaign_id: campaignId,
      developer_id: body.developer_id,
      status: "shortlisted",
      assigned_to: user.id,
    })
    .select(
      `
      id, status, notes, created_at,
      developer:developers (
        id, full_name, email, location, avatar_url,
        github_username, skills, activity_score
      )
    `,
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Developer already in this campaign" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Notify all recruiters that developer was added ──
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("name")
    .eq("id", campaignId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  await supabase.from("notifications").insert({
    type: "developer_added",
    title: `${data.developer?.full_name} added to pipeline`,
    message: `${profile?.full_name || "A recruiter"} added ${data.developer?.full_name} to "${campaign?.name || "a campaign"}"`,
    payload: {
      campaign_id: campaignId,
      developer_id: body.developer_id,
      campaign_name: campaign?.name,
      developer_name: data.developer?.full_name,
    },
    created_by: user.id,
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request, { params }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: campaignId } = await params;
  const body = await request.json();

  if (!body.id || !body.status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 },
    );
  }

  const VALID_STATUSES = [
    "shortlisted",
    "contacted",
    "interviewing",
    "offered",
    "hired",
    "rejected",
  ];
  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 },
    );
  }

  // ── Get old status + developer name before update ──
  const { data: existing } = await supabase
    .from("campaign_developers")
    .select(
      `
      status,
      developer:developers (id, full_name),
      campaign:campaigns (name)
    `,
    )
    .eq("id", body.id)
    .single();

  const updates = { status: body.status };
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.status === "contacted")
    updates.contacted_at = new Date().toISOString();
  if (body.status === "interviewing")
    updates.interviewed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("campaign_developers")
    .update(updates)
    .eq("id", body.id)
    .eq("campaign_id", campaignId)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Insert notification directly from API ──
  // This runs in ADDITION to the DB trigger
  // DB trigger may not fire in all Supabase plan tiers
  // Having it here guarantees the notification is always created
  if (existing?.status !== body.status) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const devName = existing?.developer?.full_name || "A developer";
    const campName = existing?.campaign?.name || "a campaign";
    const recruiterName = profile?.full_name || "A recruiter";

    await supabase.from("notifications").insert({
      type: "stage_change",
      title: `${devName} moved to ${body.status.charAt(0).toUpperCase() + body.status.slice(1)}`,
      message: `${recruiterName} moved ${devName} to ${body.status} in "${campName}"`,
      payload: {
        campaign_id: campaignId,
        developer_id: existing?.developer?.id,
        campaign_name: campName,
        developer_name: devName,
        old_status: existing?.status,
        new_status: body.status,
      },
      created_by: user.id,
    });
  }

  return NextResponse.json({ data });
}
