import { QR_TOOLS } from "@/lib/qr-tools-meta";
import { POSTS } from "@/lib/blog";

/** One flat, client-safe index of everything searchable on the site. */
export type SearchItem = {
  title: string;
  href: string;
  group: "QR Tools" | "PDF Tools" | "Image Tools" | "Pages" | "Blog";
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
  { title: "Blog", href: "/blog", group: "Pages", keywords: "guides articles" },
  { title: "Dashboard", href: "/dashboard", group: "Pages", keywords: "analytics my qr codes" },
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
    ...PAGES,
    ...POSTS.map((p) => ({
      title: p.title, href: `/blog/${p.slug}`, group: "Blog" as const, keywords: p.keywords.join(" "),
    })),
  ];
  return cache;
}

/** Simple ranked substring search — title hits first, then keyword hits. */
export function searchIndex(q: string, limit = 12): SearchItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const idx = buildSearchIndex();
  const inTitle: SearchItem[] = [];
  const inKeys: SearchItem[] = [];
  for (const item of idx) {
    const t = item.title.toLowerCase();
    if (t.includes(s)) { inTitle.push(item); continue; }
    if (item.keywords && item.keywords.toLowerCase().includes(s)) inKeys.push(item);
  }
  inTitle.sort((a, b) => a.title.toLowerCase().indexOf(s) - b.title.toLowerCase().indexOf(s));
  return [...inTitle, ...inKeys].slice(0, limit);
}
