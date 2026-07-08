import Link from "next/link";
import type { Metadata } from "next";
import { FiArrowRight, FiBox, FiCpu, FiDownload } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { THREE_TOOLS } from "@/lib/three-tools-meta";

export const metadata: Metadata = pageMeta({
  title: "Free 3D Tools — Image to 3D Model Online",
  description: "Turn photos into textured 3D models in your browser. Preview with orbit controls and studio lighting, export GLB, OBJ, STL and USDZ. 3 free generations.",
  path: "/3d-tools",
  keywords: ["3d tools", "image to 3d", "photo to 3d model", "ai 3d generator", "glb obj stl usdz", "free 3d model maker"],
});

const FAQS = [
  { q: "Do I need any software?", a: "No — generation, preview and export all happen in your browser. Models download as standard GLB, OBJ, STL or USDZ files." },
  { q: "Is it free?", a: "Your first 3 generations are free on every account. After that a generation costs 20 credits (Free plans include 60 credits monthly)." },
  { q: "Can I 3D print the results?", a: "Yes — export STL and load it straight into your slicer." },
];

export default function ThreeToolsLanding() {
  return (
    <main className="max-w-6xl mx-auto px-5 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "3D Tools", path: "/3d-tools" }]),
          faqLd(FAQS),
        ])}
      />

      <div className="text-center max-w-2xl mx-auto" data-reveal>
        <span className="qx-badge-hero inline-flex mb-5"><span className="qx-badge-hero-dot" />New · 3D Tools</span>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          One photo.{" "}
          <span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Real 3D.</span>
        </h1>
        <p className="mt-4 text-[15px]" style={{ color: "var(--text-muted)" }}>
          Generate textured 3D models from a single image, inspect them with studio lighting right in the browser,
          and export GLB, OBJ, STL or USDZ. First 3 generations free.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-3xl mx-auto" data-reveal data-stagger>
        {[
          [<FiCpu key="i" size={18} />, "AI powered", "Multi-provider engine with automatic fallback"],
          [<FiBox key="i" size={18} />, "Live 3D preview", "Orbit, zoom and relight before you download"],
          [<FiDownload key="i" size={18} />, "4 formats", "GLB · OBJ · STL · USDZ, watermark-free"],
        ].map(([icon, t, d]) => (
          <div key={t as string} className="qx-card p-5 text-center">
            <span className="inline-flex w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ background: "var(--surface-2)", color: "var(--primary-bright)" }}>{icon}</span>
            <p className="font-bold text-[14px]" style={{ color: "var(--text)" }}>{t}</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>{d}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-12" data-reveal data-stagger>
        {THREE_TOOLS.map((t) => (
          <Link key={t.slug} href={`/3d-tools/${t.slug}`} className="group qx-card qx-card-lift p-6 flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: t.grad }}>{t.emoji}</span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-extrabold" style={{ color: "var(--text)" }}>{t.title}</span>
              <span className="block text-[13px] mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{t.desc}</span>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold mt-2 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                Open tool <FiArrowRight size={12} />
              </span>
            </span>
          </Link>
        ))}
        <div className="qx-card p-6 flex items-center justify-center text-center" style={{ borderStyle: "dashed" }}>
          <div>
            <p className="text-2xl mb-1">🚀</p>
            <p className="font-bold text-[14px]" style={{ color: "var(--text)" }}>More 3D tools coming</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>Text-to-3D · mesh cleanup · AR export</p>
          </div>
        </div>
      </div>

      <section className="max-w-2xl mx-auto mt-16" data-reveal aria-label="FAQ">
        <h2 className="font-display text-2xl font-extrabold mb-5 text-center" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
        {FAQS.map((f) => (
          <div key={f.q} className="qx-card p-5 mb-3">
            <h3 className="font-bold text-[14px] mb-1" style={{ color: "var(--text)" }}>{f.q}</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
