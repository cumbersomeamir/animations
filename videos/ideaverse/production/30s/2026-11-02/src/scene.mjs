// scene.mjs — "A useful prompt has three layers": one continuous AI printing press, printed in riso.
// Every frame is a pure function of t; motion steps on 2s (B = floor(frame/2)).
import { GlobalFonts } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { W, H, Sheet, Layer, PITCH, roughRect, roughPoly, wob } from './riso.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FD = path.join(HERE, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(path.join(FD, 'space-grotesk/files/space-grotesk-latin-700-normal.woff2'), 'SG7');
GlobalFonts.registerFromPath(path.join(FD, 'space-grotesk/files/space-grotesk-latin-500-normal.woff2'), 'SG5');
GlobalFonts.registerFromPath(path.join(FD, 'jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'), 'JBM');

export const FPS = 30, N = 900;
export const NARR = [
  { id: 's1', t: 0.35 }, { id: 's2', t: 2.95 }, { id: 's3', t: 8.35 },
  { id: 's4', t: 18.15 }, { id: 's5', t: 23.25 }, { id: 's6', t: 25.55 },
];
// captions: upper-centre, max 2 short lines, word groups timed from the narration word timestamps
export const CAPS = [
  [0.3, 2.62, ['Want a more useful', 'AI answer?']],
  [2.9, 4.33, ['Give it three things:']],
  [4.33, 5.74, ['a goal,', 'relevant context,']],
  [5.74, 7.95, ['and the shape of', 'the answer you need.']],
  [8.3, 11.25, ['Instead of saying', '“explain this,” try:']],
  [11.3, 14.33, ['“Explain this electricity bill', 'to a first-time renter,']],
  [14.33, 17.7, ['identify the charges,', 'and return a short table.”']],
  [18.1, 21.6, ['Then check important numbers', 'against the bill itself.']],
  [23.2, 25.5, ['A better prompt', 'helps direct the answer.']],
  [25.5, 29.3, ['It doesn’t make every claim', 'automatically true.']],
];
// action cues (s) — the score reads the same list
export const CUE = {
  slipOut: 0.0, slipHit: 0.45, slots: [3.2, 3.4, 3.6], slipAway: 3.0,
  goal: 4.6, ctx: 5.4, out: 6.6, strike: 9.45, tryTag: 10.05, oldAway: 10.6,
  line: [[11.3, 12.5], [12.5, 13.95], [14.35, 15.35], [15.9, 16.95]], billIn: 11.75,
  table: [16.95, 17.75], check: [18.45, 18.9, 19.35, 19.85, 21.0], fix: 20.45, fixOk: 20.75,
  direct: [23.9, 24.7], stamp: 27.25, stop: [28.4, 29.4], regMark: 28.9,
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a, b, x) => clamp((x - a) / (b - a));
const outBack = (k) => { const s = 1.8; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
const outCubic = (k) => 1 - Math.pow(1 - k, 3);
const inOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const NAVY = { navy: 1 }, DARK = { navy: 1, mint: 0.6, amber: 0.5 };
const SLOTS = [[125, 575, 240, 120], [420, 575, 240, 120], [715, 575, 240, 120]];
const CARD = [110, 852, 860, 330];
const BILL = [90, 1222, 410, 268];
const TABLE = [535, 1222, 455, 268];

const layer = new Layer(), capLayer = new Layer();
let FIELD = null;

function fieldSheet() {
  if (FIELD) return FIELD;
  const s = new Sheet().fromPaper();
  layer.begin([0, 0, W, H]);
  layer.fill((c) => { c.beginPath(); c.rect(0, 0, W, H); }, { amber: 0.06 });
  layer.fill((c) => { c.beginPath(); c.rect(0, 1580, W, 340); }, { amber: 0.2, navy: 0.06 });
  layer.print(s, PITCH.field, 0);
  FIELD = s; return s;
}

// ---------------------------------------------------------------- world drawing
function press(L, t, B) {
  // base + legs + diegetic nameplate (the channel signature)
  L.fill(roughRect(150, 1505, 780, 62, 14, 11, B), { navy: 0.85, mint: 0.15 });
  for (const x of [190, 850]) L.fill(roughRect(x, 1560, 40, 95, 8, 12 + x, B), { navy: 0.9, amber: 0.25 });
  L.fill(roughRect(360, 1520, 360, 34, 8, 13, B), { navy: 1, mint: 0.35 });
  L.text('IDEAVERSE · AI TIPS', 540, 1545, '700 20px JBM', {}, { align: 'center', knock: true, ls: 4 });
  // side frame rails
  for (const x of [92, 966]) L.fill(roughRect(x, 790, 22, 720, 8, 20 + x, B), { navy: 0.8, mint: 0.25 });
  // housing (deep teal-navy) with three paper slots
  L.fill(roughRect(90, 538, 900, 252, 26, 1, B), { navy: 0.9, mint: 0.35, amber: 0.15 });
  SLOTS.forEach(([x, y, w, h], i) => {
    const blink = CUE.slots[i] <= t && t < CUE.slots[i] + 0.3 ? 1 : 0;
    L.fill(roughRect(x - 6, y - 6, w + 12, h + 12, 14, 30 + i, B), blink ? { mint: 0.9 } : {});
    L.stroke(roughRect(x - 6, y - 6, w + 12, h + 12, 14, 40 + i, B, 2), { navy: 0.6 }, 3);
  });
  L.fill(roughRect(390, 708, 300, 34, 8, 14, B), { navy: 1, mint: 0.35 });
  L.text('PROMPT PRESS', 540, 733, '700 22px JBM', {}, { align: 'center', knock: true, ls: 6 });
  // drum with rolling mint stripes
  const run = t < CUE.stop[0] ? t : CUE.stop[0] + (1 - Math.pow(1 - inv(CUE.stop[0], CUE.stop[1], t), 2)) * (CUE.stop[1] - CUE.stop[0]) * 0.5;
  L.fill(roughRect(115, 790, 850, 52, 24, 2, B), { navy: 0.7, mint: 0.2 });
  for (let k = 0; k < 14; k++) {
    const x = 130 + ((k * 64 + run * 220) % 832);
    L.stroke((c) => { c.beginPath(); c.moveTo(x, 796); c.lineTo(x + 18, 836); }, { mint: 1 }, 7);
  }
  for (const x of [115, 965]) { L.fill((c) => { c.beginPath(); c.arc(x, 816, 32, 0, 7); }, { mint: 0.85, navy: 0.4 }); L.fill((c) => { c.beginPath(); c.arc(x, 816, 10, 0, 7); }, {}); }
}

function plate(L, i, t, B) {
  const land = [CUE.goal, CUE.ctx, CUE.out][i];
  const k = inv(land - 0.3, land, t); if (k <= 0) return;
  const [x, y, w, h] = SLOTS[i];
  let ox = 0, oy = 0;
  if (i === 0) ox = -700 * (1 - outCubic(k));
  if (i === 1) oy = 160 * (1 - outCubic(k));
  if (i === 2) ox = 700 * (1 - outCubic(k));
  const bump = t >= land && t < land + 0.25 ? 6 * Math.sin((t - land) * 40) * Math.exp(-(t - land) * 10) : 0;
  const X = x + ox, Y = y + oy + bump;
  const tone = [{ mint: 1 }, { navy: 1 }, { amber: 1 }][i];
  L.fill(roughRect(X, Y, w, h, 12, 50 + i, B), tone);
  const label = ['GOAL', 'CONTEXT', 'OUTPUT'][i];
  if (i === 1) L.text(label, X + w / 2 + 28, Y + h / 2 + 13, '700 36px SG7', {}, { align: 'center', knock: true });
  else L.text(label, X + w / 2 + 28, Y + h / 2 + 13, '700 36px SG7', NAVY, { align: 'center' });
  // icons
  const cx = X + 40, cy = Y + h / 2;
  if (i === 0) { for (const r of [24, 15, 6]) L.stroke((c) => { c.beginPath(); c.arc(cx, cy, r, 0, 7); }, NAVY, 4); }
  if (i === 1) {
    L.fill((c) => { c.beginPath(); c.moveTo(cx - 22, cy); c.lineTo(cx, cy - 20); c.lineTo(cx + 22, cy); c.lineTo(cx + 22, cy + 22); c.lineTo(cx - 22, cy + 22); c.closePath(); }, {});
    L.fill((c) => { c.beginPath(); c.rect(cx - 6, cy + 6, 12, 16); }, NAVY);
  }
  if (i === 2) { for (let r = 0; r < 3; r++) for (let q = 0; q < 2; q++) L.stroke((c) => { c.beginPath(); c.rect(cx - 22 + q * 22, cy - 18 + r * 12, 22, 12); }, NAVY, 2.5); }
}

function promptCard(L, t, B) {
  const [x, y, w, h] = CARD;
  L.fill(roughRect(x, y, w, h, 16, 60, B), {});
  L.stroke(roughRect(x, y, w, h, 16, 61, B, 1.8), { navy: 1 }, 4);
  L.stroke(roughRect(x + 3, y + 2, w - 4, h - 3, 16, 62, B, 2.2), { navy: 0.7 }, 1.8);
  L.text('PROMPT', x + 30, y + 42, '700 22px JBM', NAVY, { ls: 5 });
  // the weak prompt (hook) -> struck through -> replaced
  const oldA = 1 - inv(CUE.oldAway, CUE.oldAway + 0.4, t);
  if (oldA > 0) {
    const yy = y + 110 + 40 * (1 - oldA);
    L.text('Explain this.', x + 95, yy, '700 46px SG7', { navy: oldA > 0.5 ? 1 : 0.6 });
    const sk = inv(CUE.strike, CUE.strike + 0.3, t);
    if (sk > 0) L.stroke((c) => { c.beginPath(); c.moveTo(x + 88, yy - 15); c.lineTo(x + 88 + 300 * sk, yy - 17); }, { amber: 1 }, 10);
  }
  if (t >= CUE.tryTag && t < CUE.line[0][0] + 0.4) {
    const k = outBack(inv(CUE.tryTag, CUE.tryTag + 0.25, t)) * (1 - inv(CUE.line[0][0], CUE.line[0][0] + 0.4, t));
    L.fill(roughRect(x + w - 210, y + 18, 170 * k + 1, 54, 10, 63, B), { amber: 1 });
    if (k > 0.8) L.text('TRY:', x + w - 125, y + 57, '700 34px SG7', NAVY, { align: 'center' });
  }
  // the worked, three-layer prompt: each phrase prints in its plate colour as it is spoken
  const lines = [
    ['G', 'Explain this electricity bill', { mint: 0.5 }, { mint: 1 }],
    ['C', 'to a first-time renter,', { navy: 1 }, { navy: 1 }],
    ['G', 'identify the charges,', { mint: 0.5 }, { mint: 1 }],
    ['O', 'and return a short table.', { amber: 0.6 }, { amber: 1 }],
  ];
  lines.forEach(([chip, str, band, solid], i) => {
    const [a, b] = CUE.line[i], k = inv(a, b, t); if (k <= 0) return;
    const ly = y + 105 + i * 62, tx = x + 95;
    L.fill(roughRect(x + 30, ly - 38, 46, 46, 8, 70 + i, B), solid);
    if (chip === 'C') L.text(chip, x + 53, ly - 2, '700 30px SG7', {}, { align: 'center', knock: true });
    else L.text(chip, x + 53, ly - 2, '700 30px SG7', NAVY, { align: 'center' });
    const fullW = 40 + str.length * 23.5;
    const rw = fullW * outCubic(k);
    const knockText = chip === 'C';
    L.fill(roughRect(tx - 12, ly - 40, rw, 54, 6, 80 + i, B), band, { over: !knockText });
    L.each((c, key) => {
      if (knockText ? false : key !== 'navy' && key !== 'mask') return;
      c.beginPath(); c.rect(tx - 14, ly - 50, rw + 4, 70); c.clip();
      c.font = '700 44px SG7';
      if (knockText) c.fillStyle = key === 'mask' ? '#fff' : '#000';
      else { c.fillStyle = '#fff'; c.globalCompositeOperation = 'lighten'; }
      c.fillText(str, tx, ly);
    });
  });
}

const ROWS = [['Energy (312 kWh)', '$41.18', 'Energy', '$41.18'], ['Delivery', '$18.40', 'Delivery', '$18.40'], ['Service fee', '$9.00', 'Service fee', '$9.00'], ['Taxes', '$3.42', 'Taxes', '$3.24'], ['TOTAL DUE', '$72.00', 'Total', '$72.00']];

function bill(L, t, B) {
  const k = inv(CUE.billIn - 0.3, CUE.billIn, t); if (k <= 0) return;
  const [x0, y, w, h] = BILL, x = x0 - 560 * (1 - outCubic(k));
  L.fill(roughRect(x, y, w, h, 10, 90, B), {});
  L.stroke(roughRect(x, y, w, h, 10, 91, B, 1.8), { navy: 1 }, 3.5);
  L.fill(roughRect(x + 18, y + 16, 130, 34, 6, 92, B), { amber: 1 });
  L.text('EXAMPLE', x + 83, y + 41, '700 20px JBM', NAVY, { align: 'center', ls: 2 });
  L.text('SAMPLE BILL', x + 162, y + 41, '700 20px JBM', NAVY, { ls: 2 });
  ROWS.forEach(([a, v], i) => {
    const ry = y + 94 + i * 37, bold = i === 4;
    if (bold) L.stroke((c) => { c.beginPath(); c.moveTo(x + 18, ry - 28); c.lineTo(x + w - 18, ry - 28); }, NAVY, 2);
    L.text(a, x + 20, ry, `700 ${bold ? 23 : 22}px JBM`, NAVY);
    L.text(v, x + w - 20, ry, `700 ${bold ? 23 : 22}px JBM`, NAVY, { align: 'right' });
  });
}

function answer(L, t, B) {
  const [x, y, w, h] = TABLE;
  // hook: a vague answer slip shoots out of the press and is swept away when the plates arrive
  if (t < CUE.slipAway + 0.45) {
    const fly = outBack(inv(CUE.slipOut - 0.5, CUE.slipHit, t)), away = outCubic(inv(CUE.slipAway, CUE.slipAway + 0.45, t));
    const sx = x + 60 + 620 * away, sy = 860 + (y - 860) * fly + 30, rot = -0.08 + 0.2 * away;
    L.transform((c) => { c.translate(sx + 170, sy + 120); c.rotate(rot); c.translate(-(sx + 170), -(sy + 120)); });
    const j = wob(95, B, 2.5);
    L.fill((c) => { c.beginPath(); c.roundRect(sx, sy, 340, 240, 10); }, {});
    L.stroke((c) => { c.beginPath(); c.roundRect(sx, sy, 340, 240, 10); }, { navy: 0.8 }, 3);
    L.text('ANSWER', sx + 24, sy + 40, '700 20px JBM', NAVY, { ls: 4 });
    for (let i = 0; i < 4; i++) L.stroke((c) => { c.beginPath(); c.moveTo(sx + 26, sy + 80 + i * 36); for (let q = 1; q <= 8; q++) c.lineTo(sx + 26 + q * 26 * (i === 3 ? 0.6 : 1), sy + 80 + i * 36 + j() * 3 + (q % 2 ? 6 : -6)); }, { navy: 0.45 }, 5);
    L.text('?', sx + 290, sy + 200, '700 70px SG7', { amber: 1 }, { align: 'center' });
    L.transform((c) => c.setTransform(1, 0, 0, 1, 0, 0));
    return;
  }
  const k = inv(CUE.table[0], CUE.table[1], t); if (k <= 0) return;
  L.fill(roughRect(x, y, w, h, 10, 100, B), {});
  L.stroke(roughRect(x, y, w, h, 10, 101, B, 1.8), { navy: 1 }, 3.5);
  L.fill(roughRect(x + 18, y + 16, 120, 34, 6, 102, B), { amber: 1 });
  L.text('ANSWER', x + 78, y + 41, '700 20px JBM', NAVY, { align: 'center', ls: 2 });
  L.text('short table', x + 152, y + 41, '700 20px JBM', NAVY);
  ROWS.forEach(([, , a, v], i) => {
    const rk = inv(CUE.table[0] + i * 0.12, CUE.table[0] + i * 0.12 + 0.2, t); if (rk <= 0) return;
    const ry = y + 94 + i * 37, bold = i === 4;
    L.stroke((c) => { c.beginPath(); c.moveTo(x + 18, ry + 10); c.lineTo(x + 18 + (w - 36) * rk, ry + 10); }, { navy: 0.35 }, 1.5);
    L.text(a, x + 20, ry, `700 ${bold ? 23 : 22}px JBM`, NAVY);
    let val = v;
    if (i === 3 && t >= CUE.fix) val = '$3.42';
    L.text(val, x + w - 64, ry, `700 ${bold ? 23 : 22}px JBM`, i === 3 && t >= CUE.fix ? { navy: 1, amber: 1 } : NAVY, { align: 'right' });
  });
}

function checks(L, t, B) {
  if (t < CUE.check[0] - 0.2) return;
  const [bx, by, bw] = BILL, [tx, ty, tw] = TABLE;
  const order = CUE.check;
  // the loupe travels row to row across both sheets
  let row = 0; for (let i = 0; i < order.length; i++) if (t >= order[i] - 0.25) row = i;
  const ry = by + 94 + row * 37 - 8;
  const fade = 1 - inv(22.6, 23.1, t);
  if (fade > 0) {
    L.stroke((c) => { c.beginPath(); c.moveTo(bx + bw - 10, ry); c.lineTo(tx + 10, ry); }, { amber: fade }, 4);
    L.stroke((c) => { c.beginPath(); c.ellipse(bx + bw - 62, ry, 70, 24, 0, 0, 7); }, { amber: fade }, 5);
    L.stroke((c) => { c.beginPath(); c.ellipse(tx + tw - 110, ry, 70, 24, 0, 0, 7); }, { amber: fade }, 5);
  }
  order.forEach((tc, i) => {
    if (t < tc) return;
    const cy = ty + 94 + i * 37 - 8, cx = tx + tw - 30;
    if (i === 3 && t < CUE.fixOk) {   // mismatch: answer said $3.24, the bill says $3.42
      L.stroke((c) => { c.beginPath(); c.moveTo(cx - 12, cy - 12); c.lineTo(cx + 12, cy + 12); c.moveTo(cx + 12, cy - 12); c.lineTo(cx - 12, cy + 12); }, { amber: 1, navy: 0.5 }, 6);
      return;
    }
    L.stroke((c) => { c.beginPath(); c.moveTo(cx - 13, cy); c.lineTo(cx - 3, cy + 10); c.lineTo(cx + 14, cy - 12); }, { mint: 1, navy: 0.55 }, 7);
  });
  if (t >= CUE.check[3] && t < CUE.fix + 0.3) {
    const k = inv(CUE.check[3], CUE.check[3] + 0.25, t);
    L.stroke((c) => { c.beginPath(); c.moveTo(tx + tw - 160, ty + 94 + 3 * 37 - 7); c.lineTo(tx + tw - 160 + 100 * k, ty + 94 + 3 * 37 - 9); }, { amber: 1 }, 6);
  }
}

function direct(L, t, B) {
  const k = inv(CUE.direct[0], CUE.direct[1], t), fade = 1 - inv(25.4, 25.9, t);
  if (k <= 0 || fade <= 0) return;
  // the three plate colours run from the prompt card down into the answer: the prompt directs the output
  [[{ mint: 1 }, 0], [{ navy: 1 }, 1], [{ amber: 1 }, 2]].forEach(([tone, i]) => {
    const kk = outCubic(clamp(k * 1.5 - i * 0.25)) * fade; if (kk <= 0) return;
    const y0 = CARD[1] + 105 + [0, 1, 3][i] * 62 - 14, x0 = CARD[0] + CARD[2] - 4;    // from its prompt line
    const x1 = TABLE[0] + 150 + i * 110, y1 = TABLE[1] + 6, cx = 1040 - i * 22, cy = (y0 + y1) / 2 + 40;
    const pt = (u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1];
    L.stroke((c) => { c.beginPath(); for (let q = 0; q <= 24; q++) { const [x, y] = pt((q / 24) * kk); q ? c.lineTo(x, y) : c.moveTo(x, y); } }, tone, 8);
    if (kk > 0.97) L.fill((c) => { c.beginPath(); c.moveTo(x1 - 15, y1 - 22); c.lineTo(x1 + 15, y1 - 22); c.lineTo(x1, y1); c.closePath(); }, tone, { over: true });
  });
}

function stamp(L, t, B) {
  if (t < CUE.stamp) return;
  const k = outBack(inv(CUE.stamp, CUE.stamp + 0.2, t));
  const s = (1.4 - 0.4 * k) * 0.85;
  L.transform((c) => { c.translate(822, 1190); c.rotate(-0.1); c.scale(s, s); });
  L.fill((c) => { c.beginPath(); c.roundRect(-170, -40, 340, 80, 12); }, { amber: 1 });
  L.stroke((c) => { c.beginPath(); c.roundRect(-160, -31, 320, 62, 9); }, NAVY, 3);
  L.text('STILL CHECK IT', 0, 13, '700 34px SG7', NAVY, { align: 'center' });
  L.transform((c) => c.setTransform(1, 0, 0, 1, 0, 0));
}

function regMark(L, t) {
  const k = inv(CUE.regMark, CUE.regMark + 0.5, t); if (k <= 0) return;
  const cx = 540, cy = 1630, r = 26;
  L.stroke((c) => { c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); }, { navy: 1, mint: 1, amber: 1 }, 4);
  if (k > 0.5) L.stroke((c) => { c.beginPath(); c.moveTo(cx - 44, cy); c.lineTo(cx + 44, cy); c.moveTo(cx, cy - 44); c.lineTo(cx, cy + 44); }, { navy: 1, mint: 1, amber: 1 }, 3);
}

// ---------------------------------------------------------------- captions (printed type, navy key plate)
function captionAt(t) { return CAPS.find(([a, b]) => t >= a && t < b); }
function printCaption(sheet, t, B) {
  const cap = captionAt(t); if (!cap) return null;
  const [a, b, lines] = cap;
  const kin = inv(a, a + 0.15, t), kout = 1 - inv(b - 0.12, b, t), k = Math.min(kin, kout);
  if (k <= 0) return null;
  capLayer.begin([60, 330, W - 120, 170]);
  let size = 58; capLayer.cx.navy.font = `700 ${size}px SG7`;
  while (Math.max(...lines.map((l) => capLayer.cx.navy.measureText(l).width)) > 920 && size > 46) { size -= 2; capLayer.cx.navy.font = `700 ${size}px SG7`; }
  const base = lines.length === 1 ? [428] : [398, 456];
  lines.forEach((l, i) => capLayer.text(l, W / 2, base[i] + (1 - k) * 10, `700 ${size}px SG7`, { navy: k > 0.6 ? 1 : 0.55 }, { align: 'center' }));
  capLayer.print(sheet, PITCH.fine, B);
  return { size, lines };
}

export function captionInfo(t) {
  const cap = captionAt(t); if (!cap) return null;
  capLayer.cx.navy.font = '700 58px SG7'; let size = 58;
  while (Math.max(...cap[2].map((l) => capLayer.cx.navy.measureText(l).width)) > 920 && size > 46) { size -= 2; capLayer.cx.navy.font = `700 ${size}px SG7`; }
  return { size, widths: cap[2].map((l) => Math.round(capLayer.cx.navy.measureText(l).width)), lines: cap[2] };
}

// ---------------------------------------------------------------- frame
const out = new Sheet();
export function renderFrame(f) {
  const B = Math.floor(f / 2), t = (B * 2) / FPS;     // on 2s
  out.copyFrom(fieldSheet());
  layer.begin([60, 520, W - 120, 1180]);
  press(layer, t, B);
  for (let i = 0; i < 3; i++) plate(layer, i, t, B);
  promptCard(layer, t, B);
  bill(layer, t, B);
  answer(layer, t, B);
  checks(layer, t, B);
  direct(layer, t, B);
  stamp(layer, t, B);
  regMark(layer, t);
  layer.print(out, PITCH.world, B);
  printCaption(out, t, B);
  return out.toRGBA();
}
