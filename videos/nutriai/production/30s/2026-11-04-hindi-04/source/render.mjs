// CalMeter Hindi 30 s #04 (2026-11-04): "सौ ग्राम उबले हुए चने में क्या है?" (cooked chickpeas; per 100 g, then 1 cup = 164 g).
// Same accepted style as the Hindi orange episode (#03) and the guava / pomegranate / papaya episodes: Copperplate-engraving
// plate on IVORY #F4EEDC with deep ink #16201A, large engraved cutaway, vivid natural washes, same burin, hatch families,
// roundels, balance, camera, Hindi caption layout (Noto Sans Devanagari, ink-measured bounds, grapheme cutting) and CTA seal.
// This file is production/30s/2026-11-03-hindi-03/source/render.mjs with the food geometry swapped (a beaked, wrinkled
// chickpea + long section with seed coat, two cotyledons and the embryo; a chickpea sprig with pod), a "repair" motif for
// protein, and a measuring-cup balance that needs 100 g + 64 g to level. Original Canvas2D code; art direction only from
// lemo-opuscar styles/engraving/STYLE.md (no Three.js here). Stop motion: 15 drawings/s, each held 2 frames.
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
GlobalFonts.registerFromPath(path.join(here, 'fonts', 'NotoSansDevanagari-Black.ttf'), 'HDisplay');
GlobalFonts.registerFromPath(path.join(here, 'fonts', 'NotoSansDevanagari-Bold.ttf'), 'HText');
GlobalFonts.registerFromPath(path.join(here, 'fonts', 'NotoSansDevanagari-SemiBold.ttf'), 'HSemi');
const F = { cap: '900 56px HDisplay, NDisplay', big: (px) => `900 ${px}px HDisplay, NDisplay`, b: (px) => `700 ${px}px HText, NText`, s: (px) => `600 ${px}px HSemi, NText` };
const icon = await loadImage(path.resolve(here, '../../../../assets/icon.png'));
const TL = JSON.parse(fs.readFileSync(path.join(here, 'timeline.json')));
const E = TL.events;
const W = 1080, H = 1920, N = TL.frames;
const PAPER = '#F4EEDC', INK = '#16201A', INK2 = 'rgba(22,32,26,0.72)', LEAF = '#5AB626', LEAFDARK = '#2F7A1C';
const COAT = '#B4732E', COT_A = '#F2CC7E', COT_B = '#E5B35A', EMBRYO = '#C98A3A', PEA = '#E2B064';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const vnoise = (x) => Math.sin(x * 1.7) * 0.5 + Math.sin(x * 3.9 + 1.3) * 0.3 + Math.sin(x * 8.3 + 2.1) * 0.2;
const SEGM = new Intl.Segmenter('hi', { granularity: 'grapheme' });
const cut = (s, t) => { const gr = [...SEGM.segment(s)].map((x) => x.segment); return gr.slice(0, Math.max(t > 0 ? 1 : 0, Math.ceil(gr.length * clamp(t)))).join(''); };

// ---------------- logged text (bounds from measured ink, cached per string + font)
const TEXT_LOG = []; let FRAME = 0; const INK_CACHE = new Map();
function inkBox(s, font, track) {
  const key = font + '|' + track + '|' + s; if (INK_CACHE.has(key)) return INK_CACHE.get(key);
  const px = parseFloat(font.match(/(\d+)px/)[1]); const probe = createCanvas(10, 10).getContext('2d'); probe.font = font; probe.letterSpacing = `${track}px`;
  const w = Math.ceil(probe.measureText(s).width) + 4 * px, h = Math.ceil(px * 3); const c = createCanvas(w, h), q = c.getContext('2d');
  q.font = font; q.letterSpacing = `${track}px`; q.fillStyle = '#000'; q.textBaseline = 'alphabetic'; q.fillText(s, 2 * px, 2 * px);
  const d = q.getImageData(0, 0, w, h).data; let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const r = x1 < 0 ? null : { l: x0 - 2 * px, r: x1 + 1 - 2 * px, t: y0 - 2 * px, b: y1 + 1 - 2 * px }; INK_CACHE.set(key, r); return r;
}
function text(g, s, x, y, font, col, align = 'center', track = 0, tag = 'plate') {
  g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.letterSpacing = `${track}px`;
  g.fillText(s, x, y); const m = g.measureText(s); g.letterSpacing = '0px';
  if (g.globalAlpha < 0.05 || !s) return m.width;
  const ib = inkBox(s, font, track); if (!ib) return m.width;
  const x0 = align === 'center' ? x - m.width / 2 : align === 'right' ? x - m.width : x; const T = g.getTransform();
  const pts = [[x0 + ib.l, y + ib.t], [x0 + ib.r, y + ib.t], [x0 + ib.l, y + ib.b], [x0 + ib.r, y + ib.b]].map(([a, b]) => [T.a * a + T.c * b + T.e, T.b * a + T.d * b + T.f]);
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
// ---------------- whole chickpea (analytic wrinkled body + a curled beak at the upper left + the seam groove)
const G = { x: 540, y: 950, A: 250, B: 236, C: 240 };
const Lv = (() => { const v = [-0.55, 0.6, 0.58]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function gbody(u, v, cx = G.x, cy = G.y, sc = 1) {
  const r = Math.sqrt(Math.max(0, 1 - u * u)) * (1 + 0.035 * Math.sin(5 * v + 3 * u) + 0.02 * Math.sin(9 * u + 2 * v)) * (1 - 0.06 * Math.max(0, -u));
  const X = G.A * r * Math.cos(v), Y = G.B * u, Z = G.C * r * Math.sin(v);
  const nx = X / (G.A * G.A), ny = Y / (G.B * G.B), nz = Z / (G.C * G.C), nl = Math.hypot(nx, ny, nz) || 1;
  const lit = clamp((nx * Lv[0] + ny * Lv[1] + nz * Lv[2]) / nl);
  return { x: cx + X * sc, y: cy - Y * sc, tone: clamp(1 - lit * 1.15) };
}
function gfamilies() {
  const fam = { 1: [], 2: [], 3: [] }, th = { 1: 0.14, 2: 0.5, 3: 0.75 };
  const raw = { 1: [], 2: [], 3: [] };
  for (let i = 1; i < 34; i++) { const v = (i / 34) * Math.PI, p = []; for (let k = 0; k <= 80; k++) p.push([-0.985 + 1.97 * (k / 80), v]); raw[1].push(p); }
  for (let i = 1; i < 28; i++) { const u = -0.95 + 1.9 * (i / 28), p = []; for (let k = 0; k <= 60; k++) p.push([u, 0.04 + (Math.PI - 0.08) * (k / 60)]); raw[2].push(p); }
  for (let i = -12; i < 22; i++) { const p = []; for (let k = 0; k <= 60; k++) { const u = -0.98 + 1.96 * (k / 60), v = 0.27 * i + 1.5 * (k / 60); if (v > 0.04 && v < Math.PI - 0.04) p.push([u, v]); } if (p.length > 4) raw[3].push(p); }
  for (const k of [1, 2, 3]) for (const p of raw[k]) { let cur = []; for (const [u, v] of p) { const q = gbody(u, v); if (q.tone > th[k]) cur.push([u, v]); else { if (cur.length > 3) fam[k].push(cur); cur = []; } } if (cur.length > 3) fam[k].push(cur); }
  return fam;
}
const GF = gfamilies();
const gsil = (cx, cy, sc) => { const a = [], b = []; for (let k = 0; k <= 120; k++) { const u = -1 + 2 * (k / 120); a.push(gbody(u, 0, cx, cy, sc)); b.push(gbody(u, Math.PI, cx, cy, sc)); } return a.concat(b.reverse()); };
function beakPts(cx, cy, sc) {   // the chickpea's curled beak (2D), rooted on the upper-left shoulder
  const base = gbody(0.72, Math.PI * 0.8, cx, cy, sc), b2 = gbody(0.86, Math.PI * 0.62, cx, cy, sc);
  const tip = [base.x - 70 * sc, base.y - 58 * sc], ctl = [base.x - 64 * sc, base.y - 4 * sc], ctl2 = [b2.x - 30 * sc, b2.y - 66 * sc];
  const p = []; for (let i = 0; i <= 14; i++) { const t = i / 14; p.push([(1 - t) ** 2 * base.x + 2 * (1 - t) * t * ctl[0] + t * t * tip[0], (1 - t) ** 2 * base.y + 2 * (1 - t) * t * ctl[1] + t * t * tip[1]]); }
  for (let i = 1; i <= 14; i++) { const t = i / 14; p.push([(1 - t) ** 2 * tip[0] + 2 * (1 - t) * t * ctl2[0] + t * t * b2.x, (1 - t) ** 2 * tip[1] + 2 * (1 - t) * t * ctl2[1] + t * t * b2.y]); }
  return p;
}
function drawWholeChickpea(g, cx, cy, sc, f, jit, reveal = 1, wash = 1) {
  const sil = gsil(cx, cy, sc), bk = beakPts(cx, cy, sc);
  if (wash > 0) {  // seed-coat wash: pale gold highlight to warm tan to umber, laid under the ink
    g.save(); g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); bk.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip('nonzero');
    const ox = cx - 110 * sc, oy = cy - 120 * sc, R = 680 * sc * eo(wash);
    g.beginPath(); for (let k = 0; k <= 64; k++) { const th = (k / 64) * Math.PI * 2, rr = R * (1 + 0.06 * vnoise(th * 3 + 1)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9;
    const lg = g.createRadialGradient(cx - 90 * sc, cy - 100 * sc, 10, cx, cy, 300 * sc);
    lg.addColorStop(0, '#F8DEA2'); lg.addColorStop(0.5, '#E0AE62'); lg.addColorStop(1, '#AC7636');
    g.fillStyle = lg; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); g.restore();
  }
  burin(g, sil, 3.4 * Math.max(0.5, sc), INK, seg(reveal, 0, 0.3), jit, (j) => sil[j].tone);
  burin(g, bk, 3.0 * Math.max(0.5, sc), INK, seg(reveal, 0.2, 0.45), jit);
  for (let k = 1; k < 5; k++) { const a = bk[k * 2], b = bk[28 - k * 2]; burin(g, [a, [lerp(a[0], b[0], 0.5) - 4, lerp(a[1], b[1], 0.5)], b], 0.9, INK2, seg(reveal, 0.3, 0.55), jit); }
  const fam = (k, w, a0, a1, alpha) => GF[k].forEach((run, i) => { const r = clamp(seg(reveal, a0, a1) * 1.5 - (i % 10) * 0.05); if (r > 0) { const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, w * Math.max(0.5, sc), `rgba(22,32,26,${alpha})`, r, jit, (j) => pts[j].tone); } });
  fam(1, 1.4, 0.12, 0.6, 0.85); fam(2, 1.1, 0.35, 0.8, 0.72); fam(3, 0.85, 0.55, 1.0, 0.58);
  // seam groove between the two cotyledons, from the beak down across the front
  const sm = []; for (let k = 0; k <= 40; k++) { const t = k / 40; sm.push(gbody(0.7 - 1.5 * t, Math.PI * (0.78 - 0.42 * t), cx, cy, sc)); } burin(g, sm, 3.0 * Math.max(0.5, sc), INK, seg(reveal, 0.45, 0.8), jit);
}
function drawLeaf(g, bx, by, reveal, jit, washA, ang = 0.5, len = 168, wid = 54) {
  const P = (t, side) => { const x = t * len, y = side * wid * Math.sin(Math.PI * Math.pow(t, 0.85)) * (1 - 0.15 * t); return [bx + x * Math.cos(ang) - y * Math.sin(ang), by + x * Math.sin(ang) + y * Math.cos(ang)]; };
  const e1 = [], e2 = [], mid = []; for (let k = 0; k <= 40; k++) { const t = k / 40; e1.push(P(t, 1)); e2.push(P(t, -1)); mid.push(P(t, 0)); }
  if (washA > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9 * washA; g.fillStyle = LEAF; g.beginPath(); e1.concat(e2.slice().reverse()).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore(); }
  burin(g, e1, 1.6, INK, reveal * 1.4, jit); burin(g, e2, 1.8, INK, reveal * 1.4, jit); burin(g, mid, 1.2, INK, reveal * 1.2, jit);
}
function drawSprig(g, x, y, reveal, jit, washA) {   // chickpea sprig: stem, pinnate serrated leaflets, one inflated pod
  const stem = []; for (let k = 0; k <= 20; k++) { const t = k / 20; stem.push([x + 150 * t, y - 40 * t + 30 * Math.sin(Math.PI * t)]); } burin(g, stem, 2.2, INK, reveal * 1.3, jit);
  for (let i = 0; i < 7; i++) { const t = 0.12 + i * 0.12, [sx, sy] = stem[Math.round(t * 20)]; const side = i % 2 ? 1 : -1; drawLeaf(g, sx, sy, clamp(reveal * 1.6 - 0.1 - i * 0.08), jit, washA, side * 1.15 - 0.25, 38, 14); }
  const pr = clamp(reveal * 1.4 - 0.4); if (pr <= 0) return; const px = x + 92, py = y + 46;
  if (washA > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.85 * washA; g.fillStyle = '#B7C96A'; g.beginPath(); g.ellipse(px, py, 34, 22, 0.4, 0, 7); g.fill(); g.restore(); }
  const pod = []; for (let k = 0; k <= 30; k++) { const a = (k / 30) * Math.PI * 2; pod.push([px + Math.cos(a) * 34 * Math.cos(0.4) - Math.sin(a) * 22 * Math.sin(0.4), py + Math.cos(a) * 34 * Math.sin(0.4) + Math.sin(a) * 22 * Math.cos(0.4)]); } burin(g, pod, 1.8, INK, pr, jit);
  for (let k = 0; k < 5; k++) burin(g, [[px - 18 + k * 9, py + 6 + k * 3], [px - 10 + k * 9, py + 18 + k * 2]], 0.8, INK2, pr, jit);
  burin(g, [[px - 26, py - 16], [stem[8][0], stem[8][1]]], 1.4, INK, pr, jit);
}
// ---------------- cutaway (large long section): seed coat, two cotyledons split by the seam, the embryo in the beak
const S = { x: 540, y: 950, R: 278 };
const TB = -2.3;   // beak direction
const secR = (th) => { let d = th - TB; d = Math.atan2(Math.sin(d), Math.cos(d)); return S.R * (1 + 0.03 * Math.sin(3 * th + 1) + 0.012 * Math.sin(7 * th) + 0.2 * Math.exp(-(d * d) / 0.035)); };
const secPt = (th, k) => [S.x + Math.cos(th) * secR(th) * k, S.y + Math.sin(th) * secR(th) * k];
const secTone = (x, y) => { const dx = (x - S.x) / S.R, dy = (y - S.y) / S.R; return clamp(0.12 + 0.5 * (dx * 0.6 + dy * 0.7) * 0.9 + 0.45 * Math.pow(Math.hypot(dx, dy), 3)); };
const COATK = 0.955;
const SEAM = (() => { const p = []; for (let k = 0; k <= 40; k++) { const t = k / 40; const a = secPt(TB, 0.86), b = secPt(TB + Math.PI, 0.94); const x = lerp(a[0], b[0], t) + Math.sin(t * Math.PI) * 46, y = lerp(a[1], b[1], t) - Math.sin(t * Math.PI) * 36; p.push([x, y]); } return p; })();
const EMB = (() => { const a = secPt(TB, 0.95), dir = [Math.cos(TB), Math.sin(TB)]; return { x: a[0] - dir[0] * 62, y: a[1] - dir[1] * 62, rot: TB }; })();
const CELLS = (() => { const r = rng(55), out = []; for (let i = 0; i < 4000 && out.length < 950; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.93; const [x, y] = secPt(a, d); if (Math.hypot(x - EMB.x, y - EMB.y) < 40) continue; out.push([x, y, 0.8 + r() * 1.2]); } return out; })();
function ringPath(g, k0, k1) { g.beginPath(); for (let i = 0; i <= 240; i++) { const [x, y] = secPt((i / 240) * Math.PI * 2, k0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); if (k1 > 0) { for (let i = 240; i >= 0; i--) { const [x, y] = secPt((i / 240) * Math.PI * 2, k1); g.lineTo(x, y); } g.closePath(); } }
function bloomFill(g, fill, alpha, ox, oy, a) { const R = 760 * eo(a); g.beginPath(); for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2, rr = R * (1 + 0.07 * vnoise(th * 3 + ox)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip(); g.globalAlpha = alpha; g.fillStyle = fill; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); }
function halfClip(g, side) { g.beginPath(); const s0 = SEAM[0], s1 = SEAM[SEAM.length - 1]; g.moveTo(s0[0], s0[1]); SEAM.forEach(([x, y]) => g.lineTo(x, y)); const far = 900; const nx = -(s1[1] - s0[1]), ny = s1[0] - s0[0], nl = Math.hypot(nx, ny); g.lineTo(s1[0] + (nx / nl) * far * side, s1[1] + (ny / nl) * far * side); g.lineTo(s0[0] + (nx / nl) * far * side, s0[1] + (ny / nl) * far * side); g.closePath(); g.clip(); }
function drawSection(g, r, jit, wa) {
  if (wa > 0) {
    for (const [side, col] of [[1, COT_A], [-1, COT_B]]) { g.save(); g.globalCompositeOperation = 'multiply'; ringPath(g, COATK, 0); g.clip(); halfClip(g, side); bloomFill(g, col, 0.95, S.x - 70, S.y - 70, wa); g.restore(); }
    g.save(); g.globalCompositeOperation = 'multiply'; ringPath(g, 1.0, COATK); g.clip('evenodd'); bloomFill(g, COAT, 0.95, S.x - 150, S.y - 160, wa); g.restore();
    g.save(); g.globalCompositeOperation = 'multiply'; g.translate(EMB.x, EMB.y); g.rotate(EMB.rot); g.fillStyle = EMBRYO; g.globalAlpha = eo(wa); g.beginPath(); g.ellipse(0, 0, 64, 22, 0, 0, 7); g.fill(); g.restore();
  }
  // starch-cell stipple in the cotyledons (denser in shade), with the same line boil as the burin
  const cr = seg(r, 0.4, 1.0); g.fillStyle = 'rgba(22,32,26,0.55)';
  CELLS.forEach(([x, y, s], i) => { if (i / CELLS.length > cr) return; const t = secTone(x, y); if (t < 0.35 && i % 3) return; g.beginPath(); g.arc(x + (jit() - 0.5) * 1.5, y + (jit() - 0.5) * 1.5, s * (0.5 + t), 0, 7); g.fill(); });
  const kc = seg(r, 0.25, 0.7); for (let j = 0; j < 7; j++) { const k = 0.9 - j * 0.1, c = []; for (let i = 0; i <= 200; i++) c.push(secPt(-0.5 + (i / 200) * Math.PI * 2, k)); burin(g, c, 0.9, 'rgba(22,32,26,0.4)', clamp(kc * 7 - j), jit, (q) => secTone(c[q][0], c[q][1])); }
  burin(g, SEAM, 2.6, INK, seg(r, 0.3, 0.6), jit);
  const er = seg(r, 0.5, 0.8); if (er > 0) { g.save(); g.translate(EMB.x, EMB.y); g.rotate(EMB.rot); const e = []; for (let k = 0; k <= 30; k++) { const a = (k / 30) * Math.PI * 2; e.push([Math.cos(a) * 64, Math.sin(a) * 22]); } burin(g, e, 2.2, INK, er, jit); for (let k = -4; k <= 4; k++) burin(g, [[k * 12, -16], [k * 12 + 5, 16]], 1.0, INK2, er, jit); g.restore(); }
  const hr = seg(r, 0.55, 0.95); if (hr > 0) { g.save(); ringPath(g, COATK, 0); g.clip(); halfClip(g, -1); for (let i = -40; i < 40; i++) { const x0 = S.x + i * 11; const p = [[x0 - 300, S.y + 300], [x0 + 300, S.y - 300]].map(([x, y]) => [x, y]); const pts = []; for (let k = 0; k <= 30; k++) pts.push([lerp(p[0][0], p[1][0], k / 30), lerp(p[0][1], p[1][1], k / 30)]); burin(g, pts, 0.9, 'rgba(22,32,26,0.32)', hr, jit, (q) => secTone(pts[q][0], pts[q][1])); } g.restore(); }   // shaded cotyledon: crossing family
  const p = []; for (let i = 0; i <= 300; i++) p.push(secPt(-0.5 + (i / 300) * Math.PI * 2, 1)); burin(g, p, 3.8, INK, seg(r, 0, 0.2), jit);
  const sk = seg(r, 0.1, 0.4); for (let i = 0; i < 260 * sk; i++) { const th = (i / 260) * Math.PI * 2; const a = secPt(th, 1), b = secPt(th, COATK); g.strokeStyle = INK; g.lineWidth = secTone(a[0], a[1]) > 0.35 ? 1.3 : 0.7; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const cp = []; for (let i = 0; i <= 240; i++) cp.push(secPt((i / 240) * Math.PI * 2, COATK)); burin(g, cp, 1.6, INK, seg(r, 0.15, 0.4), jit);
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'kcal', big: '164', unit: 'कैलोरी', name: 'ऊर्जा', motif: 'rays', from: secPt(2.6, 0.55), fig: 2 },
  { ev: 'protein', big: '8.9', unit: 'ग्राम', name: 'प्रोटीन', motif: 'stipple', from: secPt(1.55, 0.6), fig: 3 },
  { ev: 'fibre', big: '7.6', unit: 'ग्राम', name: 'फ़ाइबर', motif: 'fibres', from: secPt(0.45, 0.6), fig: 4 },
];
const FACTS2 = [
  { ev: 'protein2', big: '8.9', unit: 'ग्राम प्रोटीन', name: 'कोशिका मरम्मत', motif: 'repair', from: secPt(2.3, 0.6), fig: 5 },
  { ev: 'fibre2', big: '7.6', unit: 'ग्राम फ़ाइबर', name: 'पाचन', motif: 'fibres', from: secPt(0.8, 0.6), fig: 6 },
];
function motif(g, kind, r, f, jit, act) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'fibres') { const ph = act * 4 + f * 0.04 * (0.3 + act); for (let i = -5; i <= 5; i++) { const p = []; for (let k = 0; k <= 32; k++) { const t = -1 + 2 * (k / 32); const x = t * R * 0.95, y = i * 15 + Math.sin(t * 4 + i + ph * 2.2) * (6 + 4 * act); if (Math.hypot(x, y) < R * 0.94) p.push([x, y]); } if (p.length > 3) burin(g, p, 1.3, `rgba(47,122,28,${0.45 + 0.35 * act})`, r, jit); } }
  if (kind === 'stipple') { const q = rng(9); g.fillStyle = 'rgba(176,118,54,0.85)'; for (let i = 0; i < 90; i++) { const a = q() * Math.PI * 2, d = Math.sqrt(q()) * R * 0.85; if (i / 90 < r) { g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 2.2, 0, 7); g.fill(); } } }
  if (kind === 'repair') {   // "प्रोटीन कोशिकाओं की मरम्मत में": a row of cells with a gap; a bead chain (amino acids) flows in and a new cell forms
    const cw = 28, ch = 24, y0 = 40;
    for (let row = 0; row < 2; row++) for (let c = -2; c <= 2; c++) { const x = c * (cw + 4) - cw / 2 + (row ? 0 : 6), y = y0 + row * (ch + 4); const gapCell = row === 0 && c === 0;
      if (gapCell) { const q = eio(clamp(act * 1.4 - 0.3)); if (q > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = q; g.fillStyle = '#F1C98A'; g.fillRect(x, y, cw, ch); g.restore(); burin(g, [[x, y], [x + cw, y], [x + cw, y + ch], [x, y + ch], [x, y]], 1.6, INK, q, jit); } continue; }
      g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#F3D9A6'; g.fillRect(x, y, cw, ch); g.restore(); burin(g, [[x, y], [x + cw, y], [x + cw, y + ch], [x, y + ch], [x, y]], 1.3, INK, r, jit); g.fillStyle = 'rgba(22,32,26,0.6)'; g.beginPath(); g.arc(x + cw / 2, y + ch / 2, 2.6, 0, 7); g.fill(); }
    const k = clamp(act * 1.5); for (let i = 0; i < 9; i++) { const t = clamp(k - i * 0.05); const x = lerp(-96 + i * 9, 6 + (i % 3) * 7, eio(t)), y = lerp(20 - Math.sin(i) * 4, y0 + 6 + Math.floor(i / 3) * 6, eio(t)); g.fillStyle = 'rgba(176,118,54,0.95)'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); }
  }
}
function drawRoundel(g, fact, slotXY, f, jit, act, out, opts = {}) {
  const t0 = E[fact.ev], p = seg(f, t0 - 4, t0 + 14); if (p <= 0 || out >= 1) return;
  const [sx, sy0] = slotXY, sy = sy0 - 34 * eio(act) * (opts.lift ?? 1);
  const k = eo(p); const x = lerp(fact.from[0], sx, k), y = lerp(fact.from[1], sy, k) - Math.sin(Math.PI * k) * 60;
  const sc = Math.exp(Math.log(0.25) * (1 - k)) * (1 + (opts.grow ?? 0.32) * eio(act));
  if (p >= 1 && out <= 0) {   // leader back to the part
    const lp = seg(f, t0 + 14, t0 + 24), dx = fact.from[0] - sx, dy = fact.from[1] - sy, dl = Math.hypot(dx, dy);
    const rx = sx + (dx / dl) * (RR * sc + 10), ry = sy + (dy / dl) * (RR * sc + 10);
    g.save(); g.strokeStyle = 'rgba(22,32,26,0.6)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(rx, ry); g.lineTo(lerp(rx, fact.from[0], lp), lerp(ry, fact.from[1], lp)); g.stroke(); if (lp >= 1) { g.fillStyle = INK; g.beginPath(); g.arc(fact.from[0], fact.from[1], 4.5, 0, 7); g.fill(); } g.restore();
  }
  g.save(); g.translate(x, y); g.scale(sc, sc);
  if (out > 0) { g.globalAlpha = 1 - out; }
  g.save(); g.beginPath(); g.arc(0, 0, RR, 0, 7); g.clip(); g.fillStyle = '#FBF6E8'; g.fillRect(-RR, -RR, 2 * RR, 2 * RR);
  g.strokeStyle = 'rgba(22,32,26,0.10)'; g.lineWidth = 1; for (let yy = -RR; yy < RR; yy += 6) { g.beginPath(); g.moveTo(-RR, yy); g.lineTo(RR, yy); g.stroke(); }
  motif(g, fact.motif, seg(f, t0, t0 + 14), f, jit, act); g.restore();
  const ring = seg(f, t0 - 4, t0 + 6);
  g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.arc(0, 0, RR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, RR + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke();
  const lt = seg(f, t0 + 10, t0 + 18);
  if (lt > 0) {
    const yv = fact.motif === 'repair' ? -40 : -6;
    text(g, cut(fact.big, lt), 0, yv, F.big(56), INK, 'center', 0, 'roundel');
    if (lt >= 1) { text(g, fact.unit, 0, yv + 30, F.b(fact.unit.length > 9 ? 18 : 21), LEAFDARK, 'center', 0, 'roundel'); text(g, fact.name, 0, fact.motif === 'repair' ? 24 : 62, F.b(19), INK2, 'center', 0, 'roundel'); }
  }
  if (p >= 1) text(g, `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- balance: a cup of cooked chickpeas vs 100 g, then + 64 g (USDA portion "cup" = 164 g)
const PEAS = (() => { const p = [], rows = [5, 4, 3, 2]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) p.push([(i - (n - 1) / 2) * 17 + (r % 2 ? 4 : -2), -2 - r * 12, (i * 7 + r) % 5]); }); return p; })();
function drawPea(g, x, y, s, rot, jit) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = PEA; g.beginPath(); g.arc(0, 0, s, 0, 7); g.fill(); g.beginPath(); g.moveTo(-s * 0.7, -s * 0.7); g.quadraticCurveTo(-s * 1.25, -s * 1.15, -s * 0.95, -s * 0.25); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, s, -2.1, 3.9); g.stroke(); g.beginPath(); g.moveTo(-s * 0.7, -s * 0.7); g.quadraticCurveTo(-s * 1.25, -s * 1.15, -s * 0.95, -s * 0.25); g.stroke(); g.lineWidth = 0.8; g.beginPath(); g.moveTo(-s * 0.5, -s * 0.4); g.quadraticCurveTo(0, s * 0.2, s * 0.6, s * 0.5); g.stroke(); g.fillStyle = 'rgba(255,248,230,0.6)'; g.beginPath(); g.arc(-s * 0.3, -s * 0.35, s * 0.25, 0, 7); g.fill(); g.restore(); }
function drawCup(g, px, py, jit, fill) {   // engraved measuring cup, heaped with chickpeas dropped in one by one, on the pan surface py
  g.fillStyle = PAPER; g.beginPath(); g.moveTo(px - 46, py - 72); g.lineTo(px + 46, py - 72); g.lineTo(px + 36, py - 2); g.lineTo(px - 36, py - 2); g.closePath(); g.fill();
  PEAS.forEach(([x, y, o], i) => { const k = clamp(fill * PEAS.length - i); if (k > 0) drawPea(g, px + x, py - 78 + y - (1 - eo(k)) * 110, 9, o, jit); });
  g.fillStyle = PAPER; g.beginPath(); g.moveTo(px - 46, py - 72); g.lineTo(px + 46, py - 72); g.lineTo(px + 36, py - 2); g.lineTo(px - 36, py - 2); g.closePath(); g.fill();
  burin(g, [[px - 46, py - 72], [px - 36, py - 2], [px + 36, py - 2], [px + 46, py - 72]], 2.4, INK, 1, jit);
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(px, py - 72, 46, 8, 0, 0, 7); g.stroke();
  for (let i = 0; i < 6; i++) burin(g, [[px + 16 + i * 4, py - 66], [px + 14 + i * 3.5, py - 6]], 0.8, INK2, 1, jit);
  for (let i = 1; i < 4; i++) burin(g, [[px - 41 + i * 1.6, py - 72 + i * 16], [px - 28 + i * 1.6, py - 72 + i * 16]], 1.0, INK, 1, jit);
  burin(g, [[px - 46, py - 60], [px - 70, py - 56], [px - 72, py - 34], [px - 40, py - 26]], 2.2, INK, 1, jit);
}
function weightBox(g, x0, w, h, py, label, jit) { burin(g, [[x0, py - 4], [x0, py - h], [x0 + w, py - h], [x0 + w, py - 4]], 2.4, INK, 1, jit); burin(g, [[x0 + w * 0.32, py - h], [x0 + w * 0.32, py - h - 14], [x0 + w * 0.68, py - h - 14], [x0 + w * 0.68, py - h]], 2.0, INK, 1, jit); g.fillStyle = PAPER; g.fillRect(x0 + 1, py - h + 1, w - 2, h - 6); for (let k = 1; k < 5; k++) burin(g, [[x0 + w - k * 5, py - h + 4], [x0 + w - k * 5, py - 8]], 0.7, INK2, 1, jit); text(g, label, x0 + w / 2 - 4, py - h / 2 + 6, F.b(w > 60 ? 19 : 16), INK, 'center', 0, 'fig'); }
function drawBalance(g, cx, cy, sc, r, tiltDeg, f, jit, cupIn, fill, w1, w2) {
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
  if (cupIn > 0) { const [lx, ly0] = pans[0]; drawCup(g, lx, ly0 + 70 - (1 - eo(cupIn)) * 240, jit, fill); }
  const [rx, ry0] = pans[1];
  if (w1 > 0) weightBox(g, rx - 74, 74, 78, ry0 + 70 - (1 - eo(w1)) * 200, '100 ग्रा.', jit);
  if (w2 > 0) weightBox(g, rx + 6, 54, 56, ry0 + 70 - (1 - eo(w2)) * 200, '64 ग्रा.', jit);
  g.restore();
}
// ---------------- paper (ivory, laid lines + fibres)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = 120; img.data[i + 1] = 105; img.data[i + 2] = 80; img.data[i + 3] = Math.floor(v * v * 18); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,0.06)'; g.lineWidth = 1; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 2); g.stroke(); } for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 18, a = r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
// ---------------- camera: loupe at the start, then a <= 2 % breathing push; never lifts the plate into the caption band
function camera(f) { const keys = [[0, 1.18, 540, 870], [56, 1.0, 540, 1010], [480, 1.02, 540, 1018], [700, 1.0, 540, 1010], [900, 1.0, 540, 1010]]; let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++; const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1]; const t = eio(seg(f, f0, f1)); return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) }; }
// ---------------- captions (screen-fixed, Hindi, two lines; Devanagari ink measured inside y 340-520)
function captions(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue; const out = seg(f, c.out - 6, c.out); const lines = [];
    for (const r of c.lines) { if (r.length > 2) lines[r[2]].push(r); else lines.push([r]); }
    lines.forEach((runs, li) => { const font = F.cap; g.font = font; const total = runs.reduce((a, r) => a + g.measureText(r[0]).width, 0); let x = 540 - total / 2; const y = li === 0 ? 412 : 488;
      for (const [s, f0] of runs) { const a = seg(f, f0, f0 + 6) * (1 - out); g.save(); g.globalAlpha = a; x += text(g, s, x, y, font, li === 0 ? INK : LEAFDARK, 'left', 0, 'caption'); g.restore(); } });
  }
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
  const tk = seg(f, E.ctaWord + 26, E.ctaWord + 114); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
const fmt = (v, d) => (d ? v.toFixed(d) : String(Math.round(v)));
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
  if (tt > 0) { text(g, 'PLATE VI'.slice(0, Math.ceil(8 * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, cut('चना · उबला हुआ', tt), 540, 626, F.b(28), INK, 'center', 0); }
  // chickpea sprig with pod, upper right (stays on the plate)
  drawSprig(g, 742, 690, seg(f, E.sprig, E.sprig + 40), jit, seg(f, E.washWhole + 4, E.washWhole + 30));
  // --- hook: whole chickpea cut, then burnished out while the large long section is re-cut
  const burn = seg(f, E.burnish, E.burnish + 20), sweepX = lerp(G.x - G.A - 120, G.x + G.A + 60, burn);
  if (burn < 1) {
    g.save(); if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    drawWholeChickpea(g, G.x, G.y, 1, f, jit, seg(f, -8, 56), seg(f, E.washWhole, E.washWhole + 24));
    g.restore();
    const ct = seg(f, E.cut, E.cut + 8);
    if (ct > 0 && burn < 0.7) { const p = []; for (let k = 0; k <= 50; k++) { const t = k / 50; const a = secPt(TB, 1.02), b = secPt(TB + Math.PI, 1.02); p.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]); } burin(g, p, 3.8, '#D6452B', ct, jit); }
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, G.y - 300); g.lineTo(sweepX, G.y + 300); g.stroke(); g.restore(); }
  }
  const sr = seg(f, E.section, E.section + 32);
  if (sr > 0) { g.save(); if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); } drawSection(g, sr, jit, seg(f, E.washSection, E.washSection + 20)); g.restore(); }
  // --- facts (roundels), then the two function roundels
  const out1 = seg(f, E.roundelsOut, E.roundelsOut + 10);
  FACTS.forEach((fa, i) => drawRoundel(g, fa, SLOTS[i], f, jit, 0, out1));
  const out2 = seg(f, E.roundels2Out, E.roundels2Out + 10);
  const actP = seg(f, E.repair, E.repair + 40) * (1 - seg(f, E.fibre2 + 4, E.fibre2 + 16)), actF = seg(f, E.digest, E.digest + 14);
  drawRoundel(g, FACTS2[0], [318, 1362], f, jit, actP, out2, { grow: 0.22 });
  drawRoundel(g, FACTS2[1], [762, 1362], f, jit, actF, out2, { grow: 0.22 });
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); text(g, cut('प्रति 100 ग्राम उबले चने (बिना नमक) · USDA FoodData Central FDC 173757', lg), 540, 1534, F.s(19), INK2, 'center', 0); }
  // --- volume vs grams: a cup of cooked chickpeas outweighs 100 g; + 64 g levels it (USDA: 1 cup = 164 g)
  const br = seg(f, E.balance, E.balance + 24), bOut = seg(f, E.balanceOut, E.balanceOut + 14);
  if (br > 0 && bOut < 1) {
    const cIn = seg(f, E.cupDrop - 8, E.cupDrop), fill = seg(f, E.fill, E.fill + 22), w1 = seg(f, E.w100 - 8, E.w100), w2 = seg(f, E.w64 - 8, E.w64);
    const sway = (t0) => (f >= t0 ? 2.4 * Math.exp(-(f - t0) / 16) * Math.sin((f - t0) * 0.55) : 0);
    const tilt = w1 <= 0 ? 9 * eo(cIn) : w2 <= 0 ? 9 - 5 * eo(w1) + sway(E.w100) : 4 * (1 - eo(w2)) + sway(E.w64);
    g.save(); if (bOut > 0) { const bx = lerp(130, 990, bOut); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
    drawBalance(g, 540, 1330, 0.86, br, tilt, f, jit, cIn, fill, w1, w2);
    const l1 = seg(f, E.cupDrop + 4, E.cupDrop + 18); if (l1 > 0) text(g, cut('1 कप (≈ 240 मि.ली.)', l1), 262, 1446, F.b(20), INK, 'center', 0, 'fig');
    const lt = seg(f, E.total, E.total + 16); if (lt > 0) text(g, cut('100 + 64 = 164 ग्राम', lt), 818, 1446, F.b(20), INK, 'center', 0, 'fig');
    const ck = eio(seg(f, E.countKcal - 18, E.countKcal + 6)), cp = eio(seg(f, E.countProt - 18, E.countProt + 6));
    if (f >= E.count) text(g, `≈ ${ck >= 1 ? 270 : fmt(lerp(164, 269, ck))} कैलोरी`, 262, 1480, F.big(26), LEAFDARK, 'center', 0, 'fig');
    if (f >= E.count + 30) text(g, `≈ ${fmt(lerp(8.9, 14.5, cp), 1)} ग्रा. प्रोटीन`, 818, 1480, F.big(24), LEAFDARK, 'center', 0, 'fig');
    g.restore();
    if (bOut > 0 && bOut < 1) { const bx = lerp(130, 990, bOut); g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, 1250); g.lineTo(bx, 1490); g.stroke(); g.restore(); }
  }
  // --- CTA: engraved CalMeter seal + wordmark, cut into the lower plate (clear of the bottom overlay)
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
