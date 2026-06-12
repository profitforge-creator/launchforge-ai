"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BusinessResult } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DeployRecord {
  url: string;
  domain?: string;
  deployedAt: string;
  environment: "production" | "preview";
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
function IconExternal() {
  return (
    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

// ── Step circle ───────────────────────────────────────────────────────────────

function StepCircle({
  num,
  complete,
  active,
  locked,
}: {
  num: number;
  complete: boolean;
  active: boolean;
  locked: boolean;
}) {
  if (complete) {
    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "hsl(151 60% 48% / 0.12)", border: "1.5px solid hsl(151 60% 48% / 0.4)", color: "hsl(151 60% 48%)" }}
      >
        <IconCheck />
      </div>
    );
  }
  if (locked) {
    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "hsl(220 13% 12%)", border: "1.5px solid hsl(220 13% 16%)", color: "hsl(220 9% 28%)" }}
      >
        <IconLock />
      </div>
    );
  }
  if (active) {
    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
        style={{ backgroundColor: "hsl(213 94% 62% / 0.12)", border: "1.5px solid hsl(213 94% 62% / 0.4)", color: "hsl(213 94% 65%)" }}
      >
        {num}
      </div>
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
      style={{ backgroundColor: "hsl(220 13% 13%)", border: "1.5px solid hsl(220 13% 18%)", color: "hsl(220 9% 36%)" }}
    >
      {num}
    </div>
  );
}

// ── Deploy form ───────────────────────────────────────────────────────────────

function DeployForm({
  onSave,
}: {
  onSave: (url: string, env: "production" | "preview") => void;
}) {
  const [url, setUrl] = useState("");
  const [env, setEnv] = useState<"production" | "preview">("production");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    onSave(withProtocol, env);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.vercel.app"
          className="flex-1 h-8 px-3 rounded-lg text-xs outline-none"
          style={{
            backgroundColor: "hsl(220 13% 12%)",
            border: "1px solid hsl(220 13% 20%)",
            color: "hsl(220 9% 78%)",
          }}
        />
        <select
          value={env}
          onChange={(e) => setEnv(e.target.value as "production" | "preview")}
          className="h-8 px-2 rounded-lg text-xs outline-none"
          style={{
            backgroundColor: "hsl(220 13% 12%)",
            border: "1px solid hsl(220 13% 20%)",
            color: "hsl(220 9% 55%)",
          }}
        >
          <option value="production">Production</option>
          <option value="preview">Preview</option>
        </select>
      </div>
      <button
        type="submit"
        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-colors"
        style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.25)", color: "hsl(213 94% 65%)" }}
      >
        Save deployment
        <IconArrow />
      </button>
    </form>
  );
}

// ── Domain form ───────────────────────────────────────────────────────────────

function DomainForm({ onSave }: { onSave: (domain: string) => void }) {
  const [domain, setDomain] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = domain.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!trimmed) return;
    onSave(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="yourdomain.com"
        className="flex-1 h-8 px-3 rounded-lg text-xs outline-none"
        style={{
          backgroundColor: "hsl(220 13% 12%)",
          border: "1px solid hsl(220 13% 20%)",
          color: "hsl(220 9% 78%)",
        }}
      />
      <button
        type="submit"
        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-colors"
        style={{ backgroundColor: "hsl(151 60% 48% / 0.08)", border: "1px solid hsl(151 60% 48% / 0.2)", color: "hsl(151 60% 55%)" }}
      >
        Save domain
      </button>
    </form>
  );
}

// ── Domain guide ──────────────────────────────────────────────────────────────

function DnsGuide({ deployUrl }: { deployUrl: string }) {
  const host = deployUrl.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <div
      className="mt-3 rounded-lg px-4 py-3 space-y-2"
      style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 15%)" }}
    >
      <p className="text-xs font-medium" style={{ color: "hsl(220 9% 55%)" }}>DNS SETUP</p>
      <p className="text-xs" style={{ color: "hsl(220 9% 38%)", lineHeight: 1.6 }}>
        Add a CNAME record pointing to your deployment host:
      </p>
      <div
        className="rounded px-3 py-2 font-mono text-xs"
        style={{ backgroundColor: "hsl(220 14% 8%)", color: "hsl(220 9% 60%)" }}
      >
        <span style={{ color: "hsl(220 9% 40%)" }}>Type: </span>CNAME
        <br />
        <span style={{ color: "hsl(220 9% 40%)" }}>Name: </span>@
        <br />
        <span style={{ color: "hsl(220 9% 40%)" }}>Value: </span>{host}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LaunchTab({ result }: { result: BusinessResult }) {
  const [deploy, setDeploy]     = useState<DeployRecord | null>(null);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [showDnsGuide,   setShowDnsGuide]   = useState(false);

  const storageKey = `lf_deploy_${result.id}`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) { try { setDeploy(JSON.parse(raw)); } catch {} }
  }, [storageKey]);

  function saveDeployment(url: string, environment: "production" | "preview") {
    const rec: DeployRecord = {
      url,
      domain: deploy?.domain,
      deployedAt: new Date().toISOString(),
      environment,
    };
    localStorage.setItem(storageKey, JSON.stringify(rec));
    setDeploy(rec);
    setShowDeployForm(false);
  }

  function saveDomain(domain: string) {
    if (!deploy) return;
    const rec = { ...deploy, domain };
    localStorage.setItem(storageKey, JSON.stringify(rec));
    setDeploy(rec);
    setShowDomainForm(false);
  }

  function clearDeploy() {
    localStorage.removeItem(storageKey);
    setDeploy(null);
  }

  const hasWebsite   = (result.projectFiles?.filter((f) => f.folder === "website") ?? []).length > 0;
  const isDeployed   = !!deploy?.url;
  const hasDomain    = !!deploy?.domain;

  type StepId = "research" | "product" | "website" | "deploy" | "domain" | "analytics";

  interface Step {
    id: StepId;
    num: number;
    label: string;
    desc: string;
    complete: boolean;
    locked: boolean;
  }

  const steps: Step[] = [
    {
      id: "research", num: 1, label: "Research",
      desc: result.niche ? `Market research complete — ${result.niche}` : "Market research complete",
      complete: true,
      locked: false,
    },
    {
      id: "product", num: 2, label: "Product",
      desc: result.product.tagline ?? result.product.name,
      complete: true,
      locked: false,
    },
    {
      id: "website", num: 3, label: "Website",
      desc: hasWebsite ? "Landing page generated" : "Generate your landing page in the Website tab",
      complete: hasWebsite,
      locked: false,
    },
    {
      id: "deploy", num: 4, label: "Deploy",
      desc: isDeployed
        ? `${deploy!.environment === "production" ? "Production" : "Preview"} — ${deploy!.url.replace(/^https?:\/\//, "").split("/")[0]}`
        : "Publish your website to the internet",
      complete: isDeployed,
      locked: !hasWebsite,
    },
    {
      id: "domain", num: 5, label: "Domain",
      desc: hasDomain ? deploy!.domain! : "Connect a custom domain",
      complete: hasDomain,
      locked: !isDeployed,
    },
    {
      id: "analytics", num: 6, label: "Analytics",
      desc: "Connect Stripe, Vercel, or GA to track performance",
      complete: false,
      locked: !isDeployed,
    },
  ];

  const firstIncompleteIdx = steps.findIndex((s) => !s.complete && !s.locked);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-base font-semibold mb-1" style={{ color: "hsl(220 9% 86%)" }}>
          Launch Center
        </h2>
        <p className="text-sm" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.6 }}>
          Follow these steps to go from idea to a live, tracked business.
        </p>
      </div>

      {/* Progress summary */}
      {(() => {
        const done = steps.filter((s) => s.complete).length;
        const pct  = Math.round((done / steps.length) * 100);
        return (
          <div
            className="rounded-xl px-5 py-4 mb-8 flex items-center gap-5"
            style={{ backgroundColor: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 15%)" }}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: "hsl(220 9% 55%)" }}>
                  Launch progress
                </span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: "hsl(220 9% 70%)" }}>
                  {done} / {steps.length}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 16%)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct === 100 ? "hsl(151 60% 48%)" : "hsl(213 94% 62%)",
                  }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-semibold tabular-nums" style={{ color: pct === 100 ? "hsl(151 60% 48%)" : "hsl(220 9% 78%)" }}>
                {pct}%
              </p>
            </div>
          </div>
        );
      })()}

      {/* Steps */}
      <div className="space-y-0">
        {steps.map((step, i) => {
          const isActive = i === firstIncompleteIdx;
          const isLast   = i === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Left: circle + connector */}
              <div className="flex flex-col items-center">
                <StepCircle num={step.num} complete={step.complete} active={isActive} locked={step.locked} />
                {!isLast && (
                  <div
                    className="w-px flex-1 mt-1 mb-1"
                    style={{
                      backgroundColor: step.complete ? "hsl(151 60% 48% / 0.25)" : "hsl(220 13% 16%)",
                      minHeight: 24,
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: step.locked ? "hsl(220 9% 28%)" : step.complete ? "hsl(220 9% 70%)" : "hsl(220 9% 86%)",
                    }}
                  >
                    {step.label}
                  </span>
                  {step.complete && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 50%)" }}>
                      Done
                    </span>
                  )}
                  {isActive && !step.complete && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", color: "hsl(213 94% 65%)" }}>
                      Up next
                    </span>
                  )}
                  {step.locked && (
                    <span className="text-xs" style={{ color: "hsl(220 9% 26%)" }}>Locked</span>
                  )}
                </div>
                <p className="text-xs" style={{ color: step.locked ? "hsl(220 9% 24%)" : "hsl(220 9% 40%)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>

                {/* Step-specific actions */}
                {step.id === "website" && !step.complete && (
                  <p className="mt-2 text-xs" style={{ color: "hsl(213 94% 55%)" }}>
                    → Go to the <strong>Website</strong> tab to generate your landing page
                  </p>
                )}

                {step.id === "deploy" && !step.locked && (
                  <div className="mt-2">
                    {isDeployed ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={deploy!.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          style={{ color: "hsl(213 94% 62%)" }}
                        >
                          View site <IconExternal />
                        </a>
                        <button
                          onClick={() => setShowDeployForm((v) => !v)}
                          className="text-xs"
                          style={{ color: "hsl(220 9% 36%)" }}
                        >
                          Update URL
                        </button>
                        <button
                          onClick={clearDeploy}
                          className="text-xs"
                          style={{ color: "hsl(0 72% 45%)" }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeployForm((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.25)", color: "hsl(213 94% 65%)" }}
                      >
                        Enter deployment URL <IconArrow />
                      </button>
                    )}
                    {showDeployForm && (
                      <DeployForm onSave={saveDeployment} />
                    )}
                    {!isDeployed && (
                      <p className="mt-2 text-xs" style={{ color: "hsl(220 9% 30%)", lineHeight: 1.6 }}>
                        Deploy manually via Vercel, Netlify, or any host, then paste the URL above.
                      </p>
                    )}
                  </div>
                )}

                {step.id === "domain" && !step.locked && (
                  <div className="mt-2">
                    {hasDomain ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://${deploy!.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          style={{ color: "hsl(213 94% 62%)" }}
                        >
                          {deploy!.domain} <IconExternal />
                        </a>
                        <button
                          onClick={() => setShowDomainForm((v) => !v)}
                          className="text-xs"
                          style={{ color: "hsl(220 9% 36%)" }}
                        >
                          Update domain
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setShowDomainForm((v) => !v); setShowDnsGuide(false); }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ backgroundColor: "hsl(151 60% 48% / 0.08)", border: "1px solid hsl(151 60% 48% / 0.2)", color: "hsl(151 60% 55%)" }}
                        >
                          Add custom domain
                        </button>
                        <button
                          onClick={() => { setShowDnsGuide((v) => !v); setShowDomainForm(false); }}
                          className="text-xs"
                          style={{ color: "hsl(220 9% 36%)" }}
                        >
                          DNS guide
                        </button>
                      </div>
                    )}
                    {showDomainForm && <DomainForm onSave={saveDomain} />}
                    {showDnsGuide && deploy?.url && <DnsGuide deployUrl={deploy.url} />}
                  </div>
                )}

                {step.id === "analytics" && !step.locked && (
                  <div className="mt-2">
                    <Link
                      href="/dashboard/analytics"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 19%)", color: "hsl(220 9% 55%)" }}
                    >
                      Go to Analytics →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div
        className="mt-4 rounded-xl px-4 py-3"
        style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 14%)" }}
      >
        <p className="text-xs" style={{ color: "hsl(220 9% 32%)", lineHeight: 1.6 }}>
          Deployment status is tracked locally. Connect Vercel via{" "}
          <Link href="/dashboard/settings" className="underline" style={{ color: "hsl(220 9% 42%)" }}>
            Settings
          </Link>{" "}
          for automatic sync.
        </p>
      </div>
    </div>
  );
}
