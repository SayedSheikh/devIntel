// app/(dashboard)/developers/page.js
import { Suspense } from "react";
import { connection } from "next/server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { developersQueryOptions } from "@/lib/queries/developers";
import DeveloperListClient from "@/components/developers/DeveloperListClient";

export const metadata = { title: "Developers — DevIntel" };

export default async function DevelopersPage() {
  await connection();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    developersQueryOptions({ page: 0, limit: 20 }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="p-6 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-slate-800 rounded w-48" />
              <div className="h-10 bg-slate-800 rounded w-36" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-slate-800 rounded flex-1" />
              <div className="h-10 bg-slate-800 rounded w-32" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-b border-slate-800">
                  <div className="w-10 h-10 bg-slate-800 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-40" />
                    <div className="h-3 bg-slate-800 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }>
        <DeveloperListClient />
      </Suspense>
    </HydrationBoundary>
  );
}
