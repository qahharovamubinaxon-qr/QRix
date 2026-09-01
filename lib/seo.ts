import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://qrixtools.com").replace(/\/$/, "");
export const SITE_NAME = "QRix";
export const SITE_TAGLINE = "Free QR Code, PDF & Image Tools";
export const SITE_DESCRIPTION =
  "QRix is an all-in-one toolkit: 185+ free tools — dynamic QR codes with logos & analytics, 20+ PDF tools (merge, split, compress, convert, OCR, sign), image, video and AI tools — fast, private and right in your browser.";

/** The generic 1200×630 social card (app/opengraph-image.tsx), served at this route.
 *  Used only as a fallback — every real page gets its own card via ogImageUrl(). */
export const OG_IMAGE = `${SITE_URL}/opengraph-image`;

/** Per-page 1200×630 social card naming the page's own title (app/api/og/route.tsx),
 *  instead of every one of the ~840 pages advertising the same generic homepage card. */
export function ogImageUrl(title: string): string {
  return `${SITE_URL}/api/og?t=${encodeURIComponent(title)}`;
}

/** Build per-page metadata with canonical + Open Graph + Twitter. */
export function pageMeta(opts: {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
  /** hreflang alternates, e.g. { en: "/use/en/x", ru: "/use/ru/x", "x-default": "/use/en/x" } (paths or absolute URLs). */
  languages?: Record<string, string>;
}): Metadata {
  const url = SITE_URL + (opts.path || "/");
  const description = opts.description || SITE_DESCRIPTION;
  const languages = opts.languages
    ? Object.fromEntries(Object.entries(opts.languages).map(([k, v]) => [k, v.startsWith("http") ? v : SITE_URL + v]))
    : undefined;
  return {
    title: opts.title,
    description,
    keywords: opts.keywords,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: opts.title,
      description,
      // Next only applies the file-based opengraph-image.tsx to the root route —
      // nested segments do NOT inherit it. So point every page at that generated
      // route explicitly (a real, served 1200×630 PNG). The previous /og.png did
      // not exist, so every non-root page advertised a 404 og:image.
      images: [{ url: ogImageUrl(opts.title), width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
      images: [ogImageUrl(opts.title)],
    },
  };
}

/** Inline JSON-LD script tag for structured data. */
export function jsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}

export function softwareAppLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: SITE_URL + path,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/** HowTo rich result — steps are [heading, body] pairs, matching the tool registries. */
export function howToLd(name: string, description: string, path: string, steps: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime: "PT1M",
    supply: [],
    tool: [],
    step: steps.map(([heading, text], i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: heading,
      text,
      url: `${SITE_URL}${path}#step-${i + 1}`,
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
