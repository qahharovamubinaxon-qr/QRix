import { NextResponse } from "next/server";
// @ts-ignore - sharp ships types but they don't resolve via package "exports"
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const level = (formData.get("level") as string) || "medium";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Siqish sozlamalari
    const settings: Record<string, { quality: number; maxDim: number }> = {
      low:    { quality: 82, maxDim: 1600 },
      medium: { quality: 65, maxDim: 1200 },
      high:   { quality: 42, maxDim: 900  },
    };
    const cfg = settings[level] ?? settings.medium;

    // PDF ni raw bytes sifatida o'qish va rasmlarni topish
    const pdfBytes = new Uint8Array(inputBuffer);
    const pdfString = Buffer.from(pdfBytes).toString("binary");

    // JPEG rasmlarni topish (SOI marker: FF D8, EOI marker: FF D9)
    const compressedChunks: Buffer[] = [];
    let pos = 0;
    let compressedCount = 0;
    let savedBytes = 0;

    while (pos < pdfBytes.length) {
      // JPEG boshlanishi: FF D8 FF
      if (
        pos + 2 < pdfBytes.length &&
        pdfBytes[pos] === 0xFF &&
        pdfBytes[pos + 1] === 0xD8 &&
        pdfBytes[pos + 2] === 0xFF
      ) {
        // JPEG oxirini topish: FF D9
        let end = pos + 3;
        while (end + 1 < pdfBytes.length) {
          if (pdfBytes[end] === 0xFF && pdfBytes[end + 1] === 0xD9) {
            end += 2;
            break;
          }
          end++;
        }

        const jpegData = pdfBytes.slice(pos, end);

        if (jpegData.length > 2000) {
          try {
            const compressed = await sharp(Buffer.from(jpegData))
              .resize({
                width: cfg.maxDim,
                height: cfg.maxDim,
                fit: "inside",
                withoutEnlargement: true,
              })
              .jpeg({
                quality: cfg.quality,
                mozjpeg: true,
                progressive: true,
              })
              .toBuffer();

            if (compressed.length < jpegData.length) {
              compressedChunks.push(compressed);
              savedBytes += jpegData.length - compressed.length;
              compressedCount++;
              pos = end;
              continue;
            }
          } catch {
            // Siqish imkonsiz — asl qoldirish
          }
        }

        compressedChunks.push(Buffer.from(jpegData));
        pos = end;
      } else {
        // Oddiy byte
        compressedChunks.push(Buffer.from([pdfBytes[pos]]));
        pos++;
      }
    }

    console.log(`Found ${compressedCount} JPEGs, saved ${(savedBytes/1024).toFixed(0)}KB`);

    // Agar JPEG topilmasa — pdf-lib bilan metadata siqish
    if (compressedCount === 0) {
      const pdfDoc = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("QRix");
      pdfDoc.setCreator("QRix");

      const outBytes = await pdfDoc.save({ useObjectStreams: true });

      const originalSize   = inputBuffer.length;
      const compressedSize = outBytes.length;
      const savedPercent   = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

      return new Response(new Blob([new Uint8Array(outBytes)], { type: "application/pdf" }), {
        status: 200,
        headers: {
          "Content-Type":        "application/pdf",
          "Content-Disposition": `attachment; filename="compressed.pdf"`,
          "X-Original-Size":    originalSize.toString(),
          "X-Compressed-Size":  compressedSize.toString(),
          "X-Saved-Percent":    savedPercent.toString(),
        },
      });
    }

    // Siqilgan PDF yaratish
    const finalBuffer = Buffer.concat(compressedChunks);

    const originalSize   = inputBuffer.length;
    const compressedSize = finalBuffer.length;
    const savedPercent   = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

    console.log(`✅ ${(originalSize/1024/1024).toFixed(2)}MB → ${(compressedSize/1024/1024).toFixed(2)}MB | Saved: ${savedPercent}%`);

    return new Response(finalBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="compressed.pdf"`,
        "X-Original-Size":    originalSize.toString(),
        "X-Compressed-Size":  compressedSize.toString(),
        "X-Saved-Percent":    savedPercent.toString(),
      },
    });

  } catch (error) {
    console.error("Compress error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}