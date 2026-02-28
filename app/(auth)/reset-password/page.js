// app/(auth)/reset-password/page.js
// This page is reached ONLY after clicking the reset link in the email
// The email link first goes through /auth/callback, which:
//   1. Exchanges the recovery token for a session
//   2. Redirects to /reset-password
// At this point, the user has an active recovery session — they can update their password

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Set New Password — DevIntel",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Set New Password</h1>
          <p className="text-slate-400 mt-2">
            Enter a strong new password for your account.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
