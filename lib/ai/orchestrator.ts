/**
 * AI Orchestrator — LaunchForge's 6-agent generation pipeline.
 *
 * All agents call Gemini. No mock fallbacks exist.
 * If GEMINI_API_KEY is absent, every agent throws a clear error.
 *
 * Pipeline order:
 *   1. Research Agent     — market demand, competition, scoring, gaps
 *   2. Competitor Agent   — 3 detailed competitor profiles (separate call for depth)
 *   3. Product Agent      — v1 product concept grounded in research
 *   4. Website Agent      — full site copy (5 pages worth of structured content)
 *   5. Marketing Agent    — hooks, content calendar, launch strategy
 *   6. Critic Agent       — weaknesses, improvements, alternatives (gemini-1.5-pro)
 *
 * Output: BusinessResult assembled from all agent outputs + project file system.
 *
 * Rate limiting is enforced in the server action layer, not here.
 * This module is pure pipeline logic.
 */

import { geminiJSON } from "@/lib/ai/gemini";
import { GEMINI_PRO_MODEL } from "@/lib/ai/gemini";
import { RESEARCH_SYSTEM_PROMPT, buildResearchPrompt } from "@/lib/prompts/research-prompts";
import { getProductSystemPrompt, buildProductPrompt } from "@/lib/prompts/product-prompts";
import { getMarketingSystemPrompt, buildMarketingPrompt } from "@/lib/prompts/marketing-prompts";
import { CRITIC_SYSTEM_PROMPT, buildCriticPrompt } from "@/lib/prompts/critic-prompts";
import { getWebsiteSystemPrompt, buildWebsitePrompt } from "@/lib/prompts/website-prompts";
import type { WebsiteContent } from "@/lib/prompts/website-prompts";
import { generateWebsiteFiles } from "@/lib/generation/website-generator";
import { buildProjectFiles } from "@/lib/project/files";
import { generateAssets } from "@/lib/assets/asset-generator";
import { calculateOpportunityScore } from "@/lib/scoring/opportunity-score";
import type {
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
  CriticImprovement,
  AlternativeIdea,
} from "@/lib/types/agents";
import type { BusinessFormData, BusinessResult, Recommendation, ProjectFile } from "@/types";
import type { AssetSet } from "@/lib/assets/types";

// ── Input normalization ───────────────────────────────────────────────────────

export function toAgentInput(form: BusinessFormData): AgentInput {
  return {
    interests: form.idea || form.interests,
    skills: form.skills || "open to direction",
    timePerWeek: form.timePerWeek || "10-20",
    incomeGoal: form.incomeGoal || "1000",
    businessType: form.businessType || "open",
  };
}

// ── Agent 1: Research ─────────────────────────────────────────────────────────

export async function runResearch(form: BusinessFormData): Promise<ResearchAgentOutput> {
  const input = toAgentInput(form);
  return geminiJSON<ResearchAgentOutput>(
    RESEARCH_SYSTEM_PROMPT,
    buildResearchPrompt(input),
  );
}

// ── Agent 2: Product ──────────────────────────────────────────────────────────

export async function runProduct(
  form: BusinessFormData,
  research: ResearchAgentOutput,
): Promise<ProductAgentOutput> {
  const input = toAgentInput(form);
  return geminiJSON<ProductAgentOutput>(
    getProductSystemPrompt(input.businessType),
    buildProductPrompt(input, research),
  );
}

// ── Agent 3: Website content ──────────────────────────────────────────────────

export async function runWebsiteContent(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  businessType = "open",
): Promise<WebsiteContent> {
  return geminiJSON<WebsiteContent>(
    getWebsiteSystemPrompt(businessType),
    buildWebsitePrompt(product, research, businessType),
  );
}

/**
 * Generates the complete set of deployable website ProjectFile[].
 * Gemini produces the copy; the TSX template layer injects it.
 */
export async function runWebsite(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  businessType = "open",
): Promise<ProjectFile[]> {
  const content = await runWebsiteContent(product, research, businessType);
  return generateWebsiteFiles(product, research, content);
}

// ── Agent 4: Marketing ────────────────────────────────────────────────────────

export async function runMarketing(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<MarketingAgentOutput> {
  const input = toAgentInput(form);
  return geminiJSON<MarketingAgentOutput>(
    getMarketingSystemPrompt(input.businessType),
    buildMarketingPrompt(input, research, product),
  );
}

// ── Agent 5: Critic ───────────────────────────────────────────────────────────

export async function runCritic(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
): Promise<CriticAgentOutput> {
  const input = toAgentInput(form);
  return geminiJSON<CriticAgentOutput>(
    CRITIC_SYSTEM_PROMPT,
    buildCriticPrompt(input, research, product, marketing),
    GEMINI_PRO_MODEL,
  );
}

// ── Assets (template-based, Gemini-enhanced metadata) ────────────────────────

export function runAssets(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): AssetSet {
  return generateAssets(product, research, form);
}

// ── Assembly ──────────────────────────────────────────────────────────────────

function buildRecommendations(critic: CriticAgentOutput): Recommendation[] {
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
  const firstHigh = critic.improvements.find((i) => i.priority === "high");
  const nextStep: Recommendation = {
    type: "next-step",
    title: firstHigh ? `Start with: ${firstHigh.title}` : "Validate before building",
    description: firstHigh
      ? `${firstHigh.description} This is your highest-leverage starting point.`
      : "Talk to 10 potential customers this week before writing a single line of code.",
    priority: "high",
  };
  return [...improvements, ...alternatives, nextStep];
}

export function assembleResult(
  id: string,
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  critic: CriticAgentOutput,
  assets: AssetSet,
  websiteFiles: ProjectFile[],
): BusinessResult {
  const scores = calculateOpportunityScore(
    research.demandScore,
    research.monetizationScore,
    research.competitionScore,
    research.difficultyScore,
  );
  const projectFiles = buildProjectFiles(research, product, marketing, assets, websiteFiles);

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
    recommendations: buildRecommendations(critic),
    assets,
    projectFiles,
    aiEditsUsed: 0,
  };
}
