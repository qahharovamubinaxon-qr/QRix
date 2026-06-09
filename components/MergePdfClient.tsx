"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function MergePdfClient() {
  const [files, setFiles] =
    useState<File[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function handleFiles(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files) return;

    setFiles(
      Array.from(e.target.files)
    );
  }

  async function mergePdf() {
    if (files.length < 2) {
      alert(
        "Select at least 2 PDFs"
      );
      return;
    }

    try {
      setLoading(true);

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
            pdf
              .getPages()
              .map((_, i) => i)
          );

        pages.forEach((page) =>
          mergedPdf.addPage(page)
        );
      }

      const pdfBytes =
        await mergedPdf.save();

      const blob =
        new Blob(
          [
            pdfBytes.buffer.slice(
              pdfBytes.byteOffset,
              pdfBytes.byteOffset +
                pdfBytes.byteLength
            )
          ],
          {
            type:
              "application/pdf"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement(
          "a"
        );

      a.href = url;
      a.download = "merged.pdf";

      a.click();

      URL.revokeObjectURL(url);

      alert(
        "PDF merged successfully!"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Merge failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">

      <input
        id="merge-upload"
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFiles}
        className="hidden"
      />

      <label
        htmlFor="merge-upload"
        className="inline-block bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer"
      >
        Choose PDFs
      </label>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map(
            (file, index) => (
              <div
                key={index}
                className="text-cyan-400"
              >
                📄 {file.name}
              </div>
            )
          )}
        </div>
      )}

      <button
        onClick={mergePdf}
        disabled={loading}
        className="mt-6 bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl"
      >
        {loading
          ? "Processing..."
          : "Merge PDF"}
      </button>

    </div>
  );
}