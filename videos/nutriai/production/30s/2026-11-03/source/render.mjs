// CalMeter production 30 s (2026-11-03): "What is inside 100 grams of raw pomegranate arils?". Same accepted style as
// batch-02 (guava): Copperplate-engraving plate on IVORY with deep ink, large engraved cutaway, vivid natural washes
// (ruby arils, red peel, leaf green), same typography, same camera and caption grammar. This file is the batch-02
// renderer with the food geometry swapped (pomegranate body + crown, peel/pith/septa/aril cutaway), a weighing balance,
// a vitamin K mesh motif and a juice roundel. Original Canvas2D code; art direction only from lemo-opuscar
// styles/engraving/STYLE.md. Stop motion: 15 drawings/s, each held 2 frames.
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
const PAPER = '#F4EEDC', INK = '#16201A', INK2 = 'rgba(22,32,26,0.72)', LEAF = '#5AB626', LEAFDARK = '#2F7A1C';
const ARIL = '#CF1C40', ARIL_LIGHT = '#E2506A', PITH = '#F3DDA6';   // aril fill = ruby wash multiplied on ivory (opaque so arils occlude)
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
// ---------------- whole pomegranate (analytic body, vertical axis; crown on top, faint facets)
const G = { x: 540, y: 915, A: 236, B: 222, C: 230 };
const Lv = (() => { const v = [-0.55, 0.6, 0.58]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function gbody(u, v, cx = G.x, cy = G.y, sc = 1) {
  const r = Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.06 * Math.max(0, u) ** 3) * (1 + 0.022 * Math.sin(6 * v + 0.5));
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
function crownPts(cx, cy, sc) {   // calyx tube + six pointed sepals (the pomegranate "crown")
  const top = gbody(0.995, Math.PI / 2, cx, cy, sc), y0 = top.y - 24 * sc, sep = [];
  for (let i = 0; i < 6; i++) { const o = i - 2.5, bx = top.x + o * 6.2 * sc; sep.push([[bx - 4.5 * sc, y0 + 2 * sc], [top.x + o * 15 * sc, y0 - 20 * sc + Math.abs(o) * 6 * sc], [bx + 4.5 * sc, y0 + 2 * sc]]); }
  const tube = [[top.x - 21 * sc, top.y + 6 * sc], [top.x - 17 * sc, y0], [top.x + 17 * sc, y0], [top.x + 21 * sc, top.y + 6 * sc]];
  return { top, y0, sep, tube };
}
function drawWholePom(g, cx, cy, sc, f, jit, reveal = 1, wash = 1, opts = {}) {
  const sil = gsil(cx, cy, sc); const cr = crownPts(cx, cy, sc);
  if (sc < 0.3) { g.save(); g.fillStyle = PAPER; g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill(); g.restore(); }   // small figures occlude what is behind
  if (wash > 0) {  // skin wash: blush orange-pink to pomegranate red to deep crimson, laid under the ink
    g.save(); g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.moveTo(cr.tube[0][0], cr.tube[0][1]); cr.tube.forEach(([x, y]) => g.lineTo(x, y)); for (const s of cr.sep) { g.moveTo(s[0][0], s[0][1]); s.forEach(([x, y]) => g.lineTo(x, y)); } g.clip('nonzero');
    const ox = cx - 110 * sc, oy = cy - 120 * sc, R = 640 * sc * eo(wash);
    g.beginPath(); for (let k = 0; k <= 64; k++) { const th = (k / 64) * Math.PI * 2, rr = R * (1 + 0.06 * vnoise(th * 3 + 1)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.88;
    const lg = g.createRadialGradient(cx - 85 * sc, cy - 95 * sc, 10, cx, cy, 300 * sc);
    lg.addColorStop(0, opts.c0 || '#F6B08E'); lg.addColorStop(0.5, opts.c1 || '#DE4A44'); lg.addColorStop(1, opts.c2 || '#A21F2F');
    g.fillStyle = lg; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); g.restore();   // cover any local transform
  }
  burin(g, sil, 3.4 * Math.max(0.5, sc), INK, seg(reveal, 0, 0.3), jit, (j) => sil[j].tone);
  const fam = (k, w, a0, a1, alpha) => GF[k].forEach((run, i) => { const r = clamp(seg(reveal, a0, a1) * 1.5 - (i % 10) * 0.05); if (r > 0) { const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, w * Math.max(0.5, sc), `rgba(22,32,26,${alpha})`, r, jit, (j) => pts[j].tone); } });
  if (sc >= 0.3) { fam(1, 1.4, 0.12, 0.6, 0.85); fam(2, 1.1, 0.35, 0.8, 0.75); fam(3, 0.85, 0.55, 1.0, 0.6); }
  else GF[1].forEach((run, i) => { if (i % 3) return; const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, 0.9, 'rgba(22,32,26,0.55)', seg(reveal, 0.12, 0.6), jit, (j) => pts[j].tone); });   // small figures: lighter hatch so the wash reads
  // crown: tube with shading lines, then the six sepals
  const cq = seg(reveal, 0.4, 0.75), lw = Math.max(0.5, sc);
  burin(g, [cr.tube[0], cr.tube[1]], 2.6 * lw, INK, cq, jit); burin(g, [cr.tube[3], cr.tube[2]], 2.6 * lw, INK, cq, jit);
  if (sc >= 0.3) for (let k = 0; k < 4; k++) burin(g, [[cr.top.x + (4 + k * 4) * sc, cr.top.y + 2 * sc], [cr.top.x + (4 + k * 3.6) * sc, cr.y0 + 3 * sc]], 0.9, INK2, cq, jit);
  cr.sep.forEach((s, i) => burin(g, s, 2.2 * lw, INK, clamp(cq * 1.6 - i * 0.08), jit));
  return cr.top;
}
function drawLeaf(g, bx, by, reveal, jit, washA, ang = 0.5, len = 168, wid = 54) {
  const P = (t, side) => { const x = t * len, y = side * wid * Math.sin(Math.PI * Math.pow(t, 0.85)) * (1 - 0.15 * t); return [bx + x * Math.cos(ang) - y * Math.sin(ang), by + x * Math.sin(ang) + y * Math.cos(ang)]; };
  const e1 = [], e2 = [], mid = []; for (let k = 0; k <= 40; k++) { const t = k / 40; e1.push(P(t, 1)); e2.push(P(t, -1)); mid.push(P(t, 0)); }
  if (washA > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9 * washA; g.fillStyle = LEAF; g.beginPath(); e1.concat(e2.slice().reverse()).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore(); }
  burin(g, e1, 2.4, INK, reveal * 1.4, jit); burin(g, e2, 2.8, INK, reveal * 1.4, jit); burin(g, mid, 1.8, INK, reveal * 1.2, jit);
  for (let i = 1; i < 9; i++) { const t0 = i / 10, r = clamp(reveal * 1.6 - 0.5 - i * 0.05); if (r <= 0) continue; const a = P(t0, 0); burin(g, [a, P(Math.min(1, t0 + 0.12), 0.85)], 1.1, INK2, r, jit); burin(g, [a, P(Math.min(1, t0 + 0.12), -0.85)], 1.3, INK2, r, jit); }
}
// ---------------- cutaway (large, equatorial section): red skin, pale pith, membranes (septa), packed ruby arils
const S = { x: 540, y: 935, R: 300 };
const secR = (th) => S.R * (1 + 0.016 * Math.sin(6 * th + 0.4));
const secPt = (th, k) => [S.x + Math.cos(th) * secR(th) * k, S.y + Math.sin(th) * secR(th) * k];
const secTone = (x, y) => { const dx = (x - S.x) / S.R, dy = (y - S.y) / S.R; return clamp(0.12 + 0.5 * (dx * 0.6 + dy * 0.7) * 0.9 + 0.45 * Math.pow(Math.hypot(dx, dy), 3)); };
const SKIN = 0.955, PITHK = 0.86;
const SEPTA = Array.from({ length: 7 }, (_, i) => { const th0 = (i / 7) * Math.PI * 2 + 0.3, p = []; for (let k = 0; k <= 30; k++) { const kk = 0.06 + (PITHK + 0.01 - 0.06) * (k / 30); p.push(secPt(th0 + 0.22 * Math.sin(kk * 3.2 + i), kk)); } return p; });
const ARILS = (() => {
  const r = rng(17), out = []; const sp = SEPTA.flat();
  for (let i = 0; i < 9000 && out.length < 340; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (PITHK - 0.045); if (d < 0.1) continue;
    const [x, y] = secPt(a, d);
    if (sp.some((q) => Math.hypot(q[0] - x, q[1] - y) < 12.5)) continue;
    if (out.some((q) => Math.hypot(q.x - x, q.y - y) < 22.5)) continue;
    const rot = Math.atan2(y - S.y, x - S.x) + (r() - 0.5) * 0.5, s = 10.8 + r() * 2.2;
    const shape = Array.from({ length: 8 }, (_, j) => { const an = (j / 8) * Math.PI * 2, rr = s * (1 + 0.16 * (r() - 0.5)); const lx = Math.cos(an) * rr * 1.18, ly = Math.sin(an) * rr * 0.88; return [x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)]; });
    out.push({ x, y, rot, s, seed: r() < 0.4, shape, d });
  }
  return out.sort((p, q) => p.d - q.d);
})();
function arilShape(g, a) { g.beginPath(); a.shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }
function drawAril(g, a, washed, jit, lw = 1.25) {   // one aril: opaque ruby (or paper) body, glint, ink outline, seed
  g.fillStyle = washed ? ARIL : PAPER; arilShape(g, a); g.fill();
  if (washed) { g.save(); g.fillStyle = 'rgba(255,214,218,0.55)'; g.beginPath(); g.ellipse(a.x - a.s * 0.35, a.y - a.s * 0.35, a.s * 0.38, a.s * 0.2, -0.7, 0, 7); g.fill(); g.restore(); }
  burin(g, a.shape.concat([a.shape[0]]), lw, INK, 1, jit, () => 0.6);
  const c = Math.cos(a.rot), s = Math.sin(a.rot);
  g.strokeStyle = 'rgba(22,32,26,0.55)'; g.lineWidth = 0.8; for (let k = 0; k < 2; k++) { const ox = a.x + a.s * 0.25 + k * 3, oy = a.y + a.s * 0.25 + k * 3; g.beginPath(); g.moveTo(ox - c * a.s * 0.35, oy - s * a.s * 0.35); g.lineTo(ox + c * a.s * 0.35, oy + s * a.s * 0.35); g.stroke(); }
  if (a.seed) { g.save(); g.translate(a.x, a.y); g.rotate(a.rot); g.fillStyle = '#FBF1DA'; g.beginPath(); g.ellipse(0, 0, a.s * 0.45, a.s * 0.2, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 0.8; g.stroke(); g.restore(); }
}
function ringPath(g, k0, k1) { g.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = secPt((i / 200) * Math.PI * 2, k0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); if (k1 > 0) { for (let i = 200; i >= 0; i--) { const [x, y] = secPt((i / 200) * Math.PI * 2, k1); g.lineTo(x, y); } g.closePath(); } }
function bloomFill(g, col, alpha, ox, oy, a) { const R = 720 * eo(a); g.beginPath(); for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2, rr = R * (1 + 0.07 * vnoise(th * 3 + ox)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip(); g.globalAlpha = alpha; g.fillStyle = col; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); }
const BLOOM = [S.x - 90, S.y - 80];
const arilWashed = (a, wa) => wa > 0 && Math.hypot(a.x - BLOOM[0], a.y - BLOOM[1]) < 720 * eo(wa) * (1 + 0.07 * vnoise(Math.atan2(a.y - BLOOM[1], a.x - BLOOM[0]) * 3 + BLOOM[0]));
// peel = skin band + pith band; drawn per half so it can be lifted aside
function drawPeel(g, r, jit, wa) {
  if (wa > 0) { g.save(); g.globalCompositeOperation = 'multiply';
    g.save(); ringPath(g, 1.0, SKIN); g.clip('evenodd'); bloomFill(g, '#B8222E', 0.95, S.x - 150, S.y - 160, wa); g.restore();
    g.save(); ringPath(g, SKIN, PITHK); g.clip('evenodd'); bloomFill(g, PITH, 0.95, S.x - 120, S.y - 100, wa); g.restore(); g.restore(); }
  const p = []; for (let i = 0; i <= 300; i++) p.push(secPt(-0.5 + (i / 300) * Math.PI * 2, 1));
  burin(g, p, 3.8, INK, seg(r, 0, 0.2), jit);
  const sk = seg(r, 0.1, 0.4); for (let i = 0; i < 230 * sk; i++) { const th = (i / 230) * Math.PI * 2; const a = secPt(th, 1), b = secPt(th, SKIN); g.strokeStyle = INK; g.lineWidth = secTone(a[0], a[1]) > 0.35 ? 1.4 : 0.8; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const ip = []; for (let i = 0; i <= 240; i++) ip.push(secPt((i / 240) * Math.PI * 2, SKIN)); burin(g, ip, 1.8, INK, seg(r, 0.15, 0.4), jit);
  const kc = seg(r, 0.2, 0.55); for (let j = 0; j < 3; j++) { const k = SKIN - 0.024 * (j + 1); const c = []; for (let i = 0; i <= 220; i++) c.push(secPt(-0.5 + (i / 220) * Math.PI * 2, k)); burin(g, c, 0.9, 'rgba(22,32,26,0.5)', clamp(kc * 3 - j), jit, (q) => secTone(c[q][0], c[q][1])); }
  const pp = []; for (let i = 0; i <= 240; i++) pp.push(secPt((i / 240) * Math.PI * 2, PITHK)); burin(g, pp, 2.0, INK, seg(r, 0.3, 0.55), jit);
}
function drawSection(g, r, jit, wa, split) {
  const dx = 60 * eo(split);
  // interior: pale membrane ground, septa, arils
  if (wa > 0) { g.save(); g.globalCompositeOperation = 'multiply'; ringPath(g, PITHK, 0); g.clip(); bloomFill(g, PITH, 0.75, S.x - 60, S.y - 60, wa); g.restore(); }
  const sa = 1 - 0.6 * eo(split), sq = seg(r, 0.3, 0.6);
  SEPTA.forEach((s, i) => { const off = (q, o) => q.map(([x, y], j) => { const n = j < q.length - 1 ? [q[j + 1][1] - y, -(q[j + 1][0] - x)] : [y - q[j - 1][1], -(x - q[j - 1][0])]; const l = Math.hypot(...n) || 1; return [x + (n[0] / l) * o, y + (n[1] / l) * o]; }); burin(g, off(s, 3), 1.2, `rgba(22,32,26,${0.7 * sa})`, clamp(sq * 1.4 - i * 0.05), jit); burin(g, off(s, -3), 1.2, `rgba(22,32,26,${0.7 * sa})`, clamp(sq * 1.4 - i * 0.05), jit); });
  const ar = seg(r, 0.38, 1.0); const n = Math.floor(ARILS.length * ar);
  for (let i = 0; i < n; i++) drawAril(g, ARILS[i], arilWashed(ARILS[i], wa), jit);
  // peel halves (lifted aside on "set the peel and pale membranes aside")
  for (const side of [-1, 1]) {
    g.save(); g.beginPath(); if (side < 0) g.rect(-W, -H, S.x + W, 3 * H); else g.rect(S.x, -H, 2 * W, 3 * H); g.clip(); g.translate(side * dx, 0);
    drawPeel(g, r, jit, wa);
    if (split > 0) for (const th of [-Math.PI / 2, Math.PI / 2]) { const a = secPt(th, 1.0), b = secPt(th, PITHK); burin(g, [a, b], 2.4, INK, split * 3, jit); }
    g.restore();
  }
  return dx;
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const arilAt = (i) => [ARILS[i].x, ARILS[i].y];
const nearestAril = (th, k) => { const [x, y] = secPt(th, k); let b = 0; ARILS.forEach((a, i) => { if (Math.hypot(a.x - x, a.y - y) < Math.hypot(ARILS[b].x - x, ARILS[b].y - y)) b = i; }); return b; };
const FACTS = [
  { ev: 'kcal', big: '83', unit: 'kcal', name: 'ENERGY', motif: 'rays', from: arilAt(nearestAril(2.3, 0.6)) },
  { ev: 'fibre', big: '4 g', unit: '', name: 'FIBRE', motif: 'fibres', from: arilAt(nearestAril(1.6, 0.45)) },
  { ev: 'vitk', big: '16 µg', unit: '', name: 'VITAMIN K', motif: 'mesh', from: arilAt(nearestAril(0.8, 0.62)) },
];
const MESH = (() => { const q = rng(9), p = []; for (let i = 0; i < 46; i++) { const a = q() * Math.PI * 2, d = Math.sqrt(q()) * (RR - 22); p.push([Math.cos(a) * d, Math.sin(a) * d]); } const e = []; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) { const d = Math.hypot(p[i][0] - p[j][0], p[i][1] - p[j][1]); if (d < 40) e.push([i, j, q()]); } return { p, e }; })();
function motif(g, kind, r, f, jit, act) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'fibres') { const ph = act * 4 + f * 0.04 * (0.3 + act); for (let i = -5; i <= 5; i++) { const p = []; for (let k = 0; k <= 32; k++) { const t = -1 + 2 * (k / 32); const x = t * R * 0.95, y = i * 15 + Math.sin(t * 4 + i + ph * 2.2) * (6 + 4 * act); if (Math.hypot(x, y) < R * 0.94) p.push([x, y]); } if (p.length > 3) burin(g, p, 1.3, `rgba(47,122,28,${0.45 + 0.35 * act})`, r, jit); } }
  if (kind === 'mesh') {  // "helps your blood clot": scattered points draw together and strands link into a net
    const k = eio(act), pt = (i) => [MESH.p[i][0] * (1 - 0.18 * k), MESH.p[i][1] * (1 - 0.18 * k)];
    MESH.e.forEach(([i, j, o]) => { const q = clamp(act * 1.6 - o * 0.6); if (q > 0) burin(g, [pt(i), pt(j)], 1.1, `rgba(22,32,26,${0.25 + 0.35 * act})`, q, jit); });
    g.fillStyle = 'rgba(207,28,64,0.85)'; MESH.p.forEach((_, i) => { if (i / MESH.p.length < r) { const [x, y] = pt(i); g.beginPath(); g.arc(x, y, 2.4 + 1.2 * act, 0, 7); g.fill(); } });
  }
  if (kind === 'glass') {  // engraved tumbler with ruby juice, behind the figure
    g.save(); g.globalAlpha = 0.38 * r; const gl = [[-34, -64], [-28, 62], [28, 62], [34, -64]];
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#C2203F'; g.beginPath(); g.moveTo(-31, -36); g.lineTo(-28, 62); g.lineTo(28, 62); g.lineTo(31, -36); g.closePath(); g.fill(); g.restore();
    burin(g, gl, 2.2, INK, 1, jit); g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, -36, 31, 5, 0, 0, 7); g.stroke();
    for (let k = 0; k < 6; k++) burin(g, [[14 + k * 3, -30], [12 + k * 3, 58]], 0.8, INK2, 1, jit);
    g.restore();
  }
}
function drawRoundel(g, fact, slotXY, f, jit, act, out, label = {}) {
  const t0 = E[fact.ev], p = seg(f, t0 - 4, t0 + 14); if (p <= 0 || out >= 1) return;
  const [sx, sy0] = slotXY, sy = sy0 - 34 * eio(act);
  const k = eo(p); const x = lerp(fact.from[0], sx, k), y = lerp(fact.from[1], sy, k) - Math.sin(Math.PI * k) * 60;
  const sc = Math.exp(Math.log(0.25) * (1 - k)) * (1 + 0.32 * eio(act));
  if (p >= 1 && out <= 0 && !label.noLeader) {   // leader back to the part
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
  const lt = seg(f, label.at ?? t0 + 10, (label.at ?? t0 + 10) + 8);
  if (lt > 0) {
    const big = label.big ?? fact.big, unit = label.unit ?? fact.unit, name = label.name ?? fact.name;
    const shown = big.slice(0, Math.max(1, Math.ceil(big.length * lt)));
    const yv = unit ? 2 : 12 + (fact.motif === 'mesh' ? -16 * eio(act) : 0);
    text(g, shown, 0, yv, '900 56px NDisplay', INK, 'center', 0, 'roundel');
    if (unit && lt >= 1) text(g, unit, 0, 36, '700 24px NText', LEAFDARK, 'center', 2, 'roundel');
    if (lt >= 1) text(g, name, 0, unit ? 66 : 50 + (fact.motif === 'mesh' ? 20 * eio(act) : 0), '700 17px NText', INK2, 'center', 3, 'roundel');
  }
  if (p >= 1) text(g, label.fig ?? `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
FACTS.forEach((fa, i) => (fa.fig = i + 2));
const JUICE = { ev: 'juice', big: '0.1 g', unit: 'fibre', name: 'BOTTLED JUICE', motif: 'glass', from: [930, 760], fig: 5 };
// ---------------- balance: weighing vignette (arils vs 100 g; later whole fruit vs its arils)
const HEAP = (() => { const p = [], rows = [7, 6, 5, 3, 1]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) p.push([(i - (n - 1) / 2) * 19 + (r % 2 ? 2 : -2), -8 - r * 10.5]); }); return p; })();
const HEAP_ARILS = HEAP.map(([x, y], i) => { const q = rng(300 + i), rot = -Math.PI / 2 + (q() - 0.5) * 1.2, s = 8.4; return { x, y, rot, s, seed: q() < 0.3, shape: Array.from({ length: 8 }, (_, j) => { const an = (j / 8) * Math.PI * 2, rr = s * (1 + 0.16 * (q() - 0.5)); const lx = Math.cos(an) * rr * 1.18, ly = Math.sin(an) * rr * 0.88; return [x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)]; }) }; });
function heapAt(g, px, py, n, jit) { g.save(); g.translate(px, py); for (let i = 0; i < Math.min(n, HEAP_ARILS.length); i++) drawAril(g, HEAP_ARILS[i], true, jit, 1.0); g.restore(); }
function drawBalance(g, cx, cy, sc, r, tiltDeg, f, jit, left, right) {
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
  const content = (c, [px, py0]) => {
    const py = py0 + 70;
    if (c.kind === 'weight') { const wq = q(0.45, 0.75); if (wq > 0) { burin(g, [[px - 36, py - 4], [px - 36, py - 76], [px + 36, py - 76], [px + 36, py - 4]], 2.6, INK, wq, jit); burin(g, [[px - 13, py - 76], [px - 13, py - 92], [px + 13, py - 92], [px + 13, py - 76]], 2.2, INK, wq, jit); for (let k = 1; k < 7; k++) burin(g, [[px + 36 - k * 5, py - 72], [px + 36 - k * 5, py - 8]], 0.7, INK2, wq, jit); g.save(); g.globalAlpha = wq; text(g, '100 g', px, py - 32, '700 21px NText', INK, 'center', 1, 'fig'); g.restore(); } }
    if (c.kind === 'arils' && c.n > 0) heapAt(g, px, py, c.n, jit);
    if (c.kind === 'fruit' && c.drop > 0) { const fy = py - 50 - (1 - eo(c.drop)) * 260; drawWholePom(g, px, fy, 0.2, f, jit, 1, 1, { c0: '#F4A08A', c1: '#D8443F', c2: '#A3222F' }); }
  };
  content(left, pans[0]); content(right, pans[1]);
  g.restore();
  return pans.map(([px, py]) => [cx + px * sc, cy + (py + 70) * sc]);
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
function note(g, f, t0, from, to, lines, sub, fade) {
  const lp = seg(f, t0, t0 + 10); if (lp <= 0 || fade <= 0) return;
  g.save(); g.globalAlpha = fade; g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] + 50, lp)); g.stroke(); g.setLineDash([]);
  g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4.5, 0, 7); g.fill();
  const tl = seg(f, t0 + 6, t0 + 16);
  if (tl > 0) { text(g, lines[0].slice(0, Math.ceil(lines[0].length * tl)), to[0], to[1] - 14, '700 22px NText', INK, 'center', 3); if (tl >= 1) { if (lines[1]) text(g, lines[1], to[0], to[1] + 14, '700 22px NText', INK, 'center', 3); text(g, sub, to[0], to[1] + 42, '600 18px NText', LEAFDARK, 'center', 0); } }
  g.restore();
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
  if (tt > 0) { const t1 = 'PLATE III', t2 = 'POMEGRANATE · RAW ARILS'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- hook: whole pomegranate; then burnished out while the large cutaway is re-cut
  const burn = seg(f, E.burnish, E.burnish + 22), sweepX = lerp(G.x - G.A - 40, G.x + G.A + 60, burn);
  let top = null;
  if (burn < 1) {
    g.save(); if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    top = drawWholePom(g, G.x, G.y, 1, f, jit, seg(f, -6, 64), seg(f, E.washWhole, E.washWhole + 26));
    g.restore();
    const ct = seg(f, E.cut, E.cut + 10);
    if (ct > 0 && burn < 0.7) { const p = []; for (let k = 0; k <= 60; k++) p.push(gbody(0.02, 0.04 + (Math.PI - 0.08) * (k / 60))); burin(g, p, 3.8, '#D6452B', ct, jit); }
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, G.y - 290); g.lineTo(sweepX, G.y + 290); g.stroke(); g.restore(); }
  }
  const sr = seg(f, E.section, E.section + 54), split = seg(f, E.peel, E.peel + 26);
  let dx = 0;
  if (sr > 0) {
    g.save(); if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); }
    dx = drawSection(g, sr, jit, seg(f, E.washSection, E.washSection + 22), split);
    g.restore();
    // peel + membranes are set aside (not eaten); the arils are the edible portion
    const fade = 1 - seg(f, E.balanceOut, E.balanceOut + 10);
    const pf = secPt(3.55, 0.99); note(g, f, E.peelNote, [pf[0] - dx, pf[1]], [172, 712], ['PEEL &', 'MEMBRANE'], 'set aside, not eaten', fade);
    const af = arilAt(nearestAril(-0.72, 0.62)); note(g, f, E.arilNote, af, [902, 712], ['ARILS'], 'the part you eat', fade);
  }
  const leafBase = (stemTop) => (stemTop && burn < 1 ? [stemTop.x + 16, stemTop.y + 2] : [secPt(-1.25, 1.0)[0] + dx, secPt(-1.25, 1.0)[1]]);
  const lb = leafBase(top);
  drawLeaf(g, lb[0], lb[1], seg(f, E.leaf, E.leaf + 36), jit, seg(f, E.washWhole + 6, E.washWhole + 30), top && burn < 1 ? -0.25 : 0.22, 150, 30);
  // --- weigh the arils: a balance below the cutaway, arils fly from the section to the pan until it levels with 100 g
  const b1 = seg(f, E.balance, E.balance + 24), b1Out = seg(f, E.balanceOut, E.balanceOut + 14);
  if (b1 > 0 && b1Out < 1) {
    const nFly = HEAP.length, arrived = Math.floor(clamp((f - E.arilsFly) / 28) * nFly + 0.0001);
    const tilt = -9 * (1 - arrived / nFly) + (arrived >= nFly ? 1.6 * Math.exp(-(f - E.arilsFly - 28) / 6) * Math.sin((f - E.arilsFly - 28) * 0.7) : 0);
    g.save(); if (b1Out > 0) { const bx = lerp(130, 990, b1Out); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
    const pans = drawBalance(g, 540, 1330, 0.86, b1, tilt, f, jit, { kind: 'arils', n: arrived }, { kind: 'weight' });
    g.restore();
    for (let i = arrived; i < nFly; i++) {   // arils in flight (stop-motion arcs from the cutaway to the pan)
      const t = (f - E.arilsFly) / 28 * nFly - i; if (t <= -1.2 || t >= 1) continue; const k = clamp(t + 1.2) / 2.2;
      const src = ARILS[(i * 13) % ARILS.length], [hx, hy] = HEAP[i]; const tx = pans[0][0] + hx * 0.86, ty = pans[0][1] + hy * 0.86;
      g.save(); g.translate(lerp(src.x, tx, eo(k)), lerp(src.y, ty, eo(k)) - Math.sin(Math.PI * k) * 70); g.scale(0.9, 0.9); g.translate(-HEAP_ARILS[i].x, -HEAP_ARILS[i].y); drawAril(g, HEAP_ARILS[i], true, jit, 1.0); g.restore();
    }
    if (arrived >= nFly) { const lq = seg(f, E.arilsFly + 30, E.arilsFly + 40) * (1 - b1Out); if (lq > 0) { g.save(); g.globalAlpha = lq; text(g, '100 g of arils', pans[0][0], 1488, '700 21px NText', INK, 'center', 1, 'fig'); g.restore(); } }
    if (b1Out > 0 && b1Out < 1) { const bx = lerp(130, 990, b1Out); g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, 1250); g.lineTo(bx, 1480); g.stroke(); g.restore(); }
  }
  // --- facts (roundels); mechanism: fibre strands flow; vitamin K points link into a clotting net
  const out = seg(f, E.takeOut, E.takeOut + 12), outSide = seg(f, E.juice - 2, E.juice + 10);
  const actF = seg(f, E.digest, E.digest + 14) * (1 - seg(f, E.clot - 6, E.clot + 6));
  const actK = seg(f, E.clot, E.clot + 26) * (1 - seg(f, E.juice - 10, E.juice));
  const mv = eio(seg(f, E.juice, E.juice + 16));
  drawRoundel(g, FACTS[0], SLOTS[0], f, jit, 0, Math.max(out, outSide));
  drawRoundel(g, FACTS[1], [lerp(SLOTS[1][0], 318, mv), SLOTS[1][1]], f, jit, actF, out, mv > 0 ? { noLeader: true, big: '4 g', unit: f >= E.noFibre ? 'fibre' : '', name: f >= E.noFibre ? 'RAW ARILS' : 'FIBRE', at: f >= E.noFibre ? E.noFibre - 4 : undefined } : {});
  drawRoundel(g, FACTS[2], SLOTS[2], f, jit, actK, Math.max(out, outSide));
  // --- juice: an engraved glass roundel beside the arils' fibre
  drawRoundel(g, JUICE, [762, 1362], f, jit, 0, out, { noLeader: true, at: E.noFibre });
  const vs = seg(f, E.vs, E.vs + 8) * (1 - out); if (vs > 0) { g.save(); g.globalAlpha = vs; text(g, 'vs', 540, 1352, '900 40px NDisplay', INK2, 'center', 0, 'fig'); g.restore(); }
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'Per 100 g raw arils · USDA FoodData Central FDC 169134'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
  // --- takeaway: the whole fruit outweighs its edible arils (USDA refuse: skin and membrane, 44 %)
  const br = seg(f, E.balance2, E.balance2 + 30);
  if (br > 0) {
    const tilt = f < E.tip ? 0 : 9 * (1 - Math.exp(-(f - E.tip) / 6) * Math.cos((f - E.tip) * 0.5));
    const pans = drawBalance(g, 540, 1330, 0.86, br, tilt, f, jit, { kind: 'fruit', drop: seg(f, E.fruitDrop - 8, E.fruitDrop) }, { kind: 'arils', n: Math.floor(clamp((f - E.arils2) / 14) * HEAP.length) });
    const l5 = seg(f, E.labels, E.labels + 14);
    if (l5 > 0) { g.save(); g.globalAlpha = l5; text(g, 'whole fruit', 262, 1436, '700 20px NText', INK, 'center', 1, 'fig'); text(g, '44 % peel + membrane', 262, 1462, '600 18px NText', INK2, 'center', 0, 'fig'); text(g, 'edible arils', 818, 1436, '700 20px NText', LEAFDARK, 'center', 1, 'fig'); text(g, 'weigh these', 818, 1462, '600 18px NText', LEAFDARK, 'center', 0, 'fig'); g.restore(); }
  }
  const cr = seg(f, E.credits, E.credits + 22); if (cr > 0) { const s2 = 'del. et sculp. CalMeter'; text(g, s2.slice(0, Math.ceil(s2.length * cr)), 996, 1482, '600 15px NText', INK2, 'right', 1, 'fig'); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f30);
  const sg = seg(f, E.credits, E.credits + 20); if (sg > 0) { g.save(); g.globalAlpha = 0.9 * sg; g.drawImage(icon, 474, 1592, 30, 30); text(g, 'CalMeter', 512, 1616, '700 24px NText', INK, 'left', 0, 'signature'); g.restore(); }
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
