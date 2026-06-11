// Asset Generation types
// All generated deliverables conform to this shape regardless of product type.

export type AssetType =
  // ── Ebook Pack ─────────────────────────────────────────────────────────────
  | "ebook-doc"
  | "landing-page"
  | "sales-email"
  | "upsell-offer"
  | "faq-doc"
  // ── Study Guide Pack ───────────────────────────────────────────────────────
  | "study-guide-doc"
  | "flashcard-deck"
  | "quiz"
  | "answer-key"
  | "cheat-sheet"
  // ── Notion Pack ────────────────────────────────────────────────────────────
  | "workspace-structure"
  | "database-schema"
  | "dashboard-layout"
  | "setup-guide"
  | "sales-page"
  // ── Agency Pack ────────────────────────────────────────────────────────────
  | "proposal-template"
  | "onboarding-sop"
  | "client-workflow"
  | "outreach-script"
  | "agency-sales-page"
  // ── Creator Pack ───────────────────────────────────────────────────────────
  | "content-calendar"
  | "brand-guide"
  | "hook-library"
  | "sponsorship-pitch"
  | "media-kit"
  // ── Legacy (generated content) ─────────────────────────────────────────────
  | "table-of-contents"
  | "introduction"
  | "chapter"
  | "sample-pages"
  | "resource-list"
  | "lesson-outline"
  | "worksheet"
  | "onboarding-checklist"
  | "sop-document"
  | "page-template"
  | "workflow-template"
  | "overview-document"
  | "quick-start-guide"
  | "faq-template";

export type ExportFormat = "markdown" | "json" | "pdf" | "docx";

export type ProductCategory =
  | "ebook"
  | "study-guide"
  | "notion-system"
  | "agency-service"
  | "creator"
  | "course"
  | "newsletter"
  | "saas"
  | "generic";

export interface AssetDownloadMetadata {
  filename: string;           // e.g., "python-automation-study-guide.md"
  primaryFormat: ExportFormat;
  mimeType: string;
  sizeEstimateKb: number;     // rough estimate: wordCount * 6 bytes / 1024
  availableFormats: ExportFormat[];
}

export interface GeneratedAsset {
  id: string;
  name: string;
  type: AssetType;
  category: string;           // human-readable group: "Content", "Structure", etc.
  description: string;        // one-line summary shown on the card
  content: string;            // full content in markdown — this is what gets exported
  wordCount: number;
  estimatedPages: number;     // wordCount / 250
  downloadMetadata?: AssetDownloadMetadata;
  // AI INTEGRATION POINT: generatedByAI?: boolean; modelUsed?: string;
}

export interface AssetSet {
  productCategory: ProductCategory;
  assets: GeneratedAsset[];
  generatedAt: string;
}
