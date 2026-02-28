// components/auth/ResetPasswordForm.js

"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirmPassword", confirm);

    startTransition(async () => {
      const result = await resetPassword(formData);
      // If no error, resetPassword() calls redirect('/dashboard') on the server
      // If error, it returns { error: '...' }
      if (result?.error) {
        setError(result.error);
      }
    });
  };

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
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-slate-300 text-sm">
              New password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-slate-300 text-sm">
              Confirm new password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={isPending}
                className={`bg-slate-900 border-slate-600 text-white placeholder-slate-500 h-11 pr-10 ${
                  confirm && password !== confirm
                    ? "border-red-500"
                    : confirm && password === confirm
                      ? "border-green-500"
                      : "focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {confirm && password !== confirm && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
            {confirm && password === confirm && password.length >= 8 && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || (confirm.length > 0 && password !== confirm)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 font-medium mt-2">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating password...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
