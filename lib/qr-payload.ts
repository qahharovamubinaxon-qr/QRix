/* Payload encoders for the structured QR types (WiFi, calendar event).
 *
 * Why this file exists: these payloads used to be built by raw template
 * interpolation inside lib/qr-types.ts, which silently corrupted any value
 * containing a delimiter. `WIFI:T:WPA;S:Cafe;P:pa;ss;;` — a password with a
 * semicolon in it — parses as password "pa" and then junk, so the code scans
 * fine and simply fails to connect. QRix's own decoder proves the bug: it
 * reads the password with /P:([^;]*)/, so a `;` terminates the field there too.
 *
 * Nothing here touches the DOM, so scripts/test-qr-payload.mjs can assert the
 * real shipped functions in plain Node. Keep it that way: anything that
 * *renders* belongs in the component, anything that *encodes* belongs here.
 */

/** Chars the WiFi URI scheme reserves — each must be backslash-escaped inside
    an SSID or password, or the value silently truncates at the delimiter. */
const WIFI_RESERVED = /([\\;,:"])/g;

export function escapeWifi(value: string): string {
  return value.replace(WIFI_RESERVED, "\\$1");
}

export function unescapeWifi(value: string): string {
  return value.replace(/\\(.)/g, "$1");
}

/** Read one field out of a `WIFI:` payload, honouring backslash escapes — a
    naive /S:([^;]*)/ stops at the first escaped delimiter inside the value. */
export function readWifiField(payload: string, key: string): string | undefined {
  const m = payload.match(new RegExp(`${key}:((?:\\\\.|[^;\\\\])*)`));
  return m ? unescapeWifi(m[1]) : undefined;
}

export type WifiInput = {
  ssid?: string;
  password?: string;
  /** "WPA" | "WEP" | "nopass" — anything falsy defaults to WPA. */
  enc?: string;
  /** Hidden networks need H:true or the phone won't find the SSID to join. */
  hidden?: boolean | string;
};

const isOn = (v: boolean | string | undefined) => v === true || v === "true" || v === "yes";

/** WiFi network QR payload (the `WIFI:` URI scheme Android and iOS both read). */
export function buildWifi(v: WifiInput): string {
  const enc = v.enc || "WPA";
  const open = enc === "nopass";
  const parts = [`T:${open ? "nopass" : enc}`, `S:${escapeWifi(v.ssid || "")}`];
  // An open network carries no password field at all — emitting an empty P:
  // makes some Android builds prompt for a key that doesn't exist.
  if (!open && v.password) parts.push(`P:${escapeWifi(v.password)}`);
  if (isOn(v.hidden)) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

/** RFC 5545 TEXT escaping — backslash, semicolon, comma and newlines. A colon
    is legal unescaped inside a TEXT value, unlike in the WiFi scheme. */
export function escapeICal(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** `2026-07-22T14:30` -> `20260722T143000`; `2026-07-22` -> `20260722`. */
export function icalDate(input?: string): string {
  if (!input) return "";
  const cleaned = input.replace(/[-:]/g, "").replace(/\.\d+/, "");
  // A datetime-local value loses its seconds; iCal DATE-TIME requires them.
  return /^\d{8}T\d{4}$/.test(cleaned) ? `${cleaned}00` : cleaned;
}

export type EventInput = {
  title?: string;
  location?: string;
  description?: string;
  start?: string;
  end?: string;
};

/** Calendar event payload. Date-only values are tagged VALUE=DATE, which is
    what makes them an all-day event rather than an invalid DATE-TIME. */
export function buildEvent(v: EventInput): string {
  const stamp = (key: string, raw?: string) => {
    const d = icalDate(raw);
    if (!d) return `${key}:`;
    return d.includes("T") ? `${key}:${d}` : `${key};VALUE=DATE:${d}`;
  };
  const lines = [
    "BEGIN:VEVENT",
    `SUMMARY:${escapeICal(v.title || "")}`,
    `LOCATION:${escapeICal(v.location || "")}`,
  ];
  if (v.description) lines.push(`DESCRIPTION:${escapeICal(v.description)}`);
  lines.push(stamp("DTSTART", v.start), stamp("DTEND", v.end), "END:VEVENT");
  return lines.join("\n");
}

/* ---- contact cards ----------------------------------------------------- */

/** vCard 3.0 TEXT escaping (RFC 2426 §5): backslash, semicolon, comma and
    newlines. An unescaped `;` is what splits N and ADR into their components,
    so one inside a value shifts every later component up a slot — a surname of
    "Berg; Jr" moves the given name into the "additional names" field — while
    the code still scans perfectly. A comma inside ORG ("Acme, Inc.") makes
    address books read two organisations. Colon is legal unescaped in a value. */
export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function unescapeVCard(value: string): string {
  return value.replace(/\\(.)/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c));
}

/** Read one vCard property, honouring escapes. A plain `/FN:(.*)/` hands back
    the raw escaped text, so anything that displays a value needs this.

    Flat TEXT properties only (FN, ORG, TEL…). N and ADR are structured: their
    components have to be split on the unescaped `;` BEFORE unescaping, or an
    escaped separator inside a component turns back into a separator. */
export function readVCardField(payload: string, key: string): string | undefined {
  const m = payload.match(new RegExp(`^${key}(?:;[^:\\n]*)?:(.*)$`, "im"));
  return m ? unescapeVCard(m[1].trim()) : undefined;
}

export type VCardInput = {
  first?: string; last?: string;
  /** For forms with a single name field (the homepage builder). */
  name?: string;
  phone?: string; email?: string; org?: string; title?: string;
  url?: string; address?: string;
};

/** Contact card payload. Only filled-in properties are emitted: an empty
    `TITLE:` or `ADR:;;` is a property with no value, and address books import
    those as blank fields rather than skipping them. */
export function buildVCard(v: VCardInput): string {
  const e = (s?: string) => escapeVCard((s || "").trim());
  const first = e(v.first), last = e(v.last);
  const full = v.name?.trim() ? e(v.name) : [first, last].filter(Boolean).join(" ");
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  // N is structured — family;given;additional;prefix;suffix. The separators
  // stay unescaped; the components between them do not.
  if (first || last) lines.push(`N:${last};${first};;;`);
  lines.push(`FN:${full}`);
  const props: [string, string | undefined][] = [
    ["TEL", v.phone], ["EMAIL", v.email], ["ORG", v.org], ["TITLE", v.title], ["URL", v.url],
  ];
  for (const [key, raw] of props) if (raw && raw.trim()) lines.push(`${key}:${e(raw)}`);
  // ADR is structured too: pobox;extended;street;locality;region;postcode;country.
  if (v.address && v.address.trim()) lines.push(`ADR:;;${e(v.address)};;;;`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export type MeCardInput = { name?: string; phone?: string; email?: string };

/** MECARD — the compact contact format several scanners prefer over vCard. It
    reserves the same delimiters as the WiFi URI scheme, and for the same
    reason: fields are `;`-separated with `:` between key and value. */
export function buildMeCard(v: MeCardInput): string {
  const parts: string[] = [];
  const add = (key: string, raw?: string) => {
    if (raw && raw.trim()) parts.push(`${key}:${escapeWifi(raw.trim())};`);
  };
  add("N", v.name);
  add("TEL", v.phone);
  add("EMAIL", v.email);
  return `MECARD:${parts.join("")};`;
}
