import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { QR_TOOLS } from "@/lib/qr-tools-meta";
import { POSTS } from "@/lib/blog";
import { getAutopilotPosts } from "@/lib/server/autopilot";

// ISR: regenerate hourly so autopilot-published posts enter the sitemap without a
// rebuild (mirrors app/blog/page.tsx). runAutopilot() also revalidates on publish.
export const revalidate = 3600;
import { AI_TOOLS } from "@/lib/ai-tools-meta";
import { VIDEO_TOOLS } from "@/lib/video-tools-meta";
import { THREE_TOOLS } from "@/lib/three-tools-meta";
import { IMAGE_TOOLS as IMG_EXP } from "@/lib/image-tools-meta";
import { USE_CASES_EN, USE_LANGS, hasTranslation } from "@/lib/usecase-content";
import { HELP_CATEGORIES } from "@/lib/help-content";
import { DOC_PAGES } from "@/lib/docs-content";
import { PLATFORMS as DL_PLATFORMS } from "@/lib/downloader-platforms";
import { LOC_TOOLS } from "@/lib/localized-tools";
import { CONVERT_PAIRS } from "@/lib/convert-pairs";
import { RESIZE_PRESETS } from "@/lib/resize-presets";
import { BG_USE_CASES } from "@/lib/removebg-usecases";
import { PASSPORT_SIZES } from "@/lib/passport-sizes";
import { LOC_RESIZE_PRESETS } from "@/lib/resize-presets-i18n";
import { BARCODE_TYPES } from "@/lib/barcode-types";
import { LOC_BARCODE_TYPES } from "@/lib/barcode-types-i18n";

const PDF_TOOLS = [
  "merge", "split", "compress", "pdf-to-word", "word-to-pdf", "pdf-to-jpg", "jpg-to-pdf",
  "pdf-to-png", "pdf-to-text", "ocr", "crop", "sign", "redact", "rotate", "reorder", "page-numbers",
  "watermark", "extract-pages", "delete-pages", "protect", "unlock",
];
const IMAGE_TOOLS = ["remove-bg", "image-to-text", "compress", "resize", "convert", "upscale", "exif-remover"];
const LEGAL = ["about", "privacy", "terms", "contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const autoPosts = await getAutopilotPosts();
  /* lastmod is emitted ONLY when a real change date exists (blog posts).
     Defaulting it to the build time stamped 737 of 808 URLs with one identical
     deploy timestamp — Google honors lastmod only when it is "consistently and
     verifiably accurate", so a fleet-wide fake date teaches it to ignore the
     field site-wide, including on the blog where it is genuine. */
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
    lastModified?: Date,
  ) => ({ url: `${SITE_URL}${path}`, ...(lastModified ? { lastModified } : {}), changeFrequency, priority });

  // Programmatic SEO use-case pages (localized, with hreflang alternates).
  const langReady = (l: string) => l === "en" || USE_CASES_EN.some((u) => hasTranslation(u.slug, l as never));
  const useEntries: MetadataRoute.Sitemap = [
    ...USE_LANGS.filter(langReady).map((l) => entry(`/use/${l}`, 0.7)),
    ...USE_CASES_EN.flatMap((u) =>
      USE_LANGS.filter((l) => hasTranslation(u.slug, l)).map((l) => ({
        url: `${SITE_URL}/use/${l}/${u.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            USE_LANGS.filter((x) => hasTranslation(u.slug, x)).map((x) => [x, `${SITE_URL}/use/${x}/${u.slug}`]),
          ),
        },
      })),
    ),
  ];

  return [
    ...useEntries,
    entry("/", 1.0, "daily"),
    entry("/qr-tools", 0.9),
    entry("/pdf-tools", 0.9),
    entry("/image-tools", 0.9),
    entry("/bulk-qr", 0.7),
    entry("/animated-qr", 0.8),
    entry("/qr-art", 0.8),
    entry("/promo-video", 0.8),
    entry("/promo", 0.6),
    entry("/free-forever", 0.8),
    entry("/qr-code-statistics", 0.8, "monthly"),
    entry("/free-qr-code-generator-comparison", 0.8, "monthly"),
    entry("/poster", 0.8),
    entry("/link-in-bio", 0.8),
    entry("/qr-tools/decode", 0.8),
    entry("/scanner", 0.8),
    entry("/barcode", 0.8),
    ...BARCODE_TYPES.map((t) => entry(`/barcode/${t.slug}`, 0.8)),
    entry("/ru/barcode", 0.85),
    entry("/uz/barcode", 0.85),
    ...LOC_BARCODE_TYPES.flatMap((t) => [entry(`/ru/barcode/${t.slug}`, 0.75), entry(`/uz/barcode/${t.slug}`, 0.75)]),
    entry("/downloader", 0.9),
    entry("/widgets", 0.7),
    ...DL_PLATFORMS.map((p) => entry(`/downloader/${p.id}`, 0.8)),
    entry("/compare/qrix-vs-ilovepdf", 0.8),
    entry("/compare/qrix-vs-tinywow", 0.8),
    entry("/compare/qrix-vs-snaptik", 0.8),
    entry("/ru/downloader", 0.9),
    ...DL_PLATFORMS.map((p) => entry(`/ru/downloader/${p.id}`, 0.8)),
    entry("/uz/downloader", 0.9),
    ...DL_PLATFORMS.map((p) => entry(`/uz/downloader/${p.id}`, 0.8)),
    ...LOC_TOOLS.flatMap((t) => [entry(`/ru/${t.slug}`, 0.85), entry(`/uz/${t.slug}`, 0.85)]),
    entry("/ai-tools", 0.9),
    ...AI_TOOLS.map((t) => entry(`/ai-tools/${t.slug}`, 0.8)),
    entry("/video-tools", 0.9),
    ...VIDEO_TOOLS.map((t) => entry(`/video-tools/${t.slug}`, 0.8)),
    entry("/3d-tools", 0.9),
    ...THREE_TOOLS.map((t) => entry(`/3d-tools/${t.slug}`, 0.8)),
    entry("/pricing", 0.7, "monthly"),
    entry("/developers", 0.7, "monthly"),
    entry("/blog", 0.7, "weekly"),
    // Real publish dates → an honest freshness signal (not "everything edited now").
    ...POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, "monthly", new Date(p.date))),
    ...autoPosts.map((p) => entry(`/blog/${p.slug}`, 0.6, "monthly", new Date(p.date))),
    entry("/help", 0.6, "monthly"),
    ...HELP_CATEGORIES.map((c) => entry(`/help/${c.slug}`, 0.5, "monthly")),
    entry("/docs", 0.6, "monthly"),
    ...DOC_PAGES.map((d) => entry(`/docs/${d.slug}`, 0.5, "monthly")),
    ...QR_TOOLS.map((t) => entry(`/qr-tools/${t.slug}`, 0.8)),
    ...PDF_TOOLS.map((s) => entry(`/pdf-tools/${s}`, 0.8)),
    ...IMAGE_TOOLS.map((s) => entry(`/image-tools/${s}`, 0.8)),
    ...IMG_EXP.map((t) => entry(`/image-tools/${t.slug}`, 0.8)),
    entry("/passport-photo", 0.9),
    ...PASSPORT_SIZES.map((p) => entry(`/passport-photo/${p.slug}`, 0.8)),
    entry("/remove-background", 0.9),
    ...BG_USE_CASES.map((u) => entry(`/remove-background/${u.slug}`, 0.8)),
    entry("/convert", 0.9),
    entry("/ru/convert", 0.85),
    entry("/uz/convert", 0.85),
    ...CONVERT_PAIRS.map((p) => entry(`/convert/${p.slug}`, 0.8)),
    ...CONVERT_PAIRS.flatMap((p) => [entry(`/ru/convert/${p.slug}`, 0.75), entry(`/uz/convert/${p.slug}`, 0.75)]),
    entry("/resize", 0.9),
    entry("/ru/resize", 0.85),
    entry("/uz/resize", 0.85),
    ...RESIZE_PRESETS.map((p) => entry(`/resize/${p.slug}`, 0.8)),
    ...LOC_RESIZE_PRESETS.flatMap((p) => [entry(`/ru/resize/${p.slug}`, 0.75), entry(`/uz/resize/${p.slug}`, 0.75)]),
    ...LEGAL.map((s) => entry(`/${s}`, 0.4, "yearly")),
  ];
}
