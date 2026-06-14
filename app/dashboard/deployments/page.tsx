"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { actionGetProjectList, type ProjectListItem } from "@/app/actions/analytics";
import { actionGetDeployments, type DeploymentRecord } from "@/app/actions/deployments";
import {
  actionCreateProject,
  actionGetLFProjects,
  actionDeleteLFProject,
  type LFProject,
  type CreateProjectStep,
} from "@/app/actions/projects";
import {
  actionConnectVercel,
  actionConnectGitHub,
  actionConnectWebflow,
  actionConnectStripe,
  actionConnectSupabase,
  actionDisconnectIntegration,
  actionGetAllIntegrationStatuses,
  actionGetOAuthConfig,
  actionGetEnvDiagnostics,
  actionValidateVercelEnv,
  actionTestGitHubOAuth,
  actionValidateSupabaseEnv,
  actionValidateStripeEnv,
} from "@/app/actions/integrations";
import type { IntegrationKey, IntegrationStatus, ConnectResult } from "@/lib/storage/integration-store";

type OAuthConfig = { github: boolean; stripe: boolean; webflow: boolean };
type EnvDiagnostics = Awaited<ReturnType<typeof actionGetEnvDiagnostics>>;

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProjectWithDeploy extends ProjectListItem {
  deploy: DeploymentRecord | null;
}

type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface PlatformUIState {
  state: ConnectionState;
  status: IntegrationStatus;
  error: string | null;
  showForm: boolean;
  showManage: boolean;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPlus() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}
function IconExternal() {
  return <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;
}
function IconGlobe() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
}
function IconActivity() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>;
}
function IconCloud() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095H6.75z" /></svg>;
}
function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return formatDate(iso);
}

// ── New Project Modal ─────────────────────────────────────────────────────────

function StepIcon({ status }: { status: CreateProjectStep["status"] }) {
  if (status === "done")    return <span style={{ color: "hsl(151 60% 50%)" }}>✓</span>;
  if (status === "error")   return <span style={{ color: "hsl(0 70% 55%)" }}>✗</span>;
  if (status === "skipped") return <span style={{ color: "hsl(220 9% 36%)" }}>—</span>;
  return <span style={{ color: "hsl(220 9% 36%)" }}>·</span>;
}

function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: LFProject) => void;
}) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy]               = useState(false);
  const [steps, setSteps]             = useState<CreateProjectStep[] | null>(null);
  const [done, setDone]               = useState<LFProject | null>(null);
  const [fatalError, setFatalError]   = useState<string | null>(null);
  const [allowExternal, setAllowExternal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setFatalError(null);
    try {
      const confirmedExternal = allowExternal
        ? window.confirm("This will create external GitHub, Vercel, and Stripe resources using connected accounts. Continue?")
        : false;
      if (allowExternal && !confirmedExternal) {
        setBusy(false);
        return;
      }
      const result = await actionCreateProject(name.trim(), description.trim() || undefined, confirmedExternal);
      setSteps(result.steps);
      if (result.project) {
        setDone(result.project);
        onCreated(result.project);
      }
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : "Unexpected error — check server logs.");
    } finally {
      setBusy(false);
    }
  }

  const supabaseRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  const supabaseDashUrl = supabaseRef ? `https://supabase.com/dashboard/project/${supabaseRef}` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 18%)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>New Project</h2>
          <button
            onClick={onClose}
            className="text-xs opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: "hsl(220 9% 60%)" }}
          >✕</button>
        </div>

        {!steps && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(220 9% 52%)" }}>
                Project name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My SaaS App"
                required
                autoFocus
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "hsl(220 13% 9%)",
                  border: "1px solid hsl(220 13% 20%)",
                  color: "hsl(220 9% 88%)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(220 9% 52%)" }}>
                Description <span style={{ color: "hsl(220 9% 32%)" }}>(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this project do?"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "hsl(220 13% 9%)",
                  border: "1px solid hsl(220 13% 20%)",
                  color: "hsl(220 9% 88%)",
                }}
              />
            </div>
            <label className="flex items-start gap-2 rounded-lg p-3" style={{ backgroundColor: "hsl(220 13% 9%)", border: "1px solid hsl(220 13% 18%)" }}>
              <input
                type="checkbox"
                checked={allowExternal}
                onChange={(e) => setAllowExternal(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-xs" style={{ color: "hsl(220 9% 42%)", lineHeight: 1.5 }}>
                Also create external GitHub, Vercel, and Stripe resources. You will be asked to confirm before anything external is created.
              </span>
            </label>
            {fatalError && (
              <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "hsl(0 60% 12%)", color: "hsl(0 70% 58%)", border: "1px solid hsl(0 60% 24%)" }}>
                {fatalError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 52%)", border: "1px solid hsl(220 13% 20%)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="flex-1 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: "hsl(213 94% 62% / 0.15)", color: "hsl(213 94% 65%)", border: "1px solid hsl(213 94% 62% / 0.3)", opacity: busy || !name.trim() ? 0.5 : 1 }}
              >
                {busy ? <><Spinner /> Setting up…</> : "Create Project"}
              </button>
            </div>
          </form>
        )}

        {steps && (
          <div className="space-y-3">
            <div className="space-y-2">
              {steps.map((s) => (
                <div key={s.key} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ backgroundColor: "hsl(220 13% 9%)" }}>
                  <span className="text-sm font-bold w-4 shrink-0 mt-px"><StepIcon status={s.status} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: "hsl(220 9% 78%)" }}>{s.label}</p>
                    {s.detail && <p className="text-xs mt-0.5 truncate" style={{ color: s.status === "error" ? "hsl(0 70% 55%)" : "hsl(220 9% 38%)" }}>{s.detail}</p>}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs mt-0.5" style={{ color: "hsl(213 94% 62%)" }}>
                        Open <IconExternal />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {supabaseDashUrl && done && (
                <div className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ backgroundColor: "hsl(220 13% 9%)" }}>
                  <span className="text-sm font-bold w-4 shrink-0 mt-px" style={{ color: "hsl(151 60% 50%)" }}>✓</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: "hsl(220 9% 78%)" }}>Saved to Supabase</p>
                    <a href={supabaseDashUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs mt-0.5" style={{ color: "hsl(213 94% 62%)" }}>
                      Open project <IconExternal />
                    </a>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full h-9 rounded-lg text-xs font-medium mt-2"
              style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 60%)", border: "1px solid hsl(220 13% 20%)" }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LF Projects section ───────────────────────────────────────────────────────

function ExternalButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md text-xs font-medium transition-colors"
      style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 52%)", border: "1px solid hsl(220 13% 20%)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 80%)"; (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 30%)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 52%)"; (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 20%)"; }}
    >
      {label} <IconExternal />
    </a>
  );
}

function LFProjectsSection({
  projects,
  onNewProject,
  onDelete,
}: {
  projects: LFProject[];
  onNewProject: () => void;
  onDelete: (id: string) => void;
}) {
  const supabaseRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  const supabaseDashUrl = supabaseRef ? `https://supabase.com/dashboard/project/${supabaseRef}` : null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 78%)" }}>Projects</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
            {projects.length === 0 ? "No projects yet." : `${projects.length} project${projects.length === 1 ? "" : "s"} — GitHub, Vercel, Stripe provisioned automatically.`}
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.25)", color: "hsl(213 94% 65%)" }}
        >
          <IconPlus /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div
          className="rounded-xl px-8 py-10 text-center"
          style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 14%)", borderStyle: "dashed" }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 52%)" }}>No projects yet</p>
          <p className="text-xs mb-4" style={{ color: "hsl(220 9% 32%)", lineHeight: 1.6 }}>
            Click "New Project" to create a GitHub repo, Vercel project, and Stripe product in one step.
          </p>
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.25)", color: "hsl(213 94% 65%)" }}
          >
            <IconPlus /> New Project
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          {projects.map((p, i) => (
            <div
              key={p.id}
              className="px-4 py-4"
              style={{ backgroundColor: "hsl(220 14% 9%)", borderBottom: i < projects.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate" style={{ color: "hsl(220 9% 86%)" }}>{p.name}</p>
                    <span
                      className="inline-flex items-center gap-1 text-xs px-1.5 py-px rounded-full font-medium shrink-0"
                      style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 50%)", border: "1px solid hsl(151 60% 48% / 0.2)" }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "hsl(151 60% 50%)" }} />
                      {p.status}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-xs mb-2 truncate" style={{ color: "hsl(220 9% 38%)" }}>{p.description}</p>
                  )}
                  <p className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(p.id)}
                  className="shrink-0 text-xs opacity-30 hover:opacity-70 transition-opacity pt-0.5"
                  title="Delete project record"
                  style={{ color: "hsl(220 9% 52%)" }}
                >✕</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.github_repo_url    && <ExternalButton href={p.github_repo_url}    label="GitHub" />}
                {p.vercel_project_url && <ExternalButton href={p.vercel_project_url} label="Vercel" />}
                {supabaseDashUrl      && <ExternalButton href={supabaseDashUrl}       label="Supabase" />}
                {p.stripe_dashboard_url && <ExternalButton href={p.stripe_dashboard_url} label="Stripe" />}
                {!p.github_repo_url && !p.vercel_project_url && !p.stripe_dashboard_url && (
                  <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>No external resources provisioned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Platform metadata ─────────────────────────────────────────────────────────

const PLATFORM_META: Record<IntegrationKey, {
  name: string;
  abbr: string;
  abbrbg: string;
  abbrfg: string;
  desc: string;
  tokenLabel: string;
  placeholder: string;
  tokenHint: string;
  tokenUrl: string;
}> = {
  vercel: {
    name: "Vercel",
    abbr: "▲",
    abbrbg: "hsl(220 9% 18%)",
    abbrfg: "hsl(220 9% 88%)",
    desc: "Deploy generated websites, track builds, and manage domains.",
    tokenLabel: "API Token",
    placeholder: "vercel_pat_...",
    tokenHint: "Account Settings → Tokens → Create",
    tokenUrl: "https://vercel.com/account/tokens",
  },
  github: {
    name: "GitHub",
    abbr: "GH",
    abbrbg: "hsl(220 13% 17%)",
    abbrfg: "hsl(220 9% 70%)",
    desc: "Push generated websites and code to your repositories.",
    tokenLabel: "Personal Access Token",
    placeholder: "ghp_...",
    tokenHint: "Settings → Developer settings → Personal access tokens",
    tokenUrl: "https://github.com/settings/tokens",
  },
  webflow: {
    name: "Webflow",
    abbr: "W",
    abbrbg: "hsl(210 55% 15%)",
    abbrfg: "hsl(210 75% 62%)",
    desc: "Publish generated pages directly into Webflow projects.",
    tokenLabel: "API Token",
    placeholder: "...",
    tokenHint: "Account Settings → API Access → Generate API Token",
    tokenUrl: "https://webflow.com/dashboard/account/general",
  },
  stripe: {
    name: "Stripe",
    abbr: "S",
    abbrbg: "hsl(234 55% 15%)",
    abbrfg: "hsl(234 70% 68%)",
    desc: "Connect Stripe to handle payments for generated products.",
    tokenLabel: "Secret Key",
    placeholder: "sk_live_... or sk_test_...",
    tokenHint: "Dashboard → Developers → API Keys → Secret key",
    tokenUrl: "https://dashboard.stripe.com/apikeys",
  },
  supabase: {
    name: "Supabase",
    abbr: "SB",
    abbrbg: "hsl(153 50% 12%)",
    abbrfg: "hsl(153 65% 50%)",
    desc: "Connect your Supabase project for generated SaaS databases.",
    tokenLabel: "Personal Access Token",
    placeholder: "sbp_...",
    tokenHint: "Dashboard → Account → Access Tokens → Generate new token",
    tokenUrl: "https://supabase.com/dashboard/account/tokens",
  },
};

const PLATFORM_KEYS: IntegrationKey[] = ["vercel", "github", "webflow", "stripe", "supabase"];

// ── Stats row ─────────────────────────────────────────────────────────────────

function StatsGrid({
  projects,
  integrations,
}: {
  projects: ProjectWithDeploy[];
  integrations: Record<IntegrationKey, IntegrationStatus>;
}) {
  const deployed      = projects.filter((p) => !!p.deploy).length;
  const connected     = PLATFORM_KEYS.filter((k) => integrations[k]?.connected).length;
  const readyToDeploy = projects.filter((p) => p.hasWebsite && !p.deploy).length;
  const domains       = projects.filter((p) => !!p.deploy?.domain).length;

  const stats = [
    { label: "Deployments",        value: deployed,      sub: "live projects"      },
    { label: "Connected Platforms", value: connected,     sub: `of ${PLATFORM_KEYS.length} available`   },
    { label: "Projects Ready",      value: readyToDeploy, sub: "ready to deploy"    },
    { label: "Domains Connected",   value: domains,       sub: "custom domains"     },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl px-4 py-4 transition-colors"
          style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 15%)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 20%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 15%)"; }}
        >
          <p
            className="text-2xl font-semibold tabular-nums mb-0.5"
            style={{ color: s.value > 0 ? "hsl(220 9% 88%)" : "hsl(220 9% 40%)", letterSpacing: "-0.02em" }}
          >
            {s.value}
          </p>
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 44%)" }}>{s.label}</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 28%)" }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Connect form ──────────────────────────────────────────────────────────────

function ConnectForm({
  service,
  meta,
  onConnect,
  onCancel,
  loading,
  error,
}: {
  service: IntegrationKey;
  meta: typeof PLATFORM_META[IntegrationKey];
  onConnect: (value: string, extra?: string) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() && !loading) onConnect(value.trim());
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div
        className="rounded-lg px-3 py-2.5 text-xs"
        style={{ backgroundColor: "hsl(213 94% 62% / 0.06)", border: "1px solid hsl(213 94% 62% / 0.15)", color: "hsl(213 94% 65%)" }}
      >
        Tokens are validated against the {meta.name} API and stored server-side. Never committed to source control.
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs" style={{ color: "hsl(220 9% 44%)" }}>{meta.tokenLabel}</label>
          <a
            href={meta.tokenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-0.5 transition-colors"
            style={{ color: "hsl(213 94% 56%)" }}
          >
            Get token <IconExternal />
          </a>
        </div>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={meta.placeholder}
          autoFocus
          autoComplete="off"
          className="w-full h-8 px-3 rounded-lg text-xs outline-none font-mono"
          style={{
            backgroundColor: "hsl(220 13% 10%)",
            border: `1px solid ${error ? "hsl(0 60% 36%)" : "hsl(220 13% 22%)"}`,
            color: "hsl(220 9% 72%)",
          }}
        />
        <p className="text-xs mt-1" style={{ color: "hsl(220 9% 30%)" }}>{meta.tokenHint}</p>
      </div>

      {error && (
        <div
          className="rounded-lg px-3 py-2.5 text-xs"
          style={{ backgroundColor: "hsl(0 60% 12%)", border: "1px solid hsl(0 60% 24%)", color: "hsl(0 70% 58%)" }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="h-7 px-3 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
          style={{ backgroundColor: "hsl(220 9% 92%)", color: "hsl(220 14% 8%)" }}
        >
          {loading && <Spinner />}
          {loading ? "Connecting…" : `Connect ${meta.name}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-7 px-3 rounded-lg text-xs font-medium disabled:opacity-50"
          style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 19%)", color: "hsl(220 9% 44%)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Platform card ─────────────────────────────────────────────────────────────

const NOT_CONFIGURED_HINTS: Record<IntegrationKey, string> = {
  vercel:   "Set VERCEL_TOKEN in your server environment.",
  github:   "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable GitHub OAuth.",
  stripe:   "Set STRIPE_SECRET_KEY (billing) or STRIPE_CLIENT_ID (Connect) in environment.",
  supabase: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.",
  webflow:  "Set WEBFLOW_CLIENT_ID and WEBFLOW_CLIENT_SECRET to enable Webflow OAuth.",
};

function PlatformCard({
  id,
  ui,
  oauthPath,
  oauthConfigured,
  onConnect,
  onDisconnect,
  onShowForm,
  onHideForm,
  onShowManage,
  onHideManage,
  onTestConnection,
}: {
  id: IntegrationKey;
  ui: PlatformUIState;
  oauthPath?: string;
  oauthConfigured?: boolean;
  onConnect: (id: IntegrationKey, token: string) => Promise<void>;
  onDisconnect: (id: IntegrationKey) => Promise<void>;
  onShowForm: (id: IntegrationKey) => void;
  onHideForm: (id: IntegrationKey) => void;
  onShowManage: (id: IntegrationKey) => void;
  onHideManage: (id: IntegrationKey) => void;
  onTestConnection: (id: IntegrationKey) => Promise<void>;
}) {
  const meta = PLATFORM_META[id];
  const { state, status, error, showForm, showManage } = ui;
  const isConnected   = state === "connected" || (state === "idle" && status.connected);
  const isConnecting  = state === "connecting";
  const isEnvSource   = status.source === "env";
  const isVerifying   = isConnecting && isEnvSource;
  // Show test/retry button for any env-sourced platform that isn't connected yet
  // (Vercel & GitHub: user-triggered; Supabase & Stripe: also shows as retry after error)
  const needsTestBtn  = isEnvSource && !isConnecting && !isConnected;

  const borderColor = isConnected
    ? "hsl(151 60% 48% / 0.2)"
    : state === "error"
    ? "hsl(0 60% 36%)"
    : "hsl(220 13% 15%)";

  const bgColor = isConnected
    ? "hsl(151 60% 48% / 0.03)"
    : "hsl(220 13% 11%)";

  return (
    <div
      className="rounded-xl p-5 flex flex-col transition-all"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: meta.abbrbg, color: meta.abbrfg }}
        >
          {meta.abbr}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 84%)" }}>{meta.name}</p>
            {isConnected && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 52%)", border: "1px solid hsl(151 60% 48% / 0.2)" }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
                Connected
              </span>
            )}
            {isConnecting && (
              <span className="inline-flex items-center gap-1 text-xs" style={{ color: "hsl(213 94% 62%)" }}>
                <Spinner /> {isVerifying ? "Verifying…" : "Connecting…"}
              </span>
            )}
          </div>
          <p className="text-xs leading-snug" style={{ color: "hsl(220 9% 36%)", lineHeight: 1.5 }}>
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Connected metadata */}
      {isConnected && status.metadata && (
        <div
          className="rounded-lg px-3 py-2.5 mb-3 space-y-1"
          style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}
        >
          {status.metadata.name && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Account</span>
              <span className="text-xs font-medium" style={{ color: "hsl(220 9% 60%)" }}>{status.metadata.name}</span>
            </div>
          )}
          {status.metadata.username && status.metadata.username !== status.metadata.name && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Username</span>
              <span className="text-xs font-mono" style={{ color: "hsl(220 9% 52%)" }}>@{status.metadata.username}</span>
            </div>
          )}
          {status.metadata.email && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Email</span>
              <span className="text-xs" style={{ color: "hsl(220 9% 50%)" }}>{status.metadata.email}</span>
            </div>
          )}
          {status.metadata.teamName && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Team</span>
              <span className="text-xs font-medium" style={{ color: "hsl(220 9% 56%)" }}>{status.metadata.teamName}</span>
            </div>
          )}
          {typeof status.metadata.deploymentCount === "number" && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Deployments</span>
              <span className="text-xs font-medium tabular-nums" style={{ color: "hsl(220 9% 56%)" }}>{status.metadata.deploymentCount}</span>
            </div>
          )}
          {typeof status.metadata.projectCount === "number" && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Projects</span>
              <span className="text-xs font-medium tabular-nums" style={{ color: "hsl(220 9% 56%)" }}>{status.metadata.projectCount}</span>
            </div>
          )}
          {status.metadata.projectRef && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Project Ref</span>
              <span className="text-xs font-mono" style={{ color: "hsl(220 9% 52%)" }}>{status.metadata.projectRef}</span>
            </div>
          )}
          {typeof status.metadata.repoCount === "number" && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Repositories</span>
              <span className="text-xs font-medium tabular-nums" style={{ color: "hsl(220 9% 56%)" }}>{status.metadata.repoCount}</span>
            </div>
          )}
          {typeof status.metadata.siteCount === "number" && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Sites</span>
              <span className="text-xs font-medium tabular-nums" style={{ color: "hsl(220 9% 56%)" }}>{status.metadata.siteCount}</span>
            </div>
          )}
          {status.metadata.mode && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Mode</span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                style={{
                  backgroundColor: status.metadata.mode === "live" ? "hsl(151 60% 48% / 0.1)" : "hsl(38 90% 55% / 0.1)",
                  color: status.metadata.mode === "live" ? "hsl(151 60% 50%)" : "hsl(38 90% 60%)",
                }}
              >
                {status.metadata.mode === "live" ? "Live" : "Test"}
              </span>
            </div>
          )}
          {status.metadata.country && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Country</span>
              <span className="text-xs" style={{ color: "hsl(220 9% 52%)" }}>{status.metadata.country.toUpperCase()}</span>
            </div>
          )}
          {status.connectedAt && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Connected</span>
              <span className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>{formatRelative(status.connectedAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Error from validation */}
      {state === "error" && error && (
        <div
          className="rounded-lg px-3 py-2 mb-3 text-xs"
          style={{ backgroundColor: "hsl(0 60% 12%)", border: "1px solid hsl(0 60% 24%)", color: "hsl(0 70% 58%)" }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      {/* ENV-sourced + fully verified: read-only note */}
      {isEnvSource && isConnected && !needsTestBtn && !isVerifying && (
        <div
          className="mt-auto rounded-lg px-3 py-2 text-xs"
          style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 36%)" }}
        >
          Connected via environment variable — managed in server config.
        </div>
      )}

      {/* ENV-sourced + needs test button (Vercel or GitHub) */}
      {needsTestBtn && (
        <div className="mt-auto space-y-2">
          <div
            className="rounded-lg px-3 py-2 text-xs"
            style={{ backgroundColor: "hsl(213 94% 62% / 0.06)", border: "1px solid hsl(213 94% 62% / 0.15)", color: "hsl(213 94% 62%)" }}
          >
            {id === "vercel"   && "Vercel token configured via environment variable."}
            {id === "github"   && "GitHub OAuth credentials configured via environment variable."}
            {id === "supabase" && "Supabase credentials configured via environment variable."}
            {id === "stripe"   && "Stripe key configured via environment variable."}
          </div>
          <button
            onClick={() => onTestConnection(id)}
            className="w-full h-8 rounded-lg text-xs font-medium transition-all"
            style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 20%)", color: "hsl(220 9% 60%)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 18%)"; (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 78%)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 14%)"; (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 60%)"; }}
          >
            {state === "error" ? `Retry ${meta.name} connection` : `Test ${meta.name} connection`}
          </button>
        </div>
      )}

      {/* Not connected + not env-sourced: OAuth redirect or "not configured" info */}
      {!isConnected && !isEnvSource && (
        <div className="mt-auto">
          {oauthPath && oauthConfigured ? (
            // Real OAuth — full-page redirect to provider authorization screen
            <a
              href={oauthPath}
              className="w-full h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.25)", color: "hsl(213 94% 65%)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(213 94% 62% / 0.18)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(213 94% 62% / 0.1)"; }}
            >
              Connect with {meta.name}
              <IconExternal />
            </a>
          ) : (
            // Not configured — show env var hint instead of a broken redirect or token form
            <div
              className="rounded-lg px-3 py-2.5 text-xs space-y-0.5"
              style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 18%)" }}
            >
              <p className="font-medium" style={{ color: "hsl(220 9% 44%)" }}>Not configured</p>
              <p style={{ color: "hsl(220 9% 30%)" }}>{NOT_CONFIGURED_HINTS[id]}</p>
            </div>
          )}
        </div>
      )}

      {isConnected && !isEnvSource && !showManage && (
        <button
          onClick={() => onShowManage(id)}
          className="mt-auto h-8 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 40%)" }}
        >
          Manage Connection
        </button>
      )}

      {isConnected && !isEnvSource && showManage && (
        <div className="mt-auto flex gap-2">
          <button
            onClick={async () => { await onDisconnect(id); onHideManage(id); }}
            className="flex-1 h-8 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "hsl(0 60% 12%)", border: "1px solid hsl(0 60% 20%)", color: "hsl(0 70% 58%)" }}
          >
            Disconnect
          </button>
          <button
            onClick={() => onHideManage(id)}
            className="h-8 px-3 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 19%)", color: "hsl(220 9% 36%)" }}
          >
            Cancel
          </button>
        </div>
      )}

      {showForm && !isConnected && (
        <ConnectForm
          service={id}
          meta={meta}
          onConnect={async (token) => { await onConnect(id, token); }}
          onCancel={() => onHideForm(id)}
          loading={isConnecting}
          error={error}
        />
      )}
    </div>
  );
}

// ── Deployments table ─────────────────────────────────────────────────────────

function DeploymentsTable({ projects }: { projects: ProjectWithDeploy[] }) {
  const deployed = projects.filter((p) => !!p.deploy);

  if (deployed.length === 0) {
    return (
      <div
        className="rounded-xl px-8 py-12 text-center"
        style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 14%)", borderStyle: "dashed" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 36%)" }}
        >
          <IconCloud />
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 62%)" }}>
          You're one deployment away from launching your first business.
        </p>
        <p className="text-xs mb-5" style={{ color: "hsl(220 9% 36%)", lineHeight: 1.6 }}>
          Open a workspace, go to the Launch tab, and enter your deployment URL after pushing your site live.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.25)", color: "hsl(213 94% 65%)" }}
        >
          <IconPlus />
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "hsl(220 13% 11%)", borderBottom: "1px solid hsl(220 13% 15%)" }}>
            {["Project", "Environment", "Status", "Date", "URL"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "hsl(220 9% 36%)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deployed.map((p, i) => (
            <tr
              key={p.id}
              style={{
                backgroundColor: "hsl(220 14% 9%)",
                borderBottom: i < deployed.length - 1 ? "1px solid hsl(220 13% 13%)" : "none",
              }}
            >
              <td className="px-4 py-3">
                <Link href={`/workspace/${p.id}`} className="text-xs font-medium transition-colors" style={{ color: "hsl(220 9% 78%)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 96%)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 78%)"; }}
                >
                  {p.name}
                </Link>
                <p className="text-xs mt-0.5 capitalize" style={{ color: "hsl(220 9% 30%)" }}>{p.type}</p>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs capitalize" style={{ color: "hsl(220 9% 44%)" }}>
                  {p.deploy?.environment ?? "manual"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 48%)", border: "1px solid hsl(151 60% 48% / 0.2)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
                  Live
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>
                  {p.deploy?.created_at ? formatDate(p.deploy.created_at) : "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                {p.deploy?.url ? (
                  <a
                    href={p.deploy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs transition-colors"
                    style={{ color: "hsl(213 94% 62%)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(213 94% 74%)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(213 94% 62%)"; }}
                  >
                    {(p.deploy.domain ?? p.deploy.url.replace(/^https?:\/\//, "").split("/")[0]).slice(0, 28)}
                    <IconExternal />
                  </a>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Domains section ───────────────────────────────────────────────────────────

function DomainsSection({ projects }: { projects: ProjectWithDeploy[] }) {
  const domains = projects.filter((p) => !!p.deploy?.domain);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 78%)" }}>Domains</h2>
        <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
          Custom domains connected via workspace Launch tabs
        </p>
      </div>

      {domains.length === 0 ? (
        <div
          className="rounded-xl px-6 py-8 text-center"
          style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 14%)", borderStyle: "dashed" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 36%)" }}>
            <IconGlobe />
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: "hsl(220 9% 55%)" }}>No domains connected yet</p>
          <p className="text-xs" style={{ color: "hsl(220 9% 32%)", lineHeight: 1.6 }}>
            Add a custom domain from any project's Launch tab.
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          {domains.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < domains.length - 1 ? "1px solid hsl(220 13% 13%)" : "none", backgroundColor: "hsl(220 14% 9%)" }}
            >
              <div className="flex items-center gap-2.5">
                <span style={{ color: "hsl(220 9% 36%)" }}><IconGlobe /></span>
                <div>
                  <p className="text-xs font-medium" style={{ color: "hsl(220 9% 70%)" }}>{p.deploy!.domain}</p>
                  <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>{p.name}</p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
                style={{ backgroundColor: "hsl(151 60% 48% / 0.08)", color: "hsl(151 60% 50%)" }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
                Active
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activity feed ─────────────────────────────────────────────────────────────

interface ActivityEvent {
  id: string;
  type: "deploy" | "domain" | "project" | "integration";
  label: string;
  description: string;
  timestamp: string;
}

function ActivityFeed({
  events,
}: {
  events: ActivityEvent[];
}) {
  const typeStyles: Record<ActivityEvent["type"], { dot: string; label: string }> = {
    deploy:      { dot: "hsl(151 60% 48%)", label: "hsl(151 60% 50%)" },
    domain:      { dot: "hsl(213 94% 62%)", label: "hsl(213 94% 65%)" },
    project:     { dot: "hsl(220 9% 45%)",  label: "hsl(220 9% 48%)"  },
    integration: { dot: "hsl(234 70% 62%)", label: "hsl(234 70% 65%)" },
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 78%)" }}>Activity</h2>
        <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>Recent deployment events</p>
      </div>

      {events.length === 0 ? (
        <div
          className="rounded-xl px-6 py-8 text-center"
          style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 14%)", borderStyle: "dashed" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 36%)" }}>
            <IconActivity />
          </div>
          <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((event, i) => {
            const style = typeStyles[event.type];
            const isLast = i === events.length - 1;
            return (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: style.dot }} />
                  {!isLast && <div className="w-px flex-1 mt-1" style={{ backgroundColor: "hsl(220 13% 15%)", minHeight: 16 }} />}
                </div>
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-medium" style={{ color: style.label }}>{event.label}</p>
                    <span className="text-xs shrink-0" style={{ color: "hsl(220 9% 28%)" }}>{formatRelative(event.timestamp)}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)", lineHeight: 1.5 }}>{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function makePlatformUI(status: IntegrationStatus): PlatformUIState {
  return {
    state: status.connected ? "connected" : "idle",
    status,
    error: null,
    showForm: false,
    showManage: false,
  };
}

// OAuth paths — platforms that use full OAuth redirect rather than a token form.
// Route handlers at these paths initiate the OAuth flow and handle the callback.
const OAUTH_PATHS: Partial<Record<IntegrationKey, string>> = {
  github:  "/api/auth/github",
  stripe:  "/api/auth/stripe",
  webflow: "/api/auth/webflow",
};

export default function DeploymentsPage() {
  const [projects,    setProjects]    = useState<ProjectWithDeploy[]>([]);
  const [lfProjects,  setLfProjects]  = useState<LFProject[]>([]);
  const [platforms,   setPlatforms]   = useState<Record<IntegrationKey, PlatformUIState> | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [oauthBanner,    setOauthBanner]    = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [oauthConfig,    setOauthConfig]    = useState<OAuthConfig>({ github: false, stripe: false, webflow: false });
  const [envDiagnostics, setEnvDiagnostics] = useState<EnvDiagnostics | null>(null);

  // Apply a ConnectResult to a platform slot
  function applyResult(key: IntegrationKey, result: ConnectResult) {
    setPlatforms((prev) => {
      if (!prev) return prev;
      if (result.success && result.status) {
        return { ...prev, [key]: { state: "connected", status: result.status, error: null, showForm: false, showManage: false } };
      }
      if (result.error) {
        // Validation ran but failed — stay in error state, preserve source so env-sourced cards keep their test button
        return { ...prev, [key]: { ...prev[key], state: "error", error: result.error } };
      }
      // Silent failure (env vars not present) — preserve source from previous status so env-sourced cards don't lose their state
      const prevStatus = prev[key].status;
      return { ...prev, [key]: { ...makePlatformUI({ connected: false }), status: { connected: false, source: prevStatus.source } } };
    });
  }

  // Diagnostics: check env var presence server-side and log to console.
  // Results appear in Vercel function logs and in the diagnostics panel on this page.
  useEffect(() => {
    actionGetEnvDiagnostics()
      .then(setEnvDiagnostics)
      .catch((e) => console.error("[DeploymentsPage] env diagnostics failed:", e));
  }, []);

  // Read oauth_error / oauth_success query params set by callback routes, then clean URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError   = params.get("oauth_error");
    const oauthSuccess = params.get("oauth_success");
    if (oauthError) {
      setOauthBanner({ type: "error", message: decodeURIComponent(oauthError) });
      const clean = new URL(window.location.href);
      clean.searchParams.delete("oauth_error");
      window.history.replaceState({}, "", clean.toString());
    } else if (oauthSuccess) {
      const name = (oauthSuccess.charAt(0).toUpperCase() + oauthSuccess.slice(1));
      setOauthBanner({ type: "success", message: `${name} connected successfully.` });
      const clean = new URL(window.location.href);
      clean.searchParams.delete("oauth_success");
      window.history.replaceState({}, "", clean.toString());
    }
  }, []);

  // Load everything on mount, then validate env-based integrations in the background
  useEffect(() => {
    // Promise.allSettled — one failing action (e.g. Supabase DB unavailable) cannot
    // kill the platform cards. Each result is handled independently.
    actionGetLFProjects().then((r) => {
      if (r.error) console.error("[DeploymentsPage] actionGetLFProjects failed:", r.error);
      else setLfProjects(r.data);
    });

    Promise.allSettled([
      actionGetProjectList(),
      actionGetAllIntegrationStatuses(),
      actionGetDeployments(),
      actionGetOAuthConfig(),
    ]).then(([projectsRes, statusesRes, deploysRes, oauthRes]) => {

      // ── OAuth config ────────────────────────────────────────────────────────
      const oauthCfg: OAuthConfig = oauthRes.status === "fulfilled"
        ? oauthRes.value
        : { github: false, stripe: false, webflow: false };
      if (oauthRes.status === "rejected") {
        console.error("[DeploymentsPage] actionGetOAuthConfig failed:", oauthRes.reason);
      }
      setOauthConfig(oauthCfg);

      // ── Integration statuses ────────────────────────────────────────────────
      const statuses: Record<IntegrationKey, IntegrationStatus> = statusesRes.status === "fulfilled"
        ? statusesRes.value
        : Object.fromEntries(PLATFORM_KEYS.map((k) => [k, { connected: false } as IntegrationStatus])) as Record<IntegrationKey, IntegrationStatus>;
      if (statusesRes.status === "rejected") {
        console.error("[DeploymentsPage] actionGetAllIntegrationStatuses failed:", statusesRes.reason);
        setLoadError("Could not load integration statuses — check server logs.");
      }

      // ── Projects + deployments ──────────────────────────────────────────────
      const list = projectsRes.status === "fulfilled" ? projectsRes.value : [];
      const deploysResult = deploysRes.status === "fulfilled" ? deploysRes.value : { data: [] };
      if (projectsRes.status === "rejected") {
        console.error("[DeploymentsPage] actionGetProjectList failed:", projectsRes.reason);
      }

      const deployMap = new Map<string, DeploymentRecord>();
      for (const d of deploysResult.data) deployMap.set(d.project_id, d);
      const enriched: ProjectWithDeploy[] = list.map((p) => ({ ...p, deploy: deployMap.get(p.id) ?? null }));
      setProjects(enriched);

      // ── Build initial platform UI ───────────────────────────────────────────
      // Supabase and Stripe auto-validate in the background (set to "connecting").
      // Vercel and GitHub stay "idle" until the user clicks "Test Connection".
      const ui = {} as Record<IntegrationKey, PlatformUIState>;
      PLATFORM_KEYS.forEach((k) => {
        const s = statuses[k];
        const autoValidate = s.source === "env" && (k === "supabase" || k === "stripe");
        ui[k] = { ...makePlatformUI(s), state: autoValidate ? "connecting" : (s.connected ? "connected" : "idle") };
      });
      setPlatforms(ui);
      setLoading(false);

      // ── Background validation ───────────────────────────────────────────────

      // Supabase: auto-validate (10s timeout inside server action)
      if (statuses.supabase.source === "env") {
        actionValidateSupabaseEnv()
          .then((r) => applyResult("supabase", r))
          .catch(() => applyResult("supabase", { success: false, error: "Could not reach Supabase." }))
          .finally(() => setPlatforms((prev) => {
            if (!prev || prev.supabase.state !== "connecting") return prev;
            return { ...prev, supabase: { ...prev.supabase, state: "error", error: "Supabase validation did not complete." } };
          }));
      }

      // Stripe: auto-validate (10s timeout inside server action)
      if (statuses.stripe.source === "env") {
        actionValidateStripeEnv()
          .then((r) => applyResult("stripe", r))
          .catch(() => applyResult("stripe", { success: false, error: "Could not reach Stripe API." }))
          .finally(() => setPlatforms((prev) => {
            if (!prev || prev.stripe.state !== "connecting") return prev;
            return { ...prev, stripe: { ...prev.stripe, state: "error", error: "Stripe validation did not complete." } };
          }));
      }

      // GitHub: user-triggered via "Test Connection" — not auto-validated
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect handler — calls the real API-validating server action for each service.
  // API endpoints used:
  //   vercel:   GET https://api.vercel.com/v2/user  (Bearer VERCEL_TOKEN)
  //   github:   GET https://api.github.com/user     (Bearer <user PAT>)
  //   webflow:  GET https://api.webflow.com/v2/token/introspect
  //   stripe:   GET https://api.stripe.com/v1/account
  //   supabase: GET https://api.supabase.com/v1/projects
  async function handleConnect(id: IntegrationKey, token: string) {
    setPlatforms((prev) => prev ? { ...prev, [id]: { ...prev[id], state: "connecting", error: null } } : prev);
    try {
      let result: ConnectResult;
      if      (id === "vercel")   result = await actionConnectVercel(token);
      else if (id === "github")   result = await actionConnectGitHub(token);
      else if (id === "webflow")  result = await actionConnectWebflow(token);
      else if (id === "stripe")   result = await actionConnectStripe(token);
      else if (id === "supabase") result = await actionConnectSupabase(token);
      else result = { success: false, error: "Unknown platform." };

      if (result.success && result.status) {
        setPlatforms((prev) => prev ? {
          ...prev,
          [id]: { state: "connected", status: result.status!, error: null, showForm: false, showManage: false },
        } : prev);
      } else {
        setPlatforms((prev) => prev ? {
          ...prev,
          [id]: { ...prev[id], state: "error", error: result.error ?? "Connection failed." },
        } : prev);
      }
    } catch {
      setPlatforms((prev) => prev ? {
        ...prev,
        [id]: { ...prev[id], state: "error", error: "Connection failed — check your token and try again." },
      } : prev);
    } finally {
      // Safety net: if still "connecting" after try/catch (e.g. unhandled throw), reset to error
      setPlatforms((prev) => {
        if (!prev || prev[id].state !== "connecting") return prev;
        return { ...prev, [id]: { ...prev[id], state: "error", error: "Connection did not complete." } };
      });
    }
  }

  // Test connection handler — validates env-based credentials on user request.
  // API endpoints used:
  //   vercel:   GET https://api.vercel.com/v2/user            (Bearer process.env.VERCEL_TOKEN)
  //   github:   GET https://api.github.com/rate_limit         (Basic GITHUB_CLIENT_ID:GITHUB_CLIENT_SECRET)
  //   supabase: GET ${SUPABASE_URL}/rest/v1/                   (apikey SUPABASE_ANON_KEY)
  //   stripe:   GET https://api.stripe.com/v1/account         (Bearer STRIPE_SECRET_KEY)
  async function handleTestConnection(id: IntegrationKey) {
    setPlatforms((prev) => prev ? { ...prev, [id]: { ...prev[id], state: "connecting", error: null } } : prev);
    try {
      let result: ConnectResult;
      if      (id === "vercel")   result = await actionValidateVercelEnv();
      else if (id === "github")   result = await actionTestGitHubOAuth();
      else if (id === "supabase") result = await actionValidateSupabaseEnv();
      else if (id === "stripe")   result = await actionValidateStripeEnv();
      else result = { success: false, error: "No test action for this platform." };
      applyResult(id, result);
    } catch {
      applyResult(id, { success: false, error: `${id} connection test failed — check server logs.` });
    } finally {
      // Safety net: if still "connecting" after try/catch, reset to error
      setPlatforms((prev) => {
        if (!prev || prev[id].state !== "connecting") return prev;
        return { ...prev, [id]: { ...prev[id], state: "error", error: "Connection test did not complete." } };
      });
    }
  }

  // Disconnect handler — calls real server action
  async function handleDisconnect(id: IntegrationKey) {
    try {
      await actionDisconnectIntegration(id);
    } finally {
      // Always reset to disconnected, even if the server action throws
      setPlatforms((prev) => prev ? { ...prev, [id]: makePlatformUI({ connected: false }) } : prev);
    }
  }

  async function handleDeleteLFProject(id: string) {
    setLfProjects((prev) => prev.filter((p) => p.id !== id));
    await actionDeleteLFProject(id).catch((e) => console.error("[DeploymentsPage] delete failed:", e));
  }

  function setShowForm(id: IntegrationKey, show: boolean) {
    setPlatforms((prev) => prev ? { ...prev, [id]: { ...prev[id], showForm: show, error: null } } : prev);
  }
  function setShowManage(id: IntegrationKey, show: boolean) {
    setPlatforms((prev) => prev ? { ...prev, [id]: { ...prev[id], showManage: show } } : prev);
  }

  // Build activity feed
  const activityEvents: ActivityEvent[] = [];
  if (platforms) {
    projects.forEach((p) => {
      activityEvents.push({ id: `proj-${p.id}`, type: "project", label: "Project Created", description: `${p.name} generated`, timestamp: p.createdAt });
      if (p.deploy) {
        activityEvents.push({ id: `dep-${p.id}`, type: "deploy", label: "Deployment Added", description: `${p.name} — ${p.deploy.url.replace(/^https?:\/\//, "").split("/")[0]}`, timestamp: p.deploy.created_at });
        if (p.deploy.domain) {
          activityEvents.push({ id: `dom-${p.id}`, type: "domain", label: "Domain Connected", description: `${p.deploy.domain} → ${p.name}`, timestamp: p.deploy.created_at });
        }
      }
    });
    PLATFORM_KEYS.forEach((k) => {
      const ui = platforms[k];
      if (ui.status.connected && ui.status.connectedAt) {
        activityEvents.push({ id: `int-${k}`, type: "integration", label: `${PLATFORM_META[k].name} Connected`, description: `Integration authenticated`, timestamp: ui.status.connectedAt });
      }
    });
    activityEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    activityEvents.splice(12);
  }

  const integrationStatusMap = platforms
    ? Object.fromEntries(PLATFORM_KEYS.map((k) => [k, platforms[k].status])) as Record<IntegrationKey, IntegrationStatus>
    : Object.fromEntries(PLATFORM_KEYS.map((k) => [k, { connected: false }])) as Record<IntegrationKey, IntegrationStatus>;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-4">
          <div className="h-10 w-48 rounded-lg animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />
          <div className="grid grid-cols-4 gap-3">
            {[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0,1,2].map((i) => <div key={i} className="h-36 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />)}
          </div>
          <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />
        </div>
      </div>
    );
  }

  if (!platforms) {
    // Should not happen — catch() always sets platforms to a fallback.
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreated={(p) => setLfProjects((prev) => [p, ...prev])}
        />
      )}
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold mb-1" style={{ color: "hsl(220 9% 88%)", letterSpacing: "-0.01em" }}>
            Deployments
          </h1>
          <p className="text-sm" style={{ color: "hsl(220 9% 38%)" }}>
            Connect your platforms and track live businesses.
          </p>
        </div>

        {/* OAuth / load error banners */}
        {oauthBanner && (
          <div
            className="rounded-xl px-4 py-3 mb-6 flex items-start justify-between gap-3 text-sm"
            style={{
              backgroundColor: oauthBanner.type === "error" ? "hsl(0 60% 12%)" : "hsl(151 60% 48% / 0.08)",
              border: `1px solid ${oauthBanner.type === "error" ? "hsl(0 60% 24%)" : "hsl(151 60% 48% / 0.25)"}`,
              color: oauthBanner.type === "error" ? "hsl(0 70% 58%)" : "hsl(151 60% 52%)",
            }}
          >
            <span>{oauthBanner.message}</span>
            <button
              onClick={() => setOauthBanner(null)}
              className="shrink-0 text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}
        {loadError && !oauthBanner && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm"
            style={{ backgroundColor: "hsl(38 90% 55% / 0.08)", border: "1px solid hsl(38 90% 55% / 0.2)", color: "hsl(38 90% 60%)" }}
          >
            Could not load integration data. Some platforms may appear disconnected.
          </div>
        )}

        {/* Stats */}
        <StatsGrid projects={projects} integrations={integrationStatusMap} />

        {/* Connected Platforms */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 78%)" }}>Platforms</h2>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
              {PLATFORM_KEYS.every((k) => !platforms[k].status.connected)
                ? "No integrations connected yet."
                : "Connect real accounts — status reflects actual authentication."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_KEYS.map((key) => (
              <PlatformCard
                key={key}
                id={key}
                ui={platforms[key]}
                oauthPath={OAUTH_PATHS[key]}
                oauthConfigured={
                  key === "github"  ? oauthConfig.github  :
                  key === "stripe"  ? oauthConfig.stripe  :
                  key === "webflow" ? oauthConfig.webflow :
                  false
                }
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onShowForm={(id) => setShowForm(id, true)}
                onHideForm={(id) => setShowForm(id, false)}
                onShowManage={(id) => setShowManage(id, true)}
                onHideManage={(id) => setShowManage(id, false)}
                onTestConnection={handleTestConnection}
              />
            ))}
          </div>
        </div>

        {/* LF Projects */}
        <LFProjectsSection
          projects={lfProjects}
          onNewProject={() => setShowNewProject(true)}
          onDelete={handleDeleteLFProject}
        />

        {/* Recent Deployments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 78%)" }}>Recent Deployments</h2>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>Tracked via workspace Launch tabs</p>
            </div>
            {projects.some((p) => !!p.deploy) && (
              <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>
                {projects.filter((p) => !!p.deploy).length} of {projects.length} deployed
              </span>
            )}
          </div>
          <DeploymentsTable projects={projects} />
        </div>

        {/* Domains + Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <DomainsSection projects={projects} />
          <ActivityFeed events={activityEvents} />
        </div>

        {/* Server env diagnostics — shows which env vars are visible to server actions */}
        {envDiagnostics && (
          <div className="mt-8 rounded-xl p-5" style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 16%)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "hsl(220 9% 52%)" }}>
              Server Environment — env var presence as seen by server actions (true/false only, no secrets)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(envDiagnostics) as [string, boolean][]).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: "hsl(220 13% 9%)", border: `1px solid ${val ? "hsl(151 60% 48% / 0.2)" : "hsl(0 60% 36% / 0.3)"}` }}
                >
                  <span className="text-xs font-mono" style={{ color: "hsl(220 9% 44%)" }}>{key}</span>
                  <span
                    className="text-xs font-semibold ml-2"
                    style={{ color: val ? "hsl(151 60% 50%)" : "hsl(0 70% 55%)" }}
                  >
                    {val ? "true" : "false"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
          <p className="text-xs" style={{ color: "hsl(220 9% 24%)", lineHeight: 1.6 }}>
            Integration tokens are validated against each platform's API before being stored server-side.
            Tokens are never sent to the client and never committed to source control.
            Connection state resets on server restart — a persistent database will store tokens in production.
          </p>
        </div>

      </div>
    </div>
  );
}
