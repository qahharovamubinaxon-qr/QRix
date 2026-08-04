/* Live interaction probe for TopNav's deferred panels (M163).
   ───────────────────────────────────────────────────────────────────────────
   Shares its Chrome harness with probe-design-studio (M155). It exists because
   what M163 changed is invisible to every cheaper instrument:

     - curl cannot see it. The mega-menu, the account menu and the mobile
       account grid were never in the server HTML — they render on a gesture —
       so the HTML is byte-identical either side of the split.
     - measure-eager-bundle proves the BYTES left (the "Many QR from CSV"
       marker drops out of the eager set) and says nothing about whether the
       menus still open. A deferral that ships three dead menus passes it
       perfectly.
     - the in-app Browser pane runs at viewport 0x0 and does not hydrate page
       content, so it cannot hover or click anything.

   Three legs, and the third is the one that matters most:

     1. desktop hover  — a REAL mouse crossing into the nav opens the QR Tools
                         mega-menu with its own entries in it.
     2. desktop click  — the account button opens a menu with its own entries.
     3. MOBILE tap     — the burger opens the sheet, and the ten primary nav
                         links are in it. Those links are deliberately NOT in
                         the deferred chunk: on a phone the sheet is the only
                         navigation there is, so a dropped chunk must cost the
                         visitor their shortcuts and never their way off the
                         page. Leg 3 is the regression test for that promise.

     node scripts/probe-nav-panels.mjs                    (default URLs)
     node scripts/probe-nav-panels.mjs <url> [<url> ...]  */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const DEFAULT_URLS = ["/", "/qr-tools/url"].map((p) => ORIGIN + p);
const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_URLS;

/* Marker strings out of each panel's OWN data. Same rule measure-eager-bundle
   follows and for the same reason — identifiers are mangled and module paths
   disappear, data does not. "Digital business card" is deliberately NOT used
   here even though it sits in the mega-menu: it also lives in qr-tools-meta and
   DashboardClient, so it would match a page that merely lists QR tools. */
const MEGA_MARKERS = ["many qr from csv", "all qr tools", "printable 'scan me' flyer"];
/* "Workspace" is in the desktop account menu and NOT in the mobile grid, so it
   tells the two panels apart — they otherwise share five of six entries. */
const ACCOUNT_MARKERS = ["workspace", "favorites", "history"];
const MOBILE_ACCOUNT_MARKERS = ["favorites", "history", "settings"];

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("no Chrome/Edge binary found");

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qrix-nav-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--window-size=1440,900",
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

/* Shared preamble. `expectPath` is M162's lesson, paid for twice: Runtime.evaluate
   issued after Page.navigate can still bind to the OUTGOING document, and a probe
   that grades the wrong document reports a perfectly good page as broken. Refuse
   to grade rather than guess. */
const preamble = (expectPath) => `
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));
  for (let i = 0; i < 80; i++) {
    if (location.pathname === ${JSON.stringify(expectPath)} && document.readyState !== "loading" && document.body) break;
    await sleep(250);
  }
  if (location.pathname !== ${JSON.stringify(expectPath)}) {
    return JSON.stringify({ instrumentFault: "graded " + location.pathname + ", expected " + ${JSON.stringify(expectPath)} });
  }
  const header = () => document.querySelector("header.qx-topnav");
`;

/* Leg 1, phase A: locate the "QR Tools" nav link and hand back its screen
   position, so the hover is a REAL mouse move over CDP. Dispatching a synthetic
   pointerenter does not test this: React derives onPointerEnter from the
   BUBBLING pointerover/pointerout pair at the root and never listens for
   pointerenter itself, so a dispatched event calls no handler (the trap that
   made probe-design-studio report a working warm path as dead). */
const findMegaTrigger = (expectPath) => `(async () => {${preamble(expectPath)}
  const findNav = () => document.querySelector('nav[aria-label="Primary"]');
  let nav = null, waited = 0;
  for (;;) {
    nav = findNav();
    if ((nav && fiberKey(nav)) || waited >= 25000) break;
    await sleep(500); waited += 500;
  }
  if (!nav) return JSON.stringify({ error: "no primary nav found — the desktop bar is not rendered at this width" });
  if (!fiberKey(nav)) return JSON.stringify({ error: "the primary nav never hydrated" });

  const link = [...nav.querySelectorAll("a")].find(a => a.getAttribute("href") === "/qr-tools");
  if (!link) return JSON.stringify({ error: "no /qr-tools link in the primary nav" });

  /* Poll the hit-test and re-scroll each round rather than settling on a clock:
     the header is sticky and the pages animate after load, so a single
     scrollIntoView reads elementFromPoint as null often enough to look like
     "covered" when it only means "not in the viewport yet". */
  let r = null, hit = null, covered = true, settle = 0;
  for (;;) {
    r = link.getBoundingClientRect();
    hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    covered = !(hit && (hit === link || link.contains(hit) || hit.contains(link)));
    if (!covered || settle >= 6000) break;
    await sleep(400); settle += 400;
  }
  return JSON.stringify({
    x: r.left + r.width / 2, y: r.top + r.height / 2,
    covered,
    coveredBy: !covered ? null
      : hit ? (hit.tagName + "." + String(hit.className || "").split(" ")[0])
      : "nothing — the point is outside the viewport",
  });
})()`;

/* Is the pointer really on the link, and where is it now? The header slides
   between its transparent and floating-glass states on scroll, so a centre
   measured at one instant can drift before CDP dispatches the move. :hover is
   the browser's own answer to "is the pointer on this element". */
const aimAt = (expectPath) => `(() => {
  const nav = document.querySelector('nav[aria-label="Primary"]');
  if (!nav) return JSON.stringify({ error: "the primary nav vanished" });
  const link = [...nav.querySelectorAll("a")].find(a => a.getAttribute("href") === "/qr-tools");
  if (!link) return JSON.stringify({ error: "the /qr-tools link vanished" });
  const r = link.getBoundingClientRect();
  return JSON.stringify({ hovering: link.matches(":hover"), x: r.left + r.width / 2, y: r.top + r.height / 2 });
})()`;

/* Leg 1, phase B: the pointer is parked on the link. Wait for the panel — for
   the CONDITION, not a fixed settle: the chunk is warmed on the crossing into
   the nav and resolves in ~250 ms on a tool page but seconds on the homepage,
   whose whole tree is one "use client" component. A settle tuned on the fast
   page reports the slow one as dead. */
const readMega = (expectPath) => `(async () => {${preamble(expectPath)}
  const MARKERS = ${JSON.stringify(MEGA_MARKERS)};
  const nav = document.querySelector('nav[aria-label="Primary"]');
  if (!nav) return JSON.stringify({ error: "the primary nav vanished between phases" });

  let seen = [], waited = 0;
  for (;;) {
    const txt = fold(nav.innerText);
    seen = MARKERS.filter(m => txt.includes(m));
    if (seen.length >= 2 || waited >= 15000) break;
    await sleep(250); waited += 250;
  }
  const link = [...nav.querySelectorAll("a")].find(a => a.getAttribute("href") === "/qr-tools");
  return JSON.stringify({
    markers: seen,
    openMs: waited,
    /* the panel is a real menu of links, not an empty shell */
    panelLinks: [...nav.querySelectorAll("a")].length,
    expanded: link ? link.getAttribute("aria-expanded") : null,
    pageErrors: window.__err || 0,
  });
})()`;

/* Leg 2: the account button. A click, not a hover — and the button is found by
   its aria-label, because the header holds several icon-only buttons and "the
   first button" is not a selector for anything. */
const readAccount = (expectPath) => `(async () => {${preamble(expectPath)}
  const MARKERS = ${JSON.stringify(ACCOUNT_MARKERS)};
  const h = header();
  if (!h) return JSON.stringify({ error: "no header on the page" });
  /* POLL for hydration, do not sample it. app/page.tsx is one giant "use client"
     component (~1880 elements), so the homepage attaches React seconds after the
     tool templates do — a single fiber check right after load reports a working
     header as dead there and passes everywhere else. That asymmetry is exactly
     what the first run of this probe produced. */
  const findAccount = () => [...h.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === "Account menu");
  let btn = null, hydrateWaited = 0;
  for (;;) {
    btn = findAccount();
    if ((btn && fiberKey(btn)) || hydrateWaited >= 25000) break;
    await sleep(500); hydrateWaited += 500;
  }
  if (!btn) return JSON.stringify({ error: "no account button" });
  if (!fiberKey(btn)) return JSON.stringify({ error: "the account button never hydrated in 25s" });

  const errBefore = window.__err || 0;
  btn.click();
  let seen = [], waited = 0;
  for (;;) {
    const txt = fold(h.innerText);
    seen = MARKERS.filter(m => txt.includes(m));
    if (seen.length >= 2 || waited >= 15000) break;
    await sleep(250); waited += 250;
  }
  return JSON.stringify({
    markers: seen,
    openMs: waited,
    expanded: btn.getAttribute("aria-expanded"),
    threw: (window.__err || 0) - errBefore,
    pageErrors: window.__err || 0,
  });
})()`;

/* Leg 3, the safety property. At phone width the burger is the only way to the
   ten primary links, and those links are NOT in the deferred chunk. So this
   asserts two different things with two different meanings:
     · the primary links are in the sheet          -> the promise M163 made
     · the account grid markers arrive             -> the deferral still works
   The first failing is a navigation regression; the second failing is only a
   lost shortcut. The report distinguishes them. */
const readMobile = (expectPath) => `(async () => {${preamble(expectPath)}
  const ACCOUNT = ${JSON.stringify(MOBILE_ACCOUNT_MARKERS)};
  const h = header();
  if (!h) return JSON.stringify({ error: "no header on the page" });
  /* Same poll, same reason as the account button above — and this is the leg
     that caught it: the homepage reported "the burger never hydrated" while the
     tool template passed, on a build where both work. A sampled fiber check
     measures how fast a page hydrates, not whether its header is wired. */
  const findBurger = () => [...h.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === "Menu");
  let btn = null, hydrateWaited = 0;
  for (;;) {
    btn = findBurger();
    if ((btn && fiberKey(btn)) || hydrateWaited >= 25000) break;
    await sleep(500); hydrateWaited += 500;
  }
  if (!btn) return JSON.stringify({ error: "no burger button — is the viewport really below xl?" });
  if (!fiberKey(btn)) return JSON.stringify({ error: "the burger never hydrated in 25s" });

  btn.click();

  /* The sheet's own nav, by its label. */
  const findSheet = () => h.querySelector('nav[aria-label="Mobile"]');
  let sheet = null;
  for (let i = 0; i < 60 && !sheet; i++) { await sleep(100); sheet = findSheet(); }
  if (!sheet) return JSON.stringify({ error: "the mobile sheet never opened" });

  /* The primary links, by href — label text is localised, hrefs are not. */
  const PRIMARY = ["/", "/qr-tools", "/pdf-tools", "/image-tools", "/ai-tools",
                   "/video-tools", "/3d-tools", "/dashboard", "/pricing", "/blog"];
  const hrefs = () => [...sheet.querySelectorAll("a")].map(a => a.getAttribute("href"));
  const primaryPresent = PRIMARY.filter(p => hrefs().includes(p));

  /* Whether the primary links needed to WAIT is the whole question: they are
     eager, so they must already be there on the first frame the sheet exists. */
  const primaryImmediate = primaryPresent.length;

  let account = [], waited = 0;
  for (;;) {
    const txt = fold(sheet.innerText);
    account = ACCOUNT.filter(m => txt.includes(m));
    if (account.length >= 2 || waited >= 15000) break;
    await sleep(250); waited += 250;
  }
  return JSON.stringify({
    primaryImmediate,
    primaryExpected: PRIMARY.length,
    missingPrimary: PRIMARY.filter(p => !hrefs().includes(p)),
    account,
    accountMs: waited,
    pageErrors: window.__err || 0,
  });
})()`;

let failures = 0;
const runs = [];
for (const url of urls) {
  const pathOf = new URL(url).pathname;

  /* ---- desktop legs ------------------------------------------------------ */
  const desk = await withPage(url, 1440, 900, async ({ evaluate, move, pause }) => {
    const at = await evaluate(findMegaTrigger(pathOf));
    if (at.instrumentFault || at.error) throw new Error(at.instrumentFault || at.error);
    if (at.covered) throw new Error(`the /qr-tools link is covered by ${at.coveredBy} — a real pointer never reaches it`);

    /* The move has to CROSS the boundary AFTER hydration attached the handler:
       a browser only produces pointerover on a crossing, so a pointer parked on
       the nav before React was ready never produces another one and neither the
       warm nor the open ever fires. Approach, leave, approach again. */
    await move(1, 1);
    await move(at.x, at.y);
    let aim = await evaluate(aimAt(pathOf));
    for (let i = 0; i < 12 && !aim.hovering; i++) {
      await move(1, 1); await pause(120);
      await move(aim.x, aim.y); await pause(120);
      aim = await evaluate(aimAt(pathOf));
    }
    if (!aim.hovering) throw new Error("could not park the pointer on the /qr-tools link");

    const mega = await evaluate(readMega(pathOf));
    if (mega.instrumentFault || mega.error) throw new Error(mega.instrumentFault || mega.error);

    /* Leave the nav so the mega-menu closes before the account menu opens. */
    await move(1, 400); await pause(300);

    const account = await evaluate(readAccount(pathOf));
    if (account.instrumentFault || account.error) throw new Error(account.instrumentFault || account.error);
    return { mega, account };
  });

  /* ---- mobile leg -------------------------------------------------------- */
  const mob = await withPage(url, 390, 844, async ({ evaluate }) => {
    const m = await evaluate(readMobile(pathOf));
    if (m.instrumentFault || m.error) throw new Error(m.instrumentFault || m.error);
    return m;
  });

  const bad = [];
  if (desk.error) bad.push("desktop: " + desk.error);
  else {
    if (desk.mega.markers.length < 2) bad.push(`the mega-menu did not open with its entries: only ${JSON.stringify(desk.mega.markers)} after ${desk.mega.openMs}ms`);
    if (desk.mega.expanded !== "true") bad.push(`aria-expanded is "${desk.mega.expanded}" — the panel is open but not announced`);
    if (desk.account.markers.length < 2) bad.push(`the account menu did not open with its entries: only ${JSON.stringify(desk.account.markers)} after ${desk.account.openMs}ms`);
    if (desk.account.threw) bad.push(`opening the account menu threw ${desk.account.threw} error(s)`);
  }
  if (mob.error) bad.push("mobile: " + mob.error);
  else {
    /* Ranked first on purpose: this one is a navigation regression, the others
       are lost shortcuts. */
    if (mob.primaryImmediate < mob.primaryExpected) {
      bad.push(`NAVIGATION REGRESSION: the mobile sheet is missing ${JSON.stringify(mob.missingPrimary)} — the primary links must not depend on the deferred chunk`);
    }
    if (mob.account.length < 2) bad.push(`the mobile account grid did not arrive: only ${JSON.stringify(mob.account)} after ${mob.accountMs}ms`);
  }
  if (bad.length) failures++;
  runs.push({ url, bad, desk, mob });

  console.log(`${bad.length ? "FAIL" : "ok  "}  ${url.replace(ORIGIN, "") || "/"}` +
    (desk.error ? "  desktop:ERROR" : `  mega:${desk.mega.markers.length}/${MEGA_MARKERS.length} in ${desk.mega.openMs}ms` +
      `  account:${desk.account.markers.length}/${ACCOUNT_MARKERS.length} in ${desk.account.openMs}ms`) +
    (mob.error ? "  mobile:ERROR" : `  mobile-primary:${mob.primaryImmediate}/${mob.primaryExpected}` +
      `  mobile-account:${mob.account.length}/${MOBILE_ACCOUNT_MARKERS.length} in ${mob.accountMs}ms`));
  for (const b of bad) console.log(`        ${b}`);
}

async function withPage(url, width, height, fn) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  await browser.send("Runtime.enable", {}, sessionId);
  await browser.send("Page.enable", {}, sessionId);
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width < 900,
  }, sessionId);
  await browser.send("Runtime.evaluate", {
    expression: "window.__err=0;addEventListener('error',()=>window.__err++);",
  }, sessionId);
  await browser.send("Page.navigate", { url }, sessionId);

  const evaluate = async (expression) => {
    const res = await browser.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
    if (res.exceptionDetails) throw new Error("page threw: " + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    return JSON.parse(res.result.value);
  };
  const move = (x, y) => browser.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, buttons: 0 }, sessionId);
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  let out;
  try { out = await fn({ evaluate, move, pause }); }
  catch (e) { out = { error: String(e.message || e) }; }
  await browser.send("Target.closeTarget", { targetId });
  return out;
}

await browser.send("Browser.close").catch(() => {});
chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

console.log(`\n  nav-panels: ${urls.length - failures}/${urls.length} URLs ok\n`);
process.exit(failures ? 1 : 0);
