"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { actionGetProjectList, type ProjectListItem } from "@/app/actions/analytics";

interface DeployRecord {
  url: string;
  domain?: string;
  deployedAt: string;
  environment: "production" | "preview";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectListItem | null>(null);
  const [deploy, setDeploy] = useState<DeployRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    actionGetProjectList().then((list) => {
      const found = list.find((p) => p.id === id) ?? null;
      setProject(found);
      if (found) {
        const raw = localStorage.getItem(`lf_deploy_${id}`);
        if (raw) { try { setDeploy(JSON.parse(raw)); } catch {} }
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "hsl(220 13% 20%)", borderTopColor: "hsl(213 94% 62%)" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
        <p className="text-sm" style={{ color: "hsl(220 9% 40%)" }}>Project not found.</p>
        <Link href="/dashboard/deployments" className="text-xs underline" style={{ color: "hsl(213 94% 62%)" }}>
          Back to Deployments
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 8%)" }}>
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: "hsl(220 9% 36%)" }}>
          <Link href="/dashboard/deployments" className="hover:underline" style={{ color: "hsl(220 9% 50%)" }}>
            Deployments
          </Link>
          <span>/</span>
          <span style={{ color: "hsl(220 9% 70%)" }}>{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: "hsl(220 9% 88%)" }}>
              {project.name}
            </h1>
            <p className="text-sm capitalize" style={{ color: "hsl(220 9% 40%)" }}>
              {project.type} — {deploy ? "Live" : "Not deployed"}
            </p>
          </div>
          <Link
            href={`/workspace/${project.id}`}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 19%)", color: "hsl(220 9% 55%)" }}
          >
            Open workspace
          </Link>
        </div>

        {/* Details */}
        <div
          className="rounded-xl overflow-hidden mb-5"
          style={{ border: "1px solid hsl(220 13% 15%)" }}
        >
          <div className="px-5 py-3" style={{ backgroundColor: "hsl(220 13% 11%)", borderBottom: "1px solid hsl(220 13% 15%)" }}>
            <p className="text-xs font-medium" style={{ color: "hsl(220 9% 42%)" }}>DEPLOYMENT DETAILS</p>
          </div>
          <div style={{ backgroundColor: "hsl(220 14% 9%)" }}>
            {[
              { label: "Status",      value: deploy ? "Live" : "Not deployed" },
              { label: "Environment", value: deploy?.environment ?? "—" },
              { label: "URL",         value: deploy?.url ?? "—", link: deploy?.url },
              { label: "Domain",      value: deploy?.domain ?? "—", link: deploy?.domain ? `https://${deploy.domain}` : undefined },
              { label: "Deployed at", value: deploy?.deployedAt ? formatDate(deploy.deployedAt) : "—" },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
              >
                <span className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>{row.label}</span>
                {row.link ? (
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline"
                    style={{ color: "hsl(213 94% 62%)" }}
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="text-xs font-medium" style={{ color: "hsl(220 9% 68%)" }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Build logs placeholder */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(220 13% 15%)" }}
        >
          <div className="px-5 py-3" style={{ backgroundColor: "hsl(220 13% 11%)", borderBottom: "1px solid hsl(220 13% 15%)" }}>
            <p className="text-xs font-medium" style={{ color: "hsl(220 9% 42%)" }}>BUILD LOGS</p>
          </div>
          <div
            className="px-5 py-8 flex flex-col items-center text-center"
            style={{ backgroundColor: "hsl(220 14% 9%)" }}
          >
            <p className="text-xs mb-1" style={{ color: "hsl(220 9% 35%)" }}>Build logs available after connecting Vercel</p>
            <p className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>Manual deployments tracked from the Launch tab</p>
          </div>
        </div>

        {!deploy && (
          <div className="mt-5 text-center">
            <Link
              href={`/workspace/${project.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.2)", color: "hsl(213 94% 65%)" }}
            >
              Open workspace to deploy →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
