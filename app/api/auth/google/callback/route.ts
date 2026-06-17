import { NextResponse } from "next/server";
import { consumeOAuthState, persistIntegration } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const isAbort = (error: unknown) =>
  error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request.url);

  const errRedirect = (message: string) => {
    const u = new URL("/dashboard/integrations", origin);
    u.searchParams.set("oauth_status", message);
    return NextResponse.redirect(u.toString());
  };

  const providerError = url.searchParams.get("error");
  if (providerError) {
    return errRedirect("google_cancelled");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return errRedirect("google_retry");

  const owner = await getCurrentUser();
  if (!owner) return errRedirect("google_signin_required");

  const storedState = await consumeOAuthState("google", state, owner.id);
  if (!storedState || storedState !== state) {
    return errRedirect("google_retry");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.redirect("https://console.cloud.google.com/apis/credentials");

  let tokenData: GoogleTokenResponse;
  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: getOAuthRedirectUri("google", request.url),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    tokenData = await tokenRes.json() as GoogleTokenResponse;
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      return errRedirect("google_retry");
    }
  } catch (error) {
    return errRedirect(isAbort(error) ? "google_timeout" : "google_network");
  }

  try {
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!userRes.ok) return errRedirect("google_retry");
    const googleUser = await userRes.json() as GoogleUserInfo;
    const connectedAt = new Date().toISOString();
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;
    const scopes = tokenData.scope?.split(/\s+/).filter(Boolean) ?? ["openid", "email", "profile"];

    const persisted = await persistIntegration({
      service: "google",
      ownerId: owner.id,
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      connectedAt,
      expiresAt,
      scopes,
      metadata: {
        providerAccountId: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
      },
    });

    if (!persisted.persisted) return errRedirect("google_storage_setup");
  } catch (error) {
    return errRedirect(isAbort(error) ? "google_timeout" : "google_retry");
  }

  const success = new URL("/dashboard/integrations", origin);
  success.searchParams.set("oauth_success", "google");
  return NextResponse.redirect(success.toString());
}
