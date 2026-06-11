// Product Agent — generates a concrete product concept grounded in research findings.
// AI: gemini-2.0-flash with JSON mode

import { BaseAgent } from "./base-agent";
import { geminiJSON } from "@/lib/ai/gemini";
import { PRODUCT_SYSTEM_PROMPT, buildProductPrompt } from "@/lib/prompts/product-prompts";
import { generateProductMock } from "@/lib/mock-data/product-mock";
import { detectProfile } from "@/lib/mock-data/research-mock";
import type {
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
} from "@/lib/types/agents";

export interface ProductAgentInput {
  formInput: AgentInput;
  research: ResearchAgentOutput;
}

export class ProductAgent extends BaseAgent<ProductAgentInput, ProductAgentOutput> {
  readonly name = "Product Agent";

  protected async mockRun(input: ProductAgentInput): Promise<ProductAgentOutput> {
    const profile = detectProfile(input.formInput);
    return generateProductMock(input.formInput, input.research, profile);
  }

  protected async aiRun(input: ProductAgentInput): Promise<ProductAgentOutput> {
    return geminiJSON<ProductAgentOutput>(
      PRODUCT_SYSTEM_PROMPT,
      buildProductPrompt(input.formInput, input.research),
    );
  }
}

export const productAgent = new ProductAgent();
