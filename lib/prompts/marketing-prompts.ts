// Marketing Agent Prompts
//
// AI INTEGRATION POINT — Gemini
// Generates platform-specific marketing content grounded in the actual product.
// Business type drives channel selection, launch approach, and content angles.

import type { AgentInput, ResearchAgentOutput, ProductAgentOutput } from "@/lib/types/agents";
import { getBusinessTypeConfig } from "@/lib/business-types/config";

const BASE_MARKETING_SYSTEM = `You are a growth marketer who specializes in helping solo founders
acquire their first 100 customers with zero ad spend. You focus on content-driven distribution,
community seeding, and direct outreach.

All hooks, content ideas, and calendar entries must be specific to the product — never generic.
Return valid JSON only. No markdown fences.`;

/** Dynamic system prompt — includes type-specific channel and launch context */
export function getMarketingSystemPrompt(businessType: string): string {
  const config = getBusinessTypeConfig(businessType);
  return `${BASE_MARKETING_SYSTEM}

BUSINESS TYPE: ${config.label}
PRIMARY CHANNELS for this type: ${config.primaryChannels.join(", ")}
LAUNCH APPROACH for this type: ${config.launchApproach}
CONTENT ANGLES that work for this type:
${config.contentAngles.map((a) => `- ${a}`).join("\n")}
PRIMARY SHORT-FORM PLATFORM: ${config.shortFormPlatform}`;
}

/** Legacy constant */
export const MARKETING_SYSTEM_PROMPT = BASE_MARKETING_SYSTEM;

export function buildMarketingPrompt(
  input: AgentInput,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
): string {
  const config = getBusinessTypeConfig(input.businessType);

  return `Create a marketing plan for this product:

PRODUCT:
- Name: ${product.productName}
- Type: ${config.label}
- Tagline: ${product.tagline}
- Target audience: ${product.targetAudience}
- Pricing: ${product.suggestedPrice}

FOUNDER:
- Skills: ${input.skills}
- Time available: ${input.timePerWeek} hours/week

MARKET:
- Niche: ${research.niche}
- Market gaps we're exploiting: ${research.marketGaps.slice(0, 2).join("; ")}

TYPE-SPECIFIC GUIDANCE:
- Best channels for a ${config.label}: ${config.primaryChannels.join(", ")}
- Recommended launch approach: ${config.launchApproach}
- The short-form platform for this type is: ${config.shortFormPlatform}
- Proven content angles for this type:
${config.contentAngles.map((a) => `  * ${a}`).join("\n")}

The tiktokHooks field should contain hooks optimized for ${config.shortFormPlatform},
not necessarily TikTok — adapt the hook style to this type's primary platform.

The launchStrategy phases must follow the approach: "${config.launchApproach}"

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

Include 4 contentIdeas across the primary channels for this type, 3 launchStrategy phases, and 7 contentCalendar entries.
All hooks must mention a specific pain point or number — never vague.
All platforms in contentIdeas and contentCalendar must come from: ${config.primaryChannels.join(", ")}.`;
}
