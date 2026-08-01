/* Live interaction probe for the eight tool clients behind LocalizedToolEngine.
   ───────────────────────────────────────────────────────────────────────────
   Shares its Chrome harness with scripts/probe-hydration.mjs (M147) and
   scripts/probe-barcode.mjs (M149), and exists for the same reason: all eight
   clients are dynamic(ssr:false), so their UI is NOT in the server HTML. curl
   can see neither the M150 defect nor its fix, and the in-app Browser pane
   runs at viewport 0x0 and does not hydrate tool-page content, so it cannot
   tell a broken tool from its own broken rendering.

   What it asserts, per URL: the tool subtree hydrated, the localized strings
   this language is supposed to render are actually on screen, and none of the
   English originals survive. Expectations come from lib/tool-ui-i18n.ts
   itself, so the probe cannot drift from what shipped.

     node scripts/probe-tool-i18n.mjs                    (default URL set)
     node scripts/probe-tool-i18n.mjs <url> [<url> ...]  */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
const { toolUI } = await import("../lib/tool-ui-i18n.ts");

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";

/* slug -> the dict section it renders. Mirrors LocalizedToolEngine's switch. */
const SECTION = {
  "pdf-to-word": "pdfToWord",
  merge: "merge",
  compress: "compress",
  "jpg-to-pdf": "jpgToPdf",
  "pdf-to-jpg": "pdfToJpg",
  "background-remover": "removeBg",
  "image-upscaler": "upscale",
  "image-to-text": "imageToText",
};

/* Strings that are visible WITHOUT interacting: the empty state of each tool.
   Progress and result strings need a file, so they are asserted statically by
   npm run test:tool-i18n instead. */
const VISIBLE = {
  merge: (t) => [t.merge.dropPdfsOr, t.merge.twoOrMore, t.merge.mergeBtn, t.merge.files, t.merge.noPdfs, t.common.addMore],
  compress: (t) => [t.compress.levelLabel, t.compress.compressBtn, t.compress.levels.low.label, t.compress.levels.high.label, t.common.dropFileOr],
  jpgToPdf: (t) => [t.jpgToPdf.dropImagesOr, t.jpgToPdf.pageSize, t.jpgToPdf.convertBtn, t.jpgToPdf.selectedImages, t.jpgToPdf.noImages],
  pdfToJpg: (t) => [t.pdfToJpg.convertBtn, t.pdfToJpg.note, t.common.dropFileOr],
  removeBg: (t) => [t.removeBg.original, t.removeBg.removeBtn, t.removeBg.result, t.removeBg.resultHere, t.common.chooseImage],
  upscale: (t) => [t.upscale.chooseBlurry, t.upscale.enhancedResult, t.upscale.enhancedHere],
  imageToText: (t) => [t.imageToText.recogLang, t.imageToText.extractBtn, t.imageToText.extractedText, t.common.chooseImage, t.imageToText.hint],
  pdfToWord: (t) => [t.pdfToWord.convertBtn, t.pdfToWord.modes.exact.label, t.pdfToWord.modes.flow.label, t.common.dropFileOr],
};

const DEFAULT_URLS = [
  "/ru/merge", "/uz/merge",
  "/ru/compress", "/uz/compress",
  "/ru/jpg-to-pdf", "/uz/pdf-to-jpg",
  "/ru/background-remover", "/uz/image-upscaler",
  "/ru/image-to-text", "/uz/image-to-text",
  "/ru/pdf-to-word", "/uz/pdf-to-word",
  "/pdf-tools/merge",              // control: English must be untouched
].map((p) => ORIGIN + p);

const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_URLS;

function langOf(u) {
  const seg = new URL(u).pathname.split("/")[1];
  return seg === "ru" || seg === "uz" ? seg : "en";
}
function slugOf(u) {
  const parts = new URL(u).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("no Chrome/Edge binary found");

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qrix-cdp-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--window-size=1280,900",
  "about:blank",
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

for (const url of urls) {
  const lang = langOf(url);
  const slug = slugOf(url);
  const section = SECTION[slug];
  if (!section) { console.error(`  SKIP  ${url} — unknown slug "${slug}"`); continue; }

  const want = VISIBLE[section](toolUI(lang));
  // The English originals that must NOT appear on a localized page.
  const forbid = lang === "en" ? [] : VISIBLE[section](toolUI("en"))
    .filter((s) => !want.includes(s));   // e.g. "A4" is shared and legitimate

  const probe = `(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
    /* Falls back to body: the English tool pages render through ToolPageShell,
       which emits no <main>, so both earlier selectors returned null and the
       fiber scan examined nothing — reporting "not hydrated" for a page the
       change never touched. That control failure was the instrument, not the
       code (the same shape as M147's 0x0 preview pane). */
    /* Wait for a document to exist at all. Dropping the old fixed 4.5s settle
       in favour of polling also dropped the thing that had been letting the
       navigation land, so pick() returned null and every URL died on
       card.innerText. */
    for (let i = 0; i < 60 && (document.readyState === "loading" || !document.body); i++) await sleep(250);
    const pick = () => document.querySelector("main .qx-card")
      || document.querySelector("main")
      || document.body;
    let card = pick();
    /* innerText returns text as RENDERED, so a label under
       "uppercase tracking-wider" comes back upper-cased and a case-sensitive
       compare reports a present string as missing. Fold both sides. This is
       the same trap as the Jul 28 case-sensitive attribute grep. */
    const fold = s => s.replace(/\\s+/g, " ").trim().toLowerCase();
    const want = ${JSON.stringify(want)};
    const forbid = ${JSON.stringify(forbid)};
    /* Poll instead of one fixed sleep. The clients are dynamic(ssr:false), so
       on a cold chunk the tool can still be mounting well past any constant
       delay — a fixed 4.5s settle made this probe report a real, clean page as
       missing all six strings roughly one run in ten. Waiting for the
       condition rather than for the clock removes the flake instead of
       tolerating it. */
    let text = "";
    let waited = 0;
    for (;;) {
      card = pick();
      text = fold(card.innerText);
      const stillMissing = want.filter(s => !text.includes(fold(s))).length;
      if ((!stillMissing && fiberKey(card.querySelector("button, input"))) || waited >= 20000) break;
      await sleep(500);
      waited += 500;
    }
    /* Hydration: look for a fiber anywhere in the tool subtree, not only on
       the card itself — the card is often a server-rendered wrapper whose
       interactive children are the hydrated part. */
    const anyFiber = [card, ...(card ? card.querySelectorAll("*") : [])]
      .some(n => fiberKey(n));
    return JSON.stringify({
      viewport: [innerWidth, innerHeight],
      hydrated: anyFiber,
      waitedMs: waited,
      hasFileInput: document.querySelectorAll('input[type=file]').length,
      missing: want.filter(s => !text.includes(fold(s))),
      leaked: forbid.filter(s => text.includes(fold(s))),
      sample: (card ? card.innerText : "").replace(/\\s+/g, " ").slice(0, 160),
      pageErrors: window.__err || 0,
    });
  })()`;

  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  await browser.send("Runtime.enable", {}, sessionId);
  await browser.send("Page.enable", {}, sessionId);
  await browser.send("Runtime.evaluate", {
    expression: "window.__err=0;addEventListener('error',()=>window.__err++);",
  }, sessionId);
  await browser.send("Page.navigate", { url }, sessionId);

  let out;
  try {
    const res = await browser.send("Runtime.evaluate", {
      expression: probe, awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (res.exceptionDetails) {
      throw new Error("page threw: " + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    }
    out = JSON.parse(res.result.value);
  } catch (e) {
    out = { error: String(e) };
  }
  await browser.send("Target.closeTarget", { targetId });

  const bad = [];
  if (out.error) bad.push(out.error);
  else {
    if (!out.hydrated) bad.push("tool subtree not hydrated");
    if (out.missing?.length) bad.push(`missing ${out.missing.length}: ${JSON.stringify(out.missing.slice(0, 3))}`);
    if (out.leaked?.length) bad.push(`ENGLISH LEAKED ${out.leaked.length}: ${JSON.stringify(out.leaked.slice(0, 3))}`);
    if (out.pageErrors) bad.push(`${out.pageErrors} page errors`);
  }
  if (bad.length) failures++;
  rows.push({ url, lang, slug, ok: !bad.length, bad, out });
  console.log(`${bad.length ? "FAIL" : "ok  "}  ${lang.toUpperCase()} ${url.replace(ORIGIN, "")}` +
    (bad.length ? `\n        ${bad.join("\n        ")}` : `  | ${want.length} strings present, 0 English leaked`));
  if (process.env.QRIX_PROBE_DEBUG) console.log("        " + JSON.stringify(out));
}

chrome.kill();
console.log(`\n  ${rows.length - failures}/${rows.length} URLs clean.\n`);
process.exitCode = failures ? 1 : 0;
