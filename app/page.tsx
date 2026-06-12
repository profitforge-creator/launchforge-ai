"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center"
        style={{ backgroundColor: "hsl(213 94% 58%)" }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 14% 7%)" />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-tight" style={{ color: "hsl(220 9% 94%)" }}>
        LaunchForge
      </span>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
      style={{ borderBottom: "1px solid hsl(220 13% 13%)", backgroundColor: "hsl(220 14% 7% / 0.92)", backdropFilter: "blur(12px)" }}
    >
      <Logo />
      <div className="flex items-center gap-6">
        <a href="#how-it-works" className="text-xs font-medium transition-colors hidden sm:block" style={{ color: "hsl(220 9% 46%)" }}>
          How it works
        </a>
        <a href="#examples" className="text-xs font-medium transition-colors hidden sm:block" style={{ color: "hsl(220 9% 46%)" }}>
          Examples
        </a>
        <a href="#pricing" className="text-xs font-medium transition-colors hidden sm:block" style={{ color: "hsl(220 9% 46%)" }}>
          Pricing
        </a>
        <Link href="/dashboard" className="text-xs font-medium" style={{ color: "hsl(220 9% 46%)" }}>
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="h-8 px-4 rounded-lg text-xs font-medium transition-colors"
          style={{ border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 55%)", backgroundColor: "transparent" }}
        >
          Start Building
        </Link>
      </div>
    </nav>
  );
}

// ── Animated demo ─────────────────────────────────────────────────────────────

const BUILD_STEPS = [
  { label: "Researching market demand",    delay: 800  },
  { label: "Analyzing competitors",        delay: 1800 },
  { label: "Identifying opportunities",   delay: 2800 },
  { label: "Designing product",           delay: 3800 },
  { label: "Building website",            delay: 4800 },
  { label: "Generating launch strategy",  delay: 5800 },
];

const RESULT_AREAS = [
  { label: "Research",   note: "Market gap identified" },
  { label: "Product",    note: "FocusFlow Toolkit" },
  { label: "Website",    note: "4 pages generated" },
  { label: "Marketing",  note: "Launch plan ready" },
];

function AnimatedDemo() {
  const [visibleSteps, setVisibleSteps]     = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [showResult, setShowResult]         = useState(false);
  const [started, setStarted]               = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    BUILD_STEPS.forEach((step, i) => {
      setTimeout(() => setVisibleSteps((v) => Math.max(v, i + 1)), step.delay);
      setTimeout(() => setCompletedSteps((v) => Math.max(v, i + 1)), step.delay + 700);
    });
    setTimeout(() => setShowResult(true), 7400);
  }, [started]);

  return (
    <div
      ref={ref}
      className="rounded-xl overflow-hidden max-w-2xl mx-auto"
      style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 px-4 py-3"
        style={{ borderBottom: "1px solid hsl(220 13% 14%)", backgroundColor: "hsl(220 13% 11%)" }}
      >
        {["hsl(0 60% 42%)", "hsl(38 70% 44%)", "hsl(120 40% 36%)"].map((c) => (
          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
        <div
          className="flex-1 mx-4 h-5 rounded text-xs flex items-center px-3"
          style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 35%)" }}
        >
          launchforge.ai/build
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* User prompt */}
        <div className="flex justify-end">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm"
            style={{ backgroundColor: "hsl(220 13% 15%)", border: "1px solid hsl(220 13% 21%)", color: "hsl(220 9% 82%)" }}
          >
            Create a digital product for remote professionals
          </div>
        </div>

        {/* Build steps */}
        <div className="space-y-2">
          {BUILD_STEPS.slice(0, visibleSteps).map((step, i) => {
            const done = i < completedSteps;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {done ? (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" style={{ color: "hsl(213 94% 62%)" }}>
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm" style={{ color: done ? "hsl(220 9% 50%)" : "hsl(220 9% 78%)" }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {showResult && (
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ border: "1px solid hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}
          >
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "hsl(213 94% 65%)" }}>Project created</p>
              <h3 className="text-lg font-bold" style={{ color: "hsl(220 9% 94%)" }}>FocusFlow Toolkit</h3>
              <p className="text-xs mt-1" style={{ color: "hsl(220 9% 44%)" }}>
                Digital productivity system for remote professionals
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RESULT_AREAS.map((area) => (
                <div
                  key={area.label}
                  className="rounded-lg px-3 py-2.5"
                  style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 18%)" }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: "hsl(220 9% 70%)" }}>{area.label}</span>
                  </div>
                  <p className="text-xs pl-4" style={{ color: "hsl(220 9% 38%)" }}>{area.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Example projects ──────────────────────────────────────────────────────────

const EXAMPLE_PROJECTS = [
  { name: "FocusFlow Toolkit",  type: "Digital Product",       status: "Live",         score: 84 },
  { name: "ClientVault",        type: "SaaS",                  status: "In Development", score: 79 },
  { name: "GrowthSheets",       type: "Spreadsheet Templates", status: "Live",         score: 76 },
  { name: "TeamSync Pro",       type: "Productized Service",   status: "Launch Ready", score: 81 },
  { name: "KnowledgeBase OS",   type: "Digital Product",       status: "Live",         score: 88 },
];

function ProjectCard({ project }: { project: typeof EXAMPLE_PROJECTS[number] }) {
  const statusColor =
    project.status === "Live"           ? "hsl(151 60% 48%)" :
    project.status === "Launch Ready"   ? "hsl(213 94% 62%)" :
    "hsl(38 90% 55%)";

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(220 9% 90%)" }}>{project.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 38%)" }}>{project.type}</p>
        </div>
        <span className="text-lg font-bold tabular-nums shrink-0" style={{ color: "hsl(213 94% 62%)" }}>
          {project.score}
        </span>
      </div>
      <div className="space-y-1.5">
        {["Website generated", "Marketing ready", "Files exported"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs" style={{ color: "hsl(220 9% 44%)" }}>{item}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <span className="text-xs font-medium" style={{ color: statusColor }}>
          {project.status}
        </span>
        <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>
          launchforge.ai/w/···
        </span>
      </div>
    </div>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    step: "01",
    title: "Describe your idea",
    body: "Type anything — an interest, a skill, or a goal. There is no form to fill out.",
  },
  {
    step: "02",
    title: "LaunchForge builds it",
    body: "Six specialized agents run in sequence: market research, product design, website generation, marketing system, and quality review.",
  },
  {
    step: "03",
    title: "Refine with the AI advisor",
    body: "Chat with your project directly. Ask for copy changes, pricing adjustments, or a new marketing angle. The AI updates your files in real time.",
  },
  {
    step: "04",
    title: "Deploy and launch",
    body: "Export your website, push to GitHub, and deploy to Vercel in one click. Your business is live.",
  },
];

// ── Trial section ─────────────────────────────────────────────────────────────

const TRIAL_INCLUDES = [
  "Business generation",
  "Product design & files",
  "Website generation",
  "AI advisor",
  "ZIP export",
  "Deployment access",
];

// ── Pricing ───────────────────────────────────────────────────────────────────

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  cta: string;
  highlight: boolean;
  features: { label: string; included: boolean }[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$29",
    period: "/ month",
    description: "For individuals building their first business.",
    cta: "Start Starter",
    highlight: false,
    features: [
      { label: "10 projects / month",        included: true  },
      { label: "50 AI generations / month",  included: true  },
      { label: "Website generation",         included: true  },
      { label: "ZIP export",                 included: true  },
      { label: "AI advisor",                 included: true  },
      { label: "Deployments",                included: false },
      { label: "Analytics",                  included: false },
      { label: "Priority support",           included: false },
    ],
  },
  {
    name: "Pro",
    price: "$79",
    period: "/ month",
    description: "For serious builders launching multiple products.",
    cta: "Start Pro",
    highlight: true,
    features: [
      { label: "Unlimited projects",         included: true  },
      { label: "Unlimited AI generations",   included: true  },
      { label: "Website generation",         included: true  },
      { label: "ZIP export",                 included: true  },
      { label: "AI advisor",                 included: true  },
      { label: "Deployments",                included: true  },
      { label: "Analytics",                  included: true  },
      { label: "Priority support",           included: true  },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and agencies building at scale.",
    cta: "Contact us",
    highlight: false,
    features: [
      { label: "Everything in Pro",          included: true  },
      { label: "Custom integrations",        included: true  },
      { label: "Dedicated support",          included: true  },
      { label: "SLA guarantee",             included: true  },
      { label: "Custom deployment targets",  included: true  },
      { label: "Team accounts",              included: true  },
      { label: "Audit logs",                 included: true  },
      { label: "SSO / SAML",                included: true  },
    ],
  },
];

function CheckIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)", flexShrink: 0 }}>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(220 9% 24%)", flexShrink: 0 }}>
      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-5"
      style={{
        border: tier.highlight
          ? "1px solid hsl(213 94% 62% / 0.3)"
          : "1px solid hsl(220 13% 15%)",
        backgroundColor: tier.highlight ? "hsl(213 94% 62% / 0.04)" : "hsl(220 13% 9%)",
        position: "relative",
      }}
    >
      {tier.highlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "hsl(213 94% 58%)", color: "hsl(220 14% 7%)" }}
        >
          Most popular
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 36%)", letterSpacing: "0.08em" }}>
          {tier.name}
        </p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-bold" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.03em" }}>
            {tier.price}
          </span>
          {tier.period && (
            <span className="text-sm" style={{ color: "hsl(220 9% 38%)" }}>{tier.period}</span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 40%)" }}>
          {tier.description}
        </p>
      </div>

      <Link
        href="/dashboard"
        className="w-full h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors"
        style={
          tier.highlight
            ? { backgroundColor: "hsl(220 9% 94%)", color: "hsl(220 14% 7%)" }
            : { border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 60%)", backgroundColor: "transparent" }
        }
      >
        {tier.cta}
      </Link>

      <div className="space-y-2.5 pt-1" style={{ borderTop: "1px solid hsl(220 13% 14%)" }}>
        {tier.features.map((f) => (
          <div key={f.label} className="flex items-center gap-2.5">
            <CheckIcon included={f.included} />
            <span className="text-xs" style={{ color: f.included ? "hsl(220 9% 56%)" : "hsl(220 9% 28%)" }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.1em" }}>
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.02em" }}>
            Start with a free trial. Upgrade when ready.
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(220 9% 42%)" }}>
            3-day full access trial — no credit card required.
            Upgrade at any time. Cancel at any time.
          </p>
        </div>

        {/* Trial callout */}
        <div
          className="rounded-xl px-6 py-5 mb-8 flex items-center justify-between gap-4"
          style={{ border: "1px solid hsl(151 60% 48% / 0.2)", backgroundColor: "hsl(151 60% 48% / 0.04)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 86%)" }}>3-Day Full Access Trial</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 40%)" }}>
              Everything in Pro. No credit card. Cancel anytime.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 h-9 px-5 rounded-lg text-sm font-semibold flex items-center"
            style={{ backgroundColor: "hsl(220 9% 94%)", color: "hsl(220 14% 7%)" }}
          >
            Start trial
          </Link>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PRICING_TIERS.map((tier) => <PricingCard key={tier.name} tier={tier} />)}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "hsl(220 9% 28%)" }}>
          All prices in USD. Billed monthly. Annual billing available on Pro and Enterprise.
        </p>
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 7%)" }}>
      <Nav />

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 50%)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
            3-Day Full Access Trial — No card required
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
            style={{ color: "hsl(220 9% 96%)", lineHeight: 1.08, letterSpacing: "-0.025em" }}
          >
            Build a Business.
            <br />
            <span style={{ color: "hsl(220 9% 46%)" }}>Not Another AI Tool.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: "hsl(220 9% 48%)" }}>
            Describe an idea. LaunchForge researches the market, creates the product,
            builds the website, and prepares the launch.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="h-11 px-7 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: "hsl(220 9% 96%)", color: "hsl(220 14% 7%)" }}
            >
              Start Building
            </Link>
            <a
              href="#demo"
              className="h-11 px-6 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              style={{ border: "1px solid hsl(220 13% 18%)", color: "hsl(220 9% 58%)" }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Watch Example Build
            </a>
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <section id="demo" className="pb-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)", paddingTop: 80 }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.1em" }}>
              Live Example
            </p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.02em" }}>
              See a build in real time
            </h2>
          </div>
          <AnimatedDemo />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.1em" }}>
              Process
            </p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.02em" }}>
              From idea to launch
            </h2>
          </div>
          <div style={{ border: "1px solid hsl(220 13% 14%)", borderRadius: 12, overflow: "hidden" }}>
            {HOW_STEPS.map((s, i) => (
              <div
                key={s.step}
                className="flex gap-8 px-7 py-6"
                style={{ borderBottom: i < HOW_STEPS.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
              >
                <span
                  className="text-xs font-mono font-semibold shrink-0 pt-0.5 w-5"
                  style={{ color: "hsl(220 9% 28%)" }}
                >
                  {s.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "hsl(220 9% 86%)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 44%)" }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example projects ── */}
      <section id="examples" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.1em" }}>
              Built with LaunchForge
            </p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.02em" }}>
              Real businesses, real output
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMPLE_PROJECTS.map((p) => <ProjectCard key={p.name} project={p} />)}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Trial CTA ── */}
      <section className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl px-10 py-14 text-center" style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 9%)" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "hsl(220 9% 32%)", letterSpacing: "0.1em" }}>
              Trial
            </p>
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: "hsl(220 9% 92%)", letterSpacing: "-0.02em" }}>
              3-Day Full Access Trial
            </h2>
            <p className="text-sm mb-8" style={{ color: "hsl(220 9% 44%)" }}>
              No credit card. No limits. The full platform.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto mb-8">
              {TRIAL_INCLUDES.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)", flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-left" style={{ color: "hsl(220 9% 54%)" }}>{item}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-11 px-8 rounded-xl text-sm font-semibold items-center"
              style={{ backgroundColor: "hsl(220 9% 96%)", color: "hsl(220 14% 7%)" }}
            >
              Start your trial
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <p className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>
            © 2026 LaunchForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
