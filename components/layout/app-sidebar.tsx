"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { HistoryRecord } from "@/types";

// ── Logo icon ──────────────────────────────────────────────────────────────────

function LogoBolt() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

// ── Nav icons ──────────────────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  );
}
function IconProjects() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4a1 1 0 011-1h3l2 2h5a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" />
    </svg>
  );
}
function IconBizGen() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 1l1.7 5 5.3 1.5-5.3 1.5L7 14 5.3 9 0 7.5 5.3 6z" />
    </svg>
  );
}
function IconDeploy() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 1s4 1.8 4 6.5L7 13 3 7.5C3 2.8 7 1 7 1z" />
      <circle cx="7" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconInteg() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4.5 2v2.5M9.5 2v2.5M3.5 4.5h7a.8.8 0 01.8.8v2a4.8 4.8 0 01-9.6 0v-2a.8.8 0 01.8-.8zM5.5 12v1.5M8.5 12v1.5" />
    </svg>
  );
}
function IconAnalytics() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12.5h12M3 12.5V7.5M5.5 12.5V4M8 12.5V6.5M10.5 12.5V2" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="2.5" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M2.7 11.3l1-1M10.3 3.7l1-1" />
    </svg>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className="flex items-center gap-[7px] px-2 py-[5px] rounded-[5px] text-[13px] w-full transition-colors"
      style={{
        color: isActive ? "#fafafa" : "#71717a",
        background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
        fontWeight: isActive ? 500 : 400,
      }}
    >
      <span style={{ color: isActive ? "#fafafa" : "#52525b", flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function AppSidebar({ workspaces }: { workspaces: HistoryRecord[] }) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden"
      style={{
        width: 216,
        background: "#111113",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="px-[14px] shrink-0"
        style={{ padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-[6px] py-[5px] rounded-[6px] min-w-0 transition-colors"
          style={{ color: "#fafafa" }}
        >
          <div
            className="flex items-center justify-center shrink-0 rounded-[5px]"
            style={{ width: 24, height: 24, background: "#3b82f6" }}
          >
            <LogoBolt />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>LaunchForge</span>
        </Link>
      </div>

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "#3f3f46",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 8px",
            marginBottom: 2,
          }}
        >
          Workspace
        </p>

        <NavItem href="/dashboard"              icon={<IconDashboard />}  label="Dashboard"      exact />
        <NavItem href="/dashboard/projects"     icon={<IconProjects />}   label="Projects"            />
        <NavItem href="/dashboard/generate"     icon={<IconBizGen />}     label="Business Gen"        />
        <NavItem href="/dashboard/deployments"  icon={<IconDeploy />}     label="Deployments"         />
        <NavItem href="/dashboard/integrations" icon={<IconInteg />}      label="Integrations"        />
        <NavItem href="/dashboard/analytics"    icon={<IconAnalytics />}  label="Analytics"           />

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

        <p
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "#3f3f46",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 8px",
            marginBottom: 2,
          }}
        >
          Account
        </p>

        <NavItem href="/dashboard/settings" icon={<IconSettings />} label="Settings" />
      </div>

      {/* User footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 10px" }}>
        <div
          className="flex items-center gap-[9px] px-2 py-[7px] rounded-[6px] cursor-pointer transition-colors"
          style={{ color: "#fafafa" }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 26,
              height: 26,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              fontSize: 10.5,
              fontWeight: 600,
              color: "white",
            }}
          >
            U
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "#fafafa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Your workspace
            </div>
            <div style={{ fontSize: 11, color: "#52525b" }}>Free plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
