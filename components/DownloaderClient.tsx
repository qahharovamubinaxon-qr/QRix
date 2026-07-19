"use client";

/* Universal social-media downloader — paste a link from TikTok, Instagram, VK,
   Facebook, X, Pinterest, Reddit and more; preview it; pick video / audio /
   image + quality; download with a live animated progress ring.

   The extraction runs server-side (/api/download); the file streams back
   through /api/download/file so there are no CORS walls and progress is real.
   YouTube is intentionally not offered (AdSense policy). */

import { useEffect, useMemo, useRef, useState } from "react";
import { FiLink, FiDownload, FiClipboard, FiVideo, FiMusic, FiImage, FiZap, FiCheck, FiAlertCircle } from "react-icons/fi";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Fmt = { id: string; type: "video" | "audio" | "image"; container: string; quality: string; label: string; token: string };
type Info = { ok: true; platform: string; platformName: string; title: string; thumbnail?: string; author?: string; duration?: number; formats: Fmt[] };

const TYPE_META = {
  video: { icon: <FiVideo size={14} />, label: "Video" },
  audio: { icon: <FiMusic size={14} />, label: "Audio" },
  image: { icon: <FiImage size={14} />, label: "Image" },
} as const;

export default function DownloaderClient({ compact = false, placeholder }: { compact?: boolean; placeholder?: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"video" | "audio" | "image">("video");
  const [dl, setDl] = useState<{ id: string; pct: number } | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const reqId = useRef(0);

  const kinds = useMemo(() => {
    const s = new Set(info?.formats.map((f) => f.type));
    return (["video", "audio", "image"] as const).filter((k) => s.has(k));
  }, [info]);

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
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let got = 0;
      for (;;) {
        const { done: d, value } = await reader.read();
        if (d) break;
        if (value) { chunks.push(value); got += value.length; setDl({ id: f.id, pct: total ? Math.min(99, Math.round((got / total) * 100)) : 0 }); }
      }
      setDl({ id: f.id, pct: 100 });
      const blob = new Blob(chunks as BlobPart[]);
      const name = `${(info?.title || "qrix-download").replace(/[^\w\-. ]+/g, "").trim().slice(0, 60) || "qrix-download"}.${f.container}`;
      await saveBlob(blob, name);
      setDone(f.id);
      trackTool("downloader", { action: "download", platform: info?.platform || "web", type: f.type });
    } catch {
      setErr("Download failed — the link may have expired. Paste it again.");
    } finally {
      setTimeout(() => setDl(null), 600);
    }
  }

  const shownFormats = info?.formats.filter((f) => f.type === tab) || [];

  return (
    <div className={compact ? "" : "qx-card p-6"}>
      {/* ── input row ── */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 px-4 py-3 rounded-2xl"
          style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)" }}>
          <FiLink size={16} style={{ color: "var(--text-faint)" }} className="shrink-0" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") fetchInfo(url); }}
            placeholder={placeholder || "Paste a TikTok, Instagram, VK, X, Facebook… link"}
            aria-label="Media link"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px]"
            style={{ color: "var(--text)" }}
          />
          <button type="button" aria-label="Paste from clipboard"
            onClick={async () => { try { const t = await navigator.clipboard.readText(); if (t) { setUrl(t); fetchInfo(t); } } catch { /* denied */ } }}
            className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
            <FiClipboard size={15} />
          </button>
        </div>
        <button type="button" onClick={() => fetchInfo(url)} disabled={busy || !url.trim()}
          className="qx-btn-hero shrink-0 disabled:opacity-50 !px-6">
          {busy ? <><FiZap size={15} className="animate-pulse" /> Fetching…</> : <><FiDownload size={15} /> Download</>}
        </button>
      </div>

      {/* ── supported-platform logos ── */}
      {!info && (
        <div className="mt-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
            Works with
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <span key={p.id} title={p.name}
                className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <span className="w-4 h-4 block shrink-0" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} />
                {p.name}
              </span>
            ))}
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
          <div className="rounded-2xl overflow-hidden relative" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", aspectRatio: "9/12", maxHeight: 260 }}>
            {info.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="w-12 h-12 block opacity-80" aria-hidden
                  dangerouslySetInnerHTML={{ __html: PLATFORMS.find((p) => p.id === info.platform)?.svg || "" }} />
              </div>
            )}
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: "rgba(0,0,0,.6)" }}>
              {info.platformName}
            </span>
          </div>

          {/* details + formats */}
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-bold leading-snug line-clamp-2" style={{ color: "var(--text)" }}>{info.title}</h3>
            {info.author && <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>by {info.author}</p>}

            {/* type tabs */}
            {kinds.length > 1 && (
              <div className="flex gap-1.5 mt-3">
                {kinds.map((k) => (
                  <button key={k} onClick={() => setTab(k)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={{ background: tab === k ? "var(--primary-dim, rgba(255,77,28,.14))" : "var(--surface-2)", color: tab === k ? "var(--primary-bright)" : "var(--text-muted)", border: `1px solid ${tab === k ? "var(--border-hover)" : "var(--border)"}` }}>
                    {TYPE_META[k].icon} {TYPE_META[k].label}
                  </button>
                ))}
              </div>
            )}

            {/* format buttons */}
            <div className="mt-3 space-y-2">
              {shownFormats.map((f) => {
                const active = dl?.id === f.id;
                const finished = done === f.id;
                return (
                  <button key={f.id} onClick={() => download(f)} disabled={!!dl}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all disabled:opacity-60 relative overflow-hidden"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    {active && <span className="absolute inset-y-0 left-0" style={{ width: `${dl!.pct}%`, background: "var(--primary-dim, rgba(255,77,28,.18))", transition: "width .2s" }} />}
                    <span className="relative z-10 shrink-0">{TYPE_META[f.type].icon}</span>
                    <span className="relative z-10 flex-1 text-left text-[13px] font-bold" style={{ color: "var(--text)" }}>{f.label}</span>
                    <span className="relative z-10 text-[12px] font-bold" style={{ color: finished ? "#22c55e" : "var(--primary-bright)" }}>
                      {finished ? <span className="inline-flex items-center gap-1"><FiCheck size={13} /> Saved</span>
                        : active ? `${dl!.pct || ""}${dl!.pct ? "%" : "…"}`
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
        <p className="text-[11px] mt-4 leading-relaxed" style={{ color: "var(--text-faint)" }}>
          Paste a public link, pick a format, and it downloads through QRix — no ads, no pop-ups, nothing installed.
          Only download content you have the right to. QRix does not host any media.
        </p>
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
