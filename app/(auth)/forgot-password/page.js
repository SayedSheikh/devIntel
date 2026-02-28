// app/(auth)/forgot-password/page.js
// Page where users enter their email to receive a reset link
// Server Component — no 'use client' needed here
// The interactive part is in ForgotPasswordForm

import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Forgot Password — DevIntel",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to login link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            {/* Key icon */}
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
          <p className="text-slate-400 mt-2">
            No worries. Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
