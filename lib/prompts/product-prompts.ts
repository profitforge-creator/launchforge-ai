// Product Agent Prompts
//
// AI INTEGRATION POINT — Claude or Gemini
// Uses research output as context to generate a grounded product concept.

import type { AgentInput, ResearchAgentOutput } from "@/lib/types/agents";

export const PRODUCT_SYSTEM_PROMPT = `You are a product strategist with experience launching profitable digital products,
SaaS tools, and productized services. You design minimal, focused products that match
a founder's skills to a specific market gap.

Do not design overbuilt products. The best v1 should be launchable in 4–12 weeks by one person.
Return valid JSON only. No markdown fences.`;

export function buildProductPrompt(
  input: AgentInput,
  research: ResearchAgentOutput,
): string {
  return `Design a v1 product for this founder to build:

FOUNDER:
- Skills: ${input.skills}
- Time available: ${input.timePerWeek} hours/week
- Income goal: $${input.incomeGoal}/month
- Business type preference: ${input.businessType}

MARKET RESEARCH FINDINGS:
- Niche: ${research.niche}
- Target market: ${research.targetMarket}
- Market gaps: ${research.marketGaps.join("; ")}
- Biggest competitor weakness: ${research.competitors[0]?.weaknesses.join(", ") ?? "unknown"}

Design a focused, buildable product that exploits the market gaps above.

Return ONLY a JSON object:
{
  "productName": "2-3 word product name",
  "tagline": "one sentence value proposition (under 10 words)",
  "description": "2-3 sentence product description explaining what it does and why it wins",
  "targetAudience": "specific customer description with pain point (2 sentences)",
  "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3", "deliverable 4", "deliverable 5"],
  "pricingModel": "pricing model name (e.g. Freemium, Monthly subscription, One-time)",
  "suggestedPrice": "specific price recommendation with rationale",
  "timeToLaunch": "realistic solo founder timeline"
}`;
}
