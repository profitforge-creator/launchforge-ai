import { cookies } from "next/headers";
import { createHash } from "crypto";
import { getUserSupabaseClient } from "@/lib/auth/session";
import {
  saveIntegration,
  type IntegrationPersistenceResult,
  type StoredIntegration,
} from "@/lib/storage/integration-store";

export async function persistIntegration(integration: StoredIntegration): Promise<IntegrationPersistenceResult> {
  return saveIntegration(integration);
}

/** Set a short-lived CSRF state cookie before redirecting to an OAuth provider. */
export async function setOAuthState(provider: string, state: string, ownerId?: string, scopes: string[] = []): Promise<void> {
  const jar = await cookies();
  jar.set(`lf_oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  if (!ownerId || ownerId === "local-dev-user") return;

  try {
    const supabase = await getUserSupabaseClient();
    if (!supabase) return;
    await supabase
      .from("integration_oauth_states")
      .insert({
        user_id: ownerId,
        provider,
        state_hash: hashState(state),
        scopes,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
  } catch {
    // Cookie state remains as a local/dev fallback; callbacks still validate it.
  }
}

/** Read and immediately delete the CSRF state cookie. Returns null if missing. */
export async function consumeOAuthState(provider: string, state?: string, ownerId?: string): Promise<string | null> {
  if (state && ownerId && ownerId !== "local-dev-user") {
    try {
      const supabase = await getUserSupabaseClient();
      if (supabase) {
        const now = new Date().toISOString();
        const { data } = await supabase
          .from("integration_oauth_states")
          .select("id,state_hash,expires_at,consumed_at")
          .eq("user_id", ownerId)
          .eq("provider", provider)
          .eq("state_hash", hashState(state))
          .is("consumed_at", null)
          .gt("expires_at", now)
          .maybeSingle();

        if (data?.id) {
          await supabase
            .from("integration_oauth_states")
            .update({ consumed_at: now })
            .eq("id", data.id)
            .eq("user_id", ownerId);
          return state;
        }
      }
    } catch {
      // Fall through to the cookie fallback.
    }
  }

  const jar = await cookies();
  const value = jar.get(`lf_oauth_state_${provider}`)?.value ?? null;
  jar.delete(`lf_oauth_state_${provider}`);
  return value;
}

function hashState(state: string): string {
  return createHash("sha256").update(state).digest("hex");
}
