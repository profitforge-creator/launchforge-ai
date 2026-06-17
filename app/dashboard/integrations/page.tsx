import Link from "next/link";
import { actionGetAllIntegrationStatuses, actionGetOAuthConfig } from "@/app/actions/integrations";
import { IntegrationActions } from "./integration-actions";
import { getCurrentUser } from "@/lib/auth/session";
import { getSchemaReadiness } from "@/lib/readiness/schema";
import { getSocialOAuthConfig } from "@/lib/auth/social-oauth";
import type { IntegrationKey } from "@/lib/storage/integration-store";

type ProviderStatus = "connected" | "disconnected" | "blocked" | "not-started";

interface ProviderCard {
  id: string;
  name: string;
  description: string;
  status: ProviderStatus;
  lastSync: string;
  scopes: string[];
  connectHref?: string;
  connectLabel?: string;
  blockedReason?: string;
  enabled?: boolean;
  actionsEnabled?: boolean;
  actionProvider?: IntegrationKey;
}

function statusLabel(status: ProviderStatus): string {
  if (status === "connected") return "Connected";
  if (status === "blocked") return "Blocked";
  if (status === "not-started") return "Not started";
  return "Disconnected";
}

function statusColor(status: ProviderStatus): string {
  if (status === "connected") return "hsl(151 60% 50%)";
  if (status === "blocked") return "hsl(38 90% 58%)";
  if (status === "not-started") return "hsl(220 9% 42%)";
  return "hsl(220 9% 50%)";
}

function Card({ provider }: { provider: ProviderCard }) {
  const canConnect = Boolean(provider.connectHref) && provider.status !== "blocked";
  const isEnabled = provider.enabled ?? provider.status === "connected";
  const actionsEnabled = provider.actionsEnabled ?? false;
  return (
    <section className="rounded-lg border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_9%)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[hsl(220_9%_88%)]">{provider.name}</h2>
          <p className="mt-1 text-xs leading-relaxed text-[hsl(220_9%_42%)]">{provider.description}</p>
        </div>
        <span
          className="rounded px-2 py-1 text-xs font-semibold"
          style={{ color: statusColor(provider.status), backgroundColor: "hsl(220 13% 12%)" }}
        >
          {statusLabel(provider.status)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-[hsl(220_9%_34%)]">Last Sync</dt>
          <dd className="text-right text-[hsl(220_9%_66%)]">{provider.lastSync}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[hsl(220_9%_34%)]">Scopes Granted</dt>
          <dd className="max-w-64 text-right text-[hsl(220_9%_66%)]">
            {provider.scopes.length > 0 ? provider.scopes.join(", ") : "None"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[hsl(220_9%_34%)]">Enabled</dt>
          <dd className="text-right text-[hsl(220_9%_66%)]">
            {isEnabled ? "Yes" : "No"}
          </dd>
        </div>
      </dl>

      {provider.blockedReason && (
        <p className="mt-4 rounded border border-[hsl(38_90%_45%/0.28)] bg-[hsl(38_90%_45%/0.08)] px-3 py-2 text-xs leading-relaxed text-[hsl(38_80%_66%)]">
          {provider.blockedReason}
        </p>
      )}

      {provider.actionProvider ? (
        <IntegrationActions
          provider={provider.actionProvider}
          connectHref={provider.connectHref}
          connected={provider.status === "connected"}
          enabled={isEnabled}
          actionsEnabled={actionsEnabled}
        />
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {canConnect ? (
            <Link
              href={provider.connectHref!}
              className="rounded border border-[hsl(213_94%_62%/0.3)] bg-[hsl(213_94%_62%/0.1)] px-3 py-2 text-xs font-semibold text-[hsl(213_94%_68%)]"
            >
              {provider.connectLabel ?? (provider.status === "connected" ? "Reconnect" : "Connect")}
            </Link>
          ) : (
            <button disabled className="rounded border border-[hsl(220_13%_18%)] px-3 py-2 text-xs font-semibold text-[hsl(220_9%_32%)]">
              Connect unavailable
            </button>
          )}
          <button disabled className="rounded border border-[hsl(220_13%_18%)] px-3 py-2 text-xs font-semibold text-[hsl(220_9%_32%)]">
            Disconnect
          </button>
          <button disabled className="rounded border border-[hsl(220_13%_18%)] px-3 py-2 text-xs font-semibold text-[hsl(220_9%_32%)]">
            Refresh Connection
          </button>
          <button disabled className="rounded border border-[hsl(220_13%_18%)] px-3 py-2 text-xs font-semibold text-[hsl(220_9%_32%)]">
            Enable / Disable
          </button>
        </div>
      )}
    </section>
  );
}

export default async function IntegrationsPage() {
  const user = await getCurrentUser();
  const [statuses, oauthConfig, schema] = await Promise.all([
    user ? actionGetAllIntegrationStatuses() : Promise.resolve(null),
    actionGetOAuthConfig(),
    getSchemaReadiness(),
  ]);
  const google = statuses?.google;
  const github = statuses?.github;
  const vercel = statuses?.vercel;
  const webflow = statuses?.webflow;
  const supabase = statuses?.supabase;
  const youtube = statuses?.youtube;
  const tiktok = statuses?.tiktok;
  const instagram = statuses?.instagram;
  const facebook = statuses?.facebook;
  const x = statuses?.x;
  const linkedin = statuses?.linkedin;
  const integrationTablesReady = schema.tables
    .filter((table) => table.table.startsWith("integration_") || table.table === "user_integrations")
    .every((table) => table.ready);

  const providers: ProviderCard[] = [
    {
      id: "vercel",
      name: "Vercel",
      description: "Deployment account connection for generated project publishing.",
      status: vercel?.connected ? "connected" : "disconnected",
      lastSync: vercel?.connectedAt ? new Date(vercel.connectedAt).toLocaleString() : "Never",
      scopes: vercel?.scopes ?? [],
      enabled: vercel?.enabled ?? vercel?.connected ?? false,
      connectHref: "/dashboard/deployments",
    },
    {
      id: "github",
      name: "GitHub",
      description: "Repository/account linking for generated project assets.",
      status: github?.connected ? "connected" : "disconnected",
      lastSync: github?.connectedAt ? new Date(github.connectedAt).toLocaleString() : "Never",
      scopes: github?.scopes ?? [],
      connectHref: oauthConfig.github ? "/api/auth/github" : undefined,
      enabled: github?.enabled ?? github?.connected ?? false,
      actionsEnabled: integrationTablesReady,
      actionProvider: "github",
    },
    {
      id: "webflow",
      name: "Webflow",
      description: "Website publishing account connection for Webflow sites.",
      status: webflow?.connected ? "connected" : oauthConfig.webflow ? "disconnected" : "blocked",
      lastSync: webflow?.connectedAt ? new Date(webflow.connectedAt).toLocaleString() : "Never",
      scopes: webflow?.scopes ?? [],
      connectHref: oauthConfig.webflow ? "/api/auth/webflow" : undefined,
      enabled: webflow?.enabled ?? webflow?.connected ?? false,
      actionsEnabled: integrationTablesReady && oauthConfig.webflow,
      actionProvider: "webflow",
      blockedReason: webflow?.storageWarning ?? (oauthConfig.webflow ? undefined : "Webflow OAuth is not configured yet. Add WEBFLOW_CLIENT_ID and WEBFLOW_CLIENT_SECRET in Vercel."),
    },
    socialProviderCard({
      id: "youtube",
      name: "YouTube",
      description: "Channel/account read access for launch and content workflows.",
      status: youtube,
      configured: oauthConfig.youtube,
      storageReady: integrationTablesReady,
    }),
    socialProviderCard({
      id: "tiktok",
      name: "TikTok",
      description: "Creator account linking for TikTok launch workflows.",
      status: tiktok,
      configured: oauthConfig.tiktok,
      storageReady: integrationTablesReady,
    }),
    socialProviderCard({
      id: "instagram",
      name: "Instagram",
      description: "Professional account linking through Meta Graph API.",
      status: instagram,
      configured: oauthConfig.instagram,
      storageReady: integrationTablesReady,
    }),
    socialProviderCard({
      id: "facebook",
      name: "Facebook",
      description: "Page/community account linking through Meta Graph API.",
      status: facebook,
      configured: oauthConfig.facebook,
      storageReady: integrationTablesReady,
    }),
    socialProviderCard({
      id: "x",
      name: "X / Twitter",
      description: "Account linking for launch-post workflows.",
      status: x,
      configured: oauthConfig.x,
      storageReady: integrationTablesReady,
    }),
    socialProviderCard({
      id: "linkedin",
      name: "LinkedIn",
      description: "B2B account linking for launch and founder updates.",
      status: linkedin,
      configured: oauthConfig.linkedin,
      storageReady: integrationTablesReady,
    }),
    {
      id: "google",
      name: "Google",
      description: "Google account linking for Workspace and YouTube-capable scopes.",
      status: google?.connected ? "connected" : "disconnected",
      lastSync: google?.lastSyncAt ? new Date(google.lastSyncAt).toLocaleString() : google?.connectedAt ? new Date(google.connectedAt).toLocaleString() : "Never",
      scopes: google?.scopes ?? [],
      connectHref: oauthConfig.google ? "/api/auth/google" : "https://console.cloud.google.com/apis/credentials",
      connectLabel: oauthConfig.google ? undefined : "Setup app",
      enabled: google?.enabled ?? google?.connected ?? false,
      actionsEnabled: integrationTablesReady && oauthConfig.google,
      actionProvider: oauthConfig.google ? "google" : undefined,
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Database and project API connection for LaunchForge persistence.",
      status: supabase?.connected ? "connected" : "disconnected",
      lastSync: supabase?.connectedAt ? new Date(supabase.connectedAt).toLocaleString() : "Environment configured",
      scopes: supabase?.scopes ?? [],
      enabled: supabase?.enabled ?? Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      connectHref: "/dashboard/deployments",
    },
    {
      id: "supabase_auth",
      name: "Supabase Auth",
      description: "Primary customer authentication and session provider.",
      status: user ? "connected" : "disconnected",
      lastSync: user ? "Current session" : "Never",
      scopes: user ? ["authenticated user session"] : [],
      blockedReason: user ? undefined : "Sign in to verify Supabase Auth session state.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-[hsl(220_9%_92%)]">Integrations</h1>
        <p className="mt-1 text-sm text-[hsl(220_9%_42%)]">
          Account linking status for supported production providers. Stripe is excluded from this pass.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} provider={provider} />
        ))}
      </div>
    </main>
  );
}

function socialProviderCard({
  id,
  name,
  description,
  status,
  configured,
  storageReady,
}: {
  id: "youtube" | "tiktok" | "instagram" | "facebook" | "x" | "linkedin";
  name: string;
  description: string;
  status: { connected: boolean; connectedAt?: string; lastSyncAt?: string | null; scopes?: string[]; enabled?: boolean; storageWarning?: string } | undefined;
  configured: boolean;
  storageReady: boolean;
}): ProviderCard {
  const config = getSocialOAuthConfig(id);
  const connected = Boolean(status?.connected);
  const setupHref = config?.setupUrl ?? "/dashboard/integrations";
  return {
    id,
    name,
    description,
    status: connected ? "connected" : "disconnected",
    lastSync: status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : status?.connectedAt ? new Date(status.connectedAt).toLocaleString() : "Never",
    scopes: status?.scopes ?? [],
    connectHref: configured ? `/api/auth/${id}` : setupHref,
    connectLabel: configured ? undefined : "Setup app",
    enabled: status?.enabled ?? connected,
    actionsEnabled: configured && storageReady,
    actionProvider: configured ? id : undefined,
  };
}
