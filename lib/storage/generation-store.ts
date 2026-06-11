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
import { MOCK_BUSINESS_RESULT } from "@/lib/mock-data";

// Module-level singleton store
const store = new Map<string, BusinessResult>();

let seeded = false;

function seedIfNeeded(): void {
  if (seeded) return;
  seeded = true;

  // Seed with the demo result so history is never empty on first load
  store.set(MOCK_BUSINESS_RESULT.id, MOCK_BUSINESS_RESULT);

  // Seed a few additional records for a realistic history
  const seeds: BusinessResult[] = [
    {
      ...MOCK_BUSINESS_RESULT,
      id: "gen_seed_02",
      createdAt: "2026-06-05T09:15:00Z",
      niche: "Creator Monetization & Audience Tools",
      scores: { ...MOCK_BUSINESS_RESULT.scores, overall: 71, demand: 85, competition: 72, difficulty: 38, category: "Good" },
      product: { ...MOCK_BUSINESS_RESULT.product, name: "CreatorOS" },
      formData: { ...MOCK_BUSINESS_RESULT.formData, businessType: "digital-product" },
    },
    {
      ...MOCK_BUSINESS_RESULT,
      id: "gen_seed_03",
      createdAt: "2026-05-28T16:44:00Z",
      niche: "B2B Productized Services",
      scores: { ...MOCK_BUSINESS_RESULT.scores, overall: 79, demand: 82, competition: 65, difficulty: 35, category: "Good" },
      product: { ...MOCK_BUSINESS_RESULT.product, name: "GrowthSprint" },
      formData: { ...MOCK_BUSINESS_RESULT.formData, businessType: "productized-service" },
    },
    {
      ...MOCK_BUSINESS_RESULT,
      id: "gen_seed_04",
      createdAt: "2026-05-18T11:22:00Z",
      niche: "Design Templates & Notion Systems",
      scores: { ...MOCK_BUSINESS_RESULT.scores, overall: 68, demand: 78, competition: 68, difficulty: 28, category: "Moderate" },
      product: { ...MOCK_BUSINESS_RESULT.product, name: "FounderKit" },
      formData: { ...MOCK_BUSINESS_RESULT.formData, businessType: "digital-product" },
    },
  ];

  for (const seed of seeds) {
    store.set(seed.id, seed);
  }
}

export function saveGeneration(result: BusinessResult): void {
  seedIfNeeded();
  store.set(result.id, result);
}

export function getGeneration(id: string): BusinessResult | null {
  seedIfNeeded();
  return store.get(id) ?? null;
}

export function getAllGenerations(): BusinessResult[] {
  seedIfNeeded();
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
  seedIfNeeded();
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
