"use server";

/**
 * Conversation Server Action
 *
 * Routes user messages through lib/ai/conversation.ts (Gemini).
 * The AI has full project context, chat history, and deployment status.
 * Messages and file updates are persisted to the generation store.
 *
 * Rate limiting is applied per project per tier.
 */

import { getGeneration, updateProjectFile, patchGeneration } from "@/lib/storage/generation-store";
import { runConversation } from "@/lib/ai/conversation";
import { checkChatEditLimit, rollbackChatEditIncrement } from "@/lib/ai/rate-limiter";
import { requireUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/plans/server";
import { actionGetDeployment } from "@/app/actions/deployments";
import type { FileUpdate } from "@/types";
import type { PersistedChatMessage } from "@/lib/conversation/types";

const MAX_STORED_MESSAGES = 50;
const HISTORY_CONTEXT_WINDOW = 10;

type ConversationResult =
  | { success: true; response: string; fileUpdates: FileUpdate[] }
  | { success: false; error: string; upgradeRequired?: boolean };

// ── Load persisted messages ───────────────────────────────────────────────────

export async function actionLoadMessages(
  workspaceId: string,
): Promise<PersistedChatMessage[]> {
  try {
    const user = await requireUser();
    const project = await getGeneration(workspaceId, user.id);
    return project?.chatMessages ?? [];
  } catch {
    return [];
  }
}

// ── Send message ──────────────────────────────────────────────────────────────

export async function actionSendMessage(
  workspaceId: string,
  userMessage: string,
): Promise<ConversationResult> {
  const user = await requireUser();
  const project = await getGeneration(workspaceId, user.id);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const tier = await getUserPlan();
  const rateCheck = checkChatEditLimit(user.id, workspaceId, tier);
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.reason, upgradeRequired: true };
  }

  // Fetch deployment status for context (best-effort, non-blocking)
  let deploymentStatus: string | undefined;
  try {
    const { data: deploy } = await actionGetDeployment(workspaceId);
    if (deploy) {
      deploymentStatus = `${deploy.platform} — ${deploy.status}${deploy.url ? ` (${deploy.url})` : ""}`;
    }
  } catch {
    // Not critical; ignore
  }

  // Recent history for AI context window
  const existingMessages = project.chatMessages ?? [];
  const history = existingMessages
    .filter((m) => !m.isError)
    .slice(-HISTORY_CONTEXT_WINDOW);

  const userMsg: PersistedChatMessage = {
    id: `u_${Date.now()}`,
    role: "user",
    content: userMessage,
    createdAt: new Date().toISOString(),
  };

  try {
    const { response, fileUpdates } = await runConversation(
      userMessage,
      project,
      history,
      deploymentStatus,
    );

    // Persist file updates
    for (const update of fileUpdates) {
      await updateProjectFile(workspaceId, update.path, update.content, user.id);
    }

    const assistantMsg: PersistedChatMessage = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: response,
      createdAt: new Date().toISOString(),
    };

    // Persist messages — cap to MAX_STORED_MESSAGES
    const updatedMessages = [
      ...existingMessages,
      userMsg,
      assistantMsg,
    ].slice(-MAX_STORED_MESSAGES);

    await patchGeneration(workspaceId, { chatMessages: updatedMessages }, user.id);

    return { success: true, response, fileUpdates };
  } catch (err) {
    rollbackChatEditIncrement(user.id, workspaceId);
    console.error("[Conversation]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";

    if (msg.includes("GEMINI_API_KEY")) {
      return { success: false, error: "AI is not configured. Set GEMINI_API_KEY in .env.local." };
    }

    return { success: false, error: "The AI advisor couldn't respond. Please try again." };
  }
}
