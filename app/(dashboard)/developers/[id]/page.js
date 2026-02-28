// app/(dashboard)/developers/[id]/page.js
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import DeveloperProfileClient from "@/components/developers/DeveloperProfileClient";

async function getDeveloper(id) {
  await connection();
  const supabase = await createClient();

  const { data: developer, error } = await supabase
    .from("developers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !developer) return null;
  return developer;
}

async function getActivity(developerId) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("developer_activity")
    .select("*")
    .eq("developer_id", developerId)
    .order("occurred_at", { ascending: false })
    .limit(20);
  return data || [];
}

// ProfilePageContent is a top-level async component
// It fetches data and passes everything down as props
async function ProfilePageContent({ id }) {
  const [developer, activity] = await Promise.all([
    getDeveloper(id),
    getActivity(id),
  ]);

  if (!developer) notFound();

  return <DeveloperProfileClient developer={developer} activity={activity} />;
}

// ProfileSkeleton is a top-level component
function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-7 bg-slate-800 rounded w-48" />
          <div className="h-4 bg-slate-800 rounded w-32" />
          <div className="flex gap-2">
            <div className="h-6 bg-slate-800 rounded w-20" />
            <div className="h-6 bg-slate-800 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-800 rounded-xl" />
    </div>
  );
}

export default async function DeveloperProfilePage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePageContent id={id} />
    </Suspense>
  );
}
