import { BaseAgent } from "./base-agent";
import { RESEARCH_SYSTEM_PROMPT, buildResearchPrompt } from "@/lib/prompts/research-prompts";
import type { AgentInput, ResearchAgentOutput } from "@/lib/types/agents";

export class ResearchAgent extends BaseAgent<AgentInput, ResearchAgentOutput> {
  readonly name = "Research Agent";

  protected async aiRun(input: AgentInput): Promise<ResearchAgentOutput> {
    return this.generate<ResearchAgentOutput>(
      RESEARCH_SYSTEM_PROMPT,
      buildResearchPrompt(input),
    );
  }
}

export const researchAgent = new ResearchAgent();
