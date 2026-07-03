import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#F58F20,#cc7010)",
          color: "#fff",
          fontSize: 112,
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
