# cobalt — bringing VK and Instagram back

## What this is for

QRix's downloader reads seven platforms with its own code and needs nothing
here for them:

| Read in-process, no dependency | Needs cobalt |
| --- | --- |
| TikTok · SoundCloud · Vimeo · Pinterest · Odnoklassniki · Telegram · Rutube | **VK · Instagram · Facebook · X** |

That split is deliberate. cobalt used to be the only route for *everything*,
and when the previous instance stopped answering, `/downloader/vk` — the
most-visited page on the site — served 107 sessions in a week and delivered
nothing to anyone. Losing cobalt now costs four platforms instead of all of
them.

But one of those four is VK, which is where most of the downloader's traffic
goes. So this is worth restoring.

## Why not just write our own VK extractor

It was tried, and the finding is worth keeping:

- VK serves scrapers an anti-bot interstitial — HTTP 200, ordinary HTML, no
  media. Not an error, so naive code reports it as "video not found".
- With a cookie jar and manual redirects, `vk.com/video_ext.php` does return a
  real embed page — but the media URLs are **not in it**. The modern player
  fetches its sources through a separate authenticated call.
- VK's official API needs business verification with SWIFT and bank-card
  details, which is not a reasonable price for one download route.

So a VK extractor is not a file you write once; it is a moving target that
breaks whenever VK changes something. That is exactly the job cobalt does full
time, which is why the answer is to run cobalt rather than to reimplement it
badly.

## Deploying

Everything is in `docker-compose.yml`, with the steps in its header comment.
The short version:

```bash
docker compose up -d
```

Three things decide whether it works:

1. **`API_URL` must be the public address**, with a trailing slash. cobalt
   embeds it in the download links it returns, so a wrong value breaks every
   download while the instance itself looks perfectly healthy.
2. **`COBALT_API_URL` in Vercel** must point at it. QRix accepts a
   comma-separated list, so a second instance can be added later with no code
   change — which is the whole point of what happened before.
3. **Protect it if it is publicly reachable.** Anyone who finds the address can
   use it at your expense. Set an API key and put the same value in Vercel as
   `COBALT_API_KEY`; QRix already sends it.

## Where to run it

It needs a machine with Docker and a public address. Any small VPS does. There
is also a one-click Railway template if you would rather not manage a server.

Costs are the owner's call and are not assumed here — check the current price
before committing to anything, since free tiers change and most now want a card
on file.

## Checking it actually works

From the repo:

```bash
npm run verify:daily
```

The downloader canary asks **production** to resolve a real link on each
platform and prints what it got. Before cobalt is connected, VK reports
`vk_needs_api` and is labelled *expected*. After it is connected, VK should
report a format count like the others.

For a single link:

```bash
npm run probe:downloader "https://vkvideo.ru/video-229033973_456239171"
```

That one goes further than resolving — it reaches past the signed token to
check the media URL will really serve, because a resolver can hand back a link
that 403s at download time. "The URL responds" and "the tool works" are
different questions, and confusing them is what cost a fortnight.
