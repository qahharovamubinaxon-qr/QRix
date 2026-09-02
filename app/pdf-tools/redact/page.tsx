import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import RedactPdfClient from "@/components/RedactPdfClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Redact PDF — Permanently Black Out Sensitive Info",
  description: "Draw black boxes over names, numbers or any sensitive content and export a flattened PDF where the hidden data is truly destroyed — free and private, in your browser.",
  path: "/pdf-tools/redact",
  keywords: ["redact PDF online free", "black out PDF text", "remove sensitive information PDF", "censor PDF"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Redact PDF", "Permanently black out sensitive content in a PDF, free and in-browser.", "/pdf-tools/redact"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "PDF Tools", path: "/pdf-tools" }, { name: "Redact PDF", path: "/pdf-tools/redact" }]),
        ])}
      />
      <ToolPageShell
        breadcrumbSchema={false}
        category="PDF Tools" categoryHref="/pdf-tools" title="Redact PDF" emoji="🖤"
        grad="linear-gradient(135deg,#dc2626,#f87171)"
        intro="Black out names, numbers and secrets — permanently, not just visually."
        about="Unlike simply drawing a rectangle in an editor (which can be removed to reveal the text underneath), this tool flattens each page during export, physically destroying the covered content. Draw boxes over anything sensitive — personal data, account numbers, signatures — then download a safe copy. Everything runs privately in your browser; the file never leaves your device."
        steps={[
          { title: "Upload a PDF", desc: "The document with sensitive content." },
          { title: "Draw black boxes", desc: "Drag over anything you want removed, on any page." },
          { title: "Export", desc: "Download a flattened PDF — hidden data is gone for good." },
        ]}
      >
        <RedactPdfClient />
      </ToolPageShell>
    </>
  );
}
