import type { Metadata } from "next";
import { LegalArticle, Section, P, Bullets } from "../legal-ui";

export const metadata: Metadata = { title: "Refund Policy — LaunchForge" };

export default function RefundsPage() {
  return (
    <LegalArticle
      title="Refund Policy"
      updated="[EFFECTIVE_DATE]"
      intro={<>This Refund Policy describes how billing, cancellations, and refunds work for LaunchForge paid plans (Starter $19, Growth $49, Scale $149 per month). It supplements our <a href="/legal/terms" style={{ color: "hsl(213 94% 62%)" }}>Terms of Service</a>.</>}
    >
      <Section heading="1. Subscription billing">
        <P>Paid plans are billed in advance each billing period through Stripe and renew automatically until cancelled. You can cancel anytime from your account settings; your plan remains active until the end of the current period.</P>
      </Section>

      <Section heading="2. Refund eligibility">
        <Bullets items={[
          "We offer a refund within [REFUND_WINDOW] of an initial purchase if you are not satisfied. [ADJUST_OR_REMOVE]",
          "Renewal charges are generally non-refundable, except where required by law.",
          "We do not provide pro-rated refunds for partial periods after cancellation unless required by law.",
          "Amounts consumed for usage-based or third-party pass-through costs are non-refundable.",
        ]} />
      </Section>

      <Section heading="3. How to request a refund">
        <P>Email [CONTACT_EMAIL] from your account email with your invoice or customer ID. We aim to respond within [SUPPORT_SLA]. Approved refunds are issued to your original payment method via Stripe.</P>
      </Section>

      <Section heading="4. Chargebacks">
        <P>If you have a billing concern, please contact us first. Initiating a chargeback without contacting us may result in suspension of your account while the dispute is investigated.</P>
      </Section>

      <Section heading="5. Statutory rights">
        <P>Nothing in this policy limits any non-waivable refund or cancellation rights you may have under the consumer laws of [JURISDICTION].</P>
      </Section>
    </LegalArticle>
  );
}
