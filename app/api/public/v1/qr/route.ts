import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { authenticateKey, unauthorized } from "@/lib/server/user-api-keys";

/* Public API — QR rendering.
   The endpoint a program actually wants: give it text or a URL, get back an
   image. GET so it can be dropped straight into an <img src>, POST for anything
   long enough to be awkward in a query string. Nothing is stored. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Format = "png" | "svg";

/* A QR at error-correction H can lose ~30% of its area and still scan, which is
   what makes a centre logo possible; it also holds the least data. M is the
   sensible default and the same one the site's own generator uses. */
const ECC = new Set(["L", "M", "Q", "H"]);

async function render(params: {
  content: string; format: Format; size: number; margin: number;
  dark: string; light: string; ecc: "L" | "M" | "Q" | "H";
}) {
  const opts = {
    errorCorrectionLevel: params.ecc,
    margin: params.margin,
    width: params.size,
    color: { dark: params.dark, light: params.light },
  } as const;

  if (params.format === "svg") {
    const svg = await QRCode.toString(params.content, { ...opts, type: "svg" });
    return new NextResponse(svg, {
      headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=31536000, immutable" },
    });
  }
  const buf = await QRCode.toBuffer(params.content, { ...opts, type: "png" });
  return new NextResponse(new Uint8Array(buf), {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" },
  });
}

/* #RRGGBB only. A colour string goes into the renderer, so anything looser is a
   place for surprises rather than a feature. */
const colour = (v: string | null, fallback: string) =>
  (v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback);

function parse(searchParams: URLSearchParams, body: Record<string, unknown> = {}) {
  const get = (k: string) => (body[k] !== undefined ? String(body[k]) : searchParams.get(k));
  const content = get("content") ?? get("text") ?? get("url");
  const size = Math.min(2000, Math.max(64, Number(get("size")) || 512));
  const marginRaw = Number(get("margin"));
  const eccRaw = String(get("ecc") ?? "M").toUpperCase();
  return {
    content,
    format: (String(get("format") ?? "png").toLowerCase() === "svg" ? "svg" : "png") as Format,
    size,
    margin: Number.isFinite(marginRaw) ? Math.min(10, Math.max(0, marginRaw)) : 2,
    dark: colour(get("dark"), "#000000"),
    light: colour(get("light"), "#ffffff"),
    ecc: (ECC.has(eccRaw) ? eccRaw : "M") as "L" | "M" | "Q" | "H",
  };
}

async function handle(req: Request, body?: Record<string, unknown>) {
  const auth = await authenticateKey(req, "read");
  if (!auth) return unauthorized();

  const p = parse(new URL(req.url).searchParams, body);
  if (!p.content || p.content.length > 2953) {
    /* 2953 bytes is the format's own ceiling at ECC L; past it the encoder
       throws and the caller would see a 500 for something they can fix. */
    return NextResponse.json({
      error: "invalid_content",
      message: "`content` is required and must be at most 2953 characters.",
    }, { status: 400 });
  }

  try {
    return await render({ ...p, content: p.content });
  } catch {
    return NextResponse.json({ error: "encode_failed", message: "The content did not fit at this error-correction level." }, { status: 422 });
  }
}

export const GET = (req: Request) => handle(req);

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* fall back to query params */ }
  return handle(req, body);
}
