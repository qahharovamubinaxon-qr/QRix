/* Social / video platforms QRix's downloader supports. Each has brand colour,
   the hostnames that identify it from a pasted link, and a compact brand SVG
   (simplified marks — recognisable, self-contained, no external assets).

   NOTE: YouTube is deliberately ABSENT. Google owns YouTube and AdSense policy
   forbids YouTube-downloader pages; adding it risks the whole AdSense account,
   so it stays out of this feature. */

export type Platform = {
  id: string;
  name: string;
  color: string;      // brand accent
  domains: string[];  // hostname fragments that map a URL to this platform
  kinds: ("video" | "audio" | "image")[]; // what it can yield
  svg: string;        // inline brand mark, drawn on `currentColor`-agnostic fills
};

/* Simplified brand marks — 24×24 viewBox, filled with each brand's own colours
   so the row reads like the real logos. Kept terse on purpose. */
export const PLATFORMS: Platform[] = [
  { id: "tiktok", name: "TikTok", color: "#ff0050", domains: ["tiktok.com", "vt.tiktok", "vm.tiktok"], kinds: ["video", "audio"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="#25F4EE" d="M16.5 6.9c-.2 1 .1 1.9.7 2.6-1-.1-1.9-.5-2.6-1.2v6.2a4.6 4.6 0 1 1-4.6-4.6c.3 0 .5 0 .8.1v2.4a2.2 2.2 0 1 0 1.5 2.1V3.5h2.3c.2 1.6 1.3 2.9 2.8 3.2 0 .1-.9.1-.9.2z"/><path fill="#FE2C55" d="M17.4 7.1c-1.5-.3-2.6-1.6-2.8-3.2h-.6c.3 1.9 1.7 3.4 3.5 3.7 0-.2-.1-.3-.1-.5z"/><path fill="#000" d="M10.7 9.9v-.2c-.3-.1-.5-.1-.8-.1a4.6 4.6 0 1 0 4.6 4.6V8c.7.7 1.6 1.1 2.6 1.2a3.4 3.4 0 0 1-.7-.1v2.4a4.6 4.6 0 0 1-2.6-.8v3.5a4.6 4.6 0 1 1-4.6-4.6c.7 0 1.1.1 1.5.3z" opacity=".0"/></svg>` },
  { id: "instagram", name: "Instagram", color: "#e1306c", domains: ["instagram.com", "instagr.am"], kinds: ["video", "image", "audio"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="#fff"/></svg>` },
  { id: "facebook", name: "Facebook", color: "#1877f2", domains: ["facebook.com", "fb.watch", "fb.com"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2"/><path fill="#fff" d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.5c0-.8.2-1.3 1.4-1.3H16V5.8c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.2V14h2.4v7z"/></svg>` },
  { id: "twitter", name: "X / Twitter", color: "#000000", domains: ["twitter.com", "x.com", "t.co"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#000"/><path fill="#fff" d="M15.9 6h1.9l-4.1 4.7 4.9 6.3h-3.8l-3-3.9-3.4 3.9H4.5l4.4-5-4.7-6h3.9l2.7 3.6zm-.7 9.9h1L8.9 7H7.8z"/></svg>` },
  { id: "vk", name: "VK", color: "#0077ff", domains: ["vk.com", "vkvideo.ru", "vk.ru"], kinds: ["video", "audio", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#0077FF"/><path fill="#fff" d="M12.7 16c-4.2 0-6.9-2.9-7-7.6h2.1c.1 3.5 1.7 5 3 5.3V8.4h2v3c1.3-.1 2.6-1.6 3.1-3h2c-.3 1.7-1.5 3.1-2.4 3.7 .9.5 2.3 1.8 2.8 3.9h-2.2c-.4-1.4-1.6-2.5-3.3-2.6V16z"/></svg>` },
  { id: "ok", name: "Odnoklassniki", color: "#ee8208", domains: ["ok.ru", "odnoklassniki.ru"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#EE8208"/><path fill="#fff" d="M12 5.4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 1.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM9 12.4c-.3.5-.1 1.1.4 1.4.6.4 1.2.6 1.9.7l-2 2a1 1 0 0 0 1.4 1.4l1.3-1.3 1.3 1.3a1 1 0 0 0 1.4-1.4l-2-2c.7-.1 1.3-.3 1.9-.7.5-.3.7-.9.4-1.4-.3-.5-.9-.6-1.4-.4-1 .6-2.3.6-3.3 0-.5-.2-1.1-.1-1.4.4z"/></svg>` },
  { id: "pinterest", name: "Pinterest", color: "#e60023", domains: ["pinterest.com", "pin.it", "pinterest."], kinds: ["image", "video"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="10" fill="#E60023"/><path fill="#fff" d="M12.3 5.8c-3.4 0-5.2 2.3-5.2 4.6 0 1.1.6 2.4 1.6 2.8.1.1.2 0 .3-.1l.2-.9c0-.1 0-.2-.1-.3-.4-.5-.6-1-.6-1.6 0-1.9 1.4-3.5 3.8-3.5 2 0 3.3 1.2 3.3 3 0 2.3-1 4.2-2.5 4.2-.8 0-1.4-.7-1.2-1.5.2-1 .7-2 .7-2.7 0-.6-.3-1.1-1-1.1-.8 0-1.4.8-1.4 1.9 0 .7.2 1.1.2 1.1l-1 4c-.2 1-.1 2.3 0 2.4 0 .1.1.1.2 0 .1-.1.9-1.3 1.2-2.4l.4-1.6c.3.5 1 .9 1.8.9 2.4 0 4-2.2 4-5.1 0-2.2-1.9-4.5-4.7-4.5z"/></svg>` },
  { id: "reddit", name: "Reddit", color: "#ff4500", domains: ["reddit.com", "redd.it"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="10" fill="#FF4500"/><circle cx="8.5" cy="12.5" r="1" fill="#fff"/><circle cx="15.5" cy="12.5" r="1" fill="#fff"/><path fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" d="M9.3 15c1.5 1 3.9 1 5.4 0"/><circle cx="18" cy="8.5" r="1.4" fill="#fff"/><path fill="none" stroke="#fff" stroke-width="1" d="M18 8.5l-2.8 1.2"/></svg>` },
  { id: "snapchat", name: "Snapchat", color: "#fffc00", domains: ["snapchat.com", "t.snapchat"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#FFFC00"/><path fill="#fff" stroke="#111" stroke-width=".4" d="M12 5.6c1.8 0 3 1.4 3 3.3 0 .6-.1 1.2 0 1.4.2.3.9.2 1.3.4.3.2.2.6-.1.8-.4.2-1.3.3-1.5.8-.1.3.4.9 1.1 1.4.6.4 1.3.6 1.3 1 0 .3-.5.5-1 .6-.3 0-.4.1-.5.4-.1.4-.1.7-.5.7-.4 0-.9-.3-1.6-.2-.7.1-1.2.9-2.3.9s-1.6-.8-2.3-.9c-.7-.1-1.2.2-1.6.2-.4 0-.4-.3-.5-.7 0-.3-.2-.4-.5-.4-.5-.1-1-.3-1-.6 0-.4.7-.6 1.3-1 .7-.5 1.2-1.1 1.1-1.4-.2-.5-1.1-.6-1.5-.8-.3-.2-.4-.6-.1-.8.4-.2 1.1-.1 1.3-.4.1-.2 0-.8 0-1.4 0-1.9 1.2-3.3 3-3.3z"/></svg>` },
  { id: "vimeo", name: "Vimeo", color: "#1ab7ea", domains: ["vimeo.com"], kinds: ["video", "audio"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#1AB7EA"/><path fill="#fff" d="M18 8.9c-.1 1.6-1.2 3.7-3.3 6.4-2.2 2.8-4 4.2-5.5 4.2-.9 0-1.7-.9-2.3-2.6l-1.3-4.6c-.5-1.7-1-2.6-1.5-2.6-.1 0-.5.3-1.2.8l-.7-.9c.8-.7 1.5-1.3 2.3-2 1-.8 1.8-1.2 2.3-1.3 1.2-.1 2 .7 2.2 2.5.3 1.9.5 3.1.6 3.5.4 1.6.7 2.4 1.2 2.4.3 0 .8-.5 1.5-1.6.7-1 1-1.8 1.1-2.4.1-.9-.3-1.3-1-1.3-.4 0-.7.1-1.1.2.7-2.3 2-3.4 4-3.4 1.5.1 2.2 1 2.2 2.6z"/></svg>` },
  { id: "soundcloud", name: "SoundCloud", color: "#ff5500", domains: ["soundcloud.com", "snd.sc"], kinds: ["audio"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#FF5500"/><path fill="#fff" d="M6 12.5v3h.9v-3zm1.6-.8v3.8h.9v-3.8zm1.6-.6v4.4h.9v-4.4zm1.6.3v4.1h.9v-4.1zm1.7-1.7c-.3 0-.5 0-.8.2v5.6h4.3c1 0 1.9-.8 1.9-1.9s-.8-1.9-1.9-1.9c-.2 0-.4 0-.6.1-.2-1.4-1.4-2.5-2.8-2.5v.3z"/></svg>` },
  { id: "twitch", name: "Twitch", color: "#9146ff", domains: ["twitch.tv", "clips.twitch"], kinds: ["video"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#9146FF"/><path fill="#fff" d="M7 6h10v6l-2.5 2.5H12l-2 2v-2H7zm1.5 1.5v5H10v1.5l1.5-1.5h2l1.5-1.5v-3.5zm4.8 1.2h1.2v2.4h-1.2zm-2.6 0h1.2v2.4h-1.2z"/></svg>` },
  { id: "dailymotion", name: "Dailymotion", color: "#0064dc", domains: ["dailymotion.com", "dai.ly"], kinds: ["video"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#0A0A32"/><path fill="#0ED3B5" d="M15 5.5h2v13h-2v-1.1c-.6.9-1.6 1.4-2.9 1.4-2.6 0-4.6-2.1-4.6-4.9s2-4.9 4.6-4.9c1.2 0 2.2.5 2.9 1.3zm-2.6 4.7a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z"/></svg>` },
  { id: "threads", name: "Threads", color: "#000000", domains: ["threads.net", "threads.com"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#000"/><path fill="none" stroke="#fff" stroke-width="1.6" d="M8 8.5c1-1.6 2.5-2.3 4-2.3 2.6 0 4 2 4 5.5s-1.2 6-4.4 6c-2 0-3.2-1.2-3.2-2.7 0-1.4 1.2-2.3 2.8-2.3 2 0 3 1.3 3 3.3"/></svg>` },
  { id: "tumblr", name: "Tumblr", color: "#36465d", domains: ["tumblr.com"], kinds: ["video", "image"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="6" fill="#36465D"/><path fill="#fff" d="M13.2 18c-2 0-3.4-1-3.4-3.5v-3.6H8.4V9c1.6-.4 2.3-1.8 2.4-3h1.7v2.7h2v2.2h-2v3.2c0 .8.4 1.1 1.1 1.1h1v2.4c-.3.2-1 .4-1.4.4z"/></svg>` },
  { id: "bilibili", name: "Bilibili", color: "#00a1d6", domains: ["bilibili.com", "b23.tv"], kinds: ["video", "audio"],
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="4" width="20" height="16" rx="4" fill="#00A1D6"/><path fill="#fff" d="M8 2.6l2.2 2H14l2.2-2 .9 1-1 1H17a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9.6a3 3 0 0 1 3-3h.9l-1-1zM7 9.4a.9.9 0 0 0-.9.9v5a.9.9 0 0 0 .9.9h10a.9.9 0 0 0 .9-.9v-5a.9.9 0 0 0-.9-.9zm2 2.1 .001 1.6H8V11.5zm7 0v1.6h-1V11.5z"/></svg>` },
];

/** Resolve a pasted URL to a supported platform (or null). */
export function detectPlatform(raw: string): Platform | null {
  let host = "";
  try { host = new URL(raw.trim()).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
  return PLATFORMS.find((p) => p.domains.some((d) => host.includes(d))) || null;
}

/** Every hostname fragment we accept — the server validates against this so the
    downloader can't be turned into an open fetch proxy for arbitrary sites. */
export const SUPPORTED_DOMAINS: string[] = PLATFORMS.flatMap((p) => p.domains);
