// components/auth/LoginForm.js
// The complete login/signup form with three sections:
// 1. Sign In tab (email+password)
// 2. Sign Up tab (email+password registration)
// 3. OAuth buttons (GitHub, Google) — shown in both tabs

"use client";
// This MUST be a client component because it uses:
// - useState (React state)
// - useTransition (async state tracking)
// - useRouter (navigation)
// - Event handlers (onClick, onSubmit)

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp } from "@/lib/actions/auth";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Icons from lucide-react
import {
  Eye,
  EyeOff,
  Loader2,
  Github,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const OAuthButtons = ({ oauthLoading, isPending, handleOAuth }) => (
  <div className="space-y-3">
    {/* Visual divider with "or" text */}
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <Separator className="bg-slate-700" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-slate-800 px-2 text-slate-500">
          Or continue with
        </span>
      </div>
    </div>

    {/* GitHub Button */}
    <Button
      type="button"
      // type="button" prevents this button from accidentally submitting the parent form
      onClick={() => handleOAuth("github")}
      disabled={isPending || oauthLoading !== null}
      className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 h-11"
      variant="outline">
      {oauthLoading === "github" ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        // animate-spin is a Tailwind class that rotates the icon continuously
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )}
      GitHub
    </Button>

    {/* Google Button */}
    <Button
      type="button"
      onClick={() => handleOAuth("google")}
      disabled={isPending || oauthLoading !== null}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 h-11">
      {oauthLoading === "google" ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-gray-600" />
      ) : (
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Google
    </Button>
  </div>
);

export default function LoginForm({ redirectTo }) {
  const router = useRouter();

  // ── State for Sign In form ──
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPass, setShowSignInPass] = useState(false);
  // showSignInPass controls whether the password is shown as text or dots

  // ── State for Sign Up form ──
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  // ── Shared state ──
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // useTransition: tracks when an async operation is pending
  // isPending = true while the Server Action is running
  // startTransition = wrap your async calls in this function
  const [isPending, startTransition] = useTransition();

  // Track OAuth loading separately so we know WHICH button is spinning
  const [oauthLoading, setOauthLoading] = useState(null);

  const supabase = createClient();

  // ═════════════════════════════════
  // Handle Sign In form submission
  // ═════════════════════════════════
  const handleSignIn = (e) => {
    e.preventDefault();
    // Prevent default browser form submission (page reload)

    setError(null);
    setSuccess(null);

    // Build a FormData object manually
    // This matches what the Server Action expects (formData.get('email'), etc.)
    const formData = new FormData();
    formData.append("email", signInEmail);
    formData.append("password", signInPassword);

    // startTransition marks this as a "transition" — React knows it's non-urgent
    // isPending becomes true until this callback resolves
    startTransition(async () => {
      const result = await signIn(formData);
      // signIn redirects to /dashboard on success — if we reach here, it failed

      if (result?.error) {
        setError(result.error);
        // If there's an error, result is returned with the error message
        // If successful, signIn() calls redirect() on the server which navigates automatically
      }
    });
  };

  // ═════════════════════════════════
  // Handle Sign Up form submission
  // ═════════════════════════════════
  const handleSignUp = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side check: passwords match (quick check before hitting server)
    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", signUpName);
    formData.append("email", signUpEmail);
    formData.append("password", signUpPassword);
    formData.append("confirmPassword", signUpConfirm);

    startTransition(async () => {
      const result = await signUp(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Don't redirect — show success message and navigate to check-email
        router.push("/check-email?type=signup");
        // router.push navigates without a full page reload
      }
    });
  };

  // ═════════════════════════════════
  // Handle OAuth (GitHub/Google)
  // ═════════════════════════════════
  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
    // On success, browser is redirected automatically by Supabase — no code needed here
  };

  // ═════════════════════════════════
  // Password strength indicator
  // ═════════════════════════════════
  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 8)
      return { level: "weak", color: "bg-red-500", label: "Too short" };
    if (password.length < 10)
      return { level: "fair", color: "bg-yellow-500", label: "Fair" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { level: "good", color: "bg-blue-500", label: "Good" };
    }
    return { level: "strong", color: "bg-green-500", label: "Strong" };
  };

  const passwordStrength = getPasswordStrength(signUpPassword);

  // ═════════════════════════════════
  // Main render
  // ═════════════════════════════════
  return (
    <Card className="bg-slate-800 border-slate-700 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-white text-2xl">Welcome</CardTitle>
        <CardDescription className="text-slate-400">
          Access your recruitment intelligence dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Global Error Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {/* flex-shrink-0 prevents the icon from shrinking when text is long */}
            <span>{error}</span>
          </div>
        )}

        {/* Tabs: Sign In and Sign Up */}
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 mb-6">
            {/* grid-cols-2: two equal-width columns */}
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
              {/* data-[state=active]: Tailwind variant that styles the active tab */}
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* ─── SIGN IN TAB ─────────────────────────── */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* space-y-4: adds 16px vertical space between each child element */}

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="signin-email"
                  className="text-slate-300 text-sm">
                  Email address
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  // type="email" gives browser-level email validation (checks for @ symbol)
                  placeholder="you@company.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  // onChange updates state on every keystroke — this is React "controlled input"
                  required
                  // required = browser prevents form submission if this is empty
                  disabled={isPending}
                  className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11"
                />
              </div>

              {/* Password Field with show/hide toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="signin-password"
                    className="text-slate-300 text-sm">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Relative container so we can position the eye icon inside the input */}
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showSignInPass ? "text" : "password"}
                    // Conditional type: 'text' shows the password, 'password' shows dots
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    disabled={isPending}
                    className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11 pr-10"
                    // pr-10: right padding so text doesn't overlap the eye button
                  />
                  <button
                    type="button"
                    // type="button" is CRITICAL here — prevents accidental form submission
                    onClick={() => setShowSignInPass(!showSignInPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    // absolute positioning inside the relative container
                    // top-1/2 + -translate-y-1/2 = vertically centered
                  >
                    {showSignInPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 font-medium">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Sign In with Email
                  </span>
                )}
              </Button>
            </form>

            {/* OAuth buttons below the form */}
            <div className="mt-4">
              <OAuthButtons
                isPending={isPending}
                oauthLoading={oauthLoading}
                handleOAuth={handleOAuth}
              />
            </div>
          </TabsContent>

          {/* ─── SIGN UP TAB ─────────────────────────── */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-300 text-sm">
                  Full name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  disabled={isPending}
                  className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="signup-email"
                  className="text-slate-300 text-sm">
                  Email address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@company.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  disabled={isPending}
                  className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11"
                />
              </div>

              {/* Password with strength indicator */}
              <div className="space-y-2">
                <Label
                  htmlFor="signup-password"
                  className="text-slate-300 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignUpPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    disabled={isPending}
                    className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPass(!showSignUpPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showSignUpPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password strength bar — only shows when user is typing */}
                {signUpPassword && passwordStrength && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${
                          passwordStrength.level === "weak"
                            ? "w-1/4"
                            : passwordStrength.level === "fair"
                              ? "w-2/4"
                              : passwordStrength.level === "good"
                                ? "w-3/4"
                                : "w-full"
                        }`}
                        // Dynamic width based on password strength level
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Password strength:{" "}
                      <span className="font-medium">
                        {passwordStrength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="signup-confirm"
                  className="text-slate-300 text-sm">
                  Confirm password
                </Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={signUpConfirm}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                  required
                  disabled={isPending}
                  className={`bg-slate-900 border-slate-600 text-white placeholder-slate-500 h-11 ${
                    signUpConfirm && signUpPassword !== signUpConfirm
                      ? "border-red-500 focus:border-red-500"
                      : // Red border if passwords don't match yet
                        "focus:border-indigo-500"
                  }`}
                />
                {/* Real-time mismatch warning */}
                {signUpConfirm && signUpPassword !== signUpConfirm && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
                {/* Real-time match confirmation */}
                {signUpConfirm &&
                  signUpPassword === signUpConfirm &&
                  signUpPassword.length >= 8 && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                disabled={
                  isPending ||
                  (signUpConfirm && signUpPassword !== signUpConfirm)
                }
                // Also disabled if passwords don't match
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 font-medium">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-4">
              <OAuthButtons
                isPending={isPending}
                oauthLoading={oauthLoading}
                handleOAuth={handleOAuth}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
