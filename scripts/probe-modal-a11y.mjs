/* Live probe for dialog keyboard behaviour (M157) — real headless Chrome, CDP.

   npm run test:modal-a11y is STRUCTURAL. It proves every overlay is wired to
   the hook; it cannot prove the hook works. A useModalA11y that returned a
   fresh useRef and did nothing else would pass all 46 of its assertions.

   And this specifically cannot be tested with synthetic events. Dispatching
   `new KeyboardEvent("keydown", {key:"Tab"})` does NOT move focus — only the
   browser's own Tab does — so a probe built from synthetic events would report
   "focus stayed inside the dialog" on a build with no trap at all, because
   focus never moved anywhere. That is the M155 pointerenter trap exactly: the
   event a component "has" is not the event a browser produces. Every keystroke
   below goes through Input.dispatchKeyEvent, which is real input.

   What it asserts, on production, per URL:
     · opening the studio FROM THE KEYBOARD moves focus into the dialog
     · Tab cycles and never escapes the dialog (the trap)
     · Escape closes it (there was no Escape at all before this)
     · focus returns to the button that opened it (restoration)

   Usage: npm run probe:modal-a11y [url ...] */

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

const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["https://qrixtools.com/qr-tools/url", "https://qrixtools.com/qr-tools/wifi"];

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qrix-a11y-"));
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
  return { ready, send };
}

const browser = connect(wsUrl);
await browser.ready;

/* Focus the trigger and mark it, so "focus came back to what opened this" is
   decidable later without depending on the element's identity surviving a
   React re-render. Activation is a REAL Enter keypress, not .click(): a
   programmatic click leaves focus wherever it was, so restoration would be
   trivially satisfied by doing nothing at all. This is the keyboard user's
   path, and a keyboard user is who the fix is for. */
const armProbe = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const fiberKey = n => n && Object.keys(n).find(k => k.startsWith("__reactFiber"));

  for (let i = 0; i < 60 && (document.readyState === "loading" || !document.body); i++) await sleep(250);

  const find = () => [...document.querySelectorAll("button")]
    .find(b => fold(b.innerText).includes("customize design"));

  let trigger = null, waited = 0;
  for (;;) {
    trigger = find();
    if ((trigger && fiberKey(trigger)) || waited >= 25000) break;
    await sleep(500); waited += 500;
  }
  if (!trigger) return JSON.stringify({ error: "no 'Customize Design' button found" });
  if (!fiberKey(trigger)) return JSON.stringify({ error: "the trigger never hydrated" });

  trigger.dataset.qrixProbeTrigger = "1";
  trigger.scrollIntoView({ block: "center" });
  await sleep(300);
  trigger.focus();
  return JSON.stringify({ focused: document.activeElement === trigger });
})()`;

/* Read-only: where is focus, and is the studio open? Kept separate from the
   keystrokes so that every assertion is made against real browser state after
   real input, never against state this script itself produced. */
const stateProbe = `(() => {
  const fold = s => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const dialog = [...document.querySelectorAll('[role="dialog"]')]
    .find(d => fold(d.getAttribute("aria-label")) === "qr design studio");
  const a = document.activeElement;
  const describe = el => !el ? "none"
    : el === document.body ? "body"
    : (el.tagName.toLowerCase()
       + (el.dataset && el.dataset.qrixProbeTrigger ? "[trigger]" : "")
       + (el.getAttribute && el.getAttribute("aria-label") ? '[' + el.getAttribute("aria-label") + ']' : ""));
  return JSON.stringify({
    open: !!dialog,
    stuckOnPlaceholder: fold(dialog && dialog.innerText).includes("opening the design studio"),
    focusInsideDialog: !!(dialog && a && dialog.contains(a)),
    focusOnTrigger: !!(a && a.dataset && a.dataset.qrixProbeTrigger === "1"),
    focusIs: describe(a),
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

  const evaluate = async (expression) => {
    const res = await browser.send("Runtime.evaluate", {
      expression, awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (res.exceptionDetails) {
      throw new Error("page threw: " + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    }
    return JSON.parse(res.result.value);
  };

  /* Real key input, and the `text` field is load-bearing. Chrome performs a
     key's DEFAULT ACTION only for a "keyDown" carrying text; a "rawKeyDown"
     notifies listeners but does not activate. The first run of this probe sent
     Enter as rawKeyDown, the button was never pressed, and it reported "the
     studio never opened" against a build where opening works — an instrument
     failure wearing the costume of a finding. Enter therefore carries "\r";
     Tab and Escape have no text and take the raw form, which is exactly what
     a real browser emits for them. */
  const key = async (name, code, keyCode, text) => {
    await browser.send("Input.dispatchKeyEvent", {
      type: text ? "keyDown" : "rawKeyDown",
      key: name, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode,
      ...(text ? { text } : {}),
    }, sessionId);
    await browser.send("Input.dispatchKeyEvent", {
      type: "keyUp", key: name, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode,
    }, sessionId);
    await new Promise((r) => setTimeout(r, 120));
  };
  const tab = () => key("Tab", "Tab", 9);
  const enter = () => key("Enter", "Enter", 13, "\r");
  const escape = () => key("Escape", "Escape", 27);

  const problems = [];
  let report = {};
  try {
    const armed = await evaluate(armProbe);
    if (armed.error) throw new Error(armed.error);
    if (!armed.focused) throw new Error("could not put keyboard focus on the trigger");

    /* Open it the way a keyboard user does. */
    await enter();
    let opened = null;
    for (let i = 0; i < 60; i++) {
      opened = await evaluate(stateProbe);
      if (opened.open && !opened.stuckOnPlaceholder) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    /* If it never opened, everything downstream measures nothing — a trap
       cannot be tested on an absent dialog, and "Escape closed it" is
       vacuously true of a dialog that was never there. Report the one real
       failure and stop, rather than three that read like independent
       findings. */
    if (!opened.open || opened.stuckOnPlaceholder) {
      throw new Error(opened.stuckOnPlaceholder
        ? "the studio chunk never resolved — nothing downstream is measurable"
        : "the studio never opened from a keyboard Enter — nothing downstream is measurable");
    }
    if (!opened.focusInsideDialog) {
      problems.push(`opening did not move focus into the dialog (focus is ${opened.focusIs})`);
    }

    /* THE TRAP. Ten real Tabs is more than the studio has focusable controls,
       so without a trap focus is out of the dialog and into the page behind
       it well before the tenth — which is precisely the bug being fixed. */
    let escapedAt = 0;
    for (let i = 1; i <= 10 && !escapedAt; i++) {
      await tab();
      const s = await evaluate(stateProbe);
      if (!s.open) { escapedAt = -i; break; }
      if (!s.focusInsideDialog) escapedAt = i;
    }
    if (escapedAt > 0) problems.push(`focus left the dialog on Tab #${escapedAt}`);
    if (escapedAt < 0) problems.push(`the dialog closed during tabbing (Tab #${-escapedAt})`);

    /* Escape, then restoration. */
    await escape();
    let closed = null;
    for (let i = 0; i < 20; i++) {
      closed = await evaluate(stateProbe);
      if (!closed.open) break;
      await new Promise((r) => setTimeout(r, 150));
    }
    if (closed.open) problems.push("Escape did not close the dialog");
    else if (!closed.focusOnTrigger) {
      problems.push(`focus did not return to the trigger (it is on ${closed.focusIs})`);
    }
    if (closed.pageErrors) problems.push(`${closed.pageErrors} page error(s)`);

    report = {
      openedFromKeyboard: !!opened.open,
      focusMovedIn: !!opened.focusInsideDialog,
      tabsHeldInside: escapedAt === 0 ? 10 : Math.abs(escapedAt) - 1,
      escapeClosed: !closed.open,
      focusRestored: !!closed.focusOnTrigger,
      pageErrors: closed.pageErrors,
    };
  } catch (e) {
    problems.push(e.message);
  }

  await browser.send("Target.closeTarget", { targetId });

  if (problems.length) {
    failures++;
    console.log(`\nFAIL ${url}`);
    for (const p of problems) console.log(`  · ${p}`);
    if (Object.keys(report).length) console.log(`  ${JSON.stringify(report)}`);
  } else {
    console.log(`\nok   ${url}`);
    console.log(`  ${JSON.stringify(report)}`);
  }
}

chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

console.log(failures ? `\n${failures}/${urls.length} URL(s) failed` : `\nall ${urls.length} URL(s) green`);
process.exit(failures ? 1 : 0);
