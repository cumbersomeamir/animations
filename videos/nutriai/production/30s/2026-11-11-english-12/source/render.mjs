// CalMeter English 30 s english-12 (2026-11-11): popcorn: big bowl, small kernels.
// Built to the approved feedback rules of 2026-11-11 (context/25): one big hero per scene as in the egg (english-07) and avocado
// (english-09) episodes, larger brief labels, sequential reveals, purposeful motion; same engraving burin, washes, burnish
// transitions, ivory paper and the CalMeter CTA seal. Scenes: a kernel bursts and popcorn rains into a 3-cup bowl on a scale
// (24 g); one kernel cut open: water -> heat -> steam -> POP -> light foam; the same bowl with oil, butter and sugar (grams on the
// scale, kcal in a roundel); payoff: plain vs topped. Original Canvas2D code; art direction only from lemo-opuscar
// styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s, each held 2 frames.
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
// ---------------- popcorn: kernel, popped piece, ceramic bowl with a heap, kitchen scale, kcal roundel (one big hero per scene)
const AMBER = '#E9A93A', AMBER_D = '#B86E1C', CREAM = '#FFF6DE', CREAM_D = '#EAD29B', BUTTERY = '#F1CB5A', BOWL = '#2F7A1C', BOWL_D = '#1F5512', WATERC = '#6FAEDF', GOLD = '#9A6410', CARD = '#F8F2E3';
function softShadow(g, x, y, rx, ry, a = 0.22) { for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(40,30,15,${a / 6})`; g.beginPath(); g.ellipse(x, y, rx * (1 + i * 0.07), ry * (1 + i * 0.12), 0, 0, 7); g.fill(); } }
function kernelPts(s) { return Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; const c = Math.cos(a), sn = Math.sin(a); const w = 30 * (1 - 0.35 * Math.max(0, sn)) * (1 + 0.04 * Math.sin(3 * a)); const h = sn > 0 ? 44 : 34; return [c * w * s, sn * h * s]; }); }
function drawKernel(g, x, y, s, rot, jit, glow = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); const P = kernelPts(s);
  if (glow > 0) { const gg = g.createRadialGradient(0, 0, 4 * s, 0, 0, 70 * s); gg.addColorStop(0, `rgba(255,170,60,${0.55 * glow})`); gg.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gg; g.beginPath(); g.arc(0, 0, 70 * s, 0, 7); g.fill(); }
  g.fillStyle = PAPER; poly(g, P); g.fill();
  g.save(); poly(g, P); g.clip(); const gr = g.createRadialGradient(-10 * s, -14 * s, 2 * s, 0, 0, 50 * s); gr.addColorStop(0, '#FFE19A'); gr.addColorStop(0.5, AMBER); gr.addColorStop(1, AMBER_D); g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(-60 * s, -60 * s, 120 * s, 120 * s); g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) burin(g, [[-26 * s + i * 8 * s, 40 * s], [-12 * s + i * 8 * s, 6 * s]], 0.7 * Math.max(0.5, s * 0.6), 'rgba(80,40,6,0.35)', 1, jit);
  g.fillStyle = 'rgba(140,80,20,0.55)'; g.beginPath(); g.ellipse(0, 38 * s, 9 * s, 6 * s, 0, 0, 7); g.fill(); g.restore();
  burin(g, P, 2.2 * Math.max(0.6, s * 0.6), INK, 1, jit);
  g.fillStyle = 'rgba(255,250,230,0.75)'; g.beginPath(); g.ellipse(-10 * s, -16 * s, 7 * s, 11 * s, -0.4, 0, 7); g.fill();
  g.restore();
}
const LOBES = new Map();
function lobesFor(seed) { if (!LOBES.has(seed)) { const q = rng(seed); const n = 5 + Math.floor(q() * 3), out = []; for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + q() * 0.6, d = 8 + q() * 6; out.push([Math.cos(a) * d, Math.sin(a) * d * 0.85, 9 + q() * 5]); } out.push([0, 0, 11]); LOBES.set(seed, { lobes: out, hull: q() * 6.283 }); } return LOBES.get(seed); }
function popPiece(g, x, y, s, rot, seed, tint, sugar, jit) {
  const { lobes, hull } = lobesFor(seed); g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.strokeStyle = INK; g.lineWidth = 3.2; lobes.forEach(([lx, ly, r]) => { g.beginPath(); g.arc(lx, ly, r, 0, 7); g.stroke(); });
  g.fillStyle = mix(CREAM, BUTTERY, tint); lobes.forEach(([lx, ly, r]) => { g.beginPath(); g.arc(lx, ly, r, 0, 7); g.fill(); });
  g.save(); g.beginPath(); lobes.forEach(([lx, ly, r]) => { g.moveTo(lx + r, ly); g.arc(lx, ly, r, 0, 7); }); g.clip();
  const sh = g.createLinearGradient(-14, -14, 16, 18); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, `rgba(150,105,30,${0.42 + 0.15 * tint})`); g.fillStyle = sh; g.fillRect(-30, -30, 60, 60);
  lobes.forEach(([lx, ly, r]) => { g.strokeStyle = 'rgba(22,32,26,0.28)'; g.lineWidth = 0.9; g.beginPath(); g.arc(lx + r * 0.15, ly + r * 0.15, r * 0.75, 0.2, 1.8); g.stroke(); });
  g.restore();
  g.fillStyle = AMBER_D; g.beginPath(); g.ellipse(Math.cos(hull) * 10, Math.sin(hull) * 9, 5, 3, hull, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
  g.fillStyle = 'rgba(255,255,250,0.85)'; g.beginPath(); g.ellipse(-6, -8, 4.5, 2.6, -0.6, 0, 7); g.fill();
  if (tint > 0.3) { g.fillStyle = `rgba(255,236,150,${0.6 * tint})`; g.beginPath(); g.ellipse(4, -3, 6, 2.5, -0.4, 0, 7); g.fill(); }
  if (sugar > 0) { const q = rng(seed + 9); for (let i = 0; i < 6; i++) { const a = q() * 6.283, d = q() * 14; g.save(); g.globalAlpha *= sugar; g.fillStyle = '#FFFFFF'; g.translate(Math.cos(a) * d, Math.sin(a) * d - 3); g.rotate(q()); g.fillRect(-1.6, -1.6, 3.2, 3.2); g.strokeStyle = 'rgba(22,32,26,0.5)'; g.lineWidth = 0.5; g.strokeRect(-1.6, -1.6, 3.2, 3.2); g.restore(); } }
  g.restore();
}
function heapFor(rx, h, n, seed) { const q = rng(seed), p = []; let tries = 0; while (p.length < n && tries < n * 30) { tries++; const u = q() * 2 - 1, v = q(); const x = u * rx * 0.92, top = h * (1 - u * u * 0.9); const y = -v * top; p.push([x, y, q() * 6.283, Math.floor(q() * 1e6)]); } return p.sort((a, b) => a[1] - b[1]).reverse(); }
const HEAP = heapFor(250, 190, 78, 5);
function drawBowl(g, cx, cy, rx, fill, tint, sugar, jit, label = '3 CUPS', sc = 1) {
  const ry = rx * 0.2, depth = rx * 0.62;
  softShadow(g, cx, cy + depth + 14, rx * 0.72, rx * 0.08, 0.28);
  g.fillStyle = '#1C3A12'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
  const order = HEAP.slice(0, Math.round(HEAP.length * clamp(fill)));
  order.forEach(([x, y, r, sd], i) => { const k = (x / 250) * (rx / 250); popPiece(g, cx + x * (rx / 250), cy - 4 + y * (rx / 250) * sc, 1.25 * (rx / 250), r, sd, tint, sugar, jit); void k; void i; });
  const body = []; for (let i = 0; i <= 30; i++) { const t = i / 30, a = Math.PI * t; body.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } for (let i = 0; i <= 30; i++) { const t = i / 30; const x = lerp(cx - rx, cx + rx, t); const yy = cy + depth * Math.sin(Math.PI * t) ** 0.6 + ry * 0.3; body.push([x, yy]); }
  const front = [...Array.from({ length: 31 }, (_, i) => { const a = Math.PI * (i / 30); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }), ...Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [lerp(cx - rx, cx + rx, t), cy + ry * 0.3 + depth * Math.pow(Math.sin(Math.PI * t), 0.6)]; }).reverse()];
  g.save(); poly(g, front); g.clip(); const bg = g.createLinearGradient(cx - rx, 0, cx + rx, 0); bg.addColorStop(0, BOWL_D); bg.addColorStop(0.35, BOWL); bg.addColorStop(0.62, '#4E9A2E'); bg.addColorStop(1, BOWL_D); g.fillStyle = bg; g.fillRect(cx - rx - 2, cy - ry, 2 * rx + 4, depth + ry * 2 + 4);
  for (let i = 0; i < 18; i++) burin(g, [[cx + rx * 0.2 + i * rx * 0.045, cy + ry * 0.4], [cx + rx * 0.1 + i * rx * 0.045, cy + depth]], 0.8, 'rgba(10,25,8,0.35)', 1, jit);
  g.fillStyle = 'rgba(255,255,240,0.22)'; g.beginPath(); g.ellipse(cx - rx * 0.45, cy + depth * 0.45, rx * 0.08, depth * 0.32, 0.25, 0, 7); g.fill(); g.restore();
  burin(g, front, 2.6, INK, 1, jit);
  g.strokeStyle = '#E9F3DC'; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, rx - 3, ry - 2, 0, 0.05, Math.PI - 0.05); g.stroke(); burin(g, ell(cx, cy, rx, ry, 0, Math.PI, 40), 2, INK, 1, jit);
  if (label) text(g, label, cx, cy + depth * 0.62, `900 ${Math.round(rx * 0.22)}px NDisplay`, '#F4F9EE', 'center', 2, 'fig');
}
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
// ---------------- A: hook: a kernel bursts; pieces rain into a bowl on a scale: 3 cups = 24 g. Super hook: one kernel lifts: "?"
function sceneHook(g, f, jit) {
  const bt = seg(f, E.burst1, E.burst1 + 14), rain = 0.3 + 0.7 * seg(f, E.rain, E.rain + 56);
  drawScale(g, 540, 1150, 380, f < E.scale ? null : lerp(0, 24, eo(seg(f, E.scale, E.g24))), jit, seg(f, E.g24, E.g24 + 8) * (1 - seg(f, E.g24 + 16, E.g24 + 30)));
  drawBowl(g, 540, 1000, 270, rain, 0, 0, jit, seg(f, E.cups, E.cups + 8) > 0 ? '3 CUPS' : '');
  for (let i = 0; i < 16; i++) { const t0 = i * 2.6, t = seg(f, E.rain + t0 - 6, E.rain + t0 + 14); if (t <= 0 || t >= 1) continue; const q = rng(70 + i); const ex = lerp(540, 540 + (q() - 0.5) * 420, t), ey = lerp(760, 960, t) - Math.sin(Math.PI * t) * 120; popPiece(g, ex, ey, 1.5 + 0.6 * (1 - t), t * 6 + i, 900 + i, 0, 0, jit); }
  if (bt < 1) { const cx = 540, cy = 760; if (bt < 0.35) drawKernel(g, cx, cy, 3.0 + 0.5 * bt, 0.1, jit, 1); burstFX(g, cx, cy, bt, 50, 260, 18); if (bt > 0.15) popPiece(g, cx, cy - 20 * bt, 3.0 + 3.6 * eo(seg(bt, 0.15, 1)), 0.3, 31, 0, 0, jit); }
  const gl = seg(f, E.g24, E.g24 + 10); if (gl > 0 && gl < 1) { g.save(); g.strokeStyle = `rgba(47,122,28,${0.9 * (1 - gl)})`; g.lineWidth = 6; g.strokeRect(540 - 125 - 10 * gl, 1150 + 40 - 10 * gl, 250 + 20 * gl, 90 + 20 * gl); g.restore(); }
  const lf = seg(f, E.lift, E.lift + 22); if (lf > 0) { const x = lerp(560, 540, eo(lf)), y = lerp(930, 700, eo(lf)), s = lerp(1.0, 3.0, eo(lf)); g.save(); g.fillStyle = `rgba(248,242,227,${0.6 * lf})`; g.beginPath(); g.arc(x, y, 150 * eo(lf), 0, 7); g.fill(); g.restore(); drawKernel(g, x, y, s, lerp(0.6, 0.1, lf) + 0.05 * Math.sin(f * 0.3), jit, 0.4 * lf); bigLabel(g, '?', 740, 640, 150, RED, seg(f, E.q, E.q + 8), 0.12); }
}
// ---------------- B: the mechanism in one big kernel: water -> heat -> steam -> the hull bursts -> the starch puffs into a light foam
const FOAM = (() => { const q = rng(44), p = []; for (let i = 0; i < 22; i++) { const a = q() * 6.283, d = Math.sqrt(q()); p.push([Math.cos(a) * d, Math.sin(a) * d * 0.9, 0.35 + q() * 0.3, q()]); } return p; })();
function sceneKernel(g, f, jit) {
  const cx = 540, cy = 990, s = 5.6, a = seg(f, E.section, E.section + 14); if (a <= 0) return;
  const heat = seg(f, E.heat, E.heat + 20), steam = seg(f, E.steam, E.burst), burst = seg(f, E.burst, E.burst + 10), foam = eo(seg(f, E.burst + 2, E.foam + 24));
  g.save(); g.globalAlpha = a;
  if (heat > 0) { for (let i = 0; i < 9; i++) { const x = cx - 200 + i * 50, ph = f * 0.35 + i; burin(g, Array.from({ length: 9 }, (_, j) => [x + Math.sin(ph + j * 0.8) * 9, 1330 - j * 14]), 2.4, `rgba(214,90,30,${0.7 * heat * (1 - foam)})`, 1, jit); } const hg = g.createRadialGradient(cx, 1340, 10, cx, 1340, 320); hg.addColorStop(0, `rgba(255,140,40,${0.35 * heat * (1 - foam)})`); hg.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = hg; g.fillRect(cx - 340, 1100, 680, 300); }
  softShadow(g, cx, cy + 190 * (1 + foam * 0.6), 170 * (1 + foam * 0.8), 22, 0.22);
  if (burst < 1) {
    const P = kernelPts(s); g.save(); g.translate(cx, cy);
    const shake = steam > 0.5 ? Math.sin(f * 2.1) * 3 * steam : 0; g.translate(shake, 0);
    g.fillStyle = PAPER; poly(g, P); g.fill(); g.save(); poly(g, P); g.clip(); const gr = g.createRadialGradient(-40, -60, 10, 0, 0, 220); gr.addColorStop(0, '#FFD98A'); gr.addColorStop(0.6, AMBER); gr.addColorStop(1, AMBER_D); g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(-200, -220, 400, 440); g.globalCompositeOperation = 'source-over'; g.restore();
    const I = P.map(([x, y]) => [x * 0.82, y * 0.82 - 6]); g.fillStyle = '#FCEFC8'; poly(g, I); g.fill(); g.save(); poly(g, I); g.clip(); const q = rng(5); for (let i = 0; i < 120; i++) { g.fillStyle = 'rgba(190,140,60,0.28)'; g.beginPath(); g.arc((q() - 0.5) * 230, (q() - 0.5) * 300, 2 + q() * 3, 0, 7); g.fill(); } g.restore(); burin(g, I, 1.4, 'rgba(22,32,26,0.55)', 1, jit);
    const wd = seg(f, E.water - 6, E.water + 10); const wr = 30 * eo(wd) * (1 - steam);
    if (wr > 1) { g.fillStyle = WATERC; g.beginPath(); g.moveTo(0, -wr * 1.5 - 10); g.quadraticCurveTo(wr * 1.1, -10, 0, wr - 10 + 10); g.quadraticCurveTo(-wr * 1.1, -10, 0, -wr * 1.5 - 10); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-wr * 0.3, -wr * 0.5 - 8, wr * 0.2, wr * 0.35, -0.3, 0, 7); g.fill(); }
    if (steam > 0) { const sr = 30 + 105 * eo(steam); for (let i = 0; i < 9; i++) { const an = (i / 9) * 6.283 + f * 0.05; g.fillStyle = `rgba(235,242,248,${0.8})`; g.beginPath(); g.arc(Math.cos(an) * sr * 0.5, -10 + Math.sin(an) * sr * 0.5, sr * 0.42, 0, 7); g.fill(); } g.strokeStyle = 'rgba(70,110,140,0.7)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const an = (i / 9) * 6.283 + f * 0.05; g.beginPath(); g.arc(Math.cos(an) * sr * 0.5, -10 + Math.sin(an) * sr * 0.5, sr * 0.42, an - 1, an + 1); g.stroke(); }
      for (let i = 0; i < 8; i++) { const an = (i / 8) * 6.283, r0 = sr * 0.9 + 6, r1 = r0 + 36 * steam; g.strokeStyle = `rgba(214,69,43,${0.85 * steam})`; g.lineWidth = 5; g.beginPath(); g.moveTo(Math.cos(an) * r0, -10 + Math.sin(an) * r0); g.lineTo(Math.cos(an) * r1, -10 + Math.sin(an) * r1); g.stroke(); g.beginPath(); g.moveTo(Math.cos(an) * r1 + Math.cos(an + 2.5) * 12, -10 + Math.sin(an) * r1 + Math.sin(an + 2.5) * 12); g.lineTo(Math.cos(an) * r1, -10 + Math.sin(an) * r1); g.lineTo(Math.cos(an) * r1 + Math.cos(an - 2.5) * 12, -10 + Math.sin(an) * r1 + Math.sin(an - 2.5) * 12); g.stroke(); } }
    if (steam > 0.6) { const cr = seg(steam, 0.6, 1); burin(g, [[-20, -170], [-6, -120], [-24, -80], [-8, -40]], 3, INK, cr, jit); burin(g, [[60, -140], [44, -100], [62, -60]], 2.4, INK, cr, jit); }
    burin(g, P, 5, INK, 1, jit); g.fillStyle = 'rgba(255,250,230,0.6)'; g.beginPath(); g.ellipse(-60, -90, 26, 44, -0.4, 0, 7); g.fill();
    g.restore();
  }
  if (burst > 0) {
    burstFX(g, cx, cy - 10, burst, 80, 380, 18);
    const R = lerp(190, 370, foam); const hullOff = 40 + 160 * eo(burst);
    for (const sd of [-1, 1]) { g.save(); g.translate(cx + sd * hullOff * 0.9, cy + 120 + hullOff * 0.3); g.rotate(sd * (0.5 + 0.6 * eo(burst))); const sh = ell(0, 0, 60, 26, sd > 0 ? -0.2 : Math.PI + 0.2, sd > 0 ? Math.PI + 0.2 : 2 * Math.PI - 0.2, 20); g.fillStyle = AMBER_D; poly(g, sh); g.fill(); burin(g, sh, 2.4, INK, 1, jit); g.restore(); }
    g.save(); g.translate(cx, cy - 20);
    const lobes = FOAM.map(([x, y, r, d]) => [x * R * 0.62, y * R * 0.62, r * R * clamp(foam * 1.3 - d * 0.3)]);
    g.strokeStyle = INK; g.lineWidth = 7; lobes.forEach(([x, y, r]) => { if (r > 1) { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); } });
    g.fillStyle = CREAM; lobes.forEach(([x, y, r]) => { if (r > 1) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
    g.save(); g.beginPath(); lobes.forEach(([x, y, r]) => { if (r > 1) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } }); g.clip(); const sh = g.createLinearGradient(-R, -R, R, R); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(160,115,40,0.45)'); g.fillStyle = sh; g.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4);
    const q = rng(77); for (let i = 0; i < 90; i++) { g.strokeStyle = 'rgba(22,32,26,0.22)'; g.lineWidth = 1.2; const x = (q() - 0.5) * R * 1.6, y = (q() - 0.5) * R * 1.5, r = 6 + q() * 14; g.beginPath(); g.arc(x, y, r, 0.3, 2.2); g.stroke(); } g.restore();
    g.fillStyle = 'rgba(255,255,250,0.8)'; g.beginPath(); g.ellipse(-R * 0.3, -R * 0.35, R * 0.12, R * 0.07, -0.6, 0, 7); g.fill(); g.restore();
  }
  // one big label at a time
  const L = (s0, s1) => seg(f, s0, s0 + 8) * (1 - seg(f, s1 - 6, s1));
  bigLabel(g, 'WATER', 840, 690, 74, '#2C6E9E', L(E.water, E.heatLbl), 0);
  bigLabel(g, 'HEAT ≈ 180 °C', 540, 1440, 70, '#C2410C', L(E.heatLbl, E.burst), 0);
  bigLabel(g, 'POP!', 820, 700, 130, RED, L(E.burst, E.foam), -0.12);
  bigLabel(g, 'LIGHT FOAM', 540, 1420, 76, LEAFDARK, L(E.foam + 4, E.dense), 0);
  bigLabel(g, '8× LESS DENSE', 540, 1420, 72, LEAFDARK, seg(f, E.dense, E.dense + 8), 0);
  g.restore();
}
// ---------------- C/D: the proof and the toppings on the same 3-cup bowl: grams on the scale, kcal in the roundel
const STEPS = [[E.bowl2, 24, '≈ 90', 0, 0], [E.oil, 33, '≈ 165', 0.28, 0], [E.butter, 47, '≈ 265', 0.62, 0], [E.sugar, 60, '300+', 0.62, 1]];
function sceneToppings(g, f, jit) {
  const a = seg(f, E.bowl2, E.bowl2 + 12); if (a <= 0) return; const bx = 470, by = 980;
  const iOil = eo(seg(f, E.oil + 6, E.oilDone)), iBut = eo(seg(f, E.butter + 10, E.butterDone)), iSug = eo(seg(f, E.sugar + 6, E.sugarDone));
  const grams = 24 + 9 * iOil + 14.2 * iBut + 12.5 * iSug, tint = 0.28 * iOil + 0.34 * iBut;
  g.save(); g.globalAlpha = a;
  drawScale(g, bx, 1130, 400, grams, jit, Math.max(seg(f, E.oilDone, E.oilDone + 6) * (1 - seg(f, E.oilDone + 14, E.oilDone + 24)), seg(f, E.butterDone, E.butterDone + 6) * (1 - seg(f, E.butterDone + 14, E.butterDone + 24)), seg(f, E.sugarDone, E.sugarDone + 6) * (1 - seg(f, E.sugarDone + 14, E.sugarDone + 24))));
  drawBowl(g, bx, by, 260, 1, tint, iSug, jit, '3 CUPS');
  // oil: a big golden drop falls in
  const od = seg(f, E.oil, E.oil + 18); if (od > 0 && od < 1) { const y = lerp(600, 900, eio(od)), r = 34 * (1 - 0.6 * seg(od, 0.8, 1)); g.save(); g.globalAlpha *= 1 - seg(od, 0.85, 1); g.fillStyle = '#E8B730'; g.beginPath(); g.moveTo(bx, y - r * 1.6); g.quadraticCurveTo(bx + r * 1.1, y, bx, y + r); g.quadraticCurveTo(bx - r * 1.1, y, bx, y - r * 1.6); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke(); g.fillStyle = 'rgba(255,250,220,0.8)'; g.beginPath(); g.ellipse(bx - r * 0.3, y - r * 0.2, r * 0.18, r * 0.32, -0.3, 0, 7); g.fill(); g.restore(); }
  // butter: a tablespoon tips a melted stream
  const bs = seg(f, E.butter - 10, E.butter + 6), bp2 = seg(f, E.butter + 4, E.butterDone), bo = seg(f, E.butterDone, E.butterDone + 12);
  if (bs > 0 && bo < 1) { const sx = lerp(760, 560, eo(bs)), sy = lerp(560, 700, eo(bs)); g.save(); g.globalAlpha *= 1 - bo; if (bp2 > 0 && bp2 < 1) { g.strokeStyle = '#EFC64A'; g.lineCap = 'round'; g.lineWidth = 12 * Math.sin(Math.PI * bp2) + 2; g.beginPath(); g.moveTo(sx - 46, sy + 6); g.quadraticCurveTo(sx - 60, sy + 120, bx + 20 - 80 * bp2, 900); g.stroke(); } g.translate(sx, sy); g.rotate(lerp(-0.2, 0.7, eo(bp2))); g.fillStyle = '#E3E6E8'; g.beginPath(); g.ellipse(0, 0, 54, 34, 0, 0, 7); g.fill(); g.fillStyle = `rgba(239,198,74,${1 - bp2 * 0.8})`; g.beginPath(); g.ellipse(0, -4, 44, 24, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, 0, 54, 34, 0, 0, 7); g.stroke(); g.fillStyle = '#D5D9DC'; g.fillRect(50, -7, 170, 14); g.strokeRect(50, -7, 170, 14); g.restore(); }
  // sugar: a tablespoon sprinkles crystals
  const ss = seg(f, E.sugar - 10, E.sugar + 4), sp = seg(f, E.sugar + 2, E.sugarDone), so = seg(f, E.sugarDone, E.sugarDone + 12);
  if (ss > 0 && so < 1) { const sx = lerp(780, 600, eo(ss)), sy = lerp(560, 680, eo(ss)); g.save(); g.globalAlpha *= 1 - so; if (sp > 0 && sp < 1) { const q = rng(Math.floor(f / 2)); for (let i = 0; i < 40; i++) { const t = q(), x = sx - 60 + (q() - 0.5) * 120 * t - t * 80, y = sy + 20 + t * 230; g.fillStyle = '#FFFFFF'; g.fillRect(x, y, 5, 5); g.strokeStyle = 'rgba(22,32,26,0.6)'; g.lineWidth = 0.8; g.strokeRect(x, y, 5, 5); } } g.translate(sx, sy); g.rotate(lerp(-0.2, 0.6, eo(sp))); g.fillStyle = '#E3E6E8'; g.beginPath(); g.ellipse(0, 0, 54, 34, 0, 0, 7); g.fill(); g.fillStyle = `rgba(255,255,255,${1 - sp * 0.8})`; g.beginPath(); g.ellipse(0, -6, 42, 22, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, 0, 54, 34, 0, 0, 7); g.stroke(); g.fillStyle = '#D5D9DC'; g.fillRect(50, -7, 170, 14); g.strokeRect(50, -7, 170, 14); g.restore(); }
  // the kcal roundel: one number at a time, popping on each new value
  const cur = [...STEPS].reverse().find(([t]) => f >= (t === E.bowl2 ? E.kcal90 : t === E.oil ? E.oilDone : t === E.butter ? E.butterDone : E.over300));
  if (cur) { const t0 = cur[0] === E.bowl2 ? E.kcal90 : cur[0] === E.oil ? E.oilDone : cur[0] === E.butter ? E.butterDone : E.over300; drawRoundel(g, 852, 740, 112, cur[2], 'kcal', cur[2] === '≈ 90' ? LEAFDARK : cur[2] === '300+' ? RED : GOLD, seg(f, t0, t0 + 10) + (f > t0 + 10 ? 1 : 0), jit); }
  // one-word labels for what is added
  const L = (s0, s1) => seg(f, s0, s0 + 8) * (1 - seg(f, s1 - 6, s1));
  bigLabel(g, 'AIR-POPPED', 470, 680, 64, LEAFDARK, L(E.bowl2 + 6, E.oil), 0);
  bigLabel(g, '+ OIL', 300, 680, 72, GOLD, L(E.oil, E.butter - 10), -0.06);
  bigLabel(g, '+ BUTTER', 320, 660, 68, GOLD, L(E.butter, E.sugar - 10), -0.06);
  bigLabel(g, '+ SUGAR', 320, 660, 68, '#8A4E1C', L(E.sugar, E.burnish3), -0.06);
  g.restore();
}
// ---------------- E: payoff: the same 3-cup bowl, plain vs topped: grams and toppings set the count
function scenePayoff(g, f, jit) {
  const a = seg(f, E.pay, E.pay + 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  drawScale(g, 290, 1030, 250, 24, jit, seg(f, E.grams, E.grams + 8)); drawScale(g, 790, 1030, 250, 60, jit, seg(f, E.grams, E.grams + 8));
  drawBowl(g, 290, 890, 180, 1, 0, 0, jit, '3 CUPS'); drawBowl(g, 790, 890, 180, 1, 0.62, 1, jit, '3 CUPS');
  drawRoundel(g, 290, 660, 88, '≈ 90', 'kcal', LEAFDARK, seg(f, E.pay + 4, E.pay + 14), jit); drawRoundel(g, 790, 660, 88, '300+', 'kcal', RED, seg(f, E.pay + 8, E.pay + 18), jit);
  const tr = seg(f, E.triple, E.triple + 10); if (tr > 0) { g.save(); g.globalAlpha *= tr; g.strokeStyle = RED; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(400, 640); g.quadraticCurveTo(540, 560, lerp(400, 680, eo(tr)), 640); g.stroke(); if (tr >= 1) { g.beginPath(); g.moveTo(680, 640); g.lineTo(652, 612); g.moveTo(680, 640); g.lineTo(646, 648); g.stroke(); } g.restore(); bigLabel(g, '×3+', 540, 600, 84, RED, tr, 0); }
  const ns = seg(f, E.notSize, E.notSize + 10); if (ns > 0) { g.save(); g.globalAlpha *= ns; g.setLineDash([12, 10]); g.strokeStyle = LEAFDARK; g.lineWidth = 4; g.beginPath(); g.moveTo(110, 1222); g.lineTo(970, 1222); g.stroke(); g.setLineDash([]); g.restore(); bigLabel(g, 'SAME SIZE', 540, 1240, 54, LEAFDARK, ns * (1 - seg(f, E.cta - 4, E.cta + 4)), 0); }
  g.restore();
}
// ---------------- captions: larger, auto-fit inside x 100-900, rise-in; camera: purposeful moves only
function captions2(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out);
    c.lines.forEach(([s, f0], li) => { const a = seg(f, f0, f0 + 5) * (1 - out); if (a <= 0) return; let px = 64; g.font = `900 ${px}px NDisplay`; while (g.measureText(s).width > 740 && px > 44) { px -= 2; g.font = `900 ${px}px NDisplay`; }
      const y = (li === 0 ? 404 : 474) + 10 * (1 - eo(seg(f, f0, f0 + 6))); g.save(); g.globalAlpha = a; text(g, s, 500, y, `900 ${px}px NDisplay`, li === 0 ? INK : LEAFDARK, 'center', 0, 'caption'); /* caption window x 100-900 is centred at 500 */ g.restore(); });
  }
}
function camera2(f) {
  /* [frame, zoom, x, y, linear?]: slow linear push-ins through the proof/toppings scene and through payoff + CTA; quick eased pull-back at the transition */
  const keys = [[0, 1.12, 540, 930], [70, 1.0, 540, 1010], [92, 1.0, 540, 1010], [126, 1.07, 540, 960], [134, 1.0, 540, 1010], [330, 1.0, 540, 1010], [650, 1.07, 540, 1010, 1], [676, 1.0, 540, 1010], [900, 1.06, 540, 1010, 1]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1, lin] = keys[k + 1]; const u = seg(f, f0, f1); const t = lin ? u : eio(u);
  const kick = 1 + 0.03 * Math.exp(-(((f - E.burst - 2) / 5) ** 2)) + 0.015 * Math.exp(-(((f - E.oilDone) / 4) ** 2)) + 0.015 * Math.exp(-(((f - E.butterDone) / 4) ** 2)) + 0.02 * Math.exp(-(((f - E.over300) / 4) ** 2));
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
function drawCard() { for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(40,30,15,${0.035})`; g.fillRect(62 - i * 2 + 6, 528 - i * 2 + 10, 956 + i * 4, 984 + i * 4); } g.fillStyle = CARD; g.fillRect(62, 528, 956, 984); }
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera2(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0); drawCard(); g.save(); g.globalAlpha = 0.5; g.drawImage(grain, 0, 0); g.restore();
  g.save(); g.beginPath(); g.rect(62, 528, 956, 984); g.clip();
  if (clipScene(f, null, E.burnish)) { sceneHook(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish));
  if (f >= E.burnish && clipScene(f, E.burnish, E.burnish2)) { sceneKernel(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish2));
  if (f >= E.burnish2 && clipScene(f, E.burnish2, E.burnish3)) { sceneToppings(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish3));
  if (f >= E.burnish3 && clipScene(f, E.burnish3, null)) { scenePayoff(g, f, jit); g.restore(); }
  g.restore();
  drawCTA(g, f, jit);
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions2(g, f30);
}
function drawThumb() {
  FRAME = -1; const jit = rng(7); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.drawImage(grain, 0, 0);
  const glow = g.createRadialGradient(540, 760, 20, 540, 900, 760); glow.addColorStop(0, 'rgba(255,214,120,0.55)'); glow.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = glow; g.fillRect(0, 300, W, 1400);
  text(g, 'BIG BOWL.', 540, 450, '900 150px NDisplay', INK, 'center', -2, 'thumb'); text(g, 'SMALL KERNELS.', 540, 580, '900 92px NDisplay', LEAFDARK, 'center', -1, 'thumb');
  drawScale(g, 540, 1470, 420, 24, jit, 0);
  drawBowl(g, 540, 1240, 330, 1, 0, 0, jit, '');
  for (const [x, y, s, r, sd] of [[300, 980, 2.0, 0.4, 3], [790, 960, 2.1, 1.2, 4], [430, 900, 1.7, 2.0, 5], [660, 880, 1.8, 2.6, 6], [540, 820, 2.4, 0.9, 7]]) popPiece(g, x, y, s, r, sd, 0, 0, jit);
  burstFX(g, 540, 830, 0.35, 40, 170, 18); drawKernel(g, 540, 830, 2.6, 0.1, jit, 1); popPiece(g, 600, 775, 2.6, 0.3, 31, 0, 0, jit);
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
