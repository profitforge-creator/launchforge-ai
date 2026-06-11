"use server";

/**
 * Generation Server Actions
 *
 * Each action maps to one build stage in the 8-stage UI pipeline.
 * All AI calls route through lib/ai/orchestrator.ts (Gemini).
 * Rate limiting is enforced here before any AI call is made.
 *
 * Stage mapping:
 *   actionRunResearch     → stages 1-3 (research + competitors + opportunity)
 *   actionRunProduct      → stage 4  (product design)
 *   actionRunAssets       → stage 5  (product file generation)
 *   actionRunWebsite      → stage 6  (website generation — Gemini copy + TSX)
 *   actionRunMarketing    → stage 7  (marketing system + critic)
 *   actionFinalizeProject → stage 8  (assemble + save)
 */

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
import { saveGeneration } from "@/lib/storage/generation-store";
import { checkProjectLimit, rollbackProjectIncrement } from "@/lib/ai/rate-limiter";
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

// ── Resolve user ID (stub — replace with auth session in production) ──────────

function resolveUserId(form: BusinessFormData): string {
  // AI INTEGRATION POINT (Auth): replace with:
  //   const session = await getServerSession(authOptions);
  //   return session?.user?.id ?? "anon";
  return "anon";
}

// ── Stage 1–3: Research ────────────────────────────────────────────────────────

export async function actionRunResearch(
  form: BusinessFormData,
): Promise<StepResult<ResearchAgentOutput>> {
  const userId = resolveUserId(form);

  // Rate-limit check: deduct one project credit upfront
  const rateCheck = checkProjectLimit(userId, "free"); // TODO: pull real tier from session
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.reason, upgradeRequired: true };
  }

  try {
    const data = await runResearchStep(form);
    return { success: true, data };
  } catch (err) {
    // Rollback the counter since generation failed
    rollbackProjectIncrement(userId);
    console.error("[Research]", err);
    return { success: false, error: "Market research failed — please try again." };
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
    console.error("[Product]", err);
    return { success: false, error: "Product design failed — please try again." };
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
    console.error("[Assets]", err);
    return { success: false, error: "Product generation failed — please try again." };
  }
}

// ── Stage 6: Website (Gemini copy + TSX templates) ────────────────────────────

export async function actionRunWebsite(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
): Promise<StepResult<ProjectFile[]>> {
  try {
    const data = await runWebsiteStep(product, research);
    return { success: true, data };
  } catch (err) {
    console.error("[Website]", err);
    return { success: false, error: "Website generation failed — please try again." };
  }
}

// ── Stage 7: Marketing + Critic ───────────────────────────────────────────────

export async function actionRunMarketing(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<StepResult<MarketingAgentOutput>> {
  try {
    const data = await runMarketingStep(form, research, product);
    return { success: true, data };
  } catch (err) {
    console.error("[Marketing]", err);
    return { success: false, error: "Marketing system generation failed — please try again." };
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
    console.error("[Critic]", err);
    return { success: false, error: "Review step failed — please try again." };
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
    console.error("[Finalize]", err);
    return { success: false, error: "Failed to save project — please try again." };
  }
}
