import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getUserSupabaseClient } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/server";

export type IntegrationKey =
  | "vercel"
  | "github"
  | "webflow"
  | "stripe"
  | "supabase"
  | "google"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "x"
  | "linkedin";

export const ALL_INTEGRATION_KEYS: IntegrationKey[] = [
  "vercel",
  "github",
  "webflow",
  "stripe",
  "supabase",
  "google",
  "youtube",
  "tiktok",
  "instagram",
  "facebook",
  "x",
  "linkedin",
];

export interface StoredIntegration {
  service: IntegrationKey;
  ownerId: string;
  token: string;
  refreshToken?: string | null;
  connectedAt: string;
  metadata: Record<string, unknown>;
  scopes?: string[];
  enabled?: boolean;
  expiresAt?: string | null;
}

export interface IntegrationStatus {
  connected: boolean;
  enabled?: boolean;
  source?: "user" | "env";
  connectedAt?: string;
  lastSyncAt?: string | null;
  scopes?: string[];
  storage?: "supabase" | "unavailable";
  storageWarning?: string;
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

export interface IntegrationPersistenceResult {
  persisted: boolean;
  reason?: string;
  requiresMigration?: boolean;
  requiresEncryptionSecret?: boolean;
}

interface IntegrationRow {
  id: string;
  user_id: string;
  provider: IntegrationKey;
  status: "connected" | "disabled" | "revoked" | "error";
  enabled: boolean;
  scopes: string[] | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  last_sync_at: string | null;
  metadata: Record<string, unknown> | null;
  connected_at: string;
}

interface SupabaseErrorShape {
  code?: string;
  message?: string;
}

const ENCODING = "base64url";
const STORAGE_NOT_READY =
  "Integration storage is not ready. Apply migration 004 and configure LAUNCHFORGE_INTEGRATION_SECRET before connecting accounts.";

function getEncryptionSecret(): string | null {
  return process.env.LAUNCHFORGE_INTEGRATION_SECRET ?? process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ?? null;
}

function getEncryptionKey(): Buffer | null {
  const secret = getEncryptionSecret();
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

function encryptToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const key = getEncryptionKey();
  if (!key) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString(ENCODING), tag.toString(ENCODING), ciphertext.toString(ENCODING)].join(".");
}

function decryptToken(value: string | null): string | null {
  if (!value) return null;
  const key = getEncryptionKey();
  if (!key) return null;

  const [ivRaw, tagRaw, ciphertextRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !ciphertextRaw) return null;

  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivRaw, ENCODING));
    decipher.setAuthTag(Buffer.from(tagRaw, ENCODING));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextRaw, ENCODING)),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

function isMissingIntegrationSchemaError(error: SupabaseErrorShape | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    (message.includes("schema cache") && message.includes("user_integrations")) ||
    (message.includes("relation") && message.includes("user_integrations") && message.includes("does not exist")) ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

async function getSupabaseOrNull() {
  if (!hasSupabaseConfig()) return null;
  return getUserSupabaseClient();
}

function disconnectedStatuses(reason?: string): Record<IntegrationKey, IntegrationStatus> {
  return Object.fromEntries(
    ALL_INTEGRATION_KEYS.map((key) => [
      key,
      { connected: false, storage: "unavailable", ...(reason ? { storageWarning: reason } : {}) },
    ]),
  ) as Record<IntegrationKey, IntegrationStatus>;
}

function toStatus(row: IntegrationRow): IntegrationStatus {
  return {
    connected: row.status === "connected" && row.enabled,
    enabled: row.enabled,
    source: "user",
    connectedAt: row.connected_at,
    lastSyncAt: row.last_sync_at,
    scopes: row.scopes ?? [],
    storage: "supabase",
    metadata: (row.metadata ?? {}) as IntegrationStatus["metadata"],
  };
}

function toStoredIntegration(row: IntegrationRow): StoredIntegration | null {
  const token = decryptToken(row.access_token_encrypted);
  if (!token) return null;
  return {
    service: row.provider,
    ownerId: row.user_id,
    token,
    refreshToken: decryptToken(row.refresh_token_encrypted),
    connectedAt: row.connected_at,
    metadata: row.metadata ?? {},
    scopes: row.scopes ?? [],
    enabled: row.enabled,
    expiresAt: row.expires_at,
  };
}

export async function saveIntegration(integration: StoredIntegration): Promise<IntegrationPersistenceResult> {
  const accessTokenEncrypted = encryptToken(integration.token);
  if (!accessTokenEncrypted) {
    return {
      persisted: false,
      reason: STORAGE_NOT_READY,
      requiresEncryptionSecret: true,
    };
  }

  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return {
      persisted: false,
      reason: STORAGE_NOT_READY,
      requiresMigration: true,
    };
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: integration.ownerId,
    provider: integration.service,
    provider_account_name: typeof integration.metadata.name === "string" ? integration.metadata.name : null,
    status: "connected",
    enabled: integration.enabled ?? true,
    scopes: integration.scopes ?? [],
    access_token_encrypted: accessTokenEncrypted,
    refresh_token_encrypted: encryptToken(integration.refreshToken),
    expires_at: integration.expiresAt ?? null,
    last_error: null,
    metadata: integration.metadata,
    connected_at: integration.connectedAt,
    updated_at: now,
    archived_at: null,
  };

  const { data: existing, error: readError } = await supabase
    .from("user_integrations")
    .select("id")
    .eq("user_id", integration.ownerId)
    .eq("provider", integration.service)
    .is("archived_at", null)
    .maybeSingle();

  if (isMissingIntegrationSchemaError(readError)) {
    return { persisted: false, reason: STORAGE_NOT_READY, requiresMigration: true };
  }
  if (readError) return { persisted: false, reason: readError.message };

  const write = existing?.id
    ? await supabase.from("user_integrations").update(payload).eq("id", existing.id).eq("user_id", integration.ownerId)
    : await supabase.from("user_integrations").insert(payload);

  if (isMissingIntegrationSchemaError(write.error)) {
    return { persisted: false, reason: STORAGE_NOT_READY, requiresMigration: true };
  }
  if (write.error) return { persisted: false, reason: write.error.message };

  return { persisted: true };
}

export async function removeIntegration(service: IntegrationKey, ownerId: string): Promise<IntegrationPersistenceResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return { persisted: false, reason: STORAGE_NOT_READY, requiresMigration: true };

  const { error } = await supabase
    .from("user_integrations")
    .update({
      status: "revoked",
      enabled: false,
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", ownerId)
    .eq("provider", service)
    .is("archived_at", null);

  if (isMissingIntegrationSchemaError(error)) return { persisted: false, reason: STORAGE_NOT_READY, requiresMigration: true };
  if (error) return { persisted: false, reason: error.message };
  return { persisted: true };
}

export async function setIntegrationEnabled(
  service: IntegrationKey,
  ownerId: string,
  enabled: boolean,
): Promise<IntegrationPersistenceResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return { persisted: false, reason: STORAGE_NOT_READY, requiresMigration: true };

  const { error } = await supabase
    .from("user_integrations")
    .update({
      enabled,
      status: enabled ? "connected" : "disabled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", ownerId)
    .eq("provider", service)
    .is("archived_at", null);

  if (isMissingIntegrationSchemaError(error)) return { persisted: false, reason: STORAGE_NOT_READY, requiresMigration: true };
  if (error) return { persisted: false, reason: error.message };
  return { persisted: true };
}

export async function getIntegration(service: IntegrationKey, ownerId: string): Promise<StoredIntegration | null> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", ownerId)
    .eq("provider", service)
    .eq("enabled", true)
    .eq("status", "connected")
    .is("archived_at", null)
    .maybeSingle();

  if (isMissingIntegrationSchemaError(error)) return null;
  if (error || !data) return null;
  return toStoredIntegration(data as IntegrationRow);
}

export async function getAllIntegrationStatuses(ownerId: string): Promise<Record<IntegrationKey, IntegrationStatus>> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return disconnectedStatuses(STORAGE_NOT_READY);

  const { data, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", ownerId)
    .is("archived_at", null);

  if (isMissingIntegrationSchemaError(error)) return disconnectedStatuses(STORAGE_NOT_READY);
  if (error) return disconnectedStatuses(error.message);

  const result = Object.fromEntries(ALL_INTEGRATION_KEYS.map((key) => [key, { connected: false, storage: "supabase" }])) as Record<
    IntegrationKey,
    IntegrationStatus
  >;
  for (const row of (data ?? []) as IntegrationRow[]) {
    result[row.provider] = toStatus(row);
  }
  return result;
}
