/* ============================================================
   Video Tools registry — single source of truth for /video-tools.
   Engine keys → components/video/VideoEngineRegistry:
     recode:<preset>  canvas→MediaRecorder re-encode core
       presets: trim cut compress optimizer convert resize
                resolution crop rotate flip speed mute watermark
                merge split
     meta | thumbnail | screenshot | frames
     audio-extract | mp3-to-mp4 | add-audio
     togif | gif-to-mp4
     srt-edit | srt-translate | subgen
     reverse (connector preview)
   status "live" = fully working on-device; "preview" = complete
   UI wired to the cloud connector (lib/ai-connector.ts).
   ============================================================ */

export type VideoCategory = "Convert" | "Compress" | "Edit" | "Audio" | "GIF" | "Frames" | "Subtitles";

export type VideoTool = {
  slug: string;
  title: string;
  short: string;
  desc: string;
  emoji: string;
  grad: string;
  category: VideoCategory;
  engine: string;
  status: "live" | "preview";
  popular?: boolean;
  isNew?: boolean;
  keywords: string[];
  intro: string;
  about: string;
  steps: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
};

const PRIVATE = { q: "Is my video uploaded to a server?", a: "No — everything runs on your device in the browser. Your videos never leave your computer." };
const FREE = { q: "Is this tool free?", a: "Yes — completely free, no watermark, no signup, no file limits beyond your device's memory." };
const WEBM = { q: "What format is the output?", a: "Real MP4 (H.264) where your browser can encode it — Chrome, Edge and Safari — with WebM (VP9) as an automatic fallback elsewhere. Everything is transcoded on your device; nothing is uploaded." };
const SIZE = { q: "How large can my video be?", a: "Processing is in-memory, so a few hundred MB works comfortably on most devices; very long 4K files depend on your RAM." };

const STEPS3 = (a: string, b: string, c: string) => [
  { title: "Upload your video", desc: a },
  { title: "Tune the settings", desc: b },
  { title: "Process & download", desc: c },
];

const RECODE_STEPS = STEPS3(
  "Drag & drop, browse, or paste — the player and timeline load instantly.",
  "Use the live preview and timeline to dial in exactly what you need.",
  "Watch the animated progress, preview the result, download the file."
);

export const VIDEO_TOOLS: VideoTool[] = [
  /* ── COMPRESS ── */
  {
    slug: "compress-video", title: "Video Compressor", short: "Compressor",
    desc: "Compress videos right in your browser — pick a quality level, watch live progress and download a much smaller file. Free & private.",
    emoji: "🗜️", grad: "linear-gradient(135deg,#e1ff04,#84cc16)", category: "Compress",
    engine: "recode:compress", status: "live", popular: true,
    keywords: ["compress video", "video compressor", "reduce video size", "make video smaller"],
    intro: "Shrink videos for chat apps, email and uploads — quality slider, live progress, no upload.",
    about: "The Video Compressor re-encodes your video on-device at a bitrate you choose — from light compression that's visually lossless to aggressive shrinking for messengers. There is no server queue and no privacy risk because the file never leaves your machine: the browser's hardware encoder does the work. Typical results: 60–85% smaller files.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE, { q: "How much smaller will my video get?", a: "At the Balanced setting most videos shrink 60–80% with little visible difference; the Strong setting goes further for chat apps." }],
  },
  {
    slug: "video-optimizer", title: "Video Optimizer", short: "Optimizer",
    desc: "One-click video optimization for web and social — smart bitrate, smooth playback, smaller files. Free, in your browser.",
    emoji: "⚡", grad: "linear-gradient(135deg,#f59e0b,#d97706)", category: "Compress",
    engine: "recode:optimizer", status: "live",
    keywords: ["optimize video", "video for web", "reduce video bitrate", "social media video size"],
    intro: "The set-and-forget preset: web-ready bitrate and smooth playback in one click.",
    about: "The Optimizer applies a web-tuned encoding profile — a bitrate ceiling chosen for fast page loads and smooth playback on mobile networks. It's the compressor with opinionated defaults: perfect when you just want the file 'good for the web' without thinking about settings.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE],
  },

  /* ── CONVERT ── */
  {
    slug: "video-converter", title: "Video Converter", short: "Converter",
    desc: "Convert MP4, MOV and AVI between MP4 and WebM right in your browser — real transcoding, free and private.",
    emoji: "🔄", grad: "linear-gradient(135deg,#38bdf8,#0369a1)", category: "Convert",
    engine: "recode:convert", status: "live", popular: true,
    keywords: ["video converter", "convert video online", "mp4 to webm", "webm to mp4", "mov converter"],
    intro: "Any playable video in → choose MP4 or WebM out. Fast, private, free.",
    about: "The Converter re-encodes anything your browser can play (MP4, MOV, MKV, AVI with common codecs) to either MP4 (H.264) or WebM (VP9). It uses your browser's built-in WebCodecs engine to demux and re-encode the actual video stream on your device — real transcoding with live progress, not a screen recording, and nothing is uploaded.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE, { q: "Can I convert to MP4?", a: "Yes. Pick MP4 as the output and the tool encodes real H.264 MP4 on your device wherever your browser supports it (Chrome, Edge, Safari). You can also convert MP4 to WebM." }],
  },
  {
    slug: "change-resolution", title: "Change Video Resolution", short: "Resolution",
    desc: "Convert videos to 480p, 720p, 1080p or 4K — clean scaling with live preview, free in your browser.",
    emoji: "📺", grad: "linear-gradient(135deg,#a78bfa,#6d28d9)", category: "Convert",
    engine: "recode:resolution", status: "live",
    keywords: ["change video resolution", "video to 1080p", "video to 720p", "upscale video 4k"],
    intro: "One click to 480p / 720p / 1080p / 4K with correct aspect ratio.",
    about: "Change Resolution rescales your video to standard sizes — 480p for messengers, 720p/1080p for social and web, 4K for displays — preserving the aspect ratio with letterbox-free scaling. Everything renders through the on-device pipeline with live progress.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, { q: "Does upscaling add detail?", a: "Scaling up gives you the pixel count; for AI detail enhancement use the AI Image Upscaler on extracted frames or wait for the cloud video engine." }],
  },
  {
    slug: "resize-video", title: "Resize Video", short: "Resize",
    desc: "Resize a video to exact dimensions or social presets (Story, Square, Landscape) — free, in your browser.",
    emoji: "📐", grad: "linear-gradient(135deg,#34d399,#059669)", category: "Convert",
    engine: "recode:resize", status: "live",
    keywords: ["resize video", "video dimensions", "instagram story video size", "square video"],
    intro: "Exact width×height or one-tap social presets — 9:16, 1:1, 16:9.",
    about: "Resize Video scales and letterboxes/crops your footage to exact pixel dimensions or platform presets: Instagram Story 1080×1920, Square 1080×1080, YouTube 1920×1080. The preview shows precisely what will render, then the on-device pipeline exports it.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE],
  },

  /* ── EDIT ── */
  {
    slug: "trim-video", title: "Trim Video", short: "Trim",
    desc: "Trim a video with draggable timeline handles and frame thumbnails — export just the part you need. Free & private.",
    emoji: "✂️", grad: "linear-gradient(135deg,#e1ff04,#a3e635)", category: "Edit",
    engine: "recode:trim", status: "live", popular: true,
    keywords: ["trim video", "cut video online", "shorten video", "video trimmer"],
    intro: "Drag two handles on a thumbnail timeline, export exactly that segment.",
    about: "Trim Video gives you a professional timeline: frame thumbnails, draggable in/out handles, a live playhead and precise time readouts. Set the segment, preview it, and export just that portion — processed entirely on your device with animated progress.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE, { q: "How precise is the trim?", a: "Frame-accurate to the preview: what you see between the handles is exactly what exports." }],
  },
  {
    slug: "cut-video", title: "Cut Video", short: "Cut",
    desc: "Cut a section out of a video — mark the unwanted part on the timeline and export the rest joined together. Free & private.",
    emoji: "🔪", grad: "linear-gradient(135deg,#fb7185,#e11d48)", category: "Edit",
    engine: "recode:cut", status: "live",
    keywords: ["cut video", "remove part of video", "delete video section", "video cutter"],
    intro: "Mark the middle you don't want — export everything around it, joined.",
    about: "Cut Video removes a middle section: mark it with the timeline handles and the pipeline exports the before-part and after-part stitched into one continuous file. Perfect for cutting mistakes, silences or ads out of a recording — all on your device.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE],
  },
  {
    slug: "merge-videos", title: "Merge Videos", short: "Merge",
    desc: "Join multiple clips into one video — queue files, reorder them, export a single seamless file. Free, in your browser.",
    emoji: "🧩", grad: "linear-gradient(135deg,#22d3ee,#0e7490)", category: "Edit",
    engine: "recode:merge", status: "live", popular: true,
    keywords: ["merge videos", "combine videos", "join video clips", "video joiner"],
    intro: "Drop several clips, order them, get one continuous video out.",
    about: "Merge Videos concatenates clips through the on-device pipeline: add any number of files, drag them into order, and the engine plays each through a common canvas and encoder to produce one seamless output — resolution is unified automatically to the first clip's size.",
    steps: STEPS3("Add two or more clips — the queue shows each file.", "Reorder the queue until the story flows.", "Export one continuous video with live progress."),
    faqs: [FREE, PRIVATE, WEBM, SIZE, { q: "Can clips have different sizes?", a: "Yes — everything is scaled onto the first clip's canvas automatically." }],
  },
  {
    slug: "split-video", title: "Split Video", short: "Split",
    desc: "Split a video into two files at any point — pick the moment on the timeline and download both halves. Free & private.",
    emoji: "🪓", grad: "linear-gradient(135deg,#f97316,#c2410c)", category: "Edit",
    engine: "recode:split", status: "live",
    keywords: ["split video", "divide video", "video splitter", "cut video in two"],
    intro: "One video in, two videos out — split at the exact frame you choose.",
    about: "Split Video divides a file at the playhead: part A (start → split point) and part B (split point → end) are exported one after another as separate downloads. Handy for chaptering long recordings or sharing halves separately.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE],
  },
  {
    slug: "crop-video", title: "Crop Video", short: "Crop",
    desc: "Crop out part of the frame — drag the crop box on a live preview and export just that region. Free, in your browser.",
    emoji: "🔲", grad: "linear-gradient(135deg,#bba9ff,#7c3aed)", category: "Edit",
    engine: "recode:crop", status: "live",
    keywords: ["crop video", "video crop online", "cut video frame", "remove edges video"],
    intro: "Drag a crop box over the preview — export only what's inside.",
    about: "Crop Video lets you draw and drag a crop region directly on the live preview — trim away letterboxes, focus on a subject or reframe for a different aspect. The pipeline renders only the cropped pixels at full quality.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, SIZE],
  },
  {
    slug: "rotate-video", title: "Rotate Video", short: "Rotate",
    desc: "Rotate a video 90°, 180° or 270° and save it that way — fix sideways phone videos in seconds. Free & private.",
    emoji: "🔁", grad: "linear-gradient(135deg,#38bdf8,#2563eb)", category: "Edit",
    engine: "recode:rotate", status: "live",
    keywords: ["rotate video", "fix sideways video", "turn video 90 degrees", "video rotation"],
    intro: "Sideways phone video? One tap makes it permanent-upright.",
    about: "Rotate Video turns your footage in 90° steps and bakes the rotation into the file, so it plays upright everywhere — no more players that ignore rotation metadata. The preview shows the result before you export.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM],
  },
  {
    slug: "flip-video", title: "Flip Video", short: "Flip",
    desc: "Mirror a video horizontally or vertically — fix mirrored selfies and camera feeds. Free, in your browser.",
    emoji: "🪞", grad: "linear-gradient(135deg,#34d399,#0d9488)", category: "Edit",
    engine: "recode:flip", status: "live",
    keywords: ["flip video", "mirror video", "unmirror selfie video", "horizontal flip"],
    intro: "Un-mirror selfie clips or flip vertically — preview first, then export.",
    about: "Flip Video mirrors your footage horizontally (the classic selfie fix) or vertically. The live preview shows the flip before you commit, and the on-device pipeline exports at full quality.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM],
  },
  {
    slug: "video-speed", title: "Video Speed Controller", short: "Speed",
    desc: "Speed a video up to 4× or slow it to 0.25× — timelapse and slow-motion effects free, in your browser.",
    emoji: "⏩", grad: "linear-gradient(135deg,#e1ff04,#ca8a04)", category: "Edit",
    engine: "recode:speed", status: "live",
    keywords: ["change video speed", "speed up video", "slow motion video", "timelapse maker"],
    intro: "0.25×–4×: turn recordings into timelapses or buttery slow-mo.",
    about: "The Speed Controller re-times your video from quarter-speed slow motion to 4× timelapse, audio included. The preview plays at the selected rate so you hear and see the result before exporting.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, { q: "What happens to the audio?", a: "Audio follows the new speed. For silent output, combine with the Mute option." }],
  },
  {
    slug: "mute-video", title: "Mute Video", short: "Mute",
    desc: "Remove all audio from a video in one click — a clean silent file, free and private in your browser.",
    emoji: "🔇", grad: "linear-gradient(135deg,#9ca3af,#4b5563)", category: "Edit",
    engine: "recode:mute", status: "live",
    keywords: ["mute video", "remove audio from video", "silent video", "delete video sound"],
    intro: "Strip the soundtrack completely — one click, silent file out.",
    about: "Mute Video exports your footage with the audio track removed entirely — smaller file, total silence, no residual noise. Perfect before adding a new soundtrack or posting where audio isn't wanted.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM],
  },
  {
    slug: "watermark-video", title: "Watermark Video", short: "Watermark",
    desc: "Stamp your brand name or © notice on every frame — position, size and opacity controls. Free, in your browser.",
    emoji: "💧", grad: "linear-gradient(135deg,#22d3ee,#0891b2)", category: "Edit",
    engine: "recode:watermark", status: "live",
    keywords: ["watermark video", "add text to video", "brand video", "copyright video"],
    intro: "Burn a text watermark into the pixels — position, size, opacity.",
    about: "Watermark Video renders your text — brand, handle or © notice — onto every frame with your chosen corner, size and opacity. Because it's burned into the pixels, it survives re-uploads and screenshots.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, WEBM, { q: "Can I use a logo image?", a: "Text watermarks today; image watermarks are on the roadmap." }],
  },
  {
    slug: "reverse-video", title: "Reverse Video", short: "Reverse",
    desc: "Play a video backwards. The workspace is ready — frame-buffer reversal activates with the cloud engine for long files.",
    emoji: "⏪", grad: "linear-gradient(135deg,#f0abfc,#c026d3)", category: "Edit",
    engine: "reverse", status: "preview",
    keywords: ["reverse video", "play video backwards", "backwards video effect"],
    intro: "The classic backwards effect — short clips today, long files with the cloud engine.",
    about: "Reversing requires buffering every frame, which browsers can only do for short clips. This workspace reverses clips up to ~15 seconds on-device (frame-buffered, silent) and is pre-wired through the QRix connector for full-length, audio-preserving reversal on the cloud engine.",
    steps: RECODE_STEPS,
    faqs: [FREE, PRIVATE, { q: "Why the 15-second limit?", a: "Reversal buffers every frame in memory. Longer files need the cloud engine — the page is already wired for it." }],
  },

  /* ── AUDIO ── */
  {
    slug: "extract-audio", title: "Extract Audio from Video", short: "Extract Audio",
    desc: "Pull the soundtrack out of any video as an MP3 (or lossless WAV) — free, instant, private in your browser.",
    emoji: "🎵", grad: "linear-gradient(135deg,#f472b6,#db2777)", category: "Audio",
    engine: "audio-extract", status: "live", popular: true,
    keywords: ["extract audio from video", "video to audio", "get sound from video", "rip audio", "video to mp3"],
    intro: "Video in → clean audio out. Full quality, zero upload.",
    about: "Extract Audio pulls your video's soundtrack out entirely on-device. It exports a real MP3 wherever your browser can encode one, and falls back to lossless WAV otherwise — both are universally supported and import into any editor. Nothing is uploaded.",
    steps: STEPS3("Any video with an audio track.", "Nothing to configure — extraction starts instantly.", "Download the audio file."),
    faqs: [FREE, PRIVATE, { q: "MP3 or WAV?", a: "You get a real MP3 on browsers that can encode one (most Chromium-based browsers); otherwise the tool falls back to lossless WAV automatically. Either way it stays on your device." }, SIZE],
  },
  {
    slug: "mp4-to-mp3", title: "MP4 to MP3", short: "MP4→MP3",
    desc: "Convert MP4 video to audio — extract the soundtrack as a real MP3, entirely in your browser. Free & private.",
    emoji: "🎧", grad: "linear-gradient(135deg,#a78bfa,#7c3aed)", category: "Audio",
    engine: "audio-extract", status: "live", popular: true,
    keywords: ["mp4 to mp3", "video to mp3", "convert mp4 to audio", "mp3 from video"],
    intro: "The classic conversion — soundtrack out of an MP4 in seconds.",
    about: "MP4 to MP3 pulls the audio out of your video entirely on-device. It exports a real MP3 wherever your browser can encode one, and falls back to lossless WAV otherwise — either way the file plays everywhere and imports into any editor, and nothing is uploaded.",
    steps: STEPS3("Drop your MP4 (or any video).", "Extraction starts automatically.", "Download the audio file."),
    faqs: [FREE, PRIVATE, { q: "Is the output really MP3?", a: "Yes, on browsers that can encode MP3 (most Chromium-based browsers). If yours can't, the tool automatically gives you a lossless WAV instead — both are on-device and upload nothing." }],
  },
  {
    slug: "mp3-to-mp4", title: "MP3 to MP4", short: "MP3→MP4",
    desc: "Turn audio into a video with an animated waveform — perfect for posting music or podcasts where only video is allowed.",
    emoji: "🌊", grad: "linear-gradient(135deg,#38bdf8,#1d4ed8)", category: "Audio",
    engine: "mp3-to-mp4", status: "live", isNew: true,
    keywords: ["mp3 to mp4", "audio to video", "waveform video", "podcast to video"],
    intro: "Audio in → video out, with a live animated waveform visual.",
    about: "MP3 to MP4 converts audio into a shareable video: your track plays over an animated neon waveform rendered in real time. Ideal for Instagram, YouTube and Telegram where audio files can't be posted directly. Runs fully on-device.",
    steps: STEPS3("Drop an MP3/WAV/OGG file.", "Pick the accent color for the waveform.", "Export the video with the soundtrack embedded."),
    faqs: [FREE, PRIVATE, WEBM],
  },
  {
    slug: "add-audio", title: "Add Audio to Video", short: "Add Audio",
    desc: "Replace or add a soundtrack to any video — drop a video and an audio file, export them combined. Free & private.",
    emoji: "🎼", grad: "linear-gradient(135deg,#34d399,#047857)", category: "Audio",
    engine: "add-audio", status: "live", isNew: true,
    keywords: ["add audio to video", "add music to video", "replace video sound", "soundtrack video"],
    intro: "Video + music file → one video with the new soundtrack.",
    about: "Add Audio marries a video with a new soundtrack: drop both files and the pipeline plays them in sync into one output, replacing the original audio. The music is trimmed or the video ends the mix automatically, whichever is shorter.",
    steps: STEPS3("Drop your video first.", "Then drop the audio track (MP3/WAV).", "Export the combined video."),
    faqs: [FREE, PRIVATE, WEBM, { q: "Can I keep the original audio too?", a: "Today the new track replaces the original; mixing both is on the roadmap." }],
  },

  /* ── GIF ── */
  {
    slug: "video-to-gif", title: "Video to GIF", short: "Video→GIF",
    desc: "Turn any video segment into a high-quality animated GIF — pick the range on the timeline, tune FPS and size. Free.",
    emoji: "🎞️", grad: "linear-gradient(135deg,#e1ff04,#65a30d)", category: "GIF",
    engine: "togif", status: "live", popular: true,
    keywords: ["video to gif", "make gif from video", "gif converter", "gif maker"],
    intro: "Timeline-select a moment, export a loopable GIF — real encoder, on-device.",
    about: "Video to GIF captures the segment you mark on the timeline and encodes a real animated GIF on your device (palette-optimized, loop-ready). Control FPS and width to balance smoothness against file size — no upload, no watermark.",
    steps: STEPS3("Drop your video and mark the segment.", "Choose FPS (5–15) and width.", "Encode and download the GIF."),
    faqs: [FREE, PRIVATE, { q: "How long can the GIF be?", a: "GIFs grow fast — 2–6 seconds at 10 fps is the sweet spot; the encoder handles up to ~15 seconds." }, { q: "Is this a real GIF file?", a: "Yes — a standards-compliant animated GIF that loops everywhere." }],
  },
  {
    slug: "create-gif", title: "GIF Maker", short: "GIF Maker",
    desc: "Create looping GIFs from any video — the fastest way to make reaction GIFs and previews. Free, on-device encoder.",
    emoji: "✨", grad: "linear-gradient(135deg,#f472b6,#be185d)", category: "GIF",
    engine: "togif", status: "live",
    keywords: ["gif maker", "create gif", "make a gif online", "reaction gif maker"],
    intro: "Reaction GIFs in three clicks — mark, encode, share.",
    about: "The GIF Maker is the same palette-optimized on-device encoder as Video-to-GIF, framed for speed: drop a clip, mark the funny moment, and get a loop-ready GIF for chats and socials in seconds.",
    steps: STEPS3("Drop any clip.", "Mark the moment on the timeline.", "Encode and share the GIF."),
    faqs: [FREE, PRIVATE, { q: "Where can I use the GIF?", a: "Anywhere — Telegram, Discord, GitHub, docs; it's a standard animated GIF." }],
  },
  {
    slug: "gif-to-mp4", title: "GIF to MP4", short: "GIF→Video",
    desc: "Convert an animated GIF into a real video file — smaller, smoother, postable everywhere. Free, in your browser.",
    emoji: "📼", grad: "linear-gradient(135deg,#fb923c,#c2410c)", category: "GIF",
    engine: "gif-to-mp4", status: "live", isNew: true,
    keywords: ["gif to mp4", "gif to video", "convert gif", "gif converter video"],
    intro: "GIFs are huge — the same animation as video is 10× smaller.",
    about: "GIF to MP4 decodes every frame of your animated GIF on-device and re-encodes it as a real video — typically 5–15× smaller with smoother playback. Perfect for platforms that prefer video posts over GIFs.",
    steps: STEPS3("Drop an animated GIF.", "Frames are decoded automatically.", "Download the video version."),
    faqs: [FREE, PRIVATE, WEBM, { q: "Which browsers support GIF decoding?", a: "Chrome and Edge decode GIFs natively (ImageDecoder API); Safari/Firefox support is arriving." }],
  },

  /* ── FRAMES ── */
  {
    slug: "video-thumbnail", title: "Video Thumbnail Generator", short: "Thumbnail",
    desc: "Grab the perfect thumbnail frame from any video — scrub the timeline, capture full-resolution PNG/JPG. Free.",
    emoji: "🖼️", grad: "linear-gradient(135deg,#bba9ff,#8b5cf6)", category: "Frames",
    engine: "thumbnail", status: "live", popular: true,
    keywords: ["video thumbnail", "extract frame from video", "video frame capture", "youtube thumbnail from video"],
    intro: "Scrub to the exact moment, capture a full-res still.",
    about: "The Thumbnail Generator lets you scrub your video frame by frame and capture any moment as a full-resolution PNG or JPG — the source frame, not a screenshot of the player. Pair it with the AI Thumbnail Generator to add title text on top.",
    steps: STEPS3("Drop your video.", "Scrub the timeline to the perfect frame.", "Capture and download PNG or JPG."),
    faqs: [FREE, PRIVATE, { q: "What resolution is the capture?", a: "The video's native resolution — a 4K video gives a 4K still." }],
  },
  {
    slug: "video-screenshot", title: "Video Screenshot", short: "Screenshot",
    desc: "Take clean screenshots from any video at native resolution — no player UI, no overlays. Free, in your browser.",
    emoji: "📸", grad: "linear-gradient(135deg,#22d3ee,#0369a1)", category: "Frames",
    engine: "thumbnail", status: "live",
    keywords: ["video screenshot", "screenshot from video", "capture video frame", "still from video"],
    intro: "Pixel-perfect stills — straight from the video data, not your screen.",
    about: "Video Screenshot captures frames directly from the decoded video stream at native resolution — no player controls, no cursor, no compression artifacts from screen capture. Scrub, pause, capture, done.",
    steps: STEPS3("Drop your video.", "Pause at the frame you need.", "Download the clean still."),
    faqs: [FREE, PRIVATE],
  },
  {
    slug: "extract-frames", title: "Extract Video Frames", short: "Frames",
    desc: "Export a sequence of frames from a video as a ZIP of images — pick the count and range. Free, in your browser.",
    emoji: "🎬", grad: "linear-gradient(135deg,#34d399,#065f46)", category: "Frames",
    engine: "frames", status: "live",
    keywords: ["extract frames from video", "video frames to images", "frame sequence export", "video to images"],
    intro: "10, 20 or 50 evenly-spaced stills — zipped and downloaded in one go.",
    about: "Extract Frames samples your video at evenly spaced intervals (or within a marked range) and packages every frame as a numbered PNG inside a ZIP — ideal for contact sheets, ML datasets, animation reference and documentation.",
    steps: STEPS3("Drop your video.", "Choose how many frames to sample.", "Download the ZIP of numbered PNGs."),
    faqs: [FREE, PRIVATE, { q: "How many frames can I extract?", a: "Up to 60 per run — enough for contact sheets and reference strips while staying fast." }],
  },
  {
    slug: "video-metadata", title: "Video Metadata Viewer", short: "Metadata",
    desc: "Inspect a video's resolution, duration, bitrate, size and aspect ratio instantly — free, private, in your browser.",
    emoji: "🔍", grad: "linear-gradient(135deg,#9ca3af,#374151)", category: "Frames",
    engine: "meta", status: "live",
    keywords: ["video metadata", "video info", "check video bitrate", "video resolution checker"],
    intro: "Every technical fact about your file — in one glance, zero upload.",
    about: "The Metadata Viewer reads your video locally and reports resolution, duration, average bitrate, file size, aspect ratio and container type — the numbers you need for upload limits, quality checks and debugging, without installing MediaInfo.",
    steps: STEPS3("Drop any video file.", "Metadata is read instantly on-device.", "Copy the report if you need to share it."),
    faqs: [FREE, PRIVATE],
  },

  /* ── SUBTITLES ── */
  {
    slug: "subtitle-generator", title: "Video Subtitle Generator", short: "Subtitles",
    desc: "Create timed SRT subtitles for your video by re-speaking the audio — live speech recognition, free .srt download.",
    emoji: "💬", grad: "linear-gradient(135deg,#a78bfa,#6d28d9)", category: "Subtitles",
    engine: "subgen", status: "live",
    keywords: ["video subtitles", "srt generator", "generate subtitles", "captions for video"],
    intro: "Speak along with your video — timestamped SRT comes out.",
    about: "The Subtitle Generator turns speech into properly timed SRT captions using live neural recognition: play your video and re-speak the lines (or dictate fresh), then edit and export a standards-compliant .srt for YouTube, Premiere or VLC. Direct file transcription is wired through the cloud connector.",
    steps: STEPS3("Press record and speak the lines.", "Each phrase becomes a timed subtitle you can edit.", "Download the .srt file."),
    faqs: [FREE, { q: "Can it transcribe the video file directly?", a: "That activates with the cloud engine; live re-speaking works today and produces perfect SRT timing." }],
  },
  {
    slug: "subtitle-editor", title: "Subtitle Editor", short: "SRT Editor",
    desc: "Edit any .srt file online — fix text, shift timings, renumber automatically, download clean SRT. Free.",
    emoji: "📝", grad: "linear-gradient(135deg,#e1ff04,#a3e635)", category: "Subtitles",
    engine: "srt-edit", status: "live", isNew: true,
    keywords: ["subtitle editor", "edit srt file", "srt timing shift", "fix subtitles"],
    intro: "Open an SRT, fix lines, nudge all timings, export — no software.",
    about: "The Subtitle Editor parses any .srt into an editable list: fix typos inline, delete lines, and shift every timestamp earlier/later in one action to fix sync. Export re-numbers cues and writes standards-perfect SRT.",
    steps: STEPS3("Drop an .srt file.", "Edit text or shift all timings to fix sync.", "Download the corrected SRT."),
    faqs: [FREE, PRIVATE, { q: "My subtitles are 2 seconds late — can this fix it?", a: "Yes — enter −2s in the shift box and every cue moves together." }],
  },
  {
    slug: "subtitle-translator", title: "Subtitle Translator", short: "SRT Translate",
    desc: "Translate an entire .srt subtitle file to another language while keeping the timing — neural translation via the cloud engine.",
    emoji: "🌍", grad: "linear-gradient(135deg,#60a5fa,#1d4ed8)", category: "Subtitles",
    engine: "srt-translate", status: "preview",
    keywords: ["translate subtitles", "srt translator", "subtitle translation", "translate srt file"],
    intro: "Same timing, new language — the workspace is wired for the neural engine.",
    about: "The Subtitle Translator parses your .srt, shows every cue alongside its (future) translation, and rebuilds a perfectly timed SRT in the target language. Neural translation flows through the QRix connector; until the cloud engine is live, you can edit translations manually in the same workspace.",
    steps: STEPS3("Drop an .srt file.", "Pick the target language.", "Export the translated SRT."),
    faqs: [FREE, { q: "When does automatic translation activate?", a: "With the cloud engine — the parsing, editing and export workflow already works today." }],
  },
];

export function getVideoTool(slug: string): VideoTool | undefined {
  return VIDEO_TOOLS.find((t) => t.slug === slug);
}

export const VIDEO_CATEGORIES: VideoCategory[] = ["Edit", "Convert", "Compress", "Audio", "GIF", "Frames", "Subtitles"];
