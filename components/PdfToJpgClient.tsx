"use client";

import { useState } from "react";
import { FiImage } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function convertPdf() {
    if (!file) return;
    const outName = (file.name.replace(/\.pdf$/i, "") || "pdf") + "-jpg.zip";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    setProgress(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b as Blob), "image/jpeg", 0.95));
        zip.file(`page-${n}.jpg`, blob);
        setProgress(Math.round((n / pdf.numPages) * 100));
      }
      const out = await zip.generateAsync({ type: "blob" });
      setLoading(false);
      await finishSave(target, out, outName);
    } catch (e) {
      setLoading(false);
      alert("Conversion failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />
      <button onClick={convertPdf} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? `Converting… ${progress}%` : <><FiImage size={15} /> Convert to JPG (ZIP)</>}
      </button>
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>Each page becomes a high-quality JPG, packed into a ZIP.</p>
    </div>
  );
}
