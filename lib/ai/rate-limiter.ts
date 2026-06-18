/**
 * Rate Limiter — enforces per-tier generation limits.
 *
 * Current implementation: in-memory, keyed by userId or IP.
 * Resets on cold start (acceptable for MVP; swap Map for Redis in production).
 *
 * Tier limits:
 *   free     — 3 projects/month,  5  AI chat edits/project
 *   starter  — 20 projects/month, 50  AI chat edits/project
 *   pro      — unlimited
 *
 * To migrate to Redis:
 *   Replace Map.get/set calls below with redis.incr / redis.expire
 *   keeping the same function signatures and error shape.
 */

import type { SubscriptionTier } from "@/types";

// ── Limit definitions ─────────────────────────────────────────────────────────

interface TierLimits {
  projectsPerMonth: number;    // -1 = unlimited
  chatEditsPerProject: number; // -1 = unlimited
}

const LIMITS: Record<SubscriptionTier, TierLimits> = {
  free:    { projectsPerMonth: 3,  chatEditsPerProject: 5  },
  starter: { projectsPerMonth: 20, chatEditsPerProject: 50 },
  pro:     { projectsPerMonth: -1, chatEditsPerProject: -1 },
};

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

/**
 * Check and increment the project generation counter.
 * Call BEFORE starting a generation pipeline.
 */
export function checkProjectLimit(
  userId: string,
  tier: SubscriptionTier,
): RateLimitResult {
  const limits = LIMITS[tier];
  if (limits.projectsPerMonth === -1) return { allowed: true };

  const record = getRecord(userId);
  if (record.projectsThisMonth >= limits.projectsPerMonth) {
    const nextTier: SubscriptionTier = tier === "free" ? "starter" : "pro";
    return {
      allowed: false,
      reason: `You've used all ${limits.projectsPerMonth} projects on the ${tier} plan this month.`,
      upgradeRequired: nextTier,
    };
  }

  record.projectsThisMonth++;
  return { allowed: true };
}

/**
 * Check the project generation counter without incrementing it.
 * Used by later pipeline steps so direct server-action calls cannot bypass
 * a user who is already over quota, while a normal multi-step generation only
 * consumes one project at the research/start step.
 */
export function canStartProject(
  userId: string,
  tier: SubscriptionTier,
): RateLimitResult {
  const limits = LIMITS[tier];
  if (limits.projectsPerMonth === -1) return { allowed: true };

  const record = getRecord(userId);
  if (record.projectsThisMonth >= limits.projectsPerMonth) {
    const nextTier: SubscriptionTier = tier === "free" ? "starter" : "pro";
    return {
      allowed: false,
      reason: `You've used all ${limits.projectsPerMonth} projects on the ${tier} plan this month.`,
      upgradeRequired: nextTier,
    };
  }

  return { allowed: true };
}

/**
 * Check and increment the AI chat edit counter for a specific project.
 * Call BEFORE processing a chat message that may edit files.
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
    const nextTier: SubscriptionTier = tier === "free" ? "starter" : "pro";
    return {
      allowed: false,
      reason: `You've used all ${limits.chatEditsPerProject} AI edits for this project on the ${tier} plan.`,
      upgradeRequired: nextTier,
    };
  }

  record.chatEdits.set(projectId, current + 1);
  return { allowed: true };
}

/**
 * Read current usage without modifying counters.
 * Used by the dashboard to show "X of Y projects used".
 */
export function getUsage(userId: string): { projectsThisMonth: number } {
  const record = getRecord(userId);
  return { projectsThisMonth: record.projectsThisMonth };
}

/**
 * Rollback a project counter increment — call if generation fails after checkProjectLimit.
 */
export function rollbackProjectIncrement(userId: string): void {
  const record = usage.get(userId);
  if (record && record.projectsThisMonth > 0) {
    record.projectsThisMonth--;
  }
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
