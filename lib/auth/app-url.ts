// Deterministic app origin for OAuth redirect URIs.
// Priority: NEXT_PUBLIC_APP_URL -> VERCEL_URL -> request URL/local dev fallback.
export function getAppOrigin(requestUrl = "http://localhost:3000"): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return new URL(requestUrl).origin;
}

export function getSupabaseAuthCallbackUrl(requestUrl?: string): string {
  return `${getAppOrigin(requestUrl)}/api/auth/supabase/callback`;
}
