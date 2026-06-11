import { BaseAgent } from "./base-agent";
import { CRITIC_SYSTEM_PROMPT, buildCriticPrompt } from "@/lib/prompts/critic-prompts";
import { GEMINI_PRO_MODEL } from "@/lib/ai/gemini";
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

  // Uses gemini-1.5-pro: receives the largest context and needs stronger reasoning
  protected async aiRun(input: CriticAgentInput): Promise<CriticAgentOutput> {
    return this.generate<CriticAgentOutput>(
      CRITIC_SYSTEM_PROMPT,
      buildCriticPrompt(input.formInput, input.research, input.product, input.marketing),
      { model: GEMINI_PRO_MODEL },
    );
  }
}

export const criticAgent = new CriticAgent();
