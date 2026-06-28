import { getCanonicalAppOrigin } from "@/lib/auth/app-url";
import { getSchemaReadiness } from "@/lib/readiness/schema";

const CANONICAL_PRODUCTION_ORIGIN = "https://launchforge-sib3.vercel.app";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const schema = await getSchemaReadiness();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const canonicalOrigin = getCanonicalAppOrigin();
  const requiredEnv = {
    anthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    nextPublicAppUrl: Boolean(appUrl),
    nextPublicAppUrlCanonical: normalizeOrigin(appUrl) === CANONICAL_PRODUCTION_ORIGIN,
    canonicalOriginResolved: canonicalOrigin === CANONICAL_PRODUCTION_ORIGIN,
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    githubClientId: Boolean(process.env.GITHUB_CLIENT_ID),
    githubClientSecret: Boolean(process.env.GITHUB_CLIENT_SECRET),
    vercelToken: Boolean(process.env.VERCEL_TOKEN),
    integrationSecret: Boolean(process.env.LAUNCHFORGE_INTEGRATION_SECRET),
  };
  const optionalEnv = {
    googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    tiktokClientKey: Boolean(process.env.TIKTOK_CLIENT_KEY),
    tiktokClientSecret: Boolean(process.env.TIKTOK_CLIENT_SECRET),
    metaClientId: Boolean(process.env.META_CLIENT_ID || process.env.FACEBOOK_CLIENT_ID),
    metaClientSecret: Boolean(process.env.META_CLIENT_SECRET || process.env.FACEBOOK_CLIENT_SECRET),
    xClientId: Boolean(process.env.X_CLIENT_ID),
    xClientSecret: Boolean(process.env.X_CLIENT_SECRET),
    linkedinClientId: Boolean(process.env.LINKEDIN_CLIENT_ID),
    linkedinClientSecret: Boolean(process.env.LINKEDIN_CLIENT_SECRET),
    stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeClientId: Boolean(process.env.STRIPE_CLIENT_ID),
  };
  const envReady = Object.values(requiredEnv).every(Boolean);

  return Response.json({
    ready: envReady && schema.ready,
    env: {
      ...requiredEnv,
      ...optionalEnv,
    },
    requiredEnv,
    optionalEnv,
    schema,
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
