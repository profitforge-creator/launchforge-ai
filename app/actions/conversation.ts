"use server";

import { getGeneration } from "@/lib/storage/generation-store";
import { generateConversationResponse } from "@/lib/conversation/mock-responses";

type ConversationResult =
  | { success: true; response: string }
  | { success: false; error: string };

export async function actionSendMessage(
  workspaceId: string,
  userMessage: string,
): Promise<ConversationResult> {
  try {
    const workspace = getGeneration(workspaceId);
    if (!workspace) {
      return { success: false, error: "Workspace not found." };
    }
    // AI INTEGRATION POINT: replace generateConversationResponse with:
    //   const response = await geminiJSON<{ content: string }>(
    //     CONVERSATION_SYSTEM_PROMPT,
    //     buildConversationPrompt(workspace, messageHistory, userMessage),
    //   );
    const response = generateConversationResponse(userMessage, workspace);
    return { success: true, response };
  } catch (err) {
    console.error("[Conversation]", err);
    return { success: false, error: "Failed to process your message. Please try again." };
  }
}
