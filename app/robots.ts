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
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/", "/r/", "/p$", "/pin", "/login", "/register", "/settings", "/account", "/history", "/favorites", "/admin", "/workspace"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
