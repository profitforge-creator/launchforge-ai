import { createClient } from "@supabase/supabase-js";

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

export function getRequiredSupabaseEnv() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }
  return { url, key };
}

export function getSupabaseClient() {
  const { url, key } = getRequiredSupabaseEnv();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseClientForUser(accessToken: string) {
  const { url, key } = getRequiredSupabaseEnv();
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
