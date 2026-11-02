// NutriAI production 30 s #02: "What is inside 100 grams of guava?". Copperplate-engraving plate on IVORY with deep ink,
// coral guava flesh and clear leaf-green washes (user feedback: higher contrast, larger cutaway). Original Canvas2D code;
// art direction only from lemo-opuscar styles/engraving/STYLE.md. Stop motion: 15 drawings/s, each held 2 frames.
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
// ---------------- whole guava (analytic body, vertical axis; stem on top, calyx crown below)
const G = { x: 540, y: 905, A: 228, B: 252, C: 220 };
const Lv = (() => { const v = [-0.55, 0.6, 0.58]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
function gbody(u, v, cx = G.x, cy = G.y, sc = 1) {
  const r = Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.17 * Math.max(0, u) ** 1.5) * (1 + 0.04 * Math.sin(3 * v));
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
function drawWholeGuava(g, cx, cy, sc, f, jit, reveal = 1, wash = 1, opts = {}) {
  const sil = gsil(cx, cy, sc);
  if (sc < 0.3) { g.save(); g.fillStyle = PAPER; g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill(); g.restore(); }   // small figures occlude what is behind
  if (wash > 0) {  // skin wash: clear leaf green to yellow-green, laid under the ink
    g.save(); g.beginPath(); sil.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.clip();
    const ox = cx - 110 * sc, oy = cy - 120 * sc, R = 640 * sc * eo(wash);
    g.beginPath(); for (let k = 0; k <= 64; k++) { const th = (k / 64) * Math.PI * 2, rr = R * (1 + 0.06 * vnoise(th * 3 + 1)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.85;
    const lg = g.createRadialGradient(cx - 80 * sc, cy - 90 * sc, 10, cx, cy, 300 * sc);
    lg.addColorStop(0, opts.c0 || '#D9E58A'); lg.addColorStop(0.55, opts.c1 || '#A9CF55'); lg.addColorStop(1, opts.c2 || '#6FA83C');
    g.fillStyle = lg; g.fillRect(-4 * W, -4 * H, 8 * W, 8 * H); g.restore();   // cover any local transform
  }
  burin(g, sil, 3.4 * Math.max(0.5, sc), INK, seg(reveal, 0, 0.3), jit, (j) => sil[j].tone);
  const fam = (k, w, a0, a1, alpha) => GF[k].forEach((run, i) => { const r = clamp(seg(reveal, a0, a1) * 1.5 - (i % 10) * 0.05); if (r > 0) { const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, w * Math.max(0.5, sc), `rgba(22,32,26,${alpha})`, r, jit, (j) => pts[j].tone); } });
  if (sc >= 0.3) { fam(1, 1.4, 0.12, 0.6, 0.85); fam(2, 1.1, 0.35, 0.8, 0.75); fam(3, 0.85, 0.55, 1.0, 0.6); }
  else GF[1].forEach((run, i) => { if (i % 3) return; const pts = run.map(([u, v]) => gbody(u, v, cx, cy, sc)); burin(g, pts, 0.9, 'rgba(22,32,26,0.55)', seg(reveal, 0.12, 0.6), jit, (j) => pts[j].tone); });   // small figures: lighter hatch so the wash reads
  // calyx crown at the blossom end + stem
  const cb = gbody(-0.99, Math.PI / 2, cx, cy, sc);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42; burin(g, [[cb.x, cb.y - 4 * sc], [cb.x + Math.cos(a) * 26 * sc, cb.y - 4 * sc - Math.sin(a) * 18 * sc]], 2.2 * Math.max(0.5, sc), INK, seg(reveal, 0.5, 0.8), jit); }
  const st = gbody(0.99, Math.PI / 2, cx, cy, sc);
  burin(g, [[st.x, st.y + 6 * sc], [st.x + 3 * sc, st.y - 14 * sc], [st.x + 10 * sc, st.y - 30 * sc]], 3.4 * Math.max(0.5, sc), INK, seg(reveal, 0.3, 0.6), jit);
  return st;
}
function drawLeaf(g, bx, by, reveal, jit, washA, ang = 0.5, len = 168, wid = 54) {
  const P = (t, side) => { const x = t * len, y = side * wid * Math.sin(Math.PI * Math.pow(t, 0.85)) * (1 - 0.15 * t); return [bx + x * Math.cos(ang) - y * Math.sin(ang), by + x * Math.sin(ang) + y * Math.cos(ang)]; };
  const e1 = [], e2 = [], mid = []; for (let k = 0; k <= 40; k++) { const t = k / 40; e1.push(P(t, 1)); e2.push(P(t, -1)); mid.push(P(t, 0)); }
  if (washA > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9 * washA; g.fillStyle = LEAF; g.beginPath(); e1.concat(e2.slice().reverse()).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore(); }
  burin(g, e1, 2.4, INK, reveal * 1.4, jit); burin(g, e2, 2.8, INK, reveal * 1.4, jit); burin(g, mid, 1.8, INK, reveal * 1.2, jit);
  for (let i = 1; i < 9; i++) { const t0 = i / 10, r = clamp(reveal * 1.6 - 0.5 - i * 0.05); if (r <= 0) continue; const a = P(t0, 0); burin(g, [a, P(Math.min(1, t0 + 0.12), 0.85)], 1.1, INK2, r, jit); burin(g, [a, P(Math.min(1, t0 + 0.12), -0.85)], 1.3, INK2, r, jit); }
}
// ---------------- cutaway (large): skin band, outer flesh ring, coral seed pulp with seeds
const S = { x: 540, y: 935, R: 300 };
const secR = (th) => S.R * (1 - 0.085 * Math.max(0, -Math.sin(th)) ** 1.4) * (1 + 0.012 * Math.sin(5 * th));
const secPt = (th, k) => [S.x + Math.cos(th) * secR(th) * k, S.y + Math.sin(th) * secR(th) * k];
const secTone = (x, y) => { const dx = (x - S.x) / S.R, dy = (y - S.y) / S.R; return clamp(0.12 + 0.5 * (dx * 0.6 + dy * 0.7) * 0.9 + 0.45 * Math.pow(Math.hypot(dx, dy), 3)); };
const PULP = 0.6;
const SEEDS = (() => { const r = rng(17), s = []; for (let i = 0; i < 400 && s.length < 70; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.54; const [x, y] = secPt(a, d); if (s.every((q) => Math.hypot(q[0] - x, q[1] - y) > 26)) s.push([x, y, r() * Math.PI]); } return s; })();
function secPath(g, k) { g.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = secPt((i / 200) * Math.PI * 2, k); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }
function sectionWash(g, a, pulse = 0) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'multiply';
  const ring = (k0, k1) => { g.beginPath(); for (let i = 0; i <= 200; i++) { const [x, y] = secPt((i / 200) * Math.PI * 2, k0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); if (k1 > 0) { for (let i = 200; i >= 0; i--) { const [x, y] = secPt((i / 200) * Math.PI * 2, k1); g.lineTo(x, y); } g.closePath(); } };
  const bloom = (k, col, alpha, ox, oy, kIn = 0) => {
    g.save(); ring(k, kIn); g.clip('evenodd');
    const R = 720 * eo(a); g.beginPath(); for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2, rr = R * (1 + 0.07 * vnoise(th * 3 + ox)); g.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); } g.closePath(); g.clip();
    g.globalAlpha = alpha; g.fillStyle = col; g.fillRect(0, 0, W, H); g.restore();
  };
  bloom(1.0, '#7DC043', 0.95, S.x - 150, S.y - 160, 0.965);       // skin band only: clear leaf green
  bloom(0.965, '#F9B6A3', 0.95 + 0.05 * pulse, S.x - 120, S.y - 100, PULP);   // outer flesh ring: light coral
  bloom(PULP, '#F0705B', 0.9 + 0.1 * pulse, S.x - 60, S.y - 60);  // seed pulp: bright guava coral
  g.restore();
  // seeds stay cream (paper back)
  g.save(); g.fillStyle = '#FBF3DD'; for (const [x, y, r] of SEEDS) { g.beginPath(); g.ellipse(x, y, 9, 6, r, 0, Math.PI * 2); g.fill(); } g.restore();
}
const SEC_CONT = []; for (let k = 0.95; k > PULP + 0.02; k -= 0.028) { const p = []; for (let i = 0; i <= 220; i++) p.push(secPt(-0.5 + (i / 220) * Math.PI * 2, k)); SEC_CONT.push(p); }
const PULP_STROKES = (() => { const r = rng(5), out = []; for (let i = 0; i < 260; i++) { const a = r() * Math.PI * 2, d = 0.06 + r() * 0.5; const [x, y] = secPt(a, d); if (SEEDS.some((q) => Math.hypot(q[0] - x, q[1] - y) < 14)) continue; const ta = a + Math.PI / 2 + (r() - 0.5) * 0.6, L = 8 + r() * 12; out.push([[x - Math.cos(ta) * L, y - Math.sin(ta) * L], [x + Math.cos(ta) * L, y + Math.sin(ta) * L]]); } return out; })();
function drawSection(g, r, jit) {
  const p = []; for (let i = 0; i <= 300; i++) p.push(secPt(-0.5 + (i / 300) * Math.PI * 2, 1));
  burin(g, p, 3.8, INK, seg(r, 0, 0.2), jit);
  const sk = seg(r, 0.1, 0.4); for (let i = 0; i < 220 * sk; i++) { const th = (i / 220) * Math.PI * 2; const a = secPt(th, 1), b = secPt(th, 0.965); g.strokeStyle = INK; g.lineWidth = secTone(a[0], a[1]) > 0.35 ? 1.4 : 0.8; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const ip = []; for (let i = 0; i <= 240; i++) ip.push(secPt((i / 240) * Math.PI * 2, 0.965)); burin(g, ip, 1.8, INK, seg(r, 0.15, 0.4), jit);
  const kc = seg(r, 0.2, 0.7); SEC_CONT.forEach((c, i) => { const q = clamp(kc * SEC_CONT.length - i); if (q > 0) burin(g, c, 1.25, 'rgba(22,32,26,0.78)', q, jit, (j) => secTone(c[j][0], c[j][1])); });
  const pp = []; for (let i = 0; i <= 240; i++) pp.push(secPt((i / 240) * Math.PI * 2, PULP)); burin(g, pp, 2.2, INK, seg(r, 0.35, 0.6), jit);
  const ps = seg(r, 0.45, 0.85); PULP_STROKES.forEach((s, i) => { if (i / PULP_STROKES.length < ps) burin(g, s, 1.0, 'rgba(22,32,26,0.55)', 1, jit); });
  const sd = seg(r, 0.55, 1.0); SEEDS.forEach(([x, y, a], i) => { if (i / SEEDS.length > sd) return; g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 0.8; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-5, k * 2.6 + 1); g.lineTo(5, k * 2.6 - 1); g.stroke(); } g.restore(); });
}
// ---------------- roundels
const SLOTS = [[250, 1362], [540, 1362], [830, 1362]], RR = 112;
const FACTS = [
  { ev: 'kcal', big: '68', unit: 'kcal', name: 'ENERGY', motif: 'rays', from: secPt(3.6, 0.8) },
  { ev: 'fibre', big: '5.4 g', unit: '', name: 'FIBRE', motif: 'fibres', from: secPt(1.9, 0.75) },
  { ev: 'vitc', big: '228 mg', unit: '', name: 'VITAMIN C', motif: 'stipple', from: secPt(0.4, 0.4) },
];
function motif(g, kind, r, f, jit, act) {
  const R = RR - 10;
  if (kind === 'rays') for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; burin(g, [[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95]], 1.1, 'rgba(22,32,26,0.28)', r, jit); }
  if (kind === 'fibres') { const ph = act * 4 + f * 0.04 * (0.3 + act); for (let i = -5; i <= 5; i++) { const p = []; for (let k = 0; k <= 32; k++) { const t = -1 + 2 * (k / 32); const x = t * R * 0.95, y = i * 15 + Math.sin(t * 4 + i + ph * 2.2) * (6 + 4 * act); if (Math.hypot(x, y) < R * 0.94) p.push([x, y]); } if (p.length > 3) burin(g, p, 1.3, `rgba(47,122,28,${0.45 + 0.35 * act})`, r, jit); } }
  if (kind === 'stipple') {  // dots gather into a three-strand helix: "helps the body make collagen"
    const q = rng(9); g.fillStyle = 'rgba(214,92,40,0.9)';
    for (let i = 0; i < 90; i++) {
      const a = q() * Math.PI * 2, d = Math.sqrt(q()) * R * 0.85; const sx = Math.cos(a) * d, sy = Math.sin(a) * d;
      const s = i % 3, t = -1 + 2 * ((i / 3 | 0) / 29); const hx = t * R * 0.8, hy = Math.sin(t * 7 + s * 2.09) * 22;
      const k = eio(act); const x = lerp(sx, hx, k), y = lerp(sy, hy, k);
      if (i / 90 < r) { g.beginPath(); g.arc(x, y, 2.2 + 1.2 * act, 0, 7); g.fill(); }
    }
  }
}
function drawRoundel(g, fact, i, f, jit, act, out) {
  const t0 = E[fact.ev], p = seg(f, t0 - 4, t0 + 14); if (p <= 0 || out >= 1) return;
  const [sx, sy0] = SLOTS[i], sy = sy0 - 34 * eio(act);
  const k = eo(p); const x = lerp(fact.from[0], sx, k), y = lerp(fact.from[1], sy, k) - Math.sin(Math.PI * k) * 60;
  const sc = Math.exp(Math.log(0.25) * (1 - k)) * (1 + 0.32 * eio(act));
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
    const yv = fact.unit ? 2 : 12 + (fact.motif === 'stipple' ? -16 * eio(act) : 0);
    text(g, shown, 0, yv, '900 56px NDisplay', INK, 'center', 0, 'roundel');
    if (fact.unit && lt >= 1) text(g, fact.unit, 0, 36, '700 24px NText', LEAFDARK, 'center', 2, 'roundel');
    if (lt >= 1) text(g, fact.name, 0, fact.unit ? 66 : 50 + (fact.motif === 'stipple' ? 20 * eio(act) : 0), '700 17px NText', INK2, 'center', 3, 'roundel');
  }
  if (p >= 1) text(g, `FIG. ${i + 2}`, 0, -RR - 16, '700 15px NText', INK2, 'center', 3, 'fig');
  g.restore();
}
// ---------------- balance (takeaway): one whole fruit (USDA: 55 g edible) vs a 100 g weight
function drawBalance(g, cx, cy, sc, r, tiltDeg, f, jit, fruitIn) {
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
  // right pan: 100 g weight
  const [rx, ry0] = pans[1], ry = ry0 + 70, wq = q(0.45, 0.75);
  if (wq > 0) { burin(g, [[rx - 36, ry - 4], [rx - 36, ry - 76], [rx + 36, ry - 76], [rx + 36, ry - 4]], 2.6, INK, wq, jit); burin(g, [[rx - 13, ry - 76], [rx - 13, ry - 92], [rx + 13, ry - 92], [rx + 13, ry - 76]], 2.2, INK, wq, jit); for (let k = 1; k < 7; k++) burin(g, [[rx + 36 - k * 5, ry - 72], [rx + 36 - k * 5, ry - 8]], 0.7, INK2, wq, jit); g.save(); g.globalAlpha = wq; text(g, '100 g', rx, ry - 32, '700 21px NText', INK, 'center', 1, 'fig'); g.restore(); }
  // left pan: one whole guava dropped in
  if (fruitIn > 0) { const [lx, ly0] = pans[0]; const fy = ly0 + 70 - 50 - (1 - eo(fruitIn)) * 260; g.restore(); g.save(); g.translate(cx, cy); g.scale(sc, sc); drawWholeGuava(g, lx, fy, 0.2, f, jit, 1, 1, { c0: '#CFE57A', c1: '#8CC54A', c2: '#5AA83A' }); }
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
  if (tt > 0) { const t1 = 'PLATE II', t2 = 'GUAVA · RAW FLESH & SEEDS'; text(g, t1.slice(0, Math.ceil(t1.length * tt)), 540, 590, '700 19px NText', INK2, 'center', 8); text(g, t2.slice(0, Math.ceil(t2.length * tt)), 540, 624, '700 27px NText', INK, 'center', 5); }
  // --- hook: whole guava; then burnished out while the large cutaway is re-cut
  const burn = seg(f, E.burnish, E.burnish + 22), sweepX = lerp(G.x - G.A - 40, G.x + G.A + 60, burn);
  let stem = null;
  if (burn < 1) {
    g.save(); if (burn > 0) { g.beginPath(); g.rect(sweepX, 0, W, H); g.clip(); }
    stem = drawWholeGuava(g, G.x, G.y, 1, f, jit, seg(f, 0, 64), seg(f, E.washWhole, E.washWhole + 26));
    g.restore();
    const ct = seg(f, E.cut, E.cut + 10);
    if (ct > 0 && burn < 0.7) { const p = []; for (let k = 0; k <= 60; k++) p.push(gbody(-0.98 + 1.96 * (k / 60), Math.PI / 2)); burin(g, p, 3.8, '#D6452B', ct, jit); }
    if (burn > 0) { g.save(); g.strokeStyle = 'rgba(22,32,26,0.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(sweepX, G.y - 290); g.lineTo(sweepX, G.y + 290); g.stroke(); g.restore(); }
  }
  const leafBase = [S.x + 4, S.y - secR(-Math.PI / 2) - 8];
  const sr = seg(f, E.section, E.section + 54);
  if (sr > 0) {
    g.save(); if (burn < 1) { g.beginPath(); g.rect(0, 0, sweepX, H); g.clip(); }
    const pulse = f >= E.food ? Math.sin(seg(f, E.food, E.food + 40) * Math.PI) : 0;
    sectionWash(g, seg(f, E.washSection, E.washSection + 22), pulse);
    drawSection(g, sr, jit);
    burin(g, [[leafBase[0], leafBase[1] + 10], [leafBase[0] + 3, leafBase[1] - 8], [leafBase[0] + 9, leafBase[1] - 22]], 3.4, INK, sr * 2, jit);
    g.restore();
    // skin vs flesh notes: USDA counts the skin as refuse; flesh + seeds are the 100 g
    const notes = [[E.skinLabel, secPt(3.0, 0.985), [158, 1010], ['SKIN', 'trimmed'], 'refuse in USDA'], [E.fleshLabel, secPt(-0.15, 0.8), [924, 1010], ['FLESH', '+ SEEDS'], 'the 100 g']];
    for (const [t0, from, to, a, b] of notes) {
      const lp = seg(f, t0, t0 + 10); if (lp <= 0) continue;
      const fade = 1 - seg(f, E.variation - 6, E.variation + 4);
      g.save(); g.globalAlpha = fade; g.strokeStyle = INK2; g.lineWidth = 1.1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(lerp(from[0], to[0], lp), lerp(from[1], to[1] - 40, lp)); g.stroke(); g.setLineDash([]);
      g.fillStyle = INK; g.beginPath(); g.arc(from[0], from[1], 4.5, 0, 7); g.fill();
      const tl = seg(f, t0 + 6, t0 + 16);
      if (tl > 0) { text(g, a[0].slice(0, Math.ceil(a[0].length * tl)), to[0], to[1] - 14, '700 22px NText', INK, 'center', 3); if (tl >= 1) { text(g, a[1], to[0], to[1] + 14, '700 22px NText', INK, 'center', 3); text(g, b, to[0], to[1] + 42, '600 18px NText', LEAFDARK, 'center', 0); } }
      g.restore();
    }
  }
  drawLeaf(g, (stem && burn < 1 ? stem.x : leafBase[0]) + 12, (stem && burn < 1 ? stem.y : leafBase[1]) - 4, seg(f, E.leaf, E.leaf + 36), jit, seg(f, E.washWhole + 6, E.washWhole + 30), 0.66);
  // --- facts (roundels); mechanism: fibre strands flow, vitamin C stipple gathers into a collagen-like helix
  const out = seg(f, E.roundelsOut, E.roundelsOut + 12);
  const actF = seg(f, E.digest, E.digest + 14) * (1 - seg(f, E.collagen - 6, E.collagen + 6));
  const actC = seg(f, E.collagen, E.collagen + 26) * (1 - seg(f, E.variation - 10, E.variation));
  FACTS.forEach((fa, i) => drawRoundel(g, fa, i, f, jit, i === 1 ? actF : i === 2 ? actC : 0, out));
  // --- reference values: three engraved fruits of different size / type (top-right margin) + legend
  const vr = seg(f, E.variation, E.variation + 14), vOut = seg(f, E.roundelsOut, E.roundelsOut + 10);
  if (vr > 0 && vOut < 1) {
    g.save(); g.globalAlpha = 1 - vOut;
    const spec = [[848, 720, 0.16, {}], [928, 716, 0.21, {}], [893, 800, 0.13, { c0: '#F2A08C', c1: '#D9533F', c2: '#A23224' }]];
    spec.forEach(([x, y, s, o], j) => { const q = seg(f, E.variation + j * 8, E.variation + 18 + j * 8); if (q > 0) drawWholeGuava(g, x, y, s, f, jit, q, j === 2 ? seg(f, E.types, E.types + 16) : q, o); });
    if (f >= E.types) text(g, 'types & fruits vary', 890, 870, '600 17px NText', INK2, 'center', 1, 'fig');
    g.restore();
  }
  const lg = seg(f, E.legend, E.legend + 30);
  if (lg > 0) { burin(g, [[150, 1494], [150, 1503], [930, 1503], [930, 1494]], 1.4, INK2, lg, jit); const s1 = 'Reference values · USDA FoodData Central FDC 173044'; text(g, s1.slice(0, Math.ceil(s1.length * lg)), 540, 1532, '600 19px NText', INK2, 'center', 1); }
  // --- takeaway: one fruit on the balance vs 100 g
  const br = seg(f, E.balance, E.balance + 30);
  if (br > 0) {
    const tilt = f < E.tip ? 0 : -9 * (1 - Math.exp(-(f - E.tip) / 6) * Math.cos((f - E.tip) * 0.5));
    drawBalance(g, 540, 1330, 0.86, br, tilt, f, jit, seg(f, E.fruitDrop - 8, E.fruitDrop));
    const l5 = seg(f, E.label55, E.label55 + 14);
    if (l5 > 0) { g.save(); g.globalAlpha = l5; text(g, '1 fruit ≈ 55 g edible (USDA)', 258, 1430, '700 19px NText', INK, 'center', 1, 'fig'); text(g, 'less than 100 g', 832, 1430, '700 19px NText', LEAFDARK, 'center', 1, 'fig'); g.restore(); }
  }
  const cr = seg(f, E.credits, E.credits + 22); if (cr > 0) { const s2 = 'del. et sculp. NutriAI'; text(g, s2.slice(0, Math.ceil(s2.length * cr)), 996, 1482, '600 15px NText', INK2, 'right', 1, 'fig'); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(g, f30);
  const sg = seg(f, E.credits, E.credits + 20); if (sg > 0) { g.save(); g.globalAlpha = 0.9 * sg; g.drawImage(icon, 474, 1592, 30, 30); text(g, 'NutriAI', 512, 1616, '700 24px NText', INK, 'left', 0, 'signature'); g.restore(); }
}
const args = process.argv.slice(2), si = args.indexOf('--still');
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (si >= 0) { for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); } }
else {
  const out = path.join(here, 'build', 'video-noaudio.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { if (f % 2 === 0) draw(f); if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(path.join(here, 'build', 'textlog.json'), JSON.stringify(TEXT_LOG)); console.log('done', out);
}
