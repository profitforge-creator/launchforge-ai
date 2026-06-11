import Link from "next/link";
import { getHistoryRecords } from "@/lib/storage/generation-store";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

function ScoreCell({ score }: { score: number }) {
  const color = score >= 80 ? "hsl(151 60% 48%)" : score >= 60 ? "hsl(38 90% 55%)" : "hsl(0 72% 58%)";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 18%)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

// AI INTEGRATION POINT: Replace getHistoryRecords() with a Supabase query:
//   const { data } = await supabase.from("generations").select("*").order("created_at", { ascending: false })
export default function HistoryPage() {
  const records = getHistoryRecords();
  const avgScore = records.length
    ? Math.round(records.reduce((a, b) => a + b.overallScore, 0) / records.length)
    : 0;
  const bestScore = records.length ? Math.max(...records.map((r) => r.overallScore)) : 0;
  const completed = records.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>History</h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(220 9% 50%)" }}>
            {records.length} generation{records.length !== 1 ? "s" : ""} across all time.
          </p>
        </div>
        <Link href="/dashboard">
          <button className="h-8 px-4 rounded text-sm font-medium transition-colors" style={{ backgroundColor: "hsl(213 94% 62%)", color: "hsl(220 13% 8%)" }}>
            + New generation
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",     value: records.length.toString() },
          { label: "Completed", value: completed.toString() },
          { label: "Avg. score", value: avgScore.toString() },
          { label: "Best score", value: bestScore.toString() },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-4" style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}>
            <p className="text-xs mb-1" style={{ color: "hsl(220 9% 45%)" }}>{s.label}</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: "hsl(220 9% 93%)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 10%)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 60%)" }}>No generations yet</p>
          <p className="text-xs mb-4" style={{ color: "hsl(220 9% 40%)" }}>Generate your first business opportunity from the dashboard.</p>
          <Link href="/dashboard">
            <button className="h-8 px-4 rounded text-sm font-medium" style={{ backgroundColor: "hsl(213 94% 62%)", color: "hsl(220 13% 8%)" }}>
              Go to dashboard
            </button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 17%)" }}>
          <div
            className="grid px-5 py-3 text-xs font-medium"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", borderBottom: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 12%)", color: "hsl(220 9% 45%)" }}
          >
            <span>Niche</span>
            <span>Product</span>
            <span>Type</span>
            <span>Score</span>
            <span>Status</span>
          </div>
          {records.map((record, i) => (
            <Link
              key={record.id}
              href={`/dashboard/results/${record.id}`}
              className="grid px-5 py-3.5 items-center transition-colors"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                borderBottom: i < records.length - 1 ? "1px solid hsl(220 13% 14%)" : "none",
                backgroundColor: "hsl(220 13% 10%)",
              }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "hsl(220 9% 85%)" }}>{record.niche}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 42%)" }}>{formatDate(record.createdAt)}</p>
              </div>
              <span className="text-sm truncate" style={{ color: "hsl(220 9% 65%)" }}>{record.productName}</span>
              <span className="text-xs capitalize" style={{ color: "hsl(220 9% 50%)" }}>{record.businessType}</span>
              <ScoreCell score={record.overallScore} />
              <Badge variant={record.status === "completed" ? "default" : "warning"}>
                {record.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
