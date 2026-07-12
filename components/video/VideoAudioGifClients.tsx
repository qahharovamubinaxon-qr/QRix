"use client";

/* Audio & GIF engines: Extract Audio (WAV), MP3→MP4 waveform video,
   Add Audio to video, Video→GIF (gifenc), GIF→Video (ImageDecoder). */

import { useState } from "react";
import { FiDownload, FiZap, FiMusic } from "react-icons/fi";
import { AiDropzone, AiResultBar, AiProcessing, CloudNotice } from "@/components/ai/AiKit";
import { VideoPlayer, Timeline, loadVideoFile, type VideoMeta } from "@/components/video/VideoCore";
import { trackTool } from "@/lib/track";

/* ── Recorder codec picker ────────────────────────────────────
   Prefer real MP4/H.264 (Chrome 130+, Edge, Safari) so tools named
   "…→MP4" actually deliver MP4; fall back to WebM elsewhere. Extension
   always matches the container the browser produced. */
function pickVideoMime(): { mimeType: string; ext: "mp4" | "webm" } {
  const supported = (m: string) =>
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m);
  const mp4 = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4"];
  for (const m of mp4) if (supported(m)) return { mimeType: m, ext: "mp4" };
  const webm = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  for (const m of webm) if (supported(m)) return { mimeType: m, ext: "webm" };
  return { mimeType: "video/webm", ext: "webm" };
}

/* ── WAV encoding helper ──────────────────────────────────── */
function audioBufferToWav(buf: AudioBuffer): Blob {
  const ch = Math.min(2, buf.numberOfChannels), sr = buf.sampleRate, len = buf.length;
  const bytes = 44 + len * ch * 2;
  const ab = new ArrayBuffer(bytes);
  const v = new DataView(ab);
  const wstr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  wstr(0, "RIFF"); v.setUint32(4, bytes - 8, true); wstr(8, "WAVE");
  wstr(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, ch, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  wstr(36, "data"); v.setUint32(40, len * ch * 2, true);
  let off = 44;
  const chans = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

/* ── Extract Audio / MP4→MP3 ──────────────────────────────── */
export function AudioExtractClient() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [err, setErr] = useState("");

  async function onFile(f: File) {
    trackTool("video-audio-extract", { size: f.size });
    setBusy(true); setErr(""); setResult(null);
    try {
      const ac = new AudioContext();
      const buf = await ac.decodeAudioData(await f.arrayBuffer());
      const blob = audioBufferToWav(buf);
      await ac.close();
      setResult({ blob, url: URL.createObjectURL(blob), name: f.name.replace(/\.\w+$/, "") + ".wav" });
    } catch {
      setErr("Couldn't decode an audio track from this file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {err && <p className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>{err}</p>}
      {!result && !busy && <AiDropzone onFile={onFile} accept="video/*,audio/*" hint="MP4, WebM, MOV — soundtrack out as lossless WAV" />}
      {busy && <AiProcessing label="Decoding the soundtrack…" />}
      {result && (
        <>
          <audio src={result.url} controls className="w-full" />
          <AiResultBar blob={result.blob} filename={result.name} onReset={() => setResult(null)} />
          <CloudNotice>WAV is lossless and opens everywhere. One-click MP3 encoding is wired through the QRix cloud connector.</CloudNotice>
        </>
      )}
    </div>
  );
}

/* ── MP3 → MP4 (waveform video) ───────────────────────────── */
export function Mp3ToMp4Client() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [accent, setAccent] = useState("#e1ff04");
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  async function onFile(f: File) {
    trackTool("video-mp3-to-mp4", { size: f.size });
    setBusy(true); setProgress(0);
    try {
      const url = URL.createObjectURL(f);
      const el = new Audio(url);
      await new Promise((r) => { el.onloadedmetadata = r; });

      const W = 1280, H = 720;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      const stream = c.captureStream(30);

      const ac = new AudioContext();
      const src = ac.createMediaElementSource(el);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 256;
      const dest = ac.createMediaStreamDestination();
      src.connect(analyser); analyser.connect(dest);
      const at = dest.stream.getAudioTracks()[0];
      if (at) stream.addTrack(at);

      const enc = pickVideoMime();
      const rec = new MediaRecorder(stream, { mimeType: enc.mimeType, videoBitsPerSecond: 2_500_000 });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: `video/${enc.ext}` })); });

      const bars = new Uint8Array(analyser.frequencyBinCount);
      rec.start(250);
      await el.play();
      await new Promise<void>((resolve) => {
        const draw = () => {
          if (el.ended) { resolve(); return; }
          analyser.getByteFrequencyData(bars);
          ctx.fillStyle = "#0a0a12"; ctx.fillRect(0, 0, W, H);
          const n = 48, bw = W / n * 0.62, gap = W / n;
          for (let i = 0; i < n; i++) {
            const vv = bars[Math.floor((i / n) * bars.length)] / 255;
            const bh = 30 + vv * (H * 0.55);
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.35 + vv * 0.65;
            ctx.beginPath();
            (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void })
              .roundRect(i * gap + (gap - bw) / 2, (H - bh) / 2, bw, bh, bw / 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          setProgress(el.currentTime / el.duration);
          requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
      });
      rec.stop();
      const blob = await stopped;
      await ac.close();
      URL.revokeObjectURL(url);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {!result && !busy && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Waveform color</span>
            {["#e1ff04", "#bba9ff", "#38bdf8", "#f472b6", "#34d399"].map((cl) => (
              <button key={cl} onClick={() => setAccent(cl)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                style={{ background: cl, border: accent === cl ? "2.5px solid var(--text)" : "1px solid var(--border)" }} aria-label={cl} />
            ))}
          </div>
          <AiDropzone onFile={onFile} accept="audio/*" hint="MP3, WAV or OGG — becomes a 720p waveform video" />
        </>
      )}
      {busy && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <FiMusic size={22} className="mx-auto mb-3 animate-pulse" style={{ color: "var(--primary-bright)" }} />
          <p className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>Rendering waveform video… {(progress * 100).toFixed(0)}%</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>The track plays through the encoder in real time.</p>
        </div>
      )}
      {result && (
        <>
          <video src={result.url} controls playsInline className="w-full max-h-[380px] rounded-2xl" style={{ background: "#000", border: "1px solid var(--border)" }} />
          <AiResultBar blob={result.blob} filename={`waveform-video.${result.blob.type.includes("mp4") ? "mp4" : "webm"}`} onReset={() => setResult(null)} />
        </>
      )}
    </div>
  );
}

/* ── Add Audio to Video ───────────────────────────────────── */
export function AddAudioClient() {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  async function run() {
    if (!meta || !audioFile) return;
    trackTool("video-add-audio");
    setBusy(true); setProgress(0);
    try {
      const aUrl = URL.createObjectURL(audioFile);
      const aEl = new Audio(aUrl);
      await new Promise((r) => { aEl.onloadedmetadata = r; });

      const W = meta.width & ~1, H = meta.height & ~1;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      const stream = c.captureStream(30);

      const ac = new AudioContext();
      const src = ac.createMediaElementSource(aEl);
      const dest = ac.createMediaStreamDestination();
      src.connect(dest);
      const at = dest.stream.getAudioTracks()[0];
      if (at) stream.addTrack(at);
      meta.el.muted = true;

      const enc = pickVideoMime();
      const rec = new MediaRecorder(stream, { mimeType: enc.mimeType, videoBitsPerSecond: 6_000_000 });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: `video/${enc.ext}` })); });

      meta.el.currentTime = 0;
      await new Promise((r) => { meta.el.onseeked = r; });
      rec.start(250);
      await Promise.all([meta.el.play(), aEl.play()]);
      await new Promise<void>((resolve) => {
        const draw = () => {
          if (meta.el.ended) { resolve(); return; }
          ctx.drawImage(meta.el, 0, 0, W, H);
          setProgress(meta.el.currentTime / meta.duration);
          requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
      });
      aEl.pause();
      rec.stop();
      const blob = await stopped;
      await ac.close();
      URL.revokeObjectURL(aUrl);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {!meta && <AiDropzone onFile={async (f) => setMeta(await loadVideoFile(f))} accept="video/*" hint="Step 1 — drop the video" />}
      {meta && !audioFile && (
        <>
          <VideoPlayer meta={meta} />
          <AiDropzone onFile={(f) => setAudioFile(f)} accept="audio/*" hint="Step 2 — drop the new soundtrack (MP3/WAV)" />
        </>
      )}
      {meta && audioFile && !result && (busy ? (
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[13.5px] font-bold mb-3" style={{ color: "var(--text)" }}>Mixing soundtrack… {(progress * 100).toFixed(0)}%</p>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "var(--grad-primary)" }} />
          </div>
        </div>
      ) : (
        <>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>🎬 <b style={{ color: "var(--text)" }}>{meta.name}</b> + 🎵 <b style={{ color: "var(--text)" }}>{audioFile.name}</b></p>
          <button onClick={run} className="qx-btn-hero !py-2.5 !px-6 text-sm" data-magnetic><FiZap size={15} /> Combine & export</button>
        </>
      ))}
      {result && (
        <>
          <video src={result.url} controls playsInline className="w-full max-h-[380px] rounded-2xl" style={{ background: "#000", border: "1px solid var(--border)" }} />
          <AiResultBar blob={result.blob} filename={`with-new-audio.${result.blob.type.includes("mp4") ? "mp4" : "webm"}`} onReset={() => { setMeta(null); setAudioFile(null); setResult(null); }} />
        </>
      )}
    </div>
  );
}

/* ── Video → GIF (gifenc) ─────────────────────────────────── */
export function VideoToGifClient() {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [time, setTime] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 3]);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  async function onFile(f: File) {
    trackTool("video-gif", { size: f.size });
    const m = await loadVideoFile(f);
    setMeta(m);
    setRange([0, Math.min(3, m.duration)]);
  }

  async function encode() {
    if (!meta) return;
    setBusy(true); setResult(null);
    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const dur = Math.min(15, range[1] - range[0]);
      const frames = Math.max(2, Math.floor(dur * fps));
      setTotal(frames); setDone(0);
      const W = width & ~1;
      const H = Math.round((meta.height / meta.width) * W) & ~1;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      const gif = GIFEncoder();
      for (let i = 0; i < frames; i++) {
        meta.el.currentTime = range[0] + (i / fps);
        await new Promise((r) => { meta.el.onseeked = r; });
        ctx.drawImage(meta.el, 0, 0, W, H);
        const { data } = ctx.getImageData(0, 0, W, H);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, W, H, { palette, delay: Math.round(1000 / fps) });
        setDone(i + 1);
      }
      gif.finish();
      const blob = new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" });
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {!meta && <AiDropzone onFile={onFile} accept="video/*" hint="Mark a 2–15s segment — real GIF encoder, on-device" />}
      {meta && !result && (
        <>
          <VideoPlayer meta={meta} time={time} onTime={setTime} />
          <Timeline meta={meta} time={time} onSeek={setTime} range={range} onRange={setRange} />
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>
              FPS {fps} <input type="range" min={5} max={15} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-28 accent-[#e1ff04]" />
            </label>
            <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>
              Width {width}px <input type="range" min={240} max={720} step={40} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-28 accent-[#e1ff04]" />
            </label>
            <button onClick={encode} disabled={busy} className="qx-btn-hero !py-2.5 !px-6 text-sm disabled:opacity-50" data-magnetic>
              <FiZap size={15} /> {busy ? `Encoding ${done}/${total}…` : "Encode GIF"}
            </button>
          </div>
          {busy && (
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%`, background: "var(--grad-primary)" }} />
            </div>
          )}
        </>
      )}
      {result && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Animated GIF result" className="rounded-2xl max-w-full" style={{ border: "1px solid var(--border)" }} />
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>GIF size: <b style={{ color: "var(--text)" }}>{(result.blob.size / 1e6).toFixed(2)} MB</b></p>
          <AiResultBar blob={result.blob} filename="qrix.gif" onReset={() => { setMeta(null); setResult(null); }} />
        </>
      )}
    </div>
  );
}

/* ── GIF → Video (ImageDecoder) ───────────────────────────── */
export function GifToVideoClient() {
  const [busy, setBusy] = useState(false);
  const [supported] = useState(() => typeof window === "undefined" || "ImageDecoder" in window);
  const [result, setResult] = useState<{ blob: Blob; url: string; saved: string } | null>(null);
  const [err, setErr] = useState("");

  async function onFile(f: File) {
    trackTool("video-gif-to-mp4", { size: f.size });
    setBusy(true); setErr("");
    try {
      const dec = new ImageDecoder({ data: await f.arrayBuffer(), type: f.type || "image/gif" });
      await dec.tracks.ready;
      const track = dec.tracks.selectedTrack;
      const count = track?.frameCount ?? 1;
      const first = await dec.decode({ frameIndex: 0 });
      const W = first.image.displayWidth & ~1, H = first.image.displayHeight & ~1;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      const stream = c.captureStream(0);
      const vTrack = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
      const enc = pickVideoMime();
      const rec = new MediaRecorder(stream, { mimeType: enc.mimeType, videoBitsPerSecond: 3_000_000 });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: `video/${enc.ext}` })); });
      rec.start(250);
      for (let loop = 0; loop < 2; loop++) {
        for (let i = 0; i < count; i++) {
          const { image } = await dec.decode({ frameIndex: i });
          ctx.drawImage(image, 0, 0, W, H);
          vTrack.requestFrame?.();
          const delay = (image.duration ?? 100_000) / 1000;
          image.close();
          await new Promise((r) => setTimeout(r, Math.max(20, delay)));
        }
      }
      rec.stop();
      const blob = await stopped;
      const saved = `${Math.max(0, Math.round((1 - blob.size / f.size) * 100))}% smaller`;
      setResult({ blob, url: URL.createObjectURL(blob), saved });
    } catch {
      setErr("Couldn't decode this GIF — is it an animated GIF file?");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return <div className="qx-card p-6"><CloudNotice>GIF decoding uses the ImageDecoder API (Chrome / Edge). Open this page in a Chromium browser, or wait for the cloud engine.</CloudNotice></div>;
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {err && <p className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>{err}</p>}
      {!result && !busy && <AiDropzone onFile={onFile} accept="image/gif" hint="Animated GIF in → smooth, small video out" />}
      {busy && <AiProcessing label="Decoding GIF frames and re-encoding…" />}
      {result && (
        <>
          <video src={result.url} controls loop autoPlay playsInline muted className="w-full max-h-[380px] rounded-2xl" style={{ background: "#000", border: "1px solid var(--border)" }} />
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>🎉 <b style={{ color: "var(--primary-bright)" }}>{result.saved}</b> than the original GIF.</p>
          <AiResultBar blob={result.blob} filename={`from-gif.${result.blob.type.includes("mp4") ? "mp4" : "webm"}`} onReset={() => setResult(null)} />
        </>
      )}
    </div>
  );
}
