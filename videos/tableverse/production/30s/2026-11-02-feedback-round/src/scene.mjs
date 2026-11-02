// "Four Groups of Three" — Pop-up Counting Storybook. drawFrame(ctx, f) renders frame f (pure function of f).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import {
  C, FONT, applyGrain, cutPoly, cutCircle, roundRectPts, pathFrom, piece, bounds, withShadow, noShadow, scoreLine, splitPin,
  appleSprite, APPLE_D, basketSprites, tinSprites, crateSprites, sparkle, label, measure,
} from './craft.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ geometry
export const PAGE = { x: 80, y: 612, w: 920, h: 628 }; // upright backdrop pages, hinged at the top
const PB = PAGE.y + PAGE.h; // 1240: where the backdrop meets the floor page
const FLOOR = { top: PB, bot: 1590, xt0: 80, xt1: 1000, xb0: 36, xb1: 1044 };
const SHELF_Y = 1132; // basket/tin base line on the backdrop
const BASKET_X = [0, 1, 2, 3].map((b) => 540 + (b - 1.5) * 216);
const TIN_X = [0, 1, 2].map((t) => 540 + (t - 1) * 286);
const BAKER = { x: 188, y: 1528 };
const SIGN = { x: 818, top: 1282, w: 230, h: 186 };
const CRATE = { x: 290, top: 1352, w: 330 };

const basketPos = (i) => [BASKET_X[Math.floor(i / 3)] + ((i % 3) - 1) * 62, 990];
const tinPos = (i) => [TIN_X[Math.floor(i / 4)] + ((i % 4) - 1.5) * 62, 1036];
const hoverPos = (i, f) => { const [x] = basketPos(i); return [x, 846 + Math.sin(f * 0.16 + i * 0.9) * 5]; };
// crate heap 5/4/3; apples leave from the top of the heap first
const CRATE_SLOTS = (() => {
  const cx = CRATE.x + CRATE.w / 2;
  const rows = [[3, 1246], [4, 1294], [5, 1342]];
  const s = [];
  for (const [n, y] of rows) for (let k = 0; k < n; k++) s.push([cx + (k - (n - 1) / 2) * 62, y]);
  return s; // index 0..2 top row, 3..6 middle, 7..11 bottom
})();
const launchF = (i) => T.BASKET_FILL[Math.floor(i / 3)] + (i % 3) * 10;

// ------------------------------------------------------------------ static layers (cached)
let BG = null;
function background() {
  if (BG) return BG;
  const c = createCanvas(W, H), x = c.getContext('2d');
  // wall
  const g = x.createLinearGradient(0, 0, 0, 1260);
  g.addColorStop(0, '#FBF4F8'); g.addColorStop(1, C.wall2);
  x.fillStyle = g; x.fillRect(0, 0, W, 1260);
  applyGrain(x, 0, 0, W, 1260, 0.05);
  // tabletop (warm light wood planks)
  const t = x.createLinearGradient(0, 1250, 0, H);
  t.addColorStop(0, '#F1D5AC'); t.addColorStop(1, '#E2B884');
  x.fillStyle = t; x.fillRect(0, 1250, W, H - 1250);
  const r = rng(5);
  for (let k = 0; k < 7; k++) {
    const y = 1290 + k * 95;
    x.fillStyle = 'rgba(150,95,45,0.18)'; x.fillRect(0, y, W, 3);
    x.strokeStyle = 'rgba(150,95,45,0.12)'; x.lineWidth = 2;
    for (let q = 0; q < 4; q++) { const yy = y + 18 + q * 18 + r() * 6; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(300, yy - 8, 700, yy + 10, W, yy - 2); x.stroke(); }
  }
  applyGrain(x, 0, 1250, W, H - 1250, 0.08);
  // book shadow on the table + wall shadow behind the backdrop
  x.save(); withShadow(x, 22, 0.25);
  x.fillStyle = '#FFFFFF';
  pathFrom(x, [[FLOOR.xb0 - 14, FLOOR.bot + 16], [FLOOR.xb1 + 14, FLOOR.bot + 16], [FLOOR.xt1 + 12, FLOOR.top], [FLOOR.xt0 - 12, FLOOR.top]]); x.fill();
  x.fillRect(PAGE.x - 16, PAGE.y - 30, PAGE.w + 32, PAGE.h + 30);
  x.restore();
  // violet cover boards under the floor page and behind the pages
  x.fillStyle = C.violet;
  pathFrom(x, cutPoly([[FLOOR.xb0 - 14, FLOOR.bot + 16], [FLOOR.xb1 + 14, FLOOR.bot + 16], [FLOOR.xt1 + 12, FLOOR.top - 4], [FLOOR.xt0 - 12, FLOOR.top - 4]], 3, 1, 20)); x.fill();
  x.fillRect(PAGE.x - 16, PAGE.y - 30, PAGE.w + 32, PAGE.h + 34);
  x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(PAGE.x - 16, PAGE.y - 30, PAGE.w + 32, 6);
  // page-stack thickness (several sheets) at the sides of the backdrop
  for (let k = 3; k >= 1; k--) {
    x.fillStyle = k % 2 ? '#EFE3CF' : '#FFF8EC';
    x.fillRect(PAGE.x - 3 * k, PAGE.y + 2, PAGE.w + 6 * k, PAGE.h + k * 2);
  }
  BG = c;
  return c;
}

let FLOOR_ART = null;
function floorArt() {
  if (FLOOR_ART) return FLOOR_ART;
  const c = createCanvas(W, H), x = c.getContext('2d');
  const quad = [[FLOOR.xt0, FLOOR.top], [FLOOR.xt1, FLOOR.top], [FLOOR.xb1, FLOOR.bot], [FLOOR.xb0, FLOOR.bot]];
  pathFrom(x, quad);
  x.fillStyle = C.cream; x.fill();
  x.save(); pathFrom(x, quad); x.clip();
  // perspective checker tiles (lilac print)
  const rowsY = [];
  for (let k = 0; k <= 7; k++) rowsY.push(FLOOR.top + (FLOOR.bot - FLOOR.top) * Math.pow(k / 7, 1.25));
  const vx = 540, vy = FLOOR.top - 900;
  for (let k = 0; k < 7; k++) {
    for (let q = -9; q < 9; q++) {
      if ((q + k) % 2 === 0) continue;
      const pts = [];
      for (const [qq, yy] of [[q, rowsY[k]], [q + 1, rowsY[k]], [q + 1, rowsY[k + 1]], [q, rowsY[k + 1]]]) {
        const xb = 540 + qq * 120; // x at the bottom edge
        const u = (yy - vy) / (FLOOR.bot - vy);
        pts.push([vx + (xb - vx) * u, yy]);
      }
      pathFrom(x, pts); x.fillStyle = 'rgba(209,152,250,0.28)'; x.fill();
    }
  }
  applyGrain(x, 0, FLOOR.top, W, FLOOR.bot - FLOOR.top, 0.08);
  // gutter shade where the backdrop meets the floor
  const gg = x.createLinearGradient(0, FLOOR.top, 0, FLOOR.top + 46);
  gg.addColorStop(0, 'rgba(60,30,80,0.30)'); gg.addColorStop(1, 'rgba(60,30,80,0)');
  x.fillStyle = gg; x.fillRect(0, FLOOR.top, W, 46);
  x.restore();
  scoreLine(x, FLOOR.xt0 + 6, FLOOR.top + 2, FLOOR.xt1 - 6, FLOOR.top + 2, 'rgba(42,22,80,0.28)', 2);
  FLOOR_ART = c;
  return c;
}

// page backgrounds (flat print), each a full-frame canvas; only the PAGE rect is used
const PAGE_ART = [];
function pageArt(n) {
  if (PAGE_ART[n]) return PAGE_ART[n];
  const c = createCanvas(W, PB + 4), x = c.getContext('2d');
  const R = [PAGE.x, PAGE.y, PAGE.w, PAGE.h];
  const pts = cutPoly([[R[0], R[1]], [R[0] + R[2], R[1]], [R[0] + R[2], R[1] + R[3]], [R[0], R[1] + R[3]]], 100 + n, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  if (n === 0) {
    // cover: violet board with a cut-paper title frame
    x.fillStyle = C.violet; x.fillRect(...R);
    const r = rng(3);
    for (let k = 0; k < 40; k++) sparkle(x, R[0] + r() * R[2], R[1] + r() * R[3], 5 + r() * 9, k % 3 ? 'rgba(209,152,250,0.55)' : 'rgba(249,227,14,0.65)');
    x.save(); withShadow(x, 8, 0.35, '10,0,40');
    piece(x, cutPoly(roundRectPts(150, 760, 780, 300, 40), 7, 1.4, 14), C.cream, { margin: 4, grainA: 0.08 });
    x.restore();
    label(x, 'Four Groups', 540, 850, 96, { fill: C.deep });
    label(x, 'of Three', 540, 960, 96, { fill: C.purple });
    label(x, 'a TableVerse story', 540, 1120, 40, { fill: '#F3E9FF', weight: 600 });
  } else if (n === 1 || n === 2) {
    // bakery wallpaper: soft stripes + tiny dots
    x.fillStyle = n === 1 ? '#FFF3E2' : '#FDF0F7'; x.fillRect(...R);
    for (let k = 0; k < 24; k++) { x.fillStyle = n === 1 ? 'rgba(209,152,250,0.20)' : 'rgba(145,31,249,0.10)'; x.fillRect(R[0] + k * 40, R[1], 18, R[3]); }
    const r = rng(20 + n);
    for (let k = 0; k < 80; k++) { x.fillStyle = 'rgba(57,12,214,0.12)'; x.beginPath(); x.arc(R[0] + r() * R[2], R[1] + 120 + r() * 380, 3, 0, Math.PI * 2); x.fill(); }
    // window with a sun (printed, flat)
    x.save(); withShadow(x, 4, 0.2);
    piece(x, cutPoly(roundRectPts(390, 742, 300, 190, 90), 30 + n, 1, 12), '#BFEFFF', { margin: 6, marginColor: C.violet, grainA: 0.06 });
    x.restore();
    x.fillStyle = 'rgba(249,227,14,0.9)'; x.beginPath(); x.arc(470, 820, 30, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [cx, cy, s] of [[590, 850, 26], [620, 840, 32], [650, 852, 24]]) { x.beginPath(); x.arc(cx, cy, s, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = C.violet; x.fillRect(536, 742, 8, 190); x.fillRect(390, 834, 300, 8);
    // hanging lamps
    for (const lx of [210, 870]) {
      x.strokeStyle = 'rgba(42,22,80,0.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(lx, 720); x.lineTo(lx, 790); x.stroke();
      x.save(); withShadow(x, 4, 0.2);
      piece(x, cutPoly([[lx - 34, 820], [lx + 34, 820], [lx + 18, 790], [lx - 18, 790]], lx, 0.8, 8), n === 1 ? C.orange : C.purple, { margin: 3, grainA: 0.06 });
      x.restore();
      x.fillStyle = 'rgba(249,227,14,0.55)'; x.beginPath(); x.arc(lx, 826, 9, 0, Math.PI * 2); x.fill();
    }
  } else if (n === 3) {
    // drawing page: kraft page with a pinned sheet of paper
    x.fillStyle = '#F3E2C4'; x.fillRect(...R);
    x.save(); withShadow(x, 6, 0.25);
    piece(x, cutPoly([[140, 680], [940, 676], [944, 1190], [136, 1194]], 9, 1.1, 14), '#FFFEFA', { margin: 0, grainA: 0.06 });
    x.restore();
    x.strokeStyle = 'rgba(57,12,214,0.12)'; x.lineWidth = 2;
    for (let yy = 730; yy < 1180; yy += 44) { x.beginPath(); x.moveTo(150, yy); x.lineTo(930, yy); x.stroke(); }
    for (const [tx, ty, a] of [[170, 690, -20], [910, 688, 18]]) {
      x.save(); x.translate(tx, ty); x.rotate(a * D2R); x.fillStyle = 'rgba(209,152,250,0.75)'; x.fillRect(-36, -12, 72, 24); x.restore();
    }
  } else if (n === 4) {
    // TableVerse end page: deep violet with sprinkled paper stars
    const g = x.createLinearGradient(0, R[1], 0, R[1] + R[3]);
    g.addColorStop(0, '#22107A'); g.addColorStop(1, C.deep);
    x.fillStyle = g; x.fillRect(...R);
    const r = rng(41);
    for (let k = 0; k < 60; k++) sparkle(x, R[0] + r() * R[2], R[1] + r() * R[3], 4 + r() * 9, k % 4 ? 'rgba(209,152,250,0.45)' : 'rgba(249,227,14,0.7)');
  }
  applyGrain(x, R[0], R[1], R[2], R[3], 0.07);
  x.restore();
  PAGE_ART[n] = c;
  return c;
}

// ------------------------------------------------------------------ pop-up helpers
/** pop-up rise: 0 = folded flat on its fold line, 1 = standing; outBack overshoot */
const rise = (f, f0, dur = 12) => (f < f0 ? 0 : E.outBack(clamp((f - f0) / dur)));
/** draw fn() scaled vertically about the fold line y (pop-up), with shading when low */
function popup(ctx, foldY, s, fn, shade = true) {
  if (s <= 0.01) return;
  ctx.save();
  ctx.translate(0, foldY);
  ctx.scale(1, Math.max(0.02, s));
  ctx.translate(0, -foldY);
  fn();
  ctx.restore();
}

// ------------------------------------------------------------------ pages with their pop-ups
function awning(ctx, f, s, colorA, colorB, seed) {
  popup(ctx, PAGE.y + 8, s, () => {
    const y0 = PAGE.y + 8, y1 = PAGE.y + 92;
    ctx.save(); withShadow(ctx, 7, 0.28);
    const n = 10, w = (PAGE.w + 40) / n;
    for (let k = 0; k < n; k++) {
      const x0 = PAGE.x - 20 + k * w;
      const pts = cutPoly([[x0, y0], [x0 + w, y0], [x0 + w, y1 - 18], ...arcPts(x0 + w / 2, y1 - 18, w / 2, 0, Math.PI, 8)], seed + k, 0.8, 10);
      piece(ctx, pts, k % 2 ? colorA : colorB, { margin: 2, grainA: 0.07 });
      noShadow(ctx); withShadow(ctx, 7, 0.28);
    }
    ctx.restore();
  });
}
function arcPts(cx, cy, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return pts;
}
function shelf(ctx, s, color) {
  popup(ctx, SHELF_Y + 2, s, () => {
    ctx.save(); withShadow(ctx, 8, 0.3);
    piece(ctx, cutPoly([[PAGE.x + 14, SHELF_Y], [PAGE.x + PAGE.w - 14, SHELF_Y], [PAGE.x + PAGE.w - 4, SHELF_Y + 34], [PAGE.x + 4, SHELF_Y + 34]], 88, 1.1, 14), color, { margin: 3, grainA: 0.12 });
    ctx.restore();
    scoreLine(ctx, PAGE.x + 20, SHELF_Y + 6, PAGE.x + PAGE.w - 20, SHELF_Y + 6, 'rgba(80,50,20,0.35)', 2);
  });
}
function drawApple(ctx, x, y, i, opts = {}) {
  const sp = appleSprite(i % 3);
  ctx.save();
  if (opts.lift !== undefined) withShadow(ctx, opts.lift, 0.3);
  ctx.translate(x, y);
  if (opts.rot) ctx.rotate(opts.rot);
  if (opts.scale) ctx.scale(opts.scale, opts.scale);
  ctx.drawImage(sp.img, -42, -52);
  ctx.restore();
}
function glowHalo(ctx, x, y, t, r = 170) {
  if (t < 0 || t > 16) return;
  const a = Math.sin((Math.PI * t) / 16);
  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, `rgba(255,236,120,${0.75 * a})`);
  g.addColorStop(1, 'rgba(255,236,120,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const rr = rng(Math.round(x));
  for (let k = 0; k < 7; k++) {
    const ang = (k / 7) * Math.PI * 2 + rr();
    const d = 70 + 70 * E.outCubic(t / 16);
    sparkle(ctx, x + Math.cos(ang) * d, y - 20 + Math.sin(ang) * d * 0.7, 11 * (1 - t / 16) + 3, k % 2 ? C.yellow : '#FFFFFF');
  }
}
function badge(ctx, x, y, text, s, fill = C.violet, ink = '#FFFFFF', r = 22) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  withShadow(ctx, 4, 0.3);
  piece(ctx, cutCircle(0, 0, r, r, Math.round(x + y), 0.6, 24), fill, { margin: 2.5, grainA: 0.05 });
  ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  label(ctx, text, 0, 1, r * 1.2, { fill: ink });
  ctx.restore();
}
function eqCard(ctx, f, f0, f1, line1, line2, fold = 0) {
  const s = rise(f, f0, 12) * (1 - fold);
  if (s <= 0.01) return;
  const top = 732, w = 780, h1 = 92;
  const flap = f < f1 ? 0 : E.outBack(clamp((f - f1) / 10)) * (1 - fold);
  popup(ctx, top + h1, s, () => {
    ctx.save(); withShadow(ctx, 9, 0.3);
    piece(ctx, cutPoly(roundRectPts(540 - w / 2, top, w, h1, 22), 51, 1.1, 14), C.cream, { margin: 3, grainA: 0.07 });
    ctx.restore();
    label(ctx, line1, 540, top + h1 / 2 + 2, 54, { fill: C.ink });
  });
  if (flap > 0.01) {
    // flap hinged under the first line unfolds downward
    const ft = top + h1 + 4, fh = 98;
    ctx.save();
    ctx.translate(0, ft); ctx.scale(1, Math.max(0.02, flap)); ctx.translate(0, -ft);
    withShadow(ctx, 9, 0.3);
    piece(ctx, cutPoly(roundRectPts(540 - 250, ft, 500, fh, 22), 52, 1.1, 14), C.yellow, { margin: 3, grainA: 0.07 });
    noShadow(ctx);
    label(ctx, line2, 540, ft + fh / 2 + 3, 78, { fill: C.deep });
    ctx.restore();
    scoreLine(ctx, 540 - 240, ft, 540 + 240, ft, 'rgba(42,22,80,0.35)', 2);
  }
}

/** page 1: bakery with four baskets (+ apples that are in the baskets) */
function drawPage1(ctx, f, fold = 0) {
  ctx.drawImage(pageArt(1), 0, 0);
  awning(ctx, f, rise(f, 22) * (1 - fold), C.violet, C.cream, 300);
  shelf(ctx, rise(f, 26) * (1 - fold), C.kraft);
  // the card folds back down just before the apples lift, so nothing hides the moving apples
  eqCard(ctx, f, T.CARD1, T.CARD1_LINE2, '4 groups of 3 = 12', '4 × 3 = 12', Math.max(fold, E.inOutCubic(prog(T.LIFT - 8, T.LIFT + 2, f))));
  const bs = basketSprites(200, 150);
  for (let b = 0; b < 4; b++) {
    const s = rise(f, T.BASKET_POP[b], 12) * (1 - fold);
    if (s <= 0.01) { scoreLine(ctx, BASKET_X[b] - 90, SHELF_Y - 2, BASKET_X[b] + 90, SHELF_Y - 2); continue; }
    const bx = BASKET_X[b] - 100 - bs.ox, by = SHELF_Y - bs.h - bs.oy;
    const glowT = f - T.GLOW[b];
    popup(ctx, SHELF_Y, s, () => {
      glowHalo(ctx, BASKET_X[b], SHELF_Y - 70, glowT);
      ctx.save(); withShadow(ctx, 6, 0.25); ctx.drawImage(bs.back.img, bx, by); ctx.restore();
      for (let j = 0; j < 3; j++) {
        const i = b * 3 + j;
        const st = appleState(i, f);
        if (st.where === 'basket') drawApple(ctx, st.x, st.y, i, { scale: st.scale });
      }
      ctx.save(); withShadow(ctx, 6, 0.25); ctx.drawImage(bs.front.img, bx, by); ctx.restore();
      if (glowT >= 0 && glowT < 16) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * Math.sin((Math.PI * glowT) / 16);
        ctx.drawImage(bs.front.img, bx, by); ctx.restore();
      }
      // "needs 3" tag on a string, flips down
      const tg = f < T.TAG_DROP[b] ? 0 : E.outBack(clamp((f - T.TAG_DROP[b]) / 10));
      if (tg > 0.01 && f < T.GLOW[b] + 10) {
        const tx = BASKET_X[b] + 74, ty = SHELF_Y - 112;
        const done = f >= T.GLOW[b];
        const a = 1 - prog(T.GLOW[b], T.GLOW[b] + 10, f);
        ctx.save(); ctx.globalAlpha *= a;
        ctx.translate(tx, ty); ctx.scale(1, tg); ctx.rotate(Math.sin(f * 0.12 + b) * 0.06);
        ctx.strokeStyle = 'rgba(42,22,80,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(0, 22); ctx.stroke();
        withShadow(ctx, 4, 0.25);
        piece(ctx, cutPoly([[-22, 22], [22, 22], [26, 64], [-26, 64]], 90 + b, 0.7, 8), done ? C.yellow : '#FFFFFF', { margin: 2, grainA: 0.05 });
        noShadow(ctx);
        label(ctx, '3', 0, 44, 34, { fill: C.purple });
        ctx.restore();
      }
    });
    // group badges 1..4 on the shelf lip
    const bgS = f < T.GROUP_BADGE[b] ? 0 : E.outBack(clamp((f - T.GROUP_BADGE[b]) / 9));
    if (bgS > 0 && f < T.LIFT) badge(ctx, BASKET_X[b], SHELF_Y + 18, String(b + 1), bgS * (1 - fold));
  }
}

/** page 2: pie table with three tins (+ apples in the tins, + recount badges) */
function drawPage2(ctx, f, fold = 0) {
  ctx.drawImage(pageArt(2), 0, 0);
  awning(ctx, f, rise(f, 540) * (1 - fold), C.purple, '#FFF3E2', 400);
  shelf(ctx, rise(f, 544) * (1 - fold), '#C9B6F2');
  eqCard(ctx, f, T.CARD2, T.CARD2_LINE2, '3 groups of 4 = 12', '3 × 4 = 12', fold);
  const ts = tinSprites(262, 92);
  for (let t = 0; t < 3; t++) {
    const s = rise(f, T.TIN_POP[t], 12) * (1 - fold);
    if (s <= 0.01) { scoreLine(ctx, TIN_X[t] - 120, SHELF_Y - 2, TIN_X[t] + 120, SHELF_Y - 2); continue; }
    const tx = TIN_X[t] - 131 - ts.ox, ty = SHELF_Y - ts.h - ts.oy;
    const glowT = f - T.TIN_GLOW[t];
    popup(ctx, SHELF_Y, s, () => {
      glowHalo(ctx, TIN_X[t], SHELF_Y - 60, glowT, 190);
      ctx.save(); withShadow(ctx, 5, 0.25); ctx.drawImage(ts.back.img, tx, ty); ctx.restore();
      for (let k = 0; k < 4; k++) {
        const i = t * 4 + k;
        const st = appleState(i, f);
        if (st.where === 'tin') drawApple(ctx, st.x, st.y, i, { scale: st.scale });
      }
      ctx.save(); withShadow(ctx, 5, 0.25); ctx.drawImage(ts.front.img, tx, ty); ctx.restore();
      if (glowT >= 0 && glowT < 16) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3 * Math.sin((Math.PI * glowT) / 16);
        ctx.drawImage(ts.front.img, tx, ty); ctx.restore();
      }
      // recount badges 1..12 above each apple
      for (let k = 0; k < 4; k++) {
        const i = t * 4 + k;
        const bf = T.RECOUNT + i * T.RECOUNT_STEP;
        if (f < bf) continue;
        const bs2 = E.outBack(clamp((f - bf) / 7)) * (1 - prog(714, 722, f));
        const [ax, ay] = tinPos(i);
        badge(ctx, ax, ay - 56, String(i + 1), bs2, C.yellow, C.deep, 24);
      }
    });
    const bgS = f < T.TIN_BADGE[t] ? 0 : E.outBack(clamp((f - T.TIN_BADGE[t]) / 9));
    if (bgS > 0) badge(ctx, TIN_X[t], SHELF_Y + 18, String(t + 1), bgS * (1 - fold));
  }
}

/** page 3: drawing equal groups (3 circles with 4 dots) */
const DRAW_CIRCLES = [260, 540, 820].map((x) => [x, 935]);
function drawPage3(ctx, f, fold = 0) {
  ctx.drawImage(pageArt(3), 0, 0);
  const total = T.DRAW_END - T.DRAW_START;
  const per = total / 3;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let g = 0; g < 3; g++) {
    const g0 = T.DRAW_START + g * per;
    const pc = clamp((f - g0) / (per * 0.62));
    const pd = clamp((f - g0 - per * 0.62) / (per * 0.38));
    const [cx, cy] = DRAW_CIRCLES[g];
    if (pc > 0) {
      ctx.strokeStyle = C.violet; ctx.lineWidth = 9;
      ctx.beginPath();
      const steps = Math.max(2, Math.round(60 * pc));
      for (let s = 0; s <= steps; s++) {
        const a = -Math.PI / 2 + (s / 60) * Math.PI * 2 * 1.03;
        const rr = 108 + Math.sin(a * 3 + g) * 4;
        const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.92;
        s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
    for (let d = 0; d < 4; d++) {
      if (pd * 4 <= d) continue;
      const dx = cx + (d % 2 ? 36 : -36), dy = cy + (d < 2 ? -34 : 34);
      ctx.fillStyle = C.purple;
      ctx.beginPath(); ctx.arc(dx, dy, 17, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // handwritten total under the drawing once all three groups exist
  if (f > T.DRAW_END - 4) {
    const a = prog(T.DRAW_END - 4, T.DRAW_END + 2, f);
    ctx.save(); ctx.globalAlpha *= a;
    label(ctx, '3 groups of 4 = 12', 540, 1120, 56, { fill: C.violet });
    ctx.restore();
  }
}
function pencilTip(f) {
  const total = T.DRAW_END - T.DRAW_START;
  const per = total / 3;
  const t = clamp((f - T.DRAW_START) / total) * 3;
  const g = Math.min(2, Math.floor(t));
  const local = t - g;
  const [cx, cy] = DRAW_CIRCLES[g];
  if (local < 0.62) {
    const a = -Math.PI / 2 + (local / 0.62) * Math.PI * 2 * 1.03;
    return [cx + Math.cos(a) * 108, cy + Math.sin(a) * 108 * 0.92];
  }
  const d = Math.min(3, Math.floor(((local - 0.62) / 0.38) * 4));
  return [cx + (d % 2 ? 36 : -36), cy + (d < 2 ? -34 : 34)];
}
function drawPencil(ctx, x, y, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(-38 * D2R);
  withShadow(ctx, 10, 0.3);
  piece(ctx, cutPoly([[0, 0], [22, -12], [22, 12]], 5, 0.4, 6), '#F2CFA0', { margin: 2, grainA: 0.05 });
  noShadow(ctx);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, -4.4); ctx.lineTo(8, 4.4); ctx.closePath(); ctx.fill();
  withShadow(ctx, 10, 0.3);
  piece(ctx, cutPoly([[22, -12], [170, -12], [170, 12], [22, 12]], 6, 0.6, 10), C.yellow, { margin: 2, grainA: 0.06 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(160,110,0,0.35)'; ctx.fillRect(22, 2, 148, 4);
  piece(ctx, cutPoly([[170, -12], [184, -12], [184, 12], [170, 12]], 7, 0.4, 6), '#BFC3D9', { grainA: 0 });
  piece(ctx, cutPoly(roundRectPts(184, -12, 26, 24, 8), 8, 0.5, 6), '#FF9EC0', { grainA: 0.05 });
  ctx.restore();
}

/** page 4: TableVerse end card */
function drawPage4(ctx, f) {
  ctx.drawImage(pageArt(4), 0, 0);
  const s = rise(f, T.CTA_POP, 14);
  const cx = 540, cy = 860, sz = 300;
  popup(ctx, cy + sz / 2 + 10, s, () => {
    ctx.save(); withShadow(ctx, 14, 0.45, '5,0,30');
    piece(ctx, cutPoly(roundRectPts(cx - sz / 2 - 10, cy - sz / 2 - 10, sz + 20, sz + 20, 74), 12, 1, 14), '#FFFFFF', { grainA: 0.04 });
    ctx.restore();
    ctx.save();
    pathFrom(ctx, roundRectPts(cx - sz / 2, cy - sz / 2, sz, sz, 66));
    ctx.clip();
    ctx.drawImage(ICON, cx - sz / 2, cy - sz / 2, sz, sz);
    ctx.restore();
  });
  scoreLine(ctx, cx - 170, cy + sz / 2 + 12, cx + 170, cy + sz / 2 + 12, 'rgba(255,255,255,0.35)', 2);
  // wordmark letters pop one by one
  const word = 'TableVerse', size = 120;
  ctx.save(); ctx.font = `700 ${size}px ${FONT}`;
  const ws = [...word].map((ch) => ctx.measureText(ch).width);
  const tot = ws.reduce((a, b) => a + b, 0);
  ctx.restore();
  let x = 540 - tot / 2;
  [...word].forEach((ch, i) => {
    const t = f - (T.CTA_POP + 6 + i * 2);
    const sc = t < 0 ? 0 : E.outBack(clamp(t / 8));
    if (sc > 0) {
      ctx.save();
      ctx.translate(x + ws[i] / 2, 1106);
      ctx.scale(sc, sc);
      ctx.font = `700 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#FFFDF8'; ctx.strokeText(ch, 0, 0);
      const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
      g.addColorStop(0, C.yellow); g.addColorStop(1, C.orange);
      ctx.fillStyle = g; ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    x += ws[i];
  });
  // "on Google Play" paper pill
  const ps = f < 826 ? 0 : E.outBack(clamp((f - 826) / 10));
  if (ps > 0) {
    ctx.save(); ctx.translate(540, 1196); ctx.scale(ps, ps);
    withShadow(ctx, 8, 0.4, '5,0,30');
    piece(ctx, cutPoly(roundRectPts(-200, -36, 400, 72, 36), 13, 0.9, 12), C.cream, { margin: 3, grainA: 0.05 });
    noShadow(ctx);
    label(ctx, 'on Google Play', 0, 2, 46, { fill: C.deep });
    ctx.restore();
  }
}

const PAGES = [
  (ctx, f) => ctx.drawImage(pageArt(0), 0, 0),
  drawPage1, drawPage2, drawPage3, drawPage4,
];

// ------------------------------------------------------------------ apple state machine
export function appleState(i, f) {
  const L = launchF(i);
  const [cx, cy] = CRATE_SLOTS[i];
  const [bx, by] = basketPos(i);
  if (f < L) return { where: 'crate', x: cx, y: cy };
  if (f < L + T.APPLE_FLIGHT) {
    const u = E.inOutSine((f - L) / T.APPLE_FLIGHT);
    const ctrl = [(cx + bx) / 2, Math.min(cy, by) - 170];
    const [x, y] = quadBezier([cx, cy], ctrl, [bx, by], u);
    return { where: 'fly', x, y, rot: Math.sin(u * Math.PI) * 0.5, scale: 1 + 0.12 * Math.sin(u * Math.PI), lift: 14 + 18 * Math.sin(u * Math.PI), track: { from: [cx, cy], ctrl, to: [bx, by], u } };
  }
  const lift0 = T.LIFT + i;
  if (f < lift0) {
    const land = f - (L + T.APPLE_FLIGHT);
    return { where: 'basket', x: bx, y: by + (land < 6 ? -Math.sin((land / 6) * Math.PI) * 6 : 0), scale: land < 4 ? 1.06 - land * 0.015 : 1 };
  }
  const g0 = T.REGROUP + i * 4;
  if (f < g0) {
    const u = clamp((f - lift0) / 14);
    const [hx, hy] = hoverPos(i, f);
    return { where: 'hover', x: bx, y: lerp(by, hy, E.outBack(u)), lift: 8 + 14 * u };
  }
  const [tx, ty] = tinPos(i);
  if (f < g0 + 18) {
    const u = E.inOutSine((f - g0) / 18);
    const [hx, hy] = hoverPos(i, g0);
    const ctrl = [(hx + tx) / 2, Math.min(hy, ty) - 120];
    const [x, y] = quadBezier([hx, hy], ctrl, [tx, ty], u);
    return { where: 'fly', x, y, rot: Math.sin(u * Math.PI) * 0.35, scale: 1 + 0.08 * Math.sin(u * Math.PI), lift: 22 - 10 * u, track: { from: [hx, hy], ctrl, to: [tx, ty], u } };
  }
  const land = f - (g0 + 18);
  return { where: 'tin', x: tx, y: ty + (land < 6 ? -Math.sin((land / 6) * Math.PI) * 5 : 0), scale: 1 };
}

// ------------------------------------------------------------------ baker puppet
function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: 1, rise: rise(f, 4, 12), lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'open', mouth: 'smile' };
  // blink
  const bp = f % 76;
  if (bp < 3) st.eyes = 'closed';
  const toward = (tx, ty) => {
    const sx = st.x + 40, sy = st.y - 140;
    return Math.atan2(tx - sx, ty - sy) / D2R;
  };
  if (f < 70) {
    // wave hello
    const w = prog(16, 24, f) * (1 - prog(62, 70, f));
    st.aR = lerp(14, 150, w); st.fR = lerp(10, 20 + 24 * Math.sin(f * 0.45), w);
    st.head = 4 * Math.sin(f * 0.2) * w;
  } else if (f < 96) {
    st.head = 2 * Math.sin(f * 0.1);
  } else if (f < 160) {
    // points up at the baskets while "each basket needs three"
    const p = prog(98, 108, f) * (1 - prog(150, 158, f));
    st.aR = lerp(14, toward(540, 1000), p); st.fR = lerp(10, 0, p);
    st.head = -6 * p;
  } else if (f < 380) {
    // tosses each apple from the crate
    let swing = 0;
    for (let i = 0; i < 12; i++) {
      const t = f - launchF(i);
      if (t > -5 && t < 8) swing = Math.max(swing, t < 0 ? (t + 5) / 5 : 1 - t / 8);
    }
    st.lean = 8;
    st.aR = 30 + 110 * E.inOutSine(swing); st.fR = 30 - 20 * swing;
    st.aL = 20; st.fL = 30;
    st.head = 8;
    for (const g of T.GLOW) {
      const t = f - g;
      if (t >= 0 && t < 12) { const c = Math.sin((Math.PI * t) / 12); st.aL = lerp(st.aL, 160, c); st.aR = lerp(st.aR, 160, c); st.hop = 16 * c; st.eyes = 'happy'; st.mouth = 'open'; st.lean = lerp(8, 0, c); }
    }
  } else if (f < 506) {
    // presents the card
    const p = prog(384, 394, f);
    st.aR = lerp(14, 148, p); st.fR = lerp(10, 18, p); st.aL = 30; st.fL = -110 * p; st.head = -5 * p;
    for (const g of T.GROUP_BADGE) { const t = f - g; if (t >= 0 && t < 8) st.hop = Math.max(st.hop, 6 * Math.sin((Math.PI * t) / 8)); }
  } else if (f < 556) {
    // magic lift gesture, then holds while the page turns
    const p = E.inOutSine(prog(506, 526, f));
    st.aL = lerp(20, 155, p); st.aR = lerp(20, 155, p); st.fL = lerp(10, 25, p); st.fR = lerp(10, 25, p);
    st.eyes = f > 512 ? 'happy' : st.eyes; st.mouth = 'open'; st.head = -6 * p;
  } else if (f < 636) {
    st.aL = 40; st.aR = 40; st.fL = 60; st.fR = 60; st.head = -4;
    for (const g of T.TIN_GLOW) {
      const t = f - g;
      if (t >= 0 && t < 10) { const c = Math.sin((Math.PI * t) / 10); st.aL = 40 + 30 * c; st.aR = 40 + 30 * c; st.fL = 60 + 40 * c; st.fR = 60 + 40 * c; st.eyes = 'happy'; st.hop = 8 * c; }
    }
  } else if (f < 724) {
    // points along the recount
    const k = clamp(Math.floor((f - T.RECOUNT) / T.RECOUNT_STEP), 0, 11);
    const [ax, ay] = tinPos(k);
    const p = prog(636, 644, f) * (1 - prog(704, 714, f));
    st.aR = lerp(14, toward(ax, ay - 20), p); st.fR = lerp(10, 0, p);
    st.head = -6 * p; st.aL = 20; st.fL = 20;
    if (f > 700 && f < 716) { st.eyes = 'happy'; st.hop = 8 * Math.sin(((f - 700) / 16) * Math.PI); }
  } else if (f < 800) {
    st.head = 6 * Math.sin(f * 0.18); st.aL = 30; st.fL = -100; st.aR = 30; st.fR = -100; // hands on tummy, watching the drawing
  } else {
    const w = prog(806, 814, f);
    st.aR = lerp(30, 150, w); st.fR = lerp(-100, 20 + 26 * Math.sin(f * 0.45), w); st.aL = lerp(30, 20, w); st.fL = lerp(-100, 10, w);
    st.eyes = 'happy'; st.mouth = f > 816 ? 'open' : 'smile';
    const t = f - 800; if (t >= 0 && t < 14) st.hop = 18 * Math.sin((Math.PI * t) / 14);
  }
  return st;
}

function drawBaker(ctx, st) {
  if (st.rise <= 0.01) { scoreLine(ctx, st.x - 40, st.y, st.x + 40, st.y); return; }
  ctx.save();
  ctx.translate(st.x, st.y - st.hop);
  ctx.scale(st.s, st.s * Math.max(0.03, st.rise));
  ctx.rotate(st.lean * D2R);
  withShadow(ctx, 7, 0.28);
  // legs + shoes
  for (const sx of [-1, 1]) {
    piece(ctx, cutPoly(roundRectPts(sx * 13 - 9, -52, 18, 50, 7), 200 + sx, 0.5, 8), C.deep, { margin: 2, grainA: 0.05 });
    piece(ctx, cutPoly(roundRectPts(sx * 13 - 15 + sx * 4, -10, 30, 14, 7), 210 + sx, 0.5, 8), C.ink, { margin: 2, grainA: 0 });
  }
  const arm = (side, a, fa) => {
    // side -1 = left (outward to -x), +1 = right
    const sh = [side * 38, -138];
    const d1 = [side * Math.sin(a * D2R), Math.cos(a * D2R)];
    const el = [sh[0] + d1[0] * 44, sh[1] + d1[1] * 44];
    const a2 = a + fa;
    const d2 = [side * Math.sin(a2 * D2R), Math.cos(a2 * D2R)];
    const hd = [el[0] + d2[0] * 40, el[1] + d2[1] * 40];
    const seg = (p, q, w, col, seed) => {
      const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * w / 2, ny = (dx / l) * w / 2;
      piece(ctx, cutPoly([[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]], seed, 0.5, 8), col, { margin: 2, grainA: 0.05 });
    };
    seg(sh, el, 20, '#FFFFFF', 220 + side);
    seg(el, hd, 18, '#FFFFFF', 230 + side);
    piece(ctx, cutCircle(hd[0], hd[1], 11, 11, 240 + side, 0.5, 14), '#E9B48C', { margin: 2, grainA: 0.05 });
    return [sh, el];
  };
  // back arm first
  const pinsL = arm(-1, st.aL, st.fL);
  // torso: chef jacket + violet apron
  piece(ctx, cutPoly([[-44, -50], [44, -50], [36, -150], [-36, -150]], 250, 0.8, 10), '#FFFFFF', { margin: 2, grainA: 0.06 });
  noShadow(ctx);
  piece(ctx, cutPoly([[-34, -54], [34, -54], [28, -128], [-28, -128]], 251, 0.7, 10), C.violet, { grainA: 0.08 });
  piece(ctx, cutPoly(roundRectPts(-16, -96, 32, 22, 6), 252, 0.4, 8), C.purple, { grainA: 0.05 });
  ctx.fillStyle = C.lilac; for (const by of [-136, -120]) { ctx.beginPath(); ctx.arc(0, by, 3.2, 0, Math.PI * 2); ctx.fill(); }
  withShadow(ctx, 7, 0.28);
  // head
  ctx.save();
  ctx.translate(0, -186);
  ctx.rotate(st.head * D2R);
  piece(ctx, cutCircle(0, 0, 36, 36, 260, 0.8, 30), '#F1C19A', { margin: 2, grainA: 0.06 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(255,120,140,0.45)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 20, 10, 7, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    if (st.eyes === 'open') { ctx.beginPath(); ctx.arc(sx * 12, -4, 4.6, 0, Math.PI * 2); ctx.fill(); }
    else if (st.eyes === 'happy') { ctx.beginPath(); ctx.arc(sx * 12, -1, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(sx * 12 - 5, -3); ctx.lineTo(sx * 12 + 5, -3); ctx.stroke(); }
  }
  if (st.mouth === 'open') { ctx.beginPath(); ctx.arc(0, 10, 9, 0, Math.PI); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, 6, 10, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke(); }
  // moustache-free friendly face; chef hat
  withShadow(ctx, 6, 0.25);
  piece(ctx, cutPoly(roundRectPts(-30, -52, 60, 22, 6), 270, 0.5, 8), '#FFFFFF', { margin: 2, grainA: 0.05 });
  noShadow(ctx);
  for (const [hx, hy, hr] of [[-20, -66, 18], [0, -78, 22], [20, -66, 18]]) piece(ctx, cutCircle(hx, hy, hr, hr, 280 + hx, 0.6, 20), '#FFFFFF', { grainA: 0.05, edge: 'rgba(40,20,60,0.18)' });
  ctx.fillStyle = C.lilac; ctx.fillRect(-30, -40, 60, 5);
  ctx.restore();
  withShadow(ctx, 7, 0.28);
  const pinsR = arm(1, st.aR, st.fR);
  noShadow(ctx);
  // brass split pins at the hinged joints (visible construction)
  for (const [p, q] of [pinsL, pinsR]) { splitPin(ctx, p[0], p[1], 5); splitPin(ctx, q[0], q[1], 4.5); }
  splitPin(ctx, 0, -152, 4.5);
  for (const sx of [-1, 1]) splitPin(ctx, sx * 13, -50, 4);
  ctx.restore();
  scoreLine(ctx, st.x - 46, st.y + 2, st.x + 46, st.y + 2, 'rgba(42,22,80,0.3)', 2);
}

// ------------------------------------------------------------------ floor props
function drawCrate(ctx, f, fold) {
  const cs = crateSprites(CRATE.w, 100);
  const s = rise(f, 14, 12) * (1 - fold);
  if (s <= 0.01) { scoreLine(ctx, CRATE.x, CRATE.top + 96, CRATE.x + CRATE.w, CRATE.top + 96); return; }
  popup(ctx, CRATE.top + 96, s, () => {
    ctx.save(); withShadow(ctx, 6, 0.25); ctx.drawImage(cs.back.img, CRATE.x - cs.ox, CRATE.top - cs.oy - 2); ctx.restore();
    for (let i = 11; i >= 0; i--) {
      const st = appleState(i, f);
      if (st.where === 'crate') drawApple(ctx, st.x, st.y, i, { lift: 4 });
    }
    ctx.save(); withShadow(ctx, 8, 0.3); ctx.drawImage(cs.front.img, CRATE.x - cs.ox, CRATE.top - cs.oy); ctx.restore();
  });
}
const SIGN_LEAD = 8; // the flip-card starts 8 frames early so the new number is showing on the glow frame
function signValue(f) {
  let v = 0;
  T.GLOW.forEach((g, b) => { if (f >= g - SIGN_LEAD) v = (b + 1) * 3; });
  return v;
}
function drawSign(ctx, f, fold) {
  const s = rise(f, 20, 12) * (1 - fold);
  const bx = SIGN.x - SIGN.w / 2, by = SIGN.top, base = by + SIGN.h;
  if (s <= 0.01) { scoreLine(ctx, bx, base, bx + SIGN.w, base); return; }
  popup(ctx, base, s, () => {
    ctx.save(); withShadow(ctx, 9, 0.3);
    piece(ctx, cutPoly(roundRectPts(bx, by, SIGN.w, SIGN.h, 22), 300, 1, 12), C.violet, { margin: 3, grainA: 0.08 });
    ctx.restore();
    label(ctx, 'TOTAL', SIGN.x, by + 30, 34, { fill: '#FFFFFF' });
    // flip-card number
    const v = signValue(f);
    let lastChange = -999;
    for (const g of T.GLOW) if (f >= g - SIGN_LEAD) lastChange = g - SIGN_LEAD;
    const t = f - lastChange;
    const prev = Math.max(0, v - 3);
    const card = (val, sy) => {
      const cy = by + 112;
      ctx.save();
      ctx.translate(SIGN.x, cy); ctx.scale(1, Math.max(0.02, sy)); ctx.translate(-SIGN.x, -cy);
      piece(ctx, cutPoly(roundRectPts(bx + 22, by + 54, SIGN.w - 44, 116, 16), 301, 0.8, 10), C.cream, { grainA: 0.06 });
      label(ctx, String(val), SIGN.x, cy + 4, 92, { fill: C.deep });
      ctx.restore();
    };
    if (t >= 0 && t < 8) {
      if (t < 4) card(prev, 1 - t / 4); else card(v, E.outBack((t - 4) / 4));
    } else card(v, 1);
    // one pulse when the recount confirms 12
    if (f >= 700 && f < 716) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * Math.sin(((f - 700) / 16) * Math.PI);
      ctx.fillStyle = C.yellow; pathFrom(ctx, roundRectPts(bx, by, SIGN.w, SIGN.h, 22)); ctx.fill(); ctx.restore();
    }
    scoreLine(ctx, bx + 10, base - 8, bx + SIGN.w - 10, base - 8, 'rgba(255,255,255,0.4)', 2);
  });
}

// ------------------------------------------------------------------ hinge bar, bunting, captions
function drawHingeBar(ctx) {
  ctx.save(); withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly(roundRectPts(PAGE.x - 24, PAGE.y - 34, PAGE.w + 48, 40, 14), 500, 1, 16), C.violet, { margin: 0, grainA: 0.1 });
  ctx.restore();
  for (let k = 0; k < 7; k++) {
    const rx = PAGE.x + 60 + k * ((PAGE.w - 120) / 6);
    ctx.lineWidth = 7; ctx.strokeStyle = C.brassDk; ctx.beginPath(); ctx.ellipse(rx, PAGE.y - 8, 9, 20, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = '#F2CB61'; ctx.stroke();
  }
}
function drawBunting(ctx, f) {
  const cols = [C.violet, C.cream, C.purple, C.lilac, C.orange, C.cream, C.violet, C.yellow, C.purple, C.lilac, C.cream];
  const sway = Math.sin(f * 0.05) * 6;
  const yAt = (x) => 120 + 70 * (1 - Math.pow((x - 540) / 600, 2)) + sway * Math.sin((x / 1080) * Math.PI);
  ctx.strokeStyle = 'rgba(42,22,80,0.45)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); for (let x = -20; x <= 1100; x += 20) (x === -20 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x))); ctx.stroke();
  for (let k = 0; k < 11; k++) {
    const x0 = 20 + k * 96, x1 = x0 + 70;
    const y0 = yAt(x0), y1 = yAt(x1);
    const sw = Math.sin(f * 0.08 + k) * 4;
    ctx.save(); withShadow(ctx, 5, 0.18);
    piece(ctx, cutPoly([[x0, y0], [x1, y1], [(x0 + x1) / 2 + sw, (y0 + y1) / 2 + 74]], 600 + k, 0.8, 9), cols[k % cols.length], { margin: 2, grainA: 0.06 });
    ctx.restore();
  }
}

function drawCaptions(ctx, f) {
  for (let ci = 0; ci < T.CAPTIONS.length; ci++) {
    const [lines, a, b] = T.CAPTIONS[ci];
    if (f < a || f >= b) continue;
    const prev = T.CAPTIONS[ci - 1];
    const next = T.CAPTIONS[ci + 1];
    const contIn = prev && prev[2] === a && prev[0][0] === lines[0];
    const contOut = next && next[1] === b && next[0][0] === lines[0];
    const pin = contIn ? 1 : E.outBack(clamp((f - a) / 7));
    const aIn = contIn ? 1 : clamp((f - a) / 4);
    const aOut = contOut || b >= T.FRAMES ? 1 : 1 - clamp((f - (b - 5)) / 5); // last caption holds to the final frame
    const size = 56, lh = 66;
    const wmax = Math.max(...lines.map((l) => measure(ctx, l, size)));
    const bw = Math.min(900, wmax + 64), bh = lines.length * lh + 30;
    const cy = 430;
    ctx.save();
    ctx.globalAlpha *= aIn * aOut;
    ctx.translate(540, cy);
    ctx.scale(0.92 + 0.08 * pin, 0.92 + 0.08 * pin);
    ctx.rotate(-0.6 * D2R);
    withShadow(ctx, 7, 0.22);
    piece(ctx, cutPoly(roundRectPts(-bw / 2, -bh / 2, bw, bh, 22), 700 + ci, 1.1, 16), '#FFFDF8', { margin: 0, grainA: 0.05, edge: 'rgba(57,12,214,0.35)' });
    noShadow(ctx);
    ctx.fillStyle = C.violet; ctx.fillRect(-bw / 2 + 18, -bh / 2 + 8, 6, bh - 16);
    lines.forEach((ln, k) => {
      const y = (k - (lines.length - 1) / 2) * lh + 3;
      // the newest count in a growing line gets a tiny pop
      label(ctx, ln, 0, y, size, { fill: C.ink });
    });
    ctx.restore();
  }
}

// ------------------------------------------------------------------ main
let BUF = null;
function pageIndexAt(f) {
  let n = 0;
  for (const [, , b] of T.FLIPS) if (f >= b) n++;
  return n;
}
function activeFlip(f) {
  for (const fl of T.FLIPS) if (f >= fl[1] && f < fl[2]) return fl;
  return null;
}

export function drawFrame(ctx, f) {
  if (!BUF) BUF = createCanvas(W, PB + 4);
  ctx.drawImage(background(), 0, 0);
  drawBunting(ctx, f);

  // ---- backdrop pages (flip-up page turns)
  const fl = activeFlip(f);
  if (fl) {
    const [pi, a, b] = fl;
    const p = E.inOutSine((f - a) / (b - a));
    PAGES[pi + 1](ctx, f, 0);
    // lifting page casts a soft shadow band onto the page beneath
    const s = Math.cos((p * Math.PI) / 2);
    const edge = PAGE.y + PAGE.h * s;
    const sg = ctx.createLinearGradient(0, edge, 0, edge + 80 * (1 - s) + 20);
    sg.addColorStop(0, `rgba(40,20,60,${0.35 * (1 - s * 0.5)})`); sg.addColorStop(1, 'rgba(40,20,60,0)');
    ctx.fillStyle = sg; ctx.fillRect(PAGE.x, edge, PAGE.w, 100);
    const bctx = BUF.getContext('2d');
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, W, PB + 4);
    PAGES[pi](bctx, f, p);
    ctx.save();
    ctx.translate(0, PAGE.y);
    ctx.scale(1, Math.max(0.01, s));
    ctx.drawImage(BUF, 0, PAGE.y, W, PAGE.h + 4, 0, 0, W, PAGE.h + 4);
    ctx.fillStyle = `rgba(40,20,70,${0.4 * p})`; ctx.fillRect(PAGE.x, 0, PAGE.w, PAGE.h);
    // rim light on the lifting bottom edge
    ctx.fillStyle = `rgba(255,255,255,${0.6 * p})`; ctx.fillRect(PAGE.x, PAGE.h - 6, PAGE.w, 6);
    ctx.restore();
  } else {
    PAGES[pageIndexAt(f)](ctx, f, 0);
  }
  drawHingeBar(ctx);

  // ---- floor page + its pop-ups
  ctx.drawImage(floorArt(), 0, 0);
  const floorFold = E.inOutCubic(prog(792, 806, f));
  drawCrate(ctx, f, floorFold);
  drawSign(ctx, f, floorFold);
  drawBaker(ctx, bakerState(f));

  // ---- apples in flight / hovering (front layer) + their dotted paper tracks
  for (let i = 0; i < 12; i++) {
    const st = appleState(i, f);
    if (st.where === 'fly') {
      const { from, ctrl, to, u } = st.track;
      ctx.save();
      ctx.fillStyle = `rgba(57,12,214,${0.45 * Math.sin(Math.PI * u) + 0.1})`;
      for (let k = 0; k <= 18; k++) {
        const q = quadBezier(from, ctrl, to, k / 18);
        ctx.beginPath(); ctx.arc(q[0], q[1], 3.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      drawApple(ctx, st.x, st.y, i, { rot: st.rot, scale: st.scale, lift: st.lift });
    } else if (st.where === 'hover') {
      drawApple(ctx, st.x, st.y, i, { lift: st.lift });
    }
  }
  // pencil on the drawing page
  if (f >= 738 && f < 790) {
    const [px, py] = f < T.DRAW_START ? pencilTip(T.DRAW_START) : pencilTip(Math.min(f, T.DRAW_END));
    const a = clamp((f - 738) / 4) * (1 - prog(784, 790, f));
    const lift = f > T.DRAW_END ? (f - T.DRAW_END) * 10 : 0;
    drawPencil(ctx, px + lift * 0.6, py - lift, a);
  }

  drawCaptions(ctx, f);

  // ---- warm light pool + vignette + whole-frame paper tooth
  const lg = ctx.createRadialGradient(540, 980, 120, 540, 980, 1100);
  lg.addColorStop(0, 'rgba(255,244,214,0.10)'); lg.addColorStop(1, 'rgba(60,30,70,0.22)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  applyGrain(ctx, 0, 0, W, H, 0.035, 'overlay');
}
