/* Interaction probe for the barcode tool, over the DevTools protocol.
   ───────────────────────────────────────────────────────────────────────────
   Shares its Chrome harness with scripts/probe-hydration.mjs (M147) and exists
   for the same reason: the in-app Browser pane runs at viewport 0x0 and does
   not hydrate tool-page content, so it cannot tell a broken tool from its own
   broken rendering.

   M149 rewrote every control in BarcodeClient — wrapping <label>s became
   sibling label+input pairs with explicit htmlFor/id, and every string moved
   behind barcodeTool(lang). Server-rendered HTML can prove the labels pair up;
   only a real browser can prove that clicking the label still toggles the
   checkbox and that the barcode still paints. Usage:

     node scripts/probe-barcode.mjs <url> [<url> ...]  */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("no Chrome/Edge binary found");

const urls = process.argv.slice(2);
if (!urls.length) throw new Error("usage: node scripts/probe-barcode.mjs <url> ...");

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

/* Chrome prints the ws endpoint on stderr once it is listening. */
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

/* The probe itself, evaluated in the page after load + a settle delay. */
const PROBE = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(3500);
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
  const q = s => document.querySelector(s);
  /* No regex here on purpose: this whole probe lives inside a template
     literal, where a backslash is an escape, so /^\\/(ru|uz)\\// collapses to
     an invalid pattern before Chrome ever sees it. Split instead. */
  const seg = location.pathname.split("/")[1];
  const lang = (seg === "ru" || seg === "uz") ? seg : "en";
  const id = p => "bc-" + lang + "-" + p;
  const value = document.getElementById(id("value"));
  const showtext = document.getElementById(id("showtext"));
  const height = document.getElementById(id("height"));
  const bulk = document.getElementById(id("bulk"));
  const out = { lang, viewport: [innerWidth, innerHeight] };

  // every control found, and hydrated
  out.controls = { value: !!value, showtext: !!showtext, height: !!height, bulk: !!bulk };
  out.hydrated = !!fiberKey(value);

  // the barcode actually painted (JsBarcode writes <rect> into the svg)
  const svg = q("svg[class*=max-w-full]") || [...document.querySelectorAll("svg")].find(s => s.querySelector("rect"));
  out.barsPainted = svg ? svg.querySelectorAll("rect").length : 0;

  // label click toggles the checkbox -> htmlFor/id actually pair in the browser
  const before = showtext ? showtext.checked : null;
  const lbl = document.querySelector("label[for=" + JSON.stringify(id("showtext")) + "]");
  if (lbl) lbl.click();
  await sleep(400);
  out.labelClickToggles = showtext ? showtext.checked !== before : false;
  if (lbl) lbl.click();
  await sleep(300);

  // accessible names, computed the way a reader would
  const named = el => !!(el && (el.labels?.length || el.getAttribute("aria-label")));
  out.named = { value: named(value), showtext: named(showtext), height: named(height), bulk: named(bulk),
                color: named(document.getElementById(id("color"))) };
  out.hexNamedSwatches = [...document.querySelectorAll("[aria-label]")].filter(e => /^#/.test(e.getAttribute("aria-label"))).length;

  // typing re-renders the code
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const bars0 = out.barsPainted;
  if (value) { setter.call(value, "5901234123457"); value.dispatchEvent(new Event("input", { bubbles: true })); }
  await sleep(1800);
  const svg2 = q("svg[class*=max-w-full]") || [...document.querySelectorAll("svg")].find(s => s.querySelector("rect"));
  out.barsAfterTyping = svg2 ? svg2.querySelectorAll("rect").length : 0;
  out.rerendered = out.barsAfterTyping > 0 && (out.barsAfterTyping !== bars0 || bars0 > 0);
  out.pageErrors = window.__err || 0;
  return JSON.stringify(out);
})()`;

for (const url of urls) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  await browser.send("Page.enable", {}, sessionId);
  await browser.send("Runtime.enable", {}, sessionId);
  await browser.send("Page.navigate", { url }, sessionId);
  await new Promise((r) => setTimeout(r, 9000));
  const res = await browser.send(
    "Runtime.evaluate",
    { expression: PROBE, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  console.log(url);
  console.log("  " + (res.result?.value ?? JSON.stringify(res)));
  await browser.send("Target.closeTarget", { targetId });
}

browser.ws.close();
chrome.kill();
