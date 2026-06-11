"use client";

import Link from "next/link";
import { GenerationForm } from "@/components/features/generation-form";
import { getHistoryRecords } from "@/lib/storage/generation-store";
import { formatRelativeDate } from "@/lib/utils";

// ── Score dot ─────────────────────────────────────────────────────────────────

function ScoreDot({ score }: { score: number }) {
  const color =
    score >= 80 ? "hsl(151 60% 48%)" :
    score >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";
  return (
    <span className="text-sm font-bold tabular-nums" style={{ color }}>
      {score}
    </span>
  );
}

// ── What gets built cards ─────────────────────────────────────────────────────

const DELIVERABLES = [
  { icon: "🔍", label: "Market Research",  desc: "Demand, competition, market gaps" },
  { icon: "📦", label: "Product",          desc: "Deliverables, pricing, positioning" },
  { icon: "🌐", label: "Website",          desc: "4-page Next.js site, ready to deploy" },
  { icon: "📣", label: "Marketing",        desc: "Launch plan, content hooks, ad concepts" },
  { icon: "📁", label: "Project Files",    desc: "15+ files, ZIP export, AI-editable" },
  { icon: "💬", label: "AI Advisor",       desc: "Chat to refine anything, anytime" },
];

// ── Recent project card ───────────────────────────────────────────────────────

function RecentProjectCard({ r }: { r: ReturnType<typeof getHistoryRecords>[number] }) {
  const scoreColor =
    r.overallScore >= 80 ? "hsl(151 60% 48%)" :
    r.overallScore >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";

  return (
    <Link
      href={`/workspace/${r.id}`}
      className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all"
      style={{
        border: "1px solid hsl(220 13% 13%)",
        backgroundColor: "hsl(220 13% 8%)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 20%)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 10%)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 13%)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 8%)";
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
        style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 19%)" }}
      >
        🚀
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "hsl(220 9% 85%)" }}>
          {r.productName}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(220 9% 36%)" }}>
          {r.niche} · {formatRelativeDate(r.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            backgroundColor: `${scoreColor.replace(")", " / 0.08)")}`,
            border: `1px solid ${scoreColor.replace(")", " / 0.18)")}`,
          }}
        >
          <ScoreDot score={r.overallScore} />
        </div>
        <svg
          width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"
          className="group-hover:translate-x-0.5 transition-transform"
          style={{ color: "hsl(220 9% 28%)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const records = getHistoryRecords();
  const recent  = records.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-10">

      {/* ── Hero ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: "hsl(213 94% 58% / 0.12)", border: "1px solid hsl(213 94% 58% / 0.2)" }}
          >
            🚀
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "hsl(213 94% 62% / 0.08)", color: "hsl(213 94% 65%)", border: "1px solid hsl(213 94% 62% / 0.15)" }}>
            AI Business Builder
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(220 9% 96%)", lineHeight: 1.2 }}>
          What do you want to build?
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 44%)" }}>
          Describe your idea or interests. LaunchForge&apos;s AI team will research the market, design a product, build a website, and create a full marketing system — in under 2 minutes.
        </p>
      </div>

      {/* ── Generation form ── */}
      <GenerationForm />

      {/* ── What gets built ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.08em" }}>
          What you get
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {DELIVERABLES.map((item) => (
            <div
              key={item.label}
              className="rounded-xl px-4 py-3.5"
              style={{ border: "1px solid hsl(220 13% 13%)", backgroundColor: "hsl(220 13% 8%)" }}
            >
              <div className="text-xl mb-2">{item.icon}</div>
              <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 78%)" }}>{item.label}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "hsl(220 9% 34%)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent projects ── */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.08em" }}>
              Recent Projects
            </p>
            <Link
              href="/dashboard/history"
              className="text-xs font-medium"
              style={{ color: "hsl(213 94% 62%)" }}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((r) => <RecentProjectCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* ── Empty state (no projects yet) ── */}
      {records.length === 0 && (
        <div
          className="rounded-xl px-6 py-10 text-center"
          style={{ border: "1px dashed hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 8%)" }}
        >
          <p className="text-2xl mb-3">✨</p>
          <p className="text-sm font-semibold mb-1" style={{ color: "hsl(220 9% 58%)" }}>
            Your first project is waiting
          </p>
          <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>
            Type anything above — an interest, a skill, or a goal. LaunchForge handles the rest.
          </p>
        </div>
      )}

      {/* ── Plan callout ── */}
      <div
        className="rounded-xl px-4 py-3.5 flex items-center justify-between gap-4"
        style={{ border: "1px solid hsl(220 13% 13%)", backgroundColor: "hsl(220 13% 8%)" }}
      >
        <div>
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 55%)" }}>
            Free Plan — {records.length} of 3 projects used
          </p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 30%)" }}>
            Upgrade for unlimited projects, priority AI, and one-click deploy.
          </p>
        </div>
        <Link
          href="/dashboard/account"
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            backgroundColor: "hsl(213 94% 62% / 0.1)",
            border: "1px solid hsl(213 94% 62% / 0.2)",
            color: "hsl(213 94% 65%)",
          }}
        >
          Upgrade →
        </Link>
      </div>

    </div>
  );
}
