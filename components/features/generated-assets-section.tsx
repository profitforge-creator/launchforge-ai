"use client";

import { useState } from "react";
import { exportAsset, triggerDownload } from "@/lib/export";
import type { GeneratedAsset, AssetSet, ExportFormat } from "@/lib/assets/types";

// ── Asset type metadata ───────────────────────────────────────────────────────

const ASSET_TYPE_LABELS: Record<string, string> = {
  "table-of-contents": "Table of Contents",
  "introduction": "Introduction",
  "chapter": "Chapter",
  "sample-pages": "Sample Pages",
  "resource-list": "Resource List",
  "lesson-outline": "Lesson Outline",
  "flashcard-deck": "Flashcard Deck",
  "quiz": "Quiz",
  "worksheet": "Worksheet",
  "proposal-template": "Proposal Template",
  "onboarding-checklist": "Onboarding Checklist",
  "sop-document": "SOP Document",
  "outreach-script": "Outreach Script",
  "client-workflow": "Client Workflow",
  "database-schema": "Database Schema",
  "page-template": "Page Template",
  "workflow-template": "Workflow Template",
  "overview-document": "Overview Document",
  "quick-start-guide": "Quick Start Guide",
  "faq-template": "FAQ Template",
};

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "Content":    { color: "hsl(213 94% 62%)",  bg: "hsl(213 94% 62% / 0.1)"  },
  "Structure":  { color: "hsl(275 80% 60%)",  bg: "hsl(275 80% 60% / 0.1)"  },
  "Templates":  { color: "hsl(38 90% 55%)",   bg: "hsl(38 90% 55% / 0.1)"   },
  "Operations": { color: "hsl(151 60% 48%)",  bg: "hsl(151 60% 48% / 0.1)"  },
  "Sales":      { color: "hsl(0 72% 58%)",    bg: "hsl(0 72% 58% / 0.1)"    },
  "Curriculum": { color: "hsl(213 94% 62%)",  bg: "hsl(213 94% 62% / 0.1)"  },
  "Study Tools":{ color: "hsl(38 90% 55%)",   bg: "hsl(38 90% 55% / 0.1)"   },
  "Assessment": { color: "hsl(151 60% 48%)",  bg: "hsl(151 60% 48% / 0.1)"  },
  "Reference":  { color: "hsl(220 9% 55%)",   bg: "hsl(220 9% 55% / 0.1)"   },
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { color: "hsl(220 9% 55%)", bg: "hsl(220 9% 55% / 0.1)" };
}

// ── Download button ───────────────────────────────────────────────────────────

function DownloadButton({
  asset,
  format,
  label,
  supported = true,
}: {
  asset: GeneratedAsset;
  format: ExportFormat;
  label: string;
  supported?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!supported || downloading) return;
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 80)); // brief visual feedback
    const result = exportAsset(asset, format);
    triggerDownload(result);
    setDownloading(false);
  }

  if (!supported) {
    return (
      <span
        className="text-xs px-2 py-1 rounded cursor-not-allowed select-none"
        style={{
          border: "1px solid hsl(220 13% 18%)",
          color: "hsl(220 9% 35%)",
          backgroundColor: "transparent",
        }}
        title="Coming soon"
      >
        {label}
      </span>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="text-xs px-2 py-1 rounded transition-all"
      style={{
        border: "1px solid hsl(220 13% 22%)",
        color: downloading ? "hsl(220 9% 45%)" : "hsl(220 9% 75%)",
        backgroundColor: downloading ? "hsl(220 13% 14%)" : "hsl(220 13% 13%)",
        cursor: downloading ? "wait" : "pointer",
      }}
    >
      {downloading ? "..." : `↓ ${label}`}
    </button>
  );
}

// ── Asset card ────────────────────────────────────────────────────────────────

function AssetCard({ asset }: { asset: GeneratedAsset }) {
  const [expanded, setExpanded] = useState(false);
  const categoryStyle = getCategoryStyle(asset.category);
  const previewText = asset.content.slice(0, 420).replace(/#+\s/g, "").replace(/\*\*/g, "").trim();
  const hasMoreContent = asset.content.length > 420;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}
    >
      {/* Card header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ color: categoryStyle.color, backgroundColor: categoryStyle.bg }}
            >
              {asset.category}
            </span>
            <span className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>
              {ASSET_TYPE_LABELS[asset.type] ?? asset.type}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs" style={{ color: "hsl(220 9% 35%)" }}>
            <span>{asset.wordCount.toLocaleString()} words</span>
            <span>·</span>
            <span>~{asset.estimatedPages}p</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-1.5" style={{ color: "hsl(220 9% 90%)" }}>
          {asset.name}
        </h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(220 9% 50%)" }}>
          {asset.description}
        </p>

        {/* Preview block */}
        <div
          className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: "hsl(220 13% 8%)", border: "1px solid hsl(220 13% 14%)" }}
        >
          <p className="text-xs mb-2 font-medium" style={{ color: "hsl(220 9% 38%)" }}>
            Preview
          </p>
          <div
            className="text-xs leading-relaxed font-mono"
            style={{ color: "hsl(220 9% 65%)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {expanded ? asset.content.slice(0, 1800) : previewText}
            {!expanded && hasMoreContent && (
              <span style={{ color: "hsl(220 9% 35%)" }}>...</span>
            )}
          </div>
          {hasMoreContent && (
            <button
              className="text-xs mt-2 underline"
              style={{ color: "hsl(213 94% 62%)" }}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      {/* Download footer */}
      <div
        className="px-5 py-3 flex items-center gap-2 flex-wrap"
        style={{ borderTop: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 10%)" }}
      >
        <span className="text-xs mr-1" style={{ color: "hsl(220 9% 38%)" }}>Export:</span>
        <DownloadButton asset={asset} format="markdown" label=".md" />
        <DownloadButton asset={asset} format="json" label=".json" />
        <DownloadButton asset={asset} format="pdf" label=".pdf" supported={false} />
        <DownloadButton asset={asset} format="docx" label=".docx" supported={false} />
      </div>
    </div>
  );
}

// ── Download All button ───────────────────────────────────────────────────────

function DownloadAllButton({ assets }: { assets: GeneratedAsset[] }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadAll() {
    if (downloading) return;
    setDownloading(true);
    for (const asset of assets) {
      const result = exportAsset(asset, "markdown");
      triggerDownload(result);
      await new Promise((r) => setTimeout(r, 150)); // slight delay between downloads
    }
    setDownloading(false);
  }

  return (
    <button
      onClick={handleDownloadAll}
      disabled={downloading}
      className="h-8 px-4 rounded text-sm font-medium transition-colors"
      style={{
        border: "1px solid hsl(213 94% 62% / 0.4)",
        backgroundColor: "hsl(213 94% 62% / 0.08)",
        color: downloading ? "hsl(220 9% 45%)" : "hsl(213 94% 62%)",
        cursor: downloading ? "wait" : "pointer",
      }}
    >
      {downloading ? "Downloading..." : `↓ Download All (.md)`}
    </button>
  );
}

// ── Main section component ────────────────────────────────────────────────────

export function GeneratedAssetsSection({ assetSet }: { assetSet: AssetSet }) {
  const { assets, productCategory } = assetSet;

  // Group assets by category for display
  const groups = assets.reduce<Record<string, GeneratedAsset[]>>((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {});

  const totalWords = assets.reduce((s, a) => s + a.wordCount, 0);
  const totalPages = assets.reduce((s, a) => s + a.estimatedPages, 0);

  const categoryLabel: Record<string, string> = {
    "ebook": "Ebook Package",
    "study-guide": "Study Guide Package",
    "agency-service": "Agency Service Package",
    "notion-system": "Notion System Package",
    "course": "Course Package",
    "newsletter": "Newsletter Package",
    "saas": "SaaS Package",
    "generic": "Business Package",
  };

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div
        className="rounded-xl p-5 flex items-center justify-between flex-wrap gap-4"
        style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 11%)" }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 90%)" }}>
            {categoryLabel[productCategory] ?? "Business Package"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 45%)" }}>
            {assets.length} assets · {totalWords.toLocaleString()} words · ~{totalPages} pages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DownloadAllButton assets={assets} />
          <span className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>PDF/DOCX coming soon</span>
        </div>
      </div>

      {/* Assets grid — grouped by category */}
      {Object.entries(groups).map(([category, groupAssets]) => (
        <div key={category}>
          {Object.keys(groups).length > 1 && (
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: getCategoryStyle(category).color }}
            >
              {category}
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {groupAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <p className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>
        All assets export as Markdown — readable in any text editor, importable into Notion, Obsidian, or any docs platform.
        PDF and DOCX export coming in a future update.
      </p>
    </div>
  );
}
