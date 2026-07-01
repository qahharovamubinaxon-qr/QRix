/* A link-in-bio page encoded entirely inside the URL — no database needed.
   The editor builds a BioPage, encodes it to base64, and the public /p route
   decodes and renders it. The QR code simply points to that /p?d=… URL. */

export type LinkItem = { label: string; url: string };
export type BioPage = {
  t: string;          // title
  s?: string;         // subtitle / bio
  av?: string;        // avatar: emoji or single letter
  c?: string;         // accent color
  l: LinkItem[];      // links
};

// unicode-safe base64
export function encodeBio(page: BioPage): string {
  const json = JSON.stringify(page);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBio(str: string): BioPage | null {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const data = JSON.parse(json);
    if (!data || typeof data.t !== "string" || !Array.isArray(data.l)) return null;
    return data as BioPage;
  } catch {
    return null;
  }
}

export function normalizeUrl(u: string): string {
  const s = (u || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (/^(mailto:|tel:)/i.test(s)) return s;
  return "https://" + s;
}
