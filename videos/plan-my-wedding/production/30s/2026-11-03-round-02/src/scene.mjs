// Episode: "Compare venue quotes: headline price vs total cost".
// Accepted origami-world recipe (lib.mjs / models.mjs copied unchanged from tests/15s @33e410b):
// faceted folds lit from the upper left, soft shadows, planar hinge/pop-up motion, 12 fps stepping,
// folded-strip captions, crane as the scene-change carrier. All figures are fictional and labelled.
import { loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, person, pillar, tag, check, coin, envelope } from './models.mjs';
import { T } from './cues.mjs';

const FLOOR = 1640;
const grain = makeGrain(5);
let icon = null;
export async function init() { icon = await loadImage('assets/app-icon-play.png'); }

const rise = (t, t0, dur = 0.32) => (t < t0 ? 0 : t < t0 + dur ? ease.back(prog(t, t0, t0 + dur), 2.2) : 1);
const fold = (t, t0, x = 540) => 1 - seg(t, t0 + (x / W) * 0.2, t0 + (x / W) * 0.2 + 0.28, ease.in);

// ---------------------------------------------------------------- backdrop (as in the accepted test)
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

// ---------------------------------------------------------------- S1: two venues with headline tags
function hall(g, w, h, c) {
  const col = (x) => facets(g, [
    { pts: [[x - 14, 0], [x, 0], [x, -h + 70], [x - 14, -h + 70]], c: P.cream, tone: 0.3 },
    { pts: [[x, 0], [x + 14, 0], [x + 14, -h + 70], [x, -h + 70]], c: P.cream, tone: -0.2 },
  ], { blur: 8, sx: 3, sy: 6 });
  facets(g, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h + 70], [-w / 2, -h + 70]], c, tone: 0.05 },
    { pts: [[-w / 2 - 20, -h + 70], [w / 2 + 20, -h + 70], [w / 2 + 20, -h + 40], [-w / 2 - 20, -h + 40]], c: P.gold, tone: 0.1 },
    { pts: [[-w / 2 - 20, -h + 40], [0, -h - 40], [0, -h + 40]], c, tone: 0.32 },
    { pts: [[0, -h - 40], [w / 2 + 20, -h + 40], [0, -h + 40]], c, tone: -0.22 },
  ], { blur: 18, sx: 7, sy: 12 });
  [-w * 0.34, -w * 0.12, w * 0.12, w * 0.34].forEach(col);
  facets(g, [{ pts: [[-28, 0], [28, 0], [28, -90], [0, -112], [-28, -90]], c: P.raspDark, tone: 0.1 }], { shadow: false });
}
/** hanging price tag; local origin = string top */
function priceTag(g, label, price, w = 220, h = 118) {
  g.strokeStyle = P.goldDark; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 30); g.stroke();
  facets(g, [
    { pts: [[-w / 2, 30], [w / 2, 30], [w / 2, 30 + h / 2], [-w / 2, 30 + h / 2]], c: P.cream, tone: 0.3 },
    { pts: [[-w / 2, 30 + h / 2], [w / 2, 30 + h / 2], [w / 2, 30 + h], [-w / 2, 30 + h]], c: P.cream, tone: 0.02 },
  ], { blur: 12, sx: 4, sy: 8 });
  g.fillStyle = P.rasp; g.font = F.sansB(24); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, 0, 54);
  g.fillStyle = P.ink; g.font = F.serif(64); g.fillText(price, 0, 30 + h * 0.66);
}
function venues(ctx, t) {
  if (t > T.fold1 + 0.6) return;
  const halls = [[300, T.hallA, 'Venue A', '4,000', P.blush], [780, T.hallB, 'Venue B', '8,500', P.goldPale]];
  halls.forEach(([x, t0, lab, price, c], i) => {
    const u = rise(t, t0, 0.34) * fold(t, T.fold1, x);
    popup(ctx, x, FLOOR, u, (g) => hall(g, 340, 420, c));
    const tu = rise(t, i ? T.tagB : T.tagA, 0.3) * fold(t, T.fold1, x);
    if (tu > 0.03) {
      const j = jit(t, 20 + i, 1.2);
      ctx.save(); ctx.translate(x + j.x, 880 + j.y); ctx.rotate(Math.sin(t * 3 + i) * 0.03 * (t < T.fold1 ? 1 : 0)); ctx.scale(1, tu);
      ctx.scale(1.2, 1.2); priceTag(ctx, lab.toUpperCase(), price);
      ctx.restore();
    }
  });
  // "cheaper?" star on A
  const su = rise(t, T.cheaper, 0.25) * fold(t, T.fold1, 300);
  if (su > 0.03) {
    ctx.save(); ctx.translate(470, 880); ctx.scale(su, su);
    star4(ctx, 0, 0, 34, P.gold, P.goldDark);
    ctx.restore();
    ctx.fillStyle = P.goldDark; ctx.font = F.sansB(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (su > 0.6) ctx.fillText('cheaper?', 470, 936);
  }
  // hidden fold under A's tag reveals unknown add-ons
  const hu = seg(t, T.hidden, T.hidden + 0.3, ease.out) * fold(t, T.fold1, 300);
  if (hu > 0.02) {
    const top = 880 + (30 + 118) * 1.2;
    const hg = hinge([[168, top], [432, top], [432, top + 84], [168, top + 84]], [168, top], [432, top], (1 - hu) * Math.PI * 0.98);
    facets(ctx, [{ pts: hg.pts, c: hg.front ? P.rasp : P.raspDark, tone: hg.front ? 0.1 * hg.k : -0.1 }], { blur: 10, sx: 4, sy: 8 });
    if (hg.front && hg.k > 0.6) {
      ctx.save(); ctx.translate(0, top); ctx.scale(1, hg.k); ctx.translate(0, -top);
      ctx.fillStyle = P.cream; ctx.font = F.sansB(40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+ ?  + ?  + ?', 300, top + 44);
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- S2-S6: origami balance scale
const PIV = { x: 540, y: 1000 }, BEAM = 300, STR = 300;
function theta(t) {
  let a = 0;
  const step = (t0, d, dur = 0.25) => { if (t >= t0) a += d * ease.out(prog(t, t0, t0 + dur)); };
  step(T.tiltUp, -0.1, 0.35);
  T.blk.forEach((b) => step(b + 0.05, 0.055));
  step(T.bList + 0.15, -0.03);
  step(T.cork + 0.15, -0.02);
  // small settle wobble after each landing (stepped by the 12 fps grid)
  let w = 0;
  [T.tiltUp, ...T.blk, T.bList + 0.15, T.cork + 0.15].forEach((t0) => { if (t > t0) w += Math.exp(-6 * (t - t0)) * Math.sin(TAU * 2.2 * (t - t0)) * 0.02; });
  return a + w;
}
const ends = (th) => ({
  a: { x: PIV.x - BEAM * Math.cos(th), y: PIV.y + BEAM * Math.sin(th) },
  b: { x: PIV.x + BEAM * Math.cos(th), y: PIV.y - BEAM * Math.sin(th) },
});
function scaleUp(t) { return rise(t, T.scale, 0.36) * fold(t, T.fold2, 540); }
function pan(ctx, e, u) {
  const y = e.y + STR * u;
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - 120, y); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + 120, y); ctx.stroke();
  facets(ctx, [
    { pts: [[e.x - 140, y], [e.x + 140, y], [e.x + 110, y + 34], [e.x - 110, y + 34]], c: P.gold, tone: 0.12 },
    { pts: [[e.x - 140, y], [e.x + 140, y], [e.x + 130, y - 8], [e.x - 130, y - 8]], c: P.gold, tone: 0.42 },
  ], { blur: 14, sx: 5, sy: 10 });
  return y - 8; // pan surface
}
function signCard(ctx, x, y, lab, top, price, sub, flip, badge) {
  // folded tent sign standing on the beam end; flip (0..1) hinges a new face down from the top edge
  const w = 260, h = 186;
  facets(ctx, [
    { pts: [[x - 10, y], [x + 10, y], [x + 6, y - 26], [x - 6, y - 26]], c: P.goldDark, tone: 0 },
  ], { blur: 6, sx: 2, sy: 4 });
  const y0 = y - 26 - h;
  facets(ctx, [
    { pts: [[x - w / 2, y0], [x + w / 2, y0], [x + w / 2, y0 + 42], [x - w / 2, y0 + 42]], c: P.gold, tone: 0.2 },
    { pts: [[x - w / 2, y0 + 42], [x + w / 2, y0 + 42], [x + w / 2, y0 + h], [x - w / 2, y0 + h]], c: P.cream, tone: 0.12 },
  ], { blur: 16, sx: 5, sy: 10 });
  ctx.fillStyle = P.cream; ctx.font = F.sansB(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(lab, x, y0 + 22);
  const k = flip;
  if (k > 0.04) {
    ctx.save(); ctx.translate(0, y0 + 42); ctx.scale(1, k); ctx.translate(0, -(y0 + 42));
    if (top) { ctx.fillStyle = 'rgba(74,30,38,0.62)'; ctx.font = F.sans(24); ctx.fillText(top, x, y0 + 62); }
    ctx.fillStyle = P.ink; ctx.font = F.serif(64); ctx.fillText(price, x, y0 + 108);
    ctx.fillStyle = P.rasp; ctx.font = F.sansB(23); ctx.fillText(sub, x, y0 + 160);
    ctx.restore();
  }
  if (badge > 0.03) {
    ctx.save(); ctx.translate(x + w / 2 - 6, y0 + 6); ctx.scale(badge, badge);
    facets(ctx, [{ pts: [[0, -30], [30, 0], [0, 30], [-30, 0]], c: P.gold, tone: 0.2 }], { blur: 8, sx: 3, sy: 6 });
    check(ctx, 0, 2, 20);
    ctx.restore();
  }
}
const BLOCKS = [
  ['Food', '+3,600', 'food'], ['Extra hours', '+600', 'clock'], ['Décor', '+800', 'flower'], ['Tax', '+900', 'pct'], ['Cleaning', '+200', 'spark'],
];
function blockIcon(g, kind, x, y) {
  g.strokeStyle = P.ink; g.fillStyle = P.ink; g.lineWidth = 3.5; g.lineCap = 'round';
  if (kind === 'food') { g.beginPath(); g.arc(x, y + 6, 13, Math.PI, 0); g.stroke(); g.beginPath(); g.moveTo(x - 17, y + 8); g.lineTo(x + 17, y + 8); g.stroke(); }
  else if (kind === 'clock') { g.beginPath(); g.arc(x, y, 14, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y); g.lineTo(x + 7, y + 4); g.stroke(); }
  else if (kind === 'flower') star4(g, x, y, 16, P.rasp, P.raspDark);
  else if (kind === 'pct') { g.font = F.sansB(30); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('%', x, y + 1); }
  else star4(g, x, y, 15, P.gold, P.goldDark);
}
function costBlock(ctx, x, y, b, w = 270, h = 46) {
  // folded box resting with its base at y
  facets(ctx, [
    { pts: [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], c: P.cream, tone: 0.1 },
    { pts: [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 - 10, y - h - 8], [x - w / 2 + 10, y - h - 8]], c: P.cream, tone: 0.42 },
    { pts: [[x - w / 2, y], [x - w / 2 + 8, y], [x - w / 2 + 8, y - h], [x - w / 2, y - h]], c: P.rasp, tone: 0.1 },
  ], { blur: 10, sx: 4, sy: 7 });
  blockIcon(ctx, b[2], x - w / 2 + 34, y - h / 2);
  ctx.fillStyle = P.ink; ctx.font = F.sansB(25); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(b[0], x - w / 2 + 58, y - h / 2 + 1);
  ctx.fillStyle = P.rasp; ctx.textAlign = 'right'; ctx.fillText(b[1], x + w / 2 - 12, y - h / 2 + 1);
}
function inclCard(ctx, x, y) {
  const w = 250, h = 196;
  facets(ctx, [
    { pts: [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], c: P.cream, tone: 0.1 },
    { pts: [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y - h + 36], [x - w / 2, y - h + 36]], c: P.goldLight, tone: 0.1 },
  ], { blur: 12, sx: 4, sy: 8 });
  ctx.fillStyle = P.ink; ctx.font = F.sansB(23); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('INCLUDED', x, y - h + 19);
  ['120 guests', 'Food', '6 hours', 'Décor', 'Tax'].forEach((s, i) => {
    const yy = y - h + 58 + i * 29;
    check(ctx, x - 90, yy, 11);
    ctx.textAlign = 'left'; ctx.font = F.sans(23); ctx.fillStyle = P.ink; ctx.fillText(s, x - 70, yy + 1);
  });
}
function scale(ctx, t) {
  const u = scaleUp(t);
  if (u <= 0.02) return;
  const th = theta(t);
  const e = ends(th);
  // post
  popup(ctx, PIV.x, FLOOR, u, (g) => pillar(g, 0, FLOOR - PIV.y - 10, 60));
  const bu = seg(t, T.scale + 0.25, T.scale + 0.45, ease.out) * fold(t, T.fold2, 540);
  if (bu <= 0.02) return;
  // pans + contents first (they hang below the beam)
  const pu = seg(t, T.scale + 0.38, T.scale + 0.6, ease.out) * fold(t, T.fold2, 540);
  const ea = { x: lerp(PIV.x, e.a.x, bu), y: lerp(PIV.y, e.a.y, bu) }, eb = { x: lerp(PIV.x, e.b.x, bu), y: lerp(PIV.y, e.b.y, bu) };
  if (pu > 0.05) {
    const sa = pan(ctx, ea, pu), sb = pan(ctx, eb, pu);
    // add-ons drop into A's pan, one per spoken item
    T.blk.forEach((tb, i) => {
      if (t < tb - 0.25 || pu < 0.9) return;
      const v = prog(t, tb - 0.25, tb);
      const yRest = sa - i * 50;
      const y = v < 1 ? lerp(680, yRest, ease.in(v)) : yRest; // drops from below the caption band
      const j = jit(t, 40 + i, 1);
      costBlock(ctx, ea.x + j.x, y, BLOCKS[i]);
    });
    if (t > T.bList - 0.2 && pu > 0.9) {
      const v = prog(t, T.bList - 0.2, T.bList + 0.15);
      inclCard(ctx, eb.x, v < 1 ? lerp(760, sb, ease.in(v)) : sb);
      if (t > T.cork - 0.2) { const c = prog(t, T.cork - 0.2, T.cork + 0.15); costBlock(ctx, eb.x, c < 1 ? lerp(700, sb - 200, ease.in(c)) : sb - 200, ['Corkage', '+300', 'spark'], 250); }
    }
  }
  // beam
  const L = BEAM * bu;
  const ca = Math.cos(th), sn = Math.sin(th);
  const bp = (dx, dy) => [PIV.x + dx * ca - dy * sn, PIV.y - dx * sn - dy * ca];
  facets(ctx, [
    { pts: [bp(-L, 14), bp(L, 14), bp(L, 0), bp(-L, 0)], c: P.gold, tone: 0.35 },
    { pts: [bp(-L, 0), bp(L, 0), bp(L, -14), bp(-L, -14)], c: P.gold, tone: -0.1 },
  ], { blur: 14, sx: 5, sy: 10 });
  heart(ctx, PIV.x, PIV.y - 6, 30, P.gold, { blur: 8 });
  // signs on the beam ends
  const su = seg(t, T.signs, T.signs + 0.25, ease.out) * fold(t, T.fold2, 540);
  if (su > 0.03) {
    ctx.save(); ctx.translate(0, 0);
    const fa = t < T.totA ? seg(t, T.priceA, T.priceA + 0.2, ease.out) : seg(t, T.totA, T.totA + 0.2, ease.out);
    const fb = t < T.totB ? seg(t, T.priceB, T.priceB + 0.2, ease.out) : seg(t, T.totB, T.totB + 0.2, ease.out);
    const guestsLit = t > T.guests - 0.1 && t < T.blk[0];
    ctx.globalAlpha = su;
    signCard(ctx, ea.x, ea.y - 14, 'QUOTE A', t < T.totA ? 'headline' : 'total', t < T.totA ? '4,000' : '10,100', t < T.totA ? (guestsLit ? 'for 80 guests' : 'hall only, 4 hours') : 'was 4,000', fa, 0);
    signCard(ctx, eb.x, eb.y - 14, 'QUOTE B', t < T.totB ? 'headline' : 'total', t < T.totB ? '8,500' : '8,800', t < T.totB ? (guestsLit ? 'for 120 guests' : 'package, 6 hours') : 'was 8,500', fb, rise(t, T.badge, 0.25) * fold(t, T.fold2, 780));
    ctx.restore();
  }
}
function illustrative(ctx, t) {
  const u = seg(t, T.illus, T.illus + 0.25, ease.out) * fold(t, T.fold2, 540);
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(540, 600); ctx.scale(1, u);
  tag(ctx, 'Illustrative figures only', 31);
  ctx.restore();
}

// ---------------------------------------------------------------- S3: guest count
const GX = [...Array(12).keys()].map((i) => 135 + i * 74);
function guests(ctx, t) {
  GX.forEach((x, i) => {
    const extra = i >= 8;
    const t0 = extra ? T.guestsExtra + (i - 8) * 0.08 : T.guests + i * 0.08;
    const u = rise(t, t0, 0.28) * fold(t, T.guestsFold, x);
    if (u <= 0.03) return;
    popup(ctx, x, FLOOR, u, (g) => person(g, 0, 0, 120, i % 2 ? 'B' : 'A', { col: extra ? P.rasp : [P.goldLight, P.blushDeep, P.gold, P.goldPale][i % 4], noFace: true }));
  });
  const pu = rise(t, T.plus40, 0.25) * fold(t, T.guestsFold, 820);
  if (pu > 0.03) {
    ctx.save(); ctx.translate(800, 1478); ctx.scale(pu, pu);
    tag(ctx, '+40 guests', 30);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- S7: written, itemised comparison sheet
const ROWS = ['Guest count', 'Food', 'Venue hours', 'Décor', 'Taxes', 'Listed extras'];
const SH = { x: 540, top: 680, w: 860, h: 900 };
function sheet(ctx, t) {
  if (t < T.sheet) return;
  const f = fold(t, T.fold3, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.sheet, T.sheet + 0.35), 1.6);
  const l = SH.x - SH.w / 2, r = SH.x + SH.w / 2, top = SH.top, h = SH.h * Math.min(1, u) * f;
  ctx.save();
  ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + SH.h * Math.min(1, u)], [l, top + SH.h * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  // header stamp
  const wu = rise(t, T.written, 0.25);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 76], [l, top + 76]], c: P.rasp, tone: 0.08 }], { shadow: false });
  if (wu > 0.05) { ctx.save(); ctx.translate(SH.x, top + 38); ctx.scale(wu, wu); ctx.fillStyle = P.cream; ctx.font = F.sansB(34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('WRITTEN · ITEMISED', 0, 2); ctx.restore(); }
  ctx.fillStyle = P.ink; ctx.font = F.serif(56); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (u > 0.8) { ctx.fillText('A', 700, top + 122); ctx.fillText('B', 870, top + 122); }
  ROWS.forEach((s, i) => {
    const y = top + 168 + i * 96;
    const ru = seg(t, T.rows + i * 0.12, T.rows + i * 0.12 + 0.22, ease.out);
    if (ru <= 0.03) return;
    const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 84], [l + 30, y + 84]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
    facets(ctx, [{ pts: hg.pts, c: hg.front ? (i % 2 ? P.blush : P.cream) : P.blushDeep, tone: (i % 2 ? -0.05 : 0.18) * Math.abs(hg.k) }], { blur: 8, sx: 3, sy: 6 });
    if (!hg.front || hg.k < 0.6) return;
    ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
    ctx.fillStyle = P.ink; ctx.font = F.sansB(36); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(s, l + 62, y + 43);
    const tk = T.ticks + i * T.tickGap;
    const cu = rise(t, tk, 0.2), cv = rise(t, tk + 0.1, 0.2);
    ctx.strokeStyle = P.inkSoft || P.ink; ctx.lineWidth = 3;
    [700, 870].forEach((cx, k) => {
      ctx.beginPath(); ctx.arc(cx, y + 42, 26, 0, TAU); ctx.strokeStyle = 'rgba(74,30,38,0.45)'; ctx.stroke();
      check(ctx, cx + 2, y + 38, 26 * (k ? cv : cu));
    });
    if (cv > 0.5) { ctx.fillStyle = P.goldDark; ctx.font = F.sansB(40); ctx.textAlign = 'center'; ctx.fillText('=', 785, y + 42); }
    ctx.restore();
  });
  // deposit coin waits until every row matches, then goes into the envelope
  const dy = top + 168 + 6 * 96 + 70;
  if (u > 0.9) {
    const v = seg(t, T.deposit, T.deposit + 0.4, ease.inOut);
    ctx.save(); ctx.translate(780, dy + 46); envelope(ctx, 130, 88, Math.PI * (1 - seg(t, T.deposit + 0.35, T.deposit + 0.55))); ctx.restore();
    if (v < 1) coin(ctx, lerp(520, 780, v), dy + lerp(0, 10, v) - Math.sin(v * Math.PI) * 60, 30, v * 4);
    ctx.fillStyle = P.ink; ctx.font = F.sansB(32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(t < T.deposit ? 'Deposit: wait' : 'Deposit: now', l + 62, dy);
    if (t > T.deposit + 0.5) check(ctx, 870, dy - 8, 26 * rise(t, T.deposit + 0.5, 0.2));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- crane (scene-change carrier)
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25;
function craneState(t) {
  const swoop = (t0, a, b, c, s, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s, phi: flapPhi(t, t0), dir, rot: dir * (u - 0.5) * 0.3 }; };
  if (t >= T.crane1 && t < T.crane1 + 0.55) return swoop(T.crane1, [1450, 760], [600, 1100], [-450, 900], 1.8, -1);
  if (t >= T.crane2 && t < T.crane2 + 0.55) return swoop(T.crane2, [-450, 900], [450, 1150], [1500, 760], 1.8, 1);
  if (t >= T.card + 0.5) {
    const u = ease.inOut(prog(t, T.card + 0.5, T.perch));
    const landed = t >= T.perch;
    const qx = (1 - u) * (1 - u) * 1250 + 2 * (1 - u) * u * 1060 + u * u * 770, qy = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 380 + u * u * 322;
    return { x: qx, y: qy, s: 0.44, phi: landed ? 0.18 : flapPhi(t, T.card), dir: -1, rot: 0 };
  }
  return null;
}

// ---------------------------------------------------------------- captions: folded strips, upper safe band
const CAPS = [
  [0.25, 2.3, ['The cheaper quote', 'can cost more']],
  [2.55, 6.2, ['Two made-up quotes:', '4,000 vs 8,500']],
  [6.42, 9.6, ['A assumes 80 guests;', "you're inviting 120"]],
  [9.82, 14.3, ['Food, hours, décor, tax,', 'cleaning: all extra']],
  [14.5, 16.25, ['B includes most of it']],
  [16.45, 20.2, ['Totals:', '10,100 vs 8,800']],
  [20.42, 22.5, ['Fees vary: get written,', 'itemised quotes']],
  [22.55, 26.15, ['Compare the same inclusions', 'before paying']],
];
const CAP_Y = 425; // strip centre: occupies y≈340-510, x≤990
function captions(ctx, t) {
  for (const [a, b, lines] of CAPS) {
    if (t < a || t > b + 0.25) continue;
    const u = seg(t, a, a + 0.25, ease.out) * (1 - seg(t, b, b + 0.25, ease.in));
    if (u <= 0.02) continue;
    let px = 66;
    ctx.font = F.serif(px);
    while (px > 50 && Math.max(...lines.map((s) => ctx.measureText(s).width)) > 740) { px -= 2; ctx.font = F.serif(px); }
    const tw = Math.max(...lines.map((s) => ctx.measureText(s).width));
    const w = Math.min(808, tw + 90), lh = px * 1.06, h = lines.length * lh + 36;
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
    const tail = (side) => ({ pts: [[side * (w / 2 - 20) * k, -h / 2 + 22], [side * (w / 2 + 40) * k, -h / 2 + 22], [side * (w / 2 + 20) * k, 6], [side * (w / 2 + 40) * k, h / 2 + 4], [side * (w / 2 - 20) * k, h / 2 + 4]], c: P.rasp, tone: -0.15 });
    facets(ctx, [tail(-1), tail(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [...half(-1), ...half(1)], { blur: 16, sx: 5, sy: 10 });
    if (k > 0.55) {
      ctx.save(); ctx.scale(k, 1);
      ctx.fillStyle = P.ink; ctx.font = F.serif(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((s, i) => ctx.fillText(s, 0, (i - (lines.length - 1) / 2) * lh + 4));
      ctx.restore();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- S8: end card (accepted test layout, new CTA)
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Request quotes · Compare details · Budget', x, 1080); g.globalAlpha = 1; }
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
    const by = 1240, bw = 780 * Math.min(1, bu), bh = 132;
    ctx.save(); ctx.translate(x, by);
    const tails = (s) => ({ pts: [[s * (bw / 2 - 30), -bh / 2 + 26], [s * (bw / 2 + 46), -bh / 2 + 26], [s * (bw / 2 + 24), 12], [s * (bw / 2 + 46), bh / 2 + 10], [s * (bw / 2 - 30), bh / 2 + 10]], c: P.raspDark, tone: 0 });
    facets(ctx, [tails(-1), tails(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [
      { pts: [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, 0], [-bw / 2, 0]], c: P.rasp, tone: 0.18 },
      { pts: [[-bw / 2, 0], [bw / 2, 0], [bw / 2, bh / 2], [-bw / 2, bh / 2]], c: P.rasp, tone: -0.08 },
    ], { blur: 18, sx: 6, sy: 12 });
    if (bu > 0.7) {
      const ix = -bw / 2 + 28, is = 88;
      ctx.save(); roundRect(ctx, ix, -is / 2, is, is, 20); ctx.clip(); ctx.drawImage(icon, ix, -is / 2, is, is); ctx.restore();
      ctx.strokeStyle = P.cream; ctx.lineWidth = 3; roundRect(ctx, ix, -is / 2, is, is, 20); ctx.stroke();
      ctx.fillStyle = P.cream; ctx.font = F.sansB(44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Download Plan My Wedding', 52, 2);
    }
    ctx.restore();
    if (bu > 0.9) { ctx.fillStyle = P.ink; ctx.font = F.sans(32); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('on Google Play', x, by + 108); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- frame
export function drawFrame(ctx, tReal) {
  const t = stepT(tReal);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = P.blush; ctx.fillRect(0, 0, W, H);
  backdrop(ctx);
  venues(ctx, t);
  guests(ctx, t);
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
