# Growth backlog — ranked by ROI. Top unblocked item = next action.
Statuses: [ ] todo · [~] in progress · [x] done (move to Done) · [B] blocked.

## NOW (this week)
- [~] Audit every localized template for claims the tool doesn't support.
  The RU/UZ convert template promised batch conversion on 40 live pages
  (fixed in M114); the same composed-copy pattern is used by the resize,
  downloader and tool-page i18n files, so check those for promises the UI
  never implemented. False claims are worse than thin copy.
  Done so far: convert (M114), barcode (M116 — the numeric step promised an
  automatic check digit ITF/MSI/Pharmacode never get). Still to check:
  resize-presets-i18n, downloader i18n, tool-page i18n, hub-i18n.
- [ ] Batch/multi-file conversion for real — AiDropzone takes a single file
  everywhere. ImageBatchClient exists but is a separate engine. Wiring
  multi-file into the /convert pages would make the (now removed) claim
  true and is a genuine competitive gap vs FreeConvert/TinyWow.
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
- [x] Jul 21: unknown params now 404 instead of soft-404ing with 200 (M118) —
  found while verifying M117: /ru/barcode answered 200 before the hub existed.
  Without `dynamicParams = false`, Next renders params outside
  generateStaticParams on demand and the empty result is prerendered and
  cached as a 200, so /ru/anything, /convert/nonsense, /resize/9999x9999,
  /downloader/nonsense and /blog/nonsense were all indexable empty pages —
  an unbounded crawlable URL space competing with the ~800 real ones for
  crawl budget. Barcode was the only family already correct (M116 set it).
  Flag added to all 20 registry-backed dynamic routes; deliberately NOT to
  /pin, /dashboard/analytics, /r and /p, which resolve user records at
  request time. Safe because every patched route enumerates a static in-repo
  registry — no runtime CMS, so a new entry already needs a deploy.
- [x] Jul 21: RU/UZ hub for /barcode + 3-level breadcrumbs (M117) — the 26
  M116 pages had an EN-only parent. BARCODE_HUB copy in lib/hub-i18n.ts is
  written as a chooser, not a link list: the children each own a narrow
  query ("генератор pdf417") but none can own the head term ("генератор
  штрих кодов") or the "which symbology do I even need" intent that brings
  most of the traffic, so sections are grouped by where the code is used.
  LocalizedHub took a third kind via a HUB_COPY/SECTIONS lookup instead of a
  widening ternary, families unioned with BARCODE_FAMILIES so a new family
  is appended not dropped. Child breadcrumbs (visible + JSON-LD) now read
  Home › Штрих-коды › Type and point at the localized hub. Claims checked
  against BarcodeClient before writing: batch mode is real, and the FAQ
  states exactly which four symbologies auto-append a check digit.
  Verified live: both hubs localized title/h1/canonical, 4-way hreflang,
  ItemList+Breadcrumb+FAQ JSON-LD, 13 child links each, sitemap 801.
- [x] Jul 21: RU/UZ twins for all 13 barcode symbologies (M116) — 26 pages at
  /ru|/uz/barcode/<type> on the real BarcodeClient. lib/barcode-types-i18n.ts
  carries written facts per format in both languages (Aztec's centre bullseye
  is why it needs no quiet zone; PDF417's 17-module codeword is why it looks
  like a ladder; an EAN prefix marks where the number was registered, not
  where the goods were made) plus 2 own FAQs each + 3 shared trust FAQs.
  Caught before shipping: the composed numeric "what to type" step promised
  an automatic check digit, but only EAN-13/EAN-8/UPC-A/ITF-14 carry fixedLen
  in BarcodeClient — ITF, MSI and Pharmacode get none, so that step is now
  split in two (the M114 false-claim trap, this time caught pre-deploy).
  LOC_BARCODE_TYPES is derived by filtering BARCODE_TYPES through the copy
  table, so an unwritten symbology can't be routed or sitemapped to a 404.
  4-way hreflang reciprocal, sitemap 799 verified live, tsc clean.
  Follow-up: /barcode has no RU/UZ hub, so these 26 pages have an EN-only
  parent and their breadcrumbs are 2-level.
- [x] Jul 21: RU/UZ hubs for /resize and /convert (M115) — the 50 localized
  resize presets and 40 localized converter pairs had an EN-only parent that
  dropped RU/UZ visitors into English on every breadcrumb and "all sizes"
  path. Four hubs off one shared LocalizedHub, each carrying the head term
  its children can't target ("конвертер изображений", "rasm o'lchamini
  o'zgartirish"), copy written for RU/UZ intent (document-photo and print
  queries) rather than translated. Convert sections self-defend against a
  forgotten target format; cards link only LOC_* entries so a pair without
  localized copy can't be linked to a 404; child breadcrumbs now name and
  point at the hub for a real 3-level trail. Live on all four URLs.
- [x] Jul 21: TIFF converter pairs + client-side TIFF decoder (M114) — 6 EN
  pairs (tiff-to-png/jpg/webp, png/jpg/webp-to-tiff) with RU/UZ twins = 18
  new URLs, sitemap 769. The work was the decoder: no browser can load a
  .tiff into an <img>, so lib/tiff-decode.ts adds UTIF (MIT, dynamically
  imported — confirmed absent from every eager chunk, so non-TIFF users pay
  nothing). Critically it refuses what UTIF gets wrong: JPEG-in-TIFF,
  WebP-in-TIFF, tiled layouts, CCITT Huffman and Adobe Deflate all decode to
  garbage or black rather than failing, so compression/layout tags are
  checked against an allowlist verified pixel-exact against libtiff and
  anything else gets an error naming the codec. Multi-page scans get a page
  selector. Verified: 29-assertion Node suite (LZW/Deflate/PackBits/none/
  CCITT-G4/multi-strip/odd-width/RGBA/16-bit/grayscale all maxErr=0; every
  unsupported form refused; multi-page IFD chains correct), tsc clean, all
  18 URLs 200 live with 4-way hreflang + SoftwareApp/Breadcrumb/HowTo/FAQ
  JSON-LD, TIFF code confirmed present in the deployed chunk, IndexNow 200
  for all 769. Also fixed: the /convert hub's hardcoded ORDER had no TIFF,
  which would have orphaned the three *-to-tiff pages (now self-defending),
  and the RU/UZ template's false batch-conversion promise on 40 live pages.
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
