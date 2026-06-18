// Deterministic app origin for OAuth redirect URIs and in-app redirects.
//
// OAuth redirect URIs MUST exactly match the URI registered with each provider
// (Google/YouTube, GitHub, Stripe, Webflow, …). They are therefore always
// derived from a STABLE origin and never from an ephemeral Vercel preview or
// per-deployment URL, which would produce a redirect_uri mismatch.
//
// Resolution order:
//   1. NEXT_PUBLIC_APP_URL          — explicit override (set in every env)
//   2. CANONICAL_PRODUCTION_ORIGIN  — when running on Vercel without the override
//   3. the incoming request origin  — local development only
const CANONICAL_PRODUCTION_ORIGIN = "https://launchforge-sib3.vercel.app";

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getAppOrigin(requestUrl = "http://localhost:3000"): string {
  const publicAppUrl = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (publicAppUrl) return publicAppUrl;
  // Any Vercel deployment (production or preview) resolves to the canonical
  // production origin so OAuth callbacks always land on a registered URL.
  if (process.env.VERCEL) return CANONICAL_PRODUCTION_ORIGIN;
  return new URL(requestUrl).origin;
}

// requestUrl is accepted for call-site compatibility but the canonical origin
// is intentionally environment-derived, never request-derived.
export function getCanonicalAppOrigin(_requestUrl = "http://localhost:3000"): string {
  return normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? CANONICAL_PRODUCTION_ORIGIN;
}

export function getSupabaseAuthCallbackUrl(requestUrl?: string): string {
  return `${getAppOrigin(requestUrl)}/api/auth/supabase/callback`;
}

export function getOAuthRedirectUri(provider: string, requestUrl?: string): string {
  return `${getAppOrigin(requestUrl)}/api/auth/${provider}/callback`;
}

/**
 * Validate the OAuth origin configuration.
 *
 * Returns a human-readable error string when the app origin cannot be resolved
 * to a stable https URL on Vercel, or null when configuration is valid. OAuth
 * routes call this to fail with a clear, specific message instead of a generic
 * "connection did not complete" after the redirect URI silently mismatches.
 */
export function getOAuthOriginConfigError(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (raw) {
    const normalized = normalizeOrigin(raw);
    if (!normalized) {
      return `NEXT_PUBLIC_APP_URL is not a valid absolute URL (got "${raw}"). Set it to ${CANONICAL_PRODUCTION_ORIGIN}.`;
    }
    if (process.env.VERCEL && !normalized.startsWith("https://")) {
      return `NEXT_PUBLIC_APP_URL must use https in production (got "${normalized}"). Set it to ${CANONICAL_PRODUCTION_ORIGIN}.`;
    }
    return null;
  }

  // On Vercel the canonical default is used, but the explicit override is
  // strongly recommended so callbacks never depend on a hardcoded constant.
  if (process.env.VERCEL) {
    return `NEXT_PUBLIC_APP_URL is not set. Set it to ${CANONICAL_PRODUCTION_ORIGIN} so OAuth redirect URIs match the values registered with each provider.`;
  }

  return null;
}
