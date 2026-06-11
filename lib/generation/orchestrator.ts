/**
 * Generation Orchestrator
 *
 * Thin re-export layer over lib/ai/orchestrator.ts.
 * Server actions import from here; the AI pipeline lives in lib/ai/.
 *
 * All generation is Gemini-powered. No mock fallbacks.
 * GEMINI_API_KEY must be set in .env.local for generation to work.
 */

export {
  runResearch as runResearchStep,
  runProduct as runProductStep,
  runMarketing as runMarketingStep,
  runCritic as runCriticStep,
  runAssets as runAssetStep,
  runWebsite as runWebsiteStep,
  assembleResult,
  toAgentInput,
} from "@/lib/ai/orchestrator";

export type { GenerationStep, StepResult } from "./types";
