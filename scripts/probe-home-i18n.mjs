/* Live probe for the homepage's per-language copy chunks (M160) and the
   corrected privacy answer (M161).
   ───────────────────────────────────────────────────────────────────────────
   Shares its Chrome harness with scripts/probe-tool-i18n.mjs. It has to be a
   real browser: the language is read from localStorage in an effect and the
   copy then arrives through a dynamic import(), so curl sees English on every
   request no matter which language is stored, and the in-app Browser pane runs
   at viewport 0x0 and never hydrates the page body.

   What it asserts, per language:
     · the language's own strings are on screen — i.e. its chunk loaded, and
       loadHomeUi's switch sent it to the right file;
     · the CORRECTED FAQ 2 answer is in the DOM, and the pre-M161 absolute
       claim is not;
     · English is unaffected, and stores no language chunk it does not need.

     node scripts/probe-home-i18n.mjs            (en control + de, ja, zh)
     node scripts/probe-home-i18n.mjs de fr ...  */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readAll } from "./home-i18n-aggregate.mjs";

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const HOME_I18N = await readAll();

const langs = process.argv.slice(2).length ? process.argv.slice(2) : ["en", "de", "ja", "zh"];

/* English is the control: it is authored inline in the components, so it must
   render with NO language chunk at all. Its strings are hard-coded here on
   purpose — reading them from the same module the page reads would make the
   assertion agree with itself. */
const EN = {
  hero: "Create Your First QR Code",
  card: "It's fast, easy and free to get started.",
  /* The hero card's heading. English keeps a short authored form; every
     generated language renders its own pageT.cardTitle (M162).
     HOW THIS ASSERTION WAS EARNED: the first draft asserted pageT.cardTitle for
     ALL languages and reported the ENGLISH CONTROL as broken. English never
     goes through the loader, so a control failing means the instrument is
     accusing itself — and the key really was rendered nowhere, because the
     heading was an inline uz/ru/else ternary. So twelve languages had an
     English heading over a localized subtitle. Asserting a string the page
     ought to render is how that surfaced. */
  cardTitle: "CREATE QR CODE",
  faqTitle: "Frequently asked questions",
  faq2q: "Are my files uploaded to a server?",
  faq2a: "Mostly no.",
};

function expected(lang) {
  if (lang === "en") return { want: [EN.hero, EN.card, EN.cardTitle, EN.faqTitle, EN.faq2q], answer: EN.faq2a };
  const ui = HOME_I18N[lang];
  if (!ui) throw new Error(`no lib/home-i18n/${lang}.ts`);
  return {
    want: [ui.pageT.cta, ui.pageT.cardSub, ui.pageT.cardTitle, ui.homeFaq.t, ui.faq[1].q],
    answer: ui.faq[1].a,
  };
}

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("no Chrome/Edge binary found");

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qrix-cdp-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu",
  "--window-size=1280,900", "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  const t = setTimeout(() => reject(new Error("chrome did not report a ws endpoint in 30s")), 30000);
  chrome.stderr.on("data", (d) => {
    buf += d.toString();
    const m = buf.match(/ws:\/\/[^\s]+/);
    if (m) { clearTimeout(t); resolve(m[0]); }
  });
  chrome.on("exit", (c) => { clearTimeout(t); reject(new Error("chrome exited " + c + "\n" + buf)); });
});

let id = 0;
function connect(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  const ready = new Promise((r) => ws.addEventListener("open", r));
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, (m) => (m.error ? reject(new Error(method + ": " + m.error.message)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });
  return { ws, ready, send };
}

const browser = connect(wsUrl);
await browser.ready;

let failures = 0;
const rows = [];

for (const lang of langs) {
  const { want, answer } = expected(lang);

  const probe = `(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const fold = s => s.replace(/\\s+/g, " ").trim().toLowerCase();
    const want = ${JSON.stringify(want)};
    const answer = ${JSON.stringify(answer)};
    for (let i = 0; i < 60 && (document.readyState === "loading" || !document.body); i++) await sleep(250);
    /* Refuse to measure the wrong document. If this ever runs against the page
       we navigated AWAY from, every string is legitimately absent and the probe
       would report a correct site as broken — so say which page it landed on
       instead of quietly grading it. */
    if (location.pathname !== "/") {
      return JSON.stringify({ wrongDocument: location.pathname, missing: [], answerPresent: false, hydrated: false, pageErrors: 0 });
    }

    /* Poll for the condition rather than sleeping a fixed time: on a cold chunk
       the copy can land well past any constant delay, and a fixed settle is
       what made the sibling probe flake roughly one run in ten. */
    const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
    const isHydrated = () => !!fiberKey(document.querySelector("header button, header a"));
    /* Wait for hydration too, not just for the copy. English is served from the
       server HTML, so its strings are present on the FIRST poll — checking
       hydration once, right after, reported the English control as "header
       never hydrated" while every language that had to wait for a chunk passed.
       That was the probe racing React, not a broken page. */
    let waited = 0, missing = want;
    for (;;) {
      const shown = fold(document.body.innerText);
      missing = want.filter(s => !shown.includes(fold(s)));
      if ((!missing.length && isHydrated()) || waited >= 25000) break;
      await sleep(500);
      waited += 500;
    }
    /* textContent, not innerText: collapsed FAQ answers are in the DOM but not
       rendered, and innerText omits them. */
    const all = fold(document.body.textContent || "");
    return JSON.stringify({
      viewport: [innerWidth, innerHeight],
      storedLang: localStorage.getItem("language"),
      htmlLang: document.documentElement.lang,
      waitedMs: waited,
      missing,
      answerPresent: all.includes(fold(answer)),
      hydrated: isHydrated(),
      pageErrors: window.__err || 0,
    });
  })()`;

  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  await browser.send("Runtime.enable", {}, sessionId);
  await browser.send("Page.enable", {}, sessionId);
  await browser.send("Network.enable", {}, sessionId);

  /* Land on the origin once so localStorage is writable for it, store the
     language, then load the page for real. */
  await browser.send("Page.navigate", { url: ORIGIN + "/robots.txt" }, sessionId);
  await new Promise((r) => setTimeout(r, 1200));
  await browser.send("Runtime.evaluate", {
    expression: `localStorage.setItem("language", ${JSON.stringify(lang)})`,
  }, sessionId);
  await browser.send("Page.navigate", { url: ORIGIN + "/" }, sessionId);

  /* WAIT FOR THE NAVIGATION TO COMMIT BEFORE EVALUATING ANYTHING.
     Runtime.evaluate issued straight after Page.navigate can still bind to the
     OUTGOING document — here /robots.txt, which has no header, no hero and no
     copy in any language. The probe then measured robots.txt for 25 s and
     reported the page as missing its strings. That is exactly what "de and zh
     are broken" looked like while the page was in fact correct, and it is why
     the same language passed in one run and failed the next. Poll for the new
     document instead of assuming the navigate has landed. */
  for (let i = 0; i < 80; i++) {
    const r = await browser.send("Runtime.evaluate", {
      expression: "location.pathname + '|' + document.readyState + '|' + (document.body ? 1 : 0)",
      returnByValue: true,
    }, sessionId).catch(() => null);
    const v = r?.result?.value;
    if (typeof v === "string" && v.startsWith("/|") && !v.endsWith("|0") && !v.includes("|loading|")) break;
    await new Promise((r2) => setTimeout(r2, 250));
  }

  await browser.send("Runtime.evaluate", {
    expression: "window.__err=0;addEventListener('error',()=>window.__err++);",
  }, sessionId);

  let out;
  try {
    const res = await browser.send("Runtime.evaluate", {
      expression: probe, awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (res.exceptionDetails) throw new Error("page threw: " + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    out = JSON.parse(res.result.value);
  } catch (e) {
    console.error(`  FAIL  ${lang}: ${e.message}`);
    failures++;
    await browser.send("Target.closeTarget", { targetId });
    continue;
  }
  await browser.send("Target.closeTarget", { targetId });

  const bad = [];
  if (out.wrongDocument) bad.push(`probe ran against ${out.wrongDocument}, not / — instrument fault, not a page fault`);
  if (out.missing.length) bad.push(`missing ${out.missing.length}: ${out.missing.map((s) => JSON.stringify(s.slice(0, 40))).join(", ")}`);
  if (!out.answerPresent) bad.push("the corrected FAQ 2 answer is NOT in the DOM");
  if (!out.hydrated) bad.push("header never hydrated");
  if (out.pageErrors) bad.push(`${out.pageErrors} page error(s)`);
  if (out.storedLang !== lang) bad.push(`stored language is ${out.storedLang}`);

  rows.push({ lang, ok: !bad.length, waited: out.waitedMs, htmlLang: out.htmlLang, bad });
  if (bad.length) failures++;
}

console.log(`\n  home-i18n live probe — ${ORIGIN}\n`);
for (const r of rows) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"}  ${r.lang.padEnd(3)}  html[lang]=${String(r.htmlLang).padEnd(5)} settled ${String(r.waited).padStart(5)}ms  ${r.bad.join(" · ")}`);
}
console.log(`\n  ${rows.filter((r) => r.ok).length}/${rows.length} languages clean\n`);

browser.ws.close();
chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(failures ? 1 : 0);
