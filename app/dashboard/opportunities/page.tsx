"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SEED_OPPORTUNITIES } from "@/lib/opportunities/seed-data";
import { actionGenerateOpportunities, actionAIAdvisorRecommend } from "@/app/actions/opportunities";
import type {
  Opportunity,
  OpportunityFilters,
  DifficultyLevel,
  StartupCostRange,
  RevenuePotential,
  LaunchSpeed,
} from "@/lib/opportunities/types";
import type { BusinessTypeId } from "@/lib/business-types/config";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<BusinessTypeId, string> = {
  course:     "Course",
  ebook:      "Ebook",
  template:   "Template",
  saas:       "SaaS",
  agency:     "Agency",
  membership: "Membership",
  coaching:   "Coaching",
  newsletter: "Newsletter",
  open:       "Other",
};

const DIFFICULTY_COLOR: Record<DifficultyLevel, string> = {
  Beginner:     "hsl(151 60% 48%)",
  Intermediate: "hsl(38 90% 55%)",
  Advanced:     "hsl(0 72% 58%)",
};

const REVENUE_COLOR: Record<string, string> = {
  Low:       "hsl(220 9% 40%)",
  Medium:    "hsl(38 90% 55%)",
  High:      "hsl(151 60% 48%)",
  "Very High": "hsl(213 94% 62%)",
};

const ADVISOR_QUESTIONS = [
  { id: "goal",   question: "What is your primary goal right now?",                  options: ["Generate income quickly", "Build something I'm proud of", "Escape my job in 12 months", "Build recurring passive income"] },
  { id: "time",   question: "How many hours per week can you commit to this?",       options: ["1–5 hours", "5–10 hours", "10–20 hours", "20+ hours"] },
  { id: "budget", question: "What is your starting budget?",                         options: ["Under $100", "$100–$500", "$500–$2,000", "Over $2,000"] },
  { id: "skills", question: "What is your strongest skill area?",                    options: ["Writing or communication", "Design or visual work", "Software development", "Sales or marketing", "Teaching or coaching", "I'm not sure yet"] },
  { id: "risk",   question: "How do you feel about building in a competitive space?", options: ["I prefer low competition niches", "I'm fine with competition if demand is high", "Competition signals a real market — I'm in"] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  return score >= 80 ? "hsl(151 60% 48%)" : score >= 70 ? "hsl(38 90% 55%)" : "hsl(220 9% 48%)";
}

function scoreBg(score: number) {
  return score >= 80 ? "hsl(151 60% 48% / 0.08)" : score >= 70 ? "hsl(38 90% 55% / 0.08)" : "hsl(220 13% 13%)";
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconClose() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

// ── Filter sidebar ─────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold mb-2.5 uppercase tracking-wider" style={{ color: "hsl(220 9% 32%)" }}>{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterCheck({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
        style={{
          borderColor: checked ? "hsl(213 94% 62%)" : "hsl(220 13% 22%)",
          backgroundColor: checked ? "hsl(213 94% 62%)" : "transparent",
        }}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="9" height="9" fill="none" viewBox="0 0 12 12" stroke="hsl(220 14% 7%)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        )}
      </div>
      <span
        className="text-sm select-none"
        onClick={() => onChange(!checked)}
        style={{ color: checked ? "hsl(220 9% 82%)" : "hsl(220 9% 46%)" }}
      >
        {label}
      </span>
    </label>
  );
}

function FilterSidebar({
  filters,
  onChange,
  onClear,
}: {
  filters: OpportunityFilters;
  onChange: (f: OpportunityFilters) => void;
  onClear: () => void;
}) {
  function toggleType(t: BusinessTypeId) {
    const next = filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t];
    onChange({ ...filters, types: next });
  }
  function toggleDifficulty(d: DifficultyLevel) {
    const next = filters.difficulty.includes(d)
      ? filters.difficulty.filter((x) => x !== d)
      : [...filters.difficulty, d];
    onChange({ ...filters, difficulty: next });
  }
  function toggleCost(c: StartupCostRange) {
    const next = filters.startupCost.includes(c)
      ? filters.startupCost.filter((x) => x !== c)
      : [...filters.startupCost, c];
    onChange({ ...filters, startupCost: next });
  }
  function toggleRevenue(r: RevenuePotential) {
    const next = filters.revenuePotential.includes(r)
      ? filters.revenuePotential.filter((x) => x !== r)
      : [...filters.revenuePotential, r];
    onChange({ ...filters, revenuePotential: next });
  }
  function toggleSpeed(s: LaunchSpeed) {
    const next = filters.launchSpeed.includes(s)
      ? filters.launchSpeed.filter((x) => x !== s)
      : [...filters.launchSpeed, s];
    onChange({ ...filters, launchSpeed: next });
  }

  const hasActive =
    filters.types.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.startupCost.length > 0 ||
    filters.revenuePotential.length > 0 ||
    filters.launchSpeed.length > 0;

  return (
    <div className="shrink-0 w-52 flex flex-col" style={{ borderRight: "1px solid hsl(220 13% 12%)" }}>
      <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}>
        <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 50%)" }}>Filters</p>
        {hasActive && (
          <button onClick={onClear} className="text-xs" style={{ color: "hsl(213 94% 62%)" }}>Clear all</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <FilterGroup label="Business Type">
          {(Object.entries(TYPE_LABELS) as [BusinessTypeId, string][]).filter(([id]) => id !== "open").map(([id, label]) => (
            <FilterCheck key={id} label={label} checked={filters.types.includes(id)} onChange={() => toggleType(id)} />
          ))}
        </FilterGroup>

        <FilterGroup label="Difficulty">
          {(["Beginner", "Intermediate", "Advanced"] as DifficultyLevel[]).map((d) => (
            <FilterCheck key={d} label={d} checked={filters.difficulty.includes(d)} onChange={() => toggleDifficulty(d)} />
          ))}
        </FilterGroup>

        <FilterGroup label="Startup Cost">
          {(["Under $100", "$100–$500", "$500–$2K", "$2K+"] as StartupCostRange[]).map((c) => (
            <FilterCheck key={c} label={c} checked={filters.startupCost.includes(c)} onChange={() => toggleCost(c)} />
          ))}
        </FilterGroup>

        <FilterGroup label="Revenue Potential">
          {(["Low", "Medium", "High", "Very High"] as RevenuePotential[]).map((r) => (
            <FilterCheck key={r} label={r} checked={filters.revenuePotential.includes(r)} onChange={() => toggleRevenue(r)} />
          ))}
        </FilterGroup>

        <FilterGroup label="Launch Speed">
          {(["Under 1 week", "2–4 weeks", "1–3 months", "3+ months"] as LaunchSpeed[]).map((s) => (
            <FilterCheck key={s} label={s} checked={filters.launchSpeed.includes(s)} onChange={() => toggleSpeed(s)} />
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}

// ── Opportunity card ──────────────────────────────────────────────────────────

function OpportunityCard({ opp, onClick }: { opp: Opportunity; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-5 flex flex-col gap-4 transition-all w-full"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 22%)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 15%)"; }}
    >
      {/* Top row: type badge + score */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-xs px-2 py-1 rounded-md font-medium shrink-0"
          style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 50%)" }}
        >
          {TYPE_LABELS[opp.type] ?? opp.type}
        </span>
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: scoreBg(opp.score) }}
        >
          <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(opp.score) }}>{opp.score}</span>
        </div>
      </div>

      {/* Name + tagline */}
      <div>
        <p className="text-sm font-semibold leading-snug mb-1" style={{ color: "hsl(220 9% 88%)" }}>{opp.name}</p>
        <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 44%)" }}>{opp.tagline}</p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(220 13% 12%)" }}>
          <p className="text-xs mb-0.5" style={{ color: "hsl(220 9% 32%)" }}>Difficulty</p>
          <p className="text-xs font-semibold" style={{ color: DIFFICULTY_COLOR[opp.difficulty] }}>{opp.difficulty}</p>
        </div>
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(220 13% 12%)" }}>
          <p className="text-xs mb-0.5" style={{ color: "hsl(220 9% 32%)" }}>Startup Cost</p>
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 75%)" }}>{opp.startupCost}</p>
        </div>
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(220 13% 12%)" }}>
          <p className="text-xs mb-0.5" style={{ color: "hsl(220 9% 32%)" }}>Revenue Potential</p>
          <p className="text-xs font-semibold" style={{ color: REVENUE_COLOR[opp.revenuePotential] ?? "hsl(220 9% 60%)" }}>{opp.revenuePotential}</p>
        </div>
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(220 13% 12%)" }}>
          <p className="text-xs mb-0.5" style={{ color: "hsl(220 9% 32%)" }}>Launch Speed</p>
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 75%)" }}>{opp.launchSpeed}</p>
        </div>
      </div>
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

type DetailTab = "overview" | "audience" | "monetization" | "competition" | "steps";

function DetailPanel({ opp, onClose, onBuild }: { opp: Opportunity; onClose: () => void; onBuild: (opp: Opportunity) => void }) {
  const [tab, setTab] = useState<DetailTab>("overview");

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "overview",     label: "Overview"     },
    { id: "audience",     label: "Audience"     },
    { id: "monetization", label: "Monetization" },
    { id: "competition",  label: "Competition"  },
    { id: "steps",        label: "First Steps"  },
  ];

  return (
    <div
      className="flex flex-col h-full shrink-0 overflow-hidden"
      style={{ width: 460, borderLeft: "1px solid hsl(220 13% 12%)", backgroundColor: "hsl(220 14% 8%)" }}
    >
      {/* Panel header */}
      <div
        className="flex items-start justify-between px-5 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}
      >
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 50%)" }}>
              {TYPE_LABELS[opp.type] ?? opp.type}
            </span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(opp.score) }}>{opp.score} score</span>
          </div>
          <p className="text-base font-semibold leading-snug mb-1" style={{ color: "hsl(220 9% 90%)" }}>{opp.name}</p>
          <p className="text-xs" style={{ color: "hsl(220 9% 44%)" }}>{opp.tagline}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 36%)" }}
        >
          <IconClose />
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 divide-x shrink-0" style={{ borderBottom: "1px solid hsl(220 13% 12%)", "--tw-divide-opacity": 1 } as React.CSSProperties}>
        {[
          { label: "Difficulty",  value: opp.difficulty,        color: DIFFICULTY_COLOR[opp.difficulty] },
          { label: "Cost",        value: opp.startupCost,       color: "hsl(220 9% 70%)" },
          { label: "Competition", value: opp.competitionLevel,  color: "hsl(220 9% 70%)" },
          { label: "Revenue",     value: opp.revenuePotential,  color: REVENUE_COLOR[opp.revenuePotential] ?? "hsl(220 9% 60%)" },
        ].map((m) => (
          <div key={m.label} className="px-3 py-3 text-center" style={{ borderColor: "hsl(220 13% 12%)" }}>
            <p className="text-xs mb-1" style={{ color: "hsl(220 9% 30%)" }}>{m.label}</p>
            <p className="text-xs font-semibold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-4 py-2.5 shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="shrink-0 h-7 px-3 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor: tab === t.id ? "hsl(220 13% 16%)" : "transparent",
              color: tab === t.id ? "hsl(220 9% 88%)" : "hsl(220 9% 40%)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {tab === "overview" && (
          <>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 65%)" }}>{opp.overview}</p>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(220 9% 36%)" }}>Advantages</p>
              <div className="space-y-1.5">
                {opp.advantages.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 55%)" }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(220 9% 36%)" }}>Risks to consider</p>
              <div className="space-y-1.5">
                {opp.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(38 90% 55%)" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 55%)" }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "audience" && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(220 9% 36%)" }}>Target audience</p>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 65%)" }}>{opp.targetAudience}</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(220 9% 36%)" }}>Recommended skills</p>
              <div className="flex flex-wrap gap-2">
                {opp.recommendedSkills.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-md" style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 55%)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "monetization" && (
          <div className="space-y-2.5">
            {opp.monetization.map((m, i) => (
              <div key={i} className="rounded-lg px-4 py-3.5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="shrink-0 text-xs font-bold tabular-nums w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", color: "hsl(213 94% 65%)" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: "hsl(220 9% 72%)" }}>{m}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "competition" && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(220 9% 36%)" }}>Competitive landscape</p>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 65%)" }}>{opp.competition}</p>
            </div>
            <div className="rounded-xl p-4 flex items-center gap-4" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}>
              <div>
                <p className="text-xs mb-1" style={{ color: "hsl(220 9% 36%)" }}>Competition level</p>
                <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 75%)" }}>{opp.competitionLevel}</p>
              </div>
              <div className="h-8 w-px" style={{ backgroundColor: "hsl(220 13% 16%)" }} />
              <div>
                <p className="text-xs mb-1" style={{ color: "hsl(220 9% 36%)" }}>Launch speed</p>
                <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 75%)" }}>{opp.launchSpeed}</p>
              </div>
            </div>
          </div>
        )}

        {tab === "steps" && (
          <div className="space-y-2.5">
            {opp.firstSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg px-4 py-3.5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}>
                <span
                  className="shrink-0 text-xs font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center mt-px"
                  style={{ backgroundColor: "hsl(220 13% 17%)", color: "hsl(220 9% 50%)" }}
                >
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 64%)" }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Build CTA */}
      <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
        <button
          onClick={() => onBuild(opp)}
          className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
        >
          Build this business
          <IconArrow />
        </button>
        <p className="text-xs text-center mt-2" style={{ color: "hsl(220 9% 28%)" }}>
          Opens the Business Engine with this opportunity pre-loaded
        </p>
      </div>
    </div>
  );
}

// ── Generator modal ───────────────────────────────────────────────────────────

function GeneratorModal({ onClose, onResults }: { onClose: () => void; onResults: (opps: Opportunity[]) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ hoursPerWeek: "", budget: "", skills: "", interests: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      key: "hoursPerWeek" as const,
      question: "How many hours per week can you commit?",
      options: [
        { value: "1-5",   label: "1–5 hours",         sub: "A few hours on weekends"    },
        { value: "5-10",  label: "5–10 hours",         sub: "An hour most evenings"      },
        { value: "10-20", label: "10–20 hours",        sub: "A solid part-time effort"   },
        { value: "20+",   label: "20+ hours",          sub: "Near full-time commitment"  },
      ],
    },
    {
      key: "budget" as const,
      question: "What is your starting budget?",
      options: [
        { value: "under-100", label: "Under $100",    sub: "Bootstrap from near zero" },
        { value: "100-500",   label: "$100–$500",     sub: "Small tools and software"  },
        { value: "500-2k",    label: "$500–$2,000",   sub: "Room to invest in tools"   },
        { value: "2k+",       label: "Over $2,000",   sub: "Comfortable with upfront"  },
      ],
    },
    {
      key: "skills" as const,
      question: "What skills or experience do you bring?",
      isText: true,
      placeholder: "e.g. I have 5 years in marketing, I can write well, I know Excel...",
    },
    {
      key: "interests" as const,
      question: "What industries or topics interest you?",
      isText: true,
      placeholder: "e.g. fitness, software tools, finance, education, real estate...",
    },
  ];

  const current = steps[step];

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await actionGenerateOpportunities(answers);
    setLoading(false);
    if (result.success) {
      onResults(result.data);
      onClose();
    } else {
      setError(result.error);
    }
  }

  function selectOption(value: string) {
    setAnswers((a) => ({ ...a, [current.key]: value }));
    if (step < steps.length - 1) setStep((s) => s + 1);
  }

  const isLast = step === steps.length - 1;
  const canProceed = answers[current.key].trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "hsl(220 14% 5% / 0.85)" }}>
      <div
        className="relative w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
        style={{ border: "1px solid hsl(220 13% 18%)", backgroundColor: "hsl(220 14% 10%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid hsl(220 13% 15%)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>Generate Ideas For Me</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>Step {step + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ border: "1px solid hsl(220 13% 20%)", color: "hsl(220 9% 36%)" }}>
            <IconClose />
          </button>
        </div>

        {/* Progress */}
        <div className="h-0.5 w-full" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
          <div
            className="h-full transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%`, backgroundColor: "hsl(213 94% 62%)" }}
          />
        </div>

        {/* Question */}
        <div className="px-6 py-6">
          <p className="text-base font-semibold mb-5" style={{ color: "hsl(220 9% 88%)" }}>{current.question}</p>

          {"isText" in current && current.isText ? (
            <div className="space-y-4">
              <textarea
                value={answers[current.key]}
                onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
                placeholder={current.placeholder}
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                style={{
                  backgroundColor: "hsl(220 13% 13%)",
                  border: "1px solid hsl(220 13% 20%)",
                  color: "hsl(220 9% 82%)",
                  caretColor: "hsl(213 94% 62%)",
                }}
              />
              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="h-10 px-4 rounded-xl text-sm font-medium"
                    style={{ border: "1px solid hsl(220 13% 20%)", color: "hsl(220 9% 50%)" }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={isLast ? handleGenerate : () => setStep((s) => s + 1)}
                  disabled={!canProceed || loading}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: canProceed && !loading ? "hsl(213 94% 58%)" : "hsl(220 13% 18%)",
                    color: canProceed && !loading ? "hsl(220 14% 7%)" : "hsl(220 9% 32%)",
                  }}
                >
                  {loading ? <><IconSpinner /> Generating...</> : isLast ? "Generate opportunities" : "Continue"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {"options" in current && current.options?.map((opt) => {
                const isSelected = answers[current.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => selectOption(opt.value)}
                    className="text-left rounded-xl px-4 py-3.5 transition-colors"
                    style={{
                      backgroundColor: isSelected ? "hsl(213 94% 62% / 0.08)" : "hsl(220 13% 13%)",
                      border: isSelected ? "1px solid hsl(213 94% 62% / 0.3)" : "1px solid hsl(220 13% 20%)",
                    }}
                  >
                    <p className="text-sm font-semibold mb-0.5" style={{ color: isSelected ? "hsl(213 94% 70%)" : "hsl(220 9% 78%)" }}>{opt.label}</p>
                    <p className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>{"sub" in opt ? opt.sub : ""}</p>
                  </button>
                );
              })}
            </div>
          )}

          {error && <p className="text-xs mt-3" style={{ color: "hsl(0 72% 62%)" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ── AI Advisor panel ──────────────────────────────────────────────────────────

function AIAdvisorPanel({ onClose, onResults }: { onClose: () => void; onResults: (opps: Opportunity[], reasoning: string) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");

  const current = ADVISOR_QUESTIONS[qIndex];

  async function handleAnswer(answer: string) {
    const updated = [...answers, { question: current.question, answer }];
    setAnswers(updated);

    if (qIndex < ADVISOR_QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setLoading(true);
      setError(null);
      const result = await actionAIAdvisorRecommend(updated);
      setLoading(false);
      if (result.success) {
        setReasoning(result.data.reasoning);
        onResults(result.data.opportunities, result.data.reasoning);
        onClose();
      } else {
        setError(result.error);
      }
    }
  }

  return (
    <div
      className="flex flex-col h-full shrink-0"
      style={{ width: 420, borderLeft: "1px solid hsl(220 13% 12%)", backgroundColor: "hsl(220 14% 8%)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>AI Business Advisor</p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
            {loading ? "Analyzing your answers..." : `Question ${qIndex + 1} of ${ADVISOR_QUESTIONS.length}`}
          </p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 36%)" }}>
          <IconClose />
        </button>
      </div>

      <div className="h-0.5" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
        <div
          className="h-full transition-all"
          style={{
            width: loading ? "100%" : `${((qIndex) / ADVISOR_QUESTIONS.length) * 100}%`,
            backgroundColor: "hsl(213 94% 62%)",
            transition: loading ? "width 2s linear" : "width 0.3s ease",
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <IconSpinner />
            <p className="text-sm text-center" style={{ color: "hsl(220 9% 50%)" }}>
              Analyzing your answers and finding the best opportunities...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Past answers */}
            {answers.map((a, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>{a.question}</p>
                <p className="text-sm font-medium" style={{ color: "hsl(220 9% 62%)" }}>{a.answer}</p>
              </div>
            ))}

            {/* Current question */}
            <div>
              <p className="text-sm font-semibold mb-4" style={{ color: "hsl(220 9% 88%)" }}>{current.question}</p>
              <div className="space-y-2">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="w-full text-left rounded-xl px-4 py-3 text-sm transition-colors"
                    style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)", color: "hsl(220 9% 72%)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(213 94% 62% / 0.3)"; (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 86%)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 17%)"; (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 72%)"; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs" style={{ color: "hsl(0 72% 62%)" }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-24">
      <p className="text-sm font-medium" style={{ color: "hsl(220 9% 36%)" }}>No opportunities match your filters</p>
      <button onClick={onClear} className="text-sm" style={{ color: "hsl(213 94% 62%)" }}>Clear filters</button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const EMPTY_FILTERS: OpportunityFilters = {
  types: [],
  difficulty: [],
  startupCost: [],
  revenuePotential: [],
  launchSpeed: [],
};

export default function OpportunitiesPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>(SEED_OPPORTUNITIES);
  const [filters, setFilters] = useState<OpportunityFilters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorReasoning, setAdvisorReasoning] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (filters.types.length > 0 && !filters.types.includes(o.type)) return false;
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(o.difficulty)) return false;
      if (filters.startupCost.length > 0 && !filters.startupCost.includes(o.startupCost)) return false;
      if (filters.revenuePotential.length > 0 && !filters.revenuePotential.includes(o.revenuePotential)) return false;
      if (filters.launchSpeed.length > 0 && !filters.launchSpeed.includes(o.launchSpeed)) return false;
      return true;
    });
  }, [opportunities, filters]);

  const handleBuild = useCallback((opp: Opportunity) => {
    const params = new URLSearchParams({
      idea: opp.buildPrompt,
      type: opp.type,
      from: "opportunity",
      oppName: opp.name,
    });
    router.push(`/dashboard?${params.toString()}`);
  }, [router]);

  function handleGeneratorResults(opps: Opportunity[]) {
    setOpportunities([...opps, ...SEED_OPPORTUNITIES]);
    setAdvisorReasoning(null);
  }

  function handleAdvisorResults(opps: Opportunity[], reasoning: string) {
    setOpportunities([...opps, ...SEED_OPPORTUNITIES]);
    setAdvisorReasoning(reasoning);
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      {/* Filter sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 shrink-0"
          style={{ height: 56, borderBottom: "1px solid hsl(220 13% 12%)" }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold" style={{ color: "hsl(220 9% 86%)" }}>Opportunities</h1>
            <span className="text-xs tabular-nums" style={{ color: "hsl(220 9% 32%)" }}>{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAdvisor(true); setShowGenerator(false); }}
              className="flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-medium transition-colors"
              style={{ border: "1px solid hsl(220 13% 20%)", color: "hsl(220 9% 52%)", backgroundColor: "transparent" }}
            >
              What should I build?
            </button>
            <button
              onClick={() => { setShowGenerator(true); setShowAdvisor(false); }}
              className="flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
            >
              Generate ideas for me
            </button>
          </div>
        </div>

        {/* Advisor reasoning banner */}
        {advisorReasoning && (
          <div
            className="px-6 py-3 flex items-start justify-between gap-4 shrink-0"
            style={{ backgroundColor: "hsl(213 94% 62% / 0.05)", borderBottom: "1px solid hsl(213 94% 62% / 0.12)" }}
          >
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "hsl(213 94% 62%)" }}>Personalized recommendations</p>
              <p className="text-xs" style={{ color: "hsl(220 9% 50%)" }}>{advisorReasoning}</p>
            </div>
            <button onClick={() => setAdvisorReasoning(null)} style={{ color: "hsl(220 9% 36%)", flexShrink: 0 }}>
              <IconClose />
            </button>
          </div>
        )}

        {/* Cards grid */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {filtered.length === 0 ? (
            <EmptyState onClear={() => setFilters(EMPTY_FILTERS)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  onClick={() => { setSelected(opp); setShowAdvisor(false); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && !showAdvisor && (
        <DetailPanel
          opp={selected}
          onClose={() => setSelected(null)}
          onBuild={handleBuild}
        />
      )}

      {/* AI Advisor panel */}
      {showAdvisor && (
        <AIAdvisorPanel
          onClose={() => setShowAdvisor(false)}
          onResults={handleAdvisorResults}
        />
      )}

      {/* Generator modal */}
      {showGenerator && (
        <GeneratorModal
          onClose={() => setShowGenerator(false)}
          onResults={handleGeneratorResults}
        />
      )}
    </div>
  );
}
