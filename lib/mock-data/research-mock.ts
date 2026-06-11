// Mock research outputs — one per BusinessProfile
// AI INTEGRATION POINT: ResearchAgent.aiRun() replaces this with a Claude/Gemini API call

import type { ResearchAgentOutput, AgentInput, BusinessProfile } from "@/lib/types/agents";

export function detectProfile(input: AgentInput): BusinessProfile {
  const text = `${input.interests} ${input.skills} ${input.businessType}`.toLowerCase();
  if (
    input.businessType === "saas" ||
    /\b(code|develop|typescript|javascript|python|software|api|engineer|programming|react|node)\b/.test(text)
  ) return "developer";
  if (
    input.businessType === "content" ||
    /\b(youtube|newsletter|creator|writing|podcast|blog|tiktok|instagram|media)\b/.test(text)
  ) return "creator";
  if (["productized-service", "agency"].includes(input.businessType)) return "service";
  if (
    input.businessType === "digital-product" ||
    /\b(design|figma|template|notion|canva|graphics|ui|ux)\b/.test(text)
  ) return "digital";
  return "default";
}

const RESEARCH: Record<BusinessProfile, ResearchAgentOutput> = {
  developer: {
    niche: "Developer Productivity Tools",
    targetMarket:
      "Freelance developers and small engineering teams (2–10 engineers) who use 5+ tools daily and lose 90+ minutes to context switching.",
    demandScore: 91,
    competitionScore: 58,
    monetizationScore: 87,
    difficultyScore: 42,
    opportunitySummary:
      "High-demand niche with strong B2B monetization potential. Developers spend freely on tools that save time. Competition is real but fragmented at the indie level — most solutions either require a Mac or are overbuilt for small teams.",
    marketGaps: [
      "No cross-platform command palette designed for freelancers",
      "Existing tools don't connect GitHub + Linear + Notion in one keyboard shortcut",
      "No lightweight option between Raycast (Mac-only) and enterprise suites",
      "Poor onboarding for developers who aren't already power users",
    ],
    competitors: [
      {
        id: "c1",
        name: "Raycast",
        url: "raycast.com",
        monthlyRevenue: "$2.1M",
        pricing: "$8/mo per user",
        strengths: ["Strong developer brand", "Extension marketplace", "Snappy performance"],
        weaknesses: ["Mac-only", "Limited team sync on free tier", "No web companion"],
        marketShare: 34,
      },
      {
        id: "c2",
        name: "Linear",
        url: "linear.app",
        monthlyRevenue: "$4.8M",
        pricing: "$8/mo per user",
        strengths: ["Best-in-class UX", "Keyboard-first", "Strong API"],
        weaknesses: ["Issue tracking only", "No time tracking", "Expensive at scale"],
        marketShare: 28,
      },
      {
        id: "c3",
        name: "Pieces for Developers",
        url: "pieces.app",
        monthlyRevenue: "$320K",
        pricing: "Free + $12/mo Pro",
        strengths: ["Local AI", "Deep IDE integration", "Code snippet management"],
        weaknesses: ["Niche appeal", "Complex onboarding", "Limited sharing"],
        marketShare: 11,
      },
    ],
  },

  creator: {
    niche: "Creator Monetization & Audience Tools",
    targetMarket:
      "Independent creators with 1K–50K followers across YouTube, TikTok, or Instagram who earn less than $3K/month and want to build off-platform income.",
    demandScore: 85,
    competitionScore: 72,
    monetizationScore: 79,
    difficultyScore: 38,
    opportunitySummary:
      "Massive, growing niche with high creator frustration around inconsistent income. Competition is high at the platform level, but thin for tools specifically aimed at mid-size creators who can't yet afford agencies.",
    marketGaps: [
      "No all-in-one tool for creators to manage sponsorships + sell products",
      "Existing newsletter platforms don't integrate with short-form video analytics",
      "Courses about 'monetizing content' are generic — no niche-specific playbooks",
      "Creators struggle to price digital products — no comparison tool exists",
    ],
    competitors: [
      {
        id: "c1",
        name: "Beehiiv",
        url: "beehiiv.com",
        monthlyRevenue: "$1.4M",
        pricing: "Free + $42/mo Scale",
        strengths: ["Strong creator community", "Built-in ad network", "Good analytics"],
        weaknesses: ["Newsletter-only", "No video creator features", "Limited CRM"],
        marketShare: 22,
      },
      {
        id: "c2",
        name: "Stan Store",
        url: "stan.store",
        monthlyRevenue: "$2.8M",
        pricing: "$29/mo",
        strengths: ["Link-in-bio + store combo", "No code needed", "Creator-first brand"],
        weaknesses: ["No email marketing", "Limited analytics depth", "Basic checkout"],
        marketShare: 31,
      },
      {
        id: "c3",
        name: "Gumroad",
        url: "gumroad.com",
        monthlyRevenue: "$890K",
        pricing: "10% transaction fee",
        strengths: ["Established reputation", "Simple setup", "Large buyer base"],
        weaknesses: ["High fees", "No audience building tools", "Dated UI"],
        marketShare: 19,
      },
    ],
  },

  service: {
    niche: "B2B Productized Services (Marketing & Operations)",
    targetMarket:
      "SMBs with 5–50 employees spending $500–$5K/month on freelancers but lacking the budget for a full agency. Primarily e-commerce and service businesses.",
    demandScore: 82,
    competitionScore: 65,
    monetizationScore: 91,
    difficultyScore: 35,
    opportunitySummary:
      "Extremely strong monetization — B2B buyers pay $1K–$5K/month without hesitation if ROI is clear. The productized service model (fixed scope, fixed price) is under-adopted. Most agencies charge hourly and scare away small clients.",
    marketGaps: [
      "No agency focused exclusively on Shopify stores under $500K/year revenue",
      "SMBs want a 'subscription' model for marketing work, not project quotes",
      "Almost no agencies offer same-day turnaround on creative assets",
      "Small business owners distrust agencies — a solo founder brand performs better",
    ],
    competitors: [
      {
        id: "c1",
        name: "Design Pickle",
        url: "designpickle.com",
        monthlyRevenue: "$4.2M",
        pricing: "$499–$1,995/mo",
        strengths: ["Subscription model", "Strong brand", "Fast turnaround SLA"],
        weaknesses: ["Design-only", "No strategy layer", "Generic output quality"],
        marketShare: 29,
      },
      {
        id: "c2",
        name: "Mayple",
        url: "mayple.com",
        monthlyRevenue: "$1.1M",
        pricing: "$650–$2,500/mo",
        strengths: ["Vetted expert network", "Performance tracking", "Account management"],
        weaknesses: ["Middleman model — inconsistent quality", "Slow matching", "Expensive"],
        marketShare: 15,
      },
      {
        id: "c3",
        name: "Growthcollective",
        url: "growthcollective.com",
        monthlyRevenue: "$780K",
        pricing: "$150–$300/hr",
        strengths: ["High-quality freelancers", "Niche specialization", "Fast hiring"],
        weaknesses: ["Hourly billing creates budget anxiety", "No ongoing relationship", "No predictability"],
        marketShare: 10,
      },
    ],
  },

  digital: {
    niche: "Design Templates & Notion Systems",
    targetMarket:
      "Freelancers, solopreneurs, and early-stage startups who use Notion, Figma, or Canva daily and spend hours building systems from scratch.",
    demandScore: 78,
    competitionScore: 68,
    monetizationScore: 71,
    difficultyScore: 28,
    opportunitySummary:
      "Low difficulty — digital products have zero COGS and can be built in days. Competition is high on marketplaces but thin for premium, niche-specific systems (e.g. 'Notion OS for consultants'). Buyers are impulse-purchase oriented at $15–$97.",
    marketGaps: [
      "Notion templates for specific professions (lawyers, coaches, architects) are underdeveloped",
      "Most Figma UI kits are generic — no kits targeting SaaS startups specifically",
      "No template bundles that include onboarding video walkthroughs",
      "Buyers want templates that 'feel like a product', not raw files",
    ],
    competitors: [
      {
        id: "c1",
        name: "Gumroad (top sellers)",
        url: "gumroad.com",
        monthlyRevenue: "$15K–$200K (individual)",
        pricing: "$19–$197 per product",
        strengths: ["Established marketplace", "Built-in audience", "Simple checkout"],
        weaknesses: ["10% fees", "Hard to differentiate", "No bundling tools"],
        marketShare: 38,
      },
      {
        id: "c2",
        name: "Notionway",
        url: "notionway.com",
        monthlyRevenue: "$45K",
        pricing: "$19–$79 per template",
        strengths: ["Notion-only focus", "Clean presentation", "SEO-driven traffic"],
        weaknesses: ["Single creator bottleneck", "Limited to Notion", "No community"],
        marketShare: 12,
      },
      {
        id: "c3",
        name: "UI8",
        url: "ui8.net",
        monthlyRevenue: "$320K",
        pricing: "$20–$149 per kit",
        strengths: ["Large catalogue", "Quality curation", "Designer credibility"],
        weaknesses: ["Designer-only audience", "Crowded", "Race to the bottom pricing"],
        marketShare: 21,
      },
    ],
  },

  default: {
    niche: "Solopreneur Automation & Productivity",
    targetMarket:
      "Solo founders and freelancers earning $3K–$10K/month who spend 30%+ of their week on repetitive tasks that could be automated or systematized.",
    demandScore: 80,
    competitionScore: 60,
    monetizationScore: 75,
    difficultyScore: 40,
    opportunitySummary:
      "Broad niche with consistent demand. Solopreneurs have a strong willingness to pay for anything that visibly saves time. Opportunity is strongest when you niche down to a specific workflow or profession rather than targeting all solopreneurs.",
    marketGaps: [
      "No tool that combines task automation + client reporting for freelancers",
      "Existing automation tools (Zapier, Make) are too technical for non-developers",
      "Freelancers want pre-built automation workflows, not DIY builders",
      "No subscription that handles your 'repetitive admin' as a managed service",
    ],
    competitors: [
      {
        id: "c1",
        name: "Zapier",
        url: "zapier.com",
        monthlyRevenue: "$140M ARR",
        pricing: "Free + $19.99–$599/mo",
        strengths: ["Massive integration library", "No-code", "Market leader"],
        weaknesses: ["Too complex for most users", "Expensive at scale", "Not designed for solopreneurs"],
        marketShare: 45,
      },
      {
        id: "c2",
        name: "Make (Integromat)",
        url: "make.com",
        monthlyRevenue: "$28M ARR",
        pricing: "Free + $9–$29/mo",
        strengths: ["Visual workflow builder", "More powerful than Zapier", "Affordable"],
        weaknesses: ["High learning curve", "Poor documentation", "Scary for beginners"],
        marketShare: 22,
      },
      {
        id: "c3",
        name: "SavvyCal",
        url: "savvycal.com",
        monthlyRevenue: "$180K",
        pricing: "$12–$20/mo",
        strengths: ["Solopreneur focus", "Simple brand", "Good scheduling UX"],
        weaknesses: ["Scheduling only", "Small feature set", "Limited automation"],
        marketShare: 4,
      },
    ],
  },
};

export function generateResearchMock(input: AgentInput): ResearchAgentOutput {
  const profile = detectProfile(input);
  return RESEARCH[profile];
}
