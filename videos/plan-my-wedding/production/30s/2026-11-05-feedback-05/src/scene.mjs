// Hindi episode: outdoor-venue rain backup checklist (बारिश का बैकअप प्लान).
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); scene grammar,
// Devanagari fonts, folded captions, crane and end card from production/30s/2026-11-04-hindi-04 (@092f839).
// New mechanisms: paper rain that stops under every roof added, chairs moving into a covered hall,
// a cable lifted out of a puddle under a covered board, a covered walkway with mats, signed vendor terms,
// a decision clock with a plan switch. Venue is fictional; no rates, laws or DIY electrical steps.
import { loadImage, GlobalFonts } from '@napi-rs/canvas';
import nodePath from 'node:path';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, person, pillar, canopy, check } from './models.mjs';
import { T } from './cues.mjs';

const FD = nodePath.resolve('node_modules/@expo-google-fonts');
GlobalFonts.registerFromPath(nodePath.join(FD, 'noto-serif-devanagari/700Bold/NotoSerifDevanagari_700Bold.ttf'), 'NSD');
GlobalFonts.registerFromPath(nodePath.join(FD, 'hind/600SemiBold/Hind_600SemiBold.ttf'), 'HindSB');
GlobalFonts.registerFromPath(nodePath.join(FD, 'hind/700Bold/Hind_700Bold.ttf'), 'HindB');
const HF = { serif: (px) => `${px}px NSD`, sans: (px) => `${px}px HindSB`, bold: (px) => `${px}px HindB` };

const FLOOR = 1640;
const grain = makeGrain(5);
let icon = null;
export async function init() { icon = await loadImage('assets/app-icon-play.png'); }
const rise = (t, t0, dur = 0.32) => (t < t0 ? 0 : t < t0 + dur ? ease.back(prog(t, t0, t0 + dur), 2.2) : 1);
const fold = (t, t0, x = 540) => 1 - seg(t, t0 + (x / W) * 0.2, t0 + (x / W) * 0.2 + 0.28, ease.in);

// ---------------------------------------------------------------- backdrop (accepted)
const WALL = (() => {
  const r = rng(11), pts = [];
  const cols = 5, rows = 6;
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pts.push([(-200 + i * (1480 / cols)) + (i % cols ? (r() - 0.5) * 120 : 0), -300 + j * (2000 / rows) + (j % rows ? (r() - 0.5) * 120 : 0)]);
  const tris = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = pts[j * (cols + 1) + i], b = pts[j * (cols + 1) + i + 1], c = pts[(j + 1) * (cols + 1) + i], d = pts[(j + 1) * (cols + 1) + i + 1];
    tris.push({ pts: [a, b, d], c: P.blush, tone: 0.1 + (r() - 0.5) * 0.14 }, { pts: [a, d, c], c: P.blush, tone: -0.04 + (r() - 0.5) * 0.14 });
  }
  return tris;
})();
function backdrop(ctx, dim) {
  for (const f of WALL) { path(ctx, f.pts); ctx.fillStyle = shade(f.c, f.tone - 0.12 * dim); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,250,244,0.35)'; ctx.lineWidth = 2;
  for (const f of WALL) { path(ctx, f.pts); ctx.stroke(); }
  facets(ctx, [
    { pts: [[-40, FLOOR], [540, FLOOR], [-40, 2000]], c: P.cream, tone: 0.08 - 0.1 * dim },
    { pts: [[540, FLOOR], [1120, FLOOR], [1120, 2000], [-40, 2000]], c: P.cream, tone: -0.04 - 0.1 * dim },
    { pts: [[540, FLOOR], [1120, 1800], [1120, 2000]], c: P.creamDeep, tone: -0.1 * dim },
  ], { shadow: false, outline: false });
  ctx.strokeStyle = 'rgba(74,30,38,0.12)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-40, FLOOR); ctx.lineTo(1120, FLOOR); ctx.stroke();
}
function hTag(ctx, text, px = 34, col = P.ink, fill = P.cream) {
  ctx.font = HF.sans(px);
  const w = ctx.measureText(text).width + 40, h = px + 26;
  facets(ctx, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h / 2], [-w / 2, -h / 2]], c: fill, tone: -0.08 },
    { pts: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 - 6, -h], [-w / 2 + 6, -h]], c: fill, tone: 0.3 },
  ], { blur: 8, sx: 3, sy: 6 });
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, -h / 2 + 3);
  return w;
}
const tagAt = (ctx, x, y, u, text, px, col, fill) => { if (u <= 0.03) return 0; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); const w = hTag(ctx, text, px, col, fill); ctx.restore(); return w; };
const cross = (ctx, x, y, s) => { ctx.strokeStyle = P.rasp; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); };

// ---------------------------------------------------------------- props (from accepted episodes)
function chair(ctx, x, base, s, c = P.goldPale) {
  const p = (dx, dy) => [x + dx * s, base + dy * s];
  facets(ctx, [
    { pts: [p(-34, -150), p(-14, -150), p(-14, -70), p(-34, -70)], c, tone: 0.3 },
    { pts: [p(-34, -150), p(30, -150), p(30, -132), p(-34, -132)], c, tone: 0.42 },
    { pts: [p(-40, -70), p(40, -70), p(52, -82), p(-28, -82)], c, tone: 0.38 },
    { pts: [p(-40, -70), p(40, -70), p(40, -60), p(-40, -60)], c, tone: -0.1 },
    { pts: [p(-38, -60), p(-30, -60), p(-30, 0), p(-38, 0)], c, tone: 0.1 },
    { pts: [p(30, -60), p(38, -60), p(38, 0), p(30, 0)], c, tone: -0.25 },
  ], { blur: 10, sx: 4, sy: 8 });
}
function hall(g, w, h, c) {
  const col = (x) => facets(g, [
    { pts: [[x - 14, 0], [x, 0], [x, -h + 70], [x - 14, -h + 70]], c: P.cream, tone: 0.3 },
    { pts: [[x, 0], [x + 14, 0], [x + 14, -h + 70], [x, -h + 70]], c: P.cream, tone: -0.2 },
  ], { blur: 8, sx: 3, sy: 6 });
  facets(g, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h + 70], [-w / 2, -h + 70]], c, tone: 0.05 },
    { pts: [[-w / 2 - 20, -h + 70], [w / 2 + 20, -h + 70], [w / 2 + 20, -h + 40], [-w / 2 - 20, -h + 40]], c: P.gold, tone: 0.1 },
    { pts: [[-w / 2 - 30, -h + 40], [0, -h - 50], [0, -h + 40]], c: P.rasp, tone: 0.25 },
    { pts: [[0, -h - 50], [w / 2 + 30, -h + 40], [0, -h + 40]], c: P.rasp, tone: -0.2 },
  ], { blur: 18, sx: 7, sy: 12 });
  [-w * 0.34, w * 0.34].forEach(col);
  facets(g, [{ pts: [[-46, 0], [46, 0], [46, -130], [0, -162], [-46, -130]], c: P.raspDark, tone: 0.1 }], { shadow: false });
}

// ---------------------------------------------------------------- world: lawn, rain, covers
const HALL = { x: 800, w: 330, h: 400 };
const hallRoofY = (x) => FLOOR - HALL.h - 50 + Math.abs(x - HALL.x) * (90 / (HALL.w / 2 + 30));
const DROPS = (() => { const r = rng(31); return Array.from({ length: 80 }, () => ({ x: r() * 1100 - 10, ph: r(), v: 1100 + r() * 500, l: 44 + r() * 22 })); })();
function worldUp(t) { return fold(t, T.worldFold, 540); }
function covered(t, x, y) {
  if (t > T.hall + 0.3 && Math.abs(x - HALL.x) < HALL.w / 2 + 30 && y > hallRoofY(x)) return true;
  if (t > T.cover + 0.2 && t < T.boardFold + 0.4 && x > 70 && x < 250 && y > 1350) return true; // hood stays dry while it folds away
  const wu = seg(t, T.walk, T.walk + 0.5, ease.out);
  if (wu > 0 && t < T.worldFold && x > 70 && x < 70 + 650 * wu && y > 1372) return true;
  return false;
}
function rain(ctx, t) {
  if (t < T.rain) return;
  const a = Math.min(1, (t - T.rain) / 0.3) * worldUp(t);
  if (a <= 0.02) return;
  ctx.save(); ctx.globalAlpha = a;
  for (const d of DROPS) {
    const span = FLOOR - 820;
    const y = 820 + ((d.ph * span + t * d.v) % span);
    if (covered(t, d.x, y)) {
      // splash on the roof instead
      continue;
    }
    facets(ctx, [
      { pts: [[d.x, y - d.l], [d.x + 7, y - d.l * 0.25], [d.x, y]], c: P.cream, tone: 0.2 },
      { pts: [[d.x, y - d.l], [d.x, y], [d.x - 7, y - d.l * 0.25]], c: '#9E7F88', tone: 0 },
    ], { shadow: false, outline: false });
  }
  ctx.restore();
}
function cloud(ctx, t) {
  const u = worldUp(t);
  if (u <= 0.02) return;
  const blob = (cx, cy, s, k) => {
    const lobes = [[-1.1, 0.2, 0.75], [-0.4, -0.35, 0.95], [0.45, -0.2, 0.85], [1.15, 0.25, 0.65], [0, 0.35, 1.0]];
    const list = [];
    lobes.forEach(([dx, dy, r], i) => {
      for (let q = 0; q < 6; q++) {
        const a0 = (q / 6) * TAU, a1 = ((q + 1) / 6) * TAU;
        const ox = cx + dx * s, oy = cy + dy * s, rr = r * s;
        list.push({ pts: [[ox, oy], [ox + Math.cos(a0) * rr, oy + Math.sin(a0) * rr * 0.8], [ox + Math.cos(a1) * rr, oy + Math.sin(a1) * rr * 0.8]], c: k ? P.blushDeep : '#C9AEB0', tone: Math.cos((a0 + a1) / 2 + 2.2) * 0.32 - 0.05 * i });
      }
    });
    facets(ctx, list, { blur: 20, sx: 6, sy: 12 });
  };
  const x1 = lerp(900, 640, seg(t, T.cloud, T.cloud + 0.6, ease.out)), x2 = lerp(-120, 260, seg(t, 0.1, 0.9, ease.out));
  ctx.save(); ctx.translate(0, 760); ctx.scale(1, u); ctx.translate(0, -760);
  blob(x2, 735, 95, 1); blob(x1, 760, 120, 0);
  ctx.restore();
}
function puddles(ctx, t) {
  const u = seg(t, 0.8, 2.6, ease.out) * worldUp(t);
  if (u <= 0.02) return;
  [[230, 120], [430, 150], [620, 90]].forEach(([x, w]) => {
    const ww = w * u;
    ctx.fillStyle = shade(P.blushDeep, -0.15); ctx.beginPath(); ctx.ellipse(x, FLOOR + 14, ww, ww * 0.18, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,244,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x - ww * 0.2, FLOOR + 10, ww * 0.4, ww * 0.06, 0, 0, TAU); ctx.stroke();
  });
}

// ---------------------------------------------------------------- S1: open lawn, then "backup plan"
const LAWN_CHAIRS = [150, 250, 350, 450, 550, 650];
function lawn(ctx, t) {
  const f = fold(t, T.lawnFold + 1.8, 330);
  if (f <= 0.02) return;
  popup(ctx, 0, FLOOR, rise(t, T.lawnSet, 0.3) * f, (g) => { pillar(g, 200, 330, 50); pillar(g, 520, 330, 50); });
  canopy(ctx, 170, 550, FLOOR - 352, 56, seg(t, 0.1, 0.5, ease.out) * f, 8);
  // chairs: rain-darkened on the lawn, then carried into the covered hall
  LAWN_CHAIRS.forEach((x, i) => {
    const t0 = T.chairsGo + i * 0.08;
    const v = seg(t, t0, t0 + 0.45, ease.inOut);
    if (v >= 1) return;
    const tx = HALL.x - 60 + (i % 3) * 60, ty = FLOOR - 20;
    const cx = lerp(x, tx, v), base = lerp(FLOOR, ty, v) - Math.sin(v * Math.PI) * 160;
    const wet = seg(t, 0.8, 2.5);
    chair(ctx, cx, base, lerp(0.75, 0.3, v) * rise(t, 0.15 + i * 0.05, 0.3), wet > 0.5 ? '#C8AF91' : P.goldPale); // rain-darkened paper
  });
  // fictional venue sign
  const su = rise(t, 0.4, 0.3) * fold(t, T.umbrella - 0.25, 860);
  if (su > 0.03) {
    ctx.save(); ctx.translate(880, FLOOR); ctx.scale(1, su);
    facets(ctx, [{ pts: [[-6, 0], [6, 0], [6, -230], [-6, -230]], c: P.goldDark, tone: 0 }], { blur: 6, sx: 2, sy: 4 });
    ctx.restore();
    tagAt(ctx, 880, FLOOR - 230, su, 'चमेली बाग़', 40, P.ink, P.cream);
    tagAt(ctx, 880, FLOOR - 160, su, 'काल्पनिक जगह', 28, P.cream, P.rasp);
  }
}
function umbrella(ctx, t) {
  const u = rise(t, T.umbrella, 0.3) * fold(t, T.crane1, 540);
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(780, 1150); ctx.scale(u, u);
  const list = [];
  for (let i = 0; i < 6; i++) {
    const a0 = Math.PI + (i / 6) * Math.PI, a1 = Math.PI + ((i + 1) / 6) * Math.PI;
    list.push({ pts: [[0, -190], [Math.cos(a0) * 230, -10 + Math.sin(a0) * 40], [Math.cos(a1) * 230, -10 + Math.sin(a1) * 40]], c: P.rasp, tone: i % 2 ? -0.18 : 0.2 });
  }
  facets(ctx, list, { blur: 18, sx: 6, sy: 12 });
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 150); ctx.arc(-22, 150, 22, 0, Math.PI); ctx.stroke();
  ctx.restore();
  tagAt(ctx, 780, 1400, u, 'बैकअप प्लान', 46, P.cream, P.ink);
}

// ---------------------------------------------------------------- S2: covered hall
function hallScene(ctx, t) {
  const u = rise(t, T.hall, 0.36) * worldUp(t);
  if (u <= 0.02) return;
  popup(ctx, HALL.x, FLOOR, u, (g) => hall(g, HALL.w, HALL.h, P.goldPale));
  // chairs now inside
  if (t > T.chairsGo + 0.5) {
    ctx.save(); ctx.translate(0, FLOOR); ctx.scale(1, worldUp(t)); ctx.translate(0, -FLOOR);
    for (let i = 0; i < 6; i++) chair(ctx, HALL.x - 100 + (i % 3) * 100, FLOOR - (i < 3 ? 120 : 10), 0.42, P.goldLight);
    ctx.restore();
  }
  const ok = rise(t, T.hallOk, 0.25) * fold(t, T.boardFold, 800);
  if (ok > 0.03) { const w = tagAt(ctx, HALL.x, FLOOR - HALL.h - 80, ok, 'सबके लिए छत', 36, P.cream, P.rasp); check(ctx, HALL.x + w / 2 + 26 * ok, FLOOR - HALL.h - 108, 22 * ok); }
}

// ---------------------------------------------------------------- S3: power board, electrician, cable out of water
function power(ctx, t) {
  if (t < T.board - 0.05) return;
  const f = fold(t, T.boardFold, 300);
  if (f <= 0.02) return;
  const bu = rise(t, T.board, 0.32) * f;
  // cable: on the wet ground through a puddle, then lifted over a post onto the hall wall
  const lift = seg(t, T.lift, T.lift + 0.35, ease.inOut);
  const start = [215, 1500], end = [HALL.x - HALL.w / 2, 1470];
  const ground = [[200, 1630], [430, 1634], [end[0] - 10, 1632]];
  const raised = [[300, 1460], [430, 1440], [end[0] - 10, 1460]];
  const pts = [start, ...ground.map((p, i) => [lerp(p[0], raised[i][0], lift), lerp(p[1], raised[i][1], lift)]), end];
  if (bu > 0.3) {
    ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]); ctx.stroke();
    // post with hook appears for the lift
    const pu = seg(t, T.lift - 0.2, T.lift, ease.out) * f;
    if (pu > 0.02) popup(ctx, 430, FLOOR, pu, (g) => facets(g, [{ pts: [[-7, 0], [7, 0], [7, -205], [-7, -205]], c: P.goldDark, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 }));
    if (t < T.lift) cross(ctx, 430, 1580, 22 * rise(t, T.board + 0.5, 0.25));
    else check(ctx, 432, 1385, 26 * rise(t, T.lift + 0.3, 0.2));
  }
  // board on a stand, then a hinged rain hood closes over it
  popup(ctx, 150, FLOOR, bu, (g) => {
    facets(g, [{ pts: [[-50, 0], [-40, 0], [-40, -120], [-50, -120]], c: P.goldDark, tone: 0 }, { pts: [[40, 0], [50, 0], [50, -120], [40, -120]], c: P.goldDark, tone: -0.2 }], { blur: 6, sx: 2, sy: 4 });
    facets(g, [
      { pts: [[-70, -120], [70, -120], [70, -280], [-70, -280]], c: P.cream, tone: 0.1 },
      { pts: [[70, -120], [86, -132], [86, -292], [70, -280]], c: P.cream, tone: -0.3 },
    ], { blur: 14, sx: 5, sy: 10 });
    g.strokeStyle = P.gold; g.lineWidth = 9; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(8, -250); g.lineTo(-14, -200); g.lineTo(10, -200); g.lineTo(-10, -150); g.stroke();
  });
  const hood = seg(t, T.cover, T.cover + 0.3, ease.out) * f;
  if (hood > 0.02 && bu > 0.5) {
    const hg = hinge([[60, 1350], [250, 1350], [240, 1520], [70, 1520]], [60, 1350], [250, 1350], (1 - hood) * Math.PI * 0.9);
    facets(ctx, [{ pts: hg.pts, c: hg.front ? P.rasp : P.raspDark, tone: hg.front ? 0.12 * hg.k : -0.1 }], { blur: 12, sx: 4, sy: 8 });
    facets(ctx, [{ pts: [[50, 1340], [260, 1340], [250, 1356], [60, 1356]], c: P.raspDark, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
  }
  // qualified electrician (no DIY)
  popup(ctx, 300, FLOOR, rise(t, T.sparky, 0.3) * f, (g) => {
    person(g, 0, 0, 250, 'B', { col: P.gold, look: -1 });
    facets(g, [{ pts: [[-34, -248], [34, -248], [26, -278], [0, -290], [-26, -278]], c: P.goldLight, tone: 0.25 }], { blur: 6, sx: 2, sy: 4 });
  });
  tagAt(ctx, 300, 1300, rise(t, T.sparky + 0.2, 0.25) * f, 'योग्य इलेक्ट्रीशियन', 32, P.cream, P.ink);
}

// ---------------------------------------------------------------- S4: covered walkway with anti-slip mats
function walkway(ctx, t) {
  if (t < T.walk - 0.05) return;
  const f = worldUp(t);
  if (f <= 0.02) return;
  const wu = seg(t, T.walk, T.walk + 0.5, ease.out) * f;
  const x0 = 70, x1 = HALL.x - HALL.w / 2 + 10;
  // mats folding down onto the path
  for (let i = 0; i < 5; i++) {
    const m = seg(t, T.mats + i * 0.1, T.mats + i * 0.1 + 0.2, ease.out) * f;
    if (m <= 0.03) continue;
    const a = x0 + i * (x1 - x0) / 5, b = a + (x1 - x0) / 5 - 8;
    const hg = hinge([[a, FLOOR - 4], [b, FLOOR - 4], [b, FLOOR + 22], [a, FLOOR + 22]], [a, FLOOR - 4], [b, FLOOR - 4], (1 - m) * Math.PI * 0.9);
    facets(ctx, [{ pts: hg.pts, c: P.rasp, tone: i % 2 ? -0.1 : 0.12 }], { blur: 4, sx: 2, sy: 3 });
    if (hg.k > 0.6) { ctx.strokeStyle = 'rgba(255,250,244,0.5)'; ctx.lineWidth = 2; for (let k = a + 12; k < b; k += 16) { ctx.beginPath(); ctx.moveTo(k, FLOOR); ctx.lineTo(k - 8, FLOOR + 18); ctx.stroke(); } }
  }
  // posts + pleated roof along the path
  [x0 + 10, (x0 + x1) / 2, x1 - 10].forEach((x, i) => { const pu = seg(t, T.walk + i * 0.1, T.walk + i * 0.1 + 0.25, ease.out) * f; if (pu > 0.02) popup(ctx, x, FLOOR, pu, (g) => facets(g, [{ pts: [[-6, 0], [6, 0], [6, -270], [-6, -270]], c: P.goldDark, tone: 0.05 }], { blur: 6, sx: 2, sy: 4 })); });
  canopy(ctx, x0 - 10, x0 - 10 + (x1 - x0 + 20) * Math.max(0.001, wu), FLOOR - 286, 44, wu > 0 ? 1 : 0, 9);
  tagAt(ctx, (x0 + x1) / 2, FLOOR - 300, rise(t, T.walk + 0.4, 0.25) * f, 'ढका रास्ता', 34, P.ink, P.cream);
  // a guest walks through, dry
  if (t > T.guest) {
    const v = seg(t, T.guest, T.guest + 1.4, ease.inOut);
    const ph = (t - T.guest) * 12;
    popup(ctx, lerp(x0 + 30, x1 - 60, v), FLOOR - 6, f, (g) => person(g, 0, -Math.abs(Math.sin(ph)) * 6, 200, 'A', { col: P.raspLight, arms: [0.25 * Math.sin(ph), -0.25 * Math.sin(ph)], look: 1 }));
  }
}

// ---------------------------------------------------------------- S5: written vendor rain terms
const TERMS = [['टेंट', 'साइड कवर लगेंगे'], ['कैटरर', 'ढकी जगह पर खाना'], ['डेकोर', 'अंदर दोबारा सजावट']];
const SH = { x: 540, top: 680, w: 880, h: 820 };
function sheet(ctx, t) {
  if (t < T.sheet) return;
  const f = fold(t, T.sheetFold, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.sheet, T.sheet + 0.35), 1.6);
  const l = SH.x - SH.w / 2, r = SH.x + SH.w / 2, top = SH.top;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + SH.h * Math.min(1, u)], [l, top + SH.h * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 84], [l, top + 84]], c: P.rasp, tone: 0.08 }], { shadow: false });
  ctx.fillStyle = P.cream; ctx.font = HF.bold(40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (u > 0.4) ctx.fillText('बारिश हुई तो वेंडर क्या करेंगे?', SH.x, top + 46);
  if (u > 0.9) {
    TERMS.forEach(([who, what], i) => {
      const y = top + 120 + i * 150;
      const ru = seg(t, T.rows[i], T.rows[i] + 0.25, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 126], [l + 30, y + 126]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
      facets(ctx, [{ pts: hg.pts, c: hg.front ? (i % 2 ? P.blush : P.cream) : P.blushDeep, tone: (i % 2 ? -0.05 : 0.18) * Math.abs(hg.k) }], { blur: 8, sx: 3, sy: 6 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      ctx.fillStyle = P.rasp; ctx.font = HF.bold(40); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(who, l + 62, y + 46);
      ctx.fillStyle = P.ink; ctx.font = HF.sans(36); ctx.fillText(what, l + 62, y + 94);
      check(ctx, r - 90, y + 64, 30 * rise(t, T.rows[i] + 0.2, 0.2));
      ctx.restore();
    });
    // signature + "in writing" stamp
    const su = seg(t, T.signed - 0.5, T.signed, ease.inOut);
    if (su > 0) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 40 * su; k++) { const v = k / 40; const x = l + 80 + v * 300, y = top + 640 + Math.sin(v * 16) * 14 * (1 - v * 0.5) - v * 10; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(74,30,38,0.55)'; ctx.font = HF.sans(26); ctx.textAlign = 'left'; ctx.fillText('वेंडर के हस्ताक्षर', l + 80, top + 690);
    }
    const st = rise(t, T.signed, 0.25);
    if (st > 0.03) { ctx.save(); ctx.translate(r - 200, top + 690); ctx.rotate(-0.06); ctx.scale(st, st); const w = hTag(ctx, 'लिखित में', 42, P.cream, P.rasp); check(ctx, w / 2 + 28, -36, 24); ctx.restore(); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- S6: decision time + plan switch
function decide(ctx, t) {
  if (t < T.clock - 0.05) return;
  const f = fold(t, T.clockFold, 540);
  if (f <= 0.02) return;
  const cu = rise(t, T.clock, 0.32) * f;
  const cx = 540, cy = 1000, R = 230;
  if (cu > 0.03) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(cu, cu);
    const list = [];
    for (let i = 0; i < 12; i++) { const a0 = (i / 12) * TAU, a1 = ((i + 1) / 12) * TAU; list.push({ pts: [[0, 0], [Math.cos(a0) * R, Math.sin(a0) * R], [Math.cos(a1) * R, Math.sin(a1) * R]], c: P.cream, tone: Math.cos((a0 + a1) / 2 + 2.3) * 0.25 }); }
    facets(ctx, list, { blur: 22, sx: 8, sy: 14 });
    ctx.strokeStyle = P.gold; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, R - 6, 0, TAU); ctx.stroke();
    ctx.fillStyle = P.ink; ctx.font = F.serif(52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [[12, 0], [3, 1], [6, 2], [9, 3]].forEach(([n, q]) => { const a = -Math.PI / 2 + q * Math.PI / 2; ctx.fillText(String(n), Math.cos(a) * (R - 52), Math.sin(a) * (R - 52) + 4); });
    // marked decision time (example: 11 o'clock)
    const mark = -Math.PI / 2 + (11 / 12) * TAU;
    ctx.fillStyle = P.rasp; ctx.beginPath(); ctx.arc(Math.cos(mark) * (R - 30), Math.sin(mark) * (R - 30), 14, 0, TAU); ctx.fill();
    const hv = seg(t, T.hand - 0.6, T.hand, ease.inOut);
    const ha = -Math.PI / 2 + lerp(8, 11, hv) / 12 * TAU;
    ctx.strokeStyle = P.ink; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * (R * 0.55), Math.sin(ha) * (R * 0.55)); ctx.stroke();
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -(R * 0.75)); ctx.stroke();
    ctx.fillStyle = P.goldDark; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
    ctx.restore();
  }
  tagAt(ctx, cx, cy - R - 30, rise(t, T.hand, 0.25) * f, 'फ़ैसला: सुबह 11 बजे (उदाहरण)', 34, P.cream, P.rasp);
  // switch: open lawn -> backup plan
  const su = rise(t, T.hand + 0.2, 0.3) * f;
  if (su > 0.03) {
    const y = 1400;
    ctx.save(); ctx.translate(cx, y); ctx.scale(su, su);
    facets(ctx, [{ pts: [[-300, -50], [300, -50], [300, 50], [-300, 50]], c: P.goldPale, tone: 0.12 }], { blur: 14, sx: 5, sy: 10 });
    const flip = seg(t, T.flip, T.flip + 0.25, ease.out);
    const kx = lerp(-60, 60, flip);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(kx, -40); ctx.stroke();
    ctx.fillStyle = P.rasp; ctx.beginPath(); ctx.arc(kx, -40, 18, 0, TAU); ctx.fill();
    ctx.font = HF.bold(34); ctx.textBaseline = 'middle';
    ctx.textAlign = 'right'; ctx.fillStyle = flip < 0.5 ? P.ink : 'rgba(74,30,38,0.4)'; ctx.fillText('खुला लॉन', -90, 6);
    ctx.textAlign = 'left'; ctx.fillStyle = flip >= 0.5 ? P.rasp : 'rgba(74,30,38,0.4)'; ctx.fillText('बैकअप प्लान', 90, 6);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- crane (scene-change carrier)
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25;
function craneState(t) {
  const swoop = (t0, a, b, c, s, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s, phi: flapPhi(t, t0), dir, rot: dir * (u - 0.5) * 0.3 }; };
  if (t >= T.crane1 && t < T.crane1 + 0.55) return swoop(T.crane1, [1450, 760], [600, 1150], [-450, 900], 1.8, -1);
  if (t >= T.crane2 && t < T.crane2 + 0.55) return swoop(T.crane2, [-450, 900], [450, 1150], [1500, 760], 1.8, 1);
  if (t >= T.card + 0.5) {
    const u = ease.inOut(prog(t, T.card + 0.5, T.perch));
    const landed = t >= T.perch;
    const qx = (1 - u) * (1 - u) * 1250 + 2 * (1 - u) * u * 1060 + u * u * 770, qy = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 380 + u * u * 322;
    return { x: qx, y: qy, s: 0.44, phi: landed ? 0.18 : flapPhi(t, T.card), dir: -1, rot: 0 };
  }
  return null;
}

// ---------------------------------------------------------------- captions: accepted folded strip, Hindi type
const CAPS = [
  [0.18, 3.05, ['खुले लॉन में शादी,', 'और अचानक बारिश?']],
  [3.2, 4.95, ['बैकअप प्लान तैयार रखिए']],
  [5.13, 8.29, ['1. सबके बैठने लायक', 'छत वाली जगह']],
  [8.47, 13.71, ['2. बिजली योग्य इलेक्ट्रीशियन लगाए;', 'बोर्ड ढके, तार पानी से दूर']],
  [13.88, 17.6, ['3. ढका रास्ता और', 'फिसलन रोकने वाली चटाई']],
  [17.78, 22.22, ['4. टेंट, कैटरर, डेकोर की', 'बारिश वाली शर्तें लिखित में']],
  [22.4, 25.88, ['5. पक्का कीजिए, किस समय', 'बैकअप प्लान पर जाएँगे']],
];
const CAP_Y = 425;
function captions(ctx, t) {
  for (const [a, b, lines] of CAPS) {
    if (t < a || t > b + 0.25) continue;
    const u = seg(t, a, a + 0.25, ease.out) * (1 - seg(t, b, b + 0.25, ease.in));
    if (u <= 0.02) continue;
    let px = 54;
    ctx.font = HF.serif(px);
    while (px > 42 && Math.max(...lines.map((s) => ctx.measureText(s).width)) > 760) { px -= 2; ctx.font = HF.serif(px); }
    const tw = Math.max(...lines.map((s) => ctx.measureText(s).width));
    const w = Math.min(820, tw + 80), lh = px * 1.36, h = lines.length * lh + 24;
    const j = jit(t, 99, 1);
    ctx.save(); ctx.translate(540 + j.x, CAP_Y + j.y); ctx.rotate(j.r - 0.01);
    const k = Math.sin(u * Math.PI / 2);
    const half = (side) => {
      const xs = side * (w / 2) * k;
      return [
        { pts: [[0, -h / 2], [xs, -h / 2 + 4], [xs, 0], [0, 0]], c: P.cream, tone: side < 0 ? 0.32 : 0.16 },
        { pts: [[0, 0], [xs, 0], [xs, h / 2 - 4], [0, h / 2]], c: P.cream, tone: side < 0 ? 0.06 : -0.1 },
      ];
    };
    const tail = (side) => ({ pts: [[side * (w / 2 - 20) * k, -h / 2 + 22], [side * (w / 2 + 36) * k, -h / 2 + 22], [side * (w / 2 + 18) * k, 6], [side * (w / 2 + 36) * k, h / 2 + 4], [side * (w / 2 - 20) * k, h / 2 + 4]], c: P.rasp, tone: -0.15 });
    facets(ctx, [tail(-1), tail(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [...half(-1), ...half(1)], { blur: 16, sx: 5, sy: 10 });
    if (k > 0.55) {
      ctx.save(); ctx.scale(k, 1);
      ctx.fillStyle = P.ink; ctx.font = HF.serif(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((s, i) => ctx.fillText(s, 0, (i - (lines.length - 1) / 2) * lh + 6));
      ctx.restore();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- S7: end card (accepted layout, Hindi CTA)
const EC = { x: 540, y: 930, w: 880, h: 1180 };
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function endCard(ctx, t) {
  if (t < T.card) return;
  const { x, y, w, h } = EC;
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  const slide = 1 - ease.out(prog(t, T.card, T.card + 0.2));
  ctx.save(); ctx.translate(0, slide * 900);
  const open = seg(t, T.card + 0.15, T.card + 0.45, ease.inOut);
  const k = Math.cos((1 - open) * Math.PI);
  const content = (g) => {
    const eu = rise(t, T.card + 0.4, 0.3);
    if (eu > 0.03) {
      g.save(); g.translate(x, 600); g.scale(eu, eu); g.translate(-x, -600);
      heart(g, x, 590, 92); ribbon(g, [x - 150, 640], [x + 150, 560], 30, P.rasp); star4(g, x, 455, 40, P.rasp, P.raspDark);
      g.restore();
    }
    const line = (s, yy, t0, px) => {
      const v = rise(t, t0, 0.24);
      if (v <= 0.03) return;
      g.save(); g.translate(0, yy - px * 0.7); g.scale(1, Math.min(1, v)); g.translate(0, -(yy - px * 0.7));
      g.fillStyle = P.ink; g.font = F.serif(px); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(s, x, yy); g.restore();
    };
    line('Plan My', 860, T.title, 150);
    line('Wedding', 1000, T.title + 0.12, 150);
    const su = seg(t, T.sub, T.sub + 0.25, ease.out);
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = HF.sans(38); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('चेकलिस्ट · वेंडर · बजट', x, 1082); g.globalAlpha = 1; }
  };
  facets(ctx, [{ pts: [[l, tp], [x, tp], [x, bt], [l, bt]], c: P.cream, tone: 0.16 }], { blur: 30, sx: 10, sy: 18 });
  if (k >= 0) {
    ctx.save(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.001), 1); ctx.translate(-x, 0);
    facets(ctx, [{ pts: [[x, tp], [r, tp], [r, bt], [x, bt]], c: P.cream, tone: 0.02 }], { blur: 30, sx: 10, sy: 18 });
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(l, tp, w / 2, h); ctx.clip(); content(ctx); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(x, tp, (w / 2) * k, h); ctx.clip(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.001), 1); ctx.translate(-x, 0); content(ctx); ctx.restore();
    ctx.strokeStyle = 'rgba(255,250,242,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, tp + 4); ctx.lineTo(x, bt - 4); ctx.stroke();
  } else {
    facets(ctx, [{ pts: [[x, tp], [x + (r - x) * k, tp], [x + (r - x) * k, bt], [x, bt]], c: P.blush, tone: 0.1 + 0.2 * k }], { blur: 18, sx: 6, sy: 12 });
  }
  const bu = rise(t, T.banner, 0.3);
  if (bu > 0.03) {
    const by = 1240, bw = 800 * Math.min(1, bu), bh = 132;
    ctx.save(); ctx.translate(x, by);
    const tails = (s) => ({ pts: [[s * (bw / 2 - 30), -bh / 2 + 26], [s * (bw / 2 + 40), -bh / 2 + 26], [s * (bw / 2 + 20), 12], [s * (bw / 2 + 40), bh / 2 + 10], [s * (bw / 2 - 30), bh / 2 + 10]], c: P.raspDark, tone: 0 });
    facets(ctx, [tails(-1), tails(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [
      { pts: [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, 0], [-bw / 2, 0]], c: P.rasp, tone: 0.18 },
      { pts: [[-bw / 2, 0], [bw / 2, 0], [bw / 2, bh / 2], [-bw / 2, bh / 2]], c: P.rasp, tone: -0.08 },
    ], { blur: 18, sx: 6, sy: 12 });
    if (bu > 0.7) {
      const ix = -bw / 2 + 26, is = 88;
      ctx.save(); roundRect(ctx, ix, -is / 2, is, is, 20); ctx.clip(); ctx.drawImage(icon, ix, -is / 2, is, is); ctx.restore();
      ctx.strokeStyle = P.cream; ctx.lineWidth = 3; roundRect(ctx, ix, -is / 2, is, is, 20); ctx.stroke();
      ctx.fillStyle = P.cream; ctx.font = HF.bold(44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('प्लान माय वेडिंग डाउनलोड करें', 52, 6);
    }
    ctx.restore();
    if (bu > 0.9) { ctx.fillStyle = P.ink; ctx.font = HF.sans(36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('गूगल प्ले पर', x, by + 110); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- frame
export function drawFrame(ctx, tReal) {
  const t = stepT(tReal);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = P.blush; ctx.fillRect(0, 0, W, H);
  const dim = seg(t, 0, 0.6) * worldUp(t);
  backdrop(ctx, dim);
  puddles(ctx, t);
  lawn(ctx, t);
  hallScene(ctx, t);
  power(ctx, t);
  walkway(ctx, t);
  rain(ctx, t);
  cloud(ctx, t);
  umbrella(ctx, t);
  sheet(ctx, t);
  decide(ctx, t);
  endCard(ctx, t);
  const cs = craneState(t);
  if (cs) {
    const j = jit(t, 7, 1.5);
    ctx.save(); ctx.translate(cs.x + j.x, cs.y + j.y); if (cs.rot) ctx.rotate(cs.rot);
    crane(ctx, 0, 0, cs.s, 1, cs.phi, cs.dir, cs.s > 1 ? { blur: 30, shx: 18, shy: 30 } : {});
    ctx.restore();
  }
  captions(ctx, t);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.55;
  ctx.drawImage(grain, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
