import { getRequiredSupabaseEnv, hasSupabaseConfig } from "@/lib/supabase/server";

export interface SchemaTableStatus {
  table: string;
  ready: boolean;
  status: number | null;
  detail: string | null;
}

export interface SchemaReadiness {
  configured: boolean;
  ready: boolean;
  tables: SchemaTableStatus[];
}

const REQUIRED_TABLES = [
  "generations",
  "lf_projects",
  "deployments",
  "leads",
  "weekly_lead_digests",
  "user_integrations",
  "integration_oauth_states",
  "integration_sync_events",
] as const;

export async function getSchemaReadiness(): Promise<SchemaReadiness> {
  if (!hasSupabaseConfig()) {
    return {
      configured: false,
      ready: false,
      tables: REQUIRED_TABLES.map((table) => ({
        table,
        ready: false,
        status: null,
        detail: "Supabase URL or anon key is missing.",
      })),
    };
  }

  const { url, key } = getRequiredSupabaseEnv();
  const tables = await Promise.all(
    REQUIRED_TABLES.map(async (table) => checkTable(url, key, table)),
  );

  return {
    configured: true,
    ready: tables.every((table) => table.ready),
    tables,
  };
}

async function checkTable(url: string, anonKey: string, table: string): Promise<SchemaTableStatus> {
  try {
    const response = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) return { table, ready: true, status: response.status, detail: null };

    const body = await response.text();
    return {
      table,
      ready: false,
      status: response.status,
      detail: summarizeBody(body) ?? response.statusText,
    };
  } catch (error) {
    return {
      table,
      ready: false,
      status: null,
      detail: error instanceof Error ? error.message : "Unknown schema readiness error.",
    };
  }
}

function summarizeBody(body: string): string | null {
  if (!body.trim()) return null;
  try {
    const parsed = JSON.parse(body) as { message?: string; hint?: string; code?: string };
    return [parsed.code, parsed.message, parsed.hint].filter(Boolean).join(": ");
  } catch {
    return body.slice(0, 180);
  }
}
