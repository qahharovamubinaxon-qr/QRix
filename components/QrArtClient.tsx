"use client";

/* AI QR Art (Mission 70, pro pass Mission 87) — generate a striking AI
   background and composite a scannable QR panel on top. The art comes from
   the free Cloudflare Flux backend via /api/ai/process; the QR (qr-code-
   styling) and the poster composite are built on-device.

   Pro editor: the QR panel and the headline are DRAGGABLE right on the
   preview canvas (pointer events, canvas-space hit testing), with size
   slider, panel styles (card / compact / glass), position presets and a
   contrast scrim toggle. What you see is exactly the PNG you download —
   everything renders on one canvas. */

import { useEffect, useRef, useState } from "react";
import { FiImage, FiZap, FiDownload, FiRefreshCw, FiMove, FiRotateCcw } from "react-icons/fi";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Preset = { id: string; label: string; w: number; h: number };
const PRESETS: Preset[] = [
  { id: "portrait", label: "Poster 4:5", w: 1080, h: 1350 },
  { id: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
];

const STYLES = [
  { id: "sunset", label: "🌅 Sunset", p: "dreamy sunset sky over mountains, warm orange and pink gradient, soft clouds" },
  { id: "neon", label: "🌃 Neon city", p: "futuristic neon city at night, vibrant purple and cyan lights, bokeh" },
  { id: "nature", label: "🌿 Nature", p: "lush green forest with sunlight rays, fresh vibrant botanical, macro leaves" },
  { id: "abstract", label: "🎨 Abstract", p: "flowing abstract liquid shapes, vivid gradient, smooth 3d render" },
  { id: "ocean", label: "🌊 Ocean", p: "turquoise ocean waves from above, clear water, tropical, sunlight" },
  { id: "minimal", label: "✨ Minimal", p: "minimal soft pastel gradient background, clean, elegant, subtle grain" },
];

/* Panel materials — pad is the white quiet zone around the code (fraction of
   QR size), alpha the card opacity. All stay scannable: the modules render
   fully opaque and error correction is H. */
const PANELS = [
  { id: "card", label: "Card", pad: 0.11, alpha: 1 },
  { id: "compact", label: "Compact", pad: 0.05, alpha: 1 },
  { id: "glass", label: "Glass", pad: 0.11, alpha: 0.74 },
] as const;
type PanelId = (typeof PANELS)[number]["id"];

/* 9-dot quick placement grid (fractions of the canvas) */
const SPOTS: { x: number; y: number }[] = [
  { x: 0.24, y: 0.22 }, { x: 0.5, y: 0.22 }, { x: 0.76, y: 0.22 },
  { x: 0.24, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.76, y: 0.5 },
  { x: 0.24, y: 0.78 }, { x: 0.5, y: 0.78 }, { x: 0.76, y: 0.78 },
];

type Frac = { x: number; y: number };
type DragTarget = "qr" | "head" | null;

export default function QrArtClient() {
  const [link, setLink] = useState("https://qrixtools.com");
  const [style, setStyle] = useState(STYLES[0]);
  const [extra, setExtra] = useState("");
  const [headline, setHeadline] = useState("SCAN ME");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [artUrl, setArtUrl] = useState<string | null>(null);

  /* layout state — fractions so they survive format changes */
  const [qrPos, setQrPos] = useState<Frac>({ x: 0.5, y: 0.62 });
  const [qrScale, setQrScale] = useState(0.34); // of min(W,H)
  const [headPos, setHeadPos] = useState<Frac | null>(null); // null = auto (rides above the QR)
  const [panel, setPanel] = useState<PanelId>("card");
  const [scrim, setScrim] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const artRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ target: DragTarget; dx: number; dy: number }>({ target: null, dx: 0, dy: 0 });
  const [hover, setHover] = useState<DragTarget>(null);

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

  useEffect(() => { redraw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ },
    [preset, headline, artUrl, qrPos, qrScale, headPos, panel, scrim]);

  /* ── geometry shared by redraw + hit testing ── */
  function geom(W: number, H: number) {
    const M = Math.min(W, H);
    const p = PANELS.find((x) => x.id === panel)!;
    const qs = M * qrScale;
    const pad = qs * p.pad;
    const cs = qs + pad * 2;
    const cx = clamp(qrPos.x * W, cs / 2 + 6, W - cs / 2 - 6);
    const cy = clamp(qrPos.y * H, cs / 2 + 6, H - cs / 2 - 6);
    const fs = M * 0.075;
    const hx = headPos ? clamp(headPos.x * W, fs, W - fs) : cx;
    const hy = headPos ? clamp(headPos.y * H, fs * 0.9, H - fs * 0.4) : cy - cs / 2 - M * 0.05;
    return { M, p, qs, cs, cx, cy, fs, hx, hy };
  }

  function redraw() {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = preset.w, H = preset.h;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const { M, p, qs, cs, cx, cy, fs, hx, hy } = geom(W, H);

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
    // optional bottom scrim for contrast
    if (scrim) {
      const sc = ctx.createLinearGradient(0, H * 0.45, 0, H);
      sc.addColorStop(0, "rgba(0,0,0,0)"); sc.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H);
    }

    // QR panel
    const qr = qrRef.current;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = M * 0.05; ctx.shadowOffsetY = M * 0.012;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void })
      .roundRect(cx - cs / 2, cy - cs / 2, cs, cs, cs * 0.09);
    ctx.fill();
    ctx.restore();
    if (p.id === "glass") {
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = Math.max(2, M * 0.003);
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void })
        .roundRect(cx - cs / 2, cy - cs / 2, cs, cs, cs * 0.09);
      ctx.stroke();
    }
    if (qr) ctx.drawImage(qr, cx - qs / 2, cy - qs / 2, qs, qs);

    // headline
    if (headline.trim()) {
      ctx.textAlign = "center";
      ctx.font = `800 ${fs}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = M * 0.03;
      ctx.fillText(headline.trim().toUpperCase().slice(0, 22), hx, hy);
      ctx.shadowBlur = 0;
    }
  }

  /* ── drag & drop on the preview (pointer events, canvas space) ── */
  function toCanvas(e: React.PointerEvent): { x: number; y: number } {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * preset.w, y: ((e.clientY - r.top) / r.height) * preset.h };
  }

  function hitTest(x: number, y: number): DragTarget {
    const cv = canvasRef.current;
    if (!cv) return null;
    const { cs, cx, cy, fs, hx, hy } = geom(preset.w, preset.h);
    // headline first (smaller target, sits above the card)
    if (headline.trim()) {
      const ctx = cv.getContext("2d")!;
      ctx.font = `800 ${fs}px Unbounded, Arial, sans-serif`;
      const tw = Math.max(ctx.measureText(headline.trim().toUpperCase().slice(0, 22)).width, fs * 2.4);
      if (x > hx - tw / 2 - fs * 0.3 && x < hx + tw / 2 + fs * 0.3 && y > hy - fs * 1.15 && y < hy + fs * 0.35) return "head";
    }
    if (x > cx - cs / 2 && x < cx + cs / 2 && y > cy - cs / 2 && y < cy + cs / 2) return "qr";
    return null;
  }

  function onPointerDown(e: React.PointerEvent) {
    const { x, y } = toCanvas(e);
    const t = hitTest(x, y);
    if (!t) return;
    e.preventDefault();
    const { cx, cy, hx, hy } = geom(preset.w, preset.h);
    dragRef.current = t === "qr" ? { target: "qr", dx: x - cx, dy: y - cy } : { target: "head", dx: x - hx, dy: y - hy };
    // capture keeps the drag alive outside the canvas; not all pointers support it
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* uncaptured drag still works */ }
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    const { x, y } = toCanvas(e);
    if (!d.target) { setHover(hitTest(x, y)); return; }
    e.preventDefault();
    const fx = clamp((x - d.dx) / preset.w, 0, 1);
    const fy = clamp((y - d.dy) / preset.h, 0, 1);
    if (d.target === "qr") setQrPos({ x: fx, y: fy });
    else setHeadPos({ x: fx, y: fy });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragRef.current.target) {
      trackTool("qr-art", { action: `drag-${dragRef.current.target}` });
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* released */ }
    }
    dragRef.current = { target: null, dx: 0, dy: 0 };
  }

  function resetLayout() {
    setQrPos({ x: 0.5, y: 0.62 }); setQrScale(0.34); setHeadPos(null); setPanel("card"); setScrim(true);
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
  const spotActive = (s: { x: number; y: number }) => Math.abs(qrPos.x - s.x) < 0.09 && Math.abs(qrPos.y - s.y) < 0.09;

  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8 items-start">
      <div className="space-y-5">
        {/* ── 01 · Content ── */}
        <Section n="01" title="Content">
          <label className="block">
            <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Link for the QR</span>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" aria-label="Link" className={field} style={fs} />
          </label>
          <label className="block mt-3">
            <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Headline on the poster</span>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={22} placeholder="SCAN ME" aria-label="Headline" className={field} style={fs} />
          </label>
        </Section>

        {/* ── 02 · AI background ── */}
        <Section n="02" title="AI background">
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map((s) => (
              <button key={s.id} type="button" onClick={() => setStyle(s)}
                className="px-2 py-2 rounded-xl text-[11.5px] font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background: style.id === s.id ? "var(--primary-bright)" : "var(--surface-2)", color: style.id === s.id ? "#0e0e0e" : "var(--text-muted)", border: "1px solid var(--border)" }}>{s.label}</button>
            ))}
          </div>
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Extra prompt — e.g. coffee cup, autumn leaves" aria-label="Extra prompt" className={`${field} mt-2.5`} style={fs} />
          <button type="button" onClick={generate} disabled={busy} className="qx-btn-hero w-full disabled:opacity-60 mt-2.5">
            {busy ? <><FiZap size={15} className="animate-pulse" /> Generating art…</> : <>{artUrl ? <FiRefreshCw size={15} /> : <FiZap size={15} />} {artUrl ? "Regenerate art" : "Generate AI art"}</>}
          </button>
          {err && <p className="text-[12.5px] mt-2" style={{ color: "var(--danger)" }}>{err}</p>}
        </Section>

        {/* ── 03 · Layout ── */}
        <Section n="03" title="Layout">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Format</span>
            <button type="button" onClick={resetLayout} className="inline-flex items-center gap-1 text-[11px] font-bold rounded-lg px-2 py-1 transition-colors"
              style={{ color: "var(--text-faint)", border: "1px solid var(--border)" }}>
              <FiRotateCcw size={10} /> Reset
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPreset(p)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                style={{ background: preset.id === p.id ? "var(--primary-dim)" : "var(--surface-2)", color: preset.id === p.id ? "var(--primary-bright)" : "var(--text-muted)", border: `1px solid ${preset.id === p.id ? "var(--border-hover)" : "var(--border)"}` }}>{p.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 mt-4 items-start">
            <div>
              <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>QR size — {Math.round(qrScale * 100)}%</span>
              <input type="range" min={22} max={58} value={Math.round(qrScale * 100)}
                onChange={(e) => setQrScale(Number(e.target.value) / 100)}
                className="w-full accent-[#ff4d1c]" aria-label="QR size" />
              <span className="block text-[12px] font-semibold mb-1.5 mt-3" style={{ color: "var(--text-muted)" }}>QR panel</span>
              <div className="flex gap-1.5">
                {PANELS.map((p) => (
                  <button key={p.id} type="button" onClick={() => setPanel(p.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                    style={{ background: panel === p.id ? "var(--primary-dim)" : "var(--surface-2)", color: panel === p.id ? "var(--primary-bright)" : "var(--text-muted)", border: `1px solid ${panel === p.id ? "var(--border-hover)" : "var(--border)"}` }}>{p.label}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={scrim} onChange={(e) => setScrim(e.target.checked)} className="accent-[#ff4d1c] w-3.5 h-3.5" />
                <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Darken bottom for contrast</span>
              </label>
            </div>
            <div>
              <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Position</span>
              <div className="grid grid-cols-3 gap-1 p-1.5 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                {SPOTS.map((s, i) => (
                  <button key={i} type="button" aria-label={`Position ${i + 1}`}
                    onClick={() => { setQrPos({ x: s.x, y: s.y }); setHeadPos(null); }}
                    className="w-6 h-6 rounded-md transition-colors"
                    style={{ background: spotActive(s) ? "var(--primary-bright)" : "var(--surface-hover)", border: "1px solid var(--border)" }} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        <div className="space-y-2.5">
          <button type="button" onClick={download} disabled={!artUrl && !qrRef.current} className="qx-btn-hero w-full disabled:opacity-40">
            <FiDownload size={15} /> Download PNG
          </button>
          <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
            <FiImage size={11} className="inline -mt-0.5 mr-1" />
            The AI background is generated free; the QR keeps error correction H so it always scans. Composited on your device — the download matches the preview exactly.
          </p>
        </div>
      </div>

      {/* ── preview: drag the QR / headline right on the canvas ── */}
      <div className="flex flex-col items-center gap-2.5 lg:sticky lg:top-24">
        <canvas ref={canvasRef} role="img" aria-label="AI QR art preview — drag the QR or headline to reposition"
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onPointerLeave={() => setHover(null)}
          style={{
            width: "100%",
            maxWidth: preset.w > preset.h ? 520 : preset.w === preset.h ? 460 : 340,
            aspectRatio: `${preset.w} / ${preset.h}`,
            borderRadius: 18, border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)", background: "var(--surface)",
            touchAction: "none",
            cursor: dragRef.current.target ? "grabbing" : hover ? "grab" : "default",
          }} />
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <FiMove size={11} /> Drag the QR or the headline to reposition
        </span>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="qx-mono text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)" }}>{n}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
