"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ── Intersection observer hook ─────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const S = { fill: "none" as const, viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.6 };

function IconSearch() {
  return <svg width="18" height="18" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" /></svg>;
}
function IconBuilding() {
  return <svg width="18" height="18" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
}
function IconGlobe() {
  return <svg width="18" height="18" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
}
function IconBox() {
  return <svg width="18" height="18" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
}
function IconSpeaker() {
  return <svg width="18" height="18" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>;
}
function IconCloud() {
  return <svg width="18" height="18" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095H6.75z" /></svg>;
}
function IconPlay() {
  return <svg width="13" height="13" {...S}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>;
}
function IconCheckSm() {
  return <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
}
function IconArrow() {
  return <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
}
function IconChevronDown() {
  return <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: "hsl(213 94% 58%)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 transition-all duration-300"
      style={{
        borderBottom: scrolled ? "1px solid hsl(220 13% 13%)" : "1px solid transparent",
        backgroundColor: scrolled ? "hsl(220 14% 7% / 0.96)" : "hsl(220 14% 7% / 0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Logo />
      <div className="flex items-center gap-5">
        <a href="#features"     className="text-xs font-medium hidden sm:block" style={{ color: "hsl(220 9% 44%)" }}>Features</a>
        <a href="#how-it-works" className="text-xs font-medium hidden sm:block" style={{ color: "hsl(220 9% 44%)" }}>How it works</a>
        <a href="#pricing"      className="text-xs font-medium hidden sm:block" style={{ color: "hsl(220 9% 44%)" }}>Pricing</a>
        <Link href="/dashboard" className="text-xs font-medium" style={{ color: "hsl(220 9% 48%)" }}>
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="h-8 px-4 rounded-lg text-xs font-medium transition-all"
          style={{ border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 55%)", backgroundColor: "transparent" }}
        >
          Start Building
        </Link>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-36 pb-28 px-6 overflow-hidden">
      {/* Background: grid + glow */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "linear-gradient(hsl(220 13% 14% / 0.5) 1px, transparent 1px)",
              "linear-gradient(90deg, hsl(220 13% 14% / 0.5) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 0%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 0%, transparent 80%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: -160,
            left: "50%",
            transform: "translateX(-50%)",
            width: 1100,
            height: 700,
            background: "radial-gradient(ellipse at center top, hsl(213 94% 62% / 0.14) 0%, transparent 62%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 80,
            left: "30%",
            width: 400,
            height: 300,
            background: "radial-gradient(ellipse, hsl(234 80% 62% / 0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            border: "1px solid hsl(213 94% 62% / 0.22)",
            backgroundColor: "hsl(213 94% 62% / 0.07)",
            color: "hsl(213 94% 74%)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)", boxShadow: "0 0 6px hsl(151 60% 48% / 0.6)" }} />
          3-Day Full Access Trial — No card required
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          style={{ color: "hsl(220 9% 96%)", lineHeight: 1.06, letterSpacing: "-0.03em" }}
        >
          Build a Business.
          <br />
          <span style={{ color: "hsl(220 9% 44%)" }}>Not Another AI Tool.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg mb-10 max-w-xl mx-auto"
          style={{ color: "hsl(220 9% 48%)", lineHeight: 1.72 }}
        >
          Describe an idea. LaunchForge researches the market, builds the product,
          creates the website, prepares the launch, and helps you deploy it.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
          <Link
            href="/dashboard"
            className="h-11 px-7 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "hsl(220 9% 96%)", color: "hsl(220 14% 7%)" }}
          >
            Start Building
          </Link>
          <a
            href="#demo"
            className="h-11 px-6 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
            style={{ border: "1px solid hsl(220 13% 19%)", color: "hsl(220 9% 56%)" }}
          >
            <IconPlay />
            Watch Demo
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[
            ["2,400+", "founders"],
            ["12k+", "businesses built"],
            ["4.9 / 5", "average rating"],
          ].map(([num, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tabular-nums" style={{ color: "hsl(220 9% 62%)" }}>
                {num}
              </span>
              <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature grid ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <IconSearch />,   title: "Market Research",   desc: "Analyze competition, demand, opportunities, and trends across any niche — automatically." },
  { icon: <IconBuilding />, title: "Business Creation",  desc: "Generate complete business models with pricing, deliverables, positioning, and strategy." },
  { icon: <IconGlobe />,    title: "Website Generation", desc: "Create production-ready landing pages and sales pages tailored to your business type." },
  { icon: <IconBox />,      title: "Product Creation",   desc: "Courses, templates, ebooks, SaaS, agencies, memberships — generation adapts automatically." },
  { icon: <IconSpeaker />,  title: "Marketing System",   desc: "Content plans, funnels, launch strategies, campaigns, and social calendars out of the box." },
  { icon: <IconCloud />,    title: "Deployment",         desc: "Deploy websites and businesses to Vercel, Webflow, or any connected platform in one click." },
];

function FeatureCard({ feature }: { feature: typeof FEATURES[number] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-5 cursor-default"
      style={{
        backgroundColor: hovered ? "hsl(220 13% 11%)" : "hsl(220 13% 9.5%)",
        border: hovered ? "1px solid hsl(220 13% 22%)" : "1px solid hsl(220 13% 14%)",
        transform: hovered ? "translateY(-2px)" : "translateY(0px)",
        transition: "all 0.18s ease",
        boxShadow: hovered ? "0 8px 24px hsl(220 14% 5% / 0.6)" : "none",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
        style={{
          backgroundColor: hovered ? "hsl(213 94% 62% / 0.12)" : "hsl(220 13% 14%)",
          color: hovered ? "hsl(213 94% 68%)" : "hsl(220 9% 48%)",
          transition: "all 0.18s ease",
        }}
      >
        {feature.icon}
      </div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "hsl(220 9% 86%)" }}>
        {feature.title}
      </h3>
      <p className="text-xs" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
        {feature.desc}
      </p>
    </div>
  );
}

function AnimatedFeatureCard({ feature, delay }: { feature: typeof FEATURES[number]; delay: number }) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      <FeatureCard feature={feature} />
    </div>
  );
}

function FeaturesSection() {
  const { ref, visible } = useInView();
  return (
    <section id="features" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-14 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Platform
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            Everything you need to launch
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            LaunchForge handles the entire business-building process — from idea validation to live deployment.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <AnimatedFeatureCard key={f.title} feature={f} delay={i * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: "GitHub",       abbr: "GH", bg: "hsl(220 13% 17%)",   fg: "hsl(220 9% 70%)" },
  { name: "Vercel",       abbr: "▲",  bg: "hsl(220 9% 18%)",    fg: "hsl(220 9% 88%)" },
  { name: "Stripe",       abbr: "S",  bg: "hsl(234 55% 20%)",   fg: "hsl(234 80% 76%)" },
  { name: "Supabase",     abbr: "SB", bg: "hsl(152 38% 13%)",   fg: "hsl(152 55% 52%)" },
  { name: "Webflow",      abbr: "W",  bg: "hsl(210 55% 15%)",   fg: "hsl(210 75% 62%)" },
  { name: "Shopify",      abbr: "Sf", bg: "hsl(132 38% 13%)",   fg: "hsl(132 50% 50%)" },
  { name: "Gmail",        abbr: "G",  bg: "hsl(4 45% 15%)",     fg: "hsl(4 75% 60%)" },
  { name: "Google Docs",  abbr: "GD", bg: "hsl(210 50% 15%)",   fg: "hsl(210 70% 60%)" },
  { name: "Notion",       abbr: "N",  bg: "hsl(220 13% 15%)",   fg: "hsl(220 9% 62%)" },
  { name: "LinkedIn",     abbr: "in", bg: "hsl(200 50% 13%)",   fg: "hsl(200 68% 55%)" },
  { name: "X",            abbr: "X",  bg: "hsl(220 13% 16%)",   fg: "hsl(220 9% 75%)" },
  { name: "TikTok",       abbr: "TT", bg: "hsl(340 45% 13%)",   fg: "hsl(340 65% 62%)" },
  { name: "YouTube",      abbr: "YT", bg: "hsl(0 50% 13%)",     fg: "hsl(0 70% 58%)" },
  { name: "Discord",      abbr: "D",  bg: "hsl(234 42% 16%)",   fg: "hsl(234 65% 65%)" },
];

function IntegrationBadge({ item }: { item: typeof INTEGRATIONS[number] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-default"
      style={{
        backgroundColor: hovered ? "hsl(220 13% 12%)" : "hsl(220 13% 10%)",
        border: hovered ? "1px solid hsl(220 13% 20%)" : "1px solid hsl(220 13% 14%)",
        transform: hovered ? "translateY(-1px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.15s ease",
      }}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: item.bg, color: item.fg }}
      >
        {item.abbr}
      </div>
      <span className="text-xs font-medium whitespace-nowrap" style={{ color: "hsl(220 9% 52%)" }}>
        {item.name}
      </span>
    </div>
  );
}

function IntegrationsSection() {
  const { ref, visible } = useInView();
  return (
    <section className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-12 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Integrations
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            Works with your stack
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            Connect the tools you already use. LaunchForge integrates with platforms for deployment, payments, marketing, and distribution.
          </p>
        </div>
        <div
          className="flex flex-wrap justify-center gap-2.5"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.2s",
          }}
        >
          {INTEGRATIONS.map((item) => (
            <IntegrationBadge key={item.name} item={item} />
          ))}
        </div>
        <p className="text-center text-xs mt-8" style={{ color: "hsl(220 9% 26%)" }}>
          More integrations launching continuously
        </p>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: "01",
    title: "Describe your idea",
    body: "Type anything — an interest, a skill, or a market you want to enter. No forms, no templates. Just describe what you want to build.",
    tag: "Natural Language",
  },
  {
    num: "02",
    title: "LaunchForge researches the market",
    body: "Six specialized AI agents analyze competitors, demand, gaps, pricing, and opportunity — in seconds, not days.",
    tag: "AI Research",
  },
  {
    num: "03",
    title: "Your business is created",
    body: "The product is designed, the website is generated, and the full marketing launch plan is ready. Everything in one workspace.",
    tag: "AI Generation",
  },
  {
    num: "04",
    title: "Launch and deploy",
    body: "Export your website, connect your domain, push to GitHub, and deploy to Vercel. Your business is live.",
    tag: "Deployment",
  },
];

function HowItWorksStep({ step, index }: { step: typeof HOW_STEPS[number]; index: number }) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="flex gap-8"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-16px)",
        transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms`,
      }}
    >
      {/* Left: number + line */}
      <div className="flex flex-col items-center gap-0 shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0"
          style={{
            backgroundColor: "hsl(220 13% 12%)",
            border: "1px solid hsl(220 13% 18%)",
            color: "hsl(220 9% 46%)",
          }}
        >
          {step.num}
        </div>
        {index < HOW_STEPS.length - 1 && (
          <div
            className="w-px flex-1 mt-2 mb-0"
            style={{ backgroundColor: "hsl(220 13% 15%)", minHeight: 32 }}
          />
        )}
      </div>

      {/* Right: content */}
      <div className={`flex-1 ${index < HOW_STEPS.length - 1 ? "pb-10" : "pb-0"}`}>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold" style={{ color: "hsl(220 9% 86%)" }}>
            {step.title}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: "hsl(213 94% 62% / 0.08)", color: "hsl(213 94% 62%)", border: "1px solid hsl(213 94% 62% / 0.15)" }}
          >
            {step.tag}
          </span>
        </div>
        <p className="text-sm" style={{ color: "hsl(220 9% 42%)", lineHeight: 1.66 }}>
          {step.body}
        </p>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const { ref, visible } = useInView();
  return (
    <section id="how-it-works" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          className="mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Process
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            From idea to launch
          </h2>
          <p className="text-sm max-w-md" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            Four steps. No manual research. No blank-page problem. No weeks of work.
          </p>
        </div>
        <div>
          {HOW_STEPS.map((step, i) => (
            <HowItWorksStep key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Live demo (animated build) ─────────────────────────────────────────────────

const BUILD_STEPS = [
  { label: "Researching market demand",   delay: 800  },
  { label: "Analyzing competitors",       delay: 1800 },
  { label: "Identifying opportunities",   delay: 2800 },
  { label: "Designing product",           delay: 3800 },
  { label: "Building website",            delay: 4800 },
  { label: "Generating launch strategy",  delay: 5800 },
];

const RESULT_AREAS = [
  { label: "Research",  note: "Market gap identified" },
  { label: "Product",   note: "FocusFlow Toolkit" },
  { label: "Website",   note: "4 pages generated" },
  { label: "Marketing", note: "Launch plan ready" },
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
          app.launchforge.ai/build
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* User prompt */}
        <div className="flex justify-end">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-xs"
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

function DemoSection() {
  const { ref, visible } = useInView();
  return (
    <section id="demo" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Live Example
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            Watch a build happen in real time
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            This is exactly what runs when you submit an idea. Scroll down to watch it start.
          </p>
        </div>
        <AnimatedDemo />
      </div>
    </section>
  );
}

// ── Example businesses ─────────────────────────────────────────────────────────

const EXAMPLE_BUSINESSES = [
  {
    name: "The Remote Toolkit",
    type: "Course Business",
    revenueModel: "One-time + membership upsell",
    launchTime: "48 hours",
    score: 86,
    status: "Live",
    color: "hsl(151 60% 48%)",
  },
  {
    name: "ContentCraft Agency",
    type: "Agency",
    revenueModel: "Monthly retainer",
    launchTime: "1 week",
    score: 82,
    status: "Live",
    color: "hsl(151 60% 48%)",
  },
  {
    name: "TaskStack",
    type: "SaaS Product",
    revenueModel: "Monthly subscription",
    launchTime: "3–4 weeks",
    score: 78,
    status: "In Development",
    color: "hsl(38 90% 55%)",
  },
  {
    name: "DesignVault",
    type: "Template Store",
    revenueModel: "Per-template + bundle",
    launchTime: "2–3 days",
    score: 84,
    status: "Launch Ready",
    color: "hsl(213 94% 62%)",
  },
];

function BusinessCard({ biz, delay }: { biz: typeof EXAMPLE_BUSINESSES[number]; delay: number }) {
  const { ref, visible } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-5 flex flex-col gap-4 cursor-default"
      style={{
        backgroundColor: hovered ? "hsl(220 13% 11%)" : "hsl(220 13% 9.5%)",
        border: hovered ? "1px solid hsl(220 13% 20%)" : "1px solid hsl(220 13% 14%)",
        transform: visible ? (hovered ? "translateY(-2px)" : "translateY(0)") : "translateY(18px)",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease`,
        boxShadow: hovered ? "0 8px 24px hsl(220 14% 5% / 0.5)" : "none",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded mb-2"
            style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 44%)", border: "1px solid hsl(220 13% 18%)" }}
          >
            {biz.type}
          </span>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>{biz.name}</h3>
        </div>
        <span className="text-xl font-bold tabular-nums shrink-0" style={{ color: "hsl(213 94% 62%)" }}>
          {biz.score}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "hsl(220 9% 34%)" }}>Revenue model</span>
          <span className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>{biz.revenueModel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "hsl(220 9% 34%)" }}>Launch time</span>
          <span className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>{biz.launchTime}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: biz.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: biz.color }} />
          {biz.status}
        </span>
        <Link
          href="/dashboard"
          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
          style={{ backgroundColor: "hsl(220 13% 14%)", border: "1px solid hsl(220 13% 19%)", color: "hsl(220 9% 50%)" }}
        >
          Build this →
        </Link>
      </div>
    </div>
  );
}

function ExampleBusinessesSection() {
  const { ref, visible } = useInView();
  return (
    <section id="examples" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Built with LaunchForge
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            Real businesses, real output
          </h2>
          <p className="text-sm max-w-md" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            These are examples of the kind of businesses LaunchForge generates — complete with research, product, website, and marketing plan.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXAMPLE_BUSINESSES.map((biz, i) => (
            <BusinessCard key={biz.name} biz={biz} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Platform preview ──────────────────────────────────────────────────────────

const PREVIEW_TABS = ["Workspace", "Analytics", "Deployment"] as const;
type PreviewTab = typeof PREVIEW_TABS[number];

function WorkspaceMockup() {
  return (
    <div className="h-full p-4 space-y-3">
      {/* Project header */}
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid hsl(220 13% 14%)" }}>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 82%)" }}>FocusFlow Toolkit</p>
          <p className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>Digital product — Score: 86</p>
        </div>
        <div className="flex gap-1">
          {["Overview","Research","Product","Website","Marketing","Launch"].map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "hsl(220 13% 14%)", color: "hsl(220 9% 36%)" }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Mock product data */}
      <div className="grid grid-cols-3 gap-2">
        {[["Market Demand","High","hsl(151 60% 48%)"],["Competition","Low–Medium","hsl(213 94% 62%)"],["Revenue Potential","$50–$200K/yr","hsl(38 90% 55%)"]].map(([label, val, color]) => (
          <div key={label} className="rounded-lg p-3" style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}>
            <p className="text-xs mb-1" style={{ color: "hsl(220 9% 34%)" }}>{label}</p>
            <p className="text-xs font-semibold" style={{ color }}>{val}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-3" style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 60%)" }}>Deliverables</p>
        {["12-module video course","Notion workspace template","Weekly accountability system","Resource library (42 files)"].map((d) => (
          <div key={d} className="flex items-center gap-2 py-0.5">
            <span style={{ color: "hsl(151 60% 48%)" }}><IconCheckSm /></span>
            <span className="text-xs" style={{ color: "hsl(220 9% 44%)" }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [42, 68, 55, 80, 63, 88, 72];
  return (
    <div className="h-full p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[["3","Active Projects"],["2","Live Websites"],["84","Avg Score"]].map(([val, label]) => (
          <div key={label} className="rounded-lg p-3" style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}>
            <p className="text-2xl font-bold tabular-nums" style={{ color: "hsl(220 9% 88%)" }}>{val}</p>
            <p className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-3" style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}>
        <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 50%)" }}>Project Scores</p>
        <div className="flex items-end gap-1.5 h-16">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: "hsl(213 94% 62% / 0.5)", maxWidth: 24 }} />
          ))}
        </div>
      </div>
      <div className="rounded-lg p-3" style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 50%)" }}>Connected Services</p>
        {[["Stripe","Not connected"],["Vercel","Not connected"],["GitHub","Not connected"]].map(([s,st]) => (
          <div key={s} className="flex items-center justify-between py-0.5">
            <span className="text-xs" style={{ color: "hsl(220 9% 44%)" }}>{s}</span>
            <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>{st}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeploymentMockup() {
  const items = [
    { name: "The Remote Toolkit", env: "production", status: "Live",     url: "focusflow.vercel.app",  color: "hsl(151 60% 48%)" },
    { name: "ContentCraft Agency", env: "production", status: "Building", url: "—",                     color: "hsl(38 90% 55%)"  },
    { name: "DesignVault",         env: "preview",    status: "Ready",    url: "designvault.preview.app",color: "hsl(213 94% 62%)" },
  ];
  return (
    <div className="h-full p-4 space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "hsl(220 9% 72%)" }}>{item.name}</p>
            <p className="text-xs truncate" style={{ color: "hsl(220 9% 34%)" }}>{item.url}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium" style={{ color: item.color }}>{item.status}</p>
            <p className="text-xs capitalize" style={{ color: "hsl(220 9% 30%)" }}>{item.env}</p>
          </div>
        </div>
      ))}
      <div className="pt-2 text-center">
        <p className="text-xs" style={{ color: "hsl(220 9% 26%)" }}>
          Connect Vercel for automatic deployment sync
        </p>
      </div>
    </div>
  );
}

function PlatformPreviewSection() {
  const { ref, visible } = useInView();
  const [activeTab, setActiveTab] = useState<PreviewTab>("Workspace");

  return (
    <section className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-12 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Platform
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            Inside the platform
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            Every project gets a full workspace — research, product, website, marketing, deployment, and analytics in one place.
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid hsl(220 13% 16%)",
            backgroundColor: "hsl(220 13% 9%)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.25s",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: "hsl(220 13% 11%)", borderBottom: "1px solid hsl(220 13% 14%)" }}
          >
            <div className="flex gap-1.5">
              {["hsl(0 60% 42%)", "hsl(38 70% 44%)", "hsl(120 40% 36%)"].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-1">
              {PREVIEW_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                  style={{
                    backgroundColor: activeTab === tab ? "hsl(220 13% 16%)" : "transparent",
                    color: activeTab === tab ? "hsl(220 9% 78%)" : "hsl(220 9% 36%)",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ height: 280, overflow: "hidden" }}>
            {activeTab === "Workspace"  && <WorkspaceMockup />}
            {activeTab === "Analytics"  && <AnalyticsMockup />}
            {activeTab === "Deployment" && <DeploymentMockup />}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Jordan Kim",
    role: "Founder, Stackable",
    initials: "JK",
    quote: "After two failed startup attempts, I finally shipped. LaunchForge's research phase alone saved me a month of work. Went from idea to first sale in 4 days.",
    accent: "hsl(213 94% 62%)",
  },
  {
    name: "Sarah Mills",
    role: "Agency Owner",
    initials: "SM",
    quote: "I use LaunchForge to scope new service offerings before pitching clients. It cuts my research and proposal time in half — and the output is more thorough than what I'd produce manually.",
    accent: "hsl(151 60% 48%)",
  },
  {
    name: "Rami Farouk",
    role: "Independent Developer",
    initials: "RF",
    quote: "Generated the full product spec, landing page copy, and launch strategy for my template pack. Just had to write the code. Made back the subscription cost in week one.",
    accent: "hsl(234 70% 65%)",
  },
];

function TestimonialCard({ t, delay }: { t: typeof TESTIMONIALS[number]; delay: number }) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="rounded-xl p-6 flex flex-col gap-5"
      style={{
        backgroundColor: "hsl(220 13% 10%)",
        border: "1px solid hsl(220 13% 15%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <p className="text-sm flex-1" style={{ color: "hsl(220 9% 54%)", lineHeight: 1.7 }}>
        "{t.quote}"
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}30` }}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "hsl(220 9% 72%)" }}>{t.name}</p>
          <p className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const { ref, visible } = useInView();
  return (
    <section className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-12 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Founders
          </p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            Built by real people
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Deployments ───────────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { label: "Generate", desc: "AI builds your complete business",  color: "hsl(213 94% 62%)" },
  { label: "Edit",     desc: "Refine with AI advisor",            color: "hsl(234 70% 65%)" },
  { label: "Deploy",   desc: "Push to Vercel, GitHub, Webflow",   color: "hsl(151 60% 48%)" },
  { label: "Launch",   desc: "Your business is live",             color: "hsl(38 90% 55%)"  },
];

const DEPLOY_PLATFORMS = [
  { name: "Vercel",  abbr: "▲", bg: "hsl(220 9% 18%)",  fg: "hsl(220 9% 88%)" },
  { name: "GitHub",  abbr: "GH", bg: "hsl(220 13% 17%)", fg: "hsl(220 9% 70%)" },
  { name: "Webflow", abbr: "W",  bg: "hsl(210 55% 15%)", fg: "hsl(210 75% 62%)" },
];

const DEPLOY_STATUS = [
  { name: "Remote Toolkit",    status: "Deployed", color: "hsl(151 60% 48%)" },
  { name: "ContentCraft",      status: "Building", color: "hsl(38 90% 55%)"  },
  { name: "DesignVault",       status: "Ready",    color: "hsl(213 94% 62%)" },
];

function DeploymentSection() {
  const { ref, visible } = useInView();
  return (
    <section className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-14 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.12em" }}>
            Deployment
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 90%)", letterSpacing: "-0.025em" }}>
            From generation to live
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(220 9% 40%)", lineHeight: 1.66 }}>
            LaunchForge connects with your deployment stack. Generate, edit, deploy, and launch without leaving the platform.
          </p>
        </div>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.2s",
          }}
        >
          {/* Workflow steps */}
          <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl shrink-0"
                  style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)", minWidth: 120 }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: step.color, boxShadow: `0 0 8px ${step.color}60` }}
                  />
                  <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 82%)" }}>{step.label}</p>
                  <p className="text-xs text-center" style={{ color: "hsl(220 9% 36%)", lineHeight: 1.5 }}>{step.desc}</p>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="flex items-center px-1">
                    <div className="w-6 h-px" style={{ backgroundColor: "hsl(220 13% 18%)" }} />
                    <span style={{ color: "hsl(220 13% 22%)" }}><IconArrow /></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Platforms */}
            <div className="rounded-xl p-5" style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}>
              <p className="text-xs font-medium mb-4" style={{ color: "hsl(220 9% 42%)" }}>CONNECTED PLATFORMS</p>
              <div className="space-y-3">
                {DEPLOY_PLATFORMS.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: p.bg, color: p.fg }}
                      >
                        {p.abbr}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "hsl(220 9% 65%)" }}>{p.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "hsl(220 13% 15%)", color: "hsl(220 9% 32%)" }}>
                      Connect
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status examples */}
            <div className="rounded-xl p-5" style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}>
              <p className="text-xs font-medium mb-4" style={{ color: "hsl(220 9% 42%)" }}>DEPLOYMENT STATUS</p>
              <div className="space-y-3">
                {DEPLOY_STATUS.map((d) => (
                  <div key={d.name} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: "hsl(220 13% 12%)" }}>
                    <span className="text-sm font-medium" style={{ color: "hsl(220 9% 65%)" }}>{d.name}</span>
                    <span
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: d.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

const TRIAL_INCLUDES = [
  "Business generation",
  "Product design & files",
  "Website generation",
  "AI advisor",
  "ZIP export",
  "Deployment access",
];

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
    name: "Scale",
    price: "Custom",
    description: "For teams and agencies building at scale.",
    cta: "Contact us",
    highlight: false,
    features: [
      { label: "Everything in Pro",          included: true  },
      { label: "Custom integrations",        included: true  },
      { label: "Dedicated support",          included: true  },
      { label: "SLA guarantee",              included: true  },
      { label: "Custom deployment targets",  included: true  },
      { label: "Team accounts",              included: true  },
      { label: "Audit logs",                 included: true  },
      { label: "SSO / SAML",                 included: true  },
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
        border: tier.highlight ? "1px solid hsl(213 94% 62% / 0.3)" : "1px solid hsl(220 13% 15%)",
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
        className="w-full h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-all"
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
  const { ref, visible } = useInView();
  return (
    <section id="pricing" className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="mb-14 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.6s ease",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(220 9% 30%)", letterSpacing: "0.1em" }}>
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
          className="rounded-xl px-6 py-5 mb-8 flex items-center justify-between gap-4 flex-wrap"
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

        <div className="grid md:grid-cols-3 gap-5">
          {PRICING_TIERS.map((tier) => <PricingCard key={tier.name} tier={tier} />)}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "hsl(220 9% 28%)" }}>
          All prices in USD. Billed monthly. Annual billing available on Pro and Scale.
        </p>
      </div>
    </section>
  );
}

// ── Trial CTA ─────────────────────────────────────────────────────────────────

function TrialCTASection() {
  const { ref, visible } = useInView();
  return (
    <section className="py-28 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-2xl mx-auto">
        <div
          ref={ref}
          className="rounded-2xl px-10 py-14 text-center"
          style={{
            border: "1px solid hsl(220 13% 16%)",
            backgroundColor: "hsl(220 13% 9%)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.7s ease",
          }}
        >
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
            className="inline-flex h-11 px-8 rounded-xl text-sm font-semibold items-center transition-all hover:opacity-90"
            style={{ backgroundColor: "hsl(220 9% 96%)", color: "hsl(220 14% 7%)" }}
          >
            Start your trial
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-10 px-6" style={{ borderTop: "1px solid hsl(220 13% 12%)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Logo />
          <div className="flex items-center gap-6">
            <a href="#features"     className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>Features</a>
            <a href="#how-it-works" className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>How it works</a>
            <a href="#pricing"      className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>Pricing</a>
            <Link href="/dashboard/settings" className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>Settings</Link>
          </div>
          <p className="text-xs" style={{ color: "hsl(220 9% 24%)" }}>
            © 2026 LaunchForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 7%)" }}>
      <Nav />
      <Hero />
      <FeaturesSection />
      <IntegrationsSection />
      <HowItWorksSection />
      <DemoSection />
      <ExampleBusinessesSection />
      <PlatformPreviewSection />
      <TestimonialsSection />
      <DeploymentSection />
      <PricingSection />
      <TrialCTASection />
      <Footer />
    </div>
  );
}
