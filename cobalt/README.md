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

## The free route: your own PC, through Cloudflare

This costs nothing, forever, and needs no card, no server and no Docker. It
also has a real technical advantage over a rented box, not just a price one.

**Why it may work better than paying.** This address is known to work — see the
measurements below. VK is widely reported to treat datacenter ranges more
harshly than residential ones, so a rented server could buy an address VK likes
*less* than the one already in the house. Reported, not measured here: the
"Railway free trial" row in the table below is how to find out for certain,
without spending anything.

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

**What that does and does not prove.** It proves cobalt still solves VK and
Instagram, and that it does so from this home connection. It does **not** prove
a datacenter address would fail — the old rented instance died without leaving
a diagnosis, and "VK blocks datacenters" is the likeliest explanation, not a
measured one. It could equally have been expired hosting, a crashed container
or an old build.

That distinction matters, because it decides whether the machine has to stay
on. Railway's free trial settles it in half an hour for nothing: deploy cobalt
there, point `COBALT_API_URL` at it, run `npm run verify:daily`, and read the
VK line. If it says ok, the PC is not needed and any cheap host will do. If it
does not, the residential address is the reason this works and the PC stays.

Do that experiment before choosing where this lives permanently.

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
