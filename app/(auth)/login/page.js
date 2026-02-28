// app/(auth)/login/page.js

import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default async function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">DevIntel</h1>
          <p className="text-slate-400 mt-2">Developer Intelligence Platform</p>
        </div>

        {/* Suspense wraps the async session check */}
        <Suspense
          fallback={
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto mb-4" />
              <div className="h-11 bg-slate-700 rounded mb-3" />
              <div className="h-11 bg-slate-700 rounded mb-3" />
              <div className="h-11 bg-slate-700 rounded" />
            </div>
          }>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
