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
  actionGenerateIdeas,
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
}

interface GeneratedIdea {
  title: string;
  type: string;
  description: string;
  audience: string;
}

// ── Product types ─────────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  { id: "course",      label: "Course",        sub: "Teach what you know"             },
  { id: "ebook",       label: "Ebook",         sub: "Publish your expertise"          },
  { id: "template",    label: "Template",      sub: "Done-for-you system or kit"      },
  { id: "saas",        label: "SaaS",          sub: "Software tool or platform"       },
  { id: "agency",      label: "Agency",        sub: "Productized service"             },
  { id: "membership",  label: "Membership",    sub: "Recurring community or access"   },
  { id: "coaching",    label: "Coaching",      sub: "1:1 or group coaching program"   },
  { id: "newsletter",  label: "Newsletter",    sub: "Build an audience via email"     },
  { id: "open",        label: "Not sure yet",  sub: "I'll describe my idea"           },
] as const;

type ProductTypeId = typeof PRODUCT_TYPES[number]["id"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function expandIdea(idea: string, type: ProductTypeId | null): BusinessFormData {
  return {
    idea,
    interests: idea,
    skills: "open to any direction",
    timePerWeek: "10-20",
    incomeGoal: "1000",
    businessType: type ?? "open",
  };
}

function uid() { return Math.random().toString(36).slice(2); }

// ── Icons ─────────────────────────────────────────────────────────────────────

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
    <svg className="animate-spin w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-lg px-4 py-2.5 rounded-2xl rounded-tr-md text-sm leading-relaxed"
          style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 20%)", color: "hsl(220 9% 88%)" }}
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
            style={{ color: msg.status === "error" ? "hsl(0 72% 62%)" : "hsl(220 9% 78%)" }}
          >
            {msg.content}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Idea cards ────────────────────────────────────────────────────────────────

function IdeaCard({ idea, onSelect }: { idea: GeneratedIdea; onSelect: (idea: GeneratedIdea) => void }) {
  return (
    <button
      onClick={() => onSelect(idea)}
      className="text-left rounded-xl px-5 py-4 transition-colors w-full"
      style={{ border: "1px solid hsl(220 13% 17%)", backgroundColor: "hsl(220 13% 10%)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(213 94% 62% / 0.3)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 17%)"; }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>{idea.title}</p>
        <span
          className="shrink-0 text-xs px-2 py-0.5 rounded-md font-medium"
          style={{ backgroundColor: "hsl(220 13% 16%)", color: "hsl(220 9% 44%)" }}
        >
          {idea.type}
        </span>
      </div>
      <p className="text-xs leading-relaxed mb-2" style={{ color: "hsl(220 9% 46%)" }}>{idea.description}</p>
      <p className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>For: {idea.audience}</p>
    </button>
  );
}

// ── Welcome / creation state ──────────────────────────────────────────────────

function CreationState({
  onBuild,
}: {
  onBuild: (idea: string, type: ProductTypeId | null) => void;
}) {
  const [selectedType, setSelectedType] = useState<ProductTypeId | null>(null);
  const [input, setInput] = useState("");
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[] | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  async function handleGenerateIdeas() {
    setGeneratingIdeas(true);
    setIdeas(null);
    const r = await actionGenerateIdeas(input.trim() || undefined);
    if (r.success) setIdeas(r.data);
    setGeneratingIdeas(false);
  }

  function handleSelectIdea(idea: GeneratedIdea) {
    onBuild(`${idea.title} — ${idea.description}`, idea.type.toLowerCase().replace(/[^a-z]/g, "-") as ProductTypeId);
  }

  const canBuild = input.trim().length >= 3;
  const placeholder =
    selectedType === "course"     ? "e.g. I want to teach people how to build habits..."        :
    selectedType === "ebook"      ? "e.g. A guide on freelance pricing for designers..."          :
    selectedType === "template"   ? "e.g. Notion template for freelance client management..."     :
    selectedType === "saas"       ? "e.g. A tool that helps developers track their time..."       :
    selectedType === "agency"     ? "e.g. Done-for-you Instagram content for local businesses..." :
    selectedType === "membership" ? "e.g. A community for indie hackers to share revenue..."      :
    selectedType === "coaching"   ? "e.g. 90-day program to help founders build a hiring system..." :
    selectedType === "newsletter" ? "e.g. A weekly newsletter on AI tools for marketers..."       :
                                    "Describe your idea, interest, or problem to solve...";

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8 w-full">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto"
          style={{ backgroundColor: "hsl(213 94% 58% / 0.1)", border: "1px solid hsl(213 94% 58% / 0.18)" }}
        >
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.02em" }}>
          What are you building?
        </h1>
        <p className="text-sm" style={{ color: "hsl(220 9% 42%)" }}>
          Select a product type, describe your idea, and LaunchForge will build it.
        </p>
      </div>

      {/* Product type selector */}
      <div className="w-full mb-5">
        <p className="text-xs font-medium mb-2.5 px-0.5" style={{ color: "hsl(220 9% 36%)" }}>Product type</p>
        <div className="grid grid-cols-3 gap-2">
          {PRODUCT_TYPES.map((t) => {
            const isActive = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(isActive ? null : t.id)}
                className="text-left rounded-xl px-4 py-3 transition-colors"
                style={{
                  backgroundColor: isActive ? "hsl(213 94% 62% / 0.08)" : "hsl(220 13% 11%)",
                  border: isActive ? "1px solid hsl(213 94% 62% / 0.3)" : "1px solid hsl(220 13% 17%)",
                  color: isActive ? "hsl(213 94% 70%)" : "hsl(220 9% 58%)",
                }}
              >
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{t.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Idea cards (when generated) */}
      {ideas && (
        <div className="w-full mb-5 space-y-2">
          <p className="text-xs font-medium mb-2 px-0.5" style={{ color: "hsl(220 9% 36%)" }}>
            Generated ideas — click to build
          </p>
          {ideas.map((idea, i) => (
            <IdeaCard key={i} idea={idea} onSelect={handleSelectIdea} />
          ))}
          <button
            className="text-xs mt-1"
            style={{ color: "hsl(220 9% 34%)" }}
            onClick={() => setIdeas(null)}
          >
            Clear ideas
          </button>
        </div>
      )}

      {/* Text input */}
      <div
        className="w-full rounded-2xl px-4 py-3 mb-3"
        style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 19%)" }}
      >
        <textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (canBuild) onBuild(input.trim(), selectedType); } }}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed"
          style={{ color: "hsl(220 9% 85%)", caretColor: "hsl(213 94% 62%)", minHeight: 44, maxHeight: 120 }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={handleGenerateIdeas}
          disabled={generatingIdeas}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-colors"
          style={{
            border: "1px solid hsl(220 13% 20%)",
            backgroundColor: "transparent",
            color: "hsl(220 9% 52%)",
            cursor: generatingIdeas ? "wait" : "pointer",
          }}
        >
          {generatingIdeas ? <Spinner /> : (
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
          Generate ideas
        </button>
        <div className="flex-1" />
        <button
          onClick={() => canBuild && onBuild(input.trim(), selectedType)}
          disabled={!canBuild}
          className="h-10 px-6 rounded-xl text-sm font-semibold transition-colors"
          style={{
            backgroundColor: canBuild ? "hsl(220 9% 94%)" : "hsl(220 13% 16%)",
            color: canBuild ? "hsl(220 14% 7%)" : "hsl(220 9% 32%)",
            cursor: canBuild ? "pointer" : "not-allowed",
          }}
        >
          Build project
        </button>
      </div>

      <p className="text-xs mt-3" style={{ color: "hsl(220 9% 22%)" }}>
        Shift+Enter for new line · Enter to build
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [building, setBuilding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function addMsg(msg: ChatMessage) { setMessages((p) => [...p, msg]); return msg.id; }
  function updateMsg(id: string, patch: Partial<ChatMessage>) {
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  const build = useCallback(async (idea: string, type: ProductTypeId | null) => {
    if (building || idea.trim().length < 2) return;
    setBuilding(true);

    addMsg({ id: uid(), role: "user", content: type && type !== "open" ? `[${type}] ${idea}` : idea });

    const form = expandIdea(idea.trim(), type);

    let research: ResearchAgentOutput | null = null;
    let product:  ProductAgentOutput  | null = null;
    let marketing:MarketingAgentOutput| null = null;
    let critic:   CriticAgentOutput   | null = null;
    let assets:   AssetSet            | null = null;
    let websiteFiles: ProjectFile[] = [];

    // Research
    const r0id = uid();
    addMsg({ id: r0id, role: "assistant", content: "Researching the market...", status: "loading" });
    const r0 = await actionRunResearch(form);
    if (!r0.success) { updateMsg(r0id, { content: r0.error, status: "error" }); setBuilding(false); return; }
    research = r0.data;
    updateMsg(r0id, {
      content: `Market research complete.\n\nNiche: ${research.niche}\nDemand: ${research.demandScore}/100  ·  Competition: ${research.competitionScore}/100  ·  Monetization: ${research.monetizationScore}/100\n\n${research.opportunitySummary}`,
      status: "done",
    });

    // Product
    const r1id = uid();
    addMsg({ id: r1id, role: "assistant", content: "Designing the product...", status: "loading" });
    const r1 = await actionRunProduct(form, research);
    if (!r1.success) { updateMsg(r1id, { content: r1.error, status: "error" }); setBuilding(false); return; }
    product = r1.data;
    updateMsg(r1id, {
      content: `Product designed: ${product.productName}\n\n${product.tagline}\n\nAudience: ${product.targetAudience}\nPricing: ${product.pricingModel} · ${product.suggestedPrice}\nTime to launch: ${product.timeToLaunch}\n\nDeliverables:\n${product.deliverables?.slice(0, 4).map((d) => `· ${d}`).join("\n")}`,
      status: "done",
    });

    // Assets
    const r2id = uid();
    addMsg({ id: r2id, role: "assistant", content: "Generating product files...", status: "loading" });
    const r2 = await actionRunAssets(form, research, product);
    if (!r2.success) { updateMsg(r2id, { content: r2.error, status: "error" }); setBuilding(false); return; }
    assets = r2.data;
    updateMsg(r2id, { content: `Product files created — ${assets ? Object.keys(assets).length : 0} deliverables ready.`, status: "done" });

    // Website
    const r3id = uid();
    addMsg({ id: r3id, role: "assistant", content: "Building the website...", status: "loading" });
    const r3 = await actionRunWebsite(product, research, form.businessType ?? "open");
    if (!r3.success) { updateMsg(r3id, { content: r3.error, status: "error" }); setBuilding(false); return; }
    websiteFiles = r3.data;
    const pageList = websiteFiles.filter((f) => f.name.endsWith(".tsx")).map((f) => f.path.replace("/website/app/", "/")).join("  ·  ");
    updateMsg(r3id, {
      content: `Website built — ${websiteFiles.length} files generated.\n\nPages: ${pageList || "homepage, pricing, about, faq, contact, legal"}\n\nReady to deploy to Vercel.`,
      status: "done",
    });

    // Marketing
    const r4id = uid();
    addMsg({ id: r4id, role: "assistant", content: "Creating the marketing system...", status: "loading" });
    const r4 = await actionRunMarketing(form, research, product);
    if (!r4.success) { updateMsg(r4id, { content: r4.error, status: "error" }); setBuilding(false); return; }
    marketing = r4.data;
    const r5 = await actionRunCritic(form, research, product, marketing);
    if (!r5.success) { updateMsg(r4id, { content: r5.error, status: "error" }); setBuilding(false); return; }
    critic = r5.data;
    const hooks = marketing.tiktokHooks?.slice(0, 2).map((h) => `"${h}"`).join("\n") ?? "";
    updateMsg(r4id, {
      content: `Marketing complete.\n\nTop hooks:\n${hooks}\n\nLaunch strategy and content calendar ready.`,
      status: "done",
    });

    // Finalize
    const r6id = uid();
    addMsg({ id: r6id, role: "assistant", content: "Saving your project...", status: "loading" });
    const r6 = await actionFinalizeProject(form, research, product, marketing, critic, assets, websiteFiles);
    if (!r6.success) { updateMsg(r6id, { content: r6.error, status: "error" }); setBuilding(false); return; }

    updateMsg(r6id, {
      content: `${product.productName} is ready.\n\nOpening your project workspace now. Use the tabs to explore Research, Product, Website, Marketing, and Files. Click "Ask AI" to refine any section.`,
      status: "done",
    });

    setBuilding(false);
    router.push(`/workspace/${r6.data.id}`);
  }, [building, router]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <CreationState onBuild={build} />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
          </div>
        )}
      </div>
    </div>
  );
}
