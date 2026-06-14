import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, getSupabaseClientForUser, hasSupabaseConfig } from "@/lib/supabase/server";

const ACCESS_COOKIE = "lf_sb_access_token";
const REFRESH_COOKIE = "lf_sb_refresh_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export interface AuthUser {
  id: string;
  email: string | null;
  isLocalFallback: boolean;
}

function localDevUser(): AuthUser {
  return {
    id: "local-dev-user",
    email: "local@launchforge.dev",
    isLocalFallback: true,
  };
}

export async function getAccessToken(): Promise<string | null> {
  if (!hasSupabaseConfig()) return null;
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function setAuthCookies(session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.expires_in ?? COOKIE_MAX_AGE,
  });
  jar.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!hasSupabaseConfig()) return localDevUser();

  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const { data, error } = await getSupabaseClient().auth.getUser(accessToken);
  if (error || !data.user) return null;

  return toAuthUser(data.user);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getUserSupabaseClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  return getSupabaseClientForUser(accessToken);
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    isLocalFallback: false,
  };
}
