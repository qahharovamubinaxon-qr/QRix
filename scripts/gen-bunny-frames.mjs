/**
 * Extracts the scroll-scrub frame sequence for the hero bunny.
 *
 * Why frames and not the video: scrubbing a video by scroll means seeking, and a
 * normal WebM only has a keyframe every couple of seconds — every seek in between
 * costs a decode, which stutters. The fix is to re-encode with every frame a
 * keyframe, and that inflates the file by an order of magnitude. An image sequence
 * has no seek cost at all: the browser picks the frame the scroll position asks
 * for and blits it. It is what Apple does on its product pages, and here it comes
 * out SMALLER than the source video.
 *
 * The alpha matters: `-c:v libvpx-vp9` before the input forces the libvpx decoder,
 * which is the only one that reads WebM's alpha side-stream. The native VP9 decoder
 * silently drops it and you get an opaque black box where the bunny should be.
 *
 * The source has a defect. bunny-hero-live.webm flashes white from 3.50s to 4.57s
 * — the bunny turns into a pale ghost for about a second, every loop, on the live
 * site today. This script measures every frame's body luminance and refuses to emit
 * any frame that is far above the median, so the flash can never reach the scroll
 * animation even if someone widens the range below.
 *
 * Run:  node scripts/gen-bunny-frames.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "public/scenes/bunny-hero-live.webm";
const OUT = "public/scenes/bunny-point";
const WIDTH = 440;          // the hero renders the bunny at ~26vw
const QUALITY = 72;
/* The source washes out from 3.50s, but it RAMPS there — measured against a 116.7
   baseline the body luma is 114 at frame 98, then 132 · 141 · 157 · 180 · 192.
   Cutting at 104 (the first frame the coarse detector flagged) still shipped a
   bunny 40 points too bright at the end of the scroll. 98 is the last frame that is
   genuinely at baseline. */
const LAST_CLEAN_FRAME = 98;
const STEP = 2;             // 30fps → 15fps; scroll is nowhere near that fast

/* The gate measures at 110x192, not the 44x77 it started at: downscaling that hard
   averages a brightening bunny into its own transparent surroundings and the ramp
   disappears into the noise. A clean run varies by ±3, so +14 is four times the
   natural spread and still catches frame 100 (+15). */
const GATE_W = 110, GATE_H = 192, GATE_TOLERANCE = 14;

/* ── 1. how bright is each frame's body? ──────────────────────────────────────
   Decode small and raw, and average the luma only where the bunny actually is
   (alpha > 140). A good frame sits near the median; a frame where the decoder has
   handed us the alpha plane as colour — or where the source flashes — sits far
   above it.

   `input` is anything ffmpeg can read, so this runs on the SOURCE VIDEO and, more
   importantly, on the FRAMES THAT WERE ACTUALLY WRITTEN. The first version only
   checked the source range and trusted the extraction to honour it — the extraction
   did not (see below), and sixteen white frames sailed straight through a check
   that had passed. Validate the artefact, not the plan. */
function bodyLuma(inputArgs) {
  const W = GATE_W, H = GATE_H, FS = W * H * 4;
  const raw = execFileSync("ffmpeg", [
    "-v", "error", ...inputArgs,
    "-vf", `scale=${W}:${H}`, "-f", "rawvideo", "-pix_fmt", "rgba", "-",
  ], { maxBuffer: 1 << 28 });

  const out = [];
  for (let f = 0; f * FS + FS <= raw.length; f++) {
    let sum = 0, n = 0;
    for (let p = 0; p < W * H; p++) {
      const o = f * FS + p * 4;
      if (raw[o + 3] > 140) { sum += 0.299 * raw[o] + 0.587 * raw[o + 1] + 0.114 * raw[o + 2]; n++; }
    }
    out.push(n > 200 ? sum / n : NaN);
  }
  return out;
}

function washedOut(luma) {
  const valid = luma.filter(Number.isFinite).sort((a, b) => a - b);
  const median = valid[Math.floor(valid.length / 2)];
  const limit = median + GATE_TOLERANCE;
  return { median, limit, bad: luma.map((l, i) => ({ i, l })).filter((x) => x.l > limit) };
}

/* ── 2. cut the frames ────────────────────────────────────────────────────────
   The range is enforced INSIDE select. `-frames:v` was the first attempt and it is
   the wrong knob: it caps how many frames come OUT, so with a select that keeps
   every 2nd frame it happily read 209 source frames to produce 105 — straight
   through the flash. select's own `lte(n, …)` is on the source index, which is what
   "stop before the flash" actually means. */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

console.log("extracting…");
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-c:v", "libvpx-vp9",            // MUST precede -i: the only decoder that reads WebM alpha
  "-i", SRC,
  "-vf", `select='lte(n\\,${LAST_CLEAN_FRAME})*not(mod(n\\,${STEP}))',scale=${WIDTH}:-1`,
  "-vsync", "0",
  "-c:v", "libwebp", "-q:v", String(QUALITY), "-compression_level", "6",
  join(OUT, "%03d.webp"),
], { stdio: "inherit" });

const files = readdirSync(OUT).filter((f) => f.endsWith(".webp")).sort();
const bytes = files.reduce((s, f) => s + statSync(join(OUT, f)).size, 0);
const srcBytes = statSync(SRC).size;

/* ── 3. the gate: check what is on disk ─────────────────────────────────────── */
console.log("checking the emitted frames…");
const { median, limit, bad } = washedOut(bodyLuma(["-i", join(OUT, "%03d.webp")]));
console.log(`  frames written   : ${files.length}`);
console.log(`  median body luma : ${median.toFixed(1)}  (flag above ${limit.toFixed(0)})`);
if (bad.length) {
  throw new Error(
    `${bad.length} washed-out frame(s) reached the output — first at index ${bad[0].i} ` +
    `(luma ${bad[0].l.toFixed(0)}). The bunny must never flash white on the page. ` +
    `Lower LAST_CLEAN_FRAME and re-run.`
  );
}
console.log(`  washed-out       : none ✓`);

/* ── 3. the manifest the component reads ────────────────────────────────────── */
const height = Math.round((WIDTH * 1260) / 720); // source is 720x1260

writeFileSync("lib/bunny-frames.ts",
`/* GENERATED by scripts/gen-bunny-frames.mjs — do not edit by hand.

   The hero bunny as a scroll-scrubbable image sequence. Frames are cut from
   public/scenes/bunny-hero-live.webm, whose alpha only survives the libvpx decoder,
   and stop at source frame ${LAST_CLEAN_FRAME}: that video flashes white from 3.50s to 4.57s and the
   generator refuses to emit a washed-out frame. */

export const BUNNY_FRAMES = ${files.length};
export const BUNNY_W = ${WIDTH};
export const BUNNY_H = ${height};

/** 1-indexed, zero-padded to three: /scenes/bunny-point/001.webp */
export const bunnyFrameSrc = (i: number) =>
  \`/scenes/bunny-point/\${String(i + 1).padStart(3, "0")}.webp\`;
`);

console.log(`\nwrote ${OUT}/  — ${files.length} frames, ${(bytes / 1048576).toFixed(2)} MB`);
console.log(`     (the source video is ${(srcBytes / 1048576).toFixed(2)} MB and cannot be scrubbed)`);
console.log(`wrote lib/bunny-frames.ts`);
