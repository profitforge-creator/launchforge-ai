import { BaseAgent } from "./base-agent";
import { PRODUCT_SYSTEM_PROMPT, buildProductPrompt } from "@/lib/prompts/product-prompts";
import type { AgentInput, ResearchAgentOutput, ProductAgentOutput } from "@/lib/types/agents";

export interface ProductAgentInput {
  formInput: AgentInput;
  research: ResearchAgentOutput;
}

export class ProductAgent extends BaseAgent<ProductAgentInput, ProductAgentOutput> {
  readonly name = "Product Agent";

  protected async aiRun(input: ProductAgentInput): Promise<ProductAgentOutput> {
    return this.generate<ProductAgentOutput>(
      PRODUCT_SYSTEM_PROMPT,
      buildProductPrompt(input.formInput, input.research),
    );
  }
}

export const productAgent = new ProductAgent();
