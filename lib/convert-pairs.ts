/* Programmatic converter-pair pages: /convert/<from>-to-<to>.
   Each entry drives one SSG page rendering the SAME working
   components/image/ImageConvertClient with a fixed target format, plus copy
   written for that specific pair (never templated — thin pages don't rank).
   `engine` is the ImageConvertClient key: "convert:<MIME registry key>". */

export type ConvertPair = {
  slug: string;                 // route segment, e.g. "png-to-jpg"
  from: string; to: string;     // display labels, e.g. "PNG" / "JPG"
  engine: string;               // ImageConvertClient engine key
  emoji: string;
  title: string; h1: string; desc: string;
  intro: string;                // one line under the h1
  about: string;                // unique body copy (~120+ words)
  keywords: string[];
  steps: [string, string][];
  faqs: { q: string; a: string }[];
};

/** Target-format accent, so pairs converting to the same format look related. */
const GRAD: Record<string, string> = {
  JPG: "linear-gradient(135deg,#f59e0b,#fbbf24)",
  PNG: "linear-gradient(135deg,#2563eb,#60a5fa)",
  WebP: "linear-gradient(135deg,#7c3aed,#a78bfa)",
  AVIF: "linear-gradient(135deg,#059669,#34d399)",
  BMP: "linear-gradient(135deg,#475569,#94a3b8)",
  ICO: "linear-gradient(135deg,#dc2626,#f87171)",
};
export const pairGrad = (p: ConvertPair) => GRAD[p.to] || GRAD.PNG;

export const CONVERT_PAIRS: ConvertPair[] = [
  {
    slug: "png-to-jpg", from: "PNG", to: "JPG", engine: "convert:jpeg", emoji: "🖼️",
    title: "PNG to JPG Converter — Free, Online, No Upload",
    h1: "Convert PNG to JPG",
    desc: "Convert PNG images to JPG online for free. Shrink screenshots and exports by up to 90% with an adjustable quality slider — right in your browser.",
    intro: "Turn a heavy PNG into a compact JPG you can email, upload or attach anywhere — with a quality slider so you decide the size/detail trade-off.",
    about: "PNG stores every pixel losslessly, which is why a full-page screenshot can easily run 4–8 MB. JPG throws away detail the eye barely registers and routinely lands the same image under 400 KB, which is why mail servers, job portals and older upload forms still prefer it. The catch is transparency: JPG has no alpha channel, so any transparent area has to become a solid colour. This converter flattens transparency onto white before encoding, so you never get the black boxes that cheap converters produce. Keep quality at 90 for photographs and screenshots you want to look untouched, drop to 70–80 when file size matters more than pixel-level fidelity, and preview the result before you download it.",
    keywords: ["png to jpg", "convert png to jpg", "png to jpeg converter", "change png to jpg", "png to jpg online free"],
    steps: [
      ["Add your PNG", "Drop the file in or click to browse — it never leaves your device."],
      ["Set the quality", "Slide toward 100 for maximum detail or down for a smaller file."],
      ["Download the JPG", "Hit Convert and save the finished JPG."],
    ],
    faqs: [
      { q: "Will converting PNG to JPG reduce the quality?", a: "JPG is a lossy format, so some detail is discarded. At quality 90 the difference is invisible in normal viewing; below about 70 you may notice softening around sharp text and edges." },
      { q: "What happens to transparent areas?", a: "JPG cannot store transparency, so transparent pixels are filled with white before encoding. If you need to keep transparency, convert to WebP or stay with PNG." },
      { q: "How much smaller will the JPG be?", a: "Typically 60–90% smaller for screenshots and photographs. Flat graphics with few colours sometimes compress better as PNG, so compare both if size is critical." },
      { q: "Are my images uploaded to a server?", a: "No. The conversion runs entirely in your browser using the Canvas API — the file is never transmitted anywhere." },
      { q: "Is there a file size or count limit?", a: "There's no imposed limit. Very large images are bounded only by your device's available memory." },
    ],
  },
  {
    slug: "jpg-to-png", from: "JPG", to: "PNG", engine: "convert:png", emoji: "🔒",
    title: "JPG to PNG Converter — Free Lossless Online Tool",
    h1: "Convert JPG to PNG",
    desc: "Convert JPG to PNG online free. Move photos into a lossless container so repeated edits and saves never add more compression artifacts.",
    intro: "Move a JPG into PNG's lossless container so every future edit and re-save keeps the exact pixels you have now.",
    about: "Every time a JPG is opened, edited and saved again it is re-compressed, and the artifacts compound — edges get mushy, flat skies pick up blocky patches. Converting to PNG stops that cycle: PNG is lossless, so the file you save today is pixel-identical to the file you open next year, no matter how many times it passes through an editor. This is the right move before retouching, before layering a JPG into a design, and whenever a tool or platform specifically demands PNG. Be aware the file will get larger — often three to five times — because PNG is not discarding anything. It also cannot recover detail the original JPG already destroyed; it simply prevents further loss from this point forward.",
    keywords: ["jpg to png", "convert jpg to png", "jpeg to png converter", "change jpg to png", "jpg to png online free"],
    steps: [
      ["Add your JPG", "Drop in any JPG or JPEG file."],
      ["Convert losslessly", "PNG needs no quality setting — nothing is discarded."],
      ["Download the PNG", "Save your lossless copy."],
    ],
    faqs: [
      { q: "Does converting JPG to PNG improve image quality?", a: "No. Detail already lost to JPG compression cannot be restored. PNG prevents any further loss from future edits and saves, which is the real benefit." },
      { q: "Why is my PNG bigger than the JPG?", a: "PNG is lossless, so it stores full pixel data rather than approximating it. A three-to-five-fold size increase is normal for photographs." },
      { q: "Will the PNG have a transparent background?", a: "No. A JPG has no transparency to carry over, so the background stays exactly as it appears. Use the background remover if you need genuine transparency." },
      { q: "Is any quality lost during this conversion?", a: "None. PNG encoding is mathematically lossless, so the output matches the decoded JPG exactly." },
    ],
  },
  {
    slug: "png-to-webp", from: "PNG", to: "WebP", engine: "convert:webp", emoji: "⚡",
    title: "PNG to WebP Converter — Free, Keeps Transparency",
    h1: "Convert PNG to WebP",
    desc: "Convert PNG to WebP online free. Cut image weight by 25–80% while keeping full transparency — ideal for faster websites and better Core Web Vitals.",
    intro: "Get PNG-quality graphics at a fraction of the weight — WebP keeps the alpha channel, so logos and UI assets stay transparent.",
    about: "WebP is the practical default for images on the modern web: it supports the same alpha transparency as PNG but compresses far harder, and every current browser has supported it since 2020. For screenshots, logos, icons and illustrations the savings are often dramatic — 25% on already-tight graphics, 60–80% on detailed screenshots. Because image weight dominates Largest Contentful Paint on most pages, swapping PNG assets for WebP is one of the cheapest Core Web Vitals wins available. Use the quality slider to tune it: 90 and above is visually lossless for interface graphics, while 75–85 works well for photographic content where a little softening goes unnoticed. Keep the original PNG if you also need to serve very old clients.",
    keywords: ["png to webp", "convert png to webp", "png to webp converter", "webp converter online", "png to webp free"],
    steps: [
      ["Add your PNG", "Transparency is detected and preserved automatically."],
      ["Choose a quality level", "90+ stays visually lossless; lower trades detail for size."],
      ["Download the WebP", "Save the file and ship it to your site."],
    ],
    faqs: [
      { q: "Does WebP keep PNG transparency?", a: "Yes. WebP supports a full alpha channel, so transparent backgrounds survive the conversion intact." },
      { q: "Do all browsers support WebP?", a: "Yes — Chrome, Edge, Firefox, Safari and all current mobile browsers support WebP. Only long-abandoned versions such as Internet Explorer do not." },
      { q: "How much smaller is WebP than PNG?", a: "Usually 25–80% smaller depending on content. Detailed screenshots see the biggest gains; tiny flat-colour icons see the least." },
      { q: "Is WebP better than PNG for websites?", a: "For nearly all web use, yes — same visual result, far fewer bytes. Keep PNG when a tool in your pipeline cannot read WebP." },
      { q: "Does the conversion happen on your servers?", a: "No, it runs locally in your browser. Nothing is uploaded." },
    ],
  },
  {
    slug: "webp-to-png", from: "WebP", to: "PNG", engine: "convert:png", emoji: "🧩",
    title: "WebP to PNG Converter — Free Online, Keeps Transparency",
    h1: "Convert WebP to PNG",
    desc: "Convert WebP images to PNG online free. Open web-downloaded WebP files in Photoshop, Office and any app that refuses the format — transparency preserved.",
    intro: "Turn a WebP you saved from the web into a universally-accepted PNG that every editor, document and operating system will open.",
    about: "Saving an image from a modern website increasingly hands you a .webp file, and that is exactly where the friction starts — older Photoshop versions, many Office workflows, plenty of print software and no small number of upload forms simply refuse it. Converting to PNG solves that in one step, and because both formats are lossless with full alpha support, nothing is degraded and transparency carries straight across. Expect the PNG to be noticeably larger; that is the price of a format everything understands. This is the right conversion when a file has to travel into someone else's toolchain. If it is staying on the web, keep the WebP — it is smaller and just as capable.",
    keywords: ["webp to png", "convert webp to png", "webp to png converter", "open webp file", "webp to png online free"],
    steps: [
      ["Add your WebP", "Your browser decodes WebP natively — no plugin needed."],
      ["Convert to PNG", "Lossless, with any transparency carried over."],
      ["Download the PNG", "Save a file every application can open."],
    ],
    faqs: [
      { q: "Why won't my software open WebP files?", a: "WebP is newer than many desktop applications. Older Photoshop builds, some Office versions and various print tools were written before it existed and never added support." },
      { q: "Is transparency preserved from WebP to PNG?", a: "Yes. Both formats carry a full alpha channel, so transparent regions come through unchanged." },
      { q: "Will image quality drop?", a: "No. PNG is lossless, so the output is a pixel-exact copy of the decoded WebP. Detail the original WebP already discarded cannot be recovered, however." },
      { q: "Why is the PNG so much larger?", a: "WebP compresses aggressively; PNG does not. A three-to-six-fold size increase is normal and expected." },
    ],
  },
  {
    slug: "jpg-to-webp", from: "JPG", to: "WebP", engine: "convert:webp", emoji: "🚀",
    title: "JPG to WebP Converter — Free Online Image Optimizer",
    h1: "Convert JPG to WebP",
    desc: "Convert JPG to WebP online free. Cut photo file size roughly 30% at matching quality for faster page loads and better Core Web Vitals.",
    intro: "Serve the same photograph at around a third less weight — the simplest speed win available for an image-heavy page.",
    about: "WebP's lossy mode was designed as a direct replacement for JPG and generally reaches the same perceived quality using about 25–35% fewer bytes. On a page carrying twenty product photographs that is a meaningful cut to Largest Contentful Paint, and LCP is the Core Web Vital most sites fail. The conversion is straightforward because neither format stores transparency, so there is nothing to flatten or lose. One caution worth knowing: you are re-encoding already-lossy data, so push the quality slider higher than you would when encoding from an original — 85–90 keeps the result clean, while dropping to 60 stacks new artifacts on top of the JPG's existing ones. Convert from the highest-quality source you have whenever possible.",
    keywords: ["jpg to webp", "convert jpg to webp", "jpeg to webp converter", "jpg to webp online", "optimize jpg for web"],
    steps: [
      ["Add your JPG", "Any JPG or JPEG photo works."],
      ["Pick a quality level", "85–90 is the sweet spot when re-encoding a JPG."],
      ["Download the WebP", "Save the lighter file for your site."],
    ],
    faqs: [
      { q: "How much smaller is WebP than JPG?", a: "Around 25–35% at equivalent visual quality for typical photographs. Highly detailed images sometimes gain more." },
      { q: "Does converting JPG to WebP lose quality?", a: "It is a lossy re-encode, so a little detail goes. At quality 85–90 the loss is not visible in normal viewing. Always start from the best-quality original you have." },
      { q: "Is WebP good for SEO?", a: "Indirectly, yes. Smaller images improve Largest Contentful Paint, and Core Web Vitals are a Google ranking signal." },
      { q: "Can I convert several JPGs at once?", a: "This page handles one file at a time so you can check each result. Run it repeatedly for a batch — no limits apply." },
    ],
  },
  {
    slug: "webp-to-jpg", from: "WebP", to: "JPG", engine: "convert:jpeg", emoji: "📸",
    title: "WebP to JPG Converter — Free Online, No Signup",
    h1: "Convert WebP to JPG",
    desc: "Convert WebP to JPG online free. Make web-saved images work in email, print shops, older software and any form that rejects WebP uploads.",
    intro: "Convert a WebP into the one image format that every device, printer and upload form on earth accepts.",
    about: "JPG's advantage is not quality or size — it is that nothing anywhere refuses it. Photo printing services, older email clients, government and university upload forms, legacy point-of-sale systems and countless mobile apps still expect a JPG and will reject a WebP outright. Converting takes one click and produces a file you can hand to anyone without a second thought. Two things to keep in mind: this is a lossy-to-lossy re-encode, so keep quality at 90 or above to avoid stacking artifacts; and JPG has no alpha channel, so any transparency in the WebP is flattened onto white rather than turning black. For anything that stays on the web, the original WebP remains the better file.",
    keywords: ["webp to jpg", "convert webp to jpg", "webp to jpeg converter", "webp to jpg online free", "change webp to jpg"],
    steps: [
      ["Add your WebP", "Decoded natively by your browser."],
      ["Set the quality", "Stay at 90+ to avoid compounding compression."],
      ["Download the JPG", "Save a universally accepted file."],
    ],
    faqs: [
      { q: "Why convert WebP to JPG at all?", a: "Compatibility. Print services, older software, email clients and many upload forms accept JPG and refuse WebP." },
      { q: "What happens to a transparent WebP?", a: "JPG has no transparency, so transparent areas are filled with white before encoding — never black." },
      { q: "Does the image get worse?", a: "Slightly, since both formats are lossy. Converting at quality 90 or above keeps the difference imperceptible." },
      { q: "Do I need to install anything?", a: "No. It runs in your browser with no signup, no software and no upload." },
    ],
  },
  {
    slug: "png-to-avif", from: "PNG", to: "AVIF", engine: "convert:avif", emoji: "🪶",
    title: "PNG to AVIF Converter — Free Next-Gen Image Compression",
    h1: "Convert PNG to AVIF",
    desc: "Convert PNG to AVIF online free. AVIF delivers the smallest files on the web today while keeping full transparency — often half the size of WebP.",
    intro: "The most aggressive compression currently available on the web, with transparency intact — typically half the size of an equivalent WebP.",
    about: "AVIF is built on the AV1 video codec and consistently produces the smallest files of any widely-supported web image format — commonly 50% below JPG and meaningfully below WebP at matched quality, with full alpha transparency retained. For a graphics-heavy landing page the bandwidth difference is substantial. The trade-offs are real though: encoding is computationally heavy, so expect the conversion to take a few seconds on large images, and browser support, while good in Chrome, Edge and Firefox, is more recent than WebP's. The usual production pattern is a `<picture>` element offering AVIF first with a WebP or PNG fallback beneath it. Convert from your original PNG rather than from an already-compressed intermediate to get the cleanest result.",
    keywords: ["png to avif", "convert png to avif", "avif converter", "png to avif online", "avif image compression"],
    steps: [
      ["Add your PNG", "Transparency is carried through to AVIF."],
      ["Choose a quality level", "AVIF holds up well even at lower settings."],
      ["Download the AVIF", "Serve it with a fallback for older clients."],
    ],
    faqs: [
      { q: "Is AVIF smaller than WebP?", a: "Usually yes — often around half the size at comparable visual quality, with the largest gains on photographic and richly detailed images." },
      { q: "Does AVIF support transparency?", a: "Yes, AVIF carries a full alpha channel, so PNG transparency converts across cleanly." },
      { q: "Which browsers support AVIF?", a: "Chrome, Edge, Firefox, Opera and Safari all support AVIF in current versions. Serve it inside a <picture> element with a WebP or PNG fallback for maximum reach." },
      { q: "Why did my conversion fail?", a: "Some browsers can display AVIF but not encode it. If you see an encoding notice, use Chrome or Edge, or choose WebP for similar savings." },
      { q: "Why is AVIF slower to convert?", a: "AVIF uses AV1 video compression, which is far more computationally intensive than JPG or PNG encoding. The extra seconds buy substantially smaller files." },
    ],
  },
  {
    slug: "avif-to-png", from: "AVIF", to: "PNG", engine: "convert:png", emoji: "🧩",
    title: "AVIF to PNG Converter — Free Online, Lossless",
    h1: "Convert AVIF to PNG",
    desc: "Convert AVIF to PNG online free. Open next-gen AVIF images in Photoshop, Office and any application that cannot read the format — transparency kept.",
    intro: "Unlock an AVIF file for editors, document tools and operating systems that do not yet recognise the format.",
    about: "AVIF is excellent at being small and poor at being universally readable — it is new enough that most desktop image editors, document applications and file-manager previews still cannot open it. Converting to PNG produces a lossless file with transparency intact that every piece of software on your machine understands. Nothing is degraded in the process, since PNG stores the decoded pixels exactly; what the original AVIF encoder already discarded is gone for good, but nothing further is lost. The resulting file will be considerably larger, often several times over, which is simply the cost of a format with no compression cleverness. Convert when a file needs to enter someone else's toolchain, and keep the AVIF for anything you serve on the web.",
    keywords: ["avif to png", "convert avif to png", "open avif file", "avif to png converter", "avif to png online free"],
    steps: [
      ["Add your AVIF", "Modern browsers decode AVIF without any plugin."],
      ["Convert to PNG", "Lossless, with transparency preserved."],
      ["Download the PNG", "Open it anywhere."],
    ],
    faqs: [
      { q: "Why can't my computer open AVIF files?", a: "AVIF is recent, so many editors, viewers and document tools predate it. Windows needs an optional extension; older macOS versions and most legacy software cannot read it at all." },
      { q: "Is transparency kept?", a: "Yes. Both AVIF and PNG support a full alpha channel, so transparent areas carry over exactly." },
      { q: "Does converting lose quality?", a: "No further quality is lost — PNG is lossless. Detail the AVIF encoder already discarded cannot be recovered." },
      { q: "Why is the PNG file so much larger?", a: "AVIF is one of the most efficient formats available and PNG is one of the least. A five-to-ten-fold increase is common." },
    ],
  },
  {
    slug: "jpg-to-avif", from: "JPG", to: "AVIF", engine: "convert:avif", emoji: "🪶",
    title: "JPG to AVIF Converter — Free, ~50% Smaller Photos",
    h1: "Convert JPG to AVIF",
    desc: "Convert JPG to AVIF online free. Cut photo weight roughly in half versus JPG at matching quality — the strongest compression on the web today.",
    intro: "Halve the weight of your photographs without a visible quality drop — AVIF's strongest use case.",
    about: "Photographs are where AVIF pulls furthest ahead. Against a JPG at equivalent perceived quality, AVIF routinely lands about 50% smaller, and it degrades far more gracefully at aggressive settings — where JPG breaks into blocky 8×8 squares, AVIF softens gently. For a gallery, portfolio or product catalogue that halves your image bandwidth outright. Encoding takes longer because AVIF leans on AV1 video compression, so allow a few seconds per image. Since a JPG is already lossy, keep the quality slider at 80 or above so you are not compounding two rounds of loss, and convert from the largest original you have. In production, serve AVIF inside a `<picture>` element with a JPG fallback for the last stragglers.",
    keywords: ["jpg to avif", "convert jpg to avif", "jpeg to avif", "avif converter online", "jpg to avif free"],
    steps: [
      ["Add your JPG", "Use the highest-quality original available."],
      ["Choose a quality level", "80+ avoids stacking two rounds of lossy compression."],
      ["Download the AVIF", "Serve it with a JPG fallback."],
    ],
    faqs: [
      { q: "How much smaller is AVIF than JPG?", a: "Roughly 50% at equivalent visual quality for typical photographs, sometimes more on high-detail images." },
      { q: "Is AVIF quality better than JPG?", a: "At the same file size, clearly yes. AVIF avoids the blocky artifacts JPG produces under pressure and handles gradients and smooth skies far better." },
      { q: "Should I keep the original JPG?", a: "Yes — as a fallback for older clients and as your master copy. Never discard the highest-quality original you hold." },
      { q: "Why does conversion take a few seconds?", a: "AVIF encoding runs the AV1 codec, which is much heavier than JPG encoding. The wait buys roughly half the file size." },
    ],
  },
  {
    slug: "avif-to-jpg", from: "AVIF", to: "JPG", engine: "convert:jpeg", emoji: "📸",
    title: "AVIF to JPG Converter — Free Online, No Signup",
    h1: "Convert AVIF to JPG",
    desc: "Convert AVIF to JPG online free. Turn next-gen AVIF images into the universally accepted format for email, printing and older software.",
    intro: "Convert a modern AVIF into a JPG that every printer, email client and upload form will accept without complaint.",
    about: "AVIF files are wonderful right up to the moment you need to send one to someone. Photo labs reject them, older email clients show a broken placeholder, plenty of upload forms filter by extension, and most desktop software cannot open one at all. JPG has none of those problems — it is the lowest common denominator of digital imaging, and that is exactly why it remains useful. Converting is a lossy-to-lossy step, so keep quality at 90 or above to avoid layering fresh artifacts on top of the AVIF's existing ones. If the AVIF carries transparency, it is flattened onto white, since JPG has no alpha channel. Keep the AVIF as your web-serving copy and treat the JPG as the shareable one.",
    keywords: ["avif to jpg", "convert avif to jpg", "avif to jpeg converter", "open avif as jpg", "avif to jpg online free"],
    steps: [
      ["Add your AVIF", "Decoded natively by modern browsers."],
      ["Set the quality", "90+ keeps the re-encode clean."],
      ["Download the JPG", "Share, print or upload it anywhere."],
    ],
    faqs: [
      { q: "Why convert AVIF to JPG?", a: "Compatibility. Photo printing, email clients, upload forms and most desktop software accept JPG and reject AVIF." },
      { q: "Will I lose quality?", a: "A little — both formats are lossy. Converting at quality 90 or above keeps the difference invisible in normal viewing." },
      { q: "What happens to transparency?", a: "JPG cannot store an alpha channel, so transparent regions are flattened onto white." },
      { q: "Is this free and private?", a: "Yes. It is free with no signup, and the conversion runs in your browser so no file is uploaded." },
    ],
  },
  {
    slug: "webp-to-avif", from: "WebP", to: "AVIF", engine: "convert:avif", emoji: "🪶",
    title: "WebP to AVIF Converter — Free Next-Gen Optimizer",
    h1: "Convert WebP to AVIF",
    desc: "Convert WebP to AVIF online free. Squeeze another 20–50% off already-optimized WebP images while keeping transparency intact.",
    intro: "Already on WebP? AVIF typically takes another 20–50% off the same image, transparency included.",
    about: "This is an optimization step for sites that already did the obvious work. WebP was a large jump from JPG and PNG; AVIF is a smaller but still worthwhile jump beyond WebP, generally landing 20–50% lighter at matched quality with the biggest gains on photographs, gradients and detailed textures. Flat interface graphics and small icons gain the least — sometimes nothing — so measure before converting an entire asset library. Both formats support alpha, so transparency survives untouched. Because you are re-encoding lossy data, keep quality at 80 or above. In production, list AVIF first inside a `<picture>` element with your existing WebP directly beneath it, and the browser picks whichever it can decode.",
    keywords: ["webp to avif", "convert webp to avif", "avif converter", "webp to avif online", "next-gen image format"],
    steps: [
      ["Add your WebP", "Transparency is carried through."],
      ["Choose a quality level", "80+ when re-encoding already-compressed data."],
      ["Download the AVIF", "List it above WebP in a <picture> element."],
    ],
    faqs: [
      { q: "Is it worth converting WebP to AVIF?", a: "For photographs and detailed images, usually yes — 20–50% further savings. For small flat icons the gain is often negligible, so measure first." },
      { q: "Does transparency survive?", a: "Yes. Both formats support a full alpha channel." },
      { q: "Should I replace WebP entirely?", a: "No. Keep WebP as the fallback in a <picture> element; AVIF support is good but slightly narrower." },
      { q: "Does re-encoding hurt quality?", a: "Slightly, since WebP is already lossy. Staying at quality 80 or above keeps it imperceptible." },
    ],
  },
  {
    slug: "avif-to-webp", from: "AVIF", to: "WebP", engine: "convert:webp", emoji: "⚡",
    title: "AVIF to WebP Converter — Free Online Tool",
    h1: "Convert AVIF to WebP",
    desc: "Convert AVIF to WebP online free. Trade a little file size for broader compatibility and much faster encoding — transparency preserved.",
    intro: "Step back from AVIF to WebP for wider tool support and far quicker encoding, while keeping most of the size advantage.",
    about: "WebP occupies a genuinely useful middle ground: still dramatically smaller than JPG and PNG, supported by a longer list of browsers and build tools than AVIF, and fast enough to encode that it fits comfortably into automated pipelines. AVIF's edge in raw compression is real but modest, and it comes with heavier encoding and a shorter compatibility history — which matters if your CDN, CMS or image-processing library predates it. Converting to WebP keeps transparency intact and typically gives up only 20–50% of the size advantage in exchange for far fewer integration headaches. Keep quality at 85 or above, since this is a lossy-to-lossy re-encode, and hold on to the AVIF if you are serving it successfully today.",
    keywords: ["avif to webp", "convert avif to webp", "avif to webp converter", "avif to webp online", "webp converter free"],
    steps: [
      ["Add your AVIF", "Decoded natively in your browser."],
      ["Choose a quality level", "85+ for a clean re-encode."],
      ["Download the WebP", "Drop it into any pipeline that expects WebP."],
    ],
    faqs: [
      { q: "Why convert AVIF to WebP?", a: "Broader tooling support and much faster encoding. Many CDNs, CMS plugins and build pipelines handle WebP but not AVIF." },
      { q: "How much bigger will the WebP be?", a: "Typically 20–50% larger than the AVIF, though still far smaller than an equivalent JPG or PNG." },
      { q: "Is transparency preserved?", a: "Yes, WebP supports a full alpha channel just as AVIF does." },
      { q: "Which format should I serve?", a: "Serve both — AVIF first in a <picture> element with WebP as the fallback. The browser picks the best one it supports." },
    ],
  },
  {
    slug: "bmp-to-png", from: "BMP", to: "PNG", engine: "convert:png", emoji: "🗜️",
    title: "BMP to PNG Converter — Free Online, Lossless",
    h1: "Convert BMP to PNG",
    desc: "Convert BMP to PNG online free. Shrink uncompressed bitmaps by 70–90% with zero quality loss — every pixel preserved exactly.",
    intro: "Bitmaps are enormous because they store every pixel raw. PNG stores the identical pixels and compresses them losslessly.",
    about: "A BMP file applies essentially no compression, so a 1920×1080 bitmap occupies about 6 MB regardless of what it depicts. PNG encodes the exact same pixels with lossless compression and typically lands 70–90% smaller — a genuinely free win, since not a single pixel changes. That makes this the correct conversion for anything you inherited from legacy Windows software, scanning utilities, older scientific instruments or embedded systems that still emit BMP. Screenshots, diagrams and flat-colour graphics compress hardest; photographic bitmaps gain less but still shrink substantially. PNG also travels better: it is supported everywhere on the web, whereas BMP is rarely served online at all. There is no quality setting to weigh up, because there is no quality decision to make.",
    keywords: ["bmp to png", "convert bmp to png", "bmp to png converter", "bitmap to png", "bmp to png online free"],
    steps: [
      ["Add your BMP", "Any Windows bitmap file works."],
      ["Convert losslessly", "Every pixel is preserved exactly."],
      ["Download the PNG", "A much smaller, identical image."],
    ],
    faqs: [
      { q: "Does converting BMP to PNG lose any quality?", a: "None whatsoever. PNG compression is lossless, so the output is pixel-identical to the bitmap." },
      { q: "How much smaller will the PNG be?", a: "Typically 70–90% smaller. Screenshots and flat graphics compress the hardest; photographic content gains somewhat less." },
      { q: "Why does BMP produce such large files?", a: "BMP stores raw pixel data with essentially no compression — roughly three bytes per pixel regardless of image content." },
      { q: "Can I still open the PNG in old software?", a: "PNG has been universally supported since the late 1990s, so anything that opens a BMP will almost certainly open a PNG." },
    ],
  },
  {
    slug: "bmp-to-jpg", from: "BMP", to: "JPG", engine: "convert:jpeg", emoji: "📉",
    title: "BMP to JPG Converter — Free Online, Huge Size Savings",
    h1: "Convert BMP to JPG",
    desc: "Convert BMP to JPG online free. Turn multi-megabyte bitmaps into compact JPGs — often 95% smaller — for email, web and storage.",
    intro: "Turn a multi-megabyte bitmap into a file small enough to email, upload or store in bulk.",
    about: "Bitmaps are the heaviest common image format in existence, and photographic BMPs are where JPG's advantage becomes almost absurd — a 6 MB bitmap routinely converts to a 200–300 KB JPG with no visible difference at normal viewing distance. If you are clearing out a folder of scanned images, digitised archives or output from older imaging equipment, this conversion reclaims serious disk space and finally makes the files sendable. The trade-off is that JPG is lossy, so this is a one-way trip: keep the original bitmaps if they are archival masters. For screenshots, diagrams and line art choose PNG instead, since JPG smears sharp edges and text while PNG keeps them crisp and often compresses flat graphics better anyway.",
    keywords: ["bmp to jpg", "convert bmp to jpg", "bitmap to jpeg", "bmp to jpg converter", "bmp to jpg online free"],
    steps: [
      ["Add your BMP", "Even very large bitmaps are handled locally."],
      ["Set the quality", "90 keeps photographs looking untouched."],
      ["Download the JPG", "A fraction of the original size."],
    ],
    faqs: [
      { q: "How much smaller is a JPG than a BMP?", a: "Often 90–98% smaller. A 6 MB bitmap typically becomes a 200–400 KB JPG at high quality." },
      { q: "Should I use JPG or PNG for my bitmap?", a: "JPG for photographs, where its compression excels. PNG for screenshots, diagrams and text, where it stays lossless and sharp." },
      { q: "Is the conversion reversible?", a: "No. JPG is lossy, so discarded detail cannot be restored. Keep your original BMP if it is an archival master." },
      { q: "Are large bitmaps supported?", a: "Yes. Processing happens in your browser, bounded only by your device's available memory." },
    ],
  },
  {
    slug: "png-to-bmp", from: "PNG", to: "BMP", engine: "convert:bmp", emoji: "🪟",
    title: "PNG to BMP Converter — Free Online Bitmap Tool",
    h1: "Convert PNG to BMP",
    desc: "Convert PNG to BMP online free. Produce a genuine uncompressed 24-bit Windows bitmap for legacy software, embedded displays and imaging pipelines.",
    intro: "Produce a real uncompressed 24-bit Windows bitmap — the format legacy applications and embedded displays still require.",
    about: "BMP remains a requirement in a surprising number of places: older Windows business software, industrial and medical imaging systems, embedded displays, microcontroller graphics libraries and certain scientific instruments all expect an uncompressed bitmap they can read straight into memory without a decoder. This converter writes a genuine 24-bit BMP with a proper BITMAPINFOHEADER and bottom-up padded rows — not a PNG renamed with a .bmp extension, which is what many online converters quietly hand you and which fails the moment real software tries to parse it. Because 24-bit BMP has no alpha channel, any transparency in your PNG is flattened onto white first. Expect the file to grow considerably; that is inherent to storing raw uncompressed pixels.",
    keywords: ["png to bmp", "convert png to bmp", "png to bitmap", "png to bmp converter", "png to bmp online free"],
    steps: [
      ["Add your PNG", "Transparency is flattened onto white for 24-bit BMP."],
      ["Convert to bitmap", "A real uncompressed BMP is written, header and all."],
      ["Download the BMP", "Feed it to any application expecting a bitmap."],
    ],
    faqs: [
      { q: "Is this a real BMP file?", a: "Yes. It writes a genuine 24-bit Windows bitmap with a proper BITMAPINFOHEADER and correctly padded bottom-up rows — not a PNG with a renamed extension." },
      { q: "What happens to PNG transparency?", a: "24-bit BMP has no alpha channel, so transparent pixels are flattened onto a white background before encoding." },
      { q: "Why is the BMP so much larger?", a: "BMP stores raw pixels with no compression — about three bytes per pixel. A 1920×1080 image is roughly 6 MB regardless of content." },
      { q: "Who still needs BMP files?", a: "Legacy Windows software, embedded and industrial displays, microcontroller graphics libraries, some medical and scientific imaging systems, and a few older printing workflows." },
    ],
  },
  {
    slug: "jpg-to-bmp", from: "JPG", to: "BMP", engine: "convert:bmp", emoji: "🪟",
    title: "JPG to BMP Converter — Free Uncompressed Bitmap Output",
    h1: "Convert JPG to BMP",
    desc: "Convert JPG to BMP online free. Decode a JPG into a raw uncompressed 24-bit bitmap for legacy applications and pixel-level processing.",
    intro: "Decode a JPG into raw uncompressed pixels — the form legacy software and image-processing pipelines can read directly.",
    about: "Some workflows want pixels with nothing in the way. Computer-vision experiments, custom image-processing code, embedded display drivers and older Windows applications frequently prefer an uncompressed bitmap they can memory-map without running a decoder first. Converting a JPG to BMP performs exactly that decode once and writes the result as a genuine 24-bit bitmap with a valid header and correctly padded rows. Worth being clear about what this does and does not achieve: it does not restore quality. Compression artifacts baked into the JPG are decoded faithfully into the bitmap along with everything else. What you gain is a raw, decoder-free representation and the guarantee that no further lossy compression will ever be applied to this file. The size increase is substantial and unavoidable.",
    keywords: ["jpg to bmp", "convert jpg to bmp", "jpeg to bitmap", "jpg to bmp converter", "jpg to bmp online free"],
    steps: [
      ["Add your JPG", "The file is decoded once in your browser."],
      ["Convert to bitmap", "Written as a real 24-bit uncompressed BMP."],
      ["Download the BMP", "Ready for legacy software or raw processing."],
    ],
    faqs: [
      { q: "Does converting to BMP improve quality?", a: "No. JPG compression artifacts are decoded into the bitmap as-is. What you gain is that no further lossy compression will be applied." },
      { q: "How large will the BMP be?", a: "About three bytes per pixel — roughly 6 MB for a 1920×1080 image, regardless of the source JPG's size." },
      { q: "Is the output a valid Windows bitmap?", a: "Yes — 24-bit, with a proper BITMAPINFOHEADER and bottom-up 4-byte-aligned rows, exactly as the specification requires." },
      { q: "Why would I need a BMP?", a: "Legacy Windows applications, embedded displays, and image-processing or computer-vision code that reads raw pixels without a decoder." },
    ],
  },
  {
    slug: "gif-to-png", from: "GIF", to: "PNG", engine: "convert:png", emoji: "🎞️",
    title: "GIF to PNG Converter — Free Online, Keeps Transparency",
    h1: "Convert GIF to PNG",
    desc: "Convert GIF to PNG online free. Escape GIF's 256-colour limit and get a sharp, lossless still with transparency preserved.",
    intro: "Break out of GIF's 256-colour ceiling — PNG stores millions of colours losslessly, transparency included.",
    about: "GIF is a format from 1987 and it shows: a hard limit of 256 colours per frame, plus transparency that is binary rather than graduated — a pixel is either fully opaque or fully invisible, which is what produces those jagged halos around GIF logos. PNG lifts both restrictions, storing up to 16 million colours and a smooth 8-bit alpha channel, all losslessly. For any still image this makes PNG strictly better, and it usually compresses smaller too. The one thing PNG does not do is animation, so an animated GIF converts to a single still frame here; for animation, keep the GIF or move to WebP or MP4. For logos, icons, diagrams and screenshots, PNG is the correct destination.",
    keywords: ["gif to png", "convert gif to png", "gif to png converter", "gif to png online free", "gif still image"],
    steps: [
      ["Add your GIF", "Animated GIFs contribute a single still frame."],
      ["Convert losslessly", "Full colour depth, transparency preserved."],
      ["Download the PNG", "A sharper, more capable still image."],
    ],
    faqs: [
      { q: "Will an animated GIF stay animated?", a: "No. PNG does not support animation, so you get a single still frame. Keep the GIF, or use WebP or MP4, if you need the motion." },
      { q: "Is transparency preserved?", a: "Yes, and improved — GIF transparency is all-or-nothing per pixel, while PNG stores a smooth 8-bit alpha channel." },
      { q: "Why is PNG better than GIF for still images?", a: "PNG supports 16 million colours versus GIF's 256, offers graduated transparency, and usually compresses smaller. For stills it is better in every dimension." },
      { q: "Does the conversion lose quality?", a: "No. PNG is lossless, so every pixel of the GIF frame is preserved exactly." },
    ],
  },
  {
    slug: "gif-to-jpg", from: "GIF", to: "JPG", engine: "convert:jpeg", emoji: "🎞️",
    title: "GIF to JPG Converter — Free Online, No Signup",
    h1: "Convert GIF to JPG",
    desc: "Convert GIF to JPG online free. Extract a compact still image from any GIF for email, documents and photo-oriented uploads.",
    intro: "Pull a compact still out of a GIF — ideal when you need a photo-style image for a document or upload form.",
    about: "Converting a GIF to JPG makes sense when the destination expects a photograph: printed documents, photo-oriented upload forms, email attachments and anywhere a small single-frame file is what is actually wanted. JPG's compression is tuned for continuous-tone imagery, so photographic GIFs shrink considerably. Two caveats deserve attention. First, GIF is limited to 256 colours, so the source is already reduced — JPG cannot add colour back, and its smoothing can slightly blur the dithering patterns GIFs use to fake gradients. Second, GIF transparency is flattened onto white, since JPG has no alpha channel. If your GIF is a logo, icon or anything with sharp edges and text, convert to PNG instead — JPG will visibly soften those edges.",
    keywords: ["gif to jpg", "convert gif to jpg", "gif to jpeg converter", "gif to jpg online free", "gif to image"],
    steps: [
      ["Add your GIF", "A single still frame is taken from the file."],
      ["Set the quality", "90 keeps the frame clean and sharp."],
      ["Download the JPG", "Ready for documents, email or uploads."],
    ],
    faqs: [
      { q: "Does the animation carry over?", a: "No. JPG is a single-frame format, so you get one still image." },
      { q: "What happens to transparent areas?", a: "They are flattened onto white, since JPG has no alpha channel." },
      { q: "Should I choose JPG or PNG?", a: "JPG for photographic GIFs where small size matters. PNG for logos, icons, text and anything with sharp edges — JPG will soften those." },
      { q: "Can converting improve the colours?", a: "No. GIF is capped at 256 colours, and that reduction already happened. JPG cannot restore colour information that was never stored." },
    ],
  },
  {
    slug: "png-to-ico", from: "PNG", to: "ICO", engine: "convert:ico", emoji: "⭐",
    title: "PNG to ICO Converter — Free Favicon Generator",
    h1: "Convert PNG to ICO",
    desc: "Convert PNG to ICO online free. Generate a valid 256×256 Windows icon file for favicons and desktop applications — transparency preserved.",
    intro: "Generate a genuine .ico file — the format browsers expect at /favicon.ico and Windows expects for application icons.",
    about: "An ICO file is a container format, not just an image with a different extension, and that distinction matters: it carries an ICONDIR header describing the icons packed inside it. Plenty of online converters simply rename a PNG and hand it back, which is why those files fail when Windows or a strict browser actually tries to parse them. This tool writes a proper ICO structure — a valid header plus a 256×256 PNG payload, the modern approach every current browser and Windows Vista onward understands. Transparency is preserved, so rounded logos sit cleanly on any background. Start from a square PNG for the best result; non-square sources are scaled to fit 256×256. Serve the finished file at your site root as /favicon.ico.",
    keywords: ["png to ico", "convert png to ico", "favicon generator", "png to icon", "ico converter online free"],
    steps: [
      ["Add a square PNG", "512×512 or larger gives the sharpest icon."],
      ["Convert to ICO", "A real 256×256 icon file is written, header included."],
      ["Download the ICO", "Place it at your site root as /favicon.ico."],
    ],
    faqs: [
      { q: "Is this a real ICO file or a renamed PNG?", a: "A real one. It writes a proper ICONDIR header and icon directory entry around a 256×256 PNG payload — the standard modern ICO structure." },
      { q: "What size should my source PNG be?", a: "Square and at least 256×256; 512×512 is ideal. The output is generated at 256×256, which every modern browser and Windows version handles." },
      { q: "Is transparency preserved?", a: "Yes. The PNG payload inside the ICO keeps its full alpha channel, so rounded or irregular logos look correct on any background." },
      { q: "Where do I put the favicon?", a: "At the root of your site as /favicon.ico. Browsers request that path automatically; you can also reference it with a <link rel=\"icon\"> tag." },
      { q: "Will this work on older Windows versions?", a: "PNG-payload ICO files are supported from Windows Vista onward and in all current browsers. Windows XP required BMP-payload icons." },
    ],
  },
  {
    slug: "jpg-to-ico", from: "JPG", to: "ICO", engine: "convert:ico", emoji: "⭐",
    title: "JPG to ICO Converter — Free Online Icon Maker",
    h1: "Convert JPG to ICO",
    desc: "Convert JPG to ICO online free. Turn any photo or logo into a valid 256×256 Windows icon file for favicons and desktop shortcuts.",
    intro: "Turn a photo or flat logo into a valid 256×256 Windows icon file, ready to serve as a favicon.",
    about: "Favicons are viewed at roughly 16–32 pixels in a browser tab, and that constraint should shape what you feed this converter. A photograph reduced to that size becomes an unreadable smudge, so crop tightly to a single bold shape, letter or symbol before converting — the goal is one recognisable mark, not a scene. The tool scales your JPG to 256×256 and wraps it in a genuine ICO container with a proper header, rather than renaming the file and hoping, which is what breaks so many downloaded favicons. Since JPG carries no transparency, the icon will be a solid square; if you want a rounded or cut-out shape, remove the background first and convert from a PNG instead.",
    keywords: ["jpg to ico", "convert jpg to ico", "jpeg to icon", "favicon from jpg", "ico converter free"],
    steps: [
      ["Add a square JPG", "Crop tightly first — favicons display around 16–32 pixels."],
      ["Convert to ICO", "Scaled to 256×256 and wrapped in a valid ICO container."],
      ["Download the ICO", "Serve it at /favicon.ico."],
    ],
    faqs: [
      { q: "Will my photo look good as a favicon?", a: "Only if it is simple. At 16–32 pixels a detailed photo becomes an unreadable smudge — crop to one bold shape, letter or symbol first." },
      { q: "Can the icon have a transparent background?", a: "Not from a JPG, which has no alpha channel. Remove the background and convert from a PNG if you need transparency." },
      { q: "Is the output a valid icon file?", a: "Yes — a proper ICO container with a correct header wrapping a 256×256 PNG payload, not a renamed image." },
      { q: "What size icon does this produce?", a: "256×256, which browsers and Windows scale down as needed for tabs, bookmarks and shortcuts." },
    ],
  },
];

export const getPair = (slug: string) => CONVERT_PAIRS.find((p) => p.slug === slug);

/** Related pairs: prefer ones sharing a format with this pair, then fill up. */
export function relatedPairs(p: ConvertPair, n = 6): ConvertPair[] {
  const shares = (o: ConvertPair) => o.from === p.from || o.to === p.to || o.from === p.to || o.to === p.from;
  const rest = CONVERT_PAIRS.filter((o) => o.slug !== p.slug);
  return [...rest.filter(shares), ...rest.filter((o) => !shares(o))].slice(0, n);
}
