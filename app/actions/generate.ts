"use server";

// Server Actions for the generation pipeline.
//
// Each action corresponds to one agent step.
// The client calls them sequentially, updating progress between each call.
// This gives real step-by-step progress tied to actual server completion.
//
// Error handling: each action returns a discriminated union so the client
// can handle errors cleanly without try/catch.

import { randomUUID } from "crypto";
import {
  runResearchStep,
  runProductStep,
  runMarketingStep,
  runCriticStep,
  runAssetStep,
  assembleResult,
} from "@/lib/generation/orchestrator";
import { saveGeneration } from "@/lib/storage/generation-store";
import type { BusinessFormData, BusinessResult } from "@/types";
import type { AssetSet } from "@/lib/assets/types";
import type {
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
} from "@/lib/types/agents";

// ── Discriminated union return types ─────────────────────────────────────────

type StepResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ── Step 1: Research ──────────────────────────────────────────────────────────

export async function actionRunResearch(
  form: BusinessFormData,
): Promise<StepResult<ResearchAgentOutput>> {
  try {
    const data = await runResearchStep(form);
    return { success: true, data };
  } catch (err) {
    console.error("[Research Agent]", err);
    return { success: false, error: "Market research failed. Please try again." };
  }
}

// ── Step 2: Product ───────────────────────────────────────────────────────────

export async function actionRunProduct(
  form: BusinessFormData,
  research: ResearchAgentOutput,
): Promise<StepResult<ProductAgentOutput>> {
  try {
    const data = await runProductStep(form, research);
    return { success: true, data };
  } catch (err) {
    console.error("[Product Agent]", err);
    return { success: false, error: "Product generation failed. Please try again." };
  }
}

// ── Step 3: Marketing ─────────────────────────────────────────────────────────

export async function actionRunMarketing(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<StepResult<MarketingAgentOutput>> {
  try {
    const data = await runMarketingStep(form, research, product);
    return { success: true, data };
  } catch (err) {
    console.error("[Marketing Agent]", err);
    return { success: false, error: "Marketing plan generation failed. Please try again." };
  }
}

// ── Step 4: Critic ────────────────────────────────────────────────────────────

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
    console.error("[Critic Agent]", err);
    return { success: false, error: "Opportunity review failed. Please try again." };
  }
}

// ── Step 5: Assets ────────────────────────────────────────────────────────────

export async function actionRunAssets(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): Promise<StepResult<AssetSet>> {
  try {
    const data = await runAssetStep(form, research, product);
    return { success: true, data };
  } catch (err) {
    console.error("[Asset Generator]", err);
    return { success: false, error: "Asset generation failed. Please try again." };
  }
}

// ── Step 6: Finalize — assemble + save ───────────────────────────────────────

export async function actionFinalizeGeneration(
  form: BusinessFormData,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  critic: CriticAgentOutput,
  assets: AssetSet,
): Promise<StepResult<BusinessResult>> {
  try {
    const id = `gen_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const result = assembleResult(id, form, research, product, marketing, critic, assets);
    saveGeneration(result);
    return { success: true, data: result };
  } catch (err) {
    console.error("[Finalize]", err);
    return { success: false, error: "Failed to save results. Please try again." };
  }
}
