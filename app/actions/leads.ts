"use server";

import { classifyLead } from "@/lib/leads/classifier";
import { generateFollowUpDraft } from "@/lib/leads/follow-up";
import {
  getLeadStorageStatus,
  getWeeklyLeadDigest,
  listLeadRecords,
  saveLeadRecord,
  type LeadStorageStatus,
} from "@/lib/leads/supabase-store";
import type { LeadActionResult, LeadInput, LeadRecord, LeadUrgency, WeeklyLeadDigest } from "@/lib/leads/types";
import { requireUser } from "@/lib/auth/session";

const VALID_URGENCY: LeadUrgency[] = ["this-week", "this-month", "later"];
const FALLBACK_DIGEST: WeeklyLeadDigest = {
  totalLeads: 0,
  qualifiedCount: 0,
  nurtureCount: 0,
  lowFitCount: 0,
  averageScore: 0,
  topOpportunities: [],
  summary: "Lead digest unavailable until storage is ready.",
};

export async function actionListLeads(): Promise<LeadRecord[]> {
  const user = await requireUser();
  try {
    return await listLeadRecords(user.id);
  } catch (error) {
    console.error("[actionListLeads] returning empty fallback:", error);
    return [];
  }
}

export async function actionGetWeeklyLeadDigest(): Promise<WeeklyLeadDigest> {
  const user = await requireUser();
  try {
    return await getWeeklyLeadDigest(user.id);
  } catch (error) {
    console.error("[actionGetWeeklyLeadDigest] returning fallback digest:", error);
    return FALLBACK_DIGEST;
  }
}

export async function actionGetLeadStorageStatus(): Promise<LeadStorageStatus> {
  const user = await requireUser();
  try {
    return await getLeadStorageStatus(user.id);
  } catch (error) {
    console.error("[actionGetLeadStorageStatus] returning fallback status:", error);
    return {
      mode: "local-fallback",
      reason: "Lead storage is unavailable; showing local preview state until Supabase tables and RLS are verified.",
    };
  }
}

export async function actionCreateLead(input: LeadInput): Promise<LeadActionResult<LeadRecord>> {
  const user = await requireUser();
  const normalized = normalizeLeadInput(input);
  const validationError = validateLeadInput(normalized);
  if (validationError) return { success: false, error: validationError };

  const classification = classifyLead(normalized);
  const followUpDraft = generateFollowUpDraft(normalized, classification);
  const now = new Date().toISOString();
  const record: LeadRecord = {
    ...normalized,
    id: crypto.randomUUID(),
    userId: user.id,
    createdAt: now,
    updatedAt: now,
    classification,
    followUpDraft,
    followUpState: "draft",
  };

  try {
    const saved = await saveLeadRecord(record);
    return { success: true, data: saved };
  } catch (error) {
    console.error("[actionCreateLead] storage failed:", error);
    return {
      success: false,
      error: "Lead storage is unavailable. Apply and verify the approved Lead Ops migration before relying on saved records.",
    };
  }
}

function normalizeLeadInput(input: LeadInput): LeadInput {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company.trim(),
    website: input.website.trim(),
    budget: input.budget.trim(),
    urgency: VALID_URGENCY.includes(input.urgency) ? input.urgency : "later",
    need: input.need.trim(),
  };
}

function validateLeadInput(input: LeadInput): string | null {
  if (input.name.length < 2) return "Lead name is required.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) return "A valid email is required.";
  if (input.company.length < 2) return "Company is required.";
  if (input.need.length < 10) return "Lead need must be at least 10 characters.";
  const budget = Number.parseInt(input.budget || "0", 10);
  if (Number.isNaN(budget) || budget < 0) return "Budget must be zero or greater.";
  return null;
}
