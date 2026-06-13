// Stripe Connect callback — exchanges code for connected account access token.
// Endpoint used: GET https://api.stripe.com/v1/account (Bearer <connected_account_sk>)

import { NextResponse } from "next/server";
import { consumeOAuthState, persistIntegration } from "@/lib/auth/persist-integration";

const isAbort = (e: unknown) => e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");

export async function GET(request: Request) {
  const url    = new URL(request.url);
  const origin = url.origin;

  const errRedirect = (msg: string) => {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", msg);
    return NextResponse.redirect(u.toString());
  };

  const providerError = url.searchParams.get("error");
  if (providerError) {
    const desc = url.searchParams.get("error_description") ?? providerError;
    return errRedirect(`Stripe denied access: ${desc}`);
  }

  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return errRedirect("Stripe callback missing code or state.");

  const storedState = await consumeOAuthState("stripe");
  if (!storedState || storedState !== state) {
    return errRedirect("Stripe OAuth state mismatch — please try again.");
  }

  const platformKey = process.env.STRIPE_SECRET_KEY;
  if (!platformKey) return errRedirect("STRIPE_SECRET_KEY is not configured.");

  // ── Exchange code → connected account access token ───────────────────────────
  // Stripe Connect token exchange requires the platform's secret key as auth.
  // The returned access_token is the connected account's secret key (sk_live_xxx).
  let accessToken: string;
  let stripeUserId: string | undefined;
  try {
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${platformKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenRes.ok) return errRedirect(`Stripe token exchange failed (HTTP ${tokenRes.status}).`);

    const td = await tokenRes.json() as Record<string, unknown>;
    if (td.error || !td.access_token) {
      return errRedirect(`Stripe: ${td.error_description ?? td.error ?? "token exchange failed"}`);
    }
    accessToken  = td.access_token as string;
    stripeUserId = td.stripe_user_id as string | undefined;
  } catch (e) {
    return errRedirect(isAbort(e) ? "Stripe token exchange timed out." : "Network error contacting Stripe.");
  }

  // ── Fetch connected account details ──────────────────────────────────────────
  try {
    const accountRes = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache:   "no-store",
      signal:  AbortSignal.timeout(10_000),
    });

    if (!accountRes.ok) return errRedirect(`Stripe account fetch failed (HTTP ${accountRes.status}).`);

    const account = await accountRes.json() as Record<string, unknown>;
    const isLive  = (accessToken as string).startsWith("sk_live_") || (accessToken as string).startsWith("rk_live_");

    type DashSettings = { display_name?: string };
    type BizProfile   = { name?: string };
    const settings = account.settings as { dashboard?: DashSettings } | undefined;
    const biz      = account.business_profile as BizProfile | undefined;

    await persistIntegration({
      service:     "stripe",
      token:       accessToken,
      connectedAt: new Date().toISOString(),
      metadata: {
        name:    settings?.dashboard?.display_name ?? biz?.name ?? (stripeUserId ?? account.id),
        email:   account.email,
        mode:    isLive ? "live" : "test",
        country: account.country,
      },
    });
  } catch (e) {
    return errRedirect(isAbort(e) ? "Stripe connection timed out." : "Failed to fetch Stripe account data.");
  }

  const success = new URL("/dashboard/deployments", origin);
  success.searchParams.set("oauth_success", "stripe");
  return NextResponse.redirect(success.toString());
}
