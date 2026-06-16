import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/auth/persist-integration";
import { getAppOrigin, getOAuthRedirectUri } from "@/lib/auth/app-url";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin   = getAppOrigin(request.url);
  const clientId = process.env.STRIPE_CLIENT_ID; // ca_xxx (Stripe Connect Application ID)
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const user = await getCurrentUser();

  if (!user) {
    const u = new URL("/login", origin);
    u.searchParams.set("error", "Sign in before connecting Stripe.");
    return NextResponse.redirect(u.toString());
  }

  if (!clientId || !secretKey) {
    const u = new URL("/dashboard/deployments", origin);
    u.searchParams.set("oauth_error", "Stripe Connect is not configured on this server (STRIPE_CLIENT_ID and STRIPE_SECRET_KEY required).");
    return NextResponse.redirect(u.toString());
  }

  const state = randomBytes(16).toString("hex");
  await setOAuthState("stripe", state, user.id, ["read_write"]);

  const params = new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    scope:         "read_write",
    redirect_uri:  getOAuthRedirectUri("stripe", request.url),
    state,
  });

  return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params}`);
}
