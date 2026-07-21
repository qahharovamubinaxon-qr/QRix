import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd } from "@/lib/seo";
import { CONVERT_PAIRS, pairGrad, type ConvertPair } from "@/lib/convert-pairs";

export const metadata = pageMeta({
  title: "Free Image Converter — 26 Format Pairs, No Upload",
  description:
    "Convert between PNG, JPG, WebP, AVIF, BMP, GIF, ICO and TIFF for free. Every conversion runs in your browser — no upload, no signup, no watermark.",
  path: "/convert",
  keywords: ["image converter", "convert image format", "png to jpg", "webp converter", "avif converter", "tiff converter", "free image converter online"],
});

/** Group by target format so visitors scan by "what do I want out of this?".
    Every target format in CONVERT_PAIRS must be listed or its pages get no
    link from the hub. */
const ORDER = ["JPG", "PNG", "WebP", "AVIF", "TIFF", "BMP", "ICO"];
// any target ORDER forgets still gets a section, appended at the end
const TARGETS = [...new Set([...ORDER, ...CONVERT_PAIRS.map((p) => p.to)])];
const byTarget = TARGETS.map((to) => ({ to, pairs: CONVERT_PAIRS.filter((p) => p.to === to) }))
  .filter((g) => g.pairs.length > 0);

function PairCard({ p }: { p: ConvertPair }) {
  return (
    <Link href={`/convert/${p.slug}`} className="qx-card p-4 flex items-center gap-3 transition-opacity hover:opacity-85">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: pairGrad(p) }}>
        {p.emoji}
      </span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{p.from} to {p.to}</div>
        <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{p.from} → {p.to} converter</div>
      </div>
    </Link>
  );
}

export default function ConvertHubPage() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Convert", path: "/convert" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Image format converters",
            itemListElement: CONVERT_PAIRS.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${p.from} to ${p.to}`,
              url: `https://qrixtools.com/convert/${p.slug}`,
            })),
          },
        ])} />

      <main className="max-w-6xl mx-auto p-5 lg:p-8">
        <nav className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-80">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/image-tools" className="hover:opacity-80">Image Tools</Link>
          <span className="mx-1.5">›</span>
          <span style={{ color: "var(--text)" }}>Convert</span>
        </nav>

        <header className="qx-card qx-rise p-7 mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>
            Image format converter
          </h1>
          <p className="mt-2.5 text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Pick the exact conversion you need. Every one runs entirely in your browser using the Canvas
            API — your files are never uploaded, there's no signup, and nothing is watermarked.
          </p>
          <p className="qx-mono text-[10.5px] uppercase tracking-[0.14em] mt-3" style={{ color: "var(--text-faint)" }}>
            {CONVERT_PAIRS.length} converters · free forever · no upload
          </p>
        </header>

        {byTarget.map((g) => (
          <section key={g.to} className="mb-8">
            <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Convert to {g.to}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.pairs.map((p) => <PairCard key={p.slug} p={p} />)}
            </div>
          </section>
        ))}

        <section className="qx-card p-6 mt-2">
          <h2 className="qx-title mb-3" style={{ color: "var(--text)" }}>Which format should you choose?</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <p><b style={{ color: "var(--text)" }}>JPG</b> — photographs and anything that has to be accepted everywhere. Lossy, no transparency, universally supported.</p>
            <p><b style={{ color: "var(--text)" }}>PNG</b> — screenshots, logos and line art. Lossless with full transparency, but larger files.</p>
            <p><b style={{ color: "var(--text)" }}>WebP</b> — the practical default for the web. Roughly 30% smaller than JPG, keeps transparency, supported by every current browser.</p>
            <p><b style={{ color: "var(--text)" }}>AVIF</b> — the smallest files available today, often half of JPG. Slower to encode; serve with a fallback.</p>
            <p><b style={{ color: "var(--text)" }}>BMP</b> — uncompressed raw pixels for legacy Windows software, embedded displays and imaging pipelines.</p>
            <p><b style={{ color: "var(--text)" }}>ICO</b> — Windows icons and browser favicons served at /favicon.ico.</p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link href="/image-tools" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            All image tools →
          </Link>
          <Link href="/image-tools/compress" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            Compress an image →
          </Link>
          <Link href="/image-tools/resize" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            Resize an image →
          </Link>
        </div>
      </main>
    </>
  );
}
