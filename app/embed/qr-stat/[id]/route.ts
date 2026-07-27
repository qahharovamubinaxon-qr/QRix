import { ALL_STATS } from "@/lib/qr-stats";
import { renderStatEmbed } from "@/lib/qr-stat-embed";
import { SITE_URL } from "@/lib/seo";

/* One citable statistic as a bare iframe-able card. A Route Handler, not a page:
   a page renders inside the root layout and would carry TopNav, the cookie
   banner, GoogleAnalytics and 727 KB of script onto the embedder's site (M141).
   The document lib/qr-stat-embed.ts returns is the entire response.

   Registry-backed and fully enumerated, so unknown ids 404 rather than render an
   empty card at 200 (M118). Framing is allowed by next.config.ts, which scopes
   `frame-ancestors *` to /embed/* and drops X-Frame-Options there.

   noindex is an X-Robots-Tag header and a <meta> in the document: /qr-code-
   statistics carries the SEO, and an indexable card would compete with it. */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_STATS.map((s) => ({ id: s.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = ALL_STATS.find((x) => x.id === id);

  if (!s) {
    return new Response("Unknown statistic.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" },
    });
  }

  return new Response(renderStatEmbed(s, SITE_URL), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
