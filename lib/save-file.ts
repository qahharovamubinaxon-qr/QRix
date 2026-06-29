/* Save a Blob letting the user choose location + filename when the browser
   supports the File System Access API (Chromium: Chrome, Edge, Yandex…).
   Falls back to a normal download elsewhere. */

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  zip: "application/zip",
  txt: "text/plain",
};

export async function saveBlob(blob: Blob, suggestedName: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (typeof w.showSaveFilePicker === "function") {
    try {
      const ext = (suggestedName.split(".").pop() || "").toLowerCase();
      const handle = await w.showSaveFilePicker({
        suggestedName,
        types: ext
          ? [{ description: `${ext.toUpperCase()} file`, accept: { [MIME[ext] || "application/octet-stream"]: ["." + ext] } }]
          : undefined,
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      // user cancelled the picker → do nothing
      if (e && (e as DOMException).name === "AbortError") return;
      // otherwise fall through to the download fallback
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = suggestedName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
