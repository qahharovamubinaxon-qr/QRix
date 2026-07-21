# Growth backlog — ranked by ROI. Top unblocked item = next action.
Statuses: [ ] todo · [~] in progress · [x] done (move to Done) · [B] blocked.

## NOW (this week)
- [ ] TIFF converter-pair pages — now unblocked: tiff-to-png/jpg/webp and
  png/jpg/webp-to-tiff on the /convert/[pair] infra (6-8 more pages).
  NOTE: *-to-tiff works; tiff-to-* needs a TIFF *decoder* first (browsers
  can't load .tiff into an <img>), so ship the to-tiff half or add a
  baseline decoder. Scope this before starting.
- [~] Resize presets batch 2 — extend `lib/resize-presets.ts` with ~9 more
  size-intent presets (1080x1920 vertical/story, 2048x2048, 1600x900,
  3000x2000, 8x10in print 2400x3000, A5/A3, 300x300, 150x150). Infra is
  done and the hub groups them automatically — batch 2 is copy only.
- [ ] RU/UZ twins for /resize/[preset] (copy the /convert i18n pattern in
  lib/convert-pairs-i18n.ts) — 3-way hreflang, +32 pages.
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
