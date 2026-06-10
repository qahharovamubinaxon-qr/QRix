"use client";
import { useState } from "react";

export default function CompressPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("medium");
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
  } | null>(null);

  async function compressPdf() {
    if (!file) { alert("Please select a PDF file"); return; }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", level);

      const response = await fetch("/api/pdf/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // ✅ Xato bo'lsa JSON o'qiymiz
        const errorData = await response.json();
        throw new Error(errorData.message || "Compression failed");
      }

      // ✅ PDF blob sifatida olish
      const blob = await response.blob();

      // ✅ Header dan statistika olish
      const originalSize = Number(response.headers.get("X-Original-Size") || 0);
      const compressedSize = Number(response.headers.get("X-Compressed-Size") || 0);
      const savedPercent = Number(response.headers.get("X-Saved-Percent") || 0);

      // ✅ Faylni yuklab olish
      const { saveAs } = await import("file-saver");
      saveAs(blob, file.name.replace(/\.pdf$/i, "_compressed.pdf"));

      setResult({ originalSize, compressedSize, savedPercent });

    } catch (error) {
      console.error(error);
      alert("Compression failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Hajmni MB ga aylantirish
  function toMB(bytes: number) {
    return (bytes / 1024 / 1024).toFixed(2);
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">
      <h2 className="text-cyan-400 text-xl font-bold mb-2">Compress PDF</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Reduce PDF file size while keeping quality
      </p>

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setResult(null);
        }}
      />

      <div className="flex gap-4 flex-wrap">
        <label
          htmlFor="pdf-upload"
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-cyan-600 transition"
        >
          Select PDF
        </label>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:outline-none focus:border-cyan-500"
        >
          <option value="low">Low Compression</option>
          <option value="medium">Medium Compression</option>
          <option value="high">High Compression</option>
        </select>

        <button
          onClick={compressPdf}
          disabled={loading || !file}
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition"
        >
          {loading ? "Compressing..." : "Compress PDF"}
        </button>
      </div>

      {/* Fayl ma'lumoti */}
      {file && (
        <div className="mt-6 p-4 bg-zinc-800 rounded-xl">
          <div className="text-cyan-400">📄 {file.name}</div>
          <div className="text-zinc-400 mt-1 text-sm">
            Original size: <span className="text-white">{toMB(file.size)} MB</span>
          </div>
          <div className="text-zinc-400 mt-1 text-sm">
            Compression level: <span className="text-cyan-400">{level}</span>
          </div>
        </div>
      )}

      {/* ✅ Natija */}
      {result && (
        <div className="mt-4 p-4 bg-zinc-800 rounded-xl border border-cyan-500/30">
          <div className="text-green-400 font-bold mb-2">✅ Compressed successfully!</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">Original:</span>
              <span className="text-white">{toMB(result.originalSize)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Compressed:</span>
              <span className="text-white">{toMB(result.compressedSize)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Saved:</span>
              <span className="text-cyan-400 font-bold">
                {result.savedPercent > 0
                  ? `${result.savedPercent}% smaller`
                  : "Already optimized"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}