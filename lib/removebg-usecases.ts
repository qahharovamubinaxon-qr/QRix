/* Intent-exact landing pages for background removal.
   ───────────────────────────────────────────────────────────────────────────
   Why this family and not another: /image-tools/remove-bg is 1,215 of the
   site's 1,881 weekly impressions — 65% of everything Google shows us — at
   average position 88.6 and zero clicks. Page nine earns no clicks, and the
   head terms it competes for ("remove background", 58 impressions/week) belong
   to remove.bg, Canva and Adobe, which no site with ~0 referring domains is
   taking. The winnable half of that demand is the exact-intent tail, where the
   query names WHAT is being cut out, and each of those is a different job with
   different pitfalls worth writing about.

   Every page here mounts the same real tool (components/RemoveBgClient, the
   @imgly on-device model), so none of them is a landing page wrapped around
   nothing — the rule that the /convert and /resize families already follow.

   Claims in this file are limited to what the code actually does: the cutout
   runs in the browser, the result downloads as a PNG, and the background can be
   left transparent or replaced with one of ten solid colours. Nothing here
   promises a quality the model cannot deliver, and several entries say plainly
   where it struggles — a page that only makes promises is worth nothing to the
   person reading it and gets bounced. */

export type BgUseCase = {
  slug: string;
  h1: string;
  title: string;
  desc: string;
  emoji: string;
  keywords: string[];
  intro: string;
  about: string;
  steps: [string, string, string];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const BG_USE_CASES: BgUseCase[] = [
  {
    slug: "signature",
    h1: "Remove the background from a signature",
    title: "Remove Background from Signature — Free, Transparent PNG",
    desc: "Turn a photo or scan of your signature into a transparent PNG you can drop onto a contract. Runs in your browser; the image is never uploaded.",
    emoji: "✍️",
    keywords: ["remove background from signature", "transparent signature png", "signature background remover", "scan signature transparent"],
    intro: "Photograph or scan your signature, cut the paper away, and download a transparent PNG that sits cleanly on any document.",
    about:
      "A signature photographed on white paper is not transparent — dropped into a PDF it arrives as a grey or cream rectangle over the text underneath. Removing the background turns the ink into an object with nothing behind it, so it can sit on a contract, a letterhead or an invoice the way a real signature does.\n\nTwo things decide whether the result looks like ink or like a cut-out: light and contrast. Photograph the page in even daylight without a shadow falling across it, and use a pen that is genuinely darker than the paper — a fine grey ballpoint on cream paper gives the model very little to separate. If the edges come out soft, re-take the photo rather than accepting it; there is no repair for detail that was never in the image.\n\nKeep the background transparent for documents. A white background looks identical on a white page and wrong on everything else.",
    steps: [
      "Photograph or scan your signature on plain paper, in even light.",
      "Drop the image in — the paper is separated from the ink in your browser.",
      "Keep the background transparent and download the PNG.",
    ],
    faqs: [
      { q: "Is my signature uploaded anywhere?", a: "No. The model runs in your browser and the image never leaves the device, which matters more here than for most images — a signature is a legal mark." },
      { q: "Why does my signature look faded after cutting?", a: "The model keeps what it is confident is foreground. Pale ink on white paper leaves it little to work with, so a darker pen and even lighting change the result far more than any setting does." },
      { q: "Transparent or white background?", a: "Transparent, for anything that goes on a document. A white background is invisible on white paper and shows as a rectangle on any other colour." },
      { q: "What format do I get?", a: "A PNG. It is the common format that stores transparency — a JPG cannot, which is why signatures exported as JPG always arrive with a white box." },
    ],
    related: ["logo", "transparent-png", "id-photo"],
  },
  {
    slug: "logo",
    h1: "Remove the background from a logo",
    title: "Remove Background from Logo — Free Transparent Logo PNG",
    desc: "Cut the background out of a logo and download a transparent PNG for slides, letterheads and websites. On-device, no upload, no account.",
    emoji: "🏷️",
    keywords: ["remove background from logo", "transparent logo png", "logo background remover", "make logo transparent"],
    intro: "Take a logo that arrived as a JPG on a white square and get back a transparent PNG that sits on any colour.",
    about:
      "Logos are handed around as JPGs far more often than as the vector file somebody once paid for, and a JPG cannot hold transparency. On a white slide nobody notices; on a dark header, a coloured banner or a photograph, the white box around the mark is the first thing anyone sees.\n\nCutting the background out fixes the placement problem, but it cannot recover what compression removed. A logo saved at low quality carries a halo of grey pixels around every edge, and cutting the background away leaves that halo behind on the new colour. If the result looks fringed, the fix is a cleaner source file, not a better cut — ask for the original PNG, SVG or PDF if it exists anywhere.\n\nFor print and for anything that has to scale, a vector file is still the right answer. This gives you a usable raster in the meantime.",
    steps: [
      "Drop in the logo image, JPG or PNG.",
      "The background is separated from the mark, in your browser.",
      "Keep it transparent and download the PNG.",
    ],
    faqs: [
      { q: "Will this give me a vector logo?", a: "No. You get a PNG — a grid of pixels with transparency. A vector file (SVG, AI, EPS) is a different thing that scales without limit, and it cannot be recovered from a JPG by any tool." },
      { q: "Why is there a faint outline around my logo?", a: "JPG compression puts grey pixels around hard edges. Those pixels are part of the image, so cutting the background away leaves them behind. A higher-quality source removes the halo." },
      { q: "Can I put the logo on a coloured background instead?", a: "Yes — pick one of the ten background colours instead of transparent, and the result downloads with that colour behind the mark." },
      { q: "Does it work on a logo photographed off a screen or a sign?", a: "Usually, but a photograph brings its own lighting and perspective. A file always beats a photo of the file." },
    ],
    related: ["signature", "transparent-png", "product-photo"],
  },
  {
    slug: "product-photo",
    h1: "Remove the background from a product photo",
    title: "Product Photo Background Remover — White Background for Listings",
    desc: "Put your product on a clean white background for a marketplace listing, or cut it out as a transparent PNG. Free and on-device.",
    emoji: "📦",
    keywords: ["product photo background remover", "white background product photo", "ecommerce background remover", "amazon white background"],
    intro: "Cut a product out of the room it was photographed in and put it on plain white — the background most marketplaces ask for.",
    about:
      "Marketplace listing rules are usually about the background, not the product: a plain, unbroken background so that every result in a grid looks like part of the same catalogue. A photo taken on a kitchen table fails that even when the product itself is perfectly lit.\n\nCut the background out and choose white, and the listing photo is done. Choose transparent instead when the image is going into a banner or a slide where you want the product to sit on your own colour.\n\nWhat the model handles well is a solid object with a clear outline — a box, a bottle, a shoe, a phone. What it struggles with is anything the eye also struggles with: glass, mesh, wire, chain, and thin transparent packaging. If your product is one of those, check the edges before you upload the result anywhere that matters, and photograph it against a contrasting background in the first place so there is a real edge to find.",
    steps: [
      "Drop in the product photo.",
      "The background is removed in your browser.",
      "Pick white for a listing, or transparent for a banner, and download.",
    ],
    faqs: [
      { q: "Does this meet marketplace listing rules?", a: "It gives you a pure white background, which is the part most rules are about. Every marketplace also has its own rules on framing, borders and how much of the frame the product must fill — check those separately." },
      { q: "Glass and clear packaging come out wrong. Why?", a: "A transparent object has no single edge: the model has to decide whether what is behind the glass is background or product. Shooting against a strongly contrasting background gives it something to work with." },
      { q: "Can I do a whole batch?", a: "This page handles one image at a time. For many files at once, the batch tools in Image Tools process a folder in one pass." },
      { q: "Is the photo uploaded to a server?", a: "No. The model runs in your browser, so unreleased product photos stay on your machine." },
    ],
    related: ["white-background", "transparent-png", "furniture"],
  },
  {
    slug: "profile-picture",
    h1: "Remove the background from a profile picture",
    title: "Profile Picture Background Remover — Clean Headshot Background",
    desc: "Replace a messy background behind your headshot with a clean colour, or cut it out entirely. Runs in your browser, free.",
    emoji: "🙂",
    keywords: ["profile picture background remover", "headshot background", "linkedin photo background", "change photo background"],
    intro: "Swap the room behind your headshot for a clean colour so the photo reads as professional on a profile.",
    about:
      "A profile photo is usually taken wherever the person happened to be, and the background is doing none of the work: a doorway, a parked car, half of somebody else. Replacing it with a plain colour removes the distraction without retaking the photo.\n\nPick a colour that separates you from it. Dark hair against a dark background merges into a silhouette; a light grey or a soft blue keeps the outline readable at the small size a profile picture is actually displayed at.\n\nHair is where this is hardest and it is worth knowing before you judge the result. Loose strands against a busy background are genuinely ambiguous, and the model will make a choice. Photos taken against a plainer wall cut far more cleanly, which is a better fix than any amount of editing afterwards.",
    steps: [
      "Drop in your photo.",
      "The background is separated from you, in your browser.",
      "Choose a background colour, or keep it transparent, and download.",
    ],
    faqs: [
      { q: "Which background colour looks best?", a: "One that contrasts with your hair and clothing. Profile pictures are displayed small, so the outline matters more than the shade." },
      { q: "The edges of my hair look rough.", a: "Fine strands against a detailed background are the hardest case for any cutout, automatic or manual. A photo taken against a plain wall gives a much cleaner edge." },
      { q: "Can I use this for a passport photo?", a: "Not on its own — passport photos have exact size, framing and background rules. The passport photo tool crops to the standard document sizes." },
      { q: "Is the photo uploaded?", a: "No. It is processed in your browser and never sent anywhere." },
    ],
    related: ["hair", "id-photo", "white-background"],
  },
  {
    slug: "transparent-png",
    h1: "Make an image background transparent",
    title: "Make Background Transparent — Free Transparent PNG Maker",
    desc: "Turn any image into a transparent PNG in the browser. No upload, no account, no watermark on the file you download.",
    emoji: "🫥",
    keywords: ["make background transparent", "transparent png maker", "transparent background", "png transparent online"],
    intro: "Remove whatever is behind the subject and download a PNG with real transparency, ready to place on any colour.",
    about:
      "Transparency is a property of the file, not something you can fake by painting the background white. A PNG stores, for every pixel, how opaque it is — which is why a transparent PNG dropped onto a blue slide shows blue behind the subject, while a white JPG shows a white box.\n\nThat is the entire difference, and it explains most of the confusion around this: JPG has no way to record transparency at all, so anything exported as JPG loses it permanently. Export as PNG and it survives.\n\nThe result here downloads as a PNG whether you keep the background transparent or replace it with a colour. If you need the smaller file that JPG gives you, convert afterwards — but only once the image is going somewhere with a fixed background, because the transparency will not survive the trip.",
    steps: [
      "Drop in any image.",
      "The subject is separated from the background in your browser.",
      "Leave the background transparent and download the PNG.",
    ],
    faqs: [
      { q: "Why does my transparent PNG look white when I open it?", a: "Most image viewers paint white behind transparency. Place it on a coloured background — a slide, a page, a chat — and you will see the transparency is really there." },
      { q: "Can a JPG be transparent?", a: "No. The format has no channel for it. Saving a transparent image as JPG replaces the transparency with a solid colour, usually white or black." },
      { q: "Is there a watermark on the download?", a: "No. The file you download is the image, produced by your own browser." },
      { q: "Is there a size limit?", a: "The limit is your device's memory, since the work happens there. Very large photos are slower on a phone than on a laptop." },
    ],
    related: ["white-background", "signature", "logo"],
  },
  {
    slug: "white-background",
    h1: "Put a photo on a white background",
    title: "Change Photo Background to White — Free, In Your Browser",
    desc: "Replace a busy background with plain white for listings, documents and catalogues. Free, on-device, downloads as PNG.",
    emoji: "⬜",
    keywords: ["change background to white", "white background photo", "photo white background online", "replace background white"],
    intro: "Cut the subject out and drop a plain white background behind it — the format listings, catalogues and documents ask for.",
    about:
      "Plain white is what most submission rules mean by \"a plain background\": nothing behind the subject to distract from it and nothing that varies from one photo to the next. It is also the hardest background to fake with lighting alone, because a white wall photographs grey unless it is lit separately from the subject.\n\nCutting the subject out and placing white behind it sidesteps that entirely. The white is exactly #FFFFFF everywhere, which is what an automated checker looks for and what a lighting setup rarely achieves.\n\nOne thing to look at before you submit: the edge. Where the original background was dark, a thin dark line can survive the cut and will be visible against white. Zoom in on the outline; if there is a fringe, a photo taken against a lighter background will cut more cleanly.",
    steps: [
      "Drop in the photo.",
      "The subject is separated from the background in your browser.",
      "Choose the white background and download the PNG.",
    ],
    faqs: [
      { q: "Is the white pure white?", a: "Yes — #FFFFFF across the whole background, which is what automated listing checks look for and what a photographed white wall almost never is." },
      { q: "Why is there a dark line around my subject?", a: "Pixels from the old background that sat on the edge. They were part of the image before the cut and become visible against white. A lighter original background avoids it." },
      { q: "Can I use another colour?", a: "Yes, there are ten background colours, and transparent. White is only the default because so many rules ask for it." },
      { q: "Does the file stay a PNG?", a: "Yes. If you need a JPG for a size limit, convert it afterwards — there is no transparency left to lose once the background is solid." },
    ],
    related: ["product-photo", "id-photo", "transparent-png"],
  },
  {
    slug: "hair",
    h1: "Remove a background around hair",
    title: "Remove Background from Hair — Fine Detail Cutout, Free",
    desc: "Cut a portrait out around loose hair, and know where automatic cutouts struggle. In-browser, no upload.",
    emoji: "💇",
    keywords: ["remove background hair", "hair cutout", "background remover fine detail", "portrait cutout hair"],
    intro: "Cut a portrait out of its background, including the hardest part of any cutout: the loose strands around the edge.",
    about:
      "Hair is the honest test of a background remover. A shoulder has one edge; hair has hundreds, many of them thinner than a pixel and partly transparent, showing the background through them. Every tool that claims a perfect cutout is either showing you an easy photo or quietly cutting the strands off.\n\nThe model here keeps what it is confident about and softens what it is not, which usually reads well at normal viewing size and looks approximate if you zoom to 400%. Whether that matters depends entirely on where the image is going: a profile picture or a slide, almost never; a printed poster at A2, yes.\n\nThe biggest single improvement is not in any tool. A portrait shot against a plain wall that contrasts with the hair gives every cutout something unambiguous to find, and the difference is larger than the difference between tools.",
    steps: [
      "Drop in the portrait.",
      "The subject, including the hair edge, is separated in your browser.",
      "Choose a background colour or keep it transparent, then download.",
    ],
    faqs: [
      { q: "Will every strand of hair survive?", a: "No, and no automatic tool manages that on a busy background. Individual strands thinner than a pixel are genuinely ambiguous; the result is an approximation that reads correctly at normal size." },
      { q: "How do I get a better hair edge?", a: "Photograph against a plain background that contrasts with the hair. That changes the result more than any setting in any tool." },
      { q: "Is a dark or light background better behind the cutout?", a: "Whichever is further from the hair colour. Dark hair on a dark background hides exactly the edge you were trying to keep." },
      { q: "Does the image leave my device?", a: "No. The model runs in the browser." },
    ],
    related: ["profile-picture", "transparent-png", "product-photo"],
  },
  {
    slug: "id-photo",
    h1: "Remove the background from an ID photo",
    title: "ID Photo Background Remover — Plain Background, Free",
    desc: "Put an ID or document photo on a plain background. Note the size and framing rules are separate — this handles the background only.",
    emoji: "🪪",
    keywords: ["id photo background remover", "document photo background", "plain background id photo", "white background id"],
    intro: "Replace whatever is behind the person with a plain colour, the way document photos require.",
    about:
      "Document photos almost always specify a plain, light, uniform background, and a photo taken at home almost never has one. Cutting the background out and replacing it with plain white or light grey satisfies that specific requirement.\n\nIt satisfies only that one. Document photos also fix the print size, the proportion of the frame the head must occupy, the expression, whether glasses or head coverings are allowed, and how recent the photo must be — rules that vary by country and by document, and that a background tool has no view of.\n\nSo use this for the background, then check the size and framing against the authority's own published rules before you submit anything. The passport photo tool crops to the standard document sizes and is the better starting point when the print size matters.",
    steps: [
      "Drop in the photo.",
      "The person is separated from the background in your browser.",
      "Choose white or a light colour and download the PNG.",
    ],
    faqs: [
      { q: "Does this make my photo acceptable for a document?", a: "It handles the background rule only. Size, head proportion, expression and recency are set by the issuing authority and have to be checked against their own published rules." },
      { q: "Which background colour do documents want?", a: "Most ask for plain white or a light neutral, but the exact requirement varies by country and document. Check the rule before choosing." },
      { q: "What about the print size?", a: "Use the passport photo tool, which crops to the standard document sizes rather than only changing the background." },
      { q: "Is the photo uploaded?", a: "No. It is processed in your browser, which matters for a photo attached to an identity document." },
    ],
    related: ["white-background", "profile-picture", "signature"],
  },
  {
    slug: "sticker",
    h1: "Turn a photo into a sticker",
    title: "Make a Sticker from a Photo — Transparent PNG, Free",
    desc: "Cut a subject out of a photo and download it as a transparent PNG for chat stickers. In-browser, no account.",
    emoji: "🌟",
    keywords: ["make sticker from photo", "sticker background remover", "transparent sticker png", "whatsapp sticker maker"],
    intro: "Cut the subject out of a photo and download a transparent PNG — the shape a chat sticker needs.",
    about:
      "A sticker is a transparent PNG with a subject and nothing else. That is the whole format: the messaging app supplies the chat bubble behind it, so anything left of the original background shows up as a rectangle floating in the conversation.\n\nWhat makes a good sticker is a subject that reads at thumbnail size. Stickers are displayed small, so a face, a pet or a single object works, and a wide group shot becomes an unrecognisable smudge. Crop tight before cutting if the subject is small in the frame.\n\nEach messaging app then has its own pack rules — pixel size, file size and how many stickers a pack must contain. This produces the transparent image; the pack is assembled in the app or its sticker maker.",
    steps: [
      "Drop in the photo, cropped to the subject.",
      "The background is removed in your browser.",
      "Keep it transparent and download the PNG.",
    ],
    faqs: [
      { q: "What size should a sticker be?", a: "Each app publishes its own requirement, usually a square a few hundred pixels wide with a file-size cap. Resize the PNG afterwards to match the app you are targeting." },
      { q: "Why does my sticker have a white box behind it?", a: "It was saved as JPG somewhere along the way. JPG cannot store transparency; keep the file as PNG all the way into the sticker app." },
      { q: "Can I make a whole pack here?", a: "This cuts one image at a time. Pack assembly, including the tray icon and the count rules, happens in the messaging app's own sticker maker." },
      { q: "Is the photo uploaded?", a: "No — the cutout runs in your browser." },
    ],
    related: ["transparent-png", "profile-picture", "hair"],
  },
  {
    slug: "furniture",
    h1: "Remove the background from furniture photos",
    title: "Furniture Background Remover — Clean Catalogue Photos, Free",
    desc: "Cut furniture out of the room it was photographed in for listings and catalogues. Free, on-device, PNG output.",
    emoji: "🪑",
    keywords: ["furniture background remover", "remove background furniture photo", "catalogue photo background", "furniture listing photo"],
    intro: "Take a sofa, chair or table out of the room around it and put it on a plain background for a listing or a catalogue.",
    about:
      "Furniture is photographed in place, because that is where it is. For a listing that is a problem: the room is doing the selling, the lighting comes from a window, and each photo in the set has a different background.\n\nCutting the piece out and putting it on white makes a set of photos look like a catalogue rather than a house tour, and it removes everything a buyer might mistake for part of the item.\n\nTwo things to watch on furniture specifically. Legs and thin frames are narrow shapes with background on both sides, and they are where a cutout most often loses a piece — check them before publishing. And a photo taken from floor level against a similarly coloured floor gives the model almost no edge to find; a step back and a contrasting floor make more difference than any retouching afterwards.",
    steps: [
      "Drop in the furniture photo.",
      "The piece is separated from the room in your browser.",
      "Pick white for a listing, or transparent, and download.",
    ],
    faqs: [
      { q: "Chair legs came out broken. Why?", a: "Thin shapes with background on both sides are the hardest thing to keep. A photo with more contrast between the legs and the floor gives a much better result." },
      { q: "Should I use white or transparent?", a: "White for a marketplace listing, transparent if the image is going into a layout with its own background colour." },
      { q: "Does it handle glass tables?", a: "Partly. Glass has no single edge — the model has to guess whether what shows through is background or product — so check the result rather than trusting it." },
      { q: "Are the photos uploaded?", a: "No, the cutout runs on your device." },
    ],
    related: ["product-photo", "white-background", "car"],
  },
  {
    slug: "car",
    h1: "Remove the background from a car photo",
    title: "Car Photo Background Remover — Clean Listing Photos, Free",
    desc: "Cut a car out of the street or car park behind it for a listing. Free, runs in your browser, PNG output.",
    emoji: "🚗",
    keywords: ["car background remover", "remove background car photo", "car listing photo background", "vehicle photo background"],
    intro: "Take a car out of the car park it was photographed in and put it on a plain background for a listing.",
    about:
      "Cars get photographed wherever they are parked, which means listing photos come with other cars, a wall, a bin and half a number plate belonging to somebody else. Cutting the vehicle out removes all of it at once and makes a set of photos consistent.\n\nCars cut relatively well: a large, solid, high-contrast object with a clear outline is close to the easiest case there is. The exceptions are the ones you would expect — windows, where the model has to decide whether what shows through is background or interior, and wheel arches in deep shadow.\n\nOne thing worth doing yourself, whatever the tool: check the number plate. A cutout removes the background, not personal information, and a plate that was readable in the original is still readable afterwards. Blur it before publishing if you do not want it public.",
    steps: [
      "Drop in the car photo.",
      "The vehicle is separated from the background in your browser.",
      "Choose a background colour or transparent, then download.",
    ],
    faqs: [
      { q: "Does this hide the number plate?", a: "No. It removes the background only — anything on the car itself, including a readable plate, survives the cut. Blur it separately if it should not be public." },
      { q: "Windows look odd after the cut.", a: "Glass is ambiguous: what shows through a window may be background or may be the interior. Check the windows before publishing." },
      { q: "White or transparent background?", a: "White reads as a catalogue photo on most listing sites; transparent is for putting the car into your own layout." },
      { q: "Is the photo uploaded?", a: "No. It is processed in your browser." },
    ],
    related: ["product-photo", "furniture", "white-background"],
  },
];

export const getBgUseCase = (slug: string) => BG_USE_CASES.find((u) => u.slug === slug);

export const relatedBgUseCases = (u: BgUseCase) =>
  u.related.map((s) => getBgUseCase(s)).filter((x): x is BgUseCase => !!x);
