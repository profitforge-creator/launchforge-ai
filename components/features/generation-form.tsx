"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  actionRunResearch,
  actionRunProduct,
  actionRunMarketing,
  actionRunCritic,
  actionRunAssets,
  actionFinalizeGeneration,
} from "@/app/actions/generate";
import type { BusinessFormData } from "@/types";
import type { AssetSet } from "@/lib/assets/types";
import type {
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
} from "@/lib/types/agents";

const timeOptions = [
  { value: "", label: "Select availability" },
  { value: "1-5", label: "1–5 hours/week" },
  { value: "5-10", label: "5–10 hours/week" },
  { value: "10-20", label: "10–20 hours/week" },
  { value: "20-40", label: "20–40 hours/week" },
  { value: "40+", label: "Full-time (40+ hrs)" },
];

const incomeOptions = [
  { value: "", label: "Select income goal" },
  { value: "500", label: "$500/month" },
  { value: "1000", label: "$1,000/month" },
  { value: "2500", label: "$2,500/month" },
  { value: "5000", label: "$5,000/month" },
  { value: "10000", label: "$10,000/month" },
  { value: "25000+", label: "$25,000+/month" },
];

const businessTypeOptions = [
  { value: "", label: "Select business type" },
  { value: "saas", label: "SaaS / Software" },
  { value: "digital-product", label: "Digital Product" },
  { value: "productized-service", label: "Productized Service" },
  { value: "content", label: "Content / Newsletter" },
  { value: "agency", label: "Agency / Consulting" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "open", label: "Open — Let AI decide" },
];

interface PipelineStep {
  label: string;
  sublabel: string;
}

const STEPS: PipelineStep[] = [
  { label: "Researching market demand", sublabel: "Analyzing competitors and market gaps" },
  { label: "Building product concept",  sublabel: "Generating name, deliverables, and pricing" },
  { label: "Designing marketing plan",  sublabel: "Creating hooks, content calendar, and launch strategy" },
  { label: "Reviewing opportunity",     sublabel: "Identifying weaknesses and improvements" },
  { label: "Generating your assets",    sublabel: "Creating downloadable templates, documents, and deliverables" },
  { label: "Finalizing results",        sublabel: "Assembling your complete business package" },
];

type StepStatus = "pending" | "active" | "complete" | "error";

const INITIAL_FORM: BusinessFormData = {
  interests: "",
  skills: "",
  timePerWeek: "",
  incomeGoal: "",
  businessType: "",
};

export function GenerationForm() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessFormData>(INITIAL_FORM);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(Array(STEPS.length).fill("pending"));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const isValid =
    form.interests.trim().length > 2 &&
    form.skills.trim().length > 2 &&
    form.timePerWeek !== "" &&
    form.incomeGoal !== "" &&
    form.businessType !== "";

  function markStep(index: number, status: StepStatus) {
    setCurrentStep(index);
    setStepStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || running) return;

    setRunning(true);
    setErrorMessage(null);
    setStepStatuses(Array(STEPS.length).fill("pending"));

    let research: ResearchAgentOutput | null = null;
    let product: ProductAgentOutput | null = null;
    let marketing: MarketingAgentOutput | null = null;
    let critic: CriticAgentOutput | null = null;
    let assets: AssetSet | null = null;

    // ── Step 0: Research ──────────────────────────────────────────────────────
    markStep(0, "active");
    const r0 = await actionRunResearch(form);
    if (!r0.success) {
      markStep(0, "error");
      setErrorMessage(r0.error);
      setRunning(false);
      return;
    }
    research = r0.data;
    markStep(0, "complete");

    // ── Step 1: Product ───────────────────────────────────────────────────────
    markStep(1, "active");
    const r1 = await actionRunProduct(form, research);
    if (!r1.success) {
      markStep(1, "error");
      setErrorMessage(r1.error);
      setRunning(false);
      return;
    }
    product = r1.data;
    markStep(1, "complete");

    // ── Step 2: Marketing ─────────────────────────────────────────────────────
    markStep(2, "active");
    const r2 = await actionRunMarketing(form, research, product);
    if (!r2.success) {
      markStep(2, "error");
      setErrorMessage(r2.error);
      setRunning(false);
      return;
    }
    marketing = r2.data;
    markStep(2, "complete");

    // ── Step 3: Critic ────────────────────────────────────────────────────────
    markStep(3, "active");
    const r3 = await actionRunCritic(form, research, product, marketing);
    if (!r3.success) {
      markStep(3, "error");
      setErrorMessage(r3.error);
      setRunning(false);
      return;
    }
    critic = r3.data;
    markStep(3, "complete");

    // ── Step 4: Assets ────────────────────────────────────────────────────────
    markStep(4, "active");
    const r4 = await actionRunAssets(form, research, product);
    if (!r4.success) {
      markStep(4, "error");
      setErrorMessage(r4.error);
      setRunning(false);
      return;
    }
    assets = r4.data;
    markStep(4, "complete");

    // ── Step 5: Finalize ──────────────────────────────────────────────────────
    markStep(5, "active");
    const r5 = await actionFinalizeGeneration(form, research, product, marketing, critic, assets);
    if (!r5.success) {
      markStep(5, "error");
      setErrorMessage(r5.error);
      setRunning(false);
      return;
    }
    markStep(5, "complete");

    // Navigate to the results page
    router.push(`/dashboard/results/${r5.data.id}`);
  }

  const showProgress = running || (currentStep >= 0 && stepStatuses.some((s) => s === "complete"));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!running && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Interests"
                placeholder="e.g. software development, fitness, personal finance, cooking..."
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                hint="What topics do you genuinely enjoy or know deeply?"
                disabled={running}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Skills"
                placeholder="e.g. TypeScript, video editing, copywriting, Excel, sales..."
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                hint="Both professional and personal skills count."
                disabled={running}
              />
            </div>
            <Select
              label="Time Available Per Week"
              options={timeOptions}
              value={form.timePerWeek}
              onChange={(e) => setForm({ ...form, timePerWeek: e.target.value })}
              disabled={running}
            />
            <Select
              label="Income Goal"
              options={incomeOptions}
              value={form.incomeGoal}
              onChange={(e) => setForm({ ...form, incomeGoal: e.target.value })}
              disabled={running}
            />
            <div className="md:col-span-2">
              <Select
                label="Preferred Business Type"
                options={businessTypeOptions}
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                disabled={running}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" size="md" disabled={!isValid}>
              Generate Business
            </Button>
            <span className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
              Uses 1 of your 50 monthly generations
            </span>
          </div>
        </>
      )}

      {/* ── Progress tracker ── */}
      {showProgress && (
        <div className="rounded-lg p-5 space-y-4" style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 12%)" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 75%)" }}>
              Generating your business brief
            </p>
            <span className="text-xs tabular-nums" style={{ color: "hsl(220 9% 40%)" }}>
              {stepStatuses.filter((s) => s === "complete").length} / {STEPS.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 20%)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(stepStatuses.filter((s) => s === "complete").length / STEPS.length) * 100}%`,
                backgroundColor: "hsl(213 94% 62%)",
              }}
            />
          </div>

          {/* Step list */}
          <div className="space-y-2.5 pt-1">
            {STEPS.map((step, i) => {
              const status = stepStatuses[i];
              return (
                <div key={i} className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className="shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
                    {status === "complete" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {status === "active" && (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {status === "error" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(0 72% 58%)" }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {status === "pending" && (
                      <div className="w-3.5 h-3.5 rounded-full" style={{ border: "1.5px solid hsl(220 13% 28%)" }} />
                    )}
                  </div>

                  {/* Label */}
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{
                        color:
                          status === "active" ? "hsl(220 9% 90%)" :
                          status === "complete" ? "hsl(220 9% 70%)" :
                          status === "error" ? "hsl(0 72% 62%)" :
                          "hsl(220 9% 38%)",
                      }}
                    >
                      {step.label}
                    </p>
                    {status === "active" && (
                      <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 45%)" }}>
                        {step.sublabel}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="rounded p-3 mt-2" style={{ backgroundColor: "hsl(0 72% 58% / 0.1)", border: "1px solid hsl(0 72% 58% / 0.2)" }}>
              <p className="text-xs" style={{ color: "hsl(0 72% 62%)" }}>{errorMessage}</p>
              <button
                type="button"
                className="text-xs mt-2 underline"
                style={{ color: "hsl(0 72% 62%)" }}
                onClick={() => {
                  setRunning(false);
                  setCurrentStep(-1);
                  setStepStatuses(Array(STEPS.length).fill("pending"));
                  setErrorMessage(null);
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
