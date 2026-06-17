import { getCanonicalAppOrigin } from "@/lib/auth/app-url";

const CANONICAL_PRODUCTION_ORIGIN = "https://launchforge-sib3.vercel.app";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const canonicalOrigin = getCanonicalAppOrigin();

  return Response.json({
    nextPublicAppUrl: Boolean(appUrl),
    nextPublicAppUrlCanonical: normalizeOrigin(appUrl) === CANONICAL_PRODUCTION_ORIGIN,
    canonicalOriginResolved: canonicalOrigin === CANONICAL_PRODUCTION_ORIGIN,
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    githubClientId: Boolean(process.env.GITHUB_CLIENT_ID),
    githubClientSecret: Boolean(process.env.GITHUB_CLIENT_SECRET),
    stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeClientId: Boolean(process.env.STRIPE_CLIENT_ID),
    vercelToken: Boolean(process.env.VERCEL_TOKEN),
  });
}

function normalizeOrigin(value: string): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
