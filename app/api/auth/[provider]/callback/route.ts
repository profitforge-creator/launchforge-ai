import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { consumeOAuthState, persistIntegration } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";
import { getSocialOAuthConfig, isSocialOAuthConfigured } from "@/lib/auth/social-oauth";

export const runtime = "nodejs";

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

const isAbort = (error: unknown) =>
  error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const config = getSocialOAuthConfig(provider);
  const url = new URL(request.url);
  const origin = getAppOrigin(request.url);

  const done = (key: "oauth_success" | "oauth_status", value: string) => {
    const u = new URL("/dashboard/integrations", origin);
    u.searchParams.set(key, value);
    return NextResponse.redirect(u.toString());
  };

  if (!config) return done("oauth_status", "unknown_provider");
  if (url.searchParams.get("error")) return done("oauth_status", `${config.provider}_cancelled`);

  const owner = await getCurrentUser();
  if (!owner) return done("oauth_status", `${config.provider}_signin_required`);
  if (!isSocialOAuthConfigured(config)) return NextResponse.redirect(config.setupUrl);

  const redirectUri = getOAuthRedirectUri(config.provider, request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    console.error(`[oauth ${config.provider}] callback missing code/state`, JSON.stringify({ hasCode: !!code, hasState: !!state, providerError: url.searchParams.get("error") }));
    return done("oauth_status", `${config.provider}_retry`);
  }

  const storedState = await consumeOAuthState(config.provider, state, owner.id);
  if (!storedState || storedState !== state) {
    console.error(`[oauth ${config.provider}] state validation failed`, JSON.stringify({ hasStoredState: !!storedState, matches: storedState === state }));
    return done("oauth_status", `${config.provider}_retry`);
  }

  let tokenData: TokenResponse;
  try {
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: tokenHeaders(config),
      body: await tokenBody(config, code, request.url),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    tokenData = await tokenRes.json() as TokenResponse;
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      // Surface the provider's exact rejection — without this the only signal
      // is the generic "_retry" message, making the failure undiagnosable.
      console.error(`[oauth ${config.provider}] token exchange failed`, JSON.stringify({
        httpStatus:       tokenRes.status,
        providerError:    tokenData.error,
        errorDescription: tokenData.error_description,
        hasAccessToken:   !!tokenData.access_token,
        tokenUrl:         config.tokenUrl,
        redirectUri,
      }));
      return done("oauth_status", `${config.provider}_retry`);
    }
  } catch (error) {
    console.error(`[oauth ${config.provider}] token exchange threw`, error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    return done("oauth_status", isAbort(error) ? `${config.provider}_timeout` : `${config.provider}_network`);
  }

  const metadata = await fetchProfileMetadata(config.profileUrl, tokenData.access_token);
  const connectedAt = new Date().toISOString();
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;
  const scopes = tokenData.scope?.split(/[,\s]+/).filter(Boolean) ?? config.scopes;

  const persisted = await persistIntegration({
    service: config.integrationKey,
    ownerId: owner.id,
    token: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? null,
    connectedAt,
    expiresAt,
    scopes,
    metadata: {
      ...metadata,
      name: metadata.name ?? config.name,
      provider: config.provider,
    },
  });

  if (!persisted.persisted) {
    console.error(`[oauth ${config.provider}] persistence failed`, JSON.stringify({ reason: persisted.reason, requiresMigration: persisted.requiresMigration, requiresEncryptionSecret: persisted.requiresEncryptionSecret }));
    return done("oauth_status", `${config.provider}_storage_setup`);
  }
  return done("oauth_success", config.provider);
}

function tokenHeaders(config: NonNullable<ReturnType<typeof getSocialOAuthConfig>>): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  if (config.tokenAuth === "basic") {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
    headers.Authorization = `Basic ${credentials}`;
  }

  return headers;
}

async function tokenBody(config: NonNullable<ReturnType<typeof getSocialOAuthConfig>>, code: string, requestUrl: string): Promise<URLSearchParams> {
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: getOAuthRedirectUri(config.provider, requestUrl),
  });

  if (config.provider === "tiktok") {
    body.set("client_key", config.clientId!);
    body.set("client_secret", config.clientSecret!);
  } else if (config.tokenAuth === "body") {
    body.set("client_id", config.clientId!);
    body.set("client_secret", config.clientSecret!);
  } else {
    body.set("client_id", config.clientId!);
  }

  if (config.provider === "x") {
    const verifier = await getXCodeVerifier();
    if (verifier) body.set("code_verifier", verifier);
  }

  return body;
}

async function fetchProfileMetadata(profileUrl: string | undefined, accessToken: string): Promise<Record<string, unknown>> {
  if (!profileUrl) return {};

  try {
    const response = await fetch(profileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return {};
    const data = await response.json() as Record<string, unknown>;
    const nested = typeof data.data === "object" && data.data ? data.data as Record<string, unknown> : data;
    return {
      providerAccountId: nested.id ?? nested.sub ?? nested.open_id,
      name: nested.name ?? nested.display_name,
      username: nested.username,
      email: nested.email,
    };
  } catch {
    return {};
  }
}

async function getXCodeVerifier(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get("lf_oauth_pkce_x")?.value ?? null;
  jar.delete("lf_oauth_pkce_x");
  return value;
}
