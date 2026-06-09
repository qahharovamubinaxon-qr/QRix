"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function JpgToPdfClient() {
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

  async function createPdf() {
    if (files.length === 0) {
      alert("Select JPG files");
      return;
    }

    try {
      setLoading(true);

      const pdf =
        await PDFDocument.create();

      for (const file of files) {
        const imageBytes =
          await file.arrayBuffer();

        const image =
          await pdf.embedJpg(
            imageBytes
          );

        const page =
          pdf.addPage([
            image.width,
            image.height,
          ]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes =
        await pdf.save();

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
              "application/pdf",
          }
        );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement(
          "a"
        );

      a.href = url;
      a.download = "images.pdf";

      a.click();

      URL.revokeObjectURL(url);

      alert(
        "PDF created successfully!"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Conversion failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">

      <input
        id="jpg-upload"
        type="file"
        multiple
        accept=".jpg,.jpeg"
        onChange={handleFiles}
        className="hidden"
      />

      <div className="flex gap-4 flex-wrap">

  <label
    htmlFor="jpg-upload"
    className="inline-block bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer"
  >
    Choose JPG Files
  </label>

  <button
    onClick={createPdf}
    disabled={loading}
    className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl"
  >
    {loading
      ? "Processing..."
      : "Create PDF"}
  </button>

</div>

{files.length > 0 && (
  <div className="mt-6 space-y-2">

    {files.map(
      (file, index) => (
        <div
          key={index}
          className="text-cyan-400"
        >
          🖼️ {file.name}
        </div>
      )
    )}

  </div>
)}

    </div>
  );
}