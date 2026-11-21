// CalMeter English 30 s english-22 (batch 22, 2026-11-19): what's really inside a pineapple, "MORE THAN SWEET".
// The requested "What is really inside a mango?" was already production #01 (2026-11-02: mango per 100 g, 60 kcal, 1.6 g fibre, 36 mg
// vitamin C), so a genuinely different same-genre fruit with the same brief was chosen: the pineapple (never covered). USDA FDC 169124 per
// 100 g edible: 1.4 g fibre, 47.8 mg vitamin C; 1 cup chunks 165 g ~ 79 mg (88 % of the US DV). MedlinePlus: fibre aids digestion; vitamin C
// makes collagen (skin, blood vessels) and aids iron absorption.
// Playful mascot theatre (frame 0 = thumbnail): a pineapple mascot on a tiny stage opens its belly doors on a golden world; crown, peel and
// core pop off; a zoom-dive into the gold where it walks a braided fibre path; a velvet-curtain change to an inner stage where the vitamin C
// star rises; whip to collagen (helix, skin, vessel) and iron; whip to a measuring cup inside a daily-vitamin-C ring; curtains close for the
// CTA bow. Captions 80 px in the y 280-460 band; one headline at a time; three numbers. Shared engine from english-20/21. Original Canvas2D.
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
// ---------------- shared small parts (copied from english-21): face, droplet
function faceOn(g, x, y, r, o) {
  eyes(g, x, y, r, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0);
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, r * 0.3); g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * 1.5, r * (0.9 + 0.4 * (o.mood ?? 0)), 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = 'rgba(255,110,120,0.55)'; g.beginPath(); g.ellipse(x - r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.ellipse(x + r * 2.6, y + r * 1.0, r * 0.6, r * 0.36, 0, 0, 7); g.fill();
}
function sparkSpot(g, x, y, r, a, rgb = '255,236,150') { if (a <= 0) return; softGlow(g, x, y, r * 2.2, rgb, 0.5 * a); sparkle(g, x, y, r, a); }
// ---------------- pineapple mascot (original): rind with a diamond lattice, spiky crown, face, little arms; a belly "stage" with doors
const PINE_GOLD = '#FFD23F', PINE_GOLD_D = '#F29A00';
function crown(g, x, y, s, rot, jit) {
  /* a fan of spiky leaves rooted at (x, y), size s */
  g.save(); g.translate(x, y); g.rotate(rot);
  const leaves = [[-1.05, 0.62], [1.05, 0.62], [-0.78, 0.82], [0.78, 0.82], [-0.5, 0.95], [0.5, 0.95], [-0.22, 1.05], [0.22, 1.05], [0, 1.12]];
  for (const [a, l] of leaves) { const L = s * l, w = s * 0.16; g.save(); g.rotate(a * 0.55); const gr = g.createLinearGradient(0, 0, 0, -L); gr.addColorStop(0, '#2F7A1C'); gr.addColorStop(1, '#8BD448'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.7, -L * 0.6, 0, -L); g.quadraticCurveTo(w * 0.7, -L * 0.6, w, 0); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, s * 0.022); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = Math.max(1, s * 0.012); g.beginPath(); g.moveTo(0, -s * 0.05); g.lineTo(0, -L * 0.85); g.stroke(); g.restore(); }
  g.restore();
}
function rindPattern(g, rx, ry, seed) {
  /* diamond lattice of fruitlets with a dark eye and a light spike, clipped by the caller */
  g.strokeStyle = 'rgba(70,40,10,0.55)'; g.lineWidth = Math.max(1.5, rx * 0.012);
  for (let k = -9; k <= 9; k++) { g.beginPath(); g.moveTo(-rx * 1.2 + k * rx * 0.22, -ry * 1.1); g.lineTo(rx * 1.2 + k * rx * 0.22, ry * 1.1); g.stroke(); g.beginPath(); g.moveTo(rx * 1.2 + k * rx * 0.22, -ry * 1.1); g.lineTo(-rx * 1.2 + k * rx * 0.22, ry * 1.1); g.stroke(); }
  const q = rng(seed); for (let i = -6; i <= 6; i++) for (let j = -7; j <= 7; j++) { const x = i * rx * 0.22 + ((j % 2) ? rx * 0.11 : 0), y = j * ry * 0.2 * (rx / ry) * 0.55 * 2; if ((x / rx) ** 2 + (y / ry) ** 2 > 1.05) continue;
    g.fillStyle = 'rgba(60,32,8,0.75)'; g.beginPath(); g.ellipse(x, y + 3, rx * 0.022, rx * 0.016, 0, 0, 7); g.fill(); g.fillStyle = `rgba(255,240,170,${0.35 + 0.3 * q()})`; g.beginPath(); g.ellipse(x - rx * 0.02, y - rx * 0.02, rx * 0.03, rx * 0.012, -0.6, 0, 7); g.fill(); }
}
function rindFill(g, rx, ry) { const gr = g.createRadialGradient(-rx * 0.35, -ry * 0.35, rx * 0.1, 0, 0, rx * 1.25); gr.addColorStop(0, '#FFC75A'); gr.addColorStop(0.55, '#D98A26'); gr.addColorStop(1, '#7A4A12'); return gr; }
function goldenFlesh(g, rx, ry, f, seed) {
  /* the inside: bright golden flesh with radiating juice cells, glints and a pale core */
  const gr = g.createRadialGradient(0, 0, rx * 0.1, 0, 0, Math.max(rx, ry)); gr.addColorStop(0, '#FFF6B8'); gr.addColorStop(0.45, PINE_GOLD); gr.addColorStop(1, PINE_GOLD_D); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,230,0.55)'; g.lineWidth = Math.max(1.5, rx * 0.012); g.beginPath(); for (let i = 0; i < 36; i++) { const a = (i / 36) * 6.283; g.moveTo(Math.cos(a) * rx * 0.22, Math.sin(a) * ry * 0.22); g.lineTo(Math.cos(a) * rx * 0.95, Math.sin(a) * ry * 0.95); } g.stroke();
  const q = rng(seed); for (let i = 0; i < 26; i++) { const a = q() * 6.283, rr = 0.3 + q() * 0.6; sparkle(g, Math.cos(a) * rx * rr, Math.sin(a) * ry * rr, rx * 0.035, 0.5 + 0.5 * Math.sin(f * 0.15 + i)); }
}
function pineapple(g, x, y, s, rot, f, o = {}) {
  /* the mascot. s = body half-width. o.doors 0 (closed) .. 1 (wide open belly stage); o.peeled 0..1 (rind gone); o.crownOff; o.coreOut 0..1; o.face; o.arms; o.bow */
  const rx = s, ry = s * 1.3; g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  if (o.shadow !== false) softShadow(g, s * 0.08, ry * 0.98, rx * 0.95, ry * 0.12, 0.32);
  const bow = o.bow ?? 0; g.rotate(bow * 0.22);
  // arms (behind the body)
  if (o.arms) { const up = o.arms; g.strokeStyle = OUTLINE; g.lineCap = 'round'; for (const sd of [-1, 1]) { const ax = sd * rx * 0.92, ay = ry * 0.05, hx = sd * rx * (1.45 - 0.2 * bow), hy = ay - ry * 0.55 * up + ry * 0.4 * (1 - up); g.lineWidth = s * 0.11; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(sd * rx * 1.3, ay + ry * 0.1, hx, hy); g.stroke(); g.strokeStyle = '#FFE08A'; g.lineWidth = s * 0.06; g.stroke(); g.strokeStyle = OUTLINE; g.fillStyle = '#FFF4D6'; g.lineWidth = s * 0.025; g.beginPath(); g.arc(hx, hy, s * 0.11, 0, 7); g.fill(); g.stroke(); } }
  // crown
  if (!o.crownOff) crown(g, 0, -ry * 0.92, s * 0.95, Math.sin(f * 0.07) * 0.04, o.jit);
  // peeled golden body underneath
  const pe = o.peeled ?? 0;
  g.save(); g.beginPath(); g.ellipse(0, 0, rx * 0.97, ry * 0.97, 0, 0, 7); g.clip();
  const pg = g.createRadialGradient(-rx * 0.3, -ry * 0.3, rx * 0.1, 0, 0, rx * 1.3); pg.addColorStop(0, '#FFF2A0'); pg.addColorStop(0.5, PINE_GOLD); pg.addColorStop(1, PINE_GOLD_D); g.fillStyle = pg; g.fillRect(-rx, -ry, rx * 2, ry * 2);
  const q = rng(77); g.fillStyle = 'rgba(150,80,10,0.55)'; for (let i = 0; i < 46; i++) { const a = i * 2.39996, rr = Math.sqrt((i + 0.5) / 46); g.beginPath(); g.ellipse(Math.cos(a) * rx * rr * 0.9, Math.sin(a) * ry * rr * 0.9, rx * 0.03, rx * 0.022, a, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-rx * 0.35, -ry * 0.45, rx * 0.3, ry * 0.12, -0.4, 0, 7); g.fill();
  // the core slides up out of the top
  const co = o.coreOut ?? 0; if (co < 1 && pe > 0.5) { g.fillStyle = '#FFF4C2'; g.strokeStyle = 'rgba(200,140,30,0.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -ry * 1.6 * eio(co), rx * 0.2, ry * 0.75, 0, 0, 7); g.fill(); g.stroke(); }
  g.restore();
  // rind: falls away as strips when peeled
  if (pe < 1) { for (let k = 0; k < 6; k++) { const x0 = -rx + k * rx / 3, mid = x0 + rx / 6, out = Math.sign(mid) || 1; const d = clamp(pe * 1.25 - k * 0.04);
      g.save(); g.translate(out * rx * 1.6 * d * d + mid * 0.3 * d, ry * 2.2 * d * d); g.rotate(out * d * 0.9); g.globalAlpha *= 1 - seg(d, 0.75, 1);
      g.beginPath(); g.rect(x0, -ry, rx / 3 + 0.8, ry * 2); g.clip(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.clip(); g.fillStyle = rindFill(g, rx, ry); g.fillRect(-rx, -ry, rx * 2, ry * 2); rindPattern(g, rx, ry, 5);
      // belly stage window with doors (only while the rind is on)
      if ((o.doors ?? 0) > 0) { const wx = rx * 0.62, wy = ry * 0.4, cy = ry * 0.2, dv = o.doors;
        g.save(); g.beginPath(); g.ellipse(0, cy, wx, wy, 0, 0, 7); g.clip(); g.translate(0, cy); goldenFlesh(g, wx, wy, f, 9); softGlow(g, 0, 0, wx * 1.2, '255,250,200', 0.5 * dv); g.restore();
        for (const sd of [-1, 1]) { g.save(); g.translate(sd * wx, cy); g.scale(1 - 1.25 * dv, 1); g.beginPath(); g.ellipse(-sd * wx, 0, wx, wy, 0, sd > 0 ? -Math.PI / 2 : Math.PI / 2, sd > 0 ? Math.PI / 2 : Math.PI * 1.5, sd > 0); g.closePath();
          g.fillStyle = (1 - 1.25 * dv) > 0 ? '#C9822A' : '#FFE9A8'; g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 3; g.stroke(); g.restore(); }
        g.strokeStyle = OUTLINE; g.lineWidth = 4; g.beginPath(); g.ellipse(0, cy, wx, wy, 0, 0, 7); g.stroke(); }
      g.restore(); } }
  burin(g, ell(0, 0, rx, ry, 0, 6.283, 72), Math.max(2, s * 0.022), OUTLINE, 1, o.jit);
  if (o.face) faceOn(g, 0, -ry * 0.38, s * 0.13, o);
  g.restore();
}
// ---------------- theatre set: velvet curtains, valance, spotlights, floorboards (foreground depth)
function velvet(g, x0, x1, f, side, open = 1) {
  /* a red velvet curtain panel between x0 and x1 with vertical folds and gentle sway */
  const w = x1 - x0; g.save(); const gr = g.createLinearGradient(x0, 0, x1, 0); for (let k = 0; k <= 8; k++) gr.addColorStop(k / 8, k % 2 ? '#7E0F1E' : '#C8233A'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x0, -40); g.lineTo(x1, -40); for (let y = 0; y <= H + 40; y += 40) g.lineTo(x1 + Math.sin(y * 0.01 + f * 0.05) * 8 * side, y); g.lineTo(x0, H + 40); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,0,10,0.5)'; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(255,200,200,0.12)'; for (let k = 0; k < 4; k++) g.fillRect(x0 + w * (0.12 + k * 0.24), -40, w * 0.05, H + 80); g.restore();
}
function stageSet(g, f, opts = {}) {
  /* floorboards + spotlight cones + side curtains; draws the background half (call before heroes) */
  const floorY = opts.floor ?? 1420; const fg = g.createLinearGradient(0, floorY, 0, H); fg.addColorStop(0, '#B8692E'); fg.addColorStop(1, '#5A2A0E'); g.fillStyle = fg; g.beginPath(); g.moveTo(-200, H + 200); g.lineTo(-60, floorY); g.lineTo(W + 60, floorY); g.lineTo(W + 200, H + 200); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(60,25,5,0.6)'; g.lineWidth = 3; for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(540 + k * 60, floorY); g.lineTo(540 + k * 160, H + 40); g.stroke(); } g.strokeStyle = 'rgba(255,220,160,0.5)'; g.beginPath(); g.moveTo(-60, floorY); g.lineTo(W + 60, floorY); g.stroke();
  for (const [sx, ang] of [[220, 0.32], [860, -0.32]]) { g.save(); g.translate(sx, -60); g.rotate(ang + Math.sin(f * 0.03 + sx) * 0.04); const cg = g.createLinearGradient(0, 0, 0, 1700); cg.addColorStop(0, 'rgba(255,245,200,0.38)'); cg.addColorStop(1, 'rgba(255,245,200,0)'); g.fillStyle = cg; g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.lineTo(330, 1700); g.lineTo(-330, 1700); g.closePath(); g.fill(); g.restore(); }
  softGlow(g, 540, floorY, 420, '255,230,150', 0.35);
}
function stageFront(g, f) {
  /* foreground: side curtains and a valance above the caption band (depth layer in front of the hero) */
  velvet(g, -60, 110, f, 1); velvet(g, 970, W + 60, f, -1);
  g.save(); const vg = g.createLinearGradient(0, 0, 0, 230); vg.addColorStop(0, '#6E0B18'); vg.addColorStop(1, '#C8233A'); g.fillStyle = vg; g.beginPath(); g.moveTo(-60, -40); g.lineTo(W + 60, -40); g.lineTo(W + 60, 170);
  for (let k = 8; k >= 0; k--) { const x = -60 + (W + 120) * (k / 8); g.quadraticCurveTo(x + (W + 120) / 16, 250, x, 170); } g.closePath(); g.fill(); g.strokeStyle = '#FFC94A'; g.lineWidth = 5; g.stroke(); g.restore();
}
// ---------------- golden juice world: juice sacs (parallax), a braided fibre path
const SACS = Array.from({ length: 22 }, (_, i) => { const q = rng(300 + i); return { x: q() * 1200 - 60, y: q() * 2000 - 40, d: 0.25 + q() * 0.75, a: q() * 6.28, sp: 0.2 + q() * 0.5 }; });
function juiceSac(g, x, y, s, a, alpha) { g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(a); const gr = g.createLinearGradient(-s, 0, s, 0); gr.addColorStop(0, 'rgba(255,214,70,0.9)'); gr.addColorStop(0.5, 'rgba(255,248,200,0.95)'); gr.addColorStop(1, 'rgba(242,160,0,0.9)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, s, s * 0.42, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(160,90,0,0.7)'; g.lineWidth = Math.max(1.5, s * 0.05); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(-s * 0.35, -s * 0.15, s * 0.3, s * 0.08, 0, 0, 7); g.fill(); g.restore(); }
const PATH_PTS = (() => { const P = [[540, 1560], [300, 1420], [330, 1250], [700, 1170], [760, 1020], [470, 960], [400, 880], [560, 850]]; const out = []; for (let i = 0; i < P.length - 1; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1], [xm, ym] = i + 2 < P.length ? P[i + 2] : P[i + 1]; for (let k = 0; k < 16; k++) { const t = k / 16; out.push([lerp(x0, x1, t) + (i % 2 ? 1 : -1) * Math.sin(Math.PI * t) * 30, lerp(y0, y1, t)]); } } out.push(P[P.length - 1]); return out; })();
function pathAt(t) { const n = PATH_PTS.length - 1, u = clamp(t) * n, i = Math.min(n - 1, Math.floor(u)), k = u - i; const [x0, y0] = PATH_PTS[i], [x1, y1] = PATH_PTS[i + 1]; return [lerp(x0, x1, k), lerp(y0, y1, k), Math.atan2(y1 - y0, x1 - x0)]; }
function fibrePath(g, reveal, f, flow) {
  /* three twisted pale strands along PATH_PTS, revealed 0..1; particles flow along it (flow = speed) */
  const n = Math.max(2, Math.floor(PATH_PTS.length * clamp(reveal)));
  for (const [ph, col] of [[0, '#FFF7D0'], [2.09, '#E9F7A8'], [4.19, '#FFE48A']]) { const pts = []; for (let i = 0; i < n; i++) { const [x, y] = PATH_PTS[i], [xa, ya] = PATH_PTS[Math.min(i + 1, PATH_PTS.length - 1)]; const an = Math.atan2(ya - y, xa - x) + Math.PI / 2, o = Math.sin(i * 0.55 + ph + f * 0.06) * 20; pts.push([x + Math.cos(an) * o, y + Math.sin(an) * o]); }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 26; poly(g, pts, false); g.stroke(); g.strokeStyle = col; g.lineWidth = 16; poly(g, pts, false); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 5; poly(g, pts, false); g.stroke(); g.restore(); }
  if (flow > 0 && reveal > 0.05) for (let i = 0; i < 12; i++) { const t = ((f * 0.006 * flow + i / 12) % 1) * clamp(reveal); const [x, y] = pathAt(t); softGlow(g, x, y, 44, '255,255,220', 0.9); g.fillStyle = WHITE; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
}
// ---------------- vitamin C star, collagen helix, skin block, blood vessel, iron, cell, measuring cup, chunks, ring
function starPath(g, r, k = 0.5) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * 6.283, rr = i % 2 ? r * k : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); }
function vitStar(g, x, y, r, rot, f, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); softGlow(g, 0, 0, r * 2.2, '255,180,60', 0.55);
  starPath(g, r, 0.52); const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); gr.addColorStop(0, '#FFE680'); gr.addColorStop(0.6, '#FFA21F'); gr.addColorStop(1, '#E66A00'); g.fillStyle = gr; g.fill(); g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = Math.max(3, r * 0.05); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-r * 0.25, -r * 0.3, r * 0.22, r * 0.08, -0.5, 0, 7); g.fill();
  if (o.face) faceOn(g, 0, -r * 0.02, r * 0.11, o);
  g.restore();
}
function helix(g, x0, x1, y, amp, reveal, f) {
  /* collagen as a triple helix rope drawn left to right */
  const n = 90, m = Math.floor(n * clamp(reveal)); if (m < 2) return;
  for (const [ph, col] of [[0, '#FFE0D0'], [2.09, '#FFC3B0'], [4.19, '#FFF3E6']]) { const pts = []; for (let i = 0; i <= m; i++) { const u = i / n; pts.push([lerp(x0, x1, u), y + Math.sin(u * 18 + ph + f * 0.05) * amp]); }
    g.save(); g.lineCap = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 16; poly(g, pts, false); g.stroke(); g.strokeStyle = col; g.lineWidth = 9; poly(g, pts, false); g.stroke(); g.restore(); }
}
function skinBlock(g, x, y, w, h, a) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); const t = h / 3; [['#FFD2B8', 0], ['#F7A88C', t], ['#E9806C', 2 * t]].forEach(([c, dy]) => { g.fillStyle = c; g.fillRect(x - w / 2, y + dy, w, t); }); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.strokeRect(x - w / 2, y, w, h); g.strokeStyle = 'rgba(120,40,30,0.4)'; g.lineWidth = 2; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x - w / 2, y + k * t); g.lineTo(x + w / 2, y + k * t); g.stroke(); } g.restore(); }
function vessel(g, x, y, w, h, a, f) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.fillStyle = '#B3122A'; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.fillStyle = '#E2324A'; g.beginPath(); g.roundRect(x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, h / 2); g.fill();
  for (let i = 0; i < 6; i++) { const cx = x - w / 2 + ((f * 4 + i * w / 6) % w); g.fillStyle = '#FF7A8A'; g.beginPath(); g.ellipse(cx, y, h * 0.2, h * 0.14, 0, 0, 7); g.fill(); g.strokeStyle = '#8A0A1C'; g.lineWidth = 2; g.stroke(); }
  g.strokeStyle = OUTLINE; g.lineWidth = 4; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.stroke(); g.restore(); }
function ironBead(g, x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, '#E7C9C0'); gr.addColorStop(0.5, '#8E4A3E'); gr.addColorStop(1, '#4A1E18'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 3; g.stroke(); g.restore(); }
function cell(g, x, y, r, a, f) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, '#FFE3EC'); gr.addColorStop(1, '#F08AA8'); g.fillStyle = gr; g.beginPath(); for (let i = 0; i <= 40; i++) { const t = (i / 40) * 6.283; const rr = r * (1 + 0.04 * Math.sin(t * 5 + f * 0.1)); g.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr); } g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = 4; g.stroke(); g.fillStyle = 'rgba(180,60,110,0.5)'; g.beginPath(); g.arc(x + r * 0.2, y + r * 0.1, r * 0.3, 0, 7); g.fill(); g.restore(); }
function chunk(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); const gr = g.createLinearGradient(-s, -s, s, s); gr.addColorStop(0, '#FFF0A0'); gr.addColorStop(1, '#F2A900'); g.fillStyle = gr; g.beginPath(); g.moveTo(-s, -s * 0.7); g.lineTo(s * 0.8, -s); g.lineTo(s, s * 0.7); g.lineTo(-s * 0.8, s); g.closePath(); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, s * 0.1); g.lineJoin = 'round'; g.stroke(); g.strokeStyle = 'rgba(255,255,230,0.7)'; g.lineWidth = Math.max(1, s * 0.06); g.beginPath(); g.moveTo(-s * 0.5, -s * 0.2); g.lineTo(s * 0.5, s * 0.1); g.stroke(); g.restore(); }
function measuringCup(g, cx, base, w, h, fillN, f, jit) {
  const top = base - h, tw = w / 2, bw = w * 0.42; softShadow(g, cx + 8, base + 10, w * 0.62, 14, 0.28);
  const P = [[cx - tw, top], [cx + tw, top], [cx + bw, base], [cx - bw, base]]; g.fillStyle = 'rgba(255,255,255,0.28)'; poly(g, P); g.fill();
  g.save(); poly(g, P); g.clip(); const q = rng(55); for (let i = 0; i < Math.floor(fillN); i++) { const row = Math.floor(i / 5), col = i % 5; chunk(g, cx - bw * 0.8 + col * bw * 0.4 + (q() - 0.5) * 12, base - 30 - row * 44 + (q() - 0.5) * 8, 24, q() * 1.2); } g.restore();
  g.strokeStyle = OUTLINE; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + tw * 0.95, top + h * 0.2); g.quadraticCurveTo(cx + tw * 1.5, top + h * 0.45, cx + bw * 1.05, top + h * 0.75); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 5; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.55)'; poly(g, [[cx - tw * 0.8, top + 14], [cx - tw * 0.62, top + 14], [cx - bw * 0.62, base - 16], [cx - bw * 0.8, base - 16]]); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + tw * 0.15, top + 26); g.lineTo(cx + tw * 0.6, top + 26); g.stroke();
  burin(g, [P[0], P[3], P[2], P[1]], 2.6, OUTLINE, 1, jit); g.strokeStyle = OUTLINE; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, top, tw, 10, 0, 0, 7); g.stroke();
}
// ---------------- A+B: the tiny golden theatre (frame 0 = thumbnail), then crown, peel and core come off and we step inside
function theatreComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 26 : f;
  bgScene(g, '#B23A7E', '#2A0622', ph, 11, 540, 1150);
  stageSet(g, ph, { floor: 1500 });
  softGlow(g, 540, 1300, 600, '255,226,120', 0.55);
  const doors = still ? 1 : 0.55 + 0.45 * eo(seg(f, 0, 40));
  const crownT = seg(f, E.crown, E.crown + 22), peelT = seg(f, E.peel, E.peel + 24), coreT = seg(f, E.core, E.core + 18);
  const arms = still ? 1 : 0.6 + 0.4 * Math.sin(Math.PI * seg(f, 0, 50));
  const blink = Math.max(0, 1 - Math.abs(ph - 44) / 3) + Math.max(0, 1 - Math.abs(ph - 160) / 3);
  pineapple(g, 540, 1262 + Math.sin(ph * 0.08) * 6, 212, Math.sin(ph * 0.05) * 0.03, ph, { doors, peeled: peelT, crownOff: crownT > 0, coreOut: coreT, face: true, arms, look: ph < 40 ? [0, -0.9] : [0.4, 0.3], blink: clamp(blink), mood: 0.5, jit });
  if (crownT > 0 && crownT < 1) { g.save(); g.globalAlpha = 1 - seg(crownT, 0.8, 1); crown(g, 540 + 560 * crownT, 1262 - 212 * 1.3 * 0.92 - 760 * Math.sin(Math.PI * 0.6 * crownT) + 420 * crownT * crownT, 201, crownT * 6, jit); g.restore(); }
  for (let i = 0; i < 8; i++) { const q = rng(i * 13 + 2); sparkle(g, 280 + q() * 520, 1000 + q() * 480, 12 + q() * 12, Math.abs(Math.sin(ph * 0.11 + i * 1.3)) * (1 - peelT * 0.5)); }
  // tags, one at a time
  label(g, 'CROWN', 540, 640, 96, WHITE, seg(f, E.crown, E.crown + 6) * (1 - seg(f, E.peel - 4, E.peel)), -0.03);
  label(g, 'PEEL', 540, 640, 96, WHITE, seg(f, E.peel, E.peel + 6) * (1 - seg(f, E.core - 3, E.core)), 0.03);
  label(g, 'CORE', 540, 640, 96, WHITE, seg(f, E.core, E.core + 6) * (1 - seg(f, E.core + 14, E.core + 20)), -0.03);
  stageFront(g, ph);
  if (words > 0) { label(g, 'MORE THAN', 540, 606, 134, YELLOW, words, -0.04, 700); label(g, 'SWEET', 540, 746, 156, WHITE, words, -0.04, 700); }
}
function sceneTheatre(g, f, jit) { theatreComposition(g, f, jit, 1 - seg(f, 76, 86)); }
// ---------------- C: inside the gold: a fibre path; 1.4 g per 100 g; fibre aids digestion
function sceneFibre(g, f, jit, cam) {
  bgScene(g, '#FFE680', '#D96A00', f, 12, 540, 1050, cam);
  for (const s of SACS) { if (s.d > 0.6) continue; juiceSac(g, s.x, ((s.y - f * s.sp * 2) % 2000 + 2000) % 2000 - 40, 40 + s.d * 60, s.a + f * 0.005, 0.5 + 0.4 * s.d); }
  const rev = eo(seg(f, E.path, E.path + 50)); fibrePath(g, rev, f, f > E.digest ? 3.2 : 1);
  const walk = 0.62 * seg(f, E.path + 10, E.digest + 30); const [mx, my, ma] = pathAt(walk * rev); const hop = Math.abs(Math.sin(f * 0.35)) * 10;
  pineapple(g, mx, my - 100 - hop, 66, Math.sin(f * 0.35) * 0.08, f, { peeled: 1, crownOff: false, coreOut: 1, face: true, arms: 0.7 + 0.3 * Math.sin(f * 0.35), look: [Math.cos(ma) * 0.8, -0.2], mood: 0.6, shadow: false, jit });
  for (const s of SACS) { if (s.d <= 0.6) continue; juiceSac(g, s.x, ((s.y - f * s.sp * 3.2) % 2000 + 2000) % 2000 - 40, 70 + s.d * 70, s.a + f * 0.006, 0.85); }
  kinetic(g, '1.4 g FIBRE', 540, 640, 132, WHITE, seg(f, E.k14, E.k14 + 8) * (1 - seg(f, E.digest - 6, E.digest)), f, E.k14, -0.03, 760);
  label(g, 'AIDS DIGESTION', 540, 640, 104, YELLOW, seg(f, E.digest, E.digest + 8), 0.02, 690);
}
// ---------------- D: an inner stage; the vitamin C star rises: 48 mg per 100 g
function sceneStar(g, f, jit) {
  bgScene(g, '#4B3BB8', '#0E0A3A', f, 13, 540, 1100);
  stageSet(g, f, { floor: 1400 });
  const rise = back(seg(f, E.starUp, E.starUp + 20)); const y = lerp(1700, 1120, rise) + Math.sin(f * 0.09) * 8; const bow = Math.max(0, Math.sin(Math.PI * seg(f, E.bowS, E.bowS + 24)));
  g.save(); g.beginPath(); g.rect(-100, -100, W + 200, 1400 + 100); g.clip(); vitStar(g, 540, y + bow * 40, 190, Math.sin(f * 0.06) * 0.08 + bow * 0.3, f, { face: true, look: [0, -0.4], blink: Math.max(0, 1 - Math.abs(f - 420) / 3), mood: 0.8 }); g.restore();
  g.fillStyle = '#2A1206'; g.beginPath(); g.ellipse(540, 1400, 230 * clamp(seg(f, E.starUp - 6, E.starUp) * (1 - seg(f, E.starUp + 22, E.starUp + 30))), 26, 0, 0, 7); g.fill();
  burstFX(g, 540, 1120, seg(f, E.k48, E.k48 + 16), 200, 520, 22, '255,210,120');
  for (let i = 0; i < 10; i++) { const q = rng(i * 5 + 77); sparkle(g, 160 + q() * 760, 820 + q() * 620, 12 + q() * 14, seg(f, E.k48, E.k48 + 6) * Math.abs(Math.sin(f * 0.13 + i))); }
  kinetic(g, '48 mg', 540, 690, 200, YELLOW, seg(f, E.k48, E.k48 + 8), f, E.k48, -0.03, 700);
  label(g, 'VITAMIN C · PER 100 g', 540, 780, 64, WHITE, seg(f, E.k48 + 6, E.k48 + 14), -0.02, 760);
  stageFront(g, f);
}
// ---------------- E: collagen for skin and blood vessels; and iron absorption
const IRON = Array.from({ length: 6 }, (_, i) => { const q = rng(400 + i); return { x: 780 + q() * 120, y: 880 + q() * 520, r: 20 + q() * 10 }; });
function sceneUses(g, f, jit) {
  bgScene(g, '#4FD8C8', '#0A4B47', f, 14, 540, 1050);
  const part2 = seg(f, E.iron - 12, E.iron);
  // the star flies in and sparks weave the helix
  const sx = lerp(-200, 220, back(seg(f, E.whipDE + 4, E.whipDE + 20))), sy = 900 + Math.sin(f * 0.08) * 14;
  const hv = eo(seg(f, E.helix, E.helix + 40)) * (1 - part2);
  g.save(); g.globalAlpha = 1 - part2; helix(g, 150, 930, 990, 46, hv, f);
  if (hv > 0 && hv < 1) { const hx = lerp(150, 930, hv); sparkSpot(g, hx, 990 + Math.sin(hv * 18 + f * 0.05) * 46, 22, 1, '255,200,120'); }
  skinBlock(g, 730, 1140, 330, 160, seg(f, E.skin, E.skin + 10) * (1 - part2)); vessel(g, 330, 1220, 330, 96, seg(f, E.vessel, E.vessel + 10) * (1 - part2), f);
  if (hv > 0.2) { g.strokeStyle = 'rgba(255,230,210,0.9)'; g.lineWidth = 5; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(730, 1040); g.lineTo(730, lerp(1040, 1140, seg(f, E.skin, E.skin + 10))); g.moveTo(330, 1040); g.lineTo(330, lerp(1040, 1172, seg(f, E.vessel, E.vessel + 10))); g.stroke(); g.setLineDash([]); }
  g.restore();
  // iron: beads drift in; vitamin C sparks escort them into a cell
  if (part2 > 0) { cell(g, 520, 1150, 210, part2, f); IRON.forEach((p, i) => { const t = seg(f, E.iron + i * 3, E.iron + i * 3 + 24); const [x, y] = flight({ x: p.x, y: p.y }, { x: 470 + (i % 3) * 50, y: 1110 + Math.floor(i / 3) * 70 }, eio(t), 160); ironBead(g, x, y, p.r * 1.45, part2 * (1 - seg(t, 0.85, 1) * 0.6)); if (t > 0 && t < 1) sparkSpot(g, x - 26, y - 20, 10, 1, '255,200,120'); }); }
  vitStar(g, sx, sy - 60, 120, Math.sin(f * 0.1) * 0.2, f, { face: true, look: [0.9, 0.2], mood: 0.7 });
  label(g, 'COLLAGEN', 540, 650, 132, WHITE, seg(f, E.collagen, E.collagen + 8) * (1 - seg(f, E.iron - 10, E.iron - 4)), -0.03, 760);
  label(g, '+ IRON', 540, 650, 140, YELLOW, seg(f, E.iron, E.iron + 8), 0.03, 760);
}
// ---------------- F: one cup of chunks: about 80 mg, nearly a full day's vitamin C (ring = a day's vitamin C)
function sceneCup(g, f, jit) {
  bgScene(g, '#7CC8FF', '#173E8C', f, 15, 540, 1050);
  const ring = 0.88 * eo(seg(f, E.ring, E.ring + 40));
  g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 46; g.beginPath(); g.arc(540, 1110, 330, 0, 7); g.stroke();
  if (ring > 0) { g.strokeStyle = '#FFB21F'; g.lineWidth = 46; g.beginPath(); g.arc(540, 1110, 330, -Math.PI / 2, -Math.PI / 2 + 6.283 * ring); g.stroke(); const a = -Math.PI / 2 + 6.283 * ring; vitStar(g, 540 + Math.cos(a) * 330, 1110 + Math.sin(a) * 330, 52, f * 0.08, f, {}); }
  g.strokeStyle = OUTLINE; g.lineWidth = 4; g.beginPath(); g.arc(540, 1110, 356, 0, 7); g.stroke(); g.beginPath(); g.arc(540, 1110, 304, 0, 7); g.stroke(); g.restore();
  const n = 25 * seg(f, E.chunks, E.chunks + 26); measuringCup(g, 540, 1290, 300, 330, n, f, jit);
  for (let i = 0; i < 6; i++) { const t = seg(f, E.chunks + i * 4, E.chunks + i * 4 + 10); if (t <= 0 || t >= 1) continue; chunk(g, 520 + (i % 3) * 20, lerp(560, 1100, t * t), 26, t * 6); }
  kinetic(g, '1 CUP ≈ 80 mg', 540, 650, 124, YELLOW, seg(f, E.k80, E.k80 + 8), f, E.k80, -0.02, 690);
  const pk = back(seg(f, E.peekP, E.peekP + 14)); if (pk > 0) pineapple(g, lerp(-160, 170, pk), 1330, 58, 0.25, f, { peeled: 1, coreOut: 1, face: true, arms: 1, look: [0.8, -0.4], mood: 1, shadow: false, jit });
}
// ---------------- cameras (per scene)
const SPANS = () => [[0, E.dive + 20], [E.dive, E.curtain + 20], [E.curtain, E.whipDE + 12], [E.whipDE, E.whipEF + 12], [E.whipEF, N]];
function camFor(i, f) {
  const [a, b] = SPANS()[i]; const z = 1 + 0.045 * eio(seg(f, a, b));
  const kicks = [E.crown, E.peel, E.core, E.k14, E.k48, E.collagen, E.iron, E.k80].reduce((s, e) => s + 0.02 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  const [sx, sy] = [shake(f, E.crown, 10), shake(f, E.peel, 14), shake(f, E.k48, 12)].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
  return { z: z * (1 + kicks), x: 540 - sx, y: 1010 - sy };
}

// ---------------- paper grain (print texture), CTA seal (white wordmark on colour)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.05)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } }
// ---------------- CTA: the curtains close, the whole cast (the mascot, crown and rind back on) takes a bow; CalMeter seal + white wordmark
function drawCTA(g, f, jit) {
  const c = eio(seg(f, E.cta - 4, E.cta + 14)); if (c <= 0) return;
  velvet(g, -40, 40 + 520 * c, f, 1); velvet(g, W - 40 - 520 * c, W + 40, f, -1);
  if (c >= 1) { g.fillStyle = 'rgba(40,0,10,0.35)'; g.fillRect(538, 0, 4, H); }
  const r = seg(f, E.cta + 10, E.cta + 24); if (r <= 0) return;
  const pop = back(seg(f, E.cta + 8, E.cta + 24)), bow = Math.max(0, Math.sin(Math.PI * seg(f, E.bowC, E.bowC + 26)));
  softGlow(g, 540 + Math.sin(f * 0.06) * 60, 1060 + Math.cos(f * 0.05) * 20, 440, '255,220,140', 0.5 * r); /* a drifting spotlight */
  for (let i = 0; i < 34; i++) { const q = rng(700 + i); const t = f - E.cta - 10 - q() * 20; if (t < 0) continue; const x = 60 + q() * 960 + Math.sin(t * 0.08 + i) * 30, y = 500 + ((t * (5 + q() * 5) + q() * 300) % 1300); /* falling confetti: golden chunks and sparkles, below the caption band */
    if (i % 3) chunk(g, x, y, 12 + q() * 8, t * 0.12 * (q() < 0.5 ? 1 : -1)); else sparkle(g, x, y, 14, 0.9); }
  pineapple(g, 540, lerp(1500, 1040, pop) + Math.sin(f * 0.14) * 10 * (1 - bow), 148, Math.sin(f * 0.1) * 0.05, f, { face: true, arms: (0.65 + 0.35 * Math.sin(f * 0.22)) * (1 - bow * 0.6), bow, look: [Math.sin(f * 0.07) * 0.5, 0.2], blink: Math.max(0, 1 - Math.abs(f - 880) / 4), mood: 1, jit });
  g.font = '900 84px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 60, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1340;
  const sc = 0.5 + 0.5 * back(r); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  g.save(); g.globalAlpha = r; g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = '#FFC94A'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.restore();
  const wr = seg(f, E.cta + 14, E.cta + 34), s = 'CalMeter';
  if (wr > 0) { const sub = s.slice(0, Math.ceil(s.length * wr)); g.save(); g.font = '900 84px NDisplay'; g.textAlign = 'left'; g.lineJoin = 'round'; g.strokeStyle = OUTLINE; g.lineWidth = 13; g.strokeText(sub, cx + R0 + gap, cy + 30); g.restore(); text(g, sub, cx + R0 + gap, cy + 30, '900 84px NDisplay', WHITE, 'left', 0, 'cta'); }
  const sh = seg(f, E.ctaWord, E.ctaWord + 36); if (sh > 0 && sh < 1) { const bx = lerp(cx - R0 - 60, cx + R0 + gap + ww + 60, eio(sh)); g.save(); g.beginPath(); g.moveTo(bx - 30, cy - 90); g.lineTo(bx + 30, cy - 90); g.lineTo(bx - 10, cy + 90); g.lineTo(bx - 70, cy + 90); g.closePath(); g.clip(); text(g, s, cx + R0 + gap, cy + 30, '900 84px NDisplay', YELLOW, 'left', 0, 'cta'); g.restore(); }
  const tk = seg(f, E.cta + 30, E.cta + 80); g.strokeStyle = '#FFC94A'; g.lineWidth = 1.6; for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 10), cy + Math.sin(a) * (R0 + 10)); g.lineTo(cx + Math.cos(a) * (R0 + 18), cy + Math.sin(a) * (R0 + 18)); g.stroke(); }
}
// ---------------- compositor: dive (zoom into the belly), curtain (close + open), whip-pans; then grain, CTA, captions
const SCENES = [sceneTheatre, sceneFibre, sceneStar, sceneUses, sceneCup];
const TRANS = [{ at: E.dive, d: 18, type: 'dive' }, { at: E.curtain, d: 20, type: 'curtain' }, { at: E.whipDE, d: 12, type: 'whip' }, { at: E.whipEF, d: 12, type: 'whip' }];
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
    else if (t.type === 'dive') { /* fly into the belly window: the theatre zooms past, the golden world grows in */
      paintScene(gA, ti, f, jit); paintScene(gB, ti + 1, f, jit); const e = eio(p);
      g.save(); g.translate(540, 1335); const z = 1 + 7 * e * e; g.scale(z, z); g.translate(-540, -1335); g.globalAlpha = 1 - seg(p, 0.3, 0.62); g.drawImage(offA, 0, 0); g.restore();
      g.save(); g.globalAlpha = seg(p, 0.3, 0.62); const s = lerp(0.55, 1, eo(seg(p, 0.3, 1))); g.translate(540, 1010); g.scale(s, s); g.translate(-540, -1010); g.drawImage(offB, 0, 0); g.restore();
      g.globalAlpha = 1; softGlow(g, 540, 1100, 900, '255,250,220', 0.75 * Math.sin(Math.PI * p)); }
    else { /* curtain: velvet closes over the old scene, opens on the new one */
      paintScene(g, p < 0.5 ? ti : ti + 1, f, jit); const c = p < 0.5 ? eio(p * 2) : eio((1 - p) * 2); velvet(g, -40, 40 + 520 * c, f, 1); velvet(g, W - 40 - 520 * c, W + 40, f, -1); }
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.45; g.drawImage(grain, 0, 0); g.restore();
  drawCTA(g, f, rng(5000 + Math.floor(f / 2) * 2));
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f);
}
function drawThumb() {
  /* the thumbnail is the frame-0 composition, full bleed, with the same curiosity words, larger */
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540, 1300); g.scale(1.04, 1.04); g.translate(-540, -1300);
  theatreComposition(g, 26, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.45; g.drawImage(grain, 0, 0); g.restore();
  label(g, 'MORE THAN', 540, 470, 170, YELLOW, 1, -0.04, 800); label(g, 'SWEET', 540, 660, 205, WHITE, 1, -0.04, 800);
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
