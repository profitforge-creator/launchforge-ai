"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { BusinessFormData } from "@/types";

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

const INITIAL: BusinessFormData = {
  interests: "",
  skills: "",
  timePerWeek: "",
  incomeGoal: "",
  businessType: "",
};

export function GenerationForm() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessFormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>("");

  const isValid =
    form.interests.trim().length > 2 &&
    form.skills.trim().length > 2 &&
    form.timePerWeek &&
    form.incomeGoal &&
    form.businessType;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    // AI INTEGRATION POINT:
    // Replace this sequence with a real API call to your AI generation endpoint.
    // Expected: POST /api/generate with BusinessFormData → BusinessResult
    const steps = [
      "Analyzing market demand...",
      "Researching competitors...",
      "Building product concept...",
      "Generating marketing plan...",
      "Finalizing recommendations...",
    ];
    for (const s of steps) {
      setStep(s);
      await new Promise((r) => setTimeout(r, 600));
    }

    // Navigate to demo results (in production, navigate to /dashboard/results/[generated-id])
    router.push("/dashboard/results/demo");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Interests"
            placeholder="e.g. software development, fitness, personal finance, cooking..."
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
            hint="What topics do you genuinely enjoy or know deeply?"
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Skills"
            placeholder="e.g. TypeScript, video editing, copywriting, Excel, sales..."
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            hint="Both professional and personal skills count."
          />
        </div>
        <Select
          label="Time Available Per Week"
          options={timeOptions}
          value={form.timePerWeek}
          onChange={(e) => setForm({ ...form, timePerWeek: e.target.value })}
        />
        <Select
          label="Income Goal"
          options={incomeOptions}
          value={form.incomeGoal}
          onChange={(e) => setForm({ ...form, incomeGoal: e.target.value })}
        />
        <div className="md:col-span-2">
          <Select
            label="Preferred Business Type"
            options={businessTypeOptions}
            value={form.businessType}
            onChange={(e) => setForm({ ...form, businessType: e.target.value })}
          />
        </div>
      </div>

      {loading && step && (
        <div className="flex items-center gap-2.5 py-2">
          <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>{step}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          size="md"
          disabled={!isValid}
          loading={loading}
        >
          {loading ? "Generating..." : "Generate Business"}
        </Button>
        <span className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>Uses 1 of your 50 monthly generations</span>
      </div>
    </form>
  );
}
