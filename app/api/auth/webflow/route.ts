import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";
import { getAppOrigin } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const origin   = getAppOrigin(request.url);
  const clientId = process.env.WEBFLOW_CLIENT_ID;
  const user = await getCurrentUser();

  if (!user) {
    const u = new URL("/login", origin);
    u.searchParams.set("error", "Sign in before connecting Webflow.");
    return NextResponse.redirect(u.toString());
  }

  if (!clientId) {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", "Webflow OAuth is not configured on this server (WEBFLOW_CLIENT_ID missing).");
    return NextResponse.redirect(u.toString());
  }

  const state = randomBytes(16).toString("hex");
  await setOAuthState("webflow", state);

  const params = new URLSearchParams({
    client_id:     clientId,
    response_type: "code",
    redirect_uri:  `${origin}/api/auth/webflow/callback`,
    scope:         "authorized_user:read sites:read",
    state,
  });

  return NextResponse.redirect(`https://webflow.com/oauth/authorize?${params}`);
}
