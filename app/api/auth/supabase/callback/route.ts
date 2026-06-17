import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies } from "@/lib/auth/session";
import { getCanonicalAppOrigin } from "@/lib/auth/app-url";
import { getRequiredSupabaseEnv, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Session } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_PKCE_COOKIE = "lf_sb_pkce_verifier";

function redirectWithMessage(origin: string, path: string, key: "error" | "message", message: string) {
  const url = new URL(path, origin);
  url.searchParams.set(key, message);
  return NextResponse.redirect(url.toString());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getCanonicalAppOrigin(request.url);

  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) {
    return redirectWithMessage(origin, "/login", "error", providerError);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return redirectWithMessage(origin, "/login", "message", "Start sign-in again to continue.");
  }

  if (!hasSupabaseConfig()) {
    return redirectWithMessage(origin, "/login", "error", "Supabase is not configured.");
  }

  const jar = await cookies();
  const codeVerifier = jar.get(SUPABASE_PKCE_COOKIE)?.value;
  jar.delete(SUPABASE_PKCE_COOKIE);

  if (!codeVerifier) {
    return redirectWithMessage(origin, "/login", "message", "Sign-in session expired. Try again.");
  }

  const { url: supabaseUrl, key } = getRequiredSupabaseEnv();
  const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });

  const tokenData = await tokenResponse.json().catch(() => null);
  const session = tokenData as Session | null;

  if (!tokenResponse.ok || !session?.access_token || !session.refresh_token) {
    const message = getAuthErrorMessage(tokenData) ?? "Unable to complete sign-in.";
    return redirectWithMessage(origin, "/login", "error", message);
  }

  await setAuthCookies(session);
  return NextResponse.redirect(new URL("/dashboard", origin).toString());
}

function getAuthErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const description = record.error_description;
  if (typeof description === "string" && description.trim()) return description;
  const error = record.error;
  if (typeof error === "string" && error.trim()) return error;
  const message = record.message;
  if (typeof message === "string" && message.trim()) return message;
  return null;
}
