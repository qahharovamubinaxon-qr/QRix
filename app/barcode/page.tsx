import type { Metadata } from "next";
import Link from "next/link";
import ToolPageShell from "@/components/ToolPageShell";
import BarcodeClient from "@/components/BarcodeClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";
import { BARCODE_TYPES, BARCODE_FAMILIES } from "@/lib/barcode-types";

export const metadata: Metadata = pageMeta({
  title: "Free Barcode Generator — PDF417, Aztec, EAN-13, Code 128 & More",
  description:
    "Generate 13 barcode types free: PDF417, Aztec, Data Matrix, EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI, Pharmacode and Codabar. Download crisp PNG or SVG — no signup.",
  path: "/barcode",
  keywords: [
    "barcode generator", "pdf417 generator", "aztec code generator", "data matrix generator",
    "free barcode generator", "ean 13 generator", "upc barcode", "code 128 generator",
    "code 39", "itf-14", "2d barcode generator", "barcode maker online", "product barcode",
  ],
  languages: { en: "/barcode", ru: "/ru/barcode", uz: "/uz/barcode", "x-default": "/barcode" },
});

const FAQS = [
  { q: "Which barcode types can I generate?", a: "13 types: the 2D codes PDF417, Aztec and Data Matrix, plus the 1D codes Code 128, EAN-13, EAN-8, UPC-A, Code 39, ITF-14, ITF, MSI, Pharmacode and Codabar — all the major retail, logistics, ID and industrial formats." },
  { q: "What is a PDF417 barcode used for?", a: "PDF417 is a 2D stacked barcode that stores a lot of data — it's used on driver's licenses, ID cards, boarding passes, shipping labels and government forms. Paste your text and download a crisp PNG or SVG." },
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
        breadcrumbSchema={false}
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

      {/* Per-symbology landing pages — each explains one format and preselects it */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Barcode types">
          <h2 className="qx-title mb-1.5" style={{ color: "var(--text)" }}>All 13 barcode types</h2>
          <p className="text-[13.5px] mb-5" style={{ color: "var(--text-muted)" }}>
            Each format has its own guide — what it encodes, where it is used and how to size it for print.
          </p>
          <div className="space-y-5">
            {BARCODE_FAMILIES.map((fam) => (
              <div key={fam}>
                <h3 className="text-[11.5px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: "var(--text-muted)" }}>{fam}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {BARCODE_TYPES.filter((t) => t.family === fam).map((t) => (
                    <Link key={t.slug} href={`/barcode/${t.slug}`}
                      className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                      <span aria-hidden>{t.emoji}</span> {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
