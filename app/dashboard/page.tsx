"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { actionGetProjectList, type ProjectListItem } from "@/app/actions/analytics";
import { actionGetDeployments, type DeploymentRecord } from "@/app/actions/deployments";
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

interface ProjectEnriched extends ProjectListItem {
  deploy: DeploymentRecord | null;
  status: "Deployed" | "Ready" | "Building";
  health: "Excellent" | "Good" | "Needs Attention";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

function deriveProjectStatus(p: ProjectListItem, deploy: DeploymentRecord | null): "Deployed" | "Ready" | "Building" {
  if (deploy) return "Deployed";
  if (p.hasWebsite) return "Ready";
  return "Building";
}

function deriveProjectHealth(p: ProjectListItem, deploy: DeploymentRecord | null): "Excellent" | "Good" | "Needs Attention" {
  if (deploy && p.hasWebsite && p.hasMarketing) return "Excellent";
  if (p.hasWebsite || p.hasMarketing) return "Good";
  return "Needs Attention";
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    course: "Course", ebook: "Ebook", template: "Template", saas: "SaaS",
    agency: "Agency", membership: "Membership", coaching: "Coaching",
    newsletter: "Newsletter", open: "General",
  };
  return map[t] ?? t;
}

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

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin shrink-0" width={size} height={size} fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function IconPlus() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}

function IconArrow() {
  return <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
}

function IconGrid() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
}

// ── Message bubble (creation pipeline) ───────────────────────────────────────

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

// ── Creation form ─────────────────────────────────────────────────────────────

function CreationState({
  onBuild,
  onBack,
  hasProjects,
}: {
  onBuild: (idea: string, type: ProductTypeId | null) => void;
  onBack?: () => void;
  hasProjects: boolean;
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
      {/* Back button */}
      {hasProjects && onBack && (
        <div className="w-full mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "hsl(220 9% 36%)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 60%)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 36%)"; }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to projects
          </button>
        </div>
      )}

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

      {/* Idea cards */}
      {ideas && (
        <div className="w-full mb-5 space-y-2">
          <p className="text-xs font-medium mb-2 px-0.5" style={{ color: "hsl(220 9% 36%)" }}>
            Generated ideas — click to build
          </p>
          {ideas.map((idea, i) => (
            <IdeaCard key={i} idea={idea} onSelect={handleSelectIdea} />
          ))}
          <button className="text-xs mt-1" style={{ color: "hsl(220 9% 34%)" }} onClick={() => setIdeas(null)}>
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

      {/* Actions */}
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

      <div className="mt-6 pt-5 w-full text-center" style={{ borderTop: "1px solid hsl(220 13% 14%)" }}>
        <p className="text-xs mb-2" style={{ color: "hsl(220 9% 28%)" }}>Not sure what to build?</p>
        <a
          href="/dashboard/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "hsl(213 94% 62%)" }}
        >
          Browse opportunities
          <IconArrow />
        </a>
      </div>
    </div>
  );
}

// ── Overview: stat cards ──────────────────────────────────────────────────────

function OverviewStats({ projects }: { projects: ProjectEnriched[] }) {
  const total    = projects.length;
  const active   = projects.filter((p) => p.status !== "Deployed").length;
  const deployed = projects.filter((p) => p.status === "Deployed").length;

  const stats = [
    {
      label: "Total Projects",
      value: total,
      sub: total === 1 ? "1 business generated" : `${total} businesses generated`,
      trend: null,
    },
    {
      label: "Active",
      value: active,
      sub: "In progress",
      trend: null,
    },
    {
      label: "Deployed",
      value: deployed,
      sub: deployed > 0 ? "Live on the web" : "None live yet",
      accent: deployed > 0 ? "hsl(151 60% 50%)" : undefined,
    },
    {
      label: "Revenue Tracking",
      value: "—",
      sub: "Connect Stripe to unlock",
      accent: "hsl(220 9% 36%)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl px-5 py-4 group transition-all"
          style={{
            backgroundColor: "hsl(220 13% 10%)",
            border: "1px solid hsl(220 13% 15%)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 20%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 15%)"; }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 36%)" }}>{s.label}</p>
          <p
            className="text-2xl font-bold tabular-nums"
            style={{ color: s.accent ?? "hsl(220 9% 88%)", letterSpacing: "-0.03em" }}
          >
            {s.value}
          </p>
          <p className="text-xs mt-1.5" style={{ color: "hsl(220 9% 30%)" }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Overview: project card ────────────────────────────────────────────────────

const STATUS_STYLES: Record<ProjectEnriched["status"], { bg: string; text: string; dot: string }> = {
  Deployed: { bg: "hsl(151 60% 48% / 0.1)",  text: "hsl(151 60% 50%)",  dot: "hsl(151 60% 48%)" },
  Ready:    { bg: "hsl(213 94% 62% / 0.1)",  text: "hsl(213 94% 62%)",  dot: "hsl(213 94% 62%)" },
  Building: { bg: "hsl(38 90% 55% / 0.1)",   text: "hsl(38 90% 58%)",   dot: "hsl(38 90% 55%)"  },
};

const HEALTH_STYLES: Record<ProjectEnriched["health"], { text: string; dot: string }> = {
  "Excellent":       { text: "hsl(151 60% 50%)", dot: "hsl(151 60% 48%)" },
  "Good":            { text: "hsl(38 90% 58%)",  dot: "hsl(38 90% 55%)"  },
  "Needs Attention": { text: "hsl(220 9% 44%)",  dot: "hsl(220 9% 36%)"  },
};

function ProjectCard({ project }: { project: ProjectEnriched }) {
  const ss = STATUS_STYLES[project.status];
  const hs = HEALTH_STYLES[project.health];

  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden transition-all"
      style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 22%)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 15%)"; }}
    >
      {/* Card body */}
      <div className="px-5 pt-5 pb-4 flex-1">
        {/* Top row: name + type */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "hsl(220 9% 86%)", letterSpacing: "-0.01em" }}
            >
              {project.name}
            </p>
            <p className="text-xs mt-0.5 capitalize" style={{ color: "hsl(220 9% 36%)" }}>
              {typeLabel(project.type)}
            </p>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
            style={{ backgroundColor: ss.bg, color: ss.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
            {project.status}
          </span>
        </div>

        {/* Health + date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hs.dot }} />
            <span className="text-xs" style={{ color: hs.text }}>{project.health}</span>
          </div>
          <span className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>
            {formatRelative(project.createdAt)}
          </span>
        </div>

        {/* Progress indicators */}
        <div className="space-y-1.5 mb-4">
          {[
            { label: "Research",  done: true },
            { label: "Website",   done: project.hasWebsite },
            { label: "Marketing", done: project.hasMarketing },
            { label: "Deployed",  done: !!project.deploy },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: done ? "hsl(151 60% 48%)" : "hsl(220 13% 20%)" }}
              />
              <span className="text-xs" style={{ color: done ? "hsl(220 9% 50%)" : "hsl(220 9% 26%)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="px-3 pb-3 pt-2 grid grid-cols-2 gap-1.5"
        style={{ borderTop: "1px solid hsl(220 13% 13%)" }}
      >
        <Link
          href={`/workspace/${project.id}`}
          className="h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors"
          style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", color: "hsl(213 94% 62%)", border: "1px solid hsl(213 94% 62% / 0.2)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(213 94% 62% / 0.16)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(213 94% 62% / 0.1)"; }}
        >
          Open
        </Link>
        <Link
          href={`/workspace/${project.id}?tab=website`}
          className="h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors"
          style={{
            backgroundColor: project.hasWebsite ? "hsl(151 60% 48% / 0.08)" : "hsl(220 13% 13%)",
            color: project.hasWebsite ? "hsl(151 60% 50%)" : "hsl(220 9% 30%)",
            border: project.hasWebsite ? "1px solid hsl(151 60% 48% / 0.2)" : "1px solid hsl(220 13% 17%)",
          }}
        >
          Website
        </Link>
        <Link
          href="/dashboard/deployments"
          className="h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors"
          style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 36%)", border: "1px solid hsl(220 13% 17%)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 55%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 36%)"; }}
        >
          Deploy
        </Link>
        <Link
          href="/dashboard/analytics"
          className="h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors"
          style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 36%)", border: "1px solid hsl(220 13% 17%)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 55%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(220 9% 36%)"; }}
        >
          Analytics
        </Link>
      </div>
    </div>
  );
}

// ── Overview: activity feed ───────────────────────────────────────────────────

function RecentActivity({ projects }: { projects: ProjectEnriched[] }) {
  const events: Array<{ label: string; detail: string; time: string; color: string }> = [];

  for (const p of projects.slice(0, 8)) {
    events.push({
      label: `Created "${p.name}"`,
      detail: `${typeLabel(p.type)} · ${p.status}`,
      time: p.createdAt,
      color: "hsl(213 94% 62%)",
    });
    if (p.hasWebsite) {
      events.push({
        label: `Website generated for "${p.name}"`,
        detail: "Ready to deploy",
        time: p.createdAt,
        color: "hsl(151 60% 48%)",
      });
    }
    if (p.deploy) {
      events.push({
        label: `Deployed "${p.name}"`,
        detail: p.deploy.domain ?? p.deploy.url.replace(/^https?:\/\//, "").split("/")[0],
        time: p.deploy.created_at,
        color: "hsl(151 60% 48%)",
      });
    }
    if (p.hasMarketing) {
      events.push({
        label: `Marketing plan created for "${p.name}"`,
        detail: "Launch strategy ready",
        time: p.createdAt,
        color: "hsl(38 90% 55%)",
      });
    }
  }

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recent = events.slice(0, 10);

  if (recent.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold mb-4" style={{ color: "hsl(220 9% 60%)", letterSpacing: "-0.01em" }}>
        Recent Activity
      </h2>
      <div className="space-y-0">
        {recent.map((e, i) => (
          <div key={i} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: e.color }} />
              {i < recent.length - 1 && (
                <div className="w-px flex-1 mt-1" style={{ backgroundColor: "hsl(220 13% 14%)", minHeight: 14 }} />
              )}
            </div>
            <div className={`flex-1 pb-3 ${i === recent.length - 1 ? "pb-0" : ""}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-medium" style={{ color: "hsl(220 9% 62%)" }}>{e.label}</p>
                <span className="text-xs shrink-0" style={{ color: "hsl(220 9% 28%)" }}>{formatRelative(e.time)}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 34%)" }}>{e.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Overview main ─────────────────────────────────────────────────────────────

function ProjectsOverview({
  projects,
  loading,
  onNew,
}: {
  projects: ProjectEnriched[];
  loading: boolean;
  onNew: () => void;
}) {
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-4">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 rounded-lg animate-pulse" style={{ backgroundColor: "hsl(220 13% 14%)" }} />
          <div className="h-9 w-28 rounded-lg animate-pulse" style={{ backgroundColor: "hsl(220 13% 14%)" }} />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0,1,2,3].map((i) => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => <div key={i} className="h-56 rounded-xl animate-pulse" style={{ backgroundColor: "hsl(220 13% 13%)" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "hsl(220 9% 88%)", letterSpacing: "-0.01em" }}>
            Projects
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
            Your business portfolio
          </p>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition-colors"
          style={{ backgroundColor: "hsl(220 9% 94%)", color: "hsl(220 14% 7%)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 9% 100%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 9% 94%)"; }}
        >
          <IconPlus />
          New Project
        </button>
      </div>

      {/* Stats */}
      <OverviewStats projects={projects} />

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div
          className="rounded-xl px-8 py-16 text-center"
          style={{ border: "1px solid hsl(220 13% 14%)", borderStyle: "dashed", backgroundColor: "hsl(220 13% 9%)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "hsl(213 94% 58% / 0.08)", border: "1px solid hsl(213 94% 58% / 0.15)" }}
          >
            <IconGrid />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "hsl(220 9% 65%)" }}>
            No projects yet
          </p>
          <p className="text-xs mb-5" style={{ color: "hsl(220 9% 36%)", lineHeight: 1.6 }}>
            Generate your first business. LaunchForge will build the research, product, website, and marketing for you.
          </p>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
          >
            <IconPlus />
            Build your first project
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 60%)" }}>
              All Projects
              <span className="ml-2 text-xs font-normal" style={{ color: "hsl(220 9% 32%)" }}>
                {projects.length}
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            {/* "New project" ghost card */}
            <button
              onClick={onNew}
              className="rounded-xl flex flex-col items-center justify-center gap-2 px-5 py-12 text-center transition-all group"
              style={{ border: "1px dashed hsl(220 13% 17%)", backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 26%)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 10%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 17%)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 40%)" }}
              >
                <IconPlus />
              </div>
              <span className="text-xs font-medium" style={{ color: "hsl(220 9% 32%)" }}>New Project</span>
            </button>
          </div>

          <RecentActivity projects={projects} />
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type DashView = "overview" | "create";

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [building,  setBuilding]  = useState(false);
  const [view,      setView]      = useState<DashView>("overview");
  const [projects,  setProjects]  = useState<ProjectEnriched[]>([]);
  const [loadingPx, setLoadingPx] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load projects + Supabase deploy records
  useEffect(() => {
    Promise.all([
      actionGetProjectList(),
      actionGetDeployments(),
    ]).then(([list, deploysResult]) => {
      const deployMap = new Map<string, DeploymentRecord>();
      for (const d of deploysResult.data) deployMap.set(d.project_id, d);

      const enriched: ProjectEnriched[] = list.map((p) => {
        const deploy = deployMap.get(p.id) ?? null;
        return {
          ...p,
          deploy,
          status: deriveProjectStatus(p, deploy),
          health: deriveProjectHealth(p, deploy),
        };
      });
      setProjects(enriched);
      setLoadingPx(false);
    }).catch((err: unknown) => {
      console.error("[DashboardInner] failed to load:", err);
      setLoadingPx(false);
    });
  }, []);

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
    setView("create"); // keep create view during build

    addMsg({ id: uid(), role: "user", content: type && type !== "open" ? `[${type}] ${idea}` : idea });

    const form = expandIdea(idea.trim(), type);

    let research: ResearchAgentOutput | null = null;
    let product:  ProductAgentOutput  | null = null;
    let marketing:MarketingAgentOutput| null = null;
    let critic:   CriticAgentOutput   | null = null;
    let assets:   AssetSet            | null = null;
    let websiteFiles: ProjectFile[] = [];

    const r0id = uid();
    addMsg({ id: r0id, role: "assistant", content: "Researching the market...", status: "loading" });
    const r0 = await actionRunResearch(form);
    if (!r0.success) { updateMsg(r0id, { content: r0.error, status: "error" }); setBuilding(false); return; }
    research = r0.data;
    updateMsg(r0id, {
      content: `Market research complete.\n\nNiche: ${research.niche}\nDemand: ${research.demandScore}/100  ·  Competition: ${research.competitionScore}/100  ·  Monetization: ${research.monetizationScore}/100\n\n${research.opportunitySummary}`,
      status: "done",
    });

    const r1id = uid();
    addMsg({ id: r1id, role: "assistant", content: "Designing the product...", status: "loading" });
    const r1 = await actionRunProduct(form, research);
    if (!r1.success) { updateMsg(r1id, { content: r1.error, status: "error" }); setBuilding(false); return; }
    product = r1.data;
    updateMsg(r1id, {
      content: `Product designed: ${product.productName}\n\n${product.tagline}\n\nAudience: ${product.targetAudience}\nPricing: ${product.pricingModel} · ${product.suggestedPrice}\nTime to launch: ${product.timeToLaunch}\n\nDeliverables:\n${product.deliverables?.slice(0, 4).map((d) => `· ${d}`).join("\n")}`,
      status: "done",
    });

    const r2id = uid();
    addMsg({ id: r2id, role: "assistant", content: "Generating product files...", status: "loading" });
    const r2 = await actionRunAssets(form, research, product);
    if (!r2.success) { updateMsg(r2id, { content: r2.error, status: "error" }); setBuilding(false); return; }
    assets = r2.data;
    updateMsg(r2id, { content: `Product files created — ${assets ? Object.keys(assets).length : 0} deliverables ready.`, status: "done" });

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

  // Auto-start from Opportunity Engine
  const didAutoStart = useRef(false);
  useEffect(() => {
    if (didAutoStart.current || building) return;
    const from = searchParams.get("from");
    const idea = searchParams.get("idea");
    const type = searchParams.get("type") as ProductTypeId | null;
    if (from === "opportunity" && idea) {
      didAutoStart.current = true;
      build(idea, type);
    }
  }, [searchParams, build, building]);

  const isBuilding = messages.length > 0;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {/* Building pipeline (chat) */}
        {isBuilding ? (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
          </div>
        ) : view === "create" ? (
          <CreationState
            onBuild={build}
            onBack={() => setView("overview")}
            hasProjects={projects.length > 0}
          />
        ) : (
          <ProjectsOverview
            projects={projects}
            loading={loadingPx}
            onNew={() => setView("create")}
          />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
