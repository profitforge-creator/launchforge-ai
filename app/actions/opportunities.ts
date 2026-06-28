"use server";

import { callAI } from "@/lib/ai/provider";
import type { Opportunity, DifficultyLevel, StartupCostRange, CompetitionLevel, RevenuePotential, LaunchSpeed } from "@/lib/opportunities/types";
import type { BusinessTypeId } from "@/lib/business-types/config";

type StepResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface GeneratorAnswers {
  hoursPerWeek: string;    // "1-5" | "5-10" | "10-20" | "20+"
  budget: string;          // "under-100" | "100-500" | "500-2k" | "2k+"
  skills: string;          // free text
  interests: string;       // free text
}

export async function actionGenerateOpportunities(
  answers: GeneratorAnswers,
): Promise<StepResult<Opportunity[]>> {
  const budgetLabel =
    answers.budget === "under-100" ? "Under $100" :
    answers.budget === "100-500"   ? "$100–$500"  :
    answers.budget === "500-2k"    ? "$500–$2K"   : "$2K+";

  const timeLabel =
    answers.hoursPerWeek === "1-5"   ? "1–5 hours/week (very limited)" :
    answers.hoursPerWeek === "5-10"  ? "5–10 hours/week"               :
    answers.hoursPerWeek === "10-20" ? "10–20 hours/week"              :
                                       "20+ hours/week (near full-time)";

  const system = `You generate business opportunity recommendations for solo founders.
You have deep knowledge of what businesses work at different skill levels, time commitments, and budgets.
You always recommend specific, actionable business ideas — never vague suggestions.
Return valid JSON only. No markdown fences.`;

  const prompt = `Generate 6 personalized business opportunity recommendations based on this profile:

TIME AVAILABLE: ${timeLabel}
STARTUP BUDGET: ${budgetLabel}
SKILLS: ${answers.skills || "No specific skills mentioned"}
INTERESTS: ${answers.interests || "No specific interests mentioned"}

For each opportunity, recommend a specific business that is achievable given the constraints above.
Match difficulty and startup cost to the budget and time available.

Return ONLY a JSON array of 6 opportunities:
[
  {
    "id": "gen_[random 6 chars]",
    "name": "Specific Business Name (2-5 words)",
    "type": "one of: course | ebook | template | saas | agency | membership | coaching | newsletter",
    "tagline": "One sentence describing what it does and who it helps (under 12 words)",
    "difficulty": "one of: Beginner | Intermediate | Advanced",
    "startupCost": "one of: Under $100 | $100–$500 | $500–$2K | $2K+",
    "competitionLevel": "one of: Low | Medium | High",
    "revenuePotential": "one of: Low | Medium | High | Very High",
    "launchSpeed": "one of: Under 1 week | 2–4 weeks | 1–3 months | 3+ months",
    "score": number between 55 and 92,
    "overview": "3-4 sentence description of the opportunity and why it works",
    "targetAudience": "Specific description of the ideal customer (2 sentences)",
    "monetization": ["revenue stream 1", "revenue stream 2", "revenue stream 3"],
    "competition": "1-2 sentences on the competitive landscape",
    "advantages": ["advantage 1", "advantage 2", "advantage 3"],
    "risks": ["risk 1", "risk 2"],
    "firstSteps": ["step 1", "step 2", "step 3", "step 4"],
    "buildPrompt": "A 1-2 sentence description of the business for the AI builder",
    "recommendedSkills": ["skill 1", "skill 2"]
  }
]

All 6 opportunities must have different business types if possible.
The difficulty and startupCost fields must be realistic for the user's stated budget and time.
Do NOT recommend SaaS ideas to someone with under $100 budget and under 5 hours per week.`;

  try {
    const raw = await callAI<unknown[]>(system, prompt);
    const opps = (raw as Opportunity[]).map((o) => ({
      ...o,
      id: o.id || `gen_${Math.random().toString(36).slice(2, 8)}`,
    }));
    return { success: true, data: opps };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Idea generation failed: ${msg}` };
  }
}

export async function actionAIAdvisorRecommend(
  conversation: Array<{ question: string; answer: string }>,
): Promise<StepResult<{ opportunities: Opportunity[]; reasoning: string }>> {
  const system = `You are a business advisor helping someone figure out the right business to start.
You ask clarifying questions and then recommend specific business opportunities.
You are direct, practical, and honest about what will and will not work.
Return valid JSON only. No markdown fences.`;

  const conversationText = conversation
    .map((c) => `Q: ${c.question}\nA: ${c.answer}`)
    .join("\n\n");

  const prompt = `Based on this conversation with a potential founder, recommend the 3 best business opportunities for them:

CONVERSATION:
${conversationText}

Analyze their situation and recommend 3 business opportunities that match their:
- Stated or implied skill level
- Available time and budget
- Goals and interests
- Risk tolerance

Return ONLY this JSON:
{
  "reasoning": "2-3 sentences explaining why these opportunities match this person specifically",
  "opportunities": [
    {
      "id": "gen_[random 6 chars]",
      "name": "Specific Business Name",
      "type": "course | ebook | template | saas | agency | membership | coaching | newsletter",
      "tagline": "One sentence value prop under 12 words",
      "difficulty": "Beginner | Intermediate | Advanced",
      "startupCost": "Under $100 | $100–$500 | $500–$2K | $2K+",
      "competitionLevel": "Low | Medium | High",
      "revenuePotential": "Low | Medium | High | Very High",
      "launchSpeed": "Under 1 week | 2–4 weeks | 1–3 months | 3+ months",
      "score": number 55-92,
      "overview": "3-4 sentences on the opportunity",
      "targetAudience": "Specific customer description (2 sentences)",
      "monetization": ["revenue stream 1", "revenue stream 2"],
      "competition": "Competitive landscape in 1-2 sentences",
      "advantages": ["advantage 1", "advantage 2", "advantage 3"],
      "risks": ["risk 1", "risk 2"],
      "firstSteps": ["step 1", "step 2", "step 3"],
      "buildPrompt": "1-2 sentence business description for the AI builder",
      "recommendedSkills": ["skill 1", "skill 2"]
    }
  ]
}`;

  try {
    const raw = await callAI<{ opportunities: Opportunity[]; reasoning: string }>(system, prompt);
    return { success: true, data: raw };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `AI advisor failed: ${msg}` };
  }
}
