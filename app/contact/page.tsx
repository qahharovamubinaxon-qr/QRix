import type { Metadata } from "next";
import LegalShell, { H2, P } from "@/components/LegalShell";
import { pageMeta, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Contact", description: `Get in touch with the ${SITE_NAME} team.`, path: "/contact" });

export default function Page() {
  return (
    <LegalShell title="Contact us" updated="June 2026">
      <P>We&apos;d love to hear from you — feedback, bug reports, feature requests or partnership enquiries.</P>

      <H2>Email</H2>
      <P><a href="mailto:musarasulzada@gmail.com" style={{ color: "var(--primary)" }}>musarasulzada@gmail.com</a></P>

      <H2>Telegram</H2>
      <P><a href="https://t.me/QRix2020" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>@QRix2020</a></P>

      <H2>Response time</H2>
      <P>We usually reply within 1–2 business days.</P>
    </LegalShell>
  );
}
