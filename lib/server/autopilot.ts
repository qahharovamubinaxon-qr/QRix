/**
 * QRix Autopilot — the site's autonomous growth engine. SERVER ONLY.
 *
 * Two safe, fully-automatable pillars run on cron:
 *   1. Auto-blog     — writes a fresh SEO article each day with the free AI
 *                      backend and publishes it to the blog (Supabase-backed,
 *                      surfaced via ISR). Never publishes junk: if the AI is
 *                      unavailable or returns invalid content, it skips.
 *   2. Health watchdog (see app/api/cron/watchdog) — checks every subsystem
 *                      and pings the owner on Telegram when something degrades.
 *
 * Everything here is ENV-GATED: with no Supabase configured, getAutopilotPosts()
 * returns [] and the blog is byte-for-byte unchanged. Nothing auto-touches code
 * or deploys — that stays human-in-the-loop by design (see AUTOPILOT.md).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BlogPost } from "@/lib/blog";
import { POSTS } from "@/lib/blog";
import { runAiTask } from "./ai/manager";
import { notifyOwner } from "./telegram/notify";

const TABLE = "autopilot_posts";

/** Guarded Supabase client — null when env is absent (keeps the blog static). */
function sb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try { return createClient(url, key); } catch { return null; }
}

export function autopilotConfigured(): boolean {
  return !!sb();
}

// ── Topic queue ──────────────────────────────────────────────────────────
// High-intent SEO topics QRix should own, each tied to a real tool. Ordered by
// priority; the autopilot publishes the first one not already live. Extend this
// list any time — new topics are picked up automatically.
type Topic = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: BlogPost["category"];
  toolHref: string;
  toolLabel: string;
  angle: string; // guidance for the writer
  related: string[];
};

export const AUTOPILOT_TOPICS: Topic[] = [
  {
    slug: "are-qr-codes-safe-quishing",
    title: "Are QR Codes Safe? How to Spot a Quishing Scam Before You Scan",
    description: "QR phishing (“quishing”) is rising fast. Learn how to check where a QR code really goes and spot scams before you scan — with a free safety checker.",
    keywords: ["are qr codes safe", "qr code scam", "quishing", "is this qr code safe", "qr phishing"],
    category: "QR Codes", toolHref: "/qr-tools/decode", toolLabel: "Check a QR code safely",
    angle: "Explain quishing, real-world examples (fake parking meters, fake payment stickers), the warning signs (shorteners, look-alike domains, http, IP hosts), and how QRix's decoder shows the real destination and a risk verdict BEFORE opening. Reassuring, practical, no fear-mongering.",
    related: ["what-is-a-dynamic-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "qr-code-that-never-expires",
    title: "Do QR Codes Expire? How to Make One That Lasts Forever (Free)",
    description: "Many “free” QR tools quietly deactivate your code after a trial. Here's how QR code expiry actually works and how to create one that never expires.",
    keywords: ["do qr codes expire", "qr code expiration", "qr code that never expires", "permanent qr code", "free qr code no expiration"],
    category: "QR Codes", toolHref: "/free-forever", toolLabel: "Make a permanent QR code",
    angle: "Clarify static vs dynamic and WHY some tools expire codes (they gate the redirect behind a subscription). Show how to avoid the bait-and-switch and make a static code that literally never expires. Honest about the trade-offs of dynamic codes.",
    related: ["what-is-a-dynamic-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "ai-qr-code-art-generator",
    title: "AI QR Code Art: Turn a Boring Code Into a Scannable Poster",
    description: "Create beautiful, on-brand AI QR code art that still scans — for free. A step-by-step guide to artistic QR codes that get more scans.",
    keywords: ["ai qr code art", "qr code art generator", "artistic qr code", "custom qr code design", "beautiful qr code"],
    category: "AI", toolHref: "/qr-art", toolLabel: "Create AI QR art",
    angle: "Explain why plain codes underperform, how AI art backgrounds lift scan rates, and the golden rule: keep high error-correction and contrast so it still scans. Walk through QRix's free AI QR Art tool.",
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "upi-qr-code-for-payments",
    title: "How to Create a UPI QR Code for Payments (Free, No App)",
    description: "Accept UPI payments with a free QR code — for your shop, stall or invoice. Step-by-step, works with any UPI app, no signup.",
    keywords: ["upi qr code", "upi qr code generator", "create upi qr", "qr code for payment india", "upi payment qr"],
    category: "QR Codes", toolHref: "/qr-tools/upi", toolLabel: "Create a UPI QR code",
    angle: "Explain the upi:// payment format (payee VPA, name, amount, note), where to print it, and safety tips. Practical for Indian merchants and freelancers.",
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "gs1-digital-link-qr-code",
    title: "GS1 Digital Link QR Codes: The 2027 Retail Standard, Explained",
    description: "GS1 Digital Link turns one QR code into a product's barcode, webpage and traceability record. Here's what it is and how to create one free.",
    keywords: ["gs1 digital link", "gs1 qr code", "digital link qr", "product qr code", "gs1 sunrise 2027"],
    category: "QR Codes", toolHref: "/qr-tools/gs1-digital-link", toolLabel: "Create a GS1 Digital Link",
    angle: "Explain GS1 Digital Link, the 2027 'Sunrise' migration from EAN barcodes, GTIN + batch/serial/expiry, and how brands can start now for free with QRix.",
    related: ["how-to-create-a-qr-code"],
  },
  /* ── low-competition niches Search Console already shows working
        (AI / 3D / downloader long-tails get impressions faster than
        head QR terms) — prioritized right after the launch batch ── */
  {
    slug: "free-ai-avatar-generator-no-signup",
    title: "Free AI Avatar Generator: Turn a Selfie into a Profile Picture (No Signup)",
    description: "Make an AI avatar from any photo — cartoon, anime, cyberpunk and more styles. Free, no signup, no watermark, works in the browser.",
    keywords: ["ai avatar generator", "free ai avatar", "ai profile picture maker", "photo to avatar", "ai avatar from photo no signup"],
    category: "AI", toolHref: "/ai-tools/avatar-generator", toolLabel: "Create your AI avatar",
    angle: "Search Console shows this exact query rising. Cover: what makes a good source selfie, style choices (cartoon/anime/realistic), where avatars work best (Telegram, Instagram, LinkedIn), privacy (photo processed then discarded). Position QRix vs signup-walled competitors.",
    related: ["ai-image-tools-free"],
  },
  {
    slug: "image-to-3d-model-online-free",
    title: "Image to 3D Model Online: Turn Any Photo into a 3D Object (Free)",
    description: "Convert a single photo into a textured 3D model you can rotate and export as GLB, OBJ or STL — free and in your browser, no software needed.",
    keywords: ["image to 3d", "image to 3d model", "photo to 3d model free", "2d to 3d converter online", "picture to 3d model"],
    category: "AI", toolHref: "/3d-tools/image-to-3d", toolLabel: "Convert your image to 3D",
    angle: "This query already earned our first click. Explain how single-image 3D works (AI depth + mesh), what photos convert best, export formats (GLB for web/AR, STL for 3D printing, USDZ for iPhone AR), and a mini-tutorial with the QRix 3D studio.",
    related: ["free-ai-avatar-generator-no-signup"],
  },
  {
    slug: "ai-image-denoiser-online",
    title: "AI Image Denoiser: Clean Grainy, Noisy Photos Online Free",
    description: "Remove grain and noise from low-light photos with AI — free online denoiser, no signup, full resolution kept.",
    keywords: ["ai image denoiser", "remove noise from photo", "denoise image online", "fix grainy photos", "photo noise reduction free"],
    category: "AI", toolHref: "/ai-tools/image-denoiser", toolLabel: "Denoise a photo",
    angle: "Search Console shows impressions for this. Cover why night photos get noisy (ISO), AI vs classic blur denoising, before/after expectations, and when to also use the upscaler. Practical, phone-photographer-friendly.",
    related: ["free-ai-avatar-generator-no-signup", "image-to-3d-model-online-free"],
  },
  {
    slug: "tiktok-video-download-without-watermark",
    title: "How to Download TikTok Videos Without the Watermark (Free, 2026)",
    description: "Save any public TikTok in HD with no watermark, or keep just the sound as MP3 — free, no app, works on iPhone, Android and PC.",
    keywords: ["download tiktok without watermark", "tiktok video download no watermark", "save tiktok no logo", "tiktok downloader hd free", "tiktok sound to mp3"],
    category: "Guides", toolHref: "/downloader/tiktok", toolLabel: "Download a TikTok (no watermark)",
    angle: "Step-by-step with the share-link flow, why the watermark disappears (separate CDN rendition), saving sounds as MP3, and the legal/etiquette note (personal use, credit creators). Mention it also works with vt.tiktok.com short links.",
    related: ["instagram-reels-download-mp3"],
  },
  {
    slug: "instagram-reels-download-mp3",
    title: "Download Instagram Reels as Video or MP3: The Complete Guide",
    description: "Save public Reels in HD or extract just the audio as MP3 — free online, no login, on any device.",
    keywords: ["download instagram reels", "instagram reels to mp3", "save reels audio", "instagram video downloader free", "reels download hd"],
    category: "Guides", toolHref: "/downloader/instagram", toolLabel: "Download a Reel",
    angle: "Cover both video and the MP3 audio-extraction use case (saving trending sounds), photo posts and carousels, why login is never needed for public posts, and troubleshooting (private accounts, region locks).",
    related: ["tiktok-video-download-without-watermark"],
  },
  {
    slug: "bulk-qr-code-generator-csv",
    title: "How to Generate Hundreds of QR Codes at Once from a CSV",
    description: "Create QR codes in bulk from a spreadsheet — for tickets, assets, tables or products. Free, no signup, download them all at once.",
    keywords: ["bulk qr code generator", "qr codes from csv", "batch qr code", "mass qr code generator", "generate multiple qr codes"],
    category: "QR Codes", toolHref: "/bulk-qr", toolLabel: "Generate QR codes in bulk",
    angle: "Show the CSV workflow (one row per code), naming/organising the output, print tips, and use cases: event tickets, table numbers, asset tags, product labels.",
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "qr-code-analytics-tracking",
    title: "How to Track QR Code Scans (Analytics That Actually Work)",
    description: "Measure who scans your QR code, where and when — and attribute conversions. A practical guide to dynamic QR analytics, free.",
    keywords: ["qr code analytics", "track qr code scans", "qr code tracking", "qr code scan statistics", "dynamic qr code tracking"],
    category: "QR Codes", toolHref: "/qr-tools/url", toolLabel: "Create a trackable QR code",
    angle: "Explain dynamic codes, what you can measure (scans, location, device, time), UTM pass-through into Google Analytics for conversion attribution, and how to read the data to improve campaigns.",
    related: ["what-is-a-dynamic-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "vcard-qr-code-business-card",
    title: "vCard QR Codes: The Digital Business Card That Saves to Contacts",
    description: "Put a QR code on your card, badge or email signature so anyone can save your details in one tap. Create a free vCard QR code.",
    keywords: ["vcard qr code", "qr code business card", "digital business card qr", "contact qr code", "qr code for contact details"],
    category: "QR Codes", toolHref: "/qr-tools/vcard", toolLabel: "Create a vCard QR code",
    angle: "Explain vCard QR codes, what fields to include, where to place them (badges, signatures, cards), and why they beat paper cards. Practical and concise.",
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "svg-qr-code-for-print",
    title: "Why You Should Use an SVG QR Code for Print (and How)",
    description: "Blurry QR codes fail to scan. Use a crisp, infinitely scalable SVG for posters, packaging and signage — free, with logo and colours.",
    keywords: ["svg qr code", "qr code for print", "high resolution qr code", "vector qr code", "printable qr code"],
    category: "QR Codes", toolHref: "/qr-tools/design", toolLabel: "Design a print-ready QR code",
    angle: "Explain raster vs vector, why SVG/PDF stays sharp at any size, minimum print sizes, quiet zones, contrast, and QRix's free SVG/PDF export with eye shapes and gradients.",
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "qr-code-for-instagram",
    title: "How to Make a QR Code for Your Instagram (Grow Followers Offline)",
    description: "Turn posters, packaging and cards into Instagram followers with a free QR code that opens your profile instantly. Step-by-step.",
    keywords: ["qr code for instagram", "instagram qr code", "qr code to instagram profile", "social media qr code", "grow instagram followers"],
    category: "QR Codes", toolHref: "/qr-tools/url", toolLabel: "Create an Instagram QR code",
    angle: "Show how to link a QR to an IG profile, creative placements (packaging, receipts, events), and tracking scans to see what drives follows. Upbeat and practical.",
    related: ["how-to-create-a-qr-code"],
  },
];

// ── Reading (blog integration) ─────────────────────────────────────────────
/** All published autopilot posts, newest first. [] when Supabase is off. */
export async function getAutopilotPosts(): Promise<BlogPost[]> {
  const client = sb();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from(TABLE)
      .select("data")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error || !data) return [];
    return data.map((r) => (r as { data: BlogPost }).data).filter((p) => p && p.slug);
  } catch {
    return [];
  }
}

/** A single autopilot post by slug, or undefined. */
export async function getAutopilotPost(slug: string): Promise<BlogPost | undefined> {
  const client = sb();
  if (!client) return undefined;
  try {
    const { data, error } = await client.from(TABLE).select("data").eq("slug", slug).single();
    if (error || !data) return undefined;
    return (data as { data: BlogPost }).data;
  } catch {
    return undefined;
  }
}

// ── Writing (cron) ──────────────────────────────────────────────────────────
const readMins = (post: Pick<BlogPost, "intro" | "sections">) => {
  const words = (post.intro + " " + post.sections.map((s) => s.p.join(" ")).join(" ")).split(/\s+/).length;
  return Math.max(3, Math.round(words / 200));
};

/** Extract the first balanced JSON object from a model reply. */
function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return null; }
}

/** Ask the AI to write the article body. Returns null if unusable (never junk). */
async function writeArticle(topic: Topic): Promise<BlogPost | null> {
  const prompt = `You are a senior SEO content writer for QRix, a free on-device QR/PDF/image/AI tools site.
Write a genuinely helpful, accurate, original article. Do NOT invent statistics, prices or fake quotes.
Topic: "${topic.title}"
Primary keywords: ${topic.keywords.join(", ")}
Angle: ${topic.angle}
The article must naturally recommend this free QRix tool: ${topic.toolLabel} (${topic.toolHref}).

Return ONLY valid JSON (no prose, no code fences) with this exact shape:
{
  "description": "meta description, 140-160 chars, includes the primary keyword",
  "intro": "2-3 sentence opening paragraph that hooks the reader",
  "sections": [ { "h": "H2 heading", "p": ["paragraph", "paragraph"] } ],
  "faqs": [ { "q": "question", "a": "concise answer" } ]
}
Rules: 4 to 5 sections, each with 1-3 short paragraphs; 4 FAQs; clear, warm, plain English; no markdown inside strings.`;

  let text = "";
  try {
    const res = await runAiTask("text", { prompt }, { cacheTtl: 0 });
    text = (res?.text || "").trim();
  } catch {
    return null;
  }
  const parsed = extractJson(text) as {
    description?: string; intro?: string;
    sections?: { h?: string; p?: string[] }[]; faqs?: { q?: string; a?: string }[];
  } | null;
  if (!parsed) return null;

  const sections = (parsed.sections || [])
    .map((s) => ({ h: String(s.h || "").trim(), p: (s.p || []).map((x) => String(x).trim()).filter(Boolean) }))
    .filter((s) => s.h && s.p.length);
  const faqs = (parsed.faqs || [])
    .map((f) => ({ q: String(f.q || "").trim(), a: String(f.a || "").trim() }))
    .filter((f) => f.q && f.a);
  const intro = String(parsed.intro || "").trim();
  // Quality gate — refuse to publish thin content.
  if (sections.length < 3 || faqs.length < 2 || intro.length < 60) return null;

  const post: BlogPost = {
    slug: topic.slug,
    title: topic.title,
    description: (parsed.description || topic.description).trim().slice(0, 200),
    keywords: topic.keywords,
    category: topic.category,
    date: new Date().toISOString(),
    readMins: 5,
    toolHref: topic.toolHref,
    toolLabel: topic.toolLabel,
    intro,
    sections,
    faqs,
    related: topic.related,
  };
  post.readMins = readMins(post);
  return post;
}

export type AutopilotResult = {
  published: boolean;
  slug?: string;
  title?: string;
  reason?: string;
};

/** Pick the next unpublished topic, write it, and publish it. */
export async function runAutopilot(): Promise<AutopilotResult> {
  const client = sb();
  if (!client) return { published: false, reason: "supabase_not_configured" };

  const existing = new Set(POSTS.map((p) => p.slug));
  for (const p of await getAutopilotPosts()) existing.add(p.slug);
  const topic = AUTOPILOT_TOPICS.find((t) => !existing.has(t.slug));
  if (!topic) return { published: false, reason: "no_pending_topics" };

  const post = await writeArticle(topic);
  if (!post) {
    notifyOwner("autopilot:ai", `🤖 <b>Autopilot</b> skipped “${topic.slug}” — AI unavailable or output rejected by the quality gate.`, 3_600_000);
    return { published: false, reason: "ai_unavailable_or_low_quality" };
  }

  try {
    const { error } = await client.from(TABLE).insert({ slug: post.slug, data: post });
    if (error) return { published: false, reason: `db_error:${error.message}` };
  } catch (e) {
    return { published: false, reason: `db_exception:${(e as Error).message}` };
  }

  // Push the new post live immediately (blog + sitemap) instead of waiting for ISR.
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");
  } catch { /* outside a request scope — hourly ISR still refreshes both */ }

  // Ping Bing + Yandex the moment the article is live (IndexNow, fire-and-forget).
  try {
    const { submitIndexNow } = await import("./indexnow");
    void submitIndexNow([`/blog/${post.slug}`, "/blog"]);
  } catch { /* non-fatal */ }

  notifyOwner(
    "autopilot:pub",
    `✍️ <b>Autopilot published a new article</b>\n<b>${post.title}</b>\n/blog/${post.slug} · ${post.readMins} min · ${post.sections.length} sections`,
    0,
  );
  return { published: true, slug: post.slug, title: post.title };
}
