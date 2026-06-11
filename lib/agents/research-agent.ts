// Research Agent
// Analyzes market demand, competition, monetization potential, and difficulty.
//
// AI INTEGRATION POINT:
//   Override aiRun() to call Claude or Gemini with RESEARCH_SYSTEM_PROMPT.
//   Expected API: anthropic.messages.create() or google.generativeModel().generateContent()
//   See /lib/prompts/research-prompts.ts for the exact prompts to use.

import { BaseAgent } from "./base-agent";
import { generateResearchMock } from "@/lib/mock-data/research-mock";
import type { AgentInput, ResearchAgentOutput } from "@/lib/types/agents";

export class ResearchAgent extends BaseAgent<AgentInput, ResearchAgentOutput> {
  readonly name = "Research Agent";

  protected async mockRun(input: AgentInput): Promise<ResearchAgentOutput> {
    return generateResearchMock(input);
  }
}

// Singleton — import this rather than instantiating per request
export const researchAgent = new ResearchAgent();
