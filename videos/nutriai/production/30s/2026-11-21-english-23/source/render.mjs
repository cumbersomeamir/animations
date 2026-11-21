// CalMeter English 30 s english-23 (batch 23, 2026-11-21): does skim milk lose its calcium? "LESS CALCIUM?".
// The requested "How popcorn gets huge without creating more calories" was already english-12 (2026-11-11: kernel burst, 3 cups = 24 g air-popped
// ~ 90 kcal, oil/butter/sugar), and batch 22 used the pineapple (fruit, fibre, vitamin C), so an unrelated same-genre subject with a different
// question, setting and mechanism was chosen: whole vs skim milk calcium. USDA FDC 171265 (whole, 113 mg Ca / 100 g; cup 244 g ~ 276 mg) and
// 171269 (skim, 122 mg; cup 245 g ~ 299 mg); heavy cream 170859 only 66 mg / 100 g; US DV 1,300 mg -> 21-23 %; MedlinePlus: calcium helps form
// and maintain healthy teeth and bones. Dairy world with milk-carton mascots: a spoon skims the cream while calcium crystals stay, crystal towers
// (280, then 300), a bone and a tooth absorb calcium, a day dial fills past a fifth; milk-wave transitions and whips; green-wave CTA.
// Shared engine from english-20/21/22 (captions 80 px in y 280-460, labels, kinetic numbers, bgScene, effects, whip compositor). Original Canvas2D.
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
// ---------------- shared small parts (from english-22): face
function faceOn(g, x, y, r, o) {
  eyes(g, x, y, r, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0);
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, r * 0.3); g.lineCap = 'round'; g.beginPath();
  if ((o.mood ?? 0) < -0.2) g.arc(x, y + r * 2.3, r * 0.7, Math.PI + 0.4, -0.4); else g.arc(x, y + r * 1.5, r * (0.9 + 0.4 * (o.mood ?? 0)), 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = 'rgba(255,110,120,0.55)'; g.beginPath(); g.ellipse(x - r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.ellipse(x + r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.fill();
}
// ---------------- dairy parts (original drawings): milk carton mascot, glass of milk with cream, spoon, calcium crystals, bone, tooth
const MILK = '#FFFFFF', MILK_S = '#E6EEF8', CREAM = '#FFF1C2', CREAM_D = '#F4D27A';
function carton(g, x, y, s, rot, f, o = {}) {
  /* a gable-top milk carton with a coloured band, a face and little arms; s = front width. o.band colour, o.tag text on the band */
  const w = s, h = s * 1.45, sd = s * 0.32; g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  if (o.shadow !== false) softShadow(g, sd * 0.4, h * 0.5 + 8, w * 0.75, s * 0.1, 0.3);
  const top = -h * 0.5, bot = h * 0.5, gable = s * 0.42;
  if (o.arms) { g.strokeStyle = OUTLINE; g.lineCap = 'round'; for (const sdn of [-1, 1]) { const ax = sdn * w * 0.5 + (sdn > 0 ? sd : 0), ay = 0, up = o.arms; const hx = ax + sdn * s * 0.38, hy = ay - s * 0.5 * up + s * 0.25 * (1 - up); g.lineWidth = s * 0.08; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + sdn * s * 0.3, ay + s * 0.1, hx, hy); g.stroke(); g.strokeStyle = '#FFFFFF'; g.lineWidth = s * 0.045; g.stroke(); g.strokeStyle = OUTLINE; g.fillStyle = '#FFFFFF'; g.lineWidth = s * 0.02; g.beginPath(); g.arc(hx, hy, s * 0.075, 0, 7); g.fill(); g.stroke(); } }
  // side face (depth)
  g.fillStyle = '#C9D6E6'; poly(g, [[w / 2, top], [w / 2 + sd, top - sd * 0.5], [w / 2 + sd, bot - sd * 0.5], [w / 2, bot]]); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2.5, s * 0.02); g.stroke();
  // gable roof (front triangle + side slope) and fin
  g.fillStyle = '#F4F7FB'; poly(g, [[-w / 2, top], [0, top - gable], [w / 2, top]]); g.fill(); g.stroke();
  g.fillStyle = '#D7E1EE'; poly(g, [[w / 2, top], [0, top - gable], [sd, top - gable - sd * 0.5], [w / 2 + sd, top - sd * 0.5]]); g.fill(); g.stroke();
  g.fillStyle = '#FFFFFF'; poly(g, [[-s * 0.06, top - gable], [sd - s * 0.06, top - gable - sd * 0.5], [sd - s * 0.06, top - gable - sd * 0.5 - s * 0.12], [-s * 0.06, top - gable - s * 0.12]]); g.fill(); g.stroke();
  // front face
  const fg = g.createLinearGradient(-w / 2, 0, w / 2, 0); fg.addColorStop(0, '#FFFFFF'); fg.addColorStop(1, '#EEF3FA'); g.fillStyle = fg; g.fillRect(-w / 2, top, w, h); g.strokeRect(-w / 2, top, w, h);
  // band with tag
  const by = top + h * 0.12, bh = h * 0.2; g.fillStyle = o.band ?? '#3FA7E0'; g.fillRect(-w / 2, by, w, bh); g.fillStyle = 'rgba(0,0,0,0.12)'; poly(g, [[w / 2, by], [w / 2 + sd, by - sd * 0.5], [w / 2 + sd, by + bh - sd * 0.5], [w / 2, by + bh]]); g.fill(); g.fillStyle = o.band ?? '#3FA7E0'; g.globalAlpha *= 0.85; poly(g, [[w / 2, by], [w / 2 + sd, by - sd * 0.5], [w / 2 + sd, by + bh - sd * 0.5], [w / 2, by + bh]]); g.fill(); g.globalAlpha /= 0.85;
  if (o.tag) text(g, o.tag, 0, by + bh * 0.74, `900 ${Math.round(bh * 0.62)}px NDisplay`, '#FFFFFF', 'center', 0, 'art');
  // drops on the face (milk splashes printed on the carton)
  g.fillStyle = 'rgba(63,167,224,0.18)'; g.beginPath(); g.ellipse(-w * 0.25, bot - h * 0.12, w * 0.18, h * 0.05, 0, 0, 7); g.ellipse(w * 0.22, bot - h * 0.1, w * 0.14, h * 0.04, 0, 0, 7); g.fill();
  if (o.face) faceOn(g, 0, top + h * 0.48, s * 0.08, o);
  g.restore();
}
function crystal(g, x, y, s, rot, glow = 0.6) {
  /* a calcium "crystal": a faceted pale-blue gem with a sparkle */
  g.save(); g.translate(x, y); g.rotate(rot); if (glow > 0) softGlow(g, 0, 0, s * 2.4, '200,235,255', 0.45 * glow);
  const P = [[0, -s], [s * 0.8, -s * 0.3], [s * 0.55, s * 0.85], [-s * 0.55, s * 0.85], [-s * 0.8, -s * 0.3]]; const gr = g.createLinearGradient(-s, -s, s, s); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.5, '#CDEBFF'); gr.addColorStop(1, '#7FC4F0'); g.fillStyle = gr; poly(g, P); g.fill();
  g.strokeStyle = 'rgba(70,130,190,0.6)'; g.lineWidth = Math.max(1, s * 0.07); g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s * 0.2); g.lineTo(s * 0.55, s * 0.85); g.moveTo(0, s * 0.2); g.lineTo(-s * 0.55, s * 0.85); g.moveTo(-s * 0.8, -s * 0.3); g.lineTo(0, s * 0.2); g.lineTo(s * 0.8, -s * 0.3); g.stroke();
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(1.5, s * 0.1); g.lineJoin = 'round'; poly(g, P); g.stroke(); g.restore();
}
const CRYS = Array.from({ length: 16 }, (_, i) => { const q = rng(800 + i); return { u: q(), v: q(), s: 0.7 + q() * 0.5, ph: q() * 6 }; });
function milkGlass(g, cx, base, w, h, f, o = {}) {
  /* a tall glass of milk: o.cream 0..1 thickness of the risen cream layer at the top, o.lift 0..1 cream removed (scooped), o.crys 0..1 crystals shown, o.face */
  const top = base - h, tw = w / 2, bw = w * 0.4; const P = [[cx - tw, top], [cx + tw, top], [cx + bw, base], [cx - bw, base]];
  if (o.shadow !== false) softShadow(g, cx + 8, base + 10, w * 0.62, 16, 0.3);
  g.fillStyle = 'rgba(255,255,255,0.25)'; poly(g, P); g.fill();
  const ml = top + h * 0.1; const k = (y) => lerp(bw, tw, (base - y) / h);
  g.save(); poly(g, P); g.clip();
  const mg = g.createLinearGradient(cx - tw, 0, cx + tw, 0); mg.addColorStop(0, '#FFFFFF'); mg.addColorStop(0.6, '#F3F7FC'); mg.addColorStop(1, '#D3DFEE'); g.fillStyle = mg; g.fillRect(cx - tw, ml, w, base - ml);
  // fat globules rising (before the cream forms)
  const cr = o.cream ?? 0, lift = o.lift ?? 0;
  if (o.rising) { const q = rng(41); for (let i = 0; i < 26; i++) { const t = ((f * 0.012 * (0.6 + q()) + q()) % 1); const y = lerp(base - 20, ml + 30, t); const x = cx + (q() - 0.5) * k(y) * 1.6; g.fillStyle = 'rgba(255,226,140,0.9)'; g.beginPath(); g.arc(x, y, 6 + q() * 7, 0, 7); g.fill(); g.strokeStyle = 'rgba(200,150,40,0.6)'; g.lineWidth = 1.5; g.stroke(); } }
  // calcium crystals swirl and stay
  const cs = o.crys ?? 0; if (cs > 0) CRYS.forEach((c, i) => { if (i / CRYS.length > cs) return; const y = lerp(ml + 120, base - 50, c.v) + Math.sin(f * 0.05 + c.ph) * 14; const x = cx + (c.u - 0.5) * k(y) * 1.4 + Math.cos(f * 0.04 + c.ph) * 16; crystal(g, x, y, 20 * c.s, f * 0.02 + c.ph, o.glow ?? 0.6); });
  // the cream layer on top
  if (cr > 0 && lift < 1) { const th = h * 0.16 * cr; const cy = ml - 40 * lift - (1 - cr) * 0; g.save(); g.globalAlpha *= 1 - lift; const cg = g.createLinearGradient(0, ml, 0, ml + th); cg.addColorStop(0, '#FFF6D6'); cg.addColorStop(1, CREAM_D); g.fillStyle = cg; g.beginPath(); g.moveTo(cx - tw, ml + th); for (let i = 0; i <= 20; i++) { const u = i / 20; g.lineTo(cx - tw + w * u, ml + th + Math.sin(u * 12 + f * 0.1) * 6); } g.lineTo(cx + tw, ml - 10); g.lineTo(cx - tw, ml - 10); g.closePath(); g.fill(); g.restore(); }
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(cx, ml, k(ml) - 6, 14, 0, 0, 7); g.fill();
  g.restore();
  g.fillStyle = 'rgba(255,255,255,0.6)'; poly(g, [[cx - tw * 0.82, top + 20], [cx - tw * 0.64, top + 20], [cx - bw * 0.64, base - 20], [cx - bw * 0.82, base - 20]]); g.fill();
  burin(g, [P[0], P[3], P[2], P[1]], Math.max(2, w * 0.01), OUTLINE, 1, o.jit); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2.5, w * 0.01); g.beginPath(); g.ellipse(cx, top, tw, Math.max(6, w * 0.05), 0, 0, 7); g.stroke();
  if (o.face) faceOn(g, cx, base - h * 0.36, w * 0.055, o);
}
function spoon(g, x, y, s, rot, creamAmt, f) {
  /* a big silver spoon; the bowl can carry a heap of cream */
  g.save(); g.translate(x, y); g.rotate(rot);
  const hg = g.createLinearGradient(0, -s * 0.1, 0, s * 0.1); hg.addColorStop(0, '#FFFFFF'); hg.addColorStop(1, '#A9B4C2'); g.fillStyle = hg; g.beginPath(); g.roundRect(s * 0.35, -s * 0.07, s * 1.6, s * 0.14, s * 0.07); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2.5, s * 0.025); g.stroke();
  const bg2 = g.createRadialGradient(-s * 0.1, -s * 0.1, s * 0.05, 0, 0, s * 0.5); bg2.addColorStop(0, '#FFFFFF'); bg2.addColorStop(1, '#9AA7B8'); g.fillStyle = bg2; g.beginPath(); g.ellipse(0, 0, s * 0.42, s * 0.28, 0, 0, 7); g.fill(); g.stroke();
  if (creamAmt > 0) { g.fillStyle = CREAM; g.beginPath(); g.ellipse(0, -s * 0.06, s * 0.4, s * 0.1 + s * 0.22 * creamAmt, 0, Math.PI, 0); g.closePath(); g.fill(); g.fillStyle = '#FFF9E6'; g.beginPath(); g.arc(-s * 0.12, -s * 0.06 - s * 0.18 * creamAmt, s * 0.12 * creamAmt + 2, 0, 7); g.arc(s * 0.1, -s * 0.06 - s * 0.22 * creamAmt, s * 0.14 * creamAmt + 2, 0, 7); g.fill(); g.strokeStyle = 'rgba(200,150,40,0.7)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, -s * 0.06, s * 0.4, s * 0.1 + s * 0.22 * creamAmt, 0, Math.PI, 0); g.stroke(); }
  g.restore();
}
function bone(g, x, y, s, rot, fill, f, o = {}) {
  /* a cartoon bone (shaft + two round knobs at each end) with a face; fill 0..1 = a glowing mineral lattice growing inside */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.shadow !== false) softShadow(g, 10, s * 0.55, s * 1.15, s * 0.1, 0.28);
  const parts = () => { g.beginPath(); g.rect(-s * 0.85, -s * 0.17, s * 1.7, s * 0.34); for (const [cx2, cy2] of [[-s * 0.92, -s * 0.2], [-s * 0.92, s * 0.2], [s * 0.92, -s * 0.2], [s * 0.92, s * 0.2]]) { g.moveTo(cx2 + s * 0.25, cy2); g.arc(cx2, cy2, s * 0.25, 0, 7); } };
  parts(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(6, s * 0.06); g.lineJoin = 'round'; g.stroke(); /* thick outline first, the fill covers the inner lines: a clean union */
  const gr = g.createLinearGradient(0, -s * 0.45, 0, s * 0.45); gr.addColorStop(0, '#FFFDF4'); gr.addColorStop(1, '#E6D8B8'); g.fillStyle = gr; parts(); g.fill('nonzero');
  if (fill > 0) { g.save(); parts(); g.clip('nonzero'); g.strokeStyle = `rgba(90,170,230,${0.8 * fill})`; g.lineWidth = Math.max(2, s * 0.022); for (let k = -14; k <= 14; k++) { g.beginPath(); g.moveTo(k * s * 0.12, -s * 0.5); g.lineTo(k * s * 0.12 + s * 0.5, s * 0.5); g.moveTo(k * s * 0.12, -s * 0.5); g.lineTo(k * s * 0.12 - s * 0.5, s * 0.5); g.stroke(); } softGlow(g, 0, 0, s * 1.3 * fill, '200,235,255', 0.5 * fill); g.restore(); }
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.09, s * 0.32, s * 0.04, 0, 0, 7); g.fill();
  if (o.face) faceOn(g, 0, -s * 0.03, s * 0.065, o);
  g.restore();
}
function tooth(g, x, y, s, rot, shine, f, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); if (o.shadow !== false) softShadow(g, 8, s * 0.9, s * 0.6, s * 0.1, 0.28);
  g.beginPath(); g.moveTo(-s * 0.5, -s * 0.35); g.bezierCurveTo(-s * 0.5, -s * 0.75, -s * 0.12, -s * 0.7, 0, -s * 0.5); g.bezierCurveTo(s * 0.12, -s * 0.7, s * 0.5, -s * 0.75, s * 0.5, -s * 0.35); g.bezierCurveTo(s * 0.55, s * 0.1, s * 0.35, s * 0.25, s * 0.32, s * 0.75); g.bezierCurveTo(s * 0.3, s * 0.92, s * 0.12, s * 0.92, s * 0.08, s * 0.6); g.lineTo(-s * 0.08, s * 0.6); g.bezierCurveTo(-s * 0.12, s * 0.92, -s * 0.3, s * 0.92, -s * 0.32, s * 0.75); g.bezierCurveTo(-s * 0.35, s * 0.25, -s * 0.55, s * 0.1, -s * 0.5, -s * 0.35); g.closePath();
  const gr = g.createLinearGradient(-s * 0.5, -s * 0.6, s * 0.5, s * 0.6); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#E3ECF4'); g.fillStyle = gr; g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, s * 0.04); g.lineJoin = 'round'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(-s * 0.22, -s * 0.38, s * 0.1, s * 0.16, -0.4, 0, 7); g.fill();
  if (o.face) faceOn(g, 0, -s * 0.1, s * 0.09, o);
  g.restore(); if (shine > 0) for (let i = 0; i < 4; i++) sparkle(g, x + Math.cos(i * 1.6 + f * 0.05) * s * 0.75, y + Math.sin(i * 1.6 + f * 0.05) * s * 0.75, s * 0.12, shine * Math.abs(Math.sin(f * 0.15 + i)));
}
function splashCrown(g, x, y, s, t) { /* a milk splash crown rising and settling */ if (t <= 0 || t >= 1) return; const a = Math.sin(Math.PI * t); g.save(); g.fillStyle = '#FFFFFF'; g.strokeStyle = OUTLINE; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const an = Math.PI + (i / 8) * Math.PI, h = s * (0.6 + 0.4 * Math.sin(i * 2.3)) * a; const px = x + Math.cos(an) * s * 0.9, py = y + Math.sin(an) * s * 0.25; g.beginPath(); g.moveTo(px - 10, py); g.quadraticCurveTo(px, py - h, px + 10, py); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(px + Math.cos(an) * 10, py - h - 14, 9 * a, 0, 7); g.fill(); g.stroke(); } g.restore(); }
// ---------------- A: hook (frame 0 = thumbnail): a giant spoon skims the cream off a glass of milk; the skim carton looks worried; "LESS CALCIUM?"
function hookComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 30 : f;
  bgScene(g, '#7EF0B4', '#0D5E45', ph, 21, 540, 1150);
  softGlow(g, 640, 1180, 600, '255,255,230', 0.45);
  milkGlass(g, 660, 1560, 400, 640, ph, { cream: 0.7, lift: 0, crys: 1, glow: 0.9, jit });
  const lift = 0.5 + 0.5 * Math.sin(ph * 0.06); spoon(g, 640, 980 - 50 * lift, 210, -0.25 + 0.05 * Math.sin(ph * 0.07), 0.9, ph);
  for (let i = 0; i < 6; i++) { const q = rng(500 + i); const t = ((ph * 0.02 + q()) % 1); crystal(g, 560 + q() * 260 + Math.sin(t * 6 + i) * 20, lerp(1300, 940, t), 14 + q() * 8, t * 3, 0.9 * (1 - t)); }
  const blink = Math.max(0, 1 - Math.abs(ph - 52) / 3);
  carton(g, 255, 1420 + Math.sin(ph * 0.09) * 6, 230, 0.06, ph, { band: '#3FA7E0', tag: 'SKIM', face: true, arms: 0.9, look: [0.7, -0.8], blink, mood: -0.5, jit });
  for (const [x, y, s] of [[90, 1820, 70], [1000, 1760, 60], [880, 1880, 80]]) { softGlow(g, x, y, s * 1.6, '255,255,255', 0.35); }
  if (words > 0) { label(g, 'LESS', 540, 630, 150, WHITE, words, -0.04, 700); label(g, 'CALCIUM?', 540, 780, 150, YELLOW, words, -0.04, 700); }
}
function sceneHook(g, f, jit) { hookComposition(g, f, jit, 1 - seg(f, 84, 94)); }
// ---------------- B: let's skim a glass: the cream rises and is lifted off, the calcium stays
function sceneSkim(g, f, jit) {
  bgScene(g, '#8FD8FF', '#123E86', f, 22, 540, 1050);
  const cr = eo(seg(f, E.creamUp, E.creamUp + 40)), lift = eio(seg(f, E.lift, E.lift + 16));
  milkGlass(g, 540, 1470 + Math.sin(f * 0.08) * 7, 440, 700, f, { cream: cr, lift, rising: f < E.lift + 6, crys: eo(seg(f, E.calc - 20, E.calc + 6)), glow: 0.5 + 0.5 * seg(f, E.calc, E.calc + 10), face: true, look: f < E.lift ? [0, -0.9] : [0.4, -0.2], blink: Math.max(0, 1 - Math.abs(f - 226) / 3), mood: seg(f, E.stays, E.stays + 8), jit });
  // the spoon dips in, scoops the cream and flies off to the right
  const dip = eio(seg(f, E.lift - 22, E.lift)), away = eio(seg(f, E.lift + 2, E.lift + 22));
  spoon(g, lerp(1420, 560, dip) + 760 * away, lerp(520, 860, dip) - 520 * away, 230, lerp(-0.6, -0.15, dip) + away * 0.8, dip > 0.9 ? 1 : 0, f);
  burstFX(g, 540, 1100, seg(f, E.stays, E.stays + 14), 160, 420, 18, '200,235,255');
  label(g, 'CREAM LIFTS OFF', 540, 640, 106, WHITE, seg(f, E.liftLbl, E.liftLbl + 8) * (1 - seg(f, E.stays - 8, E.stays - 2)), -0.02, 700);
  kinetic(g, 'CALCIUM STAYS', 540, 640, 116, YELLOW, seg(f, E.stays, E.stays + 8), f, E.stays, 0.02, 700);
  const pk = back(seg(f, E.stays - 2, E.stays + 12)); if (pk > 0) carton(g, lerp(-160, 150, pk), 1330, 150, 0.2, f, { band: '#3FA7E0', tag: 'SKIM', face: true, arms: 1, look: [0.8, -0.3], mood: 1, jit });
}
// ---------------- C: a cup of whole milk ~ 280 mg calcium; skim ~ 300 mg (towers of crystals, one number at a time)
function tower(g, x, base, n, f, glow) { /* a two-wide stack of crystals; n rows (fractional top row = one crystal) */ for (let i = 0; i < Math.ceil(n); i++) { const both = i + 1 <= n; for (const dx of both ? [-24, 24] : [0]) crystal(g, x + dx + Math.sin(i * 1.7) * 4, base - 34 - i * 50, 28, Math.sin(i + dx) * 0.3 + Math.sin(f * 0.05 + i) * 0.05, glow); } }
function sceneCups(g, f, jit) {
  bgScene(g, '#C2A8FF', '#33176F', f, 23, 540, 1050);
  const tw = 6.9 * eo(seg(f, E.towerW, E.towerW + 26)), ts = 7.5 * eo(seg(f, E.towerS, E.towerS + 18)); /* rows = mg / 40: 276 vs 299 mg */
  for (const [x, band, tag, n, active, cm] of [[300, '#E0453A', 'WHOLE', tw, f < E.k300 - 4, 0.6], [780, '#3FA7E0', 'SKIM', ts, f >= E.k300 - 4, 0]]) {
    const hl = active ? 1 : 0.55; g.save(); g.globalAlpha = 0.55 + 0.45 * hl;
    milkGlass(g, x, 1470, 270, 350, f, { cream: cm, shadow: true, jit }); tower(g, x, 1120, n, f, active ? 0.8 : 0.3);
    const enter = back(seg(f, E.whipBC + 6 + (tag === 'SKIM' ? 6 : 0), E.whipBC + 22 + (tag === 'SKIM' ? 6 : 0)));
    carton(g, x + (tag === 'SKIM' ? 175 : -175), lerp(1900, 1360, enter), 140, tag === 'SKIM' ? -0.12 : 0.12, f, { band, tag, face: true, arms: active ? 0.9 + 0.1 * Math.sin(f * 0.3) : 0.4, look: [tag === 'SKIM' ? -0.6 : 0.6, -0.6], mood: active ? 0.9 : 0.2, shadow: false, jit });
    g.restore(); }
  kinetic(g, 'WHOLE ≈ 280 mg', 540, 640, 116, WHITE, seg(f, E.k280, E.k280 + 8) * (1 - seg(f, E.towerS - 8, E.towerS - 2)), f, E.k280, -0.02, 700); /* gone before 'Skim has about 300' */
  kinetic(g, 'SKIM ≈ 300 mg', 540, 640, 116, YELLOW, seg(f, E.k300, E.k300 + 8), f, E.k300, 0.02, 700);
}
// ---------------- D: calcium helps build and maintain healthy bones and teeth
function sceneBones(g, f, jit) {
  bgScene(g, '#FFA88A', '#7A1E34', f, 24, 540, 1050);
  const fill = eo(seg(f, E.stream, E.stream + 70)), sh = seg(f, E.teeth, E.teeth + 8);
  milkGlass(g, 230, 1520, 240, 320, f, { crys: 1, glow: 0.8, shadow: true, jit });
  for (let i = 0; i < 12; i++) { const t = ((f - E.stream) * 0.025 + i / 12) % 1; if (f < E.stream) break; const tgt = i % 3 === 2 ? [800, 1240] : [600, 960]; const [x, y] = flight({ x: 230, y: 1220 }, { x: tgt[0], y: tgt[1] }, eio(t), 260); crystal(g, x, y, 16, t * 6, 0.9 * (1 - seg(t, 0.85, 1))); }
  bone(g, 580, 960 + Math.sin(f * 0.08) * 8, 300, -0.12 + Math.sin(f * 0.05) * 0.04, fill, f, { face: true, look: [-0.6, 0.5], blink: Math.max(0, 1 - Math.abs(f - 560) / 3), mood: fill, jit });
  tooth(g, 800, 1290 + Math.sin(f * 0.1) * 6, 200, 0.1, sh, f, { face: true, look: [-0.7, 0], mood: sh, jit });
  kinetic(g, 'BONES & TEETH', 540, 640, 120, WHITE, seg(f, E.bones, E.bones + 8), f, E.bones, -0.02, 700);
}
// ---------------- E: either cup gives more than a fifth of a day's calcium (a day dial in five slices)
function scenePayoff(g, f, jit) {
  bgScene(g, '#FFE066', '#C26A00', f, 25, 540, 1050);
  const cx = 540, cy = 1090, R = 300, fr = 0.22 * eo(seg(f, E.pour, E.pour + 40));
  softShadow(g, cx + 12, cy + R + 40, R * 0.9, 24, 0.25);
  g.fillStyle = 'rgba(120,60,0,0.28)'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  if (fr > 0) { const mg = g.createRadialGradient(cx, cy, 20, cx, cy, R); mg.addColorStop(0, '#FFFFFF'); mg.addColorStop(1, '#BFE3FF'); g.fillStyle = mg; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + 6.283 * fr); g.closePath(); g.fill(); }
  g.strokeStyle = OUTLINE; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.lineWidth = 4; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 5) * 6.283; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); }
  g.fillStyle = OUTLINE; g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.fill();
  if (fr > 0.02) { const a = -Math.PI / 2 + 6.283 * fr; crystal(g, cx + Math.cos(a) * (R + 10), cy + Math.sin(a) * (R + 10), 26, f * 0.05, 1); for (let i = 0; i < 5; i++) { const q = rng(950 + i); const aa = -Math.PI / 2 + 6.283 * fr * q(), rr = R * (0.3 + 0.6 * q()); sparkle(g, cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr, 12 + q() * 8, Math.abs(Math.sin(f * 0.12 + i * 1.3)) * seg(f, E.pour + 30, E.pour + 40)); } }
  // a cup pours into the dial
  const pt = seg(f, E.pour - 14, E.pour), pe = seg(f, E.pour + 44, E.pour + 60); g.save(); g.translate(lerp(1200, 760, eo(pt)) + 500 * eio(pe), 720); g.rotate(-1.0 * eo(pt) * (1 - pe)); milkGlass(g, 0, 120, 150, 200, f, { shadow: false, jit }); g.restore();
  if (pt >= 1 && pe < 1) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(690, 760); g.quadraticCurveTo(640, 800, 600, cy - R * 0.55); g.stroke(); g.strokeStyle = 'rgba(180,200,225,0.8)'; g.lineWidth = 4; g.stroke(); }
  const pk = back(seg(f, E.fifth - 4, E.fifth + 12)); if (pk > 0) { carton(g, lerp(-200, 170, pk), 1480, 130, 0.15, f, { band: '#E0453A', tag: 'WHOLE', face: true, arms: 0.8 + 0.2 * Math.sin(f * 0.3), mood: 1, shadow: false, jit }); carton(g, lerp(1280, 910, pk), 1480, 130, -0.15, f, { band: '#3FA7E0', tag: 'SKIM', face: true, arms: 0.8 + 0.2 * Math.sin(f * 0.3 + 1), mood: 1, shadow: false, jit }); }
  kinetic(g, 'OVER A FIFTH', 540, 650, 128, WHITE, seg(f, E.fifth, E.fifth + 8), f, E.fifth, -0.02, 700);
}
// ---------------- cameras (per scene)
const SPANS = () => [[0, E.waveAB + 20], [E.waveAB, E.whipBC + 12], [E.whipBC, E.whipCD + 12], [E.whipCD, E.waveDE + 20], [E.waveDE, N]];
function camFor(i, f) {
  const [a, b] = SPANS()[i]; const z = 1 + 0.045 * eio(seg(f, a, b));
  const kicks = [E.liftLbl, E.stays, E.k280, E.k300, E.bones, E.fifth].reduce((s, e) => s + 0.02 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  const [sx, sy] = [shake(f, E.lift, 10), shake(f, E.k300, 8)].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
  return { z: z * (1 + kicks), x: 540 - sx, y: 1010 - sy };
}

// ---------------- paper grain (print texture), CTA seal (white wordmark on colour)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.05)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } }
// ---------------- liquid wave (milk white or CalMeter green): rises from the bottom with a wavy edge and splash droplets
function liquidWave(g, topY, f, col1, col2, edge = '#FFFFFF') {
  g.save(); const gr = g.createLinearGradient(0, topY, 0, topY + 600); gr.addColorStop(0, col1); gr.addColorStop(1, col2); g.fillStyle = gr;
  g.beginPath(); g.moveTo(-40, H + 60); for (let x = -40; x <= W + 40; x += 30) g.lineTo(x, topY + Math.sin(x * 0.012 + f * 0.25) * 26 + Math.sin(x * 0.031 - f * 0.18) * 12); g.lineTo(W + 40, H + 60); g.closePath(); g.fill();
  g.strokeStyle = OUTLINE; g.lineWidth = 5; g.beginPath(); for (let x = -40; x <= W + 40; x += 30) { const y = topY + Math.sin(x * 0.012 + f * 0.25) * 26 + Math.sin(x * 0.031 - f * 0.18) * 12; x === -40 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  const q = rng(Math.floor(f / 2) + 3); for (let i = 0; i < 10; i++) { const x = q() * W, y = topY - 20 - q() * 90; g.fillStyle = edge; g.beginPath(); g.arc(x, y, 6 + q() * 12, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 2.5; g.stroke(); }
  g.restore();
}
// ---------------- CTA: a CalMeter-green wave rises; the two cartons wave; calcium bubbles rise; seal + white wordmark
function drawCTA(g, f, jit) {
  const c = eio(seg(f, E.cta, E.cta + 18)); if (c <= 0) return;
  liquidWave(g, lerp(H + 80, -120, c), f, '#8BE36A', '#1F7A2A', '#C8F5B0');
  const r = seg(f, E.cta + 12, E.cta + 26); if (r <= 0) return;
  for (let i = 0; i < 16; i++) { const q = rng(900 + i); const t = ((f - E.cta) * (0.006 + q() * 0.006) + q()) % 1; const x = 80 + q() * 920 + Math.sin(t * 8 + i) * 24, y = lerp(1700, 520, t); if (i % 2) crystal(g, x, y, 12 + q() * 8, t * 4, 0.7); else { g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 8 + q() * 10, 0, 7); g.stroke(); } }
  const pop = back(seg(f, E.cta + 10, E.cta + 26));
  carton(g, lerp(-240, 315, pop), 1040 + Math.sin(f * 0.13) * 10, 210, 0.1 + Math.sin(f * 0.11) * 0.05, f, { band: '#E0453A', tag: 'WHOLE', face: true, arms: 0.6 + 0.4 * Math.sin(f * 0.25), look: [0.5, 0.2], mood: 1, blink: Math.max(0, 1 - Math.abs(f - 872) / 4), jit });
  carton(g, lerp(1320, 735, pop), 1040 + Math.sin(f * 0.13 + 1.5) * 10, 210, -0.1 + Math.sin(f * 0.11 + 1) * 0.05, f, { band: '#3FA7E0', tag: 'SKIM', face: true, arms: 0.6 + 0.4 * Math.sin(f * 0.25 + 1.2), look: [-0.5, 0.2], mood: 1, blink: Math.max(0, 1 - Math.abs(f - 884) / 4), jit });
  g.font = '900 84px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 60, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1340;
  const sc = 0.5 + 0.5 * back(r); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  g.save(); g.globalAlpha = r; g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = WHITE; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.restore();
  const wr = seg(f, E.cta + 16, E.cta + 36), s = 'CalMeter';
  if (wr > 0) { const sub = s.slice(0, Math.ceil(s.length * wr)); g.save(); g.font = '900 84px NDisplay'; g.textAlign = 'left'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 13; g.strokeText(sub, cx + R0 + gap, cy + 30); g.restore(); text(g, sub, cx + R0 + gap, cy + 30, '900 84px NDisplay', WHITE, 'left', 0, 'cta'); }
  const sh = seg(f, E.ctaWord, E.ctaWord + 36); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 30, '900 84px NDisplay', YELLOW, 'left', 0, 'cta'); g.restore(); }
  const tk = seg(f, E.cta + 30, E.cta + 80); g.strokeStyle = WHITE; g.lineWidth = 1.6; for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 10), cy + Math.sin(a) * (R0 + 10)); g.lineTo(cx + Math.cos(a) * (R0 + 18), cy + Math.sin(a) * (R0 + 18)); g.stroke(); }
}
// ---------------- compositor: milk waves and whip-pans; then grain, CTA, captions
const SCENES = [sceneHook, sceneSkim, sceneCups, sceneBones, scenePayoff];
const TRANS = [{ at: E.waveAB, d: 18, type: 'wave' }, { at: E.whipBC, d: 12, type: 'whip' }, { at: E.whipCD, d: 12, type: 'whip' }, { at: E.waveDE, d: 18, type: 'wave' }];
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
    else { /* milk wave: rises over the old scene, drains to reveal the new one */
      paintScene(g, p < 0.5 ? ti : ti + 1, f, jit); const c = p < 0.5 ? eio(p * 2) : eio((1 - p) * 2); liquidWave(g, lerp(H + 80, -140, c), f, '#FFFFFF', '#DCE8F5'); }
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.4; g.drawImage(grain, 0, 0); g.restore();
  drawCTA(g, f, rng(5000 + Math.floor(f / 2) * 2));
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same curiosity words, larger */
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540, 1320); g.scale(1.03, 1.03); g.translate(-540, -1320);
  hookComposition(g, 30, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.4; g.drawImage(grain, 0, 0); g.restore();
  label(g, 'LESS', 540, 500, 200, WHITE, 1, -0.04, 800); label(g, 'CALCIUM?', 540, 690, 190, YELLOW, 1, -0.04, 800);
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
