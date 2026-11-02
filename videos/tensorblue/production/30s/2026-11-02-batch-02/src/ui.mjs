// Tensorblue software-cutaway kit (original code for this channel).
// Brand-aligned revision of the Crosshatch art direction, per user feedback
// (2026-11-02 batch 02): no boiling or ambient moving lines; crosshatch survives
// only as STATIC texture (seeded once per element, never re-randomised per frame);
// clean UI geometry; Tensorblue website palette.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const W = 1080, H = 1920, FPS = 30, NFRAMES = 900;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.resolve(HERE, '../../../../assets/fonts/inter');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Medium.otf'), 'InterM');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-SemiBold.otf'), 'InterSB');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Bold.otf'), 'InterB');

// Tensorblue website palette (supplied by the user, observed 2026-11-02)
export const C = {
  bg: '#030610', navy: '#0D1628', navy2: '#0A172D', blue: '#0A6CFF', white: '#FFFFFF', sec: '#D8E3F5',
  g1: '#E8F3FF', g2: '#91BBFF', g3: '#85ECED', g4: '#EDF9FF',
  // tints derived from the palette (alpha / mixes only)
  line: 'rgba(216,227,245,0.28)', faint: 'rgba(216,227,245,0.12)', hatch: 'rgba(145,187,255,0.16)',
};
export const S = { alpha: 1 };

// ---- maths ------------------------------------------------------------------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (t) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
export const easeIn = (t) => { t = clamp(t); return t * t * t; };
export const back = (t) => { t = clamp(t); const c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const ev = (t, t0, d) => clamp((t - t0) / d);
export const win = (t, t0, t1, fin = 0.25, fout = 0.25) => clamp((t - t0) / fin) * clamp((t1 - t) / fout);
export function hash(str) { let h = 2166136261 >>> 0; const s = String(str); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function RNG(seed) {
  let a = (typeof seed === 'number' ? seed : hash(seed)) >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function quad(a, c, b, t) { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
export function quadPts(a, c, b, n = 48) { const p = []; for (let i = 0; i <= n; i++) p.push(quad(a, c, b, i / n)); return p; }
export function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
export function pointAt(p, t) {
  const L = polyLen(p) * clamp(t); let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + d >= L) { const k = d ? (L - acc) / d : 0; return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k)]; }
    acc += d;
  }
  return p[p.length - 1];
}
export function subPath(p, frac) {
  if (frac >= 1) return p;
  const L = polyLen(p) * clamp(frac); const out = [p[0]]; let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + d >= L) { const k = d ? (L - acc) / d : 0; out.push([lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k)]); return out; }
    out.push(p[i]); acc += d;
  }
  return out;
}

// ---- drawing primitives -----------------------------------------------------
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function polyline(ctx, p, o = {}) {
  const { w = 3, color = C.sec, alpha = 1, dash = null, frac = 1, cap = 'round' } = o;
  const q = frac < 1 ? subPath(p, frac) : p; if (q.length < 2 || frac <= 0 || polyLen(q) < 0.5) return; // no zero-length round-cap dots
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]); ctx.stroke(); ctx.restore();
}
// static crosshatch: seeded by `key` only, so it never changes between frames
export function hatch(ctx, clipFn, box, o = {}) {
  const { angle = -0.8, gap = 9, w = 1.4, color = C.hatch, alpha = 1, dens = () => 0.6, key = 'h', cross = false } = o;
  const [x0, y0, x1, y1] = box; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
  const rnd = RNG(key);
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; clipFn(); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const pass = (ang, dfn) => {
    const ca = Math.cos(ang), sa = Math.sin(ang); ctx.beginPath();
    for (let off = -R; off <= R; off += gap) for (let s = -R; s < R; s += 18) {
      const sl = 18 * (0.6 + rnd() * 0.45);
      const ax = cx + ca * s - sa * off, ay = cy + sa * s + ca * off;
      const mx = ax + ca * sl / 2, my = ay + sa * sl / 2;
      if (mx < x0 - 8 || mx > x1 + 8 || my < y0 - 8 || my > y1 + 8) continue;
      if (dfn(mx, my) <= rnd()) continue;
      ctx.moveTo(ax, ay); ctx.lineTo(ax + ca * sl, ay + sa * sl);
    }
    ctx.stroke();
  };
  pass(angle, dens);
  if (cross) pass(angle + Math.PI / 2, (x, y) => clamp((dens(x, y) - 0.45) * 2));
  ctx.restore();
}
// light from the top-left: shading grows toward the bottom-right of the box
export const shade = (box, base = 0.0, k = 1.0) => (x, y) => clamp(base + k * (((x - box[0]) / (box[2] - box[0])) * 0.5 + ((y - box[1]) / (box[3] - box[1])) * 0.5) - k * 0.35);

export function panel(ctx, x, y, w, h, o = {}) {
  const { r = 28, fill = C.navy, stroke = C.line, lw = 2, key = 'panel', hatchK = 0.9, alpha = 1, shadow = true } = o;
  if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.globalAlpha = S.alpha;
  if (shadow) { // static hatched drop shadow (offset down-right)
    hatch(ctx, () => rr(ctx, x + 14, y + 18, w, h, r), [x + 14, y + 18, x + w + 14, y + h + 18], { key: key + 'sh', color: 'rgba(10,108,255,0.20)', gap: 7, dens: () => 0.55 });
  }
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
  if (hatchK > 0) hatch(ctx, () => rr(ctx, x, y, w, h, r), [x, y, x + w, y + h], { key: key + 'h', dens: shade([x, y, x + w, y + h], -0.1, hatchK), gap: 10 });
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = stroke; ctx.lineWidth = lw; rr(ctx, x, y, w, h, r); ctx.stroke(); ctx.restore();
  S.alpha = sa;
}
export function text(ctx, str, x, y, o = {}) {
  const { size = 34, font = 'InterSB', color = C.white, align = 'center', alpha = 1, base = 'alphabetic', frac = 1, track = 0 } = o;
  if (alpha <= 0 || frac <= 0) return;
  const s = frac < 1 ? str.slice(0, Math.ceil(str.length * frac)) : str;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.font = `${size}px ${font}`; ctx.fillStyle = color; ctx.textBaseline = base;
  if (track) ctx.letterSpacing = `${track}px`;
  const full = ctx.measureText(str).width;
  const sx = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x;
  ctx.textAlign = 'left'; ctx.fillText(s, sx, y); ctx.restore();
}
export function textW(ctx, str, size, font = 'InterSB') { ctx.save(); ctx.font = `${size}px ${font}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }

export function heartPath(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + 0.36 * s);
  ctx.bezierCurveTo(cx - 0.06 * s, cy + 0.31 * s, cx - 0.5 * s, cy + 0.03 * s, cx - 0.5 * s, cy - 0.19 * s);
  ctx.bezierCurveTo(cx - 0.5 * s, cy - 0.44 * s, cx - 0.21 * s, cy - 0.56 * s, cx, cy - 0.31 * s);
  ctx.bezierCurveTo(cx + 0.21 * s, cy - 0.56 * s, cx + 0.5 * s, cy - 0.44 * s, cx + 0.5 * s, cy - 0.19 * s);
  ctx.bezierCurveTo(cx + 0.5 * s, cy + 0.03 * s, cx + 0.06 * s, cy + 0.31 * s, cx, cy + 0.36 * s);
  ctx.closePath();
}
// heart: fill 0..1 rises from the bottom (and drains on rollback)
export function heart(ctx, cx, cy, s, o = {}) {
  const { fill = 0, color = C.blue, stroke = C.white, lw = Math.max(2.5, s * 0.06), alpha = 1, pending = 0, key = 'heart' } = o;
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  if (fill > 0) {
    ctx.save(); heartPath(ctx, cx, cy, s); ctx.clip();
    const top = cy + 0.36 * s - fill * 0.95 * s;
    const g = ctx.createLinearGradient(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2);
    g.addColorStop(0, '#3d8bff'); g.addColorStop(1, color);
    ctx.fillStyle = g; ctx.fillRect(cx - s, top, s * 2, s * 2);
    // static hatch shading in the lower-right of the filled heart
    const sa = S.alpha; S.alpha = 1;
    hatch(ctx, () => { ctx.beginPath(); ctx.rect(cx - s, top, s * 2, s * 2); }, [cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2], { key, color: 'rgba(3,6,16,0.32)', gap: Math.max(4, s * 0.06), w: Math.max(1, s * 0.016), dens: shade([cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2], -0.15, 1.2) });
    S.alpha = sa;
    ctx.restore();
  }
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  if (pending > 0) ctx.setLineDash([s * 0.08, s * 0.06]);
  heartPath(ctx, cx, cy, s); ctx.stroke();
  ctx.restore();
}
export function burst(ctx, cx, cy, s, k) {
  // one-shot tap burst (hero gradient colours); k = 0..1
  if (k <= 0 || k >= 1) return;
  const cols = [C.g2, C.g3, C.g1, C.g3, C.g2, C.g4, C.g3, C.g2];
  ctx.save();
  ctx.globalAlpha = S.alpha * (1 - k);
  ctx.strokeStyle = C.g3; ctx.lineWidth = 6 * (1 - k) + 1;
  ctx.beginPath(); ctx.arc(cx, cy, s * (0.45 + 0.55 * easeOut(k)), 0, Math.PI * 2); ctx.stroke();
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 4; const r0 = s * (0.55 + 0.45 * easeOut(k)), r1 = r0 + s * 0.22 * (1 - k);
    ctx.strokeStyle = cols[i]; ctx.lineWidth = 7 * (1 - k) + 1;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
  }
  ctx.restore();
}
export function spinner(ctx, cx, cy, r, t, o = {}) {
  const { color = C.sec, w = 4, alpha = 1 } = o;
  const a0 = t * 7.5;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + Math.PI * 1.35); ctx.stroke(); ctx.restore();
}
export function checkMark(ctx, cx, cy, s, o = {}) {
  const { color = C.g3, w = s * 0.16, frac = 1, alpha = 1 } = o;
  polyline(ctx, [[cx - 0.45 * s, cy], [cx - 0.12 * s, cy + 0.32 * s], [cx + 0.5 * s, cy - 0.36 * s]], { w, color, frac, alpha });
}
export function crossMark(ctx, cx, cy, s, o = {}) {
  const { color = C.white, w = s * 0.15, frac = 1, alpha = 1 } = o;
  polyline(ctx, [[cx - 0.4 * s, cy - 0.4 * s], [cx + 0.4 * s, cy + 0.4 * s]], { w, color, frac: clamp(frac * 2), alpha });
  polyline(ctx, [[cx + 0.4 * s, cy - 0.4 * s], [cx - 0.4 * s, cy + 0.4 * s]], { w, color, frac: clamp(frac * 2 - 1), alpha });
}
export function badge(ctx, cx, cy, r, kind, o = {}) {
  const { alpha = 1, pop = 1 } = o; if (alpha <= 0 || pop <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(pop, pop); ctx.translate(-cx, -cy);
  const sa = S.alpha; S.alpha = sa * alpha;
  ctx.globalAlpha = S.alpha;
  ctx.fillStyle = kind === 'ok' ? C.g3 : kind === 'no' ? C.navy2 : C.navy2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = kind === 'ok' ? C.bg : C.white; ctx.lineWidth = 3; ctx.stroke();
  if (kind === 'ok') checkMark(ctx, cx, cy, r * 1.05, { color: C.bg, w: r * 0.22 });
  else if (kind === 'no') crossMark(ctx, cx, cy, r * 0.95, { color: C.white, w: r * 0.2 });
  else if (kind === 'wait') { spinner(ctx, cx, cy, r * 0.55, o.t || 0, { color: C.white, w: r * 0.18 }); }
  else if (kind === 'warn') { text(ctx, '!', cx, cy + r * 0.38, { size: r * 1.15, font: 'InterB', color: C.white }); }
  S.alpha = sa; ctx.restore();
}
// arrowhead at the end of a polyline
export function arrowHead(ctx, p, o = {}) {
  const { size = 18, color = C.sec, alpha = 1 } = o; const n = p.length - 1; if (n < 1) return;
  const a = Math.atan2(p[n][1] - p[n - 1][1], p[n][0] - p[n - 1][0]);
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.fillStyle = color; ctx.translate(p[n][0], p[n][1]); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-size, -size * 0.6); ctx.lineTo(-size * 0.7, 0); ctx.lineTo(-size, size * 0.6); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---- background (static, cached once) ------------------------------------------
export function makeBackground() {
  const cv = createCanvas(W, H); const g = cv.getContext('2d');
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  // soft brand glow behind the stage (hero gradient, very low alpha)
  const gl = g.createRadialGradient(540, 1000, 40, 540, 1000, 820);
  gl.addColorStop(0, 'rgba(10,108,255,0.20)'); gl.addColorStop(0.55, 'rgba(13,22,40,0.55)'); gl.addColorStop(1, 'rgba(3,6,16,0)');
  g.fillStyle = gl; g.fillRect(0, 0, W, H);
  // static engraved crosshatch in the lower corners only (texture, never moves)
  const sa = S.alpha; S.alpha = 1;
  hatch(g, () => { g.beginPath(); g.rect(0, 1150, W, H - 1150); }, [0, 1150, W, H], { key: 'bg-corner', color: 'rgba(145,187,255,0.07)', gap: 11, w: 1.3, cross: true, dens: (x, y) => clamp((Math.hypot(x - 540, y - 1000) - 520) / 420) });
  S.alpha = sa;
  // fine static grain
  const id = g.getImageData(0, 0, W, H); const d = id.data; const r = RNG('bg-grain');
  for (let i = 0; i < d.length; i += 4) { const v = (r() - 0.5) * 7; d[i] += v; d[i + 1] += v; d[i + 2] += v * 1.2; }
  g.putImageData(id, 0, 0);
  return cv;
}
