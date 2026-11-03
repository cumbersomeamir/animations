// CalMeter Hindi 30 s #03 (2026-11-03): "सौ ग्राम संतरे में असल में क्या है?" (100 g raw orange segments).
// Same accepted style as the guava / pomegranate / papaya episodes: Copperplate-engraving plate on IVORY #F4EEDC with
// deep ink #16201A, large engraved cutaway, vivid natural washes, same burin, hatch families, roundels, bar, balance,
// camera, caption grammar and CTA seal. This file is production/30s/2026-11-03-round-02/source/render.mjs with the
// food geometry swapped (orange body + equatorial section with peel, pith, membranes, juice vesicles, seeds) and all
// captions / plate lettering in Hindi (Devanagari, Noto Sans Devanagari, OFL, vendored in ./fonts; Latin brand and
// digits fall back to the accepted Inter faces). Devanagari is cut grapheme by grapheme (Intl.Segmenter), and every
// logged text box uses measured ink pixels (Devanagari vowel signs rise above the font's reported ascent).
// Original Canvas2D code; art direction only from lemo-opuscar styles/engraving/STYLE.md. Stop motion: 15 drawings/s.
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
const VES = '#EE7A10', VES_LIGHT = '#F9A033', PITH = '#F7EBC8', SEED = '#F4E7BE';
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
// ---------------- whole orange (analytic body; stem button on top; pitted peel shown as stipple)
const G = { x: 540, y: 935, A: 262, B: 252, C: 255 };
const Lv = (() => { const v = [-0.55, 0.6, 0.58]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function gbody(u, v, cx = G.x, cy = G.y, sc = 1) {
  const r = Math.sqrt(Math.max(0, 1 - u * u)) * (1 + 0.012 * Math.sin(9 * v + 2 * u));
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
const PITS = (() => { const r = rng(77), p = []; for (let i = 0; i < 520; i++) { const u = -0.96 + 1.92 * r(), v = 0.1 + (Math.PI - 0.2) * r(); p.push([u, v, 1 + r() * 1.3]); } return p; })();
const gsil = (cx, cy, sc) => { const a = [], b = []; for (let k = 0; k <= 120; k++) { const u = -1 + 2 * (k / 120); a.push(gbody(u, 0, cx, cy, sc)); b.push(gbody(u, Math.PI, cx, cy, sc)); } return a.concat(b.reverse()); };
function drawWholeOrange(g, cx, cy, sc, f, jit, reveal = 1, wash = 1) {
  const sil = gsil(cx, cy, sc);
  if (wash > 0) {  // peel wash: sunlit gold to orange to deep orange, laid under the ink
    g.save(); g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.clip();
    const ox = cx - 110 * sc, oy = cy - 120 * sc, R = 680 * sc * eo(wash);
    g.beginPath(); for (let k = 0; k <= 64; k++) { const th = (k / 64) * Math.PI * 2, rr = R * (1 + 0.06 * vnoise(th * 3 + 1)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9;
    const lg = g.createRadialGradient(cx - 90 * sc, cy - 100 * sc, 10, cx, cy, 300 * sc);
    lg.addColorStop(0, '#FFC768'); lg.addColorStop(0.5, '#F5921E'); lg.addColorStop(1, '#C65A12');
    g.fillStyle = lg; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); g.restore();
  }
  burin(g, sil, 3.4 * Math.max(0.5, sc), INK, seg(reveal, 0, 0.3), jit, (j) => sil[j].tone);
  const fam = (k, w, a0, a1, alpha) => GF[k].forEach((run, i) => { const r = clamp(seg(reveal, a0, a1) * 1.5 - (i % 10) * 0.05); if (r > 0) { const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, w * Math.max(0.5, sc), `rgba(22,32,26,${alpha})`, r, jit, (j) => pts[j].tone); } });
  fam(1, 1.3, 0.12, 0.6, 0.8); fam(2, 1.0, 0.35, 0.8, 0.7); fam(3, 0.8, 0.55, 1.0, 0.55);
  const pr = seg(reveal, 0.5, 1.0); g.fillStyle = 'rgba(22,32,26,0.55)';   // pitted peel: oil-gland stipple, denser in shade
  PITS.forEach(([u, v, s], i) => { if (i / PITS.length > pr) return; const q = gbody(u, v, cx, cy, sc); if (q.tone < 0.3 && i % 3) return; g.beginPath(); g.arc(q.x, q.y, s * sc * (0.6 + q.tone), 0, 7); g.fill(); });
  const st = gbody(0.995, Math.PI / 2, cx, cy, sc); const sr = seg(reveal, 0.4, 0.7);   // stem button
  if (sr > 0) { g.save(); g.strokeStyle = INK; g.lineWidth = 1.6 * Math.max(0.5, sc); g.beginPath(); g.ellipse(st.x, st.y + 4 * sc, 12 * sc, 5 * sc, 0, 0, Math.PI * 2 * sr); g.stroke(); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; burin(g, [[st.x, st.y + 4 * sc], [st.x + Math.cos(a) * 11 * sc, st.y + 4 * sc + Math.sin(a) * 4.5 * sc]], 1.2, INK, sr, jit); } g.restore(); }
  return st;
}
function drawLeaf(g, bx, by, reveal, jit, washA, ang = 0.5, len = 168, wid = 54) {
  const P = (t, side) => { const x = t * len, y = side * wid * Math.sin(Math.PI * Math.pow(t, 0.85)) * (1 - 0.15 * t); return [bx + x * Math.cos(ang) - y * Math.sin(ang), by + x * Math.sin(ang) + y * Math.cos(ang)]; };
  const e1 = [], e2 = [], mid = []; for (let k = 0; k <= 40; k++) { const t = k / 40; e1.push(P(t, 1)); e2.push(P(t, -1)); mid.push(P(t, 0)); }
  if (washA > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9 * washA; g.fillStyle = LEAF; g.beginPath(); e1.concat(e2.slice().reverse()).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore(); }
  burin(g, e1, 2.4, INK, reveal * 1.4, jit); burin(g, e2, 2.8, INK, reveal * 1.4, jit); burin(g, mid, 1.8, INK, reveal * 1.2, jit);
  for (let i = 1; i < 9; i++) { const t0 = i / 10, r = clamp(reveal * 1.6 - 0.5 - i * 0.05); if (r <= 0) continue; const a = P(t0, 0); burin(g, [a, P(Math.min(1, t0 + 0.12), 0.85)], 1.1, INK2, r, jit); burin(g, [a, P(Math.min(1, t0 + 0.12), -0.85)], 1.3, INK2, r, jit); }
}
// ---------------- cutaway (large equatorial section): peel (flavedo + pith), 11 segments of juice vesicles, membranes, seeds
const S = { x: 540, y: 940, R: 290 };
const secR = (th) => S.R * (1 + 0.01 * Math.sin(7 * th + 0.3));
const secPt = (th, k) => [S.x + Math.cos(th) * secR(th) * k, S.y + Math.sin(th) * secR(th) * k];
const secTone = (x, y) => { const dx = (x - S.x) / S.R, dy = (y - S.y) / S.R; return clamp(0.12 + 0.5 * (dx * 0.6 + dy * 0.7) * 0.9 + 0.45 * Math.pow(Math.hypot(dx, dy), 3)); };
const FLAV = 0.955, ALB = 0.885, CORE = 0.075, NSEG = 11;
const segA = (i) => (i / NSEG) * Math.PI * 2 - Math.PI / 2 + 0.06 * Math.sin(i * 2.3);
const VESICLES = (() => { const r = rng(31), out = []; for (let i = 0; i < NSEG; i++) { const a0 = segA(i), a1 = segA(i + 1) + (i + 1 === NSEG ? Math.PI * 2 : 0) - (i + 1 === NSEG ? Math.PI * 2 : 0); const span = ((segA(i + 1) - a0) + Math.PI * 4) % (Math.PI * 2);
  for (let k = 0; k < 64; k++) { const t = 0.08 + 0.84 * r(), d = 0.12 + 0.74 * Math.sqrt(r()); const a = a0 + span * t; const [x, y] = secPt(a, d); const L = 10 + 15 * d, w = 3.4 + 3.2 * d; out.push({ x, y, rot: a + (r() - 0.5) * 0.25, L, w, light: r() < 0.4 }); } } return out.sort((p, q) => Math.hypot(p.x - S.x, p.y - S.y) - Math.hypot(q.x - S.x, q.y - S.y)); })();
const SEEDS = [[1, 0.36], [3, 0.42], [6, 0.33], [8, 0.4], [10, 0.38]].map(([i, d]) => { const a = segA(i) + 0.27; const [x, y] = secPt(a, d); return { x, y, rot: a }; });
const DISH = { x: 168, y: 1078 };
const DISH_HEAP = [[-24, -6], [0, -7], [24, -6], [-12, -18], [12, -18]].map(([dx, dy]) => [DISH.x + dx, DISH.y + dy]);
function ringPath(g, k0, k1) { g.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = secPt((i / 200) * Math.PI * 2, k0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); if (k1 > 0) { for (let i = 200; i >= 0; i--) { const [x, y] = secPt((i / 200) * Math.PI * 2, k1); g.lineTo(x, y); } g.closePath(); } }
function bloomFill(g, fill, alpha, ox, oy, a) { const R = 760 * eo(a); g.beginPath(); for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2, rr = R * (1 + 0.07 * vnoise(th * 3 + ox)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip(); g.globalAlpha = alpha; g.fillStyle = fill; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); }
const BLOOM = [S.x - 80, S.y - 70];
const washed = (x, y, wa) => wa > 0 && Math.hypot(x - BLOOM[0], y - BLOOM[1]) < 760 * eo(wa) * (1 + 0.07 * vnoise(Math.atan2(y - BLOOM[1], x - BLOOM[0]) * 3 + BLOOM[0]));
function drawSeed(g, x, y, rot, jit, s = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = SEED; g.beginPath(); g.moveTo(-11, 0); g.quadraticCurveTo(-2, -8, 10, -2); g.quadraticCurveTo(12, 0, 10, 2); g.quadraticCurveTo(-2, 8, -11, 0); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke(); g.lineWidth = 0.6; g.beginPath(); g.moveTo(-6, 1); g.lineTo(6, 1); g.stroke(); g.restore(); }
function drawSection(g, r, jit, wa, peelOff, seedsOut, water) {
  // segments (interior): pale membrane ground, juice vesicles, membranes, core, seeds
  if (wa > 0) { g.save(); g.globalCompositeOperation = 'multiply'; ringPath(g, ALB, 0); g.clip(); bloomFill(g, '#F6A23A', 0.9, S.x - 60, S.y - 60, wa); g.restore(); }
  const vr = seg(r, 0.35, 1.0), nv = Math.floor(VESICLES.length * vr);
  for (let i = 0; i < nv; i++) { const v = VESICLES[i]; g.save(); g.translate(v.x + (jit() - 0.5) * 1.2, v.y + (jit() - 0.5) * 1.2); g.rotate(v.rot + (jit() - 0.5) * 0.04); /* same deterministic line boil as the burin strokes */ g.fillStyle = washed(v.x, v.y, wa) ? (v.light ? VES_LIGHT : VES) : PAPER; g.beginPath(); g.ellipse(0, 0, v.L, v.w, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(22,32,26,0.45)'; g.lineWidth = 0.8; g.stroke(); g.fillStyle = 'rgba(255,246,225,0.5)'; g.beginPath(); g.ellipse(-v.L * 0.25, -v.w * 0.3, v.L * 0.35, v.w * 0.22, 0, 0, 7); g.fill(); g.restore(); }
  if (water > 0) { g.save(); ringPath(g, ALB, 0); g.clip(); g.globalAlpha = water; for (let y = 660; y < 1240; y += 15) { const p = []; for (let x = 250; x <= 830; x += 10) p.push([x, y + Math.sin(x * 0.045 + y * 0.1) * 3.5]); burin(g, p, 1.3, 'rgba(38,110,180,0.75)', 1, jit); } g.restore(); }
  const mr = seg(r, 0.2, 0.55);
  for (let i = 0; i < NSEG; i++) { const a = segA(i), p1 = [], p2 = []; for (let k = 0; k <= 20; k++) { const d = CORE + (ALB - CORE) * (k / 20); const [x, y] = secPt(a + 0.012, d), [x2, y2] = secPt(a - 0.012, d); p1.push([x, y]); p2.push([x2, y2]); } if (mr > 0) { g.save(); g.strokeStyle = '#FBF0D2'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); const n0 = Math.floor(20 * clamp(mr * 1.4 - i * 0.03)); for (let k = 0; k <= n0; k++) { const d = CORE + (ALB - CORE) * (k / 20); const [x, y] = secPt(a, d); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); } burin(g, p1, 1.4, INK, clamp(mr * 1.4 - i * 0.03), jit); burin(g, p2, 1.0, INK2, clamp(mr * 1.4 - i * 0.03), jit); }
  const cp = []; for (let i = 0; i <= 44; i++) { const a = (i / 44) * Math.PI * 2; cp.push(secPt(a, CORE * (1 + 0.25 * Math.sin(a * NSEG)))); } burin(g, cp, 1.6, INK, seg(r, 0.3, 0.5), jit);
  SEEDS.forEach((s, i) => { if (r < 0.7) return; const t0 = i / SEEDS.length * 0.55, k = clamp((seedsOut - t0) / 0.45); const [hx, hy] = DISH_HEAP[i]; const x = lerp(s.x, hx, eo(k)), y = lerp(s.y, hy, eo(k)) - Math.sin(Math.PI * k) * 80; drawSeed(g, x, y, s.rot, jit, lerp(1, 0.85, k)); });
  // peel: albedo (white pith) + flavedo (orange rind with oil glands); lifts off (expands and fades) on "छिलका ... हटाकर"
  const ks = 1 + 0.09 * eo(peelOff), sa = 1 - 0.86 * eo(peelOff);
  g.save(); g.globalAlpha = sa; g.translate(S.x, S.y); g.scale(ks, ks); g.translate(-S.x, -S.y);
  if (wa > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.save(); ringPath(g, 1.0, FLAV); g.clip('evenodd'); bloomFill(g, '#F08A1A', 0.95 * sa, S.x - 150, S.y - 160, wa); g.restore(); g.save(); ringPath(g, FLAV, ALB); g.clip('evenodd'); bloomFill(g, PITH, 0.9 * sa, S.x - 120, S.y - 100, wa); g.restore(); g.restore(); }
  const p = []; for (let i = 0; i <= 300; i++) p.push(secPt(-0.5 + (i / 300) * Math.PI * 2, 1)); burin(g, p, 3.8, INK, seg(r, 0, 0.2), jit);
  const sk = seg(r, 0.1, 0.4); for (let i = 0; i < 260 * sk; i++) { const th = (i / 260) * Math.PI * 2; const a = secPt(th, 1), b = secPt(th, FLAV); g.strokeStyle = INK; g.lineWidth = secTone(a[0], a[1]) > 0.35 ? 1.3 : 0.7; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const fp = []; for (let i = 0; i <= 240; i++) fp.push(secPt((i / 240) * Math.PI * 2, FLAV)); burin(g, fp, 1.6, INK, seg(r, 0.15, 0.4), jit);
  const ap = []; for (let i = 0; i <= 240; i++) ap.push(secPt((i / 240) * Math.PI * 2, ALB)); burin(g, ap, 2.0, INK, seg(r, 0.25, 0.5), jit);
  g.restore();
}
function drawDish(g, r, jit) {   // small engraved dish in the left margin that receives the seeds
  if (r <= 0) return; const { x, y } = DISH;
  g.save(); g.fillStyle = PAPER; g.beginPath(); g.ellipse(x, y, 66, 14, 0, 0, Math.PI); g.lineTo(x - 46, y + 24); g.lineTo(x + 46, y + 24); g.closePath(); g.fill(); g.restore();
  const rim = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; rim.push([x + Math.cos(a) * 66, y + Math.sin(a) * 14]); } burin(g, rim, 2.2, INK, r, jit);
  const body = []; for (let i = 0; i <= 30; i++) { const t = i / 30; body.push([x - 66 + 132 * t, y + Math.sin(Math.PI * t) * 30]); } burin(g, body, 2.6, INK, r, jit);
  for (let i = 0; i < 8; i++) { const t = 0.55 + i * 0.05; burin(g, [[x - 66 + 132 * t, y + 6 + Math.sin(Math.PI * t) * 4], [x - 66 + 132 * t, y + Math.sin(Math.PI * t) * 28]], 0.8, INK2, r, jit); }
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'kcal', big: '47', unit: 'कैलोरी', name: 'ऊर्जा', motif: 'rays', from: secPt(2.6, 0.55), fig: 2 },
  { ev: 'fibre', big: '2.4', unit: 'ग्राम', name: 'फ़ाइबर', motif: 'fibres', from: secPt(1.55, 0.6), fig: 3 },
  { ev: 'vitc', big: '53', unit: 'मि.ग्रा.', name: 'विटामिन सी', motif: 'stipple', from: secPt(0.45, 0.6), fig: 4 },
];
const FACTS2 = [
  { ev: 'fibre2', big: '2.4', unit: 'ग्राम फ़ाइबर', name: 'पाचन', motif: 'fibres', from: secPt(2.3, 0.6), fig: 5 },
  { ev: 'vitc2', big: '53', unit: 'मि.ग्रा. विटामिन सी', name: 'घाव भरना', motif: 'heal', from: secPt(0.8, 0.6), fig: 6 },
];
function motif(g, kind, r, f, jit, act) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'fibres') { const ph = act * 4 + f * 0.04 * (0.3 + act); for (let i = -5; i <= 5; i++) { const p = []; for (let k = 0; k <= 32; k++) { const t = -1 + 2 * (k / 32); const x = t * R * 0.95, y = i * 15 + Math.sin(t * 4 + i + ph * 2.2) * (6 + 4 * act); if (Math.hypot(x, y) < R * 0.94) p.push([x, y]); } if (p.length > 3) burin(g, p, 1.3, `rgba(47,122,28,${0.45 + 0.35 * act})`, r, jit); } }
  if (kind === 'stipple') { const q = rng(9); g.fillStyle = 'rgba(236,128,30,0.9)'; for (let i = 0; i < 90; i++) { const a = q() * Math.PI * 2, d = Math.sqrt(q()) * R * 0.85; if (i / 90 < r) { g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 2.2, 0, 7); g.fill(); } } }
  if (kind === 'heal') {   // "विटामिन सी घाव भरने में": a cut in the skin closes while collagen-like strands bridge it
    const gap = lerp(30, 3, eio(act)), y0 = 34, y1 = 96;
    for (const side of [-1, 1]) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#F3C9A8'; g.beginPath(); g.moveTo(side * gap, y0); for (let k = 0; k <= 10; k++) g.lineTo(side * (gap + 3 * Math.sin(k * 1.7)), y0 + (y1 - y0) * (k / 10)); g.lineTo(side * 110, y1); g.lineTo(side * 110, y0); g.closePath(); g.fill(); g.restore();
      const edge = []; for (let k = 0; k <= 10; k++) { const y = y0 + (y1 - y0) * (k / 10); edge.push([side * (gap + 3 * Math.sin(k * 1.7)), y]); } burin(g, edge, 2.2, INK, r, jit); for (let k = 0; k < 9; k++) burin(g, [[side * (gap + 9 + k * 9), y0 + 2], [side * (gap + 5 + k * 9), y1 - 2]], 0.9, 'rgba(22,32,26,0.45)', r, jit); }
    for (let k = 0; k < 8; k++) { const q = clamp(act * 1.6 - k * 0.08); if (q <= 0) continue; const y = y0 + 6 + k * 7; burin(g, [[-gap - 14, y], [-gap * 0.3, y - 4], [gap * 0.3, y + 4], [gap + 14, y]], 1.8, 'rgba(236,128,30,0.95)', q, jit); }
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
    const yv = fact.motif === 'heal' ? -36 : -6;
    text(g, cut(fact.big, lt), 0, yv, F.big(56), INK, 'center', 0, 'roundel');
    if (lt >= 1) { text(g, fact.unit, 0, yv + 32, F.b(fact.unit.length > 9 ? 17 : 21), LEAFDARK, 'center', 0, 'roundel'); text(g, fact.name, 0, fact.motif === 'heal' ? 22 : 62, F.b(19), INK2, 'center', 0, 'roundel'); }
  }
  if (p >= 1) text(g, `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- water / solids bar: 100 g of segments = 87 g water (0 kcal) + 13 g, mostly sugars and fibre (the 47 kcal)
function drawBar(g, f, jit, out) {
  const r = seg(f, E.bar, E.bar + 12); if (r <= 0 || out >= 1) return;
  const x0 = 150, x1 = 930, y0 = 1296, y1 = 1374, xw = x0 + (x1 - x0) * 0.868;
  g.save(); if (out > 0) { const bx = lerp(130, 990, out); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
  g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const wf = eo(seg(f, E.water, E.water + 24));
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#8CC0E6'; g.fillRect(x0, y0, (xw - x0) * wf, y1 - y0); if (wf >= 1) { g.fillStyle = VES; g.fillRect(xw, y0, x1 - xw, y1 - y0); } g.restore();
  for (let y = y0 + 9; y < y1; y += 11) { const p = []; for (let x = x0 + 4; x <= x0 + (xw - x0) * wf; x += 9) p.push([x, y + Math.sin(x * 0.06 + y + f * 0.15) * 2.5]); if (p.length > 2) burin(g, p, 1.0, 'rgba(22,32,26,0.45)', 1, jit); }
  if (wf >= 1) for (let i = 0; i < 10; i++) burin(g, [[xw + 4 + i * 10, y1 - 4], [xw + 4 + i * 10 + 16, y0 + 4]], 0.9, 'rgba(22,32,26,0.55)', 1, jit);
  burin(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], 2.4, INK, r * 1.2, jit); if (wf >= 1) burin(g, [[xw, y0], [xw, y1]], 2.0, INK, 1, jit);
  text(g, '100 ग्राम फाँकें', x0, y0 - 16, F.b(24), INK, 'left', 0, 'fig');
  const lw = seg(f, E.waterLabel, E.waterLabel + 8); if (lw > 0) { g.save(); g.globalAlpha = lw; text(g, '87 ग्राम पानी', (x0 + xw) / 2, y0 + 52, F.big(36), INK, 'center', 0, 'fig'); g.restore(); }
  const lz = seg(f, E.zero, E.zero + 10); if (lz > 0) { g.save(); g.globalAlpha = lz; text(g, '0 कैलोरी', (x0 + xw) / 2, y1 + 42, F.big(32), '#26609A', 'center', 0, 'fig'); text(g, '47 कैलोरी', x1, y1 + 42, F.big(32), LEAFDARK, 'right', 0, 'fig'); text(g, '13 ग्राम: मुख्यतः शर्करा + फ़ाइबर', x1, y1 + 74, F.s(20), INK2, 'right', 0, 'fig'); g.restore(); }
  g.restore();
  if (out > 0 && out < 1) { const bx = lerp(130, 990, out); g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, 1260); g.lineTo(bx, 1460); g.stroke(); g.restore(); }
}
// ---------------- balance (takeaway): one medium peeled orange (its segments) vs a 131 g weight
function drawPeeledOrange(g, x, y, R, jit, segs = 1) {   // a peeled orange: segment ball with membrane meridians, vivid wash
  g.fillStyle = PAPER; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, R, 0, 7); g.clip(); g.globalCompositeOperation = 'multiply'; const lg = g.createRadialGradient(x - R * 0.4, y - R * 0.4, 2, x, y, R * 1.2); lg.addColorStop(0, '#FFC768'); lg.addColorStop(1, '#E9771A'); g.fillStyle = lg; g.fillRect(x - R, y - R, 2 * R, 2 * R); g.restore();
  for (let i = 1; i < 9 * segs; i++) { const ph = -Math.PI / 2 + (i / 9) * Math.PI; const p = []; for (let k = 0; k <= 16; k++) { const t = -Math.PI / 2 + (k / 16) * Math.PI; p.push([x + R * Math.cos(t) * Math.sin(ph), y + R * Math.sin(t)]); } burin(g, p, 1.0, 'rgba(22,32,26,0.6)', 1, jit); }   // segment membranes as meridians
  burin(g, Array.from({ length: 41 }, (_, k) => [x + Math.cos(k / 40 * Math.PI * 2) * R, y + Math.sin(k / 40 * Math.PI * 2) * R]), 2.2, INK, 1, jit);
  g.fillStyle = 'rgba(255,246,225,0.6)'; g.beginPath(); g.ellipse(x - R * 0.35, y - R * 0.4, R * 0.25, R * 0.12, -0.6, 0, 7); g.fill();
}
function drawBalance(g, cx, cy, sc, r, tiltDeg, f, jit, fruitIn, weightIn) {
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
  if (fruitIn > 0) { const [lx, ly0] = pans[0]; drawPeeledOrange(g, lx, ly0 + 70 - 44 - (1 - eo(fruitIn)) * 240, 44, jit); }
  if (weightIn > 0) { const [rx, ry0] = pans[1], ry = ry0 + 70 - (1 - eo(weightIn)) * 200; burin(g, [[rx - 42, ry - 4], [rx - 42, ry - 80], [rx + 42, ry - 80], [rx + 42, ry - 4]], 2.6, INK, 1, jit); burin(g, [[rx - 14, ry - 80], [rx - 14, ry - 96], [rx + 14, ry - 96], [rx + 14, ry - 80]], 2.2, INK, 1, jit); g.fillStyle = PAPER; g.fillRect(rx - 41, ry - 79, 82, 74); for (let k = 1; k < 7; k++) burin(g, [[rx + 42 - k * 5, ry - 76], [rx + 42 - k * 5, ry - 8]], 0.7, INK2, 1, jit); text(g, '131 ग्रा.', rx - 6, ry - 32, F.b(21), INK, 'center', 0, 'fig'); }
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
// ---------------- notes with dotted leaders (cut grapheme by grapheme)
function note(g, f, t0, from, to, head, sub, fade) {
  const lp = seg(f, t0, t0 + 10); if (lp <= 0 || fade <= 0) return;
  g.save(); g.globalAlpha = fade; g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] - 44, lp)); g.stroke(); g.setLineDash([]);
  g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4.5, 0, 7); g.fill();
  const tl = seg(f, t0 + 6, t0 + 16);
  if (tl > 0) { text(g, cut(head, tl), to[0], to[1] - 12, F.b(26), INK, 'center', 0); if (tl >= 1) text(g, sub, to[0], to[1] + 20, F.s(20), LEAFDARK, 'center', 0); }
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
  const rl = seg(f, E.ctaWord + 20, E.ctaWord + 40); if (rl > 0) burin(g, [[cx + R0 + gap, cy + 52], [cx + R0 + gap + ww * rl, cy + 52]], 2.2, LEAFDARK, 1, jit);
  const tk = seg(f, E.ctaWord + 38, E.ctaWord + 90); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
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
  if (tt > 0) { text(g, 'PLATE V'.slice(0, Math.ceil(7 * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, cut('संतरा · कच्ची फाँकें', tt), 540, 626, F.b(28), INK, 'center', 0); }
  // --- hook: whole orange cut, then burnished out while the large equatorial section is re-cut
  const burn = seg(f, E.burnish, E.burnish + 20), sweepX = lerp(G.x - G.A - 40, G.x + G.A + 60, burn);
  let st = null;
  if (burn < 1) {
    g.save(); if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    st = drawWholeOrange(g, G.x, G.y, 1, f, jit, seg(f, -8, 50), seg(f, E.washWhole, E.washWhole + 24));
    g.restore();
    const ct = seg(f, E.cut, E.cut + 8);
    if (ct > 0 && burn < 0.7) { const p = []; for (let k = 0; k <= 60; k++) p.push(gbody(0.02, 0.04 + (Math.PI - 0.08) * (k / 60))); burin(g, p, 3.8, '#D6452B', ct, jit); }
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, G.y - 290); g.lineTo(sweepX, G.y + 290); g.stroke(); g.restore(); }
  }
  const sr = seg(f, E.section, E.section + 32), peelOff = seg(f, E.peelOff, E.peelOff + 22), seedsOut = seg(f, E.seedsOut, E.seedsOut + 28);
  const water = seg(f, E.water, E.water + 16) * (1 - seg(f, E.barOut - 8, E.barOut + 4));
  drawDish(g, seg(f, E.seedsOut - 10, E.seedsOut + 6), jit);
  if (sr > 0) {
    g.save(); if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); }
    drawSection(g, sr, jit, seg(f, E.washSection, E.washSection + 20), peelOff, seedsOut, water * 0.8);
    g.restore();
    const fade = 1 - seg(f, E.notesOut, E.notesOut + 10);
    note(g, f, E.peelNote, secPt(-2.45, 1.08), [178, 716], 'छिलका', 'नहीं खाते', fade);
    note(g, f, E.seedNote, [DISH.x, DISH.y + 30], [DISH.x, DISH.y + 100], 'बीज', 'नहीं खाते', fade);
    note(g, f, E.segNote, secPt(-0.62, 0.62), [880, 716], 'फाँकें', 'यही 100 ग्राम', fade);
  }
  const leafB = st && burn < 1 ? [st.x + 8, st.y + 2] : [secPt(-1.3, 1.0)[0], secPt(-1.3, 1.0)[1]];
  const lks = st && burn < 1 ? 1 : 1 + 0.09 * eo(peelOff); const lb = [S.x + (leafB[0] - S.x) * lks, S.y + (leafB[1] - S.y) * lks];
  g.save(); g.globalAlpha = st && burn < 1 ? 1 : 1 - 0.86 * eo(peelOff); drawLeaf(g, lb[0], lb[1], seg(f, E.leaf, E.leaf + 34), jit, seg(f, E.washWhole + 6, E.washWhole + 30), 0.3, 140, 40); g.restore();
  // --- facts (roundels), then the water/solids bar, then the two function roundels
  const out1 = seg(f, E.roundelsOut, E.roundelsOut + 10);
  FACTS.forEach((fa, i) => drawRoundel(g, fa, SLOTS[i], f, jit, 0, out1));
  drawBar(g, f, jit, seg(f, E.barOut, E.barOut + 14));
  const out2 = seg(f, E.roundels2Out, E.roundels2Out + 10);
  const actF = seg(f, E.digest, E.digest + 14) * (1 - seg(f, E.vitc2 + 4, E.vitc2 + 16)), actC = seg(f, E.heal, E.heal + 30);
  drawRoundel(g, FACTS2[0], [318, 1362], f, jit, actF, out2, { grow: 0.22 });
  drawRoundel(g, FACTS2[1], [762, 1362], f, jit, actC, out2, { grow: 0.22 });
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); text(g, cut('प्रति 100 ग्राम खाने योग्य फाँकें · USDA FoodData Central FDC 169097', lg), 540, 1534, F.s(19), INK2, 'center', 0); }
  // --- takeaway: one medium peeled orange balances 131 g (USDA portion "fruit (2-5/8 in dia)" = 131 g edible)
  const br = seg(f, E.balance, E.balance + 26), bOut = seg(f, E.balanceOut, E.balanceOut + 14);
  if (br > 0 && bOut < 1) {
    const fIn = seg(f, E.fruitDrop - 8, E.fruitDrop), wIn = seg(f, E.weight - 8, E.weight);
    const tilt = wIn <= 0 ? 9 * eo(fIn) : 9 * (1 - eo(wIn)) + (wIn >= 1 ? 2.4 * Math.exp(-(f - E.weight) / 16) * Math.sin((f - E.weight) * 0.55) : 0);
    g.save(); if (bOut > 0) { const bx = lerp(130, 990, bOut); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
    drawBalance(g, 540, 1330, 0.86, br, tilt, f, jit, fIn, wIn);
    const lk = seg(f, E.weight + 6, E.weight + 30); if (lk > 0) { const a = secPt(2.25, 0.62), b = [258, 1250]; g.save(); g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], lk), lerp(a[1], b[1], lk)); g.stroke(); g.setLineDash([]); g.fillStyle = INK; g.beginPath(); g.arc(a[0], a[1], 4.5, 0, 7); g.fill(); g.restore(); }
    const l1 = seg(f, E.fruitDrop + 4, E.fruitDrop + 16); if (l1 > 0) text(g, cut('1 मध्यम संतरा, छिला हुआ', l1), 262, 1446, F.b(20), INK, 'center', 0, 'fig');
    const l2 = seg(f, E.label70, E.label70 + 16); if (l2 > 0) text(g, cut('≈ 70 मि.ग्रा. विटामिन सी', l2), 262, 1478, F.big(24), LEAFDARK, 'center', 0, 'fig');
    const l3 = seg(f, E.label70 + 10, E.label70 + 44); if (l3 > 0) text(g, cut('131 ग्रा. × 53.2 / 100 ग्रा.', l3), 818, 1478, F.s(19), INK2, 'center', 0, 'fig');
    g.restore();
    if (bOut > 0 && bOut < 1) { const bx = lerp(130, 990, bOut); g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, 1250); g.lineTo(bx, 1480); g.stroke(); g.restore(); }
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
