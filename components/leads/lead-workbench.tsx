"use client";

import { useMemo, useState, useTransition } from "react";
import { actionCreateLead, actionGetWeeklyLeadDigest, actionListLeads } from "@/app/actions/leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LeadStorageStatus } from "@/lib/leads/supabase-store";
import type { LeadInput, LeadRecord, WeeklyLeadDigest } from "@/lib/leads/types";

const EMPTY_FORM: LeadInput = {
  name: "",
  email: "",
  company: "",
  website: "",
  budget: "5000",
  urgency: "this-month",
  need: "",
};

const SAMPLE_FORM: LeadInput = {
  name: "Maya Chen",
  email: "maya@northstarops.example",
  company: "Northstar Ops",
  website: "https://northstarops.example",
  budget: "12000",
  urgency: "this-week",
  need: "We need a conversion-focused landing page, CRM workflow, and automated onboarding drafts before a partner launch next Friday.",
};

function statusLabel(status: LeadRecord["classification"]["status"]) {
  return status === "qualified" ? "Qualified" : status === "nurture" ? "Nurture" : status === "low-fit" ? "Low fit" : "New";
}

function statusColor(status: LeadRecord["classification"]["status"]) {
  if (status === "qualified") return "hsl(151 60% 48%)";
  if (status === "nurture") return "hsl(38 90% 55%)";
  if (status === "low-fit") return "hsl(220 9% 46%)";
  return "hsl(213 94% 62%)";
}

export function LeadWorkbench({
  initialLeads,
  initialDigest,
  storageStatus,
}: {
  initialLeads: LeadRecord[];
  initialDigest: WeeklyLeadDigest;
  storageStatus: LeadStorageStatus;
}) {
  const [form, setForm] = useState<LeadInput>(EMPTY_FORM);
  const [leads, setLeads] = useState(initialLeads);
  const [digest, setDigest] = useState(initialDigest);
  const [selectedId, setSelectedId] = useState(initialLeads[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null,
    [leads, selectedId],
  );

  function updateField(field: keyof LeadInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function refreshData() {
    startTransition(async () => {
      const [nextLeads, nextDigest] = await Promise.all([
        actionListLeads(),
        actionGetWeeklyLeadDigest(),
      ]);
      setLeads(nextLeads);
      setDigest(nextDigest);
      setSelectedId(nextLeads[0]?.id ?? null);
    });
  }

  function submitLead() {
    setError(null);
    startTransition(async () => {
      const result = await actionCreateLead(form);
      if (!result.success || !result.data) {
        setError(result.error ?? "Could not create lead.");
        return;
      }
      setForm(EMPTY_FORM);
      const [nextLeads, nextDigest] = await Promise.all([
        actionListLeads(),
        actionGetWeeklyLeadDigest(),
      ]);
      setLeads(nextLeads);
      setDigest(nextDigest);
      setSelectedId(result.data.id);
    });
  }

  const canSubmit = form.name.trim().length > 1 && form.email.includes("@") && form.company.trim().length > 1 && form.need.trim().length > 9;
  const isPreviewStorage = storageStatus.mode === "local-fallback";

  return (
    <main className="min-h-full bg-[hsl(220_14%_8%)] px-8 py-8 text-[hsl(220_9%_88%)]">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
            <p className="mt-1 text-xs text-[hsl(220_9%_40%)]">
              Intake, classify, draft, and review before any external action.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setForm(SAMPLE_FORM)} disabled={isPending}>Load sample</Button>
            <Button variant="outline" onClick={refreshData} disabled={isPending}>Refresh</Button>
          </div>
        </header>

        {storageStatus.mode === "local-fallback" && (
          <section className="rounded-lg border border-[hsl(213_94%_62%/0.25)] bg-[hsl(213_94%_62%/0.08)] px-4 py-3">
            <p className="text-xs font-semibold text-[hsl(213_94%_68%)]">Preview storage active</p>
            <p className="mt-1 text-xs leading-relaxed text-[hsl(220_9%_66%)]">
              {storageStatus.reason ?? "Lead records are not using durable Supabase storage yet."}
            </p>
          </section>
        )}

        <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form
            className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)] p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (canSubmit) submitLead();
            }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Lead intake</h2>
                <p className="mt-1 text-xs text-[hsl(220_9%_40%)]">
                  {isPreviewStorage ? "Creates a preview lead record." : "Creates an internal lead record."}
                </p>
              </div>
              <Badge variant="neutral">{isPreviewStorage ? "Preview" : "MVP"}</Badge>
            </div>

            <div className="grid gap-3">
              <Input label="Name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
              <Input label="Company" value={form.company} onChange={(event) => updateField("company", event.target.value)} />
              <Input label="Website" value={form.website} onChange={(event) => updateField("website", event.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Budget" type="number" value={form.budget} onChange={(event) => updateField("budget", event.target.value)} />
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[hsl(220_9%_75%)]">Urgency</span>
                  <select
                    value={form.urgency}
                    onChange={(event) => updateField("urgency", event.target.value)}
                    className="h-8 rounded border border-[hsl(220_13%_20%)] bg-[hsl(220_13%_11%)] px-3 text-sm text-[hsl(220_9%_93%)] outline-none"
                  >
                    <option value="this-week">This week</option>
                    <option value="this-month">This month</option>
                    <option value="later">Later</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[hsl(220_9%_75%)]">Need</span>
                <textarea
                  value={form.need}
                  onChange={(event) => updateField("need", event.target.value)}
                  rows={5}
                  className="resize-none rounded border border-[hsl(220_13%_20%)] bg-[hsl(220_13%_11%)] px-3 py-2 text-sm leading-relaxed text-[hsl(220_9%_93%)] outline-none placeholder:text-[hsl(220_9%_40%)]"
                  placeholder="What does this lead need?"
                />
              </label>
              {error && <p className="text-xs text-[hsl(0_72%_62%)]">{error}</p>}
              <Button type="submit" disabled={!canSubmit || isPending} loading={isPending}>
                {isPreviewStorage ? "Create preview lead" : "Create lead record"}
              </Button>
            </div>
          </form>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)] p-4">
              <h2 className="text-sm font-semibold">Selected lead</h2>
              {selectedLead ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{selectedLead.company}</p>
                      <p className="mt-1 text-xs text-[hsl(220_9%_42%)]">{selectedLead.name} - {selectedLead.email}</p>
                    </div>
                    <span
                      className="rounded px-2 py-1 text-xs font-semibold text-[hsl(220_14%_7%)]"
                      style={{ backgroundColor: statusColor(selectedLead.classification.status) }}
                    >
                      {selectedLead.classification.score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-3">
                      <p className="text-xs text-[hsl(220_9%_36%)]">Status</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: statusColor(selectedLead.classification.status) }}>
                        {statusLabel(selectedLead.classification.status)}
                      </p>
                    </div>
                    <div className="rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-3">
                      <p className="text-xs text-[hsl(220_9%_36%)]">Priority</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-[hsl(220_9%_74%)]">{selectedLead.classification.priority}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedLead.classification.reasons.map((reason) => (
                      <div key={reason} className="rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] px-3 py-2 text-xs text-[hsl(220_9%_58%)]">
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-[hsl(220_9%_36%)]">No lead selected.</p>
              )}
            </section>

            <section className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)] p-4">
              <h2 className="text-sm font-semibold">Follow-up draft</h2>
              <pre className="mt-4 min-h-80 whitespace-pre-wrap rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-4 text-xs leading-relaxed text-[hsl(220_9%_66%)]">
                {selectedLead?.followUpDraft ?? "Create a lead to generate a draft."}
              </pre>
            </section>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)]">
            <div className="border-b border-[hsl(220_13%_16%)] px-4 py-3">
              <h2 className="text-sm font-semibold">Lead records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="text-[hsl(220_9%_34%)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lead</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[hsl(220_9%_34%)]">No lead records yet.</td>
                    </tr>
                  ) : leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedId(lead.id)}
                      className="cursor-pointer border-t border-[hsl(220_13%_14%)] hover:bg-[hsl(220_13%_12%)]"
                    >
                      <td className="px-4 py-3 text-[hsl(220_9%_80%)]">
                        <div className="font-medium">{lead.name}</div>
                        <div className="mt-0.5 text-[hsl(220_9%_36%)]">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[hsl(220_9%_58%)]">{lead.company}</td>
                      <td className="px-4 py-3">
                        <span className="rounded px-2 py-1 font-semibold" style={{ color: statusColor(lead.classification.status), backgroundColor: "hsl(220 13% 8%)" }}>
                          {statusLabel(lead.classification.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[hsl(220_9%_70%)]">{lead.classification.score}</td>
                      <td className="px-4 py-3 text-[hsl(220_9%_58%)]">${lead.budget || "0"}</td>
                      <td className="px-4 py-3 text-[hsl(220_9%_36%)]">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)] p-4">
            <h2 className="text-sm font-semibold">Weekly digest</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric label="Total" value={digest.totalLeads} />
              <Metric label="Qualified" value={digest.qualifiedCount} />
              <Metric label="Nurture" value={digest.nurtureCount} />
              <Metric label="Avg score" value={digest.averageScore} />
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-4 text-xs leading-relaxed text-[hsl(220_9%_66%)]">
              {digest.summary}
            </pre>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-3">
      <p className="text-xs text-[hsl(220_9%_36%)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[hsl(220_9%_86%)]">{value}</p>
    </div>
  );
}
