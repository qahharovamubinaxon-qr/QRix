import { NextResponse } from "next/server";
// @ts-ignore - sharp ships types but they don't resolve via package "exports"
import sharp from "sharp";
import { compressPdf, scaledDims, type CompressLevel, type JpegReencoder } from "@/lib/pdf-compress";

export const runtime = "nodejs";

/* The tool page compresses in the browser now — this route stays for API
   clients, and it runs the identical object surgery from lib/pdf-compress with
   sharp standing in for the canvas encoder.

   It used to do something else entirely: scan the raw file for FF D8 FF, splice
   a re-encoded JPEG of a different length into the byte stream, and leave every
   /Length and every xref offset after it pointing at the wrong place. Readers
   rebuild a damaged xref silently, so the output opened and the saving looked
   spectacular — it was just structurally broken. */
const sharpReencoder: JpegReencoder = async (jpeg, maxDim, quality) => {
  const buf = Buffer.from(jpeg);
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) return null;
  const { width, height } = scaledDims(meta.width, meta.height, maxDim);
  const bytes = await sharp(buf)
    .resize(width, height, { fit: "fill" })
    .jpeg({ quality: Math.round(quality * 100), mozjpeg: true })
    .toBuffer();
  return { bytes: new Uint8Array(bytes), width, height };
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const level = ((formData.get("level") as string) || "medium") as CompressLevel;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const input = new Uint8Array(await file.arrayBuffer());
    const out = await compressPdf(input, { level, reencodeJpeg: sharpReencoder });

    return new Response(new Blob([new Uint8Array(out.bytes)], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed.pdf"`,
        "X-Original-Size": String(out.originalSize),
        "X-Compressed-Size": String(out.compressedSize),
        "X-Saved-Percent": String(out.savedPercent),
        "X-Images-Recompressed": String(out.imagesRecompressed),
      },
    });
  } catch (error) {
    console.error("Compress error:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
