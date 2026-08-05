/* "Keep reading" links for a blog article. SERVER ONLY — it reads Supabase.
 *
 * WHY THIS EXISTS. app/blog/[slug]/page.tsx resolved the post itself from BOTH
 * sources:
 *
 *     const post = getPost(slug) || (await getAutopilotPost(slug));
 *     const related = post.related.map((s) => _get(s)).filter(Boolean);
 *
 * ...and its related posts from the STATIC REGISTRY ALONE. Autopilot posts live
 * in Supabase, publish daily without a deploy, and name other autopilot posts as
 * their related reading — so every one of those lookups returned undefined, the
 * filter dropped them all, `related.length` was 0 and the whole "Keep reading"
 * section silently did not render. Measured on production 2026-08-05:
 * /blog/merge-pdf-files-free contained ZERO /blog/* links while its own record
 * named two. That is the newest ~40 posts sitting as crawl islands, and it looks
 * exactly like a post that simply has no related reading.
 *
 * The second half is that `related` holds one to three slugs, so even fully
 * resolved it cannot reach the six-internal-links target P0 asks for. Anything
 * short tops up from the same category, then from anything else, newest first,
 * rotated by the post's own slug so the blog's links spread instead of every
 * article pointing at the same handful of recent posts.
 */

import type { BlogPost } from "@/lib/blog";
import { getPost, allPostsSorted } from "@/lib/blog";
import { getAutopilotPosts } from "@/lib/server/autopilot";

export type RelatedPost = { slug: string; title: string };

/** Stable across rebuilds — these pages are ISR-regenerated. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Rotate a pool by a seed and take n, so different posts draw different slices. */
function take<T>(from: T[], n: number, seed: string): T[] {
  if (n <= 0 || !from.length) return [];
  if (from.length <= n) return from;
  const start = hash(seed) % from.length;
  return Array.from({ length: n }, (_, i) => from[(start + i) % from.length]);
}

/**
 * Resolve a post's related reading, topped up to `want` entries.
 *
 * ONE Supabase read for the whole page, not one per slug: the declared related
 * slugs and the top-up pool both come out of the same list.
 */
export async function relatedPosts(post: BlogPost, want = 6): Promise<RelatedPost[]> {
  const autopilot = await getAutopilotPosts();
  const byslug = new Map<string, BlogPost>();
  for (const p of autopilot) byslug.set(p.slug, p);

  /* The declared ones first and IN ORDER — they are an editorial choice and the
     top-up must not reorder them. Static registry wins on a slug collision,
     matching how the page resolves the article itself. */
  const out: RelatedPost[] = [];
  const seen = new Set<string>([post.slug]);
  for (const s of post.related) {
    const p = getPost(s) || byslug.get(s);
    if (p && !seen.has(p.slug)) { seen.add(p.slug); out.push({ slug: p.slug, title: p.title }); }
  }
  if (out.length >= want) return out.slice(0, want);

  /* Top up: same category first, since a PDF article linking PDF articles is
     worth more to a reader and to a crawler mapping the site's topics. */
  const pool = [...allPostsSorted(), ...autopilot].filter((p) => p && p.slug && !seen.has(p.slug));
  const sameCategory = pool.filter((p) => p.category === post.category);
  const rest = pool.filter((p) => p.category !== post.category);

  for (const group of [sameCategory, rest]) {
    if (out.length >= want) break;
    for (const p of take(group, want - out.length, post.slug + group.length)) {
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      out.push({ slug: p.slug, title: p.title });
    }
  }
  return out.slice(0, want);
}
