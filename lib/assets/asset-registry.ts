/**
 * Asset Registry
 *
 * Single source of truth for every asset pack.
 * Maps business types → packs → asset definitions.
 *
 * Usage:
 *   getPackForCategory("agency-service")  → AgencyPack
 *   getPackForBusinessType("content")     → CreatorPack
 *   getAssetDefinition("ebook-pack", "ebook-pack.ebook-doc")
 */

import type { AssetType, ProductCategory } from "./types";

// ── Identifiers ───────────────────────────────────────────────────────────────

export type AssetPackId =
  | "study-guide-pack"
  | "ebook-pack"
  | "notion-pack"
  | "agency-pack"
  | "creator-pack";

// ── Core shapes ───────────────────────────────────────────────────────────────

export interface AssetDefinition {
  /** Globally unique. Format: "{pack-id}.{asset-slug}" */
  id: string;
  name: string;
  type: AssetType;
  description: string;
  estimatedWordCount: number;
  /** Derived from estimatedWordCount / 250 — stored explicitly for display. */
  estimatedPages: number;
}

export interface AssetPack {
  id: AssetPackId;
  name: string;
  /** One-line description shown in the UI. */
  description: string;
  assets: AssetDefinition[];
}

// ── 1. Study Guide Pack ───────────────────────────────────────────────────────

const STUDY_GUIDE_PACK: AssetPack = {
  id: "study-guide-pack",
  name: "Study Guide Pack",
  description: "A complete learning system — guide, flashcards, quiz, answer key, and cheat sheet.",
  assets: [
    {
      id: "study-guide-pack.study-guide",
      name: "Study Guide",
      type: "study-guide-doc",
      description: "Full structured guide with lessons, objectives, and application exercises.",
      estimatedWordCount: 3200,
      estimatedPages: 13,
    },
    {
      id: "study-guide-pack.flashcards",
      name: "Flashcard Deck",
      type: "flashcard-deck",
      description: "20 Q&A flashcards covering core concepts — formatted for Anki import.",
      estimatedWordCount: 900,
      estimatedPages: 4,
    },
    {
      id: "study-guide-pack.quiz",
      name: "Quiz",
      type: "quiz",
      description: "10-question multiple-choice quiz with explanations for every answer.",
      estimatedWordCount: 700,
      estimatedPages: 3,
    },
    {
      id: "study-guide-pack.answer-key",
      name: "Answer Key",
      type: "answer-key",
      description: "Concise answer key with scoring rubric and guidance for edge cases.",
      estimatedWordCount: 400,
      estimatedPages: 2,
    },
    {
      id: "study-guide-pack.cheat-sheet",
      name: "Cheat Sheet",
      type: "cheat-sheet",
      description: "Single-page quick-reference of the most important concepts and formulas.",
      estimatedWordCount: 300,
      estimatedPages: 1,
    },
  ],
};

// ── 2. Ebook Pack ─────────────────────────────────────────────────────────────

const EBOOK_PACK: AssetPack = {
  id: "ebook-pack",
  name: "Ebook Pack",
  description: "A complete publishing kit — full ebook plus landing page, email, upsell, and FAQ.",
  assets: [
    {
      id: "ebook-pack.ebook-doc",
      name: "Ebook",
      type: "ebook-doc",
      description: "Full-length ebook with table of contents, chapters, and resource appendix.",
      estimatedWordCount: 8500,
      estimatedPages: 34,
    },
    {
      id: "ebook-pack.landing-page",
      name: "Landing Page",
      type: "landing-page",
      description: "Conversion-optimized sales page: headline, benefits, proof, and CTA.",
      estimatedWordCount: 850,
      estimatedPages: 3,
    },
    {
      id: "ebook-pack.sales-email",
      name: "Sales Email",
      type: "sales-email",
      description: "5-email launch sequence: announcement, value, urgency, objection, close.",
      estimatedWordCount: 650,
      estimatedPages: 3,
    },
    {
      id: "ebook-pack.upsell-offer",
      name: "Upsell Offer",
      type: "upsell-offer",
      description: "One-click upsell copy for a premium tier, bundle, or companion product.",
      estimatedWordCount: 450,
      estimatedPages: 2,
    },
    {
      id: "ebook-pack.faq",
      name: "FAQ",
      type: "faq-doc",
      description: "10 pre-purchase objections answered — ready to paste onto a sales page.",
      estimatedWordCount: 750,
      estimatedPages: 3,
    },
  ],
};

// ── 3. Notion Pack ────────────────────────────────────────────────────────────

const NOTION_PACK: AssetPack = {
  id: "notion-pack",
  name: "Notion Pack",
  description: "A complete Notion product — workspace structure, databases, dashboard, setup guide, and sales page.",
  assets: [
    {
      id: "notion-pack.workspace-structure",
      name: "Workspace Structure",
      type: "workspace-structure",
      description: "Full page hierarchy, navigation map, and naming conventions for the system.",
      estimatedWordCount: 1200,
      estimatedPages: 5,
    },
    {
      id: "notion-pack.database-templates",
      name: "Database Templates",
      type: "database-schema",
      description: "Schema definitions for all databases: properties, types, relations, and rollups.",
      estimatedWordCount: 1100,
      estimatedPages: 4,
    },
    {
      id: "notion-pack.dashboard-layout",
      name: "Dashboard Layout",
      type: "dashboard-layout",
      description: "Home page structure with embedded views, quick links, and daily workflow.",
      estimatedWordCount: 850,
      estimatedPages: 3,
    },
    {
      id: "notion-pack.setup-guide",
      name: "Setup Guide",
      type: "setup-guide",
      description: "Step-by-step buyer onboarding: duplicate template, configure, and launch.",
      estimatedWordCount: 650,
      estimatedPages: 3,
    },
    {
      id: "notion-pack.sales-page",
      name: "Sales Page",
      type: "sales-page",
      description: "Gumroad-ready sales page with features, screenshots guidance, and pricing.",
      estimatedWordCount: 750,
      estimatedPages: 3,
    },
  ],
};

// ── 4. Agency Pack ────────────────────────────────────────────────────────────

const AGENCY_PACK: AssetPack = {
  id: "agency-pack",
  name: "Agency Pack",
  description: "Everything needed to sign and serve clients — proposal, SOP, workflow, outreach, and sales page.",
  assets: [
    {
      id: "agency-pack.proposal-template",
      name: "Proposal Template",
      type: "proposal-template",
      description: "Full client proposal: executive summary, scope, timeline, pricing, and terms.",
      estimatedWordCount: 1600,
      estimatedPages: 6,
    },
    {
      id: "agency-pack.onboarding-sop",
      name: "Onboarding SOP",
      type: "onboarding-sop",
      description: "Standard operating procedure for client onboarding from contract to kickoff.",
      estimatedWordCount: 1300,
      estimatedPages: 5,
    },
    {
      id: "agency-pack.client-workflow",
      name: "Client Workflow",
      type: "client-workflow",
      description: "End-to-end delivery process: discovery, execution, review, and offboarding.",
      estimatedWordCount: 900,
      estimatedPages: 4,
    },
    {
      id: "agency-pack.outreach-scripts",
      name: "Outreach Scripts",
      type: "outreach-script",
      description: "Cold email, LinkedIn DM, and follow-up sequence — 6 templates total.",
      estimatedWordCount: 650,
      estimatedPages: 3,
    },
    {
      id: "agency-pack.sales-page",
      name: "Sales Page",
      type: "agency-sales-page",
      description: "Service sales page: problem, process, outcomes, proof, and pricing.",
      estimatedWordCount: 800,
      estimatedPages: 3,
    },
  ],
};

// ── 5. Creator Pack ───────────────────────────────────────────────────────────

const CREATOR_PACK: AssetPack = {
  id: "creator-pack",
  name: "Creator Pack",
  description: "Build a monetizable creator business — content calendar, brand guide, hooks, pitch, and media kit.",
  assets: [
    {
      id: "creator-pack.content-calendar",
      name: "Content Calendar",
      type: "content-calendar",
      description: "30-day content plan with platform, format, hook, and goal for every post.",
      estimatedWordCount: 1100,
      estimatedPages: 4,
    },
    {
      id: "creator-pack.brand-guide",
      name: "Brand Guide",
      type: "brand-guide",
      description: "Voice, tone, visual direction, and positioning — everything a team needs to stay on-brand.",
      estimatedWordCount: 900,
      estimatedPages: 4,
    },
    {
      id: "creator-pack.hook-library",
      name: "Hook Library",
      type: "hook-library",
      description: "30+ proven opening hooks organized by content type, platform, and emotion.",
      estimatedWordCount: 650,
      estimatedPages: 3,
    },
    {
      id: "creator-pack.sponsorship-pitch",
      name: "Sponsorship Pitch",
      type: "sponsorship-pitch",
      description: "Outreach email and one-page pitch deck template for brand partnerships.",
      estimatedWordCount: 550,
      estimatedPages: 2,
    },
    {
      id: "creator-pack.media-kit",
      name: "Media Kit",
      type: "media-kit",
      description: "About, audience demographics, platform stats, rates, and past partnerships.",
      estimatedWordCount: 650,
      estimatedPages: 3,
    },
  ],
};

// ── Registry index ────────────────────────────────────────────────────────────

export const ASSET_PACKS: Record<AssetPackId, AssetPack> = {
  "study-guide-pack": STUDY_GUIDE_PACK,
  "ebook-pack":       EBOOK_PACK,
  "notion-pack":      NOTION_PACK,
  "agency-pack":      AGENCY_PACK,
  "creator-pack":     CREATOR_PACK,
};

// ── Business type → pack mapping ──────────────────────────────────────────────

/**
 * Maps internal ProductCategory (from the generation pipeline) to an AssetPackId.
 * Used after a generation completes to know which pack to generate.
 */
export const PACK_FOR_CATEGORY: Record<ProductCategory, AssetPackId> = {
  "study-guide":   "study-guide-pack",
  "ebook":         "ebook-pack",
  "course":        "study-guide-pack", // courses are closest to study guides
  "notion-system": "notion-pack",
  "agency-service":"agency-pack",
  "creator":       "creator-pack",
  "newsletter":    "creator-pack",     // newsletters are a creator product
  "saas":          "ebook-pack",       // SaaS uses ebook pack for docs/marketing
  "generic":       "ebook-pack",       // sensible default
};

/**
 * Maps the raw businessType form value to an AssetPackId.
 * Used when product category detection hasn't run yet (e.g., UI previews).
 */
export const PACK_FOR_BUSINESS_TYPE: Record<string, AssetPackId> = {
  "saas":                 "ebook-pack",
  "digital-product":      "ebook-pack",
  "productized-service":  "agency-pack",
  "content":              "creator-pack",
  "agency":               "agency-pack",
  "ecommerce":            "ebook-pack",
  "open":                 "ebook-pack",
};

// ── Helper functions ──────────────────────────────────────────────────────────

/** Returns the full AssetPack for a given pack ID. */
export function getPackById(id: AssetPackId): AssetPack {
  return ASSET_PACKS[id];
}

/** Returns the AssetPack mapped to a ProductCategory. */
export function getPackForCategory(category: ProductCategory): AssetPack {
  return ASSET_PACKS[PACK_FOR_CATEGORY[category]];
}

/**
 * Returns the AssetPack for a businessType form value.
 * Falls back to the ebook pack if the type is unrecognized.
 */
export function getPackForBusinessType(businessType: string): AssetPack {
  const packId = PACK_FOR_BUSINESS_TYPE[businessType] ?? "ebook-pack";
  return ASSET_PACKS[packId];
}

/**
 * Looks up a single AssetDefinition by pack ID and asset ID.
 * Returns undefined if either the pack or asset doesn't exist.
 */
export function getAssetDefinition(
  packId: AssetPackId,
  assetId: string,
): AssetDefinition | undefined {
  return ASSET_PACKS[packId]?.assets.find((a) => a.id === assetId);
}

/**
 * Returns every AssetDefinition across all packs — useful for search or bulk operations.
 */
export function getAllAssetDefinitions(): AssetDefinition[] {
  return Object.values(ASSET_PACKS).flatMap((pack) => pack.assets);
}

/**
 * Returns all packs as a flat array — useful for rendering a picker UI.
 */
export function getAllPacks(): AssetPack[] {
  return Object.values(ASSET_PACKS);
}

/**
 * Derives the pack for a generation based on category, falling back to businessType.
 * This is the canonical lookup used by the generation pipeline.
 */
export function resolvePackForGeneration(
  category: ProductCategory,
  businessType: string,
): AssetPack {
  // Category takes precedence (it's more specific)
  if (category !== "generic") {
    return getPackForCategory(category);
  }
  return getPackForBusinessType(businessType);
}
