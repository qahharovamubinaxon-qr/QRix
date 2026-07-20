"use client";

import dynamic from "next/dynamic";

/* Renders the working tool client for a localized (/ru, /uz) tool page.
   Reuses the exact same clients the English pages use — the tools are
   language-agnostic, only the surrounding SEO copy is localized.
   Mirrors AiEngineRegistry's pattern (direct JSX per case) so next/dynamic
   statically registers every chunk. */

const loading = () => (
  <div className="qx-card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
);

const PdfToWordClient = dynamic(() => import("@/components/PdfToWordClient"), { loading, ssr: false });
const MergePdfClient = dynamic(() => import("@/components/MergePdfClient"), { loading, ssr: false });
const CompressPdfClient = dynamic(() => import("@/components/CompressPdfClient"), { loading, ssr: false });
const JpgToPdfClient = dynamic(() => import("@/components/JpgToPdfClient"), { loading, ssr: false });
const PdfToJpgClient = dynamic(() => import("@/components/PdfToJpgClient"), { loading, ssr: false });
const RemoveBgClient = dynamic(() => import("@/components/RemoveBgClient"), { loading, ssr: false });
const ImageUpscaleClient = dynamic(() => import("@/components/ImageUpscaleClient"), { loading, ssr: false });
const ImageToTextClient = dynamic(() => import("@/components/ImageToTextClient"), { loading, ssr: false });

export default function LocalizedToolEngine({ slug }: { slug: string }) {
  switch (slug) {
    case "pdf-to-word": return <PdfToWordClient />;
    case "merge": return <MergePdfClient />;
    case "compress": return <CompressPdfClient />;
    case "jpg-to-pdf": return <JpgToPdfClient />;
    case "pdf-to-jpg": return <PdfToJpgClient />;
    case "background-remover": return <RemoveBgClient />;
    case "image-upscaler": return <ImageUpscaleClient />;
    case "image-to-text": return <ImageToTextClient />;
    default: return null;
  }
}
