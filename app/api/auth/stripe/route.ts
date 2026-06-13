import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";
import { getAppOrigin } from "@/lib/auth/app-url";

export async function GET(request: Request) {
  const origin   = getAppOrigin(request.url);
  const clientId = process.env.STRIPE_CLIENT_ID; // ca_xxx (Stripe Connect Application ID)

  if (!clientId) {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", "Stripe Connect is not configured on this server (STRIPE_CLIENT_ID missing).");
    return NextResponse.redirect(u.toString());
  }

  const state = randomBytes(16).toString("hex");
  await setOAuthState("stripe", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    scope:         "read_write",
    redirect_uri:  `${origin}/api/auth/stripe/callback`,
    state,
  });

  return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params}`);
}
