import { NextRequest, NextResponse } from "next/server";
import { verifyMedia, MEDIA_UA } from "@/lib/server/media-download";

export const runtime = "nodejs";
export const maxDuration = 60;

/** GET /api/download/file?t=<signed token> → streams the media through our
    server as an attachment. The token is an HMAC we signed in /api/download,
    so this can only ever fetch a media URL we produced — never an arbitrary
    host. Streaming (not buffering) keeps memory flat for large videos and lets
    the client show real progress from Content-Length. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") || "";
  const meta = verifyMedia(token);
  if (!meta) return NextResponse.json({ error: "bad_token" }, { status: 403 });

  // A wrong Referer makes some CDNs reject the request. Send the platform's
  // real site as Referer for hosts that check it (TikTok, Instagram, FB);
  // send none otherwise.
  const host = (() => { try { return new URL(meta.url).hostname.toLowerCase(); } catch { return ""; } })();
  const referer =
    /tiktokcdn|tikwm|muscdn|byteoversea/.test(host) ? "https://www.tiktok.com/" :
    /cdninstagram|instagram/.test(host) ? "https://www.instagram.com/" :
    /fbcdn|facebook/.test(host) ? "https://www.facebook.com/" :
    /pinimg|pinterest/.test(host) ? "https://www.pinterest.com/" : "";

  let upstream: Response;
  try {
    upstream = await fetch(meta.url, {
      headers: { "User-Agent": MEDIA_UA, Accept: "*/*", ...(referer ? { Referer: referer } : {}) },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream_" + upstream.status }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", meta.mime);
  headers.set("Content-Disposition", `attachment; filename="${meta.filename.replace(/"/g, "")}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  return new NextResponse(upstream.body, { status: 200, headers });
}
