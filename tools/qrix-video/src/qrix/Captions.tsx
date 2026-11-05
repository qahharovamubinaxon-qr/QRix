import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, CAPTION_SAFE, FONT, PAD } from "./theme";
import { EASE } from "./parts";

export type Phrase = {
  n: number;
  who: string;
  text: string;
  start: number;
  end: number;
};

/**
 * Burned-in captions, timed from the real audio rather than from an estimate.
 * Most of this audience watches muted, so the caption is the script — if it
 * drifts even half a second the video reads as broken. The phrase boundaries
 * come straight out of voice.py, measured after silence trimming.
 *
 * The two speakers are coloured differently because there is no other way to
 * tell, with the sound off, that the question and the answer are two people.
 */
export const Captions: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = phrases.find((p) => t >= p.start - 0.12 && t < p.end + 0.26);
  if (!active) return null;

  const local = frame - Math.round((active.start - 0.12) * fps);
  const isAsk = active.who === "ask";

  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        right: PAD,
        bottom: CAPTION_SAFE,
        textAlign: "center",
        opacity: interpolate(local, [0, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(local, [0, 8], ["0px 16px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE,
        }),
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontFamily: FONT,
          fontSize: 58,
          lineHeight: 1.2,
          fontWeight: 700,
          color: isAsk ? C.text : C.text,
          backgroundColor: `${C.bg}e6`,
          borderBottom: `6px solid ${isAsk ? C.muted : C.primary}`,
          padding: "20px 30px",
          borderRadius: 20,
          textWrap: "balance",
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
