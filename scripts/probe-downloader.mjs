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
import { resolveMedia, verifyMedia, MEDIA_UA } from "../lib/server/media-download.ts";
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

/* The resolver's own token is opaque on purpose, so reach past it: sign-free
   HEAD on the underlying URL tells us whether the CDN would really serve it. */
async function reachable(url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 15000);
  try {
    let r = await fetch(url, { method: "HEAD", headers: { "User-Agent": MEDIA_UA }, signal: c.signal });
    // some CDNs refuse HEAD but stream fine — fall back to a 1-byte range GET
    if (r.status === 405 || r.status === 403) {
      r = await fetch(url, { headers: { "User-Agent": MEDIA_UA, Range: "bytes=0-0" }, signal: c.signal });
    }
    const len = Number(r.headers.get("content-length") || 0);
    return { ok: r.ok || r.status === 206, status: r.status, len, type: r.headers.get("content-type") || "" };
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
    const res = await reachable(d.url);
    console.log(`     media: ${res.ok
      ? `${res.status} ${res.type} ${res.len ? Math.round(res.len / 1024) + " KB" : "streaming"}`
      : `${res.status || res.err} — resolves but will NOT download`}`);
    if (!res.ok) failed++;
  } else if (d) {
    console.log(`     media: re-resolved at download time (${d.kind}) — not checked here`);
  }
}

console.log(`\n${urls.length - failed}/${urls.length} link(s) delivered`);
process.exit(failed);
