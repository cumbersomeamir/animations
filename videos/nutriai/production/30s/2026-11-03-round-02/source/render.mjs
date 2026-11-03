// CalMeter round-02 30 s (2026-11-03): "What is inside 100 grams of raw papaya flesh?". Same accepted style as the
// guava batch-02 / pomegranate episodes: Copperplate-engraving plate on IVORY #F4EEDC with deep ink #16201A, large
// engraved cutaway, vivid natural washes (papaya orange flesh, green-yellow skin, black seeds), same typography,
// camera, roundels, balance and caption grammar. This file is production/30s/2026-11-03/source/render.mjs with the
// food geometry swapped (papaya body + long-section with seed cavity), a water/solids bar, an iron-absorption motif,
// a cup-of-cubes balance and an engraved CalMeter CTA cartouche (inside the plate, clear of the bottom overlay).
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
const icon = await loadImage(path.resolve(here, '../../../../assets/icon.png'));
const TL = JSON.parse(fs.readFileSync(path.join(here, 'timeline.json')));
const E = TL.events;
const W = 1080, H = 1920, N = TL.frames;
const PAPER = '#F4EEDC', INK = '#16201A', INK2 = 'rgba(22,32,26,0.72)', LEAF = '#5AB626', LEAFDARK = '#2F7A1C';
const FLESH_OUT = '#F7A452', FLESH_IN = '#EE7428', SKIN_COL = '#9CC24A', SEED_COL = '#2E2722', CUBE = '#F08A3A';
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
// ---------------- whole papaya (analytic body, vertical axis; narrow stem end on top, faint longitudinal lobes)
const G = { x: 540, y: 955, A: 182, B: 296, C: 176 };
const Lv = (() => { const v = [-0.55, 0.6, 0.58]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function gbody(u, v, cx = G.x, cy = G.y, sc = 1) {
  const r = Math.pow(Math.max(0, 1 - u * u), 0.42) * (0.82 - 0.18 * u) * (1 + 0.03 * Math.sin(5 * v + 0.4));
  const X = G.A * r * Math.cos(v), Y = G.B * u, Z = G.C * r * Math.sin(v);
  const nx = X / (G.A * G.A), ny = Y / (G.B * G.B), nz = Z / (G.C * G.C), nl = Math.hypot(nx, ny, nz) || 1;
  const lit = clamp((nx * Lv[0] + ny * Lv[1] + nz * Lv[2]) / nl);
  return { x: cx + X * sc, y: cy - Y * sc, tone: clamp(1 - lit * 1.15) };
}
function gfamilies() {
  const fam = { 1: [], 2: [], 3: [] }, th = { 1: 0.14, 2: 0.5, 3: 0.75 };
  const raw = { 1: [], 2: [], 3: [] };
  for (let i = 1; i < 34; i++) { const v = (i / 34) * Math.PI, p = []; for (let k = 0; k <= 80; k++) p.push([-0.985 + 1.97 * (k / 80), v]); raw[1].push(p); }
  for (let i = 1; i < 30; i++) { const u = -0.95 + 1.9 * (i / 30), p = []; for (let k = 0; k <= 60; k++) p.push([u, 0.04 + (Math.PI - 0.08) * (k / 60)]); raw[2].push(p); }
  for (let i = -12; i < 22; i++) { const p = []; for (let k = 0; k <= 60; k++) { const u = -0.98 + 1.96 * (k / 60), v = 0.27 * i + 1.5 * (k / 60); if (v > 0.04 && v < Math.PI - 0.04) p.push([u, v]); } if (p.length > 4) raw[3].push(p); }
  for (const k of [1, 2, 3]) for (const p of raw[k]) { let cur = []; for (const [u, v] of p) { const q = gbody(u, v); if (q.tone > th[k]) cur.push([u, v]); else { if (cur.length > 3) fam[k].push(cur); cur = []; } } if (cur.length > 3) fam[k].push(cur); }
  return fam;
}
const GF = gfamilies();
const gsil = (cx, cy, sc) => { const a = [], b = []; for (let k = 0; k <= 120; k++) { const u = -1 + 2 * (k / 120); a.push(gbody(u, 0, cx, cy, sc)); b.push(gbody(u, Math.PI, cx, cy, sc)); } return a.concat(b.reverse()); };
function drawStem(g, x, y, sc, r, jit) { const w = 9 * sc; burin(g, [[x - w, y + 4 * sc], [x - w * 0.8, y - 20 * sc]], 2.6 * Math.max(0.5, sc), INK, r, jit); burin(g, [[x + w, y + 4 * sc], [x + w * 0.8, y - 20 * sc]], 2.6 * Math.max(0.5, sc), INK, r, jit); if (r >= 1) { g.save(); g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y - 20 * sc, w * 0.8, 3 * sc, 0, 0, 7); g.stroke(); g.restore(); } }
function drawWholePapaya(g, cx, cy, sc, f, jit, reveal = 1, wash = 1) {
  const sil = gsil(cx, cy, sc);
  if (wash > 0) {  // skin wash: sunlit yellow-orange to yellow-green to green, laid under the ink
    g.save(); g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.clip();
    const ox = cx - 100 * sc, oy = cy - 60 * sc, R = 700 * sc * eo(wash);
    g.beginPath(); for (let k = 0; k <= 64; k++) { const th = (k / 64) * Math.PI * 2, rr = R * (1 + 0.06 * vnoise(th * 3 + 1)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.88;
    const lg = g.createRadialGradient(cx - 70 * sc, cy + 40 * sc, 10, cx, cy, 330 * sc);
    lg.addColorStop(0, '#FBB646'); lg.addColorStop(0.55, '#E5BE48'); lg.addColorStop(1, '#78A53C');
    g.fillStyle = lg; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); g.restore();
  }
  burin(g, sil, 3.4 * Math.max(0.5, sc), INK, seg(reveal, 0, 0.3), jit, (j) => sil[j].tone);
  const fam = (k, w, a0, a1, alpha) => GF[k].forEach((run, i) => { const r = clamp(seg(reveal, a0, a1) * 1.5 - (i % 10) * 0.05); if (r > 0) { const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, w * Math.max(0.5, sc), `rgba(22,32,26,${alpha})`, r, jit, (j) => pts[j].tone); } });
  fam(1, 1.4, 0.12, 0.6, 0.85); fam(2, 1.1, 0.35, 0.8, 0.75); fam(3, 0.85, 0.55, 1.0, 0.6);
  const st = gbody(0.995, Math.PI / 2, cx, cy, sc); drawStem(g, st.x, st.y, sc, seg(reveal, 0.4, 0.7), jit);
}
// ---------------- cutaway (large long-section): skin band, orange flesh, seed cavity with black seeds
const S = { x: 540, y: 955, A: 182, B: 296 };
// section outline = the whole fruit's silhouette (same half-width profile), found per angle by bisection and tabulated
const halfW = (u) => S.A * Math.pow(Math.max(0, 1 - u * u), 0.42) * (0.82 - 0.18 * u);
const SEC_TAB = Array.from({ length: 721 }, (_, i) => { const th = (i / 720) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th); let lo = 0, hi = S.B * 1.05; for (let k = 0; k < 40; k++) { const R = (lo + hi) / 2, u = -(R * s) / S.B; if (Math.abs(u) <= 1 && Math.abs(R * c) <= halfW(u)) lo = R; else hi = R; } return lo; });
const secR = (th) => { const t = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * 720, i = Math.floor(t), fr = t - i; return lerp(SEC_TAB[i], SEC_TAB[Math.min(720, i + 1)], fr) * (1 + 0.01 * Math.sin(5 * th)); };
const secPt = (th, k) => [S.x + Math.cos(th) * secR(th) * k, S.y + Math.sin(th) * secR(th) * k];
const secTone = (x, y) => { const dx = (x - S.x) / S.A, dy = (y - S.y) / S.B; return clamp(0.12 + 0.5 * (dx * 0.6 + dy * 0.7) * 0.9 + 0.45 * Math.pow(Math.hypot(dx, dy), 3)); };
const SKIN = 0.962;
const CV = { x: 540, y: 990, a: 68, b: 188 };
const cavR = (th) => { const s = Math.sin(th), c = Math.cos(th), a = CV.a * (0.8 + 0.2 * s); return (1 / Math.sqrt((c / a) ** 2 + (s / CV.b) ** 2)) * (1 + 0.03 * Math.sin(9 * th + 1) + 0.02 * Math.sin(15 * th) + 0.05 * Math.sin(3 * th)); };
const cavPt = (th, k) => [CV.x + Math.cos(th) * cavR(th) * k, CV.y + Math.sin(th) * cavR(th) * k];
const SEEDS = (() => { const r = rng(23), s = []; for (let i = 0; i < 6000 && s.length < 56; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.88; const [x, y] = cavPt(a, d); if (s.every((q) => Math.hypot(q.x - x, q.y - y) > 19)) s.push({ x, y, r: 7 + r() * 2 }); } return s.sort((p, q) => p.y - q.y); })();
const DISH = { x: 192, y: 1062 };
const DISH_HEAP = (() => { const out = [], rows = [10, 9, 9, 8, 7, 6, 4, 3]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) out.push([DISH.x + (i - (n - 1) / 2) * 13 + (r % 2 ? 3 : -3), DISH.y - 4 - r * 9]); }); while (out.length < SEEDS.length) out.push([DISH.x, DISH.y - 76]); return out; })();
function outlinePath(g, k) { g.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = secPt((i / 200) * Math.PI * 2, k); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }
function cavPath(g, k = 1, rev = false) { for (let i = 0; i <= 160; i++) { const j = rev ? 160 - i : i; const [x, y] = cavPt((j / 160) * Math.PI * 2, k); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }
function fleshClip(g) { outlinePath(g, SKIN); cavPath(g, 1, true); g.clip('evenodd'); }
function bloomFill(g, fill, alpha, ox, oy, a) { const R = 760 * eo(a); g.beginPath(); for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2, rr = R * (1 + 0.07 * vnoise(th * 3 + ox)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip(); g.globalAlpha = alpha; g.fillStyle = fill; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); }
function drawSeed(g, x, y, r, jit, lw = 1) {
  g.save(); g.fillStyle = 'rgba(214,206,178,0.75)'; g.beginPath(); g.arc(x, y, r * 1.45, 0, 7); g.fill(); g.strokeStyle = INK2; g.lineWidth = 0.6 * lw; g.stroke();   // translucent gel sac
  g.fillStyle = SEED_COL; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.strokeStyle = 'rgba(244,238,220,0.35)'; g.lineWidth = 0.7; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x - r * 0.7, y + k * r * 0.32 + r * 0.2); g.lineTo(x + r * 0.7, y + k * r * 0.32 - r * 0.2); g.stroke(); }   // engraved ridges
  g.fillStyle = 'rgba(255,250,235,0.8)'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.22, 0, 7); g.fill();
  g.restore(); burin(g, Array.from({ length: 13 }, (_, i) => [x + Math.cos(i / 12 * Math.PI * 2) * r, y + Math.sin(i / 12 * Math.PI * 2) * r]), 1.2 * lw, INK, 1, jit, () => 0.6);
}
const FLESH_CONT = []; for (let k = 0.93; k > 0.5; k -= 0.042) { const p = []; for (let i = 0; i <= 220; i++) p.push(secPt(-0.5 + (i / 220) * Math.PI * 2, k)); FLESH_CONT.push(p); }
function drawSection(g, r, jit, wa, seedsOut, skinOff, water) {
  // washes under the ink: flesh (outer light orange to vivid inner orange), cavity gel
  if (wa > 0) {
    g.save(); g.globalCompositeOperation = 'multiply'; fleshClip(g);
    const gr = g.createRadialGradient(CV.x, CV.y, 60, S.x, S.y, 300); gr.addColorStop(0, FLESH_IN); gr.addColorStop(1, FLESH_OUT);
    bloomFill(g, gr, 0.95, S.x - 60, S.y - 40, wa); g.restore();
    g.save(); g.globalCompositeOperation = 'multiply'; g.beginPath(); cavPath(g); g.clip(); bloomFill(g, seedsOut > 0.5 ? '#F6C98A' : '#E7DCBC', 0.8, CV.x, CV.y, wa); g.restore();
  }
  // flesh contours (form-following, clipped out of the cavity)
  g.save(); fleshClip(g); const kc = seg(r, 0.2, 0.7); FLESH_CONT.forEach((c, i) => { const q = clamp(kc * FLESH_CONT.length - i); if (q > 0) burin(g, c, 1.05, 'rgba(22,32,26,0.42)', q, jit, (j) => secTone(c[j][0], c[j][1])); });
  if (water > 0) { g.globalAlpha = water; for (let y = 640; y < 1260; y += 15) { const p = []; for (let x = 300; x <= 780; x += 10) p.push([x, y + Math.sin(x * 0.045 + y * 0.1) * 3.5]); burin(g, p, 1.3, 'rgba(38,110,180,0.75)', 1, jit); } }
  g.restore();
  // cavity wall + seeds (seeds lift out to the dish on "seeds out")
  const cw = []; for (let i = 0; i <= 200; i++) cw.push(cavPt((i / 200) * Math.PI * 2, 1)); burin(g, cw, 2.2, INK, seg(r, 0.35, 0.6), jit);
  const sd = seg(r, 0.5, 1.0);
  SEEDS.forEach((s, i) => { if (i / SEEDS.length > sd) return; const t0 = (i / SEEDS.length) * 0.65, k = clamp((seedsOut - t0) / 0.35); if (k <= 0) { drawSeed(g, s.x, s.y, s.r, jit); return; } const [hx, hy] = DISH_HEAP[i]; const x = lerp(s.x, hx, eo(k)), y = lerp(s.y, hy, eo(k)) - Math.sin(Math.PI * k) * 90; drawSeed(g, x, y, s.r * lerp(1, 0.8, k), jit); });
  // skin band: drawn with the flesh edge, then lifts off (expands and fades to a ghost) on "skin off"
  const fe = []; for (let i = 0; i <= 300; i++) fe.push(secPt(-0.5 + (i / 300) * Math.PI * 2, SKIN)); burin(g, fe, 1.8, INK, seg(r, 0.15, 0.4), jit);
  const ks = 1 + 0.09 * eo(skinOff), sa = 1 - 0.86 * eo(skinOff);
  g.save(); g.globalAlpha = sa; g.translate(S.x, S.y); g.scale(ks, ks); g.translate(-S.x, -S.y);
  if (wa > 0) { g.save(); g.globalCompositeOperation = 'multiply'; outlinePath(g, 1.0); for (let i = 200; i >= 0; i--) { const [x, y] = secPt((i / 200) * Math.PI * 2, SKIN); g.lineTo(x, y); } g.closePath(); g.clip('evenodd'); bloomFill(g, SKIN_COL, 0.95 * sa, S.x - 150, S.y - 160, wa); g.restore(); }
  const p = []; for (let i = 0; i <= 300; i++) p.push(secPt(-0.5 + (i / 300) * Math.PI * 2, 1)); burin(g, p, 3.8, INK, seg(r, 0, 0.2), jit);
  const sk = seg(r, 0.1, 0.4); for (let i = 0; i < 240 * sk; i++) { const th = (i / 240) * Math.PI * 2; const a = secPt(th, 1), b = secPt(th, SKIN); g.strokeStyle = INK; g.lineWidth = secTone(a[0], a[1]) > 0.35 ? 1.4 : 0.8; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const st = secPt(-Math.PI / 2, 1); drawStem(g, st[0], st[1], 1, seg(r, 0.2, 0.5), jit);
  g.restore();
}
function drawDish(g, r, jit) {   // small engraved dish in the left margin that receives the seeds
  if (r <= 0) return; const { x, y } = DISH;
  g.save(); g.fillStyle = PAPER; g.beginPath(); g.ellipse(x, y, 76, 16, 0, 0, Math.PI); g.lineTo(x - 52, y + 26); g.lineTo(x + 52, y + 26); g.closePath(); g.fill(); g.restore();
  const rim = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; rim.push([x + Math.cos(a) * 76, y + Math.sin(a) * 16]); } burin(g, rim, 2.2, INK, r, jit);
  const body = []; for (let i = 0; i <= 30; i++) { const t = i / 30; body.push([x - 76 + 152 * t, y + Math.sin(Math.PI * t) * 34]); } burin(g, body, 2.6, INK, r, jit);
  for (let i = 0; i < 9; i++) { const t = 0.55 + i * 0.05; burin(g, [[x - 76 + 152 * t, y + 6 + Math.sin(Math.PI * t) * 4], [x - 76 + 152 * t, y + Math.sin(Math.PI * t) * 32]], 0.8, INK2, r, jit); }
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'kcal', big: '43', unit: 'kcal', name: 'ENERGY', motif: 'rays', from: secPt(3.5, 0.75), fig: 2 },
  { ev: 'fibre', big: '1.7 g', unit: '', name: 'FIBRE', motif: 'fibres', from: secPt(1.2, 0.8), fig: 3 },
  { ev: 'vitc', big: '61 mg', unit: '', name: 'VITAMIN C', motif: 'stipple', from: secPt(0.2, 0.75), fig: 4 },
];
const FACTS2 = [
  { ev: 'fibre2', big: '1.7 g', unit: 'fibre', name: 'DIGESTION', motif: 'fibres', from: secPt(2.4, 0.8), fig: 5 },
  { ev: 'vitc2', big: '61 mg', unit: 'vitamin C', name: 'ABSORBS IRON', motif: 'iron', from: secPt(0.7, 0.8), fig: 6 },
];
const IRON = (() => { const q = rng(41), p = []; for (let i = 0; i < 10; i++) p.push([-38 + i * 8.4, -78 - (i % 2) * 10, q(), 80 + (i % 2) * 6]); return p; })();
function motif(g, kind, r, f, jit, act) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'fibres') { const ph = act * 4 + f * 0.04 * (0.3 + act); for (let i = -5; i <= 5; i++) { const p = []; for (let k = 0; k <= 32; k++) { const t = -1 + 2 * (k / 32); const x = t * R * 0.95, y = i * 15 + Math.sin(t * 4 + i + ph * 2.2) * (6 + 4 * act); if (Math.hypot(x, y) < R * 0.94) p.push([x, y]); } if (p.length > 3) burin(g, p, 1.3, `rgba(47,122,28,${0.45 + 0.35 * act})`, r, jit); } }
  if (kind === 'stipple') { const q = rng(9); g.fillStyle = 'rgba(232,118,40,0.9)'; for (let i = 0; i < 90; i++) { const a = q() * Math.PI * 2, d = Math.sqrt(q()) * R * 0.85; if (i / 90 < r) { g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 2.2, 0, 7); g.fill(); } } }
  if (kind === 'iron') {   // "vitamin C helps your body absorb iron": iron dots, each met by a vitamin C dot, pass through the gut wall
    const wall = (o) => Array.from({ length: 33 }, (_, k) => { const x = -R + (2 * R * k) / 32; return [x, 64 + o + Math.sin(x * 0.07) * 4]; });
    burin(g, wall(0), 1.8, 'rgba(22,32,26,0.7)', r, jit); burin(g, wall(7), 1.2, 'rgba(22,32,26,0.45)', r, jit);
    IRON.forEach(([x, y, o, y1]) => { const k = eio(clamp(act * 1.5 - o * 0.5)); const yy = lerp(y, y1, k), xx = x * lerp(1, 1.15, k);
      g.fillStyle = 'rgba(232,118,40,0.9)'; g.beginPath(); g.arc(xx + 7 - 4 * k, yy - 6 + 3 * k, 3.2, 0, 7); g.fill();
      g.fillStyle = 'rgba(22,32,26,0.85)'; g.beginPath(); g.arc(xx, yy, 3.6, 0, 7); g.fill(); });
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
    const shown = fact.big.slice(0, Math.max(1, Math.ceil(fact.big.length * lt)));
    const yv = fact.motif === 'iron' ? -8 : fact.unit ? 2 : 12;
    text(g, shown, 0, yv, '900 56px NDisplay', INK, 'center', 0, 'roundel');
    if (fact.unit && lt >= 1) text(g, fact.unit, 0, yv + 32, '700 22px NText', LEAFDARK, 'center', 1, 'roundel');
    if (lt >= 1) text(g, fact.name, 0, fact.motif === 'iron' ? 50 : fact.unit ? 66 : 50, '700 17px NText', INK2, 'center', 3, 'roundel');
  }
  if (p >= 1) text(g, `FIG. ${fact.fig}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- water / solids bar: 100 g of flesh = 88 g water (0 kcal) + 12 g, mostly sugars and fibre (the 43 kcal)
function drawBar(g, f, jit, out) {
  const r = seg(f, E.bar, E.bar + 12); if (r <= 0 || out >= 1) return;
  const x0 = 150, x1 = 930, y0 = 1296, y1 = 1374, xw = x0 + (x1 - x0) * 0.881;
  g.save(); if (out > 0) { const bx = lerp(130, 990, out); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
  g.fillStyle = '#FBF6E8'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const wf = eo(seg(f, E.water, E.water + 22));
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#8CC0E6'; g.fillRect(x0, y0, (xw - x0) * wf, y1 - y0); if (wf >= 1) { g.fillStyle = FLESH_IN; g.fillRect(xw, y0, x1 - xw, y1 - y0); } g.restore();
  for (let y = y0 + 9; y < y1; y += 11) { const p = []; for (let x = x0 + 4; x <= x0 + (xw - x0) * wf; x += 9) p.push([x, y + Math.sin(x * 0.06 + y + f * 0.15) * 2.5]); if (p.length > 2) burin(g, p, 1.0, 'rgba(22,32,26,0.45)', 1, jit); }
  if (wf >= 1) for (let i = 0; i < 9; i++) burin(g, [[xw + 4 + i * 10, y1 - 4], [xw + 4 + i * 10 + 16, y0 + 4]], 0.9, 'rgba(22,32,26,0.55)', 1, jit);
  burin(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], 2.4, INK, r * 1.2, jit); if (wf >= 1) burin(g, [[xw, y0], [xw, y1]], 2.0, INK, 1, jit);
  text(g, '100 g papaya flesh', x0, y0 - 16, '700 22px NText', INK, 'left', 2, 'fig');
  const lw = seg(f, E.waterLabel, E.waterLabel + 8); if (lw > 0) { g.save(); g.globalAlpha = lw; text(g, '88 g water', (x0 + xw) / 2, y0 + 50, '900 36px NDisplay', INK, 'center', 0, 'fig'); g.restore(); }
  const lz = seg(f, E.zero, E.zero + 10); if (lz > 0) { g.save(); g.globalAlpha = lz; text(g, '0 kcal', (x0 + xw) / 2, y1 + 40, '900 32px NDisplay', '#26609A', 'center', 0, 'fig'); text(g, '43 kcal', x1, y1 + 40, '900 32px NDisplay', LEAFDARK, 'right', 0, 'fig'); text(g, '12 g: mostly sugars + fibre', x1, y1 + 70, '600 19px NText', INK2, 'right', 0, 'fig'); g.restore(); }
  g.restore();
  if (out > 0 && out < 1) { const bx = lerp(130, 990, out); g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, 1260); g.lineTo(bx, 1460); g.stroke(); g.restore(); }
}
// ---------------- balance (takeaway): a cup of papaya cubes vs a 145 g weight
const CUBES = (() => { const p = []; [[-30, 0], [-10, 0], [10, 0], [30, 0], [-20, -14], [0, -14], [20, -14], [-10, -28], [10, -28]].forEach(([x, y], i) => p.push([x, y, i])); return p; })();
function drawCube(g, x, y, s, jit) {
  const top = [[x, y - s * 0.5], [x + s * 0.6, y - s * 0.2], [x, y + s * 0.1], [x - s * 0.6, y - s * 0.2]], left = [[x - s * 0.6, y - s * 0.2], [x, y + s * 0.1], [x, y + s * 0.9], [x - s * 0.6, y + s * 0.6]], right = [[x, y + s * 0.1], [x + s * 0.6, y - s * 0.2], [x + s * 0.6, y + s * 0.6], [x, y + s * 0.9]];
  const fill = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); };
  fill(top, '#F6B36A'); fill(left, CUBE); fill(right, '#D9672A');
  for (const q of [top, left, right]) burin(g, q.concat([q[0]]), 1.0, INK, 1, jit);
  for (let k = 1; k < 3; k++) burin(g, [[x + s * 0.6 * k / 3, y - s * 0.2 + s * 0.3 * (1 - k / 3) + s * 0.1], [x + s * 0.6 * k / 3, y + s * 0.6 + s * 0.3 * (1 - k / 3)]], 0.6, INK2, 1, jit);
}
function drawCup(g, px, py, jit, fill = 1) {   // engraved measuring cup heaped with cubes (dropped in one by one), sitting on the pan surface py
  g.fillStyle = PAPER; g.beginPath(); g.moveTo(px - 40, py - 66); g.lineTo(px + 40, py - 66); g.lineTo(px + 32, py - 2); g.lineTo(px - 32, py - 2); g.closePath(); g.fill();
  CUBES.forEach(([x, y], i) => { const k = clamp(fill * CUBES.length - i); if (k > 0) drawCube(g, px + x, py - 80 + y - (1 - eo(k)) * 120, 20, jit); });
  g.fillStyle = PAPER; g.beginPath(); g.moveTo(px - 40, py - 66); g.lineTo(px + 40, py - 66); g.lineTo(px + 32, py - 2); g.lineTo(px - 32, py - 2); g.closePath(); g.fill();
  burin(g, [[px - 40, py - 66], [px - 32, py - 2], [px + 32, py - 2], [px + 40, py - 66]], 2.4, INK, 1, jit);
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(px, py - 66, 40, 7, 0, 0, 7); g.stroke();
  for (let i = 0; i < 6; i++) burin(g, [[px + 14 + i * 4, py - 60], [px + 12 + i * 3.5, py - 6]], 0.8, INK2, 1, jit);
  for (let i = 1; i < 4; i++) burin(g, [[px - 36 + i * 1.5, py - 66 + i * 15], [px - 24 + i * 1.5, py - 66 + i * 15]], 1.0, INK, 1, jit);
  burin(g, [[px - 40, py - 54], [px - 62, py - 50], [px - 64, py - 30], [px - 36, py - 24]], 2.2, INK, 1, jit);
}
function drawBalance(g, cx, cy, sc, r, tiltDeg, f, jit, cupIn, weightIn, cubesIn = 1) {
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
  if (cupIn > 0) { const [lx, ly0] = pans[0]; drawCup(g, lx, ly0 + 70 - (1 - eo(cupIn)) * 240, jit, cubesIn); }
  if (weightIn > 0) { const [rx, ry0] = pans[1], ry = ry0 + 70 - (1 - eo(weightIn)) * 200; burin(g, [[rx - 40, ry - 4], [rx - 40, ry - 80], [rx + 40, ry - 80], [rx + 40, ry - 4]], 2.6, INK, 1, jit); burin(g, [[rx - 14, ry - 80], [rx - 14, ry - 96], [rx + 14, ry - 96], [rx + 14, ry - 80]], 2.2, INK, 1, jit); g.fillStyle = PAPER; g.fillRect(rx - 39, ry - 79, 78, 74); for (let k = 1; k < 7; k++) burin(g, [[rx + 40 - k * 5, ry - 76], [rx + 40 - k * 5, ry - 8]], 0.7, INK2, 1, jit); text(g, '145 g', rx - 6, ry - 34, '700 22px NText', INK, 'center', 0, 'fig'); }
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
function note(g, f, t0, from, to, lines, sub, fade) {
  const lp = seg(f, t0, t0 + 10); if (lp <= 0 || fade <= 0) return;
  g.save(); g.globalAlpha = fade; g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] - 40, lp)); g.stroke(); g.setLineDash([]);
  g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4.5, 0, 7); g.fill();
  const tl = seg(f, t0 + 6, t0 + 16);
  if (tl > 0) { text(g, lines[0].slice(0, Math.ceil(lines[0].length * tl)), to[0], to[1] - 14, '700 22px NText', INK, 'center', 3); if (tl >= 1) { if (lines[1]) text(g, lines[1], to[0], to[1] + 14, '700 22px NText', INK, 'center', 3); text(g, sub, to[0], to[1] + (lines[1] ? 42 : 14), '600 18px NText', LEAFDARK, 'center', 0); } }
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
  const tk = seg(f, E.ctaWord + 38, E.ctaWord + 84); for (let i = 0; i < 48 * tk; i++) { const a = -Math.PI / 2 + (i / 48) * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + 12), cy + Math.sin(a) * (R0 + 12)); g.lineTo(cx + Math.cos(a) * (R0 + 19), cy + Math.sin(a) * (R0 + 19)); g.stroke(); }
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
  if (tt > 0) { const t1 = 'PLATE IV', t2 = 'PAPAYA · RAW FLESH'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- hook: whole papaya cut fast, then burnished out while the large long-section is re-cut
  const burn = seg(f, E.burnish, E.burnish + 20), sweepX = lerp(G.x - G.A - 40, G.x + G.A + 60, burn);
  if (burn < 1) {
    g.save(); if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    drawWholePapaya(g, G.x, G.y, 1, f, jit, seg(f, -8, 30), seg(f, E.washWhole, E.washWhole + 22));
    g.restore();
    const ct = seg(f, E.cut, E.cut + 8);
    if (ct > 0 && burn < 0.7) { const p = []; for (let k = 0; k <= 60; k++) p.push(gbody(-0.98 + 1.96 * (k / 60), Math.PI / 2)); burin(g, p, 3.8, '#D6452B', ct, jit); }
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, G.y - 320); g.lineTo(sweepX, G.y + 320); g.stroke(); g.restore(); }
  }
  const sr = seg(f, E.section, E.section + 32);
  const seedsOut = seg(f, E.seedsOut, E.seedsOut + 34), skinOff = seg(f, E.skinOff, E.skinOff + 22);
  const water = seg(f, E.water, E.water + 16) * (1 - seg(f, E.barOut - 8, E.barOut + 4));
  drawDish(g, seg(f, E.seedsOut - 10, E.seedsOut + 6), jit);
  if (sr > 0) {
    g.save(); if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); }
    drawSection(g, sr, jit, seg(f, E.washSection, E.washSection + 20), seedsOut, skinOff, water * 0.8);
    g.restore();
    const fade = 1 - seg(f, E.notesOut, E.notesOut + 10);
    note(g, f, E.seedNote, [DISH.x, DISH.y + 34], [DISH.x, DISH.y + 96], ['SEEDS'], 'not eaten', fade);
    note(g, f, E.skinNote, secPt(-0.55, 1.08), [858, 712], ['SKIN'], 'not eaten', fade);
    note(g, f, E.fleshNote, secPt(0.45, 0.8), [862, 1130], ['FLESH'], 'the 100 g', fade);
  }
  // --- facts (roundels), then the water/solids bar, then the two function roundels
  const out1 = seg(f, E.roundelsOut, E.roundelsOut + 10);
  FACTS.forEach((fa, i) => drawRoundel(g, fa, SLOTS[i], f, jit, 0, out1));
  drawBar(g, f, jit, seg(f, E.barOut, E.barOut + 14));
  const out2 = seg(f, E.roundels2Out, E.roundels2Out + 10);
  const actF = seg(f, E.digest, E.digest + 14) * (1 - seg(f, E.vitc2 + 4, E.vitc2 + 16)), actC = seg(f, E.iron, E.iron + 40);
  drawRoundel(g, FACTS2[0], [318, 1362], f, jit, actF, out2, { grow: 0.22 });
  drawRoundel(g, FACTS2[1], [762, 1362], f, jit, actC, out2, { grow: 0.22 });
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'Per 100 g raw papaya flesh · USDA FoodData Central FDC 169926'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
  // --- takeaway: a cup of cubes balances 145 g (USDA portion "1 cup, 1-inch pieces" = 145 g)
  const br = seg(f, E.balance, E.balance + 26), bOut = seg(f, E.balanceOut, E.balanceOut + 14);
  if (br > 0 && bOut < 1) {
    const cupIn = seg(f, E.cupDrop - 8, E.cupDrop), wIn = seg(f, E.weight - 8, E.weight);
    const cubesIn = seg(f, E.cupDrop + 2, E.cupDrop + 34);
    const tilt = wIn <= 0 ? (3 + 6 * cubesIn) * eo(cupIn) : 9 * (1 - eo(wIn)) + (wIn >= 1 ? 2.4 * Math.exp(-(f - E.weight) / 16) * Math.sin((f - E.weight) * 0.55) : 0);
    g.save(); if (bOut > 0) { const bx = lerp(130, 990, bOut); g.beginPath(); g.rect(bx, 0, W, H); g.clip(); }
    drawBalance(g, 540, 1330, 0.86, br, tilt, f, jit, cupIn, wIn, cubesIn);
    const lk = seg(f, E.weight + 6, E.weight + 30); if (lk > 0) { const a = secPt(2.2, 0.7), b = [258, 1222]; g.save(); g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], lk), lerp(a[1], b[1], lk)); g.stroke(); g.setLineDash([]); g.fillStyle = INK; g.beginPath(); g.arc(a[0], a[1], 4.5, 0, 7); g.fill(); g.restore(); }
    const l1 = seg(f, E.cupDrop + 4, E.cupDrop + 16); if (l1 > 0) { g.save(); g.globalAlpha = l1; text(g, '1 cup of cubes', 258, 1440, '700 21px NText', INK, 'center', 1, 'fig'); g.restore(); }
    const l2 = seg(f, E.label62, E.label62 + 14); if (l2 > 0) { const s62 = '≈ 62 kcal'; text(g, s62.slice(0, Math.ceil(s62.length * l2)), 258, 1470, '900 26px NDisplay', LEAFDARK, 'center', 0, 'fig'); }
    const l3 = seg(f, E.label62 + 10, E.label62 + 44); if (l3 > 0) { const s3 = '145 g × 43 kcal / 100 g'; text(g, s3.slice(0, Math.ceil(s3.length * l3)), 822, 1470, '600 19px NText', INK2, 'center', 0, 'fig'); }
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
