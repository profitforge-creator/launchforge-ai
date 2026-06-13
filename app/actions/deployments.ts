"use server";

import { getSupabaseClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DeploymentRecord {
  id: string;
  project_id: string;
  platform: "vercel" | "github" | "webflow" | "manual" | string;
  status: "live" | "error" | "building" | string;
  url: string;
  domain: string | null;
  environment: "production" | "preview";
  created_at: string;
  updated_at: string;
}

export type NewDeployment = Omit<DeploymentRecord, "id" | "created_at" | "updated_at">;

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function actionGetDeployments(
  projectId?: string
): Promise<{ data: DeploymentRecord[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from("deployments")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;
    if (error) {
      console.error("[actionGetDeployments]", error.message);
      return { data: [], error: error.message };
    }
    return { data: (data as DeploymentRecord[]) ?? [], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[actionGetDeployments] unexpected:", msg);
    return { data: [], error: msg };
  }
}

export async function actionGetDeployment(
  projectId: string
): Promise<{ data: DeploymentRecord | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("deployments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[actionGetDeployment]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as DeploymentRecord | null, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[actionGetDeployment] unexpected:", msg);
    return { data: null, error: msg };
  }
}

export async function actionSaveDeployment(
  record: NewDeployment
): Promise<{ data: DeploymentRecord | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();

    // Upsert on project_id so each project has one canonical deploy record.
    // A full history would use insert() instead.
    const { data, error } = await supabase
      .from("deployments")
      .upsert(
        { ...record, updated_at: new Date().toISOString() },
        { onConflict: "project_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[actionSaveDeployment]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as DeploymentRecord, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[actionSaveDeployment] unexpected:", msg);
    return { data: null, error: msg };
  }
}

export async function actionDeleteDeployment(
  id: string
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("deployments").delete().eq("id", id);
    if (error) {
      console.error("[actionDeleteDeployment]", error.message);
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[actionDeleteDeployment] unexpected:", msg);
    return { error: msg };
  }
}

// ── Env-based integration checks ──────────────────────────────────────────────
//
// These verify the env-var tokens that are baked into the deployment
// (VERCEL_TOKEN, GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET).
// They are server-only and never return raw token values to the client.

export interface EnvIntegrationStatus {
  configured: boolean;
  valid: boolean | null; // null = not checked yet
  error: string | null;
  metadata: Record<string, string | number | null>;
}

export async function actionCheckVercelEnv(): Promise<EnvIntegrationStatus> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { configured: false, valid: null, error: "VERCEL_TOKEN not set in environment.", metadata: {} };
  }

  try {
    const res = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return { configured: true, valid: false, error: "VERCEL_TOKEN is set but invalid — check token permissions.", metadata: {} };
    }
    if (!res.ok) {
      return { configured: true, valid: false, error: `Vercel API returned ${res.status}.`, metadata: {} };
    }

    const body = await res.json();
    const user = body.user ?? {};
    return {
      configured: true,
      valid: true,
      error: null,
      metadata: {
        name:     user.name     ?? user.username ?? null,
        username: user.username ?? null,
        email:    user.email    ?? null,
      },
    };
  } catch (err) {
    return { configured: true, valid: false, error: "Network error reaching Vercel API.", metadata: {} };
  }
}

export async function actionCheckGitHubEnv(): Promise<EnvIntegrationStatus> {
  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      configured: false,
      valid: null,
      error: !clientId && !clientSecret
        ? "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET not set."
        : !clientId
        ? "GITHUB_CLIENT_ID not set."
        : "GITHUB_CLIENT_SECRET not set.",
      metadata: {},
    };
  }

  try {
    // Verify OAuth app credentials via GitHub's rate_limit endpoint.
    // Basic auth with CLIENT_ID:CLIENT_SECRET authenticates as the OAuth app.
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://api.github.com/rate_limit", {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept:         "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent":   "launchforge-ai",
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      return { configured: true, valid: false, error: "GitHub credentials are invalid — check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.", metadata: {} };
    }
    if (!res.ok) {
      return { configured: true, valid: false, error: `GitHub API returned ${res.status}.`, metadata: {} };
    }

    return {
      configured: true,
      valid: true,
      error: null,
      metadata: { app_id: clientId },
    };
  } catch (err) {
    return { configured: true, valid: false, error: "Network error reaching GitHub API.", metadata: {} };
  }
}
