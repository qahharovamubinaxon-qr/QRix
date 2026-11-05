import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { Mascot, Pose } from "./Mascot";
import { ScreenClip } from "../qrix/ScreenClip";
import { Phrase, wordsOf } from "../qrix/Captions";
import { Bed, Cue } from "../qrix/Sound";

export type Voice = {
  id: string;
  title: string;
  total: number;
  audio: string;
  phrases: Phrase[];
};

const FPS = 30;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * The layout the reference uses, and the reason it works on a phone: the frame
 * is split, so the thing being explained and the person explaining it never
 * compete for the same space. Content sits in a card up top, the line being
 * spoken runs through the middle, and the presenter owns the bottom third.
 *
 * It also fits what this pipeline can actually produce well. The earlier cuts
 * tried to be cinema and landed as a slideshow; this asks for a card, a
 * caption and a pose, and all three are things code can place exactly.
 */
const PAPER = "#f1ede5";
const INK = "#0a1226";
const ORANGE = "#ff4d1c";
const MUTED = "#6f6a61";
const FONT = "Bricolage Grotesque, Segoe UI, Arial, sans-serif";

const CARD = { top: 184, height: 860, side: 56 };

const Card: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CARD.side + 10,
          top: CARD.top - 52,
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: 1,
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: CARD.side,
          right: CARD.side,
          top: CARD.top,
          height: CARD.height,
          borderRadius: 34,
          overflow: "hidden",
          backgroundColor: INK,
          boxShadow: "0 26px 60px rgba(20,16,10,0.22)",
          opacity: interpolate(frame, [0, 9], [0, 1], { extrapolateRight: "clamp" }),
          scale: String(
            interpolate(frame, [0, 14], [0.965, 1], {
              extrapolateRight: "clamp",
              easing: EASE,
            }),
          ),
        }}
      >
        {children}
      </div>
    </>
  );
};

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", padding: 54, textAlign: "center" }}
  >
    {children}
  </AbsoluteFill>
);

/**
 * The caption bar.
 *
 * One line at a time, with the word being spoken picked out — the reference
 * highlights keywords in colour for the same reason: most of this audience
 * watches with the sound off, and a bar of uniform text gives them nothing to
 * follow.
 */
const CaptionBar: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const active = phrases.find((p) => t >= p.start - 0.12 && t < p.end + 0.28);
  if (!active) return null;
  const words = wordsOf(active);
  const inAt = Math.round((active.start - 0.12) * fps);

  return (
    <div
      style={{
        position: "absolute",
        left: 46,
        right: 46,
        top: CARD.top + CARD.height + 46,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(frame - inAt, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame - inAt, [0, 9], ["0px 12px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE,
        }),
      }}
    >
      <div
        style={{
          backgroundColor: INK,
          borderRadius: 22,
          padding: "20px 28px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 14px",
          justifyContent: "center",
          maxWidth: 960,
          boxShadow: "0 16px 34px rgba(20,16,10,0.2)",
        }}
      >
        {words.map((w, i) => {
          const spoken = t >= w.start - 0.02;
          return (
            <span
              key={`${w.word}-${i}`}
              style={{
                fontFamily: FONT,
                fontSize: 54,
                fontWeight: 800,
                lineHeight: 1.1,
                color: spoken ? ORANGE : "#ffffff",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Stage: React.FC<{ pose: Pose }> = ({ pose }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 104,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
        translate: interpolate(frame, [0, 16], ["0px 46px", "0px 0px"], {
          extrapolateRight: "clamp",
          easing: EASE,
        }),
      }}
    >
      <Mascot pose={pose} cell={34} />
    </div>
  );
};

const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 128,
  color = "#ecebe7",
}) => (
  <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 800, color, lineHeight: 1.08 }}>
    {children}
  </div>
);

export const FlatShort: React.FC<{ voice: Voice; recDir: string }> = ({ voice, recDir }) => {
  const S = {
    ask: [0, 6.838],
    promise: [6.838, 11.394],
    step1: [11.394, 15.842],
    step2: [15.842, 21.301],
    step3: [21.301, 23.987],
    claim: [23.987, 28.621],
    cta: [28.621, voice.total + 1.1],
  } as const;
  const seq = (k: keyof typeof S) => ({
    from: Math.round(S[k][0] * FPS),
    durationInFrames: Math.round((S[k][1] - S[k][0]) * FPS),
  });

  /**
   * The recording is a 9:16 page and the card is wider than it is tall, so
   * dropped in raw it gets cropped to a band through the middle — which is
   * what the first pass of this format did. Instead the footage is scaled
   * down whole into a phone-shaped frame inside the card, the way the
   * reference presents its screenshots.
   */
  /**
   * The recording is a 9:16 page and the card is wider than it is tall. Fitting
   * the whole page inside left the card mostly empty; cropping it blind showed
   * a band of nothing. So the footage is scaled to the card's width and shifted
   * vertically to the part of the page the line is about — `focus` is that
   * point, in 0-1 of the page.
   */
  const clip = (from: number, to: number, k: keyof typeof S, focus: number) => {
    const W = 1080 - CARD.side * 2;
    const scale = W / 1080;
    const scaledH = 1920 * scale;
    const top = Math.max(
      Math.min(0, CARD.height - scaledH),
      Math.min(0, CARD.height / 2 - focus * scaledH),
    );
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top,
            width: 1080,
            height: 1920,
            scale: String(scale),
            transformOrigin: "top left",
          }}
        >
          <ScreenClip
            src={`${recDir}/screen.mp4`}
            from={from}
            to={to}
            fx={0.5}
            fy={0.5}
            zoom={1.0}
            zoomTo={1.03}
            durationInFrames={seq(k).durationInFrames}
          />
        </div>
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, backgroundColor: ORANGE }} />
      <div style={{ position: "absolute", top: 54, left: CARD.side, fontFamily: FONT, fontSize: 38, fontWeight: 800, letterSpacing: 6, color: ORANGE }}>
        QRIX
      </div>
      <div style={{ position: "absolute", top: 62, right: CARD.side, fontFamily: FONT, fontSize: 28, color: MUTED }}>
        qrixtools.com
      </div>

      <Sequence name="Ask" {...seq("ask")}>
        <Card label="Что нужно">
          <Centered>
            <Big size={146} color={ORANGE}>413 × 531</Big>
            <div style={{ fontFamily: FONT, fontSize: 42, color: "#9a968f", marginTop: 16 }}>
              35 × 45 мм · паспорт РФ
            </div>
          </Centered>
        </Card>
        <Stage pose="think" />
      </Sequence>

      <Sequence name="Promise" {...seq("promise")}>
        <Card label="Почему QRix">
          <Centered>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {["Бесплатно", "Без регистрации", "Файл не уходит на сервер"].map((s, i) => (
                <Chip key={s} text={s} delay={i * 7} accent={i === 2} />
              ))}
            </div>
          </Centered>
        </Card>
        <Stage pose="point" />
      </Sequence>

      <Sequence name="Step 1" {...seq("step1")}>
        <Card label="Шаг 1 — открываешь">{clip(26.5, 32.7, "step1", 0.42)}</Card>
        <Stage pose="work" />
      </Sequence>

      <Sequence name="Step 2" {...seq("step2")}>
        <Card label="Шаг 2 — загружаешь">{clip(32.4, 38.6, "step2", 0.4)}</Card>
        <Stage pose="work" />
      </Sequence>

      <Sequence name="Step 3" {...seq("step3")}>
        <Card label="Шаг 3 — скачиваешь">{clip(61.0, 64.3, "step3", 0.33)}</Card>
        <Stage pose="point" />
      </Sequence>

      <Sequence name="Claim" {...seq("claim")}>
        <Card label="Главное">
          <Centered>
            <Big size={104}>
              Обработка —<br />
              <span style={{ color: ORANGE }}>в браузере</span>
            </Big>
            <div style={{ fontFamily: FONT, fontSize: 40, color: "#9a968f", marginTop: 28, lineHeight: 1.35 }}>
              Снимок не загружается на сервер.<br />Он остаётся на твоём устройстве.
            </div>
          </Centered>
        </Card>
        <Stage pose="point" />
      </Sequence>

      <Sequence name="CTA" {...seq("cta")}>
        <Card label="Готово">
          <Centered>
            <Big size={132} color={ORANGE}>QRIX</Big>
            <div style={{ fontFamily: FONT, fontSize: 54, fontWeight: 700, color: "#ecebe7", marginTop: 26 }}>
              185 инструментов
            </div>
            <div style={{ fontFamily: FONT, fontSize: 40, color: "#9a968f", marginTop: 12 }}>
              бесплатно · без водяных знаков
            </div>
          </Centered>
        </Card>
        <Stage pose="cheer" />
      </Sequence>

      <CaptionBar phrases={voice.phrases} />

      <Cue at={1.64} file="pop.wav" volume={0.45} />
      <Cue at={6.9} file="whoosh.wav" volume={0.45} />
      <Cue at={22.6} file="click.wav" volume={0.65} />
      <Bed total={voice.total + 1.1} />
      <Audio src={staticFile(voice.audio)} volume={1} />
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ text: string; delay: number; accent?: boolean }> = ({ text, delay, accent }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 56,
        fontWeight: 700,
        color: "#ecebe7",
        backgroundColor: "#111c38",
        border: `3px solid ${accent ? ORANGE : "#1d2740"}`,
        padding: "20px 34px",
        borderRadius: 999,
        opacity: interpolate(frame - delay, [0, 9], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame - delay, [0, 13], ["0px 18px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE,
        }),
      }}
    >
      {text}
    </div>
  );
};
