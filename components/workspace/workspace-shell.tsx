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

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = "research" | "product" | "website" | "marketing" | "files" | "chat";

interface TabDef { id: TabId; label: string; icon: string; count?: number }

function buildTabs(result: BusinessResult): TabDef[] {
  const fileCount    = getProjectFileCount(result);
  const websiteCount = result.projectFiles?.filter((f) => f.folder === "website").length ?? 0;
  return [
    { id: "research",  label: "Research",   icon: "🔍", count: result.competitors.length },
    { id: "product",   label: "Product",    icon: "📦" },
    { id: "website",   label: "Website",    icon: "🌐", count: websiteCount || undefined },
    { id: "marketing", label: "Marketing",  icon: "📣" },
    { id: "files",     label: "Files",      icon: "📁", count: fileCount || undefined },
    { id: "chat",      label: "Chat",       icon: "💬" },
  ];
}

// ── Score pill ────────────────────────────────────────────────────────────────

function ScorePill({ score, category }: { score: number; category: string }) {
  const color =
    score >= 80 ? "hsl(151 60% 48%)" :
    score >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";
  const bg =
    score >= 80 ? "hsl(151 60% 48% / 0.1)" :
    score >= 65 ? "hsl(38 90% 55% / 0.1)" :
    "hsl(0 72% 58% / 0.1)";
  const border =
    score >= 80 ? "hsl(151 60% 48% / 0.22)" :
    score >= 65 ? "hsl(38 90% 55% / 0.22)" :
    "hsl(0 72% 58% / 0.22)";

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <span className="text-sm font-bold tabular-nums" style={{ color }}>{score}</span>
      <span className="text-xs font-medium" style={{ color: "hsl(220 9% 50%)" }}>{category}</span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
      <span className="text-xs font-medium" style={{ color: "hsl(220 9% 42%)" }}>Ready to deploy</span>
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────

function TopBar({
  result,
  onTogglePanel,
  panelOpen,
}: {
  result: BusinessResult;
  onTogglePanel: () => void;
  panelOpen: boolean;
}) {
  const fileCount = getProjectFileCount(result);

  return (
    <div
      className="flex items-center gap-4 px-4 shrink-0"
      style={{ height: 52, borderBottom: "1px solid hsl(220 13% 12%)" }}
    >
      {/* Project identity */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
          style={{ backgroundColor: "hsl(220 13% 15%)", border: "1px solid hsl(220 13% 20%)" }}
        >
          🚀
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold truncate" style={{ color: "hsl(220 9% 94%)" }}>
            {result.product.name}
          </h1>
          <div className="flex items-center gap-2 mt-px">
            <StatusBadge />
            <span className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>·</span>
            <span className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>
              {formatRelativeDate(result.createdAt)}
            </span>
            {fileCount > 0 && (
              <>
                <span className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>·</span>
                <span className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>{fileCount} files</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ScorePill score={result.scores.overall} category={result.scores.category} />

        {/* Export button */}
        <button
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: "hsl(220 13% 14%)",
            border: "1px solid hsl(220 13% 20%)",
            color: "hsl(220 9% 55%)",
          }}
          onClick={() => alert("Export coming soon — use the Files tab to download individual files.")}
        >
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export
        </button>

        {/* Deploy button */}
        <button
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: "hsl(213 94% 58%)",
            color: "hsl(220 16% 6%)",
          }}
          onClick={() => alert("One-click deploy coming soon — your site will push to Vercel automatically.")}
        >
          <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 22.525H0l12-21.05 12 21.05z" />
          </svg>
          Deploy
        </button>

        {/* Info panel toggle */}
        <button
          onClick={onTogglePanel}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          title="Project info"
          style={{
            backgroundColor: panelOpen ? "hsl(213 94% 62% / 0.1)" : "hsl(220 13% 14%)",
            border: panelOpen ? "1px solid hsl(213 94% 62% / 0.2)" : "1px solid hsl(220 13% 20%)",
            color: panelOpen ? "hsl(213 94% 65%)" : "hsl(220 9% 42%)",
          }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }: { tabs: TabDef[]; active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div
      className="flex items-end gap-0 px-4 shrink-0 overflow-x-auto"
      style={{ borderBottom: "1px solid hsl(220 13% 12%)" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 h-10 px-3.5 text-xs font-medium transition-colors relative shrink-0"
            style={{ color: isActive ? "hsl(220 9% 92%)" : "hsl(220 9% 40%)" }}
          >
            <span style={{ opacity: isActive ? 1 : 0.65 }}>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="px-1.5 rounded"
                style={{
                  backgroundColor: isActive ? "hsl(213 94% 62% / 0.12)" : "hsl(220 13% 16%)",
                  color: isActive ? "hsl(213 94% 68%)" : "hsl(220 9% 40%)",
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-3.5 right-3.5 h-px rounded-full"
                style={{ backgroundColor: "hsl(213 94% 62%)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Right info panel ──────────────────────────────────────────────────────────

const AGENT_STAGES = [
  { label: "Research Agent",   icon: "🔍", desc: "Market analysis complete" },
  { label: "Product Agent",    icon: "📦", desc: "Product architecture complete" },
  { label: "Website Agent",    icon: "🌐", desc: "Next.js site generated" },
  { label: "Marketing Agent",  icon: "📣", desc: "Launch strategy complete" },
  { label: "Critic Agent",     icon: "🎯", desc: "Quality review passed" },
  { label: "Assets Agent",     icon: "📁", desc: "Project files assembled" },
];

function InfoPanel({ result }: { result: BusinessResult }) {
  const websiteFiles = result.projectFiles?.filter((f) => f.folder === "website") ?? [];
  const totalLines   = websiteFiles.reduce((n, f) => n + f.content.split("\n").length, 0);
  const fileCount    = getProjectFileCount(result);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ width: 240, borderLeft: "1px solid hsl(220 13% 12%)", backgroundColor: "hsl(220 16% 6%)" }}
    >
      <div className="px-4 py-4 space-y-5">

        {/* Project stats */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 28%)", letterSpacing: "0.08em" }}>
            Project Stats
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Score",      value: `${result.scores.overall}/100` },
              { label: "Competitors",value: result.competitors.length },
              { label: "Files",      value: fileCount },
              { label: "Lines",      value: totalLines.toLocaleString() },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg px-3 py-2.5"
                style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}
              >
                <p className="text-base font-bold" style={{ color: "hsl(220 9% 88%)" }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent pipeline */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 28%)", letterSpacing: "0.08em" }}>
            Agent Pipeline
          </p>
          <div className="space-y-1.5">
            {AGENT_STAGES.map((agent) => (
              <div key={agent.label} className="flex items-center gap-2.5">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)", flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "hsl(220 9% 62%)" }}>{agent.label}</p>
                  <p className="text-xs truncate" style={{ color: "hsl(220 9% 30%)" }}>{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 28%)", letterSpacing: "0.08em" }}>
            Quick Actions
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Export ZIP",       icon: "📦", action: "Files tab → Export ZIP" },
              { label: "Push to GitHub",   icon: "🐙", action: "Coming soon" },
              { label: "Deploy to Vercel", icon: "▲",  action: "Coming soon" },
              { label: "Buy Domain",       icon: "🌐",  action: "Coming soon" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: "hsl(220 13% 10%)",
                  border: "1px solid hsl(220 13% 15%)",
                  opacity: item.action === "Coming soon" ? 0.5 : 1,
                  cursor: item.action === "Coming soon" ? "not-allowed" : "pointer",
                }}
                onClick={() => item.action !== "Coming soon" && alert(item.action)}
                disabled={item.action === "Coming soon"}
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: "hsl(220 9% 62%)" }}>{item.label}</p>
                  {item.action === "Coming soon" && (
                    <p className="text-xs" style={{ color: "hsl(220 9% 28%)", fontSize: 10 }}>Coming soon</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Niche */}
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}
        >
          <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>Niche</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(220 9% 58%)" }}>{result.niche}</p>
        </div>

      </div>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────

export function WorkspaceShell({ result }: { result: BusinessResult }) {
  const [activeTab, setActiveTab]   = useState<TabId>("chat");
  const [panelOpen, setPanelOpen]   = useState(false);
  const tabs = buildTabs(result);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "hsl(220 16% 7%)" }}>
      <TopBar
        result={result}
        onTogglePanel={() => setPanelOpen((v) => !v)}
        panelOpen={panelOpen}
      />
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Body: content + optional right panel */}
      <div className="flex flex-1 min-h-0">
        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          {activeTab === "chat" ? (
            // Chat tab gets full height with its own scroll
            <ChatTab workspaceId={result.id} />
          ) : (
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {activeTab === "research"  && <ResearchTab  result={result} />}
              {activeTab === "product"   && <ProductTab   product={result.product} />}
              {activeTab === "website"   && <WebsiteTab   result={result} />}
              {activeTab === "marketing" && <MarketingTab marketing={result.marketing} />}
              {activeTab === "files"     && <FilesTab     result={result} projectId={result.id} />}
            </div>
          )}
        </div>

        {/* Right info panel */}
        {panelOpen && <InfoPanel result={result} />}
      </div>
    </div>
  );
}
