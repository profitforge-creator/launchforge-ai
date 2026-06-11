// Research Agent — analyzes market demand, competition, monetization, and difficulty.
// AI: gemini-2.0-flash with JSON mode

import { BaseAgent } from "./base-agent";
import { geminiJSON } from "@/lib/ai/gemini";
import { RESEARCH_SYSTEM_PROMPT, buildResearchPrompt } from "@/lib/prompts/research-prompts";
import { generateResearchMock } from "@/lib/mock-data/research-mock";
import type { AgentInput, ResearchAgentOutput } from "@/lib/types/agents";

export class ResearchAgent extends BaseAgent<AgentInput, ResearchAgentOutput> {
  readonly name = "Research Agent";

  protected async mockRun(input: AgentInput): Promise<ResearchAgentOutput> {
    return generateResearchMock(input);
  }

  protected async aiRun(input: AgentInput): Promise<ResearchAgentOutput> {
    return geminiJSON<ResearchAgentOutput>(
      RESEARCH_SYSTEM_PROMPT,
      buildResearchPrompt(input),
    );
  }
}

export const researchAgent = new ResearchAgent();
