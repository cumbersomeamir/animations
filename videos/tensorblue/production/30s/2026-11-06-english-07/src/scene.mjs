// Tensorblue 30s english-07 · episode 01 — "Two buyers, one last seat" (check-and-claim in one step)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + simple
// isometric stage (one database machine with ONE slot) + blue wipes, before/after staging.
// Story objects: two phones, one blue seat card (K12), lettered claim tokens, white ticket stubs.
// The SQL, row counts and outcomes are the real results in demo/out/seat-demo.json (SQLite).
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, pill,
  isoP, isoBox, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../../../../assets');
GlobalFonts.registerFromPath(path.join(ASSETS, 'fonts/jetbrains-mono/JetBrainsMono-Bold.ttf'), 'MonoB');
GlobalFonts.registerFromPath(path.join(ASSETS, 'fonts/jetbrains-mono/JetBrainsMono-Medium.ttf'), 'MonoM');
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the real demo (SQLite) ---------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/seat-demo.json'), 'utf8'));
const CARE = DEMO.interleaved.careless, ONE = DEMO.interleaved.one_step, STRESS = DEMO.stress.one_step;
if (CARE.tickets !== 2 || ONE.tickets !== 1 || ONE.changes_A !== 1 || ONE.changes_B !== 0 || STRESS.sold_twice !== 0) throw new Error('demo result changed');

// ---- cues -----------------------------------------------------------------------------
const T = {
  tap: VW('L1', 'tap'), buy: VW('L1', 'buy'), last: VW('L1', 'last'), same: VW('L1', 'same'), moment: VW('L1', 'moment'), who: VW('L1', 'who'),
  checks: VW('L2', 'checks'), both: VW('L2', 'both'), free2: VW('L2', 'free'), sells: VW('L2', 'sells'), twice: VW('L2', 'twice'),
  claims3: VW('L3', 'claims'), one3: VW('L3', 'one'), step: VW('L3', 'step'), only: VW('L3', 'only'), still: VW('L3', 'still'), free3: VW('L3', 'free'),
  database: VW('L4', 'database'), claims4: VW('L4', 'claims'), one4: VW('L4', 'one'), time: VW('L4', 'time'), second: VW('L4', 'second'), finds: VW('L4', 'finds'), taken: VW('L4', 'taken'),
  one5: VW('L5', 'one'), ticket: VW('L5', 'ticket'), other: VW('L5', 'other'), sold: VW('L5', 'sold'),
  not: VW('L6', 'not'), fix: VW('L6', 'fix'), simple: VW('L6', 'simple'), check6: VW('L6', 'check'), claim6: VW('L6', 'claim'), together: VW('L6', 'together'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.15, VL('L3').t1 + 0.15, VL('L4').t1 + 0.15, VL('L5').t1 + 0.15, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];   // 1 = L->R, -1 = R->L, 2 = bottom->top
T.chime = VL('L6').t1 + 0.12;
export const CUES = { ...T, scenes: SC };

// ---- story objects ---------------------------------------------------------------------
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.pale, edge = C.gray, r = 26, alpha = 1, depth = 10 } = o;
  if (alpha <= 0) return;
  shadow(ctx, x + w / 2, y + h + depth + 8, w * 0.5, 24, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  ctx.fillStyle = edge; rr(ctx, x, y + depth, w, h, r); ctx.fill();
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}
function tickMark(ctx, x, y, s, color = C.white) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.32; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.42, y + s * 0.02); ctx.lineTo(x - s * 0.12, y + s * 0.32); ctx.lineTo(x + s * 0.46, y - s * 0.3); ctx.stroke(); ctx.restore();
}
function crossMark(ctx, x, y, s, color = C.white) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.3); ctx.lineTo(x + s * 0.3, y + s * 0.3); ctx.moveTo(x + s * 0.3, y - s * 0.3); ctx.lineTo(x - s * 0.3, y + s * 0.3); ctx.stroke(); ctx.restore();
}
function badge(ctx, x, y, r, ok, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  ctx.fillStyle = ok ? C.blue : C.ink; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  if (ok) tickMark(ctx, 0, 0, r * 1.05); else crossMark(ctx, 0, 0, r * 1.05);
  ctx.restore();
}
// lettered claim token (one buyer's purchase request)
function claimToken(ctx, cx, cy, s, letter, o = {}) {
  const { alpha = 1, dim = 0 } = o;
  if (alpha <= 0 || s <= 0) return;
  shadow(ctx, cx + s * 0.05, cy + s * 0.6, s * 0.5, s * 0.12, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.translate(cx, cy);
  const r = s * 0.24;
  ctx.fillStyle = C.blueDeep; rr(ctx, -s / 2, -s / 2 + s * 0.07, s, s, r); ctx.fill();
  const g = ctx.createLinearGradient(0, -s / 2, 0, s / 2); g.addColorStop(0, '#5B97F8'); g.addColorStop(1, C.blue);
  ctx.fillStyle = g; rr(ctx, -s / 2, -s / 2, s, s, r); ctx.fill();
  if (dim > 0) { ctx.fillStyle = `rgba(3,6,16,${0.55 * dim})`; rr(ctx, -s / 2, -s / 2, s, s * 1.07, r); ctx.fill(); }
  ctx.restore();
  text(ctx, letter, cx, cy + s * 0.2, { size: s * 0.56, font: 'IDXB', color: C.white, alpha });
}
// the last seat: a pale card with a blue seat and its label
function seatIcon(ctx, cx, cy, s, color = C.blue) {
  ctx.save(); ctx.fillStyle = color;
  rr(ctx, cx - s * 0.36, cy - s * 0.5, s * 0.72, s * 0.62, s * 0.14); ctx.fill();          // back
  rr(ctx, cx - s * 0.48, cy + s * 0.02, s * 0.96, s * 0.3, s * 0.1); ctx.fill();           // cushion
  ctx.fillRect(cx - s * 0.4, cy + s * 0.3, s * 0.1, s * 0.22); ctx.fillRect(cx + s * 0.3, cy + s * 0.3, s * 0.1, s * 0.22);
  ctx.restore();
}
function seatCard(ctx, cx, cy, k, o = {}) {
  if (k <= 0) return;
  const { size = 250 } = o, w = size, h = size, s = back(k), f = size / 250;
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  card(ctx, cx - w / 2, cy - h / 2, w, h, { fill: C.white, r: 30 });
  seatIcon(ctx, cx, cy - 22 * f, 108 * f);
  text(ctx, 'Seat K12', cx, cy + 92 * f, { size: 36 * f, font: 'IDXB', color: C.ink });
  ctx.restore();
}
// a phone with the same fictional event (A or B)
function phone(ctx, cx, top, letter, o = {}) {
  const { press = 0, state = 'buy', alpha = 1, ticketK = 0 } = o;   // state: buy | soldout
  const w = 300, h = 540, x = cx - w / 2;
  card(ctx, x, top, w, h, { fill: C.pale, r: 46, alpha });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.gray; rr(ctx, cx - 44, top + 18, 88, 14, 7); ctx.fill(); ctx.restore();
  text(ctx, 'City Hall', cx, top + 104, { size: 42, font: 'IDXB', color: C.ink, alpha });
  text(ctx, 'Friday · 8 pm', cx, top + 146, { size: 28, font: 'InterSB', color: C.grayDark, alpha });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.white; rr(ctx, x + 30, top + 180, w - 60, 130, 22); ctx.fill(); ctx.restore();
  text(ctx, 'Row K · Seat 12', cx, top + 236, { size: 32, font: 'InterB', color: C.ink, alpha });
  text(ctx, state === 'soldout' ? 'no seats left' : '1 seat left', cx, top + 282, { size: 28, font: 'InterB', color: state === 'soldout' ? C.grayDark : C.blue, alpha });
  // the Buy button (pressed = pushed down, darker)
  const by = top + 380 + 6 * press, bw = 230, bh = 96, ba = alpha * (1 - clamp(ticketK * 3));
  ctx.save(); ctx.globalAlpha = ba * S.alpha;
  ctx.fillStyle = state === 'soldout' ? C.grayMid : C.blueDeep; rr(ctx, cx - bw / 2, top + 386, bw, bh, 26); ctx.fill();
  ctx.fillStyle = state === 'soldout' ? C.gray : press > 0.5 ? '#2F6FD8' : C.blue; rr(ctx, cx - bw / 2, by, bw, bh, 26); ctx.fill();
  ctx.restore();
  text(ctx, state === 'soldout' ? 'Sold out' : 'Buy', cx, by + 64, { size: state === 'soldout' ? 40 : 46, font: 'IDXB', color: state === 'soldout' ? C.ink : C.white, alpha: ba });
  // buyer badge
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + 40, top + 40, 28, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  text(ctx, letter, x + 40, top + 52, { size: 34, font: 'IDXB', color: C.white, alpha });
  if (ticketK > 0) ticketStub(ctx, cx, top + 432, letter, ticketK, { w: 330 });
}
// white ticket stub with a perforated edge
function ticketStub(ctx, cx, cy, letter, k, o = {}) {
  if (k <= 0) return;
  const { w = 350, h = 190, rot = 0 } = o, s = back(k);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
  shadow(ctx, 8, h / 2 + 8, w * 0.5, 18, 0.6);
  ctx.fillStyle = C.white; rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, -w / 2, -h / 2, 70, h, 18); ctx.fill(); ctx.fillRect(-w / 2 + 40, -h / 2, 30, h);
  ctx.fillStyle = C.white; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-w / 2 + 70, -h / 2 + 18 + i * 31, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
  text(ctx, 'TICKET', -w / 2 + 94, -h / 2 + 52, { size: 28, font: 'IDXB', color: C.ink, align: 'left', track: 3, alpha: clamp(k * 2) });
  text(ctx, 'Row K · Seat 12', -w / 2 + 94, -h / 2 + 106, { size: 28, font: 'InterB', color: C.ink, align: 'left', alpha: clamp(k * 2) });
  text(ctx, `Buyer ${letter}`, -w / 2 + 94, -h / 2 + 152, { size: 30, font: 'InterSB', color: C.blue, align: 'left', alpha: clamp(k * 2) });
  ctx.restore();
}
function kpair(ctx, a, b, y, size, t, ta, tb, o = {}) {
  const font = o.font || 'IDXB', w1 = textW(ctx, a, size, font, -1), w2 = textW(ctx, b, size, font, -1), x0 = 540 - (w1 + w2) / 2;
  kword(ctx, a, x0, y, size, t, ta, { align: 'left', font, t1: o.t1 });
  kword(ctx, b, x0 + w1, y, size, t, tb, { align: 'left', font, color: C.blue, t1: o.t1 });
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ['Two people tap Buy', 'on the last seat'] },
  { t0: VW('L1', 'at'), lines: ['at the same moment.', 'Who gets it?'] },
  { t0: VL('L2').t0, lines: ['A careless app checks first,'] },
  { t0: T.both, lines: ['both see it free,', 'and it sells twice.'] },
  { t0: VL('L3').t0, lines: ['A well-built system claims it', 'in one step:'] },
  { t0: T.only, lines: ["only if it's still free."] },
  { t0: VL('L4').t0, lines: ['The database runs the claims', 'one at a time;'] },
  { t0: VW('L4', 'the', 2), lines: ['the second finds it taken.'] },
  { t0: VL('L5').t0, lines: ['So one person gets the ticket,'] },
  { t0: VW('L5', 'and'), lines: ['and the other sees "sold out".'] },
  { t0: VL('L6').t0, lines: ['Not every app does this,'] },
  { t0: VW('L6', 'but'), lines: ['but the fix is simple:', 'check and claim together.'], tEnd: VL('L6').t1 + 0.9 },
  { t0: VL('L7').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.6 },
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

// ---- scenes ------------------------------------------------------------------------------
const STAGE_TOP = 540;
const PA = 300, PB = 780, PTOP = 600;

// S1 hook: two phones, one last seat, both tap Buy at the same moment
function s1(ctx, t) {
  const press = ev(t, T.tap + 0.05, 0.12) * (1 - ev(t, T.tap + 0.35, 0.15));
  phone(ctx, PA, PTOP, 'A', { press });
  phone(ctx, PB, PTOP, 'B', { press });
  // the two claims leave the phones and race to the same seat
  const sk = ev(t, T.last - 0.1, 0.4);
  seatCard(ctx, 540, 1350, sk, { size: 210 });
  const go = ease(ev(t, T.tap + 0.3, 0.9));
  if (go > 0) {
    claimToken(ctx, lerp(PA, 362, go), lerp(1030, 1340, go), 84, 'A', { alpha: clamp(go * 3) });
    claimToken(ctx, lerp(PB, 718, go), lerp(1030, 1340, go), 84, 'B', { alpha: clamp(go * 3) });
  }
  pill(ctx, 540, 1186, 'same moment', { size: 32, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.same - 0.05, 0.25)) * (1 - ev(t, T.who - 0.2, 0.15)) });
  kword(ctx, 'Who gets it?', 540, 1212, 62, t, T.who - 0.05);
}

// S2 the careless way: check, then sell -> both see it free -> two tickets (real SQLite result)
function s2(ctx, t) {
  const t0 = SC[1];
  for (const [cx, L, d] of [[300, 'A', 0], [780, 'B', 0.12]]) {
    const a = easeOut(ev(t, t0 + d, 0.3));
    claimToken(ctx, cx, 640, 84, L, { alpha: a });
    const ck = easeOut(ev(t, T.checks - 0.1 + d, 0.3));
    card(ctx, cx - 170, 712, 340, 150, { fill: C.pale, r: 22, alpha: ck });
    text(ctx, '1  check seat K12', cx - 140, 768, { size: 30, font: 'InterB', color: C.ink, align: 'left', alpha: ck });
    const fk = ev(t, T.free2 - 0.15 + d, 0.3);
    if (fk > 0) { badge(ctx, cx - 112, 822, 20, true, fk); text(ctx, 'free', cx - 80, 834, { size: 32, font: 'IDXB', color: C.blue, align: 'left', alpha: clamp(fk * 2) }); }
    const sk = easeOut(ev(t, T.sells - 0.2 + d, 0.3));
    text(ctx, '2  sell it', cx - 140, 912, { size: 30, font: 'InterB', color: C.white, align: 'left', alpha: sk });
    ticketStub(ctx, cx, 1050, L, ev(t, T.sells + d, 0.35), { w: 340, h: 190, rot: L === 'A' ? -0.03 : 0.03 });
  }
  kpair(ctx, 'Sold ', 'twice.', 1290, 92, t, T.sells - 0.05, T.twice - 0.05);
  text(ctx, `real SQLite run: ${CARE.tickets} tickets for seat K12`, 540, 1412, { size: 30, font: 'MonoM', color: C.gray, alpha: easeOut(ev(t, T.twice + 0.15, 0.3)) });
}

// S3 the one-step claim: "check" and "sell" become one statement
function s3(ctx, t) {
  const t0 = SC[2];
  const m = ease(ev(t, T.step - 0.25, 0.45));
  const a = easeOut(ev(t, t0, 0.3));
  if (m < 1) {
    pill(ctx, lerp(330, 540, m), 640, 'check', { size: 40, fill: C.pale, color: C.ink, alpha: a * (1 - m) });
    pill(ctx, lerp(750, 540, m), 640, 'sell', { size: 40, fill: C.pale, color: C.ink, alpha: a * (1 - m) });
  }
  if (m > 0) pill(ctx, 540, 640, 'claim: one step', { size: 40, fill: C.blue, color: C.white, alpha: clamp(m * 1.5) });
  const ck = easeOut(ev(t, T.claims3 - 0.1, 0.35));
  card(ctx, 130, 740, 820, 380, { fill: C.white, r: 26, alpha: ck });
  const hl = easeOut(ev(t, T.only - 0.1, 0.3));
  if (hl > 0) { ctx.save(); ctx.globalAlpha = hl * S.alpha; ctx.fillStyle = 'rgba(59,130,246,0.16)'; rr(ctx, 160, 990, 760, 76, 14); ctx.fill(); ctx.restore(); }
  const lines = ["UPDATE seats SET buyer = 'A'", "WHERE id = 'K12'", 'AND buyer IS NULL'];
  lines.forEach((s, i) => text(ctx, s, 190, 845 + i * 92, { size: 40, font: 'MonoB', color: i === 2 && hl > 0.5 ? C.blue : C.ink, align: 'left', alpha: ck }));
  text(ctx, 'take the seat', 760, 860, { size: 28, font: 'InterSB', color: C.grayDark, align: 'left', alpha: ck * 0 });
  pill(ctx, 720, 1028, '= still free', { size: 30, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.still - 0.05, 0.3)) });
  kpair(ctx, 'One ', 'step.', 1300, 92, t, T.one3 - 0.05, T.step - 0.05);
  text(ctx, 'the check and the sale cannot be split', 540, 1412, { size: 32, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.free3, 0.3)) });
}

// S4 isometric stage: the database machine has ONE slot — claims go through one at a time
const O4 = { x: 540, y: 1060, u: 56 };
const SLAB = { top: C.slab, left: C.slabSide, right: '#0A1428', edge: 'rgba(183,199,223,0.25)' };
const MACH = { top: C.pale, left: C.gray, right: '#A7B8D2', edge: 'rgba(3,6,16,0.25)' };
function s4(ctx, t) {
  const t0 = SC[3];
  const P = (x, y, z) => isoP(O4, x, y, z);
  shadow(ctx, O4.x, O4.y + 250, 380, 40, 0.5);
  isoBox(ctx, O4, -4, -4, -0.4, 8, 8, 0.4, SLAB);
  isoBox(ctx, O4, -1.7, -1.7, 0, 3.4, 3.4, 3.0, MACH);
  // the single slot on the front-left face (y = 1.4)
  const q = [P(-0.6, 1.7, 0.85), P(0.6, 1.7, 0.85), P(0.6, 1.7, 1.95), P(-0.6, 1.7, 1.95)];
  ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(...q[0]); for (const p of q.slice(1)) ctx.lineTo(...p); ctx.closePath(); ctx.fill(); ctx.restore();
  // label skewed onto the right face (x = 1.4)
  { const [lx, ly] = P(1.7, 0, 1.3); ctx.save(); ctx.transform(0.866, -0.5, 0, 1, lx, ly); text(ctx, 'database', 0, 0, { size: 30, font: 'IDXB', color: C.ink }); ctx.restore(); }
  // queue: A then B travel along +y toward the slot
  const aIn = ease(ev(t, T.claims4 - 0.15, 0.55)), bStep = ease(ev(t, T.time - 0.2, 0.4)), bIn = ease(ev(t, T.second - 0.1, 0.5)), bOut = ease(ev(t, T.taken - 0.05, 0.45));
  const pos = (yy) => P(0, yy, 0.6);
  // B (behind A in the queue, drawn first)
  { let yy = lerp(4.4, 2.9, bStep); yy = lerp(yy, 1.8, bIn); yy = lerp(yy, 3.2, bOut);
    const s = 74 * (1 - 0.6 * bIn * (1 - bOut)); const [x, y] = pos(yy);
    claimToken(ctx, x, y - 30, s, 'B', { alpha: 1 - 0.85 * bIn * (1 - bOut), dim: bOut });
    if (bOut > 0) pill(ctx, x + 10, y - 110, 'taken', { size: 30, fill: C.pale, color: C.ink, alpha: clamp(bOut * 2) }); }
  { const yy = lerp(2.9, 1.8, aIn), s = 74 * (1 - 0.6 * aIn), [x, y] = pos(yy); claimToken(ctx, x, y - 30, s, 'A', { alpha: 1 - aIn }); }
  // readouts: the seat row and how many rows each claim changed (real counts)
  const owner = t >= T.one4 - 0.05;
  pill(ctx, 540, 610, owner ? 'seat K12 · buyer A' : 'seat K12 · free', { size: 34, fill: owner ? C.blue : C.pale, color: owner ? C.white : C.ink, alpha: easeOut(ev(t, t0, 0.3)) });
  const r1 = ev(t, T.one4 - 0.05, 0.3), r2 = ev(t, T.finds - 0.05, 0.3);
  if (r1 > 0) { badge(ctx, 300, 700, 24, true, r1); text(ctx, `A: ${ONE.changes_A} row changed`, 340, 713, { size: 36, font: 'InterB', align: 'left', alpha: clamp(r1 * 2) }); }
  if (r2 > 0) { badge(ctx, 300, 765, 24, false, r2); text(ctx, `B: ${ONE.changes_B} rows changed`, 340, 778, { size: 36, font: 'InterB', color: C.gray, align: 'left', alpha: clamp(r2 * 2) }); }
  kpair(ctx, 'One ', 'at a time.', 1440, 84, t, T.one4 - 0.05, T.time - 0.15);
}

// S5 the outcome (mirror of the hook): A gets the ticket, B sees "Sold out"
function s5(ctx, t) {
  const t0 = SC[4];
  const a = easeOut(ev(t, t0, 0.3));
  phone(ctx, PA, PTOP, 'A', { alpha: a, ticketK: ev(t, T.ticket - 0.15, 0.4) });
  const so = t >= T.sold - 0.1;
  phone(ctx, PB, PTOP, 'B', { alpha: a, state: so ? 'soldout' : 'buy' });
  badge(ctx, PB + 120, PTOP + 30, 26, false, ev(t, T.sold - 0.1, 0.3));
  kpair(ctx, 'One ', 'ticket.', 1360, 92, t, T.one5 - 0.05, T.ticket - 0.05);
}

// S6 takeaway: before/after rows + the demo count
function s6(ctx, t) {
  const t0 = SC[5];
  kword(ctx, 'Check and claim', 540, 650, 84, t, T.check6 - 0.05);
  kword(ctx, 'together.', 540, 745, 84, t, T.together - 0.05, { color: C.blue });
  const r1 = easeOut(ev(t, T.not - 0.05, 0.35)), r2 = easeOut(ev(t, T.fix - 0.05, 0.35));
  card(ctx, 130, 820, 820, 150, { fill: C.pale, r: 24, alpha: r1 });
  badge(ctx, 200, 895, 28, false, ev(t, T.not, 0.3));
  text(ctx, 'careless', 250, 880, { size: 26, font: 'InterB', color: C.grayDark, align: 'left', alpha: r1 });
  text(ctx, 'check, then sell', 250, 922, { size: 38, font: 'InterB', color: C.ink, align: 'left', alpha: r1 });
  text(ctx, '2 tickets', 910, 912, { size: 40, font: 'IDXB', color: C.ink, align: 'right', alpha: r1 });
  card(ctx, 130, 1000, 820, 150, { fill: C.white, r: 24, alpha: r2 });
  badge(ctx, 200, 1075, 28, true, ev(t, T.fix, 0.3));
  text(ctx, 'well-built', 250, 1060, { size: 26, font: 'InterB', color: C.blue, align: 'left', alpha: r2 });
  text(ctx, 'claim in one step', 250, 1102, { size: 38, font: 'InterB', color: C.ink, align: 'left', alpha: r2 });
  text(ctx, '1 ticket', 910, 1092, { size: 40, font: 'IDXB', color: C.blue, align: 'right', alpha: r2 });
  text(ctx, `SQLite demo: ${STRESS.trials} races, ${STRESS.sold_twice} sold twice`, 540, 1232, { size: 32, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.simple, 0.3)) });
  const ck = easeOut(ev(t, T.chime - 0.05, 0.3));
  if (ck > 0) { ctx.save(); ctx.globalAlpha = ck * S.alpha; ctx.strokeStyle = C.blue; ctx.lineWidth = 6; rr(ctx, 127, 997, 826, 156, 26); ctx.stroke(); ctx.restore(); }
}

// S7 CTA — the accepted English end card, unchanged
function s7(ctx, t) {
  const t0 = SC[6];
  const lk = back(ev(t, t0 + 0.05, 0.5));
  if (lk > 0) {
    const h = 300 * lk, w = h * 200 / 260;
    shadow(ctx, 540, 1020, 120 * lk, 18, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(lk); ctx.drawImage(LOGO, 540 - w / 2, 690 + (300 - h), w, h); ctx.restore();
  }
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
const SCENES = [s1, s2, s3, s4, s5, s6, s7];

// ---- SFX (each tied to an on-screen action) ---------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(T.tap + 0.05, 'tap'); add(T.tap + 0.07, 'tap'); add(T.tap + 0.3, 'slide', { soft: true }); add(T.last - 0.1, 'clack');
  add(T.same - 0.05, 'blip', { hi: true }); add(T.who - 0.05, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.checks - 0.1, 'carve'); add(T.free2 - 0.15, 'blip'); add(T.free2 - 0.03, 'blip');
  add(T.sells, 'paper'); add(T.sells + 0.12, 'paper'); add(T.twice - 0.05, 'type', { lo: true });
  add(T.claims3 - 0.1, 'clack', { soft: true }); add(T.step - 0.25, 'slide'); add(T.step + 0.15, 'clack'); add(T.only - 0.1, 'carve'); add(T.still - 0.05, 'blip', { hi: true });
  add(T.claims4 - 0.15, 'slot'); add(T.one4 - 0.05, 'match'); add(T.second - 0.1, 'slot'); add(T.finds - 0.05, 'strike'); add(T.taken - 0.05, 'slide', { soft: true });
  add(T.ticket - 0.15, 'paper'); add(T.sold - 0.1, 'strike'); add(T.ticket - 0.05, 'type');
  add(T.not, 'clack', { soft: true }); add(T.fix, 'clack'); add(T.check6 - 0.05, 'type'); add(T.together - 0.05, 'type', { lo: true }); add(T.chime, 'chime');
  add(SC[6] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame -------------------------------------------------------------------------------
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
  let wipe = null;
  for (let j = 1; j < SCENES.length; j++) { const k = (t - (SC[j] - WIPE / 2)) / WIPE; if (k >= 0 && k < 1) wipe = { j, k }; }
  if (!wipe) drawScene(ctx, i, t);
  else {
    const { j, k } = wipe; const dir = WDIR[j]; const e = ease(k); const band = 220;
    if (dir === 2) {
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
