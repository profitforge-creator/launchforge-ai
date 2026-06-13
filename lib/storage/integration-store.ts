// Integration Store — follows the same pattern as generation-store.ts
//
// Current implementation: in-memory Map (module-level singleton).
//   - Survives across requests within a single server process
//   - Cleared on server restart / cold start in serverless
//
// AI INTEGRATION POINT (Database):
//   Replace Map operations with your database client of choice.
//   Function signatures stay identical — only the body changes.

export type IntegrationKey = "vercel" | "github" | "webflow" | "stripe" | "supabase";

export interface StoredIntegration {
  service: IntegrationKey;
  token: string;              // stored server-side only, never returned to client
  connectedAt: string;
  metadata: Record<string, unknown>;
}

// Sanitized view sent to the client — no tokens
export interface IntegrationStatus {
  connected: boolean;
  // "user" = token pasted by the user via the Connect form
  // "env"  = token present in the server's environment variables (read-only from UI)
  source?: "user" | "env";
  connectedAt?: string;
  metadata?: {
    name?: string;
    username?: string;
    email?: string;
    teamName?: string;
    projectCount?: number;
    deploymentCount?: number;
    repoCount?: number;
    siteCount?: number;
    planName?: string;
    country?: string;
    mode?: "live" | "test";
    app_id?: string;
    projectRef?: string;
  };
}

export interface ConnectResult {
  success: boolean;
  error?: string;
  status?: IntegrationStatus;
}

// Module-level singleton store — tokens never leave the server
const store = new Map<IntegrationKey, StoredIntegration>();

export function saveIntegration(integration: StoredIntegration): void {
  store.set(integration.service, integration);
}

export function removeIntegration(service: IntegrationKey): void {
  store.delete(service);
}

export function getIntegration(service: IntegrationKey): StoredIntegration | null {
  return store.get(service) ?? null;
}

export function getAllIntegrationStatuses(): Record<IntegrationKey, IntegrationStatus> {
  const ALL_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];
  const result = {} as Record<IntegrationKey, IntegrationStatus>;
  for (const key of ALL_KEYS) {
    const stored = store.get(key);
    if (stored) {
      result[key] = {
        connected: true,
        connectedAt: stored.connectedAt,
        metadata: stored.metadata as IntegrationStatus["metadata"],
      };
    } else {
      result[key] = { connected: false };
    }
  }
  return result;
}
