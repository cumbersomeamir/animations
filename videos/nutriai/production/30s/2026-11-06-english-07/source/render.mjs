// CalMeter English 30 s english-07 (2026-11-06): one large boiled egg, then fried with one measured teaspoon of oil.
// Same accepted style as the English peanut episode (english-06) and the papaya episode: Copperplate-engraving plate on IVORY
// #F4EEDC with deep ink #16201A, large engraved cutaway, natural washes, same burin, roundels, burnish transitions, camera,
// English caption layout (Inter Display Black 58 px, baselines 401/455) and the CalMeter CTA seal. This file is
// production/30s/2026-11-06-english-06/source/render.mjs with the food geometry swapped: an engraved egg sliced in the first
// second, a halved boiled egg cutaway (shell rim, white, layered yolk), a frying pan with a measured teaspoon of oil poured in
// and an egg fried in it, protein / energy bars (the oil adds energy, not protein) and a generic engraved ingredient ledger
// (egg + oil as separate lines; not an app screen). Original Canvas2D code; art direction only from lemo-opuscar
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
const SHELLC = '#EFD9B4', WHITE = '#FBF7EC', YOLK = '#F2AE2A', YOLK_L = '#F7C95A', OIL = '#E8B43A', IRON = '#3A3F3A';
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
// ---------------- whole egg (analytic ovoid; narrow end up; contour / cross-contour / crossing hatch by tone)
const EG = { x: 540, y: 940, A: 196, B: 262, C: 190 };
const Lv = (() => { const v = [-0.55, 0.6, 0.58]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function gbody(u, v, cx = EG.x, cy = EG.y, sc = 1) {
  const r = Math.sqrt(Math.max(0, 1 - u * u)) * (0.93 - 0.09 * u);
  const X = EG.A * r * Math.cos(v), Y = EG.B * u, Z = EG.C * r * Math.sin(v);
  const nx = X / (EG.A * EG.A), ny = Y / (EG.B * EG.B), nz = Z / (EG.C * EG.C), nl = Math.hypot(nx, ny, nz) || 1;
  return { x: cx + X * sc, y: cy - Y * sc, tone: clamp(1 - clamp((nx * Lv[0] + ny * Lv[1] + nz * Lv[2]) / nl) * 1.15) };
}
const GF = (() => { const fam = { 1: [], 2: [], 3: [] }, th = { 1: 0.14, 2: 0.5, 3: 0.75 }, raw = { 1: [], 2: [], 3: [] };
  for (let i = 1; i < 30; i++) { const v = (i / 30) * Math.PI, p = []; for (let k = 0; k <= 80; k++) p.push([-0.985 + 1.97 * (k / 80), v]); raw[1].push(p); }
  for (let i = 1; i < 26; i++) { const u = -0.95 + 1.9 * (i / 26), p = []; for (let k = 0; k <= 60; k++) p.push([u, 0.04 + (Math.PI - 0.08) * (k / 60)]); raw[2].push(p); }
  for (let i = -12; i < 22; i++) { const p = []; for (let k = 0; k <= 60; k++) { const u = -0.98 + 1.96 * (k / 60), v = 0.27 * i + 1.5 * (k / 60); if (v > 0.04 && v < Math.PI - 0.04) p.push([u, v]); } if (p.length > 4) raw[3].push(p); }
  for (const k of [1, 2, 3]) for (const p of raw[k]) { let cur = []; for (const [u, v] of p) { if (gbody(u, v).tone > th[k]) cur.push([u, v]); else { if (cur.length > 3) fam[k].push(cur); cur = []; } } if (cur.length > 3) fam[k].push(cur); }
  return fam; })();
const gsil = (cx, cy, sc) => { const a = [], b = []; for (let k = 0; k <= 120; k++) { const u = -1 + 2 * (k / 120); a.push(gbody(u, 0, cx, cy, sc)); b.push(gbody(u, Math.PI, cx, cy, sc)); } return a.concat(b.reverse()); };
function drawWholeEgg(g, cx, cy, sc, jit, reveal, wash) {
  const sil = gsil(cx, cy, sc); g.save(); g.fillStyle = PAPER; poly(g, sil.map((p) => [p.x, p.y])); g.fill(); g.restore();
  if (wash > 0) { g.save(); poly(g, sil.map((p) => [p.x, p.y])); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9 * eo(wash); const lg = g.createRadialGradient(cx - 70 * sc, cy - 80 * sc, 10, cx, cy, 300 * sc); lg.addColorStop(0, '#FBF1DD'); lg.addColorStop(0.6, SHELLC); lg.addColorStop(1, '#D4B486'); g.fillStyle = lg; g.fillRect(0, 0, W, H); g.restore(); }
  burin(g, sil, 3.4 * sc, INK, seg(reveal, 0, 0.35), jit, (j) => sil[j].tone);
  const fam = (k, w, a0, a1, alpha) => GF[k].forEach((run, i) => { const r = clamp(seg(reveal, a0, a1) * 1.5 - (i % 10) * 0.05); if (r > 0) { const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, w * sc, `rgba(22,32,26,${alpha})`, r, jit, (j) => pts[j].tone); } });
  fam(1, 1.2, 0.15, 0.6, 0.75); fam(2, 0.95, 0.35, 0.85, 0.62); fam(3, 0.8, 0.55, 1.0, 0.5);
  const q = rng(5); g.fillStyle = 'rgba(22,32,26,0.35)'; for (let i = 0; i < 90 * seg(reveal, 0.6, 1); i++) { const p = gbody(-0.9 + 1.8 * q(), 0.2 + 2.7 * q(), cx, cy, sc); if (p.tone < 0.35) continue; g.beginPath(); g.arc(p.x, p.y, 0.9 + q(), 0, 7); g.fill(); }   // shell pores
}
// ---------------- cutaway: a boiled egg halved lengthwise (shell rim, white, layered yolk)
const HALF = (() => { const out = []; for (let k = 0; k <= 160; k++) { const t = (k / 160) * Math.PI * 2; const p = gbody(Math.sin(t), Math.cos(t) > 0 ? 0 : Math.PI); out.push([p.x, p.y]); } return out; })();
const halfAt = (k) => { const c = [EG.x, EG.y]; return HALF.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]); };
const YK = { x: 540, y: 990, r: 124 };
function drawHalfEgg(g, r, jit, wa, glint = 0) {
  const out = halfAt(1.0), inn = halfAt(0.965);
  g.save(); g.fillStyle = PAPER; poly(g, out); g.fill(); g.restore();
  washPts(g, out, SHELLC, 0.9 * eo(wa)); g.save(); g.fillStyle = WHITE; poly(g, inn); g.fill(); g.restore();
  const shadeW = []; for (let i = 0; i < 26; i++) { const y = lerp(EG.y - EG.B + 30, EG.y + EG.B - 30, i / 25); shadeW.push(y); }
  g.save(); poly(g, inn); g.clip(); const wr = seg(r, 0.3, 0.7); shadeW.forEach((y, i) => { if (i / shadeW.length > wr) return; burin(g, [[EG.x + 40, y], [EG.x + 220, y + 6]], 0.7, `rgba(60,80,90,${0.18 + 0.2 * ((y - EG.y + EG.B) / (2 * EG.B))})`, 1, jit); }); g.restore();   // cool shade in the white
  const yr = seg(r, 0.4, 0.9);
  if (yr > 0) { const yk = ell(YK.x, YK.y, YK.r * (1 + 0.02 * Math.sin(r * 9)), YK.r * 0.96, 0, Math.PI * 2, 64); g.save(); g.fillStyle = PAPER; poly(g, yk); g.fill(); g.restore();
    g.save(); poly(g, yk); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = eo(wa); const gr = g.createRadialGradient(YK.x - 30, YK.y - 30, 10, YK.x, YK.y, YK.r); gr.addColorStop(0, YOLK_L); gr.addColorStop(1, YOLK); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    burin(g, yk, 2.6, INK, yr, jit); for (let i = 1; i < 6; i++) burin(g, ell(YK.x + 4, YK.y + 4, YK.r * (1 - i * 0.15), YK.r * 0.96 * (1 - i * 0.15), 0, Math.PI * 2, 48), 0.8, 'rgba(22,32,26,0.35)', clamp(yr * 1.5 - i * 0.1), jit);   // yolk layers
    for (let i = 0; i < 10; i++) burin(g, [[YK.x + 30 + i * 8, YK.y - 70 + i * 4], [YK.x + 50 + i * 6, YK.y + 80 - i * 3]], 0.7, 'rgba(22,32,26,0.3)', clamp(yr * 1.4 - 0.4), jit); 
    if (glint > 0 && glint < 1) { g.save(); poly(g, yk); g.clip(); g.strokeStyle = 'rgba(255,250,235,0.75)'; g.lineWidth = 16; g.beginPath(); const gx = lerp(YK.x - YK.r * 1.3, YK.x + YK.r * 1.3, glint); g.moveTo(gx - 60, YK.y - YK.r); g.lineTo(gx + 20, YK.y + YK.r); g.stroke(); g.restore(); } }
  burin(g, out, 3.6, INK, seg(r, 0, 0.3), jit); burin(g, inn, 1.4, INK, seg(r, 0.1, 0.35), jit);
}
// ---------------- the pan: measured teaspoon of oil poured in, an egg fried in it
const PAN = { x: 540, y: 960, rx: 300, ry: 236 };
const FRIED = (() => { const p = []; for (let k = 0; k <= 64; k++) { const a = (k / 64) * Math.PI * 2; const rr = 1 + 0.12 * Math.sin(a * 3 + 1) + 0.07 * Math.sin(a * 7) + 0.04 * Math.sin(a * 13); p.push([PAN.x - 10 + Math.cos(a) * 150 * rr, PAN.y + 10 + Math.sin(a) * 124 * rr]); } return p; })();
function drawPan(g, f, r, jit) {
  const rim = ell(PAN.x, PAN.y, PAN.rx, PAN.ry, 0, Math.PI * 2, 96), inner = ell(PAN.x, PAN.y + 8, PAN.rx - 26, PAN.ry - 22, 0, Math.PI * 2, 96);
  const handle = [[PAN.x - PAN.rx + 20, PAN.y - 40], [96, PAN.y - 150], [104, PAN.y - 120], [PAN.x - PAN.rx + 30, PAN.y - 4]];
  g.save(); g.fillStyle = PAPER; poly(g, rim); g.fill(); poly(g, handle); g.fill(); g.restore(); washPts(g, rim, '#9CA198', 0.85 * eo(r)); washPts(g, handle, '#6E5238', 0.85 * eo(r)); g.save(); g.fillStyle = '#E4E4DC'; poly(g, inner); g.fill(); g.restore(); washPts(g, inner, '#D2D4CB', 0.7 * eo(r));
  burin(g, rim, 3.4, INK, seg(r, 0, 0.4), jit); burin(g, inner, 2.0, INK, seg(r, 0.1, 0.45), jit); burin(g, handle.concat([handle[0]]), 2.6, INK, seg(r, 0.2, 0.5), jit);
  for (let i = 0; i < 22; i++) { const a = -0.5 + i * 0.09; burin(g, [[PAN.x + Math.cos(a) * (PAN.rx - 6), PAN.y + Math.sin(a) * (PAN.ry - 6)], [PAN.x + Math.cos(a) * (PAN.rx - 24), PAN.y + 8 + Math.sin(a) * (PAN.ry - 22)]], 1.0, INK2, seg(r, 0.3, 0.6), jit); }   // rim wall shade
  const q = rng(3); for (let i = 0; i < 26; i++) { const y = PAN.y - PAN.ry + 40 + i * 16; const w = (PAN.rx - 30) * Math.sqrt(Math.max(0, 1 - Math.pow((y - PAN.y - 8) / (PAN.ry - 22), 2))); burin(g, [[PAN.x + w * 0.35, y], [PAN.x + w * 0.95, y + 3]], 0.7, 'rgba(22,32,26,0.4)', seg(r, 0.4, 0.8), jit); }   // pan floor hatch (shade side)
  // oil: a measured teaspoon spreads into a thin golden pool
  const po = seg(f, E.oil, E.oil + 36);
  if (po > 0) { const R = lerp(20, 210, eo(po)); const pool = ell(PAN.x - 10, PAN.y + 10, R * (1 + 0.05 * Math.sin(f * 0.3)), R * 0.8, 0, Math.PI * 2, 64); g.save(); g.globalAlpha = 0.62; const og = g.createRadialGradient(PAN.x - 40, PAN.y - 20, 10, PAN.x - 10, PAN.y + 10, R); og.addColorStop(0, '#F7D57A'); og.addColorStop(1, '#E2A92C'); g.fillStyle = og; poly(g, pool); g.fill(); g.restore(); burin(g, pool, 1.0, 'rgba(22,32,26,0.45)', 1, jit); for (let k = 0; k < 6; k++) { const a = k * 1.1 + f * 0.05; g.save(); g.strokeStyle = 'rgba(255,248,225,0.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(PAN.x - 10 + Math.cos(a) * R * 0.55, PAN.y + 10 + Math.sin(a) * R * 0.42, 10, 3, a, 0, 7); g.stroke(); g.restore(); } }
  // fried egg dropped into the oil
  const ei = seg(f, E.eggIn, E.eggIn + 12);
  if (ei > 0) { const s = eo(ei); const fr = FRIED.map(([x, y]) => [PAN.x - 10 + (x - PAN.x + 10) * s, PAN.y + 10 + (y - PAN.y - 10) * s]); g.save(); g.fillStyle = WHITE; poly(g, fr); g.fill(); g.restore(); burin(g, fr, 1.8, INK, 1, jit);
    for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2 + 0.1; const [x, y] = fr[Math.round((k / 24) * 64)]; burin(g, [[x, y], [lerp(x, PAN.x - 10, 0.12), lerp(y, PAN.y + 10, 0.12)]], 0.8, 'rgba(160,110,40,0.7)', 1, jit); }   // crisp lacy edge
    const yk = ell(PAN.x - 20, PAN.y, 54 * s, 46 * s, 0, Math.PI * 2, 40); g.save(); g.fillStyle = PAPER; poly(g, yk); g.fill(); g.restore(); washPts(g, yk, YOLK, 1); burin(g, yk, 2.2, INK, 1, jit); for (let i = 0; i < 7; i++) burin(g, [[PAN.x - 2 + i * 4, PAN.y - 30 + i * 2], [PAN.x + 2 + i * 4, PAN.y + 34 - i * 3]], 0.7, 'rgba(22,32,26,0.35)', 1, jit); g.fillStyle = 'rgba(255,250,235,0.85)'; g.beginPath(); g.ellipse(PAN.x - 38, PAN.y - 18, 14, 7, -0.5, 0, 7); g.fill();
    const sz = seg(f, E.sizzle, E.sizzle + 60); if (sz > 0 && sz < 1) { const qq = rng(900 + Math.floor(f / 2)); for (let i = 0; i < 14; i++) { const a = qq() * 6.28, d = 160 + qq() * 40; g.strokeStyle = 'rgba(22,32,26,0.5)'; g.lineWidth = 1; g.beginPath(); g.arc(PAN.x - 10 + Math.cos(a) * d, PAN.y + 10 + Math.sin(a) * d * 0.78, 2 + qq() * 2, 0, 7); g.stroke(); } } }
}
function drawTeaspoon(g, f, jit) {   // measuring teaspoon above the pan; tilts and pours one level teaspoon (4.5 g)
  const sIn = seg(f, E.spoon - 6, E.spoon + 8), tilt = eio(seg(f, E.pour - 6, E.pour + 10)), out = seg(f, E.eggIn - 6, E.eggIn + 6); if (sIn <= 0 || out >= 1) return;
  const x = lerp(1000, 760, eo(sIn)), y = 700; g.save(); g.globalAlpha = 1 - out; g.translate(x, y); g.rotate(-0.9 * tilt);
  const bowl = ell(0, 0, 40, 26, 0, Math.PI * 2, 36); g.fillStyle = '#E6E7E2'; poly(g, bowl); g.fill(); burin(g, bowl, 2.4, INK, 1, jit);
  if (tilt < 0.7) { const lvl = ell(0, -2, 34, 20, 0, Math.PI * 2, 30); washPts(g, lvl, OIL, 0.8 * (1 - tilt)); burin(g, [[-34, -2], [34, -2]], 1.4, INK2, 1, jit); }
  const handle = [[38, -6], [150, -30], [152, -18], [40, 6]]; g.fillStyle = '#E6E7E2'; poly(g, handle); g.fill(); burin(g, handle.concat([handle[0]]), 2.0, INK, 1, jit);
  if (sIn >= 0.95) text(g, '1 tsp', 96, -40, '700 20px NText', INK, 'center', 1, 'fig');
  g.restore();
  const st = seg(f, E.pour, E.oil + 12) * (1 - seg(f, E.oil + 8, E.oil + 16)); if (st > 0) { const sx = x - 34, sy = y + 18; burin(g, [[sx, sy], [sx - 40, sy + 80], [PAN.x - 10, PAN.y + 10]], 3.2, 'rgba(232,180,58,0.9)', st, jit); }
  const tl = seg(f, E.tspLabel, E.tspLabel + 14) * (1 - out); if (tl > 0) { g.save(); g.globalAlpha = tl; text(g, '1 level tsp oil = 4.5 g', 760, 640, '700 22px NText', INK, 'center', 0, 'fig'); g.restore(); }
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'kcal', big: '78', unit: 'kcal', name: '1 LARGE EGG · 50 G', motif: 'rays', from: [EG.x - 100, EG.y - 60], fig: 2 },
  { ev: 'protein', big: '6.3 g', unit: 'protein', name: 'WHITE + YOLK', motif: 'dots', from: [YK.x + 40, YK.y + 20], fig: 3 },
];
function motif(g, kind, r, f, jit) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'dots') { const q = rng(9); g.fillStyle = 'rgba(242,174,42,0.8)'; for (let i = 0; i < 70; i++) { const a = q() * 6.28, d = Math.sqrt(q()) * R * 0.85; if (i / 70 < r) { g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 2.4, 0, 7); g.fill(); } } }
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
  if (lt > 0) { text(g, fact.big.slice(0, Math.max(1, Math.ceil(fact.big.length * lt))), 0, 2, '900 56px NDisplay', INK, 'center', 0, 'roundel'); if (lt >= 1) { text(g, fact.unit, 0, 36, '700 22px NText', LEAFDARK, 'center', 1, 'roundel'); text(g, fact.name, 0, 66, '700 14px NText', INK2, 'center', 2, 'roundel'); } }
  if (p >= 1) text(g, `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- bars: what the oil adds (protein + 0 g; energy + up to 40 kcal)
function drawBars(g, f, jit, out) {
  const r = seg(f, E.bars, E.bars + 12); if (r <= 0 || out >= 1) return;
  g.save(); g.globalAlpha = 1 - out; const x0 = 250;
  const row = (y, label, eggW, oilW, eggText, t0, oilT, oilLabel) => {   // eggW / oilW in px: protein 6.3 g -> 312 px; energy 4 px per kcal
    text(g, label, x0 - 16, y + 30, '900 26px NDisplay', INK, 'right', 0, 'fig');
    const ge = eo(seg(f, t0, t0 + 20)), we = eggW * ge; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#F3DDA4'; g.fillRect(x0, y, we, 40); g.restore(); burin(g, [[x0, y], [x0 + we, y], [x0 + we, y + 40], [x0, y + 40], [x0, y]], 1.8, INK, 1, jit);
    if (ge >= 1) text(g, eggText, x0 + 12, y + 28, '700 21px NText', INK, 'left', 0, 'fig');
    const go = eo(seg(f, oilT, oilT + 20));
    if (go > 0 && oilW > 0) { const wo = oilW * go; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = OIL; g.fillRect(x0 + we, y, wo, 40); g.restore(); for (let i = 0; i < Math.floor(wo / 12); i++) burin(g, [[x0 + we + 4 + i * 12, y + 36], [x0 + we + 14 + i * 12, y + 4]], 0.8, 'rgba(22,32,26,0.5)', 1, jit); burin(g, [[x0 + we, y], [x0 + we + wo, y], [x0 + we + wo, y + 40], [x0 + we, y + 40]], 1.8, INK, 1, jit); }
    if (go > 0) { g.save(); g.globalAlpha = (1 - out) * go; text(g, oilLabel, x0 + eggW + oilW + 16, y + 28, '900 24px NDisplay', oilW > 0 ? '#9A6A12' : LEAFDARK, 'left', 0, 'fig'); g.restore(); }
  };
  row(1268, 'Protein', 312, 0, 'egg 6.3 g', E.protBar, E.protSame, '+ 0 g from oil');
  row(1376, 'Energy', 312, 160, 'egg 78 kcal', E.energyBar, E.oilBlock, '+ up to 40');
  g.restore();
}
// ---------------- ledger: a generic engraved ingredient list (egg and oil as separate lines; not an app screen)
function drawLedger(g, f, jit, out) {
  const r = seg(f, E.ledger, E.ledger + 14); if (r <= 0 || out >= 1) return;
  g.save(); g.globalAlpha = 1 - out; const x0 = 140, y0 = 1250, w = 800, h = 226;
  g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, w, h); burin(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [x0, y0]], 2.4, INK, r * 1.3, jit); burin(g, [[x0 + 8, y0 + 8], [x0 + w - 8, y0 + 8], [x0 + w - 8, y0 + h - 8], [x0 + 8, y0 + h - 8], [x0 + 8, y0 + 8]], 0.9, INK2, r * 1.3, jit);
  if (r >= 0.6) { text(g, 'INGREDIENTS', x0 + 26, y0 + 42, '700 20px NText', INK2, 'left', 4, 'fig'); burin(g, [[x0 + 20, y0 + 56], [x0 + w - 20, y0 + 56]], 1.6, INK, 1, jit); }
  const rowT = (t0, y, a, b, c) => { const q = seg(f, t0, t0 + 20); if (q <= 0) return; const s = a; text(g, s.slice(0, Math.ceil(s.length * q)), x0 + 26, y, '700 26px NText', INK, 'left', 0, 'fig'); if (q >= 1) { text(g, b, x0 + w - 200, y, '600 22px NText', INK2, 'right', 0, 'fig'); text(g, c, x0 + w - 26, y, '900 26px NDisplay', LEAFDARK, 'right', 0, 'fig'); } };
  rowT(E.row1, y0 + 104, '1 large boiled egg', '50 g', '78 kcal'); rowT(E.row2, y0 + 160, '+ cooking oil, 1 level tsp', '4.5 g', '≤ 40 kcal');
  const tk = seg(f, E.tick, E.tick + 10); if (tk > 0) { burin(g, [[x0 + w - 40, y0 + 192], [x0 + w - 30, y0 + 204], [x0 + w - 12, y0 + 180]].map(([a, b]) => [a - 160, b - 10]), 3.0, LEAF, tk, jit); }
  const rl = seg(f, E.rule, E.rule + 30); if (rl > 0) text(g, 'measured, not guessed'.slice(0, Math.ceil(21 * rl)), x0 + 26, y0 + 206, '600 20px NText', INK2, 'left', 0, 'fig');
  g.restore();
}
// ---------------- paper, camera, captions, CTA (unchanged from the accepted English episodes)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
function camera(f) { const keys = [[0, 1.18, 540, 870], [56, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [900, 1.0, 540, 1010]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const t = eio(seg(f, f0, f1)); return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
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
  const tk = seg(f, E.ctaWord + 26, E.ctaWord + 106); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
const sweep = (f, t0) => { const b = seg(f, t0, t0 + 20); return { b, x: lerp(100, 1000, b) }; };
function sweepBand(g, s) { if (s.b > 0 && s.b < 1) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(s.x, 640); g.lineTo(s.x, 1250); g.stroke(); g.restore(); } }
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2; FRAME = f30; const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera(f); g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0);
  g.fillStyle = 'rgba(22,32,26,0.04)'; g.fillRect(62, 528, 956, 984);
  g.strokeStyle = 'rgba(90,182,38,0.55)'; g.lineWidth = 5; g.strokeRect(62, 528, 956, 984);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(74, 540, 932, 960); g.strokeStyle = INK2; g.lineWidth = 0.8; g.strokeRect(84, 550, 912, 940);
  const tt = seg(f, E.title, E.title + 22);
  if (tt > 0) { const t1 = 'PLATE IX', t2 = 'EGG · BOILED, THEN FRIED'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- A: whole egg engraved fast, sliced by a knife, then burnished to the halved boiled-egg cutaway
  const sB = sweep(f, E.burnish);
  if (sB.b < 1) {
    g.save(); if (sB.b > 0) { g.beginPath(); g.rect(sB.x, 0, W, H); g.clip(); }
    const part = eo(seg(f, E.part, E.part + 10)) * 30;
    if (part <= 0) drawWholeEgg(g, EG.x, EG.y, 1, jit, seg(f, -8, 22), seg(f, 2, 18));
    else { for (const side of [-1, 1]) { g.save(); g.beginPath(); g.rect(side < 0 ? 0 : EG.x, 0, side < 0 ? EG.x : W, H); g.clip(); g.translate(side * part, 0); drawWholeEgg(g, EG.x, EG.y, 1, jit, 1, 1); g.restore(); } g.save(); g.fillStyle = WHITE; g.fillRect(EG.x - part, EG.y - 200, 2 * part, 400); g.fillStyle = 'rgba(242,174,42,0.9)'; g.fillRect(EG.x - part, EG.y - 40, 2 * part, 120); g.restore(); }
    const kn = seg(f, E.knife, E.slice + 2); if (kn > 0 && part < 20) { const ky = lerp(560, 1000, eio(seg(f, E.knife, E.slice))); g.save(); g.globalAlpha = 1 - seg(f, E.part, E.part + 6); g.fillStyle = '#E4E6E1'; g.beginPath(); g.moveTo(EG.x - 8, ky - 280); g.lineTo(EG.x + 10, ky - 280); g.lineTo(EG.x + 14, ky); g.quadraticCurveTo(EG.x + 4, ky + 26, EG.x - 8, ky + 30); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke(); g.fillStyle = '#6B4B2E'; g.fillRect(EG.x - 12, ky - 400, 28, 122); g.strokeRect(EG.x - 12, ky - 400, 28, 122); g.restore(); if (f >= E.slice - 4) burin(g, [[EG.x, EG.y - EG.B + 10], [EG.x, EG.y + EG.B - 10]], 2.4, RED, seg(f, E.slice - 4, E.slice + 2), jit); }
    g.restore();
  }
  const sP = sweep(f, E.pan - 6), sE = sweep(f, E.bookend);
  if (f >= E.section && sP.b < 1) { g.save(); g.beginPath(); const bx0 = sP.b > 0 ? sP.x : 0, bx1 = sB.b < 1 ? sB.x : W; g.rect(bx0, 0, Math.max(0, bx1 - bx0), H); g.clip(); drawHalfEgg(g, seg(f, E.section, E.section + 30), jit, seg(f, E.washSection, E.washSection + 20)); g.restore(); }
  sweepBand(g, sB);
  const out1 = seg(f, E.roundelsOut, E.roundelsOut + 10);
  drawRoundel(g, FACTS[0], SLOTS[0], f, jit, out1); drawRoundel(g, FACTS[1], SLOTS[2], f, jit, out1);
  // --- C: the pan, a measured teaspoon of oil, an egg fried in it
  if (f >= E.pan - 6 && sE.b < 1) { g.save(); g.beginPath(); const bx0 = sE.b > 0 ? sE.x : 0, bx1 = sP.b < 1 ? sP.x : W; g.rect(bx0, 0, Math.max(0, bx1 - bx0), H); g.clip(); drawPan(g, f, seg(f, E.pan - 6, E.pan + 24), jit); g.restore(); drawTeaspoon(g, f, jit);
    const p40 = seg(f, E.plus40, E.plus40 + 12) * (1 - seg(f, E.barsOut, E.barsOut + 10)); if (p40 > 0) { g.save(); g.globalAlpha = p40; text(g, '+ up to 40 kcal', 812, 700, '900 34px NDisplay', '#9A6A12', 'center', 0, 'fig'); text(g, '1 tsp oil · 884 kcal / 100 g', 812, 734, '600 18px NText', INK2, 'center', 0, 'fig'); g.restore(); } }
  sweepBand(g, sP);
  drawBars(g, f, jit, seg(f, E.barsOut, E.barsOut + 12));
  drawLedger(g, f, jit, seg(f, E.ledgerOut, E.ledgerOut + 10));
  // --- E: bookend — the halved egg is re-cut above the CTA seal
  if (f >= E.bookend) { g.save(); g.beginPath(); g.rect(0, 0, sE.b < 1 ? sE.x : W, H); g.clip(); g.translate(0, -30); drawHalfEgg(g, seg(f, E.bookend, E.bookend + 124), jit, seg(f, E.bookend + 50, E.bookend + 124), seg(f, 856, 899)); /* final second: a glint sweeps the yolk */ g.restore(); }
  sweepBand(g, sE);
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'USDA FoodData Central: egg FDC 173424 · oil FDC 171411 (1 tsp = 4.5 g)'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
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
