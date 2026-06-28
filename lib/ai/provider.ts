/**
 * Anthropic AI provider — LaunchForge's AI backend.
 *
 * MODEL CONFIGURATION:
 *   All calls use DEFAULT_MODEL which reads from the ANTHROPIC_MODEL env var.
 *   Set ANTHROPIC_MODEL=claude-sonnet-4-6 in .env.local to change the model.
 *   Default: claude-sonnet-4-6
 *
 * Key behaviors:
 *   - JSON responses are parsed from text output (Claude reliably returns clean JSON
 *     when instructed in the system prompt)
 *   - Automatic retry on transient 5xx / 529-overload errors (3 attempts)
 *   - Model-not-found (404) fails immediately with a clear operator message
 *   - Auth errors (401/403) fail immediately — bad key, not transient
 *   - All calls are server-side only (uses ANTHROPIC_API_KEY from env)
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIGenerateOptions } from "./providers/types";

// ── Model config ──────────────────────────────────────────────────────────────

export type AIModel = string;

/**
 * Single source of truth for the Claude model used across the app.
 * Override with ANTHROPIC_MODEL env var (e.g. ANTHROPIC_MODEL=claude-opus-4-8).
 */
export const DEFAULT_MODEL: AIModel =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

// ── Client ────────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 60_000;

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI generation.",
    );
  }
  return new Anthropic({ apiKey: key, timeout: DEFAULT_TIMEOUT_MS });
}

// ── Error classification ──────────────────────────────────────────────────────

function isModelNotFound(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) return err.status === 404;
  const msg = err instanceof Error ? err.message : String(err);
  return /not found|model.*not.*found|404/i.test(msg);
}

function isAuthError(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) return err.status === 401 || err.status === 403;
  return false;
}

function isRetryable(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) {
    return err.status === 529 || (err.status >= 500 && err.status < 600);
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /5\d\d|overload|timeout/i.test(msg) && !/quota|rate.?limit|429/i.test(msg);
}

// ── Retry helper ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 800,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      if (isModelNotFound(err)) {
        throw new Error(
          `AI model is unavailable. Check ANTHROPIC_MODEL in .env.local (current: "${DEFAULT_MODEL}").`,
        );
      }
      if (isAuthError(err)) {
        throw new Error(
          "ANTHROPIC_API_KEY is invalid or lacks permissions. Check your key in .env.local.",
        );
      }

      if (!isRetryable(err) || i === attempts - 1) break;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

// ── Text extraction ───────────────────────────────────────────────────────────

function extractText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

// ── JSON parse helper ─────────────────────────────────────────────────────────

function parseJSON<T>(text: string, context: string): T {
  if (!text.trim()) {
    throw new Error(`${context}: Claude returned an empty response.`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // Strip markdown fences Claude sometimes adds despite instructions
    const cleaned = text
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```\s*$/im, "")
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(`${context}: failed to parse JSON.\nRaw: ${text.slice(0, 300)}`);
    }
  }
}

// ── Core call functions ───────────────────────────────────────────────────────

/**
 * Call Claude and parse the response as structured JSON.
 * The system prompt should instruct Claude to return valid JSON — it reliably does.
 */
export async function callAI<T>(
  systemPrompt: string,
  userPrompt: string,
  model: AIModel = DEFAULT_MODEL,
  options?: AIGenerateOptions,
): Promise<T> {
  const client = getClient();
  const resolvedModel = options?.model ?? model;

  return withRetry(async () => {
    const response = await client.messages.create({
      model: resolvedModel,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.4,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = extractText(response);
    return parseJSON<T>(text, `callAI(${resolvedModel})`);
  });
}

/**
 * Call Claude and return a plain text response.
 */
export async function callAIText(
  systemPrompt: string,
  userPrompt: string,
  model: AIModel = DEFAULT_MODEL,
  options?: AIGenerateOptions,
): Promise<string> {
  const client = getClient();
  const resolvedModel = options?.model ?? model;

  return withRetry(async () => {
    const response = await client.messages.create({
      model: resolvedModel,
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = extractText(response);
    if (!text.trim()) {
      throw new Error("callAIText: empty response from Claude.");
    }
    return text.trim();
  });
}

/** Returns true when the Anthropic API key is configured */
export function isAIEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// ── AIProvider implementation ─────────────────────────────────────────────────

export const AnthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic Claude",

  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<T> {
    return callAI<T>(systemPrompt, userPrompt, options?.model ?? DEFAULT_MODEL, options);
  },

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<string> {
    return callAIText(systemPrompt, userPrompt, options?.model ?? DEFAULT_MODEL, options);
  },
};

/** The active AI provider */
export const activeProvider: AIProvider = AnthropicProvider;
