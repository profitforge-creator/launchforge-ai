// GitHub OAuth callback — exchanges code for access token, fetches real user data, persists.
// Endpoint used: GET https://api.github.com/user (Bearer <oauth_access_token>)

import { NextResponse } from "next/server";
import { consumeOAuthState, persistIntegration } from "@/lib/auth/persist-integration";
import { getAppOrigin } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

const isAbort = (e: unknown) => e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

export async function GET(request: Request) {
  const url    = new URL(request.url);
  const origin = getAppOrigin(request.url);

  const errRedirect = (msg: string) => {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", msg);
    return NextResponse.redirect(u.toString());
  };

  // ── Provider-returned error ──────────────────────────────────────────────────
  const providerError = url.searchParams.get("error");
  if (providerError) {
    const desc = url.searchParams.get("error_description") ?? providerError;
    return errRedirect(`GitHub denied access: ${desc}`);
  }

  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return errRedirect("GitHub callback missing code or state.");

  const owner = await getCurrentUser();
  if (!owner) return errRedirect("Sign in before connecting GitHub.");

  // ── CSRF check ───────────────────────────────────────────────────────────────
  const storedState = await consumeOAuthState("github");
  if (!storedState || storedState !== state) {
    return errRedirect("GitHub OAuth state mismatch — please try again.");
  }

  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return errRedirect("GitHub OAuth credentials not configured.");

  // ── Exchange code → access token ─────────────────────────────────────────────
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/api/auth/github/callback`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenRes.ok) return errRedirect(`GitHub token exchange failed (HTTP ${tokenRes.status}).`);

    const td = await tokenRes.json() as Record<string, string>;
    if (td.error || !td.access_token) {
      return errRedirect(`GitHub: ${td.error_description ?? td.error ?? "token exchange failed"}`);
    }
    accessToken = td.access_token;
  } catch (e) {
    return errRedirect(isAbort(e) ? "GitHub token exchange timed out." : "Network error contacting GitHub.");
  }

  // ── Fetch real user data ─────────────────────────────────────────────────────
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization:          `Bearer ${accessToken}`,
        Accept:                 "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!userRes.ok) return errRedirect(`GitHub user fetch failed (HTTP ${userRes.status}).`);

    const user = await userRes.json() as Record<string, unknown>;

    const persisted = await persistIntegration({
      service:     "github",
      ownerId:     owner.id,
      token:       accessToken,
      connectedAt: new Date().toISOString(),
      scopes:      ["repo", "read:user", "user:email"],
      metadata: {
        name:      user.name,
        username:  user.login,
        email:     user.email,
        repoCount: ((user.public_repos as number) ?? 0) + ((user.total_private_repos as number) ?? 0),
      },
    });
    if (!persisted.persisted) return errRedirect(persisted.reason ?? "GitHub connected, but token storage is not ready.");
  } catch (e) {
    return errRedirect(isAbort(e) ? "GitHub connection timed out." : "Failed to fetch GitHub account data.");
  }

  const success = new URL("/dashboard/deployments", origin);
  success.searchParams.set("oauth_success", "github");
  return NextResponse.redirect(success.toString());
}
