/**
 * Gemini AI provider — LaunchForge's primary (and currently only) AI backend.
 *
 * Implements the AIProvider interface so any call site that depends on this
 * module can be swapped to a different provider without changing business logic.
 *
 * Models:
 *   gemini-2.0-flash  — default; fast, cost-effective, structured JSON
 *   gemini-1.5-pro    — critic agent; stronger reasoning, larger context window
 *
 * Key behaviors:
 *   - responseMimeType "application/json" forces clean JSON output (no fences)
 *   - Safety settings relaxed to BLOCK_ONLY_HIGH for business content
 *   - Automatic retry on transient 5xx/overload/timeout errors
 *   - All calls are server-side only (uses GEMINI_API_KEY from env)
 */

import {
  GoogleGenerativeAI,
  type GenerateContentResult,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import type { AIProvider, AIGenerateOptions } from "./providers/types";

// ── Models ────────────────────────────────────────────────────────────────────

export type GeminiModel = "gemini-2.0-flash" | "gemini-1.5-flash" | "gemini-1.5-pro";

// gemini-1.5-flash: separate free-tier quota pool from 2.0-flash, good fallback
export const GEMINI_DEFAULT_MODEL: GeminiModel = "gemini-1.5-flash";
export const GEMINI_PRO_MODEL: GeminiModel = "gemini-1.5-pro";

// ── Safety settings ───────────────────────────────────────────────────────────

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const DEFAULT_TIMEOUT_MS = 30_000;

// ── Client ────────────────────────────────────────────────────────────────────

function getClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local to enable AI generation.",
    );
  }
  return new GoogleGenerativeAI(key);
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
      const msg = err instanceof Error ? err.message : String(err);
      // Only retry on transient provider failures. Quota/rate-limit errors
      // need operator action or a later user retry, not repeated pipeline calls.
      const isRetryable = /5\d\d|overload|timeout/i.test(msg) && !/quota|rate.?limit|429/i.test(msg);
      if (!isRetryable || i === attempts - 1) break;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

// ── JSON parse helper ─────────────────────────────────────────────────────────

function parseResponse<T>(result: GenerateContentResult, context: string): T {
  const text = result.response.text();
  if (!text || text.trim() === "") {
    throw new Error(`${context}: Gemini returned an empty response. Content may have triggered safety filters.`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // Strip accidental markdown fences before re-parsing
    const cleaned = text
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```\s*$/im, "")
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(`${context}: Failed to parse Gemini response as JSON.\nRaw: ${text.slice(0, 300)}`);
    }
  }
}

// ── Core call functions ───────────────────────────────────────────────────────

/**
 * Call Gemini and parse the response as structured JSON.
 * Uses responseMimeType "application/json" so no post-processing fence-stripping needed.
 */
export async function geminiJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model: GeminiModel = GEMINI_DEFAULT_MODEL,
  options?: AIGenerateOptions,
): Promise<T> {
  const client = getClient();
  const genModel = client.getGenerativeModel({
    model: options?.model ?? model,
    systemInstruction: systemPrompt,
    safetySettings: SAFETY_SETTINGS,
  });

  return withRetry(async () => {
    const result = await genModel.generateContent(
      {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: options?.temperature ?? 0.4,
          maxOutputTokens: options?.maxTokens ?? 4096,
        },
      },
      { timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS },
    );
    return parseResponse<T>(result, `geminiJSON(${model})`);
  });
}

/**
 * Call Gemini and return a plain text response.
 * Used for conversational interactions where JSON structure isn't required.
 */
export async function geminiText(
  systemPrompt: string,
  userPrompt: string,
  model: GeminiModel = GEMINI_DEFAULT_MODEL,
  options?: AIGenerateOptions,
): Promise<string> {
  const client = getClient();
  const genModel = client.getGenerativeModel({
    model: options?.model ?? model,
    systemInstruction: systemPrompt,
    safetySettings: SAFETY_SETTINGS,
  });

  return withRetry(async () => {
    const result = await genModel.generateContent(
      {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      },
      { timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS },
    );
    const text = result.response.text();
    if (!text || text.trim() === "") {
      throw new Error("geminiText: empty response from Gemini.");
    }
    return text.trim();
  });
}

/** Returns true when the Gemini API key is configured */
export function isAIEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// ── AIProvider implementation ─────────────────────────────────────────────────

/**
 * GeminiProvider implements the AIProvider interface.
 * Use this when you need to pass the provider as a dependency.
 * For direct calls, prefer the module-level geminiJSON / geminiText functions.
 */
export const GeminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini",

  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<T> {
    return geminiJSON<T>(
      systemPrompt,
      userPrompt,
      (options?.model as GeminiModel) ?? GEMINI_DEFAULT_MODEL,
      options,
    );
  },

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: AIGenerateOptions,
  ): Promise<string> {
    return geminiText(
      systemPrompt,
      userPrompt,
      (options?.model as GeminiModel) ?? GEMINI_DEFAULT_MODEL,
      options,
    );
  },
};

/** The active AI provider — swap this to change the whole system */
export const activeProvider: AIProvider = GeminiProvider;
