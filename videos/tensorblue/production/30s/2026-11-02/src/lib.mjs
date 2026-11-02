// Tensorblue — original crosshatch-ink drawing kit (written for this channel).
// Art direction follows the Animate skill's Crosshatch STYLE.md (read-only):
// boiling ink on 2s, hatch / cross / coloured-pencil / stipple textures clipped
// inside shapes and shaped by top-left light, paper grain, terracotta hero dot,
// red-pencil dashes for a plan. No code from the skill is copied or executed.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const W = 1080, H = 1920, FPS = 30, NFRAMES = 900;
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FONT_PATH = path.resolve(HERE, '../../../../assets/fonts/patrick-hand/PatrickHand-Regular.ttf');
GlobalFonts.registerFromPath(FONT_PATH, 'PatrickHand');
export const HAND = 'PatrickHand';

// Neutral ink/cream fallback palette (Crosshatch day palette). No approved
// Tensorblue brand palette exists in this branch; see context/00-channel.md.
export const C = {
  ink: '#3a2417', paper: '#f4ecd9', cream: '#efe5cf', wood: '#d6a466',
  yellow: '#f0c55a', green: '#5f9c5c', red: '#d4382c', sky: '#9cc4d6',
  rose: '#d98b8b', hero: '#d97757', plan: 'rgba(212,56,44,0.92)',
  peri: '#8f9ad6', gray: '#9a8f80',
};

// ---- global draw state -----------------------------------------------------
export const S = { boil: 0, alpha: 1, frame: 0 };
export function setFrame(f) { S.frame = f; S.boil = Math.floor(f / 2); }

// ---- deterministic randomness ----------------------------------------------
export function hash(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function RNG(seed) {
  let a = (typeof seed === 'number' ? seed : hash(seed)) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function lat(seed, i) {
  let h = Math.imul(seed ^ Math.imul(i, 374761393), 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return ((h >>> 0) / 4294967296) * 2 - 1;
}
export function n1(seed, x) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lat(seed, i) * (1 - u) + lat(seed, i + 1) * u;
}

// ---- easing / time ---------------------------------------------------------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (t) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
export const easeIn = (t) => { t = clamp(t); return t * t * t; };
export const ev = (t, t0, d) => clamp((t - t0) / d); // 0..1 progress of an event
export const back = (t) => { t = clamp(t); const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// "on 2s": quantise time to the boil step so motion is held for 2 frames
export const T2 = (f) => (Math.floor(f / 2) * 2) / FPS;

// ---- geometry --------------------------------------------------------------
export function resample(pts, step = 6) {
  const out = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d === 0) continue;
    let s = step - carry;
    while (s <= d) { out.push([x0 + (x1 - x0) * s / d, y0 + (y1 - y0) * s / d]); s += step; }
    carry = d - (s - step);
  }
  const last = pts[pts.length - 1];
  const pl = out[out.length - 1];
  if (Math.hypot(last[0] - pl[0], last[1] - pl[1]) > 0.5) out.push(last);
  return out;
}
export function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; }
export function circlePts(cx, cy, r, n = 64, a0 = -Math.PI / 2, sweep = Math.PI * 2) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = a0 + sweep * i / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}
export function ellipsePts(cx, cy, rx, ry, n = 64, a0 = 0, sweep = Math.PI * 2) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = a0 + sweep * i / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
}
export function quadPts(a, c, b, n = 48) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    p.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return p;
}
export function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
export function pointAt(p, t) {
  const L = polyLen(p) * clamp(t);
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + d >= L) { const k = d ? (L - acc) / d : 0; return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; }
    acc += d;
  }
  const n = p.length - 1; return [p[n][0], p[n][1], Math.atan2(p[n][1] - p[n - 1][1], p[n][0] - p[n - 1][0])];
}
export function subPath(p, frac) {
  if (frac >= 1) return p;
  const L = polyLen(p) * clamp(frac);
  const out = [p[0]]; let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + d >= L) { const k = d ? (L - acc) / d : 0; out.push([lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k)]); return out; }
    out.push(p[i]); acc += d;
  }
  return out;
}
export function transformPts(p, dx, dy, s = 1, rot = 0, ox = 0, oy = 0) {
  const c = Math.cos(rot), sn = Math.sin(rot);
  return p.map(([x, y]) => { const X = (x - ox) * s, Y = (y - oy) * s; return [ox + X * c - Y * sn + dx, oy + X * sn + Y * c + dy]; });
}

// ---- the boiling line ------------------------------------------------------
export function wobble(pts, amt, key, step = 6) {
  const rs = resample(pts, step);
  const seed = (hash(key) ^ Math.imul(S.boil + 1, 2654435761)) >>> 0;
  const out = new Array(rs.length);
  for (let i = 0; i < rs.length; i++) {
    const a = rs[Math.max(0, i - 1)], b = rs[Math.min(rs.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const o = amt * (0.75 * n1(seed, i * 0.16) + 0.25 * n1(seed + 99, i * 0.7));
    out[i] = [rs[i][0] + nx * o, rs[i][1] + ny * o];
  }
  return out;
}
function strokePts(ctx, p) {
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
  ctx.stroke();
}
// ink(points, { w, color, amt, key, frac, double, alpha, dash })
export function ink(ctx, pts, o = {}) {
  const { w = 3, color = C.ink, amt = 1.3, key = 'ink', frac = 1, double = true, alpha = 1, dash = null, cap = 'round' } = o;
  if (frac <= 0 || pts.length < 2) return;
  let p = wobble(pts, amt, key);
  if (frac < 1) p = subPath(p, frac);
  if (p.length < 2) return;
  ctx.save();
  ctx.globalAlpha = S.alpha * alpha;
  ctx.strokeStyle = color; ctx.lineCap = cap; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.lineWidth = w; strokePts(ctx, p);
  if (double && !dash) {
    let q = wobble(pts, amt * 1.25, key + '#2');
    if (frac < 1) q = subPath(q, frac * 0.97);
    if (q.length > 1) { ctx.globalAlpha = S.alpha * alpha * 0.5; ctx.lineWidth = w * 0.45; strokePts(ctx, q); }
  }
  ctx.restore();
}
// red pencil plan dashes, written on with frac
export function planDash(ctx, pts, o = {}) {
  const { frac = 1, key = 'plan', w = 4.2, alpha = 1 } = o;
  const p = subPath(resample(pts, 4), frac);
  if (p.length < 2) return;
  const seed = hash(key) ^ (S.boil * 7919);
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = C.plan; ctx.lineCap = 'round';
  // grainy pencil dashes: short segments with slight jitter per boil
  let L = 0, on = true, segStart = 0; const dashOn = 15, dashOff = 11;
  ctx.lineWidth = w; ctx.beginPath();
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); L += d;
    const j = n1(seed, i * 0.3) * 0.9;
    if (on) { if (i === segStart + 1) ctx.moveTo(p[i - 1][0] + j, p[i - 1][1] - j); ctx.lineTo(p[i][0] + j, p[i][1] + j); }
    if (on && L >= dashOn) { on = false; L = 0; }
    else if (!on && L >= dashOff) { on = true; L = 0; segStart = i; }
    if (!on) segStart = i;
  }
  ctx.stroke(); ctx.restore();
}

// ---- textures clipped inside shapes ----------------------------------------
function pathFrom(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); }
function bbox(p) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of p) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }

// parallel strokes at an angle, kept where dens(x,y) beats a per-dash threshold
export function hatchLines(ctx, box, o) {
  const { angle = -0.8, gap = 9, w = 1.6, color = C.ink, dens = () => 0.6, key = 'h', alpha = 0.75, seg = 16, jitter = 1.2, pencil = false } = o;
  const [x0, y0, x1, y1] = box;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const rnd = RNG(hash(key) ^ (pencil ? S.boil * 13 : Math.floor(S.boil / 1) * 31));
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let off = -R; off <= R; off += gap) {
    const oo = off + (rnd() - 0.5) * jitter;
    for (let s = -R; s < R; s += seg) {
      const sl = seg * (0.55 + rnd() * 0.5);
      const ax = cx + ca * s - sa * oo, ay = cy + sa * s + ca * oo;
      const mx = ax + ca * sl / 2, my = ay + sa * sl / 2;
      if (mx < x0 - 10 || mx > x1 + 10 || my < y0 - 10 || my > y1 + 10) continue;
      if (dens(mx, my) <= rnd()) continue;
      const wj = (rnd() - 0.5) * jitter;
      ctx.moveTo(ax - sa * wj, ay + ca * wj); ctx.lineTo(ax + ca * sl, ay + sa * sl);
    }
  }
  ctx.stroke(); ctx.restore();
}
export function stippleDots(ctx, box, o) {
  const { dens = () => 0.3, color = C.ink, key = 's', step = 7, r = 1.3, alpha = 0.7 } = o;
  const [x0, y0, x1, y1] = box; const rnd = RNG(hash(key));
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.fillStyle = color; ctx.beginPath();
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
    const jx = x + (rnd() - 0.5) * step, jy = y + (rnd() - 0.5) * step;
    if (dens(jx, jy) * 0.6 > rnd()) { ctx.moveTo(jx + r, jy); ctx.arc(jx, jy, r * (0.6 + rnd() * 0.6), 0, Math.PI * 2); }
  }
  ctx.fill(); ctx.restore();
}
// light from the top-left: darker toward bottom-right of a box
export function lightDens(box, base = 0.25, k = 0.55) {
  const [x0, y0, x1, y1] = box; const w = x1 - x0 || 1, h = y1 - y0 || 1;
  return (x, y) => clamp(base + k * (((x - x0) / w) * 0.5 + ((y - y0) / h) * 0.5) - k * 0.25);
}
// paint(points, { fill, tex: [...], line, w, key })
export function paint(ctx, pts, o = {}) {
  const { fill = C.cream, tex = [], line = C.ink, w = 3, key = 'paint', amt = 1.2, outline = true, alpha = 1 } = o;
  const wp = wobble(pts, amt * 0.5, key + 'f', 8);
  const box = bbox(pts);
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  if (fill) { ctx.fillStyle = fill; pathFrom(ctx, wp); ctx.fill(); }
  pathFrom(ctx, wp); ctx.clip();
  const sa = S.alpha; S.alpha = sa * alpha;
  for (const t of tex) {
    const dens = t.dens || lightDens(box, t.base ?? 0.3, t.k ?? 0.6);
    if (t.kind === 'hatch') hatchLines(ctx, box, { ...t, dens, key: key + 'h' + (t.angle ?? 0) });
    else if (t.kind === 'cross') { hatchLines(ctx, box, { ...t, dens, key: key + 'c1' }); hatchLines(ctx, box, { ...t, angle: (t.angle ?? -0.8) + Math.PI / 2, dens: (x, y) => clamp((dens(x, y) - 0.45) * 2), key: key + 'c2' }); }
    else if (t.kind === 'pencil') hatchLines(ctx, box, { gap: 4.5, w: 2.4, seg: 26, jitter: 2.5, alpha: 0.42, ...t, dens, key: key + 'p', pencil: true });
    else if (t.kind === 'stipple') stippleDots(ctx, box, { ...t, dens, key: key + 's' });
  }
  S.alpha = sa;
  ctx.restore();
  if (outline && line) ink(ctx, pts, { w, color: line, key: key + 'o', amt, alpha });
}

// ---- hand-lettered text ----------------------------------------------------
export function hand(ctx, str, x, y, o = {}) {
  const { size = 40, color = C.ink, align = 'center', frac = 1, rot = 0, alpha = 1, key = str, base = 'alphabetic' } = o;
  if (frac <= 0) return;
  const n = Math.ceil(str.length * clamp(frac));
  const shown = str.slice(0, n);
  const seed = hash(key) ^ (S.boil * 977);
  const jx = n1(seed, 0.5) * 0.7, jy = n1(seed, 1.5) * 0.7, jr = n1(seed, 2.5) * 0.006;
  ctx.save();
  ctx.globalAlpha = S.alpha * alpha;
  ctx.translate(x + jx, y + jy); ctx.rotate(rot + jr);
  ctx.font = `${size}px ${HAND}`; ctx.fillStyle = color; ctx.textBaseline = base;
  // align on the full string so a write-on does not slide
  const full = ctx.measureText(str).width;
  const sx = align === 'center' ? -full / 2 : align === 'right' ? -full : 0;
  ctx.textAlign = 'left';
  ctx.fillText(shown, sx, 0);
  ctx.restore();
}
export function handW(ctx, str, size) { ctx.save(); ctx.font = `${size}px ${HAND}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }

// ---- small props -----------------------------------------------------------
export function asterisk(ctx, x, y, r, color = '#fff8ee', w = 2.4) {
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.3; ctx.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.stroke(); ctx.restore();
}
// the hero: a terracotta ink dot with an asterisk (the request)
export function heroDot(ctx, x, y, r = 16, key = 'hero') {
  paint(ctx, circlePts(x, y, r, 28), { fill: C.hero, key, w: 2.6, amt: 0.8, tex: [{ kind: 'hatch', angle: -0.7, gap: 5, w: 1.3, color: '#9a3f22', alpha: 0.5, base: 0.0, k: 1.1 }] });
  asterisk(ctx, x - r * 0.08, y - r * 0.08, r * 0.45);
}
export function check(ctx, x, y, s = 1, o = {}) {
  ink(ctx, [[x - 16 * s, y], [x - 5 * s, y + 12 * s], [x + 20 * s, y - 16 * s]], { w: 4.5 * s, key: o.key || ('chk' + x + y), frac: o.frac ?? 1, color: o.color || C.ink, alpha: o.alpha ?? 1 });
}

// ---- paper -----------------------------------------------------------------
export function makePaper() {
  const cv = createCanvas(W, H); const g = cv.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const r = RNG('paper-mottle');
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H, rad = 90 + r() * 220;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() < 0.5;
    gr.addColorStop(0, dark ? 'rgba(170,140,95,0.028)' : 'rgba(255,252,240,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // fibres
  g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 3 + r() * 11;
    g.strokeStyle = r() < 0.6 ? 'rgba(120,95,60,0.07)' : 'rgba(255,255,250,0.14)'; g.lineWidth = 0.6 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 3, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // fine grain
  const id = g.getImageData(0, 0, W, H); const d = id.data; const rg = RNG('paper-grain');
  for (let i = 0; i < d.length; i += 4) { const v = (rg() - 0.5) * 14; d[i] += v; d[i + 1] += v; d[i + 2] += v * 0.9; }
  g.putImageData(id, 0, 0);
  // vignette toward the edges (light from the top-left)
  const vg = g.createRadialGradient(W * 0.42, H * 0.42, H * 0.35, W * 0.5, H * 0.55, H * 0.85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,60,30,0.09)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}
export function makeGrainTile(n = 256, seed = 'grain') {
  const cv = createCanvas(n, n); const g = cv.getContext('2d');
  const id = g.createImageData(n, n); const d = id.data; const r = RNG(seed);
  for (let i = 0; i < d.length; i += 4) { const v = r(); d[i] = d[i + 1] = d[i + 2] = v < 0.5 ? 40 : 255; d[i + 3] = Math.floor(Math.abs(v - 0.5) * 2 * 26); }
  g.putImageData(id, 0, 0);
  return cv;
}
