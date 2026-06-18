import Link from "next/link";
import { getAllGenerations } from "@/lib/storage/generation-store";
import { DEFAULT_SERVICES } from "@/lib/account/types";
import { getUserPlan, getProjectUsage } from "@/lib/plans/server";
import { PLAN_META, nextTier } from "@/lib/plans/plans";
import { SUBSCRIPTION_LIMITS } from "@/types";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  used,
  limit,
  sub,
}: {
  label: string;
  used: number;
  limit: number | "unlimited";
  sub?: string;
}) {
  const pct = limit === "unlimited" ? 0 : Math.min((used / (limit as number)) * 100, 100);
  const barColor =
    pct >= 90 ? "hsl(0 72% 58%)" :
    pct >= 70 ? "hsl(38 90% 55%)" :
    "hsl(213 94% 58%)";

  return (
    <div
      className="rounded-xl px-5 py-5"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <p className="text-xs font-medium" style={{ color: "hsl(220 9% 44%)" }}>{label}</p>
        {limit === "unlimited" && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 48%)" }}
          >
            Unlimited
          </span>
        )}
      </div>

      <p className="text-3xl font-bold tabular-nums" style={{ color: "hsl(220 9% 88%)", letterSpacing: "-0.03em" }}>
        {used}
      </p>

      {limit !== "unlimited" && (
        <>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 16%)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "hsl(220 9% 32%)" }}>
            {(limit as number) - used} of {limit} remaining
          </p>
        </>
      )}

      {limit === "unlimited" && (
        <p className="text-xs mt-2" style={{ color: "hsl(220 9% 32%)" }}>
          {sub ?? "Not enforced in local preview"}
        </p>
      )}
    </div>
  );
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({ name, date, score }: { name: string; date: string; score: number }) {
  const scoreColor =
    score >= 80 ? "hsl(151 60% 48%)" :
    score >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>{name}</p>
        <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
          {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor }}>{score}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function UsagePage() {
  const generations = await getAllGenerations();
  const [plan, usage] = await Promise.all([getUserPlan(), getProjectUsage()]);
  const limits = SUBSCRIPTION_LIMITS[plan];
  const meta = PLAN_META[plan];
  const up = nextTier(plan);
  const upMeta = up ? PLAN_META[up] : null;
  const projLimit: number | "unlimited" = limits.projectsPerMonth < 0 ? "unlimited" : limits.projectsPerMonth;
  const editLimit: number | "unlimited" = limits.aiEditsPerProject < 0 ? "unlimited" : limits.aiEditsPerProject;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>
          Usage
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "hsl(220 9% 46%)" }}>
          Your current plan usage and activity.
        </p>
      </div>

      {/* Plan banner */}
      <div
        className="rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ border: "1px solid hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}
      >
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: "hsl(213 94% 65%)" }}>Current plan</p>
          <p className="text-lg font-bold" style={{ color: "hsl(220 9% 90%)" }}>
            {meta.label} <span style={{ color: "hsl(220 9% 44%)", fontWeight: 500 }}>· {meta.price}{plan === "free" ? "" : "/mo"}</span>
          </p>
          <p className="text-xs mt-1" style={{ color: "hsl(220 9% 44%)" }}>
            {plan === "free"
              ? "You're on the free preview — full generation, code, exports and integrations are locked."
              : meta.blurb}
          </p>
        </div>
        {upMeta ? (
          <Link
            href="/#pricing"
            className="h-9 px-5 rounded-xl text-sm font-semibold flex items-center"
            style={{ background: "linear-gradient(135deg, hsl(213 94% 64%), hsl(245 82% 62%))", color: "hsl(220 14% 7%)" }}
          >
            Upgrade to {upMeta.label} →
          </Link>
        ) : (
          <span className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 50%)" }}>
            Highest plan — unlimited
          </span>
        )}
      </div>

      {/* Free-plan upgrade nudge */}
      {plan === "free" && (
        <div
          className="rounded-xl px-6 py-4"
          style={{ border: "1px solid hsl(38 90% 55% / 0.25)", backgroundColor: "hsl(38 90% 55% / 0.05)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "hsl(38 90% 62%)" }}>
            The free plan shows you the magic — Starter lets you actually launch.
          </p>
          <p className="text-xs" style={{ color: "hsl(220 9% 50%)", lineHeight: 1.6 }}>
            Unlock full business generation, website + source code, ZIP export, and one-click GitHub &amp; Vercel deploys
            from <strong style={{ color: "hsl(220 9% 70%)" }}>$19/mo</strong>.{" "}
            <Link href="/#pricing" style={{ color: "hsl(213 94% 64%)" }}>See plans →</Link>
          </p>
        </div>
      )}

      {/* Usage stats */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 36%)" }}>Usage this period</p>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Businesses this month" used={usage.used} limit={projLimit} />
          <StatCard label="AI edits / project"    used={0}          limit={editLimit} sub={editLimit === "unlimited" ? "Unlimited edits" : undefined} />
        </div>
      </div>

      {/* Connected services */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 36%)" }}>Connected services</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
        >
          {DEFAULT_SERVICES.map((svc, i) => (
            <div
              key={svc.id}
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: i < DEFAULT_SERVICES.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "hsl(220 9% 72%)" }}>{svc.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 34%)" }}>{svc.description}</p>
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: svc.status === "connected" ? "hsl(151 60% 48%)" : "hsl(220 9% 30%)" }}
              >
                {svc.status === "connected" ? "Connected" : "Not connected"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 36%)" }}>Recent activity</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
        >
          {generations.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm" style={{ color: "hsl(220 9% 32%)" }}>No usage data available yet.</p>
              <p className="text-xs mt-1" style={{ color: "hsl(220 9% 24%)" }}>
                Activity will appear here once you create a project.
              </p>
            </div>
          ) : (
            generations.slice(0, 10).map((g) => (
              <ActivityRow
                key={g.id}
                name={g.product.name}
                date={g.createdAt}
                score={g.scores.overall}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
