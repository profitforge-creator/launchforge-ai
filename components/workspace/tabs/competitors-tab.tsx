import type { Competitor } from "@/types";

function CompetitorCard({ c }: { c: Competitor }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 90%)" }}>{c.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 40%)" }}>{c.url}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 72%)" }}>{c.pricing}</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 38%)" }}>~{c.monthlyRevenue}/mo</p>
        </div>
      </div>

      <div className="h-px" style={{ backgroundColor: "hsl(220 13% 15%)" }} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(151 60% 48%)" }}>Strengths</p>
          <ul className="space-y-1">
            {c.strengths.map((s) => (
              <li key={s} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 55%)" }}>
                <span className="shrink-0" style={{ color: "hsl(151 60% 48%)" }}>+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(0 72% 58%)" }}>Weaknesses</p>
          <ul className="space-y-1">
            {c.weaknesses.map((w) => (
              <li key={w} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 55%)" }}>
                <span className="shrink-0" style={{ color: "hsl(0 72% 58%)" }}>−</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>Market share (est.)</span>
          <span className="text-xs font-medium" style={{ color: "hsl(220 9% 65%)" }}>{c.marketShare}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 16%)" }}>
          <div className="h-full rounded-full" style={{ width: `${c.marketShare}%`, backgroundColor: "hsl(213 94% 62% / 0.4)" }} />
        </div>
      </div>
    </div>
  );
}

export function CompetitorsTab({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
        {competitors.length} key players in this space — their weaknesses are your positioning opportunities.
      </p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {competitors.map((c) => <CompetitorCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}
