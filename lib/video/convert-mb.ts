/* Real in-browser video transcoding via Mediabunny (WebCodecs).
   Unlike the canvas→MediaRecorder path, this demuxes and re-encodes the
   actual stream — true MP4/H.264 output, real bitrate compression, exact
   resolution and trimming, with no screen-recapture quality loss.

   Mediabunny is ESM + WebCodecs, so it is imported lazily and only ever
   runs in the browser. Callers should fall back to the canvas encoder when
   `convertVideo` throws (unsupported source codec, no WebCodecs, etc.). */

export type MbFit = "contain" | "cover" | "fill";

export type MbConvertOpts = {
  bitrate?: number;                 // target video bitrate (bps) — compression
  width?: number;                   // target width  (resize / resolution)
  height?: number;                  // target height
  fit?: MbFit;                      // how the frame fits the target box
  trim?: { start: number; end: number }; // seconds
  muteAudio?: boolean;              // drop the audio track
  format?: "mp4" | "webm" | "auto"; // container; "auto" prefers MP4 when encodable
  onProgress?: (p: number) => void; // 0..1
};

export type MbResult = { blob: Blob; ext: "mp4" | "webm" };

/** True when the browser can encode H.264 (so we can emit real MP4). */
export async function canOutputMp4(): Promise<boolean> {
  try {
    const { canEncodeVideo } = await import("mediabunny");
    return await canEncodeVideo("avc");
  } catch {
    return false;
  }
}

export async function convertVideo(source: Blob, opts: MbConvertOpts = {}): Promise<MbResult> {
  const {
    Input, Output, Conversion, Mp4OutputFormat, WebMOutputFormat,
    BufferTarget, ALL_FORMATS, BlobSource, canEncodeVideo,
  } = await import("mediabunny");

  // Choose the container. "webm" forces VP9/Opus; otherwise prefer MP4/H.264
  // when the browser can encode it, else fall back to WebM.
  let useMp4 = opts.format !== "webm";
  if (useMp4) {
    try { useMp4 = await canEncodeVideo("avc"); } catch { useMp4 = false; }
  }

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(source) });
  const output = new Output({
    format: useMp4 ? new Mp4OutputFormat() : new WebMOutputFormat(),
    target: new BufferTarget(),
  });

  const video: Record<string, unknown> = {};
  if (opts.bitrate) video.bitrate = opts.bitrate;
  if (opts.width && opts.height) {
    video.width = opts.width;
    video.height = opts.height;
    video.fit = opts.fit ?? "contain";
  }

  const conversion = await Conversion.init({
    input,
    output,
    ...(Object.keys(video).length ? { video } : {}),
    ...(opts.muteAudio ? { audio: { discard: true } } : {}),
    ...(opts.trim ? { trim: opts.trim } : {}),
  } as Parameters<typeof Conversion.init>[0]);

  if (opts.onProgress) {
    conversion.onProgress = (p: number) => opts.onProgress!(Math.max(0, Math.min(1, p)));
  }

  await conversion.execute();

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("Conversion produced no output.");
  const ext = useMp4 ? "mp4" : "webm";
  return { blob: new Blob([buffer], { type: `video/${ext}` }), ext };
}

/* ── Audio extraction — MP3 / M4A / WAV / OGG ──────────────────
   MP3 is guaranteed everywhere: when the browser has no native MP3
   encoder, the official @mediabunny/mp3-encoder (LAME/WASM, lazy-loaded)
   is registered once. M4A (AAC) and OGG (Opus) depend on WebCodecs;
   WAV is plain PCM and always works. */

export type AudioFormat = "mp3" | "m4a" | "wav" | "ogg";

let mp3Registered = false;
async function ensureMp3Encoder(): Promise<void> {
  if (mp3Registered) return;
  const { canEncodeAudio } = await import("mediabunny");
  if (!(await canEncodeAudio("mp3"))) {
    const { registerMp3Encoder } = await import("@mediabunny/mp3-encoder");
    registerMp3Encoder();
  }
  mp3Registered = true;
}

/** True when the browser (or Mediabunny's bundled encoder) can produce MP3. */
export async function canOutputMp3(): Promise<boolean> {
  try {
    await ensureMp3Encoder();
    const { canEncodeAudio } = await import("mediabunny");
    return await canEncodeAudio("mp3");
  } catch {
    return false;
  }
}

/** Which of the audio formats this browser can actually encode. */
export async function supportedAudioFormats(): Promise<Record<AudioFormat, boolean>> {
  const out: Record<AudioFormat, boolean> = { mp3: false, m4a: false, wav: true, ogg: false };
  try {
    await ensureMp3Encoder();
    const { canEncodeAudio } = await import("mediabunny");
    const [mp3, aac, opus] = await Promise.all([
      canEncodeAudio("mp3").catch(() => false),
      canEncodeAudio("aac").catch(() => false),
      canEncodeAudio("opus").catch(() => false),
    ]);
    out.mp3 = mp3; out.m4a = aac; out.ogg = opus;
  } catch { /* wav-only */ }
  return out;
}

/** Extract the soundtrack in the chosen format (video discarded). */
export async function extractAudio(
  source: Blob,
  format: AudioFormat,
  onProgress?: (p: number) => void,
): Promise<{ blob: Blob; ext: AudioFormat; mime: string }> {
  if (format === "mp3") await ensureMp3Encoder();
  const {
    Input, Output, Conversion, BufferTarget, ALL_FORMATS, BlobSource,
    Mp3OutputFormat, Mp4OutputFormat, WavOutputFormat, OggOutputFormat,
  } = await import("mediabunny");

  const containers: Record<AudioFormat, { fmt: unknown; mime: string }> = {
    mp3: { fmt: new Mp3OutputFormat(), mime: "audio/mpeg" },
    m4a: { fmt: new Mp4OutputFormat(), mime: "audio/mp4" }, // audio-only MP4 = M4A
    wav: { fmt: new WavOutputFormat(), mime: "audio/wav" },
    ogg: { fmt: new OggOutputFormat(), mime: "audio/ogg" },
  };
  const { fmt, mime } = containers[format];

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(source) });
  const output = new Output({ format: fmt as never, target: new BufferTarget() });
  const conversion = await Conversion.init({
    input,
    output,
    video: { discard: true },
  } as Parameters<typeof Conversion.init>[0]);
  if (onProgress) conversion.onProgress = (p: number) => onProgress(Math.max(0, Math.min(1, p)));
  await conversion.execute();
  const buffer = output.target.buffer;
  if (!buffer) throw new Error("No audio track found.");
  return { blob: new Blob([buffer], { type: mime }), ext: format, mime };
}

/** Extract the soundtrack as a real MP3 (audio-only, video discarded). */
export async function extractAudioMp3(source: Blob, onProgress?: (p: number) => void): Promise<Blob> {
  return (await extractAudio(source, "mp3", onProgress)).blob;
}
