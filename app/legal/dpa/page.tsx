import type { Metadata } from "next";
import { LegalArticle, Section, P, Bullets } from "../legal-ui";

export const metadata: Metadata = { title: "Data Processing Addendum — LaunchForge" };

export default function DpaPage() {
  return (
    <LegalArticle
      title="Data Processing Addendum"
      updated="[EFFECTIVE_DATE]"
      intro={<>This Data Processing Addendum (&quot;DPA&quot;) forms part of the <a href="/legal/terms" style={{ color: "hsl(213 94% 62%)" }}>Terms of Service</a> between you (&quot;Controller&quot;) and [COMPANY] (&quot;Processor&quot;) and applies where we process personal data on your behalf under the EU/UK GDPR or comparable laws.</>}
    >
      <Section heading="1. Roles & scope">
        <P>For personal data you submit through the Service, you act as the Controller and we act as the Processor. We process such data only on your documented instructions, which include your use of the Service&apos;s features.</P>
      </Section>

      <Section heading="2. Processor obligations">
        <Bullets items={[
          "Process personal data only for the purpose of providing the Service.",
          "Ensure personnel authorized to process data are bound by confidentiality.",
          "Implement appropriate technical and organizational security measures, including encryption in transit and at rest for sensitive credentials.",
          "Assist you, taking into account the nature of processing, with data subject requests and security obligations.",
          "Delete or return personal data at the end of the engagement, subject to legal retention requirements.",
        ]} />
      </Section>

      <Section heading="3. Sub-processors">
        <P>You authorize us to engage sub-processors to provide the Service, currently including: Supabase (auth/database), Vercel (hosting), Stripe (payments), and AI providers such as Google and/or Anthropic (content generation). We impose data-protection obligations on sub-processors consistent with this DPA and remain responsible for their performance. We will notify you of material changes to our sub-processor list.</P>
      </Section>

      <Section heading="4. International transfers">
        <P>Where personal data is transferred outside the EEA/UK, we rely on appropriate safeguards such as the European Commission&apos;s Standard Contractual Clauses and the UK Addendum, as applicable.</P>
      </Section>

      <Section heading="5. Data subject requests">
        <P>We will, to the extent legally permitted, promptly inform you of requests from data subjects and assist you in responding using available functionality of the Service.</P>
      </Section>

      <Section heading="6. Personal data breach">
        <P>We will notify you without undue delay after becoming aware of a personal data breach affecting your data, and provide information reasonably necessary for you to meet your notification obligations.</P>
      </Section>

      <Section heading="7. Audits">
        <P>Upon reasonable written request, we will make available information necessary to demonstrate compliance with this DPA, subject to confidentiality and the protection of other customers&apos; data.</P>
      </Section>

      <Section heading="8. Contact">
        <P>Data protection contact: [DPO_OR_CONTACT_EMAIL].</P>
      </Section>
    </LegalArticle>
  );
}
