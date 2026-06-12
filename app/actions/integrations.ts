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
  const jar = await cookies();
  const ALL_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];
  for (const key of ALL_KEYS) {
    if (getIntegration(key)) continue; // already in memory
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

// ── Status queries ────────────────────────────────────────────────────────────

export async function actionGetAllIntegrationStatuses(): Promise<Record<IntegrationKey, IntegrationStatus>> {
  // Restore any cookie-persisted tokens into the in-memory store first
  await restoreFromCookies();

  const ALL_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];
  const result = {} as Record<IntegrationKey, IntegrationStatus>;

  for (const key of ALL_KEYS) {
    const stored = getIntegration(key);
    if (stored) {
      result[key] = {
        connected:   true,
        connectedAt: stored.connectedAt,
        metadata:    stored.metadata as IntegrationStatus["metadata"],
      };
    } else {
      result[key] = { connected: false };
    }
  }

  return result;
}

export async function actionGetIntegrationStatus(service: IntegrationKey): Promise<IntegrationStatus> {
  await restoreFromCookies();
  const stored = getIntegration(service);
  if (!stored) return { connected: false };
  return {
    connected:   true,
    connectedAt: stored.connectedAt,
    metadata:    stored.metadata as IntegrationStatus["metadata"],
  };
}
