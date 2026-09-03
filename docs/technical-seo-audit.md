# QRix — Technical SEO audit

**Measured 3 September 2026** against production (`https://qrixtools.com`), by
fetching all 851 sitemap URLs with a crawler and parsing what each returns.
Method: `npm run aeo:audit -- --json .seo-crawl.json` → `scripts/seo-inventory.mjs`.
Every number below is from that crawl; nothing is inferred.

This audit re-runs the checks from the earlier `docs/aeo-audit.md` (2 Sep) plus
the specific problem pages named in the mission brief. It is the **before/after**
for this pass.

---

## Framework (confirmed, not assumed)

| | |
|---|---|
| Framework | Next.js 16.2.7, **App Router** |
| Rendering | Static / SSG for content; `ƒ` dynamic only for API routes and short-link redirects |
| Components | Server by default; `ToolPageShell` is a server component (keeps react-icons out of the hydration bundle) |
| Metadata | one helper — `pageMeta()` in `lib/seo.ts` |
| Structured data | `jsonLd()`, `breadcrumbLd()`, `softwareAppLd()`, `howToLd()`, `faqLd()` |
| Sitemap | `app/sitemap.ts`, generated from the tool registries |
| Robots | `app/robots.ts` |

## Crawl result — all 851 URLs

```
HTTP 200               851 / 851   (100%)
non-200 (4xx/5xx)        0
title                  851 / 851
meta description       851 / 851
canonical              851 / 851   (all on-origin)
exactly one <h1>       850 / 851   (was 850; the 1 is fixed this pass)
structured data        851 / 851
malformed JSON-LD        0
duplicate schema block   0
duplicate titles         0
duplicate descriptions   0
BreadcrumbList         841 / 851   (10 top-level pages omit it, by design)
≥120 words of prose    848 / 851   (3 short utility pages, by design)
orphans                  1 → 0      (fixed this pass)
```

**P0: 0. P1: 0.** The site was already technically sound.

## The two problem pages from the brief

The brief named two pages "previously observed problematic". Both were re-fetched:

| Page | Result |
|---|---|
| `/ai-tools/face-enhancer` | **HTTP 200**, one H1, 4 JSON-LD blocks, canonical correct, no error text. Working. |
| `/uz/compress` | **HTTP 200**, one H1, 3 JSON-LD blocks, canonical `…/uz/compress`. Working. |

Neither still fails. No action needed.

## Fixed this pass

1. **`/link-in-bio` had two `<h1>`.** The editor's live iPhone preview rendered
   the bio title through the shared `BioView`, whose title is an `<h1>` — correct
   on the real published page (`/p`), a second H1 on the tool page. `BioView` now
   takes a `preview` prop that renders the title as a non-heading `<div>` in the
   editor and keeps the `<h1>` on `/p`. → one H1 per page again.

2. **`/widgets` was an orphan** — in the sitemap, linked from no crawled page.
   It is the embeddable-downloader page, so `/downloader` now links to it with a
   genuine "Add this downloader to your own site" call-to-action. No sitemap hack;
   a real internal link a user would follow.

## Robots.txt — verified

```
User-Agent: *
Allow: /
Allow: /api/og
Disallow: /dashboard /api/ /r/ /p$ /pin /s/ /login /register
Disallow: /settings /account /history /favorites /admin /workspace
Host: https://qrixtools.com
Sitemap: https://qrixtools.com/sitemap.xml
```

- `User-Agent: *` with `Allow: /` admits Googlebot, Bingbot **and** OAI-SearchBot
  (ChatGPT) — none is blocked. Confirmed by fetching the site with a bot UA: full
  server-rendered HTML, no client-interaction gate.
- `/api/og` is allow-listed ahead of the `/api/` disallow so preview images stay
  fetchable (the one P0 fixed in the previous pass, commit `7607a40`).
- Private surfaces (admin, dashboard, auth, account, short-links) stay disallowed.

## Sitemap — verified

`https://qrixtools.com/sitemap.xml` — 851 `<loc>` entries, all 200, all canonical,
no redirects, no noindex URLs, no duplicates. Generated from the registries, so it
cannot drift from the tools that exist. A split into per-family sitemaps was
considered and **not** done: 851 URLs is far below the 50,000-URL limit where
splitting starts to help, so it would add maintenance for no crawl benefit.

## Deliberately left (P2)

| Finding | Why left |
|---|---|
| `/contact`, `/terms`, `/privacy`, `/blog`, `/scanner`, `/bulk-qr`, 4 more: no BreadcrumbList | Top-level pages; a one-hop breadcrumb is noise, not hierarchy |
| `/contact` 78w, `/scanner` 58w, `/bulk-qr` 89w | Genuinely short utility pages; padding them would be writing for a crawler |

## Reproduce

```bash
npm run aeo:audit -- --json .seo-crawl.json   # crawl + P0/P1/P2
node scripts/seo-inventory.mjs                # → docs/seo-url-inventory.json
npm run probe:hreflang                        # localized twins
npm run probe:sitemap                         # status + title + H1
```
