/* A link-in-bio page encoded entirely inside the URL — no database needed.
   The editor builds a BioPage, encodes it to base64, and the public /p route
   decodes and renders it. The QR code simply points to that /p?d=… URL. */

export type LinkItem = { label: string; url: string };

/** Social usernames — rendered as an icon row on the page. */
export type BioSocials = {
  ig?: string;  // instagram
  tg?: string;  // telegram
  wa?: string;  // whatsapp number
  yt?: string;  // youtube
  tk?: string;  // tiktok
  fb?: string;  // facebook
};

export type BioTheme = "dark" | "light" | "sunset" | "ocean" | "forest";
export type BioButtonStyle = "outline" | "solid" | "pill";

export type BioPage = {
  t: string;             // title
  s?: string;            // subtitle / bio
  av?: string;           // avatar: emoji or single letter
  avu?: string;          // avatar image URL (overrides av)
  c?: string;            // accent color
  th?: BioTheme;         // page background theme
  bs?: BioButtonStyle;   // button style
  soc?: BioSocials;      // social icon row
  nb?: 1;                // hide the "Made with QRix" badge (Pro)
  pat?: BioPattern;      // niche background pattern (emoji watermark)
  bgi?: string;          // custom background image URL (cover + overlay)
  l: LinkItem[];         // links
};

export type BioPattern = "food" | "beauty" | "music" | "shop" | "fitness" | "travel" | "party" | "work";

/** Niche watermark patterns — tiled emoji over the theme background. */
export const BIO_PATTERNS: Record<BioPattern, { emoji: string; label: string }> = {
  food:    { emoji: "🍕", label: "Food" },
  beauty:  { emoji: "💅", label: "Beauty" },
  music:   { emoji: "🎵", label: "Music" },
  shop:    { emoji: "🛍️", label: "Shop" },
  fitness: { emoji: "💪", label: "Fitness" },
  travel:  { emoji: "✈️", label: "Travel" },
  party:   { emoji: "🎉", label: "Party" },
  work:    { emoji: "💼", label: "Work" },
};

/** Data-URI SVG tile with the niche emoji at low opacity (self-contained, no assets). */
export function patternTile(pat: BioPattern): string {
  const e = BIO_PATTERNS[pat]?.emoji || "✨";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><text x='14' y='34' font-size='24' opacity='0.16'>${e}</text><text x='58' y='82' font-size='24' opacity='0.10'>${e}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Self-contained page palettes — the public page must not depend on site theme. */
export const BIO_THEMES: Record<BioTheme, { bg: string; text: string; muted: string; surface: string; label: string }> = {
  dark:   { bg: "linear-gradient(180deg,#0b0b12,#14141f)", text: "#f0f4ff", muted: "#9aa3b5", surface: "rgba(255,255,255,0.06)", label: "Dark" },
  light:  { bg: "linear-gradient(180deg,#fafafa,#eef0f6)", text: "#12141c", muted: "#5b6472", surface: "rgba(0,0,0,0.05)",       label: "Light" },
  sunset: { bg: "linear-gradient(160deg,#2a1032,#5b1e3f 55%,#8a3a2a)", text: "#fff4ec", muted: "#e8c3b0", surface: "rgba(255,255,255,0.10)", label: "Sunset" },
  ocean:  { bg: "linear-gradient(160deg,#061a2b,#0b3350 60%,#0e4d63)", text: "#eaf6ff", muted: "#a8c8dd", surface: "rgba(255,255,255,0.08)", label: "Ocean" },
  forest: { bg: "linear-gradient(160deg,#0c1f14,#173a24 60%,#1f5230)", text: "#effaf1", muted: "#b2ccb8", surface: "rgba(255,255,255,0.08)", label: "Forest" },
};

export function socialHref(kind: keyof BioSocials, v: string): string {
  const s = v.trim().replace(/^@/, "");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  switch (kind) {
    case "ig": return `https://instagram.com/${s}`;
    case "tg": return `https://t.me/${s}`;
    case "wa": return `https://wa.me/${s.replace(/[^\d]/g, "")}`;
    case "yt": return `https://youtube.com/@${s}`;
    case "tk": return `https://tiktok.com/@${s}`;
    case "fb": return `https://facebook.com/${s}`;
  }
}

// unicode-safe base64
export function encodeBio(page: BioPage): string {
  const json = JSON.stringify(page);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBio(str: string): BioPage | null {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const data = JSON.parse(json);
    if (!data || typeof data.t !== "string" || !Array.isArray(data.l)) return null;
    return data as BioPage;
  } catch {
    return null;
  }
}

export function normalizeUrl(u: string): string {
  const s = (u || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (/^(mailto:|tel:)/i.test(s)) return s;
  return "https://" + s;
}
