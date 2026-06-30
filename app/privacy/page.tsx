import type { Metadata } from "next";
import LegalShell, { H2, P, UL } from "@/components/LegalShell";
import { pageMeta, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Privacy Policy", description: `How ${SITE_NAME} handles your data. Files are processed in your browser and are not uploaded to our servers.`, path: "/privacy" });

export default function Page() {
  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <P>This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;) handles information when you use our website and tools.</P>

      <H2>1. Files you process</H2>
      <P>The vast majority of our tools (PDF, image and QR generation) run entirely in your browser using client-side JavaScript. Your files are <strong>not uploaded to our servers</strong> and never leave your device. The only exceptions are clearly labelled server features (for example PDF compression), where the file is processed in memory and immediately discarded — it is never stored.</P>

      <H2>2. Account &amp; dynamic QR data</H2>
      <P>If you create an account, we store your email address and authentication data with our provider (Supabase) to let you sign in and manage your saved items. If you create a dynamic / PIN-protected QR code, we store its destination link and aggregate scan events (time, approximate location, device type) so we can show you analytics. You can delete these at any time from your dashboard.</P>

      <H2>3. Cookies &amp; local storage</H2>
      <UL>
        <li>Essential preferences (theme, language) are stored in your browser&apos;s local storage.</li>
        <li>Authentication cookies keep you signed in.</li>
        <li>We may use Google AdSense to display ads; Google and its partners may use cookies to serve ads based on your prior visits. You can opt out via Google&apos;s Ads Settings.</li>
      </UL>

      <H2>4. Third-party services</H2>
      <P>We rely on Supabase (authentication &amp; database) and may use Google AdSense (advertising). These providers process data under their own privacy policies.</P>

      <H2>5. Your rights</H2>
      <P>You may request access to, correction of, or deletion of your personal data by contacting us. Deleting your account removes your stored links and analytics.</P>

      <H2>6. Contact</H2>
      <P>Questions about this policy? Email <a href="mailto:musarasulzada@gmail.com" style={{ color: "var(--primary)" }}>musarasulzada@gmail.com</a>.</P>
    </LegalShell>
  );
}
