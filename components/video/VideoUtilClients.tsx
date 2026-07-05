"use client";

/* Frame & info engines: Metadata Viewer, Thumbnail/Screenshot capture,
   Extract Frames (ZIP), plus the short-clip Reverse preview. */

import { useState } from "react";
import { FiDownload, FiCopy, FiCheck, FiCamera, FiZap } from "react-icons/fi";
import { AiDropzone, AiResultBar, CloudNotice, AiProcessing } from "@/components/ai/AiKit";
import { VideoPlayer, Timeline, loadVideoFile, fmtTime, type VideoMeta } from "@/components/video/VideoCore";
import { trackTool } from "@/lib/track";

function human(bytes: number): string {
  if (bytes > 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

/* ── Metadata Viewer ──────────────────────────────────────── */
export function VideoMetaClient() {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [copied, setCopied] = useState(false);

  async function onFile(f: File) {
    trackTool("video-meta");
    setMeta(await loadVideoFile(f));
  }

  if (!meta) return <div className="qx-card p-6"><AiDropzone onFile={onFile} accept="video/*" hint="Any video file — read locally, never uploaded" /></div>;

  const g = gcd(meta.width, meta.height);
  const rows: [string, string][] = [
    ["File name", meta.name],
    ["Container", meta.type || "unknown"],
    ["Resolution", `${meta.width} × ${meta.height}`],
    ["Aspect ratio", `${meta.width / g}:${meta.height / g}`],
    ["Duration", `${fmtTime(meta.duration)} (${meta.duration.toFixed(2)}s)`],
    ["File size", human(meta.size)],
    ["Average bitrate", `${((meta.size * 8) / meta.duration / 1e6).toFixed(2)} Mbps`],
    ["Est. class", meta.height >= 2160 ? "4K UHD" : meta.height >= 1080 ? "Full HD" : meta.height >= 720 ? "HD" : "SD"],
  ];
  const report = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  return (
    <div className="qx-card p-6 space-y-5">
      <VideoPlayer meta={meta} />
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{k}</span>
            <span className="text-[13px] font-semibold text-right truncate" style={{ color: "var(--text)" }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={async () => { await navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 1400); }} className="qx-btn !py-2 text-xs">
          {copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy report
        </button>
        <button onClick={() => setMeta(null)} className="qx-btn-ghost !py-2 text-xs">New file</button>
      </div>
    </div>
  );
}

/* ── Thumbnail / Screenshot capture ───────────────────────── */
export function VideoThumbClient() {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [time, setTime] = useState(0);
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null);

  async function onFile(f: File) {
    trackTool("video-thumb");
    const m = await loadVideoFile(f);
    setMeta(m); setTime(Math.min(1, m.duration / 2)); setShot(null);
  }

  async function capture(type: "image/png" | "image/jpeg") {
    if (!meta) return;
    meta.el.currentTime = time;
    await new Promise((r) => { meta.el.onseeked = r; });
    const c = document.createElement("canvas");
    c.width = meta.width; c.height = meta.height;
    c.getContext("2d")!.drawImage(meta.el, 0, 0);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, type, 0.92));
    if (blob) setShot((old) => { if (old) URL.revokeObjectURL(old.url); return { blob, url: URL.createObjectURL(blob) }; });
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {!meta && <AiDropzone onFile={onFile} accept="video/*" hint="Scrub to any frame, capture at native resolution" />}
      {meta && (
        <>
          <VideoPlayer meta={meta} time={time} onTime={setTime} />
          <Timeline meta={meta} time={time} onSeek={setTime} />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => capture("image/png")} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiCamera size={14} /> Capture PNG</button>
            <button onClick={() => capture("image/jpeg")} className="qx-btn !py-2.5 text-sm"><FiCamera size={14} /> Capture JPG</button>
          </div>
          {shot && (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.url} alt="Captured frame" className="w-full rounded-2xl" style={{ border: "1px solid var(--border)" }} />
              <AiResultBar blob={shot.blob} filename={`frame-${fmtTime(time).replace(":", "-")}.png`} onReset={() => { setMeta(null); setShot(null); }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Extract Frames → ZIP ─────────────────────────────────── */
export function VideoFramesClient() {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [count, setCount] = useState(12);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);

  async function onFile(f: File) {
    trackTool("video-frames");
    setMeta(await loadVideoFile(f));
  }

  async function extract() {
    if (!meta) return;
    setBusy(true); setDone(0);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const c = document.createElement("canvas");
      c.width = meta.width; c.height = meta.height;
      const ctx = c.getContext("2d")!;
      for (let i = 0; i < count; i++) {
        meta.el.currentTime = ((i + 0.5) / count) * meta.duration;
        await new Promise((r) => { meta.el.onseeked = r; });
        ctx.drawImage(meta.el, 0, 0);
        const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
        if (blob) zip.file(`frame-${String(i + 1).padStart(3, "0")}.png`, blob);
        setDone(i + 1);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const { saveBlob } = await import("@/lib/save-file");
      await saveBlob(zipBlob, `frames-${count}.zip`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {!meta && <AiDropzone onFile={onFile} accept="video/*" hint="Evenly-sampled frames, zipped as numbered PNGs" />}
      {meta && (
        <>
          <VideoPlayer meta={meta} />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Frames: {count}</span>
              <input type="range" min={4} max={60} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-44 accent-[#e1ff04]" />
            </label>
            <button onClick={extract} disabled={busy} className="qx-btn-hero !py-2.5 !px-5 text-sm disabled:opacity-50" data-magnetic>
              <FiDownload size={14} /> {busy ? `Extracting ${done}/${count}…` : "Extract & download ZIP"}
            </button>
            <button onClick={() => setMeta(null)} className="qx-btn-ghost !py-2.5 text-sm">New file</button>
          </div>
          {busy && (
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(done / count) * 100}%`, background: "var(--grad-primary)" }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Reverse (short-clip frame buffer) ────────────────────── */
export function VideoReverseClient() {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [err, setErr] = useState("");

  async function onFile(f: File) {
    trackTool("video-reverse");
    setErr("");
    const m = await loadVideoFile(f);
    if (m.duration > 15.5) { setErr("Clips up to 15 seconds reverse on-device — longer files arrive with the cloud engine."); return; }
    setMeta(m);
  }

  async function run() {
    if (!meta) return;
    setBusy(true);
    try {
      // buffer frames at 15fps, then re-record them backwards
      const fps = 15;
      const total = Math.floor(meta.duration * fps);
      const scale = Math.min(1, 960 / meta.width);
      const W = Math.round(meta.width * scale) & ~1, H = Math.round(meta.height * scale) & ~1;
      const frames: ImageBitmap[] = [];
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      for (let i = 0; i < total; i++) {
        meta.el.currentTime = (i / fps);
        await new Promise((r) => { meta.el.onseeked = r; });
        ctx.drawImage(meta.el, 0, 0, W, H);
        frames.push(await createImageBitmap(c));
      }
      const stream = c.captureStream(0);
      const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
      const rec = new MediaRecorder(stream, { mimeType: "video/webm", videoBitsPerSecond: 4_000_000 });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: "video/webm" })); });
      rec.start(250);
      for (let i = frames.length - 1; i >= 0; i--) {
        ctx.drawImage(frames[i], 0, 0);
        track.requestFrame?.();
        await new Promise((r) => setTimeout(r, 1000 / fps));
        frames[i].close();
      }
      rec.stop();
      const blob = await stopped;
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      setErr((e as Error).message || "Reversal failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 space-y-5">
      <CloudNotice>Short clips (≤15s) reverse on-device with the frame buffer below — silent output. Full-length reversal with audio is wired through the QRix cloud connector.</CloudNotice>
      {err && <p className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>{err}</p>}
      {!meta && !result && <AiDropzone onFile={onFile} accept="video/*" hint="Clips up to 15 seconds" />}
      {meta && !result && (busy ? <AiProcessing label="Buffering frames and reversing…" /> : (
        <>
          <VideoPlayer meta={meta} />
          <button onClick={run} className="qx-btn-hero !py-2.5 !px-6 text-sm" data-magnetic><FiZap size={15} /> Reverse clip</button>
        </>
      ))}
      {result && (
        <>
          <video src={result.url} controls playsInline className="w-full max-h-[380px] rounded-2xl" style={{ background: "#000", border: "1px solid var(--border)" }} />
          <AiResultBar blob={result.blob} filename="reversed.webm" onReset={() => { setMeta(null); setResult(null); }} />
        </>
      )}
    </div>
  );
}
