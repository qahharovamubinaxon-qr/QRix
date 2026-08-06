/* Guard for the public API and its key gate (M148).

   Two halves, because only one of them can run without a credential:

   · ALWAYS — the closed door. Every endpoint must refuse an absent key, a
     malformed key and a well-formed key that does not exist, with the same
     401 and the same body, so the API cannot be used to find out which keys
     are real. A regression here is silent: the endpoints keep working for the
     developer testing them and quietly work for everyone else too.

   · WITH A KEY — the open door, end to end: create a dynamic link, render its
     QR, read it back in the list. Set QRIX_API_KEY to run it. Never put a key
     on the command line (it lands in shell history) — export it.

   Usage:
     npm run test:api                          # closed-door half, production
     QRIX_API_KEY=... npm run test:api         # both halves
     npm run test:api -- http://localhost:3002 # any base
*/

const BASE = process.argv.find((a) => a.startsWith("http")) || "https://qrixtools.com";
const KEY = process.env.QRIX_API_KEY || "";

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

const url = (p) => `${BASE}${p}`;

/* ── the closed door ───────────────────────────────────────────────────── */

const CLOSED = [
  ["GET", "/api/public/v1/qr?content=hello"],
  ["GET", "/api/public/v1/links"],
  ["POST", "/api/public/v1/links"],
];

for (const [method, path] of CLOSED) {
  const body = method === "POST" ? JSON.stringify({ url: "https://example.com" }) : undefined;
  const headers = method === "POST" ? { "content-type": "application/json" } : {};

  const none = await fetch(url(path), { method, headers, body });
  ok(`${method} ${path} · no key is 401`, none.status === 401, `got ${none.status}`);

  const junk = await fetch(url(path), { method, headers: { ...headers, authorization: "Bearer not-even-a-key" }, body });
  ok(`${method} ${path} · malformed key is 401`, junk.status === 401, `got ${junk.status}`);

  /* Right prefix, right length, simply not in the table: this is the one an
     attacker would actually send, and it must be indistinguishable from junk. */
  const fake = `qrix_live_${"0".repeat(40)}`;
  const unknown = await fetch(url(path), { method, headers: { ...headers, authorization: `Bearer ${fake}` }, body });
  ok(`${method} ${path} · unknown key is 401`, unknown.status === 401, `got ${unknown.status}`);

  const bodyText = await unknown.text();
  ok(`${method} ${path} · says nothing about which key exists`,
    !/revoked|expired|not found|user/i.test(bodyText), bodyText.slice(0, 80));
}

/* The key manager itself is session-authenticated, never key-authenticated: a
   key that could mint keys would turn one leak into permanent access. */
const mgr = await fetch(url("/api/account/api-keys"), {
  headers: KEY ? { authorization: `Bearer ${KEY}` } : {},
});
ok("account key manager rejects an API key", mgr.status === 401, `got ${mgr.status}`);

/* ── the open door ─────────────────────────────────────────────────────── */

if (!KEY) {
  console.log(`${pass}/${pass + fails.length} assertions passed  (base ${BASE}, closed-door half only)`);
  console.log("  set QRIX_API_KEY to also exercise create-link / render-qr / list");
} else {
  const auth = { authorization: `Bearer ${KEY}` };

  const qr = await fetch(url("/api/public/v1/qr?content=https://qrixtools.com&size=300"), { headers: auth });
  ok("qr · 200", qr.status === 200, `got ${qr.status}`);
  ok("qr · image/png", (qr.headers.get("content-type") || "").includes("image/png"));
  const bytes = new Uint8Array(await qr.arrayBuffer());
  /* Content-type is a claim; the magic number is the fact. */
  ok("qr · really is a PNG", bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
    [...bytes.slice(0, 4)].map((b) => b.toString(16)).join(" "));
  ok("qr · not an empty image", bytes.length > 200, `${bytes.length} bytes`);

  const svg = await fetch(url("/api/public/v1/qr?content=hello&format=svg"), { headers: auth });
  ok("qr · svg format", (await svg.text()).trimStart().startsWith("<svg"));

  const target = `https://example.com/${Math.random().toString(36).slice(2, 8)}`;
  const made = await fetch(url("/api/public/v1/links"), {
    method: "POST", headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ url: target }),
  });
  const link = await made.json().catch(() => ({}));
  ok("links · created", made.status === 201, `got ${made.status} ${JSON.stringify(link).slice(0, 120)}`);
  ok("links · returns a short url", typeof link.short_url === "string" && link.short_url.includes("/r/"));

  /* The destination rules are the reason this endpoint cannot be used to point
     the QRix domain at somebody's internal network. */
  const bad = await fetch(url("/api/public/v1/links"), {
    method: "POST", headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ url: "http://192.168.1.1/admin" }),
  });
  ok("links · refuses a private host", bad.status === 400, `got ${bad.status}`);

  const js = await fetch(url("/api/public/v1/links"), {
    method: "POST", headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ url: "javascript:alert(1)" }),
  });
  ok("links · refuses a javascript: url", js.status === 400, `got ${js.status}`);

  const list = await fetch(url("/api/public/v1/links"), { headers: auth });
  const listed = await list.json().catch(() => ({}));
  ok("links · list is 200", list.status === 200, `got ${list.status}`);
  ok("links · the new link is in the list",
    Array.isArray(listed.links) && listed.links.some((l) => l.target_url === target));

  console.log(`${pass}/${pass + fails.length} assertions passed  (base ${BASE}, both halves)`);
}

if (fails.length) {
  console.error("FAILED:\n  " + fails.join("\n  "));
  process.exit(1);
}
