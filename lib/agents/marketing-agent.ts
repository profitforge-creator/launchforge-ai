// Marketing Agent — generates hooks, content calendar, and launch strategy.
// AI: gemini-2.0-flash with JSON mode

import { BaseAgent } from "./base-agent";
import { geminiJSON } from "@/lib/ai/gemini";
import { MARKETING_SYSTEM_PROMPT, buildMarketingPrompt } from "@/lib/prompts/marketing-prompts";
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

  protected async aiRun(input: MarketingAgentInput): Promise<MarketingAgentOutput> {
    return geminiJSON<MarketingAgentOutput>(
      MARKETING_SYSTEM_PROMPT,
      buildMarketingPrompt(input.formInput, input.research, input.product),
    );
  }
}

export const marketingAgent = new MarketingAgent();
