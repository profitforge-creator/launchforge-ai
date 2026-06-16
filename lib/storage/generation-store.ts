import { getCurrentUser, getUserSupabaseClient } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/server";
import type { BusinessResult, HistoryRecord } from "@/types";

const localStore = new Map<string, BusinessResult>();

function useLocalFallback(): boolean {
  return !hasSupabaseConfig();
}

function isMissingGenerationsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    (message.includes("generations") && message.includes("schema cache")) ||
    (message.includes("relation") && message.includes("generations") && message.includes("does not exist"))
  );
}

async function getStorageContext(userId?: string) {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) return null;

  if (useLocalFallback()) {
    return { userId: user.id, supabase: null };
  }

  const supabase = await getUserSupabaseClient();
  if (!supabase) return null;
  return { userId: user.id, supabase };
}

export async function saveGeneration(result: BusinessResult, userId?: string): Promise<void> {
  const ctx = await getStorageContext(userId);
  if (!ctx) throw new Error("Authentication required to save generation.");

  if (!ctx.supabase) {
    localStore.set(result.id, result);
    return;
  }

  const { error } = await ctx.supabase
    .from("generations")
    .upsert(
      {
        id: result.id,
        user_id: ctx.userId,
        result,
        updated_at: new Date().toISOString(),
        archived_at: null,
      },
      { onConflict: "id" },
    );

  if (error) throw new Error(error.message);
}

export async function getGeneration(id: string, userId?: string): Promise<BusinessResult | null> {
  const ctx = await getStorageContext(userId);
  if (!ctx) return null;

  if (!ctx.supabase) return localStore.get(id) ?? null;

  const { data, error } = await ctx.supabase
    .from("generations")
    .select("result")
    .eq("id", id)
    .eq("user_id", ctx.userId)
    .is("archived_at", null)
    .maybeSingle();

  if (isMissingGenerationsTableError(error)) {
    // TODO: Supabase migrations should create public.generations later.
    return null;
  }
  if (error) throw new Error(error.message);
  return (data?.result as BusinessResult | undefined) ?? null;
}

export async function getAllGenerations(userId?: string): Promise<BusinessResult[]> {
  const ctx = await getStorageContext(userId);
  if (!ctx) return [];

  if (!ctx.supabase) {
    return Array.from(localStore.values()).sort(byCreatedAtDesc);
  }

  const { data, error } = await ctx.supabase
    .from("generations")
    .select("result")
    .eq("user_id", ctx.userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (isMissingGenerationsTableError(error)) {
    // TODO: Supabase migrations should create public.generations later.
    return [];
  }
  if (error) throw new Error(error.message);
  return ((data ?? []).map((row) => row.result as BusinessResult)).sort(byCreatedAtDesc);
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

export async function getHistoryRecords(userId?: string): Promise<HistoryRecord[]> {
  const generations = await getAllGenerations(userId);
  return generations.map(toHistoryRecord);
}

export async function patchGeneration(
  id: string,
  patch: Partial<BusinessResult>,
  userId?: string,
): Promise<boolean> {
  const current = await getGeneration(id, userId);
  if (!current) return false;
  await saveGeneration({ ...current, ...patch }, userId);
  return true;
}

export async function updateProjectFile(
  projectId: string,
  path: string,
  content: string,
  userId?: string,
): Promise<boolean> {
  const result = await getGeneration(projectId, userId);
  if (!result || !result.projectFiles) return false;

  const idx = result.projectFiles.findIndex((f) => f.path === path);
  if (idx === -1) return false;

  const nextFiles = [...result.projectFiles];
  nextFiles[idx] = {
    ...nextFiles[idx],
    content,
    generatedAt: new Date().toISOString(),
  };

  await saveGeneration({ ...result, projectFiles: nextFiles }, userId);
  return true;
}

function byCreatedAtDesc(a: BusinessResult, b: BusinessResult): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
