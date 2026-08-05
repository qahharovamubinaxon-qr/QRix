/* Related-tool links for the tool page template.
 *
 * WHY THIS EXISTS. Measured on production 2026-08-05: every individual tool
 * page carried exactly THREE content links — `/`, `/image-tools`, `/pdf-tools`
 * — and not one link to a sibling tool. The programmatic families were fine
 * (/convert 10, /resize 14, /use 23), so the gap was precisely the template
 * that covers the most routes. Tool pages were leaf nodes: a crawler arriving
 * on /pdf-tools/merge could reach the category hub and nothing else, and the
 * 50-entry mega-menu that used to carry those links site-wide is behind a
 * dynamic import since M163 — a crawler does not hover.
 *
 * THE ROTATION IS THE POINT, not the link count. Rendering the first six
 * siblings on every page in a family would give all 21 PDF pages the SAME six
 * targets, concentrating every internal link on six URLs and leaving the other
 * fifteen exactly as orphaned as before. The window is offset by a hash of the
 * page's own title, so each page links a different slice and the family's links
 * spread evenly across all of it. Deterministic, because these pages are
 * statically generated and a build must reproduce the previous one.
 */

import { buildSearchIndex, type SearchItem } from "@/lib/search-index";

/* Server-only by construction. buildSearchIndex pulls every registry on the
   site (~245 KB — see M138), which is free here and ruinous if this module is
   ever imported from a "use client" file. THE DEFECT IS A REGISTRY CROSSING
   THE CLIENT BOUNDARY (M160); scripts/test-related.mjs asserts it has not. */

/** Family = the first path segment, so siblings are the tools that live beside
 *  this one on disk. Coarser than `group`, and deliberately: the Image Tools
 *  group also contains 40 convert pairs and 25 resize presets, and "Resize to
 *  1920×1080" is not a related tool for the background remover. */
const familyOf = (href: string) => "/" + href.split("/").filter(Boolean)[0];

/** Stable across builds — Math.random() and Date would break SSG reproducibility. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* Title normalisation for self-exclusion. The template is passed a display
   title, not a slug, and the two registries disagree on wording: the page says
   "Add Watermark" where the index says "Watermark PDF", "Add Page Numbers" vs
   "Page Numbers". An equality test silently leaves the page linking to itself,
   which is the one link that is certainly worthless. */
const STOP = new Set(["add", "the", "a", "to", "from", "your", "online", "free", "tool"]);
const tokens = (s: string) =>
  new Set(
    s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ")
      .filter((t) => t && !STOP.has(t)),
  );

function similarity(a: string, b: string): number {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / Math.min(A.size, B.size);
}

export type RelatedTool = { title: string; href: string };

/**
 * Sibling tools to link from a tool page, excluding the page itself.
 *
 * @param categoryHref the family root the template already receives ("/pdf-tools")
 * @param title        the page's display title, used to exclude self and to seed
 *                     the rotation window
 */
export function relatedTools(categoryHref: string, title: string, limit = 8): RelatedTool[] {
  const family = familyOf(categoryHref);
  const pool = buildSearchIndex().filter(
    (i: SearchItem) => familyOf(i.href) === family && i.href !== family,
  );
  if (!pool.length) return [];

  /* Drop the single best title match, and only if it is convincingly the same
     tool. Pages that use this template without being in the index at all
     (/poster, /qr-art, /link-in-bio) must not lose an unrelated sibling to a
     weak match, so this is a threshold and not an argmax. */
  let selfIdx = -1, best = 0.6;
  pool.forEach((i, n) => {
    const s = similarity(title, i.title);
    if (s > best) { best = s; selfIdx = n; }
  });
  const siblings = pool.filter((_, n) => n !== selfIdx);
  if (siblings.length <= limit) return siblings.map(({ title: t, href }) => ({ title: t, href }));

  const start = hash(title) % siblings.length;
  const out: RelatedTool[] = [];
  for (let n = 0; n < limit; n++) {
    const { title: t, href } = siblings[(start + n) % siblings.length];
    out.push({ title: t, href });
  }
  return out;
}
