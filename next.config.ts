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
    // /embed/* is meant to be iframed by ANY site (that's the distribution
    // play), so it opts out of the frame-blocking headers. Everything else
    // keeps clickjacking protection.
    const embeddable = securityHeaders.filter(
      (h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy",
    );
    return [
      { source: "/embed/:path*", headers: [...embeddable, { key: "Content-Security-Policy", value: "frame-ancestors *" }] },
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
