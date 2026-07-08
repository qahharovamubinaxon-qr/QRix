/**
 * QRix illustration system (Mission 18) — one hand-drawn SVG language shared
 * by empty states, error pages and category headers. Rules: 1.5px strokes,
 * 6px corner radius, glass tile on a soft glow, two floating accent shapes,
 * category hue via `tone`. Pure SVG → zero bundle cost, theme-aware.
 */

export type IllustrationName =
  | "qr" | "pdf" | "image" | "video" | "ai" | "3d"
  | "analytics" | "workspace" | "developer" | "search"
  | "empty" | "error" | "offline" | "pricing";

const TONES: Record<IllustrationName, string> = {
  qr: "var(--cat-qr)", pdf: "var(--cat-pdf)", image: "var(--cat-image)",
  video: "var(--cat-video)", ai: "var(--cat-ai)", "3d": "var(--cat-3d)",
  analytics: "var(--primary-bright)", workspace: "var(--cat-image)",
  developer: "var(--cat-3d)", search: "var(--cat-pdf)",
  empty: "var(--accent)", error: "#f87171", offline: "var(--cat-pdf)", pricing: "var(--cat-ai)",
};

/** Inner glyph per subject — consistent stroke grammar. */
function Glyph({ name }: { name: IllustrationName }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "qr": return (<g {...s}><rect x="26" y="26" width="14" height="14" rx="3"/><rect x="60" y="26" width="14" height="14" rx="3"/><rect x="26" y="60" width="14" height="14" rx="3"/><path d="M60 60h6v6h-6zM68 68h6v6h-6zM60 74v-6M74 60h-6"/><rect x="31" y="31" width="4" height="4" rx="1" fill="currentColor" stroke="none"/><rect x="65" y="31" width="4" height="4" rx="1" fill="currentColor" stroke="none"/><rect x="31" y="65" width="4" height="4" rx="1" fill="currentColor" stroke="none"/></g>);
    case "pdf": return (<g {...s}><path d="M34 24h22l12 12v38a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z"/><path d="M56 24v12h12"/><path d="M38 52h24M38 60h24M38 68h14"/></g>);
    case "image": return (<g {...s}><rect x="26" y="30" width="48" height="40" rx="6"/><circle cx="40" cy="44" r="5"/><path d="M26 62l14-12 10 8 12-10 12 10"/></g>);
    case "video": return (<g {...s}><rect x="24" y="32" width="36" height="36" rx="6"/><path d="M60 44l16-8v28l-16-8z"/><path d="M36 44l10 6-10 6z" fill="currentColor" stroke="none"/></g>);
    case "ai": return (<g {...s}><circle cx="50" cy="50" r="20"/><path d="M50 30v-6M50 76v-6M30 50h-6M76 50h-6M36 36l-4-4M68 68l-4-4M64 36l4-4M36 64l-4 4"/><circle cx="50" cy="50" r="7" fill="currentColor" stroke="none" opacity=".85"/></g>);
    case "3d": return (<g {...s}><path d="M50 24l24 12v28L50 76 26 64V36z"/><path d="M50 24v28m0 0L26 36m24 16l24-16"/></g>);
    case "analytics": return (<g {...s}><path d="M28 72V52M42 72V38M56 72V46M70 72V30"/><path d="M28 44l14-10 14 8 14-14"/><circle cx="70" cy="28" r="3" fill="currentColor" stroke="none"/></g>);
    case "workspace": return (<g {...s}><circle cx="38" cy="40" r="8"/><circle cx="62" cy="40" r="8"/><path d="M24 70c0-8 6-14 14-14s14 6 14 14M48 70c0-8 6-14 14-14s14 6 14 14"/></g>);
    case "developer": return (<g {...s}><path d="M38 38L26 50l12 12M62 38l12 12-12 12M54 32l-8 36"/></g>);
    case "search": return (<g {...s}><circle cx="45" cy="45" r="17"/><path d="M58 58l16 16"/><path d="M38 45h14M45 38v14" opacity=".6"/></g>);
    case "empty": return (<g {...s}><path d="M28 44h44v26a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4z"/><path d="M28 44l6-14h32l6 14"/><path d="M28 44h14c0 5 3 8 8 8s8-3 8-8h14"/></g>);
    case "error": return (<g {...s}><path d="M50 26l26 44H24z"/><path d="M50 42v14"/><circle cx="50" cy="63" r="2" fill="currentColor" stroke="none"/></g>);
    case "offline": return (<g {...s}><path d="M28 46c6-6 13-9 22-9M64 41c3 1 6 3 8 5M36 56c4-4 9-6 14-6M58 53c2 1 4 2 6 4M46 66c2-2 5-3 8-1"/><circle cx="50" cy="72" r="2.5" fill="currentColor" stroke="none"/><path d="M28 28l44 44" opacity=".7"/></g>);
    case "pricing": return (<g {...s}><circle cx="50" cy="50" r="22"/><path d="M50 38v24M44 56c0 3 3 5 6 5s7-1 7-5-3-5-7-6-6-2-6-5 3-5 6-5 6 2 6 4"/></g>);
  }
}

/**
 * Illustration tile: glow → glass tile → glyph → floating accents.
 * Sized by the parent (default 120px).
 */
export default function Illustration({ name, size = 120, className }: { name: IllustrationName; size?: number; className?: string }) {
  const tone = TONES[name];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-hidden
      style={{ color: tone, overflow: "visible" }}>
      {/* halo */}
      <circle cx="50" cy="52" r="40" fill="currentColor" opacity=".08" />
      <circle cx="50" cy="52" r="28" fill="currentColor" opacity=".07" />
      {/* glass tile */}
      <rect x="18" y="18" width="64" height="64" rx="16"
        fill="color-mix(in srgb, currentColor 9%, transparent)"
        stroke="color-mix(in srgb, currentColor 38%, transparent)" strokeWidth="1.5" />
      <rect x="18" y="18" width="64" height="26" rx="16" fill="rgba(255,255,255,.05)" />
      <Glyph name={name} />
      {/* floating accents (shared DNA) */}
      <circle cx="86" cy="26" r="4" fill="currentColor" opacity=".55">
        <animate attributeName="cy" values="26;22;26" dur="5s" repeatCount="indefinite" />
      </circle>
      <rect x="8" y="66" width="8" height="8" rx="2.5" fill="currentColor" opacity=".4" transform="rotate(14 12 70)">
        <animate attributeName="y" values="66;70;66" dur="6s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
