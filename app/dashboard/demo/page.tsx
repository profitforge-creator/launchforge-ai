"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LeadStatus = "new" | "qualified" | "nurture" | "low-fit";
type LeadPriority = "high" | "medium" | "low";

interface LeadForm {
  name: string;
  email: string;
  company: string;
  website: string;
  budget: string;
  urgency: string;
  need: string;
}

interface LeadClassification {
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  reasons: string[];
}

interface CrmLead extends LeadForm {
  id: string;
  createdAt: string;
  classification: LeadClassification;
  followUpDraft: string;
}

const STORAGE_KEY = "launchforge_lead_demo_crm";

const EMPTY_FORM: LeadForm = {
  name: "",
  email: "",
  company: "",
  website: "",
  budget: "5000",
  urgency: "this-week",
  need: "",
};

const SAMPLE_FORM: LeadForm = {
  name: "Maya Chen",
  email: "maya@northstarops.example",
  company: "Northstar Ops",
  website: "https://northstarops.example",
  budget: "12000",
  urgency: "this-week",
  need: "We need a conversion-focused landing page and automated onboarding sequence before a partner launch next Friday.",
};

function classifyLead(lead: LeadForm): LeadClassification {
  const budget = Number.parseInt(lead.budget || "0", 10);
  const text = `${lead.company} ${lead.need}`.toLowerCase();
  let score = 35;
  const reasons: string[] = [];

  if (budget >= 10000) {
    score += 25;
    reasons.push("Budget supports a high-touch build.");
  } else if (budget >= 5000) {
    score += 15;
    reasons.push("Budget fits a scoped launch package.");
  } else {
    reasons.push("Budget likely needs a smaller package.");
  }

  if (lead.urgency === "this-week") {
    score += 20;
    reasons.push("Urgency indicates active buying intent.");
  } else if (lead.urgency === "this-month") {
    score += 10;
    reasons.push("Timeline is near-term.");
  }

  if (/(launch|conversion|revenue|sales|onboarding|automation|crm)/.test(text)) {
    score += 15;
    reasons.push("Need matches LaunchForge execution strengths.");
  }

  if (lead.email.includes("@") && lead.company.trim().length > 1) {
    score += 5;
    reasons.push("Contact and company details are complete.");
  }

  const boundedScore = Math.min(score, 100);
  if (boundedScore >= 75) return { status: "qualified", priority: "high", score: boundedScore, reasons };
  if (boundedScore >= 55) return { status: "nurture", priority: "medium", score: boundedScore, reasons };
  return { status: "low-fit", priority: "low", score: boundedScore, reasons };
}

function createFollowUpDraft(lead: LeadForm, classification: LeadClassification) {
  const firstName = lead.name.trim().split(/\s+/)[0] || "there";
  const urgency =
    lead.urgency === "this-week" ? "this week" :
    lead.urgency === "this-month" ? "this month" :
    "when the timing is right";

  if (classification.status === "qualified") {
    return `Subject: ${lead.company} launch plan\n\nHi ${firstName},\n\nThanks for sharing the context. Based on your timeline and budget, this looks like a strong fit for a focused LaunchForge sprint.\n\nI would suggest a short call to map the launch assets, CRM handoff, and follow-up sequence so we can move quickly ${urgency}.\n\nBest,\nLaunchForge`;
  }

  if (classification.status === "nurture") {
    return `Subject: Next steps for ${lead.company}\n\nHi ${firstName},\n\nThanks for reaching out. Your project looks promising, and I think the best next step is a compact scope: clarify the offer, create the first landing page, and draft the initial follow-up sequence.\n\nIf that sounds useful, I can send a lightweight plan for review.\n\nBest,\nLaunchForge`;
  }

  return `Subject: A lighter path for ${lead.company}\n\nHi ${firstName},\n\nThanks for the note. Based on the current scope, I would start with a smaller validation package before moving into a larger build.\n\nA simple intake page, one follow-up email, and a clear CRM workflow would give you enough signal before investing more.\n\nBest,\nLaunchForge`;
}

function statusLabel(status: LeadStatus) {
  return status === "qualified" ? "Qualified" : status === "nurture" ? "Nurture" : status === "low-fit" ? "Low fit" : "New";
}

function statusColor(status: LeadStatus) {
  if (status === "qualified") return "hsl(151 60% 48%)";
  if (status === "nurture") return "hsl(38 90% 55%)";
  if (status === "low-fit") return "hsl(220 9% 46%)";
  return "hsl(213 94% 62%)";
}

function buildDigest(leads: CrmLead[]) {
  const qualified = leads.filter((lead) => lead.classification.status === "qualified");
  const nurture = leads.filter((lead) => lead.classification.status === "nurture");
  const avgScore = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + lead.classification.score, 0) / leads.length)
    : 0;

  const topLeads = [...leads]
    .sort((a, b) => b.classification.score - a.classification.score)
    .slice(0, 3)
    .map((lead) => `${lead.company || lead.name}: ${lead.classification.score}/100`)
    .join("\n");

  return [
    `Weekly lead digest`,
    ``,
    `Total leads: ${leads.length}`,
    `Qualified: ${qualified.length}`,
    `Nurture: ${nurture.length}`,
    `Average score: ${avgScore}`,
    ``,
    `Top opportunities:`,
    topLeads || "No leads captured yet.",
    ``,
    `Recommended action: ${qualified.length > 0 ? "Book calls with qualified leads first, then send nurture drafts." : "Add more qualified traffic before sales outreach."}`,
  ].join("\n");
}

export default function LeadOpsDemoPage() {
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CrmLead[];
      setLeads(parsed);
      setSelectedId(parsed[0]?.id ?? null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const liveClassification = useMemo(() => classifyLead(form), [form]);
  const liveDraft = useMemo(() => createFollowUpDraft(form, liveClassification), [form, liveClassification]);
  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null;
  const digest = useMemo(() => buildDigest(leads), [leads]);

  function updateField(field: keyof LeadForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitLead() {
    const classification = classifyLead(form);
    const row: CrmLead = {
      ...form,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      classification,
      followUpDraft: createFollowUpDraft(form, classification),
    };
    setLeads((current) => [row, ...current]);
    setSelectedId(row.id);
    setForm(EMPTY_FORM);
  }

  const canSubmit = form.name.trim().length > 1 && form.email.includes("@") && form.need.trim().length > 8;

  return (
    <main className="min-h-full bg-[hsl(220_14%_8%)] px-8 py-8 text-[hsl(220_9%_88%)]">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Lead Ops Demo</h1>
            <p className="mt-1 text-xs text-[hsl(220_9%_40%)]">
              Intake, classification, follow-up, CRM row, and weekly digest.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setForm(SAMPLE_FORM)}>Load sample</Button>
            <Button
              variant="outline"
              onClick={() => {
                setLeads([]);
                setSelectedId(null);
              }}
            >
              Clear demo
            </Button>
          </div>
        </header>

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
                <p className="mt-1 text-xs text-[hsl(220_9%_40%)]">Captured locally for the demo.</p>
              </div>
              <Badge variant="default">Local</Badge>
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
              <Button type="submit" disabled={!canSubmit}>Create preview lead</Button>
            </div>
          </form>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)] p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">AI classification</h2>
                  <p className="mt-1 text-xs text-[hsl(220_9%_40%)]">Deterministic demo scorer.</p>
                </div>
                <span
                  className="rounded px-2 py-1 text-xs font-semibold text-[hsl(220_14%_7%)]"
                  style={{ backgroundColor: statusColor(liveClassification.status) }}
                >
                  {liveClassification.score}/100
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[hsl(220_9%_36%)]">Status</p>
                  <p className="mt-1 text-lg font-semibold" style={{ color: statusColor(liveClassification.status) }}>
                    {statusLabel(liveClassification.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(220_9%_36%)]">Priority</p>
                  <p className="mt-1 text-sm capitalize text-[hsl(220_9%_76%)]">{liveClassification.priority}</p>
                </div>
                <div className="space-y-2">
                  {liveClassification.reasons.map((reason) => (
                    <div key={reason} className="rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] px-3 py-2 text-xs text-[hsl(220_9%_58%)]">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)] p-4">
              <h2 className="text-sm font-semibold">Follow-up draft</h2>
              <pre className="mt-4 min-h-80 whitespace-pre-wrap rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-4 text-xs leading-relaxed text-[hsl(220_9%_66%)]">
                {selectedLead?.followUpDraft ?? liveDraft}
              </pre>
            </section>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_10%)]">
            <div className="border-b border-[hsl(220_13%_16%)] px-4 py-3">
              <h2 className="text-sm font-semibold">Preview lead records</h2>
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
                      <td colSpan={6} className="px-4 py-10 text-center text-[hsl(220_9%_34%)]">No preview lead records yet.</td>
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
            <pre className="mt-4 whitespace-pre-wrap rounded border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_8%)] p-4 text-xs leading-relaxed text-[hsl(220_9%_66%)]">
              {digest}
            </pre>
          </section>
        </section>
      </div>
    </main>
  );
}
