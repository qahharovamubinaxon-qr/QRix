/**
 * QRix content factory — screen capture.
 *
 * The footage in these videos has to be the real product. A mock-up of the
 * tool would be faster to build and would quietly make the video a lie: the
 * viewer copies what they see, and if the screen never existed they end up
 * somewhere else. So this drives the live site in a 1080x1920 viewport, the
 * same shape as the video, and writes PNGs the composition reads directly —
 * no rescaling, no letterboxing.
 *
 * Usage: node pipeline/shots.mjs <scriptId> <url>
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const [id, url] = process.argv.slice(2);
const out = join(root, "public", "shots", id);
mkdirSync(out, { recursive: true });

const shot = async (page, name) => {
  await page.screenshot({ path: join(out, `${name}.png`) });
  console.log(`  ${name}.png`);
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  locale: "ru-RU",
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
// The cookie banner is the user's choice, not part of the tool; dismissing it
// keeps it out of every frame.
for (const label of ["Отклонить", "Decline", "Только необходимые"]) {
  const b = page.getByRole("button", { name: label });
  if (await b.count()) { await b.first().click().catch(() => {}); break; }
}
await page.waitForTimeout(1200);
await shot(page, "01-landing");

const input = page.locator('input[type=file]').first();
if (await input.count()) {
  await input.setInputFiles(join(root, "public", "demo-face-clean.jpg"));
  await page.waitForTimeout(3500);
  await shot(page, "02-uploaded");
  await page.mouse.wheel(0, 320);
  await page.waitForTimeout(1200);
  await shot(page, "03-crop");
} else {
  console.log("  (no file input found — captured landing only)");
}

await browser.close();
console.log(`\n${out}`);
