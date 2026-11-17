// CalMeter English 30 s english-19 (2026-11-17, batch 19): what's really inside a kiwi, "WHAT'S INSIDE?".
// The requested "What is inside a guava?" was already production #02 (guava per 100 g: 68 kcal, 5.4 g fibre, 228 mg vitamin C), so a
// genuinely different same-genre fruit breakdown was chosen: the green kiwi (never covered). Same full-frame bright style as english-18
// (context/25 addendum 2026-11-15: no cream card, no boxed diagrams): five full-bleed scenes (raspberry, sky, violet, orange, teal),
// one big engraved hero each with a real transformation (a fuzzy kiwi beside a cut half, slices dropping onto a scale, vitamin C tubes
// filling beside a kiwi and an orange slice, a peeled kiwi landing on a scale, a daily-value ring filling around a turning slice), one
// nutrient reveal at a time, large outlined type, white outlined captions, white CTA wordmark. Frame 0 is the thumbnail composition.
// Original Canvas2D code (no Three.js). Stop motion 15 drawings/s.
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
function captions3(g, f) {
  /* captions on full-frame colour: white Inter Display Black with a dark outline, second line bright yellow; 64 px auto-fit in x 100-900 */
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out);
    c.lines.forEach(([s, f0], li) => { const a = seg(f, f0, f0 + 5) * (1 - out); if (a <= 0) return; let px = 64; g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > 740 && px > 44) { px -= 2; g.font = `900 ${px}px NDisplay`; }
      const y = (li === 0 ? 404 : 474) + 10 * (1 - eo(seg(f, f0, f0 + 6))); g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(25,6,24,0.92)'; g.lineWidth = 11; g.strokeText(s, 500, y); text(g, s, 500, y, `900 ${px}px NDisplay`, li === 0 ? WHITE : YELLOW, 'center', 0, 'caption'); g.restore(); });
  }
}
// ---------------- kiwi: fuzzy whole fruit, sunburst cross-section, slices, peeled fruit; orange slice; vitamin C tubes; daily-value ring
const KG = '#7CC242', KG_D = '#3F8A1E', KG_L = '#C8EE7A', SKIN = '#8A6236', SKIN_D = '#4E3418', ORANGE = '#FF9A1F', VITC = '#FFB22E';
function kiwiWhole(g, cx, cy, rx, ry, rot, f, jit) {
  /* a fuzzy brown kiwi: egg-shaped, fine hair strokes, a soft sheen */
  g.save(); g.translate(cx, cy); g.rotate(rot); softShadow(g, 14, ry * 1.02, rx * 0.95, ry * 0.18, 0.3);
  const gr = g.createRadialGradient(-rx * 0.35, -ry * 0.4, rx * 0.1, 0, 0, rx * 1.15); gr.addColorStop(0, '#B88A55'); gr.addColorStop(0.55, SKIN); gr.addColorStop(1, SKIN_D); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.clip(); const q = rng(Math.round(rx)); g.lineCap = 'round';
  for (let i = 0; i < 520; i++) { const a = q() * 6.283, rr = Math.sqrt(q()); const x = Math.cos(a) * rr * rx, y = Math.sin(a) * rr * ry; const l = 5 + q() * 7, an = a + (q() - 0.5) * 0.8; g.strokeStyle = q() < 0.5 ? 'rgba(60,38,16,0.55)' : 'rgba(205,170,120,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); }
  g.restore();
  g.fillStyle = 'rgba(255,240,210,0.28)'; g.beginPath(); g.ellipse(-rx * 0.35, -ry * 0.42, rx * 0.32, ry * 0.14, -0.5, 0, 7); g.fill();
  g.fillStyle = SKIN_D; g.beginPath(); g.ellipse(rx * 0.97, 0, 7, 10, 0, 0, 7); g.fill();
  burin(g, ell(0, 0, rx, ry, 0, 6.283, 64), 3, OUTLINE, 1, jit); g.restore();
}
const SEEDS_K = (() => { const q = rng(19), s = []; for (let i = 0; i < 64; i++) { const a = (i / 64) * 6.283 + (q() - 0.5) * 0.05; s.push([a, 0.36 + q() * 0.1, 0.8 + q() * 0.4]); } return s; })();
function kiwiFace(g, r, f, jit, skin = true) {
  /* the cut face of a kiwi at the origin, radius r: brown skin ring, green flesh with light rays, a ring of black seeds, cream starburst core */
  if (skin) { g.fillStyle = SKIN_D; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); }
  const fr = skin ? r * 0.94 : r; const fg = g.createRadialGradient(0, 0, fr * 0.2, 0, 0, fr); fg.addColorStop(0, '#D9F59A'); fg.addColorStop(0.45, '#8ED14B'); fg.addColorStop(1, '#5DAA2A'); g.fillStyle = fg; g.beginPath(); g.arc(0, 0, fr, 0, 7); g.fill();
  g.strokeStyle = 'rgba(235,255,200,0.55)'; g.lineWidth = Math.max(1.2, r * 0.012); g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < 48; i++) { const a = (i / 48) * 6.283; g.moveTo(Math.cos(a) * fr * 0.3, Math.sin(a) * fr * 0.3); g.lineTo(Math.cos(a) * fr * 0.9, Math.sin(a) * fr * 0.9); } g.stroke();
  for (const [a, rr, s] of SEEDS_K) { g.save(); g.translate(Math.cos(a) * fr * rr, Math.sin(a) * fr * rr); g.rotate(a); g.fillStyle = '#16100C'; g.beginPath(); g.ellipse(0, 0, fr * 0.034 * s, fr * 0.017 * s, 0, 0, 7); g.fill(); g.restore(); }
  const cg = g.createRadialGradient(0, 0, 2, 0, 0, fr * 0.26); cg.addColorStop(0, '#FFFBE6'); cg.addColorStop(1, '#E9F5C2'); g.fillStyle = cg; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = (i / 24) * 6.283, k = i % 2 ? 0.2 : 0.27; g.lineTo(Math.cos(a) * fr * k, Math.sin(a) * fr * k); } g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(-fr * 0.4, -fr * 0.45, fr * 0.28, fr * 0.1, -0.6, 0, 7); g.fill();
  burin(g, ell(0, 0, r, r, 0, 6.283, 64), 3, OUTLINE, 1, jit);
}
function kiwiHalf(g, cx, cy, r, rot, f, jit, tilt = 0.9) {
  /* a kiwi cut in half, cut face toward the viewer with the fuzzy back showing below */
  g.save(); g.translate(cx, cy); g.rotate(rot); softShadow(g, 16, r * 1.1, r * 0.95, r * 0.17, 0.3);
  g.save(); g.scale(1, tilt); const bk = g.createRadialGradient(-r * 0.2, r * 0.3, r * 0.2, 0, r * 0.15, r * 1.15); bk.addColorStop(0, '#A87B48'); bk.addColorStop(1, SKIN_D); g.fillStyle = bk; g.beginPath(); g.ellipse(0, r * 0.16, r * 1.01, r * 1.0, 0, 0, 7); g.fill();
  const q = rng(Math.round(r * 5)); g.strokeStyle = 'rgba(60,38,16,0.5)'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < 90; i++) { const a = Math.PI * (0.05 + 0.9 * q()), rr = r * (0.9 + 0.12 * q()); const x = Math.cos(a) * rr, y = r * 0.16 + Math.sin(a) * rr * 0.98; g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 10, y + 4 + q() * 6); } g.stroke();
  kiwiFace(g, r, f, jit, true); g.restore(); g.restore();
}
function kiwiSlice(g, cx, cy, r, rot, f, jit) { g.save(); g.translate(cx, cy); g.rotate(rot); softShadow(g, 8, r * 0.2, r * 0.95, r * 0.25, 0.22); g.fillStyle = '#4C9A22'; g.beginPath(); g.arc(4, 8, r, 0, 7); g.fill(); kiwiFace(g, r, f, jit, true); g.restore(); }
function kiwiPeeled(g, cx, cy, rx, ry, rot, f, jit) {
  /* a whole peeled kiwi lying on its side: glossy green, faint rays, one cut end showing the starburst */
  g.save(); g.translate(cx, cy); g.rotate(rot); softShadow(g, 12, ry * 1.0, rx * 0.95, ry * 0.2, 0.3);
  const gr = g.createLinearGradient(0, -ry, 0, ry); gr.addColorStop(0, '#B8E86A'); gr.addColorStop(0.5, '#7CC242'); gr.addColorStop(1, '#4E9A22'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(230,255,190,0.45)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(-rx * 0.1, 0, rx * (0.2 + k * 0.12), ry * (0.25 + k * 0.12), 0, -1.2, 1.2); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-rx * 0.3, -ry * 0.5, rx * 0.35, ry * 0.12, -0.15, 0, 7); g.fill();
  g.save(); g.translate(rx * 0.86, 0); g.scale(0.32, 1); kiwiFace(g, ry * 0.92, f, jit, false); g.restore();
  burin(g, ell(0, 0, rx, ry, 0, 6.283, 64), 3, OUTLINE, 1, jit); g.restore();
}
function orangeSlice(g, cx, cy, r, rot, jit) {
  /* a round orange slice: peel, pith, ten juicy segments */
  g.save(); g.translate(cx, cy); g.rotate(rot); softShadow(g, 8, r * 0.2, r * 0.95, r * 0.25, 0.22);
  g.fillStyle = '#F07A0C'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.fillStyle = '#FFF2D6'; g.beginPath(); g.arc(0, 0, r * 0.9, 0, 7); g.fill();
  for (let i = 0; i < 10; i++) { const a0 = (i / 10) * 6.283 + 0.04, a1 = ((i + 1) / 10) * 6.283 - 0.04; const sg = g.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 0.85); sg.addColorStop(0, '#FFC04A'); sg.addColorStop(1, '#FF8A12'); g.fillStyle = sg; g.beginPath(); g.moveTo(Math.cos((a0 + a1) / 2) * r * 0.08, Math.sin((a0 + a1) / 2) * r * 0.08); g.arc(0, 0, r * 0.84, a0, a1); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,240,200,0.6)'; g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k < 5; k++) { const a = lerp(a0, a1, (k + 0.5) / 5); g.moveTo(Math.cos(a) * r * 0.25, Math.sin(a) * r * 0.25); g.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); } g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.45, r * 0.26, r * 0.09, -0.6, 0, 7); g.fill();
  burin(g, ell(0, 0, r, r, 0, 6.283, 64), 3, OUTLINE, 1, jit); g.restore();
}
function vitTube(g, cx, base, w, h, level, f, jit) {
  /* a tall glass tube filling with golden vitamin C "juice" (level 0..1 of full height) and rising bubbles */
  const x0 = cx - w / 2, top = base - h; softShadow(g, cx + 8, base + 10, w * 0.7, 14, 0.25);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x0, top, w, h);
  if (level > 0) { const ly = base - h * level; const lg = g.createLinearGradient(x0, 0, x0 + w, 0); lg.addColorStop(0, '#FF9A1F'); lg.addColorStop(0.45, '#FFD45A'); lg.addColorStop(1, '#F08410'); g.fillStyle = lg; g.fillRect(x0 + 5, ly, w - 10, base - ly - 5); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x0 + 5, ly, w - 10, 6);
    const q = rng(Math.round(cx)); for (let i = 0; i < 8; i++) { const t = ((f * 0.02 + q()) % 1); const by = lerp(base - 12, ly + 10, t); if (by < ly + 6) continue; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; g.beginPath(); g.arc(x0 + 14 + q() * (w - 28), by, 4 + q() * 4, 0, 7); g.stroke(); } }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x0 + 12, top + 12, 10, h - 30);
  burin(g, [[x0, top], [x0, base], [x0 + w, base], [x0 + w, top]], 3, OUTLINE, 1, jit); g.strokeStyle = OUTLINE; g.lineWidth = 2.4; g.beginPath(); g.ellipse(cx, top, w / 2, 9, 0, 0, 7); g.stroke();
}
function dvRing(g, cx, cy, r, frac, jit) {
  /* a daily-value ring: the yellow arc fills to frac */
  g.save(); softShadow(g, cx + 10, cy + r + 30, r * 0.9, 18, 0.25); g.lineCap = 'round';
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = r * 0.22; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  if (frac > 0) { g.strokeStyle = YELLOW; g.lineWidth = r * 0.22; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * frac); g.stroke(); }
  g.strokeStyle = OUTLINE; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r + r * 0.11, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, r - r * 0.11, 0, 7); g.stroke(); g.restore();
}
// ---------------- A: frame 0 = the thumbnail: a fuzzy whole kiwi beside a cut half bursting green, "WHAT'S INSIDE?"
function hookComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 20 : f, bob = Math.sin(ph * 0.05) * 6;
  bg(g, '#FF6F9A', '#6A0F38', 540, 1150); softGlow(g, 600, 1170, 560, '255,240,150', 0.4);
  kiwiWhole(g, 300, 1250 - bob, 205, 160, -0.35, ph, jit);
  kiwiHalf(g, 690, 1150 + bob, 285, 0.12, ph, jit, 0.92);
  for (let i = 0; i < 5; i++) { const q = rng(i * 7 + 4); sparkle(g, 470 + q() * 420, 930 + q() * 420, 12 + q() * 10, Math.abs(Math.sin(ph * 0.11 + i * 1.4))); }
  if (words > 0) { label(g, "WHAT'S", 540, 690, 150, YELLOW, words, -0.03); label(g, 'INSIDE?', 540, 838, 150, WHITE, words, -0.03); }
}
function sceneHook(g, f, jit) { hookComposition(g, f, jit, 1 - seg(f, E.hookOut - 4, E.hookOut + 6)); }
// ---------------- B: 100 g of the green flesh: 61 kcal and 3 g fibre
function scene100(g, f, jit) {
  bg(g, '#62CFF5', '#174E8C', 540, 1050);
  const v = Math.round(100 * eo(seg(f, E.slices, E.slices + 40)));
  drawScale(g, 540, 1240, 520, f < E.slices ? null : v, jit, seg(f, E.slices + 38, E.slices + 44) * (1 - seg(f, E.slices + 60, E.slices + 70)));
  const SL = [[400, 1176, -0.2], [540, 1166, 0.1], [680, 1176, 0.3], [470, 1120, 0.5], [610, 1118, -0.4]];
  SL.forEach(([x, y, a], i) => { const t = seg(f, E.slices + i * 6, E.slices + i * 6 + 12); if (t <= 0) return; kiwiSlice(g, x, lerp(560, y, bounce(t)), 92, a, f, jit); });
  drawRoundel(g, 300, 790, 132, '61', 'kcal / 100 g', KG_D, seg(f, E.k61, E.k61 + 10) + (f > E.k61 + 10 ? 1 : 0), jit); burstFX(g, 300, 790, seg(f, E.k61, E.k61 + 16), 132, 200);
  drawRoundel(g, 780, 790, 132, '3 g', 'fibre / 100 g', KG_D, seg(f, E.fib, E.fib + 10) + (f > E.fib + 10 ? 1 : 0), jit);
}
// ---------------- C: its standout is vitamin C: 93 mg per 100 g, more than an orange's 53
function sceneVitC(g, f, jit) {
  bg(g, '#9A6BE0', '#2A0E5C', 540, 1050);
  label(g, 'VITAMIN C', 540, 690, 120, YELLOW, seg(f, E.vitc, E.vitc + 10), -0.02);
  const l1 = eo(seg(f, E.k93 - 16, E.k93 + 6)) * 0.93, l2 = eo(seg(f, E.k53 - 16, E.k53 + 6)) * 0.53;
  vitTube(g, 330, 1262, 150, 400, l1, f, jit); vitTube(g, 750, 1262, 150, 400, l2, f, jit);
  kiwiSlice(g, 330, 1342, 90, 0.2, f, jit); orangeSlice(g, 750, 1342, 90, -0.2, jit);
  drawRoundel(g, 330, 830, 116, '93 mg', 'per 100 g', KG_D, seg(f, E.k93, E.k93 + 10) + (f > E.k93 + 10 ? 1 : 0), jit); burstFX(g, 330, 830, seg(f, E.k93, E.k93 + 16), 116, 190);
  drawRoundel(g, 750, 830, 116, '53 mg', 'per 100 g', '#D2620A', seg(f, E.k53, E.k53 + 10) + (f > E.k53 + 10 ? 1 : 0), jit);
  label(g, 'KIWI', 330, 1462, 50, WHITE, seg(f, E.k93, E.k93 + 8), 0); label(g, 'ORANGE', 750, 1462, 50, WHITE, seg(f, E.k53, E.k53 + 8), 0);
}
// ---------------- D: one peeled kiwi is about 69 g: about 42 kcal
function sceneOne(g, f, jit) {
  bg(g, '#FFB04A', '#B8400E', 540, 1050);
  const t = seg(f, E.oneK - 12, E.oneK + 2), v = f < E.g69 ? null : Math.round(69 * eo(seg(f, E.g69, E.g69 + 18)));
  drawScale(g, 540, 1240, 480, v, jit, seg(f, E.g69 + 16, E.g69 + 22) * (1 - seg(f, E.g69 + 40, E.g69 + 50)));
  if (t > 0) kiwiPeeled(g, 540, lerp(600, 1150, bounce(t)), 230, 140, -0.05, f, jit);
  label(g, '1 KIWI', 540, 700, 130, WHITE, seg(f, E.oneK, E.oneK + 10), -0.02);
  drawRoundel(g, 540, 870, 120, '≈ 42', 'kcal', '#B8400E', seg(f, E.k42, E.k42 + 10) + (f > E.k42 + 10 ? 1 : 0), jit);
}
// ---------------- E: about 70 % of the daily value for vitamin C; log the grams you eat
function scenePayoff(g, f, jit) {
  bg(g, '#3FD1C2', '#0B4F4A', 540, 1050);
  const fr = 0.71 * eo(seg(f, E.k70 - 6, E.k70 + 30));
  dvRing(g, 540, 1040, 250, fr, jit);
  kiwiSlice(g, 540, 1040, 150, f * 0.004, f, jit);
  label(g, fr >= 0.7 ? '≈ 70%' : `${Math.round(fr * 100)}%`, 540, 760, 150, YELLOW, seg(f, E.k70 - 4, E.k70 + 6), -0.02); /* arc fills to 71 % (64 of 90 mg); the label settles on the spoken 'about seventy' */
  label(g, 'VITAMIN C · US DAILY VALUE', 540, 1380, 50, WHITE, seg(f, E.dv, E.dv + 10) * (1 - seg(f, E.logIt - 6, E.logIt)), 0);
  label(g, 'LOG THE GRAMS', 540, 1440, 86, YELLOW, seg(f, E.logIt, E.logIt + 10) * (1 - seg(f, E.cta - 4, E.cta + 4)), -0.02);
}
function camera2(f) {
  const keys = [[0, 1.0, 540, 1010], [96, 1.05, 540, 1000, 1], [110, 1.0, 540, 1010], [268, 1.04, 540, 1004, 1], [282, 1.0, 540, 1010], [450, 1.04, 540, 1004, 1], [464, 1.0, 540, 1010], [607, 1.04, 540, 1004, 1], [621, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + [E.k61, E.k93, E.k53, E.k42, E.k70 + 30].reduce((s, e) => s + 0.018 * Math.exp(-(((f - e) / 4) ** 2)), 0);
  return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)) * kick, x: lerp(x0, x1, t), y: lerp(y0, y1, t) };
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
const SCENES = [[sceneHook, null, 'burnish'], [scene100, 'burnish', 'burnish2'], [sceneVitC, 'burnish2', 'burnish3'], [sceneOne, 'burnish3', 'burnish4'], [scenePayoff, 'burnish4', null]];
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
  g.translate(540, 1250); g.scale(1.08, 1.08); g.translate(-540, -1200);
  hookComposition(g, 20, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6; g.drawImage(grain, 0, 0); g.restore();
  label(g, "WHAT'S", 540, 520, 200, YELLOW, 1, -0.03); label(g, 'INSIDE?', 540, 720, 200, WHITE, 1, -0.03);
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
