import Link from "next/link";
import { GenerationForm } from "@/components/features/generation-form";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER } from "@/lib/mock-data";
import { getHistoryRecords } from "@/lib/storage/generation-store";
import { formatRelativeDate } from "@/lib/utils";

function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? "hsl(151 60% 48%)" : score >= 60 ? "hsl(38 90% 55%)" : "hsl(0 72% 58%)";
  return <span className="font-semibold tabular-nums text-sm" style={{ color }}>{score}</span>;
}

// AI INTEGRATION POINT: Replace MOCK_USER with Supabase session + profile query
// Replace getHistoryRecords() with a user-scoped database query
export default function DashboardPage() {
  const records = getHistoryRecords();
  const recent = records.slice(0, 3);
  const bestScore = records.length ? Math.max(...records.map((r) => r.overallScore)) : 0;
  const bestRecord = records.find((r) => r.overallScore === bestScore);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(220 9% 50%)" }}>
            Generate a new business opportunity or review past results.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>Generations used</p>
            <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>
              {records.length} / {MOCK_USER.generationsLimit}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 20%)" }}>
            <svg viewBox="0 0 36 36" className="w-6 h-6 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(220 13% 22%)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(213 94% 62%)" strokeWidth="3"
                strokeDasharray={`${Math.min((records.length / MOCK_USER.generationsLimit) * 94, 94)} 94`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Generations", value: records.length.toString(), sub: "all time" },
          {
            label: "Best Score",
            value: bestScore.toString(),
            sub: bestRecord ? `${bestRecord.productName}` : "—",
          },
          { label: "Niches Explored", value: new Set(records.map((r) => r.niche)).size.toString(), sub: "unique niches" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-4" style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}>
            <p className="text-xs mb-1" style={{ color: "hsl(220 9% 45%)" }}>{s.label}</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: "hsl(220 9% 93%)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 40%)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Generation form */}
      <div className="rounded-xl p-6" style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>New Generation</h2>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 45%)" }}>
              Describe your background and we&apos;ll build your business opportunity.
            </p>
          </div>
          <Badge variant="accent">Pro</Badge>
        </div>
        <GenerationForm />
      </div>

      {/* Recent generations */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 75%)" }}>Recent generations</h2>
            <Link href="/dashboard/history" className="text-xs" style={{ color: "hsl(213 94% 62%)" }}>
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/results/${r.id}`}
                className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors"
                style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(220 13% 16%)", border: "1px solid hsl(220 13% 22%)" }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "hsl(220 9% 55%)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "hsl(220 9% 85%)" }}>{r.niche}</p>
                    <p className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>
                      {r.productName} · {formatRelativeDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant={r.status === "completed" ? "default" : "warning"}>{r.status}</Badge>
                  <ScoreDot score={r.overallScore} />
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "hsl(220 9% 35%)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
