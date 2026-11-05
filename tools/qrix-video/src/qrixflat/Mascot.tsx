import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * The presenter.
 *
 * Rebuilt as a grid rather than used as a bitmap, because a PNG can only ever
 * bob: parametric blocks can blink, step, lean and raise an arm, and poses are
 * the whole point of this format — the reference changes its presenter's pose
 * on nearly every line.
 *
 * The shape was read off the image the owner sent: a 16x10 grid, body rows
 * 0-7 across columns 2-13, eye holes at columns 4 and 11, arms reaching the
 * full width on rows 4-5, and four legs below. The colour is QRix's own
 * orange rather than the clay of the original, which keeps the silhouette he
 * picked without putting another company's brand mark in QRix's marketing.
 */

const ORANGE = "#ff4d1c";

export type Pose = "idle" | "point" | "think" | "work" | "cheer";

type Props = {
  pose?: Pose;
  /** Grid cell in px — the whole character is 16 cells wide, 10 tall. */
  cell?: number;
  color?: string;
};

export const Mascot: React.FC<Props> = ({ pose = "idle", cell = 26, color = ORANGE }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  // Breathing, and a step cycle the legs share so the walk reads as one motion.
  const bob = Math.sin(t * 2.1) * 0.12;
  const step = Math.sin(t * 5.2);
  const lean = pose === "think" ? -6 : pose === "point" ? 4 : 0;

  // A blink every few seconds, closed for about four frames.
  const blinkPhase = (t * 0.55) % 1;
  const eyeOpen = blinkPhase > 0.955 ? 0.12 : 1;

  const armLeft = pose === "cheer" ? -38 : pose === "work" ? 14 : pose === "think" ? 8 : 0;
  const armRight = pose === "cheer" ? 38 : pose === "point" ? -42 : pose === "work" ? 14 : 0;

  const px = (n: number) => n * cell;
  const W = px(16);
  const H = px(10);

  const block = (x: number, y: number, w: number, h: number, key: string) => (
    <rect key={key} x={px(x)} y={px(y)} width={px(w)} height={px(h)} fill={color} />
  );

  return (
    <svg
      width={W}
      height={H + px(1)}
      viewBox={`0 0 ${W} ${H + px(1)}`}
      style={{
        overflow: "visible",
        translate: `0px ${bob * cell}px`,
        rotate: `${lean * 0.25}deg`,
      }}
    >
      {/* Body */}
      {block(2, 0, 12, 8, "body")}

      {/* Eyes are holes punched in the body, so they take the page colour. */}
      <rect
        x={px(4)} width={px(1)} fill="#ffffff"
        y={px(2) + ((1 - eyeOpen) * px(2)) / 2}
        height={px(2) * eyeOpen}
      />
      <rect
        x={px(11)} width={px(1)} fill="#ffffff"
        y={px(2) + ((1 - eyeOpen) * px(2)) / 2}
        height={px(2) * eyeOpen}
      />

      {/* Arms: one block each side, hinged at the shoulder so a pose can lift
          them without the body moving. */}
      <g style={{ transformOrigin: `${px(2)}px ${px(5)}px`, rotate: `${armLeft}deg` }}>
        {block(0, 4, 2, 2, "armL")}
      </g>
      <g style={{ transformOrigin: `${px(14)}px ${px(5)}px`, rotate: `${armRight}deg` }}>
        {block(14, 4, 2, 2, "armR")}
      </g>

      {/* Legs. In 'work' they stay planted; otherwise they alternate. */}
      {[3, 5, 10, 12].map((x, i) => {
        const phase = i % 2 === 0 ? step : -step;
        const lift = pose === "work" ? 0 : Math.max(0, phase) * 0.35;
        return (
          <rect
            key={`leg${x}`}
            x={px(x)}
            y={px(8) - lift * cell}
            width={px(1)}
            height={px(2)}
            fill={color}
          />
        );
      })}
    </svg>
  );
};

/** Slides the presenter in from the bottom when a scene starts. */
export const MascotStage: React.FC<{ pose?: Pose; cell?: number }> = ({ pose, cell = 30 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 96,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
        translate: interpolate(frame, [0, 14], ["0px 40px", "0px 0px"], {
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <Mascot pose={pose} cell={cell} />
    </div>
  );
};
