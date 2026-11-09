// CalMeter English 30 s english-11 (2026-11-09): a medium baked potato with skin (173 g), then the same potato with butter.
// Same accepted style as the English chickpea (english-10), avocado (english-09) and raisin (english-08) episodes: Copperplate-engraving
// plate on IVORY #F4EEDC with deep ink #16201A, natural washes, same burin, burnish transitions, camera with the closing push-in,
// English captions (Inter Display Black 58 px, baselines 401/455) and the CalMeter CTA seal. Food geometry for this episode: an engraved
// russet potato that splits open and takes a tablespoon of melting butter, a two-column ledger (what the potato brings, what the
// butter brings), and stacked kcal bars for three butter portions on the same potato. Original Canvas2D code; art direction only
// from lemo-opuscar styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s, each held 2 frames.
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
// ---------------- foods: an engraved baked potato (russet skin, eyes, split open to fluffy flesh), a butter slab, a tablespoon
const SKIN = '#A8733F', SKIN_D = '#6B4322', FLESH = '#F5EACB', BUTTER = '#F4D768', POOL = '#EDB93A', GOLD = '#9A6410', TAN = '#D9B57A', KCOL = '#6E4C9A', GREY = 'rgba(22,32,26,0.42)';
function potatoPts(cx, cy, rx, ry, rot) { return Array.from({ length: 73 }, (_, i) => { const a = (i / 72) * 6.283, w = 1 + 0.04 * Math.sin(3 * a + 1.3) + 0.025 * Math.sin(5 * a + 4.1); const x = Math.cos(a) * rx * w, y = Math.sin(a) * ry * w; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; }); }
function drawSlab(g, x, y, w, h, a, jit) { if (a <= 0 || w < 1) return; g.save(); g.globalAlpha *= a; const p = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2], [x - w / 2, y - h / 2]]; g.fillStyle = BUTTER; poly(g, p); g.fill(); g.fillStyle = 'rgba(255,255,235,0.6)'; g.fillRect(x - w / 2 + 4, y - h / 2 + 3, w * 0.45, h * 0.18); g.fillStyle = 'rgba(160,110,20,0.25)'; g.fillRect(x - w / 2, y + h / 4, w, h / 4); burin(g, p, 1.8, INK, 1, jit); g.restore(); }
function drawPotato(g, cx, cy, s, rot, open, melt, slab, jit) {
  const rx = 230 * s, ry = 140 * s, P = potatoPts(cx, cy, rx, ry, rot);
  g.fillStyle = PAPER; poly(g, P); g.fill();
  g.save(); poly(g, P); g.clip(); const gr = g.createRadialGradient(cx - rx * 0.35, cy - ry * 0.45, 10, cx, cy, rx * 1.1); gr.addColorStop(0, '#D9AA72'); gr.addColorStop(0.55, SKIN); gr.addColorStop(1, SKIN_D); g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(cx - rx * 1.3, cy - ry * 1.7, rx * 2.6, ry * 3.4); g.globalCompositeOperation = 'source-over';
  const q = rng(17); for (let i = 0; i < 70; i++) { const a = q() * 6.283, d = Math.sqrt(q()) * 0.92; g.fillStyle = 'rgba(70,40,15,0.35)'; g.beginPath(); g.arc(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, (1.2 + q() * 1.8) * Math.max(0.5, s), 0, 7); g.fill(); }
  for (let i = 0; i < 7; i++) { const a = q() * 6.283, d = 0.4 + q() * 0.45; burin(g, ell(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, 10 * s, 4 * s, 0.3, 2.8, 8, a), 1.4, 'rgba(50,28,10,0.8)', 1, jit); }
  for (let i = 0; i < 16; i++) burin(g, [[cx - rx + i * rx * 0.14, cy + ry * 1.0], [cx - rx * 0.55 + i * rx * 0.14, cy + ry * 0.25]], 0.7, 'rgba(40,22,8,0.32)', 1, jit);
  g.restore(); burin(g, P, 3 * Math.max(0.6, s), INK, 1, jit);
  if (open > 0) {
    const orx = rx * 0.8, ory = ry * 0.46 * open, oy = cy - 8 * s;
    const O = Array.from({ length: 61 }, (_, i) => { const a = (i / 60) * 6.283, jag = 1 + 0.05 * Math.sin(a * 13) + 0.03 * Math.sin(a * 23); const x = Math.cos(a) * orx * jag, y = Math.sin(a) * ory * jag; return [cx + x * Math.cos(rot) - y * Math.sin(rot), oy + x * Math.sin(rot) + y * Math.cos(rot)]; });
    g.fillStyle = FLESH; poly(g, O); g.fill();
    g.save(); poly(g, O); g.clip(); const q2 = rng(23); for (let i = 0; i < 160; i++) { const a = q2() * 6.283, d = Math.sqrt(q2()); g.fillStyle = 'rgba(165,130,70,0.32)'; g.beginPath(); g.arc(cx + Math.cos(a) * d * orx, oy + Math.sin(a) * d * ory, (1 + q2() * 1.6) * Math.max(0.5, s), 0, 7); g.fill(); }
    const sh = g.createLinearGradient(0, oy - ory, 0, oy + ory * 0.2); sh.addColorStop(0, 'rgba(90,60,20,0.38)'); sh.addColorStop(1, 'rgba(90,60,20,0)'); g.fillStyle = sh; g.fillRect(cx - orx, oy - ory, 2 * orx, ory * 1.2);
    if (melt > 0) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9; g.fillStyle = POOL; g.beginPath(); g.ellipse(cx + 18 * s, oy + 4 * s, orx * 0.72 * eo(melt), ory * 0.8 * eo(melt), rot, 0, 7); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(255,248,210,${0.5 * melt})`; g.beginPath(); g.ellipse(cx - 10 * s, oy - 2 * s, orx * 0.25 * melt, ory * 0.14 * melt, rot, 0, 7); g.fill(); }
    g.restore();
    burin(g, O, 2.2 * Math.max(0.6, s), INK, 1, jit); burin(g, O.slice(32, 60).map(([x, y]) => [x, y - 3 * s]), 1.2, 'rgba(240,215,170,0.8)', 1, jit);
    /* (no drips: the pool stays inside the opening) */
  }
  if (slab) drawSlab(g, slab.x, slab.y, slab.w, slab.h, slab.a, jit);
}
function drawSpoon(g, x, y, rot, s, jit, withButter) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const bowl = ell(0, 0, 50, 32, 0, 6.283, 36); g.fillStyle = '#E3E6E8'; poly(g, bowl); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-14, -10, 18, 7, -0.3, 0, 7); g.fill(); burin(g, bowl, 2.2, INK, 1, jit);
  g.fillStyle = '#D5D9DC'; g.beginPath(); g.moveTo(46, -6); g.lineTo(190, -12); g.lineTo(192, 0); g.lineTo(46, 6); g.closePath(); g.fill(); burin(g, [[46, -6], [190, -12], [192, 0], [46, 6]], 1.8, INK, 1, jit);
  if (withButter) drawSlab(g, 0, -14, 64, 30, 1, jit);
  g.restore();
}
function steam(g, x0, y0, n, spread, f, a, jit) { if (a <= 0) return; for (let i = 0; i < n; i++) { const t = (f * 0.012 + i * 0.31) % 1, x = x0 - spread / 2 + (i * spread) / Math.max(1, n - 1); g.save(); g.globalAlpha = a * Math.sin(Math.PI * t) * 0.85; burin(g, Array.from({ length: 12 }, (_, j) => [x + Math.sin(j * 0.7 + i * 1.7 + f * 0.04) * 12, y0 - t * 70 - j * 10]), 1.8, 'rgba(120,140,150,0.9)', 1, jit); g.restore(); } }
// ---------------- A: the hook: the potato splits open (173 g, ≈ 160 kcal), a tablespoon of butter melts in (≈ 260 kcal)
function sceneHook(g, f, jit) {
  const open = eo(seg(f, E.split, E.split + 18)), drop = seg(f, E.butterDrop - 8, E.butterDrop + 4), melt = seg(f, E.melt, E.melt + 40);
  let slab = null;
  if (f >= E.butterDrop - 8) { const y = lerp(800, 900, eio(drop)); slab = { x: 560, y, w: 64 * (1 - 0.75 * melt), h: 30 * (1 - 0.7 * melt), a: 1 - seg(melt, 0.6, 1) }; }
  drawPotato(g, 540, 930, 1, -0.08, open, melt, slab, jit);
  steam(g, 540, 880, 6, 300, f, open * (1 - 0.4 * melt), jit);
  const sp = seg(f, E.spoon, E.spoon + 44), sp2 = seg(f, E.butterDrop - 6, E.butterDrop + 14);
  if (sp > 0 && sp2 < 1) { g.save(); g.globalAlpha = sp * (1 - sp2); drawSpoon(g, lerp(820, 600, eo(sp)) + 60 * sp2, lerp(640, 790, eo(sp)) - 40 * sp2, lerp(-0.25, 0.4, eio(sp2)), 1, jit, f < E.butterDrop - 8); g.restore(); }
  const tw = seg(f, E.tagW, E.tagW + 10); if (tw > 0) { g.save(); g.globalAlpha = tw; text(g, 'medium baked potato · 173 g', 540, 1150, '900 32px NDisplay', INK, 'center', 0, 'fig'); text(g, 'flesh + skin, no salt', 540, 1184, '700 22px NText', INK2, 'center', 1, 'fig'); g.restore(); }
  const kq = seg(f, E.kcalQ, E.kcalQ + 8); if (kq > 0) { const k2 = seg(f, E.kcal260, E.kcal260 + 16); const v = f < E.kcal160 ? '? kcal' : f < E.kcal260 ? (f < E.kcal160 + 16 ? `${Math.round(160 * eo(seg(f, E.kcal160, E.kcal160 + 16)) / 10) * 10} kcal` : '≈ 160 kcal') : `≈ ${Math.round(lerp(160, 260, eo(k2)) / 5) * 5} kcal`; g.save(); g.globalAlpha = kq; text(g, v, 540, 1262, '900 54px NDisplay', f < E.kcal160 ? RED : f < E.kcal260 ? TAN === '' ? INK : '#8A5A22' : GOLD, 'center', 0, 'fig'); g.restore(); }
  const bt = seg(f, E.butterDrop, E.butterDrop + 10); if (bt > 0) { g.save(); g.globalAlpha = bt; g.fillStyle = '#FBF6E8'; g.fillRect(330, 1300, 420, 50); burin(g, [[330, 1300], [750, 1300], [750, 1350], [330, 1350], [330, 1300]], 1.8, GOLD, 1, jit); text(g, '+ 1 tbsp butter · 14 g' + (f >= E.kcal260 ? ' · + ≈ 100' : ''), 540, 1334, '900 24px NDisplay', GOLD, 'center', 0, 'fig'); g.restore(); }
}
// ---------------- B/C: a two-column ledger: what the potato brings, what the butter brings (bars scaled per row)
const ROWS = [
  ['energy', 161, 102, '≈ 161 kcal', '≈ 102 kcal', 'potE', 'butE'],
  ['carbs', 36.6, 0, '≈ 37 g', '0 g', 'rowCarb', 'z1'],
  ['fibre', 3.8, 0, '≈ 3.8 g', '0 g', 'rowFibre', 'z2'],
  ['potassium', 926, 3.4, '≈ 926 mg', '≈ 3 mg', 'rowK', 'z3'],
  ['fat', 0.2, 11.5, '≈ 0.2 g', '≈ 11.5 g', 'potFat', 'fatHi'],
];
function sceneLedger(g, f, jit) {
  const T = { potE: E.potCol + 4, rowCarb: E.rowCarb, rowFibre: E.rowFibre, rowK: E.rowK, potFat: E.rowK + 14, butE: E.butE, z1: E.butE + 10, z2: E.butE + 16, z3: E.butE + 22, fatHi: E.fatHi };
  const hv = seg(f, E.section, E.section + 16); if (hv <= 0) return;
  g.save(); g.globalAlpha = hv; drawPotato(g, 520, 752, 0.38, -0.08, 1, 0, null, jit); text(g, 'potato · 173 g', 520, 862, '900 28px NDisplay', '#8A5A22', 'center', 0, 'fig'); g.restore();
  const bh = seg(f, E.butCol, E.butCol + 14); if (bh > 0) { g.save(); g.globalAlpha = bh; drawSpoon(g, 770, 760, -0.15, 0.85, jit, true); text(g, 'butter · 1 tbsp, 14 g', 800, 862, '900 28px NDisplay', GOLD, 'center', 0, 'fig'); g.restore(); }
  ROWS.forEach(([name, pv, bv, pl, bl, pe, be], i) => {
    const y = 930 + i * 86, mx = Math.max(pv, bv);
    g.save(); g.globalAlpha = hv; text(g, name, 120, y + 8, '900 30px NDisplay', INK, 'left', 0, 'fig'); burin(g, [[110, y + 44], [960, y + 44]], 0.8, INK2, 1, jit); g.restore();
    const cell = (cx, v, lab, ev, col, barCol) => { const a = seg(f, T[ev], T[ev] + 10); if (a <= 0) return; const zero = v < 0.05 * mx; g.save(); g.globalAlpha = a; text(g, lab, cx, y + 6, '900 32px NDisplay', zero ? GREY : col, 'center', 0, 'fig'); const w = 200 * (v / mx) * eo(a); if (w > 0.5) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = barCol; g.fillRect(cx - 100, y + 18, w, 14); g.restore(); burin(g, [[cx - 100, y + 18], [cx - 100 + w, y + 18], [cx - 100 + w, y + 32], [cx - 100, y + 32], [cx - 100, y + 18]], 1, INK, 1, jit); } else { burin(g, [[cx - 100, y + 25], [cx + 100, y + 25]], 0.8, 'rgba(22,32,26,0.25)', 1, jit); } g.restore(); };
    cell(520, pv, pl, pe, '#8A5A22', TAN); cell(800, bv, bl, be, GOLD, POOL);
    if (pe !== 'potFat' && f >= T[pe] && f < T[pe] + 30) { const pu = Math.sin(Math.PI * seg(f, T[pe], T[pe] + 30)); g.save(); g.strokeStyle = `rgba(47,122,28,${0.85 * pu})`; g.lineWidth = 3.5; g.strokeRect(400, y - 34, 240, 76); g.restore(); }
  });
  const fh = seg(f, E.fatHi, E.fatHi + 10); if (fh > 0) { const y = 930 + 4 * 86; const pu = f < E.fatHi + 30 ? Math.sin(Math.PI * seg(f, E.fatHi, E.fatHi + 30)) : 0; g.save(); g.strokeStyle = `rgba(154,100,16,${0.9 * pu})`; g.lineWidth = 3.5; g.strokeRect(680, y - 34, 240, 76); g.restore(); g.save(); g.globalAlpha = fh; text(g, '≈ 100 of the butter’s 102 kcal come from its fat', 540, 1392, '900 26px NDisplay', GOLD, 'center', 0, 'fig'); g.restore(); }
}
// ---------------- D/E: the same potato with three butter portions (stacked kcal bars), then "same potato, log the topping"
const PORT = [[270, 36, 'pat', '+ 1 pat · 5 g', '≈ 195', 'pat'], [540, 102, 'tbsp', '+ 1 tbsp · 14 g', '≈ 265', 'tbsp1'], [810, 204, '2 tbsp', '+ 2 tbsp · 28 g', '≈ 365', 'tbsp2']];
function scenePortions(g, f, jit) {
  const rv = seg(f, E.bars, E.bars + 14); if (rv <= 0) return; const base = 1180, KP = 1.2, bw = 150;
  g.save(); g.globalAlpha = rv; text(g, 'one medium potato + butter, in kcal', 540, 690, '900 30px NDisplay', INK, 'center', 0, 'fig'); g.restore();
  PORT.forEach(([cx, kc, , lab, tot, ev], i) => {
    const a = seg(f, E.bars + i * 4, E.bars + 12 + i * 4); if (a <= 0) return; const hp = 161 * KP * eo(a), x0 = cx - bw / 2;
    g.save(); g.globalAlpha = a; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = TAN; g.fillRect(x0, base - hp, bw, hp); g.restore(); burin(g, [[x0, base], [x0, base - hp], [x0 + bw, base - hp], [x0 + bw, base]], 2, INK, 1, jit);
    const sm = seg(f, E.same, E.same + 10); text(g, sm > 0.5 ? 'same potato' : 'potato', cx, base - hp / 2 + 4, '700 22px NText', INK, 'center', 0, 'fig'); text(g, '≈ 160', cx, base - hp / 2 + 30, '900 24px NDisplay', '#8A5A22', 'center', 0, 'fig');
    text(g, lab, cx, base + 34, '700 22px NText', INK, 'center', 0, 'fig'); g.restore();
    if (f >= E.same && f < E.same + 34) { const pu = Math.sin(Math.PI * seg(f, E.same, E.same + 34)); g.save(); g.strokeStyle = `rgba(47,122,28,${0.9 * pu})`; g.lineWidth = 4; g.strokeRect(x0 - 6, base - 161 * KP - 6, bw + 12, 161 * KP + 12); g.restore(); }
    const b = seg(f, E[ev], E[ev] + 16); if (b <= 0) return; const hb = kc * KP * eo(b), yb = base - 161 * KP;
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = POOL; g.fillRect(x0, yb - hb, bw, hb); g.restore(); burin(g, [[x0, yb], [x0, yb - hb], [x0 + bw, yb - hb], [x0 + bw, yb]], 2, INK, 1, jit);
    for (let j = 0; j < Math.floor(hb / 12); j++) burin(g, [[x0 + 4, yb - 6 - j * 12], [x0 + bw - 4, yb - 2 - j * 12]], 0.6, 'rgba(22,32,26,0.3)', 1, jit);
    if (b >= 1) { text(g, `+ ≈ ${kc === 36 ? 35 : kc === 102 ? 100 : 200}`, cx, yb - hb / 2 + (hb > 40 ? 9 : 8), hb > 40 ? '900 26px NDisplay' : '900 21px NDisplay', INK, 'center', 0, 'fig'); text(g, tot + ' kcal', cx, yb - hb - 14, '900 30px NDisplay', GOLD, 'center', 0, 'fig'); }
    const lg = seg(f, E.logIt + i * 8, E.logIt + 14 + i * 8); if (lg > 0) { const tx = x0 + bw + 6, ty = yb - hb / 2; burin(g, [[tx, ty], [tx + 9, ty + 10], [tx + 26, ty - 14]], 3, LEAFDARK, lg, jit); }
  });
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
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0);
  g.fillStyle = 'rgba(22,32,26,0.04)'; g.fillRect(62, 528, 956, 984);
  g.strokeStyle = 'rgba(90,182,38,0.55)'; g.lineWidth = 5; g.strokeRect(62, 528, 956, 984);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(74, 540, 932, 960); g.strokeStyle = INK2; g.lineWidth = 0.8; g.strokeRect(84, 550, 912, 940);
  const tt = seg(f, E.title, E.title + 22);
  if (tt > 0) { const t1 = 'PLATE XIII', t2 = 'BAKED POTATO, THEN BUTTER'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 4); }
  if (clipScene(f, null, E.burnish)) { sceneHook(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish));
  if (f >= E.burnish && clipScene(f, E.burnish, E.burnish2)) { sceneLedger(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish2));
  if (f >= E.burnish2 && clipScene(f, E.burnish2, null)) { scenePortions(g, f, jit); g.restore(); }
  sweepBand(g, sweep(f, E.burnish2));
  const lg = seg(f, 150, 180);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'USDA FoodData Central: baked potato FDC 170093 · butter FDC 173410'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
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
