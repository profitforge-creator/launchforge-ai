// Critic Agent Prompts
//
// AI INTEGRATION POINT — Claude claude-opus-4-8 recommended (largest context window)
// The critic sees ALL prior agent outputs and must identify real weaknesses,
// not just generic advice. Use a large context window model.

import type {
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
} from "@/lib/types/agents";

export const CRITIC_SYSTEM_PROMPT = `You are a brutally honest startup advisor with 15 years of experience watching
solo founders fail and succeed. Your job is to identify the real risks — the things
founders don't want to hear but need to hear.

You are NOT a hype machine. Do not validate bad ideas. Point out real structural weaknesses.
When you suggest improvements, they must be specific and actionable within 30 days.
Return valid JSON only. No markdown fences.`;

export function buildCriticPrompt(
  input: AgentInput,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
): string {
  return `Review this entire business opportunity and identify what could go wrong:

FOUNDER PROFILE:
- Skills: ${input.skills}
- Time: ${input.timePerWeek} hrs/week
- Income goal: $${input.incomeGoal}/month

RESEARCH FINDINGS:
- Niche: ${research.niche}
- Demand score: ${research.demandScore}/100
- Competition score: ${research.competitionScore}/100
- Market gaps: ${research.marketGaps.join("; ")}

PROPOSED PRODUCT:
- Name: ${product.productName}
- Target audience: ${product.targetAudience}
- Price: ${product.suggestedPrice}
- Time to launch: ${product.timeToLaunch}

MARKETING PLAN:
- Channels: ${marketing.contentIdeas.map((c) => c.platform).join(", ")}
- Launch phases: ${marketing.launchStrategy.map((p) => p.phase).join(" → ")}

Return ONLY a JSON object:
{
  "overallAssessment": "2-3 sentence honest verdict on this opportunity",
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3", "weakness 4"],
  "improvements": [
    {
      "title": "improvement title",
      "description": "specific actionable improvement (2-3 sentences)",
      "priority": "high|medium|low"
    }
  ],
  "alternativeIdeas": [
    {
      "title": "alternative idea name",
      "description": "1-2 sentence description of a related but different opportunity",
      "estimatedScore": <0-100>
    }
  ]
}

Include 4 improvements (at least 2 high priority) and 2 alternative ideas.
Weaknesses must be structural, not superficial. Don't repeat what was already said.`;
}
