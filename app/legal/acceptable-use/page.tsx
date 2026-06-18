import type { Metadata } from "next";
import { LegalArticle, Section, P, Bullets } from "../legal-ui";

export const metadata: Metadata = { title: "Acceptable Use Policy — LaunchForge" };

export default function AcceptableUsePage() {
  return (
    <LegalArticle
      title="Acceptable Use Policy"
      updated="[EFFECTIVE_DATE]"
      intro={<>This Acceptable Use Policy (&quot;AUP&quot;) describes activities that are prohibited on the LaunchForge Service. It supplements our <a href="/legal/terms" style={{ color: "hsl(213 94% 62%)" }}>Terms of Service</a>.</>}
    >
      <Section heading="1. Prohibited content & conduct">
        <P>You may not use the Service to create, store, or distribute content that:</P>
        <Bullets items={[
          "Is illegal, or promotes illegal activity, fraud, or deception.",
          "Infringes intellectual property, privacy, or publicity rights.",
          "Is defamatory, harassing, hateful, or incites violence.",
          "Is sexually exploitative, especially involving minors.",
          "Contains malware, or is designed to disrupt or gain unauthorized access to systems.",
          "Violates the terms or rate limits of any connected third-party platform.",
        ]} />
      </Section>

      <Section heading="2. Abuse of AI generation">
        <P>You may not use the Service to generate spam, mass deceptive content, disinformation, impersonation, or content intended to evade platform moderation or security controls. You may not attempt to extract underlying models or use output to build a competing model.</P>
      </Section>

      <Section heading="3. Platform integrity">
        <Bullets items={[
          "Do not circumvent usage limits, rate limits, or plan entitlements.",
          "Do not probe, scan, or test the vulnerability of the Service without authorization.",
          "Do not share, resell, or sublicense access without permission.",
          "Do not use automated means to overload or degrade the Service.",
        ]} />
      </Section>

      <Section heading="4. Enforcement">
        <P>We may investigate suspected violations and may remove content, throttle, suspend, or terminate accounts. Serious violations may be reported to law enforcement. To report abuse, contact [CONTACT_EMAIL].</P>
      </Section>
    </LegalArticle>
  );
}
