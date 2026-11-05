// English episode: "Guest count isn't meal count" (buffet planning).
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); English
// caption strip (Cormorant), crane and end card from production/30s/2026-11-03-round-02 (@935acf6).
// New mechanisms: RSVP cards pouring into a pile vs a meal counter, cards sorting into adult / child trays,
// vendor crew plates, a caterer ticket with three meal types, a confirm-in-writing checklist with signature.
// All figures are a fictional example; no portion formula.
import { loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, person, check, tag, camera } from './models.mjs';
import { T } from './cues.mjs';

const FLOOR = 1640;
const grain = makeGrain(5);
let icon = null;
export async function init() { icon = await loadImage('assets/app-icon-play.png'); }
const rise = (t, t0, dur = 0.32) => (t < t0 ? 0 : t < t0 + dur ? ease.back(prog(t, t0, t0 + dur), 2.2) : 1);
const fold = (t, t0, x = 540) => 1 - seg(t, t0 + (x / W) * 0.2, t0 + (x / W) * 0.2 + 0.28, ease.in);
const countUp = (t, t0, t1, n) => Math.round(n * ease.out(prog(t, t0, t1)));

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
const tagAt = (ctx, x, y, u, text, px = 30) => { if (u <= 0.03) return; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); tag(ctx, text, px); ctx.restore(); };
function label(ctx, x, y, text, px, col = P.ink, font = F.sansB) { ctx.fillStyle = col; ctx.font = font(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); }

// ---------------------------------------------------------------- props
function rsvpCard(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  facets(ctx, [
    { pts: [[-60, -40], [60, -40], [60, 40], [-60, 40]], c: P.cream, tone: 0.18 },
    { pts: [[-60, -40], [60, -40], [0, 4]], c: P.cream, tone: -0.06 },
  ], { blur: 8, sx: 3, sy: 6 });
  check(ctx, 18, 14, 18);
  ctx.fillStyle = P.rasp; ctx.font = F.sansB(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('YES', -24, 18);
  ctx.restore();
}
function plate(ctx, x, y, r, c = P.goldLight, food = P.rasp) {
  const list = [];
  for (let i = 0; i < 8; i++) { const a0 = (i / 8) * TAU, a1 = ((i + 1) / 8) * TAU; list.push({ pts: [[x, y], [x + Math.cos(a0) * r, y + Math.sin(a0) * r * 0.55], [x + Math.cos(a1) * r, y + Math.sin(a1) * r * 0.55]], c, tone: Math.cos((a0 + a1) / 2 + 2.3) * 0.35 }); }
  facets(ctx, list, { blur: 6, sx: 2, sy: 4 });
  if (food) { ctx.fillStyle = food; ctx.beginPath(); ctx.ellipse(x - r * 0.15, y - 2, r * 0.32, r * 0.15, 0, 0, TAU); ctx.fill(); }
}
function tray(ctx, x, y, w, h, title, col) {
  facets(ctx, [
    { pts: [[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 20, y + h], [x - w / 2 + 20, y + h]], c: P.cream, tone: 0.12 },
    { pts: [[x - w / 2, y - 54], [x + w / 2, y - 54], [x + w / 2, y], [x - w / 2, y]], c: col, tone: 0.1 },
  ], { blur: 18, sx: 6, sy: 12 });
  label(ctx, x, y - 26, title, 32, P.cream);
}
/** small person token (adult or child) */
function guestToken(ctx, x, y, child, c) {
  const s = child ? 0.62 : 1;
  facets(ctx, [
    { pts: [[x - 13 * s, y], [x + 13 * s, y], [x + 6 * s, y - 34 * s], [x - 6 * s, y - 34 * s]], c, tone: 0.15 },
  ], { blur: 4, sx: 2, sy: 3 });
  ctx.fillStyle = '#E9C9AE'; ctx.beginPath(); ctx.arc(x, y - 42 * s, 9 * s, 0, TAU); ctx.fill();
}

// ---------------------------------------------------------------- S1: 150 RSVPs vs meals
const PILE = { x: 290, y: 1180 };
const CARDS = (() => { const r = rng(7); return Array.from({ length: 14 }, (_, i) => ({ sx: 1200 + r() * 200, sy: 600 + r() * 500, dx: (r() - 0.5) * 120, dy: -i * 14, rot: (r() - 0.5) * 0.5, t0: T.cards + i * 0.12 })); })();
function hook(ctx, t) {
  const f = fold(t, T.crane1 + 0.1, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, FLOOR); ctx.scale(1, f); ctx.translate(0, -FLOOR);
  // RSVP cards fly in from the right on frame 0 and stack into a pile
  CARDS.forEach((c) => {
    const v = seg(t, c.t0 - 0.12, c.t0 + 0.3, ease.out);
    if (v <= 0) return;
    const x = lerp(c.sx, PILE.x + c.dx, v), y = lerp(c.sy, PILE.y + c.dy, v) - Math.sin(v * Math.PI) * 120;
    rsvpCard(ctx, x, y, 1.6, c.rot * v + (1 - v) * 1.2);
  });
  const n = countUp(t, T.count, T.count + 1.6, 150);
  label(ctx, PILE.x, 1400, `${n} RSVPs`, 72, P.ink, F.serif);
  // the "isn't equal" sign folds in
  const q = rise(t, T.neq, 0.3);
  if (q > 0.03) {
    ctx.save(); ctx.translate(540, 1150); ctx.scale(q * 1.3, q * 1.3);
    facets(ctx, [{ pts: [[-46, -46], [46, -46], [46, 46], [-46, 46]], c: P.rasp, tone: 0.12 }], { blur: 12, sx: 4, sy: 8 });
    ctx.strokeStyle = P.cream; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, -12); ctx.lineTo(26, -12); ctx.moveTo(-26, 14); ctx.lineTo(26, 14); ctx.moveTo(18, -34); ctx.lineTo(-18, 36); ctx.stroke();
    ctx.restore();
  }
  // plate stack with an open question
  const pu = rise(t, T.plates, 0.3);
  if (pu > 0.03) {
    ctx.save(); ctx.translate(800, 1290); ctx.scale(pu * 1.25, pu * 1.25);
    for (let i = 0; i < 6; i++) plate(ctx, 0, -i * 22, 90, P.goldLight, i === 5 ? P.rasp : null);
    ctx.restore();
    label(ctx, 800, 1400, '? meals', 72, P.rasp, F.serif);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- S2/S3: trays (adults, children, vendors)
const TA = { x: 300, y: 860, w: 400, h: 380 }, TC = { x: 780, y: 860, w: 380, h: 170 }, TV = { x: 780, y: 1230, w: 380, h: 220 };
function trays(ctx, t) {
  if (t < T.trays - 0.05) return;
  const f = fold(t, T.ticket - 0.2, 540);
  if (f <= 0.02) return;
  const u = rise(t, T.trays, 0.32) * f;
  ctx.save(); ctx.translate(0, 1300); ctx.scale(1, u); ctx.translate(0, -1300);
  tray(ctx, TA.x, TA.y, TA.w, TA.h, 'ADULTS', P.rasp);
  tray(ctx, TC.x, TC.y, TC.w, TC.h, 'CHILDREN', P.gold);
  // adult tokens: 22 x 6 = 132
  for (let i = 0; i < 22; i++) {
    const t0 = T.adults + Math.floor(i / 6) * 0.12;
    const v = seg(t, t0, t0 + 0.14, ease.out);
    if (v <= 0.05) continue;
    const col = i % 6, row = Math.floor(i / 6);
    ctx.save(); ctx.translate(TA.x - 150 + col * 60, TA.y + 80 + row * 78); ctx.scale(v, v); guestToken(ctx, 0, 0, false, [P.goldPale, P.raspLight, P.goldLight][i % 3]); ctx.restore();
  }
  // child tokens: 3 x 6 = 18
  for (let i = 0; i < 3; i++) {
    const v = seg(t, T.kids + i * 0.12, T.kids + i * 0.12 + 0.14, ease.out);
    if (v <= 0.05) continue;
    ctx.save(); ctx.translate(TC.x - 80 + i * 80, TC.y + 105); ctx.scale(v, v); guestToken(ctx, 0, 0, true, P.goldLight); ctx.restore();
  }
  if (t > T.adults) label(ctx, TA.x, TA.y + TA.h + 44, `${countUp(t, T.adults, T.adults + 0.6, 132)} adults`, 60, P.ink, F.serif);
  if (t > T.kids) label(ctx, TC.x, TC.y + TC.h + 44, `${countUp(t, T.kids, T.kids + 0.4, 18)} children`, 60, P.ink, F.serif);
  label(ctx, 540, 1540, '1 figure = 6 guests', 28, 'rgba(74,30,38,0.7)', F.sans);
  // vendors tray: photographer + DJ, then 8 crew plates
  if (t > T.photog - 0.1) {
    tray(ctx, TV.x, TV.y, TV.w, TV.h, 'VENDOR CREW', P.raspDark);
    popup(ctx, TV.x - 110, TV.y + 200, rise(t, T.photog, 0.3), (g) => { person(g, 0, 0, 170, 'A', { col: P.rasp, arms: [0.3, -1.6] }); g.save(); g.translate(34, -150); g.scale(0.32, 0.32); camera(g); g.restore(); });
    popup(ctx, TV.x - 10, TV.y + 200, rise(t, T.dj, 0.3), (g) => {
      person(g, 0, 0, 170, 'B', { col: P.gold });
      g.strokeStyle = P.ink; g.lineWidth = 6; g.beginPath(); g.arc(0, -150, 22, Math.PI, 0); g.stroke();
      g.fillStyle = P.ink; g.fillRect(-27, -152, 10, 18); g.fillRect(17, -152, 10, 18);
    });
    for (let i = 0; i < 8; i++) {
      const t0 = T.crew + i * 0.07;
      const v = seg(t, t0 - 0.15, t0, ease.in);
      if (v <= 0) continue;
      const tx = TV.x + 80 + (i % 2) * 70, ty = TV.y + 190 - Math.floor(i / 2) * 26;
      plate(ctx, tx, lerp(TV.y - 60, ty, v), 32, P.goldLight, null);
    }
    if (t > T.crew) label(ctx, TV.x, TV.y + TV.h + 44, `${countUp(t, T.crew, T.crew + 0.5, 8)} crew meals`, 60, P.ink, F.serif);
  }
  ctx.restore();
  // fictional example label
  const eu = rise(t, T.tag, 0.25) * f;
  tagAt(ctx, 540, 596, eu, 'Made-up example', 30);
}

// ---------------------------------------------------------------- S4: caterer ticket
const ROWS4 = [['Adult meals', '132', P.goldLight, P.rasp], ['Child meals', '18', P.goldPale, P.gold], ['Vendor meals', '8', P.blushDeep, null]];
function ticket(ctx, t) {
  if (t < T.ticket - 0.05) return;
  const f = fold(t, T.crane2 + 0.1, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.ticket, T.ticket + 0.35), 1.6);
  const x0 = 170, x1 = 910, top = 700, h = 780 * Math.min(1, u);
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  // zig-zag torn bottom edge, like a printed order slip
  const zig = []; for (let x = x0; x <= x1; x += 37) zig.push([x, top + h + ((x - x0) / 37 % 2 ? 14 : 0)]);
  facets(ctx, [{ pts: [[x0, top], [x1, top], ...zig.reverse()], c: P.cream, tone: 0.14 }], { blur: 24, sx: 8, sy: 14 });
  if (u > 0.9) {
    label(ctx, 540, top + 60, 'CATERER ORDER', 40, P.rasp);
    ctx.strokeStyle = 'rgba(74,30,38,0.3)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0 + 40, top + 110); ctx.lineTo(x1 - 40, top + 110); ctx.stroke(); ctx.setLineDash([]);
    ROWS4.forEach(([lab, n, pc, food], i) => {
      const v = seg(t, T.rows[i], T.rows[i] + 0.22, ease.out);
      if (v <= 0.05) return;
      const y = top + 190 + i * 120;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, v); ctx.translate(0, -y);
      const ty = rise(t, T.types + i * 0.12, 0.25);
      if (ty > 0.03) { ctx.save(); ctx.translate(x0 + 80, y); ctx.scale(ty, ty); plate(ctx, 0, 0, 46, pc, food); ctx.restore(); }
      ctx.fillStyle = P.ink; ctx.font = F.sansB(42); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(lab, x0 + 150, y);
      ctx.font = F.serif(64); ctx.textAlign = 'right'; ctx.fillText(n, x1 - 50, y + 2);
      ctx.restore();
    });
    const tv = rise(t, T.total, 0.28);
    if (tv > 0.03) {
      const y = top + 600;
      ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 + 40, y - 70); ctx.lineTo(x1 - 40, y - 70); ctx.stroke();
      ctx.save(); ctx.translate(540, y); ctx.scale(tv, tv);
      facets(ctx, [{ pts: [[-330, -54], [330, -54], [330, 54], [-330, 54]], c: P.rasp, tone: 0.1 }], { blur: 12, sx: 4, sy: 8 });
      ctx.fillStyle = P.cream; ctx.font = F.serif(70); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('158 meals', 0, 4);
      ctx.restore();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- S5: confirm-in-writing checklist (accepted sheet)
const ITEMS = ['Adult meal count', 'Child meal count', 'Vendor meals', 'Dietary needs', 'Serving time', 'Final-count deadline'];
const SH = { x: 540, top: 680, w: 880, h: 860 };
function sheet(ctx, t) {
  if (t < T.sheet) return;
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.sheet, T.sheet + 0.35), 1.6);
  const l = SH.x - SH.w / 2, r = SH.x + SH.w / 2, top = SH.top;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + SH.h * Math.min(1, u)], [l, top + SH.h * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 84], [l, top + 84]], c: P.rasp, tone: 0.08 }], { shadow: false });
  if (u > 0.4) label(ctx, SH.x, top + 44, 'CONFIRM IN WRITING', 38, P.cream);
  if (u > 0.9) {
    ITEMS.forEach((s, i) => {
      const y = top + 112 + i * 104;
      const ru = seg(t, T.sheet + 0.3 + i * 0.1, T.sheet + 0.5 + i * 0.1, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 88], [l + 30, y + 88]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
      facets(ctx, [{ pts: hg.pts, c: hg.front ? (i % 2 ? P.blush : P.cream) : P.blushDeep, tone: (i % 2 ? -0.05 : 0.18) * Math.abs(hg.k) }], { blur: 8, sx: 3, sy: 6 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      ctx.fillStyle = P.ink; ctx.font = F.sansB(38); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, l + 62, y + 46);
      ctx.beginPath(); ctx.arc(r - 100, y + 44, 26, 0, TAU); ctx.strokeStyle = 'rgba(74,30,38,0.45)'; ctx.lineWidth = 3; ctx.stroke();
      check(ctx, r - 98, y + 40, 26 * rise(t, T.ticks[i], 0.2));
      ctx.restore();
    });
    // signature only after every line is confirmed
    const su = seg(t, T.sign, T.sign + 0.45, ease.inOut);
    if (su > 0) {
      const y = top + 790;
      ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = 0; k <= 40 * su; k++) { const v = k / 40; const x = l + 80 + v * 320, yy = y + Math.sin(v * 15) * 14 * (1 - v * 0.5) - v * 10; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(74,30,38,0.6)'; ctx.font = F.sans(26); ctx.textAlign = 'left'; ctx.fillText('then sign', l + 80, y + 46);
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
  if (t >= T.card + 0.5) {
    const u = ease.inOut(prog(t, T.card + 0.5, T.perch));
    const landed = t >= T.perch;
    const qx = (1 - u) * (1 - u) * 1250 + 2 * (1 - u) * u * 1060 + u * u * 770, qy = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 380 + u * u * 322;
    return { x: qx, y: qy, s: 0.44, phi: landed ? 0.18 : flapPhi(t, T.card), dir: -1, rot: 0 };
  }
  return null;
}

// ---------------------------------------------------------------- captions: accepted English folded strip (round-02)
const CAPS = [
  [0.18, 4.2, ["150 RSVPs isn't", '150 meals']],
  [4.38, 9.3, ['Made-up example:', '132 adults + 18 children']],
  [9.75, 13.44, ['Photographer + DJ contracts:', '8 crew meals']],
  [13.62, 17.46, ['The caterer needs 158 meals,', 'in three types']],
  [17.64, 21.8, ['Before you sign,', 'confirm in writing:']],
  [21.9, 25.99, ['meal counts, dietary needs,', 'serving time, final-count deadline']],
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

// ---------------------------------------------------------------- S6: end card (accepted English layout)
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Guest list · RSVPs · Budget', x, 1080); g.globalAlpha = 1; }
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
  trays(ctx, t);
  ticket(ctx, t);
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
