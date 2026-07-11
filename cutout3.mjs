import sharp from "sharp";

/* v3: the studio bg is perfectly SMOOTH; every part of the bunny (even the
   backlit translucent ear fur) is textured. Key = neutral AND locally smooth,
   flooded from the borders; edges block the flood because local variance
   spikes there. Then dilate bg 2px through the leftover smooth fringe,
   keep the largest blob, feather. */

const DESK = "C:/Users/NEXTNO~1/AppData/Local/Temp/claude/D--Projects-QRix--claude-worktrees-relaxed-turing-bbc58e/cd151252-b415-4c95-b6da-7c8b37056542/scratchpad";
const JOBS = [
  { src: `${DESK}/24.jpg`, out: "public/scenes/bunny-hero.webp" },
  { src: `${DESK}/6.png`,  out: "public/scenes/bunny-point.webp" },
  { src: `${DESK}/16.png`, out: "public/scenes/bunny-walk.webp" },
];

const H = 1800, NEUTRAL = 18, STEP = 14, SIGMA = 3.6, R = 2; // 5x5 window

for (const job of JOBS) {
  const { data, info } = await sharp(job.src).resize({ height: H })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: HH, channels: C } = info;
  const N = W * HH;

  // luminance + integral images for local stddev
  const L = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const p = i * C;
    L[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  const S = new Float64Array((W + 1) * (HH + 1));
  const S2 = new Float64Array((W + 1) * (HH + 1));
  for (let y = 0; y < HH; y++) {
    let rs = 0, rs2 = 0;
    for (let x = 0; x < W; x++) {
      const v = L[y * W + x]; rs += v; rs2 += v * v;
      S[(y + 1) * (W + 1) + (x + 1)] = S[y * (W + 1) + (x + 1)] + rs;
      S2[(y + 1) * (W + 1) + (x + 1)] = S2[y * (W + 1) + (x + 1)] + rs2;
    }
  }
  const sigma = (x, y) => {
    const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R);
    const x1 = Math.min(W - 1, x + R), y1 = Math.min(HH - 1, y + R);
    const n = (x1 - x0 + 1) * (y1 - y0 + 1);
    const sum = S[(y1 + 1) * (W + 1) + (x1 + 1)] - S[y0 * (W + 1) + (x1 + 1)] - S[(y1 + 1) * (W + 1) + x0] + S[y0 * (W + 1) + x0];
    const sq = S2[(y1 + 1) * (W + 1) + (x1 + 1)] - S2[y0 * (W + 1) + (x1 + 1)] - S2[(y1 + 1) * (W + 1) + x0] + S2[y0 * (W + 1) + x0];
    const mean = sum / n;
    return Math.sqrt(Math.max(0, sq / n - mean * mean));
  };

  const bgOk = new Uint8Array(N);
  for (let y = 0; y < HH; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, p = i * C;
    const spread = Math.max(data[p], data[p + 1], data[p + 2]) - Math.min(data[p], data[p + 1], data[p + 2]);
    if (spread < NEUTRAL && sigma(x, y) < SIGMA) bgOk[i] = 1;
  }

  const close = (a, b) => Math.abs(L[a] - L[b]) < STEP;
  const bg = new Uint8Array(N);
  const q = new Int32Array(N); let qs = 0, qe = 0;
  for (let x = 0; x < W; x++) for (const y of [0, HH - 1]) {
    const i = y * W + x; if (bgOk[i] && !bg[i]) { bg[i] = 1; q[qe++] = i; }
  }
  for (let y = 0; y < HH; y++) for (const x of [0, W - 1]) {
    const i = y * W + x; if (bgOk[i] && !bg[i]) { bg[i] = 1; q[qe++] = i; }
  }
  while (qs < qe) {
    const i = q[qs++], x = i % W, y = (i / W) | 0;
    if (x + 1 < W)  { const j = i + 1; if (!bg[j] && bgOk[j] && close(i, j)) { bg[j] = 1; q[qe++] = j; } }
    if (x > 0)      { const j = i - 1; if (!bg[j] && bgOk[j] && close(i, j)) { bg[j] = 1; q[qe++] = j; } }
    if (y + 1 < HH) { const j = i + W; if (!bg[j] && bgOk[j] && close(i, j)) { bg[j] = 1; q[qe++] = j; } }
    if (y > 0)      { const j = i - W; if (!bg[j] && bgOk[j] && close(i, j)) { bg[j] = 1; q[qe++] = j; } }
  }

  // dilate bg 2px into the high-variance fringe (neutral pixels only)
  for (let pass = 0; pass < 2; pass++) {
    const add = [];
    for (let i = 0; i < N; i++) {
      if (bg[i]) continue;
      const p = i * C;
      const spread = Math.max(data[p], data[p + 1], data[p + 2]) - Math.min(data[p], data[p + 1], data[p + 2]);
      if (spread >= NEUTRAL + 6) continue;
      const x = i % W, y = (i / W) | 0;
      if ((x + 1 < W && bg[i + 1]) || (x > 0 && bg[i - 1]) || (y + 1 < HH && bg[i + W]) || (y > 0 && bg[i - W])) add.push(i);
    }
    for (const i of add) bg[i] = 1;
  }

  // largest subject blob only
  const label = new Int32Array(N).fill(-1);
  let best = -1, bestSize = 0, cur = 0;
  const q2 = new Int32Array(N);
  for (let s = 0; s < N; s++) {
    if (bg[s] || label[s] !== -1) continue;
    let size = 0, s2 = 0, e2 = 0;
    q2[e2++] = s; label[s] = cur;
    while (s2 < e2) {
      const i = q2[s2++]; size++;
      const x = i % W, y = (i / W) | 0;
      if (x + 1 < W  && !bg[i + 1] && label[i + 1] === -1) { label[i + 1] = cur; q2[e2++] = i + 1; }
      if (x > 0      && !bg[i - 1] && label[i - 1] === -1) { label[i - 1] = cur; q2[e2++] = i - 1; }
      if (y + 1 < HH && !bg[i + W] && label[i + W] === -1) { label[i + W] = cur; q2[e2++] = i + W; }
      if (y > 0      && !bg[i - W] && label[i - W] === -1) { label[i - W] = cur; q2[e2++] = i - W; }
    }
    if (size > bestSize) { bestSize = size; best = cur; }
    cur++;
  }

  const mask = Buffer.alloc(N);
  for (let i = 0; i < N; i++) mask[i] = (!bg[i] && label[i] === best) ? 255 : 0;
  const maskPng = await sharp(mask, { raw: { width: W, height: HH, channels: 1 } }).png().toBuffer();
  const soft = await sharp(maskPng).blur(0.8).linear(1.5, -60).blur(0.5)
    .toColourspace("b-w").raw().toBuffer();

  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const p = i * C, o = i * 4;
    out[o] = data[p]; out[o + 1] = data[p + 1]; out[o + 2] = data[p + 2];
    out[o + 3] = soft[i];
  }
  await sharp(out, { raw: { width: W, height: HH, channels: 4 } })
    .trim({ threshold: 2 })
    .webp({ quality: 88, alphaQuality: 90 }).toFile(job.out);
  const m = await sharp(job.out).metadata();
  console.log(job.out.split("/").pop(), `${m.width}x${m.height}`, `bg=${((qe / N) * 100).toFixed(1)}% blob=${((bestSize / N) * 100).toFixed(1)}%`);
}
