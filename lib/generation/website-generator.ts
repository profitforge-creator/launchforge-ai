/**
 * Website Generator
 *
 * Generates a complete, deployable Next.js 14 (App Router) website.
 * Copy comes from Gemini via WebsiteContent — this module handles TSX scaffolding only.
 *
 * Files generated:
 *   /website/app/page.tsx           — Homepage
 *   /website/app/pricing/page.tsx   — Pricing
 *   /website/app/about/page.tsx     — About
 *   /website/app/faq/page.tsx       — FAQ (interactive accordion)
 *   /website/app/layout.tsx         — Root layout + metadata
 *   /website/app/globals.css        — Base styles
 *   /website/package.json
 *   /website/next.config.ts
 *   /website/tailwind.config.ts
 *   /website/tsconfig.json
 *   /website/README.md
 */

import type { ProjectFile, FileLanguage } from "@/types";
import type { ProductAgentOutput, ResearchAgentOutput } from "@/lib/types/agents";
import type { WebsiteContent } from "@/lib/prompts/website-prompts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFile(path: string, content: string, language: FileLanguage): ProjectFile {
  const parts = path.split("/").filter(Boolean);
  const folder = parts[0];
  const name = parts[parts.length - 1];
  const subfolder = parts.length > 2 ? parts.slice(1, -1).join("/") : undefined;
  return { path, name, folder, subfolder, content, language, generatedAt: new Date().toISOString() };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"');
}

function escJson(s: string): string {
  return JSON.stringify(s).slice(1, -1); // JSON-encode without outer quotes
}

// ── Homepage ──────────────────────────────────────────────────────────────────

function generateHomepageTsx(p: ProductAgentOutput, c: WebsiteContent): ProjectFile {
  const { productName } = p;
  const { hero, problem, features, testimonials, cta } = c;

  const featuresCode = features.map((f) =>
    `  { icon: "${escJson(f.icon)}", title: "${escJson(f.title)}", description: "${escJson(f.description)}" }`,
  ).join(",\n");

  const testimonialsCode = testimonials.map((t) =>
    `  { quote: "${escJson(t.quote)}", author: "${escJson(t.author)}", role: "${escJson(t.role)}" }`,
  ).join(",\n");

  const content = `import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "${esc(productName)}",
  description: "${esc(hero.subheadline.slice(0, 155))}",
};

const FEATURES = [
${featuresCode}
];

const TESTIMONIALS = [
${testimonialsCode}
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <span className="text-sm font-bold tracking-tight">${esc(productName)}</span>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
        <Link href="/pricing" className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors">
          Get Started →
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          ${esc(hero.badge)}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          ${esc(hero.headline)}
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          ${esc(hero.subheadline)}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/pricing" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 font-semibold transition-colors text-center">
            ${esc(hero.ctaPrimary)}
          </Link>
          <Link href="/about" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/8 hover:bg-white/12 font-medium transition-colors text-center text-white/80">
            ${esc(hero.ctaSecondary)}
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/30">${esc(hero.socialProofLine)}</p>
      </section>

      {/* Problem */}
      <section className="py-16 px-6 border-y border-white/6 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">${esc(problem.headline)}</h2>
          <p className="text-white/55 leading-relaxed">${esc(problem.body)}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need. Nothing you don&apos;t.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-6 bg-white/[0.04] border border-white/8 hover:border-white/16 transition-colors">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-blue-400 uppercase tracking-widest mb-12">What customers say</p>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="rounded-2xl p-6 bg-white/[0.04] border border-white/8">
                <p className="text-sm text-white/70 leading-relaxed mb-4">&quot;{t.quote}&quot;</p>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">${esc(cta.headline)}</h2>
        <p className="text-white/55 mb-8 leading-relaxed">${esc(cta.body)}</p>
        <Link href="/pricing" className="inline-flex px-8 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 font-semibold transition-colors">
          ${esc(cta.buttonText)}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/35">
          <span className="font-semibold text-white/60">${esc(productName)}</span>
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/faq" className="hover:text-white/60 transition-colors">FAQ</Link>
          </div>
          <span>© {new Date().getFullYear()} ${esc(productName)}</span>
        </div>
      </footer>
    </main>
  );
}
`;
  return makeFile("/website/app/page.tsx", content, "typescript");
}

// ── Pricing page ──────────────────────────────────────────────────────────────

function generatePricingTsx(p: ProductAgentOutput, c: WebsiteContent): ProjectFile {
  const { productName, suggestedPrice } = p;
  const base = parseInt(suggestedPrice.replace(/[^0-9]/g, "")) || 47;
  const starter = base;
  const pro = base * 3;
  const { pricing } = c;

  const freeFeatsCode = c.pricing.freeFeatures.map((f) => `"${escJson(f)}"`).join(", ");
  const starterFeatsCode = c.pricing.starterFeatures.map((f) => `"${escJson(f)}"`).join(", ");
  const proFeatsCode = c.pricing.proFeatures.map((f) => `"${escJson(f)}"`).join(", ");

  const content = `import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | ${esc(productName)}",
  description: "${esc(pricing.tagline)}",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try ${esc(productName)} risk-free.",
    cta: "Get started free",
    ctaHref: "#",
    featured: false,
    features: [${freeFeatsCode}],
  },
  {
    name: "Starter",
    price: "$${starter}",
    period: "month",
    description: "Everything you need to launch.",
    cta: "Start Starter",
    ctaHref: "#",
    featured: true,
    features: [${starterFeatsCode}],
  },
  {
    name: "Pro",
    price: "$${pro}",
    period: "month",
    description: "Unlimited for power users.",
    cta: "Start Pro",
    ctaHref: "#",
    featured: false,
    features: [${proFeatsCode}],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-14">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <Link href="/" className="text-sm font-bold tracking-tight">${esc(productName)}</Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/pricing" className="text-white">Pricing</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
        <Link href="/pricing" className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors">
          Get Started →
        </Link>
      </nav>

      <section className="pt-20 pb-12 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple pricing</h1>
        <p className="text-white/55 text-lg">${esc(pricing.tagline)}</p>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={\`rounded-2xl p-6 border flex flex-col \${
                tier.featured
                  ? "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30"
                  : "bg-white/[0.04] border-white/10"
              }\`}
            >
              {tier.featured && (
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/15 rounded-full px-2.5 py-0.5 w-fit mb-4">
                  Most Popular
                </span>
              )}
              <p className="text-sm font-semibold text-white/60 mb-1">{tier.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period !== "forever" && <span className="text-white/40 text-sm mb-1.5">/{tier.period}</span>}
              </div>
              <p className="text-sm text-white/45 mb-6">{tier.description}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className={\`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors \${
                  tier.featured
                    ? "bg-blue-500 hover:bg-blue-400 text-white"
                    : "bg-white/8 hover:bg-white/14 text-white/80"
                }\`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-white/30 mt-8">
          All paid plans include a 30-day money-back guarantee · Cancel anytime
        </p>
      </section>

      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-white/35">
          <Link href="/" className="font-semibold text-white/60">${esc(productName)}</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
`;
  return makeFile("/website/app/pricing/page.tsx", content, "typescript");
}

// ── About page ────────────────────────────────────────────────────────────────

function generateAboutTsx(p: ProductAgentOutput, c: WebsiteContent): ProjectFile {
  const { productName } = p;
  const { about } = c;
  const bodyParagraphs = about.body.map((para) => `        <p className="text-white/65 leading-relaxed text-base mt-4">${esc(para)}</p>`).join("\n");

  const content = `import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | ${esc(productName)}",
  description: "${esc(about.mission)}",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-14">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <Link href="/" className="text-sm font-bold tracking-tight">${esc(productName)}</Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="text-white">About</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
        <Link href="/pricing" className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors">
          Get Started →
        </Link>
      </nav>

      <section className="pt-24 pb-16 px-6 max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">About</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">${esc(about.origin)}</h1>
        <p className="text-lg text-white/60 leading-relaxed">${esc(about.mission)}</p>
      </section>

      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/6">
        <div className="max-w-3xl mx-auto">
${bodyParagraphs}
        </div>
      </section>

      <section className="py-20 px-6 text-center border-t border-white/6">
        <h2 className="text-2xl font-bold mb-4">Ready to build your business?</h2>
        <p className="text-white/50 mb-8">Start free — no credit card, no forms.</p>
        <Link href="/pricing" className="inline-flex px-7 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 font-semibold transition-colors">
          Get Started Free →
        </Link>
      </section>

      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-white/35">
          <Link href="/" className="font-semibold text-white/60">${esc(productName)}</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
`;
  return makeFile("/website/app/about/page.tsx", content, "typescript");
}

// ── FAQ page ──────────────────────────────────────────────────────────────────

function generateFaqTsx(p: ProductAgentOutput, c: WebsiteContent): ProjectFile {
  const { productName } = p;
  const faqsCode = c.faq.map((f) =>
    `  { q: "${escJson(f.question)}", a: "${escJson(f.answer)}" }`,
  ).join(",\n");

  const content = `"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
${faqsCode}
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-white/90 transition-colors text-white/75"
      >
        <span className="font-medium">{q}</span>
        <svg
          width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          className="shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="text-sm text-white/55 leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-14">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <Link href="/" className="text-sm font-bold tracking-tight">${esc(productName)}</Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/faq" className="text-white">FAQ</Link>
        </div>
        <Link href="/pricing" className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors">
          Get Started →
        </Link>
      </nav>

      <section className="pt-24 pb-6 px-6 max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">FAQ</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Common questions</h1>
      </section>

      <section className="px-6 pb-24 max-w-3xl mx-auto">
        {FAQS.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
        <div className="mt-12 rounded-2xl p-6 bg-blue-500/10 border border-blue-500/20 text-center">
          <p className="font-semibold mb-2">Still have a question?</p>
          <a href="mailto:hello@${slugify(productName)}.com" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            hello@${slugify(productName)}.com →
          </a>
        </div>
      </section>

      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-white/35">
          <Link href="/" className="font-semibold text-white/60">${esc(productName)}</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
`;
  return makeFile("/website/app/faq/page.tsx", content, "typescript");
}

// ── Root layout ───────────────────────────────────────────────────────────────

function generateLayoutTsx(p: ProductAgentOutput, c: WebsiteContent): ProjectFile {
  const { productName } = p;
  const content = `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${esc(productName)}",
  description: "${esc(c.hero.subheadline.slice(0, 155))}",
  metadataBase: new URL("https://${slugify(productName)}.com"),
  openGraph: {
    title: "${esc(productName)}",
    description: "${esc(c.hero.headline)}",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
  return makeFile("/website/app/layout.tsx", content, "typescript");
}

// ── Boilerplate files ─────────────────────────────────────────────────────────

function generateGlobalsCss(): ProjectFile {
  return makeFile("/website/app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background-color: #0a0a0a;
    color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
`, "css");
}

function generatePackageJson(p: ProductAgentOutput): ProjectFile {
  return makeFile("/website/package.json", JSON.stringify({
    name: slugify(p.productName),
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start", lint: "next lint" },
    dependencies: { next: "14.2.5", react: "^18", "react-dom": "^18" },
    devDependencies: {
      "@types/node": "^20", "@types/react": "^18", "@types/react-dom": "^18",
      autoprefixer: "^10.0.1", postcss: "^8", tailwindcss: "^3.4.1", typescript: "^5",
    },
  }, null, 2), "json");
}

function generateNextConfig(): ProjectFile {
  return makeFile("/website/next.config.ts", `import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
`, "typescript");
}

function generateTailwindConfig(): ProjectFile {
  return makeFile("/website/tailwind.config.ts", `import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`, "typescript");
}

function generateTsConfig(): ProjectFile {
  return makeFile("/website/tsconfig.json", JSON.stringify({
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true,
      strict: true, noEmit: true, esModuleInterop: true, module: "esnext",
      moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true,
      jsx: "preserve", incremental: true, plugins: [{ name: "next" }], paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2), "json");
}

function generateReadme(p: ProductAgentOutput): ProjectFile {
  const { productName } = p;
  return makeFile("/website/README.md", `# ${productName} — Generated Website

Complete Next.js 14 website generated by LaunchForge AI.

## Get started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy to Vercel

Push this folder to GitHub, import in vercel.com, and deploy.
Next.js is auto-detected — no configuration required.

## Pages

| Route | File |
|-------|------|
| / | app/page.tsx |
| /pricing | app/pricing/page.tsx |
| /about | app/about/page.tsx |
| /faq | app/faq/page.tsx |

---
Generated by LaunchForge AI · ${new Date().toISOString().split("T")[0]}
`, "markdown");
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Assemble all website files.
 * @param content  AI-generated copy from Gemini (via lib/ai/orchestrator.ts)
 *                 Pass undefined to fall back to template copy (backward compat).
 */
export function generateWebsiteFiles(
  product: ProductAgentOutput,
  _research: ResearchAgentOutput,
  content?: WebsiteContent,
): ProjectFile[] {
  // If no AI content yet (legacy / testing path), use a minimal stub
  const c: WebsiteContent = content ?? buildFallbackContent(product);

  return [
    generateHomepageTsx(product, c),
    generatePricingTsx(product, c),
    generateAboutTsx(product, c),
    generateFaqTsx(product, c),
    generateLayoutTsx(product, c),
    generateGlobalsCss(),
    generatePackageJson(product),
    generateNextConfig(),
    generateTailwindConfig(),
    generateTsConfig(),
    generateReadme(product),
  ];
}

// ── Fallback content (used when Gemini content unavailable) ───────────────────

function buildFallbackContent(p: ProductAgentOutput): WebsiteContent {
  const { productName, tagline, description, targetAudience, deliverables, suggestedPrice } = p;
  return {
    hero: {
      badge: `Now available · ${suggestedPrice} to start`,
      headline: tagline,
      subheadline: description,
      ctaPrimary: "Get Started Free →",
      ctaSecondary: "Learn more",
      socialProofLine: "No credit card required · Instant access",
    },
    problem: {
      headline: "There's a better way.",
      body: `If you're ${targetAudience}, you already know the problem. ${productName} is the solution we built because we couldn't find it.`,
    },
    features: deliverables.slice(0, 4).map((d, i) => ({
      icon: ["📦", "⚡", "🎯", "📈"][i] ?? "✓",
      title: d,
      description: `Designed specifically for ${targetAudience}.`,
    })),
    testimonials: [
      { quote: `${productName} is the first thing that actually worked for my situation.`, author: "Sarah K.", role: targetAudience.split(" ").slice(0, 4).join(" ") },
      { quote: "Worth 10x the price. I launched something I'd been putting off for months.", author: "Marcus T.", role: "Early customer" },
      { quote: "The clarity was worth more than any course.", author: "Priya M.", role: targetAudience.split(" ").slice(0, 4).join(" ") },
    ],
    cta: { headline: "Ready to build?", body: `Join ${targetAudience} who are already using ${productName}.`, buttonText: "Start free — no credit card" },
    pricing: {
      tagline: `Start free. Only pay when ${productName} is working for you.`,
      freeFeatures: [`${deliverables[0] ?? "Core access"} (limited)`, "Up to 3 projects", "Basic templates", "Community support"],
      starterFeatures: [`${deliverables[0] ?? "Full access"} — unlimited`, "Up to 20 projects", `${deliverables[1] ?? "Advanced features"}`, "Priority support", "All export formats", "AI assistant"],
      proFeatures: ["Everything in Starter", "Unlimited projects", "Unlimited AI edits", "Team collaboration", "Custom branding", "Priority support", "Early access"],
    },
    about: {
      origin: `We built ${productName} because we couldn't find it. After spending months searching for a solution that actually worked for ${targetAudience}, we decided to build it ourselves.`,
      mission: `${productName} exists to give ${targetAudience} the tools they need to build real businesses — fast.`,
      body: [
        `There's a specific kind of frustration that comes from being good at something but unable to turn it into a business.`,
        `${productName} was built by people who've been in that exact position. We know what it takes to go from idea to launched product.`,
        `Everything in ${productName} is designed around one question: what does ${targetAudience} actually need to succeed?`,
      ],
    },
    faq: [
      { question: `Who is ${productName} for?`, answer: `${productName} is built for ${targetAudience}.` },
      { question: "How much does it cost?", answer: `Starts free. Paid plans begin at ${suggestedPrice}.` },
      { question: "Is there a refund policy?", answer: "30-day full refund, no questions asked." },
      { question: "How long until I can launch?", answer: p.timeToLaunch },
      { question: `What does ${productName} include?`, answer: deliverables.join(", ") },
      { question: "Do I own the generated content?", answer: "Yes. Everything generated is yours with no restrictions." },
      { question: "How is this different from generic AI tools?", answer: "It's built specifically for your niche, not a general-purpose chatbot." },
      { question: "Can I cancel anytime?", answer: "Yes. Cancel from your account settings with one click." },
    ],
  };
}
