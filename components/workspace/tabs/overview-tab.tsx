import { getProjectFileCount } from "@/lib/project/files";
import type { BusinessResult } from "@/types";

// ── Score ring ────────────────────────────────────────────────────────────────

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
    <div
      className="rounded-xl px-5 py-4"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: "hsl(220 9% 38%)" }}>{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color: "hsl(220 9% 88%)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 32%)" }}>{sub}</p>
    </div>
  );
}

// ── Area completion row ───────────────────────────────────────────────────────

function AreaRow({
  label,
  complete,
  note,
  onOpen,
}: {
  label: string;
  complete: boolean;
  note: string;
  onOpen: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors"
      style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}
      onClick={onOpen}
    >
      <div className="flex items-center gap-3">
        {complete ? (
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)", flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 shrink-0" style={{ borderColor: "hsl(220 13% 24%)" }} />
        )}
        <span className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>{note}</span>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "hsl(220 9% 28%)", flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Next action card ──────────────────────────────────────────────────────────

function NextAction({
  title,
  description,
  buttonLabel,
  onAction,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onAction: () => void;
}) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ border: "1px solid hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}
    >
      <p className="text-xs font-medium mb-2" style={{ color: "hsl(213 94% 62%)" }}>Next action</p>
      <p className="text-sm font-semibold mb-1" style={{ color: "hsl(220 9% 88%)" }}>{title}</p>
      <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(220 9% 44%)" }}>{description}</p>
      <button
        onClick={onAction}
        className="h-8 px-4 rounded-lg text-xs font-semibold transition-colors"
        style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

interface Props {
  result: BusinessResult;
  onNavigate: (tab: "research" | "product" | "website" | "marketing" | "files" | "chat") => void;
}

export function OverviewTab({ result, onNavigate }: Props) {
  const fileCount = getProjectFileCount(result);
  const websiteFiles = result.projectFiles?.filter((f) => f.folder === "website") ?? [];
  const hasWebsite = websiteFiles.length > 0;

  const competitionLabel =
    result.scores.competition <= 35 ? "Low" :
    result.scores.competition <= 65 ? "Medium" : "High";

  const areas = [
    { key: "research"  as const, label: "Research",   complete: true, note: `${result.competitors.length} competitors analyzed` },
    { key: "product"   as const, label: "Product",    complete: true, note: result.product.name },
    { key: "website"   as const, label: "Website",    complete: hasWebsite, note: hasWebsite ? `${websiteFiles.length} files generated` : "Not generated" },
    { key: "marketing" as const, label: "Marketing",  complete: true, note: "Launch plan ready" },
    { key: "files"     as const, label: "Files",      complete: fileCount > 0, note: `${fileCount} files` },
  ];

  const completedCount = areas.filter((a) => a.complete).length;
  const pct = Math.round((completedCount / areas.length) * 100);

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Top row: score + stats */}
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
            ? "Your website has been generated. Review the pages, copy the code, and deploy to Vercel."
            : "Your product has been designed. Review the deliverables, pricing, and positioning."
        }
        buttonLabel={hasWebsite ? "Open Website" : "Open Product"}
        onAction={() => onNavigate(hasWebsite ? "website" : "product")}
      />

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 40%)" }}>Project areas</p>
          <p className="text-xs tabular-nums" style={{ color: "hsl(220 9% 30%)" }}>
            {completedCount}/{areas.length} complete
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
            />
          ))}
        </div>
      </div>

      {/* Deployment */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
      >
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
