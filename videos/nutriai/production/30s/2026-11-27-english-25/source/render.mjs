// CalMeter English 30 s english-25 (batch 25, 2026-11-27): apple peel fibre, "WHAT'S IN THE PEEL?".
// The requested "why a spoon of tahini packs so much energy" overlapped english-06 (peanuts vs peanut butter, same 30 g, level vs heaped spoon) and the
// fat-density mechanism (english-09 avocado, english-16 chocolate, english-20 pistachios, english-21 coconut); batch 24 was carrot vitamin A. So an
// unrelated same-genre subject with a different question, setting and mechanism was chosen: peeling an apple removes about half its fibre.
// USDA SR Legacy FDC 171688 apples raw with skin 2.4 g fibre / 100 g; FDC 171689 without skin 1.3 g; medium 3-inch apple 182 g -> 4.4 g vs peeled 161 g -> 2.1 g.
// MedlinePlus Fiber: "Taking the peels off fruits and vegetables reduces the amount of fiber"; "Fiber aids digestion and helps prevent constipation."
// Barbershop (frame 0 = thumbnail): the barber peeler whirls the peel off into the bin -> whip to a weigh-in: 100 g skin-on vs 100 g peeled wedges,
// fibre gauges 2.4 g vs 1.3 g -> dive into the skin: a fibre mesh -> vertical whip to a digestion slide -> peel-ribbon wipe to the kitchen payoff:
// a medium apple, 4.4 g -> peeled, the peel carries about half into the bin -> 2.1 g -> peel-swirl CTA.
// Shared engine from english-20..24 (captions 80 px in y 280-460, labels, kinetic numbers, bgScene, effects, whip/dive). Original Canvas2D.
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
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const back = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }; // overshoot ease
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mix = (c1, c2, t) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const a = p(c1), b = p(c2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join(''); };
const YELLOW = '#FFD84D', WHITE = '#FFFFFF', OUTLINE = '#22081E', RED = '#FF3B30', INK = '#16201A';

// ---------------- logged text (device-space bounds for QA)
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
// ---------------- burin stroke (swell + taper), from the approved engraving recipe
function burin(g, pts, w, col, reveal = 1, jit = null) {
  const n = pts.length, m = Math.floor((n - 1) * clamp(reveal)) + 1; if (m < 2) return;
  g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 1; i < m; i++) {
    const u = i / (n - 1); let sw = 0.2 + 0.8 * Math.pow(Math.sin(Math.PI * u), 0.7);
    if (u < 0.22) sw *= u / 0.22; else if (u > 0.78) sw *= (1 - u) / 0.22;
    g.lineWidth = Math.max(0.3, w * (0.25 + sw) * 1.0);
    const a = pts[i - 1], b = pts[i]; const jx = jit ? (jit() - 0.5) * 0.6 : 0, jy = jit ? (jit() - 0.5) * 0.6 : 0;
    g.beginPath(); g.moveTo(a[0] + jx, a[1] + jy); g.lineTo(b[0] + jx, b[1] + jy); g.stroke();
  }
}
const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 48) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * (k / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
function poly(g, pts, close = true) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); }
function softShadow(g, x, y, rx, ry, a = 0.22) { for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(30,10,30,${a / 5})`; g.beginPath(); g.ellipse(x, y, rx * (1 + i * 0.08), ry * (1 + i * 0.14), 0, 0, 7); g.fill(); } }
function softGlow(g, x, y, r, rgb, a) { if (a <= 0) return; const gg = g.createRadialGradient(x, y, 4, x, y, r); gg.addColorStop(0, `rgba(${rgb},${a})`); gg.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function sparkle(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = '#FFFFFF'; g.lineWidth = 3.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); g.lineWidth = 1.8; g.beginPath(); g.moveTo(x - r * 0.5, y - r * 0.5); g.lineTo(x + r * 0.5, y + r * 0.5); g.moveTo(x + r * 0.5, y - r * 0.5); g.lineTo(x - r * 0.5, y + r * 0.5); g.stroke(); g.restore(); }
const bounce = (t) => { if (t >= 1) return 1; const u = eo(clamp(t / 0.7)); return t < 0.7 ? u : 1 - 0.07 * Math.sin(Math.PI * (t - 0.7) / 0.3); };
// squash on landing: returns [sx, sy] for an object that lands at t = 0.7 of its drop
const squash = (t) => { if (t < 0.62 || t > 1) return [1, 1]; const k = Math.sin(Math.PI * (t - 0.62) / 0.38) * 0.16; return [1 + k, 1 - k]; };

// ---------------- big outlined display type (no box), auto-fit to maxW, pop with overshoot
function label(g, s, x, y, px, fill, a, rot = 0, maxW = 860, stroke = OUTLINE) {
  if (a <= 0) return; g.save(); g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > maxW && px > 40) { px -= 2; g.font = `900 ${px}px NDisplay`; }
  const sc = 0.6 + 0.4 * back(clamp(a)); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= clamp(a * 1.6);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(20,4,18,0.38)'; g.fillText(s, 7, 9); g.strokeStyle = stroke; g.lineWidth = Math.max(7, px * 0.13); g.strokeText(s, 0, 0);
  text(g, s, 0, 0, `900 ${px}px NDisplay`, fill, 'center', 0, 'fig'); g.restore(); return px;
}
// kinetic number: pops with overshoot, a shine sweeps across it once
function kinetic(g, s, x, y, px, fill, a, f, f0, rot = 0, maxW = 860) {
  if (a <= 0) return; const used = label(g, s, x, y, px, fill, a, rot, maxW);
  const sh = seg(f, f0 + 4, f0 + 22); if (sh <= 0 || sh >= 1 || !used) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 ${used}px NDisplay`; const w = g.measureText(s).width; const bx = lerp(-w / 2 - 80, w / 2 + 80, eio(sh));
  g.beginPath(); g.moveTo(bx - 26, -used); g.lineTo(bx + 30, -used); g.lineTo(bx - 6, used * 0.2); g.lineTo(bx - 62, used * 0.2); g.closePath(); g.clip();
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText(s, 0, 0); g.restore();
}
// ---------------- captions: 80 px (auto-fit, never below 60 px) white with dark outline, line 2 yellow; ink inside x 100-900, y 280-460
function captions(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out);
    c.lines.forEach(([s, f0], li) => { const a = seg(f, f0, f0 + 4) * (1 - out); if (a <= 0) return; let px = 80; g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > 712 && px > 60) { px -= 2; g.font = `900 ${px}px NDisplay`; }
      const pop = 1 + 0.05 * Math.sin(Math.PI * seg(f, f0, f0 + 6)); const y = (li === 0 ? 352 : 436) + 10 * (1 - eo(seg(f, f0, f0 + 6)));
      g.save(); g.globalAlpha = a; g.translate(500, y); g.scale(pop, pop); g.textAlign = 'center'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(25,6,24,0.94)'; g.lineWidth = 14; g.strokeText(s, 0, 0);
      text(g, s, 0, 0, `900 ${px}px NDisplay`, li === 0 ? WHITE : YELLOW, 'center', 0, 'caption'); g.restore(); });
  }
}
// ---------------- full-bleed background with depth: radial colour, slowly turning light rays, drifting bokeh (parallax layers)
function bgScene(g, inner, outer, f, seed, cx = 540, cy = 1060, cam = null) {
  const gr = g.createRadialGradient(cx, cy, 60, cx, cy, 1300); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(-400, -400, W + 800, H + 800);
  g.save(); g.translate(cx, cy); g.rotate(f * 0.0025 + seed); g.fillStyle = 'rgba(255,255,255,0.055)';
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1800, a, a + Math.PI / 32); g.closePath(); g.fill(); }
  g.restore();
  const q = rng(seed * 1000 + 7);
  for (let i = 0; i < 14; i++) { const d = 0.3 + q() * 0.7, r = 18 + q() * 70 * d; const px = cam ? (cam.x - 540) * (1 - d) * 0.6 : 0; const x = ((q() * 1300 - 110 + px + f * (0.4 + d) * (q() < 0.5 ? 1 : -1)) % 1300 + 1300) % 1300 - 110; const y = ((q() * 2100 - f * (0.5 + 1.2 * d)) % 2100 + 2100) % 2100 - 90;
    softGlow(g, x, y, r, '255,255,255', 0.1 + 0.16 * d); }
}
// ---------------- shared character eyes (from english-20)
function eyes(g, x, y, r, look, blink, mood = 0) {
  /* two cartoon eyes centred at (x, y); look = [dx, dy] in -1..1; blink 0..1 closes the lids; mood > 0 = happy squint */
  for (const ex of [-r * 1.25, r * 1.25]) {
    g.save(); g.translate(x + ex, y); const open = Math.max(0.08, 1 - blink) * (1 - 0.35 * mood);
    g.scale(1, open); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, 0, r, r * 1.18, 0, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, r * 0.16); g.stroke();
    g.fillStyle = '#1A0E12'; g.beginPath(); g.arc(look[0] * r * 0.38, look[1] * r * 0.42, r * 0.52, 0, 7); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(look[0] * r * 0.38 - r * 0.18, look[1] * r * 0.42 - r * 0.22, r * 0.17, 0, 7); g.fill(); g.restore();
  }
}
// ---------------- scale (bigger readout than english-19) and bowl
function drawScale(g, cx, top, w, grams, jit, hi = 0, blank = false) {
  const h = w * 0.44; softShadow(g, cx, top + h + 12, w * 0.55, 14, 0.24);
  g.fillStyle = '#ECEFEA'; g.fillRect(cx - w / 2, top, w, 16); burin(g, [[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2, top + 16], [cx - w / 2, top + 16], [cx - w / 2, top]], 2, OUTLINE, 1, jit);
  const body = [[cx - w * 0.44, top + 22], [cx + w * 0.44, top + 22], [cx + w * 0.48, top + h], [cx - w * 0.48, top + h], [cx - w * 0.44, top + 22]];
  g.save(); poly(g, body); g.clip(); const bg = g.createLinearGradient(0, top, 0, top + h); bg.addColorStop(0, '#FFFDF6'); bg.addColorStop(1, '#D9D2C2'); g.fillStyle = bg; g.fillRect(cx - w, top, 2 * w, h + 4); g.restore(); burin(g, body, 2.6, OUTLINE, 1, jit);
  const dw = w * 0.68, dh = h * 0.56, dx = cx - dw / 2, dy = top + 22 + (h - 22 - dh) / 2 + 2;
  g.fillStyle = hi > 0 ? mix('#DDEBC8', '#FFE680', hi) : '#DDEBC8'; g.fillRect(dx, dy, dw, dh); burin(g, [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh], [dx, dy]], 2.2, OUTLINE, 1, jit);
  if (grams != null && !blank) text(g, `${Math.round(grams)} g`, cx, dy + dh * 0.8, `900 ${Math.round(dh * 0.8)}px NDisplay`, INK, 'center', 0, 'fig');
}
function bowlBack(g, cx, cy, w) { const h = w * 0.13; g.fillStyle = '#E9E1F5'; g.beginPath(); g.ellipse(cx, cy, w / 2, h, 0, 0, 7); g.fill(); g.fillStyle = '#C9BCE0'; g.beginPath(); g.ellipse(cx, cy + 4, w / 2 - 14, h - 8, 0, 0, 7); g.fill(); }
function bowlFront(g, cx, cy, w, jit) {
  const h = w * 0.13, d = w * 0.33; g.save(); g.beginPath(); g.ellipse(cx, cy, w / 2, h, 0, 0, Math.PI); g.lineTo(cx - w / 2, cy); g.ellipse(cx, cy, w / 2, d, 0, Math.PI, 0, true); g.closePath();
  const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.6, '#F1ECF8'); gr.addColorStop(1, '#BFB2D8'); g.fillStyle = gr; g.fill(); g.restore();
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(cx - w * 0.28, cy + d * 0.45, w * 0.06, d * 0.3, 0.3, 0, 7); g.fill();
  burin(g, ell(cx, cy, w / 2, d, 0, Math.PI, 40), 3, OUTLINE, 1, jit); burin(g, ell(cx, cy, w / 2, h, 0, Math.PI * 2, 56), 2.4, OUTLINE, 1, jit);
}
// ---------------- effects
function burstFX(g, x, y, t, r0, r1, n = 16, rgb = '255,248,220') { if (t <= 0 || t >= 1) return; g.save(); const a = 1 - t; g.strokeStyle = `rgba(255,255,255,${0.95 * a})`; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const an = (i / n) * 6.283 + 0.2; const ra = lerp(r0, r1, eo(t)), rb = ra + 40 * a + 12; g.lineWidth = 7 * a + 1; g.beginPath(); g.moveTo(x + Math.cos(an) * ra, y + Math.sin(an) * ra); g.lineTo(x + Math.cos(an) * rb, y + Math.sin(an) * rb); g.stroke(); } softGlow(g, x, y, r1, rgb, 0.85 * a); g.restore(); }
function ringPulse(g, x, y, t, r0, r1, col = '255,255,255') { if (t <= 0 || t >= 1) return; g.save(); g.strokeStyle = `rgba(${col},${0.9 * (1 - t)})`; g.lineWidth = 10 * (1 - t) + 2; g.beginPath(); g.arc(x, y, lerp(r0, r1, eo(t)), 0, 7); g.stroke(); g.restore(); }
function oilDrop(g, x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); const gr = g.createRadialGradient(-r * 0.3, r * 0.2, r * 0.1, 0, r * 0.3, r * 1.2); gr.addColorStop(0, '#FFF2A8'); gr.addColorStop(0.5, '#FFC93A'); gr.addColorStop(1, '#D48A0A'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r * 1.5); g.bezierCurveTo(r * 0.6, -r * 0.6, r, 0, r, r * 0.35); g.arc(0, r * 0.35, r, 0, Math.PI); g.bezierCurveTo(-r, 0, -r * 0.6, -r * 0.6, 0, -r * 1.5); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2.4; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(-r * 0.35, r * 0.15, r * 0.18, r * 0.3, 0.3, 0, 7); g.fill(); g.restore(); }
function cube(g, x, y, s, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.fillStyle = '#FFF1DE'; g.fillRect(-s / 2, -s / 2, s, s); g.fillStyle = '#F2C79A'; g.beginPath(); g.moveTo(-s / 2, -s / 2); g.lineTo(-s / 2 + s * 0.3, -s / 2 - s * 0.3); g.lineTo(s / 2 + s * 0.3, -s / 2 - s * 0.3); g.lineTo(s / 2, -s / 2); g.closePath(); g.fill(); g.fillStyle = '#D9A06A'; g.beginPath(); g.moveTo(s / 2, -s / 2); g.lineTo(s / 2 + s * 0.3, -s / 2 - s * 0.3); g.lineTo(s / 2 + s * 0.3, s / 2 - s * 0.3); g.lineTo(s / 2, s / 2); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2.6; g.lineJoin = 'round'; g.strokeRect(-s / 2, -s / 2, s, s); g.beginPath(); g.moveTo(-s / 2, -s / 2); g.lineTo(-s / 2 + s * 0.3, -s / 2 - s * 0.3); g.lineTo(s / 2 + s * 0.3, -s / 2 - s * 0.3); g.lineTo(s / 2 + s * 0.3, s / 2 - s * 0.3); g.lineTo(s / 2, s / 2); g.moveTo(s / 2, -s / 2); g.lineTo(s / 2 + s * 0.3, -s / 2 - s * 0.3); g.stroke(); g.restore(); }
function strand(g, x0, y0, len, ang, f, t, seed) { if (t <= 0) return; const q = rng(seed); const ph = q() * 6; const pts = []; for (let k = 0; k <= 24; k++) { const u = (k / 24) * t; const along = u * len, side = Math.sin(u * 9 + f * 0.18 + ph) * 22 * u; pts.push([x0 + Math.cos(ang) * along - Math.sin(ang) * side, y0 + Math.sin(ang) * along + Math.cos(ang) * side]); }
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 15; poly(g, pts, false); g.stroke(); g.strokeStyle = '#7BC943'; g.lineWidth = 9; poly(g, pts, false); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 3; poly(g, pts, false); g.stroke(); g.restore(); }
function slashLine(g, x0, y0, x1, y1, t) { if (t <= 0) return; const x = lerp(x0, x1, eo(t)), y = lerp(y0, y1, eo(t)); g.save(); g.lineCap = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 30; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke(); g.strokeStyle = RED; g.lineWidth = 20; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke(); g.restore(); }
const shake = (f, ev, amp, dur = 8) => { const d = f - ev; if (d < 0 || d > dur * 3) return [0, 0]; const k = amp * Math.exp(-d / dur); return [k * Math.sin(d * 2.3), k * Math.cos(d * 1.7)]; };

// ---------------- pile layouts (deterministic)
function pileSpots(seed, n, cx, base, w, rowH, size) {
  /* a mound: the bottom row spans w, each row above holds one fewer item, items jittered and overlapping like a real heap */
  const q = rng(seed), out = []; const sp = size * 1.15; let cnt = Math.max(2, Math.floor(w / sp)), i = 0, row = 0;
  while (i < n) { const c = Math.max(1, Math.min(cnt, n - i)); const rw = (c - 1) * sp; for (let k = 0; k < c; k++, i++) out.push({ x: cx - rw / 2 + k * sp + (q() - 0.5) * size * 0.35, y: base - row * rowH - q() * 5, rot: (q() - 0.5) * 0.9, k: i }); row++; cnt = Math.max(1, cnt - 1); }
  return out.sort((a, b) => a.y - b.y);
}
const flight = (from, to, t, lift) => { const x = lerp(from.x, to.x, t), y = lerp(from.y, to.y, t) - lift * Math.sin(Math.PI * t); return [x, y]; };
// ---------------- shared small parts (from english-22/23): face
function faceOn(g, x, y, r, o) {
  eyes(g, x, y, r, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0);
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, r * 0.3); g.lineCap = 'round'; g.beginPath();
  if ((o.mood ?? 0) < -0.2) g.arc(x, y + r * 2.3, r * 0.7, Math.PI + 0.4, -0.4); else g.arc(x, y + r * 1.5, r * (0.9 + 0.4 * (o.mood ?? 0)), 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = 'rgba(255,110,120,0.55)'; g.beginPath(); g.ellipse(x - r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.ellipse(x + r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.fill();
}
// ---------------- apple parts (original drawings)
const APPLE = '#E8302A', APPLE_D = '#9E1018', APPLE_L = '#FF7B5E', FLESH = '#FFF4CF', FLESH_D = '#EED08E', LEAF_A = '#3FA535', LEAF_B = '#7ED957', STEM = '#6B3E1F', FIB = '#62D65A', FIB_D = '#2C8A36';
function appleShape(g, r) {
  g.beginPath(); g.moveTo(0, -0.72 * r);
  g.bezierCurveTo(0.25 * r, -1.0 * r, 0.95 * r, -0.97 * r, 1.0 * r, -0.25 * r);
  g.bezierCurveTo(1.04 * r, 0.35 * r, 0.72 * r, 0.96 * r, 0.3 * r, 0.95 * r);
  g.bezierCurveTo(0.16 * r, 0.95 * r, 0.08 * r, 0.87 * r, 0, 0.87 * r);
  g.bezierCurveTo(-0.08 * r, 0.87 * r, -0.16 * r, 0.95 * r, -0.3 * r, 0.95 * r);
  g.bezierCurveTo(-0.72 * r, 0.96 * r, -1.04 * r, 0.35 * r, -1.0 * r, -0.25 * r);
  g.bezierCurveTo(-0.95 * r, -0.97 * r, -0.25 * r, -1.0 * r, 0, -0.72 * r); g.closePath();
}
function appleArms(g, r, arms, front) {
  /* rubber-hose arms with white gloves; arms = [left, right] 0 = down, 1 = up (behind the body); front = hug pose across the body */
  g.lineCap = 'round'; g.lineJoin = 'round';
  [-1, 1].forEach((sd, i) => {
    const up = arms[i], sx = sd * 0.9 * r, sy = 0.2 * r; let hx, hy, mx, my;
    if (front) { hx = sd * 0.5 * r; hy = 0.3 * r; mx = sd * 1.2 * r; my = 0.55 * r; }
    else { hx = sx + sd * 0.42 * r; hy = lerp(0.62 * r, -0.62 * r, up); mx = sx + sd * 0.4 * r; my = lerp(0.45 * r, 0.05 * r, up); }
    if (front !== 'hands') { g.strokeStyle = OUTLINE; g.lineWidth = r * 0.075; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, hx, hy); g.stroke(); }
    if (front !== 'arms') { g.fillStyle = '#FFFFFF'; g.strokeStyle = OUTLINE; g.beginPath(); g.arc(hx, hy, r * 0.09, 0, 7); g.fill(); g.lineWidth = r * 0.025; g.stroke(); }
  });
}
function appleM(g, x, y, r, rot, f, o = {}) {
  /* the apple mascot: origin at the body centre; o.peel 0..1 peels the skin from the top down (cream flesh shows); o.arms [l, r]; o.cover hugs itself */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy ?? 1);
  const peel = clamp(o.peel ?? 0);
  g.lineCap = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = r * 0.11; g.beginPath(); g.moveTo(0, -0.7 * r); g.quadraticCurveTo(-0.02 * r, -0.95 * r, 0.1 * r, -1.13 * r); g.stroke(); g.strokeStyle = STEM; g.lineWidth = r * 0.065; g.stroke();
  const sway = Math.sin(f * 0.09 + (o.seed ?? 0)) * 0.12;
  g.save(); g.translate(0.08 * r, -0.98 * r); g.rotate(-0.55 + sway); g.fillStyle = LEAF_B; g.beginPath(); g.ellipse(0.26 * r, 0, 0.28 * r, 0.12 * r, 0, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, r * 0.03); g.stroke(); g.strokeStyle = LEAF_A; g.lineWidth = Math.max(2, r * 0.018); g.beginPath(); g.moveTo(0.04 * r, 0); g.lineTo(0.48 * r, 0); g.stroke(); g.restore();
  if (o.arms && !o.cover) appleArms(g, r, o.arms, false);
  if (o.cover) appleArms(g, r, [0, 0], 'arms');
  appleShape(g, r); const gr = g.createRadialGradient(-0.35 * r, -0.4 * r, r * 0.1, 0, 0, r * 1.15); gr.addColorStop(0, APPLE_L); gr.addColorStop(0.5, APPLE); gr.addColorStop(1, APPLE_D); g.fillStyle = gr; g.fill();
  g.save(); appleShape(g, r); g.clip();
  const q = rng(o.seed ?? 5); g.fillStyle = 'rgba(255,225,180,0.55)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse((q() - 0.5) * 1.8 * r, (q() - 0.5) * 1.8 * r, r * 0.016, r * 0.011, q() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(120,10,20,0.3)'; g.lineWidth = r * 0.02; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 0.22 * r, -0.7 * r); g.quadraticCurveTo(k * 0.32 * r, 0, k * 0.2 * r, 0.85 * r); g.stroke(); }
  if (peel > 0) { /* peeled flesh from the top down to a wavy boundary */
    const yb = lerp(-1.05 * r, 1.05 * r, peel), wob = (xx) => yb + Math.sin((xx / r) * 5 + (o.seed ?? 0)) * 0.05 * r;
    g.beginPath(); g.moveTo(-1.2 * r, -1.3 * r); g.lineTo(1.2 * r, -1.3 * r); for (let xx = 1.2 * r; xx >= -1.2 * r; xx -= r * 0.1) g.lineTo(xx, wob(xx)); g.closePath();
    const fg = g.createRadialGradient(-0.3 * r, -0.35 * r, r * 0.1, 0, 0, r * 1.15); fg.addColorStop(0, '#FFFCEE'); fg.addColorStop(0.6, FLESH); fg.addColorStop(1, FLESH_D); g.fillStyle = fg; g.fill();
    g.fillStyle = 'rgba(214,170,90,0.35)'; const q2 = rng(9); for (let i = 0; i < 18; i++) { const px = (q2() - 0.5) * 1.6 * r, py = (q2() - 0.5) * 1.6 * r; if (py < yb) { g.beginPath(); g.arc(px, py, r * 0.012, 0, 7); g.fill(); } }
    if (peel < 1) { g.strokeStyle = APPLE_D; g.lineWidth = r * 0.045; g.beginPath(); for (let xx = -1.2 * r; xx <= 1.2 * r; xx += r * 0.1) xx === -1.2 * r ? g.moveTo(xx, wob(xx)) : g.lineTo(xx, wob(xx)); g.stroke(); }
  }
  if (o.patch > 0 && peel < 0.2) { g.strokeStyle = FLESH; g.lineCap = 'round'; g.lineWidth = 0.16 * r; g.beginPath(); g.arc(0, 0.05 * r, 0.86 * r, -1.25, -1.25 + 0.95 * o.patch); g.stroke(); g.strokeStyle = 'rgba(214,170,90,0.5)'; g.lineWidth = 0.03 * r; g.beginPath(); g.arc(0, 0.05 * r, 0.82 * r, -1.2, -1.25 + 0.9 * o.patch); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.42)'; g.beginPath(); g.ellipse(-0.5 * r, -0.42 * r, 0.15 * r, 0.26 * r, 0.5, 0, 7); g.fill();
  g.restore();
  appleShape(g, r); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(4, r * 0.035); g.lineJoin = 'round'; g.stroke();
  if (o.face !== false) faceOn(g, 0, 0.04 * r, r * 0.15, o);
  if (o.blush) { g.fillStyle = `rgba(255,80,110,${0.55 * o.blush})`; g.beginPath(); g.ellipse(-0.42 * r, 0.24 * r, 0.15 * r, 0.085 * r, 0, 0, 7); g.ellipse(0.42 * r, 0.24 * r, 0.15 * r, 0.085 * r, 0, 0, 7); g.fill(); }
  if (o.cover) appleArms(g, r, [0, 0], 'hands');
  g.restore();
}
function peelerM(g, x, y, s, rot, f, o = {}) {
  /* the barber peeler: a Y-peeler with a face and a curly moustache; origin at the blade centre; the handle runs along local +y; the face stays upright */
  g.save(); g.translate(x, y); g.rotate(rot);
  g.lineCap = 'round'; for (const sd of [-1, 1]) { g.strokeStyle = OUTLINE; g.lineWidth = s * 0.09; g.beginPath(); g.moveTo(sd * s * 0.32, 0); g.quadraticCurveTo(sd * s * 0.3, s * 0.32, 0, s * 0.44); g.stroke(); g.strokeStyle = '#C9D3DC'; g.lineWidth = s * 0.05; g.stroke(); }
  g.fillStyle = '#E8EEF3'; g.beginPath(); g.roundRect(-s * 0.34, -s * 0.05, s * 0.68, s * 0.1, s * 0.03); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = s * 0.025; g.stroke(); g.strokeStyle = '#59636D'; g.lineWidth = s * 0.012; g.beginPath(); g.moveTo(-s * 0.26, 0); g.lineTo(s * 0.26, 0); g.stroke();
  const gl = (f * 0.05) % 1; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(lerp(-s * 0.3, s * 0.24, gl), -s * 0.04, s * 0.05, s * 0.08);
  g.fillStyle = '#2BB3A3'; g.beginPath(); g.roundRect(-s * 0.16, s * 0.4, s * 0.32, s * 0.86, s * 0.14); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = s * 0.035; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.roundRect(-s * 0.11, s * 0.47, s * 0.06, s * 0.7, s * 0.03); g.fill();
  g.save(); g.translate(0, s * 0.72); g.rotate(-rot + (o.tilt ?? 0));
  eyes(g, 0, -s * 0.05, s * 0.055, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0.3);
  g.fillStyle = OUTLINE; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(0, s * 0.07); g.bezierCurveTo(sd * s * 0.08, s * 0.02, sd * s * 0.16, s * 0.05, sd * s * 0.2, -s * 0.01); g.bezierCurveTo(sd * s * 0.21, s * 0.09, sd * s * 0.08, s * 0.13, 0, s * 0.1); g.fill(); }
  g.restore(); g.restore();
}
function binM(g, x, y, s, lid) {
  /* a kitchen compost bin; origin at the rim centre; lid 0..1 opens (hinged at the left) */
  g.save(); g.translate(x, y); softShadow(g, 0, s * 1.04, s * 0.6, s * 0.08, 0.25);
  g.fillStyle = '#5BBF6A'; g.beginPath(); g.moveTo(-s * 0.5, 0); g.lineTo(s * 0.5, 0); g.lineTo(s * 0.4, s * 1.0); g.lineTo(-s * 0.4, s * 1.0); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(4, s * 0.04); g.lineJoin = 'round'; g.stroke();
  g.strokeStyle = 'rgba(20,60,20,0.35)'; g.lineWidth = s * 0.03; for (const k of [-0.2, 0, 0.2]) { g.beginPath(); g.moveTo(k * s, s * 0.18); g.lineTo(k * s * 0.85, s * 0.85); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-s * 0.4, s * 0.1, s * 0.08, s * 0.75);
  g.save(); g.translate(-s * 0.52, -s * 0.02); g.rotate(-1.9 * lid); g.fillStyle = '#3E9A4E'; g.beginPath(); g.roundRect(0, -s * 0.1, s * 1.04, s * 0.12, s * 0.04); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(4, s * 0.04); g.stroke(); g.fillStyle = '#2E7A3C'; g.beginPath(); g.roundRect(s * 0.42, -s * 0.18, s * 0.2, s * 0.08, s * 0.03); g.fill(); g.stroke(); g.restore();
  g.restore();
}
function ribbon(g, pts, w, o = {}) {
  /* an apple-peel ribbon along pts: it twists (red skin side / cream underside), outlined; o.fib makes green fibre glow along it */
  const n = pts.length; if (n < 2) return; const L = [], R = [], cols = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const ph = i * (o.twist ?? 0.32) + (o.phase ?? 0), c = Math.cos(ph), hw = w * 0.5 * (0.22 + 0.78 * Math.abs(c)) * (o.taper ? Math.min(1, (i + 1) / 4, (n - i) / 4) : 1);
    L.push([pts[i][0] - dy * hw, pts[i][1] + dx * hw]); R.push([pts[i][0] + dy * hw, pts[i][1] - dx * hw]); cols.push(c >= 0); }
  g.save(); g.lineJoin = 'round';
  for (let i = 0; i < n - 1; i++) { g.fillStyle = cols[i] ? (i % 2 ? APPLE : '#D9242A') : FLESH; g.beginPath(); g.moveTo(L[i][0], L[i][1]); g.lineTo(L[i + 1][0], L[i + 1][1]); g.lineTo(R[i + 1][0], R[i + 1][1]); g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill(); g.strokeStyle = g.fillStyle; g.lineWidth = 1.5; g.stroke(); }
  if (o.fib > 0) { g.save(); g.globalAlpha *= clamp(o.fib); for (let i = 0; i < n; i += 3) softGlow(g, pts[i][0], pts[i][1], w * 1.1, '120,235,110', 0.3); g.strokeStyle = FIB; g.lineWidth = Math.max(3, w * 0.14); g.lineCap = 'round'; poly(g, pts, false); g.stroke(); g.restore(); }
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2.5, w * 0.09); poly(g, L, false); g.stroke(); poly(g, R, false); g.stroke();
  g.beginPath(); g.moveTo(L[0][0], L[0][1]); g.lineTo(R[0][0], R[0][1]); g.moveTo(L[n - 1][0], L[n - 1][1]); g.lineTo(R[n - 1][0], R[n - 1][1]); g.stroke();
  g.restore();
}
function coilPts(ax, ay, grow, f, dir = 1, n = 64, len = 400) {
  /* a springy peel coil dangling from (ax, ay); grow 0..1 = how much peel has come off; a helix seen from the side */
  const pts = [], m = Math.max(2, Math.round(n * grow));
  for (let k = 0; k < m; k++) { const u = k / n, th = u * 15 + f * 0.12, R = 40 + 26 * u; pts.push([ax + dir * (60 * u + R * Math.sin(th)), ay + len * u + R * 0.32 * Math.cos(th) - R * 0.32]); }
  return pts;
}
const coilOpt = (f, extra = {}) => ({ twist: 15 / 64, phase: f * 0.12, ...extra });
function xform(pts, ax, ay, tx, ty, s, rot) { const c = Math.cos(rot), sn = Math.sin(rot); return pts.map(([x, y]) => { const dx = (x - ax) * s, dy = (y - ay) * s; return [tx + dx * c - dy * sn, ty + dx * sn + dy * c]; }); }
function wedge(g, x, y, s, rot, skin, f, o = {}) {
  /* an apple wedge lying skin-down like a little boat: the rounded underside is the skin (red band if skin), the top is the cut face; tiny eyes */
  g.save(); g.translate(x, y); g.rotate(rot);
  const path = () => { g.beginPath(); g.moveTo(-s, -0.05 * s); g.bezierCurveTo(-0.9 * s, 0.78 * s, 0.9 * s, 0.78 * s, s, -0.05 * s); g.lineTo(0.34 * s, -0.08 * s); g.quadraticCurveTo(0, 0.14 * s, -0.34 * s, -0.08 * s); g.closePath(); };
  path(); const gr = g.createLinearGradient(0, -0.1 * s, 0, 0.6 * s); gr.addColorStop(0, '#FFFCEE'); gr.addColorStop(1, FLESH_D); g.fillStyle = gr; g.fill();
  g.save(); path(); g.clip(); if (skin) { g.strokeStyle = APPLE; g.lineWidth = 0.26 * s; g.beginPath(); g.moveTo(-s, -0.05 * s); g.bezierCurveTo(-0.9 * s, 0.78 * s, 0.9 * s, 0.78 * s, s, -0.05 * s); g.stroke(); g.strokeStyle = 'rgba(255,190,170,0.6)'; g.lineWidth = 0.04 * s; g.beginPath(); g.moveTo(-0.7 * s, 0.3 * s); g.quadraticCurveTo(-0.3 * s, 0.55 * s, 0, 0.56 * s); g.stroke(); }
  g.fillStyle = 'rgba(150,90,40,0.6)'; g.beginPath(); g.ellipse(-0.12 * s, 0.03 * s, 0.05 * s, 0.025 * s, 0.3, 0, 7); g.ellipse(0.12 * s, 0.03 * s, 0.05 * s, 0.025 * s, -0.3, 0, 7); g.fill(); g.restore();
  path(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, s * 0.06); g.lineJoin = 'round'; g.stroke();
  eyes(g, 0, 0.27 * s, s * 0.085, o.look ?? [0, 0], o.blink ?? 0, 0.6);
  g.restore();
}
function tube(g, x, top, h, w, frac, f, ticks = 3) {
  /* a glass "fibre gauge": a rounded tube filled from the bottom with woven green fibre; tick marks, no numbers */
  const bot = top + h; g.save(); softShadow(g, x + 8, bot + 16, w * 0.7, 12, 0.22);
  const shape = () => { g.beginPath(); g.moveTo(x - w / 2, top); g.lineTo(x - w / 2, bot - w / 2); g.arc(x, bot - w / 2, w / 2, Math.PI, 0, true); g.lineTo(x + w / 2, top); };
  shape(); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fill();
  const ly = bot - h * clamp(frac);
  if (frac > 0.003) { g.save(); shape(); g.closePath(); g.clip();
    const fg = g.createLinearGradient(0, ly, 0, bot); fg.addColorStop(0, '#8BEA7C'); fg.addColorStop(1, FIB_D); g.fillStyle = fg;
    g.beginPath(); g.moveTo(x - w, bot + 10); for (let xx = x - w; xx <= x + w; xx += 8) g.lineTo(xx, ly + Math.sin(xx * 0.08 + f * 0.25) * 5); g.lineTo(x + w, bot + 10); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(20,80,25,0.45)'; g.lineWidth = 3; for (let k = 0; k < 14; k++) { const yy = ly + 14 + k * 22; if (yy > bot) break; g.beginPath(); for (let xx = x - w / 2; xx <= x + w / 2; xx += 6) { const yv = yy + Math.sin(xx * 0.12 + k * 1.7 + f * 0.1) * 6; xx === x - w / 2 ? g.moveTo(xx, yv) : g.lineTo(xx, yv); } g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 5; k++) { const by = bot - ((f * 2.2 + k * 47) % Math.max(10, bot - ly)); g.beginPath(); g.arc(x - w * 0.25 + (k % 3) * w * 0.22, by, 4 + (k % 2) * 3, 0, 7); g.fill(); }
    g.restore(); }
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x - w * 0.3, top + 20); g.lineTo(x - w * 0.3, bot - w * 0.6); g.stroke();
  g.strokeStyle = OUTLINE; g.lineWidth = 6; shape(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.ellipse(x, top, w / 2 + 6, 12, 0, 0, 7); g.stroke();
  g.lineWidth = 3; for (let k = 1; k <= ticks; k++) { const ty = bot - (h * k) / ticks; g.beginPath(); g.moveTo(x + w / 2 - 22, ty); g.lineTo(x + w / 2, ty); g.stroke(); }
  g.restore();
}
function fibreBit(g, x, y, ang, f, seed, a = 1) {
  /* a glowing little bundle of straight plant-fibre strands (straight on purpose: wiggly green bits read as worms) */
  if (a <= 0) return; g.save(); g.globalAlpha *= a; softGlow(g, x, y, 46, '150,245,120', 0.45); g.translate(x, y); g.rotate(ang); g.lineCap = 'round';
  for (const o of [-9, 0, 9]) { g.strokeStyle = OUTLINE; g.lineWidth = 9; g.beginPath(); g.moveTo(-26, o); g.lineTo(26, o * 0.6); g.stroke(); g.strokeStyle = o ? FIB : '#B5F59E'; g.lineWidth = 4.5; g.stroke(); }
  g.strokeStyle = OUTLINE; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 12); g.stroke(); g.restore();
}

// ---------------- A: the barbershop (frame 0 = thumbnail): the apple in the chair, the barber peeler mid-curl; "WHAT'S IN THE PEEL?"; the peel whirls off into the bin
const AP = { x: 540, y: 1078, r: 230 };
function shopBG(g, ph) {
  const wg = g.createLinearGradient(0, 0, 0, 1350); wg.addColorStop(0, '#A8E8DA'); wg.addColorStop(1, '#5CC3B0'); g.fillStyle = wg; g.fillRect(-300, -300, W + 600, 1700);
  g.fillStyle = '#F4FBF8'; g.fillRect(-300, 1000, W + 600, 360); g.strokeStyle = 'rgba(60,140,130,0.35)'; g.lineWidth = 3;
  for (let yy = 1000, r = 0; yy < 1360; yy += 60, r++) { g.beginPath(); g.moveTo(-300, yy); g.lineTo(W + 300, yy); g.stroke(); for (let xx = -300 + (r % 2) * 45; xx < W + 300; xx += 90) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + 60); g.stroke(); } }
  g.fillStyle = '#2E8F80'; g.fillRect(-300, 988, W + 600, 18);
  // mirror with bulbs
  g.fillStyle = '#D9DEE3'; g.beginPath(); g.roundRect(236, 484, 608, 470, 46); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 6; g.stroke();
  const mg = g.createLinearGradient(260, 510, 820, 930); mg.addColorStop(0, '#E8F7FF'); mg.addColorStop(1, '#9FC8E0'); g.fillStyle = mg; g.beginPath(); g.roundRect(258, 506, 564, 426, 32); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)'; for (const [a, b] of [[300, 90], [420, 40]]) { g.beginPath(); g.moveTo(a, 932); g.lineTo(a + b, 932); g.lineTo(a + b + 280, 506); g.lineTo(a + 280, 506); g.closePath(); g.fill(); }
  for (let i = 0; i < 9; i++) { const bx = 262 + i * 69.5, fl = 0.75 + 0.25 * Math.sin(ph * 0.3 + i * 1.7); softGlow(g, bx, 484, 46, '255,240,170', 0.45 * fl); g.fillStyle = '#FFF4B8'; g.beginPath(); g.arc(bx, 484, 17, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 3; g.stroke(); }
  // barber pole (stripes turn)
  g.save(); g.beginPath(); g.roundRect(62, 600, 70, 380, 30); g.clip(); g.fillStyle = '#FFFFFF'; g.fillRect(62, 600, 70, 380);
  for (let k = -6; k < 12; k++) { const yy = 600 + k * 60 + ((ph * 2) % 60); g.fillStyle = k % 2 ? '#E33B3B' : '#3B6FE3'; g.beginPath(); g.moveTo(62, yy); g.lineTo(132, yy - 50); g.lineTo(132, yy - 30); g.lineTo(62, yy + 20); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(74, 600, 12, 380); g.restore(); g.strokeStyle = OUTLINE; g.lineWidth = 5; g.beginPath(); g.roundRect(62, 600, 70, 380, 30); g.stroke();
  for (const yy of [578, 980]) { g.fillStyle = '#C9D3DC'; g.beginPath(); g.roundRect(52, yy, 90, 26, 10); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.stroke(); }
  // checker floor in perspective
  const hz = 1350, vx = 540, vy = 900; const rows = [0, 0.08, 0.18, 0.31, 0.47, 0.66, 0.88, 1.15].map((u) => hz + (H + 200 - hz) * u);
  for (let r = 0; r < rows.length - 1; r++) for (let c = -10; c < 10; c++) { const y0 = rows[r], y1 = rows[r + 1], k0 = (y0 - vy) / (H - vy), k1 = (y1 - vy) / (H - vy), xa = c * 150, xb = (c + 1) * 150;
    g.fillStyle = (r + c) % 2 ? '#2E2A3A' : '#F3EFE6'; g.beginPath(); g.moveTo(vx + xa * k0, y0); g.lineTo(vx + xb * k0, y0); g.lineTo(vx + xb * k1, y1); g.lineTo(vx + xa * k1, y1); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(-300, hz, W + 600, 14);
}
function chairBack(g) { g.fillStyle = '#2E2A36'; g.beginPath(); g.roundRect(378, 772, 324, 540, 70); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.roundRect(400, 792, 40, 480, 20); g.fill(); for (const [bx, by] of [[470, 830], [540, 812], [610, 830]]) { g.fillStyle = '#5A5466'; g.beginPath(); g.arc(bx, by, 9, 0, 7); g.fill(); } }
function chairFront(g) {
  g.fillStyle = '#C9D3DC'; g.fillRect(522, 1330, 36, 120); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.strokeRect(522, 1330, 36, 120);
  g.fillStyle = '#B7C2CC'; g.beginPath(); g.ellipse(540, 1458, 170, 30, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(500, 1452, 80, 9, 0, 0, 7); g.fill();
  g.fillStyle = '#3A3546'; g.beginPath(); g.roundRect(318, 1270, 444, 72, 30); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.roundRect(340, 1280, 400, 14, 7); g.fill();
  for (const sd of [-1, 1]) { g.strokeStyle = OUTLINE; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(540 + sd * 220, 1300); g.lineTo(540 + sd * 220, 1210); g.lineTo(540 + sd * 170, 1210); g.stroke(); g.strokeStyle = '#D5DEE6'; g.lineWidth = 9; g.stroke(); }
}
function shopComposition(g, f, words = 1, still = false) {
  const ph = still ? 0 : f; shopBG(g, ph); chairBack(g);
  const spin = still ? 0 : seg(f, E.spin, E.spin + 25), fly = still ? 0 : seg(f, E.spin + 25, E.spin + 37), done = spin >= 1;
  const lid = still ? 0 : back(seg(f, E.binOpen, E.binOpen + 10)) * (1 - eio(seg(f, E.sBin + 2, E.sBin + 10)));
  // peeler: bobs at the curl, recoils on "Wait.", orbits the apple in a descending spiral, then steps aside proudly
  const pr = 260, cx = AP.x + 0.62 * AP.r, cy = AP.y - 0.6 * AP.r; let px = cx + Math.sin(ph * 0.15) * 6, py = cy + Math.cos(ph * 0.13) * 5, prot = Math.PI + 0.78, pdepth = 1;
  const rec = still ? 0 : eo(seg(f, E.wait, E.wait + 6)) * (1 - eio(seg(f, E.spin - 8, E.spin))); px += 46 * rec; py -= 40 * rec;
  if (spin > 0 && !done) { const a = -0.6 + spin * Math.PI * 4; px = AP.x + Math.sin(a) * (AP.r + 40); py = lerp(AP.y - 0.75 * AP.r, AP.y + 0.6 * AP.r, spin); pdepth = Math.cos(a); prot = Math.PI + 0.78 + Math.sin(a) * 0.4; }
  if (done) { const t = eo(seg(f, E.spin + 25, E.spin + 40)); px = lerp(AP.x + 0.5 * AP.r, 850, t); py = lerp(AP.y + 0.6 * AP.r, 760, t) + Math.sin(f * 0.2) * 6; prot = Math.PI + 0.5 + Math.sin(f * 0.25) * 0.12; }
  const pOpt = { look: rec > 0.5 ? [-0.6, 0.2] : [-0.7, 0.4], mood: rec > 0.5 ? -0.1 : 0.4, blink: still ? 0 : Math.max(0, 1 - Math.abs(f - 22) / 3) };
  if (pdepth < 0) peelerM(g, px, py, pr, prot, ph, pOpt);
  // the apple
  const sq = spin > 0 && !done ? 1 + 0.07 * Math.sin(f * 1.3) : 1; const peel = spin;
  const worried = f < E.spin; const look = still ? [0.55, -0.55] : f < E.wait ? [0.55, -0.55] : f < 60 ? [0.75, -0.4] : f < E.spin ? [-0.8, 0.25] : done ? [0, 0.7] : [Math.sin(f * 0.9) * 0.8, 0];
  appleM(g, AP.x, AP.y, AP.r, (spin > 0 && !done ? Math.sin(f * 0.8) * 0.06 : 0) + Math.sin(ph * 0.06) * 0.015, ph, { peel, sx: sq, sy: 2 - sq, look, mood: worried ? -0.4 : done ? 0.3 : -0.1, blink: still ? 0 : Math.max(0, 1 - Math.abs(f - 14) / 3), arms: f >= E.wait && f < E.spin ? [0.15, 0.95] : [0.12, 0.12], cover: done ? 1 : 0, patch: 1, blush: done ? eo(seg(f, E.spin + 25, E.spin + 33)) : 0, seed: 2 });
  // the peel coil: a short curl in the hook, it grows during the whirl, then flies into the bin
  const ax = AP.x + 0.86 * AP.r, ay = AP.y - 0.5 * AP.r; const grow = lerp(0.36, 1, spin);
  if (fly < 1) { let pts = coilPts(ax, ay, grow, ph); if (fly > 0) { const [tx, ty] = flight({ x: ax, y: ay }, { x: 190, y: 1180 }, eio(fly), 380); pts = xform(pts, ax, ay, tx, ty, lerp(1, 0.35, eio(fly)), -2.4 * eio(fly)); } ribbon(g, pts, 54, coilOpt(ph, { taper: true })); }
  if (pdepth >= 0) { if (spin > 0 && !done) for (let k = 1; k <= 3; k++) { g.save(); g.globalAlpha = 0.18; const a = -0.6 + seg(f - k, E.spin, E.spin + 25) * Math.PI * 4; peelerM(g, AP.x + Math.sin(a) * (AP.r + 40), lerp(AP.y - 0.75 * AP.r, AP.y + 0.6 * AP.r, seg(f - k, E.spin, E.spin + 25)), pr, prot, ph, pOpt); g.restore(); } peelerM(g, px, py, pr, prot, ph, pOpt); }
  if (spin > 0 && !done) { g.save(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineCap = 'round'; for (let k = 0; k < 5; k++) { const a0 = f * 0.5 + k * 1.26; g.lineWidth = 8; g.beginPath(); g.ellipse(AP.x, AP.y, AP.r + 70, AP.r * 0.5 + 30, 0, a0, a0 + 0.7); g.stroke(); } g.restore(); }
  binM(g, 190, 1210, 170, lid);
  if (!still) { burstFX(g, 190, 1190, seg(f, E.sBin, E.sBin + 12), 30, 190, 14); ringPulse(g, AP.x, AP.y, seg(f, E.spin + 25, E.spin + 39), AP.r * 0.8, AP.r * 1.5); }
  chairFront(g);
  for (let i = 0; i < 6; i++) { const q = rng(i * 13 + 5); softGlow(g, q() * W, 1500 + q() * 380, 40 + q() * 60, '255,255,255', 0.12); }
  if (!still) { const wa = seg(f, E.wait, E.wait + 5) * (1 - seg(f, E.wait + 28, E.wait + 34)); label(g, '!', 290, 930, 210, YELLOW, wa, -0.18 + 0.05 * Math.sin(f * 0.6), 200); }
  if (words > 0) { label(g, "WHAT'S IN", 540, 640, 150, WHITE, words, -0.03, 780); label(g, 'THE PEEL?', 540, 790, 150, YELLOW, words, -0.03, 780); }
}
function sceneShop(g, f, jit) { shopComposition(g, f, 0); const w = 1 - seg(f, 88, 98); if (w > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); label(g, "WHAT'S IN", 540, 640, 150, WHITE, w, -0.03, 750); label(g, 'THE PEEL?', 540, 790, 150, YELLOW, w, -0.03, 750); g.restore(); } }

// ---------------- B: the weigh-in: equal 100 g of wedges (skin on / peeled) on twin scales; fibre threads fill two gauges, 2.4 g vs 1.3 g
const PED = [{ x: 310, skin: true, drop: 'wedgesL', fib: 'fibL', k: 'k24', val: 2.4, s: 'L' }, { x: 770, skin: false, drop: 'wedgesR', fib: 'fibR', k: 'k13', val: 1.3, s: 'R' }];
const WSPOT = [[-88, 1150, -0.12], [88, 1150, 0.1], [0, 1086, 0.02]];
function sceneWeigh(g, f, jit, cam) {
  bgScene(g, '#93D6FF', '#2A4FB5', f, 41, 540, 980, cam);
  g.fillStyle = '#21409A'; g.fillRect(-300, 1430, W + 600, 700); g.fillStyle = 'rgba(255,255,255,0.1)'; for (let k = 0; k < 6; k++) g.fillRect(-300, 1460 + k * 70, W + 600, 4);
  const numFade = 1 - seg(f, E.dive - 10, E.dive - 2);
  for (const P of PED) {
    const d0 = E[P.drop];
    g.save(); g.globalAlpha = 0.16 + 0.05 * Math.sin(f * 0.1 + P.x); g.fillStyle = '#FFF8D8'; g.beginPath(); g.moveTo(P.x - 40, 380); g.lineTo(P.x + 40, 380); g.lineTo(P.x + 230, 1460); g.lineTo(P.x - 230, 1460); g.closePath(); g.fill(); g.restore();
    softShadow(g, P.x, 1460, 210, 26, 0.3);
    g.fillStyle = '#F3F6FA'; g.beginPath(); g.roundRect(P.x - 170, 1378, 340, 200, 18); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(40,60,120,0.12)'; g.fillRect(P.x - 170, 1520, 340, 58);
    appleM(g, P.x, 1462, 52, 0, f, { face: false, peel: P.skin ? 0 : 1, seed: 3 });
    const grams = 100 * eo(seg(f, d0 + 8, d0 + 26)), hi = f > d0 + 26 ? 1 - seg(f, d0 + 26, d0 + 44) : 0;
    drawScale(g, P.x, 1210, 380, grams, jit, hi);
    for (let i = 0; i < 3; i++) { const t = seg(f, d0 + i * 3, d0 + i * 3 + 14); if (t <= 0) continue; const [wx, wy, wr] = WSPOT[i]; const yy = lerp(560, wy, bounce(t)); const [sx2, sy2] = squash(t); g.save(); g.translate(P.x + wx, yy + 30); g.scale(sx2, sy2); g.translate(-(P.x + wx), -(yy + 30)); wedge(g, P.x + wx, yy, 92, wr + Math.sin(f * 0.07 + i) * 0.03, P.skin, f, { look: [0, -0.6], blink: Math.max(0, 1 - Math.abs(f - d0 - 40 - i * 9) / 3) }); g.restore(); }
    const fl = E[P.fib], fill = eo(seg(f, fl + 8, fl + 40));
    tube(g, P.x, 690, 350, 170, (P.val / 3) * fill, f);
    for (let i = 0; i < 12; i++) { const t = seg(f, fl + i * 2, fl + i * 2 + 16); if (t <= 0 || t >= 1) continue; const q = rng(700 + i + (P.skin ? 0 : 50)); const from = { x: P.x + (q() - 0.5) * 200, y: 1110 }, to = { x: P.x + (q() - 0.5) * 50, y: 700 }; const e = eio(t); const [x, y] = flight(from, to, e, 120 + q() * 120); const [x2, y2] = flight(from, to, Math.min(1, e + 0.05), 120 + q() * 120); fibreBit(g, x, y, Math.atan2(y2 - y, x2 - x) + Math.PI, f, 800 + i, 1 - seg(t, 0.85, 1)); }
    ringPulse(g, P.x, 880, seg(f, E[P.k], E[P.k] + 14), 80, 260, '160,255,150');
    kinetic(g, `${P.val} g`, P.x, 640, 132, P.skin ? YELLOW : WHITE, seg(f, E[P.k], E[P.k] + 8) * numFade, f, E[P.k], P.skin ? -0.03 : 0.03, 400);
  }
}

// ---------------- C: inside the skin: a thin red band packed with a woven fibre mesh above the cream flesh (sparser threads)
const FCELLS = Array.from({ length: 22 }, (_, i) => { const q = rng(1400 + i); return { x: (i % 5) * 230 + (Math.floor(i / 5) % 2) * 115 - 20, y: 1180 + Math.floor(i / 5) * 190 + q() * 30, r: 92 + q() * 16, s: q() * 6 }; });
function sceneSkin(g, f, jit, cam) {
  const sky = g.createLinearGradient(0, 0, 0, 840); sky.addColorStop(0, '#BDE8FF'); sky.addColorStop(1, '#FFE6EE'); g.fillStyle = sky; g.fillRect(-300, -300, W + 600, 1200);
  for (let i = 0; i < 10; i++) { const q = rng(1500 + i); softGlow(g, ((q() * 1300 + f * (0.5 + q())) % 1300) - 110, 480 + q() * 300, 30 + q() * 60, '255,255,255', 0.25); }
  const fg = g.createLinearGradient(0, 1000, 0, H); fg.addColorStop(0, '#FFF6D8'); fg.addColorStop(1, '#F0D08E'); g.fillStyle = fg; g.fillRect(-300, 960, W + 600, H);
  for (const c of FCELLS) { g.save(); g.translate(c.x + Math.sin(f * 0.02 + c.s) * 4, c.y); g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283 + c.s; g.lineTo(Math.cos(a) * c.r, Math.sin(a) * c.r * 0.8); } g.closePath(); g.fillStyle = 'rgba(255,255,245,0.55)'; g.fill(); g.strokeStyle = 'rgba(190,150,80,0.55)'; g.lineWidth = 5; g.stroke(); g.restore(); }
  g.save(); g.globalAlpha = 0.7; for (let k = 0; k < 4; k++) { g.strokeStyle = FIB; g.lineWidth = 5; g.beginPath(); for (let x = -40; x <= W + 40; x += 12) { const y = 1250 + k * 190 + Math.sin(x * 0.012 + k * 2 + f * 0.04) * 30; x === -40 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } g.restore();
  const topE = (x) => 820 + Math.sin(x * 0.006 + f * 0.02) * 22, botE = (x) => 1070 + Math.sin(x * 0.009 + 1.3) * 14;
  const band = () => { g.beginPath(); g.moveTo(-60, topE(-60)); for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, topE(x)); for (let x = W + 60; x >= -60; x -= 20) g.lineTo(x, botE(x)); g.closePath(); };
  band(); const bg = g.createLinearGradient(0, 800, 0, 1010); bg.addColorStop(0, '#FF5A48'); bg.addColorStop(0.5, APPLE); bg.addColorStop(1, APPLE_D); g.fillStyle = bg; g.fill();
  g.save(); band(); g.clip();
  g.strokeStyle = 'rgba(120,0,10,0.45)'; g.lineWidth = 3; for (let r = 0; r < 7; r++) for (let c = -1; c < 16; c++) { const x = c * 76 + (r % 2) * 38, y = 830 + r * 38; g.beginPath(); g.ellipse(x, y + Math.sin(x * 0.006 + f * 0.02) * 22, 34, 14, 0, 0, 7); g.stroke(); }
  const pulse = 0.65 + 0.35 * Math.sin(f * 0.15);
  for (let k = 0; k < 18; k++) { const fam = k % 2, off = (k / 18) * 240; g.strokeStyle = OUTLINE; g.lineWidth = 9; const path2 = () => { g.beginPath(); for (let x = -60; x <= W + 60; x += 14) { const y = 830 + off + Math.sin(x * (fam ? 0.02 : 0.014) + k * 1.3 + f * (fam ? 0.05 : -0.04)) * 26; x === -60 ? g.moveTo(x, y) : g.lineTo(x, y); } }; path2(); g.stroke(); g.strokeStyle = fam ? FIB : '#9AF08A'; g.lineWidth = 5; path2(); g.stroke(); }
  for (let i = 0; i < 9; i++) softGlow(g, 60 + i * 120, 945, 130, '140,240,120', 0.28 * pulse);
  g.restore();
  g.strokeStyle = OUTLINE; g.lineWidth = 8; g.beginPath(); for (let x = -60; x <= W + 60; x += 20) x === -60 ? g.moveTo(x, topE(x)) : g.lineTo(x, topE(x)); g.stroke(); g.lineWidth = 5; g.strokeStyle = '#7A0A12'; g.beginPath(); for (let x = -60; x <= W + 60; x += 20) x === -60 ? g.moveTo(x, botE(x)) : g.lineTo(x, botE(x)); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); for (let x = 80; x <= 460; x += 20) x === 80 ? g.moveTo(x, topE(x) + 14) : g.lineTo(x, topE(x) + 14); g.stroke();
  for (let i = 0; i < 10; i++) { const q = rng(1600 + i); sparkle(g, ((q() * 1300 + f * (0.6 + q())) % 1300) - 110, 1180 + q() * 600, 9 + q() * 8, 0.5 + 0.5 * Math.sin(f * 0.15 + i)); }
  const la = seg(f, E.skin, E.skin + 8) * (1 - seg(f, E.whipCD - 8, E.whipCD - 2));
  kinetic(g, 'IN THE SKIN', 540, 650, 140, YELLOW, la, f, E.skin, -0.02, 700);
  if (la > 0) for (const ax of [250, 830]) { const by = 700 + Math.abs(Math.sin(f * 0.18)) * 26; g.save(); g.globalAlpha = clamp(la * 1.5); g.translate(ax, by); g.fillStyle = WHITE; g.strokeStyle = OUTLINE; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.lineTo(18, 40); g.lineTo(40, 40); g.lineTo(0, 86); g.lineTo(-40, 40); g.lineTo(-18, 40); g.closePath(); g.fill(); g.stroke(); g.restore(); }
}

// ---------------- D: the digestion slide: food blobs glide down a twisty tube, swept along by little fibre brooms; a gate light blinks steadily
const SLIDE = (() => { const C = [[90, 820], [480, 800], [800, 880], [800, 1000], [500, 1060], [230, 1110], [220, 1230], [470, 1300], [800, 1330], [1200, 1345]]; const out = [];
  for (let i = 0; i < C.length - 1; i++) { const p0 = C[Math.max(0, i - 1)], p1 = C[i], p2 = C[i + 1], p3 = C[Math.min(C.length - 1, i + 2)]; for (let k = 0; k < 24; k++) { const t = k / 24, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  out.push(C[C.length - 1]); const cum = [0]; for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1])); return { pts: out, cum, L: cum[cum.length - 1] }; })();
function slideAt(u) { const d = clamp(u) * SLIDE.L; let i = 1; while (i < SLIDE.cum.length - 1 && SLIDE.cum[i] < d) i++; const a = SLIDE.pts[i - 1], b = SLIDE.pts[i], t = (d - SLIDE.cum[i - 1]) / Math.max(1e-6, SLIDE.cum[i] - SLIDE.cum[i - 1]); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), Math.atan2(b[1] - a[1], b[0] - a[0])]; }
function sceneSlide(g, f, jit, cam) {
  bgScene(g, '#FFD0DC', '#C8487D', f, 43, 540, 1060, cam);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(120,20,60,0.25)'; g.lineWidth = 170; poly(g, SLIDE.pts.map(([x, y]) => [x + 10, y + 18]), false); g.stroke();
  g.strokeStyle = OUTLINE; g.lineWidth = 156; poly(g, SLIDE.pts, false); g.stroke(); g.strokeStyle = '#FFEAF1'; g.lineWidth = 142; g.stroke(); g.strokeStyle = 'rgba(255,170,200,0.55)'; g.lineWidth = 60; poly(g, SLIDE.pts.map(([x, y]) => [x, y + 30]), false); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 10; g.setLineDash([60, 40]); g.lineDashOffset = -f * 6; poly(g, SLIDE.pts.map(([x, y]) => [x, y - 44]), false); g.stroke(); g.setLineDash([]); g.restore();
  const t0 = E.whipCD - 12; let gateHit = 0;
  for (let i = 0; i < 6; i++) { const u = ((f - t0) * 0.0042 + i / 6) % 1; if (u > 0.9 && u < 0.955) gateHit = 1;
    const [bx2, by2, ba] = slideAt(Math.max(0, u - 0.055)); g.save(); g.translate(bx2, by2); g.rotate(ba); g.scale(1.35, 1.35); g.strokeStyle = OUTLINE; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(-70, -6); g.lineTo(-8, -6); g.stroke(); g.strokeStyle = '#C08A4E'; g.lineWidth = 6; g.stroke();
      for (let k = -3; k <= 3; k++) { g.strokeStyle = OUTLINE; g.lineWidth = 9; g.beginPath(); g.moveTo(-6, -6); g.quadraticCurveTo(14, -6 + k * 8 + Math.sin(f * 0.5 + k) * 3, 30, -6 + k * 13); g.stroke(); g.strokeStyle = k % 2 ? FIB : '#9AF08A'; g.lineWidth = 5; g.stroke(); } g.restore();
    const [x, y, a] = slideAt(u); const wob = Math.sin(f * 0.3 + i) * 0.08; g.save(); g.translate(x, y - 8); g.rotate(a * 0.3 + wob); g.fillStyle = ['#F6D7A7', '#FFC9A0', '#F2E1B0'][i % 3]; g.beginPath(); g.ellipse(0, 0, 62, 50, 0, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-24, -20, 15, 9, -0.4, 0, 7); g.fill(); eyes(g, 8, -6, 11, [0.6, 0], 0, 0.7); g.restore(); }
  const [gx, gy] = slideAt(0.93); g.save(); g.translate(gx, gy); g.strokeStyle = OUTLINE; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-90, 70); g.lineTo(-90, -110); g.quadraticCurveTo(0, -170, 90, -110); g.lineTo(90, 70); g.stroke(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 7; g.stroke();
  const lamp = Math.max(gateHit, 0); softGlow(g, 0, -150, 90, '120,255,120', 0.8 * lamp); g.fillStyle = lamp ? '#7CFF6B' : '#3F7A45'; g.beginPath(); g.arc(0, -150, 22, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 5; g.stroke(); g.restore();
  const la = seg(f, E.aids, E.aids + 8) * (1 - seg(f, E.ribbon - 8, E.ribbon - 2));
  kinetic(g, 'AIDS DIGESTION', 540, 650, 118, WHITE, la, f, E.aids, -0.02, 700);
}

// ---------------- E: the kitchen payoff: a medium apple, 4.4 g of fibre; the peeler whirls, the peel carries about half the fibre into the bin -> 2.1 g
const KA = { x: 600, y: 1040, r: 190 };
function sceneKitchen(g, f, jit, cam) {
  const wg = g.createLinearGradient(0, 0, 0, 1250); wg.addColorStop(0, '#FFF0C2'); wg.addColorStop(1, '#FFC46B'); g.fillStyle = wg; g.fillRect(-300, -300, W + 600, 1600);
  g.save(); g.globalAlpha = 0.16 + 0.04 * Math.sin(f * 0.07); g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(-200, 300); g.lineTo(200, 300); g.lineTo(900, 1250); g.lineTo(400, 1250); g.closePath(); g.fill(); g.restore();
  g.fillStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < 9; k++) g.fillRect(-60 + k * 140, -300, 60, 1540);
  g.fillStyle = '#B97A3E'; g.fillRect(700, 900, 420, 22); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.strokeRect(700, 900, 420, 22);
  for (const [jx, jh, jc] of [[770, 110, '#FFB74D'], [870, 150, '#9CCC65'], [970, 90, '#E57373']]) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.roundRect(jx - 40, 900 - jh, 80, jh, 12); g.fill(); g.fillStyle = jc; g.fillRect(jx - 34, 900 - jh * 0.6, 68, jh * 0.6 - 4); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.beginPath(); g.roundRect(jx - 40, 900 - jh, 80, jh, 12); g.stroke(); g.fillStyle = '#7A4A22'; g.fillRect(jx - 30, 900 - jh - 18, 60, 18); g.strokeRect(jx - 30, 900 - jh - 18, 60, 18); }
  g.fillStyle = '#C98A4B'; g.fillRect(-300, 1236, W + 600, 40); g.fillStyle = '#A86A34'; g.fillRect(-300, 1276, W + 600, 800); g.strokeStyle = OUTLINE; g.lineWidth = 5; g.beginPath(); g.moveTo(-300, 1236); g.lineTo(W + 300, 1236); g.moveTo(-300, 1276); g.lineTo(W + 300, 1276); g.stroke();
  g.strokeStyle = 'rgba(80,40,10,0.3)'; g.lineWidth = 4; for (let k = 0; k < 7; k++) { g.beginPath(); for (let x = -40; x <= W + 40; x += 20) { const y = 1320 + k * 90 + Math.sin(x * 0.01 + k) * 10; x === -40 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  const drain = eio(seg(f, E.drain, E.drain + 40)), fibOn = seg(f, E.drain, E.drain + 24);
  tube(g, 230, 820, 400, 130, lerp(4.4, 2.1, drain) / 5, f, 5);
  const fly = seg(f, 706, E.binLand), lid = back(seg(f, 690, 700)) * (1 - eio(seg(f, E.binLand + 4, E.binLand + 12)));
  // green fibre bits stream from the gauge to the peel while it drains
  const ax = KA.x + 0.9 * KA.r, ay = KA.y - 0.45 * KA.r;
  for (let i = 0; i < 10; i++) { const t = seg(f, E.drain + i * 3, E.drain + i * 3 + 18); if (t <= 0 || t >= 1) continue; const e = eio(t); const [x, y] = flight({ x: 230, y: 840 }, { x: ax + 30, y: ay + 140 }, e, 200); fibreBit(g, x, y, -0.4 + e, f, 900 + i, 1 - seg(t, 0.85, 1)); }
  const peel = seg(f, E.peel2, E.peel2 + 24), done = peel >= 1;
  const pr = 210; let px = 1250, py = 700, prot = Math.PI + 0.78, pdepth = 1;
  if (f >= E.peel2 - 12 && peel <= 0) { const t = eo(seg(f, E.peel2 - 12, E.peel2)); px = lerp(1250, KA.x + 0.62 * KA.r, t); py = lerp(600, KA.y - 0.62 * KA.r, t); }
  if (peel > 0 && !done) { const a = -0.6 + peel * Math.PI * 4; px = KA.x + Math.sin(a) * (KA.r + 36); py = lerp(KA.y - 0.75 * KA.r, KA.y + 0.6 * KA.r, peel); pdepth = Math.cos(a); }
  if (done) { const t = eio(seg(f, E.peel2 + 24, E.peel2 + 40)); px = lerp(KA.x + 0.4 * KA.r, 1250, t); py = lerp(KA.y + 0.6 * KA.r, 560, t); }
  if (pdepth < 0) peelerM(g, px, py, pr, prot, f, { look: [-0.6, 0.4], mood: 0.5 });
  const shrug = done ? 0.5 + 0.5 * Math.sin(f * 0.2) : 0.15;
  appleM(g, KA.x, KA.y, KA.r, (peel > 0 && !done ? Math.sin(f * 0.8) * 0.06 : Math.sin(f * 0.07) * 0.02), f, { peel, look: f < E.peel2 ? [-0.6, -0.2] : done ? [-0.75, -0.3] : [Math.sin(f * 0.9) * 0.8, 0], mood: done ? -0.4 : 0.4, arms: done ? [shrug, shrug] : [0.15, 0.8 + 0.2 * Math.sin(f * 0.3)], blush: done ? 0.7 : 0, seed: 7, blink: Math.max(0, 1 - Math.abs(f - 664) / 3) });
  const grow = lerp(0.02, 1, peel);
  if (peel > 0 && fly < 1) { let pts = coilPts(ax, ay, grow, f, 1, 64, 300); if (fly > 0) { const [tx, ty] = flight({ x: ax, y: ay }, { x: 850, y: 1150 }, eio(fly), 260); pts = xform(pts, ax, ay, tx, ty, lerp(1, 0.35, eio(fly)), -1.2 * eio(fly)); } ribbon(g, pts, 40, coilOpt(f, { taper: true, fib: fibOn })); }
  if (pdepth >= 0 && f >= E.peel2 - 12 && px < 1240) peelerM(g, px, py, pr, prot, f, { look: [-0.6, 0.4], mood: 0.5 });
  if (peel > 0 && !done) { g.save(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineCap = 'round'; for (let k = 0; k < 5; k++) { const a0 = f * 0.5 + k * 1.26; g.lineWidth = 7; g.beginPath(); g.ellipse(KA.x, KA.y, KA.r + 60, KA.r * 0.5 + 26, 0, a0, a0 + 0.7); g.stroke(); } g.restore(); }
  binM(g, 850, 1240, 150, lid); burstFX(g, 850, 1220, seg(f, E.binLand, E.binLand + 12), 30, 170, 14);
  const a44 = seg(f, E.ribbon + 12, E.ribbon + 20) * (1 - seg(f, E.drain + 34, E.drain + 40)); label(g, '4.4 g', 230, 778, 100, WHITE, a44, -0.02, 300);
  const a21 = seg(f, E.drain + 40, E.drain + 46) * (1 - seg(f, E.cta + 2, E.cta + 8)); kinetic(g, '2.1 g', 230, 778, 100, WHITE, a21, f, E.drain + 40, -0.02, 300);
  const ah = seg(f, E.half, E.half + 8) * (1 - seg(f, E.cta + 2, E.cta + 8)); kinetic(g, 'HALF THE FIBRE', 540, 630, 124, YELLOW, ah, f, E.half, -0.02, 700);
  for (let i = 0; i < 5; i++) { const q = rng(1700 + i); sparkle(g, 380 + q() * 420, 820 + q() * 300, 10 + q() * 8, Math.abs(Math.sin(f * 0.1 + i)) * seg(f, E.half, E.half + 10)); }
}

// ---------------- cameras (per scene)
const SPANS = () => [[0, E.whipAB + 12], [E.whipAB, E.dive + 18], [E.dive, E.whipCD + 12], [E.whipCD, E.ribbon + 16], [E.ribbon, N]];
function camFor(i, f) {
  const [a, b] = SPANS()[i]; let z = 1 + 0.045 * eio(seg(f, a, b)), cx = 540;
  if (i === 0) { const k = eio(seg(f, 52, 96)) * (1 - eio(seg(f, E.spin - 4, E.spin + 8))); z += 0.07 * k; cx -= 70 * k; }
  const kicks = [E.k24, E.k13, E.skin, E.aids, E.half].reduce((s, e) => s + 0.02 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  const [sx, sy] = [shake(f, E.sBin, 10), shake(f, E.sThud, 9)].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
  return { z: z * (1 + kicks), x: cx - sx, y: 1010 - sy };
}

// ---------------- paper grain (print texture)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.05)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } }
// ---------------- CTA: a red circle wipe trimmed with a peel ribbon; the apple (skin on) pops up waving; seal + white wordmark
function drawCTA(g, f, jit) {
  const c = eio(seg(f, E.cta, E.cta + 18)); if (c <= 0) return;
  const R = lerp(0, 1500, c); g.save(); g.beginPath(); g.arc(540, 980, R, 0, 7); g.clip();
  const gr = g.createRadialGradient(540, 900, 50, 540, 980, 1300); gr.addColorStop(0, '#FF6E5C'); gr.addColorStop(1, '#8E0E1A'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.translate(540, 980); g.rotate(f * 0.01); g.fillStyle = 'rgba(255,255,255,0.07)'; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1700, a, a + 0.26); g.closePath(); g.fill(); }
  g.restore();
  if (c < 1 && R > 180) { const pts = []; for (let k = 0; k <= 90; k++) { const a = (k / 90) * 6.283 + f * 0.05; pts.push([540 + Math.cos(a) * R, 980 + Math.sin(a) * R]); } ribbon(g, pts, Math.min(90, R * 0.2), { twist: 0.4, phase: f * 0.2 }); }
  const r = seg(f, E.cta + 12, E.cta + 26); if (r <= 0) return;
  for (let i = 0; i < 14; i++) { const q = rng(1500 + i); const t = ((f - E.cta) * (0.005 + q() * 0.006) + q()) % 1; sparkle(g, 80 + q() * 920, lerp(1650, 560, t), 10 + q() * 10, 0.6 + 0.4 * Math.sin(f * 0.2 + i)); }
  const pop = back(seg(f, E.cta + 8, E.cta + 26)), wave = 0.6 + 0.4 * Math.sin(f * 0.25), ay2 = lerp(1500, 880, pop) + Math.sin(f * 0.13) * 10, ra = seg(f, E.cta + 14, E.cta + 30);
  const ring = (a0, a1) => { const pts = []; for (let k = 0; k <= 40; k++) { const a = lerp(a0, a1, k / 40); pts.push([540 + Math.cos(a) * 290, ay2 + 60 + Math.sin(a) * 70]); } return pts; };
  const rot2 = f * 0.04; if (ra > 0) { g.save(); g.globalAlpha = ra; ribbon(g, ring(Math.PI, 2 * Math.PI), 44, { twist: 0.35, phase: rot2 * 3 }); g.restore(); }
  appleM(g, 540, ay2, 175, Math.sin(f * 0.1) * 0.05, f, { arms: [0.2, wave], look: [Math.sin(f * 0.07) * 0.5, 0.2], mood: 1, blink: Math.max(0, 1 - Math.abs(f - 876) / 4), seed: 8 });
  if (ra > 0) { g.save(); g.globalAlpha = ra; ribbon(g, ring(0, Math.PI), 44, { twist: 0.35, phase: rot2 * 3 + 0.4 }); g.restore(); }
  g.font = '900 84px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 60, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1340;
  const sc = 0.5 + 0.5 * back(r); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  g.save(); g.globalAlpha = r; g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = WHITE; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.restore();
  const wr = seg(f, E.cta + 16, E.cta + 36), s = 'CalMeter';
  if (wr > 0) { const sub = s.slice(0, Math.ceil(s.length * wr)); g.save(); g.font = '900 84px NDisplay'; g.textAlign = 'left'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 13; g.strokeText(sub, cx + R0 + gap, cy + 30); g.restore(); text(g, sub, cx + R0 + gap, cy + 30, '900 84px NDisplay', WHITE, 'left', 0, 'cta'); }
  const sh = seg(f, E.ctaWord, E.ctaWord + 36); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 30, '900 84px NDisplay', YELLOW, 'left', 0, 'cta'); g.restore(); }
  const tk = seg(f, E.cta + 30, E.cta + 80); g.strokeStyle = WHITE; g.lineWidth = 1.6; for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 10), cy + Math.sin(a) * (R0 + 10)); g.lineTo(cx + Math.cos(a) * (R0 + 18), cy + Math.sin(a) * (R0 + 18)); g.stroke(); }
}
// ---------------- compositor: whip, dive into the skin, vertical whip, peel-ribbon wipe; then grain, CTA, captions
const SCENES = [sceneShop, sceneWeigh, sceneSkin, sceneSlide, sceneKitchen];
const TRANS = [{ at: E.whipAB, d: 12, type: 'whip' }, { at: E.dive, d: 18, type: 'dive', cx: 310, cy: 1150 }, { at: E.whipCD, d: 12, type: 'whipV' }, { at: E.ribbon, d: 16, type: 'ribbon' }];
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
const offA = createCanvas(W, H), offB = createCanvas(W, H), gA = offA.getContext('2d'), gB = offB.getContext('2d');
function paintScene(ctx, i, f, jit) { ctx.setTransform(1, 0, 0, 1, 0, 0); const c = camFor(i, f); ctx.translate(540, 1010); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y); SCENES[i](ctx, f, jit, c); ctx.setTransform(1, 0, 0, 1, 0, 0); }
function speedLines(ctx, v, seed, vertical = false) { if (v <= 0.05) return; const q = rng(seed); ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 26; i++) { const a = q() * (vertical ? W : H), len = 200 + q() * 700, b = q() * (vertical ? H : W); ctx.strokeStyle = `rgba(255,255,255,${(0.25 + 0.5 * q()) * v})`; ctx.lineWidth = 3 + q() * 9; ctx.beginPath(); if (vertical) { ctx.moveTo(a, b - len / 2); ctx.lineTo(a, b + len / 2); } else { ctx.moveTo(b - len / 2, a); ctx.lineTo(b + len / 2, a); } ctx.stroke(); } ctx.restore(); }
function draw(f) {
  FRAME = f; const jit = rng(1000 + Math.floor(f / 2) * 2); // engraved line boil steps at 15 drawings/s; motion runs at 30
  let cur = 0; TRANS.forEach((t, i) => { if (f >= t.at + t.d / 2) cur = i + 1; });
  const ti = TRANS.findIndex((t) => f >= t.at && f < t.at + t.d);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (ti < 0) paintScene(g, cur, f, jit);
  else {
    const t = TRANS[ti], p = (f - t.at) / t.d; paintScene(gA, ti, f, jit); paintScene(gB, ti + 1, f, jit);
    if (t.type === 'whip' || t.type === 'whipV') { const e = eio(p), v = Math.sin(Math.PI * p), V = t.type === 'whipV'; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (const [src, o0] of [[offA, -(V ? H : W) * e], [offB, (V ? H : W) * (1 - e)]]) { g.globalAlpha = 1; g.drawImage(src, V ? 0 : o0, V ? o0 : 0); for (let k = 1; k <= 3; k++) { g.globalAlpha = 0.22 * v; g.drawImage(src, V ? 0 : o0 + k * 34 * v, V ? o0 + k * 34 * v : 0); } }
      g.globalAlpha = 1; speedLines(g, v, 900 + ti, V); }
    else if (t.type === 'dive') { /* fly into the wedge's skin: the weigh-in zooms past, the skin close-up grows in */
      const e = eio(p); g.save(); g.translate(t.cx, t.cy); const z = 1 + 7 * e * e; g.scale(z, z); g.translate(-t.cx, -t.cy); g.globalAlpha = 1 - seg(p, 0.3, 0.62); g.drawImage(offA, 0, 0); g.restore();
      g.save(); g.globalAlpha = seg(p, 0.3, 0.62); const s = lerp(0.75, 1, eo(seg(p, 0.3, 1))); g.translate(540, 1010); g.scale(s, s); g.translate(-540, -1010); g.drawImage(offB, 0, 0); g.restore();
      g.globalAlpha = 1; softGlow(g, 540, 1000, 900, '255,150,140', 0.6 * Math.sin(Math.PI * p)); }
    else { /* ribbon: a giant twisting peel sweeps diagonally across; the next scene is revealed behind it */
      g.drawImage(offA, 0, 0); const s = lerp(-500, W + 0.6 * H + 500, eio(p)), x1 = s + 0.6 * 60, x2 = s - 0.6 * (H + 60);
      g.save(); g.beginPath(); g.moveTo(-3000, -60); g.lineTo(x1, -60); g.lineTo(x2, H + 60); g.lineTo(-3000, H + 60); g.closePath(); g.clip(); g.drawImage(offB, 0, 0); g.restore();
      const pts = []; for (let k = 0; k <= 40; k++) { const u = k / 40; pts.push([lerp(x1, x2, u) - 0, lerp(-60, H + 60, u)]); } ribbon(g, pts, 260, { twist: 0.45, phase: f * 0.3 }); }
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.4; g.drawImage(grain, 0, 0); g.restore();
  drawCTA(g, f, rng(5000 + Math.floor(f / 2) * 2));
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same curiosity words, larger */
  FRAME = -1; g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540, 1300); g.scale(1.03, 1.03); g.translate(-540, -1300);
  shopComposition(g, 0, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.4; g.drawImage(grain, 0, 0); g.restore();
  label(g, "WHAT'S IN", 540, 560, 196, WHITE, 1, -0.04, 790); label(g, 'THE PEEL?', 540, 750, 196, YELLOW, 1, -0.04, 790);
}

const args = process.argv.slice(2), si = args.indexOf('--still');
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (args.includes('--thumb')) { drawThumb(); fs.writeFileSync(path.join(here, 'build', 'thumbnail.png'), await canvas.encode('png')); fs.writeFileSync(path.join(here, 'build', 'textlog-thumb.json'), JSON.stringify(TEXT_LOG)); process.exit(0); }
if (si >= 0) { for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); } fs.writeFileSync(path.join(here, 'build', 'textlog-stills.json'), JSON.stringify(TEXT_LOG)); }
else {
  const out = path.join(here, 'build', 'video-noaudio.mp4'); const t0 = Date.now();
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { draw(f); if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(path.join(here, 'build', 'textlog.json'), JSON.stringify(TEXT_LOG)); console.log('done', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}

