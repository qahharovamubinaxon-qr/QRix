import { FiExternalLink } from "react-icons/fi";
import { ALL_STATS, KIND_LABEL, KIND_TONE } from "@/lib/qr-stats";
import { pageMeta, SITE_URL } from "@/lib/seo";

/* One citable statistic as a bare iframe-able card. noindex — /qr-code-statistics
   carries the SEO; this exists to be pasted into someone else's post, and every
   paste carries the figure's source, its period and its caveat along with the
   number, plus a link back. See lib/qr-stats.ts for why the caveat travelling
   with the figure is the point rather than the backlink.

   Registry-backed and fully enumerated, so unknown ids must 404 rather than
   render an empty card at 200 (M118). */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_STATS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = ALL_STATS.find((x) => x.id === id);
  return pageMeta({
    title: s ? `${s.value} — QR code statistic (embed)` : "QR code statistic (embed)",
    description: s?.claim || "Embeddable QR code statistic card by QRix.",
    path: `/embed/qr-stat/${id}`,
    noindex: true,
  });
}

export default async function EmbedQrStat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = ALL_STATS.find((x) => x.id === id);
  if (!s) return null;

  const tone = KIND_TONE[s.source.kind];

  return (
    /* Centred in whatever height the embedder gave us, painting no background of
       its own: the height in the snippet is computed for a 320px-wide column, so
       a wider host column leaves slack, and slack has to read as margin. */
    <div className="min-h-full flex items-center justify-center p-1">
      <article
        className="w-full rounded-2xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="font-display font-extrabold leading-none mb-2"
          style={{ color: "var(--primary-bright)", fontSize: "clamp(1.4rem,5vw,2rem)" }}
        >
          {s.value}
        </div>

        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--text)" }}>
          {s.claim}
        </p>

        <div className="pt-2.5 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="qx-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ color: tone, border: `1px solid ${tone}` }}
            >
              {KIND_LABEL[s.source.kind]}
            </span>
            <span className="qx-mono text-[9px]" style={{ color: "var(--text-faint)" }}>
              {s.period}
            </span>
          </div>

          <a
            href={s.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-1.5 text-[11px] leading-snug hover:underline underline-offset-2"
            style={{ color: "var(--text-muted)" }}
          >
            <FiExternalLink size={10} className="shrink-0 mt-0.5" />
            <span>
              {s.source.name} <span style={{ color: "var(--text-faint)" }}>· {s.source.published}</span>
            </span>
          </a>

          {s.caveat && (
            <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
              <strong>What it doesn&rsquo;t prove:</strong> {s.caveat}
            </p>
          )}

          <div className="pt-1">
            <a
              href={`${SITE_URL}/qr-code-statistics?utm_source=embed&utm_medium=widget#${s.id}`}
              target="_blank"
              rel="noopener"
              className="text-[10px] font-semibold"
              style={{ color: "var(--text-faint)" }}
            >
              Source: <span style={{ color: "var(--primary-bright)" }}>QRix QR code statistics</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
