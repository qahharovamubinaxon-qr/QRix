import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

/* Same mark as app/opengraph-image.tsx and the favicon — kept as a literal
   copy rather than a shared import so this edge route has no dependency on
   another route segment. scripts/build-logo.mjs's MIRRORS list checks this
   file's shapes against public/qrix-logo.svg on every logo rebuild. */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="112" fill="#0E0E10"/><rect x="112" y="112" width="288" height="288" rx="88" fill="none" stroke="#FF4D1C" stroke-width="52"/><line x1="374" y1="374" x2="438" y2="438" stroke="#FF4D1C" stroke-width="52" stroke-linecap="round"/><path d="M256 196 V300 M208 252 L256 300 L304 252" fill="none" stroke="#FF4D1C" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MARK_URI = `data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`;

/* Every page on the site advertised the SAME og:image — the generic homepage
   card — regardless of whether it was /image-tools/remove-bg or /barcode/qr-code.
   This route renders the page's own title instead, so a shared link names the
   actual tool. `t` is the only input; anything absent or over-length falls back
   to the site tagline rather than rendering a title clipped mid-word. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("t")?.trim();
  const title = raw && raw.length > 0 && raw.length <= 120 ? raw : SITE_TAGLINE;

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
          <img src={MARK_URI} width={80} height={80} alt="" />
          <div style={{ color: "#fff", fontSize: 44, fontWeight: 800 }}>{SITE_NAME}</div>
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: title.length > 55 ? 56 : 68,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1000,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        <div style={{ color: "#ff4d1c", fontSize: 30, fontWeight: 600, marginTop: 30 }}>
          qrixtools.com · 185+ free tools · private in your browser
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
