import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { QR_TOOLS } from "@/lib/qr-tools-meta";
import { POSTS } from "@/lib/blog";
import { AI_TOOLS } from "@/lib/ai-tools-meta";
import { VIDEO_TOOLS } from "@/lib/video-tools-meta";

const PDF_TOOLS = [
  "merge", "split", "compress", "pdf-to-word", "word-to-pdf", "pdf-to-jpg", "jpg-to-pdf",
  "pdf-to-png", "pdf-to-text", "ocr", "crop", "sign", "redact", "rotate", "reorder", "page-numbers",
  "watermark", "extract-pages", "delete-pages", "protect", "unlock",
];
const IMAGE_TOOLS = ["remove-bg", "image-to-text", "compress", "resize", "convert", "upscale", "exif-remover"];
const LEGAL = ["about", "privacy", "terms", "contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") =>
    ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });

  return [
    entry("/", 1.0, "daily"),
    entry("/qr-tools", 0.9),
    entry("/pdf-tools", 0.9),
    entry("/image-tools", 0.9),
    entry("/bulk-qr", 0.7),
    entry("/poster", 0.8),
    entry("/link-in-bio", 0.8),
    entry("/qr-tools/decode", 0.8),
    entry("/barcode", 0.8),
    entry("/ai-tools", 0.9),
    ...AI_TOOLS.map((t) => entry(`/ai-tools/${t.slug}`, 0.8)),
    entry("/video-tools", 0.9),
    ...VIDEO_TOOLS.map((t) => entry(`/video-tools/${t.slug}`, 0.8)),
    entry("/pricing", 0.7, "monthly"),
    entry("/blog", 0.7, "weekly"),
    ...POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, "monthly")),
    ...QR_TOOLS.map((t) => entry(`/qr-tools/${t.slug}`, 0.8)),
    ...PDF_TOOLS.map((s) => entry(`/pdf-tools/${s}`, 0.8)),
    ...IMAGE_TOOLS.map((s) => entry(`/image-tools/${s}`, 0.8)),
    ...LEGAL.map((s) => entry(`/${s}`, 0.4, "yearly")),
  ];
}
