/**
 * Business Type Configuration
 *
 * Central registry for all 8 supported business models.
 * Each config drives type-specific prompt customization across the
 * Product, Website, and Marketing agents.
 */

export type BusinessTypeId =
  | "course"
  | "ebook"
  | "template"
  | "agency"
  | "membership"
  | "saas"
  | "coaching"
  | "newsletter"
  | "open";

export interface BusinessTypeConfig {
  id: BusinessTypeId;
  label: string;
  tagline: string;

  // ── Product agent ─────────────────────────────────────────────────────────
  /** Appended to system prompt so Gemini thinks in type-native terms */
  productSystemContext: string;
  /** Tells the model exactly what deliverables to populate */
  deliverableInstructions: string;
  /** Pricing guidance — what models work for this type */
  pricingGuidance: string;
  /** Typical time-to-launch range */
  launchTimeline: string;

  // ── Website agent ─────────────────────────────────────────────────────────
  /** Adjusts copy style and page emphasis */
  websiteCopyStyle: string;
  /** Which sections to emphasize in the hero */
  websiteHeroFocus: string;

  // ── Marketing agent ───────────────────────────────────────────────────────
  /** Primary distribution channels */
  primaryChannels: string[];
  /** How this type is typically launched */
  launchApproach: string;
  /** Content angles that work best */
  contentAngles: string[];
  /** Platform for short-form hooks */
  shortFormPlatform: string;
}

export const BUSINESS_TYPE_CONFIGS: Record<BusinessTypeId, BusinessTypeConfig> = {

  course: {
    id: "course",
    label: "Course",
    tagline: "Teach what you know as a structured program",
    productSystemContext: `You are designing an ONLINE COURSE. Think in terms of curriculum architecture, learning outcomes, and student transformation. The deliverables are the course modules and supporting materials.`,
    deliverableInstructions: `Generate exactly 6 course-specific deliverables:
- Module 1: [foundational module title] (include lesson count, e.g. "3 video lessons + worksheet")
- Module 2: [core skill module] (include lesson count)
- Module 3: [advanced module] (include lesson count)
- Module 4: [implementation module] (include lesson count)
- Bonus: [bonus resource that increases perceived value]
- Community: [student community or accountability structure]
Each deliverable should describe what the student will be able to DO after completing it.`,
    pricingGuidance: `Courses typically price at $97–$497 one-time (self-paced) or $497–$2,000 (cohort/live). Price based on transformation value, not content length.`,
    launchTimeline: "6–10 weeks to record and launch",
    websiteCopyStyle: `Use a transformation-focused sales letter style. Emphasize the student's before/after state. Social proof should be student outcomes, not product features.`,
    websiteHeroFocus: "Lead with the transformation promise, not the course features. Who will they become?",
    primaryChannels: ["YouTube", "TikTok", "LinkedIn", "Twitter/X", "Email list", "Podcast"],
    launchApproach: "Pre-sell to a waitlist, run a free webinar or challenge, then open enrollment for 5 days. Email-first launch.",
    contentAngles: [
      "Show the exact process/framework taught in the course",
      "Common mistakes beginners make (that the course fixes)",
      "Student wins and transformations",
      "Behind-the-scenes of course creation",
      "Free mini-lessons from the curriculum",
    ],
    shortFormPlatform: "TikTok / Instagram Reels",
  },

  ebook: {
    id: "ebook",
    label: "Ebook",
    tagline: "Publish expertise as a high-value digital book",
    productSystemContext: `You are designing a PREMIUM EBOOK / DIGITAL GUIDE. Think in terms of chapter structure, actionable frameworks, and tangible takeaways the reader can apply immediately.`,
    deliverableInstructions: `Generate exactly 6 ebook-specific deliverables:
- Chapter outline: [list the chapter titles and the core insight of each]
- Main ebook PDF: [page count estimate, e.g. "60-page PDF guide"]
- Frameworks: [1–2 proprietary frameworks or models included]
- Templates: [supporting template or worksheet included]
- Companion resource: [checklists, swipe file, or resource list]
- Bonus chapter or case study: [extended content that justifies premium pricing]`,
    pricingGuidance: `Ebooks price at $17–$97. Under $47 converts well as impulse buy. $47–$97 needs a stronger guarantee and more social proof. Consider a $7 tripwire + $47 upsell structure.`,
    launchTimeline: "3–5 weeks to write, design, and launch",
    websiteCopyStyle: `Use a direct-response sales page style. Lead with a specific pain point, promise a clear outcome, and use proof elements (screenshots, testimonials, before/after). Include a money-back guarantee.`,
    websiteHeroFocus: "Lead with the #1 problem the reader has and the specific answer this ebook provides.",
    primaryChannels: ["Twitter/X", "LinkedIn", "Gumroad", "Reddit", "Niche communities", "Email newsletter"],
    launchApproach: "Post a 'I wrote the guide I wish existed' thread on Twitter/LinkedIn. Share one key insight daily for a week. Sell via Gumroad. Partner with newsletter sponsors.",
    contentAngles: [
      "Share one chapter's key insight as a free Twitter thread",
      "Before/after: what you knew vs. what you know now",
      "The #1 mistake that costs [audience] [time/money]",
      "The framework in the book (visual carousel)",
      "Reader testimonials and results",
    ],
    shortFormPlatform: "Twitter/X threads",
  },

  template: {
    id: "template",
    label: "Template",
    tagline: "Build a done-for-you system people can use instantly",
    productSystemContext: `You are designing a PREMIUM TEMPLATE or SYSTEM (Notion, Airtable, Figma, spreadsheet, or document kit). Think in terms of components, use cases, and setup time reduction.`,
    deliverableInstructions: `Generate exactly 6 template-specific deliverables:
- Core template: [the main template with its key sections/databases/views]
- Dashboard view: [the main control panel or home view description]
- Automation setup: [any automations or formulas included]
- Quick-start guide: [step-by-step setup PDF, estimated 10–15 pages]
- Tutorial video: [walkthrough video showing all features — estimated length]
- Update policy: [how future versions are delivered, e.g. "Lifetime updates via Gumroad"]`,
    pricingGuidance: `Templates price at $19–$97 for individual use, $97–$297 for teams. "Starter + Pro" tiers work well. Offer a free lite version to build the list.`,
    launchTimeline: "2–4 weeks to build, document, and launch",
    websiteCopyStyle: `Use a product demo-style landing page. Lead with a screen recording or screenshot of the template in use. Emphasize setup time savings and what the customer doesn't have to build.`,
    websiteHeroFocus: "Show the template, don't just describe it. Lead with 'Stop building from scratch — use this.'",
    primaryChannels: ["Twitter/X", "LinkedIn", "Notion/Airtable Reddit", "ProductHunt", "Gumroad", "TikTok"],
    launchApproach: "Post the 'I built my system over 6 months — here it is' launch post. Share screenshots/video of the template in action. Launch on Product Hunt on a Tuesday.",
    contentAngles: [
      "Show a before/after of their workflow with and without the template",
      "Speed demo: set up in X minutes",
      "The specific problem the template was designed to solve",
      "Show one section of the template and explain it",
      "Template breakdown: here's every component and why",
    ],
    shortFormPlatform: "TikTok / Twitter",
  },

  agency: {
    id: "agency",
    label: "Agency",
    tagline: "Package your skills as a productized service business",
    productSystemContext: `You are designing a PRODUCTIZED AGENCY / SERVICE BUSINESS. Think in terms of service packages, delivery process, and client outcomes. The product is the repeatable process + outcome, not just time.`,
    deliverableInstructions: `Generate exactly 6 agency-specific deliverables:
- Service package: [your main offer with a clear scope — what's in, what's out, delivery timeline]
- Pricing tiers: [Starter / Growth / Premium tier names and what each includes]
- Proposal template: [the document structure you send prospects — key sections]
- Client onboarding: [onboarding doc + checklist for new clients]
- SOP library: [2–3 specific SOPs that make delivery repeatable]
- Case study template: [format for capturing and displaying client results]`,
    pricingGuidance: `Productized services price at $500–$5,000/month for ongoing retainers, or $1,500–$15,000 for one-time projects. Price the outcome, not the hours. Monthly retainers build recurring revenue.`,
    launchTimeline: "1–3 weeks to package and find first client",
    websiteCopyStyle: `Use a credibility-first style. Lead with results/outcomes, not process. Testimonials and case studies are essential. Make the ROI obvious — show the math.`,
    websiteHeroFocus: "Lead with the specific outcome you deliver and the type of client you serve best.",
    primaryChannels: ["LinkedIn", "Cold email", "Referrals", "Twitter/X", "Niche communities", "Podcast appearances"],
    launchApproach: "DM 20 ideal clients with a specific, personalized pitch. Post a case study on LinkedIn. Offer first 3 clients a pilot discount. Ask every client for a referral.",
    contentAngles: [
      "Breakdown of a client result (anonymized) with specific numbers",
      "The exact process you use to deliver the service",
      "Common mistakes clients make before hiring you",
      "What your service actually looks like day-to-day",
      "Before/after case studies with real ROI",
    ],
    shortFormPlatform: "LinkedIn",
  },

  membership: {
    id: "membership",
    label: "Membership",
    tagline: "Build a recurring community around a shared interest or goal",
    productSystemContext: `You are designing a MEMBERSHIP or COMMUNITY product. Think in terms of ongoing value delivery, community rituals, and retention. The product is the recurring experience, not a one-time purchase.`,
    deliverableInstructions: `Generate exactly 6 membership-specific deliverables:
- Community platform: [platform choice and community structure — channels, groups, formats]
- Monthly value: [what members receive every month — templates, calls, workshops, content]
- Onboarding sequence: [first 7 days new member experience — welcome, orientation, quick win]
- Monthly live event: [format of the recurring live component — AMA, workshop, hot seat]
- Content library: [the archive members build up over time — what's in it]
- Accountability system: [how members stay engaged — challenges, cohorts, check-ins]`,
    pricingGuidance: `Memberships price at $19–$99/month or $197–$997/year. Annual pricing improves cashflow. Start at $29/month, prove value, then raise. Founding member pricing creates urgency.`,
    launchTimeline: "4–6 weeks to set up community, create onboarding, and recruit founding members",
    websiteCopyStyle: `Lead with the feeling of belonging and transformation over time. Use 'imagine 90 days from now' framing. Show the community culture, not just the features.`,
    websiteHeroFocus: "Sell the transformation that happens inside the community, not the community itself.",
    primaryChannels: ["Twitter/X", "LinkedIn", "Podcast", "YouTube", "Newsletter", "Partnerships"],
    launchApproach: "Run a 'founding member' launch — 50 spots, early bird pricing, close in 7 days. Build waitlist via free content. Launch live Q&A as first community event.",
    contentAngles: [
      "Show what happens inside the community (screen recordings, member wins)",
      "The transformation members experience in 90 days",
      "Behind the scenes of running the community",
      "Specific member success story each week",
      "Content previews that tease the value inside",
    ],
    shortFormPlatform: "Twitter/X",
  },

  saas: {
    id: "saas",
    label: "SaaS",
    tagline: "Build a software tool that solves one problem extremely well",
    productSystemContext: `You are designing a SAAS PRODUCT (Software as a Service). Think in terms of core features, user journey, technical scope, and subscription economics. The MVP must be buildable by one developer in under 3 months.`,
    deliverableInstructions: `Generate exactly 6 SaaS-specific deliverables:
- Core feature set: [3–5 MVP features that solve the core problem — no extras]
- User journey: [signup → activation → aha moment → value → habit loop]
- Tech stack recommendation: [recommended stack for solo founder — Next.js/Supabase/Stripe etc.]
- Pricing tiers: [Free/Starter/Pro or Trial/Monthly/Annual — with feature gates]
- Onboarding flow: [how a new user gets to the 'aha moment' in under 5 minutes]
- Integration map: [2–3 integrations users will expect on day one]`,
    pricingGuidance: `SaaS prices at $9–$49/month for prosumer tools, $49–$299/month for B2B. Annual pricing at 2 months free. Start with one tier, add tiers only when needed. Freemium works if activation is fast.`,
    launchTimeline: "8–16 weeks for MVP development and launch",
    websiteCopyStyle: `Use a product-led landing page. Show the product immediately (screenshot or demo video above the fold). Lead with the time/money saved. Feature comparison against existing alternatives.`,
    websiteHeroFocus: "Show the product in the hero. Lead with what it does in one line. Show the dashboard, not an illustration.",
    primaryChannels: ["ProductHunt", "Hacker News", "Reddit", "Twitter/X", "LinkedIn", "SEO"],
    launchApproach: "Soft launch with 50 beta users. Fix critical bugs. Then launch on ProductHunt (Tuesday), post on HackerNews 'Show HN', and DM every person who engaged with build-in-public content.",
    contentAngles: [
      "Build in public: weekly progress updates with metrics",
      "Before/after: workflow with vs without the tool",
      "Technical breakdown: how a key feature works",
      "User interviews: the problem as customers describe it",
      "The exact metrics that convinced you to build this",
    ],
    shortFormPlatform: "Twitter/X",
  },

  coaching: {
    id: "coaching",
    label: "Coaching",
    tagline: "Package your expertise as 1:1 or group coaching programs",
    productSystemContext: `You are designing a COACHING PROGRAM. Think in terms of transformation arc, session structure, accountability mechanisms, and client outcomes. Coaching is sold on outcomes, not hours.`,
    deliverableInstructions: `Generate exactly 6 coaching-specific deliverables:
- Signature program: [program name, duration (e.g. 90-day), session cadence (e.g. weekly 60-min calls)]
- Session framework: [how each coaching session is structured — agenda, templates, tools]
- Intake process: [application + discovery call process to qualify clients]
- Client workbook: [the accompanying workbook or exercise system clients use between sessions]
- Accountability system: [check-ins, Voxer/Slack access, homework — how you stay in touch]
- Results tracking: [how you measure and celebrate client progress and outcomes]`,
    pricingGuidance: `1:1 coaching prices at $500–$5,000/month or $2,000–$15,000 for a 90-day program. Group coaching prices at $500–$3,000 for a 6–12 week cohort. Price the transformation, not the hours.`,
    launchTimeline: "2–4 weeks to build the system and sign first client",
    websiteCopyStyle: `Use a trust-and-authority style. Lead with your specific results and client outcomes. The application process creates scarcity. Testimonials must be outcome-specific with real numbers.`,
    websiteHeroFocus: "Lead with the specific outcome you help clients achieve and the type of person you work with.",
    primaryChannels: ["LinkedIn", "Instagram", "Podcast", "YouTube", "Twitter/X", "Referrals"],
    launchApproach: "DM 10 ideal clients offering a free 30-minute diagnostic call. Post authority content for 2 weeks. Announce a 5-client pilot cohort. Fill via referrals and direct outreach.",
    contentAngles: [
      "Client transformation story with specific before/after numbers",
      "The #1 mistake your clients make (that coaching fixes)",
      "A free mini-coaching session on a common problem",
      "Day in the life of a successful client",
      "The framework or methodology that drives results",
    ],
    shortFormPlatform: "Instagram / LinkedIn",
  },

  newsletter: {
    id: "newsletter",
    label: "Newsletter",
    tagline: "Build an audience by delivering consistent value to their inbox",
    productSystemContext: `You are designing a PAID or SPONSORED NEWSLETTER business. Think in terms of issue format, content consistency, monetization model (ads, paid tier, or product upsell), and growth mechanics.`,
    deliverableInstructions: `Generate exactly 6 newsletter-specific deliverables:
- Issue format: [exact structure of each issue — sections, length, format, frequency]
- Content calendar: [the repeating content framework — what runs Monday, Wednesday, Friday or weekly]
- Issue #1 draft: [working title, key section headlines, and hook sentence for the first issue]
- Monetization structure: [ad slots, paid tier, affiliate, or own-product upsell — with realistic CPMs]
- Growth strategy: [referral program, lead magnet, cross-promotion, social flywheel]
- Tech stack: [recommended platform — Beehiiv/Substack/ConvertKit — with reason]`,
    pricingGuidance: `Newsletter monetization: sponsored issues ($50–$5,000/issue based on list size), paid tier ($7–$29/month), or product/course upsell. At 1,000 subscribers a $500/issue ad rate is realistic.`,
    launchTimeline: "1–2 weeks to set up and send issue #1",
    websiteCopyStyle: `Use a crisp, editorial landing page. Lead with the specific reader you serve and the value they get per issue. Show a sample issue above the fold. Subscriber count + recent issues as social proof.`,
    websiteHeroFocus: "Lead with 'Every [frequency], I send [audience] [specific type of value].' Show a sample issue preview.",
    primaryChannels: ["Twitter/X", "LinkedIn", "Beehiiv/Substack discovery", "Cross-promotions", "Podcast", "SEO"],
    launchApproach: "Write 3 issues before launch. Build a waitlist. Post the first issue publicly. Set up a referral program. Do cross-promos with 3 complementary newsletters in the first month.",
    contentAngles: [
      "Sample issue: post the best insight from your last edition",
      "Why you started the newsletter and who it's for",
      "A specific insight that surprised you while researching",
      "Behind the scenes of how you research each issue",
      "Subscriber milestone celebration with preview of what's coming",
    ],
    shortFormPlatform: "Twitter/X",
  },

  open: {
    id: "open",
    label: "Open",
    tagline: "LaunchForge will determine the best format based on your idea",
    productSystemContext: `Design the most appropriate product for this founder's idea and the market opportunity. Choose the product format (course, SaaS, service, template, newsletter, etc.) that maximizes their chance of success given their skills and the market.`,
    deliverableInstructions: `Generate 6 deliverables appropriate for the product format you've selected. Make each deliverable specific, concrete, and actionable — something the founder can actually build or create.`,
    pricingGuidance: `Choose a pricing model appropriate to the product type you've designed. Justify the price relative to the value delivered and the competitive landscape.`,
    launchTimeline: "Estimate based on the product type you selected",
    websiteCopyStyle: `Write copy appropriate to the product type you've designed. Match the tone and structure to what converts for that category.`,
    websiteHeroFocus: "Lead with the primary transformation or outcome the product delivers.",
    primaryChannels: ["Twitter/X", "LinkedIn", "Relevant communities", "Content marketing"],
    launchApproach: "Use the most appropriate launch strategy for the product type selected.",
    contentAngles: [
      "Show the problem being solved",
      "Demonstrate the solution in action",
      "Share customer or user results",
      "Explain the process or methodology",
      "Provide free value related to the product",
    ],
    shortFormPlatform: "Twitter/X",
  },
};

/** Get config for a given businessType string — falls back to 'open' */
export function getBusinessTypeConfig(businessType: string): BusinessTypeConfig {
  return (
    BUSINESS_TYPE_CONFIGS[businessType as BusinessTypeId] ??
    BUSINESS_TYPE_CONFIGS.open
  );
}
