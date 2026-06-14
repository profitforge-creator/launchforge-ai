"use server";

import { updateProjectFile } from "@/lib/storage/generation-store";

export async function actionUpdateProjectFile(
  projectId: string,
  path: string,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  if (!projectId || !path) {
    return { success: false, error: "Missing projectId or path" };
  }
  const ok = await updateProjectFile(projectId, path, content);
  if (!ok) {
    return { success: false, error: "File not found in project" };
  }
  return { success: true };
}
