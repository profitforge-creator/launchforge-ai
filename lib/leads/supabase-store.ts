import { getUserSupabaseClient } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/server";
import { generateWeeklyDigest } from "./digest";
import { listLeadRecords as listMockLeadRecords, saveLeadRecord as saveMockLeadRecord } from "./mock-store";
import type { LeadRecord, WeeklyLeadDigest } from "./types";

interface SupabaseErrorShape {
  code?: string;
  message?: string;
}

interface LeadRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  website: string | null;
  budget_cents: number;
  urgency: LeadRecord["urgency"];
  need: string;
  status: LeadRecord["classification"]["status"];
  priority: LeadRecord["classification"]["priority"];
  score: number;
  classification_reasons: string[] | null;
  follow_up_draft: string;
  follow_up_state: LeadRecord["followUpState"];
  created_at: string;
  updated_at: string;
}

export type LeadStorageMode = "supabase" | "local-fallback";

export interface LeadStorageStatus {
  mode: LeadStorageMode;
  reason: string | null;
}

function isMissingLeadOpsTableError(error: SupabaseErrorShape | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    (message.includes("schema cache") && (message.includes("leads") || message.includes("weekly_lead_digests"))) ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}

async function getSupabaseOrNull() {
  if (!hasSupabaseConfig()) return null;
  return getUserSupabaseClient();
}

export async function getLeadStorageStatus(userId: string): Promise<LeadStorageStatus> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return {
      mode: "local-fallback",
      reason: "Supabase is not configured; lead records are stored in process memory for local preview only.",
    };
  }

  const { error } = await supabase
    .from("leads")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (isMissingLeadOpsTableError(error)) {
    return {
      mode: "local-fallback",
      reason: "Lead Ops tables are missing; apply the approved migration before relying on persisted lead records.",
    };
  }

  if (error) {
    return {
      mode: "local-fallback",
      reason: `Lead storage is unavailable: ${error.message}`,
    };
  }

  return { mode: "supabase", reason: null };
}

export async function listLeadRecords(userId: string): Promise<LeadRecord[]> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return listMockLeadRecords(userId);

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (isMissingLeadOpsTableError(error)) return listMockLeadRecords(userId);
  if (error) throw new Error(error.message);

  return ((data ?? []) as LeadRow[]).map(toLeadRecord);
}

export async function saveLeadRecord(record: LeadRecord): Promise<LeadRecord> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return saveMockLeadRecord(record);

  const { data, error } = await supabase
    .from("leads")
    .insert(toLeadInsert(record))
    .select("*")
    .single();

  if (isMissingLeadOpsTableError(error)) return saveMockLeadRecord(record);
  if (error) throw new Error(error.message);

  return toLeadRecord(data as LeadRow);
}

export async function getWeeklyLeadDigest(userId: string): Promise<WeeklyLeadDigest> {
  const leads = await listLeadRecords(userId);
  const generated = generateWeeklyDigest(leads);
  const weekStart = getWeekStart(new Date());
  await saveWeeklyLeadDigest(userId, weekStart, generated);
  return generated;
}

async function saveWeeklyLeadDigest(userId: string, weekStart: string, digest: WeeklyLeadDigest): Promise<void> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return;

  const { error } = await supabase
    .from("weekly_lead_digests")
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        total_leads: digest.totalLeads,
        qualified_count: digest.qualifiedCount,
        nurture_count: digest.nurtureCount,
        low_fit_count: digest.lowFitCount,
        average_score: digest.averageScore,
        top_opportunities: digest.topOpportunities,
        summary: digest.summary,
      },
      { onConflict: "user_id,week_start" },
    );

  if (isMissingLeadOpsTableError(error)) return;
  if (error) throw new Error(error.message);
}

function toLeadInsert(record: LeadRecord) {
  return {
    id: record.id,
    user_id: record.userId,
    name: record.name,
    email: record.email,
    company: record.company,
    website: record.website || null,
    budget_cents: budgetToCents(record.budget),
    urgency: record.urgency,
    need: record.need,
    status: record.classification.status,
    priority: record.classification.priority,
    score: record.classification.score,
    classification_reasons: record.classification.reasons,
    follow_up_draft: record.followUpDraft,
    follow_up_state: record.followUpState,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    archived_at: null,
  };
}

function toLeadRecord(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    company: row.company,
    website: row.website ?? "",
    budget: centsToBudget(row.budget_cents),
    urgency: row.urgency,
    need: row.need,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    classification: {
      status: row.status,
      priority: row.priority,
      score: row.score,
      reasons: row.classification_reasons ?? [],
    },
    followUpDraft: row.follow_up_draft,
    followUpState: row.follow_up_state,
  };
}

function budgetToCents(value: string): number {
  const dollars = Number.parseFloat(value || "0");
  if (!Number.isFinite(dollars) || dollars < 0) return 0;
  return Math.round(dollars * 100);
}

function centsToBudget(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const dollars = value / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

function getWeekStart(date: Date): string {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + diff));
  return start.toISOString().slice(0, 10);
}
