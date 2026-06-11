// Mock critic outputs — one per BusinessProfile
// AI INTEGRATION POINT: CriticAgent.aiRun() reviews all prior outputs and generates improvements

import type {
  CriticAgentOutput,
  BusinessProfile,
  AgentInput,
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
} from "@/lib/types/agents";

const CRITIC: Record<BusinessProfile, CriticAgentOutput> = {
  developer: {
    overallAssessment:
      "Solid opportunity with a clear audience. The risk is building features before validating that developers will pay — most prefer free tools. The key unlock is finding one painful daily habit to own, then expanding.",
    weaknesses: [
      "Developers are notoriously hard to convert to paid (free culture)",
      "VS Code extensions and Raycast are deeply entrenched habits",
      "High churn risk if the core feature becomes available in existing tools",
      "Narrow TAM at the solo dev level — needs team tier to scale revenue",
    ],
    improvements: [
      {
        title: "Narrow to VS Code extension first",
        description:
          "VS Code has 73% dev market share and a built-in distribution channel (Marketplace). Building an extension first reduces scope and gives you a captive installation base before building a standalone app.",
        priority: "high",
      },
      {
        title: "Design the free tier to create habit",
        description:
          "Tools like Raycast and Warp succeed because free tier is genuinely useful. Design free tier so developers form a daily habit, then upsell team features. Freemium works here — paid-only will stall growth.",
        priority: "high",
      },
      {
        title: "Validate with a no-code prototype first",
        description:
          "Build a Raycast extension or Alfred workflow to test the core value proposition before writing custom code. Get 10 developers to use it for 7 days. Only build the standalone app if the prototype creates real retention.",
        priority: "high",
      },
      {
        title: "Add a team collaboration layer at launch",
        description:
          "Solo dev tools cap revenue at ~$9/user. If you add shared snippet libraries and team context sync, you can justify $15–$25/seat and sell to teams of 5–20 — 5–10× higher LTV per customer.",
        priority: "medium",
      },
    ],
    alternativeIdeas: [
      {
        title: "Developer onboarding documentation tool",
        description:
          "Help developers onboard to new codebases faster with AI-assisted repo summarization and interactive walkthroughs. Narrower TAM but much higher B2B willingness to pay ($50–$200/month).",
        estimatedScore: 78,
      },
      {
        title: "API documentation generator",
        description:
          "Strong demand from backend teams. Tools like Mintlify ($4M ARR) show the market is real. Easier to charge B2B pricing and less price resistance than productivity tools.",
        estimatedScore: 81,
      },
    ],
  },

  creator: {
    overallAssessment:
      "Timing is excellent — creator monetization anxiety is at an all-time high. The risk is that this market is saturated with advice but under-served with actual systems. A tool beats a course in long-term retention.",
    weaknesses: [
      "Creators have very high churn — they buy tools impulsively and abandon them",
      "Many free Notion templates exist — differentiation requires excellent presentation",
      "The creator market is filled with noise, making it hard to stand out without an existing audience",
      "Heavy competition from YouTubers with large audiences who can launch competing products instantly",
    ],
    improvements: [
      {
        title: "Lead with a specific niche, not all creators",
        description:
          "Rather than targeting 'creators' broadly, target 'YouTube creators monetizing through sponsorships' or 'newsletter writers managing a paid community.' Niche audiences convert at 3–5× higher rates and refer enthusiastically.",
        priority: "high",
      },
      {
        title: "Build a free tier with intentional limitations",
        description:
          "Offer a free 'starter' version with 2–3 databases vs the full system. This gets people using the product and experiencing value before asking for money. Free users convert at 15–25% if the product creates a daily habit.",
        priority: "high",
      },
      {
        title: "Add a community component",
        description:
          "Sell access to a private community (Discord or Circle) alongside the product. Community increases LTV, reduces churn, and creates a referral flywheel. Charge $20–$50/month for community + template updates.",
        priority: "medium",
      },
    ],
    alternativeIdeas: [
      {
        title: "Creator contract and media kit template pack",
        description:
          "Brands pay creators but the contracting process is painful on both sides. A premium template pack for creator contracts, rate cards, and media kits could sell for $97+ with almost no competition.",
        estimatedScore: 74,
      },
      {
        title: "Sponsorship rate calculator SaaS",
        description:
          "A simple web app that calculates fair creator sponsorship rates based on niche, engagement, and platform. Could be freemium with a $9/month pro tier for brands and creators. Near-zero competition.",
        estimatedScore: 72,
      },
    ],
  },

  service: {
    overallAssessment:
      "One of the highest-margin opportunities in this analysis. Productized services are underestimated because founders assume clients want customization — most actually want predictability and reliability more than customization.",
    weaknesses: [
      "Revenue is capped by your capacity — need to systematize early to scale",
      "Client concentration risk — losing one client can be 12%+ of revenue",
      "Service businesses are hard to sell — limited exit options vs SaaS",
      "Delivery quality depends entirely on you at first — burnout risk is real",
    ],
    improvements: [
      {
        title: "Document SOPs from day one",
        description:
          "Before signing your second client, document every step of your delivery process. This protects you from burnout, enables delegation to a VA, and makes the business sellable eventually. Use Loom + Notion.",
        priority: "high",
      },
      {
        title: "Require a 3-month minimum commitment",
        description:
          "Month-to-month contracts kill predictability. A 3-month minimum reduces churn, ensures you can show results, and justifies a discount. Most clients who try to negotiate to month-to-month are lower-quality clients anyway.",
        priority: "high",
      },
      {
        title: "Add a performance-based upsell tier",
        description:
          "Once you have 2–3 clients with results, offer a tier where you take a small % of revenue uplift you generate. This justifies $3K–$5K/month retainers and creates alignment with client success.",
        priority: "medium",
      },
    ],
    alternativeIdeas: [
      {
        title: "Same service sold to a specific vertical (e.g. dental clinics)",
        description:
          "Instead of serving 'e-commerce broadly,' niche down to a single vertical. A productized marketing service for dental clinics (or lawyers, or chiropractors) can charge 2× and acquires clients through vertical-specific channels.",
        estimatedScore: 87,
      },
      {
        title: "White-label service for agencies",
        description:
          "Sell your service to marketing agencies as a white-label offering. They sell to their clients at 3× and you do the work. No direct sales effort — you serve as overflow capacity for 5–10 agencies.",
        estimatedScore: 79,
      },
    ],
  },

  digital: {
    overallAssessment:
      "Low risk, low time investment, real income ceiling. The danger is building a product that sells once and then sits static. Templates with ongoing value (update subscriptions, community access) have 3× higher LTV.",
    weaknesses: [
      "Individual templates are easily copied and undercut on price",
      "Marketplace distribution (Gumroad) gives up 10% and hides customer data",
      "One-time revenue makes income unpredictable month to month",
      "Template fatigue is real — buyers often collect but don't implement",
    ],
    improvements: [
      {
        title: "Add a video walkthrough to increase perceived value",
        description:
          "Templates with a 20–40 minute setup walkthrough video sell for 2–3× more than identical templates without video. It also dramatically reduces support requests. Use Loom — one recording, included forever.",
        priority: "high",
      },
      {
        title: "Bundle into a system, not individual templates",
        description:
          "A 'complete system' (5 linked templates) sells for $79–$129, while individual templates sell for $15–$29. The system framing increases perceived value without proportionally increasing production time.",
        priority: "high",
      },
      {
        title: "Build off Gumroad with your own site for better margins",
        description:
          "Gumroad takes 10%. Lemon Squeezy takes 5%. Your own Stripe checkout takes 2.9%. On $5K/month in sales, the margin difference is $360/month. Build your own landing page within 90 days of validating the product.",
        priority: "medium",
      },
    ],
    alternativeIdeas: [
      {
        title: "Notion template subscription for a specific profession",
        description:
          "A monthly subscription that provides 2–3 new templates for consultants, coaches, or architects every month. Lower barrier to entry per month, 12× LTV vs one-time purchase. Near-zero competition in most professions.",
        estimatedScore: 76,
      },
      {
        title: "Template customization service",
        description:
          "Sell the base template at low price ($29) and offer 'done-for-you setup' at $297. Many buyers want the template but don't want to implement it. This creates a product-to-service funnel.",
        estimatedScore: 71,
      },
    ],
  },

  default: {
    overallAssessment:
      "Solid foundation with a clear pain point. The opportunity strengthens significantly when you niche down to a specific type of freelancer (e.g. agencies, coaches, copywriters) rather than all solopreneurs.",
    weaknesses: [
      "Automation setup is a one-time deliverable — recurring revenue requires a retainer model",
      "Clients may not see the value of maintenance after initial setup",
      "Zapier and Make are commoditizing DIY automation — your edge must be 'done-for-you'",
      "Scope creep is a risk — 'just one more workflow' is a common client request",
    ],
    improvements: [
      {
        title: "Niche down to one type of freelancer",
        description:
          "Rather than serving all solopreneurs, pick one (coaches, copywriters, real estate agents, designers). You can create ready-made templates for their exact workflows and become the go-to expert for that profession.",
        priority: "high",
      },
      {
        title: "Offer a retainer from day one",
        description:
          "Frame the initial setup as 'month 1 of a retainer' where months 2–6 include maintenance, new automations, and support. Price: $197/month vs $497 one-time. Many clients prefer predictable monthly billing anyway.",
        priority: "high",
      },
      {
        title: "Build a template library as a product",
        description:
          "Every automation you build for a client is a template you can sell for $49–$97 later. After 10 clients, you'll have a library of 30+ automation templates. This creates a parallel product revenue stream.",
        priority: "medium",
      },
    ],
    alternativeIdeas: [
      {
        title: "Done-for-you automation for a specific industry",
        description:
          "Automating 'e-commerce order fulfillment' or 'real estate lead follow-up' is more valuable and commands higher prices ($1K–$2K) than generic freelancer automation. Industry-specific knowledge is hard to replicate.",
        estimatedScore: 77,
      },
      {
        title: "Automation audit service",
        description:
          "A $297 one-time audit where you review a client's existing tools and identify what can be automated, then hand them a prioritized roadmap. Low delivery time (2–3 hours), easy to sell, and creates upsell opportunities.",
        estimatedScore: 70,
      },
    ],
  },
};

// AI INTEGRATION POINT: The critic agent should receive all prior agent outputs
// and identify weak points in the reasoning chain, not just provide generic advice
export function generateCriticMock(
  input: AgentInput,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  profile: BusinessProfile,
): CriticAgentOutput {
  void input;
  void research;
  void product;
  void marketing;
  return CRITIC[profile];
}
