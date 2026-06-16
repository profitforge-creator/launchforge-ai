import { actionGetLeadStorageStatus, actionGetWeeklyLeadDigest, actionListLeads } from "@/app/actions/leads";
import { LeadWorkbench } from "@/components/leads/lead-workbench";
import type { LeadStorageStatus } from "@/lib/leads/supabase-store";
import type { LeadRecord, WeeklyLeadDigest } from "@/lib/leads/types";

const FALLBACK_DIGEST: WeeklyLeadDigest = {
  totalLeads: 0,
  qualifiedCount: 0,
  nurtureCount: 0,
  lowFitCount: 0,
  averageScore: 0,
  topOpportunities: [],
  summary: "Lead digest unavailable until storage is ready.",
};

const FALLBACK_STORAGE_STATUS: LeadStorageStatus = {
  mode: "local-fallback",
  reason: "Lead storage is unavailable; showing local preview state until Supabase tables and RLS are verified.",
};

export default async function LeadsPage() {
  const [leadsResult, digestResult, storageStatusResult] = await Promise.allSettled([
    actionListLeads(),
    actionGetWeeklyLeadDigest(),
    actionGetLeadStorageStatus(),
  ]);
  const leads: LeadRecord[] = leadsResult.status === "fulfilled" ? leadsResult.value : [];
  const digest: WeeklyLeadDigest = digestResult.status === "fulfilled" ? digestResult.value : FALLBACK_DIGEST;
  const storageStatus: LeadStorageStatus = storageStatusResult.status === "fulfilled" ? storageStatusResult.value : FALLBACK_STORAGE_STATUS;

  return <LeadWorkbench initialLeads={leads} initialDigest={digest} storageStatus={storageStatus} />;
}
