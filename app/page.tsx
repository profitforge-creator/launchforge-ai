import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Opportunity Analysis",
    description:
      "Demand scoring, competition mapping, and difficulty ratings based on your specific skills and market conditions.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Competitor Research",
    description:
      "See who you're up against, how they price, what their customers complain about, and where the gaps are.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: "Product Concept",
    description:
      "A named product with a defined audience, feature set, pricing model, and realistic launch timeline.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    title: "Marketing Plan",
    description:
      "TikTok hooks, content ideas, a 90-day launch strategy, and a week-by-week content calendar.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    title: "Actionable Next Steps",
    description:
      "Ranked recommendations with context. What to validate first, what to build, and what to skip entirely.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Generation History",
    description:
      "Every business opportunity you've generated is saved. Compare niches, revisit ideas, track your thinking.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Describe your background",
    description:
      "Tell us your interests, skills, available time, and income target. The more specific, the better the output.",
  },
  {
    number: "02",
    title: "Get your business brief",
    description:
      "In seconds, receive a scored opportunity with competitor research, a product concept, and a full marketing plan.",
  },
  {
    number: "03",
    title: "Execute with confidence",
    description:
      "Use the recommendations and next-step checklist to validate your idea and ship your first version.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "For exploring what's possible.",
    features: ["3 business generations/month", "Opportunity scores", "Competitor overview", "Basic recommendations"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For founders building in earnest.",
    features: [
      "50 generations/month",
      "Full competitor research",
      "Complete marketing plans",
      "Content calendars",
      "Generation history",
      "Priority support",
    ],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams validating multiple bets.",
    features: [
      "Unlimited generations",
      "Up to 5 team members",
      "Shared generation history",
      "Export to PDF",
      "API access (coming soon)",
      "Dedicated support",
    ],
    cta: "Start Team",
    highlight: false,
  },
];

const faqs = [
  {
    q: "How is this different from asking ChatGPT?",
    a: "ChatGPT gives you a generic answer. LaunchForge gives you a structured business brief with real competitor data, scored opportunity metrics, a named product concept, and a step-by-step marketing plan — all formatted as a professional report you can act on.",
  },
  {
    q: "Is the data real or made up?",
    a: "Version 1 uses realistic, research-backed placeholder data modeled on real market patterns. We're building live data integrations with search, review, and revenue estimation APIs for a future release.",
  },
  {
    q: "What kind of businesses does it generate?",
    a: "Digital products, SaaS tools, productized services, content businesses, and agency models. It works best when you have a specific skill set — it finds the intersection of what you can do and what the market will pay for.",
  },
  {
    q: "Can I use this if I have no business experience?",
    a: "Yes. The output is written clearly without jargon. The next-steps section is designed to give you a specific starting point, not a vague direction.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. You get 3 generations per month on the free plan, which is enough to explore 3 different niche ideas fully.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 13% 8%)" }}>
      <SiteNav />

      {/* Hero */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="accent" className="mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(213_94%_62%)] inline-block" />
            Version 1.0 — Now Available
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6" style={{ color: "hsl(220 9% 95%)" }}>
            Turn Your Skills Into
            <br />
            a Business in Minutes
          </h1>
          <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: "hsl(220 9% 55%)" }}>
            Get a researched business idea, competitor analysis, product concept, and marketing strategy instantly.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Generate Business</Button>
            </Link>
            <Link href="/dashboard/results/demo">
              <Button variant="outline" size="lg">View Demo</Button>
            </Link>
          </div>
          <p className="mt-5 text-xs" style={{ color: "hsl(220 9% 40%)" }}>
            No credit card required · 3 free generations/month
          </p>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 18%)", backgroundColor: "hsl(220 13% 10%)" }}>
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: "1px solid hsl(220 13% 15%)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(220 13% 22%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(220 13% 22%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(220 13% 22%)" }} />
              <div className="mx-auto text-xs font-mono" style={{ color: "hsl(220 9% 35%)" }}>
                launchforge.ai/dashboard/results
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs mb-1" style={{ color: "hsl(220 9% 45%)" }}>Generated opportunity</p>
                  <h2 className="text-lg font-semibold" style={{ color: "hsl(220 9% 93%)" }}>Developer Productivity Tools</h2>
                </div>
                <Badge variant="success">Score 84</Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Demand", score: 91, color: "hsl(151 60% 48%)" },
                  { label: "Competition", score: 62, color: "hsl(38 90% 55%)" },
                  { label: "Difficulty", score: 45, color: "hsl(151 60% 48%)" },
                  { label: "Overall", score: 84, color: "hsl(151 60% 48%)" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-3 text-center" style={{ border: "1px solid hsl(220 13% 18%)", backgroundColor: "hsl(220 13% 13%)" }}>
                    <div className="text-2xl font-bold tabular-nums" style={{ color: m.color }}>{m.score}</div>
                    <div className="text-xs mt-0.5" style={{ color: "hsl(220 9% 45%)" }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Raycast · $8/mo", "Linear · $8/mo", "Pieces · Free+$12"].map((c) => (
                  <div key={c} className="rounded px-3 py-2" style={{ border: "1px solid hsl(220 13% 18%)", backgroundColor: "hsl(220 13% 12%)" }}>
                    <p className="text-xs" style={{ color: "hsl(220 9% 55%)" }}>Competitor</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(220 9% 80%)" }}>{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(213 94% 62%)" }}>Features</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>
              Everything to go from idea to execution
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg p-5"
                style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center mb-4" style={{ border: "1px solid hsl(220 13% 20%)", backgroundColor: "hsl(220 13% 14%)", color: "hsl(213 94% 65%)" }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: "hsl(220 9% 88%)" }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 50%)" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(213 94% 62%)" }}>Process</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>How it works</h2>
          </div>
          <div style={{ border: "1px solid hsl(220 13% 15%)", borderRadius: "10px", overflow: "hidden" }}>
            {steps.map((s, i) => (
              <div
                key={s.number}
                className="flex gap-6 p-6"
                style={{ borderBottom: i < steps.length - 1 ? "1px solid hsl(220 13% 14%)" : "none" }}
              >
                <span className="text-xs font-mono font-semibold pt-0.5 shrink-0 w-6" style={{ color: "hsl(220 9% 35%)" }}>
                  {s.number}
                </span>
                <div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "hsl(220 9% 88%)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 50%)" }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(213 94% 62%)" }}>Pricing</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>Simple, predictable pricing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className="rounded-xl p-6 flex flex-col"
                style={p.highlight ? {
                  border: "1px solid hsl(213 94% 62% / 0.4)",
                  backgroundColor: "hsl(213 94% 62% / 0.04)",
                } : {
                  border: "1px solid hsl(220 13% 16%)",
                  backgroundColor: "hsl(220 13% 10%)",
                }}
              >
                {p.highlight && (
                  <Badge variant="accent" className="w-fit mb-4">Most popular</Badge>
                )}
                <div className="mb-4">
                  <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>{p.name}</p>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-3xl font-bold" style={{ color: "hsl(220 9% 93%)" }}>{p.price}</span>
                    {p.period && <span className="text-sm" style={{ color: "hsl(220 9% 50%)" }}>{p.period}</span>}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "hsl(220 9% 45%)" }}>{p.description}</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs" style={{ color: "hsl(220 9% 60%)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant={p.highlight ? "primary" : "outline"} className="w-full" size="md">
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "hsl(213 94% 62%)" }}>FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>Common questions</h2>
          </div>
          <div style={{ borderTop: "1px solid hsl(220 13% 14%)" }}>
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5" style={{ borderBottom: "1px solid hsl(220 13% 14%)" }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "hsl(220 9% 85%)" }}>{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 50%)" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "hsl(220 9% 93%)" }}>
            Ready to find your opportunity?
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "hsl(220 9% 50%)" }}>
            Join founders using LaunchForge to research, validate, and launch faster.
          </p>
          <Link href="/signup">
            <Button size="lg">Generate your first business</Button>
          </Link>
          <p className="mt-4 text-xs" style={{ color: "hsl(220 9% 35%)" }}>Free plan · No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid hsl(220 13% 13%)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: "hsl(213 94% 62%)" }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 13% 8%)" />
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: "hsl(220 9% 50%)" }}>LaunchForge AI</span>
          </div>
          <p className="text-xs" style={{ color: "hsl(220 9% 35%)" }}>© 2026 LaunchForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
