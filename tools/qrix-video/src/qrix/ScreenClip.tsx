import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { C } from "./theme";

/**
 * A window onto the live recording.
 *
 * The recorder shoots the page at 1080x1920 — the same size as the frame — so
 * played whole the interface is legible only on a desktop monitor, which is
 * not where this is watched. Each clip therefore declares the point it is
 * about and the frame pushes in on it, and because the underlying footage is
 * moving, the push reads as camera work rather than as the Ken Burns drift
 * that made the first cut feel like a slideshow.
 *
 * `from`/`to` are seconds in the source recording, taken from the beats file
 * the recorder writes, not guessed off a contact sheet.
 */
export const ScreenClip: React.FC<{
  src: string;
  from: number;
  to: number;
  /** Focus point in 0-1 of the recorded page. */
  fx: number;
  fy: number;
  zoom: number;
  zoomTo?: number;
  durationInFrames: number;
  fps?: number;
}> = ({ src, from, to, fx, fy, zoom, zoomTo, durationInFrames, fps = 30 }) => {
  const frame = useCurrentFrame();
  const sourceSeconds = to - from;
  const targetSeconds = durationInFrames / fps;
  // Fit the chosen slice of footage into the slot the voice-over leaves for
  // it. Pointer travel is the slow part of any recording and the part nobody
  // needs in real time, so this usually speeds up — which also reads as
  // energy rather than as padding.
  const playbackRate = Math.max(0.5, Math.min(4, sourceSeconds / targetSeconds));

  const z = interpolate(frame, [0, durationInFrames], [zoom, zoomTo ?? zoom], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  const tx = (0.5 - fx) * 1080;
  const ty = (0.5 - fy) * 1920;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.bg }}>
      <Video
        src={staticFile(src)}
        trimBefore={Math.round(from * fps)}
        trimAfter={Math.round(to * fps)}
        playbackRate={playbackRate}
        style={{
          width: 1080,
          height: 1920,
          scale: String(z),
          translate: `${tx}px ${ty}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bg}d9 0%, transparent 20%, transparent 56%, ${C.bg}f2 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
