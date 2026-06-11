// Critic Agent
// Reviews all prior agent outputs and identifies weaknesses, improvements,
// alternative ideas, and produces an overall honest assessment.
//
// AI INTEGRATION POINT:
//   Override aiRun() with Claude or Gemini call using CRITIC_SYSTEM_PROMPT.
//   This agent should receive ALL prior outputs as context so it can
//   critique the actual reasoning, not just give generic advice.
//   See /lib/prompts/critic-prompts.ts for exact prompts.
//
// Note: The critic agent intentionally receives the most context of any agent.
// In production, use a model with a large context window (Claude claude-opus-4-8 or Gemini 1.5 Pro).

import { BaseAgent } from "./base-agent";
import { generateCriticMock } from "@/lib/mock-data/critic-mock";
import { detectProfile } from "@/lib/mock-data/research-mock";
import type {
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
} from "@/lib/types/agents";

export interface CriticAgentInput {
  formInput: AgentInput;
  research: ResearchAgentOutput;
  product: ProductAgentOutput;
  marketing: MarketingAgentOutput;
}

export class CriticAgent extends BaseAgent<CriticAgentInput, CriticAgentOutput> {
  readonly name = "Critic Agent";

  protected async mockRun(input: CriticAgentInput): Promise<CriticAgentOutput> {
    const profile = detectProfile(input.formInput);
    return generateCriticMock(
      input.formInput,
      input.research,
      input.product,
      input.marketing,
      profile,
    );
  }
}

export const criticAgent = new CriticAgent();
