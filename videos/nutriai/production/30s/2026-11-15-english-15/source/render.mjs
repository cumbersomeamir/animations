// CalMeter English 30 s english-15 (2026-11-15): a tablespoon of honey vs a tablespoon of sugar ("WHICH SPOON?").
// The requested "avocado vs apple" overlapped english-09 (avocado vs cucumber: 160 kcal, 15 g fat, fat ≈ 9 kcal/g, "neither is bad"),
// so a genuinely different same-genre story with an equally strong opening was chosen. Frame 0 is the thumbnail composition: two
// tablespoons, honey dripping and sugar sparkling, with "WHICH SPOON?". Built to context/25 and the latest composition (english-12 to 14):
// one big hero per scene, large brief labels, sequential reveals, purposeful motion; engraving burin, washes, burnish transitions,
// ivory card, CalMeter CTA seal. Scenes: hook; per 100 g (honey jar with water drops ≈ 17 %, 304 vs 387); same spoon: honey fills
// every gap vs sugar crystals trap air (loupes); one tablespoon each on a scale (21 g vs ≈ 12.5 g), ≈ 64 vs ≈ 48 kcal, "+ ≈ 15",
// "LOG THE SPOON". Original Canvas2D code (no Three.js). Stop motion: 15 drawings/s.
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
// ---------------- honey and sugar: tablespoons (glossy amber honey with a drip; heaped sugar crystals), a honey jar, a sugar bowl, a loupe
const CARD = '#F8F2E3', GOLD = '#9A6410', HONEY = '#E7A42A', HONEY_D = '#B9701A', HONEY_L = '#FFD77A', SUGARC = '#FFFFFF', BLUE = '#2C6E9E', WATERC = '#6FAEDF', STEEL = '#C9CED2';
function softGlow(g, x, y, r, rgb, a) { if (a <= 0) return; const gg = g.createRadialGradient(x, y, 4, x, y, r); gg.addColorStop(0, `rgba(${rgb},${a})`); gg.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function crystal(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = SUGARC; g.fillRect(-s, -s, 2 * s, 2 * s); g.strokeStyle = 'rgba(22,32,26,0.75)'; g.lineWidth = Math.max(0.8, s * 0.18); g.strokeRect(-s, -s, 2 * s, 2 * s); g.fillStyle = 'rgba(200,215,230,0.6)'; g.fillRect(-s, 0, 2 * s, s); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(-s * 0.7, -s * 0.7, s * 0.6, s * 0.4); g.restore(); }
function sparkle(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); g.strokeStyle = 'rgba(255,214,120,0.9)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - r * 0.6, y - r * 0.6); g.lineTo(x + r * 0.6, y + r * 0.6); g.moveTo(x + r * 0.6, y - r * 0.6); g.lineTo(x - r * 0.6, y + r * 0.6); g.stroke(); g.restore(); }
const SUG_HEAP = (() => { const q = rng(17), p = []; for (let i = 0; i < 120; i++) { const u = q() * 2 - 1, v = q(); p.push([u * 0.92, -v * (1 - u * u * 0.9), q() * 1.6]); } return p.sort((a, b) => a[1] - b[1]).reverse(); })();
function spoon(g, cx, cy, s, rot, kind, f, jit, drip = 0, flip = 1) {
  /* a tablespoon seen from above-front: bowl + handle (handle toward +x, or -x when flip = -1); kind 'honey' | 'sugar' */
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(s * flip, s);
  softShadow(g, 10, 74, 150, 22, 0.22);
  g.fillStyle = '#B9BFC4'; g.beginPath(); g.moveTo(118, -10); g.quadraticCurveTo(260, -26, 400, -20); g.lineTo(402, 4); g.quadraticCurveTo(260, 4, 118, 14); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(140, -6); g.quadraticCurveTo(260, -18, 390, -14); g.stroke();
  const bowl = ell(0, 0, 130, 78, 0, 6.283, 48); const gr = g.createLinearGradient(-130, -78, 130, 78); gr.addColorStop(0, '#F2F4F5'); gr.addColorStop(0.5, STEEL); gr.addColorStop(1, '#8E969C'); g.fillStyle = gr; poly(g, bowl); g.fill(); burin(g, bowl, 2.8, INK, 1, jit);
  const inner = ell(0, -4, 116, 66, 0, 6.283, 48);
  if (kind === 'honey') { g.save(); poly(g, inner); g.clip(); const hg = g.createRadialGradient(-40, -30, 6, 0, 0, 140); hg.addColorStop(0, HONEY_L); hg.addColorStop(0.5, HONEY); hg.addColorStop(1, HONEY_D); g.fillStyle = hg; g.fillRect(-130, -80, 260, 160); g.fillStyle = 'rgba(255,250,225,0.75)'; g.beginPath(); g.ellipse(-46, -30, 40, 12, -0.25, 0, 7); g.fill(); g.fillStyle = 'rgba(255,250,225,0.4)'; g.beginPath(); g.ellipse(30, 18, 22, 7, -0.2, 0, 7); g.fill(); g.restore(); burin(g, inner, 1.6, 'rgba(120,70,10,0.8)', 1, jit);
  }
  if (kind === 'sugar') { g.save(); poly(g, inner); g.clip(); g.fillStyle = '#EEF1F4'; g.fillRect(-130, -80, 260, 160); g.restore(); SUG_HEAP.forEach(([u, v, r]) => crystal(g, u * 112, -4 + v * 70, 7, r)); for (let i = 0; i < 4; i++) { const q = rng(Math.floor(f / 6) * 7 + i); sparkle(g, (q() - 0.5) * 200, -20 - q() * 60, 10 + q() * 8, 0.9 * Math.abs(Math.sin(f * 0.18 + i))); } }
  g.restore();
  if (kind === 'honey' && drip > 0) { const bx = cx + s * (-Math.sin(rot) * 70), by = cy + s * (Math.cos(rot) * 70); const L = (40 + 170 * drip) * s, w = 14 * s;
    g.fillStyle = HONEY; g.beginPath(); g.moveTo(bx - 9 * s, by - 6); g.quadraticCurveTo(bx - 4 * s, by + L * 0.6, bx, by + L); g.quadraticCurveTo(bx + 4 * s, by + L * 0.6, bx + 9 * s, by - 6); g.closePath(); g.fill();
    const dy = by + L + 10 * s; g.beginPath(); g.moveTo(bx, dy - 22 * s); g.quadraticCurveTo(bx + w, dy, bx, dy + w); g.quadraticCurveTo(bx - w, dy, bx, dy - 22 * s); g.fill(); g.strokeStyle = 'rgba(120,70,10,0.9)'; g.lineWidth = 1.6; g.stroke(); g.fillStyle = 'rgba(255,250,225,0.8)'; g.beginPath(); g.ellipse(bx - 4 * s, dy - 4 * s, 3 * s, 6 * s, -0.3, 0, 7); g.fill(); }
}
function honeyJar(g, cx, cy, s, water, jit) {
  g.save(); g.translate(cx, cy); g.scale(s, s); softShadow(g, 0, 150, 130, 18, 0.22);
  const body = [[-110, -90], [110, -90], [120, 120], [100, 150], [-100, 150], [-120, 120]]; g.save(); poly(g, body); g.clip(); const hg = g.createLinearGradient(-120, 0, 120, 0); hg.addColorStop(0, HONEY_D); hg.addColorStop(0.35, HONEY_L); hg.addColorStop(0.6, HONEY); hg.addColorStop(1, HONEY_D); g.fillStyle = hg; g.fillRect(-130, -100, 260, 260);
  if (water > 0) { const q = rng(5); for (let i = 0; i < 22; i++) { const x = (q() - 0.5) * 210, y = -70 + q() * 210, r = 9 + q() * 5; g.save(); g.globalAlpha = water; g.fillStyle = WATERC; g.beginPath(); g.moveTo(x, y - r * 1.5); g.quadraticCurveTo(x + r, y, x, y + r); g.quadraticCurveTo(x - r, y, x, y - r * 1.5); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); g.restore(); } }
  g.fillStyle = 'rgba(255,255,240,0.35)'; g.fillRect(-90, -80, 22, 220); g.restore(); burin(g, [...body, body[0]], 3, INK, 1, jit);
  g.fillStyle = '#7A5230'; g.fillRect(-120, -128, 240, 40); g.strokeStyle = INK; g.lineWidth = 2.6; g.strokeRect(-120, -128, 240, 40); for (let i = 0; i < 12; i++) burin(g, [[-112 + i * 20, -124], [-112 + i * 20, -92]], 1, 'rgba(22,32,26,0.4)', 1, jit);
  g.fillStyle = '#FBF6E8'; g.fillRect(-90, -10, 180, 70); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-90, -10, 180, 70); text(g, 'HONEY', 0, 40, '900 44px NDisplay', HONEY_D, 'center', 2, 'fig');
  g.restore();
}
function sugarBowl(g, cx, cy, s, jit) {
  g.save(); g.translate(cx, cy); g.scale(s, s); softShadow(g, 0, 110, 150, 18, 0.22);
  const ry = 30, rx = 150, depth = 100; g.fillStyle = '#E3E7EA'; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  const q = rng(4); const pts = []; for (let i = 0; i < 150; i++) { const u = q() * 2 - 1, v = q(); pts.push([u * rx * 0.9, -v * 70 * (1 - u * u * 0.85), q() * 1.6]); } pts.sort((a, b) => a[1] - b[1]).reverse().forEach(([x, y, r]) => crystal(g, x, y, 8, r));
  const front = [...Array.from({ length: 31 }, (_, i) => { const a = Math.PI * (i / 30); return [Math.cos(a) * rx, Math.sin(a) * ry]; }), ...Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [lerp(-rx, rx, t), ry * 0.3 + depth * Math.pow(Math.sin(Math.PI * t), 0.6)]; }).reverse()];
  g.save(); poly(g, front); g.clip(); const bg = g.createLinearGradient(-rx, 0, rx, 0); bg.addColorStop(0, '#9DB8CF'); bg.addColorStop(0.4, '#E6F0F8'); bg.addColorStop(1, '#8EA9C0'); g.fillStyle = bg; g.fillRect(-rx - 2, -ry, 2 * rx + 4, depth + 2 * ry + 4); g.restore(); burin(g, front, 2.6, INK, 1, jit);
  text(g, 'SUGAR', 0, 76, '900 40px NDisplay', '#2C4F6E', 'center', 2, 'fig');
  g.restore();
}
function loupe(g, cx, cy, r, kind, f, jit, a) {
  if (a <= 0) return; const sc = 0.6 + 0.4 * eo(clamp(a)); g.save(); g.translate(cx, cy); g.scale(sc, sc); g.globalAlpha *= clamp(a * 1.6);
  softShadow(g, 8, 12, r, r, 0.2); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r - 6, 0, 7); g.clip();
  if (kind === 'honey') { const hg = g.createRadialGradient(-r * 0.3, -r * 0.3, 6, 0, 0, r); hg.addColorStop(0, HONEY_L); hg.addColorStop(1, HONEY); g.fillStyle = hg; g.fillRect(-r, -r, 2 * r, 2 * r); g.fillStyle = 'rgba(255,250,225,0.6)'; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.35, r * 0.35, r * 0.1, -0.3, 0, 7); g.fill(); }
  else { g.fillStyle = '#DCEBF7'; g.fillRect(-r, -r, 2 * r, 2 * r); const q = rng(8); for (let i = 0; i < 16; i++) { const x = (q() - 0.5) * 1.6 * r, y = (q() - 0.5) * 1.6 * r; crystal(g, x, y, 22 + q() * 8, q() * 1.5); } }
  g.restore(); g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, r - 2, 0, 7); g.stroke(); g.strokeStyle = '#B8BEC2'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r - 2, 0, 7); g.stroke(); g.fillStyle = '#3B3F42'; g.save(); g.rotate(0.8); g.fillRect(r - 4, -12, 100, 24); g.restore(); g.restore();
}
// ---------------- A: frame 0 = the thumbnail: two tablespoons, honey dripping, sugar sparkling, "WHICH SPOON?"
function hookComposition(g, f, jit, words = 1) {
  softGlow(g, 360, 1000, 380, '255,200,90', 0.5); softGlow(g, 720, 1000, 380, '200,225,250', 0.55);
  const dr = 0.35 + 0.65 * ((f - E.drip) % 90) / 90;
  spoon(g, 380, 960, 1.05, -0.32, 'honey', f, jit, Math.min(1, dr), -1); spoon(g, 700, 960, 1.05, 0.32, 'sugar', f, jit, 0, 1);
  if (words > 0) { bigLabel(g, 'WHICH SPOON?', 540, 720, 104, INK, words, 0); }
}
function sceneHook(g, f, jit) {
  hookComposition(g, f, jit, 1 - seg(f, E.qk - 6, E.qk));
  const k = seg(f, E.qk, E.qk + 10); if (k > 0) { drawRoundel(g, 250, 740, 105, '?', 'kcal', HONEY_D, k + (f > E.qk + 10 ? 1 : 0), jit); drawRoundel(g, 830, 740, 105, '?', 'kcal', BLUE, seg(f, E.qk + 4, E.qk + 14) + (f > E.qk + 14 ? 1 : 0), jit); }
  bigLabel(g, 'HONEY', 300, 1370, 62, HONEY_D, 1, 0); bigLabel(g, 'SUGAR', 780, 1370, 62, BLUE, 1, 0);
}
// ---------------- B: gram for gram: honey is lower; it is partly water; 304 vs 387 per 100 g
function scenePer100(g, f, jit) {
  const a = seg(f, E.jars, E.jars + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, 'PER 100 g', 540, 650, 62, INK, a * (1 - seg(f, E.k304 - 6, E.k304)), 0);
  honeyJar(g, 300, 1130, 1.15, seg(f, E.water, E.water + 20), jit); sugarBowl(g, 790, 1180, 1.1, jit);
  const lw = seg(f, E.lower, E.lower + 10); if (lw > 0 && f < E.water + 10) bigLabel(g, 'LOWER', 300, 860, 70, LEAFDARK, lw * (1 - seg(f, E.water, E.water + 10)), -0.05);
  bigLabel(g, '≈ 17% WATER', 322, 1430, 52, BLUE, seg(f, E.water + 8, E.water + 16), 0);
  drawRoundel(g, 300, 760, 120, '304', 'kcal / 100 g', HONEY_D, seg(f, E.k304, E.k304 + 10) + (f > E.k304 + 10 ? 1 : 0), jit);
  drawRoundel(g, 790, 760, 120, '387', 'kcal / 100 g', BLUE, seg(f, E.k387, E.k387 + 10) + (f > E.k387 + 10 ? 1 : 0), jit);
  g.restore();
}
// ---------------- C: but spoons measure volume: honey fills every gap; sugar crystals trap air
function sceneVolume(g, f, jit) {
  const a = seg(f, E.spoons, E.spoons + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, 'SAME SPOON', 540, 650, 64, INK, seg(f, E.vol, E.vol + 8), 0);
  spoon(g, 360, 1210, 0.9, -0.25, 'honey', f, jit, 0, -1); spoon(g, 720, 1210, 0.9, 0.25, 'sugar', f, jit, 0, 1);
  loupe(g, 300, 900, 150, 'honey', f, jit, seg(f, E.noGap - 6, E.noGap + 6)); bigLabel(g, 'NO GAPS', 300, 1420, 60, HONEY_D, seg(f, E.noGap + 4, E.noGap + 12), 0);
  loupe(g, 790, 900, 150, 'sugar', f, jit, seg(f, E.air - 8, E.air + 4)); bigLabel(g, 'AIR GAPS', 790, 1420, 60, BLUE, seg(f, E.air + 4, E.air + 12), 0);
  g.restore();
}
// ---------------- D/E: one tablespoon each on a scale: 21 g vs ≈ 12.5 g; per spoon ≈ 64 vs ≈ 48 kcal; log the spoon you use
function sceneSpoonScale(g, f, jit) {
  const a = seg(f, E.scales, E.scales + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const g1 = f < E.g21 ? null : 21 * eo(seg(f, E.g21, E.g21 + 14)), g2 = f < E.g12 ? null : 12.5 * eo(seg(f, E.g12, E.g12 + 14));
  drawScale(g, 300, 1120, 330, g1 == null ? null : Math.round(g1 * 2) / 2, jit, seg(f, E.g21 + 12, E.g21 + 18) * (1 - seg(f, E.g21 + 30, E.g21 + 40))); drawScale(g, 790, 1120, 330, g2 == null ? null : Math.round(g2 * 2) / 2, jit, seg(f, E.g12 + 12, E.g12 + 18) * (1 - seg(f, E.g12 + 30, E.g12 + 40)));
  spoon(g, 270, 1060, 0.78, -0.12, 'honey', f, jit, 0); spoon(g, 760, 1060, 0.78, -0.12, 'sugar', f, jit);
  bigLabel(g, '1 TBSP', 540, 650, 60, INK, a * (1 - seg(f, E.kSpoon - 6, E.kSpoon)), 0);
  const k = seg(f, E.kSpoon, E.kSpoon + 10); if (k > 0) { drawRoundel(g, 300, 790, 120, '≈ 64', 'kcal / tbsp', HONEY_D, k + (f > E.kSpoon + 10 ? 1 : 0), jit); drawRoundel(g, 790, 790, 120, '≈ 48', 'kcal / tbsp', BLUE, seg(f, E.kSpoon + 4, E.kSpoon + 14) + (f > E.kSpoon + 14 ? 1 : 0), jit); }
  bigLabel(g, '+ ≈ 15', 545, 820, 64, RED, seg(f, E.diff, E.diff + 8), 0);
  const lg = seg(f, E.logIt, E.logIt + 10); if (lg > 0) { bigLabel(g, 'LOG THE SPOON', 540, 1420, 62, LEAFDARK, lg * (1 - seg(f, E.cta - 4, E.cta + 4)), 0); }
  g.restore();
}
function camera2(f) {
  const keys = [[0, 1.0, 540, 1010], [108, 1.04, 540, 1000, 1], [122, 1.0, 540, 1010], [324, 1.05, 540, 1000, 1], [338, 1.0, 540, 1010], [478, 1.04, 540, 1000, 1], [492, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + 0.02 * Math.exp(-(((f - E.k387) / 4) ** 2)) + 0.02 * Math.exp(-(((f - E.g12) / 4) ** 2)) + 0.02 * Math.exp(-(((f - E.diff) / 4) ** 2));
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
const SCENES = [[sceneHook, null, 'burnish'], [scenePer100, 'burnish', 'burnish2'], [sceneVolume, 'burnish2', 'burnish3'], [sceneSpoonScale, 'burnish3', null]];
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
  g.translate(540, 1010); g.scale(1.12, 1.12); g.translate(-540, -1010);
  softGlow(g, 300, 1060, 420, '255,200,90', 0.5); softGlow(g, 790, 1060, 420, '200,225,250', 0.55);
  spoon(g, 380, 960, 1.05, -0.32, 'honey', 30, jit, 0.9, -1); spoon(g, 700, 960, 1.05, 0.32, 'sugar', 30, jit, 0, 1);
  g.setTransform(1, 0, 0, 1, 0, 0);
  text(g, 'WHICH', 540, 470, '900 160px NDisplay', INK, 'center', -2, 'thumb'); text(g, 'SPOON?', 540, 640, '900 160px NDisplay', HONEY_D, 'center', -2, 'thumb');
  text(g, 'HONEY', 300, 1500, '900 70px NDisplay', HONEY_D, 'center', 2, 'thumb'); text(g, 'SUGAR', 790, 1500, '900 70px NDisplay', BLUE, 'center', 2, 'thumb');
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
