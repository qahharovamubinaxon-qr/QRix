# QRix — SEO changelog

Every meaningful SEO/AEO change, newest first, with the commit and the evidence
that prompted it. Verified live unless it says otherwise.

---

## 13 Sep 2026 — `/bulk-qr` rebuilt for its real ranking

**Evidence.** Google Search Console (14 Jul – 10 Sep): `bulk qr code generator`
45 impressions at position **70.3**, `bulk qr code` 10 at **68.6** — the site's
best reachable non-brand target. The page was simultaneously its thinnest: 479
words against ~1,800 on sibling `/qr-tools/*` pages, no FAQ, no structured data,
and an H1 that omitted the word the query uses.

**Changed** — `app/bulk-qr/page.tsx`:
- H1 `Bulk QR Generator` → `Bulk QR Code Generator`
- 479 → **1,442 words**, 0 → **5 H2 sections** (how-to, what you get, when bulk
  beats one-at-a-time, FAQ, related tools)
- **7 FAQs**, rendered as visible `<details>` *and* emitted as `FAQPage`
- Structured data added: `WebApplication`, `BreadcrumbList`, `HowTo` (4 steps),
  `FAQPage` (7 questions) — previously the page had none
- Internal links out: 1 → **6** contextual QR links
- Tool stays above the prose; nothing was removed

**Accuracy.** Every claim re-read from the code first: 512×512 PNG per row,
error-correction level H, five dot styles, custom colour, zipped in the browser
via `qr-code-styling` + `jszip`. No limit is claimed because none is coded.

**Verified in the build:** h1 = 1, h2 = 5, `<details>` = 7, Question = 7,
HowToStep = 4, 6 links to `/qr-tools*`. `tsc` 0, `next build` 0.

**Also added:** `docs/SEO_KEYWORD_MAP.md` (every query with its real GSC
position), `docs/SEO_AEO_ROADMAP.md`, this file.

---

## 12 Sep 2026 — ads moved to where the traffic is (`04e6a94`)

Not a ranking change, but it corrected a measurement the owner was reading as an
SEO failure. Adsterra showed 21 impressions / $0 because the slot only existed on
the 46 `ToolPageShell` pages and in blog posts, while the traffic was on
`/downloader/*` and `/ru/*`. Slot added to `LocalizedToolPage`,
`/ru/passport-photo/*` and the downloader on arrival; homepage deliberately left
ad-free.

## 11 Sep 2026 — `/ru/passport-photo/russia` live (`9d9321d`, rebuilt `bd45de0`)

Yandex's own query list makes `сделать фото 413x531 px` the site's #1 clicked
query; the sourced MVD spec existed only in English. Added a Russian twin
(Приказ МВД № 773 translated, not re-stated), reciprocal hreflang on both pages,
sitemap + search index, inbound link from the English page.
*Trap recorded:* the first push landed while Vercel was suspended and was never
built — production kept serving the older deploy and the new route 404'd until an
empty commit forced a rebuild.

## 3 Sep 2026 — category hubs got their schema (`0a321cc` → fixed in `b12019c`)

`/qr-tools`, `/image-tools`, `/pdf-tools` carried only the site-wide
Organization/WebSite blocks while `/ai-tools`, `/video-tools`, `/3d-tools`
already emitted `ItemList` + `BreadcrumbList`. Brought to parity.
*Regression made and fixed the same day:* the first attempt put the JSON-LD in
each hub's `layout.tsx`, which wraps every child route — ~137 tool pages
inherited the hub breadcrumb on top of their own. `tsc` and `build` were both
clean; only a full production crawl caught it. Schema now lives in each hub's
own `page.tsx`.

## 3 Sep 2026 — two on-page defects fixed (`76ee66c`)

`/widgets` was an orphan (in the sitemap, linked from nothing) — now linked from
`/downloader`. `/link-in-bio` shipped two `<h1>` — the editor's live preview was
rendering the bio title as a second one.

## 2–3 Sep 2026 — the P0 that produced no error anywhere (`7607a40`)

`robots.txt` disallowed `/api/` wholesale, and every page's `og:image` is
`/api/og?t=…`. So all 851 pages advertised a preview card that compliant
crawlers — including the AI fetchers that render link previews — were told not
to fetch. `/api/og` is now allowed by name. Also `bcc3ef5`: BreadcrumbList moved
into `ToolPageShell` so a new tool inherits it.

---

## Corrections to earlier documents

Recorded because acting on them would have wasted real work:

- **"Yandex Webmaster is not connected"** — wrong. It was connected (Mission
  102), verified live in the panel on 4 Sep, and is earning clicks. SaaSHub was
  likewise already submitted and verified, and AlternativeTo has been live since
  11 Aug.
- **"The geo mismatch is unexplained"** — it was a Google artifact only. Yandex
  serves exactly the right audience; the site's market is CIS/Russian-speaking.
- **"`pdf to word` is the flagship target"** — it draws zero impressions and is
  not in the top 1,000 queries. Good page, no demand yet.

---

## 13 Sep 2026 (later) — a claim of mine, checked and withdrawn

The first draft of `SEO_KEYWORD_MAP.md` and `SEO_AEO_ROADMAP.md` named
"contactless menu QR" (position 49.5, 17 impressions) as the one content gap
worth building. **That was wrong.** `/use/en/restaurant-menu-qr-code` already
exists — 1,859 words, FAQ schema, matching title — with a Russian twin at
`/use/ru/…`, both HTTP 200. Checked before building anything; both documents
corrected rather than quietly edited.

The correction matters more than the error: with it, **every query in the GSC
data that has a workable position already has a good page behind it.** There is
no on-page work left that the data justifies. What remains is off-site.
