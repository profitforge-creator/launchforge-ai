// Weighted Opportunity Score calculator
//
// Weights (must sum to 1.0):
//   Demand        35% — market wants this
//   Monetization  30% — market pays for this
//   Competition   20% — market isn't saturated (inverted: lower competition = higher score)
//   Difficulty    15% — you can actually build this (inverted: lower difficulty = higher score)

import type { OpportunityScore, ScoreCategory } from "@/types";

const WEIGHTS = {
  demand: 0.35,
  monetization: 0.30,
  competition: 0.20, // inverted
  difficulty: 0.15,  // inverted
} as const;

export function calculateOpportunityScore(
  demandScore: number,
  monetizationScore: number,
  competitionScore: number,
  difficultyScore: number,
): OpportunityScore {
  // Competition and difficulty: high raw score = bad opportunity, so invert them
  const adjustedCompetition = 100 - clamp(competitionScore);
  const adjustedDifficulty = 100 - clamp(difficultyScore);

  const overall = Math.round(
    clamp(demandScore) * WEIGHTS.demand +
    clamp(monetizationScore) * WEIGHTS.monetization +
    adjustedCompetition * WEIGHTS.competition +
    adjustedDifficulty * WEIGHTS.difficulty,
  );

  return {
    overall: clamp(overall),
    demand: clamp(demandScore),
    monetization: clamp(monetizationScore),
    competition: clamp(competitionScore),
    difficulty: clamp(difficultyScore),
    category: getCategory(overall),
  };
}

function getCategory(score: number): ScoreCategory {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Moderate";
  return "Weak";
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

// Helpers for display
export function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  return "Weak";
}

export function scoreColorClass(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}
