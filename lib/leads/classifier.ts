import type { LeadClassification, LeadInput } from "./types";

export function classifyLead(lead: LeadInput): LeadClassification {
  const budget = Number.parseInt(lead.budget || "0", 10);
  const text = `${lead.company} ${lead.need}`.toLowerCase();
  let score = 35;
  const reasons: string[] = [];

  if (budget >= 10000) {
    score += 25;
    reasons.push("Budget supports a high-touch build.");
  } else if (budget >= 5000) {
    score += 15;
    reasons.push("Budget fits a scoped launch package.");
  } else if (budget > 0) {
    score += 5;
    reasons.push("Budget may need a smaller entry offer.");
  } else {
    reasons.push("Budget is not yet confirmed.");
  }

  if (lead.urgency === "this-week") {
    score += 20;
    reasons.push("Timeline signals active buying intent.");
  } else if (lead.urgency === "this-month") {
    score += 10;
    reasons.push("Timeline is near-term.");
  } else {
    reasons.push("Timeline is not urgent.");
  }

  if (/(launch|conversion|sales|revenue|onboarding|automation|crm|pipeline|follow-up)/.test(text)) {
    score += 15;
    reasons.push("Need matches LaunchForge lead-ops strengths.");
  }

  if (lead.email.includes("@") && lead.company.trim().length > 1) {
    score += 5;
    reasons.push("Contact and company details are complete.");
  }

  const boundedScore = Math.min(score, 100);
  if (boundedScore >= 75) {
    return { status: "qualified", priority: "high", score: boundedScore, reasons };
  }
  if (boundedScore >= 55) {
    return { status: "nurture", priority: "medium", score: boundedScore, reasons };
  }
  return { status: "low-fit", priority: "low", score: boundedScore, reasons };
}
