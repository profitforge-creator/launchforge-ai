// Deterministic app origin for OAuth redirect URIs.
// Priority: NEXT_PUBLIC_APP_URL → VERCEL_URL → request URL.
// Set NEXT_PUBLIC_APP_URL=https://launchforge-sib3.vercel.app in production env vars.
export function getAppOrigin(requestUrl: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return new URL(requestUrl).origin;
}
