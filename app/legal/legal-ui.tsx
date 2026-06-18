// Shared presentational primitives for the legal document pages.
// Server components — no interactivity. Matches the app's dark theme.
import Link from "next/link";
import type { ReactNode } from "react";

export function LegalArticle({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/legal"
        className="text-xs"
        style={{ color: "hsl(213 94% 62%)" }}
      >
        ← All legal documents
      </Link>

      <h1 className="text-2xl font-semibold mt-6 mb-1" style={{ color: "hsl(220 9% 92%)", letterSpacing: "-0.01em" }}>
        {title}
      </h1>
      <p className="text-xs mb-8" style={{ color: "hsl(220 9% 42%)" }}>
        Last updated: {updated}
      </p>

      {intro && (
        <p className="text-sm mb-8" style={{ color: "hsl(220 9% 64%)", lineHeight: 1.7 }}>
          {intro}
        </p>
      )}

      <div className="space-y-8">{children}</div>

      <div className="mt-12 pt-6" style={{ borderTop: "1px solid hsl(220 13% 14%)" }}>
        <p className="text-xs" style={{ color: "hsl(220 9% 36%)", lineHeight: 1.7 }}>
          This document is a template provided for convenience and is not legal advice.
          Replace every bracketed placeholder (e.g. [COMPANY], [JURISDICTION]) and have it
          reviewed by a qualified attorney before relying on it. Questions: [CONTACT_EMAIL].
        </p>
      </div>
    </article>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold mb-2" style={{ color: "hsl(220 9% 84%)" }}>
        {heading}
      </h2>
      <div className="space-y-3 text-sm" style={{ color: "hsl(220 9% 62%)", lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-1.5 pl-5" style={{ listStyleType: "disc" }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
