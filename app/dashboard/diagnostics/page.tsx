import { getEnvChecks, type EnvKey } from "@/lib/env/diagnostics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EnvVar {
  key: EnvKey;
  label: string;
  isSecret: boolean;
  hint: string;
}

const ENV_VARS: EnvVar[] = [
  { key: "GEMINI_API_KEY", label: "Gemini API Key", isSecret: true, hint: "Required for AI generation." },
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL", isSecret: false, hint: "Required for database." },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key", isSecret: false, hint: "Required for database auth." },
  { key: "NEXT_PUBLIC_APP_URL", label: "App URL", isSecret: false, hint: "Required for stable production OAuth callback URLs." },
  { key: "GITHUB_CLIENT_ID", label: "GitHub OAuth Client ID", isSecret: false, hint: "Required for GitHub OAuth." },
  { key: "GITHUB_CLIENT_SECRET", label: "GitHub OAuth Client Secret", isSecret: true, hint: "Required for GitHub OAuth." },
  { key: "VERCEL_TOKEN", label: "Vercel API Token", isSecret: true, hint: "Required for Vercel API checks." },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", isSecret: true, hint: "Required for Stripe API checks." },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Stripe Publishable Key", isSecret: false, hint: "Required for Stripe.js on the client." },
  { key: "STRIPE_CLIENT_ID", label: "Stripe Connect Client ID", isSecret: false, hint: "Required for Stripe Connect OAuth." },
  { key: "WEBFLOW_CLIENT_ID", label: "Webflow OAuth Client ID", isSecret: false, hint: "Required for Webflow OAuth." },
  { key: "WEBFLOW_CLIENT_SECRET", label: "Webflow OAuth Client Secret", isSecret: true, hint: "Required for Webflow OAuth." },
  { key: "LAUNCHFORGE_INTEGRATION_SECRET", label: "Integration Encryption Secret", isSecret: true, hint: "Required for durable encrypted token storage." },
];

export default function DiagnosticsPage() {
  const checks = new Map(getEnvChecks(ENV_VARS.map((v) => v.key)).map((v) => [v.key, v.loaded]));
  const results = ENV_VARS.map((v) => ({ ...v, loaded: checks.get(v.key) ?? false }));
  const loaded = results.filter((r) => r.loaded).length;
  const missing = results.length - loaded;

  return (
    <div style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto", fontFamily: "inherit" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.25rem" }}>
          Environment Diagnostics
        </h1>
        <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
          Checked server-side at request time. Values and prefixes are never shown.
        </p>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
          <SummaryPill label={`${loaded} Loaded`} tone="ok" />
          <SummaryPill label={`${missing} Missing`} tone={missing === 0 ? "neutral" : "error"} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((r) => (
          <div
            key={r.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderRadius: "0.75rem",
              background: "hsl(var(--card))",
              border: `1px solid ${r.loaded ? "hsl(var(--border))" : "hsl(0 72% 51% / 0.25)"}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "hsl(var(--foreground))", fontWeight: 600 }}>
                  {r.key}
                </span>
                {r.isSecret && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.25rem",
                      background: "hsl(var(--muted))",
                      color: "hsl(var(--muted-foreground))",
                      letterSpacing: "0.04em",
                    }}
                  >
                    SECRET
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                {r.loaded ? r.label : r.hint}
              </span>
            </div>

            <StatusPill loaded={r.loaded} />
          </div>
        ))}
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
        Checked dynamically in the Node runtime. Add missing local variables to <code style={{ fontFamily: "monospace" }}>.env.local</code> and Vercel variables to the correct Production or Preview environment.
      </p>
    </div>
  );
}

function SummaryPill({ label, tone }: { label: string; tone: "ok" | "error" | "neutral" }) {
  const color = tone === "ok" ? "hsl(142, 76%, 36%)" : tone === "error" ? "hsl(0, 72%, 51%)" : "hsl(var(--muted-foreground))";
  const bg = tone === "ok" ? "hsl(142 76% 36% / 0.12)" : tone === "error" ? "hsl(0 72% 51% / 0.12)" : "hsl(var(--muted) / 0.4)";
  const border = tone === "ok" ? "hsl(142 76% 36% / 0.3)" : tone === "error" ? "hsl(0 72% 51% / 0.3)" : "hsl(var(--border))";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", background: bg, border: `1px solid ${border}` }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

function StatusPill({ loaded }: { loaded: boolean }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: loaded ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)",
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        background: loaded ? "hsl(142 76% 36% / 0.1)" : "hsl(0 72% 51% / 0.1)",
        border: `1px solid ${loaded ? "hsl(142 76% 36% / 0.25)" : "hsl(0 72% 51% / 0.25)"}`,
      }}
    >
      {loaded ? "Loaded" : "Missing"}
    </span>
  );
}
