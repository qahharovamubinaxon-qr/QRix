"use client";

import { useState } from "react";
import { FiImage } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

export default function PdfToPngClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function run() {
    if (!file) return;
    const outName = (file.name.replace(/\.pdf$/i, "") || "pdf") + "-png.zip";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setBusy(true);
    setProgress(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b as Blob), "image/png"));
        zip.file(`page-${i}.png`, blob);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const out = await zip.generateAsync({ type: "blob" });
      await finishSave(target, out, outName);
    } catch (e) {
      alert("Conversion failed: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />
      <button onClick={run} disabled={!file || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {busy ? `Rendering… ${progress}%` : <><FiImage size={15} /> Convert to PNG (ZIP)</>}
      </button>
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>High-resolution (2.5×) PNG images, one per page, packed into a ZIP.</p>
    </div>
  );
}
