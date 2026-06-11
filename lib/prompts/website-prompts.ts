/**
 * Website Agent Prompts
 *
 * Gemini generates structured website CONTENT — copy, headlines, features, FAQs.
 * The TSX template layer injects this content into React components.
 * This separation keeps the AI output clean and the UI code maintainable.
 */

import type { ProductAgentOutput, ResearchAgentOutput } from "@/lib/types/agents";

export const WEBSITE_SYSTEM_PROMPT = `You are a high-conversion copywriter who specializes in
landing pages for early-stage SaaS and digital products. You write copy that is specific,
outcome-focused, and honest. You never use generic filler phrases like "unlock your potential."

Every headline must state a concrete outcome. Every feature description must answer "so what?"
Return valid JSON only. No markdown fences.`;

export interface WebsiteContent {
  hero: {
    badge: string;             // e.g., "Now in beta · Free to start"
    headline: string;          // primary H1
    subheadline: string;       // 2–3 sentence supporting copy
    ctaPrimary: string;        // e.g., "Start Building Free →"
    ctaSecondary: string;      // e.g., "See how it works"
    socialProofLine: string;   // e.g., "Join 400+ founders who already launched"
  };
  problem: {
    headline: string;
    body: string;              // 2-sentence problem statement
  };
  features: Array<{
    icon: string;              // single emoji
    title: string;
    description: string;       // 1-2 sentence benefit-focused description
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
  }>;
  cta: {
    headline: string;
    body: string;
    buttonText: string;
  };
  pricing: {
    tagline: string;           // e.g., "Start free. Only pay when it's working."
    freeFeatures: string[];    // 4 items
    starterFeatures: string[]; // 6 items
    proFeatures: string[];     // 7 items
  };
  about: {
    origin: string;            // 2-sentence origin story
    mission: string;           // 1-sentence mission
    body: string[];            // 3 short paragraphs
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export function buildWebsitePrompt(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
): string {
  return `Write website copy for this product:

PRODUCT:
- Name: ${product.productName}
- Tagline: ${product.tagline}
- Description: ${product.description}
- Target audience: ${product.targetAudience}
- Deliverables: ${product.deliverables.join("; ")}
- Price: ${product.suggestedPrice}
- Pricing model: ${product.pricingModel}
- Time to launch: ${product.timeToLaunch}

MARKET CONTEXT:
- Niche: ${research.niche}
- Target market: ${research.targetMarket}
- Market gap we solve: ${research.marketGaps[0] ?? "underserved segment"}
- Primary competitor weakness: ${research.competitors[0]?.weaknesses[0] ?? "generic solutions"}

Write copy for all 5 pages: homepage (hero + problem + features + social proof + CTA),
pricing page, about page, FAQ page.

Return ONLY this JSON structure:
{
  "hero": {
    "badge": "short badge text",
    "headline": "outcome-focused H1 under 10 words",
    "subheadline": "2-3 sentence supporting copy",
    "ctaPrimary": "primary CTA text",
    "ctaSecondary": "secondary CTA text",
    "socialProofLine": "social proof line"
  },
  "problem": {
    "headline": "problem headline",
    "body": "2-sentence problem body"
  },
  "features": [
    { "icon": "emoji", "title": "feature title", "description": "1-2 sentence benefit description" }
  ],
  "testimonials": [
    { "quote": "realistic testimonial", "author": "First name L.", "role": "role description" }
  ],
  "cta": {
    "headline": "closing CTA headline",
    "body": "1-2 sentence CTA body",
    "buttonText": "CTA button text"
  },
  "pricing": {
    "tagline": "pricing section tagline",
    "freeFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"],
    "starterFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5", "feature 6"],
    "proFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5", "feature 6", "feature 7"]
  },
  "about": {
    "origin": "2-sentence origin story",
    "mission": "1-sentence mission statement",
    "body": ["paragraph 1", "paragraph 2", "paragraph 3"]
  },
  "faq": [
    { "question": "question", "answer": "detailed answer" }
  ]
}

Include exactly 4 features, 3 testimonials, 8 FAQ items.
All copy must be specific to ${product.productName} — no generic filler.`;
}
