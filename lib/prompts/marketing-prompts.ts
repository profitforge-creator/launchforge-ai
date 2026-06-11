// Marketing Agent Prompts
//
// AI INTEGRATION POINT — Claude or Gemini
// Generates platform-specific marketing content grounded in the actual product.

import type { AgentInput, ResearchAgentOutput, ProductAgentOutput } from "@/lib/types/agents";

export const MARKETING_SYSTEM_PROMPT = `You are a growth marketer who specializes in helping solo founders
acquire their first 100 customers with zero ad spend. You focus on content-driven distribution,
community seeding, and direct outreach.

All hooks, content ideas, and calendar entries must be specific to the product — never generic.
Return valid JSON only. No markdown fences.`;

export function buildMarketingPrompt(
  input: AgentInput,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): string {
  return `Create a marketing plan for this product:

PRODUCT:
- Name: ${product.productName}
- Tagline: ${product.tagline}
- Target audience: ${product.targetAudience}
- Pricing: ${product.suggestedPrice}

FOUNDER:
- Skills: ${input.skills}
- Time available: ${input.timePerWeek} hours/week

MARKET:
- Niche: ${research.niche}
- Market gaps we're exploiting: ${research.marketGaps.slice(0, 2).join("; ")}

Return ONLY a JSON object:
{
  "tiktokHooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"],
  "contentPillars": ["pillar 1", "pillar 2", "pillar 3", "pillar 4"],
  "contentIdeas": [
    {
      "platform": "platform name",
      "format": "content format",
      "title": "content title",
      "hook": "opening hook sentence"
    }
  ],
  "launchStrategy": [
    {
      "phase": "phase name",
      "duration": "time period",
      "goal": "measurable goal",
      "actions": ["action 1", "action 2", "action 3", "action 4"]
    }
  ],
  "contentCalendar": [
    {
      "week": 1,
      "platform": "platform",
      "content": "content description",
      "goal": "goal"
    }
  ]
}

Include 4 contentIdeas, 3 launchStrategy phases, and 7 contentCalendar entries.
All hooks must mention a specific pain point or number — never vague.`;
}
