import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#1c1c1c,#000)",
          borderRadius: 14,
          color: "#e1ff04",
          fontSize: 40,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        Q
      </div>
    ),
    { ...size }
  );
}
