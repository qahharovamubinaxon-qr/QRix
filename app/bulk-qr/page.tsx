"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUploadCloud, FiDownload, FiGrid, FiArrowLeft, FiZap } from "react-icons/fi";

type Row = { data: string; name: string };

const DOT_TYPES = ["rounded", "square", "dots", "classy", "extra-rounded"] as const;

export default function BulkQRPage() {
  const [raw, setRaw] = useState("");
  const [color, setColor] = useState("#0e0e0e");
  const [dot, setDot] = useState<(typeof DOT_TYPES)[number]>("rounded");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  const rows = parseRows(raw);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result || ""));
    reader.readAsText(f);
  };

  async function makeStyling(data: string, size: number) {
    const mod = await import("qr-code-styling");
    const QRCodeStyling = mod.default;
    return new QRCodeStyling({
      width: size,
      height: size,
      type: "canvas",
      data,
      margin: 8,
      qrOptions: { errorCorrectionLevel: "H" },
      dotsOptions: { type: dot, color },
      cornersSquareOptions: { type: "extra-rounded", color },
      cornersDotOptions: { type: "dot", color },
      backgroundOptions: { color: "#ffffff" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  const preview = async () => {
    const sample = rows.slice(0, 8);
    const urls: string[] = [];
    for (const r of sample) {
      const qr = await makeStyling(r.data, 140);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = (await (qr as any).getRawData("png")) as Blob | null;
      if (blob) urls.push(URL.createObjectURL(blob));
    }
    setPreviews(urls);
  };

  const generateZip = async () => {
    if (!rows.length) return;
    setBusy(true);
    setProgress(0);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Set<string>();

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const qr = await makeStyling(r.data, 512);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = (await (qr as any).getRawData("png")) as Blob | null;
        if (blob) {
          let name = sanitize(r.name) || `qr-${i + 1}`;
          let n = name; let k = 1;
          while (used.has(n)) n = `${name}-${k++}`;
          used.add(n);
          zip.file(`${n}.png`, blob);
        }
        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      const out = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(out);
      a.download = "qrix-bulk-qr.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-[980px] mx-auto px-5 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
        <FiArrowLeft size={14} /> Back to home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,143,32,0.15)", color: "#F58F20" }}>
          <FiGrid size={20} />
        </span>
        <h1 className="font-display text-[28px] font-extrabold" style={{ color: "var(--text)" }}>Bulk QR Generator</h1>
      </div>
      <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)" }}>
        Paste links (one per line) or upload a CSV/TXT, then download all QR codes as a ZIP.
        Format: <code style={{ color: "var(--primary)" }}>link, optional-filename</code>
      </p>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Input */}
        <div className="qx-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold" style={{ color: "var(--text)" }}>Links</span>
            <label className="qx-btn-ghost !text-xs cursor-pointer">
              <FiUploadCloud size={13} /> Upload CSV/TXT
              <input type="file" accept=".csv,.txt" onChange={onFile} className="hidden" />
            </label>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={12}
            placeholder={"https://example.com/page-1, homepage\nhttps://example.com/page-2, promo\nhttps://example.com/page-3"}
            className="qx-auth-input font-mono !text-[12px]"
            style={{ resize: "vertical" }}
          />
          <div className="mt-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
            <b style={{ color: "var(--primary)" }}>{rows.length}</b> QR code{rows.length === 1 ? "" : "s"} ready
          </div>
        </div>

        {/* Options */}
        <div className="qx-card p-5 space-y-5 h-max">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Dot style</div>
            <div className="grid grid-cols-2 gap-2">
              {DOT_TYPES.map((d) => (
                <button key={d} onClick={() => setDot(d)}
                  className="py-2 rounded-lg text-[11px] font-bold capitalize transition-all"
                  style={{ background: dot === d ? "#F58F20" : "var(--surface-2)", color: dot === d ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${dot === d ? "transparent" : "var(--border)"}` }}>
                  {d.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Color</div>
            <div className="flex flex-wrap items-center gap-2">
              {["#0e0e0e", "#F58F20", "#467434", "#7c3aed", "#2563eb"].map((c) => (
                <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-lg"
                  style={{ background: c, border: color === c ? "2px solid #F58F20" : "1px solid var(--border)" }} />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
            </div>
          </div>

          <button onClick={preview} disabled={!rows.length} className="qx-btn-ghost w-full !py-2.5 text-sm disabled:opacity-40">
            <FiZap size={14} /> Preview
          </button>
          <button onClick={generateZip} disabled={busy || !rows.length} className="qx-btn-hero w-full disabled:opacity-50">
            {busy ? `Generating… ${progress}%` : <><FiDownload size={15} /> Download ZIP</>}
          </button>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-8">
          <div className="text-[12px] font-bold mb-3" style={{ color: "var(--text)" }}>Preview (first {previews.length})</div>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`qr-${i}`} className="w-24 h-24 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function parseRows(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [data, ...rest] = line.split(",");
      return { data: data.trim(), name: rest.join(",").trim() };
    })
    .filter((r) => r.data);
}

function sanitize(s: string): string {
  return s.replace(/[^\w.-]+/g, "_").slice(0, 60);
}
