// SEO blog content library. Each post is fully typed and rendered statically
// with Article + FAQ + Breadcrumb structured data. Add new posts by appending
// to POSTS — the index, sitemap and [slug] route pick them up automatically.

export type BlogSection = { h: string; p: string[] };
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: "QR Codes" | "PDF" | "Image" | "Guides";
  date: string;        // ISO
  readMins: number;
  toolHref: string;
  toolLabel: string;
  intro: string;
  sections: BlogSection[];
  faqs: { q: string; a: string }[];
  related: string[];   // other slugs
};

export const POSTS: BlogPost[] = [
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

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function allPostsSorted(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
