// Abstract base class for all LaunchForge agents.
//
// Mode selection (automatic):
//   - GEMINI_API_KEY present in environment → AI mode (calls aiRun)
//   - GEMINI_API_KEY absent               → Mock mode (calls mockRun with delay)
//
// To add a new AI provider, implement aiRun() in the concrete agent
// and call your provider's SDK there. The orchestrator and UI are unaffected.

import { isAIEnabled } from "@/lib/ai/gemini";

export abstract class BaseAgent<TInput, TOutput> {
  abstract readonly name: string;

  /** Returns mock data — used when GEMINI_API_KEY is not set */
  protected abstract mockRun(input: TInput): Promise<TOutput>;

  /** Calls the real AI API — implemented in each concrete agent */
  protected async aiRun(_input: TInput): Promise<TOutput> {
    throw new Error(`${this.name}: aiRun() not implemented.`);
  }

  async run(input: TInput): Promise<TOutput> {
    if (isAIEnabled()) {
      return this.aiRun(input);
    }
    // Simulate realistic processing time in mock mode
    await this.delay(350, 750);
    return this.mockRun(input);
  }

  private delay(minMs: number, maxMs: number): Promise<void> {
    return new Promise((r) => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
  }
}
