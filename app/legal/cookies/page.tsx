import type { Metadata } from "next";
import { LegalArticle, Section, P, Bullets } from "../legal-ui";

export const metadata: Metadata = { title: "Cookie Policy — LaunchForge" };

export default function CookiesPage() {
  return (
    <LegalArticle
      title="Cookie Policy"
      updated="[EFFECTIVE_DATE]"
      intro={<>This Cookie Policy explains how LaunchForge uses cookies and similar technologies. It supplements our <a href="/legal/privacy" style={{ color: "hsl(213 94% 62%)" }}>Privacy Policy</a>.</>}
    >
      <Section heading="1. What cookies are">
        <P>Cookies are small text files stored on your device. We use them to keep you signed in, secure your session, and operate core features.</P>
      </Section>

      <Section heading="2. Cookies we use">
        <Bullets items={[
          <><strong>Essential / authentication</strong> — session and refresh tokens (e.g. lf_sb_access_token, lf_sb_refresh_token) that keep you signed in. The Service cannot function without these.</>,
          <><strong>Security / CSRF</strong> — short-lived OAuth state and PKCE cookies (e.g. lf_oauth_state_*, lf_oauth_pkce_*) used to protect the integration connection flow.</>,
          <><strong>Functional</strong> — preferences that remember your settings.</>,
          <><strong>Analytics (optional)</strong> — if enabled, aggregate usage measurement via [ANALYTICS_PROVIDER]. [REMOVE_IF_UNUSED]</>,
        ]} />
      </Section>

      <Section heading="3. Managing cookies">
        <P>You can control cookies through your browser settings. Blocking essential cookies will prevent you from signing in and using the Service. Where required by law, we will request consent for non-essential cookies.</P>
      </Section>

      <Section heading="4. Contact">
        <P>Questions about cookies: [CONTACT_EMAIL].</P>
      </Section>
    </LegalArticle>
  );
}
