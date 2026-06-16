import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/session";
import { getAppOrigin } from "@/lib/auth/app-url";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

function redirectWithMessage(origin: string, path: string, key: "error" | "message", message: string) {
  const url = new URL(path, origin);
  url.searchParams.set(key, message);
  return NextResponse.redirect(url.toString());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request.url);

  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) {
    return redirectWithMessage(origin, "/login", "error", providerError);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return redirectWithMessage(origin, "/login", "error", "Supabase Auth callback missing code.");
  }

  if (!hasSupabaseConfig()) {
    return redirectWithMessage(origin, "/login", "error", "Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient().auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return redirectWithMessage(origin, "/login", "error", error?.message ?? "Unable to complete sign-in.");
  }

  await setAuthCookies(data.session);
  return NextResponse.redirect(new URL("/dashboard", origin).toString());
}
