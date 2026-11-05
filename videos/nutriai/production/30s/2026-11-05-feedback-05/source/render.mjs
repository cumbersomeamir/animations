// CalMeter Hindi 30 s feedback-05 (2026-11-05): "सौ ग्राम पनीर में कितना प्रोटीन है?" (plain paneer).
// Same accepted style as the Hindi orange (#03) and chickpea (#04) episodes: Copperplate-engraving plate on IVORY #F4EEDC
// with deep ink #16201A, large engraved cutaway, natural washes, same burin, roundels, bar, balance, camera, Hindi caption
// layout (Noto Sans Devanagari, ink-measured bounds, grapheme cutting) and the CalMeter CTA seal. This file is
// production/30s/2026-11-04-hindi-04/source/render.mjs with the food geometry swapped: an engraved paneer block that a knife
// slices in the first second, a large cut-face cutaway (casein protein network, fat droplets, whey pores), an energy bar
// (fat vs protein calories), a "1 g fat ≈ 9 kcal" roundel, a higher- vs lower-fat cut-face comparison (qualitative, no
// invented values), a blank per-100 g label card and a half-block vs 100 g balance. Original Canvas2D code; art direction
// only from lemo-opuscar styles/engraving/STYLE.md (no Three.js). Stop motion: 15 drawings/s, each held 2 frames.
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
const CURD = '#F6E6B8', CURD_TOP = '#FBF1D2', CURD_SIDE = '#E6CF93', FATC = '#F0BE3E', WHEY = '#B9D3E0';
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
const line = (a, b, n = 24) => Array.from({ length: n + 1 }, (_, k) => [lerp(a[0], b[0], k / n) + Math.sin(k * 1.7 + a[0]) * 0.8, lerp(a[1], b[1], k / n) + Math.cos(k * 1.3 + a[1]) * 0.8]);
// ---------------- paneer block (engraved cuboid: front, top and right faces; pores; light from the upper left)
function blockGeom(x0, y0, w, h, dx, dy) { return { F: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], T: [[x0, y0], [x0 + w, y0], [x0 + w + dx, y0 + dy], [x0 + dx, y0 + dy]], R: [[x0 + w, y0], [x0 + w + dx, y0 + dy], [x0 + w + dx, y0 + h + dy], [x0 + w, y0 + h]] }; }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }
function washPoly(g, pts, col, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a; g.fillStyle = col; poly(g, pts); g.fill(); g.restore(); }
const PORES = (() => { const r = rng(61), p = []; for (let i = 0; i < 120; i++) p.push([r(), r(), 0.8 + r() * 1.8]); return p; })();
function drawBlock(g, B, reveal, jit, wash, sc = 1) {
  g.save(); g.fillStyle = PAPER; poly(g, B.F); g.fill(); poly(g, B.T); g.fill(); poly(g, B.R); g.fill(); g.restore();
  washPoly(g, B.F, CURD, 0.95 * wash); washPoly(g, B.T, CURD_TOP, 0.95 * wash); washPoly(g, B.R, CURD_SIDE, 0.95 * wash);
  const e = (a, b, w, r0, r1) => burin(g, line(a, b), w * Math.max(0.5, sc), INK, seg(reveal, r0, r1), jit);
  const [f0, f1, f2, f3] = B.F, [, , t2, t3] = B.T, [, , r2] = B.R;
  e(f0, f1, 3.2, 0, 0.2); e(f1, f2, 3.4, 0.05, 0.25); e(f2, f3, 3.6, 0.1, 0.3); e(f3, f0, 3.0, 0.15, 0.35); e(f0, t3, 2.6, 0.2, 0.35); e(t3, t2, 2.6, 0.25, 0.4); e(t2, f1, 2.2, 0.3, 0.45); e(t2, r2, 3.2, 0.3, 0.45); e(r2, f2, 3.0, 0.35, 0.5);
  const hr = seg(reveal, 0.4, 1.0);   // right face: dense verticals + crossing family (shade); front: sparse verticals (mid-tone); top: few (lit)
  for (let i = 1; i < 14; i++) { const t = i / 14; const a = [lerp(B.R[0][0], B.R[1][0], t), lerp(B.R[0][1], B.R[1][1], t)], b = [lerp(B.R[3][0], B.R[2][0], t), lerp(B.R[3][1], B.R[2][1], t)]; burin(g, line(a, b, 16), 1.1 * sc, 'rgba(22,32,26,0.6)', clamp(hr * 1.5 - t * 0.3), jit); }
  for (let i = 1; i < 10; i++) { const t = i / 10; const a = [lerp(B.R[0][0], B.R[3][0], t), lerp(B.R[0][1], B.R[3][1], t)], b = [lerp(B.R[1][0], B.R[2][0], t), lerp(B.R[1][1], B.R[2][1], t)]; burin(g, line(a, b, 10), 0.8 * sc, 'rgba(22,32,26,0.4)', clamp(hr * 1.4 - 0.3), jit); }
  for (let i = 1; i < 22; i++) { const t = i / 22; if (t < 0.45 && i % 2) continue; const a = [lerp(B.F[0][0], B.F[1][0], t), B.F[0][1] + 6], b = [lerp(B.F[3][0], B.F[2][0], t), B.F[3][1] - 6]; burin(g, line(a, b, 18), 0.7 * sc, `rgba(22,32,26,${0.18 + 0.3 * t})`, clamp(hr * 1.6 - 0.4), jit); }
  for (let i = 1; i < 5; i++) { const t = i / 5; burin(g, line([lerp(B.T[0][0], B.T[3][0], t) + 10, lerp(B.T[0][1], B.T[3][1], t)], [lerp(B.T[1][0], B.T[2][0], t) - 10, lerp(B.T[1][1], B.T[2][1], t)], 14), 0.6 * sc, 'rgba(22,32,26,0.22)', clamp(hr * 1.5 - 0.5), jit); }
  const pr = seg(reveal, 0.6, 1.0); g.fillStyle = 'rgba(22,32,26,0.55)';
  PORES.forEach(([u, v, s], i) => { if (i / PORES.length > pr) return; const x = lerp(B.F[0][0], B.F[1][0], u * 0.92 + 0.04), y = lerp(B.F[0][1], B.F[3][1], v * 0.9 + 0.05); g.beginPath(); g.ellipse(x, y, s * sc, s * 0.7 * sc, 0, 0, 7); g.fill(); });
}
function drawKnife(g, x, y, a) { g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(-0.08); g.fillStyle = '#E4E6E1'; g.beginPath(); g.moveTo(-8, -260); g.lineTo(10, -260); g.lineTo(14, 0); g.quadraticCurveTo(4, 26, -8, 30); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke(); g.lineWidth = 0.8; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(6, -250 + k * 34); g.lineTo(10, -236 + k * 34); g.stroke(); } g.fillStyle = '#6B4B2E'; g.fillRect(-12, -380, 28, 122); g.strokeStyle = INK; g.lineWidth = 2.4; g.strokeRect(-12, -380, 28, 122); for (const yy of [-350, -300]) { g.fillStyle = PAPER; g.beginPath(); g.arc(2, yy, 4, 0, 7); g.fill(); g.stroke(); } g.restore(); }
// ---------------- cutaway: the cut face of the block, magnified (casein protein network, fat droplets, whey pores)
const S = { x0: 214, y0: 676, x1: 866, y1: 1226 };
const inS = (x, y, m = 0) => x > S.x0 + m && x < S.x1 - m && y > S.y0 + m && y < S.y1 - m;
const sTone = (x, y) => clamp(0.2 + 0.5 * ((x - S.x0) / (S.x1 - S.x0)) * 0.7 + 0.4 * ((y - S.y0) / (S.y1 - S.y0)) * 0.6);
const MESH = (() => { const r = rng(83), out = []; for (let i = 0; i < 230; i++) { let x = lerp(S.x0 + 14, S.x1 - 14, r()), y = lerp(S.y0 + 14, S.y1 - 14, r()), a = r() * Math.PI * 2; const p = [[x, y]]; for (let k = 0; k < 7; k++) { a += (r() - 0.5) * 1.3; x += Math.cos(a) * 11; y += Math.sin(a) * 11; if (!inS(x, y, 10)) break; p.push([x, y]); } if (p.length > 3) out.push(p); } return out; })();
const FATS = (() => { const r = rng(91), out = []; for (let i = 0; i < 3000 && out.length < 150; i++) { const x = lerp(S.x0 + 20, S.x1 - 20, r()), y = lerp(S.y0 + 20, S.y1 - 20, r()), s = 4 + Math.pow(r(), 2) * 9; if (out.every((q) => Math.hypot(q[0] - x, q[1] - y) > q[2] + s + 4)) out.push([x, y, s, r()]); } return out; })();
const PORES2 = (() => { const r = rng(97), out = []; for (let i = 0; i < 60; i++) out.push([lerp(S.x0 + 24, S.x1 - 24, r()), lerp(S.y0 + 24, S.y1 - 24, r()), 2 + r() * 4, r() * 3]); return out; })();
const SEC_EDGE = (() => { const p = []; const r = rng(7); const push = (x, y) => p.push([x + (r() - 0.5) * 5, y + (r() - 0.5) * 5]); for (let k = 0; k <= 40; k++) push(lerp(S.x0, S.x1, k / 40), S.y0); for (let k = 1; k <= 34; k++) push(S.x1, lerp(S.y0, S.y1, k / 34)); for (let k = 1; k <= 40; k++) push(lerp(S.x1, S.x0, k / 40), S.y1); for (let k = 1; k <= 34; k++) push(S.x0, lerp(S.y1, S.y0, k / 34)); return p; })();
function drawSection(g, r, jit, wa, glow) {
  g.save(); g.fillStyle = PAPER; poly(g, SEC_EDGE); g.fill(); g.restore();
  if (wa > 0) { g.save(); poly(g, SEC_EDGE); g.clip(); g.globalCompositeOperation = 'multiply'; const R = 900 * eo(wa); g.beginPath(); for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2, rr = R * (1 + 0.07 * vnoise(th * 3)); g.lineTo(S.x0 + 80 + Math.cos(th) * rr, S.y0 + 60 + Math.sin(th) * rr); } g.closePath(); g.clip(); const lg = g.createLinearGradient(S.x0, S.y0, S.x1, S.y1); lg.addColorStop(0, '#FAEFCC'); lg.addColorStop(1, '#EED9A0'); g.fillStyle = lg; g.fillRect(0, 0, W, H); g.restore(); }
  const mr = seg(r, 0.25, 0.8); MESH.forEach((p, i) => { if (i / MESH.length > mr) return; burin(g, p, 1.1, 'rgba(22,32,26,0.5)', 1, jit, (q) => sTone(p[q][0], p[q][1])); });   // casein protein network
  const pr = seg(r, 0.4, 0.8); PORES2.forEach(([x, y, s, o], i) => { if (i / PORES2.length > pr) return; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = WHEY; g.beginPath(); g.ellipse(x, y, s * 1.6, s, o, 0, 7); g.fill(); g.restore(); g.strokeStyle = 'rgba(22,32,26,0.5)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(x, y, s * 1.6, s, o, 0, 7); g.stroke(); });
  const fr = seg(r, 0.5, 1.0); FATS.forEach(([x, y, s, o], i) => { if (i / FATS.length > fr) return; const jx = (jit() - 0.5) * 1.2, jy = (jit() - 0.5) * 1.2; g.save(); g.fillStyle = wa > 0 ? `rgba(240,190,62,${0.55 + 0.4 * glow})` : PAPER; g.beginPath(); g.arc(x + jx, y + jy, s * (1 + 0.12 * glow), 0, 7); g.fill(); g.restore(); g.strokeStyle = INK; g.lineWidth = 1.1; g.beginPath(); g.arc(x + jx, y + jy, s * (1 + 0.12 * glow), 0, 7); g.stroke(); g.fillStyle = 'rgba(255,250,235,0.85)'; g.beginPath(); g.arc(x + jx - s * 0.35, y + jy - s * 0.35, s * 0.28, 0, 7); g.fill(); });
  const er = seg(r, 0, 0.3); burin(g, SEC_EDGE, 3.6, INK, er, jit);
  for (let i = 0; i < 16; i++) { const t = (i + 0.5) / 16; burin(g, line([S.x1 - 2, lerp(S.y0, S.y1, t)], [S.x1 - 14, lerp(S.y0, S.y1, t) + 10], 4), 1.0, INK2, seg(r, 0.2, 0.5), jit); burin(g, line([lerp(S.x0, S.x1, t), S.y1 - 2], [lerp(S.x0, S.x1, t) + 10, S.y1 - 14], 4), 1.0, INK2, seg(r, 0.2, 0.5), jit); }
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'protein', big: '26', unit: 'ग्राम', name: 'प्रोटीन', motif: 'mesh', from: [360, 880], fig: 2 },
  { ev: 'fat', big: '24.5', unit: 'ग्राम', name: 'फ़ैट', motif: 'globules', from: [FATS[5][0], FATS[5][1]], fig: 3 },
  { ev: 'kcal', big: '325', unit: 'कैलोरी', name: 'ऊर्जा', motif: 'rays', from: [700, 1050], fig: 4 },
];
const GRAM = { ev: 'gram', big: '≈ 9', unit: 'कैलोरी', name: '1 ग्राम फ़ैट', motif: 'one', from: [FATS[20][0], FATS[20][1]], fig: 5 };
function motif(g, kind, r, f, jit, act) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'mesh') { const q = rng(13); for (let i = 0; i < 26; i++) { let x = (q() - 0.5) * 1.6 * R, y = (q() - 0.5) * 1.6 * R, a = q() * 6.3; const p = [[x, y]]; for (let k = 0; k < 6; k++) { a += (q() - 0.5) * 1.4; x += Math.cos(a) * 12; y += Math.sin(a) * 12; p.push([x, y]); } if (i / 26 < r) burin(g, p, 1.1, 'rgba(22,32,26,0.35)', 1, jit); } }
  if (kind === 'globules') { const q = rng(17); for (let i = 0; i < 26; i++) { const a = q() * 6.3, d = Math.sqrt(q()) * R * 0.85, s = 4 + q() * 8; if (i / 26 > r) continue; const x = Math.cos(a) * d, y = Math.sin(a) * d; g.fillStyle = 'rgba(240,190,62,0.6)'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.strokeStyle = 'rgba(22,32,26,0.5)'; g.lineWidth = 0.9; g.stroke(); } }
  if (kind === 'one') { g.fillStyle = 'rgba(240,190,62,0.75)'; g.beginPath(); g.arc(0, 62, 15, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke(); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28; burin(g, [[Math.cos(a) * 20, 62 + Math.sin(a) * 20], [Math.cos(a) * 34, 62 + Math.sin(a) * 34]], 1.3, 'rgba(22,32,26,0.6)', r, jit); } }
}
function drawRoundel(g, fact, slotXY, f, jit, act, out, opts = {}) {
  const t0 = E[fact.ev], p = seg(f, t0 - 4, t0 + 14); if (p <= 0 || out >= 1) return;
  const [sx, sy] = slotXY;
  const k = eo(p); const x = lerp(fact.from[0], sx, k), y = lerp(fact.from[1], sy, k) - Math.sin(Math.PI * k) * 60;
  const sc = Math.exp(Math.log(0.25) * (1 - k));
  if (p >= 1 && out <= 0 && !opts.noLeader) {   // leader back to the part
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
    const yv = fact.motif === 'one' ? -30 : -6;
    text(g, cut(fact.big, lt), 0, yv, F.big(56), INK, 'center', 0, 'roundel');
    if (lt >= 1) { text(g, fact.unit, 0, yv + 30, F.b(21), LEAFDARK, 'center', 0, 'roundel'); text(g, fact.name, 0, fact.motif === 'one' ? 30 : 62, F.b(19), INK2, 'center', 0, 'roundel'); }
  }
  if (p >= 1) text(g, `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- energy bar: 325 kcal = fat 24.5 g × 9 (≈ 220) + protein 26 g × 4 (≈ 104)
function drawBar(g, f, jit, out) {
  const r = seg(f, E.bar, E.bar + 12); if (r <= 0 || out >= 1) return;
  const x0 = 150, x1 = 930, y0 = 1296, y1 = 1374, xf = x0 + (x1 - x0) * (220.5 / 324.5);
  g.save(); if (out > 0) { const bx = lerp(130, 990, out); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
  g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const wf = eo(seg(f, E.barFat, E.barFat + 30));
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = FATC; g.fillRect(x0, y0, (xf - x0) * wf, y1 - y0); if (wf >= 1) { g.fillStyle = '#E7D3A6'; g.fillRect(xf, y0, x1 - xf, y1 - y0); } g.restore();
  const q = rng(5); for (let i = 0; i < 40; i++) { const x = x0 + 10 + q() * (xf - x0 - 20), y = y0 + 10 + q() * (y1 - y0 - 20), s = 3 + q() * 5; if (x > x0 + (xf - x0) * wf) continue; g.strokeStyle = 'rgba(22,32,26,0.45)'; g.lineWidth = 0.8; g.beginPath(); g.arc(x, y, s, 0, 7); g.stroke(); }
  if (wf >= 1) for (let i = 0; i < 8; i++) { const p = []; for (let k = 0; k <= 6; k++) p.push([xf + 8 + k * 12, y0 + 10 + i * 8 + Math.sin(k + i) * 3]); burin(g, p, 0.8, 'rgba(22,32,26,0.45)', 1, jit); }
  burin(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], 2.4, INK, r * 1.2, jit); if (wf >= 1) burin(g, [[xf, y0], [xf, y1]], 2.0, INK, 1, jit);
  text(g, '325 कैलोरी (100 ग्राम)', x0, y0 - 16, F.b(24), INK, 'left', 0, 'fig');
  const l1 = seg(f, E.fatLabel, E.fatLabel + 8); if (l1 > 0) { g.save(); g.globalAlpha = l1; text(g, 'फ़ैट से ≈ 220', (x0 + xf) / 2, y0 + 52, F.big(34), INK, 'center', 0, 'fig'); text(g, '24.5 ग्रा. × 9', (x0 + xf) / 2, y1 + 36, F.s(20), INK2, 'center', 0, 'fig'); g.restore(); }
  const l2 = seg(f, E.protLabel, E.protLabel + 8); if (l2 > 0) { g.save(); g.globalAlpha = l2; text(g, 'प्रोटीन ≈ 104', (xf + x1) / 2, y0 + 50, F.big(26), INK, 'center', 0, 'fig'); text(g, '26 ग्रा. × 4', (xf + x1) / 2, y1 + 36, F.s(20), INK2, 'center', 0, 'fig'); g.restore(); }
  g.restore();
  if (out > 0 && out < 1) { const bx = lerp(130, 990, out); g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, 1260); g.lineTo(bx, 1460); g.stroke(); g.restore(); }
}
// ---------------- comparison: two cut faces, more fat droplets vs fewer (qualitative), energy gauge needles
function drawCompare(g, f, jit, out) {
  const r = seg(f, E.compare, E.compare + 16); if (r <= 0 || out >= 1) return;
  g.save(); g.globalAlpha = 1 - out;
  const panel = (cx, n, label, lvl, t0) => {
    const q = seg(f, t0, t0 + 14); if (q <= 0) return; const x0 = cx - 78, y0 = 1262, w = 156, h = 104;
    g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, w, h); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = CURD; g.fillRect(x0, y0, w, h); g.restore();
    const rr = rng(200 + n); for (let i = 0; i < 14; i++) { let x = x0 + 10 + rr() * (w - 20), y = y0 + 10 + rr() * (h - 20), a = rr() * 6; const p = [[x, y]]; for (let k = 0; k < 4; k++) { a += (rr() - 0.5); x += Math.cos(a) * 9; y += Math.sin(a) * 9; p.push([x, y]); } burin(g, p, 0.9, 'rgba(22,32,26,0.4)', q, jit); }
    for (let i = 0; i < n; i++) { const x = x0 + 12 + rr() * (w - 24), y = y0 + 12 + rr() * (h - 24), s = 4 + rr() * 5; if (i / n > q) continue; g.fillStyle = 'rgba(240,190,62,0.85)'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
    burin(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [x0, y0]], 2.2, INK, q * 1.3, jit);
    text(g, label, cx, y0 + h + 30, F.b(21), INK, 'center', 0, 'fig');
    const gx = cx, gy = y0 + h + 92, gr = 40; burin(g, Array.from({ length: 21 }, (_, k) => [gx + Math.cos(Math.PI + (k / 20) * Math.PI) * gr, gy + Math.sin(Math.PI + (k / 20) * Math.PI) * gr]), 1.8, INK, q, jit);
    const a = Math.PI + Math.PI * lerp(0.1, lvl, eo(q)); burin(g, [[gx, gy], [gx + Math.cos(a) * (gr - 6), gy + Math.sin(a) * (gr - 6)]], 2.6, '#B4472A', 1, jit); g.fillStyle = INK; g.beginPath(); g.arc(gx, gy, 3.5, 0, 7); g.fill();
    text(g, 'कैलोरी', gx, gy + 22, F.s(17), INK2, 'center', 0, 'fig');
  };
  panel(645, 30, 'ज़्यादा फ़ैट', 0.82, E.compare); panel(845, 11, 'कम फ़ैट', 0.48, E.lowFat);
  g.restore();
}
// ---------------- takeaway: a blank per-100 g label card + half of a 200 g block balancing 100 g
function drawLabel(g, f, jit, out) {
  const r = seg(f, E.label, E.label + 16); if (r <= 0 || out >= 1) return;
  g.save(); g.globalAlpha = 1 - out; const x0 = 116, y0 = 1246, w = 372, h = 226;
  g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, w, h); burin(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [x0, y0]], 2.4, INK, r * 1.3, jit); burin(g, [[x0 + 8, y0 + 8], [x0 + w - 8, y0 + 8], [x0 + w - 8, y0 + h - 8], [x0 + 8, y0 + h - 8], [x0 + 8, y0 + 8]], 0.9, INK2, r * 1.3, jit);
  if (r >= 0.6) { text(g, 'पोषण जानकारी', x0 + 22, y0 + 44, F.b(24), INK, 'left', 0, 'fig'); text(g, 'प्रति 100 ग्राम', x0 + w - 22, y0 + 44, F.b(21), LEAFDARK, 'right', 0, 'fig');
    burin(g, [[x0 + 18, y0 + 60], [x0 + w - 18, y0 + 60]], 2.0, INK, 1, jit);
    [['ऊर्जा', 'कैलोरी'], ['प्रोटीन', 'ग्राम'], ['फ़ैट', 'ग्राम']].forEach(([a, u], i) => { const yy = y0 + 104 + i * 42; text(g, a, x0 + 24, yy, F.s(21), INK, 'left', 0, 'fig'); text(g, u, x0 + w - 24, yy, F.s(19), INK2, 'right', 0, 'fig'); burin(g, [[x0 + 150, yy + 2], [x0 + w - 90, yy + 2]], 1.0, 'rgba(22,32,26,0.45)', 1, jit); }); }
  const hl = seg(f, E.labelLine, E.labelLine + 18); if (hl > 0) { burin(g, [[x0 + w - 162, y0 + 54], [x0 + w - 162 + 142 * hl, y0 + 54]], 3.2, '#5AB626', 1, jit); }
  g.restore();
}
function drawBalance(g, cx, cy, sc, r, tiltDeg, f, jit, half, wIn) {
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
  if (half > 0) { const [lx, ly0] = pans[0]; const by = ly0 + 70 - 4 - (1 - eo(half)) * 240; drawBlock(g, blockGeom(lx - 46, by - 58, 66, 58, 30, -22), 1, jit, 1, 0.6); }
  if (wIn > 0) { const [rx, ry0] = pans[1], ry = ry0 + 70 - (1 - eo(wIn)) * 200; burin(g, [[rx - 40, ry - 4], [rx - 40, ry - 80], [rx + 40, ry - 80], [rx + 40, ry - 4]], 2.6, INK, 1, jit); burin(g, [[rx - 14, ry - 80], [rx - 14, ry - 96], [rx + 14, ry - 96], [rx + 14, ry - 80]], 2.2, INK, 1, jit); g.fillStyle = PAPER; g.fillRect(rx - 39, ry - 79, 78, 74); for (let k = 1; k < 7; k++) burin(g, [[rx + 40 - k * 5, ry - 76], [rx + 40 - k * 5, ry - 8]], 0.7, INK2, 1, jit); text(g, '100 ग्रा.', rx - 6, ry - 32, F.b(22), INK, 'center', 0, 'fig'); }
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
  g.save(); g.globalAlpha = fade; g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] - 40, lp)); g.stroke(); g.setLineDash([]);
  g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4.5, 0, 7); g.fill();
  const tl = seg(f, t0 + 6, t0 + 16);
  if (tl > 0) { text(g, cut(head, tl), to[0], to[1] - 10, F.b(24), INK, 'center', 0); if (tl >= 1) text(g, sub, to[0], to[1] + 20, F.s(19), LEAFDARK, 'center', 0); }
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
  const tk = seg(f, E.ctaWord + 26, E.ctaWord + 114); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
}
const canvas = createCanvas(W, H); const g = canvas.getContext('2d');
const HERO = blockGeom(286, 820, 400, 300, 120, -90);
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
  if (tt > 0) { text(g, 'PLATE VII'.slice(0, Math.ceil(9 * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, cut('पनीर · सादा', tt), 540, 626, F.b(28), INK, 'center', 0); }
  // --- hook: the block is cut in the first second (engraved fast, knife drops, the halves part), then burnished to the cut face
  const burn = seg(f, E.burnish, E.burnish + 20), sweepX = lerp(150, 1000, burn);
  if (burn < 1) {
    g.save(); if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    const sp = eo(seg(f, E.split, E.split + 12)) * 44;
    const blkR = seg(f, -8, 26), wash = seg(f, E.washWhole, E.washWhole + 18);
    if (sp <= 0) drawBlock(g, HERO, blkR, jit, wash);
    else {   // two halves part: left half stays, right half slides; the fresh cut face is lit cream with droplets
      const L = blockGeom(286, 820, 200, 300, 120, -90), R = blockGeom(486 + sp, 820, 200, 300, 120, -90);
      drawBlock(g, L, 1, jit, 1);
      const cf = [[486, 820], [606, 730], [606, 1030], [486, 1120]]; g.save(); g.fillStyle = PAPER; poly(g, cf); g.fill(); g.restore(); washPoly(g, cf, '#FAEFC8', 1); burin(g, line(cf[1], cf[2]), 2.2, INK, 1, jit); burin(g, line(cf[2], cf[3]), 2.2, INK, 1, jit);
      const qq = rng(4); for (let i = 0; i < 22; i++) { const u = qq(), v = qq(); const x = lerp(lerp(cf[0][0], cf[1][0], u), lerp(cf[3][0], cf[2][0], u), 0) , y = lerp(lerp(cf[0][1], cf[1][1], u), lerp(cf[3][1], cf[2][1], u), v); g.fillStyle = 'rgba(240,190,62,0.8)'; g.beginPath(); g.arc(x + 6, y, 3 + qq() * 3, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 0.8; g.stroke(); }
      drawBlock(g, R, 1, jit, 1);
    }
    const kf = seg(f, E.knife, E.slice + 6); if (kf > 0 && sp < 30) { const ky = lerp(560, 1010, eio(seg(f, E.knife, E.slice))); drawKnife(g, 548, ky, 1 - seg(f, E.split, E.split + 8)); if (f >= E.slice - 4) burin(g, line([486, 820], [606, 730], 8), 2.4, '#D6452B', seg(f, E.slice - 4, E.slice + 2), jit); }
    g.restore();
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, 650); g.lineTo(sweepX, 1250); g.stroke(); g.restore(); }
  }
  const sr = seg(f, E.section, E.section + 30), glow = f >= E.glow ? Math.sin(seg(f, E.glow, E.glow + 40) * Math.PI) : 0;
  if (sr > 0) {
    g.save(); if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); } drawSection(g, sr, jit, seg(f, E.washSection, E.washSection + 20), glow); g.restore();
    const fade = 1 - seg(f, E.notesOut, E.notesOut + 10);
    note(g, f, E.proteinNote, [300, 770], [150, 742], 'प्रोटीन', 'का जाल', fade);
    note(g, f, E.fatNote, [FATS[40][0], FATS[40][1]], [906, 742], 'फ़ैट', 'की बूँदें', fade);
  }
  // --- facts (roundels), energy bar, then the 1 g fat roundel + the comparison
  const out1 = seg(f, E.roundelsOut, E.roundelsOut + 10);
  FACTS.forEach((fa, i) => drawRoundel(g, fa, SLOTS[i], f, jit, 0, out1));
  drawBar(g, f, jit, seg(f, E.barOut, E.barOut + 14));
  const outC = seg(f, E.compareOut, E.compareOut + 10), mv = eio(seg(f, E.moveGram, E.moveGram + 14));
  drawRoundel(g, GRAM, [lerp(540, 300, mv), 1362], f, jit, 0, outC, { noLeader: mv > 0 });
  drawCompare(g, f, jit, outC);
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); text(g, cut('उदाहरण मान, प्रति 100 ग्राम: Matvaretabellen “Cheese, paneer” 01.301', lg), 540, 1534, F.s(19), INK2, 'center', 0); }
  // --- takeaway: read the per-100 g label; half of a 200 g block balances 100 g
  const tOut = seg(f, E.takeOut, E.takeOut + 14);
  drawLabel(g, f, jit, tOut);
  const br = seg(f, E.balance, E.balance + 24);
  if (br > 0 && tOut < 1) {
    const hIn = seg(f, E.halfDrop - 8, E.halfDrop), wIn = seg(f, E.weight - 8, E.weight);
    const tilt = wIn <= 0 ? 9 * eo(hIn) : 9 * (1 - eo(wIn)) + (wIn >= 1 ? 2.4 * Math.exp(-(f - E.weight) / 16) * Math.sin((f - E.weight) * 0.55) : 0);
    g.save(); g.globalAlpha = 1 - tOut; drawBalance(g, 770, 1338, 0.6, br, tilt, f, jit, hIn, wIn);
    const lp = seg(f, E.portion, E.portion + 18); if (lp > 0) text(g, cut('200 ग्राम पैक का आधा = 100 ग्राम', lp), 770, 1474, F.b(20), INK, 'center', 0, 'fig');
    g.restore();
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
