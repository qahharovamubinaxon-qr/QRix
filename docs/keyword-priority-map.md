# QRix — keyword priority map

Target queries per tool family, chosen for **relevance + achievable competition +
QRix differentiation**, not for raw volume. Search-volume and difficulty numbers
are deliberately **left blank** here: this environment has no keyword-metrics API,
and the mission rules forbid inventing numbers. Fill the two right columns from
Google Keyword Planner or an SEO tool before treating any row as prioritised.

The machine-readable source of the intents below is `docs/search-intent-map.json`
(generated from each tool's real registry keywords and on-page FAQ questions).

Legend — **Tier**: A = QRix has a true differentiator and the term is winnable;
B = relevant, contested, needs authority; C = head term, only with strong backlinks.

---

## QR (differentiator: static QR that never expires, no signup, no watermark)

| Query | Tool | Tier | Volume | Difficulty |
|---|---|---|---|---|
| free QR code no expiry | /qr-tools/url | A | | |
| QR code without signup | /qr-tools/url | A | | |
| QR code without watermark | /qr-tools/url | A | | |
| WiFi QR code generator | /qr-tools/wifi | B | | |
| vCard QR code generator | /qr-tools/vcard | B | | |
| App Store QR code generator | /qr-tools/appstore | A | | |
| Instagram QR code generator | /qr-tools/instagram | B | | |

## Image (differentiator: in-browser, no upload)

| Query | Tool | Tier | Volume | Difficulty |
|---|---|---|---|---|
| remove EXIF metadata online | /image-tools (metadata) | A | | |
| compress image without uploading | /image-tools/compress | A | | |
| HEIC to JPG without upload | /image-tools/heic-to-jpg | A | | |
| PNG to WebP online | /image-tools/png-to-webp | B | | |
| JPG to PNG online | /image-tools/jpg-to-png | B | | |
| image to text OCR online | /image-tools/image-to-text | B | | |
| background remover online | /image-tools/remove-bg | C | | |
| image upscaler online | /image-tools/upscaler | C | | |

## PDF

| Query | Tool | Tier | Volume | Difficulty |
|---|---|---|---|---|
| compress PDF online | /pdf-tools/compress | C | | |
| merge PDF online | /pdf-tools/merge | C | | |
| split PDF online | /pdf-tools/split | C | | |
| PDF OCR online | /pdf-tools/ocr | B | | |
| PDF to Word online | /pdf-tools/pdf-to-word | C | | |
| sign PDF online | /pdf-tools/sign | B | | |

## Video

| Query | Tool | Tier | Volume | Difficulty |
|---|---|---|---|---|
| compress video without uploading | /video-tools/compress | A | | |
| video to GIF online | /video-tools/video-to-gif | B | | |
| MP4 to MP3 online | /video-tools/mp4-to-mp3 | B | | |
| subtitle generator online | /video-tools/subtitles | B | | |

## Downloader (differentiator: platforms less contested than YouTube)

| Query | Tool | Tier | Volume | Difficulty |
|---|---|---|---|---|
| vk video downloader | /downloader/vk | A | | |
| ok.ru video downloader | /downloader/ok | A | | |
| rutube downloader | /downloader/rutube | A | | |

## Rule for using this map

Spend on **Tier A** first: those are the terms where QRix's product is genuinely
better than the incumbents (it does the work in the browser / for free / forever),
so the page can make a true claim an answer engine will quote. Tier C head terms
are a backlink-authority game — do not burn content effort there until the domain
has links to compete.
