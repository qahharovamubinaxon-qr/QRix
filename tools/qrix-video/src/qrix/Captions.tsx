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
 * Word-level timings, derived rather than measured.
 *
 * Edge TTS reports only SentenceBoundary for these voices — a stream of one
 * phrase returns zero WordBoundary events — so there is no per-word truth to
 * read. What there is, is an exact start and end for every phrase, measured
 * after the silence trim. Dividing that span across the words by their length
 * is wrong by tens of milliseconds in the middle and exact at both edges,
 * which is well inside what anyone can see; drift, the failure that actually
 * reads as broken, cannot accumulate because every phrase re-syncs.
 *
 * Longer words get proportionally more time, and a word ending in punctuation
 * gets a little extra, because that is where the voice slows down.
 */
const weigh = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, "").length + 1
  + (/[,.:;!?—]$/u.test(word) ? 1.6 : 0);

export const wordsOf = (p: Phrase) => {
  const words = p.text.split(/\s+/).filter(Boolean);
  const total = words.reduce((s, w) => s + weigh(w), 0);
  const span = p.end - p.start;
  let t = p.start;
  return words.map((w) => {
    const d = (weigh(w) / total) * span;
    const out = { word: w, start: t, end: t + d };
    t += d;
    return out;
  });
};

export const Captions: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = phrases.find((p) => t >= p.start - 0.14 && t < p.end + 0.3);
  if (!active) return null;

  const words = wordsOf(active);
  const isAsk = active.who === "ask";
  const accent = isAsk ? C.muted : C.primary;
  const inAt = Math.round((active.start - 0.14) * fps);

  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        right: PAD,
        bottom: CAPTION_SAFE,
        display: "flex",
        flexWrap: "wrap",
        gap: "14px 18px",
        justifyContent: "center",
        opacity: interpolate(frame - inAt, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {words.map((w, i) => {
        // Each word lands on its own beat and settles; the one being spoken
        // carries the accent, which is what makes a muted watch followable.
        const at = Math.round(w.start * fps);
        const spoken = t >= w.start - 0.02;
        const since = frame - at;
        return (
          <span
            key={`${w.word}-${i}`}
            style={{
              fontFamily: FONT,
              fontSize: 64,
              lineHeight: 1.12,
              fontWeight: 800,
              color: spoken ? C.text : `${C.muted}88`,
              backgroundColor: spoken ? `${C.bg}f0` : `${C.bg}b0`,
              boxShadow: spoken ? `0 6px 0 0 ${accent}` : "none",
              padding: "8px 18px",
              borderRadius: 14,
              scale: String(
                interpolate(since, [0, 4, 9], [0.82, 1.1, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE,
                }),
              ),
              translate: interpolate(since, [0, 7], ["0px 14px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE,
              }),
              opacity: interpolate(since, [0, 3], [0.25, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};
