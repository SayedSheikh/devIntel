// app/(auth)/check-email/page.js
// Informational page shown after:
// 1. Sign up (type=signup) — "Confirm your account"
// 2. Forgot password (type=reset) — "Check for reset link"

import Link from "next/link";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check Your Email — DevIntel",
};

export default async function CheckEmailPage({ searchParams }) {
  const params = await searchParams;
  const type = params.type || "signup";

  const content = {
    signup: {
      title: "Confirm your email",
      description: "We've sent a confirmation link to your email address.",
      detail:
        "Click the link in the email to activate your account and access the dashboard.",
      note: "The confirmation link expires in 24 hours.",
    },
    reset: {
      title: "Check your email",
      description: "We've sent a password reset link to your email address.",
      detail:
        "Click the link in the email to set a new password for your account.",
      note: "The reset link expires in 1 hour.",
    },
  };

  const info = content[type] || content.signup;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-900/30 border-2 border-indigo-700/50 mb-6">
          <Mail className="w-12 h-12 text-indigo-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">{info.title}</h1>

        <p className="text-slate-300 text-lg mb-2">{info.description}</p>
        <p className="text-slate-400 text-sm mb-6">{info.detail}</p>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left mb-8">
          <p className="text-slate-400 text-sm font-medium mb-2">
            📌 Didn&apos;t receive it?
          </p>
          <ul className="text-slate-500 text-sm space-y-1">
            <li>
              • Check your <span className="text-slate-300">spam / junk</span>{" "}
              folder
            </li>
            <li>• Make sure you entered the correct email</li>
            <li>• Wait up to 5 minutes for delivery</li>
            <li>• {info.note}</li>
          </ul>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
          ← Return to Sign In
        </Link>
      </div>
    </div>
  );
}
