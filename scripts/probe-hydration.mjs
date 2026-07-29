/* Hydration probe over the DevTools protocol — no puppeteer, no dependencies.
   ───────────────────────────────────────────────────────────────────────────
   Written for M147 because the in-app Browser pane could not answer the one
   question that mattered. That tab reports viewport 0x0, and on a tool page it
   never hydrates the main content — it showed a route that had NOT been
   changed (/image-tools/compress) with the exact same "no React fiber on the
   tool subtree" signature as the changed one, so it cannot distinguish a
   broken swap from its own broken rendering.

   This drives a real headless Chrome at a real viewport instead: launch with
   --remote-debugging-port, take the websocket URL Chrome prints, and speak CDP
   over Node's built-in WebSocket (Node 22+). Usage:

     node scripts/probe-hydration.mjs <url> [<url> ...]

   It reports, per URL, whether the tool subtree carries a React fiber and
   whether the live dropzone mounted — the two facts that decide whether an
   ssr:false engine actually took over from a server-rendered shell. */
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
if (!urls.length) throw new Error("usage: node scripts/probe-hydration.mjs <url> ...");

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
  await new Promise(r => setTimeout(r, 3500));
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith('__reactFiber'));
  const shellInput = document.getElementById('image-tool-file');
  const toolArea = document.querySelector('div.max-w-6xl') || document.querySelector('main');
  let fiberNodes = 0;
  document.querySelectorAll('*').forEach(n => { if (fiberKey(n)) fiberNodes++; });
  return JSON.stringify({
    viewport: [innerWidth, innerHeight],
    fiberNodes,
    totalNodes: document.querySelectorAll('*').length,
    toolAreaHydrated: !!fiberKey(toolArea),
    shellStillPresent: !!shellInput,
    shellHasFiber: !!fiberKey(shellInput),
    liveDropzone: document.querySelectorAll('[aria-label="Upload file"]').length,
    hiddenFileInputs: document.querySelectorAll('input[type=file].hidden').length,
    loadingFallbackVisible: document.body.innerHTML.includes('Loading the image workspace')
  });
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
