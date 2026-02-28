// components/auth/ForgotPasswordForm.js

"use client";

import { useState, useTransition } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  // submitted: true after form is sent successfully — shows success message instead of form
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);

    startTransition(async () => {
      const result = await forgotPassword(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSubmitted(true);
        // Show success message — no redirect needed, user waits for email
      }
    });
  };

  // ── If submitted, show success state instead of form ──
  if (submitted) {
    return (
      <Card className="bg-slate-800 border-slate-700 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 border border-green-700/50 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Check your email
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            If <span className="text-slate-200 font-medium">{email}</span> is
            registered, you&apos;ll receive a reset link within a few minutes.
          </p>
          <p className="text-slate-500 text-xs mt-4">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="text-indigo-400 hover:text-indigo-300 underline">
              try again
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Normal form state ──
  return (
    <Card className="bg-slate-800 border-slate-700 shadow-2xl">
      <CardContent className="pt-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="text-slate-300 text-sm">
              Email address
            </Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
              className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !email}
            // disabled when loading OR when email field is empty
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 font-medium">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending reset link...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Reset Link
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
