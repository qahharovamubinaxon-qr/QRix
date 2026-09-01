/* Social-media media extraction — SERVER ONLY.

   resolveMedia(pageUrl) returns normalized info (title, thumbnail, author) plus
   a list of downloadable formats (video / audio / image, with quality labels).
   Each format carries a SIGNED token, not a raw URL: the file proxy
   (/api/download/file) only streams media this server signed, so the endpoint
   can never be turned into an open fetch proxy for arbitrary hosts.

   Two token kinds:
     - direct   ("d") — a concrete CDN URL we allowlist-check at stream time.
     - resolver ("c" cobalt / "s" soundcloud) — the ORIGINAL page URL; the file
       proxy re-resolves it at download time and streams the fresh result.
       cobalt "tunnel" links expire in minutes, so signing them directly breaks
       the download button — re-resolving makes expiry impossible.

   Provider order per platform, best first:
     1. our own in-process extractors — TikTok (tikwm), SoundCloud, Vimeo,
        Pinterest, Odnoklassniki, Telegram, and VK through the official API.
        All keyless except VK; none depend on a machine we have to keep alive.
     2. cobalt — a self-hosted instance (COBALT_API_URL), now a FALLBACK rather
        than the primary route. It was the only provider for most platforms
        until it stopped answering, at which point the site's most-visited page
        served a week of traffic without delivering one file.
     3. direct media passthrough (…/x.mp4).

   YouTube is intentionally unsupported (AdSense policy — see downloader-platforms). */

import crypto from "node:crypto";
import { detectPlatform, SUPPORTED_DOMAINS } from "@/lib/downloader-platforms";

export type MediaFormat = {
  id: string;
  type: "video" | "audio" | "image";
  container: string;   // mp4, webm, mp3, m4a, jpg, png, webp…
  quality: string;     // "HD", "720p", "Original", "128 kbps"…
  label: string;       // human label for the button
  token: string;       // signed handle → /api/download/file?t=<token>
  size?: number;
  /** the proxy will deliver MPEG-TS; the browser has to remux it to MP4 */
  remux?: boolean;
};

export type MediaInfo = {
  ok: true;
  platform: string;
  platformName: string;
  title: string;
  thumbnail?: string;
  author?: string;
  duration?: number;
  formats: MediaFormat[];
};

export type MediaError = { ok: false; error: string };

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const TOKEN_TTL_MS = 3 * 60 * 60 * 1000; // 3h — long enough to pick a format & download

/* ── signed download tokens ───────────────────────────────────── */
function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}
function secret(): string {
  return process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "qrix-dev-secret";
}
function hostOf(u: string): string {
  try { return new URL(u).hostname.toLowerCase(); } catch { return ""; }
}
/* Our cobalt instance. Checked in deliberately, and it is NOT a secret — it is
   a public HTTPS endpoint, not a key. It lives here because the alternative
   was leaving VK and Instagram broken: the env var can only be set from the
   Vercel dashboard, the owner is locked out behind a 2FA method they no longer
   have, and the resolver was already working. Code ships through git; an env
   var does not.

   COBALT_API_URL still wins when set, and it accepts a COMMA-SEPARATED list —
   one instance being the only route is why those platforms went dark for a
   fortnight, so a list is tried in order and a dead box costs one timeout
   rather than the feature.

   MAINTENANCE: this default is a Railway free trial started 2026-08-30 and it
   expires after 30 days. When it does, VK/Instagram/Facebook/X stop resolving
   and `npm run verify:daily` says so on the downloader canary line. Replace
   the constant, or set COBALT_API_URL and forget it. */
const COBALT_DEFAULT = "https://cobalt-production-eca4.up.railway.app";

function cobaltEndpoints(): string[] {
  /* APPENDED to the env value, not overridden by it. The env var is already
     set in production — to the instance that died — so treating it as the
     winner left VK broken even with a working endpoint compiled in. The list
     is tried in order and a dead entry costs one timeout, so carrying both is
     strictly better than trusting either. */
  const list = [
    ...(process.env.COBALT_API_URL || "").split(","),
    COBALT_DEFAULT,
  ].map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
  return [...new Set(list)];
}
function cobaltHosts(): string[] {
  return cobaltEndpoints().map(hostOf).filter(Boolean);
}

function signPayload(p: Record<string, unknown>): string {
  const payload = b64url(JSON.stringify(p));
  const sig = b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
  return `${payload}.${sig}`;
}
export function signMedia(url: string, filename: string, mime: string): string {
  return signPayload({ k: "d", u: url, f: filename, m: mime, e: Date.now() + TOKEN_TTL_MS });
}

export type VerifiedToken =
  | { kind: "direct"; url: string; filename: string; mime: string }
  | { kind: "cobalt"; pageUrl: string; mode: "auto" | "audio"; index?: number; filename: string; mime: string }
  | { kind: "soundcloud"; pageUrl: string; filename: string; mime: string }
  | { kind: "hls"; playlistUrl: string; filename: string; mime: string };

export function verifyMedia(token: string): VerifiedToken | null {
  try {
    const [payload, sig] = String(token || "").split(".");
    if (!payload || !sig) return null;
    const expect = b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
    const a = Buffer.from(sig), b = Buffer.from(expect);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const p = JSON.parse(unb64url(payload).toString());
    if (!p?.u || Date.now() > p.e) return null;
    const filename = p.f || "download";
    const mime = p.m || "application/octet-stream";
    const kind = p.k || "d"; // tokens signed before the "k" field existed are direct

    if (kind === "c") {
      // re-resolve via cobalt — only ever for a URL on a supported platform
      if (!detectPlatform(p.u)) return null;
      return { kind: "cobalt", pageUrl: p.u, mode: p.d === "audio" ? "audio" : "auto", index: typeof p.i === "number" ? p.i : undefined, filename, mime };
    }
    if (kind === "s") {
      if (!/(^|\.)(soundcloud\.com|snd\.sc)$/.test(hostOf(p.u))) return null;
      return { kind: "soundcloud", pageUrl: p.u, filename, mime };
    }
    if (kind === "h") {
      /* An HLS playlist is a list of segment URLs, so signing it hands the
         proxy a fetch list rather than one file. Restricted to the CDNs that
         actually serve our HLS platforms, or the signature becomes a way to
         make the server walk an arbitrary playlist. */
      if (!/(rutube\.ru|rtbcdn\.ru)$/.test(hostOf(p.u))) return null;
      return { kind: "hls", playlistUrl: p.u, filename, mime };
    }

    /* direct: defence in depth — only ever proxy from a supported media / CDN
       host, or our own cobalt instance (tunnel streams).

       This list is only as good as the hosts we have actually SEEN. Odnoklassniki
       hands out a different CDN depending on where the request comes from: from
       Uzbekistan it answered mycdn.me, which was allowlisted, while from Vercel's
       us-east range it answered vkuser.net, which was not — so the resolver
       worked locally and every real download 403'd with bad_token. A local pass
       proves nothing about which CDN production will be given. */
    const host = hostOf(p.u);
    const cobs = cobaltHosts();
    const ok = SUPPORTED_DOMAINS.some((d) => host.includes(d)) ||
      /(tikwm\.com|tiktokcdn|fbcdn|cdninstagram|pinimg|vkuservideo|vkuseraudio|vk-cdn|mycdn\.me|akamaized|akamaihd|vimeocdn|sndcdn|twimg|ttwstatic|muscdn|bcbits|dmcdn|byteoversea|redditvideo|redd\.it|v\.redd|pinterest|okcdn|mvk\.com|telesco\.pe|cdn-telegram\.org|vkvideo\.ru|userapi\.com|rtbcdn\.ru|rutube\.ru|vkuser\.net|okcdn\.ru|ok\.ru)/.test(host) ||
      cobs.includes(host);
    if (!ok) return null;
    return { kind: "direct", url: p.u, filename, mime };
  } catch { return null; }
}

/* ── helpers ──────────────────────────────────────────────────── */
const slug = (s: string) => (s || "qrix-download").replace(/[^\w\-. ]+/g, "").trim().slice(0, 60) || "qrix-download";
const label = (type: MediaFormat["type"], container: string, quality: string) =>
  type === "audio" ? `Audio · ${container.toUpperCase()}` : type === "image" ? `Image · ${container.toUpperCase()}` : `Video · ${quality}`;
const fmt = (type: MediaFormat["type"], container: string, quality: string, url: string, title: string): MediaFormat => ({
  id: `${type}-${container}-${quality}`.replace(/\s+/g, ""),
  type, container, quality,
  label: label(type, container, quality),
  token: signMedia(url, `${slug(title)}.${container}`, mimeFor(container)),
});
/** A format whose token re-resolves the PAGE at download time (never expires). */
const fmtVia = (k: "c" | "s", type: MediaFormat["type"], container: string, quality: string, pageUrl: string, title: string, mode: "auto" | "audio" = "auto", index?: number): MediaFormat => ({
  id: `${type}-${container}-${quality}${index != null ? `-${index}` : ""}`.replace(/\s+/g, ""),
  type, container, quality,
  label: label(type, container, quality),
  token: signPayload({ k, u: pageUrl, d: mode, ...(index != null ? { i: index } : {}), f: `${slug(title)}.${container}`, m: mimeFor(container), e: Date.now() + TOKEN_TTL_MS }),
});
/** A format whose bytes are assembled from an HLS playlist at download time.
    `remux` tells the client the stream arrives as MPEG-TS and has to be turned
    into MP4 in the browser — the same shape as the existing audio-extract
    path, so the progress UI already knows how to show it. */
const fmtHls = (quality: string, playlistUrl: string, title: string): MediaFormat => ({
  id: `video-mp4-${quality}`.replace(/\s+/g, ""),
  type: "video", container: "mp4", quality,
  label: label("video", "mp4", quality),
  remux: true,
  token: signPayload({ k: "h", u: playlistUrl, f: `${slug(title)}.ts`, m: "video/mp2t", e: Date.now() + TOKEN_TTL_MS }),
});
function mimeFor(container: string): string {
  const m: Record<string, string> = { mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
  return m[container.toLowerCase()] || "application/octet-stream";
}
function extOf(url: string): string {
  try { const p = new URL(url).pathname.toLowerCase(); const m = p.match(/\.(mp4|webm|mp3|m4a|ogg|jpg|jpeg|png|webp|gif)(?:$|[?#])/); return m ? m[1] : ""; } catch { return ""; }
}
function extOfName(name: string): string {
  const m = String(name || "").toLowerCase().match(/\.(mp4|webm|mp3|m4a|ogg|jpg|jpeg|png|webp|gif)$/);
  return m ? m[1] : "";
}

/* ── short links (t.co, reddit /s/, redd.it…) → real page URL ─── */
function isShortLink(u: string): boolean {
  try {
    const { hostname, pathname } = new URL(u);
    const h = hostname.toLowerCase().replace(/^www\./, "");
    if (["t.co", "redd.it", "snd.sc", "dai.ly"].includes(h)) return true;
    if (/(^|\.)reddit\.com$/.test(h) && /\/s\//.test(pathname)) return true;
    return false;
  } catch { return false; }
}
async function unshorten(u: string, signal: AbortSignal): Promise<string> {
  let cur = u;
  for (let hop = 0; hop < 3 && isShortLink(cur); hop++) {
    const r = await fetch(cur, { redirect: "manual", headers: { "User-Agent": UA }, signal }).catch(() => null);
    const loc = r && r.status >= 300 && r.status < 400 ? r.headers.get("location") : null;
    if (!loc) break;
    cur = new URL(loc, cur).toString();
  }
  return cur;
}

/* ── provider: cobalt (self-hosted) ───────────────────────────── */
async function cobaltCall(url: string, mode: "auto" | "audio", signal?: AbortSignal): Promise<any | null> {
  const endpoints = cobaltEndpoints();
  if (!endpoints.length) return null;
  for (const api of endpoints) {
    const r = await fetch(`${api}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(process.env.COBALT_API_KEY ? { Authorization: `Api-Key ${process.env.COBALT_API_KEY}` } : {}) },
      body: JSON.stringify({ url, downloadMode: mode, videoQuality: "1080", audioFormat: "mp3", filenameStyle: "basic" }),
      ...(signal ? { signal } : {}),
    }).catch(() => null);
    if (!r?.ok) continue;                       // dead or refusing — try the next
    const j = await r.json().catch(() => null);
    /* An instance that answers "error" for this URL is not necessarily broken —
       the video may be private. But a second instance sometimes succeeds where
       the first cannot (different IP, different cookies), so keep going and
       only give up once every endpoint has had a turn. */
    if (j && j.status !== "error") return j;
  }
  return null;
}

async function viaCobalt(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const v = await cobaltCall(url, "auto", signal);
  if (!v || v.status === "error") return null;

  const p = detectPlatform(url);
  const title = v.filename?.replace(/\.[a-z0-9]+$/i, "") || `${p?.name || "media"} download`;
  const cobs = cobaltHosts();
  const tunnel = (u: string) => cobs.includes(hostOf(u));
  const formats: MediaFormat[] = [];
  let thumbnail: string | undefined;

  if (v.status === "picker" && Array.isArray(v.picker)) {
    v.picker.forEach((it: any, i: number) => {
      if (!it?.url) return;
      const isImg = it.type === "photo";
      thumbnail ||= it.thumb || (isImg ? it.url : undefined);
      const c = extOf(it.url) || (isImg ? "jpg" : "mp4");
      formats.push(tunnel(it.url)
        ? fmtVia("c", isImg ? "image" : "video", c, isImg ? "Original" : "HD", url, `${title}-${i + 1}`, "auto", i)
        : fmt(isImg ? "image" : "video", c, isImg ? "Original" : "HD", it.url, `${title}-${i + 1}`));
    });
    if (v.audio?.url) {
      formats.push(tunnel(v.audio.url)
        ? fmtVia("c", "audio", "mp3", "128 kbps", url, title, "audio")
        : fmt("audio", "mp3", "128 kbps", v.audio.url, title));
    }
  } else if ((v.status === "tunnel" || v.status === "redirect") && v.url) {
    const c = extOfName(v.filename) || extOf(v.url) || "mp4";
    formats.push(tunnel(v.url)
      ? fmtVia("c", "video", c, "HD", url, title, "auto")
      : fmt("video", c, "HD", v.url, title));
    const a = await cobaltCall(url, "audio", signal);
    if (a && (a.status === "tunnel" || a.status === "redirect") && a.url) {
      formats.push(tunnel(a.url)
        ? fmtVia("c", "audio", "mp3", "128 kbps", url, title, "audio")
        : fmt("audio", "mp3", "128 kbps", a.url, title));
    }
  }
  if (!formats.length) return null;
  return { ok: true, platform: p?.id || "web", platformName: p?.name || "Web", title, thumbnail, formats };
}

/** Called by the file proxy at download time — returns a FRESH stream URL. */
export async function resolveCobaltStream(pageUrl: string, mode: "auto" | "audio", index?: number): Promise<string | null> {
  const v = await cobaltCall(pageUrl, mode);
  if (!v || v.status === "error") return null;
  if ((v.status === "tunnel" || v.status === "redirect") && v.url) return v.url;
  if (v.status === "picker" && Array.isArray(v.picker)) {
    if (mode === "audio" && v.audio?.url) return v.audio.url;
    return v.picker[index ?? 0]?.url || null;
  }
  return null;
}

/* ── provider: TikTok via tikwm (keyless, no watermark) ───────── */
async function viaTikwm(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const r = await fetch("https://www.tikwm.com/api/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: new URLSearchParams({ url, hd: "1" }),
    signal,
  });
  if (!r.ok) return null;
  const j = await r.json();
  if (j?.code !== 0 || !j.data) return null;
  const d = j.data;
  const abs = (u: string) => (u?.startsWith("http") ? u : `https://www.tikwm.com${u}`);
  const title = d.title || "TikTok video";
  const formats: MediaFormat[] = [];
  if (d.hdplay) formats.push(fmt("video", "mp4", "HD (no watermark)", abs(d.hdplay), title));
  if (d.play) formats.push(fmt("video", "mp4", "SD (no watermark)", abs(d.play), title));
  if (d.wmplay) formats.push(fmt("video", "mp4", "With watermark", abs(d.wmplay), title));
  if (d.music) formats.push(fmt("audio", "mp3", "Original sound", abs(d.music), title));
  if (!formats.length) return null;
  return {
    ok: true, platform: "tiktok", platformName: "TikTok", title,
    thumbnail: d.cover ? abs(d.cover) : undefined,
    author: d.author?.nickname, duration: d.duration,
    formats,
  };
}

/* ── provider: SoundCloud via its public web API (keyless) ────── */
let scCid: { id: string; at: number } | null = null;
async function scClientId(signal?: AbortSignal): Promise<string | null> {
  if (scCid && Date.now() - scCid.at < 3_600_000) return scCid.id;
  const opts = { headers: { "User-Agent": UA }, ...(signal ? { signal } : {}) };
  const page = await fetch("https://soundcloud.com/", opts).then((r) => r.text()).catch(() => "");
  const scripts = [...page.matchAll(/<script[^>]+src="(https:\/\/[^"]+sndcdn\.com[^"]+\.js)"/g)].map((m) => m[1]);
  for (const s of scripts.reverse()) {
    const js = await fetch(s, opts).then((r) => r.text()).catch(() => "");
    const m = js.match(/client_id\s*[:=]\s*"([A-Za-z0-9]{16,})"/);
    if (m) { scCid = { id: m[1], at: Date.now() }; return m[1]; }
  }
  return null;
}
async function scTrack(url: string, cid: string, signal?: AbortSignal): Promise<any | null> {
  const r = await fetch(`https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${cid}`,
    { headers: { "User-Agent": UA }, ...(signal ? { signal } : {}) }).catch(() => null);
  if (!r?.ok) return null;
  return r.json().catch(() => null);
}
async function viaSoundcloud(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const cid = await scClientId(signal);
  if (!cid) return null;
  const t = await scTrack(url, cid, signal);
  if (t?.kind !== "track" || !t.media?.transcodings?.length) return null;
  const title = t.title || "SoundCloud track";
  const art = String(t.artwork_url || t.user?.avatar_url || "").replace("-large", "-t500x500");
  return {
    ok: true, platform: "soundcloud", platformName: "SoundCloud", title,
    thumbnail: art || undefined, author: t.user?.username,
    duration: Math.round((t.duration || 0) / 1000),
    formats: [fmtVia("s", "audio", "mp3", "128 kbps", url, title)],
  };
}
/** Called by the file proxy at download time — fresh progressive MP3 URL. */
export async function resolveSoundcloudStream(pageUrl: string): Promise<string | null> {
  const cid = await scClientId();
  if (!cid) return null;
  const t = await scTrack(pageUrl, cid);
  const prog = t?.media?.transcodings?.find((x: any) => x?.format?.protocol === "progressive");
  if (!prog?.url) return null;
  const r = await fetch(`${prog.url}${prog.url.includes("?") ? "&" : "?"}client_id=${cid}`, { headers: { "User-Agent": UA } }).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.url || null;
}

/* ── provider: a direct media link (…/x.mp4, …/y.jpg) ─────────── */
async function viaDirect(url: string): Promise<MediaInfo | null> {
  const ext = extOf(url);
  if (!ext) return null;
  const type: MediaFormat["type"] = /mp4|webm/.test(ext) ? "video" : /mp3|m4a|ogg/.test(ext) ? "audio" : "image";
  const title = decodeURIComponent(new URL(url).pathname.split("/").pop() || "download").replace(/\.[a-z0-9]+$/i, "");
  return { ok: true, platform: "web", platformName: "Direct link", title, thumbnail: type === "image" ? url : undefined, formats: [fmt(type, ext === "jpeg" ? "jpg" : ext, "Original", url, title)] };
}

/* ── provider: Vimeo via the public player config ──────────────
   player.vimeo.com/video/<id>/config needs no key and lists the progressive
   MP4 renditions. Newer uploads ship HLS/DASH only; those have no single URL
   the file proxy can stream, so this returns null instead of offering a button
   that would fail. An honest miss beats a broken download. */
async function viaVimeo(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (!id) return null;
  const r = await fetch(`https://player.vimeo.com/video/${id}/config`, {
    headers: { "User-Agent": UA, Referer: "https://vimeo.com/" }, signal,
  }).catch(() => null);
  if (!r?.ok) return null;
  const j = (await r.json().catch(() => null)) as any;
  const prog: any[] = j?.request?.files?.progressive || [];
  const title = j?.video?.title || "Vimeo video";
  const formats = [...prog]
    .filter((p) => p?.url)
    .sort((a, b) => (b.height || 0) - (a.height || 0))
    .map((p) => fmt("video", "mp4", p.quality || `${p.height}p`, p.url, title));
  if (!formats.length) return null;
  return {
    ok: true, platform: "vimeo", platformName: "Vimeo", title,
    thumbnail: j?.video?.thumbs?.base || j?.video?.thumbs?.["640"],
    author: j?.video?.owner?.name, duration: j?.video?.duration, formats,
  };
}

/* ── provider: Pinterest ───────────────────────────────────────
   The pin page carries the original asset in its JSON island: video pins an
   .mp4 on v1.pinimg.com, image pins an /originals/ file. The island escapes
   slashes, so they are unescaped before matching. */
async function viaPinterest(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" }, signal, redirect: "follow" }).catch(() => null);
  if (!r?.ok) return null;
  const html = (await r.text()).replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/\s*[|·-]\s*Pinterest\s*$/i, "").trim() || "Pinterest pin";
  const video = html.match(/https:\/\/v1\.pinimg\.com\/videos\/[^"'\s\\]+?\.mp4/)?.[0];
  const image = html.match(/https:\/\/i\.pinimg\.com\/originals\/[^"'\s\\]+?\.(?:jpg|jpeg|png|gif|webp)/)?.[0];
  const formats: MediaFormat[] = [];
  if (video) formats.push(fmt("video", "mp4", "Original", video, title));
  if (image) {
    const e = extOf(image);
    formats.push(fmt("image", e === "jpeg" ? "jpg" : e || "jpg", "Original", image, title));
  }
  if (!formats.length) return null;
  return { ok: true, platform: "pinterest", platformName: "Pinterest", title, thumbnail: image, formats };
}

/* ── provider: Odnoklassniki ───────────────────────────────────
   The player element carries data-options: HTML-escaped JSON whose flashvars
   hold the rendition list either inline (`metadata`) or behind a POST
   (`metadataUrl`). Both shapes are live in the wild, so both are read. */
async function viaOk(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ru,en" }, signal, redirect: "follow" }).catch(() => null);
  if (!r?.ok) return null;
  const raw = (await r.text()).match(/data-options="([^"]+)"/)?.[1];
  if (!raw) return null;
  const unesc = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  let opts: any = null;
  try { opts = JSON.parse(unesc(raw)); } catch { return null; }
  const fv = opts?.flashvars || {};
  /* `metadata` arrives as EITHER a JSON string or an already-parsed object,
     and OK switched shapes between one probe and the next on the same video.
     Blindly parsing threw on the object form, which fell through to the
     metadataUrl branch that this response does not carry — so a working
     extractor started reporting "extraction_failed" with nothing wrong at
     either end. */
  let meta: any = null;
  if (fv.metadata) {
    if (typeof fv.metadata === "string") {
      try { meta = JSON.parse(fv.metadata); } catch { /* try the URL form */ }
    } else if (typeof fv.metadata === "object") {
      meta = fv.metadata;
    }
  }
  if (!meta && fv.metadataUrl) {
    const m = await fetch(fv.metadataUrl, { method: "POST", headers: { "User-Agent": UA }, signal }).catch(() => null);
    meta = m?.ok ? await m.json().catch(() => null) : null;
  }
  const vids: any[] = (meta?.videos || []).filter((v: any) => v?.url);
  if (!vids.length) return null;
  const title = meta?.movie?.title || "Odnoklassniki video";
  /* OK names renditions rather than numbering them; this is their real order,
     best first. Anything unknown sorts last instead of jumping to the top. */
  const RANK = ["full", "quad", "ultra", "hd", "sd", "low", "lowest", "mobile"];
  const rank = (n: string) => { const i = RANK.indexOf(String(n)); return i < 0 ? RANK.length : i; };
  const formats = [...vids]
    .sort((a, b) => rank(a.name) - rank(b.name))
    .map((v) => fmt("video", "mp4", String(v.name || "sd").toUpperCase(), v.url, title));
  return {
    ok: true, platform: "ok", platformName: "Odnoklassniki", title,
    thumbnail: meta?.movie?.poster, duration: meta?.movie?.duration, formats,
  };
}

/* ── provider: Telegram public post ────────────────────────────
   ?embed=1 renders one post standalone, and for a public channel it points at
   a plain .mp4 on telesco.pe. Private channels render an empty widget — null,
   not a guess. */
async function viaTelegram(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const m = url.match(/t\.me\/(?:s\/)?([^/?#]+)\/(\d+)/);
  if (!m) return null;
  const r = await fetch(`https://t.me/${m[1]}/${m[2]}?embed=1&mode=tme`, { headers: { "User-Agent": UA }, signal }).catch(() => null);
  if (!r?.ok) return null;
  const html = await r.text();
  const pick = (ext: string) => html.match(new RegExp(`https://[^"'\\s]*?(?:telesco\\.pe|cdn-telegram\\.org)/file/[^"'\\s]+?\\.${ext}`))?.[0];
  const video = pick("mp4");
  const image = pick("jpg");
  const title = html.match(/tgme_widget_message_text[^>]*>([\s\S]{0,140}?)</)?.[1]?.replace(/<[^>]+>/g, "").trim()
    || `${m[1]} · post ${m[2]}`;
  const formats: MediaFormat[] = [];
  if (video) formats.push(fmt("video", "mp4", "Original", video, title));
  else if (image) formats.push(fmt("image", "jpg", "Original", image, title));
  if (!formats.length) return null;
  return { ok: true, platform: "telegram", platformName: "Telegram", title, thumbnail: image, formats };
}

/* ── provider: Rutube ──────────────────────────────────────────
   The play/options endpoint is public and keyless, but Rutube serves HLS and
   nothing else: the CDN answers 403 to the underlying .mp4 path, so there is
   no single URL to hand the proxy. The master playlist lists every rendition
   from 144p to 1080p, twice over (two CDN mirrors per resolution), so the list
   is de-duplicated by height, keeping the first mirror for each. */
async function viaRutube(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const id = url.match(/rutube\.ru\/(?:video|play\/embed|shorts)\/([0-9a-f]{32})/i)?.[1];
  if (!id) return null;
  const r = await fetch(`https://rutube.ru/api/play/options/${id}/?format=json&no_404=true`, {
    headers: { "User-Agent": UA, "Accept-Language": "ru,en" }, signal,
  }).catch(() => null);
  if (!r?.ok) return null;
  const j = (await r.json().catch(() => null)) as any;
  const master = j?.video_balancer?.m3u8 || j?.video_balancer?.default;
  if (!master) return null;

  const m = await fetch(master, { headers: { "User-Agent": UA }, signal }).catch(() => null);
  if (!m?.ok) return null;
  const lines = (await m.text()).split("\n");
  const seen = new Set<number>();
  const formats: MediaFormat[] = [];
  const title = j.title || "Rutube video";
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXT-X-STREAM-INF")) continue;
    const height = Number(lines[i].match(/RESOLUTION=\d+x(\d+)/)?.[1] || 0);
    const variant = (lines[i + 1] || "").trim();
    if (!height || !variant.startsWith("http") || seen.has(height)) continue;
    seen.add(height);
    formats.push(fmtHls(`${height}p`, variant, title));
  }
  if (!formats.length) return null;
  formats.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  return {
    ok: true, platform: "rutube", platformName: "Rutube", title,
    thumbnail: j.thumbnail_url, author: j.author?.name,
    duration: j.duration ? Math.round(j.duration / 1000) : undefined,
    formats,
  };
}

/** Called by the file proxy: turns an HLS playlist into ONE byte stream by
    fetching its segments in order. MPEG-TS concatenates cleanly — that is what
    the format was designed for — so no muxing happens here; the browser turns
    the result into MP4. Segments are fetched one at a time on purpose: a
    1080p video is hundreds of them, and buffering the lot would blow the
    function's memory on exactly the long videos people care about. */
export async function streamHls(playlistUrl: string): Promise<ReadableStream<Uint8Array> | null> {
  const r = await fetch(playlistUrl, { headers: { "User-Agent": UA } }).catch(() => null);
  if (!r?.ok) return null;
  const base = new URL(playlistUrl);
  const segments = (await r.text())
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => new URL(l, base).toString());
  if (!segments.length) return null;

  let i = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= segments.length) { controller.close(); return; }
      const seg = segments[i++];
      const res = await fetch(seg, { headers: { "User-Agent": UA, Referer: "https://rutube.ru/" } }).catch(() => null);
      /* One missing segment would silently produce a truncated video that
         still opens — worse than a failed download, because nobody checks. */
      if (!res?.ok) { controller.error(new Error(`segment ${i} of ${segments.length}: ${res?.status ?? "unreachable"}`)); return; }
      controller.enqueue(new Uint8Array(await res.arrayBuffer()));
    },
  });
}

/* ── provider: VK via the official API ─────────────────────────
   VK answers scrapers with an anti-bot interstitial ("У вас большие запросы!")
   — HTTP 200, ordinary-looking HTML, no media. It does this to datacenter
   ranges essentially always, which is why the cobalt route stopped working and
   why writing our own page scraper would hit the identical wall. The API is
   the supported path and is not gated that way.

   Joins the chain only when VK_ACCESS_TOKEN is set. Without it VK has no
   provider at all, and resolveMedia says exactly that instead of reporting a
   generic failure the owner cannot act on. */
async function viaVkApi(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const token = process.env.VK_ACCESS_TOKEN;
  if (!token) return null;
  const m = url.match(/video(-?\d+)_(\d+)/);
  if (!m) return null;
  const q = new URLSearchParams({ videos: `${m[1]}_${m[2]}`, access_token: token, v: "5.199" });
  const r = await fetch(`https://api.vk.com/method/video.get?${q}`, { headers: { "User-Agent": UA }, signal }).catch(() => null);
  if (!r?.ok) return null;
  const j = (await r.json().catch(() => null)) as any;
  const item = j?.response?.items?.[0];
  if (!item?.files) return null;
  const title = item.title || "VK video";
  const formats = Object.keys(item.files)
    .filter((k) => /^mp4_\d+$/.test(k))
    .sort((a, b) => Number(b.split("_")[1]) - Number(a.split("_")[1]))
    .map((k) => fmt("video", "mp4", `${k.split("_")[1]}p`, item.files[k], title));
  if (!formats.length) return null;
  const thumb = (item.image || []).slice(-1)[0]?.url;
  return { ok: true, platform: "vk", platformName: "VK", title, thumbnail: thumb, duration: item.duration, formats };
}

/* ── the chain ────────────────────────────────────────────────── */
export async function resolveMedia(pageUrl: string): Promise<MediaInfo | MediaError> {
  let url = pageUrl.trim();
  try { new URL(url); } catch { return { ok: false, error: "invalid_url" }; }

  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 25_000);
  try {
    // t.co / reddit-share / redd.it links hide the real page — resolve first
    if (isShortLink(url)) url = await unshorten(url, c.signal).catch(() => url) || url;

    const platform = detectPlatform(url);
    const isDirect = !!extOf(url);
    if (!platform && !isDirect) return { ok: false, error: "unsupported_platform" };

    /* Our own extractors run FIRST, cobalt only as the fallback behind them.
       For most platforms cobalt used to be the sole route, which made one
       self-hosted box a single point of failure for the site's most-visited
       page — and when it stopped answering, /downloader/vk served 107 sessions
       in a week without delivering a single file. Every provider below is
       keyless and runs in-process, so a platform we can read ourselves keeps
       working no matter what cobalt is doing. */
    const own: Record<string, (u: string, s: AbortSignal) => Promise<MediaInfo | null>> = {
      tiktok: viaTikwm,          // keyless, no watermark, survives datacenter IPs
      soundcloud: viaSoundcloud, // cobalt's soundcloud route is IP-blocked from datacenters
      vimeo: viaVimeo,
      pinterest: viaPinterest,
      ok: viaOk,
      telegram: viaTelegram,
      rutube: viaRutube,         // HLS only; the browser remuxes what we assemble
      vk: viaVkApi,              // API only — VK blocks scraping outright
    };
    const attempts: Array<() => Promise<MediaInfo | null>> = [];
    const mine = platform ? own[platform.id] : undefined;
    if (mine) attempts.push(() => mine(url, c.signal));
    if (platform) attempts.push(() => viaCobalt(url, c.signal));
    if (isDirect) attempts.push(() => viaDirect(url));

    for (const a of attempts) {
      try { const r = await a(); if (r && r.formats.length) return r; } catch { /* next */ }
    }
    /* Name the cause the owner can actually act on. VK without a token is not
       the same failure as a deleted video, and telling the user "couldn't read
       that link" for a missing env var hides a one-line fix for months. */
    if (platform?.id === "vk" && !process.env.VK_ACCESS_TOKEN && !cobaltEndpoints().length) return { ok: false, error: "vk_needs_api" };
    return { ok: false, error: cobaltEndpoints().length ? "extraction_failed" : "engine_not_configured" };
  } finally {
    clearTimeout(t);
  }
}

export const MEDIA_UA = UA;
