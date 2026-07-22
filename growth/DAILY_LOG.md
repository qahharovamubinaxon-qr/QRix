# Growth daily log — one line per session run
# Format: YYYY-MM-DD HH:MM — action. A '<date> DONE' line means the day's goal shipped.
2026-07-21 12:35 — shipped: converter-pair pages (/convert hub + 20 pairs, all 200 live, IndexNow 200) + real BMP/ICO encoders
2026-07-21 DONE
2026-07-21 (manual, pulled from tomorrow) — shipped: RU/UZ converter pages (40, 3-way hreflang, IndexNow)
2026-07-21 16:03 — checked, nothing to resume
2026-07-21 17:05 — shipped: real baseline TIFF encoder (convert-to-tiff no longer emits PNG bytes) | pages:0 | live:yes | next: TIFF converter-pair pages (scope decoder first) or /resize/[preset] pages
2026-07-21 17:52 — shipped: 16 resize-preset pages /resize/<size> + hub (generic resize:WxH engine) | pages:17 | live:yes | next: resize presets batch 2 (~9 more, copy only)
2026-07-21 18:20 — shipped: resize presets batch 2 (9 more sizes, 25 presets / 26 URLs) | pages:9 | live:yes | next: RU/UZ twins for /resize (copy convert-pairs-i18n pattern, +50 pages)
2026-07-21 19:12 — shipped: RU/UZ twins for /resize/<preset> (50 localized pages, 3-way hreflang reciprocal, sitemap 738, IndexNow 200) | pages:50 | live:yes | next: RU/UZ twins for the /resize hub (localized parent for the 50 new pages)
2026-07-21 20:58 — shipped: TIFF converter pairs + client-side TIFF decoder with capability guard (M114) | pages:18 | live:yes | next: RU/UZ twins for the /resize hub (localized parent for the 50 M111 pages)
2026-07-21 21:36 — shipped: RU/UZ hubs for /resize + /convert (M115, 4 localized parents, reciprocal hreflang, live) | pages:4 | live:yes | next: RU/UZ barcode symbology twins
2026-07-21 21:40 — shipped: RU/UZ twins for all 13 barcode symbologies (M116, 26 pages, sitemap 795, false check-digit claim caught pre-deploy) | pages:26 | live:pending-verify | next: RU/UZ hub for /barcode (localized parent for these 26)
2026-07-21 22:05 — shipped: RU/UZ hub for /barcode + 3-level localized breadcrumbs (M117, sitemap 801, verified live) | pages:2 | live:yes | next: soft-404 fix
2026-07-21 22:30 — shipped: dynamicParams=false on 20 routes — unknown params were returning 200 with an empty page across every family incl. EN (M118) | pages:0 | live:verifying | next: audit remaining localized templates (resize/downloader/tool-page i18n) for unsupported claims
2026-07-21 21:55 — shipped: claim audit of every localized template + resize format preservation (M120) | pages:0 (48 downloader + 4 tool + 2 hub pages rewritten) | live:yes | next: fix the preview launch config so design-v2 routes can be verified locally
2026-07-21 23:05 — shipped: canvas output rules extracted to lib/image-output.ts + npm run test:image (23 assertions, mutation-verified) and two more live format bugs fixed — EXIF remover turned WebP into JPG / transparent into black, batch compress encoded every transparent PNG black (M122/M122b) | pages:0 | live:yes (M122 confirmed in deployed chunk; 6 URLs 200) | next: make registry-backed canvas engines drivable in the preview pane (dynamic(ssr:false) chunk stalls there)
2026-07-21 23:40 — shipped: preview pane traps root-caused, registry engines now drivable end to end (M123) | pages:0 | live:n/a (verification tooling, no production code changed) | next: baseFaq() promises PNG output on tools that emit JPG (~40 pages)
2026-07-22 00:35 — shipped: batch-resize + metadata-remover silent format rewrites fixed, format FAQ derived from the real engine (M124) | pages:82 updated | live:yes (magic-byte verified, IndexNow 200) | next: AI Image Upscaler is not AI (owner-gated rename) → skip to usecase-content.i18n.ts audit
2026-07-22 01:05 — shipped: RU/UZ fit/fill + quality + action labels in the sizing engine (M125) | pages:50+ localized | live:yes (driven on production) | next: usecase-content.i18n.ts claim audit (9,228 lines)
2026-07-22 07:25 — shipped: usecase-content.i18n.ts claim audit — 3 false claims × 15 languages fixed, WiFi/iCal payload corruption bug found and fixed with a new mutation-verified suite (M126) | pages:30 (2 use cases × 15 langs) + 4 QR tools | live:verifying | next: client-side PDF compress path so the >4.5 MB files the page is built to sell actually work
