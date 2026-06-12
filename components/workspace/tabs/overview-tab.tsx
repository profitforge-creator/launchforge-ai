import { getProjectFileCount } from "@/lib/project/files";
import type { BusinessResult } from "@/types";

// ── Score display ─────────────────────────────────────────────────────────────

function ScoreDisplay({ score, category }: { score: number; category: string }) {
  const color =
    score >= 80 ? "hsl(151 60% 48%)" :
    score >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";
  const bg =
    score >= 80 ? "hsl(151 60% 48% / 0.08)" :
    score >= 65 ? "hsl(38 90% 55% / 0.08)" :
    "hsl(0 72% 58% / 0.08)";
  const border =
    score >= 80 ? "hsl(151 60% 48% / 0.18)" :
    score >= 65 ? "hsl(38 90% 55% / 0.18)" :
    "hsl(0 72% 58% / 0.18)";

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <p className="text-6xl font-bold tabular-nums" style={{ color, letterSpacing: "-0.04em" }}>{score}</p>
      <p className="text-sm font-medium mt-2" style={{ color: "hsl(220 9% 50%)" }}>Business Score</p>
      <p className="text-xs mt-1" style={{ color: "hsl(220 9% 36%)" }}>{category}</p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
      <p className="text-xs font-medium mb-1" style={{ color: "hsl(220 9% 38%)" }}>{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color: "hsl(220 9% 88%)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 32%)" }}>{sub}</p>
    </div>
  );
}

// ── Area row ──────────────────────────────────────────────────────────────────

function AreaRow({
  label, complete, note, onOpen, onImprove, canImprove, regenerating, last = false,
}: {
  label: string; complete: boolean; note: string;
  onOpen: () => void; onImprove?: () => void;
  canImprove?: boolean; regenerating?: boolean; last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg"
      style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={onOpen}>
        {complete ? (
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)", flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 shrink-0" style={{ borderColor: "hsl(220 13% 24%)" }} />
        )}
        <span className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>{label}</span>
        <span className="text-xs truncate" style={{ color: "hsl(220 9% 36%)" }}>{note}</span>
      </button>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {canImprove && onImprove && (
          <button
            onClick={onImprove}
            disabled={regenerating}
            className="h-6 px-2.5 rounded-md text-xs font-medium transition-colors"
            style={{
              border: "1px solid hsl(213 94% 62% / 0.2)",
              color: "hsl(213 94% 62%)",
              backgroundColor: "transparent",
              opacity: regenerating ? 0.4 : 1,
              cursor: regenerating ? "not-allowed" : "pointer",
            }}
          >
            {regenerating ? "…" : "Improve"}
          </button>
        )}
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "hsl(220 9% 28%)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Next action card ──────────────────────────────────────────────────────────

function NextAction({ title, description, buttonLabel, onAction }: {
  title: string; description: string; buttonLabel: string; onAction: () => void;
}) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ border: "1px solid hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}>
      <p className="text-xs font-medium mb-2" style={{ color: "hsl(213 94% 62%)" }}>Next action</p>
      <p className="text-sm font-semibold mb-1" style={{ color: "hsl(220 9% 88%)" }}>{title}</p>
      <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(220 9% 44%)" }}>{description}</p>
      <button
        onClick={onAction}
        className="h-8 px-4 rounded-lg text-xs font-semibold"
        style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

// ── Health breakdown ──────────────────────────────────────────────────────────

function ScoreBar({ label, score, inverted = false }: { label: string; score: number; inverted?: boolean }) {
  const effective = inverted ? 100 - score : score;
  const color = effective >= 75 ? "hsl(151 60% 48%)" : effective >= 55 ? "hsl(38 90% 55%)" : "hsl(0 72% 58%)";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: "hsl(220 9% 42%)" }}>{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function HealthBreakdown({ result }: { result: BusinessResult }) {
  const strengths = result.recommendations?.filter((r) => r.type === "improvement" && r.priority === "low") ?? [];
  const improvements = result.recommendations?.filter((r) => r.priority === "high") ?? [];

  return (
    <div className="rounded-xl px-5 py-5 space-y-5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
      <p className="text-xs font-medium" style={{ color: "hsl(220 9% 40%)" }}>Health breakdown</p>
      <div className="space-y-3">
        <ScoreBar label="Market Demand"   score={result.scores.demand} />
        <ScoreBar label="Monetization"    score={result.scores.monetization} />
        <ScoreBar label="Competition"     score={result.scores.competition} inverted />
        <ScoreBar label="Launch Difficulty" score={result.scores.difficulty}  inverted />
      </div>
      {improvements.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "hsl(38 90% 55%)" }}>Recommended improvements</p>
          <div className="space-y-1.5">
            {improvements.slice(0, 3).map((r, i) => (
              <p key={i} className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 46%)" }}>
                <span style={{ color: "hsl(38 90% 58%)" }}>·</span> {r.title}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

interface Props {
  result: BusinessResult;
  onNavigate: (tab: "research" | "product" | "website" | "marketing" | "files" | "chat") => void;
  onRegenerate: (section: "product" | "website" | "marketing") => void;
  regenerating: boolean;
}

export function OverviewTab({ result, onNavigate, onRegenerate, regenerating }: Props) {
  const fileCount = getProjectFileCount(result);
  const websiteFiles = result.projectFiles?.filter((f) => f.folder === "website") ?? [];
  const hasWebsite = websiteFiles.length > 0;

  const competitionLabel =
    result.scores.competition <= 35 ? "Low" :
    result.scores.competition <= 65 ? "Medium" : "High";

  const areas = [
    { key: "research"   as const, label: "Research",   complete: true,           note: `${result.competitors.length} competitors analyzed`, canImprove: false },
    { key: "product"    as const, label: "Product",    complete: true,           note: result.product.name,                                  canImprove: true  },
    { key: "website"    as const, label: "Website",    complete: hasWebsite,     note: hasWebsite ? `${websiteFiles.length} files` : "Not generated", canImprove: true  },
    { key: "marketing"  as const, label: "Marketing",  complete: true,           note: "Launch plan ready",                                  canImprove: true  },
    { key: "files"      as const, label: "Files",      complete: fileCount > 0,  note: `${fileCount} files`,                                 canImprove: false },
  ];

  const completedCount = areas.filter((a) => a.complete).length;
  const pct = Math.round((completedCount / areas.length) * 100);

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Score + stats */}
      <div className="grid grid-cols-4 gap-4">
        <ScoreDisplay score={result.scores.overall} category={result.scores.category} />
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <StatCard
            label="Market Demand"
            value={`${result.scores.demand}/100`}
            sub={result.scores.demand >= 70 ? "Strong" : result.scores.demand >= 50 ? "Moderate" : "Weak"}
          />
          <StatCard
            label="Competition"
            value={competitionLabel}
            sub={`${result.scores.competition}/100 index`}
          />
          <StatCard
            label="Completion"
            value={`${pct}%`}
            sub={`${completedCount} of ${areas.length} areas`}
          />
        </div>
      </div>

      {/* Next action */}
      <NextAction
        title={hasWebsite ? "Review your website" : "Explore your product"}
        description={
          hasWebsite
            ? "Your website has been generated. Review each page, refine the copy, then deploy to Vercel."
            : "Your product has been designed. Review the deliverables and pricing before moving to website."
        }
        buttonLabel={hasWebsite ? "Open Website" : "Open Product"}
        onAction={() => onNavigate(hasWebsite ? "website" : "product")}
      />

      {/* Two columns: area progress + health */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: "hsl(220 9% 40%)" }}>Project areas</p>
            <p className="text-xs tabular-nums" style={{ color: "hsl(220 9% 30%)" }}>
              {completedCount}/{areas.length}
            </p>
          </div>
          <div className="space-y-2">
            {areas.map((area) => (
              <AreaRow
                key={area.key}
                label={area.label}
                complete={area.complete}
                note={area.note}
                onOpen={() => onNavigate(area.key)}
                canImprove={area.canImprove}
                onImprove={area.canImprove ? () => onRegenerate(area.key as "product" | "website" | "marketing") : undefined}
                regenerating={regenerating}
              />
            ))}
          </div>
        </div>

        <HealthBreakdown result={result} />
      </div>

      {/* Deployment */}
      <div className="rounded-xl px-5 py-4" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
        <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 38%)" }}>Deployment</p>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            {[
              { label: "GitHub", status: "Not connected" },
              { label: "Vercel", status: "Not connected" },
              { label: "Domain", status: "Not configured" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs w-14" style={{ color: "hsl(220 9% 48%)" }}>{item.label}</span>
                <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>{item.status}</span>
              </div>
            ))}
          </div>
          <button
            className="h-8 px-4 rounded-lg text-xs font-medium"
            style={{ border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 48%)", cursor: "not-allowed", opacity: 0.5 }}
            disabled
          >
            Deploy — Coming Soon
          </button>
        </div>
      </div>

    </div>
  );
}
