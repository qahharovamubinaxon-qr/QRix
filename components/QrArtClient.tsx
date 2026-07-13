"use client";

/* AI QR Art (Mission 70) — generate a striking AI background for your QR
   code and composite a clean, scannable QR panel on top. The art is made by
   the free Cloudflare Flux backend via /api/ai/process; the QR (qr-code-
   styling) and the poster composite are built on-device. Downloads a PNG. */

import { useEffect, useRef, useState } from "react";
import { FiImage, FiZap, FiDownload, FiRefreshCw } from "react-icons/fi";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Preset = { id: string; label: string; w: number; h: number };
const PRESETS: Preset[] = [
  { id: "portrait", label: "Poster 4:5", w: 1080, h: 1350 },
  { id: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
];

const STYLES = [
  { id: "sunset", label: "Sunset", p: "dreamy sunset sky over mountains, warm orange and pink gradient, soft clouds" },
  { id: "neon", label: "Neon city", p: "futuristic neon city at night, vibrant purple and cyan lights, bokeh" },
  { id: "nature", label: "Nature", p: "lush green forest with sunlight rays, fresh vibrant botanical, macro leaves" },
  { id: "abstract", label: "Abstract", p: "flowing abstract liquid shapes, vivid gradient, smooth 3d render" },
  { id: "ocean", label: "Ocean", p: "turquoise ocean waves from above, clear water, tropical, sunlight" },
  { id: "minimal", label: "Minimal", p: "minimal soft pastel gradient background, clean, elegant, subtle grain" },
];

export default function QrArtClient() {
  const [link, setLink] = useState("https://qrix.uz");
  const [style, setStyle] = useState(STYLES[0]);
  const [extra, setExtra] = useState("");
  const [headline, setHeadline] = useState("SCAN ME");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [artUrl, setArtUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const artRef = useRef<HTMLImageElement | null>(null);

  /* build the QR bitmap when the link changes */
  useEffect(() => {
    let dead = false;
    const url = link.trim();
    if (!url) { qrRef.current = null; return; }
    const id = setTimeout(async () => {
      try {
        const mod = await import("qr-code-styling");
        const qr = new mod.default({
          width: 560, height: 560, type: "canvas", data: url, margin: 0,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { type: "rounded", color: "#0e0e0e" },
          cornersSquareOptions: { type: "extra-rounded", color: "#0e0e0e" },
          backgroundOptions: { color: "#ffffff" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b = (await (qr as any).getRawData("png")) as Blob | null;
        if (!b || dead) return;
        const bmp = await createImageBitmap(b);
        const c = document.createElement("canvas");
        c.width = bmp.width; c.height = bmp.height;
        c.getContext("2d")!.drawImage(bmp, 0, 0);
        qrRef.current = c;
        redraw();
      } catch { /* keep previous */ }
    }, 250);
    return () => { dead = true; clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]);

  useEffect(() => { redraw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [preset, headline, artUrl]);

  function redraw() {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = preset.w, H = preset.h;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const M = Math.min(W, H);

    // background — AI art (cover) or a fallback gradient
    const art = artRef.current;
    if (art && art.complete && art.naturalWidth) {
      const s = Math.max(W / art.naturalWidth, H / art.naturalHeight);
      const dw = art.naturalWidth * s, dh = art.naturalHeight * s;
      ctx.drawImage(art, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#ff8a3c"); g.addColorStop(1, "#12060a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // bottom scrim for contrast
    const sc = ctx.createLinearGradient(0, H * 0.45, 0, H);
    sc.addColorStop(0, "rgba(0,0,0,0)"); sc.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H);

    // QR panel — a clean white rounded card (keeps the code scannable)
    const qr = qrRef.current;
    const qs = M * 0.44;
    const pad = qs * 0.11;
    const cs = qs + pad * 2;
    const cx = W / 2, cy = H * (H > W ? 0.6 : 0.52);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = M * 0.05; ctx.shadowOffsetY = M * 0.012;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void })
      .roundRect(cx - cs / 2, cy - cs / 2, cs, cs, cs * 0.09);
    ctx.fill();
    ctx.restore();
    if (qr) ctx.drawImage(qr, cx - qs / 2, cy - qs / 2, qs, qs);

    // headline
    if (headline.trim()) {
      ctx.textAlign = "center";
      ctx.font = `800 ${M * 0.075}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = M * 0.03;
      ctx.fillText(headline.trim().toUpperCase().slice(0, 22), cx, cy - cs / 2 - M * 0.05);
      ctx.shadowBlur = 0;
    }
  }

  async function generate() {
    setBusy(true); setErr(null);
    try {
      const prompt = `${style.p}${extra.trim() ? ", " + extra.trim() : ""}, high quality, vibrant poster background, no text, no words, no letters`;
      const r = await fetch("/api/ai/process", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "image-generate", payload: { prompt } }),
      });
      const j = await r.json();
      if (!j.ok || !j.imageUrl) throw new Error(j.error === "ai_engine_not_configured" ? "AI image engine isn't configured yet." : "Generation failed — try again.");
      const img = new Image();
      img.onload = () => { artRef.current = img; setArtUrl(j.imageUrl); redraw(); };
      img.src = j.imageUrl;
      trackTool("qr-art", { provider: j.provider });
    } catch (e) {
      setErr((e as Error).message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.toBlob(async (b) => { if (b) await saveBlob(b, "qrix-qr-art.png"); }, "image/png");
  }

  const field = "w-full px-4 py-3 rounded-xl text-[14px]";
  const fs = { background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" } as const;

  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8 items-start">
      <div className="space-y-4">
        <label className="block">
          <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Link for the QR</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" aria-label="Link" className={field} style={fs} />
        </label>
        <div>
          <span className="block text-[12px] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Art style</span>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button key={s.id} type="button" onClick={() => setStyle(s)}
                className="px-3.5 py-2 rounded-full text-[12px] font-semibold"
                style={{ background: style.id === s.id ? "var(--primary-bright)" : "var(--surface-2)", color: style.id === s.id ? "#0e0e0e" : "var(--text-muted)", border: "1px solid var(--border)" }}>{s.label}</button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Extra prompt (optional)</span>
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. coffee cup, autumn leaves" aria-label="Extra prompt" className={field} style={fs} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Headline</span>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={22} aria-label="Headline" className={field} style={fs} />
          </label>
          <div>
            <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Format</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => setPreset(p)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{ background: preset.id === p.id ? "var(--primary-dim)" : "var(--surface-2)", color: preset.id === p.id ? "var(--primary-bright)" : "var(--text-muted)", border: `1px solid ${preset.id === p.id ? "var(--border-hover)" : "var(--border)"}` }}>{p.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-1 space-y-2.5">
          <button type="button" onClick={generate} disabled={busy} className="qx-btn-hero w-full disabled:opacity-60">
            {busy ? <><FiZap size={15} className="animate-pulse" /> Generating art…</> : <>{artUrl ? <FiRefreshCw size={15} /> : <FiZap size={15} />} {artUrl ? "Regenerate art" : "Generate AI QR art"}</>}
          </button>
          <button type="button" onClick={download} disabled={!artUrl && !qrRef.current} className="qx-btn-ghost w-full !py-3 text-sm disabled:opacity-40">
            <FiDownload size={14} /> Download PNG
          </button>
          {err && <p className="text-[12.5px]" style={{ color: "var(--danger)" }}>{err}</p>}
          <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
            <FiImage size={11} className="inline -mt-0.5 mr-1" />
            The AI background is generated free; your QR stays in a clean panel so it always scans. Composited on your device.
          </p>
        </div>
      </div>

      <div className="flex justify-center lg:sticky lg:top-24">
        <canvas ref={canvasRef} role="img" aria-label="AI QR art preview"
          style={{ width: "100%", maxWidth: preset.w > preset.h ? 520 : preset.w === preset.h ? 460 : 340, aspectRatio: `${preset.w} / ${preset.h}`, borderRadius: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", background: "var(--surface)" }} />
      </div>
    </div>
  );
}
