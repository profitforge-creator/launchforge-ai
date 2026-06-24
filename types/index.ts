// Core business generation types — shared across UI and generation pipeline

export type { GeneratedAsset, AssetSet, AssetType, ExportFormat, ProductCategory } from "@/lib/assets/types";

// ── Subscription ──────────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "starter" | "growth" | "scale";

export interface SubscriptionLimits {
  projectsPerMonth: number;   // -1 = unlimited
  aiEditsPerProject: number;  // -1 = unlimited
  websiteGeneration: boolean; // full website + source code
  exportAll: boolean;         // ZIP export + deploys
  integrations: boolean;      // connect GitHub/Vercel/Stripe/social
  analytics: boolean;         // analytics + lead tools
}

// Single source of truth for plan entitlements. Mirrors the pricing page.
//   free   $0   — a teaser: 1 idea preview/month, no full build/export/integrations
//   starter $19 — 10 full businesses, website+code, export, deploys
//   growth  $49 — 50 businesses, all integrations + analytics
//   scale   $149 — unlimited
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free:    { projectsPerMonth: 1,  aiEditsPerProject: 3,   websiteGeneration: false, exportAll: false, integrations: false, analytics: false },
  starter: { projectsPerMonth: 10, aiEditsPerProject: 30,  websiteGeneration: true,  exportAll: true,  integrations: false, analytics: false },
  growth:  { projectsPerMonth: 50, aiEditsPerProject: 100, websiteGeneration: true,  exportAll: true,  integrations: true,  analytics: true  },
  scale:   { projectsPerMonth: -1, aiEditsPerProject: -1,  websiteGeneration: true,  exportAll: true,  integrations: true,  analytics: true  },
};

// ── Project File System ───────────────────────────────────────────────────────

export type FileLanguage = "typescript" | "markdown" | "json" | "css" | "text";

export interface ProjectFile {
  path: string;           // e.g., "/website/app/page.tsx"
  name: string;           // e.g., "page.tsx"
  folder: string;         // top-level folder: "website", "marketing", etc.
  /** Subfolder within folder, e.g., "app" or "app/pricing" */
  subfolder?: string;
  content: string;        // full file content
  language: FileLanguage;
  generatedAt: string;
}

// ── Input ─────────────────────────────────────────────────────────────────────

export interface BusinessFormData {
  /** Free-form idea: "I like anime", "I need $1000/month", "I love fitness" */
  idea: string;
  // Derived fields (kept for backward compat with agent prompts):
  interests: string;
  skills: string;
  timePerWeek: string;
  incomeGoal: string;
  businessType: string;
}

// ── Opportunity scoring ───────────────────────────────────────────────────────

export interface OpportunityScore {
  overall: number;
  demand: number;
  monetization: number;
  competition: number;  // lower raw = less competition (better)
  difficulty: number;   // lower raw = easier to build (better)
  category: ScoreCategory;
}

export type ScoreCategory = "Exceptional" | "Strong" | "Good" | "Moderate" | "Weak";

// ── Research / competitors ────────────────────────────────────────────────────

export interface Competitor {
  id: string;
  name: string;
  url: string;
  monthlyRevenue: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductConcept {
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
  deliverables: string[];
  pricingModel: string;
  suggestedPrice: string;
  timeToLaunch: string;
}

// ── Marketing ─────────────────────────────────────────────────────────────────

export interface MarketingPlan {
  tiktokHooks: string[];
  contentIdeas: ContentIdea[];
  contentPillars: string[];
  launchStrategy: LaunchPhase[];
  contentCalendar: CalendarEntry[];
}

export interface ContentIdea {
  platform: string;
  format: string;
  title: string;
  hook: string;
}

export interface LaunchPhase {
  phase: string;
  duration: string;
  actions: string[];
  goal: string;
}

export interface CalendarEntry {
  week: number;
  platform: string;
  content: string;
  goal: string;
}

export interface Recommendation {
  type: "improvement" | "alternative" | "next-step";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

// ── Project (the main entity) ─────────────────────────────────────────────────

export interface BusinessResult {
  id: string;
  createdAt: string;
  formData: BusinessFormData;
  scores: OpportunityScore;
  competitors: Competitor[];
  product: ProductConcept;
  marketing: MarketingPlan;
  recommendations: Recommendation[];
  summary: string;
  niche: string;
  marketGaps: string[];
  assets?: import("@/lib/assets/types").AssetSet;
  /** Project file system — all generated files organized by folder */
  projectFiles?: ProjectFile[];
  /** AI INTEGRATION POINT: usage tracking per project */
  aiEditsUsed?: number;
  /** Persisted chat history — capped at 50 messages to bound storage */
  chatMessages?: import("@/lib/conversation/types").PersistedChatMessage[];
}

// ── AI file modification ──────────────────────────────────────────────────────

export interface FileUpdate {
  path: string;
  content: string;
  description: string;  // human-readable summary, e.g. "Updated hero headline for students"
}

// ── History / sidebar ─────────────────────────────────────────────────────────

export interface HistoryRecord {
  id: string;
  createdAt: string;
  niche: string;
  overallScore: number;
  businessType: string;
  productName: string;
  status: "completed" | "draft";
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionTier;
  generationsUsed: number;
  generationsLimit: number;
  joinedAt: string;
}
