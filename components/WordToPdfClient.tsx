"use client";
import { useState } from "react";

export default function WordToPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function convertToPdf() {
    if (!file) { alert("Please select a Word file"); return; }
    try {
      setLoading(true);

      // Word → HTML
      const mammoth = (await import("mammoth/mammoth.browser")) as any;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      // HTML ni sahifaga vaqtincha qo'yish
      const container = document.createElement("div");
      container.innerHTML = result.value;
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 794px;
        padding: 60px;
        background: white;
        color: black;
        font-family: 'Times New Roman', serif;
        font-size: 13px;
        line-height: 1.6;
        box-sizing: border-box;
      `;
      document.body.appendChild(container);

      // html2canvas bilan rasm olish
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      // Balandlikni hisoblash va sahifalarga bo'lish
      const totalHeight = container.scrollHeight;
      const scale = (pageWidth - margin * 2) / 794;
      const pageHeightPx = Math.floor((pageHeight - margin * 2) / scale);

      let yOffset = 0;
      let isFirstPage = true;

      while (yOffset < totalHeight) {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          y: yOffset,
          height: Math.min(pageHeightPx, totalHeight - yOffset),
          windowHeight: totalHeight,
          scrollY: -yOffset,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        if (!isFirstPage) doc.addPage();
        doc.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);

        yOffset += pageHeightPx;
        isFirstPage = false;
      }

      document.body.removeChild(container);
      doc.save(file.name.replace(/\.(docx|doc)$/i, ".pdf"));
      alert("PDF file created successfully! ✅");
    } catch (error) {
      console.error(error);
      alert("Conversion failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">
      <h2 className="text-cyan-400 text-xl font-bold mb-2">Word to PDF</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Convert Word documents to PDF format
      </p>
      <input
        id="word-pdf-upload"
        type="file"
        accept=".doc,.docx"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <div className="flex gap-4 flex-wrap">
        <label
          htmlFor="word-pdf-upload"
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-cyan-600 transition"
        >
          Select Word File
        </label>
        <button
          onClick={convertToPdf}
          disabled={loading}
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition"
        >
          {loading ? "Converting..." : "Convert to PDF"}
        </button>
      </div>
      {file && <div className="mt-6 text-cyan-400">📝 {file.name}</div>}
    </div>
  );
}