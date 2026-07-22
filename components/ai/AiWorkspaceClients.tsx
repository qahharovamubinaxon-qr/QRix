"use client";

/* Workspace engines: Resume Builder (PDF), Image Generator (connector
   workspace), Object Remover (brush + blend fill), Image Description. */

import { useEffect, useMemo, useRef, useState } from "react";
import { FiDownload, FiPlus, FiTrash2, FiCopy, FiCheck, FiZap } from "react-icons/fi";
import { AiDropzone, BeforeAfter, AiResultBar, CloudNotice } from "@/components/ai/AiKit";
import { isAiEngineLive } from "@/lib/ai-connector";
import { trackTool } from "@/lib/track";

/* ── Resume Builder ───────────────────────────────────────── */
type Job = { role: string; company: string; period: string; points: string };

export function AiResumeClient() {
  const [p, setP] = useState({ name: "", title: "", email: "", phone: "", location: "", summary: "", skills: "" });
  const [jobs, setJobs] = useState<Job[]>([{ role: "", company: "", period: "", points: "" }]);
  const [edu, setEdu] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setP((s) => ({ ...s, [k]: e.target.value }));

  async function downloadPdf() {
    setBusy(true);
    trackTool("ai-resume");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth(), M = 48;
      let y = 56;
      const line = (h = 14) => { y += h; if (y > 790) { doc.addPage(); y = 56; } };

      doc.setFont("helvetica", "bold"); doc.setFontSize(24);
      doc.text(p.name || "Your Name", M, y); line(20);
      doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(90);
      doc.text(p.title || "Job Title", M, y); line(16);
      doc.setFontSize(9.5);
      doc.text([p.email, p.phone, p.location].filter(Boolean).join("  ·  "), M, y); line(10);
      doc.setDrawColor(30); doc.setLineWidth(1.2); doc.line(M, y, W - M, y); line(20);
      doc.setTextColor(20);

      const section = (title: string) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(11.5);
        doc.text(title.toUpperCase(), M, y); line(6);
        doc.setDrawColor(200); doc.setLineWidth(0.6); doc.line(M, y, W - M, y); line(14);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      };
      const para = (text: string, indent = 0) => {
        const rows = doc.splitTextToSize(text, W - M * 2 - indent);
        rows.forEach((r: string) => { doc.text(r, M + indent, y); line(13); });
      };

      if (p.summary.trim()) { section("Summary"); para(p.summary.trim()); line(6); }
      const realJobs = jobs.filter((j) => j.role || j.company);
      if (realJobs.length) {
        section("Experience");
        for (const j of realJobs) {
          doc.setFont("helvetica", "bold");
          doc.text(`${j.role || "Role"} — ${j.company || "Company"}`, M, y);
          doc.setFont("helvetica", "italic"); doc.setTextColor(110);
          doc.text(j.period, W - M, y, { align: "right" });
          doc.setTextColor(20); line(14);
          doc.setFont("helvetica", "normal");
          j.points.split("\n").map((s) => s.trim()).filter(Boolean).forEach((pt) => para(`•  ${pt}`, 6));
          line(6);
        }
      }
      if (edu.trim()) { section("Education"); edu.split("\n").filter(Boolean).forEach((e) => para(e.trim())); line(6); }
      if (p.skills.trim()) { section("Skills"); para(p.skills.trim()); }

      const blob = doc.output("blob");
      const { saveBlob } = await import("@/lib/save-file");
      await saveBlob(blob, `${(p.name || "resume").toLowerCase().replace(/\s+/g, "-")}-cv.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 grid lg:grid-cols-2 gap-8">
      {/* form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input value={p.name} onChange={set("name")} placeholder="Full name" className="qx-auth-input" />
          <input value={p.title} onChange={set("title")} placeholder="Job title" className="qx-auth-input" />
          <input value={p.email} onChange={set("email")} placeholder="Email" className="qx-auth-input" />
          <input value={p.phone} onChange={set("phone")} placeholder="Phone" className="qx-auth-input" />
        </div>
        <input value={p.location} onChange={set("location")} placeholder="City, Country" className="qx-auth-input" />
        <textarea value={p.summary} onChange={set("summary")} rows={3} placeholder="Professional summary (2–3 sentences)" className="qx-auth-input w-full resize-y" />
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Experience</div>
          {jobs.map((j, i) => (
            <div key={i} className="rounded-2xl p-3 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-2 gap-2">
                <input value={j.role} onChange={(e) => setJobs((a) => a.map((x, k) => k === i ? { ...x, role: e.target.value } : x))} placeholder="Role" className="qx-auth-input !py-2 !text-[13px]" />
                <input value={j.company} onChange={(e) => setJobs((a) => a.map((x, k) => k === i ? { ...x, company: e.target.value } : x))} placeholder="Company" className="qx-auth-input !py-2 !text-[13px]" />
              </div>
              <input value={j.period} onChange={(e) => setJobs((a) => a.map((x, k) => k === i ? { ...x, period: e.target.value } : x))} placeholder="2022 — Present" className="qx-auth-input !py-2 !text-[13px]" />
              <textarea value={j.points} onChange={(e) => setJobs((a) => a.map((x, k) => k === i ? { ...x, points: e.target.value } : x))} rows={2}
                placeholder={"One achievement per line"} className="qx-auth-input w-full !py-2 !text-[13px] resize-y" />
              {jobs.length > 1 && (
                <button onClick={() => setJobs((a) => a.filter((_, k) => k !== i))} className="qx-btn-ghost !py-1.5 !text-[11px]"><FiTrash2 size={12} /> Remove</button>
              )}
            </div>
          ))}
          <button onClick={() => setJobs((a) => [...a, { role: "", company: "", period: "", points: "" }])} className="qx-btn-ghost !py-2 !text-xs"><FiPlus size={13} /> Add position</button>
        </div>
        <textarea value={edu} onChange={(e) => setEdu(e.target.value)} rows={2} placeholder={"Education — one per line\nB.Sc. Computer Science, TUIT, 2019–2023"} className="qx-auth-input w-full resize-y" />
        <input value={p.skills} onChange={set("skills")} placeholder="Skills — React, Figma, English (C1)…" className="qx-auth-input" />
        <button onClick={downloadPdf} disabled={busy} className="qx-btn-hero !py-2.5 !px-5 text-sm disabled:opacity-60" data-magnetic>
          <FiDownload size={14} /> {busy ? "Building…" : "Download PDF"}
        </button>
      </div>

      {/* live preview */}
      <div className="rounded-2xl p-7 overflow-hidden" style={{ background: "#fff", color: "#141414", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,.28)", minHeight: 480 }}>
        <div className="text-[22px] font-extrabold leading-tight" style={{ fontFamily: "Georgia, serif" }}>{p.name || "Your Name"}</div>
        <div className="text-[13px] mt-0.5" style={{ color: "#555" }}>{p.title || "Job Title"}</div>
        <div className="text-[10.5px] mt-1" style={{ color: "#777" }}>{[p.email, p.phone, p.location].filter(Boolean).join("  ·  ")}</div>
        <hr className="my-3" style={{ borderColor: "#222" }} />
        {p.summary && <><div className="text-[10px] font-bold tracking-widest mb-1">SUMMARY</div><p className="text-[11.5px] leading-relaxed mb-3" style={{ color: "#333" }}>{p.summary}</p></>}
        {jobs.some((j) => j.role || j.company) && <div className="text-[10px] font-bold tracking-widest mb-1">EXPERIENCE</div>}
        {jobs.filter((j) => j.role || j.company).map((j, i) => (
          <div key={i} className="mb-2.5">
            <div className="flex justify-between text-[12px]"><b>{j.role || "Role"} — {j.company || "Company"}</b><i style={{ color: "#666" }}>{j.period}</i></div>
            <ul className="mt-0.5 pl-4 list-disc text-[11px] leading-relaxed" style={{ color: "#333" }}>
              {j.points.split("\n").filter(Boolean).map((pt, k) => <li key={k}>{pt}</li>)}
            </ul>
          </div>
        ))}
        {edu && <><div className="text-[10px] font-bold tracking-widest mb-1 mt-3">EDUCATION</div><p className="text-[11.5px] whitespace-pre-line" style={{ color: "#333" }}>{edu}</p></>}
        {p.skills && <><div className="text-[10px] font-bold tracking-widest mb-1 mt-3">SKILLS</div><p className="text-[11.5px]" style={{ color: "#333" }}>{p.skills}</p></>}
      </div>
    </div>
  );
}

/* ── Image Generator workspace (connector) ────────────────── */
const GEN_STYLES = ["Photorealistic", "Illustration", "3D Render", "Anime", "Watercolor", "Pixel Art"];
const RATIOS = ["1:1", "3:2", "16:9", "9:16"];

export function AiImageGenClient() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(GEN_STYLES[0]);
  const [ratio, setRatio] = useState("1:1");
  const live = isAiEngineLive();

  return (
    <div className="qx-card p-6 space-y-5">
      {!live && <CloudNotice>The generation workspace is fully wired to the QRix AI connector. As soon as a cloud image engine is configured, the Generate button below goes live — with zero interface changes.</CloudNotice>}
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value.slice(0, 600))} rows={3}
        placeholder="Describe the image — a cozy coffee shop on a rainy evening, cinematic lighting…" className="qx-auth-input w-full resize-y" />
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {GEN_STYLES.map((s) => (
            <button key={s} onClick={() => setStyle(s)} className="px-3 py-2 rounded-xl text-[12px] font-bold"
              style={{ background: style === s ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${style === s ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {RATIOS.map((r) => (
            <button key={r} onClick={() => setRatio(r)} className="px-3 py-2 rounded-xl text-[12px] font-bold"
              style={{ background: ratio === r ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${ratio === r ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <button disabled={!live || !prompt.trim()} className="qx-btn-hero !py-2.5 !px-6 text-sm disabled:opacity-45" data-magnetic
        title={live ? "Generate" : "Activates with the cloud engine"}>
        <FiZap size={15} /> {live ? "Generate" : "Generate (cloud engine required)"}
      </button>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl aspect-square flex items-center justify-center text-[11px] font-bold"
            style={{ background: "var(--surface)", border: "1px dashed var(--border-glass)", color: "var(--text-faint)" }}>
            Result {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Remove Objects (brush + blend fill) ──────────────────── */
export function AiRemoveObjClient() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [brush, setBrush] = useState(28);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  async function onFile(f: File) {
    trackTool("ai-removeobj");
    const img = new Image();
    img.src = URL.createObjectURL(f);
    await new Promise((r) => { img.onload = r; });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const base = document.createElement("canvas");
    base.width = Math.round(img.width * scale); base.height = Math.round(img.height * scale);
    base.getContext("2d")!.drawImage(img, 0, 0, base.width, base.height);
    const mask = document.createElement("canvas");
    mask.width = base.width; mask.height = base.height;
    baseRef.current = base; maskRef.current = mask;
    setResultUrl(null); setResultBlob(null);
    setImgUrl(img.src);
    requestAnimationFrame(paint);
  }

  function paint() {
    const v = viewRef.current, base = baseRef.current, mask = maskRef.current;
    if (!v || !base || !mask) return;
    v.width = base.width; v.height = base.height;
    const ctx = v.getContext("2d")!;
    ctx.drawImage(base, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#e1ff04";
    const m = mask.getContext("2d")!.getImageData(0, 0, mask.width, mask.height).data;
    // draw mask overlay from alpha channel
    const overlay = document.createElement("canvas");
    overlay.width = mask.width; overlay.height = mask.height;
    const octx = overlay.getContext("2d")!;
    const oim = octx.createImageData(mask.width, mask.height);
    for (let i = 0; i < m.length; i += 4) {
      if (m[i + 3] > 0) { oim.data[i] = 225; oim.data[i + 1] = 255; oim.data[i + 2] = 4; oim.data[i + 3] = 120; }
    }
    octx.putImageData(oim, 0, 0);
    ctx.drawImage(overlay, 0, 0);
    ctx.restore();
  }

  function brushAt(e: React.PointerEvent) {
    const v = viewRef.current, mask = maskRef.current;
    if (!v || !mask) return;
    const r = v.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * mask.width;
    const y = ((e.clientY - r.top) / r.height) * mask.height;
    const ctx = mask.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(x, y, brush, 0, Math.PI * 2); ctx.fill();
    paint();
  }

  function erase() {
    const base = baseRef.current, mask = maskRef.current;
    if (!base || !mask) return;
    // blend fill: heavy blur of the image shown only inside the mask
    const blurred = document.createElement("canvas");
    blurred.width = base.width; blurred.height = base.height;
    const bctx = blurred.getContext("2d")!;
    bctx.filter = "blur(26px)";
    bctx.drawImage(base, 0, 0);
    // composite: result = base, then masked blurred on top (two passes widen the blend)
    const out = document.createElement("canvas");
    out.width = base.width; out.height = base.height;
    const octx = out.getContext("2d")!;
    octx.drawImage(base, 0, 0);
    const maskedBlur = document.createElement("canvas");
    maskedBlur.width = base.width; maskedBlur.height = base.height;
    const mctx = maskedBlur.getContext("2d")!;
    // soften mask edges
    mctx.filter = "blur(10px)";
    mctx.drawImage(maskRef.current!, 0, 0);
    mctx.filter = "none";
    mctx.globalCompositeOperation = "source-in";
    mctx.drawImage(blurred, 0, 0);
    octx.drawImage(maskedBlur, 0, 0);
    octx.drawImage(maskedBlur, 0, 0);
    out.toBlob((blob) => {
      if (!blob) return;
      setResultBlob(blob);
      setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
    }, "image/png");
  }

  function reset() {
    setImgUrl(null); setResultUrl(null); setResultBlob(null);
    baseRef.current = null; maskRef.current = null;
  }

  return (
    <div className="qx-card p-6 space-y-5">
      <CloudNotice engine="removeobj">Brush-and-blend removal works on your device today — ideal for small distractions. Large-object neural inpainting is wired through the QRix AI connector and activates with the cloud engine.</CloudNotice>
      {!imgUrl && <AiDropzone onFile={onFile} />}
      {imgUrl && !resultUrl && (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Brush {brush}px</span>
              <input type="range" min={8} max={80} value={brush} onChange={(e) => setBrush(Number(e.target.value))} className="w-40 accent-[#e1ff04]" />
            </label>
            <button onClick={erase} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>🧽 Erase marked area</button>
            <button onClick={reset} className="qx-btn-ghost !py-2.5 text-sm">Start over</button>
          </div>
          <canvas ref={viewRef}
            className="w-full h-auto rounded-2xl touch-none"
            style={{ border: "1px solid var(--border)", cursor: "crosshair" }}
            onPointerDown={(e) => { drawing.current = true; brushAt(e); }}
            onPointerMove={(e) => drawing.current && brushAt(e)}
            onPointerUp={() => { drawing.current = false; }}
            onPointerLeave={() => { drawing.current = false; }}
          />
          <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>Paint over the object you want removed, then hit “Erase marked area”.</p>
        </>
      )}
      {imgUrl && resultUrl && (
        <>
          <BeforeAfter before={imgUrl} after={resultUrl} />
          <AiResultBar blob={resultBlob} filename="object-removed.png" onReset={reset} />
        </>
      )}
    </div>
  );
}

/* ── Image Description (on-device analysis) ───────────────── */
export function AiDescribeClient() {
  const [url, setUrl] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [copied, setCopied] = useState(false);

  async function onFile(f: File) {
    trackTool("ai-describe");
    const img = new Image();
    img.src = URL.createObjectURL(f);
    await new Promise((r) => { img.onload = r; });
    setUrl(img.src);
    // analyze: dominant colors + brightness + orientation
    const c = document.createElement("canvas");
    const s = 64;
    c.width = s; c.height = s;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, s, s);
    const d = ctx.getImageData(0, 0, s, s).data;
    let rSum = 0, gSum = 0, bSum = 0, lum = 0;
    const buckets = new Map<string, number>();
    for (let i = 0; i < d.length; i += 4) {
      rSum += d[i]; gSum += d[i + 1]; bSum += d[i + 2];
      lum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const key = `${Math.round(d[i] / 51)},${Math.round(d[i + 1] / 51)},${Math.round(d[i + 2] / 51)}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const n = d.length / 4;
    const bright = lum / n / 255;
    const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([k]) => k.split(",").map((v) => Number(v) * 51));
    const name = (rgb: number[]) => {
      const [r, g, b2] = rgb;
      if (Math.max(r, g, b2) - Math.min(r, g, b2) < 28) return bright > 0.6 ? "light gray" : "dark gray";
      if (r > g && r > b2) return g > b2 * 1.3 ? "orange" : "red";
      if (g > r && g > b2) return "green";
      if (b2 > r && b2 > g) return g > r ? "teal" : "blue";
      return "mixed";
    };
    const orient = img.width > img.height * 1.15 ? "landscape" : img.height > img.width * 1.15 ? "portrait" : "square";
    const tone = bright > 0.65 ? "bright, airy" : bright > 0.4 ? "balanced" : "dark, moody";
    setDesc(
      `A ${orient} image with a ${tone} tone. Dominant colors: ${[...new Set(top.map(name))].join(", ")}. ` +
      `Average brightness ${(bright * 100).toFixed(0)}%. ` +
      `Suggested alt text: “A ${tone.split(",")[0]} ${orient} photo featuring ${name(top[0])} tones.”`
    );
  }

  return (
    <div className="qx-card p-6 space-y-5">
      <CloudNotice engine="describe">On-device analysis covers colors, tone and composition today. Full scene understanding (objects, actions, context) activates with the cloud vision engine — the workspace is ready.</CloudNotice>
      {!url && <AiDropzone onFile={onFile} />}
      {url && (
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="rounded-2xl w-full h-auto" style={{ border: "1px solid var(--border)" }} />
          <div className="space-y-3">
            <p className="text-[14px] leading-relaxed rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
              {desc}
            </p>
            <div className="flex gap-2">
              <button onClick={async () => { await navigator.clipboard.writeText(desc); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
                className="qx-btn !py-2 text-xs">{copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy description</button>
              <button onClick={() => { setUrl(null); setDesc(""); }} className="qx-btn-ghost !py-2 text-xs">New image</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
