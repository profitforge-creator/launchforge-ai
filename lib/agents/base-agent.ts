// Abstract base class for all LaunchForge agents.
//
// Swap strategy:
//   1. Mock mode (current): calls mockRun() with artificial delay
//   2. AI mode (future):    calls aiRun() — Claude or Gemini API
//
// To enable AI mode, set USE_AI_AGENTS=true in environment variables
// and implement aiRun() in each concrete agent.

export abstract class BaseAgent<TInput, TOutput> {
  abstract readonly name: string;

  // Implement this in each concrete agent to return mock data
  protected abstract mockRun(input: TInput): Promise<TOutput>;

  // AI INTEGRATION POINT: Override this in each agent to call Claude / Gemini
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async aiRun(_input: TInput): Promise<TOutput> {
    throw new Error(
      `${this.name}: aiRun() not implemented. Set USE_AI_AGENTS=false or implement aiRun().`,
    );
  }

  async run(input: TInput): Promise<TOutput> {
    const useAI = process.env.USE_AI_AGENTS === "true";

    if (useAI) {
      return this.aiRun(input);
    }

    // Simulate realistic processing time so the pipeline feels authentic
    await this.simulateDelay(350, 750);
    return this.mockRun(input);
  }

  private simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const ms = minMs + Math.random() * (maxMs - minMs);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
