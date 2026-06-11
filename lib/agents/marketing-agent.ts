// Marketing Agent
// Generates hooks, content ideas, launch strategy, and a content calendar.
//
// AI INTEGRATION POINT:
//   Override aiRun() with Claude or Gemini call using MARKETING_SYSTEM_PROMPT.
//   The product name + target audience should be injected into the prompt
//   so hooks and content ideas are specific to the generated product.
//   See /lib/prompts/marketing-prompts.ts for exact prompts.

import { BaseAgent } from "./base-agent";
import { generateMarketingMock } from "@/lib/mock-data/marketing-mock";
import { detectProfile } from "@/lib/mock-data/research-mock";
import type {
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
} from "@/lib/types/agents";

export interface MarketingAgentInput {
  formInput: AgentInput;
  research: ResearchAgentOutput;
  product: ProductAgentOutput;
}

export class MarketingAgent extends BaseAgent<MarketingAgentInput, MarketingAgentOutput> {
  readonly name = "Marketing Agent";

  protected async mockRun(input: MarketingAgentInput): Promise<MarketingAgentOutput> {
    const profile = detectProfile(input.formInput);
    return generateMarketingMock(input.formInput, input.research, input.product, profile);
  }
}

export const marketingAgent = new MarketingAgent();
