// CalMeter English 30 s english-24 (batch 24, 2026-11-23): carrots, what does the orange turn into? "ORANGE INTO WHAT?".
// The requested "same potato: boiled, baked and fried" overlapped english-11 (a baked potato + butter) and the water-loss (english-08/10/13/17)
// and added-oil (english-07/11/12) mechanisms; batch 23 was milk calcium. So an unrelated same-genre subject with a different question, setting
// and mechanism was chosen: a carrot's orange pigment (beta-carotene) that the body converts into vitamin A, which the eyes use in low light.
// USDA FDC 170393 raw carrots: 835 ug RAE vitamin A / 100 g (93 % of the 900 ug US DV); medium carrot 61 g -> 509 ug (57 %). MedlinePlus vitamin A.
// Garden cross-section (frame 0 = thumbnail) -> the carrot pops out, an eye opens in the sky -> dive into the orange: beta-carotene chains snipped
// by a friendly enzyme into vitamin A -> whip to a dim night garden: vitamin A flows into an eye, the scene lights up -> iris out of the pupil to a
// sunny board: a day battery charges past 90 % (100 g sticks), then one carrot keeps it above half -> soil-wave CTA.
// Shared engine from english-20..23 (captions 80 px in y 280-460, labels, kinetic numbers, bgScene, effects, whip/dive). Original Canvas2D.
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
// ---------------- carrot parts (original drawings)
const CARROT = '#FF8A1C', CARROT_D = '#D9560A', CARROT_L = '#FFC069', LEAF_A = '#3FA535', LEAF_B = '#7ED957';
function carrotM(g, x, y, s, rot, f, o = {}) {
  /* the carrot mascot: origin at the shoulder (top centre of the root); the root tapers down to the tip at y = 2.3 s; leafy top above */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  const L = s * 2.3, w = s * 0.5;
  // leafy top: feathery stalks
  const sway = Math.sin(f * 0.08 + (o.seed ?? 0)) * 0.08;
  for (let i = -3; i <= 3; i++) { g.save(); g.rotate(i * 0.22 + sway); const h = s * (1.05 - Math.abs(i) * 0.1);
    g.strokeStyle = OUTLINE; g.lineWidth = Math.max(4, s * 0.06); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(i * 6, -h * 0.5, 0, -h); g.stroke(); g.strokeStyle = LEAF_A; g.lineWidth = Math.max(2.5, s * 0.035); g.stroke();
    for (let k = 1; k <= 4; k++) { const t = k / 5, ly = -h * t; for (const sd of [-1, 1]) { g.fillStyle = k % 2 ? LEAF_B : LEAF_A; g.beginPath(); g.ellipse(sd * s * 0.1, ly - s * 0.02, s * 0.12 * (1.2 - t * 0.6), s * 0.05, sd * -0.6, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2; g.stroke(); } }
    g.restore(); }
  // arms
  if (o.arms) { const up = o.arms; g.strokeStyle = OUTLINE; g.lineCap = 'round'; for (const sd of [-1, 1]) { const ax = sd * w * 0.85, ay = s * 0.55, hx = ax + sd * s * 0.45, hy = ay - s * 0.6 * up + s * 0.3 * (1 - up); g.lineWidth = s * 0.07; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + sd * s * 0.3, ay + s * 0.08, hx, hy); g.stroke(); g.strokeStyle = CARROT_L; g.lineWidth = s * 0.035; g.stroke(); g.strokeStyle = OUTLINE; g.fillStyle = '#FFE2B8'; g.lineWidth = s * 0.02; g.beginPath(); g.arc(hx, hy, s * 0.07, 0, 7); g.fill(); g.stroke(); } }
  // root body: tapered with a rounded shoulder
  const body = () => { g.beginPath(); g.moveTo(-w, s * 0.12); g.quadraticCurveTo(-w, -s * 0.06, 0, -s * 0.06); g.quadraticCurveTo(w, -s * 0.06, w, s * 0.12); g.quadraticCurveTo(w * 0.85, L * 0.55, s * 0.05, L); g.quadraticCurveTo(0, L + s * 0.06, -s * 0.05, L); g.quadraticCurveTo(-w * 0.85, L * 0.55, -w, s * 0.12); g.closePath(); };
  body(); const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, CARROT_L); gr.addColorStop(0.45, CARROT); gr.addColorStop(1, CARROT_D); g.fillStyle = gr; g.fill();
  if (o.glow) { softGlow(g, 0, L * 0.35, s * 1.3, '255,170,60', 0.35 * o.glow); }
  g.save(); body(); g.clip(); g.strokeStyle = 'rgba(150,60,0,0.55)'; g.lineWidth = Math.max(2, s * 0.022); g.lineCap = 'round'; const q = rng(o.seed ?? 3);
  for (let k = 1; k < 9; k++) { const yy = L * (k / 9) + (q() - 0.5) * 10, half = w * (1 - k / 10); g.beginPath(); g.moveTo(-half * (0.2 + q() * 0.5), yy); g.quadraticCurveTo(0, yy + 6, half * (0.2 + q() * 0.4), yy - 2); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(-w * 0.45, L * 0.25, w * 0.14, L * 0.2, 0.05, 0, 7); g.fill(); g.restore();
  body(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, s * 0.04); g.lineJoin = 'round'; g.stroke();
  for (const [yy, sd] of [[0.5, 1], [0.68, -1], [0.82, 1]]) { g.strokeStyle = OUTLINE; g.lineWidth = 2; g.beginPath(); g.moveTo(sd * w * (1 - yy) * 0.9, L * yy); g.lineTo(sd * (w * (1 - yy) * 0.9 + s * 0.1), L * yy + s * 0.06); g.stroke(); }
  if (o.face) faceOn(g, 0, s * 0.42, s * 0.085, o);
  g.restore();
}
function stick(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); const gr = g.createLinearGradient(0, -s * 0.18, 0, s * 0.18); gr.addColorStop(0, CARROT_L); gr.addColorStop(1, CARROT_D); g.fillStyle = gr; g.beginPath(); g.roundRect(-s, -s * 0.16, s * 2, s * 0.32, s * 0.14); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, s * 0.06); g.stroke(); g.strokeStyle = 'rgba(150,60,0,0.4)'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * s * 0.35, -s * 0.12); g.lineTo(k * s * 0.35 + 4, s * 0.12); g.stroke(); } g.restore(); }
function worm(g, x, y, s, f) { const pts = []; for (let i = 0; i <= 12; i++) pts.push([x + i * s * 0.12, y + Math.sin(i * 0.8 + f * 0.2) * s * 0.08]); g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = s * 0.26; poly(g, pts, false); g.stroke(); g.strokeStyle = '#F29AA8'; g.lineWidth = s * 0.18; poly(g, pts, false); g.stroke(); g.strokeStyle = 'rgba(180,80,100,0.6)'; g.lineWidth = 2; for (let i = 2; i < 12; i += 2) { const [px, py] = pts[i]; g.beginPath(); g.moveTo(px, py - s * 0.08); g.lineTo(px, py + s * 0.08); g.stroke(); } const [hx, hy] = pts[12]; eyes(g, hx - s * 0.02, hy - s * 0.02, s * 0.035, [0.6, -0.3], 0, 0.5); g.restore(); }
function soilBand(g, top, f, seed) {
  /* layered soil cross-section from y = top to the bottom of the frame: bands, pebbles, root threads */
  const gr = g.createLinearGradient(0, top, 0, H); gr.addColorStop(0, '#8A5A33'); gr.addColorStop(0.4, '#6B4226'); gr.addColorStop(1, '#3E2414'); g.fillStyle = gr; g.fillRect(-300, top, W + 600, H - top + 300);
  g.fillStyle = 'rgba(255,220,170,0.08)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-300, top + 140 + k * 190); for (let x = -300; x <= W + 300; x += 60) g.lineTo(x, top + 140 + k * 190 + Math.sin(x * 0.01 + k) * 14); g.lineTo(W + 300, top + 200 + k * 190); g.lineTo(-300, top + 200 + k * 190); g.closePath(); g.fill(); }
  const q = rng(seed); for (let i = 0; i < 30; i++) { const x = q() * W, y = top + 60 + q() * (H - top), r = 8 + q() * 18; g.fillStyle = q() < 0.5 ? '#A88A6A' : '#7E6550'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, q() * 3, 0, 7); g.fill(); g.strokeStyle = 'rgba(30,15,5,0.6)'; g.lineWidth = 2; g.stroke(); }
  g.strokeStyle = 'rgba(240,220,190,0.35)'; g.lineWidth = 2.5; for (let i = 0; i < 10; i++) { const x0 = q() * W, y0 = top + q() * 200; g.beginPath(); g.moveTo(x0, y0); for (let k = 1; k <= 6; k++) g.lineTo(x0 + (q() - 0.5) * 60 * k * 0.4, y0 + k * 30); g.stroke(); }
  // grass rim
  g.fillStyle = '#4CAF3A'; g.beginPath(); g.moveTo(-300, top + 18); for (let x = -300; x <= W + 300; x += 18) g.lineTo(x, top - 10 - (Math.sin(x * 0.7) * 0.5 + 0.5) * 22 + Math.sin(f * 0.05 + x) * 2); g.lineTo(W + 300, top + 18); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 3; g.beginPath(); g.moveTo(-300, top + 14); g.lineTo(W + 300, top + 14); g.stroke();
}
function molecule(g, x, y, s, rot, cut, f) {
  /* a beta-carotene chain (zigzag between two rings); cut 0..1 snips it in the middle into two vitamin A halves (yellow, glowing) */
  g.save(); g.translate(x, y); g.rotate(rot);
  const col = cut > 0.5 ? mix('#FF8A1C', '#FFE14D', seg(cut, 0.5, 1)) : '#FF8A1C'; const gap = s * 0.6 * eo(seg(cut, 0.3, 1));
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * gap, 0);
    const pts = []; for (let i = 0; i <= 9; i++) pts.push([sd * (s * 0.12 + i * s * 0.1), (i % 2 ? -1 : 1) * s * 0.06]);
    if (cut > 0.5) softGlow(g, sd * s * 0.6, 0, s * 0.6, '255,230,120', 0.6 * seg(cut, 0.5, 1));
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = s * 0.07; poly(g, pts, false); g.stroke(); g.strokeStyle = col; g.lineWidth = s * 0.04; poly(g, pts, false); g.stroke();
    const hx = sd * (s * 0.12 + 9 * s * 0.1 + s * 0.15); g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283 + Math.PI / 6; g.lineTo(hx + Math.cos(a) * s * 0.16, Math.sin(a) * s * 0.16); } g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = s * 0.035; g.stroke();
    g.restore(); }
  if (cut <= 0.3) { g.strokeStyle = OUTLINE; g.lineWidth = s * 0.07; g.beginPath(); g.moveTo(-s * 0.12, s * 0.06); g.lineTo(s * 0.12, s * 0.06); g.stroke(); g.strokeStyle = '#FF8A1C'; g.lineWidth = s * 0.04; g.stroke(); }
  g.restore();
}
function enzyme(g, x, y, s, f, chomp, o = {}) {
  /* a friendly green "snipper" helper (the body's converting enzyme, drawn as a character) */
  g.save(); g.translate(x, y); const m = 0.15 + 0.55 * Math.abs(Math.sin(chomp * Math.PI));
  g.fillStyle = '#6FD36A'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, s, m, Math.PI * 2 - m); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, s * 0.07); g.lineJoin = 'round'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(-s * 0.35, -s * 0.45, s * 0.3, s * 0.12, -0.4, 0, 7); g.fill();
  eyes(g, -s * 0.15, -s * 0.45, s * 0.13, o.look ?? [0.8, 0], o.blink ?? 0, 0.6); g.restore();
}
function bigEye(g, cx, cy, s, open, glow, f) {
  /* a large cartoon eye; open 0..1; glow 0..1 lights the retina (vitamin A pigments) */
  g.save(); g.translate(cx, cy); const ry = s * 0.62 * Math.max(0.04, open);
  g.save(); g.beginPath(); g.ellipse(0, 0, s, ry, 0, 0, 7); g.clip(); g.fillStyle = '#FFFFFF'; g.fillRect(-s, -s, 2 * s, 2 * s);
  const ir = s * 0.42, ig = g.createRadialGradient(0, 0, ir * 0.2, 0, 0, ir); ig.addColorStop(0, '#7BD3FF'); ig.addColorStop(1, '#1D6FB8'); g.fillStyle = ig; g.beginPath(); g.arc(0, 0, ir, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 2; for (let k = 0; k < 18; k++) { const a = (k / 18) * 6.283; g.beginPath(); g.moveTo(Math.cos(a) * ir * 0.5, Math.sin(a) * ir * 0.5); g.lineTo(Math.cos(a) * ir * 0.95, Math.sin(a) * ir * 0.95); g.stroke(); }
  g.fillStyle = '#0B0F1A'; g.beginPath(); g.arc(0, 0, ir * 0.48, 0, 7); g.fill();
  if (glow > 0) softGlow(g, 0, 0, ir * 0.9, '255,214,90', 0.75 * glow);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(-ir * 0.25, -ir * 0.28, ir * 0.16, 0, 7); g.fill(); g.restore();
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(5, s * 0.03); g.beginPath(); g.ellipse(0, 0, s, ry, 0, 0, 7); g.stroke();
  g.lineCap = 'round'; for (let k = -3; k <= 3; k++) { const a = -Math.PI / 2 + k * 0.28; g.beginPath(); g.moveTo(Math.cos(a) * s * 0.98, Math.sin(a) * ry * 0.98); g.lineTo(Math.cos(a) * s * 1.12, Math.sin(a) * ry * 1.12 - s * 0.05); g.stroke(); }
  g.restore();
}
function battery(g, x, y, w, h, frac, f) {
  /* a "day's vitamin A" battery: rounded case, terminal, orange charge with a moving highlight */
  g.save(); softShadow(g, x + 10, y + h / 2 + 14, w * 0.55, 14, 0.25);
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h * 0.22); g.fill();
  const pad = h * 0.14, fw = (w - 2 * pad) * clamp(frac); if (fw > 2) { const gr = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, '#FFC069'); gr.addColorStop(1, '#F26B0A'); g.fillStyle = gr; g.beginPath(); g.roundRect(x - w / 2 + pad, y - h / 2 + pad, fw, h - 2 * pad, h * 0.12); g.fill();
    const hx = x - w / 2 + pad + ((f * 6) % Math.max(20, fw)); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(hx, y - h / 2 + pad, 18, h - 2 * pad); }
  for (let k = 1; k < 10; k++) { const tx = x - w / 2 + pad + (w - 2 * pad) * k / 10; g.strokeStyle = 'rgba(30,20,10,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, y - h / 2 + pad); g.lineTo(tx, y + h / 2 - pad); g.stroke(); }
  g.strokeStyle = OUTLINE; g.lineWidth = 7; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h * 0.22); g.stroke();
  g.fillStyle = OUTLINE; g.beginPath(); g.roundRect(x + w / 2 + 4, y - h * 0.2, h * 0.16, h * 0.4, 6); g.fill();
  g.restore();
}
// ---------------- A+B: the garden (frame 0 = thumbnail): a glowing carrot underground; it pops out; an eye opens in the sky
function gardenComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 20 : f, ground = 1060;
  const sky = g.createLinearGradient(0, 0, 0, ground); sky.addColorStop(0, '#FFB36B'); sky.addColorStop(1, '#FFE6A8'); g.fillStyle = sky; g.fillRect(-300, -300, W + 600, ground + 300);
  g.save(); g.translate(540, ground - 40); g.rotate(ph * 0.002); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1400, a, a + 0.11); g.closePath(); g.fill(); } g.restore();
  softGlow(g, 540, ground - 40, 360, '255,250,220', 0.6);
  // the eye in the sky opens on "eyes"
  const eo2 = still ? 0 : eio(seg(f, E.skyEye, E.skyEye + 10)); if (eo2 > 0) bigEye(g, 770, 690, 190, eo2, 0, ph);
  soilBand(g, ground, ph, 31);
  softGlow(g, 540, ground + 380, 480, '255,150,40', 0.5);
  worm(g, 760 + Math.sin(ph * 0.03) * 20, 1700, 260, ph);
  // the carrot: underground, wiggles, then pops out and lands on the grass
  const pop = still ? 0 : seg(f, E.pop, E.pop + 22); const wig = still ? 0 : seg(f, E.pop - 18, E.pop) * Math.sin(f * 1.4) * 0.06;
  const cy = pop <= 0 ? ground + 20 : lerp(ground + 20, ground - 620, Math.sin(Math.PI * 0.5 * clamp(pop / 0.55))) * (pop < 0.55 ? 1 : 0) + (pop >= 0.55 ? lerp(ground - 620, ground - 330, bounce(seg(pop, 0.55, 1))) : 0);
  if (pop > 0 && pop < 0.6) { for (let i = 0; i < 16; i++) { const q = rng(60 + i); const t = seg(pop, 0, 0.6); g.fillStyle = q() < 0.5 ? '#6B4226' : '#8A5A33'; g.beginPath(); g.arc(540 + (q() - 0.5) * 500 * t, ground - 300 * Math.sin(Math.PI * t) * q() + 200 * t * t, 8 + q() * 10, 0, 7); g.fill(); } }
  if (pop > 0) { g.fillStyle = '#2A170B'; g.beginPath(); g.ellipse(540, ground + 16, 160, 32, 0, 0, 7); g.fill(); }
  carrotM(g, lerp(540, 320, eio(seg(pop, 0.1, 0.6))), cy, lerp(262, 236, seg(pop, 0.5, 1)), wig + (pop > 0.55 ? Math.sin(f * 0.12) * 0.04 : 0), ph, { face: true, glow: 1, arms: pop > 0.55 ? 0.8 + 0.2 * Math.sin(f * 0.3) : 0.3, look: pop > 0.55 ? [0, -1] : [0.3, -0.7], blink: Math.max(0, 1 - Math.abs(ph - 50) / 3), mood: pop > 0.55 ? 0.8 : 0.3, seed: 4 });
  for (let i = 0; i < 6; i++) { const q = rng(i * 11 + 9); sparkle(g, 330 + q() * 420, ground + 120 + q() * 460, 14 + q() * 10, Math.abs(Math.sin(ph * 0.11 + i * 1.3))); }
  if (words > 0) { label(g, 'ORANGE', 540, 642, 156, WHITE, words, -0.04, 700); label(g, 'INTO WHAT?', 540, 778, 128, YELLOW, words, -0.04, 700); }
}
function sceneGarden(g, f, jit) { gardenComposition(g, f, jit, 1 - seg(f, 88, 98)); }
// ---------------- C: inside the orange: beta-carotene chains; a friendly enzyme snips them into vitamin A
const MOLS = Array.from({ length: 5 }, (_, i) => { const q = rng(1200 + i); return { x: 300 + (i % 2) * 300 + q() * 80, y: 840 + i * 155, s: 215 + q() * 35, r: (q() - 0.5) * 0.5, d: q() }; });
const CELLS = Array.from({ length: 16 }, (_, i) => { const q = rng(1300 + i); return { x: q() * 1200 - 60, y: q() * 2000, r: 60 + q() * 110, d: q() }; });
function scenePigment(g, f, jit, cam) {
  bgScene(g, '#FFB04A', '#C24A00', f, 31, 540, 1050, cam);
  for (const c of CELLS) { const y = ((c.y - f * (0.6 + c.d)) % 2100 + 2100) % 2100 - 60; g.save(); g.globalAlpha = 0.35 + 0.3 * c.d; g.fillStyle = 'rgba(255,200,120,0.5)'; g.strokeStyle = 'rgba(160,60,0,0.5)'; g.lineWidth = 3; g.beginPath(); g.ellipse(c.x, y, c.r, c.r * 0.75, c.d * 3, 0, 7); g.fill(); g.stroke(); g.restore(); }
  const snipStart = E.convert;
  MOLS.forEach((m, i) => { const t0 = snipStart + i * 4; const cut = seg(f, t0, t0 + 14); molecule(g, m.x + Math.sin(f * 0.04 + i) * 20, m.y + Math.cos(f * 0.05 + i) * 14, m.s, m.r + Math.sin(f * 0.03 + i) * 0.1, cut, f); });
  if (f >= snipStart - 16) { const i = clamp(Math.floor((f - snipStart) / 4), 0, MOLS.length - 1); const m = MOLS[i]; const ex = lerp(-160, m.x + Math.sin(f * 0.04 + i) * 20 - 30, eo(seg(f, snipStart - 16, snipStart))); enzyme(g, ex, m.y - 95, 95, f, (f - snipStart) / 4, { look: [0.8, 0.5] }); }
  label(g, 'BETA-CAROTENE', 540, 600, 116, WHITE, seg(f, E.beta, E.beta + 8) * (1 - seg(f, E.vitA - 8, E.vitA - 2)), -0.02, 700);
  kinetic(g, 'VITAMIN A', 540, 626, 146, YELLOW, seg(f, E.vitA, E.vitA + 8), f, E.vitA, 0.02, 700);
}
// ---------------- D: night garden: vitamin A flows into an eye; the retina glows; the dim scene lights up
function sceneEye(g, f, jit, cam) {
  const lit = eo(seg(f, E.lowLight, E.lowLight + 24));
  bgScene(g, mix('#3B4BA8', '#6C8FE0', lit), mix('#0A0F2E', '#1E2F6E', lit), f, 32, 540, 1100, cam);
  g.fillStyle = '#FFF6D0'; g.beginPath(); g.arc(860, 640, 70, 0, 7); g.fill(); g.fillStyle = mix('#3B4BA8', '#6C8FE0', lit); g.beginPath(); g.arc(890, 620, 64, 0, 7); g.fill();
  const q = rng(77); for (let i = 0; i < 30; i++) sparkle(g, q() * W, 520 + q() * 500, 4 + q() * 5, 0.4 + 0.4 * Math.sin(f * 0.1 + i));
  // silhouettes: trees, fence, a cat; they gain colour as the eye "sees" in low light
  const sil = mix('#0C1230', '#2E6B3A', lit), sil2 = mix('#0C1230', '#8A5A33', lit);
  g.fillStyle = sil; for (const [tx, ts] of [[120, 1.1], [960, 0.9]]) { g.beginPath(); g.arc(tx, 1290 - 160 * ts, 150 * ts, 0, 7); g.arc(tx - 90 * ts, 1300 - 90 * ts, 100 * ts, 0, 7); g.arc(tx + 90 * ts, 1300 - 90 * ts, 100 * ts, 0, 7); g.fill(); g.fillStyle = sil2; g.fillRect(tx - 22 * ts, 1290 - 60 * ts, 44 * ts, 240); g.fillStyle = sil; }
  g.fillStyle = mix('#0A0F26', '#3E8E3A', lit); g.fillRect(-300, 1480, W + 600, 800);
  g.fillStyle = sil2; for (let k = 0; k < 9; k++) g.fillRect(250 + k * 70, 1400, 22, 110); g.fillRect(230, 1430, 620, 16);
  g.save(); g.translate(720, 1395); g.fillStyle = mix('#05070F', '#F28C28', lit); g.beginPath(); g.ellipse(0, 0, 60, 42, 0, 0, 7); g.arc(52, -40, 34, 0, 7); g.fill(); g.beginPath(); g.moveTo(34, -66); g.lineTo(44, -92); g.lineTo(56, -70); g.moveTo(60, -70); g.lineTo(74, -92); g.lineTo(80, -64); g.fill(); g.lineWidth = 10; g.strokeStyle = mix('#05070F', '#F28C28', lit); g.lineCap = 'round'; g.beginPath(); g.moveTo(-58, 0); g.quadraticCurveTo(-110, -20, -100, -70); g.stroke();
  if (lit > 0.3) { eyes(g, 52, -42, 7, [0.4, 0], 0, 0.5); } else { g.fillStyle = '#FFE14D'; g.beginPath(); g.ellipse(44, -44, 6, 4, 0, 0, 7); g.ellipse(62, -44, 6, 4, 0, 0, 7); g.fill(); } g.restore();
  // the big eye and the vitamin A stream into it
  const open = eo(seg(f, E.whipCD + 4, E.whipCD + 18)); const glow = seg(f, E.pigments, E.pigments + 20);
  if (f > E.whipCD + 8) for (let i = 0; i < 10; i++) { const t = ((f - E.whipCD) * 0.03 + i / 10) % 1; const [x, y] = flight({ x: -60 + (i % 3) * 30, y: 760 + (i % 4) * 60 }, { x: 540, y: 920 }, eio(t), 160); molecule(g, x, y, 60, t * 4, 1, f); }
  bigEye(g, 540, 920, 270, open, glow, f);
  label(g, 'EYE PIGMENTS', 540, 600, 120, YELLOW, seg(f, E.pigments, E.pigments + 8) * (1 - seg(f, E.lowLight - 8, E.lowLight - 2)), -0.02, 700);
  kinetic(g, 'SEE IN LOW LIGHT', 540, 600, 110, WHITE, seg(f, E.lowLight, E.lowLight + 8), f, E.lowLight, 0.02, 700);
}
// ---------------- E+F: a sunny board: 100 g of sticks charge the day battery past 90 %; then one carrot keeps it above half
function sceneBattery(g, f, jit, cam) {
  bgScene(g, '#9BE36B', '#1F7A2A', f, 33, 540, 1050, cam);
  const swap = seg(f, E.oneCarrot - 10, E.oneCarrot + 6);
  const frac = lerp(0.928 * eo(seg(f, E.charge, E.charge + 40)), 0.566, eio(seg(f, E.oneCarrot, E.oneCarrot + 30)));
  battery(g, 540, 850, 560, 170, frac, f);
  // board
  softShadow(g, 560, 1390, 360, 26, 0.3); g.fillStyle = '#D9A066'; g.beginPath(); g.roundRect(200, 1180, 680, 200, 40); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(230, 1200, 620, 18);
  // 100 g of carrot sticks drop in, then slide off for one carrot
  for (let i = 0; i < 12; i++) { const t = seg(f, E.sticks + i * 2, E.sticks + i * 2 + 12); if (t <= 0) continue; const row = Math.floor(i / 4), col = i % 4; const x = 320 + col * 140 + lerp(0, 900, eio(swap)) , y = lerp(700, 1240 - row * 40, bounce(t)); stick(g, x, y, 62, (i % 3 - 1) * 0.15); }
  const cp = back(seg(f, E.oneCarrot - 6, E.oneCarrot + 12)); if (cp > 0) carrotM(g, lerp(-300, 500, cp), 1100 + Math.sin(f * 0.1) * 6, 150, -1.45, f, { face: true, arms: 0.7 + 0.3 * Math.sin(f * 0.25), look: [0.3, -0.9], mood: 1, seed: 6 });
  { const a1 = seg(f, E.k90, E.k90 + 8) * (1 - seg(f, E.oneCarrot - 8, E.oneCarrot - 2)); kinetic(g, 'OVER 90%', 540, 614, 146, WHITE, a1, f, E.k90, -0.02, 700); label(g, 'OF A DAY', 540, 694, 70, WHITE, a1, -0.02, 700); }
  { const a2 = seg(f, E.half, E.half + 8); label(g, '1 CARROT', 540, 594, 78, WHITE, a2, 0.02, 700); kinetic(g, 'OVER HALF A DAY', 540, 698, 100, YELLOW, a2, f, E.half, 0.02, 700); }
  for (let i = 0; i < 6; i++) { const q2 = rng(990 + i); sparkle(g, 300 + q2() * 480, 770 + q2() * 160, 12 + q2() * 8, Math.abs(Math.sin(f * 0.12 + i)) * seg(f, E.charge + 30, E.charge + 40)); }
}
// ---------------- cameras (per scene)
const SPANS = () => [[0, E.dive + 20], [E.dive, E.whipCD + 12], [E.whipCD, E.iris + 20], [E.iris, N]];
function camFor(i, f) {
  const [a, b] = SPANS()[i]; const z = 1 + 0.045 * eio(seg(f, a, b));
  const kicks = [E.beta, E.vitA, E.pigments, E.lowLight, E.k90, E.half].reduce((s, e) => s + 0.02 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  const [sx, sy] = [shake(f, E.pop, 14), shake(f, E.pop + 14, 10)].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
  return { z: z * (1 + kicks), x: 540 - sx, y: 1010 - sy };
}

// ---------------- paper grain (print texture), CTA seal (white wordmark on colour)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.05)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } }
// ---------------- soil wave (rises with a grass rim), used for the CTA
function soilWave(g, topY, f) {
  g.save(); const edge = (x) => topY + Math.sin(x * 0.012 + f * 0.22) * 22 + Math.sin(x * 0.033 - f * 0.15) * 10;
  const gr = g.createLinearGradient(0, topY, 0, topY + 900); gr.addColorStop(0, '#8A5A33'); gr.addColorStop(1, '#3E2414'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(-40, H + 60); for (let x = -40; x <= W + 40; x += 30) g.lineTo(x, edge(x)); g.lineTo(W + 40, H + 60); g.closePath(); g.fill();
  const q = rng(41); for (let i = 0; i < 26; i++) { const x = q() * W, y = edge(x) + 80 + q() * 1600; g.fillStyle = q() < 0.5 ? 'rgba(168,138,106,0.8)' : 'rgba(126,101,80,0.8)'; g.beginPath(); g.ellipse(x, y, 10 + q() * 14, 7 + q() * 9, q() * 3, 0, 7); g.fill(); }
  g.fillStyle = '#4CAF3A'; g.beginPath(); g.moveTo(-40, edge(-40) + 20); for (let x = -40; x <= W + 40; x += 16) g.lineTo(x, edge(x) - 8 - (Math.sin(x * 0.9) * 0.5 + 0.5) * 22); g.lineTo(W + 40, edge(W + 40) + 20); g.closePath(); g.fill();
  g.strokeStyle = OUTLINE; g.lineWidth = 4; g.beginPath(); for (let x = -40; x <= W + 40; x += 30) x === -40 ? g.moveTo(x, edge(x) + 16) : g.lineTo(x, edge(x) + 16); g.stroke(); g.restore();
}
// ---------------- CTA: the soil wave rises; the carrot pops up waving; sprouts and sparkles; seal + white wordmark
function drawCTA(g, f, jit) {
  const c = eio(seg(f, E.cta, E.cta + 18)); if (c <= 0) return;
  soilWave(g, lerp(H + 80, -100, c), f);
  const r = seg(f, E.cta + 12, E.cta + 26); if (r <= 0) return;
  for (let i = 0; i < 14; i++) { const q = rng(1500 + i); const t = ((f - E.cta) * (0.005 + q() * 0.006) + q()) % 1; sparkle(g, 80 + q() * 920, lerp(1650, 560, t), 10 + q() * 10, 0.6 + 0.4 * Math.sin(f * 0.2 + i)); }
  for (let i = 0; i < 5; i++) { const sx = 150 + i * 195, gr2 = back(seg(f, E.cta + 14 + i * 4, E.cta + 30 + i * 4)); if (gr2 <= 0) continue; g.save(); g.translate(sx, 1560); g.scale(gr2, gr2); g.strokeStyle = OUTLINE; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -70); g.stroke(); g.strokeStyle = LEAF_A; g.lineWidth = 4; g.stroke(); for (const sd of [-1, 1]) { g.fillStyle = LEAF_B; g.beginPath(); g.ellipse(sd * 26, -70, 28, 13, sd * -0.5, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 3; g.stroke(); } g.restore(); }
  const pop = back(seg(f, E.cta + 8, E.cta + 26));
  carrotM(g, 540, lerp(1500, 880, pop) + Math.sin(f * 0.13) * 10, 170, Math.sin(f * 0.1) * 0.06, f, { face: true, arms: 0.6 + 0.4 * Math.sin(f * 0.25), look: [Math.sin(f * 0.07) * 0.5, 0.2], mood: 1, blink: Math.max(0, 1 - Math.abs(f - 876) / 4), seed: 8, glow: 0.6 });
  g.font = '900 84px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 60, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1340;
  const sc = 0.5 + 0.5 * back(r); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  g.save(); g.globalAlpha = r; g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = WHITE; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.restore();
  const wr = seg(f, E.cta + 16, E.cta + 36), s = 'CalMeter';
  if (wr > 0) { const sub = s.slice(0, Math.ceil(s.length * wr)); g.save(); g.font = '900 84px NDisplay'; g.textAlign = 'left'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 13; g.strokeText(sub, cx + R0 + gap, cy + 30); g.restore(); text(g, sub, cx + R0 + gap, cy + 30, '900 84px NDisplay', WHITE, 'left', 0, 'cta'); }
  const sh = seg(f, E.ctaWord, E.ctaWord + 36); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 30, '900 84px NDisplay', YELLOW, 'left', 0, 'cta'); g.restore(); }
  const tk = seg(f, E.cta + 30, E.cta + 80); g.strokeStyle = WHITE; g.lineWidth = 1.6; for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 10), cy + Math.sin(a) * (R0 + 10)); g.lineTo(cx + Math.cos(a) * (R0 + 18), cy + Math.sin(a) * (R0 + 18)); g.stroke(); }
}
// ---------------- compositor: dive into the orange, whip, iris out of the pupil; then grain, CTA, captions
const SCENES = [sceneGarden, scenePigment, sceneEye, sceneBattery];
const TRANS = [{ at: E.dive, d: 18, type: 'dive' }, { at: E.whipCD, d: 12, type: 'whip' }, { at: E.iris, d: 18, type: 'iris' }];
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
const offA = createCanvas(W, H), offB = createCanvas(W, H), gA = offA.getContext('2d'), gB = offB.getContext('2d');
function paintScene(ctx, i, f, jit) { ctx.setTransform(1, 0, 0, 1, 0, 0); const c = camFor(i, f); ctx.translate(540, 1010); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y); SCENES[i](ctx, f, jit, c); ctx.setTransform(1, 0, 0, 1, 0, 0); }
function speedLines(ctx, v, seed) { if (v <= 0.05) return; const q = rng(seed); ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 26; i++) { const y = q() * H, len = 200 + q() * 700, x = q() * W; ctx.strokeStyle = `rgba(255,255,255,${(0.25 + 0.5 * q()) * v})`; ctx.lineWidth = 3 + q() * 9; ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.lineTo(x + len / 2, y); ctx.stroke(); } ctx.restore(); }
function draw(f) {
  FRAME = f; const jit = rng(1000 + Math.floor(f / 2) * 2); // engraved line boil steps at 15 drawings/s; motion runs at 30
  let cur = 0; TRANS.forEach((t, i) => { if (f >= t.at + t.d / 2) cur = i + 1; });
  const ti = TRANS.findIndex((t) => f >= t.at && f < t.at + t.d);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (ti < 0) paintScene(g, cur, f, jit);
  else {
    const t = TRANS[ti], p = (f - t.at) / t.d;
    if (t.type === 'whip') { const e = eio(p), v = Math.sin(Math.PI * p); paintScene(gA, ti, f, jit); paintScene(gB, ti + 1, f, jit); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (const [src, x0] of [[offA, -W * e], [offB, W * (1 - e)]]) { g.globalAlpha = 1; g.drawImage(src, x0, 0); for (let k = 1; k <= 3; k++) { g.globalAlpha = 0.22 * v; g.drawImage(src, x0 + k * 34 * v, 0); } }
      g.globalAlpha = 1; speedLines(g, v, 900 + ti); }
    else if (t.type === 'dive') { /* fly into the carrot's orange: the garden zooms past, the pigment world grows in */
      paintScene(gA, ti, f, jit); paintScene(gB, ti + 1, f, jit); const e = eio(p);
      g.save(); g.translate(330, 1000); const z = 1 + 7 * e * e; g.scale(z, z); g.translate(-330, -1000); /* zoom into the carrot's orange body */ g.globalAlpha = 1 - seg(p, 0.3, 0.62); g.drawImage(offA, 0, 0); g.restore();
      g.save(); g.globalAlpha = seg(p, 0.3, 0.62); const s = lerp(0.55, 1, eo(seg(p, 0.3, 1))); g.translate(540, 1010); g.scale(s, s); g.translate(-540, -1010); g.drawImage(offB, 0, 0); g.restore();
      g.globalAlpha = 1; softGlow(g, 540, 1000, 900, '255,200,120', 0.7 * Math.sin(Math.PI * p)); }
    else { /* iris: the next scene opens out of the eye's pupil */
      paintScene(gA, ti, f, jit); paintScene(gB, ti + 1, f, jit); g.drawImage(offA, 0, 0); const r = 30 + 1500 * eio(p);
      g.save(); g.beginPath(); g.arc(540, 920, r, 0, 7); g.clip(); g.drawImage(offB, 0, 0); g.restore();
      g.strokeStyle = OUTLINE; g.lineWidth = 14; g.beginPath(); g.arc(540, 920, r, 0, 7); g.stroke(); g.strokeStyle = '#FFE14D'; g.lineWidth = 6; g.stroke(); }
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.4; g.drawImage(grain, 0, 0); g.restore();
  drawCTA(g, f, rng(5000 + Math.floor(f / 2) * 2));
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same curiosity words, larger */
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540, 1300); g.scale(1.03, 1.03); g.translate(-540, -1300);
  gardenComposition(g, 20, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.4; g.drawImage(grain, 0, 0); g.restore();
  label(g, 'ORANGE', 540, 520, 210, WHITE, 1, -0.04, 800); label(g, 'INTO WHAT?', 540, 710, 170, YELLOW, 1, -0.04, 800);
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
