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
import { saveGeneration } from "@/lib/storage/generation-store";
import { rollbackProjectIncrement } from "@/lib/ai/rate-limiter";
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
): Promise<StepResult<ProjectFile[]>> {
  try {
    const data = await runWebsiteStep(product, research);
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
