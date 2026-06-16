import { cookies } from "next/headers";
import {
  saveIntegration,
  type IntegrationPersistenceResult,
  type StoredIntegration,
} from "@/lib/storage/integration-store";

export async function persistIntegration(integration: StoredIntegration): Promise<IntegrationPersistenceResult> {
  return saveIntegration(integration);
}

/** Set a short-lived CSRF state cookie before redirecting to an OAuth provider. */
export async function setOAuthState(provider: string, state: string): Promise<void> {
  const jar = await cookies();
  jar.set(`lf_oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

/** Read and immediately delete the CSRF state cookie. Returns null if missing. */
export async function consumeOAuthState(provider: string): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(`lf_oauth_state_${provider}`)?.value ?? null;
  jar.delete(`lf_oauth_state_${provider}`);
  return value;
}
