// Generation Orchestrator
//
// Runs the 4-agent pipeline sequentially and assembles the final BusinessResult.
//
// Pipeline:
//   AgentInput
//     → ResearchAgent   → ResearchAgentOutput
//     → ProductAgent    → ProductAgentOutput
//     → MarketingAgent  → MarketingAgentOutput
//     → CriticAgent     → CriticAgentOutput
//     → assemble()      → BusinessResult

import { researchAgent } from "@/lib/agents/research-agent";
import { productAgent } from "@/lib/agents/product-agent";
import { marketingAgent } from "@/lib/agents/marketing-agent";
import { criticAgent } from "@/lib/agents/critic-agent";
import { calculateOpportunityScore } from "@/lib/scoring/opportunity-score";
import type { BusinessFormData, BusinessResult, Recommendation } from "@/types";
import type {
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
  CriticImprovement,
  AlternativeIdea,
} from "@/lib/types/agents";

export type GenerationStep =
  | "idle"
  | "research"
  | "product"
  | "marketing"
  | "critic"
  | "complete"
  | "error";

export interface StepResult {
  step: GenerationStep;
  label: string;
}

export const PIPELINE_STEPS: StepResult[] = [
  { step: "research",  label: "Researching market demand..." },
  { step: "product",   label: "Building product concept..." },
  { step: "marketing", label: "Designing marketing plan..." },
  { step: "critic",    label: "Reviewing opportunity..." },
  { step: "complete",  label: "Finalizing results..." },
];

// Convert BusinessFormData to AgentInput (same shape — makes the boundary explicit)
function toAgentInput(form: BusinessFormData): AgentInput {
  return {
    interests: form.interests,
    skills: form.skills,
    timePerWeek: form.timePerWeek,
    incomeGoal: form.incomeGoal,
    businessType: form.businessType,
  };
}

// Map CriticAgentOutput improvements/alternatives → Recommendation[]
function assembleRecommendations(critic: CriticAgentOutput): Recommendation[] {
  const improvements: Recommendation[] = critic.improvements.map(
    (imp: CriticImprovement) => ({
      type: "improvement" as const,
      title: imp.title,
      description: imp.description,
      priority: imp.priority,
    }),
  );

  const alternatives: Recommendation[] = critic.alternativeIdeas.map(
    (alt: AlternativeIdea) => ({
      type: "alternative" as const,
      title: alt.title,
      description: alt.description,
      priority: "medium" as const,
    }),
  );

  // Always add a concrete next-step based on the first high-priority improvement
  const firstStep = critic.improvements.find((i) => i.priority === "high");
  const nextStep: Recommendation = {
    type: "next-step",
    title: firstStep
      ? `Start with: ${firstStep.title}`
      : "Validate before building",
    description: firstStep
      ? `${firstStep.description} This is your highest-leverage starting point.`
      : "Talk to 10 potential customers this week before writing a single line of code.",
    priority: "high",
  };

  return [...improvements, ...alternatives, nextStep];
}

// Assemble all agent outputs into the final BusinessResult
function assemble(
  id: string,
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  critic: CriticAgentOutput,
): BusinessResult {
  const scores = calculateOpportunityScore(
    research.demandScore,
    research.monetizationScore,
    research.competitionScore,
    research.difficultyScore,
  );

  return {
    id,
    createdAt: new Date().toISOString(),
    formData: form,
    niche: research.niche,
    summary: research.opportunitySummary,
    marketGaps: research.marketGaps,
    scores,
    competitors: research.competitors,
    product: {
      name: product.productName,
      tagline: product.tagline,
      description: product.description,
      targetAudience: product.targetAudience,
      deliverables: product.deliverables,
      pricingModel: product.pricingModel,
      suggestedPrice: product.suggestedPrice,
      timeToLaunch: product.timeToLaunch,
    },
    marketing: {
      tiktokHooks: marketing.tiktokHooks,
      contentIdeas: marketing.contentIdeas,
      contentPillars: marketing.contentPillars,
      launchStrategy: marketing.launchStrategy,
      contentCalendar: marketing.contentCalendar,
    },
    recommendations: assembleRecommendations(critic),
  };
}

// ── Individual step runners (called from server actions) ──────────────────────

export async function runResearchStep(
  form: BusinessFormData,
): Promise<ResearchAgentOutput> {
  return researchAgent.run(toAgentInput(form));
}

export async function runProductStep(
  form: BusinessFormData,
  research: ResearchAgentOutput,
): Promise<ProductAgentOutput> {
  return productAgent.run({ formInput: toAgentInput(form), research });
}

export async function runMarketingStep(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<MarketingAgentOutput> {
  return marketingAgent.run({ formInput: toAgentInput(form), research, product });
}

export async function runCriticStep(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
): Promise<CriticAgentOutput> {
  return criticAgent.run({ formInput: toAgentInput(form), research, product, marketing });
}

export function assembleResult(
  id: string,
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  critic: CriticAgentOutput,
): BusinessResult {
  return assemble(id, form, research, product, marketing, critic);
}
