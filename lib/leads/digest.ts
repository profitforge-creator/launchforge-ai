import type { LeadRecord, WeeklyLeadDigest } from "./types";

export function generateWeeklyDigest(leads: LeadRecord[]): WeeklyLeadDigest {
  const qualified = leads.filter((lead) => lead.classification.status === "qualified");
  const nurture = leads.filter((lead) => lead.classification.status === "nurture");
  const lowFit = leads.filter((lead) => lead.classification.status === "low-fit");
  const averageScore = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + lead.classification.score, 0) / leads.length)
    : 0;

  const topOpportunities = [...leads]
    .sort((a, b) => b.classification.score - a.classification.score)
    .slice(0, 5)
    .map((lead) => `${lead.company || lead.name}: ${lead.classification.score}/100`);

  const summary = [
    `Total leads: ${leads.length}`,
    `Qualified: ${qualified.length}`,
    `Nurture: ${nurture.length}`,
    `Low fit: ${lowFit.length}`,
    `Average score: ${averageScore}`,
    "",
    "Top opportunities:",
    topOpportunities.length ? topOpportunities.join("\n") : "No leads captured yet.",
    "",
    qualified.length > 0
      ? "Recommended action: review qualified follow-up drafts and book calls manually."
      : "Recommended action: capture more qualified traffic before outreach.",
  ].join("\n");

  return {
    totalLeads: leads.length,
    qualifiedCount: qualified.length,
    nurtureCount: nurture.length,
    lowFitCount: lowFit.length,
    averageScore,
    topOpportunities,
    summary,
  };
}
