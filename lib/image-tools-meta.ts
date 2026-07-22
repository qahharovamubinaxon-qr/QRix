/* ============================================================
   Image Tools EXPANSION registry — NEW tools only (existing
   folder routes compress/convert/resize/remove-bg/upscale/
   image-to-text/exif-remover stay untouched).
   engine → components/image/ImageEngineRegistry.
   status "live" = on-device now; "preview" = full UI + connector.
   ============================================================ */

export type ImgCategory = "Adjust" | "Filters" | "Transform" | "Convert" | "Social" | "Color" | "Overlay" | "Layout" | "Batch" | "Metadata" | "Studio";

export type ImgTool = {
  slug: string; title: string; short: string; desc: string;
  emoji: string; grad: string; category: ImgCategory; engine: string;
  status: "live" | "preview"; popular?: boolean; isNew?: boolean;
  keywords: string[]; intro: string; about: string;
  steps: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
};

const FREE = { q: "Is this tool free?", a: "Yes — completely free, no watermark and no signup." };
const PRIV = { q: "Are my images uploaded?", a: "No. Everything runs on your device in the browser; images never leave your computer." };
/* The shared "which formats" answer used to claim a PNG download for every
   tool in the registry. Driving batch-compress end to end (M123) showed it
   handing back transparent.jpg, so the claim was false on every tool that
   doesn't encode PNG. The answer is now derived from the engine that actually
   runs (see fmtAnswer), and this object is only the marker that gets replaced
   — a new tool inherits an accurate sentence instead of a wrong one. */
const FMT = { q: "Which formats work?", a: "" };

const FMT_PNG = "JPG, PNG and WebP input; the result downloads as a lossless PNG.";
function fmtAnswer(engine: string): string {
  if (engine.startsWith("batch:")) {
    const p = engine.slice(6);
    if (p === "compress") return "JPG, PNG and WebP input. Compression re-encodes to JPG — that is what makes the files small — and every image comes back in one ZIP.";
    if (p === "convert") return "JPG, PNG and WebP input; you pick JPG, PNG or WebP for the whole batch and it downloads as one ZIP.";
    if (p === "resize") return "JPG, PNG and WebP input. Each file keeps its own format — a transparent PNG stays a PNG — and the batch downloads as one ZIP.";
    return "Any image type. Renaming copies the original files untouched, so nothing is re-encoded and no quality is lost; they download as one ZIP.";
  }
  if (engine.startsWith("convert:")) {
    const to = engine.split(":")[1]?.split("-to-").pop();
    return to ? `JPG, PNG and WebP input; the result downloads as ${to.toUpperCase()}.` : FMT_PNG;
  }
  if (engine.startsWith("resize:") || engine.startsWith("social:")) return "JPG, PNG and WebP input, and the format is preserved — a transparent PNG comes back a PNG, not flattened onto white. Anything else (HEIC, TIFF, BMP…) downloads as JPG.";
  if (engine === "meta:remove" || engine === "meta:exif") return "JPG, PNG and WebP. The cleaned copy keeps the format you uploaded, so a JPEG stays a JPEG rather than ballooning into a PNG.";
  if (engine === "meta:view") return "JPG, PNG and WebP. This tool only reads the file and reports on it — nothing is written or downloaded.";
  if (engine === "special:passport") return "JPG, PNG and WebP input; the photo and the print sheet download as high-quality JPG, which is what photo labs and passport portals accept.";
  if (engine.startsWith("color:")) return "JPG, PNG and WebP input. Colour values copy as HEX/RGB text; palette swatches and gradients download as PNG.";
  if (engine === "layout:split") return "JPG, PNG and WebP input; the tiles download as lossless PNGs in one ZIP.";
  return FMT_PNG;
}
const MOB = { q: "Does it work on mobile?", a: "Yes — every tool works in modern mobile browsers." };
const S3 = (a: string, b: string, c: string) => [
  { title: "Upload an image", desc: a }, { title: "Adjust", desc: b }, { title: "Download", desc: c },
];
const baseFaq = (extra: { q: string; a: string }[] = []) => [FREE, PRIV, FMT, MOB, ...extra];

const G = {
  amber: "linear-gradient(135deg,#f59e0b,#d97706)", green: "linear-gradient(135deg,#16a34a,#4ade80)",
  cyan: "linear-gradient(135deg,#22d3ee,#0891b2)", blue: "linear-gradient(135deg,#2563eb,#60a5fa)",
  violet: "linear-gradient(135deg,#bba9ff,#7c3aed)", pink: "linear-gradient(135deg,#f472b6,#db2777)",
  lime: "linear-gradient(135deg,#e1ff04,#84cc16)", orange: "linear-gradient(135deg,#fb923c,#ea580c)",
  slate: "linear-gradient(135deg,#9ca3af,#4b5563)", teal: "linear-gradient(135deg,#34d399,#0d9488)",
  red: "linear-gradient(135deg,#f87171,#dc2626)", indigo: "linear-gradient(135deg,#818cf8,#4f46e5)",
};

// compact builder for the big adjust/filter group
function fx(slug: string, title: string, short: string, emoji: string, grad: string, cat: ImgCategory,
  engine: string, kws: string[], intro: string, about: string, opts: { popular?: boolean; isNew?: boolean } = {}): ImgTool {
  return {
    slug, title, short, desc: intro, emoji, grad, category: cat, engine, status: "live",
    ...opts, keywords: kws, intro, about,
    steps: S3("Drag, click or paste (Ctrl+V) any image.", "Use the live slider — the preview updates instantly.", "Compare before/after and download the PNG."),
    faqs: baseFaq(),
  };
}

const RAW_IMAGE_TOOLS: ImgTool[] = [
  /* ── ADJUST ── */
  fx("brightness", "Brightness Adjuster", "Brightness", "☀️", G.amber, "Adjust", "fx:brightness", ["brightness adjuster", "brighten image", "make photo brighter"], "Brighten or darken any image with a live slider.", "Fix under- or over-exposed photos by adjusting brightness on-device with an instant preview.", { popular: true }),
  fx("contrast", "Contrast Adjuster", "Contrast", "◐", G.slate, "Adjust", "fx:contrast", ["contrast adjuster", "increase contrast", "photo contrast"], "Boost or soften image contrast instantly.", "Add punch to flat photos or tame harsh ones with an on-device contrast slider and live preview."),
  fx("exposure", "Exposure Adjuster", "Exposure", "🔆", G.amber, "Adjust", "fx:exposure", ["exposure adjust", "fix exposure", "photo exposure"], "Correct exposure like a light meter.", "Recover detail from dark or blown-out photos with a photographic exposure control, all in your browser."),
  fx("gamma", "Gamma Correction", "Gamma", "γ", G.indigo, "Adjust", "fx:gamma", ["gamma correction", "adjust gamma", "midtone brightness"], "Tune midtones without crushing highlights or shadows.", "Gamma correction reshapes the tonal curve to brighten or darken midtones while protecting extremes — ideal for screens and print."),
  fx("saturation", "Saturation Adjuster", "Saturation", "🎨", G.pink, "Adjust", "fx:saturation", ["saturation adjuster", "increase saturation", "vivid photo"], "Make colors pop or go subtle.", "Push colors from muted to vivid (or all the way to grayscale) with a live saturation slider on-device.", { popular: true }),
  fx("hue", "Hue Rotator", "Hue", "🌈", G.violet, "Adjust", "fx:hue", ["hue rotate", "change color hue", "shift colors"], "Rotate every color around the wheel.", "Shift the entire color spectrum for creative recolors or quick color-scheme experiments, instantly in the browser."),
  fx("vibrance", "Vibrance Booster", "Vibrance", "✨", G.lime, "Adjust", "fx:vibrance", ["vibrance", "boost vibrance", "smart saturation"], "Smart saturation that protects skin tones.", "Vibrance boosts muted colors more than already-saturated ones, keeping skin natural — the pro way to make photos pop.", { isNew: true }),
  fx("temperature", "Color Temperature", "Temperature", "🌡️", G.orange, "Adjust", "fx:temperature", ["color temperature", "warm cool photo", "white balance"], "Warm up or cool down the mood.", "Shift the white balance warmer (golden) or cooler (blue) to fix lighting or set a mood — live and on-device."),
  fx("tint", "Tint Adjuster", "Tint", "💗", G.pink, "Adjust", "fx:tint", ["tint adjust", "green magenta tint", "color cast fix"], "Correct green/magenta color casts.", "The tint control balances the green–magenta axis to remove color casts from fluorescent or mixed lighting."),

  /* ── FILTERS ── */
  fx("grayscale", "Grayscale Converter", "Grayscale", "⬛", G.slate, "Filters", "fx:grayscale", ["grayscale image", "black and white photo", "convert to bw"], "Turn any photo black & white.", "Convert to elegant grayscale with a strength slider for partial desaturation — instant and private.", { popular: true }),
  fx("sepia", "Sepia Filter", "Sepia", "🟤", G.orange, "Filters", "fx:sepia", ["sepia filter", "vintage photo", "old photo effect"], "Add a warm vintage sepia tone.", "The classic aged-photo look with adjustable intensity, rendered on-device."),
  fx("invert", "Invert Colors", "Invert", "🔲", G.indigo, "Filters", "fx:invert", ["invert colors", "negative image", "photo negative"], "Create a color negative.", "Invert every color for a film-negative effect or accessibility checks, instantly."),
  fx("posterize", "Posterize", "Posterize", "🖼️", G.violet, "Filters", "fx:posterize", ["posterize image", "poster effect", "reduce colors"], "Reduce colors into bold flat bands.", "Posterize flattens smooth gradients into a set number of color levels for a screen-print / pop-art look."),
  fx("pixelate", "Pixelate", "Pixelate", "🟪", G.blue, "Filters", "fx:pixelate", ["pixelate image", "pixel effect", "censor face"], "Add a blocky pixel effect — or censor an area.", "Pixelate the whole image for retro art or heavy blocks to censor sensitive details, all on-device.", { popular: true }),
  fx("mosaic", "Mosaic Filter", "Mosaic", "🔳", G.cyan, "Filters", "fx:mosaic", ["mosaic effect", "tile effect", "mosaic photo"], "Turn a photo into a mosaic of tiles.", "A larger-tile pixelation that reads as an artistic mosaic — adjustable tile size."),
  fx("blur", "Blur Image", "Blur", "🌫️", G.slate, "Filters", "fx:blur", ["blur image", "blur photo", "soft blur"], "Softly blur an entire image.", "A clean adjustable blur for backgrounds, privacy or a dreamy look — live preview, on-device."),
  fx("gaussian-blur", "Gaussian Blur", "Gaussian", "💨", G.cyan, "Filters", "fx:gaussian", ["gaussian blur", "smooth blur", "blur background"], "Smooth, natural gaussian blur.", "The photographer's blur — a true gaussian falloff for the most natural softening, with a radius slider."),
  fx("sharpen", "Sharpen Image", "Sharpen", "🔪", G.cyan, "Filters", "fx:sharpen", ["sharpen image", "unblur", "crisp photo"], "Bring back crisp edges.", "Edge-aware unsharp masking recovers detail in soft photos without amplifying noise.", { popular: true }),
  fx("emboss", "Emboss Effect", "Emboss", "🗿", G.slate, "Filters", "fx:emboss", ["emboss effect", "3d relief", "stone effect"], "Give the image a carved 3D relief.", "The emboss convolution turns edges into a stamped, stone-carved effect — great for textures and art."),
  fx("edge-detection", "Edge Detection", "Edges", "🕸️", G.green, "Filters", "fx:edge", ["edge detection", "outline image", "sobel filter"], "Trace the outlines in a photo.", "A Sobel edge detector highlights contours as glowing lines — useful for art and computer-vision previews.", { isNew: true }),
  fx("remove-noise", "Noise Reducer", "Denoise", "🧹", G.teal, "Filters", "fx:denoise", ["reduce noise", "remove grain", "denoise photo"], "Clean up grain while keeping detail.", "Edge-preserving smoothing removes high-ISO grain and compression noise without smearing real edges."),
  fx("glow-effect", "Glow Effect", "Glow", "🌟", G.pink, "Filters", "fx:glow", ["glow effect", "soft glow", "dreamy photo"], "Add a soft dreamy glow.", "A screen-blended bloom softens highlights for a romantic, ethereal look with adjustable strength.", { isNew: true }),
  fx("vignette", "Vignette", "Vignette", "🔘", G.slate, "Filters", "fx:vignette", ["vignette effect", "dark edges", "photo vignette"], "Darken the edges to focus the center.", "A smooth vignette draws the eye to your subject — adjustable size and darkness."),
  fx("shadow-effect", "Drop Shadow", "Shadow", "🌑", G.slate, "Studio", "fx:shadow", ["drop shadow image", "add shadow", "product shadow"], "Add a soft drop shadow behind the subject.", "Places your image on a canvas with an adjustable soft shadow — perfect for product shots and mockups. Works best on transparent PNGs."),

  /* ── TRANSFORM ── */
  { slug: "crop-image", title: "Crop Image", short: "Crop", desc: "Crop an image by dragging a box, with aspect-ratio presets.", emoji: "🔲", grad: G.lime, category: "Transform", engine: "tf:crop", status: "live", popular: true, keywords: ["crop image", "crop photo online", "aspect ratio crop"], intro: "Crop an image by dragging a box, with aspect-ratio presets.", about: "Drag a crop box directly on the preview — free-form or locked to 1:1, 4:3, 16:9 and more — then export the cropped region at full quality, on-device.", steps: S3("Upload or paste an image.", "Drag the crop box; pick an aspect ratio if needed.", "Download the cropped PNG."), faqs: baseFaq() },
  fx("rotate-image", "Rotate Image", "Rotate", "🔁", G.blue, "Transform", "tf:rotate", ["rotate image", "turn photo", "straighten image"], "Rotate in 90° steps or fine-tune the angle.", "Rotate by 90° or nudge the angle degree-by-degree to straighten horizons, then export."),
  fx("flip-image", "Flip Image", "Flip", "🔃", G.teal, "Transform", "tf:flip", ["flip image", "flip photo vertical", "upside down image"], "Flip horizontally or vertically.", "Mirror an image left-right or top-bottom with a live preview, on-device."),
  fx("mirror-image", "Mirror Image", "Mirror", "🪞", G.cyan, "Transform", "tf:mirror", ["mirror image", "mirror photo", "reflection effect"], "Create a mirror reflection.", "Flip horizontally for the classic mirror effect — un-mirror selfies or build symmetric compositions."),
  fx("rounded-corners", "Rounded Corners", "Rounded", "▢", G.violet, "Transform", "tf:rounded", ["rounded corners image", "round image corners", "circle crop"], "Round the corners — or make it a circle.", "Add adjustable corner radius (up to a full circle) with transparency, exported as PNG.", { isNew: true }),
  fx("image-border", "Border Generator", "Border", "🖼️", G.amber, "Transform", "tf:border", ["add border to image", "photo border", "image frame color"], "Add a solid color border of any width.", "Frame your image with an adjustable-width, any-color border — great for polaroid looks and thumbnails."),
  fx("frame-generator", "Frame Generator", "Frame", "🎞️", G.orange, "Transform", "tf:frame", ["photo frame", "add frame to picture", "decorative frame"], "Wrap your photo in a decorative frame.", "Choose from clean, film-strip and shadow-box frame styles that composite around your image on-device."),
  fx("canvas-resize", "Canvas Resize", "Canvas", "📐", G.blue, "Transform", "tf:canvas", ["canvas resize", "extend canvas", "add padding to image"], "Extend the canvas / add padding.", "Grow the canvas around your image with a chosen background color — add breathing room or fit an aspect ratio without cropping."),
  fx("transparent-background", "Transparent Background", "Transparent", "🫥", G.violet, "Studio", "tf:transparent", ["transparent background", "make color transparent", "remove white background"], "Knock out a solid background color to transparency.", "Pick a background color (e.g. white) and a tolerance to make it transparent — fast on-device chroma-key for logos and simple graphics. For photos use the AI Background Remover."),
  fx("smart-auto-crop", "Smart Auto Crop", "Auto Crop", "✂️", G.green, "Transform", "tf:smartcrop", ["auto crop image", "trim whitespace", "smart crop"], "Auto-trim empty borders around the subject.", "Detects and removes uniform whitespace/margins automatically, tightening the crop to the content."),
  fx("face-crop", "Face Crop", "Face Crop", "🙂", G.pink, "Transform", "tf:facecrop", ["face crop", "crop to face", "profile picture crop"], "Auto-center a square crop on the face.", "Uses on-device face detection (with a smart center fallback) to produce a perfectly framed square avatar crop.", { isNew: true }),

  /* ── CONVERT ── */
  fx("convert-to-jpg", "Convert to JPG", "To JPG", "🖼️", G.amber, "Convert", "convert:jpeg", ["convert to jpg", "png to jpg", "webp to jpg"], "Convert any image to JPG.", "Turn PNG, WebP or other images into compact JPG with an adjustable quality — ideal for photos and email.", { popular: true }),
  fx("convert-to-png", "Convert to PNG", "To PNG", "🏞️", G.blue, "Convert", "convert:png", ["convert to png", "jpg to png", "webp to png"], "Convert any image to lossless PNG.", "Export to PNG for transparency and crisp edges — the best format for logos, graphics and screenshots."),
  fx("convert-to-webp", "Convert to WebP", "To WebP", "🌐", G.teal, "Convert", "convert:webp", ["convert to webp", "jpg to webp", "png to webp"], "Convert to the tiny modern WebP.", "WebP delivers the smallest web-ready files at great quality — convert with an adjustable quality slider.", { popular: true }),
  fx("convert-to-avif", "Convert to AVIF", "To AVIF", "🆕", G.violet, "Convert", "convert:avif", ["convert to avif", "avif converter", "next-gen image format"], "Convert to next-gen AVIF (where supported).", "AVIF pushes compression even further than WebP. Export runs on-device in browsers that support AVIF encoding."),
  fx("convert-to-bmp", "Convert to BMP", "To BMP", "🗂️", G.slate, "Convert", "convert:bmp", ["convert to bmp", "image to bmp", "bitmap converter"], "Convert to uncompressed BMP.", "Export a raw bitmap BMP for legacy software and pixel-exact workflows — encoded on-device."),
  fx("convert-to-tiff", "Convert to TIFF", "To TIFF", "🗃️", G.indigo, "Convert", "convert:tiff", ["convert to tiff", "image to tiff", "tiff converter"], "Convert to print-ready TIFF.", "Export an uncompressed TIFF for print and archival workflows, generated locally in your browser."),
  fx("convert-to-ico", "Convert to ICO", "To ICO", "🔷", G.cyan, "Convert", "convert:ico", ["convert to ico", "favicon generator", "png to ico"], "Make a favicon .ico file.", "Resize and export a multi-size .ico for website favicons and app icons — on-device."),
  fx("convert-to-svg", "PNG to SVG", "To SVG", "🖊️", G.green, "Convert", "convert:svg", ["png to svg", "raster to vector", "image to svg"], "Wrap or trace an image into SVG.", "Embed your raster as a clean SVG (base64) instantly; true vector tracing is pre-wired through the connector."),
  fx("heic-to-jpg", "HEIC to JPG", "HEIC", "📱", G.orange, "Convert", "convert:heic", ["heic to jpg", "iphone photo converter", "heic converter"], "Convert iPhone HEIC photos to JPG.", "Modern browsers that can decode HEIC convert on-device; otherwise the connector-backed path handles it.", { isNew: true }),

  /* ── SOCIAL ── */
  { slug: "social-media-resize", title: "Social Media Resizer", short: "Social Resize", desc: "Resize an image to any social platform size in one click.", emoji: "📱", grad: G.pink, category: "Social", engine: "social:_picker", status: "live", popular: true, keywords: ["social media image resizer", "resize for instagram", "social media sizes"], intro: "Resize an image to any social platform size in one click.", about: "Pick a platform preset — Instagram, Facebook, YouTube, TikTok, LinkedIn, Pinterest, X, Discord — and export at the exact pixel size with smart fit or fill. All on-device.", steps: S3("Upload your image.", "Choose a platform preset (or fit/fill mode).", "Download it at the exact size — JPG, PNG and WebP keep their format."), faqs: baseFaq() },
  ...([
    ["instagram-post", "Instagram Post", "1080×1080", "🟪"], ["instagram-story", "Instagram Story", "1080×1920", "📲"],
    ["facebook-cover", "Facebook Cover", "820×312", "📘"], ["youtube-thumbnail", "YouTube Thumbnail", "1280×720", "▶️"],
    ["youtube-banner", "YouTube Banner", "2560×1440", "📺"], ["tiktok-cover", "TikTok Cover", "1080×1920", "🎵"],
    ["linkedin-banner", "LinkedIn Banner", "1584×396", "💼"], ["pinterest-pin", "Pinterest Pin", "1000×1500", "📌"],
    ["twitter-header", "Twitter/X Header", "1500×500", "🐦"], ["discord-banner", "Discord Banner", "960×540", "🎮"],
  ] as [string, string, string, string][]).map(([id, title, size, emoji]) =>
    fx(id, `${title} Maker`, title, emoji, G.pink, "Social", `social:${id}`,
      [`${title.toLowerCase()} size`, `resize for ${title.toLowerCase()}`, `${title.toLowerCase()} maker`],
      `Resize your image to the exact ${title} size (${size}).`,
      `Export a pixel-perfect ${size} image for ${title} with fit or fill framing — no cropping surprises, on-device.`)
  ),

  /* ── COLOR ── */
  { slug: "color-picker", title: "Image Color Picker", short: "Color Picker", desc: "Pick the exact color of any pixel in an image.", emoji: "🎯", grad: G.violet, category: "Color", engine: "color:picker", status: "live", popular: true, keywords: ["color picker from image", "get hex from image", "eyedropper online"], intro: "Pick the exact color of any pixel in an image.", about: "Hover and click any pixel to read its HEX and RGB — the online eyedropper for matching brand colors from any photo or screenshot.", steps: S3("Upload an image.", "Click any pixel to sample its color.", "Copy the HEX/RGB value."), faqs: baseFaq() },
  { slug: "dominant-color", title: "Dominant Color Extractor", short: "Dominant Color", desc: "Find the dominant colors in any image.", emoji: "🖌️", grad: G.pink, category: "Color", engine: "color:dominant", status: "live", keywords: ["dominant color extractor", "average color image", "main colors of photo"], intro: "Find the dominant colors in any image.", about: "Analyzes the image and lists its most-used colors with HEX codes — great for theming and design inspiration.", steps: S3("Upload an image.", "See the dominant colors ranked.", "Copy any HEX code."), faqs: baseFaq() },
  { slug: "palette-generator", title: "Palette Generator", short: "Palette", desc: "Generate a color palette from an image.", emoji: "🎨", grad: G.lime, category: "Color", engine: "color:palette", status: "live", isNew: true, keywords: ["color palette generator", "palette from image", "extract colors"], intro: "Generate a color palette from an image.", about: "Extracts a balanced 6-color palette from your photo, exportable as swatches with HEX codes — perfect for brand and UI design.", steps: S3("Upload an image.", "A harmonious palette is extracted.", "Copy codes or download swatches."), faqs: baseFaq() },
  { slug: "gradient-generator", title: "Gradient Generator", short: "Gradient", desc: "Create beautiful CSS gradients and export PNG.", emoji: "🌅", grad: G.violet, category: "Color", engine: "color:gradient", status: "live", keywords: ["gradient generator", "css gradient", "gradient background maker"], intro: "Create beautiful CSS gradients and export PNG.", about: "Design linear gradients with multiple stops, copy the CSS, and export a high-res PNG background — no image upload needed.", steps: S3("Pick colors and angle.", "Preview the gradient live.", "Copy CSS or download PNG."), faqs: baseFaq() },
  { slug: "histogram-viewer", title: "Histogram Viewer", short: "Histogram", desc: "View the RGB & luminance histogram of an image.", emoji: "📊", grad: G.cyan, category: "Color", engine: "color:histogram", status: "live", keywords: ["image histogram", "rgb histogram viewer", "exposure histogram"], intro: "View the RGB & luminance histogram of an image.", about: "Plots the tonal distribution across red, green, blue and luminance so you can judge exposure and contrast like a pro editor.", steps: S3("Upload an image.", "Read the RGB + luminance histogram.", "Use it to guide your edits."), faqs: baseFaq() },

  /* ── OVERLAY ── */
  { slug: "text-overlay", title: "Add Text to Image", short: "Text Overlay", desc: "Add styled text captions onto any image.", emoji: "🔤", grad: G.blue, category: "Overlay", engine: "overlay:text", status: "live", popular: true, keywords: ["add text to image", "text on photo", "caption image"], intro: "Add styled text captions onto any image.", about: "Type text, choose font size, color, outline and position, drag it anywhere on the image, and export — memes, quotes and thumbnails in seconds.", steps: S3("Upload an image.", "Add and style your text; drag to position.", "Download the captioned image."), faqs: baseFaq() },
  { slug: "emoji-overlay", title: "Add Emoji to Image", short: "Emoji / Sticker", desc: "Drop emoji and sticker overlays onto a photo.", emoji: "😎", grad: G.amber, category: "Overlay", engine: "overlay:emoji", status: "live", keywords: ["add emoji to photo", "sticker on image", "emoji overlay"], intro: "Drop emoji and sticker overlays onto a photo.", about: "Place resizable emoji stickers anywhere on your image for fun reactions and social posts — all rendered on canvas.", steps: S3("Upload an image.", "Add emoji stickers and drag/scale them.", "Download the result."), faqs: baseFaq() },
  { slug: "watermark-image", title: "Add Watermark to Image", short: "Watermark", desc: "Stamp a text watermark across an image.", emoji: "💧", grad: G.cyan, category: "Overlay", engine: "overlay:watermark", status: "live", keywords: ["add watermark to image", "photo watermark", "copyright image"], intro: "Stamp a text watermark across an image.", about: "Protect your work with a tiled or single text watermark — control text, opacity, size and position. Burned into the pixels on-device.", steps: S3("Upload an image.", "Set watermark text, opacity and tiling.", "Download the watermarked image."), faqs: baseFaq() },
  { slug: "qr-on-image", title: "Add QR Code to Image", short: "QR on Image", desc: "Overlay a scannable QR code onto any image.", emoji: "🔳", grad: G.lime, category: "Overlay", engine: "overlay:qr", status: "live", isNew: true, keywords: ["qr code on image", "add qr to photo", "qr overlay"], intro: "Overlay a scannable QR code onto any image.", about: "Generate a QR from any link and place it on your image (poster, flyer, story) at a chosen corner and size — stays scannable.", steps: S3("Upload an image and enter a link.", "Position and size the QR.", "Download the combined image."), faqs: baseFaq() },
  { slug: "barcode-on-image", title: "Add Barcode to Image", short: "Barcode on Image", desc: "Overlay a barcode (EAN/UPC/Code128) onto an image.", emoji: "🏷️", grad: G.slate, category: "Overlay", engine: "overlay:barcode", status: "live", keywords: ["barcode on image", "add barcode to label", "product label maker"], intro: "Overlay a barcode (EAN/UPC/Code128) onto an image.", about: "Place a real 1D barcode onto product labels and packaging mockups at any position and size, rendered on-device.", steps: S3("Upload an image and enter a value.", "Pick a barcode format and position.", "Download the image."), faqs: baseFaq() },

  /* ── LAYOUT ── */
  { slug: "image-splitter", title: "Image Splitter", short: "Splitter", desc: "Split an image into a grid of tiles.", emoji: "🔲", grad: G.blue, category: "Layout", engine: "layout:split", status: "live", keywords: ["image splitter", "split image into grid", "instagram grid maker"], intro: "Split an image into a grid of tiles.", about: "Cut an image into an N×M grid (e.g. 3×3 for Instagram carousels) and download every tile in a ZIP — on-device.", steps: S3("Upload an image.", "Choose grid rows and columns.", "Download the tiles as a ZIP."), faqs: baseFaq() },
  { slug: "image-joiner", title: "Image Joiner", short: "Joiner", desc: "Merge multiple images into one, side by side or stacked.", emoji: "🧩", grad: G.teal, category: "Layout", engine: "layout:join", status: "live", keywords: ["join images", "merge images", "combine photos"], intro: "Merge multiple images into one, side by side or stacked.", about: "Combine any number of images horizontally or vertically with adjustable spacing and background — perfect for comparisons and strips.", steps: S3("Upload two or more images.", "Choose horizontal or vertical layout.", "Download the combined image."), faqs: baseFaq() },
  { slug: "collage-maker", title: "Collage Maker", short: "Collage", desc: "Create a photo collage from a grid layout.", emoji: "🖼️", grad: G.pink, category: "Layout", engine: "layout:collage", status: "live", popular: true, keywords: ["collage maker", "photo collage", "picture grid maker"], intro: "Create a photo collage from a grid layout.", about: "Drop photos into a clean grid collage with adjustable spacing, corner radius and background color — export a shareable PNG.", steps: S3("Upload several photos.", "Pick a grid and styling.", "Download the collage."), faqs: baseFaq() },
  { slug: "before-after-slider", title: "Before/After Slider", short: "Before/After", desc: "Create an interactive before/after comparison.", emoji: "↔️", grad: G.violet, category: "Layout", engine: "layout:compare", status: "live", isNew: true, keywords: ["before after slider", "image comparison", "compare two images"], intro: "Create an interactive before/after comparison.", about: "Load two images and drag the slider to compare — then export a side-by-side comparison PNG for reports and portfolios.", steps: S3("Upload the before and after images.", "Drag the slider to compare.", "Download a side-by-side PNG."), faqs: baseFaq() },
  { slug: "passport-photo", title: "Passport Photo Maker", short: "Passport Photo", desc: "Create passport/ID photos at standard sizes.", emoji: "🪪", grad: G.green, category: "Studio", engine: "special:passport", status: "live", keywords: ["passport photo maker", "id photo", "visa photo size"], intro: "Create passport/ID photos at standard sizes.", about: "Crop and place your photo to standard document sizes (35×45mm, 2×2in, etc.) on a white background, with a printable 4×6 sheet of copies.", steps: S3("Upload a portrait.", "Pick the document size and align the face.", "Download the photo or a print sheet."), faqs: baseFaq() },

  /* ── BATCH ── */
  { slug: "batch-convert", title: "Batch Image Converter", short: "Batch Convert", desc: "Convert many images to one format at once.", emoji: "🔄", grad: G.blue, category: "Batch", engine: "batch:convert", status: "live", popular: true, keywords: ["batch image converter", "convert multiple images", "bulk image convert"], intro: "Convert many images to one format at once.", about: "Queue dozens of images, pick a target format (JPG/PNG/WebP), and download them all in a ZIP — processed on-device with per-file progress.", steps: S3("Add multiple images.", "Choose the output format.", "Download all as a ZIP."), faqs: baseFaq() },
  { slug: "batch-resize", title: "Batch Image Resizer", short: "Batch Resize", desc: "Resize many images to the same dimensions.", emoji: "📐", grad: G.teal, category: "Batch", engine: "batch:resize", status: "live", keywords: ["batch resize images", "bulk resize", "resize multiple photos"], intro: "Resize many images to the same dimensions.", about: "Set a target width/height (or max dimension) and resize an entire batch at once, downloaded as a ZIP — great for web and catalogs.", steps: S3("Add multiple images.", "Set the target size.", "Download the resized ZIP."), faqs: baseFaq() },
  { slug: "batch-compress", title: "Batch Image Compressor", short: "Batch Compress", desc: "Compress many images in one go.", emoji: "🗜️", grad: G.green, category: "Batch", engine: "batch:compress", status: "live", keywords: ["batch compress images", "bulk compress", "compress multiple photos"], intro: "Compress many images in one go.", about: "Shrink a whole folder of images at a chosen quality and download them zipped — the fastest way to prep images for the web.", steps: S3("Add multiple images.", "Pick a quality level.", "Download the compressed ZIP."), faqs: baseFaq() },
  { slug: "batch-rename", title: "Batch Image Renamer", short: "Batch Rename", desc: "Rename many images with a pattern and download.", emoji: "🏷️", grad: G.amber, category: "Batch", engine: "batch:rename", status: "live", keywords: ["batch rename images", "bulk rename files", "rename photos pattern"], intro: "Rename many images with a pattern and download.", about: "Apply a prefix + sequential number pattern to a batch of images and download them re-named in a ZIP — tidy up exports instantly.", steps: S3("Add multiple images.", "Set a name pattern (e.g. photo-###).", "Download the renamed ZIP."), faqs: baseFaq() },

  /* ── METADATA ── */
  { slug: "metadata-viewer", title: "Image Metadata Viewer", short: "Metadata", desc: "Inspect an image's EXIF and technical metadata.", emoji: "🔍", grad: G.slate, category: "Metadata", engine: "meta:view", status: "live", keywords: ["image metadata viewer", "exif viewer", "photo info"], intro: "Inspect an image's EXIF and technical metadata.", about: "Reads dimensions, format, size and available EXIF (camera, GPS, timestamp) locally — nothing is uploaded.", steps: S3("Upload an image.", "Read the metadata report.", "Copy it if you need to share."), faqs: baseFaq() },
  { slug: "metadata-remover", title: "Image Metadata Remover", short: "Strip Metadata", desc: "Remove all EXIF/GPS metadata from an image.", emoji: "🛡️", grad: G.green, category: "Metadata", engine: "meta:remove", status: "live", popular: true, keywords: ["remove image metadata", "strip exif", "remove gps from photo"], intro: "Remove all EXIF/GPS metadata from an image.", about: "Re-encodes the image so hidden EXIF, GPS and camera data are stripped — protect your privacy before sharing. On-device.", steps: S3("Upload an image.", "Metadata is stripped on export.", "Download the clean image."), faqs: baseFaq() },
  { slug: "exif-editor", title: "EXIF Editor", short: "EXIF Editor", desc: "View EXIF and export a clean copy.", emoji: "📝", grad: G.indigo, category: "Metadata", engine: "meta:exif", status: "live", keywords: ["exif editor", "edit photo metadata", "view exif data"], intro: "View EXIF and export a clean copy.", about: "Inspect embedded EXIF fields and export a metadata-free copy of your image. Full field editing is wired through the connector.", steps: S3("Upload an image.", "Review the EXIF fields.", "Export a clean copy."), faqs: baseFaq() },

  /* ── STUDIO ── */
  { slug: "screenshot-beautifier", title: "Screenshot Beautifier", short: "Beautifier", desc: "Turn plain screenshots into gorgeous framed shots.", emoji: "✨", grad: G.violet, category: "Studio", engine: "special:beautifier", status: "live", popular: true, isNew: true, keywords: ["screenshot beautifier", "beautiful screenshots", "gradient background screenshot"], intro: "Turn plain screenshots into gorgeous framed shots.", about: "Drop your screenshot onto a vibrant gradient (or solid) background with padding, rounded corners and a soft shadow — the look every SaaS uses on landing pages. Export a share-ready PNG.", steps: S3("Upload a screenshot.", "Pick a background, padding and radius.", "Download the polished image."), faqs: baseFaq() },
  { slug: "device-frame", title: "Device Frame Generator", short: "Device Frame", desc: "Wrap a screenshot in a phone or browser frame.", emoji: "📱", grad: G.blue, category: "Studio", engine: "special:device", status: "live", isNew: true, keywords: ["device frame generator", "phone mockup", "browser mockup"], intro: "Wrap a screenshot in a phone or browser frame.", about: "Place your screenshot inside a clean phone or browser-window frame for pitches, docs and app-store shots — rendered on canvas, on-device.", steps: S3("Upload a screenshot.", "Choose a phone or browser frame.", "Download the framed image."), faqs: baseFaq() },
  { slug: "mockup-generator", title: "Mockup Generator", short: "Mockup", desc: "Place your design onto a device/product mockup.", emoji: "🖥️", grad: G.indigo, category: "Studio", engine: "special:device", status: "live", keywords: ["mockup generator", "product mockup", "design mockup"], intro: "Place your design onto a device/product mockup.", about: "Composite your artwork onto a device frame for presentations. More product mockups are wired through the connector.", steps: S3("Upload your design.", "Pick a mockup frame.", "Download the mockup."), faqs: baseFaq() },
  { slug: "image-comparison", title: "Image Comparison", short: "Compare", desc: "Compare two images side by side with a slider.", emoji: "🔬", grad: G.cyan, category: "Studio", engine: "layout:compare", status: "live", keywords: ["image comparison tool", "compare two photos", "difference slider"], intro: "Compare two images side by side with a slider.", about: "Load two versions and drag to compare edits, compression or before/after — export a combined comparison image.", steps: S3("Upload two images.", "Drag the comparison slider.", "Download a side-by-side PNG."), faqs: baseFaq() },
  { slug: "remove-watermark", title: "Remove Watermark", short: "Remove Watermark", desc: "Brush over a watermark to blend it away.", emoji: "🧽", grad: G.orange, category: "Studio", engine: "special:removewm", status: "preview", keywords: ["remove watermark from image", "erase watermark", "watermark remover"], intro: "Brush over a watermark to blend it away.", about: "Paint over a watermark and the tool blends surrounding pixels to hide it — great for small marks. Full neural inpainting for large logos is wired through the QRix connector. Only use on images you have the rights to.", steps: S3("Upload an image.", "Brush over the watermark.", "Blend and download."), faqs: baseFaq() },
];

/* Swap the FMT marker for the answer this tool's engine can actually honour.
   Done here, once, rather than at 30 call sites — so adding a tool can't
   reintroduce the wrong claim, and an engine family without a rule falls back
   to the PNG sentence that the fx/transform/overlay/layout clients do honour. */
export const IMAGE_TOOLS: ImgTool[] = RAW_IMAGE_TOOLS.map((t) => ({
  ...t,
  faqs: t.faqs.map((f) => (f === FMT ? { q: FMT.q, a: fmtAnswer(t.engine) } : f)),
}));

export function getImgTool(slug: string): ImgTool | undefined {
  return IMAGE_TOOLS.find((t) => t.slug === slug);
}
export const IMG_CATEGORIES: ImgCategory[] = ["Adjust", "Filters", "Transform", "Convert", "Social", "Color", "Overlay", "Layout", "Batch", "Metadata", "Studio"];
