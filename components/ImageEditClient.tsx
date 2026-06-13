"use client";

import { useState, useRef, useEffect } from "react";
import { FiUpload, FiDownload, FiImage } from "react-icons/fi";

type Mode = "compress" | "resize" | "convert";

export default function ImageEditClient({ mode }: { mode: Mode }) {
  const [original, setOriginal] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [origDims, setOrigDims] = useState({ w: 0, h: 0 });
  const [origSize, setOrigSize] = useState(0);

  // Controls
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");

  const [result, setResult] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setOrigSize(f.size);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setOriginal(src);
      const img = new Image();
      img.onload = () => {
        setOrigDims({ w: img.width, h: img.height });
        setWidth(img.width);
        setHeight(img.height);
        imgRef.current = img;
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const onWidth = (w: number) => {
    setWidth(w);
    if (lockRatio && origDims.w) setHeight(Math.round((w / origDims.w) * origDims.h));
  };
  const onHeight = (h: number) => {
    setHeight(h);
    if (lockRatio && origDims.h) setWidth(Math.round((h / origDims.h) * origDims.w));
  };

  const process = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    const outW = mode === "resize" ? width : origDims.w;
    const outH = mode === "resize" ? height : origDims.h;
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (format === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.drawImage(img, 0, 0, outW, outH);

    const q = mode === "convert" ? 0.92 : quality / 100;
    const outFormat = mode === "convert" ? format : mode === "compress" ? "image/jpeg" : format;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setResult(URL.createObjectURL(blob));
        setResultSize(blob.size);
      },
      outFormat,
      q
    );
  };

  const download = () => {
    if (!result) return;
    const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
    const a = document.createElement("a");
    a.href = result;
    a.download = (file?.name.replace(/\.[^.]+$/, "") || "image") + `-qrix.${ext}`;
    a.click();
  };

  const fmtSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Чап — контроллар */}
      <div className="qx-card p-6">
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer transition-colors min-h-[200px]"
          style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}
        >
          {original ? (
            <img src={original} alt="preview" className="max-h-48 rounded-xl object-contain" />
          ) : (
            <>
              <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Choose an image</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
        </label>

        {file && (
          <div className="mt-5 space-y-4">
            {origDims.w > 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Original: {origDims.w}×{origDims.h}px · {fmtSize(origSize)}
              </p>
            )}

            {/* Compress */}
            {mode === "compress" && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>
                  Quality: {quality}%
                </label>
                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-violet-500" />
              </div>
            )}

            {/* Resize */}
            {mode === "resize" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Width (px)</label>
                    <input type="number" value={width} onChange={(e) => onWidth(Number(e.target.value))} className="w-full px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Height (px)</label>
                    <input type="number" value={height} onChange={(e) => onHeight(Number(e.target.value))} className="w-full px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} className="accent-violet-500" />
                  Lock aspect ratio
                </label>
              </>
            )}

            {/* Convert / format */}
            {(mode === "convert" || mode === "resize") && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Output format</label>
                <div className="grid grid-cols-3 gap-2">
                  {([["image/jpeg", "JPG"], ["image/png", "PNG"], ["image/webp", "WebP"]] as const).map(([val, lbl]) => (
                    <button key={val} onClick={() => setFormat(val)}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: format === val ? "var(--grad-primary)" : "var(--surface-hover)",
                        color: format === val ? "#fff" : "var(--text-muted)",
                        border: `1px solid ${format === val ? "transparent" : "var(--border)"}`,
                      }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={process} className="qx-btn w-full !py-3.5">
              <FiImage size={15} /> {mode === "compress" ? "Compress" : mode === "resize" ? "Resize" : "Convert"}
            </button>
          </div>
        )}
      </div>

      {/* Ўнг — натижа */}
      <div className="qx-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>Result</h3>
          {result && (
            <button onClick={download} className="qx-btn-ghost !text-xs !py-1.5"><FiDownload size={12} /> Download</button>
          )}
        </div>
        <div className="rounded-2xl min-h-[260px] flex items-center justify-center p-4"
          style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
          {result ? (
            <img src={result} alt="result" className="max-h-64 rounded-lg object-contain" />
          ) : (
            <div className="text-center" style={{ color: "var(--text-faint)" }}>
              <FiImage size={28} className="mx-auto mb-2" />
              <p className="text-xs">Result will appear here</p>
            </div>
          )}
        </div>
        {result && resultSize > 0 && (
          <div className="mt-4 p-3 rounded-xl text-xs flex items-center justify-between"
            style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.3)" }}>
            <span style={{ color: "var(--text-muted)" }}>New size: <b style={{ color: "var(--success)" }}>{fmtSize(resultSize)}</b></span>
            {mode === "compress" && origSize > 0 && (
              <span style={{ color: "var(--success)" }}>
                −{Math.max(0, Math.round((1 - resultSize / origSize) * 100))}% smaller
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
