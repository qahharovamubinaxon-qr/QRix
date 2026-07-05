import type { Metadata } from "next";
import AiToolsLanding from "@/components/ai/AiToolsLanding";
import { pageMeta, jsonLd, breadcrumbLd } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/ai-tools-meta";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free AI Tools — Background Remover, Upscaler, OCR & 25+ More",
  description:
    "A complete AI toolbox in your browser: remove backgrounds, upscale and enhance photos, OCR, speech-to-text, logo & resume builders and more — free, private, no signup.",
  path: "/ai-tools",
  keywords: ["ai tools", "free ai tools", "ai image tools", "online ai toolbox", "ai photo editor"],
});

export default function AiToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI Tools", path: "/ai-tools" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "QRix AI Tools",
            itemListElement: AI_TOOLS.map((t, i) => ({
              "@type": "ListItem", position: i + 1, name: t.title, url: `${SITE_URL}/ai-tools/${t.slug}`,
            })),
          },
        ])}
      />
      <AiToolsLanding />
    </>
  );
}
