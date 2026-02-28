// lib/actions/auth.js
// Server Actions for all authentication operations
// 'use server' at the top tells Next.js: "everything in this file runs on the server"
// Even though client components call these functions, the code NEVER runs in the browser

"use server";

import { createClient } from "@/lib/supabase/server";
// We use the SERVER Supabase client here, not the browser one
// Server Actions run on Node.js, so we need the server client

import { revalidatePath } from "next/cache";
// revalidatePath tells Next.js to clear the cache for a specific URL
// This ensures the user sees fresh data after login/logout

import { redirect } from "next/navigation";
// redirect() causes an HTTP redirect — sends the user to a new page
// This must be called OUTSIDE of try/catch blocks because it throws internally

// ═══════════════════════════════════════════════════════
// SIGN UP — Create a new account with email + password
// ═══════════════════════════════════════════════════════
export async function signUp(formData) {
  // formData is a native FormData object passed from the HTML form
  // .get('fieldName') extracts the value of an input with that name attribute

  const supabase = await createClient();

  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirm = formData.get("confirmPassword");

  // ── Validation: Check before hitting the database ──
  if (!fullName || fullName.trim().length < 2) {
    return { error: "Please enter your full name (at least 2 characters)." };
    // Returning an object with `error` lets the client component show an error message
    // We do NOT redirect — user stays on the form to fix the mistake
  }

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirm) {
    return { error: "Passwords do not match. Please try again." };
  }

  // ── Call Supabase Auth signUp ──
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // This metadata is passed to the handle_new_user() trigger we created in Supabase
        // It automatically fills the profiles table with the user's name
        full_name: fullName.trim(),
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        // We auto-generate an avatar using initials (e.g. "JD" for "John Doe")
        // This uses the free DiceBear API — no account needed
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
      // After the user clicks the confirmation link in their email,
      // they will be sent to /auth/callback which then redirects to /dashboard
    },
  });

  if (error) {
    // Common errors: "User already registered", "Password should be at least 6 characters"
    return { error: error.message };
  }

  // Check if email confirmation is required
  // data.user.identities is empty if email confirmation is OFF (user can log in immediately)
  // data.user.identities has items if email confirmation is required (user must click link first)
  if (data?.user?.identities?.length === 0) {
    // This means "email already registered" — Supabase doesn't throw error for this by default
    return {
      error: "This email is already registered. Try signing in instead.",
    };
  }

  // Success — return success so the client can redirect to check-email page
  return {
    success: true,
    message:
      "Account created! Please check your email to confirm your account.",
    requiresConfirmation: true,
  };
}

// ═══════════════════════════════════════════════════════
// SIGN IN — Log in with email + password
// ═══════════════════════════════════════════════════════
export async function signIn(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    // signInWithPassword checks the credentials against Supabase Auth
    // If correct, it creates a session and sets an httpOnly cookie automatically
  });

  if (error) {
    // Map Supabase error messages to user-friendly versions
    if (error.message === "Invalid login credentials") {
      return { error: "Incorrect email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        error: "Please confirm your email before signing in. Check your inbox.",
      };
    }
    return { error: error.message };
  }

  // revalidatePath clears cached page data so the newly-logged-in user sees fresh content
  revalidatePath("/", "layout");
  // 'layout' means revalidate the entire layout and all child routes

  // redirect() MUST be called outside try/catch — it throws a special "NEXT_REDIRECT" error
  // that Next.js intercepts. If caught, it won't work.
  redirect("/dashboard");
}

// ═══════════════════════════════════════════════════════
// SIGN OUT — Log out the current user
// ═══════════════════════════════════════════════════════
export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  // signOut() clears the session cookie and invalidates the token on Supabase servers

  revalidatePath("/", "layout");
  redirect("/login");
}

// ═══════════════════════════════════════════════════════
// FORGOT PASSWORD — Send a password reset email
// ═══════════════════════════════════════════════════════
export async function forgotPassword(formData) {
  const supabase = await createClient();

  const email = formData.get("email");

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    // Supabase emails the user a link
    // That link goes to /auth/callback, which exchanges the recovery token for a session
    // Then redirects to /reset-password where the user enters their new password
  });

  if (error) {
    return { error: error.message };
  }

  // IMPORTANT: We ALWAYS return success even if the email doesn't exist
  // This is a security best practice — prevents "email enumeration attacks"
  // (where attackers probe which emails are registered by checking error messages)
  return {
    success: true,
    message:
      "If this email is registered, you will receive a password reset link shortly.",
  };
}

// ═══════════════════════════════════════════════════════
// RESET PASSWORD — Update to a new password
// Called from the /reset-password page after clicking the email link
// At this point, the user has a valid "recovery" session from the email link
// ═══════════════════════════════════════════════════════
export async function resetPassword(formData) {
  const supabase = await createClient();

  const password = formData.get("password");
  const confirm = formData.get("confirmPassword");

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
    // updateUser() works because the user has an active session (from the reset email link)
    // It updates the password in Supabase Auth
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
  // After successful password reset, go straight to the dashboard
  // The user is already logged in (they have the recovery session)
}
