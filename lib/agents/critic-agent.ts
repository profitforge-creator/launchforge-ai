// Critic Agent — reviews all prior outputs and surfaces real weaknesses.
// AI: gemini-1.5-pro (larger context window, better reasoning for critique work)

import { BaseAgent } from "./base-agent";
import { geminiJSON } from "@/lib/ai/gemini";
import { CRITIC_SYSTEM_PROMPT, buildCriticPrompt } from "@/lib/prompts/critic-prompts";
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

  // Uses gemini-1.5-pro: the critic receives the largest context (all 3 prior outputs)
  // and benefits from stronger reasoning for identifying structural weaknesses.
  protected async aiRun(input: CriticAgentInput): Promise<CriticAgentOutput> {
    return geminiJSON<CriticAgentOutput>(
      CRITIC_SYSTEM_PROMPT,
      buildCriticPrompt(input.formInput, input.research, input.product, input.marketing),
      "gemini-1.5-pro",
    );
  }
}

export const criticAgent = new CriticAgent();
