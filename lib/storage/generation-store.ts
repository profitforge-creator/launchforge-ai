// Generation Store — persistence abstraction layer
//
// Current implementation: in-memory Map (module-level singleton).
//   - Survives across requests within a single server process
//   - Cleared on server restart / cold start in serverless
//
// AI INTEGRATION POINT (Database):
//   Replace the Map operations below with Supabase calls:
//
//   import { createClient } from "@supabase/supabase-js"
//   const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
//
//   saveGeneration  → supabase.from("generations").insert(result)
//   getGeneration   → supabase.from("generations").select("*").eq("id", id).single()
//   getHistory      → supabase.from("generations").select("*").order("created_at", { ascending: false })
//
// The function signatures stay identical — only the body changes.

import type { BusinessResult, HistoryRecord } from "@/types";

// Module-level singleton store
const store = new Map<string, BusinessResult>();

export function saveGeneration(result: BusinessResult): void {
  store.set(result.id, result);
}

export function getGeneration(id: string): BusinessResult | null {
  return store.get(id) ?? null;
}

export function getAllGenerations(): BusinessResult[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function toHistoryRecord(result: BusinessResult): HistoryRecord {
  return {
    id: result.id,
    createdAt: result.createdAt,
    niche: result.niche,
    overallScore: result.scores.overall,
    businessType: result.formData.businessType,
    productName: result.product.name,
    status: "completed",
  };
}

export function getHistoryRecords(): HistoryRecord[] {
  return getAllGenerations().map(toHistoryRecord);
}

export function updateProjectFile(projectId: string, path: string, content: string): boolean {
  const result = store.get(projectId);
  if (!result || !result.projectFiles) return false;
  const idx = result.projectFiles.findIndex((f) => f.path === path);
  if (idx === -1) return false;
  result.projectFiles[idx] = {
    ...result.projectFiles[idx],
    content,
    generatedAt: new Date().toISOString(),
  };
  store.set(projectId, result);
  return true;
}
