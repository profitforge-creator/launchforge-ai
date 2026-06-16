"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/session";
import { getCanonicalAppOrigin, getSupabaseAuthCallbackUrl } from "@/lib/auth/app-url";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

function supabaseMissingRedirect(path: "/login" | "/signup"): never {
  if (process.env.NODE_ENV !== "production") redirect("/dashboard");
  redirect(encoded(path, "error", "Supabase is not configured for this deployment."));
}

function encoded(path: string, key: "error" | "message", message: string): string {
  const params = new URLSearchParams({ [key]: message });
  return `${path}?${params.toString()}`;
}

export async function actionSignIn(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) supabaseMissingRedirect("/login");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(encoded("/login", "error", "Email and password are required."));

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    redirect(encoded("/login", "error", error?.message ?? "Unable to sign in."));
  }

  await setAuthCookies(data.session);
  redirect("/dashboard");
}

export async function actionSignUp(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) supabaseMissingRedirect("/signup");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!email || !password) redirect(encoded("/signup", "error", "Email and password are required."));

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) redirect(encoded("/signup", "error", error.message));

  if (data.session) {
    await setAuthCookies(data.session);
    redirect("/dashboard");
  }

  redirect(encoded("/login", "message", "Check your email to confirm your account, then sign in."));
}

export async function actionResetPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect(encoded("/forgot-password", "error", "Email is required."));
  if (!hasSupabaseConfig()) {
    redirect(encoded("/forgot-password", "message", "Password reset is disabled until Supabase is configured."));
  }

  const origin = getCanonicalAppOrigin();
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login`,
  });
  if (error) redirect(encoded("/forgot-password", "error", error.message));

  redirect(encoded("/forgot-password", "message", "Password reset email sent."));
}

export async function actionSignInWithGoogle(): Promise<void> {
  if (!hasSupabaseConfig()) supabaseMissingRedirect("/login");

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getSupabaseAuthCallbackUrl(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(encoded("/login", "error", error?.message ?? "Google sign-in is not available."));
  }

  redirect(data.url);
}

export async function actionSignOut(): Promise<void> {
  await clearAuthCookies();
  redirect("/login");
}
