export type MessageRole = "user" | "assistant" | "system";

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

/** Stored in generations.result.chatMessages — includes error flag for client display */
export interface PersistedChatMessage extends ConversationMessage {
  isError?: boolean;
}

export interface Conversation {
  workspaceId: string;
  messages: ConversationMessage[];
}
