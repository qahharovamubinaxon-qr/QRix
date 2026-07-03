"use client";

import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function WordToPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function convertToPdf() {
    if (!file) return;
    const outName = file.name.replace(/\.(docx|doc)$/i, "") + ".pdf";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    try {
      // @ts-ignore - mammoth browser build has no bundled types
      const mammoth = (await import("mammoth/mammoth.browser")) as any;
      const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });

      const container = document.createElement("div");
      container.innerHTML = result.value;
      container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:794px;padding:60px;background:white;color:black;font-family:'Times New Roman',serif;font-size:13px;line-height:1.6;box-sizing:border-box;";
      document.body.appendChild(container);

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const totalHeight = container.scrollHeight;
      const scale = (pageWidth - margin * 2) / 794;
      const pageHeightPx = Math.floor((pageHeight - margin * 2) / scale);

      let yOffset = 0; let first = true;
      while (yOffset < totalHeight) {
        const canvas = await html2canvas(container, { scale: 2, useCORS: true, allowTaint: true, y: yOffset, height: Math.min(pageHeightPx, totalHeight - yOffset), windowHeight: totalHeight, scrollY: -yOffset, backgroundColor: "#ffffff" } as any);
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        if (!first) doc.addPage();
        doc.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
        yOffset += pageHeightPx; first = false;
      }
      document.body.removeChild(container);
      const blob = doc.output("blob");
      setLoading(false);
      await finishSave(target, blob, outName);
    } catch (e) {
      setLoading(false);
      alert("Conversion failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".doc,.docx" />
      <button onClick={convertToPdf} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? "Converting…" : <><FiFileText size={15} /> Convert to PDF</>}
      </button>
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>Renders your .docx to an A4 PDF with the same layout. Runs in your browser.</p>
    </div>
  );
}
