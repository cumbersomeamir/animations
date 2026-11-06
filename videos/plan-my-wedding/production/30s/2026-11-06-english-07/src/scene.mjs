// English episode: build the outdoor ceremony timeline backwards from sunset.
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); English
// caption strip, crane, checklist sheet and end card as in production/30s/2026-11-06-english-06 (@f2aeef0).
// New mechanisms: a paper sun sinking onto a timeline ruler, blocks stacking backwards from the sunset pin,
// a "late start" ghost sliding into the buffer while portraits keep their daylight. Times are an example.
import { loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, person, check, tag, camera, pillar } from './models.mjs';
import { T } from './cues.mjs';

const FLOOR = 1640;
const grain = makeGrain(5);
let icon = null;
export async function init() { icon = await loadImage('assets/app-icon-play.png'); }
const rise = (t, t0, dur = 0.32) => (t < t0 ? 0 : t < t0 + dur ? ease.back(prog(t, t0, t0 + dur), 2.2) : 1);
const fold = (t, t0, x = 540) => 1 - seg(t, t0 + (x / W) * 0.2, t0 + (x / W) * 0.2 + 0.28, ease.in);

// ---------------------------------------------------------------- backdrop (accepted) + evening tint
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
function backdrop(ctx, dusk) {
  for (const f of WALL) { path(ctx, f.pts); ctx.fillStyle = shade(f.c, f.tone - 0.1 * dusk); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,250,244,0.35)'; ctx.lineWidth = 2;
  for (const f of WALL) { path(ctx, f.pts); ctx.stroke(); }
  // warm glow toward the horizon
  const g = ctx.createLinearGradient(0, 560, 0, 1180);
  g.addColorStop(0, 'rgba(230,165,60,0)'); g.addColorStop(1, `rgba(230,165,60,${0.22 * (1 - dusk * 0.6)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 560, W, 620);
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

// ---------------------------------------------------------------- the timeline geometry
const R = { x0: 110, x1: 900, y: 1300 }; // 4:30 PM .. 6:00 PM
const X = (min) => R.x0 + (min / 90) * (R.x1 - R.x0); // minutes after 4:30
const SUN = { x: X(90), r: 84, y0: 690, y1: 1115 };
const HORIZON = 1120;

function sun(ctx, t) {
  const v = ease.inOut(prog(t, T.sun, T.sunset));
  const y = lerp(SUN.y0, SUN.y1, v);
  const list = [];
  for (let i = 0; i < 12; i++) { const a0 = (i / 12) * TAU, a1 = ((i + 1) / 12) * TAU; list.push({ pts: [[SUN.x, y], [SUN.x + Math.cos(a0) * SUN.r, y + Math.sin(a0) * SUN.r], [SUN.x + Math.cos(a1) * SUN.r, y + Math.sin(a1) * SUN.r]], c: P.gold, tone: Math.cos((a0 + a1) / 2 + 2.3) * 0.35 }); }
  facets(ctx, list, { blur: 20, sx: 6, sy: 10 });
  // folded rays, shrinking as it sets
  const ray = 1 - v * 0.7;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2, r0 = SUN.r + 14, r1 = SUN.r + 14 + 40 * ray;
    facets(ctx, [{ pts: [[SUN.x + Math.cos(a - 0.08) * r0, y + Math.sin(a - 0.08) * r0], [SUN.x + Math.cos(a) * r1, y + Math.sin(a) * r1], [SUN.x + Math.cos(a + 0.08) * r0, y + Math.sin(a + 0.08) * r0]], c: P.goldLight, tone: 0.1 }], { shadow: false });
  }
}
function hills(ctx) {
  facets(ctx, [
    { pts: [[-40, HORIZON + 40], [260, 1010], [560, HORIZON + 30]], c: P.blushDeep, tone: 0.12 },
    { pts: [[380, HORIZON + 40], [700, 1040], [1120, HORIZON + 20]], c: P.blushDeep, tone: -0.08 },
    { pts: [[-40, HORIZON], [1120, HORIZON], [1120, 1240], [-40, 1240]], c: P.goldPale, tone: 0.1 },
  ], { blur: 18, sx: 0, sy: 10 });
}

// ruler with ticks and time labels
function ruler(ctx, t) {
  const u = seg(t, T.ruler, T.ruler + 0.35, ease.out);
  if (u <= 0.02) return;
  const x1 = lerp(R.x0, R.x1, u);
  facets(ctx, [
    { pts: [[R.x0 - 20, R.y], [x1 + 20, R.y], [x1 + 20, R.y + 34], [R.x0 - 20, R.y + 34]], c: P.cream, tone: 0.2 },
    { pts: [[R.x0 - 20, R.y + 34], [x1 + 20, R.y + 34], [x1 + 10, R.y + 46], [R.x0 - 10, R.y + 46]], c: P.cream, tone: -0.2 },
  ], { blur: 12, sx: 4, sy: 8 });
  for (let m = 0; m <= 90; m += 10) {
    const x = X(m);
    if (x > x1) break;
    ctx.strokeStyle = P.ink; ctx.lineWidth = m % 30 === 0 ? 4 : 2;
    ctx.beginPath(); ctx.moveTo(x, R.y); ctx.lineTo(x, R.y + (m % 30 === 0 ? 26 : 14)); ctx.stroke();
    if (m % 30 === 0) label(ctx, x, R.y + 84, ['4:30', '5:00', '5:30', '6:00'][m / 30], 36, P.ink, F.sansB);
  }
}
/** timeline block sitting on the ruler between two minute marks */
function block(ctx, m0, m1, u, c, text, opt = {}) {
  if (u <= 0.02) return;
  const a = X(m0), b = X(m1), h = 120, yb = R.y - 4;
  ctx.save();
  ctx.translate(0, yb); ctx.scale(1, u); ctx.translate(0, -yb);
  if (opt.ghost) {
    ctx.setLineDash([12, 9]); ctx.strokeStyle = P.raspDark; ctx.lineWidth = 4; ctx.strokeRect(a + 4, yb - h, b - a - 8, h); ctx.setLineDash([]);
  } else {
    facets(ctx, [
      { pts: [[a + 4, yb], [b - 4, yb], [b - 4, yb - h], [a + 4, yb - h]], c, tone: 0.08 },
      { pts: [[a + 4, yb - h], [b - 4, yb - h], [b - 14, yb - h - 12], [a + 14, yb - h - 12]], c, tone: 0.4 },
    ], { blur: 14, sx: 5, sy: 10 });
    if (opt.stripes) { ctx.save(); ctx.beginPath(); ctx.rect(a + 4, yb - h, b - a - 8, h); ctx.clip(); ctx.strokeStyle = 'rgba(255,250,244,0.6)'; ctx.lineWidth = 8; for (let k = a - h; k < b; k += 26) { ctx.beginPath(); ctx.moveTo(k, yb); ctx.lineTo(k + h, yb - h); ctx.stroke(); } ctx.restore(); }
  }
  ctx.fillStyle = opt.ghost ? P.raspDark : opt.dark ? P.cream : P.ink;
  ctx.font = F.sansB(opt.px || 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  (Array.isArray(text) ? text : [text]).forEach((s, i, arr) => ctx.fillText(s, (a + b) / 2, yb - h / 2 + (i - (arr.length - 1) / 2) * 36));
  ctx.restore();
}

// ---------------------------------------------------------------- the stage
function stage(ctx, t) {
  const f = fold(t, T.crane + 0.05, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, FLOOR); ctx.scale(1, f); ctx.translate(0, -FLOOR);
  sun(ctx, t);
  hills(ctx);
  // couple + photographer in the last light
  popup(ctx, 690, HORIZON + 4, rise(t, T.couple, 0.3), (g) => person(g, 0, 0, 170, 'A', { col: P.rasp, arms: [0.2, -0.9], look: 1 }));
  popup(ctx, 760, HORIZON + 4, rise(t, T.couple + 0.08, 0.3), (g) => person(g, 0, 0, 170, 'B', { col: P.gold, arms: [0.9, -0.2], look: -1 }));
  popup(ctx, 615, HORIZON + 4, rise(t, T.couple + 0.16, 0.3), (g) => { person(g, 0, 0, 150, 'B', { col: P.raspDark, arms: [1.4, 1.2], look: 1, noFace: false }); g.save(); g.translate(42, -132); g.scale(0.3, 0.3); camera(g); g.restore(); });
  ruler(ctx, t);
  // backwards arrow from the sunset end
  const au = seg(t, T.arrow, T.arrow + 0.45, ease.out) * (1 - seg(t, T.sunset, T.sunset + 0.3));
  if (au > 0.02) {
    const xa = R.x1, xb = lerp(R.x1, R.x0 + 60, au), y = R.y + 150;
    ctx.strokeStyle = P.rasp; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
    facets(ctx, [{ pts: [[xb - 34, y], [xb + 6, y - 26], [xb + 6, y + 26]], c: P.rasp, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
    label(ctx, (xa + xb) / 2, y + 48, 'plan backwards', 32, P.rasp, F.sansB);
  }
  // blocks, stacked backwards from the sunset pin
  block(ctx, 60, 90, rise(t, T.portraits, 0.3), P.goldLight, ['Portraits', '30 min']);
  block(ctx, 40, 60, rise(t, T.buffer, 0.3), P.blushDeep, ['Buffer', '20 min'], { stripes: true });
  block(ctx, 10, 40, rise(t, T.ceremony, 0.3), P.rasp, ['Ceremony', '30 min'], { dark: true });
  // late-start demo: a ghost ceremony slides 15 min into the buffer; portraits keep their light
  if (t > T.ghost - 0.05 && t < T.ghostOut + 0.4) {
    const s = seg(t, T.ghost, T.ghost + 0.5, ease.inOut) * (1 - seg(t, T.ghostOut, T.ghostOut + 0.35, ease.in));
    const gv = rise(t, T.ghost - 0.05, 0.2) * (1 - seg(t, T.ghostOut + 0.2, T.ghostOut + 0.4));
    block(ctx, 10 + 15 * s, 40 + 15 * s, gv, null, [], { ghost: true, px: 28 });
    if (gv > 0.5) { const gx = (X(10 + 15 * s) + X(40 + 15 * s)) / 2; ctx.save(); ctx.globalAlpha = Math.min(1, gv); tagAt(ctx, gx, R.y - 150, 1, 'late start: +15 min', 30); ctx.restore(); }
  }
  // pins / flags
  const pu = rise(t, T.sunset, 0.3);
  if (pu > 0.03) {
    ctx.strokeStyle = P.raspDark; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(R.x1, R.y); ctx.lineTo(R.x1, R.y - 300 * pu); ctx.stroke();
    tagAt(ctx, 845, R.y - 300, pu, 'Sunset 6:00 PM', 34);
  }
  const p53 = rise(t, T.portraits + 0.15, 0.25);
  const kept = t > T.ghost + 0.45 && t < T.ghostOut + 0.3;
  if (p53 > 0.03) { const w = tagAt(ctx, X(60), R.y + 220, p53, kept ? 'portraits keep their light' : 'portraits from 5:30', 30); if (kept) check(ctx, X(60) + w / 2 + 30, R.y + 186, 24); }
  const su = rise(t, T.start, 0.3);
  if (su > 0.03) {
    ctx.strokeStyle = P.raspDark; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(10), R.y); ctx.lineTo(X(10), R.y - 230 * su); ctx.stroke();
    tagAt(ctx, 270, R.y - 230, su, 'Ceremony 4:40 PM', 34);
  }
  ctx.restore();
  tagAt(ctx, 540, 596, rise(t, T.example, 0.25) * f, 'Example times', 30);
}

// ---------------------------------------------------------------- S6: check card (accepted sheet style)
const ITEMS = [['Real sunset time', 'for your date and place'], ['Venue timing rules', 'start, music and lighting limits']];
function checkCard(ctx, t) {
  if (t < T.card) return;
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.card, T.card + 0.35), 1.6);
  const l = 100, r = 980, top = 700, hh = 640;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + hh * Math.min(1, u)], [l, top + hh * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 84], [l, top + 84]], c: P.rasp, tone: 0.08 }], { shadow: false });
  if (u > 0.4) label(ctx, 540, top + 44, 'CHECK BEFORE YOU BOOK', 38, P.cream);
  if (u > 0.9) {
    ITEMS.forEach(([a, b], i) => {
      const y = top + 130 + i * 230;
      const ru = seg(t, T.card + 0.3 + i * 0.12, T.card + 0.55 + i * 0.12, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 190], [l + 30, y + 190]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
      facets(ctx, [{ pts: hg.pts, c: hg.front ? (i % 2 ? P.blush : P.cream) : P.blushDeep, tone: (i % 2 ? -0.05 : 0.18) * Math.abs(hg.k) }], { blur: 8, sx: 3, sy: 6 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      // icon: sun-over-calendar or venue arch
      if (i === 0) {
        facets(ctx, [{ pts: [[l + 70, y + 60], [l + 170, y + 60], [l + 170, y + 150], [l + 70, y + 150]], c: P.cream, tone: -0.05 }, { pts: [[l + 70, y + 46], [l + 170, y + 46], [l + 170, y + 74], [l + 70, y + 74]], c: P.rasp, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
        ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(l + 120, y + 112, 22, 0, TAU); ctx.fill();
      } else {
        ctx.save(); ctx.translate(l + 90, y + 160); ctx.scale(0.55, 0.55); pillar(ctx, 0, 180, 40); pillar(ctx, 120, 180, 40); ctx.restore();
      }
      ctx.fillStyle = P.ink; ctx.font = F.sansB(44); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(a, l + 220, y + 74);
      ctx.fillStyle = P.inkSoft || 'rgba(74,30,38,0.7)'; ctx.font = F.sans(32); ctx.fillText(b, l + 220, y + 128);
      ctx.beginPath(); ctx.arc(r - 100, y + 95, 32, 0, TAU); ctx.strokeStyle = 'rgba(74,30,38,0.45)'; ctx.lineWidth = 3; ctx.stroke();
      check(ctx, r - 98, y + 90, 32 * rise(t, i ? T.tick2 : T.tick1, 0.2));
      ctx.restore();
    });
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
  [0.18, 4.23, ['Outdoor wedding? Build the', 'timeline backwards from sunset']],
  [5.01, 7.51, ['Example: sunset 6:00 PM']],
  [8.29, 11.39, ['Portraits need daylight:', 'book them from 5:30']],
  [12.17, 16.64, ['Add a 20-minute buffer, so a', "late start doesn't steal your light"]],
  [17.41, 20.81, ['30-minute ceremony:', 'starts at 4:40']],
  [21.59, 26.26, ['Check the real sunset for your', 'date and place, and venue timing rules']],
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

// ---------------------------------------------------------------- S7: end card (accepted English layout)
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Checklist · Vendors · Budget', x, 1080); g.globalAlpha = 1; }
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
  const dusk = seg(t, T.sunset - 0.5, T.sunset + 1.5) * fold(t, T.crane + 0.05, 540);
  backdrop(ctx, dusk);
  stage(ctx, t);
  checkCard(ctx, t);
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
