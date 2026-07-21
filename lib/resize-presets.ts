/* Programmatic resize-preset pages: /resize/<slug>.
   Each entry drives one SSG page rendering the SAME working
   components/image/ImageConvertClient via the `resize:<w>x<h>` engine, with
   copy written for that specific size (never templated — thin pages don't rank).
   These target size-intent queries ("1920x1080 image resizer", "passport photo
   size"); the platform-intent equivalents live at /image-tools/<social slug>. */

export type ResizePreset = {
  slug: string;                 // route segment, e.g. "1920x1080"
  w: number; h: number;
  group: "Display" | "Print" | "ID" | "Web";
  label: string;                // short human name, e.g. "Full HD"
  emoji: string;
  title: string; h1: string; desc: string;
  intro: string;                // one line under the h1
  about: string;                // unique body copy (~120+ words)
  keywords: string[];
  steps: [string, string][];
  faqs: { q: string; a: string }[];
};

/** Group accent, so presets of the same kind read as a family. */
const GRAD: Record<ResizePreset["group"], string> = {
  Display: "linear-gradient(135deg,#2563eb,#60a5fa)",
  Print: "linear-gradient(135deg,#b45309,#f59e0b)",
  ID: "linear-gradient(135deg,#0f766e,#2dd4bf)",
  Web: "linear-gradient(135deg,#7c3aed,#a78bfa)",
};
export const presetGrad = (p: ResizePreset) => GRAD[p.group];

/** Shared closing FAQ — every page also carries 3+ size-specific ones above it. */
const privacyFaq = {
  q: "Are my images uploaded to a server?",
  a: "No. Resizing runs entirely in your browser with the Canvas API, so the file never leaves your device and nothing is stored or transmitted.",
};

const steps = (pick: string, out: string): [string, string][] => [
  ["Add your image", "Drop the file in or click to browse — it stays on your device."],
  ["Choose fill or fit", pick],
  ["Download", out],
];

export const RESIZE_PRESETS: ResizePreset[] = [
  {
    slug: "1920x1080", w: 1920, h: 1080, group: "Display", label: "Full HD", emoji: "🖥️",
    title: "Resize Image to 1920x1080 — Free Online Tool",
    h1: "Resize an image to 1920×1080",
    desc: "Resize any photo to exactly 1920x1080 pixels online and free. Fill or fit with a custom background, previewed in your browser — no upload, no signup.",
    intro: "Hit exactly 1920×1080 — the Full HD size wallpapers, presentation slides and video backgrounds expect.",
    about: "1920×1080 is the most widely deployed screen resolution in the world, which makes it the default target for desktop wallpapers, YouTube video backgrounds, PowerPoint and Google Slides backdrops, and digital signage. It is a 16:9 frame, so a photo shot on a phone in 4:3 or 3:2 will not map onto it cleanly — something has to give. Fill crops the overflowing edges and guarantees the frame is completely covered, which is what you want for a wallpaper. Fit keeps the entire image visible and pads the leftover space with a colour you pick, which is what you want when nothing in the shot can be cut. Preview the result before downloading, and remember that enlarging a small source to 1080p cannot invent detail that was never captured.",
    keywords: ["resize image to 1920x1080", "1920x1080 image resizer", "1080p image size", "full hd wallpaper resize", "make image 1920x1080"],
    steps: steps("Fill covers the whole 16:9 frame and crops the overflow; fit keeps everything visible and pads the sides.", "Save your 1920×1080 image."),
    faqs: [
      { q: "Why does my photo get cropped at 1920x1080?", a: "1920×1080 is 16:9. Phone photos are usually 4:3 or 3:2, which is taller, so fill mode trims the top and bottom to cover the frame. Switch to fit if you need every part of the image to survive." },
      { q: "Can I enlarge a small image to 1920x1080?", a: "Yes, but upscaling stretches the pixels you already have — it cannot recover detail. Starting from at least 1280px wide gives a noticeably sharper result." },
      { q: "Is 1920x1080 the same as 1080p?", a: "Yes. 1080p refers to 1080 lines of vertical resolution in a 16:9 frame, which is exactly 1920×1080 pixels." },
      { q: "What background colour is used in fit mode?", a: "White by default, and you can change it with the colour picker — useful for matching a slide deck or a site background." },
      privacyFaq,
    ],
  },
  {
    slug: "1280x720", w: 1280, h: 720, group: "Display", label: "HD 720p", emoji: "📺",
    title: "Resize Image to 1280x720 — Free 720p Resizer",
    h1: "Resize an image to 1280×720",
    desc: "Resize an image to exactly 1280x720 online for free. The standard HD and video-thumbnail size, generated in your browser with fill or fit.",
    intro: "Hit exactly 1280×720 — the HD size video platforms and course thumbnails ask for.",
    about: "1280×720 is the smallest resolution that still counts as high definition, and it has become the standard upload size for video thumbnails and course-platform cover images because it looks sharp on a phone while staying light enough to load instantly. It is the same 16:9 shape as 1080p at half the pixel count, so a 1920×1080 export scales down to it perfectly with no cropping at all. Coming from a 4:3 or square source is where decisions appear: fill crops to cover the wider frame, fit letterboxes the image against a background colour of your choosing. Because 720p is a downscale for most modern cameras, results here are usually crisper than the same crop pushed up to 1080p.",
    keywords: ["resize image to 1280x720", "1280x720 image resizer", "720p image size", "hd thumbnail size", "make image 1280x720"],
    steps: steps("Fill crops to cover the 16:9 frame; fit pads it with a background colour instead.", "Save your 1280×720 image."),
    faqs: [
      { q: "Is 1280x720 good enough for a video thumbnail?", a: "Yes — it is the minimum recommended size on most video platforms and displays sharply at typical thumbnail dimensions. Use 1920×1080 if you want extra headroom for future zooming or cropping." },
      { q: "Will downscaling from 1920x1080 lose quality?", a: "Barely. Both are 16:9, so it is a clean proportional downscale with no cropping — downscaling generally looks sharper than upscaling." },
      { q: "Why is my square image letterboxed?", a: "A square source is much taller than a 16:9 frame. Fit preserves the whole square and fills the sides with your chosen colour; fill crops the top and bottom instead." },
      { q: "What file format do I get back?", a: "A JPG, with a quality slider so you can trade file size against detail. Keep it at 90 for a thumbnail that still looks untouched." },
      privacyFaq,
    ],
  },
  {
    slug: "3840x2160", w: 3840, h: 2160, group: "Display", label: "4K UHD", emoji: "🌌",
    title: "Resize Image to 3840x2160 — Free 4K Resizer",
    h1: "Resize an image to 3840×2160",
    desc: "Resize an image to exactly 3840x2160 (4K UHD) online and free. Fill or fit to the 16:9 frame in your browser — no upload and no watermark.",
    intro: "Hit exactly 3840×2160 — the 4K UHD frame for high-DPI wallpapers and large displays.",
    about: "3840×2160 is 4K UHD: four 1080p frames in one, and the native resolution of most modern televisions and an increasing share of desktop monitors. It is the size to target when a wallpaper needs to stay sharp on a high-DPI screen, when artwork will be shown on a large panel, or when you want room to crop later without losing resolution. The honest caveat is source material. Resizing a 1200px image up to 3840px wide produces a 4K file, but not 4K detail — the result will look soft next to a genuinely high-resolution original. Start from the largest version you have. At this size the output file is also substantially bigger, so use the quality slider to keep it manageable.",
    keywords: ["resize image to 3840x2160", "4k image resizer", "3840x2160 wallpaper size", "uhd image size", "make image 4k"],
    steps: steps("Fill covers the full 4K frame and crops the overflow; fit keeps everything visible on a background colour.", "Save your 3840×2160 image."),
    faqs: [
      { q: "Can I turn a small photo into a real 4K image?", a: "You can produce a 3840×2160 file, but upscaling cannot create detail that was never captured — it enlarges existing pixels. For genuine sharpness start from a high-resolution original, or try an AI upscaler first." },
      { q: "Is 3840x2160 the same as 4K?", a: "It is 4K UHD, the consumer standard used by TVs and monitors. Cinema 4K is slightly wider at 4096×2160, so check which one your target actually wants." },
      { q: "Why is the downloaded file so large?", a: "It holds over 8 million pixels. Lower the quality slider to around 80 — at 4K the difference is very hard to see but the file shrinks considerably." },
      { q: "Will very large images slow my browser down?", a: "Processing happens on your device, so a 4K resize takes a moment and uses memory. It is bounded only by what your machine has available." },
      privacyFaq,
    ],
  },
  {
    slug: "2560x1440", w: 2560, h: 1440, group: "Display", label: "QHD 1440p", emoji: "🖼️",
    title: "Resize Image to 2560x1440 — Free 1440p Resizer",
    h1: "Resize an image to 2560×1440",
    desc: "Resize an image to exactly 2560x1440 (QHD) online for free. Fill or fit to 16:9 in your browser with no upload, no signup and no watermark.",
    intro: "Hit exactly 2560×1440 — the QHD size favoured by gaming monitors and desktop wallpapers.",
    about: "2560×1440, usually called QHD or 1440p, sits between Full HD and 4K and has become the sweet spot for gaming monitors and larger laptop panels: noticeably sharper than 1080p without the file sizes and rendering cost of 4K. It is the natural wallpaper size for those displays, and a common target for video-platform channel art and stream overlays. Like every 16:9 size, the shape is the thing to plan for — a portrait photo will lose a lot of its top and bottom in fill mode, so consider fit with a background colour that matches your desktop theme. Downscaling from a 4K original to 1440p is a clean operation and generally produces a sharper wallpaper than upscaling a 1080p one.",
    keywords: ["resize image to 2560x1440", "1440p image resizer", "2560x1440 wallpaper size", "qhd image size", "make image 2560x1440"],
    steps: steps("Fill covers the 16:9 frame and crops the excess; fit keeps the whole image and pads it.", "Save your 2560×1440 image."),
    faqs: [
      { q: "Is 2560x1440 better than 1920x1080 for a wallpaper?", a: "On a 1440p monitor, yes — a 1080p wallpaper has to be stretched and looks soft. On a 1080p monitor the extra pixels are simply discarded." },
      { q: "Does 2560x1440 have the same shape as 1080p?", a: "Yes, both are 16:9, so converting between them is a clean scale with no cropping." },
      { q: "Should I upscale a 1080p image to 1440p?", a: "It will fill the screen but will not add detail. If you have a larger original, resize that instead — downscaling always beats upscaling." },
      { q: "Can I control the padding colour in fit mode?", a: "Yes. The colour picker sets the background, so you can match a desktop theme or a brand colour exactly." },
      privacyFaq,
    ],
  },
  {
    slug: "1080x1080", w: 1080, h: 1080, group: "Web", label: "Square", emoji: "⬜",
    title: "Resize Image to 1080x1080 — Free Square Resizer",
    h1: "Resize an image to 1080×1080",
    desc: "Make any photo a perfect 1080x1080 square online and free. Fill or fit with a custom background colour, processed entirely in your browser.",
    intro: "Turn any photo into a clean 1080×1080 square without stretching it out of shape.",
    about: "1080×1080 is the square that feeds most social grids, marketplace listings and product tiles, and it is the size to reach for whenever a layout expects a 1:1 image. Almost no camera shoots square, so every square export is a decision about what to lose. Fill crops the long edge and guarantees a full-bleed tile with no borders, which suits photographs where the subject sits near the centre. Fit shrinks the whole image inside the square and pads the remaining strips with a colour you choose — the right call for product shots, logos and anything with text near the edges that must not be clipped. Because the tool previews the crop before you commit, you can check the subject survives rather than discovering it afterwards.",
    keywords: ["resize image to 1080x1080", "square image resizer", "1080x1080 size", "make image square", "1:1 image resizer"],
    steps: steps("Fill crops to a full-bleed square; fit keeps the whole image and pads the sides with your colour.", "Save your 1080×1080 square."),
    faqs: [
      { q: "How do I make an image square without cutting anything off?", a: "Use fit mode. The entire image is scaled to sit inside the square and the leftover strips are filled with the background colour you pick, so nothing is cropped." },
      { q: "Will my photo look stretched?", a: "No. The aspect ratio is always preserved — the tool crops or pads rather than distorting, so faces and shapes stay correct." },
      { q: "Is 1080x1080 the best square size?", a: "It is the safest general-purpose choice: high enough to look sharp on modern phone screens without producing an unnecessarily heavy file." },
      { q: "Can I use a transparent background instead of a colour?", a: "This tool exports JPG, which has no transparency, so fit mode uses a solid colour. For a transparent square, resize and then use the PNG converter." },
      privacyFaq,
    ],
  },
  {
    slug: "1200x630", w: 1200, h: 630, group: "Web", label: "OG / link preview", emoji: "🔗",
    title: "Resize Image to 1200x630 — Open Graph Image Size",
    h1: "Resize an image to 1200×630",
    desc: "Resize an image to exactly 1200x630 online free — the Open Graph size used for link previews on social platforms and chat apps.",
    intro: "Hit exactly 1200×630 — the Open Graph size that controls how your link looks when it is shared.",
    about: "1200×630 is the Open Graph image size, the picture that appears when someone pastes your URL into a social post, a group chat or a messaging app. Getting it right matters more than most image sizes because it is the first thing people see of your page, and platforms that receive the wrong ratio will crop it themselves — usually straight through the middle of your headline. The frame is roughly 1.91:1, wider than almost anything a camera produces, so plan for a horizontal crop. Keep important text well inside the centre, since some clients trim the edges further to fit their own card layouts. Use fit with a brand background colour when a logo or a full graphic has to stay intact.",
    keywords: ["resize image to 1200x630", "open graph image size", "og image resizer", "link preview image size", "social share image size"],
    steps: steps("Fill crops to the wide 1.91:1 card; fit keeps the full graphic on a background colour.", "Save your 1200×630 preview image."),
    faqs: [
      { q: "What is the correct Open Graph image size?", a: "1200×630 is the widely recommended size. It satisfies the 1.91:1 ratio most platforms expect and is large enough to stay sharp on high-DPI screens." },
      { q: "Why does my preview image look cropped when shared?", a: "Clients crop anything that does not match their card ratio. Starting from an exact 1200×630 file removes the guesswork, and keeping text near the centre protects it from any further trimming." },
      { q: "Does the same size work for chat apps and messaging previews?", a: "Mostly yes — most link-preview implementations read the same Open Graph tags, though some render a smaller square thumbnail from the centre of the image." },
      { q: "Should text in an OG image be large?", a: "Yes. Previews are often displayed a few hundred pixels wide, so type that looks generous at full size becomes readable rather than oversized." },
      privacyFaq,
    ],
  },
  {
    slug: "800x600", w: 800, h: 600, group: "Display", label: "SVGA 4:3", emoji: "🗔",
    title: "Resize Image to 800x600 — Free Online Resizer",
    h1: "Resize an image to 800×600",
    desc: "Resize an image to exactly 800x600 pixels online and free. The classic 4:3 size for forms, uploads and lightweight web images.",
    intro: "Hit exactly 800×600 — the classic 4:3 size older upload forms and portals still ask for.",
    about: "800×600 is a 4:3 frame that predates widescreen displays, and it survives because so many systems standardised on it: school and government upload forms, older content-management systems, e-learning platforms and internal tools frequently cap images at this size. It is also a practical choice when a page needs an illustration that loads instantly on a slow connection. Modern phone photos are far larger, so this is nearly always a downscale, which keeps the result crisp. Photos shot in 3:2 or 16:9 are wider than 4:3, so fill will trim their sides; fit preserves the full frame and pads instead. If a form rejects your file for being too big, lowering the quality slider usually solves it without changing the dimensions.",
    keywords: ["resize image to 800x600", "800x600 image resizer", "4:3 image size", "make image 800x600", "800 by 600 photo"],
    steps: steps("Fill crops to the 4:3 frame; fit keeps the whole image and pads it with a colour.", "Save your 800×600 image."),
    faqs: [
      { q: "Why do upload forms still ask for 800x600?", a: "Many were built when 4:3 displays were standard and the limit was never revisited. It also keeps uploads small, which suits systems with tight storage or bandwidth budgets." },
      { q: "My file is still too large after resizing — what now?", a: "Dimensions and file size are different things. Lower the quality slider to shrink the file while keeping it exactly 800×600." },
      { q: "Is 800x600 the same shape as a phone photo?", a: "Usually not. Phones typically shoot 4:3 in portrait or 16:9 in video, so a landscape 4:3 target often needs rotation or cropping first." },
      { q: "Will a 4000px photo look bad at 800x600?", a: "No — downscaling discards pixels and generally sharpens the result. Quality problems come from upscaling, not from reducing size." },
      privacyFaq,
    ],
  },
  {
    slug: "1024x768", w: 1024, h: 768, group: "Display", label: "XGA 4:3", emoji: "📐",
    title: "Resize Image to 1024x768 — Free Online Resizer",
    h1: "Resize an image to 1024×768",
    desc: "Resize an image to exactly 1024x768 online for free. The XGA 4:3 size used by projectors, tablets and legacy display systems.",
    intro: "Hit exactly 1024×768 — the XGA size projectors, kiosks and older tablets expect.",
    about: "1024×768 is XGA, the resolution that dominated projectors and business laptops for years and still turns up wherever hardware has a long service life: meeting-room projectors, digital kiosks, industrial panels, older tablets and plenty of embedded displays. If a slide or a signage image will be shown on equipment you do not control, XGA is the safe assumption. Like 800×600 it is a 4:3 frame, so widescreen sources lose their sides in fill mode. For presentation backgrounds fit is often the better choice, because padding with a colour that matches the slide template looks deliberate while a hard crop can decapitate a diagram. Being a modest resolution, the exported file stays small enough to load instantly from a USB stick or a slow network share.",
    keywords: ["resize image to 1024x768", "1024x768 image resizer", "xga image size", "projector image size", "make image 1024x768"],
    steps: steps("Fill crops to the 4:3 frame; fit preserves the whole image on a background colour.", "Save your 1024×768 image."),
    faqs: [
      { q: "Is 1024x768 still worth targeting?", a: "Yes, whenever the display is out of your hands — projectors, kiosks and industrial panels commonly still run at XGA, and an oversized image may be scaled unpredictably." },
      { q: "What is the difference between 1024x768 and 800x600?", a: "Both are 4:3; XGA simply has more pixels, so it looks sharper on anything larger than a small screen while keeping the same shape." },
      { q: "Why does my widescreen photo lose its edges?", a: "A 16:9 source is wider than 4:3, so fill trims the left and right to cover the frame. Fit keeps everything and pads the top and bottom instead." },
      { q: "Can I match the padding to my slide template?", a: "Yes — set the background with the colour picker so the padded areas blend into the deck instead of standing out." },
      privacyFaq,
    ],
  },
  {
    slug: "600x600", w: 600, h: 600, group: "ID", label: "US passport 2×2in", emoji: "🛂",
    title: "Resize Photo to 600x600 — US Passport Photo Size",
    h1: "Resize a photo to 600×600",
    desc: "Resize a photo to exactly 600x600 pixels online free — the 2x2 inch US passport size at 300 DPI, cropped in your browser with no upload.",
    intro: "Hit exactly 600×600 — the 2×2 inch US passport and visa photo size at 300 DPI.",
    about: "The United States passport photo is 2×2 inches, which at the 300 DPI required for printing is exactly 600×600 pixels. This tool produces a file at those dimensions from a photo you already have, using fill to crop it square around the centre or fit to preserve the whole frame against a plain background. What it does not do is verify the official composition rules, and those are strict: the head must occupy roughly 50–69% of the image height, the eyes sit between 56% and 69% up from the bottom, the background must be plain white or off-white, the expression neutral with both eyes open, and no glasses. Check the current official guidance before submitting — a correctly sized photo can still be rejected on composition.",
    keywords: ["600x600 photo resizer", "us passport photo size", "2x2 inch photo pixels", "passport photo 600x600", "resize photo for passport"],
    steps: steps("Fill crops a centred square; fit keeps the whole photo against a plain background colour.", "Save your 600×600 photo."),
    faqs: [
      { q: "Is 600x600 the correct US passport photo size?", a: "Yes for the digital file: 2×2 inches at 300 DPI is 600×600 pixels. Official guidance also accepts larger square files, but the 2×2 proportion is fixed." },
      { q: "Does this make my photo compliant with passport rules?", a: "No. It sets the dimensions only. Head size, eye position, plain background, neutral expression and lighting all still have to meet the official requirements, which you should check before submitting." },
      { q: "What background colour should I use?", a: "Plain white or off-white is required. Set white in the colour picker for fit mode — but note that padding a photo is not a substitute for actually photographing against a plain wall." },
      { q: "Can I print a 600x600 file as a 2x2 photo?", a: "Yes. At 300 DPI it prints at exactly 2×2 inches. Ask the print shop for that size rather than letting them scale it to fit standard paper." },
      privacyFaq,
    ],
  },
  {
    slug: "413x531", w: 413, h: 531, group: "ID", label: "35×45mm ID", emoji: "🪪",
    title: "Resize Photo to 413x531 — 35x45mm ID Photo Size",
    h1: "Resize a photo to 413×531",
    desc: "Resize a photo to exactly 413x531 pixels online free — the 35x45mm ID and passport size at 300 DPI used across Europe and much of the world.",
    intro: "Hit exactly 413×531 — the 35×45 mm ID photo size at 300 DPI used across Europe and beyond.",
    about: "35×45 millimetres is the standard identity photo size across the European Union, the United Kingdom and many other countries, used for passports, national ID cards, residence permits and visa applications. At 300 DPI those millimetres work out to 413×531 pixels, which is what this tool produces. The frame is portrait and slightly narrower than a typical phone photo, so fill crops the sides around the centre of the image. As with any official document photo, dimensions are only half the requirement: most authorities also specify how much of the frame the head must fill (commonly 70–80% of the height), a plain light background, a neutral expression, and no shadows across the face. Check your own country's current specification before you submit.",
    keywords: ["413x531 photo resizer", "35x45mm photo size pixels", "eu passport photo size", "uk passport photo size", "id photo resizer"],
    steps: steps("Fill crops a centred portrait frame; fit keeps the whole photo on a plain background.", "Save your 413×531 photo."),
    faqs: [
      { q: "Why is 35x45mm equal to 413x531 pixels?", a: "At 300 DPI there are about 11.8 pixels per millimetre, so 35 mm becomes 413 pixels and 45 mm becomes 531 — the standard digital equivalent of the printed size." },
      { q: "Which countries use the 35x45mm photo size?", a: "It is the norm across the EU and UK and is widely accepted elsewhere for passports, ID cards and visas. The US is the notable exception, using a 2×2 inch square instead." },
      { q: "Does this guarantee my photo will be accepted?", a: "No — it sets the pixel dimensions only. Head proportion, background, lighting and expression rules still apply and vary by country, so check the official specification." },
      { q: "Can I print this at home?", a: "Yes, at 300 DPI it prints at exactly 35×45 mm, but many authorities require professional photo paper. A print shop is the safer route for an official application." },
      privacyFaq,
    ],
  },
  {
    slug: "400x400", w: 400, h: 400, group: "Web", label: "Profile picture", emoji: "👤",
    title: "Resize Image to 400x400 — Profile Picture Size",
    h1: "Resize an image to 400×400",
    desc: "Resize an image to exactly 400x400 pixels online and free — the common square profile-picture and avatar size, cropped in your browser.",
    intro: "Hit exactly 400×400 — the square avatar size most profiles and forums accept.",
    about: "400×400 is the workhorse avatar size: large enough to stay clean on a modern display, small enough that forums, chat tools and account systems accept it without complaint. Because avatars are almost always displayed as circles, the corners of your square will be cut off by the platform itself — so keep the face or logo comfortably inside the middle and leave a little breathing room at the edges. Fill mode crops your photo to a centred square, which is usually what you want for a headshot. Fit shrinks the whole image onto a background colour, which suits a logo or wordmark that must not lose any part of itself. Preview before downloading to confirm nothing important sits where the circular mask will land.",
    keywords: ["resize image to 400x400", "profile picture size", "avatar image resizer", "400x400 image", "square profile photo"],
    steps: steps("Fill crops a centred square headshot; fit places the whole image on a background colour.", "Save your 400×400 avatar."),
    faqs: [
      { q: "Why does my avatar get cut into a circle?", a: "The platform applies a circular mask to a square file. Keep the subject centred with margin around it so the mask never clips anything important." },
      { q: "Is 400x400 large enough for a profile picture?", a: "For most sites, yes. Some platforms prefer larger source files so they can render sharply on high-DPI screens — check if yours specifies a minimum." },
      { q: "How do I stop my logo being cropped?", a: "Use fit mode. The whole logo is scaled to sit inside the square and the remaining space is filled with your chosen background colour." },
      { q: "What if the site rejects my file for being too big?", a: "Lower the quality slider. That reduces file size while keeping the image exactly 400×400." },
      privacyFaq,
    ],
  },
  {
    slug: "1200x1800", w: 1200, h: 1800, group: "Print", label: "4×6 inch print", emoji: "🖨️",
    title: "Resize Photo to 1200x1800 — 4x6 Inch Print Size",
    h1: "Resize a photo to 1200×1800",
    desc: "Resize a photo to exactly 1200x1800 pixels online free — the 4x6 inch print size at 300 DPI, cropped to the right ratio in your browser.",
    intro: "Hit exactly 1200×1800 — a 4×6 inch photo print at the full 300 DPI print shops want.",
    about: "4×6 inches is the standard photo print, and at the 300 DPI that print labs ask for it works out to 1200×1800 pixels. Sizing the file yourself before uploading is worth the minute it takes, because if the ratio does not match the paper the lab's software will crop it for you — often taking the top of someone's head. A 4×6 print is a 2:3 frame, which happens to match most DSLR and mirrorless sensors exactly, so those photos fit with no cropping at all. Phone photos are usually 4:3 and will lose a strip from two sides in fill mode. If the composition cannot survive that, use fit and accept a white border, which many people prefer to a bad crop anyway.",
    keywords: ["1200x1800 photo size", "4x6 print size pixels", "resize photo for 4x6 print", "300 dpi photo resize", "photo print size resizer"],
    steps: steps("Fill crops to the 2:3 print ratio; fit keeps the whole photo and adds a coloured border.", "Save your print-ready 1200×1800 photo."),
    faqs: [
      { q: "How many pixels is a 4x6 inch photo?", a: "1200×1800 at 300 DPI, which is the resolution most print labs specify. At 200 DPI you could get away with 800×1200, but prints look noticeably softer." },
      { q: "Why does the lab crop my phone photo?", a: "Phone photos are typically 4:3 while a 4×6 print is 2:3. Something must be trimmed to fit, so it is better to choose the crop yourself here than let the lab guess." },
      { q: "Is 300 DPI necessary?", a: "It is the standard for prints viewed at arm's length. Lower resolutions can look acceptable on larger prints seen from further away, but 300 DPI is the safe target." },
      { q: "Will resizing up to 1200x1800 improve a low-resolution photo?", a: "No. It produces a correctly sized file but cannot add detail — a small original will still print soft. Start from the largest version you have." },
      privacyFaq,
    ],
  },
  {
    slug: "1500x2100", w: 1500, h: 2100, group: "Print", label: "5×7 inch print", emoji: "🏞️",
    title: "Resize Photo to 1500x2100 — 5x7 Inch Print Size",
    h1: "Resize a photo to 1500×2100",
    desc: "Resize a photo to exactly 1500x2100 pixels online free — the 5x7 inch print size at 300 DPI, ready for a photo lab or home printer.",
    intro: "Hit exactly 1500×2100 — a 5×7 inch print at the full 300 DPI photo labs expect.",
    about: "5×7 inches is the size people reach for when a 4×6 feels too small: framed portraits, greetings cards, and prints meant to sit on a desk rather than in an album. At 300 DPI it comes to 1500×2100 pixels. The frame is 5:7, slightly squarer than a 4×6, which means a photo cropped perfectly for one will not fit the other — worth knowing if you are ordering both from the same shot. Because the print is larger, softness from a low-resolution original is more obvious here than at 4×6, so start from the biggest file you have. Fill crops to the exact ratio; fit keeps the full composition and adds a coloured border, which can look intentional in a frame.",
    keywords: ["1500x2100 photo size", "5x7 print size pixels", "resize photo for 5x7 print", "5x7 photo dimensions", "print photo resizer"],
    steps: steps("Fill crops to the 5:7 print ratio; fit keeps the whole photo inside a coloured border.", "Save your print-ready 1500×2100 photo."),
    faqs: [
      { q: "How many pixels is a 5x7 inch print?", a: "1500×2100 at 300 DPI. That is the resolution photo labs generally ask for and what keeps fine detail crisp at this size." },
      { q: "Can I use the same crop for 4x6 and 5x7?", a: "Not exactly — 4×6 is 2:3 and 5×7 is 5:7, so each needs its own crop. Resize the original separately for each print size." },
      { q: "My photo looks soft at this size — why?", a: "The print is larger, so any shortfall in the original resolution becomes more visible. Upscaling to 1500×2100 sets the dimensions but cannot restore missing detail." },
      { q: "Should I add a border deliberately?", a: "Fit mode does exactly that, and a white or black border often looks deliberate in a frame while guaranteeing nothing in the shot is cropped away." },
      privacyFaq,
    ],
  },
  {
    slug: "2480x3508", w: 2480, h: 3508, group: "Print", label: "A4 at 300 DPI", emoji: "📄",
    title: "Resize Image to 2480x3508 — A4 Size at 300 DPI",
    h1: "Resize an image to 2480×3508",
    desc: "Resize an image to exactly 2480x3508 pixels online free — full-page A4 at 300 DPI for posters, flyers and print-ready documents.",
    intro: "Hit exactly 2480×3508 — a full A4 page at the 300 DPI printers ask for.",
    about: "A4 is 210×297 millimetres, and at 300 DPI that is 2480×3508 pixels — the size to use for a full-bleed poster, a flyer, a certificate or any image that will fill a printed page. The ratio is roughly 1:1.414, the same proportion shared by every A-series paper size, which is why an A4 design scales cleanly to A3 or A5. Two practical notes: printers cannot usually print to the very edge, so keep essential content away from the outer few millimetres unless your print shop handles bleed; and a photo from a phone is nowhere near 3508 pixels tall, so enlarging one to fill A4 will look soft. Fit mode with a white background is the reliable choice when the whole image must appear intact.",
    keywords: ["a4 size in pixels", "2480x3508 image", "resize image to a4", "a4 300 dpi pixels", "print ready a4 resizer"],
    steps: steps("Fill crops to the A4 page ratio; fit places the whole image on a coloured page.", "Save your print-ready 2480×3508 image."),
    faqs: [
      { q: "What is A4 in pixels?", a: "2480×3508 at 300 DPI. At 150 DPI it is 1240×1754, which is fine for a draft but visibly softer in a final print." },
      { q: "Does A4 have the same ratio as other paper sizes?", a: "Yes. All A-series sizes share the 1:√2 proportion, so an A4 layout scales to A3 or A5 without any cropping." },
      { q: "Why should I keep content away from the edges?", a: "Most printers leave an unprintable margin. Unless your print shop supports full bleed, anything within a few millimetres of the edge risks being cut off." },
      { q: "Can I turn a phone photo into a sharp A4 poster?", a: "Only if the original is large. Phone photos are often around 3000–4000 pixels wide, which can work in landscape, but heavy upscaling will look soft on a full page." },
      privacyFaq,
    ],
  },
  {
    slug: "500x500", w: 500, h: 500, group: "Web", label: "Small square", emoji: "🔲",
    title: "Resize Image to 500x500 — Free Square Resizer",
    h1: "Resize an image to 500×500",
    desc: "Resize an image to exactly 500x500 pixels online and free. A light square for thumbnails, listings and forum uploads, made in your browser.",
    intro: "Hit exactly 500×500 — a light square for thumbnails, listings and upload limits.",
    about: "500×500 is the square you use when the file has to be small: forum avatars with strict size caps, product thumbnails in a grid, catalogue tiles, and any form that rejects anything larger. It is a quarter of the pixel count of a 1080px square, so the exported file is dramatically lighter while still looking sharp at the modest sizes it is displayed. As with any square, the crop is the real decision — fill trims the long edge of a rectangular photo to make it 1:1, while fit shrinks the whole thing onto a background colour so nothing is lost. If a system rejects your upload even at 500×500, the problem is file size rather than dimensions, and the quality slider is what fixes that.",
    keywords: ["resize image to 500x500", "500x500 image resizer", "small square image", "thumbnail size resizer", "make image 500x500"],
    steps: steps("Fill crops a centred square; fit keeps the whole image on a background colour.", "Save your 500×500 image."),
    faqs: [
      { q: "Is 500x500 too small for a product photo?", a: "For a grid thumbnail it is fine. For a listing where buyers zoom in, use a larger square such as 1080×1080 so detail survives the zoom." },
      { q: "How do I get the file under a strict upload limit?", a: "Lower the quality slider. Dimensions stay at 500×500 while the file gets substantially lighter." },
      { q: "Will a rectangular photo be squashed into the square?", a: "No — the aspect ratio is preserved. Fill crops the overflow and fit pads the gap, so the subject never looks stretched." },
      { q: "What format is the download?", a: "A JPG with adjustable quality, which is the most widely accepted format for thumbnails and avatars." },
      privacyFaq,
    ],
  },
  {
    slug: "200x200", w: 200, h: 200, group: "Web", label: "Thumbnail", emoji: "▫️",
    title: "Resize Image to 200x200 — Free Thumbnail Resizer",
    h1: "Resize an image to 200×200",
    desc: "Resize an image to exactly 200x200 pixels online and free — a compact square thumbnail or icon, generated entirely in your browser.",
    intro: "Hit exactly 200×200 — a compact square for thumbnails, icons and tight upload limits.",
    about: "200×200 is small enough that detail becomes the constraint rather than file size. It is the size used for list thumbnails, small avatars, table row icons and legacy systems with fixed image slots. At these dimensions fine detail simply cannot survive: a wide landscape shrunk to 200 pixels turns into an unreadable smudge, so crop tight on the subject with fill rather than trying to keep the whole scene. Logos and icons fare much better than photographs here, because they are designed to read at small sizes. If your source is a detailed photograph and the result looks muddy, the fix is a tighter crop, not a different tool. Exported files at this size are typically only a few kilobytes.",
    keywords: ["resize image to 200x200", "200x200 image resizer", "small thumbnail size", "make image 200x200", "tiny square image"],
    steps: steps("Fill crops tight on the subject; fit keeps the whole image on a background colour.", "Save your 200×200 thumbnail."),
    faqs: [
      { q: "Why does my photo look blurry at 200x200?", a: "There simply are not enough pixels to hold fine detail. Crop tightly on the main subject before resizing so what remains is large enough to read." },
      { q: "Is 200x200 suitable for a logo?", a: "Yes — logos are designed to stay legible when small, which is why they hold up far better than photographs at this size." },
      { q: "How small will the file be?", a: "Usually just a few kilobytes, which is why this size is popular for lists and tables where many images load at once." },
      { q: "Can I make an icon file from this?", a: "For a true .ico file use the ICO converter, which writes a proper icon container. This tool exports a JPG at 200×200." },
      privacyFaq,
    ],
  },
];

export const getPreset = (slug: string) => RESIZE_PRESETS.find((p) => p.slug === slug);

/** Same group first, then anything else — keeps internal links topically tight. */
export function relatedPresets(p: ResizePreset, n = 7): ResizePreset[] {
  const others = RESIZE_PRESETS.filter((o) => o.slug !== p.slug);
  return [...others.filter((o) => o.group === p.group), ...others.filter((o) => o.group !== p.group)].slice(0, n);
}
