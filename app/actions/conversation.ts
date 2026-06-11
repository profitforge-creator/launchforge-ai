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
import type { FileUpdate } from "@/types";

type ConversationResult =
  | { success: true; response: string; fileUpdates: FileUpdate[] }
  | { success: false; error: string; upgradeRequired?: boolean };

export async function actionSendMessage(
  workspaceId: string,
  userMessage: string,
): Promise<ConversationResult> {
  const project = getGeneration(workspaceId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Rate limit: free users get 5 AI edits per project
  // AI INTEGRATION POINT (Auth): replace "anon" with real userId from session
  const userId = "anon";
  const tier = "free"; // TODO: pull real tier from session
  const rateCheck = checkChatEditLimit(userId, workspaceId, tier);
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.reason, upgradeRequired: true };
  }

  try {
    const { response, fileUpdates } = await runConversation(userMessage, project);

    // Persist any file updates to the store
    for (const update of fileUpdates) {
      updateProjectFile(workspaceId, update.path, update.content);
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
