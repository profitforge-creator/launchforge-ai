export type EnvKey =
  | "GEMINI_API_KEY"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_APP_URL"
  | "VERCEL_PROJECT_PRODUCTION_URL"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GOOGLE_OAUTH_SCOPES"
  | "TIKTOK_CLIENT_KEY"
  | "TIKTOK_CLIENT_SECRET"
  | "META_CLIENT_ID"
  | "META_CLIENT_SECRET"
  | "FACEBOOK_CLIENT_ID"
  | "FACEBOOK_CLIENT_SECRET"
  | "X_CLIENT_ID"
  | "X_CLIENT_SECRET"
  | "LINKEDIN_CLIENT_ID"
  | "LINKEDIN_CLIENT_SECRET"
  | "VERCEL_TOKEN"
  | "STRIPE_SECRET_KEY"
  | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  | "STRIPE_CLIENT_ID"
  | "LAUNCHFORGE_INTEGRATION_SECRET"
  | "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY";

export interface EnvCheck {
  key: EnvKey;
  loaded: boolean;
}

export const ENV_KEYS: EnvKey[] = [
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_OAUTH_SCOPES",
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET",
  "META_CLIENT_ID",
  "META_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "X_CLIENT_ID",
  "X_CLIENT_SECRET",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "VERCEL_TOKEN",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_CLIENT_ID",
  "LAUNCHFORGE_INTEGRATION_SECRET",
  "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY",
];

export function hasEnv(key: EnvKey): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function getEnvDiagnostics(keys: EnvKey[] = ENV_KEYS): Record<EnvKey, boolean> {
  return Object.fromEntries(keys.map((key) => [key, hasEnv(key)])) as Record<EnvKey, boolean>;
}

export function getEnvChecks(keys: EnvKey[] = ENV_KEYS): EnvCheck[] {
  return keys.map((key) => ({ key, loaded: hasEnv(key) }));
}
