/* Brand mark → every size the app and the directories ask for.
   ───────────────────────────────────────────────────────────────────────────
   public/qrix-logo.svg is the ONE master. Everything else is generated:

     app/icon.png          64   favicon + JSON-LD publisher logo + Telegram thumb
     app/apple-icon.png   180   iOS home screen
     app/favicon.ico    32+64   /favicon.ico, which Next serves from app/
     public/qrix-logo.png 512   directory listings (SaaSHub, PeerPush, …)

   Hand-editing any of those is how a brand drifts: the favicon ends up a
   generation behind the app icon and nobody notices for months. Change the SVG,
   run this, commit what it writes.

   Same no-dependency CDP harness as scripts/probe-*.mjs and shoot-listing.mjs —
   a headless Chrome renders the SVG at an exact device size and we screenshot
   it. No sharp, no resvg, no canvas package for four files a year.

   The .ico is written by hand: an ICONDIR plus two PNG payloads. That has been
   valid since Vista and every browser we care about reads it, which beats
   pulling in a BMP encoder.

     node scripts/build-logo.mjs           write the files
     node scripts/build-logo.mjs --check   render and compare, write nothing
                                           (exit 1 if any file is stale) */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MASTER = path.join(ROOT, "public", "qrix-logo.svg");
const CHECK = process.argv.includes("--check");

/* size → where it lands. The .ico is assembled from the two smaller renders.

   `square` strips the tile's corner radius. That is only for apple-icon.png:
   iOS applies its own squircle mask, so shipping pre-rounded corners rounds the
   icon twice and leaves pale notches at the corners. Everywhere else the rounded
   tile with transparent corners is what we want. */
const TARGETS = [
  { size: 512, out: path.join(ROOT, "public", "qrix-logo.png") },
  { size: 180, out: path.join(ROOT, "app", "apple-icon.png"), square: true },
  { size: 64, out: path.join(ROOT, "app", "icon.png") },
  { size: 32, out: null },
];
const ICO = path.join(ROOT, "app", "favicon.ico");

const svg = fs.readFileSync(MASTER, "utf8");

/* Two files draw the mark in code rather than loading a generated PNG, and both
   can rot without anyone noticing:

     app/opengraph-image.tsx  the share card — the last thing anyone looks at
     components/Logo.tsx      the site header — the FIRST thing everyone looks at

   The header is why this list has two entries. The icon, the favicon and the
   share card were all changed in one pass while Logo.tsx quietly kept a gradient
   tile and three QR dots for a full release, on every page of the site.

   Compares the SHAPE TAGS only. The tsx copies have no newlines and no xmlns,
   so matching the whole file would fail forever; matching the rects, lines and
   paths catches every real change to the geometry or the colours. JSX writes
   stroke-width the same as SVG does, so the strings are directly comparable. */
const shapes = svg.match(/<(rect|line|circle|path)\b[^>]*>/g) || [];
const MIRRORS = [
  path.join(ROOT, "app", "opengraph-image.tsx"),
  path.join(ROOT, "components", "Logo.tsx"),
];
for (const file of MIRRORS) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  /* The JSX copy may self-close as `/>` where the master writes `>`; compare
     with the trailing bracket stripped so that difference is not a false alarm. */
  const missing = shapes.filter((s) => !src.includes(s.replace(/\s*\/?>$/, "")));
  if (missing.length) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    console.error(`${rel} no longer draws the master mark. Missing:`);
    for (const m of missing) console.error("  " + m);
    console.error("\nCopy the shapes from public/qrix-logo.svg into it.");
    process.exit(1);
  }
}

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("no Chrome/Edge binary found");

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qrix-logo-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu",
  "--hide-scrollbars", "--force-device-scale-factor=1", "about:blank",
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
const ws = new WebSocket(wsUrl);
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(method + ": " + m.error.message)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (m, p) => send(m, p, sessionId);
await call("Page.enable");
await call("Runtime.enable");

/* The SVG is inlined rather than fetched: no server to start, and the render
   cannot silently pick up a stale file from disk cache. */
function page(size, square) {
  let scaled = svg
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`);
  if (square) scaled = scaled.replace(/(<rect width="512" height="512") rx="\d+"/, "$1");
  return "data:text/html;charset=utf-8," + encodeURIComponent(
    `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>${scaled}`
  );
}

async function render(size, square) {
  await call("Emulation.setDeviceMetricsOverride", { width: size, height: size, deviceScaleFactor: 1, mobile: false });
  /* Transparent page background, and not only so the rounded corners come out
     clean. Chrome writes a PNG with no alpha channel when every pixel is opaque,
     and Next refuses to build an .ico whose PNGs are not RGBA — "The PNG is not
     in RGBA format!", which is a deploy that never lands rather than a red test.
     Transparent corners force colour type 6. The assertion below keeps it that
     way if anyone ever squares off the tile. */
  await call("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  await call("Page.navigate", { url: page(size, square) });
  /* Wait for the document AND for the SVG box to measure exactly `size`. A
     fixed sleep here produced a half-laid-out 0x0 render about one run in ten. */
  const ok = await call("Runtime.evaluate", {
    expression: `(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < 60; i++) {
        const s = document.querySelector("svg");
        if (document.readyState === "complete" && s && Math.round(s.getBoundingClientRect().width) === ${size}) return "ok";
        await sleep(50);
      }
      const s = document.querySelector("svg");
      return "measured " + (s ? Math.round(s.getBoundingClientRect().width) : "no svg");
    })()`,
    awaitPromise: true, returnByValue: true,
  });
  if (ok.result.value !== "ok") throw new Error(`render ${size}: ${ok.result.value}`);
  const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  return Buffer.from(shot.data, "base64");
}

const png = new Map();
for (const t of TARGETS) png.set(t.size, await render(t.size, t.square));

/* IHDR colour type lives at byte 25: 6 is RGBA. Asserted for the two renders
   that go inside the .ico, because that is the one place the wrong value stops
   a production build — and it does it on Vercel, not here. */
const colourType = (buf) => buf.readUInt8(25);
for (const size of [32, 64]) {
  const ct = colourType(png.get(size));
  if (ct !== 6) throw new Error(`the ${size}px render is PNG colour type ${ct}, not 6 (RGBA) — Next will refuse to build the .ico`);
}

await call("Emulation.clearDeviceMetricsOverride").catch(() => {});
ws.close();
chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

/* ICONDIR (6) + one ICONDIRENTRY (16) per image, then the PNG payloads.
   A width byte of 0 means 256; ours are 32 and 64 so they fit as-is. */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach((img, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(img.size >= 256 ? 0 : img.size, e);
    head.writeUInt8(img.size >= 256 ? 0 : img.size, e + 1);
    head.writeUInt8(0, e + 2);
    head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(img.data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += img.data.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.data)]);
}

const writes = [
  ...TARGETS.filter((t) => t.out).map((t) => ({ file: t.out, data: png.get(t.size), label: `${t.size}px` })),
  { file: ICO, data: ico([{ size: 32, data: png.get(32) }, { size: 64, data: png.get(64) }]), label: "32+64 ico" },
];

let stale = 0;
for (const w of writes) {
  const before = fs.existsSync(w.file) ? fs.readFileSync(w.file) : null;
  const same = before && before.equals(w.data);
  if (!same) stale++;
  if (!CHECK && !same) fs.writeFileSync(w.file, w.data);
  const rel = path.relative(ROOT, w.file).replace(/\\/g, "/");
  const kb = Math.round(w.data.length / 1024);
  console.log(`${same ? "same" : CHECK ? "STALE" : "wrote"}  ${rel.padEnd(24)} ${w.label.padEnd(10)} ${kb} KB`);
}

if (CHECK && stale) {
  console.log(`\n${stale} file(s) do not match public/qrix-logo.svg — run: node scripts/build-logo.mjs`);
  process.exit(1);
}
console.log(`\n${CHECK ? "checked" : "built"} ${writes.length} files from public/qrix-logo.svg`);
