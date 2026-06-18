import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal — LaunchForge",
  description: "Privacy Policy, Terms of Service, and other legal documents for LaunchForge.",
};

const DOCS = [
  { href: "/legal/privacy",        title: "Privacy Policy",            desc: "What data we collect, how we use it, and your rights." },
  { href: "/legal/terms",          title: "Terms of Service",          desc: "The agreement that governs your use of LaunchForge." },
  { href: "/legal/acceptable-use", title: "Acceptable Use Policy",     desc: "What you may and may not do with the service." },
  { href: "/legal/cookies",        title: "Cookie Policy",             desc: "The cookies we set and how to control them." },
  { href: "/legal/refunds",        title: "Refund Policy",             desc: "How subscription billing, cancellations, and refunds work." },
  { href: "/legal/dpa",            title: "Data Processing Addendum",  desc: "How we process personal data on your behalf (GDPR)." },
];

export default function LegalIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" className="text-xs" style={{ color: "hsl(213 94% 62%)" }}>
        ← Back to LaunchForge
      </Link>
      <h1 className="text-2xl font-semibold mt-6 mb-2" style={{ color: "hsl(220 9% 92%)", letterSpacing: "-0.01em" }}>
        Legal
      </h1>
      <p className="text-sm mb-10" style={{ color: "hsl(220 9% 56%)", lineHeight: 1.7 }}>
        The documents below govern your use of LaunchForge. They are templates with
        bracketed placeholders ([COMPANY], [JURISDICTION], etc.) that must be completed
        and reviewed by an attorney before they take effect.
      </p>

      <div className="space-y-3">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="block rounded-xl p-5 transition-colors"
            style={{ backgroundColor: "hsl(220 13% 10%)", border: "1px solid hsl(220 13% 15%)" }}
          >
            <p className="text-sm font-semibold mb-0.5" style={{ color: "hsl(220 9% 86%)" }}>{doc.title}</p>
            <p className="text-xs" style={{ color: "hsl(220 9% 44%)" }}>{doc.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
