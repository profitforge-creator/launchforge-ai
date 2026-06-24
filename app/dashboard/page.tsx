"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { actionGetProjectList, type ProjectListItem } from "@/app/actions/analytics";
import { actionGetDeployments, type DeploymentRecord } from "@/app/actions/deployments";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_EMOJI: Record<string, string> = {
  saas: "⚡",
  course: "📚",
  ebook: "📖",
  template: "📋",
  agency: "🏢",
  membership: "🔑",
  coaching: "🎯",
  newsletter: "📨",
  open: "💡",
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  subColor = "#52525b",
  icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  subColor?: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#111113",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, color: "#71717a" }}>{label}</span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ── AI assistant panel ────────────────────────────────────────────────────────

function AIAssistantPanel() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "Hi! I can generate business ideas, review your projects, set up integrations, or help you plan your launch strategy. What would you like to build?" },
  ]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [
      ...m,
      { role: "user", text },
      { role: "ai", text: "Great idea! Head to Business Generator to build this out end-to-end — I'll run market research, product design, website generation, and marketing strategy for you." },
    ]);
    setInput("");
  }

  return (
    <div
      style={{
        background: "#111113",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "13px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: "rgba(59,130,246,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="#3b82f6">
            <path d="M5 0l1.2 3.5L10 5 6.2 6.5 5 10 3.8 6.5 0 5l3.8-1.5z" />
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>AI Assistant</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10.5,
            color: "#22c55e",
            background: "rgba(34,197,94,0.1)",
            padding: "2px 7px",
            borderRadius: 100,
          }}
        >
          Online
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "85%",
                padding: "9px 12px",
                borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                background: m.role === "user" ? "rgba(59,130,246,0.15)" : "#18181b",
                border: `1px solid ${m.role === "user" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}`,
                fontSize: 12.5,
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask anything..."
          style={{
            flex: 1,
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 6,
            padding: "7px 10px",
            fontSize: 12.5,
            color: "#fafafa",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: "#3b82f6",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.8">
            <path d="M1 6h10M7 2l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([actionGetProjectList(), actionGetDeployments()]).then(([list, deploys]) => {
      setProjects(list);
      setDeployments(deploys.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const deployMap = new Map<string, DeploymentRecord>();
  for (const d of deployments) deployMap.set(d.project_id, d);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => !deployMap.has(p.id)).length;
  const deployedCount  = deployments.length;

  const recentProjects = projects.slice(0, 5).map((p) => ({
    ...p,
    isDeployed: deployMap.has(p.id),
    isReady: p.hasWebsite,
  }));

  const recentDeploys = deployments.slice(0, 4);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#09090b",
        padding: "28px 32px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.025em", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#71717a" }}>Welcome back. Here's what's happening.</p>
        </div>
        <Link
          href="/dashboard/generate"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#3b82f6",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><path d="M6 0l1.2 3.5 3.8 1.5-3.8 1.5L6 12 4.8 6.5 1 5l3.8-1.5z" /></svg>
          New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Projects"
          value={loading ? "—" : totalProjects}
          sub={totalProjects === 1 ? "1 project created" : `${totalProjects} projects created`}
          icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#71717a" strokeWidth="1.5"><path d="M1 3a1 1 0 011-1h2l1.5 1.5h4a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V3z" /></svg>}
        />
        <StatCard
          label="Active Projects"
          value={loading ? "—" : activeProjects}
          sub={`${deployedCount} live in production`}
          subColor="#3b82f6"
          icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3b82f6" strokeWidth="1.5"><circle cx="6" cy="6" r="5" /><path d="M4 6l1.5 1.5L8 4" stroke="#3b82f6" strokeWidth="1.5" /></svg>}
        />
        <StatCard
          label="Deployments"
          value={loading ? "—" : deployedCount}
          sub="Total deployments"
          icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#a855f7" strokeWidth="1.5"><path d="M6 1s4 1.5 4 5.5L6 11 2 6.5C2 2.5 6 1 6 1z" /><circle cx="6" cy="5" r="1" fill="#a855f7" stroke="none" /></svg>}
          subColor="#a855f7"
        />
        <StatCard
          label="Revenue"
          value="—"
          sub="Connect Stripe to unlock"
          subColor="#52525b"
          icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#22c55e" strokeWidth="1.5"><path d="M6 1v1.5M6 9.5V11M2 6H1M11 6h-1M3.5 3.5 2.8 2.8M9.2 9.2l-.7-.7M2.8 9.2l.7-.7M9.2 2.8l-.7.7" /><circle cx="6" cy="6" r="2" /></svg>}
        />
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recent Projects */}
          <div
            style={{
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "13px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>Recent Projects</span>
              <Link
                href="/dashboard/projects"
                style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}
              >
                View all
              </Link>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 80px",
                padding: "8px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {["Project", "Status", "Type", "Updated"].map((h) => (
                <span key={h} style={{ fontSize: 11, color: "#52525b", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: "60%" }} />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#52525b", marginBottom: 12 }}>No projects yet</p>
                <Link
                  href="/dashboard/generate"
                  style={{
                    fontSize: 12.5,
                    color: "#3b82f6",
                    background: "rgba(59,130,246,0.1)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                >
                  Create your first project →
                </Link>
              </div>
            ) : (
              recentProjects.map((p, i) => {
                const status = deployMap.has(p.id) ? "Live" : p.hasWebsite ? "Ready" : "Building";
                const statusColor = status === "Live" ? "#22c55e" : status === "Ready" ? "#3b82f6" : "#f59e0b";
                const statusBg    = status === "Live" ? "rgba(34,197,94,0.1)" : status === "Ready" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)";
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 80px",
                      padding: "10px 18px",
                      borderBottom: i < recentProjects.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ fontSize: 15 }}>{TYPE_EMOJI[p.type] ?? "📁"}</span>
                      <Link
                        href={`/workspace/${p.id}`}
                        style={{ fontSize: 13, color: "#fafafa", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}
                      >
                        {p.name}
                      </Link>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11.5,
                        color: statusColor,
                        background: statusBg,
                        padding: "2px 8px",
                        borderRadius: 4,
                        width: "fit-content",
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
                      {status}
                    </span>
                    <span style={{ fontSize: 12.5, color: "#71717a", textTransform: "capitalize" }}>{p.type}</span>
                    <span style={{ fontSize: 12, color: "#52525b" }}>{formatRelative(p.createdAt)}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent Deployments */}
          <div
            style={{
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "13px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>Recent Deployments</span>
              <Link href="/dashboard/deployments" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>View all</Link>
            </div>
            <div style={{ padding: "0 18px" }}>
              {loading ? (
                <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: "70%" }} />
                  ))}
                </div>
              ) : recentDeploys.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#52525b", marginBottom: 10 }}>No deployments yet</p>
                  <Link href="/dashboard/deployments" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>Go to Deployments →</Link>
                </div>
              ) : (
                recentDeploys.map((d, i) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: i < recentDeploys.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#fafafa", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {d.domain ?? d.url.replace(/^https?:\/\//, "").split("/")[0]}
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "#22c55e",
                        background: "rgba(34,197,94,0.1)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontWeight: 500,
                      }}
                    >
                      Ready
                    </span>
                    <span style={{ fontSize: 12, color: "#52525b" }}>{formatRelative(d.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: AI Assistant */}
        <AIAssistantPanel />
      </div>
    </div>
  );
}
