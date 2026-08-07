"use client";

import dynamic from "next/dynamic";
import { FiUploadCloud } from "react-icons/fi";

/* The scanner is canvas work and cannot render on the server, so it is loaded
   on the client — but the fallback is real markup, not a spinner. That is the
   M147 lesson: a `loading` fallback IS in the server HTML, and a crawler that
   finds only "Loading…" reads the page as an article about a tool rather than a
   tool. The input is disabled because nothing listens to it until the engine
   mounts, and a file chosen before then would be silently dropped. */
const DocScanClient = dynamic(() => import("@/components/scan/DocScanClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl p-10 text-center" style={{ border: "2px dashed var(--border-glass)", background: "var(--surface)" }} aria-busy="true">
      <span className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>
        <FiUploadCloud size={24} />
      </span>
      <label htmlFor="doc-scan-file" className="block font-bold text-[15px]" style={{ color: "var(--text)" }}>
        Photo of the document
      </label>
      <input id="doc-scan-file" type="file" accept="image/*" disabled
        aria-describedby="doc-scan-busy" className="mx-auto mt-3 block text-[12px]" style={{ color: "var(--text-faint)" }} />
      <p className="text-[12px] mt-3" style={{ color: "var(--text-faint)" }}>
        JPG, PNG or HEIC · processed on your device
      </p>
      <p id="doc-scan-busy" className="text-[11px] mt-3 qx-mono" style={{ color: "var(--text-faint)" }} role="status">
        Preparing the scanner…
      </p>
    </div>
  ),
});

export default function DocScanLoader() {
  return <DocScanClient />;
}
