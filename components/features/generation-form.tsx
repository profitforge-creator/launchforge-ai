"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  actionRunResearch,
  actionRunProduct,
  actionRunMarketing,
  actionRunCritic,
  actionRunAssets,
  actionRunWebsite,
  actionFinalizeProject,
} from "@/app/actions/generate";
import type { BusinessFormData, ProjectFile } from "@/types";
import type { AssetSet } from "@/lib/assets/types";
import type {
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
} from "@/lib/types/agents";

// ── Build stages ──────────────────────────────────────────────────────────────

interface BuildStage {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  /** Simulated duration hint shown to the user */
  estSeconds: number;
}

const BUILD_STAGES: BuildStage[] = [
  {
    id: "research",
    label: "Researching Market",
    sublabel: "Analyzing demand signals, search trends, and market size",
    icon: "🔍",
    estSeconds: 12,
  },
  {
    id: "competitors",
    label: "Analyzing Competitors",
    sublabel: "Mapping competitor products, pricing, and key weaknesses",
    icon: "🏆",
    estSeconds: 8,
  },
  {
    id: "opportunity",
    label: "Identifying Opportunity",
    sublabel: "Scoring demand, competition gap, and monetization potential",
    icon: "💡",
    estSeconds: 4,
  },
  {
    id: "product",
    label: "Designing Product",
    sublabel: "Structuring deliverables, pricing model, and product architecture",
    icon: "📐",
    estSeconds: 10,
  },
  {
    id: "assets",
    label: "Generating Product",
    sublabel: "Creating complete product documents, templates, and content",
    icon: "📦",
    estSeconds: 14,
  },
  {
    id: "website",
    label: "Building Website",
    sublabel: "Writing homepage, pricing, features, about, and FAQ pages",
    icon: "🌐",
    estSeconds: 8,
  },
  {
    id: "marketing",
    label: "Creating Marketing System",
    sublabel: "Building content calendar, launch strategy, and growth hooks",
    icon: "📣",
    estSeconds: 10,
  },
  {
    id: "finalize",
    label: "Finalizing Project",
    sublabel: "Assembling all files and saving your complete project",
    icon: "✅",
    estSeconds: 4,
  },
];

const TOTAL_EST_SECONDS = BUILD_STAGES.reduce((a, s) => a + s.estSeconds, 0);

// ── Idea detection ────────────────────────────────────────────────────────────

function detectBusinessType(idea: string): string {
  const lower = idea.toLowerCase();
  if (/notion|template|dashboard|system|workspace/.test(lower)) return "digital-product";
  if (/app|saas|software|tool|platform/.test(lower)) return "saas";
  if (/content|newsletter|youtube|tiktok|instagram|creator|blog/.test(lower)) return "content";
  if (/agency|freelance|consulting|service|client/.test(lower)) return "agency";
  if (/course|teach|learn|education|tutoring|coaching/.test(lower)) return "digital-product";
  return "open";
}

function expandIdea(idea: string): BusinessFormData {
  return {
    idea,
    interests: idea,
    skills: "open to any direction",
    timePerWeek: "10-20",
    incomeGoal: "1000",
    businessType: detectBusinessType(idea),
  };
}

// ── Quick-start prompts ───────────────────────────────────────────────────────

const QUICK_STARTS = [
  "I like anime",
  "I want passive income",
  "I love fitness",
  "I'm good at Excel",
  "I need $1000/month",
];

// ── Stage status ──────────────────────────────────────────────────────────────

type StageStatus = "pending" | "active" | "complete" | "error";

// ── Main component ────────────────────────────────────────────────────────────

export function GenerationForm() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [running, setRunning] = useState(false);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>(
    Array(BUILD_STAGES.length).fill("pending"),
  );
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValid = idea.trim().length >= 2;
  const completedCount = stageStatuses.filter((s) => s === "complete").length;
  const progressPct = Math.round((completedCount / BUILD_STAGES.length) * 100);
  const estimatedRemaining = Math.max(
    0,
    TOTAL_EST_SECONDS - elapsedSeconds,
  );

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => () => stopTimer(), []);

  function setStage(index: number, status: StageStatus) {
    setActiveStageIndex(index);
    setStageStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  }

  function completeStage(index: number) {
    setStageStatuses((prev) => {
      const next = [...prev];
      next[index] = "complete";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || running) return;

    setRunning(true);
    setErrorMessage(null);
    setStageStatuses(Array(BUILD_STAGES.length).fill("pending"));
    setActiveStageIndex(-1);
    setElapsedSeconds(0);
    startTimer();

    const form = expandIdea(idea.trim());

    let research: ResearchAgentOutput | null = null;
    let product: ProductAgentOutput | null = null;
    let marketing: MarketingAgentOutput | null = null;
    let critic: CriticAgentOutput | null = null;
    let assets: AssetSet | null = null;
    let websiteFiles: ProjectFile[] = [];

    // ── Stage 0–2: Research (market + competitors + opportunity) ─────────────
    setStage(0, "active");

    const r0 = await actionRunResearch(form);
    if (!r0.success) {
      setStage(0, "error");
      setErrorMessage(r0.error);
      setRunning(false);
      stopTimer();
      return;
    }
    research = r0.data;

    // Simulate competitor analysis sub-stage (visual only)
    completeStage(0);
    setStage(1, "active");
    await new Promise((res) => setTimeout(res, 600));
    completeStage(1);

    // Simulate opportunity scoring (instant)
    setStage(2, "active");
    await new Promise((res) => setTimeout(res, 400));
    completeStage(2);

    // ── Stage 3: Product design ──────────────────────────────────────────────
    setStage(3, "active");
    const r1 = await actionRunProduct(form, research);
    if (!r1.success) {
      setStage(3, "error");
      setErrorMessage(r1.error);
      setRunning(false);
      stopTimer();
      return;
    }
    product = r1.data;
    completeStage(3);

    // ── Stage 4: Product generation ──────────────────────────────────────────
    setStage(4, "active");
    const r2 = await actionRunAssets(form, research, product);
    if (!r2.success) {
      setStage(4, "error");
      setErrorMessage(r2.error);
      setRunning(false);
      stopTimer();
      return;
    }
    assets = r2.data;
    completeStage(4);

    // ── Stage 5: Website building ────────────────────────────────────────────
    setStage(5, "active");
    const r3 = await actionRunWebsite(product, research);
    if (!r3.success) {
      setStage(5, "error");
      setErrorMessage(r3.error);
      setRunning(false);
      stopTimer();
      return;
    }
    websiteFiles = r3.data;
    completeStage(5);

    // ── Stage 6: Marketing system (marketing + critic combined) ──────────────
    setStage(6, "active");
    const r4 = await actionRunMarketing(form, research, product);
    if (!r4.success) {
      setStage(6, "error");
      setErrorMessage(r4.error);
      setRunning(false);
      stopTimer();
      return;
    }
    marketing = r4.data;

    const r5 = await actionRunCritic(form, research, product, marketing);
    if (!r5.success) {
      setStage(6, "error");
      setErrorMessage(r5.error);
      setRunning(false);
      stopTimer();
      return;
    }
    critic = r5.data;
    completeStage(6);

    // ── Stage 7: Finalize project ─────────────────────────────────────────────
    setStage(7, "active");
    const r6 = await actionFinalizeProject(form, research, product, marketing, critic, assets, websiteFiles);
    if (!r6.success) {
      setStage(7, "error");
      setErrorMessage(r6.error);
      setRunning(false);
      stopTimer();
      return;
    }
    completeStage(7);
    stopTimer();

    router.push(`/workspace/${r6.data.id}`);
  }

  const showQueue = running || (activeStageIndex >= 0 && completedCount > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Idea input ── */}
      {!running && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={"What do you want to build?\n\nTry: \"I like anime\" · \"I want passive income\" · \"I love fitness\""}
              className="w-full resize-none rounded-lg px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:leading-relaxed"
              style={{
                backgroundColor: "hsl(220 13% 7%)",
                border: "1px solid hsl(220 13% 20%)",
                color: "hsl(220 9% 88%)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "hsl(213 94% 62% / 0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "hsl(220 13% 20%)";
              }}
              disabled={running}
            />
          </div>

          {/* Quick-start chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs mr-1" style={{ color: "hsl(220 9% 38%)" }}>Try:</span>
            {QUICK_STARTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setIdea(q)}
                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: "hsl(220 13% 13%)",
                  border: "1px solid hsl(220 13% 20%)",
                  color: "hsl(220 9% 55%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "hsl(220 13% 18%)";
                  e.currentTarget.style.color = "hsl(220 9% 75%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "hsl(220 13% 13%)";
                  e.currentTarget.style.color = "hsl(220 9% 55%)";
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!isValid}
              className="h-9 px-5 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: isValid ? "hsl(213 94% 62%)" : "hsl(220 13% 18%)",
                color: isValid ? "hsl(220 13% 8%)" : "hsl(220 9% 35%)",
                cursor: isValid ? "pointer" : "not-allowed",
              }}
            >
              Build My Business →
            </button>
            <span className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>
              Free · Uses 1 of 3 monthly builds
            </span>
          </div>
        </div>
      )}

      {/* ── Build queue ── */}
      {showQueue && (
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 9%)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {running && (
                <svg
                  className="w-3.5 h-3.5 animate-spin shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{ color: "hsl(213 94% 62%)" }}
                >
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 80%)" }}>
                {running ? "LaunchForge is building your business..." : "Build complete"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs tabular-nums" style={{ color: "hsl(220 9% 40%)" }}>
              {running && estimatedRemaining > 0 && (
                <span>~{estimatedRemaining}s remaining</span>
              )}
              <span style={{ color: progressPct === 100 ? "hsl(151 60% 48%)" : "hsl(213 94% 62%)" }}>
                {progressPct}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 18%)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                backgroundColor: progressPct === 100 ? "hsl(151 60% 48%)" : "hsl(213 94% 62%)",
              }}
            />
          </div>

          {/* Stage list */}
          <div className="space-y-1 pt-1">
            {BUILD_STAGES.map((stage, i) => {
              const status = stageStatuses[i];
              const isActive = status === "active";
              const isDone = status === "complete";
              const isErr = status === "error";
              const isPending = status === "pending";

              return (
                <div
                  key={stage.id}
                  className="flex items-start gap-3 py-1.5 px-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: isActive ? "hsl(220 13% 14%)" : "transparent",
                  }}
                >
                  {/* Status icon */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    {isDone && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isActive && (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {isErr && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(0 72% 58%)" }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isPending && (
                      <div className="w-3.5 h-3.5 rounded-full" style={{ border: "1.5px solid hsl(220 13% 26%)" }} />
                    )}
                  </div>

                  {/* Stage icon + labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{stage.icon}</span>
                      <p
                        className="text-xs font-medium"
                        style={{
                          color: isDone
                            ? "hsl(220 9% 55%)"
                            : isActive
                            ? "hsl(220 9% 92%)"
                            : isErr
                            ? "hsl(0 72% 62%)"
                            : "hsl(220 9% 33%)",
                        }}
                      >
                        {stage.label}
                      </p>
                    </div>
                    {isActive && (
                      <p className="text-xs mt-0.5 pl-7" style={{ color: "hsl(220 9% 42%)" }}>
                        {stage.sublabel}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              className="rounded-lg p-3 mt-2"
              style={{ backgroundColor: "hsl(0 72% 58% / 0.08)", border: "1px solid hsl(0 72% 58% / 0.2)" }}
            >
              <p className="text-xs" style={{ color: "hsl(0 72% 65%)" }}>{errorMessage}</p>
              <button
                type="button"
                className="text-xs mt-2 underline"
                style={{ color: "hsl(0 72% 65%)" }}
                onClick={() => {
                  setRunning(false);
                  setActiveStageIndex(-1);
                  setStageStatuses(Array(BUILD_STAGES.length).fill("pending"));
                  setErrorMessage(null);
                  setElapsedSeconds(0);
                  stopTimer();
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
