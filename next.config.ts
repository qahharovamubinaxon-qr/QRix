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
