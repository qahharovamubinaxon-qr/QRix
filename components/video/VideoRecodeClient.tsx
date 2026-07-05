"use client";

/* Config-driven client for every recode-based tool:
   trim · cut · compress · optimizer · convert · resize · resolution ·
   crop · rotate · flip · speed · mute · watermark · merge · split */

import { useCallback, useRef, useState } from "react";
import { FiZap, FiX, FiArrowUp, FiArrowDown, FiPlus } from "react-icons/fi";
import { AiDropzone, AiResultBar, CloudNotice } from "@/components/ai/AiKit";
import { VideoPlayer, Timeline, loadVideoFile, recodeVideo, fmtTime, type VideoMeta, type RecodeOpts } from "@/components/video/VideoCore";
import { trackTool } from "@/lib/track";

export type RecodePreset =
  | "trim" | "cut" | "compress" | "optimizer" | "convert" | "resize"
  | "resolution" | "crop" | "rotate" | "flip" | "speed" | "mute"
  | "watermark" | "merge" | "split";

const RES_PRESETS = [
  { label: "480p", h: 480 }, { label: "720p HD", h: 720 },
  { label: "1080p Full HD", h: 1080 }, { label: "4K UHD", h: 2160 },
];
const SIZE_PRESETS = [
  { label: "Story 9:16", w: 1080, h: 1920 }, { label: "Square 1:1", w: 1080, h: 1080 },
  { label: "Landscape 16:9", w: 1920, h: 1080 },
];
const QUALITY = [
  { label: "Light", bps: 8_000_000, hint: "visually lossless" },
  { label: "Balanced", bps: 3_000_000, hint: "~70% smaller" },
  { label: "Strong", bps: 1_200_000, hint: "chat-app size" },
];

export default function VideoRecodeClient({ preset }: { preset: RecodePreset }) {
  const [queue, setQueue] = useState<VideoMeta[]>([]);
  const [time, setTime] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ blob: Blob; url: string; label: string }[]>([]);
  const [err, setErr] = useState("");

  // per-preset settings
  const [quality, setQuality] = useState(1);
  const [resIdx, setResIdx] = useState(2);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(90);
  const [flipH, setFlipH] = useState(true);
  const [flipV, setFlipV] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [wmText, setWmText] = useState("© QRix");
  const [wmPos, setWmPos] = useState<"tl" | "tr" | "bl" | "br">("br");
  const [wmOpacity, setWmOpacity] = useState(0.75);
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const cropDrag = useRef<string | null>(null);

  const multi = preset === "merge";
  const usesRange = preset === "trim" || preset === "cut" || preset === "split";
  const meta = queue[0];

  const onFile = useCallback(async (f: File) => {
    setErr("");
    try {
      const m = await loadVideoFile(f);
      setQueue((q) => (multi ? [...q, m] : [m]));
      setRange([0, m.duration]);
      setTime(0);
      trackTool(`video-${preset}`, { size: f.size });
    } catch {
      setErr("This file can't be decoded as video in your browser.");
    }
  }, [multi, preset]);

  function buildOpts(): RecodeOpts {
    const o: RecodeOpts = {
      onProgress: (d, t) => setProgress(Math.min(0.99, t ? d / t : 0)),
      videoBitsPerSecond: 6_000_000,
    };
    switch (preset) {
      case "trim": o.range = range; break;
      case "cut": o.range = range; o.cutOut = true; break;
      case "compress": case "optimizer": case "convert":
        o.videoBitsPerSecond = preset === "convert" ? 6_000_000 : QUALITY[quality].bps; break;
      case "resolution": {
        const h = RES_PRESETS[resIdx].h;
        const w = Math.round((meta.width / meta.height) * h);
        o.outW = w - (w % 2); o.outH = h; break;
      }
      case "resize": o.outW = SIZE_PRESETS[sizeIdx].w; o.outH = SIZE_PRESETS[sizeIdx].h; break;
      case "crop": o.crop = crop; break;
      case "rotate": o.rotate = rotate; break;
      case "flip": o.flipH = flipH; o.flipV = flipV; break;
      case "speed": o.speed = speed; break;
      case "mute": o.mute = true; break;
      case "watermark": o.watermark = { text: wmText, pos: wmPos, opacity: wmOpacity, size: 40 }; break;
    }
    return o;
  }

  async function run() {
    if (!meta) return;
    setBusy(true); setProgress(0); setErr("");
    setResults([]);
    try {
      if (preset === "split") {
        const t = Math.max(0.2, Math.min(time, meta.duration - 0.2));
        const a = await recodeVideo([meta], { ...buildOpts(), range: [0, t] });
        setProgress(0.5);
        const b = await recodeVideo([meta], { ...buildOpts(), range: [t, meta.duration] });
        setResults([
          { blob: a, url: URL.createObjectURL(a), label: `Part 1 (0:00–${fmtTime(t)})` },
          { blob: b, url: URL.createObjectURL(b), label: `Part 2 (${fmtTime(t)}–${fmtTime(meta.duration)})` },
        ]);
      } else {
        const blob = await recodeVideo(multi ? queue : [meta], buildOpts());
        setResults([{ blob, url: URL.createObjectURL(blob), label: "Result" }]);
      }
      setProgress(1);
    } catch (e) {
      setErr((e as Error).message || "Processing failed — try a shorter clip.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    queue.forEach((m) => URL.revokeObjectURL(m.url));
    setQueue([]); setResults([]); setProgress(0); setErr("");
  }

  /* crop-box dragging on the preview */
  function cropPointer(e: React.PointerEvent<HTMLDivElement>, kind: string) {
    e.stopPropagation();
    cropDrag.current = kind;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function cropMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!cropDrag.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - r.left) / r.width, ry = (e.clientY - r.top) / r.height;
    setCrop((c) => {
      if (cropDrag.current === "move") {
        const nx = Math.max(0, Math.min(1 - c.w, rx - c.w / 2));
        const ny = Math.max(0, Math.min(1 - c.h, ry - c.h / 2));
        return { ...c, x: nx, y: ny };
      }
      const nw = Math.max(0.15, Math.min(1 - c.x, rx - c.x));
      const nh = Math.max(0.15, Math.min(1 - c.y, ry - c.y));
      return { ...c, w: nw, h: nh };
    });
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {err && <p className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>{err}</p>}

      {(!meta || multi) && (
        <AiDropzone onFile={onFile} accept="video/*" hint={multi ? "Add clips one by one — MP4, WebM, MOV" : "MP4, WebM, MOV · processed on your device"} />
      )}

      {/* merge queue */}
      {multi && queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((m, i) => (
            <div key={m.url} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <span className="text-[11px] font-black w-5 text-center" style={{ color: "var(--primary-bright)" }}>{i + 1}</span>
              <span className="text-[13px] font-semibold truncate flex-1" style={{ color: "var(--text)" }}>{m.name}</span>
              <span className="text-[11px] font-mono" style={{ color: "var(--text-faint)" }}>{fmtTime(m.duration)}</span>
              <button disabled={i === 0} onClick={() => setQueue((q) => { const c = [...q]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; })} className="qx-btn-ghost !p-1.5 disabled:opacity-25" aria-label="Move up"><FiArrowUp size={12} /></button>
              <button disabled={i === queue.length - 1} onClick={() => setQueue((q) => { const c = [...q]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; return c; })} className="qx-btn-ghost !p-1.5 disabled:opacity-25" aria-label="Move down"><FiArrowDown size={12} /></button>
              <button onClick={() => setQueue((q) => q.filter((_, k) => k !== i))} className="qx-btn-ghost !p-1.5" aria-label="Remove"><FiX size={12} /></button>
            </div>
          ))}
          <p className="text-[11px]" style={{ color: "var(--text-faint)" }}><FiPlus size={10} style={{ display: "inline" }} /> Drop more clips above to extend the sequence.</p>
        </div>
      )}

      {meta && !results.length && (
        <>
          {/* player + crop overlay */}
          <div className="relative">
            <VideoPlayer meta={meta} time={time} onTime={setTime} />
            {preset === "crop" && (
              <div className="absolute inset-0" onPointerMove={cropMove} onPointerUp={() => { cropDrag.current = null; }}>
                <div className="absolute rounded-lg cursor-move"
                  style={{
                    left: `${crop.x * 100}%`, top: `${crop.y * 100}%`,
                    width: `${crop.w * 100}%`, height: `${crop.h * 100}%`,
                    border: "2px solid var(--primary-bright)",
                    boxShadow: "0 0 0 9999px rgba(5,5,10,.55)",
                  }}
                  onPointerDown={(e) => cropPointer(e as never, "move")}>
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full cursor-nwse-resize"
                    style={{ background: "var(--primary-bright)" }}
                    onPointerDown={(e) => cropPointer(e as never, "se")} />
                </div>
              </div>
            )}
          </div>

          {/* timeline */}
          <Timeline
            meta={meta} time={time} onSeek={setTime}
            range={usesRange && preset !== "split" ? range : undefined}
            onRange={usesRange && preset !== "split" ? setRange : undefined}
          />
          {preset === "split" && (
            <p className="text-[12px] -mt-2" style={{ color: "var(--text-muted)" }}>
              ✂️ Split point: <b style={{ color: "var(--primary-bright)" }}>{fmtTime(time)}</b> — seek the playhead to where the video should divide.
            </p>
          )}
          {preset === "cut" && (
            <p className="text-[12px] -mt-2" style={{ color: "var(--text-muted)" }}>
              The <b style={{ color: "var(--danger)" }}>marked section will be removed</b>; the parts around it are joined.
            </p>
          )}

          {/* settings per preset */}
          <div className="flex flex-wrap items-center gap-4">
            {(preset === "compress" || preset === "optimizer") && (
              <div className="flex gap-2">
                {QUALITY.map((q, i) => (
                  <button key={q.label} onClick={() => setQuality(i)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-left"
                    style={{ background: quality === i ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${quality === i ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
                    {q.label}<span className="block text-[10px] font-medium" style={{ color: "var(--text-faint)" }}>{q.hint}</span>
                  </button>
                ))}
              </div>
            )}
            {preset === "resolution" && (
              <div className="flex gap-2 flex-wrap">
                {RES_PRESETS.map((r, i) => (
                  <button key={r.label} onClick={() => setResIdx(i)} className="px-3.5 py-2 rounded-xl text-[12px] font-bold"
                    style={{ background: resIdx === i ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${resIdx === i ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
            {preset === "resize" && (
              <div className="flex gap-2 flex-wrap">
                {SIZE_PRESETS.map((s, i) => (
                  <button key={s.label} onClick={() => setSizeIdx(i)} className="px-3.5 py-2 rounded-xl text-[12px] font-bold"
                    style={{ background: sizeIdx === i ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${sizeIdx === i ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
                    {s.label}<span className="block text-[10px] font-medium" style={{ color: "var(--text-faint)" }}>{s.w}×{s.h}</span>
                  </button>
                ))}
              </div>
            )}
            {preset === "rotate" && (
              <div className="flex gap-2">
                {([90, 180, 270] as const).map((d) => (
                  <button key={d} onClick={() => setRotate(d)} className="px-4 py-2 rounded-xl text-[12px] font-bold"
                    style={{ background: rotate === d ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${rotate === d ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
                    {d}°
                  </button>
                ))}
              </div>
            )}
            {preset === "flip" && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
                  <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} className="accent-[#e1ff04] w-4 h-4" /> Mirror horizontally
                </label>
                <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
                  <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} className="accent-[#e1ff04] w-4 h-4" /> Flip vertically
                </label>
              </div>
            )}
            {preset === "speed" && (
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Speed</span>
                {[0.25, 0.5, 1.5, 2, 3, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={{ background: speed === s ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${speed === s ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
                    {s}×
                  </button>
                ))}
              </div>
            )}
            {preset === "watermark" && (
              <div className="flex flex-wrap items-center gap-3">
                <input value={wmText} onChange={(e) => setWmText(e.target.value.slice(0, 40))} className="qx-auth-input !py-2 w-48" placeholder="Watermark text" />
                <select value={wmPos} onChange={(e) => setWmPos(e.target.value as never)} className="qx-auth-input !py-2 w-36" aria-label="Position">
                  <option value="tl">Top left</option><option value="tr">Top right</option>
                  <option value="bl">Bottom left</option><option value="br">Bottom right</option>
                </select>
                <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>
                  Opacity <input type="range" min={20} max={100} value={wmOpacity * 100} onChange={(e) => setWmOpacity(Number(e.target.value) / 100)} className="w-28 accent-[#e1ff04]" />
                </label>
              </div>
            )}
          </div>

          {/* process */}
          {busy ? (
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} role="status" aria-live="polite">
              <div className="flex items-center gap-3 mb-3">
                <FiZap size={18} className="animate-pulse" style={{ color: "var(--primary-bright)" }} />
                <span className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>
                  Rendering on your device… {(progress * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "var(--grad-primary)" }} />
              </div>
              <p className="text-[11px] mt-2.5" style={{ color: "var(--text-faint)" }}>The video plays through the encoder in the background — keep this tab focused for full speed.</p>
            </div>
          ) : (
            <button onClick={run} disabled={multi && queue.length < 2} className="qx-btn-hero !py-3 !px-7 text-sm disabled:opacity-45" data-magnetic>
              <FiZap size={15} /> {multi ? `Merge ${queue.length} clips` : "Process video"}
            </button>
          )}
        </>
      )}

      {/* results */}
      {results.length > 0 && (
        <div className="space-y-5">
          {results.map((r, i) => (
            <div key={i} className="space-y-3">
              {results.length > 1 && <div className="text-[12px] font-bold" style={{ color: "var(--primary-bright)" }}>{r.label}</div>}
              <video src={r.url} controls playsInline className="w-full max-h-[380px] rounded-2xl" style={{ background: "#000", border: "1px solid var(--border)" }} />
              <AiResultBar blob={r.blob} filename={`qrix-${preset}${results.length > 1 ? `-part${i + 1}` : ""}.webm`} onReset={reset} />
            </div>
          ))}
        </div>
      )}

      {preset === "convert" && <CloudNotice>Output is WebM — the modern web standard that plays everywhere current. MP4/H.264 export needs a licensed encoder and is pre-wired through the QRix cloud connector.</CloudNotice>}
    </div>
  );
}
