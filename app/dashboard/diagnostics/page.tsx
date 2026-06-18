import { getEnvChecks, type EnvKey } from "@/lib/env/diagnostics";
import {
  actionTestGitHubOAuth,
  actionValidateStripeEnv,
  actionValidateSupabaseEnv,
  actionValidateVercelEnv,
} from "@/app/actions/integrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EnvVar {
  key: EnvKey;
  label: string;
  isSecret: boolean;
  hint: string;
  required: boolean;
}

const ENV_VARS: EnvVar[] = [
  { key: "GEMINI_API_KEY", label: "Gemini API Key", isSecret: true, hint: "Required for AI generation.", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL", isSecret: false, hint: "Required for database.", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key", isSecret: false, hint: "Required for database auth.", required: true },
  { key: "NEXT_PUBLIC_APP_URL", label: "App URL", isSecret: false, hint: "Required for stable production OAuth callback URLs.", required: true },
  { key: "VERCEL_PROJECT_PRODUCTION_URL", label: "Vercel Production URL", isSecret: false, hint: "Vercel system fallback for canonical auth redirects.", required: false },
  { key: "GITHUB_CLIENT_ID", label: "GitHub OAuth Client ID", isSecret: false, hint: "Required for GitHub OAuth.", required: true },
  { key: "GITHUB_CLIENT_SECRET", label: "GitHub OAuth Client Secret", isSecret: true, hint: "Required for GitHub OAuth.", required: true },
  { key: "VERCEL_TOKEN", label: "Vercel API Token", isSecret: true, hint: "Required for Vercel API checks.", required: true },
  { key: "LAUNCHFORGE_INTEGRATION_SECRET", label: "Integration Encryption Secret", isSecret: true, hint: "Required for durable encrypted token storage.", required: true },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", isSecret: true, hint: "Optional in this pass; Stripe launch is excluded.", required: false },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Stripe Publishable Key", isSecret: false, hint: "Optional in this pass; Stripe launch is excluded.", required: false },
  { key: "STRIPE_CLIENT_ID", label: "Stripe Connect Client ID", isSecret: false, hint: "Optional in this pass; Stripe launch is excluded.", required: false },
];

type DiagnosticState = "Connected" | "Not Configured" | "Unauthorized" | "Network Failure" | "OAuth Misconfigured";

interface PlatformDiagnostic {
  name: string;
  state: DiagnosticState;
  detail: string;
}

export default async function DiagnosticsPage() {
  const checks = new Map(getEnvChecks(ENV_VARS.map((v) => v.key)).map((v) => [v.key, v.loaded]));
  const results = ENV_VARS.map((v) => ({ ...v, loaded: checks.get(v.key) ?? false }));
  const loaded = results.filter((r) => r.loaded).length;
  const missingRequired = results.filter((r) => r.required && !r.loaded).length;
  const platformDiagnostics = await getPlatformDiagnostics();

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
          <SummaryPill label={`${missingRequired} Required Missing`} tone={missingRequired === 0 ? "neutral" : "error"} />
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
                {!r.required && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.25rem",
                      background: "hsl(var(--muted))",
                      color: "hsl(var(--muted-foreground))",
                      letterSpacing: "0",
                    }}
                  >
                    OPTIONAL
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

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.75rem" }}>
          Integration Diagnostics
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {platformDiagnostics.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1rem 1.25rem",
                borderRadius: "0.75rem",
                background: "hsl(var(--card))",
                border: `1px solid ${diagnosticBorder(item.state)}`,
              }}
            >
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>{item.name}</p>
                <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.2rem" }}>{item.detail}</p>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: diagnosticColor(item.state),
                  padding: "0.25rem 0.65rem",
                  borderRadius: "9999px",
                  background: diagnosticBackground(item.state),
                  whiteSpace: "nowrap",
                }}
              >
                {item.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
        Checked dynamically in the Node runtime. Add missing local variables to <code style={{ fontFamily: "monospace" }}>.env.local</code> and Vercel variables to the correct Production or Preview environment.
      </p>
    </div>
  );
}

async function getPlatformDiagnostics(): Promise<PlatformDiagnostic[]> {
  const [vercel, github, supabase, stripe] = await Promise.allSettled([
    actionValidateVercelEnv(),
    actionTestGitHubOAuth(),
    actionValidateSupabaseEnv(),
    actionValidateStripeEnv(),
  ]);

  return [
    fromConnectResult("Vercel", vercel, "VERCEL_TOKEN is missing or invalid."),
    fromConnectResult("GitHub OAuth", github, "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required."),
    fromConnectResult("Supabase", supabase, "Supabase URL and anon key are required."),
    fromConnectResult("Stripe", stripe, "STRIPE_SECRET_KEY is required for billing checks."),
  ];
}

function fromConnectResult(
  name: string,
  result: PromiseSettledResult<{ success: boolean; error?: string }>,
  missingDetail: string,
): PlatformDiagnostic {
  if (result.status === "rejected") {
    return { name, state: "Network Failure", detail: "Diagnostic request failed before returning a result." };
  }
  if (result.value.success) {
    return { name, state: "Connected", detail: "Credential check completed successfully." };
  }

  const error = result.value.error ?? missingDetail;
  const lower = error.toLowerCase();
  if (lower.includes("not set") || lower.includes("not configured") || lower.includes("missing")) {
    return { name, state: "Not Configured", detail: error };
  }
  if (lower.includes("invalid") || lower.includes("unauthorized") || lower.includes("revoked") || lower.includes("401") || lower.includes("403")) {
    return { name, state: "Unauthorized", detail: error };
  }
  if (lower.includes("oauth") || lower.includes("client_id") || lower.includes("client_secret")) {
    return { name, state: "OAuth Misconfigured", detail: error };
  }
  return { name, state: "Network Failure", detail: error };
}

function diagnosticColor(state: DiagnosticState): string {
  if (state === "Connected") return "hsl(142, 76%, 36%)";
  if (state === "Not Configured") return "hsl(var(--muted-foreground))";
  if (state === "OAuth Misconfigured") return "hsl(38, 90%, 45%)";
  return "hsl(0, 72%, 51%)";
}

function diagnosticBorder(state: DiagnosticState): string {
  if (state === "Connected") return "hsl(142 76% 36% / 0.25)";
  if (state === "Not Configured") return "hsl(var(--border))";
  if (state === "OAuth Misconfigured") return "hsl(38 90% 45% / 0.3)";
  return "hsl(0 72% 51% / 0.25)";
}

function diagnosticBackground(state: DiagnosticState): string {
  if (state === "Connected") return "hsl(142 76% 36% / 0.1)";
  if (state === "Not Configured") return "hsl(var(--muted) / 0.4)";
  if (state === "OAuth Misconfigured") return "hsl(38 90% 45% / 0.1)";
  return "hsl(0 72% 51% / 0.1)";
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
