import type { Metadata } from "next";
import LegalShell, { H2, P, UL } from "@/components/LegalShell";
import { pageMeta, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Privacy Policy", description: `How ${SITE_NAME} handles your data. Files are processed in your browser and are not uploaded to our servers.`, path: "/privacy" });

export default function Page() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <P>This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;) handles information when you use our website and tools.</P>

      <H2>1. Files you process</H2>
      <P>The vast majority of our tools (PDF, image and QR generation) run entirely in your browser using client-side JavaScript. Your files are <strong>not uploaded to our servers</strong> and never leave your device. The only exceptions are clearly labelled server features (for example PDF compression), where the file is processed in memory and immediately discarded — it is never stored.</P>

      <H2>2. Account &amp; dynamic QR data</H2>
      <P>If you create an account, we store your email address and authentication data with our provider (Supabase) to let you sign in and manage your saved items. If you create a dynamic / PIN-protected QR code, we store its destination link and aggregate scan events (time, approximate location, device type) so we can show you analytics. You can delete these at any time from your dashboard.</P>

      <H2>3. Cookies &amp; local storage</H2>
      <UL>
        <li><strong>Essential</strong> — theme, language and interface preferences are stored in your browser&apos;s local storage; authentication cookies keep you signed in. These are always on because the site can&apos;t function without them.</li>
        <li><strong>Analytics</strong> — with your consent, we use privacy-friendly analytics (Vercel Analytics and, where enabled, Google Analytics 4) to understand aggregate, anonymised usage.</li>
        <li><strong>Advertising</strong> — with your consent, we use Google AdSense to display ads.</li>
      </UL>
      <P>When you first visit, a consent banner lets you <strong>accept or decline</strong> analytics and advertising cookies. We honour your choice through Google <strong>Consent Mode v2</strong>: until you opt in, no advertising or analytics storage is set, and any ads shown are non-personalised. You can change your choice at any time by clearing the site&apos;s storage in your browser.</P>

      <H2>4. Advertising (Google AdSense)</H2>
      <UL>
        <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
        <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits, subject to your consent.</li>
        <li>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Google Ads Settings</a>, or opt out of third-party vendor cookies at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>aboutads.info</a> and <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>youronlinechoices.eu</a>.</li>
      </UL>

      <H2>5. Third-party services</H2>
      <P>We rely on Supabase (authentication &amp; database), Vercel (hosting &amp; analytics), and — with consent — Google AdSense (advertising) and Google Analytics. Each provider processes data under its own privacy policy.</P>

      <H2>6. Legal basis &amp; your rights</H2>
      <P>Where the GDPR or UK GDPR applies, we process essential data to perform our service (contract) and analytics/advertising data on the basis of your <strong>consent</strong>. You have the right to access, correct, export or delete your personal data, to withdraw consent at any time, and to lodge a complaint with your data-protection authority. Deleting your account removes your stored links and analytics. To exercise any right, contact us below.</P>

      <H2>7. Children</H2>
      <P>{SITE_NAME} is not directed to children under 13 (or the minimum age in your country), and we do not knowingly collect their personal data.</P>

      <H2>8. Contact</H2>
      <P>Questions about this policy? Email <a href="mailto:musarasulzada@gmail.com" style={{ color: "var(--primary)" }}>musarasulzada@gmail.com</a>.</P>
    </LegalShell>
  );
}
