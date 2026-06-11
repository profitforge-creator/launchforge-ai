// Product Agent
// Generates a concrete product concept grounded in the research findings.
//
// AI INTEGRATION POINT:
//   Override aiRun() to call Claude or Gemini with PRODUCT_SYSTEM_PROMPT.
//   Pass the full ResearchAgentOutput as context so the product name,
//   audience, and deliverables are grounded in actual market gaps found.
//   See /lib/prompts/product-prompts.ts for exact prompts.

import { BaseAgent } from "./base-agent";
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
}

export const productAgent = new ProductAgent();
