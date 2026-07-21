import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd } from "@/lib/seo";
import { RESIZE_PRESETS, presetGrad, type ResizePreset } from "@/lib/resize-presets";

export const metadata = pageMeta({
  title: "Resize an Image to Any Size — Free Preset Resizer",
  description:
    "Resize a photo to an exact pixel size — 1920x1080, 4K, square, passport, A4 and more. Every preset runs in your browser: no upload, no signup, no watermark.",
  path: "/resize",
  keywords: ["image resizer", "resize image to exact size", "photo size presets", "1920x1080 resizer", "passport photo size", "free image resizer online"],
});

/** Grouped by what the size is *for*, so visitors scan by intent. */
const GROUPS: { key: ResizePreset["group"]; title: string; blurb: string }[] = [
  { key: "Display", title: "Screens & wallpapers", blurb: "Standard display resolutions for wallpapers, slides and video backgrounds." },
  { key: "Web", title: "Web & social", blurb: "Squares, avatars and link-preview cards sized for the places they'll be shown." },
  { key: "Print", title: "Print sizes", blurb: "Photo and paper sizes at the full 300 DPI print shops ask for." },
  { key: "ID", title: "ID & passport", blurb: "Official document photo dimensions — check your country's composition rules too." },
];

function PresetCard({ p }: { p: ResizePreset }) {
  return (
    <Link href={`/resize/${p.slug}`} className="qx-card p-4 flex items-center gap-3 transition-opacity hover:opacity-85">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: presetGrad(p) }}>
        {p.emoji}
      </span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{p.w}×{p.h}</div>
        <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{p.label}</div>
      </div>
    </Link>
  );
}

export default function ResizeHubPage() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Resize", path: "/resize" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Image resize presets",
            itemListElement: RESIZE_PRESETS.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `Resize to ${p.w}x${p.h}`,
              url: `https://qrixtools.com/resize/${p.slug}`,
            })),
          },
        ])} />

      <main className="max-w-6xl mx-auto p-5 lg:p-8">
        <nav className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-80">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/image-tools" className="hover:opacity-80">Image Tools</Link>
          <span className="mx-1.5">›</span>
          <span style={{ color: "var(--text)" }}>Resize</span>
        </nav>

        <header className="qx-card qx-rise p-7 mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>
            Resize an image to an exact size
          </h1>
          <p className="mt-2.5 text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Pick the size you actually need and the crop is handled for you — fill to cover the frame,
            or fit to keep the whole image on a background colour you choose. Everything runs in your
            browser, so nothing is uploaded, and nothing is watermarked.
          </p>
          <p className="qx-mono text-[10.5px] uppercase tracking-[0.14em] mt-3" style={{ color: "var(--text-faint)" }}>
            {RESIZE_PRESETS.length} presets · free forever · no upload
          </p>
        </header>

        {GROUPS.map((g) => {
          const items = RESIZE_PRESETS.filter((p) => p.group === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} className="mb-8">
              <h2 className="qx-title mb-1.5" style={{ color: "var(--text)" }}>{g.title}</h2>
              <p className="text-[12.5px] mb-4" style={{ color: "var(--text-muted)" }}>{g.blurb}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((p) => <PresetCard key={p.slug} p={p} />)}
              </div>
            </section>
          );
        })}

        <section className="qx-card p-6 mt-2">
          <h2 className="qx-title mb-3" style={{ color: "var(--text)" }}>Fill or fit — which one do you want?</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <p><b style={{ color: "var(--text)" }}>Fill</b> scales the image until it covers the whole frame and crops whatever hangs over the edges. Use it for wallpapers, headshots and anything that should be full-bleed with no borders.</p>
            <p><b style={{ color: "var(--text)" }}>Fit</b> scales the image until all of it is visible, then pads the leftover space with a colour you pick. Use it for logos, product shots, diagrams and anything with detail near the edges.</p>
            <p><b style={{ color: "var(--text)" }}>Aspect ratio is always preserved.</b> The tool crops or pads — it never stretches your image out of shape, so faces and shapes stay correct either way.</p>
            <p><b style={{ color: "var(--text)" }}>Upscaling has limits.</b> Enlarging a small photo produces a file at the right dimensions but cannot invent detail. Always start from the largest original you have.</p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link href="/image-tools/resize" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            Custom width & height →
          </Link>
          <Link href="/convert" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            Convert the format →
          </Link>
          <Link href="/image-tools" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            All image tools →
          </Link>
        </div>
      </main>
    </>
  );
}
