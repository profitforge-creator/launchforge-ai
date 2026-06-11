"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HistoryRecord } from "@/types";

// ── Score dot ─────────────────────────────────────────────────────────────────

function ScoreDot({ score }: { score: number }) {
  const color =
    score >= 80 ? "hsl(151 60% 48%)" :
    score >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";
  return (
    <span
      className="shrink-0 text-xs font-semibold tabular-nums w-7 text-right"
      style={{ color }}
    >
      {score}
    </span>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  label,
  badge,
  exact = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 h-8 rounded-md text-sm transition-colors"
      style={{
        backgroundColor: isActive ? "hsl(220 13% 15%)" : "transparent",
        color: isActive ? "hsl(220 9% 90%)" : "hsl(220 9% 52%)",
      }}
    >
      <span className="shrink-0 w-4 flex items-center justify-center opacity-70">
        {icon}
      </span>
      <span className="flex-1 truncate text-xs font-medium">{label}</span>
      {badge && (
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "hsl(220 13% 18%)", color: "hsl(220 9% 45%)" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── Workspace item ─────────────────────────────────────────────────────────────

function WorkspaceItem({ record }: { record: HistoryRecord }) {
  const pathname = usePathname();
  const href = `/workspace/${record.id}`;
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className="group flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
      style={{
        backgroundColor: isActive ? "hsl(220 13% 15%)" : "transparent",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor:
            record.overallScore >= 80 ? "hsl(151 60% 48%)" :
            record.overallScore >= 65 ? "hsl(38 90% 55%)" :
            "hsl(0 72% 58%)",
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate leading-tight"
          style={{ color: isActive ? "hsl(220 9% 90%)" : "hsl(220 9% 62%)" }}
        >
          {record.niche.length > 28 ? record.niche.slice(0, 28) + "…" : record.niche}
        </p>
        <p className="text-xs truncate leading-tight mt-0.5" style={{ color: "hsl(220 9% 38%)" }}>
          {record.productName}
        </p>
      </div>
      <ScoreDot score={record.overallScore} />
    </Link>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest"
      style={{ color: "hsl(220 9% 32%)" }}
    >
      {children}
    </p>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const IconHistory = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconTemplate = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);
const IconAsset = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const IconAccount = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function AppSidebar({ workspaces }: { workspaces: HistoryRecord[] }) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 overflow-y-auto"
      style={{
        width: "236px",
        borderRight: "1px solid hsl(220 13% 13%)",
        backgroundColor: "hsl(220 13% 7%)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 h-12 shrink-0"
        style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: "hsl(213 94% 62%)" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 13% 8%)" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight" style={{ color: "hsl(220 9% 90%)" }}>
          LaunchForge
        </span>
        <span
          className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "hsl(213 94% 62% / 0.12)", color: "hsl(213 94% 65%)" }}
        >
          AI
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {/* New Business */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 h-8 rounded-md text-xs font-semibold transition-colors"
          style={{
            backgroundColor: "hsl(213 94% 62% / 0.1)",
            border: "1px solid hsl(213 94% 62% / 0.2)",
            color: "hsl(213 94% 65%)",
          }}
        >
          <IconPlus />
          New Business
        </Link>

        {/* Workspaces */}
        <div>
          <SectionLabel>Workspaces</SectionLabel>
          {workspaces.length === 0 ? (
            <p className="px-3 text-xs" style={{ color: "hsl(220 9% 35%)" }}>
              No workspaces yet
            </p>
          ) : (
            <div className="space-y-0.5">
              {workspaces.map((w) => (
                <WorkspaceItem key={w.id} record={w} />
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div>
          <SectionLabel>Library</SectionLabel>
          <div className="space-y-0.5">
            <NavItem href="/dashboard/history" icon={<IconHistory />} label="All Workspaces" />
            <NavItem href="/dashboard/templates" icon={<IconTemplate />} label="Templates" badge="Soon" exact />
            <NavItem href="/dashboard/assets" icon={<IconAsset />} label="Assets" badge="Soon" exact />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-2 py-3 space-y-0.5 shrink-0"
        style={{ borderTop: "1px solid hsl(220 13% 12%)" }}
      >
        <NavItem href="/dashboard/account" icon={<IconAccount />} label="Account" />
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{
              backgroundColor: "hsl(213 94% 62% / 0.15)",
              border: "1px solid hsl(213 94% 62% / 0.25)",
              color: "hsl(213 94% 65%)",
            }}
          >
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "hsl(220 9% 65%)" }}>
              Free Plan
            </p>
            <p className="text-xs truncate" style={{ color: "hsl(220 9% 38%)" }}>
              {workspaces.length} of 50 generations
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
