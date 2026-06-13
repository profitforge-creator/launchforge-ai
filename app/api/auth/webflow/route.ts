import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";

export async function GET(request: Request) {
  const origin   = new URL(request.url).origin;
  const clientId = process.env.WEBFLOW_CLIENT_ID;

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
