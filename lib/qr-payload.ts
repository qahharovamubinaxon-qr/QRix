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
