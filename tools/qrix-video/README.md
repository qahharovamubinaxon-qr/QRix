# QRix video kit

Short-form videos for the tools, built from the real product rather than mock-ups.

Not part of the Next.js app: `tools` is excluded in `tsconfig.json`, and this
folder has its own `package.json`. Nothing here ships to qrixtools.com.

## Pipeline

    scripts/<id>.json        the script: phrases, voices, per-phrase rate/pitch/gap
      ↓  pipeline/voice.py   Edge TTS (free) → public/audio/<id>.mp3 + <id>.json
      ↓  pipeline/shots.mjs  Playwright drives the live site at 1080x1920 → public/shots/<id>/
      ↓  src/qrix/*          Remotion composition, cuts pinned to the voice timeline
      ↓  npx remotion render → out/<id>.mp4

```bash
python pipeline/voice.py scripts/photo-413x531.json
node pipeline/shots.mjs photo-413x531 https://qrixtools.com/ru/passport-photo/russia
npx remotion render photo-413x531 out/photo-413x531.mp4 --crf=18
npx remotion studio --no-open        # live preview while editing
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

**Free AI images carry a watermark.** Pollinations ignores `nologo=true`;
`assets/gen/` images are cropped before use. Given the product promises "без
водяных знаков", an un-cropped one would have been an own goal.

## Voice

`ru-RU-DmitryNeural` asks, `ru-RU-SvetlanaNeural` answers. Edge TTS exposes no
SSML style, so intonation is built from contrast: per-phrase rate and pitch,
and measured gaps. A slow low line after a fast bright one reads as emphasis.
