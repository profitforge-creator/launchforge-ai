import type { LeadRecord } from "./types";

const leadStore = new Map<string, LeadRecord[]>();

export async function listLeadRecords(userId: string): Promise<LeadRecord[]> {
  return [...(leadStore.get(userId) ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function saveLeadRecord(record: LeadRecord): Promise<LeadRecord> {
  const current = leadStore.get(record.userId) ?? [];
  leadStore.set(record.userId, [record, ...current]);
  return record;
}
