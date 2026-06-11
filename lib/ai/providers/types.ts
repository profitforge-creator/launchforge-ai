/**
 * AIProvider interface — every AI provider must implement this contract.
 *
 * LaunchForge currently ships with Gemini as the only active provider.
 * To add a second provider (OpenAI, Anthropic, etc.):
 *   1. Create lib/ai/providers/openai-provider.ts implementing AIProvider
 *   2. Register it in lib/ai/registry.ts
 *   3. Expose a provider key in the admin config
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
}

export type AIProviderKey = "gemini" | "openai" | "anthropic";
