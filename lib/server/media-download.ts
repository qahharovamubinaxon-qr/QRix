/* Social-media media extraction — SERVER ONLY.

   resolveMedia(pageUrl) returns normalized info (title, thumbnail, author) plus
   a list of downloadable formats (video / audio / image, with quality labels).
   Each format carries a SIGNED token, not a raw URL: the file proxy
   (/api/download/file) only streams a media URL that this server signed, so the
   endpoint can never be turned into an open fetch proxy for arbitrary hosts.

   Provider order per platform, best first:
     1. cobalt  — a self-hosted cobalt instance (COBALT_API_URL). Covers every
        platform reliably; joins only when the env is set.
     2. built-in keyless extractors — so the top platforms work out of the box
        with no external service (TikTok via tikwm; direct media passthrough).

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
export function signMedia(url: string, filename: string, mime: string): string {
  const payload = b64url(JSON.stringify({ u: url, f: filename, m: mime, e: Date.now() + TOKEN_TTL_MS }));
  const sig = b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
  return `${payload}.${sig}`;
}
export function verifyMedia(token: string): { url: string; filename: string; mime: string } | null {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return null;
  const expect = b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const { u, f, m, e } = JSON.parse(unb64url(payload).toString());
    if (!u || Date.now() > e) return null;
    // defence in depth: only ever proxy from a supported media / CDN host
    const host = new URL(u).hostname.toLowerCase();
    const ok = SUPPORTED_DOMAINS.some((d) => host.includes(d)) ||
      /(tikwm\.com|tiktokcdn|fbcdn|cdninstagram|pinimg|vkuservideo|vkuseraudio|vk-cdn|mycdn\.me|akamaized|akamaihd|vimeocdn|sndcdn|twimg|ttwstatic|muscdn|bcbits|dmcdn|byteoversea|redditvideo|redd\.it|v\.redd|pinterest|okcdn|mvk\.com)/.test(host);
    if (!ok) return null;
    return { url: u, filename: f || "download", mime: m || "application/octet-stream" };
  } catch { return null; }
}

/* ── helpers ──────────────────────────────────────────────────── */
const slug = (s: string) => (s || "qrix-download").replace(/[^\w\-. ]+/g, "").trim().slice(0, 60) || "qrix-download";
const fmt = (type: MediaFormat["type"], container: string, quality: string, url: string, title: string): MediaFormat => ({
  id: `${type}-${container}-${quality}`.replace(/\s+/g, ""),
  type, container, quality,
  label: type === "audio" ? `Audio · ${container.toUpperCase()}` : type === "image" ? `Image · ${container.toUpperCase()}` : `Video · ${quality}`,
  token: signMedia(url, `${slug(title)}.${container}`, mimeFor(container)),
});
function mimeFor(container: string): string {
  const m: Record<string, string> = { mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
  return m[container.toLowerCase()] || "application/octet-stream";
}
function extOf(url: string): string {
  try { const p = new URL(url).pathname.toLowerCase(); const m = p.match(/\.(mp4|webm|mp3|m4a|ogg|jpg|jpeg|png|webp|gif)(?:$|[?#])/); return m ? m[1] : ""; } catch { return ""; }
}

/* ── provider: cobalt (self-hosted) ───────────────────────────── */
async function viaCobalt(url: string, signal: AbortSignal): Promise<MediaInfo | null> {
  const api = process.env.COBALT_API_URL;
  if (!api) return null;
  const call = async (mode: "auto" | "audio") => {
    const r = await fetch(api.replace(/\/$/, "") + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(process.env.COBALT_API_KEY ? { Authorization: `Api-Key ${process.env.COBALT_API_KEY}` } : {}) },
      body: JSON.stringify({ url, downloadMode: mode, videoQuality: "1080", audioFormat: "mp3", filenameStyle: "basic" }),
      signal,
    });
    if (!r.ok) return null;
    return r.json();
  };

  const v = await call("auto").catch(() => null);
  if (!v || v.status === "error") return null;

  const p = detectPlatform(url);
  const title = v.filename?.replace(/\.[a-z0-9]+$/i, "") || `${p?.name || "media"} download`;
  const formats: MediaFormat[] = [];
  let thumbnail: string | undefined;

  if (v.status === "picker" && Array.isArray(v.picker)) {
    v.picker.forEach((it: any, i: number) => {
      if (!it?.url) return;
      const isImg = it.type === "photo";
      thumbnail ||= it.thumb || (isImg ? it.url : undefined);
      const c = extOf(it.url) || (isImg ? "jpg" : "mp4");
      formats.push(fmt(isImg ? "image" : "video", c, isImg ? "Original" : "HD", it.url, `${title}-${i + 1}`));
    });
    if (v.audio?.url) formats.push(fmt("audio", "mp3", "128 kbps", v.audio.url, title));
  } else if ((v.status === "tunnel" || v.status === "redirect") && v.url) {
    formats.push(fmt("video", extOf(v.url) || "mp4", "HD", v.url, title));
    const a = await call("audio").catch(() => null);
    if (a && (a.status === "tunnel" || a.status === "redirect") && a.url) {
      formats.push(fmt("audio", "mp3", "128 kbps", a.url, title));
    }
  }
  if (!formats.length) return null;
  return { ok: true, platform: p?.id || "web", platformName: p?.name || "Web", title, thumbnail, formats };
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

/* ── provider: a direct media link (…/x.mp4, …/y.jpg) ─────────── */
async function viaDirect(url: string): Promise<MediaInfo | null> {
  const ext = extOf(url);
  if (!ext) return null;
  const type: MediaFormat["type"] = /mp4|webm/.test(ext) ? "video" : /mp3|m4a|ogg/.test(ext) ? "audio" : "image";
  const title = decodeURIComponent(new URL(url).pathname.split("/").pop() || "download").replace(/\.[a-z0-9]+$/i, "");
  return { ok: true, platform: "web", platformName: "Direct link", title, thumbnail: type === "image" ? url : undefined, formats: [fmt(type, ext === "jpeg" ? "jpg" : ext, "Original", url, title)] };
}

/* ── the chain ────────────────────────────────────────────────── */
export async function resolveMedia(pageUrl: string): Promise<MediaInfo | MediaError> {
  const url = pageUrl.trim();
  let host = "";
  try { host = new URL(url).hostname.toLowerCase(); } catch { return { ok: false, error: "invalid_url" }; }
  const platform = detectPlatform(url);
  const isDirect = !!extOf(url);
  if (!platform && !isDirect) return { ok: false, error: "unsupported_platform" };

  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 25_000);
  try {
    const attempts: Array<() => Promise<MediaInfo | null>> = [];
    // TikTok: the keyless tikwm path is faster AND survives datacenter IPs
    // (cobalt on a cloud IP often can't reach tiktokcdn) — try it first.
    if (platform?.id === "tiktok") {
      attempts.push(() => viaTikwm(url, c.signal));
      attempts.push(() => viaCobalt(url, c.signal));
    } else {
      // everything else: cobalt (self-hosted) covers it when configured
      attempts.push(() => viaCobalt(url, c.signal));
    }
    // direct link passthrough
    if (isDirect) attempts.push(() => viaDirect(url));

    for (const a of attempts) {
      try { const r = await a(); if (r && r.formats.length) return r; } catch { /* next */ }
    }
    return { ok: false, error: process.env.COBALT_API_URL ? "extraction_failed" : "engine_not_configured" };
  } finally {
    clearTimeout(t);
    void host;
  }
}

export const MEDIA_UA = UA;
