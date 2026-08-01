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
   chain: a real mouse move onto the trigger loads the studio's chunk BEFORE any
   click, clicking opens a studio with its real controls, closing and reopening
   works (a different code path, and the one that broke), and nothing throws.

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

/* Phase 1: find the trigger and hand its screen position back, so the hover can
   be a REAL mouse move driven over CDP rather than a synthetic event.
   That distinction is the whole reason this is split in two. The first version
   dispatched `new PointerEvent("pointerenter")` on the element and reported the
   warm path as dead on a build where it works: React derives onPointerEnter from
   the BUBBLING pointerover/pointerout pair at the root and never listens for
   pointerenter itself, so the handler was never called. Dispatching the event a
   component "has" is not the same as producing the event a browser produces —
   and only the second one tests what a visitor gets. */
const findProbe = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();

  for (let i = 0; i < 60 && (document.readyState === "loading" || !document.body); i++) await sleep(250);

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

  /* If anything covers the button, a real pointer never reaches it and the warm
     dies silently — the probe would report "the warm path is dead" and be right
     without saying why. Hit-test so the report names the cause. The homepage
     runs a full-screen cursor-glow canvas and a dot background, either of which
     could grow a pointer-events:auto by accident.

     POLL it, and re-scroll each round. A single scrollIntoView + fixed settle
     read elementFromPoint as null on the homepage roughly one run in three: the
     page keeps animating after the scroll (MotionLayer, the scroll-scrubbed
     scenes), the rect drifts back out of the viewport, and elementFromPoint
     returns null for a point outside it — which is indistinguishable from
     "covered" unless you look. Waiting for the condition instead of the clock
     is the same fix probe-tool-i18n needed for its own fixed settle. */
  let r = null, hit = null, covered = true, settle = 0;
  for (;;) {
    trigger.scrollIntoView({ block: "center" });
    await sleep(400);
    r = trigger.getBoundingClientRect();
    hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    covered = !(hit && (hit === trigger || trigger.contains(hit)));
    if (!covered || settle >= 6000) break;
    settle += 400;
  }
  return JSON.stringify({
    x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height,
    covered,
    coveredBy: !covered ? null
      : hit ? (hit.tagName + "." + String(hit.className || "").split(" ")[0])
      : "nothing — the point is outside the viewport, so the button never settled in view",
  });
})()`;

/* Between the hover and the warm check: is the pointer REALLY on the button, and
   where is it now? The homepage's QR card levitates (.qx-float-stage is a
   continuous transform), so a centre measured at one instant has drifted by the
   time CDP dispatches the move a few milliseconds later — the pointer lands
   beside the button, no pointerover fires, and the warm silently never happens.
   That is what made the homepage pass one run in three while /qr-tools/url,
   whose card does not move, passed every time. :hover is the browser's own
   answer to "is the pointer on this element", so ask it and re-aim. */
const aimProbe = `(() => {
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const t = [...document.querySelectorAll("button")]
    .find(b => fold(b.innerText).includes("customize design"));
  if (!t) return JSON.stringify({ error: "the trigger vanished" });
  const r = t.getBoundingClientRect();
  return JSON.stringify({
    hovering: t.matches(":hover"),
    x: r.left + r.width / 2, y: r.top + r.height / 2,
  });
})()`;

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

  const trigger = findTrigger();
  if (!trigger) return JSON.stringify({ error: "the trigger vanished between phases" });

  /* The real mouse is already over the button — CDP moved it before this ran.
     Report EVERY loaded script, not the ones new since a snapshot.

     Diffing against a pre-hover snapshot is what the previous two revisions did
     and it races Next's prefetcher, which pulls ~25 route chunks while you hover
     the homepage: the studio's chunk kept falling outside whatever window the
     diff happened to catch, so the probe called the warm path dead on a build
     where a standalone diagnostic proved it fires. The question that actually
     matters has no race in it — is the studio's chunk loaded BEFORE the click? —
     and it needs no baseline, because two other instruments already establish
     the chunk is not there to begin with: measure-eager-bundle shows the marker
     is absent from the eager set, and the reopen leg here would be meaningless
     if it were eager. Ask the question that is decidable. */
  return JSON.stringify({ phase: "warm", warmed: scripts() });
})()`;

/* Phase 3: the click, the open, and the reopen. */
const openProbe = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const MARKERS = ${JSON.stringify(STUDIO_MARKERS)};

  const findTrigger = () => [...document.querySelectorAll("button")]
    .find(b => fold(b.innerText).includes("customize design"));
  const trigger = findTrigger();
  if (!trigger) return JSON.stringify({ error: "the trigger vanished between phases" });

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
  const canvases = dialog ? dialog.querySelectorAll("canvas").length : 0;
  const colorInputs = dialog ? dialog.querySelectorAll('input[type=color]').length : 0;

  /* CLOSE AND REOPEN, because the reopen is a different code path and it is the
     one that breaks. The chunk is cached at module scope by then, so the loader
     initialises its state FROM that cache — and useState(cached) passes React a
     function, which React calls as an initializer. The first open never touches
     it (the cache is empty), so a probe that opens once reports a green run on a
     build whose second open throws. */
  let reopened = null, reopenErr = null;
  if (dialog && !fold(dialog.innerText).includes("opening the design studio")) {
    const closeBtn = [...dialog.querySelectorAll("button")]
      .find(b => fold(b.getAttribute("aria-label")) === "close");
    if (!closeBtn) reopenErr = "no close button in the studio";
    else {
      const errBefore = window.__err || 0;
      closeBtn.click();
      let gone = false;
      for (let i = 0; i < 40 && !gone; i++) { await sleep(100); gone = !findStudio(); }
      if (!gone) reopenErr = "the studio did not close";
      else {
        (findTrigger() || trigger).click();
        let d2 = null;
        for (let i = 0; i < 60 && !d2; i++) {
          await sleep(100);
          const c = findStudio();
          if (c && MARKERS.some(m => fold(c.innerText).includes(m))) d2 = c;
        }
        reopened = !!d2;
        if ((window.__err || 0) > errBefore) reopenErr = "reopening threw " + ((window.__err || 0) - errBefore) + " error(s)";
      }
    }
  }

  return JSON.stringify({
    reopened,
    reopenErr,
    viewport: [innerWidth, innerHeight],
    opened: !!dialog,
    /* "Opening the Design Studio…" is the loader's own placeholder. Finding it
       still on screen after the poll means the chunk never resolved. */
    stuckOnPlaceholder: dlgText.includes("opening the design studio"),
    failedState: dlgText.includes("could not load"),
    markersOnScreen: MARKERS.filter(m => dlgText.includes(m)),
    /* The studio really rendered its UI, not just a shell: it mounts a canvas
       for the live QR preview and a colour input for the palette. */
    canvases,
    colorInputs,
    openMs: openWaited,
    pageErrors: window.__err || 0,
  });
})()`;

/* Does any of these chunks hold the studio? Fetched from Node, in parallel, with
   a cache that outlives the page — the same chunk is warmed on every URL, so the
   second page decides for free. */
const chunkCache = new Map();
async function holdsStudio(src) {
  if (chunkCache.has(src)) return chunkCache.get(src);
  let verdict = false;
  try {
    const body = (await (await fetch(src, { headers: { "user-agent": "Mozilla/5.0 QRix-studio-probe" } })).text()).toLowerCase();
    verdict = STUDIO_MARKERS.every((m) => body.includes(m));
  } catch { verdict = false; }
  chunkCache.set(src, verdict);
  return verdict;
}
async function checkWarm(warmed) {
  const verdicts = await Promise.all(warmed.map(holdsStudio));
  return verdicts.some(Boolean);
}

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

  const evaluate = async (expression) => {
    const res = await browser.send("Runtime.evaluate", {
      expression, awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (res.exceptionDetails) {
      throw new Error("page threw: " + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    }
    return JSON.parse(res.result.value);
  };

  let out;
  try {
    const at = await evaluate(findProbe);
    if (at.error) throw new Error(at.error);
    if (at.covered) throw new Error(`the trigger is covered by ${at.coveredBy} — a real pointer never reaches it`);

    /* A REAL mouse move, and it has to CROSS the boundary AFTER hydration has
       attached the handler. A browser only produces pointerover on a crossing,
       so a pointer parked on the button before React was ready never produces
       another one and the warm silently never fires. That is not hypothetical:
       it is what made the homepage — 1880 elements in one "use client" tree, so
       far slower to hydrate than /qr-tools/url — report a dead warm path while
       the tool template passed. Approach, leave, settle, approach again.
       A user hovering a button they can already click is doing the same thing. */
    const move = (x, y) => browser.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, buttons: 0 }, sessionId);
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    await move(1, 1);
    await move(at.x, at.y);

    /* Confirm the pointer landed, and chase the button if it moved. Each retry
       leaves and re-enters so a crossing is actually produced. */
    let aim = await evaluate(aimProbe);
    for (let i = 0; i < 12 && !aim.hovering; i++) {
      await move(1, 1);
      await pause(120);
      await move(aim.x, aim.y);
      await pause(120);
      aim = await evaluate(aimProbe);
    }
    if (!aim.hovering) throw new Error("could not park the pointer on the trigger — it keeps moving");

    /* Poll until the studio's chunk is loaded, up to 15 s, BEFORE any click. A
       fixed settle is not enough on the homepage: ~1880 elements in one "use
       client" tree keep the main thread busy for seconds after hydration, so the
       dynamic import's fetch is queued behind that work. It lands within ~250 ms
       on /qr-tools/url and takes seconds on the homepage, and a settle tuned on
       the fast page reported the slow one as dead. Wait for the condition, not
       the clock — the third time this probe has needed that lesson. */
    let warm = { warmed: [] }, markersInWarmedChunk = false, warmMs = 0;
    for (;;) {
      warm = await evaluate(probe);
      if (warm.error) throw new Error(warm.error);
      markersInWarmedChunk = await checkWarm(warm.warmed);
      if (markersInWarmedChunk || warmMs >= 15000) break;
      await pause(500); warmMs += 500;
    }

    const opened = await evaluate(openProbe);
    if (opened.error) throw new Error(opened.error);

    out = { ...opened, warmedScripts: warm.warmed.length, warmMs, markersInWarmedChunk };
  } catch (e) {
    out = { error: String(e) };
  }
  await browser.send("Target.closeTarget", { targetId });

  const bad = [];
  if (out.error) bad.push(out.error);
  else {
    if (!out.warmedScripts) bad.push("the page loaded no scripts at all");
    if (!out.markersInWarmedChunk) bad.push(`the studio chunk was not loaded before the click — the hover did not warm it (${out.warmedScripts} scripts loaded)`);
    if (!out.opened) bad.push("no dialog after the click");
    if (out.stuckOnPlaceholder) bad.push("stuck on the loader placeholder — the chunk never resolved");
    if (out.failedState) bad.push("the loader reported a failed chunk fetch");
    if ((out.markersOnScreen || []).length < 2) bad.push(`studio controls missing: only ${JSON.stringify(out.markersOnScreen)}`);
    if (!out.canvases) bad.push("the studio rendered no canvas — the live preview is missing");
    if (!out.colorInputs) bad.push("the studio rendered no colour input");
    if (out.reopenErr) bad.push(out.reopenErr);
    if (out.reopened === false) bad.push("the studio did not come back on a second open — the cached path is broken");
    if (out.pageErrors) bad.push(`${out.pageErrors} page errors`);
  }
  if (bad.length) failures++;

  console.log(`${bad.length ? "FAIL" : "ok  "}  ${url.replace(ORIGIN, "") || "/"}` +
    (out.error ? "" : `  warm:${out.warmedScripts} chunk(s) in ${out.warmMs}ms` +
      `  studio-chunk:${out.markersInWarmedChunk ? "yes" : "NO"}` +
      `  open:${out.openMs}ms  markers:${(out.markersOnScreen || []).length}/${STUDIO_MARKERS.length}` +
      `  canvas:${out.canvases}  color:${out.colorInputs}` +
      `  reopen:${out.reopened === null ? "skipped" : out.reopened ? "ok" : "FAILED"}  errors:${out.pageErrors}`));
  for (const b of bad) console.log(`        ${b}`);
}

await browser.send("Browser.close").catch(() => {});
chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

console.log(`\n  design-studio: ${urls.length - failures}/${urls.length} URLs ok\n`);
process.exit(failures ? 1 : 0);
