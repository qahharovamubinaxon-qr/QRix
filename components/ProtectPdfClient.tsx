"use client";

import { useState } from "react";
import { loadCantooPdfLib } from "@/lib/pdf-lib-loader";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiDownload, FiFile, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function ProtectPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    try {
      const { PDFDocument } = await loadCantooPdfLib();
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(null);
      alert("Could not read this PDF. It may already be password-protected.");
    }
  }

  async function run() {
    if (!file || !password) return;
    if (password.length < 4) { alert("Password must be at least 4 characters."); return; }
    if (password !== confirm) { alert("Passwords do not match."); return; }

    setLoading(true);
    setDone(false);
    const start = Date.now();
    try {
      const { PDFDocument } = await loadCantooPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      await pdf.encrypt({ userPassword: password, ownerPassword: password });
      const out = await pdf.save();
      const ab = new ArrayBuffer(out.byteLength);
      new Uint8Array(ab).set(out);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + "-protected.pdf";
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: "Protect PDF" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Error protecting PDF. The file may already be encrypted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-7 max-w-2xl">
      <label className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer"
        style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}>
        <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{file ? file.name : "Choose a PDF file"}</span>
        {pageCount !== null && <span className="qx-badge"><FiFile size={11} /> {pageCount} pages</span>}
        <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </label>

      {file && (
        <>
          <div className="mt-6">
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Password</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Enter a password (min 4 chars)"
                className="w-full px-4 py-3 text-sm rounded-xl pr-11"
                style={{ background: "var(--surface-hover)", border: "1.5px solid var(--border-strong)", color: "var(--text)" }}
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Confirm password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="Re-enter the password"
              className="w-full px-4 py-3 text-sm rounded-xl"
              style={{ background: "var(--surface-hover)", border: "1.5px solid var(--border-strong)", color: "var(--text)" }}
            />
            {confirm && password !== confirm && (
              <p className="text-[11px] mt-1.5" style={{ color: "var(--danger)" }}>Passwords do not match</p>
            )}
          </div>

          <button onClick={run} disabled={loading || !password || password !== confirm} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-50">
            <FiLock size={15} /> {loading ? "Protecting..." : "Protect & Download"}
          </button>
          {done && (
            <p className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>
              ✓ Done! Your PDF is now password-protected.
            </p>
          )}
          <p className="text-[11px] mt-3 text-center" style={{ color: "var(--text-faint)" }}>
            🔒 Encryption happens in your browser — your file and password never leave your device.
          </p>
        </>
      )}
    </div>
  );
}
