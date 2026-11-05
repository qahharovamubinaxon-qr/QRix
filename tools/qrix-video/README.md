# QRix video kit

Short-form videos for the tools, built from the real product rather than mock-ups.

Not part of the Next.js app: `tools` is excluded in `tsconfig.json`, and this
folder has its own `package.json`. Nothing here ships to qrixtools.com.

## Pipeline

    scripts/<id>.json         the script: phrases, voices, per-phrase rate/pitch/gap
      ↓  pipeline/voice.py    Edge TTS (free) → public/audio/<id>.mp3 + <id>.json
      ↓  pipeline/record.mjs  Playwright uses the live tool on camera
                              → public/rec/<id>/screen.mp4 + beats.json
      ↓  pipeline/sfx.mjs     synthesised bed and markers → public/sfx/
      ↓  src/qrix/*           Remotion, cuts pinned to the voice timeline
      ↓  npx remotion render  → out/<id>.mp4

`pipeline/shots.mjs` still takes stills; the composition no longer uses them.

```bash
python pipeline/voice.py scripts/photo-413x531.json
node pipeline/record.mjs photo-413x531 https://qrixtools.com/ru/passport-photo/russia
node pipeline/sfx.mjs                 # once; the files are reusable
npx remotion render photo-413x531 out/photo-413x531.mp4 --crf=18
npx remotion studio --no-open         # live preview while editing
```

## Things that cost time to learn

**Edge TTS rate-limits bursts.** Seven back-to-back requests returned five empty
files, with no exception raised — a short file is the only signal. Hence the
4-second spacing, the retry, and the size floor in `voice.py`.

**Edge TTS pads each clip with silence.** The one-word line "Всё." measured
1.87s. Trimming it back to speech took the first cut from 54s to 33.6s; the
pacing in the script only reaches the viewer after that trim.

**The mascot's .webm loops have no alpha.** `public/scenes/bunny-*-loop.webm`
are yuv420p, so they cannot be laid over footage. The `.webp` poses are
yuva420p and are what the composition animates.

**The page is as wide as the frame.** Both are 1080, so a screenshot zoomed
past ~1.15x starts shaving words off the headline. The per-shot focus and zoom
values in `VideoShort.tsx` were set by rendering frames and looking.

**Playwright does not scale the viewport up to the video size.** Asking for a
540x960 viewport and a 1080x1920 recording pins the page to the top-left of a
grey canvas. Record at viewport size and upscale afterwards.

**Film the phone layout, not the desktop one.** A 1080-wide viewport is the
video's own width, so it quietly shoots the desktop site — whose controls then
need zooming to read, and zooming a page as wide as the frame shaves words off
both edges. A 540-wide viewport gets the mobile layout, where the tool is
already large, and nothing needs zooming at all.

**Hide the site's chrome while filming.** The header, breadcrumb and host badge
compete with the step label for the top of the frame, and the video carries its
own wordmark. `record.mjs` injects CSS that hides them; the tool itself is
untouched.

**Edge TTS gives no word timings.** These voices emit `SentenceBoundary` only —
a phrase streams back with zero `WordBoundary` events — so the word-level
captions derive their timing by dividing each measured phrase across its words
by length. Exact at the edges, tens of milliseconds out in the middle, and
drift cannot accumulate because every phrase re-syncs.

**The sound is synthesised, not sampled.** `pipeline/sfx.mjs` builds the bed
and the markers from oscillators and noise: no licence, no attribution, no
download.

**Free AI images carry a watermark.** Pollinations ignores `nologo=true`;
`assets/gen/` images are cropped before use. Given the product promises "без
водяных знаков", an un-cropped one would have been an own goal.

## The 3D cut

`photo-413x531-3d` is the same script on a 3D set: an office, a monitor
carrying a real frame of the tool, and an assistant character. Everything is
built from primitives in `src/qrix3d/pieces.tsx` — no model files.

Render it single-threaded or it dies:

```bash
npx remotion render photo-413x531-3d out/photo-413x531-3d.mp4 --crf=20 --concurrency=1
```

**`--concurrency=1` is not optional.** The default opens several tabs, each
with its own WebGL context, and this machine dies around frame 786 of 1042.

**`@react-three/postprocessing` renders an empty frame here.** The full chain
and Bloom alone both produce nothing, so it is the composer rather than any
effect. The glow is faked in 2D instead: a blurred, screen-blended layer over
the canvas — which is what bloom is.

**`useOffthreadVideoTexture` returns null here.** Proven by turning the
fallback magenta and watching the monitor turn magenta. The monitor carries a
still instead, and the walkthrough leaves the set for the live recording.

**Check camera framings against the object positions.** The first version put
the camera at z=2.9 with the chair back at z=2.87 and rendered the inside of
the furniture; the second raced to each next framing as a shot *began*, so it
was pressed against the monitor seconds before the line about it.

**Do not pipe the render's output.** `... | tr | grep | tail` closed its
stdout and killed it with `EOF / write` before a single frame — a failure that
looks exactly like a render bug and is not one.

## Voice

`ru-RU-DmitryNeural` asks, `ru-RU-SvetlanaNeural` answers. Edge TTS exposes no
SSML style, so intonation is built from contrast: per-phrase rate and pitch,
and measured gaps. A slow low line after a fast bright one reads as emphasis.
