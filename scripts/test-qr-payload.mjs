/* Assertions for lib/qr-payload.ts — the WiFi and calendar payloads behind
 * /qr-tools/wifi, /qr-tools/wifi-guest, /qr-tools/event, /wifi-qr and the
 * homepage generator.
 *
 * Why this file exists: a QR payload bug is invisible. The code renders, it
 * scans, and it simply fails to connect or saves a mangled event — you only
 * find out from a user with a semicolon in their WiFi password. Both builders
 * used raw template interpolation with no escaping until M126, and QRix's own
 * decoder read the password with /P:([^;]*)/, so it truncated the same way.
 *
 * It imports the SHIPPED module (Node 22.18+/24 strips the types natively), so
 * a regression in the components' real dependency fails here.
 *
 *   node scripts/test-qr-payload.mjs      (or: npm run test:qr)
 */

import assert from "node:assert/strict";
import {
  escapeWifi,
  unescapeWifi,
  readWifiField,
  buildWifi,
  escapeICal,
  icalDate,
  buildEvent,
  escapeVCard,
  unescapeVCard,
  readVCardField,
  buildVCard,
  buildMeCard,
} from "../lib/qr-payload.ts";

let pass = 0;
const fails = [];
const t = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fails.push(`${name}\n    ${e.message.split("\n").join("\n    ")}`); }
};

/* ---- WiFi escaping: the corruption bug itself ------------------------ */

t("a semicolon in the password is escaped, not left to truncate the field", () => {
  const out = buildWifi({ ssid: "Cafe", password: "pa;ss" });
  assert.equal(out, "WIFI:T:WPA;S:Cafe;P:pa\\;ss;;");
  assert.equal(readWifiField(out, "P"), "pa;ss");
});

t("every reserved char is escaped", () => {
  assert.equal(escapeWifi('a\\b;c,d:e"f'), 'a\\\\b\\;c\\,d\\:e\\"f');
});

t("a colon in the SSID survives the round trip", () => {
  const out = buildWifi({ ssid: "Floor:2", password: "x" });
  assert.equal(readWifiField(out, "S"), "Floor:2");
});

t("a comma and a backslash survive the round trip", () => {
  const out = buildWifi({ ssid: "A,B\\C", password: "p,q\\r" });
  assert.equal(readWifiField(out, "S"), "A,B\\C");
  assert.equal(readWifiField(out, "P"), "p,q\\r");
});

t("unescapeWifi inverts escapeWifi", () => {
  const raw = 'we;ird,va\\lue:with"quotes';
  assert.equal(unescapeWifi(escapeWifi(raw)), raw);
});

/* ---- WiFi structure -------------------------------------------------- */

t("a plain WPA network is unchanged from the classic form", () => {
  assert.equal(buildWifi({ ssid: "MyWiFi", password: "secret" }), "WIFI:T:WPA;S:MyWiFi;P:secret;;");
});

t("encryption type is honoured", () => {
  assert.equal(buildWifi({ ssid: "Old", password: "k", enc: "WEP" }), "WIFI:T:WEP;S:Old;P:k;;");
});

t("an open network carries no password field at all", () => {
  const out = buildWifi({ ssid: "Free", password: "ignored", enc: "nopass" });
  assert.equal(out, "WIFI:T:nopass;S:Free;;");
  assert.equal(readWifiField(out, "P"), undefined);
});

/* ---- hidden networks: the claim the copy made for 15 languages ------- */

t("hidden network emits H:true (the use-case page promised this flag)", () => {
  assert.equal(buildWifi({ ssid: "Stealth", password: "k", hidden: "yes" }), "WIFI:T:WPA;S:Stealth;P:k;H:true;;");
});

t("a visible network emits no H field", () => {
  assert.ok(!buildWifi({ ssid: "Open", password: "k", hidden: "no" }).includes("H:"));
});

t("hidden accepts the boolean form too", () => {
  assert.ok(buildWifi({ ssid: "S", password: "k", hidden: true }).includes("H:true"));
});

/* ---- iCal escaping --------------------------------------------------- */

t("a comma in the location is escaped (RFC 5545 TEXT)", () => {
  assert.ok(buildEvent({ title: "Launch", location: "Berlin, DE" }).includes("LOCATION:Berlin\\, DE"));
});

t("a semicolon and backslash in the title are escaped", () => {
  assert.equal(escapeICal("a;b\\c"), "a\\;b\\\\c");
});

t("newlines in the description become literal \\n", () => {
  assert.ok(buildEvent({ title: "T", description: "line1\nline2" }).includes("DESCRIPTION:line1\\nline2"));
});

t("a colon is NOT escaped in iCal text", () => {
  assert.equal(escapeICal("Time: 10am"), "Time: 10am");
});

/* ---- event structure: the description the copy promised -------------- */

t("description is emitted when present (copy claimed notes were supported)", () => {
  assert.ok(buildEvent({ title: "T", description: "Bring ID" }).includes("DESCRIPTION:Bring ID"));
});

t("description is omitted entirely when blank", () => {
  assert.ok(!buildEvent({ title: "T" }).includes("DESCRIPTION"));
});

t("a datetime-local value gains the seconds iCal requires", () => {
  assert.equal(icalDate("2026-07-22T14:30"), "20260722T143000");
});

t("a datetime start is a DATE-TIME, not tagged VALUE=DATE", () => {
  assert.ok(buildEvent({ start: "2026-07-22T14:30" }).includes("DTSTART:20260722T143000"));
});

t("a date-only value is tagged VALUE=DATE so it is a valid all-day event", () => {
  assert.ok(buildEvent({ start: "2026-07-22" }).includes("DTSTART;VALUE=DATE:20260722"));
});

t("the event payload still opens and closes a VEVENT", () => {
  const out = buildEvent({ title: "T", start: "2026-07-22T09:00", end: "2026-07-22T10:00" });
  assert.ok(out.startsWith("BEGIN:VEVENT"));
  assert.ok(out.endsWith("END:VEVENT"));
});

/* ---- contact cards ------------------------------------------------------ */

t("a semicolon in a surname is escaped instead of adding an N component", () => {
  const out = buildVCard({ first: "John", last: "Berg; Jr" });
  const n = out.split("\n").find((l) => l.startsWith("N:"));
  // family;given;additional;prefix;suffix — five slots, and the escaped ; must
  // not create a sixth or push "John" into the additional-names field.
  assert.equal(n, "N:Berg\\; Jr;John;;;");
  // Structured properties must be split on their UNescaped separators first —
  // unescaping the whole value would turn the escaped ; back into a separator.
  const components = n.slice(2).split(/(?<!\\);/).map(unescapeVCard);
  assert.deepEqual(components.slice(0, 2), ["Berg; Jr", "John"]);
});

t("a comma in ORG does not read as two organisations", () => {
  const out = buildVCard({ first: "A", org: "Acme, Inc." });
  assert.ok(out.includes("ORG:Acme\\, Inc."));
  assert.equal(readVCardField(out, "ORG"), "Acme, Inc.");
});

t("a newline in the address cannot break out of the property", () => {
  const out = buildVCard({ first: "A", address: "12 Main St\nSuite 4" });
  assert.equal(out.split("\n").filter((l) => l.startsWith("ADR")).length, 1);
  assert.ok(out.includes("ADR:;;12 Main St\\nSuite 4;;;;"));
});

t("a backslash survives the round trip", () => {
  assert.equal(unescapeVCard(escapeVCard("a\\b;c,d")), "a\\b;c,d");
});

t("empty properties are omitted, not emitted blank", () => {
  const out = buildVCard({ first: "John", last: "Doe", phone: "+123" });
  assert.ok(out.includes("TEL:+123"));
  for (const key of ["EMAIL", "ORG", "TITLE", "URL", "ADR"]) {
    assert.ok(!out.includes(`${key}:`), `${key} should be omitted when blank`);
  }
});

t("the single-name form still produces a valid FN", () => {
  const out = buildVCard({ name: "Jane Roe", email: "j@example.com" });
  assert.ok(out.includes("FN:Jane Roe"));
  assert.ok(!out.split("\n").some((l) => l.startsWith("N:")), "no structured name when only a full name was given");
});

t("the card still opens and closes a VCARD with a version", () => {
  const out = buildVCard({ first: "A", last: "B" });
  assert.ok(out.startsWith("BEGIN:VCARD\nVERSION:3.0"));
  assert.ok(out.endsWith("END:VCARD"));
});

t("readVCardField reads a property that carries parameters", () => {
  assert.equal(readVCardField("BEGIN:VCARD\nTEL;TYPE=CELL:+998901234567\nEND:VCARD", "TEL"), "+998901234567");
});

t("MECARD escapes the delimiters it reserves", () => {
  const out = buildMeCard({ name: "Doe;John", phone: "+1", email: "a:b@x.com" });
  assert.ok(out.includes("N:Doe\\;John;"));
  assert.ok(out.includes("EMAIL:a\\:b@x.com;"));
  assert.ok(out.startsWith("MECARD:") && out.endsWith(";;"));
});

t("MECARD omits fields the user left blank", () => {
  assert.equal(buildMeCard({ name: "Solo" }), "MECARD:N:Solo;;");
});

/* ---------------------------------------------------------------------- */

if (fails.length) {
  console.error(`\n${fails.length} FAILED / ${pass + fails.length} assertions\n`);
  for (const f of fails) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}
console.log(`✓ ${pass}/${pass} qr payload assertions pass`);
