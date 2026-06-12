"use client";

import { useState, useCallback } from "react";
import { OverviewTab }  from "./tabs/overview-tab";
import { ResearchTab }  from "./tabs/research-tab";
import { ProductTab }   from "./tabs/product-tab";
import { WebsiteTab }   from "./tabs/website-tab";
import { MarketingTab } from "./tabs/marketing-tab";
import { FilesTab }     from "./tabs/files-tab";
import { ChatTab }      from "./tabs/chat-tab";
import { actionRegenerateSection } from "@/app/actions/generate";
import { formatRelativeDate } from "@/lib/utils";
import { getProjectFileCount } from "@/lib/project/files";
import type { BusinessResult } from "@/types";

// ── Tab types ─────────────────────────────────────────────────────────────────

type WorkspaceTab = "overview" | "research" | "product" | "website" | "marketing" | "files";

const TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "overview",   label: "Overview"   },
  { id: "research",   label: "Research"   },
  { id: "product",    label: "Product"    },
  { id: "website",    label: "Website"    },
  { id: "marketing",  label: "Marketing"  },
  { id: "files",      label: "Files"      },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconChat() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Score pill ────────────────────────────────────────────────────────────────

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80 ? "hsl(151 60% 48%)" :
    score >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";
  return <span className="text-xs tabular-nums font-semibold" style={{ color }}>{score}</span>;
}

// ── Top bar ───────────────────────────────────────────────────────────────────

function TopBar({
  result,
  activeTab,
  fileCount,
  chatOpen,
  regenerating,
  onTabChange,
  onToggleChat,
}: {
  result: BusinessResult;
  activeTab: WorkspaceTab;
  fileCount: number;
  chatOpen: boolean;
  regenerating: boolean;
  onTabChange: (tab: WorkspaceTab) => void;
  onToggleChat: () => void;
}) {
  return (
    <div
      className="flex items-center shrink-0 gap-0 overflow-hidden"
      style={{ height: 44, borderBottom: "1px solid hsl(220 13% 12%)" }}
    >
      <div
        className="flex items-center gap-2.5 px-4 shrink-0"
        style={{ borderRight: "1px solid hsl(220 13% 12%)" }}
      >
        <p className="text-sm font-semibold truncate max-w-[140px]" style={{ color: "hsl(220 9% 86%)" }}>
          {result.product.name}
        </p>
        <ScorePill score={result.scores.overall} />
        {regenerating && <IconSpinner />}
      </div>

      <div className="flex items-center flex-1 overflow-x-auto px-2 gap-0.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="shrink-0 h-7 px-3 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: isActive ? "hsl(220 13% 16%)" : "transparent",
                color: isActive ? "hsl(220 9% 88%)" : "hsl(220 9% 40%)",
              }}
            >
              {tab.label}
              {tab.id === "files" && fileCount > 0 && (
                <span className="ml-1.5" style={{ color: "hsl(220 9% 32%)" }}>{fileCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center gap-2 px-3 shrink-0"
        style={{ borderLeft: "1px solid hsl(220 13% 12%)" }}
      >
        <span className="text-xs hidden md:block" style={{ color: "hsl(220 9% 28%)" }}>
          {formatRelativeDate(result.createdAt)}
        </span>
        <button
          onClick={onToggleChat}
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: chatOpen ? "hsl(213 94% 62% / 0.1)" : "hsl(220 13% 14%)",
            border: chatOpen ? "1px solid hsl(213 94% 62% / 0.2)" : "1px solid hsl(220 13% 19%)",
            color: chatOpen ? "hsl(213 94% 65%)" : "hsl(220 9% 45%)",
          }}
        >
          <IconChat />
          <span className="hidden sm:block">{chatOpen ? "Close" : "Ask AI"}</span>
        </button>
      </div>
    </div>
  );
}

// ── Chat side panel ───────────────────────────────────────────────────────────

function ChatPanel({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  return (
    <div
      className="flex flex-col h-full shrink-0"
      style={{ width: 400, borderLeft: "1px solid hsl(220 13% 12%)", backgroundColor: "hsl(220 14% 8%)" }}
    >
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 44, borderBottom: "1px solid hsl(220 13% 12%)" }}
      >
        <span className="text-xs font-medium" style={{ color: "hsl(220 9% 50%)" }}>AI Advisor</span>
        <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: "hsl(220 9% 36%)" }}>
          <IconClose />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatTab workspaceId={workspaceId} />
      </div>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────

export function WorkspaceShell({ result: initialResult }: { result: BusinessResult }) {
  const [result, setResult] = useState<BusinessResult>(initialResult);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [chatOpen,  setChatOpen]  = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const fileCount = getProjectFileCount(result);

  const regenerate = useCallback(async (section: "product" | "website" | "marketing") => {
    setRegenerating(true);
    setRegenError(null);
    const r = await actionRegenerateSection(result.id, section);
    if (r.success) {
      setResult(r.data);
    } else {
      setRegenError(r.error);
    }
    setRegenerating(false);
  }, [result.id]);

  function navigateTo(tab: "research" | "product" | "website" | "marketing" | "files" | "chat") {
    if (tab === "chat") setChatOpen(true);
    else setActiveTab(tab);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      <TopBar
        result={result}
        activeTab={activeTab}
        fileCount={fileCount}
        chatOpen={chatOpen}
        regenerating={regenerating}
        onTabChange={setActiveTab}
        onToggleChat={() => setChatOpen((v) => !v)}
      />

      {regenError && (
        <div className="px-4 py-2 text-xs shrink-0" style={{ backgroundColor: "hsl(0 72% 12%)", color: "hsl(0 72% 70%)", borderBottom: "1px solid hsl(0 72% 20%)" }}>
          Regeneration failed: {regenError}
          <button className="ml-3 underline" onClick={() => setRegenError(null)}>Dismiss</button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-6">
          {activeTab === "overview"  && <OverviewTab  result={result} onNavigate={navigateTo} onRegenerate={regenerate} regenerating={regenerating} />}
          {activeTab === "research"  && <ResearchTab  result={result} />}
          {activeTab === "product"   && <ProductTab   product={result.product} onRegenerate={() => regenerate("product")} regenerating={regenerating} />}
          {activeTab === "website"   && <WebsiteTab   result={result} />}
          {activeTab === "marketing" && <MarketingTab marketing={result.marketing} onRegenerate={() => regenerate("marketing")} regenerating={regenerating} />}
          {activeTab === "files"     && <FilesTab     result={result} projectId={result.id} />}
        </div>

        {chatOpen && <ChatPanel workspaceId={result.id} onClose={() => setChatOpen(false)} />}
      </div>
    </div>
  );
}
