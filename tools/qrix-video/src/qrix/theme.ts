/**
 * The video has to look like it came from the site, not like a template that
 * happened to mention QRix, so the palette is lifted from app/globals.css
 * rather than re-picked by eye.
 */
export const C = {
  bg: "#0a1226",
  bgLift: "#111c38",
  line: "#1d2740",
  primary: "#ff4d1c",
  secondary: "#467434",
  text: "#ecebe7",
  muted: "#9a968f",
} as const;

export const FONT = "Bricolage Grotesque, Segoe UI, Arial, sans-serif";

/** 1080 wide leaves 72px of air each side; phones crop the edges harder than you expect. */
export const PAD = 72;

/** Captions sit above this, clear of the platform's own UI chrome. */
export const CAPTION_SAFE = 300;
