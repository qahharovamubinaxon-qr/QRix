import { QR_TOOLS } from "@/lib/qr-tools-meta";
import { POSTS } from "@/lib/blog";
import { AI_TOOLS } from "@/lib/ai-tools-meta";
import { VIDEO_TOOLS } from "@/lib/video-tools-meta";
import { IMAGE_TOOLS as IMG_EXP } from "@/lib/image-tools-meta";
import { THREE_TOOLS } from "@/lib/three-tools-meta";

/** One flat, client-safe index of everything searchable on the site. */
export type SearchGroup =
  | "QR Tools" | "PDF Tools" | "Image Tools" | "AI Tools" | "Video Tools"
  | "Pages" | "Blog" | "Docs" | "FAQ" | "Categories";

export type SearchItem = {
  title: string;
  href: string;
  group: SearchGroup;
  keywords?: string;
};

const PDF_TOOLS: [string, string][] = [
  ["Merge PDF", "merge"], ["Split PDF", "split"], ["Compress PDF", "compress"],
  ["PDF to Word", "pdf-to-word"], ["Word to PDF", "word-to-pdf"], ["PDF to JPG", "pdf-to-jpg"],
  ["JPG to PDF", "jpg-to-pdf"], ["PDF to PNG", "pdf-to-png"], ["PDF to Text", "pdf-to-text"],
  ["OCR PDF", "ocr"], ["Sign PDF", "sign"], ["Redact PDF", "redact"], ["Rotate PDF", "rotate"],
  ["Reorder Pages", "reorder"], ["Delete Pages", "delete-pages"], ["Extract Pages", "extract-pages"],
  ["Page Numbers", "page-numbers"], ["Watermark PDF", "watermark"], ["Protect PDF", "protect"],
  ["Unlock PDF", "unlock"], ["Crop PDF", "crop"],
];

const IMAGE_TOOLS: [string, string][] = [
  ["Background Remover", "remove-bg"], ["Image to Text (OCR)", "image-to-text"],
  ["Compress Image", "compress"], ["Resize Image", "resize"], ["Convert Image", "convert"],
  ["Image Enhancer / Upscale", "upscale"], ["EXIF Remover", "exif-remover"],
];

const PAGES: SearchItem[] = [
  { title: "Barcode Generator", href: "/barcode", group: "Pages", keywords: "ean upc code128 barcode shtrix" },
  { title: "Link-in-Bio Page", href: "/link-in-bio", group: "Pages", keywords: "linktree bio links" },
  { title: "QR Poster Maker", href: "/poster", group: "Pages", keywords: "scan me flyer poster" },
  { title: "Bulk QR Generator", href: "/bulk-qr", group: "Pages", keywords: "csv batch mass" },
  { title: "QR Decoder", href: "/qr-tools/decode", group: "Pages", keywords: "read scan from image" },
  { title: "QR Scanner", href: "/scanner", group: "Pages", keywords: "camera scan" },
  { title: "Pricing", href: "/pricing", group: "Pages", keywords: "pro plan subscription narx" },
  { title: "Developer API", href: "/developers", group: "Pages", keywords: "api sdk webhooks rest openapi developer integration" },
  { title: "Blog", href: "/blog", group: "Pages", keywords: "guides articles" },
  { title: "Dashboard", href: "/dashboard", group: "Pages", keywords: "analytics my qr codes" },
];

const CATEGORIES: SearchItem[] = [
  { title: "All QR Tools", href: "/qr-tools", group: "Categories", keywords: "qr code generator category" },
  { title: "All PDF Tools", href: "/pdf-tools", group: "Categories", keywords: "pdf merge split compress category" },
  { title: "All Image Tools", href: "/image-tools", group: "Categories", keywords: "image photo editor category" },
  { title: "All Video Tools", href: "/video-tools", group: "Categories", keywords: "video trim gif subtitles category" },
  { title: "All AI Tools", href: "/ai-tools", group: "Categories", keywords: "artificial intelligence category" },
  { title: "All 3D Tools", href: "/3d-tools", group: "Categories", keywords: "3d model mesh category" },
];

const DOCS: SearchItem[] = [
  { title: "API Quick Start", href: "/developers", group: "Docs", keywords: "getting started integrate rest api documentation" },
  { title: "API Authentication", href: "/developers", group: "Docs", keywords: "api key bearer token scopes authentication" },
  { title: "API Rate Limits", href: "/developers", group: "Docs", keywords: "429 throttle requests per minute limits" },
  { title: "API Error Codes", href: "/developers", group: "Docs", keywords: "400 401 402 403 404 429 500 errors" },
  { title: "Webhooks Guide", href: "/developers", group: "Docs", keywords: "webhook events signature retry deliveries" },
  { title: "OpenAPI Specification", href: "/api/v1/openapi.json", group: "Docs", keywords: "swagger openapi schema spec json" },
  { title: "JavaScript SDK", href: "/developers", group: "Docs", keywords: "sdk javascript typescript python php curl examples" },
];

const FAQS: SearchItem[] = [
  { title: "Is QRix really free?", href: "/#faq", group: "FAQ", keywords: "free forever watermark signup pricing" },
  { title: "Are my files uploaded to a server?", href: "/#faq", group: "FAQ", keywords: "privacy on-device browser local processing security" },
  { title: "Do QR codes expire?", href: "/#faq", group: "FAQ", keywords: "static dynamic qr expire forever" },
  { title: "Can I track QR code scans?", href: "/#faq", group: "FAQ", keywords: "analytics scans dynamic tracking statistics" },
  { title: "What image formats are supported?", href: "/#faq", group: "FAQ", keywords: "png jpg webp svg gif formats" },
  { title: "How do credits work?", href: "/pricing", group: "FAQ", keywords: "credits plan allowance ai usage billing" },
  { title: "How do I get an API key?", href: "/developers", group: "FAQ", keywords: "api key developer create generate" },
];

let cache: SearchItem[] | null = null;

export function buildSearchIndex(): SearchItem[] {
  if (cache) return cache;
  cache = [
    ...QR_TOOLS.map((t) => ({
      title: t.title, href: `/qr-tools/${t.slug}`, group: "QR Tools" as const, keywords: t.desc,
    })),
    ...PDF_TOOLS.map(([title, slug]) => ({
      title, href: `/pdf-tools/${slug}`, group: "PDF Tools" as const,
    })),
    ...IMAGE_TOOLS.map(([title, slug]) => ({
      title, href: `/image-tools/${slug}`, group: "Image Tools" as const,
    })),
    ...AI_TOOLS.map((t) => ({
      title: t.title, href: `/ai-tools/${t.slug}`, group: "AI Tools" as const, keywords: t.keywords.join(" "),
    })),
    ...VIDEO_TOOLS.map((t) => ({
      title: t.title, href: `/video-tools/${t.slug}`, group: "Video Tools" as const, keywords: t.keywords.join(" "),
    })),
    ...IMG_EXP.map((t) => ({
      title: t.title, href: `/image-tools/${t.slug}`, group: "Image Tools" as const, keywords: t.keywords.join(" "),
    })),
    ...THREE_TOOLS.map((t) => ({
      title: t.title, href: `/3d-tools/${t.slug}`, group: "Pages" as const, keywords: t.keywords.join(" "),
    })),
    ...PAGES,
    ...CATEGORIES,
    ...DOCS,
    ...FAQS,
    ...POSTS.map((p) => ({
      title: p.title, href: `/blog/${p.slug}`, group: "Blog" as const, keywords: p.keywords.join(" "),
    })),
  ];
  return cache;
}

/**
 * Full-text ranked search. Every whitespace-separated token must match the
 * title or keywords; earlier/whole-title matches score higher. Optional
 * group filter powers the palette's category chips.
 */
export function searchIndex(q: string, limit = 12, groups?: SearchGroup[]): SearchItem[] {
  const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const idx = buildSearchIndex();
  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of idx) {
    if (groups?.length && !groups.includes(item.group)) continue;
    const title = item.title.toLowerCase();
    const keys = item.keywords?.toLowerCase() ?? "";
    let score = 0;
    let ok = true;
    for (const tok of tokens) {
      const ti = title.indexOf(tok);
      if (ti >= 0) {
        score += 10 - Math.min(9, ti / 4);            // earlier in title = better
        if (ti === 0) score += 4;                     // prefix bonus
        if (title === tok) score += 8;                // exact title
      } else if (keys.includes(tok)) {
        score += 3;
      } else { ok = false; break; }
    }
    if (ok) scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item);
}

/** "Did you mean" — closest titles by shared-prefix/substring for empty results. */
export function suggestFor(q: string, limit = 5): SearchItem[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const idx = buildSearchIndex();
  const scored = idx.map((item) => {
    const t = item.title.toLowerCase();
    let overlap = 0;
    for (let len = Math.min(s.length, 6); len >= 2; len--) {
      if (t.includes(s.slice(0, len))) { overlap = len; break; }
    }
    return { item, overlap };
  }).filter((x) => x.overlap >= 2);
  return scored.sort((a, b) => b.overlap - a.overlap).slice(0, limit).map((x) => x.item);
}
