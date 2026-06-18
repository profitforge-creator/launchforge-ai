/**
 * Rate Limiter — enforces per-tier generation limits.
 *
 * Current implementation: in-memory, keyed by userId or IP.
 * Resets on cold start (acceptable for MVP; swap Map for Redis in production).
 *
 * Tier limits are derived from SUBSCRIPTION_LIMITS (types/index.ts) — the single
 * source of truth shared with plan gating.
 *
 * NOTE: project quota is now enforced persistently in the database
 * (lib/plans/server.ts → consume_project_quota). This in-memory limiter handles
 * per-project AI chat-edit throttling. Swap the Map for Redis in production.
 */

import type { SubscriptionTier } from "@/types";
import { SUBSCRIPTION_LIMITS } from "@/types";

// ── Limit definitions ─────────────────────────────────────────────────────────

interface TierLimits {
  projectsPerMonth: number;    // -1 = unlimited
  chatEditsPerProject: number; // -1 = unlimited
}

const LIMITS: Record<SubscriptionTier, TierLimits> = Object.fromEntries(
  (Object.keys(SUBSCRIPTION_LIMITS) as SubscriptionTier[]).map((tier) => [
    tier,
    {
      projectsPerMonth: SUBSCRIPTION_LIMITS[tier].projectsPerMonth,
      chatEditsPerProject: SUBSCRIPTION_LIMITS[tier].aiEditsPerProject,
    },
  ]),
) as Record<SubscriptionTier, TierLimits>;

// ── Storage ───────────────────────────────────────────────────────────────────

interface UsageRecord {
  projectsThisMonth: number;
  monthKey: string;              // "YYYY-MM"
  chatEdits: Map<string, number>; // projectId → count
}

const usage = new Map<string, UsageRecord>();

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getRecord(userId: string): UsageRecord {
  const existing = usage.get(userId);
  const current = monthKey();
  if (!existing || existing.monthKey !== current) {
    const record: UsageRecord = { projectsThisMonth: 0, monthKey: current, chatEdits: new Map() };
    usage.set(userId, record);
    return record;
  }
  return existing;
}

// ── Public API ────────────────────────────────────────────────────────────────

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string; upgradeRequired: SubscriptionTier };

// Upgrade ladder for messaging when a limit is hit.
const TIER_LADDER: SubscriptionTier[] = ["free", "starter", "growth", "scale"];
function suggestUpgrade(tier: SubscriptionTier): SubscriptionTier {
  const i = TIER_LADDER.indexOf(tier);
  return i >= 0 && i < TIER_LADDER.length - 1 ? TIER_LADDER[i + 1] : "scale";
}

/**
 * Check and increment the AI chat edit counter for a specific project.
 * Call BEFORE processing a chat message that may edit files.
 * (Project quota is enforced separately and persistently in lib/plans/server.ts.)
 */
export function checkChatEditLimit(
  userId: string,
  projectId: string,
  tier: SubscriptionTier,
): RateLimitResult {
  const limits = LIMITS[tier];
  if (limits.chatEditsPerProject === -1) return { allowed: true };

  const record = getRecord(userId);
  const current = record.chatEdits.get(projectId) ?? 0;

  if (current >= limits.chatEditsPerProject) {
    return {
      allowed: false,
      reason: `You've used all ${limits.chatEditsPerProject} AI edits for this project on the ${tier} plan.`,
      upgradeRequired: suggestUpgrade(tier),
    };
  }

  record.chatEdits.set(projectId, current + 1);
  return { allowed: true };
}

export function rollbackChatEditIncrement(userId: string, projectId: string): void {
  const record = usage.get(userId);
  const current = record?.chatEdits.get(projectId) ?? 0;
  if (!record || current <= 0) return;
  if (current === 1) {
    record.chatEdits.delete(projectId);
    return;
  }
  record.chatEdits.set(projectId, current - 1);
}
