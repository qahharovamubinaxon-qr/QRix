"use client";

/* Subtitle engines: SRT Editor (edit + shift timings) and
   SRT Translator workspace (connector preview with manual editing). */

import { useRef, useState } from "react";
import { FiDownload, FiTrash2, FiUpload, FiClock } from "react-icons/fi";
import { CloudNotice } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

type Cue = { start: number; end: number; text: string };

function parseSrtTime(s: string): number {
  const m = s.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}
function toSrtTime(t: number): string {
  t = Math.max(0, t);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60), ms = Math.round((t % 1) * 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(ms, 3)}`;
}
export function parseSrt(src: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of src.replace(/\r/g, "").split(/\n\n+/)) {
    const lines = block.trim().split("\n");
    const ti = lines.findIndex((l) => l.includes("-->"));
    if (ti === -1) continue;
    const [a, b] = lines[ti].split("-->");
    const text = lines.slice(ti + 1).join("\n").trim();
    if (text) cues.push({ start: parseSrtTime(a), end: parseSrtTime(b), text });
  }
  return cues;
}
function buildSrt(cues: Cue[], pick: (c: Cue) => string = (c) => c.text): string {
  return cues.map((c, i) => `${i + 1}\n${toSrtTime(c.start)} --> ${toSrtTime(c.end)}\n${pick(c)}\n`).join("\n");
}

function SrtDrop({ onCues }: { onCues: (c: Cue[], name: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div role="button" tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onCues(parseSrt(await f.text()), f.name); }}
      className="rounded-3xl p-10 text-center cursor-pointer"
      style={{ border: "2px dashed var(--border-glass)", background: "var(--surface)" }}>
      <input ref={ref} type="file" accept=".srt,.txt" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) onCues(parseSrt(await f.text()), f.name); e.currentTarget.value = ""; }} />
      <FiUpload size={22} className="mx-auto mb-3" style={{ color: "var(--primary-bright)" }} />
      <p className="font-bold text-[14.5px]" style={{ color: "var(--text)" }}>Drop an .srt file or click to browse</p>
      <p className="text-[12px] mt-1" style={{ color: "var(--text-faint)" }}>Parsed locally — nothing is uploaded</p>
    </div>
  );
}

/* ── SRT Editor ───────────────────────────────────────────── */
export function SrtEditorClient() {
  const [cues, setCues] = useState<Cue[]>([]);
  const [name, setName] = useState("subtitles.srt");
  const [shift, setShift] = useState("0");

  async function download() {
    const { saveBlob } = await import("@/lib/save-file");
    await saveBlob(new Blob([buildSrt(cues)], { type: "text/plain" }), name);
  }
  function applyShift() {
    const d = parseFloat(shift);
    if (!isFinite(d) || !d) return;
    setCues((cs) => cs.map((c) => ({ ...c, start: c.start + d, end: c.end + d })));
    setShift("0");
    trackTool("video-srt-edit", { shift: d });
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {cues.length === 0 && <SrtDrop onCues={(c, n) => { setCues(c); setName(n); trackTool("video-srt-edit"); }} />}
      {cues.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] font-bold" style={{ color: "var(--text)" }}>{name} · {cues.length} cues</span>
            <span className="flex-1" />
            <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>
              <FiClock size={13} /> Shift all (s)
              <input value={shift} onChange={(e) => setShift(e.target.value)} className="qx-auth-input !py-1.5 !px-2 w-20 !text-[12px] text-center" />
            </label>
            <button onClick={applyShift} className="qx-btn !py-1.5 !px-3 !text-[11px]">Apply</button>
            <button onClick={download} className="qx-btn-hero !py-2 !px-4 text-xs" data-magnetic><FiDownload size={13} /> Download SRT</button>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {cues.map((c, i) => (
              <div key={i} className="rounded-xl px-3 py-2 flex items-start gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span className="text-[10px] font-mono shrink-0 mt-1 w-20" style={{ color: "var(--primary-bright)" }}>{toSrtTime(c.start).slice(0, 8)}</span>
                <textarea value={c.text} rows={Math.min(3, c.text.split("\n").length)}
                  onChange={(e) => setCues((cs) => cs.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                  className="flex-1 bg-transparent outline-none text-[13px] resize-none" style={{ color: "var(--text)" }} aria-label={`Cue ${i + 1}`} />
                <button onClick={() => setCues((cs) => cs.filter((_, j) => j !== i))} className="qx-btn-ghost !p-1.5" aria-label="Delete cue"><FiTrash2 size={12} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── SRT Translator (connector workspace) ─────────────────── */
const LANGS = ["English", "Uzbek", "Russian", "Turkish", "German", "French", "Spanish", "Arabic", "Korean", "Chinese"];

export function SrtTranslateClient() {
  const [cues, setCues] = useState<(Cue & { tr: string })[]>([]);
  const [name, setName] = useState("subtitles.srt");
  const [target, setTarget] = useState("Uzbek");

  async function download() {
    const { saveBlob } = await import("@/lib/save-file");
    const srt = buildSrt(cues, (c) => (c as Cue & { tr: string }).tr || c.text);
    await saveBlob(new Blob([srt], { type: "text/plain" }), name.replace(/\.srt$/i, "") + `-${target.toLowerCase()}.srt`);
  }

  return (
    <div className="qx-card p-6 space-y-5">
      <CloudNotice>Automatic neural translation of every cue activates with the QRix cloud engine. Today the full workspace works — parse, translate manually (or paste from any translator), and export a perfectly timed SRT.</CloudNotice>
      {cues.length === 0 && <SrtDrop onCues={(c, n) => { setCues(c.map((x) => ({ ...x, tr: "" }))); setName(n); trackTool("video-srt-translate"); }} />}
      {cues.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] font-bold" style={{ color: "var(--text)" }}>{name} · {cues.length} cues</span>
            <span className="flex-1" />
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="qx-auth-input !py-2 w-40" aria-label="Target language">
              {LANGS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button onClick={download} className="qx-btn-hero !py-2 !px-4 text-xs" data-magnetic><FiDownload size={13} /> Export translated SRT</button>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {cues.map((c, i) => (
              <div key={i} className="rounded-xl px-3 py-2.5 grid sm:grid-cols-2 gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div>
                  <span className="text-[10px] font-mono" style={{ color: "var(--primary-bright)" }}>{toSrtTime(c.start).slice(0, 8)}</span>
                  <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{c.text}</p>
                </div>
                <textarea value={c.tr} rows={2} placeholder={`${target} translation…`}
                  onChange={(e) => setCues((cs) => cs.map((x, j) => j === i ? { ...x, tr: e.target.value } : x))}
                  className="qx-auth-input !py-2 !text-[12.5px] resize-none" aria-label={`Translation ${i + 1}`} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
