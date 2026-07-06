"use client";

/* Overlay engine: text | emoji | watermark | qr | barcode.
   Composites onto a canvas with a draggable overlay preview. */

import { useEffect, useRef, useState } from "react";
import { AiResultBar, AiDropzone } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

type OV = "text" | "emoji" | "watermark" | "qr" | "barcode";
function loadImg(f: File): Promise<HTMLImageElement> { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); }); }

export default function ImageOverlayClient({ preset }: { preset: OV }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const overlayImg = useRef<HTMLImageElement | null>(null);
  const [text, setText] = useState(preset === "watermark" ? "© QRix" : "Your text");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(8);
  const [opacity, setOpacity] = useState(preset === "watermark" ? 0.5 : 1);
  const [tile, setTile] = useState(preset === "watermark");
  const [emoji, setEmoji] = useState("😎");
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [qrData, setQrData] = useState("https://qrix.uz");
  const [bcFormat, setBcFormat] = useState("CODE128");
  const drag = useRef(false);

  async function onFile(f: File) { trackTool(`img-overlay-${preset}`); setImg(await loadImg(f)); setBlob(null); }

  // (re)build the QR/barcode overlay image when data changes
  useEffect(() => {
    let dead = false;
    (async () => {
      if (preset === "qr") {
        const mod = await import("qr-code-styling");
        const qr = new mod.default({ width: 400, height: 400, type: "canvas", data: qrData || "https://qrix.uz", margin: 8, dotsOptions: { type: "rounded", color: "#000" }, backgroundOptions: { color: "#fff" } });
        const b = await qr.getRawData("png") as Blob;
        if (dead) return; const im = new Image(); im.onload = () => { overlayImg.current = im; renderPreview(); }; im.src = URL.createObjectURL(b);
      } else if (preset === "barcode") {
        const JsBarcode = (await import("jsbarcode")).default; const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        try { JsBarcode(svg, text || "QRIX123", { format: bcFormat, background: "#fff", height: 120, displayValue: true }); } catch { return; }
        const xml = new XMLSerializer().serializeToString(svg); const im = new Image(); im.onload = () => { overlayImg.current = im; renderPreview(); }; im.src = "data:image/svg+xml," + encodeURIComponent(xml);
      }
    })();
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, qrData, text, bcFormat]);

  function renderPreview() {
    const v = viewRef.current; if (!v || !img) return;
    const sc = Math.min(1, 800 / img.width); v.width = img.width * sc; v.height = img.height * sc;
    const ctx = v.getContext("2d")!; ctx.drawImage(img, 0, 0, v.width, v.height);
    const W = v.width, H = v.height;
    ctx.globalAlpha = opacity;
    if (preset === "text" || preset === "watermark") {
      const fs = (size / 100) * H;
      ctx.font = `800 ${fs}px SUSE, sans-serif`; ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.lineWidth = fs * 0.06; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (tile) { ctx.globalAlpha = opacity * 0.7; ctx.save(); ctx.rotate(-0.4); for (let y = -H; y < H * 2; y += fs * 3) for (let x = -W; x < W * 2; x += ctx.measureText(text).width + fs * 2) ctx.fillText(text, x, y); ctx.restore(); }
      else { ctx.strokeText(text, W * pos.x, H * pos.y); ctx.fillText(text, W * pos.x, H * pos.y); }
    } else if (preset === "emoji") {
      const fs = (size / 100) * H * 1.6; ctx.font = `${fs}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(emoji, W * pos.x, H * pos.y);
    } else if (overlayImg.current) {
      const ov = overlayImg.current; const ow = (size / 100) * W * 3.5; const oh = ov.height / ov.width * ow;
      ctx.drawImage(ov, W * pos.x - ow / 2, H * pos.y - oh / 2, ow, oh);
    }
    ctx.globalAlpha = 1;
  }
  useEffect(() => { renderPreview(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [img, text, color, size, opacity, tile, emoji, pos]);

  async function download() { const v = viewRef.current; if (!v) return; const b = await new Promise<Blob | null>((r) => v.toBlob(r, "image/png")); if (b) { setBlob(b); const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, `qrix-${preset}.png`); } }

  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={onFile} />}
    {img && <>
      <div className="flex flex-wrap items-center gap-3">
        {(preset === "text" || preset === "watermark") && <><input value={text} onChange={(e) => setText(e.target.value.slice(0, 60))} className="qx-auth-input !py-2 w-48" placeholder="Text" /><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer" /></>}
        {preset === "emoji" && <div className="flex gap-1">{["😎", "🔥", "❤️", "⭐", "👍", "🎉", "💯", "😂"].map((e) => <button key={e} onClick={() => setEmoji(e)} className="w-9 h-9 rounded-lg text-lg" style={{ background: emoji === e ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${emoji === e ? "var(--primary-bright)" : "var(--border)"}` }}>{e}</button>)}</div>}
        {preset === "qr" && <input value={qrData} onChange={(e) => setQrData(e.target.value)} className="qx-auth-input !py-2 w-56" placeholder="https://…" />}
        {preset === "barcode" && <><input value={text} onChange={(e) => setText(e.target.value.slice(0, 40))} className="qx-auth-input !py-2 w-40" placeholder="Value" /><select value={bcFormat} onChange={(e) => setBcFormat(e.target.value)} className="qx-auth-input !py-2 w-36">{["CODE128", "EAN13", "UPC", "CODE39"].map((f) => <option key={f}>{f}</option>)}</select></>}
        <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Size <input type="range" min={2} max={30} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-28 accent-[#e1ff04]" /></label>
        {preset === "watermark" ? <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer" style={{ color: "var(--text)" }}><input type="checkbox" checked={tile} onChange={(e) => setTile(e.target.checked)} className="accent-[#e1ff04] w-4 h-4" /> Tile</label> : null}
        <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Opacity <input type="range" min={10} max={100} value={opacity * 100} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-28 accent-[#e1ff04]" /></label>
      </div>
      <canvas ref={viewRef} className="max-w-full h-auto rounded-2xl cursor-move" style={{ border: "1px solid var(--border)", maxHeight: 460, touchAction: "none" }}
        onPointerDown={(e) => { if (tile) return; drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }); }}
        onPointerMove={(e) => { if (!drag.current) return; const r = e.currentTarget.getBoundingClientRect(); setPos({ x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }); }}
        onPointerUp={() => { drag.current = false; }} />
      {!tile && <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Drag on the image to reposition the overlay.</p>}
      <button onClick={download} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>Download PNG</button>
      {blob && <AiResultBar blob={blob} filename={`qrix-${preset}.png`} onReset={() => { setImg(null); setBlob(null); }} />}
    </>}
  </div>;
}
