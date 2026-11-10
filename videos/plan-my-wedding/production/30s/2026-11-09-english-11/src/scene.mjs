// English episode: the budget adds up but the due dates don't. Three fictional vendors each take a deposit and
// a balance; the deposits spread out, the balances stack in the final month. Accepted origami-world recipe:
// lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); caption strip, crane, end card as in english-10.
// New mechanisms: paper bill envelopes stacking on month shelves past a "what one month can cover" line, a
// written payment schedule with a refundable column, a savings jar and an IN WRITING stamp. No amounts shown.
import { loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, check, tag, camera, coin } from './models.mjs';
import { T } from './cues.mjs';

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
const tagAt = (ctx, x, y, u, text, px = 30) => { if (u <= 0.03) return 0; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); tag(ctx, text, px); ctx.restore(); ctx.font = F.sansB(px); return ctx.measureText(text).width + 34; };
function label(ctx, x, y, text, px, col = P.ink, font = F.sansB, align = 'center') { ctx.fillStyle = col; ctx.font = font(px); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); }




// ---------------------------------------------------------------- vendors, bills and the month columns
const COLX = [200, 540, 880];
const SHELF = 1490, LIMIT = 1262;
const VEND = [
  { name: 'Venue', key: 'venue', seal: P.raspLight, depCol: 0 },
  { name: 'Caterer', key: 'caterer', seal: P.gold, depCol: 1 },
  { name: 'Photographer', key: 'photo', seal: P.goldDark, depCol: 1 },
];
const DEP = { w: 236, h: 80 }, BAL = { w: 266, h: 150 };
function venueIcon(ctx, x, y, s) {
  facets(ctx, [
    { pts: [[x - 26 * s, y], [x + 26 * s, y], [x + 26 * s, y - 30 * s], [x - 26 * s, y - 30 * s]], c: P.cream, tone: 0.1 },
    { pts: [[x - 32 * s, y - 30 * s], [x + 32 * s, y - 30 * s], [x, y - 54 * s]], c: P.rasp, tone: 0.05 },
    { pts: [[x - 7 * s, y], [x + 7 * s, y], [x + 7 * s, y - 16 * s], [x - 7 * s, y - 16 * s]], c: P.goldDark, tone: 0 },
  ], { blur: 4, sx: 1, sy: 3 });
}
function clocheIcon(ctx, x, y, s) {
  const pts = [];
  for (let k = 0; k <= 8; k++) { const a = Math.PI + (k / 8) * Math.PI; pts.push([x + Math.cos(a) * 30 * s, y - 8 * s + Math.sin(a) * 30 * s]); }
  facets(ctx, [{ pts, c: P.goldLight, tone: 0.15 }, { pts: [[x - 38 * s, y - 8 * s], [x + 38 * s, y - 8 * s], [x + 34 * s, y], [x - 34 * s, y]], c: P.cream, tone: -0.05 }], { blur: 4, sx: 1, sy: 3 });
  ctx.fillStyle = P.goldDark; ctx.beginPath(); ctx.arc(x, y - 40 * s, 4 * s, 0, TAU); ctx.fill();
}
function bill(ctx, x, y, w, h, seal, who, kind, rot = 0) {
  // folded paper bill envelope, base centre at (x, y)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  facets(ctx, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h], [-w / 2, -h]], c: P.cream, tone: 0.06 },
    { pts: [[-w / 2, -h], [w / 2, -h], [0, -h * 0.6]], c: P.cream, tone: 0.26 },
  ], { blur: 10, sx: 4, sy: 7 });
  ctx.fillStyle = seal; ctx.beginPath(); ctx.arc(0, -h * 0.6, Math.min(14, h * 0.2), 0, TAU); ctx.fill();
  ctx.fillStyle = P.ink; ctx.font = F.sansB(kind === 'balance' ? 30 : 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${who} ${kind}`, 0, -Math.min(18, h * 0.18));
  ctx.restore();
}
function vendorCard(ctx, v, i, u) {
  if (u <= 0.03) return;
  const x = [230, 540, 850][i], y = 660;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.translate(-x, -y);
  facets(ctx, [{ pts: [[x - 135, y - 58], [x + 135, y - 58], [x + 135, y + 58], [x - 135, y + 58]], c: P.cream, tone: 0.14 }], { blur: 16, sx: 5, sy: 10 });
  facets(ctx, [{ pts: [[x - 135, y - 58], [x + 135, y - 58], [x + 135, y - 46], [x - 135, y - 46]], c: v.seal, tone: 0 }], { shadow: false });
  if (i === 0) venueIcon(ctx, x - 82, y + 30, 0.95);
  else if (i === 1) clocheIcon(ctx, x - 82, y + 26, 0.95);
  else { ctx.save(); ctx.translate(x - 82, y + 30); ctx.scale(0.42, 0.42); camera(ctx); ctx.restore(); }
  label(ctx, x - 36, y + 6, v.name, i === 2 ? 30 : 34, P.ink, F.sansB, 'left');
  ctx.restore();
}
function bang(ctx, x, y, u) {
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  facets(ctx, [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * TAU) / 6; return { pts: [[0, 0], [Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a + TAU / 6) * 30, Math.sin(a + TAU / 6) * 30]], c: P.cream, tone: Math.cos(a + 2.4) * 0.15 }; }), { blur: 6, sx: 2, sy: 4 });
  label(ctx, 0, 2, '!', 42, P.rasp, F.serif);
  ctx.restore();
}

function calendar(ctx, t) {
  const f = fold(t, T.crane + 0.05, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, 1075); ctx.scale(1, f); ctx.translate(0, -1075);
  // month shelves and labels
  const labels = ['6 months before', '3 months before', 'final month'];
  COLX.forEach((x, i) => {
    const hot = i === 2 && t > T.month && t < T.crane;
    facets(ctx, [
      { pts: [[x - 150, SHELF], [x + 150, SHELF], [x + 136, SHELF + 22], [x - 136, SHELF + 22]], c: hot ? P.rasp : P.goldLight, tone: 0.12 },
    ], { blur: 10, sx: 4, sy: 8 });
    label(ctx, x, SHELF + 56, labels[i], 30, hot ? P.rasp : P.ink, F.sansB);
  });
  // wedding marker next to the final month
  const wu = rise(t, T.wedding, 0.3);
  if (wu > 0.03) { ctx.save(); ctx.translate(880, SHELF + 98); ctx.scale(wu, wu); heart(ctx, -96, 2, 18, P.rasp); label(ctx, 14, 2, 'wedding', 28, P.rasp, F.sans); ctx.restore(); }
  // the line: what one month can comfortably cover
  const lu = t < T.reset ? 1 : seg(t, T.balances - 0.3, T.balances + 0.2, ease.out);
  const flash = (t > T.dont && t < T.dont + 0.6) || (t > T.month && t < T.month + 0.8) ? 1 : 0;
  if (lu > 0.02) {
    ctx.save(); ctx.globalAlpha = lu; ctx.strokeStyle = flash ? P.rasp : 'rgba(179,47,63,0.6)'; ctx.lineWidth = flash ? 6 : 4; ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.moveTo(90, LIMIT); ctx.lineTo(990, LIMIT); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 96, LIMIT - 26, 'what one month can cover', 28, P.rasp, F.sansB, 'left');
    ctx.restore();
  }
  // hook: the finished stack teeters; then everything flies back up and the plan replays
  const hookA = t < T.reset ? 1 : 1 - seg(t, T.reset, T.reset + 0.35, ease.in);
  const replay = t >= T.reset + 0.35;
  const deps = VEND.map((v, i) => ({ v, i, col: v.depCol, t0: T.dep + i * 0.2 }));
  // deposits
  const colCount = [0, 0, 0];
  deps.forEach(({ v, i, col, t0 }) => {
    const slot = colCount[col]++;
    const by = SHELF - slot * (DEP.h + 8);
    let x = COLX[col], y = by, a = 1, rot = (i % 2 ? 1 : -1) * 0.02;
    if (!replay) { y -= (1 - hookA) * 900; a = hookA; }
    else {
      const u = seg(t, t0, t0 + 0.4, ease.out);
      if (u <= 0) return;
      x = lerp(COLX[i], COLX[col], u); y = lerp(760, by, u) - Math.sin(u * Math.PI) * 60; rot *= u;
    }
    const glow = t > T.spread && t < T.spread + 1.2 ? 1 : 0;
    ctx.save(); ctx.globalAlpha *= a;
    if (glow) { ctx.fillStyle = 'rgba(195,144,76,0.25)'; ctx.fillRect(x - DEP.w / 2 - 10, y - DEP.h - 10, DEP.w + 20, DEP.h + 20); }
    bill(ctx, x, y, DEP.w, DEP.h, v.seal, v.name === 'Photographer' ? 'Photo' : v.name, 'deposit', rot);
    ctx.restore();
  });
  // "spread out" brace over the deposits
  const su = seg(t, T.spread, T.spread + 0.3, ease.out) * (1 - seg(t, T.balances - 0.2, T.balances + 0.1));
  if (su > 0.02) { ctx.save(); ctx.globalAlpha = su; ctx.strokeStyle = P.goldDark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(80, 1306); ctx.quadraticCurveTo(80, 1276, 370, 1276); ctx.quadraticCurveTo(660, 1276, 660, 1306); ctx.stroke(); ctx.restore(); tagAt(ctx, 370, 1268, su, 'spread out', 32); }
  // balances: hang under each card, then all drop into the final month
  const sway = (t < T.reset ? Math.sin(t * 5) * 0.035 + (t > T.dont ? Math.sin((t - T.dont) * 9) * 0.03 : 0) : t > T.month && t < T.crane ? Math.sin((t - T.month) * 6) * 0.03 : 0);
  ctx.save(); ctx.translate(880, SHELF); ctx.rotate(sway); ctx.translate(-880, -SHELF);
  VEND.forEach((v, i) => {
    const by = SHELF - i * (BAL.h + 8);
    let x = 880, y = by, a = 1, rot = (i - 1) * 0.025;
    if (!replay) { y -= (1 - hookA) * 900; a = hookA; if (i === 2 && t > T.dont) { x += 26 * seg(t, T.dont, T.dont + 0.4, ease.out); rot += 0.1 * seg(t, T.dont, T.dont + 0.4, ease.out); } }
    else {
      const hang = rise(t, T.bal + i * 0.1, 0.3);
      if (hang <= 0.03) return;
      const t0 = T.balances + 0.06 + i * 0.3;
      const u = seg(t, t0, t0 + 0.32, ease.in);
      x = lerp(COLX[i], 880, u); y = lerp(900, by, u); rot = lerp(Math.sin(t * 3 + i) * 0.05, rot, u);
      if (u <= 0) { ctx.save(); ctx.translate(x, y - BAL.h); ctx.scale(hang, hang); ctx.translate(-x, -(y - BAL.h)); bill(ctx, x, y, BAL.w, BAL.h, v.seal, v.name === 'Photographer' ? 'Photo' : v.name, 'balance', rot); ctx.restore(); return; }
    }
    ctx.save(); ctx.globalAlpha *= a; bill(ctx, x, y, BAL.w, BAL.h, v.seal, v.name === 'Photographer' ? 'Photo' : v.name, 'balance', rot); ctx.restore();
  });
  ctx.restore();
  // alarm over the stack (hook + once the balances land together)
  const bu = t < T.reset ? hookA * (0.9 + 0.3 * Math.sin(Math.PI * prog(t, T.dont, T.dont + 0.3))) : rise(t, T.month, 0.3) * (1 - seg(t, T.crane - 0.1, T.crane + 0.1));
  bang(ctx, 1010, 990, bu);
  ctx.restore();
  // hook receipt: the total fits
  tagAt(ctx, 540, 700, rise(t, T.adds, 0.3) * (1 - seg(t, T.reset, T.reset + 0.3)), 'Budget total: fits', 34);
  if (t > T.adds + 0.2 && t < T.reset + 0.3) check(ctx, 700, 670, 24 * (1 - seg(t, T.reset, T.reset + 0.3)));
  // vendor cards (replay)
  const vf = fold(t, T.crane + 0.05, 540);
  VEND.forEach((v, i) => vendorCard(ctx, v, i, rise(t, T[v.key], 0.3) * vf));
  tagAt(ctx, 540, 596, rise(t, T.tag, 0.25) * vf, 'Made-up plan', 30);
}

// ---------------------------------------------------------------- S3: the written payment schedule
const ROWS = [
  ['Venue deposit', '6 months before', 0], ['Caterer deposit', '3 months before', 1], ['Photo deposit', '3 months before', 2],
  ['Venue balance', 'final month', 0], ['Caterer balance', 'final month', 1], ['Photo balance', 'final month', 2],
];
function schedule(ctx, t) {
  if (t < T.card - 0.05) return;
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.card, T.card + 0.35), 1.6);
  const l = 90, r = 990, top = 600, hh = 940;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + hh * Math.min(1, u)], [l, top + hh * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 80], [l, top + 80]], c: P.rasp, tone: 0.08 }], { shadow: false });
  if (u > 0.4) label(ctx, 540, top + 42, 'PAYMENT SCHEDULE', 40, P.cream);
  if (u > 0.9) {
    label(ctx, l + 40, top + 112, 'PAYMENT', 24, 'rgba(74,30,38,0.6)', F.sansB, 'left');
    ctx.globalAlpha = seg(t, T.due - 0.1, T.due + 0.2); label(ctx, 520, top + 112, 'DUE', 24, 'rgba(74,30,38,0.6)', F.sansB, 'left'); ctx.globalAlpha = 1;
    ctx.globalAlpha = seg(t, T.refund - 0.1, T.refund + 0.2); label(ctx, 880, top + 112, 'REFUNDABLE?', 24, P.rasp, F.sansB); ctx.globalAlpha = 1;
    const heavy = seg(t, T.heavy, T.heavy + 0.3, ease.out);
    ROWS.forEach(([pay, due, vi], i) => {
      const y = top + 140 + i * 86;
      const t0 = T.list + i * 0.18;
      const ru = seg(t, t0 - 0.05, t0 + 0.22, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 24, y], [r - 24, y], [r - 24, y + 76], [l + 24, y + 76]], [l + 24, y], [r - 24, y], (1 - ru) * Math.PI * 0.95);
      const hot = i >= 3 && heavy > 0.5;
      facets(ctx, [{ pts: hg.pts, c: hg.front ? (hot ? P.blush : i % 2 ? '#F7ECE4' : P.cream) : P.blushDeep, tone: 0.12 * Math.abs(hg.k) }], { blur: 6, sx: 2, sy: 4 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      ctx.fillStyle = VEND[vi].seal; ctx.beginPath(); ctx.arc(l + 56, y + 38, 11, 0, TAU); ctx.fill();
      label(ctx, l + 80, y + 38, pay, 32, P.ink, F.sansB, 'left');
      const du = seg(t, T.due + i * 0.08, T.due + i * 0.08 + 0.2, ease.out);
      if (du > 0) { ctx.save(); ctx.globalAlpha *= du; label(ctx, 520, y + 38, due, 32, hot ? P.rasp : P.ink, hot ? F.sansB : F.sans, 'left'); ctx.restore(); }
      const qu = rise(t, T.refund + 0.1 + i * 0.1, 0.25);
      if (qu > 0.03) { ctx.save(); ctx.translate(880, y + 38); ctx.scale(qu, qu); facets(ctx, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * TAU) / 8; return { pts: [[0, 0], [Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a + TAU / 8) * 24, Math.sin(a + TAU / 8) * 24]], c: P.goldPale, tone: Math.cos(a + 2.4) * 0.16 }; }), { blur: 4, sx: 1, sy: 3 }); label(ctx, 0, 2, '?', 34, P.rasp, F.serif); ctx.restore(); }
      ctx.restore();
    });
    // heavy-month brace beside the three balances
    if (heavy > 0.02) { ctx.save(); ctx.globalAlpha = heavy; ctx.strokeStyle = P.rasp; ctx.lineWidth = 5; const y0 = top + 140 + 3 * 86 + 6, y1 = top + 140 + 6 * 86 - 16; ctx.beginPath(); ctx.moveTo(l + 14, y0); ctx.lineTo(l + 4, y0); ctx.lineTo(l + 4, y1); ctx.lineTo(l + 14, y1); ctx.stroke(); ctx.restore(); }
    // savings jar: start saving early for that heavy month
    const ju = rise(t, T.saving, 0.3);
    if (ju > 0.03) {
      const jx = 250, jy = 1500;
      ctx.save(); ctx.translate(jx, jy); ctx.scale(ju, ju);
      const fill = seg(t, T.saving + 0.1, T.saving + 1.1, ease.out);
      facets(ctx, [{ pts: [[-62, 0], [62, 0], [70, -110], [-70, -110]], c: P.cream, tone: 0.2 }], { blur: 12, sx: 4, sy: 8 });
      facets(ctx, [{ pts: [[-60, -2], [60, -2], [60 + 8 * fill, -2 - 90 * fill], [-60 - 8 * fill, -2 - 90 * fill]], c: P.gold, tone: 0.1 }], { shadow: false });
      facets(ctx, [{ pts: [[-74, -110], [74, -110], [74, -126], [-74, -126]], c: P.goldDark, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
      for (let k = 0; k < 5; k++) { const tk = T.saving + 0.1 + k * 0.2; const v = prog(t, tk, tk + 0.25); if (v > 0 && v < 1) coin(ctx, lerp(-10 + k * 6, 0, v), lerp(-220, -60 - fill * 40, v), 16, t * 3); }
      ctx.restore();
      label(ctx, jx + 100, jy - 70, 'saved early for', 26, 'rgba(74,30,38,0.75)', F.sans, 'left');
      label(ctx, jx + 100, jy - 38, 'the final month', 26, P.rasp, F.sansB, 'left');
    }
    // signature + IN WRITING stamp
    const sg = seg(t, T.writing - 0.15, T.writing + 0.3, ease.inOut);
    if (t > T.schedule - 0.1) { ctx.strokeStyle = 'rgba(74,30,38,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(600, 1490); ctx.lineTo(600 + 340 * seg(t, T.schedule - 0.1, T.schedule + 0.3, ease.out), 1490); ctx.stroke(); label(ctx, 600, 1514, 'signed schedule', 24, 'rgba(74,30,38,0.6)', F.sans, 'left'); }
    if (sg > 0) { ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); for (let k = 0; k <= 40 * sg; k++) { const v = k / 40, x = 610 + v * 300, yy = 1470 + Math.sin(v * 14) * 14 * (1 - v * 0.5) - v * 8; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
    const st = rise(t, T.writing + 0.35, 0.25);
    if (st > 0.03) { ctx.save(); ctx.translate(800, 1400); ctx.rotate(-0.08); ctx.scale(st, st); ctx.strokeStyle = P.rasp; ctx.lineWidth = 5; ctx.strokeRect(-130, -32, 260, 64); label(ctx, 0, 2, 'IN WRITING', 38, P.rasp, F.sansB); ctx.restore(); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- crane (scene-change carrier)
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25;
function craneState(t) {
  const swoop = (t0, a, b, c, s, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s, phi: flapPhi(t, t0), dir, rot: dir * (u - 0.5) * 0.3 }; };
  if (t >= T.crane && t < T.crane + 0.55) return swoop(T.crane, [-450, 900], [450, 1150], [1500, 760], 1.8, 1);
  if (t >= T.end + 0.5) {
    const u = ease.inOut(prog(t, T.end + 0.5, T.perch));
    const landed = t >= T.perch;
    const qx = (1 - u) * (1 - u) * 1250 + 2 * (1 - u) * u * 1060 + u * u * 770, qy = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 380 + u * u * 322;
    return { x: qx, y: qy, s: 0.44, phi: landed ? 0.18 : flapPhi(t, T.end), dir: -1, rot: 0 };
  }
  return null;
}

// ---------------------------------------------------------------- captions: accepted English folded strip
const CAPS = [
  [0.18, 2.39, ['The budget adds up.', "The due dates don't."]],
  [2.77, 8.66, ['Made-up plan: venue, caterer and', 'photographer: a deposit, then a balance']],
  [9.04, 14.78, ['Deposits spread out, but all three', 'balances land just before the wedding']],
  [15.16, 21.04, ['Before you sign, list every due date,', 'and start saving early for that month']],
  [21.42, 26.0, ["Ask what's refundable if plans change;", 'get the whole schedule in writing']],
];
const CAP_Y = 425;
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

// ---------------------------------------------------------------- S5: end card (accepted English layout)
const EC = { x: 540, y: 930, w: 880, h: 1180 };
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function endCard(ctx, t) {
  if (t < T.end) return;
  const { x, y, w, h } = EC;
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  const slide = 1 - ease.out(prog(t, T.end, T.end + 0.2));
  ctx.save(); ctx.translate(0, slide * 900);
  const open = seg(t, T.end + 0.15, T.end + 0.45, ease.inOut);
  const k = Math.cos((1 - open) * Math.PI);
  const content = (g) => {
    const eu = rise(t, T.end + 0.4, 0.3);
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Budget · Checklist · Vendors', x, 1080); g.globalAlpha = 1; }
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
  const bu = rise(t, T.banner2, 0.3);
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
  calendar(ctx, t);
  schedule(ctx, t);
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
