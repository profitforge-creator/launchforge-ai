// Mock marketing outputs — one per BusinessProfile
// AI INTEGRATION POINT: MarketingAgent.aiRun() replaces this with a Claude/Gemini API call

import type { MarketingAgentOutput, BusinessProfile, AgentInput, ResearchAgentOutput, ProductAgentOutput } from "@/lib/types/agents";

const MARKETING: Record<BusinessProfile, MarketingAgentOutput> = {
  developer: {
    tiktokHooks: [
      "I saved 2 hours a day with this one terminal trick — here's what I built",
      "Why senior devs have 40 tabs open (and how to fix it)",
      "The $0 productivity stack that actually works for developers",
      "I built a tool that replaces 6 apps — here's the 60-second demo",
      "Stop copying snippets from Slack — do this instead",
    ],
    contentPillars: [
      "Developer workflow optimization",
      "Building in public (progress + learnings)",
      "Tool comparisons and honest reviews",
      "Time-saving keyboard shortcuts and automations",
    ],
    contentIdeas: [
      { platform: "TikTok / Reels", format: "Screen recording", title: "Before/after of my dev workflow", hook: "This is what my terminal looked like 3 months ago vs now" },
      { platform: "Twitter / X", format: "Thread", title: "I tracked every context switch for 2 weeks", hook: "47 context switches per day. Here's what I did about it." },
      { platform: "YouTube", format: "Tutorial", title: "Build a personal CLI command center in 20 minutes", hook: "I'll show you the exact setup I use that saves me 90 minutes daily" },
      { platform: "Hacker News", format: "Show HN post", title: "Show HN: DevFlow — a keyboard-first context manager", hook: "Built this after getting frustrated with tab overload between Jira, GitHub, and Notion" },
    ],
    launchStrategy: [
      {
        phase: "Pre-launch",
        duration: "Weeks 1–4",
        goal: "500 waitlist signups",
        actions: [
          "Post 3×/week on Twitter about the problem you're solving",
          "Share build-in-public updates with screenshots",
          "Conduct 20 user interviews in r/webdev and r/devops",
          "Set up waitlist page with email capture",
        ],
      },
      {
        phase: "Soft Launch",
        duration: "Weeks 5–6",
        goal: "50 paying customers",
        actions: [
          "Email waitlist with early access invite",
          "Launch on Product Hunt (prepare assets 2 weeks prior)",
          "Offer founding member pricing (30% off for first 100)",
          "Post demo video on all channels same day",
        ],
      },
      {
        phase: "Growth",
        duration: "Weeks 7–12",
        goal: "$2K MRR",
        actions: [
          "Activate referral program (1 month free per referral)",
          "Reach out to dev-focused newsletters (TLDR, Bytes.dev)",
          "Submit to developer tool directories",
          "Start weekly changelog email to all users",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, platform: "Twitter", content: "Problem awareness thread: context switching costs", goal: "Followers + impressions" },
      { week: 1, platform: "TikTok", content: "Before/after dev workflow demo", goal: "New audience reach" },
      { week: 2, platform: "Twitter", content: "Building in public: first screenshot", goal: "Engagement" },
      { week: 2, platform: "LinkedIn", content: "Why context switching kills deep work (data-backed)", goal: "Professional reach" },
      { week: 3, platform: "Twitter", content: "User interview findings thread", goal: "Credibility building" },
      { week: 3, platform: "TikTok", content: "'Things developers hate' listicle", goal: "Viral reach" },
      { week: 4, platform: "All", content: "Waitlist launch announcement", goal: "Email signups" },
    ],
  },

  creator: {
    tiktokHooks: [
      "I make $8K/month from content but I had to build my own system to track it all",
      "The creator tool that replaced my 3 spreadsheets",
      "Most creators don't know how much money they're leaving on the table — I ran the numbers",
      "This is what $10K/month looks like when it's organized (and when it's not)",
      "Stop chasing views. Start chasing these numbers instead.",
    ],
    contentPillars: [
      "Creator monetization strategies and math",
      "Behind-the-scenes of managing multiple revenue streams",
      "Systems and tools for professional creators",
      "Transparent income reports and breakdowns",
    ],
    contentIdeas: [
      { platform: "TikTok / Reels", format: "Talking head", title: "My 5 revenue streams as a creator (breakdown)", hook: "Here's exactly how I made $8K last month from content" },
      { platform: "YouTube", format: "Tutorial", title: "Build your Creator OS in Notion (full walkthrough)", hook: "This system runs my entire content business — and I'm showing you exactly how to copy it" },
      { platform: "Twitter / X", format: "Thread", title: "The creator monetization stack that changed my business", hook: "Most creators have 1 revenue stream. Here's how to build 5 systematically." },
      { platform: "Instagram", format: "Carousel", title: "6 metrics every creator should track (and most don't)", hook: "Views and followers are vanity. These 6 numbers actually predict your income." },
    ],
    launchStrategy: [
      {
        phase: "Pre-launch",
        duration: "Weeks 1–3",
        goal: "300 waitlist signups from your existing audience",
        actions: [
          "Poll your audience: 'What's your biggest creator business challenge?'",
          "Share a 'building this because...' story post",
          "Create a sneak peek reel of the product",
          "Build simple landing page with email capture",
        ],
      },
      {
        phase: "Launch Week",
        duration: "Week 4",
        goal: "100 sales at launch pricing",
        actions: [
          "Email list: exclusive early access + 20% launch discount",
          "Go live on YouTube/TikTok showing the product in action",
          "Post daily behind-the-scenes content that week",
          "DM your most engaged followers personally",
        ],
      },
      {
        phase: "Post-launch",
        duration: "Weeks 5–12",
        goal: "$3K/month recurring from upsells + coaching",
        actions: [
          "Collect and share customer results (with permission)",
          "Add coaching tier for buyers who want 1:1 implementation",
          "Create a free 'lite' version for top-of-funnel",
          "Start affiliate program (30% commission)",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, platform: "TikTok", content: "Creator income breakdown video", goal: "Awareness + engagement" },
      { week: 1, platform: "Email", content: "Announce you're building something for creators", goal: "Warm up audience" },
      { week: 2, platform: "YouTube", content: "How I manage 5 revenue streams (full video)", goal: "SEO + credibility" },
      { week: 2, platform: "Twitter", content: "Thread: the creator monetization math nobody talks about", goal: "Shares + signups" },
      { week: 3, platform: "Instagram", content: "Product sneak peek carousel", goal: "Waitlist signups" },
      { week: 4, platform: "All", content: "Launch day content blitz", goal: "Sales" },
      { week: 5, platform: "Email", content: "First customer testimonial", goal: "Social proof + more sales" },
    ],
  },

  service: {
    tiktokHooks: [
      "I charge $1,500/month and only work 3 hours per client — here's the model",
      "Why I stopped doing hourly work forever (and what I do instead)",
      "The productized service model that gets clients to say yes immediately",
      "Most freelancers underprice by 3× — here's the math",
      "I signed 4 clients in 2 weeks with this exact cold email script",
    ],
    contentPillars: [
      "Productized service business model education",
      "Client acquisition without paid ads",
      "Pricing and positioning for service businesses",
      "Behind-the-scenes of running a lean agency",
    ],
    contentIdeas: [
      { platform: "LinkedIn", format: "Text post", title: "Why I stopped selling my time (and tripled revenue)", hook: "In January I billed 120 hours for $12K. In March I worked 40 hours for $12K. Here's what changed." },
      { platform: "TikTok / Reels", format: "Talking head", title: "The productized service pitch that closes in 15 minutes", hook: "I went from 2-hour sales calls to 15-minute calls with an 80% close rate. Here's the script." },
      { platform: "YouTube", format: "Case study", title: "How I built a $12K/month productized service in 60 days", hook: "No agency. No employees. Just one offer, repeated 8 times." },
      { platform: "Twitter / X", format: "Thread", title: "Stop charging hourly. Here's the math that convinced me.", hook: "Hourly billing is a trap. Here are 5 numbers that prove it." },
    ],
    launchStrategy: [
      {
        phase: "Offer definition",
        duration: "Week 1",
        goal: "Single clear offer defined and priced",
        actions: [
          "Define exact deliverables, timeline, and price — no custom quotes",
          "Write a one-page service spec doc",
          "Set up simple landing page with 'Book a call' CTA",
          "Identify 50 ideal clients (LinkedIn search)",
        ],
      },
      {
        phase: "First clients",
        duration: "Weeks 2–4",
        goal: "3 paying clients at full price",
        actions: [
          "Send 10 personalized LinkedIn messages per day to ICP",
          "Offer 1 pilot client a 30-day risk-free trial",
          "Ask 5 past clients/contacts for referrals",
          "Post case study or process breakdown on LinkedIn daily",
        ],
      },
      {
        phase: "Scale to capacity",
        duration: "Weeks 5–12",
        goal: "8 clients ($12K MRR)",
        actions: [
          "Systematize delivery with SOPs and templates",
          "Hire first VA for admin tasks ($5–$10/hr)",
          "Build referral flywheel (incentivize client referrals)",
          "Raise price after reaching capacity — test $2K/month",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, platform: "LinkedIn", content: "Productized service announcement post", goal: "ICP awareness" },
      { week: 1, platform: "Twitter", content: "Thread: the math behind productized services", goal: "Reach + credibility" },
      { week: 2, platform: "LinkedIn", content: "Behind-the-scenes: first client deliverable", goal: "Social proof" },
      { week: 2, platform: "TikTok", content: "Cold email that signs clients (real example)", goal: "New audience" },
      { week: 3, platform: "LinkedIn", content: "Client result case study", goal: "Referrals + inbound" },
      { week: 4, platform: "All", content: "Open 2 new client spots announcement", goal: "Direct sales" },
      { week: 5, platform: "Email", content: "Monthly results newsletter", goal: "Retention + referrals" },
    ],
  },

  digital: {
    tiktokHooks: [
      "I made $4,200 last month selling a Notion template I built in 3 days",
      "Why your digital product isn't selling (and how to fix it in 10 minutes)",
      "The $47 product that sells itself — here's how I built it",
      "Most Notion templates fail because of this one mistake",
      "I analyzed 50 best-selling Gumroad products and found a pattern",
    ],
    contentPillars: [
      "Digital product creation and launch strategies",
      "Notion system design and tutorials",
      "Passive income from templates and digital goods",
      "Building in public: product creation process",
    ],
    contentIdeas: [
      { platform: "TikTok / Reels", format: "Screen recording", title: "Inside my $4K/month Notion template business", hook: "Here's the exact product I sell, the page where people buy it, and how much I made last month" },
      { platform: "Pinterest", format: "Infographic", title: "10 Notion templates every freelancer needs", hook: "Save this for later — these templates will save you 5 hours per week" },
      { platform: "YouTube", format: "Tutorial", title: "How to build and sell a Notion template (start to finish)", hook: "I'll show you the exact process I used to create a $79 template that sells 20 copies a week" },
      { platform: "Twitter / X", format: "Thread", title: "I researched every best-selling digital product. Here's the formula.", hook: "After analyzing 200 Gumroad products, I found 7 patterns in every $10K+ seller." },
    ],
    launchStrategy: [
      {
        phase: "Build + validate",
        duration: "Week 1–2",
        goal: "Template built and tested with 5 real users",
        actions: [
          "Build the product with your target user watching — adapt in real time",
          "Give it to 5 people for free in exchange for a video testimonial",
          "Set up Gumroad or Lemon Squeezy product page",
          "Write a sales page that shows the product in action (screenshots + GIF)",
        ],
      },
      {
        phase: "Launch",
        duration: "Week 3",
        goal: "50 sales at launch pricing",
        actions: [
          "Post 3 pieces of content showing the template in use",
          "Offer 48-hour launch discount (40% off)",
          "Post in 3 niche communities (Notion subreddits, Facebook groups, Discord)",
          "Submit to Notion-specific directories and marketplaces",
        ],
      },
      {
        phase: "Compound",
        duration: "Weeks 4–12",
        goal: "$2K/month passive recurring",
        actions: [
          "Build 2 more complementary templates (bundle potential)",
          "Start Pinterest SEO strategy (long tail discovery)",
          "Set up YouTube tutorial targeting product keywords",
          "Create an affiliate program (25% commission)",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, platform: "TikTok", content: "Product reveal screen recording", goal: "Awareness" },
      { week: 1, platform: "Twitter", content: "Building in public: why I'm building this", goal: "Early audience" },
      { week: 2, platform: "TikTok", content: "Tutorial: using the template live", goal: "Credibility" },
      { week: 2, platform: "Pinterest", content: "Template pin with SEO title", goal: "Passive discovery" },
      { week: 3, platform: "All", content: "Launch week content blitz (daily)", goal: "Sales" },
      { week: 4, platform: "YouTube", content: "Full tutorial of the template (ranks for SEO)", goal: "Long-term traffic" },
      { week: 5, platform: "TikTok", content: "Customer results showcase", goal: "Social proof + sales" },
    ],
  },

  default: {
    tiktokHooks: [
      "I automated 10 hours of freelance admin in one afternoon — here's how",
      "The workflow that saved my business (I was about to quit)",
      "Every freelancer should have this set up before onboarding their next client",
      "Stop doing your own invoicing — let this do it for you",
      "I charged $497 for this and it took me 3 hours to deliver",
    ],
    contentPillars: [
      "Freelance automation and systems",
      "Time savings math and case studies",
      "Behind-the-scenes of a lean solo business",
      "Tool tutorials for non-technical solopreneurs",
    ],
    contentIdeas: [
      { platform: "TikTok / Reels", format: "Screen recording", title: "The automation that replaced my Monday morning routine", hook: "Every Monday I used to spend 2 hours on admin. Now it takes 0 minutes. Here's the setup." },
      { platform: "LinkedIn", format: "Case study post", title: "How I saved my freelance client 8 hours per week", hook: "My client was spending 8 hours/week on client onboarding. We automated it in an afternoon." },
      { platform: "YouTube", format: "Tutorial", title: "Full automation setup for freelancers (no coding required)", hook: "I'll set up your entire client onboarding automation live on camera — using only free tools you already have." },
      { platform: "Twitter / X", format: "Thread", title: "10 freelance tasks you can automate this weekend", hook: "Thread: Every one of these took me less than 2 hours to set up. Together they save me 6 hours per week." },
    ],
    launchStrategy: [
      {
        phase: "Validate",
        duration: "Week 1",
        goal: "5 paid clients at any price",
        actions: [
          "Offer the service to 3 freelancers in your network for $97",
          "Document everything you do to create a repeatable process",
          "Collect 3 video testimonials before scaling",
          "Set up simple booking page and intake form",
        ],
      },
      {
        phase: "Launch",
        duration: "Weeks 2–4",
        goal: "$1,500 revenue in first month",
        actions: [
          "Post results content (with client permission) on LinkedIn and TikTok",
          "Message 20 people per day in your target audience",
          "Get 3 referrals from first clients",
          "Launch to relevant Facebook groups and communities",
        ],
      },
      {
        phase: "Systematize",
        duration: "Weeks 5–12",
        goal: "$3K/month with 5-hour delivery",
        actions: [
          "Create SOPs for every step of the delivery process",
          "Build a library of pre-built automation templates",
          "Raise price to $497 + $97/month maintenance",
          "Hire a VA to handle the repetitive parts",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, platform: "TikTok", content: "Automation demo: before vs after", goal: "Awareness" },
      { week: 1, platform: "LinkedIn", content: "Announcement: launching this service", goal: "ICP reach" },
      { week: 2, platform: "Twitter", content: "Thread: 10 tasks you can automate this weekend", goal: "Shares" },
      { week: 2, platform: "LinkedIn", content: "First client case study", goal: "Social proof" },
      { week: 3, platform: "YouTube", content: "Full setup tutorial", goal: "SEO + credibility" },
      { week: 4, platform: "Email", content: "Launch: 3 spots available", goal: "Direct sales" },
      { week: 5, platform: "TikTok", content: "Client transformation story", goal: "Viral reach" },
    ],
  },
};

// AI INTEGRATION POINT: Pass research + product context to ground the marketing in actual findings
export function generateMarketingMock(
  input: AgentInput,
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  profile: BusinessProfile,
): MarketingAgentOutput {
  void input;
  void research;
  void product;
  return MARKETING[profile];
}
