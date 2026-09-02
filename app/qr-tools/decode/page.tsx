import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import QrDecodeClient from "@/components/QrDecodeClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "QR Code Decoder & Safety Checker — See the Link Before You Scan",
  description: "Upload a QR photo or screenshot to decode it AND check it's safe — we show the real destination and flag scam/phishing (quishing) signals before you open anything. Free, private, in your browser.",
  path: "/qr-tools/decode",
  keywords: ["qr code decoder", "is this qr code safe", "check qr code before scanning", "qr code scam checker", "quishing", "read qr from image", "qr code reader online"],
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
        breadcrumbSchema={false}
        category="QR Tools" categoryHref="/qr-tools" title="QR Decoder & Safety Check" emoji="🛡️"
        grad="linear-gradient(135deg,#0891b2,#22d3ee)"
        intro="Read a QR from any image — and see exactly where it leads, with a safety check, before you open it."
        about="QR phishing (‘quishing’) works because you can't see a link before you scan. This tool fixes that: upload a photo or screenshot, and it decodes the QR AND shows the real destination domain up front — flagging risky signals like shortened/redirect links, raw IP addresses, look-alike (punycode) domains, brand impersonation and insecure http. It also reads WiFi, contact, payment and event codes. Everything runs privately in your browser; the image never leaves your device."
        steps={[
          { title: "Upload the QR image", desc: "A photo, screenshot or saved picture of the code." },
          { title: "See the destination + safety check", desc: "We show the real domain and flag scam/phishing signals." },
          { title: "Open only if it's safe", desc: "Copy the content or open the link once you trust it." },
        ]}
        faqs={[
          { q: "What is 'quishing'?", a: "Quishing is QR-code phishing — a scam QR (often a sticker placed over a real one) sends you to a fake site to steal your details. Because you can't read a QR with your eyes, you find out only after scanning. This tool shows you the real destination first." },
          { q: "How do you decide if a QR is safe?", a: "We check the decoded link for common scam signals: shortened/redirect links that hide the destination, raw IP addresses, look-alike (punycode) domains, embedded login details, insecure http and brand-impersonation patterns. It's a strong first line of defence, not a guarantee." },
          { q: "Is my image uploaded?", a: "No — decoding and the safety check both run in your browser. Your image never leaves your device." },
        ]}
      >
        <QrDecodeClient />
      </ToolPageShell>
    </>
  );
}
