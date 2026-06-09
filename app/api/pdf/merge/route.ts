import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const files =
      formData.getAll(
        "files"
      ) as File[];

    if (files.length < 2) {
      return NextResponse.json(
        {
          error:
            "Select at least 2 PDFs",
        },
        { status: 400 }
      );
    }

    const mergedPdf =
      await PDFDocument.create();

    for (const file of files) {
      const bytes =
        await file.arrayBuffer();

      const pdf =
        await PDFDocument.load(
          bytes
        );

      const pages =
        await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

      pages.forEach((page) =>
        mergedPdf.addPage(page)
      );
    }

    const result =
      await mergedPdf.save();

    return new Response(
      result,
      {
        headers: {
          "Content-Type":
            "application/pdf",
          "Content-Disposition":
            'attachment; filename="merged.pdf"',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed to merge PDFs",
      },
      { status: 500 }
    );
  }
}