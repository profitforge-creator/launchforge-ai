"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { HistoryRecord } from "@/types";

// ── Icons ─────────────────────────────────────────────────────────────────────

const I = {
  plus: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  home: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  research: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
    </svg>
  ),
  product: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  ),
  globe: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  marketing: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ),
  branding: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  github: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  vercel: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  ),
  domain: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
  usage: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  billing: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  settings: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chevronDown: (
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest select-none"
      style={{ color: "hsl(220 9% 28%)", letterSpacing: "0.08em" }}
    >
      {children}
    </p>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  label,
  badge,
  exact = false,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  exact?: boolean;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const isActive = !disabled && (exact ? pathname === href : pathname.startsWith(href));

  if (disabled) {
    return (
      <div
        className="flex items-center gap-2.5 px-2.5 h-8 rounded-md select-none"
        style={{ cursor: "default", opacity: 0.45 }}
      >
        <span className="shrink-0 w-4 h-4 flex items-center justify-center" style={{ color: "hsl(220 9% 40%)" }}>
          {icon}
        </span>
        <span className="flex-1 text-xs font-medium truncate" style={{ color: "hsl(220 9% 45%)" }}>{label}</span>
        {badge && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: "hsl(220 13% 16%)", color: "hsl(220 9% 38%)", fontSize: "10px" }}
          >
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2.5 h-8 rounded-md text-xs font-medium transition-all"
      style={{
        backgroundColor: isActive ? "hsl(213 94% 62% / 0.08)" : "transparent",
        color: isActive ? "hsl(213 94% 70%)" : "hsl(220 9% 48%)",
        border: isActive ? "1px solid hsl(213 94% 62% / 0.14)" : "1px solid transparent",
      }}
    >
      <span
        className="shrink-0 w-4 h-4 flex items-center justify-center"
        style={{ color: isActive ? "hsl(213 94% 65%)" : "hsl(220 9% 38%)" }}
      >
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: "hsl(220 13% 16%)", color: "hsl(220 9% 38%)", fontSize: "10px" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── Project item ──────────────────────────────────────────────────────────────

function ProjectItem({ record }: { record: HistoryRecord }) {
  const pathname = usePathname();
  const href = `/workspace/${record.id}`;
  const isActive = pathname === href;
  const color =
    record.overallScore >= 80 ? "hsl(151 60% 48%)" :
    record.overallScore >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";

  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all"
      style={{
        backgroundColor: isActive ? "hsl(213 94% 62% / 0.07)" : "transparent",
        border: isActive ? "1px solid hsl(213 94% 62% / 0.12)" : "1px solid transparent",
      }}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs"
        style={{ backgroundColor: "hsl(220 13% 16%)", color: "hsl(220 9% 55%)" }}
      >
        🚀
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate leading-tight"
          style={{ color: isActive ? "hsl(213 94% 75%)" : "hsl(220 9% 70%)" }}
        >
          {record.productName.length > 22 ? record.productName.slice(0, 22) + "…" : record.productName}
        </p>
        <p className="text-xs truncate leading-tight mt-0.5" style={{ color: "hsl(220 9% 32%)" }}>
          {record.niche.length > 22 ? record.niche.slice(0, 22) + "…" : record.niche}
        </p>
      </div>
      <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color }}>{record.overallScore}</span>
    </Link>
  );
}

// ── Collapsible section ────────────────────────────────────────────────────────

function Section({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1 px-2 mb-1.5"
        style={{ cursor: "pointer" }}
      >
        <p
          className="flex-1 text-left text-xs font-semibold uppercase tracking-widest select-none"
          style={{ color: "hsl(220 9% 28%)", letterSpacing: "0.08em" }}
        >
          {label}
        </p>
        <span
          style={{
            color: "hsl(220 9% 28%)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s",
            display: "flex",
          }}
        >
          {I.chevronDown}
        </span>
      </button>
      {open && children}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function AppSidebar({ workspaces }: { workspaces: HistoryRecord[] }) {
  const recent = workspaces.slice(0, 8);

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        width: 224,
        borderRight: "1px solid hsl(220 13% 12%)",
        backgroundColor: "hsl(220 16% 6%)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-2.5 px-3.5 shrink-0"
        style={{ height: 48, borderBottom: "1px solid hsl(220 13% 11%)" }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: "hsl(213 94% 58%)" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 16% 6%)" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight" style={{ color: "hsl(220 9% 94%)" }}>
          LaunchForge
        </span>
        <span
          className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "hsl(213 94% 62% / 0.14)", color: "hsl(213 94% 68%)", fontSize: "10px" }}
        >
          AI
        </span>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 min-h-0">

        {/* New Project */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-semibold transition-all w-full"
          style={{
            backgroundColor: "hsl(213 94% 58%)",
            color: "hsl(220 16% 6%)",
          }}
        >
          <span style={{ marginTop: 1 }}>{I.plus}</span>
          New Project
        </Link>

        {/* Dashboard */}
        <div>
          <NavItem href="/dashboard" icon={I.home} label="Dashboard" exact />
        </div>

        {/* Projects */}
        <Section label="Projects" defaultOpen>
          {recent.length === 0 ? (
            <div className="px-2.5 py-3 text-center rounded-lg" style={{ border: "1px dashed hsl(220 13% 16%)" }}>
              <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>No projects yet</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 24%)" }}>Start building above</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recent.map((w) => <ProjectItem key={w.id} record={w} />)}
              {workspaces.length > 8 && (
                <Link
                  href="/dashboard/history"
                  className="flex items-center px-2.5 py-1.5 text-xs rounded-md transition-colors"
                  style={{ color: "hsl(220 9% 35%)" }}
                >
                  +{workspaces.length - 8} more projects →
                </Link>
              )}
            </div>
          )}
        </Section>

        {/* Tools */}
        <Section label="Tools" defaultOpen>
          <div className="space-y-0.5">
            <NavItem href="/dashboard/history" icon={I.research}   label="Research"   />
            <NavItem href="/dashboard/history" icon={I.product}    label="Products"   />
            <NavItem href="/dashboard/history" icon={I.globe}      label="Websites"   />
            <NavItem href="/dashboard/history" icon={I.marketing}  label="Marketing"  />
            <NavItem href="#" icon={I.branding}  label="Branding"   badge="Soon" disabled />
          </div>
        </Section>

        {/* Deployment */}
        <Section label="Deployment" defaultOpen={false}>
          <div className="space-y-0.5">
            <NavItem href="#" icon={I.github} label="GitHub"  badge="Soon" disabled />
            <NavItem href="#" icon={I.vercel} label="Vercel"  badge="Soon" disabled />
            <NavItem href="#" icon={I.domain} label="Domains" badge="Soon" disabled />
          </div>
        </Section>

        {/* Account */}
        <Section label="Account" defaultOpen={false}>
          <div className="space-y-0.5">
            <NavItem href="/dashboard/account" icon={I.usage}    label="Usage"    />
            <NavItem href="/dashboard/account" icon={I.billing}  label="Billing"  />
            <NavItem href="/dashboard/account" icon={I.settings} label="Settings" />
          </div>
        </Section>

      </div>

      {/* ── Footer ── */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: "1px solid hsl(220 13% 11%)" }}
      >
        {/* Usage bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>Free Plan</span>
            <span className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>{workspaces.length}/3 projects</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 16%)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (workspaces.length / 3) * 100)}%`,
                backgroundColor: workspaces.length >= 3 ? "hsl(0 72% 58%)" : "hsl(213 94% 62%)",
              }}
            />
          </div>
        </div>
        {/* Upgrade link */}
        <Link
          href="/dashboard/account"
          className="flex items-center justify-center h-7 rounded-md text-xs font-medium transition-all w-full"
          style={{
            border: "1px solid hsl(220 13% 18%)",
            color: "hsl(213 94% 62%)",
            backgroundColor: "hsl(213 94% 62% / 0.04)",
          }}
        >
          Upgrade to Pro →
        </Link>
      </div>
    </aside>
  );
}
