import type { Recommendation } from "@/types";

const TYPE_STYLES = {
  improvement: { label: "Improvement", color: "hsl(213 94% 62%)",  bg: "hsl(213 94% 62% / 0.08)" },
  alternative:  { label: "Alternative",  color: "hsl(38 90% 55%)",  bg: "hsl(38 90% 55% / 0.08)"  },
  "next-step":  { label: "Next Step",    color: "hsl(151 60% 48%)", bg: "hsl(151 60% 48% / 0.08)" },
};

const PRIORITY_COLOR = {
  high:   "hsl(0 72% 58%)",
  medium: "hsl(38 90% 55%)",
  low:    "hsl(220 9% 45%)",
};

function RecommendationCard({ r }: { r: Recommendation }) {
  const style = TYPE_STYLES[r.type];
  return (
    <div
      className="rounded-xl p-4"
      style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{ color: style.color, backgroundColor: style.bg }}
        >
          {style.label}
        </span>
        <span
          className="text-xs font-medium capitalize"
          style={{ color: PRIORITY_COLOR[r.priority] }}
        >
          {r.priority} priority
        </span>
      </div>
      <h4 className="text-sm font-semibold mb-1.5" style={{ color: "hsl(220 9% 88%)" }}>{r.title}</h4>
      <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 52%)" }}>{r.description}</p>
    </div>
  );
}

export function RecommendationsTab({ recommendations }: { recommendations: Recommendation[] }) {
  const nextSteps = recommendations.filter((r) => r.type === "next-step");
  const improvements = recommendations.filter((r) => r.type === "improvement");
  const alternatives = recommendations.filter((r) => r.type === "alternative");

  return (
    <div className="space-y-5">
      {nextSteps.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(151 60% 48%)" }}>
            Next Steps
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {nextSteps.map((r, i) => <RecommendationCard key={i} r={r} />)}
          </div>
        </div>
      )}
      {improvements.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(213 94% 62%)" }}>
            Improvements
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {improvements.map((r, i) => <RecommendationCard key={i} r={r} />)}
          </div>
        </div>
      )}
      {alternatives.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(38 90% 55%)" }}>
            Alternative Ideas
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {alternatives.map((r, i) => <RecommendationCard key={i} r={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
