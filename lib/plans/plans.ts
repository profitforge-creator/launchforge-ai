// Plan metadata + helpers (pure, safe to import anywhere).
// Entitlement numbers live in SUBSCRIPTION_LIMITS (types/index.ts) — the single
// source of truth shared with the rate limiter and gating logic.
import type { SubscriptionTier } from "@/types";
import { SUBSCRIPTION_LIMITS } from "@/types";

export const PLAN_ORDER: SubscriptionTier[] = ["free", "starter", "growth", "scale"];

export const PLAN_META: Record<SubscriptionTier, { label: string; price: string; blurb: string }> = {
  free:    { label: "Free",    price: "$0",   blurb: "Preview only — see what's possible" },
  starter: { label: "Starter", price: "$19",  blurb: "Launch your first real business" },
  growth:  { label: "Growth",  price: "$49",  blurb: "Ship multiple products + integrations" },
  scale:   { label: "Scale",   price: "$149", blurb: "Unlimited output for teams" },
};

export function nextTier(tier: SubscriptionTier): SubscriptionTier | null {
  const i = PLAN_ORDER.indexOf(tier);
  return i >= 0 && i < PLAN_ORDER.length - 1 ? PLAN_ORDER[i + 1] : null;
}

export function planLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_LIMITS[tier];
}
