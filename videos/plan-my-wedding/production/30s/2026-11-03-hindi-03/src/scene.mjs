// Hindi episode: "मेहमानों की गिनती बनाम सजावट की छोटी बचत" (guest count vs small décor savings).
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (only DURATION=30),
// scene grammar from production/30s/2026-11-03-round-02 (backdrop, scale, sheet, crane, folded caption
// strips, end card). New here: Devanagari fonts (Noto Serif Devanagari Bold, Hind) and the guest-grid mechanism.
import { loadImage, GlobalFonts } from '@napi-rs/canvas';
import nodePath from 'node:path';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, person, pillar, check, coin, tulips, pennant } from './models.mjs';
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
function backdrop(ctx) {
  for (const f of WALL) { path(ctx, f.pts); ctx.fillStyle = shade(f.c, f.tone); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,250,244,0.35)'; ctx.lineWidth = 2;
  for (const f of WALL) { path(ctx, f.pts); ctx.stroke(); }
  facets(ctx, [
    { pts: [[-40, FLOOR], [540, FLOOR], [-40, 2000]], c: P.cream, tone: 0.08 },
    { pts: [[540, FLOOR], [1120, FLOOR], [1120, 2000], [-40, 2000]], c: P.cream, tone: -0.04 },
    { pts: [[540, FLOOR], [1120, 1800], [1120, 2000]], c: P.creamDeep, tone: 0 },
  ], { shadow: false, outline: false });
  ctx.strokeStyle = 'rgba(74,30,38,0.12)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-40, FLOOR); ctx.lineTo(1120, FLOOR); ctx.stroke();
}

/** folded paper tag with Hindi text; base centre at (0,0) */
function hTag(ctx, text, px = 34, col = P.ink, fill = P.cream) {
  ctx.font = HF.sans(px);
  const w = ctx.measureText(text).width + 40, h = px + 26;
  facets(ctx, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h / 2], [-w / 2, -h / 2]], c: fill, tone: -0.08 },
    { pts: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 - 6, -h], [-w / 2 + 6, -h]], c: fill, tone: 0.3 },
  ], { blur: 8, sx: 3, sy: 6 });
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, -h / 2 + 3);
}
const tagAt = (ctx, x, y, u, text, px, col, fill) => { if (u <= 0.03) return; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); hTag(ctx, text, px, col, fill); ctx.restore(); };

// ---------------------------------------------------------------- props
function thali(ctx, x, y, r) {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const a0 = (i / 10) * TAU, a1 = ((i + 1) / 10) * TAU;
    list.push({ pts: [[x, y], [x + Math.cos(a0) * r, y + Math.sin(a0) * r * 0.62], [x + Math.cos(a1) * r, y + Math.sin(a1) * r * 0.62]], c: P.goldLight, tone: Math.cos((a0 + a1) / 2 + 2.3) * 0.35 });
  }
  facets(ctx, list, { blur: 14, sx: 5, sy: 10 });
  [[-0.42, -0.1, P.rasp], [0.05, -0.28, P.gold], [0.45, -0.05, P.raspLight], [0, 0.22, P.cream]].forEach(([dx, dy, c]) => {
    const cx = x + dx * r, cy = y + dy * r * 0.62, kr = r * 0.2;
    facets(ctx, [{ pts: [[cx - kr, cy], [cx + kr, cy], [cx + kr * 0.7, cy + kr * 0.6], [cx - kr * 0.7, cy + kr * 0.6]], c: P.goldPale, tone: 0.1 }], { blur: 4, sx: 2, sy: 3 });
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(cx, cy, kr * 0.85, kr * 0.36, 0, 0, TAU); ctx.fill();
  });
}
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
function table(ctx, x, base, s) {
  const p = (dx, dy) => [x + dx * s, base + dy * s];
  facets(ctx, [
    { pts: [p(-70, -84), p(70, -84), p(84, -96), p(-56, -96)], c: P.cream, tone: 0.42 },
    { pts: [p(-70, -84), p(70, -84), p(62, -40), p(-62, -40)], c: P.rasp, tone: 0.05 },
    { pts: [p(-8, -40), p(8, -40), p(8, 0), p(-8, 0)], c: P.goldDark, tone: 0 },
  ], { blur: 10, sx: 4, sy: 8 });
}
/** tiny seat token for the guest grid */
function token(ctx, x, y, extra) {
  const c = extra ? P.raspLight : P.goldPale;
  facets(ctx, [
    { pts: [[x - 13, y - 26], [x - 6, y - 26], [x - 6, y], [x - 13, y]], c, tone: 0.3 },
    { pts: [[x - 15, y], [x + 15, y], [x + 19, y - 5], [x - 11, y - 5]], c, tone: 0.4 },
    { pts: [[x - 14, y], [x - 10, y], [x - 10, y + 16], [x - 14, y + 16]], c, tone: 0.1 },
    { pts: [[x + 10, y], [x + 14, y], [x + 14, y + 16], [x + 10, y + 16]], c, tone: -0.2 },
  ], { blur: 4, sx: 2, sy: 3 });
  ctx.fillStyle = extra ? P.rasp : P.gold; ctx.beginPath(); ctx.ellipse(x + 4, y - 10, 9, 4.5, 0, 0, TAU); ctx.fill();
}

// ---------------------------------------------------------------- S1: décor saving vs +50 guests
function hook(ctx, t) {
  const f = fold(t, T.fold1, 300);
  if (f <= 0.02) return;
  // décor: tulip vase on a plinth with a pennant garland
  popup(ctx, 250, FLOOR, rise(t, T.decor, 0.34) * f, (g) => {
    facets(g, [
      { pts: [[-110, 0], [110, 0], [110, -130], [-110, -130]], c: P.blush, tone: 0.08 },
      { pts: [[-110, -130], [110, -130], [96, -146], [-96, -146]], c: P.blush, tone: 0.4 },
    ], { blur: 14, sx: 5, sy: 10 });
    g.save(); g.translate(0, -146); g.scale(1.6, 1.6); tulips(g); g.restore();
    g.fillStyle = P.ink; g.font = HF.bold(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('सजावट', 0, -64);
  });
  const pu = seg(t, 0.2, 0.6, ease.out) * f;
  if (pu > 0.03) {
    ctx.strokeStyle = P.raspDark; ctx.lineWidth = 3;
    const q = (v) => [lerp(70, 470, v), lerp(820, 840, v) + Math.sin(v * Math.PI) * 50];
    ctx.beginPath(); for (let k = 0; k <= 20; k++) { const p = q(k / 20); k ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke();
    for (let k = 1; k <= 5; k++) { const p = q(k / 6); const o = clamp(pu * 6 - k); if (o > 0.04) pennant(ctx, p[0], p[1], 22, (1 - o) * Math.PI * 0.97, k % 2 ? P.rasp : P.goldLight); }
  }
  // savings box + coin
  popup(ctx, 480, FLOOR, rise(t, T.box, 0.3) * f, (g) => {
    facets(g, [
      { pts: [[-70, 0], [70, 0], [70, -86], [-70, -86]], c: P.goldPale, tone: 0.12 },
      { pts: [[-70, -86], [70, -86], [84, -98], [-56, -98]], c: P.goldDark, tone: -0.1 },
    ], { blur: 12, sx: 4, sy: 8 });
    g.fillStyle = P.ink; g.font = HF.bold(32); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('बचत', 0, -46);
  });
  if (t > T.coin && t < T.coinIn + 0.3) {
    const v = seg(t, T.coin, T.coinIn, ease.inOut);
    const x = lerp(250, 480, v), y = lerp(1180, 1540, v) - Math.sin(v * Math.PI) * 160;
    if (t < T.coinIn + 0.05) { coin(ctx, x, y, 34, v * 5); tagAt(ctx, x, y - 44, 1, '₹5,000', 30, P.goldDark); }
  }
  // +50 guests (each figure = 10 guests)
  for (let i = 0; i < 5; i++) {
    const x = 660 + i * 80;
    popup(ctx, x, FLOOR, rise(t, T.guests + i * 0.1, 0.28) * fold(t, T.fold1, x), (g) => person(g, 0, 0, 210, i % 2 ? 'B' : 'A', { col: P.rasp, noFace: false }));
  }
  tagAt(ctx, 820, 1390, rise(t, T.plus50, 0.25) * fold(t, T.fold1, 820), '+50 मेहमान', 38, P.cream, P.rasp);
}

// ---------------------------------------------------------------- S2: one guest = food + seating
function unit(ctx, t) {
  if (t < T.unit - 0.1) return;
  const f = fold(t, T.fold2, 540);
  if (f <= 0.02) return;
  popup(ctx, 230, 1540, rise(t, T.unit, 0.32) * f, (g) => person(g, 0, 0, 340, 'A', { col: P.gold, look: 1 }));
  tagAt(ctx, 230, 1140, rise(t, T.unit + 0.4, 0.25) * f, '1 मेहमान', 34);
  // gold threads from the guest to each cost
  const thread = (x1, y1, t0) => {
    const u = seg(t, t0 - 0.2, t0 + 0.1, ease.out) * f;
    if (u <= 0) return;
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.setLineDash([10, 9]);
    ctx.beginPath(); ctx.moveTo(300, 1290); ctx.lineTo(lerp(300, x1, u), lerp(1290, y1, u)); ctx.stroke(); ctx.setLineDash([]);
  };
  thread(570, 920, T.plate); thread(590, 1240, T.chair);
  const pu = rise(t, T.plate, 0.3) * f;
  if (pu > 0.03) { ctx.save(); ctx.translate(720, 900); ctx.scale(pu, pu); thali(ctx, 0, 0, 120); ctx.restore(); }
  tagAt(ctx, 720, 1040, rise(t, T.plate + 0.15, 0.25) * f, 'खाना ₹1,000', 36);
  popup(ctx, 660, 1320, rise(t, T.chair, 0.3) * f, (g) => chair(g, 0, 0, 1.1));
  popup(ctx, 810, 1320, rise(t, T.chair + 0.08, 0.3) * f, (g) => table(g, 0, 0, 1.05));
  tagAt(ctx, 735, 1400, rise(t, T.chair + 0.2, 0.25) * f, 'कुर्सी-मेज़ ₹200', 36);
  tagAt(ctx, 600, 1515, rise(t, T.sum, 0.28) * f, '= ₹1,200 प्रति मेहमान', 38, P.cream, P.rasp);
}

// ---------------------------------------------------------------- S3/S4: the guest grid multiplies
const GX = (c) => 160 + c * 84, GY = (r) => 760 + r * 56;
function grid(ctx, t) {
  if (t < T.grid - 0.05) return;
  const f = fold(t, T.fold3, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, 700); ctx.scale(1, f); ctx.translate(0, -700);
  // paper hall floor that grows when 50 more guests are added
  const grow = seg(t, T.grid50 - 0.1, T.grid50 + 0.3, ease.out);
  const bottom = lerp(1340, 1620, grow) * Math.min(1, rise(t, T.grid, 0.3));
  facets(ctx, [{ pts: [[110, 700], [970, 700], [970, bottom], [110, bottom]], c: P.cream, tone: 0.12 }], { blur: 24, sx: 8, sy: 14 });
  for (let r = 0; r < 15; r++) {
    const extra = r >= 10;
    const t0 = extra ? T.grid50 + (r - 10) * T.rowGap : T.grid + r * T.rowGap;
    const u = seg(t, t0, t0 + 0.12, ease.out);
    if (u <= 0.05) continue;
    const y = GY(r);
    ctx.save(); ctx.translate(0, y - 26); ctx.scale(1, u); ctx.translate(0, -(y - 26));
    for (let c = 0; c < 10; c++) token(ctx, GX(c), y, extra);
    ctx.restore();
  }
  // formula sign above the grid
  const su = rise(t, T.total100, 0.28);
  if (su > 0.03) {
    const s150 = t >= T.total150;
    const flip = s150 ? seg(t, T.total150, T.total150 + 0.2, ease.out) : 1;
    ctx.save(); ctx.translate(540, 690); ctx.scale(su, su * Math.max(0.05, flip));
    hTag(ctx, s150 ? '150 × ₹1,200 = ₹1,80,000' : '100 × ₹1,200 = ₹1,20,000', 40, s150 ? P.cream : P.ink, s150 ? P.rasp : P.cream);
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- S5: balance scale (accepted round-02 mechanism)
const PIV = { x: 540, y: 1000 }, BEAM = 300, STR = 300;
function theta(t) {
  let a = 0;
  const step = (t0, d, dur = 0.25) => { if (t >= t0) a += d * ease.out(prog(t, t0, t0 + dur)); };
  step(T.left + 0.1, 0.05);
  for (let i = 0; i < 12; i++) step(T.twelve + i * T.coinGap + 0.05, -0.02, 0.15);
  let w = 0;
  [T.left + 0.1, T.twelve + 12 * T.coinGap].forEach((t0) => { if (t > t0) w += Math.exp(-6 * (t - t0)) * Math.sin(TAU * 2.2 * (t - t0)) * 0.02; });
  return a + w;
}
function pan(ctx, e, u) {
  const y = e.y + STR * u;
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - 120, y); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + 120, y); ctx.stroke();
  facets(ctx, [
    { pts: [[e.x - 140, y], [e.x + 140, y], [e.x + 110, y + 34], [e.x - 110, y + 34]], c: P.gold, tone: 0.12 },
    { pts: [[e.x - 140, y], [e.x + 140, y], [e.x + 130, y - 8], [e.x - 130, y - 8]], c: P.gold, tone: 0.42 },
  ], { blur: 14, sx: 5, sy: 10 });
  return y - 8;
}
function sign(ctx, x, y, head, price, sub, fill) {
  const w = 270, h = 176, y0 = y - 26 - h;
  facets(ctx, [{ pts: [[x - 10, y], [x + 10, y], [x + 6, y - 26], [x - 6, y - 26]], c: P.goldDark, tone: 0 }], { blur: 6, sx: 2, sy: 4 });
  facets(ctx, [
    { pts: [[x - w / 2, y0], [x + w / 2, y0], [x + w / 2, y0 + 46], [x - w / 2, y0 + 46]], c: fill, tone: 0.2 },
    { pts: [[x - w / 2, y0 + 46], [x + w / 2, y0 + 46], [x + w / 2, y0 + h], [x - w / 2, y0 + h]], c: P.cream, tone: 0.12 },
  ], { blur: 16, sx: 5, sy: 10 });
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = P.cream; ctx.font = HF.sans(28); ctx.fillText(head, x, y0 + 25);
  ctx.fillStyle = P.ink; ctx.font = HF.serif(54); ctx.fillText(price, x, y0 + 102);
  if (sub) { ctx.fillStyle = P.rasp; ctx.font = HF.sans(26); ctx.fillText(sub, x, y0 + 150); }
}
function scale(ctx, t) {
  const u = rise(t, T.scale, 0.36) * fold(t, T.fold4, 540);
  if (t < T.scale || u <= 0.02) return;
  const th = theta(t);
  const ea = { x: PIV.x - BEAM * Math.cos(th), y: PIV.y + BEAM * Math.sin(th) }, eb = { x: PIV.x + BEAM * Math.cos(th), y: PIV.y - BEAM * Math.sin(th) };
  popup(ctx, PIV.x, FLOOR, u, (g) => pillar(g, 0, FLOOR - PIV.y - 10, 60));
  const bu = seg(t, T.scale + 0.2, T.scale + 0.4, ease.out) * fold(t, T.fold4, 540);
  if (bu <= 0.02) return;
  const A = { x: lerp(PIV.x, ea.x, bu), y: lerp(PIV.y, ea.y, bu) }, B = { x: lerp(PIV.x, eb.x, bu), y: lerp(PIV.y, eb.y, bu) };
  const sa = pan(ctx, A, bu), sb = pan(ctx, B, bu);
  if (t > T.left - 0.2) { const v = prog(t, T.left - 0.2, T.left + 0.1); coin(ctx, A.x, v < 1 ? lerp(760, sa - 28, ease.in(v)) : sa - 28, 30, 0.3); }
  for (let i = 0; i < 12; i++) {
    const t0 = T.twelve + i * T.coinGap;
    if (t < t0 - 0.15) continue;
    const v = prog(t, t0 - 0.15, t0);
    const x = B.x + (i % 3 - 1) * 66, yRest = sb - 26 - Math.floor(i / 3) * 40;
    coin(ctx, x, v < 1 ? lerp(760, yRest, ease.in(v)) : yRest, 28, i);
  }
  // beam + signs
  const ca = Math.cos(th), sn = Math.sin(th), L = BEAM * bu;
  const bp = (dx, dy) => [PIV.x + dx * ca - dy * sn, PIV.y - dx * sn - dy * ca];
  facets(ctx, [
    { pts: [bp(-L, 14), bp(L, 14), bp(L, 0), bp(-L, 0)], c: P.gold, tone: 0.35 },
    { pts: [bp(-L, 0), bp(L, 0), bp(L, -14), bp(-L, -14)], c: P.gold, tone: -0.1 },
  ], { blur: 14, sx: 5, sy: 10 });
  heart(ctx, PIV.x, PIV.y - 6, 30, P.gold, { blur: 8 });
  const su = seg(t, T.left, T.left + 0.25, ease.out) * fold(t, T.fold4, 540);
  if (su > 0.03) { ctx.save(); ctx.globalAlpha = su; sign(ctx, A.x, A.y - 14, 'सजावट की बचत', '₹5,000', null, P.gold); ctx.restore(); }
  const sv = seg(t, T.right, T.right + 0.25, ease.out) * fold(t, T.fold4, 540);
  if (sv > 0.03) { ctx.save(); ctx.globalAlpha = sv; sign(ctx, B.x, B.y - 14, '50 मेहमानों का खर्च', '₹60,000', t > T.twelve + 1.25 ? '= 12 × ₹5,000' : null, P.rasp); ctx.restore(); }
}

// ---------------------------------------------------------------- S6: guest list split before booking
const SH = { x: 540, top: 690, w: 880, h: 880 };
const MUST = ['परिवार', 'करीबी दोस्त', 'रिश्तेदार'], MAYBE = ['दफ़्तर', 'पड़ोसी', 'पुराने साथी'];
function sheet(ctx, t) {
  if (t < T.sheet) return;
  const f = fold(t, T.fold5, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.sheet, T.sheet + 0.35), 1.6);
  const l = SH.x - SH.w / 2, r = SH.x + SH.w / 2, top = SH.top, hh = SH.h * Math.min(1, u);
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + hh], [l, top + hh]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 84], [l, top + 84]], c: P.rasp, tone: 0.08 }], { shadow: false });
  ctx.fillStyle = P.cream; ctx.font = HF.bold(42); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (u > 0.4) ctx.fillText('मेहमानों की सूची', SH.x, top + 46);
  if (u > 0.9) {
    // two columns
    [[l + 30, 'ज़रूरी', P.rasp], [SH.x + 15, 'शायद', P.gold]].forEach(([x0, label, c]) => {
      facets(ctx, [
        { pts: [[x0, top + 110], [x0 + 405, top + 110], [x0 + 405, top + 170], [x0, top + 170]], c, tone: 0.15 },
        { pts: [[x0, top + 170], [x0 + 405, top + 170], [x0 + 405, top + 600], [x0, top + 600]], c: P.blush, tone: 0.05 },
      ], { blur: 10, sx: 3, sy: 6 });
      ctx.fillStyle = P.cream; ctx.font = HF.bold(38); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x0 + 202, top + 143);
    });
    // name cards fly from the unsorted pile into their column
    const card = (s, i, col, t0) => {
      const v = seg(t, t0 + i * 0.15, t0 + i * 0.15 + 0.3, ease.inOut);
      const tx = col ? SH.x + 15 + 202 : l + 30 + 202, ty = top + 230 + i * 120;
      const x = lerp(SH.x + (i - 1) * 24 + (col ? 30 : -30), tx, v), y = lerp(top + 660 + (col ? 10 : 0), ty, v);
      ctx.save(); ctx.translate(x, y + 30); ctx.rotate((1 - v) * (col ? 0.12 : -0.12));
      hTag(ctx, s, 36, P.ink, P.cream);
      ctx.restore();
    };
    MAYBE.forEach((s, i) => card(s, i, 1, T.maybe));
    MUST.forEach((s, i) => card(s, i, 0, T.must));
    // decision: number fixed, then booking unlocks
    const cu = rise(t, T.count, 0.25);
    if (cu > 0.03) { ctx.save(); ctx.translate(SH.x - 150, top + 790); ctx.scale(cu, cu); ctx.rotate(-0.05); hTag(ctx, 'संख्या पक्की', 40, P.cream, P.rasp); check(ctx, 150, -34, 26); ctx.restore(); }
    const bu = rise(t, T.unlock, 0.25);
    if (bu > 0.03) {
      ctx.save(); ctx.translate(SH.x + 230, top + 790); ctx.scale(bu, bu);
      // padlock opening
      ctx.strokeStyle = P.goldDark; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(-80, -74, 20, Math.PI, 0); ctx.lineTo(-60, -60); ctx.stroke();
      facets(ctx, [{ pts: [[-104, -60], [-56, -60], [-56, -20], [-104, -20]], c: P.gold, tone: 0.2 }], { blur: 6, sx: 2, sy: 4 });
      hTag(ctx, 'अब बुकिंग', 38, P.ink, P.goldPale);
      ctx.restore();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- crane (scene-change carrier)
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25;
function craneState(t) {
  const swoop = (t0, a, b, c, s, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s, phi: flapPhi(t, t0), dir, rot: dir * (u - 0.5) * 0.3 }; };
  if (t >= T.crane1 && t < T.crane1 + 0.55) return swoop(T.crane1, [1450, 760], [600, 1150], [-450, 900], 1.8, -1);
  if (t >= T.crane2 && t < T.crane2 + 0.55) return swoop(T.crane2, [-450, 900], [450, 1150], [1500, 760], 1.8, 1);
  if (t >= T.crane3 && t < T.crane3 + 0.55) return swoop(T.crane3, [1450, 820], [600, 1180], [-450, 940], 1.8, -1);
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
  [0.18, 4.44, ['सजावट में ₹5,000 बचाए,', 'पर 50 और मेहमान बुलाए?']],
  [4.64, 9.3, ['मान लीजिए, प्रति मेहमान:', 'खाना ₹1,000 + कुर्सी-मेज़ ₹200']],
  [9.5, 12.15, ['100 मेहमान = ₹1,20,000']],
  [12.35, 15.16, ['150 मेहमान = ₹1,80,000']],
  [15.36, 19.65, ['₹60,000 ज़्यादा =', 'सजावट की बचत का 12 गुना']],
  [19.85, 25.43, ['बुकिंग से पहले सूची बाँटें:', 'ज़रूरी और शायद, फिर संख्या पक्की']],
];
const CAP_Y = 425; // strip spans about y 340-510, inside x 90-990
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
function illustrative(ctx, t) {
  const u = seg(t, T.unit + 0.6, T.unit + 0.85, ease.out) * fold(t, T.fold4, 540);
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(540, 596); ctx.scale(1, u); hTag(ctx, 'उदाहरण के आँकड़े, बाज़ार दर नहीं', 30, P.ink, P.cream); ctx.restore();
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = HF.sans(38); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('मेहमान सूची · बजट · निमंत्रण', x, 1082); g.globalAlpha = 1; }
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
  backdrop(ctx);
  hook(ctx, t);
  unit(ctx, t);
  grid(ctx, t);
  scale(ctx, t);
  illustrative(ctx, t);
  sheet(ctx, t);
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
