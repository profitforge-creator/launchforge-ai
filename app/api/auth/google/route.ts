import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const DEFAULT_GOOGLE_SCOPES = ["openid", "email", "profile"];

export async function GET(request: Request) {
  const origin = getAppOrigin(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const user = await getCurrentUser();

  if (!user) {
    const u = new URL("/login", origin);
    u.searchParams.set("message", "Sign in before connecting Google.");
    return NextResponse.redirect(u.toString());
  }

  if (!clientId) {
    const u = new URL("/dashboard/integrations", origin);
    u.searchParams.set("oauth_error", "Google OAuth is not configured on this server (GOOGLE_CLIENT_ID missing).");
    return NextResponse.redirect(u.toString());
  }

  const scopes = process.env.GOOGLE_OAUTH_SCOPES
    ?.split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
  const requestedScopes = scopes?.length ? scopes : DEFAULT_GOOGLE_SCOPES;

  const state = randomBytes(16).toString("hex");
  await setOAuthState("google", state, user.id, requestedScopes);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri("google", request.url),
    response_type: "code",
    scope: requestedScopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`);
}
