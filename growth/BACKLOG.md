# Growth backlog — ranked by ROI. Top unblocked item = next action.
Statuses: [ ] todo · [~] in progress · [x] done (move to Done) · [B] blocked.

## NOW (this week)
- [~] TIFF converter-pair pages — tiff-to-png/jpg/webp and
  png/jpg/webp-to-tiff on the /convert/[pair] infra (6 pages).
  SCOPED: the encoder half already works (M108 shipped a real baseline TIFF
  encoder). The decoder half is the work: `loadImg()` in ImageConvertClient
  uses `new Image()`, which no browser can point at a .tiff — and most real
  TIFFs are LZW/Deflate compressed, so a hand-rolled baseline-only decoder
  would fail on the majority of user files. Plan: add UTIF (MIT, no deps),
  decode TIFF → ImageData → PNG blob → feed the existing Image() path so
  everything downstream is unchanged.
  next: install utif, wire decode into loadImg, then write the 6 pair entries.
- [ ] RU/UZ twins for the /resize hub itself — the 50 new localized preset
  pages currently have an EN-only parent. Small copy job, closes the loop.
- [ ] Stats page /qr-code-statistics — 20+ sourced stats; citation magnet
  for LLMs + journalists (backlinks).
- [ ] CWV audit — Lighthouse on 5 template types; fix to 95+ mobile.

## NEXT (2-4 weeks)
- [ ] Spanish (es) downloader + top-tools pages (copy RU pattern).
- [ ] Turkish (tr), Indonesian (id) — same.
- [ ] PDF converter-pair pages (word-to-pdf, excel-to-pdf, ppt-to-pdf…).
- [ ] Blog autopilot: +20 topics from GSC impressions data (weekly review).
- [ ] Internal-links pass: every tool page links 6+ related pages.
- [ ] Image alt-text + OG images per tool category.
- [ ] search_miss report → build the top-3 requested missing tools.

## LATER (quarter)
- [ ] Embeddable QR-generator widget (2nd widget) + /widgets update.
- [ ] Developer API public launch content (docs SEO: "qr code api").
- [ ] Guest-post/backlink outreach batch 1 (10 targets list in PLAYBOOK).
- [ ] AdSense apply when >500 organic/day; Ezoic compare at >5k/day.
- [ ] 10-language expansion (hi, ar, de, fr, pt…) for proven families.
- [ ] Premium plan launch after Lemon Squeezy bank connect.

## OWNER-GATED (needs human)
- [B] AlternativeTo submit — account age unlocks Jul 27 (reminder set).
- [B] Product Hunt launch — prep starts Aug 5 (reminder set).
- [B] Reddit/HN posts — human account required.
- [B] VK/Reddit/Vimeo unlock — ~$3/mo residential proxy for cobalt
  (API_EXTERNAL_PROXY) — owner decision.

## Done
- [x] Jul 21: RU/UZ twins for /resize/<preset> (M111) — 50 localized pages
  at /ru/resize/<size> and /uz/resize/<size> on the same real
  ImageConvertClient (resize:WxH engine) via components/LocalizedResizePage.
  lib/resize-presets-i18n.ts holds written per-size copy for all 25 presets
  in both languages: what the size is, its caveat, and 2 size-specific FAQs
  each, composed with an orientation-aware fill/fit line + 3 shared FAQs.
  3-way hreflang made reciprocal (EN page now declares ru/uz), sitemap 738
  URLs, 4 localized search-index entries. Verified live: localized titles,
  4-way hreflang, correct canonical, unique body, SoftwareApp+Breadcrumb+
  HowTo+FAQ JSON-LD. IndexNow 200 for all 738.
  Follow-up: the /resize hub is EN-only — RU/UZ hub twins would give these
  50 pages a proper localized parent (small, high-ROI).
- [x] Jul 21: premium tool-control surfaces for QR Art + Promo Video makers
  (shared .qx-tool-card/.qx-tool-in/.qx-chip2 classes, light mode included).
- [x] Jul 21: resize presets batch 2 (M110) — 9 more sizes, 25 presets /
  26 URLs total. 1080x1920 vertical, 1600x900, 1920x1200, 1024x1024,
  2048x2048, 300x300, and 300-DPI print 8x10in / A5 / A3. Copy-only —
  hub, sitemap, search and JSON-LD picked them up automatically.
- [x] Jul 21: resize-preset pages (M109) — `/resize` hub + 16
  `/resize/<size>` SSG pages on the real ImageConvertClient via a new
  generic `resize:<w>x<h>` engine (no second preset table). Displays,
  web/OG, 300-DPI print and ID/passport groups; unique copy + HowTo/FAQ/
  SoftwareApp/Breadcrumb JSON-LD, sitemap (17 URLs) + search index +
  TopNav + llms.txt. Targets size-intent queries the platform-named
  social pages don't serve. ID pages state they set dimensions only.
- [x] Jul 21: real baseline TIFF encoder (M108) — `/image-tools/convert-to-tiff`
  was handing users PNG bytes named .tiff (canvas.toBlob has no image/tiff
  codec, same bug class as BMP/ICO). Now emits a real little-endian baseline
  TIFF: 8-bit, single strip, uncompressed, RGB when opaque / RGBA +
  ExtraSamples=2 when transparent. Verified by running the shipped function
  against sharp+libtiff — exact pixel round-trip at 3x2 (odd width), 4x4
  alpha and 640x480, plus direct IFD tag-order/compression/strip asserts.
  Confirmed live in the deployed chunk. No sitemap change (no IndexNow).
- [x] RU/UZ converter pages — 40 pages, 3-way hreflang, IndexNow (M107).
- [x] Jul 21: converter-pair pages — /convert hub + 20 `/convert/[pair]`
  SSG pages (png/jpg/webp/avif/bmp/gif/ico) on the real ImageConvertClient,
  unique copy + HowTo/FAQ/SoftwareApp/Breadcrumb JSON-LD, sitemap (21 URLs)
  + search index + TopNav + llms.txt, all verified 200 live, IndexNow 200.
  Also fixed silently-broken BMP/ICO encoders (canvas.toBlob returned PNG
  bytes with a lying extension) — now real 24-bit BMP + real ICO container.
- [x] Jul 19-21: downloader (16 platforms + bot + channel), RU/UZ pages
  (downloader + 8 tools), comparison pages, embed widget, viral QR footer,
  IndexNow automation, GA4, brand film v2, weekly backups, GSC/Bing/Yandex.
