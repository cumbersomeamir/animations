// CalMeter English 30 s english-18 (2026-11-15, batch 18): what's really inside a passion fruit, "JEWELS YOU CAN EAT".
// The requested "What is hiding inside a pomegranate?" was already production #03 (100 g of arils: 83 kcal, 4 g fibre, vitamin K),
// so a genuinely different same-genre story with the same hook and story criteria was chosen: the passion fruit (never covered), whose
// edible pulp is golden seed sacs ("jewels") inside a purple shell. Feedback 2026-11-15 applied: no cream card or boxed diagrams; every
// scene is full-frame on its own bright background (purple, amber, coral, green, violet), one big engraved hero per scene with a real
// transformation (fruit split open, pulp scooped onto a scale, a spoonful lifted from a 100 g bowl, a giant seed-sac close-up, an apple
// for scale, the fruit splitting again), one nutrient reveal at a time, large bright outlined typography, white outlined captions.
// Frame 0 is the thumbnail composition. Original Canvas2D code (no Three.js). Stop motion 15 drawings/s.
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
// ---------------- full-frame bright scenes (no card): each scene paints its own full-bleed background; engraved objects on top
const PURPLE = '#6E2280', PURPLE_D = '#2E0A38', GOLD_P = '#F2B12C', YELLOW = '#FFD84D', CREAM = '#FFF4DA', OUTLINE = '#22081E', WHITE = '#FFFFFF', FIBRE_G = '#2F7A1C', CORAL_D = '#8E1C26';
function softGlow(g, x, y, r, rgb, a) { if (a <= 0) return; const gg = g.createRadialGradient(x, y, 4, x, y, r); gg.addColorStop(0, `rgba(${rgb},${a})`); gg.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function sparkle(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = '#FFFFFF'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - r * 0.5, y - r * 0.5); g.lineTo(x + r * 0.5, y + r * 0.5); g.moveTo(x + r * 0.5, y - r * 0.5); g.lineTo(x - r * 0.5, y + r * 0.5); g.stroke(); g.restore(); }
const bounce = (t) => { if (t >= 1) return 1; const u = eo(clamp(t / 0.75)); return t < 0.75 ? u : 1 - 0.06 * Math.sin(Math.PI * (t - 0.75) / 0.25); };
function bg(g, inner, outer, cx = 540, cy = 1000) {
  /* full-bleed radial background, painted past the frame edges so camera moves never show an edge */
  const gr = g.createRadialGradient(cx, cy, 60, cx, cy, 1250); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(-300, -300, W + 600, H + 600);
}
function label(g, s, x, y, px, fill, a, rot = 0, stroke = OUTLINE) {
  /* large bright display type with a dark outline and a soft drop shadow (no box); pops in with a = 0..1 */
  if (a <= 0) return; const sc = 0.72 + 0.28 * eo(clamp(a)) + 0.06 * Math.sin(Math.PI * clamp(a * 1.25)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= clamp(a * 1.5);
  g.font = `900 ${px}px NDisplay`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(20,4,18,0.35)'; g.fillText(s, 6, 8); g.strokeStyle = stroke; g.lineWidth = Math.max(6, px * 0.13); g.strokeText(s, 0, 0);
  text(g, s, 0, 0, `900 ${px}px NDisplay`, fill, 'center', 0, 'fig'); g.restore();
}
// passion fruit geometry: seed sacs (arils) in a unit disc, sorted back to front
const SACS = (() => { const q = rng(11), s = []; let tries = 0; while (s.length < 74 && tries < 4000) { tries++; const a = q() * 6.283, rr = Math.sqrt(q()) * 0.86, u = Math.cos(a) * rr, v = Math.sin(a) * rr; if (s.some(([x, y]) => (x - u) ** 2 + (y - v) ** 2 < 0.0095)) continue; s.push([u, v, 0.85 + q() * 0.35, q() * 6.283]); } return s.sort((a, b) => a[1] - b[1]); })();
function sac(g, x, y, rx, rot, glint = 0) {
  /* one glossy golden seed sac (aril) with its dark seed inside */
  const ry = rx * 1.25; g.save(); g.translate(x, y); g.rotate(rot);
  const gr = g.createRadialGradient(-rx * 0.3, -ry * 0.3, 1, 0, 0, ry * 1.1); gr.addColorStop(0, '#FFF2A8'); gr.addColorStop(0.55, '#F7C238'); gr.addColorStop(1, '#D7861A'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(30,14,10,0.92)'; g.beginPath(); g.ellipse(rx * 0.08, ry * 0.12, rx * 0.46, ry * 0.5, 0.2, 0, 7); g.fill();
  g.strokeStyle = 'rgba(120,60,10,0.75)'; g.lineWidth = Math.max(0.8, rx * 0.08); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
  g.fillStyle = `rgba(255,255,255,${0.75 + 0.25 * glint})`; g.beginPath(); g.ellipse(-rx * 0.38, -ry * 0.45, rx * 0.2, ry * 0.12, -0.5, 0, 7); g.fill(); g.restore();
}
function fruitHalf(g, cx, cy, r, rot, pulp, f, jit, tilt = 0.9) {
  /* a passion fruit cut in half, cut face toward the viewer (ellipse squash = tilt): purple shell, cream pith, golden pulp full of sacs; pulp 0..1 */
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(1, tilt);
  softShadow(g, 18, r * 1.08, r * 0.95, r * 0.18, 0.28);
  const sh = g.createRadialGradient(-r * 0.2, r * 0.25, r * 0.2, 0, r * 0.12, r * 1.2); sh.addColorStop(0, '#8F3AA3'); sh.addColorStop(0.7, '#4E1260'); sh.addColorStop(1, '#260630'); g.fillStyle = sh; g.beginPath(); g.ellipse(0, r * 0.13, r * 1.02, r * 1.0, 0, 0, 7); g.fill();
  const q = rng(Math.round(r * 7)); g.fillStyle = 'rgba(230,180,240,0.55)'; for (let i = 0; i < 26; i++) { const a = Math.PI * (0.05 + 0.9 * q()), rr = r * (0.98 + 0.02 * q()); g.beginPath(); g.arc(Math.cos(a) * rr * 0.98, r * 0.13 + Math.sin(a) * rr * 0.98, 2.5 + q() * 2, 0, 7); g.fill(); }
  g.fillStyle = '#5A1A6C'; g.beginPath(); g.ellipse(0, 0, r, r, 0, 0, 7); g.fill();
  g.fillStyle = CREAM; g.beginPath(); g.ellipse(0, 0, r * 0.93, r * 0.93, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(160,110,60,0.35)'; g.lineWidth = 1.4; g.beginPath(); for (let i = 0; i < 40; i++) { const a = (i / 40) * 6.283; g.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); g.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); } g.stroke();
  const inner = r * 0.8;
  if (pulp <= 0.02) { const pg = g.createRadialGradient(0, -inner * 0.3, 4, 0, 0, inner); pg.addColorStop(0, '#FBEBC8'); pg.addColorStop(1, '#D9BE8A'); g.fillStyle = pg; g.beginPath(); g.ellipse(0, 0, inner, inner, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(140,100,50,0.35)'; g.lineWidth = 1.2; for (let k = 1; k < 4; k++) { g.beginPath(); g.ellipse(0, inner * 0.08 * k, inner * (1 - 0.18 * k), inner * (1 - 0.18 * k), 0, 0, 7); g.stroke(); } }
  else {
    g.save(); g.beginPath(); g.ellipse(0, 0, inner, inner, 0, 0, 7); g.clip();
    const pg = g.createRadialGradient(-inner * 0.3, -inner * 0.3, 4, 0, 0, inner); pg.addColorStop(0, '#FFE070'); pg.addColorStop(1, '#E39A1E'); g.fillStyle = pg; g.fillRect(-inner, -inner, 2 * inner, 2 * inner);
    const lim = Math.sqrt(clamp(pulp)); for (const [u, v, s, a] of SACS) { if (Math.hypot(u, v) > lim * 0.95) continue; sac(g, u * inner * 1.05, v * inner * 1.05, inner * 0.085 * s, a, Math.abs(Math.sin(f * 0.15 + u * 9 + v * 5))); }
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(-inner * 0.35, -inner * 0.45, inner * 0.45, inner * 0.18, -0.5, 0, 7); g.fill(); g.restore();
  }
  burin(g, ell(0, 0, r, r, 0, 6.283, 60), 3, OUTLINE, 1, jit); burin(g, ell(0, r * 0.13, r * 1.02, r * 1.0, 0.05, Math.PI - 0.05, 40), 3, OUTLINE, 1, jit);
  g.restore();
}
function wholeFruit(g, cx, cy, r, rot, f, jit) {
  /* an intact purple passion fruit: glossy, speckled, a few wrinkles, short stem */
  g.save(); g.translate(cx, cy); g.rotate(rot); softShadow(g, 16, r * 1.02, r * 0.9, r * 0.16, 0.3);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r * 1.1); gr.addColorStop(0, '#C77BD6'); gr.addColorStop(0.35, '#7E2B92'); gr.addColorStop(0.8, '#45104F'); gr.addColorStop(1, '#2A0632'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r, r * 0.96, 0, 0, 7); g.fill();
  const q = rng(Math.round(r * 3)); g.fillStyle = 'rgba(235,190,245,0.55)'; for (let i = 0; i < 70; i++) { const a = q() * 6.283, rr = Math.sqrt(q()) * r * 0.92; g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.96, 2 + q() * 2.4, 0, 7); g.fill(); }
  for (let k = 0; k < 4; k++) burin(g, ell(-r * 0.1 + k * r * 0.12, r * 0.1, r * (0.75 - k * 0.12), r * (0.6 - k * 0.1), 0.2, 2.4, 24), 1.4, 'rgba(25,0,30,0.45)', 1, jit);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.45, r * 0.24, r * 0.12, -0.6, 0, 7); g.fill();
  g.fillStyle = '#7A8B3A'; g.beginPath(); g.moveTo(-6, -r * 0.94); g.lineTo(6, -r * 0.94); g.lineTo(10, -r * 1.12); g.lineTo(-2, -r * 1.14); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2; g.stroke();
  burin(g, ell(0, 0, r, r * 0.96, 0, 6.283, 64), 3.2, OUTLINE, 1, jit); g.restore();
}
function glassBowl(g, cx, cy, rx, fill, f, jit, sacScale = 1) {
  /* a small glass bowl seen from the front; fill 0..1 of golden pulp with sacs */
  const ry = rx * 0.32, depth = rx * 0.62; softShadow(g, cx + 10, cy + depth + 8, rx * 1.05, rx * 0.12, 0.28);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); g.fill();
  if (fill > 0) { const top = cy + depth * (1 - fill) * 0.8; g.save(); g.beginPath(); g.ellipse(cx, cy, rx * 0.97, ry, 0, 0, Math.PI); g.lineTo(cx - rx * 0.97, cy); g.closePath(); g.rect(cx - rx, cy - ry, 2 * rx, ry); g.clip();
    const pg = g.createLinearGradient(cx, top - ry, cx, cy + depth); pg.addColorStop(0, '#FFD45A'); pg.addColorStop(1, '#D98A16'); g.fillStyle = pg; g.beginPath(); g.ellipse(cx, top, rx * 0.95, ry * 0.9, 0, 0, 7); g.fill(); g.fillRect(cx - rx, top, 2 * rx, depth + ry);
    const q = rng(Math.round(rx)); for (let i = 0; i < 26; i++) { const u = q() * 2 - 1, v = q(); sac(g, cx + u * rx * 0.82, top + (v - 0.5) * ry * 1.4, rx * 0.075 * sacScale, q() * 6.28, Math.abs(Math.sin(f * 0.13 + i))); } g.restore(); }
  const front = [...Array.from({ length: 31 }, (_, i) => { const a = Math.PI * (i / 30); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }), ...Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [lerp(cx - rx, cx + rx, t), cy + ry * 0.3 + depth * Math.pow(Math.sin(Math.PI * t), 0.55)]; }).reverse()];
  g.save(); poly(g, front); g.clip(); g.fillStyle = 'rgba(210,240,255,0.25)'; g.fillRect(cx - rx, cy - ry, 2 * rx, depth + 2 * ry); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(cx - rx * 0.7, cy, rx * 0.12, depth); g.restore();
  burin(g, front, 2.6, OUTLINE, 1, jit); g.strokeStyle = OUTLINE; g.lineWidth = 2.4; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke();
}
function spoonful(g, cx, cy, s, rot, jit) {
  /* a teaspoon holding one fruit's pulp (18 g) */
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(s, s); softShadow(g, 10, 60, 130, 16, 0.25);
  g.fillStyle = '#C9CED2'; g.beginPath(); g.moveTo(90, -8); g.quadraticCurveTo(220, -18, 330, -12); g.lineTo(332, 8); g.quadraticCurveTo(220, 6, 90, 12); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2.4; g.stroke();
  const gr = g.createLinearGradient(-110, -60, 110, 60); gr.addColorStop(0, '#F4F6F7'); gr.addColorStop(1, '#8E969C'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 110, 66, 0, 0, 7); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.ellipse(0, -6, 96, 54, 0, 0, 7); g.clip(); g.fillStyle = '#F2B12C'; g.fillRect(-100, -60, 200, 120); const q = rng(5); for (let i = 0; i < 12; i++) sac(g, (q() - 0.5) * 160, (q() - 0.5) * 70 - 8, 11, q() * 6.28, 0.5); g.restore();
  g.restore();
}
function apple(g, cx, cy, r, jit) {
  /* an engraved red apple with leaf */
  g.save(); g.translate(cx, cy); softShadow(g, 12, r * 0.98, r * 0.9, r * 0.15, 0.28);
  const body = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * 6.283; const k = 1 - 0.12 * Math.pow(Math.max(0, -Math.sin(a)), 6) - 0.05 * Math.pow(Math.max(0, Math.sin(a)), 4); body.push([Math.cos(a) * r * k * 1.04, Math.sin(a) * r * 0.95 * k]); }
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.1); gr.addColorStop(0, '#FF8A7A'); gr.addColorStop(0.45, '#E3312E'); gr.addColorStop(1, '#8E1320'); g.fillStyle = gr; poly(g, body); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.4, r * 0.2, r * 0.1, -0.6, 0, 7); g.fill();
  g.strokeStyle = '#5B3A1E'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * 0.72); g.quadraticCurveTo(6, -r * 1.0, 18, -r * 1.12); g.stroke();
  g.fillStyle = '#5CB83A'; g.beginPath(); g.moveTo(14, -r * 0.98); g.quadraticCurveTo(r * 0.5, -r * 1.25, r * 0.62, -r * 0.92); g.quadraticCurveTo(r * 0.3, -r * 0.82, 14, -r * 0.98); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2; g.stroke();
  burin(g, [...body, body[0]], 3, OUTLINE, 1, jit); g.restore();
}
function aril(g, cx, cy, s, f, jit) {
  /* a giant close-up of one seed sac: translucent golden jelly around a pitted black seed */
  g.save(); g.translate(cx, cy); g.scale(s, s); softGlow(g, 0, 0, 320, '255,230,120', 0.45); softShadow(g, 20, 250, 190, 30, 0.25);
  const shape = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * 6.283; const k = 1 + 0.06 * Math.sin(3 * a + 0.4) + 0.1 * Math.max(0, -Math.sin(a)) ** 3; shape.push([Math.cos(a) * 190 * k, Math.sin(a) * 235 * k]); }
  const gr = g.createRadialGradient(-60, -80, 10, 0, 0, 260); gr.addColorStop(0, 'rgba(255,248,190,0.98)'); gr.addColorStop(0.5, 'rgba(250,200,60,0.95)'); gr.addColorStop(1, 'rgba(214,128,20,0.98)'); g.fillStyle = gr; poly(g, shape); g.fill();
  g.save(); poly(g, shape); g.clip(); g.strokeStyle = 'rgba(255,255,220,0.35)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(0, 20, 60 + i * 16, 80 + i * 18, 0.2, -2.2, -0.9); g.stroke(); } g.restore();
  g.save(); g.rotate(0.25); const sg = g.createRadialGradient(-20, -30, 4, 0, 0, 120); sg.addColorStop(0, '#4A3A30'); sg.addColorStop(1, '#0E0806'); g.fillStyle = sg; g.beginPath(); g.ellipse(10, 30, 82, 112, 0, 0, 7); g.fill();
  const q = rng(9); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 40; i++) { const a = q() * 6.283, rr = Math.sqrt(q()); g.beginPath(); g.arc(10 + Math.cos(a) * rr * 70, 30 + Math.sin(a) * rr * 98, 3 + q() * 3, 0, 7); g.fill(); }
  g.restore();
  burin(g, [...shape, shape[0]], 3.4, 'rgba(110,55,5,0.9)', 1, jit);
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(-80, -120, 34, 16, -0.6, 0, 7); g.fill(); g.beginPath(); g.ellipse(-112, -60, 10, 22, -0.3, 0, 7); g.fill();
  sparkle(g, -70, -150, 18, Math.abs(Math.sin(f * 0.12)));
  g.restore();
}
// ---------------- A: frame 0 = the thumbnail: a passion fruit split open, golden seed sacs spilling like jewels, "JEWELS YOU CAN EAT"
const FLOAT = [[548, 935, 38, 0.4], [622, 1050, 30, 1.8], [470, 1060, 26, 2.6], [690, 930, 24, 0.9], [540, 1205, 30, 3.4], [420, 900, 22, 5.0]];
function hookComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 20 : f;
  bg(g, '#A23FB8', PURPLE_D, 540, 1140); softGlow(g, 540, 1160, 600, '255,200,80', 0.45);
  fruitHalf(g, 318, 1200, 300, -0.22, 1, ph, jit, 0.92); fruitHalf(g, 790, 1262, 262, 0.28, 1, ph + 40, jit, 0.9);
  for (const [x, y, r, a] of FLOAT) { const bob = Math.sin(ph * 0.06 + a) * 10; sac(g, x, y + bob, r, a + ph * 0.01, 1); }
  for (let i = 0; i < 6; i++) { const q = rng(i * 13 + 2); sparkle(g, 200 + q() * 680, 940 + q() * 520, 14 + q() * 10, Math.abs(Math.sin(ph * 0.11 + i * 1.3))); }
  if (words > 0) { label(g, 'JEWELS', 540, 700, 172, YELLOW, words, -0.02); label(g, 'YOU CAN EAT', 540, 826, 104, WHITE, words, -0.02); }
}
function sceneHook(g, f, jit) { hookComposition(g, f, jit, 1 - seg(f, E.hookOut - 4, E.hookOut + 6)); /* the frame-0 headline carries the first spoken words; captions take over at "what's" */ }
// ---------------- B: about half is shell; one fruit gives just 18 g of pulp and seeds
function sceneShell(g, f, jit) {
  bg(g, '#FFC85A', '#D9641A', 540, 1050);
  const sc = seg(f, E.scoop, E.scoop + 30), arc = eo(sc);
  fruitHalf(g, 320, 1100, 230, -0.1, 1 - sc, f, jit, 0.92);
  const v = f < E.g18 ? null : Math.round(18 * eo(seg(f, E.g18, E.g18 + 22)));
  drawScale(g, 775, 1235, 360, v, jit, seg(f, E.g18 + 20, E.g18 + 26) * (1 - seg(f, E.g18 + 40, E.g18 + 50)));
  glassBowl(g, 775, 1140, 165, eo(seg(f, E.scoop + 18, E.scoop + 34)) * 0.9, f, jit, 1.2);
  if (sc > 0 && sc < 1) { const x = lerp(320, 775, arc), y = lerp(1080, 1120, arc) - Math.sin(Math.PI * arc) * 300; g.save(); g.translate(x, y); g.fillStyle = '#F2B12C'; g.beginPath(); g.ellipse(0, 0, 70, 46, 0, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2.4; g.stroke(); const q = rng(3); for (let i = 0; i < 9; i++) sac(g, (q() - 0.5) * 100, (q() - 0.5) * 50, 12, q() * 6.28, 1); g.restore(); }
  label(g, '½ SHELL', 348, 760, 96, WHITE, seg(f, E.half, E.half + 10), -0.03);
  label(g, 'PULP', 775, 760, 104, YELLOW, seg(f, E.pulp, E.pulp + 10), 0.03);
}
// ---------------- C: per 100 g, 97 kcal; one fruit about 17
function sceneEnergy(g, f, jit) {
  bg(g, '#FF8A5C', '#A8202E', 540, 1050);
  const sp = seg(f, E.spoon - 10, E.spoon + 16);
  glassBowl(g, 400, 1140, 270, 0.92, f, jit, 1.0); label(g, '100 g', 400, 1430, 80, WHITE, seg(f, E.per100, E.per100 + 10), 0);
  if (sp > 0) { const x = lerp(470, 790, eo(sp)), y = lerp(1120, 1030, eo(sp)) - Math.sin(Math.PI * clamp(sp)) * 120; spoonful(g, x, y, 0.95, -0.12, jit); label(g, '1 FRUIT', 800, 1250, 72, YELLOW, seg(f, E.spoon + 10, E.spoon + 20), 0); }
  drawRoundel(g, 330, 790, 132, '97', 'kcal / 100 g', CORAL_D, seg(f, E.k97, E.k97 + 10) + (f > E.k97 + 10 ? 1 : 0), jit); burstFX(g, 330, 790, seg(f, E.k97, E.k97 + 16), 132, 200);
  drawRoundel(g, 790, 790, 132, '≈ 17', 'kcal / fruit', CORAL_D, seg(f, E.k17, E.k17 + 10) + (f > E.k17 + 10 ? 1 : 0), jit);
}
// ---------------- D: the seeds are eaten too; the pulp carries 10 g of fibre per 100 g, four times an apple
function sceneFibre(g, f, jit) {
  bg(g, '#9BE06A', '#1F6A1E', 540, 1050);
  const mv = eo(seg(f, E.apple - 10, E.apple + 8));
  aril(g, lerp(540, 330, mv), lerp(1110, 1140, mv) + Math.sin(f * 0.06) * 8, lerp(1.25, 0.82, mv), f, jit);
  label(g, 'SEEDS TOO', 540, 760, 104, WHITE, seg(f, E.seeds, E.seeds + 10) * (1 - seg(f, E.k10 - 8, E.k10 - 2)), -0.02);
  drawRoundel(g, mv > 0 ? lerp(540, 330, mv) : 540, 790, 136, '10 g', 'fibre / 100 g', FIBRE_G, seg(f, E.k10, E.k10 + 10) + (f > E.k10 + 10 ? 1 : 0), jit); burstFX(g, 540, 790, seg(f, E.k10, E.k10 + 16), 136, 210);
  if (mv > 0) { g.save(); g.globalAlpha *= mv; apple(g, 795, 1170, 175 * (0.7 + 0.3 * mv), jit); g.restore(); drawRoundel(g, 795, 820, 100, '2.4 g', 'fibre / 100 g', '#B8262E', seg(f, E.apple + 4, E.apple + 14) + (f > E.apple + 14 ? 1 : 0), jit); }
  label(g, '× 4', 565, 1000, 120, YELLOW, seg(f, E.x4, E.x4 + 10), -0.05);
}
// ---------------- E: one fruit adds about 17 kcal and 2 g of fibre; log the pulp, not the shell
function scenePayoff(g, f, jit) {
  bg(g, '#B45CC9', '#320A3E', 540, 1050); softGlow(g, 540, 1080, 420, '255,210,110', 0.3);
  const op = eo(seg(f, E.logIt - 4, E.logIt + 16));
  if (op < 0.02) wholeFruit(g, 540, 1050, 245, Math.sin(f * 0.03) * 0.06, f, jit);
  else { fruitHalf(g, lerp(540, 360, op), 1060, 205, -0.15 * op, 1, f, jit, 0.92); fruitHalf(g, lerp(540, 720, op), 1070, 205, 0.18 * op, 0, f, jit, 0.92); }
  drawRoundel(g, 320, 790, 124, '≈ 17', 'kcal / fruit', '#7A2690', seg(f, E.k17b, E.k17b + 10) + (f > E.k17b + 10 ? 1 : 0), jit);
  drawRoundel(g, 760, 790, 124, '≈ 2 g', 'fibre / fruit', FIBRE_G, seg(f, E.k2, E.k2 + 10) + (f > E.k2 + 10 ? 1 : 0), jit);
  label(g, 'LOG THE PULP', 540, 1440, 88, YELLOW, seg(f, E.logIt, E.logIt + 10) * (1 - seg(f, E.cta - 4, E.cta + 4)), -0.02);
}
function camera2(f) {
  const keys = [[0, 1.0, 540, 1010], [96, 1.05, 540, 1000, 1], [110, 1.0, 540, 1010], [240, 1.04, 540, 1004, 1], [254, 1.0, 540, 1010], [400, 1.04, 540, 1004, 1], [414, 1.0, 540, 1010], [596, 1.04, 540, 1004, 1], [610, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + [E.g18, E.k97, E.k10, E.x4, E.k2].reduce((s, e) => s + 0.018 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)) * kick, x: lerp(x0, x1, t), y: lerp(y0, y1, t) };
}
function captions3(g, f) {
  /* captions on full-frame colour: white Inter Display Black with a dark outline, second line bright yellow; 64 px auto-fit in x 100-900 */
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out);
    c.lines.forEach(([s, f0], li) => { const a = seg(f, f0, f0 + 5) * (1 - out); if (a <= 0) return; let px = 64; g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > 740 && px > 44) { px -= 2; g.font = `900 ${px}px NDisplay`; }
      const y = (li === 0 ? 404 : 474) + 10 * (1 - eo(seg(f, f0, f0 + 6))); g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(25,6,24,0.92)'; g.lineWidth = 11; g.strokeText(s, 500, y); text(g, s, 500, y, `900 ${px}px NDisplay`, li === 0 ? WHITE : YELLOW, 'center', 0, 'caption'); g.restore(); });
  }
}
// ---------------- paper grain, CTA seal (white wordmark on colour), burnish wipe across the full frame
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
function drawCTA(g, f, jit) {
  const r = seg(f, E.cta, E.cta + 14); if (r <= 0) return;
  g.font = '900 76px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 58, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1352;
  softGlow(g, 540, cy, 380, '20,4,24', 0.32 * r);
  g.save(); g.globalAlpha = r; g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = WHITE; g.lineWidth = 3.4; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, R0 + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke();
  const wr = seg(f, E.ctaWord, E.ctaWord + 24), s = 'CalMeter';
  if (wr > 0) { const sub = s.slice(0, Math.ceil(s.length * wr)); g.save(); g.font = '900 76px NDisplay'; g.textAlign = 'left'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 11; g.strokeText(sub, cx + R0 + gap, cy + 27); g.restore(); text(g, sub, cx + R0 + gap, cy + 27, '900 76px NDisplay', WHITE, 'left', 0, 'cta'); }
  const rl = seg(f, E.ctaWord + 16, E.ctaWord + 40); if (rl > 0) burin(g, [[cx + R0 + gap, cy + 52], [cx + R0 + gap + ww * rl, cy + 52]], 2.6, YELLOW, 1, jit);
  const sh = seg(f, 832, 892); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 27, '900 76px NDisplay', YELLOW, 'left', 0, 'cta'); g.restore(); }
  const tk = seg(f, E.ctaWord + 26, E.ctaWord + 106); g.strokeStyle = WHITE; g.lineWidth = 1.3; for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
const sweep = (f, t0) => { const b = seg(f, t0, t0 + 20); return { b, x: lerp(-60, W + 60, b) }; };
function sweepBand(g, s) { if (s.b > 0 && s.b < 1) { const gr = g.createLinearGradient(s.x - 60, 0, s.x + 60, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(s.x - 60, -300, 120, H + 600); } }
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
function clipScene(f, rev, rem) { const a = rev != null ? sweep(f, rev) : null, b = rem != null ? sweep(f, rem) : null; if (a && a.b <= 0) return false; if (b && b.b >= 1) return false; const x1 = a && a.b < 1 ? a.x : W, x0 = b && b.b > 0 ? b.x : 0; g.save(); g.beginPath(); g.rect(x0, 0, Math.max(0, x1 - x0), H); g.clip(); return true; }
const SCENES = [[sceneHook, null, 'burnish'], [sceneShell, 'burnish', 'burnish2'], [sceneEnergy, 'burnish2', 'burnish3'], [sceneFibre, 'burnish3', 'burnish4'], [scenePayoff, 'burnish4', null]];
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PURPLE_D; g.fillRect(0, 0, W, H);
  const cam = camera2(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  for (const [fn, rev, rem] of SCENES) { if (rev && f < E[rev]) continue; if (clipScene(f, rev ? E[rev] : null, rem ? E[rem] : null)) { fn(g, f, jit); g.restore(); } }
  for (const [, , rem] of SCENES) if (rem) sweepBand(g, sweep(f, E[rem]));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6; g.drawImage(grain, 0, 0); g.restore(); /* print texture over the full frame */
  drawCTA(g, f, jit);
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions3(g, f30);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same curiosity words, larger */
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540, 1240); g.scale(1.06, 1.06); g.translate(-540, -1180);
  hookComposition(g, 20, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6; g.drawImage(grain, 0, 0); g.restore();
  label(g, 'JEWELS', 540, 520, 210, YELLOW, 1, -0.02); label(g, 'YOU CAN EAT', 540, 680, 118, WHITE, 1, -0.02);
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
