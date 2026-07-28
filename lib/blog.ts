// SEO blog content library. Each post is fully typed and rendered statically
// with Article + FAQ + Breadcrumb structured data. Add new posts by appending
// to POSTS — the index, sitemap and [slug] route pick them up automatically.

export type BlogSection = { h: string; p: string[] };
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: "QR Codes" | "PDF" | "Image" | "Video" | "AI" | "Guides";
  date: string;        // ISO
  readMins: number;
  toolHref: string;
  toolLabel: string;
  intro: string;
  sections: BlogSection[];
  faqs: { q: string; a: string }[];
  related: string[];   // other slugs
};

const HAND_POSTS: BlogPost[] = [
  {
    slug: "how-to-create-a-qr-code",
    title: "How to Create a QR Code for Free (2026 Step-by-Step Guide)",
    description:
      "Learn how to create a QR code for free in seconds — for a link, WiFi, vCard, WhatsApp and more. No signup, works on mobile, with logo and colors.",
    keywords: ["how to create a qr code", "free qr code generator", "make a qr code", "qr code maker", "create qr code online"],
    category: "QR Codes",
    date: "2026-06-01",
    readMins: 5,
    toolHref: "/qr-tools/url",
    toolLabel: "Create your QR code",
    intro:
      "QR codes turn a printed sticker, poster or business card into a tap-free bridge to anything online. This guide shows you how to create a QR code for free in under a minute — no account, no watermark, and it works on every phone.",
    sections: [
      { h: "What is a QR code?", p: [
        "A QR (Quick Response) code is a square barcode a phone camera can read instantly. Instead of typing a long address, a person points their camera at the code and is taken straight to your link, WiFi network, contact card or payment page.",
        "Modern phones scan QR codes from the built-in camera app, so there is nothing for your audience to install.",
      ]},
      { h: "How to create a QR code in 4 steps", p: [
        "1. Pick a type — URL, WiFi, vCard, WhatsApp, email, text and 30+ more.",
        "2. Enter your data — for a link, just paste the web address.",
        "3. Customize — add your logo, brand colors, rounded dots and a frame with a call-to-action such as “Scan me”.",
        "4. Download — export a crisp PNG or an infinitely scalable SVG and place it anywhere.",
      ]},
      { h: "Static vs dynamic QR codes", p: [
        "A static QR code stores the data directly and never changes. A dynamic QR code points to a short link you control, so you can edit the destination later and track every scan — perfect for printed materials where you can't reprint the code.",
        "If you plan to measure results or might change the URL, choose a dynamic QR code.",
      ]},
      { h: "Tips for QR codes that always scan", p: [
        "Keep strong contrast between the code and its background.",
        "Don't shrink it below 2×2 cm on print, and leave a quiet white margin around it.",
        "Test the final printed code with two or three different phones before mass printing.",
      ]},
    ],
    faqs: [
      { q: "Is it really free to create a QR code?", a: "Yes. QRix generates unlimited QR codes for free, with no watermark and no signup required." },
      { q: "Do QR codes expire?", a: "Static QR codes never expire. Dynamic QR codes stay active as long as your account link is live." },
      { q: "Can I add a logo to my QR code?", a: "Yes — you can drop your logo in the center and match your brand colors while keeping the code scannable." },
      { q: "What's the best format to download?", a: "Use PNG for quick digital use and SVG for print, since SVG stays sharp at any size." },
    ],
    related: ["wifi-qr-code-guide", "what-is-a-dynamic-qr-code", "qr-code-for-restaurant-menu"],
  },
  {
    slug: "wifi-qr-code-guide",
    title: "WiFi QR Code: Let Guests Connect Without Typing a Password",
    description:
      "Create a free WiFi QR code so guests join your network by scanning — no password typing. Perfect for cafés, hotels, offices and homes.",
    keywords: ["wifi qr code", "qr code for wifi", "wifi password qr code", "share wifi qr", "wifi qr code generator"],
    category: "QR Codes",
    date: "2026-06-03",
    readMins: 4,
    toolHref: "/qr-tools/wifi",
    toolLabel: "Make a WiFi QR code",
    intro:
      "Reading out a long WiFi password to every guest is painful. A WiFi QR code lets anyone join your network instantly by scanning a sticker — ideal for cafés, hotels, Airbnbs, offices and homes.",
    sections: [
      { h: "How a WiFi QR code works", p: [
        "The code stores your network name (SSID), password and security type. When a phone scans it, the operating system offers to connect automatically — no manual typing, no mistakes.",
      ]},
      { h: "Create your WiFi QR code", p: [
        "1. Enter your network name exactly as it appears.",
        "2. Type the password and choose the security type (usually WPA/WPA2).",
        "3. Download the code and print it on a card or sticker for your wall or table.",
      ]},
      { h: "Where to place it", p: [
        "Café and restaurant tables, hotel rooms, reception desks, meeting rooms and rental welcome books are the highest-impact spots.",
        "Add a short line like “Scan to join our WiFi” so guests know what it does.",
      ]},
    ],
    faqs: [
      { q: "Is a WiFi QR code safe?", a: "It only shares what you put in it — your network name and password — exactly like telling a guest the password, but faster." },
      { q: "Does it work on iPhone and Android?", a: "Yes. Both scan WiFi QR codes from the native camera app on current versions." },
      { q: "Can I change the password later?", a: "If you rotate your WiFi password, generate a fresh code and reprint it." },
    ],
    related: ["how-to-create-a-qr-code", "qr-code-for-restaurant-menu"],
  },
  {
    slug: "qr-code-for-restaurant-menu",
    title: "QR Code Menus for Restaurants: A Complete Setup Guide",
    description:
      "Set up a free QR code menu for your restaurant or café. Contactless, always up to date, and easy for guests to scan. Step-by-step guide.",
    keywords: ["qr code menu", "restaurant qr code", "qr code for menu", "contactless menu", "cafe qr code"],
    category: "QR Codes",
    date: "2026-06-05",
    readMins: 5,
    toolHref: "/poster",
    toolLabel: "Make a menu poster",
    intro:
      "QR code menus cut printing costs, stay current, and give guests a clean contactless experience. Here's how to set one up properly so it actually gets scanned.",
    sections: [
      { h: "Why restaurants switch to QR menus", p: [
        "You update prices and dishes instantly without reprinting. Guests get a fast, hygienic experience, and you can even link to ordering or reviews.",
      ]},
      { h: "Setting up your QR menu", p: [
        "1. Host your menu online — a PDF, a webpage or a link-in-bio page all work.",
        "2. Generate a dynamic QR code pointing to it so you can swap the menu later without reprinting.",
        "3. Print it on a table tent or poster with a clear “Scan for menu” prompt.",
      ]},
      { h: "Design tips that boost scans", p: [
        "Use a branded frame and your logo so the code looks trustworthy.",
        "Place one code per table at eye level, and keep the surrounding area uncluttered.",
      ]},
    ],
    faqs: [
      { q: "Do I need to reprint if my menu changes?", a: "No — with a dynamic QR code you edit the destination and the same printed code shows the new menu." },
      { q: "Can guests order from the QR menu?", a: "Yes, if your menu page links to an ordering or payment system." },
      { q: "What should the QR code link to?", a: "A mobile-friendly menu page or PDF. A link-in-bio page also lets you add ordering, reviews and social links." },
    ],
    related: ["how-to-create-a-qr-code", "wifi-qr-code-guide", "what-is-a-dynamic-qr-code"],
  },
  {
    slug: "what-is-a-dynamic-qr-code",
    title: "What Is a Dynamic QR Code? (And When You Need One)",
    description:
      "Dynamic QR codes let you edit the destination and track scans after printing. Learn how they differ from static codes and when to use each.",
    keywords: ["dynamic qr code", "editable qr code", "trackable qr code", "static vs dynamic qr code", "qr code analytics"],
    category: "Guides",
    date: "2026-06-08",
    readMins: 4,
    toolHref: "/qr-tools/url",
    toolLabel: "Create a dynamic QR",
    intro:
      "A dynamic QR code is the difference between a code you can never change and one you fully control. Here's what that means in practice.",
    sections: [
      { h: "Static vs dynamic — the core difference", p: [
        "A static code encodes the destination directly, so it's fixed forever. A dynamic code encodes a short link you own, which redirects to any destination you set — and you can change that destination anytime.",
      ]},
      { h: "Why dynamic codes win for print", p: [
        "Printed a flyer with the wrong link? With a dynamic code you just update the destination — no reprint. You also get scan analytics: how many scans, when, and roughly where.",
      ]},
      { h: "When a static code is fine", p: [
        "For a one-off WiFi sticker or a personal vCard that will never change, a static code is perfectly fine and works offline forever.",
      ]},
    ],
    faqs: [
      { q: "Can I convert a static QR code to dynamic?", a: "Not the printed one — the data is baked in. Generate a new dynamic code and reprint it." },
      { q: "Do dynamic QR codes cost money?", a: "QRix lets you create dynamic links for free; Pro adds unlimited codes and deeper analytics." },
      { q: "What analytics do I get?", a: "Total scans, scans over time, and approximate location and device data." },
    ],
    related: ["how-to-create-a-qr-code", "qr-code-for-restaurant-menu"],
  },
  {
    slug: "how-to-merge-pdf-files",
    title: "How to Merge PDF Files for Free (No Software Install)",
    description:
      "Combine multiple PDFs into one file for free, right in your browser. Reorder pages, keep quality, and keep your files private. Step-by-step.",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "merge pdf free", "how to merge pdf"],
    category: "PDF",
    date: "2026-06-10",
    readMins: 4,
    toolHref: "/pdf-tools/merge",
    toolLabel: "Merge PDFs now",
    intro:
      "Need to combine several PDFs — contracts, scans, invoices — into a single document? You can merge PDF files for free in your browser, with no software to install and no files leaving your device.",
    sections: [
      { h: "Merge PDFs in 3 steps", p: [
        "1. Drag and drop the PDF files you want to combine.",
        "2. Reorder them so the pages flow the way you want.",
        "3. Click merge and download your single combined PDF.",
      ]},
      { h: "Why merge in the browser", p: [
        "Browser-based merging keeps sensitive documents private — nothing is uploaded to a server. It's also faster because there's no upload and download round-trip for large files.",
      ]},
    ],
    faqs: [
      { q: "Is there a file limit?", a: "You can merge multiple PDFs at once; very large files depend on your device memory." },
      { q: "Will merging reduce quality?", a: "No — pages are copied as-is, preserving text and image quality." },
      { q: "Are my files uploaded anywhere?", a: "No. Merging runs locally in your browser, so your documents stay on your device." },
    ],
    related: ["how-to-compress-a-pdf", "convert-pdf-to-word"],
  },
  {
    slug: "how-to-compress-a-pdf",
    title: "How to Compress a PDF Without Losing Quality",
    description:
      "Reduce PDF file size for email and uploads while keeping it readable. Free browser-based PDF compressor — no signup, private and fast.",
    keywords: ["compress pdf", "reduce pdf size", "make pdf smaller", "pdf compressor", "shrink pdf"],
    category: "PDF",
    date: "2026-06-12",
    readMins: 4,
    toolHref: "/pdf-tools/compress",
    toolLabel: "Compress a PDF",
    intro:
      "Big PDFs bounce back from email and stall on upload forms. Compressing a PDF shrinks the file so it sends and uploads easily while staying clear and readable.",
    sections: [
      { h: "What makes a PDF large", p: [
        "High-resolution images are usually the culprit. Compression re-encodes those images at a sensible quality, which dramatically cuts size with little visible difference.",
      ]},
      { h: "How to compress your PDF", p: [
        "1. Upload your PDF.",
        "2. Choose a compression level — light, medium or strong depending on how small you need it.",
        "3. Download the smaller file and check it looks right.",
      ]},
    ],
    faqs: [
      { q: "How much smaller will my PDF get?", a: "It depends on the images inside — image-heavy PDFs often shrink by 50–80%." },
      { q: "Will the text stay sharp?", a: "Yes. Text stays crisp; only images are re-compressed." },
      { q: "Is it safe for confidential PDFs?", a: "Yes — compression happens in your browser, so files aren't uploaded." },
    ],
    related: ["how-to-merge-pdf-files", "convert-pdf-to-word"],
  },
  {
    slug: "convert-pdf-to-word",
    title: "How to Convert a PDF to Word (Editable, Free)",
    description:
      "Turn a PDF into an editable Word document for free. Keeps text, headings and images in place. Runs privately in your browser — no signup.",
    keywords: ["pdf to word", "convert pdf to word", "pdf to docx", "edit pdf in word", "pdf to word free"],
    category: "PDF",
    date: "2026-06-14",
    readMins: 4,
    toolHref: "/pdf-tools/pdf-to-word",
    toolLabel: "Convert PDF to Word",
    intro:
      "When you need to edit a PDF's text, converting it to Word is the fastest route. A good converter keeps the reading order, fonts and images intact so you can just start editing.",
    sections: [
      { h: "How the conversion works", p: [
        "The tool rebuilds each page as editable text — matching headings and sizes — and keeps the original images in place. Scanned pages are embedded as images automatically.",
      ]},
      { h: "Convert in 3 steps", p: [
        "1. Upload your PDF.",
        "2. Let it rebuild the document.",
        "3. Download the .docx and open it in Word, Google Docs or Pages.",
      ]},
    ],
    faqs: [
      { q: "Will the layout be preserved?", a: "Text, headings, sizes and image positions are kept as closely as possible." },
      { q: "Does it work on scanned PDFs?", a: "Scanned pages are embedded as images; for editable text from scans, run OCR first." },
      { q: "Is it free?", a: "Yes, and it runs in your browser so your document stays private." },
    ],
    related: ["how-to-merge-pdf-files", "how-to-compress-a-pdf"],
  },
  {
    slug: "remove-image-background",
    title: "How to Remove an Image Background for Free (AI, In-Browser)",
    description:
      "Remove the background from any photo automatically with AI — get a clean transparent PNG in seconds. Free, private, no signup. Great for products and profiles.",
    keywords: ["remove background", "remove image background", "transparent png", "background remover", "erase background from photo"],
    category: "Image",
    date: "2026-06-16",
    readMins: 4,
    toolHref: "/image-tools/remove-bg",
    toolLabel: "Remove a background",
    intro:
      "A clean transparent background makes product photos, logos and profile pictures look professional. AI background removal does it in seconds — no manual cutting out.",
    sections: [
      { h: "What you get", p: [
        "Upload a photo and the AI separates the subject from the background, returning a transparent PNG you can drop onto any color, banner or marketplace listing.",
      ]},
      { h: "Best uses", p: [
        "Product photos for online stores, clean logos, profile and team headshots, and thumbnails all benefit from a removed background.",
      ]},
    ],
    faqs: [
      { q: "Is the background removal free?", a: "Yes, and it runs privately in your browser so your images aren't uploaded to a server." },
      { q: "What format do I get?", a: "A transparent PNG, ready to place on any background." },
      { q: "Does it work on hair and fine edges?", a: "The AI handles complex edges well; results are best with clear subject-background contrast." },
    ],
    related: ["how-to-create-a-qr-code"],
  },
];

// ── compact per-tool guide specs, expanded into full articles ──────────────
type GuideSpec = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: BlogPost["category"];
  toolHref: string;
  toolLabel: string;
  readMins?: number;
  date?: string;
  intro: string;
  what: string[];      // "What is / what it does"
  steps: string[];     // "How to use"
  benefits: string[];  // "Why / best uses"
  tips?: string[];
  faqs: { q: string; a: string }[];
  related: string[];
};

function buildPost(g: GuideSpec): BlogPost {
  const sections: BlogSection[] = [
    { h: "What it does", p: g.what },
    { h: "How to use it", p: g.steps },
    { h: "Why people use it", p: g.benefits },
  ];
  if (g.tips && g.tips.length) sections.push({ h: "Tips for the best result", p: g.tips });
  return {
    slug: g.slug,
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    category: g.category,
    date: g.date || "2026-06-20",
    readMins: g.readMins || 4,
    toolHref: g.toolHref,
    toolLabel: g.toolLabel,
    intro: g.intro,
    sections,
    faqs: g.faqs,
    related: g.related,
  };
}

const PRIVATE_FAQ = { q: "Are my files uploaded to a server?", a: "No. Everything runs locally in your browser, so your files and data never leave your device." };
const FREE_FAQ = { q: "Is this tool free?", a: "Yes — it's completely free with no signup and no watermark." };

const GUIDE_SPECS: GuideSpec[] = [
  // ── QR CODE TYPES ──
  {
    slug: "vcard-qr-code-digital-business-card", category: "QR Codes",
    title: "vCard QR Code: Create a Digital Business Card (Free)",
    description: "Make a free vCard QR code so people save your name, phone, email and company with one scan. The modern digital business card.",
    keywords: ["vcard qr code", "digital business card", "qr code business card", "contact qr code", "nfc business card"],
    toolHref: "/qr-tools/vcard", toolLabel: "Create a vCard QR",
    intro: "A vCard QR code turns your paper business card into a one-scan contact save. People point their camera and your full details drop straight into their phone's contacts.",
    what: ["A vCard QR code stores your contact details — name, phone, email, company, website and address — in a scannable code.", "When scanned, the phone offers to save you as a new contact instantly, with no typing."],
    steps: ["Enter your name, phone, email and company.", "Add optional fields like job title, website and address.", "Download the QR code and print it on your card, badge or email signature."],
    benefits: ["Networking events — share contacts in a second.", "Sales teams, realtors and consultants who hand out cards.", "Email signatures and conference badges."],
    faqs: [{ q: "How is a vCard QR different from a URL QR?", a: "A vCard QR saves contact details directly to the phone; a URL QR just opens a web page." }, { q: "Can I update my details later?", a: "Static vCard codes are fixed; reprint if your details change, or use a dynamic link to a contact page." }, FREE_FAQ],
    related: ["how-to-create-a-qr-code", "whatsapp-qr-code"],
  },
  {
    slug: "whatsapp-qr-code", category: "QR Codes",
    title: "WhatsApp QR Code: Let Customers Message You in One Scan",
    description: "Create a free WhatsApp QR code that opens a chat with you (with an optional pre-filled message). Great for shops, support and ads.",
    keywords: ["whatsapp qr code", "qr code for whatsapp", "whatsapp chat qr", "whatsapp business qr", "click to chat qr"],
    toolHref: "/qr-tools/whatsapp", toolLabel: "Create a WhatsApp QR",
    intro: "A WhatsApp QR code opens a direct chat with your number the moment it's scanned — perfect for turning posters, packaging and ads into instant conversations.",
    what: ["It encodes a click-to-chat link for your WhatsApp number.", "You can pre-fill a message so the customer just hits send."],
    steps: ["Enter your WhatsApp number in international format.", "Optionally add a pre-filled message like “Hi, I'd like more info”.", "Download and place the code on flyers, packaging or your storefront."],
    benefits: ["Customer support and order enquiries.", "Restaurants, shops and service businesses.", "Ads and packaging that invite a quick question."],
    faqs: [{ q: "Does the customer need my number saved?", a: "No — scanning opens the chat directly, even if they've never saved you." }, { q: "Can I pre-fill the first message?", a: "Yes, you can set the text so the customer only needs to tap send." }, FREE_FAQ],
    related: ["how-to-create-a-qr-code", "vcard-qr-code-digital-business-card", "telegram-qr-code"],
  },
  {
    slug: "instagram-qr-code", category: "QR Codes",
    title: "Instagram QR Code: Grow Followers With One Scan",
    description: "Create a free Instagram QR code that opens your profile so people follow you instantly. Perfect for stores, events and print.",
    keywords: ["instagram qr code", "qr code for instagram", "instagram follow qr", "instagram profile qr"],
    toolHref: "/qr-tools/instagram", toolLabel: "Create an Instagram QR",
    intro: "An Instagram QR code sends anyone straight to your profile to follow you — turning shop windows, packaging and events into new followers.",
    what: ["It links directly to your Instagram profile.", "One scan opens the app (or web) right on your page."],
    steps: ["Enter your Instagram username.", "Customize colors and add your logo.", "Print it on packaging, receipts, posters or business cards."],
    benefits: ["Retail stores and pop-ups growing their audience.", "Creators and influencers on print media.", "Events and product packaging."],
    faqs: [{ q: "Does it open the Instagram app?", a: "Yes — on phones with Instagram installed it opens the app directly on your profile." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["how-to-create-a-qr-code", "tiktok-qr-code", "youtube-qr-code"],
  },
  {
    slug: "tiktok-qr-code", category: "QR Codes",
    title: "TikTok QR Code: Send Fans to Your Profile Instantly",
    description: "Make a free TikTok QR code that opens your profile in one scan. Grow your audience from print, packaging and events.",
    keywords: ["tiktok qr code", "qr code for tiktok", "tiktok profile qr", "tiktok follow qr"],
    toolHref: "/qr-tools/tiktok", toolLabel: "Create a TikTok QR",
    intro: "A TikTok QR code takes anyone straight to your profile, turning offline moments into new followers and views.",
    what: ["It links directly to your TikTok profile.", "Scanning opens the app right on your page."],
    steps: ["Enter your TikTok username.", "Style the code with your colors and logo.", "Add it to packaging, posters and merch."],
    benefits: ["Creators growing their following.", "Brands linking products to short-form video.", "Events and giveaways."],
    faqs: [{ q: "Will it open the TikTok app?", a: "Yes, on devices with TikTok installed it opens your profile in-app." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["instagram-qr-code", "youtube-qr-code"],
  },
  {
    slug: "youtube-qr-code", category: "QR Codes",
    title: "YouTube QR Code: Drive Views to Your Video or Channel",
    description: "Create a free YouTube QR code linking to your video or channel. Perfect for print ads, packaging and presentations.",
    keywords: ["youtube qr code", "qr code for youtube", "youtube video qr", "youtube channel qr"],
    toolHref: "/qr-tools/youtube", toolLabel: "Create a YouTube QR",
    intro: "A YouTube QR code sends people straight to your video or channel — a simple way to turn print and packaging into views and subscribers.",
    what: ["It encodes a link to any YouTube video or channel.", "One scan opens it in the YouTube app or browser."],
    steps: ["Paste your YouTube video or channel URL.", "Customize the look and add your logo.", "Print it on flyers, packaging or slides."],
    benefits: ["Product packaging linking to how-to videos.", "Presentations and posters.", "Channel growth campaigns."],
    faqs: [{ q: "Can it link to a specific video?", a: "Yes — paste the exact video URL and the code opens that video." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["instagram-qr-code", "tiktok-qr-code"],
  },
  {
    slug: "telegram-qr-code", category: "QR Codes",
    title: "Telegram QR Code: Open Your Channel or Chat in One Scan",
    description: "Make a free Telegram QR code that opens your channel, group or chat. Great for growing communities from print.",
    keywords: ["telegram qr code", "qr code for telegram", "telegram channel qr", "telegram group qr"],
    toolHref: "/qr-tools/telegram", toolLabel: "Create a Telegram QR",
    intro: "A Telegram QR code opens your channel, group or personal chat instantly — ideal for growing a community from posters and packaging.",
    what: ["It links to your Telegram username, channel or group.", "Scanning opens Telegram directly on that destination."],
    steps: ["Enter your Telegram username or channel link.", "Customize colors and logo.", "Print it wherever your audience will see it."],
    benefits: ["Growing channels and communities.", "Support and announcement groups.", "Events and product inserts."],
    faqs: [{ q: "Can it open a group invite?", a: "Yes — use your group's invite link and the code opens the join screen." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["whatsapp-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "email-qr-code", category: "QR Codes",
    title: "Email QR Code: Let People Email You Without Typing",
    description: "Create a free email QR code that opens a new message to you, optionally with a subject and body pre-filled.",
    keywords: ["email qr code", "qr code for email", "mailto qr code", "email address qr"],
    toolHref: "/qr-tools/email", toolLabel: "Create an email QR",
    intro: "An email QR code opens a new email addressed to you — with an optional subject and message ready to go — so enquiries reach your inbox with zero typing.",
    what: ["It encodes a mailto link with your address.", "You can pre-fill the subject and body."],
    steps: ["Enter your email address.", "Optionally add a subject and message.", "Download and add it to cards, posters or signage."],
    benefits: ["Support and enquiry forms on print.", "Event registration and feedback.", "Business cards and brochures."],
    faqs: [{ q: "Which app opens?", a: "The phone's default email app opens with your address filled in." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["vcard-qr-code-digital-business-card", "sms-qr-code"],
  },
  {
    slug: "sms-qr-code", category: "QR Codes",
    title: "SMS QR Code: Start a Text Message in One Scan",
    description: "Make a free SMS QR code that opens a pre-filled text message to your number. Great for campaigns, voting and support.",
    keywords: ["sms qr code", "qr code for text message", "sms marketing qr", "text qr code"],
    toolHref: "/qr-tools/sms", toolLabel: "Create an SMS QR",
    intro: "An SMS QR code opens a new text to your number with a message already typed — perfect for opt-in campaigns, voting and quick support.",
    what: ["It encodes your number plus an optional pre-written message.", "Scanning opens the messaging app ready to send."],
    steps: ["Enter your phone number.", "Add the pre-filled message, e.g. “JOIN”.", "Print it on your campaign materials."],
    benefits: ["SMS marketing opt-ins.", "Live event voting and polls.", "Quick support requests."],
    faqs: [{ q: "Can I set the message text?", a: "Yes — the customer just taps send on your pre-written message." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["email-qr-code", "whatsapp-qr-code"],
  },
  {
    slug: "phone-qr-code", category: "QR Codes",
    title: "Phone Number QR Code: Tap to Call Instantly",
    description: "Create a free phone QR code that dials your number when scanned. Perfect for taxis, support lines and ads.",
    keywords: ["phone qr code", "call qr code", "qr code for phone number", "tel qr code"],
    toolHref: "/qr-tools/phone", toolLabel: "Create a phone QR",
    intro: "A phone QR code lets anyone call you by scanning — the number drops into the dialer ready to ring, with no typing.",
    what: ["It encodes your phone number as a tel link.", "Scanning opens the dialer with your number ready."],
    steps: ["Enter your phone number in full international format.", "Customize the design.", "Add it to vehicles, signage and ads."],
    benefits: ["Taxis and delivery vehicles.", "Support and booking lines.", "Real estate signs and flyers."],
    faqs: [{ q: "Does it call automatically?", a: "It opens the dialer with your number filled in; the user taps call." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["sms-qr-code", "vcard-qr-code-digital-business-card"],
  },
  {
    slug: "google-maps-location-qr-code", category: "QR Codes",
    title: "Location QR Code: Guide People Straight to Your Address",
    description: "Create a free location QR code that opens your spot on the map. Perfect for stores, events and invitations.",
    keywords: ["location qr code", "google maps qr code", "qr code for address", "map qr code", "geo qr code"],
    toolHref: "/qr-tools/maps", toolLabel: "Create a location QR",
    intro: "A location QR code opens your exact spot on the map so customers and guests navigate to you in one tap — no address typing, no wrong turns.",
    what: ["It encodes your coordinates or map link.", "Scanning opens the map app with directions ready."],
    steps: ["Enter your address or coordinates.", "Style the code with your brand.", "Add it to invitations, signage and packaging."],
    benefits: ["Stores and restaurants driving foot traffic.", "Event and wedding invitations.", "Delivery and pickup instructions."],
    faqs: [{ q: "Which map app opens?", a: "The device's default map app opens at your location." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["how-to-create-a-qr-code", "event-qr-code"],
  },
  {
    slug: "event-qr-code", category: "QR Codes",
    title: "Event QR Code: Add Your Event to Any Calendar",
    description: "Make a free event QR code that adds your event to the scanner's calendar — date, time and location included.",
    keywords: ["event qr code", "calendar qr code", "qr code for event", "add to calendar qr"],
    toolHref: "/qr-tools/event", toolLabel: "Create an event QR",
    intro: "An event QR code lets people add your event to their calendar in one scan, with the date, time and location already filled in — so nobody forgets.",
    what: ["It encodes the event title, date, time and location.", "Scanning offers to add it to the phone's calendar."],
    steps: ["Enter the event name, date, time and place.", "Customize the design.", "Add it to invitations, posters and tickets."],
    benefits: ["Weddings, conferences and workshops.", "Concerts and community events.", "Webinars and launches."],
    faqs: [{ q: "Does it work with Google and Apple calendars?", a: "Yes — it uses the standard calendar format both support." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["google-maps-location-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "text-qr-code", category: "QR Codes",
    title: "Text QR Code: Show Any Message on Scan",
    description: "Create a free text QR code that displays a plain message when scanned — no internet needed. Great for notes and instructions.",
    keywords: ["text qr code", "plain text qr", "qr code for text", "message qr code"],
    toolHref: "/qr-tools/text", toolLabel: "Create a text QR",
    intro: "A text QR code shows a written message the instant it's scanned — no link, no internet. Perfect for instructions, notes and hidden messages.",
    what: ["It stores plain text directly in the code.", "Scanning displays the message offline, with no website involved."],
    steps: ["Type the message you want to show.", "Customize the look.", "Print or share the code."],
    benefits: ["Product instructions and care labels.", "Serial numbers and notes.", "Fun hidden messages and invitations."],
    faqs: [{ q: "Does it need internet?", a: "No — the text is stored in the code itself and shows offline." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "crypto-wallet-qr-code", category: "QR Codes",
    title: "Crypto QR Code: Receive Payments to Your Wallet",
    description: "Create a free crypto QR code for your Bitcoin or wallet address so people pay you with one scan — no copy-paste errors.",
    keywords: ["crypto qr code", "bitcoin qr code", "wallet qr code", "qr code for crypto payment"],
    toolHref: "/qr-tools/crypto", toolLabel: "Create a crypto QR",
    intro: "A crypto QR code encodes your wallet address so senders scan instead of copy-pasting long strings — faster payments and zero typos.",
    what: ["It encodes your wallet address (and optional amount).", "Scanning fills the address into the sender's wallet app."],
    steps: ["Paste your wallet address.", "Optionally set an amount.", "Share or print the code to receive funds."],
    benefits: ["Accepting crypto payments in person.", "Donations and tips.", "Invoices and checkout pages."],
    faqs: [{ q: "Is it safe to share?", a: "Yes — a receiving address is meant to be public; never share your private key." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["paypal-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "paypal-qr-code", category: "QR Codes",
    title: "PayPal QR Code: Get Paid With a Simple Scan",
    description: "Make a free PayPal QR code linking to your PayPal.Me so customers pay you fast. Perfect for freelancers and small shops.",
    keywords: ["paypal qr code", "paypal me qr", "qr code for payment", "get paid qr code"],
    toolHref: "/qr-tools/paypal", toolLabel: "Create a PayPal QR",
    intro: "A PayPal QR code sends customers straight to your PayPal.Me page to pay you — no invoices, no typing your details.",
    what: ["It links to your PayPal.Me payment page.", "Scanning opens it ready for the customer to pay."],
    steps: ["Enter your PayPal.Me username.", "Optionally set a fixed amount.", "Print it on receipts, stalls or invoices."],
    benefits: ["Freelancers and consultants.", "Market stalls and pop-ups.", "Tips and donations."],
    faqs: [{ q: "Do I need a PayPal.Me link?", a: "Yes — create a free PayPal.Me link, then encode it in the QR." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["crypto-wallet-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "spotify-qr-code", category: "QR Codes",
    title: "Spotify QR Code: Share a Song, Album or Playlist",
    description: "Create a free Spotify QR code that opens your track, album or playlist instantly. Great for artists, cafés and events.",
    keywords: ["spotify qr code", "qr code for spotify", "spotify playlist qr", "music qr code"],
    toolHref: "/qr-tools/spotify", toolLabel: "Create a Spotify QR",
    intro: "A Spotify QR code opens your song, album or playlist in one scan — ideal for artists promoting releases and venues setting the mood.",
    what: ["It links to any Spotify track, album or playlist.", "Scanning opens it directly in Spotify."],
    steps: ["Paste your Spotify link.", "Customize the design.", "Add it to posters, merch or packaging."],
    benefits: ["Musicians promoting new releases.", "Cafés and venues sharing playlists.", "Events and weddings."],
    faqs: [{ q: "Does it open the Spotify app?", a: "Yes — it opens directly in Spotify on devices that have it." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["youtube-qr-code", "how-to-create-a-qr-code"],
  },
  {
    slug: "app-download-qr-code", category: "QR Codes",
    title: "App Store QR Code: Send Users to Download Your App",
    description: "Create a free app download QR code linking to the App Store or Google Play. Boost installs from print and packaging.",
    keywords: ["app store qr code", "app download qr", "google play qr code", "qr code for app"],
    toolHref: "/qr-tools/appstore", toolLabel: "Create an app QR",
    intro: "An app download QR code takes users to your app's store page, so a single scan turns a poster or package into an install.",
    what: ["It links to your App Store or Google Play listing.", "Scanning opens the store page ready to install."],
    steps: ["Paste your app's store URL.", "Customize the design.", "Print it on packaging, ads and slides."],
    benefits: ["Boosting installs from offline channels.", "Product packaging and manuals.", "Conference and event promos."],
    faqs: [{ q: "Can one code serve both stores?", a: "Use a smart link that detects the device, then encode that link." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["how-to-create-a-qr-code", "youtube-qr-code"],
  },

  // ── PDF TOOLS ──
  {
    slug: "how-to-split-a-pdf", category: "PDF",
    title: "How to Split a PDF Into Separate Pages or Files",
    description: "Split a PDF into single pages or extract a page range for free, in your browser. Fast, private and no signup.",
    keywords: ["split pdf", "separate pdf pages", "extract pdf pages", "split pdf free", "divide pdf"],
    toolHref: "/pdf-tools/split", toolLabel: "Split a PDF",
    intro: "Splitting a PDF lets you pull out the pages you actually need — one page, a range, or every page as its own file — without any software install.",
    what: ["It divides a PDF into separate files or extracts a chosen page range.", "The output keeps the original quality and layout."],
    steps: ["Upload your PDF.", "Choose the pages or ranges to split out.", "Download the resulting file(s)."],
    benefits: ["Sending just one section of a long report.", "Separating scanned documents.", "Breaking a book into chapters."],
    faqs: [{ q: "Can I extract just one page?", a: "Yes — pick the single page you need and export it on its own." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-merge-pdf-files", "how-to-compress-a-pdf"],
  },
  {
    slug: "convert-pdf-to-jpg", category: "PDF",
    title: "How to Convert a PDF to JPG Images (Free)",
    description: "Turn each PDF page into a high-quality JPG image for free, in your browser. Great for sharing, thumbnails and slides.",
    keywords: ["pdf to jpg", "convert pdf to image", "pdf to jpeg", "pdf to jpg free", "pdf page to image"],
    toolHref: "/pdf-tools/pdf-to-jpg", toolLabel: "Convert PDF to JPG",
    intro: "Converting a PDF to JPG turns each page into an image you can post, embed or share anywhere images are accepted.",
    what: ["It renders every PDF page into a high-quality JPG.", "You get one image per page, ready to download."],
    steps: ["Upload your PDF.", "Let it render the pages to images.", "Download the JPGs individually or together."],
    benefits: ["Posting a page to social media.", "Slides and thumbnails.", "Sharing where PDFs aren't supported."],
    faqs: [{ q: "What quality are the images?", a: "Pages are rendered at high resolution so text stays sharp." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["convert-jpg-to-pdf", "convert-pdf-to-png"],
  },
  {
    slug: "convert-jpg-to-pdf", category: "PDF",
    title: "How to Convert JPG Images to a PDF (Free)",
    description: "Combine JPG or PNG images into a single PDF for free, in your browser. Perfect for scans, receipts and portfolios.",
    keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf", "png to pdf", "photos to pdf"],
    toolHref: "/pdf-tools/jpg-to-pdf", toolLabel: "Convert JPG to PDF",
    intro: "Turning images into a PDF bundles photos, scans or receipts into one tidy document that's easy to email and print.",
    what: ["It places your JPG or PNG images into a single PDF, one per page.", "You control the order of the images."],
    steps: ["Upload your images.", "Arrange them in the order you want.", "Download the combined PDF."],
    benefits: ["Turning phone scans into a document.", "Receipts and expense reports.", "Portfolios and photo sets."],
    faqs: [{ q: "Can I reorder the images?", a: "Yes — drag them into the order you want before exporting." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["convert-pdf-to-jpg", "how-to-merge-pdf-files"],
  },
  {
    slug: "convert-pdf-to-png", category: "PDF",
    title: "How to Convert a PDF to PNG (High-Resolution, Free)",
    description: "Export PDF pages as crisp PNG images with transparency support, free and in your browser. Ideal for graphics and slides.",
    keywords: ["pdf to png", "convert pdf to png", "pdf page to png", "high resolution pdf image"],
    toolHref: "/pdf-tools/pdf-to-png", toolLabel: "Convert PDF to PNG",
    intro: "PNG is the format of choice when you need crisp lines and sharp text from a PDF page — great for logos, diagrams and slides.",
    what: ["It renders each PDF page into a high-resolution PNG.", "PNG keeps edges and text especially sharp."],
    steps: ["Upload your PDF.", "Render the pages to PNG.", "Download the images."],
    benefits: ["Logos and diagrams that must stay crisp.", "Presentation graphics.", "Web images with clean edges."],
    faqs: [{ q: "PNG or JPG — which should I pick?", a: "Use PNG for sharp graphics and text; JPG for photos and smaller files." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["convert-pdf-to-jpg", "how-to-compress-a-pdf"],
  },
  {
    slug: "extract-text-from-pdf", category: "PDF",
    title: "How to Extract Text From a PDF (Copy or Download)",
    description: "Pull all the text out of a PDF as plain text for free, in your browser. Copy it or download a .txt file. No signup.",
    keywords: ["extract text from pdf", "pdf to text", "copy text from pdf", "pdf text extractor"],
    toolHref: "/pdf-tools/pdf-to-text", toolLabel: "Extract PDF text",
    intro: "When you need the words out of a PDF — to quote, translate or reuse — extracting the text gives you clean, copyable content in seconds.",
    what: ["It reads the selectable text from your PDF.", "You can copy it or download it as a .txt file."],
    steps: ["Upload your PDF.", "Let it pull out the text.", "Copy the result or download the .txt."],
    benefits: ["Quoting and citing documents.", "Translating content.", "Feeding text into other apps."],
    faqs: [{ q: "Does it work on scanned PDFs?", a: "For scans, use the OCR tool first to turn the image into real text." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["ocr-pdf-scanned-to-text", "convert-pdf-to-word"],
  },
  {
    slug: "ocr-pdf-scanned-to-text", category: "PDF",
    title: "OCR a Scanned PDF: Turn Images Into Real Text",
    description: "Run OCR on a scanned PDF to extract editable, searchable text for free, in your browser. Supports English, Russian and Uzbek.",
    keywords: ["ocr pdf", "scanned pdf to text", "pdf ocr free", "make pdf searchable", "extract text from scan"],
    toolHref: "/pdf-tools/ocr", toolLabel: "OCR a PDF",
    intro: "A scanned PDF is just a picture of text — OCR reads those pictures and turns them into real, copyable words you can search and edit.",
    what: ["It recognizes the characters in a scanned or image-based PDF.", "The result is selectable text you can copy or save."],
    steps: ["Upload your scanned PDF.", "Let OCR process the pages.", "Copy or download the recognized text."],
    benefits: ["Digitizing paper documents.", "Making old scans searchable.", "Extracting text from receipts and forms."],
    faqs: [{ q: "Which languages are supported?", a: "OCR reads English, Russian and Uzbek text." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["extract-text-from-pdf", "convert-pdf-to-word"],
  },
  {
    slug: "how-to-sign-a-pdf", category: "PDF",
    title: "How to Sign a PDF Online (Free, No Printing)",
    description: "Add your signature to a PDF for free, in your browser — draw or upload it, place it, and download. No printing or scanning.",
    keywords: ["sign pdf", "esign pdf", "add signature to pdf", "sign pdf online free", "electronic signature pdf"],
    toolHref: "/pdf-tools/sign", toolLabel: "Sign a PDF",
    intro: "Signing a PDF online skips the print-sign-scan hassle. Draw or upload your signature, drop it on the page, and you're done in a minute.",
    what: ["It lets you place a drawn or uploaded signature anywhere on the PDF.", "The signed file downloads ready to send."],
    steps: ["Upload your PDF.", "Draw or upload your signature.", "Position it on the page and download."],
    benefits: ["Contracts and agreements.", "Forms and consent letters.", "Anything that needs a quick sign-off."],
    faqs: [{ q: "Is my signature stored anywhere?", a: "No — signing happens in your browser, so nothing is uploaded." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["redact-pdf-remove-sensitive-info", "how-to-merge-pdf-files"],
  },
  {
    slug: "redact-pdf-remove-sensitive-info", category: "PDF",
    title: "How to Redact a PDF: Permanently Black Out Sensitive Info",
    description: "Redact a PDF for free — black out names, numbers and private data so they can't be copied back. Runs privately in your browser.",
    keywords: ["redact pdf", "black out text in pdf", "hide information in pdf", "pdf redaction free"],
    toolHref: "/pdf-tools/redact", toolLabel: "Redact a PDF",
    intro: "Real redaction removes information for good — not just a black box you can delete. This tool flattens the blacked-out areas so hidden data can't be recovered.",
    what: ["It draws permanent black boxes over anything you select.", "The page is flattened so the covered content can't be copied back."],
    steps: ["Upload your PDF.", "Draw boxes over the text or areas to hide.", "Export the flattened, redacted PDF."],
    benefits: ["Sharing contracts with private terms hidden.", "Removing personal data before publishing.", "Legal and HR documents."],
    faqs: [{ q: "Can the hidden text be recovered?", a: "No — the page is flattened to an image in the redacted areas, so the data is gone." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-sign-a-pdf", "remove-pdf-password"],
  },
  {
    slug: "how-to-rotate-a-pdf", category: "PDF",
    title: "How to Rotate PDF Pages and Save (Free)",
    description: "Rotate PDF pages to the correct orientation for free, in your browser, and save the change permanently. No signup.",
    keywords: ["rotate pdf", "turn pdf pages", "fix pdf orientation", "rotate pdf and save"],
    toolHref: "/pdf-tools/rotate", toolLabel: "Rotate a PDF",
    intro: "Scanned sideways or upside down? Rotating your PDF fixes the orientation and saves it so it always opens the right way up.",
    what: ["It rotates selected or all pages by 90°, 180° or 270°.", "The saved file keeps the corrected orientation."],
    steps: ["Upload your PDF.", "Rotate the pages that need fixing.", "Download the corrected PDF."],
    benefits: ["Fixing sideways scans.", "Preparing documents for printing.", "Cleaning up mixed-orientation files."],
    faqs: [{ q: "Does the rotation stay saved?", a: "Yes — the downloaded file keeps the new orientation permanently." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["reorder-pdf-pages", "how-to-split-a-pdf"],
  },
  {
    slug: "reorder-pdf-pages", category: "PDF",
    title: "How to Reorder Pages in a PDF (Drag and Drop, Free)",
    description: "Rearrange PDF pages by drag and drop for free, in your browser. Fix the order and download — no signup, fully private.",
    keywords: ["reorder pdf pages", "rearrange pdf", "move pdf pages", "organize pdf", "sort pdf pages"],
    toolHref: "/pdf-tools/reorder", toolLabel: "Reorder PDF pages",
    intro: "When pages end up in the wrong order, reordering lets you drag them into place and save a clean, correctly sequenced PDF.",
    what: ["It shows page thumbnails you can drag into any order.", "The new order is saved into the downloaded PDF."],
    steps: ["Upload your PDF.", "Drag pages into the right order.", "Download the reordered file."],
    benefits: ["Fixing out-of-order scans.", "Assembling reports from mixed pages.", "Preparing documents for print."],
    faqs: [{ q: "Can I delete pages too?", a: "Use the delete-pages tool to remove unwanted pages, then reorder the rest." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-rotate-a-pdf", "delete-pages-from-pdf"],
  },
  {
    slug: "delete-pages-from-pdf", category: "PDF",
    title: "How to Delete Pages From a PDF (Free)",
    description: "Remove unwanted pages from a PDF for free, in your browser. Delete blanks or extra pages and download the clean file.",
    keywords: ["delete pdf pages", "remove pages from pdf", "delete page in pdf", "remove blank pages pdf"],
    toolHref: "/pdf-tools/delete-pages", toolLabel: "Delete PDF pages",
    intro: "Deleting pages trims a PDF down to just what matters — removing blanks, duplicates or sections you don't want to share.",
    what: ["It lets you select and remove any pages.", "The remaining pages are saved as a clean PDF."],
    steps: ["Upload your PDF.", "Select the pages to delete.", "Download the trimmed file."],
    benefits: ["Removing blank or duplicate pages.", "Cutting confidential sections.", "Slimming down long documents."],
    faqs: [{ q: "Can I remove several pages at once?", a: "Yes — select all the pages you want gone and remove them together." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["reorder-pdf-pages", "extract-pages-from-pdf"],
  },
  {
    slug: "extract-pages-from-pdf", category: "PDF",
    title: "How to Extract Specific Pages From a PDF (Free)",
    description: "Pull out selected pages from a PDF into a new file for free, in your browser. Keep only the pages you need.",
    keywords: ["extract pdf pages", "get pages from pdf", "save pdf pages separately", "pdf page extractor"],
    toolHref: "/pdf-tools/extract-pages", toolLabel: "Extract PDF pages",
    intro: "Extracting pages saves just the sections you need as a brand-new PDF — perfect for pulling one chapter, form or invoice out of a big file.",
    what: ["It copies your chosen pages into a fresh PDF.", "The original stays untouched."],
    steps: ["Upload your PDF.", "Pick the pages to extract.", "Download the new PDF."],
    benefits: ["Sharing one section of a report.", "Saving a single invoice from a batch.", "Building a custom subset."],
    faqs: [{ q: "How is this different from splitting?", a: "Extracting keeps a specific set of pages together in one new file." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-split-a-pdf", "delete-pages-from-pdf"],
  },
  {
    slug: "add-page-numbers-to-pdf", category: "PDF",
    title: "How to Add Page Numbers to a PDF (Free)",
    description: "Insert automatic page numbers into a PDF for free, in your browser. Choose the position and style, then download.",
    keywords: ["add page numbers to pdf", "pdf page numbering", "number pdf pages", "insert page numbers pdf"],
    toolHref: "/pdf-tools/page-numbers", toolLabel: "Add page numbers",
    intro: "Page numbers make long PDFs easy to reference and print. Add them automatically and place them exactly where you want.",
    what: ["It stamps sequential page numbers onto every page.", "You choose the position on the page."],
    steps: ["Upload your PDF.", "Pick where the numbers should appear.", "Download the numbered PDF."],
    benefits: ["Reports, theses and manuals.", "Printed booklets.", "Legal and reference documents."],
    faqs: [{ q: "Can I choose where numbers go?", a: "Yes — pick the corner or center position that suits your layout." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["add-watermark-to-pdf", "how-to-merge-pdf-files"],
  },
  {
    slug: "add-watermark-to-pdf", category: "PDF",
    title: "How to Add a Watermark to a PDF (Free)",
    description: "Stamp a text watermark across every page of a PDF for free, in your browser — DRAFT, CONFIDENTIAL or your brand.",
    keywords: ["add watermark to pdf", "pdf watermark", "stamp pdf", "confidential watermark pdf", "draft watermark"],
    toolHref: "/pdf-tools/watermark", toolLabel: "Add a watermark",
    intro: "A watermark protects and labels your document — mark it DRAFT, CONFIDENTIAL, or stamp your brand across every page.",
    what: ["It overlays your chosen text across all pages.", "You control the wording and placement."],
    steps: ["Upload your PDF.", "Type your watermark text.", "Download the watermarked file."],
    benefits: ["Marking drafts and confidential files.", "Branding proposals and proofs.", "Deterring unauthorized reuse."],
    faqs: [{ q: "Does the watermark cover the text?", a: "It sits over every page as a semi-transparent stamp while keeping content readable." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["add-page-numbers-to-pdf", "protect-pdf-with-password"],
  },
  {
    slug: "protect-pdf-with-password", category: "PDF",
    title: "How to Password-Protect a PDF (Free)",
    description: "Encrypt a PDF with a password for free, in your browser, so only people with the password can open it.",
    keywords: ["protect pdf", "password protect pdf", "encrypt pdf", "lock pdf", "add password to pdf"],
    toolHref: "/pdf-tools/protect", toolLabel: "Protect a PDF",
    intro: "Password-protecting a PDF keeps sensitive documents private — the file can't be opened without the password you set.",
    what: ["It encrypts the PDF and locks it behind a password.", "Anyone without the password can't open the file."],
    steps: ["Upload your PDF.", "Set a strong password.", "Download the protected file."],
    benefits: ["Financial and legal documents.", "Contracts sent by email.", "Anything you don't want opened by the wrong person."],
    faqs: [{ q: "What if I forget the password?", a: "There's no backdoor — keep the password safe, as it's needed to open the file." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["remove-pdf-password", "redact-pdf-remove-sensitive-info"],
  },
  {
    slug: "remove-pdf-password", category: "PDF",
    title: "How to Remove a Password From a PDF (Free)",
    description: "Unlock a PDF you own by removing its password for free, in your browser. No more typing the password every time.",
    keywords: ["remove pdf password", "unlock pdf", "decrypt pdf", "remove password from pdf", "pdf password remover"],
    toolHref: "/pdf-tools/unlock", toolLabel: "Unlock a PDF",
    intro: "If you own a PDF and know its password, removing the lock saves you from typing it every time you open or share the file.",
    what: ["It removes the password from a PDF you can already open.", "The unlocked file opens freely afterwards."],
    steps: ["Upload your protected PDF.", "Enter its current password.", "Download the unlocked version."],
    benefits: ["Files you open daily.", "Documents you'll re-share internally.", "Archiving without password friction."],
    faqs: [{ q: "Can it crack unknown passwords?", a: "No — you must know the password; this only removes protection from files you can already open." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["protect-pdf-with-password", "how-to-sign-a-pdf"],
  },
  {
    slug: "crop-pdf-pages", category: "PDF",
    title: "How to Crop PDF Pages (Trim Margins, Free)",
    description: "Crop PDF pages to remove white margins or focus on an area, free and in your browser. Great for scans and printing.",
    keywords: ["crop pdf", "trim pdf margins", "cut pdf pages", "resize pdf page", "crop pdf online"],
    toolHref: "/pdf-tools/crop", toolLabel: "Crop a PDF",
    intro: "Cropping trims away unwanted margins or zooms in on the part of the page that matters — handy for scans and print layouts.",
    what: ["It removes the outer margins you select from each page.", "The cropped area becomes the new page size."],
    steps: ["Upload your PDF.", "Set the crop area.", "Download the cropped file."],
    benefits: ["Removing wide scan margins.", "Focusing on a chart or table.", "Fitting content to a print size."],
    faqs: [{ q: "Does cropping delete the content?", a: "It hides the trimmed margins from view; keep an original if you may need them." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-rotate-a-pdf", "how-to-split-a-pdf"],
  },
  {
    slug: "convert-word-to-pdf", category: "PDF",
    title: "How to Convert Word to PDF (Keep the Layout, Free)",
    description: "Convert a Word document (.docx) to PDF for free, in your browser, keeping the layout intact. No signup, fully private.",
    keywords: ["word to pdf", "convert word to pdf", "docx to pdf", "doc to pdf free", "word document to pdf"],
    toolHref: "/pdf-tools/word-to-pdf", toolLabel: "Convert Word to PDF",
    intro: "Turning Word into PDF locks in your formatting so the document looks the same on every device and prints exactly right.",
    what: ["It renders your .docx to an A4 PDF with the same layout.", "Fonts, headings and images are preserved."],
    steps: ["Upload your Word document.", "Let it convert to PDF.", "Download the PDF."],
    benefits: ["Sending documents that must not shift.", "Job applications and CVs.", "Official forms and letters."],
    faqs: [{ q: "Will the formatting change?", a: "The tool keeps your layout, fonts and images as in the original document." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["convert-pdf-to-word", "how-to-merge-pdf-files"],
  },

  // ── IMAGE TOOLS ──
  {
    slug: "extract-text-from-image", category: "Image",
    title: "How to Extract Text From an Image (OCR, Free)",
    description: "Pull text out of a photo or screenshot for free with OCR — English, Russian and Uzbek. Copy or download as .txt.",
    keywords: ["image to text", "extract text from image", "photo to text", "ocr image", "screenshot to text"],
    toolHref: "/image-tools/image-to-text", toolLabel: "Extract text from image",
    intro: "Image-to-text OCR reads the words inside a photo or screenshot and gives you clean, copyable text — no retyping receipts or notes.",
    what: ["It recognizes text in images and screenshots.", "You can copy the result or download it as a .txt file."],
    steps: ["Upload your image.", "Let OCR read the text.", "Copy or download the extracted text."],
    benefits: ["Receipts, notes and documents.", "Screenshots and slides.", "Any photo containing text."],
    faqs: [{ q: "Which languages work?", a: "It reads English, Russian and Uzbek text." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["ocr-pdf-scanned-to-text", "remove-image-background"],
  },
  {
    slug: "compress-image", category: "Image",
    title: "How to Compress an Image Without Losing Quality",
    description: "Shrink JPG, PNG and WebP images by up to 80% for free while keeping them sharp. Faster sites and smaller email attachments.",
    keywords: ["compress image", "reduce image size", "make image smaller", "image compressor", "optimize image"],
    toolHref: "/image-tools/compress", toolLabel: "Compress an image",
    intro: "Compressing images cuts file size dramatically while keeping them crisp — the single biggest win for faster websites and lighter email.",
    what: ["It re-encodes JPG, PNG and WebP at an efficient quality.", "File size drops sharply with little visible change."],
    steps: ["Upload your image.", "Let it compress.", "Download the smaller file."],
    benefits: ["Speeding up websites.", "Smaller email attachments.", "Staying under upload size limits."],
    faqs: [{ q: "How much smaller will it get?", a: "Often up to 80% smaller depending on the image." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["resize-image", "convert-image-format"],
  },
  {
    slug: "resize-image", category: "Image",
    title: "How to Resize an Image to Exact Pixels (Free)",
    description: "Resize any image to exact width and height for free, in your browser, with optional aspect-ratio lock. Perfect for social and avatars.",
    keywords: ["resize image", "change image size", "image resizer", "resize photo pixels", "scale image"],
    toolHref: "/image-tools/resize", toolLabel: "Resize an image",
    intro: "Resizing gives you an image at the exact dimensions a platform needs — no more rejected uploads or awkwardly cropped avatars.",
    what: ["It sets your image to a precise width and height.", "An optional lock keeps the aspect ratio so nothing stretches."],
    steps: ["Upload your image.", "Enter the target width and height.", "Download the resized image."],
    benefits: ["Social media posts and thumbnails.", "Profile pictures and avatars.", "Meeting strict upload sizes."],
    faqs: [{ q: "Will it stretch my image?", a: "Not if you keep the aspect-ratio lock on — it scales proportionally." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["compress-image", "convert-image-format"],
  },
  {
    slug: "convert-image-format", category: "Image",
    title: "How to Convert Between JPG, PNG and WebP (Free)",
    description: "Convert images between JPG, PNG and WebP for free, in your browser. Pick the right format for quality, transparency or size.",
    keywords: ["convert image", "jpg to png", "png to jpg", "webp converter", "image format converter"],
    toolHref: "/image-tools/convert", toolLabel: "Convert an image",
    intro: "Each image format has a job: JPG for photos, PNG for transparency, WebP for the smallest web-ready files. Converting lets you pick the right one.",
    what: ["It switches your image between JPG, PNG and WebP.", "One click gives you the format you need."],
    steps: ["Upload your image.", "Choose the target format.", "Download the converted file."],
    benefits: ["JPG for small photo files.", "PNG for transparency and sharp graphics.", "WebP for the lightest web images."],
    faqs: [{ q: "Which format is smallest?", a: "WebP usually produces the smallest files while keeping good quality." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["compress-image", "resize-image"],
  },
  {
    slug: "upscale-image", category: "Image",
    title: "How to Upscale and Sharpen a Blurry Image (Free)",
    description: "Enlarge small or blurry photos and sharpen them for free, in your browser, with 2×–4× upscaling. Great for thumbnails and old photos.",
    keywords: ["upscale image", "enhance image", "sharpen blurry photo", "enlarge image", "image enhancer"],
    toolHref: "/image-tools/upscale", toolLabel: "Upscale an image",
    intro: "Upscaling makes small or soft images larger and clearer, reviving old photos and rescuing low-resolution thumbnails.",
    what: ["It enlarges the image 2×–4× and sharpens detail.", "Edges and text come out cleaner than a plain resize."],
    steps: ["Upload your image.", "Choose the upscale amount.", "Download the enhanced image."],
    benefits: ["Old or low-res photos.", "Thumbnails that look soft.", "Product images that need more detail."],
    faqs: [{ q: "Can it fix a very blurry photo?", a: "It improves clarity noticeably, though results depend on how much detail is in the original." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["compress-image", "remove-image-background"],
  },
  {
    slug: "remove-exif-metadata-from-photos", category: "Image",
    title: "How to Remove EXIF Metadata (GPS) From Photos",
    description: "Strip GPS location, device model and timestamps from your photos for free before sharing — private, in your browser.",
    keywords: ["remove exif", "remove gps from photo", "strip metadata", "exif remover", "remove photo location"],
    toolHref: "/image-tools/exif-remover", toolLabel: "Remove EXIF data",
    intro: "Photos quietly carry EXIF data — where and when they were taken, and on what device. Removing it protects your privacy before you post or send.",
    what: ["It strips hidden EXIF metadata like GPS, device and timestamps.", "The cleaned image looks identical but reveals nothing about you."],
    steps: ["Upload your photo.", "Let it strip the metadata.", "Download the clean image."],
    benefits: ["Posting photos without leaking your location.", "Selling items online safely.", "Sharing images with strangers."],
    faqs: [{ q: "Does it change how the photo looks?", a: "No — only the hidden metadata is removed; the image itself is unchanged." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["compress-image", "extract-text-from-image"],
  },

  // ── EXTRA / GROWTH TOOLS ──
  {
    slug: "bulk-qr-code-generator-csv", category: "Guides",
    title: "How to Generate QR Codes in Bulk From a CSV (Free)",
    description: "Create hundreds of QR codes at once from a CSV and download them as a ZIP — free, in your browser. Perfect for products and events.",
    keywords: ["bulk qr code", "qr code generator csv", "mass qr codes", "batch qr code", "generate many qr codes"],
    toolHref: "/bulk-qr", toolLabel: "Bulk-generate QR codes",
    intro: "When you need hundreds of QR codes — one per product, ticket or table — bulk generation from a CSV creates them all at once and hands you a ZIP.",
    what: ["It reads a list from your CSV and makes one QR per row.", "All codes download together in a single ZIP."],
    steps: ["Prepare a CSV with your links or data.", "Upload it to the bulk generator.", "Download the ZIP of QR images."],
    benefits: ["Product labels and inventory.", "Event tickets and badges.", "Table numbers and asset tags."],
    faqs: [{ q: "How many codes can I make?", a: "You can generate large batches at once; the ZIP contains one image per row." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-create-a-qr-code", "what-is-a-dynamic-qr-code"],
  },
  {
    slug: "link-in-bio-free", category: "Guides",
    title: "Free Link-in-Bio Page: All Your Links in One Place",
    description: "Build a free link-in-bio page — no signup — to share every link from one URL and QR code. Great for Instagram and TikTok.",
    keywords: ["link in bio", "free linktree alternative", "link in bio page", "all my links", "bio link"],
    toolHref: "/link-in-bio", toolLabel: "Build a link-in-bio page",
    intro: "A link-in-bio page puts all your important links — shop, socials, contact — behind one address and one QR code, perfect for social profiles that allow just a single link.",
    what: ["It creates a mobile-friendly page listing all your links.", "You get one URL and a QR code to share it."],
    steps: ["Add your name, photo and links.", "Pick your colors.", "Share the page URL or its QR code."],
    benefits: ["Instagram and TikTok bios.", "Business cards and packaging.", "Creators and small businesses."],
    faqs: [{ q: "Do I need an account?", a: "No — you can build and share a link-in-bio page for free without signing up." }, FREE_FAQ, PRIVATE_FAQ],
    related: ["qr-code-for-restaurant-menu", "instagram-qr-code"],
  },
  {
    slug: "qr-code-poster-maker", category: "Guides",
    title: "How to Make a QR Code Poster or Flyer (Free)",
    description: "Design a printable ‘Scan me’ QR poster for menus, reviews, WiFi and follows — free, in your browser. Download print-ready.",
    keywords: ["qr code poster", "scan me poster", "qr flyer", "qr code sign", "printable qr poster"],
    toolHref: "/poster", toolLabel: "Make a QR poster",
    intro: "A ‘Scan me’ poster turns any QR code into eye-catching print — for menus, reviews, WiFi, payments and follows — ready to hang on your wall or table.",
    what: ["It builds a print-ready A4 poster around your QR code.", "Templates cover menus, reviews, follows, WiFi and payments."],
    steps: ["Pick a template and enter your link.", "Upload your logo and customize the text and colors.", "Download the print-ready poster."],
    benefits: ["Restaurant tables and shop counters.", "Review and follow campaigns.", "WiFi and payment signage."],
    faqs: [
      { q: "What size is the poster?", a: "It exports at A4, ready to print at home or a print shop." },
      { q: "Can I put my logo on it?", a: "Yes — upload a PNG, JPG, WebP or SVG and it sits centred above the heading, scaled to fit. The file is read in your browser and never uploaded." },
      { q: "Is this tool free?", a: "Yes — free, no signup. A small 'Made with QRix' line sits in the footer and one checkbox removes it, so the printed poster carries no watermark." },
      PRIVATE_FAQ,
    ],
    related: ["qr-code-for-restaurant-menu", "wifi-qr-code-guide"],
  },
  {
    slug: "free-barcode-generator-guide", category: "Guides",
    title: "Barcode Types Explained: EAN-13, UPC, Code 128 & When to Use Each",
    description: "Generate any barcode for free — EAN-13, UPC-A, Code 128, Code 39, ITF-14 and more. Learn which format your product or warehouse needs.",
    keywords: ["barcode generator", "barcode types", "ean 13 vs upc", "code 128", "product barcode", "free barcode maker"],
    toolHref: "/barcode", toolLabel: "Generate a barcode",
    intro: "Not all barcodes are the same — retail shelves, shipping cartons and warehouse bins each use a different standard. Here's what each format is for, and how to generate yours in seconds.",
    what: ["EAN-13 and UPC-A are the retail product codes scanned at every checkout worldwide.", "Code 128 handles any text — the workhorse of logistics and inventory. Code 39 is common on ID badges; ITF-14 goes on shipping cartons; MSI, Pharmacode and Codabar serve warehouses, pharma and libraries."],
    steps: ["Pick the format your use case needs — EAN-13 for retail, Code 128 for internal labels, ITF-14 for boxes.", "Type your value — checksums for EAN/UPC are added automatically.", "Download a print-ready SVG or high-res PNG for your packaging or labels."],
    benefits: ["Product packaging and price tags.", "Warehouse, inventory and asset labels.", "Shipping cartons, ID badges and membership cards."],
    faqs: [{ q: "EAN-13 or UPC-A — which do I need?", a: "Selling internationally: EAN-13. US/Canada retail: UPC-A. Modern scanners read both." }, { q: "Do I need to calculate the checksum?", a: "No — the generator adds EAN/UPC check digits automatically." }, FREE_FAQ],
    related: ["how-to-create-a-qr-code", "bulk-qr-code-generator-csv"],
  },
  {
    slug: "link-in-bio-for-business", category: "Guides",
    title: "Link-in-Bio for Business: Ready Templates for Restaurants, Shops & Salons",
    description: "Launch a professional link-in-bio page in one click with business templates — menu, delivery, booking, reviews. Free, no signup.",
    keywords: ["link in bio for business", "restaurant link in bio", "booking link page", "business bio link", "linktree for business"],
    toolHref: "/link-in-bio", toolLabel: "Pick a template",
    intro: "A business link-in-bio page puts your menu, delivery, booking and reviews behind one link and one QR code. With ready templates, a restaurant or salon can launch theirs in under a minute.",
    what: ["Templates for restaurants, shops, salons, freelancers, musicians and events pre-fill the whole page.", "You get one URL and QR code that opens all your business actions."],
    steps: ["Pick the template that matches your business.", "Swap in your own links — menu, ordering, booking, reviews, map.", "Share the URL or print the QR on tables, packaging and posters."],
    benefits: ["Restaurants: menu + delivery + reviews from one table QR.", "Shops and salons: catalog, booking and WhatsApp in one place.", "Freelancers and creators: portfolio and contact behind one link."],
    faqs: [{ q: "Do I need an account?", a: "No — build and share the page free without signing up." }, { q: "Can I change the links later?", a: "Yes — edit the page and share the updated link; with a dynamic QR the printed code can stay the same." }, FREE_FAQ],
    related: ["link-in-bio-free", "qr-code-for-restaurant-menu"],
  },
  {
    slug: "scan-qr-code-from-image", category: "Guides",
    title: "How to Scan a QR Code From an Image or Screenshot",
    description: "Read a QR code from any saved photo or screenshot for free — no camera needed. Decodes links, WiFi, contacts and more.",
    keywords: ["scan qr from image", "read qr code from picture", "qr decoder", "qr code reader online", "decode qr code"],
    toolHref: "/qr-tools/decode", toolLabel: "Decode a QR code",
    intro: "Can't scan a QR code with your camera because it's already a saved image? A decoder reads the code straight from the picture and shows you what's inside.",
    what: ["It reads a QR code from an uploaded photo or screenshot.", "It reveals the link, WiFi, contact or text inside."],
    steps: ["Upload the image containing the QR code.", "Let it decode.", "Copy or open the decoded content."],
    benefits: ["Screenshots you can't point a camera at.", "Codes received in chats.", "Checking where a code leads before visiting."],
    faqs: [{ q: "What can it read?", a: "Links, WiFi credentials, contacts, email, phone, SMS and plain text." }, PRIVATE_FAQ, FREE_FAQ],
    related: ["how-to-create-a-qr-code", "wifi-qr-code-guide"],
  },
];

/* Mission 59 — fresh feature articles: video/AI coverage + the newest tools. */
const FEATURE_POSTS: BlogPost[] = [
  {
    slug: "animated-qr-code-for-stories-reels",
    title: "Animated QR Codes for Instagram Stories, Reels & TikTok (Free)",
    description: "Static QR codes get skipped in feeds. Turn any link into a 6-second animated QR video that stops the scroll — free, no watermark, rendered in your browser.",
    keywords: ["animated qr code", "qr code video", "qr code for instagram story", "qr code reels", "scan me video", "animated qr maker"],
    category: "QR Codes", date: "2026-07-13", readMins: 4,
    toolHref: "/animated-qr", toolLabel: "Make an animated QR",
    intro: "A printed QR code works because people stand still. In a feed, nobody stops for a static square — motion is what earns the pause. An animated QR video gives your code an entrance: it assembles on screen, catches a light sweep, and lands with a SCAN ME call-to-action.",
    sections: [
      { h: "Why animate a QR code at all?", p: [
        "Stories and Reels are motion-first surfaces. A static image reads as a screenshot and gets swiped away; a short animation reads as content.",
        "The QR itself stays fully scannable in the final seconds — viewers pause the story or screenshot the last frame and scan it later.",
      ]},
      { h: "How to make one in under a minute", p: [
        "1. Paste your link — the QR updates live while you type.",
        "2. Pick a format: Story (9:16) for Instagram/TikTok or Post (1:1) for feeds.",
        "3. Choose a theme and edit the call-to-action text.",
        "4. Hit Record — a 6-second MP4/WebM downloads straight from your browser.",
      ]},
      { h: "Where animated QR videos work best", p: [
        "Restaurant menu pushes in Stories, giveaway entries, event check-ins, link-in-bio promotions and product drops.",
        "Because everything renders on your device, nothing uploads and there is nothing to wait for — the video is yours the moment recording ends.",
      ]},
    ],
    faqs: [
      { q: "Will the QR still scan from a video?", a: "Yes — the final seconds hold the finished code steady. Viewers pause the story or screenshot it and scan from the image." },
      { q: "What format does it download in?", a: "MP4 where the browser supports recording it, otherwise WebM — both upload fine to Instagram, TikTok and YouTube." },
      { q: "Is it free?", a: "Completely. No signup, no watermark, and rendering happens on your device." },
    ],
    related: ["how-to-create-a-qr-code"],
  },
  {
    slug: "compress-video-online-free",
    title: "How to Compress a Video Online Free (No Watermark, No Upload)",
    description: "Shrink a video for WhatsApp, email or the web without installing anything. How on-device compression works and how to pick the right quality.",
    keywords: ["compress video online", "reduce video size", "video compressor free", "shrink video for whatsapp", "compress mp4"],
    category: "Video", date: "2026-07-12", readMins: 5,
    toolHref: "/video-tools/compress-video", toolLabel: "Compress a video",
    intro: "Most video compressors upload your file to a server, queue it, and stamp a watermark on the result. A browser-based compressor skips all three: your video never leaves your device, and the output is clean.",
    sections: [
      { h: "What actually makes video files big", p: [
        "Resolution, bitrate and duration multiply together. A one-minute 4K clip can outweigh a feature-length SD film.",
        "Most sharing targets — WhatsApp, Telegram, email — don't need more than 720p–1080p at a moderate bitrate. That's where the big savings live.",
      ]},
      { h: "Compressing in the browser, step by step", p: [
        "1. Drop your video into the tool — nothing uploads; it opens locally.",
        "2. Pick a target quality or resolution. Lower resolution shrinks files fastest.",
        "3. Preview, then export. The re-encoded file downloads instantly.",
      ]},
      { h: "Settings that don't ruin quality", p: [
        "For chat apps: 720p is the sweet spot — sharp on phones, small enough to send.",
        "For email: aim under 25 MB; trimming dead seconds off the ends often saves as much as re-encoding.",
        "For archiving: keep the original and compress a copy — compression is one-way.",
      ]},
    ],
    faqs: [
      { q: "Does my video get uploaded?", a: "No. The whole pipeline runs in your browser — files never leave your device." },
      { q: "Is there a size limit?", a: "The practical limit is your device's memory; multi-hundred-megabyte files are fine on modern hardware." },
      { q: "Will there be a watermark?", a: "Never. The output is your video, only smaller." },
    ],
    related: ["make-gif-from-video", "animated-qr-code-for-stories-reels"],
  },
  {
    slug: "make-gif-from-video",
    title: "How to Make a GIF from a Video (Free, Right in Your Browser)",
    description: "Turn any video moment into a looping GIF for chats, docs and social — pick the clip, set the size, export. No upload, no watermark.",
    keywords: ["video to gif", "make gif from video", "gif maker online", "convert mp4 to gif", "create gif free"],
    category: "Video", date: "2026-07-11", readMins: 4,
    toolHref: "/video-tools/create-gif", toolLabel: "Make a GIF",
    intro: "GIFs still rule chats, pull requests and documentation because they loop, autoplay everywhere, and need no player. The trick is making one small enough to send and sharp enough to read.",
    sections: [
      { h: "Picking the right moment", p: [
        "Great GIFs are short — two to four seconds. Find the exact beat you want and trim tight; every extra second multiplies the file size.",
        "Loops feel best when the last frame lands near the first — cutting on motion hides the seam.",
      ]},
      { h: "Size, frame rate and colors", p: [
        "GIF stores a limited palette per frame, so a modest resolution usually looks better than a starved high-res image.",
        "480 px wide at 12–15 fps is the classic chat-friendly recipe; go bigger only for tutorial captures where text must stay legible.",
      ]},
      { h: "Making one in the browser", p: [
        "1. Open the GIF maker and drop in your video.",
        "2. Choose the start and end points and the output width.",
        "3. Export — the encoder runs on your device and the GIF downloads immediately.",
      ]},
    ],
    faqs: [
      { q: "Why is my GIF bigger than the video?", a: "GIF is an old format without modern compression — keep clips short and modest in size, or share a WebM/MP4 when the platform supports it." },
      { q: "Is anything uploaded?", a: "No — decoding and encoding both happen in your browser." },
      { q: "Can I make a GIF from a screen recording?", a: "Yes — any video file works: screen captures, phone clips, downloads." },
    ],
    related: ["compress-video-online-free"],
  },
  {
    slug: "upscale-image-with-ai",
    title: "How to Upscale an Image with AI (Make Small Photos Larger & Sharper)",
    description: "Enlarge a low-resolution photo 2–4× without the blur. How AI upscaling works, when it helps, and how to run it free in your browser.",
    keywords: ["ai image upscaler", "upscale image online", "enlarge photo without losing quality", "increase image resolution", "photo enhancer"],
    category: "AI", date: "2026-07-10", readMins: 5,
    toolHref: "/ai-tools/image-upscaler", toolLabel: "Upscale an image",
    intro: "Classic resizing stretches pixels and blurs edges. AI upscaling predicts the detail that should be there — edges stay crisp, textures stay plausible, and a thumbnail-sized photo becomes usable again.",
    sections: [
      { h: "When upscaling helps (and when it can't)", p: [
        "It shines on old photos, small logos, product shots saved at low resolution, and screenshots destined for print.",
        "It can't invent what was never captured — heavy motion blur or extreme compression artifacts limit any upscaler.",
      ]},
      { h: "Getting the best result", p: [
        "Start from the largest original you have — never from a screenshot of a screenshot.",
        "Upscale 2× first and inspect; jumping straight to 4× amplifies any noise in the source.",
        "For faces, follow the upscale with a light sharpen rather than pushing the scale factor higher.",
      ]},
      { h: "Doing it free in the browser", p: [
        "1. Open the upscaler and drop in your image.",
        "2. Choose 2× or 4× and run it.",
        "3. Compare before/after, then download the PNG.",
      ]},
    ],
    faqs: [
      { q: "Does the photo leave my device?", a: "The on-device engine processes locally; cloud engines run only when you explicitly enable them." },
      { q: "What's the maximum size?", a: "Browser memory is the limit — typical photos upscale to 4K+ comfortably." },
      { q: "Does it work on logos and text?", a: "Yes — flat graphics with clean edges upscale especially well." },
    ],
    related: ["remove-exif-gps-data-from-photos"],
  },
  {
    slug: "remove-exif-gps-data-from-photos",
    title: "Your Photos Leak Your Location — How to Remove EXIF & GPS Data",
    description: "Every phone photo carries hidden metadata: GPS coordinates, device model, timestamps. What EXIF reveals and how to strip it before sharing.",
    keywords: ["remove exif data", "strip gps from photo", "photo metadata remover", "exif cleaner online", "photo privacy"],
    category: "Image", date: "2026-07-09", readMins: 4,
    toolHref: "/image-tools/exif-remover", toolLabel: "Clean a photo now",
    intro: "The picture you just shared may include exactly where it was taken — down to a few meters. EXIF metadata rides inside the file itself, invisible in the image but readable by anyone with the file.",
    sections: [
      { h: "What's hiding in a photo file", p: [
        "GPS coordinates of the shot, the exact date and time, your phone's make and model, camera settings — sometimes even the editing software used.",
        "Major social networks strip metadata on upload, but email, messengers, cloud drives and marketplaces often pass the original file through untouched.",
      ]},
      { h: "When it matters most", p: [
        "Selling items online from home, sharing photos of children, posting from a private location, or publishing documents that include photographs.",
      ]},
      { h: "Stripping metadata in seconds", p: [
        "1. Drop the photo into the EXIF remover — it runs entirely in your browser.",
        "2. Review what was found: location, device, timestamps.",
        "3. Download the cleaned copy. The pixels are identical; the secrets are gone.",
      ]},
    ],
    faqs: [
      { q: "Does removing EXIF change image quality?", a: "No — metadata lives alongside the image data. Removing it doesn't touch a single pixel." },
      { q: "Is the photo uploaded anywhere?", a: "No. Reading and cleaning happen on your device." },
      { q: "Which formats are supported?", a: "JPG and most camera formats that carry EXIF; PNG rarely contains sensitive metadata." },
    ],
    related: ["upscale-image-with-ai"],
  },
  {
    slug: "photo-to-3d-model-online",
    title: "Turn a Photo into a 3D Model Online (GLB, OBJ, STL, USDZ)",
    description: "From a single product shot to a textured, export-ready 3D model — how image-to-3D works, what to expect, and how to try it free.",
    keywords: ["image to 3d model", "photo to 3d", "3d model from picture", "glb generator", "stl from image"],
    category: "Guides", date: "2026-07-08", readMins: 5,
    toolHref: "/3d-tools/image-to-3d", toolLabel: "Try Image to 3D",
    intro: "Image-to-3D has crossed from research demo to practical tool: give it one clear photo and you get back a textured mesh you can spin, inspect and export for AR, games or 3D printing.",
    sections: [
      { h: "What one photo can honestly produce", p: [
        "Expect a convincing model of the visible side plus an AI-completed back. Products, toys, shoes and furniture work great; thin or transparent objects are harder.",
        "The result is a real mesh with textures baked in — not a flat card trick.",
      ]},
      { h: "Shooting the right source photo", p: [
        "Use a plain background, even lighting and the object centered, filling most of the frame.",
        "Avoid harsh shadows and reflections — the reconstruction reads them as geometry.",
      ]},
      { h: "From photo to file", p: [
        "1. Upload the image and start the generation — progress streams live.",
        "2. Orbit and inspect the model in the 3D viewer, switch lighting rigs.",
        "3. Export GLB for web/AR, OBJ for editing, STL for printing, or USDZ for iOS Quick Look.",
      ]},
    ],
    faqs: [
      { q: "Which format should I export?", a: "GLB for web and AR viewers, STL for 3D printing, OBJ for editing in Blender, USDZ for Apple devices." },
      { q: "How long does it take?", a: "Typically under a minute per model, streamed with live progress." },
      { q: "Is it free?", a: "You get free generations to start; heavier use runs on credits." },
    ],
    related: ["upscale-image-with-ai"],
  },
];

export const POSTS: BlogPost[] = [...HAND_POSTS, ...FEATURE_POSTS, ...GUIDE_SPECS.map(buildPost)];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function allPostsSorted(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* M145 renders dates on the blog index and in article bylines. Hand-written
   posts always have one (BlogPost.date is required), but autopilot posts are
   JSON blobs stored in Supabase and only typed as BlogPost on the way out — a
   row written by an older generator, or one hand-edited in the dashboard, can
   arrive without a parseable date. `new Date(undefined)` stringifies to
   "Invalid Date", which would render as visible text on the most-crawled index
   on the site. Returning null lets the caller omit the element instead. */
export function formatPostDate(
  iso: string | undefined,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): { iso: string; label: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { iso, label: d.toLocaleDateString("en-US", opts) };
}
