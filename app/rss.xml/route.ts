import { allPostsSorted } from "@/lib/blog";
import { getAutopilotPosts } from "@/lib/server/autopilot";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

// ISR (was force-static) so autopilot-published articles reach the feed too.
export const revalidate = 3600;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RSS 2.0 feed of the blog. */
export async function GET() {
  const auto = await getAutopilotPosts();
  const items = [...allPostsSorted(), ...auto]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      <category>${esc(p.category)}</category>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
