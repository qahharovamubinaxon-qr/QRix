"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { FiDownload, FiChevronDown, FiSliders } from "react-icons/fi";
import QRDesignStudio, { designStudioTriggerProps } from "@/components/QRDesignStudioLoader";

/* ============ Field definitions ============ */
export type FieldType = "text" | "url" | "tel" | "email" | "number" | "textarea" | "password" | "date" | "datetime-local" | "select";

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

export default function QRGenerator({ type }: { type: QrType }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [qrValue, setQrValue] = useState("https://qrix.uz");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const size = 240;
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

  const onTilt = (e: React.MouseEvent) => {
    const b = boxRef.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
  };

  const inputCls = "w-full px-4 py-3 text-sm";

  const renderField = (f: Field) => {
    const common = { id: f.key, "aria-label": f.label, value: values[f.key] || "", onChange: (e: any) => set(f.key, e.target.value), placeholder: f.placeholder, className: inputCls };
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
                <label htmlFor={f.key} className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>{f.label}</label>
                {renderField(f)}
              </div>
            ))}
          </div>

          <button onClick={() => setDesignOpen(true)} {...designStudioTriggerProps} className="qx-btn-ghost w-full mt-5">
            <FiSliders size={14} /> Customize Design
          </button>
        </div>

        {/* Ўнг — превью */}
        <div className="qx-card p-6">
          <h3 className="font-display text-sm font-bold mb-4" style={{ color: "var(--text)" }}>Your QR Code</h3>
          <div ref={boxRef} onMouseMove={onTilt} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="flex items-center justify-center" style={{ perspective: 700 }}>
            <div ref={wrapRef} role="img" aria-label={`QR code for ${qrValue}`} className="p-4 rounded-2xl transition-transform duration-150"
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
              <button onClick={() => setDlOpen(!dlOpen)} aria-label="Download format" aria-haspopup="true" aria-expanded={dlOpen} className="qx-btn !rounded-l-none !px-3" style={{ borderLeft: "1px solid rgba(255,255,255,.2)" }}>
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

      {/* The full Design Studio — templates, shapes, gradients, logo modes
          (center / logo-as-QR), scan check, hi-res export. `onApply` syncs
          the basics back into this page's live preview. */}
      {designOpen && (
        <QRDesignStudio
          value={qrValue}
          initialFg={fg}
          initialBg={bg}
          initialLevel={level}
          initialLogo={logo}
          onClose={() => setDesignOpen(false)}
          onApply={(b) => { setFg(b.fg); setBg(b.bg); setLevel(b.level); setLogo(b.logo); }}
        />
      )}
    </>
  );
}
