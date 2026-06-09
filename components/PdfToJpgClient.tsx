"use client";

import { useState } from "react";

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function convertPdf() {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);

      // ✅ TO'G'RI YO'L
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      const bytes = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.95)
        );

        zip.file(`page-${pageNum}.jpg`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const { saveAs } = await import("file-saver");
      saveAs(zipBlob, "pdf-images.zip");

      alert("JPG files created successfully! ✅");
    } catch (error) {
      console.error(error);
      alert("Conversion failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">
      <h2 className="text-cyan-400 text-xl font-bold mb-6">PDF to JPG Converter</h2>

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div className="flex gap-4 flex-wrap">
        <label
          htmlFor="pdf-upload"
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-cyan-600 transition"
        >
          Select PDF
        </label>

        <button
          onClick={convertPdf}
          disabled={loading}
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition"
        >
          {loading ? "Processing..." : "Convert to JPG"}
        </button>
      </div>

      {file && (
        <div className="mt-6 text-cyan-400">📄 {file.name}</div>
      )}
    </div>
  );
}