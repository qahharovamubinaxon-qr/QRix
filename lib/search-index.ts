import { QR_TOOLS } from "@/lib/qr-tools-meta";
import { POSTS } from "@/lib/blog";
import { AI_TOOLS } from "@/lib/ai-tools-meta";
import { VIDEO_TOOLS } from "@/lib/video-tools-meta";
import { IMAGE_TOOLS as IMG_EXP } from "@/lib/image-tools-meta";
import { THREE_TOOLS } from "@/lib/three-tools-meta";
import { CONVERT_PAIRS } from "@/lib/convert-pairs";
import { RESIZE_PRESETS } from "@/lib/resize-presets";
import { BG_USE_CASES } from "@/lib/removebg-usecases";
import { PASSPORT_SIZES } from "@/lib/passport-sizes";

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
  { title: "Document Scanner", href: "/document-scanner", group: "Pages", keywords: "document scanner scan id card passport a4 pdf straighten deskew perspective phone photo skanner skanirovat pasport spravka hujjat skaner" },
  { title: "QR Code Statistics (sourced)", href: "/qr-code-statistics", group: "Pages", keywords: "qr code statistics data research numbers scans payments adoption 2026 report sourced citation" },
  { title: "Free QR Generators Compared (20 checked)", href: "/free-qr-code-generator-comparison", group: "Pages", keywords: "free qr code generator comparison best no expiration expire watermark scan limit sign up trial catch tested vs alternatives review" },
  { title: "Video & Audio Downloader", href: "/downloader", group: "Pages", keywords: "tiktok instagram vk downloader video audio mp3 mp4 save reels download skachat yuklab olish" },
  { title: "Embeddable Downloader Widget", href: "/widgets", group: "Pages", keywords: "embed widget iframe downloader website blog wordpress add tool" },
  { title: "TikTok Downloader (No Watermark)", href: "/downloader/tiktok", group: "Pages", keywords: "tiktok no watermark download video mp3 sound skachat" },
  { title: "Instagram Reels Downloader", href: "/downloader/instagram", group: "Pages", keywords: "instagram reels photo download ig mp3 save" },
  { title: "VK Video Downloader", href: "/downloader/vk", group: "Pages", keywords: "vk vkontakte video clip skachat download" },
  { title: "Facebook Video Downloader", href: "/downloader/facebook", group: "Pages", keywords: "facebook fb watch reels video download" },
  { title: "X / Twitter Video Downloader", href: "/downloader/twitter", group: "Pages", keywords: "twitter x video gif download save" },
  { title: "Reddit Video Downloader", href: "/downloader/reddit", group: "Pages", keywords: "reddit video sound vredd download" },
  { title: "Pinterest Downloader", href: "/downloader/pinterest", group: "Pages", keywords: "pinterest pin video image download" },
  { title: "SoundCloud to MP3", href: "/downloader/soundcloud", group: "Pages", keywords: "soundcloud mp3 track music download" },
  { title: "OK.ru Video Downloader", href: "/downloader/ok", group: "Pages", keywords: "odnoklassniki ok ru video skachat download" },
  { title: "Rutube Downloader", href: "/downloader/rutube", group: "Pages", keywords: "rutube video skachat download mp4 рутуб" },
  { title: "Telegram Video Downloader", href: "/downloader/telegram", group: "Pages", keywords: "telegram t.me channel video photo skachat download телеграм" },
  { title: "Скачать видео (RU)", href: "/ru/downloader", group: "Pages", keywords: "скачать видео тикток вк рилс одноклассники загрузчик ru russian" },
  { title: "Video yuklab olish (UZ)", href: "/uz/downloader", group: "Pages", keywords: "video yuklab olish tiktok instagram vk yuklash uzbek uz suv belgisisiz" },
  { title: "PDF в Word (RU)", href: "/ru/pdf-to-word", group: "Pages", keywords: "pdf в word конвертировать пдф ворд ru" },
  { title: "PDF'ni Word'ga (UZ)", href: "/uz/pdf-to-word", group: "Pages", keywords: "pdf word aylantirish uz pdf ni word ga" },
  { title: "Удалить фон (RU)", href: "/ru/background-remover", group: "Pages", keywords: "удалить фон убрать фон png ru" },
  { title: "Fon o'chirish (UZ)", href: "/uz/background-remover", group: "Pages", keywords: "fon o'chirish rasm fonini uz" },
  { title: "Объединить PDF (RU)", href: "/ru/merge", group: "Pages", keywords: "объединить соединить pdf ru" },
  { title: "Сжать PDF (RU)", href: "/ru/compress", group: "Pages", keywords: "сжать уменьшить pdf ru" },
  { title: "Текст с картинки (RU)", href: "/ru/image-to-text", group: "Pages", keywords: "текст с картинки ocr распознать ru" },
  { title: "Конвертер изображений (RU)", href: "/ru/convert", group: "Pages", keywords: "конвертер изображений поменять формат фото png jpg webp avif tiff ru" },
  { title: "Rasm konverteri (UZ)", href: "/uz/convert", group: "Pages", keywords: "rasm konverteri format o'zgartirish png jpg webp avif tiff uz" },
  { title: "Размеры изображений (RU)", href: "/ru/resize", group: "Pages", keywords: "изменить размер изображения фото размеры пиксели документы печать ru" },
  { title: "Rasm o'lchamlari (UZ)", href: "/uz/resize", group: "Pages", keywords: "rasm o'lchamini o'zgartirish surat o'lchamlari piksel hujjat bosma uz" },
  { title: "PNG в JPG (RU)", href: "/ru/convert/png-to-jpg", group: "Pages", keywords: "png в jpg конвертер онлайн ru" },
  { title: "JPG в PNG (RU)", href: "/ru/convert/jpg-to-png", group: "Pages", keywords: "jpg в png конвертер ru" },
  { title: "PNG dan JPG (UZ)", href: "/uz/convert/png-to-jpg", group: "Pages", keywords: "png jpg aylantirish rasm konverter uz" },
  { title: "WebP в PNG (RU)", href: "/ru/convert/webp-to-png", group: "Pages", keywords: "webp в png конвертер ru" },
  { title: "Фото 35x45 мм (RU)", href: "/ru/resize/413x531", group: "Pages", keywords: "фото на документы паспорт виза 35x45 размер ru" },
  { title: "Hujjat fotosi 35x45 (UZ)", href: "/uz/resize/413x531", group: "Pages", keywords: "hujjat fotosi pasport viza 35x45 o'lcham uz" },
  { title: "Размер 1920x1080 (RU)", href: "/ru/resize/1920x1080", group: "Pages", keywords: "изменить размер фото 1920x1080 обои full hd ru" },
  { title: "Фото 10x15 см (RU)", href: "/ru/resize/1200x1800", group: "Pages", keywords: "печать фото 10x15 см размер пикселей ru" },
  { title: "Rasm o'lchami 1920x1080 (UZ)", href: "/uz/resize/1920x1080", group: "Pages", keywords: "rasm o'lchamini o'zgartirish 1920x1080 fon uz" },
  { title: "QRix vs iLovePDF", href: "/compare/qrix-vs-ilovepdf", group: "Pages", keywords: "ilovepdf alternative comparison vs pdf" },
  { title: "QRix vs TinyWow", href: "/compare/qrix-vs-tinywow", group: "Pages", keywords: "tinywow alternative comparison vs tools" },
  { title: "QRix vs SnapTik", href: "/compare/qrix-vs-snaptik", group: "Pages", keywords: "snaptik alternative comparison vs tiktok downloader" },
  { title: "Barcode Generator", href: "/barcode", group: "Pages", keywords: "ean upc code128 barcode shtrix pdf417 aztec datamatrix 13 types" },
  { title: "PDF417 Generator", href: "/barcode/pdf417", group: "Pages", keywords: "pdf417 2d stacked barcode driver license id card boarding pass shipping label" },
  { title: "Aztec Code Generator", href: "/barcode/aztec-code", group: "Pages", keywords: "aztec code 2d barcode train ticket boarding pass no quiet zone iso 24778" },
  { title: "Data Matrix Generator", href: "/barcode/data-matrix", group: "Pages", keywords: "data matrix datamatrix 2d square barcode pharma serialisation part marking gs1 iso 16022" },
  { title: "Code 128 Generator", href: "/barcode/code-128", group: "Pages", keywords: "code128 code 128 gs1-128 logistics inventory warehouse barcode any text" },
  { title: "EAN-13 Generator", href: "/barcode/ean-13", group: "Pages", keywords: "ean13 ean 13 retail product barcode 13 digit checksum packaging gtin" },
  { title: "UPC-A Generator", href: "/barcode/upc-a", group: "Pages", keywords: "upc upc-a 12 digit product barcode us canada retail amazon gtin" },
  { title: "EAN-8 Generator", href: "/barcode/ean-8", group: "Pages", keywords: "ean8 ean 8 short barcode small package 8 digit retail" },
  { title: "Code 39 Generator", href: "/barcode/code-39", group: "Pages", keywords: "code39 code 3 of 9 alphanumeric barcode id badge logmars automotive" },
  { title: "ITF-14 Generator", href: "/barcode/itf-14", group: "Pages", keywords: "itf14 itf 14 carton case code shipping box gtin-14 bearer bar" },
  { title: "Interleaved 2 of 5 Generator", href: "/barcode/interleaved-2-of-5", group: "Pages", keywords: "interleaved 2 of 5 itf i2of5 numeric barcode warehouse distribution" },
  { title: "MSI Barcode Generator", href: "/barcode/msi-barcode", group: "Pages", keywords: "msi plessey shelf label inventory barcode retail stock" },
  { title: "Pharmacode Generator", href: "/barcode/pharmacode", group: "Pages", keywords: "pharmacode laetus pharmaceutical packaging control binary code" },
  { title: "Codabar Generator", href: "/barcode/codabar", group: "Pages", keywords: "codabar nw-7 monarch blood bank library barcode airbill" },
  { title: "Генератор штрих-кодов (RU)", href: "/ru/barcode", group: "Pages", keywords: "генератор штрих кодов создать штрих код онлайн бесплатно 13 форматов ru" },
  { title: "Shtrix kod generatori (UZ)", href: "/uz/barcode", group: "Pages", keywords: "shtrix kod generatori yaratish onlayn bepul 13 format uz" },
  { title: "Генератор PDF417 (RU)", href: "/ru/barcode/pdf417", group: "Pages", keywords: "генератор pdf417 штрих код водительское удостоверение посадочный талон 2d ru" },
  { title: "Генератор Data Matrix (RU)", href: "/ru/barcode/data-matrix", group: "Pages", keywords: "датаматрикс data matrix генератор маркировка код квадратный 2d ru" },
  { title: "Генератор EAN-13 (RU)", href: "/ru/barcode/ean-13", group: "Pages", keywords: "генератор ean 13 штрих код товара розница создать онлайн ru" },
  { title: "Генератор Code 128 (RU)", href: "/ru/barcode/code-128", group: "Pages", keywords: "генератор code 128 штрих код склад логистика gs1 ru" },
  { title: "PDF417 generatori (UZ)", href: "/uz/barcode/pdf417", group: "Pages", keywords: "pdf417 generatori shtrix kod haydovchilik guvohnomasi 2d uz" },
  { title: "EAN-13 generatori (UZ)", href: "/uz/barcode/ean-13", group: "Pages", keywords: "ean 13 generatori shtrix kod tovar chakana savdo yaratish uz" },
  { title: "Data Matrix generatori (UZ)", href: "/uz/barcode/data-matrix", group: "Pages", keywords: "data matrix generatori kvadrat shtrix kod markirovka dori uz" },
  { title: "Link-in-Bio Page", href: "/link-in-bio", group: "Pages", keywords: "linktree bio links" },
  { title: "QR Poster Maker", href: "/poster", group: "Pages", keywords: "scan me flyer poster" },
  { title: "Bulk QR Generator", href: "/bulk-qr", group: "Pages", keywords: "csv batch mass" },
  { title: "Animated QR Maker", href: "/animated-qr", group: "Pages", keywords: "animated qr video stories reels tiktok shorts scan me mp4 animation" },
  { title: "Promo Video Maker", href: "/promo-video", group: "Pages", keywords: "promo video ad maker reels stories tiktok shorts marketing product launch logo cta mp4 animated" },
  { title: "QRix Brand Film", href: "/promo", group: "Pages", keywords: "qrix promo brand film video about all in one toolkit" },
  { title: "AI QR Art", href: "/qr-art", group: "Pages", keywords: "ai qr code art generator beautiful aesthetic scannable poster background artistic qr" },
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
    { title: "Image Format Converter", href: "/convert", group: "Image Tools" as const, keywords: "convert image format png jpg webp avif bmp gif ico converter" },
    ...CONVERT_PAIRS.map((p) => ({
      title: `${p.from} to ${p.to}`, href: `/convert/${p.slug}`, group: "Image Tools" as const, keywords: p.keywords.join(" "),
    })),
    { title: "Image Resizer (presets)", href: "/resize", group: "Image Tools" as const, keywords: "resize image exact size preset 1920x1080 4k square passport a4 photo size" },
    ...RESIZE_PRESETS.map((p) => ({
      title: `Resize to ${p.w}×${p.h}`, href: `/resize/${p.slug}`, group: "Image Tools" as const, keywords: p.keywords.join(" "),
    })),
    { title: "Background Remover — by what you're cutting out", href: "/remove-background", group: "Image Tools" as const, keywords: "remove background use cases signature logo product photo id photo hair sticker" },
    ...BG_USE_CASES.map((u) => ({
      title: u.title, href: `/remove-background/${u.slug}`, group: "Image Tools" as const, keywords: u.keywords.join(" "),
    })),
    { title: "Passport Photo Size by Country", href: "/passport-photo", group: "Image Tools" as const, keywords: "passport photo size by country visa photo size passport photo maker sourced" },
    ...PASSPORT_SIZES.map((p) => ({
      title: `${p.country} Passport Photo Size — ${p.sizeLabel}`, href: `/passport-photo/${p.slug}`, group: "Image Tools" as const,
      keywords: `${p.country} passport photo size visa photo ${p.sizeLabel}`,
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
/** Query-token synonyms for common shorthand ("remove bg", "img to pdf"…). */
const TOKEN_ALIAS: Record<string, string> = {
  bg: "background", img: "image", pic: "image", foto: "photo", vid: "video",
};

export function searchIndex(q: string, limit = 12, groups?: SearchGroup[]): SearchItem[] {
  const phrase = q.trim().toLowerCase().replace(/\s+/g, " ");
  const tokens = phrase.split(" ").filter(Boolean);
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
      const alt = TOKEN_ALIAS[tok];
      if (ti >= 0) {
        score += 10 - Math.min(9, ti / 4);            // earlier in title = better
        if (ti === 0) score += 4;                     // prefix bonus
        if (title === tok) score += 8;                // exact title
      } else if (keys.includes(tok)) {
        score += 3;
      } else if (alt && (title.includes(alt) || keys.includes(alt))) {
        score += 3;                                   // synonym match
      } else { ok = false; break; }
    }
    if (ok) {
      // typing the tool's name in order beats same-token anagrams
      // ("jpg to pdf" must rank JPG to PDF above PDF to JPG)
      if (tokens.length > 1 && title.includes(phrase)) score += 25;
      if (item.group === "Blog") score -= 3;          // tools outrank guides
      scored.push({ item, score });
    }
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
