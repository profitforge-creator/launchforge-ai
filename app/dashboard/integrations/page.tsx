import Link from "next/link";
import { actionGetAllIntegrationStatuses } from "@/app/actions/integrations";
import { IntegrationActions } from "./integration-actions";
import { getCurrentUser } from "@/lib/auth/session";
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
              {provider.status === "connected" ? "Reconnect" : "Connect"}
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
  const statuses = user ? await actionGetAllIntegrationStatuses() : null;
  const google = statuses?.google;
  const github = statuses?.github;

  const providers: ProviderCard[] = [
    {
      id: "google",
      name: "Google",
      description: "Google sign-in status and planned Workspace linking.",
      status: google?.connected ? "connected" : google?.enabled === false ? "disconnected" : "disconnected",
      lastSync: google?.lastSyncAt ? new Date(google.lastSyncAt).toLocaleString() : google?.connectedAt ? new Date(google.connectedAt).toLocaleString() : "Never",
      scopes: google?.scopes ?? [],
      connectHref: "/api/auth/google",
      enabled: google?.enabled ?? google?.connected ?? false,
      actionsEnabled: true,
      actionProvider: "google",
      blockedReason: google?.storageWarning ?? "Production use requires Google provider configuration, approved redirect URLs, migration 004, and encrypted token storage.",
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Planned YouTube channel/account read access. Not available in this build.",
      status: "not-started",
      lastSync: "Never",
      scopes: [],
      blockedReason: "Requires Google OAuth scopes, app verification planning, token refresh, and per-user storage.",
    },
    {
      id: "tiktok",
      name: "TikTok",
      description: "Planned TikTok creator account linking. Not available in this build.",
      status: "not-started",
      lastSync: "Never",
      scopes: [],
      blockedReason: "Requires TikTok app approval, static HTTPS callback, refresh token handling, and per-user storage.",
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Planned Instagram professional account linking through Meta Graph API. Not available in this build.",
      status: "not-started",
      lastSync: "Never",
      scopes: [],
      blockedReason: "Requires Meta app review, Facebook Page linkage, requested permissions, and per-user storage.",
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Planned Facebook Page/community account linking through Meta Graph API. Not available in this build.",
      status: "not-started",
      lastSync: "Never",
      scopes: [],
      blockedReason: "Requires Meta permissions, app review, data deletion URL, and per-user storage.",
    },
    {
      id: "x",
      name: "X / Twitter",
      description: "Planned X/Twitter account linking for launch-post workflows. Not available in this build.",
      status: "not-started",
      lastSync: "Never",
      scopes: [],
      blockedReason: "Requires X API tier access, PKCE, offline access scope, and per-user storage.",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Planned LinkedIn account linking for B2B launch workflows. Not available in this build.",
      status: "not-started",
      lastSync: "Never",
      scopes: [],
      blockedReason: "Requires LinkedIn app products, approved scopes, refresh handling, and per-user storage.",
    },
    {
      id: "github",
      name: "GitHub",
      description: "Repository/account linking for generated project assets.",
      status: github?.connected ? "connected" : "disconnected",
      lastSync: github?.connectedAt ? new Date(github.connectedAt).toLocaleString() : "Never",
      scopes: github?.scopes ?? [],
      connectHref: "/api/auth/github",
      blockedReason: github?.connected
        ? "Stored in per-user integration storage. Verify migration 004, RLS isolation, and token refresh before production."
        : "OAuth route exists, but production requires migration 004 database-backed token storage before real customer use.",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Excluded from this production-prep pass.",
      status: "blocked",
      lastSync: "Excluded",
      scopes: [],
      blockedReason: "Stripe is intentionally not being implemented or changed in this pass.",
    },
    {
      id: "supabase_auth",
      name: "Supabase Auth",
      description: "Primary customer authentication and session provider.",
      status: user ? "connected" : "disconnected",
      lastSync: user ? "Current session" : "Never",
      scopes: user ? ["authenticated user session"] : [],
      blockedReason: "Provider OAuth sign-in still depends on Supabase dashboard redirect/provider configuration.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-[hsl(220_9%_92%)]">Integrations</h1>
        <p className="mt-1 text-sm text-[hsl(220_9%_42%)]">
          Per-user account linking status. Production token storage is blocked until migration 004 is approved and wired.
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
