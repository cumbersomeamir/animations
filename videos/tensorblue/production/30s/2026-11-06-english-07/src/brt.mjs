// "Blue Receipt Theatre" kit — Tensorblue's default format from the 2026-11-02 feedback round.
// Premium kinetic typography + tactile minimal UI cards + a simple isometric checkout stage.
// Original code. No moving-line networks, particles, decorative rings, wandering connectors
// or grid motion: every moving thing is an object in the story (token, card, receipt, type, wipe).
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export const W = 1080, H = 1920, FPS = 30, NFRAMES = 900;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../../../../assets');
const F = path.join(ASSETS, 'fonts/inter');
GlobalFonts.registerFromPath(path.join(F, 'Inter-Medium.otf'), 'InterM');
GlobalFonts.registerFromPath(path.join(F, 'Inter-SemiBold.otf'), 'InterSB');
GlobalFonts.registerFromPath(path.join(F, 'Inter-Bold.otf'), 'InterB');
GlobalFonts.registerFromPath(path.join(F, 'InterDisplay-Bold.otf'), 'IDB');
GlobalFonts.registerFromPath(path.join(F, 'InterDisplay-ExtraBold.otf'), 'IDXB');
export const LOGO = await loadImage(fs.readFileSync(path.join(ASSETS, 'brand/tensorblue-logo.svg')));

// Tensorblue website palette (user-checked at tensorblue.com, confirmed in site CSS 2026-11-02)
export const C = {
  bg: '#030610', blue: '#3B82F6', white: '#FFFFFF', pale: '#D8E3F5', gray: '#B7C7DF',
  logo: '#0A6CFF',                 // logo drop colour (end card only)
  // shades mixed only from the palette above
  ink: '#030610', blueDeep: '#2757A6', navy: '#0A152C', slab: '#0C1834', slabSide: '#07101F',
  grayDark: '#788396', grayMid: '#97A6BE',
};
export const S = { alpha: 1 };

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (t) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
export const easeIn = (t) => { t = clamp(t); return t * t * t; };
export const back = (t) => { t = clamp(t); const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const ev = (t, t0, d) => clamp((t - t0) / d);

export function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function text(ctx, str, x, y, o = {}) {
  const { size = 40, font = 'InterSB', color = C.white, align = 'center', alpha = 1, track = 0 } = o;
  if (alpha <= 0 || !str) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.font = `${size}px ${font}`; ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
  if (track) ctx.letterSpacing = `${track}px`;
  ctx.textAlign = align; ctx.fillText(str, x, y); ctx.restore();
}
export function textW(ctx, str, size, font = 'InterSB', track = 0) { ctx.save(); ctx.font = `${size}px ${font}`; if (track) ctx.letterSpacing = `${track}px`; const w = ctx.measureText(str).width; ctx.restore(); return w; }
// soft contact shadow (static radial falloff, no blur filter)
export function shadow(ctx, cx, cy, rx, ry, a = 0.55) {
  ctx.save(); ctx.globalAlpha = S.alpha * a; ctx.translate(cx, cy); ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
// kinetic word: rises out of a mask line, optional exit; returns the measured width
export function kword(ctx, str, x, y, size, t, t0, o = {}) {
  const { font = 'IDXB', color = C.white, align = 'center', t1 = 1e9, dur = 0.38, track = -1 } = o;
  const kin = easeOut(ev(t, t0, dur)), kout = easeIn(ev(t, t1, 0.3));
  if (kin <= 0 || kout >= 1) return 0;
  const w = textW(ctx, str, size, font, track);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 20, y - size * 1.05, w + 40, size * 1.32); ctx.clip();
  const dy = (1 - kin) * size * 1.1 - kout * size * 1.1;
  text(ctx, str, x0, y + dy, { size, font, color, align: 'left', track });
  ctx.restore();
  return w;
}

// ---- story objects ---------------------------------------------------------------
export const KEY_A = { bars: [2, 4, 1, 3], id: '7F3A' };
export const KEY_B = { bars: [4, 1, 3, 2], id: 'B91C' };
// the blue purchase token; its white notch bars ARE the key (same bars = same key)
export function token(ctx, cx, cy, s, o = {}) {
  const { key = KEY_A, alpha = 1, showId = true, tag = null, rot = 0, shadowOn = true, dim = 0 } = o;
  if (alpha <= 0 || s <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  if (shadowOn) shadow(ctx, cx + s * 0.06, cy + s * 0.58, s * 0.55, s * 0.12, 0.6);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = S.alpha;
  const r = s * 0.22;
  // tactile body: darker base slab + face
  ctx.fillStyle = C.blueDeep; rr(ctx, -s / 2, -s / 2 + s * 0.06, s, s, r); ctx.fill();
  const g = ctx.createLinearGradient(0, -s / 2, 0, s / 2); g.addColorStop(0, '#5B97F8'); g.addColorStop(1, C.blue);
  ctx.fillStyle = g; rr(ctx, -s / 2, -s / 2, s, s, r); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1.5, s * 0.012); rr(ctx, -s / 2 + 2, -s / 2 + 2, s - 4, s - 4, r - 2); ctx.stroke();
  // key notches
  const bw = s * 0.1, gap = s * 0.06, total = 4 * bw + 3 * gap, base = s * 0.12;
  ctx.fillStyle = C.white;
  key.bars.forEach((b, i) => { const h = s * (0.1 + b * 0.075); rr(ctx, -total / 2 + i * (bw + gap), base - h, bw, h, bw * 0.3); ctx.fill(); });
  if (showId) text(ctx, key.id, 0, s * 0.36, { size: s * 0.17, font: 'InterB', color: C.white });
  if (dim > 0) { ctx.fillStyle = `rgba(3,6,16,${0.55 * dim})`; rr(ctx, -s / 2, -s / 2, s, s * 1.06, r); ctx.fill(); }
  ctx.restore();
  if (tag) pill(ctx, cx, cy - s / 2 - s * 0.2, tag, { size: Math.max(26, s * 0.16) });
  S.alpha = sa;
}
export function pill(ctx, cx, cy, str, o = {}) {
  const { size = 30, fill = C.pale, color = C.ink, font = 'InterB', alpha = 1 } = o;
  if (alpha <= 0) return;
  const w = textW(ctx, str, size, font) + size * 1.1, h = size * 1.6;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.fillStyle = fill; rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fill(); ctx.restore();
  text(ctx, str, cx, cy + size * 0.36, { size, font, color, alpha });
}
// white paper receipt with a torn (zigzag) bottom edge
export function receipt(ctx, x, y, w, h, o = {}) {
  const { order = '#1042', alpha = 1, keyRef = KEY_A, label = null, ghost = false, rot = 0 } = o;
  if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-(x + w / 2), -(y + h / 2));
  if (!ghost) shadow(ctx, x + w / 2 + 10, y + h + 10, w * 0.55, 22, 0.6);
  const paper = () => {
    ctx.beginPath(); ctx.moveTo(x + 14, y); ctx.lineTo(x + w - 14, y); ctx.quadraticCurveTo(x + w, y, x + w, y + 14); ctx.lineTo(x + w, y + h);
    const teeth = 10, tw = w / teeth;
    for (let i = teeth; i > 0; i--) { ctx.lineTo(x + (i - 0.5) * tw, y + h - 16); ctx.lineTo(x + (i - 1) * tw, y + h); }
    ctx.lineTo(x, y + 14); ctx.quadraticCurveTo(x, y, x + 14, y); ctx.closePath();
  };
  ctx.globalAlpha = S.alpha;
  if (ghost) { ctx.setLineDash([14, 10]); ctx.strokeStyle = C.gray; ctx.lineWidth = 4; paper(); ctx.stroke(); ctx.setLineDash([]); }
  else { ctx.fillStyle = C.white; paper(); ctx.fill(); }
  const ink = ghost ? C.gray : C.ink, s = w / 320;
  text(ctx, 'RECEIPT', x + 30 * s, y + 62 * s, { size: 30 * s, font: 'IDXB', color: ink, align: 'left', track: 3 });
  text(ctx, order, x + w - 30 * s, y + 62 * s, { size: 30 * s, font: 'IDXB', color: ghost ? C.gray : C.blue, align: 'right' });
  ctx.fillStyle = ghost ? 'rgba(183,199,223,0.5)' : 'rgba(3,6,16,0.12)'; ctx.fillRect(x + 30 * s, y + 88 * s, w - 60 * s, 3 * s);
  text(ctx, 'Blue mug', x + 30 * s, y + 140 * s, { size: 30 * s, font: 'InterSB', color: ink, align: 'left' });
  text(ctx, '$18.00', x + w - 30 * s, y + 140 * s, { size: 30 * s, font: 'InterSB', color: ink, align: 'right' });
  text(ctx, ghost ? 'Charge' : 'Paid', x + 30 * s, y + 196 * s, { size: 34 * s, font: 'IDXB', color: ink, align: 'left' });
  if (!ghost) { // paid tick in brand blue
    ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 7 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x + w - 84 * s, y + 184 * s); ctx.lineTo(x + w - 66 * s, y + 200 * s); ctx.lineTo(x + w - 34 * s, y + 166 * s); ctx.stroke(); ctx.restore();
  }
  // printed key reference: small bars + id (matches the token)
  if (keyRef && h > 280 * s) {
    const bx = x + 30 * s, by = y + 262 * s;
    ctx.fillStyle = ghost ? C.gray : C.blue;
    keyRef.bars.forEach((b, i) => { const bh = (8 + b * 7) * s; ctx.fillRect(bx + i * 16 * s, by - bh, 10 * s, bh); });
    text(ctx, 'key ' + keyRef.id, bx + 78 * s, by - 2 * s, { size: 26 * s, font: 'InterB', color: ghost ? C.gray : C.ink, align: 'left' });
  }
  if (label) text(ctx, label, x + w / 2, y + h - 40 * s, { size: 26 * s, font: 'InterB', color: ghost ? C.gray : C.blue });
  ctx.restore();
  S.alpha = sa;
}
// mug icon for the checkout line item
export function mug(ctx, x, y, s) {
  ctx.save(); ctx.globalAlpha = S.alpha;
  ctx.fillStyle = C.blue; rr(ctx, x, y, s * 0.72, s * 0.8, s * 0.12); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = s * 0.1; ctx.beginPath(); ctx.arc(x + s * 0.74, y + s * 0.38, s * 0.18, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; rr(ctx, x + s * 0.1, y + s * 0.1, s * 0.12, s * 0.5, s * 0.06); ctx.fill();
  ctx.restore();
}

// ---- isometric stage ---------------------------------------------------------------
export function isoP(o, x, y, z) { return [o.x + (x - y) * 0.866 * o.u, o.y + (x + y) * 0.5 * o.u - z * o.u]; }
function poly(ctx, pts, fill, stroke = null, lw = 2) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function isoBox(ctx, o, x0, y0, z0, dx, dy, dz, col) {
  const P = (x, y, z) => isoP(o, x, y, z);
  ctx.save(); ctx.globalAlpha = S.alpha;
  poly(ctx, [P(x0, y0 + dy, z0), P(x0 + dx, y0 + dy, z0), P(x0 + dx, y0 + dy, z0 + dz), P(x0, y0 + dy, z0 + dz)], col.left, col.edge, 1.5);   // +y face (lower-left)
  poly(ctx, [P(x0 + dx, y0, z0), P(x0 + dx, y0 + dy, z0), P(x0 + dx, y0 + dy, z0 + dz), P(x0 + dx, y0, z0 + dz)], col.right, col.edge, 1.5); // +x face (lower-right)
  poly(ctx, [P(x0, y0, z0 + dz), P(x0 + dx, y0, z0 + dz), P(x0 + dx, y0 + dy, z0 + dz), P(x0, y0 + dy, z0 + dz)], col.top, col.edge, 1.5);    // top
  ctx.restore();
}
// a face-aligned quad on the +y face of a box (for the slot / labels)
export function onLeftFace(o, x, z, y) { return isoP(o, x, y, z); }

export function makeBackground() {
  const cv = createCanvas(W, H); const g = cv.getContext('2d');
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const gl = g.createRadialGradient(540, 1050, 60, 540, 1050, 900);
  gl.addColorStop(0, 'rgba(59,130,246,0.16)'); gl.addColorStop(0.6, 'rgba(10,21,44,0.5)'); gl.addColorStop(1, 'rgba(3,6,16,0)');
  g.fillStyle = gl; g.fillRect(0, 0, W, H);
  return cv;
}
