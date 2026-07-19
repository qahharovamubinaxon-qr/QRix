import { NextRequest, NextResponse } from "next/server";
import { verifyMedia, resolveCobaltStream, resolveSoundcloudStream, MEDIA_UA } from "@/lib/server/media-download";

export const runtime = "nodejs";
export const maxDuration = 120;

/** GET /api/download/file?t=<signed token> → streams the media through our
    server as an attachment. The token is an HMAC we signed in /api/download,
    so this can only ever fetch media we produced — never an arbitrary host.

    Resolver tokens (cobalt / soundcloud) carry the ORIGINAL page URL and are
    re-resolved here at download time: cobalt tunnel links expire in minutes,
    so a fresh one is fetched the moment the user clicks Save. Streaming (not
    buffering) keeps memory flat for large videos and lets the client show
    real progress from Content-Length. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") || "";
  const meta = verifyMedia(token);
  if (!meta) return NextResponse.json({ error: "bad_token" }, { status: 403 });

  let mediaUrl: string | null = null;
  try {
    if (meta.kind === "direct") mediaUrl = meta.url;
    else if (meta.kind === "cobalt") mediaUrl = await resolveCobaltStream(meta.pageUrl, meta.mode, meta.index);
    else mediaUrl = await resolveSoundcloudStream(meta.pageUrl);
  } catch { /* fall through */ }
  if (!mediaUrl) return NextResponse.json({ error: "resolve_failed" }, { status: 502 });

  // A wrong Referer makes some CDNs reject the request. Send the platform's
  // real site as Referer for hosts that check it; send none otherwise.
  const host = (() => { try { return new URL(mediaUrl).hostname.toLowerCase(); } catch { return ""; } })();
  const referer =
    /tiktokcdn|tikwm|muscdn|byteoversea/.test(host) ? "https://www.tiktok.com/" :
    /cdninstagram|instagram/.test(host) ? "https://www.instagram.com/" :
    /fbcdn|facebook/.test(host) ? "https://www.facebook.com/" :
    /pinimg|pinterest/.test(host) ? "https://www.pinterest.com/" : "";

  let upstream: Response;
  try {
    upstream = await fetch(mediaUrl, {
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
