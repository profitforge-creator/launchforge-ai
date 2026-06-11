"use client";

import { useState } from "react";
import { OpportunityTab }     from "./tabs/opportunity-tab";
import { CompetitorsTab }     from "./tabs/competitors-tab";
import { ProductTab }         from "./tabs/product-tab";
import { AssetsTab }          from "./tabs/assets-tab";
import { MarketingTab }       from "./tabs/marketing-tab";
import { RecommendationsTab } from "./tabs/recommendations-tab";
import { ConversationPanel }  from "./conversation-panel";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import type { BusinessResult } from "@/types";

// ── Tab definition ────────────────────────────────────────────────────────────

type TabId = "opportunity" | "competitors" | "product" | "assets" | "marketing" | "recommendations";

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
}

function buildTabs(result: BusinessResult): TabDef[] {
  return [
    { id: "opportunity",      label: "Opportunity" },
    { id: "competitors",      label: "Competitors",     count: result.competitors.length },
    { id: "product",          label: "Product" },
    { id: "assets",           label: "Assets",          count: result.assets?.assets.length },
    { id: "marketing",        label: "Marketing" },
    { id: "recommendations",  label: "Recommendations", count: result.recommendations.length },
  ];
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div
      className="flex items-end gap-0 px-5 shrink-0"
      style={{ borderBottom: "1px solid hsl(220 13% 14%)" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 h-10 px-4 text-xs font-medium transition-colors relative"
            style={{ color: isActive ? "hsl(220 9% 90%)" : "hsl(220 9% 45%)" }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="text-xs px-1 rounded"
                style={{
                  backgroundColor: "hsl(220 13% 18%)",
                  color: "hsl(220 9% 50%)",
                  fontSize: "10px",
                }}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ backgroundColor: "hsl(213 94% 62%)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Workspace header ──────────────────────────────────────────────────────────

function WorkspaceHeader({ result }: { result: BusinessResult }) {
  const scoreColor =
    result.scores.overall >= 80 ? "hsl(151 60% 48%)" :
    result.scores.overall >= 65 ? "hsl(38 90% 55%)" :
    "hsl(0 72% 58%)";

  return (
    <div
      className="flex items-center justify-between px-5 h-14 shrink-0"
      style={{ borderBottom: "1px solid hsl(220 13% 14%)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1
            className="text-sm font-semibold truncate max-w-xs"
            style={{ color: "hsl(220 9% 92%)" }}
          >
            {result.niche}
          </h1>
          <p className="text-xs" style={{ color: "hsl(220 9% 42%)" }}>
            {result.product.name} · {formatRelativeDate(result.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: scoreColor }}
          >
            {result.scores.overall}
          </span>
          <span className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>
            / 100
          </span>
        </div>
        <Badge variant="success">{result.scores.category}</Badge>
      </div>
    </div>
  );
}

// ── Main workspace shell ──────────────────────────────────────────────────────

export function WorkspaceShell({ result }: { result: BusinessResult }) {
  const [activeTab, setActiveTab] = useState<TabId>("opportunity");
  const tabs = buildTabs(result);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <WorkspaceHeader result={result} />
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
          {activeTab === "opportunity"     && <OpportunityTab      result={result} />}
          {activeTab === "competitors"     && <CompetitorsTab      competitors={result.competitors} />}
          {activeTab === "product"         && <ProductTab          product={result.product} />}
          {activeTab === "assets"          && <AssetsTab           assets={result.assets} />}
          {activeTab === "marketing"       && <MarketingTab        marketing={result.marketing} />}
          {activeTab === "recommendations" && <RecommendationsTab  recommendations={result.recommendations} />}
        </div>
      </div>

      {/* Conversation panel — always mounted, collapses to input bar */}
      <ConversationPanel workspaceId={result.id} />
    </div>
  );
}
