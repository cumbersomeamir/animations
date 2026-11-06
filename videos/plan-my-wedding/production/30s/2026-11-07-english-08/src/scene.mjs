// English episode: "200 photos delivered isn't 200 edited photos" (photography quote trap).
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); English
// caption strip, crane, card styling and end card as in production/30s/2026-11-06-english-07 (@016612d).
// New mechanisms: camera flash spilling 20 prints, a magnifier reading the fine print, prints splitting
// into retouched vs basic, quote terms unfolding with props, three question cards. The quote is fictional.
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

// ---------------------------------------------------------------- photo prints
/** state: 0 neutral print, 1 fully retouched (vivid, gold frame, sparkle), -1 basic colour only (flat) */
function print(ctx, x, y, s, rot, state, seed) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const frame = state > 0 ? P.goldLight : P.cream;
  facets(ctx, [{ pts: [[-46, -56], [46, -56], [46, 56], [-46, 56]], c: frame, tone: 0.2 }], { blur: 8, sx: 3, sy: 6 });
  const flat = state < 0;
  const sky = flat ? '#D9CFCB' : state > 0 ? P.raspLight : P.blushDeep;
  const hill = flat ? '#C7BDB9' : state > 0 ? P.gold : P.goldPale;
  facets(ctx, [
    { pts: [[-36, -46], [36, -46], [36, 30], [-36, 30]], c: sky, tone: flat ? 0 : 0.1 },
    { pts: [[-36, 30], [-8, -8], [20, 30]], c: hill, tone: flat ? 0 : 0.2 },
    { pts: [[0, 30], [24, 4], [36, 30]], c: hill, tone: flat ? -0.05 : -0.15 },
  ], { shadow: false, outline: false });
  ctx.fillStyle = flat ? '#E6DEDA' : P.cream; ctx.beginPath(); ctx.arc(18 - (seed % 3) * 14, -26, 9, 0, TAU); ctx.fill();
  if (state > 0) star4(ctx, 34, -50, 14, P.gold, P.goldDark);
  ctx.restore();
}
const GRID = (i) => ({ x: 400 + (i % 5) * 122, y: 800 + Math.floor(i / 5) * 140 });

// ---------------------------------------------------------------- S1 + S2: prints fan out, fine print splits them
function hook(ctx, t) {
  const f = fold(t, T.gridFold, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, f * 1.6); ctx.translate(0, 1000); ctx.scale(1, f); ctx.translate(0, -1000);
  // origami camera with flash on frame 0 (fully present on frame 0 so the first frame already reads)
  const cu = 1;
  if (cu > 0.03) { ctx.save(); ctx.translate(200, 1180); ctx.scale(1.55 * cu, 1.55 * cu); camera(ctx); ctx.restore(); }
  if (t >= T.flash && t < T.flash + 0.45) {
    const v = prog(t, T.flash, T.flash + 0.45);
    ctx.save(); ctx.globalAlpha = 1 - v;
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; facets(ctx, [{ pts: [[200, 1010], [200 + Math.cos(a - 0.1) * (60 + 220 * v), 1010 + Math.sin(a - 0.1) * (60 + 220 * v)], [200 + Math.cos(a + 0.1) * (60 + 220 * v), 1010 + Math.sin(a + 0.1) * (60 + 220 * v)]], c: P.cream, tone: 0.4 }], { shadow: false, outline: false }); }
    ctx.restore();
  }
  // 20 prints (1 print = 10 photos) fly from the lens into a grid
  for (let i = 0; i < 20; i++) {
    const t0 = T.prints + i * 0.06;
    const v = seg(t, t0, t0 + 0.35, ease.out);
    if (v <= 0) continue;
    const g = GRID(i);
    const x = lerp(240, g.x, v), y = lerp(1100, g.y, v) - Math.sin(v * Math.PI) * 140;
    const state = t >= T.retouched && i < 5 ? 1 : t >= T.basic && i >= 5 ? -1 : 0;
    const pop = state ? 1 + 0.1 * Math.sin(Math.PI * prog(t, i < 5 ? T.retouched : T.basic, (i < 5 ? T.retouched : T.basic) + 0.3)) : 1;
    print(ctx, x, y, (0.5 + 0.5 * v) * pop, (1 - v) * (i % 2 ? 0.6 : -0.6) + (i % 3 - 1) * 0.03, state, i);
  }
  // counter + legend
  if (t > T.prints) label(ctx, 640, 1395, `${Math.round(200 * ease.out(prog(t, T.prints, T.prints + 1.4)))} photos delivered`, 54, P.ink, F.serif);
  if (t > T.prints + 0.5) label(ctx, 640, 1450, '1 print = 10 photos', 28, 'rgba(74,30,38,0.7)', F.sans);
  // "edited?" question stamp
  const eq = rise(t, T.edited, 0.28) * (1 - seg(t, T.lens - 0.2, T.lens));
  tagAt(ctx, 640, 735, eq, 'how many edited?', 36);
  // fine print + magnifier: the lens reads "50 fully" first, then slides to "150 basic"
  const fp = seg(t, T.lens - 0.4, T.lens, ease.out);
  if (fp > 0.02) {
    const FP = '*50 fully retouched · 150 basic colour correction', FY = 1580, FS = 24;
    ctx.font = F.sans(FS); const w = (s) => ctx.measureText(s).width;
    const x0 = 640 - w(FP) / 2;
    const p50 = x0 + w('*') + w('50 fully') / 2, p150 = x0 + w('*50 fully retouched · ') + w('150 basic') / 2;
    ctx.save(); ctx.globalAlpha *= fp;
    label(ctx, 640, FY, FP, FS, 'rgba(74,30,38,0.75)', F.sans);
    ctx.restore();
    const lx = lerp(lerp(1000, p50, seg(t, T.lens, T.lens + 0.5, ease.inOut)), p150, seg(t, T.basic - 0.35, T.basic + 0.1, ease.inOut)), ly = FY, R = 116, Z = 1.9;
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, R, 0, TAU); ctx.clip();
    ctx.fillStyle = P.cream; ctx.fillRect(lx - R, ly - R, 2 * R, 2 * R);
    ctx.translate(lx, ly); ctx.scale(Z, Z); ctx.translate(-lx, -ly);
    label(ctx, 640, FY, FP, FS, P.ink, F.sansB);
    ctx.restore();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 11; ctx.beginPath(); ctx.arc(lx, ly, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx + 82, ly + 82); ctx.lineTo(lx + 140, ly + 140); ctx.stroke();
  }
  // split labels
  tagAt(ctx, 640, 742, rise(t, T.retouched + 0.1, 0.25), '50 fully retouched', 34);
  if (t > T.basic) tagAt(ctx, 850, 1300, rise(t, T.basic + 0.1, 0.25), '150 basic colour', 30);
  ctx.restore();
}
// 'Made-up quote' label stays above the grid and then the quote card, until the crane carries the card away
function madeUp(ctx, t) { tagAt(ctx, 540, 596, rise(t, T.tag, 0.25) * fold(t, T.crane + 0.05, 540), 'Made-up quote', 32); }

// ---------------------------------------------------------------- S3: the quote card terms
function calendar(ctx, x, y, flips) {
  facets(ctx, [{ pts: [[x - 44, y - 34], [x + 44, y - 34], [x + 44, y + 44], [x - 44, y + 44]], c: P.cream, tone: 0.05 }, { pts: [[x - 44, y - 50], [x + 44, y - 50], [x + 44, y - 26], [x - 44, y - 26]], c: P.rasp, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
  label(ctx, x, y + 6, String(Math.max(1, Math.min(12, Math.round(flips)))), 38, P.ink, F.serif);
  label(ctx, x, y + 34, 'weeks', 16, P.inkSoft || 'rgba(74,30,38,0.7)', F.sans);
}
function folder(ctx, x, y) {
  facets(ctx, [{ pts: [[x - 46, y - 30], [x - 10, y - 30], [x, y - 20], [x + 46, y - 20], [x + 46, y + 36], [x - 46, y + 36]], c: P.goldPale, tone: 0.15 }], { blur: 6, sx: 2, sy: 4 });
  label(ctx, x, y + 8, 'RAW', 22, P.ink, F.sansB);
}
function lock(ctx, x, y) {
  ctx.strokeStyle = P.ink; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y - 16, 20, Math.PI, 0); ctx.stroke();
  facets(ctx, [{ pts: [[x - 32, y - 16], [x + 32, y - 16], [x + 32, y + 34], [x - 32, y + 34]], c: P.gold, tone: 0.15 }], { blur: 6, sx: 2, sy: 4 });
}
const QROWS = [['Photos', '200 delivered · 50 fully retouched', null], ['Delivery', '12 weeks', 'delivery'], ['Raw files', 'extra cost', 'raw'], ['Usage', 'personal only', 'usage']];
function quote(ctx, t) {
  if (t < T.card - 0.05) return;
  const f = fold(t, T.crane + 0.05, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.card, T.card + 0.35), 1.6);
  const l = 100, r = 980, top = 690, hh = 860;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + hh * Math.min(1, u)], [l, top + hh * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 90], [l, top + 90]], c: P.rasp, tone: 0.08 }], { shadow: false });
  if (u > 0.4) { label(ctx, 540, top + 46, 'PHOTO PACKAGE', 40, P.cream); }
  if (u > 0.9) {
    QROWS.forEach(([k, v, key], i) => {
      const y = top + 130 + i * 175;
      const t0 = key ? T[key] : T.card + 0.2;
      const ru = seg(t, t0 - 0.05, t0 + 0.22, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 150], [l + 30, y + 150]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
      const hot = key && t > t0 && t < t0 + 1.4;
      facets(ctx, [{ pts: hg.pts, c: hg.front ? (hot ? P.blush : i % 2 ? '#F7ECE4' : P.cream) : P.blushDeep, tone: 0.14 * Math.abs(hg.k) }], { blur: 8, sx: 3, sy: 6 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      // prop on the left
      if (key === 'delivery') calendar(ctx, l + 110, y + 82, 1 + 11 * seg(t, T.delivery, T.delivery + 0.9, ease.out));
      else if (key === 'raw') { folder(ctx, l + 100, y + 78); if (t > T.raw + 0.15) coin(ctx, l + 150, y + 50, 22, t); }
      else if (key === 'usage') lock(ctx, l + 110, y + 78);
      else { print(ctx, l + 92, y + 76, 0.85, -0.05, 1, 2); print(ctx, l + 124, y + 82, 0.85, 0.08, -1, 4); }
      ctx.fillStyle = 'rgba(74,30,38,0.7)'; ctx.font = F.sansB(30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(k.toUpperCase(), l + 210, y + 50);
      ctx.fillStyle = hot ? P.rasp : P.ink; ctx.font = F.serif(i ? 56 : 44); ctx.fillText(v, l + 210, y + 104);
      ctx.restore();
    });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- S4: three questions before booking
const QS = [['How many are fully edited?', 'q1'], ['When will they arrive?', 'q2'], ['Which files and usage rights', 'q3', 'are included, in writing?']];
function questions(ctx, t) {
  if (t < T.header - 0.05) return;
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, 700); ctx.scale(1, f); ctx.translate(0, -700);
  const hu = rise(t, T.header, 0.3);
  if (hu > 0.03) {
    ctx.save(); ctx.translate(540, 720); ctx.scale(hu, hu);
    facets(ctx, [{ pts: [[-400, -50], [400, -50], [400, 50], [-400, 50]], c: P.rasp, tone: 0.1 }, { pts: [[-430, -30], [-400, -50], [-400, 50], [-430, 30]], c: P.raspDark, tone: 0 }, { pts: [[430, -30], [400, -50], [400, 50], [430, 30]], c: P.raspDark, tone: 0 }], { blur: 14, sx: 5, sy: 10 });
    label(ctx, 0, 2, '3 QUESTIONS BEFORE BOOKING', 40, P.cream);
    ctx.restore();
  }
  QS.forEach(([a, key, b], i) => {
    // three blank numbered slots fold in under the banner, each question then fills its slot as it is asked
    const u = ease.back(prog(t, T.header + 0.35 + i * 0.12, T.header + 0.67 + i * 0.12), 1.8);
    if (u <= 0.03) return;
    const y = 880 + i * 200;
    const qu = seg(t, T[key], T[key] + 0.25, ease.out), bump = 1 + 0.05 * Math.sin(Math.PI * prog(t, T[key], T[key] + 0.3));
    const hot = t > T[key] && t < (QS[i + 1] ? T[QS[i + 1][1]] : T.writing);
    ctx.save(); ctx.translate(540, y); ctx.scale(Math.min(1.05, u) * bump, Math.min(1.05, u) * bump);
    facets(ctx, [{ pts: [[-430, -80], [430, -80], [430, 80], [-430, 80]], c: hot ? P.blush : P.cream, tone: 0.16 }], { blur: 20, sx: 6, sy: 12 });
    facets(ctx, [{ pts: [[-410, -50], [-310, -50], [-310, 50], [-410, 50]], c: qu > 0.5 ? P.rasp : P.goldPale, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
    label(ctx, -360, 4, String(i + 1), 64, qu > 0.5 ? P.cream : P.goldDark, F.serif);
    if (qu > 0.02) {
      ctx.save(); ctx.globalAlpha *= qu; ctx.translate((1 - qu) * 40, 0);
      ctx.fillStyle = P.ink; ctx.font = F.sansB(b ? 38 : 42); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      if (b) { ctx.fillText(a, -280, -22); ctx.fillText(b, -280, 28); } else ctx.fillText(a, -280, 2);
      ctx.restore();
    } else {
      ctx.strokeStyle = 'rgba(74,30,38,0.18)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-270, -8); ctx.lineTo(260 - i * 60, -8); ctx.moveTo(-270, 24); ctx.lineTo(80 + i * 40, 24); ctx.stroke();
    }
    ctx.restore();
  });
  // "in writing": a sign-here line arrives with question 3, the signature is written as "in writing" is said, then the tag
  const lu = seg(t, T.q3 + 0.5, T.q3 + 0.9, ease.out);
  if (lu > 0) {
    const y = 1510;
    ctx.strokeStyle = 'rgba(74,30,38,0.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, y + 30); ctx.lineTo(150 + 420 * lu, y + 30); ctx.stroke();
    ctx.globalAlpha = lu; label(ctx, 150, y + 62, 'Signed quote', 26, 'rgba(74,30,38,0.7)', F.sans, 'left'); ctx.globalAlpha = 1;
    const su = seg(t, T.writing - 0.1, T.writing + 0.35, ease.inOut);
    if (su > 0) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = 0; k <= 40 * su; k++) { const v = k / 40; const x = 180 + v * 360, yy = y + Math.sin(v * 15) * 16 * (1 - v * 0.5) - v * 10; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
    }
  }
  const st = rise(t, T.writing + 0.3, 0.25);
  if (st > 0.03) { ctx.save(); ctx.translate(780, 1505); ctx.rotate(-0.06); ctx.scale(st, st); tag(ctx, 'In writing', 40); ctx.restore(); check(ctx, 900, 1473, 26 * st); }
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
  [0.18, 3.99, ["200 photos delivered isn't", '200 edited photos']],
  [4.44, 10.92, ['Made-up quote, fine print: 50 fully', 'retouched, the rest basic colour']],
  [11.37, 16.47, ['Delivery 12 weeks, raw files extra,', 'personal use only']],
  [16.98, 19.16, ['Before booking,', 'ask three questions']],
  [19.61, 20.92, ['1. How many are fully edited?']],
  [21.36, 22.36, ['2. When will they arrive?']],
  [22.81, 25.97, ['3. Which files and usage rights', 'are included, in writing?']],
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Vendors · Quotes · Budget', x, 1080); g.globalAlpha = 1; }
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
  hook(ctx, t);
  quote(ctx, t);
  madeUp(ctx, t);
  questions(ctx, t);
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
