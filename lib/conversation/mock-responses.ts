// Mock response generator for the workspace conversation panel.
// Responses reference actual business context and can return FileUpdate[] to edit files directly.
// AI INTEGRATION POINT: replace with geminiJSON call using CONVERSATION_SYSTEM_PROMPT.

import type { BusinessResult, FileUpdate } from "@/types";

interface ConversationResponse {
  response: string;
  fileUpdates: FileUpdate[];
}

interface ResponseMatch {
  pattern: RegExp;
  generate: (msg: string, ctx: BusinessResult) => ConversationResponse;
}

function noUpdates(response: string): ConversationResponse {
  return { response, fileUpdates: [] };
}

// Generates a realistic updated homepage TSX when the user asks for conversion improvements
function makeHomepageUpdate(ctx: BusinessResult): FileUpdate | null {
  const homepage = ctx.projectFiles?.find((f) => f.path === "/website/app/page.tsx");
  if (!homepage) return null;

  // Inject a stronger hero headline + urgency banner — minimal diff to signal the pattern
  const updated = homepage.content
    .replace(
      /\/\* ── Hero ── \*\//,
      "/* ── Hero (conversion-optimized) ── */",
    )
    .replace(
      /<div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500\/10 border border-blue-500\/20 rounded-full px-3 py-1 mb-6">/,
      `<div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">`,
    );

  if (updated === homepage.content) return null; // nothing changed, skip
  return { path: "/website/app/page.tsx", content: updated, description: "Improved homepage conversion rate" };
}

const MATCHERS: ResponseMatch[] = [
  {
    pattern: /profit|revenue|money|monetiz|earn more|higher price|upsell/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `Three ways to increase revenue for **${ctx.product.name}**:\n\n` +
        `1. **Add a premium tier at 2–3x the current price** (${ctx.product.suggestedPrice}) with done-for-you implementation. ` +
        `${ctx.product.targetAudience.split(" ").slice(0, 6).join(" ")} will pay significantly more for execution over information.\n\n` +
        `2. **Bundle a 90-day support retainer** — add $97–$197/month for ongoing Q&A access. This alone can double LTV.\n\n` +
        `3. **Create a referral incentive.** Offer 20% commission to existing customers. In the ${ctx.niche} space, peer referrals convert at 3–5x cold traffic.\n\n` +
        `Which direction should we develop further?`,
      ),
  },
  {
    pattern: /student|college|university|younger|gen z|beginner/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `Reframing **${ctx.product.name}** for students:\n\n` +
        `Students are price-sensitive but time-rich — here's how to serve them profitably without cannibilizing your main segment:\n\n` +
        `- Create a "Student Edition" at 40–50% off, gated with a .edu email or enrollment verification\n` +
        `- Partner with 2–3 university entrepreneurship clubs for cohort licensing ($500–$2K/semester)\n` +
        `- Add a completion certificate — students share credentials, which generates organic distribution\n\n` +
        `**Caution:** students have lower LTV and churn faster. Recommend keeping them as a secondary segment. ` +
        `Your primary audience (${ctx.product.targetAudience.split(" ").slice(0, 5).join(" ")}) should remain the focus.`,
      ),
  },
  {
    pattern: /homepage|hero|landing|convert|conversion|headline/i,
    generate: (_msg, ctx) => {
      const update = makeHomepageUpdate(ctx);
      const fileMsg = update
        ? `\n\n✅ **Updated \`/website/app/page.tsx\`** — hero section marked as conversion-optimized.`
        : "";
      return {
        response:
          `**Conversion improvements for ${ctx.product.name} homepage:**\n\n` +
          `1. **Hero headline** — lead with the outcome, not the product name. Replace "${ctx.product.tagline}" with a results-first statement.\n\n` +
          `2. **Social proof near the top** — move one strong testimonial above the fold. Visitors need to see it before scrolling.\n\n` +
          `3. **Single CTA** — remove the secondary "Learn more" link. Every extra option reduces conversion. One button: "Get Started Free →"\n\n` +
          `4. **Urgency signal** — add "Join [X] builders already using ${ctx.product.name}" near the CTA.` +
          fileMsg,
        fileUpdates: update ? [update] : [],
      };
    },
  },
  {
    pattern: /premium|luxury|enterprise|high.?end|white.?glove/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `**Premium version of ${ctx.product.name}** — here's the tier structure:\n\n` +
        `**Standard** — ${ctx.product.suggestedPrice}\n${ctx.product.deliverables.slice(0, 2).map((d) => `› ${d}`).join("\n")}\n\n` +
        `**Premium** — ${ctx.product.suggestedPrice.replace(/\d+/, (n) => String(Math.round(parseInt(n) * 2.5)))}\n` +
        `${ctx.product.deliverables.slice(0, 3).map((d) => `› ${d}`).join("\n")}\n` +
        `› 1-on-1 strategy session (60 min)\n` +
        `› Priority support for 90 days\n\n` +
        `**Done-For-You** — custom pricing\n` +
        `› Full implementation handled by your team\n` +
        `› Weekly calls, guaranteed outcomes\n\n` +
        `Premium tiers typically generate 60–70% of revenue from 20–30% of customers. Would you like me to draft the pricing page copy?`,
      ),
  },
  {
    pattern: /landing.?page|sales.?page|copy|headline|copy/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `**Landing page structure for ${ctx.product.name}:**\n\n` +
        `**Headline:** "${ctx.product.tagline}"\n\n` +
        `**Subheadline:** For ${ctx.product.targetAudience.split(",")[0].trim()} who want ${ctx.niche.split(" ").slice(0, 4).join(" ")} without the guesswork.\n\n` +
        `**Above the fold:** Problem statement → agitate → solution in 3 sentences\n\n` +
        `**Social proof block:** 3 results-focused testimonials (format: "[specific outcome] in [timeframe]")\n\n` +
        `**What's included:** List all ${ctx.product.deliverables.length} deliverables with benefit-focused descriptions\n\n` +
        `**CTA:** "Get ${ctx.product.name} — ${ctx.product.suggestedPrice}"\n\n` +
        `**FAQ:** Address the top 3 objections before purchase\n\n` +
        `Want me to write the full copy for any of these sections?`,
      ),
  },
  {
    pattern: /asset|deliverable|document|template|create more|generate more/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `Available assets for **${ctx.product.name}**:\n\n` +
        `${ctx.assets ? `You already have ${ctx.assets.assets.length} assets generated. Here are additional ones I can create:\n\n` : ""}` +
        `› **Email sequence** — 5-email welcome series for new customers\n` +
        `› **Social proof templates** — 10 testimonial request scripts\n` +
        `› **Content upgrade** — lead magnet to grow your email list\n` +
        `› **Affiliate brief** — onboarding doc for referral partners\n` +
        `› **Launch announcement** — press release + social posts\n\n` +
        `Which would be most valuable right now? Type "generate [asset name]" and I'll build it.`,
      ),
  },
  {
    pattern: /competitor|competition|differentiat|stand out|unique/i,
    generate: (_msg, ctx) => {
      const comp = ctx.competitors[0];
      return noUpdates(
        `**Differentiation strategy against ${comp ? comp.name : "competitors"} in ${ctx.niche}:**\n\n` +
        `${comp ? `${comp.name}'s main weaknesses: ${comp.weaknesses.slice(0, 2).join(", ")}\n\n` : ""}` +
        `Your three sharpest differentiation angles:\n\n` +
        `1. **Specificity** — they serve everyone; you serve ${ctx.product.targetAudience.split(" ").slice(0, 4).join(" ")} exclusively. Specificity commands premium pricing.\n\n` +
        `2. **Outcome guarantee** — if ${comp ? comp.name : "competitors"} offer no guarantee, you should. "See results in 30 days or get a full refund" removes the primary purchase objection.\n\n` +
        `3. **Community** — add a private community to ${ctx.product.name}. Competitors sell products; you sell belonging. Community increases LTV by 2–4x.\n\n` +
        `Want me to draft your positioning statement and competitive comparison page?`,
      );
    },
  },
  {
    pattern: /audience|customer|target|who|niche down|niche specific/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `**Audience refinement for ${ctx.product.name}:**\n\n` +
        `Current positioning: ${ctx.product.targetAudience}\n\n` +
        `Three ways to sharpen your audience and increase conversion:\n\n` +
        `1. **Go tighter on demographics** — instead of "${ctx.product.targetAudience.split(" ").slice(0, 3).join(" ")}", try "first-time founders under 35 with < $10K to invest". Specificity reduces competition and increases willingness-to-pay.\n\n` +
        `2. **Go tighter on the problem** — identify the exact moment they realize they need this. What just happened in their life? That's your ad hook.\n\n` +
        `3. **Find where they concentrate** — ${ctx.niche} audiences typically congregate in 2–3 specific communities. Dominating one beats dabbling in five.\n\n` +
        `Which segment feels most aligned with where your skills are strongest?`,
      ),
  },
  {
    pattern: /launch|release|ship|go live|start selling/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `**Launch plan for ${ctx.product.name}:**\n\n` +
        `**Week 1–2: Pre-launch**\n` +
        `› Post 3 pieces of value content per day in your target communities\n` +
        `› DM 20 potential customers. Goal: 5 validation calls. Not selling — learning.\n` +
        `› Set up waitlist page (single field: email). Offer early-bird pricing.\n\n` +
        `**Week 3: Soft launch**\n` +
        `› Email waitlist with exclusive early pricing (${ctx.product.suggestedPrice} → 40% off)\n` +
        `› Close first 10 customers at discount in exchange for testimonials\n` +
        `› Fix anything that breaks\n\n` +
        `**Week 4: Public launch**\n` +
        `› Full pricing live (${ctx.product.suggestedPrice})\n` +
        `› Publish testimonials from beta customers\n` +
        `› Activate referral program\n\n` +
        `Target: 10 customers before spending any money on ads. Paid traffic is a multiplier, not a solution.`,
      ),
  },
  {
    pattern: /price|pricing|charge|cost|how much|expensive|cheap/i,
    generate: (_msg, ctx) =>
      noUpdates(
        `**Pricing analysis for ${ctx.product.name}:**\n\n` +
        `Current suggested price: ${ctx.product.suggestedPrice} (${ctx.product.pricingModel})\n\n` +
        `**The right price isn't the lowest price — it's the price that best signals the value delivered.**\n\n` +
        `Signals that support higher pricing in ${ctx.niche}:\n` +
        `› Monetization score: ${ctx.scores.monetization}/100 — this market has demonstrated willingness to pay\n` +
        `› Competitor pricing: ${ctx.competitors[0]?.pricing ?? "comparable to market"}\n\n` +
        `**Test recommendation:** run two checkout pages at ${ctx.product.suggestedPrice} and ${ctx.product.suggestedPrice.replace(/\d+/, (n) => String(Math.round(parseInt(n) * 1.6)))} simultaneously. ` +
        `Many founders discover the higher price converts equally well — customers perceive higher price as higher quality in this space.`,
      ),
  },
];

const FALLBACK_RESPONSES = [
  (ctx: BusinessResult): ConversationResponse =>
    noUpdates(
      `Looking at **${ctx.product.name}** in the ${ctx.niche} space:\n\n` +
      `Your opportunity score of ${ctx.scores.overall} (${ctx.scores.category}) reflects strong demand fundamentals. ` +
      `The biggest lever available is ${ctx.scores.demand > ctx.scores.monetization ? "monetization — the demand is there but the pricing strategy isn't maximized" : "distribution — the market pays well but reaching it at scale is the challenge"}.\n\n` +
      `What aspect of this business would you like to develop further? I can help with pricing, positioning, launch strategy, content, or generating additional assets.`,
    ),
  (ctx: BusinessResult): ConversationResponse =>
    noUpdates(
      `**${ctx.product.name}** has solid bones. Here's what I'd focus on next:\n\n` +
      `The market gap most worth exploiting: "${ctx.marketGaps[0] ?? "underserved segment within your niche"}"\n\n` +
      `None of your ${ctx.competitors.length} competitors are addressing this well. If you position ${ctx.product.name} explicitly around this gap in your headline and first paragraph, you'll stand out immediately.\n\n` +
      `Would you like me to rewrite the positioning around that gap?`,
    ),
];

export function generateConversationResponse(
  userMessage: string,
  context: BusinessResult,
): ConversationResponse {
  for (const matcher of MATCHERS) {
    if (matcher.pattern.test(userMessage)) {
      return matcher.generate(userMessage, context);
    }
  }
  const idx = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[idx](context);
}
