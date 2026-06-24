"use client";

import Link from "next/link";

// ── Inline SVG helpers ────────────────────────────────────────────────────────

function LogoBolt({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#3b82f6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#22c55e" strokeWidth="2">
      <path d="M1.5 7L5 10.5 11.5 3" />
    </svg>
  );
}

function ArrowRight({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 7.5h10M9 3.5l4 4-4 4" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <path d="M8 1l2 5.5L16 8l-6 2L8 16l-2-6L0 8l6-1.5z" />
      </svg>
    ),
    title: "AI Business Generation",
    desc: "Generate validated ideas, write your pitch, and plan your GTM in minutes — not weeks.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <path d="M8 1s4.5 2 4.5 7l-4.5 5L3.5 8c0-5 4.5-7 4.5-7z" />
        <circle cx="8" cy="6.5" r="1.5" fill="#3b82f6" stroke="none" />
      </svg>
    ),
    title: "One-click Deployment",
    desc: "Push to production with AI-optimized configs. Zero-downtime deploys with automatic rollback.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <path d="M1 13h14M3 13V8M6 13V4M9 13V7M12 13V2" />
      </svg>
    ),
    title: "Real-time Analytics",
    desc: "Revenue, traffic, and conversion metrics that give you the full picture. No vanity numbers.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 15.5c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
    title: "Team Workspace",
    desc: "Collaborate seamlessly. Assign roles, share projects, and track progress across your entire team.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <path d="M5 2v3M11 2v3M4 5h8a1 1 0 011 1v2a5 5 0 01-10 0V6a1 1 0 011-1zM6 13v1.5M10 13v1.5" />
      </svg>
    ),
    title: "50+ Integrations",
    desc: "Connect GitHub, Stripe, Supabase, Vercel, and everything else your stack depends on.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" />
        <circle cx="8" cy="8" r="2.5" />
      </svg>
    ),
    title: "Revenue Intelligence",
    desc: "Know exactly what drives growth. Connect Stripe and see MRR, churn, and LTV in real time.",
  },
];

const PRICING = [
  {
    tier: "Free",
    price: "$0",
    desc: "Taste the magic. See exactly what you're missing.",
    cta: "Start for free",
    ctaStyle: "secondary" as const,
    badge: null,
    features: [
      "1 project / month",
      "3 AI chat edits per project",
      "Website preview (no export)",
      "Community support",
    ],
    locked: ["Export source code", "All integrations", "Analytics", "Priority support"],
  },
  {
    tier: "Starter",
    price: "$19",
    desc: "For solo builders ready to actually launch.",
    cta: "Start Starter",
    ctaStyle: "primary" as const,
    badge: null,
    features: [
      "10 projects / month",
      "30 AI chat edits per project",
      "Full website generation + export",
      "GitHub & Vercel deployment",
      "Email support",
    ],
    locked: [],
  },
  {
    tier: "Growth",
    price: "$49",
    desc: "For founders building seriously.",
    cta: "Start Growth trial",
    ctaStyle: "blue" as const,
    badge: "Most popular",
    features: [
      "50 projects / month",
      "100 AI chat edits per project",
      "All integrations",
      "Advanced analytics",
      "Priority support",
    ],
    locked: [],
  },
  {
    tier: "Scale",
    price: "$149",
    desc: "For teams and agencies at scale.",
    cta: "Contact sales",
    ctaStyle: "secondary" as const,
    badge: null,
    features: [
      "Unlimited projects",
      "Unlimited AI edits",
      "White-label option",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    locked: [],
  },
];

const TESTIMONIALS = [
  {
    quote: "LaunchForge cut our time-to-market by 60%. What used to take weeks now takes hours. The AI generation tools alone are worth 10x the price.",
    name: "Marcus Chen",
    title: "Founder, Orbit AI",
    grad: "linear-gradient(135deg,#667eea,#764ba2)",
    initial: "M",
  },
  {
    quote: "I manage 12 client projects through LaunchForge. The deployment tracking and analytics make client reporting effortless. Nothing else comes close.",
    name: "Sarah Okonkwo",
    title: "Agency Director, Pixel Wave",
    grad: "linear-gradient(135deg,#f093fb,#f5576c)",
    initial: "S",
  },
  {
    quote: "Shipped my SaaS in 3 weeks. The integrations with Stripe and Supabase made the infrastructure painless. I could focus 100% on the product.",
    name: "Jamie Rivera",
    title: "Indie Hacker, MicraSaaS",
    grad: "linear-gradient(135deg,#4facfe,#00f2fe)",
    initial: "J",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, height: 56,
        display: "flex", alignItems: "center", padding: "0 40px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)", background: "rgba(9,9,11,0.85)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
          <LogoBolt size={22} />
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>LaunchForge</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", marginLeft: 48, gap: 2 }}>
          {["Features", "Integrations", "Pricing", "Docs"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "#a1a1aa", fontSize: 13.5, padding: "6px 12px", borderRadius: 5, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login" style={{ color: "#a1a1aa", fontSize: 13.5, padding: "7px 14px", borderRadius: 6, textDecoration: "none" }}>Sign in</Link>
          <Link href="/signup" style={{ background: "#3b82f6", color: "white", fontSize: 13.5, fontWeight: 500, padding: "7px 16px", borderRadius: 6, textDecoration: "none" }}>Start free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "96px 40px 72px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", padding: "4px 12px 4px 8px", borderRadius: 100, fontSize: 12.5, color: "#60a5fa", fontWeight: 500, marginBottom: 32, cursor: "pointer" }}>
          <span style={{ background: "#3b82f6", color: "white", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 100, letterSpacing: "0.04em" }}>NEW</span>
          LaunchForge 2.0 — AI that builds with you
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#60a5fa" strokeWidth="1.5"><path d="M2 6h8M7 3l3 3-3 3" /></svg>
        </div>

        <h1 style={{ fontSize: "clamp(44px,5.5vw,72px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.04, marginBottom: 24, maxWidth: 900, marginLeft: "auto", marginRight: "auto", color: "#fafafa" }}>
          The AI operating system<br />for <span style={{ color: "#3b82f6" }}>ambitious builders</span>
        </h1>

        <p style={{ fontSize: 18, color: "#a1a1aa", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.65, fontWeight: 400 }}>
          Generate ideas, build products, deploy globally, and scale revenue — all from one intelligent workspace.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 56 }}>
          <Link href="/signup" style={{ background: "#3b82f6", color: "white", fontSize: 15, fontWeight: 500, padding: "11px 24px", borderRadius: 7, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            Start building free
            <ArrowRight />
          </Link>
          <Link href="/dashboard" style={{ color: "#a1a1aa", fontSize: 15, fontWeight: 500, padding: "11px 20px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7.5" cy="7.5" r="6" /><path d="M6 5.5l3.5 2L6 9.5V5.5z" fill="currentColor" stroke="none" /></svg>
            Watch demo
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 64 }}>
          <div style={{ display: "flex" }}>
            {[
              "linear-gradient(135deg,#667eea,#764ba2)",
              "linear-gradient(135deg,#f093fb,#f5576c)",
              "linear-gradient(135deg,#4facfe,#00f2fe)",
              "linear-gradient(135deg,#43e97b,#38f9d7)",
            ].map((g, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: g, border: "2px solid #09090b", marginLeft: i > 0 ? -8 : 0 }} />
            ))}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#fa709a,#fee140)", border: "2px solid #09090b", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "white" }}>+</div>
          </div>
          <span style={{ color: "#71717a", fontSize: 13.5 }}>Trusted by <strong style={{ color: "#a1a1aa", fontWeight: 500 }}>2,400+</strong> founders and agencies</span>
        </div>

        {/* Product preview */}
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.3),0 60px 120px rgba(0,0,0,.5),0 0 80px rgba(59,130,246,0.07)" }}>
          {/* Browser chrome */}
          <div style={{ background: "#111113", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.6 }} />
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 5, padding: "3px 16px", fontSize: 11.5, color: "#52525b", minWidth: 220, textAlign: "center", fontFamily: "monospace" }}>app.launchforge.ai/dashboard</div>
            </div>
          </div>
          {/* Dashboard preview */}
          <div style={{ background: "#09090b", display: "flex", height: 460, overflow: "hidden" }}>
            {/* Sidebar */}
            <div style={{ width: 196, background: "#111113", borderRight: "1px solid rgba(255,255,255,0.07)", padding: 14, display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 8px", marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, background: "#3b82f6", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>LaunchForge</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 5, background: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: 13, height: 13, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
                <div style={{ height: 7, width: 55, background: "#fafafa", borderRadius: 2, opacity: 0.8 }} />
              </div>
              {[55, 45, 62, 50, 56, 48].map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 5 }}>
                  <div style={{ width: 13, height: 13, background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
                  <div style={{ height: 6, width: w, background: "#a1a1aa", borderRadius: 2, opacity: 0.3 }} />
                </div>
              ))}
            </div>
            {/* Main */}
            <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[
                  { label: "Monthly Revenue", val: "$12,400", sub: "+18% this month", c: "#22c55e" },
                  { label: "Active Projects", val: "7", sub: "3 live in production", c: "#3b82f6" },
                  { label: "Deployments", val: "23", sub: "This month", c: "#a1a1aa" },
                  { label: "AI Generations", val: "142", sub: "858 remaining", c: "#a1a1aa" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#71717a", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: s.c, marginTop: 3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 12, flex: 1, overflow: "hidden" }}>
                <div style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>Recent Projects</span>
                    <span style={{ fontSize: 10, color: "#3b82f6" }}>View all</span>
                  </div>
                  <div style={{ padding: "0 14px" }}>
                    {[
                      { name: "SaaS Boilerplate", badge: "Live", bc: "#22c55e", bg: "rgba(34,197,94,0.1)", time: "2h ago" },
                      { name: "AI Newsletter", badge: "Building", bc: "#3b82f6", bg: "rgba(59,130,246,0.1)", time: "5h ago" },
                      { name: "E-commerce Store", badge: "Review", bc: "#f59e0b", bg: "rgba(245,158,11,0.1)", time: "1d ago" },
                    ].map((p, i, a) => (
                      <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < a.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.bc }} />
                          <span style={{ fontSize: 11.5, color: "#fafafa" }}>{p.name}</span>
                          <span style={{ fontSize: 9.5, color: p.bc, background: p.bg, padding: "1px 5px", borderRadius: 3 }}>{p.badge}</span>
                        </div>
                        <span style={{ fontSize: 10, color: "#52525b" }}>{p.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fafafa", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 16, background: "rgba(59,130,246,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#3b82f6"><path d="M4 0l.9 2.7L8 4 5.1 5.3 4 8 3.1 5.3 0 4l3.1-1.3z" /></svg>
                    </div>
                    AI Assistant
                  </div>
                  <div style={{ background: "#18181b", borderRadius: 6, padding: 10, fontSize: 11, color: "#a1a1aa", lineHeight: 1.6 }}>Hello! I can generate ideas, review your projects, or set up integrations. What would you like to build?</div>
                  <div style={{ background: "rgba(59,130,246,0.1)", borderRadius: 6, padding: 8, fontSize: 11, color: "#fafafa", lineHeight: 1.5, alignSelf: "flex-end" }}>Generate a SaaS idea for productivity</div>
                  <div style={{ background: "#18181b", borderRadius: 5, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,0.07)", marginTop: "auto" }}>
                    <span style={{ fontSize: 11, color: "#52525b", flex: 1 }}>Ask anything...</span>
                    <div style={{ width: 18, height: 18, background: "#3b82f6", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5"><path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" /></svg></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Everything you need</div>
          <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 14 }}>Built for the full launch journey</h2>
          <p style={{ fontSize: 16, color: "#a1a1aa", maxWidth: 440, margin: "0 auto" }}>From first idea to thousandth customer.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#09090b", padding: 30 }}>
              <div style={{ width: 34, height: 34, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: "#71717a", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATIONS BAR */}
      <section id="integrations" style={{ padding: "56px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ textAlign: "center", fontSize: 12, fontWeight: 500, color: "#3f3f46", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 36 }}>Connects with your entire stack</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap", opacity: 0.5 }}>
          {[
            {
              label: "GitHub",
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>,
            },
            { label: "Vercel", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19.5h20L12 2z" /></svg> },
            { label: "Stripe", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#635bff" /><path d="M10.5 9.5c0-.8.7-1.5 2.5-1.5 2.3 0 3.5.9 3.5.9v3s-1.2-1.1-3.5-1.1c-1.2 0-2.5.5-2.5 1.7 0 1.1 1.3 1.5 2.8 1.8 2.5.5 4.2 1.3 4.2 3.5 0 2.4-2 3.7-4.5 3.7-2.7 0-4.5-1.2-4.5-1.2V17s1.8 1.2 4 1.2c1.4 0 2-.5 2-1.2 0-1-1.2-1.4-2.8-1.7-2.5-.5-4.2-1.3-4.2-3.6 0-2 1.5-3.2 3-3.2z" fill="white" /></svg> },
            { label: "Supabase", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.5 2L3 14.5h8.5L10 22 21 9.5h-8.5L13.5 2z" fill="#3ecf8e" /></svg> },
            {
              label: "Google",
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>,
            },
            {
              label: "OpenAI",
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073z" /></svg>,
            },
          ].map((brand) => (
            <div key={brand.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "#a1a1aa" }}>
              {brand.icon}
              {brand.label}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 14 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: 16, color: "#a1a1aa" }}>Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
            {PRICING.map((p) => {
              const isPopular = p.badge === "Most popular";
              return (
                <div
                  key={p.tier}
                  style={{
                    background: isPopular ? "#0b1220" : "#09090b",
                    padding: 28,
                    position: "relative",
                    ...(isPopular ? { borderLeft: "1px solid rgba(59,130,246,0.25)", borderRight: "1px solid rgba(59,130,246,0.25)" } : {}),
                  }}
                >
                  {isPopular && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 10%,#3b82f6 50%,transparent 90%)" }} />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#a1a1aa" }}>{p.tier}</span>
                    {p.badge && (
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: "#3b82f6", background: "rgba(59,130,246,0.12)", padding: "2px 7px", borderRadius: 100, letterSpacing: "0.04em" }}>
                        {p.badge.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>{p.price}</span>
                    <span style={{ fontSize: 14, color: "#52525b" }}>/month</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#52525b", marginBottom: 22, lineHeight: 1.5 }}>{p.desc}</p>
                  <Link
                    href="/signup"
                    style={{
                      display: "block", width: "100%", textAlign: "center",
                      fontSize: 13.5, fontWeight: 500, padding: 9, borderRadius: 6, marginBottom: 24,
                      textDecoration: "none",
                      ...(p.ctaStyle === "blue"
                        ? { background: "#3b82f6", color: "white" }
                        : { background: "#18181b", color: "#fafafa", border: "1px solid rgba(255,255,255,0.1)" }),
                    }}
                  >
                    {p.cta}
                  </Link>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#a1a1aa" }}>
                        <CheckIcon />{f}
                      </div>
                    ))}
                    {p.locked.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#3f3f46" }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#3f3f46" strokeWidth="1.5"><path d="M4 6V4.5a2.5 2.5 0 015 0V6M2.5 6h8a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-4a.5.5 0 01.5-.5z" /></svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 12 }}>Founders love LaunchForge</h2>
            <p style={{ fontSize: 16, color: "#a1a1aa" }}>Join thousands of teams building the next generation of startups.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="#f59e0b"><path d="M6.5 1l1.4 4.2H12l-3.5 2.5L9.8 12 6.5 9.5 3.2 12l1.3-4.3L1 5.2h4.1z" /></svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.7 }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "white", flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fafafa" }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: "#52525b" }}>{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 18, lineHeight: 1.08 }}>Ready to launch your next big thing?</h2>
        <p style={{ fontSize: 17, color: "#a1a1aa", marginBottom: 36, lineHeight: 1.6 }}>Join 2,400+ founders building and shipping with LaunchForge.</p>
        <Link href="/signup" style={{ background: "#3b82f6", color: "white", fontSize: 15, fontWeight: 500, padding: "12px 28px", borderRadius: 7, textDecoration: "none", display: "inline-block" }}>
          Start for free — no card required
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 40px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                <LogoBolt size={18} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>LaunchForge</span>
              </div>
              <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.65, maxWidth: 220 }}>The AI operating system for founders. Build, launch, and scale — all in one place.</p>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#71717a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Product</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {["Features", "Pricing", "Changelog", "Roadmap"].map((l) => (
                  <a key={l} href="#" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#71717a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Developers</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {["Docs", "API Reference", "Integrations", "Status"].map((l) => (
                  <a key={l} href="#" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#71717a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Legal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <Link href="/legal/privacy" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/legal/terms" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>Terms of Service</Link>
                <Link href="/legal/acceptable-use" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>Acceptable Use</Link>
                <Link href="/legal/cookies" style={{ fontSize: 13, color: "#52525b", textDecoration: "none" }}>Cookies</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#3f3f46" }}>© 2026 LaunchForge, Inc. All rights reserved.</span>
            <span style={{ fontSize: 12, color: "#3f3f46" }}>Built for ambitious builders.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
