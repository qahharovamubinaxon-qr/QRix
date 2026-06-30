import type { Metadata } from "next";
import LegalShell, { H2, P, UL } from "@/components/LegalShell";
import { pageMeta, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "About", description: SITE_DESCRIPTION, path: "/about" });

export default function Page() {
  return (
    <LegalShell title={`About ${SITE_NAME}`} updated="June 2026">
      <P>{SITE_NAME} is an all-in-one, privacy-first toolkit for everyday digital tasks — creating QR codes and working with PDF and image files — all running directly in your browser.</P>

      <H2>What you can do</H2>
      <UL>
        <li><strong>QR codes:</strong> 30+ types (URL, WiFi, vCard, social, payments, events and more), with logos, custom shapes, gradients and a &quot;Scan me&quot; frame.</li>
        <li><strong>Dynamic QR &amp; analytics:</strong> editable links plus real-time scan statistics.</li>
        <li><strong>PDF tools:</strong> merge, split, compress, convert (Word, JPG, PNG, text), OCR, crop, sign, watermark, page numbers and more.</li>
        <li><strong>Image tools:</strong> background removal, image-to-text, resize, compress, convert and upscale.</li>
      </UL>

      <H2>Privacy by design</H2>
      <P>Most tools never upload your files — everything happens locally on your device. That makes {SITE_NAME} fast and safe for sensitive documents.</P>

      <H2>Contact</H2>
      <P>Reach us at <a href="mailto:musarasulzada@gmail.com" style={{ color: "var(--primary)" }}>musarasulzada@gmail.com</a> or on Telegram <a href="https://t.me/QRix2020" style={{ color: "var(--primary)" }}>@QRix2020</a>.</P>
    </LegalShell>
  );
}
