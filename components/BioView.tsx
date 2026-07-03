import Link from "next/link";
import type { BioPage } from "@/lib/linkpage";
import { normalizeUrl } from "@/lib/linkpage";

/** Renders a link-in-bio page from a config. Used by the editor preview and /p. */
export default function BioView({ page }: { page: BioPage }) {
  const accent = page.c || "#F58F20";
  return (
    <div className="mx-auto w-full max-w-[420px] px-5 py-10 flex flex-col items-center">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-extrabold mb-4"
        style={{ background: `linear-gradient(140deg, ${accent}, ${shade(accent)})`, color: pickText(accent), boxShadow: `0 10px 30px ${accent}55` }}
      >
        {page.av || (page.t || "?").slice(0, 1).toUpperCase()}
      </div>
      <h1 className="font-display text-2xl font-extrabold text-center" style={{ color: "var(--text)" }}>{page.t || "Your name"}</h1>
      {page.s && <p className="text-sm text-center mt-2 max-w-[300px]" style={{ color: "var(--text-muted)" }}>{page.s}</p>}

      <div className="w-full mt-7 space-y-3">
        {page.l.filter((it) => it.label || it.url).map((it, i) => {
          const href = normalizeUrl(it.url);
          return (
            <a
              key={i}
              href={href || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3.5 rounded-2xl font-bold text-[15px] transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: `2px solid ${accent}`, boxShadow: `0 4px 16px ${accent}22` }}
            >
              {it.label || href}
            </a>
          );
        })}
      </div>

      <Link
        href="/?utm_source=bio&utm_medium=badge&utm_campaign=powered_by"
        className="mt-10 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
      >
        <span aria-hidden style={{ display: "inline-flex", width: 14, height: 14, borderRadius: 4, background: "linear-gradient(135deg,#F58F20,#cc7010)" }} />
        Made with <span style={{ color: "var(--text)" }}>QRix</span>
      </Link>
    </div>
  );
}

function shade(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 40), g = Math.max(0, ((n >> 8) & 255) - 40), b = Math.max(0, (n & 255) - 40);
  return `rgb(${r},${g},${b})`;
}
function pickText(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#0e0e0e" : "#ffffff";
}
