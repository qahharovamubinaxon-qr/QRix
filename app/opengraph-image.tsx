import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

/* The share card has to show the SAME mark as the favicon and the app icon, and
   the way that used to fail was silently: this file drew its own letter "Q" in a
   grey box, so every link ever shared carried a logo the product does not have.

   MASTER: public/qrix-logo.svg. The body below is a verbatim copy of it, as a
   data URI because Satori (next/og) renders <img> reliably and inline SVG only
   partly. scripts/build-logo.mjs fails if these two drift apart, so changing the
   master and re-running the build is enough — nobody has to remember this file. */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="112" fill="#0E0E10"/><rect x="112" y="112" width="288" height="288" rx="88" fill="none" stroke="#FF4D1C" stroke-width="52"/><line x1="374" y1="374" x2="438" y2="438" stroke="#FF4D1C" stroke-width="52" stroke-linecap="round"/><path d="M256 196 V300 M208 252 L256 300 L304 252" fill="none" stroke="#FF4D1C" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MARK_URI = `data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg,#0b0b12 0%,#1a1020 55%,#2a1608 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 34 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK_URI} width={96} height={96} alt="" />
          <div style={{ color: "#fff", fontSize: 64, fontWeight: 800 }}>{SITE_NAME}</div>
        </div>
        <div style={{ color: "#fff", fontSize: 72, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          {SITE_TAGLINE}
        </div>
        {/* was #e1ff04, a yellow-green that is in no part of the palette */}
        <div style={{ color: "#ff4d1c", fontSize: 34, fontWeight: 600, marginTop: 28 }}>
          185+ tools · 100% free · private in your browser
        </div>
      </div>
    ),
    { ...size }
  );
}
