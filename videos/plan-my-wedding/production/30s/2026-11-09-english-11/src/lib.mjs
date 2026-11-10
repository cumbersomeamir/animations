// Origami-world primitives (own code). Implements the paper-animation skill's grammar locally:
// faceted folded paper lit from the upper left, crisp crease lines, soft diffused shadows,
// planar hinge folds / pop-ups, and stepped 12 fps stop-motion timing.
import { GlobalFonts, createCanvas } from '@napi-rs/canvas';
import nodePath from 'node:path';

export const W = 1080, H = 1920, FPS = 30, DURATION = 30;
export const STEP = 12; // internal animation rate (skill: "stop-motion cadence, 12 fps judder")

// Palette: accents sampled from the app's Play icon (assets/app-icon-play.png); pastels are tints of them.
export const P = {
  cream: '#FDF6EE', // icon background (exact)
  creamDeep: '#F1E3D2',
  blush: '#F3DAD6', // 18% raspberry on cream
  blushDeep: '#E6BDB9',
  rasp: '#B32F3F', // icon ribbon (exact median)
  raspDark: '#8C2622', // icon ribbon shadow
  raspLight: '#D95A65', // icon ribbon highlight
  gold: '#C3904C', // icon ring (exact median)
  goldDark: '#AE722E',
  goldLight: '#D9AE64',
  goldPale: '#EBD5AE', // 40% gold on cream
  ink: '#4A1E26', // raspberry darkened for text
};

const FD = nodePath.resolve('node_modules/@expo-google-fonts');
GlobalFonts.registerFromPath(nodePath.join(FD, 'cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf'), 'Cormorant');
GlobalFonts.registerFromPath(nodePath.join(FD, 'cormorant-garamond/600SemiBold_Italic/CormorantGaramond_600SemiBold_Italic.ttf'), 'Cormorant Italic');
GlobalFonts.registerFromPath(nodePath.join(FD, 'jost/500Medium/Jost_500Medium.ttf'), 'Jost');
GlobalFonts.registerFromPath(nodePath.join(FD, 'jost/600SemiBold/Jost_600SemiBold.ttf'), 'Jost SemiBold');
export const F = {
  serif: (px) => `${px}px Cormorant`,
  serifI: (px) => `${px}px "Cormorant Italic"`,
  sans: (px) => `${px}px Jost`,
  sansB: (px) => `${px}px "Jost SemiBold"`,
};

// ---------------------------------------------------------------- timing
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, u) => a + (b - a) * u;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const TAU = Math.PI * 2;
/** quantize time to the 12 fps stop-motion grid */
export const stepT = (t) => Math.floor(t * STEP + 1e-6) / STEP;
export const ease = {
  lin: (u) => u,
  out: (u) => 1 - Math.pow(1 - u, 3),
  in: (u) => u * u * u,
  inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  back: (u, s = 1.9) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2),
};
export const seg = (t, a, b, e = ease.inOut) => e(prog(t, a, b));
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** hand-placed jitter: a tiny offset that changes once per stop-motion step */
export function jit(t, id, amp = 1.6) {
  const r = rng((Math.floor(t * STEP) + 1) * 7919 + id * 104729);
  return { x: (r() - 0.5) * 2 * amp, y: (r() - 0.5) * 2 * amp, r: (r() - 0.5) * 0.006 * amp };
}

// ---------------------------------------------------------------- colour
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgb = (c) => `rgb(${c.map((v) => Math.round(clamp(v, 0, 255))).join(',')})`;
/** tone > 0 lightens toward warm white, < 0 darkens toward raspberry-brown (soft diffused light) */
export function shade(base, tone) {
  const c = hex(base);
  if (tone >= 0) return rgb(c.map((v, i) => lerp(v, [255, 252, 246][i], tone * 0.55)));
  return rgb(c.map((v, i) => lerp(v, [60, 22, 28][i], -tone * 0.42)));
}
export const mixHex = (a, b, u) => rgb(hex(a).map((v, i) => lerp(v, hex(b)[i], u)));

// ---------------------------------------------------------------- paper grain overlay
export function makeGrain(seed = 3) {
  const cv = createCanvas(W, H);
  const g = cv.getContext('2d');
  g.fillStyle = 'rgb(128,128,128)';
  g.fillRect(0, 0, W, H);
  const r = rng(seed);
  for (let i = 0; i < 60000; i++) {
    const v = 100 + r() * 56;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6);
  }
  for (let i = 0; i < 900; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 8 + r() * 30, v = r() < 0.5 ? 104 : 150;
    g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return cv;
}

// ---------------------------------------------------------------- facets
/** facet = { pts:[[x,y],...], c: baseColor, tone: -1..1 } in local coords */
export function facets(ctx, list, opt = {}) {
  const { shadow = true, crease = true, outline = true } = opt;
  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(92,36,40,0.24)';
    ctx.shadowBlur = opt.blur ?? 20;
    ctx.shadowOffsetX = opt.sx ?? 7;
    ctx.shadowOffsetY = opt.sy ?? 12;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    for (const f of list) { path(ctx, f.pts); ctx.fillStyle = shade(f.c, f.tone); ctx.fill(); }
    ctx.restore();
  }
  for (const f of list) {
    path(ctx, f.pts);
    const [x0, y0, x1, y1] = bbox(f.pts);
    const gr = ctx.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, shade(f.c, f.tone + 0.08));
    gr.addColorStop(1, shade(f.c, f.tone - 0.06));
    ctx.fillStyle = gr;
    ctx.fill();
    if (outline) { ctx.strokeStyle = 'rgba(74,30,38,0.16)'; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke(); }
  }
  if (crease) {
    // crisp crease highlight along shared edges: thin warm-white line
    ctx.strokeStyle = 'rgba(255,250,242,0.55)';
    ctx.lineWidth = 1.4;
    for (const f of list) if (f.crease) for (const [a, b] of f.crease) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  }
}
export function path(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
function bbox(pts) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}

/** Hinge fold: rotate points about the line a->b by angle th (0 = flat, PI = folded over).
 *  Orthographic projection: perpendicular distance scales by cos(th). Returns {pts, front, k}. */
export function hinge(pts, a, b, th) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  const k = Math.cos(th);
  return {
    pts: pts.map(([x, y]) => {
      const px = x - a[0], py = y - a[1];
      const along = px * ux + py * uy, perp = px * nx + py * ny;
      return [a[0] + ux * along + nx * perp * k, a[1] + uy * along + ny * perp * k];
    }),
    front: k >= 0,
    k,
  };
}

/** Pop-up: draw fn() rising from the floor line (local y=0 is the base). u 0..1(+overshoot). */
export function popup(ctx, x, y, u, fn, sc = 1) {
  if (u <= 0.02) return;
  const sy = Math.sin(clamp(u, 0, 1.15) * Math.PI / 2);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc * sy);
  fn(ctx, u);
  ctx.restore();
}

export function star4(ctx, x, y, r, c1, c2) {
  // four-petal flower (icon motif) as folded facets
  const list = [];
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 - Math.PI / 2;
    const tip = [x + Math.cos(a) * r, y + Math.sin(a) * r];
    const l = [x + Math.cos(a - 0.6) * r * 0.45, y + Math.sin(a - 0.6) * r * 0.45];
    const rr = [x + Math.cos(a + 0.6) * r * 0.45, y + Math.sin(a + 0.6) * r * 0.45];
    list.push({ pts: [[x, y], l, tip], c: c1, tone: 0.25 - i * 0.12 }, { pts: [[x, y], tip, rr], c: c2 || c1, tone: -0.15 - i * 0.05 });
  }
  facets(ctx, list, { shadow: true, blur: 8, sx: 3, sy: 5 });
  ctx.fillStyle = P.goldLight; ctx.beginPath(); ctx.arc(x, y, r * 0.16, 0, TAU); ctx.fill();
}
