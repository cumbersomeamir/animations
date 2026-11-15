// CalMeter English 30 s english-16 (2026-11-15, batch 16): dark vs milk chocolate, "MORE CALORIES?".
// The requested "grapes vs raisins" was already english-08 (raisins vs grapes, the same 30 g; water removal), and the water-removal
// mechanism also carried english-10 (chickpeas) and english-13 (rice), so a genuinely different same-genre story with an equally strong
// opening was chosen. Frame 0 is the thumbnail composition: a dark and a milk chocolate bar, both snapped, with "MORE CALORIES?".
// Built to context/25 (incl. the 2026-11-15 first-frame addendum) and the approved egg/avocado-era direction: one big hero per scene, real
// transformations (snap, cubes tumbling, a pod splitting, butter pouring, pieces landing on scales), big roundels, large brief labels.
// Scenes: hook; per 100 g (598 vs 535 kcal); sugar (24 vs 52 g, cubes); cocoa butter (43 vs 30 g fat); 1 gram (fat ≈ 9 kcal, sugar 4);
// 30 g each on a scale (≈ 180 vs ≈ 160 kcal), "LOG THE GRAMS"; CalMeter CTA seal. Original Canvas2D code (no Three.js). Stop motion 15/s.
// Usage: node render.mjs  |  node render.mjs --still 0,120,300  |  node render.mjs --thumb
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
function softShadow(g, x, y, rx, ry, a = 0.22) { for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(40,30,15,${a / 6})`; g.beginPath(); g.ellipse(x, y, rx * (1 + i * 0.07), ry * (1 + i * 0.12), 0, 0, 7); g.fill(); } }
function drawScale(g, cx, top, w, grams, jit, hi = 0) {
  const h = w * 0.42; softShadow(g, cx, top + h + 10, w * 0.55, 12, 0.2);
  g.fillStyle = '#E3E5E2'; g.fillRect(cx - w / 2, top, w, 14); burin(g, [[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2, top + 14], [cx - w / 2, top + 14], [cx - w / 2, top]], 1.8, INK, 1, jit);
  const body = [[cx - w * 0.44, top + 20], [cx + w * 0.44, top + 20], [cx + w * 0.48, top + h], [cx - w * 0.48, top + h], [cx - w * 0.44, top + 20]];
  g.save(); poly(g, body); g.clip(); const bg = g.createLinearGradient(0, top, 0, top + h); bg.addColorStop(0, '#F3EEE2'); bg.addColorStop(1, '#D8D0BC'); g.fillStyle = bg; g.fillRect(cx - w, top, 2 * w, h + 4); g.restore(); burin(g, body, 2.4, INK, 1, jit);
  const dw = w * 0.62, dh = h * 0.5, dx = cx - dw / 2, dy = top + 20 + (h - 20 - dh) / 2;
  g.fillStyle = hi > 0 ? mix('#DDEBC8', '#F6E7A8', hi) : '#DDEBC8'; g.fillRect(dx, dy, dw, dh); burin(g, [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh], [dx, dy]], 2, INK, 1, jit);
  if (grams != null) text(g, `${Math.abs(grams - Math.round(grams)) > 0.01 ? grams.toFixed(1) : Math.round(grams)} g`, cx, dy + dh * 0.78, `900 ${Math.round(dh * 0.78)}px NDisplay`, INK, 'center', 0, 'fig');
}
function drawRoundel(g, x, y, r, big, small, col, pop, jit) {
  if (pop <= 0) return; const sc = 0.6 + 0.4 * eo(clamp(pop)) + 0.08 * Math.sin(Math.PI * clamp(pop * 1.4)); g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= clamp(pop * 2);
  softShadow(g, 6, 10, r * 0.95, r * 0.95, 0.18); g.fillStyle = '#FFFCF2'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, r - 3, 0, 7); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, r + 6, 0, 7); g.stroke();
  let px = Math.round(r * 0.62); g.font = `900 ${px}px NDisplay`; while (g.measureText(big).width > r * 1.6 && px > 20) { px -= 2; g.font = `900 ${px}px NDisplay`; }
  text(g, big, 0, px * 0.3, `900 ${px}px NDisplay`, col, 'center', 0, 'fig'); text(g, small, 0, px * 0.3 + r * 0.36, `700 ${Math.round(r * 0.22)}px NText`, INK2, 'center', 1, 'fig'); g.restore();
}
function bigLabel(g, s, x, y, px, col, a, rot = 0) { if (a <= 0) return; const sc = 0.7 + 0.3 * eo(clamp(a)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= clamp(a); g.font = `900 ${px}px NDisplay`; const w = g.measureText(s).width; g.fillStyle = 'rgba(248,242,227,0.85)'; g.fillRect(-w / 2 - 14, -px * 0.82, w + 28, px * 1.08); text(g, s, 0, 0, `900 ${px}px NDisplay`, col, 'center', 0, 'fig'); g.restore(); }
function burstFX(g, x, y, t, r0, r1, n = 14) { if (t <= 0 || t >= 1) return; g.save(); const a = 1 - t; g.strokeStyle = `rgba(214,69,43,${0.9 * a})`; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const an = (i / n) * 6.283 + 0.2; const ra = lerp(r0, r1, eo(t)), rb = ra + 26 * a + 10; g.lineWidth = 5 * a + 1; g.beginPath(); g.moveTo(x + Math.cos(an) * ra, y + Math.sin(an) * ra); g.lineTo(x + Math.cos(an) * rb, y + Math.sin(an) * rb); g.stroke(); } const fl = g.createRadialGradient(x, y, 0, x, y, r1); fl.addColorStop(0, `rgba(255,248,220,${0.85 * a})`); fl.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = fl; g.beginPath(); g.arc(x, y, r1, 0, 7); g.fill(); g.restore(); }
function captions2(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out);
    c.lines.forEach(([s, f0], li) => { const a = seg(f, f0, f0 + 5) * (1 - out); if (a <= 0) return; let px = 64; g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > 740 && px > 44) { px -= 2; g.font = `900 ${px}px NDisplay`; }
      const y = (li === 0 ? 404 : 474) + 10 * (1 - eo(seg(f, f0, f0 + 6))); g.save(); g.globalAlpha = a; text(g, s, 500, y, `900 ${px}px NDisplay`, li === 0 ? INK : LEAFDARK, 'center', 0, 'caption'); /* caption window x 100-900 is centred at 500 */ g.restore(); });
  }
}
// ---------------- chocolate: bars of raised squares with a paper sleeve and foil; sugar cubes; a cacao pod; cocoa butter blocks; energy tokens
const CARD = '#F8F2E3', GOLD = '#9A6410', STEEL = '#C9CED2', BUTTER_D = '#A9822F';
const CH = {
  dark: { base: '#3E2418', hi: '#76503A', lo: '#1F110A', ring: '#4A2614', wrap: '#7A1F1A', wrapHi: '#A3382B', foil: '#E2C16A', foilD: '#9C7A2C', ink: '#F3D58A', name: 'DARK', sub: '70–85%' },
  milk: { base: '#8E5A34', hi: '#C3906A', lo: '#5A341C', ring: '#B8672E', wrap: '#2C6E9E', wrapHi: '#4C90C2', foil: '#DDE1E4', foilD: '#8E969C', ink: '#FFFFFF', name: 'MILK', sub: '' },
};
const CELL = 96, PAD = 12;
function softGlow(g, x, y, r, rgb, a) { if (a <= 0) return; const gg = g.createRadialGradient(x, y, 4, x, y, r); gg.addColorStop(0, `rgba(${rgb},${a})`); gg.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function sparkle(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); g.strokeStyle = 'rgba(255,214,120,0.9)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - r * 0.6, y - r * 0.6); g.lineTo(x + r * 0.6, y + r * 0.6); g.moveTo(x + r * 0.6, y - r * 0.6); g.lineTo(x - r * 0.6, y + r * 0.6); g.stroke(); g.restore(); }
const bounce = (t) => { if (t >= 1) return 1; const u = eo(clamp(t / 0.75)); return t < 0.75 ? u : 1 - 0.06 * Math.sin(Math.PI * (t - 0.75) / 0.25); };
function cell(g, x, y, k) {
  /* one raised square of chocolate (top-left at x, y): lit top/left bevels, shaded bottom/right bevels with engraved hatching */
  const c = CH[k], s = CELL, b = 15;
  g.fillStyle = c.base; g.fillRect(x, y, s, s);
  g.fillStyle = c.hi; poly(g, [[x, y], [x + s, y], [x + s - b, y + b], [x + b, y + b]]); g.fill();
  g.fillStyle = mix(c.hi, c.base, 0.45); poly(g, [[x, y], [x + b, y + b], [x + b, y + s - b], [x, y + s]]); g.fill();
  g.fillStyle = c.lo; poly(g, [[x + s, y], [x + s, y + s], [x + s - b, y + s - b], [x + s - b, y + b]]); g.fill();
  g.fillStyle = mix(c.lo, c.base, 0.35); poly(g, [[x, y + s], [x + s, y + s], [x + s - b, y + s - b], [x + b, y + s - b]]); g.fill();
  const gr = g.createLinearGradient(x + b, y + b, x + s - b, y + s - b); gr.addColorStop(0, mix(c.base, c.hi, 0.4)); gr.addColorStop(1, c.base); g.fillStyle = gr; g.fillRect(x + b, y + b, s - 2 * b, s - 2 * b);
  g.strokeStyle = 'rgba(0,0,0,0.32)'; g.lineWidth = 1.1; g.beginPath();
  for (let i = 1; i < 5; i++) { g.moveTo(x + s - b + i * 3, y + b + 3 + i); g.lineTo(x + s - b + i * 3, y + s - b - 3 - i); g.moveTo(x + b + 3 + i, y + s - b + i * 3); g.lineTo(x + s - b - 3 - i, y + s - b + i * 3); }
  g.stroke(); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.3; g.strokeRect(x + b, y + b, s - 2 * b, s - 2 * b);
}
function bar(g, cx, cy, sc, rot, k, f, jit, o = {}) {
  /* a chocolate bar of cols x rows squares; o.miss = indices of snapped squares; o.sleeve = fraction covered by the paper sleeve (0 = none); o.glint 0..1 */
  const cols = o.cols ?? 3, rows = o.rows ?? 5, miss = o.miss || [], c = CH[k];
  const W0 = cols * CELL + 2 * PAD, H0 = rows * CELL + 2 * PAD, x0 = -W0 / 2, y0 = -H0 / 2;
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(sc, sc);
  softShadow(g, 16, H0 / 2 + 10, W0 * 0.56, 22, 0.24);
  const cellBox = (r, q) => [x0 + PAD + q * CELL - (q === 0 ? PAD : 0), y0 + PAD + r * CELL - (r === 0 ? PAD : 0), CELL + (q === 0 ? PAD : 0) + (q === cols - 1 ? PAD : 0), CELL + (r === 0 ? PAD : 0) + (r === rows - 1 ? PAD : 0)];
  g.fillStyle = c.lo; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if (!miss.includes(r * cols + q)) { const [bx, by, bw, bh] = cellBox(r, q); g.fillRect(bx, by, bw, bh); }
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if (!miss.includes(r * cols + q)) cell(g, x0 + PAD + q * CELL, y0 + PAD + r * CELL, k);
  /* outline (an L-shape when a top corner is snapped), with a ragged break */
  let out = [[x0, y0], [x0 + W0, y0], [x0 + W0, y0 + H0], [x0, y0 + H0]];
  if (miss.includes(cols - 1)) { const nx = x0 + W0 - CELL - PAD, ny = y0 + PAD + CELL; out = [[x0, y0], [nx, y0], [nx + 4, y0 + 30], [nx - 3, y0 + 62], [nx + 5, ny - 6], [nx + 34, ny + 4], [nx + 70, ny - 3], [x0 + W0, ny + 2], [x0 + W0, y0 + H0], [x0, y0 + H0]]; }
  if (miss.includes(0)) { const nx = x0 + CELL + PAD, ny = y0 + PAD + CELL; out = [[nx, y0], [x0 + W0, y0], [x0 + W0, y0 + H0], [x0, y0 + H0], [x0, ny + 2], [nx - 70, ny - 3], [nx - 34, ny + 4], [nx - 5, ny - 6], [nx + 3, y0 + 62], [nx - 4, y0 + 30]]; }
  if (miss.length) { g.fillStyle = c.lo; poly(g, out.slice(miss.includes(0) ? 4 : 2, miss.includes(0) ? 10 : 8)); }
  burin(g, [...out, out[0]], 2.4, INK, 1, jit);
  /* gloss: a soft diagonal sheen that drifts across the squares */
  const gx = lerp(-W0, W0, o.glint ?? 0.3); g.save(); poly(g, out); g.clip(); const sh = g.createLinearGradient(gx - 90, y0, gx + 90, y0 + 120); sh.addColorStop(0, 'rgba(255,240,220,0)'); sh.addColorStop(0.5, 'rgba(255,240,220,0.16)'); sh.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = sh; g.fillRect(x0, y0, W0, H0); g.restore();
  const sl = o.sleeve ?? 0.4;
  if (sl > 0) {
    const sy = y0 + H0 * (1 - sl);
    /* crinkled foil just above the sleeve */
    const fz = []; for (let i = 0; i <= 14; i++) fz.push([x0 - 4 + (W0 + 8) * (i / 14), sy - 22 + (i % 2 ? 9 : 0)]);
    const foil = [...fz, [x0 + W0 + 4, sy + 4], [x0 - 4, sy + 4]]; const fg = g.createLinearGradient(x0, 0, x0 + W0, 0); fg.addColorStop(0, c.foilD); fg.addColorStop(0.35, c.foil); fg.addColorStop(0.55, '#FFFFFF'); fg.addColorStop(0.75, c.foil); fg.addColorStop(1, c.foilD); g.fillStyle = fg; poly(g, foil); g.fill(); burin(g, [...foil, foil[0]], 1.6, INK, 1, jit);
    for (let i = 1; i < 9; i++) { g.strokeStyle = 'rgba(22,32,26,0.28)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + i * W0 / 9, sy - 14); g.lineTo(x0 + i * W0 / 9 + 6, sy + 2); g.stroke(); }
    /* paper sleeve */
    const sx0 = x0 - 8, sx1 = x0 + W0 + 8, sy1 = y0 + H0 + 6; const wg = g.createLinearGradient(sx0, 0, sx1, 0); wg.addColorStop(0, mix(c.wrap, '#000000', 0.25)); wg.addColorStop(0.3, c.wrapHi); wg.addColorStop(0.6, c.wrap); wg.addColorStop(1, mix(c.wrap, '#000000', 0.3)); g.fillStyle = wg; g.fillRect(sx0, sy, sx1 - sx0, sy1 - sy);
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.beginPath(); for (let yy = sy + 8; yy < sy1; yy += 7) { g.moveTo(sx0 + 4, yy); g.lineTo(sx1 - 4, yy); } g.stroke();
    burin(g, [[sx0, sy], [sx1, sy], [sx1, sy1], [sx0, sy1], [sx0, sy]], 2.4, INK, 1, jit);
    const mid = (sy + sy1) / 2; text(g, c.name, 0, c.sub ? mid + 8 : mid + 28, `900 ${o.namePx ?? 78}px NDisplay`, c.ink, 'center', 3, o.tag ?? 'fig');
    if (c.sub) text(g, c.sub, 0, mid + 58, '900 40px NDisplay', c.ink, 'center', 2, o.tag ?? 'fig');
  }
  g.restore();
}
function crumbs(g, x, y, k, f, seed, n = 7) {
  /* little chocolate crumbs falling from a snapped edge on a loop */
  const c = CH[k]; for (let i = 0; i < n; i++) { const q = rng(seed * 31 + i); const per = 40 + Math.floor(q() * 30), ph = Math.floor(q() * per); const t = ((f + ph) % per) / per; const px = x + (q() - 0.5) * 60 + (q() - 0.5) * 40 * t, py = y + 420 * t * t; const s = 4 + q() * 6; g.save(); g.globalAlpha *= 1 - t * t; g.translate(px, py); g.rotate(q() * 6 + t * 3); g.fillStyle = q() < 0.5 ? c.base : c.lo; g.beginPath(); g.moveTo(-s, -s * 0.6); g.lineTo(s * 0.8, -s); g.lineTo(s, s * 0.7); g.lineTo(-s * 0.5, s); g.closePath(); g.fill(); g.restore(); }
}
function cube(g, x, y, s) {
  /* a sugar cube standing on (x, y) (centre of its bottom edge), seen slightly from above-right */
  const d = s * 0.3, fx = x - s / 2, fy = y - s;
  g.fillStyle = '#FFFFFF'; poly(g, [[fx, fy], [fx + s, fy], [fx + s + d, fy - d], [fx + d, fy - d]]); g.fill();
  g.fillStyle = '#C6D3DE'; poly(g, [[fx + s, fy], [fx + s + d, fy - d], [fx + s + d, fy + s - d], [fx + s, fy + s]]); g.fill();
  const fg = g.createLinearGradient(fx, fy, fx + s, fy + s); fg.addColorStop(0, '#FBFCFD'); fg.addColorStop(1, '#E1E8EE'); g.fillStyle = fg; g.fillRect(fx, fy, s, s);
  const q = rng(Math.round(x * 7 + y * 13)); g.fillStyle = 'rgba(150,170,190,0.55)'; for (let i = 0; i < 9; i++) g.fillRect(fx + 4 + q() * (s - 10), fy + 4 + q() * (s - 10), 2.4, 2.4);
  g.fillStyle = 'rgba(255,255,255,0.95)'; for (let i = 0; i < 4; i++) g.fillRect(fx + d * 0.6 + q() * s * 0.8, fy - d * 0.5 + (q() - 0.5) * d * 0.5, 2.6, 2.6);
  g.strokeStyle = INK; g.lineWidth = Math.max(1.4, s * 0.035); g.lineJoin = 'round'; g.beginPath(); g.moveTo(fx, fy + s); g.lineTo(fx, fy); g.lineTo(fx + d, fy - d); g.lineTo(fx + s + d, fy - d); g.lineTo(fx + s + d, fy + s - d); g.lineTo(fx + s, fy + s); g.closePath(); g.moveTo(fx, fy); g.lineTo(fx + s, fy); g.lineTo(fx + s + d, fy - d); g.moveTo(fx + s, fy); g.lineTo(fx + s, fy + s); g.stroke();
}
function cubeStack(g, cx, base, n, s, f, start, step) {
  /* n cubes in rows of 3, dropping in one by one from above */
  const cols = 3, pos = []; for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), q = i % cols; pos.push([cx + (q - 1) * (s + 3) - s * 0.15, base - r * s, i]); }
  for (const [x, y, i] of pos) { const t = seg(f, start + i * step, start + i * step + 9); if (t <= 0) continue; const yy = y - (1 - bounce(t)) * 380; g.save(); g.globalAlpha *= clamp(t * 3); cube(g, x, yy, s); g.restore(); }
}
function pod(g, cx, cy, L, R, sp, jit) {
  /* a ridged cacao pod lying on its side; sp 0..1 splits it: the top half lifts and tilts, revealing pulp and beans */
  const prof = (u) => R * Math.pow(Math.max(0, 1 - u * u), 0.7);
  const half = (sgn) => { const pts = []; for (let i = 0; i <= 44; i++) { const u = -1 + (2 * i) / 44; pts.push([u * L, sgn * prof(u)]); } return pts; };
  g.save(); g.translate(cx, cy); softShadow(g, 0, R + 26, L * 0.85, 16, 0.2);
  if (sp > 0) {
    g.save(); g.globalAlpha *= clamp(sp * 2); g.fillStyle = '#F6EEDC'; g.beginPath(); g.ellipse(0, -sp * 20, L * 0.84, R * 0.55 + sp * 22, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(22,32,26,0.5)'; g.lineWidth = 1.5; g.stroke();
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const bx = -L * 0.62 + i * L * 0.25, by = -sp * 20 + (r ? 16 : -18); g.fillStyle = '#7A4637'; g.beginPath(); g.ellipse(bx, by, 26, 15, 0.15, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke(); g.fillStyle = 'rgba(255,230,210,0.45)'; g.beginPath(); g.ellipse(bx - 7, by - 5, 9, 4, 0.15, 0, 7); g.fill(); }
    g.restore();
  }
  const drawHalf = (pts, sgn) => {
    const shape = [...pts, [L, 0], [-L, 0]]; g.save(); poly(g, shape); g.clip(); const pg = g.createLinearGradient(0, -R, 0, R); pg.addColorStop(0, '#F0A048'); pg.addColorStop(0.5, '#C96A22'); pg.addColorStop(1, '#7E3E14'); g.fillStyle = pg; g.fillRect(-L, -R - 2, 2 * L, 2 * R + 4);
    for (let j = 1; j < 5; j++) burin(g, Array.from({ length: 31 }, (_, i) => { const u = -0.96 + (1.92 * i) / 30; return [u * L, sgn * prof(u) * (j / 5)]; }), 1.6, 'rgba(90,40,10,0.7)', 1, jit);
    g.fillStyle = 'rgba(255,235,190,0.35)'; g.beginPath(); g.ellipse(-L * 0.25, sgn * R * 0.55, L * 0.45, R * 0.12, 0, 0, 7); g.fill(); g.restore();
    burin(g, [...pts], 2.6, INK, 1, jit); if (sp > 0.02) burin(g, [[-L, 0], [L, 0]], 2, INK, 1, jit);
  };
  g.save(); g.translate(0, sp * 26); /* stalk at the left tip, on the lower half */ g.fillStyle = '#6B4A22'; g.fillRect(-L - 24, -7, 30, 14); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-L - 24, -7, 30, 14); drawHalf(half(1), 1); g.restore();
  g.save(); g.translate(sp * 10, -sp * 70); g.rotate(-sp * 0.14); drawHalf(half(-1), -1); g.restore();
  g.restore();
}
function butterBlock(g, cx, base, w, h, t, jit) {
  /* a block of cocoa butter growing up from the card */
  const hh = h * eo(clamp(t)); if (hh < 2) return; const d = 30, x0 = cx - w / 2, y0 = base - hh;
  softShadow(g, cx + 12, base + 6, w * 0.62, 14, 0.2);
  const fg = g.createLinearGradient(x0, y0, x0 + w, base); fg.addColorStop(0, '#FBEEC0'); fg.addColorStop(1, '#E6C774'); g.fillStyle = fg; g.fillRect(x0, y0, w, hh);
  g.fillStyle = '#FFF6D6'; poly(g, [[x0, y0], [x0 + w, y0], [x0 + w + d, y0 - d], [x0 + d, y0 - d]]); g.fill();
  g.fillStyle = '#C9A85A'; poly(g, [[x0 + w, y0], [x0 + w + d, y0 - d], [x0 + w + d, base - d], [x0 + w, base]]); g.fill();
  g.strokeStyle = 'rgba(110,80,20,0.45)'; g.lineWidth = 1; g.beginPath(); for (let yy = y0 + 6; yy < base - 4; yy += 9) { g.moveTo(x0 + w + 4, yy); g.lineTo(x0 + w + d - 4, yy - d + 6); } g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x0 + 14, y0 + 10, 12, Math.max(0, hh - 20));
  g.strokeStyle = INK; g.lineWidth = 2.4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x0, base); g.lineTo(x0, y0); g.lineTo(x0 + d, y0 - d); g.lineTo(x0 + w + d, y0 - d); g.lineTo(x0 + w + d, base - d); g.lineTo(x0 + w, base); g.closePath(); g.moveTo(x0, y0); g.lineTo(x0 + w, y0); g.lineTo(x0 + w + d, y0 - d); g.moveTo(x0 + w, y0); g.lineTo(x0 + w, base); g.stroke();
}
function drop(g, x, y, r, col = '#F2C95A') {
  /* a glossy golden drop of melted fat, tip up */
  g.save(); const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.2, 2, x, y, r * 1.4); gr.addColorStop(0, '#FFF3C4'); gr.addColorStop(0.5, col); gr.addColorStop(1, '#C48F22'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x, y - r * 1.6); g.bezierCurveTo(x + r * 0.35, y - r * 0.9, x + r, y - r * 0.45, x + r, y + r * 0.1); g.arc(x, y + r * 0.1, r, 0, Math.PI); g.bezierCurveTo(x - r, y - r * 0.45, x - r * 0.35, y - r * 0.9, x, y - r * 1.6); g.fill();
  g.strokeStyle = INK; g.lineWidth = Math.max(1.4, r * 0.04); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(x - r * 0.4, y - r * 0.1, r * 0.14, r * 0.3, -0.4, 0, 7); g.fill(); g.restore();
}
function token(g, x, y, r, pop) {
  /* one kilocalorie: a small glowing ember-coin that pops in */
  if (pop <= 0) return; const sc = 0.5 + 0.5 * eo(clamp(pop)) + 0.15 * Math.sin(Math.PI * clamp(pop * 1.3)); g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= clamp(pop * 2);
  softGlow(g, 0, 0, r * 1.9, '255,190,80', 0.45); const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r); gr.addColorStop(0, '#FFF0B8'); gr.addColorStop(0.6, '#F6B53C'); gr.addColorStop(1, '#D9831E'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(r * 0.12, -r * 0.62); g.lineTo(-r * 0.32, r * 0.08); g.lineTo(-r * 0.02, r * 0.08); g.lineTo(-r * 0.14, r * 0.62); g.lineTo(r * 0.34, -r * 0.1); g.lineTo(r * 0.04, -r * 0.1); g.closePath(); g.fill(); g.restore();
}
// ---------------- A: frame 0 = the thumbnail: a dark and a milk chocolate bar, each snapped, the broken squares hanging between them, "MORE CALORIES?"
function hookComposition(g, f, jit, words = 1, still = false) {
  const bob = Math.sin(f * 0.06) * 5, ph = still ? 0 : f;
  softGlow(g, 350, 1060, 420, '255,205,150', 0.42); softGlow(g, 730, 1060, 420, '170,205,235', 0.36);
  bar(g, 348, 1098 + bob, 1.08, -0.12, 'dark', f, jit, { miss: [2], glint: 0.25 + 0.5 * ((ph % 150) / 150) });
  bar(g, 732, 1098 - bob, 1.08, 0.12, 'milk', f, jit, { miss: [0], glint: 0.75 - 0.5 * ((ph % 150) / 150) });
  crumbs(g, 428, 902, 'dark', ph, 3); crumbs(g, 652, 902, 'milk', ph, 5);
  const lift = Math.sin(ph * 0.05) * 8;
  bar(g, 466, 786 - lift, 1.04, 0.42 + 0.04 * Math.sin(ph * 0.04), 'dark', f, jit, { cols: 1, rows: 1, sleeve: 0 });
  bar(g, 614, 780 + lift, 1.04, -0.38 - 0.04 * Math.sin(ph * 0.04), 'milk', f, jit, { cols: 1, rows: 1, sleeve: 0 });
  if (words > 0) bigLabel(g, 'MORE CALORIES?', 540, 650, 92, INK, words, 0);
}
function sceneHook(g, f, jit) {
  hookComposition(g, f, jit, 1 - seg(f, E.qk - 6, E.qk));
  const k = seg(f, E.qk, E.qk + 10); if (k > 0) { drawRoundel(g, 225, 690, 100, '?', 'kcal', CH.dark.ring, k + (f > E.qk + 10 ? 1 : 0), jit); drawRoundel(g, 855, 690, 100, '?', 'kcal', CH.milk.ring, seg(f, E.qk + 4, E.qk + 14) + (f > E.qk + 14 ? 1 : 0), jit); }
}
// ---------------- B: dark does: 598 vs 535 kcal per 100 g
function scenePer100(g, f, jit) {
  const a = seg(f, E.bars100, E.bars100 + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, 'PER 100 g', 540, 650, 66, INK, 1, 0);
  const hop = Math.sin(Math.PI * seg(f, E.dark, E.dark + 16)) * 46, sway = 0.02 * Math.sin(f * 0.035);
  softGlow(g, 300, 1080, 300, '255,200,120', 0.25 + 0.35 * seg(f, E.dark, E.dark + 10));
  bar(g, 300, 1124 - hop, 1.0, -0.02 + sway, 'dark', f, jit, { glint: (f % 120) / 120 });
  bar(g, 780, 1124, 1.0, 0.02 - sway, 'milk', f, jit, { glint: ((f + 60) % 120) / 120 });
  burstFX(g, 300, 800, seg(f, E.k598, E.k598 + 16), 120, 190);
  drawRoundel(g, 300, 800, 118, '598', 'kcal / 100 g', CH.dark.ring, seg(f, E.k598, E.k598 + 10) + (f > E.k598 + 10 ? 1 : 0), jit);
  drawRoundel(g, 780, 800, 118, '535', 'kcal / 100 g', CH.milk.ring, seg(f, E.k535, E.k535 + 10) + (f > E.k535 + 10 ? 1 : 0), jit);
  g.restore();
}
// ---------------- C: yet less than half the sugar: 24 g vs 52 g per 100 g (one cube ≈ 4 g, illustrative)
function sceneSugar(g, f, jit) {
  const a = seg(f, E.sugar, E.sugar + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, 'SUGAR', 540, 650, 74, INK, 1, 0);
  softShadow(g, 300, 1346, 150, 14, 0.12); softShadow(g, 780, 1346, 150, 14, 0.12);
  cubeStack(g, 300, 1340, 6, 76, f, E.cubesD, 3); cubeStack(g, 780, 1340, 13, 76, f, E.cubesM, 3);
  for (let i = 0; i < 3; i++) { const q = rng(Math.floor(f / 8) * 5 + i); sparkle(g, 700 + q() * 170, 960 + q() * 340, 9 + q() * 6, 0.8 * Math.abs(Math.sin(f * 0.15 + i)) * seg(f, E.cubesM + 20, E.cubesM + 30)); }
  bigLabel(g, 'DARK', 300, 1446, 58, CH.dark.ring, 1, 0); bigLabel(g, 'MILK', 780, 1446, 58, CH.milk.ring, 1, 0);
  drawRoundel(g, 300, 812, 112, '24 g', 'sugar / 100 g', CH.dark.ring, seg(f, E.k24, E.k24 + 10) + (f > E.k24 + 10 ? 1 : 0), jit);
  drawRoundel(g, 780, 812, 112, '52 g', 'sugar / 100 g', CH.milk.ring, seg(f, E.k52, E.k52 + 10) + (f > E.k52 + 10 ? 1 : 0), jit);
  g.restore();
}
// ---------------- D: more cacao means more cocoa butter: 43 g vs 30 g fat per 100 g
function sceneButter(g, f, jit) {
  const a = seg(f, E.pod, E.pod + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, 'COCOA BUTTER', 540, 650, 68, BUTTER_D, 1, 0);
  const sp = eo(seg(f, E.crack, E.crack + 14)), wob = 0.02 * Math.sin(f * 0.05);
  g.save(); g.translate(540, 852); g.rotate(wob); g.translate(-540, -852); pod(g, 540, 852, 220, 84, sp, jit); g.restore();
  const tD = seg(f, E.butter + 6, E.k43), tM = seg(f, E.k43 + 10, E.k30);
  /* golden drops fall from the opened pod into the growing blocks */
  const stream = (t0, t1, tx, ty) => { for (let i = 0; i < 8; i++) { const s0 = t0 + i * ((t1 - t0) / 8), u = seg(f, s0, s0 + 12); if (u <= 0 || u >= 1) continue; const x = lerp(540, tx, u), y = lerp(900, ty, u * u); drop(g, x, y, 13); } };
  stream(E.butter, E.k43 - 4, 300, 1340 - 322 * eo(tD) - 30); stream(E.k43 + 6, E.k30 - 4, 780, 1340 - 225 * eo(tM) - 30);
  butterBlock(g, 300, 1340, 230, 322, tD, jit); butterBlock(g, 780, 1340, 230, 225, tM, jit);
  bigLabel(g, 'DARK', 300, 1446, 58, CH.dark.ring, 1, 0); bigLabel(g, 'MILK', 780, 1446, 58, CH.milk.ring, 1, 0);
  drawRoundel(g, 300, 1180, 96, '43 g', 'fat / 100 g', CH.dark.ring, seg(f, E.k43, E.k43 + 10) + (f > E.k43 + 10 ? 1 : 0), jit);
  drawRoundel(g, 780, 1228, 96, '30 g', 'fat / 100 g', CH.milk.ring, seg(f, E.k30, E.k30 + 10) + (f > E.k30 + 10 ? 1 : 0), jit);
  g.restore();
}
// ---------------- E: fat has about 9 kcal a gram, sugar 4 (Atwater general factors)
function sceneGram(g, f, jit) {
  const a = seg(f, E.gram, E.gram + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, '1 GRAM', 540, 650, 74, INK, 1, 0);
  const pf = seg(f, E.fat - 4, E.fat + 8), bob = Math.sin(f * 0.07) * 6;
  if (pf > 0) { g.save(); const sc = 0.6 + 0.4 * eo(pf); g.translate(300, 1110 + bob); g.scale(sc, sc); softShadow(g, 0, 140, 110, 14, 0.18); drop(g, 0, 0, 104); g.restore(); bigLabel(g, 'FAT', 300, 1320, 64, BUTTER_D, seg(f, E.fat, E.fat + 8), 0); }
  for (let i = 0; i < 9; i++) { const r = Math.floor(i / 3), q = i % 3; token(g, 300 + (q - 1) * 74, 752 + r * 70, 27, seg(f, E.nine + i * 2, E.nine + i * 2 + 8)); }
  bigLabel(g, '9 kcal', 300, 1432, 70, RED, seg(f, E.nine + 6, E.nine + 14), 0);
  const pc = seg(f, E.sugarC - 4, E.sugarC + 8);
  if (pc > 0) { g.save(); const sc = 0.6 + 0.4 * eo(pc); g.translate(780, 1210 - bob); g.scale(sc, sc); softShadow(g, 10, 6, 120, 14, 0.18); cube(g, -20, 0, 176); g.restore(); bigLabel(g, 'SUGAR', 780, 1320, 64, '#2C4F6E', seg(f, E.sugarC, E.sugarC + 8), 0); }
  for (let i = 0; i < 4; i++) { const r = Math.floor(i / 2), q = i % 2; token(g, 780 + (q - 0.5) * 74, 787 + r * 70, 27, seg(f, E.four - 7 + i * 3, E.four - 7 + i * 3 + 8)); }
  bigLabel(g, '4 kcal', 780, 1432, 70, RED, seg(f, E.four, E.four + 8), 0);
  g.restore();
}
// ---------------- F: 30 g of each on a scale: ≈ 180 vs ≈ 160 kcal; log the grams, not the shade
function scenePortion(g, f, jit) {
  const a = seg(f, E.scales, E.scales + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, '30 g EACH', 540, 650, 68, INK, 1 - seg(f, E.k180 - 6, E.k180), 0);
  const g1 = f < E.p1 ? null : 30 * eo(seg(f, E.p1, E.p1 + 14)), g2 = f < E.p2 ? null : 30 * eo(seg(f, E.p2, E.p2 + 14));
  drawScale(g, 300, 1120, 330, g1 == null ? null : Math.round(g1), jit, seg(f, E.p1 + 12, E.p1 + 18) * (1 - seg(f, E.p1 + 30, E.p1 + 40)));
  drawScale(g, 780, 1120, 330, g2 == null ? null : Math.round(g2), jit, seg(f, E.p2 + 12, E.p2 + 18) * (1 - seg(f, E.p2 + 30, E.p2 + 40)));
  const land = (p, x, k, rot) => { const t = seg(f, p - 12, p); if (t <= 0) return; const y = lerp(640, 1066, bounce(t)); bar(g, x, y, 0.82, rot * (1 - t), k, f, jit, { cols: 3, rows: 1, sleeve: 0, glint: (f % 90) / 90 }); };
  land(E.p1, 300, 'dark', 0.5); land(E.p2, 780, 'milk', -0.5);
  const lg = seg(f, E.logIt, E.logIt + 10);
  bigLabel(g, 'DARK', 300, 1340, 56, CH.dark.ring, seg(f, E.p1, E.p1 + 8) * (1 - lg), 0); bigLabel(g, 'MILK', 780, 1340, 56, CH.milk.ring, seg(f, E.p2, E.p2 + 8) * (1 - lg), 0);
  drawRoundel(g, 300, 810, 118, '≈ 180', 'kcal / 30 g', CH.dark.ring, seg(f, E.k180, E.k180 + 10) + (f > E.k180 + 10 ? 1 : 0), jit);
  drawRoundel(g, 780, 810, 118, '≈ 160', 'kcal / 30 g', CH.milk.ring, seg(f, E.k160, E.k160 + 10) + (f > E.k160 + 10 ? 1 : 0), jit);
  if (lg > 0) bigLabel(g, 'LOG THE GRAMS', 540, 1432, 64, LEAFDARK, lg * (1 - seg(f, E.cta - 4, E.cta + 4)), 0);
  g.restore();
}
function camera2(f) {
  const keys = [[0, 1.0, 540, 1010], [104, 1.045, 540, 1000, 1], [118, 1.0, 540, 1010], [240, 1.04, 540, 1004, 1], [254, 1.0, 540, 1010], [372, 1.04, 540, 1004, 1], [386, 1.0, 540, 1010], [522, 1.04, 540, 1004, 1], [536, 1.0, 540, 1010], [626, 1.04, 540, 1004, 1], [640, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + 0.018 * Math.exp(-(((f - E.k598) / 4) ** 2)) + 0.018 * Math.exp(-(((f - E.k52) / 4) ** 2)) + 0.018 * Math.exp(-(((f - E.k43) / 4) ** 2)) + 0.018 * Math.exp(-(((f - E.four) / 4) ** 2)) + 0.018 * Math.exp(-(((f - E.k180) / 4) ** 2));
  return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)) * kick, x: lerp(x0, x1, t), y: lerp(y0, y1, t) };
}
// ---------------- paper, camera, captions, CTA (unchanged from the accepted English episodes)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
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
function drawCard() { for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(40,30,15,0.035)'; g.fillRect(62 - i * 2 + 6, 528 - i * 2 + 10, 956 + i * 4, 984 + i * 4); } g.fillStyle = CARD; g.fillRect(62, 528, 956, 984); }
const SCENES = [[sceneHook, null, 'burnish'], [scenePer100, 'burnish', 'burnish2'], [sceneSugar, 'burnish2', 'burnish3'], [sceneButter, 'burnish3', 'burnish4'], [sceneGram, 'burnish4', 'burnish5'], [scenePortion, 'burnish5', null]];
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera2(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0); drawCard(); g.save(); g.globalAlpha = 0.5; g.drawImage(grain, 0, 0); g.restore();
  g.save(); g.beginPath(); g.rect(62, 528, 956, 984); g.clip();
  for (const [fn, rev, rem] of SCENES) { if (rev && f < E[rev]) continue; if (clipScene(f, rev ? E[rev] : null, rem ? E[rem] : null)) { fn(g, f, jit); g.restore(); } if (rem) sweepBand(g, sweep(f, E[rem])); }
  g.restore();
  drawCTA(g, f, jit);
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions2(g, f30);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same two curiosity words */
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.drawImage(grain, 0, 0);
  g.translate(540, 1185); g.scale(1.18, 1.18); g.translate(-540, -1075);
  hookComposition(g, 30, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const fit = (s, px, max) => { g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > max && px > 60) { px -= 4; g.font = `900 ${px}px NDisplay`; } return px; };
  const p1 = fit('MORE', 180, 820), p2 = fit('CALORIES?', 160, 820);
  text(g, 'MORE', 540, 470, `900 ${p1}px NDisplay`, INK, 'center', -2, 'thumb'); text(g, 'CALORIES?', 540, 644, `900 ${p2}px NDisplay`, CH.milk.ring, 'center', -2, 'thumb');
}
const args = process.argv.slice(2), si = args.indexOf('--still');
if (args.includes('--thumb')) { fs.mkdirSync(path.join(here, 'build'), { recursive: true }); drawThumb(); fs.writeFileSync(path.join(here, 'build', 'thumbnail.png'), await canvas.encode('png')); fs.writeFileSync(path.join(here, 'build', 'textlog-thumb.json'), JSON.stringify(TEXT_LOG)); process.exit(0); }
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (si >= 0) { for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); } fs.writeFileSync(path.join(here, 'build', 'textlog-stills.json'), JSON.stringify(TEXT_LOG)); }
else {
  const out = path.join(here, 'build', 'video-noaudio.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { if (f % 2 === 0) draw(f); if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(path.join(here, 'build', 'textlog.json'), JSON.stringify(TEXT_LOG)); console.log('done', out);
}
