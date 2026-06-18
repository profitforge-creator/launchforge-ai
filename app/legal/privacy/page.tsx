import type { Metadata } from "next";
import { LegalArticle, Section, P, Bullets } from "../legal-ui";

export const metadata: Metadata = { title: "Privacy Policy — LaunchForge" };

export default function PrivacyPage() {
  return (
    <LegalArticle
      title="Privacy Policy"
      updated="[EFFECTIVE_DATE]"
      intro={<>This Privacy Policy explains how [COMPANY] (&quot;LaunchForge&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, and shares information when you use the LaunchForge application and website (the &quot;Service&quot;). By using the Service you agree to this Policy.</>}
    >
      <Section heading="1. Information we collect">
        <P>We collect the following categories of information:</P>
        <Bullets items={[
          <><strong>Account information</strong> — your name, email address, and authentication credentials managed through our identity provider (Supabase Auth).</>,
          <><strong>Integration credentials</strong> — OAuth access/refresh tokens and API tokens you connect (e.g. GitHub, Vercel, Stripe, Google/YouTube, TikTok, Meta, X, LinkedIn). These are stored encrypted at rest and are never shown back to you or to third parties.</>,
          <><strong>Content you create</strong> — business ideas, generated projects, prompts, and related metadata.</>,
          <><strong>Payment information</strong> — processed by Stripe. We do not store full card numbers; we retain a customer identifier, subscription status, and plan tier.</>,
          <><strong>Usage data</strong> — log data, feature usage, device/browser information, and approximate location derived from IP address.</>,
          <><strong>Cookies</strong> — see our <a href="/legal/cookies" style={{ color: "hsl(213 94% 62%)" }}>Cookie Policy</a>.</>,
        ]} />
      </Section>

      <Section heading="2. How we use information">
        <Bullets items={[
          "To provide, operate, and maintain the Service.",
          "To authenticate you and secure your account.",
          "To execute the integrations and automations you explicitly request.",
          "To process payments, manage subscriptions, and enforce plan limits.",
          "To monitor, debug, and improve the Service, including rate limiting and abuse prevention.",
          "To communicate with you about your account, security, and service changes.",
          "To comply with legal obligations.",
        ]} />
      </Section>

      <Section heading="3. AI processing">
        <P>The Service uses third-party AI providers (such as Google Gemini and/or Anthropic) to generate content from your inputs. Your prompts and related content may be transmitted to these providers solely to produce your requested output. We do not sell your content, and we instruct providers not to use your content to train their models where such controls are available. Do not submit information you are not authorized to share.</P>
      </Section>

      <Section heading="4. How we share information">
        <P>We share information only with service providers that help us operate the Service, and only as needed:</P>
        <Bullets items={[
          "Supabase — authentication and database hosting.",
          "Vercel — application hosting and deployment.",
          "Stripe — payment processing and subscription management.",
          "AI providers (e.g. Google, Anthropic) — content generation.",
          "Integration providers you connect (GitHub, Google/YouTube, TikTok, Meta, X, LinkedIn, etc.) — only to perform the actions you initiate.",
          "Legal and safety — when required by law or to protect rights, safety, and the integrity of the Service.",
        ]} />
        <P>We do not sell your personal information.</P>
      </Section>

      <Section heading="5. Data retention">
        <P>We retain personal information for as long as your account is active or as needed to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your account and associated data as described below.</P>
      </Section>

      <Section heading="6. Security">
        <P>We use industry-standard measures including encryption in transit (TLS) and encryption at rest for integration tokens. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.</P>
      </Section>

      <Section heading="7. Your rights">
        <P>Depending on your location (including under the EU/UK GDPR and the California CCPA/CPRA), you may have the right to access, correct, delete, export, or restrict processing of your personal information, and to object to certain processing. To exercise these rights, contact [CONTACT_EMAIL]. You may also lodge a complaint with your local data protection authority.</P>
      </Section>

      <Section heading="8. International transfers">
        <P>We may process and store information in countries other than your own, including [DATA_LOCATIONS]. Where required, we use appropriate safeguards such as Standard Contractual Clauses. See our <a href="/legal/dpa" style={{ color: "hsl(213 94% 62%)" }}>Data Processing Addendum</a>.</P>
      </Section>

      <Section heading="9. Children">
        <P>The Service is not directed to individuals under [MINIMUM_AGE]. We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will delete it.</P>
      </Section>

      <Section heading="10. Changes to this Policy">
        <P>We may update this Policy from time to time. We will post the updated version with a new effective date and, where appropriate, notify you.</P>
      </Section>

      <Section heading="11. Contact">
        <P>[COMPANY], [ADDRESS]. Email: [CONTACT_EMAIL].</P>
      </Section>
    </LegalArticle>
  );
}
