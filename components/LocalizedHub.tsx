import Link from "next/link";
import { jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { presetGrad } from "@/lib/resize-presets";
import { pairGrad } from "@/lib/convert-pairs";
import { LOC_RESIZE_PRESETS, resizeLabel } from "@/lib/resize-presets-i18n";
import { LOC_CONVERT_PAIRS, convUI } from "@/lib/convert-pairs-i18n";
import { BARCODE_FAMILIES, typeGrad } from "@/lib/barcode-types";
import { LOC_BARCODE_TYPES, barcodeLabel } from "@/lib/barcode-types-i18n";
import { RESIZE_HUB, CONVERT_HUB, BARCODE_HUB, hubHome, type Lang } from "@/lib/hub-i18n";

type Card = { href: string; grad: string; emoji: string; title: string; sub: string; ldName: string };
type Section = { key: string; title: string; blurb?: string; cards: Card[] };

/** Preset groups in scan order — same intent order as the EN hub. */
const GROUP_ORDER = ["Display", "Web", "Print", "ID"] as const;
/** Target formats in scan order; anything missing is appended, so a new
    target format can never end up orphaned without a link from the hub. */
const TARGET_ORDER = ["JPG", "PNG", "WebP", "AVIF", "TIFF", "BMP", "ICO"];

function resizeSections(lang: Lang): Section[] {
  const g = RESIZE_HUB[lang].groups!;
  return GROUP_ORDER.map((key) => ({
    key,
    title: g[key].title,
    blurb: g[key].blurb,
    cards: LOC_RESIZE_PRESETS.filter((p) => p.group === key).map((p) => ({
      href: `/${lang}/resize/${p.slug}`,
      grad: presetGrad(p),
      emoji: p.emoji,
      title: `${p.w}×${p.h}`,
      sub: resizeLabel(p.slug, lang) || p.label,
      ldName: `${p.w}x${p.h}`,
    })),
  })).filter((s) => s.cards.length > 0);
}

function convertSections(lang: Lang): Section[] {
  const c = CONVERT_HUB[lang];
  const sub = convUI(lang).conv;
  const targets = [...new Set([...TARGET_ORDER, ...LOC_CONVERT_PAIRS.map((p) => p.to)])];
  return targets
    .map((to) => ({
      key: to,
      title: c.sectionTitle!(to),
      cards: LOC_CONVERT_PAIRS.filter((p) => p.to === to).map((p) => ({
        href: `/${lang}/convert/${p.slug}`,
        grad: pairGrad(p),
        emoji: p.emoji,
        title: `${p.from} → ${p.to}`,
        sub: `${p.from} → ${p.to} ${sub.toLowerCase()}`,
        ldName: `${p.from} → ${p.to}`,
      })),
    }))
    .filter((s) => s.cards.length > 0);
}

/** Families come from BARCODE_FAMILIES, and anything a future family adds is
    appended rather than dropped — same self-defence as TARGET_ORDER above. */
function barcodeSections(lang: Lang): Section[] {
  const g = BARCODE_HUB[lang].groups!;
  const fams = [...new Set([...BARCODE_FAMILIES, ...LOC_BARCODE_TYPES.map((t) => t.family)])];
  return fams
    .map((fam) => ({
      key: fam,
      title: g[fam]?.title ?? fam,
      blurb: g[fam]?.blurb,
      cards: LOC_BARCODE_TYPES.filter((t) => t.family === fam).map((t) => ({
        href: `/${lang}/barcode/${t.slug}`,
        grad: typeGrad(t),
        emoji: t.emoji,
        title: t.name,
        sub: barcodeLabel(t.slug, lang),
        ldName: t.name,
      })),
    }))
    .filter((s) => s.cards.length > 0);
}

function HubCard({ c }: { c: Card }) {
  return (
    <Link href={c.href} className="qx-card p-4 flex items-center gap-3 transition-opacity hover:opacity-85">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: c.grad }}>
        {c.emoji}
      </span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{c.title}</div>
        <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{c.sub}</div>
      </div>
    </Link>
  );
}

export type HubKind = "resize" | "convert" | "barcode";

const HUB_COPY = { resize: RESIZE_HUB, convert: CONVERT_HUB, barcode: BARCODE_HUB };
const SECTIONS: Record<HubKind, (lang: Lang) => Section[]> = {
  resize: resizeSections,
  convert: convertSections,
  barcode: barcodeSections,
};

/** Localized parent for the /resize/<preset>, /convert/<pair> and
    /barcode/<type> families. Same shell for all three so the hubs stay
    visually identical to their EN twins; the sections, copy and links come
    from lib/hub-i18n.ts. */
export default function LocalizedHub({ kind, lang }: { kind: HubKind; lang: Lang }) {
  const c = HUB_COPY[kind][lang];
  const sections = SECTIONS[kind](lang);
  const path = `/${lang}/${kind}`;
  const total = sections.reduce((n, s) => n + s.cards.length, 0);
  const flat = sections.flatMap((s) => s.cards);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: hubHome(lang), path: "/" },
            { name: c.crumb, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: c.itemListName,
            itemListElement: flat.map((card, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: card.ldName,
              url: `https://qrixtools.com${card.href}`,
            })),
          },
          faqLd(c.faqs),
        ])} />

      <main className="max-w-6xl mx-auto p-5 lg:p-8">
        <nav className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-80">{hubHome(lang)}</Link>
          <span className="mx-1.5">›</span>
          <span style={{ color: "var(--text)" }}>{c.crumb}</span>
        </nav>

        <header className="qx-card qx-rise p-7 mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>{c.h1}</h1>
          <p className="mt-2.5 text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>{c.intro}</p>
          <p className="qx-mono text-[10.5px] uppercase tracking-[0.14em] mt-3" style={{ color: "var(--text-faint)" }}>
            {c.meta(total)}
          </p>
        </header>

        {sections.map((s) => (
          <section key={s.key} className="mb-8">
            <h2 className="qx-title mb-1.5" style={{ color: "var(--text)" }}>{s.title}</h2>
            {s.blurb && <p className="text-[12.5px] mb-4" style={{ color: "var(--text-muted)" }}>{s.blurb}</p>}
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-3 ${s.blurb ? "" : "mt-4"}`}>
              {s.cards.map((card) => <HubCard key={card.href} c={card} />)}
            </div>
          </section>
        ))}

        <section className="qx-card p-6 mt-2">
          <h2 className="qx-title mb-3" style={{ color: "var(--text)" }}>{c.explainTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {c.explain.map(([lead, body]) => (
              <p key={lead}><b style={{ color: "var(--text)" }}>{lead}</b> — {body}</p>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>{c.faqTitle}</h2>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {c.links.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
              {l.label} →
            </Link>
          ))}
          <Link href={`/${kind}`} className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>
            English version →
          </Link>
        </div>
      </main>
    </>
  );
}
