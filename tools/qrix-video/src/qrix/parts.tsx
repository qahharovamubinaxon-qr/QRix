import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, FONT, PAD } from "./theme";

/** Everything eases on this curve; one curve across a video reads as one hand. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* A slow drift keeps the flat background from reading as a still image
          during the long voice-over stretches. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at 50% 18%, ${C.primary}22, transparent 70%)`,
          translate: interpolate(frame, [0, 1040], ["0px -40px", "0px 60px"]),
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(50% 35% at 20% 88%, ${C.secondary}1f, transparent 70%)`,
          translate: interpolate(frame, [0, 1040], ["0px 40px", "0px -50px"]),
        }}
      />
    </AbsoluteFill>
  );
};

export const Brand: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: C.primary,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 62,
        left: PAD,
        fontFamily: FONT,
        fontSize: 40,
        fontWeight: 800,
        letterSpacing: 7,
        color: C.primary,
      }}
    >
      QRIX
    </div>
    <div
      style={{
        position: "absolute",
        top: 70,
        right: PAD,
        fontFamily: FONT,
        fontSize: 30,
        color: C.muted,
      }}
    >
      qrixtools.com
    </div>
  </>
);

/**
 * A full-page screenshot shown whole is unreadable on a phone, so each shot
 * declares the point it is actually about and the frame pushes in on it. The
 * drift continues through the cut, which is what stops a sequence of stills
 * from feeling like a slideshow.
 */
export const Shot: React.FC<{
  src: string;
  /** Focus point in 0-1 page coordinates. */
  fx: number;
  fy: number;
  from: number;
  to: number;
  durationInFrames: number;
}> = ({ src, fx, fy, from, to, durationInFrames }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  // Translate so the focus point stays put while the image grows around it.
  const tx = (0.5 - fx) * 1080 * scale;
  const ty = (0.5 - fy) * 1920 * scale;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: 1080,
          height: 1920,
          scale: String(scale),
          translate: `${tx / scale}px ${ty / scale}px`,
        }}
      />
      {/* The page is dark already; this just sinks the edges so the caption
          and the step chip keep their contrast wherever the shot lands. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bg}cc 0%, transparent 22%, transparent 58%, ${C.bg}ee 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const StepChip: React.FC<{ n: number; label: string }> = ({
  n,
  label,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 210,
        left: PAD,
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
          easing: EASE,
        }),
        translate: interpolate(frame, [0, 14], ["-28px 0px", "0px 0px"], {
          extrapolateRight: "clamp",
          easing: EASE,
        }),
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: C.primary,
          color: C.bg,
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 42,
          fontWeight: 700,
          color: C.text,
          backgroundColor: `${C.bg}d9`,
          padding: "12px 26px",
          borderRadius: 18,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/**
 * The mascot is a still with an alpha channel — the project's .webm loops are
 * yuv420p, so they carry no transparency and cannot sit over the footage. The
 * motion here is therefore authored: a push in from the side, then a slow
 * breathing bob, which is enough to read as alive at this size.
 */
export const Bunny: React.FC<{
  pose?: "point" | "hero" | "walk" | "blue";
  height: number;
  side?: "left" | "right";
  offset?: number;
  bottom?: number;
}> = ({ pose = "point", height, side = "right", offset = 0, bottom = 0 }) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 24], [side === "right" ? 420 : -420, 0], {
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const bob = Math.sin((frame / 30) * 1.6) * 10;
  return (
    <Img
      src={staticFile(`mascot/bunny-${pose}.webp`)}
      style={{
        position: "absolute",
        bottom,
        [side]: offset,
        height,
        translate: `${slide}px ${bob}px`,
        filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.55))",
      }}
    />
  );
};
