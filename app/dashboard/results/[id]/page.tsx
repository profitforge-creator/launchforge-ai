import Link from "next/link";
import { MOCK_BUSINESS_RESULT } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { formatDate } from "@/lib/utils";
import type { Competitor, Recommendation } from "@/types";

// Score bar component
function ScoreBar({ score, inverted = false }: { score: number; inverted?: boolean }) {
  const effective = inverted ? 100 - score : score;
  const color =
    effective >= 80
      ? "hsl(151 60% 48%)"
      : effective >= 60
      ? "hsl(38 90% 55%)"
      : "hsl(0 72% 58%)";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 18%)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-6 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function SectionHeader({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "hsl(213 94% 62%)" }}>
        {label}
      </p>
      <h2 className="text-lg font-semibold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>
        {title}
      </h2>
      {description && (
        <p className="text-sm mt-1" style={{ color: "hsl(220 9% 50%)" }}>{description}</p>
      )}
    </div>
  );
}

function CompetitorCard({ c }: { c: Competitor }) {
  return (
    <div className="rounded-lg p-4 space-y-3" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 90%)" }}>{c.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 45%)" }}>{c.url}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 75%)" }}>{c.pricing}</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 40%)" }}>est. {c.monthlyRevenue}/mo</p>
        </div>
      </div>
      <div className="h-px" style={{ backgroundColor: "hsl(220 13% 17%)" }} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(151 60% 48%)" }}>Strengths</p>
          <ul className="space-y-1">
            {c.strengths.map((s) => (
              <li key={s} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 55%)" }}>
                <span className="mt-0.5 shrink-0" style={{ color: "hsl(151 60% 48%)" }}>+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(0 72% 58%)" }}>Weaknesses</p>
          <ul className="space-y-1">
            {c.weaknesses.map((w) => (
              <li key={w} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 55%)" }}>
                <span className="mt-0.5 shrink-0" style={{ color: "hsl(0 72% 58%)" }}>−</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>Market share (est.)</span>
          <span className="text-xs font-medium" style={{ color: "hsl(220 9% 70%)" }}>{c.marketShare}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 18%)" }}>
          <div className="h-full rounded-full" style={{ width: `${c.marketShare}%`, backgroundColor: "hsl(213 94% 62% / 0.5)" }} />
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ r }: { r: Recommendation }) {
  const typeStyles = {
    improvement: { label: "Improvement", color: "hsl(213 94% 62%)", bg: "hsl(213 94% 62% / 0.08)" },
    alternative: { label: "Alternative", color: "hsl(38 90% 55%)", bg: "hsl(38 90% 55% / 0.08)" },
    "next-step": { label: "Next Step", color: "hsl(151 60% 48%)", bg: "hsl(151 60% 48% / 0.08)" },
  };
  const priorityColor = { high: "hsl(0 72% 58%)", medium: "hsl(38 90% 55%)", low: "hsl(220 9% 45%)" };
  const style = typeStyles[r.type];

  return (
    <div className="rounded-lg p-4" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: style.color, backgroundColor: style.bg }}>
            {style.label}
          </span>
          <span className="text-xs font-medium" style={{ color: priorityColor[r.priority] }}>
            {r.priority} priority
          </span>
        </div>
      </div>
      <h4 className="text-sm font-semibold mb-1.5" style={{ color: "hsl(220 9% 88%)" }}>{r.title}</h4>
      <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 55%)" }}>{r.description}</p>
    </div>
  );
}

// AI INTEGRATION POINT: In production, fetch result by `params.id` from your database
// For demo purposes, all IDs resolve to mock data
export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  await params; // consume params
  const result = MOCK_BUSINESS_RESULT;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-xs transition-colors" style={{ color: "hsl(220 9% 45%)" }}>
            Dashboard
          </Link>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "hsl(220 9% 35%)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-xs" style={{ color: "hsl(220 9% 60%)" }}>Results</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>
              {result.niche}
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(220 9% 50%)" }}>
              Generated {formatDate(result.createdAt)} · ID {result.id}
            </p>
          </div>
          <Badge variant="success" className="text-sm px-3 py-1">
            Overall Score {result.scores.overall}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed mt-3 max-w-2xl" style={{ color: "hsl(220 9% 58%)" }}>
          {result.summary}
        </p>
      </div>

      {/* ── A. OPPORTUNITY ANALYSIS ── */}
      <section>
        <SectionHeader label="A" title="Opportunity Analysis" description="How this niche scores across four key dimensions." />
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score rings */}
          <div className="rounded-xl p-6" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
            <p className="text-xs font-medium mb-6" style={{ color: "hsl(220 9% 50%)" }}>Score breakdown</p>
            <div className="flex items-center justify-around">
              <ScoreRing score={result.scores.overall} label="Overall" size="lg" />
              <div className="space-y-5 flex-1 ml-8">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>Demand</span>
                    <span className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>How many people want this</span>
                  </div>
                  <ScoreBar score={result.scores.demand} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>Competition</span>
                    <span className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>Lower = less crowded</span>
                  </div>
                  <ScoreBar score={result.scores.competition} inverted />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>Difficulty</span>
                    <span className="text-xs" style={{ color: "hsl(220 9% 45%)" }}>Lower = easier to build</span>
                  </div>
                  <ScoreBar score={result.scores.difficulty} inverted />
                </div>
              </div>
            </div>
          </div>

          {/* Input summary */}
          <div className="rounded-xl p-6 space-y-3" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
            <p className="text-xs font-medium mb-4" style={{ color: "hsl(220 9% 50%)" }}>Based on your inputs</p>
            {[
              { label: "Interests", value: result.formData.interests },
              { label: "Skills", value: result.formData.skills },
              { label: "Time available", value: result.formData.timePerWeek + " hrs/week" },
              { label: "Income goal", value: "$" + result.formData.incomeGoal + "/month" },
              { label: "Business type", value: result.formData.businessType },
            ].map((row) => (
              <div key={row.label} className="flex gap-3">
                <span className="text-xs w-24 shrink-0" style={{ color: "hsl(220 9% 40%)" }}>{row.label}</span>
                <span className="text-xs font-medium flex-1" style={{ color: "hsl(220 9% 75%)" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B. COMPETITOR RESEARCH ── */}
      <section>
        <SectionHeader label="B" title="Competitor Research" description={`${result.competitors.length} key players in this space.`} />
        <div className="grid md:grid-cols-3 gap-4">
          {result.competitors.map((c) => (
            <CompetitorCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      {/* ── C. PRODUCT BUILDER ── */}
      <section>
        <SectionHeader label="C" title="Product Builder" description="A concrete product concept built around your skills and this market gap." />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-xl p-6 space-y-5" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
            <div>
              <p className="text-xs mb-1" style={{ color: "hsl(220 9% 45%)" }}>Product name</p>
              <p className="text-2xl font-bold" style={{ color: "hsl(220 9% 93%)" }}>{result.product.name}</p>
              <p className="text-sm mt-1" style={{ color: "hsl(220 9% 55%)" }}>{result.product.tagline}</p>
            </div>
            <div className="h-px" style={{ backgroundColor: "hsl(220 13% 17%)" }} />
            <div>
              <p className="text-xs mb-2" style={{ color: "hsl(220 9% 45%)" }}>Description</p>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 70%)" }}>{result.product.description}</p>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: "hsl(220 9% 45%)" }}>Target audience</p>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 70%)" }}>{result.product.targetAudience}</p>
            </div>
            <div>
              <p className="text-xs mb-2.5" style={{ color: "hsl(220 9% 45%)" }}>Deliverables</p>
              <ul className="space-y-1.5">
                {result.product.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(213 94% 62%)" }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm" style={{ color: "hsl(220 9% 68%)" }}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Pricing model", value: result.product.pricingModel },
              { label: "Suggested price", value: result.product.suggestedPrice },
              { label: "Time to launch", value: result.product.timeToLaunch },
            ].map((m) => (
              <div key={m.label} className="rounded-lg p-4" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
                <p className="text-xs mb-1.5" style={{ color: "hsl(220 9% 45%)" }}>{m.label}</p>
                <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 85%)" }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. MARKETING PLAN ── */}
      <section>
        <SectionHeader label="D" title="Marketing Plan" description="How to get your first customers." />
        <div className="space-y-4">
          {/* TikTok hooks */}
          <div className="rounded-xl p-5" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
            <p className="text-xs font-semibold mb-4" style={{ color: "hsl(220 9% 65%)" }}>TikTok / Reels hooks</p>
            <div className="space-y-2">
              {result.marketing.tiktokHooks.map((hook, i) => (
                <div key={i} className="flex items-start gap-3 rounded p-3" style={{ backgroundColor: "hsl(220 13% 14%)" }}>
                  <span className="text-xs font-mono shrink-0 mt-0.5 w-4" style={{ color: "hsl(220 9% 35%)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm" style={{ color: "hsl(220 9% 75%)" }}>&ldquo;{hook}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content ideas */}
          <div className="grid md:grid-cols-2 gap-4">
            {result.marketing.contentIdeas.map((idea, i) => (
              <div key={i} className="rounded-lg p-4" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="neutral">{idea.platform}</Badge>
                  <Badge variant="default">{idea.format}</Badge>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 85%)" }}>{idea.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 50%)" }}>Hook: &ldquo;{idea.hook}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* Launch strategy */}
          <div className="rounded-xl p-5" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}>
            <p className="text-xs font-semibold mb-4" style={{ color: "hsl(220 9% 65%)" }}>Launch strategy</p>
            <div className="space-y-px">
              {result.marketing.launchStrategy.map((phase, i) => (
                <div
                  key={i}
                  className="flex gap-5 p-4"
                  style={{
                    borderBottom: i < result.marketing.launchStrategy.length - 1
                      ? "1px solid hsl(220 13% 15%)"
                      : "none",
                  }}
                >
                  <div className="shrink-0 w-20">
                    <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 75%)" }}>{phase.phase}</p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 40%)" }}>{phase.duration}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium mb-2" style={{ color: "hsl(213 94% 62%)" }}>Goal: {phase.goal}</p>
                    <ul className="space-y-1">
                      {phase.actions.map((a) => (
                        <li key={a} className="text-xs flex items-start gap-1.5" style={{ color: "hsl(220 9% 60%)" }}>
                          <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "hsl(220 9% 35%)" }} />
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
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 17%)" }}>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 13%)" }}>
              <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 65%)" }}>Content calendar</p>
            </div>
            <div style={{ backgroundColor: "hsl(220 13% 11%)" }}>
              <div className="grid grid-cols-4 px-4 py-2 text-xs font-medium" style={{ color: "hsl(220 9% 40%)", borderBottom: "1px solid hsl(220 13% 15%)" }}>
                <span>Week</span><span>Platform</span><span>Content</span><span>Goal</span>
              </div>
              {result.marketing.contentCalendar.map((entry, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 px-4 py-2.5 text-xs"
                  style={{
                    borderBottom: i < result.marketing.contentCalendar.length - 1
                      ? "1px solid hsl(220 13% 14%)"
                      : "none",
                    color: "hsl(220 9% 65%)",
                  }}
                >
                  <span style={{ color: "hsl(220 9% 45%)" }}>W{entry.week}</span>
                  <span>{entry.platform}</span>
                  <span style={{ color: "hsl(220 9% 75%)" }}>{entry.content}</span>
                  <span style={{ color: "hsl(220 9% 50%)" }}>{entry.goal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── E. RECOMMENDATIONS ── */}
      <section>
        <SectionHeader label="E" title="Recommendations" description="Prioritized suggestions to maximize your chances of success." />
        <div className="grid md:grid-cols-2 gap-4">
          {result.recommendations.map((r, i) => (
            <RecommendationCard key={i} r={r} />
          ))}
        </div>
      </section>

      {/* Bottom actions */}
      <div className="flex items-center gap-3 pt-2 pb-4" style={{ borderTop: "1px solid hsl(220 13% 15%)" }}>
        <Link href="/dashboard">
          <button className="h-8 px-4 rounded text-sm font-medium transition-colors" style={{ border: "1px solid hsl(220 13% 22%)", backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 80%)" }}>
            ← New generation
          </button>
        </Link>
        <Link href="/dashboard/history">
          <button className="h-8 px-4 rounded text-sm font-medium transition-colors" style={{ border: "1px solid hsl(220 13% 22%)", backgroundColor: "transparent", color: "hsl(220 9% 60%)" }}>
            View history
          </button>
        </Link>
      </div>
    </div>
  );
}
