import Link from "next/link";
import { GenerationForm } from "@/components/features/generation-form";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER } from "@/lib/mock-data";
import { getHistoryRecords } from "@/lib/storage/generation-store";
import { formatRelativeDate } from "@/lib/utils";

function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? "hsl(151 60% 48%)" : score >= 65 ? "hsl(38 90% 55%)" : "hsl(0 72% 58%)";
  return <span className="font-semibold tabular-nums text-sm" style={{ color }}>{score}</span>;
}

export default function DashboardPage() {
  const records = getHistoryRecords();
  const recent = records.slice(0, 4);
  const bestScore = records.length ? Math.max(...records.map((r) => r.overallScore)) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>
          New Business
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(220 9% 48%)" }}>
          Describe your skills and goals — we&apos;ll build a complete business opportunity with analysis, product, marketing strategy, and downloadable assets.
        </p>
      </div>

      {/* Generation form */}
      <div
        className="rounded-xl p-6"
        style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium" style={{ color: "hsl(220 9% 45%)" }}>
              Generates: market analysis · competitor research · product concept · 6 tab workspace · downloadable assets
            </p>
          </div>
          <Badge variant="accent">Pro</Badge>
        </div>
        <GenerationForm />
      </div>

      {/* Recent workspaces */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 60%)" }}>Recent workspaces</p>
            <Link href="/dashboard/history" className="text-xs" style={{ color: "hsl(213 94% 62%)" }}>
              View all →
            </Link>
          </div>
          <div className="space-y-1.5">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/workspace/${r.id}`}
                className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors group"
                style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        r.overallScore >= 80 ? "hsl(151 60% 48%)" :
                        r.overallScore >= 65 ? "hsl(38 90% 55%)" :
                        "hsl(0 72% 58%)",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "hsl(220 9% 82%)" }}>{r.niche}</p>
                    <p className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
                      {r.productName} · {formatRelativeDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <ScoreDot score={r.overallScore} />
                  <svg
                    width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
                    style={{ color: "hsl(220 9% 32%)" }}
                    className="group-hover:translate-x-0.5 transition-transform"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Usage */}
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between"
        style={{ border: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 9%)" }}
      >
        <p className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
          {records.length} of {MOCK_USER.generationsLimit} generations used · Best score: {bestScore}
        </p>
        <Link href="/dashboard/account" className="text-xs" style={{ color: "hsl(213 94% 62%)" }}>
          Upgrade →
        </Link>
      </div>
    </div>
  );
}
