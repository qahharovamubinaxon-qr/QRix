"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
  FiDownload, FiChevronDown, FiSliders, FiX, FiUpload, FiTrash2, FiCheck,
} from "react-icons/fi";

/* ============ Field definitions ============ */
export type FieldType = "text" | "url" | "tel" | "email" | "number" | "textarea" | "password" | "date" | "select";

export type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  full?: boolean; // занимает всю ширину
};

export type QrType = {
  id: string;
  fields: Field[];
  build: (v: Record<string, string>) => string;
};

const COLOR_PRESETS = ["#000000", "#7c3aed", "#2563eb", "#0891b2", "#16a34a", "#dc2626", "#db2777", "#d97706"];
const BG_PRESETS = ["#ffffff", "#f4f4f8", "#fef9c3", "#e0f2fe", "#f3e8ff", "#dcfce7", "#ffe4e6", "#0a0a14"];

export default function QRGenerator({ type }: { type: QrType }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [qrValue, setQrValue] = useState("https://qrix.uz");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(240);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [logo, setLogo] = useState<string | null>(null);
  const [designOpen, setDesignOpen] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Реал вақтда QR янгиланади
  useEffect(() => {
    const built = type.build(values);
    if (built && built.trim()) setQrValue(built);
  }, [values, type]);

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const downloadPng = () => {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qrix-${type.id}.png`;
    a.click();
    setDlOpen(false);
  };

  const downloadSvg = () => {
    const svg = document.getElementById("qr-svg-hidden")?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrix-${type.id}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
    setDlOpen(false);
  };

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setLogo(r.result as string);
    r.readAsDataURL(f);
  };

  const onTilt = (e: React.MouseEvent) => {
    const b = boxRef.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
  };

  const inputCls = "w-full px-4 py-3 text-sm";

  const renderField = (f: Field) => {
    const common = { value: values[f.key] || "", onChange: (e: any) => set(f.key, e.target.value), placeholder: f.placeholder, className: inputCls };
    if (f.type === "textarea") return <textarea {...common} rows={3} className={`${inputCls} resize-none`} />;
    if (f.type === "select")
      return (
        <select {...common} style={{ color: "var(--text)" }}>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    return <input {...common} type={f.type === "url" ? "text" : f.type || "text"} />;
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Чап — форма */}
        <div className="qx-card p-6">
          <div className={`grid gap-3 ${type.fields.length > 4 ? "sm:grid-cols-2" : ""}`}>
            {type.fields.map((f) => (
              <div key={f.key} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>{f.label}</label>
                {renderField(f)}
              </div>
            ))}
          </div>

          <button onClick={() => setDesignOpen(true)} className="qx-btn-ghost w-full mt-5">
            <FiSliders size={14} /> Customize Design
          </button>
        </div>

        {/* Ўнг — превью */}
        <div className="qx-card p-6">
          <h3 className="font-display text-sm font-bold mb-4" style={{ color: "var(--text)" }}>Your QR Code</h3>
          <div ref={boxRef} onMouseMove={onTilt} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="flex items-center justify-center" style={{ perspective: 700 }}>
            <div ref={wrapRef} className="p-4 rounded-2xl transition-transform duration-150"
              style={{ background: bg, transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,.3), 0 0 30px rgba(124,58,237,.15)" }}>
              <QRCodeCanvas value={qrValue} size={size} bgColor={bg} fgColor={fg} level={level} marginSize={1}
                imageSettings={logo ? { src: logo, height: Math.round(size * 0.2), width: Math.round(size * 0.2), excavate: true } : undefined} />
            </div>
          </div>
          <div id="qr-svg-hidden" style={{ display: "none" }}>
            <QRCodeSVG value={qrValue} size={size} bgColor={bg} fgColor={fg} level={level} marginSize={1} />
          </div>

          <div className="relative mt-5">
            <div className="flex">
              <button onClick={downloadPng} className="qx-btn flex-1 !rounded-r-none"><FiDownload size={14} /> Download PNG</button>
              <button onClick={() => setDlOpen(!dlOpen)} className="qx-btn !rounded-l-none !px-3" style={{ borderLeft: "1px solid rgba(255,255,255,.2)" }}>
                <FiChevronDown size={14} />
              </button>
            </div>
            {dlOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-40"
                style={{ background: "var(--surface-solid)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-pop)" }}>
                <button onClick={downloadPng} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:opacity-80" style={{ color: "var(--text)" }}>PNG</button>
                <button onClick={downloadSvg} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:opacity-80" style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}>SVG</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Design modal */}
      {designOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }} onClick={() => setDesignOpen(false)}>
          <div className="qx-card w-full max-w-lg max-h-[88vh] overflow-y-auto p-6" style={{ background: "var(--surface-solid)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <FiSliders style={{ color: "var(--primary-bright)" }} /> QR Design Studio
              </h3>
              <button onClick={() => setDesignOpen(false)} className="qx-btn-ghost !p-2"><FiX size={16} /></button>
            </div>
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-xl" style={{ background: bg, boxShadow: "0 8px 28px rgba(0,0,0,.3)" }}>
                <QRCodeCanvas value={qrValue} size={120} bgColor={bg} fgColor={fg} level={level} marginSize={1}
                  imageSettings={logo ? { src: logo, height: 24, width: 24, excavate: true } : undefined} />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>🎨 QR Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setFg(c)} className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: fg === c ? "2px solid var(--primary-bright)" : "1px solid var(--border)" }} />
                ))}
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>🖼 Background</label>
              <div className="flex flex-wrap items-center gap-2">
                {BG_PRESETS.map((c) => (
                  <button key={c} onClick={() => setBg(c)} className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: bg === c ? "2px solid var(--primary-bright)" : "1px solid var(--border)" }} />
                ))}
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>📐 Size: {size}px</label>
              <input type="range" min={160} max={400} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-violet-500" />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>🛡 Error Correction</label>
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as const).map((lv) => (
                  <button key={lv} onClick={() => setLevel(lv)} className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: level === lv ? "var(--grad-primary)" : "var(--surface-hover)", color: level === lv ? "#fff" : "var(--text-muted)", border: `1px solid ${level === lv ? "transparent" : "var(--border)"}` }}>
                    {lv}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>⭐ Logo</label>
              <div className="flex items-center gap-3">
                <label className="qx-btn-ghost !text-xs cursor-pointer">
                  <FiUpload size={13} /> Upload logo
                  <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
                </label>
                {logo && (
                  <>
                    <img src={logo} alt="logo" className="w-9 h-9 rounded-lg object-contain" style={{ border: "1px solid var(--border)" }} />
                    <button onClick={() => setLogo(null)} className="qx-btn-ghost !text-xs !text-red-400"><FiTrash2 size={13} /> Remove</button>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => setDesignOpen(false)} className="qx-btn w-full"><FiCheck size={14} /> Done</button>
          </div>
        </div>
      )}
    </>
  );
}
