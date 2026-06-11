/**
 * BaseAgent — abstract base for all LaunchForge AI agents.
 *
 * All agents require GEMINI_API_KEY. There is no mock fallback.
 * If the key is absent, run() throws with a clear message.
 *
 * To add a second AI provider:
 *   1. Create lib/ai/providers/openai-provider.ts
 *   2. Import and swap activeProvider in lib/ai/gemini.ts
 *   3. Agent implementations don't change — they call this.generate()
 *      which delegates to the active provider.
 */

import { activeProvider } from "@/lib/ai/gemini";
import type { AIGenerateOptions } from "@/lib/ai/providers/types";

export abstract class BaseAgent<TInput, TOutput> {
  abstract readonly name: string;

  /** Calls the active AI provider with a structured JSON prompt */
  protected async generate<T>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<T> {
    return activeProvider.generateJSON<T>(systemPrompt, userPrompt, options);
  }

  /** Implemented by each concrete agent */
  protected abstract aiRun(input: TInput): Promise<TOutput>;

  async run(input: TInput): Promise<TOutput> {
    return this.aiRun(input);
  }
}
