import Link from "next/link";
import type { BioPage, BioSocials } from "@/lib/linkpage";
import { normalizeUrl, BIO_THEMES, socialHref } from "@/lib/linkpage";
import { SiInstagram, SiTelegram, SiWhatsapp, SiYoutube, SiTiktok, SiFacebook } from "react-icons/si";

const SOCIAL_ICONS: { key: keyof BioSocials; icon: React.ReactNode; name: string }[] = [
  { key: "ig", icon: <SiInstagram size={18} />, name: "Instagram" },
  { key: "tg", icon: <SiTelegram size={18} />, name: "Telegram" },
  { key: "wa", icon: <SiWhatsapp size={18} />, name: "WhatsApp" },
  { key: "yt", icon: <SiYoutube size={18} />, name: "YouTube" },
  { key: "tk", icon: <SiTiktok size={18} />, name: "TikTok" },
  { key: "fb", icon: <SiFacebook size={18} />, name: "Facebook" },
];

/** Renders a link-in-bio page from a config. Used by the editor preview and /p. */
export default function BioView({ page }: { page: BioPage }) {
  const accent = page.c || "#F58F20";
  const theme = BIO_THEMES[page.th || "dark"] || BIO_THEMES.dark;
  const bs = page.bs || "outline";
  const socials = SOCIAL_ICONS.filter((s) => page.soc?.[s.key]);

  const btnStyle = (a: string): React.CSSProperties => {
    switch (bs) {
      case "solid":
        return { background: `linear-gradient(140deg, ${a}, ${shade(a)})`, color: pickText(a), border: "none", borderRadius: 16, boxShadow: `0 6px 20px ${a}44` };
      case "pill":
        return { background: theme.surface, color: theme.text, border: `2px solid ${a}`, borderRadius: 99, boxShadow: `0 4px 16px ${a}22` };
      default:
        return { background: theme.surface, color: theme.text, border: `2px solid ${a}`, borderRadius: 16, boxShadow: `0 4px 16px ${a}22` };
    }
  };

  return (
    <div className="w-full min-h-full" style={{ background: theme.bg }}>
      <div className="mx-auto w-full max-w-[420px] px-5 py-10 flex flex-col items-center">
        {page.avu ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.avu} alt="" className="w-24 h-24 rounded-full object-cover mb-4"
            style={{ border: `3px solid ${accent}`, boxShadow: `0 10px 30px ${accent}55` }} />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-extrabold mb-4"
            style={{ background: `linear-gradient(140deg, ${accent}, ${shade(accent)})`, color: pickText(accent), boxShadow: `0 10px 30px ${accent}55` }}
          >
            {page.av || (page.t || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <h1 className="font-display text-2xl font-extrabold text-center" style={{ color: theme.text }}>{page.t || "Your name"}</h1>
        {page.s && <p className="text-sm text-center mt-2 max-w-[300px]" style={{ color: theme.muted }}>{page.s}</p>}

        {/* social icon row */}
        {socials.length > 0 && (
          <div className="flex items-center gap-2.5 mt-4">
            {socials.map((s) => (
              <a key={s.key} href={socialHref(s.key, page.soc![s.key]!) || undefined} target="_blank" rel="noopener noreferrer"
                aria-label={s.name}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5"
                style={{ background: theme.surface, color: theme.text, border: `1px solid ${accent}55` }}>
                {s.icon}
              </a>
            ))}
          </div>
        )}

        <div className="w-full mt-7 space-y-3">
          {page.l.filter((it) => it.label || it.url).map((it, i) => {
            const href = normalizeUrl(it.url);
            return (
              <a
                key={i}
                href={href || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3.5 font-bold text-[15px] transition-transform hover:-translate-y-0.5"
                style={btnStyle(accent)}
              >
                {it.label || href}
              </a>
            );
          })}
        </div>

        {!page.nb && (
          <Link
            href="/?utm_source=bio&utm_medium=badge&utm_campaign=powered_by"
            className="mt-10 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: theme.surface, color: theme.muted, border: `1px solid ${theme.muted}33` }}
          >
            <span aria-hidden style={{ display: "inline-flex", width: 14, height: 14, borderRadius: 4, background: "linear-gradient(135deg,#F58F20,#cc7010)" }} />
            Made with <span style={{ color: theme.text }}>QRix</span>
          </Link>
        )}
      </div>
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
