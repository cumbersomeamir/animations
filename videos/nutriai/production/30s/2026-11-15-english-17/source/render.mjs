// CalMeter English 30 s english-17 (2026-11-15, batch 17): a huge watermelon wedge vs a few raisins, "SIZE LIES".
// Watermelon had never been covered (raisins appeared in english-08; "water has no calories" appeared with cucumber in english-09), so the
// requested topic was used, told as a size illusion with explicit portion weights. Frame 0 is the thumbnail composition: a huge 3D wedge
// beside a tiny dish of raisins with "SIZE LIES". Built to context/25 (incl. the 2026-11-15 first-frame addendum) and the approved
// egg/avocado-era direction: one big hero per scene, real transformations (wedge lands on a scale, raisins pour, water leaves the flesh
// into a glass, a cube drops, a ghost wedge grows behind a handful), big roundels, giant brief labels, brighter card and colour glows.
// Scenes: hook + answer (≈ 85 kcal each); weights (286 g vs 28 g, ≈ 10×); 91 % water, 0 kcal; per 100 g (299 vs 30); payoff (a small
// handful = 1 wedge, LOG GRAMS); CalMeter CTA seal. Original Canvas2D code (no Three.js). Stop motion 15 drawings/s.
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
// ---------------- watermelon and raisins: a 3D wedge (rind, seeds, juicy flesh), wrinkled raisins, a dish, a glass, a 100 g cube
const CARD = '#FFFBF1', MELON = '#E8344C', MELON_D = '#B01E33', RIND = '#2E7D32', RIND_D = '#1B5E20', RAISIN = '#5A2443', RAISIN_D = '#2F1024', BLUE = '#2C6E9E', WATERC = '#9FD3F5', PINK_RGB = '255,120,140', PLUM_RGB = '170,110,190';
function softGlow(g, x, y, r, rgb, a) { if (a <= 0) return; const gg = g.createRadialGradient(x, y, 4, x, y, r); gg.addColorStop(0, `rgba(${rgb},${a})`); gg.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function sparkle(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); g.restore(); }
const bounce = (t) => { if (t >= 1) return 1; const u = eo(clamp(t / 0.75)); return t < 0.75 ? u : 1 - 0.06 * Math.sin(Math.PI * (t - 0.75) / 0.25); };
const WR = 520, WAPEX = -300, WTH = 0.37; /* wedge geometry: apex at (0, -300), rind arc of radius 520 centred on the apex, half-angle 0.37 rad */
const sector = (r) => { const p = [[0, WAPEX]]; for (let i = 0; i <= 36; i++) { const a = Math.PI / 2 - WTH + (2 * WTH * i) / 36; p.push([r * Math.cos(a), WAPEX + r * Math.sin(a)]); } return p; };
const SEEDS = (() => { const q = rng(23), s = []; for (const [rr, n] of [[250, 3], [330, 4], [405, 5]]) for (let i = 0; i < n; i++) { const a = Math.PI / 2 - WTH * 0.78 + (2 * WTH * 0.78 * (i + 0.5)) / n + (q() - 0.5) * 0.05; s.push([rr * Math.cos(a), WAPEX + rr * Math.sin(a) + (q() - 0.5) * 14, a]); } return s; })();
const JUICE = (() => { const q = rng(31), s = []; for (let i = 0; i < 70; i++) { const rr = 60 + q() * 400, a = Math.PI / 2 - WTH * 0.9 + q() * 2 * WTH * 0.9; s.push([rr * Math.cos(a), WAPEX + rr * Math.sin(a), q() * 6.28, 4 + q() * 7]); } return s; })();
let GHOST = null;
function wedge(g, cx, cy, s, rot, jit, o = {}) {
  /* a 1/16 watermelon wedge standing on its rind, with visible thickness; o.fade 0..1 pales the flesh (water leaving); o.ghost draws only a dashed outline */
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(s, s);
  const fade = o.fade ?? 0;
  if (o.ghost) {
    /* drawn once to its own canvas, then faded as one layer so the translucent faces do not stack into a muddy tone */
    g.restore(); if (!GHOST) { GHOST = createCanvas(720, 720); const gg = GHOST.getContext('2d'); wedge(gg, 330, 390, 1, 0, rng(5), {}); }
    g.save(); g.globalAlpha *= 0.42; g.translate(cx, cy); g.rotate(rot); g.scale(s, s); g.drawImage(GHOST, -330, -390); g.setLineDash([18, 12]); g.strokeStyle = MELON_D; g.lineWidth = 5 / s; g.globalAlpha = Math.min(1, g.globalAlpha * 2); poly(g, sector(WR)); g.stroke(); g.restore(); return; }
  softShadow(g, 30, 214, 230, 26, 0.22);
  /* back face (thickness) */
  g.save(); g.translate(30, -14); g.fillStyle = RIND_D; poly(g, sector(WR)); g.fill(); g.fillStyle = mix(MELON_D, '#E9C9CE', fade * 0.7); poly(g, sector(WR - 48)); g.fill(); g.restore();
  /* front face: rind, pale rind, white band, flesh */
  const outer = sector(WR); g.fillStyle = RIND; poly(g, outer); g.fill();
  g.save(); poly(g, outer); g.clip(); g.strokeStyle = RIND_D; g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = Math.PI / 2 - WTH + (2 * WTH * (i + 0.3)) / 12; g.beginPath(); g.moveTo((WR - 4) * Math.cos(a), WAPEX + (WR - 4) * Math.sin(a)); g.lineTo((WR - 30) * Math.cos(a + 0.02), WAPEX + (WR - 30) * Math.sin(a + 0.02)); g.stroke(); } g.restore();
  g.fillStyle = '#B9E27E'; poly(g, sector(WR - 30)); g.fill(); g.fillStyle = '#F4F7DC'; poly(g, sector(WR - 42)); g.fill();
  const fl = sector(WR - 50); const fg = g.createLinearGradient(0, WAPEX, 0, WAPEX + WR); fg.addColorStop(0, mix('#FF7A8C', '#F6DCE0', fade)); fg.addColorStop(0.55, mix('#F2405A', '#F2CED4', fade)); fg.addColorStop(1, mix('#DE2A44', '#EBC4CA', fade)); g.fillStyle = fg; poly(g, fl); g.fill();
  g.save(); poly(g, fl); g.clip();
  for (const [x, y, r, l] of JUICE) { g.strokeStyle = `rgba(255,190,200,${0.55 * (1 - fade)})`; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(r) * l, y + Math.sin(r) * l); g.stroke(); }
  g.strokeStyle = 'rgba(120,10,30,0.28)'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < 9; i++) { const t = 0.15 + i * 0.09; g.moveTo(WR * Math.sin(WTH) * t * 1.05, WAPEX + (WR - 60) * t); g.lineTo(WR * Math.sin(WTH) * t * 1.05 - 26, WAPEX + (WR - 60) * t + 30); } g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(-14, WAPEX + 40); g.lineTo(-WR * Math.sin(WTH) * 0.78, WAPEX + WR * 0.72); g.lineTo(-WR * Math.sin(WTH) * 0.62, WAPEX + WR * 0.72); g.lineTo(-4, WAPEX + 50); g.closePath(); g.fill();
  g.restore();
  for (const [x, y, a] of SEEDS) { g.save(); g.translate(x, y); g.rotate(a - Math.PI / 2); g.fillStyle = '#1C1416'; g.beginPath(); g.moveTo(0, -15); g.quadraticCurveTo(10, 2, 0, 12); g.quadraticCurveTo(-10, 2, 0, -15); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-3, 0, 2, 5, 0, 0, 7); g.fill(); g.restore(); }
  burin(g, [...outer, outer[0]], 3, INK, 1, jit); burin(g, sector(WR - 50).slice(1), 1.4, 'rgba(22,32,26,0.5)', 1, jit);
  g.restore();
}
function raisin(g, x, y, r, rot, seed) {
  /* one wrinkled dark raisin */
  const q = rng(seed); g.save(); g.translate(x, y); g.rotate(rot); const pts = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283, k = 0.82 + q() * 0.3; pts.push([Math.cos(a) * r * k, Math.sin(a) * r * 0.7 * k]); }
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.2); gr.addColorStop(0, '#9A5576'); gr.addColorStop(0.5, RAISIN); gr.addColorStop(1, RAISIN_D); g.fillStyle = gr; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(20,4,14,0.75)'; g.lineWidth = Math.max(1, r * 0.09); g.stroke();
  g.strokeStyle = 'rgba(25,5,15,0.6)'; g.lineWidth = Math.max(0.8, r * 0.07); g.beginPath(); for (let i = 0; i < 3; i++) { const yy = (q() - 0.5) * r * 0.8; g.moveTo(-r * 0.6, yy); g.quadraticCurveTo(0, yy + (q() - 0.5) * r * 0.5, r * 0.6, yy + (q() - 0.5) * r * 0.3); } g.stroke();
  g.fillStyle = 'rgba(235,180,210,0.6)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.25, r * 0.22, r * 0.1, -0.3, 0, 7); g.fill(); g.restore();
}
function pileLayout(n, w, h, seed) { const q = rng(seed), p = []; for (let i = 0; i < n; i++) { const v = Math.pow(q(), 0.8), u = (q() * 2 - 1) * (1 - v * 0.7); p.push([u * w, -v * h, q() * 6.28, seed * 100 + i]); } return p.sort((a, b) => a[1] - b[1]).reverse(); }
const PILE_S = pileLayout(16, 60, 30, 3), PILE_100 = pileLayout(80, 140, 120, 5), PILE_HAND = pileLayout(16, 58, 30, 7);
function raisinPile(g, cx, cy, pile, r, f = 1e9, start = -1e9, step = 0, fallH = 300) {
  /* raisins in a mound; when start/step are given they drop in one by one */
  pile.forEach(([x, y, a, sd], i) => { const t = seg(f, start + i * step, start + i * step + 8); if (t <= 0) return; raisin(g, cx + x, cy + y - (1 - bounce(t)) * fallH, r, a, sd); });
}
function dish(g, cx, cy, rx) { softShadow(g, cx + 6, cy + 16, rx * 1.05, rx * 0.16, 0.2); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(cx, cy, rx, rx * 0.24, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke(); g.fillStyle = '#EEF1F3'; g.beginPath(); g.ellipse(cx, cy - 2, rx * 0.66, rx * 0.14, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(22,32,26,0.4)'; g.lineWidth = 1.2; g.stroke(); }
function glass(g, cx, top, w, h, level, jit) {
  /* a tall glass; level 0..1 of water */
  const x0 = cx - w / 2, bot = top + h; softShadow(g, cx + 8, bot + 8, w * 0.62, 14, 0.2);
  g.fillStyle = 'rgba(225,240,250,0.55)'; g.fillRect(x0, top, w, h);
  if (level > 0) { const wy = bot - (h - 14) * level; const wg = g.createLinearGradient(x0, 0, x0 + w, 0); wg.addColorStop(0, '#7FBFE8'); wg.addColorStop(0.4, '#BFE4FA'); wg.addColorStop(1, '#78B6E0'); g.fillStyle = wg; g.fillRect(x0 + 6, wy, w - 12, bot - 6 - wy); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x0 + 6, wy, w - 12, 5); }
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x0 + 16, top + 14, 14, h - 34);
  burin(g, [[x0, top], [x0, bot], [x0 + w, bot], [x0 + w, top]], 3, INK, 1, jit); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, top, w / 2, 10, 0, 0, 7); g.stroke();
}
function melonCube(g, x, y, s) {
  /* a 100 g cube of watermelon flesh standing on (x, y) */
  const d = s * 0.32, fx = x - s / 2, fy = y - s;
  g.fillStyle = '#FF8696'; poly(g, [[fx, fy], [fx + s, fy], [fx + s + d, fy - d], [fx + d, fy - d]]); g.fill();
  g.fillStyle = '#C42640'; poly(g, [[fx + s, fy], [fx + s + d, fy - d], [fx + s + d, fy + s - d], [fx + s, fy + s]]); g.fill();
  const fg = g.createLinearGradient(fx, fy, fx + s, fy + s); fg.addColorStop(0, '#FF6276'); fg.addColorStop(1, '#E2324C'); g.fillStyle = fg; g.fillRect(fx, fy, s, s);
  const q = rng(41); g.strokeStyle = 'rgba(255,190,200,0.6)'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 16; i++) { const px = fx + 8 + q() * (s - 16), py = fy + 8 + q() * (s - 16), a = q() * 6.28; g.moveTo(px, py); g.lineTo(px + Math.cos(a) * 7, py + Math.sin(a) * 7); } g.stroke();
  for (const [u, v] of [[0.3, 0.4], [0.68, 0.62], [0.45, 0.78]]) { g.save(); g.translate(fx + u * s, fy + v * s); g.rotate(0.3); g.fillStyle = '#1C1416'; g.beginPath(); g.ellipse(0, 0, s * 0.035, s * 0.07, 0, 0, 7); g.fill(); g.restore(); }
  g.strokeStyle = INK; g.lineWidth = 2.4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(fx, fy + s); g.lineTo(fx, fy); g.lineTo(fx + d, fy - d); g.lineTo(fx + s + d, fy - d); g.lineTo(fx + s + d, fy + s - d); g.lineTo(fx + s, fy + s); g.closePath(); g.moveTo(fx, fy); g.lineTo(fx + s, fy); g.lineTo(fx + s + d, fy - d); g.moveTo(fx + s, fy); g.lineTo(fx + s, fy + s); g.stroke();
}
function juiceDrop(g, x, y, r) { g.fillStyle = '#FF5C72'; g.beginPath(); g.moveTo(x, y - r * 1.6); g.quadraticCurveTo(x + r, y, x, y + r); g.quadraticCurveTo(x - r, y, x, y - r * 1.6); g.fill(); g.strokeStyle = 'rgba(120,10,30,0.8)'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.1, r * 0.18, r * 0.35, -0.3, 0, 7); g.fill(); }
function waterDrop(g, x, y, r) { g.fillStyle = WATERC; g.beginPath(); g.moveTo(x, y - r * 1.6); g.quadraticCurveTo(x + r, y, x, y + r); g.quadraticCurveTo(x - r, y, x, y - r * 1.6); g.fill(); g.strokeStyle = 'rgba(20,60,100,0.8)'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.1, r * 0.18, r * 0.35, -0.3, 0, 7); g.fill(); }
// ---------------- A: frame 0 = the thumbnail: a huge wedge beside a tiny dish of raisins, "SIZE LIES"
function hookComposition(g, f, jit, words = 1, still = false) {
  const ph = still ? 20 : f, bob = Math.sin(ph * 0.05) * 5;
  softGlow(g, 390, 1040, 470, PINK_RGB, 0.32); softGlow(g, 820, 1330, 220, PLUM_RGB, 0.35);
  wedge(g, 392, 1094 + bob, 1.04, -0.07, jit);
  dish(g, 822, 1352, 104); raisinPile(g, 822, 1340, PILE_S, 16);
  for (let i = 0; i < 3; i++) sparkle(g, 300 + i * 90, 840 + i * 130, 10, Math.abs(Math.sin(ph * 0.12 + i * 1.7)) * 0.9);
  sparkle(g, 790 + 40 * Math.sin(ph * 0.07), 1318, 8, Math.abs(Math.sin(ph * 0.1 + 0.6)) * 0.8);
  bigLabel(g, 'RAISINS', 822, 1452, 52, RAISIN, 1, 0);
  if (words > 0) bigLabel(g, 'SIZE LIES', 540, 660, 112, INK, words, 0);
}
function sceneHook(g, f, jit) {
  hookComposition(g, f, jit, 1 - seg(f, E.qk - 6, E.qk));
  const q = seg(f, E.qk, E.qk + 10), k = seg(f, E.k85, E.k85 + 10);
  if (q > 0 && f < E.k85 + 2) { drawRoundel(g, 230, 760, 104, '?', 'kcal', MELON_D, q + (f > E.qk + 10 ? 1 : 0), jit); drawRoundel(g, 822, 1110, 92, '?', 'kcal', RAISIN, seg(f, E.qk + 4, E.qk + 14) + (f > E.qk + 14 ? 1 : 0), jit); }
  if (k > 0) { drawRoundel(g, 230, 760, 104, '≈ 85', 'kcal', MELON_D, k + (f > E.k85 + 10 ? 1 : 0), jit); drawRoundel(g, 822, 1110, 92, '≈ 85', 'kcal', RAISIN, seg(f, E.k85 + 3, E.k85 + 13) + (f > E.k85 + 13 ? 1 : 0), jit); burstFX(g, 822, 1110, seg(f, E.k85 + 3, E.k85 + 19), 92, 160); }
  bigLabel(g, 'SAME kcal', 560, 660, 92, RED, seg(f, E.same, E.same + 8), 0);
}
// ---------------- B: yet the wedge holds 286 g of flesh (USDA edible portion, rind excluded); 60 raisins just 28 g
function sceneWeigh(g, f, jit) {
  const a = seg(f, E.scales, E.scales + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  softGlow(g, 330, 1050, 380, PINK_RGB, 0.25); softGlow(g, 800, 1150, 220, PLUM_RGB, 0.28);
  const w1 = f < E.g286 ? null : Math.round(286 * eo(seg(f, E.g286, E.g286 + 30))), w2 = f < E.g28 ? null : Math.round(28 * eo(seg(f, E.g28, E.g28 + 24)));
  drawScale(g, 330, 1230, 440, w1, jit, seg(f, E.g286 + 28, E.g286 + 34) * (1 - seg(f, E.g286 + 50, E.g286 + 60)));
  drawScale(g, 810, 1230, 300, w2, jit, seg(f, E.g28 + 22, E.g28 + 28) * (1 - seg(f, E.g28 + 44, E.g28 + 54)));
  const lt = seg(f, E.wedgeLand - 12, E.wedgeLand); if (lt > 0) wedge(g, 330, lerp(560, 1004, bounce(lt)), 0.78, 0.0, jit);
  raisinPile(g, 810, 1226, PILE_S, 12, f, E.raisins, 1.2, 330);
  bigLabel(g, 'FLESH ONLY', 330, 1458, 44, RIND_D, seg(f, E.flesh, E.flesh + 8), 0); /* USDA wedge weight = edible portion, rind excluded */
  bigLabel(g, '≈ 10×', 600, 760, 96, RED, seg(f, E.x10, E.x10 + 8), -0.04);
  g.restore();
}
// ---------------- C: watermelon is 91 % water, and water has no calories
function sceneWater(g, f, jit) {
  const a = seg(f, E.water, E.water + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  softGlow(g, 330, 1040, 420, PINK_RGB, 0.28); softGlow(g, 800, 1150, 260, '120,190,240', 0.3);
  const sq = seg(f, E.squeeze, E.zero - 6), wob = Math.sin(f * 0.6) * 0.012 * (sq > 0 && sq < 1 ? 1 : 0);
  wedge(g, 330, 1060, 0.95, -0.06 + wob, jit, { fade: 0.55 * eo(sq) });
  /* water droplets leave the flesh and arc into the glass */
  for (let i = 0; i < 26; i++) { const s0 = E.squeeze + i * 3, u = seg(f, s0, s0 + 16); if (u <= 0 || u >= 1) continue; const q = rng(i * 7 + 3); const sx = 280 + q() * 140, sy = 820 + q() * 300; const x = lerp(sx, 790 + (q() - 0.5) * 80, u), y = lerp(sy, 1020, u) - Math.sin(Math.PI * u) * 180; waterDrop(g, x, y, 11); }
  glass(g, 800, 980, 220, 380, 0.91 * eo(sq), jit);
  bigLabel(g, '91% WATER', 540, 670, 100, BLUE, seg(f, E.w91, E.w91 + 8), 0);
  drawRoundel(g, 800, 1200, 92, '0', 'kcal', BLUE, seg(f, E.zero, E.zero + 10) + (f > E.zero + 10 ? 1 : 0), jit);
  g.restore();
}
// ---------------- D: per 100 g: raisins 299 kcal; watermelon 30 (≈ 10×)
function scenePer100(g, f, jit) {
  const a = seg(f, E.per100, E.per100 + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, 'PER 100 g', 540, 660, 80, INK, 1, 0);
  softGlow(g, 300, 1240, 260, PINK_RGB, 0.25); softGlow(g, 790, 1240, 280, PLUM_RGB, 0.3);
  dish(g, 790, 1312, 180); raisinPile(g, 790, 1296, PILE_100, 17, f, E.rais100, 0.25, 360);
  const ct = seg(f, E.cube - 12, E.cube); if (ct > 0) { softShadow(g, 310, 1316, 120, 14, 0.2 * ct); melonCube(g, 296, lerp(700, 1310, bounce(ct)), 170); }
  bigLabel(g, 'WATERMELON', 324, 1440, 50, MELON_D, seg(f, E.cube, E.cube + 8), 0); bigLabel(g, 'RAISINS', 790, 1440, 54, RAISIN, seg(f, E.rais100 + 10, E.rais100 + 18), 0);
  drawRoundel(g, 790, 880, 118, '299', 'kcal / 100 g', RAISIN, seg(f, E.k299, E.k299 + 10) + (f > E.k299 + 10 ? 1 : 0), jit);
  drawRoundel(g, 300, 880, 118, '30', 'kcal / 100 g', MELON_D, seg(f, E.k30, E.k30 + 10) + (f > E.k30 + 10 ? 1 : 0), jit);
  bigLabel(g, '× 10', 545, 900, 86, RED, seg(f, E.x10b, E.x10b + 8), 0);
  g.restore();
}
// ---------------- E: so a small handful of raisins counts like a whole wedge: log grams, not size
function scenePayoff(g, f, jit) {
  const a = seg(f, E.pay, E.pay + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const gh = eo(seg(f, E.ghost, E.oneWedge + 6));
  softGlow(g, 540, 1000, 440, PINK_RGB, 0.2 + 0.2 * gh); softGlow(g, 540, 1190, 200, PLUM_RGB, 0.35);
  if (gh > 0) wedge(g, 540, 1004 - 6 * Math.sin(f * 0.05), 0.35 + 0.65 * gh, 0, jit, { ghost: true });
  dish(g, 540, 1206, 104); raisinPile(g, 540, 1196, PILE_HAND, 14, f, E.handful, 0.6, 300);
  const lg = seg(f, E.logIt, E.logIt + 10);
  bigLabel(g, '28 g', 540, 1310, 70, RAISIN, seg(f, E.handful + 10, E.handful + 18) * (1 - seg(f, E.cta - 6, E.cta)), 0);
  bigLabel(g, '= 1 WEDGE', 540, 660, 96, MELON_D, seg(f, E.oneWedge, E.oneWedge + 8), 0);
  if (lg > 0) bigLabel(g, 'LOG GRAMS', 540, 1440, 70, LEAFDARK, lg * (1 - seg(f, E.cta - 4, E.cta + 4)), 0);
  g.restore();
}
function camera2(f) {
  const keys = [[0, 1.0, 540, 1010], [184, 1.045, 540, 1000, 1], [198, 1.0, 540, 1010], [353, 1.04, 540, 1004, 1], [367, 1.0, 540, 1010], [483, 1.04, 540, 1004, 1], [497, 1.0, 540, 1010], [642, 1.04, 540, 1004, 1], [656, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + [E.k85, E.x10, E.zero, E.k299, E.oneWedge].reduce((s, e) => s + 0.018 * Math.exp(-(((f - e) / 4) ** 2)), 0);
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
const SCENES = [[sceneHook, null, 'burnish'], [sceneWeigh, 'burnish', 'burnish2'], [sceneWater, 'burnish2', 'burnish3'], [scenePer100, 'burnish3', 'burnish4'], [scenePayoff, 'burnish4', null]];
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
  g.translate(512, 1200); g.scale(1.16, 1.16); g.translate(-540, -1100);
  hookComposition(g, 20, jit, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  text(g, 'SIZE', 540, 470, '900 210px NDisplay', INK, 'center', -2, 'thumb'); text(g, 'LIES', 540, 680, '900 210px NDisplay', MELON_D, 'center', -2, 'thumb');
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
