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

## The zero-hosting route: your own PC, through Cloudflare

This costs nothing, forever, and needs no card, no server and no Docker. It
also has a real technical advantage over a rented box, not just a price one.

**When this is the right choice.** It is the zero-hosting option: nothing
rented, nothing to expire. It is NOT needed for VK — that theory was tested and
disproved (see below), so a datacenter host works fine and does not require
leaving a PC switched on. Use this route if you want no external dependency at
all, not because VK demands it.

Everything needed is already on the owner's machine: Node 24, git, and
`cloudflared` (already at `C:\Windows\System32\cloudflared.exe`). The
Cloudflare account already exists too — qrixtools.com is on it — so a
`cobalt.qrixtools.com` subdomain costs nothing and needs no new signup.

```bash
git clone https://github.com/imputnet/cobalt
cd cobalt/api
corepack enable pnpm
pnpm install
```

Create `api/.env` with the public address the tunnel will serve — cobalt puts
this into the links it hands out, so it must be the public one, not localhost:

```
API_URL=https://cobalt.qrixtools.com/
API_PORT=9000
```

Then run the two halves:

```bash
pnpm start
cloudflared tunnel --url http://localhost:9000
```

Finally set `COBALT_API_URL=https://cobalt.qrixtools.com` in Vercel and
redeploy.

### What this costs you instead of money

- **The PC has to be on.** When it sleeps, VK, Instagram, Facebook and X stop
  resolving. The other six platforms are unaffected — that is exactly what the
  fallback design buys, and why this trade is acceptable at all.
- **Home upload bandwidth** carries any media cobalt tunnels rather than
  redirects.
- **Disk is tight**: 4.7 GB free on C: at last check. The install is a few
  hundred MB and fits, but `C:\.android\sdk\ndk` is 4.3 GB of unused NDK if
  more room is ever needed.

### This was tested, not assumed

Run on the owner's own machine, 30 August 2026, cobalt 11.7.1 from source, no
Docker, no tunnel yet — just the local instance answering on :9000:

| Link | Result |
| --- | --- |
| `vkvideo.ru/video-229033973_456239171` | `tunnel` — *AY YOLA — Homay (Премьера клипа 2025)* |
| `instagram.com/reel/DcnQEC5Mndn/` | `redirect` — a real `fbcdn.net` .mp4 |
| `ok.ru/video/7475662490142` | `tunnel` |

Resolving is not delivering, so the VK tunnel was pulled as well:
**HTTP 200, `video/mp4`, 87,750,449 bytes in 49 s, first bytes `ftypisom`** — a
real, playable MP4.

So both dead platforms come back from this address, at no cost.

### The datacenter theory was wrong — measured, 30 August 2026

"VK blocks datacenter ranges, so the rented instance failed and a home address
is needed" was the working explanation. It was flagged as unproven, and then it
was tested on Railway's free trial. It is **wrong**.

`https://cobalt-production-eca4.up.railway.app` — cobalt 11.7.1, official
image, US datacenter:

| Link | Result |
| --- | --- |
| `vkvideo.ru/video-229033973_456239171` | `tunnel` — same title as from home |
| `instagram.com/reel/DcnQEC5Mndn/` | `redirect` — real `cdninstagram.com` .mp4 |

And the bytes, not just the resolve: **HTTP 200, `video/mp4`, 39,765,627 bytes
in 18 s, first bytes `ftypisom`.**

So VK is perfectly reachable from a datacenter. The previous instance died of
something ordinary — expired hosting, a crashed container, a stale build — and
the IP was never the problem. Which means:

- **The owner's PC does not need to stay on.** Any always-on host works.
- The residential-address argument for self-hosting evaporates; the free-PC
  route is now a fallback for someone who wants zero hosting, not the
  recommended path.
- Once the Railway trial ends, Oracle Cloud Always Free — also a datacenter —
  is a genuine forever-free home for this.

Worth keeping as a lesson: the failure was diagnosed from its shape rather than
measured, the diagnosis was plausible, and it was wrong. Half an hour on a free
trial was the whole cost of finding out.

### Without the main PC, but keeping the home address

Cloudflare Tunnel is only the pipe — it gives a local service a public https
address, so it does not remove the need for a machine. But that machine does
not have to be the main PC. Anything always-on inside the house keeps the
residential address, which is the part that is proven to work: an old laptop, a
mini PC, a Raspberry Pi, even an old Android phone running Termux.

Cloudflare cannot host cobalt itself on the free plans. Workers and Pages run a
restricted JavaScript runtime with short CPU limits and no ffmpeg; cobalt needs
a full Node process and long-lived streams. Cloudflare's container product is a
paid add-on.

## The 29 September decision, costed

The Railway trial started 30 August 2026 and its $5 credit lasts 30 days. When
it runs out VK, Instagram, Facebook and X stop resolving — roughly a third of
the site's traffic arrives at `/downloader/vk` alone.

**Writing our own VK extractor is not an option, and this was tested rather
than assumed.** Four routes, all dead ends:

| Attempt | Result |
| --- | --- |
| Plain page fetch | anti-bot interstitial, then a redirect loop |
| `video_ext.php` with a cookie jar | real embed page, but the media URLs are not in it — the modern player fetches them separately |
| `al_video.php` with a cookie jar | 819 bytes, no media, no error |
| Official API | needs business verification with SWIFT and bank-card details |

So something cobalt-shaped is required. What it costs:

| Option | Monthly | Notes |
| --- | --- | --- |
| **Owner's PC + Cloudflare Tunnel** | **$0** | Already proven: pulled 87 MB of VK video from this address. Needs the machine switched on; when it sleeps, four platforms pause and six keep working. |
| **Railway Hobby** | **$5** | No server to administer. The estimate below says usage lands inside the included credit. |
| Hetzner CX22 | ~€7.99 EU / ~$4.59 US | 20 TB traffic included, so spikes are free. You manage Docker. |
| Contabo | ~$4–7 | More RAM per euro, less consistent performance. |

### Why Railway should fit inside its $5

Egress is $0.05/GB there, and VK downloads TUNNEL through cobalt — every byte
the visitor saves crosses Railway. So the bill is traffic-shaped, not
subscription-shaped, and worth estimating rather than guessing:

- measured last week: 9 `tool_used` downloader events, 2 of them an actual
  `download`, against 109 visitors on `/downloader/vk`
- one VK video measured at 87 MB; call it 50 MB average
- even at ten times the measured completion rate — ~20 downloads a week —
  that is ~4 GB/month, about **$0.20** of egress
- an idle cobalt container is roughly **$3–4/month** of RAM and CPU

Total ≈ $4, inside the $5 credit. **But the shape of the risk is worth naming:
a single popular video, or one visitor pulling 1080p repeatedly, moves egress
faster than anything else on the bill.** Hetzner's included 20 TB removes that
variable entirely, which is why it is worth considering despite costing more at
rest.

Numbers checked 2 September 2026.

## Where to run it, if you would rather not use your own PC

It needs a machine with Docker and a public address.

**Test before paying.** Nobody has yet proved that a cobalt instance on rented
hardware brings VK back — the old one worked, but from an address we no longer
know. VK is hostile to datacenter ranges, so the answer depends on where the
server sits, and that is worth finding out for free rather than by subscription.

Prices checked August 2026; they move, so re-check before committing.

| Option | Cost | Card needed | Notes |
| --- | --- | --- | --- |
| **Railway free trial** | $0, $5 credit, 30 days | **No** | One-click cobalt template. Run this first — it is the experiment that says whether a datacenter address works for VK, and it costs nothing. |
| **Oracle Cloud Always Free** | $0 forever | Yes, for identity | 2 OCPU / 12 GB ARM (halved from 4/24 on 18 Aug 2026). Genuinely free with no time limit, but "out of host capacity" is common and it is still a datacenter address. |
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

## The live instance

Deployed 30 August 2026 on Railway's free trial, under
`qahharovamubinaxon@gmail.com`, project **qrix-cobalt**, service **cobalt**.

```
https://cobalt-production-eca4.up.railway.app
```

Set in Vercel as:

```
COBALT_API_URL = https://cobalt-production-eca4.up.railway.app
```

Managed from the CLI (`npm i -g @railway/cli`, `railway login`):

```bash
railway logs --service cobalt
railway variables --service cobalt
railway redeploy --service cobalt
```

### Two things to know about it

**It is publicly reachable and unprotected.** Anyone who finds the URL can use
it. The trial has no card attached, so the worst case is the $5 credit running
out and the instance stopping — it cannot generate a bill. If it is ever kept
past the trial, add an API key (`API_KEY_URL`) and set the same value in Vercel
as `COBALT_API_KEY`; QRix already sends it.

**The trial is 30 days.** When it ends, either move to Railway Hobby ($5/mo) or
redeploy the same image on Oracle Cloud Always Free, which costs nothing
indefinitely. Nothing in QRix changes either way — only the one env var, and it
accepts a comma-separated list so both can run at once during a move.
