/* Live interaction probe for the deferred QR Design Studio (M155).
   ───────────────────────────────────────────────────────────────────────────
   Shares its Chrome harness with probe-hydration (M147), probe-barcode (M149)
   and probe-tool-i18n (M150), and exists because the thing M155 changed is
   invisible to every cheaper instrument:

     - curl cannot see it. The studio is a modal; its markup was never in the
       server HTML even before the split, so the HTML is byte-identical.
     - measure-eager-bundle proves the BYTES left (the "Classy R." marker drops
       out of the eager set) but says nothing about whether the modal still
       opens. A deferral that ships a dead button would pass it perfectly.
     - the in-app Browser pane runs at viewport 0x0 and does not hydrate page
       content, so it cannot click anything.

   So this drives the real button in real headless Chrome and asserts the whole
   chain: the chunk is NOT fetched on load, hovering the trigger fetches it,
   clicking opens a studio with its real controls, and nothing throws.

     node scripts/probe-design-studio.mjs                    (default URLs)
     node scripts/probe-design-studio.mjs <url> [<url> ...]  */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const DEFAULT_URLS = ["/", "/qr-tools/url"].map((p) => ORIGIN + p);
const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_URLS;

/* Strings that exist only inside QRDesignStudio's own data — the same kind of
   marker measure-eager-bundle uses, for the same reason: identifiers get
   mangled by the minifier and module paths disappear, but data does not. */
const STUDIO_MARKERS = ["scan me", "classy r.", "extra r."];

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

const probe = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
  const scripts = () => performance.getEntriesByType("resource")
    .filter(e => e.name.endsWith(".js")).map(e => e.name);
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const MARKERS = ${JSON.stringify(STUDIO_MARKERS)};

  for (let i = 0; i < 60 && (document.readyState === "loading" || !document.body); i++) await sleep(250);

  /* The trigger, by its accessible text — the homepage renders it from the page
     dict and QRGenerator hard-codes it, so match on the shared English label. */
  const findTrigger = () => [...document.querySelectorAll("button")]
    .find(b => fold(b.innerText).includes("customize design"));

  let trigger = null, waited = 0;
  for (;;) {
    trigger = findTrigger();
    if ((trigger && fiberKey(trigger)) || waited >= 25000) break;
    await sleep(500); waited += 500;
  }
  if (!trigger) return JSON.stringify({ error: "no 'Customize Design' button found" });
  if (!fiberKey(trigger)) return JSON.stringify({ error: "the trigger never hydrated" });

  const before = scripts();

  /* WARM on intent, exactly as a pointer would. The React handler is
     onPointerEnter, so a pointerenter event is the honest simulation of a hover
     — dispatching mouseover would test a listener the component does not have
     and would report a working warm path as broken. */
  trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false }));

  let warmWaited = 0, warmed = [];
  for (;;) {
    warmed = scripts().filter(s => !before.includes(s));
    if (warmed.length || warmWaited >= 12000) break;
    await sleep(250); warmWaited += 250;
  }

  /* Did the chunk that arrived actually contain the studio? Re-fetch it from
     the page (it is same-origin and already in the HTTP cache) and look for the
     markers. This is what separates "some chunk loaded" from "the studio
     loaded" — the check the byte measurement cannot make on its own. */
  let markersInWarmedChunk = false;
  for (const s of warmed) {
    try {
      const body = (await (await fetch(s)).text()).toLowerCase();
      if (MARKERS.every(m => body.includes(m))) { markersInWarmedChunk = true; break; }
    } catch {}
  }

  trigger.click();

  /* Select the studio by its OWN label, not by [role="dialog"]. The first
     version of this probe took the first dialog on the page and got the COOKIE
     BANNER, which carries role="dialog" on every page — so it reported the
     studio as opening-but-empty on a build where the studio was still a plain
     static import that worked fine. A generic role selector on a page with more
     than one dialog is not a selector for anything. */
  const findStudio = () => [...document.querySelectorAll('[role="dialog"]')]
    .find(d => fold(d.getAttribute("aria-label")) === "qr design studio");

  let openWaited = 0, dialog = null;
  for (;;) {
    dialog = findStudio();
    const txt = fold(dialog && dialog.innerText);
    if ((dialog && MARKERS.some(m => txt.includes(m))) || openWaited >= 20000) break;
    await sleep(250); openWaited += 250;
  }

  const dlgText = fold(dialog && dialog.innerText);
  return JSON.stringify({
    viewport: [innerWidth, innerHeight],
    triggerHydrated: true,
    warmedScripts: warmed.length,
    warmMs: warmWaited,
    markersInWarmedChunk,
    opened: !!dialog,
    /* "Opening the Design Studio…" is the loader's own placeholder. Finding it
       still on screen after the poll means the chunk never resolved. */
    stuckOnPlaceholder: dlgText.includes("opening the design studio"),
    failedState: dlgText.includes("could not load"),
    markersOnScreen: MARKERS.filter(m => dlgText.includes(m)),
    /* The studio really rendered its UI, not just a shell: it mounts a canvas
       for the live QR preview and a colour input for the palette. */
    canvases: dialog ? dialog.querySelectorAll("canvas").length : 0,
    colorInputs: dialog ? dialog.querySelectorAll('input[type=color]').length : 0,
    openMs: openWaited,
    pageErrors: window.__err || 0,
  });
})()`;

let failures = 0;
for (const url of urls) {
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
    if (!out.warmedScripts) bad.push("hovering the trigger fetched nothing — the warm path is dead");
    if (!out.markersInWarmedChunk) bad.push("the chunk that arrived on hover is not the studio");
    if (!out.opened) bad.push("no dialog after the click");
    if (out.stuckOnPlaceholder) bad.push("stuck on the loader placeholder — the chunk never resolved");
    if (out.failedState) bad.push("the loader reported a failed chunk fetch");
    if ((out.markersOnScreen || []).length < 2) bad.push(`studio controls missing: only ${JSON.stringify(out.markersOnScreen)}`);
    if (!out.canvases) bad.push("the studio rendered no canvas — the live preview is missing");
    if (!out.colorInputs) bad.push("the studio rendered no colour input");
    if (out.pageErrors) bad.push(`${out.pageErrors} page errors`);
  }
  if (bad.length) failures++;

  console.log(`${bad.length ? "FAIL" : "ok  "}  ${url.replace(ORIGIN, "") || "/"}` +
    (out.error ? "" : `  warm:${out.warmedScripts} chunk(s) in ${out.warmMs}ms` +
      `  studio-chunk:${out.markersInWarmedChunk ? "yes" : "NO"}` +
      `  open:${out.openMs}ms  markers:${(out.markersOnScreen || []).length}/${STUDIO_MARKERS.length}` +
      `  canvas:${out.canvases}  color:${out.colorInputs}  errors:${out.pageErrors}`));
  for (const b of bad) console.log(`        ${b}`);
}

await browser.send("Browser.close").catch(() => {});
chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

console.log(`\n  design-studio: ${urls.length - failures}/${urls.length} URLs ok\n`);
process.exit(failures ? 1 : 0);
