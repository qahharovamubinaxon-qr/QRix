import type { Metadata } from "next";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL } from "@/lib/seo";

/* The PDF landing is a client component and its tool grid is declared inline
   there, not in a shared registry. These 21 routes mirror that grid exactly so
   the ItemList an answer engine reads matches the links a visitor sees. */
const PDF_TOOLS: [string, string][] = [
  ["merge", "Merge PDF"], ["split", "Split PDF"], ["compress", "Compress PDF"],
  ["pdf-to-word", "PDF to Word"], ["word-to-pdf", "Word to PDF"], ["pdf-to-jpg", "PDF to JPG"],
  ["jpg-to-pdf", "JPG to PDF"], ["rotate", "Rotate PDF"], ["reorder", "Reorder Pages"],
  ["page-numbers", "Add Page Numbers"], ["watermark", "Add Watermark"], ["extract-pages", "Extract Pages"],
  ["delete-pages", "Delete Pages"], ["protect", "Protect PDF"], ["unlock", "Unlock PDF"],
  ["ocr", "OCR PDF"], ["pdf-to-text", "PDF to Text"], ["pdf-to-png", "PDF to PNG"],
  ["crop", "Crop PDF"], ["sign", "Sign PDF"], ["redact", "Redact PDF"],
];

/* See app/qr-tools/layout.tsx — the page is a client component, so without this
   the landing inherited the homepage title and canonical and could not rank. */
export const metadata: Metadata = pageMeta({
  title: "PDF Tools — 21 Free Online PDF Editors, No Upload",
  description:
    "Merge, split, compress, sign, OCR, rotate, crop, protect and convert PDF — 21 free tools that run in your browser, so your documents never leave your device. No signup, no watermark.",
  path: "/pdf-tools",
  keywords: [
    "pdf tools", "free pdf editor online", "merge pdf", "split pdf", "compress pdf",
    "sign pdf", "ocr pdf", "pdf to word", "pdf converter free", "edit pdf online",
  ],
});

export default function PdfToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "PDF Tools", path: "/pdf-tools" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "QRix PDF Tools",
            itemListElement: PDF_TOOLS.map(([slug, title], i) => ({
              "@type": "ListItem", position: i + 1, name: title, url: `${SITE_URL}/pdf-tools/${slug}`,
            })),
          },
        ])}
      />
      {children}
    </>
  );
}
