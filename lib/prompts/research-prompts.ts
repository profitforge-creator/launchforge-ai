// Research Agent Prompts

import type { AgentInput } from "@/lib/types/agents";

export const RESEARCH_SYSTEM_PROMPT = `You are an expert market research analyst specializing in evaluating
business opportunities for solopreneurs and small startup teams. You have deep knowledge of SaaS,
digital products, content businesses, and productized services.

When analyzing an opportunity, be honest and direct. Do not inflate scores. A score of 80+ means
genuinely exceptional — most niches should score 60–75.

Always return valid JSON matching the exact schema provided. Do not include markdown fences or extra text.`;

export function buildResearchPrompt(input: AgentInput): string {
  return `Analyze the following business opportunity for a solo founder:

FOUNDER PROFILE:
- Interests: ${input.interests}
- Skills: ${input.skills}
- Time available: ${input.timePerWeek} hours/week
- Income goal: $${input.incomeGoal}/month
- Preferred business type: ${input.businessType}

Score each dimension from 0-100 based on real market conditions. Be precise and honest.

Return ONLY a JSON object with this exact structure:
{
  "niche": "specific niche name (3-6 words)",
  "targetMarket": "precise description of the target customer (2 sentences)",
  "demandScore": <0-100>,
  "competitionScore": <0-100, higher = more competition>,
  "monetizationScore": <0-100, how easily this market pays>,
  "difficultyScore": <0-100, higher = harder to build/deliver>,
  "opportunitySummary": "2-3 sentence honest assessment of this opportunity",
  "competitors": [
    {
      "id": "c1",
      "name": "competitor name",
      "url": "domain.com",
      "monthlyRevenue": "estimated MRR",
      "pricing": "their pricing model",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "marketShare": <estimated % of niche>
    }
  ],
  "marketGaps": ["gap 1", "gap 2", "gap 3", "gap 4"]
}

Include 3 real competitors. marketGaps should be specific exploitable weaknesses in the current market.`;
}
