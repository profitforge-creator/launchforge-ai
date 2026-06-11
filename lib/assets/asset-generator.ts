// Asset generator — detects product category and dispatches to the right mock generator.
// AI INTEGRATION POINT: Replace mock generators with geminiJSON calls.
// Function signatures stay the same — the orchestrator and UI are unaffected.

import type { GeneratedAsset, ProductCategory, AssetSet } from "./types";
import type { ProductAgentOutput, ResearchAgentOutput } from "@/lib/types/agents";
import type { BusinessFormData } from "@/types";
import {
  generateEbookAssets,
  generateStudyGuideAssets,
  generateAgencyAssets,
  generateNotionAssets,
  generateGenericAssets,
} from "./mock-content";

// ── Product category detection ────────────────────────────────────────────────

export function detectProductCategory(
  product: ProductAgentOutput,
  form: BusinessFormData,
): ProductCategory {
  const combined = [
    product.productName,
    product.description,
    product.tagline,
    product.pricingModel,
    form.businessType,
    form.interests,
  ]
    .join(" ")
    .toLowerCase();

  if (
    form.businessType === "agency" ||
    /\b(agency|consulting|consultant|freelanc|service business|proposal|client work|retainer|sop)\b/.test(combined)
  )
    return "agency-service";

  if (
    /\b(notion|airtable|clickup|system|template|dashboard|database|workspace|productivity system)\b/.test(combined)
  )
    return "notion-system";

  if (
    /\b(study guide|flashcard|quiz|worksheet|lesson plan|curriculum|tutoring|exam prep|test prep)\b/.test(combined)
  )
    return "study-guide";

  if (
    /\b(course|cohort|bootcamp|training program|mastermind|workshop series|curriculum)\b/.test(combined)
  )
    return "course";

  if (
    /\b(newsletter|email list|subscriber|weekly digest|publication)\b/.test(combined)
  )
    return "newsletter";

  if (
    form.businessType === "saas" ||
    /\b(saas|software|app|platform|tool|api|subscription software)\b/.test(combined)
  )
    return "saas";

  // Digital product defaults: ebook / guide / pdf
  if (
    form.businessType === "digital-product" ||
    /\b(ebook|e-book|book|guide|handbook|playbook|blueprint|pdf|digital download)\b/.test(combined)
  )
    return "ebook";

  return "generic";
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateAssets(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  form: BusinessFormData,
): AssetSet {
  const productCategory = detectProductCategory(product, form);
  let assets: GeneratedAsset[];

  switch (productCategory) {
    case "ebook":
    case "course":  // course uses ebook structure for now; swap when course generator is ready
      assets = generateEbookAssets(product, research, form);
      break;
    case "study-guide":
      assets = generateStudyGuideAssets(product, research, form);
      break;
    case "agency-service":
      assets = generateAgencyAssets(product, research, form);
      break;
    case "notion-system":
      assets = generateNotionAssets(product, research, form);
      break;
    case "newsletter":
    case "saas":
    case "generic":
    default:
      assets = generateGenericAssets(product, research, form);
      break;
  }

  return {
    productCategory,
    assets,
    generatedAt: new Date().toISOString(),
  };
}
