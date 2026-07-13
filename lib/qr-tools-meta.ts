import { QR_CONTENT } from "./qr-tool-content";

export type QrMeta = {
  slug: string;       // URL: /qr-tools/<slug>
  typeId: string;     // QR_TYPES key
  title: string;
  desc: string;       // короткое описание для карты
  info: string;       // подробнее для карты
  about: string;      // на странице инструмента
  emoji: string;
  grad: string;
  popularity: number;
  badge?: string;
  steps: { title: string; desc: string }[];
  faqs?: { q: string; a: string }[];
  useCases?: string[];
};

export const QR_TOOLS: QrMeta[] = [
  {
    slug: "url", typeId: "url", title: "URL QR Code", desc: "Create a QR for any website link.",
    info: "The most popular QR type — point your camera and open a website instantly. Great for marketing, menus and business cards.",
    about: "A URL QR code stores a web address. When scanned, the phone's camera opens the link directly in the browser. It's perfect for linking print materials, posters, packaging or business cards to your website, landing page or online store.",
    emoji: "🔗", grad: "linear-gradient(135deg,#4f46e5,#3b82f6)", popularity: 100,
    steps: [
      { title: "Enter your URL", desc: "Paste the full website address starting with https://." },
      { title: "Customize (optional)", desc: "Change colors, add a logo, pick a size in the design studio." },
      { title: "Download", desc: "Save as PNG or SVG and use it anywhere." },
    ],
  },
  {
    slug: "text", typeId: "text", title: "Text QR Code", desc: "Encode any plain text.",
    info: "Show a message, note or code when scanned — no internet needed. Useful for instructions, serial numbers or short notes.",
    about: "A text QR code stores plain text that appears on the scanner's screen. No website is opened. Use it for short messages, product details, instructions, Wi-Fi passwords written as text, or any information you want available offline.",
    emoji: "📝", grad: "linear-gradient(135deg,#64748b,#94a3b8)", popularity: 70,
    steps: [
      { title: "Type your text", desc: "Enter any message you want the QR to display." },
      { title: "Design it", desc: "Optionally style the QR with colors and a logo." },
      { title: "Download & share", desc: "Save and print or send the QR." },
    ],
  },
  {
    slug: "email", typeId: "email", title: "Email QR Code", desc: "Pre-filled email message.",
    info: "Scanning opens the mail app with the recipient, subject and body already filled in. Perfect for support or contact.",
    about: "An email QR code opens the user's email app with a new message pre-filled — recipient, subject and body all ready. The user just taps send. Ideal for customer support, feedback forms, or making it effortless for people to contact you.",
    emoji: "📧", grad: "linear-gradient(135deg,#db2777,#f472b6)", popularity: 80, badge: "Popular",
    steps: [
      { title: "Fill the fields", desc: "Add recipient email, subject and message." },
      { title: "Customize", desc: "Style the QR to match your brand." },
      { title: "Download", desc: "Save and place it where people can scan." },
    ],
  },
  {
    slug: "phone", typeId: "phone", title: "Phone QR Code", desc: "Tap to call a number.",
    info: "Scanning starts a phone call to your number instantly — great for ads, signs and quick contact.",
    about: "A phone QR code stores a telephone number. When scanned, the phone app opens with the number ready to dial. Perfect for billboards, flyers, store windows or anywhere you want people to call you with a single tap.",
    emoji: "📞", grad: "linear-gradient(135deg,#16a34a,#4ade80)", popularity: 65,
    steps: [
      { title: "Enter the number", desc: "Type the full phone number with country code." },
      { title: "Style it", desc: "Optionally customize colors and logo." },
      { title: "Download", desc: "Save and display the QR." },
    ],
  },
  {
    slug: "sms", typeId: "sms", title: "SMS QR Code", desc: "Pre-filled text message.",
    info: "Opens the messaging app with your number and message ready to send. Great for campaigns and quick replies.",
    about: "An SMS QR code opens the messaging app with a phone number and a pre-written message. The user just hits send. Useful for marketing campaigns (\"text to subscribe\"), feedback, or quick contact.",
    emoji: "💬", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)", popularity: 60,
    steps: [
      { title: "Add number & message", desc: "Enter the phone number and the message text." },
      { title: "Customize", desc: "Style the QR if you like." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "wifi", typeId: "wifi", title: "WiFi QR Code", desc: "Instant WiFi connection.",
    info: "Guests scan and connect to your WiFi automatically — no typing passwords. Perfect for cafés, hotels and offices.",
    about: "A WiFi QR code stores your network name, password and encryption type. When scanned, the phone connects to the WiFi automatically without typing anything. Ideal for cafés, restaurants, hotels, offices and homes — print it and let guests connect instantly.",
    emoji: "📶", grad: "linear-gradient(135deg,#0891b2,#22d3ee)", popularity: 95, badge: "Popular",
    steps: [
      { title: "Enter WiFi details", desc: "Add network name (SSID), password and encryption." },
      { title: "Customize", desc: "Style the QR to match your space." },
      { title: "Print & display", desc: "Place it where guests can scan to connect." },
    ],
  },
  {
    slug: "whatsapp", typeId: "whatsapp", title: "WhatsApp QR Code", desc: "Open a WhatsApp chat.",
    info: "Scanning opens a WhatsApp chat with you, optionally with a pre-filled message. Great for support and sales.",
    about: "A WhatsApp QR code opens a chat with your number directly in WhatsApp, optionally with a pre-written message. Perfect for customer support, sales inquiries or letting customers reach you instantly without saving your number.",
    emoji: "🟢", grad: "linear-gradient(135deg,#16a34a,#86efac)", popularity: 90, badge: "Popular",
    steps: [
      { title: "Enter your number", desc: "Add your WhatsApp number with country code." },
      { title: "Add a message", desc: "Optionally pre-fill a greeting message." },
      { title: "Download", desc: "Save and share the QR." },
    ],
  },
  {
    slug: "telegram", typeId: "telegram", title: "Telegram QR Code", desc: "Open a Telegram profile/channel.",
    info: "Scanning opens your Telegram profile, channel or bot. Great for growing your audience.",
    about: "A Telegram QR code links to your username, channel or bot. When scanned, Telegram opens the profile directly. Perfect for growing channel subscribers, sharing your contact or promoting a bot.",
    emoji: "✈️", grad: "linear-gradient(135deg,#0284c7,#38bdf8)", popularity: 85,
    steps: [
      { title: "Enter username", desc: "Add your Telegram username without the @." },
      { title: "Customize", desc: "Style the QR if you like." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "instagram", typeId: "instagram", title: "Instagram QR Code", desc: "Open your Instagram profile.",
    info: "Scanning opens your Instagram profile so people can follow you instantly.",
    about: "An Instagram QR code links directly to your profile. When scanned, Instagram opens your page so people can follow you with one tap. Great for growing followers from print, packaging or in-store displays.",
    emoji: "📷", grad: "linear-gradient(135deg,#db2777,#f59e0b)", popularity: 78,
    steps: [
      { title: "Enter username", desc: "Add your Instagram handle without the @." },
      { title: "Customize", desc: "Match your brand colors." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "facebook", typeId: "facebook", title: "Facebook QR Code", desc: "Open your Facebook page.",
    info: "Scanning opens your Facebook page or profile for instant likes and follows.",
    about: "A Facebook QR code links to your page or profile. Scanning opens it directly in the browser or Facebook app — perfect for driving likes, follows and engagement from offline materials.",
    emoji: "👤", grad: "linear-gradient(135deg,#1d4ed8,#3b82f6)", popularity: 55,
    steps: [
      { title: "Enter page URL", desc: "Paste your Facebook page link or username." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "twitter", typeId: "twitter", title: "X (Twitter) QR Code", desc: "Open your X profile.",
    info: "Scanning opens your X (Twitter) profile so people can follow you.",
    about: "An X (Twitter) QR code links to your profile. When scanned, it opens your page so people can follow you instantly. Great for events, business cards and presentations.",
    emoji: "🐦", grad: "linear-gradient(135deg,#0f172a,#475569)", popularity: 50,
    steps: [
      { title: "Enter username", desc: "Add your X handle without the @." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "youtube", typeId: "youtube", title: "YouTube QR Code", desc: "Open a video or channel.",
    info: "Scanning opens your YouTube video or channel directly. Great for promotions and subscriptions.",
    about: "A YouTube QR code links to a video or channel. Scanning opens it in the YouTube app or browser — perfect for driving views, subscriptions and engagement from print and packaging.",
    emoji: "▶️", grad: "linear-gradient(135deg,#dc2626,#f87171)", popularity: 72,
    steps: [
      { title: "Paste the link", desc: "Add a YouTube video or channel URL." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "tiktok", typeId: "tiktok", title: "TikTok QR Code", desc: "Open your TikTok profile.",
    info: "Scanning opens your TikTok profile for instant follows.",
    about: "A TikTok QR code links to your profile. Scanning opens your page so people can follow you with one tap. Perfect for growing your TikTok audience from offline channels.",
    emoji: "🎵", grad: "linear-gradient(135deg,#0f172a,#22d3ee)", popularity: 68,
    steps: [
      { title: "Enter username", desc: "Add your TikTok handle without the @." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "linkedin", typeId: "linkedin", title: "LinkedIn QR Code", desc: "Open your LinkedIn profile.",
    info: "Scanning opens your LinkedIn profile — perfect for networking and business cards.",
    about: "A LinkedIn QR code links to your professional profile. Scanning opens it directly — ideal for networking events, business cards and conferences where you want to connect quickly.",
    emoji: "💼", grad: "linear-gradient(135deg,#0369a1,#0ea5e9)", popularity: 62,
    steps: [
      { title: "Paste profile URL", desc: "Add your LinkedIn profile link." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "vcard", typeId: "vcard", title: "vCard QR Code", desc: "Digital business card.",
    info: "Scanning saves your full contact details — name, phone, email, company — to the phone instantly.",
    about: "A vCard QR code is a complete digital business card. When scanned, all your contact details (name, phone, email, company, title, website, address) can be saved to the phone's contacts in one tap. The most professional way to share your info at meetings and events.",
    emoji: "🪪", grad: "linear-gradient(135deg,#d97706,#fbbf24)", popularity: 88, badge: "Popular",
    steps: [
      { title: "Fill your details", desc: "Add your name, phone, email, company and more." },
      { title: "Customize", desc: "Add your logo and brand colors." },
      { title: "Download", desc: "Save and add to your card or signature." },
    ],
  },
  {
    slug: "mecard", typeId: "mecard", title: "MeCard QR Code", desc: "Simple contact card.",
    info: "A lighter contact card format that saves name, phone and email — widely supported on older phones.",
    about: "MeCard is a compact contact format similar to vCard but smaller, making the QR easier to scan. It saves name, phone and email to contacts. Use it when you want a simple, reliable contact QR.",
    emoji: "📇", grad: "linear-gradient(135deg,#ca8a04,#facc15)", popularity: 40,
    steps: [
      { title: "Add contact info", desc: "Enter name, phone and email." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "event", typeId: "event", title: "Event QR Code", desc: "Add an event to calendar.",
    info: "Scanning adds your event — title, location, date and time — straight to the phone's calendar.",
    about: "An event QR code stores calendar event details. When scanned, the phone offers to add the event (title, location, start and end time) to the calendar. Perfect for invitations, conferences, weddings and meetings.",
    emoji: "📅", grad: "linear-gradient(135deg,#7c3aed,#c084fc)", popularity: 58,
    steps: [
      { title: "Enter event details", desc: "Add title, location, start and end time." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and add to invitations." },
    ],
  },
  {
    slug: "geo", typeId: "geo", title: "Location QR Code", desc: "Open exact GPS coordinates.",
    info: "Scanning opens the exact GPS point on a map. Great for precise locations like venues or pins.",
    about: "A location QR code stores GPS coordinates (latitude and longitude). Scanning opens the exact point on the phone's map app. Ideal for marking a specific spot — an event venue, a property, a meeting point.",
    emoji: "📍", grad: "linear-gradient(135deg,#059669,#34d399)", popularity: 52,
    steps: [
      { title: "Enter coordinates", desc: "Add latitude and longitude." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "maps", typeId: "maps", title: "Google Maps QR Code", desc: "Open a place on Google Maps.",
    info: "Scanning searches a place or address on Google Maps. Easier than coordinates for named locations.",
    about: "A Google Maps QR code opens a place or address search in Google Maps. Easier than GPS coordinates when you have a named location — your store, restaurant or office. Great for directions on flyers and signs.",
    emoji: "🗺️", grad: "linear-gradient(135deg,#16a34a,#84cc16)", popularity: 60,
    steps: [
      { title: "Enter place/address", desc: "Type the location name or full address." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "paypal", typeId: "paypal", title: "PayPal QR Code", desc: "Get paid via PayPal.me.",
    info: "Scanning opens your PayPal.me link, optionally with a set amount. Great for tips, donations and sales.",
    about: "A PayPal QR code links to your PayPal.me page, optionally with a preset amount. Scanning lets people pay or tip you instantly. Perfect for freelancers, donations, small businesses and creators.",
    emoji: "💰", grad: "linear-gradient(135deg,#1d4ed8,#0ea5e9)", popularity: 54,
    steps: [
      { title: "Enter PayPal.me username", desc: "Add your username and an optional amount." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "bitcoin", typeId: "bitcoin", title: "Bitcoin QR Code", desc: "Receive Bitcoin payments.",
    info: "Scanning opens a crypto wallet with your Bitcoin address and amount ready. Standard for crypto payments.",
    about: "A Bitcoin QR code stores your wallet address and an optional amount. Scanning opens the user's crypto wallet ready to send. The standard, error-free way to receive Bitcoin payments without typing long addresses.",
    emoji: "₿", grad: "linear-gradient(135deg,#ea580c,#fbbf24)", popularity: 48,
    steps: [
      { title: "Enter wallet address", desc: "Paste your Bitcoin address and optional amount." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "crypto", typeId: "crypto", title: "Crypto QR Code", desc: "Receive ETH, LTC, DOGE.",
    info: "Scanning opens a wallet for Ethereum, Litecoin or Dogecoin payments to your address.",
    about: "A crypto QR code supports Ethereum, Litecoin and Dogecoin. It stores your wallet address so scanning opens the user's wallet ready to send. The safe way to receive crypto without address typos.",
    emoji: "🪙", grad: "linear-gradient(135deg,#6366f1,#a78bfa)", popularity: 44,
    steps: [
      { title: "Pick coin & address", desc: "Choose the coin and paste your wallet address." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "appstore", typeId: "appstore", title: "App Store QR Code", desc: "Link to your app.",
    info: "Scanning opens your app's App Store or Play Store page for instant downloads.",
    about: "An App Store QR code links to your app's download page. Scanning opens the App Store or Google Play directly — perfect for promoting app downloads from print, packaging and ads.",
    emoji: "📱", grad: "linear-gradient(135deg,#0891b2,#38bdf8)", popularity: 56,
    steps: [
      { title: "Paste store URL", desc: "Add your App Store or Play Store link." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "spotify", typeId: "spotify", title: "Spotify QR Code", desc: "Open a track or playlist.",
    info: "Scanning opens your Spotify track, album or playlist. Great for artists and events.",
    about: "A Spotify QR code links to a track, album or playlist. Scanning opens it in Spotify — perfect for artists promoting music, events sharing playlists, or businesses setting the mood.",
    emoji: "🎧", grad: "linear-gradient(135deg,#16a34a,#4ade80)", popularity: 50,
    steps: [
      { title: "Paste Spotify URL", desc: "Add a track, album or playlist link." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "zoom", typeId: "zoom", title: "Zoom QR Code", desc: "Join a Zoom meeting.",
    info: "Scanning opens your Zoom meeting link instantly. Great for hybrid events and offices.",
    about: "A Zoom QR code links to a meeting. Scanning opens the Zoom app and joins the meeting — ideal for hybrid events, classrooms and offices where you want easy one-tap joining.",
    emoji: "🎥", grad: "linear-gradient(135deg,#2563eb,#60a5fa)", popularity: 42,
    steps: [
      { title: "Paste meeting URL", desc: "Add your Zoom meeting link." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "skype", typeId: "skype", title: "Skype QR Code", desc: "Start a Skype call.",
    info: "Scanning starts a Skype call to your username. Useful for support and international contact.",
    about: "A Skype QR code stores your username. Scanning starts a Skype call to you — handy for international contact, support lines and remote teams.",
    emoji: "📲", grad: "linear-gradient(135deg,#0284c7,#7dd3fc)", popularity: 30,
    steps: [
      { title: "Enter username", desc: "Add your Skype username." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "facetime", typeId: "facetime", title: "FaceTime QR Code", desc: "Start a FaceTime call.",
    info: "Scanning starts a FaceTime call to your number or Apple ID (Apple devices).",
    about: "A FaceTime QR code stores a phone number or Apple ID. On Apple devices, scanning starts a FaceTime call. Great for Apple-using teams, support and personal contact.",
    emoji: "🍏", grad: "linear-gradient(135deg,#16a34a,#86efac)", popularity: 28,
    steps: [
      { title: "Enter contact", desc: "Add a phone number or Apple ID email." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "pdf", typeId: "pdf", title: "PDF QR Code", desc: "Link to a PDF document.",
    info: "Scanning opens your hosted PDF — menus, brochures, manuals, guides.",
    about: "A PDF QR code links to a PDF file hosted online. Scanning opens the document — perfect for digital menus, brochures, instruction manuals, price lists and event programs. Upload your PDF somewhere first, then use its link.",
    emoji: "📄", grad: "linear-gradient(135deg,#dc2626,#f97316)", popularity: 64,
    steps: [
      { title: "Paste PDF URL", desc: "Add the link to your hosted PDF file." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "app", typeId: "app", title: "Link / App QR Code", desc: "Any custom link.",
    info: "A flexible QR for any URL — landing pages, forms, link-in-bio, deep links and more.",
    about: "A flexible link QR code works with any URL — landing pages, Google Forms, link-in-bio pages, app deep links, or anything else. The Swiss-army-knife QR when you just need a clean link.",
    emoji: "🌐", grad: "linear-gradient(135deg,#9333ea,#d946ef)", popularity: 66,
    steps: [
      { title: "Paste any link", desc: "Add the URL you want to share." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Download", desc: "Save and share." },
    ],
  },
  {
    slug: "wifi-guest", typeId: "wifiGuest", title: "Guest WiFi QR Code", desc: "Quick guest WiFi access.",
    info: "A simplified WiFi QR for guest networks — quick to set up for events and short-term guests.",
    about: "A guest WiFi QR code is a streamlined version for sharing a guest network. Enter the name and password, and visitors connect by scanning — ideal for parties, short-term rentals and pop-up events.",
    emoji: "🛜", grad: "linear-gradient(135deg,#0d9488,#2dd4bf)", popularity: 46,
    steps: [
      { title: "Enter guest WiFi", desc: "Add the guest network name and password." },
      { title: "Customize", desc: "Style the QR." },
      { title: "Print & display", desc: "Place it where guests can scan." },
    ],
  },
];

// Attach per-tool FAQ + use-case content (SEO + landing-page sections).
for (const t of QR_TOOLS) {
  const c = QR_CONTENT[t.slug];
  if (c) { t.faqs = c.faqs; t.useCases = c.useCases; }
}

export const getQrTool = (slug: string) => QR_TOOLS.find((t) => t.slug === slug);
