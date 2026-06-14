"use server";

/**
 * Conversation Server Action
 *
 * Routes user messages through lib/ai/conversation.ts (Gemini).
 * The AI has full project context and can return file updates.
 * File updates are persisted to the generation store immediately.
 *
 * Rate limiting is applied per project per tier.
 */

import { getGeneration, updateProjectFile } from "@/lib/storage/generation-store";
import { runConversation } from "@/lib/ai/conversation";
import { checkChatEditLimit } from "@/lib/ai/rate-limiter";
import { requireUser } from "@/lib/auth/session";
import type { FileUpdate } from "@/types";

type ConversationResult =
  | { success: true; response: string; fileUpdates: FileUpdate[] }
  | { success: false; error: string; upgradeRequired?: boolean };

export async function actionSendMessage(
  workspaceId: string,
  userMessage: string,
): Promise<ConversationResult> {
  const user = await requireUser();
  const project = await getGeneration(workspaceId, user.id);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const tier = "free";
  const rateCheck = checkChatEditLimit(user.id, workspaceId, tier);
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.reason, upgradeRequired: true };
  }

  try {
    const { response, fileUpdates } = await runConversation(userMessage, project);

    // Persist any file updates to the store
    for (const update of fileUpdates) {
      await updateProjectFile(workspaceId, update.path, update.content, user.id);
    }

    return { success: true, response, fileUpdates };
  } catch (err) {
    console.error("[Conversation]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";

    // Surface API key errors clearly so the developer knows what's wrong
    if (msg.includes("GEMINI_API_KEY")) {
      return { success: false, error: "AI is not configured. Set GEMINI_API_KEY in .env.local." };
    }

    return { success: false, error: "The AI advisor couldn't respond. Please try again." };
  }
}
