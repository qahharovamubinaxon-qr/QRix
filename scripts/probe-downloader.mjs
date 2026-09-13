/* Does the downloader actually DELIVER? — run against real links.
   ───────────────────────────────────────────────────────────────────────────
   This exists because the site's most-visited page spent a fortnight serving
   traffic that got nothing. GA said 99 users on /downloader/vk and zero
   successful events; the page answered 200 the whole time. "The URL responds"
   and "the tool works" turned out to be completely different questions, and
   only one of them was being asked.

   So this calls resolveMedia() the way the API route does, and then goes one
   step further: it HEAD-checks the first format's real media URL, because a
   resolver can happily hand back a link that 403s at download time.

     node scripts/probe-downloader.mjs                      the built-in set
     node scripts/probe-downloader.mjs <url> [url…]         your own links

   Exit code is the number of links that failed, so CI can gate on it.

   A note on test URLs: made-up video ids fail in a way that looks exactly like
   a broken extractor, and that cost an hour the first time. Every default
   below is a real, public, long-lived post. When adding one, open it in a
   browser first. */
import { resolveMedia, verifyMedia, streamHls, MEDIA_UA } from "../lib/server/media-download.ts";
import { detectPlatform } from "../lib/downloader-platforms.ts";

/* Real public posts. Fill in the platforms we could not verify yet — VK, OK,
   Telegram, Rutube, Instagram — as soon as links for them are to hand; until
   then this script honestly covers only what it can reach. */
const DEFAULTS = [
  "https://www.tiktok.com/@tiktok/video/7106594312292453675",
  "https://vimeo.com/76979871",
  "https://www.pinterest.com/pin/99360735500167749/",
];

const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULTS;

/* Delivery is checked through PRODUCTION, not from this machine.

   Two reasons, both learned the hard way. (1) A locally-signed token cannot be
   replayed against production — CRON_SECRET/MEDIA_PROXY_SECRET live only on
   Vercel — so the probe must ask the live resolver for its own token. (2) This
   machine's ISP cannot reach TikTok's CDN at all, so a direct fetch from here
   returned "fetch failed" and the probe reported a broken download for a file
   that downloads perfectly through the site. A check that tests a different
   request from the real one is worse than no check: it cries wolf every run,
   and then a genuine failure gets ignored.

   So this walks the exact path a visitor walks: resolve on the live site, hit
   /api/download/file, follow the 302 to the media-proxy Worker, read the bytes. */
const SITE = process.env.QRIX_ORIGIN || "https://qrixtools.com";

async function deliverable(pageUrl) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 90000);
  try {
    const r1 = await fetch(`${SITE}/api/download?url=${encodeURIComponent(pageUrl)}`, {
      headers: { "User-Agent": MEDIA_UA }, signal: c.signal,
    });
    if (!r1.ok) return { ok: false, status: r1.status, len: 0, type: "", err: `resolver ${r1.status}` };
    const j = await r1.json();
    const token = j?.formats?.[0]?.token;
    if (!token) return { ok: false, status: 0, len: 0, type: "", err: "live resolver returned no format" };

    const r2 = await fetch(`${SITE}/api/download/file?t=${encodeURIComponent(token)}`, {
      headers: { "User-Agent": MEDIA_UA }, redirect: "follow", signal: c.signal,
    });
    if (!r2.ok || !r2.body) return { ok: false, status: r2.status, len: 0, type: "", err: `file route ${r2.status}` };

    /* Read a little of the body rather than trusting the status: a 200 that
       yields zero bytes is the failure this script exists to catch. */
    const reader = r2.body.getReader();
    let bytes = 0, first = null;
    while (bytes < 65536) {
      const { done, value } = await reader.read();
      if (done) break;
      if (first === null && value?.length) first = value[0];
      bytes += value?.length || 0;
    }
    reader.cancel().catch(() => {});
    const len = Number(r2.headers.get("content-length") || 0);
    return {
      ok: bytes > 0, status: r2.status, len: len || bytes,
      type: r2.headers.get("content-type") || "", partial: !len, first,
    };
  } catch (e) {
    return { ok: false, status: 0, len: 0, type: "", err: e.message };
  } finally { clearTimeout(t); }
}

let failed = 0;
for (const url of urls) {
  const p = detectPlatform(url);
  const name = (p?.name || "unknown").padEnd(14);
  let info;
  try {
    info = await resolveMedia(url);
  } catch (e) {
    console.log(`FAIL ${name} threw: ${e.message}\n     ${url}`);
    failed++;
    continue;
  }

  if (!info.ok) {
    console.log(`FAIL ${name} ${info.error}\n     ${url}`);
    failed++;
    continue;
  }

  const kinds = [...new Set(info.formats.map((f) => f.type))].join("+");
  console.log(`ok   ${name} ${info.formats.length} format(s) [${kinds}]  "${String(info.title).slice(0, 48)}"`);

  /* Resolving is only half the promise. If the media URL itself will not
     serve, the user still ends up with nothing — which is the exact failure
     this whole exercise is about. */
  const d = info.formats[0]?.token ? verifyMedia(info.formats[0].token) : null;
  if (d?.kind === "direct") {
    const res = await deliverable(url);
    console.log(`     media: ${res.ok
      ? `${res.status} ${res.type} ${Math.round(res.len / 1024)} KB${res.partial ? "+ (streaming)" : ""} via live site`
      : `${res.err || res.status} — resolves but will NOT download`}`);
    if (!res.ok) failed++;
  } else if (d?.kind === "hls") {
    /* An HLS format is assembled from many segment fetches, so "the playlist
       parsed" proves nothing. Pull the first few segments and check the sync
       byte: 0x47 is what makes the bytes a real MPEG-TS the browser can remux.
       Without this the format list looks healthy while the download is empty —
       the exact failure mode this whole script exists for. */
    const stream = await streamHls(d.playlistUrl).catch(() => null);
    if (!stream) {
      console.log("     media: playlist parsed but yields no stream");
      failed++;
    } else {
      const reader = stream.getReader();
      let bytes = 0, segs = 0, first = null;
      try {
        while (segs < 3) {
          const { done, value } = await reader.read();
          if (done) break;
          if (first === null) first = value[0];
          bytes += value.length; segs++;
        }
      } catch (e) {
        console.log(`     media: segment fetch failed — ${e.message}`);
        failed++;
      }
      reader.cancel().catch(() => {});
      if (segs) {
        const ts = first === 0x47;
        console.log(`     media: ${segs} segment(s), ${Math.round(bytes / 1024)} KB, ${ts ? "valid MPEG-TS" : `first byte 0x${first?.toString(16)} — NOT MPEG-TS`}`);
        if (!ts) failed++;
      }
    }
  } else if (d) {
    console.log(`     media: re-resolved at download time (${d.kind}) — not checked here`);
  }
}

console.log(`\n${urls.length - failed}/${urls.length} link(s) delivered`);
process.exit(failed);
