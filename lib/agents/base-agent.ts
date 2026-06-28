/**
 * BaseAgent — abstract base for all LaunchForge AI agents.
 *
 * All agents require ANTHROPIC_API_KEY. There is no mock fallback.
 * If the key is absent, run() throws with a clear message.
 *
 * To change the AI provider: swap activeProvider in lib/ai/provider.ts.
 * Agent implementations don't change — they call this.generate().
 */

import { activeProvider } from "@/lib/ai/provider";
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
