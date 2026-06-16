// Webflow OAuth callback — exchanges code for access token, fetches user and sites.
// Endpoints used:
//   POST https://api.webflow.com/oauth/access_token  (code exchange)
//   GET  https://api.webflow.com/v2/token/introspect  (user info)
//   GET  https://api.webflow.com/v2/sites              (site count)

import { NextResponse } from "next/server";
import { consumeOAuthState, persistIntegration } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const isAbort = (e: unknown) => e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

export async function GET(request: Request) {
  const url    = new URL(request.url);
  const origin = getAppOrigin(request.url);

  const errRedirect = (msg: string) => {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", msg);
    return NextResponse.redirect(u.toString());
  };

  const providerError = url.searchParams.get("error");
  if (providerError) {
    const desc = url.searchParams.get("error_description") ?? providerError;
    return errRedirect(`Webflow denied access: ${desc}`);
  }

  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return errRedirect("Webflow callback missing code or state.");

  const owner = await getCurrentUser();
  if (!owner) return errRedirect("Sign in before connecting Webflow.");

  const storedState = await consumeOAuthState("webflow", state, owner.id);
  if (!storedState || storedState !== state) {
    return errRedirect("Webflow OAuth state mismatch — please try again.");
  }

  const clientId     = process.env.WEBFLOW_CLIENT_ID;
  const clientSecret = process.env.WEBFLOW_CLIENT_SECRET;
  if (!clientId || !clientSecret) return errRedirect("Webflow OAuth credentials not configured.");

  // ── Exchange code → access token ─────────────────────────────────────────────
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://api.webflow.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        grant_type:    "authorization_code",
        redirect_uri:  getOAuthRedirectUri("webflow", request.url),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenRes.ok) return errRedirect(`Webflow token exchange failed (HTTP ${tokenRes.status}).`);

    const td = await tokenRes.json() as Record<string, unknown>;
    if (!td.access_token) {
      return errRedirect(`Webflow: token exchange failed — no access_token in response.`);
    }
    accessToken = td.access_token as string;
  } catch (e) {
    return errRedirect(isAbort(e) ? "Webflow token exchange timed out." : "Network error contacting Webflow.");
  }

  // ── Fetch user info and sites ─────────────────────────────────────────────────
  try {
    const [infoRes, sitesRes] = await Promise.all([
      fetch("https://api.webflow.com/v2/token/introspect", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache:   "no-store",
        signal:  AbortSignal.timeout(10_000),
      }),
      fetch("https://api.webflow.com/v2/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache:   "no-store",
        signal:  AbortSignal.timeout(10_000),
      }),
    ]);

    let name: string | undefined;
    let email: string | undefined;
    if (infoRes.ok) {
      const info = await infoRes.json() as Record<string, unknown>;
      const user = info.user as Record<string, string> | undefined;
      name  = user?.displayName;
      email = user?.email;
    }

    let siteCount = 0;
    if (sitesRes.ok) {
      const sitesData = await sitesRes.json() as Record<string, unknown>;
      const sites = sitesData.sites;
      siteCount = Array.isArray(sites) ? sites.length : (Array.isArray(sitesData) ? (sitesData as unknown[]).length : 0);
    }

    const persisted = await persistIntegration({
      service:     "webflow",
      ownerId:     owner.id,
      token:       accessToken,
      connectedAt: new Date().toISOString(),
      metadata:    { name, email, siteCount },
    });
    if (!persisted.persisted) return errRedirect(persisted.reason ?? "Webflow connected, but token storage is not ready.");
  } catch (e) {
    return errRedirect(isAbort(e) ? "Webflow connection timed out." : "Failed to fetch Webflow account data.");
  }

  const success = new URL("/dashboard/deployments", origin);
  success.searchParams.set("oauth_success", "webflow");
  return NextResponse.redirect(success.toString());
}
