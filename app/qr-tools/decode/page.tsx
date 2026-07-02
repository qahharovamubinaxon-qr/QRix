import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import QrDecodeClient from "@/components/QrDecodeClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "QR Code Decoder — Read a QR From Any Image",
  description: "Upload a photo or screenshot and instantly decode the QR code inside — link, WiFi, vCard, payment and more. Free, private, runs in your browser.",
  path: "/qr-tools/decode",
  keywords: ["QR code decoder", "read QR from image", "scan QR from screenshot", "QR code reader online"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("QR Code Decoder", "Decode a QR code from any photo or screenshot, free and in-browser.", "/qr-tools/decode"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "QR Tools", path: "/qr-tools" }, { name: "QR Decoder", path: "/qr-tools/decode" }]),
        ])}
      />
      <ToolPageShell
        category="QR Tools" categoryHref="/qr-tools" title="QR Code Decoder" emoji="🔎"
        grad="linear-gradient(135deg,#0891b2,#22d3ee)"
        intro="Got a QR code in a photo or screenshot? Upload it and read what's inside."
        about="No camera needed — this tool decodes QR codes straight from images: photos, screenshots, scans or saved pictures. It detects what the code contains (website link, WiFi credentials, contact card, payment, event…) and lets you copy the content or open the link. Everything runs privately in your browser; the image never leaves your device."
        steps={[
          { title: "Upload an image", desc: "Photo, screenshot or scan containing a QR code." },
          { title: "Instant decode", desc: "We find and read the QR automatically." },
          { title: "Use the content", desc: "Copy it or open the link directly." },
        ]}
      >
        <QrDecodeClient />
      </ToolPageShell>
    </>
  );
}
