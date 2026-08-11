/**
 * QRix brand logo — the mark plus the wordmark.
 * `variant="mark"` renders just the tile (for tight spaces).
 *
 * MASTER: public/qrix-logo.svg. The shapes below are copied from it verbatim,
 * which is why the viewBox is 512 and not 32 — matching the master exactly is
 * worth more than round numbers, and scripts/build-logo.mjs fails the build if
 * the two drift apart. This file is the reason that guard exists: the icon, the
 * favicon and the share card were all updated once while the header quietly
 * kept a gradient tile and three QR dots for a full release.
 */
export default function Logo({
  size = 30,
  variant = "full",
  wordmark = true,
}: {
  size?: number;
  variant?: "full" | "mark";
  wordmark?: boolean;
}) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <rect width="512" height="512" rx="112" fill="#0E0E10"/>
      <rect x="112" y="112" width="288" height="288" rx="88" fill="none" stroke="#FF4D1C" stroke-width="52"/>
      <line x1="374" y1="374" x2="438" y2="438" stroke="#FF4D1C" stroke-width="52" stroke-linecap="round"/>
      <path d="M256 196 V300 M208 252 L256 300 L304 252" fill="none" stroke="#FF4D1C" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );

  if (variant === "mark") return mark;

  return (
    <span className="qx-logo-glow font-display flex items-center gap-2 shrink-0">
      {mark}
      {wordmark && (
        <span className="flex items-baseline" style={{ letterSpacing: "-0.02em" }}>
          <span className="text-[24px] font-extrabold" style={{ color: "var(--text)" }}>QR</span>
          <span className="text-[24px] font-extrabold" style={{ color: "var(--primary-bright)" }}>ix</span>
        </span>
      )}
    </span>
  );
}
