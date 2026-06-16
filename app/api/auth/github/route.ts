import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin   = getAppOrigin(request.url);
  const clientId = process.env.GITHUB_CLIENT_ID;
  const user = await getCurrentUser();

  if (!user) {
    const u = new URL("/login", origin);
    u.searchParams.set("error", "Sign in before connecting GitHub.");
    return NextResponse.redirect(u.toString());
  }

  if (!clientId) {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", "GitHub OAuth is not configured on this server (GITHUB_CLIENT_ID missing).");
    return NextResponse.redirect(u.toString());
  }

  const state = randomBytes(16).toString("hex");
  const scopes = ["repo", "read:user", "user:email"];
  await setOAuthState("github", state, user.id, scopes);

  const params = new URLSearchParams({
    client_id:    clientId,
    redirect_uri: getOAuthRedirectUri("github", request.url),
    scope:        scopes.join(" "),
    state,
  });

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
