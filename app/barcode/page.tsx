import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import BarcodeClient from "@/components/BarcodeClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free Barcode Generator — EAN-13, UPC, Code 128 & More",
  description:
    "Generate every barcode type for free: EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI, Pharmacode and Codabar. Download crisp PNG or SVG — no signup.",
  path: "/barcode",
  keywords: [
    "barcode generator", "free barcode generator", "ean 13 generator", "upc barcode",
    "code 128 generator", "code 39", "itf-14", "barcode maker online", "product barcode",
  ],
});

const FAQS = [
  { q: "Which barcode types can I generate?", a: "Code 128, EAN-13, EAN-8, UPC-A, Code 39, ITF-14, ITF, MSI, Pharmacode and Codabar — all the major retail, logistics and industrial formats." },
  { q: "Is the barcode generator free?", a: "Yes — unlimited barcodes, free, with no watermark and no signup." },
  { q: "What's the difference between EAN-13 and UPC-A?", a: "Both are retail product codes. EAN-13 (13 digits) is the international standard; UPC-A (12 digits) is the US/Canada standard. Scanners read both." },
  { q: "Can I print the barcode on packaging?", a: "Yes — download the SVG for infinitely sharp print quality, or a high-resolution PNG." },
  { q: "Do you store my barcode data?", a: "No. Barcodes are generated entirely in your browser; nothing is uploaded." },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Barcode Generator", "Generate EAN-13, UPC-A, Code 128, Code 39, ITF-14, MSI, Pharmacode and Codabar barcodes for free.", "/barcode"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Barcode Generator", path: "/barcode" }]),
          faqLd(FAQS),
        ])}
      />
      <ToolPageShell
        category="QR Tools"
        categoryHref="/qr-tools"
        title="Barcode Generator"
        emoji="🏷️"
        grad="linear-gradient(135deg,#0e7490,#22d3ee)"
        intro="Every barcode format in one studio — EAN, UPC, Code 128, Code 39, ITF-14 and more. Live preview, custom colors, crisp PNG/SVG export."
        about="The Barcode Studio generates all the major 1D barcode standards used in retail, logistics and industry. Pick a format, type your value, and get an instant live preview with validation — EAN-13 and UPC checksums are added automatically. Customize the bar color and height, then download a print-ready SVG (infinitely sharp) or a high-resolution PNG. Perfect for product packaging, price tags, inventory labels, shipping cartons and ID badges. Everything runs privately in your browser."
        steps={[
          { title: "Pick a format", desc: "EAN-13 for retail, Code 128 for logistics, ITF-14 for cartons…" },
          { title: "Enter your value", desc: "Live validation shows exactly what each format needs." },
          { title: "Download", desc: "Print-ready SVG or high-res PNG for packaging and labels." },
        ]}
      >
        <BarcodeClient />
      </ToolPageShell>
    </>
  );
}
