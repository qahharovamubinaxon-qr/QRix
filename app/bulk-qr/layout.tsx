import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

/* See app/qr-tools/layout.tsx — the page is a client component, so without this
   the landing inherited the homepage title and canonical and could not rank. */
export const metadata: Metadata = pageMeta({
  title: "Bulk QR Code Generator — CSV to Hundreds of QR Codes, Free",
  description:
    "Paste a list or upload a CSV and get every QR code at once, downloaded as a ZIP. Free and unlimited, no signup and no watermark — generated entirely in your browser.",
  path: "/bulk-qr",
  keywords: [
    "bulk qr code generator", "csv to qr code", "batch qr code generator",
    "mass qr code creator", "multiple qr codes at once", "qr codes zip download",
  ],
});

export default function BulkQrLayout({ children }: { children: React.ReactNode }) {
  return children;
}
