import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { C, FONT, PAD } from "./theme";
import { Backdrop, Brand, Bunny, EASE, Shot, StepChip } from "./parts";
import { Captions, Phrase } from "./Captions";

export type Voice = {
  id: string;
  title: string;
  total: number;
  audio: string;
  phrases: Phrase[];
};

const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const Ask: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("demo-face-clean.jpg")}
        style={{
          width: 470,
          borderRadius: 28,
          border: `4px solid ${C.line}`,
          scale: String(
            interpolate(frame, [0, 26], [0.86, 1], {
              extrapolateRight: "clamp",
              easing: EASE,
            }),
          ),
          opacity: interpolate(frame, [0, 16], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: "0px -150px",
        }}
      />
      {/* The number is the whole reason this video gets found, so it is the
          largest thing on screen and it lands on the line that says it. */}
      <Sequence from={f(1.64)} layout="none">
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1120,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 148,
              fontWeight: 800,
              color: C.primary,
              letterSpacing: -2,
              scale: String(
                interpolate(frame - f(1.64), [0, 18], [0.8, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE,
                }),
              ),
              opacity: interpolate(frame - f(1.64), [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            413 × 531
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 44,
              color: C.muted,
              marginTop: 8,
            }}
          >
            35 × 45 мм · паспорт РФ
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

const Promise_: React.FC = () => {
  const frame = useCurrentFrame();
  const chips = [
    { at: 0.64, text: "Бесплатно" },
    { at: 0.64, text: "Без регистрации" },
    { at: 2.4, text: "Файл не уходит на сервер" },
  ];
  return (
    <AbsoluteFill>
      <Bunny pose="point" height={1120} side="right" offset={-60} bottom={-20} />
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: 430,
          width: 620,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {chips.map((c, i) => (
          <div
            key={c.text}
            style={{
              alignSelf: "flex-start",
              fontFamily: FONT,
              fontSize: 50,
              fontWeight: 700,
              color: C.text,
              backgroundColor: C.bgLift,
              border: `3px solid ${i === 2 ? C.primary : C.line}`,
              padding: "18px 30px",
              borderRadius: 999,
              opacity: interpolate(
                frame - f(c.at) - i * 6,
                [0, 10],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              translate: interpolate(
                frame - f(c.at) - i * 6,
                [0, 14],
                ["-30px 0px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE,
                },
              ),
            }}
          >
            {c.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Claim: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: PAD, paddingRight: PAD }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 96,
          fontWeight: 800,
          color: C.text,
          lineHeight: 1.1,
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 20], ["0px 26px", "0px 0px"], {
            extrapolateRight: "clamp",
            easing: EASE,
          }),
        }}
      >
        Обработка —<br />
        <span style={{ color: C.primary }}>в браузере</span>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 48,
          color: C.muted,
          marginTop: 36,
          maxWidth: 820,
          lineHeight: 1.35,
          opacity: interpolate(frame, [14, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Снимок не загружается на сервер. Он остаётся на твоём устройстве.
      </div>
      <Bunny pose="hero" height={620} side="right" offset={-80} bottom={-30} />
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 132,
          fontWeight: 800,
          color: C.primary,
          letterSpacing: 4,
          scale: String(
            interpolate(frame, [0, 20], [0.88, 1], {
              extrapolateRight: "clamp",
              easing: EASE,
            }),
          ),
          translate: "0px -260px",
        }}
      >
        QRIX
      </div>
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          top: 880,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 62,
          fontWeight: 700,
          color: C.text,
          opacity: interpolate(frame, [12, 28], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        185 инструментов
        <div style={{ fontSize: 46, color: C.muted, marginTop: 14 }}>
          бесплатно · без водяных знаков
        </div>
        <div
          style={{
            marginTop: 46,
            display: "inline-block",
            fontSize: 54,
            fontWeight: 800,
            color: C.bg,
            backgroundColor: C.primary,
            padding: "22px 44px",
            borderRadius: 999,
            opacity: interpolate(frame, [30, 46], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          qrixtools.com
        </div>
      </div>
      <Bunny pose="walk" height={760} side="left" offset={-50} bottom={-30} />
    </AbsoluteFill>
  );
};

export const VideoShort: React.FC<{ voice: Voice; shotDir: string }> = ({
  voice,
  shotDir,
}) => {
  // Scene boundaries are pinned to the voice track, not guessed: the cut has
  // to land on the sentence that describes it or the demo stops teaching.
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
    from: f(S[k][0]),
    durationInFrames: f(S[k][1] - S[k][0]),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />

      <Sequence name="Ask" {...seq("ask")}>
        <Ask />
      </Sequence>

      <Sequence name="Promise" {...seq("promise")}>
        <Promise_ />
      </Sequence>

      <Sequence name="Step 1 — open" {...seq("step1")}>
        {/* The page is 1080 wide and so is the frame, so anything past ~1.15x
            starts shaving words off the headline. These numbers were set by
            rendering the frames, not by eye. */}
        <Shot
          src={`${shotDir}/01-landing.png`}
          fx={0.5}
          fy={0.17}
          from={1.0}
          to={1.12}
          durationInFrames={seq("step1").durationInFrames}
        />
        <StepChip n={1} label="Открываешь инструмент" />
        <Bunny pose="point" height={420} side="right" offset={-40} bottom={320} />
      </Sequence>

      <Sequence name="Step 2 — upload" {...seq("step2")}>
        <Shot
          src={`${shotDir}/02-uploaded.png`}
          fx={0.5}
          fy={0.36}
          from={1.18}
          to={1.32}
          durationInFrames={seq("step2").durationInFrames}
        />
        <StepChip n={2} label="Загружаешь фото" />
      </Sequence>

      <Sequence name="Step 3 — download" {...seq("step3")}>
        <Shot
          src={`${shotDir}/03-crop.png`}
          fx={0.38}
          fy={0.27}
          from={1.40}
          to={1.52}
          durationInFrames={seq("step3").durationInFrames}
        />
        <StepChip n={3} label="Скачиваешь 413×531" />
      </Sequence>

      <Sequence name="Claim" {...seq("claim")}>
        <Claim />
      </Sequence>

      <Sequence name="CTA" {...seq("cta")}>
        <Cta />
      </Sequence>

      <Brand />
      <Captions phrases={voice.phrases} />
      <Audio src={staticFile(voice.audio)} />
    </AbsoluteFill>
  );
};
