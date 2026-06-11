import { BaseAgent } from "./base-agent";
import { MARKETING_SYSTEM_PROMPT, buildMarketingPrompt } from "@/lib/prompts/marketing-prompts";
import type { AgentInput, ResearchAgentOutput, ProductAgentOutput, MarketingAgentOutput } from "@/lib/types/agents";

export interface MarketingAgentInput {
  formInput: AgentInput;
  research: ResearchAgentOutput;
  product: ProductAgentOutput;
}

export class MarketingAgent extends BaseAgent<MarketingAgentInput, MarketingAgentOutput> {
  readonly name = "Marketing Agent";

  protected async aiRun(input: MarketingAgentInput): Promise<MarketingAgentOutput> {
    return this.generate<MarketingAgentOutput>(
      MARKETING_SYSTEM_PROMPT,
      buildMarketingPrompt(input.formInput, input.research, input.product),
    );
  }
}

export const marketingAgent = new MarketingAgent();
