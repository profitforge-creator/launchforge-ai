// Core business generation types — shared across UI and generation pipeline

export type { GeneratedAsset, AssetSet, AssetType, ExportFormat, ProductCategory } from "@/lib/assets/types";

export interface BusinessFormData {
  interests: string;
  skills: string;
  timePerWeek: string;
  incomeGoal: string;
  businessType: string;
}

export interface OpportunityScore {
  overall: number;
  demand: number;
  monetization: number;   // how easily this market pays
  competition: number;    // lower = less competition (better)
  difficulty: number;     // lower = easier to build (better)
  category: ScoreCategory;
}

export type ScoreCategory = "Exceptional" | "Strong" | "Good" | "Moderate" | "Weak";

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
  assets?: import("@/lib/assets/types").AssetSet; // undefined for legacy records seeded before this feature
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  niche: string;
  overallScore: number;
  businessType: string;
  productName: string;
  status: "completed" | "draft";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "team";
  generationsUsed: number;
  generationsLimit: number;
  joinedAt: string;
}
