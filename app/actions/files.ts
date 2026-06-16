"use server";

import { requireUser } from "@/lib/auth/session";
import { updateProjectFile } from "@/lib/storage/generation-store";

export async function actionUpdateProjectFile(
  projectId: string,
  path: string,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  if (!projectId || !path) {
    return { success: false, error: "Missing projectId or path" };
  }
  try {
    const user = await requireUser();
    const ok = await updateProjectFile(projectId, path, content, user.id);
    if (!ok) {
      return { success: false, error: "File not found in project" };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update project file";
    return { success: false, error: message };
  }
}
