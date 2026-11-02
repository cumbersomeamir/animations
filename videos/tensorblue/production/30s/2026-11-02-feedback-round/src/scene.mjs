// Tensorblue 30s feedback-round 01 — "Why retrying a payment should not create another charge"
// Blue Receipt Theatre: one checkout, one blue purchase token (its white notch bars = the key),
// one white receipt. Nine staged scenes joined by purposeful blue wipes; every cue is timed
// from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword,
  KEY_A, KEY_B, token, pill, receipt, mug, isoP, isoBox, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- cues ---------------------------------------------------------------------------
const T = {
  pay: VW('L1', 'pay'), connection: VW('L1', 'connection'), drops: VW('L1', 'drops'),
  retrying: VW('L2', 'retry'), charge: VW('L2', 'charge'), twice: VW('L2', 'twice'),
  checkout: VW('L3', 'checkout'), sends: VW('L3', 'sends'), unique: VW('L3', 'unique'), key3: VW('L3', 'key'),
  retry: VW('L4', 'retry'), arrives: VW('L4', 'arrives'), same4: VW('L4', 'same'), server: VW('L4', 'server'), returns: VW('L4', 'returns'),
  saved: VW('L4', 'saved'), instead: VW('L4', 'instead'), charging: VW('L4', 'charging'),
  called: VW('L5', 'called'), idem: VW('L5', 'idempotency'),
  keep: VW('L6', 'keep'), same6: VW('L6', 'same'), retries: VW('L6', 'retries'), purchase6: VW('L6', 'purchase'),
  newKey: VW('L7', 'new'), request: VW('L7', 'request'),
  one1: VW('L8', 'one', 1), one2: VW('L8', 'one', 2), one3: VW('L8', 'one', 3), receipt: VW('L8', 'receipt'),
  follow: VW('L9', 'follow'), tb: VW('L9', 'tensorblue'), simply: VW('L9', 'simply'),
};
// scene starts (wipes centred on these times)
const SC = [0, VL('L1').t1 + 0.1, VL('L2').t1 + 0.3, VL('L3').t1 + 0.15, VL('L4').t1 + 0.0, VL('L5').t1 + 0.08, VL('L6').t1 + 0.12, VL('L7').t1 + 0.1, VL('L9').t0 - 0.35, 30.01];
const WIPE = 0.5;
// wipe directions: 1 = left->right, -1 = right->left, 2 = bottom->top
const WDIR = [0, 1, -1, 2, 1, -1, 1, -1, 2];
T.chime = VL('L8').t1 + 0.15;
export const CUES = { ...T, scenes: SC };

// ---- captions (screen space; ink inside y 340–520, x 90–990, <= 2 lines) -------------------
const CAPS = [
  { t0: VL('L1').t0, lines: ['You tap Pay.'] },
  { t0: VW('L1', 'the'), lines: ['The connection drops.'] },
  { t0: VL('L2').t0, lines: ['Should a retry', 'charge you twice?'] },
  { t0: VL('L3').t0, lines: ['A well-designed checkout', 'sends that purchase'] },
  { t0: VW('L3', 'with'), lines: ['with one unique key.'] },
  { t0: VL('L4').t0, lines: ['If a retry arrives', 'with the same key,'] },
  { t0: VW('L4', 'the', 2), lines: ['the server returns', 'the saved result,'] },
  { t0: VW('L4', 'instead'), lines: ['instead of charging again.'] },
  { t0: VL('L5').t0, lines: ['This is called idempotency.'] },
  { t0: VL('L6').t0, lines: ['Keep the same key', 'for retries of one purchase.'] },
  { t0: VL('L7').t0, lines: ['A new key means', 'a new request.'] },
  { t0: VL('L8').t0, lines: ['One purchase, one key,', 'one receipt.'], tEnd: VL('L8').t1 + 0.9 },
  { t0: VL('L9').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.6 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 880;
const CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px InterSB`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, 540, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', alpha: a });
}

// ---- scenes (each drawn with absolute t) ---------------------------------------------------
const STAGE_TOP = 540;

// S1: checkout — tap Pay, the token leaves, the connection drops
function s1(ctx, t) {
  const x = 150, y = 640, w = 780, h = 680;
  const settle = 1; // fully drawn from frame 0: the opening frame is the real checkout
  ctx.save(); S.alpha = settle;
  shadow(ctx, 540, y + h + 24, 420, 40, 0.7);
  ctx.fillStyle = C.pale; rr(ctx, x, y, w, h, 44); ctx.fill();
  text(ctx, 'Checkout', x + 56, y + 96, { size: 58, font: 'IDXB', color: C.ink, align: 'left' });
  // connection glyph (top-right of the card): arcs vanish when the connection drops
  const gx = x + w - 92, gy = y + 92, lost = ev(t, T.drops - 0.08, 0.3);
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const a = 1 - clamp(lost * 3 - (2 - i)); if (a <= 0) continue; ctx.globalAlpha = S.alpha * a; ctx.beginPath(); ctx.arc(gx, gy, 14 + i * 13, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); }
  ctx.globalAlpha = S.alpha; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(gx, gy - 2, 5, 0, Math.PI * 2); ctx.fill();
  if (lost > 0.6) { ctx.strokeStyle = C.blue; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(gx - 32, gy - 48); ctx.lineTo(gx + 32 * clamp(lost * 2 - 1) * 2 - 32, gy - 48 + 64 * clamp(lost * 2 - 1)); ctx.stroke(); }
  ctx.restore();
  mug(ctx, x + 56, y + 160, 86);
  text(ctx, 'Blue mug', x + 168, y + 218, { size: 46, font: 'InterSB', color: C.ink, align: 'left' });
  text(ctx, '$18.00', x + w - 56, y + 218, { size: 46, font: 'InterSB', color: C.ink, align: 'right' });
  ctx.fillStyle = 'rgba(3,6,16,0.14)'; ctx.fillRect(x + 56, y + 290, w - 112, 3);
  text(ctx, 'Total', x + 56, y + 366, { size: 44, font: 'InterSB', color: C.ink, align: 'left' });
  text(ctx, '$18.00', x + w - 56, y + 366, { size: 54, font: 'IDXB', color: C.ink, align: 'right' });
  // Pay button
  const press = clamp(1 - Math.abs(t - T.pay) / 0.12);
  const bx = x + 56, by = y + 420, bw = w - 112, bh = 140;
  ctx.save(); ctx.translate(540, by + bh / 2); ctx.scale(1 - 0.035 * press, 1 - 0.035 * press); ctx.translate(-540, -(by + bh / 2));
  ctx.globalAlpha = S.alpha; ctx.fillStyle = C.blueDeep; rr(ctx, bx, by + 8, bw, bh, 36); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, bx, by + 8 * press, bw, bh, 36); ctx.fill();
  text(ctx, 'Pay $18.00', 540, by + 94 + 8 * press, { size: 60, font: 'IDXB' });
  ctx.restore();
  // status line inside the card
  if (t > T.pay + 0.1 && t < T.drops) text(ctx, 'Sending…', 540, y + h - 44, { size: 40, font: 'InterSB', color: C.ink, alpha: ev(t, T.pay + 0.1, 0.2) });
  if (t >= T.drops) text(ctx, 'No response', 540, y + h - 44, { size: 40, font: 'InterB', color: C.ink, alpha: ev(t, T.drops, 0.2) });
  ctx.restore(); S.alpha = 1;
  // the purchase token leaves the button and stalls when the connection drops
  const go = ev(t, T.pay + 0.08, 0.9), stall = t >= T.drops;
  if (t > T.pay + 0.05) {
    const k = stall ? ease(ev(T.drops, T.pay + 0.08, 0.9)) : ease(go);
    const tx = lerp(540, 690, k), ty = lerp(y + 490, y + 16, k) - Math.sin(Math.PI * k) * 40;
    const sz = lerp(60, 120, easeOut(ev(t, T.pay + 0.05, 0.3)));
    token(ctx, tx, ty, sz, { key: KEY_A, dim: stall ? ev(t, T.drops, 0.25) * 0.6 : 0, showId: false });
    if (stall) pill(ctx, tx, ty - 86, 'no reply', { size: 30, fill: C.ink, color: C.white, alpha: ev(t, T.drops + 0.05, 0.2) });
  }
  // kinetic type under the card
  const cw1 = textW(ctx, 'Connection ', 86, 'IDXB', -1), cw2 = textW(ctx, 'lost.', 86, 'IDXB', -1), cx0 = 540 - (cw1 + cw2) / 2;
  kword(ctx, 'Connection ', cx0, 1440, 86, t, T.connection, { align: 'left' });
  kword(ctx, 'lost.', cx0 + cw1, 1440, 86, t, T.drops + 0.05, { align: 'left', color: C.blue });
}

// S2: before/after fear — "Charged twice?"
function s2(ctx, t) {
  const t0 = SC[1];
  const a = easeOut(ev(t, t0 - 0.1, 0.4)), b = easeOut(ev(t, T.charge - 0.08, 0.45)); // first charge is there as the scene opens
  receipt(ctx, 150 + (1 - a) * -60, 650, 360, 470, { order: '#1042', alpha: a, rot: -0.04 });
  receipt(ctx, 570 + (1 - b) * 120, 650, 360, 470, { order: '#1043', alpha: b, rot: 0.04 });
  if (b > 0.5) {
    pill(ctx, 330, 1190, 'charge 1', { size: 32, fill: C.pale, alpha: ev(t, T.charge + 0.1, 0.2) });
    pill(ctx, 750, 1190, 'charge 2?', { size: 32, fill: C.blue, color: C.white, alpha: ev(t, T.charge + 0.2, 0.2) });
  }
  kword(ctx, 'Charged', 540, 1380, 104, t, Math.max(t0 + 0.2, T.charge - 0.05));
  kword(ctx, 'twice?', 540, 1490, 104, t, T.twice - 0.05, { color: C.blue });
}

// S3: one purchase, one unique key (close-up of the token)
function s3(ctx, t) {
  const cx0 = 300, cy0 = 880;
  // mini checkout card
  const ca = easeOut(ev(t, SC[2], 0.4));
  S.alpha = ca;
  ctx.fillStyle = C.pale; ctx.globalAlpha = ca; rr(ctx, 110, 700, 380, 360, 34); ctx.fill(); ctx.globalAlpha = 1;
  text(ctx, 'Checkout', 150, 768, { size: 40, font: 'IDXB', color: C.ink, align: 'left' });
  const hl = clamp(1 - Math.abs(t - T.checkout - 0.15) / 0.3);
  ctx.globalAlpha = ca; ctx.fillStyle = C.blue; rr(ctx, 150, 940, 300, 84, 24); ctx.fill(); ctx.globalAlpha = 1;
  if (hl > 0) { ctx.save(); ctx.globalAlpha = hl; ctx.strokeStyle = C.blue; ctx.lineWidth = 6; rr(ctx, 140, 930, 320, 104, 30); ctx.stroke(); ctx.restore(); }
  text(ctx, 'Pay $18.00', 300, 997, { size: 38, font: 'IDXB' });
  text(ctx, 'Blue mug', 150, 840, { size: 34, font: 'InterSB', color: C.ink, align: 'left' });
  S.alpha = 1;
  // token travels out of the card and grows; the key bars are cut in on "unique key"
  const k = ease(ev(t, T.sends - 0.05, 0.75));
  if (t >= T.sends - 0.05) {
    const x = lerp(cx0, 720, k), y = lerp(cy0 + 100, 900, k) - Math.sin(Math.PI * k) * 80, s = lerp(70, 300, k);
    const bars = easeOut(ev(t, T.unique - 0.1, 0.45));
    token(ctx, x, y, s, { key: { bars: KEY_A.bars.map((b) => b * bars), id: bars > 0.95 ? KEY_A.id : '' }, showId: bars > 0.95 });
    if (bars > 0) pill(ctx, 720, 690, 'unique key', { size: 38, fill: C.pale, alpha: ev(t, T.key3 - 0.1, 0.25) });
  }
  // kinetic equation
  const ky = 1330;
  kword(ctx, '1 purchase', 540, ky, 88, t, T.sends + 0.1);
  kword(ctx, '= 1 key', 540, ky + 100, 88, t, T.key3 - 0.05, { color: C.blue });
}

// S4: the isometric checkout stage with the physical duplicate-check slot
const O4 = { x: 458, y: 905, u: 95 };
function s4(ctx, t) {
  const o = O4; const P = (x, y, z) => isoP(o, x, y, z);
  const rise = easeOut(ev(t, SC[3], 0.5));
  ctx.save(); ctx.translate(0, (1 - rise) * 80); S.alpha = rise;
  // stage slab
  isoBox(ctx, o, 0, 0, -0.45, 6, 4, 0.45, { top: C.slab, left: C.slabSide, right: '#091428', edge: 'rgba(183,199,223,0.35)' });
  // conveyor lane on the stage (static), leading into the slot
  ctx.save(); ctx.globalAlpha = S.alpha;
  const lane = [P(3.55, 4.0, 0.01), P(4.85, 4.0, 0.01), P(4.85, 2.6, 0.01), P(3.55, 2.6, 0.01)];
  ctx.fillStyle = 'rgba(183,199,223,0.10)'; ctx.beginPath(); lane.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill();
  ctx.restore();
  // machine
  const mx = 3.0, my = 0.6, mdx = 2.4, mdy = 2.0, mdz = 2.4;
  isoBox(ctx, o, mx, my, 0, mdx, mdy, mdz, { top: C.pale, left: C.gray, right: C.grayMid, edge: 'rgba(3,6,16,0.25)' });
  // label on the machine's left (+y) face
  const lp = P(mx + 0.2, my + mdy, mdz - 0.38);
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.transform(0.866, 0.5, 0, 1, 0, 0); // skew onto the iso face
  // inverse-map the anchor into the skewed frame: x' = X/0.866, y' = Y - 0.5*x'
  const ax = lp[0] / 0.866, ay = lp[1] - 0.5 * ax;
  ctx.font = '30px IDXB'; ctx.fillStyle = C.ink; ctx.fillText('DUPLICATE', ax, ay);
  ctx.fillText('CHECK', ax, ay + 36);
  ctx.restore();
  // the slot (dark) on the +y face; glows blue on a match
  const match = ev(t, T.same4 + 0.1, 0.3) * (1 - ev(t, SC[4] - 0.1, 0.1));
  const sl = [P(mx + 0.4, my + mdy + 0.001, 1.15), P(mx + 2.0, my + mdy + 0.001, 1.15), P(mx + 2.0, my + mdy + 0.001, 0.75), P(mx + 0.4, my + mdy + 0.001, 0.75)];
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = match > 0 ? `rgb(${lerp(3, 59, match) | 0},${lerp(6, 130, match) | 0},${lerp(16, 246, match) | 0})` : C.ink;
  ctx.beginPath(); sl.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
  S.alpha = 1;
  // saved-result card (what the server remembers): key 7F3A -> receipt #1042
  const sa = easeOut(ev(t, SC[3] + 0.2, 0.4));
  if (sa > 0) {
    S.alpha = sa;
    shadow(ctx, 540, 742, 300, 18, 0.5);
    ctx.fillStyle = C.pale; ctx.globalAlpha = sa; rr(ctx, 230, 580, 620, 150, 30); ctx.fill(); ctx.globalAlpha = 1;
    text(ctx, 'SAVED', 262, 624, { size: 26, font: 'IDXB', color: C.blueDeep, align: 'left', track: 3 });
    token(ctx, 330, 672, 64, { key: KEY_A, showId: false, shadowOn: false });
    text(ctx, 'key 7F3A', 380, 688, { size: 36, font: 'InterB', color: C.ink, align: 'left' });
    text(ctx, '→', 572, 690, { size: 44, font: 'InterB', color: C.ink });
    receipt(ctx, 612, 606, 84, 106, { order: '', keyRef: null, alpha: sa });
    text(ctx, '#1042', 716, 688, { size: 36, font: 'IDXB', color: C.blue, align: 'left' });
    S.alpha = 1;
  }
  // the retry token slides along the lane into the slot
  const rk = ease(ev(t, T.retry - 0.05, T.same4 + 0.05 - (T.retry - 0.05)));
  if (t >= T.retry - 0.05 && t < T.same4 + 0.4) {
    const p0 = P(4.2, 4.6, 0.95), p1 = P(4.2, 2.65, 0.95);
    const x = lerp(p0[0], p1[0], rk), y = lerp(p0[1], p1[1], rk);
    token(ctx, x, y - 20, 130, { key: KEY_A, tag: 'retry', alpha: 1 - ev(t, T.same4 + 0.1, 0.25) });
  }
  // match readout
  if (match > 0) pill(ctx, 360, 800, 'same key ✓', { size: 40, fill: C.blue, color: C.white, alpha: match });
  // the SAME saved receipt comes back out (no new one is printed)
  const out = ease(ev(t, T.returns - 0.05, 0.9));
  if (t >= T.returns - 0.05 && t < SC[4] + WIPE) {
    const x = lerp(690, 655, out), y = lerp(800, 1045, out), w = lerp(90, 285, out), h = lerp(112, 365, out);
    receipt(ctx, x, y, w, h, { order: '#1042', keyRef: KEY_A, label: out > 0.95 ? 'same receipt' : null });
  }
  // a second charge would have been another receipt: shown as a ghost, then cancelled
  const gk = ev(t, T.instead - 0.05, 0.3), gx = ev(t, T.charging + 0.2, 0.35);
  if (gk > 0 && gx < 1) {
    S.alpha = gk * (1 - gx);
    receipt(ctx, 110, 1010, 230, 290, { order: '#1043', ghost: true, keyRef: null });
    ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.lineCap = 'round';
    const k = ev(t, T.charging - 0.05, 0.25);
    ctx.beginPath(); ctx.moveTo(120, 1020); ctx.lineTo(120 + 210 * k, 1020 + 270 * k); ctx.stroke(); ctx.restore();
    S.alpha = 1;
  }
  if (gk > 0) pill(ctx, 225, 1360, 'no second charge', { size: 34, fill: C.pale, alpha: ev(t, T.charging, 0.25) });
}

// S5: kinetic typography — the name
function s5(ctx, t) {
  kword(ctx, 'This is called', 540, 820, 54, t, SC[4] + 0.15, { font: 'IDB', color: C.gray });
  kword(ctx, 'idempotency', 540, 990, 136, t, T.idem - 0.12, { color: C.white });
  // compact reminder: same key -> same result
  const r = easeOut(ev(t, T.idem + 0.35, 0.4));
  if (r > 0) {
    S.alpha = r;
    token(ctx, 330, 1210, 120, { key: KEY_A, showId: true });
    text(ctx, '+', 455, 1232, { size: 60, font: 'IDXB', color: C.gray });
    token(ctx, 580, 1210, 120, { key: KEY_A, showId: true });
    text(ctx, '→', 700, 1232, { size: 64, font: 'IDXB', color: C.gray });
    receipt(ctx, 750, 1120, 150, 190, { order: '#1042', keyRef: null });
    S.alpha = 1;
  }
  kword(ctx, 'same key, same result', 540, 1420, 56, t, T.idem + 0.55, { font: 'IDB', color: C.blue });
}

// S6: close-up of matched request IDs
function s6(ctx, t) {
  const t0 = SC[5];
  const a = easeOut(ev(t, t0, 0.35));
  const merge = ease(ev(t, T.retries - 0.05, 0.75));
  const lx = lerp(300, 470, merge), rx = lerp(780, 610, merge), ty = lerp(870, 1010, merge), ts = lerp(260, 140, merge);
  // the one receipt both attempts point to
  if (merge > 0) receipt(ctx, 380, 1060, 320, 400, { order: '#1042', keyRef: KEY_A, alpha: merge });
  text(ctx, 'first try', 300, 680, { size: 40, font: 'InterB', color: C.gray, alpha: a * (1 - merge) });
  text(ctx, 'retry', 780, 680, { size: 40, font: 'InterB', color: C.gray, alpha: a * (1 - merge) });
  token(ctx, lx, ty, ts, { key: KEY_A, alpha: a });
  token(ctx, rx, ty, ts, { key: KEY_A, alpha: a, rot: 0 });
  const eq = ev(t, T.same6 - 0.05, 0.25) * (1 - merge);
  if (eq > 0) text(ctx, '=', 540, 905, { size: 130, font: 'IDXB', color: C.blue, alpha: eq });
  // matching IDs underlined
  const ul = ev(t, T.same6, 0.35) * (1 - merge);
  if (ul > 0) { ctx.save(); ctx.globalAlpha = ul; ctx.fillStyle = C.blue; ctx.fillRect(300 - 70, 1020, 140 * ul, 8); ctx.fillRect(780 - 70, 1020, 140 * ul, 8); ctx.restore(); }
  if (ul > 0) { text(ctx, 'key 7F3A', 300, 1090, { size: 44, font: 'IDXB', alpha: ul }); text(ctx, 'key 7F3A', 780, 1090, { size: 44, font: 'IDXB', alpha: ul }); }
}

// S7: a new key is a new request (cautionary)
function s7(ctx, t) {
  const t0 = SC[6];
  const a = easeOut(ev(t, t0, 0.35));
  // left: the original purchase
  S.alpha = a;
  token(ctx, 290, 760, 140, { key: KEY_A });
  receipt(ctx, 160, 900, 260, 330, { order: '#1042', keyRef: KEY_A });
  S.alpha = 1;
  // right: a token with a different key arrives and gets a NEW receipt
  const nk = easeOut(ev(t, T.newKey - 0.05, 0.4));
  token(ctx, lerp(1000, 790, nk), 760, 140, { key: KEY_B, tag: 'new key', alpha: nk });
  const pr = easeOut(ev(t, T.request - 0.15, 0.45));
  if (pr > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(560, 880, 460, 600); ctx.clip();
    receipt(ctx, 660, lerp(560, 900, pr), 260, 330, { order: '#1043', keyRef: KEY_B, label: 'new request' });
    ctx.restore();
  }
  kword(ctx, 'new key', 540, 1340, 80, t, T.newKey, { color: C.blue });
  kword(ctx, '= new request', 540, 1440, 80, t, T.request - 0.05);
}

// S8: the clean outcome — one order, one receipt
function s8(ctx, t) {
  const t0 = SC[7];
  const a = easeOut(ev(t, t0, 0.4));
  S.alpha = a;
  ctx.fillStyle = C.pale; ctx.globalAlpha = a; rr(ctx, 150, 590, 780, 120, 36); ctx.fill(); ctx.globalAlpha = 1;
  text(ctx, 'Order placed', 210, 670, { size: 50, font: 'IDXB', color: C.ink, align: 'left' });
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.blue; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(810, 652); ctx.lineTo(836, 676); ctx.lineTo(878, 628); ctx.stroke(); ctx.restore();
  const settle = easeOut(ev(t, t0 + 0.1, 0.6));
  receipt(ctx, 480, 800 + (1 - settle) * 40, 400, 520, { order: '#1042', keyRef: KEY_A, rot: 0.02 });
  const dock = back(ev(t, T.chime - 0.25, 0.45));
  token(ctx, lerp(700, 878, dock), lerp(1430, 756, ease(ev(t, T.chime - 0.25, 0.45))), lerp(130, 112, dock), { key: KEY_A, rot: lerp(0, 0.14, dock) });
  S.alpha = 1;
  const rows = [['1', 'purchase', T.one1], ['1', 'key', T.one2], ['1', 'receipt', T.one3]];
  rows.forEach(([n, wd, tt], i) => {
    const y = 930 + i * 150;
    kword(ctx, n, 120, y, 110, t, tt - 0.05, { align: 'left', color: C.blue });
    kword(ctx, wd, 200, y, 60, t, tt, { align: 'left', font: 'IDB' });
  });
}

// S9: CTA — Tensorblue
function s9(ctx, t) {
  const t0 = SC[8];
  const lk = back(ev(t, t0 + 0.05, 0.5));
  if (lk > 0) {
    const h = 300 * lk, w = h * 200 / 260;
    shadow(ctx, 540, 1020, 120 * lk, 18, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(lk); ctx.drawImage(LOGO, 540 - w / 2, 690 + (300 - h), w, h); ctx.restore();
  }
  // wordmark: "Tensor" white + "blue" blue (the logo's white-on-blue relationship)
  const size = 128, w1 = textW(ctx, 'Tensor', size, 'IDXB', -2), w2 = textW(ctx, 'blue', size, 'IDXB', -2);
  const x0 = 540 - (w1 + w2) / 2;
  kword(ctx, 'Tensor', x0, 1160, size, t, T.tb - 0.1, { align: 'left' });
  kword(ctx, 'blue', x0 + w1, 1160, size, t, T.tb - 0.02, { align: 'left', color: C.blue });
  kword(ctx, 'software explained simply', 540, 1250, 50, t, T.tb + 0.5, { font: 'IDB', color: C.gray });
  const fk = back(ev(t, T.follow - 0.05, 0.35));
  if (fk > 0) {
    ctx.save(); ctx.translate(540, 1370); ctx.scale(fk, fk); ctx.translate(-540, -1370);
    ctx.fillStyle = C.blue; rr(ctx, 540 - 150, 1370 - 50, 300, 100, 50); ctx.fill();
    text(ctx, 'Follow', 540, 1388, { size: 50, font: 'IDXB' });
    ctx.restore();
  }
}

const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9];

// ---- SFX events (each tied to an on-screen action) --------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(T.pay - 0.03, 'tap'); add(T.pay + 0.1, 'clack'); add(T.drops - 0.05, 'drop'); add(T.connection, 'type'); add(T.drops + 0.05, 'type', { lo: true });
  for (let i = 1; i < 9; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(SC[1] - 0.05, 'paper'); add(T.charge - 0.08, 'paper'); add(T.twice - 0.05, 'type', { lo: true });
  add(T.sends - 0.05, 'clack'); add(T.unique - 0.1, 'carve'); add(T.key3 - 0.1, 'blip', { hi: true });
  add(T.retry - 0.05, 'slide'); add(T.same4 - 0.02, 'slot'); add(T.same4 + 0.1, 'match');
  add(T.returns - 0.05, 'paper'); add(T.instead - 0.05, 'blip', { lo: true }); add(T.charging - 0.05, 'strike');
  add(T.idem - 0.12, 'type'); add(T.idem + 0.35, 'clack', { soft: true });
  add(T.same6 - 0.05, 'match'); add(T.retries - 0.05, 'slide', { soft: true });
  add(T.newKey - 0.05, 'clack'); add(T.request - 0.15, 'paper'); add(T.request - 0.05, 'blip', { lo: true });
  add(T.one1 - 0.05, 'blip'); add(T.one2 - 0.05, 'blip'); add(T.one3 - 0.05, 'blip', { hi: true });
  add(T.chime, 'chime');
  add(SC[8] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame ------------------------------------------------------------------------------
const bg = makeBackground();
function sceneIndex(t) { let i = 0; while (i + 1 < SCENES.length && t >= SC[i + 1]) i++; return i; }
function drawScene(ctx, i, t) { ctx.save(); S.alpha = 1; SCENES[i](ctx, t); ctx.restore(); S.alpha = 1; }
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  const i = sceneIndex(t);
  // wipe window around each scene start: [SC[i]-WIPE/2, SC[i]+WIPE/2]
  let wipe = null;
  for (let j = 1; j < SCENES.length; j++) { const k = (t - (SC[j] - WIPE / 2)) / WIPE; if (k >= 0 && k < 1) wipe = { j, k }; }
  if (!wipe) drawScene(ctx, i, t);
  else {
    const { j, k } = wipe; const dir = WDIR[j]; const e = ease(k);
    const band = 220;
    if (dir === 2) { // bottom -> top
      const edge = lerp(H + band, STAGE_TOP - band, e);
      ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); drawScene(ctx, j - 1, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); drawScene(ctx, j, t); ctx.restore();
      ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
    } else {
      const edge = dir === 1 ? lerp(-band, W, e) : lerp(W, -band, e);
      const oldR = dir === 1 ? [edge + band, W] : [0, edge];
      const newR = dir === 1 ? [0, edge] : [edge + band, W];
      ctx.save(); ctx.beginPath(); ctx.rect(oldR[0], STAGE_TOP, Math.max(0, oldR[1] - oldR[0]), H); ctx.clip(); drawScene(ctx, j - 1, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(newR[0], STAGE_TOP, Math.max(0, newR[1] - newR[0]), H); ctx.clip(); drawScene(ctx, j, t); ctx.restore();
      ctx.fillStyle = C.blue; ctx.fillRect(edge, STAGE_TOP, band, H);
    }
  }
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}
