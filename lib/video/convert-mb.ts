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

/** True when the browser (or Mediabunny's bundled encoder) can produce MP3. */
export async function canOutputMp3(): Promise<boolean> {
  try {
    const { canEncodeAudio } = await import("mediabunny");
    return await canEncodeAudio("mp3");
  } catch {
    return false;
  }
}

/** Extract the soundtrack as a real MP3 (audio-only, video discarded). */
export async function extractAudioMp3(source: Blob, onProgress?: (p: number) => void): Promise<Blob> {
  const { Input, Output, Conversion, Mp3OutputFormat, BufferTarget, ALL_FORMATS, BlobSource } = await import("mediabunny");
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(source) });
  const output = new Output({ format: new Mp3OutputFormat(), target: new BufferTarget() });
  const conversion = await Conversion.init({
    input,
    output,
    video: { discard: true },
  } as Parameters<typeof Conversion.init>[0]);
  if (onProgress) conversion.onProgress = (p: number) => onProgress(Math.max(0, Math.min(1, p)));
  await conversion.execute();
  const buffer = output.target.buffer;
  if (!buffer) throw new Error("No audio track found.");
  return new Blob([buffer], { type: "audio/mpeg" });
}
