/**
 * QRix content factory — sound design, synthesised.
 *
 * The first cut had no sound but the voice, and the gaps between lines read as
 * dead air. The obvious fix is a stock library, but the good ones want an
 * account and the free ones want attribution the video has no room for, so
 * these are built from oscillators and noise with ffmpeg: no licence, no
 * download, no attribution, and they sound like UI rather than like a sample
 * pack.
 *
 * Deliberately restrained. A short that punctuates every caption with a bleep
 * is worse than one with no sound at all, so these are quiet and the bed sits
 * far under the voice.
 *
 * Usage: node pipeline/sfx.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "public", "sfx");
mkdirSync(out, { recursive: true });

const ff = (args) => execFileSync("ffmpeg", ["-y", "-v", "error", ...args]);

/** A soft marker for a word or chip landing: two partials, very fast decay. */
ff([
  "-f", "lavfi", "-i", "sine=frequency=760:duration=0.30",
  "-f", "lavfi", "-i", "sine=frequency=1140:duration=0.30",
  "-filter_complex",
  "[0]volume=0.55[a];[1]volume=0.28[b];[a][b]amix=inputs=2," +
  "afade=t=out:st=0.02:d=0.26:curve=exp,highpass=f=300,volume=0.35",
  "-ar", "48000", "-ac", "1", join(out, "pop.wav"),
]);

/** The button press. Noise, band-limited, gone in 60 ms. */
ff([
  "-f", "lavfi", "-i", "anoisesrc=d=0.09:c=white:a=0.9",
  "-af",
  "bandpass=f=2100:width_type=h:w=1400," +
  "afade=t=out:st=0.006:d=0.08:curve=exp,volume=0.5",
  "-ar", "48000", "-ac", "1", join(out, "click.wav"),
]);

/** Scene change. A noise sweep that rises then clears out of the way. */
ff([
  "-f", "lavfi", "-i", "anoisesrc=d=0.55:c=pink:a=0.8",
  "-af",
  "highpass=f=200,lowpass=f=5200," +
  "afade=t=in:st=0:d=0.22:curve=qua,afade=t=out:st=0.24:d=0.3:curve=exp," +
  "volume=0.3",
  "-ar", "48000", "-ac", "1", join(out, "whoosh.wav"),
]);

/**
 * The bed: a slow, detuned two-note pad with a filtered pulse under it. Kept
 * at -26 dB so it is felt and not heard — anything louder fights the voice,
 * and the voice is the content.
 */
ff([
  "-f", "lavfi", "-i", "sine=frequency=110:duration=40",
  "-f", "lavfi", "-i", "sine=frequency=164.81:duration=40",
  "-f", "lavfi", "-i", "sine=frequency=55:duration=40",
  "-filter_complex",
  "[0]volume=0.5,tremolo=f=0.18:d=0.55[p1];" +
  "[1]volume=0.32,tremolo=f=0.11:d=0.6[p2];" +
  "[2]volume=0.42,tremolo=f=2.0:d=0.75,lowpass=f=160[sub];" +
  "[p1][p2][sub]amix=inputs=3:normalize=0," +
  "lowpass=f=900,aecho=0.8:0.85:320:0.25," +
  "afade=t=in:st=0:d=1.4,afade=t=out:st=37.5:d=2.5,volume=0.05",
  "-ar", "48000", "-ac", "2", join(out, "bed.wav"),
]);

console.log(out);
