// app/(dashboard)/campaigns/page.js
import { connection } from "next/server";
import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { campaignsQueryOptions } from "@/lib/queries/campaigns";
import CampaignsClient from "@/components/campaigns/CampaignsClient";

function CampaignsSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-800 rounded w-40" />
        <div className="h-10 bg-slate-800 rounded w-36" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function CampaignsPage() {
  await connection();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    campaignsQueryOptions({ page: 0, limit: 20 }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<CampaignsSkeleton />}>
        <CampaignsClient />
      </Suspense>
    </HydrationBoundary>
  );
}
