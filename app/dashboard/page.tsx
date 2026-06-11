"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  actionRunResearch,
  actionRunProduct,
  actionRunMarketing,
  actionRunCritic,
  actionRunAssets,
  actionRunWebsite,
  actionFinalizeProject,
} from "@/app/actions/generate";
import type { BusinessFormData, ProjectFile } from "@/types";
import type { AssetSet } from "@/lib/assets/types";
import type {
  ResearchAgentOutput,
  ProductAgentOutput,
  MarketingAgentOutput,
  CriticAgentOutput,
} from "@/lib/types/agents";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "loading" | "done" | "error";
  isProgress?: boolean;
}

// ── Suggestions ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "I need a business idea",
  "I have no skills — help me",
  "Build me a study guide business",
  "Create a digital product for students",
  "I like anime and want passive income",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectBusinessType(idea: string): string {
  const lower = idea.toLowerCase();
  if (/notion|template|dashboard|system|workspace/.test(lower)) return "digital-product";
  if (/app|saas|software|tool|platform/.test(lower)) return "saas";
  if (/content|newsletter|youtube|tiktok|instagram|creator|blog/.test(lower)) return "content";
  if (/agency|freelance|consulting|service|client/.test(lower)) return "agency";
  if (/course|teach|learn|education|tutoring|coaching/.test(lower)) return "digital-product";
  return "open";
}

function expandIdea(idea: string): BusinessFormData {
  return {
    idea,
    interests: idea,
    skills: "open to any direction",
    timePerWeek: "10-20",
    incomeGoal: "1000",
    businessType: detectBusinessType(idea),
  };
}

function uid() {
  return Math.random().toString(36).slice(2);
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-lg px-4 py-2.5 rounded-2xl rounded-tr-md text-sm leading-relaxed"
          style={{
            backgroundColor: "hsl(220 13% 14%)",
            border: "1px solid hsl(220 13% 20%)",
            color: "hsl(220 9% 88%)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <LogoMark />
      <div className="flex-1 min-w-0 pt-0.5">
        {msg.status === "loading" ? (
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "hsl(220 9% 55%)" }}>{msg.content}</span>
            <Spinner />
          </div>
        ) : (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              color: msg.status === "error" ? "hsl(0 72% 62%)" : "hsl(220 9% 78%)",
            }}
          >
            {msg.content}
          </p>
        )}
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div
      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
      style={{ backgroundColor: "hsl(213 94% 58% / 0.12)", border: "1px solid hsl(213 94% 58% / 0.2)" }}
    >
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
      </svg>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-3.5 h-3.5 shrink-0"
      fill="none" viewBox="0 0 24 24"
      style={{ color: "hsl(213 94% 62%)" }}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Empty / welcome state ─────────────────────────────────────────────────────

function WelcomeState({ onSuggestion }: { onSuggestion: (t: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-20 text-center select-none">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "hsl(213 94% 58% / 0.1)", border: "1px solid hsl(213 94% 58% / 0.18)" }}
      >
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold mb-2" style={{ color: "hsl(220 9% 90%)" }}>
        What do you want to build?
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: "hsl(220 9% 40%)" }}>
        Describe an idea, interest, or goal. LaunchForge will research the market, design a product, and build your website.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left px-4 py-2.5 rounded-xl text-sm transition-colors"
            style={{
              backgroundColor: "hsl(220 13% 11%)",
              border: "1px solid hsl(220 13% 17%)",
              color: "hsl(220 9% 58%)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 14%)";
              (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 72%)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 11%)";
              (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 58%)";
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Input bar ─────────────────────────────────────────────────────────────────

function InputBar({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  const canSend = value.trim().length >= 2 && !disabled;

  return (
    <div className="px-4 pb-4 shrink-0">
      <div
        className="flex items-end gap-3 rounded-2xl px-4 py-3 max-w-2xl mx-auto"
        style={{
          backgroundColor: "hsl(220 13% 11%)",
          border: "1px solid hsl(220 13% 19%)",
        }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe what you want to build..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
          style={{
            color: "hsl(220 9% 85%)",
            caretColor: "hsl(213 94% 62%)",
            minHeight: 22,
            maxHeight: 160,
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!canSend}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            backgroundColor: canSend ? "hsl(213 94% 58%)" : "hsl(220 13% 18%)",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          <svg
            width="13" height="13" fill="none" viewBox="0 0 24 24"
            stroke={canSend ? "hsl(220 13% 8%)" : "hsl(220 9% 32%)"}
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs mt-2" style={{ color: "hsl(220 9% 24%)" }}>
        Shift+Enter for new line
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [building, setBuilding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function addMsg(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg]);
    return msg.id;
  }

  function updateMsg(id: string, patch: Partial<ChatMessage>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  const build = useCallback(
    async (idea: string) => {
      if (building || idea.trim().length < 2) return;
      setBuilding(true);
      setInput("");

      // User message
      addMsg({ id: uid(), role: "user", content: idea });

      const form = expandIdea(idea.trim());

      let research: ResearchAgentOutput | null = null;
      let product: ProductAgentOutput | null = null;
      let marketing: MarketingAgentOutput | null = null;
      let critic: CriticAgentOutput | null = null;
      let assets: AssetSet | null = null;
      let websiteFiles: ProjectFile[] = [];

      // ── Research ───────────────────────────────────────────────────────────
      const r0id = uid();
      addMsg({ id: r0id, role: "assistant", content: "Researching the market...", status: "loading", isProgress: true });

      const r0 = await actionRunResearch(form);
      if (!r0.success) {
        updateMsg(r0id, { content: r0.error, status: "error" });
        setBuilding(false);
        return;
      }
      research = r0.data;
      const topCompetitors = research.competitors?.slice(0, 3).map((c) => c.name).join(", ") ?? "none found";
      updateMsg(r0id, {
        content: `Market researched.\n\nNiche: ${research.niche}\nDemand: ${research.demandScore}/100  ·  Competition: ${research.competitionScore}/100  ·  Monetization: ${research.monetizationScore}/100\nTop competitors: ${topCompetitors}\n\n${research.opportunitySummary}`,
        status: "done",
      });

      // ── Product ────────────────────────────────────────────────────────────
      const r1id = uid();
      addMsg({ id: r1id, role: "assistant", content: "Designing the product...", status: "loading", isProgress: true });

      const r1 = await actionRunProduct(form, research);
      if (!r1.success) {
        updateMsg(r1id, { content: r1.error, status: "error" });
        setBuilding(false);
        return;
      }
      product = r1.data;
      updateMsg(r1id, {
        content: `Product designed.\n\n${product.productName} — ${product.tagline}\n\nAudience: ${product.targetAudience}\nPricing: ${product.pricingModel} · ${product.suggestedPrice}\nTime to launch: ${product.timeToLaunch}\n\nDeliverables:\n${product.deliverables?.slice(0, 4).map((d) => `· ${d}`).join("\n")}`,
        status: "done",
      });

      // ── Assets ─────────────────────────────────────────────────────────────
      const r2id = uid();
      addMsg({ id: r2id, role: "assistant", content: "Generating product files...", status: "loading", isProgress: true });

      const r2 = await actionRunAssets(form, research, product);
      if (!r2.success) {
        updateMsg(r2id, { content: r2.error, status: "error" });
        setBuilding(false);
        return;
      }
      assets = r2.data;
      updateMsg(r2id, { content: `Product files created — ${assets ? Object.keys(assets).length : 0} asset sets ready.`, status: "done" });

      // ── Website ────────────────────────────────────────────────────────────
      const r3id = uid();
      addMsg({ id: r3id, role: "assistant", content: "Building the website...", status: "loading", isProgress: true });

      const r3 = await actionRunWebsite(product, research);
      if (!r3.success) {
        updateMsg(r3id, { content: r3.error, status: "error" });
        setBuilding(false);
        return;
      }
      websiteFiles = r3.data;
      const pageFiles = websiteFiles.filter((f) => f.name.endsWith(".tsx")).map((f) => f.path.replace("/website/app/", "/")).join("  ·  ");
      updateMsg(r3id, {
        content: `Website built — ${websiteFiles.length} files.\n\nPages: ${pageFiles || "homepage, pricing, about, faq"}\n\nReady to deploy to Vercel. Open the panel to preview the code.`,
        status: "done",
      });

      // ── Marketing ──────────────────────────────────────────────────────────
      const r4id = uid();
      addMsg({ id: r4id, role: "assistant", content: "Creating the marketing system...", status: "loading", isProgress: true });

      const r4 = await actionRunMarketing(form, research, product);
      if (!r4.success) {
        updateMsg(r4id, { content: r4.error, status: "error" });
        setBuilding(false);
        return;
      }
      marketing = r4.data;

      const r5 = await actionRunCritic(form, research, product, marketing);
      if (!r5.success) {
        updateMsg(r4id, { content: r5.error, status: "error" });
        setBuilding(false);
        return;
      }
      critic = r5.data;
      const hooks = marketing.tiktokHooks?.slice(0, 2).map((h) => `"${h}"`).join("\n") ?? "";
      updateMsg(r4id, {
        content: `Marketing system complete.\n\nTop hooks:\n${hooks}\n\nLaunch plan ready — open Marketing in the panel for the full calendar.`,
        status: "done",
      });

      // ── Finalize ───────────────────────────────────────────────────────────
      const r6id = uid();
      addMsg({ id: r6id, role: "assistant", content: "Saving project...", status: "loading", isProgress: true });

      const r6 = await actionFinalizeProject(form, research, product, marketing, critic, assets, websiteFiles);
      if (!r6.success) {
        updateMsg(r6id, { content: r6.error, status: "error" });
        setBuilding(false);
        return;
      }

      updateMsg(r6id, {
        content: `${product.productName} is ready.\n\nYour workspace is opening now. Use the panel on the right to explore Research, Product, Website, Marketing, and Files. Ask me anything to refine or improve any part of it.`,
        status: "done",
      });

      setBuilding(false);
      router.push(`/workspace/${r6.data.id}`);
    },
    [building, router],
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "hsl(220 14% 8%)" }}
    >
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <WelcomeState onSuggestion={(t) => build(t)} />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
          </div>
        )}
      </div>

      {/* Input */}
      <InputBar
        value={input}
        onChange={setInput}
        onSubmit={() => build(input)}
        disabled={building}
      />
    </div>
  );
}
