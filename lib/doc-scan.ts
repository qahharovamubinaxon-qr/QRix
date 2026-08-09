/**
 * Document scanner core — find a document in a phone photo, straighten it, and
 * lay it out at its true physical size. Pure functions over raw pixel buffers:
 * no DOM, no canvas, no imports, so scripts/test-doc-scan.mjs can drive the real
 * code against synthetic photos with a KNOWN answer and measure the error,
 * rather than somebody deciding by eye that a crop "looks about right".
 *
 * The pipeline, and why each step is there:
 *   1. detectQuad   — where the document is. Everything downstream is wrong if
 *                     this is wrong, which is why the UI also lets a person drag
 *                     the four corners: no detector is right on every photo, and
 *                     a tool that fails without a manual path is a tool that
 *                     fails.
 *   2. warpToRect   — perspective correction. A photo taken at an angle has the
 *                     document as a trapezoid; a scanner produces a rectangle.
 *                     This is the difference between the two.
 *   3. flatten      — divide out the lighting. A phone photo carries a shadow
 *                     gradient and a warm cast; dividing by a heavily blurred
 *                     copy of itself removes both, which is what makes the
 *                     result read as "scanned" rather than "photographed".
 *   4. composePage  — place it on white paper at its real millimetre size, so a
 *                     printed ID card measures 85.6 mm on a ruler.
 */

export type Img = { data: Uint8ClampedArray; width: number; height: number };
export type Point = { x: number; y: number };
/** Clockwise from the top-left. */
export type Quad = [Point, Point, Point, Point];

/* ── document standards ───────────────────────────────────────────────────
   ID-1 and ID-3 are ISO/IEC 7810 sizes: ID-1 is every bank card, driving
   licence and national ID card in the world, ID-3 is the passport booklet.
   Printing at these dimensions is the whole point of the feature — a scan that
   comes out 4% small is useless to an office that has to attach it to a form. */
export const DOC_STANDARDS = {
  id1: { label: "ID card · ID-1 (85.6 × 54 mm)", w: 85.6, h: 53.98 },
  id3: { label: "Passport page · ID-3 (125 × 88 mm)", w: 125, h: 88 },
  a4: { label: "A4 (210 × 297 mm)", w: 210, h: 297 },
  a5: { label: "A5 (148 × 210 mm)", w: 148, h: 210 },
  letter: { label: "Letter (216 × 279 mm)", w: 215.9, h: 279.4 },
} as const;
export type DocStandard = keyof typeof DOC_STANDARDS;

export const PAGES = {
  a4: { label: "A4", w: 210, h: 297 },
  letter: { label: "Letter", w: 215.9, h: 279.4 },
} as const;
export type PageSize = keyof typeof PAGES;

export const mmToPx = (mm: number, dpi = 300) => Math.round((mm * dpi) / 25.4);

/* ── basics ──────────────────────────────────────────────────────────────── */

export function makeImg(width: number, height: number, fill = 255): Img {
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(fill);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { data, width, height };
}

export function toGray(img: Img): Uint8ClampedArray {
  const g = new Uint8ClampedArray(img.width * img.height);
  for (let i = 0, p = 0; i < g.length; i++, p += 4) {
    /* Rec. 601 luma: the green channel carries most of the perceived
       brightness, and a flat average makes red ink vanish into the page. */
    g[i] = (img.data[p] * 299 + img.data[p + 1] * 587 + img.data[p + 2] * 114) / 1000;
  }
  return g;
}

/** Separable box blur — two O(n) passes with a running sum, so a radius of 40
    on a 12-megapixel photo is still linear rather than quadratic. */
export function boxBlur(src: Uint8ClampedArray, w: number, h: number, r: number): Uint8ClampedArray {
  if (r < 1) return src.slice();
  const tmp = new Float32Array(w * h);
  const out = new Uint8ClampedArray(w * h);

  for (let y = 0; y < h; y++) {
    let sum = 0;
    const row = y * w;
    for (let x = -r; x <= r; x++) sum += src[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / (2 * r + 1);
      sum -= src[row + Math.min(w - 1, Math.max(0, x - r))];
      sum += src[row + Math.min(w - 1, Math.max(0, x + r + 1))];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / (2 * r + 1);
      sum -= tmp[Math.min(h - 1, Math.max(0, y - r)) * w + x];
      sum += tmp[Math.min(h - 1, Math.max(0, y + r + 1)) * w + x];
    }
  }
  return out;
}

/** Otsu's threshold: the split that minimises variance within the two halves.
    Chosen over a fixed value because a phone photo's exposure is not knowable
    in advance — a grey table and a white desk need different cuts. */
export function otsuThreshold(gray: Uint8ClampedArray): number {
  const hist = new Array(256).fill(0);
  for (const v of gray) hist[v]++;
  const total = gray.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0, wB = 0, best = 0, bestVar = -1;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > bestVar) { bestVar = between; best = t; }
  }
  return best;
}

/**
 * Remove LINEAR shading by fitting a plane to the brightness and dividing it
 * out. Least squares over (x, y, 1).
 *
 * A blur was tried first and was wrong in a way worth recording: any radius
 * small enough to track the shadow is also small enough to absorb the document
 * itself, so dividing by it erased exactly the page-versus-desk contrast the
 * detector needs — the mask came back with the background AND the document both
 * white and only a thin rim between them. A plane cannot represent a rectangle,
 * so it takes the lighting and leaves the document alone.
 */
export function flattenPlane(gray: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  /* Normal equations for z = a·x + b·y + c, accumulated in one pass. */
  let sx = 0, sy = 0, sz = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0;
  const n = w * h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const z = gray[y * w + x];
      sx += x; sy += y; sz += z;
      sxx += x * x; syy += y * y; sxy += x * y;
      sxz += x * z; syz += y * z;
    }
  }
  const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]];
  const b = [sxz, syz, sz];
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    [b[col], b[piv]] = [b[piv], b[col]];
    const d = A[col][col];
    if (Math.abs(d) < 1e-9) continue;
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = A[r][col] / d;
      for (let c = col; c < 3; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const a = Math.abs(A[0][0]) < 1e-9 ? 0 : b[0] / A[0][0];
  const bb = Math.abs(A[1][1]) < 1e-9 ? 0 : b[1] / A[1][1];
  const c = Math.abs(A[2][2]) < 1e-9 ? sz / n : b[2] / A[2][2];

  const mean = sz / n;
  const out = new Uint8ClampedArray(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const plane = Math.max(1, a * x + bb * y + c);
      out[y * w + x] = (gray[y * w + x] / plane) * mean;
    }
  }
  return out;
}

/* ── detection ───────────────────────────────────────────────────────────── */

/** Corner assignment that does not care about rotation: on any convex,
    roughly-rectangular set, x+y is smallest at the top-left and largest at the
    bottom-right, while x−y separates the other two. */
export function orderCorners(pts: Point[]): Quad {
  let tl = pts[0], br = pts[0], tr = pts[0], bl = pts[0];
  for (const p of pts) {
    if (p.x + p.y < tl.x + tl.y) tl = p;
    if (p.x + p.y > br.x + br.y) br = p;
    if (p.x - p.y > tr.x - tr.y) tr = p;
    if (p.x - p.y < bl.x - bl.y) bl = p;
  }
  return [tl, tr, br, bl];
}

export const quadArea = (q: Quad): number => {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = q[i], n = q[(i + 1) % 4];
    a += p.x * n.y - n.x * p.y;
  }
  return Math.abs(a) / 2;
};

type Candidate = { quad: Quad; score: number; polarity: "light" | "dark" };

/** One segmentation pass: keep pixels on one side of the threshold, take the
    largest 4-connected blob, and read its extreme corners. */
function candidateFrom(
  gray: Uint8ClampedArray, w: number, h: number, threshold: number, keepLighter: boolean,
): Candidate | null {
  const raw = (v: number) => (keepLighter ? v > threshold : v <= threshold);

  /* Fill holes before looking for the blob. A passport's photograph, a dark
     stamp or a black barcode strip is a region of the OPPOSITE polarity sitting
     inside the document, and without this the blob is the page with a bite
     taken out of it — which moves the corner extremes and, when the dark region
     touches an edge, cuts the corner off entirely.
     Holes are found by flooding the non-document space inward from the border:
     anything of the wrong polarity that the border cannot reach is enclosed by
     the document, so it belongs to it. */
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = raw(gray[i]) ? 1 : 0;
  {
    const seen = new Uint8Array(w * h);
    const stack = new Int32Array(w * h);
    let sp = 0;
    const push = (i: number) => { if (!seen[i] && !mask[i]) { seen[i] = 1; stack[sp++] = i; } };
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
    while (sp > 0) {
      const i = stack[--sp];
      const x = i % w, y = (i / w) | 0;
      if (x > 0) push(i - 1);
      if (x < w - 1) push(i + 1);
      if (y > 0) push(i - w);
      if (y < h - 1) push(i + w);
    }
    for (let i = 0; i < w * h; i++) if (!mask[i] && !seen[i]) mask[i] = 1;
  }
  const wanted = (_v: number, i: number) => mask[i] === 1;

  /* Iterative flood fill with an explicit stack — a photo is millions of
     pixels and recursion would blow the stack on the first real image. */
  const label = new Int32Array(w * h).fill(-1);
  let bestSize = 0, bestId = -1, next = 0;
  const stack = new Int32Array(w * h);

  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || !wanted(gray[start], start)) continue;
    const id = next++;
    let sp = 0, size = 0;
    stack[sp++] = start;
    label[start] = id;
    while (sp > 0) {
      const i = stack[--sp];
      size++;
      const x = i % w, y = (i / w) | 0;
      if (x > 0 && label[i - 1] === -1 && wanted(gray[i - 1], i - 1)) { label[i - 1] = id; stack[sp++] = i - 1; }
      if (x < w - 1 && label[i + 1] === -1 && wanted(gray[i + 1], i + 1)) { label[i + 1] = id; stack[sp++] = i + 1; }
      if (y > 0 && label[i - w] === -1 && wanted(gray[i - w], i - w)) { label[i - w] = id; stack[sp++] = i - w; }
      if (y < h - 1 && label[i + w] === -1 && wanted(gray[i + w], i + w)) { label[i + w] = id; stack[sp++] = i + w; }
    }
    if (size > bestSize) { bestSize = size; bestId = id; }
  }
  if (bestId < 0 || bestSize < w * h * 0.05) return null;   // too small to be the subject

  const pts: Point[] = [];
  for (let i = 0; i < label.length; i++) if (label[i] === bestId) pts.push({ x: i % w, y: (i / w) | 0 });
  const quad = orderCorners(pts);

  const area = quadArea(quad);
  if (area < w * h * 0.05) return null;

  /* Rectangularity: how much of the quad the blob actually fills. A document
     fills nearly all of it; an L-shaped shadow or a hand in frame does not, and
     this is what stops the detector locking onto the table. */
  const fill = bestSize / area;
  const coverage = area / (w * h);
  /* Prefer a large, well-filled quad, and penalise one pressed against the
     frame edge on all sides — that is usually the background itself. */
  const touchesAll = quad.every((p) => p.x < 2 || p.y < 2 || p.x > w - 3 || p.y > h - 3);
  const score = fill * Math.min(1, coverage / 0.6) * (touchesAll ? 0.35 : 1);
  return { quad, score, polarity: keepLighter ? "light" : "dark" };
}

/**
 * Find the document. Tries both polarities — a passport on a dark table and a
 * dark card on white paper are the same problem seen from opposite sides — and
 * keeps whichever scores better.
 *
 * Returns null when nothing scores well enough, which the UI must treat as "ask
 * the person to place the corners" rather than cropping to something wrong.
 */
export function detectQuad(img: Img, opts: { maxSide?: number } = {}): Quad | null {
  const maxSide = opts.maxSide ?? 600;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const small = scale < 1 ? resize(img, Math.round(img.width * scale), Math.round(img.height * scale)) : img;

  /* Divide the lighting out BEFORE thresholding, not after. This is the single
     thing that decides whether detection works on a real photo: with a shadow
     across the frame, the far edge of a white page is darker than the near edge
     of the desk, and no global threshold can separate them — the test case
     "harsh shadow" missed by 155 px until this was added. */
  const raw = toGray(small);
  const gray = flattenPlane(raw, small.width, small.height);
  /* Then a light blur: paper texture, print and JPEG noise all create tiny
     regions that would otherwise fragment the blob. */
  const blurred = boxBlur(gray, small.width, small.height, Math.max(1, Math.round(Math.min(small.width, small.height) / 100)));
  const t = otsuThreshold(blurred);

  const candidates = [
    candidateFrom(blurred, small.width, small.height, t, true),
    candidateFrom(blurred, small.width, small.height, t, false),
  ].filter((c): c is Candidate => c !== null);
  if (!candidates.length) return null;

  const best = candidates.sort((a, b) => b.score - a.score)[0];
  if (best.score < 0.35) return null;

  const inv = 1 / (scale || 1);
  return best.quad.map((p) => ({ x: p.x * inv, y: p.y * inv })) as Quad;
}

/* ── geometry ────────────────────────────────────────────────────────────── */

/** Homography mapping the unit-rect corners (dst) onto the quad (src), solved
    as an 8×8 linear system with partial pivoting. Returns the 9 coefficients of
    the 3×3 matrix, h[8] fixed at 1. */
export function solveHomography(dst: Quad, src: Quad): number[] {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x: u, y: v } = dst[i];
    const { x, y } = src[i];
    A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x);
    A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y);
  }
  for (let col = 0; col < 8; col++) {
    let piv = col;
    for (let r = col + 1; r < 8; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    [b[col], b[piv]] = [b[piv], b[col]];
    const d = A[col][col];
    if (Math.abs(d) < 1e-12) continue;
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const f = A[r][col] / d;
      for (let c = col; c < 8; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const h = new Array(9).fill(0);
  for (let i = 0; i < 8; i++) h[i] = Math.abs(A[i][i]) < 1e-12 ? 0 : b[i] / A[i][i];
  h[8] = 1;
  return h;
}

function sampleBilinear(img: Img, x: number, y: number, out: Uint8ClampedArray, o: number): void {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const cx = (v: number) => Math.min(img.width - 1, Math.max(0, v));
  const cy = (v: number) => Math.min(img.height - 1, Math.max(0, v));
  const i00 = (cy(y0) * img.width + cx(x0)) * 4;
  const i10 = (cy(y0) * img.width + cx(x0 + 1)) * 4;
  const i01 = (cy(y0 + 1) * img.width + cx(x0)) * 4;
  const i11 = (cy(y0 + 1) * img.width + cx(x0 + 1)) * 4;
  for (let c = 0; c < 3; c++) {
    const top = img.data[i00 + c] * (1 - fx) + img.data[i10 + c] * fx;
    const bot = img.data[i01 + c] * (1 - fx) + img.data[i11 + c] * fx;
    out[o + c] = top * (1 - fy) + bot * fy;
  }
  out[o + 3] = 255;
}

export type Mids = { left: Point; right: Point };

/** Midpoints of the two long edges, which is where the extra handles sit before
    anybody drags them: left halfway down TL→BL, right halfway down TR→BR. */
export function midDefaults(q: Quad): Mids {
  return {
    left: { x: (q[0].x + q[3].x) / 2, y: (q[0].y + q[3].y) / 2 },
    right: { x: (q[1].x + q[2].x) / 2, y: (q[1].y + q[2].y) / 2 },
  };
}

/** Warp one source quad into a horizontal slice of the output. */
function warpSlice(img: Img, quad: Quad, out: Img, y0: number, y1: number): void {
  const outW = out.width;
  const dst: Quad = [
    { x: 0, y: y0 }, { x: outW - 1, y: y0 }, { x: outW - 1, y: y1 - 1 }, { x: 0, y: y1 - 1 },
  ];
  const h = solveHomography(dst, quad);
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < outW; x++) {
      const w = h[6] * x + h[7] * y + h[8];
      sampleBilinear(img, (h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w,
        out.data, (y * outW + x) * 4);
    }
  }
}

/**
 * Straighten: sample the source into a clean rectangle.
 *
 * With four corners this is one homography, which is exact for a FLAT document
 * and only for a flat one. A passport is a booklet: photographed open it bends
 * along the fold, and no single homography can straighten a curve — the corners
 * land perfectly while the middle of the page stays bowed, which reads as "it
 * almost worked" and is the most annoying kind of almost.
 *
 * Two extra handles on the long edges fix it. They split the document into a
 * top half and a bottom half, each warped with its own homography, so the fold
 * becomes the seam between two planes instead of an error smeared across the
 * page. The split in the OUTPUT follows where the handles actually sit along
 * the edges rather than the middle, so dragging them onto the real fold keeps
 * the two halves in proportion instead of stretching one into the other.
 *
 * Bilinear sampling throughout: nearest-neighbour turns small print into
 * aliased noise at exactly the sizes documents are read at.
 */
export function warpToRect(img: Img, quad: Quad, outW: number, outH: number, mids?: Mids | null): Img {
  const out = makeImg(outW, outH, 0);
  if (!mids) {
    warpSlice(img, quad, out, 0, outH);
    return out;
  }

  const [tl, tr, br, bl] = quad;
  const rect: Quad = [
    { x: 0, y: 0 }, { x: outW - 1, y: 0 }, { x: outW - 1, y: outH - 1 }, { x: 0, y: outH - 1 },
  ];

  /* WHERE THE SEAM GOES IN THE OUTPUT, which is a different question from where
     the handles are, and the one that decides whether this is worth anything.
     Measured: with the seam in the right place each half warps to within 1.3–1.5
     grey levels of the flat original — the same as the resampling floor. With it
     in the wrong place the error is twenty times that, because a document is
     mostly sharp lines and a shifted seam misaligns every one of them.

     Two regimes, and they need different answers:

     · Handles untouched. There is no fold; they sit at the midpoints of the
       edges. Mapping them back through the flat four-point homography gives the
       exact place that point belongs in the output, so the piecewise warp
       reduces to the plain one and costs nothing. (Note this is NOT the middle
       of the output — under perspective the far half is compressed.)

     · Handles dragged. The person has put them on a fold, and a folded booklet
       is folded in half, so the seam belongs at the middle. The homography
       cannot tell us this: the corners define a chord plane that the fold rises
       out of, and mapping through it lands short — 166 where 180 was right, in
       the fixture that proved it.

     The limitation, stated rather than hidden: a crease that is NOT halfway
     down — a letter folded in thirds — gets a seam at the middle and will not
     come out right. Booklets and ID cards, which is what this tool is for, are
     halves or flat. */
  const defaults = midDefaults(quad);
  const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const edge = (Math.hypot(bl.x - tl.x, bl.y - tl.y) + Math.hypot(br.x - tr.x, br.y - tr.y)) / 2;
  const dragged = (dist(mids.left, defaults.left) + dist(mids.right, defaults.right)) / 2 > edge * 0.02;

  let f: number;
  if (dragged) {
    f = 0.5;
  } else {
    const back = solveHomography(quad, rect);
    const toDocY = (p: Point) => {
      const w = back[6] * p.x + back[7] * p.y + back[8];
      return (back[3] * p.x + back[4] * p.y + back[5]) / w;
    };
    f = ((toDocY(mids.left) + toDocY(mids.right)) / 2) / outH;
  }
  const split = Math.round(outH * Math.min(0.9, Math.max(0.1, f)));

  warpSlice(img, [tl, tr, mids.right, mids.left], out, 0, split);
  warpSlice(img, [mids.left, mids.right, br, bl], out, split, outH);
  return out;
}

export function resize(img: Img, outW: number, outH: number): Img {
  const out = makeImg(outW, outH, 0);
  const fx = img.width / outW, fy = img.height / outH;
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      sampleBilinear(img, (x + 0.5) * fx - 0.5, (y + 0.5) * fy - 0.5, out.data, (y * outW + x) * 4);
    }
  }
  return out;
}

/* ── the scanned look ────────────────────────────────────────────────────── */

/**
 * Remove the lighting, keep the ink.
 *
 * A phone photo of paper is the paper's reflectance multiplied by whatever the
 * light was doing — a shadow from the hand holding the phone, a warm lamp on
 * one side. Dividing by a heavily blurred copy of the image estimates that
 * lighting and cancels it, which is why the result looks flat and even rather
 * than merely brighter. Contrast is then stretched between percentiles, not
 * min/max, so one dark speck cannot set the black point for the whole page.
 */
export function flattenIllumination(img: Img, opts: { grayscale?: boolean; strength?: number } = {}): Img {
  const { width: w, height: h } = img;
  const strength = opts.strength ?? 1;
  const gray = toGray(img);
  const bg = boxBlur(gray, w, h, Math.max(3, Math.round(Math.min(w, h) / 20)));

  const out = makeImg(w, h, 0);
  const ratios = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const b = Math.max(1, bg[i]);
    ratios[i] = Math.min(1.6, gray[i] / b);
  }

  /* Percentile clip: 1% at each end. */
  const sorted = Float32Array.from(ratios).sort();
  const lo = sorted[Math.floor(sorted.length * 0.01)];
  const hi = sorted[Math.floor(sorted.length * 0.99)];
  const span = Math.max(1e-3, hi - lo);

  for (let i = 0, p = 0; i < w * h; i++, p += 4) {
    const norm = Math.min(1, Math.max(0, (ratios[i] - lo) / span));
    const target = norm * 255;
    if (opts.grayscale) {
      out.data[p] = out.data[p + 1] = out.data[p + 2] = target;
    } else {
      /* Keep hue by scaling each channel toward the corrected luminance. */
      const g = Math.max(1, gray[i]);
      const k = (target / g) * strength + (1 - strength);
      out.data[p] = img.data[p] * k;
      out.data[p + 1] = img.data[p + 1] * k;
      out.data[p + 2] = img.data[p + 2] * k;
    }
    out.data[p + 3] = 255;
  }
  return out;
}

/* ── page layout ─────────────────────────────────────────────────────────── */

/**
 * Put one or two corrected documents on white paper at their true physical
 * size. Two of them stack vertically, which is how the front and back of an ID
 * card are expected to arrive on one sheet.
 *
 * Physical size is the point: at 300 DPI an ID-1 card is 1011 px wide, and a
 * page that merely "fits" the image would print a card nobody can lay against
 * the original.
 */
export function composePage(
  docs: Img[],
  opts: { doc: DocStandard; page?: PageSize; dpi?: number; gapMm?: number },
): Img {
  const dpi = opts.dpi ?? 300;
  const page = PAGES[opts.page ?? "a4"];
  const std = DOC_STANDARDS[opts.doc];
  const gapMm = opts.gapMm ?? 10;

  const sheet = makeImg(mmToPx(page.w, dpi), mmToPx(page.h, dpi), 255);

  /* A document photographed in landscape keeps its landscape orientation; the
     standard's own aspect decides which way round its millimetres go. */
  const placed = docs.map((d) => {
    const landscape = d.width >= d.height;
    const stdLandscape = std.w >= std.h;
    const [mmW, mmH] = landscape === stdLandscape ? [std.w, std.h] : [std.h, std.w];
    return { img: resize(d, mmToPx(mmW, dpi), mmToPx(mmH, dpi)) };
  });

  const gap = mmToPx(gapMm, dpi);
  const totalH = placed.reduce((s, p) => s + p.img.height, 0) + gap * (placed.length - 1);
  let y = Math.round((sheet.height - totalH) / 2);

  for (const p of placed) {
    const x = Math.round((sheet.width - p.img.width) / 2);
    blit(sheet, p.img, x, y);
    y += p.img.height + gap;
  }
  return sheet;
}

export function blit(dst: Img, src: Img, atX: number, atY: number): void {
  for (let y = 0; y < src.height; y++) {
    const dy = atY + y;
    if (dy < 0 || dy >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const dx = atX + x;
      if (dx < 0 || dx >= dst.width) continue;
      const s = (y * src.width + x) * 4, d = (dy * dst.width + dx) * 4;
      dst.data[d] = src.data[s];
      dst.data[d + 1] = src.data[s + 1];
      dst.data[d + 2] = src.data[s + 2];
      dst.data[d + 3] = 255;
    }
  }
}

/** Output pixels for a standard at a DPI, in the orientation the crop has. */
export function targetSize(std: DocStandard, quad: Quad, dpi = 300): { w: number; h: number } {
  const s = DOC_STANDARDS[std];
  const width = Math.hypot(quad[1].x - quad[0].x, quad[1].y - quad[0].y);
  const height = Math.hypot(quad[3].x - quad[0].x, quad[3].y - quad[0].y);
  const landscape = width >= height;
  const stdLandscape = s.w >= s.h;
  const [mmW, mmH] = landscape === stdLandscape ? [s.w, s.h] : [s.h, s.w];
  return { w: mmToPx(mmW, dpi), h: mmToPx(mmH, dpi) };
}
