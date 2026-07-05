"use client";

/* Voice-AI engines: live Speech-to-Text and timed Subtitle (SRT) generator.
   Both use the browser's built-in neural SpeechRecognition. */

import { useEffect, useRef, useState } from "react";
import { FiMic, FiSquare, FiCopy, FiCheck, FiDownload, FiTrash2 } from "react-icons/fi";
import { trackTool } from "@/lib/track";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SR_LANGS = [
  ["en-US", "English"], ["ru-RU", "Русский"], ["uz-UZ", "Oʻzbek"],
  ["tr-TR", "Türkçe"], ["de-DE", "Deutsch"], ["fr-FR", "Français"], ["es-ES", "Español"],
] as const;

function getRecognizer(): any | null {
  if (typeof window === "undefined") return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR ? new SR() : null;
}

/* ── Speech to Text ───────────────────────────────────────── */
export function AiSpeechClient() {
  const [supported, setSupported] = useState(true);
  const [lang, setLang] = useState("en-US");
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [copied, setCopied] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => { setSupported(!!getRecognizer()); }, []);

  function start() {
    const rec = getRecognizer();
    if (!rec) return;
    rec.lang = lang; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e: any) => {
      let fin = "", inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t + " ";
        else inter += t;
      }
      if (fin) setFinalText((p) => p + fin);
      setInterim(inter);
    };
    rec.onend = () => { setListening(false); setInterim(""); };
    rec.onerror = () => { setListening(false); };
    recRef.current = rec;
    rec.start();
    setListening(true);
    trackTool("ai-speech", { lang });
  }
  function stop() { recRef.current?.stop(); setListening(false); }

  async function copy() {
    await navigator.clipboard.writeText(finalText.trim());
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }
  async function download() {
    const { saveBlob } = await import("@/lib/save-file");
    await saveBlob(new Blob([finalText.trim()], { type: "text/plain" }), "transcript.txt");
  }

  if (!supported) {
    return (
      <div className="qx-card p-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Your browser doesn't expose live speech recognition. Please use Chrome, Edge or Safari — file transcription arrives with the cloud engine.
      </div>
    );
  }

  return (
    <div className="qx-card p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={listening} className="qx-auth-input !py-2 w-44" aria-label="Language">
          {SR_LANGS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        {!listening ? (
          <button onClick={start} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiMic size={15} /> Start dictation</button>
        ) : (
          <button onClick={stop} className="qx-btn !py-2.5 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
            <FiSquare size={13} /> Stop
          </button>
        )}
        {listening && (
          <span className="inline-flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--danger)" }}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--danger)" }} /> Listening…
          </span>
        )}
      </div>

      <div className="rounded-2xl p-4 min-h-[160px] text-[14.5px] leading-relaxed whitespace-pre-wrap"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} aria-live="polite">
        {finalText}
        <span style={{ color: "var(--text-faint)" }}>{interim}</span>
        {!finalText && !interim && <span style={{ color: "var(--text-faint)" }}>Your words will appear here as you speak…</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={copy} disabled={!finalText} className="qx-btn !py-2 text-xs disabled:opacity-40">{copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy</button>
        <button onClick={download} disabled={!finalText} className="qx-btn !py-2 text-xs disabled:opacity-40"><FiDownload size={13} /> Download .txt</button>
        <button onClick={() => setFinalText("")} disabled={!finalText} className="qx-btn-ghost !py-2 text-xs disabled:opacity-40"><FiTrash2 size={13} /> Clear</button>
      </div>
    </div>
  );
}

/* ── Subtitle (SRT) generator ─────────────────────────────── */
type Cue = { start: number; end: number; text: string };

function srtTime(t: number): string {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60), ms = Math.round((t % 1) * 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(ms, 3)}`;
}
function toSrt(cues: Cue[]): string {
  return cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n");
}

export function AiSubtitlesClient() {
  const [supported, setSupported] = useState(true);
  const [lang, setLang] = useState("en-US");
  const [recording, setRecording] = useState(false);
  const [cues, setCues] = useState<Cue[]>([]);
  const recRef = useRef<any>(null);
  const t0 = useRef(0);
  const lastEnd = useRef(0);

  useEffect(() => { setSupported(!!getRecognizer()); }, []);

  function start() {
    const rec = getRecognizer();
    if (!rec) return;
    rec.lang = lang; rec.continuous = true; rec.interimResults = false;
    t0.current = performance.now();
    lastEnd.current = 0;
    rec.onresult = (e: any) => {
      const now = (performance.now() - t0.current) / 1000;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) continue;
        const text = String(e.results[i][0].transcript).trim();
        if (!text) continue;
        const start = Math.max(lastEnd.current + 0.05, now - Math.min(6, text.split(" ").length * 0.45));
        const end = Math.max(start + 0.8, now);
        lastEnd.current = end;
        setCues((c) => [...c, { start, end, text }]);
      }
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
    trackTool("ai-subtitles", { lang });
  }
  function stop() { recRef.current?.stop(); setRecording(false); }

  async function download() {
    const { saveBlob } = await import("@/lib/save-file");
    await saveBlob(new Blob([toSrt(cues)], { type: "text/plain" }), "subtitles.srt");
  }

  if (!supported) {
    return (
      <div className="qx-card p-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Live speech recognition isn't available in this browser — use Chrome, Edge or Safari. Direct video-file transcription arrives with the cloud engine.
      </div>
    );
  }

  return (
    <div className="qx-card p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={recording} className="qx-auth-input !py-2 w-44" aria-label="Language">
          {SR_LANGS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        {!recording ? (
          <button onClick={start} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiMic size={15} /> Record subtitles</button>
        ) : (
          <button onClick={stop} className="qx-btn !py-2.5 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}><FiSquare size={13} /> Stop</button>
        )}
        {recording && <span className="text-[12px] font-bold animate-pulse" style={{ color: "var(--danger)" }}>● Recording — speak your lines</span>}
      </div>

      {cues.length > 0 && (
        <>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {cues.map((c, i) => (
              <div key={i} className="rounded-xl px-3 py-2 flex items-start gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span className="text-[10.5px] font-mono shrink-0 mt-1" style={{ color: "var(--primary-bright)" }}>{srtTime(c.start).slice(3, 8)}</span>
                <input value={c.text}
                  onChange={(e) => setCues((cs) => cs.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                  className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: "var(--text)" }} aria-label={`Subtitle line ${i + 1}`} />
                <button onClick={() => setCues((cs) => cs.filter((_, j) => j !== i))} className="qx-btn-ghost !p-1.5" aria-label="Delete line"><FiTrash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={download} className="qx-btn-hero !py-2.5 !px-5 text-sm"><FiDownload size={14} /> Download .srt</button>
            <button onClick={() => setCues([])} className="qx-btn-ghost !py-2.5 text-sm"><FiTrash2 size={14} /> Clear</button>
          </div>
        </>
      )}
    </div>
  );
}
