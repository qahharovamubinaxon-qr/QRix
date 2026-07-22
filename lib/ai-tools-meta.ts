/* ============================================================
   AI Tools registry — single source of truth for the /ai-tools
   module. Every tool gets its own route, SEO, FAQ and engine.

   engine keys map to client components in components/ai/registry:
     removebg | upscale | ocr | fx:<preset> | qr | logo | avatar
     template:<kind> | resume | captions | prompt | speech | subtitles
     translate | describe | imagegen | poster | removeobj
   status: "live" = fully working on-device today
           "preview" = full UI + mock pipeline, wired to the future
                       API connector (lib/ai-connector.ts)
   ============================================================ */

import { cloudRoute, isAiEngineLive, type CloudRoute } from "@/lib/ai-connector";

export type AiCategory = "Image AI" | "Text AI" | "Voice AI" | "Generators";

export type AiTool = {
  slug: string;
  title: string;
  short: string;          // card label
  desc: string;           // meta description
  emoji: string;
  grad: string;
  category: AiCategory;
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

const PRIVATE = { q: "Is my file uploaded to a server?", a: "No — processing runs on your device in the browser. Nothing is stored or sent anywhere." };
const FREE = { q: "Is this AI tool free?", a: "Yes, completely free with no watermark and no signup." };
const FORMATS = { q: "Which formats are supported?", a: "JPG, PNG and WebP input; results download as high-quality PNG." };
const MOBILE = { q: "Does it work on mobile?", a: "Yes — every AI tool works in modern mobile browsers." };

const STEPS_IMG = [
  { title: "Upload an image", desc: "Drag & drop, click to browse, or paste from the clipboard." },
  { title: "Tune the settings", desc: "Adjust the strength and preview the result live." },
  { title: "Compare & download", desc: "Slide before/after, then save the PNG." },
];

const RAW_AI_TOOLS: AiTool[] = [
  /* ── IMAGE AI ── */
  {
    slug: "background-remover", title: "AI Background Remover", short: "Background Remover",
    desc: "Remove the background from any photo with AI — clean transparent PNG in seconds, free and private in your browser.",
    emoji: "✂️", grad: "linear-gradient(135deg,#bba9ff,#8f7bff)", category: "Image AI",
    engine: "removebg", status: "live", popular: true,
    keywords: ["ai background remover", "remove background", "transparent png", "cut out image"],
    intro: "Erase the background from any photo automatically — get a clean transparent PNG for products, portraits and logos.",
    about: "The AI Background Remover separates the subject from the background entirely on your device. It handles hair, fur and complex edges surprisingly well, and returns a transparent PNG you can drop onto any design, marketplace listing or presentation. Because the model runs in your browser, your photos never leave your computer — there is no upload, no queue and no watermark.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE, { q: "How accurate are the edges?", a: "The on-device model handles hair and complex edges well; best results come from clear subject-background contrast." }],
  },
  {
    slug: "image-upscaler", title: "AI Image Upscaler", short: "Image Upscaler",
    desc: "Upscale images 2×–4× with AI-style enhancement — make small or blurry photos larger and sharper, free in your browser.",
    emoji: "🔍", grad: "linear-gradient(135deg,#e1ff04,#b9f227)", category: "Image AI",
    engine: "upscale", status: "live", popular: true,
    keywords: ["ai image upscaler", "upscale image", "enhance resolution", "enlarge photo"],
    intro: "Enlarge photos 2×–4× while keeping edges crisp — revive small thumbnails and old pictures.",
    about: "The AI Image Upscaler enlarges pictures using smart interpolation with edge-preserving sharpening, so upscaled photos look clean instead of soft. Perfect for turning small product shots, avatars or old photos into usable high-resolution images. It runs privately on your device with no upload.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE, { q: "How large can I upscale?", a: "Up to 4× the original size, memory permitting on your device." }],
  },
  {
    slug: "face-enhancer", title: "AI Face Enhancer", short: "Face Enhancer",
    desc: "Enhance portraits with one click — smart sharpening, tone balance and clarity for profile photos, free and private.",
    emoji: "😊", grad: "linear-gradient(135deg,#ff9ecf,#ff5ea8)", category: "Image AI",
    engine: "fx:enhance", status: "live",
    keywords: ["ai face enhancer", "enhance portrait", "fix selfie", "photo enhancer"],
    intro: "One-click portrait enhancement: clarity, tone and detail tuned for faces.",
    about: "The Face Enhancer applies a portrait-tuned enhancement pipeline — adaptive sharpening for facial detail, gentle contrast and warmth for healthy skin tones, and subtle noise cleanup. It's the fastest way to make a profile photo, CV headshot or social avatar look professionally finished, entirely on your device.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE, { q: "Will it change how I look?", a: "No — it enhances clarity, tone and detail without altering facial features." }],
  },
  {
    slug: "portrait-enhancer", title: "AI Portrait Enhancer", short: "Portrait Enhancer",
    desc: "Polish portraits with studio-style clarity, tone and depth — free AI portrait enhancement in your browser.",
    emoji: "🖼️", grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", category: "Image AI",
    engine: "fx:portrait", status: "live",
    keywords: ["portrait enhancer", "studio photo effect", "improve portrait quality"],
    intro: "Studio-style finishing for portraits: depth, clarity and balanced light.",
    about: "The Portrait Enhancer applies a stronger studio-look pipeline than the Face Enhancer: deeper contrast curve, vibrance, edge-aware sharpening and a subtle vignette that draws the eye to the subject. Great for LinkedIn headshots, speaker photos and team pages — processed locally with no upload.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE],
  },
  {
    slug: "sharpen-image", title: "AI Sharpen Image", short: "Sharpen",
    desc: "Sharpen blurry photos with edge-aware AI-style sharpening — free, instant and private in your browser.",
    emoji: "✨", grad: "linear-gradient(135deg,#22d3ee,#0891b2)", category: "Image AI",
    engine: "fx:sharpen", status: "live", popular: true,
    keywords: ["sharpen image", "fix blurry photo", "unblur image", "image sharpener"],
    intro: "Bring back crisp edges in soft or slightly blurred photos.",
    about: "The Sharpen tool uses an unsharp-mask convolution that boosts real edges while avoiding halos and noise amplification. Use a light strength for portraits and a stronger setting for text, screenshots and product shots. Everything runs on your device — no upload, no quality caps.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE, { q: "Can it fix heavy blur?", a: "It recovers soft focus and mild blur well; severely blurred photos have physical limits." }],
  },
  {
    slug: "blur-remover", title: "AI Blur Remover", short: "Blur Remover",
    desc: "Reduce blur and restore detail in soft photos — deblur strength slider, free and private in your browser.",
    emoji: "🌀", grad: "linear-gradient(135deg,#8f7bff,#5b46d6)", category: "Image AI",
    engine: "fx:deblur", status: "live",
    keywords: ["remove blur from photo", "deblur image", "fix out of focus"],
    intro: "Cut through softness: a deblur pipeline that restores edge definition.",
    about: "The Blur Remover runs a two-pass detail recovery: a high-radius unsharp mask rebuilds larger structures, then a fine pass restores micro-contrast. It noticeably improves soft focus, camera-shake softness and downscaled images. Processing is local and instant.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE],
  },
  {
    slug: "image-denoiser", title: "AI Image Denoiser", short: "Denoiser",
    desc: "Remove grain and noise from photos while keeping detail — free AI denoising in your browser.",
    emoji: "🧹", grad: "linear-gradient(135deg,#34d399,#059669)", category: "Image AI",
    engine: "fx:denoise", status: "live",
    keywords: ["denoise image", "remove grain", "clean noisy photo", "iso noise removal"],
    intro: "Clean up high-ISO grain and compression noise without smearing detail.",
    about: "The Denoiser applies an edge-preserving smoothing filter that averages noise in flat areas while protecting real edges and texture. Ideal for night shots, old scans and heavily compressed images. Runs entirely on your device.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE],
  },
  {
    slug: "restore-old-photo", title: "AI Old Photo Restoration", short: "Photo Restore",
    desc: "Restore old photos: reduce noise, recover contrast and sharpen faded detail — free, private, in your browser.",
    emoji: "🕰️", grad: "linear-gradient(135deg,#d4a373,#a97142)", category: "Image AI",
    engine: "fx:restore", status: "live",
    keywords: ["restore old photo", "fix faded photo", "old photo repair", "photo restoration ai"],
    intro: "Give scanned family photos a second life — denoise, re-contrast, sharpen.",
    about: "Old Photo Restoration chains a denoise pass (for scanner grain), a levels recovery (for faded contrast), gentle color revival and detail sharpening. It won't repaint missing pieces, but it dramatically refreshes faded, flat scans — all locally on your device, so precious family photos stay private.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE, { q: "Can it repair torn areas?", a: "It restores tone, noise and sharpness; physically missing areas need inpainting, which is coming with the cloud engine." }],
  },
  {
    slug: "colorize-photo", title: "AI Colorize Photo", short: "Colorize",
    desc: "Add natural color to black-and-white photos with AI. Preview the pipeline now — cloud colorization engine coming online.",
    emoji: "🎨", grad: "linear-gradient(135deg,#fb7185,#e11d48)", category: "Image AI",
    engine: "fx:colorize", status: "preview",
    keywords: ["colorize black and white photo", "ai photo colorizer", "add color to old photo"],
    intro: "Turn black-and-white memories into color. Warm-tone preview today, full neural colorization when the cloud engine connects.",
    about: "True colorization needs a neural network that understands objects. This page ships the complete experience — upload, preview, compare, download — with an on-device warm-tone pass today, and is pre-wired to the QRix AI connector so full neural colorization switches on the moment the cloud engine is enabled.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, { q: "Is this full neural colorization?", a: "Not yet — today you get a warm-tone preview on-device. The page is wired to the cloud engine, which enables true AI colorization at launch." }],
  },
  {
    slug: "cartoon-generator", title: "AI Cartoon Generator", short: "Cartoonizer",
    desc: "Turn photos into cartoon-style art with posterized colors and bold edges — free, instant, in your browser.",
    emoji: "🦸", grad: "linear-gradient(135deg,#38bdf8,#2563eb)", category: "Image AI",
    engine: "fx:cartoon", status: "live", isNew: true,
    keywords: ["cartoon yourself", "photo to cartoon", "cartoonizer", "cartoon filter"],
    intro: "Photo → cartoon: flattened colors, comic edges, instant result.",
    about: "The Cartoon Generator posterizes your photo into flat color regions and overlays dark ink-style edges detected from the image, producing a comic-book look. Tune the color levels and edge strength for anything from subtle stylization to full comic art — locally, in real time.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE],
  },
  {
    slug: "sketch-generator", title: "AI Sketch Generator", short: "Sketch",
    desc: "Convert any photo into a realistic pencil sketch — adjustable line softness, free and private in your browser.",
    emoji: "✏️", grad: "linear-gradient(135deg,#9ca3af,#4b5563)", category: "Image AI",
    engine: "fx:sketch", status: "live", isNew: true,
    keywords: ["photo to sketch", "pencil sketch from photo", "sketch generator", "drawing effect"],
    intro: "A convincing pencil-sketch effect using the classic dodge-blend technique.",
    about: "The Sketch Generator converts photos to graphite-style drawings using the color-dodge blend of an inverted, blurred copy — the same technique artists use in Photoshop, automated. Adjust the softness to go from fine pen lines to soft charcoal. Runs instantly on your device.",
    steps: STEPS_IMG,
    faqs: [FREE, PRIVATE, FORMATS, MOBILE],
  },
  {
    slug: "remove-objects", title: "AI Remove Objects", short: "Object Eraser",
    desc: "Brush over unwanted objects to erase them. Smart blend fill today — neural inpainting via the cloud engine at launch.",
    emoji: "🧽", grad: "linear-gradient(135deg,#f97316,#ea580c)", category: "Image AI",
    engine: "removeobj", status: "preview",
    keywords: ["remove objects from photo", "erase person from photo", "object remover ai", "inpainting"],
    intro: "Paint over what you want gone. Blend-fill preview now, true inpainting next.",
    about: "Brush over any object and the tool fills the area by blending surrounding pixels — great for small distractions, wires and spots. The full neural inpainting (content-aware reconstruction of large objects) is pre-wired through the QRix AI connector and activates with the cloud engine.",
    steps: [
      { title: "Upload a photo", desc: "Drag & drop or paste from clipboard." },
      { title: "Brush the object", desc: "Paint a mask over anything you want removed." },
      { title: "Erase & download", desc: "Preview the fill, compare, and save the PNG." },
    ],
    faqs: [FREE, PRIVATE, FORMATS, { q: "Can it remove large objects?", a: "The on-device blend fill suits small distractions; large-object neural inpainting arrives with the cloud engine — the UI is already wired for it." }],
  },

  /* ── TEXT AI ── */
  {
    slug: "ocr", title: "AI OCR — Image to Text", short: "OCR",
    desc: "Extract text from any image with AI OCR — English, Russian and Uzbek. Copy or download as .txt, free and private.",
    emoji: "🔤", grad: "linear-gradient(135deg,#22d3ee,#0e7490)", category: "Text AI",
    engine: "ocr", status: "live", popular: true,
    keywords: ["ai ocr", "image to text", "extract text from image", "photo to text"],
    intro: "Point it at any photo or scan and get clean, copyable text out.",
    about: "The AI OCR reads printed text from photos, scans and documents using an on-device neural recognizer supporting English, Russian and Uzbek. Copy the result or download a .txt — receipts, book pages, whiteboards and forms all work. Nothing is uploaded.",
    steps: [
      { title: "Upload the image", desc: "Photo, scan or screenshot." },
      { title: "AI reads the text", desc: "On-device recognition in EN/RU/UZ." },
      { title: "Copy or download", desc: "Grab the text or save a .txt file." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Which languages are recognized?", a: "English, Russian and Uzbek." }, { q: "Does handwriting work?", a: "Printed text works best; clear handwriting is partially recognized." }],
  },
  {
    slug: "screenshot-to-text", title: "AI Screenshot OCR", short: "Screenshot OCR",
    desc: "Paste a screenshot and instantly extract its text with AI — perfect for error messages, chats and slides. Free and private.",
    emoji: "📸", grad: "linear-gradient(135deg,#a78bfa,#7c3aed)", category: "Text AI",
    engine: "ocr", status: "live",
    keywords: ["screenshot to text", "copy text from screenshot", "extract text from screenshot"],
    intro: "Ctrl+V a screenshot, get the text — no retyping error messages ever again.",
    about: "Screenshot OCR is tuned for the most common daily need: pasting a screenshot (Ctrl+V works directly in the upload zone) and pulling out the text — error messages, chat quotes, slide bullets, code. On-device recognition keeps work screenshots confidential.",
    steps: [
      { title: "Paste your screenshot", desc: "Ctrl+V right on the page, or drag the file in." },
      { title: "AI extracts the text", desc: "Runs locally in your browser." },
      { title: "Copy the result", desc: "One click to copy everything." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Can I paste directly?", a: "Yes — press Ctrl+V (⌘V) anywhere on the upload area." }],
  },
  {
    slug: "image-description", title: "AI Image Description", short: "Image Describer",
    desc: "Generate an alt-text style description of any image. Structured analysis today, full vision AI via the cloud connector.",
    emoji: "🖋️", grad: "linear-gradient(135deg,#34d399,#0d9488)", category: "Text AI",
    engine: "describe", status: "preview",
    keywords: ["image description generator", "alt text generator", "describe image ai"],
    intro: "Accessibility-ready image descriptions: color/composition analysis now, full vision AI next.",
    about: "This tool analyzes your image on-device — dominant colors, brightness, orientation and detected text (OCR) — and drafts a structured description you can refine for alt text. Full scene understanding (objects, actions, context) is wired through the QRix AI connector and switches on with the cloud vision engine.",
    steps: [
      { title: "Upload an image", desc: "Any photo or graphic." },
      { title: "Analyze", desc: "Colors, composition and embedded text are detected on-device." },
      { title: "Copy the description", desc: "Use it as alt text or a caption starting point." },
    ],
    faqs: [FREE, PRIVATE, { q: "Does it recognize objects?", a: "On-device analysis covers colors, layout and text; object-level scene description activates with the cloud vision engine." }],
  },
  {
    slug: "caption-generator", title: "AI Caption Generator", short: "Captions",
    desc: "Generate catchy social media captions with hashtags for any topic — Instagram, TikTok, LinkedIn styles. Free and instant.",
    emoji: "💬", grad: "linear-gradient(135deg,#f472b6,#db2777)", category: "Text AI",
    engine: "captions", status: "live", isNew: true,
    keywords: ["caption generator", "instagram caption ideas", "social media captions", "hashtag generator"],
    intro: "Type your topic, pick a vibe, get ready-to-post captions with hashtags.",
    about: "The Caption Generator composes captions from a large library of proven hooks, structures and CTA patterns, personalized with your topic and tuned per platform (Instagram, TikTok, LinkedIn, X) and tone (fun, professional, inspiring, salesy). It also builds a matching hashtag set. Generate as many variants as you like — free.",
    steps: [
      { title: "Describe the post", desc: "A few words about your photo, product or idea." },
      { title: "Pick platform & tone", desc: "Instagram fun? LinkedIn professional? Your call." },
      { title: "Generate & copy", desc: "Cycle variants until one clicks, then copy it." },
    ],
    faqs: [FREE, MOBILE, { q: "How are captions generated?", a: "From a curated pattern library combined with your topic — instant and on-device; a cloud LLM upgrade is pre-wired." }, { q: "Are hashtags included?", a: "Yes — a relevant hashtag set is generated with every caption." }],
  },
  {
    slug: "prompt-generator", title: "AI Prompt Generator", short: "Prompt Builder",
    desc: "Build powerful prompts for Midjourney, DALL·E and Stable Diffusion — subject, style, lighting, camera and quality modifiers.",
    emoji: "🧠", grad: "linear-gradient(135deg,#e1ff04,#a3e635)", category: "Text AI",
    engine: "prompt", status: "live", isNew: true,
    keywords: ["ai prompt generator", "midjourney prompt builder", "stable diffusion prompts"],
    intro: "Compose professional image-generation prompts from proven building blocks.",
    about: "The Prompt Builder assembles high-quality prompts from curated blocks — subject, art style, lighting, camera/lens, mood, color grade and quality boosters — in the ordering that image models respond to best. Randomize for inspiration or lock fields you like, then copy the finished prompt for Midjourney, DALL·E or Stable Diffusion.",
    steps: [
      { title: "Describe the subject", desc: "What should be in the image." },
      { title: "Pick style blocks", desc: "Art style, lighting, camera, mood, palette." },
      { title: "Copy the prompt", desc: "A polished prompt, ready to paste into any model." },
    ],
    faqs: [FREE, MOBILE, { q: "Which models does it target?", a: "The structure works for Midjourney, DALL·E 3 and Stable Diffusion; a model toggle adjusts phrasing." }],
  },
  {
    slug: "translator", title: "AI Translator", short: "Translator",
    desc: "Translate text between English, Russian, Uzbek and 20+ languages with neural AI — free, instant, no signup.",
    emoji: "🌍", grad: "linear-gradient(135deg,#60a5fa,#2563eb)", category: "Text AI",
    engine: "translate", status: "live",
    keywords: ["ai translator", "translate english uzbek", "russian uzbek translator"],
    intro: "A clean translation workspace powered by neural AI — free and instant.",
    about: "The Translator ships the complete workspace: language pair pickers with swap, character count, copy and history. Neural translation runs through the QRix AI connector; until the cloud engine is enabled, the tool links out to your system translator so the page is still useful today.",
    steps: [
      { title: "Paste your text", desc: "Up to 5,000 characters." },
      { title: "Pick languages", desc: "Auto-detect source, choose the target." },
      { title: "Translate & copy", desc: "Copy the result or swap directions." },
    ],
    faqs: [FREE, { q: "Which languages are supported?", a: "The interface supports 20+ pairs including English↔Russian↔Uzbek; neural quality activates with the cloud engine." }],
  },

  /* ── VOICE AI ── */
  {
    slug: "speech-to-text", title: "AI Speech to Text", short: "Speech to Text",
    desc: "Dictate and get live text with AI speech recognition — free, in your browser, supports English, Russian and Uzbek.",
    emoji: "🎙️", grad: "linear-gradient(135deg,#f87171,#dc2626)", category: "Voice AI",
    engine: "speech", status: "live", popular: true,
    keywords: ["speech to text", "voice typing", "dictation online", "voice to text free"],
    intro: "Talk — watch your words appear. Live on-device speech recognition.",
    about: "Speech to Text uses your browser's built-in neural speech recognition for live dictation: speak, watch the transcript build in real time, then copy or download it. Pick the language (English, Russian, Uzbek and more), pause and resume freely. Audio is processed by your browser's speech engine — nothing is stored by QRix.",
    steps: [
      { title: "Choose a language", desc: "EN, RU, UZ and more." },
      { title: "Press record & speak", desc: "The transcript appears live as you talk." },
      { title: "Copy or download", desc: "Grab the text or save a .txt." },
    ],
    faqs: [FREE, MOBILE, { q: "Which browsers work?", a: "Chrome, Edge and Safari support live speech recognition; Firefox support is limited." }, { q: "Can I transcribe an audio file?", a: "File transcription arrives with the cloud engine; live dictation works today." }],
  },
  {
    slug: "subtitle-generator", title: "AI Subtitle Generator", short: "Subtitles",
    desc: "Create timed SRT subtitles by dictating or re-speaking your video's audio — download ready-to-use .srt, free.",
    emoji: "🎬", grad: "linear-gradient(135deg,#a78bfa,#6d28d9)", category: "Voice AI",
    engine: "subtitles", status: "live", isNew: true,
    keywords: ["subtitle generator", "srt generator", "create subtitles online", "captions for video"],
    intro: "Speak along with your video and get a timestamped .srt file out.",
    about: "The Subtitle Generator turns live speech into properly timestamped SRT captions: press record, speak (or play your video aloud and re-speak the lines), and each phrase is captured with start/end times. Edit any line, then download a standards-compliant .srt that works in YouTube, Premiere and VLC. Direct video-file transcription is pre-wired through the cloud connector.",
    steps: [
      { title: "Record segments", desc: "Each phrase you speak becomes a timed subtitle line." },
      { title: "Edit the lines", desc: "Fix wording or timing inline." },
      { title: "Download .srt", desc: "Ready for YouTube, editors and players." },
    ],
    faqs: [FREE, { q: "Can it transcribe a video file directly?", a: "That arrives with the cloud engine; today you dictate or re-speak the audio and get perfectly formatted SRT." }, { q: "What format is exported?", a: "Standard .srt with sequence numbers and HH:MM:SS,mmm timestamps." }],
  },

  /* ── GENERATORS ── */
  {
    slug: "qr-generator", title: "AI QR Generator", short: "AI QR",
    desc: "Describe your brand and get a styled QR code — AI picks colors, shapes and frames. Free, scannable, downloadable.",
    emoji: "🤖", grad: "linear-gradient(135deg,#e1ff04,#84cc16)", category: "Generators",
    engine: "aiqr", status: "live", popular: true,
    keywords: ["ai qr code generator", "styled qr code", "branded qr code ai"],
    intro: "Type your link and a vibe — the AI styles a scannable QR to match.",
    about: "The AI QR Generator reads your brand words (\"minimal tech\", \"warm bakery\", \"neon nightlife\"…) and composes a matching QR style — palette, dot shape, corner style and quiet-zone frame — while continuously validating scannability. Regenerate for new interpretations and download a crisp PNG.",
    steps: [
      { title: "Paste your link", desc: "Any URL, WiFi or text payload." },
      { title: "Describe the vibe", desc: "A few words about your brand or mood." },
      { title: "Generate & download", desc: "Cycle styles until it fits, then save the PNG." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Will styled codes still scan?", a: "Yes — contrast and quiet-zone rules are enforced on every generated style." }],
  },
  {
    slug: "logo-generator", title: "AI Logo Generator", short: "Logo Maker",
    desc: "Generate clean, modern logos from your name — smart monograms, font pairing and palettes. Export SVG/PNG free.",
    emoji: "🎯", grad: "linear-gradient(135deg,#fb923c,#ea580c)", category: "Generators",
    engine: "logo", status: "live", isNew: true,
    keywords: ["ai logo generator", "free logo maker", "monogram logo", "startup logo"],
    intro: "Type your brand name — get a wall of clean monogram + wordmark logos.",
    about: "The Logo Generator composes professional marks from your brand name: smart monogram tiles, geometric emblems, curated font pairings and color palettes assembled with real design rules (contrast, spacing, optical balance). Click any variant to fine-tune the palette and layout, then export a crisp PNG — free and unlimited.",
    steps: [
      { title: "Enter the brand name", desc: "Plus an optional tagline and industry vibe." },
      { title: "Browse generated marks", desc: "Monograms, emblems and wordmarks in curated palettes." },
      { title: "Customize & export", desc: "Tune the palette, then download PNG." },
    ],
    faqs: [FREE, MOBILE, { q: "Can I use the logo commercially?", a: "Yes — everything you generate is yours to use, no attribution required." }, { q: "Is SVG export available?", a: "PNG today; SVG export is on the roadmap." }],
  },
  {
    slug: "avatar-generator", title: "AI Avatar Generator", short: "Avatar Maker",
    desc: "Create beautiful profile avatars — gradient rings, initials, emoji and patterns. Free PNG export in seconds.",
    emoji: "👤", grad: "linear-gradient(135deg,#bba9ff,#7c3aed)", category: "Generators",
    engine: "avatar", status: "live",
    keywords: ["avatar generator", "profile picture maker", "initials avatar", "pfp maker"],
    intro: "A polished avatar in ten seconds: initials or emoji, gradient ring, done.",
    about: "The Avatar Generator builds clean profile pictures from your initials or a chosen emoji, with designer gradient backgrounds, ring styles and subtle texture. Perfect for teams, communities and anywhere you need a consistent, professional PFP without a photo. Photorealistic AI avatars are pre-wired through the cloud connector.",
    steps: [
      { title: "Type initials or pick emoji", desc: "Two letters or any emoji." },
      { title: "Pick a style", desc: "Gradients, rings and patterns." },
      { title: "Download PNG", desc: "Crisp 512×512, ready for any platform." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Can it make AI photo avatars?", a: "Stylized avatars work today; photorealistic AI avatars activate with the cloud image engine." }],
  },
  {
    slug: "thumbnail-generator", title: "AI Thumbnail Generator", short: "Thumbnails",
    desc: "Design click-worthy YouTube thumbnails — bold title layouts, gradients and emoji stickers. 1280×720 PNG, free.",
    emoji: "▶️", grad: "linear-gradient(135deg,#f87171,#b91c1c)", category: "Generators",
    engine: "template:thumbnail", status: "live",
    keywords: ["youtube thumbnail maker", "thumbnail generator", "free thumbnail creator"],
    intro: "Bold 1280×720 thumbnails with pro title layouts — no design skills needed.",
    about: "The Thumbnail Generator composes YouTube-ready 1280×720 images: punchy title typography with automatic outline/shadow for readability, curated gradient or photo backgrounds, and emoji stickers for emotion. Everything renders on canvas locally and exports a crisp PNG under YouTube's 2MB limit.",
    steps: [
      { title: "Type your title", desc: "Big, bold, auto-fitted." },
      { title: "Pick style & sticker", desc: "Background, palette, emoji accents." },
      { title: "Download PNG", desc: "1280×720, upload-ready." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Can I upload my own photo background?", a: "Yes — drop a photo in and the title layout adapts with a readability overlay." }],
  },
  {
    slug: "banner-generator", title: "AI Banner Generator", short: "Banners",
    desc: "Generate social banners in every size — YouTube, X, LinkedIn, Facebook covers — with smart text layouts. Free PNG.",
    emoji: "🏳️", grad: "linear-gradient(135deg,#38bdf8,#0369a1)", category: "Generators",
    engine: "template:banner", status: "live",
    keywords: ["banner maker", "youtube banner", "twitter header maker", "linkedin cover"],
    intro: "One design, every platform size — banners with safe-zone aware layouts.",
    about: "The Banner Generator creates covers for YouTube, X/Twitter, LinkedIn and Facebook with correct dimensions and safe zones, so your text never gets cropped by avatars or UI. Pick a background style, type your name/tagline, and export each size as PNG — all rendered locally.",
    steps: [
      { title: "Choose the platform", desc: "Correct size and safe zones applied automatically." },
      { title: "Add your text & style", desc: "Name, tagline, background, palette." },
      { title: "Export PNG", desc: "Pixel-perfect for that platform." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Which sizes are included?", a: "YouTube 2560×1440, X 1500×500, LinkedIn 1584×396, Facebook 820×312 — with safe zones drawn in the editor." }],
  },
  {
    slug: "poster-generator", title: "AI Poster Generator", short: "Posters",
    desc: "Create print-ready A4 posters with QR codes — menu, review, WiFi and promo templates styled automatically. Free PDF/PNG.",
    emoji: "📄", grad: "linear-gradient(135deg,#e1ff04,#ca8a04)", category: "Generators",
    engine: "poster", status: "live",
    keywords: ["poster generator", "qr poster maker", "scan me poster", "printable poster"],
    intro: "Print-ready posters with a scannable QR — templates for every business need.",
    about: "The Poster Generator builds A4 print-ready posters around your QR code: menu, review, follow, pay and promo templates with balanced typography and color. Enter your link, tweak the heading, and export a sharp PDF for print or PNG for screens — rendered locally.",
    steps: [
      { title: "Pick a template", desc: "Menu, review, follow, pay, promo." },
      { title: "Add your link & text", desc: "The QR and layout update live." },
      { title: "Download PDF/PNG", desc: "A4 print-ready output." },
    ],
    faqs: [FREE, PRIVATE, MOBILE],
  },
  {
    slug: "resume-builder", title: "AI Resume Builder", short: "Resume Builder",
    desc: "Build a clean, ATS-friendly resume with live preview and one-click PDF export — free, no signup, data stays local.",
    emoji: "📋", grad: "linear-gradient(135deg,#34d399,#047857)", category: "Generators",
    engine: "resume", status: "live", popular: true,
    keywords: ["resume builder", "free cv maker", "ats resume", "cv pdf generator"],
    intro: "Fill the form, watch the resume build itself, download a recruiter-ready PDF.",
    about: "The Resume Builder produces a clean, ATS-parseable resume: professional single-column layout, tuned typography and spacing, and smart section ordering. Your data never leaves the browser — it renders locally and exports a crisp PDF. Draft-improving AI suggestions are pre-wired via the cloud connector.",
    steps: [
      { title: "Fill in your details", desc: "Profile, experience, education, skills." },
      { title: "Preview live", desc: "The formatted resume updates as you type." },
      { title: "Download PDF", desc: "ATS-friendly, ready to send." },
    ],
    faqs: [FREE, PRIVATE, MOBILE, { q: "Is the layout ATS-friendly?", a: "Yes — single-column, standard headings and real text (no images), which parsing systems read reliably." }],
  },
  {
    slug: "image-generator", title: "AI Image Generator", short: "Image Generator",
    desc: "Turn any prompt into an image — free text-to-image generation with a prompt builder and style presets.",
    emoji: "🪄", grad: "linear-gradient(135deg,#f0abfc,#c026d3)", category: "Generators",
    engine: "imagegen", status: "live",
    keywords: ["ai image generator", "text to image", "free image generation"],
    intro: "Describe it, generate it — free AI text-to-image, right in your browser.",
    about: "This is the complete generation workspace — prompt field with builder assist, style presets, aspect ratios, seed control and a result gallery. Rendering runs through the QRix AI connector: the moment a cloud image engine (Stability, Replicate, DALL·E) is configured, generation switches on with zero UI changes.",
    steps: [
      { title: "Write the prompt", desc: "Use the built-in prompt assist for stronger results." },
      { title: "Pick style & ratio", desc: "Photoreal, illustration, 3D, anime; square to widescreen." },
      { title: "Generate", desc: "Activates with the cloud engine — the workspace is ready." },
    ],
    faqs: [FREE, { q: "When does generation go live?", a: "The workspace is wired to the QRix AI connector; generation activates as soon as a cloud engine is configured." }],
  },
];

/* ------------------------------------------------------------------
   PRIVATE above answers "Is my file uploaded to a server?" with a flat
   "No — processing runs on your device", and it is pasted into tools
   whose own copy promises the cloud engine will take that work over
   (colorize, remove-objects, image-description…). Today the answer is
   true only because no engine is configured. Derive it from the route
   table instead of leaving a claim that silently inverts when an env
   var is set — and give the routed tools that have no privacy FAQ at
   all (speech, subtitles) one, rather than staying quiet about it.
   With no engine configured this is a no-op: every page renders
   exactly the copy it renders today.
   ------------------------------------------------------------------ */
function privacyFaq(r: CloudRoute): { q: string; a: string } {
  const noun = r.sends === "file" ? "file" : "text";
  const q = `Is my ${noun} uploaded to a server?`;
  return r.mode === "replaces"
    ? { q, a: `This tool's AI step runs on the QRix cloud engine, so your ${noun} is sent over HTTPS, processed and then discarded. QRix keeps no copy.` }
    : { q, a: `Not for the on-device features — those stay in your browser. Only the optional AI step uses the QRix cloud engine: it sends your ${noun} over HTTPS, processes it and discards it, and the control says so before you use it.` };
}

function deriveClaims(t: AiTool): AiTool {
  const r = cloudRoute(t.engine);
  if (!r || !r.wired || !isAiEngineLive()) return t;
  const f = privacyFaq(r);
  const i = t.faqs.findIndex((x) => x.q === PRIVATE.q);
  return { ...t, faqs: i >= 0 ? t.faqs.map((x, k) => (k === i ? f : x)) : [...t.faqs, f] };
}

export const AI_TOOLS: AiTool[] = RAW_AI_TOOLS.map(deriveClaims);

export function getAiTool(slug: string): AiTool | undefined {
  return AI_TOOLS.find((t) => t.slug === slug);
}

export const AI_CATEGORIES: AiCategory[] = ["Image AI", "Text AI", "Voice AI", "Generators"];
