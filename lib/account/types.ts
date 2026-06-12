export type PlanTier = "trial" | "starter" | "pro" | "enterprise";

export interface TrialInfo {
  startedAt: string;
  endsAt: string;
  daysRemaining: number;
  expired: boolean;
}

export interface PlanLimits {
  projectsPerMonth: number;   // -1 = unlimited
  generationsPerMonth: number;
  deployments: boolean;
  analytics: boolean;
  aiAdvisor: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  trial:      { projectsPerMonth: -1,  generationsPerMonth: -1,  deployments: true,  analytics: true,  aiAdvisor: true,  prioritySupport: false },
  starter:    { projectsPerMonth: 10,  generationsPerMonth: 50,  deployments: false, analytics: false, aiAdvisor: true,  prioritySupport: false },
  pro:        { projectsPerMonth: -1,  generationsPerMonth: -1,  deployments: true,  analytics: true,  aiAdvisor: true,  prioritySupport: true  },
  enterprise: { projectsPerMonth: -1,  generationsPerMonth: -1,  deployments: true,  analytics: true,  aiAdvisor: true,  prioritySupport: true  },
};

export const PLAN_PRICES: Record<PlanTier, string> = {
  trial:      "Free",
  starter:    "$29 / mo",
  pro:        "$79 / mo",
  enterprise: "Custom",
};

export type ServiceId = "github" | "vercel" | "stripe" | "supabase";

export interface ConnectedService {
  id: ServiceId;
  label: string;
  description: string;
  status: "connected" | "disconnected";
}

export const DEFAULT_SERVICES: ConnectedService[] = [
  { id: "github",   label: "GitHub",   description: "Source control and deployment triggers", status: "disconnected" },
  { id: "vercel",   label: "Vercel",   description: "One-click website deployment",           status: "disconnected" },
  { id: "stripe",   label: "Stripe",   description: "Payment and subscription management",    status: "disconnected" },
  { id: "supabase", label: "Supabase", description: "Database and authentication",            status: "disconnected" },
];
