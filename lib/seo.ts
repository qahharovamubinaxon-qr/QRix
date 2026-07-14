import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://qrix.uz").replace(/\/$/, "");
export const SITE_NAME = "QRix";
export const SITE_TAGLINE = "Free QR Code, PDF & Image Tools";
export const SITE_DESCRIPTION =
  "QRix is an all-in-one toolkit: generate dynamic QR codes with logos & analytics, plus 25+ free PDF tools (merge, split, compress, convert, OCR, sign) and image tools — fast, secure and right in your browser.";

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
      // No images override → Next's file-based app/opengraph-image.tsx (generated
      // 1200×630) applies to every page. Prevents referencing a missing /og.png.
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
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
