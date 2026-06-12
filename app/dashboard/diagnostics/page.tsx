// Server component — env vars are checked server-side only.
// Secret values are never sent to the client; only presence is shown.

interface EnvVar {
  key: string;
  label: string;
  isSecret: boolean;
  hint: string;
}

const ENV_VARS: EnvVar[] = [
  {
    key: "GEMINI_API_KEY",
    label: "Gemini API Key",
    isSecret: true,
    hint: "Required for AI generation — get one at aistudio.google.com",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase URL",
    isSecret: false,
    hint: "Required for database — find in Supabase project settings",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Supabase Anon Key",
    isSecret: false,
    hint: "Required for database auth — find in Supabase project API settings",
  },
  {
    key: "GITHUB_CLIENT_ID",
    label: "GitHub OAuth Client ID",
    isSecret: false,
    hint: "Required for GitHub OAuth — create at github.com/settings/developers",
  },
  {
    key: "GITHUB_CLIENT_SECRET",
    label: "GitHub OAuth Client Secret",
    isSecret: true,
    hint: "Required for GitHub OAuth — created alongside Client ID",
  },
  {
    key: "VERCEL_TOKEN",
    label: "Vercel API Token",
    isSecret: true,
    hint: "Required for Vercel deployments — create at vercel.com/account/tokens",
  },
  {
    key: "STRIPE_SECRET_KEY",
    label: "Stripe Secret Key",
    isSecret: true,
    hint: "Required for payments — find at dashboard.stripe.com/apikeys",
  },
  {
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    label: "Stripe Publishable Key",
    isSecret: false,
    hint: "Required for Stripe.js on the client — find at dashboard.stripe.com/apikeys",
  },
];

function checkEnv(key: string): { loaded: boolean; preview?: string } {
  const value = process.env[key];
  if (!value || value.trim() === "") return { loaded: false };
  // For non-secret NEXT_PUBLIC_ vars, show first 8 chars so it's verifiable
  const preview = key.startsWith("NEXT_PUBLIC_")
    ? `${value.slice(0, 8)}…`
    : undefined;
  return { loaded: true, preview };
}

export default function DiagnosticsPage() {
  const results = ENV_VARS.map((v) => ({ ...v, ...checkEnv(v.key) }));
  const loaded = results.filter((r) => r.loaded).length;
  const missing = results.filter((r) => !r.loaded).length;

  return (
    <div style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto", fontFamily: "inherit" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.25rem" }}>
          Environment Diagnostics
        </h1>
        <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
          Checked server-side at request time. Secret values are never shown.
        </p>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", borderRadius: "0.5rem",
            background: "hsl(142 76% 36% / 0.12)", border: "1px solid hsl(142 76% 36% / 0.3)",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(142, 76%, 36%)", display: "inline-block" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(142, 76%, 36%)" }}>
              {loaded} Loaded
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", borderRadius: "0.5rem",
            background: missing === 0 ? "hsl(var(--muted) / 0.4)" : "hsl(0 72% 51% / 0.12)",
            border: `1px solid ${missing === 0 ? "hsl(var(--border))" : "hsl(0 72% 51% / 0.3)"}`,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", display: "inline-block",
              background: missing === 0 ? "hsl(var(--muted-foreground))" : "hsl(0, 72%, 51%)",
            }} />
            <span style={{
              fontSize: "0.875rem", fontWeight: 600,
              color: missing === 0 ? "hsl(var(--muted-foreground))" : "hsl(0, 72%, 51%)",
            }}>
              {missing} Missing
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((r) => (
          <div
            key={r.key}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1rem 1.25rem", borderRadius: "0.75rem",
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
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 600, padding: "0.1rem 0.4rem",
                    borderRadius: "0.25rem", background: "hsl(var(--muted))",
                    color: "hsl(var(--muted-foreground))", letterSpacing: "0.04em",
                  }}>
                    SECRET
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                {r.loaded && r.preview
                  ? `${r.label} · starts with ${r.preview}`
                  : r.loaded
                  ? r.label
                  : r.hint}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginLeft: "1rem" }}>
              {r.loaded ? (
                <span style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  fontSize: "0.8125rem", fontWeight: 600, color: "hsl(142, 76%, 36%)",
                  padding: "0.25rem 0.75rem", borderRadius: "9999px",
                  background: "hsl(142 76% 36% / 0.1)", border: "1px solid hsl(142 76% 36% / 0.25)",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Loaded
                </span>
              ) : (
                <span style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  fontSize: "0.8125rem", fontWeight: 600, color: "hsl(0, 72%, 51%)",
                  padding: "0.25rem 0.75rem", borderRadius: "9999px",
                  background: "hsl(0 72% 51% / 0.1)", border: "1px solid hsl(0 72% 51% / 0.25)",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Missing
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
        Add missing variables to <code style={{ fontFamily: "monospace" }}>.env.local</code> and restart the dev server.
        This page is only accessible to authenticated users.
      </p>
    </div>
  );
}
