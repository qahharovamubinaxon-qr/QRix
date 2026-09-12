"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUploadCloud, FiDownload, FiGrid, FiArrowLeft, FiZap } from "react-icons/fi";
import { pickSave, finishSave } from "@/lib/save-file";
import { jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";

/* Google Search Console (14 Jul – 10 Sep 2026) has this page on "bulk qr code
   generator" at position 70.3 with 45 impressions and "bulk qr code" at 68.6 —
   its best non-brand ranking after the QR type pages, and the closest thing the
   site has to a reachable page-1 target. It was also its thinnest: 479 words
   against ~1,800 on the sibling /qr-tools/* pages, no FAQ, no structured data,
   and an H1 ("Bulk QR Generator") missing the word the query actually uses.
   Everything below is what the tool genuinely does — 512×512 PNG, error
   correction H, styled and zipped in the browser — and nothing it does not. */

const STEPS: [string, string][] = [
  ["Paste your links", "One per line, or upload a .csv/.txt list. Anything a QR code can hold works — URLs, plain text, phone numbers."],
  ["Name the files (optional)", "Add a comma and a filename after a link: https://example.com, product-01. Without it the codes are numbered."],
  ["Pick a style", "Choose a dot shape and colour; every code in the batch uses it, so a run stays visually consistent."],
  ["Download the ZIP", "Each code is written as a 512×512 PNG and the whole batch arrives as one .zip."],
];

const FAQS = [
  {
    q: "How many QR codes can I generate at once?",
    a: "There is no fixed limit. The codes are generated one by one in your browser with a progress bar, so the practical ceiling is your device's memory rather than a quota. A few thousand rows is routine; very large runs are simply slower.",
  },
  {
    q: "What format does the CSV need?",
    a: "One entry per line: the link, then optionally a comma and the filename you want — for example \"https://example.com, product-01\". A plain .txt file with one link per line works too.",
  },
  {
    q: "What size are the generated QR codes?",
    a: "Each code is a 512×512 pixel PNG on a white background, generated at error-correction level H — the highest of the four, which keeps a code readable even when part of it is dirty, creased or covered.",
  },
  {
    q: "Are my links uploaded to a server?",
    a: "No. The list never leaves your device: the codes are drawn and zipped in your browser, so a batch of private or unreleased URLs stays private.",
  },
  {
    q: "Do these QR codes expire?",
    a: "No. These are static QR codes — the link is encoded in the image itself, so there is nothing to renew and nothing that can be switched off. The trade-off is that a static code cannot be re-pointed later; for that you need a dynamic code.",
  },
  {
    q: "Is it free, and can I use the codes commercially?",
    a: "Yes to both. No signup, no watermark and no limit on how the codes are used — printed on packaging, menus, labels or badges.",
  },
  {
    q: "Can I add a logo to every code?",
    a: "Not in the bulk tool — it applies a shared dot style and colour to the whole batch. For a logo in the middle of the code, generate it individually with the QR code generator.",
  },
];

type Row = { data: string; name: string };

const DOT_TYPES = ["rounded", "square", "dots", "classy", "extra-rounded"] as const;

export default function BulkQRPage() {
  const [raw, setRaw] = useState("");
  const [color, setColor] = useState("#0e0e0e");
  const [dot, setDot] = useState<(typeof DOT_TYPES)[number]>("rounded");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  const rows = parseRows(raw);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result || ""));
    reader.readAsText(f);
  };

  async function makeStyling(data: string, size: number) {
    const mod = await import("qr-code-styling");
    const QRCodeStyling = mod.default;
    return new QRCodeStyling({
      width: size,
      height: size,
      type: "canvas",
      data,
      margin: 8,
      qrOptions: { errorCorrectionLevel: "H" },
      dotsOptions: { type: dot, color },
      cornersSquareOptions: { type: "extra-rounded", color },
      cornersDotOptions: { type: "dot", color },
      backgroundOptions: { color: "#ffffff" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  const preview = async () => {
    const sample = rows.slice(0, 8);
    const urls: string[] = [];
    for (const r of sample) {
      const qr = await makeStyling(r.data, 140);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = (await (qr as any).getRawData("png")) as Blob | null;
      if (blob) urls.push(URL.createObjectURL(blob));
    }
    setPreviews(urls);
  };

  const generateZip = async () => {
    if (!rows.length) return;
    const target = await pickSave("qrix-bulk-qr.zip");
    if (target.kind === "cancelled") return;
    setBusy(true);
    setProgress(0);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Set<string>();

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const qr = await makeStyling(r.data, 512);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = (await (qr as any).getRawData("png")) as Blob | null;
        if (blob) {
          let name = sanitize(r.name) || `qr-${i + 1}`;
          let n = name; let k = 1;
          while (used.has(n)) n = `${name}-${k++}`;
          used.add(n);
          zip.file(`${n}.png`, blob);
        }
        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      const out = await zip.generateAsync({ type: "blob" });
      await finishSave(target, out, "qrix-bulk-qr.zip");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-[980px] mx-auto px-5 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
        <FiArrowLeft size={14} /> Back to home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,143,32,0.15)", color: "#F58F20" }}>
          <FiGrid size={20} />
        </span>
        <h1 className="font-display text-[28px] font-extrabold" style={{ color: "var(--text)" }}>Bulk QR Code Generator</h1>
      </div>
      <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)" }}>
        Paste links (one per line) or upload a CSV/TXT, then download all QR codes as a ZIP.
        Format: <code style={{ color: "var(--primary)" }}>link, optional-filename</code>
      </p>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Input */}
        <div className="qx-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold" style={{ color: "var(--text)" }}>Links</span>
            <label className="qx-btn-ghost !text-xs cursor-pointer">
              <FiUploadCloud size={13} /> Upload CSV/TXT
              <input type="file" accept=".csv,.txt" onChange={onFile} className="hidden" />
            </label>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={12}
            placeholder={"https://example.com/page-1, homepage\nhttps://example.com/page-2, promo\nhttps://example.com/page-3"}
            className="qx-auth-input font-mono !text-[12px]"
            style={{ resize: "vertical" }}
          />
          <div className="mt-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
            <b style={{ color: "var(--primary)" }}>{rows.length}</b> QR code{rows.length === 1 ? "" : "s"} ready
          </div>
        </div>

        {/* Options */}
        <div className="qx-card p-5 space-y-5 h-max">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Dot style</div>
            <div className="grid grid-cols-2 gap-2">
              {DOT_TYPES.map((d) => (
                <button key={d} onClick={() => setDot(d)}
                  className="py-2 rounded-lg text-[11px] font-bold capitalize transition-all"
                  style={{ background: dot === d ? "#F58F20" : "var(--surface-2)", color: dot === d ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${dot === d ? "transparent" : "var(--border)"}` }}>
                  {d.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Color</div>
            <div className="flex flex-wrap items-center gap-2">
              {["#0e0e0e", "#F58F20", "#467434", "#7c3aed", "#2563eb"].map((c) => (
                <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-lg"
                  style={{ background: c, border: color === c ? "2px solid #F58F20" : "1px solid var(--border)" }} />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
            </div>
          </div>

          <button onClick={preview} disabled={!rows.length} className="qx-btn-ghost w-full !py-2.5 text-sm disabled:opacity-40">
            <FiZap size={14} /> Preview
          </button>
          <button onClick={generateZip} disabled={busy || !rows.length} className="qx-btn-hero w-full disabled:opacity-50">
            {busy ? `Generating… ${progress}%` : <><FiDownload size={15} /> Download ZIP</>}
          </button>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-8">
          <div className="text-[12px] font-bold mb-3" style={{ color: "var(--text)" }}>Preview (first {previews.length})</div>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`qr-${i}`} className="w-24 h-24 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }} />
            ))}
          </div>
        </div>
      )}

      {/* Everything below the tool: the tool itself stays first so a visitor who
          came to make codes is never made to scroll past prose to reach it. */}
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Bulk QR Code Generator", "Turn a list or CSV into hundreds of QR codes and download them as a ZIP, generated in your browser.", "/bulk-qr"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "QR Tools", path: "/qr-tools" }, { name: "Bulk QR Code Generator" }]),
          howToLd("Generate QR codes in bulk", "Turn a list of links into a ZIP of QR code images.", "/bulk-qr", STEPS),
          faqLd(FAQS),
        ])} />

      <section className="mt-12" aria-labelledby="how">
        <h2 id="how" className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>How to generate QR codes in bulk</h2>
        <ol className="space-y-3">
          {STEPS.map(([title, desc], i) => (
            <li key={title} id={`step-${i + 1}`} className="flex gap-3 text-[13.5px]">
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: "var(--primary)", color: "#fff" }}>{i + 1}</span>
              <div>
                <div className="font-bold" style={{ color: "var(--text)" }}>{title}</div>
                <div style={{ color: "var(--text-muted)" }}>{desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <div className="qx-card p-6">
          <h2 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text)" }}>What you get</h2>
          <ul className="space-y-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>
            <li>· One <strong style={{ color: "var(--text)" }}>512×512 PNG</strong> per row, all in a single .zip.</li>
            <li>· <strong style={{ color: "var(--text)" }}>Error correction level H</strong> — the highest — so a code still scans when it is creased, smudged or partly covered.</li>
            <li>· Your own dot shape and colour applied across the whole batch, on a white background that prints cleanly.</li>
            <li>· Your chosen filenames, so a row lands as <code>product-01.png</code> rather than a number you have to match up later.</li>
          </ul>
        </div>
        <div className="qx-card p-6">
          <h2 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text)" }}>When bulk beats one at a time</h2>
          <ul className="space-y-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>
            <li>· <strong style={{ color: "var(--text)" }}>Product labels &amp; inventory</strong> — one code per SKU, named after the SKU.</li>
            <li>· <strong style={{ color: "var(--text)" }}>Event badges &amp; tickets</strong> — a unique code per attendee from an exported list.</li>
            <li>· <strong style={{ color: "var(--text)" }}>Menus and table tents</strong> — a code per table or per branch.</li>
            <li>· <strong style={{ color: "var(--text)" }}>Campaign links</strong> — one code per UTM-tagged URL, so print and digital report separately.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="faq">
        <h2 id="faq" className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Bulk QR code generator FAQs</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="qx-card p-4">
              <summary className="font-bold text-[13.5px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
              <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-label="Related tools">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Related QR tools</h2>
        <div className="flex flex-wrap gap-2.5">
          {[
            { href: "/qr-tools/url", label: "Single QR code generator (with logo)" },
            { href: "/qr-tools", label: "All 30+ QR code types" },
            { href: "/qr-tools/wifi", label: "WiFi QR code" },
            { href: "/qr-tools/vcard", label: "vCard QR code" },
            { href: "/poster", label: "QR poster maker" },
            { href: "/qr-tools/decode", label: "QR code reader" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function parseRows(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [data, ...rest] = line.split(",");
      return { data: data.trim(), name: rest.join(",").trim() };
    })
    .filter((r) => r.data);
}

function sanitize(s: string): string {
  return s.replace(/[^\w.-]+/g, "_").slice(0, 60);
}
