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
import { Current, POWER4_OUT, seamStyle } from "./seam";

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

/**
 * One scene, moving as a unit across its boundaries.
 *
 * Previously the card faded and scaled itself on arrival while the cut was a
 * hard swap, so the eye's momentum died at every boundary. Now the whole scene
 * carries the film's current: it enters already travelling and leaves still
 * travelling, and the cut lands mid-motion on both sides.
 */
const Scene: React.FC<{
  durationInFrames: number;
  current?: Current;
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}> = ({ durationInFrames, current = "left", isFirst, isLast, children }) => {
  const frame = useCurrentFrame();
  const st = seamStyle(frame, durationInFrames, current, isFirst, isLast);
  return <AbsoluteFill style={st}>{children}</AbsoluteFill>;
};

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
  // Four words at a time, in the chunk the current word falls in. A whole
  // phrase set at a readable size wraps to three ragged lines; a chunk stays
  // on one or two and the eye never has to hunt for the live word.
  const SIZE = 4;
  const idx = Math.max(0, words.findIndex((w) => t < w.end));
  const start = Math.floor((idx === -1 ? words.length - 1 : idx) / SIZE) * SIZE;
  const chunk = words.slice(start, start + SIZE);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: CARD.top + CARD.height + 52,
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 18px",
        justifyContent: "center",
        alignItems: "baseline",
      }}
    >
      {chunk.map((w, i) => {
        const at = Math.round(w.start * fps);
        const since = frame - at;
        const spoken = t >= w.start - 0.02;
        // Waterfall entry, per the technique catalog: words whip in from below
        // on power4.out, and opacity is BINARY — set, never faded. Fading an
        // arrival is the §4 seam trick, and using it here is what made the
        // last cut's captions look like they were dissolving into place
        // instead of landing. Weight varies the throw: a long word travels
        // further and takes longer than a short one.
        const heavy = w.word.replace(/[^\p{L}\p{N}]/gu, "").length >= 7;
        const light = w.word.replace(/[^\p{L}\p{N}]/gu, "").length <= 3;
        const rise = heavy ? 64 : light ? 34 : 46;
        const dur = heavy ? 6 : light ? 3 : 4;
        return (
          <span
            key={`${w.word}-${start + i}`}
            style={{
              fontFamily: FONT,
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1,
              color: spoken ? ORANGE : "#2a241d",
              opacity: since >= 0 ? 1 : 0,
              translate: interpolate(since, [0, dur], [`0px ${rise}px`, "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: POWER4_OUT,
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
  /**
   * Scenes are derived from the voice track, not typed in.
   *
   * The boundaries used to be hand-written seconds, so the moment a line was
   * rewritten — and one had to be, because "Открываешь QRix" names a brand
   * nobody can search for instead of the domain — every cut after it drifted
   * off its sentence. Each scene is now a span of phrases, and its time comes
   * from where those phrases actually land.
   */
  const SCENES = [
    { key: "ask", first: 0, last: 2 },
    { key: "promise", first: 3, last: 5 },
    { key: "step1", first: 6, last: 7 },
    { key: "step2", first: 8, last: 10 },
    { key: "step3", first: 11, last: 12 },
    { key: "claim", first: 13, last: 14 },
    { key: "cta", first: 15, last: voice.phrases.length - 1 },
  ] as const;

  type SceneKey = (typeof SCENES)[number]["key"];

  const bounds = (k: SceneKey) => {
    const i = SCENES.findIndex((x) => x.key === k);
    const sc = SCENES[i];
    const startAt = voice.phrases[sc.first]?.start ?? 0;
    const next = SCENES[i + 1];
    const endAt = next
      ? (voice.phrases[next.first]?.start ?? voice.total) - 0.3
      : voice.total + 1.1;
    return [startAt === 0 ? 0 : startAt - 0.3, endAt] as const;
  };

  const seq = (k: SceneKey) => {
    const [a, b] = bounds(k);
    return {
      from: Math.max(0, Math.round(a * FPS)),
      durationInFrames: Math.max(1, Math.round((b - a) * FPS)),
    };
  };

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
  /**
   * The shot is defined by the region of the page it has to show, not by a
   * zoom factor.
   *
   * Pushing in by a number got it wrong in both directions: at 1.0 the card
   * held a wall of unreadable page, and at 1.45 it held the uploaded image
   * alone with none of the tool around it — which teaches the viewer nothing.
   * `region` is the fraction of page height the shot must contain and `focus`
   * is its centre, both measured off the recording; the scale follows from
   * them. When the region is tall the footage ends up narrower than the card,
   * so it sits in a device frame rather than being stretched.
   */
  const clip = (
    from: number,
    to: number,
    k: SceneKey,
    focus: number,
    region: number,
  ) => {
    const scale = CARD.height / (region * 1920);
    const w = 1080 * scale;
    const h = 1920 * scale;
    const framed = w < 1080 - CARD.side * 2 - 8;
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div
          style={{
            position: "relative",
            width: Math.min(w, 1080 - CARD.side * 2),
            height: CARD.height - (framed ? 24 : 0),
            overflow: "hidden",
            borderRadius: framed ? 26 : 0,
            border: framed ? "3px solid #222c44" : "none",
            boxShadow: framed ? "0 16px 40px rgba(0,0,0,0.45)" : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 1080,
              height: 1920,
              marginLeft: -540,
              scale: String(scale),
              transformOrigin: "50% 0%",
              translate: `0px ${(CARD.height / 2 - focus * h) / scale}px`,
            }}
          >
            <ScreenClip
              src={`${recDir}/screen.mp4`}
              from={from}
              to={to}
              fx={0.5}
              fy={0.5}
              zoom={1.0}
              zoomTo={1.02}
              durationInFrames={seq(k).durationInFrames}
            />
          </div>
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
        <Scene durationInFrames={seq("ask").durationInFrames} current="left" isFirst>
          <Card label="Что нужно">
            <Centered>
              <Big size={146} color={ORANGE}>413 × 531</Big>
              <div style={{ fontFamily: FONT, fontSize: 42, color: "#9a968f", marginTop: 16 }}>
                35 × 45 мм · паспорт РФ
              </div>
            </Centered>
          </Card>
          <Stage pose="think" />
        </Scene>
            </Sequence>

      <Sequence name="Promise" {...seq("promise")}>
        <Scene durationInFrames={seq("promise").durationInFrames} current="left">
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
        </Scene>
            </Sequence>

      <Sequence name="Step 1" {...seq("step1")}>
        <Scene durationInFrames={seq("step1").durationInFrames} current="left">
          <Card label="Шаг 1 — qrixtools.com">{clip(26.5, 32.9, "step1", 0.30, 0.52)}</Card>
          <Stage pose="work" />
        </Scene>
            </Sequence>

      <Sequence name="Step 2" {...seq("step2")}>
        <Scene durationInFrames={seq("step2").durationInFrames} current="left">
          <Card label="Шаг 2 — загружаешь">{clip(33.0, 39.6, "step2", 0.42, 0.72)}</Card>
          <Stage pose="work" />
        </Scene>
            </Sequence>

      <Sequence name="Step 3" {...seq("step3")}>
        <Scene durationInFrames={seq("step3").durationInFrames} current="left">
          <Card label="Шаг 3 — скачиваешь">{clip(61.3, 64.6, "step3", 0.66, 0.46)}</Card>
          <Stage pose="point" />
        </Scene>
            </Sequence>

      <Sequence name="Claim" {...seq("claim")}>
        <Scene durationInFrames={seq("claim").durationInFrames} current="left">
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
        </Scene>
            </Sequence>

      <Sequence name="CTA" {...seq("cta")}>
        <Scene durationInFrames={seq("cta").durationInFrames} current="up" isLast>
          <Card label="Готово">
            <Centered>
              {/* The domain is the only thing on this card a viewer can act
                  on, so it is the largest thing on it. */}
              <Big size={96} color={ORANGE}>qrixtools.com</Big>
              <div style={{ fontFamily: FONT, fontSize: 54, fontWeight: 700, color: "#ecebe7", marginTop: 30 }}>
                185 инструментов
              </div>
              <div style={{ fontFamily: FONT, fontSize: 40, color: "#9a968f", marginTop: 12 }}>
                бесплатно · без водяных знаков
              </div>
            </Centered>
          </Card>
          <Stage pose="cheer" />
        </Scene>
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
