/* Guard for the code-gated document flow (M149) — the OFIS contract.

   Three halves, so that as much as possible runs without a credential:

   · PURE — id shape and the destination rules, tested directly. A private or
     metadata address slipping through would turn a short link into a redirect
     into somebody's network.
   · CLOSED DOOR — the API refuses a missing or wrong key with JSON, never HTML,
     because the caller is a program that has to branch on it.
   · FULL FLOW (needs QRIX_API_KEY) — create, wrong code, right code, and the
     two assertions that matter: the gate page must not contain the destination
     (the QR alone must reveal nothing), and a correct code must redirect to it.

   Usage:
     npm run test:secure
     QRIX_API_KEY=... npm run test:secure
     npm run test:secure -- http://localhost:3002
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/* Loaded by hand because this script is not Next. Nothing in the pure half
   needs a secret any more, but the full flow reads QRIX_API_KEY from here. */
for (const line of fs.existsSync(path.join(root, ".env.local"))
  ? fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n") : []) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const BASE = process.argv.find((a) => a.startsWith("http")) || "https://qrixtools.com";
const KEY = process.env.QRIX_API_KEY || "";

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* ── pure ────────────────────────────────────────────────────────────────── */

const { isSafeTarget, newId } =
  await import(`file:///${path.join(root, "lib/secure-doc-core.ts").replace(/\\/g, "/")}`);

{
  /* An id that reads badly off a printed page is a support call, not a bug
     report — the alphabet deliberately drops 0/O and 1/l/I. */
  const ids = Array.from({ length: 200 }, () => newId());
  ok("id: 6 characters", ids.every((i) => i.length === 6));
  ok("id: no lookalike characters", ids.every((i) => !/[0O1lI]/.test(i)));
  ok("id: short_url stays under 40 chars", `${BASE}/s/${ids[0]}`.length <= 40, `${BASE}/s/${ids[0]}`.length);

  ok("target: an imgbb url is accepted", isSafeTarget("https://i.ibb.co/abc123/spravka-1.jpg"));
  ok("target: a private address is refused", !isSafeTarget("http://192.168.1.10/x.jpg"));
  ok("target: cloud metadata is refused", !isSafeTarget("http://169.254.169.254/latest/meta-data/"));
  ok("target: javascript: is refused", !isSafeTarget("javascript:alert(1)"));
  ok("target: localhost is refused", !isSafeTarget("http://localhost:3000/x.png"));
}

/* ── closed door ─────────────────────────────────────────────────────────── */

const post = (body, headers = {}) => fetch(`${BASE}/api/v1/links`, {
  method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body),
});

const sample = { target_url: "https://i.ibb.co/abc123/x.jpg", code: "3255", title: "test" };
{
  const none = await post(sample);
  ok("api: no key is 401", none.status === 401, `got ${none.status}`);
  const body = await none.json().catch(() => null);
  ok("api: the 401 is JSON with an error string", !!body && typeof body.error === "string", JSON.stringify(body));

  const junk = await post(sample, { authorization: "Bearer qrix_live_0000000000000000000000000000000000000000" });
  ok("api: an unknown key is 401", junk.status === 401, `got ${junk.status}`);

  const wrongMethod = await fetch(`${BASE}/api/v1/links`);
  ok("api: GET answers JSON, not HTML", (wrongMethod.headers.get("content-type") || "").includes("json"));

  /* An unknown id renders the not-found UI, but the STATUS is 200: the layout
     has already streamed by the time notFound() runs, and a status cannot be
     changed after the first byte. Asserting 404 here would be asserting a wish.
     What has to be true is behavioural — no code form, so nothing suggests a
     document exists at that id. */
  const missing = await fetch(`${BASE}/s/zzzzzz`);
  const missingHtml = await missing.text();
  ok("page: an unknown id shows no code form", !/4-digit code/i.test(missingHtml), `status ${missing.status}`);

}

/* ── full flow ───────────────────────────────────────────────────────────── */

if (!KEY) {
  console.log(`${pass}/${pass + fails.length} assertions passed  (base ${BASE}, no key: pure + closed door)`);
  console.log("  set QRIX_API_KEY to also exercise create → wrong code → right code → redirect");
} else {
  const auth = { authorization: `Bearer ${KEY}` };
  const TARGET = "https://i.ibb.co/QQ1test/qrix-guard-sample.png";
  const CODE = String(1000 + Math.floor(Math.random() * 8999));

  const bad1 = await post({ target_url: TARGET, code: "12" }, auth);
  ok("api: a 2-digit code is 400", bad1.status === 400, `got ${bad1.status}`);
  const bad2 = await post({ target_url: "http://10.0.0.1/x.png", code: CODE }, auth);
  ok("api: a private target is 400", bad2.status === 400, `got ${bad2.status}`);

  const made = await post({ target_url: TARGET, code: CODE, title: "GUARD — test document" }, auth);
  const doc = await made.json().catch(() => ({}));
  ok("api: created", made.status === 200, `got ${made.status} ${JSON.stringify(doc).slice(0, 140)}`);
  ok("api: returns id and short_url", typeof doc.id === "string" && typeof doc.short_url === "string");
  ok("api: short_url is under 40 characters", (doc.short_url || "").length <= 40, `${(doc.short_url || "").length}`);

  if (doc.id) {
    const page = await fetch(`${BASE}/s/${doc.id}`);
    const html = await page.text();
    ok("page: 200", page.status === 200, `got ${page.status}`);
    ok("page: asks for the code", /4-digit code/i.test(html));
    /* The promise of the whole feature. */
    ok("page: does NOT leak the destination", !html.includes(TARGET) && !html.includes("i.ibb.co"));

    const wrong = await fetch(`${BASE}/s/${doc.id}/verify`, {
      method: "POST", redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code: CODE === "1111" ? "2222" : "1111" }),
    });
    ok("verify: a wrong code returns to the form", (wrong.headers.get("location") || "").includes("error=1"));
    ok("verify: a wrong code does not leak the destination",
      !(wrong.headers.get("location") || "").includes("ibb.co"));

    const right = await fetch(`${BASE}/s/${doc.id}/verify`, {
      method: "POST", redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code: CODE }),
    });
    ok("verify: the right code redirects", right.status === 303, `got ${right.status}`);
    ok("verify: it redirects to the destination", (right.headers.get("location") || "") === TARGET,
      right.headers.get("location") || "(no location)");
    /* No session is minted any more — the redirect IS the grant, and a cookie
       that outlived it would be a promise the flow no longer keeps. */
    ok("verify: no unlock cookie is set", !(right.headers.get("set-cookie") || "").includes("qxs_"));
  }

  console.log(`${pass}/${pass + fails.length} assertions passed  (base ${BASE}, full flow)`);
}

if (fails.length) {
  console.error("FAILED:\n  " + fails.join("\n  "));
  process.exit(1);
}
