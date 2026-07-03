import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

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
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#F58F20,#cc7010)",
              borderRadius: 24,
              color: "#fff",
              fontSize: 60,
              fontWeight: 800,
            }}
          >
            Q
          </div>
          <div style={{ color: "#fff", fontSize: 64, fontWeight: 800 }}>{SITE_NAME}</div>
        </div>
        <div style={{ color: "#fff", fontSize: 72, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ color: "#F58F20", fontSize: 34, fontWeight: 600, marginTop: 28 }}>
          55+ tools · 100% free · private in your browser
        </div>
      </div>
    ),
    { ...size }
  );
}
