"use client";

/** Infinite partner marquee — real brand logos with names, grayscale until
    hovered (brand color), pauses on hover. Bigger, katana-scale rhythm. */
import type { IconType } from "react-icons";
import {
  SiGoogle, SiYoutube, SiSpotify, SiUber, SiAirbnb, SiTesla, SiGithub,
  SiNotion, SiStripe, SiSlack, SiFigma, SiDiscord, SiCloudflare, SiOpenai,
  SiShopify, SiNetflix, SiZoom, SiDropbox, SiWhatsapp, SiPaypal,
} from "react-icons/si";

const BRANDS: [string, string, IconType][] = [
  ["Google", "#4285F4", SiGoogle], ["YouTube", "#FF0000", SiYoutube],
  ["Spotify", "#1DB954", SiSpotify], ["Uber", "#5FB709", SiUber],
  ["Airbnb", "#FF5A5F", SiAirbnb], ["Tesla", "#E82127", SiTesla],
  ["GitHub", "#8957E5", SiGithub], ["Notion", "#F59E0B", SiNotion],
  ["Stripe", "#635BFF", SiStripe], ["Slack", "#36C5F0", SiSlack],
  ["Figma", "#A259FF", SiFigma], ["Discord", "#5865F2", SiDiscord],
  ["Cloudflare", "#F6821F", SiCloudflare], ["OpenAI", "#74AA9C", SiOpenai],
  ["Shopify", "#96BF48", SiShopify], ["Netflix", "#E50914", SiNetflix],
  ["Zoom", "#2D8CFF", SiZoom], ["Dropbox", "#0061FF", SiDropbox],
  ["WhatsApp", "#25D366", SiWhatsapp], ["PayPal", "#00457C", SiPaypal],
];

export default function TrustedBy({ heading }: { heading: string }) {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-16 pb-8 lg:pt-20 lg:pb-10" aria-label={heading}>
      <p data-reveal className="text-center text-[13px] font-bold uppercase tracking-[.2em] mb-12" style={{ color: "var(--text-faint)" }}>
        {heading}
      </p>
      <div className="qx-logos-mask" data-reveal="blur">
        <div className="qx-logos-track">
          {row.map(([b, color, Icon], i) => (
            <span key={`${b}-${i}`} className="qx-logo-item" aria-hidden={i >= BRANDS.length}
              style={{ "--brand": color } as React.CSSProperties}>
              <Icon aria-hidden style={{ width: "1.15em", height: "1.15em", flexShrink: 0 }} />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
