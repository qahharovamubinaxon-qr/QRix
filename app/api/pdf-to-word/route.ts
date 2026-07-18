import { NextRequest, NextResponse } from "next/server";
import { convertPdfToWord, serverConvertAvailable, DOCX_CONTENT_TYPE } from "@/lib/server/pdf-convert";
import { rateLimit } from "@/lib/server/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

/** GET → is the cloud (server) converter available? The client uses this to
    decide whether to offer/attempt the high-fidelity server path. */
export async function GET() {
  return NextResponse.json({ available: serverConvertAvailable() });
}

/** POST a PDF (raw body, application/pdf) → returns the converted .docx bytes.
    Runs the provider fallback chain (Adobe → … → self-hosted). */
export async function POST(req: NextRequest) {
  if (!serverConvertAvailable()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const h = req.headers;
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const rl = await rateLimit(`pdf2word:${ip}`, { max: 30, windowMs: 3_600_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.byteLength < 5 || buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "bad_size" }, { status: 400 });
  }
  // %PDF- magic
  if (!(buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)) {
    return NextResponse.json({ error: "not_a_pdf" }, { status: 400 });
  }

  try {
    const { docx, provider } = await convertPdfToWord(buf);
    return new NextResponse(docx as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": DOCX_CONTENT_TYPE,
        "Content-Disposition": 'attachment; filename="converted.docx"',
        "X-Convert-Provider": provider,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "conversion_failed", detail: (e as Error).message }, { status: 502 });
  }
}
