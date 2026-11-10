// English episode: a sound-system quote may leave out the wireless mic, backup power and an operator.
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); English
// caption strip, crane, card styling and end card as in production/30s/2026-11-07-english-08 (@16b5a88).
// New mechanisms: a paper ceremony where sound rings fade after row 3, a made-up quote with unlisted items,
// three confirm-in-writing items that visibly fix the ceremony (mics, backup power on a cut, an operator).
import { loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, check, tag, person } from './models.mjs';
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


// ---------------------------------------------------------------- ceremony stage (screen coords at scale 1; bottom zone)
const ROWS = [560, 640, 720, 800, 880];
const SPK = { x: 380, y: 1380 };
const GCOL = [P.goldLight, P.raspLight, P.goldDark, P.blushDeep, P.raspDark];
// how far the sound carries (px from the speaker): row 3 at first, row 4 once mics are confirmed, every row with an operator
const reach = (t) => 345 + 85 * seg(t, T.wireless, T.wireless + 0.5, ease.out) + 90 * seg(t, T.allRows, T.allRows + 0.5, ease.out);
const heardBy = (t, i) => SPK.x + reach(t) >= ROWS[i] - 10;
const cut1 = (t) => t >= T.pow && t < T.pow + 0.8; // "no backup power": the sound stops
const cut2 = (t) => t >= T.cutout; // the mains cuts out again, but the backup keeps the sound on

function flower(ctx, x, y, c, r = 17) {
  facets(ctx, [0, 1, 2, 3, 4].map((k) => { const a = (k * TAU) / 5; return { pts: [[x, y], [x + Math.cos(a - 0.55) * r, y + Math.sin(a - 0.55) * r], [x + Math.cos(a + 0.55) * r, y + Math.sin(a + 0.55) * r]], c, tone: k % 2 ? 0.18 : -0.1 }; }), { shadow: false });
}
function arch(ctx) {
  facets(ctx, [
    { pts: [[96, 1640], [124, 1640], [124, 1250], [96, 1250]], c: P.cream, tone: 0.2 },
    { pts: [[316, 1640], [344, 1640], [344, 1250], [316, 1250]], c: P.cream, tone: -0.06 },
  ], { blur: 10, sx: 4, sy: 6 });
  const pts = [], n = 14;
  for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; pts.push([220 + Math.cos(a) * 124, 1250 + Math.sin(a) * 124]); }
  for (let i = n; i >= 0; i--) { const a = Math.PI + (i / n) * Math.PI; pts.push([220 + Math.cos(a) * 96, 1250 + Math.sin(a) * 96]); }
  facets(ctx, [{ pts, c: P.cream, tone: 0.1 }], { blur: 10, sx: 4, sy: 6 });
  for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; flower(ctx, 220 + Math.cos(a) * 110, 1250 + Math.sin(a) * 110, i % 2 ? P.rasp : P.gold); }
}
function mic(ctx, x, y, rot, s = 1, dashed = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (dashed) {
    ctx.setLineDash([6, 6]); ctx.strokeStyle = P.rasp; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -30, 13, 0, TAU); ctx.moveTo(-6, -17); ctx.lineTo(-4, 18); ctx.lineTo(4, 18); ctx.lineTo(6, -17); ctx.stroke(); ctx.setLineDash([]);
  } else {
    facets(ctx, [{ pts: [[-6, -17], [6, -17], [4, 18], [-4, 18]], c: P.ink, tone: 0.2 }], { blur: 4, sx: 1, sy: 3 });
    facets(ctx, [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * TAU) / 6; return { pts: [[0, -30], [Math.cos(a) * 13, -30 + Math.sin(a) * 13], [Math.cos(a + TAU / 6) * 13, -30 + Math.sin(a + TAU / 6) * 13]], c: P.goldLight, tone: Math.cos(a + 2.4) * 0.3 }; }), { blur: 4, sx: 1, sy: 3 });
  }
  ctx.restore();
}
function speaker(ctx, on) {
  ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(SPK.x, SPK.y + 50); ctx.lineTo(SPK.x, 1636); ctx.moveTo(SPK.x - 34, 1636); ctx.lineTo(SPK.x, 1590); ctx.lineTo(SPK.x + 34, 1636); ctx.stroke();
  facets(ctx, [
    { pts: [[SPK.x - 34, SPK.y - 56], [SPK.x + 34, SPK.y - 56], [SPK.x + 34, SPK.y + 56], [SPK.x - 34, SPK.y + 56]], c: '#5A2E34', tone: 0.15 },
    { pts: [[SPK.x + 34, SPK.y - 56], [SPK.x + 44, SPK.y - 48], [SPK.x + 44, SPK.y + 50], [SPK.x + 34, SPK.y + 56]], c: '#5A2E34', tone: -0.25 },
  ], { blur: 12, sx: 4, sy: 8 });
  ctx.fillStyle = shade(P.goldPale, on ? 0 : -0.3); ctx.beginPath(); ctx.arc(SPK.x, SPK.y + 18, 22, 0, TAU); ctx.fill();
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(SPK.x, SPK.y + 18, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = shade(P.goldPale, on ? 0 : -0.3); ctx.beginPath(); ctx.arc(SPK.x, SPK.y - 30, 12, 0, TAU); ctx.fill();
  ctx.fillStyle = on ? P.gold : '#8E7B78'; ctx.beginPath(); ctx.arc(SPK.x + 22, SPK.y - 46, 4.5, 0, TAU); ctx.fill();
}
function waves(ctx, t) {
  const R = reach(t);
  ctx.save(); ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    const r = 40 + ((t * 230 + (k * R) / 4) % (R - 40));
    const a = Math.pow(1 - r / R, 0.6);
    ctx.strokeStyle = `rgba(217,90,101,${(0.85 * a).toFixed(3)})`; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(SPK.x + 30, SPK.y, r, -0.62, 0.62); ctx.stroke();
  }
  ctx.restore();
}
function bubbleQ(ctx, x, y, u) {
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  facets(ctx, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * TAU) / 8; return { pts: [[0, 0], [Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a + TAU / 8) * 30, Math.sin(a + TAU / 8) * 30]], c: P.cream, tone: Math.cos(a + 2.4) * 0.16 }; }).concat([{ pts: [[-8, 26], [6, 27], [-14, 44]], c: P.cream, tone: -0.05 }]), { blur: 8, sx: 3, sy: 5 });
  label(ctx, 0, 3, '?', 44, P.rasp, F.serif);
  ctx.restore();
}
function cordAndPower(ctx, t) {
  // cord along the floor from the speaker stand to a floor socket; backup battery box beside it (once confirmed)
  const hot = t > T.plug && t < T.plug + 1.2;
  const off = cut1(t) || cut2(t);
  ctx.strokeStyle = hot ? P.rasp : off && cut2(t) ? 'rgba(74,30,38,0.35)' : P.ink; ctx.lineWidth = hot ? 6 : 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(SPK.x + 4, 1600); ctx.bezierCurveTo(SPK.x + 20, 1640, 430, 1636, 452, 1622); ctx.stroke();
  facets(ctx, [{ pts: [[444, 1606], [478, 1606], [478, 1636], [444, 1636]], c: P.cream, tone: 0.1 }], { blur: 4, sx: 1, sy: 3 });
  ctx.fillStyle = P.ink; ctx.fillRect(453, 1616, 4, 9); ctx.fillRect(465, 1616, 4, 9);
  for (const tc of [T.pow, T.cutout]) if (t >= tc && t < tc + 0.35) { const v = prog(t, tc, tc + 0.35); star4(ctx, 470, 1600, 26 * (1 - v) + 8, P.goldLight, P.gold); }
  const bu = rise(t, T.backup, 0.3);
  if (bu > 0.03) {
    ctx.save(); ctx.translate(505, 1636); ctx.scale(bu, bu);
    const glow = cut2(t);
    facets(ctx, [
      { pts: [[-24, 0], [24, 0], [24, -44], [-24, -44]], c: glow ? P.goldLight : P.gold, tone: 0.1 },
      { pts: [[-8, -44], [8, -44], [8, -52], [-8, -52]], c: P.ink, tone: 0.2 },
    ], { blur: 6, sx: 2, sy: 4 });
    facets(ctx, [{ pts: [[3, -38], [-9, -18], [0, -18], [-4, -6], [10, -26], [1, -26]], c: P.cream, tone: 0.2 }], { shadow: false });
    ctx.restore();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(481, 1628); ctx.lineTo(486, 1628); ctx.stroke();
  }
}
function desk(ctx, t) {
  // sound desk at the back: empty stool first ("nobody named to run it"), then an operator on duty
  const du = rise(t, T.op, 0.3);
  if (du <= 0.03) return;
  ctx.save(); ctx.translate(985, 1640); ctx.scale(du, du); ctx.translate(-985, -1640);
  const ou = rise(t, T.opIn, 0.32);
  if (ou > 0.03) {
    ctx.save(); ctx.translate(1000, 1632); ctx.scale(ou, ou); ctx.translate(-1000, -1632);
    const knob = t > T.vowsBar ? Math.sin((t - T.vowsBar) * 6) * 0.25 : 0;
    person(ctx, 1000, 1632, 175, 'B', { col: P.goldDark, look: -1, arms: [1.9 + knob, 0.4] });
    ctx.restore();
  } else {
    facets(ctx, [{ pts: [[985, 1572], [1025, 1572], [1025, 1582], [985, 1582]], c: P.gold, tone: 0.1 }], { blur: 4, sx: 1, sy: 3 });
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(992, 1582); ctx.lineTo(988, 1636); ctx.moveTo(1018, 1582); ctx.lineTo(1022, 1636); ctx.stroke();
    bubbleQ(ctx, 1005, 1500, rise(t, T.op + 0.1, 0.3));
  }
  facets(ctx, [
    { pts: [[925, 1540], [985, 1540], [990, 1556], [920, 1556]], c: '#5A2E34', tone: 0.2 },
    { pts: [[930, 1556], [940, 1556], [940, 1636], [930, 1636]], c: P.ink, tone: 0 },
    { pts: [[972, 1556], [982, 1556], [982, 1636], [972, 1636]], c: P.ink, tone: -0.1 },
  ], { blur: 8, sx: 3, sy: 6 });
  for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? P.goldLight : P.raspLight; ctx.beginPath(); ctx.arc(934 + k * 14, 1546, 3.5, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function stage(ctx, t) {
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  const k = lerp(1.3, 1, seg(t, T.shrink, T.shrink + 0.45, ease.inOut));
  ctx.save(); ctx.translate(0, 1640); ctx.scale(1, f); ctx.translate(0, -1640);
  ctx.translate(480, 1640); ctx.scale(k, k); ctx.translate(-480, -1640);
  arch(ctx);
  const hook = t < T.shrink + 0.45;
  // couple: holding hands during the vows, holding the two confirmed mics later
  const mu = rise(t, T.many, 0.3);
  const speak = Math.sin(t * 9) * 0.05;
  person(ctx, 185, 1632, 210, 'A', { arms: [0.18, 0.75 + speak], look: 1 });
  person(ctx, 262, 1632, 210, 'B', { arms: [-0.75, -0.2], look: -1 });
  // two clip-on wireless mics (one each), popped on when "how many" is said
  const lav = [[178, 1500], [254, 1500]];
  if (mu > 0.03) for (const [x, y] of lav) mic(ctx, x, y, 0, 0.8 * mu);
  if (mu > 0.03) tagAt(ctx, 220, 1385, mu * (1 - seg(t, T.q2 - 0.2, T.q2)), '2 mics', 26);
  const mm = rise(t, T.mic, 0.3) * (1 - seg(t, T.crane, T.crane + 0.3));
  if (mm > 0.03) { mic(ctx, 220, 1395, -0.3, mm * 1.3, true); bubbleQ(ctx, 252, 1330, mm * 0.8); }
  if (t > T.wireless && mu > 0.5) for (const [x, y] of lav) { const v = ((t - T.wireless) * 2) % 1; ctx.strokeStyle = `rgba(195,144,76,${(1 - v).toFixed(2)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - 22, 12 + v * 20, -2.5, -0.65); ctx.stroke(); }
  // spare batteries for the wireless mics
  const ba = rise(t, T.batt, 0.28);
  if (ba > 0.03) for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(318 + i * 22, 1636); ctx.scale(ba, ba); facets(ctx, [{ pts: [[-8, 0], [8, 0], [8, -30], [-8, -30]], c: P.gold, tone: 0.15 - i * 0.2 }, { pts: [[-4, -30], [4, -30], [4, -35], [-4, -35]], c: P.ink, tone: 0 }], { blur: 4, sx: 1, sy: 3 }); ctx.restore(); }
  // vows ribbon on frame 0
  if (hook) tagAt(ctx, 215, 1112, 1 - seg(t, T.shrink, T.shrink + 0.3), 'I promise…', 34);
  const on = !cut1(t);
  cordAndPower(ctx, t);
  speaker(ctx, on);
  if (on) waves(ctx, t);
  // guests (facing the couple): rows the sound reaches get a heart, the back rows a "?"
  ROWS.forEach((x, i) => {
    const cup = !heardBy(t, i) && t > T.nothing ? 2.6 + Math.sin(t * 5 + i) * 0.1 : 0.2;
    person(ctx, x, 1632, 168, i % 2 ? 'A' : 'B', { col: GCOL[i], look: -1, arms: [cup, -0.15], noFace: false });
    const heard = heardBy(t, i) && on;
    const bob = Math.sin(t * 4 + i) * 3;
    if (heard) { const hu = i >= 3 ? rise(t, i === 3 ? T.wireless + 0.3 : T.allRows + 0.2, 0.3) : 1; if (hu > 0.03) heart(ctx, x, 1418 + bob, 20 * hu, P.rasp); }
    else bubbleQ(ctx, x + 4, 1405 + bob, (0.85 + 0.3 * Math.sin(Math.PI * prog(t, T.nothing + (i - 3) * 0.1, T.nothing + (i - 3) * 0.1 + 0.3))) * (hook ? 1.15 : 0.9));
  });
  desk(ctx, t);
  if (!hook) {
    tagAt(ctx, 462, 1556, rise(t, T.cutout + 0.15, 0.25) * (1 - seg(t, T.q3 - 0.2, T.q3)), 'backup on', 26);
    const eu = rise(t, T.every, 0.3), ew = tagAt(ctx, 700, 1352, eu, 'Every row hears', 30);
    if (eu > 0.03) check(ctx, 700 + ew / 2 + 24, 1322, 24 * eu);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- S2: the made-up sound quote
const QROWS = [['2 speakers', 1, 'spk'], ['Playlist player', 1, 'play'], ['Wireless microphone', 0, 'mic'], ['Backup power', 0, 'pow'], ['Sound operator', 0, 'op']];
function stampNL(ctx, x, y, u) {
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08); ctx.scale(u, u);
  ctx.strokeStyle = P.rasp; ctx.lineWidth = 4; ctx.strokeRect(-104, -24, 208, 48);
  label(ctx, 0, 2, 'NOT LISTED', 30, P.rasp, F.sansB);
  ctx.restore();
}
function quote(ctx, t) {
  if (t < T.card - 0.05) return;
  const f = fold(t, T.crane + 0.05, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.card, T.card + 0.35), 1.6);
  const l = 100, r = 980, top = 610, hh = 470;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + hh * Math.min(1, u)], [l, top + hh * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 80], [l, top + 80]], c: P.rasp, tone: 0.08 }], { shadow: false });
  if (u > 0.4) label(ctx, 540, top + 42, 'SOUND QUOTE', 40, P.cream);
  if (u > 0.9) {
    QROWS.forEach(([txt, listed, key], i) => {
      const y = top + 100 + i * 74;
      const t0 = T[key];
      const ru = seg(t, t0 - 0.05, t0 + 0.22, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 64], [l + 30, y + 64]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
      const hot = t > t0 && t < t0 + 1.0;
      if (listed) facets(ctx, [{ pts: hg.pts, c: hg.front ? (i % 2 ? '#F7ECE4' : P.cream) : P.blushDeep, tone: 0.12 * Math.abs(hg.k) }], { blur: 6, sx: 2, sy: 4 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      if (!listed) { ctx.setLineDash([10, 8]); ctx.strokeStyle = hot ? P.rasp : 'rgba(179,47,63,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(l + 32, y + 2, r - l - 64, 60); ctx.setLineDash([]); }
      label(ctx, l + 64, y + 33, txt, 36, listed ? P.ink : 'rgba(74,30,38,0.55)', listed ? F.sansB : F.sans, 'left');
      if (listed) check(ctx, r - 80, y + 30, 26 * rise(t, t0 + 0.1, 0.25));
      else stampNL(ctx, r - 160, y + 32, rise(t, t0 + 0.12, 0.25));
      ctx.restore();
    });
  }
  ctx.restore();
}
function madeUp(ctx, t) { tagAt(ctx, 540, 602, rise(t, T.tag, 0.25) * fold(t, T.crane + 0.05, 540), 'Made-up quote', 32); }

// ---------------------------------------------------------------- S3: confirm three things in writing
const ITEMS = [
  ['Microphones', 'q1', [['how many', 'many'], ['wireless', 'wireless'], ['spare batteries', 'batt']]],
  ['Power', 'q2', [['where it plugs in', 'plug'], ['backup if it cuts out', 'backup']]],
  ['Operator', 'q3', null],
];
function confirm(ctx, t) {
  if (t < T.banner - 0.05) return;
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, 620); ctx.scale(1, f); ctx.translate(0, -620);
  const hu = rise(t, T.banner, 0.3);
  if (hu > 0.03) {
    ctx.save(); ctx.translate(540, 640); ctx.scale(hu, hu);
    facets(ctx, [{ pts: [[-400, -48], [400, -48], [400, 48], [-400, 48]], c: P.rasp, tone: 0.1 }, { pts: [[-430, -28], [-400, -48], [-400, 48], [-430, 28]], c: P.raspDark, tone: 0 }, { pts: [[430, -28], [400, -48], [400, 48], [430, 28]], c: P.raspDark, tone: 0 }], { blur: 14, sx: 5, sy: 10 });
    label(ctx, -40, 2, 'CONFIRM IN WRITING', 42, P.cream);
    // pen nib signs on "in writing"
    const wu = seg(t, T.writing, T.writing + 0.35, ease.out);
    if (wu > 0) { ctx.strokeStyle = P.goldLight; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); for (let k = 0; k <= 20 * wu; k++) { const v = k / 20, x = 250 + v * 110, y = 18 + Math.sin(v * 12) * 8; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    ctx.restore();
  }
  ITEMS.forEach(([title, key, parts], i) => {
    const u = ease.back(prog(t, T.banner + 0.35 + i * 0.12, T.banner + 0.67 + i * 0.12), 1.8);
    if (u <= 0.03) return;
    const y = 776 + i * 124;
    const qu = seg(t, T[key], T[key] + 0.25, ease.out), bump = 1 + 0.04 * Math.sin(Math.PI * prog(t, T[key], T[key] + 0.3));
    const hot = t > T[key] && t < (ITEMS[i + 1] ? T[ITEMS[i + 1][1]] : T.fold);
    ctx.save(); ctx.translate(540, y); ctx.scale(Math.min(1.05, u) * bump, Math.min(1.05, u) * bump);
    facets(ctx, [{ pts: [[-430, -54], [430, -54], [430, 54], [-430, 54]], c: hot ? P.blush : P.cream, tone: 0.16 }], { blur: 18, sx: 6, sy: 10 });
    facets(ctx, [{ pts: [[-414, -38], [-338, -38], [-338, 38], [-414, 38]], c: qu > 0.5 ? P.rasp : P.goldPale, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
    label(ctx, -376, 4, String(i + 1), 54, qu > 0.5 ? P.cream : P.goldDark, F.serif);
    if (qu > 0.02) {
      ctx.save(); ctx.globalAlpha *= qu; ctx.translate((1 - qu) * 40, 0);
      label(ctx, -310, -18, title, 40, P.ink, F.sansB, 'left');
      if (parts) {
        let x = -310;
        ctx.font = F.sans(30);
        let cur = -1; parts.forEach(([, pk], j) => { if (t >= T[pk]) cur = j; });
        parts.forEach(([s, pk], j) => {
          const pu = seg(t, T[pk], T[pk] + 0.2, ease.out);
          const txt = (j ? ' · ' : '') + s;
          if (pu > 0) { ctx.save(); ctx.globalAlpha *= pu; label(ctx, x, 24, txt, 30, j === cur && hot ? P.rasp : 'rgba(74,30,38,0.75)', F.sans, 'left'); ctx.restore(); }
          ctx.font = F.sans(30); x += ctx.measureText(txt).width;
        });
      } else {
        // duty bar: vows -> last speech
        const bu = seg(t, T.vowsBar, T.speechBar, ease.inOut);
        if (t > T.opIn) {
          const a = rise(t, T.opIn, 0.25);
          ctx.save(); ctx.globalAlpha *= Math.min(1, a);
          label(ctx, -310, 24, 'vows', 28, 'rgba(74,30,38,0.75)', F.sans, 'left');
          ctx.fillStyle = 'rgba(74,30,38,0.15)'; ctx.fillRect(-235, 18, 420, 12);
          ctx.fillStyle = P.rasp; ctx.fillRect(-235, 18, 420 * bu, 12);
          label(ctx, 200, 24, 'last speech', 28, bu > 0.98 ? P.rasp : 'rgba(74,30,38,0.75)', F.sans, 'left');
          ctx.restore();
        }
      }
      if (t > T[key] + 0.3) check(ctx, 380, -4, 26 * rise(t, i === 0 ? T.batt + 0.2 : i === 1 ? T.cutout + 0.25 : T.speechBar, 0.25));
      ctx.restore();
    } else {
      ctx.strokeStyle = 'rgba(74,30,38,0.18)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-300, -14); ctx.lineTo(120 - i * 60, -14); ctx.moveTo(-300, 22); ctx.lineTo(60 + i * 40, 22); ctx.stroke();
    }
    ctx.restore();
  });
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
  [0.18, 2.95, ['Beautiful vows, and the', 'back rows heard nothing']],
  [3.37, 6.56, ['Made-up sound quote:', 'two speakers and a playlist']],
  [6.98, 10.94, ['No wireless mic, no backup power,', 'nobody named to run it']],
  [11.36, 14.23, ['Before you book, confirm', 'three things in writing']],
  [14.65, 18.27, ['1. Microphones: how many, which', 'are wireless, spare batteries']],
  [18.69, 22.06, ['2. Power: where it plugs in, what', 'backs it up if it cuts out']],
  [22.48, 26.02, ['3. Operator: who stays to run it', 'from the vows to the last speech']],
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
  stage(ctx, t);
  quote(ctx, t);
  madeUp(ctx, t);
  confirm(ctx, t);
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
