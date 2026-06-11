import { ScoreRing } from "@/components/ui/score-ring";
import type { BusinessResult, Competitor } from "@/types";

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <p className="text-xs font-medium" style={{ color: "hsl(220 9% 40%)" }}>{label}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>{sub}</p>
    </div>
  );
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, inverted = false }: { label: string; score: number; inverted?: boolean }) {
  const effective = inverted ? 100 - score : score;
  const color =
    effective >= 80 ? "hsl(151 60% 48%)" :
    effective >= 60 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 16%)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Competitor card ───────────────────────────────────────────────────────────

function CompetitorCard({ c }: { c: Competitor }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "hsl(220 9% 90%)" }}>{c.name}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(220 9% 36%)" }}>{c.url}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 65%)" }}>{c.pricing}</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>~{c.monthlyRevenue}/mo</p>
        </div>
      </div>

      <div className="h-px" style={{ backgroundColor: "hsl(220 13% 14%)" }} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(151 60% 48%)" }}>Strengths</p>
          <ul className="space-y-1">
            {c.strengths.slice(0, 3).map((s) => (
              <li key={s} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 52%)" }}>
                <span className="shrink-0 mt-px" style={{ color: "hsl(151 60% 48%)" }}>+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(0 72% 62%)" }}>Weaknesses</p>
          <ul className="space-y-1">
            {c.weaknesses.slice(0, 3).map((w) => (
              <li key={w} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 52%)" }}>
                <span className="shrink-0 mt-px" style={{ color: "hsl(0 72% 62%)" }}>−</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Est. market share</span>
          <span className="text-xs font-medium" style={{ color: "hsl(220 9% 58%)" }}>{c.marketShare}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${c.marketShare}%`, backgroundColor: "hsl(213 94% 62% / 0.35)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function ResearchTab({ result }: { result: BusinessResult }) {
  const { scores, competitors, marketGaps, summary } = result;

  const competitionLabel =
    scores.competition <= 35 ? "Low" :
    scores.competition <= 65 ? "Medium" : "High";

  const demandLabel =
    scores.demand >= 80 ? "Very High" :
    scores.demand >= 60 ? "High" :
    scores.demand >= 40 ? "Medium" : "Low";

  return (
    <div className="space-y-6">

      {/* ── Top metrics row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Opportunity Score"
          value={scores.overall}
          sub={scores.category}
          color={
            scores.overall >= 80 ? "hsl(151 60% 52%)" :
            scores.overall >= 65 ? "hsl(38 90% 55%)" :
            "hsl(0 72% 58%)"
          }
        />
        <MetricCard
          label="Market Demand"
          value={demandLabel}
          sub={`${scores.demand}/100 demand score`}
          color="hsl(213 94% 65%)"
        />
        <MetricCard
          label="Competition"
          value={competitionLabel}
          sub={`${scores.competition}/100 competition index`}
          color={
            scores.competition <= 35 ? "hsl(151 60% 52%)" :
            scores.competition <= 65 ? "hsl(38 90% 55%)" :
            "hsl(0 72% 58%)"
          }
        />
        <MetricCard
          label="Monetization"
          value={`${scores.monetization}`}
          sub="Revenue potential score"
          color="hsl(151 60% 52%)"
        />
      </div>

      {/* ── Summary + Score breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
        >
          <div className="flex items-center gap-4">
            <ScoreRing score={scores.overall} label="Overall" size="lg" />
            <div className="flex-1 space-y-3">
              <ScoreBar label="Demand"       score={scores.demand} />
              <ScoreBar label="Monetization" score={scores.monetization} />
              <ScoreBar label="Competition"  score={scores.competition} inverted />
              <ScoreBar label="Difficulty"   score={scores.difficulty}  inverted />
            </div>
          </div>
          <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>
            Weighted: Demand 35% · Monetization 30% · Competition 20% · Difficulty 15%
          </p>
        </div>

        <div className="space-y-3">
          <div
            className="rounded-xl p-5"
            style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 40%)" }}>AI Analysis</p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 68%)" }}>{summary}</p>
          </div>

          {marketGaps.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 40%)" }}>
                Market gaps — your positioning opportunities
              </p>
              <ul className="space-y-2">
                {marketGaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs font-bold mt-px"
                      style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", color: "hsl(213 94% 65%)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 58%)" }}>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Competitors ── */}
      {competitors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 80%)" }}>
                Competitor Landscape
              </p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
                {competitors.length} key players · their weaknesses are your positioning opportunities
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {competitors.map((c) => <CompetitorCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

    </div>
  );
}
