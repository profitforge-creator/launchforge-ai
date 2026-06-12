"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { actionGetAnalyticsData } from "@/app/actions/analytics";
import type { AnalyticsData, ProjectAnalyticsSummary } from "@/app/actions/analytics";

// ── Types ─────────────────────────────────────────────────────────────────────

type AnalyticsTab = "overview" | "revenue" | "traffic" | "deployments" | "goals" | "activity";

interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  type: "auto" | "manual" | "locked";
  autoKey?: string;
  createdAt: string;
}

interface DeployRecord {
  url: string;
  domain?: string;
  deployedAt: string;
  environment: "production" | "preview";
}

// ── Utility ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hrs   = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return formatDate(iso);
}

function calcBusinessScore(data: AnalyticsData, goals: Goal[]): number {
  if (data.totalProjects === 0) return 0;
  let score = 0;
  score += Math.min(data.totalProjects * 15, 30);
  score += Math.min(data.totalWebsites * 15, 20);
  score += Math.round(data.avgScore * 0.35);
  const completedGoals = goals.filter((g) => g.completed).length;
  score += Math.min(completedGoals * 5, 15);
  return Math.min(score, 100);
}

function scoreColor(s: number) {
  return s >= 75 ? "hsl(151 60% 48%)" : s >= 55 ? "hsl(38 90% 55%)" : "hsl(220 9% 48%)";
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    course: "Course", ebook: "Ebook", template: "Template", saas: "SaaS",
    agency: "Agency", membership: "Membership", coaching: "Coaching",
    newsletter: "Newsletter", open: "General",
  };
  return map[t] ?? t;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconTrend({ up = true }: { up?: boolean }) {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      {up
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
      }
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="9" height="9" fill="none" viewBox="0 0 12 12" stroke="hsl(220 14% 7%)" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
    </svg>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r    = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(220 13% 15%)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={16} fontWeight={700} fill={color}>{score}</text>
    </svg>
  );
}

// ── Founder metric card ───────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  locked,
  lockNote,
  accent,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  locked?: boolean;
  lockNote?: string;
  accent?: string;
  trend?: "up" | "down" | null;
}) {
  return (
    <div
      className="rounded-xl px-5 py-4 transition-all"
      style={{
        backgroundColor: "hsl(220 13% 10%)",
        border: "1px solid hsl(220 13% 15%)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 22%)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 15%)"; }}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium" style={{ color: "hsl(220 9% 38%)" }}>{label}</p>
        {locked && (
          <span style={{ color: "hsl(220 9% 30%)" }}><IconLock /></span>
        )}
        {!locked && trend && (
          <span style={{ color: trend === "up" ? "hsl(151 60% 48%)" : "hsl(0 70% 55%)" }}>
            <IconTrend up={trend === "up"} />
          </span>
        )}
      </div>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: locked ? "hsl(220 9% 28%)" : (accent ?? "hsl(220 9% 90%)"), letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      <p className="text-xs mt-1.5" style={{ color: "hsl(220 9% 28%)" }}>
        {locked ? lockNote : sub}
      </p>
    </div>
  );
}

// ── Empty chart placeholder ───────────────────────────────────────────────────

function EmptyChart({ label, connectLabel, settingsHref }: { label: string; connectLabel: string; settingsHref: string }) {
  return (
    <div
      className="rounded-xl px-6 py-8"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 42%)" }}>{label}</p>
        <Link
          href={settingsHref}
          className="text-xs font-medium transition-colors"
          style={{ color: "hsl(213 94% 56%)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(213 94% 68%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(213 94% 56%)"; }}
        >
          {connectLabel}
        </Link>
      </div>
      {/* Simulated empty grid */}
      <div className="relative h-28">
        <div className="absolute inset-0 flex items-end gap-1 px-1">
          {[40,55,35,70,45,60,38,72,50,65,42,58].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                backgroundColor: "hsl(220 13% 14%)",
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
          style={{ backdropFilter: "none" }}
        >
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 36%)" }}>No data yet</p>
          <p className="text-xs" style={{ color: "hsl(220 9% 26%)", textAlign: "center" }}>
            Connect {connectLabel.replace("Connect ", "")} to see real metrics
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Real score bar chart ──────────────────────────────────────────────────────

function ScoreBarChart({ data }: { data: { label: string; score: number }[] }) {
  if (data.length === 0) return null;
  const h    = 80;
  const barW = Math.min(36, Math.floor(560 / data.length) - 6);
  const gap  = Math.floor(560 / data.length);

  return (
    <svg width="100%" viewBox={`0 0 ${data.length * gap} ${h + 28}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const barH  = Math.max(4, (d.score / 100) * h);
        const x     = i * gap + (gap - barW) / 2;
        const y     = h - barH;
        const color = scoreColor(d.score);
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={0.8} />
            <text x={x + barW/2} y={h + 14} textAnchor="middle" fontSize={9} fill="hsl(220 9% 36%)" style={{ fontFamily: "inherit" }}>
              {d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label}
            </text>
            <text x={x + barW/2} y={y - 4} textAnchor="middle" fontSize={9} fill={color} style={{ fontFamily: "inherit" }}>
              {d.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Connect prompt (Revenue / Traffic / Deployments tabs) ─────────────────────

function ConnectPrompt({
  service, logo, description, metrics, settingsHref,
}: {
  service: string;
  logo: React.ReactNode;
  description: string;
  metrics: string[];
  settingsHref: string;
}) {
  return (
    <div className="max-w-lg mx-auto py-16 flex flex-col items-center text-center gap-6">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ border: "1px solid hsl(220 13% 18%)", backgroundColor: "hsl(220 13% 11%)" }}
      >
        {logo}
      </div>
      <div>
        <h2 className="text-base font-semibold mb-2" style={{ color: "hsl(220 9% 88%)" }}>Connect {service}</h2>
        <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 46%)" }}>{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full text-left">
        {metrics.map((m) => (
          <div key={m} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 16%)" }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(220 13% 28%)" }} />
            <span className="text-xs" style={{ color: "hsl(220 9% 52%)" }}>{m}</span>
          </div>
        ))}
      </div>
      <Link
        href={settingsHref}
        className="h-9 px-6 rounded-lg text-sm font-semibold flex items-center"
        style={{ backgroundColor: "hsl(220 9% 90%)", color: "hsl(220 14% 7%)" }}
      >
        Connect in Settings
      </Link>
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({
  data,
  goals,
  businessScore,
  deployCount,
}: {
  data: AnalyticsData;
  goals: Goal[];
  businessScore: number;
  deployCount: number;
}) {
  const completedGoals = goals.filter((g) => g.completed).length;
  const activeProjects = data.projects.filter((p) => !p.hasWebsite || p.score < 80).length;

  // AI Advisor
  const advisorInsights: string[] = [];
  if (data.totalProjects === 0) {
    advisorInsights.push("You have not created any projects yet. Head to Projects to generate your first business.");
  } else {
    if (data.totalWebsites === 0) {
      advisorInsights.push(`You have ${data.totalProjects} project${data.totalProjects > 1 ? "s" : ""} but no websites generated yet. Open a project and go to the Website tab.`);
    }
    if (data.totalProjects > 1 && data.totalWebsites < data.totalProjects) {
      advisorInsights.push(`${data.totalProjects - data.totalWebsites} of your projects are missing a website. Generate websites to unlock deployment.`);
    }
    if (data.topProject?.topRecommendation) {
      advisorInsights.push(`Your highest-scored project "${data.topProject.name}" has an open recommendation: ${data.topProject.topRecommendation}`);
    }
    if (data.avgScore < 70) {
      advisorInsights.push("Your average business score is below 70. Use the Improve buttons in each project workspace to increase quality.");
    }
    advisorInsights.push("Connect Stripe and Vercel in Settings to unlock revenue tracking, traffic analytics, and one-click deployment.");
  }

  // No projects at all → prominent empty state
  if (data.totalProjects === 0) {
    return (
      <div className="max-w-4xl">
        <div
          className="rounded-2xl px-8 py-16 flex flex-col items-center text-center gap-4"
          style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "hsl(213 94% 58% / 0.08)", border: "1px solid hsl(213 94% 58% / 0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold mb-1.5" style={{ color: "hsl(220 9% 78%)" }}>
              Analytics will appear once your business starts receiving traffic and activity.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 38%)" }}>
              Create a project to get started. LaunchForge will generate your business, website, and marketing strategy.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-2 h-9 px-5 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-4xl">

      {/* ── Founder metrics row ── */}
      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
          Business Metrics
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Revenue"
            value="$0"
            sub="Connect Stripe"
            locked
            lockNote="Connect Stripe to track"
          />
          <MetricCard
            label="Visitors"
            value="—"
            locked
            lockNote="Connect Vercel Analytics"
          />
          <MetricCard
            label="Leads"
            value="—"
            locked
            lockNote="Connect a form provider"
          />
          <MetricCard
            label="Conversion Rate"
            value="—"
            locked
            lockNote="Requires Stripe + Vercel"
          />
        </div>
      </div>

      {/* ── Portfolio metrics row ── */}
      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
          Portfolio
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all"
            style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 22%)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 15%)"; }}
          >
            <ScoreRing score={businessScore} size={64} />
            <p className="text-xs" style={{ color: "hsl(220 9% 34%)" }}>Business Score</p>
          </div>
          <MetricCard
            label="Total Projects"
            value={data.totalProjects}
            sub={`${data.totalWebsites} with websites`}
          />
          <MetricCard
            label="Active"
            value={activeProjects}
            sub="In progress"
            accent={activeProjects > 0 ? "hsl(38 90% 58%)" : undefined}
          />
          <MetricCard
            label="Deployments"
            value={deployCount}
            sub={deployCount > 0 ? "Live on the web" : "None live yet"}
            accent={deployCount > 0 ? "hsl(151 60% 50%)" : undefined}
          />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
          Growth Charts
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <EmptyChart label="Revenue Growth"     connectLabel="Connect Stripe"  settingsHref="/dashboard/settings" />
          <EmptyChart label="Traffic Growth"     connectLabel="Connect Vercel"  settingsHref="/dashboard/settings" />
          <EmptyChart label="Lead Growth"        connectLabel="Connect Forms"   settingsHref="/dashboard/settings" />
          <EmptyChart label="Conversion Rate"    connectLabel="Connect Stripe"  settingsHref="/dashboard/settings" />
        </div>
      </div>

      {/* ── Business quality chart (real data) ── */}
      {data.scoreDistribution.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
            Project Quality
          </p>
          <div className="rounded-xl p-5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
            <p className="text-xs font-medium mb-4" style={{ color: "hsl(220 9% 40%)" }}>AI quality scores across all projects</p>
            <ScoreBarChart data={data.scoreDistribution} />
          </div>
        </div>
      )}

      {/* ── Project performance table ── */}
      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
          Project Performance
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          <div
            className="grid px-5 py-2.5 text-xs font-medium"
            style={{
              gridTemplateColumns: "1fr 90px 70px 120px 90px 80px",
              color: "hsl(220 9% 34%)",
              borderBottom: "1px solid hsl(220 13% 14%)",
              backgroundColor: "hsl(220 13% 11%)",
            }}
          >
            <span>Project</span>
            <span>Type</span>
            <span>Score</span>
            <span>Visitors</span>
            <span>Leads</span>
            <span>Status</span>
          </div>
          {data.projects.map((p, i) => {
            const status = p.hasWebsite ? (i === 0 && false ? "Deployed" : "Ready") : "Building";
            const statusStyle =
              status === "Deployed" ? { bg: "hsl(151 60% 48% / 0.1)", text: "hsl(151 60% 50%)" } :
              status === "Ready"    ? { bg: "hsl(213 94% 62% / 0.1)", text: "hsl(213 94% 62%)" } :
                                      { bg: "hsl(38 90% 55% / 0.1)",  text: "hsl(38 90% 58%)"  };
            return (
              <div
                key={p.id}
                className="grid px-5 py-3 text-xs items-center"
                style={{
                  gridTemplateColumns: "1fr 90px 70px 120px 90px 80px",
                  borderBottom: i < data.projects.length - 1 ? "1px solid hsl(220 13% 12%)" : "none",
                  backgroundColor: "hsl(220 13% 9%)",
                }}
              >
                <Link
                  href={`/workspace/${p.id}`}
                  className="font-medium truncate pr-3 transition-colors"
                  style={{ color: "hsl(220 9% 80%)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 96%)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 80%)"; }}
                >
                  {p.name}
                </Link>
                <span style={{ color: "hsl(220 9% 42%)" }}>{typeLabel(p.type)}</span>
                <span className="font-semibold tabular-nums" style={{ color: scoreColor(p.score) }}>{p.score}</span>
                <span style={{ color: "hsl(220 9% 28%)" }}>—</span>
                <span style={{ color: "hsl(220 9% 28%)" }}>—</span>
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium w-fit"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-2 px-0.5" style={{ color: "hsl(220 9% 28%)" }}>
          Visitors and Leads require Vercel Analytics + a form provider. Connect in Settings.
        </p>
      </div>

      {/* ── Deployment performance ── */}
      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
          Deployment Performance
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          <div
            className="grid px-5 py-2.5 text-xs font-medium"
            style={{
              gridTemplateColumns: "1fr 100px 110px 120px",
              color: "hsl(220 9% 34%)",
              borderBottom: "1px solid hsl(220 13% 14%)",
              backgroundColor: "hsl(220 13% 11%)",
            }}
          >
            <span>Project</span>
            <span>Deployments</span>
            <span>Last Deployed</span>
            <span>Platform</span>
          </div>
          {deployCount === 0 ? (
            <div className="px-5 py-6 text-center" style={{ backgroundColor: "hsl(220 13% 9%)" }}>
              <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>
                No deployments yet.{" "}
                <Link href="/dashboard/deployments" style={{ color: "hsl(213 94% 62%)" }}>
                  Go to Deployments →
                </Link>
              </p>
            </div>
          ) : (
            data.projects
              .filter((p) => {
                const raw = typeof window !== "undefined" ? localStorage.getItem(`lf_deploy_${p.id}`) : null;
                return !!raw;
              })
              .map((p, i, arr) => {
                let deploy: DeployRecord | null = null;
                try {
                  const raw = localStorage.getItem(`lf_deploy_${p.id}`);
                  if (raw) deploy = JSON.parse(raw);
                } catch {}
                return (
                  <div
                    key={p.id}
                    className="grid px-5 py-3 text-xs items-center"
                    style={{
                      gridTemplateColumns: "1fr 100px 110px 120px",
                      borderBottom: i < arr.length - 1 ? "1px solid hsl(220 13% 12%)" : "none",
                      backgroundColor: "hsl(220 13% 9%)",
                    }}
                  >
                    <Link href={`/workspace/${p.id}`} className="font-medium truncate pr-3" style={{ color: "hsl(220 9% 80%)" }}>
                      {p.name}
                    </Link>
                    <span style={{ color: "hsl(220 9% 52%)" }}>1</span>
                    <span style={{ color: "hsl(220 9% 42%)" }}>
                      {deploy?.deployedAt ? formatRelative(deploy.deployedAt) : "—"}
                    </span>
                    <span style={{ color: "hsl(220 9% 38%)" }}>
                      {deploy?.url ? (deploy.url.includes("vercel") ? "Vercel" : "Manual") : "—"}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* ── Integration status ── */}
      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
          Integrations
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          {[
            { name: "Stripe",  purpose: "Revenue, subscriptions, MRR" },
            { name: "Vercel",  purpose: "Traffic, deployments, performance" },
            { name: "GitHub",  purpose: "Commits, build history, repository" },
          ].map((svc, i, arr) => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                borderBottom: i < arr.length - 1 ? "1px solid hsl(220 13% 13%)" : "none",
                backgroundColor: "hsl(220 13% 9%)",
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "hsl(220 9% 70%)" }}>{svc.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 34%)" }}>{svc.purpose}</p>
              </div>
              <Link
                href="/dashboard/settings"
                className="h-7 px-3 rounded-md text-xs font-medium transition-colors"
                style={{ border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 44%)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 32%)"; (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 62%)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 22%)"; (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 44%)"; }}
              >
                Connect
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Advisor ── */}
      {advisorInsights.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>
            AI Advisor
          </p>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(213 94% 62% / 0.15)", backgroundColor: "hsl(213 94% 62% / 0.03)" }}>
            {advisorInsights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-4"
                style={{ borderBottom: i < advisorInsights.length - 1 ? "1px solid hsl(213 94% 62% / 0.08)" : "none" }}
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(213 94% 62%)" }} />
                <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 58%)" }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Revenue ──────────────────────────────────────────────────────────────

function RevenueTab() {
  return (
    <div className="max-w-2xl">
      <ConnectPrompt
        service="Stripe"
        logo={
          <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
            <path d="M13.3 10.6c0-.9.8-1.3 2-1.3 1.8 0 4 .5 5.7 1.5V6.4C19.3 5.5 17.4 5 15.3 5c-4.4 0-7.3 2.3-7.3 6.2 0 6 8.3 5 8.3 7.6 0 1-.9 1.4-2.2 1.4-1.9 0-4.3-.8-6.2-1.8v4.4c2.1.9 4.2 1.3 6.2 1.3 4.5 0 7.6-2.2 7.6-6.2-.1-6.4-8.4-5.3-8.4-7.3z" fill="hsl(213 94% 62%)" />
          </svg>
        }
        description="Connect your Stripe account to view revenue, MRR, ARR, recent transactions, and subscription metrics directly inside LaunchForge."
        metrics={["Monthly Recurring Revenue","Annual Recurring Revenue","Total Revenue","Average Order Value","Recent Transactions","Subscription Count","Refund Rate","Revenue Trends"]}
        settingsHref="/dashboard/settings"
      />
    </div>
  );
}

// ── Tab: Traffic ──────────────────────────────────────────────────────────────

function TrafficTab() {
  return (
    <div className="max-w-2xl">
      <ConnectPrompt
        service="Vercel Analytics"
        logo={
          <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
            <path d="M14 4L26 23H2L14 4Z" fill="hsl(220 9% 72%)" />
          </svg>
        }
        description="Connect Vercel to view real-time traffic data for your deployed websites, including visitor counts, top pages, and traffic sources."
        metrics={["Unique Visitors","Total Page Views","Top Pages","Bounce Rate","Traffic Sources","Geographic Data","Device Breakdown","Traffic Trends"]}
        settingsHref="/dashboard/settings"
      />
    </div>
  );
}

// ── Tab: Deployments ──────────────────────────────────────────────────────────

function DeploymentsTab() {
  return (
    <div className="max-w-2xl">
      <ConnectPrompt
        service="Vercel + GitHub"
        logo={
          <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
            <path d="M14 4L26 23H2L14 4Z" fill="hsl(220 9% 72%)" />
          </svg>
        }
        description="Connect Vercel and GitHub to track deployments, build status, commit history, and website health across all your projects."
        metrics={["Deployment History","Build Status","Last Deployment Time","Commit Activity","Error Rates","Build Duration","Branch Activity","Domain Status"]}
        settingsHref="/dashboard/settings"
      />
    </div>
  );
}

// ── Tab: Goals ────────────────────────────────────────────────────────────────

const DEFAULT_GOALS: Omit<Goal, "createdAt">[] = [
  { id: "goal_first_project",   title: "Create your first project",     description: "Generate a business using the LaunchForge engine",              type: "auto",   autoKey: "has_projects",  completed: false },
  { id: "goal_first_website",   title: "Generate a website",            description: "Build a landing page for one of your projects",                  type: "auto",   autoKey: "has_website",   completed: false },
  { id: "goal_first_marketing", title: "Build a marketing plan",        description: "Generate a launch strategy and content calendar",                type: "auto",   autoKey: "has_marketing", completed: false },
  { id: "goal_connect_stripe",  title: "Connect Stripe",                description: "Link your Stripe account to start tracking revenue",             type: "manual",                             completed: false },
  { id: "goal_connect_vercel",  title: "Connect Vercel",                description: "Deploy your website and start tracking real traffic",            type: "manual",                             completed: false },
  { id: "goal_first_100",       title: "Reach 100 visitors",            description: "Requires Vercel Analytics — connect Vercel to track progress",   type: "locked",                             completed: false },
  { id: "goal_first_sale",      title: "Make your first sale",          description: "Requires Stripe — connect Stripe to track revenue",              type: "locked",                             completed: false },
  { id: "goal_100_mrr",         title: "Reach $100 MRR",                description: "Requires Stripe — connect Stripe to track monthly revenue",      type: "locked",                             completed: false },
];

function GoalsTab({ data }: { data: AnalyticsData }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("lf_goals");
    if (raw) { try { setGoals(JSON.parse(raw)); return; } catch { /* fall through */ } }
    const initial: Goal[] = DEFAULT_GOALS.map((g) => ({ ...g, createdAt: new Date().toISOString() }));
    setGoals(initial);
    localStorage.setItem("lf_goals", JSON.stringify(initial));
  }, []);

  useEffect(() => {
    if (goals.length === 0) return;
    const autoConditions: Record<string, boolean> = {
      has_projects:  data.totalProjects > 0,
      has_website:   data.totalWebsites > 0,
      has_marketing: data.totalMarketingPlans > 0,
    };
    const updated = goals.map((g) => {
      if (g.type === "auto" && g.autoKey && autoConditions[g.autoKey] && !g.completed) return { ...g, completed: true };
      return g;
    });
    const changed = updated.some((g, i) => g.completed !== goals[i].completed);
    if (changed) { setGoals(updated); localStorage.setItem("lf_goals", JSON.stringify(updated)); }
  }, [data, goals]);

  function toggleGoal(id: string) {
    setGoals((prev) => {
      const next = prev.map((g) => g.id === id && g.type === "manual" ? { ...g, completed: !g.completed } : g);
      localStorage.setItem("lf_goals", JSON.stringify(next));
      return next;
    });
  }

  function addCustomGoal() {
    if (!newGoal.trim()) return;
    const g: Goal = { id: `goal_custom_${Date.now()}`, title: newGoal.trim(), description: "Custom goal", type: "manual", completed: false, createdAt: new Date().toISOString() };
    setGoals((prev) => { const next = [...prev, g]; localStorage.setItem("lf_goals", JSON.stringify(next)); return next; });
    setNewGoal(""); setAdding(false);
  }

  function removeGoal(id: string) {
    setGoals((prev) => { const next = prev.filter((g) => g.id !== id); localStorage.setItem("lf_goals", JSON.stringify(next)); return next; });
  }

  const completed = goals.filter((g) => g.completed);
  const pending   = goals.filter((g) => !g.completed && g.type !== "locked");
  const locked    = goals.filter((g) => g.type === "locked");
  const pct = goals.length > 0 ? Math.round((completed.length / goals.filter((g) => g.type !== "locked").length) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl px-5 py-5 space-y-3" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 80%)" }}>Goal progress</p>
          <p className="text-xs tabular-nums font-semibold" style={{ color: scoreColor(pct) }}>{completed.length} of {goals.filter((g) => g.type !== "locked").length} complete</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: "hsl(151 60% 48%)" }} />
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 px-0.5 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>In progress</p>
          <div className="space-y-2">
            {pending.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-xl px-4 py-3.5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => g.type === "manual" && toggleGoal(g.id)}
                    className="w-4 h-4 rounded border shrink-0 flex items-center justify-center"
                    style={{ borderColor: "hsl(220 13% 26%)", cursor: g.type === "auto" ? "default" : "pointer" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "hsl(220 9% 76%)" }}>{g.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{g.description}</p>
                  </div>
                </div>
                {g.id.startsWith("goal_custom_") && (
                  <button onClick={() => removeGoal(g.id)} className="ml-3 text-xs shrink-0" style={{ color: "hsl(220 9% 28%)" }}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 px-0.5 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>Completed</p>
          <div className="space-y-2">
            {completed.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ border: "1px solid hsl(151 60% 48% / 0.15)", backgroundColor: "hsl(151 60% 48% / 0.04)" }}>
                <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0" style={{ borderColor: "hsl(151 60% 48%)", backgroundColor: "hsl(151 60% 48%)" }}>
                  <IconCheck />
                </div>
                <p className="text-sm font-medium line-through" style={{ color: "hsl(220 9% 46%)" }}>{g.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 px-0.5 uppercase tracking-wider" style={{ color: "hsl(220 9% 28%)" }}>Locked — requires integrations</p>
          <div className="space-y-2">
            {locked.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-xl px-4 py-3.5 opacity-50" style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}>
                <div className="w-4 h-4 rounded border shrink-0 flex items-center justify-center" style={{ borderColor: "hsl(220 13% 22%)" }}>
                  <IconLock />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "hsl(220 9% 46%)" }}>{g.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 28%)" }}>{g.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        {adding ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCustomGoal(); if (e.key === "Escape") setAdding(false); }}
              placeholder="Goal title..."
              className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 82%)" }}
            />
            <button onClick={addCustomGoal} className="h-9 px-4 rounded-lg text-xs font-semibold" style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}>Add</button>
            <button onClick={() => setAdding(false)} className="h-9 px-3 rounded-lg text-xs" style={{ border: "1px solid hsl(220 13% 20%)", color: "hsl(220 9% 46%)" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="text-xs font-medium" style={{ color: "hsl(213 94% 62%)" }}>
            + Add custom goal
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tab: Activity ─────────────────────────────────────────────────────────────

function ActivityTab({ data }: { data: AnalyticsData }) {
  if (data.projects.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-xl px-5 py-12 flex flex-col items-center gap-3" style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}>
          <p className="text-sm font-medium" style={{ color: "hsl(220 9% 40%)" }}>No activity yet</p>
          <p className="text-xs text-center" style={{ color: "hsl(220 9% 28%)" }}>Your project generations, website builds, and marketing plans will appear here.</p>
        </div>
      </div>
    );
  }

  const events: Array<{ label: string; detail: string; time: string; type: "project" | "website" | "marketing" | "files" }> = [];
  for (const p of data.projects.slice(0, 20)) {
    events.push({ label: `Generated "${p.name}"`,                 detail: `${typeLabel(p.type)} · Score ${p.score}/100`,  time: p.createdAt, type: "project"   });
    if (p.hasWebsite)   events.push({ label: `Website built for "${p.name}"`,         detail: `${p.websiteFileCount} pages generated`,            time: p.createdAt, type: "website"   });
    if (p.hasMarketing) events.push({ label: `Marketing plan created for "${p.name}"`,detail: "Launch strategy and content calendar",              time: p.createdAt, type: "marketing" });
    if (p.fileCount > 0)events.push({ label: `Files generated for "${p.name}"`,       detail: `${p.fileCount} project files`,                     time: p.createdAt, type: "files"     });
  }
  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const dotColor = { project: "hsl(213 94% 62%)", website: "hsl(151 60% 48%)", marketing: "hsl(38 90% 55%)", files: "hsl(220 9% 40%)" };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
        <div className="px-5 py-3" style={{ borderBottom: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 11%)" }}>
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 40%)" }}>Recent activity</p>
        </div>
        <div style={{ backgroundColor: "hsl(220 13% 9%)" }}>
          {events.slice(0, 24).map((e, i) => (
            <div key={i} className="flex items-start gap-3.5 px-5 py-3.5" style={{ borderBottom: i < Math.min(events.length, 24) - 1 ? "1px solid hsl(220 13% 12%)" : "none" }}>
              <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor[e.type] }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "hsl(220 9% 76%)" }}>{e.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{e.detail}</p>
              </div>
              <span className="text-xs shrink-0 mt-0.5" style={{ color: "hsl(220 9% 30%)" }}>{formatRelative(e.time)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl px-4 py-4" style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "hsl(220 9% 38%)" }}>More activity sources</p>
        <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 34%)" }}>
          Connect Stripe to see sales and subscription events. Connect Vercel to see deployment activity. Connect GitHub to see commit history.{" "}
          <Link href="/dashboard/settings" className="underline" style={{ color: "hsl(213 94% 62%)" }}>Go to Settings</Link>
        </p>
      </div>
    </div>
  );
}

// ── Tab nav ───────────────────────────────────────────────────────────────────

const TABS: { id: AnalyticsTab; label: string; locked?: boolean }[] = [
  { id: "overview",    label: "Overview"    },
  { id: "revenue",     label: "Revenue",    locked: true },
  { id: "traffic",     label: "Traffic",    locked: true },
  { id: "deployments", label: "Deployments", locked: true },
  { id: "goals",       label: "Goals"       },
  { id: "activity",    label: "Activity"    },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [tab,     setTab]     = useState<AnalyticsTab>("overview");
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [goals,   setGoals]   = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Count deploy records for sidebar and overview
  const [deployCount, setDeployCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await actionGetAnalyticsData();
    setData(result);

    // Count localStorage deploy records
    let count = 0;
    result.projects.forEach((p) => {
      if (localStorage.getItem(`lf_deploy_${p.id}`)) count++;
    });
    setDeployCount(count);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const raw = localStorage.getItem("lf_goals");
    if (raw) { try { setGoals(JSON.parse(raw)); } catch { /* ignore */ } }
  }, []);

  const businessScore = data ? calcBusinessScore(data, goals) : 0;

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: "hsl(220 14% 8%)" }}>

      {/* ── Left sidebar nav ── */}
      <div
        className="shrink-0 flex flex-col py-5"
        style={{ width: 172, borderRight: "1px solid hsl(220 13% 12%)" }}
      >
        <p
          className="text-xs font-semibold px-4 mb-4 uppercase"
          style={{ color: "hsl(220 9% 28%)", letterSpacing: "0.07em" }}
        >
          Analytics
        </p>

        <div className="space-y-0.5 px-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="w-full flex items-center justify-between px-2 h-8 rounded-md text-left transition-colors"
                style={{
                  backgroundColor: active ? "hsl(220 13% 15%)" : "transparent",
                  color: active ? "hsl(220 9% 88%)" : "hsl(220 9% 42%)",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 12%)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                <span className="text-xs font-medium">{t.label}</span>
                {t.locked && (
                  <span style={{ color: "hsl(220 9% 24%)", opacity: 0.8 }}><IconLock /></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Score ring at bottom of sidebar */}
        {!loading && data && data.totalProjects > 0 && (
          <div className="mt-auto mx-2 mb-2">
            <div
              className="rounded-xl p-3 text-center"
              style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 11%)" }}
            >
              <p className="text-xs mb-2" style={{ color: "hsl(220 9% 30%)" }}>Score</p>
              <ScoreRing score={businessScore} size={60} />
            </div>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : data ? (
          <div className="px-8 py-8">
            {/* Page header */}
            <div className="mb-7">
              <h1 className="text-xl font-semibold" style={{ color: "hsl(220 9% 88%)", letterSpacing: "-0.01em" }}>
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
                {tab === "overview"    && "Your business performance at a glance"}
                {tab === "revenue"     && "Revenue and subscription tracking"}
                {tab === "traffic"     && "Website visitors and traffic sources"}
                {tab === "deployments" && "Deployment history and build status"}
                {tab === "goals"       && "Milestones and progress tracking"}
                {tab === "activity"    && "Recent actions and events"}
              </p>
            </div>

            {tab === "overview"    && <OverviewTab data={data} goals={goals} businessScore={businessScore} deployCount={deployCount} />}
            {tab === "revenue"     && <RevenueTab />}
            {tab === "traffic"     && <TrafficTab />}
            {tab === "deployments" && <DeploymentsTab />}
            {tab === "goals"       && <GoalsTab data={data} />}
            {tab === "activity"    && <ActivityTab data={data} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
