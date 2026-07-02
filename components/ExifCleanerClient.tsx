"use client";

import { useState } from "react";
import { FiShield, FiCheck } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

export default function ExifCleanerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ before: number; after: number } | null>(null);

  const fmt = (b: number) => (b / 1024 / 1024 >= 1 ? (b / 1024 / 1024).toFixed(2) + " MB" : Math.round(b / 1024) + " KB");

  async function clean() {
    if (!file) return;
    const isPng = /png$/i.test(file.type) || /\.png$/i.test(file.name);
    const ext = isPng ? "png" : "jpg";
    const outName = file.name.replace(/\.[^.]+$/, "") + "-clean." + ext;
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setBusy(true);
    setDone(null);
    try {
      // Re-encoding through a canvas keeps only the pixels — EXIF, GPS,
      // camera info, timestamps and editing history are all dropped.
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b as Blob), isPng ? "image/png" : "image/jpeg", 0.95)
      );
      setBusy(false);
      trackTool("exif-clean");
      await finishSave(target, blob, outName);
      setDone({ before: file.size, after: blob.size });
    } catch (e) {
      setBusy(false);
      alert("Cleaning failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={(f) => { setFile(f); setDone(null); }} accept="image/*" />

      <div className="mt-4 rounded-xl p-3 text-[12px] leading-relaxed" style={{ background: "rgba(70,116,52,0.07)", border: "1px solid rgba(70,116,52,0.25)", color: "var(--text-muted)" }}>
        📵 Photos secretly carry <b style={{ color: "var(--text)" }}>GPS location, device model, date &amp; time</b> and editing history in their metadata.
        This tool re-encodes the image keeping only the pixels — all hidden metadata is stripped before you share it.
      </div>

      <button onClick={clean} disabled={!file || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {busy ? "Cleaning…" : <><FiShield size={15} /> Remove metadata &amp; download</>}
      </button>

      {done && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(70,116,52,0.1)", border: "1px solid rgba(70,116,52,0.3)" }}>
          <div className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: "var(--success)" }}><FiCheck size={13} /> Metadata removed</div>
          <div className="text-[12px] mt-1.5" style={{ color: "var(--text-muted)" }}>
            {fmt(done.before)} → <b style={{ color: "var(--text)" }}>{fmt(done.after)}</b> · GPS, camera and timestamp data are gone. Safe to share.
          </div>
        </div>
      )}
    </div>
  );
}
