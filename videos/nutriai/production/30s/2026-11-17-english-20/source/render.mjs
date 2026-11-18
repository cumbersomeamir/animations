// CalMeter English 30 s english-20 (batch 20; delivered 2026-11-18): pistachios, shell weight vs edible kernels, "HALF IS SHELL?".
// Requested topic, never covered before (peanuts were english-06). Built on the approved full-frame style of english-18/19 (context/25
// addenda: no cream card, full-bleed bright scenes, outlined type, white CTA wordmark) plus the 2026-11-18 live feedback (context/34):
// larger text (84 px captions, 110-200 px numbers), cooler motion graphics (whip-pan scene changes with motion blur and speed lines,
// parallax rays and bokeh for depth, squash-and-stretch landings, impact shakes, a crack burst with flying shell halves, kinetic numbers)
// and a playful original food character (a grinning in-shell pistachio and a kernel with eyes).
// Scenes: violet hook (frame 0 = thumbnail) -> orange crack + split scales (47 g shell / 53 g kernels) -> raspberry kernel breakdown
// (570 kcal, 46 g fat, 21 g protein, 10 g fibre per 100 g) -> teal payoff (100 g in shell = about 300 kcal, not 570) -> indigo handful
// (49 kernels, 28 g, about 160 kcal) -> CalMeter CTA. Original Canvas2D code (no Three.js). Motion is drawn at 30 fps; the engraved
// line boil still steps at 15 drawings/s.
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
// ---------------- pistachio parts. Shell outline: an egg pointed at the split end (+x). Unit length s = half the shell length.
const shellPt = (t) => [Math.cos(t), 0.66 * Math.sin(t) * (0.92 - 0.12 * Math.cos(t))];
const SH_TOP = Array.from({ length: 33 }, (_, k) => shellPt(Math.PI + (k / 32) * Math.PI)); // hinge (-1,0) -> over the top -> tip (1,0)
const SH_BOT = Array.from({ length: 33 }, (_, k) => shellPt((k / 32) * Math.PI)); // tip -> under -> hinge
const kernelPt = (t) => { const x = Math.cos(t); return [x, 0.6 * Math.sin(t) * (0.86 - 0.24 * Math.cos(t)) - 0.07 * (1 - x * x)]; };
const KER = Array.from({ length: 49 }, (_, k) => kernelPt((k / 48) * Math.PI * 2));
function shellFill(g, s, inner = false) {
  const gr = g.createLinearGradient(-s * 0.4, -s * 0.7, s * 0.5, s * 0.7); gr.addColorStop(0, inner ? '#FFF6E2' : '#FAEACB'); gr.addColorStop(0.55, inner ? '#F1DDB4' : '#E8CC96'); gr.addColorStop(1, inner ? '#D8BA84' : '#B98F55'); return gr;
}
function eyes(g, x, y, r, look, blink, mood = 0) {
  /* two cartoon eyes centred at (x, y); look = [dx, dy] in -1..1; blink 0..1 closes the lids; mood > 0 = happy squint */
  for (const ex of [-r * 1.25, r * 1.25]) {
    g.save(); g.translate(x + ex, y); const open = Math.max(0.08, 1 - blink) * (1 - 0.35 * mood);
    g.scale(1, open); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, 0, r, r * 1.18, 0, 0, 7); g.fill(); g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, r * 0.16); g.stroke();
    g.fillStyle = '#1A0E12'; g.beginPath(); g.arc(look[0] * r * 0.38, look[1] * r * 0.42, r * 0.52, 0, 7); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(look[0] * r * 0.38 - r * 0.18, look[1] * r * 0.42 - r * 0.22, r * 0.17, 0, 7); g.fill(); g.restore();
  }
}
function kernel(g, x, y, s, rot, o = {}) {
  /* a pistachio kernel: green, tapered at +x, slight curve, purple-red papery skin patches, engraved form lines; optional face */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  const P = KER.map(([a, b]) => [a * s, b * s]);
  if (o.shadow !== false && s > 30) softShadow(g, s * 0.08, s * 0.5, s * 0.8, s * 0.12, 0.22);
  const gr = g.createLinearGradient(0, -s * 0.6, 0, s * 0.6); gr.addColorStop(0, '#C9EC7E'); gr.addColorStop(0.5, '#86C541'); gr.addColorStop(1, '#4E8F24');
  g.fillStyle = gr; poly(g, P); g.fill();
  g.save(); poly(g, P); g.clip(); const q = rng(o.seed ?? 5);
  for (let i = 0; i < (s > 40 ? 7 : 3); i++) { g.fillStyle = q() < 0.6 ? 'rgba(128,40,86,0.72)' : 'rgba(150,70,60,0.55)'; g.beginPath(); g.ellipse((q() - 0.5) * 1.6 * s, -s * (0.25 + q() * 0.35), s * (0.12 + q() * 0.22), s * (0.07 + q() * 0.1), q() * 3, 0, 7); g.fill(); }
  if (s > 40) { g.strokeStyle = 'rgba(40,80,20,0.45)'; g.lineCap = 'round'; for (let k = 1; k <= 5; k++) { g.lineWidth = Math.max(1, s * 0.012); g.beginPath(); g.ellipse(-s * 0.05, -s * 0.07, s * (1 - k * 0.1), s * 0.6 * (1 - k * 0.12), 0, 0.25, 1.9); g.stroke(); } }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-s * 0.35, -s * 0.3, s * 0.32, s * 0.08, -0.15, 0, 7); g.fill();
  g.restore();
  if (s > 30) burin(g, P, Math.max(1.4, s * 0.022), OUTLINE, 1, o.jit); else { g.strokeStyle = OUTLINE; g.lineWidth = 1.6; poly(g, P); g.stroke(); }
  if (o.face) { eyes(g, -s * 0.22, -s * 0.08, s * 0.13, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0);
    g.strokeStyle = OUTLINE; g.lineWidth = Math.max(2, s * 0.03); g.lineCap = 'round'; g.beginPath(); g.arc(-s * 0.22, s * 0.12, s * (0.1 + 0.05 * (o.mood ?? 0)), 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = 'rgba(255,120,140,0.45)'; g.beginPath(); g.ellipse(-s * 0.58, s * 0.08, s * 0.08, s * 0.05, 0, 0, 7); g.ellipse(s * 0.14, s * 0.08, s * 0.08, s * 0.05, 0, 0, 7); g.fill(); }
  g.restore();
}
function pistachio(g, x, y, s, rot, o = {}) {
  /* an in-shell pistachio. The shell gapes at the pointed end like a grin (o.open 0..1) showing the green kernel; o.face adds eyes */
  g.save(); g.translate(x, y); g.rotate(rot); if (o.sx) g.scale(o.sx, o.sy);
  if (o.shadow !== false) softShadow(g, s * 0.1, s * 0.62, s * 0.85, s * 0.13, 0.28);
  const ang = (o.open ?? 0.5) * 0.42, hx = -s * 0.98;
  const top = SH_TOP.map(([a, b]) => [a * s, b * s]), bot = SH_BOT.map(([a, b]) => [a * s, b * s]);
  const ghost = o.ghost ?? 0; // 0 = solid shell, 1 = only a dashed outline (shell not counted)
  // lower shell half
  g.save(); g.globalAlpha *= 1 - 0.8 * ghost; g.fillStyle = shellFill(g, s); poly(g, bot); g.fill();
  if (s > 40) { g.save(); poly(g, bot); g.clip(); g.strokeStyle = 'rgba(110,70,30,0.42)'; g.lineCap = 'round'; for (let k = 1; k <= 5; k++) { g.lineWidth = Math.max(1, s * 0.011); g.beginPath(); g.ellipse(0, -s * 0.05, s * (1 - k * 0.09), s * 0.64 * (1 - k * 0.11), 0, 0.3, 2.6); g.stroke(); } g.restore(); }
  g.restore();
  // kernel inside, peeking out of the gap
  kernel(g, s * 0.02, -s * 0.05, s * 0.86, 0.02, { shadow: false, seed: o.seed ?? 3, jit: o.jit });
  // upper shell half, rotated open around the hinge
  g.save(); g.translate(hx, 0); g.rotate(-ang); g.translate(-hx, 0);
  g.save(); g.globalAlpha *= 1 - 0.8 * ghost; g.fillStyle = shellFill(g, s); poly(g, top); g.fill();
  g.save(); poly(g, top); g.clip(); g.fillStyle = 'rgba(232,120,130,0.30)'; g.beginPath(); g.ellipse(-s * 0.85, -s * 0.05, s * 0.4, s * 0.5, 0, 0, 7); g.fill();
  if (s > 40) { g.strokeStyle = 'rgba(110,70,30,0.35)'; g.lineCap = 'round'; for (let k = 1; k <= 4; k++) { g.lineWidth = Math.max(1, s * 0.01); g.beginPath(); g.ellipse(0, s * 0.05, s * (1 - k * 0.1), s * 0.64 * (1 - k * 0.12), 0, 3.6, 5.6); g.stroke(); } }
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.42, s * 0.36, s * 0.08, -0.1, 0, 7); g.fill(); g.restore();
  // shell rim (thickness) along the opening
  g.fillStyle = '#F7E9CD'; g.beginPath(); g.moveTo(-s * 0.2, 0); g.lineTo(s * 1.0, 0); g.lineTo(s * 0.98, -s * 0.05); g.lineTo(-s * 0.2, -s * 0.04); g.closePath(); g.fill();
  g.restore();
  if (ghost > 0) { g.setLineDash([s * 0.12, s * 0.09]); g.strokeStyle = `rgba(255,255,255,${0.9 * ghost})`; g.lineWidth = Math.max(2, s * 0.035); poly(g, top); g.stroke(); g.setLineDash([]); }
  else if (s > 30) burin(g, top, Math.max(1.4, s * 0.026), OUTLINE, 1, o.jit); else { g.strokeStyle = OUTLINE; g.lineWidth = 1.8; poly(g, top, false); g.stroke(); }
  if (o.face) { eyes(g, -s * 0.28, -s * 0.36, s * 0.15, o.look ?? [0, 0], o.blink ?? 0, o.mood ?? 0); g.fillStyle = 'rgba(255,110,130,0.5)'; g.beginPath(); g.ellipse(-s * 0.72, -s * 0.12, s * 0.09, s * 0.055, 0, 0, 7); g.ellipse(s * 0.16, -s * 0.16, s * 0.09, s * 0.055, 0, 0, 7); g.fill(); }
  g.restore();
  /* lower-shell outline, drawn in the shell's own transform (still active here) */
  if (ghost > 0) { g.setLineDash([s * 0.12, s * 0.09]); g.strokeStyle = `rgba(255,255,255,${0.9 * ghost})`; g.lineWidth = Math.max(2, s * 0.035); poly(g, bot); g.stroke(); g.setLineDash([]); }
  else if (s > 30) burin(g, bot, Math.max(1.4, s * 0.026), OUTLINE, 1, o.jit);
  else { g.strokeStyle = OUTLINE; g.lineWidth = 1.8; poly(g, bot, false); g.stroke(); }
  g.restore();
}
function shellHalf(g, x, y, s, rot) {
  /* one empty shell half (a cup): outer shell + pale inside */
  g.save(); g.translate(x, y); g.rotate(rot);
  const bot = SH_BOT.map(([a, b]) => [a * s, b * s]); g.fillStyle = shellFill(g, s); poly(g, bot); g.fill();
  g.fillStyle = '#FBF1DA'; g.beginPath(); g.ellipse(0, s * 0.04, s * 0.84, s * 0.13, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(110,70,30,0.5)'; g.lineWidth = Math.max(1, s * 0.03); g.beginPath(); g.ellipse(0, s * 0.02, s * 0.8, s * 0.42, 0, 0.4, 2.7); g.stroke();
  g.fillStyle = 'rgba(232,120,130,0.28)'; g.beginPath(); g.ellipse(-s * 0.8, s * 0.18, s * 0.25, s * 0.25, 0, 0, 7); g.fill();
  g.strokeStyle = OUTLINE; g.lineWidth = Math.max(1.6, s * 0.05); poly(g, bot); g.stroke(); g.restore();
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
const PILE_B = pileSpots(11, 22, 540, 1214, 440, 34, 46);   // in-shell pile on the crack scale
const PILE_D = pileSpots(17, 22, 540, 1196, 440, 34, 46);   // in-shell pile on the payoff scale
const HALVES = pileSpots(23, 44, 300, 1238, 340, 20, 30);   // shell halves on the left scale
const KERNS = pileSpots(29, 22, 780, 1236, 320, 26, 38);    // kernels on the right scale
const BOWL49 = pileSpots(31, 49, 540, 1172, 330, 15, 24);   // 49 kernels in the bowl

// ---------------- A: hook (frame 0 = thumbnail): a grinning in-shell pistachio, pistachios tumbling around it, "HALF IS SHELL?"
const FALL = Array.from({ length: 12 }, (_, i) => { const q = rng(100 + i); return { x: 60 + q() * 960, y0: q() * 2200, sp: 1.6 + q() * 2.6, s: 26 + q() * 40, r0: q() * 6, vr: (q() - 0.5) * 0.08, d: q() }; });
function hookComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 22 : f, bob = Math.sin(ph * 0.08) * 10;
  bgScene(g, '#B45CEB', '#2B0A4A', ph, 1, 540, 1150);
  softGlow(g, 560, 1260, 620, '255,226,150', 0.42);
  for (const p of FALL) { if (p.d > 0.5) continue; const y = ((p.y0 + ph * p.sp) % 2200) - 140; g.save(); g.globalAlpha = 0.55; pistachio(g, p.x, y, p.s * 0.8, p.r0 + ph * p.vr, { open: 0.4, shadow: false, seed: p.x | 0 }); g.restore(); }
  // a heap at the bottom (depth: big, close to the lens)
  const heap = [[150, 1640, 92, -0.4], [330, 1700, 104, 0.3], [900, 1630, 96, 2.8], [740, 1720, 110, 2.6], [520, 1760, 100, 0.1], [70, 1800, 110, 0.6], [1020, 1790, 100, 3.3]];
  for (const [x, y, s, r] of heap) pistachio(g, x, y, s, r, { open: 0.45, seed: x | 0, jit });
  const blink = Math.max(0, 1 - Math.abs(ph - 46) / 3) + Math.max(0, 1 - Math.abs(ph - 82) / 3);
  const look = ph < 30 ? [-0.5, -0.9] : ph < 60 ? [0.2, -0.6] : [0.6, 0.2];
  pistachio(g, 560, 1250 + bob, 300, -0.12, { open: 0.7 + 0.12 * Math.sin(ph * 0.12), face: true, look, blink: clamp(blink), seed: 9, jit });
  for (let i = 0; i < 6; i++) { const q = rng(i * 7 + 4); sparkle(g, 330 + q() * 480, 930 + q() * 460, 14 + q() * 12, Math.abs(Math.sin(ph * 0.11 + i * 1.4))); }
  for (const p of FALL) { if (p.d <= 0.5) continue; const y = ((p.y0 + ph * p.sp * 1.4) % 2200) - 140; pistachio(g, p.x, y, p.s * 1.1, p.r0 + ph * p.vr, { open: 0.5, seed: p.x | 0, jit }); }
  if (words > 0) { label(g, 'HALF IS', 540, 668, 176, YELLOW, words, -0.04); label(g, 'SHELL?', 540, 840, 176, WHITE, words, -0.04); }
}
function sceneHook(g, f, jit) { const out = seg(f, 40, 50); hookComposition(g, f, jit, 1 - out); }
// ---------------- B: crack open 100 g; shells fly to one scale (47 g), kernels to another (53 g)
const flight = (from, to, t, lift) => { const x = lerp(from.x, to.x, t), y = lerp(from.y, to.y, t) - lift * Math.sin(Math.PI * t); return [x, y]; };
function sceneCrack(g, f, jit) {
  bgScene(g, '#FFB04A', '#B33A0C', f, 2, 540, 1050);
  const cr = E.crack, aft = f - cr;
  // the single scale before the crack, sinking away after it
  const sink = eio(seg(f, cr + 7, cr + 14));
  if (sink < 1) { g.save(); g.translate(0, 700 * sink); g.globalAlpha = 1 - sink;
    const grams = f < E.pourIn ? 0 : 100 * eo(seg(f, E.pourIn + 4, E.g100 + 6));
    drawScale(g, 540, 1240, 560, grams, jit, seg(f, E.g100 + 4, E.g100 + 8) * (1 - seg(f, E.g100 + 24, E.g100 + 30)), sink > 0.02);
    g.restore(); }
  // two scales rise after the crack
  const rise = back(seg(f, cr + 9, cr + 22));
  if (f >= cr + 9) {
    const lg = f < E.shellsLand ? null : 47 * eo(seg(f, E.shellsLand, E.g47 + 2));
    const rg = f < E.g53 - 4 ? null : 53 * eo(seg(f, E.g53 - 4, E.g53 + 8));
    g.save(); g.translate(0, 600 * (1 - rise)); drawScale(g, 300, 1260, 400, lg, jit, seg(f, E.g47, E.g47 + 4) * (1 - seg(f, E.g47 + 24, E.g47 + 30)), lg == null);
    drawScale(g, 780, 1260, 400, rg, jit, seg(f, E.g53 + 6, E.g53 + 10) * (1 - seg(f, E.g53 + 30, E.g53 + 36)), rg == null); g.restore();
  }
  // nuts: pour in, tremble, crack
  const tr = f >= E.tremble && f < cr ? seg(f, E.tremble, cr) : 0;
  PILE_B.forEach((p, i) => {
    const t0 = E.pourIn + i * 0.9, t = seg(f, t0, t0 + 14);
    if (f < cr) { if (t <= 0) return; const y = lerp(p.y - 900, p.y, bounce(t)); const [sx, sy] = squash(t); const jx = tr > 0 ? Math.sin(f * 2.7 + i) * 5 * tr : 0, jy = tr > 0 ? Math.cos(f * 3.1 + i * 2) * 4 * tr : 0;
      pistachio(g, p.x + jx, y + jy, 44, p.rot, { open: 0.35 + 0.4 * tr, seed: i, sx, sy, jit }); return; }
    // after the crack: two halves fly to the left scale, the kernel hops to the right scale
    const d = Math.max(0, aft - i * 0.35), tf = clamp(d / 24);
    for (const side of [0, 1]) { const tgt = HALVES[(i * 2 + side) % HALVES.length]; const [x, y] = flight({ x: p.x, y: p.y }, tgt, eio(tf), 380 + side * 60); const rot = p.rot + (side ? 1 : -1) * tf * 9 + (side ? Math.PI : 0) * (1 - tf); shellHalf(g, x, y, 32 + (1 - tf) * 12, tf >= 1 ? tgt.rot : rot); }
    const tk = clamp((d - 4) / 26), tg = KERNS[i % KERNS.length]; const [kx, ky] = flight({ x: p.x, y: p.y }, tg, eio(tk), 300); kernel(g, kx, ky, 36 + (1 - tk) * 4, tk >= 1 ? tg.rot : p.rot + tk * 6, { seed: i, shadow: false });
  });
  burstFX(g, 540, 1150, seg(f, cr, cr + 18), 120, 520, 22);
  ringPulse(g, 540, 1150, seg(f, cr, cr + 16), 80, 640);
  label(g, 'SHELL', 308, 900, 104, WHITE, seg(f, E.shellWord - 6, E.shellWord + 6), -0.04);
  label(g, 'KERNELS', 762, 900, 96, YELLOW, seg(f, E.kernWord - 4, E.kernWord + 8), 0.03, 350);
}
// ---------------- C: per 100 g of kernels: 570 kcal, 46 g fat, 21 g protein, 10 g fibre
function sceneBreak(g, f, jit) {
  bgScene(g, '#FF6A98', '#7A0C3A', f, 3, 540, 1040);
  const kx = 540, ky = 1010, ks = 250;
  softGlow(g, kx, ky, 520, '255,240,170', 0.35 + 0.25 * seg(f, E.k570, E.k570 + 8) * (1 - seg(f, E.fat - 4, E.fat + 10)));
  // energy (kcal): sparks orbiting
  const ek = seg(f, E.k570, E.k570 + 10);
  if (ek > 0) for (let i = 0; i < 10; i++) { const a = f * 0.05 + (i / 10) * 6.283; const rr = 330 + 20 * Math.sin(f * 0.2 + i); sparkle(g, kx + Math.cos(a) * rr, ky + Math.sin(a) * rr * 0.62, 16, ek * (0.5 + 0.5 * Math.sin(f * 0.3 + i))); }
  burstFX(g, kx, ky, seg(f, E.k570, E.k570 + 16), 200, 520);
  // fat: oil drops ooze from the kernel into a golden pool
  const ft = seg(f, E.fat - 2, E.fat + 36);
  if (ft > 0) { const pool = eo(seg(f, E.fat + 6, E.fat + 40)); g.fillStyle = '#FFC93A'; g.strokeStyle = OUTLINE; g.lineWidth = 3; g.beginPath(); g.ellipse(kx + 10, ky + 210, 220 * pool + 2, 34 * pool + 1, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(kx - 60, ky + 200, 70 * pool, 8 * pool, 0, 0, 7); g.fill();
    for (let i = 0; i < 6; i++) { const t = ((f - E.fat - i * 7) / 22); if (t < 0 || t > 1) continue; oilDrop(g, kx - 150 + i * 60, lerp(ky + 90, ky + 200, t * t), 18, 1 - seg(t, 0.85, 1)); } }
  // protein: cubes pop out and stack to the left
  const pt = f - E.protein;
  if (pt > -2) for (let i = 0; i < 6; i++) { const t = seg(pt, i * 2.5, i * 2.5 + 10); if (t <= 0) continue; const col = i % 2, row = Math.floor(i / 2); const tx = 150 + col * 74, ty = 1300 - row * 72; const [x, y] = flight({ x: kx - 120, y: ky }, { x: tx, y: ty }, eio(t), 160); cube(g, x, y, 58, 1); }
  // fibre: green strands curl out to the right
  const fb = f - E.fibre;
  if (fb > -2) for (let i = 0; i < 4; i++) strand(g, kx + 170, ky - 40 + i * 34, 210, -0.5 + i * 0.32, f, eo(seg(fb, i * 2, i * 2 + 18)), 50 + i);
  // the kernel character
  const blink = Math.max(0, 1 - Math.abs(f - 320) / 3) + Math.max(0, 1 - Math.abs(f - 470) / 3);
  const wow = seg(f, E.k570, E.k570 + 4) * (1 - seg(f, E.k570 + 30, E.k570 + 40));
  const look = f < E.fat ? [0, -0.8] : f < E.protein ? [-0.3, 0.9] : f < E.fibre ? [-0.9, 0.4] : [0.9, 0];
  const pop = 1 + 0.07 * Math.sin(Math.PI * seg(f, E.k570, E.k570 + 8)) + 0.04 * Math.sin(Math.PI * seg(f, E.fat, E.fat + 8)) + 0.04 * Math.sin(Math.PI * seg(f, E.protein, E.protein + 8)) + 0.04 * Math.sin(Math.PI * seg(f, E.fibre, E.fibre + 8));
  const enter = back(seg(f, E.whipBC + 4, E.whipBC + 20));
  g.save(); g.translate(kx, ky + Math.sin(f * 0.09) * 8); g.scale(pop * (0.4 + 0.6 * enter), pop * (0.4 + 0.6 * enter)); kernel(g, 0, 0, ks, -0.08 + Math.sin(f * 0.05) * 0.04, { face: true, look, blink: clamp(blink) * (1 - wow), mood: f > E.protein ? 0.6 : 0, seed: 77, jit }); g.restore();
  if (wow > 0) { g.save(); g.globalAlpha = wow; g.strokeStyle = WHITE; g.lineWidth = 6; g.lineCap = 'round'; for (const [a, b] of [[-2.4, -2.0], [-1.7, -1.4], [-0.9, -0.6]]) { g.beginPath(); g.moveTo(kx + Math.cos(a) * 290, ky + Math.sin(a) * 230); g.lineTo(kx + Math.cos(b) * 330, ky + Math.sin(b) * 270); g.stroke(); } g.restore(); }
  // title + one big number at a time
  label(g, '100 g KERNELS', 540, 664, 104, WHITE, seg(f, E.title, E.title + 10), -0.02, 840);
  label(g, 'ROASTED · NO SALT', 540, 740, 50, YELLOW, seg(f, E.title + 8, E.title + 18), -0.02);
  const nums = [['≈ 570 kcal', E.k570, E.fat, YELLOW], ['46 g FAT', E.fat, E.protein, '#FFE07A'], ['21 g PROTEIN', E.protein, E.fibre, WHITE], ['10 g FIBRE', E.fibre, E.whipCD + 20, '#C9F27A']];
  for (const [s, a0, a1, col] of nums) { const a = seg(f, a0, a0 + 8), out = seg(f, a1 - 2, a1 + 5); if (a <= 0 || out >= 1) continue; g.save(); g.translate(0, -60 * eo(out)); g.globalAlpha = 1 - out; kinetic(g, s, 540, 1418, 136, col, a, f, a0, -0.02, 740); g.restore(); }
}
// ---------------- D: so 100 g in the shell is about 300 kcal, not 570
function scenePayoff(g, f, jit) {
  bgScene(g, '#3FD9C8', '#0A4B47', f, 4, 540, 1060);
  const land = seg(f, E.whipCD + 2, E.inShell + 4);
  drawScale(g, 540, 1250, 560, 100 * eo(seg(f, E.inShell - 2, E.inShell + 10)), jit, seg(f, E.inShell + 8, E.inShell + 12) * (1 - seg(f, E.inShell + 30, E.inShell + 36)));
  const gh = eo(seg(f, E.ghost, E.ghost + 16));
  PILE_D.forEach((p, i) => { const t = seg(f, E.whipCD + i * 0.7, E.whipCD + i * 0.7 + 14); if (t <= 0) return; const y = lerp(p.y - 800, p.y + 30, bounce(t)); const [sx, sy] = squash(t);
    pistachio(g, p.x, y, 46, p.rot, { open: 0.4, seed: i, sx, sy, ghost: gh, jit }); if (gh > 0) softGlow(g, p.x, y - 4, 40, '210,255,140', 0.35 * gh); });
  label(g, '100 g IN SHELL', 540, 660, 100, WHITE, seg(f, E.inShell, E.inShell + 10) * (1 - seg(f, E.k300 - 6, E.k300)), -0.02, 840);
  kinetic(g, '≈ 300 kcal', 540, 850, 160, YELLOW, seg(f, E.k300, E.k300 + 8), f, E.k300, -0.02);
  burstFX(g, 540, 800, seg(f, E.k300, E.k300 + 14), 160, 420);
  const n = seg(f, E.not570, E.not570 + 8);
  if (n > 0) { label(g, 'NOT 570', 540, 1010, 116, WHITE, n, 0.02); const t = seg(f, E.slash, E.slash + 6); slashLine(g, 520, 1010, 790, 930, t); }
}
// ---------------- E: a handful of 49 kernels: 28 g, about 160 kcal; then the CTA
function sceneHand(g, f, jit) {
  bgScene(g, '#6C8DFF', '#1A1F6E', f, 5, 540, 1050);
  const mv = eio(seg(f, E.cta - 8, E.cta + 10)); // make room for the CTA: the bowl group lifts and shrinks a little
  g.save(); g.translate(540, 1150); g.scale(1 - 0.16 * mv, 1 - 0.16 * mv); g.translate(-540, -1150 - 70 * mv);
  const cnt = Math.min(49, Math.floor(49 * seg(f, E.drops + 6, E.count49 + 26)));
  drawScale(g, 540, 1250, 460, f < E.g28 ? null : 28, jit, seg(f, E.g28, E.g28 + 4) * (1 - seg(f, E.g28 + 24, E.g28 + 30)), f < E.g28);
  bowlBack(g, 540, 1160, 400);
  BOWL49.forEach((p, i) => { const t0 = E.drops + 6 + (i / 49) * 40, t = seg(f, t0, t0 + 10); if (t <= 0) return; const y = lerp(p.y - 700, p.y, bounce(t)); kernel(g, p.x, y, 22, p.rot, { seed: i, shadow: false }); });
  bowlFront(g, 540, 1160, 400, jit);
  // the hero pistachio peeks in from the right and winks at the end
  const pk = back(seg(f, E.peek, E.peek + 14)); if (pk > 0) { const wink = Math.max(0, 1 - Math.abs(f - 868) / 5); pistachio(g, lerp(1220, 905, pk), 1190, 112, -0.38, { open: 1, face: true, look: [-0.8, 0.1], blink: wink, seed: 9, jit }); }
  g.restore();
  const la = 1 - seg(f, E.cta - 10, E.cta);
  label(g, `${cnt}`, 540, 760, 190, YELLOW, seg(f, E.drops + 6, E.drops + 12) * la, -0.03);
  label(g, 'KERNELS', 540, 860, 80, WHITE, seg(f, E.count49, E.count49 + 8) * la, -0.03);
  if (f >= E.count49 + 26 && f < E.count49 + 40) ringPulse(g, 540, 700, seg(f, E.count49 + 26, E.count49 + 40), 60, 260);
  kinetic(g, '≈ 160 kcal', 540, 1000, 128, WHITE, seg(f, E.k160, E.k160 + 8) * la, f, E.k160, 0.02);
}
// ---------------- cameras (per scene): slow push-in + kicks on number pops + impact shakes
function camFor(i, f) {
  const spans = [[0, E.whipAB + 12], [E.whipAB, E.whipBC + 12], [E.whipBC, E.whipCD + 12], [E.whipCD, E.whipDE + 12], [E.whipDE, N]];
  const [a, b] = spans[i]; const z = 1 + 0.045 * eio(seg(f, a, b));
  const kicks = [E.g100, E.g47, E.g53, E.k570, E.fat, E.protein, E.fibre, E.k300, E.not570, E.k160].reduce((s, e) => s + 0.02 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  const [sx, sy] = [shake(f, E.crack, 26), shake(f, E.slash, 16), shake(f, E.inShell, 8)].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
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
const SCENES = [sceneHook, sceneCrack, sceneBreak, scenePayoff, sceneHand];
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
  hookComposition(g, 22, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5; g.drawImage(grain, 0, 0); g.restore();
  label(g, 'HALF IS', 540, 560, 210, YELLOW, 1, -0.04); label(g, 'SHELL?', 540, 770, 210, WHITE, 1, -0.04);
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
