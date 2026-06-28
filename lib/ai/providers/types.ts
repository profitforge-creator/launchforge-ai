/**
 * AIProvider interface — every AI provider must implement this contract.
 *
 * LaunchForge uses Anthropic Claude as the active provider (lib/ai/provider.ts).
 * To swap providers: replace activeProvider in lib/ai/provider.ts.
 *
 * All agent code talks to AIProvider — never to a vendor SDK directly.
 * This keeps provider details out of business logic.
 */

export interface AIProvider {
  /** Unique identifier for this provider */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /**
   * Generate a structured JSON response.
   * The model MUST return valid JSON matching the type T.
   */
  generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<T>;

  /**
   * Generate a plain text response (for conversational use cases).
   */
  generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<string>;
}

export interface AIGenerateOptions {
  /** Override the default model for this provider */
  model?: string;
  /** 0–1. Higher = more creative. Default: 0.4 for JSON, 0.7 for text */
  temperature?: number;
  /** Max output tokens */
  maxTokens?: number;
  /** Provider request timeout in milliseconds */
  timeoutMs?: number;
}

export type AIProviderKey = "anthropic" | "openai";
