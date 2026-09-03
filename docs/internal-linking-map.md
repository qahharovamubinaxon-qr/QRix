# QRix — internal linking map

What links to what, and the rules that keep it intentional rather than a link farm.
Measured from the 3 Sep crawl: **average 31 internal links per page** (min 16, max
115) — dense enough for discovery, not stuffed.

---

## The systems that already build the graph

| System | Source | What it links |
|---|---|---|
| **Related tools** | `lib/related-tools.ts` → `relatedTools(categoryHref, title, limit=8)` | every tool page → up to 8 siblings in its family, by relevance |
| **Breadcrumb** | `ToolPageShell` (schema) + visible trail | tool → category → home, on 841 pages |
| **Category hubs** | `app/<x>-tools/page.tsx` | category → each tool in the family |
| **Top navigation** | `components/TopNav.tsx` | home → all six category hubs, EN/RU/UZ |
| **Convert pairs** | `lib/convert-pairs.ts` | each converter → its inverse (JPG→PNG ⇄ PNG→JPG) |
| **Blog ↔ tool** | `lib/blog.ts` articles | each guide → the tool it explains; tool → guide |
| **Sitemap** | `app/sitemap.ts` | registry-driven; cannot drift from real tools |

## Rules (keep these true)

1. **Every tool page** must reach: its category (breadcrumb), up to 8 related tools,
   and — where one exists — the guide that explains it.
2. **Every guide** links to the relevant tool(s) and 1–2 sibling guides. No guide is
   a dead end.
3. **Natural anchor text.** Use the tool's real name ("HEIC to JPG converter"), not
   repeated exact-match keyword anchors on every page.
4. **No orphan in the sitemap.** If `npm run aeo:audit` reports an orphan, either
   link it from a page a user would actually follow, or drop it from the sitemap.
   (`/widgets` was the last orphan — now linked from `/downloader`.)
5. **Do not** add links for their own sake. 31/page is healthy; pushing toward the
   115 max seen on hub pages on every page would dilute, not help.

## Highest-value link opportunities (manual, worth doing)

These are real internal links that would concentrate authority on the pages that
already earn attention, without inventing content:

| From | To | Why |
|---|---|---|
| `/downloader/vk` (top AI-referral page) | related downloaders (OK.ru, Rutube) | keeps the highest-traffic visitor inside the strongest section |
| Image category hub | `/image-tools/compress`, `/remove-bg` (top impressions) | push hub authority to the winning tools |
| Blog QR guides | `/qr-tools/*` Tier-A pages | connect the "no expiry / no signup" story to the generator |

## Verify

```bash
npm run test:links      # internal-link integrity (scripts/test-internal-links.mjs)
npm run test:related    # related-tools coverage
npm run aeo:audit       # reports any orphan
```
