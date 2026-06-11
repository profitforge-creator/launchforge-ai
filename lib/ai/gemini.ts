// Gemini AI client — shared across all LaunchForge agents
//
// Model: gemini-2.0-flash
//   Fast, capable, cost-effective for structured JSON generation.
//   The critic agent uses a higher-quality model flag via options.
//
// JSON mode: we pass responseMimeType "application/json" so Gemini returns
// clean JSON without markdown fences — no regex cleanup needed.

import {
  GoogleGenerativeAI,
  type GenerateContentResult,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

function getClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in environment variables.");
  return new GoogleGenerativeAI(key);
}

export type GeminiModel = "gemini-2.0-flash" | "gemini-1.5-pro";

// Safety settings — relaxed for business analysis content
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

/**
 * Call Gemini and parse the response as JSON.
 * Uses responseMimeType "application/json" so the model returns clean JSON.
 *
 * @param systemPrompt  The system instruction for this agent
 * @param userPrompt    The user-facing prompt with the actual data
 * @param model         Model to use (default: gemini-2.0-flash)
 */
export async function geminiJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model: GeminiModel = "gemini-2.0-flash",
): Promise<T> {
  const client = getClient();

  const genModel = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    safetySettings: SAFETY_SETTINGS,
  });

  let result: GenerateContentResult;
  try {
    result = await genModel.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,       // Low temperature for structured, consistent output
        maxOutputTokens: 4096,
      },
    });
  } catch (err) {
    throw new Error(`Gemini API call failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const text = result.response.text();
  if (!text || text.trim() === "") {
    throw new Error("Gemini returned an empty response. The content may have triggered safety filters.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Fallback: strip any accidental markdown fences before re-parsing
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  }
}

/** Returns true when the Gemini API key is available (enables AI mode) */
export function isAIEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
