# QRix — AEO / SEO audit

**Measured 2–3 September 2026** against production, not against the repository's
intentions. Every number here came from `npm run aeo:audit`, which fetches all
850 sitemap URLs and parses what a crawler actually receives.

---

## Technical architecture

| | |
|---|---|
| Framework | Next.js 16.2.7, App Router |
| Rendering | Static (`○`) and SSG (`●`) for nearly everything; `ƒ` dynamic only for API routes and short-link redirects |
| Components | Server by default. `ToolPageShell` is deliberately a server component — it wraps 46 routes and was converted out of `"use client"` to keep react-icons and ~200 lines of static markup out of the hydration bundle |
| Metadata | One helper, `pageMeta()` in `lib/seo.ts`, produces title, description, canonical, OpenGraph and Twitter for every page |
| Structured data | `jsonLd()`, `breadcrumbLd()`, `softwareAppLd()`, `faqLd()` in the same file |
| Sitemap | `app/sitemap.ts`, generated from the tool registries — no hand-maintained list |
| Robots | `app/robots.ts` |
| Tool registries | `lib/{qr,image,ai,video,three}-tools-meta.ts` — the source of truth for slugs, copy, steps and FAQs |

## Page inventory

850 URLs in the sitemap, all verified to answer 200 with a title and an H1.

| Family | Count |
|---|---|
| QR tools | 34 |
| Image tools | 32 |
| Video tools | 32 |
| AI tools | 30 |
| PDF tools | 21 |
| 3D tools | 3 |
| Downloader | 57 pages across 19 platforms |
| Localised (`/ru/`, `/uz/`) | 220 |
| Blog, use-case, compare, docs, help, legal | the remainder |

Registries mark 89 tools `live` and 5 `preview`. All five preview tools were
checked: they answer 200 and their engines are wired.

---

## Findings

### P0 — fixed

**robots.txt blocked every social and AI preview image on the site.**
`lib/seo.ts` builds each page's `og:image` and `twitter:image` as
`/api/og?t=<title>`, and `robots.txt` disallowed `/api/` wholesale. So every
page advertised a preview card that compliant crawlers were told not to fetch.
The endpoint itself was always fine — 200, image/png, 100 KB. Nothing was
broken except permission to look at it, which produces no error anywhere and
simply makes shared links look empty. This matters more than usual here:
ChatGPT is the site's largest referral source, ahead of Google.
→ `/api/og` is now allowed by name (commit `7607a40`).

### P1 — fixed

**Six tool pages emitted no BreadcrumbList**, one of them
`/image-tools/remove-bg`, which carries most of the site's search impressions.
The visible breadcrumb had been on every tool page all along; only the
machine-readable one had to be remembered per page.
→ `ToolPageShell` now emits it from the `category`, `categoryHref` and `title`
it already receives (commit `bcc3ef5`), so a tool added tomorrow inherits it.

**That fix then duplicated it on 29 `/qr-tools/*` pages**, because those emit
their schema from `page.tsx` while the shell is rendered from `QRToolView.tsx`
one file down — a per-file check for "already emits breadcrumbLd" looked in the
wrong place. The audit caught it within the hour, having been taught to *count*
schema types rather than collect them into a Set (commit `444a427`).

### P2 — open, deliberately

| Finding | Why it is left |
|---|---|
| `/contact`, `/terms`, `/privacy`, `/blog`, `/scanner`, `/bulk-qr` have no BreadcrumbList | Top-level pages. A breadcrumb with one hop is noise, not hierarchy. |
| `/contact` 78 words, `/scanner` 58, `/bulk-qr` 89 | Genuinely short pages that do their job. Padding them for a word count would be writing for a crawler rather than a reader. |
| `/link-in-bio` has two `<h1>` | Real, minor. Worth fixing when that page is next touched. |
| `/widgets` is an orphan — in the sitemap, linked from nothing | Either link it or drop it from the sitemap. Owner's call. |

---

## Coverage, all 850 URLs

```
title              850/850  (100%)
meta description   850/850  (100%)
canonical          850/850  (100%)
exactly one <h1>   849/850  (100%)
structured data    850/850  (100%)
BreadcrumbList     ~844/850  (99%)
≥120 words prose   847/850  (100%)

duplicate titles         0
duplicate descriptions   0
malformed JSON-LD        0
orphans                  1
```

Schema types in use: `Organization` 850 · `WebSite` 850 · `BreadcrumbList` ~844
· `FAQPage` 776 · `WebApplication` 681 · `HowTo` 439 · `Article` 83 ·
`CollectionPage` 15 · `ItemList` 10 · `TechArticle` 7 · `AboutPage`, `Person`,
`Blog`, `VideoObject` 1 each.

---

## What the audit disproved

Two plausible theories were tested and are **wrong**, which is worth recording
so nobody spends a day on either again.

**"The twelve extra languages in the switcher hurt SEO."** They do not exist as
URLs. The sitemap contains only `/ru/` and `/uz/` prefixes; the switcher
relabels navigation client-side and Google never sees the other twelve. Removing
them would delete a working feature for no gain.

**"Missing hreflang is why Google shows the site to the wrong countries."**
110 English originals have localised twins; 109 declare hreflang and none are
missing. The first version of that probe stripped the `/ru/` prefix to find the
English page and manufactured nine fake problems — `/ru/split`'s twin is
`/pdf-tools/split`, not `/split`. Asking each localised page which English page
it points at gives the real answer.

So whatever is sending impressions to the Philippines and Indonesia at position
~85, it is not hreflang and it is not the language switcher.

---

## Tools

```
npm run aeo:audit                 all 850 URLs — title, H1, canonical, schema, duplicates, orphans
npm run aeo:audit -- --limit 40   quick sample
npm run probe:sitemap             status + title + H1 only, faster
npm run probe:hreflang            localised twins and their reciprocal links
npm run ga:channel                which pages one traffic source lands on
```
