// Asset Generation types
// All generated deliverables conform to this shape regardless of product type.

export type AssetType =
  // Ebook / Guide
  | "table-of-contents"
  | "introduction"
  | "chapter"
  | "sample-pages"
  | "resource-list"
  // Course / Study Guide
  | "lesson-outline"
  | "flashcard-deck"
  | "quiz"
  | "worksheet"
  // Agency / Service
  | "proposal-template"
  | "onboarding-checklist"
  | "sop-document"
  | "outreach-script"
  | "client-workflow"
  // Notion / System
  | "database-schema"
  | "page-template"
  | "workflow-template"
  // Generic
  | "overview-document"
  | "quick-start-guide"
  | "faq-template";

export type ExportFormat = "markdown" | "json" | "pdf" | "docx";

export type ProductCategory =
  | "ebook"
  | "study-guide"
  | "notion-system"
  | "agency-service"
  | "course"
  | "newsletter"
  | "saas"
  | "generic";

export interface GeneratedAsset {
  id: string;
  name: string;
  type: AssetType;
  category: string;       // human-readable group: "Content", "Structure", "Templates", etc.
  description: string;    // one-line summary shown on the card
  content: string;        // full content in markdown — this is what gets exported
  wordCount: number;
  estimatedPages: number; // rough estimate: wordCount / 250
  // AI INTEGRATION POINT: add generatedByAI: boolean; modelUsed?: string;
}

export interface AssetSet {
  productCategory: ProductCategory;
  assets: GeneratedAsset[];
  generatedAt: string;
}
