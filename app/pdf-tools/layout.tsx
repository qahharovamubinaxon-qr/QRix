import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

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
  return children;
}
