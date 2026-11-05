/**
 * QRix content factory — live screen recording.
 *
 * The first cut used still screenshots with a slow zoom, and it read as a
 * slideshow because that is what it was. This records the tool actually being
 * used: the pointer travels, the file lands, the crop is dragged, the download
 * button is pressed. Motion that comes from the product is the one thing a
 * motion-graphics layer cannot fake.
 *
 * Playwright drives real input events but draws no pointer, so one is injected
 * and driven by those same events — it tracks the real mouse rather than being
 * animated separately, which means it can never disagree with what the page
 * received.
 *
 * Usage: node pipeline/record.mjs <scriptId> <url>
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const [id, url] = process.argv.slice(2);
const outDir = join(root, "public", "rec", id);
const rawDir = join(outDir, ".raw");
rmSync(rawDir, { recursive: true, force: true });
mkdirSync(rawDir, { recursive: true });

const CURSOR = `
  (() => {
    const c = document.createElement('div');
    c.id = '__qrix_cursor';
    c.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:19px', 'height:19px',
      'margin:-9.5px 0 0 -9.5px', 'border-radius:50%',
      'background:radial-gradient(circle at 34% 34%, #fff 0%, #ff9a73 42%, #ff4d1c 100%)',
      'box-shadow:0 0 0 4px rgba(255,77,28,.22), 0 6px 15px rgba(0,0,0,.5)',
      'pointer-events:none', 'z-index:2147483647',
      'transform:translate3d(-100px,-100px,0)',
    ].join(';');
    // At document_start there is no body yet, and anything parked on
    // <html> is liable to be moved or dropped once parsing continues — the
    // first recording came back with no pointer at all for exactly this
    // reason. Wait for a body, then keep it pinned as the last child so a
    // client-side render cannot bury it.
    const attach = () => {
      if (!document.body) return false;
      document.body.appendChild(c);
      new MutationObserver(() => {
        if (c.parentNode !== document.body) document.body.appendChild(c);
      }).observe(document.body, { childList: true });
      return true;
    };
    if (!attach()) {
      document.addEventListener('DOMContentLoaded', attach, { once: true });
    }
    const put = (e) => {
      c.style.transform =
        'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0) scale(' +
        (e.buttons ? 0.78 : 1) + ')';
    };
    addEventListener('mousemove', put, true);
    addEventListener('mousedown', put, true);
    addEventListener('mouseup', put, true);
  })();
`;

/** Move in small steps so the pointer reads as a hand, not a teleport. */
const glide = async (page, to, steps = 26) => {
  await page.mouse.move(to[0], to[1], { steps });
};

/**
 * The composition needs to know where in the recording each beat happened.
 * Reading that off a contact sheet by eye is how the first cut ended up with
 * five seconds of blank page in it, so the recorder reports its own timeline:
 * t0 is the moment the video starts, and every beat is stamped against it.
 */
const beats = [];
let t0 = 0;
const beat = (name) => {
  beats.push({ name, t: +((Date.now() - t0) / 1000).toFixed(2) });
};

const browser = await chromium.launch({ args: ["--force-device-scale-factor=1"] });
/**
 * Record the phone layout, not the desktop one.
 *
 * The first recording used a 1080-wide viewport because that is the video's
 * width — which quietly meant filming the desktop site. Its interface then
 * sat at desktop scale inside a phone-shaped frame, legible only if the shot
 * zoomed in, and zooming a page exactly as wide as the frame shaves words off
 * both edges. A 540-wide viewport gets the site's own mobile layout, where
 * the controls are already large, and Playwright scales it to 1080 on the way
 * out; deviceScaleFactor 2 keeps that upscale sharp rather than soft.
 */
const ctx = await browser.newContext({
  viewport: { width: 540, height: 960 },
  deviceScaleFactor: 2,
  isMobile: false,
  locale: "ru-RU",
  // Playwright does not scale the viewport up to the video size — it pins
  // the viewport to the top-left of the canvas and fills the rest with grey,
  // which is exactly what the first mobile-layout attempt produced. So the
  // video is recorded at viewport size and upscaled afterwards.
  recordVideo: { dir: rawDir, size: { width: 540, height: 960 } },
});
t0 = Date.now();
/**
 * Hide the site's own chrome for the duration of the shoot.
 *
 * The video already carries a QRix wordmark and the URL, so the page's header,
 * breadcrumb and host badge add nothing but clutter at the top of a frame
 * where the step label also has to live. An editor would crop them out; here
 * the page is simply asked not to draw them. Nothing about the tool itself is
 * touched — what the viewer is asked to copy is exactly what was recorded.
 */
const HIDE_CHROME = `
  (() => {
    const css = document.createElement('style');
    css.textContent = [
      'header, [data-nav], nav[aria-label="Main"] { display:none !important }',
      'nav[aria-label="Breadcrumb"], .breadcrumb, [data-breadcrumb] { display:none !important }',
      'ol[itemtype*="BreadcrumbList"], nav:has(> ol li + li) { display:none !important }',
      '[id*="netlify"], [class*="netlify"], a[href*="netlify.com"] { display:none !important }',
      'body { padding-top:0 !important }',
    ].join(' ');
    const put = () => document.head && document.head.appendChild(css);
    if (!put()) document.addEventListener('DOMContentLoaded', put, { once: true });
  })();
`;

await ctx.addInitScript(HIDE_CHROME);
await ctx.addInitScript(CURSOR);
const page = await ctx.newPage();

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
for (const label of ["Отклонить", "Decline", "Только необходимые"]) {
  const b = page.getByRole("button", { name: label });
  if (await b.count()) { await b.first().click().catch(() => {}); break; }
}
await page.waitForTimeout(900);

// 1 — arrive, read the headline, travel to the dropzone.
beat("loaded");
await page.mouse.move(270, 760, { steps: 1 });
await page.waitForTimeout(500);
const drop = page.locator('input[type=file]').first();
const zone = await drop.evaluate((el) => {
  const b = (el.closest("label") ?? el.parentElement ?? el).getBoundingClientRect();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
});
beat("reachDropzone");
await glide(page, [zone.x, zone.y], 34);
await page.waitForTimeout(650);

// 2 — the file lands.
beat("drop");
await drop.setInputFiles(join(root, "public", "demo-face-clean.jpg"));
await page.waitForTimeout(2600);
beat("cropReady");

// 3 — nudge the crop, which is the part people actually worry about.
const card = page.locator("canvas, img").first();
if (await card.count()) {
  const b = await card.boundingBox();
  if (b) {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    await glide(page, [cx, cy], 22);
    await page.mouse.down();
    await page.mouse.move(cx - 26, cy - 46, { steps: 20 });
    await page.mouse.move(cx + 10, cy - 20, { steps: 16 });
    await page.mouse.up();
    await page.waitForTimeout(900);
    beat("cropDone");
  }
}

// 4 — the download button, pressed for real.
const dl = page.getByRole("button", { name: /Скачать фото/i }).first();
if (await dl.count()) {
  const b = await dl.boundingBox();
  if (b) {
    beat("reachDownload");
    await glide(page, [b.x + b.width / 2, b.y + b.height / 2], 26);
    await page.waitForTimeout(450);
    await page.mouse.down();
    await page.waitForTimeout(120);
    await page.mouse.up();
    beat("clicked");
    await page.waitForTimeout(1600);
  }
}
beat("end");

await ctx.close();
await browser.close();

const [file] = readdirSync(rawDir).filter((f) => f.endsWith(".webm"));
if (!file) throw new Error("playwright wrote no video");
// Upscale to the delivery size and re-encode to H.264: Chromium decodes it
// far faster than VP9 during the Remotion render, and the footage is re-
// encoded by the platform anyway.
const final = join(outDir, "screen.mp4");
rmSync(final, { force: true });
execFileSync("ffmpeg", [
  "-y", "-v", "error", "-i", join(rawDir, file),
  "-vf", "scale=1080:1920:flags=lanczos",
  "-c:v", "libx264", "-crf", "17", "-preset", "medium",
  "-pix_fmt", "yuv420p", "-an", final,
]);
rmSync(rawDir, { recursive: true, force: true });
writeFileSync(join(outDir, "beats.json"), JSON.stringify({ beats }, null, 2));
console.log(final);
console.log(beats.map((b) => `${b.name} ${b.t}s`).join(" | "));
