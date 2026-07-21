import Link from "next/link";
import ImageEngineRegistry from "@/components/image/ImageEngineRegistry";
import { jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { type ResizePreset, relatedPresets, presetGrad } from "@/lib/resize-presets";
import { locResize, resizeUI } from "@/lib/resize-presets-i18n";

export default function LocalizedResizePage({ preset, lang }: { preset: ResizePreset; lang: "ru" | "uz" }) {
  const c = locResize(preset, lang);
  const tt = resizeUI(lang);
  const base = `/${lang}`;
  const path = `${base}/resize/${preset.slug}`;
  const related = relatedPresets(preset);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(c.h1, c.desc, path),
          breadcrumbLd([
            { name: tt.home, path: "/" },
            { name: tt.hub, path: `${base}/resize` },
            { name: `${preset.w}×${preset.h}`, path },
          ]),
          howToLd(c.h1, c.desc, path, c.steps),
          faqLd(c.faqs),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">{tt.home}</Link>
          <span className="mx-1">›</span>
          <Link href={`${base}/resize`} className="hover:underline">{tt.hub}</Link>
          <span className="mx-1">›</span> {preset.w}×{preset.h}
        </nav>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: presetGrad(preset) }}>{preset.emoji}</span>
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>{c.h1}</h1>
          </div>
          <p className="text-[14.5px]" style={{ color: "var(--text-muted)" }}>{c.intro}</p>
          <p className="qx-mono text-[10.5px] uppercase tracking-[0.14em] mt-2" style={{ color: "var(--text-faint)" }}>{tt.free}</p>
        </header>

        <div className="qx-card p-5 lg:p-6">
          <ImageEngineRegistry engine={`resize:${preset.w}x${preset.h}`} />
        </div>

        <section className="mt-10">
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.about}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>{tt.how}</h2>
          <ol className="space-y-3">
            {c.steps.map(([h, body], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{body}</span></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>{tt.faq}</h2>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>{tt.other}</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((o) => (
              <Link key={o.slug} href={`${base}/resize/${o.slug}`}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span aria-hidden>{o.emoji}</span> {o.w}×{o.h}
              </Link>
            ))}
            <Link href={`/resize/${preset.slug}`} className="inline-flex items-center px-3 py-1.5 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              {tt.en} →
            </Link>
          </div>
          <div className="mt-5 pt-5 flex flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/image-tools/resize" className="text-[12.5px] font-semibold hover:opacity-80" style={{ color: "var(--primary-bright)" }}>{tt.custom} →</Link>
            <Link href="/image-tools/compress" className="text-[12.5px] font-semibold hover:opacity-80" style={{ color: "var(--primary-bright)" }}>{tt.compress} →</Link>
            <Link href={`${base}/convert/png-to-jpg`} className="text-[12.5px] font-semibold hover:opacity-80" style={{ color: "var(--primary-bright)" }}>{tt.convert} →</Link>
          </div>
        </section>
      </main>
    </>
  );
}
