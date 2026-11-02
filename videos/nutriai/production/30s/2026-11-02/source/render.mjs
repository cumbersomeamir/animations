// NutriAI production 30 s #01: "What is actually in 100 grams of mango?". Copperplate-engraving plate (original code).
// Art direction: lemo-opuscar styles/engraving/STYLE.md (read-only). Canvas2D, stop motion at 15 drawings/s (each held 2 frames).
// Usage: node render.mjs            -> build/video-noaudio.mp4 + build/textlog.json
//        node render.mjs --still 0,120,300
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const here = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(path.resolve(here, '../../../../source/package.json'));   // reuse the app's installed @napi-rs/canvas
const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const FONTS = path.resolve(here, '../../../../source/fonts');
GlobalFonts.registerFromPath(path.join(FONTS, 'InterDisplay-Black.otf'), 'NDisplay');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-SemiBold.otf'), 'NText');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Bold.otf'), 'NText');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Medium.otf'), 'NText');
const icon = await loadImage(path.resolve(here, '../../../../assets/icon.png'));
const TL = JSON.parse(fs.readFileSync(path.join(here, 'timeline.json')));
const E = TL.events;

const W = 1080, H = 1920, N = TL.frames;
const PAPER = '#0D150F', INK = '#E9E3CD', INK2 = 'rgba(233,227,205,0.78)', LEAF = '#5AB626', LIME = '#A6E955', MIST = '#EDF6E5', LEAFDARK = '#2F7A1C';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const vnoise = (x) => Math.sin(x * 1.7) * 0.5 + Math.sin(x * 3.9 + 1.3) * 0.3 + Math.sin(x * 8.3 + 2.1) * 0.2;

// ------------------------------------------------------------------ text with logged device-space bounds
const TEXT_LOG = [];
let FRAME = 0;
function text(g, s, x, y, font, col, align = 'center', track = 0, tag = 'plate') {
  g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic';
  g.letterSpacing = `${track}px`;
  g.fillText(s, x, y);
  const m = g.measureText(s);
  g.letterSpacing = '0px';
  if (g.globalAlpha < 0.05) return m.width;
  const x0 = align === 'center' ? x - m.width / 2 : align === 'right' ? x - m.width : x;
  const T = g.getTransform();
  const pts = [[x0, y - m.actualBoundingBoxAscent], [x0 + m.width, y - m.actualBoundingBoxAscent], [x0, y + m.actualBoundingBoxDescent], [x0 + m.width, y + m.actualBoundingBoxDescent]].map(([a, b]) => [T.a * a + T.c * b + T.e, T.b * a + T.d * b + T.f]);
  TEXT_LOG.push({ f: FRAME, s, tag, x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), y1: Math.max(...pts.map((p) => p[1])) });
  return m.width;
}

// ------------------------------------------------------------------ burin stroke: swells mid-run, tapers at both ends
function burin(g, pts, w, col, reveal = 1, jit = null, toneAt = null) {
  const n = pts.length;
  const m = Math.floor((n - 1) * clamp(reveal)) + 1;
  if (m < 2) return;
  g.strokeStyle = col;
  g.lineCap = 'round';
  for (let i = 1; i < m; i++) {
    const u = i / (n - 1);
    let sw = 0.2 + 0.8 * Math.pow(Math.sin(Math.PI * u), 0.7);
    if (u < 0.22) sw *= u / 0.22; else if (u > 0.78) sw *= (1 - u) / 0.22;
    const t = toneAt ? toneAt(i) : 0.6;
    g.lineWidth = Math.max(0.3, w * (0.25 + sw) * (0.45 + 0.9 * t));
    const a = pts[i - 1], b = pts[i];
    const ax = a.x ?? a[0], ay = a.y ?? a[1], bx = b.x ?? b[0], by = b.y ?? b[1];   // accepts {x,y} body points or [x,y]
    const jx = jit ? (jit() - 0.5) * 0.7 : 0, jy = jit ? (jit() - 0.5) * 0.7 : 0;
    g.beginPath(); g.moveTo(ax + jx, ay + jy); g.lineTo(bx + jx, by + jy); g.stroke();
  }
}

// ------------------------------------------------------------------ whole mango (analytic body -> form-following hatch families)
const M = { x: 540, y: 845, A: 300, B: 185, C: 160, rot: -0.16 };
const L = (() => { const v = [-0.55, 0.58, 0.6]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function body(u, v) {
  let s = Math.sqrt(Math.max(0, 1 - u * u));
  s *= 1 - 0.18 * Math.max(0, -u - 0.35);                 // the beak end narrows
  const arch = 32 * (1 - u * u) - 18 * Math.max(0, -u - 0.4);
  const X = M.A * u, Y = M.B * s * Math.cos(v) + arch, Z = M.C * s * Math.sin(v);
  const px = X, py = -Y;
  const c = Math.cos(M.rot), sn = Math.sin(M.rot);
  const nx = X / (M.A * M.A), ny = (Y - arch) / (M.B * M.B), nz = Z / (M.C * M.C);
  const nl = Math.hypot(nx, ny, nz) || 1;
  const lit = clamp((nx * L[0] + ny * L[1] + nz * L[2]) / nl);
  return { x: M.x + px * c - py * sn, y: M.y + px * sn + py * c, tone: clamp(1 - lit * 1.15), Z };
}
function familyLines(kind) {
  const lines = [];
  if (kind === 1) for (let i = 1; i < 36; i++) { const v = (i / 36) * Math.PI; const p = []; for (let k = 0; k <= 90; k++) p.push(body(-0.985 + 1.97 * (k / 90), v)); lines.push(p); }
  if (kind === 2) for (let i = 1; i < 30; i++) { const u = -0.95 + 1.9 * (i / 30); const p = []; for (let k = 0; k <= 60; k++) p.push(body(u, 0.04 + (Math.PI - 0.08) * (k / 60))); lines.push(p); }
  if (kind === 3) for (let i = -14; i < 26; i++) { const p = []; for (let k = 0; k <= 70; k++) { const u = -0.98 + 1.96 * (k / 70); const v = 0.25 * i + 1.6 * (k / 70); if (v > 0.04 && v < Math.PI - 0.04) p.push(body(u, v)); } if (p.length > 4) lines.push(p); }
  // keep only the runs whose tone passes this family's threshold (families switch on by tone)
  const th = kind === 1 ? 0.14 : kind === 2 ? 0.5 : 0.75;
  const runs = [];
  for (const p of lines) { let cur = []; for (const q of p) { if (q.tone > th) cur.push(q); else { if (cur.length > 3) runs.push(cur); cur = []; } } if (cur.length > 3) runs.push(cur); }
  return runs;
}
const F1 = familyLines(1), F2 = familyLines(2), F3 = familyLines(3);
const SIL = (() => { const top = [], bot = []; for (let k = 0; k <= 160; k++) { const u = -1 + 2 * (k / 160); top.push(body(u, 0.0)); bot.push(body(u, Math.PI)); } return top.concat(bot.reverse()); })();
const STEM = body(0.985, 0.25);
function drawLeaf(g, reveal, jit, washA) {
  // leaf attached at the stem, lying up and to the right
  const bx = STEM.x + 6, by = STEM.y - 6, ang = -0.55, len = 230, wid = 70;
  const P = (t, side) => { const x = t * len, y = side * wid * Math.sin(Math.PI * Math.pow(t, 0.85)) * (1 - 0.15 * t); return [bx + x * Math.cos(ang) - y * Math.sin(ang), by + x * Math.sin(ang) + y * Math.cos(ang)]; };
  const edge1 = [], edge2 = [], mid = [];
  for (let k = 0; k <= 40; k++) { const t = k / 40; edge1.push(P(t, 1)); edge2.push(P(t, -1)); mid.push(P(t, 0)); }
  if (washA > 0) {
    g.save(); g.globalAlpha = 0.55 * washA; g.fillStyle = LEAF; g.beginPath(); edge1.concat(edge2.slice().reverse()).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore();
  }
  burin(g, edge1, 2.2, INK, reveal * 1.4, jit);
  burin(g, edge2, 2.6, INK, reveal * 1.4, jit);
  burin(g, mid, 1.6, INK, reveal * 1.2, jit);
  for (let i = 1; i < 9; i++) {           // veins hatch toward the shadowed lower edge
    const t0 = i / 10, r = clamp(reveal * 1.6 - 0.5 - i * 0.05);
    if (r <= 0) continue;
    const a = P(t0, 0), b = P(Math.min(1, t0 + 0.12), -0.85), c2 = P(Math.min(1, t0 + 0.1), 0.8);
    burin(g, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2], b], 1.2, INK2, r, jit);
    burin(g, [a, c2], 0.8, INK2, r, jit);
  }
  // stem
  burin(g, [[STEM.x - 4, STEM.y + 8], [STEM.x + 4, STEM.y - 8], [STEM.x + 10, STEM.y - 22]], 3.2, INK, reveal * 2, jit);
}
function wholeWash(g, a, f) {
  if (a <= 0) return;
  g.save();
  g.beginPath(); SIL.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.clip();
  // bloom from the upper-left with a ragged front
  const ox = M.x - 200, oy = M.y - 120, R = 760 * eo(a);
  g.beginPath();
  for (let k = 0; k <= 72; k++) { const th = (k / 72) * Math.PI * 2; const rr = R * (1 + 0.06 * vnoise(th * 3 + f * 0.01)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); }
  g.closePath(); g.clip();
  g.globalAlpha = 0.6;
  const lg = g.createLinearGradient(M.x - M.A, M.y, M.x + M.A, M.y - 60);
  lg.addColorStop(0, '#E28A1E'); lg.addColorStop(0.55, '#EBA92E'); lg.addColorStop(0.86, '#C9A52F'); lg.addColorStop(1, '#7FA33A');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(M.x + 40, M.y - 150, 10, M.x + 40, M.y - 120, 260);   // red blush on the sun side
  rg.addColorStop(0, 'rgba(196,58,36,0.85)'); rg.addColorStop(1, 'rgba(196,58,36,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.restore();
}

// ------------------------------------------------------------------ cutaway section (halved fruit: skin band, flesh contours, fibres, stone)
const S = { x: 545, y: 850, RX: 285, RY: 190 };
function secOutline(th, k = 1) {
  const bulge = 1 + 0.10 * Math.cos(th - 0.6) - 0.06 * Math.cos(2 * th + 0.3) + 0.05 * Math.sin(3 * th);
  const x = Math.cos(th) * S.RX * bulge * k, y = Math.sin(th) * S.RY * bulge * k;
  return [S.x + x + (1 - k) * 16, S.y + y - 0.10 * (x * x) / S.RX * k + (1 - k) * 8];
}
function secTone(x, y) { const dx = (x - S.x) / S.RX, dy = (y - S.y) / S.RY; return clamp(0.15 + 0.5 * (dx * 0.55 + dy * 0.75) * 0.9 + 0.5 * Math.pow(Math.hypot(dx, dy), 3)); }
const STONE = { x: S.x + 18, y: S.y + 4, rx: 132, ry: 56, rot: -0.12 };
function inStone(x, y) { const c = Math.cos(-STONE.rot), s = Math.sin(-STONE.rot); const dx = (x - STONE.x) * c - (y - STONE.y) * s, dy = (x - STONE.x) * s + (y - STONE.y) * c; return (dx * dx) / (STONE.rx * STONE.rx) + (dy * dy) / (STONE.ry * STONE.ry) < 1; }
const SEC_CONT = [];
for (let k = 0.93; k > 0.2; k -= 0.034) { const runs = []; let cur = []; for (let i = 0; i <= 240; i++) { const q = secOutline((i / 240) * Math.PI * 2, k); if (inStone(q[0], q[1])) { if (cur.length > 3) runs.push(cur); cur = []; } else cur.push(q); } if (cur.length > 3) runs.push(cur); SEC_CONT.push(runs); }
const SEC_FIB = [];
{ const r = rng(7); for (let i = 0; i < 120; i++) { const th = (i / 120) * Math.PI * 2 + r() * 0.02; const p = []; for (let s = 0; s <= 36; s++) { const [x, y] = secOutline(th + Math.sin(s * 0.2 + i) * 0.015, 0.3 + 0.6 * (s / 36)); if (!inStone(x, y) && secTone(x, y) > 0.45) p.push([x, y]); } if (p.length > 5) SEC_FIB.push(p); } }
const STONE_H = [];
for (let y = STONE.y - STONE.ry; y <= STONE.y + STONE.ry; y += 6) { const p = []; for (let x = STONE.x - STONE.rx; x <= STONE.x + STONE.rx; x += 5) { const yy = y + (x - STONE.x) * Math.tan(STONE.rot); if (inStone(x, yy)) p.push([x, yy]); } if (p.length > 3) STONE_H.push(p); }
function secPath(g, k) { g.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = secOutline((i / 200) * Math.PI * 2, k); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }
function fleshWash(g, a, f, boost = 0) {
  if (a <= 0) return;
  g.save();
  secPath(g, 0.955); g.clip();
  const ox = S.x - 160, oy = S.y - 90, R = 640 * eo(a);
  g.beginPath(); for (let k = 0; k <= 72; k++) { const th = (k / 72) * Math.PI * 2; const rr = R * (1 + 0.07 * vnoise(th * 3 + 2)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
  g.globalAlpha = 0.62 + 0.25 * boost;
  const rg = g.createRadialGradient(S.x - 90, S.y - 70, 20, S.x, S.y, S.RX * 1.1);
  rg.addColorStop(0, '#F4B23A'); rg.addColorStop(0.6, '#E58C1C'); rg.addColorStop(1, '#A9520C');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.restore();
  // stone stays unwashed: paint the paper back inside it (stone is not counted)
  g.save(); g.globalAlpha = 0.9; g.fillStyle = PAPER; g.beginPath(); g.ellipse(STONE.x, STONE.y, STONE.rx, STONE.ry, STONE.rot, 0, Math.PI * 2); g.fill(); g.restore();
}
function drawSection(g, r, jit) {
  const oc = seg(r, 0, 0.18), kc = seg(r, 0.1, 0.62), fr = seg(r, 0.45, 0.85), sr = seg(r, 0.3, 0.7), sk = seg(r, 0.2, 0.6);
  const pts = []; for (let i = 0; i <= 300; i++) pts.push(secOutline(-0.4 + (i / 300) * Math.PI * 2, 1));
  burin(g, pts, 3.4, INK, oc, jit);
  SEC_CONT.forEach((runs, i) => { const q = clamp(kc * SEC_CONT.length - i); if (q > 0) for (const run of runs) burin(g, run, 1.5, 'rgba(233,227,205,0.88)', q, jit, (j) => secTone(run[j][0], run[j][1])); });
  SEC_FIB.forEach((p, i) => { const q = clamp(fr * 1.6 - (i % 10) * 0.06); if (q > 0) burin(g, p, 1.0, 'rgba(233,227,205,0.65)', q, jit); });
  if (sr > 0) {
    g.save(); g.translate(STONE.x, STONE.y); g.rotate(STONE.rot); g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.ellipse(0, 0, STONE.rx, STONE.ry, 0, 0, Math.PI * 2 * sr); g.stroke(); g.restore();
    STONE_H.forEach((p, i) => { const q = clamp(sr * 1.8 - i * 0.04); if (q > 0) burin(g, p, 1.2, 'rgba(233,227,205,0.8)', q, jit); });
  }
  for (let i = 0; i < 240 * sk; i++) {   // skin band
    const th = (i / 240) * Math.PI * 2 - 0.4; const [x1, y1] = secOutline(th, 1), [x2, y2] = secOutline(th, 0.952);
    g.strokeStyle = INK; g.lineWidth = secTone(x1, y1) > 0.35 ? 1.3 : 0.7; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
}

// ------------------------------------------------------------------ balance vignette (Fig. 2: 100 g of flesh against a 100 g weight)
function drawBalance(g, cx, cy, sc, r, tiltDeg, jit) {
  g.save(); g.translate(cx, cy); g.scale(sc, sc);
  const q = (a, b) => seg(r, a, b);
  burin(g, [[-150, 150], [150, 150]], 3, INK, q(0, 0.2), jit);                            // base
  burin(g, [[0, 150], [0, -40]], 3.2, INK, q(0.05, 0.3), jit);                            // pillar
  for (let i = 0; i < 10; i++) burin(g, [[-4 + i * 1.2, 140], [-4 + i * 1.2, -30]], 0.7, INK2, q(0.1, 0.35), jit);
  const a = (tiltDeg * Math.PI) / 180;
  const ex = 190 * Math.cos(a), ey = 190 * Math.sin(a);
  burin(g, [[-ex, -40 + ey], [0, -40], [ex, -40 - ey]], 3, INK, q(0.15, 0.4), jit);       // beam
  for (const [s, py] of [[-1, -40 + ey], [1, -40 - ey]]) {
    const px = s * ex;
    burin(g, [[px, py], [px - 70, py + 70]], 1.1, INK2, q(0.25, 0.5), jit);
    burin(g, [[px, py], [px + 70, py + 70]], 1.1, INK2, q(0.25, 0.5), jit);
    const pan = []; for (let k = 0; k <= 30; k++) { const t = k / 30; pan.push([px - 80 + 160 * t, py + 70 + 14 * Math.sin(Math.PI * t)]); }
    burin(g, pan, 2.6, INK, q(0.3, 0.55), jit);
  }
  // left pan: cubes of flesh (hatched)
  const lpx = -ex, lpy = -40 + ey + 70;
  const cubes = [[-45, -22], [-5, -22], [35, -22], [-25, -58], [15, -58], [-5, -94]];
  cubes.forEach(([dx, dy], i) => {
    const qq = q(0.45 + i * 0.05, 0.6 + i * 0.05); if (qq <= 0) return;
    const x = lpx + dx, y = lpy + dy;
    g.save(); g.globalAlpha = 0.55 * qq; g.fillStyle = '#E58C1C'; g.fillRect(x - 17, y - 17, 34, 34); g.restore();
    burin(g, [[x - 17, y - 17], [x + 17, y - 17], [x + 17, y + 17], [x - 17, y + 17], [x - 17, y - 17]], 1.8, INK, qq, jit);
    for (let k = 1; k < 5; k++) burin(g, [[x - 17 + k * 7, y - 15], [x - 17 + k * 7, y + 15]], 0.7, INK2, qq, jit);
  });
  // right pan: cylindrical 100 g weight
  const rpx = ex, rpy = -40 - ey + 70;
  const wq = q(0.5, 0.75);
  if (wq > 0) {
    burin(g, [[rpx - 34, rpy - 4], [rpx - 34, rpy - 70], [rpx + 34, rpy - 70], [rpx + 34, rpy - 4]], 2.4, INK, wq, jit);
    burin(g, [[rpx - 12, rpy - 70], [rpx - 12, rpy - 86], [rpx + 12, rpy - 86], [rpx + 12, rpy - 70]], 2, INK, wq, jit);
    for (let k = 1; k < 7; k++) burin(g, [[rpx + 34 - k * 5, rpy - 66], [rpx + 34 - k * 5, rpy - 8]], 0.7, INK2, wq, jit);
    g.save(); g.globalAlpha = wq; text(g, '100 g', rpx, rpy - 28, '700 20px NText', INK, 'center', 1); g.restore();
  }
  g.restore();
}

// ------------------------------------------------------------------ roundels (magnified facts)
const SLOTS = [[300, 1150], [780, 1150], [300, 1380], [780, 1380]];
const RR = 106;
const FACTS = [
  { ev: 'kcal', big: '60', unit: 'kcal', name: 'ENERGY', motif: 'rays', from: [S.x - 120, S.y - 60] },
  { ev: 'carbs', big: '15 g', unit: '', name: 'CARBOHYDRATE', motif: 'grains', from: [S.x + 150, S.y - 70] },
  { ev: 'fibre', big: '1.6 g', unit: '', name: 'FIBRE', motif: 'fibres', from: [S.x - 170, S.y + 60] },
  { ev: 'vitc', big: '36 mg', unit: '', name: 'VITAMIN C', motif: 'stipple', from: [S.x + 170, S.y + 70] },
];
function roundelMotif(g, kind, r, jit) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 22, Math.sin(a) * 22], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(233,227,205,0.35)', r, jit); }
  if (kind === 'grains') { const q = rng(4); for (let i = 0; i < 26; i++) { const x = (q() - 0.5) * R * 1.6, y = (q() - 0.5) * R * 1.6; if (Math.hypot(x, y) > R * 0.85) continue; const p = []; for (let k = 0; k <= 12; k++) { const a = (k / 12) * Math.PI * 2; p.push([x + Math.cos(a) * 9, y + Math.sin(a) * 7]); } burin(g, p, 0.9, 'rgba(233,227,205,0.35)', r, jit); } }
  if (kind === 'fibres') for (let i = -5; i <= 5; i++) { const p = []; for (let k = 0; k <= 30; k++) { const t = -1 + 2 * (k / 30); const x = t * R * 0.9, y = i * 15 + Math.sin(t * 4 + i) * 6; if (Math.hypot(x, y) < R * 0.92) p.push([x, y]); } if (p.length > 3) burin(g, p, 1.2, 'rgba(233,227,205,0.4)', r, jit); }
  if (kind === 'stipple') { const q = rng(9); g.fillStyle = 'rgba(255,190,70,0.75)'; for (let i = 0; i < 70 * r; i++) { const a = q() * Math.PI * 2, d = Math.sqrt(q()) * R * 0.85; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 1.4, 0, 7); g.fill(); } }
}
function drawRoundel(g, fact, i, f, jit, glow) {
  const t0 = E[fact.ev];
  const p = seg(f, t0 - 4, t0 + 16);
  if (p <= 0) return;
  const [sx, sy] = SLOTS[i];
  const k = eo(p);
  const x = lerp(fact.from[0], sx, k), y = lerp(fact.from[1], sy, k) - Math.sin(Math.PI * k) * 60;
  const sc = Math.exp(Math.log(0.25) * (1 - k));          // log-linear growth to size
  // leader from rim to the part (after landing)
  if (p >= 1) {
    const lp = seg(f, t0 + 16, t0 + 26);
    const dx = fact.from[0] - sx, dy = fact.from[1] - sy, dl = Math.hypot(dx, dy);
    const rx = sx + (dx / dl) * (RR + 10), ry = sy + (dy / dl) * (RR + 10);
    g.save(); g.strokeStyle = 'rgba(233,227,205,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(rx, ry); g.lineTo(lerp(rx, fact.from[0], lp), lerp(ry, fact.from[1], lp)); g.stroke();
    if (lp >= 1) { g.fillStyle = INK; g.beginPath(); g.arc(fact.from[0], fact.from[1], 4, 0, 7); g.fill(); }
    g.restore();
  }
  g.save(); g.translate(x, y); g.scale(sc, sc);
  if (glow > 0) { g.fillStyle = `rgba(166,233,85,${0.18 * glow})`; g.beginPath(); g.arc(0, 0, RR + 26, 0, 7); g.fill(); }
  g.save(); g.beginPath(); g.arc(0, 0, RR, 0, 7); g.clip();
  g.fillStyle = 'rgba(6,11,8,0.94)'; g.fillRect(-RR, -RR, 2 * RR, 2 * RR);
  g.strokeStyle = 'rgba(90,182,38,0.22)'; g.lineWidth = 1; for (let yy = -RR; yy < RR; yy += 6) { g.beginPath(); g.moveTo(-RR, yy); g.lineTo(RR, yy); g.stroke(); }
  roundelMotif(g, fact.motif, seg(f, t0, t0 + 14), jit);
  g.restore();
  const ring = seg(f, t0 - 4, t0 + 6);
  g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.arc(0, 0, RR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke();
  g.lineWidth = 1.1; g.beginPath(); g.arc(0, 0, RR + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke();
  // value cut on landing
  const lt = seg(f, t0 + 12, t0 + 20);
  if (lt > 0) {
    g.save(); g.globalAlpha = 1;
    const shown = fact.big.slice(0, Math.max(1, Math.ceil(fact.big.length * lt)));
    text(g, shown, 0, fact.unit ? 4 : 14, '900 56px NDisplay', LIME, 'center', 0, 'roundel');
    if (fact.unit && lt >= 1) text(g, fact.unit, 0, 40, '700 24px NText', INK, 'center', 2, 'roundel');
    if (lt >= 1) text(g, fact.name, 0, fact.unit ? 70 : 54, '700 17px NText', INK2, 'center', 3, 'roundel');
    g.restore();
  }
  text(g, `FIG. ${i + 3}`, 0, -RR - 18, '700 15px NText', p >= 1 ? INK2 : 'rgba(0,0,0,0)', 'center', 3, 'fig');
  g.restore();
}

// ------------------------------------------------------------------ paper grain (world space)
const grain = createCanvas(W, H);
{ const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3); for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = img.data[i + 1] = img.data[i + 2] = v > 0.5 ? 225 : 0; img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 2 * 13); } g.putImageData(img, 0, 0); }

// ------------------------------------------------------------------ camera (a loupe over the sheet)
function camera(f) {
  const keys = [[0, 1.32, 540, 760], [80, 1.0, 540, 1010], [236, 1.0, 540, 1010], [300, 1.04, 540, 1060], [560, 1.04, 540, 1060], [610, 1.0, 540, 1010], [762, 1.0, 540, 1010], [786, 1.035, 500, 980], [820, 1.035, 500, 980], [870, 1.0, 540, 1010], [900, 1.0, 540, 1010]];
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++;
  const [f0, z0, x0, y0] = keys[k], [f1, z1, x1, y1] = keys[k + 1];
  const t = eio(seg(f, f0, f1));
  return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), x: lerp(x0, x1, t), y: lerp(y0, y1, t) };
}

// ------------------------------------------------------------------ captions (screen-fixed, upper centre, ink y 350-470)
function captions(g, f) {
  for (const c of TL.captions) {
    if (f < c.in - 1 || f > c.out + 1) continue;
    const out = seg(f, c.out - 6, c.out);
    // group runs into lines (a third element appends a run to an existing line)
    const lines = [];
    for (const r of c.lines) { if (r.length > 2) lines[r[2]].push(r); else lines.push([r]); }
    lines.forEach((runs, li) => {
      const font = '900 58px NDisplay';
      g.font = font;
      const total = runs.reduce((a, r) => a + g.measureText(r[0]).width, 0);
      let x = 540 - total / 2;
      const y = li === 0 ? 401 : 455;
      for (const [s, f0] of runs) {
        const a = seg(f, f0, f0 + 6) * (1 - out);
        g.save(); g.globalAlpha = a;
        const w = text(g, s, x, y, font, li === 0 ? MIST : LIME, 'left', 0, 'caption');
        g.restore();
        x += w;
      }
    });
  }
}

const canvas = createCanvas(W, H);
const g = canvas.getContext('2d');
function draw(f30) {
  const f = Math.floor(f30 / 2) * 2;
  FRAME = f30;
  const jit = rng(1000 + f);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const cam = camera(f);
  g.translate(540, 1010); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(grain, 0, 0);
  // plate mark + ruled border + title cut letter by letter
  g.strokeStyle = 'rgba(90,182,38,0.4)'; g.lineWidth = 6; g.strokeRect(62, 528, 956, 984);
  g.strokeStyle = 'rgba(233,227,205,0.55)'; g.lineWidth = 2.2; g.strokeRect(74, 540, 932, 960);
  g.strokeStyle = 'rgba(233,227,205,0.25)'; g.lineWidth = 0.8; g.strokeRect(84, 550, 912, 940);
  const tt = seg(f, E.title, E.title + 24);
  if (tt > 0) {
    const t1 = 'PLATE I', t2 = 'MANGO · RAW EDIBLE FLESH';
    text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 592, '700 20px NText', INK2, 'center', 8);
    text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 628, '700 28px NText', INK, 'center', 6);
  }
  // --- B1 whole mango (then burnished out during B2)
  const burn = seg(f, E.burnish, E.burnish + 26);
  const sweepX = lerp(M.x - M.A - 40, M.x + M.A + 60, burn);
  if (burn < 1) {
    g.save();
    if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    wholeWash(g, seg(f, E.washWhole, E.washWhole + 30), f);
    const oc = seg(f, E.outline, E.outline + 20);
    burin(g, SIL, 3.4, INK, oc, jit, (j) => SIL[j].tone);
    F1.forEach((run, i) => burin(g, run, 1.5, 'rgba(233,227,205,0.9)', clamp(seg(f, E.hatch1, E.hatch1 + 34) * 1.5 - (i % 12) * 0.04), jit, (j) => run[j].tone));
    F2.forEach((run, i) => burin(g, run, 1.2, 'rgba(233,227,205,0.75)', clamp(seg(f, E.hatch2, E.hatch2 + 28) * 1.5 - (i % 10) * 0.05), jit, (j) => run[j].tone));
    F3.forEach((run, i) => burin(g, run, 0.9, 'rgba(233,227,205,0.6)', clamp(seg(f, E.hatch3, E.hatch3 + 24) * 1.5 - (i % 8) * 0.05), jit, (j) => run[j].tone));
    g.restore();
    // the cut: one heavy burin run along the fruit's long axis
    const ct = seg(f, E.cut, E.cut + 12);
    if (ct > 0 && burn < 0.6) { const p = []; for (let k = 0; k <= 80; k++) p.push(body(-0.98 + 1.96 * (k / 80), Math.PI / 2)); burin(g, p.map((q) => [q.x, q.y]), 3.6, LIME, ct, jit); }
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(233,227,205,0.35)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, M.y - 260); g.lineTo(sweepX, M.y + 260); g.stroke(); g.restore(); }
  }
  // leaf + stem stay on the plate through both states
  drawLeaf(g, seg(f, E.leaf, E.leaf + 42), jit, seg(f, E.washWhole + 6, E.washWhole + 34));
  // --- B2 section re-cut where the burnisher has passed
  const secR = seg(f, E.section, E.section + 72);
  if (secR > 0) {
    g.save();
    if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); }
    const glowP = f >= E.portionGlow ? Math.sin(seg(f, E.portionGlow, E.portionGlow + 40) * Math.PI) : 0;
    fleshWash(g, seg(f, E.washFlesh, E.washFlesh + 28), f, glowP * 0.4);
    drawSection(g, secR, jit);
    g.restore();
    // skin / stone notes (leaders to the margin, removed parts)
    const notes = [[E.skinLabel, secOutline(2.2, 0.975), [150, 1050], 'SKIN', 'removed'], [E.stoneLabel, [STONE.x + 70, STONE.y + 18], [930, 1050], 'STONE', 'removed']];
    for (const [t0, from, to, a, b] of notes) {
      const lp = seg(f, t0, t0 + 10);
      if (lp <= 0) continue;
      g.save(); g.strokeStyle = 'rgba(233,227,205,0.75)'; g.lineWidth = 1; g.setLineDash([2, 5]);
      g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] - 10, lp)); g.stroke(); g.setLineDash([]);
      g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4, 0, 7); g.fill();
      const tl = seg(f, t0 + 6, t0 + 16);
      if (tl > 0) { text(g, a.slice(0, Math.ceil(a.length * tl)), to[0], to[1] + 18, '700 22px NText', INK, 'center', 4); text(g, tl >= 1 ? b : '', to[0], to[1] + 46, '600 21px NText', 'rgba(233,227,205,0.65)', 'center', 1); }
      g.restore();
    }
  }
  // --- B2 balance (Fig. 2), then flown to the top-left margin as the portion reference
  const bR = seg(f, E.balance, E.balance + 34);
  if (bR > 0) {
    const fly = eio(seg(f, E.portionFly, E.portionFly + 22));
    const bx = lerp(540, 172, fly), by = lerp(1290, 676, fly) - Math.sin(Math.PI * fly) * 60, bs = Math.exp(lerp(Math.log(1), Math.log(0.3), fly));
    const tilt = f < E.balanceLevel ? 9 * (1 - seg(f, E.balance + 10, E.balanceLevel)) : 3 * Math.exp(-(f - E.balanceLevel) / 8) * Math.cos((f - E.balanceLevel) * 0.6);
    const glowP = f >= E.portionGlow ? Math.sin(seg(f, E.portionGlow, E.portionGlow + 40) * Math.PI) : 0;
    if (fly > 0.6) {
      g.save(); g.fillStyle = 'rgba(6,11,8,0.92)'; g.beginPath(); g.arc(bx, by + 20 * bs, 82, 0, 7); g.fill();
      if (glowP > 0) { g.fillStyle = `rgba(166,233,85,${0.2 * glowP})`; g.beginPath(); g.arc(bx, by + 20 * bs, 104, 0, 7); g.fill(); }
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(bx, by + 20 * bs, 82, 0, 7); g.stroke(); g.lineWidth = 1; g.beginPath(); g.arc(bx, by + 20 * bs, 90, 0, 7); g.stroke(); g.restore();
    }
    drawBalance(g, bx, by, bs, bR, tilt, jit);
    const lab = seg(f, E.balanceLevel, E.balanceLevel + 12);
    if (lab > 0 && fly < 0.3) { g.save(); g.globalAlpha = lab * (1 - fly * 3); text(g, 'FIG. 2  100 g OF EDIBLE FLESH', 540, 1478, '700 20px NText', INK, 'center', 4); g.restore(); }
    if (fly >= 1) { text(g, 'FIG. 2', bx, by + 132 * 0.3 + 98, '700 15px NText', INK2, 'center', 3, 'fig'); text(g, '100 g', bx, by + 132 * 0.3 + 120, '700 19px NText', LIME, 'center', 1, 'fig'); }
  }
  // --- B3 magnification roundels
  FACTS.forEach((fact, i) => {
    const glow = f >= E.portionGlow + 30 ? Math.sin(seg(f, E.portionGlow + 30 + i * 6, E.portionGlow + 60 + i * 6) * Math.PI) : 0;
    drawRoundel(g, fact, i, f, jit, glow);
  });
  // --- B4 averages: bracket + legend cut under the roundels; small variation glyphs
  const av = seg(f, E.averages, E.averages + 16);
  if (av > 0) {
    burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, av, jit);
    const lg = seg(f, E.legend, E.legend + 26);
    const s1 = 'Database averages · USDA FoodData Central FDC 169910';
    if (lg > 0) text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1533, '600 19px NText', INK2, 'center', 1);
  }
  // credits + signature (end)
  const cr = seg(f, E.credits, E.credits + 24);
  if (cr > 0) {
    const s2 = 'del. et sculp. NutriAI';
    text(g, s2.slice(0, Math.ceil(s2.length * cr)), 1000, 1478, '600 16px NText', INK2, 'right', 1, 'fig');
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f30);
  const sg = seg(f, E.credits, E.credits + 20);
  if (sg > 0) { g.save(); g.globalAlpha = 0.85 * sg; g.drawImage(icon, 474, 1592, 30, 30); text(g, 'NutriAI', 512, 1616, '700 24px NText', MIST, 'left', 0, 'signature'); g.restore(); }
}

const args = process.argv.slice(2);
const si = args.indexOf('--still');
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (si >= 0) {
  for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); }
} else {
  const out = path.join(here, 'build', 'video-noaudio.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) {
    if (f % 2 === 0) draw(f);   // stop motion: odd frames hold the previous drawing
    if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(path.join(here, 'build', 'textlog.json'), JSON.stringify(TEXT_LOG));
  console.log('done', out);
}
