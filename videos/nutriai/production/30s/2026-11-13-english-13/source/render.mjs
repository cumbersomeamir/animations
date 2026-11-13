// CalMeter English 30 s english-13 (2026-11-13): rice: water changed the number.
// Built to the approved feedback rules of 2026-11-11 (context/25) and the popcorn episode's composition (english-12): one big hero per
// scene, large brief labels one at a time, sequential reveals, purposeful motion; same engraving burin, washes, burnish transitions,
// ivory paper and the CalMeter CTA seal. Scenes: dry rice | water splash | cooked rice with 365 vs 130 kcal/100 g; a pot on a flame "?";
// 50 g dry rice -> into the pot -> a loupe shows a grain drinking water and swelling -> 140 g cooked on the scale; proof: same ≈ 180 kcal,
// + 90 g water, + 0 kcal; the mix-up (dry label on cooked rice ≈ 511 kcal); the rule: dry with dry, cooked with cooked.
// Original Canvas2D code; art direction only from lemo-opuscar styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s.
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
  if (grams != null) text(g, `${Math.round(grams)} g`, cx, dy + dh * 0.78, `900 ${Math.round(dh * 0.78)}px NDisplay`, INK, 'center', 0, 'fig');
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
// ---------------- rice: grains (dry: slim, glassy; cooked: plump, white), heaps, a pot on a flame, a loupe, label tags, water drops
const CARD = '#F8F2E3', WATERC = '#6FAEDF', BLUE = '#2C6E9E', GOLD = '#9A6410', STEEL = '#C9CED2', BOWL = '#2F7A1C', BOWL_D = '#1F5512';
function riceGrain(g, x, y, len, w, rot, k, jit) { /* k: 0 dry .. 1 cooked */
  const L = len / 2, R = w / 2; g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(-L + R, -R); g.lineTo(L - R, -R); g.arc(L - R, 0, R, -Math.PI / 2, Math.PI / 2); g.lineTo(-L + R, R); g.arc(-L + R, 0, R, Math.PI / 2, 1.5 * Math.PI); g.closePath();
  g.fillStyle = mix('#ECE6D2', '#FFFFFF', k); g.fill(); g.strokeStyle = k > 0.5 ? 'rgba(22,32,26,0.75)' : INK; g.lineWidth = lerp(1.5, 1.2, k); g.stroke();
  g.fillStyle = `rgba(160,170,180,${0.35 * (1 - k)})`; g.fillRect(-L + R, R * 0.1, len - 2 * R, R * 0.7);
  g.strokeStyle = `rgba(255,255,255,${0.9})`; g.lineWidth = Math.max(1, R * 0.35); g.beginPath(); g.moveTo(-L + R * 1.2, -R * 0.45); g.lineTo(L - R * 1.4, -R * 0.45); g.stroke();
  g.restore();
}
function heapPts(n, rx, h, seed) { const q = rng(seed), p = []; for (let i = 0; i < n; i++) { const u = q() * 2 - 1, v = q(); p.push([u * rx, -v * h * (1 - u * u * 0.85), q() * 3.14, q()]); } return p.sort((a, b) => a[1] - b[1]).reverse(); }
const DRY = heapPts(95, 120, 70, 3), COOK = heapPts(140, 175, 105, 4);
function dryHeap(g, cx, cy, s, a, jit) { DRY.forEach(([x, y, r, d], i) => { if (i / DRY.length > a) return; riceGrain(g, cx + x * s, cy + y * s, 26 * s, 8.5 * s, r, 0, jit); }); }
function cookedMound(g, cx, cy, s, a, jit) { COOK.forEach(([x, y, r, d], i) => { if (i / COOK.length > a) return; riceGrain(g, cx + x * s, cy + y * s, 34 * s, 12.5 * s, r, 1, jit); }); }
function dish(g, cx, cy, rx, jit) { softShadow(g, cx, cy + rx * 0.16, rx * 0.95, rx * 0.12, 0.22); const p = ell(cx, cy, rx, rx * 0.2, 0, 6.283, 48); g.fillStyle = '#FDFBF4'; poly(g, p); g.fill(); burin(g, p, 2.2, INK, 1, jit); burin(g, ell(cx, cy - 2, rx * 0.8, rx * 0.14, 0, 6.283, 40), 1, INK2, 1, jit); }
function bowl(g, cx, cy, rx, jit, fill, label) {
  const ry = rx * 0.2, depth = rx * 0.62; softShadow(g, cx, cy + depth + 14, rx * 0.72, rx * 0.08, 0.28);
  g.fillStyle = '#E9E3D3'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
  cookedMound(g, cx, cy - 2, rx / 190, fill, jit);
  const front = [...Array.from({ length: 31 }, (_, i) => { const a = Math.PI * (i / 30); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }), ...Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [lerp(cx - rx, cx + rx, t), cy + ry * 0.3 + depth * Math.pow(Math.sin(Math.PI * t), 0.6)]; }).reverse()];
  g.save(); poly(g, front); g.clip(); const bg = g.createLinearGradient(cx - rx, 0, cx + rx, 0); bg.addColorStop(0, BOWL_D); bg.addColorStop(0.35, BOWL); bg.addColorStop(0.62, '#4E9A2E'); bg.addColorStop(1, BOWL_D); g.fillStyle = bg; g.fillRect(cx - rx - 2, cy - ry, 2 * rx + 4, depth + ry * 2 + 4); g.fillStyle = 'rgba(255,255,240,0.22)'; g.beginPath(); g.ellipse(cx - rx * 0.45, cy + depth * 0.45, rx * 0.08, depth * 0.32, 0.25, 0, 7); g.fill(); g.restore();
  burin(g, front, 2.6, INK, 1, jit); g.strokeStyle = '#E9F3DC'; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, rx - 3, ry - 2, 0, 0.05, Math.PI - 0.05); g.stroke();
  if (label) text(g, label, cx, cy + depth * 0.62, `900 ${Math.round(rx * 0.24)}px NDisplay`, '#F4F9EE', 'center', 1, 'fig');
}
function steam(g, x0, y0, n, spread, f, a, jit) { if (a <= 0) return; for (let i = 0; i < n; i++) { const t = (f * 0.012 + i * 0.31) % 1, x = x0 - spread / 2 + (i * spread) / Math.max(1, n - 1); g.save(); g.globalAlpha *= a * Math.sin(Math.PI * t) * 0.85; burin(g, Array.from({ length: 12 }, (_, j) => [x + Math.sin(j * 0.7 + i * 1.7 + f * 0.04) * 12, y0 - t * 80 - j * 11]), 2.2, 'rgba(120,140,150,0.9)', 1, jit); g.restore(); } }
function drop(g, x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = WATERC; g.beginPath(); g.moveTo(x, y - r * 1.6); g.quadraticCurveTo(x + r * 1.1, y, x, y + r); g.quadraticCurveTo(x - r * 1.1, y, x, y - r * 1.6); g.fill(); g.strokeStyle = INK; g.lineWidth = Math.max(1.2, r * 0.06); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.25, r * 0.18, r * 0.32, -0.3, 0, 7); g.fill(); g.restore(); }
function splashFX(g, x, y, t) { if (t <= 0 || t >= 1) return; const a = 1 - t; g.save(); g.strokeStyle = `rgba(44,110,158,${0.9 * a})`; g.lineWidth = 5 * a + 1; g.beginPath(); g.ellipse(x, y, 40 + 160 * eo(t), 10 + 36 * eo(t), 0, 0, 7); g.stroke(); for (let i = 0; i < 12; i++) { const an = Math.PI + (i / 11) * Math.PI, d = 30 + 170 * eo(t); drop(g, x + Math.cos(an) * d, y + Math.sin(an) * d * 0.9 - 60 * Math.sin(Math.PI * t), 10 * a + 3, a); } g.restore(); }
function tag(g, x, y, head, num, col, a, ok = 0, bad = 0) {
  if (a <= 0) return; const sc = 0.7 + 0.3 * eo(clamp(a)); g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= clamp(a * 1.5);
  softShadow(g, 6, 70, 130, 18, 0.18); g.fillStyle = '#FFFCF2'; g.fillRect(-140, -90, 280, 180); g.fillStyle = col; g.fillRect(-140, -90, 280, 50);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(-140, -90, 280, 180);
  text(g, head, 0, -52, '900 34px NDisplay', '#FFFFFF', 'center', 3, 'fig'); text(g, num, 0, 34, '900 78px NDisplay', INK, 'center', 0, 'fig'); text(g, 'kcal / 100 g', 0, 72, '700 24px NText', INK2, 'center', 1, 'fig');
  if (ok > 0) { g.strokeStyle = `rgba(47,122,28,${ok})`; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(96, 40); g.lineTo(122, 70); g.lineTo(170, -6); g.stroke(); }
  if (bad > 0) { g.strokeStyle = `rgba(214,69,43,${bad})`; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(-150, -100); g.lineTo(150, 100); g.moveTo(150, -100); g.lineTo(-150, 100); g.stroke(); }
  g.restore();
}
function pot(g, cx, cy, rx, water, f, flame, jit, riceK, riceA) {
  const ry = rx * 0.22, h = rx * 0.9;
  if (flame > 0) { for (let i = 0; i < 7; i++) { const x = cx - rx * 0.6 + i * rx * 0.2, fh = (40 + 18 * Math.sin(f * 0.5 + i * 1.7)) * flame; g.fillStyle = `rgba(240,120,30,${0.85 * flame})`; g.beginPath(); g.moveTo(x - 12, cy + h + 28); g.quadraticCurveTo(x - 10, cy + h + 28 - fh * 0.6, x, cy + h + 28 - fh); g.quadraticCurveTo(x + 10, cy + h + 28 - fh * 0.6, x + 12, cy + h + 28); g.fill(); g.fillStyle = `rgba(80,140,230,${0.8 * flame})`; g.beginPath(); g.ellipse(x, cy + h + 24, 9, 6, 0, 0, 7); g.fill(); } }
  softShadow(g, cx, cy + h + 6, rx * 0.95, 14, 0.22);
  const body = [[cx - rx, cy], [cx - rx, cy + h - 20], [cx - rx + 20, cy + h], [cx + rx - 20, cy + h], [cx + rx, cy + h - 20], [cx + rx, cy]];
  g.save(); poly(g, body); g.clip(); const bg = g.createLinearGradient(cx - rx, 0, cx + rx, 0); bg.addColorStop(0, '#8E969C'); bg.addColorStop(0.3, '#E6EAEC'); bg.addColorStop(0.6, STEEL); bg.addColorStop(1, '#7E868C'); g.fillStyle = bg; g.fillRect(cx - rx, cy, 2 * rx, h); g.restore(); burin(g, body, 2.6, INK, 1, jit);
  for (const sd of [-1, 1]) { g.fillStyle = '#3B3F42'; g.fillRect(cx + sd * rx - (sd > 0 ? 0 : 50), cy + 20, 50, 18); }
  g.fillStyle = '#5D656B'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx - 8, ry - 4, 0, 0, 7); g.clip(); g.fillStyle = mix('#DCEEFA', WATERC, 0.6); g.globalAlpha *= clamp(water); g.fillRect(cx - rx, cy - ry, 2 * rx, 2 * ry); g.globalAlpha = 1;
  if (riceA > 0) { const q = rng(9); for (let i = 0; i < 46 * riceA; i++) riceGrain(g, cx + (q() - 0.5) * rx * 1.7, cy + (q() - 0.5) * ry * 1.6, lerp(22, 30, riceK), lerp(7, 11, riceK), q() * 3.14, riceK, jit); }
  g.restore(); burin(g, ell(cx, cy, rx, ry, 0, 6.283, 48), 2.4, INK, 1, jit);
}
function loupe(g, cx, cy, r, f, k, jit, a) {
  if (a <= 0) return; const sc = 0.6 + 0.4 * eo(clamp(a)); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.globalAlpha *= clamp(a * 1.6);
  softShadow(g, 8, 12, r, r, 0.2); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r - 6, 0, 7); g.clip(); g.fillStyle = `rgba(111,174,223,${0.25 + 0.2 * k})`; g.fillRect(-r, -r, 2 * r, 2 * r);
  riceGrain(g, 0, 0, lerp(150, 200, k), lerp(46, 72, k), -0.25, k, jit);
  for (let i = 0; i < 8; i++) { const an = (i / 8) * 6.283 + 0.3, t = (f * 0.03 + i / 8) % 1; const d = lerp(r * 0.95, r * 0.35, t); if (k > 0.02 && k < 0.98) drop(g, Math.cos(an) * d, Math.sin(an) * d, 12, (1 - t) * 0.9); }
  g.restore(); g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, r - 2, 0, 7); g.stroke(); g.strokeStyle = '#B8BEC2'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r - 2, 0, 7); g.stroke();
  g.fillStyle = '#3B3F42'; g.save(); g.rotate(0.8); g.fillRect(r - 4, -12, 110, 24); g.restore(); g.restore();
}
// ---------------- A: hook: dry rice | a water splash | cooked rice; 365 vs 130 per 100 g
function sceneHook(g, f, jit) {
  const sp = seg(f, E.splash, E.splash + 26);
  dish(g, 270, 1150, 205, jit); dryHeap(g, 270, 1146, 1.55, 1, jit);
  bowl(g, 790, 1080, 205, jit, 1, 'COOKED'); steam(g, 790, 965, 4, 200, f, 1, jit);
  bigLabel(g, 'DRY', 270, 1290, 64, INK, 1, 0);
  drop(g, 540, lerp(640, 1000, eio(seg(f, E.splash - 10, E.splash + 6))), 50, 1 - seg(f, E.splash + 4, E.splash + 8)); splashFX(g, 540, 1010, sp);
  if (sp >= 1) drop(g, 540, 900 + 12 * Math.sin(f * 0.15), 44, seg(f, E.splash + 26, E.splash + 34));
  const n1 = seg(f, E.n365, E.n365 + 10), n2 = seg(f, E.n130, E.n130 + 10);
  drawRoundel(g, 270, 760, 138, '365', 'kcal / 100 g', '#8A4E1C', n1 + (f > E.n365 + 10 ? 1 : 0), jit);
  drawRoundel(g, 790, 730, 138, '130', 'kcal / 100 g', LEAFDARK, n2 + (f > E.n130 + 10 ? 1 : 0), jit);
}
// ---------------- B: super hook: did cooking burn calories off? a pot on a flame, the 365 roundel hovering with a "?"
function sceneQuestion(g, f, jit) {
  const a = seg(f, E.pot, E.pot + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  pot(g, 540, 1020, 300, 1, f, 1, jit, 0, 0); steam(g, 540, 975, 5, 360, f, 1, jit);
  const fl = seg(f, E.pot, E.pot + 30); drawRoundel(g, 540, lerp(640, 760, eo(fl)) + 8 * Math.sin(f * 0.2), 125, '365', 'kcal / 100 g', '#8A4E1C', 1, jit);
  bigLabel(g, '?', 820, 760, 190, RED, seg(f, E.q - 6, E.q + 4), 0.12); g.restore();
}
// ---------------- C: build-up: 50 g dry rice on the scale -> into the pot -> grains drink water and swell -> 140 g cooked on the scale
function sceneCook(g, f, jit) {
  const a = seg(f, E.scale50 - 4, E.scale50 + 8); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const pr = seg(f, E.pour, E.pour + 16), sw = eio(seg(f, E.swell, E.weigh140 - 6)), back = eo(seg(f, E.weigh140 - 8, E.weigh140 + 8));
  /* the scale (left) */
  const grams = f < E.pour ? 50 * eo(seg(f, E.scale50, E.scale50 + 12)) : f < E.weigh140 - 4 ? null : 140 * back;
  drawScale(g, 300, 1160, 340, grams, jit, seg(f, E.weigh140 + 6, E.weigh140 + 12) * (1 - seg(f, E.weigh140 + 24, E.weigh140 + 36)));
  if (f < E.pour + 8) { const lift = pr; g.save(); g.translate(lerp(0, 330, eo(lift)), lerp(0, -220, eo(lift))); g.rotate(0.5 * eo(lift)); dish(g, 300, 1120, 150, jit); dryHeap(g, 300, 1116, 1.05, 1, jit); g.restore(); }
  if (back > 0) { dish(g, 300, 1120, 160, jit); g.save(); cookedMound(g, 300, 1116, 0.8, back, jit); g.restore(); }
  /* the pot (right) */
  const potA = 1 - seg(f, E.weigh140 + 20, E.weigh140 + 40);
  if (potA > 0) { g.save(); g.globalAlpha *= potA; pot(g, 720, 930, 210, 1 - 0.85 * sw, f, f > E.pour ? 1 : 0.3, jit, sw, f > E.pour + 8 ? 1 - back : 0); steam(g, 720, 890, 4, 260, f, sw * (1 - back), jit); g.restore(); }
  loupe(g, 760, 680, 150, f, sw, jit, seg(f, E.swell, E.swell + 10) * (1 - seg(f, E.weigh140 - 4, E.weigh140 + 6)));
  const L = (s0, s1) => seg(f, s0, s0 + 8) * (1 - seg(f, s1 - 6, s1));
  bigLabel(g, '50 g DRY', 300, 700, 72, '#8A4E1C', L(E.scale50 + 6, E.pour + 4), 0);
  bigLabel(g, '+ ≈ 90 g WATER', 385, 700, 56, BLUE, L(E.w90, E.weigh140), 0);
  bigLabel(g, '≈ 140 g COOKED', 385, 700, 56, LEAFDARK, seg(f, E.weigh140 + 4, E.weigh140 + 12), 0);
  g.restore();
}
// ---------------- D: proof: same ≈ 180 kcal before and after; water adds grams, 0 kcal; spread over more grams -> 365 vs 130 per 100 g
function sceneProof(g, f, jit) {
  const a = seg(f, E.proof, E.proof + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  drawScale(g, 270, 1110, 300, 50, jit, 0); dish(g, 270, 1070, 140, jit); dryHeap(g, 270, 1066, 0.95, 1, jit);
  drawScale(g, 800, 1110, 300, 140, jit, 0); dish(g, 800, 1070, 160, jit); cookedMound(g, 800, 1066, 0.78, 1, jit);
  const w = seg(f, E.proof + 8, E.proof + 26); if (w > 0) { g.save(); g.globalAlpha *= w; g.strokeStyle = BLUE; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(420, 900); g.quadraticCurveTo(535, 820, lerp(420, 650, eo(w)), 900); g.stroke(); g.restore(); drop(g, 535, 830 + 6 * Math.sin(f * 0.2), 30, w); }
  bigLabel(g, '+ 90 g', 535, 950, 52, BLUE, seg(f, E.proof + 16, E.proof + 24), 0);
  bigLabel(g, '+ 0 kcal', 535, 1010, 52, RED, seg(f, E.zeroKcal, E.zeroKcal + 8), 0);
  const k = seg(f, E.kcal180, E.kcal180 + 10);
  drawRoundel(g, 270, 700, 105, '≈ 180', 'kcal', GOLD, k + (f > E.kcal180 + 10 ? 1 : 0), jit); drawRoundel(g, 800, 700, 105, '≈ 180', 'kcal', GOLD, seg(f, E.kcal180 + 4, E.kcal180 + 14) + (f > E.kcal180 + 14 ? 1 : 0), jit);
  const sp = seg(f, E.spread, E.spread + 10); if (sp > 0) { bigLabel(g, '365 / 100 g', 270, 1340, 54, '#8A4E1C', sp, 0); bigLabel(g, '130 / 100 g', 800, 1340, 54, LEAFDARK, seg(f, E.spread + 6, E.spread + 16), 0); }
  g.restore();
}
// ---------------- E: payoff 1: the mix-up: 140 g cooked weighed, dry label used -> ≈ 511 kcal, nearly 3× too much
function sceneMistake(g, f, jit) {
  const a = seg(f, E.mistake, E.mistake + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  drawScale(g, 380, 1150, 380, 140, jit, 0); bowl(g, 380, 1000, 210, jit, 1, 'COOKED');
  const dt = seg(f, E.dryTag, E.dryTag + 12); tag(g, lerp(870, 820, eo(dt)), 720, 'DRY', '365', '#8A4E1C', dt, 0, seg(f, E.x3 + 14, E.x3 + 22));
  const wr = seg(f, E.wrong, E.wrong + 10); drawRoundel(g, 820, 1040, 120, '≈ 511', 'kcal', RED, wr + (f > E.wrong + 10 ? 1 : 0), jit);
  bigLabel(g, '≈ 3× TOO MUCH', 540, 1380, 76, RED, seg(f, E.x3, E.x3 + 8), -0.04);
  g.restore();
}
// ---------------- F: payoff 2: match the label to the state on the scale
function sceneRule(g, f, jit) {
  const a = seg(f, E.rule, E.rule + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  drawScale(g, 270, 1060, 280, 50, jit, seg(f, E.dryOk, E.dryOk + 6) * (1 - seg(f, E.dryOk + 20, E.dryOk + 30))); dish(g, 270, 1020, 130, jit); dryHeap(g, 270, 1016, 0.9, 1, jit);
  drawScale(g, 800, 1060, 280, 140, jit, seg(f, E.cookOk, E.cookOk + 6) * (1 - seg(f, E.cookOk + 20, E.cookOk + 30))); dish(g, 800, 1020, 150, jit); cookedMound(g, 800, 1016, 0.72, 1, jit);
  tag(g, 270, 740, 'DRY', '365', '#8A4E1C', seg(f, E.rule + 6, E.rule + 16), seg(f, E.dryOk, E.dryOk + 8), 0);
  tag(g, 800, 740, 'COOKED', '130', LEAFDARK, seg(f, E.rule + 10, E.rule + 20), seg(f, E.cookOk, E.cookOk + 8), 0);
  g.restore();
}
function camera2(f) {
  const keys = [[0, 1.1, 540, 950], [80, 1.0, 540, 1010], [124, 1.0, 540, 1010], [176, 1.05, 540, 990, 1], [190, 1.0, 540, 1010], [372, 1.04, 540, 1000, 1], [386, 1.0, 540, 1010], [529, 1.04, 540, 1000, 1], [543, 1.0, 540, 1010], [667, 1.04, 540, 1000, 1], [681, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + 0.025 * Math.exp(-(((f - E.splash - 6) / 5) ** 2)) + 0.02 * Math.exp(-(((f - E.weigh140) / 4) ** 2)) + 0.025 * Math.exp(-(((f - E.wrong) / 4) ** 2));
  return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)) * kick, x: lerp(x0, x1, t), y: lerp(y0, y1, t) };
}
// ---------------- paper, camera, captions, CTA (unchanged from the accepted English episodes)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
function camera(f) { const keys = [[0, 1.18, 540, 870], [100, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [780, 1.02, 540, 1006], [900, 1.045, 540, 1004]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const u = seg(f, f0, f1); /* the closing push-in on the CTA eases in and keeps moving to the last frame */ const t = k === keys.length - 2 ? u : k === keys.length - 3 ? (u < 0.3 ? (u * u) / 0.6 : u - 0.15) / 0.85 : eio(u); /* from 23.3 s a slow push toward the snack dishes runs on into the CTA */ return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
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
function drawCard() { for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(40,30,15,0.035)'; g.fillRect(62 - i * 2 + 6, 528 - i * 2 + 10, 956 + i * 4, 984 + i * 4); } g.fillStyle = CARD; g.fillRect(62, 528, 956, 984); }
const SCENES = [[sceneHook, null, 'burnish'], [sceneQuestion, 'burnish', 'burnish2'], [sceneCook, 'burnish2', 'burnish3'], [sceneProof, 'burnish3', 'burnish4'], [sceneMistake, 'burnish4', 'burnish5'], [sceneRule, 'burnish5', null]];
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
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.drawImage(grain, 0, 0);
  const glow = g.createRadialGradient(540, 980, 20, 540, 1000, 760); glow.addColorStop(0, 'rgba(111,174,223,0.35)'); glow.addColorStop(1, 'rgba(111,174,223,0)'); g.fillStyle = glow; g.fillRect(0, 300, W, 1400);
  text(g, 'WATER', 540, 430, '900 170px NDisplay', BLUE, 'center', -2, 'thumb'); text(g, 'CHANGED THE', 540, 560, '900 100px NDisplay', INK, 'center', -1, 'thumb'); text(g, 'NUMBER', 540, 700, '900 140px NDisplay', INK, 'center', -2, 'thumb');
  dish(g, 290, 1420, 215, jit); dryHeap(g, 290, 1416, 1.6, 1, jit); bowl(g, 790, 1330, 230, jit, 1, '');
  drawRoundel(g, 290, 1060, 140, '365', 'kcal / 100 g', '#8A4E1C', 1, jit); drawRoundel(g, 790, 990, 140, '130', 'kcal / 100 g', LEAFDARK, 1, jit);
  for (let i = 0; i < 9; i++) { const an = Math.PI + (i / 8) * Math.PI; drop(g, 545 + Math.cos(an) * 120, 1180 + Math.sin(an) * 70, 9, 0.8); } drop(g, 545, 1070, 56, 1);
  g.strokeStyle = BLUE; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(440, 1110); g.quadraticCurveTo(560, 1180, 660, 1060); g.stroke(); g.beginPath(); g.moveTo(660, 1060); g.lineTo(628, 1066); g.moveTo(660, 1060); g.lineTo(654, 1092); g.stroke();
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
