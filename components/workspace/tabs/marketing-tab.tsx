import { Badge } from "@/components/ui/badge";
import type { MarketingPlan } from "@/types";

export function MarketingTab({
  marketing,
  onRegenerate,
  regenerating = false,
}: {
  marketing: MarketingPlan;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header with improve button */}
      {onRegenerate && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 80%)" }}>Marketing System</p>
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium transition-colors"
            style={{
              border: "1px solid hsl(213 94% 62% / 0.25)",
              color: "hsl(213 94% 65%)",
              backgroundColor: "hsl(213 94% 62% / 0.04)",
              opacity: regenerating ? 0.4 : 1,
              cursor: regenerating ? "not-allowed" : "pointer",
            }}
          >
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {regenerating ? "Regenerating…" : "Improve Marketing"}
          </button>
        </div>
      )}

      {/* Content pillars */}
      {marketing.contentPillars.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {marketing.contentPillars.map((pillar, i) => (
            <div
              key={i}
              className="rounded-lg p-3 text-center"
              style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
            >
              <p className="text-xs font-medium" style={{ color: "hsl(220 9% 62%)" }}>{pillar}</p>
            </div>
          ))}
        </div>
      )}

      {/* TikTok hooks */}
      <div
        className="rounded-xl p-5"
        style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: "hsl(220 9% 55%)" }}>
          TikTok / Reels hooks
        </p>
        <div className="space-y-2">
          {marketing.tiktokHooks.map((hook, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg p-3"
              style={{ backgroundColor: "hsl(220 13% 13%)" }}
            >
              <span
                className="text-xs font-mono shrink-0 mt-0.5 w-5 tabular-nums"
                style={{ color: "hsl(220 9% 33%)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm" style={{ color: "hsl(220 9% 72%)" }}>&ldquo;{hook}&rdquo;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content ideas */}
      <div>
        <p className="text-xs font-semibold mb-3" style={{ color: "hsl(220 9% 45%)" }}>Content ideas</p>
        <div className="grid md:grid-cols-2 gap-3">
          {marketing.contentIdeas.map((idea, i) => (
            <div
              key={i}
              className="rounded-lg p-4"
              style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="neutral">{idea.platform}</Badge>
                <Badge variant="default">{idea.format}</Badge>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 85%)" }}>{idea.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 48%)" }}>
                Hook: &ldquo;{idea.hook}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Launch strategy */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid hsl(220 13% 16%)" }}
      >
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 12%)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 55%)" }}>Launch strategy</p>
        </div>
        <div style={{ backgroundColor: "hsl(220 13% 10%)" }}>
          {marketing.launchStrategy.map((phase, i) => (
            <div
              key={i}
              className="flex gap-5 px-5 py-4"
              style={{
                borderBottom:
                  i < marketing.launchStrategy.length - 1
                    ? "1px solid hsl(220 13% 14%)"
                    : "none",
              }}
            >
              <div className="shrink-0 w-20">
                <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 75%)" }}>{phase.phase}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 38%)" }}>{phase.duration}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium mb-2" style={{ color: "hsl(213 94% 62%)" }}>
                  Goal: {phase.goal}
                </p>
                <ul className="space-y-1">
                  {phase.actions.map((a) => (
                    <li
                      key={a}
                      className="text-xs flex items-start gap-1.5"
                      style={{ color: "hsl(220 9% 58%)" }}
                    >
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "hsl(220 9% 32%)" }}
                      />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content calendar */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid hsl(220 13% 16%)" }}
      >
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 12%)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 55%)" }}>Content calendar</p>
        </div>
        <div style={{ backgroundColor: "hsl(220 13% 10%)" }}>
          <div
            className="grid px-5 py-2.5 text-xs font-medium"
            style={{
              gridTemplateColumns: "60px 100px 1fr 140px",
              color: "hsl(220 9% 38%)",
              borderBottom: "1px solid hsl(220 13% 14%)",
            }}
          >
            <span>Week</span>
            <span>Platform</span>
            <span>Content</span>
            <span>Goal</span>
          </div>
          {marketing.contentCalendar.map((entry, i) => (
            <div
              key={i}
              className="grid px-5 py-2.5 text-xs items-center"
              style={{
                gridTemplateColumns: "60px 100px 1fr 140px",
                borderBottom:
                  i < marketing.contentCalendar.length - 1
                    ? "1px solid hsl(220 13% 13%)"
                    : "none",
                color: "hsl(220 9% 62%)",
              }}
            >
              <span style={{ color: "hsl(220 9% 40%)" }}>W{entry.week}</span>
              <span>{entry.platform}</span>
              <span style={{ color: "hsl(220 9% 75%)" }}>{entry.content}</span>
              <span style={{ color: "hsl(220 9% 48%)" }}>{entry.goal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
