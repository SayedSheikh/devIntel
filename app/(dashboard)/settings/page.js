// app/(dashboard)/settings/page.js
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/settings/SettingsClient";

async function getProfile() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export default async function SettingsPage() {
  const profile = await getProfile();
  return <SettingsClient profile={profile} />;
}
