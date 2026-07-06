/* Let the user choose location + filename via the File System Access API
   (Chromium: Chrome, Edge, Yandex…), falling back to a normal download.

   IMPORTANT: showSaveFilePicker needs "transient user activation" — it must be
   called right after the click, before any long async work. So the picker is
   requested FIRST with pickSave(), then the bytes are written with finishSave()
   once they're ready. */

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  zip: "application/zip",
  txt: "text/plain",
};

export type SaveTarget =
  | { kind: "handle"; handle: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  | { kind: "download" }
  | { kind: "cancelled" };

/** Ask the user where to save (call this synchronously in the click handler). */
export async function pickSave(suggestedName: string): Promise<SaveTarget> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (typeof w.showSaveFilePicker === "function") {
    try {
      const ext = (suggestedName.split(".").pop() || "").toLowerCase();
      const handle = await w.showSaveFilePicker({
        suggestedName,
        types: ext ? [{ description: `${ext.toUpperCase()} file`, accept: { [MIME[ext] || "application/octet-stream"]: ["." + ext] } }] : undefined,
      });
      return { kind: "handle", handle };
    } catch (e) {
      if (e && (e as DOMException).name === "AbortError") return { kind: "cancelled" };
      return { kind: "download" };
    }
  }
  return { kind: "download" };
}

/** Write the blob to the chosen target (or download as fallback). */
export async function finishSave(target: SaveTarget, blob: Blob, suggestedName: string): Promise<void> {
  if (target.kind === "cancelled") return;
  if (target.kind === "handle") {
    try {
      const ws = await target.handle.createWritable();
      await ws.write(blob);
      await ws.close();
      return;
    } catch {
      /* fall through to download */
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = suggestedName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Convenience: pick + write in one call (use only for instant/cheap blobs). */
export async function saveBlob(blob: Blob, suggestedName: string): Promise<void> {
  const t = await pickSave(suggestedName);
  await finishSave(t, blob, suggestedName);
  if (t.kind !== "cancelled") {
    try {
      const { logJob } = await import("@/lib/user-prefs");
      const tool = typeof document !== "undefined" ? (document.querySelector("h1")?.textContent || "QRix") : "QRix";
      logJob({ tool, file: suggestedName, href: typeof location !== "undefined" ? location.pathname : undefined, status: "done" });
      const { toast } = await import("@/lib/toast");
      toast.success(`Downloaded ${suggestedName}`);
    } catch { /* non-blocking */ }
  }
}
