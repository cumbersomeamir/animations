// CalMeter English 30 s english-08 (2026-11-07): raisins vs grapes, the same 30 g.
// Same accepted style as the English egg (english-07) and peanut (english-06) episodes: Copperplate-engraving plate on IVORY
// #F4EEDC with deep ink #16201A, large engraved cutaway, natural washes, same burin, balance, bars, burnish transitions,
// camera, English captions (Inter Display Black 58 px, baselines 401/455) and the CalMeter CTA seal. Food geometry for this
// episode: a 30 g vs 30 g balance hook (six grapes vs a small raisin heap), a grape cutaway that dries into a raisin while
// water droplets leave and a water gauge falls, stacked water/sugar/other bars per 30 g, and a 130 g grape bunch that dries
// into the same 30 g of raisins with the same sugar. Original Canvas2D code; art direction only from lemo-opuscar
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
const GRAPE = '#9BC24E', GRAPE_D = '#5F8E2C', GRAPE_L = '#D3E79A', RAISIN = '#6E3A28', RAISIN_D = '#47241A', WATER = '#7FB6E0', SUGAR = '#F0BE3E', OTHER = '#D9C29A';
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
// ---------------- small fruit: an engraved grape, a wrinkled raisin
function drawGrape(g, x, y, r, jit) {
  const p = ell(x, y, r, r * 1.12, 0, Math.PI * 2, 30); g.fillStyle = PAPER; poly(g, p); g.fill();
  g.save(); poly(g, p); g.clip(); const gr = g.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r * 1.2); gr.addColorStop(0, GRAPE_L); gr.addColorStop(0.6, GRAPE); gr.addColorStop(1, GRAPE_D); g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(x - r * 2, y - r * 2, r * 4, r * 4); g.restore();
  burin(g, p, 1.6, INK, 1, jit); for (let k = 1; k < 4; k++) burin(g, ell(x + r * 0.15, y + r * 0.1, r * (1 - k * 0.22), r * 1.12 * (1 - k * 0.22), -0.3, 1.5, 10), 0.7, 'rgba(22,32,26,0.35)', 1, jit);
  g.fillStyle = 'rgba(255,255,245,0.8)'; g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.12, -0.6, 0, 7); g.fill();
}
function raisinPts(x, y, r, seed, wr = 1) { const q = rng(seed); const ph = [q() * 6, q() * 6, q() * 6]; return Array.from({ length: 33 }, (_, k) => { const a = (k / 32) * Math.PI * 2; const rr = r * (1 + wr * (0.12 * Math.sin(a * 5 + ph[0]) + 0.07 * Math.sin(a * 9 + ph[1]) + 0.05 * Math.sin(a * 13 + ph[2]))); return [x + Math.cos(a) * rr * 1.15, y + Math.sin(a) * rr * 0.85]; }); }
function drawRaisin(g, x, y, r, seed, jit) {
  const p = raisinPts(x, y, r, seed); g.fillStyle = PAPER; poly(g, p); g.fill(); washPts(g, p, RAISIN, 0.95); burin(g, p, 1.3, INK, 1, jit);
  const q = rng(seed + 7); for (let k = 0; k < 3; k++) { const a = q() * 3; burin(g, [[x - r * 0.6 * Math.cos(a), y - r * 0.4 * Math.sin(a)], [x + r * 0.1, y + (q() - 0.5) * r * 0.5], [x + r * 0.6 * Math.cos(a + 0.4), y + r * 0.4 * Math.sin(a + 0.4)]], 0.8, 'rgba(22,32,26,0.6)', 1, jit); }
  g.fillStyle = 'rgba(255,230,210,0.35)'; g.beginPath(); g.ellipse(x - r * 0.4, y - r * 0.3, r * 0.3, r * 0.12, -0.5, 0, 7); g.fill();
}
const GRAPE6 = [[-36, -20], [0, -22], [36, -20], [-18, -54], [18, -54], [0, -86]];
const heap = (rows, sp, dy) => { const p = []; rows.forEach((n, r) => { for (let i = 0; i < n; i++) p.push([(i - (n - 1) / 2) * sp + (r % 2 ? sp * 0.3 : -sp * 0.2), -6 - r * dy]); }); return p; };
const RHEAP = heap([11, 10, 10, 9, 8, 6, 4, 2], 13, 8); /* 60 raisins: SR28 "1 oz (60 raisins)" */
const RHEAP_D = heap([11, 10, 10, 9, 8, 6, 4, 2], 17, 10.5);
const BUNCH = (() => { const p = [], rows = [7, 6, 5, 4, 3, 2]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) p.push([(i - (n - 1) / 2) * 44 + (r % 2 ? 10 : -6), r * 38]); }); return p.slice(0, 27); })();
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
// ---------------- hero: a grape cutaway that dries into a raisin (water droplets leave; wrinkles grow; green -> brown)
const HX = 540, HY0 = 930; let HY = HY0;
const DROPS = (() => { const q = rng(31); return Array.from({ length: 40 }, () => ({ a: -Math.PI / 2 + (q() - 0.5) * 2.6, d0: 60 + q() * 120, t0: q() * 0.6, s: 8 + q() * 7 })); })();
const SUG = (() => { const q = rng(12); return Array.from({ length: 44 }, () => { const a = q() * 6.283, d = Math.sqrt(q()) * 0.78; return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: q() * 6 }; }); })();
function heroPts(k) { const rx = lerp(230, 172, k), ry = lerp(268, 128, k); return Array.from({ length: 97 }, (_, i) => { const a = (i / 96) * Math.PI * 2; const w = k * (0.05 * Math.sin(a * 4 + 1) + 0.035 * Math.sin(a * 7 + 2.3) + 0.02 * Math.sin(a * 12 + 0.7)); return [HX + Math.cos(a) * rx * (1 + w), HY + Math.sin(a) * ry * (1 + w)]; }); }
function drawHero(g, f, r, jit, wa) {
  const k = eio(seg(f, E.dry, E.dryEnd)); const rx = lerp(230, 172, k), ry = lerp(268, 128, k);
  const out = heroPts(k), inn = out.map(([x, y]) => [HX + (x - HX) * 0.95, HY + (y - HY) * 0.95]);
  g.save(); g.fillStyle = PAPER; poly(g, out); g.fill(); g.restore();
  washPts(g, out, mix(GRAPE_D, RAISIN_D, k), 0.95 * eo(wa)); g.save(); g.fillStyle = PAPER; poly(g, inn); g.fill(); g.restore();
  g.save(); poly(g, inn); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = eo(wa); const gr = g.createRadialGradient(HX - 60, HY - 70, 10, HX, HY, 260); gr.addColorStop(0, mix(GRAPE_L, '#A86A48', k)); gr.addColorStop(1, mix(GRAPE, RAISIN_D, k)); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  g.save(); poly(g, inn); g.clip(); const cr = seg(r, 0.3, 0.9), q = rng(8);
  /* water cells: round, blue-tinged; they shrink and empty as it dries */
  for (let i = 0; i < 70; i++) { const a = q() * 6.28, d = Math.sqrt(q()) * 0.85, x = HX + Math.cos(a) * d * rx * 0.95, y = HY + Math.sin(a) * d * ry * 0.95, s = lerp(14, 4, k) * (0.7 + q() * 0.5); if (i / 70 > cr || k > 0.97) continue;
    g.fillStyle = `rgba(127,182,224,${0.5 * (1 - k)})`; g.beginPath(); g.ellipse(x, y, s, s * 0.8, a, 0, 7); g.fill(); g.strokeStyle = `rgba(22,32,26,${0.35 * (1 - k)})`; g.lineWidth = 0.8; g.beginPath(); g.ellipse(x, y, s, s * 0.8, a, 0, 7); g.stroke(); }
  /* sugar granules: same count and size from grape to raisin (drying adds none); they just crowd together */
  const sg = seg(f, E.water80 + 6, E.water80 + 22) * cr;
  SUG.forEach((p, i) => { if (i / SUG.length >= sg) return; const x = HX + p.x * rx, y = HY + p.y * ry; g.save(); g.translate(x, y); g.rotate(p.r); g.fillStyle = SUGAR; g.fillRect(-6, -6, 12, 12); g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(-6, -6, 12, 12); g.fillStyle = 'rgba(255,255,240,0.7)'; g.fillRect(-4, -4, 4, 3); g.restore(); });
  /* creases grow as it dries */
  if (k > 0.25) { const ck = seg(k, 0.25, 1); for (let i = 0; i < 6; i++) { const yo = -0.62 + i * 0.25 + 0.05 * Math.sin(i * 2.1), span = Math.sqrt(Math.max(0, 1 - yo * yo)) * 0.82, p = []; for (let j = 0; j <= 20; j++) { const t = j / 20, xo = lerp(-span, span, t); p.push([HX + xo * rx, HY + yo * ry + Math.sin(t * 7 + i * 1.7) * 7 * ck + Math.sin(t * 13 + i) * 3 * ck]); } burin(g, p, 2.6, `rgba(38,16,10,${0.8 * ck})`, ck, jit); burin(g, p.map(([x, y]) => [x - 2, y - 4]), 1.2, `rgba(255,228,205,${0.42 * ck})`, ck, jit); } }
  g.restore();
  burin(g, out, 3.4, INK, seg(r, 0, 0.3), jit); burin(g, inn, 1.2, INK, seg(r, 0.1, 0.35), jit);
  for (let i = 0; i < 14; i++) { const a = -0.6 + i * 0.1; const [x1, y1] = out[Math.round((((a + 6.283) % 6.283) / 6.283) * 96)]; burin(g, [[x1, y1], [lerp(x1, HX, 0.12), lerp(y1, HY, 0.12)]], 0.9, INK2, seg(r, 0.2, 0.5), jit); }
  g.fillStyle = `rgba(255,255,245,${0.7 - 0.35 * k})`; g.beginPath(); g.ellipse(HX - lerp(90, 60, k), HY - lerp(120, 58, k), lerp(46, 30, k), lerp(20, 12, k), -0.6, 0, 7); g.fill();
  /* droplets leaving while it dries */
  const dt = seg(f, E.dry, E.dryEnd + 10); if (dt > 0 && dt < 1) DROPS.forEach((d) => { const t = clamp((dt - d.t0) / 0.4); if (t <= 0 || t >= 1) return; const x = HX + Math.cos(d.a) * (d.d0 + 260 * t), y = HY + Math.sin(d.a) * (d.d0 + 260 * t) - 60 * t; g.save(); g.globalAlpha = 1 - t; g.fillStyle = WATER; g.beginPath(); g.moveTo(x, y - d.s * 1.4); g.quadraticCurveTo(x + d.s, y, x, y + d.s); g.quadraticCurveTo(x - d.s, y, x, y - d.s * 1.4); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); g.restore(); });
  return k;
}
function drawGauge(g, f, jit, out) {   // water gauge beside the hero: 80 % -> 15 %
  const r = seg(f, E.water80 - 6, E.water80 + 8); if (r <= 0 || out >= 1) return; g.save(); g.globalAlpha = 1 - out;
  const x0 = 850, y0 = 760, w = 56, h = 340, lvl = lerp(0.80, 0.15, eio(seg(f, E.dry, E.dryEnd)));
  g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, w, h); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = WATER; g.fillRect(x0, y0 + h * (1 - lvl), w, h * lvl); g.restore();
  for (let i = 1; i < 10; i++) burin(g, [[x0, y0 + h * i / 10], [x0 + (i % 5 ? 10 : 20), y0 + h * i / 10]], 1.0, INK, 1, jit);
  burin(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [x0, y0]], 2.2, INK, r * 1.3, jit);
  text(g, `${Math.round(lvl * 100)} %`, x0 + w / 2, y0 + h + 34, '900 30px NDisplay', '#2C6E9E', 'center', 0, 'fig'); text(g, 'water', x0 + w / 2, y0 + h + 58, '700 18px NText', INK2, 'center', 1, 'fig');
  g.restore();
}
// ---------------- per-30 g stacked bars: water / sugar / other (20 px per gram)
function drawBars(g, f, jit, out) {
  const r = seg(f, E.bars, E.bars + 12); if (r <= 0 || out >= 1) return; g.save(); g.globalAlpha = (1 - out) * r; const x0 = 150, px = 20, bh = 56;
  const row = (y, label, lcol, parts, t0, kcalT, kcal, kcol) => {
    text(g, label, x0, y - 14, '900 28px NDisplay', lcol, 'left', 0, 'fig'); const gr = eo(seg(f, t0, t0 + 24)); let x = x0;
    parts.forEach(([gms, col, name]) => { const w = gms * px * gr; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(x, y, w, bh); g.restore(); if (w > 1) burin(g, [[x, y], [x + w, y], [x + w, y + bh], [x, y + bh], [x, y]], 1.8, INK, 1, jit); g.font = '700 22px NText'; if (gr >= 1 && name && g.measureText(name).width < w - 10) text(g, name, x + w / 2, y + 36, '700 22px NText', INK, 'center', 0, 'fig'); x += w; });
    const kq = seg(f, kcalT, kcalT + 10); if (kq > 0) { g.save(); g.globalAlpha = (1 - out) * kq; text(g, kcal, x0 + 30 * px + 18, y + 40, '900 36px NDisplay', kcol, 'left', 0, 'fig'); g.restore(); }
  };
  row(1190, '30 g grapes', LEAFDARK, [[24.15, WATER, 'water 24 g'], [4.65, SUGAR, 'sugar 5'], [1.2, OTHER, '']], E.grapeBar, E.grapeKcal, '21 kcal', LEAFDARK);
  row(1330, '30 g raisins', RAISIN, [[4.65, WATER, ''], [19.56, SUGAR, 'sugar 20 g'], [5.79, OTHER, 'other 6']], E.raisinBar, E.raisinKcal, '90 kcal', RED);
  const t4 = seg(f, E.times4, E.times4 + 14); if (t4 > 0) { const ax = x0 + (24.15 + 4.65 / 2) * px, ay = 1250, bx = x0 + (4.65 + 19.56 / 2) * px, by = 1324; const fa = 1 - seg(f, E.times4 + 6, E.times4 + 14); g.save(); g.globalAlpha = (1 - out) * t4 * fa; g.strokeStyle = RED; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(lerp(ax, bx, 0.5) + 30, lerp(ay, by, 0.5) - 6, lerp(ax, bx, eo(t4)), lerp(ay, by, eo(t4))); g.stroke(); if (t4 >= 1) { const an = Math.atan2(by - ay, bx - ax - 0); g.fillStyle = RED; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - 18 * Math.cos(an - 0.45), by - 18 * Math.sin(an - 0.45)); g.lineTo(bx - 18 * Math.cos(an + 0.45), by - 18 * Math.sin(an + 0.45)); g.closePath(); g.fill(); } g.globalAlpha = (1 - out) * t4; text(g, '4× sugar', 700, 1302, '900 30px NDisplay', RED, 'left', 0, 'fig'); g.restore(); }
  for (let j = 0; j < 4; j++) { const t = eio(seg(f, E.times4 + 6 + j * 5, E.times4 + 20 + j * 5)); if (t <= 0) continue; const w = 4.65 * px, sx = x0 + 24.15 * px, sy = 1190, tx = x0 + 4.65 * px + j * w, ty = 1330; const x = lerp(sx, tx, t), y = lerp(sy, ty, t) - Math.sin(Math.PI * t) * 40; g.save(); g.globalAlpha = (1 - out) * (t < 1 ? 0.9 : 1); g.globalCompositeOperation = 'multiply'; g.fillStyle = t < 1 ? SUGAR : 'rgba(240,190,62,0)'; g.fillRect(x, y, w, bh); g.restore(); g.save(); g.globalAlpha = 1 - out; g.strokeStyle = RED; g.lineWidth = 3; g.setLineDash(t < 1 ? [] : [8, 6]); g.strokeRect(x + 1.5, y + 1.5, w - 3, bh - 3); g.setLineDash([]); if (t >= 1) text(g, String(j + 1), x + w / 2, y + bh + 28, '900 24px NDisplay', RED, 'center', 0, 'fig'); g.restore(); }
  g.restore();
}
// ---------------- 130 g of grapes dry into the same 30 g of raisins (same sugar, less water)
function drawBunchScene(g, f, jit, outBlocks) {
  const br = seg(f, E.bunch, E.bunch + 24);
  if (br > 0) { burin(g, [[296, 742], [298, 700], [304, 680], [322, 660]], 5, INK, br, jit); burin(g, [[299, 704], [276, 690], [262, 692]], 2.6, INK, br, jit); }
  BUNCH.forEach(([x, y], i) => { const q = clamp(br * BUNCH.length * 1.2 - i); if (q > 0) drawGrape(g, 290 + x, 742 + y - (1 - eo(q)) * 40, 21, jit); });
  if (f >= 826) BUNCH.forEach(([x, y], i) => { const t = (f - 826 - (x + 140) * 0.12 - y * 0.1) / 14; if (t <= 0 || t >= 1) return; g.save(); g.globalAlpha = Math.sin(Math.PI * t) * 0.9; g.fillStyle = '#FFFFF4'; g.beginPath(); g.ellipse(290 + x - 7, 742 + y - 8, 9, 5, -0.6, 0, 7); g.fill(); g.restore(); });
  if (f >= 826) RHEAP_D.forEach(([x, y], i) => { const t = (f - 846 - (x + 90) * 0.1 - y * 0.2) / 12; if (t <= 0 || t >= 1) return; g.save(); g.globalAlpha = Math.sin(Math.PI * t) * 0.7; g.fillStyle = '#FFE9D6'; g.beginPath(); g.ellipse(806 + x - 3, 940 + y - 3, 4, 2, -0.5, 0, 7); g.fill(); g.restore(); });
  const lb = seg(f, E.g130, E.g130 + 14); if (lb > 0) { text(g, '≈ 130 g grapes'.slice(0, Math.ceil(14 * lb)), 290, 1010, '900 34px NDisplay', LEAFDARK, 'center', 0, 'fig'); if (lb >= 1) text(g, '≈ 27 grapes · ≈ 90 kcal', 290, 1046, '700 22px NText', INK, 'center', 0, 'fig'); }
  const ar = seg(f, E.arrow, E.arrow + 18);
  if (ar > 0) { burin(g, [[468, 860], [lerp(468, 652, ar), 860]], 5, INK, 1, jit); if (ar >= 1) burin(g, [[628, 844], [654, 860], [628, 876]], 4, INK, 1, jit);
    for (let i = 0; i < 6; i++) { const t = ((f * 0.02 + i / 6) % 1); const x = 498 + i * 24, y = 838 - t * 120; g.save(); g.globalAlpha = (1 - t) * ar; g.fillStyle = WATER; g.beginPath(); g.moveTo(x, y - 12); g.quadraticCurveTo(x + 8, y, x, y + 8); g.quadraticCurveTo(x - 8, y, x, y - 12); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.1; g.stroke(); g.restore(); }
    g.save(); g.globalAlpha = ar; text(g, '− ≈ 100 g water', 560, 914, '700 24px NText', '#2C6E9E', 'center', 0, 'fig'); g.restore(); }
  const rh = seg(f, E.raisinHeap, E.raisinHeap + 16);
  RHEAP_D.forEach(([x, y], i) => { const q = clamp(rh * RHEAP_D.length * 1.1 - i); if (q > 0) drawRaisin(g, 806 + x, 940 + y - (1 - eo(q)) * 40, 9, 500 + i, jit); });
  if (rh >= 1) { text(g, '30 g raisins', 806, 1010, '900 34px NDisplay', RED, 'center', 0, 'fig'); text(g, '≈ 60 raisins · ≈ 90 kcal', 806, 1046, '700 22px NText', INK, 'center', 0, 'fig'); }
  /* the same sugar in both */
  const sb = seg(f, E.sugarBlocks, E.sugarBlocks + 16); if (sb > 0 && outBlocks < 1) { g.save(); g.globalAlpha = 1 - outBlocks;
    for (const [cx, gms] of [[290, 20.2], [806, 19.6]]) { const h = gms * 5 * eo(sb), y1 = 1224; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = SUGAR; g.fillRect(cx - 70, y1 - h, 140, h); g.restore(); burin(g, [[cx - 70, y1], [cx - 70, y1 - h], [cx + 70, y1 - h], [cx + 70, y1]], 2.2, INK, 1, jit); for (let i = 0; i < Math.floor(h / 11); i++) burin(g, [[cx - 66, y1 - 6 - i * 11], [cx + 66, y1 - 2 - i * 11]], 0.7, 'rgba(22,32,26,0.4)', 1, jit); if (sb >= 1) text(g, 'sugar ≈ 20 g', cx, y1 + 36, '900 28px NDisplay', INK, 'center', 0, 'fig'); }
    const eq = seg(f, E.sugarBlocks + 12, E.sugarBlocks + 22); if (eq > 0) { g.save(); g.globalAlpha = (1 - outBlocks) * eq; text(g, '=', 548, 1196, '900 72px NDisplay', INK, 'center', 0, 'fig'); g.restore(); }
    const po = seg(f, E.payoff, E.payoff + 22); if (po > 0) text(g, 'same sugar, far less water'.slice(0, Math.ceil(26 * po)), 540, 1338, '900 40px NDisplay', LEAFDARK, 'center', 0, 'fig');
    g.restore(); }
}
// ---------------- paper, camera, captions, CTA (unchanged from the accepted English episodes)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
function camera(f) { const keys = [[0, 1.18, 540, 870], [56, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [770, 1.0, 540, 1010], [900, 1.03, 540, 1010]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const u = seg(f, f0, f1); /* the closing push-in on the CTA eases in and keeps moving to the last frame */ const t = k === keys.length - 2 ? (u < 0.3 ? (u * u) / 0.6 : u - 0.15) / 0.85 : eio(u); return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
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
  if (tt > 0) { const t1 = 'PLATE X', t2 = 'GRAPES & RAISINS'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- A: hook balance, 30 g grapes vs 30 g raisins (level), "? kcal" -> 21 vs 90
  const sB = sweep(f, E.burnish);
  if (sB.b < 1) {
    g.save(); if (sB.b > 0) { g.beginPath(); g.rect(sB.x, 0, W, H); g.clip(); }
    const gIn = seg(f, E.grapesIn - 4, E.grapesIn + 12), rIn = seg(f, E.raisinsIn - 4, E.raisinsIn + 14);
    const tilt = f >= E.raisinsIn + 14 ? 3 * Math.exp(-(f - E.raisinsIn - 14) / 24) * Math.sin((f - E.raisinsIn - 14) * 0.4) : 0;
    const pans = drawBalance(g, 540, 990, 1.25, seg(f, E.balance - 12, E.balance + 8), tilt, jit,
      (px, py) => GRAPE6.forEach(([x, y], i) => { const q = clamp(gIn * 6 - i); if (q > 0) drawGrape(g, px + x, py + y - (1 - eo(q)) * 160, 22, jit); }),
      (px, py) => RHEAP.forEach(([x, y], i) => { const q = clamp(rIn * RHEAP.length - i); if (q > 0) drawRaisin(g, px + x, py + y - (1 - eo(q)) * 160, 7, 300 + i, jit); }));
    const tg = seg(f, E.tags, E.tags + 10); if (tg > 0) { g.save(); g.globalAlpha = tg; text(g, '30 g', pans[0][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'grapes · 6', pans[0][0], 1308, '700 24px NText', LEAFDARK, 'center', 1, 'fig'); text(g, '30 g', pans[1][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'raisins · ≈ 60', pans[1][0], 1308, '700 24px NText', RAISIN, 'center', 1, 'fig'); g.restore(); }
    const qk = seg(f, E.qTags, E.qTags + 14), kr = seg(f, E.kcalReveal, E.kcalReveal + 10);
    if (qk > 0) { const [lp, rp] = pans; g.save(); g.globalAlpha = qk; text(g, kr > 0 ? '≈ 21 kcal' : '? kcal', lp[0], lp[1] - 178, '900 40px NDisplay', kr > 0 ? LEAFDARK : RED, 'center', 0, 'fig'); text(g, kr > 0 ? '≈ 90 kcal' : '? kcal', rp[0], rp[1] - 178, '900 40px NDisplay', RED, 'center', 0, 'fig'); g.restore(); if (kr > 0 && kr < 1) { g.save(); g.strokeStyle = `rgba(214,69,43,${0.7 * (1 - kr)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(rp[0], rp[1] - 190, 110 + 60 * kr, 40 + 20 * kr, 0, 0, 7); g.stroke(); g.restore(); } }
    if (f >= E.level && f < E.burnish) { const lv = seg(f, E.level, E.level + 12); g.save(); g.globalAlpha = lv; g.setLineDash([6, 8]); g.strokeStyle = LEAFDARK; g.lineWidth = 2; g.beginPath(); g.moveTo(170, 940); g.lineTo(880, 940); g.stroke(); g.setLineDash([]); text(g, 'level', 888, 947, '700 20px NText', LEAFDARK, 'left', 0, 'fig'); g.restore(); }
    g.restore();
  }
  // --- B: grape cutaway dries into a raisin; water gauge; C: per-30 g bars (hero stays as the raisin)
  const sD = sweep(f, E.barsOut);
  HY = HY0 - 80 * eio(seg(f, E.bars - 8, E.bars + 14));
  if (f >= E.section && sD.b < 1) { g.save(); g.beginPath(); const bx0 = sD.b > 0 ? sD.x : 0, bx1 = sB.b < 1 ? sB.x : W; g.rect(bx0, 0, Math.max(0, bx1 - bx0), H); g.clip(); drawHero(g, f, seg(f, E.section, E.section + 28), jit, seg(f, E.washSection, E.washSection + 20)); const wl = seg(f, E.water80, E.water80 + 12) * (1 - seg(f, E.dry, E.dry + 10)); if (wl > 0) { g.save(); g.globalAlpha = wl; text(g, '≈ 80 % water', HX, HY + 320, '900 34px NDisplay', '#2C6E9E', 'center', 0, 'fig'); g.restore(); } const rl = seg(f, E.dryEnd, E.dryEnd + 12); if (rl > 0) { g.save(); g.globalAlpha = rl; text(g, 'raisin: ≈ 15 % water', HX, HY + 196, '900 30px NDisplay', RAISIN, 'center', 0, 'fig'); g.restore(); } g.restore(); }
  drawGauge(g, f, jit, seg(f, E.bars - 4, E.bars + 8));
  sweepBand(g, sB);
  drawBars(g, f, jit, seg(f, E.barsOut, E.barsOut + 12));
  // --- D: 130 g grapes -> 30 g raisins (same sugar); stays through the CTA
  if (f >= E.bunch - 4) { g.save(); g.beginPath(); g.rect(0, 0, sD.b < 1 ? sD.x : W, H); g.clip(); drawBunchScene(g, f, jit, seg(f, E.blocksOut, E.blocksOut + 10)); g.restore(); }
  sweepBand(g, sD);
  const lg = seg(f, 160, 190);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'USDA FoodData Central: grapes FDC 174683 · raisins FDC 168165'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
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
