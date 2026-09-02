import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // "/p$" not "/p": robots rules are prefix matches, so a bare "/p" was
      // blocking every path that starts with /p — all 21 /pdf-tools pages,
      // /pricing, /privacy, /promo, /promo-video and /poster (27 sitemap URLs)
      // were uncrawlable while the sitemap submitted them. "$" (honored by
      // Google/Bing/Yandex) pins the rule to the exact /p short-link page.
      // "/pin" stays out of crawl deliberately — the gate was covered by the
      // old prefix and must not start ranking.
      /* "/api/og" is allowed back in, and it matters more than it looks.
         lib/seo.ts builds EVERY page's og:image and twitter:image as
         /api/og?t=<title>, so blocking /api/ blocked the preview card for the
         whole site. Crawlers that respect robots — Google, Bing, and the
         social and AI fetchers that render link previews — were being told not
         to fetch the one image each page advertises.

         Allow wins over Disallow on the longer match in Google's and Bing's
         implementations, which is why the specific rule sits alongside the
         broad one rather than replacing it. Everything else under /api/ stays
         out: those are endpoints, not documents. */
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/dashboard", "/api/", "/r/", "/p$", "/pin", "/s/", "/login", "/register", "/settings", "/account", "/history", "/favorites", "/admin", "/workspace"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
