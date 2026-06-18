import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri, getOAuthOriginConfigError } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";
import { getSocialOAuthConfig, isSocialOAuthConfigured } from "@/lib/auth/social-oauth";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const config = getSocialOAuthConfig(provider);
  const origin = getAppOrigin(request.url);

  if (!config) return NextResponse.redirect(new URL("/dashboard/integrations", origin));

  const user = await getCurrentUser();
  if (!user) {
    const u = new URL("/login", origin);
    u.searchParams.set("message", `Sign in before connecting ${config.name}.`);
    return NextResponse.redirect(u.toString());
  }

  if (!isSocialOAuthConfigured(config)) {
    return NextResponse.redirect(config.setupUrl);
  }

  // Fail before redirecting to the provider if the app origin can't be resolved
  // to a stable URL — otherwise the redirect_uri silently mismatches and the
  // user only sees a generic "did not complete" after the round-trip.
  const originError = getOAuthOriginConfigError();
  if (originError) {
    console.error(`[oauth ${config.provider}] aborting start — ${originError}`);
    const u = new URL("/dashboard/integrations", origin);
    u.searchParams.set("oauth_status", `${config.provider}_app_url`);
    return NextResponse.redirect(u.toString());
  }

  const state = randomBytes(16).toString("hex");
  await setOAuthState(config.provider, state, user.id, config.scopes);

  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: getOAuthRedirectUri(config.provider, request.url),
    scope: config.scopes.join(config.provider === "tiktok" ? "," : " "),
    state,
    ...(config.extraAuthParams ?? {}),
  });

  if (config.provider === "tiktok") {
    params.set("client_key", config.clientId!);
  } else {
    params.set("client_id", config.clientId!);
  }

  if (config.provider === "x") {
    const codeVerifier = randomBytes(48).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    const jar = await cookies();
    jar.set("lf_oauth_pkce_x", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }

  return NextResponse.redirect(`${config.authUrl}?${params}`);
}
