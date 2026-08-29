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

## Why not the official APIs

This is the obvious question and the answer is no for both, for different
reasons. Checked August 2026.

**Instagram — no such API exists.** Meta's Graph API only reaches accounts you
own or manage, and only Professional (Business/Creator) accounts have any API
access at all. There is no endpoint, at any price tier, that returns the media
of an arbitrary public reel. Every service that downloads Instagram posts is
scraping; none of them is using an API, whatever their marketing says.

**VK — an API exists, but not one this product can use.** Three separate walls,
and any one of them is enough:

1. Creating an app requires profile verification within 60 days or the app is
   blocked. That verification is what asked for SWIFT and bank-card details.
2. A *service* key only works for VK's "open" methods. `video.get` is not one
   of them — it needs a **user** token.
3. A user token acts as that person's own account. Pointing a public
   downloader at the owner's personal VK account risks the account, not just
   the feature.

So for both platforms the only working route is the one cobalt already takes.
That is not a workaround; it is the actual state of the world.

**Paid third-party APIs** do exist for both, and what they sell is the
scraping, maintained for you. That is a real option, it costs money monthly,
and reliability varies — it is the owner's call, and nothing here assumes it.

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

It needs a machine with Docker and a public address.

**Test before paying.** Nobody has yet proved that a cobalt instance on rented
hardware brings VK back — the old one worked, but from an address we no longer
know. VK is hostile to datacenter ranges, so the answer depends on where the
server sits, and that is worth finding out for free rather than by subscription.

Prices checked August 2026; they move, so re-check before committing.

| Option | Cost | Card needed | Notes |
| --- | --- | --- | --- |
| **Railway free trial** | $0, $5 credit, 30 days | **No** | One-click cobalt template. The right first step: it answers "does cobalt fix VK" at no cost and no risk. |
| Railway Hobby | $5/mo (includes $5 usage) | Yes | If the trial works and you want it to stay. No server to administer. |
| Hetzner CX22 | ~€7.99/mo EU, ~$4.59/mo US | Yes | A real VPS, 2 vCPU / 4 GB. Cheapest in the US locations. You manage Docker yourself. |
| Contabo | from ~$4–7/mo | Yes | More RAM per euro; performance is less consistent. |
| A machine you already own | free | — | Only if it is always on AND reachable from the internet. Home connections usually are not. |

### Where the server sits matters more than what it costs

Two constraints pull in opposite directions, and this is the reason
`COBALT_API_URL` accepts a list:

- **VK** is far more permissive toward addresses in Russia and the CIS than
  toward Western datacenter ranges.
- **Instagram** is blocked from inside Russia, so a Russian server may not be
  able to reach it at all.

One instance may therefore not serve both. If that turns out to be the case,
run two small ones and list both:

```
COBALT_API_URL = https://ru-instance.example,https://eu-instance.example
```

Do not plan for two before testing one. Deploy a single instance, run
`npm run verify:daily`, and let the canary say which platforms actually came
back. Buying a second server for a problem that has not appeared is how a
five-dollar fix becomes a monthly bill.

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
