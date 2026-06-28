"use server";

import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/session";
import { getCanonicalAppOrigin, getSupabaseAuthCallbackUrl } from "@/lib/auth/app-url";
import { getRequiredSupabaseEnv, getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

// ── Validation schemas ────────────────────────────────────────────────────────

const EmailPasswordSchema = z.object({
  email:    z.string().email("Invalid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

const SignUpSchema = EmailPasswordSchema.extend({
  full_name: z.string().max(100).optional(),
});

const EmailSchema = z.object({
  email: z.string().email("Invalid email address.").max(254),
});

const SUPABASE_PKCE_COOKIE = "lf_sb_pkce_verifier";
const SUPABASE_PKCE_MAX_AGE = 60 * 10;

function supabaseMissingRedirect(path: "/login" | "/signup"): never {
  if (process.env.NODE_ENV !== "production") redirect("/dashboard");
  redirect(encoded(path, "error", "Supabase is not configured for this deployment."));
}

function encoded(path: string, key: "error" | "message", message: string): string {
  const params = new URLSearchParams({ [key]: message });
  return `${path}?${params.toString()}`;
}

async function getCurrentRequestOrigin(): Promise<string | undefined> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return undefined;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function actionSignIn(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) supabaseMissingRedirect("/login");

  const parsed = EmailPasswordSchema.safeParse({
    email:    String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    redirect(encoded("/login", "error", parsed.error.issues[0]?.message ?? "Invalid input."));
  }
  const { email, password } = parsed.data;

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

  const parsed = SignUpSchema.safeParse({
    email:     String(formData.get("email") ?? "").trim().toLowerCase(),
    password:  String(formData.get("password") ?? ""),
    full_name: String(formData.get("full_name") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    redirect(encoded("/signup", "error", parsed.error.issues[0]?.message ?? "Invalid input."));
  }
  const { email, password, full_name: fullName } = parsed.data;

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
  const parsed = EmailSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  if (!parsed.success) {
    redirect(encoded("/forgot-password", "error", parsed.error.issues[0]?.message ?? "Invalid email."));
  }
  const { email } = parsed.data;
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

  const origin = await getCurrentRequestOrigin();
  const { url } = getRequiredSupabaseEnv();
  const codeVerifier = randomBytes(48).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const jar = await cookies();
  jar.set(SUPABASE_PKCE_COOKIE, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SUPABASE_PKCE_MAX_AGE,
  });

  const authUrl = new URL(`${url}/auth/v1/authorize`);
  authUrl.searchParams.set("provider", "google");
  authUrl.searchParams.set("redirect_to", getSupabaseAuthCallbackUrl(origin));
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "s256");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  redirect(authUrl.toString());
}

export async function actionSignOut(): Promise<void> {
  await clearAuthCookies();
  redirect("/login");
}
