"use client";

/** Infinite grayscale wordmark marquee — brand color on hover, pauses on hover. */
const BRANDS: [string, string][] = [
  ["Google", "#4285F4"], ["Microsoft", "#00A4EF"], ["Adobe", "#FF0000"],
  ["Spotify", "#1DB954"], ["Uber", "#1FBAD6"], ["Airbnb", "#FF5A5F"],
  ["Tesla", "#E82127"], ["GitHub", "#8957E5"], ["Notion", "#F59E0B"],
  ["Stripe", "#635BFF"], ["Slack", "#36C5F0"], ["Figma", "#A259FF"],
  ["Discord", "#5865F2"], ["Cloudflare", "#F6821F"], ["OpenAI", "#74AA9C"],
  ["Shopify", "#96BF48"], ["Netflix", "#E50914"], ["Zoom", "#2D8CFF"],
  ["Dropbox", "#0061FF"],
];

export default function TrustedBy({ heading }: { heading: string }) {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 py-20 lg:py-28" aria-label={heading}>
      <p data-reveal className="text-center text-[12px] font-bold uppercase tracking-[.2em] mb-10" style={{ color: "var(--text-faint)" }}>
        {heading}
      </p>
      <div className="qx-logos-mask" data-reveal="blur">
        <div className="qx-logos-track">
          {row.map(([b, color], i) => (
            <span key={`${b}-${i}`} className="qx-logo-item" aria-hidden={i >= BRANDS.length}
              style={{ "--brand": color } as React.CSSProperties}>
              <span aria-hidden style={{ width: 9, height: 9, borderRadius: 3, background: "currentColor", opacity: .55 }} />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
