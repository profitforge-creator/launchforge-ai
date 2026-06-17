// Deterministic app origin for OAuth redirect URIs.
// Production prefers NEXT_PUBLIC_APP_URL, then the canonical production URL.
// Preview prefers the actual Vercel preview URL so callback generation does
// not silently point at production.
const CANONICAL_PRODUCTION_ORIGIN = "https://launchforge-ai-six.vercel.app";

export function getAppOrigin(requestUrl = "http://localhost:3000"): string {
  const requestOrigin = new URL(requestUrl).origin;
  const publicAppUrl = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const vercelOrigin = process.env.VERCEL_URL ? normalizeOrigin(`https://${process.env.VERCEL_URL}`) : null;
  const vercelEnv = process.env.VERCEL_TARGET_ENV ?? process.env.VERCEL_ENV;

  if (vercelEnv === "preview" && vercelOrigin) {
    return vercelOrigin;
  }
  if (publicAppUrl) {
    return publicAppUrl;
  }
  if (vercelEnv === "production") {
    return CANONICAL_PRODUCTION_ORIGIN;
  }
  if (vercelOrigin) {
    return vercelOrigin;
  }
  return requestOrigin;
}

export function getCanonicalAppOrigin(requestUrl = "http://localhost:3000"): string {
  const publicAppUrl = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (publicAppUrl) return publicAppUrl;
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? normalizeOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : null;
  if (vercelProductionUrl) return vercelProductionUrl;
  if ((process.env.VERCEL_TARGET_ENV ?? process.env.VERCEL_ENV) === "production") {
    return CANONICAL_PRODUCTION_ORIGIN;
  }
  return getAppOrigin(requestUrl);
}

export function getSupabaseAuthCallbackUrl(requestUrl?: string): string {
  return `${getAppOrigin(requestUrl)}/api/auth/supabase/callback`;
}

export function getOAuthRedirectUri(provider: string, requestUrl?: string): string {
  return `${getAppOrigin(requestUrl)}/api/auth/${provider}/callback`;
}

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
