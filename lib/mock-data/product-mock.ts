// Mock product outputs — one per BusinessProfile
// AI INTEGRATION POINT: ProductAgent.aiRun() replaces this with a Claude/Gemini API call

import type { ProductAgentOutput, BusinessProfile, AgentInput, ResearchAgentOutput } from "@/lib/types/agents";

const PRODUCTS: Record<BusinessProfile, ProductAgentOutput> = {
  developer: {
    productName: "DevFlow",
    tagline: "Your daily dev workflow, without the friction.",
    description:
      "A cross-platform command palette and context manager for developers. Capture code snippets, track active tasks, and trigger CLI sequences — all from a single keyboard shortcut. Works on Mac and Windows, syncs across machines.",
    targetAudience:
      "Freelance developers and small engineering teams (2–10 people) who use GitHub, Linear, and Notion daily and lose time switching between them.",
    deliverables: [
      "Cross-platform desktop app (Mac + Windows)",
      "Browser extension for GitHub and Linear",
      "CLI companion tool",
      "Team sync dashboard (web)",
      "7-email onboarding sequence",
    ],
    pricingModel: "Freemium → Pro subscription",
    suggestedPrice: "$9/month or $84/year",
    timeToLaunch: "8–12 weeks (solo founder)",
  },

  creator: {
    productName: "CreatorOS",
    tagline: "One dashboard. Every revenue stream.",
    description:
      "A Notion-powered operating system for independent creators. Track sponsorship deals, manage digital product launches, monitor analytics from YouTube + Substack in one place, and plan your content calendar with built-in monetization milestones.",
    targetAudience:
      "Independent creators with 5K–100K followers who earn from 2+ sources (brand deals, digital products, memberships) and spend hours in spreadsheets.",
    deliverables: [
      "Notion OS template (complete system)",
      "Sponsorship pipeline tracker",
      "Revenue dashboard with 6 calculators",
      "Content calendar with monetization tags",
      "Video walkthrough (60 min)",
      "30-day implementation guide",
    ],
    pricingModel: "One-time purchase + optional coaching upsell",
    suggestedPrice: "$79 standard / $197 with coaching",
    timeToLaunch: "2–3 weeks (solo founder)",
  },

  service: {
    productName: "GrowthSprint",
    tagline: "Done-for-you marketing, on a subscription.",
    description:
      "A productized marketing service for e-commerce businesses under $1M/year. Fixed monthly deliverables (4 ad creatives, 8 email campaigns, monthly strategy call) at a flat rate. No hourly billing, no scope creep, no surprises.",
    targetAudience:
      "Shopify store owners with $10K–$100K/month revenue who know they need marketing help but can't afford a $5K/month agency and don't want to manage a freelancer.",
    deliverables: [
      "4 ad creatives/month (static + video)",
      "8 email campaigns/month (written + sent)",
      "Monthly strategy call (60 min)",
      "Monthly performance report",
      "Slack access for async questions",
    ],
    pricingModel: "Monthly retainer (fixed scope)",
    suggestedPrice: "$1,500/month (capacity: 8 clients)",
    timeToLaunch: "1 week to first client",
  },

  digital: {
    productName: "FounderKit",
    tagline: "The Notion OS built for bootstrapped founders.",
    description:
      "A premium Notion template system for solopreneur founders. Includes CRM, project tracker, weekly review system, investor update template, and decision log — all pre-built and interconnected. Designed to replace 4 different tools.",
    targetAudience:
      "Early-stage solo founders and bootstrapped entrepreneurs who live in Notion and need a structured system for managing customers, projects, and growth — without paying for 5 separate tools.",
    deliverables: [
      "Complete Notion OS (12 linked databases)",
      "CRM system with pipeline view",
      "Project + OKR tracker",
      "Weekly/quarterly review templates",
      "Investor update generator",
      "Setup video walkthrough (45 min)",
    ],
    pricingModel: "One-time purchase with optional updates subscription",
    suggestedPrice: "$49 solo / $89 with lifetime updates",
    timeToLaunch: "1–2 weeks (solo founder)",
  },

  default: {
    productName: "WorkflowPilot",
    tagline: "Automate the repetitive. Focus on the meaningful.",
    description:
      "A done-for-you automation setup service for freelancers and solopreneurs. You fill out a 15-minute intake form, and within 48 hours your client onboarding, invoice reminders, and weekly reporting are fully automated using existing tools you already pay for.",
    targetAudience:
      "Freelancers and solopreneurs earning $3K–$15K/month who spend 5–10 hours/week on admin work and know automation exists but haven't had time to set it up.",
    deliverables: [
      "Custom automation blueprint (your exact stack)",
      "3 fully-built automation workflows",
      "Client onboarding sequence (automated)",
      "Weekly reporting dashboard",
      "30-day Slack support",
    ],
    pricingModel: "One-time project + optional monthly maintenance",
    suggestedPrice: "$497 setup / $97/month maintenance",
    timeToLaunch: "2–3 weeks to first client",
  },
};

// AI INTEGRATION POINT: In production, pass research output to the AI
// so the product is grounded in the actual market gaps found
export function generateProductMock(
  input: AgentInput,
  research: ResearchAgentOutput,
  profile: BusinessProfile,
): ProductAgentOutput {
  // Research context is available here for future AI grounding
  void input;
  void research;
  return PRODUCTS[profile];
}
