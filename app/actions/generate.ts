"use server";

import { randomUUID } from "crypto";
import {
  runResearchStep,
  runProductStep,
  runMarketingStep,
  runCriticStep,
  runAssetStep,
  runWebsiteStep,
  assembleResult,
} from "@/lib/generation/orchestrator";
import { saveGeneration, getGeneration, patchGeneration } from "@/lib/storage/generation-store";
import { rollbackProjectIncrement } from "@/lib/ai/rate-limiter";
import { geminiJSON } from "@/lib/ai/gemini";
import type { BusinessFormData, BusinessResult, ProjectFile } from "@/types";
import type { AssetSet } from "@/lib/assets/types";
import type {
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
} from "@/lib/types/agents";

// ── Return type ───────────────────────────────────────────────────────────────

type StepResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; upgradeRequired?: boolean };

// ── Error extraction — always surface the real message ────────────────────────

function extractError(err: unknown, stage: string): string {
  const raw = err instanceof Error ? err.message : String(err);
  console.error(`[LaunchForge][${stage}]`, raw);
  return `${stage} failed: ${raw}`;
}

// ── Gemini diagnostic ─────────────────────────────────────────────────────────

export async function actionDiagnoseGemini(): Promise<{
  keyPresent: boolean;
  keyPrefix: string;
  testResult: string;
  error: string | null;
}> {
  const key = process.env.GEMINI_API_KEY ?? "";
  const keyPresent = key.length > 0;
  const keyPrefix = keyPresent ? `${key.slice(0, 8)}...` : "(not set)";

  if (!keyPresent) {
    return { keyPresent, keyPrefix, testResult: "", error: "GEMINI_API_KEY is not set in environment." };
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: 'Reply with exactly: {"ok":true}' }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 20 },
    });
    const text = result.response.text();
    return { keyPresent, keyPrefix, testResult: text, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { keyPresent, keyPrefix, testResult: "", error: msg };
  }
}

// ── Idea generation ───────────────────────────────────────────────────────────

interface GeneratedIdea {
  title: string;
  type: string;
  description: string;
  audience: string;
}

export async function actionGenerateIdeas(
  context?: string,
): Promise<StepResult<GeneratedIdea[]>> {
  try {
    const prompt = context?.trim()
      ? `Generate 4 concrete business ideas based on this context: "${context}". Each idea should be a specific, actionable product concept.`
      : "Generate 4 diverse, concrete business ideas suitable for a solo founder to build. Cover different niches and product types.";

    const data = await geminiJSON<{ ideas: GeneratedIdea[] }>(
      `You generate business idea concepts for solo founders. For each idea respond with a JSON array. Each idea has: title (product name, 2-4 words), type (one of: course, ebook, template, saas, agency, membership, coaching, newsletter), description (1 sentence, specific and actionable), audience (who it's for, 5-8 words). Return: {"ideas": [...]}`,
      prompt,
    );
    return { success: true, data: data.ideas ?? [] };
  } catch (err) {
    return { success: false, error: extractError(err, "IdeaGen") };
  }
}

// ── Section regeneration ──────────────────────────────────────────────────────

export async function actionRegenerateSection(
  projectId: string,
  section: "product" | "website" | "marketing",
): Promise<StepResult<BusinessResult>> {
  try {
    const existing = getGeneration(projectId);
    if (!existing) return { success: false, error: "Project not found." };

    // Reconstruct minimal research output from stored data
    const research: ResearchAgentOutput = {
      niche: existing.niche,
      targetMarket: existing.formData.interests,
      demandScore: existing.scores.demand,
      competitionScore: existing.scores.competition,
      monetizationScore: existing.scores.monetization,
      difficultyScore: existing.scores.difficulty,
      opportunitySummary: existing.summary,
      competitors: existing.competitors,
      marketGaps: existing.marketGaps,
    };

    if (section === "product") {
      const result = await runProductStep(existing.formData, research);
      // Map ProductAgentOutput → ProductConcept
      const newProduct = {
        name: result.productName,
        tagline: result.tagline,
        description: result.description,
        targetAudience: result.targetAudience,
        deliverables: result.deliverables,
        pricingModel: result.pricingModel,
        suggestedPrice: result.suggestedPrice,
        timeToLaunch: result.timeToLaunch,
      };
      patchGeneration(projectId, { product: newProduct });
      const updated = getGeneration(projectId)!;
      return { success: true, data: updated };
    }

    if (section === "website") {
      // Build ProductAgentOutput from stored product
      const productAgent: ProductAgentOutput = {
        productName: existing.product.name,
        tagline: existing.product.tagline,
        description: existing.product.description,
        targetAudience: existing.product.targetAudience,
        deliverables: existing.product.deliverables,
        pricingModel: existing.product.pricingModel,
        suggestedPrice: existing.product.suggestedPrice,
        timeToLaunch: existing.product.timeToLaunch,
      };
      const newFiles = await runWebsiteStep(productAgent, research, existing.formData.businessType ?? "open");
      const existingNonWebsite = existing.projectFiles?.filter((f) => f.folder !== "website") ?? [];
      patchGeneration(projectId, { projectFiles: [...existingNonWebsite, ...newFiles] });
      const updated = getGeneration(projectId)!;
      return { success: true, data: updated };
    }

    if (section === "marketing") {
      const productAgent: ProductAgentOutput = {
        productName: existing.product.name,
        tagline: existing.product.tagline,
        description: existing.product.description,
        targetAudience: existing.product.targetAudience,
        deliverables: existing.product.deliverables,
        pricingModel: existing.product.pricingModel,
        suggestedPrice: existing.product.suggestedPrice,
        timeToLaunch: existing.product.timeToLaunch,
      };
      const result = await runMarketingStep(existing.formData, research, productAgent);
      const newMarketing = {
        tiktokHooks: result.tiktokHooks,
        contentIdeas: result.contentIdeas,
        contentPillars: result.contentPillars,
        launchStrategy: result.launchStrategy,
        contentCalendar: result.contentCalendar,
      };
      patchGeneration(projectId, { marketing: newMarketing });
      const updated = getGeneration(projectId)!;
      return { success: true, data: updated };
    }

    return { success: false, error: "Unknown section." };
  } catch (err) {
    return { success: false, error: extractError(err, `Regenerate:${section}`) };
  }
}

// ── Stage 1–3: Research ────────────────────────────────────────────────────────

export async function actionRunResearch(
  form: BusinessFormData,
): Promise<StepResult<ResearchAgentOutput>> {
  // Rate limiting disabled until auth is wired — "anon" would block after 3 projects
  // TODO: re-enable once real user IDs are available from Supabase session
  try {
    const data = await runResearchStep(form);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: extractError(err, "Research") };
  }
}

// ── Stage 4: Product design ───────────────────────────────────────────────────

export async function actionRunProduct(
  form: BusinessFormData,
  research: ResearchAgentOutput,
): Promise<StepResult<ProductAgentOutput>> {
  try {
    const data = await runProductStep(form, research);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: extractError(err, "Product") };
  }
}

// ── Stage 5: Asset generation ─────────────────────────────────────────────────

export async function actionRunAssets(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<StepResult<AssetSet>> {
  try {
    const data = await runAssetStep(form, research, product);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: extractError(err, "Assets") };
  }
}

// ── Stage 6: Website ──────────────────────────────────────────────────────────

export async function actionRunWebsite(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  businessType = "open",
): Promise<StepResult<ProjectFile[]>> {
  try {
    const data = await runWebsiteStep(product, research, businessType);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: extractError(err, "Website") };
  }
}

// ── Stage 7: Marketing ────────────────────────────────────────────────────────

export async function actionRunMarketing(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<StepResult<MarketingAgentOutput>> {
  try {
    const data = await runMarketingStep(form, research, product);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: extractError(err, "Marketing") };
  }
}

export async function actionRunCritic(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
): Promise<StepResult<CriticAgentOutput>> {
  try {
    const data = await runCriticStep(form, research, product, marketing);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: extractError(err, "Critic") };
  }
}

// ── Stage 8: Finalize ─────────────────────────────────────────────────────────

export async function actionFinalizeProject(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  critic: CriticAgentOutput,
  assets: AssetSet,
  websiteFiles: ProjectFile[],
): Promise<StepResult<BusinessResult>> {
  try {
    const id = `proj_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const result = assembleResult(id, form, research, product, marketing, critic, assets, websiteFiles);
    saveGeneration(result);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: extractError(err, "Finalize") };
  }
}
