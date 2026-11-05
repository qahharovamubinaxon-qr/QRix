import { Easing, interpolate } from "remotion";

/**
 * Motion law, taken from the HyperFrames motion doctrine rather than invented.
 *
 * The rule that matters: how a scene exits determines how the next one enters —
 * same axis, same direction, matched speed, and the cut lands while both sides
 * are still moving. Scenes authored in isolation kill the eye's momentum at
 * every boundary, which is exactly what the previous cut did.
 *
 * The film picks one current and keeps it. LEFT is the ordinary "next beat";
 * UP is reserved, spent once, on the closing card — a conclusion rises above
 * what came before.
 */

/** Partial travel: ~12% of the frame. Never a full off-screen move. */
export const TRAVEL = Math.round(1080 * 0.12);

export const EXIT_F = 9;  // 0.30s at 30fps
export const ENTRY_F = 9;

export const POWER4_OUT = Easing.out(Easing.poly(4));
export const POWER4_IN = Easing.in(Easing.poly(4));

export type Current = "left" | "up";

const axis = (c: Current) => (c === "up" ? "y" : "x");

/**
 * Transform and opacity for one scene, given where the playhead is inside it.
 *
 * Exit and entry are the two halves of a single power4.inOut, so velocity
 * matches exactly across the cut. The outgoing side's opacity finishes early —
 * about a quarter of the way through its travel — and the incoming side does
 * not ignite until it is mid-path, which is what stops the boundary reading as
 * a crossfade.
 */
export const seamStyle = (
  frame: number,
  durationInFrames: number,
  current: Current = "left",
  isFirst = false,
  isLast = false,
) => {
  let offset = 0;
  let opacity = 1;

  if (!isFirst && frame < ENTRY_F) {
    offset = interpolate(frame, [0, ENTRY_F], [TRAVEL, 0], {
      extrapolateRight: "clamp",
      easing: POWER4_OUT,
    });
    // Ignites mid-path at 0.35 rather than fading up from zero.
    opacity = interpolate(frame, [0, ENTRY_F * 0.45, ENTRY_F * 0.8], [0, 0.35, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const out = durationInFrames - EXIT_F;
  if (!isLast && frame > out) {
    const k = frame - out;
    offset = interpolate(k, [0, EXIT_F], [0, -TRAVEL], {
      extrapolateRight: "clamp",
      easing: POWER4_IN,
    });
    // Dies right at the cut: a gap where nothing moves reads as dead air.
    opacity = interpolate(k, [0, EXIT_F * 0.75], [1, 0], {
      extrapolateRight: "clamp",
    });
  }

  const t =
    axis(current) === "y" ? `0px ${-offset}px` : `${offset}px 0px`;
  return { translate: t, opacity };
};
