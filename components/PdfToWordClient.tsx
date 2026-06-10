"use client";
import { useState } from "react";

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  async function convertToWord() {
    if (!file) { alert("Please select a PDF file"); return; }
    try {
      setLoading(true);
      setProgress("Loading PDF...");

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;

      const {
        Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
      } = await import("docx");

      const allParagraphs: any[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        // Sahifani rasmga aylantir
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;

        // Base64 ga aylantir
        const imageBase64 = canvas.toDataURL("image/png").split(",")[1];

        // ✅ Claude API ga yuborish
        setProgress(`AI reading page ${pageNum} of ${pdf.numPages}...`);
        const response = await fetch("/api/pdf-to-word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, pageNum, totalPages: pdf.numPages }),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        // Sahifa ajratgich
        if (pageNum > 1) {
          allParagraphs.push(
            new Paragraph({ children: [], pageBreakBefore: true })
          );
        }

        // Matnni Word paragraflariga aylantir
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

      const blob = await Packer.toBlob(doc);
      const { saveAs } = await import("file-saver");
      saveAs(blob, file.name.replace(/\.pdf$/i, ".docx"));
      setProgress("");
      alert("Word file created successfully! ✅");
    } catch (error) {
      console.error(error);
      setProgress("");
      alert("Conversion failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">
      <h2 className="text-cyan-400 text-xl font-bold mb-2">PDF to Word</h2>
      <p className="text-zinc-400 text-sm mb-6">
        AI-powered — recognizes Russian, Uzbek and English text
      </p>
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
    </div>
  );
}