import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const PKCE_COOKIE_PREFIX = "lf_sb_pkce_";
const PKCE_COOKIE_MAX_AGE = 60 * 10;

function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function hasSupabaseConfig(): boolean {
  const { url, key } = getSupabaseEnv();
  return !!url && !!key;
}

export function getSupabaseClient() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getSupabaseOAuthClient() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }

  const jar = await cookies();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      flowType: "pkce",
      storage: {
        isServer: true,
        getItem(storageKey: string) {
          return jar.get(pkceCookieName(storageKey))?.value ?? null;
        },
        setItem(storageKey: string, value: string) {
          jar.set(pkceCookieName(storageKey), value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: PKCE_COOKIE_MAX_AGE,
          });
        },
        removeItem(storageKey: string) {
          jar.delete(pkceCookieName(storageKey));
        },
      },
    },
  });
}

export function getSupabaseClientForUser(accessToken: string) {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }
  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function pkceCookieName(storageKey: string): string {
  return `${PKCE_COOKIE_PREFIX}${Buffer.from(storageKey).toString("base64url")}`;
}
