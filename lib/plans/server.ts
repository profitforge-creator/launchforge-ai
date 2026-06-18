// Server-side plan resolution + quota enforcement, backed by Supabase.
//   - getUserPlan()       -> reads current_plan() RPC (defaults to 'free')
//   - consumeProjectQuota -> atomic monthly decrement via consume_project_quota RPC
//   - getProjectUsage()   -> current month's usage for display
//
// Stripe is not wired yet, so everyone resolves to 'free' until a row exists in
// lf_user_plans. When billing lands, the Stripe webhook upserts that table and
// this layer needs no changes.
import type { SubscriptionTier } from "@/types";
import { SUBSCRIPTION_LIMITS } from "@/types";
import { getUserSupabaseClient } from "@/lib/auth/session";

const VALID: SubscriptionTier[] = ["free", "starter", "growth", "scale"];

function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUserPlan(): Promise<SubscriptionTier> {
  try {
    const supabase = await getUserSupabaseClient();
    if (!supabase) return "free";
    const { data, error } = await supabase.rpc("current_plan");
    if (error || typeof data !== "string") return "free";
    return VALID.includes(data as SubscriptionTier) ? (data as SubscriptionTier) : "free";
  } catch {
    return "free";
  }
}

export interface QuotaResult {
  allowed: boolean;
  plan: SubscriptionTier;
  limit: number; // -1 = unlimited
}

/** Atomically consume one project from the current month's quota. */
export async function consumeProjectQuota(plan: SubscriptionTier): Promise<QuotaResult> {
  const limit = SUBSCRIPTION_LIMITS[plan].projectsPerMonth;
  if (limit < 0) return { allowed: true, plan, limit };
  try {
    const supabase = await getUserSupabaseClient();
    if (!supabase) return { allowed: false, plan, limit };
    const { data, error } = await supabase.rpc("consume_project_quota", {
      p_period: monthKey(),
      p_limit: limit,
    });
    if (error) {
      console.error("[plans] consume_project_quota failed:", error.message);
      return { allowed: false, plan, limit };
    }
    return { allowed: data === true, plan, limit };
  } catch (e) {
    console.error("[plans] consume_project_quota threw:", e);
    return { allowed: false, plan, limit };
  }
}

/** Read the current month's project usage without modifying it. */
export async function getProjectUsage(): Promise<{ used: number; period: string }> {
  const period = monthKey();
  try {
    const supabase = await getUserSupabaseClient();
    if (!supabase) return { used: 0, period };
    const { data } = await supabase
      .from("lf_usage")
      .select("projects_used")
      .eq("period", period)
      .maybeSingle();
    return { used: (data?.projects_used as number | undefined) ?? 0, period };
  } catch {
    return { used: 0, period };
  }
}
