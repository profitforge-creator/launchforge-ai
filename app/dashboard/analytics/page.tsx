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

// ── Utility ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return formatDate(iso);
}

function calcBusinessScore(data: AnalyticsData, goals: Goal[]): number {
  if (data.totalProjects === 0) return 0;
  let score = 0;
  score += Math.min(data.totalProjects * 15, 30);    // up to 30 pts for projects
  score += Math.min(data.totalWebsites * 15, 20);    // up to 20 pts for websites
  score += Math.round(data.avgScore * 0.35);          // up to 35 pts from avg quality score
  const completedGoals = goals.filter((g) => g.completed).length;
  score += Math.min(completedGoals * 5, 15);          // up to 15 pts for goals
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

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl px-5 py-5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
      <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 36%)" }}>{label}</p>
      <p className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: accent ?? "hsl(220 9% 90%)", letterSpacing: "-0.03em" }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: "hsl(220 9% 32%)" }}>{sub}</p>}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(220 13% 15%)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={16} fontWeight={700} fill={color}>{score}</text>
    </svg>
  );
}

// ── Bar chart (SVG, real data only) ──────────────────────────────────────────

function ScoreBarChart({ data }: { data: { label: string; score: number }[] }) {
  if (data.length === 0) return null;
  const h = 80;
  const barW = Math.min(36, Math.floor(560 / data.length) - 6);
  const gap = Math.floor(560 / data.length);

  return (
    <svg width="100%" viewBox={`0 0 ${data.length * gap} ${h + 28}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.score / 100) * h);
        const x = i * gap + (gap - barW) / 2;
        const y = h - barH;
        const color = scoreColor(d.score);
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={0.8} />
            <text
              x={x + barW / 2} y={h + 14}
              textAnchor="middle" fontSize={9} fill="hsl(220 9% 36%)"
              style={{ fontFamily: "inherit" }}
            >
              {d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label}
            </text>
            <text
              x={x + barW / 2} y={y - 4}
              textAnchor="middle" fontSize={9} fill={color}
              style={{ fontFamily: "inherit" }}
            >
              {d.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Connect prompt ────────────────────────────────────────────────────────────

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

function OverviewTab({ data, goals, businessScore }: { data: AnalyticsData; goals: Goal[]; businessScore: number }) {
  const advisorInsights: string[] = [];

  if (data.totalProjects === 0) {
    advisorInsights.push("You have not created any projects yet. Head to the Projects page to generate your first business.");
  } else {
    if (data.totalWebsites === 0) {
      advisorInsights.push(`You have ${data.totalProjects} project${data.totalProjects > 1 ? "s" : ""} but no websites generated yet. Open a project and click the Website tab to generate your site.`);
    }
    if (data.totalProjects > 1 && data.totalWebsites < data.totalProjects) {
      advisorInsights.push(`${data.totalProjects - data.totalWebsites} of your projects are missing a website. Generate websites to unlock deployment.`);
    }
    if (data.topProject && data.topProject.topRecommendation) {
      advisorInsights.push(`Your highest-scored project "${data.topProject.name}" has an open recommendation: ${data.topProject.topRecommendation}`);
    }
    if (data.avgScore < 70) {
      advisorInsights.push("Your average business score is below 70. Use the Improve buttons in each project workspace to increase quality.");
    }
    advisorInsights.push("Connect Stripe and Vercel in Settings to unlock revenue tracking, traffic analytics, and one-click deployment.");
  }

  const completedGoals = goals.filter((g) => g.completed).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Business score + stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl p-5 flex flex-col items-center justify-center gap-2" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
          <ScoreRing score={businessScore} />
          <p className="text-xs text-center" style={{ color: "hsl(220 9% 36%)" }}>Business Score</p>
        </div>
        <StatCard label="Projects"      value={data.totalProjects}      sub="Generated businesses"     />
        <StatCard label="Websites"      value={data.totalWebsites}       sub="Ready for deployment"    />
        <StatCard label="Avg Quality"   value={data.avgScore > 0 ? `${data.avgScore}/100` : "—"} sub="Across all projects" accent={data.avgScore > 0 ? scoreColor(data.avgScore) : undefined} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Files Generated" value={data.totalFiles}          sub="Across all projects"      />
        <StatCard label="Marketing Plans"  value={data.totalMarketingPlans} sub="Launch strategies ready"  />
        <StatCard label="Goals Completed"  value={`${completedGoals}/${goals.length}`} sub="Milestones reached"   />
      </div>

      {/* Score distribution chart */}
      {data.scoreDistribution.length > 0 && (
        <div className="rounded-xl p-5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
          <p className="text-xs font-semibold mb-4" style={{ color: "hsl(220 9% 38%)" }}>Project quality scores</p>
          <ScoreBarChart data={data.scoreDistribution} />
        </div>
      )}

      {/* Integration status */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
        <div className="px-5 py-3" style={{ borderBottom: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 11%)" }}>
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 40%)" }}>Integration status</p>
        </div>
        <div style={{ backgroundColor: "hsl(220 13% 9%)" }}>
          {[
            { name: "Stripe",  purpose: "Revenue, subscriptions, MRR", status: "Not connected" },
            { name: "Vercel",  purpose: "Traffic, deployments, performance", status: "Not connected" },
            { name: "GitHub",  purpose: "Commits, build history, repository", status: "Not connected" },
          ].map((svc, i, arr) => (
            <div key={svc.name} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "hsl(220 9% 72%)" }}>{svc.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{svc.purpose}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>{svc.status}</span>
                <Link
                  href="/dashboard/settings"
                  className="h-7 px-3 rounded-md text-xs font-medium"
                  style={{ border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 52%)" }}
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Advisor */}
      {advisorInsights.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          <div className="px-5 py-3" style={{ borderBottom: "1px solid hsl(213 94% 62% / 0.12)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}>
            <p className="text-xs font-semibold" style={{ color: "hsl(213 94% 62%)" }}>AI Advisor recommendations</p>
          </div>
          <div className="divide-y" style={{ backgroundColor: "hsl(220 13% 9%)", borderColor: "hsl(220 13% 13%)" }}>
            {advisorInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(213 94% 62%)" }} />
                <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 60%)" }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects table */}
      {data.projects.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 15%)" }}>
          <div className="px-5 py-3" style={{ borderBottom: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 11%)" }}>
            <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 40%)" }}>All projects</p>
          </div>
          <div>
            <div
              className="grid px-5 py-2.5 text-xs font-medium"
              style={{ gridTemplateColumns: "1fr 100px 60px 80px 80px", color: "hsl(220 9% 34%)", borderBottom: "1px solid hsl(220 13% 13%)", backgroundColor: "hsl(220 13% 10%)" }}
            >
              <span>Project</span><span>Type</span><span>Score</span><span>Website</span><span>Created</span>
            </div>
            {data.projects.map((p, i) => (
              <div
                key={p.id}
                className="grid px-5 py-3 text-xs items-center"
                style={{
                  gridTemplateColumns: "1fr 100px 60px 80px 80px",
                  borderBottom: i < data.projects.length - 1 ? "1px solid hsl(220 13% 12%)" : "none",
                  backgroundColor: "hsl(220 13% 9%)",
                }}
              >
                <Link href={`/workspace/${p.id}`} className="font-medium truncate pr-3 hover:underline" style={{ color: "hsl(220 9% 80%)" }}>
                  {p.name}
                </Link>
                <span style={{ color: "hsl(220 9% 44%)" }}>{typeLabel(p.type)}</span>
                <span className="font-semibold tabular-nums" style={{ color: scoreColor(p.score) }}>{p.score}</span>
                <span style={{ color: p.hasWebsite ? "hsl(151 60% 48%)" : "hsl(220 9% 30%)" }}>{p.hasWebsite ? "Ready" : "—"}</span>
                <span style={{ color: "hsl(220 9% 36%)" }}>{formatRelative(p.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.projects.length === 0 && (
        <div className="rounded-xl px-5 py-12 flex flex-col items-center gap-3" style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}>
          <p className="text-sm font-medium" style={{ color: "hsl(220 9% 40%)" }}>No projects yet</p>
          <p className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>Create your first project to see analytics here</p>
          <Link href="/dashboard" className="mt-2 h-8 px-4 rounded-lg text-xs font-semibold" style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}>
            New project
          </Link>
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
        metrics={[
          "Monthly Recurring Revenue",
          "Annual Recurring Revenue",
          "Total Revenue",
          "Average Order Value",
          "Recent Transactions",
          "Subscription Count",
          "Refund Rate",
          "Revenue Trends",
        ]}
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
        metrics={[
          "Unique Visitors",
          "Total Page Views",
          "Top Pages",
          "Bounce Rate",
          "Traffic Sources",
          "Geographic Data",
          "Device Breakdown",
          "Traffic Trends",
        ]}
        settingsHref="/dashboard/settings"
      />
    </div>
  );
}

// ── Tab: Deployments ──────────────────────────────────────────────────────────

function DeploymentsTab() {
  return (
    <div className="max-w-2xl space-y-6">
      <ConnectPrompt
        service="Vercel + GitHub"
        logo={
          <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
            <path d="M14 4L26 23H2L14 4Z" fill="hsl(220 9% 72%)" />
          </svg>
        }
        description="Connect Vercel and GitHub to track deployments, build status, commit history, and website health across all your projects."
        metrics={[
          "Deployment History",
          "Build Status",
          "Last Deployment Time",
          "Commit Activity",
          "Error Rates",
          "Build Duration",
          "Branch Activity",
          "Domain Status",
        ]}
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
    if (raw) {
      try { setGoals(JSON.parse(raw)); return; } catch { /* fall through */ }
    }
    const initial: Goal[] = DEFAULT_GOALS.map((g) => ({ ...g, createdAt: new Date().toISOString() }));
    setGoals(initial);
    localStorage.setItem("lf_goals", JSON.stringify(initial));
  }, []);

  // Auto-complete goals based on real data
  useEffect(() => {
    if (goals.length === 0) return;
    const autoConditions: Record<string, boolean> = {
      has_projects:  data.totalProjects > 0,
      has_website:   data.totalWebsites > 0,
      has_marketing: data.totalMarketingPlans > 0,
    };
    const updated = goals.map((g) => {
      if (g.type === "auto" && g.autoKey && autoConditions[g.autoKey] && !g.completed) {
        return { ...g, completed: true };
      }
      return g;
    });
    const changed = updated.some((g, i) => g.completed !== goals[i].completed);
    if (changed) {
      setGoals(updated);
      localStorage.setItem("lf_goals", JSON.stringify(updated));
    }
  }, [data, goals]);

  function toggleGoal(id: string) {
    setGoals((prev) => {
      const next = prev.map((g) =>
        g.id === id && g.type === "manual" ? { ...g, completed: !g.completed } : g,
      );
      localStorage.setItem("lf_goals", JSON.stringify(next));
      return next;
    });
  }

  function addCustomGoal() {
    if (!newGoal.trim()) return;
    const g: Goal = {
      id: `goal_custom_${Date.now()}`,
      title: newGoal.trim(),
      description: "Custom goal",
      type: "manual",
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => {
      const next = [...prev, g];
      localStorage.setItem("lf_goals", JSON.stringify(next));
      return next;
    });
    setNewGoal("");
    setAdding(false);
  }

  function removeGoal(id: string) {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      localStorage.setItem("lf_goals", JSON.stringify(next));
      return next;
    });
  }

  const completed = goals.filter((g) => g.completed);
  const pending   = goals.filter((g) => !g.completed && g.type !== "locked");
  const locked    = goals.filter((g) => g.type === "locked");

  const pct = goals.length > 0 ? Math.round((completed.length / goals.filter((g) => g.type !== "locked").length) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Progress */}
      <div className="rounded-xl px-5 py-5 space-y-3" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 80%)" }}>Goal progress</p>
          <p className="text-xs tabular-nums font-semibold" style={{ color: scoreColor(pct) }}>{completed.length} of {goals.filter((g) => g.type !== "locked").length} complete</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "hsl(151 60% 48%)" }} />
        </div>
      </div>

      {/* Pending goals */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 px-0.5" style={{ color: "hsl(220 9% 34%)" }}>In progress</p>
          <div className="space-y-2">
            {pending.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl px-4 py-3.5"
                style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
              >
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

      {/* Completed goals */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 px-0.5" style={{ color: "hsl(220 9% 34%)" }}>Completed</p>
          <div className="space-y-2">
            {completed.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                style={{ border: "1px solid hsl(151 60% 48% / 0.15)", backgroundColor: "hsl(151 60% 48% / 0.04)" }}
              >
                <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0" style={{ borderColor: "hsl(151 60% 48%)", backgroundColor: "hsl(151 60% 48%)" }}>
                  <svg width="9" height="9" fill="none" viewBox="0 0 12 12" stroke="hsl(220 14% 7%)" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium line-through" style={{ color: "hsl(220 9% 46%)" }}>{g.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked goals */}
      {locked.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 px-0.5" style={{ color: "hsl(220 9% 34%)" }}>Locked — requires integrations</p>
          <div className="space-y-2">
            {locked.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 opacity-50"
                style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}
              >
                <div className="w-4 h-4 rounded border shrink-0" style={{ borderColor: "hsl(220 13% 22%)" }}>
                  <svg className="w-full h-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "hsl(220 9% 30%)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
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

      {/* Add custom goal */}
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

  // Build synthetic activity feed from project data
  const events: Array<{ label: string; detail: string; time: string; type: "project" | "website" | "marketing" | "files" }> = [];

  for (const p of data.projects.slice(0, 20)) {
    events.push({ label: `Generated "${p.name}"`, detail: `${typeLabel(p.type)} · Score ${p.score}/100`, time: p.createdAt, type: "project" });
    if (p.hasWebsite) {
      events.push({ label: `Website built for "${p.name}"`, detail: `${p.websiteFileCount} pages generated`, time: p.createdAt, type: "website" });
    }
    if (p.hasMarketing) {
      events.push({ label: `Marketing plan created for "${p.name}"`, detail: "Launch strategy and content calendar", time: p.createdAt, type: "marketing" });
    }
    if (p.fileCount > 0) {
      events.push({ label: `Files generated for "${p.name}"`, detail: `${p.fileCount} project files`, time: p.createdAt, type: "files" });
    }
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
            <div
              key={i}
              className="flex items-start gap-3.5 px-5 py-3.5"
              style={{ borderBottom: i < Math.min(events.length, 24) - 1 ? "1px solid hsl(220 13% 12%)" : "none" }}
            >
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

      {/* External activity note */}
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

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const TABS: { id: AnalyticsTab; label: string }[] = [
  { id: "overview",     label: "Overview"     },
  { id: "revenue",      label: "Revenue"      },
  { id: "traffic",      label: "Traffic"      },
  { id: "deployments",  label: "Deployments"  },
  { id: "goals",        label: "Goals"        },
  { id: "activity",     label: "Activity"     },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await actionGetAnalyticsData();
    setData(result);
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
      {/* Left tab nav */}
      <div
        className="shrink-0 flex flex-col py-5 px-2"
        style={{ width: 168, borderRight: "1px solid hsl(220 13% 12%)" }}
      >
        <p className="text-xs font-semibold px-2 mb-3" style={{ color: "hsl(220 9% 32%)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Analytics</p>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2.5 px-2 h-8 rounded-md text-left transition-colors"
              style={{
                backgroundColor: active ? "hsl(220 13% 15%)" : "transparent",
                color: active ? "hsl(220 9% 88%)" : "hsl(220 9% 44%)",
              }}
            >
              <span className="text-xs font-medium">{t.label}</span>
              {/* Revenue/Traffic/Deployments show "Connect" badge */}
              {(t.id === "revenue" || t.id === "traffic" || t.id === "deployments") && (
                <span className="ml-auto text-xs" style={{ color: "hsl(220 9% 26%)" }}>—</span>
              )}
            </button>
          );
        })}

        {/* Business score in nav */}
        {!loading && data && (
          <div className="mt-auto px-2 py-4">
            <div className="rounded-xl p-3 text-center" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 11%)" }}>
              <p className="text-xs mb-2" style={{ color: "hsl(220 9% 34%)" }}>Business Score</p>
              <ScoreRing score={businessScore} size={64} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 min-w-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : data ? (
          <>
            {tab === "overview"    && <OverviewTab data={data} goals={goals} businessScore={businessScore} />}
            {tab === "revenue"     && <RevenueTab />}
            {tab === "traffic"     && <TrafficTab />}
            {tab === "deployments" && <DeploymentsTab />}
            {tab === "goals"       && <GoalsTab data={data} />}
            {tab === "activity"    && <ActivityTab data={data} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
