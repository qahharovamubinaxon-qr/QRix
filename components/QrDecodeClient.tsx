"use client";

import { useState } from "react";
import Link from "next/link";
import { FiSearch, FiCopy, FiCheck, FiExternalLink } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { trackTool } from "@/lib/track";

/* eslint-disable @next/next/no-img-element */

type Decoded = { text: string; kind: string; hint?: string };

function classify(text: string): Decoded {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return { text: t, kind: "🔗 Website link" };
  if (/^WIFI:/i.test(t)) {
    const ssid = (t.match(/S:([^;]*)/) || [])[1];
    const pass = (t.match(/P:([^;]*)/) || [])[1];
    return { text: t, kind: "📶 WiFi network", hint: `SSID: ${ssid || "?"}${pass ? ` · Password: ${pass}` : ""}` };
  }
  if (/^BEGIN:VCARD/i.test(t)) {
    const name = (t.match(/FN:(.*)/) || [])[1];
    return { text: t, kind: "🪪 Contact card (vCard)", hint: name ? `Name: ${name.trim()}` : undefined };
  }
  if (/^mailto:/i.test(t)) return { text: t, kind: "📧 Email address" };
  if (/^tel:/i.test(t)) return { text: t, kind: "📞 Phone number" };
  if (/^SMSTO:/i.test(t)) return { text: t, kind: "💬 SMS message" };
  if (/^bitcoin:|^ethereum:/i.test(t)) return { text: t, kind: "🪙 Crypto payment" };
  if (/^BEGIN:VEVENT/i.test(t)) return { text: t, kind: "📅 Calendar event" };
  if (/^geo:/i.test(t)) return { text: t, kind: "📍 Location" };
  return { text: t, kind: "📝 Plain text" };
}

export default function QrDecodeClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Decoded | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onFile(f: File | null) {
    setFile(f); setResult(null); setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
    if (!f) return;
    setBusy(true);
    try {
      const jsQR = (await import("jsqr")).default;
      const img = await loadImage(f);
      // try a few scales — small/large photos both decode better at ~1000px
      const sizes = [1000, 600, 1600];
      let found: string | null = null;
      for (const target of sizes) {
        const scale = Math.min(1, target / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h);
        const code = jsQR(data.data, w, h, { inversionAttempts: "attemptBoth" });
        if (code?.data) { found = code.data; break; }
      }
      if (found) {
        setResult(classify(found));
        trackTool("qr-decode", { ok: true });
      } else {
        setError("No QR code found in this image. Try a sharper, closer photo with the full code visible.");
      }
    } catch (e) {
      setError("Could not read the image: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isLink = result && /^https?:\/\//i.test(result.text);

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={onFile} accept="image/*" />

      {busy && <p className="text-[12px] mt-3 text-center" style={{ color: "var(--primary-bright)" }}>🔍 Scanning image…</p>}
      {error && <p className="text-[13px] mt-4 px-3 py-2.5 rounded-lg" style={{ color: "#fca5a5", background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.25)" }}>{error}</p>}

      {preview && (
        <div className="mt-4 flex justify-center">
          <img src={preview} alt="uploaded" className="max-h-44 rounded-xl" style={{ border: "1px solid var(--border)" }} />
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(70,116,52,0.08)", border: "1px solid rgba(70,116,52,0.3)" }}>
          <div className="text-[12px] font-bold mb-1" style={{ color: "var(--success)" }}>✅ Decoded — {result.kind}</div>
          {result.hint && <div className="text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>{result.hint}</div>}
          <div className="text-[13px] break-all font-mono p-2.5 rounded-lg" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            {result.text}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={copy} className="qx-btn !text-xs !py-2">{copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy</button>
            {isLink && (
              <a href={result.text} target="_blank" rel="noopener noreferrer" className="qx-btn-ghost !text-xs !py-2">
                <FiExternalLink size={13} /> Open link
              </a>
            )}
            <Link href="/" className="qx-btn-ghost !text-xs !py-2"><FiSearch size={13} /> Create your own QR</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function loadImage(f: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
