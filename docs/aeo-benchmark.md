# QRix — AEO / answer-engine benchmark

A repeatable check of where QRix actually appears for the queries it should win.
**This is verifiable data only.** Rankings that were not tested are marked
`not tested`, never guessed — the mission rules forbid claiming a position that
was not observed.

**First run: 3 September 2026**, via `WebSearch` (Google web results, US).
AI-Overview / ChatGPT / Perplexity columns require testing in those products
directly and are left for the owner to fill — see *How to run* below.

---

## The honest headline

For the three high-intent queries tested — including two where QRix has a genuine
product differentiator (no-upload, no-signup) — **qrixtools.com did not appear in
Google's first page of web results.** The niche is already held by established
domains with backlink authority.

This is consistent with what GA already shows: QRix's real traffic channel today
is **AI referral (ChatGPT), not Google organic** (`npm run ga:channel`). The
implication is strategic and specific: on-page SEO is already excellent (0 P0 /
0 P1), so the missing ingredient is **off-site authority** (Phase 24 outreach) and
**AI-answer citability**, not more meta-tag work.

## Verified results — 3 Sep 2026

| # | Query | Google position of qrixtools.com | Who ranks instead |
|---|---|---|---|
| 9 | compress image without uploading | **not in top 10** | imagecompressor.com, picdiet, compressimage.io, iloveimg |
| 1 | free QR code no expiry / no signup | **not in top 10** | guestcam, qr-creator, tinyqr, qrtrac, me-qr |
| — | vk video downloader online | **not in top 10** | luxa.org, vkvideodownload.com, snapany, snapwc |

The VK row is notable: QRix's `/downloader/vk` is its single most-visited page,
but the visits arrive from ChatGPT, not this Google SERP. Google organic and AI
referral are behaving as two separate channels here.

## The 30-query panel (to test each run)

Test in **Google web**, **Google AI Overview**, **ChatGPT Search**, **Perplexity**.
For each, record: position, page, AI-Overview presence, whether a QRix URL is cited,
and the date.

```
1  free QR code no expiry            16 merge PDF online
2  QR code without signup            17 split PDF online
3  QR code without watermark         18 compress PDF online
4  WiFi QR code generator            19 PDF OCR online
5  App Store QR code generator       20 PDF to Word online
6  vCard QR code generator           21 sign PDF online
7  Instagram QR code generator       22 video compressor online
8  remove EXIF metadata online       23 video to GIF online
9  compress image without uploading  24 MP4 to MP3 online
10 compress video without uploading  25 subtitle generator online
11 HEIC to JPG without upload        26 AI image generator online
12 PNG to WebP online                27 free online image tools
13 JPG to PNG online                 28 free online PDF tools
14 image converter online           29 vk video downloader
15 image to text OCR online          30 background remover online
```

## Where QRix has the best honest shot

Not the generic head terms (owned by iLovePDF/TinyPNG-class domains), but the
**differentiator long-tail** the product actually delivers:

- `... without uploading` / `... in your browser` — QRix genuinely processes
  in-browser for its device-side tools; most competitors upload. This claim is
  true and rare, and it is exactly what an answer engine can quote.
- `QR code without signup / no expiry / no watermark` — true of QRix's static QR.
- Platform downloaders where the head term is less contested than YouTube (VK,
  OK.ru, Rutube) — QRix already earns AI-referral traffic here.

Winning these needs authority + citability, not more on-page tags.

## How to run

- **Google web / AI Overview:** `WebSearch` gives web results; AI Overviews must be
  read in a real Google session (they are not in the WebSearch payload).
- **ChatGPT Search / Perplexity:** ask the product each query and note whether a
  `qrixtools.com` URL is cited.
- Append a dated block below each run so trend is visible over time.
