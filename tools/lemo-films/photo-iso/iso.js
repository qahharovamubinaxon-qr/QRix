/* Isometric drawing kit — projection, painter sort, three-tone solids.
 *
 * The style's rule is that shapes are separated only by the three tones of
 * each face: no outlines on solids, no lighting model. So a box is three
 * parallelograms and nothing else, and everything is queued and depth-sorted
 * before any of it is flushed — a box drawn the moment it is described would
 * sit in front of things that are nearer the camera.
 */

export const COS30 = Math.cos(Math.PI / 6);

/** World (x down-right, y down-left, z up) → screen, through the camera. */
export const project = (cam, x, y, z) => ({
  sx: cam.px + (x - y) * COS30 * cam.k - cam.cx,
  sy: cam.py + ((x + y) * 0.5 - z) * cam.k - cam.cy,
});

/** Camera: a world centre, a zoom in px per unit, and the screen point it lands on. */
export const camera = (centre, k, w, h, yFrac = 0.44) => {
  const px = w / 2;
  // A 9:16 frame is mostly sky if the diorama is centred: the board wants to
  // sit a little above the middle, leaving the lower third for the subtitle
  // card the style asks to keep clear.
  const py = h * yFrac;
  const c = {
    px, py, k,
    cx: (centre[0] - centre[1]) * COS30 * k,
    cy: ((centre[0] + centre[1]) * 0.5 - centre[2]) * k,
  };
  return c;
};

/** Zoom interpolates logarithmically or a pull-out races at the end. */
export const lerpZoom = (a, b, t) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

const WARM_WHITE = [255, 248, 238];
const COOL_DARK = [35, 26, 44];

/**
 * The three tones of one base colour. Top light, the +y face mid, the +x face
 * dark, with the dark side mixed toward a cool shade so shadows stay slightly
 * cool — flat, but not lifeless.
 */
export const tones = (base) => {
  const c = hex(base);
  return {
    top: mix(c, WARM_WHITE, 0.2),
    left: `rgb(${c.join(",")})`,
    right: mix(c, COOL_DARK, 0.22),
  };
};

export class Scene {
  constructor(ctx, cam) {
    this.ctx = ctx;
    this.cam = cam;
    this.items = [];
  }

  /** depth = x + y + z; a bias rescues composites that painter order gets wrong. */
  push(depth, draw, bias = 0) {
    this.items.push({ d: depth + bias, draw });
  }

  flush() {
    this.items.sort((a, b) => a.d - b.d);
    for (const it of this.items) it.draw(this.ctx, this.cam);
    this.items = [];
  }

  poly(pts, fill) {
    const { ctx } = this;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  /** A box with its near corner at (x,y,z) and size (w,d,h). */
  box(x, y, z, w, d, h, base, opts = {}) {
    const T = opts.tones ?? tones(base);
    const a = opts.alpha ?? 1;
    this.push(x + y + z + (opts.bias ?? 0), (ctx, cam) => {
      const P = (X, Y, Z) => project(cam, X, Y, Z);
      ctx.save();
      ctx.globalAlpha = a;
      // top
      this.poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], T.top);
      // +y face (left on screen)
      this.poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], T.left);
      // +x face (right on screen)
      this.poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], T.right);
      ctx.restore();
    });
  }

  /** A flat plate lying on the board — plates read as surfaces, not solids. */
  plate(x, y, z, w, d, fill, opts = {}) {
    this.push(x + y + z + (opts.bias ?? -0.01), (ctx, cam) => {
      const P = (X, Y, Z) => project(cam, X, Y, Z);
      ctx.save();
      ctx.globalAlpha = opts.alpha ?? 1;
      this.poly([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)], fill);
      if (opts.stroke) {
        ctx.strokeStyle = opts.stroke;
        ctx.lineWidth = opts.lw ?? 2;
        ctx.setLineDash(opts.dash ?? []);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    });
  }

  /** Ink line through world points — leaders, routes, cut lines. */
  line(pts, opts = {}) {
    const d = pts.reduce((s, p) => s + p[0] + p[1] + p[2], 0) / pts.length;
    this.push(d + (opts.bias ?? 6), (ctx, cam) => {
      ctx.save();
      ctx.globalAlpha = opts.alpha ?? 1;
      ctx.strokeStyle = opts.color ?? "#2b2537";
      ctx.lineWidth = opts.lw ?? 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (opts.dash) ctx.setLineDash(opts.dash);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const q = project(cam, p[0], p[1], p[2]);
        i ? ctx.lineTo(q.sx, q.sy) : ctx.moveTo(q.sx, q.sy);
      });
      ctx.stroke();
      ctx.restore();
    });
  }
}

/** Text with the style's halo, so a label survives landing on any block. */
export const inkText = (ctx, text, x, y, opts = {}) => {
  ctx.save();
  ctx.font = opts.font ?? "600 42px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = opts.baseline ?? "alphabetic";
  if (opts.track) {
    ctx.letterSpacing = `${opts.track}px`;
  }
  ctx.lineWidth = opts.halo ?? 7;
  ctx.strokeStyle = opts.haloColor ?? "#efeae0";
  ctx.lineJoin = "round";
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = opts.color ?? "#2b2537";
  ctx.fillText(text, x, y);
  ctx.restore();
};

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const ease = {
  out: (t) => 1 - Math.pow(1 - clamp01(t), 4),
  in: (t) => Math.pow(clamp01(t), 4),
  inOut: (t) => (clamp01(t) < 0.5 ? 8 * Math.pow(t, 4) : 1 - Math.pow(-2 * t + 2, 4) / 2),
  back: (t) => {
    const c = 1.70158;
    const u = clamp01(t) - 1;
    return 1 + (c + 1) * u * u * u + c * u * u;
  },
};
/** Window helper: 0 before `a`, eased 0→1 across [a,b], 1 after. */
export const sweep = (t, a, b, fn = ease.out) => fn(clamp01((t - a) / (b - a)));
