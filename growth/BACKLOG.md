# Growth backlog — ranked by ROI. Top unblocked item = next action.
Statuses: [ ] todo · [~] in progress · [x] done (move to Done) · [B] blocked.

## NOW (this week)
- [ ] "AI Image Upscaler" is not AI — ImageUpscaleClient is canvas bicubic plus
  an unsharp mask. M120 made the RU/UZ body copy honest, but the tool name and
  the EN title still say AI. Either ship a real model (ONNX/Real-ESRGAN in the
  browser, same pattern as @imgly for the background remover) or rename it.
  Owner decision: renaming costs the "улучшить фото ии" keyword.
- [~] PDF compress can't do the job its page is built to sell — the funnel page
  targets "my PDF is too big to email" (>25 MB) but the server rejects anything
  over ~4.5 MB at the edge (measured: 4.19 MB in, 4.4 MB → 413). M126 made the
  copy and the UI honest; the fix is a client-side path (pdf-lib + canvas
  re-encode of embedded images, same pattern as the image engines) so large
  files work at all — and that would restore the "never leaves your device"
  claim the page used to make falsely.
- [ ] Poster maker logo upload — M126 had to answer "no" to "Can I add my
  logo?" in 15 languages. Templates/heading/colour exist; a logo would make the
  review-poster page's strongest claim true again.
- [ ] Escape the remaining structured payloads — M126 fixed WiFi and VEVENT,
  but vCard still interpolates raw: an ORG of "Acme, Inc." or any name with a
  semicolon corrupts the same way. Same helper, same test file.
- [ ] Point the use-case CTAs at /qr-tools/url and /qr-tools/vcard directly —
  all 15 language variants currently send users (and link equity) through a
  301 from /url-qr and /vcard-qr.
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
- [x] Jul 22: audited usecase-content.i18n.ts — 3 false claims across 15
  languages, and the audit turned up a silent data-corruption bug (M126).
  The file is 9,228 lines of generated copy for 14 use cases × 15 languages,
  so it was audited by checking every claim against the engine it describes
  rather than by reading it end to end.
  (1) compress-pdf-for-email promised on-device processing four separate ways
  (metaDescription, intro, a benefit, a step, and "Is my document uploaded to
  a server?" → "No"). CompressPdfClient POSTs to /api/pdf/compress with no
  client-side path at all. The tool's own page was already honest — only the
  pages that rank lied. Rewritten, and the shared "Free · on-device · no
  signup" badge now drops its middle segment for server-side tools (all 15
  localizations are three ` · ` segments, so no new translation was needed).
  (2) Measured against production while checking the "only your device's
  memory" limit answer: 4.19 MB uploads fine, 4.4 MB returns 413 at the edge.
  A 413 body isn't JSON, so the user got a bare "Compression failed" — on the
  page whose whole promise is beating Gmail's 25 MB limit. Pre-upload guard +
  inline warning + honest FAQ; the real fix is queued in NOW.
  (3) The review-poster page promised a logo upload PosterMakerClient does not
  have. Answered honestly, pointed at the QR generator, follow-up queued.
  The WiFi page claimed hidden-SSID support that did not exist, and checking
  it exposed the real prize: both WiFi builders interpolated raw, so a
  password containing ; : , \ or " truncated at the delimiter — the code scans
  perfectly and just fails to connect. QRix's own decoder read /P:([^;]*)/ and
  truncated identically, so the round trip was self-consistently wrong. Now
  escaped per spec, with H:true shipped, open networks omitting the password,
  and the calendar payload given the description field and real times its copy
  had promised (plus RFC 5545 escaping and VALUE=DATE for all-day events).
  lib/qr-payload.ts + npm run test:qr — 21 assertions, mutation-verified:
  removing the escaping fails 4, removing H:true fails 2.
  Claims checked and left alone because they hold: remove-bg is genuinely
  on-device (@imgly) and does offer white backgrounds, SVG export exists,
  vCard carries title/URL/org, Instagram takes a username, fill-and-sign never
  touches the network, and all 14 CTAs resolve.
- [x] Jul 22: localized the sizing controls the RU/UZ copy names (M125) — the
  copy said "switch to «вписать»" and that «to'ldirish» crops the sides (8 RU
  and 13 UZ mentions across 50+ pages) while the buttons rendered English
  fill/fit, so the copy pointed at a control that wasn't on the page.
  ImageEngineRegistry threads an optional `lang` into the sizing/convert engine
  only — the one client whose controls the copy names out loud. Labels are
  display-only; mode values stay "fit"/"fill", so lib/image-output and its 30
  assertions are untouched. Background aria-label, quality label and the
  primary action localized too.
  Verified in a real browser on PRODUCTION, not just locally: qrixtools.com
  /ru/resize/1080x1080 renders Заполнить · Вписать · Изменить размер and the
  uz twin renders To'ldirish · Sig'dirish · O'lchamni o'zgartirish. Note the
  engine chunk is dynamic(ssr:false), so it is absent from the initial HTML —
  grepping HTML-linked chunks cannot verify it; drive the page instead.
- [x] Jul 22: two silent format rewrites + engine-derived format FAQ (M124) —
  found by driving batch-compress in the pane that M123 unblocked, which is
  the tooling paying for itself on its first use.
  batch:resize converted every image to WebP: `fmt` defaults to "webp" and its
  picker only renders for convert, so resize read a value never meant for it —
  the exact M120 bug, fixed then in ImageConvertClient and missed here.
  meta:remove/meta:exif hardcoded image/png, so a JPEG came back a much larger
  PNG — the M122 ExifCleanerClient bug, missed in its registry twin. Both now
  go through keepFormat() + flattensToWhite().
  Verified live by magic bytes in the real ZIP, not by reading code:
  logo.png -> 89 50 4e 47, photo.jpg -> ff d8 ff e0. Both were .webp before.
  The FMT answer is derived once from each tool's engine instead of one shared
  constant repeated at 30 call sites, so a new tool can't inherit a false
  claim; FAQ JSON-LD follows automatically. npm run test:image 30/30 (was 23),
  and the 7 new assertions fail 4 when fmtAnswer is reverted to always-PNG.
  Live on 5 spot-checked URLs, IndexNow 200 for all 82 tool pages.
- [x] Jul 22: registry-backed canvas engines are drivable in the preview pane
  (M123) — the item open since M120, and the lazy chunk was never the cause.
  Two independent traps, both found by instrumenting rather than guessing;
  `dynamicParams=false` was hypothesised and **refuted** by experiment first.
  (1) `preview_start` serves the PRIMARY checkout, not this worktree. The
  primary has no app/convert, app/resize, app/downloader, app/image-tools/
  [slug] and no lib/image-tools-meta.ts at all, so every design-v2 route 404s
  locally while 200ing in production — and it *does* carry a stale untracked
  app/image-tools/exif-remover/, which is precisely why that lone page seemed
  drivable and every registry page looked broken. The port-3001 worktree
  launch config was added in M120 but never actually exercised; it works.
  Proved by neither generateStaticParams nor the page body ever executing.
  (2) The pane runs the tab `visibilityState:"hidden"`, so requestAnimation-
  Frame never fires (timers do). React 19 gates its streaming-Suspense reveal
  on rAF — `$RC` won't reveal until `typeof $RT === "number"`, and `$RT` is
  only ever set inside a rAF callback. So every route slow enough to flush the
  loading.tsx fallback deadlocks forever: content parked in <div hidden
  id="S:0">, engines never mounted, and body.innerText pinned at ~126 chars
  whatever the page held — the M122 "126-char mystery", explained.
  Unblock (polyfill rAF → seed $RT → flush $RB) documented in
  growth/PREVIEW_VERIFICATION.md. Measured on /image-tools/batch-compress and
  reproduced on /convert/png-to-webp: scrollHeight 900→2081/2099, file inputs
  0→1, innerText 126→1710/2770, fallback gone. Then driven end to end — a
  DataTransfer file surfaced the real Quality + "Process 1 → ZIP" controls and
  produced a genuine application/zip (PK magic, 918 B). No production code
  changed: a real user's tab is visible, so this is pane-only.
  Found while driving it: baseFaq() promises PNG output but compress emits
  JPG (new NOW item).
- [x] Jul 22: canvas output rules made testable (M122) — the [~] item open
  since M120. (b) is fully done; (a) is partly fixed and honestly scoped:
  (a) The 0x0-viewport trap has a fix, and it is not the preset:
  `resize_window {preset:"desktop"}` answers "reset to NATIVE size", and on a
  worktree dev server native IS 0x0, so the preset is a silent no-op — that is
  why it kept looking unfixable. `resize_window {width:1280, height:900}` sets
  a real viewport and React hydrates. Proven on /image-tools/exif-remover:
  vw:0 with only ["EN","Sign up"] became vw:1280 with the real file input and
  the "Remove metadata & download" control.
  LIMIT, measured not assumed — this is NOT enough for engine-registry pages.
  On /image-tools/batch-compress the page hydrates at 1280 (the "Loading the
  image workspace…" fallback is in the DOM, so React is alive) but the
  `dynamic(ssr:false)` chunk never resolves in the pane, so the canvas engine
  still never mounts. Directly-imported clients (exif) are drivable;
  registry-backed ones (convert/resize/batch/upscale) are not yet.
  Also: `document.body.innerText` returns ~126 chars in the hidden pane no
  matter what the page contains — assert against the DOM, never innerText.
  (b) The decision logic no longer depends on a browser at all: keepFormat,
  keepsAlpha, paintsBackground, flattensToWhite and drawRect moved to
  lib/image-output.ts, asserted by scripts/test-image-output.mjs
  (`npm run test:image`, 23 assertions against the SHIPPED module — Node 24
  strips the types, so there is no copy to drift). Proven able to fail by
  mutation: the original always-jpeg bug fails 6, fill-mode alpha flattening
  fails 2, fit/fill swapped fails 3.
  The real drawImage/toBlob half was verified in the browser pane rather than
  jsdom (which has no true codec): a transparent source drawn fill-mode into
  1080x1080 keeps centre alpha [0,0,0,0] through a real PNG encode+decode
  round-trip while the corner stays opaque red, painting the frame first
  reproduces the M120 white flattening, and toBlob returns genuine
  image/png / image/webp / image/jpeg.
  Found and fixed while extracting: ExifCleanerClient had the same bug class
  independently — it hardcoded png-or-jpeg, so a WebP dropped into the EXIF
  remover came back as a JPG, and a transparent source encoded black because
  nothing painted the frame. It now shares the same helpers.
- [x] Jul 22: claim audit across every localized template (M120) — the last
  four surfaces the audit item named. Fixed, each verified against the code:
  PDF compress claimed "без потери качества" (the route re-encodes JPEGs at
  q42–82 and downscales to 900–1600px) and "файлы не загружаются на сервер"
  (CompressPdfClient POSTs to /api/pdf/compress — a false privacy promise);
  PDF→Word claimed in-browser conversion (it runs the server provider chain);
  the upscaler claimed detail restoration (bicubic + unsharp mask can't);
  OCR claimed 100+ languages (the picker has four options) in the localized
  copy, the autopilot blog seed and the social-post cron; and the EN/RU/UZ
  downloader templates promised "video, audio or image" on all 16 platforms,
  though Twitch and Dailymotion never yield an image and SoundCloud never a
  video — new deliverables()/formatPhrase() helpers derive the sentence from
  each platform's real kinds. Verified true and left alone: barcode batch
  mode, OK.ru in-browser MP3 extraction, TikTok's "HD (no watermark)" label,
  pdf-to-jpg zip-all, merge/jpg-to-pdf browser-only, bg remover resolution,
  and all the resize-preset print/ID copy (which already disclaims what it
  doesn't check).
- [x] Jul 22: resize stopped silently rewriting file formats (M120) — the
  /resize/<preset> and social-resizer pages fell through to fmtKey "jpeg", so
  every resize returned a JPG and a transparent PNG came back flattened onto
  white, while two pieces of copy claimed the format was preserved. Fixed the
  code, not the copy: PNG→PNG, WebP→WebP, everything else→JPG, and fill mode
  no longer paints the background when the output carries alpha. Deployed;
  the copy is verified live by curl, the canvas behaviour is typecheck-only
  (see the verification item in NOW).
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
