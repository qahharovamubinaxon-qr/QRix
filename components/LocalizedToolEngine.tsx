"use client";

import dynamic from "next/dynamic";

/* Renders the working tool client for a localized (/ru, /uz) tool page.
   Reuses the exact same clients the English pages use — the tools are
   language-agnostic, only the surrounding SEO copy is localized. */

const loading = () => (
  <div className="qx-card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
);

const ENGINES: Record<string, React.ComponentType> = {
  "pdf-to-word": dynamic(() => import("@/components/PdfToWordClient"), { loading, ssr: false }),
  "merge": dynamic(() => import("@/components/MergePdfClient"), { loading, ssr: false }),
  "compress": dynamic(() => import("@/components/CompressPdfClient"), { loading, ssr: false }),
  "jpg-to-pdf": dynamic(() => import("@/components/JpgToPdfClient"), { loading, ssr: false }),
  "pdf-to-jpg": dynamic(() => import("@/components/PdfToJpgClient"), { loading, ssr: false }),
  "background-remover": dynamic(() => import("@/components/RemoveBgClient"), { loading, ssr: false }),
  "image-upscaler": dynamic(() => import("@/components/ImageUpscaleClient"), { loading, ssr: false }),
  "image-to-text": dynamic(() => import("@/components/ImageToTextClient"), { loading, ssr: false }),
};

export default function LocalizedToolEngine({ slug }: { slug: string }) {
  const Engine = ENGINES[slug];
  if (!Engine) return null;
  return <Engine />;
}
