"use client";

import { useState, useRef } from "react";
import { FiUpload, FiDownload, FiImage, FiZap, FiLoader } from "react-icons/fi";
import { toolUI, type ToolLang } from "@/lib/tool-ui-i18n";

const SCALES = [2, 3, 4] as const;
type Scale = (typeof SCALES)[number];

export default function ImageUpscaleClient({ lang = "en" }: { lang?: ToolLang }) {
  const t = toolUI(lang);
  const [original, setOriginal] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [origDims, setOrigDims] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState<Scale>(2);
  const [sharpen, setSharpen] = useState(true);
  const [strength, setStrength] = useState(60);
  const [result, setResult] = useState<string | null>(null);
  const [outDims, setOutDims] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setOriginal(src);
      const img = new Image();
      img.onload = () => {
        setOrigDims({ w: img.width, h: img.height });
        imgRef.current = img;
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  // Кучли аниқлаштириш — unsharp mask + контраст (strength 0–100)
  const applySharpen = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const amount = strength / 100; // 0..1
    const src = ctx.getImageData(0, 0, w, h);
    const blurred = ctx.createImageData(w, h);
    const bd = blurred.data, sd = src.data;

    // 1) Енгил blur (3x3 box) — детал картасини олиш учун
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++)
            for (let kx = -1; kx <= 1; kx++)
              sum += sd[((y + ky) * w + (x + kx)) * 4 + c];
          bd[(y * w + x) * 4 + c] = sum / 9;
        }
      }
    }

    // 2) Unsharp mask: original + amount*(original - blurred), + контраст
    const out = ctx.createImageData(w, h);
    const od = out.data;
    const k = 1 + amount * 2.2;       // аниқлаштириш кучи
    const contrast = 1 + amount * 0.35; // енгил контраст
    for (let i = 0; i < sd.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const o = sd[i + c];
        const b = bd[i + c] || o;
        let v = o + (o - b) * (k - 1);          // unsharp
        v = (v - 128) * contrast + 128;          // контраст
        od[i + c] = Math.max(0, Math.min(255, v));
      }
      od[i + 3] = sd[i + 3];
    }
    ctx.putImageData(out, 0, 0);
  };

  const upscale = () => {
    const img = imgRef.current;
    if (!img) return;
    setBusy(true);
    setResult(null);

    setTimeout(() => {
      try {
        const outW = origDims.w * scale;
        const outH = origDims.h * scale;
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) { setBusy(false); return; }

        // Сифатли катталаштириш
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, outW, outH);

        // Аниқлаштириш
        if (sharpen) {
          try { applySharpen(ctx, outW, outH); } catch {}
        }

        setResult(canvas.toDataURL("image/png"));
        setOutDims({ w: outW, h: outH });
      } catch (err) {
        console.error(err);
      } finally {
        setBusy(false);
      }
    }, 50);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = (file?.name.replace(/\.[^.]+$/, "") || "image") + `-${scale}x.png`;
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Чап — контроллар */}
      <div className="qx-card p-6">
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer transition-colors min-h-[220px]"
          style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}
        >
          {original ? (
            <img src={original} alt="original" className="max-h-52 rounded-xl object-contain" />
          ) : (
            <>
              <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{t.upscale.chooseBlurry}</span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>{t.common.imgFormats}</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
        </label>

        {file && (
          <div className="mt-5 space-y-4">
            {origDims.w > 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t.upscale.dims(origDims.w, origDims.h, origDims.w * scale, origDims.h * scale)}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>{t.upscale.factor}</label>
              <div className="grid grid-cols-3 gap-2">
                {SCALES.map((s) => (
                  <button key={s} onClick={() => setScale(s)}
                    className="py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: scale === s ? "var(--grad-primary)" : "var(--surface-hover)",
                      color: scale === s ? "#fff" : "var(--text-muted)",
                      border: `1px solid ${scale === s ? "transparent" : "var(--border)"}`,
                    }}>
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
              <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} className="accent-violet-500" />
              {t.upscale.sharpen}
            </label>

            {sharpen && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>
                  {t.upscale.strength(strength)}
                </label>
                <input type="range" min={10} max={100} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="w-full accent-violet-500" />
              </div>
            )}

            <button onClick={upscale} disabled={busy} className="qx-btn w-full !py-3.5 disabled:opacity-50">
              {busy ? <><FiLoader size={15} className="animate-spin" /> {t.upscale.enhancing}</> : <><FiZap size={15} /> {t.upscale.enhanceBtn}</>}
            </button>
          </div>
        )}
      </div>

      {/* Ўнг — натижа */}
      <div className="qx-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>{t.upscale.enhancedResult}</h3>
          {result && (
            <button onClick={download} className="qx-btn-ghost !text-xs !py-1.5"><FiDownload size={12} /> {t.common.download}</button>
          )}
        </div>
        <div className="rounded-2xl min-h-[260px] flex items-center justify-center p-4 overflow-auto"
          style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
          {result ? (
            <img src={result} alt="enhanced" className="max-h-72 rounded-lg object-contain" />
          ) : (
            <div className="text-center" style={{ color: "var(--text-faint)" }}>
              <FiImage size={28} className="mx-auto mb-2" />
              <p className="text-xs">{t.upscale.enhancedHere}</p>
            </div>
          )}
        </div>
        {result && outDims.w > 0 && (
          <div className="mt-4 p-3 rounded-xl text-xs"
            style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.3)" }}>
            <span style={{ color: "var(--success)" }}>
              {t.upscale.enhancedTo(outDims.w, outDims.h, scale, sharpen)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
