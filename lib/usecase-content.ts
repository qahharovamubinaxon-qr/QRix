// Programmatic SEO — use-case landing pages (Mission 66). Each use-case is a
// high-intent long-tail page ("QR code for a restaurant menu", "compress a
// video for WhatsApp", …) that funnels to the real tool. Pages are rendered
// in EN/RU/UZ under /use/<lang>/<slug> with proper hreflang alternates.

import { USE_CASE_I18N, UI_I18N } from "./usecase-content.i18n";

// 15 most-spoken world languages (EN/RU/UZ authored, 12 more translated).
export type Lang =
  | "en" | "ru" | "uz" | "zh" | "hi" | "es" | "ar" | "fr"
  | "pt" | "id" | "de" | "ja" | "tr" | "ur" | "bn";
export const USE_LANGS: Lang[] = ["en", "ru", "uz", "zh", "hi", "es", "ar", "fr", "pt", "id", "de", "ja", "tr", "ur", "bn"];

// Languages written right-to-left (used to set dir on the page).
export const RTL_LANGS: Lang[] = ["ar", "ur"];
export const isRtl = (l: Lang) => RTL_LANGS.includes(l);

// Human-readable language names for the on-page language switcher.
export const LANG_NAMES: Record<Lang, string> = {
  en: "English", ru: "Русский", uz: "Oʻzbek", zh: "中文", hi: "हिन्दी", es: "Español",
  ar: "العربية", fr: "Français", pt: "Português", id: "Bahasa", de: "Deutsch",
  ja: "日本語", tr: "Türkçe", ur: "اردو", bn: "বাংলা",
};

export type UseCaseContent = {
  title: string;        // H1 + <title>
  metaDescription: string;
  intro: string;
  benefits: string[];
  steps: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
};

export type UseCase = {
  slug: string;
  toolHref: string;
  toolLabel: string;     // localized per lang via UI strings + this fallback
  category: "QR" | "PDF" | "Image" | "Video" | "AI";
  emoji: string;
  grad: string;
  keywords: Record<Lang, string[]>;
  content: Record<Lang, UseCaseContent>;
};

// Chrome / section labels per language (page furniture around the content).
export type UiStrings = {
  kicker: string; how: string; why: string; faq: string; open: string;
  related: string; more: string; home: string; hub: string; hubTitle: string;
  hubDesc: string; free: string;
};
const UI_BASE: Record<"en" | "ru" | "uz", UiStrings> = {
  en: { kicker: "// USE CASE", how: "How to do it", why: "Why QRix", faq: "Frequently asked questions", open: "Open the tool", related: "More use cases", more: "Explore all tools", home: "Home", hub: "Use cases", hubTitle: "QRix use cases — the right tool for every job", hubDesc: "Practical, step-by-step guides that take you straight to the free tool you need — QR codes, PDFs, images and video.", free: "Free · on-device · no signup" },
  ru: { kicker: "// СЦЕНАРИЙ", how: "Как это сделать", why: "Почему QRix", faq: "Частые вопросы", open: "Открыть инструмент", related: "Другие сценарии", more: "Все инструменты", home: "Главная", hub: "Сценарии", hubTitle: "Сценарии QRix — нужный инструмент для любой задачи", hubDesc: "Практические пошаговые руководства, которые сразу ведут к бесплатному инструменту — QR-коды, PDF, изображения и видео.", free: "Бесплатно · на устройстве · без регистрации" },
  uz: { kicker: "// ҲОЛАТ", how: "Қандай қилинади", why: "Нега QRix", faq: "Кўп бериладиган саволлар", open: "Воситани очиш", related: "Бошқа ҳолатлар", more: "Барча воситалар", home: "Бош саҳифа", hub: "Ҳолатлар", hubTitle: "QRix ҳолатлари — ҳар вазифа учун керакли восита", hubDesc: "Амалий, қадам-бақадам қўлланмалар сизни тўғридан-тўғри керакли текин воситага олиб боради — QR кодлар, PDF, расм ва видео.", free: "Текин · қурилмада · рўйхатсиз" },
};
// Merge the 12 generated languages (UI_I18N) with the authored en/ru/uz.
export const UI = { ...UI_BASE, ...(UI_I18N as Record<string, UiStrings>) } as Record<Lang, UiStrings>;

// A single-language authored entry. English is authored here; ru/uz come
// from lib/usecase-content.i18n.ts (generated) and are merged at load.
export type UseCaseSeed = {
  slug: string; toolHref: string; toolLabel: string;
  category: UseCase["category"]; emoji: string; grad: string;
  keywords: string[]; content: UseCaseContent;
};

export const USE_CASES_EN: UseCaseSeed[] = [
  {
    slug: "restaurant-menu-qr-code", toolHref: "/url-qr", toolLabel: "Create a menu QR",
    category: "QR", emoji: "🍽️", grad: "linear-gradient(135deg,#ff6a13,#e14e08)",
    keywords: ["restaurant menu qr code", "qr code menu", "digital menu qr", "scan to view menu", "contactless menu"],
    content: {
      title: "QR Code for a Restaurant Menu — Free Contactless Menu Maker",
      metaDescription: "Turn your menu link or PDF into a scannable QR code for tables, windows and flyers. Free, no signup, works offline once printed.",
      intro: "A menu QR code lets guests open your menu on their own phone in one scan — no app, no shared physical menus. Point it at a hosted menu page or a PDF and print it for tables, the door or a flyer.",
      benefits: [
        "Guests scan and browse instantly — great for turnover and contactless service.",
        "Update the linked menu any time; the printed code never changes.",
        "Works for cafés, bars, food trucks, hotels and room service.",
        "Add your logo and brand colors so it looks like part of the table setting.",
      ],
      steps: [
        { title: "Paste your menu link", desc: "A hosted menu page, a Google Doc, or a PDF you uploaded somewhere public." },
        { title: "Style the code", desc: "Pick colors, add your logo, and choose a rounded or classic look." },
        { title: "Download & print", desc: "Export a high-resolution PNG or SVG and put it on tables, tents or the window." },
      ],
      faqs: [
        { q: "Do guests need an app to scan it?", a: "No. Every modern phone camera reads QR codes straight from the camera or a quick scan gesture." },
        { q: "Can I change the menu after printing?", a: "Yes — if the code points to a hosted page you control, edit that page and the same printed code shows the new menu." },
        { q: "Is it really free?", a: "Yes, unlimited and watermark-free. The code is generated in your browser." },
      ],
    },
  },
  {
    slug: "wifi-qr-code-for-guests", toolHref: "/wifi-qr", toolLabel: "Create a WiFi QR",
    category: "QR", emoji: "📶", grad: "linear-gradient(135deg,#0891b2,#22d3ee)",
    keywords: ["wifi qr code", "guest wifi qr", "qr code for wifi password", "scan to connect wifi", "wifi qr generator"],
    content: {
      title: "WiFi QR Code for Guests — Scan to Connect, No Typing",
      metaDescription: "Make a WiFi QR code so guests join your network in one scan — no spelling out passwords. Free, private, generated on your device.",
      intro: "A WiFi QR code stores your network name and password so guests connect by scanning instead of typing a long password. Perfect for homes, cafés, offices, rentals and events.",
      benefits: [
        "Guests connect in seconds — no dictating or mistyping passwords.",
        "Print it for the fridge, a reception desk, an Airbnb welcome card or a meeting room.",
        "Supports WPA/WPA2 and open networks; hidden SSIDs too.",
        "Everything is generated on your device — your password never leaves your browser.",
      ],
      steps: [
        { title: "Enter your WiFi details", desc: "Network name (SSID), password and security type." },
        { title: "Customize", desc: "Add colors or a logo so it matches your space." },
        { title: "Print & display", desc: "Download and place it where guests will see it." },
      ],
      faqs: [
        { q: "Is my password uploaded anywhere?", a: "No. The QR code is built entirely in your browser — nothing is sent to a server." },
        { q: "Which phones can scan it?", a: "Both iPhone and Android read WiFi QR codes from the native camera and offer a one-tap connect." },
        { q: "Does it work for hidden networks?", a: "Yes — mark the network as hidden and the code includes that flag." },
      ],
    },
  },
  {
    slug: "business-card-qr-code", toolHref: "/vcard-qr", toolLabel: "Create a vCard QR",
    category: "QR", emoji: "👤", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    keywords: ["business card qr code", "vcard qr code", "digital business card", "qr code contact", "scan to save contact"],
    content: {
      title: "Business Card QR Code (vCard) — Scan to Save Your Contact",
      metaDescription: "Put a vCard QR code on your business card, email signature or badge so people save your details in one scan. Free and private.",
      intro: "A vCard QR code holds your name, phone, email and company. When scanned, the phone offers to save you as a contact instantly — no typing, no lost cards.",
      benefits: [
        "People save your full contact in one scan — nothing gets mistyped.",
        "Great on printed cards, email signatures, badges and storefronts.",
        "Include phone, email, website, company and job title.",
        "Generated on your device — your details stay private.",
      ],
      steps: [
        { title: "Fill in your details", desc: "Name, phone, email, organization and anything else you want shared." },
        { title: "Style it", desc: "Match your brand with colors and a logo." },
        { title: "Download", desc: "Add the code to your card, signature or badge." },
      ],
      faqs: [
        { q: "What happens when someone scans it?", a: "Their phone opens a 'Save contact' prompt pre-filled with your details." },
        { q: "Can I include my website and title?", a: "Yes — a vCard supports name, phone, email, organization, title and URL." },
        { q: "Is it free with no watermark?", a: "Completely free and clean — the code is generated in your browser." },
      ],
    },
  },
  {
    slug: "instagram-qr-code", toolHref: "/qr-tools/instagram", toolLabel: "Create an Instagram QR",
    category: "QR", emoji: "📸", grad: "linear-gradient(135deg,#d946ef,#f472b6)",
    keywords: ["instagram qr code", "qr code for instagram", "instagram profile qr", "grow instagram followers qr", "scan to follow"],
    content: {
      title: "Instagram QR Code — Scan to Follow Your Profile",
      metaDescription: "Create a QR code that opens your Instagram profile so people follow you in one scan. Perfect for flyers, packaging and store windows. Free.",
      intro: "An Instagram QR code sends anyone straight to your profile so they can follow you without searching your handle. Put it on packaging, receipts, flyers or the window to turn foot traffic into followers.",
      benefits: [
        "One scan opens your profile — no typing usernames or searching.",
        "Great for shops, events, packaging and print ads.",
        "Brand it with your colors and logo.",
        "Free and unlimited — make one for every campaign.",
      ],
      steps: [
        { title: "Enter your username", desc: "We build the link to your Instagram profile." },
        { title: "Customize", desc: "Add colors and a logo to match your brand." },
        { title: "Download & share", desc: "Print it or drop it into your designs." },
      ],
      faqs: [
        { q: "Does it open the app or the browser?", a: "On phones with Instagram installed it opens the app directly on your profile; otherwise it opens the web profile." },
        { q: "Can I use it on packaging and flyers?", a: "Yes — export a high-resolution PNG or SVG that stays crisp at any print size." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
  {
    slug: "google-review-qr-code", toolHref: "/poster", toolLabel: "Make a review poster",
    category: "QR", emoji: "⭐", grad: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    keywords: ["google review qr code", "qr code for reviews", "scan to leave a review", "review poster", "get more reviews"],
    content: {
      title: "Google Review QR Code — Get More 5-Star Reviews",
      metaDescription: "Make a 'Scan to review us' QR poster that opens your Google review form in one tap. Free printable flyer for the counter or receipt.",
      intro: "A review QR code takes happy customers straight to your Google review form, removing the friction that stops most people from leaving a review. Print it as a counter card or add it to receipts.",
      benefits: [
        "Customers reach your review form in one scan — more reviews, higher ranking.",
        "Print a ready-made 'Scan to review' poster for the counter or table.",
        "Works with your Google review link, or any review platform.",
        "Free — make posters for every location.",
      ],
      steps: [
        { title: "Paste your review link", desc: "Your Google 'write a review' short link (or any review URL)." },
        { title: "Pick a poster style", desc: "Choose a clean 'Scan to review us' layout." },
        { title: "Print & place it", desc: "Put it where customers pay or wait." },
      ],
      faqs: [
        { q: "Where do I get my Google review link?", a: "In your Google Business profile, use 'Ask for reviews' to copy the short review link, then paste it here." },
        { q: "Can I add my logo?", a: "Yes — the poster maker lets you brand it with your colors and logo." },
        { q: "Is it free?", a: "Yes, and there's no watermark on the printable poster." },
      ],
    },
  },
  {
    slug: "wedding-qr-code", toolHref: "/url-qr", toolLabel: "Create a wedding QR",
    category: "QR", emoji: "💍", grad: "linear-gradient(135deg,#fb7185,#f9a8d4)",
    keywords: ["wedding qr code", "qr code for wedding", "wedding rsvp qr", "photo sharing qr wedding", "wedding website qr"],
    content: {
      title: "Wedding QR Code — RSVP, Photos & Details in One Scan",
      metaDescription: "Create a wedding QR code linking to your RSVP, wedding website or shared photo album. Add it to invites and table cards. Free.",
      intro: "A wedding QR code points guests to whatever matters most — your RSVP form, wedding website, gift registry or a shared photo album. Add it to invitations, save-the-dates and table cards.",
      benefits: [
        "Guests reach your RSVP or website in one scan — fewer questions for you.",
        "Collect everyone's photos into one shared album with a scan.",
        "Beautiful with your colors, monogram or a logo.",
        "Free and unlimited for every part of the day.",
      ],
      steps: [
        { title: "Paste your link", desc: "RSVP form, wedding site, registry or shared album URL." },
        { title: "Make it match", desc: "Choose elegant colors and add a monogram or logo." },
        { title: "Download & print", desc: "Add it to invites, signs and table cards." },
      ],
      faqs: [
        { q: "Can one code do RSVP and photos?", a: "Point it at a simple landing page that links to both, or make a separate code for each — both are free." },
        { q: "Will it look elegant on an invitation?", a: "Yes — customise the colors and add a monogram so it fits your stationery." },
        { q: "Is it free?", a: "Completely free and watermark-free." },
      ],
    },
  },
  {
    slug: "product-packaging-qr-code", toolHref: "/url-qr", toolLabel: "Create a product QR",
    category: "QR", emoji: "📦", grad: "linear-gradient(135deg,#0e7490,#22d3ee)",
    keywords: ["product packaging qr code", "qr code on packaging", "product qr code", "qr for product info", "how to use qr"],
    content: {
      title: "QR Code for Product Packaging — Link to Info, Videos & Support",
      metaDescription: "Add a QR code to your packaging that opens instructions, how-to videos, warranty or reorder pages. Free, brandable, print-ready.",
      intro: "A packaging QR code turns a small printed square into a link to anything — setup guides, how-to videos, warranty registration or a reorder page. It saves box space and keeps content up to date.",
      benefits: [
        "Replace bulky inserts with a scannable link to instructions or videos.",
        "Update the destination without reprinting packaging.",
        "Drive reorders, registration and support in one scan.",
        "Export crisp SVG/PNG that prints sharp at any size.",
      ],
      steps: [
        { title: "Paste the destination link", desc: "Your instructions page, video, warranty or reorder URL." },
        { title: "Brand it", desc: "Match your packaging with colors and a logo." },
        { title: "Export for print", desc: "Download SVG for the sharpest print result." },
      ],
      faqs: [
        { q: "Will it stay sharp when printed small?", a: "Yes — export as SVG (vector) so it's crisp at any size, and keep good contrast." },
        { q: "Can I change where it points later?", a: "If it links to a page you control, edit that page — the printed code stays the same." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
  {
    slug: "event-qr-code", toolHref: "/qr-tools/event", toolLabel: "Create an event QR",
    category: "QR", emoji: "🎟️", grad: "linear-gradient(135deg,#6366f1,#a855f7)",
    keywords: ["event qr code", "qr code for events", "add to calendar qr", "event ticket qr", "conference qr code"],
    content: {
      title: "Event QR Code — Add to Calendar in One Scan",
      metaDescription: "Create an event QR code that saves the date, time and location to a guest's calendar instantly. Great for invites, posters and tickets. Free.",
      intro: "An event QR code lets people add your event to their calendar with a single scan — date, time, place and description included. Put it on invites, posters, tickets and email signatures.",
      benefits: [
        "Guests save the event to their calendar instantly — fewer no-shows.",
        "Perfect for conferences, meetups, weddings, webinars and pop-ups.",
        "Includes title, time, location and notes.",
        "Free and brandable for every event.",
      ],
      steps: [
        { title: "Enter event details", desc: "Title, start/end time, location and a short description." },
        { title: "Style it", desc: "Add colors and a logo to match the event." },
        { title: "Download & share", desc: "Add it to posters, invites and tickets." },
      ],
      faqs: [
        { q: "Which calendars does it work with?", a: "Scanning offers to add the event to the phone's default calendar (Apple, Google and others)." },
        { q: "Can I include a location and notes?", a: "Yes — title, start and end time, location and a description are all supported." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
  {
    slug: "compress-pdf-for-email", toolHref: "/pdf-tools/compress", toolLabel: "Compress a PDF",
    category: "PDF", emoji: "🗜️", grad: "linear-gradient(135deg,#ef4444,#f97316)",
    keywords: ["compress pdf for email", "reduce pdf size", "pdf too big for email", "shrink pdf", "compress pdf online"],
    content: {
      title: "Compress a PDF for Email — Get Under the Size Limit",
      metaDescription: "Shrink a PDF that's too big to email. Reduce the file size in your browser — no upload, no watermark. Free and private.",
      intro: "When a PDF is too large to email, compressing it reduces the file size while keeping it readable. QRix does this in your browser, so the document never leaves your device.",
      benefits: [
        "Get under Gmail/Outlook's 25 MB limit without splitting the file.",
        "Runs on your device — sensitive documents never upload.",
        "Keeps text sharp and readable at a much smaller size.",
        "Free, unlimited and watermark-free.",
      ],
      steps: [
        { title: "Drop your PDF", desc: "It opens locally — nothing is uploaded." },
        { title: "Choose a quality level", desc: "Balance size against quality for your needs." },
        { title: "Download", desc: "Save the smaller PDF and attach it to your email." },
      ],
      faqs: [
        { q: "Is my document uploaded to a server?", a: "No — compression happens entirely in your browser, so the file stays private." },
        { q: "Will the text still be readable?", a: "Yes — pick the balanced setting to keep text crisp while cutting size significantly." },
        { q: "Is there a file limit?", a: "Only your device's memory; typical documents compress comfortably." },
      ],
    },
  },
  {
    slug: "fill-and-sign-pdf", toolHref: "/pdf-tools/sign", toolLabel: "Sign a PDF",
    category: "PDF", emoji: "✍️", grad: "linear-gradient(135deg,#2563eb,#22d3ee)",
    keywords: ["fill and sign pdf", "sign pdf online free", "e-sign pdf", "add signature to pdf", "sign document online"],
    content: {
      title: "Fill and Sign a PDF Online — Free, No Account",
      metaDescription: "Add text and your signature to a PDF right in your browser. No upload, no signup, no watermark — sign and download in seconds.",
      intro: "Filling and signing a PDF lets you complete forms and add your signature without printing. QRix does it on your device, so private contracts and forms never leave your computer.",
      benefits: [
        "Sign contracts and forms without printing or scanning.",
        "Runs on your device — confidential documents stay private.",
        "Add typed text, dates and a drawn or uploaded signature.",
        "Free with no account and no watermark.",
      ],
      steps: [
        { title: "Open your PDF", desc: "It loads locally in your browser." },
        { title: "Add text and your signature", desc: "Place fields where you need them and sign." },
        { title: "Download", desc: "Save the signed PDF and send it on." },
      ],
      faqs: [
        { q: "Is my document safe?", a: "Yes — everything happens in your browser, so the file is never uploaded." },
        { q: "Can I draw my signature?", a: "Yes — draw it, type it, or upload an image of your signature." },
        { q: "Is it legally usable?", a: "A typed or drawn signature is widely accepted for everyday agreements; check local rules for formal contracts." },
      ],
    },
  },
  {
    slug: "remove-background-for-ecommerce", toolHref: "/image-tools/remove-bg", toolLabel: "Remove the background",
    category: "Image", emoji: "🪄", grad: "linear-gradient(135deg,#7c3aed,#d946ef)",
    keywords: ["remove background product photo", "white background product image", "ecommerce photo background", "transparent png product", "remove bg free"],
    content: {
      title: "Remove Image Background for Product Photos — Free & Clean",
      metaDescription: "Get clean, transparent or white-background product photos for Amazon, Shopify and Etsy. AI background removal in your browser — free, no watermark.",
      intro: "Marketplaces love clean product shots. Removing the background gives you a transparent PNG or a crisp white backdrop that meets Amazon, Shopify and Etsy requirements — all in your browser.",
      benefits: [
        "Meet marketplace rules for clean, distraction-free product images.",
        "Get a transparent PNG or drop in a pure white background.",
        "AI cutout handles tricky edges automatically.",
        "Free, unlimited and watermark-free.",
      ],
      steps: [
        { title: "Upload your product photo", desc: "It's processed on your device." },
        { title: "Let the AI cut it out", desc: "The background is removed automatically." },
        { title: "Download", desc: "Save a transparent PNG or add a white background." },
      ],
      faqs: [
        { q: "Does it meet Amazon's white-background rule?", a: "Yes — remove the background, then place the subject on pure white and export." },
        { q: "Are my photos uploaded?", a: "The on-device engine processes locally; nothing is uploaded unless you opt into a cloud engine." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
  {
    slug: "resize-image-for-instagram", toolHref: "/image-tools/resize", toolLabel: "Resize an image",
    category: "Image", emoji: "📐", grad: "linear-gradient(135deg,#0891b2,#34d399)",
    keywords: ["resize image for instagram", "instagram size image", "1080x1080 image", "instagram post size", "resize photo online"],
    content: {
      title: "Resize an Image for Instagram — Exact Post & Story Sizes",
      metaDescription: "Resize photos to the perfect Instagram size — 1080×1080 posts, 1080×1920 stories and reels — without losing quality. Free, in your browser.",
      intro: "Instagram crops and compresses images that aren't the right size. Resizing to the exact dimensions keeps your posts and stories sharp and correctly framed — done entirely in your browser.",
      benefits: [
        "Hit the exact sizes: 1080×1080 posts, 1080×1350 portrait, 1080×1920 stories/reels.",
        "Avoid Instagram's automatic cropping and quality loss.",
        "Runs on your device — photos stay private.",
        "Free and unlimited.",
      ],
      steps: [
        { title: "Upload your image", desc: "It opens locally in your browser." },
        { title: "Pick the Instagram size", desc: "Choose post, portrait or story dimensions." },
        { title: "Download", desc: "Save the perfectly-sized image and post it." },
      ],
      faqs: [
        { q: "What size is an Instagram post?", a: "1080×1080 for square, 1080×1350 for portrait, and 1080×1920 for stories and reels." },
        { q: "Will resizing blur my photo?", a: "No — resizing to Instagram's native size actually avoids the blur that comes from Instagram resizing it for you." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
  {
    slug: "compress-video-for-whatsapp", toolHref: "/video-tools/compress-video", toolLabel: "Compress a video",
    category: "Video", emoji: "🎬", grad: "linear-gradient(135deg,#16a34a,#22d3ee)",
    keywords: ["compress video for whatsapp", "reduce video size whatsapp", "send large video whatsapp", "shrink video", "compress video online"],
    content: {
      title: "Compress a Video for WhatsApp — Send It Without the Limit",
      metaDescription: "Shrink a video so it sends on WhatsApp or Telegram. Real in-browser compression — no upload, no watermark. Free and private.",
      intro: "WhatsApp caps video sizes and heavily compresses what you send. Compressing first — to a smaller, share-friendly size — keeps quality in your control and gets big clips under the limit, all on your device.",
      benefits: [
        "Get long or high-resolution clips under WhatsApp/Telegram limits.",
        "Real transcoding on your device — nothing uploads.",
        "Choose the quality-vs-size balance yourself.",
        "Free, unlimited and watermark-free.",
      ],
      steps: [
        { title: "Drop your video", desc: "It opens locally — nothing is uploaded." },
        { title: "Pick a quality/size", desc: "720p is the sweet spot for chat apps." },
        { title: "Download & send", desc: "Save the smaller file and share it." },
      ],
      faqs: [
        { q: "Is my video uploaded anywhere?", a: "No — compression runs in your browser using your device's built-in video engine." },
        { q: "What size should I aim for?", a: "720p at a moderate bitrate is sharp on phones and small enough to send easily." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
  {
    slug: "video-to-gif-for-chat", toolHref: "/video-tools/create-gif", toolLabel: "Make a GIF",
    category: "Video", emoji: "✨", grad: "linear-gradient(135deg,#a855f7,#f472b6)",
    keywords: ["video to gif", "make gif from video", "gif for chat", "convert video to gif", "gif maker free"],
    content: {
      title: "Turn a Video into a GIF — Free Looping GIF Maker",
      metaDescription: "Make a looping GIF from any video moment for chats, docs and social. Pick the clip and size, export — no upload, no watermark. Free.",
      intro: "GIFs loop, autoplay everywhere and need no player, which makes them perfect for chats, pull requests and docs. Turn the best few seconds of a video into a share-ready GIF in your browser.",
      benefits: [
        "Loops and autoplays in chats, docs and issues — no player needed.",
        "Trim to the exact moment and set the width to keep it small.",
        "Runs on your device — nothing uploads.",
        "Free, unlimited and watermark-free.",
      ],
      steps: [
        { title: "Drop your video", desc: "It decodes locally in your browser." },
        { title: "Pick the clip and size", desc: "Set start/end and output width." },
        { title: "Export the GIF", desc: "Download and drop it into any chat." },
      ],
      faqs: [
        { q: "Why is my GIF larger than the video?", a: "GIF is an old format without modern compression — keep the clip short and the width modest to stay small." },
        { q: "Is anything uploaded?", a: "No — decoding and encoding both happen in your browser." },
        { q: "Is it free?", a: "Yes, unlimited and watermark-free." },
      ],
    },
  },
];

// Localized content per slug (ru/uz), generated into usecase-content.i18n.ts.
export type LocalizedContent = UseCaseContent & { keywords?: string[] };
export type UseCaseI18n = Record<string, Partial<Record<Lang, LocalizedContent>>>;

export const USE_CASE_SLUGS: string[] = USE_CASES_EN.map((u) => u.slug);

export function getUseCase(slug: string): UseCaseSeed | undefined {
  return USE_CASES_EN.find((u) => u.slug === slug);
}

/** Content for a use-case in the requested language (falls back to English). */
export function localizedContent(u: UseCaseSeed, lang: Lang): UseCaseContent {
  if (lang === "en") return u.content;
  return USE_CASE_I18N[u.slug]?.[lang] ?? u.content;
}

export function localizedKeywords(u: UseCaseSeed, lang: Lang): string[] {
  if (lang === "en") return u.keywords;
  return USE_CASE_I18N[u.slug]?.[lang]?.keywords ?? u.keywords;
}

/** True when a real (non-fallback) translation exists — used to gate hreflang. */
export function hasTranslation(slug: string, lang: Lang): boolean {
  return lang === "en" || !!USE_CASE_I18N[slug]?.[lang];
}
