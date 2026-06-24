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
  saas: "⚡", course: "📚", ebook: "📖", template: "📋",
  agency: "🏢", membership: "🔑", coaching: "🎯", newsletter: "📨", open: "💡",
};

type Filter = "all" | "active" | "deployed";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([actionGetProjectList(), actionGetDeployments()]).then(([list, deploys]) => {
      setProjects(list);
      setDeployments(deploys.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const deployMap = new Map<string, DeploymentRecord>();
  for (const d of deployments) deployMap.set(d.project_id, d);

  const filtered = projects.filter((p) => {
    const isDeployed = deployMap.has(p.id);
    if (filter === "active"   && isDeployed) return false;
    if (filter === "deployed" && !isDeployed) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deployedCount = projects.filter((p) => deployMap.has(p.id)).length;
  const activeCount   = projects.length - deployedCount;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.025em", marginBottom: 4 }}>
            Projects
          </h1>
          <p style={{ fontSize: 13, color: "#71717a" }}>
            {loading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""} in your workspace`}
          </p>
        </div>
        <Link
          href="/dashboard/generate"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "#3b82f6",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="white"><path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.8" /></svg>
          New Project
        </Link>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div style={{ position: "relative", maxWidth: 280 }}>
          <svg
            width="13" height="13"
            viewBox="0 0 13 13"
            fill="none"
            stroke="#52525b"
            strokeWidth="1.5"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="5.5" cy="5.5" r="4" />
            <path d="M8.5 8.5l3 3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 6,
              padding: "7px 12px 7px 32px",
              fontSize: 13,
              color: "#fafafa",
              outline: "none",
              width: 280,
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {([
          { id: "all",      label: `All (${projects.length})` },
          { id: "active",   label: `Active (${activeCount})` },
          { id: "deployed", label: `Deployed (${deployedCount})` },
        ] as { id: Filter; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: filter === tab.id ? "#fafafa" : "#71717a",
              padding: "8px 16px 10px",
              borderBottom: filter === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 1fr 1fr 100px 40px",
            padding: "10px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {["Project", "Status", "Type", "Updated", ""].map((h) => (
            <span
              key={h}
              style={{ fontSize: 11, color: "#52525b", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "24px 18px", display: "flex", flexDirection: "column", gap: 18 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: `${50 + i * 8}%` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 18px", textAlign: "center" }}>
            {projects.length === 0 ? (
              <>
                <p style={{ fontSize: 14, color: "#71717a", marginBottom: 12 }}>No projects yet</p>
                <Link
                  href="/dashboard/generate"
                  style={{
                    fontSize: 13,
                    color: "#3b82f6",
                    background: "rgba(59,130,246,0.1)",
                    padding: "8px 18px",
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                >
                  Build your first project
                </Link>
              </>
            ) : (
              <p style={{ fontSize: 13, color: "#52525b" }}>No projects match your search.</p>
            )}
          </div>
        ) : (
          filtered.map((p, i) => {
            const isDeployed = deployMap.has(p.id);
            const status = isDeployed ? "Live" : p.hasWebsite ? "Ready" : "Building";
            const statusColor = status === "Live" ? "#22c55e" : status === "Ready" ? "#3b82f6" : "#f59e0b";
            const statusBg    = status === "Live" ? "rgba(34,197,94,0.08)" : status === "Ready" ? "rgba(59,130,246,0.08)" : "rgba(245,158,11,0.08)";
            return (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1fr 1fr 100px 40px",
                  padding: "12px 18px",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "#18181b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_EMOJI[p.type] ?? "📁"}
                  </div>
                  <div>
                    <Link
                      href={`/workspace/${p.id}`}
                      style={{
                        fontSize: 13.5,
                        color: "#fafafa",
                        fontWeight: 500,
                        textDecoration: "none",
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 260,
                      }}
                    >
                      {p.name}
                    </Link>
                    <span style={{ fontSize: 11.5, color: "#3f3f46", textTransform: "capitalize" }}>{p.type}</span>
                  </div>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    color: statusColor,
                    background: statusBg,
                    padding: "3px 9px",
                    borderRadius: 4,
                    width: "fit-content",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                  {status}
                </span>

                <span style={{ fontSize: 12.5, color: "#71717a", textTransform: "capitalize" }}>{p.type}</span>
                <span style={{ fontSize: 12, color: "#52525b" }}>{formatRelative(p.createdAt)}</span>

                <Link
                  href={`/workspace/${p.id}`}
                  style={{
                    fontSize: 13,
                    color: "#52525b",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  →
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
