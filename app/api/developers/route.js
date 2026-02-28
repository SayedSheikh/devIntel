// app/api/developers/route.js
// REST API endpoint for developer data
// GET /api/developers?q=react&skills=Node.js&page=0&limit=20&showHired=true

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const skills = searchParams.getAll("skills");
  const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const source = searchParams.get("source") || "";
  const showHired = searchParams.get("showHired") === "true";
  // showHired=true → include hired developers in results
  // showHired=false (default) → hide hired developers from pool

  const from = page * limit;
  const to = from + limit - 1;

  // ── Get all developer IDs currently hired in ANY campaign ──
  // These are excluded from the pool by default to prevent
  // recruiters from re-evaluating already hired candidates
  const { data: hiredRows } = await supabase
    .from("campaign_developers")
    .select("developer_id")
    .eq("status", "hired");

  const hiredIds = [...new Set((hiredRows || []).map((r) => r.developer_id))];

  // Build the query step by step
  let query = supabase.from("developers").select(
    `id, full_name, email, location, bio, avatar_url,
     skills, activity_score, experience_years,
     last_active_at, profile_source, github_username,
     created_at`,
    { count: "exact" },
  );

  // ── Exclude hired developers from pool unless showHired=true ──
  if (!showHired && hiredIds.length > 0) {
    query = query.not("id", "in", `(${hiredIds.join(",")})`);
  }

  // Apply full-text search if query string provided
  if (q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  // Filter by skills if provided
  if (skills.length > 0) {
    query = query.overlaps("skills", skills);
  }

  // Filter by profile source
  if (source) {
    query = query.eq("profile_source", source);
  }

  const { data, error, count } = await query
    .order("activity_score", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Developers API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    hiredCount: hiredIds.length,
    // hiredCount: lets frontend show "X developers hidden (hired)"
  });
}

// POST /api/developers — Create a new developer profile
export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.full_name?.trim()) {
    return NextResponse.json(
      { error: "Full name is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("developers")
    .insert({
      full_name: body.full_name.trim(),
      email: body.email || null,
      location: body.location || null,
      bio: body.bio || null,
      github_username: body.github_username || null,
      skills: body.skills || [],
      activity_score: body.activity_score || 0,
      experience_years: body.experience_years || 0,
      profile_source: body.profile_source || "manual",
      avatar_url: body.avatar_url || null,
      added_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
