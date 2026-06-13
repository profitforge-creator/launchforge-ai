"use server";

import { cookies } from "next/headers";
import {
  saveIntegration,
  removeIntegration,
  getIntegration,
  type IntegrationKey,
  type ConnectResult,
  type IntegrationStatus,
  type StoredIntegration,
} from "@/lib/storage/integration-store";

export type { IntegrationKey, ConnectResult, IntegrationStatus };

// ── Cookie helpers ────────────────────────────────────────────────────────────
//
// Tokens are persisted in httpOnly cookies so they survive server restarts.
// httpOnly = not accessible from client JavaScript.
// The in-memory Map (integration-store.ts) acts as a per-process cache.

const COOKIE_PREFIX = "lf_int_";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function persistToCookie(integration: StoredIntegration): Promise<void> {
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

async function clearCookie(service: IntegrationKey): Promise<void> {
  const jar = await cookies();
  jar.delete(`${COOKIE_PREFIX}${service}`);
}

// Restores any cookie-persisted integrations into the in-memory store.
// Called at the start of status queries so data survives restarts.
async function restoreFromCookies(): Promise<void> {
  try {
    const jar = await cookies();
    const ALL_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];
    for (const key of ALL_KEYS) {
      if (getIntegration(key)) continue;
      const raw = jar.get(`${COOKIE_PREFIX}${key}`)?.value;
      if (!raw) continue;
      try {
        const { token, metadata, connectedAt } = JSON.parse(raw) as {
          token: string;
          metadata: Record<string, unknown>;
          connectedAt: string;
        };
        saveIntegration({ service: key, token, metadata, connectedAt });
      } catch {
        // corrupt cookie — ignore
      }
    }
  } catch (err) {
    console.error("[restoreFromCookies] cookies() failed:", err);
    // proceed with empty in-memory store
  }
}

// ── Vercel ────────────────────────────────────────────────────────────────────
// Docs:  https://vercel.com/docs/rest-api
// Token: https://vercel.com/account/tokens

export async function actionConnectVercel(token: string): Promise<ConnectResult> {
  try {
    const [userRes, projRes] = await Promise.all([
      fetch("https://api.vercel.com/v2/user", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("https://api.vercel.com/v9/projects?limit=1", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (userRes.status === 401 || userRes.status === 403) {
      return { success: false, error: "Invalid token — check your Vercel API token and try again." };
    }
    if (!userRes.ok) {
      return { success: false, error: `Vercel API returned ${userRes.status} — try again.` };
    }

    const userData = await userRes.json();
    const user = userData.user ?? {};

    let projectCount = 0;
    if (projRes.ok) {
      const projData = await projRes.json();
      projectCount = projData.pagination?.count ?? 0;
    }

    const connectedAt = new Date().toISOString();
    const metadata = {
      name:         user.name ?? user.username,
      username:     user.username,
      email:        user.email,
      projectCount,
    };

    const integration: StoredIntegration = { service: "vercel", token, connectedAt, metadata };
    saveIntegration(integration);
    await persistToCookie(integration);

    return { success: true, status: { connected: true, connectedAt, metadata } };
  } catch {
    return { success: false, error: "Network error — check your connection and try again." };
  }
}

// ── GitHub ────────────────────────────────────────────────────────────────────
// Docs:  https://docs.github.com/en/rest
// Token: https://github.com/settings/tokens

export async function actionConnectGitHub(token: string): Promise<ConnectResult> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization:          `Bearer ${token}`,
        Accept:                 "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      return { success: false, error: "Invalid token — check your GitHub Personal Access Token." };
    }
    if (!res.ok) {
      return { success: false, error: `GitHub API returned ${res.status} — try again.` };
    }

    const user = await res.json();
    const connectedAt = new Date().toISOString();
    const metadata = {
      name:      user.name,
      username:  user.login,
      email:     user.email,
      repoCount: (user.public_repos ?? 0) + (user.total_private_repos ?? 0),
    };

    const integration: StoredIntegration = { service: "github", token, connectedAt, metadata };
    saveIntegration(integration);
    await persistToCookie(integration);

    return { success: true, status: { connected: true, connectedAt, metadata } };
  } catch {
    return { success: false, error: "Network error — check your connection and try again." };
  }
}

// ── Webflow ───────────────────────────────────────────────────────────────────
// Docs:  https://developers.webflow.com/data/reference
// Token: https://webflow.com/dashboard/account/general → API Access

export async function actionConnectWebflow(token: string): Promise<ConnectResult> {
  try {
    const [infoRes, sitesRes] = await Promise.all([
      fetch("https://api.webflow.com/v2/token/introspect", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("https://api.webflow.com/v2/sites", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!infoRes.ok && !sitesRes.ok) {
      const status = sitesRes.status;
      if (status === 401 || status === 403) {
        return { success: false, error: "Invalid token — check your Webflow API token." };
      }
      return { success: false, error: `Webflow API returned ${status} — try again.` };
    }

    let name: string | undefined;
    let email: string | undefined;
    if (infoRes.ok) {
      const info = await infoRes.json();
      name  = info.user?.displayName ?? undefined;
      email = info.user?.email ?? undefined;
    }

    let siteCount = 0;
    if (sitesRes.ok) {
      const sites = await sitesRes.json();
      siteCount = Array.isArray(sites.sites) ? sites.sites.length : (Array.isArray(sites) ? sites.length : 0);
    }

    const connectedAt = new Date().toISOString();
    const metadata = { name, email, siteCount };

    const integration: StoredIntegration = { service: "webflow", token, connectedAt, metadata };
    saveIntegration(integration);
    await persistToCookie(integration);

    return { success: true, status: { connected: true, connectedAt, metadata } };
  } catch {
    return { success: false, error: "Network error — check your connection and try again." };
  }
}

// ── Stripe ────────────────────────────────────────────────────────────────────
// Docs:  https://stripe.com/docs/api
// Keys:  https://dashboard.stripe.com/apikeys (sk_live_ / sk_test_ / rk_live_ / rk_test_)

export async function actionConnectStripe(secretKey: string): Promise<ConnectResult> {
  if (!secretKey.startsWith("sk_") && !secretKey.startsWith("rk_")) {
    return {
      success: false,
      error: "Invalid format — Stripe secret keys begin with sk_live_, sk_test_, rk_live_, or rk_test_.",
    };
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    });

    if (res.status === 401) {
      return { success: false, error: "Invalid key — check your Stripe secret key and try again." };
    }
    if (!res.ok) {
      return { success: false, error: `Stripe API returned ${res.status} — try again.` };
    }

    const account = await res.json();
    const connectedAt = new Date().toISOString();
    const isLive = secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_");
    const metadata = {
      name:    account.settings?.dashboard?.display_name ?? account.business_profile?.name,
      email:   account.email,
      country: account.country,
      mode:    isLive ? "live" as const : "test" as const,
    };

    const integration: StoredIntegration = { service: "stripe", token: secretKey, connectedAt, metadata };
    saveIntegration(integration);
    await persistToCookie(integration);

    return { success: true, status: { connected: true, connectedAt, metadata } };
  } catch {
    return { success: false, error: "Network error — check your connection and try again." };
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────
// Docs:  https://supabase.com/docs/reference/api
// Token: https://supabase.com/dashboard/account/tokens (Personal Access Token)

export async function actionConnectSupabase(token: string): Promise<ConnectResult> {
  try {
    const res = await fetch("https://api.supabase.com/v1/projects", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return { success: false, error: "Invalid token — check your Supabase personal access token." };
    }
    if (!res.ok) {
      return { success: false, error: `Supabase API returned ${res.status} — try again.` };
    }

    const projects = await res.json();
    const projectCount  = Array.isArray(projects) ? projects.length : 0;
    const firstName     = Array.isArray(projects) && projects[0]?.name ? projects[0].name : undefined;

    const connectedAt = new Date().toISOString();
    const metadata = { projectCount, name: firstName };

    const integration: StoredIntegration = { service: "supabase", token, connectedAt, metadata };
    saveIntegration(integration);
    await persistToCookie(integration);

    return { success: true, status: { connected: true, connectedAt, metadata } };
  } catch {
    return { success: false, error: "Network error — check your connection and try again." };
  }
}

// ── Disconnect ────────────────────────────────────────────────────────────────

export async function actionDisconnectIntegration(service: IntegrationKey): Promise<void> {
  removeIntegration(service);
  await clearCookie(service);
}

// ── Env-var fallbacks ─────────────────────────────────────────────────────────
//
// If no user-pasted token exists for Vercel or GitHub, check the env vars
// baked into the deployment. Results are NOT persisted to cookie — env vars
// are always re-checked on each status query so they stay fresh.

// Check env vars synchronously — no outbound API calls on every page load.
// The actionValidateXxxEnv() functions below do the real API calls and are
// called from the client after the page renders.
function resolveVercelFromEnv(): IntegrationStatus | null {
  if (!process.env.VERCEL_TOKEN) return null;
  // Token is present but NOT yet validated. connected:false until the user
  // clicks "Test Vercel connection" and actionValidateVercelEnv() succeeds.
  return { connected: false, source: "env" };
}

function resolveGitHubFromEnv(): IntegrationStatus | null {
  // GitHub connects via OAuth flow — env credentials don't pre-connect the user.
  // actionGetOAuthConfig() tells the client whether to show the OAuth button.
  return null;
}

function resolveSupabaseFromEnv(): IntegrationStatus | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  return { connected: true, source: "env", connectedAt: new Date().toISOString(), metadata: { name: "Supabase" } };
}

function resolveStripeFromEnv(): IntegrationStatus | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const mode = (key.startsWith("sk_live_") || key.startsWith("rk_live_")) ? "live" as const : "test" as const;
  return { connected: true, source: "env", connectedAt: new Date().toISOString(), metadata: { name: "Stripe", mode } };
}

// ── Env-validation actions ────────────────────────────────────────────────────
//
// These make real API calls and should be called from the client AFTER the
// page has rendered — NOT inside actionGetAllIntegrationStatuses().
// Each returns success:false with error:undefined when the env var isn't set
// (silent, no UI error) or success:false with a real error string when the
// env var is present but the credentials are invalid.

export async function actionValidateVercelEnv(): Promise<ConnectResult> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { success: false, error: "VERCEL_TOKEN is not set in server environment." };

  // All Vercel API requests share a single 10-second deadline.
  // AbortSignal.timeout() is available in Node.js 18+ (Vercel runtime).
  const signal = AbortSignal.timeout(10_000);

  const isAbort = (e: unknown) =>
    e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

  try {
    // ── Primary: GET https://api.vercel.com/v2/user ──────────────────────────
    const userRes = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal,
    });

    if (!userRes.ok) {
      const code = userRes.status;
      if (code === 401 || code === 403) return { success: false, error: "VERCEL_TOKEN is invalid or has been revoked." };
      return { success: false, error: `Vercel API returned HTTP ${code}.` };
    }

    const userData = await userRes.json();
    const user = userData.user ?? {};

    // ── Optional: GET https://api.vercel.com/v2/teams/{id} ───────────────────
    let teamName: string | undefined;
    if (user.defaultTeamId) {
      try {
        const teamRes = await fetch(`https://api.vercel.com/v2/teams/${user.defaultTeamId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal,
        });
        if (teamRes.ok) {
          const team = await teamRes.json();
          teamName = team.name ?? team.slug ?? undefined;
        }
      } catch (e) {
        if (isAbort(e)) throw e; // re-throw so outer catch handles timeout
      }
    }

    // ── Optional: GET https://api.vercel.com/v6/deployments?limit=100 ────────
    let deploymentCount = 0;
    try {
      const depRes = await fetch("https://api.vercel.com/v6/deployments?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal,
      });
      if (depRes.ok) {
        const depData = await depRes.json();
        deploymentCount = Array.isArray(depData.deployments) ? depData.deployments.length : 0;
      }
    } catch (e) {
      if (isAbort(e)) throw e;
    }

    return {
      success: true,
      status: {
        connected:   true,
        source:      "env",
        connectedAt: new Date().toISOString(),
        metadata: {
          name:            user.name ?? user.username,
          username:        user.username,
          email:           user.email,
          teamName,
          deploymentCount,
        },
      },
    };
  } catch (e) {
    if (isAbort(e)) return { success: false, error: "Vercel connection timed out." };
    return { success: false, error: "Network error reaching Vercel API." };
  }
}

export async function actionTestGitHubOAuth(): Promise<ConnectResult> {
  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { success: false, error: "GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not set." };

  const signal = AbortSignal.timeout(10_000);
  const isAbort = (e: unknown) => e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

  try {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch("https://api.github.com/rate_limit", {
      headers: {
        Authorization:          `Basic ${credentials}`,
        Accept:                 "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent":           "launchforge-ai",
      },
      cache: "no-store",
      signal,
    });
    if (res.status === 401) {
      return { success: false, error: "GitHub OAuth credentials are invalid — check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET." };
    }
    if (!res.ok) {
      return { success: false, error: `GitHub API returned ${res.status}.` };
    }
    const data = await res.json();
    const limit = data?.rate?.limit ?? data?.resources?.core?.limit ?? null;
    return {
      success: true,
      status: {
        connected:   true,
        source:      "env",
        connectedAt: new Date().toISOString(),
        metadata: {
          name:    "OAuth App",
          app_id:  clientId,
          ...(limit !== null && { repoCount: limit }),
        },
      },
    };
  } catch (e) {
    if (isAbort(e)) return { success: false, error: "GitHub connection timed out." };
    return { success: false, error: "Network error reaching GitHub API." };
  }
}

export async function actionValidateSupabaseEnv(): Promise<ConnectResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { success: false };

  const refMatch = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  const projectRef = refMatch?.[1] ?? undefined;

  const signal = AbortSignal.timeout(10_000);
  const isAbort = (e: unknown) => e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal,
    });
    if (!res.ok && res.status !== 406) {
      if (res.status === 401 || res.status === 403) {
        return { success: false, error: "Supabase anon key is invalid or project is paused." };
      }
      return { success: false, error: `Supabase returned ${res.status}.` };
    }
    return {
      success: true,
      status: {
        connected:   true,
        source:      "env",
        connectedAt: new Date().toISOString(),
        metadata: { name: projectRef ? `Project ${projectRef}` : "Supabase Project", projectRef },
      },
    };
  } catch (e) {
    if (isAbort(e)) return { success: false, error: "Supabase connection timed out." };
    return { success: false, error: "Network error reaching Supabase." };
  }
}

export async function actionValidateStripeEnv(): Promise<ConnectResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { success: false };

  if (!key.startsWith("sk_") && !key.startsWith("rk_")) {
    return { success: false, error: "STRIPE_SECRET_KEY has an invalid format." };
  }

  const signal = AbortSignal.timeout(10_000);
  const isAbort = (e: unknown) => e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

  try {
    const res = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal,
    });
    if (res.status === 401) {
      return { success: false, error: "Stripe key is invalid or revoked." };
    }
    if (!res.ok) {
      return { success: false, error: `Stripe API returned ${res.status}.` };
    }
    const account = await res.json();
    const isLive = key.startsWith("sk_live_") || key.startsWith("rk_live_");
    return {
      success: true,
      status: {
        connected:   true,
        source:      "env",
        connectedAt: new Date().toISOString(),
        metadata: {
          name:    account.settings?.dashboard?.display_name ?? account.business_profile?.name ?? account.id,
          email:   account.email,
          mode:    isLive ? "live" as const : "test" as const,
          country: account.country,
        },
      },
    };
  } catch (e) {
    if (isAbort(e)) return { success: false, error: "Stripe connection timed out." };
    return { success: false, error: "Network error reaching Stripe API." };
  }
}

// ── Status queries ────────────────────────────────────────────────────────────

function allDisconnected(): Record<IntegrationKey, IntegrationStatus> {
  const ALL_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];
  return Object.fromEntries(ALL_KEYS.map((k) => [k, { connected: false }])) as Record<IntegrationKey, IntegrationStatus>;
}

export async function actionGetAllIntegrationStatuses(): Promise<Record<IntegrationKey, IntegrationStatus>> {
  try {
    // 1. Restore any cookie-persisted (user-pasted) tokens into the in-memory store.
    //    cookies() can throw in certain Next.js contexts — we catch at the outer level.
    await restoreFromCookies();

    // 2. For env-var-backed integrations: check presence synchronously.
    //    No outbound API calls — validation happens in the client via
    //    actionValidateVercelEnv / actionValidateSupabaseEnv / etc.
    const envFallbacks: Partial<Record<IntegrationKey, IntegrationStatus>> = {
      vercel:   resolveVercelFromEnv()   ?? undefined,
      github:   resolveGitHubFromEnv()   ?? undefined,
      supabase: resolveSupabaseFromEnv() ?? undefined,
      stripe:   resolveStripeFromEnv()   ?? undefined,
    };

    const ALL_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];
    const result = {} as Record<IntegrationKey, IntegrationStatus>;

    for (const key of ALL_KEYS) {
      const stored = getIntegration(key);
      if (stored) {
        result[key] = {
          connected:   true,
          source:      "user",
          connectedAt: stored.connectedAt,
          metadata:    stored.metadata as IntegrationStatus["metadata"],
        };
      } else if (envFallbacks[key] !== undefined) {
        // Include env fallbacks even when connected:false (e.g. Vercel/GitHub token present but unvalidated)
        result[key] = envFallbacks[key]!;
      } else {
        result[key] = { connected: false };
      }
    }

    return result;
  } catch (err) {
    // Never let this action throw — the Deployments page must always render.
    console.error("[actionGetAllIntegrationStatuses] unexpected error:", err);
    return allDisconnected();
  }
}

// Returns which OAuth providers have valid credentials configured in env.
// Used by the Deployments page to decide whether to show an OAuth button
// or a "not configured" info panel for each platform.
export async function actionGetOAuthConfig(): Promise<{
  github:  boolean;
  stripe:  boolean;
  webflow: boolean;
}> {
  return {
    github:  !!(process.env.GITHUB_CLIENT_ID  && process.env.GITHUB_CLIENT_SECRET),
    stripe:  !!(process.env.STRIPE_CLIENT_ID),
    webflow: !!(process.env.WEBFLOW_CLIENT_ID  && process.env.WEBFLOW_CLIENT_SECRET),
  };
}

// Checks which env vars are present server-side and logs them.
// Safe: logs only true/false — never prints actual secret values.
// Check Vercel function logs or local console after the Deployments page loads.
export async function actionGetEnvDiagnostics(): Promise<{
  hasVercelToken:        boolean;
  hasGithubClientId:     boolean;
  hasGithubClientSecret: boolean;
  hasStripeSecret:       boolean;
  hasStripeClientId:     boolean;
  hasSupabaseUrl:        boolean;
  hasSupabaseAnon:       boolean;
  hasAppUrl:             boolean;
  hasWebflowClientId:    boolean;
  hasWebflowSecret:      boolean;
}> {
  const result = {
    hasVercelToken:        !!process.env.VERCEL_TOKEN,
    hasGithubClientId:     !!process.env.GITHUB_CLIENT_ID,
    hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    hasStripeSecret:       !!process.env.STRIPE_SECRET_KEY,
    hasStripeClientId:     !!process.env.STRIPE_CLIENT_ID,
    hasSupabaseUrl:        !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnon:       !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasAppUrl:             !!process.env.NEXT_PUBLIC_APP_URL,
    hasWebflowClientId:    !!process.env.WEBFLOW_CLIENT_ID,
    hasWebflowSecret:      !!process.env.WEBFLOW_CLIENT_SECRET,
  };
  console.log("[LaunchForge env diagnostics]", JSON.stringify(result, null, 2));
  return result;
}

export async function actionGetIntegrationStatus(service: IntegrationKey): Promise<IntegrationStatus> {
  try {
    await restoreFromCookies();
    const stored = getIntegration(service);
    if (!stored) return { connected: false };
    return {
      connected:   true,
      source:      "user",
      connectedAt: stored.connectedAt,
      metadata:    stored.metadata as IntegrationStatus["metadata"],
    };
  } catch (err) {
    console.error("[actionGetIntegrationStatus] unexpected error:", err);
    return { connected: false };
  }
}
