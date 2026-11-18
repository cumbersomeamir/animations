// CalMeter English 30 s english-21 (batch 21, 2026-11-18): one coconut, two foods: coconut water vs coconut meat, "WATER OR MEAT?".
// The requested "roasted vs cooked chickpeas (water changes calories per gram)" was already english-10 (same USDA records, same mechanism,
// same snack payoff), and water-per-gram also carried english-08/13/17, so a genuinely different same-genre subject was chosen: the two
// edible parts of one coconut (USDA FDC 170174 water: 19 kcal/100 g; FDC 170169 meat: 354 kcal/100 g). Same approved full-frame style and
// the 2026-11-18 live feedback as english-20 (84 px captions, big numbers, whip-pan scene changes with motion blur and speed lines, parallax
// rays/bokeh/palm fronds for depth, squash-and-stretch, shakes, kinetic numbers, a playful coconut character).
// Scenes: coral hook (frame 0 = thumbnail: a cracked coconut character, lid flying, water splashing) -> violet whole coconut (water pours
// into a glass 206 g ~ 40 kcal; meat chunks into a bowl 397 g ~ 1,400 kcal) -> sky water per 100 g (95 % water, 19 kcal) -> green meat per
// 100 g (half water, a third fat, 354 kcal) -> pink calorie balance (a 45 g piece ~ 160 kcal = 3.5 glasses) -> CalMeter CTA.
// Shared engine (captions, labels, scale, effects, whip compositor, CTA, QA text log) copied unchanged from english-20. Original Canvas2D.
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
// ---------------- captions: 84 px (auto-fit, never below 66 px) white with dark outline, line 2 yellow, inside x 100-900
function captions(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out);
    c.lines.forEach(([s, f0], li) => { const a = seg(f, f0, f0 + 4) * (1 - out); if (a <= 0) return; let px = 84; g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > 712 && px > 66) { px -= 2; g.font = `900 ${px}px NDisplay`; }
      const pop = 1 + 0.06 * Math.sin(Math.PI * seg(f, f0, f0 + 6)); const y = (li === 0 ? 398 : 494) + 14 * (1 - eo(seg(f, f0, f0 + 6)));
      g.save(); g.globalAlpha = a; g.translate(500, y); g.scale(pop, pop); g.textAlign = 'center'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(25,6,24,0.94)'; g.lineWidth = 15; g.strokeText(s, 0, 0);
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
// ---------------- coconut parts (original drawings): hairy brown shell, white meat, coconut water
const SHELL_C = '#6B4226', SHELL_D = '#3A2112', MEAT = '#FFFDF4', MEAT_D = '#E9E0C8';
function fibres(g, rx, ry, n, seed, a = 0.5) {
  const q = rng(seed); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const t = q() * 6.283, rr = Math.sqrt(q()); const x = Math.cos(t) * rr * rx, y = Math.sin(t) * rr * ry; const l = 8 + q() * 16, an = 1.2 + (q() - 0.5) * 1.0; g.strokeStyle = q() < 0.55 ? `rgba(36,18,6,${a})` : `rgba(196,146,96,${a * 0.85})`; g.lineWidth = 1.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); }
}
function shellGrad(g, r, oy = 0) { const gr = g.createRadialGradient(-r * 0.35, oy - r * 0.4, r * 0.1, 0, oy, r * 1.2); gr.addColorStop(0, '#AE7A4E'); gr.addColorStop(0.55, SHELL_C); gr.addColorStop(1, SHELL_D); return gr; }
function faceOn(g, x, y, r, o) {
  eyes(g, x, y, r, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0);
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, r * 0.3); g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * 1.5, r * (0.9 + 0.4 * (o.mood ?? 0)), 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = 'rgba(255,120,120,0.5)'; g.beginPath(); g.ellipse(x - r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.ellipse(x + r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.fill();
}
function coconutWhole(g, x, y, r, rot, o = {}) {
  /* a whole brown coconut; o.face turns it into the character, otherwise three dark pores at the top */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  if (o.shadow !== false) softShadow(g, r * 0.1, r * 0.95, r * 0.9, r * 0.16, 0.3);
  g.fillStyle = shellGrad(g, r); g.beginPath(); g.ellipse(0, 0, r, r * 0.92, 0, 0, 7); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, 0, r, r * 0.92, 0, 0, 7); g.clip(); fibres(g, r, r * 0.92, Math.round(r * 2.4), o.seed ?? 4);
  g.strokeStyle = 'rgba(28,12,4,0.45)'; g.lineWidth = Math.max(1.5, r * 0.02); for (const k of [-1, 0, 1]) { g.beginPath(); g.ellipse(k * r * 0.22, 0, r * (0.32 + Math.abs(k) * 0.3), r * 0.92, 0, -1.45, 1.45); g.stroke(); }
  g.fillStyle = 'rgba(255,230,190,0.2)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.48, r * 0.42, r * 0.15, -0.5, 0, 7); g.fill(); g.restore();
  burin(g, ell(0, 0, r, r * 0.92, 0, 6.283, 64), Math.max(1.6, r * 0.024), OUTLINE, 1, o.jit);
  if (o.face) faceOn(g, 0, -r * 0.12, r * 0.15, o);
  else { g.fillStyle = '#20100A'; for (const [px, py] of [[-r * 0.14, -r * 0.6], [r * 0.14, -r * 0.6], [0, -r * 0.44]]) { g.beginPath(); g.ellipse(px, py, r * 0.065, r * 0.08, 0, 0, 7); g.fill(); } }
  g.restore();
}
function coconutCup(g, x, y, r, rot, o = {}) {
  /* the bottom half of a cracked coconut, opening up: brown bowl, white meat ring, water inside (o.water 0..1), meat (o.meat 0..1), optional face */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  if (o.shadow !== false) softShadow(g, r * 0.08, r * 0.95, r * 0.95, r * 0.15, 0.3);
  const ry = r * 0.34, meat = o.meat ?? 1;
  // opening: shell edge, white meat ring, inner wall, water surface
  g.fillStyle = SHELL_D; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, 7); g.fill();
  g.fillStyle = MEAT; g.beginPath(); g.ellipse(0, 0, r * 0.95, ry * 0.92, 0, 0, 7); g.fill();
  const iw = 0.95 - 0.16 * meat; g.fillStyle = meat > 0.05 ? MEAT_D : '#5A3520'; g.beginPath(); g.ellipse(0, ry * 0.06, r * iw, ry * iw * 0.95, 0, 0, 7); g.fill();
  const wl = o.water ?? 0; if (wl > 0) { const wr = iw * (0.7 + 0.3 * wl); const wg = g.createLinearGradient(-r, 0, r, 0); wg.addColorStop(0, '#D8F8FF'); wg.addColorStop(1, '#8FDDF2'); g.fillStyle = wg; g.beginPath(); g.ellipse(0, ry * (0.06 + 0.25 * (1 - wl)), r * wr, ry * wr * 0.9, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-r * 0.25, ry * 0.05, r * 0.25, ry * 0.12, 0, 0, 7); g.fill(); }
  // bowl body (front): from the rim's front edge down around the bottom
  g.beginPath(); g.ellipse(0, 0, r, r * 0.9, 0, 0, Math.PI); g.ellipse(0, 0, r, ry, 0, Math.PI, 0, true); g.closePath(); g.fillStyle = shellGrad(g, r, r * 0.3); g.fill();
  g.save(); g.clip(); g.translate(0, r * 0.45); fibres(g, r, r * 0.5, Math.round(r * 1.6), o.seed ?? 5); g.restore();
  g.strokeStyle = MEAT; g.lineWidth = Math.max(3, r * 0.03); g.beginPath(); g.ellipse(0, 0, r * 0.985, ry * 0.97, 0, 0.05, Math.PI - 0.05); g.stroke();
  burin(g, ell(0, 0, r, r * 0.9, 0, Math.PI, 40), Math.max(1.6, r * 0.024), OUTLINE, 1, o.jit); burin(g, ell(0, 0, r, ry, 0, Math.PI * 2, 56), Math.max(1.4, r * 0.02), OUTLINE, 1, o.jit);
  if (o.face) faceOn(g, 0, r * 0.36, r * 0.13, o);
  g.restore();
}
function coconutLid(g, x, y, r, rot, o = {}) {
  /* the top half flying off: brown dome with the white meat edge showing */
  g.save(); g.translate(x, y); g.rotate(rot);
  const ry = r * 0.34;
  g.fillStyle = MEAT_D; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, 7); g.fill(); g.fillStyle = MEAT; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, Math.PI); g.ellipse(0, 0, r * 0.8, ry * 0.7, 0, Math.PI, 0, true); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(0, 0, r, r * 0.9, 0, Math.PI, Math.PI * 2); g.ellipse(0, 0, r, ry, 0, 0, Math.PI, true); g.closePath(); g.fillStyle = shellGrad(g, r, -r * 0.3); g.fill();
  g.save(); g.clip(); g.translate(0, -r * 0.45); fibres(g, r, r * 0.5, Math.round(r * 1.6), o.seed ?? 6); g.restore();
  g.fillStyle = '#20100A'; for (const [px, py] of [[-r * 0.14, -r * 0.62], [r * 0.14, -r * 0.62], [0, -r * 0.47]]) { g.beginPath(); g.ellipse(px, py, r * 0.065, r * 0.08, 0, 0, 7); g.fill(); }
  burin(g, ell(0, 0, r, r * 0.9, Math.PI, Math.PI * 2, 40), Math.max(1.6, r * 0.024), OUTLINE, 1, o.jit); burin(g, ell(0, 0, r, ry, 0, Math.PI * 2, 56), Math.max(1.4, r * 0.02), OUTLINE, 1, o.jit);
  g.restore();
}
function drop(g, x, y, r, a = 1, col = 'water') {
  /* a water (cyan) or fat (gold) droplet */
  if (a <= 0 || r <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  const gr = g.createRadialGradient(-r * 0.3, r * 0.2, r * 0.1, 0, r * 0.3, r * 1.2);
  if (col === 'fat') { gr.addColorStop(0, '#FFF2A8'); gr.addColorStop(0.5, '#FFC93A'); gr.addColorStop(1, '#D48A0A'); } else { gr.addColorStop(0, '#F2FDFF'); gr.addColorStop(0.5, '#9EE8FA'); gr.addColorStop(1, '#3BB4DC'); }
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r * 1.5); g.bezierCurveTo(r * 0.6, -r * 0.6, r, 0, r, r * 0.35); g.arc(0, r * 0.35, r, 0, Math.PI); g.bezierCurveTo(-r, 0, -r * 0.6, -r * 0.6, 0, -r * 1.5); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(1.6, r * 0.12); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(-r * 0.35, r * 0.15, r * 0.18, r * 0.3, 0.3, 0, 7); g.fill(); g.restore();
}
function glass(g, cx, base, w, h, level, f, o = {}) {
  /* a tumbler of coconut water (pale, cloudy cyan), slightly tapered; o.band = thin sugar band; o.face; o.straw */
  const top = base - h, tw = w / 2, bw = w * 0.42;
  if (o.shadow !== false) softShadow(g, cx + 6, base + 8, w * 0.6, Math.max(8, w * 0.06), 0.25);
  const P = [[cx - tw, top], [cx + tw, top], [cx + bw, base], [cx - bw, base]];
  g.fillStyle = 'rgba(255,255,255,0.22)'; poly(g, P); g.fill();
  if (level > 0) { const ly = base - 8 - (h - 22) * clamp(level); const k = (y) => lerp(bw, tw, (base - y) / h);
    g.save(); poly(g, P); g.clip(); const lg = g.createLinearGradient(cx - tw, 0, cx + tw, 0); lg.addColorStop(0, '#E8FCFF'); lg.addColorStop(0.5, '#BDF0FA'); lg.addColorStop(1, '#7FD3EC'); g.fillStyle = lg; g.fillRect(cx - tw, ly, w, base - ly);
    if (o.band) { g.fillStyle = 'rgba(255,214,110,0.85)'; g.fillRect(cx - tw, base - 8 - (h - 22) * 0.05, w, (h - 22) * 0.05); }
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(cx, ly, k(ly) - 4, Math.max(3, w * 0.05), 0, 0, 7); g.fill();
    const q = rng(Math.round(cx + h)); for (let i = 0; i < 7; i++) { const t = ((f * 0.025 + q()) % 1); const by = lerp(base - 14, ly + 10, t); if (by < ly + 8) continue; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 2; g.beginPath(); g.arc(cx - k(by) * 0.7 + q() * k(by) * 1.4, by, 3 + q() * 4, 0, 7); g.stroke(); }
    g.restore(); }
  if (o.straw) { g.save(); g.lineCap = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = w * 0.11; g.beginPath(); g.moveTo(cx + tw * 0.2, base - h * 0.35); g.lineTo(cx + tw * 0.7, top - h * 0.1); g.lineTo(cx + tw * 1.0, top - h * 0.16); g.stroke(); g.strokeStyle = '#FF5D7A'; g.lineWidth = w * 0.07; g.stroke(); g.restore(); }
  g.fillStyle = 'rgba(255,255,255,0.55)'; poly(g, [[cx - tw * 0.8, top + 14], [cx - tw * 0.62, top + 14], [cx - bw * 0.62, base - 16], [cx - bw * 0.8, base - 16]]); g.fill();
  burin(g, [P[0], P[3], P[2], P[1]], Math.max(1.6, w * 0.012), OUTLINE, 1, o.jit); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, w * 0.012); g.beginPath(); g.ellipse(cx, top, tw, Math.max(4, w * 0.06), 0, 0, 7); g.stroke();
  if (o.face) faceOn(g, cx, base - h * 0.42, w * 0.06, o);
}
function meatChunk(g, x, y, s, rot, o = {}) {
  /* a curved slab of coconut meat: white flesh, thin brown skin on the curved back, a darker side for thickness */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  const R = s * 1.3, th = s * 0.66, a0 = -Math.PI / 2 - 0.75, a1 = -Math.PI / 2 + 0.75;
  const path = (dx, dy) => { g.beginPath(); g.arc(dx, R + dy, R, a0, a1); g.arc(dx, R + dy, R - th, a1, a0, true); g.closePath(); };
  if (o.shadow !== false) softShadow(g, s * 0.1, th + s * 0.2, s * 0.95, s * 0.12, 0.26);
  path(s * 0.07, s * 0.12); g.fillStyle = MEAT_D; g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(1.5, s * 0.02); g.stroke();
  path(0, 0); const mg = g.createLinearGradient(0, 0, 0, th); mg.addColorStop(0, '#FFFFFF'); mg.addColorStop(1, '#F1EAD6'); g.fillStyle = mg; g.fill();
  g.save(); path(0, 0); g.clip(); g.strokeStyle = '#5A3520'; g.lineWidth = s * 0.11; g.beginPath(); g.arc(0, R, R - s * 0.02, a0, a1); g.stroke(); g.restore();
  g.save(); path(0, 0); g.clip(); g.strokeStyle = 'rgba(200,190,160,0.5)'; g.lineWidth = Math.max(1, s * 0.012); for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(0, R, R - th * (0.25 * k + 0.1), a0 + 0.08, a1 - 0.08); g.stroke(); } g.restore();
  path(0, 0); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(1.6, s * 0.024); g.stroke();
  if (o.face) faceOn(g, 0, th * 0.38, s * 0.1, o);
  g.restore();
}
function beaker(g, cx, base, w, h, level, col, jit) {
  const top = base - h; softShadow(g, cx + 6, base + 8, w * 0.6, 10, 0.22); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(cx - w / 2, top, w, h);
  if (level > 0) { const ly = base - 6 - (h - 12) * level; const lg = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); if (col === 'fat') { lg.addColorStop(0, '#FFE58A'); lg.addColorStop(1, '#E9A514'); } else { lg.addColorStop(0, '#E2FAFF'); lg.addColorStop(1, '#58C3E6'); } g.fillStyle = lg; g.fillRect(cx - w / 2 + 5, ly, w - 10, base - 6 - ly); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(cx - w / 2 + 5, ly, w - 10, 5); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(cx - w / 2 + 10, top + 10, 8, h - 24);
  burin(g, [[cx - w / 2, top], [cx - w / 2, base], [cx + w / 2, base], [cx + w / 2, top]], 2.8, OUTLINE, 1, jit); g.strokeStyle = OUTLINE; g.lineWidth = 2.4; g.beginPath(); g.ellipse(cx, top, w / 2, 8, 0, 0, 7); g.stroke();
}
function frond(g, x, y, len, ang, f, seed, side = 1) {
  /* a palm frond in the foreground (depth layer): a curved spine with leaflets, gently swaying */
  const q = rng(seed), sway = Math.sin(f * 0.04 + seed) * 0.05; g.save(); g.translate(x, y); g.rotate(ang + sway);
  const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20; pts.push([u * len, side * len * 0.18 * u * u]); }
  for (let k = 2; k < 20; k++) { const [px, py] = pts[k]; const u = k / 20, l = len * 0.32 * Math.sin(Math.PI * Math.min(1, u * 1.1)) + 10; for (const s of [-1, 1]) { const an = s * (1.0 + 0.2 * q()) + side * 0.3; g.fillStyle = q() < 0.5 ? '#1F6B34' : '#2E8B43'; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(an) * l * 0.5 + 12, py + Math.sin(an) * l * 0.5, px + Math.cos(an) * l + 18, py + Math.sin(an) * l); g.quadraticCurveTo(px + Math.cos(an) * l * 0.5 + 24, py + Math.sin(an) * l * 0.5 + 6, px + 18, py); g.closePath(); g.fill(); g.strokeStyle = 'rgba(10,40,20,0.7)'; g.lineWidth = 2; g.stroke(); } }
  g.lineCap = 'round'; g.strokeStyle = '#174F27'; g.lineWidth = 9; poly(g, pts, false); g.stroke(); g.restore();
}
// ---------------- A: hook (frame 0 = thumbnail): a cracked coconut character, the lid flying off, water splashing; "WATER OR MEAT?"
function splash(g, cx, cy, f, n, spread, seed, a = 1) { const q = rng(seed); for (let i = 0; i < n; i++) { const ph = (f * 0.03 + q()) % 1, ang = -Math.PI / 2 + (q() - 0.3) * spread, sp = 260 + q() * 300; const x = cx + Math.cos(ang) * sp * ph, y = cy + Math.sin(ang) * sp * ph + 520 * ph * ph; drop(g, x, y, 10 + q() * 16, a * (1 - seg(ph, 0.75, 1))); } }
function hookComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 24 : f, bob = Math.sin(ph * 0.08) * 8;
  bgScene(g, '#FF9A6B', '#8E1F2F', ph, 6, 540, 1200);
  softGlow(g, 560, 1240, 640, '255,236,170', 0.45);
  frond(g, -60, 1980, 560, -1.15, ph, 2, 1); frond(g, 1140, 1990, 560, -2.0, ph, 3, -1);
  splash(g, 640, 1180, ph, 16, 1.6, 21);
  coconutLid(g, 830 + Math.sin(ph * 0.06) * 6, 1010 - bob, 190, 0.72 + Math.sin(ph * 0.05) * 0.04, { jit, seed: 8 });
  const blink = Math.max(0, 1 - Math.abs(ph - 48) / 3) + Math.max(0, 1 - Math.abs(ph - 86) / 3);
  coconutCup(g, 520, 1330 + bob * 0.5, 255, -0.05, { water: 1, face: true, look: ph < 34 ? [-0.3, -0.9] : [0.6, -0.4], blink: clamp(blink), mood: 0.3, seed: 9, jit });
  for (let i = 0; i < 6; i++) { const q = rng(i * 7 + 4); sparkle(g, 300 + q() * 520, 1000 + q() * 420, 14 + q() * 12, Math.abs(Math.sin(ph * 0.11 + i * 1.4))); }
  if (words > 0) { label(g, 'WATER OR', 540, 668, 172, YELLOW, words, -0.04, 790); label(g, 'MEAT?', 540, 840, 176, WHITE, words, -0.04); }
}
function sceneHook(g, f, jit) { const out = seg(f, 46, 56); hookComposition(g, f, jit, 1 - out); }
// ---------------- B: one coconut: its water (206 g, about 40 kcal) vs its meat (397 g, about 1,400 kcal)
const CHUNKS_B = pileSpots(41, 12, 790, 1224, 300, 30, 52);
function sceneWhole(g, f, jit) {
  bgScene(g, '#9D7BFF', '#2D0B5A', f, 7, 540, 1000);
  const cr = E.crackB;
  drawScale(g, 290, 1306, 360, f < E.pour + 6 ? 0 : 206 * eo(seg(f, E.pour + 6, E.k40 + 14)), jit, seg(f, E.k40 + 10, E.k40 + 14) * (1 - seg(f, E.k40 + 34, E.k40 + 40)));
  drawScale(g, 790, 1306, 360, f < E.meatOut + 4 ? 0 : 397 * eo(seg(f, E.meatOut + 4, E.k1400 + 4)), jit, seg(f, E.k1400, E.k1400 + 4) * (1 - seg(f, E.k1400 + 24, E.k1400 + 30)));
  glass(g, 290, 1306, 180, 230, clamp(seg(f, E.pour + 6, E.k40 + 14)), f, { jit });
  bowlBack(g, 790, 1266, 300);
  CHUNKS_B.forEach((p, i) => { const t = seg(f, E.meatOut + i * 1.4, E.meatOut + i * 1.4 + 16); if (t <= 0) return; const [x, y] = flight({ x: 540, y: 660 }, { x: p.x, y: p.y + 30 }, eio(t), 220); meatChunk(g, x, y, 34, p.rot * 0.6 + (1 - t) * 4, { shadow: false }); });
  bowlFront(g, 790, 1266, 300, jit);
  // the coconut: whole until the crack, then a cup that tips to pour its water into the glass
  const bob = Math.sin(f * 0.09) * 6;
  if (f < cr) { const sh = seg(f, cr - 10, cr); coconutWhole(g, 540 + Math.sin(f * 2.3) * 6 * sh, 760 + bob, 135, -0.05 + Math.sin(f * 3.1) * 0.03 * sh, { face: true, look: [0, 0.6], jit, seed: 12 }); }
  else {
    const tip = eio(seg(f, cr + 2, cr + 12)) * (1 - eio(seg(f, E.k40 + 30, E.k40 + 46)));
    const lidT = seg(f, cr, cr + 24); if (lidT < 1) coconutLid(g, 540 + 720 * lidT, 720 - 160 * Math.sin(Math.PI * lidT) + 700 * lidT * lidT, 135, 0.4 + lidT * 3, { jit });
    const wl = 1 - seg(f, E.pour, E.k40 + 20);
    if (f >= E.pour && wl > 0) { for (let i = 0; i < 9; i++) { const u = ((f - E.pour) * 0.09 + i / 9) % 1; const x = lerp(445, 300, u), y = lerp(760, 1110, u * u); drop(g, x, y, 12, 1); } }
    coconutCup(g, 540, 790 - 110 * eio(seg(f, E.meatOut - 14, E.meatOut)) + bob, 135, -0.95 * tip, { water: wl, meat: 1 - seg(f, E.meatOut, E.meatOut + 20), face: true, look: f < E.meatOut ? [-0.9, 0.5] : [0.9, 0.5], blink: Math.max(0, 1 - Math.abs(f - 170) / 3), jit, seed: 13 });
  }
  burstFX(g, 540, 760, seg(f, cr, cr + 16), 100, 380, 18);
  label(g, '≈ 40', 290, 972, 116, YELLOW, seg(f, E.k40, E.k40 + 8), -0.03, 360); label(g, 'kcal', 290, 1040, 56, WHITE, seg(f, E.k40 + 4, E.k40 + 12), -0.03);
  kinetic(g, '≈ 1,400', 774, 972, 116, YELLOW, seg(f, E.k1400, E.k1400 + 8), f, E.k1400, 0.03, 300); label(g, 'kcal', 774, 1040, 56, WHITE, seg(f, E.k1400 + 4, E.k1400 + 12), 0.03);
  label(g, 'WATER', 290, 846, 64, WHITE, seg(f, E.pour + 10, E.pour + 18), -0.03); label(g, 'MEAT', 774, 846, 64, WHITE, seg(f, E.meatOut + 10, E.meatOut + 18), 0.03);
}
// ---------------- C: per 100 g, coconut water is 95 % water: 19 kcal
function sceneWater(g, f, jit) {
  bgScene(g, '#5BC8F0', '#0E3C78', f, 8, 540, 1000);
  const fl = eo(seg(f, E.fill100, E.fill100 + 40));
  drawScale(g, 540, 1268, 500, 100 * fl, jit, seg(f, E.fill100 + 40, E.fill100 + 44) * (1 - seg(f, E.fill100 + 62, E.fill100 + 68)));
  const enter = back(seg(f, E.whipBC + 6, E.whipBC + 20));
  g.save(); g.translate(540, 1268); g.scale(0.6 + 0.4 * enter, 0.6 + 0.4 * enter); g.translate(-540, -1268);
  glass(g, 520, 1268, 330, 520, fl * 0.97, f, { band: true, straw: true, face: true, look: f < E.w95 ? [0, -0.8] : [0.8, -0.3], blink: Math.max(0, 1 - Math.abs(f - 350) / 3), mood: seg(f, E.k19, E.k19 + 6), jit });
  g.restore();
  const m = seg(f, E.w95 - 2, E.w95 + 8);
  if (m > 0) { /* bracket spanning the water column (above the thin sugar band): 95 % of the 100 g is water */
    const h = 520, base = 1268, y1 = base - 8 - (h - 22) * 0.97, y0 = base - 8 - (h - 22) * 0.05, x = 720; const yt = lerp(y0, y1, eo(m));
    g.save(); g.globalAlpha = m; g.lineCap = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 14; g.beginPath(); g.moveTo(x - 22, y0); g.lineTo(x, y0); g.lineTo(x, yt); g.lineTo(x - 22, yt); g.stroke(); g.strokeStyle = WHITE; g.lineWidth = 7; g.stroke(); g.restore(); }
  label(g, '95%', 826, 1030, 124, YELLOW, m, 0.03, 228); label(g, 'WATER', 826, 1098, 60, WHITE, seg(f, E.w95 + 4, E.w95 + 12), 0.03);
  kinetic(g, 'JUST 19 kcal', 540, 690, 124, WHITE, seg(f, E.k19, E.k19 + 8), f, E.k19, -0.02, 820);
  for (let i = 0; i < 5; i++) { const q = rng(60 + i); sparkle(g, 380 + q() * 300, 820 + q() * 300, 12 + q() * 10, seg(f, E.k19, E.k19 + 6) * Math.abs(Math.sin(f * 0.13 + i))); }
}
// ---------------- D: the meat is only half water, a third is fat: 354 kcal per 100 g
function sceneMeat(g, f, jit) {
  bgScene(g, '#7FD98F', '#0F4A2A', f, 9, 540, 1000);
  drawScale(g, 540, 1268, 480, f < E.chunk + 4 ? 0 : 100, jit, seg(f, E.chunk + 4, E.chunk + 8) * (1 - seg(f, E.chunk + 26, E.chunk + 32)));
  const wt = seg(f, E.halfWater, E.halfWater + 26), ft = seg(f, E.fatOut, E.fatOut + 24);
  beaker(g, 245, 1150, 150, 260, 0.47 * eo(seg(f, E.halfWater + 6, E.halfWater + 30)), 'water', jit);
  beaker(g, 835, 1150, 150, 260, 0.335 * eo(seg(f, E.fatOut + 6, E.fatOut + 30)), 'fat', jit);
  const t = seg(f, E.whipCD + 4, E.chunk + 2), [sx, sy] = squash(t);
  const squeeze = 1 - 0.08 * Math.sin(Math.PI * wt) - 0.08 * Math.sin(Math.PI * ft);
  if (t > 0) meatChunk(g, 540, lerp(420, 1036, bounce(t)), 255, 0, { sx: sx * (2 - squeeze), sy: sy * squeeze, face: true, look: f < E.halfWater ? [0, -0.6] : f < E.fatOut ? [-0.9, 0.2] : [0.9, 0.2], blink: Math.max(0, 1 - Math.abs(f - 470) / 3), mood: seg(f, E.k354, E.k354 + 6), jit });
  for (let i = 0; i < 7; i++) { const u = seg(f, E.halfWater + i * 2.5, E.halfWater + i * 2.5 + 16); if (u > 0 && u < 1) { const [x, y] = flight({ x: 420, y: 1100 }, { x: 245, y: 1040 }, eio(u), 200); drop(g, x, y, 16, 1, 'water'); } }
  for (let i = 0; i < 6; i++) { const u = seg(f, E.fatOut + i * 2.5, E.fatOut + i * 2.5 + 16); if (u > 0 && u < 1) { const [x, y] = flight({ x: 660, y: 1100 }, { x: 835, y: 1060 }, eio(u), 200); drop(g, x, y, 16, 1, 'fat'); } }
  label(g, '½ WATER', 268, 850, 76, WHITE, seg(f, E.halfWater + 2, E.halfWater + 12), -0.03, 270);
  label(g, '⅓ FAT', 812, 850, 80, YELLOW, seg(f, E.thirdFat, E.thirdFat + 10), 0.03, 250);
  kinetic(g, '354 kcal', 540, 700, 150, YELLOW, seg(f, E.k354, E.k354 + 8), f, E.k354, -0.02, 760);
  burstFX(g, 540, 640, seg(f, E.k354, E.k354 + 14), 140, 380);
}
// ---------------- E: one small piece (45 g) is about 160 kcal: as much as 3½ glasses of coconut water (a calorie balance)
function calBalance(g, f, tilt, jit, left, right) {
  const px = 540, py = 1010, L = 300; const a = tilt; const ex = L * Math.cos(a), ey = L * Math.sin(a);
  softShadow(g, px, 1318, 200, 18, 0.28);
  g.fillStyle = '#F4EFE4'; poly(g, [[px - 150, 1318], [px + 150, 1318], [px + 110, 1290], [px - 110, 1290]]); g.fill(); burin(g, [[px - 150, 1318], [px + 150, 1318], [px + 110, 1290], [px - 110, 1290], [px - 150, 1318]], 2.6, OUTLINE, 1, jit);
  g.fillStyle = '#F4EFE4'; g.fillRect(px - 14, py, 28, 290); burin(g, [[px - 14, py], [px - 14, 1290], [px + 14, 1290], [px + 14, py]], 2.6, OUTLINE, 1, jit);
  const L0 = [px - ex, py + ey], R0 = [px + ex, py - ey];
  g.lineCap = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 18; g.beginPath(); g.moveTo(...L0); g.lineTo(...R0); g.stroke(); g.strokeStyle = '#FFF6DE'; g.lineWidth = 10; g.stroke();
  g.fillStyle = YELLOW; g.beginPath(); g.arc(px, py, 50, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 5; g.stroke(); text(g, 'kcal', px, py + 13, '900 34px NDisplay', OUTLINE, 'center', 0, 'fig');
  for (const [hx, hy, fn] of [[...L0, left], [...R0, right]]) { const pyn = hy + 170; g.strokeStyle = OUTLINE; g.lineWidth = 3.4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + s * 120, pyn); g.stroke(); }
    fn(hx, pyn); g.fillStyle = '#FBF4E2'; g.beginPath(); g.ellipse(hx, pyn, 140, 22, 0, 0, Math.PI); g.lineTo(hx - 140, pyn); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.beginPath(); g.ellipse(hx, pyn, 140, 22, 0, 0, Math.PI); g.stroke(); g.beginPath(); g.moveTo(hx - 140, pyn); g.lineTo(hx + 140, pyn); g.stroke(); }
}
function scenePortion(g, f, jit) {
  bgScene(g, '#FF6FB0', '#6A0F49', f, 10, 540, 1000);
  const mv = eio(seg(f, E.cta - 8, E.cta + 10));
  g.save(); g.translate(540, 1160); g.scale(1 - 0.12 * mv, 1 - 0.12 * mv); g.translate(-540, -1160 - 40 * mv);
  const glasses = [E.glass1, E.glass2, E.glass3, E.glassH]; const n = glasses.reduce((s, e, i) => s + seg(f, e, e + 6) * (i === 3 ? 0.5 : 1), 0);
  const pieceT = seg(f, E.piece - 10, E.piece + 2); const target = pieceT > 0 ? 0.2 * (1 - Math.min(3.5, n) / 3.49) : 0; const tilt = target + 0.03 * Math.sin(f * 0.5) * Math.exp(-(((f - E.level) / 10) ** 2));
  calBalance(g, f, clamp(tilt, -0.05, 0.25), jit,
    (x, y) => { if (pieceT <= 0) return; meatChunk(g, x, lerp(y - 600, y - 112, bounce(pieceT)), 128, 0, { face: true, look: [0.7, -0.3], blink: Math.max(0, 1 - Math.abs(f - 700) / 3), mood: seg(f, E.level, E.level + 8), jit }); },
    (x, y) => { glasses.forEach((e, i) => { const t = seg(f, e - 6, e + 2); if (t <= 0) return; const gx = x - 102 + i * 68; glass(g, gx, lerp(y - 520, y - 4, bounce(t)), 60, i === 3 ? 74 : 130, 0.9, f, { shadow: false, jit }); }); });
  g.restore();
  const la = 1 - seg(f, E.cta - 10, E.cta);
  label(g, '45 g', 300, 800, 96, WHITE, seg(f, E.g45, E.g45 + 8) * (1 - seg(f, E.k160 - 4, E.k160)) * la, -0.03, 360);
  label(g, '≈ 160', 292, 800, 120, YELLOW, seg(f, E.k160, E.k160 + 8) * la, -0.03, 330); label(g, 'kcal', 292, 866, 60, WHITE, seg(f, E.k160 + 4, E.k160 + 12) * la, -0.03);
  label(g, '=', 540, 820, 140, WHITE, seg(f, E.level, E.level + 8) * la, 0);
  kinetic(g, '3½', 800, 800, 150, YELLOW, seg(f, E.glassH, E.glassH + 8) * la, f, E.glassH, 0.03, 300); label(g, 'GLASSES', 800, 866, 60, WHITE, seg(f, E.glassH + 4, E.glassH + 12) * la, 0.03);
  ringPulse(g, 540, 1010, seg(f, E.level, E.level + 16), 60, 420);
  const pk = back(seg(f, E.cta - 2, E.cta + 14)); if (pk > 0) coconutWhole(g, lerp(1260, 930, pk), 1240, 105, -0.3, { face: true, look: [-0.8, 0], blink: Math.max(0, 1 - Math.abs(f - 868) / 5), mood: 0.6, jit, seed: 12 });
}
// ---------------- cameras (per scene): slow push-in + kicks on number pops + impact shakes
function camFor(i, f) {
  const spans = [[0, E.whipAB + 12], [E.whipAB, E.whipBC + 12], [E.whipBC, E.whipCD + 12], [E.whipCD, E.whipDE + 12], [E.whipDE, N]];
  const [a, b] = spans[i]; const z = 1 + 0.045 * eio(seg(f, a, b));
  const kicks = [E.k40, E.k1400, E.w95, E.k19, E.halfWater, E.thirdFat, E.k354, E.k160, E.level].reduce((s, e) => s + 0.02 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  const [sx, sy] = [shake(f, E.crackB, 22), shake(f, E.k1400, 12), shake(f, E.chunk, 8), shake(f, E.piece, 8)].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
  return { z: z * (1 + kicks), x: 540 - sx, y: 1010 - sy };
}

// ---------------- paper grain (print texture), CTA seal (white wordmark on colour)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.05)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } }
function drawCTA(g, f, jit) {
  const r = seg(f, E.cta, E.cta + 14); if (r <= 0) return;
  g.font = '900 84px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 62, gap = 28, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1420;
  softGlow(g, 540, cy, 420, '10,6,40', 0.4 * r);
  const sc = 0.5 + 0.5 * back(r); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  g.save(); g.globalAlpha = r; g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = WHITE; g.lineWidth = 3.6; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.restore();
  const wr = seg(f, E.cta + 4, E.cta + 26), s = 'CalMeter';
  if (wr > 0) { const sub = s.slice(0, Math.ceil(s.length * wr)); g.save(); g.font = '900 84px NDisplay'; g.textAlign = 'left'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 13; g.strokeText(sub, cx + R0 + gap, cy + 30); g.restore(); text(g, sub, cx + R0 + gap, cy + 30, '900 84px NDisplay', WHITE, 'left', 0, 'cta'); }
  const rl = seg(f, E.cta + 20, E.cta + 44); if (rl > 0) burin(g, [[cx + R0 + gap, cy + 56], [cx + R0 + gap + ww * rl, cy + 56]], 3, YELLOW, 1, jit);
  const sh = seg(f, E.ctaWord, E.ctaWord + 40); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 30, '900 84px NDisplay', YELLOW, 'left', 0, 'cta'); g.restore(); }
  const tk = seg(f, E.cta + 30, E.cta + 90); g.strokeStyle = WHITE; g.lineWidth = 1.5; for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 20), cy + Math.sin(a) * (R0 + 20)); g.stroke(); }
}
// ---------------- compositor: scenes with whip-pan transitions (motion blur + speed lines)
const SCENES = [sceneHook, sceneWhole, sceneWater, sceneMeat, scenePortion];
const WHIPS = [E.whipAB, E.whipBC, E.whipCD, E.whipDE], WD = 12;
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
const offA = createCanvas(W, H), offB = createCanvas(W, H), gA = offA.getContext('2d'), gB = offB.getContext('2d');
function paintScene(ctx, i, f, jit) { ctx.setTransform(1, 0, 0, 1, 0, 0); const c = camFor(i, f); ctx.translate(540, 1010); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y); SCENES[i](ctx, f, jit); ctx.setTransform(1, 0, 0, 1, 0, 0); }
function speedLines(ctx, v, seed, dir) { if (v <= 0.05) return; const q = rng(seed); ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 26; i++) { const y = q() * H, len = 200 + q() * 700, x = q() * W; ctx.strokeStyle = `rgba(255,255,255,${(0.25 + 0.5 * q()) * v})`; ctx.lineWidth = 3 + q() * 9; ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.lineTo(x + len / 2, y); ctx.stroke(); } ctx.restore(); }
function draw(f) {
  FRAME = f; const jit = rng(1000 + Math.floor(f / 2) * 2); // engraved line boil steps at 15 drawings/s; motion runs at 30
  let cur = 0; for (let i = 0; i < WHIPS.length; i++) if (f >= WHIPS[i] + WD / 2) cur = i + 1;
  const wi = WHIPS.findIndex((w) => f >= w && f < w + WD);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (wi < 0) paintScene(g, cur, f, jit);
  else {
    const p = (f - WHIPS[wi]) / WD, e = eio(p), v = Math.sin(Math.PI * p); // velocity peaks mid-whip
    paintScene(gA, wi, f, jit); paintScene(gB, wi + 1, f, jit);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (const [src, x0] of [[offA, -W * e], [offB, W * (1 - e)]]) { g.globalAlpha = 1; g.drawImage(src, x0, 0); for (let k = 1; k <= 3; k++) { g.globalAlpha = 0.22 * v; g.drawImage(src, x0 + k * 34 * v, 0); } }
    g.globalAlpha = 1; speedLines(g, v, 900 + wi, 1);
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5; g.drawImage(grain, 0, 0); g.restore();
  drawCTA(g, f, jit);
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same curiosity words, larger */
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540, 1250); g.scale(1.06, 1.06); g.translate(-540, -1220);
  hookComposition(g, 24, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5; g.drawImage(grain, 0, 0); g.restore();
  label(g, 'WATER OR', 540, 560, 210, YELLOW, 1, -0.04, 840); label(g, 'MEAT?', 540, 770, 210, WHITE, 1, -0.04);
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
