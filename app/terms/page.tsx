import type { Metadata } from "next";
import LegalShell, { H2, P, UL } from "@/components/LegalShell";
import { pageMeta, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Terms of Service", description: `Terms for using ${SITE_NAME}'s free QR, PDF and image tools.`, path: "/terms" });

export default function Page() {
  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <P>By using {SITE_NAME} you agree to these terms.</P>

      <H2>1. Use of the service</H2>
      <P>{SITE_NAME} provides free online tools for generating QR codes and processing PDF and image files. You may use them for personal and commercial purposes, provided you do not use them for unlawful content or to infringe others&apos; rights.</P>

      <H2>2. No warranty</H2>
      <P>The tools are provided &quot;as is&quot;, without warranty of any kind. While we work hard to keep conversions accurate, we cannot guarantee a specific result for every file. Always keep a copy of your original files.</P>

      <H2>3. Acceptable use</H2>
      <UL>
        <li>Do not upload or generate illegal, harmful or copyrighted material you do not own.</li>
        <li>Do not abuse, overload or attempt to disrupt the service.</li>
        <li>Free-tier limits (file size, number of items) may apply; paid plans raise these limits.</li>
      </UL>

      <H2>4. Accounts &amp; subscriptions</H2>
      <P>Some features require an account. Paid subscriptions renew automatically until cancelled; you can cancel any time and keep access until the period ends.</P>

      <H2>5. Liability</H2>
      <P>To the maximum extent permitted by law, {SITE_NAME} is not liable for any indirect or consequential damages arising from use of the service.</P>

      <H2>6. Changes</H2>
      <P>We may update these terms; continued use after changes constitutes acceptance.</P>
    </LegalShell>
  );
}
