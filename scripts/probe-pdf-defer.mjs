/* Live interaction probe for the deferred pdf-lib (M159).
   ───────────────────────────────────────────────────────────────────────────
   M159 moved pdf-lib (~219 KB, plus ~152 KB of standard-font metrics behind it)
   out of the eager bundle of thirteen PDF tool clients and behind an on-demand
   import. measure-eager-bundle proves the BYTES left. It cannot prove the tools
   still work — a deferral that ships a dead button passes a byte measurement
   perfectly, and M155 shipped exactly that bug for one deploy (a cached module
   scope turned the second open into a crash) precisely because the cheap
   instrument was green.

   curl cannot answer it either: none of pdf-lib's output is in the server HTML,
   before or after, so the pages are byte-identical to a fetch.

   So this drives a real file through a real tool in real headless Chrome and
   asserts the whole chain on production:

     1. on load, NO script in the page carries a pdf-lib marker  (it is deferred)
     2. selecting a file makes the tool render the page count     (it arrived,
        it parsed a real PDF, and the UI got the answer)
     3. a script carrying a pdf-lib marker is now loaded          (what arrived
        really is pdf-lib, not an empty chunk that happened to resolve)
     4. zero page errors throughout

   Steps 1 and 3 are the same question asked either side of the intent, so there
   is no race with Next's prefetcher to lose: the marker's ABSENCE before and
   PRESENCE after is decidable no matter what else the router pulls in between.
   That is the shape probe-design-studio had to be rewritten twice to reach.

   The fixture is generated here with the repo's own pdf-lib, so the PDF the
   browser parses is guaranteed valid and its page count is known exactly — a
   hand-rolled PDF that the tool rejects would look identical to a broken
   deferral.

     node scripts/probe-pdf-defer.mjs                    (default URLs)
     node scripts/probe-pdf-defer.mjs <url> [<url> ...]  */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PDFDocument } from "pdf-lib";

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
/* Both of these render a page count from pdf-lib on file select, which is the
   assertion that needs a working library. watermark and rotate are two separate
   clients, so a per-file mistake cannot pass by luck. */
const DEFAULT_URLS = ["/pdf-tools/watermark", "/pdf-tools/rotate"].map((p) => ORIGIN + p);
const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_URLS;

/* Literals out of pdf-lib's own DATA — the standard-font names. Identifiers get
   mangled by the minifier and module paths disappear; the string table does not.
   Both the pdf-lib chunk and the standard-fonts chunk carry these. */
const PDFLIB_MARKERS = ["Helvetica-BoldOblique", "ZapfDingbats"];
const PAGES = 3;

/* ---- fixture --------------------------------------------------------------- */
const doc = await PDFDocument.create();
for (let i = 0; i < PAGES; i++) doc.addPage([300, 400]).drawText(`probe page ${i + 1}`, { x: 40, y: 200, size: 14 });
const fixture = path.join(os.tmpdir(), `qrix-probe-${PAGES}p.pdf`);
fs.writeFileSync(fixture, await doc.save());

/* ---- chrome ---------------------------------------------------------------- */
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
  const listeners = [];
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    else if (msg.method) listeners.forEach((fn) => fn(msg));
  });
  const ready = new Promise((r) => ws.addEventListener("open", r));
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, (m) => (m.error ? reject(new Error(method + ": " + m.error.message)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });
  return { ws, ready, send, on: (fn) => listeners.push(fn) };
}

const browser = connect(wsUrl);
await browser.ready;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Which loaded scripts carry a pdf-lib marker. Asked in Node rather than in the
   page because the page cannot read a cross-origin script's source; the chunks
   are same-origin here, but fetching them from Node also keeps the answer
   independent of anything the page could have mutated. */
async function pdfLibScriptsLoaded(evaluate) {
  const raw = await evaluate(`JSON.stringify(performance.getEntriesByType("resource").filter(e => e.name.endsWith(".js")).map(e => e.name))`);
  const scripts = JSON.parse(raw);
  const hits = [];
  for (const s of scripts) {
    const res = await fetch(s).catch(() => null);
    if (!res || !res.ok) continue;
    const body = await res.text();
    if (PDFLIB_MARKERS.some((m) => body.includes(m))) hits.push(s.replace(ORIGIN, ""));
  }
  return { scripts, hits };
}

let failures = 0;
const report = [];

for (const url of urls) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (m, p = {}) => browser.send(m, p, sessionId);
  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || ""));
    return r.result.value;
  };

  const errors = [];
  browser.on((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");

  const fail = (why) => { failures++; report.push(`  FAIL  ${url}\n        ${why}`); };

  try {
    await send("Page.navigate", { url });
    /* Wait for the file input to exist AND for React to have hydrated it —
       setting files on a pre-hydration input fires a change no listener hears,
       which is a silent no-op that reads exactly like a broken deferral. */
    const hydrated = await evaluate(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
      for (let i = 0; i < 120; i++) {
        const el = document.querySelector('input[type="file"][accept*="pdf"], input[type="file"][accept*="application/pdf"]');
        if (el && fiberKey(el)) return "ok";
        await sleep(500);
      }
      return "the PDF file input never hydrated";
    })()`);
    if (hydrated !== "ok") { fail(hydrated); continue; }

    /* 1. deferred on load */
    const before = await pdfLibScriptsLoaded(evaluate);
    if (before.hits.length) {
      fail(`pdf-lib is in the page's script set BEFORE any file is chosen: ${before.hits.join(", ")} — the deferral is undone`);
      continue;
    }

    /* 2. the intent */
    const { root } = await send("DOM.getDocument");
    const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector: 'input[type="file"][accept*="pdf"]' });
    if (!nodeId) { fail("no PDF file input found in the DOM"); continue; }
    await send("DOM.setFileInputFiles", { files: [fixture], nodeId });

    const counted = await evaluate(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      /* The count renders as "N pages" in a badge. Read the whole body text —
         the badge markup differs between the two clients and the number is the
         thing under test, not the element that holds it. */
      for (let i = 0; i < 60; i++) {
        const m = document.body.innerText.match(/(\\d+)\\s+pages/i);
        if (m) return m[1];
        await sleep(500);
      }
      return "none";
    })()`);
    if (counted !== String(PAGES)) {
      fail(`the tool never rendered the page count of the ${PAGES}-page fixture (read: ${counted}) — pdf-lib did not load, or loaded and threw`);
      continue;
    }

    /* 3. what arrived really is pdf-lib */
    const after = await pdfLibScriptsLoaded(evaluate);
    if (!after.hits.length) {
      fail("the page count rendered but no loaded script carries a pdf-lib marker — the assertion above is measuring something else");
      continue;
    }

    /* 4. */
    if (errors.length) { fail(`page errors: ${errors.slice(0, 3).join(" | ")}`); continue; }

    report.push(`  ok    ${url}\n        deferred on load · ${counted} pages parsed after file select · arrived as ${after.hits.join(", ")} · +${after.scripts.length - before.scripts.length} scripts · 0 errors`);
  } catch (err) {
    fail(err.message);
  } finally {
    await browser.send("Target.closeTarget", { targetId }).catch(() => {});
  }
}

console.log("\n" + report.join("\n") + "\n");
chrome.kill();
/* Best-effort: on Windows Chrome still holds its profile directory for a moment
   after kill(), and an EPERM here would crash the run AFTER the report and mask
   the exit code the report earned. Leftovers are in the OS temp dir. */
try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* the OS will */ }
try { fs.rmSync(fixture, { force: true }); } catch { /* the OS will */ }
if (failures) {
  console.error(`  pdf-defer: ${failures} of ${urls.length} URL(s) failed\n`);
  process.exitCode = 1;
} else {
  console.log(`  pdf-defer: ${urls.length}/${urls.length} URLs green\n`);
}
