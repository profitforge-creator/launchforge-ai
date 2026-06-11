// Internal agent I/O types — used by the generation pipeline
// These are the raw outputs of each agent before being assembled into BusinessResult

import type { Competitor, ContentIdea, LaunchPhase, CalendarEntry } from "@/types";

export interface AgentInput {
  interests: string;
  skills: string;
  timePerWeek: string;
  incomeGoal: string;
  businessType: string;
}

// Identifies which mock data profile to use — also determines AI prompt variant
export type BusinessProfile = "developer" | "creator" | "service" | "digital" | "default";

// ── Research Agent ────────────────────────────────────────────────────────────

export interface ResearchAgentOutput {
  niche: string;
  targetMarket: string;
  demandScore: number;       // 0–100
  competitionScore: number;  // 0–100, lower = less competition
  monetizationScore: number; // 0–100
  difficultyScore: number;   // 0–100, lower = easier
  opportunitySummary: string;
  competitors: Competitor[];
  marketGaps: string[];
}

// ── Product Agent ─────────────────────────────────────────────────────────────

export interface ProductAgentOutput {
  productName: string;
  tagline: string;
  description: string;
  targetAudience: string;
  deliverables: string[];
  pricingModel: string;
  suggestedPrice: string;
  timeToLaunch: string;
}

// ── Marketing Agent ───────────────────────────────────────────────────────────

export interface MarketingAgentOutput {
  tiktokHooks: string[];
  contentIdeas: ContentIdea[];
  contentPillars: string[];
  launchStrategy: LaunchPhase[];
  contentCalendar: CalendarEntry[];
}

// ── Critic Agent ──────────────────────────────────────────────────────────────

export interface CriticAgentOutput {
  weaknesses: string[];
  improvements: CriticImprovement[];
  alternativeIdeas: AlternativeIdea[];
  overallAssessment: string;
}

export interface CriticImprovement {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface AlternativeIdea {
  title: string;
  description: string;
  estimatedScore: number;
}

// ── Pipeline context (passed through the chain) ───────────────────────────────

export interface PipelineContext {
  input: AgentInput;
  profile: BusinessProfile;
  research?: ResearchAgentOutput;
  product?: ProductAgentOutput;
  marketing?: MarketingAgentOutput;
  critic?: CriticAgentOutput;
}
