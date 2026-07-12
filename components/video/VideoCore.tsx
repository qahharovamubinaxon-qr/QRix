"use client";

/* ============================================================
   VideoCore — shared machinery for every video tool.

   • loadVideoFile(file) → <video> element + metadata
   • <VideoPlayer>  native-quality player w/ speed & fullscreen
   • <Timeline>     frame-thumbnail strip, playhead, optional
                    dual trim handles (start/end)
   • recodeVideo()  the on-device pipeline: video → canvas
                    (crop/rotate/flip/scale/watermark) + audio
                    (AudioContext mix) → MediaRecorder → WebM.
                    Powers 15+ tools. onProgress callback.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { FiPlay, FiPause, FiMaximize2 } from "react-icons/fi";

export type VideoMeta = {
  el: HTMLVideoElement;
  url: string;
  width: number;
  height: number;
  duration: number;
  size: number;
  name: string;
  type: string;
};

export async function loadVideoFile(file: File): Promise<VideoMeta> {
  const url = URL.createObjectURL(file);
  const el = document.createElement("video");
  el.src = url;
  el.preload = "auto";
  el.playsInline = true;
  await new Promise<void>((res, rej) => {
    el.onloadedmetadata = () => res();
    el.onerror = () => rej(new Error("Cannot decode this video"));
  });
  return {
    el, url,
    width: el.videoWidth, height: el.videoHeight,
    duration: el.duration, size: file.size,
    name: file.name, type: file.type || "video/*",
  };
}

export function fmtTime(t: number): string {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ── Player ───────────────────────────────────────────────── */
export function VideoPlayer({ meta, time, onTime }: {
  meta: VideoMeta;
  time?: number;
  onTime?: (t: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.src = meta.url;
  }, [meta.url]);

  useEffect(() => {
    const v = ref.current;
    if (v && time !== undefined && Math.abs(v.currentTime - time) > 0.25 && !playing) v.currentTime = time;
  }, [time, playing]);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "#000", border: "1px solid var(--border)" }}>
      <video
        ref={ref}
        className="w-full max-h-[420px] block"
        playsInline
        onTimeUpdate={(e) => onTime?.(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={() => { const v = ref.current!; if (v.paused) v.play(); else v.pause(); }}
      />
      <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 px-4 py-2.5"
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,.75))" }}>
        <button onClick={() => { const v = ref.current!; if (v.paused) v.play(); else v.pause(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}
          aria-label={playing ? "Pause" : "Play"}>
          {playing ? <FiPause size={15} /> : <FiPlay size={15} style={{ marginLeft: 2 }} />}
        </button>
        <span className="text-[11.5px] font-mono" style={{ color: "#fff" }}>
          {fmtTime(time ?? 0)} / {fmtTime(meta.duration)}
        </span>
        <span className="text-[10.5px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>
          {meta.width}×{meta.height}
        </span>
        <span className="flex-1" />
        <select value={rate} onChange={(e) => { const r = Number(e.target.value); setRate(r); if (ref.current) ref.current.playbackRate = r; }}
          className="text-[11px] font-bold rounded-lg px-1.5 py-1 outline-none"
          style={{ background: "rgba(255,255,255,.14)", color: "#fff", border: "none" }} aria-label="Playback speed">
          {[0.5, 1, 1.5, 2].map((r) => <option key={r} value={r} style={{ color: "#000" }}>{r}×</option>)}
        </select>
        <button onClick={() => ref.current?.requestFullscreen?.()} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} aria-label="Fullscreen">
          <FiMaximize2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Timeline with thumbnails + optional trim handles ─────── */
export function Timeline({ meta, time, onSeek, range, onRange }: {
  meta: VideoMeta;
  time: number;
  onSeek: (t: number) => void;
  range?: [number, number];
  onRange?: (r: [number, number]) => void;
}) {
  const [thumbs, setThumbs] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | "seek" | null>(null);

  // build an 8-frame thumbnail strip once per file
  useEffect(() => {
    let dead = false;
    (async () => {
      const v = document.createElement("video");
      v.src = meta.url; v.muted = true; v.playsInline = true;
      await new Promise((r) => { v.onloadedmetadata = r; });
      const N = 8;
      const c = document.createElement("canvas");
      const th = 54;
      const tw = Math.max(24, Math.round((meta.width / meta.height) * th));
      c.width = tw; c.height = th;
      const ctx = c.getContext("2d")!;
      const out: string[] = [];
      for (let i = 0; i < N; i++) {
        v.currentTime = ((i + 0.5) / N) * meta.duration;
        await new Promise((r) => { v.onseeked = r; });
        if (dead) return;
        ctx.drawImage(v, 0, 0, tw, th);
        out.push(c.toDataURL("image/jpeg", 0.5));
      }
      if (!dead) setThumbs(out);
    })().catch(() => {});
    return () => { dead = true; };
  }, [meta.url, meta.duration, meta.width, meta.height]);

  const posToTime = useCallback((clientX: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * meta.duration;
  }, [meta.duration]);

  function onPointerDown(e: React.PointerEvent) {
    const t = posToTime(e.clientX);
    if (range && onRange) {
      const dStart = Math.abs(t - range[0]), dEnd = Math.abs(t - range[1]);
      if (Math.min(dStart, dEnd) < meta.duration * 0.06) {
        dragging.current = dStart < dEnd ? "start" : "end";
        return;
      }
    }
    dragging.current = "seek";
    onSeek(t);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const t = posToTime(e.clientX);
    if (dragging.current === "seek") onSeek(t);
    else if (range && onRange) {
      if (dragging.current === "start") onRange([Math.min(t, range[1] - 0.1), range[1]]);
      else onRange([range[0], Math.max(t, range[0] + 0.1)]);
    }
  }

  const pct = (t: number) => `${(t / meta.duration) * 100}%`;

  return (
    <div>
      <div ref={wrapRef}
        className="relative h-[54px] rounded-xl overflow-hidden select-none touch-none"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { dragging.current = null; }}
        onPointerLeave={() => { dragging.current = null; }}
      >
        <div className="absolute inset-0 flex">
          {thumbs.map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={t} alt="" className="h-full flex-1 object-cover" draggable={false} />
          ))}
        </div>
        {range && (
          <>
            {/* dimmed outside the range */}
            <div className="absolute inset-y-0 left-0" style={{ width: pct(range[0]), background: "rgba(5,5,10,.68)" }} />
            <div className="absolute inset-y-0 right-0" style={{ width: `calc(100% - ${pct(range[1])})`, background: "rgba(5,5,10,.68)" }} />
            {/* handles */}
            <div className="absolute inset-y-0 w-[10px] -translate-x-1/2 rounded cursor-ew-resize" style={{ left: pct(range[0]), background: "var(--primary-bright)", boxShadow: "0 0 10px var(--primary-bright)" }} />
            <div className="absolute inset-y-0 w-[10px] -translate-x-1/2 rounded cursor-ew-resize" style={{ left: pct(range[1]), background: "var(--primary-bright)", boxShadow: "0 0 10px var(--primary-bright)" }} />
          </>
        )}
        {/* playhead */}
        <div className="absolute inset-y-0 w-[2px] -translate-x-1/2 pointer-events-none" style={{ left: pct(time), background: "#fff", boxShadow: "0 0 8px rgba(255,255,255,.9)" }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] font-mono" style={{ color: "var(--text-faint)" }}>
        <span>{range ? `In ${fmtTime(range[0])}` : "0:00"}</span>
        <span style={{ color: "var(--text-muted)" }}>{fmtTime(time)}</span>
        <span>{range ? `Out ${fmtTime(range[1])}` : fmtTime(meta.duration)}</span>
      </div>
    </div>
  );
}

/* ── recode pipeline ──────────────────────────────────────── */
export type RecodeOpts = {
  /** [startSec, endSec] segment to keep; for "cut", the segment to REMOVE */
  range?: [number, number];
  cutOut?: boolean;
  speed?: number;
  mute?: boolean;
  videoBitsPerSecond?: number;
  rotate?: 0 | 90 | 180 | 270;
  flipH?: boolean;
  flipV?: boolean;
  /** relative crop 0..1 */
  crop?: { x: number; y: number; w: number; h: number };
  /** output size; defaults to source (after rotate/crop) */
  outW?: number;
  outH?: number;
  watermark?: { text: string; pos: "tl" | "tr" | "bl" | "br"; opacity: number; size: number };
  onProgress?: (done: number, total: number) => void;
};

async function playSegmentThroughCanvas(
  el: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  o: RecodeOpts,
  seg: [number, number],
  progressBase: number, progressSpan: number, totalDur: number
) {
  const rot = o.rotate ?? 0;
  const swap = rot === 90 || rot === 270;
  const sw = el.videoWidth, sh = el.videoHeight;
  const cr = o.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = cr.x * sw, sy = cr.y * sh, scw = cr.w * sw, sch = cr.h * sh;

  el.currentTime = seg[0];
  await new Promise((r) => { el.onseeked = r; });
  el.playbackRate = o.speed ?? 1;
  await el.play();

  return new Promise<void>((resolve) => {
    let raf = 0;
    const draw = () => {
      if (el.currentTime >= seg[1] || el.ended) {
        el.pause();
        cancelAnimationFrame(raf);
        resolve();
        return;
      }
      ctx.save();
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.translate(W / 2, H / 2);
      if (rot) ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(o.flipH ? -1 : 1, o.flipV ? -1 : 1);
      const dw = swap ? H : W, dh = swap ? W : H;
      // fit cropped source into destination preserving aspect
      const s = Math.min(dw / scw, dh / sch);
      const rw = scw * s, rh = sch * s;
      ctx.drawImage(el, sx, sy, scw, sch, -rw / 2, -rh / 2, rw, rh);
      ctx.restore();
      if (o.watermark?.text) {
        const { text, pos, opacity, size } = o.watermark;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = `800 ${Math.round((size / 100) * H * 0.08 + H * 0.02)}px SUSE, sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "rgba(0,0,0,.6)";
        ctx.lineWidth = 3;
        const pad = H * 0.04;
        const tw = ctx.measureText(text).width;
        const x = pos.endsWith("l") ? pad : W - tw - pad;
        const y = pos.startsWith("t") ? pad + H * 0.06 : H - pad;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.restore();
      }
      o.onProgress?.(progressBase + (el.currentTime - seg[0]), totalDur);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
  });
}

/**
 * Re-encode one or more videos through a canvas+audio pipeline into WebM.
 * Files play sequentially (merge). Returns the encoded Blob.
 */
export async function recodeVideo(metas: VideoMeta[], o: RecodeOpts = {}): Promise<Blob> {
  const first = metas[0];
  const rot = o.rotate ?? 0;
  const swap = rot === 90 || rot === 270;
  const cr = o.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const baseW = Math.round(first.width * cr.w), baseH = Math.round(first.height * cr.h);
  const W = o.outW ?? (swap ? baseH : baseW);
  const H = o.outH ?? (swap ? baseW : baseH);

  const canvas = document.createElement("canvas");
  canvas.width = W - (W % 2); canvas.height = H - (H % 2);
  const ctx = canvas.getContext("2d")!;

  const fps = 30;
  const stream = canvas.captureStream(fps);

  // audio: route every element through one AudioContext destination
  let audioCtx: AudioContext | null = null;
  if (!o.mute) {
    audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    for (const m of metas) {
      const src = audioCtx.createMediaElementSource(m.el);
      src.connect(dest);
    }
    const track = dest.stream.getAudioTracks()[0];
    if (track) stream.addTrack(track);
  } else {
    metas.forEach((m) => { m.el.muted = true; });
  }

  // Prefer real MP4/H.264 (Chrome 130+, Edge, Safari); fall back to WebM.
  const cand = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4",
    "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm",
  ];
  const mime = cand.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
  const outType = mime.startsWith("video/mp4") ? "video/mp4" : "video/webm";
  const rec = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: o.videoBitsPerSecond ?? 6_000_000,
  });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const done = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: outType })); });
  rec.start(250);

  // build the segment plan
  type Seg = { meta: VideoMeta; seg: [number, number] };
  const plan: Seg[] = [];
  if (metas.length > 1) {
    for (const m of metas) plan.push({ meta: m, seg: [0, m.duration] });
  } else if (o.cutOut && o.range) {
    if (o.range[0] > 0.05) plan.push({ meta: first, seg: [0, o.range[0]] });
    if (o.range[1] < first.duration - 0.05) plan.push({ meta: first, seg: [o.range[1], first.duration] });
  } else {
    plan.push({ meta: first, seg: o.range ?? [0, first.duration] });
  }
  const totalDur = plan.reduce((s, p) => s + (p.seg[1] - p.seg[0]), 0) / (o.speed ?? 1);

  let base = 0;
  for (const p of plan) {
    await playSegmentThroughCanvas(p.meta.el, ctx, canvas.width, canvas.height, o, p.seg, base, 0, totalDur * (o.speed ?? 1));
    base += p.seg[1] - p.seg[0];
  }

  rec.stop();
  const blob = await done;
  if (audioCtx) await audioCtx.close().catch(() => {});
  return blob;
}
