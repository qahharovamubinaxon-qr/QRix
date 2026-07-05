"use client";

/** Infinite grayscale wordmark marquee — colors on hover, pauses on hover. */
const BRANDS = [
  "Google", "Microsoft", "Adobe", "Spotify", "Uber", "Airbnb", "Tesla",
  "GitHub", "Notion", "Stripe", "Slack", "Figma", "Discord", "Cloudflare",
  "OpenAI", "Shopify", "Netflix", "Zoom", "Dropbox",
];

export default function TrustedBy({ heading }: { heading: string }) {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-24 lg:pb-32" aria-label={heading}>
      <p data-reveal className="text-center text-[12px] font-bold uppercase tracking-[.18em] mb-8" style={{ color: "var(--text-faint)" }}>
        {heading}
      </p>
      <div className="qx-logos-mask" data-reveal="blur">
        <div className="qx-logos-track">
          {row.map((b, i) => (
            <span key={`${b}-${i}`} className="qx-logo-item" aria-hidden={i >= BRANDS.length}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 2, background: "currentColor", opacity: .55 }} />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
