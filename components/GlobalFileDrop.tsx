"use client";

import { useEffect, useState } from "react";

/* ============================================================
   Drop a file anywhere on a tool page → it is routed to that
   page's file <input>. One component covers every PDF / image
   tool (mounted inside ToolPageShell).
   Tools that already handle their own drop call preventDefault,
   so we skip those to avoid double-adding.
   ============================================================ */

function accepts(accept: string, file: File): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept.split(",").map((s) => s.trim().toLowerCase()).some((p) =>
    !p || (p.startsWith(".") ? name.endsWith(p) : p.endsWith("/*") ? type.startsWith(p.slice(0, -1)) : type === p)
  );
}

export default function GlobalFileDrop() {
  const [over, setOver] = useState(false);

  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => !!e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");

    const onDragOver = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault(); };
    const onDragEnter = (e: DragEvent) => { if (hasFiles(e)) { depth++; setOver(true); } };
    const onDragLeave = () => { depth = Math.max(0, depth - 1); if (depth === 0) setOver(false); };

    const onDrop = (e: DragEvent) => {
      depth = 0; setOver(false);
      if (e.defaultPrevented) return; // a local dropzone already handled it
      const files = e.dataTransfer?.files;
      if (!files || !files.length) return;
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]')).filter((i) => !i.disabled);
      if (!inputs.length) return;
      e.preventDefault();

      const first = files[0];
      const input = inputs.find((i) => accepts(i.accept, first)) || inputs[0];
      const dt = new DataTransfer();
      const matching = Array.from(files).filter((f) => accepts(input.accept, f));
      const chosen = matching.length ? matching : Array.from(files);
      for (const f of chosen) { dt.items.add(f); if (!input.multiple) break; }
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!over) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(245,143,32,0.12)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ padding: "18px 28px", borderRadius: 16, background: "var(--surface-solid)", border: "2px dashed #F58F20", fontWeight: 800, color: "var(--text)", boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
        ⬇️ Drop your file to upload
      </div>
    </div>
  );
}
