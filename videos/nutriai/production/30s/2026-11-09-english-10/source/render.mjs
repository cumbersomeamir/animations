// CalMeter English 30 s english-10 (2026-11-09): cooked (boiled, no salt) vs dry-roasted (no oil) chickpeas.
// Same accepted style as the English avocado (english-09), raisin (english-08), egg and peanut episodes: Copperplate-engraving plate on
// IVORY #F4EEDC with deep ink #16201A, natural washes, same burin, balance, burnish transitions, camera, English captions (Inter Display
// Black 58 px, baselines 401/455) and the CalMeter CTA seal. Food geometry for this episode: one chickpea glyph from cooked to roasted
// (after the Hindi #04 chickpea), a 100 g vs 100 g balance hook, a tray of cooked chickpeas roasting on a kitchen scale (100 g -> about
// 42 g, same kcal and protein), per-100 g bars built from copies of the cooked bar, and a snack portion (30 g roasted = about 70 g
// cooked). Original Canvas2D code; art direction only from lemo-opuscar styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s.
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
// ---------------- chickpeas: one glyph from cooked (plump, pale gold, glossy) to dry-roasted (smaller, toasted, cracked)
const COOK = '#EBC37A', ROAST = '#B06E2A', GOLD = '#9A6410', BROWN = '#8A4E1C', WATER = '#7FB6E0', BLUE = '#2C6E9E', TILE = '#E9B64E';
function pea(g, x, y, s, rot, k, jit, seed = 1) {
  const ss = s * lerp(1, 0.86, k); g.save(); g.translate(x, y); g.rotate(rot);
  const body = () => { g.beginPath(); g.arc(0, 0, ss, -2.2, 4.0); g.quadraticCurveTo(-ss * 1.3, -ss * 1.2, -ss * 0.6, -ss * 0.8); g.closePath(); };
  g.fillStyle = mix(COOK, ROAST, k); body(); g.fill();
  const gr = g.createRadialGradient(-ss * 0.35, -ss * 0.4, ss * 0.1, 0, 0, ss * 1.15); gr.addColorStop(0, 'rgba(255,250,230,0.35)'); gr.addColorStop(1, `rgba(80,40,6,${0.32 + 0.25 * k})`); g.fillStyle = gr; body(); g.fill();
  g.strokeStyle = INK; g.lineWidth = Math.max(0.9, ss * 0.09); body(); g.stroke();
  g.lineWidth = Math.max(0.7, ss * 0.06); g.beginPath(); g.moveTo(-ss * 0.55, -ss * 0.45); g.quadraticCurveTo(-ss * 0.05, ss * 0.15, ss * 0.55, ss * 0.55); g.stroke();
  if (k > 0.3) { const a = (k - 0.3) / 0.7, q = rng(seed); g.strokeStyle = `rgba(60,28,6,${0.75 * a})`; g.lineWidth = Math.max(0.6, ss * 0.05); g.beginPath(); let px = ss * (q() - 0.2), py = -ss * 0.6; g.moveTo(px, py); for (let i = 0; i < 4; i++) { px += ss * (q() - 0.5) * 0.5; py += ss * 0.3; g.lineTo(px, py); } g.stroke(); g.fillStyle = `rgba(70,32,8,${0.55 * a})`; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc((q() - 0.5) * ss * 1.2, (q() - 0.5) * ss * 1.2, ss * 0.06, 0, 7); g.fill(); } }
  g.fillStyle = `rgba(255,252,236,${0.75 * (1 - k) + 0.2 * k})`; g.beginPath(); g.ellipse(-ss * 0.32, -ss * 0.38, ss * 0.26, ss * 0.14, -0.6, 0, 7); g.fill();
  g.restore();
}
const heap = (rows, sp, dy) => { const p = []; rows.forEach((n, r) => { for (let i = 0; i < n; i++) p.push([(i - (n - 1) / 2) * sp + (r % 2 ? sp * 0.3 : -sp * 0.15), -dy * 0.6 - r * dy, ((i * 7 + r * 3) % 9) * 0.7]); }); return p; };
const HEAP_C = heap([5, 4, 3, 1], 24, 18), HEAP_R = heap([8, 7, 6, 5, 3, 1], 19, 14.5); /* 100 g each: roasted pieces are lighter, so ~2.3x as many */
const DISH_R = heap([6, 5, 3, 1], 30, 22), DISH_C = heap([6, 5, 3, 1], 37, 27); /* the snack: the same 15 chickpeas, roasted vs cooked */
// ---------------- B: a tray of cooked chickpeas roasts on a kitchen scale: 100 g -> about 42 g; same kcal, same protein
const TRAY = (() => { const p = []; for (let r = 0; r < 2; r++) for (let i = 0; i < (r ? 10 : 11); i++) p.push([300 + i * 44 + (r ? 22 : 0), 878 - r * 30, (i * 5 + r) % 7]); return p; })();
function drawScaleScene(g, f, jit) {
  const rv = seg(f, E.section, E.section + 22); if (rv <= 0) return; const k = eio(seg(f, E.roast, E.roastEnd));
  g.save(); g.globalAlpha = eo(rv);
  /* heating element above the tray */
  const he = seg(f, E.roast - 14, E.roast);
  if (he > 0) { g.save(); g.globalAlpha = eo(rv) * he; g.fillStyle = '#E8C9A8'; g.fillRect(280, 742, 520, 16); burin(g, [[280, 742], [800, 742], [800, 758], [280, 758], [280, 742]], 2, INK, 1, jit); const gl = 0.5 + 0.5 * Math.sin(f * 0.3); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(232,110,40,${0.35 + 0.15 * gl})`; g.fillRect(282, 744, 516, 12); g.restore();
    if (k < 1) for (let i = 0; i < 9; i++) { const x = 310 + i * 58, ph = f * 0.25 + i; burin(g, Array.from({ length: 8 }, (_, j) => [x + Math.sin(ph + j * 0.9) * 6, 772 + j * 9]), 1.1, `rgba(214,69,43,${0.55 * he * (1 - k)})`, 1, jit); } }
  /* tray with chickpeas */
  burin(g, [[262, 888], [280, 912], [800, 912], [818, 888]], 3, INK, 1, jit); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#C9CDD2'; g.beginPath(); g.moveTo(262, 888); g.lineTo(280, 912); g.lineTo(800, 912); g.lineTo(818, 888); g.closePath(); g.fill(); g.restore();
  TRAY.forEach(([x, y, r], i) => pea(g, x, y + k * 3, 19, r * 0.8, k, jit, 70 + i));
  /* steam and droplets leave while it roasts */
  if (k > 0 && k < 1) { for (let i = 0; i < 7; i++) { const x0 = 320 + i * 72, t = (f * 0.015 + i * 0.37) % 1; g.save(); g.globalAlpha = (1 - t) * Math.sin(Math.PI * k) * 0.8; burin(g, Array.from({ length: 10 }, (_, j) => [x0 + Math.sin(j * 0.8 + i + f * 0.05) * 10, 860 - t * 90 - j * 9]), 1.6, 'rgba(120,150,170,0.9)', 1, jit); g.restore(); }
    const q = rng(9); for (let i = 0; i < 12; i++) { const d = q(), x = 300 + q() * 480, tt = clamp((k - d * 0.6) / 0.35); if (tt <= 0 || tt >= 1) continue; const y = 850 - tt * 150, s = 7 + q() * 4; g.save(); g.globalAlpha = 1 - tt; g.fillStyle = WATER; g.beginPath(); g.moveTo(x, y - s * 1.4); g.quadraticCurveTo(x + s, y, x, y + s); g.quadraticCurveTo(x - s, y, x, y - s * 1.4); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.1; g.stroke(); g.restore(); } }
  /* the scale */
  burin(g, [[290, 918], [790, 918]], 4, INK, 1, jit); burin(g, [[520, 922], [520, 944]], 3, INK, 1, jit); burin(g, [[560, 922], [560, 944]], 3, INK, 1, jit);
  const body = [[330, 946], [750, 946], [782, 1104], [298, 1104], [330, 946]]; g.fillStyle = '#EFE6CF'; poly(g, body); g.fill(); burin(g, body, 2.6, INK, 1, jit);
  for (let i = 0; i < 12; i++) burin(g, [[336 + i * 4, 954 + i * 12], [300 + i * 4 + 6, 1096]], 0.6, 'rgba(22,32,26,0.25)', 1, jit);
  g.fillStyle = '#E3EDCF'; g.fillRect(400, 982, 280, 84); burin(g, [[400, 982], [680, 982], [680, 1066], [400, 1066], [400, 982]], 2, INK, 1, jit);
  const grams = Math.round(lerp(100, 42, k)); text(g, (k > 0 ? '≈ ' : '') + grams + ' g', 540, 1043, '900 52px NDisplay', INK, 'center', 0, 'fig');
  g.restore();
  /* water gauge: 60 % -> under 10 % */
  const gv = seg(f, E.water60 - 6, E.water60 + 8); if (gv > 0) { const x0 = 864, y0 = 770, w = 52, h = 300, lvl = lerp(0.602, 0.08, k); g.save(); g.globalAlpha = gv; g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, w, h); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = WATER; g.fillRect(x0, y0 + h * (1 - lvl), w, h * lvl); g.restore(); for (let i = 1; i < 10; i++) burin(g, [[x0, y0 + (h * i) / 10], [x0 + (i % 5 ? 10 : 20), y0 + (h * i) / 10]], 1, INK, 1, jit); burin(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [x0, y0]], 2.2, INK, 1, jit); text(g, k < 0.6 ? '60 %' : '< 10 %', x0 + w / 2, y0 + h + 34, '900 28px NDisplay', BLUE, 'center', 0, 'fig'); text(g, 'water', x0 + w / 2, y0 + h + 58, '700 18px NText', INK2, 'center', 1, 'fig'); g.restore(); }
  /* the halving and the two things that do not change */
  const hv = seg(f, E.half, E.half + 12); if (hv > 0) { g.save(); g.globalAlpha = hv; text(g, '100 g cooked → ≈ 42 g roasted', 540, 1150, '900 30px NDisplay', LEAFDARK, 'center', 0, 'fig'); g.restore(); }
  const box = (cx, big, small, col, t0, st) => { const a = seg(f, E.section + 30, E.section + 44); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = '#FBF6E8'; g.fillRect(cx - 150, 1190, 300, 104); burin(g, [[cx - 150, 1190], [cx + 150, 1190], [cx + 150, 1294], [cx - 150, 1294], [cx - 150, 1190]], 2, INK, 1, jit); text(g, big, cx, 1252, '900 44px NDisplay', col, 'center', 0, 'fig'); text(g, small, cx, 1282, '700 20px NText', INK2, 'center', 1, 'fig'); g.restore();
    const sa = seg(f, st, st + 8); if (sa > 0) { g.save(); g.translate(cx + 112, 1196); g.rotate(-0.18); g.scale(1.4 - 0.4 * eo(sa), 1.4 - 0.4 * eo(sa)); g.globalAlpha = sa; g.fillStyle = '#FBF6E8'; g.fillRect(-52, -22, 104, 40); g.strokeStyle = LEAFDARK; g.lineWidth = 3; g.strokeRect(-52, -22, 104, 40); text(g, 'same', 0, 8, '900 26px NDisplay', LEAFDARK, 'center', 0, 'fig'); g.restore(); } };
  box(330, '164 kcal', 'energy, before and after', GOLD, 0, E.same1); box(750, '8.9 g', 'protein, before and after', LEAFDARK, 0, E.same2);
}
// ---------------- C: per 100 g bars; the roasted bar is about 2.3 copies of the cooked bar (the same food, minus water)
const RATIO = 2.31; /* dry matter 39.8 g per 100 g cooked; roasted to about 8 % water: 92 / 39.8 */
function drawBarsScene(g, f, jit) {
  const rv = seg(f, E.bars, E.bars + 12); if (rv <= 0) return; g.save(); g.globalAlpha = rv; const x0 = 150, bh = 58;
  const group = (yh, title, unitPx, cooked, labC, labR, tR, colR) => {
    text(g, title, x0, yh, '900 34px NDisplay', INK, 'left', 0, 'fig');
    text(g, 'cooked · boiled, no salt', x0, yh + 42, '700 23px NText', GOLD, 'left', 0, 'fig');
    const wC = cooked * unitPx * eo(seg(f, E.bars + 4, E.bars + 22)); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = COOK; g.fillRect(x0, yh + 50, wC, bh); g.restore(); burin(g, [[x0, yh + 50], [x0 + wC, yh + 50], [x0 + wC, yh + 50 + bh], [x0, yh + 50 + bh], [x0, yh + 50]], 1.8, INK, 1, jit);
    if (wC > 10) text(g, labC, x0 + wC + 14, yh + 92, '900 34px NDisplay', GOLD, 'left', 0, 'fig');
    const ta = seg(f, tR - 30, tR - 20); if (ta <= 0) return; text(g, 'roasted · dry, no oil', x0, yh + 142, '700 23px NText', BROWN, 'left', 0, 'fig');
    const W1 = cooked * unitPx, n = seg(f, tR - 20, tR + 4) * RATIO; let x = x0;
    for (let j = 0; j < Math.ceil(n); j++) { const w = W1 * Math.min(1, n - j); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = colR; g.fillRect(x, yh + 152, w, bh); g.restore(); g.save(); g.strokeStyle = INK; g.lineWidth = 1.6; if (j > 0) g.setLineDash([6, 5]); g.beginPath(); g.moveTo(x, yh + 152); g.lineTo(x, yh + 152 + bh); g.stroke(); g.setLineDash([]); g.restore(); x += w; }
    burin(g, [[x0, yh + 152], [x, yh + 152], [x, yh + 152 + bh], [x0, yh + 152 + bh], [x0, yh + 152]], 1.8, INK, 1, jit);
    const la = seg(f, tR, tR + 8); if (la > 0) { g.save(); g.globalAlpha = rv * la; text(g, labR, x + 14, yh + 194, '900 34px NDisplay', BROWN, 'left', 0, 'fig'); text(g, '≈ 2.3 × cooked', x0 + W1 * RATIO / 2, yh + 238, '700 21px NText', INK2, 'center', 0, 'fig'); g.restore(); }
  };
  group(720, 'kcal per 100 g', 1.6, 164, '164', '≈ 380', E.roastKcal, TILE);
  if (f >= E.protRow) { g.save(); g.globalAlpha = seg(f, E.protRow, E.protRow + 10); group(1030, 'protein per 100 g', 28, 8.86, '8.9 g', '≈ 20 g', E.roastProt, '#C99A45'); g.restore(); }
  const nt = seg(f, E.roastProt + 8, E.roastProt + 20); if (nt > 0) { g.save(); g.globalAlpha = rv * nt; text(g, '100 g roasted = the chickpeas of ≈ 230 g cooked', 540, 1384, '900 28px NDisplay', LEAFDARK, 'center', 0, 'fig'); g.restore(); }
  g.restore();
}
// ---------------- D: a snack portion: 30 g roasted = about 70 g cooked = the same chickpeas; about 115 kcal each
function drawDish(g, cx, cy, rx, jit) { const rim = ell(cx, cy, rx, rx * 0.22, 0, 6.283, 48); g.fillStyle = '#FBF6E8'; poly(g, rim); g.fill(); const bowl = [...ell(cx, cy, rx, rx * 0.22, 0, Math.PI, 24), ...ell(cx, cy + rx * 0.12, rx * 0.62, rx * 0.2, Math.PI, 0, 24).reverse()]; burin(g, ell(cx, cy, rx, rx * 0.22, 0, Math.PI, 30), 2.4, INK, 1, jit); burin(g, ell(cx, cy + 4, rx * 0.88, rx * 0.17, Math.PI, 2 * Math.PI, 30), 1, INK2, 1, jit); void bowl; burin(g, [[cx - rx, cy], [cx - rx * 0.6, cy + rx * 0.36], [cx + rx * 0.6, cy + rx * 0.36], [cx + rx, cy]], 2.4, INK, 1, jit); for (let i = 0; i < 10; i++) burin(g, [[cx - rx * 0.85 + i * rx * 0.17, cy + rx * 0.12], [cx - rx * 0.7 + i * rx * 0.15, cy + rx * 0.33]], 0.6, 'rgba(22,32,26,0.3)', 1, jit); }
function drawSnackScene(g, f, jit) {
  const a = seg(f, E.burnish3, E.burnish3 + 14); if (a <= 0) return;
  drawDish(g, 300, 930, 130, jit); drawDish(g, 780, 930, 160, jit);
  const rIn = seg(f, E.snackIn - 8, E.snackIn + 12), cIn = seg(f, E.cookedIn2 - 8, E.cookedIn2 + 12);
  DISH_R.forEach(([x, y, r], i) => { const q = eo(clamp(rIn * DISH_R.length - i)); if (q > 0) pea(g, 300 + x, 922 + y - (1 - q) * 120, 16, r, 1, jit, 200 + i); });
  DISH_C.forEach(([x, y, r], i) => { const q = eo(clamp(cIn * DISH_C.length - i)); if (q > 0) pea(g, 780 + x, 922 + y - (1 - q) * 120, 19, r, 0, jit, 300 + i); });
  const t1 = seg(f, E.snackIn, E.snackIn + 10), t2 = seg(f, E.cookedIn2, E.cookedIn2 + 10), t3 = seg(f, E.kcal115, E.kcal115 + 10);
  if (t1 > 0) { g.save(); g.globalAlpha = t1; text(g, '30 g roasted', 300, 1056, '900 36px NDisplay', BROWN, 'center', 0, 'fig'); text(g, 'dry, no oil', 300, 1088, '700 21px NText', INK2, 'center', 1, 'fig'); g.restore(); }
  if (t2 > 0) { g.save(); g.globalAlpha = t2; text(g, '≈ 70 g cooked', 780, 1056, '900 36px NDisplay', GOLD, 'center', 0, 'fig'); text(g, 'boiled, no salt', 780, 1088, '700 21px NText', INK2, 'center', 1, 'fig'); text(g, '=', 540, 950, '900 72px NDisplay', INK, 'center', 0, 'fig'); g.restore(); }
  if (t3 > 0) { g.save(); g.globalAlpha = t3; text(g, 'both ≈ 115 kcal · ≈ 6 g protein', 540, 1160, '900 32px NDisplay', INK, 'center', 0, 'fig'); text(g, 'the same chickpeas, minus water', 540, 1196, '700 22px NText', LEAFDARK, 'center', 0, 'fig'); g.restore(); }
  /* the same pieces: each roasted chickpea is paired with a cooked one, one pair at a time */
  const pr = seg(f, E.kcal115 + 8, E.kcal115 + 68) * DISH_R.length;
  if (pr > 0) { g.save(); g.strokeStyle = LEAFDARK; g.lineWidth = 2.2; for (let i = 0; i < Math.min(DISH_R.length, Math.ceil(pr)); i++) { const a = clamp(pr - i); const [xr, yr] = DISH_R[i], [xc, yc] = DISH_C[i]; g.globalAlpha = a; g.beginPath(); g.arc(300 + xr, 922 + yr, 16 * 0.86 + 4, 0, 7 * a); g.stroke(); g.beginPath(); g.arc(780 + xc, 922 + yc, 19 + 4, 0, 7 * a); g.stroke(); } g.restore(); }
  /* final seconds: a glint runs over both dishes */
  if (f >= 820) { const t = seg(f, 820, 892); [[300, DISH_R, 16 * 0.86], [780, DISH_C, 19]].forEach(([cx, H0, s], d) => H0.forEach(([x, y], i) => { const u = (t * 1.4 - (x + 120) / 300 * 0.6 - d * 0.2); if (u <= 0 || u >= 0.4) return; g.save(); g.globalAlpha = Math.sin(Math.PI * u / 0.4) * 0.85; g.fillStyle = '#FFFBEA'; g.beginPath(); g.ellipse(cx + x - s * 0.3, 922 + y - s * 0.38, s * 0.32, s * 0.16, -0.6, 0, 7); g.fill(); g.restore(); })); }
}
// ---------------- paper, camera, captions, CTA (unchanged from the accepted English episodes)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
function camera(f) { const keys = [[0, 1.18, 540, 870], [56, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [780, 1.02, 540, 1006], [900, 1.045, 540, 1004]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const u = seg(f, f0, f1); /* the closing push-in on the CTA eases in and keeps moving to the last frame */ const t = k === keys.length - 2 ? u : k === keys.length - 3 ? (u < 0.3 ? (u * u) / 0.6 : u - 0.15) / 0.85 : eio(u); /* from 23.3 s a slow push toward the snack dishes runs on into the CTA */ return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
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
function clipScene(f, rev, rem) { const a = rev != null ? sweep(f, rev) : null, b = rem != null ? sweep(f, rem) : null; if (a && a.b <= 0) return false; if (b && b.b >= 1) return false; const x1 = a && a.b < 1 ? a.x : W, x0 = b && b.b > 0 ? b.x : 0; g.save(); g.beginPath(); g.rect(x0, 0, Math.max(0, x1 - x0), H); g.clip(); return true; }
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0);
  g.fillStyle = 'rgba(22,32,26,0.04)'; g.fillRect(62, 528, 956, 984);
  g.strokeStyle = 'rgba(90,182,38,0.55)'; g.lineWidth = 5; g.strokeRect(62, 528, 956, 984);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(74, 540, 932, 960); g.strokeStyle = INK2; g.lineWidth = 0.8; g.strokeRect(84, 550, 912, 940);
  const tt = seg(f, E.title, E.title + 22);
  if (tt > 0) { const t1 = 'PLATE XII', t2 = 'CHICKPEAS: COOKED & ROASTED'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 4); }
  // --- A: hook balance, 100 g cooked vs 100 g dry-roasted (level), "? kcal" -> 164 vs about 380
  if (clipScene(f, null, E.burnish)) {
    const cI = seg(f, E.cookedIn - 4, E.cookedIn + 12), rI = seg(f, E.roastIn - 4, E.roastIn + 14);
    const tilt = f >= E.roastLand ? 3 * Math.exp(-(f - E.roastLand) / 24) * Math.sin((f - E.roastLand) * 0.4) : 5 * eo(cI) * (1 - eo(rI));
    const pans = drawBalance(g, 540, 990, 1.25, seg(f, E.balance - 12, E.balance + 8), tilt, jit,
      (px, py) => HEAP_C.forEach(([x, y, r], i) => { const q = eo(clamp(cI * HEAP_C.length - i)); if (q > 0) pea(g, px + x, py + y - (1 - q) * 170, 12, r, 0, jit, 10 + i); }),
      (px, py) => HEAP_R.forEach(([x, y, r], i) => { const q = eo(clamp(rI * HEAP_R.length - i)); if (q > 0) pea(g, px + x, py + y - (1 - q) * 170, 11.4, r, 1, jit, 40 + i); }));
    const tg = seg(f, E.tags, E.tags + 10); if (tg > 0) { g.save(); g.globalAlpha = tg; text(g, '100 g', pans[0][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'cooked · boiled, no salt', pans[0][0], 1308, '700 22px NText', GOLD, 'center', 1, 'fig'); text(g, '100 g', pans[1][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'roasted · dry, no oil', pans[1][0], 1308, '700 22px NText', BROWN, 'center', 1, 'fig'); g.restore(); }
    const qk = seg(f, E.qTags, E.qTags + 14), kr = seg(f, E.kcalReveal, E.kcalReveal + 10);
    if (qk > 0) { const [lp, rp] = pans; g.save(); g.globalAlpha = qk; text(g, kr > 0 ? '164 kcal' : '? kcal', lp[0], lp[1] - 160, '900 40px NDisplay', kr > 0 ? GOLD : RED, 'center', 0, 'fig'); text(g, kr > 0 ? '≈ 380 kcal' : '? kcal', rp[0], rp[1] - 160, '900 40px NDisplay', kr > 0 ? BROWN : RED, 'center', 0, 'fig'); g.restore(); if (kr > 0 && kr < 1) { g.save(); g.strokeStyle = `rgba(138,78,28,${0.7 * (1 - kr)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(rp[0], rp[1] - 172, 110 + 60 * kr, 40 + 20 * kr, 0, 0, 7); g.stroke(); g.restore(); } }
    const xb = seg(f, E.x2, E.x2 + 10); if (xb > 0) { g.save(); g.globalAlpha = xb; g.translate(540, 800); g.scale(0.6 + 0.4 * eo(xb), 0.6 + 0.4 * eo(xb)); g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(0, 0, 52, 0, 7); g.fill(); g.strokeStyle = RED; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 52, 0, 7); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 59, 0, 7); g.stroke(); text(g, '> 2×', 0, 11, '900 32px NDisplay', RED, 'center', 0, 'fig'); g.restore(); }
    if (f >= E.level) { const lv = seg(f, E.level, E.level + 12); g.save(); g.globalAlpha = lv; g.setLineDash([6, 8]); g.strokeStyle = LEAFDARK; g.lineWidth = 2; g.beginPath(); g.moveTo(170, 940); g.lineTo(880, 940); g.stroke(); g.setLineDash([]); text(g, 'level', 888, 947, '700 20px NText', LEAFDARK, 'left', 0, 'fig'); g.restore(); }
    g.restore();
  }
  // --- B: roasting on a scale; C: per 100 g bars; D: the snack portion (stays through the CTA)
  if (f >= E.section && clipScene(f, E.burnish, E.burnish2)) { drawScaleScene(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish));
  if (f >= E.burnish2 && clipScene(f, E.burnish2, E.burnish3)) { drawBarsScene(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish2));
  if (f >= E.burnish3 && clipScene(f, E.burnish3, null)) { drawSnackScene(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish3));
  const lg = seg(f, 150, 180);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'USDA FoodData Central: cooked chickpeas FDC 173757 · dried FDC 173756'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
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
