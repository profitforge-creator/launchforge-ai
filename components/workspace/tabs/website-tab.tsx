"use client";

import { useState } from "react";
import type { BusinessResult, ProjectFile } from "@/types";

// ── Page map — matches paths from website-generator.ts ───────────────────────

interface PageDef {
  label: string;
  icon: string;
  description: string;
  /** Matches ProjectFile.path exactly */
  path: string;
  /** Fallback paths for legacy projects */
  legacyNames?: string[];
}

const PAGES: PageDef[] = [
  {
    label: "Homepage",
    icon: "🏠",
    description: "Hero, problem, features, testimonials, CTA",
    path: "/website/app/page.tsx",
    legacyNames: ["homepage.md", "page.tsx"],
  },
  {
    label: "Pricing",
    icon: "💰",
    description: "3-tier pricing with feature comparison",
    path: "/website/app/pricing/page.tsx",
    legacyNames: ["pricing.md"],
  },
  {
    label: "About",
    icon: "👋",
    description: "Origin story, mission, values",
    path: "/website/app/about/page.tsx",
    legacyNames: ["about.md"],
  },
  {
    label: "FAQ",
    icon: "💬",
    description: "Interactive accordion — 8 objection-handling questions",
    path: "/website/app/faq/page.tsx",
    legacyNames: ["faq.md"],
  },
];

// Extra files shown in the navigator but not as primary pages
const EXTRA_PATHS = [
  "/website/app/layout.tsx",
  "/website/app/globals.css",
  "/website/package.json",
  "/website/next.config.ts",
  "/website/tailwind.config.ts",
  "/website/tsconfig.json",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function findFile(files: ProjectFile[], def: PageDef): ProjectFile | undefined {
  // Try exact path first (new projects)
  const byPath = files.find((f) => f.path === def.path);
  if (byPath) return byPath;
  // Fallback: match by name (legacy projects)
  return files.find((f) => def.legacyNames?.includes(f.name));
}

function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length;
}

function countLines(content: string): number {
  return content.split("\n").length;
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Syntax highlighter ────────────────────────────────────────────────────────
// Minimal tokenizer — covers JSX/TSX well enough for reading without a library dep.

function highlight(code: string, language: string): string {
  if (language === "json") {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color:#9cdcfe">$1</span>:')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#ce9178">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span style="color:#569cd6">$1</span>')
      .replace(/:\s*(-?\d+\.?\d*)/g, ': <span style="color:#b5cea8">$1</span>');
  }

  if (language === "css") {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955">$1</span>')
      .replace(/(@\w[\w-]*)/g, '<span style="color:#c586c0">$1</span>')
      .replace(/([\w-]+)\s*:/g, '<span style="color:#9cdcfe">$1</span>:');
  }

  // TypeScript / TSX
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // line comments
    .replace(/(\/\/[^\n]*)/g, '<span style="color:#6a9955">$1</span>')
    // block comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955">$1</span>')
    // string literals (single, double, template)
    .replace(/(`[^`]*`)/g, '<span style="color:#ce9178">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#ce9178">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#ce9178">$1</span>')
    // keywords
    .replace(/\b(import|export|default|from|const|let|var|function|return|async|await|type|interface|extends|implements|class|new|if|else|for|while|in|of|true|false|null|undefined|void)\b/g,
      '<span style="color:#569cd6">$1</span>')
    // types
    .replace(/\b(string|number|boolean|object|any|never|unknown|React|NextConfig|Metadata)\b/g,
      '<span style="color:#4ec9b0">$1</span>')
    // JSX tags
    .replace(/(&lt;\/?)([\w.]+)/g, '$1<span style="color:#4ec9b0">$2</span>')
    // JSX attribute names
    .replace(/\s([\w-]+)=/g, ' <span style="color:#9cdcfe">$1</span>=')
    // numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
}

// ── Copy button with feedback ─────────────────────────────────────────────────

function CopyButton({ content, small }: { content: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const px = small ? "px-2 py-0.5" : "px-2.5 py-1";
  const label = copied ? "Copied!" : "Copy";

  return (
    <button
      onClick={handleCopy}
      className={`text-xs ${px} rounded transition-colors font-medium`}
      style={{
        backgroundColor: copied ? "hsl(151 60% 48% / 0.12)" : "hsl(220 13% 17%)",
        color: copied ? "hsl(151 60% 55%)" : "hsl(220 9% 52%)",
        border: `1px solid ${copied ? "hsl(151 60% 48% / 0.25)" : "transparent"}`,
      }}
    >
      {label}
    </button>
  );
}

// ── Code viewer ───────────────────────────────────────────────────────────────

function CodeViewer({ file }: { file: ProjectFile }) {
  const highlighted = highlight(file.content, file.language ?? "typescript");
  const lines = countLines(file.content);
  const words = countWords(file.content);
  const isMarkdown = file.language === "markdown";

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: "hsl(220 13% 7%)",
        border: "1px solid hsl(220 13% 16%)",
        borderRadius: 10,
      }}
    >
      {/* Viewer header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Traffic-light dots */}
          <div className="flex gap-1.5 shrink-0">
            {["hsl(0 72% 48%)", "hsl(38 90% 50%)", "hsl(120 60% 40%)"].map((c) => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span
            className="text-xs font-mono truncate"
            style={{ color: "hsl(220 9% 55%)" }}
          >
            {file.path}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>
            {lines.toLocaleString()} lines
          </span>
          <CopyButton content={file.content} small />
          <button
            onClick={() => triggerDownload(file.content, file.name)}
            className="text-xs px-2.5 py-0.5 rounded font-medium transition-colors"
            style={{ backgroundColor: "hsl(220 13% 17%)", color: "hsl(220 9% 52%)" }}
          >
            Download
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="flex-1 overflow-auto">
        {isMarkdown ? (
          <pre
            className="text-xs leading-relaxed whitespace-pre-wrap px-5 py-4"
            style={{ color: "hsl(220 9% 68%)", fontFamily: "var(--font-mono, monospace)" }}
          >
            {file.content}
          </pre>
        ) : (
          <div className="flex min-h-full">
            {/* Line numbers */}
            <div
              className="select-none shrink-0 px-3 py-4 text-right text-xs leading-5"
              style={{
                color: "hsl(220 9% 28%)",
                fontFamily: "var(--font-mono, monospace)",
                borderRight: "1px solid hsl(220 13% 12%)",
                minWidth: 44,
                userSelect: "none",
              }}
            >
              {file.content.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre
              className="flex-1 px-4 py-4 text-xs leading-5 overflow-x-auto"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: "hsl(220 9% 75%)",
                margin: 0,
              }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function NavItem({
  def,
  file,
  active,
  onClick,
}: {
  def: PageDef;
  file: ProjectFile | undefined;
  active: boolean;
  onClick: () => void;
}) {
  const missing = !file;

  return (
    <button
      onClick={onClick}
      disabled={missing}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors"
      style={{
        backgroundColor: active ? "hsl(213 94% 62% / 0.1)" : "transparent",
        border: active ? "1px solid hsl(213 94% 62% / 0.2)" : "1px solid transparent",
        opacity: missing ? 0.4 : 1,
        cursor: missing ? "not-allowed" : "pointer",
      }}
    >
      <span className="text-base shrink-0">{def.icon}</span>
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-medium truncate"
          style={{ color: active ? "hsl(213 94% 68%)" : "hsl(220 9% 70%)" }}
        >
          {def.label}
        </p>
        {file && (
          <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(220 9% 36%)" }}>
            {countLines(file.content).toLocaleString()} lines
          </p>
        )}
      </div>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(213 94% 62%)" }} />
      )}
    </button>
  );
}

// ── Config files section ──────────────────────────────────────────────────────

function ConfigFiles({ files }: { files: ProjectFile[] }) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<ProjectFile | null>(null);

  const configFiles = EXTRA_PATHS
    .map((p) => files.find((f) => f.path === p))
    .filter((f): f is ProjectFile => !!f);

  if (configFiles.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors"
        style={{
          backgroundColor: "hsl(220 13% 10%)",
          border: "1px solid hsl(220 13% 16%)",
        }}
      >
        <span className="text-xs font-medium" style={{ color: "hsl(220 9% 50%)" }}>
          Config files ({configFiles.length})
        </span>
        <svg
          width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          style={{
            color: "hsl(220 9% 35%)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-0.5">
          {configFiles.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelected(selected?.path === f.path ? null : f)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-left transition-colors"
              style={{
                backgroundColor: selected?.path === f.path ? "hsl(213 94% 62% / 0.06)" : "transparent",
                border: "1px solid transparent",
              }}
            >
              <span
                className="text-xs font-mono truncate"
                style={{ color: selected?.path === f.path ? "hsl(213 94% 65%)" : "hsl(220 9% 45%)" }}
              >
                {f.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-3" style={{ height: 300 }}>
          <CodeViewer file={selected} />
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WebsiteTab({ result }: { result: BusinessResult }) {
  const allFiles = result.projectFiles ?? [];
  const websiteFiles = allFiles.filter((f) => f.folder === "website");

  // Map each page def to its file
  const resolved = PAGES.map((def) => ({ def, file: findFile(websiteFiles, def) }));
  const foundCount = resolved.filter((r) => r.file).length;

  const [activeIdx, setActiveIdx] = useState(0);
  const activeFile = resolved[activeIdx]?.file;
  const activeDef = resolved[activeIdx]?.def;

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (websiteFiles.length === 0) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 9%)" }}
      >
        <p className="text-2xl mb-3">🌐</p>
        <p className="text-sm font-semibold mb-1" style={{ color: "hsl(220 9% 60%)" }}>
          Website not generated
        </p>
        <p className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>
          This project was built before website generation was added. Regenerate to get a deployable Next.js site.
        </p>
      </div>
    );
  }

  // ── Total stats ─────────────────────────────────────────────────────────────

  const totalLines = websiteFiles.reduce((n, f) => n + countLines(f.content), 0);

  return (
    <div className="space-y-4">
      {/* Header ── success banner */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{
          backgroundColor: "hsl(151 60% 48% / 0.08)",
          border: "1px solid hsl(151 60% 48% / 0.2)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "hsl(151 60% 55%)" }}>
              Website Generated Successfully
            </p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 42%)" }}>
              {websiteFiles.length} files · {totalLines.toLocaleString()} lines · deployable Next.js 14 project
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              for (const f of websiteFiles) triggerDownload(f.content, f.name);
            }}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "hsl(213 94% 62% / 0.1)",
              border: "1px solid hsl(213 94% 62% / 0.2)",
              color: "hsl(213 94% 65%)",
            }}
          >
            Download all
          </button>
        </div>
      </div>

      {/* Deploy hint */}
      <div
        className="rounded-lg px-4 py-2.5 text-xs flex items-start gap-2.5"
        style={{ backgroundColor: "hsl(213 94% 62% / 0.05)", border: "1px solid hsl(213 94% 62% / 0.12)" }}
      >
        <span style={{ color: "hsl(213 94% 65%)" }}>💡</span>
        <span style={{ color: "hsl(220 9% 48%)" }}>
          Export the ZIP, unzip into a folder, run <span style={{ fontFamily: "monospace", color: "hsl(220 9% 65%)" }}>npm install && npm run dev</span> to preview locally. Push to GitHub and import on Vercel to deploy. The AI Advisor can rewrite any page — try "make the homepage more conversion-focused."
        </span>
      </div>

      {/* Main layout: sidebar nav + code viewer */}
      <div className="flex gap-4" style={{ minHeight: 520 }}>

        {/* Sidebar */}
        <div className="shrink-0 space-y-1" style={{ width: 168 }}>
          <p className="text-xs font-medium px-1 mb-2" style={{ color: "hsl(220 9% 38%)" }}>
            Pages
          </p>
          {resolved.map(({ def, file }, i) => (
            <NavItem
              key={def.path}
              def={def}
              file={file}
              active={activeIdx === i}
              onClick={() => { if (file) setActiveIdx(i); }}
            />
          ))}

          <ConfigFiles files={websiteFiles} />
        </div>

        {/* Code viewer */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ minHeight: 520 }}>
          {activeFile && activeDef ? (
            <div className="flex flex-col gap-3 h-full">
              {/* Page meta bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeDef.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>
                      {activeDef.label}
                    </p>
                    <p className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
                      {activeDef.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton content={activeFile.content} />
                  <button
                    onClick={() => triggerDownload(activeFile.content, activeFile.name)}
                    className="text-xs px-2.5 py-1 rounded font-medium transition-colors"
                    style={{ backgroundColor: "hsl(220 13% 17%)", color: "hsl(220 9% 52%)" }}
                  >
                    Download
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="flex-1" style={{ minHeight: 460 }}>
                <CodeViewer file={activeFile} />
              </div>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center justify-center rounded-xl"
              style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 8%)" }}
            >
              <p className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>
                Select a page from the navigator
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
