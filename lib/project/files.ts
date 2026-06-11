/**
 * Project File System
 *
 * Converts all generation outputs into an organized ProjectFile[].
 * Files are organized into folders: /research, /product, /website, /marketing
 *
 * This is the canonical way to access all generated content — everything
 * routes through this module so the workspace file browser has one data source.
 */

import type { ProjectFile, FileLanguage, BusinessResult } from "@/types";
import type { ResearchAgentOutput, ProductAgentOutput, MarketingAgentOutput } from "@/lib/types/agents";
import type { AssetSet } from "@/lib/assets/types";

function inferLanguage(name: string): FileLanguage {
  if (name.endsWith(".ts") || name.endsWith(".tsx")) return "typescript";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".md")) return "markdown";
  return "text";
}

function makeFile(folder: string, name: string, content: string): ProjectFile {
  return {
    path: `/${folder}/${name}`,
    name,
    folder,
    content,
    language: inferLanguage(name),
    generatedAt: new Date().toISOString(),
  };
}

// ── Research files ────────────────────────────────────────────────────────────

function buildResearchFiles(research: ResearchAgentOutput): ProjectFile[] {
  const marketOverview = makeFile(
    "research",
    "market-overview.md",
    `# Market Overview: ${research.niche}

## Opportunity Summary
${research.opportunitySummary}

## Market Gaps Identified
${research.marketGaps.map((g, i) => `${i + 1}. ${g}`).join("\n")}

## Scoring
| Dimension | Score | Notes |
|-----------|-------|-------|
| Demand | ${research.demandScore}/100 | Market demand signal |
| Monetization | ${research.monetizationScore}/100 | How readily this market pays |
| Competition | ${research.competitionScore}/100 | Competitive intensity (lower = less crowded) |
| Difficulty | ${research.difficultyScore}/100 | Build difficulty (lower = easier) |

## Target Niche
**${research.niche}**

${research.opportunitySummary}`,
  );

  const competitorAnalysis = makeFile(
    "research",
    "competitor-analysis.md",
    `# Competitor Analysis: ${research.niche}

## Overview
${research.competitors.length} main competitors identified in this market.

${research.competitors
  .map(
    (c, i) => `## Competitor ${i + 1}: ${c.name}

**URL:** ${c.url}
**Monthly Revenue:** ${c.monthlyRevenue}
**Pricing:** ${c.pricing}
**Market Share:** ${c.marketShare}%

### Strengths
${c.strengths.map((s) => `- ${s}`).join("\n")}

### Weaknesses
${c.weaknesses.map((w) => `- ${w}`).join("\n")}

---`,
  )
  .join("\n\n")}

## Key Takeaways
- The primary weakness across competitors is: ${research.marketGaps[0] ?? "not yet identified"}
- The biggest market gap is: ${research.marketGaps[1] ?? "unclear positioning"}
- Your differentiation opportunity: ${research.marketGaps[2] ?? "better execution on existing demand"}`,
  );

  return [marketOverview, competitorAnalysis];
}

// ── Product files ─────────────────────────────────────────────────────────────

function buildProductFiles(product: ProductAgentOutput, assets: AssetSet | undefined): ProjectFile[] {
  const overview = makeFile(
    "product",
    "product-overview.md",
    `# ${product.productName}

## Tagline
${product.tagline}

## Description
${product.description}

## Target Audience
${product.targetAudience}

## Deliverables
${product.deliverables.map((d, i) => `${i + 1}. ${d}`).join("\n")}

## Pricing
- **Model:** ${product.pricingModel}
- **Suggested Price:** ${product.suggestedPrice}

## Time to Launch
${product.timeToLaunch}`,
  );

  const files: ProjectFile[] = [overview];

  if (assets?.assets) {
    for (const asset of assets.assets) {
      const safeSlug = asset.type.replace(/[^a-z0-9-]/g, "-");
      files.push(
        makeFile("product", `${safeSlug}.md`, asset.content),
      );
    }
  }

  return files;
}

// ── Marketing files ───────────────────────────────────────────────────────────

function buildMarketingFiles(marketing: MarketingAgentOutput, productName: string): ProjectFile[] {
  const hooks = makeFile(
    "marketing",
    "hooks.md",
    `# ${productName} — Content Hooks

## TikTok / Short-Form Hooks
${marketing.tiktokHooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## Content Pillars
${marketing.contentPillars.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Content Ideas
${marketing.contentIdeas
  .map(
    (idea) => `### ${idea.title}
**Platform:** ${idea.platform}
**Format:** ${idea.format}
**Hook:** ${idea.hook}`,
  )
  .join("\n\n")}`,
  );

  const calendar = makeFile(
    "marketing",
    "content-calendar.md",
    `# ${productName} — Content Calendar

${marketing.contentCalendar
  .map(
    (entry) => `## Week ${entry.week}
**Platform:** ${entry.platform}
**Content:** ${entry.content}
**Goal:** ${entry.goal}`,
  )
  .join("\n\n")}`,
  );

  const launchStrategy = makeFile(
    "marketing",
    "launch-strategy.md",
    `# ${productName} — Launch Strategy

${marketing.launchStrategy
  .map(
    (phase) => `## ${phase.phase} (${phase.duration})

**Goal:** ${phase.goal}

**Actions:**
${phase.actions.map((a) => `- ${a}`).join("\n")}`,
  )
  .join("\n\n")}`,
  );

  return [hooks, calendar, launchStrategy];
}

// ── Main assembler ────────────────────────────────────────────────────────────

/**
 * Builds the complete project file system from all generation outputs.
 * Called in assembleResult() — website files are passed in separately
 * because they come from the website generation step.
 */
export function buildProjectFiles(
  research: ResearchAgentOutput,
  product: ProductAgentOutput,
  marketing: MarketingAgentOutput,
  assets: AssetSet | undefined,
  websiteFiles: ProjectFile[],
): ProjectFile[] {
  return [
    ...buildResearchFiles(research),
    ...buildProductFiles(product, assets),
    ...websiteFiles,
    ...buildMarketingFiles(marketing, product.productName),
  ];
}

// ── File tree helpers ─────────────────────────────────────────────────────────

export interface FileTreeFolder {
  name: string;
  files: ProjectFile[];
  icon: string;
}

const FOLDER_ORDER = ["research", "product", "website", "marketing", "branding"];
const FOLDER_ICONS: Record<string, string> = {
  research:  "🔍",
  product:   "📦",
  website:   "🌐",
  marketing: "📣",
  branding:  "🎨",
};
const FOLDER_LABELS: Record<string, string> = {
  research:  "Research",
  product:   "Product",
  website:   "Website",
  marketing: "Marketing",
  branding:  "Branding",
};

export function buildFileTree(files: ProjectFile[]): FileTreeFolder[] {
  const grouped: Record<string, ProjectFile[]> = {};

  for (const file of files) {
    if (!grouped[file.folder]) grouped[file.folder] = [];
    grouped[file.folder].push(file);
  }

  return FOLDER_ORDER
    .filter((folder) => grouped[folder]?.length > 0)
    .map((folder) => ({
      name: FOLDER_LABELS[folder] ?? folder,
      files: grouped[folder],
      icon: FOLDER_ICONS[folder] ?? "📄",
    }));
}

/** Retrieves a file from a project by path. */
export function getProjectFile(result: BusinessResult, path: string): ProjectFile | undefined {
  return result.projectFiles?.find((f) => f.path === path);
}

/** Returns all files in a specific folder. */
export function getFilesInFolder(result: BusinessResult, folder: string): ProjectFile[] {
  return result.projectFiles?.filter((f) => f.folder === folder) ?? [];
}

/** Total file count across all folders. */
export function getProjectFileCount(result: BusinessResult): number {
  return result.projectFiles?.length ?? 0;
}
