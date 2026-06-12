"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { actionGetProjectList, type ProjectListItem } from "@/app/actions/analytics";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DeployRecord {
  url: string;
  domain?: string;
  deployedAt: string;
  environment: "production" | "preview";
}

interface ProjectWithDeploy extends ProjectListItem {
  deploy: DeployRecord | null;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCloud() {
  return (
    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095H6.75z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
function IconExternal() {
  return (
    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ deployed }: { deployed: boolean }) {
  if (deployed) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 48%)", border: "1px solid hsl(151 60% 48% / 0.2)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
        Live
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 40%)", border: "1px solid hsl(220 13% 18%)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(220 9% 32%)" }} />
      Not deployed
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)", color: "hsl(220 9% 36%)" }}
      >
        <IconCloud />
      </div>
      <h2 className="text-base font-semibold mb-2" style={{ color: "hsl(220 9% 78%)" }}>
        No deployments yet
      </h2>
      <p className="text-sm max-w-sm mb-8" style={{ color: "hsl(220 9% 38%)", lineHeight: 1.6 }}>
        Deploy your projects from within each workspace. Open a project, go to the
        Launch tab, and enter your deployment URL to track it here.
      </p>

      <div
        className="w-full max-w-sm rounded-xl p-5 text-left"
        style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 16%)" }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: "hsl(220 9% 55%)" }}>
          CONNECT INTEGRATIONS
        </p>
        <div className="space-y-2">
          {[
            { name: "Vercel", desc: "Auto-deploy on push" },
            { name: "GitHub", desc: "Trigger from commits" },
            { name: "Netlify", desc: "Static site hosting" },
          ].map((int) => (
            <div
              key={int.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 17%)" }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: "hsl(220 9% 65%)" }}>{int.name}</p>
                <p className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>{int.desc}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "hsl(220 13% 16%)", color: "hsl(220 9% 32%)" }}>
                Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Deployment table ──────────────────────────────────────────────────────────

function DeploymentTable({ projects }: { projects: ProjectWithDeploy[] }) {
  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "hsl(220 13% 11%)", borderBottom: "1px solid hsl(220 13% 15%)" }}>
            {["Project", "Environment", "Status", "URL", "Deployed"].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 text-xs font-medium"
                style={{ color: "hsl(220 9% 38%)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr
              key={p.id}
              style={{
                backgroundColor: i % 2 === 0 ? "hsl(220 14% 9%)" : "hsl(220 13% 10%)",
                borderBottom: i < projects.length - 1 ? "1px solid hsl(220 13% 13%)" : "none",
              }}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/workspace/${p.id}`}
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: "hsl(220 9% 78%)" }}
                >
                  {p.name}
                </Link>
                <p className="text-xs mt-0.5 capitalize" style={{ color: "hsl(220 9% 35%)" }}>
                  {p.type}
                </p>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>
                  {p.deploy?.environment ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge deployed={!!p.deploy} />
              </td>
              <td className="px-4 py-3">
                {p.deploy?.url ? (
                  <a
                    href={p.deploy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:underline transition-colors"
                    style={{ color: "hsl(213 94% 62%)" }}
                  >
                    {p.deploy.domain ?? p.deploy.url.replace(/^https?:\/\//, "").split("/")[0]}
                    <IconExternal />
                  </a>
                ) : (
                  <Link
                    href={`/workspace/${p.id}`}
                    className="text-xs hover:underline"
                    style={{ color: "hsl(220 9% 35%)" }}
                  >
                    Set URL →
                  </Link>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>
                  {p.deploy?.deployedAt ? formatDate(p.deploy.deployedAt) : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ projects }: { projects: ProjectWithDeploy[] }) {
  const live = projects.filter((p) => !!p.deploy).length;
  const total = projects.length;
  const withDomain = projects.filter((p) => !!p.deploy?.domain).length;

  const stats = [
    { label: "Total Projects",    value: total },
    { label: "Live Deployments",  value: live },
    { label: "Custom Domains",    value: withDomain },
    { label: "Not Deployed",      value: total - live },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 15%)" }}
        >
          <p className="text-2xl font-semibold mb-0.5 tabular-nums" style={{ color: "hsl(220 9% 86%)" }}>
            {s.value}
          </p>
          <p className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DeploymentsPage() {
  const [projects, setProjects] = useState<ProjectWithDeploy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    actionGetProjectList().then((list) => {
      const enriched: ProjectWithDeploy[] = list.map((p) => {
        const raw = typeof window !== "undefined" ? localStorage.getItem(`lf_deploy_${p.id}`) : null;
        let deploy: DeployRecord | null = null;
        if (raw) {
          try { deploy = JSON.parse(raw); } catch {}
        }
        return { ...p, deploy };
      });
      setProjects(enriched);
      setLoading(false);
    });
  }, []);

  const hasAnyDeploy = projects.some((p) => !!p.deploy);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: "hsl(220 9% 88%)" }}>
              Deployments
            </h1>
            <p className="text-sm" style={{ color: "hsl(220 9% 38%)" }}>
              Track and manage your live projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 40%)" }}>
              Vercel — Not connected
            </span>
            <span className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 40%)" }}>
              GitHub — Not connected
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              {[0,1,2,3].map((i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />
              ))}
            </div>
            <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StatsBar projects={projects} />

            {!hasAnyDeploy && (
              <div
                className="rounded-xl px-5 py-4 mb-5 flex items-start gap-3"
                style={{ backgroundColor: "hsl(213 94% 62% / 0.06)", border: "1px solid hsl(213 94% 62% / 0.15)" }}
              >
                <span className="mt-0.5" style={{ color: "hsl(213 94% 62%)" }}>
                  <IconGlobe />
                </span>
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: "hsl(213 94% 70%)" }}>
                    None of your projects are deployed yet
                  </p>
                  <p className="text-xs" style={{ color: "hsl(213 94% 50%)" }}>
                    Open a project workspace, go to the Launch tab, and enter your deployment URL to track it here.
                  </p>
                </div>
              </div>
            )}

            <DeploymentTable projects={projects} />

            <div className="mt-4 flex items-center gap-1.5">
              <span style={{ color: "hsl(151 60% 48%)" }}><IconCheck /></span>
              <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>
                Deploy tracking is stored locally. Connect Vercel for automatic deployment sync.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
