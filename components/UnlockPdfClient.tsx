"use client";

import { useState } from "react";
import { PDFDocument } from "@cantoo/pdf-lib";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiUnlock, FiFile, FiEye, FiEyeOff } from "react-icons/fi";

export default function UnlockPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    setWrong(false);
  }

  async function run() {
    if (!file || !password) return;
    setLoading(true);
    setDone(false);
    setWrong(false);
    const start = Date.now();
    try {
      // Паролни бериб очамиз, кейин паролсиз сақлаймиз
      const pdf = await PDFDocument.load(await file.arrayBuffer(), { password });
      const out = await pdf.save();
      const ab = new ArrayBuffer(out.byteLength);
      new Uint8Array(ab).set(out);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf";
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: "Unlock PDF" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      setWrong(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-7 max-w-2xl">
      <label className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer"
        style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}>
        <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{file ? file.name : "Choose a protected PDF"}</span>
        {file && <span className="qx-badge"><FiFile size={11} /> {(file.size / 1024).toFixed(0)} KB</span>}
        <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </label>

      {file && (
        <>
          <div className="mt-6">
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Current password</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setWrong(false); }}
                type={show ? "text" : "password"}
                placeholder="Enter the PDF's password"
                className="w-full px-4 py-3 text-sm rounded-xl pr-11"
                style={{ background: "var(--surface-hover)", border: `1.5px solid ${wrong ? "var(--danger)" : "var(--border-strong)"}`, color: "var(--text)" }}
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {wrong && (
              <p className="text-[11px] mt-1.5" style={{ color: "var(--danger)" }}>
                ❌ Wrong password, or this file isn't encrypted. Try again.
              </p>
            )}
          </div>

          <button onClick={run} disabled={loading || !password} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-50">
            <FiUnlock size={15} /> {loading ? "Unlocking..." : "Unlock & Download"}
          </button>
          {done && (
            <p className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>
              ✓ Done! Password removed — the PDF opens without a password now.
            </p>
          )}
          <p className="text-[11px] mt-3 text-center" style={{ color: "var(--text-faint)" }}>
            🔒 Only use this on PDFs you own or have permission to unlock.
          </p>
        </>
      )}
    </div>
  );
}
