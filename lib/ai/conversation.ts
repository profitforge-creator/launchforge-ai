/**
 * AI Conversation — Gemini-powered project assistant.
 *
 * Takes a user message + full project context, returns:
 *   - response: the assistant's reply (markdown)
 *   - fileUpdates: any project files the AI modified
 *
 * The AI can modify files by including a structured JSON section at the end
 * of its response. The parser extracts it and returns it as FileUpdate[].
 *
 * System prompt instructs Gemini to return a single JSON object:
 *   { "response": "...", "fileUpdates": [...] }
 */

import { callAI, DEFAULT_MODEL } from "@/lib/ai/provider";
import type { BusinessResult, FileUpdate } from "@/types";
import type { ConversationMessage } from "@/lib/conversation/types";

// ── System prompt ─────────────────────────────────────────────────────────────

const CONVERSATION_SYSTEM_PROMPT = `You are LaunchForge's AI Business Advisor — an expert in product strategy,
marketing, conversion optimization, and go-to-market execution for solo founders and small teams.

You have full access to the user's project: research findings, product concept, website files,
and marketing plan. Answer questions and give advice that is SPECIFIC to their actual project.

CRITICAL RULE: When the user asks you to modify or improve something (website copy, pricing,
about page, FAQ, marketing hooks, etc.), you MUST update the relevant project file(s).

Return ONLY a JSON object with this exact structure:
{
  "response": "your markdown response to the user",
  "fileUpdates": [
    {
      "path": "/website/app/page.tsx",
      "content": "the COMPLETE new file content",
      "description": "one-line description of what changed"
    }
  ]
}

fileUpdates must be an array (empty if no files changed).
When updating a file, always return the COMPLETE file content — not a diff or partial update.
Never apologize, never be vague. Be specific, direct, and actionable.`;

// ── Context builder ───────────────────────────────────────────────────────────

function buildConversationPrompt(
  userMessage: string,
  project: BusinessResult,
  history: ConversationMessage[],
  deploymentStatus?: string,
): string {
  const filesSection = project.projectFiles
    ? project.projectFiles
        .filter((f) => f.folder === "website" || f.folder === "marketing")
        .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 3000)}\n\`\`\``)
        .join("\n\n")
    : "(no files yet)";

  const historySection =
    history.length > 0
      ? `**Recent conversation (last ${history.length} turns):**\n` +
        history
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 600)}`)
          .join("\n\n")
      : "";

  const deploySection = deploymentStatus
    ? `**Deployment status:** ${deploymentStatus}`
    : "";

  return `PROJECT CONTEXT:

**Product:** ${project.product.name}
**Tagline:** ${project.product.tagline}
**Target audience:** ${project.product.targetAudience}
**Pricing:** ${project.product.suggestedPrice} (${project.product.pricingModel})
**Niche:** ${project.niche}
**Opportunity score:** ${project.scores.overall}/100 (${project.scores.category})
**Market gaps:** ${project.marketGaps.slice(0, 2).join("; ")}
**Deliverables:** ${project.product.deliverables.join(", ")}

**Competitors:**
${project.competitors.slice(0, 2).map((c) => `- ${c.name}: ${c.weaknesses.slice(0, 2).join(", ")}`).join("\n")}

${deploySection}

**Current project files (website + marketing):**
${filesSection}

${historySection ? `---\n\n${historySection}\n\n---` : ""}

**USER MESSAGE:** ${userMessage}

Remember: if the user is asking you to change or improve anything in the project files,
you MUST include the complete updated file in fileUpdates. Return the full file content.`;
}

// ── Response type ─────────────────────────────────────────────────────────────

interface GeminiConversationResponse {
  response: string;
  fileUpdates: FileUpdate[];
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface ConversationResult {
  response: string;
  fileUpdates: FileUpdate[];
}

export async function runConversation(
  userMessage: string,
  project: BusinessResult,
  history: ConversationMessage[] = [],
  deploymentStatus?: string,
): Promise<ConversationResult> {
  const prompt = buildConversationPrompt(userMessage, project, history, deploymentStatus);

  const result = await callAI<GeminiConversationResponse>(
    CONVERSATION_SYSTEM_PROMPT,
    prompt,
    DEFAULT_MODEL,
    { temperature: 0.6, maxTokens: 8192 },
  );

  return {
    response: result.response ?? "",
    fileUpdates: Array.isArray(result.fileUpdates) ? result.fileUpdates : [],
  };
}
