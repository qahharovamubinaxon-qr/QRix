import { NextRequest, NextResponse } from "next/server";
import { resolveMedia } from "@/lib/server/media-download";
import { rateLimit } from "@/lib/server/security";

export const runtime = "nodejs";
export const maxDuration = 30;

/** GET /api/download?url=<page> → media info (title, thumbnail, formats).
    Each format holds a SIGNED token; the browser then streams it via
    /api/download/file?t=<token>. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")?.trim();
  if (!url || url.length > 2048) {
    return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 });
  }

  const h = req.headers;
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const rl = await rateLimit(`dl:${ip}`, { max: 40, windowMs: 3_600_000 });
  if (!rl.ok) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const info = await resolveMedia(url);
  return NextResponse.json(info, { status: info.ok ? 200 : (info.error === "engine_not_configured" ? 501 : 422) });
}
