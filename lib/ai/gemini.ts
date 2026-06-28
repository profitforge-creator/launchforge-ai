/**
 * Compatibility shim — re-exports from lib/ai/provider.ts under the old Gemini names.
 * All real logic has moved to lib/ai/provider.ts (Anthropic Claude).
 * This file exists so existing imports don't need to change.
 */

export {
  DEFAULT_MODEL as GEMINI_DEFAULT_MODEL,
  DEFAULT_MODEL as GEMINI_PRO_MODEL,
  callAI as geminiJSON,
  callAIText as geminiText,
  isAIEnabled,
  activeProvider,
  AnthropicProvider as GeminiProvider,
} from "@/lib/ai/provider";

export type { AIModel as GeminiModel } from "@/lib/ai/provider";
