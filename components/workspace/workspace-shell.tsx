"use client";

import { useState } from "react";
import { ResearchTab }   from "./tabs/research-tab";
import { ProductTab }    from "./tabs/product-tab";
import { WebsiteTab }    from "./tabs/website-tab";
import { MarketingTab }  from "./tabs/marketing-tab";
import { FilesTab }      from "./tabs/files-tab";
import { ChatTab }       from "./tabs/chat-tab";
import { formatRelativeDate } from "@/lib/utils";
import { getProjectFileCount } from "@/lib/project/files";
import type { BusinessResult } from "@/types";

// ── Panel tabs ────────────────────────────────────────────────────────────────

type PanelTab = "research" | "product" | "website" | "marketing" | "files";

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: "research",  label: "Research"  },
  { id: "product",   label: "Product"   },
  { id: "website",   label: "Website"   },
  { id: "marketing", label: "Marketing" },
  { id: "files",     label: "Files"     },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPanel() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d={dir === "left" ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
    </svg>
  );
}

// ── Thin top bar ──────────────────────────────────────────────────────────────

function TopBar({
  result,
  panelOpen,
  onTogglePanel,
}: {
  result: BusinessResult;
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  const scoreColor =
    result.scores.overall >= 80 ? "hsl(151 60% 48%)" :
    result.scores.overall >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";

  return (
    <div
      className="flex items-center justify-between px-4 shrink-0"
      style={{ height: 44, borderBottom: "1px solid hsl(220 13% 12%)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "hsl(220 9% 86%)" }}>
          {result.product.name}
        </p>
        <span className="text-xs tabular-nums font-medium" style={{ color: scoreColor }}>
          {result.scores.overall}
        </span>
        <span className="text-xs hidden sm:block" style={{ color: "hsl(220 9% 30%)" }}>
          {formatRelativeDate(result.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Deploy */}
        <button
          className="h-7 px-3 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
          onClick={() => alert("One-click deploy coming soon.")}
        >
          Deploy
        </button>

        {/* Panel toggle */}
        <button
          onClick={onTogglePanel}
          title={panelOpen ? "Close panel" : "Open panel"}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            backgroundColor: panelOpen ? "hsl(213 94% 62% / 0.1)" : "hsl(220 13% 14%)",
            border: panelOpen ? "1px solid hsl(213 94% 62% / 0.2)" : "1px solid hsl(220 13% 19%)",
            color: panelOpen ? "hsl(213 94% 65%)" : "hsl(220 9% 45%)",
          }}
        >
          <IconPanel />
        </button>
      </div>
    </div>
  );
}

// ── Right panel ───────────────────────────────────────────────────────────────

function RightPanel({
  result,
  onClose,
}: {
  result: BusinessResult;
  onClose: () => void;
}) {
  const [active, setActive] = useState<PanelTab>("research");
  const fileCount = getProjectFileCount(result);

  return (
    <div
      className="flex flex-col h-full shrink-0"
      style={{
        width: 420,
        borderLeft: "1px solid hsl(220 13% 12%)",
        backgroundColor: "hsl(220 14% 8%)",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 44, borderBottom: "1px solid hsl(220 13% 12%)" }}
      >
        {/* Tab pills */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {PANEL_TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="shrink-0 h-7 px-3 rounded-md text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? "hsl(220 13% 16%)" : "transparent",
                  color: isActive ? "hsl(220 9% 88%)" : "hsl(220 9% 40%)",
                }}
              >
                {tab.label}
                {tab.id === "files" && fileCount > 0 && (
                  <span className="ml-1.5 text-xs" style={{ color: "hsl(220 9% 35%)" }}>
                    {fileCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ml-2"
          style={{ color: "hsl(220 9% 36%)" }}
        >
          <IconChevron dir="right" />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
        {active === "research"  && <ResearchTab  result={result} />}
        {active === "product"   && <ProductTab   product={result.product} />}
        {active === "website"   && <WebsiteTab   result={result} />}
        {active === "marketing" && <MarketingTab marketing={result.marketing} />}
        {active === "files"     && <FilesTab     result={result} projectId={result.id} />}
      </div>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────

export function WorkspaceShell({ result }: { result: BusinessResult }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "hsl(220 14% 8%)" }}
    >
      <TopBar
        result={result}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />

      <div className="flex flex-1 min-h-0">
        {/* Primary: full-height chat */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <ChatTab workspaceId={result.id} />
        </div>

        {/* Collapsible right panel */}
        {panelOpen && (
          <RightPanel result={result} onClose={() => setPanelOpen(false)} />
        )}
      </div>
    </div>
  );
}
