// Shared helper: save an integration to the in-memory store AND the httpOnly cookie.
// Used by both server actions (app/actions/integrations.ts) and OAuth callback route handlers.
// No "use server" directive — plain server-side module safe to import anywhere.

import { cookies } from "next/headers";
import { saveIntegration, type StoredIntegration } from "@/lib/storage/integration-store";

const COOKIE_PREFIX = "lf_int_";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function persistIntegration(integration: StoredIntegration): Promise<void> {
  saveIntegration(integration);
  const jar = await cookies();
  jar.set(`${COOKIE_PREFIX}${integration.service}`, JSON.stringify({
    token:       integration.token,
    metadata:    integration.metadata,
    connectedAt: integration.connectedAt,
  }), {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "lax",
    path:      "/",
    maxAge:    COOKIE_MAX_AGE,
  });
}

/** Set a short-lived CSRF state cookie before redirecting to an OAuth provider. */
export async function setOAuthState(provider: string, state: string): Promise<void> {
  const jar = await cookies();
  jar.set(`lf_oauth_state_${provider}`, state, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "lax",
    path:      "/",
    maxAge:    600, // 10 minutes
  });
}

/** Read and immediately delete the CSRF state cookie. Returns null if missing. */
export async function consumeOAuthState(provider: string): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(`lf_oauth_state_${provider}`)?.value ?? null;
  jar.delete(`lf_oauth_state_${provider}`);
  return value;
}
