"use client";

import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

/* Live preview + copy-to-clipboard iframe snippet for the QRix downloader
   widget. Every embed is a backlink and a referral funnel. */
export default function EmbedSnippet({ base }: { base: string }) {
  const [copied, setCopied] = useState(false);
  const src = `${base}/embed/downloader`;
  const code = `<iframe src="${src}" width="100%" height="420" style="border:0;border-radius:16px;max-width:560px" loading="lazy" title="QRix Downloader"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="qx-card p-5">
      {/* code box */}
      <div className="relative">
        <pre className="qx-mono text-[11.5px] leading-relaxed overflow-x-auto rounded-xl p-4 pr-14"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
          <code>{code}</code>
        </pre>
        <button onClick={copy} aria-label="Copy embed code"
          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
          style={{ background: copied ? "rgba(34,197,94,.15)" : "var(--primary-dim, rgba(255,77,28,.14))", color: copied ? "#22c55e" : "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>
          {copied ? <><FiCheck size={13} /> Copied</> : <><FiCopy size={13} /> Copy</>}
        </button>
      </div>

      {/* live preview */}
      <div className="mt-5">
        <div className="qx-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--text-faint)" }}>Live preview</div>
        <iframe src={src} width="100%" height={420} loading="lazy" title="QRix Downloader preview"
          style={{ border: 0, borderRadius: 16, maxWidth: 560 }} />
      </div>
    </div>
  );
}
