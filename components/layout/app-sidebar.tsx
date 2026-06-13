"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { HistoryRecord } from "@/types";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
function IconDeploy() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095H6.75z" />
    </svg>
  );
}
function IconAnalytics() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
function IconUsage() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
    </svg>
  );
}
function IconOpportunities() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
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
  const [hovered, setHovered] = useState(false);

  const bg = isActive ? "hsl(220 13% 15%)" : hovered ? "hsl(220 13% 12%)" : "transparent";
  const fg = isActive ? "hsl(220 9% 90%)" : hovered ? "hsl(220 9% 72%)" : "hsl(220 9% 52%)";

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-2.5 px-2 h-8 rounded-md text-sm transition-colors"
      style={{ backgroundColor: bg, color: fg }}
    >
      {/* Active accent bar */}
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all"
        style={{
          width: 3,
          height: isActive ? 16 : 0,
          backgroundColor: "hsl(213 94% 62%)",
          opacity: isActive ? 1 : 0,
        }}
      />
      <span
        className="shrink-0 transition-colors"
        style={{ color: isActive ? "hsl(213 94% 64%)" : "currentColor", opacity: isActive ? 1 : 0.75 }}
      >
        {icon}
      </span>
      <span className="text-xs font-medium truncate flex-1">{label}</span>
      {badge && (
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: "hsl(220 13% 16%)", color: "hsl(220 9% 36%)" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-2 pt-1 pb-1.5 text-xs font-semibold uppercase select-none"
      style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.07em", fontSize: 10.5 }}
    >
      {children}
    </p>
  );
}

// ── Disabled nav item ─────────────────────────────────────────────────────────

function DisabledNavItem({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-2 h-8 rounded-md cursor-default"
      style={{ color: "hsl(220 9% 30%)" }}
    >
      <span className="shrink-0 opacity-50">{icon}</span>
      <span className="text-xs font-medium truncate flex-1">{label}</span>
      {badge && (
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 28%)" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Project item ──────────────────────────────────────────────────────────────

function ProjectItem({ record }: { record: HistoryRecord }) {
  const pathname = usePathname();
  const href = `/workspace/${record.id}`;
  const isActive = pathname === href;
  const [hovered, setHovered] = useState(false);

  const bg = isActive ? "hsl(220 13% 15%)" : hovered ? "hsl(220 13% 12%)" : "transparent";
  const fg = isActive ? "hsl(220 9% 88%)" : hovered ? "hsl(220 9% 68%)" : "hsl(220 9% 48%)";

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-2 pl-3.5 pr-2 h-7 rounded-md transition-colors"
      style={{ backgroundColor: bg, color: fg }}
    >
      <span
        className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full transition-colors"
        style={{ backgroundColor: isActive ? "hsl(213 94% 62%)" : "hsl(220 13% 26%)" }}
      />
      <span className="text-xs truncate flex-1">
        {record.productName || record.niche}
      </span>
    </Link>
  );
}

// ── Section group ─────────────────────────────────────────────────────────────

function SectionGroup({
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
        className="w-full flex items-center gap-1.5 px-2 h-6 mb-0.5"
        style={{ color: "hsl(220 9% 36%)" }}
      >
        <IconChevron open={open} />
        <span className="text-xs font-medium">{label}</span>
      </button>
      {open && children}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-2 my-1" style={{ height: 1, backgroundColor: "hsl(220 13% 12%)" }} />;
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function AppSidebar({ workspaces }: { workspaces: HistoryRecord[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery.trim()
    ? workspaces.filter(
        (w) =>
          w.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.niche.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : workspaces;

  const recent   = filtered.slice(0, 10);
  const archived = filtered.slice(10);

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        width: 240,
        backgroundColor: "hsl(220 14% 8%)",
        borderRight: "1px solid hsl(220 13% 12%)",
      }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 px-1 mb-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: "hsl(213 94% 58%)" }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 14% 7%)" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "hsl(220 9% 90%)" }}>
            LaunchForge
          </span>
        </Link>

        {/* New project */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 h-8 rounded-md text-xs font-medium transition-colors w-full"
          style={{
            backgroundColor: "hsl(220 13% 13%)",
            border: "1px solid hsl(220 13% 18%)",
            color: "hsl(220 9% 65%)",
          }}
        >
          <IconPlus />
          New project
        </Link>

        {/* Search — only appears when there are many projects */}
        {workspaces.length > 3 && (
          <div className="relative mt-2">
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2"
              style={{ color: "hsl(220 9% 32%)" }}
            >
              <IconSearch />
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects"
              className="w-full h-7 bg-transparent pl-7 pr-2 text-xs rounded-md outline-none"
              style={{
                border: "1px solid hsl(220 13% 16%)",
                color: "hsl(220 9% 65%)",
              }}
            />
          </div>
        )}
      </div>

      {/* Main nav */}
      <div className="px-2 pt-2 pb-1 shrink-0 space-y-0.5">
        <SectionLabel>Workspace</SectionLabel>
        <NavItem href="/dashboard"                    icon={<IconFolder />}        label="Projects"       exact />
        <NavItem href="/dashboard/deployments"        icon={<IconDeploy />}        label="Deployments"         />
        <NavItem href="/dashboard/opportunities"      icon={<IconOpportunities />} label="Opportunities"       />
        <NavItem href="/dashboard/analytics"          icon={<IconAnalytics />}     label="Analytics"           />
        <NavItem href="/dashboard/usage"              icon={<IconUsage />}         label="Usage"               />
      </div>

      <Divider />

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 min-h-0 space-y-3">
        {recent.length === 0 ? (
          <div
            className="mx-1 mt-2 rounded-lg px-3 py-5 text-center"
            style={{ border: "1px dashed hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 9.5%)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 40%)" }}
            >
              <IconFolder />
            </div>
            <p className="text-xs font-medium" style={{ color: "hsl(220 9% 46%)" }}>
              No projects yet
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "hsl(220 9% 30%)" }}>
              Your generated businesses will appear here.
            </p>
          </div>
        ) : (
          <SectionGroup label="Recent">
            <div className="space-y-0.5">
              {recent.map((w) => (
                <ProjectItem key={w.id} record={w} />
              ))}
            </div>
          </SectionGroup>
        )}

        {archived.length > 0 && (
          <SectionGroup label="Older" defaultOpen={false}>
            <div className="space-y-0.5">
              {archived.map((w) => (
                <ProjectItem key={w.id} record={w} />
              ))}
            </div>
          </SectionGroup>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-2 py-2 shrink-0 space-y-0.5"
        style={{ borderTop: "1px solid hsl(220 13% 12%)" }}
      >
        <NavItem href="/dashboard/settings" icon={<IconSettings />} label="Settings"  />
        <div className="flex items-center gap-2.5 px-2 py-2 mt-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
            style={{ backgroundColor: "hsl(213 94% 62% / 0.14)", color: "hsl(213 94% 66%)", border: "1px solid hsl(213 94% 62% / 0.2)" }}
          >
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" style={{ color: "hsl(220 9% 60%)" }}>Your workspace</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
              <p className="text-xs truncate" style={{ color: "hsl(220 9% 36%)" }}>Trial · Active</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
