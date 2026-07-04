/**
 * QRix brand logo — a stylized QR-glyph mark in a gradient tile + wordmark.
 * `variant="mark"` renders just the tile (for tight spaces / favicons).
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
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="qrixGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB35C" />
          <stop offset="0.5" stopColor="#F58F20" />
          <stop offset="1" stopColor="#CC7010" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#qrixGrad)" />
      {/* three QR finder patterns */}
      <g fill="#fff">
        <path fillRule="evenodd" clipRule="evenodd" d="M6 6h7v7H6V6Zm2 2v3h3V8H8Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M19 6h7v7h-7V6Zm2 2v3h3V8h-3Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M6 19h7v7H6v-7Zm2 2v3h3v-3H8Z" />
        {/* data dots */}
        <rect x="19" y="19" width="2.6" height="2.6" rx="0.6" />
        <rect x="23.4" y="19" width="2.6" height="2.6" rx="0.6" />
        <rect x="19" y="23.4" width="2.6" height="2.6" rx="0.6" />
        <rect x="23.4" y="23.4" width="2.6" height="2.6" rx="0.6" />
        <rect x="15" y="8" width="2" height="2" rx="0.5" opacity="0.85" />
        <rect x="15" y="12" width="2" height="2" rx="0.5" opacity="0.85" />
      </g>
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
