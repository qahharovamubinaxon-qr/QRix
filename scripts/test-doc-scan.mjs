/* Guard for the document scanner core (M153).

   The whole feature is a chain of geometry, and every link fails quietly: a
   detector that grabs the table instead of the passport still produces a
   confident-looking crop, a homography with a sign error still produces an
   image, and a page layout that is 4% out still prints. None of that is visible
   by eye — so this builds synthetic photos where the ANSWER IS KNOWN, runs the
   real pipeline, and measures the error.

   Each case is a photo a person would actually take: a document at an angle, on
   a darker surface, under uneven light, sometimes rotated, sometimes dark on a
   light desk.

   Run: npm run test:scan */

import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const {
  makeImg, detectQuad, warpToRect, solveHomography, flattenIllumination,
  composePage, mmToPx, targetSize, toGray, resize, orderCorners, quadArea,
} = await import(`file:///${path.join(root, "lib/doc-scan.ts").replace(/\\/g, "/")}`);

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* ── synthetic world ─────────────────────────────────────────────────────── */

const setPx = (img, x, y, r, g, b) => {
  const i = (y * img.width + x) * 4;
  img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
};

/** A document with a distinct colour in each corner, so orientation errors are
    detectable rather than merely suspected, plus text-like bars in the middle
    so the interior is not a flat field the detector could split. */
function makeDocument(w, h, { dark = false } = {}) {
  const doc = makeImg(w, h, dark ? 40 : 245);
  /* Pastel, not saturated. The first version used strong red/green/blue, whose
     LUMINANCE is around 95 — darker than the table the document sits on — so
     the corner squares fell outside the page blob and the detector lost the
     corners by 50 px. That was the fixture being unlike any real document, not
     the detector being wrong: paper is light, and the ink on it is inside the
     page, not covering its corners. Hue still identifies each corner.
     The dark-document case needs the same reasoning inverted: on a dark card
     the markers must be DARKER than the desk, or they fall outside the blob for
     exactly the same reason. */
  const corners = dark
    ? [
        [0, 0, [110, 25, 25]],        // top-left    deep red
        [w - 1, 0, [25, 95, 35]],     // top-right   deep green
        [w - 1, h - 1, [25, 35, 115]], // bottom-right deep blue
        [0, h - 1, [105, 95, 20]],    // bottom-left olive
      ]
    : [
        [0, 0, [255, 190, 190]],       // top-left    pink
        [w - 1, 0, [190, 255, 190]],   // top-right   mint
        [w - 1, h - 1, [190, 205, 255]], // bottom-right pale blue
        [0, h - 1, [250, 245, 170]],   // bottom-left cream
      ];
  const box = Math.max(6, Math.round(Math.min(w, h) * 0.12));
  for (const [cx, cy, rgb] of corners) {
    for (let y = 0; y < box; y++) {
      for (let x = 0; x < box; x++) {
        const px = cx === 0 ? x : cx - x;
        const py = cy === 0 ? y : cy - y;
        setPx(doc, px, py, rgb[0], rgb[1], rgb[2]);
      }
    }
  }
  /* A dark block inside the page — a passport's photograph, a stamp, a barcode
     strip. Without hole filling in the detector this splits the page blob and
     drags the corners inward, which is exactly the failure it guards. */
  for (let y = Math.round(h * 0.55); y < Math.round(h * 0.9); y++) {
    for (let x = Math.round(w * 0.06); x < Math.round(w * 0.3); x++) {
      setPx(doc, x, y, dark ? 230 : 35, dark ? 230 : 35, dark ? 230 : 40);
    }
  }
  for (let line = 0; line < 6; line++) {
    const y0 = Math.round(h * (0.32 + line * 0.07));
    for (let y = y0; y < y0 + Math.max(2, h * 0.015); y++) {
      for (let x = Math.round(w * 0.2); x < Math.round(w * 0.8); x++) {
        setPx(doc, x, y, dark ? 200 : 30, dark ? 200 : 30, dark ? 200 : 30);
      }
    }
  }
  return doc;
}

/** Paint the document into a photo through a known homography, then add the
    things a phone adds: a surface, a lighting gradient and noise. */
function makePhoto(doc, photoW, photoH, quad, { surface = 120, gradient = 0.45, noise = 6 } = {}) {
  const photo = makeImg(photoW, photoH, surface);
  /* Surface texture, so the background is not a perfectly flat field. */
  for (let i = 0, p = 0; i < photoW * photoH; i++, p += 4) {
    const n = ((i * 2654435761) % 17) - 8;
    photo.data[p] += n; photo.data[p + 1] += n; photo.data[p + 2] += n;
  }

  const docRect = [
    { x: 0, y: 0 }, { x: doc.width - 1, y: 0 },
    { x: doc.width - 1, y: doc.height - 1 }, { x: 0, y: doc.height - 1 },
  ];
  /* H maps photo-space quad -> document space, which is what an inverse sample
     of the photo needs. */
  const H = solveHomography(quad, docRect);

  const xs = quad.map((p) => p.x), ys = quad.map((p) => p.y);
  const [minX, maxX] = [Math.floor(Math.min(...xs)), Math.ceil(Math.max(...xs))];
  const [minY, maxY] = [Math.floor(Math.min(...ys)), Math.ceil(Math.max(...ys))];

  const inside = (px, py) => {
    let sign = 0;
    for (let i = 0; i < 4; i++) {
      const a = quad[i], b = quad[(i + 1) % 4];
      const cross = (b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x);
      if (cross === 0) continue;
      const s = cross > 0 ? 1 : -1;
      if (sign === 0) sign = s;
      else if (s !== sign) return false;
    }
    return true;
  };

  for (let y = Math.max(0, minY); y <= Math.min(photoH - 1, maxY); y++) {
    for (let x = Math.max(0, minX); x <= Math.min(photoW - 1, maxX); x++) {
      if (!inside(x + 0.5, y + 0.5)) continue;
      const w = H[6] * x + H[7] * y + H[8];
      const sx = Math.round((H[0] * x + H[1] * y + H[2]) / w);
      const sy = Math.round((H[3] * x + H[4] * y + H[5]) / w);
      if (sx < 0 || sy < 0 || sx >= doc.width || sy >= doc.height) continue;
      const s = (sy * doc.width + sx) * 4, d = (y * photoW + x) * 4;
      photo.data[d] = doc.data[s]; photo.data[d + 1] = doc.data[s + 1]; photo.data[d + 2] = doc.data[s + 2];
    }
  }

  /* Lighting: bright on the left, shadowed on the right, as a hand holding a
     phone produces. Applied to everything, document and surface alike. */
  for (let y = 0; y < photoH; y++) {
    for (let x = 0; x < photoW; x++) {
      const k = 1 - gradient * (x / photoW);
      const p = (y * photoW + x) * 4;
      const n = noise ? (((x * 7919 + y * 104729) % noise) - noise / 2) : 0;
      photo.data[p] = photo.data[p] * k + n;
      photo.data[p + 1] = photo.data[p + 1] * k + n;
      photo.data[p + 2] = photo.data[p + 2] * k + n;
    }
  }
  return photo;
}

const cornerError = (a, b) =>
  Math.max(...a.map((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y)));

const avgColour = (img, x0, y0, size) => {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y < y0 + size; y++) {
    for (let x = x0; x < x0 + size; x++) {
      const i = (y * img.width + x) * 4;
      r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
    }
  }
  return [r / n, g / n, b / n];
};
const dominant = (c) => (c[0] > c[1] && c[0] > c[2] ? "r" : c[1] > c[2] ? "g" : "b");

/* ── 1. detection on photos a person would actually take ─────────────────── */

const CASES = [
  {
    name: "tilted on a darker table",
    quad: [{ x: 120, y: 90 }, { x: 640, y: 140 }, { x: 610, y: 520 }, { x: 90, y: 470 }],
    opts: {},
  },
  {
    name: "strong perspective, taken from one side",
    quad: [{ x: 90, y: 60 }, { x: 660, y: 170 }, { x: 600, y: 540 }, { x: 150, y: 430 }],
    opts: {},
  },
  {
    name: "nearly square to the camera",
    quad: [{ x: 100, y: 80 }, { x: 660, y: 84 }, { x: 658, y: 520 }, { x: 104, y: 516 }],
    opts: {},
  },
  {
    name: "harsh shadow across the frame",
    quad: [{ x: 130, y: 100 }, { x: 650, y: 130 }, { x: 620, y: 530 }, { x: 100, y: 490 }],
    opts: { gradient: 0.75 },
  },
  {
    name: "dark document on a light desk",
    quad: [{ x: 110, y: 95 }, { x: 645, y: 125 }, { x: 615, y: 505 }, { x: 95, y: 475 }],
    opts: { surface: 235, dark: true, gradient: 0.3 },
  },
];

for (const c of CASES) {
  const doc = makeDocument(400, 300, { dark: c.opts.dark });
  const photo = makePhoto(doc, 760, 620, c.quad, c.opts);
  const found = detectQuad(photo);

  ok(`detect · ${c.name}: found a quad`, !!found);
  if (!found) continue;

  const err = cornerError(found, c.quad);
  /* Under 12 px on a 760-wide photo is ~1.6% of the frame — inside the border a
     person would leave anyway, and well inside what the manual corner handles
     are for. */
  ok(`detect · ${c.name}: corners within 12 px`, err <= 12, `max error ${err.toFixed(1)} px`);

  const warped = warpToRect(photo, found, 400, 300);
  const box = 30;
  const tl = dominant(avgColour(warped, 4, 4, box));
  const tr = dominant(avgColour(warped, 400 - box - 4, 4, box));
  const br = dominant(avgColour(warped, 400 - box - 4, 300 - box - 4, box));
  /* Orientation, proved by where the colours land: a flipped or rotated
     homography still returns a plausible image, and this is what catches it. */
  ok(`warp · ${c.name}: top-left is the red corner`, tl === "r", tl);
  ok(`warp · ${c.name}: top-right is the green corner`, tr === "g", tr);
  ok(`warp · ${c.name}: bottom-right is the blue corner`, br === "b", br);
}

/* ── 2. geometry, exactly ─────────────────────────────────────────────────── */
{
  const quad = [{ x: 10, y: 20 }, { x: 210, y: 40 }, { x: 190, y: 160 }, { x: 30, y: 140 }];
  const rect = [{ x: 0, y: 0 }, { x: 99, y: 0 }, { x: 99, y: 49 }, { x: 0, y: 49 }];
  const H = solveHomography(rect, quad);
  let worst = 0;
  for (let i = 0; i < 4; i++) {
    const { x: u, y: v } = rect[i];
    const w = H[6] * u + H[7] * v + H[8];
    worst = Math.max(worst, Math.hypot((H[0] * u + H[1] * v + H[2]) / w - quad[i].x,
                                       (H[3] * u + H[4] * v + H[5]) / w - quad[i].y));
  }
  ok("homography: maps all four corners exactly", worst < 1e-6, `worst ${worst}`);

  ok("orderCorners: survives a shuffled input",
    JSON.stringify(orderCorners([quad[2], quad[0], quad[3], quad[1]])) === JSON.stringify(quad));
  ok("quadArea: matches a known rectangle",
    quadArea([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4 }, { x: 0, y: 4 }]) === 40);
}

/* ── 3. the scanned look ─────────────────────────────────────────────────── */
{
  /* Uniform paper under a strong left-to-right gradient: after flattening, the
     page should read as one even tone. */
  const w = 300, h = 200;
  const img = makeImg(w, h, 255);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = 1 - 0.6 * (x / w);
      const p = (y * w + x) * 4;
      img.data[p] = 240 * k; img.data[p + 1] = 240 * k; img.data[p + 2] = 240 * k;
    }
  }
  const spread = (im) => {
    const g = toGray(im);
    const left = g[Math.floor(h / 2) * w + 10];
    const right = g[Math.floor(h / 2) * w + (w - 10)];
    return Math.abs(left - right);
  };
  const before = spread(img);
  const after = spread(flattenIllumination(img, { grayscale: true }));
  ok("flatten: the lighting gradient is largely removed", after < before * 0.25,
    `${before.toFixed(0)} -> ${after.toFixed(0)}`);
  ok("flatten: the page ends up light, not grey", toGray(flattenIllumination(img, { grayscale: true }))[0] > 200);
}

/* ── 4. printed size, which is the point ─────────────────────────────────── */
{
  ok("mm: an ID-1 card is 1011 px wide at 300 DPI", mmToPx(85.6) === 1011, String(mmToPx(85.6)));
  ok("mm: A4 is 2480 × 3508 at 300 DPI", mmToPx(210) === 2480 && mmToPx(297) === 3508);

  const landscapeQuad = [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 120 }, { x: 0, y: 120 }];
  const t = targetSize("id1", landscapeQuad);
  ok("target: a landscape card keeps the card's landscape millimetres",
    t.w === mmToPx(85.6) && t.h === mmToPx(53.98), `${t.w}x${t.h}`);

  const portraitQuad = [{ x: 0, y: 0 }, { x: 120, y: 0 }, { x: 120, y: 200 }, { x: 0, y: 200 }];
  const tp = targetSize("id1", portraitQuad);
  ok("target: a portrait card swaps them rather than squashing the crop",
    tp.w === mmToPx(53.98) && tp.h === mmToPx(85.6), `${tp.w}x${tp.h}`);

  /* One card on a page, and the front/back pair that started this feature. */
  const card = makeDocument(600, 380);
  const one = composePage([card], { doc: "id1", page: "a4" });
  ok("page: A4 at 300 DPI", one.width === 2480 && one.height === 3508, `${one.width}x${one.height}`);

  const rowHasInk = (im, y) => {
    for (let x = 0; x < im.width; x++) if (im.data[(y * im.width + x) * 4] < 200) return true;
    return false;
  };
  const inkRows = [];
  for (let y = 0; y < one.height; y += 8) if (rowHasInk(one, y)) inkRows.push(y);
  const top = inkRows[0], bottom = inkRows[inkRows.length - 1];
  const marginTop = top, marginBottom = one.height - bottom;
  ok("page: a single card is vertically centred",
    Math.abs(marginTop - marginBottom) < 40, `top ${marginTop} vs bottom ${marginBottom}`);

  const two = composePage([card, card], { doc: "id1", page: "a4" });
  const gapsIn = (im) => {
    const rows = [];
    for (let y = 0; y < im.height; y += 4) if (rowHasInk(im, y)) rows.push(y);
    let biggest = 0;
    for (let i = 1; i < rows.length; i++) biggest = Math.max(biggest, rows[i] - rows[i - 1]);
    return { rows, biggest };
  };
  const g1 = gapsIn(one), g2 = gapsIn(two);
  const span = (g) => g.rows[g.rows.length - 1] - g.rows[0];
  /* Measure the LAYOUT, not the fixture. Counting bands and looking for the
     biggest gap both ended up measuring where this particular test document
     happens to put its ink — the second card adds exactly one card height plus
     the configured 10 mm gap to the inked span, and that is a fact about
     composePage whatever is printed on the card. */
  const cardH = mmToPx(53.98);
  const grew = span(g2) - span(g1);
  ok("page: the second card adds one card height plus the 10 mm gap",
    Math.abs(grew - (cardH + mmToPx(10))) < 30, `grew ${grew}, expected ~${cardH + mmToPx(10)}`);
  ok("page: front and back are separated by the 10 mm gap",
    g2.biggest >= 100 && g2.biggest <= 190, `${g2.biggest} px`);
  ok("page: the pair is still centred as a block",
    Math.abs(g2.rows[0] - (two.height - g2.rows[g2.rows.length - 1])) < 60);
}

/* ── 5. refusing rather than guessing ────────────────────────────────────── */
{
  /* A photo with no document in it must return null. A detector that always
     answers is a detector that crops the table and calls it a passport. */
  const empty = makeImg(400, 300, 130);
  for (let i = 0, p = 0; i < 400 * 300; i++, p += 4) {
    const n = ((i * 2654435761) % 21) - 10;
    empty.data[p] += n; empty.data[p + 1] += n; empty.data[p + 2] += n;
  }
  ok("detect: an empty surface returns null, not a guess", detectQuad(empty) === null);
}

console.log(`${pass}/${pass + fails.length} assertions passed`);
if (fails.length) {
  console.error("FAILED:\n  " + fails.join("\n  "));
  process.exit(1);
}
