// CalMeter English 30 s english-14 (2026-11-14): edamame vs green peas (look alike, not alike).
// The requested "peanuts vs green peas" overlapped english-06 (peanuts vs peanut butter: "peanuts are already about half fat"), so the
// brief's idea (two legumes that seem alike but differ in fat, protein, energy and water, per 100 g, with a snack takeaway) was kept with
// edamame in place of peanuts. Built to context/25 and the popcorn/rice composition: one big hero per scene, large brief labels one at a
// time, sequential reveals, purposeful motion; engraving burin, washes, burnish transitions, ivory paper, CalMeter CTA seal.
// Scenes: two pods burst open (GREEN PEAS = EDAMAME, then ≠); one pea and one bean with "?"; inside the edamame bean (protein + oil)
// then the pea (mostly carbs); per 100 g cooked: protein cubes 12 vs 5, fat drops 5 vs ≈ 0, 121 vs 78 kcal; one cup each: 18 g vs 8 g
// protein, ≈ 188 vs ≈ 125 kcal. Original Canvas2D code (no Three.js). Stop motion: 15 drawings/s.
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
  if (grams != null) text(g, `${Math.round(grams)} g`, cx, dy + dh * 0.78, `900 ${Math.round(dh * 0.78)}px NDisplay`, INK, 'center', 0, 'fig');
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
// ---------------- legumes: green pea (round, bright), edamame bean (flatter oval, softer green), their pods, cutaways, protein cubes, fat drops
const CARD = '#F8F2E3', GOLD = '#9A6410', PEA = '#5DB33C', PEA_D = '#2F7A1C', EDA = '#8DBA4C', EDA_D = '#4F7A24', OIL = '#EDB93A', PROT = '#3E9A6A', CARB = '#F4EBCF';
function pea(g, x, y, r, jit) { const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05); gr.addColorStop(0, '#B8E58E'); gr.addColorStop(0.55, PEA); gr.addColorStop(1, PEA_D); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = Math.max(1.2, r * 0.07); g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,240,0.75)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.38, r * 0.26, r * 0.16, -0.6, 0, 7); g.fill(); }
function bean(g, x, y, w, h, rot, jit) { g.save(); g.translate(x, y); g.rotate(rot); const gr = g.createRadialGradient(-w * 0.3, -h * 0.35, 2, 0, 0, w * 1.1); gr.addColorStop(0, '#D9EBA8'); gr.addColorStop(0.55, EDA); gr.addColorStop(1, EDA_D); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, w, h, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = Math.max(1.2, w * 0.05); g.stroke(); g.strokeStyle = 'rgba(60,80,20,0.55)'; g.lineWidth = Math.max(1, w * 0.04); g.beginPath(); g.ellipse(0, h * 0.62, w * 0.22, h * 0.12, 0, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,240,0.7)'; g.beginPath(); g.ellipse(-w * 0.35, -h * 0.4, w * 0.25, h * 0.14, -0.3, 0, 7); g.fill(); g.restore(); }
function podShape(len, wid, bumps, fuzz) { const p = []; for (let i = 0; i <= 40; i++) { const t = i / 40, x = lerp(-len / 2, len / 2, t), env = Math.sin(Math.PI * t) ** 0.6; const b = 1 + 0.12 * Math.abs(Math.sin(t * Math.PI * bumps)); p.push([x, -wid * env * b]); } for (let i = 40; i >= 0; i--) { const t = i / 40, x = lerp(-len / 2, len / 2, t), env = Math.sin(Math.PI * t) ** 0.6; p.push([x, wid * 0.35 * env]); } return p; }
function pod(g, cx, cy, len, wid, rot, kind, open, jit) {
  /* kind 'pea': smooth bright pod with 6 peas; 'eda': fuzzy muted pod with 3 beans. open 0..1 splits the halves apart */
  g.save(); g.translate(cx, cy); g.rotate(rot); const n = kind === 'pea' ? 6 : 3, col = kind === 'pea' ? '#58A835' : '#7FA147', dk = kind === 'pea' ? '#2E6E1C' : '#4C6A22';
  const shp = podShape(len, wid, n, kind === 'eda');
  const half = (sd) => { g.save(); g.translate(0, sd * open * wid * 0.9); g.rotate(sd * open * 0.12); const gr = g.createLinearGradient(0, -wid, 0, wid); gr.addColorStop(0, col); gr.addColorStop(1, dk); g.fillStyle = gr; poly(g, shp.map(([x, y]) => [x, y * sd * (sd > 0 ? 0.6 : 1)])); g.fill(); burin(g, shp.map(([x, y]) => [x, y * sd * (sd > 0 ? 0.6 : 1)]), 2.2, INK, 1, jit); if (kind === 'eda') { const q = rng(sd > 0 ? 3 : 4); for (let i = 0; i < 60; i++) { const t = q(), x = lerp(-len / 2, len / 2, t), y = -wid * Math.sin(Math.PI * t) ** 0.6 * (sd > 0 ? -0.6 : 1); g.strokeStyle = 'rgba(230,236,200,0.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 6, y - sd * 6); g.stroke(); } } g.restore(); };
  half(-1);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = lerp(-len / 2 * 0.8, len / 2 * 0.8, t); if (kind === 'pea') pea(g, x, -wid * 0.1, wid * 0.42, jit); else bean(g, x, -wid * 0.1, wid * 0.62, wid * 0.42, 0.1, jit); }
  if (open < 0.98) { g.save(); g.globalAlpha *= 1 - open; half(1); g.restore(); }
  g.restore();
}
function softGlow(g, x, y, r, col, a) { if (a <= 0) return; const gg = g.createRadialGradient(x, y, 4, x, y, r); gg.addColorStop(0, col.replace('A', `${a}`)); gg.addColorStop(1, col.replace('A', '0')); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
// ---------------- A: hook: two pods burst open; GREEN PEAS = EDAMAME ... then ≠
function sceneHook(g, f, jit) {
  const op = eo(seg(f, E.podPop, E.podPop + 16));
  softGlow(g, 300, 1060, 360, 'rgba(255,240,170,A)', 0.55); softGlow(g, 780, 1060, 360, 'rgba(255,240,170,A)', 0.55);
  pod(g, 290, 1060, 470, 76, -0.4, 'pea', op, jit); pod(g, 790, 1060, 430, 84, 0.4, 'eda', op, jit);
  if (op > 0 && op < 1) for (const [cx, k] of [[300, 'pea'], [780, 'eda']]) for (let i = 0; i < 3; i++) { const an = -1.2 + i * 0.9, d = 120 * op; if (k === 'pea') pea(g, cx + Math.cos(an) * d * 1.3, 990 + Math.sin(an) * d - 80 * Math.sin(Math.PI * op), 24, jit); else bean(g, cx + Math.cos(an) * d * 1.3, 990 + Math.sin(an) * d - 80 * Math.sin(Math.PI * op), 30, 20, an, jit); }
  const nm = seg(f, E.names, E.names + 8); bigLabel(g, 'GREEN PEAS', 310, 1330, 60, PEA_D, nm, 0); bigLabel(g, 'EDAMAME', 780, 1330, 60, EDA_D, seg(f, E.names + 4, E.names + 12), 0);
  const eq = seg(f, E.names + 8, E.names + 16), ne = seg(f, E.neq, E.neq + 8);
  if (eq > 0) { bigLabel(g, ne > 0.5 ? '≠' : '=', 540, 1110, 170, ne > 0.5 ? RED : INK, eq, 0); }
  if (ne > 0) { g.save(); g.globalAlpha *= ne * (1 - seg(f, E.burnish - 6, E.burnish)); text(g, 'per 100 g', 540, 760, '900 52px NDisplay', INK2, 'center', 0, 'fig'); g.restore(); }
}
// ---------------- B: super hook: one pea and one bean, big, side by side, with a "?"
function sceneQuestion(g, f, jit) {
  const a = seg(f, E.zoom, E.zoom + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  softGlow(g, 540, 1000, 420, 'rgba(255,240,170,A)', 0.5); pea(g, 330, 1020, 120 * (0.8 + 0.2 * eo(a)), jit); bean(g, 760, 1020, 150 * (0.8 + 0.2 * eo(a)), 105 * (0.8 + 0.2 * eo(a)), 0.15, jit);
  bigLabel(g, '?', 545, 800, 190, RED, seg(f, E.q, E.q + 8), 0.1); g.restore();
}
// ---------------- C: inside: the edamame bean (protein + oil), then the pea (mostly carbs)
function cutBean(g, cx, cy, w, h, t, f, jit) {
  bean(g, cx, cy, w, h, 0, jit); const iw = w * 0.86, ih = h * 0.84;
  g.save(); g.beginPath(); g.ellipse(cx, cy, iw, ih, 0, 0, 7); g.clip(); g.fillStyle = '#EEF3C8'; g.fillRect(cx - w, cy - h, 2 * w, 2 * h);
  const q = rng(12); for (let i = 0; i < 90; i++) { const x = cx + (q() - 0.5) * 2 * iw, y = cy + (q() - 0.5) * 2 * ih; if (i / 90 > t) continue; if (i % 2) { g.fillStyle = OIL; g.beginPath(); g.arc(x, y, 9 + q() * 6, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,80,10,0.7)'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,255,230,0.8)'; g.beginPath(); g.arc(x - 3, y - 3, 3, 0, 7); g.fill(); } else { g.fillStyle = PROT; g.fillRect(x - 7, y - 7, 14, 14); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(x - 7, y - 7, 14, 14); } }
  g.restore(); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, iw, ih, 0, 0, 7); g.stroke();
}
function cutPea(g, cx, cy, r, t, f, jit) {
  pea(g, cx, cy, r, jit); const ir = r * 0.86;
  g.save(); g.beginPath(); g.arc(cx, cy, ir, 0, 7); g.clip(); g.fillStyle = '#E9F2C9'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  const q = rng(21); for (let i = 0; i < 70; i++) { const a = q() * 6.283, d = Math.sqrt(q()) * ir, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (i / 70 > t) continue; g.fillStyle = CARB; g.beginPath(); g.ellipse(x, y, 16, 11, q() * 3, 0, 7); g.fill(); g.strokeStyle = 'rgba(22,32,26,0.55)'; g.lineWidth = 1.2; g.stroke(); }
  for (let i = 0; i < 6; i++) { const a = q() * 6.283, d = Math.sqrt(q()) * ir * 0.8; if (i / 6 > t) continue; g.fillStyle = PROT; g.fillRect(cx + Math.cos(a) * d - 6, cy + Math.sin(a) * d - 6, 12, 12); }
  g.restore(); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, ir, 0, 7); g.stroke();
}
function sceneInside(g, f, jit) {
  const a = seg(f, E.bean, E.bean + 10); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const sw = eio(seg(f, E.pea - 8, E.pea + 10));
  if (sw < 1) { g.save(); g.globalAlpha *= 1 - sw; g.translate(-260 * sw, 0); softGlow(g, 540, 1000, 380, 'rgba(255,230,140,A)', 0.45); cutBean(g, 540, 1000, 300, 210, seg(f, E.bean + 4, E.beanLbl + 10), f, jit); bigLabel(g, 'PROTEIN + OIL', 540, 1330, 70, EDA_D, seg(f, E.beanLbl, E.beanLbl + 8) * (1 - seg(sw, 0, 0.4)), 0); bigLabel(g, 'EDAMAME', 540, 700, 60, INK, seg(f, E.bean + 4, E.bean + 12), 0); g.restore(); }
  if (sw > 0) { g.save(); g.globalAlpha *= sw; g.translate(260 * (1 - sw), 0); softGlow(g, 540, 1000, 380, 'rgba(230,245,200,A)', 0.5); cutPea(g, 540, 1000, 250, seg(f, E.pea, E.peaLbl + 10), f, jit); bigLabel(g, 'MOSTLY CARBS', 540, 1330, 70, PEA_D, seg(f, E.peaLbl, E.peaLbl + 8), 0); bigLabel(g, 'GREEN PEA', 540, 700, 60, INK, seg(f, E.pea + 4, E.pea + 12), 0); g.restore(); }
  /* legend chips (one line, big) */
  g.restore();
}
// ---------------- D: per 100 g cooked: protein cubes (1 cube = 1 g) and fat drops; then kcal roundels
function scenePer100(g, f, jit) {
  const a = seg(f, E.dishes, E.dishes + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  bigLabel(g, '100 g COOKED', 540, 650, 58, INK, a * (1 - seg(f, E.kcal - 8, E.kcal)), 0);
  for (const [cx, kind] of [[290, 'eda'], [790, 'pea']]) { softShadow(g, cx, 1405, 200, 18, 0.2); const dp = ell(cx, 1390, 210, 38, 0, 6.283, 40); g.fillStyle = '#FDFBF4'; poly(g, dp); g.fill(); burin(g, dp, 2.2, INK, 1, jit); const q = rng(kind === 'eda' ? 5 : 6); for (let i = 0; i < 26; i++) { const x = cx + (q() - 0.5) * 300, y = 1382 - q() * 30; if (kind === 'eda') bean(g, x, y, 24, 16, q() * 3, jit); else pea(g, x, y, 17, jit); } bigLabel(g, kind === 'eda' ? 'EDAMAME' : 'PEAS', cx, 1462, 42, kind === 'eda' ? EDA_D : PEA_D, a, 0); }
  /* protein: green cubes, one per gram, stacking up from the dish */
  const pr = seg(f, E.prot - 4, E.prot + 26);
  const stack = (cx, n, t) => { for (let i = 0; i < Math.floor(n * t); i++) { const col = i % 4, row = Math.floor(i / 4), x = cx - 108 + col * 54, y = 1300 - row * 54; g.fillStyle = PROT; g.fillRect(x, y, 50, 50); g.strokeStyle = INK; g.lineWidth = 1.8; g.strokeRect(x, y, 50, 50); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 5, y + 5, 18, 9); } };
  stack(290, 12, pr); stack(790, 5, pr);
  bigLabel(g, '12 g PROTEIN', 305, 1120, 50, PROT, seg(f, E.prot + 20, E.prot + 28), 0); bigLabel(g, '5 g PROTEIN', 780, 1220, 50, PROT, seg(f, E.prot + 24, E.prot + 32), 0);
  /* fat: gold drops fall in */
  const ft = seg(f, E.fat - 4, E.fat + 20);
  if (ft > 0) { for (let i = 0; i < 5; i++) { const t = clamp(ft * 5 - i); if (t <= 0) continue; const x = 150 + i * 70, y = lerp(760, 990, eo(t)); g.fillStyle = OIL; g.beginPath(); g.moveTo(x, y - 36); g.quadraticCurveTo(x + 26, y, x, y + 24); g.quadraticCurveTo(x - 26, y, x, y - 36); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(255,255,230,0.8)'; g.beginPath(); g.ellipse(x - 7, y - 4, 4, 7, -0.3, 0, 7); g.fill(); }
    const t2 = clamp(ft * 5); const x = 790, y = lerp(760, 990, eo(t2)); g.fillStyle = OIL; g.beginPath(); g.moveTo(x, y - 8); g.quadraticCurveTo(x + 6, y, x, y + 5); g.quadraticCurveTo(x - 6, y, x, y - 8); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    bigLabel(g, '5 g FAT', 290, 1060 - 140, 54, GOLD, seg(f, E.fat + 14, E.fat + 22) * (1 - seg(f, E.kcal - 6, E.kcal)), 0); bigLabel(g, '≈ 0 g FAT', 790, 1060 - 140, 54, GOLD, seg(f, E.fat + 18, E.fat + 26) * (1 - seg(f, E.kcal - 6, E.kcal)), 0); }
  const k = seg(f, E.kcal, E.kcal + 10); if (k > 0) { drawRoundel(g, 290, 720, 125, '121', 'kcal', '#8A4E1C', k + (f > E.kcal + 10 ? 1 : 0), jit); drawRoundel(g, 790, 720, 125, '78', 'kcal', PEA_D, seg(f, E.kcal + 4, E.kcal + 14) + (f > E.kcal + 14 ? 1 : 0), jit); }
  g.restore();
}
// ---------------- E: payoff: one cup each as a snack: ≈ 2× protein for ≈ 60 more kcal
function cupBowl(g, cx, cy, rx, kind, jit) {
  const ry = rx * 0.2, depth = rx * 0.6; softShadow(g, cx, cy + depth + 12, rx * 0.72, rx * 0.08, 0.26);
  g.fillStyle = '#E9E3D3'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
  const q = rng(kind === 'eda' ? 31 : 32), pts = []; for (let i = 0; i < 70; i++) { const u = q() * 2 - 1, v = q(); pts.push([u * rx * 0.88, -v * rx * 0.45 * (1 - u * u * 0.85), q() * 3]); } pts.sort((a, b) => a[1] - b[1]).reverse().forEach(([x, y, r]) => { if (kind === 'eda') bean(g, cx + x, cy + y, rx * 0.13, rx * 0.09, r, jit); else pea(g, cx + x, cy + y, rx * 0.085, jit); });
  const front = [...Array.from({ length: 31 }, (_, i) => { const a = Math.PI * (i / 30); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }), ...Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [lerp(cx - rx, cx + rx, t), cy + ry * 0.3 + depth * Math.pow(Math.sin(Math.PI * t), 0.6)]; }).reverse()];
  g.save(); poly(g, front); g.clip(); const bg = g.createLinearGradient(cx - rx, 0, cx + rx, 0); bg.addColorStop(0, '#C9C2AE'); bg.addColorStop(0.35, '#FBF8EE'); bg.addColorStop(0.7, '#EDE6D2'); bg.addColorStop(1, '#BDB59F'); g.fillStyle = bg; g.fillRect(cx - rx - 2, cy - ry, 2 * rx + 4, depth + ry * 2 + 4); g.strokeStyle = '#2C6E9E'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - rx, cy + ry * 1.6); g.quadraticCurveTo(cx, cy + ry * 2.6, cx + rx, cy + ry * 1.6); g.stroke(); g.restore();
  burin(g, front, 2.4, INK, 1, jit); g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy, rx - 3, ry - 2, 0, 0.05, Math.PI - 0.05); g.stroke();
  text(g, '1 CUP', cx, cy + depth * 0.66, `900 ${Math.round(rx * 0.24)}px NDisplay`, INK, 'center', 1, 'fig');
}
function scenePayoff(g, f, jit) {
  const a = seg(f, E.cups, E.cups + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  drawScale(g, 290, 1150, 300, 155, jit, 0); cupBowl(g, 290, 1000, 200, 'eda', jit); drawScale(g, 790, 1150, 300, 160, jit, 0); cupBowl(g, 790, 1000, 200, 'pea', jit);
  bigLabel(g, 'EDAMAME', 290, 690, 50, EDA_D, a, 0); bigLabel(g, 'PEAS', 790, 690, 50, PEA_D, a, 0);
  const p = seg(f, E.protCup, E.protCup + 10); drawRoundel(g, 290, 800, 95, '18 g', 'protein', PROT, p + (f > E.protCup + 10 ? 1 : 0), jit); drawRoundel(g, 790, 800, 95, '8 g', 'protein', PROT, seg(f, E.protCup + 4, E.protCup + 14) + (f > E.protCup + 14 ? 1 : 0), jit);
  bigLabel(g, '≈ 2×', 540, 820, 80, PROT, seg(f, E.protCup + 10, E.protCup + 18), 0);
  const k = seg(f, E.kcalCup, E.kcalCup + 10); if (k > 0) { bigLabel(g, '≈ 188 kcal', 290, 1410, 54, '#8A4E1C', k * (1 - seg(f, E.cta - 4, E.cta + 4)), 0); bigLabel(g, '≈ 125 kcal', 790, 1410, 54, PEA_D, seg(f, E.kcalCup + 4, E.kcalCup + 12) * (1 - seg(f, E.cta - 4, E.cta + 4)), 0); bigLabel(g, '+ ≈ 60', 540, 1330, 60, RED, seg(f, E.kcalCup + 10, E.kcalCup + 18) * (1 - seg(f, E.cta - 4, E.cta + 4)), 0); }
  g.restore();
}
function camera2(f) {
  const keys = [[0, 1.1, 540, 950], [80, 1.0, 540, 1010], [118, 1.0, 540, 1010], [162, 1.05, 540, 990, 1], [176, 1.0, 540, 1010], [320, 1.05, 540, 1000, 1], [334, 1.0, 540, 1010], [600, 1.05, 540, 1000, 1], [614, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + 0.025 * Math.exp(-(((f - E.podPop - 8) / 5) ** 2)) + 0.02 * Math.exp(-(((f - E.neq) / 4) ** 2)) + 0.02 * Math.exp(-(((f - E.kcal) / 4) ** 2));
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
const SCENES = [[sceneHook, null, 'burnish'], [sceneQuestion, 'burnish', 'burnish2'], [sceneInside, 'burnish2', 'burnish3'], [scenePer100, 'burnish3', 'burnish4'], [scenePayoff, 'burnish4', null]];
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
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.drawImage(grain, 0, 0);
  softGlow(g, 300, 1150, 380, 'rgba(255,240,170,A)', 0.6); softGlow(g, 780, 1150, 380, 'rgba(255,240,170,A)', 0.6);
  text(g, 'LOOK ALIKE.', 540, 450, '900 140px NDisplay', INK, 'center', -2, 'thumb'); text(g, 'NOT ALIKE.', 540, 600, '900 140px NDisplay', RED, 'center', -2, 'thumb');
  pod(g, 290, 1080, 500, 84, -0.4, 'pea', 0.55, jit); pod(g, 790, 1080, 460, 92, 0.4, 'eda', 0.55, jit);
  text(g, '≠', 540, 1150, '900 190px NDisplay', RED, 'center', 0, 'thumb');
  pea(g, 320, 1420, 105, jit); bean(g, 770, 1420, 130, 92, 0.15, jit);
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
