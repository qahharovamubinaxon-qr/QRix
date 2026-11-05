import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C } from "./theme";

/**
 * Transitions, done as overlays rather than as a TransitionSeries.
 *
 * TransitionSeries chains scenes and overlaps them, which shifts every
 * subsequent start — and here the scene boundaries are pinned to the voice
 * track, so a shift would walk the captions off the words. A wipe drawn over
 * a hard cut buys the same sense of movement while leaving the timeline
 * exactly where the audio put it.
 */
export const CutWipe: React.FC<{ at: number; fps?: number }> = ({ at, fps = 30 }) => (
  <Sequence from={Math.round(at * fps) - 4} durationInFrames={11} layout="none">
    <Wipe />
    <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
  </Sequence>
);

const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: "-20% -40%",
          background: `linear-gradient(100deg, transparent 0%, ${C.primary}00 36%, ${C.primary}cc 50%, ${C.primary}00 64%, transparent 100%)`,
          translate: `${interpolate(p, [0, 1], [-120, 120])}% 0px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** A single quiet marker, used where something lands on screen. */
export const Cue: React.FC<{ at: number; file: string; volume?: number; fps?: number }> = ({
  at,
  file,
  volume = 0.6,
  fps = 30,
}) => (
  <Sequence from={Math.round(at * fps)} durationInFrames={Math.round(fps)} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

/**
 * The bed runs under everything at a level meant to be felt rather than
 * noticed; it ducks slightly during the hook so the first spoken line lands
 * clean, which is the only moment a viewer decides whether to stay.
 */
export const Bed: React.FC<{ total: number; fps?: number }> = ({ total, fps = 30 }) => {
  const frame = useCurrentFrame();
  return (
    <Audio
      src={staticFile("sfx/bed.wav")}
      volume={interpolate(
        frame,
        [0, fps * 1.2, fps * 6, Math.round((total - 2.2) * fps), Math.round(total * fps)],
        [0, 0.5, 0.75, 0.75, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )}
    />
  );
};
