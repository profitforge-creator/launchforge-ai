import { ScoreRing } from "@/components/ui/score-ring";
import type { OpportunityScore, BusinessResult } from "@/types";

function ScoreBar({ score, inverted = false, label }: { score: number; inverted?: boolean; label: string }) {
  const effective = inverted ? 100 - score : score;
  const color = effective >= 80 ? "hsl(151 60% 48%)" : effective >= 60 ? "hsl(38 90% 55%)" : "hsl(0 72% 58%)";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: "hsl(220 9% 50%)" }}>{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 18%)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function OpportunityTab({ result }: { result: BusinessResult }) {
  const { scores, formData, marketGaps, summary } = result;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div
        className="rounded-xl p-5"
        style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 45%)" }}>Opportunity summary</p>
        <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 72%)" }}>{summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Score breakdown */}
        <div
          className="rounded-xl p-5"
          style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
        >
          <p className="text-xs font-medium mb-5" style={{ color: "hsl(220 9% 45%)" }}>Score breakdown</p>
          <div className="flex items-center gap-6">
            <ScoreRing score={scores.overall} label="Overall" size="lg" />
            <div className="flex-1 space-y-3.5">
              <ScoreBar score={scores.demand} label="Demand" />
              <ScoreBar score={scores.monetization} label="Monetization" />
              <ScoreBar score={scores.competition} label="Competition" inverted />
              <ScoreBar score={scores.difficulty} label="Difficulty" inverted />
            </div>
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid hsl(220 13% 15%)" }}>
            <p className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
              Category: <span className="font-semibold" style={{ color: "hsl(220 9% 70%)" }}>{scores.category}</span>
              {" "}· Weighted: Demand 35%, Monetization 30%, Competition 20%, Difficulty 15%
            </p>
          </div>
        </div>

        {/* Inputs + market gaps */}
        <div className="space-y-4">
          <div
            className="rounded-xl p-5"
            style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
          >
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 45%)" }}>Based on your inputs</p>
            {[
              { label: "Interests",   value: formData.interests },
              { label: "Skills",      value: formData.skills },
              { label: "Time / week", value: `${formData.timePerWeek} hrs/week` },
              { label: "Income goal", value: `$${formData.incomeGoal}/month` },
              { label: "Biz type",    value: formData.businessType },
            ].map((row) => (
              <div
                key={row.label}
                className="flex gap-3 py-1.5"
                style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}
              >
                <span className="text-xs w-20 shrink-0" style={{ color: "hsl(220 9% 38%)" }}>{row.label}</span>
                <span className="text-xs font-medium flex-1" style={{ color: "hsl(220 9% 72%)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {marketGaps.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 45%)" }}>Market gaps identified</p>
              <ul className="space-y-2">
                {marketGaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs font-mono shrink-0 mt-0.5" style={{ color: "hsl(220 9% 32%)" }}>{i + 1}.</span>
                    <span className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 62%)" }}>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
