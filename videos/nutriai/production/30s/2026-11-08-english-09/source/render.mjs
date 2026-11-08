// CalMeter English 30 s english-09 (2026-11-08): avocado vs cucumber, 100 g edible portion each.
// Same accepted style as the English raisin (english-08), egg (english-07) and peanut (english-06) episodes: Copperplate-engraving
// plate on IVORY #F4EEDC with deep ink #16201A, natural washes, same burin, balance, burnish transitions, camera, English captions
// (Inter Display Black 58 px, baselines 401/455) and the CalMeter CTA seal. Food geometry for this episode: a 100 g vs 100 g balance
// hook (a peeled avocado half vs a cucumber piece), two 100 g columns that turn from grams into kcal (water x0, fat about x9), and a
// calorie balance (100 g avocado vs about 1 kg = 3.5 cucumbers). Original Canvas2D code; art direction only from lemo-opuscar
// styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s, each held 2 frames.
// Usage: node render.mjs  |  node render.mjs --still 0,120,300
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const here = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(path.resolve(here, '../../../../source/package.json'));
const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const FONTS = path.resolve(here, '../../../../source/fonts');
GlobalFonts.registerFromPath(path.join(FONTS, 'InterDisplay-Black.otf'), 'NDisplay');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-SemiBold.otf'), 'NText');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Bold.otf'), 'NText');
const icon = await loadImage(path.resolve(here, '../../../../assets/icon.png'));
const TL = JSON.parse(fs.readFileSync(path.join(here, 'timeline.json')));
const E = TL.events;
const W = 1080, H = 1920, N = TL.frames;
const PAPER = '#F4EEDC', INK = '#16201A', INK2 = 'rgba(22,32,26,0.72)', LEAF = '#5AB626', LEAFDARK = '#2F7A1C', RED = '#D6452B';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mix = (c1, c2, t) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const a = p(c1), b = p(c2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join(''); };

// ---------------- logged text
const TEXT_LOG = []; let FRAME = 0;
function text(g, s, x, y, font, col, align = 'center', track = 0, tag = 'plate') {
  g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.letterSpacing = `${track}px`;
  g.fillText(s, x, y); const m = g.measureText(s); g.letterSpacing = '0px';
  if (g.globalAlpha < 0.05 || !s) return m.width;
  const x0 = align === 'center' ? x - m.width / 2 : align === 'right' ? x - m.width : x; const T = g.getTransform();
  const pts = [[x0, y - m.actualBoundingBoxAscent], [x0 + m.width, y - m.actualBoundingBoxAscent], [x0, y + m.actualBoundingBoxDescent], [x0 + m.width, y + m.actualBoundingBoxDescent]].map(([a, b]) => [T.a * a + T.c * b + T.e, T.b * a + T.d * b + T.f]);
  TEXT_LOG.push({ f: FRAME, s, tag, x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), y1: Math.max(...pts.map((p) => p[1])) });
  return m.width;
}
// ---------------- burin stroke (swell + taper)
function burin(g, pts, w, col, reveal = 1, jit = null, toneAt = null) {
  const n = pts.length, m = Math.floor((n - 1) * clamp(reveal)) + 1; if (m < 2) return;
  g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 1; i < m; i++) {
    const u = i / (n - 1); let sw = 0.2 + 0.8 * Math.pow(Math.sin(Math.PI * u), 0.7);
    if (u < 0.22) sw *= u / 0.22; else if (u > 0.78) sw *= (1 - u) / 0.22;
    const t = toneAt ? toneAt(i) : 0.6; g.lineWidth = Math.max(0.3, w * (0.25 + sw) * (0.45 + 0.9 * t));
    const a = pts[i - 1], b = pts[i]; const ax = a.x ?? a[0], ay = a.y ?? a[1], bx = b.x ?? b[0], by = b.y ?? b[1];
    const jx = jit ? (jit() - 0.5) * 0.6 : 0, jy = jit ? (jit() - 0.5) * 0.6 : 0;
    g.beginPath(); g.moveTo(ax + jx, ay + jy); g.lineTo(bx + jx, by + jy); g.stroke();
  }
}
const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 48, rot = 0) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * (k / n); const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }
function washPts(g, pts, col, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a; g.fillStyle = col; poly(g, pts); g.fill(); g.restore(); }
function drawBalance(g, cx, cy, sc, r, tiltDeg, jit, left, right) {
  g.save(); g.translate(cx, cy); g.scale(sc, sc);
  const q = (a, b) => seg(r, a, b);
  g.strokeStyle = INK; g.lineCap = 'round';
  if (q(0, 0.2) > 0) { g.lineWidth = 6; g.beginPath(); g.moveTo(-150 * q(0, 0.2), 150); g.lineTo(150 * q(0, 0.2), 150); g.stroke(); }
  if (q(0.05, 0.3) > 0) { g.lineWidth = 6; g.beginPath(); g.moveTo(0, 150); g.lineTo(0, 150 - 190 * q(0.05, 0.3)); g.stroke(); }
  for (let i = 0; i < 9; i++) burin(g, [[-4 + i * 1.1, 142], [-4 + i * 1.1, -30]], 0.7, INK2, q(0.1, 0.35), jit);
  const a = (tiltDeg * Math.PI) / 180, ex = 200 * Math.cos(a), ey = 200 * Math.sin(a);
  if (q(0.15, 0.4) > 0) { g.lineWidth = 6.5; g.beginPath(); g.moveTo(-ex, -40 + ey); g.lineTo(ex, -40 - ey); g.stroke(); g.strokeStyle = 'rgba(244,238,220,0.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-ex * 0.95, -41.5 + ey * 0.95); g.lineTo(ex * 0.95, -41.5 - ey * 0.95); g.stroke(); g.strokeStyle = INK; }
  g.fillStyle = INK; g.beginPath(); g.arc(0, -40, 7, 0, 7); g.fill();
  const pans = [[-ex, -40 + ey], [ex, -40 - ey]];
  for (const [px, py] of pans) { burin(g, [[px, py], [px - 74, py + 70]], 1.8, INK, q(0.25, 0.5), jit); burin(g, [[px, py], [px + 74, py + 70]], 1.8, INK, q(0.25, 0.5), jit); const pan = []; for (let k = 0; k <= 30; k++) { const t = k / 30; pan.push([px - 84 + 168 * t, py + 70 + 14 * Math.sin(Math.PI * t)]); } burin(g, pan, 3.6, INK, q(0.3, 0.55), jit); }
  if (left) left(pans[0][0], pans[0][1] + 70); if (right) right(pans[1][0], pans[1][1] + 70);
  g.restore();
  return pans.map(([px, py]) => [cx + px * sc, cy + (py + 70) * sc]);
}
// ---------------- foods: a peeled avocado half (flesh only, pit removed), a cucumber (with peel), cucumber slices
const AVO_C = '#EEEBA6', AVO_M = '#BCD45E', AVO_E = '#5E8C26', CUKE = '#3E6B2A', CUKE_F = '#DDEBB2', FAT = '#EDB93A', FIBRE = '#8DBE4E', WATER = '#7FB6E0', OTHER = '#D9C29A', GOLD = '#9A6410', BLUE = '#2C6E9E';
const avoLocal = () => Array.from({ length: 73 }, (_, i) => { const a = (i / 72) * Math.PI * 2, c = Math.cos(a); const w = Math.pow((1 + c) / 2, 1.3); return [c * 72, Math.sin(a) * (30 + 22 * w)]; });
function drawAvoHalf(g, x, y, s, rot, jit) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const out = avoLocal(), inn = out.map(([a, b]) => [a * 0.9 + 3, b * 0.86]);
  g.fillStyle = PAPER; poly(g, out); g.fill(); washPts(g, out, AVO_E, 0.95);
  g.save(); poly(g, inn); g.clip(); const gr = g.createRadialGradient(26, 0, 8, 12, 0, 84); gr.addColorStop(0, AVO_C); gr.addColorStop(0.55, '#DCE183'); gr.addColorStop(1, AVO_M); g.fillStyle = gr; g.fillRect(-90, -70, 180, 140);
  for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283; burin(g, [[26 + Math.cos(a) * 30, Math.sin(a) * 27], [26 + Math.cos(a) * 80, Math.sin(a) * 54]], 0.5, 'rgba(22,32,26,0.16)', 1, jit); }
  g.restore();
  const hp = ell(26, 0, 25, 23, 0, 6.283, 30); g.fillStyle = '#E6E09A'; poly(g, hp); g.fill();
  g.save(); poly(g, hp); g.clip(); for (let i = 0; i < 9; i++) burin(g, ell(30, 4, 25 - i * 1.6, 23 - i * 1.6, 3.5, 5.7, 10), 0.8, 'rgba(22,32,26,0.42)', 1, jit); g.restore();
  burin(g, hp, 1.4, INK, 1, jit); burin(g, out, 2.6, INK, 1, jit); burin(g, inn, 0.9, 'rgba(22,32,26,0.5)', 1, jit);
  g.fillStyle = 'rgba(255,255,240,0.6)'; g.beginPath(); g.ellipse(-30, -16, 16, 6, -0.4, 0, 7); g.fill();
  g.restore();
}
function drawCuke(g, x, y, len, r, rot, jit, cutR = false, seed = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); const L = len / 2, cr = r * 0.75, pts = [];
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 16; pts.push(cutR ? [L, -r + (2 * r * i) / 16] : [L - cr + Math.cos(a) * cr, Math.sin(a) * r]); }
  for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + (Math.PI * i) / 16; pts.push([-L + cr + Math.cos(a) * cr, Math.sin(a) * r]); }
  g.fillStyle = PAPER; poly(g, pts); g.fill();
  g.save(); poly(g, pts); g.clip(); const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#79A64C'); gr.addColorStop(0.45, CUKE); gr.addColorStop(1, '#25461A'); g.fillStyle = gr; g.fillRect(-L - 2, -r - 2, len + 4, 2 * r + 4);
  for (const yy of [-0.62, -0.22, 0.22, 0.6]) burin(g, Array.from({ length: 13 }, (_, k) => [-L + (len * k) / 12, yy * r + Math.sin(k * 1.3 + yy * 9) * r * 0.05]), 1.2, 'rgba(205,228,160,0.45)', 1, jit);
  const q = rng(seed); for (let i = 0; i < Math.floor(len / 9); i++) { g.fillStyle = 'rgba(230,240,200,0.6)'; g.beginPath(); g.arc(-L + q() * len, (q() - 0.5) * 1.6 * r, 1.4, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,235,0.32)'; g.fillRect(-L + cr, -r * 0.62, len - 2 * cr, r * 0.16);
  g.restore(); burin(g, pts, 2.2, INK, 1, jit);
  if (cutR) { const ce = ell(L, 0, r * 0.32, r, 0, 6.283, 24); g.fillStyle = CUKE; poly(g, ce); g.fill(); const ci = ell(L, 0, r * 0.27, r * 0.86, 0, 6.283, 24); g.fillStyle = CUKE_F; poly(g, ci); g.fill(); for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; g.fillStyle = '#F4F1D4'; g.beginPath(); g.ellipse(L + Math.cos(a) * r * 0.08, Math.sin(a) * r * 0.3, r * 0.07, r * 0.2, 0, 0, 7); g.fill(); } burin(g, ce, 1.6, INK, 1, jit); }
  g.restore();
}
function drawSlice(g, x, y, r, jit) {
  const o = ell(x, y, r, r, 0, 6.283, 32); g.fillStyle = CUKE; poly(g, o); g.fill(); const i = ell(x, y, r * 0.86, r * 0.86, 0, 6.283, 32); g.fillStyle = CUKE_F; poly(g, i); g.fill();
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; g.save(); g.translate(x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32); g.rotate(a); g.fillStyle = '#F4F1D4'; g.beginPath(); g.ellipse(0, 0, r * 0.24, r * 0.13, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(22,32,26,0.35)'; for (const d of [-0.12, 0, 0.12]) { g.beginPath(); g.ellipse(d * r, 0, r * 0.035, r * 0.06, 0, 0, 7); g.fill(); } g.restore(); }
  burin(g, o, 1.6, INK, 1, jit); burin(g, i, 0.7, 'rgba(22,32,26,0.4)', 1, jit);
}
// ---------------- 100 g columns: grams, then the same segments as kcal (water x0, fat x~9)
const BASE = 1400, CW = 140, GPX = 4.4, KPX = 2.5;
const COLS = {
  avo: { x: 300, seg: [['water', 73.2, 0, WATER], ['fibre', 6.7, 20.7, FIBRE], ['other', 5.4, 16.7, OTHER], ['fat', 14.7, 123, FAT]] },
  cuke: { x: 780, seg: [['water', 95.2, 0, WATER], ['other', 4.19, 12.6, OTHER], ['fibre', 0.5, 1.5, FIBRE], ['fat', 0.11, 0.9, FAT]] },
};
function drawColumn(g, f, c, t0, jit, kF, kW) {
  const b = seg(f, t0, t0 + 26); if (b <= 0) return null; const x0 = c.x - CW / 2; let y = BASE; const pos = {};
  c.seg.forEach(([name, gms, kc, col], i) => {
    const gi = eo(clamp(b * 4 - i * 0.8)); const k = name === 'water' ? kW : kF; const h = lerp(gms * GPX, kc * KPX, k) * gi; const y0 = y - h;
    if (h > 0.3) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(x0, y0, CW, h); g.restore();
      if (name === 'fibre' && h > 3) { g.save(); g.beginPath(); g.rect(x0, y0, CW, h); g.clip(); for (let j = -2; j < CW / 8 + 4; j++) burin(g, [[x0 + j * 8, y], [x0 + j * 8 + h, y0]], 0.8, 'rgba(22,32,26,0.4)', 1, jit); g.restore(); }
      burin(g, [[x0, y0], [x0 + CW, y0]], 1.2, INK, 1, jit); }
    pos[name] = [y0, y, h]; y = y0;
  });
  burin(g, [[x0, Math.min(y, BASE - 2)], [x0, BASE], [x0 + CW, BASE], [x0 + CW, Math.min(y, BASE - 2)]], 2.2, INK, 1, jit);
  pos.top = y; return pos;
}
function drops(g, cx, y0, t, n, seed, spread = 90) { if (t <= 0 || t >= 1) return; const q = rng(seed); for (let i = 0; i < n; i++) { const d = q(), dx = (q() - 0.5) * spread, tt = clamp((t - d * 0.4) / 0.6); if (tt <= 0 || tt >= 1) continue; const x = cx + dx * (1 + tt), y = y0 + tt * 160; const s = 7 + q() * 5; g.save(); g.globalAlpha = 1 - tt; g.fillStyle = WATER; g.beginPath(); g.moveTo(x, y - s * 1.4); g.quadraticCurveTo(x + s, y, x, y + s); g.quadraticCurveTo(x - s, y, x, y - s * 1.4); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.1; g.stroke(); g.restore(); } }
function sceneColumns(g, f, jit) {
  const fr = seg(f, E.section, E.section + 22);
  if (fr > 0) { g.save(); g.globalAlpha = fr; drawAvoHalf(g, 300, 772 - (1 - eo(fr)) * 30, 1.5, -0.08, jit); g.restore(); }
  const cr = seg(f, E.cukeCol - 16, E.cukeCol + 6);
  if (cr > 0) { g.save(); g.globalAlpha = cr; drawCuke(g, 770, 760 - (1 - eo(cr)) * 30, 150, 36, -0.06, jit, true, 7); drawSlice(g, 868, 826, 30, jit); g.restore(); }
  /* the empty 100 g cucumber jar waits beside the avocado until its turn */
  const ph = seg(f, E.avoCol + 10, E.avoCol + 22) * (1 - seg(f, E.cukeCol - 6, E.cukeCol + 2));
  if (ph > 0) { g.save(); g.globalAlpha = ph; g.setLineDash([10, 8]); g.strokeStyle = INK2; g.lineWidth = 2; g.strokeRect(710, BASE - 100 * GPX, CW, 100 * GPX); g.setLineDash([]); g.restore(); g.save(); g.globalAlpha = ph * (0.75 + 0.25 * Math.sin(f * 0.12)); text(g, '?', 780, 1212, '900 96px NDisplay', RED, 'center', 0, 'fig'); g.restore(); g.save(); g.globalAlpha = ph; text(g, '? kcal', 780, BASE - 100 * GPX - 18, '900 40px NDisplay', RED, 'center', 0, 'fig'); g.restore(); }
  const kF = eio(seg(f, E.morph, E.morphEnd)), kW = kF;
  const A = drawColumn(g, f, COLS.avo, E.avoCol, jit, kF, kW), C = drawColumn(g, f, COLS.cuke, E.cukeCol, jit, kF, kW);
  const gm = 1 - seg(Math.max(kF, kW), 0, 0.35), km = seg(kF, 0.6, 1);
  const lab = (s, x, y, font, col, a, align = 'center') => { if (a <= 0) return; g.save(); g.globalAlpha = a; text(g, s, x, y, font, col, align, 0, 'fig'); g.restore(); };
  if (A) {
    const p = A, t = (ev) => seg(f, ev, ev + 10);
    lab('water 73 g', 300, (p.water[0] + p.water[1]) / 2 + 8, '700 23px NText', INK, gm * seg(f, E.avoCol + 14, E.avoCol + 24));
    lab('fibre 6.7 g', 300, (p.fibre[0] + p.fibre[1]) / 2 + 7, '700 20px NText', INK, gm * t(E.avoFibre));
    lab('other 5 g', 300, (p.other[0] + p.other[1]) / 2 + 6, '700 17px NText', INK, gm * t(E.avoFibre));
    lab('fat 14.7 g', 300, (p.fat[0] + p.fat[1]) / 2 + 9, '900 26px NDisplay', INK, gm * t(E.avoFat));
    if (f >= E.avoFat && f < E.avoFat + 30) { const pu = Math.sin(Math.PI * seg(f, E.avoFat, E.avoFat + 30)); g.save(); g.strokeStyle = `rgba(154,100,16,${0.9 * pu})`; g.lineWidth = 4; g.strokeRect(230 - 6, p.fat[0] - 6, CW + 12, p.fat[2] + 12); g.restore(); }
    if (f >= E.avoFibre && f < E.avoFibre + 30) { const pu = Math.sin(Math.PI * seg(f, E.avoFibre, E.avoFibre + 30)); g.save(); g.strokeStyle = `rgba(47,122,28,${0.9 * pu})`; g.lineWidth = 4; g.strokeRect(230 - 6, p.fibre[0] - 6, CW + 12, p.fibre[2] + 12); g.restore(); }
    lab('fat ≈ 123 kcal', 300, (p.fat[0] + p.fat[1]) / 2 + 10, '900 26px NDisplay', INK, km);
    lab('rest ≈ 37', 300, (p.fibre[1] + p.other[0]) / 2 + 8, '700 22px NText', INK, km * (1 - seg(f, E.water0 + 6, E.water0 + 12) * 0) );
    lab('160 kcal', 300, p.top - 18, '900 40px NDisplay', GOLD, t(E.avoKcal));
  }
  if (C) {
    const p = C, t = (ev) => seg(f, ev, ev + 10);
    lab('water 95 g', 780, (p.water[0] + p.water[1]) / 2 + 8, '700 23px NText', INK, gm * seg(f, E.cukeCol + 14, E.cukeCol + 24));
    if (f >= E.cukeWater && f < E.cukeWater + 30) { const pu = Math.sin(Math.PI * seg(f, E.cukeWater, E.cukeWater + 30)); g.save(); g.strokeStyle = `rgba(44,110,158,${0.9 * pu})`; g.lineWidth = 4; g.strokeRect(710 - 6, p.water[0] - 6, CW + 12, p.water[2] + 12); g.restore(); }
    const la = gm * seg(f, E.cukeCol + 20, E.cukeCol + 30);
    if (la > 0) { const rows = [['fat 0.1 g', p.fat], ['fibre 0.5 g', p.fibre], ['other 4 g', p.other]]; rows.forEach(([s, q], i) => { const ly = 948 + i * 30, ty = (q[0] + q[1]) / 2; g.save(); g.globalAlpha = la; g.strokeStyle = INK2; g.lineWidth = 1.2; g.beginPath(); g.moveTo(694, ly - 7); g.lineTo(704, ly - 7); g.lineTo(710, ty); g.stroke(); g.restore(); lab(s, 688, ly, '700 20px NText', INK, la, 'right'); }); }
    lab('15 kcal', 780, p.top - 18, '900 40px NDisplay', BLUE, t(E.cukeKcal));
  }
  // labels under the columns, and the unit switch
  const ul = seg(f, E.avoCol, E.avoCol + 12); lab('100 g avocado', 300, 1440, '900 26px NDisplay', LEAFDARK, ul); lab('100 g cucumber', 780, 1440, '900 26px NDisplay', LEAFDARK, seg(f, E.avoCol + 10, E.avoCol + 22));
  lab('in grams', 540, 1440, '700 21px NText', INK2, ul * gm); lab('in kcal', 540, 1440, '700 21px NText', INK2, km);
  // the rule: 1 g fat ~ 9 kcal, 1 g water 0 kcal
  const r1 = seg(f, E.fat9, E.fat9 + 12), r2 = seg(f, E.water0 - 10, E.water0 + 2);
  if (r1 > 0) { g.save(); g.globalAlpha = r1; g.globalCompositeOperation = 'multiply'; g.fillStyle = FAT; g.fillRect(452, 1146, 22, 22); g.restore(); g.save(); g.globalAlpha = r1; g.strokeStyle = INK; g.lineWidth = 1.4; g.strokeRect(452, 1146, 22, 22); g.restore(); lab('1 g fat ≈ 9 kcal', 486, 1166, '900 26px NDisplay', GOLD, r1, 'left'); }
  if (r2 > 0) { g.save(); g.globalAlpha = r2; g.fillStyle = WATER; g.beginPath(); g.moveTo(463, 1196); g.quadraticCurveTo(475, 1212, 463, 1220); g.quadraticCurveTo(451, 1212, 463, 1196); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); g.restore(); lab('1 g water = 0', 486, 1218, '900 26px NDisplay', BLUE, r2, 'left'); }
  // water leaves the columns as they turn into kcal
  if (A) drops(g, 300, A.water[1] - 10, kW, 10, 41, 120); if (C) drops(g, 780, C.water[1] - 10, kW, 14, 43, 120);
}
// ---------------- the calorie balance: 100 g avocado vs about 1 kg (3.5) cucumbers
const PILE = [[0, -20, 0.03, 170, false], [6, -57, -0.05, 170, false], [-4, -94, 0.06, 170, false], [22, -128, -0.04, 92, true]];
function sceneBalance2(g, f, jit, out) {
  const ar = eo(seg(f, E.avo2In - 4, E.avo2In + 10)), np = seg(f, E.cukePile, E.cukePile + 34) * PILE.length;
  const tilt = 8 * eo(seg(f, E.avo2In + 4, E.avo2In + 16)) * (1 - eo(clamp(np / PILE.length))) + (f > E.cukePile + 34 ? 1.6 * Math.exp(-(f - E.cukePile - 34) / 20) * Math.sin((f - E.cukePile - 34) * 0.45) : 0);
  const pans = drawBalance(g, 540, 990, 1.25, seg(f, E.bal2 - 12, E.bal2 + 10), tilt, jit,
    (px, py) => { if (ar > 0) drawAvoHalf(g, px, py - 50 - (1 - ar) * 160, 1.0, -0.06, jit); },
    (px, py) => PILE.forEach(([dx, dy, rot, len, cut], i) => { const q = eo(clamp(np - i)); if (q > 0) drawCuke(g, px + dx, py + dy - (1 - q) * 170, len, 19, rot, jit, cut, 20 + i); }));
  g.save(); g.globalAlpha = 1 - out;
  const t1 = seg(f, E.tags2, E.tags2 + 10), t2 = seg(f, E.kg, E.kg + 10);
  if (t1 > 0) { g.save(); g.globalAlpha = (1 - out) * t1; text(g, '100 g avocado', pans[0][0], 1270, '900 34px NDisplay', LEAFDARK, 'center', 0, 'fig'); text(g, '≈ 160 kcal', pans[0][0], 1308, '900 28px NDisplay', GOLD, 'center', 0, 'fig'); g.restore(); }
  if (t2 > 0) { g.save(); g.globalAlpha = (1 - out) * t2; text(g, '≈ 1 kg cucumber', pans[1][0], 1270, '900 34px NDisplay', CUKE, 'center', 0, 'fig'); text(g, '≈ 160 kcal · 3½ cucumbers', pans[1][0], 1308, '700 22px NText', INK, 'center', 0, 'fig'); g.restore(); }
  const eq = seg(f, E.kg + 6, E.kg + 16); if (eq > 0) { g.save(); g.globalAlpha = (1 - out) * eq; text(g, '=', 540, 1290, '900 60px NDisplay', INK, 'center', 0, 'fig'); g.restore(); }
  g.restore();
  // final-seconds glint along the cucumber pile
  if (f >= 820) { const t = seg(f, 820, 890); const gx = lerp(pans[1][0] - 150, pans[1][0] + 150, t); g.save(); g.globalAlpha = Math.sin(Math.PI * t) * 0.8; g.strokeStyle = '#F4FBE0'; g.lineWidth = 6; g.lineCap = 'round'; for (const [dx, dy] of [[0, -20], [6, -57], [-4, -94]]) { g.beginPath(); g.moveTo(gx + dx - 18, pans[1][1] + (dy - 9) * 1.25); g.lineTo(gx + dx + 18, pans[1][1] + (dy - 11) * 1.25); g.stroke(); } g.restore(); }
  return pans;
}
// ---------------- paper, camera, captions, CTA (unchanged from the accepted English episodes)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
function camera(f) { const keys = [[0, 1.18, 540, 870], [56, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [780, 1.0, 540, 1010], [900, 1.03, 540, 1010]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const u = seg(f, f0, f1); /* the closing push-in on the CTA eases in and keeps moving to the last frame */ const t = k === keys.length - 2 ? (u < 0.3 ? (u * u) / 0.6 : u - 0.15) / 0.85 : eio(u); return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
function captions(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out); const lines = [];
    for (const r of c.lines) { if (r.length > 2) lines[r[2]].push(r); else lines.push([r]); }
    lines.forEach((runs, li) => { const font = '900 58px NDisplay'; g.font = font; const total = runs.reduce((a, r) => a + g.measureText(r[0]).width, 0); let x = 540 - total / 2; const y = li === 0 ? 401 : 455;
      for (const [s, f0] of runs) { const a = seg(f, f0, f0 + 6) * (1 - out); g.save(); g.globalAlpha = a; x += text(g, s, x, y, font, li === 0 ? INK : LEAFDARK, 'left', 0, 'caption'); g.restore(); } });
  }
}
function drawCTA(g, f, jit) {
  const r = seg(f, E.cta, E.cta + 14); if (r <= 0) return;
  g.font = '900 76px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 58, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1352;
  g.save(); g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.restore();
  g.save(); g.globalAlpha = r; g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.lineWidth = 1.1; g.beginPath(); g.arc(cx, cy, R0 + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke();
  const wr = seg(f, E.ctaWord, E.ctaWord + 24), s = 'CalMeter';
  if (wr > 0) text(g, s.slice(0, Math.ceil(s.length * wr)), cx + R0 + gap, cy + 27, '900 76px NDisplay', INK, 'left', 0, 'cta');
  const rl = seg(f, E.ctaWord + 16, E.ctaWord + 40); if (rl > 0) burin(g, [[cx + R0 + gap, cy + 52], [cx + R0 + gap + ww * rl, cy + 52]], 2.2, LEAFDARK, 1, jit);
  const sh = seg(f, 832, 892); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 27, '900 76px NDisplay', LEAF, 'left', 0, 'cta'); g.strokeStyle = LEAF; g.lineWidth = 3.2; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.stroke(); g.restore(); }
  const tk = seg(f, E.ctaWord + 26, E.ctaWord + 106); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
const sweep = (f, t0) => { const b = seg(f, t0, t0 + 20); return { b, x: lerp(100, 1000, b) }; };
function sweepBand(g, s) { if (s.b > 0 && s.b < 1) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(s.x, 640); g.lineTo(s.x, 1490); g.stroke(); g.restore(); } }
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0);
  g.fillStyle = 'rgba(22,32,26,0.04)'; g.fillRect(62, 528, 956, 984);
  g.strokeStyle = 'rgba(90,182,38,0.55)'; g.lineWidth = 5; g.strokeRect(62, 528, 956, 984);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(74, 540, 932, 960); g.strokeStyle = INK2; g.lineWidth = 0.8; g.strokeRect(84, 550, 912, 940);
  const tt = seg(f, E.title, E.title + 22);
  if (tt > 0) { const t1 = 'PLATE XI', t2 = 'AVOCADO & CUCUMBER'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- A: hook balance, 100 g avocado flesh vs 100 g cucumber (level), "? kcal" -> 160 vs 15
  const sB = sweep(f, E.burnish);
  if (sB.b < 1) {
    g.save(); if (sB.b > 0) { g.beginPath(); g.rect(sB.x, 0, W, H); g.clip(); }
    const aIn = eo(seg(f, E.avoIn - 4, E.avoIn + 12)), cIn = eo(seg(f, E.cukeIn - 4, E.cukeIn + 12));
    const tilt = f >= E.cukeLand ? 3 * Math.exp(-(f - E.cukeLand) / 24) * Math.sin((f - E.cukeLand) * 0.4) : 5 * aIn;
    const pans = drawBalance(g, 540, 990, 1.25, seg(f, E.balance - 12, E.balance + 8), tilt, jit,
      (px, py) => { if (aIn > 0) drawAvoHalf(g, px, py - 50 - (1 - aIn) * 170, 1.0, -0.06, jit); },
      (px, py) => { if (cIn > 0) drawCuke(g, px, py - 26 - (1 - cIn) * 170, 104, 25, -0.04, jit, true, 5); });
    const tg = seg(f, E.tags, E.tags + 10); if (tg > 0) { g.save(); g.globalAlpha = tg; text(g, '100 g', pans[0][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'avocado · flesh only', pans[0][0], 1308, '700 24px NText', LEAFDARK, 'center', 1, 'fig'); text(g, '100 g', pans[1][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'cucumber · with peel', pans[1][0], 1308, '700 24px NText', CUKE, 'center', 1, 'fig'); g.restore(); }
    const qk = seg(f, E.qTags, E.qTags + 14), kr = seg(f, E.kcalReveal, E.kcalReveal + 10);
    if (qk > 0) { const [lp, rp] = pans; g.save(); g.globalAlpha = qk; text(g, kr > 0 ? '≈ 160 kcal' : '? kcal', lp[0], lp[1] - 178, '900 40px NDisplay', kr > 0 ? GOLD : RED, 'center', 0, 'fig'); text(g, kr > 0 ? '≈ 15 kcal' : '? kcal', rp[0], rp[1] - 178, '900 40px NDisplay', kr > 0 ? BLUE : RED, 'center', 0, 'fig'); g.restore(); if (kr > 0 && kr < 1) { g.save(); g.strokeStyle = `rgba(154,100,16,${0.7 * (1 - kr)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(lp[0], lp[1] - 190, 110 + 60 * kr, 40 + 20 * kr, 0, 0, 7); g.stroke(); g.restore(); } }
    const xb = seg(f, E.x10, E.x10 + 10); if (xb > 0) { g.save(); g.globalAlpha = xb; g.translate(540, 800); g.scale(0.6 + 0.4 * eo(xb), 0.6 + 0.4 * eo(xb)); g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(0, 0, 50, 0, 7); g.fill(); g.strokeStyle = RED; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 50, 0, 7); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 57, 0, 7); g.stroke(); text(g, '≈ 10×', 0, 11, '900 32px NDisplay', RED, 'center', 0, 'fig'); g.restore(); }
    if (f >= E.level && f < E.burnish) { const lv = seg(f, E.level, E.level + 12); g.save(); g.globalAlpha = lv; g.setLineDash([6, 8]); g.strokeStyle = LEAFDARK; g.lineWidth = 2; g.beginPath(); g.moveTo(170, 940); g.lineTo(880, 940); g.stroke(); g.setLineDash([]); text(g, 'level', 888, 947, '700 20px NText', LEAFDARK, 'left', 0, 'fig'); g.restore(); }
    g.restore();
  }
  // --- B/C: 100 g columns in grams, then in kcal
  const sD = sweep(f, E.burnish2);
  if (f >= E.section && sD.b < 1) { g.save(); g.beginPath(); const bx0 = sD.b > 0 ? sD.x : 0, bx1 = sB.b < 1 ? sB.x : W; g.rect(bx0, 0, Math.max(0, bx1 - bx0), H); g.clip(); sceneColumns(g, f, jit); g.restore(); }
  sweepBand(g, sB);
  // --- D: the calorie balance; stays through the CTA
  if (f >= E.burnish2) { g.save(); g.beginPath(); g.rect(0, 0, sD.b < 1 ? sD.x : W, H); g.clip(); sceneBalance2(g, f, jit, seg(f, E.blocksOut, E.blocksOut + 10)); g.restore(); }
  sweepBand(g, sD);
  const lg = seg(f, 160, 190);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'USDA FoodData Central: avocado FDC 171705 · cucumber FDC 168409'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
  drawCTA(g, f, jit);
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f30);
}
const args = process.argv.slice(2), si = args.indexOf('--still');
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (si >= 0) { for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); } fs.writeFileSync(path.join(here, 'build', 'textlog-stills.json'), JSON.stringify(TEXT_LOG)); }
else {
  const out = path.join(here, 'build', 'video-noaudio.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { if (f % 2 === 0) draw(f); if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(path.join(here, 'build', 'textlog.json'), JSON.stringify(TEXT_LOG)); console.log('done', out);
}
