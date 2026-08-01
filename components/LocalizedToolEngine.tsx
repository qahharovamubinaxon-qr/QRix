"use client";

import dynamic from "next/dynamic";
import type { ToolLang } from "@/lib/tool-ui-i18n";

/* Renders the working tool client for a localized (/ru, /uz) tool page.
   Reuses the exact same clients the English pages use, and passes each of them
   the page's language.
   Mirrors AiEngineRegistry's pattern (direct JSX per case) so next/dynamic
   statically registers every chunk.

   This header used to read "the tools are language-agnostic, only the
   surrounding SEO copy is localized". That was false, and it hid the defect
   through two localization passes: every client below carried English button,
   status and empty-state text, so a RU or UZ visitor got a localized page
   wrapping an English tool. Fixed in M150 — strings live in
   lib/tool-ui-i18n.ts and each client takes an optional `lang` defaulting to
   "en", which is what the English routes rely on. */

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

export default function LocalizedToolEngine({ slug, lang = "en" }: { slug: string; lang?: ToolLang }) {
  switch (slug) {
    case "pdf-to-word": return <PdfToWordClient lang={lang} />;
    case "merge": return <MergePdfClient lang={lang} />;
    case "compress": return <CompressPdfClient lang={lang} />;
    case "jpg-to-pdf": return <JpgToPdfClient lang={lang} />;
    case "pdf-to-jpg": return <PdfToJpgClient lang={lang} />;
    case "background-remover": return <RemoveBgClient lang={lang} />;
    case "image-upscaler": return <ImageUpscaleClient lang={lang} />;
    case "image-to-text": return <ImageToTextClient lang={lang} />;
    default: return null;
  }
}
