"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function SplitPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] =
  useState(false);

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  )  {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    const bytes =
      await selectedFile.arrayBuffer();

    const pdf =
      await PDFDocument.load(bytes);

    setPageCount(
      pdf.getPageCount()
    );
  }
  async function splitPdf() {
  if (!file) return;

  try {
    setLoading(true);

    const bytes =
      await file.arrayBuffer();

    const sourcePdf =
      await PDFDocument.load(bytes);

    const newPdf =
      await PDFDocument.create();

    const pageNumbers =
      pages
        .split(",")
        .map((p) => parseInt(p.trim()))
        .filter(
          (p) =>
            !isNaN(p) &&
            p > 0 &&
            p <= sourcePdf.getPageCount()
        );
    
        if (pageNumbers.length === 0) {
  alert("Invalid page numbers");
  return;
}
    const copiedPages =
      await newPdf.copyPages(
        sourcePdf,
        pageNumbers.map(
          (p) => p - 1
        )
      );

    copiedPages.forEach((page) =>
      newPdf.addPage(page)
    );

    const pdfBytes =
      await newPdf.save();
    
    const pdfArray =
  new Uint8Array(pdfBytes);

    const blob =
  new Blob(
    [pdfArray],
    {
      type: "application/pdf",
    }
  );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "split.pdf";

    a.click();
    alert("PDF split successfully!");

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Split failed");
  } finally {
    setLoading(false);
  }
}
 
  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl mx-auto">

      <input
  id="pdf-upload"
  type="file"
  accept=".pdf"
  onChange={handleFile}
  className="hidden"
/>

<label
  htmlFor="pdf-upload"
  className="inline-block bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer hover:opacity-90"
>
  Choose PDF
</label>

      {file && (
        <div className="mt-4">

          <div className="flex items-center gap-3 text-cyan-400 font-semibold">
  📄 {file.name}
</div>

          <div className="text-zinc-400 mt-2">
            Pages: {pageCount}
          </div>

          <div className="text-zinc-400">
            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>

<div className="mt-6">

  <label className="block mb-2">
    Pages to extract
  </label>

<p className="text-zinc-500 text-sm mt-1">
  Example: 1,3,5,8
</p>

  <input
    value={pages}
    onChange={(e) =>
      setPages(e.target.value)
    }
    placeholder="1,3,5,8"
    className="w-full bg-black border border-zinc-700 rounded-xl p-3"
  />

</div>

<button
  onClick={splitPdf}
  disabled={loading}
  className="mt-6 bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl"
>
  {loading
    ? "Processing..."
    : "Split PDF"}
</button>

        </div>
      )}

    </div>
  );
}