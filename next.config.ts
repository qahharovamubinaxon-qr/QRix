import type { NextConfig } from "next";

// Security headers applied to every response.
const securityHeaders = [
  // Clickjacking protection (no one can iframe the site except us)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // Stop MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to other sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful APIs (camera only for the QR scanner)
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()" },
  // Force HTTPS once deployed (ignored on http://localhost)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // hide "X-Powered-By: Next.js"
  compress: true,
  output: process.env.DOCKER_BUILD ? "standalone" : undefined, // Docker image runs standalone server.js
  async headers() {
    // /embed/* is meant to be iframed by ANY site (the distribution play), so
    // it drops the frame-blocking headers. The catch-all uses a negative
    // lookahead to EXCLUDE /embed — otherwise it would re-add X-Frame-Options
    // (a later rule can override a key but can't remove one another rule set).
    const embeddable = securityHeaders.filter(
      (h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy",
    );
    return [
      { source: "/embed/:path*", headers: [...embeddable, { key: "Content-Security-Policy", value: "frame-ancestors *" }] },
      { source: "/((?!embed/).*)", headers: securityHeaders },
      // Self-hosted fonts live in public/, which Next serves must-revalidate by
      // default — that is a 304 round trip in front of first paint on every
      // repeat visit, which defeats the point of self-hosting them. Their names
      // are content-stable (scripts/fetch-fonts.mjs writes the same filename for
      // a given family/style/weight/subset), so if a family is ever swapped the
      // path has to change with it or cached clients keep the old face.
      {
        source: "/fonts/:file*.woff2",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Everything ELSE in public/ had the same defect and it was never fixed:
      // measured live on 2026-07-28, /scenes/bunny-hero.webp — the homepage LCP
      // element, preloaded with fetchPriority=high — served
      // "public, max-age=0, must-revalidate", and so did /world-dots.svg (206 KB,
      // also preloaded) and both 1.2 MB copies of the pdf.js worker. So every
      // repeat visitor paid a revalidation round trip in front of the LCP paint,
      // and every PDF tool visit re-validated 1.2 MB.
      //
      // These names are NOT content-hashed, so `immutable` is wrong here in a way
      // it is not wrong for the fonts: bunny-hero.webp was re-encoded during M136
      // and a year-long immutable cache would have stranded returning visitors on
      // the old bytes with no way to push the new ones. stale-while-revalidate
      // buys the whole repeat-visit win without that trap — the browser paints
      // from cache instantly and refreshes in the background — so a re-encode
      // still reaches everyone, one visit later.
      //
      // Listed explicitly rather than by extension glob: a broad "/:file*.png"
      // would also match /_next/static/*, which the framework already serves
      // immutable, and weakening that would be a regression.
      //
      // Deliberately ABSENT, each for its own reason:
      //   sw.js  — a long-cached service worker cannot be updated.
      //   llms.txt, c3bb…txt — content/verification files that must stay live;
      //     the IndexNow key in particular has to be fetchable on demand.
      //   /sdk/qrix.js — see the separate, much shorter rule below.
      ...[
        "/scenes/:file*",
        "/world-dots.svg",
        "/bot-avatar.png",
        "/qrix-logo.png",
        "/qrix-brand-film.mp4",
        "/qrix-brand-film-poster.jpg",
        "/pdf.worker.min.js",
        "/pdf.worker.min.mjs",
      ].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=31536000" },
        ],
      })),
      // The embed SDK is the one asset we do NOT control the refresh of: it runs
      // inside other people's pages, so a bad build cannot be pulled by editing
      // our own HTML. Under the 30-day rule above a fix would not even be
      // REVALIDATED for a month — max-age is hard freshness, and SWR only starts
      // after it expires. Ten minutes of hard freshness still removes the
      // round trip from the common case (a visitor loading several pages of the
      // same embedding site), while a week of SWR keeps it painting instantly
      // from cache; a fix then lands on the next load rather than in 30 days.
      {
        source: "/sdk/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=600, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
  // Old stub URLs (a heading, no generator) → the real tools. A config redirect
  // is a true edge 308: no HTML page is served and no meta-refresh, so crawlers
  // consolidate the ranking signal cleanly onto the working page. The app/url-qr
  // and app/vcard-qr pages are removed since this takes precedence.
  async redirects() {
    return [
      { source: "/url-qr", destination: "/qr-tools/url", permanent: true },
      { source: "/vcard-qr", destination: "/qr-tools/vcard", permanent: true },
      // same stub family: heading-only pages with the homepage canonical, and
      // every /use/* how-to CTA links /wifi-qr — the 308 sends that equity to
      // the real tool without touching 200+ content pages
      { source: "/wifi-qr", destination: "/qr-tools/wifi", permanent: true },
      { source: "/email-qr", destination: "/qr-tools/email", permanent: true },
      { source: "/sms-qr", destination: "/qr-tools/sms", permanent: true },
      { source: "/telegram-qr", destination: "/qr-tools/telegram", permanent: true },
      { source: "/whatsapp-qr", destination: "/qr-tools/whatsapp", permanent: true },
    ];
  },
};

export default nextConfig;
