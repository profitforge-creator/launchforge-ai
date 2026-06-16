import type { LeadClassification, LeadInput } from "./types";

export function generateFollowUpDraft(lead: LeadInput, classification: LeadClassification): string {
  const firstName = lead.name.trim().split(/\s+/)[0] || "there";
  const company = lead.company.trim() || "your team";
  const timing =
    lead.urgency === "this-week" ? "this week" :
    lead.urgency === "this-month" ? "this month" :
    "when the timing is right";

  if (classification.status === "qualified") {
    return [
      `Subject: ${company} launch workflow`,
      "",
      `Hi ${firstName},`,
      "",
      "Thanks for sharing the context. Based on your budget, timeline, and launch need, this looks like a strong fit for a focused LaunchForge sprint.",
      "",
      `I would suggest a short working session to map the intake flow, CRM row, and follow-up sequence so we can move quickly ${timing}.`,
      "",
      "Best,",
      "LaunchForge",
    ].join("\n");
  }

  if (classification.status === "nurture") {
    return [
      `Subject: Next step for ${company}`,
      "",
      `Hi ${firstName},`,
      "",
      "Thanks for reaching out. Your project looks promising, and I would start with a compact scope: clarify the offer, capture leads cleanly, and draft the first follow-up sequence.",
      "",
      "If useful, I can send a lightweight plan for review.",
      "",
      "Best,",
      "LaunchForge",
    ].join("\n");
  }

  return [
    `Subject: A lighter path for ${company}`,
    "",
    `Hi ${firstName},`,
    "",
    "Thanks for the note. Based on the current scope, I would start with a smaller validation package before moving into a larger build.",
    "",
    "A simple intake page, one follow-up draft, and a clear CRM workflow would create enough signal before investing more.",
    "",
    "Best,",
    "LaunchForge",
  ].join("\n");
}
