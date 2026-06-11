import type {
  BusinessResult,
  HistoryRecord,
  UserProfile,
} from "@/types";

// AI INTEGRATION POINT: Replace this mock with an actual AI API call
// that takes BusinessFormData and returns BusinessResult
export const MOCK_BUSINESS_RESULT: BusinessResult = {
  id: "gen_01j8x2k9m3p",
  createdAt: "2026-06-10T14:32:00Z",
  niche: "Developer Productivity Tools",
  summary:
    "High-demand niche with strong monetization potential. Developers actively pay for tools that save time. Low barrier to entry for solo founders with technical skills.",
  formData: {
    interests: "Software development, productivity, automation",
    skills: "TypeScript, React, Node.js, API integration",
    timePerWeek: "15-20 hours",
    incomeGoal: "$5,000/month",
    businessType: "SaaS / Digital Product",
  },
  scores: {
    overall: 84,
    demand: 91,
    competition: 62,
    difficulty: 45,
  },
  competitors: [
    {
      id: "c1",
      name: "Raycast",
      url: "raycast.com",
      monthlyRevenue: "$2.1M",
      pricing: "$8/mo per user",
      strengths: [
        "Strong developer brand",
        "Extension marketplace",
        "Fast performance",
      ],
      weaknesses: [
        "Mac-only",
        "Limited team features on free tier",
        "No web version",
      ],
      marketShare: 34,
    },
    {
      id: "c2",
      name: "Linear",
      url: "linear.app",
      monthlyRevenue: "$4.8M",
      pricing: "$8/mo per user",
      strengths: [
        "Excellent UX",
        "Fast keyboard navigation",
        "Strong integrations",
      ],
      weaknesses: [
        "Issue tracking only",
        "No time tracking",
        "Expensive at scale",
      ],
      marketShare: 28,
    },
    {
      id: "c3",
      name: "Pieces for Developers",
      url: "pieces.app",
      monthlyRevenue: "$320K",
      pricing: "Free + $12/mo Pro",
      strengths: [
        "Local AI processing",
        "Deep IDE integration",
        "Code snippet management",
      ],
      weaknesses: ["Niche audience", "Complex onboarding", "Limited sharing"],
      marketShare: 12,
    },
  ],
  product: {
    name: "DevFlow",
    tagline: "Your daily dev workflow, without the friction.",
    description:
      "A command palette and context manager for developers. Capture snippets, track active tasks, and automate repetitive CLI sequences — all from a single keyboard shortcut.",
    targetAudience:
      "Freelance developers and small engineering teams (2–10 people) who use multiple tools daily and lose time context-switching.",
    deliverables: [
      "Cross-platform desktop app (Mac + Windows)",
      "Browser extension for GitHub and Linear",
      "CLI companion tool",
      "Team sync dashboard (web)",
      "Onboarding email sequence (7 emails)",
    ],
    pricingModel: "Freemium → Pro subscription",
    suggestedPrice: "$9/month or $84/year",
    timeToLaunch: "8–12 weeks (solo founder)",
  },
  marketing: {
    tiktokHooks: [
      "I saved 2 hours a day with this one terminal trick — here's what I built",
      "Why senior devs have 40 tabs open (and how to fix it)",
      "The $0 productivity stack that actually works for developers",
      "I built a tool that replaces 6 apps — here's the 60-second demo",
      "Stop copying snippets from Slack — do this instead",
    ],
    contentIdeas: [
      {
        platform: "TikTok / Reels",
        format: "Screen recording",
        title: "The before/after of my dev workflow",
        hook: "This is what my terminal looked like before I built DevFlow",
      },
      {
        platform: "Twitter / X",
        format: "Thread",
        title: "I tracked every context switch for 2 weeks. The result was embarrassing.",
        hook: "47 context switches per day. Here's what I did about it.",
      },
      {
        platform: "YouTube",
        format: "Tutorial",
        title: "Build a personal CLI command center in 20 minutes",
        hook: "I'll show you the exact setup I use that saves me 90 minutes daily",
      },
      {
        platform: "Hacker News",
        format: "Show HN post",
        title: "Show HN: DevFlow — a keyboard-first context manager for developers",
        hook: "Built this after getting frustrated with tab overload between Jira, GitHub, and Notion",
      },
    ],
    launchStrategy: [
      {
        phase: "Pre-launch",
        duration: "Weeks 1–4",
        goal: "Build an audience of 500 waitlist signups",
        actions: [
          "Post 3x/week on Twitter about the problem you're solving",
          "Share build-in-public updates on LinkedIn",
          "Collect 20 interviews from target users",
          "Set up waitlist landing page",
        ],
      },
      {
        phase: "Soft Launch",
        duration: "Weeks 5–6",
        goal: "Acquire first 50 paying customers",
        actions: [
          "Email waitlist with early access invite",
          "Post on Product Hunt (prepare assets 2 weeks prior)",
          "Offer founding member pricing ($7/mo for first 100)",
          "Post demo video on all channels",
        ],
      },
      {
        phase: "Growth",
        duration: "Weeks 7–12",
        goal: "Reach $2K MRR",
        actions: [
          "Activate referral program (give 1 month free per referral)",
          "Reach out to dev influencers for honest reviews",
          "Submit to developer newsletters (TLDR, Bytes.dev)",
          "Start weekly changelog emails",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, platform: "Twitter", content: "Problem awareness thread", goal: "Followers + impressions" },
      { week: 1, platform: "TikTok", content: "Before/after workflow demo", goal: "Reach new audience" },
      { week: 2, platform: "Twitter", content: "Building in public: first screenshot", goal: "Engagement" },
      { week: 2, platform: "LinkedIn", content: "Why context switching kills deep work", goal: "Professional reach" },
      { week: 3, platform: "Twitter", content: "User interview findings thread", goal: "Credibility" },
      { week: 3, platform: "TikTok", content: "'Things developers hate' listicle", goal: "Virality" },
      { week: 4, platform: "All", content: "Waitlist launch announcement", goal: "Signups" },
    ],
  },
  recommendations: [
    {
      type: "improvement",
      title: "Narrow to a single IDE before expanding",
      description:
        "VS Code has 73% market share among your target audience. Building a VS Code extension first reduces scope and gives you a built-in distribution channel (Marketplace).",
      priority: "high",
    },
    {
      type: "improvement",
      title: "Add a free tier that creates habit",
      description:
        "Tools like Raycast and Warp succeed because the free tier is genuinely useful. Design your free tier so users form a daily habit, then upsell team features.",
      priority: "high",
    },
    {
      type: "alternative",
      title: "Developer onboarding tools",
      description:
        "A narrower but less competitive niche: tools that help developers onboard to new codebases faster. Smaller TAM but higher B2B willingness to pay.",
      priority: "medium",
    },
    {
      type: "alternative",
      title: "API documentation generators",
      description:
        "Strong demand from backend teams. Tools like Mintlify ($4M ARR) show the market is real. Easier to charge B2B pricing ($50–$200/mo).",
      priority: "medium",
    },
    {
      type: "next-step",
      title: "Validate with a no-code prototype this week",
      description:
        "Build a Raycast extension or Alfred workflow to test your core value proposition before writing any custom code. Get 10 people to use it for 7 days.",
      priority: "high",
    },
    {
      type: "next-step",
      title: "Set up a simple landing page with email capture",
      description:
        "Use a single page with your value prop, 3 feature bullets, and an email signup. Run $50 in Twitter ads to your target audience and measure signup rate.",
      priority: "medium",
    },
  ],
};

export const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: "gen_01j8x2k9m3p",
    createdAt: "2026-06-10T14:32:00Z",
    niche: "Developer Productivity Tools",
    overallScore: 84,
    businessType: "SaaS",
    productName: "DevFlow",
    status: "completed",
  },
  {
    id: "gen_01j7w1j8l2o",
    createdAt: "2026-06-05T09:15:00Z",
    niche: "Freelance Design Ops",
    overallScore: 71,
    businessType: "Service + Digital Product",
    productName: "DesignBatch",
    status: "completed",
  },
  {
    id: "gen_01j6v0i7k1n",
    createdAt: "2026-05-28T16:44:00Z",
    niche: "Local SEO for Small Business",
    overallScore: 68,
    businessType: "Agency / Productized Service",
    productName: "RankLocal",
    status: "completed",
  },
  {
    id: "gen_01j5u9h6j0m",
    createdAt: "2026-05-18T11:22:00Z",
    niche: "No-Code Automation Templates",
    overallScore: 79,
    businessType: "Digital Product",
    productName: "FlowKit",
    status: "completed",
  },
  {
    id: "gen_01j4t8g5i9l",
    createdAt: "2026-05-09T08:00:00Z",
    niche: "B2B LinkedIn Content",
    overallScore: 65,
    businessType: "Productized Service",
    productName: "PostPilot",
    status: "draft",
  },
];

export const MOCK_USER: UserProfile = {
  id: "user_01j8x2k9",
  name: "Alex Morgan",
  email: "alex@example.com",
  plan: "pro",
  generationsUsed: 5,
  generationsLimit: 50,
  joinedAt: "2026-04-01T00:00:00Z",
};
