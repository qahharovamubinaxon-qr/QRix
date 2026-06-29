"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getRecentFiles, getPdfStats, addRecentFile, fmtSize, fmtAgo,
  type RecentFile, type PdfStats,
} from "@/lib/pdf-stats";
import {
  FiGrid, FiLink as FiLinkIcon, FiWifi, FiUser, FiImage, FiFileText,
  FiScissors, FiMinimize2, FiFile, FiType, FiRotateCw, FiLayers,
  FiShield, FiZap, FiCheckCircle, FiUploadCloud, FiArrowRight,
  FiChevronRight, FiHome, FiLock, FiUnlock, FiCheck,
  FiHash, FiDroplet, FiCopy, FiTrash2, FiEye, FiCrop,
} from "react-icons/fi";

type Tool = {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  grad: string;
  popularity: number;
  soon?: boolean;
};

const TOOLS: Tool[] = [
  { href: "/pdf-tools/merge", title: "Merge PDF", desc: "Combine multiple PDF files into a single PDF.", icon: <FiLayers size={20} />, grad: "linear-gradient(135deg,#4f46e5,#818cf8)", popularity: 100 },
  { href: "/pdf-tools/split", title: "Split PDF", desc: "Extract pages from your PDF or split into multiple files.", icon: <FiScissors size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)", popularity: 95 },
  { href: "/pdf-tools/compress", title: "Compress PDF", desc: "Reduce PDF file size without losing quality.", icon: <FiMinimize2 size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)", popularity: 90 },
  { href: "/pdf-tools/pdf-to-word", title: "PDF to Word", desc: "Convert PDF files to editable Word documents.", icon: <FiType size={20} />, grad: "linear-gradient(135deg,#2563eb,#60a5fa)", popularity: 85 },
  { href: "/pdf-tools/word-to-pdf", title: "Word to PDF", desc: "Convert Word documents to PDF files.", icon: <FiFileText size={20} />, grad: "linear-gradient(135deg,#1d4ed8,#3b82f6)", popularity: 80 },
  { href: "/pdf-tools/pdf-to-jpg", title: "PDF to JPG", desc: "Convert PDF pages to high-quality JPG images.", icon: <FiImage size={20} />, grad: "linear-gradient(135deg,#db2777,#f472b6)", popularity: 75 },
  { href: "/pdf-tools/jpg-to-pdf", title: "JPG to PDF", desc: "Convert images (JPG, PNG) to a single PDF file.", icon: <FiFile size={20} />, grad: "linear-gradient(135deg,#dc2626,#f87171)", popularity: 70 },
  { href: "/pdf-tools/rotate", title: "Rotate PDF", desc: "Rotate PDF pages to the correct orientation.", icon: <FiRotateCw size={20} />, grad: "linear-gradient(135deg,#0d9488,#2dd4bf)", popularity: 65 },
  { href: "/pdf-tools/reorder", title: "Reorder Pages", desc: "Rearrange pages in your PDF files.", icon: <FiGrid size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a78bfa)", popularity: 60 },
  { href: "/pdf-tools/page-numbers", title: "Add Page Numbers", desc: "Insert automatic page numbers in any position.", icon: <FiHash size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a78bfa)", popularity: 58 },
  { href: "/pdf-tools/watermark", title: "Add Watermark", desc: "Stamp text watermark across every page.", icon: <FiDroplet size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)", popularity: 55 },
  { href: "/pdf-tools/extract-pages", title: "Extract Pages", desc: "Pull selected pages into a new PDF.", icon: <FiCopy size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)", popularity: 52 },
  { href: "/pdf-tools/delete-pages", title: "Delete Pages", desc: "Remove unwanted pages from your PDF.", icon: <FiTrash2 size={20} />, grad: "linear-gradient(135deg,#dc2626,#f87171)", popularity: 48 },
  { href: "/pdf-tools/protect", title: "Protect PDF", desc: "Add password protection to your PDF files.", icon: <FiLock size={20} />, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", popularity: 44 },
  { href: "/pdf-tools/unlock", title: "Unlock PDF", desc: "Remove password protection from PDF files.", icon: <FiUnlock size={20} />, grad: "linear-gradient(135deg,#d97706,#fbbf24)", popularity: 42 },
  { href: "/pdf-tools/ocr", title: "OCR PDF", desc: "Recognize text from scanned PDFs (EN/RU/UZ).", icon: <FiEye size={20} />, grad: "linear-gradient(135deg,#ea580c,#fb923c)", popularity: 88 },
  { href: "/pdf-tools/pdf-to-text", title: "PDF to Text", desc: "Extract all selectable text as a .txt file.", icon: <FiType size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)", popularity: 76 },
  { href: "/pdf-tools/pdf-to-png", title: "PDF to PNG", desc: "Convert pages to high-res PNG images.", icon: <FiImage size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a78bfa)", popularity: 68 },
  { href: "/pdf-tools/crop", title: "Crop PDF", desc: "Trim page margins to focus on content.", icon: <FiCrop size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)", popularity: 50 },
];

const SIDE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome size={15} /> },
  { href: "/url-qr", label: "URL QR", icon: <FiLinkIcon size={15} /> },
  { href: "/wifi-qr", label: "WiFi QR", icon: <FiWifi size={15} /> },
  { href: "/vcard-qr", label: "vCard / NFC", icon: <FiUser size={15} /> },
];

export default function PdfToolsPage() {
  const router = useRouter();
  const [sort, setSort] = useState<"popular" | "az">("popular");
  const [recent, setRecent] = useState<RecentFile[]>([]);
  const [stats, setStats] = useState<PdfStats>({ files: 0, bytes: 0, seconds: 0 });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const load = () => {
      setRecent(getRecentFiles());
      setStats(getPdfStats());
    };
    load();
    window.addEventListener("qrix-pdf-update", load);
    return () => window.removeEventListener("qrix-pdf-update", load);
  }, []);

  const sorted = [...TOOLS].sort((a, b) =>
    sort === "popular" ? b.popularity - a.popularity : a.title.localeCompare(b.title)
  );

  /* Drop zone — файлни аниқлаб мос асбобга йўналтиради */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    addRecentFile({ name: f.name, size: f.size, tool: "Uploaded" });
    const name = f.name.toLowerCase();
    if (name.endsWith(".pdf")) router.push("/pdf-tools/compress");
    else if (name.endsWith(".doc") || name.endsWith(".docx")) router.push("/pdf-tools/word-to-pdf");
    else if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) router.push("/pdf-tools/jpg-to-pdf");
  };

  return (
    <div className="flex min-h-screen">
      {/* ===== Чап мини-сайдбар ===== */}
      <aside
        className="hidden lg:flex w-56 shrink-0 flex-col p-4 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
      >
        <nav className="space-y-1">
          {SIDE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="qx-navlink">
              {l.icon} {l.label}
            </Link>
          ))}
          <div className="pt-4">
            <h3 className="text-[10px] uppercase font-bold mb-2 px-2 tracking-[0.12em]" style={{ color: "var(--text-faint)" }}>
              PDF Tools
            </h3>
            <span className="qx-navlink active"><FiFileText size={15} /> PDF Tools</span>
          </div>
          <div className="pt-3">
            <h3 className="text-[10px] uppercase font-bold mb-2 px-2 tracking-[0.12em]" style={{ color: "var(--text-faint)" }}>
              Image Tools
            </h3>
            <Link href="/image-tools" className="qx-navlink"><FiImage size={15} /> Image Tools</Link>
          </div>
        </nav>

        <div className="rounded-2xl p-4 mt-auto" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7 60%,#6366f1)" }}>
          <div className="font-display font-bold text-white text-sm">🚀 Upgrade to Pro</div>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,.75)" }}>
            Unlock all features, remove limits.
          </p>
          <Link href="/register" className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold"
            style={{ background: "rgba(255,255,255,.95)", color: "#6d28d9" }}>
            <FiZap size={12} /> Upgrade Now
          </Link>
        </div>
      </aside>

      {/* ===== Контент ===== */}
      <main className="flex-1 min-w-0 p-5 lg:p-7 max-w-[1500px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">Dashboard</Link>
          <FiChevronRight size={12} />
          <span style={{ color: "var(--text)" }}>PDF Tools</span>
        </div>

        <div className="grid xl:grid-cols-[1fr_300px] gap-6 items-start">
          <div className="min-w-0">
            {/* ===== HERO ===== */}
            <div className="qx-card qx-rise p-7 lg:p-8 relative overflow-hidden">
              <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,.25), transparent 70%)" }} />
              {/* Декоратив карталар */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
                <div className="w-28 h-36 rounded-2xl rotate-12"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", opacity: .85, boxShadow: "0 20px 50px rgba(124,58,237,.4)" }} />
                <div className="w-28 h-36 rounded-2xl absolute top-0 -left-6 -rotate-6"
                  style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)", opacity: .6 }} />
              </div>

              <div className="relative flex items-start gap-5">
                <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#e11d48,#f43f5e)", boxShadow: "0 12px 32px rgba(225,29,72,.4)" }}>
                  <FiFileText size={28} />
                </span>
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>PDF Tools</h1>
                  <p className="mt-2 text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
                    Powerful &amp; easy-to-use PDF tools to merge, compress, convert, edit and protect your PDF files.
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                {[
                  { icon: <FiShield size={16} />, title: "100% Secure", sub: "Files are protected", color: "#a78bfa" },
                  { icon: <FiZap size={16} />, title: "Lightning Fast", sub: "Process in seconds", color: "#22d3ee" },
                  { icon: <FiCheckCircle size={16} />, title: "No Limits", sub: "Unlimited usage", color: "#34d399" },
                ].map((f) => (
                  <div key={f.title} className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in srgb, ${f.color} 14%, transparent)`, color: f.color }}>
                      {f.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{f.title}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== ALL TOOLS ===== */}
            <div className="flex items-center justify-between mt-8 mb-5">
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>All PDF Tools</h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Sort by:
                <select value={sort} onChange={(e) => setSort(e.target.value as "popular" | "az")}
                  className="!text-xs !py-1.5 !px-3 font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
                  <option value="popular">Most Popular</option>
                  <option value="az">A → Z</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {sorted.map((tool, i) => {
                const card = (
                  <div className={`qx-card qx-card-lift p-5 h-full relative ${tool.soon ? "opacity-60" : ""}`}>
                    {tool.soon && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-faint)" }}>
                        SOON
                      </span>
                    )}
                    <div className="flex items-start gap-3.5">
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: tool.grad, boxShadow: "0 6px 18px rgba(0,0,0,.25)" }}>
                        {tool.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{tool.title}</h3>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{tool.desc}</p>
                      </div>
                    </div>
                    {!tool.soon && (
                      <span className="absolute bottom-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5"
                        style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--primary-bright)" }}>
                        <FiArrowRight size={13} />
                      </span>
                    )}
                  </div>
                );
                return tool.soon ? (
                  <div key={tool.title} className={`qx-rise qx-rise-${(i % 4) + 1} cursor-not-allowed`} title="Coming soon">{card}</div>
                ) : (
                  <Link key={tool.title} href={tool.href} className={`group qx-rise qx-rise-${(i % 4) + 1}`}>{card}</Link>
                );
              })}
            </div>

            {/* ===== DROP ZONE ===== */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="mt-8 rounded-2xl p-10 text-center transition-all"
              style={{
                border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border-strong)"}`,
                background: dragOver ? "var(--surface-hover)" : "transparent",
              }}
            >
              <span className="w-12 h-12 rounded-xl inline-flex items-center justify-center mb-3"
                style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--primary-bright)" }}>
                <FiUploadCloud size={20} />
              </span>
              <p className="text-sm" style={{ color: "var(--text)" }}>
                Drop your PDF file here or{" "}
                <label className="font-bold cursor-pointer" style={{ color: "var(--primary-bright)" }}>
                  click to browse
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      addRecentFile({ name: f.name, size: f.size, tool: "Uploaded" });
                      const n = f.name.toLowerCase();
                      if (n.endsWith(".pdf")) router.push("/pdf-tools/compress");
                      else if (n.endsWith(".doc") || n.endsWith(".docx")) router.push("/pdf-tools/word-to-pdf");
                      else router.push("/pdf-tools/jpg-to-pdf");
                    }}
                  />
                </label>
              </p>
              <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
                Supports: PDF, DOC, DOCX, JPG, PNG (Max 100MB)
              </p>
            </div>
          </div>

          {/* ===== Ўнг панел ===== */}
          <div className="space-y-5">
            {/* Recent Files — реал */}
            <div className="qx-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>Recent Files</h3>
                <span className="qx-badge !text-[10px]">{recent.length}</span>
              </div>
              {recent.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>
                  No files yet — process a PDF and it will appear here
                </p>
              ) : (
                <div className="space-y-2.5">
                  {recent.slice(0, 5).map((f, i) => (
                    <div key={f.time + i} className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ background: "linear-gradient(135deg,#e11d48,#f43f5e)" }}>
                        <FiFileText size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{f.name}</div>
                        <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {fmtSize(f.size)} · {fmtAgo(f.time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pro card */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg,#1e1b4b,#4c1d95 60%,#6d28d9)", border: "1px solid rgba(139,92,246,.4)" }}>
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-30 rotate-12">🚀</div>
              <div className="text-lg font-display font-bold text-white">Go Pro. Do More.</div>
              <div className="mt-3 space-y-1.5">
                {["Unlimited file size", "Batch processing", "Advanced OCR", "No ads, always"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,.85)" }}>
                    <FiCheck size={12} style={{ color: "#34d399" }} /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-4 w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-bold transition hover:opacity-90"
                style={{ background: "#a855f7", color: "#fff" }}>
                Upgrade to Pro
              </Link>
            </div>

            {/* PDF Stats — реал */}
            <div className="qx-card p-5">
              <h3 className="font-display text-sm font-bold mb-4" style={{ color: "var(--text)" }}>Your PDF Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: String(stats.files), label: "Files Processed", color: "#a78bfa" },
                  { v: fmtSize(stats.bytes), label: "Total Saved", color: "#22d3ee" },
                  { v: `${(stats.seconds / 60).toFixed(1)} min`, label: "Time Spent", color: "#fbbf24" },
                  { v: stats.files > 0 ? "98%" : "—", label: "Success Rate", color: "#34d399" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl"
                    style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
                    <div className="font-display text-lg font-bold" style={{ color: s.color }}>{s.v}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-3" style={{ color: "var(--text-faint)" }}>
                These stats show your real PDF tool usage on this device.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
