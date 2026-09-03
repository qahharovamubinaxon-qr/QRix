# QRix — SEO / AEO / GEO final report

**3 September 2026.** Everything measured against production; unverified items say so.

---

## Executive summary

QRix is **technically excellent already**. A full crawl of all 851 sitemap URLs
found **0 P0 and 0 P1** issues: every page returns 200, has a unique title,
description, canonical, one H1 and valid structured data; zero duplicate titles,
zero malformed JSON-LD. Most of this was built by earlier missions and confirmed
here, not created.

The real constraint is **not on-page SEO — it is off-site authority**. For the
high-intent queries tested (including ones where QRix has a true product edge),
qrixtools.com does not appear in Google's first page; the terms are held by domains
with backlink authority QRix has not yet built. QRix's actual traffic today comes
from **AI referral (ChatGPT), not Google organic**. So the highest-leverage work
ahead is authority + AI-citability (outreach), not more meta tags.

This pass therefore: (1) verified the whole site and the two pages the brief
flagged, (2) fixed the only two real on-page defects, (3) produced the audit,
inventory, intent map and strategy the brief asked for — from real data, with no
fabricated numbers.

## Current scores (observed, not aspirational)

| | Score | Basis |
|---|---|---|
| Technical SEO | **~98 / 100** | 851/851 clean on title, desc, canonical, H1, schema; 0 P0/P1 |
| AEO (on-page answer-readiness) | **~95 / 100** | direct-answer intros, 624 real FAQ Q&As, valid FAQPage/HowTo/WebApplication schema |
| Off-site authority / GEO visibility | **low** | not ranking on tested Google terms; no measured backlink profile |

## Critical problems fixed

- **`/link-in-bio` double `<h1>`** — editor preview rendered a second H1 via shared
  `BioView`; now `preview` mode renders it as a non-heading. One H1 per page.
- **`/widgets` orphan** — was in the sitemap, linked nowhere; now linked from
  `/downloader` with a real embed CTA.

Both were the only defects the crawl found. The two pages the brief named as
"previously problematic" — `/ai-tools/face-enhancer`, `/uz/compress` — **both return
200 and are clean**; no longer broken.

> Note: the crawl runs against production, which will not reflect these two fixes
> until this branch deploys. Re-run `npm run aeo:audit` after deploy to confirm the
> after-state (expected: 0 multiple-H1, 0 orphans).

## What was created

| File | Phase | Content — all from real data |
|---|---|---|
| `docs/seo-url-inventory.json` | 1 | 851 URLs, page-type, indexability, schema, problems |
| `docs/technical-seo-audit.md` | 2–4 | crawl result, robots, sitemap, the two fixes |
| `docs/search-intent-map.json` | 7 | 169 tools → 495 keyword intents + 624 real FAQ questions |
| `docs/keyword-priority-map.md` | 8 | target queries by tier; volume/difficulty left for a keyword tool |
| `docs/internal-linking-map.md` | 10 | the linking systems + rules; 31 links/page measured |
| `docs/competitor-gap-analysis.md` | 29 | honest gaps; DA/backlinks marked unmeasured |
| `docs/link-building-strategy.md` | 24 | manual outreach targets, tiered, CIS-weighted |
| `docs/search-console-playbook.md` | 27 | weekly workflow on existing scripts |
| `docs/aeo-benchmark.md` | 28 | 3 verified query results + 30-query panel to run |
| `docs/SEO-AEO-FINAL-REPORT.md` | 33 | this file |
| `scripts/seo-inventory.mjs`, `scripts/seo-intent-map.mjs` | — | generators, so the data can be regenerated |

## Metadata / schema / internal linking / sitemap / robots / crawlability

- **Metadata:** 851/851 unique title + description + canonical, via `pageMeta()`. No
  change needed.
- **Schema:** Organization + WebSite site-wide; WebApplication (681), FAQPage (777),
  HowTo (439), BreadcrumbList (841), Article (84) — all valid, 0 malformed, 0
  duplicated. No fabricated ratings or reviews.
- **Internal linking:** avg 31 links/page via related-tools + breadcrumbs + convert
  pairs + blog↔tool. One orphan fixed.
- **Sitemap:** 851 URLs, registry-generated, all 200/canonical. Not split (well under
  the 50k threshold).
- **Robots:** Googlebot / Bingbot / OAI-SearchBot all admitted; private surfaces
  disallowed; `/api/og` allow-listed. Verified with a bot UA — full SSR HTML.
- **Crawlability:** 0 non-200 across 851 URLs.

## Performance / mobile / accessibility

Not re-measured this pass (no regression introduced; the two edits are a heading tag
and an internal link). Prior state: server components keep hydration light,
`ToolPageShell` deliberately server-side. Recommend a Lighthouse run post-deploy as
the objective check — not guessed here.

## 30-query benchmark

3 tested (Google web, 3 Sep): QRix **not in top 10** for *compress image without
uploading*, *free QR code no expiry/no signup*, *vk video downloader online* — the
niches are held by authority domains. Full 30-query panel and the AI-engine columns
are in `aeo-benchmark.md` to run each cycle. **No positions were claimed that were
not observed.**

## Top 10 remaining opportunities

1. **Product Hunt launch** — the one Tier-1 directory genuinely still open (Yandex,
   SaaSHub and AlternativeTo were already done — see the correction below).
2. **Amplify the Russian passport-photo cluster** — Yandex's #1 clicked query is
   "сделать фото 413x531" (Russian passport, 35×45 mm). `/passport-photo/russia`
   exists but only in English; a Russian-language page targeting these exact
   queries is the clearest data-backed win.
3. **OK.ru/VK downloader in Russian** — the other proven Yandex cluster
   ("ok.ru video downloader", "vk ok ru videos"); already has /ru/downloader pages.

> CORRECTION (4 Sep 2026): earlier drafts listed "Connect Yandex Webmaster" and
> "fix the geo mismatch" as open. Both were wrong. Yandex was ALREADY connected
> (Mission 102) — verified live in the panel — and SaaSHub was already
> submitted+verified, AlternativeTo already live. The "geo mismatch" was only a
> Google artifact; Yandex serves the correct CIS/Russian audience. The real
> opportunities are the two clusters above, read from Yandex's own query data.
4. Win **Tier-A "without uploading" terms** — true differentiator, winnable.
5. Win **"no signup / no expiry" QR terms** — QRix out-features the thin incumbents.
6. Grow **CIS downloader** Google presence (VK/OK/Rutube) — low competition.
7. Optimise **high-impression / low-CTR** pages (titles) via the SC playbook.
8. Strengthen **AI-answer citability** — ChatGPT is the live channel; make the
   direct-answer blocks even more quotable.
9. Fill **keyword volume/difficulty** from a real tool to finish prioritisation.
10. Post-deploy **Lighthouse** pass to confirm performance objectively.

## Top 10 backlink / outreach opportunities

Product Hunt · AlternativeTo (vs iLovePDF / TinyPNG / remove.bg) · SaaSHub ·
r/InternetIsBeautiful · r/privacy · Show HN (real launch only) · Dev.to technical
write-up · Habr · Telegram tool channels · regional CIS free-tool directories.
Detail + status tracking in `link-building-strategy.md`.

## Validation commands used

```bash
npx tsc --noEmit
npm run lint
npm run aeo:audit -- --json .seo-crawl.json
node scripts/seo-inventory.mjs
node --import ./scripts/resolve-ts-alias.mjs scripts/seo-intent-map.mjs
npm run test:links
# live checks: curl -A "<bot UA>" for the two flagged pages + robots.txt
```

## Problems NOT fixable here (documented, not guessed)

- **Rankings / AI-Overview / ChatGPT-citation positions** for the full 30 panel —
  need the real products / an SEO tool; 3 verified, rest templated.
- **Keyword volume & difficulty** — no metrics API in this environment.
- **Backlink profile / Domain Authority** — no Ahrefs/Moz; left unmeasured, not
  invented.
- **Yandex + geo root cause** — need the owner's Yandex account and GSC query drill-down.
- **Lighthouse / field CWV** — recommend a post-deploy run.
- **The two on-page fixes' after-state** — confirmable only after this branch deploys.
