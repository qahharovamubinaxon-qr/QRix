# QRix media-proxy Worker

Streams downloaded media so the bytes never pass through Vercel — the fix for the
Fast Origin Transfer overage that paused the Hobby account (HTTP 402). Cloudflare
Workers have no egress charge, so the video/audio bytes are free here.

## How it fits

```
browser ──GET /api/download/file?t=…──▶ Vercel (resolves URL, cheap)
                                          │  302 redirect, signed
                                          ▼
browser ──GET https://qrix-media-proxy…?p=…──▶ this Worker ──▶ CDN
   ◀──────────────── streamed bytes ────────────────────────────┘
```

Vercel only turns the signed token into a real media URL, then redirects. This
Worker verifies the signature (same `CRON_SECRET`), fetches with the right
`Referer`, and streams the file back. It is switched on by setting
`MEDIA_PROXY_URL` on Vercel; unset, Vercel streams the bytes itself (unchanged).

## Deploy (owner — needs your Cloudflare account)

From `workers/media-proxy/`:

```bash
npm i -g wrangler        # if not installed
wrangler login           # opens your Cloudflare account in the browser
wrangler secret put MEDIA_SECRET
#   → paste the SAME value as CRON_SECRET in Vercel (must match exactly)
wrangler deploy
```

`wrangler deploy` prints the URL, e.g. `https://qrix-media-proxy.<you>.workers.dev`.

## Turn it on

Set one env var on Vercel (Project → Settings → Environment Variables), then redeploy:

```
MEDIA_PROXY_URL = https://qrix-media-proxy.<you>.workers.dev
```

Verify: download a VK and a TikTok video. The file should still arrive, and
Vercel's Usage → Fast Origin Transfer should stop climbing.

## Notes

- **Secret must match.** `MEDIA_SECRET` here === `CRON_SECRET` on Vercel, or every
  link returns 403.
- **Signed, not open.** A link is a 5-minute HMAC over the resolved URL; the
  Worker refuses anything it did not come from Vercel.
- **HLS (Rutube)** still streams through Vercel for now — it is stitched on the
  fly and is a small share. Port it here later if its transfer grows.
- **Custom domain (optional).** You can map the Worker to e.g.
  `dl.qrixtools.com` in the Cloudflare dashboard and set that as `MEDIA_PROXY_URL`.
