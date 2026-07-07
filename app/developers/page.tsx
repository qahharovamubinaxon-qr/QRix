import type { Metadata } from "next";
import { pageMeta, jsonLd, breadcrumbLd } from "@/lib/seo";
import DevPortal from "@/components/dev/DevPortal";

export const metadata: Metadata = pageMeta({
  title: "QRix API — Developer Platform",
  description: "REST API, webhooks and SDKs for QR, PDF, image, video and AI processing. API keys, OpenAPI spec, live playground and interactive documentation.",
  path: "/developers",
  keywords: ["qrix api", "qr code api", "pdf api", "image processing api", "ai api", "webhooks", "developer platform"],
});

export default function DevelopersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Developers", path: "/developers" }]),
        ])}
      />
      <DevPortal />
    </>
  );
}
