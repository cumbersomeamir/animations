// CalMeter English 30 s english-06 (2026-11-06): peanuts vs peanut butter, the same 30 g.
// Same accepted style as the English papaya episode (round-02 #01): Copperplate-engraving plate on IVORY #F4EEDC with deep ink
// #16201A, large engraved cutaway, natural washes, same burin, roundels, balance, camera, English caption layout (Inter Display
// Black 58 px, baselines 401/455) and the CalMeter CTA seal. This file is production/30s/2026-11-03-round-02/source/render.mjs
// with the food geometry swapped: a 30 g vs 30 g balance hook, a cracked peanut pod cutaway (shell, two kernels, one split
// with its germ and fat droplets), an engraved jar carrying the real label's ingredient list (USDA FDC branded record 2674433),
// sodium bars, and a level vs heaped tablespoon on the balance. Original Canvas2D code; art direction only from lemo-opuscar
// styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s, each held 2 frames.
// Usage: node render.mjs  |  node render.mjs --still 0,120,300
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
const SHELL = '#E2C48E', SKIN = '#B5553A', KERNEL = '#F4DFAC', PB = '#C98B45', PB_LIGHT = '#DDA867';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const vnoise = (x) => Math.sin(x * 1.7) * 0.5 + Math.sin(x * 3.9 + 1.3) * 0.3 + Math.sin(x * 8.3 + 2.1) * 0.2;

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
// ---------------- small engraved props: a peanut kernel, a tablespoon with peanut butter, a weight
function drawKernel(g, x, y, s, rot, jit) {
  const p = ell(x, y, s * 1.25, s, 0, Math.PI * 2, 28, rot); g.fillStyle = PAPER; poly(g, p); g.fill(); washPts(g, p, SKIN, 0.85);
  burin(g, p, 1.4, INK, 1, jit); burin(g, ell(x, y, s * 0.9, s * 0.15, 0, Math.PI, 10, rot + 0.1), 0.8, 'rgba(22,32,26,0.5)', 1, jit);
  g.fillStyle = 'rgba(255,240,220,0.6)'; g.beginPath(); g.ellipse(x - s * 0.35, y - s * 0.35, s * 0.35, s * 0.18, rot - 0.4, 0, 7); g.fill();
}
const HEAP = (() => { const p = [], rows = [6, 5, 4, 3, 2]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) p.push([(i - (n - 1) / 2) * 25 + (r % 2 ? 4 : -4), -10 - r * 15, ((i * 7 + r * 3) % 9) / 9 * 2.4 - 1.2]); }); return p; })();
function drawPeanutHeap(g, px, py, n, jit) { HEAP.slice(0, n).forEach(([x, y, r]) => drawKernel(g, px + x, py + y, 11, r, jit)); }
function drawSpoon(g, px, py, mound, jit, sc = 1) {   // tablespoon resting on the pan surface py; mound = height of peanut butter above the bowl rim
  g.save(); g.translate(px, py); g.scale(sc, sc);
  const handle = [[30, -16], [128, -46], [132, -38], [34, -8]]; g.fillStyle = '#E6E7E2'; poly(g, handle); g.fill(); burin(g, handle.concat([handle[0]]), 2.0, INK, 1, jit);
  const bowl = ell(-6, -14, 48, 16, 0, Math.PI, 24); g.fillStyle = '#E6E7E2'; poly(g, bowl.concat([[42, -14]])); g.fill(); burin(g, ell(-6, -14, 48, 16, 0, Math.PI, 24), 2.4, INK, 1, jit); burin(g, ell(-6, -14, 48, 6, Math.PI, Math.PI * 2, 20), 1.4, INK, 1, jit);
  if (mound > 0) { const m = []; for (let k = 0; k <= 24; k++) { const t = k / 24, x = -50 + 88 * t; m.push([x, -16 - Math.pow(Math.sin(Math.PI * t), 0.8) * mound]); } const fill = m.concat([[38, -14], [-50, -14]]); g.fillStyle = PAPER; poly(g, fill); g.fill(); washPts(g, fill, PB, 0.95); burin(g, m, 1.8, INK, 1, jit); for (let k = 1; k < 4; k++) { const sw = []; for (let j = 0; j <= 10; j++) { const t = j / 10; sw.push([-36 + 64 * t, -16 - mound * (0.25 + 0.18 * k) * Math.sin(Math.PI * t) + Math.sin(t * 6 + k) * 2]); } burin(g, sw, 0.8, 'rgba(22,32,26,0.45)', 1, jit); } g.fillStyle = 'rgba(255,240,215,0.5)'; g.beginPath(); g.ellipse(-20, -16 - mound * 0.6, 12, 4, -0.2, 0, 7); g.fill(); }
  g.restore();
}
function weightBox(g, x0, w, h, py, label, jit) { burin(g, [[x0, py - 4], [x0, py - h], [x0 + w, py - h], [x0 + w, py - 4]], 2.4, INK, 1, jit); burin(g, [[x0 + w * 0.32, py - h], [x0 + w * 0.32, py - h - 14], [x0 + w * 0.68, py - h - 14], [x0 + w * 0.68, py - h]], 2.0, INK, 1, jit); g.fillStyle = PAPER; g.fillRect(x0 + 1, py - h + 1, w - 2, h - 6); for (let k = 1; k < 5; k++) burin(g, [[x0 + w - k * 5, py - h + 4], [x0 + w - k * 5, py - 8]], 0.7, INK2, 1, jit); text(g, label, x0 + w / 2 - 4, py - h / 2 + 7, '700 22px NText', INK, 'center', 0, 'fig'); }
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
// ---------------- cutaway: a cracked peanut pod (shell section, two kernels, the lower one split: germ + fat droplets)
const P = { x: 540, up: [790, 150, 138], lo: [1072, 162, 150] };   // [cy, ry, rx]
const halfW = (y) => { const f = ([cy, ry, rx]) => { const t = (y - cy) / ry; return Math.abs(t) < 1 ? rx * Math.sqrt(1 - t * t) : 0; }; const a = f(P.up), b = f(P.lo); const k = 22; return Math.max(a, b, (a + b) / 2 + 0 * k) ; };
const Y0 = P.up[0] - P.up[1], Y1 = P.lo[0] + P.lo[1];
const outline = (inset) => { const L = [], R = []; for (let k = 0; k <= 80; k++) { const y = lerp(Y0 + inset, Y1 - inset, k / 80); const w = Math.max(0, halfW(y) - inset); L.push([P.x - w, y]); R.push([P.x + w, y]); } return L.concat(R.reverse()); };
const OUT = outline(0), INN = outline(22);
const KUP = { x: 540, y: 792, rx: 106, ry: 116, rot: 0.06 }, KLO = { x: 540, y: 1072, rx: 116, ry: 126, rot: -0.05 };
const DROPS = (() => { const r = rng(71), o = []; for (let i = 0; i < 2000 && o.length < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.86; const x = KLO.x + Math.cos(a) * KLO.rx * d, y = KLO.y + Math.sin(a) * KLO.ry * d; if (y < KLO.y - KLO.ry * 0.55) continue; const s = 3 + r() * 5; if (o.every((q) => Math.hypot(q[0] - x, q[1] - y) > q[2] + s + 3)) o.push([x, y, s]); } return o; })();
const RETIC = (() => { const r = rng(43), o = []; for (let i = 0; i < 70; i++) { const y = lerp(Y0 + 6, Y1 - 6, r()), side = r() < 0.5 ? -1 : 1, w = halfW(y); const x = P.x + side * (w - 11); o.push([[x - 9, y - 6], [x + 9, y + 6]], [[x - 9, y + 6], [x + 9, y - 6]]); } return o; })();
function drawPod(g, r, jit, wa, glow) {
  g.save(); g.fillStyle = PAPER; poly(g, OUT); g.fill(); g.restore();
  if (wa > 0) { g.save(); poly(g, OUT); INN.slice().reverse().forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip('evenodd'); g.globalCompositeOperation = 'multiply'; g.globalAlpha = eo(wa); g.fillStyle = SHELL; g.fillRect(0, 0, W, H); g.restore();
    g.save(); poly(g, INN); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6 * eo(wa); g.fillStyle = '#F6EAD0'; g.fillRect(0, 0, W, H); g.restore(); }
  burin(g, OUT, 3.6, INK, seg(r, 0, 0.25), jit); burin(g, INN, 1.8, INK, seg(r, 0.1, 0.35), jit);
  const rr = seg(r, 0.2, 0.5); RETIC.forEach((s, i) => { if (i / RETIC.length < rr) burin(g, s, 1.0, 'rgba(22,32,26,0.55)', 1, jit); });   // shell section: reticulated fibres
  for (let i = 0; i < 26; i++) { const y = lerp(Y0 + 30, Y1 - 30, i / 26), w = halfW(y) - 26; if (w < 10) continue; burin(g, [[P.x + w - 4, y], [P.x + w - 26, y + 8]], 0.8, INK2, seg(r, 0.3, 0.6), jit); }   // shade inside the right wall
  // upper kernel: whole, red-brown skin
  const ku = ell(KUP.x, KUP.y, KUP.rx, KUP.ry, 0, Math.PI * 2, 60, KUP.rot); const kr = seg(r, 0.35, 0.7);
  if (kr > 0) { g.save(); g.fillStyle = PAPER; poly(g, ku); g.fill(); g.restore(); washPts(g, ku, SKIN, 0.9 * eo(wa)); burin(g, ku, 2.8, INK, kr, jit);
    for (let i = 1; i < 12; i++) { const t = i / 12; burin(g, ell(KUP.x + 8, KUP.y, KUP.rx * (1 - t * 0.85), KUP.ry * (1 - t * 0.85), -0.4, 1.6, 16, KUP.rot), 0.9, 'rgba(22,32,26,0.45)', clamp(kr * 1.5 - 0.3), jit); }
    for (let i = 0; i < 9; i++) burin(g, [[KUP.x - 60 + i * 15, KUP.y - 70 + Math.abs(i - 4) * 8], [KUP.x - 62 + i * 15, KUP.y + 80 - Math.abs(i - 4) * 9]], 0.6, 'rgba(22,32,26,0.35)', clamp(kr * 1.4 - 0.4), jit);   // skin veins
    g.fillStyle = 'rgba(255,236,220,0.55)'; g.beginPath(); g.ellipse(KUP.x - 40, KUP.y - 52, 26, 11, -0.6, 0, 7); g.fill(); }
  // lower kernel: split face (cream cotyledon, red-brown skin rim, germ at the top, fat droplets)
  const kl = ell(KLO.x, KLO.y, KLO.rx, KLO.ry, 0, Math.PI * 2, 60, KLO.rot), kli = ell(KLO.x, KLO.y, KLO.rx - 9, KLO.ry - 9, 0, Math.PI * 2, 60, KLO.rot); const lr = seg(r, 0.45, 0.85);
  if (lr > 0) { g.save(); g.fillStyle = PAPER; poly(g, kl); g.fill(); g.restore(); washPts(g, kl, SKIN, 0.9 * eo(wa)); g.save(); g.fillStyle = PAPER; poly(g, kli); g.fill(); g.restore(); washPts(g, kli, KERNEL, eo(wa));
    burin(g, kl, 2.8, INK, lr, jit); burin(g, kli, 1.2, INK, lr, jit);
    const germ = ell(KLO.x, KLO.y - KLO.ry + 40, 14, 30, 0, Math.PI * 2, 24, 0); washPts(g, germ, '#E3B36A', eo(wa)); burin(g, germ, 1.6, INK, lr, jit); burin(g, [[KLO.x, KLO.y - KLO.ry + 14], [KLO.x, KLO.y - KLO.ry + 66]], 0.8, INK2, lr, jit);
    for (let i = 1; i < 7; i++) { const t = i / 7; burin(g, ell(KLO.x + 10, KLO.y + 10, (KLO.rx - 12) * (1 - t * 0.8), (KLO.ry - 12) * (1 - t * 0.8), -0.2, 1.4, 14, KLO.rot), 0.8, 'rgba(22,32,26,0.35)', clamp(lr * 1.5 - 0.4), jit); }
    const dr = seg(r, 0.6, 1.0); DROPS.forEach(([x, y, s], i) => { if (i / DROPS.length > dr) return; const jx = (jit() - 0.5) * 1.2, jy = (jit() - 0.5) * 1.2; g.fillStyle = `rgba(240,190,62,${0.55 + 0.4 * glow})`; g.beginPath(); g.arc(x + jx, y + jy, s * (1 + 0.15 * glow), 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 0.9; g.stroke(); }); }
}
// ---------------- the jar with the real label's ingredient list (USDA FDC branded record 2674433)
const JAR = { x0: 304, x1: 776, y0: 676, y1: 1220 };
const LABEL_LINES = [['CREAMY PEANUT BUTTER', '900 30px NDisplay', 0], ['INGREDIENTS:', '700 19px NText', 0], ['ROASTED PEANUTS, SUGAR,', '700 24px NText', 1], ['HYDROGENATED VEGETABLE OIL', '700 24px NText', 2], ['(COTTONSEED, SOYBEAN AND', '600 19px NText', 0], ['RAPESEED OIL) TO PREVENT', '600 19px NText', 0], ['SEPARATION, SALT', '700 24px NText', 3]];
function drawJar(g, f, r, jit) {
  const { x0, x1, y0, y1 } = JAR, R = 46;
  const body = []; body.push(...ell(x0 + R, y0 + 70 + R, R, R, Math.PI, Math.PI * 1.5, 10)); body.push(...ell(x1 - R, y0 + 70 + R, R, R, Math.PI * 1.5, Math.PI * 2, 10)); body.push(...ell(x1 - R, y1 - R, R, R, 0, Math.PI * 0.5, 10)); body.push(...ell(x0 + R, y1 - R, R, R, Math.PI * 0.5, Math.PI, 10));
  g.save(); g.fillStyle = PAPER; poly(g, body); g.fill(); g.restore(); washPts(g, body, PB, 0.9 * eo(r));
  const lid = [[x0 + 20, y0], [x1 - 20, y0], [x1 - 14, y0 + 66], [x0 + 14, y0 + 66]]; g.save(); g.fillStyle = PAPER; poly(g, lid); g.fill(); g.restore(); washPts(g, lid, '#9DA59A', 0.8 * eo(r));
  burin(g, body.concat([body[0]]), 3.4, INK, seg(r, 0, 0.4), jit); burin(g, lid.concat([lid[0]]), 2.8, INK, seg(r, 0.1, 0.4), jit);
  for (let i = 1; i < 28; i++) burin(g, [[x0 + 14 + i * 16, y0 + 6], [x0 + 12 + i * 16, y0 + 60]], 0.8, INK2, seg(r, 0.2, 0.5), jit);   // lid knurling
  for (let i = 0; i < 18; i++) { const x = x1 - 18 - i * 4; burin(g, [[x, y0 + 110], [x, y1 - 30]], 0.8, `rgba(22,32,26,${0.5 - i * 0.025})`, seg(r, 0.25, 0.6), jit); }   // glass shade, right
  g.save(); g.strokeStyle = 'rgba(255,250,235,0.7)'; g.lineWidth = 8; g.beginPath(); g.moveTo(x0 + 26, y0 + 140); g.lineTo(x0 + 26, y1 - 60); g.stroke(); g.restore();   // glass highlight
  const lx0 = x0 + 28, lx1 = x1 - 28, ly0 = y0 + 166, ly1 = y1 - 70;   // paper label
  if (r > 0.3) { g.fillStyle = '#FBF6E8'; g.fillRect(lx0, ly0, lx1 - lx0, ly1 - ly0); burin(g, [[lx0, ly0], [lx1, ly0], [lx1, ly1], [lx0, ly1], [lx0, ly0]], 2.0, INK, seg(r, 0.3, 0.6), jit); }
  const tr = seg(r, 0.5, 1.0);
  LABEL_LINES.forEach(([s, font, hl], i) => { if (i / LABEL_LINES.length > tr) return; const y = ly0 + 54 + i * 40 + (i > 0 ? 14 : 0); text(g, s, 540, y, font, INK, 'center', 0, 'label');
    const ev = hl === 1 ? E.sugar : hl === 2 ? E.oil : hl === 3 ? E.salt : null; if (ev == null) return; const q = seg(f, ev, ev + 10); if (q <= 0) return;
    g.font = font; const full = g.measureText(s).width; let a0, a1; if (hl === 1) { const pre = g.measureText('ROASTED PEANUTS, ').width; a0 = 540 - full / 2 + pre; a1 = a0 + g.measureText('SUGAR').width; } else if (hl === 2) { a0 = 540 - full / 2; a1 = 540 + full / 2; } else { const pre = g.measureText('SEPARATION, ').width; a0 = 540 - full / 2 + pre; a1 = a0 + g.measureText('SALT').width; }
    burin(g, [[a0 - 4, y + 7], [lerp(a0 - 4, a1 + 4, q), y + 8]], 3.2, RED, 1, jit); if (q >= 1) burin(g, ell((a0 + a1) / 2, y - 9, (a1 - a0) / 2 + 12, 22, -0.2, Math.PI * 2 - 0.2, 40), 1.6, RED, seg(f, ev + 4, ev + 16), jit); });
}
function drawSodium(g, f, jit, out) {
  const r = seg(f, E.sodium, E.sodium + 12); if (r <= 0 || out >= 1) return;
  g.save(); g.globalAlpha = 1 - out; const x0 = 150, xMax = 930, sc = (xMax - x0 - 10) / 150, gr = eo(seg(f, E.sodiumGrow, E.sodiumGrow + 56)), hk = seg(f, E.sodiumGrow + 40, E.sodiumGrow + 86);
  text(g, 'SODIUM PER 30 G', x0, 1280, '700 20px NText', INK2, 'left', 3, 'fig');
  const bar = (y, val, label, col) => { const w = Math.max(3, val * sc * gr); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(x0, y, w, 38); g.restore(); burin(g, [[x0, y], [x0 + w, y], [x0 + w, y + 38], [x0, y + 38], [x0, y]], 1.8, INK, r * 1.3, jit); for (let i = 0; i < Math.floor((w / 12) * hk); i++) burin(g, [[x0 + 6 + i * 12, y + 34], [x0 + 18 + i * 12, y + 4]], 0.9, 'rgba(22,32,26,0.5)', 1, jit); text(g, label, x0, y + 70, '700 22px NText', INK, 'left', 0, 'fig'); };
  bar(1298, 1.8, 'Peanuts, dry-roasted, unsalted: 2 mg', '#E2C48E'); bar(1392, 140.6, `Peanut butter (label): ≈ ${Math.round(141 * gr)} mg`, PB);
  g.restore();
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'kcalPeanut', big: '176', unit: 'kcal / 30 g', name: 'PEANUTS', motif: 'kernels', from: [KUP.x - 40, KUP.y + 20], fig: 2 },
  { ev: 'kcalButter', big: '178', unit: 'kcal / 30 g', name: 'PEANUT BUTTER', motif: 'swirl', from: [KLO.x + 40, KLO.y + 40], fig: 3 },
];
function motif(g, kind, r, f, jit) {
  const R = RR - 10;
  if (kind === 'kernels') { const q = rng(19); for (let i = 0; i < 9; i++) { if (i / 9 > r) continue; const a = q() * 6.28, d = 30 + q() * 50; g.save(); g.globalAlpha = 0.45; drawKernel(g, Math.cos(a) * d, Math.sin(a) * d, 10, q() * 3, jit); g.restore(); } }
  if (kind === 'swirl') for (let i = 0; i < 5; i++) { const p = []; for (let k = 0; k <= 40; k++) { const t = k / 40, a = t * 9 + i * 1.2, rr = 8 + t * R * 0.8; p.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.7]); } burin(g, p, 1.2, 'rgba(201,139,69,0.6)', r, jit); }
}
function drawRoundel(g, fact, slotXY, f, jit, out) {
  const t0 = E[fact.ev], p = seg(f, t0 - 4, t0 + 14); if (p <= 0 || out >= 1) return;
  const [sx, sy] = slotXY; const k = eo(p); const x = lerp(fact.from[0], sx, k), y = lerp(fact.from[1], sy, k) - Math.sin(Math.PI * k) * 60;
  const sc = Math.exp(Math.log(0.25) * (1 - k));
  if (p >= 1 && out <= 0) { const lp = seg(f, t0 + 14, t0 + 24), dx = fact.from[0] - sx, dy = fact.from[1] - sy, dl = Math.hypot(dx, dy); const rx = sx + (dx / dl) * (RR * sc + 10), ry = sy + (dy / dl) * (RR * sc + 10);
    g.save(); g.strokeStyle = 'rgba(22,32,26,0.6)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(rx, ry); g.lineTo(lerp(rx, fact.from[0], lp), lerp(ry, fact.from[1], lp)); g.stroke(); if (lp >= 1) { g.fillStyle = INK; g.beginPath(); g.arc(fact.from[0], fact.from[1], 4.5, 0, 7); g.fill(); } g.restore(); }
  g.save(); g.translate(x, y); g.scale(sc, sc); if (out > 0) g.globalAlpha = 1 - out;
  g.save(); g.beginPath(); g.arc(0, 0, RR, 0, 7); g.clip(); g.fillStyle = '#FBF6E8'; g.fillRect(-RR, -RR, 2 * RR, 2 * RR);
  g.strokeStyle = 'rgba(22,32,26,0.10)'; g.lineWidth = 1; for (let yy = -RR; yy < RR; yy += 6) { g.beginPath(); g.moveTo(-RR, yy); g.lineTo(RR, yy); g.stroke(); }
  motif(g, fact.motif, seg(f, t0, t0 + 14), f, jit); g.restore();
  const ring = seg(f, t0 - 4, t0 + 6);
  g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.arc(0, 0, RR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, RR + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke();
  const lt = seg(f, t0 + 10, t0 + 18);
  if (lt > 0) { text(g, fact.big.slice(0, Math.max(1, Math.ceil(fact.big.length * lt))), 0, 2, '900 56px NDisplay', INK, 'center', 0, 'roundel'); if (lt >= 1) { text(g, fact.unit, 0, 36, '700 21px NText', LEAFDARK, 'center', 0, 'roundel'); text(g, fact.name, 0, 66, `700 ${fact.name.length > 10 ? 14 : 17}px NText`, INK2, 'center', fact.name.length > 10 ? 2 : 3, 'roundel'); } }
  if (p >= 1) text(g, `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- paper (ivory, laid lines + fibres)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
// ---------------- camera: loupe at the start, then a <= 2 % breathing push; never lifts the plate into the caption band
function camera(f) { const keys = [[0, 1.18, 540, 870], [56, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [900, 1.0, 540, 1010]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const t = eio(seg(f, f0, f1)); return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
// ---------------- captions (screen-fixed, ink y 350-470)
function captions(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out); const lines = [];
    for (const r of c.lines) { if (r.length > 2) lines[r[2]].push(r); else lines.push([r]); }
    lines.forEach((runs, li) => { const font = '900 58px NDisplay'; g.font = font; const total = runs.reduce((a, r) => a + g.measureText(r[0]).width, 0); let x = 540 - total / 2; const y = li === 0 ? 401 : 455;
      for (const [s, f0] of runs) { const a = seg(f, f0, f0 + 6) * (1 - out); g.save(); g.globalAlpha = a; x += text(g, s, x, y, font, li === 0 ? INK : LEAFDARK, 'left', 0, 'caption'); g.restore(); } });
  }
}
// ---------------- notes with dotted leaders (cut letter by letter)
function note(g, f, t0, from, to, head, sub, fade) {
  const lp = seg(f, t0, t0 + 10); if (lp <= 0 || fade <= 0) return;
  g.save(); g.globalAlpha = fade; g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] - 36, lp)); g.stroke(); g.setLineDash([]);
  g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4.5, 0, 7); g.fill();
  const tl = seg(f, t0 + 6, t0 + 16);
  if (tl > 0) { text(g, head.slice(0, Math.ceil(head.length * tl)), to[0], to[1] - 10, '900 30px NDisplay', INK, 'center', 0); if (tl >= 1) text(g, sub, to[0], to[1] + 18, '600 18px NText', LEAFDARK, 'center', 0); }
  g.restore();
}
// ---------------- CTA cartouche (engraved seal with the approved app icon + cut CalMeter wordmark), inside the plate
function drawCTA(g, f, jit) {
  const r = seg(f, E.cta, E.cta + 14); if (r <= 0) return;
  g.font = '900 76px NDisplay'; const ww = g.measureText('CalMeter').width; const R0 = 58, gap = 26, x0 = 540 - (2 * R0 + gap + ww) / 2, cx = x0 + R0, cy = 1352;
  g.save(); g.fillStyle = '#FBF6E8'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.restore();
  g.save(); g.globalAlpha = r; g.beginPath(); g.arc(cx, cy, R0 - 6, 0, 7); g.clip(); g.drawImage(icon, cx - R0 + 4, cy - R0 + 4, 2 * R0 - 8, 2 * R0 - 8); g.restore();
  g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke(); g.lineWidth = 1.1; g.beginPath(); g.arc(cx, cy, R0 + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); g.stroke();
  const wr = seg(f, E.ctaWord, E.ctaWord + 24), s = 'CalMeter';
  if (wr > 0) text(g, s.slice(0, Math.ceil(s.length * wr)), cx + R0 + gap, cy + 27, '900 76px NDisplay', INK, 'left', 0, 'cta');
  const rl = seg(f, E.ctaWord + 16, E.ctaWord + 40); if (rl > 0) burin(g, [[cx + R0 + gap, cy + 52], [cx + R0 + gap + ww * rl, cy + 52]], 2.2, LEAFDARK, 1, jit);
  const tk = seg(f, E.ctaWord + 26, E.ctaWord + 106); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
const sweep = (f, t0) => { const b = seg(f, t0, t0 + 20); return { b, x: lerp(100, 1000, b) }; };
function sweepBand(g, s) { if (s.b > 0 && s.b < 1) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(s.x, 640); g.lineTo(s.x, 1490); g.stroke(); g.restore(); } }
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0);
  // plate mark (pressed bevel), ruled border, cut title
  g.fillStyle = 'rgba(22,32,26,0.04)'; g.fillRect(62, 528, 956, 984);
  g.strokeStyle = 'rgba(90,182,38,0.55)'; g.lineWidth = 5; g.strokeRect(62, 528, 956, 984);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(74, 540, 932, 960); g.strokeStyle = INK2; g.lineWidth = 0.8; g.strokeRect(84, 550, 912, 940);
  const tt = seg(f, E.title, E.title + 22);
  if (tt > 0) { const t1 = 'PLATE VIII', t2 = 'PEANUTS & PEANUT BUTTER'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- A: hook balance, 30 g peanuts vs 30 g peanut butter, level
  const sB = sweep(f, E.burnish);
  if (sB.b < 1) {
    g.save(); if (sB.b > 0) { g.beginPath(); g.rect(sB.x, 0, W, H); g.clip(); }
    const pIn = seg(f, E.peanutsIn - 6, E.peanutsIn + 10), sIn = seg(f, E.spoonIn - 8, E.spoonIn);
    const hookTilt = f >= E.spoonIn ? 3.2 * Math.exp(-(f - E.spoonIn) / 26) * Math.sin((f - E.spoonIn) * 0.42) : 0;
    const pans = drawBalance(g, 540, 990, 1.12, seg(f, E.balance - 6, E.balance + 18), hookTilt, jit,
      (px, py) => { if (pIn > 0) drawPeanutHeap(g, px, py - (1 - eo(pIn)) * 200, Math.ceil(HEAP.length * clamp(pIn * 1.4)), jit); },
      (px, py) => { if (sIn > 0) drawSpoon(g, px - 10, py - (1 - eo(sIn)) * 220, 26, jit, 1.15); });
    const tg = seg(f, E.tags, E.tags + 10); if (tg > 0) { g.save(); g.globalAlpha = tg; text(g, '30 g', pans[0][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'peanuts', pans[0][0], 1306, '700 22px NText', LEAFDARK, 'center', 1, 'fig'); text(g, '30 g', pans[1][0], 1270, '900 44px NDisplay', INK, 'center', 0, 'fig'); text(g, 'peanut butter', pans[1][0], 1306, '700 22px NText', LEAFDARK, 'center', 1, 'fig'); g.restore(); }
    const qk = seg(f, 70, 92); if (qk > 0) for (const [px, py] of pans) { text(g, '? kcal'.slice(0, Math.ceil(6 * qk)), px, py - 150, '900 40px NDisplay', RED, 'center', 0, 'fig'); }
    const pr = seg(f, 100, 134); if (pr > 0) for (const [px, py] of pans) { g.save(); g.strokeStyle = `rgba(214,69,43,${0.7 * (1 - pr)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(px, py - 30, 70 + 70 * pr, 34 + 34 * pr, 0, 0, 7); g.stroke(); g.restore(); }
    g.restore();
  }
  // --- B: peanut pod cutaway + the near-tie roundels + "about half fat"
  const sJ = sweep(f, E.jar - 4), glow = f >= E.halfFat ? Math.sin(seg(f, E.halfFat, E.halfFat + 40) * Math.PI) : 0;
  const sr = seg(f, E.section, E.section + 30);
  if (sr > 0 && sJ.b < 1) {
    const bx0 = sJ.b > 0 ? sJ.x : 0, bx1 = sB.b < 1 ? sB.x : W; g.save(); g.beginPath(); g.rect(bx0, 0, Math.max(0, bx1 - bx0), H); g.clip();
    drawPod(g, sr, jit, seg(f, E.washSection, E.washSection + 20), glow);
    const hf = seg(f, E.halfFat, E.halfFat + 10); if (hf > 0) note(g, f, E.halfFat, [KLO.x + 60, KLO.y + 30], [868, 1150], '≈ 50 % fat', 'by weight (USDA)', 1 - seg(f, E.roundelsOut, E.roundelsOut + 10));
    g.restore();
  }
  const out1 = seg(f, E.roundelsOut, E.roundelsOut + 10);
  drawRoundel(g, FACTS[0], SLOTS[0], f, jit, out1); drawRoundel(g, FACTS[1], SLOTS[2], f, jit, out1);
  const eq = seg(f, E.equal, E.equal + 8) * (1 - out1); if (eq > 0) { g.save(); g.globalAlpha = eq; text(g, '≈', 540, 1390, '900 90px NDisplay', INK, 'center', 0, 'fig'); g.restore(); }
  sweepBand(g, sB);
  // --- C: the jar with the real label, ingredients underlined as they are named; sodium bars
  const sS = sweep(f, E.jarOut);
  if (f >= E.jar - 4 && sS.b < 1) {
    g.save(); g.beginPath(); if (sJ.b < 1) g.rect(0, 0, sJ.x, H); else g.rect(sS.b > 0 ? sS.x : 0, 0, W, H); g.clip();
    drawJar(g, f, seg(f, E.jar, E.jar + 26), jit); drawSodium(g, f, jit, 0);
    g.restore();
  }
  sweepBand(g, sJ);
  // --- D: level vs heaped tablespoon on the balance (USDA: 2 tbsp = 32 g, so 1 level tbsp ≈ 16 g)
  const sOut = sweep(f, E.spoonsOut);
  if (f >= E.jarOut && sOut.b < 1) {
    g.save(); g.beginPath(); if (sS.b < 1) g.rect(0, 0, sS.x, H); else g.rect(sOut.b > 0 ? sOut.x : 0, 0, W, H); g.clip();
    const spIn = seg(f, E.levelSpoon - 8, E.levelSpoon), w1 = seg(f, E.w16 - 8, E.w16), heap = eio(seg(f, E.heap, E.heap + 22));
    const sway = (t0) => (f >= t0 ? 2.2 * Math.exp(-(f - t0) / 16) * Math.sin((f - t0) * 0.55) : 0);
    const tilt = w1 <= 0 ? 7 * eo(spIn) : heap <= 0 ? 7 * (1 - eo(w1)) + sway(E.w16) : 8 * heap + (f >= E.heap + 22 ? 3.2 * Math.exp(-(f - E.heap - 22) / 38) * Math.sin((f - E.heap - 22) * 0.36) : 0);
    const pans = drawBalance(g, 540, 990, 1.12, seg(f, E.jarOut + 4, E.jarOut + 28), tilt, jit,
      (px, py) => { if (spIn > 0) drawSpoon(g, px - 10, py - (1 - eo(spIn)) * 220, lerp(5, 42, heap), jit, 1.15); },
      (px, py) => { if (w1 > 0) weightBox(g, px - 38, 76, 76, py - (1 - eo(w1)) * 200, '16 g', jit); });
    const l1 = seg(f, E.levelLabel, E.levelLabel + 16); if (l1 > 0) text(g, '1 level tablespoon ≈ 16 g'.slice(0, Math.ceil(25 * l1)), 540, 1262, '700 26px NText', INK, 'center', 0, 'fig');
    const l2 = seg(f, E.levelLabel + 10, E.levelLabel + 26); if (l2 > 0) text(g, '2 level ≈ 32 g, close to 30 g'.slice(0, Math.ceil(29 * l2)), 540, 1298, '600 21px NText', INK2, 'center', 0, 'fig');
    const l3 = seg(f, E.heap + 16, E.heap + 30); if (l3 > 0) text(g, 'heaped spoon: more than 16 g'.slice(0, Math.ceil(28 * l3)), 540, 1350, '900 30px NDisplay', RED, 'center', 0, 'fig');
    const lv = seg(f, E.weighLabel + 8, E.weighLabel + 40); if (lv > 0 && heap > 0) { const [px, py] = pans[0]; g.save(); g.setLineDash([4, 6]); g.strokeStyle = RED; g.lineWidth = 2.4; g.beginPath(); g.moveTo(px - 74, py - 26); g.lineTo(px - 74 + 112 * lv, py - 26); g.stroke(); g.setLineDash([]); g.restore(); if (lv >= 1) text(g, 'level', px - 100, py - 18, '700 18px NText', RED, 'right', 0, 'fig'); const ex = seg(f, E.weighLabel + 36, E.weighLabel + 66); if (ex > 0) text(g, 'extra above level'.slice(0, Math.ceil(17 * ex)), px + 30, py - 92, '700 20px NText', RED, 'center', 0, 'fig'); }
    const l4 = seg(f, E.weighLabel, E.weighLabel + 20); if (l4 > 0) text(g, 'weigh one heaped spoonful once'.slice(0, Math.ceil(30 * l4)), 540, 1394, '700 24px NText', LEAFDARK, 'center', 0, 'fig');
    g.restore();
  }
  if (f >= E.spoonsOut) { g.save(); g.beginPath(); g.rect(0, 0, sOut.b < 1 ? sOut.x : W, H); g.clip(); drawPod(g, seg(f, E.spoonsOut, E.spoonsOut + 96), jit, seg(f, E.spoonsOut + 30, E.spoonsOut + 70), f >= 860 ? Math.sin(seg(f, 860, 899) * Math.PI) : 0); g.restore(); }   // bookend: the cutaway is re-cut above the CTA seal
  sweepBand(g, sS); sweepBand(g, sOut);
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'USDA FoodData Central: peanuts FDC 173806 · label FDC 2674433'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
  // --- E: CTA seal + wordmark (inside the plate)
  drawCTA(g, f, jit);
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f30);
}
const args = process.argv.slice(2), si = args.indexOf('--still');
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (si >= 0) { for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); } fs.writeFileSync(path.join(here, 'build', 'textlog-stills.json'), JSON.stringify(TEXT_LOG)); }
else {
  const out = path.join(here, 'build', 'video-noaudio.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { if (f % 2 === 0) draw(f); if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(path.join(here, 'build', 'textlog.json'), JSON.stringify(TEXT_LOG)); console.log('done', out);
}
