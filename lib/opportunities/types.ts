import type { BusinessTypeId } from "@/lib/business-types/config";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type StartupCostRange = "Under $100" | "$100–$500" | "$500–$2K" | "$2K+";
export type CompetitionLevel = "Low" | "Medium" | "High";
export type RevenuePotential = "Low" | "Medium" | "High" | "Very High";
export type LaunchSpeed = "Under 1 week" | "2–4 weeks" | "1–3 months" | "3+ months";

export interface Opportunity {
  id: string;
  name: string;
  type: BusinessTypeId;
  tagline: string;

  // Card metrics
  difficulty: DifficultyLevel;
  startupCost: StartupCostRange;
  competitionLevel: CompetitionLevel;
  revenuePotential: RevenuePotential;
  launchSpeed: LaunchSpeed;
  score: number; // 0–100

  // Detail panel
  overview: string;
  targetAudience: string;
  monetization: string[];
  competition: string;
  advantages: string[];
  risks: string[];
  firstSteps: string[];

  // Used to pre-fill the Business Engine
  buildPrompt: string;
  recommendedSkills: string[];
}

export interface OpportunityFilters {
  types: BusinessTypeId[];
  difficulty: DifficultyLevel[];
  startupCost: StartupCostRange[];
  revenuePotential: RevenuePotential[];
  launchSpeed: LaunchSpeed[];
}
