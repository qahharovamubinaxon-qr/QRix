"use client";
import { useState } from "react";

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [mode, setMode] = useState<"layout" | "text">("text");

  async function convertToWord() {
    if (!file) { alert("Please select a PDF file"); return; }
    try {
      setLoading(true);

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;

      if (mode === "layout") {
        await convertLayout(pdf, file);
      } else {
        await convertText(pdf, file);
      }
    } catch (error) {
      console.error(error);
      setProgress("");
      alert("Conversion failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ LAYOUT MODE
  async function convertLayout(pdf: any, currentFile: File) {
    const { Document, Packer, Paragraph, ImageRun } = await import("docx");
    const { saveAs } = await import("file-saver");

    const children: any[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setProgress(`Converting page ${pageNum} of ${pdf.numPages}...`);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas error")), "image/png", 1)
      );
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      if (pageNum > 1) {
        children.push(new Paragraph({ children: [], pageBreakBefore: true }));
      }

      const maxWidth = 600;
      const ratio = canvas.height / canvas.width;

      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: uint8Array,
              transformation: {
                width: maxWidth,
                height: Math.round(maxWidth * ratio),
              },
              type: "png",
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      }],
    });

    const docBlob = await Packer.toBlob(doc);
    saveAs(docBlob, currentFile.name.replace(/\.pdf$/i, "_layout.docx"));
    setProgress("");
    alert("Word file created! (Layout mode) ✅");
  }

  // ✅ TEXT MODE
  async function convertText(pdf: any, currentFile: File) {
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    } = await import("docx");
    const { saveAs } = await import("file-saver");

    const allParagraphs: any[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const imageBase64 = canvas.toDataURL("image/png").split(",")[1];

      setProgress(`AI reading page ${pageNum} of ${pdf.numPages}...`);
      const response = await fetch("/api/pdf-to-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, pageNum, totalPages: pdf.numPages }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      if (pageNum > 1) {
        allParagraphs.push(
          new Paragraph({ children: [], pageBreakBefore: true })
        );
      }

      const lines = (data.text as string).split("\n");
      for (const line of lines) {
        if (!line.trim()) {
          allParagraphs.push(new Paragraph({ children: [] }));
          continue;
        }
        if (line.startsWith("# ")) {
          allParagraphs.push(new Paragraph({
            text: line.replace("# ", ""),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }));
        } else if (line.startsWith("## ")) {
          allParagraphs.push(new Paragraph({
            text: line.replace("## ", ""),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          }));
        } else if (line.startsWith("### ")) {
          allParagraphs.push(new Paragraph({
            text: line.replace("### ", ""),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          }));
        } else {
          allParagraphs.push(new Paragraph({
            children: [new TextRun({
              text: line,
              size: 24,
              font: "Times New Roman",
            })],
            alignment: AlignmentType.LEFT,
            spacing: { after: 80 },
          }));
        }
      }
    }

    setProgress("Creating Word file...");
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: allParagraphs,
      }],
    });

    const docBlob = await Packer.toBlob(doc);
    saveAs(docBlob, currentFile.name.replace(/\.pdf$/i, "_text.docx"));
    setProgress("");
    alert("Word file created! (Text mode) ✅");
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">
      <h2 className="text-cyan-400 text-xl font-bold mb-2">PDF to Word</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Choose conversion mode below
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("layout")}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition border ${
            mode === "layout"
              ? "bg-cyan-500 text-black border-cyan-500"
              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
          }`}
        >
          🖼️ Keep Layout
          <div className="text-xs font-normal mt-1 opacity-70">
            Lines & tables saved
          </div>
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition border ${
            mode === "text"
              ? "bg-cyan-500 text-black border-cyan-500"
              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
          }`}
        >
          📝 Editable Text
          <div className="text-xs font-normal mt-1 opacity-70">
            AI reads & editable
          </div>
        </button>
      </div>

      <input
        id="pdf-word-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div className="flex gap-4 flex-wrap">
        <label
          htmlFor="pdf-word-upload"
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-cyan-600 transition"
        >
          Select PDF
        </label>
        <button
          onClick={convertToWord}
          disabled={loading}
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition"
        >
          {loading ? "Converting..." : "Convert to Word"}
        </button>
      </div>

      {file && <div className="mt-4 text-cyan-400">📄 {file.name}</div>}

      {progress && (
        <div className="mt-4 text-yellow-400 text-sm animate-pulse">
          ⏳ {progress}
        </div>
      )}

      <div className="mt-6 p-4 bg-zinc-800 rounded-xl text-xs text-zinc-400">
        {mode === "layout" ? (
          <>
            <span className="text-cyan-400 font-bold">🖼️ Keep Layout:</span> Saves all lines, tables, images exactly as in PDF. Not editable.
          </>
        ) : (
          <>
            <span className="text-cyan-400 font-bold">📝 Editable Text:</span> AI reads all text — fully editable in Word. Lines/images not included.
          </>
        )}
      </div>
    </div>
  );
}