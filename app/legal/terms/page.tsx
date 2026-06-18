import type { Metadata } from "next";
import { LegalArticle, Section, P, Bullets } from "../legal-ui";

export const metadata: Metadata = { title: "Terms of Service — LaunchForge" };

export default function TermsPage() {
  return (
    <LegalArticle
      title="Terms of Service"
      updated="[EFFECTIVE_DATE]"
      intro={<>These Terms of Service (&quot;Terms&quot;) are a binding agreement between you and [COMPANY] (&quot;LaunchForge&quot;, &quot;we&quot;, &quot;us&quot;) governing your use of the LaunchForge application and website (the &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms.</>}
    >
      <Section heading="1. Eligibility & accounts">
        <P>You must be at least [MINIMUM_AGE] and able to form a binding contract. You are responsible for your account, for keeping your credentials secure, and for all activity under your account.</P>
      </Section>

      <Section heading="2. Plans, billing & trials">
        <P>The Service is offered under the following plans:</P>
        <Bullets items={[
          <><strong>Free</strong> — limited usage, intended for evaluation.</>,
          <><strong>Starter — $19/month</strong> — for individuals getting started.</>,
          <><strong>Growth — $49/month</strong> — for active builders who need higher limits and more integrations.</>,
          <><strong>Scale — $149/month</strong> — for power users and teams who need the highest limits and priority support.</>,
        ]} />
        <P>Paid plans are billed in advance on a recurring basis through Stripe until cancelled. Prices are in [CURRENCY] and exclusive of taxes unless stated. We may change pricing with notice; changes apply to the next billing cycle. Any free trial converts to a paid subscription unless cancelled before it ends.</P>
      </Section>

      <Section heading="3. Cancellations & refunds">
        <P>You may cancel at any time; access continues until the end of the current billing period. Refunds are governed by our <a href="/legal/refunds" style={{ color: "hsl(213 94% 62%)" }}>Refund Policy</a>.</P>
      </Section>

      <Section heading="4. Acceptable use">
        <P>Your use of the Service is subject to our <a href="/legal/acceptable-use" style={{ color: "hsl(213 94% 62%)" }}>Acceptable Use Policy</a>. We may suspend or terminate accounts that violate it.</P>
      </Section>

      <Section heading="5. Your content & intellectual property">
        <P>You retain ownership of the content and inputs you provide. You grant us a limited license to host, process, and transmit your content solely to operate the Service. As between you and us, output generated for you is yours to use, subject to these Terms and any third-party rights. The Service itself, including its software and branding, remains our property.</P>
      </Section>

      <Section heading="6. AI-generated content disclaimer">
        <P>The Service uses AI to generate text, code, designs, and business materials. AI output may be inaccurate, incomplete, or unsuitable, and may resemble other works. You are responsible for reviewing output and ensuring your use complies with applicable laws and third-party rights. The Service does not provide legal, financial, tax, or professional advice.</P>
      </Section>

      <Section heading="7. Third-party integrations">
        <P>The Service can connect to third-party platforms (e.g. GitHub, Vercel, Stripe, Google/YouTube, and social networks). Your use of those platforms is governed by their own terms. We are not responsible for third-party services, and actions you take through them are at your own risk.</P>
      </Section>

      <Section heading="8. Service availability">
        <P>We aim for high availability but do not guarantee the Service will be uninterrupted or error-free. We may modify, suspend, or discontinue features at any time.</P>
      </Section>

      <Section heading="9. Disclaimers">
        <P>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.</P>
      </Section>

      <Section heading="10. Limitation of liability">
        <P>TO THE MAXIMUM EXTENT PERMITTED BY LAW, [COMPANY] WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS OR DATA. OUR TOTAL LIABILITY FOR ANY CLAIM WILL NOT EXCEED THE AMOUNTS YOU PAID US IN THE [LIABILITY_WINDOW] PRECEDING THE CLAIM.</P>
      </Section>

      <Section heading="11. Indemnification">
        <P>You agree to indemnify and hold harmless [COMPANY] from claims arising out of your content, your use of the Service, or your violation of these Terms or applicable law.</P>
      </Section>

      <Section heading="12. Termination">
        <P>We may suspend or terminate your access for violation of these Terms or to protect the Service. You may stop using the Service at any time. Provisions that by their nature should survive termination will survive.</P>
      </Section>

      <Section heading="13. Governing law & disputes">
        <P>These Terms are governed by the laws of [JURISDICTION], without regard to conflict-of-laws rules. Disputes will be resolved in the courts of [VENUE], unless otherwise required by mandatory local law. [ARBITRATION_CLAUSE_OPTIONAL]</P>
      </Section>

      <Section heading="14. Changes">
        <P>We may update these Terms. We will post the updated version with a new effective date and, where appropriate, notify you. Continued use after changes constitutes acceptance.</P>
      </Section>

      <Section heading="15. Contact">
        <P>[COMPANY], [ADDRESS]. Email: [CONTACT_EMAIL].</P>
      </Section>
    </LegalArticle>
  );
}
