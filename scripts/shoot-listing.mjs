/* Listing screenshots — production pages captured at 1280x800 as PNG files.
   ───────────────────────────────────────────────────────────────────────────
   Directories (SaaSHub, AlternativeTo, Uneed …) all want the same thing: a few
   1280x800 shots of the real product. SaaSHub puts them on every "QRix vs X"
   comparison page, so with 17 competitors listed one capture run reaches 17
   pages that a person actually reads before choosing a tool.

   Same no-dependency CDP harness as scripts/probe-*.mjs: a headless Chrome is
   spawned, driven over the WebSocket it prints, and killed. Nothing is added to
   package.json for four screenshots a quarter.

   Two things that are NOT incidental:
     · the cookie banner and any consent overlay are hidden before the shot,
       because a listing image with a cookie bar in it looks like a stranger's
       screen grab rather than the product;
     · capture waits for the page to be hydrated AND for its images to have
       decoded, not for a fixed delay — a constant settle is what makes this
       kind of script produce a half-painted hero one run in ten.

     node scripts/shoot-listing.mjs                 (the default four pages)
     node scripts/shoot-listing.mjs /qr-tools/url   (any path, repeatable)
     QRIX_ORIGIN=http://localhost:3000 node scripts/shoot-listing.mjs

   Writes to scripts/.shots/ (git-ignored), one PNG per path. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, ".shots");

/* The four that earn a listing: what the site is, then the three families that
   actually carry demand — background removal, passport photos, the QR studio. */
const DEFAULT_PATHS = ["/", "/image-tools/remove-bg", "/passport-photo", "/qr-tools/url"];

const paths = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PATHS;

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("no Chrome/Edge binary found");

fs.mkdirSync(OUT, { recursive: true });

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qrix-shot-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu",
  "--hide-scrollbars", "--force-device-scale-factor=1",
  "--window-size=1280,800", "about:blank",
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

const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params) => browser.send(method, params, sessionId);

await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: 1280, height: 800, deviceScaleFactor: 1, mobile: false,
});

/* Runs in the page once it is painted. Anything that overlays the product —
   the consent bar, a chat bubble, a floating promo — is removed rather than
   waited out, because several of them never leave on their own. */
const CLEAN = `(() => {
  const gone = [];
  const kill = (el, why) => { if (el && el.isConnected) { el.style.setProperty("display", "none", "important"); gone.push(why); } };
  for (const el of document.querySelectorAll("body *")) {
    const id = ((el.id || "") + " " + (typeof el.className === "string" ? el.className : "")).toLowerCase();
    if (/cookie|consent|gdpr/.test(id)) kill(el, "consent");
  }
  const fixed = [...document.querySelectorAll("body > *")].filter(el => {
    const cs = getComputedStyle(el);
    return cs.position === "fixed" && el.getBoundingClientRect().bottom > innerHeight - 200;
  });
  fixed.forEach(el => kill(el, "fixed-bottom"));
  window.scrollTo(0, 0);
  return gone.join(",");
})()`;

/* Poll for readiness instead of sleeping: hydrated header, fonts done, and
   every in-viewport image actually decoded. */
const READY = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
  const hydrated = () => !!fiberKey(document.querySelector("header button, header a"));
  const imagesDone = () => [...document.images]
    .filter(img => img.getBoundingClientRect().top < innerHeight)
    .every(img => img.complete && img.naturalWidth > 0);
  for (let i = 0; i < 80; i++) {
    if (document.readyState === "complete" && hydrated() && imagesDone()) break;
    await sleep(250);
  }
  await document.fonts.ready;
  await sleep(600);
  return JSON.stringify({ hydrated: hydrated(), images: imagesDone(), title: document.title });
})()`;

const rows = [];
let failures = 0;

for (const p of paths) {
  const url = ORIGIN.replace(/\/$/, "") + p;
  const name = (p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "-")) + ".png";
  const file = path.join(OUT, name);

  await call("Page.navigate", { url });
  const ready = await call("Runtime.evaluate", { expression: READY, awaitPromise: true, returnByValue: true });
  const state = JSON.parse(ready.result.value);

  const cleaned = await call("Runtime.evaluate", { expression: CLEAN, returnByValue: true });
  const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(file, Buffer.from(shot.data, "base64"));

  const kb = Math.round(fs.statSync(file).size / 1024);
  /* A page that never hydrated still produces a PNG, and it would be a PNG of a
     skeleton. Say so loudly rather than shipping it to a directory. */
  const ok = state.hydrated && state.images && kb > 20;
  if (!ok) failures++;
  rows.push(`${ok ? "ok  " : "FAIL"} ${name.padEnd(28)} ${String(kb).padStart(4)} KB  hydrated=${state.hydrated} images=${state.images} hid=${cleaned.result.value || "-"}`);
}

await call("Emulation.clearDeviceMetricsOverride").catch(() => {});
browser.ws.close();
chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

console.log(rows.join("\n"));
console.log(`\n${paths.length - failures}/${paths.length} captured -> ${OUT}`);
process.exit(failures ? 1 : 0);
