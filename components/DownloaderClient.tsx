"use client";

/* Universal social-media downloader — paste a link from TikTok, Instagram, VK,
   Facebook, X, Pinterest, Reddit and more; preview it; pick video / audio /
   image + quality; download with a live animated progress fill.

   The extraction runs server-side (/api/download); the file streams back
   through /api/download/file so there are no CORS walls and progress is real.
   YouTube is intentionally not offered (AdSense policy). */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiLink, FiDownload, FiClipboard, FiVideo, FiMusic, FiImage, FiZap, FiCheck, FiAlertCircle, FiClock, FiSend } from "react-icons/fi";
import { TG_CHANNEL, TG_CHANNEL_URL, TG_BOT, TG_BOT_URL } from "@/lib/social";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Fmt = {
  id: string; type: "video" | "audio" | "image"; container: string; quality: string; label: string; token: string;
  /** client-side fallback: download the video stream, extract its soundtrack in-browser */
  extract?: boolean;
};
type Info = { ok: true; platform: string; platformName: string; title: string; thumbnail?: string; author?: string; duration?: number; formats: Fmt[] };

const TYPE_META = {
  video: { icon: <FiVideo size={14} />, label: "Video" },
  audio: { icon: <FiMusic size={14} />, label: "Audio" },
  image: { icon: <FiImage size={14} />, label: "Image" },
} as const;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export default function DownloaderClient({ compact = false, placeholder }: { compact?: boolean; placeholder?: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"video" | "audio" | "image">("video");
  const [dl, setDl] = useState<{ id: string; pct: number } | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const reqId = useRef(0);

  // Some platforms (e.g. OK.ru) can't give a server-side MP3 — offer a
  // client-side "extract from video" audio option instead (Mediabunny/LAME).
  const formats = useMemo<Fmt[]>(() => {
    if (!info) return [];
    const out = [...info.formats];
    const video = out.find((f) => f.type === "video");
    if (video && !out.some((f) => f.type === "audio")) {
      out.push({
        id: "audio-extract", type: "audio", container: "mp3",
        quality: "Extracted from video", label: "Audio · MP3",
        token: video.token, extract: true,
      });
    }
    return out;
  }, [info]);

  const kinds = useMemo(() => {
    const s = new Set(formats.map((f) => f.type));
    return (["video", "audio", "image"] as const).filter((k) => s.has(k));
  }, [formats]);

  useEffect(() => { if (kinds.length && !kinds.includes(tab)) setTab(kinds[0]); }, [kinds, tab]);

  async function fetchInfo(u: string) {
    const link = u.trim();
    if (!/^https?:\/\//i.test(link)) { setErr(link ? "Please paste a full link (https://…)." : null); setInfo(null); return; }
    const id = ++reqId.current;
    setBusy(true); setErr(null); setInfo(null); setDone(null);
    try {
      const r = await fetch(`/api/download?url=${encodeURIComponent(link)}`);
      const j = await r.json();
      if (id !== reqId.current) return;
      if (j.ok) { setInfo(j); trackTool("downloader", { platform: j.platform }); }
      else setErr(msgFor(j.error));
    } catch {
      if (id === reqId.current) setErr("Couldn't reach the server. Please try again.");
    } finally {
      if (id === reqId.current) setBusy(false);
    }
  }

  async function download(f: Fmt) {
    setDl({ id: f.id, pct: 0 }); setDone(null); setErr(null);
    try {
      const res = await fetch(`/api/download/file?t=${encodeURIComponent(f.token)}`);
      if (!res.ok || !res.body) throw new Error("stream");
      const total = Number(res.headers.get("content-length")) || 0;
      // when we still have to extract audio locally, the stream is only ~70% of the job
      const cap = f.extract ? 70 : 99;
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let got = 0;
      for (;;) {
        const { done: d, value } = await reader.read();
        if (d) break;
        if (value) { chunks.push(value); got += value.length; setDl({ id: f.id, pct: total ? Math.min(cap, Math.round((got / total) * cap)) : 0 }); }
      }
      let blob: Blob = new Blob(chunks as BlobPart[]);
      if (f.extract) {
        setDl({ id: f.id, pct: 70 });
        const { extractAudioMp3 } = await import("@/lib/video/convert-mb");
        blob = await extractAudioMp3(blob, (p) => setDl({ id: f.id, pct: 70 + Math.round(p * 29) }));
      }
      setDl({ id: f.id, pct: 100 });
      const name = `${(info?.title || "qrix-download").replace(/[^\w\-. ]+/g, "").trim().slice(0, 60) || "qrix-download"}.${f.container}`;
      await saveBlob(blob, name);
      setDone(f.id);
      trackTool("downloader", { action: "download", platform: info?.platform || "web", type: f.type, ...(f.extract ? { extract: 1 } : {}) });
    } catch {
      setErr(f.extract
        ? "Couldn't extract audio from this video in your browser. Try downloading the video instead."
        : "Download failed — the link may have expired. Paste it again.");
    } finally {
      setTimeout(() => setDl(null), 600);
    }
  }

  const shownFormats = formats.filter((f) => f.type === tab);
  const brand = info ? PLATFORMS.find((p) => p.id === info.platform) : null;

  return (
    <div className={compact ? "" : "qx-card p-6"}>
      {/* ── input row ── */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="qx-dl-bar flex items-center gap-2.5 flex-1 min-w-0 pl-4 pr-2 py-2.5">
          <FiLink size={16} style={{ color: "var(--text-faint)" }} className="shrink-0" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") fetchInfo(url); }}
            placeholder={placeholder || "Paste a TikTok, Instagram, VK, X, Facebook… link"}
            aria-label="Media link"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px] py-1"
            style={{ color: "var(--text)" }}
          />
          <button type="button" aria-label="Paste from clipboard"
            onClick={async () => { try { const t = await navigator.clipboard.readText(); if (t) { setUrl(t); fetchInfo(t); } } catch { /* denied */ } }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)", background: "rgba(255,255,255,.05)", border: "1px solid var(--border)" }}>
            <FiClipboard size={13} /> <span className="hidden sm:inline">Paste</span>
          </button>
        </div>
        <button type="button" onClick={() => fetchInfo(url)} disabled={busy || !url.trim()}
          className="qx-btn-hero shrink-0 disabled:opacity-50 !px-7">
          {busy ? <><FiZap size={15} className="animate-pulse" /> Fetching…</> : <><FiDownload size={15} /> Download</>}
        </button>
      </div>

      {/* ── supported-platform logo marquee ── */}
      {!info && !busy && (
        <div className="mt-5">
          <div className="qx-mono text-[10px] uppercase tracking-[0.18em] mb-2.5" style={{ color: "var(--text-faint)" }}>
            {"// works with " + PLATFORMS.length + " platforms — no ads, no watermark"}
          </div>
          <div className="qx-dl-mq">
            <div className="qx-dl-mq-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-2.5" aria-hidden={copy === 1}>
                  {PLATFORMS.map((p) => (
                    <Link key={`${copy}-${p.id}`} href={`/downloader/${p.id}`} className="qx-dl-chip" tabIndex={copy === 1 ? -1 : 0}>
                      <span className="w-[18px] h-[18px] block shrink-0" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} />
                      {p.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── fetching skeleton ── */}
      {busy && (
        <div className="mt-5 grid sm:grid-cols-[minmax(0,190px)_1fr] gap-5 items-start" aria-hidden>
          <div className="qx-dl-skel" style={{ aspectRatio: "9/12", maxHeight: 240 }} />
          <div className="space-y-3 pt-1">
            <div className="qx-dl-skel h-5 w-3/4" />
            <div className="qx-dl-skel h-3.5 w-2/5" />
            <div className="qx-dl-skel h-12 w-full mt-4" />
            <div className="qx-dl-skel h-12 w-full" />
          </div>
        </div>
      )}

      {/* ── error ── */}
      {err && (
        <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl text-[13px]"
          style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>
          <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> <span>{err}</span>
        </div>
      )}

      {/* ── result ── */}
      {info && (
        <div className="mt-5 grid sm:grid-cols-[minmax(0,190px)_1fr] gap-5 items-start">
          {/* preview */}
          <div className="qx-dl-thumb" style={{ aspectRatio: "9/12", maxHeight: 260 }}>
            {info.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="w-14 h-14 block opacity-90" aria-hidden
                  dangerouslySetInnerHTML={{ __html: brand?.svg || "" }} />
              </div>
            )}
            <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-[10px] font-bold text-white"
              style={{ background: "rgba(0,0,0,.62)", backdropFilter: "blur(6px)" }}>
              {brand && <span className="w-3.5 h-3.5 block" aria-hidden dangerouslySetInnerHTML={{ __html: brand.svg }} />}
              {info.platformName}
            </span>
            {!!info.duration && (
              <span className="qx-mono absolute bottom-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
                style={{ background: "rgba(0,0,0,.62)", backdropFilter: "blur(6px)" }}>
                <FiClock size={10} /> {mmss(info.duration)}
              </span>
            )}
          </div>

          {/* details + formats */}
          <div className="min-w-0">
            <h3 className="font-display text-[15.5px] font-bold leading-snug line-clamp-2" style={{ color: "var(--text)" }}>{info.title}</h3>
            {info.author && <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>by {info.author}</p>}

            {/* type tabs — segmented control */}
            {kinds.length > 1 && (
              <div className="qx-dl-tabs mt-3" role="tablist" aria-label="Format type">
                {kinds.map((k) => (
                  <button key={k} onClick={() => setTab(k)} role="tab" aria-selected={tab === k}
                    className={`qx-dl-tab ${tab === k ? "on" : ""}`}>
                    {TYPE_META[k].icon} {TYPE_META[k].label}
                  </button>
                ))}
              </div>
            )}

            {/* format rows */}
            <div className="mt-3 space-y-2">
              {shownFormats.map((f) => {
                const active = dl?.id === f.id;
                const finished = done === f.id;
                return (
                  <button key={f.id} onClick={() => download(f)} disabled={!!dl} className="qx-dl-row disabled:opacity-60">
                    {active && <span className="qx-dl-fill" style={{ width: `${dl!.pct}%` }} />}
                    <span className="qx-dl-ic relative z-10">{TYPE_META[f.type].icon}</span>
                    <span className="relative z-10 flex-1 min-w-0">
                      <span className="block text-[13px] font-bold truncate" style={{ color: "var(--text)" }}>{f.label}</span>
                      <span className="qx-mono block text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-faint)" }}>
                        {f.container.toUpperCase()}{f.quality && f.quality !== f.label ? ` · ${f.quality}` : ""}
                      </span>
                    </span>
                    <span className="relative z-10 text-[12.5px] font-bold shrink-0" style={{ color: finished ? "#22c55e" : "var(--primary-bright)" }}>
                      {finished ? <span className="qx-dl-pop inline-flex items-center gap-1"><FiCheck size={13} /> Saved</span>
                        : active ? <span className="qx-mono">{dl!.pct ? `${dl!.pct}%` : "…"}</span>
                        : <span className="inline-flex items-center gap-1"><FiDownload size={13} /> Save</span>}
                    </span>
                  </button>
                );
              })}
              {!shownFormats.length && <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>No {tab} available for this link.</p>}
            </div>
          </div>
        </div>
      )}

      {!compact && (
        <>
          {/* Telegram: same downloader, inside a chat */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {TG_BOT_URL && (
              <a href={`${TG_BOT_URL}?start=downloader`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-opacity hover:opacity-85"
                style={{ background: "rgba(255,77,28,.1)", border: "1px solid rgba(255,77,28,.25)", color: "var(--primary-bright)" }}>
                <FiSend size={13} /> Telegram bot — @{TG_BOT}
              </a>
            )}
            <a href={`${TG_CHANNEL_URL}?utm_source=site&utm_medium=downloader`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-opacity hover:opacity-85"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <FiSend size={13} /> @{TG_CHANNEL}
            </a>
          </div>
          <p className="text-[11px] mt-4 leading-relaxed" style={{ color: "var(--text-faint)" }}>
            Paste a public link, pick a format, and it downloads through QRix — no ads, no pop-ups, nothing installed.
            Only download content you have the right to. QRix does not host any media.
          </p>
        </>
      )}
    </div>
  );
}

function msgFor(error: string): string {
  switch (error) {
    case "unsupported_platform": return "That site isn't supported yet. Try TikTok, Instagram, VK, X, Facebook, Pinterest or Reddit.";
    case "engine_not_configured": return "This platform is coming online shortly — please try again soon.";
    case "extraction_failed": return "Couldn't read that link. It may be private, deleted, or region-locked.";
    case "invalid_url": return "That doesn't look like a valid link.";
    case "rate_limited": return "Too many downloads — please wait a minute and try again.";
    default: return "Something went wrong. Please try another link.";
  }
}
