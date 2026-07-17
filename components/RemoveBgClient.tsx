"use client";

import { useState, useEffect, useRef } from "react";
import { FiUpload, FiDownload, FiLoader, FiImage, FiScissors, FiCheck } from "react-icons/fi";

const CHECKER =
  "repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 18px 18px";

// 10 хил фон ранги (биринчиси — шаффоф)
const BG_COLORS = [
  { name: "Transparent", value: "transparent" },
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#2563eb" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Pink", value: "#db2777" },
  { name: "Orange", value: "#ea580c" },
  { name: "Sky", value: "#0ea5e9" },
];

export default function RemoveBgClient() {
  const [original, setOriginal] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cutout, setCutout] = useState<string | null>(null); // шаффоф натижа
  const [bgColor, setBgColor] = useState("transparent");
  const [composed, setComposed] = useState<string | null>(null); // рангли фон қўйилган
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const cutoutImgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setCutout(null);
    setComposed(null);
    setBgColor("transparent");
    const reader = new FileReader();
    reader.onload = () => setOriginal(reader.result as string);
    reader.readAsDataURL(f);
  };

  const remove = async () => {
    if (!file) return;
    setBusy(true);
    setStatus("Loading AI model...");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      // No publicPath override: the assets load from the package's own CDN.
      // The old `${origin}/imgly/` pointed at files that were never shipped,
      // so every run 404'd on the model and hung at "Loading AI model...".
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (key.includes("fetch")) {
            const pct = total > 0 ? ` ${Math.round((current / total) * 100)}%` : "";
            setStatus(`Loading AI model…${pct} (first run only)`);
          } else {
            setStatus(`Processing… ${Math.round((current / total) * 100)}%`);
          }
        },
      });
      const url = URL.createObjectURL(blob);
      setCutout(url);
      setBgColor("transparent");
      setComposed(null);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error — please try another image.");
    } finally {
      setBusy(false);
    }
  };

  // Шаффоф натижани юклаб бўлгач, тасвирни хотирага оламиз
  useEffect(() => {
    if (!cutout) return;
    const img = new Image();
    img.onload = () => { cutoutImgRef.current = img; };
    img.src = cutout;
  }, [cutout]);

  // Ранг танланганда — canvas'да фон қўшиб композиция ясаймиз
  useEffect(() => {
    if (!cutout) return;
    if (bgColor === "transparent") {
      setComposed(null);
      return;
    }
    const draw = () => {
      const img = cutoutImgRef.current;
      if (!img || !img.complete || !img.naturalWidth) {
        setTimeout(draw, 80);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setComposed(canvas.toDataURL("image/png"));
    };
    draw();
  }, [bgColor, cutout]);

  const shown = bgColor === "transparent" ? cutout : composed;

  const download = () => {
    const src = shown;
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    const suffix = bgColor === "transparent" ? "no-bg" : "bg-" + BG_COLORS.find((c) => c.value === bgColor)?.name.toLowerCase();
    a.download = (file?.name.replace(/\.[^.]+$/, "") || "image") + `-${suffix}.png`;
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Чап — оригинал */}
      <div className="qx-card p-6">
        <h3 className="font-display text-sm font-bold mb-4" style={{ color: "var(--text)" }}>Original</h3>
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer transition-colors min-h-[280px]"
          style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}
        >
          {original ? (
            <img src={original} alt="original" className="max-h-72 rounded-xl object-contain" />
          ) : (
            <>
              <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Choose an image</span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>JPG, PNG, WebP</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
        </label>

        <button onClick={remove} disabled={!file || busy} className="qx-btn w-full mt-5 !py-3.5 disabled:opacity-50">
          {busy ? <><FiLoader size={15} className="animate-spin" /> {status || "Processing..."}</> : <><FiScissors size={15} /> Remove Background</>}
        </button>
        {busy && (
          <p className="mt-2 text-[11px] text-center" style={{ color: "var(--text-faint)" }}>
            Runs locally in your browser — your image is never uploaded.
          </p>
        )}
      </div>

      {/* Ўнг — натижа */}
      <div className="qx-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>
            Result {bgColor === "transparent" ? "(transparent)" : ""}
          </h3>
          {cutout && (
            <button onClick={download} className="qx-btn-ghost !text-xs !py-1.5">
              <FiDownload size={12} /> PNG
            </button>
          )}
        </div>
        <div className="rounded-2xl min-h-[280px] flex items-center justify-center p-4"
          style={{
            background: bgColor === "transparent" ? (cutout ? CHECKER : "var(--surface-hover)") : bgColor,
            border: "1px solid var(--border)",
          }}>
          {shown ? (
            <img src={shown} alt="result" className="max-h-72 rounded-lg object-contain" />
          ) : cutout && bgColor !== "transparent" ? (
            <FiLoader size={24} className="animate-spin" style={{ color: "var(--primary-bright)" }} />
          ) : (
            <div className="text-center" style={{ color: "var(--text-faint)" }}>
              <FiImage size={28} className="mx-auto mb-2" />
              <p className="text-xs">Result will appear here</p>
            </div>
          )}
        </div>

        {/* Ранг танлаш — фақат натижа тайёр бўлганда */}
        {cutout && (
          <div className="mt-5">
            <label className="block text-xs font-bold mb-3" style={{ color: "var(--text)" }}>
              Background color
            </label>
            <div className="flex flex-wrap gap-2">
              {BG_COLORS.map((c) => {
                const active = bgColor === c.value;
                const isTransparent = c.value === "transparent";
                return (
                  <button
                    key={c.value}
                    onClick={() => setBgColor(c.value)}
                    title={c.name}
                    className="w-9 h-9 rounded-lg transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      background: isTransparent ? CHECKER : c.value,
                      border: active ? "2px solid var(--primary-bright)" : "1px solid var(--border)",
                      boxShadow: active ? "var(--glow-primary)" : "none",
                    }}
                  >
                    {active && (
                      <FiCheck size={14} style={{ color: c.value === "#ffffff" || isTransparent ? "#000" : "#fff" }} />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
              Pick a color, then download. Transparent keeps the cut-out PNG.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
