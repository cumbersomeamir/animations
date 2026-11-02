// Tensorblue 30s production 02 — "Why apps undo a like you just tapped"
// Brand-aligned software cutaway: the heart is the constant. Match-cut layers:
// thumb/heart -> pending request card -> accept/reject fork -> rollback ->
// reversible vs. false-success tiles -> feedback vs. confirmed lanes.
// All cues are timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, clamp, lerp, ease, easeOut, easeIn, back, ev, win, RNG, quadPts, pointAt, subPath,
  rr, polyline, hatch, shade, panel, text, textW, heartPath, heart, burst, spinner, checkMark, crossMark,
  badge, arrowHead, makeBackground,
} from './ui.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---------------------------------------------------------------------------
// Cues (seconds) from narration words
const T = {
  tap: 0.70, l1end: VL('L1').t1, lights: VW('L1', 'lights'),
  apps: VW('L2', 'apps'), screen: VW('L2', 'screen'), before: VW('L2', 'before'), server: VW('L2', 'server'), confirms: VW('L2', 'confirms'),
  called: VW('L3', 'called'), optimistic: VW('L3', 'optimistic'),
  fast: VW('L4', 'fast'), request: VW('L4', 'request'), background: VW('L4', 'background'), l4end: VL('L4').t1,
  ifS: VL('L5').t0, rejects: VW('L5', 'rejects'), app: VW('L5', 'app'), roll: VW('L5', 'roll'), heart: VW('L5', 'heart'), back: VW('L5', 'back'), error: VW('L5', 'error'), l5end: VL('L5').t1,
  suits: VW('L6', 'suits'), reversible: VW('L6', 'reversible'), but: VW('L6', 'but'), risky: VW('L6', 'risky'), falseS: VW('L6', 'false'), matters: VW('L6', 'matters'), l6end: VL('L6').t1,
  feedback: VW('L7', 'feedback'), confirmed: VW('L7', 'confirmed'), success: VW('L7', 'success'), different: VW('L7', 'different'), l7end: VL('L7').t1,
};
T.toMini = T.l1end + 0.15;          // post card shrinks into the cutaway layout
T.emerge = T.before - 0.05;         // request card is born from the heart (match cut)
T.serverIn = T.server - 0.35;
T.chip = T.called - 0.1;
T.depart = T.request - 0.05; T.travel = 1.75; T.arrive = T.depart + T.travel;
T.forkIn = Math.max(T.arrive + 0.05, T.ifS + 0.1);
T.decide = T.rejects;
T.returnGo = T.app - 0.1; T.returnDur = 0.75;
T.drain = T.heart - 0.05; T.drainDur = 0.45;
T.toast = T.error - 0.2;
T.toTiles = T.l5end + 0.35;          // cutaway -> comparison tiles
T.payIn = T.reversible + 0.2;
T.sent = T.but - 0.1;                // optimistic "Sent" too early
T.doubt = T.falseS - 0.1;
T.wait = T.matters;
T.toLanes = T.l6end + 0.15;
T.tap2 = T.toLanes + 0.75;           // a fresh like for the takeaway
T.lane1 = T.feedback - 0.05; T.lane2 = T.confirmed - 0.05; T.confirm = T.success + 0.05; T.gap = T.different - 0.05;
T.chime = T.l7end + 0.12;
T.capEnd = 28.55; T.sign = 28.75;

// ---------------------------------------------------------------------------
// Camera
const CAM = [
  [0.0, 540, 990, 1.0], [0.5, 540, 990, 1.0], [1.6, 370, 1090, 1.3], [2.75, 370, 1090, 1.3],
  [T.toMini + 0.75, 540, 990, 1.0], [T.returnGo, 540, 990, 1.0], [T.drain - 0.05, 470, 905, 1.42],
  [T.l5end + 0.1, 470, 905, 1.42], [T.toTiles + 0.7, 540, 990, 1.0], [T.toLanes + 0.6, 540, 990, 1.0],
  [28.6, 540, 1005, 1.04], [30.0, 540, 1000, 1.03],
];
function camAt(t) {
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) {
    const [t0, x0, y0, z0] = CAM[i - 1], [t1, x1, y1, z1] = CAM[i]; const k = ease((t - t0) / (t1 - t0 || 1));
    return { cx: lerp(x0, x1, k), cy: lerp(y0, y1, k), z: Math.exp(lerp(Math.log(z0), Math.log(z1), k)) };
  }
  const l = CAM[CAM.length - 1]; return { cx: l[1], cy: l[2], z: l[3] };
}
export const SY = 990, WORLD_TOP = 472, FADE_TOP = 476, FADE_BOTTOM = 516;

// ---------------------------------------------------------------------------
// Layouts
const CARD_FULL = { cx: 540, cy: 910, s: 1 };
const CARD_MINI = { cx: 540, cy: 778, s: 0.66 };
const CARD_W = 780, CARD_H = 740;
const HEART_LOCAL = [-292, 250];
const TILE_L = { x: 120, y: 610, w: 400, h: 650 };
const TILE_R = { x: 550, y: 610, w: 400, h: 650 };
const TILE_HEART_Y = 290; // heart / button centre, from tile top
const SERVER = { cx: 540, cy: 1335, w: 300, h: 180 };
const PARK = [560, 1096];
// request goes down the right side; answers come back up the left side to the heart
const ROUTE_OUT = quadPts([620, 1120], [860, 1180], [SERVER.cx + SERVER.w / 2 + 8, SERVER.cy - 10], 60);
const ARC_OK = quadPts([SERVER.cx - SERVER.w / 2 - 8, SERVER.cy + 10], [80, 1220], [236, 1004], 60);
const ARC_NO = quadPts([SERVER.cx - SERVER.w / 2 + 30, SERVER.cy - SERVER.h / 2 - 8], [300, 1160], [338, 1030], 60);
const LANES = { x0: 170, x1: 910, y1: 1100, y2: 1250, mark1: 240, mark2: 760 };
const HEART_END = { x: 540, y: 790, s: 190 };

function cardState(t) {
  const k = ease(ev(t, T.toMini, 0.75));
  return { cx: lerp(CARD_FULL.cx, CARD_MINI.cx, k), cy: lerp(CARD_FULL.cy, CARD_MINI.cy, k), s: lerp(CARD_FULL.s, CARD_MINI.s, k) };
}
function heartPos(t) {
  const c = cardState(t);
  let x = c.cx + HEART_LOCAL[0] * c.s, y = c.cy + HEART_LOCAL[1] * c.s, s = 108 * c.s;
  // into the left tile
  const kt = ease(ev(t, T.toTiles, 0.7));
  if (kt > 0) { x = lerp(x, TILE_L.x + TILE_L.w / 2, kt); y = lerp(y, TILE_L.y + TILE_HEART_Y, kt); s = lerp(s, 172, kt); }
  // to the centre for the takeaway
  const kl = ease(ev(t, T.toLanes, 0.6));
  if (kl > 0) { x = lerp(x, HEART_END.x, kl); y = lerp(y, HEART_END.y, kl); s = lerp(s, HEART_END.s, kl); }
  return { x, y, s };
}
function heartFill(t) {
  if (t < T.tap + 0.03) return 0;
  if (t < T.drain) return easeOut(ev(t, T.tap + 0.03, 0.12));
  if (t < T.toTiles + 0.2) return 1 - ease(ev(t, T.drain, T.drainDur));
  if (t < T.toLanes) return easeOut(ev(t, T.toTiles + 0.2, 0.3));           // the tile's heart: liked, reversible
  if (t < T.toLanes + 0.35) return 1 - ev(t, T.toLanes, 0.35);              // reset for a fresh tap
  if (t < T.tap2 + 0.03) return 0;
  return easeOut(ev(t, T.tap2 + 0.03, 0.12));
}

// ---------------------------------------------------------------------------
// Pieces
function thumb(ctx, tip, ang, k, press, key) {
  // a stylised finger: tip at `tip`, body extends along `ang` (pointing back toward the bottom-right)
  if (k <= 0) return;
  const off = (1 - easeOut(k)) * 560;
  const tx = tip[0] + Math.cos(ang) * off, ty = tip[1] + Math.sin(ang) * off;
  ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); ctx.scale(1 - 0.05 * press, 1 - 0.05 * press);
  const L = 420, Wd = 104;
  const body = () => { rr(ctx, -Wd * 0.18, -Wd / 2, L, Wd, Wd / 2); };
  ctx.globalAlpha = S.alpha; ctx.fillStyle = '#16233d'; body(); ctx.fill();
  hatch(ctx, body, [-Wd, -Wd / 2, L, Wd / 2], { key: key + 'h', color: 'rgba(145,187,255,0.22)', gap: 8, dens: (x, y) => clamp(0.2 + (y + Wd / 2) / Wd * 0.8), cross: false });
  ctx.strokeStyle = C.sec; ctx.lineWidth = 3; body(); ctx.stroke();
  // nail
  ctx.fillStyle = 'rgba(216,227,245,0.16)'; rr(ctx, 4, -Wd * 0.3, 78, Wd * 0.6, 22); ctx.fill();
  ctx.strokeStyle = 'rgba(216,227,245,0.6)'; ctx.lineWidth = 2.2; rr(ctx, 4, -Wd * 0.3, 78, Wd * 0.6, 22); ctx.stroke();
  // knuckle creases
  ctx.strokeStyle = 'rgba(216,227,245,0.45)'; ctx.lineWidth = 2;
  for (const xx of [170, 186, 300]) { ctx.beginPath(); ctx.moveTo(xx, -Wd * 0.22); ctx.quadraticCurveTo(xx + 6, 0, xx, Wd * 0.22); ctx.stroke(); }
  ctx.restore();
}
function postCard(ctx, t, st, alpha) {
  if (alpha <= 0) return;
  const { cx, cy, s } = st; const x = cx - CARD_W * s / 2, y = cy - CARD_H * s / 2;
  const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const glow = clamp(win(t, T.screen - 0.1, T.before + 0.3, 0.2, 0.4));
  panel(ctx, 0, 0, CARD_W, CARD_H, { r: 34, key: 'post', stroke: glow > 0 ? `rgba(10,108,255,${0.35 + 0.65 * glow})` : C.line, lw: 2 + 3 * glow });
  // header
  ctx.save(); ctx.globalAlpha = S.alpha;
  const av = ctx.createLinearGradient(30, 30, 90, 90); av.addColorStop(0, C.g2); av.addColorStop(1, C.g3);
  ctx.fillStyle = av; ctx.beginPath(); ctx.arc(70, 66, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(216,227,245,0.75)'; rr(ctx, 120, 46, 220, 16, 8); ctx.fill();
  ctx.fillStyle = 'rgba(216,227,245,0.35)'; rr(ctx, 120, 74, 140, 12, 6); ctx.fill();
  // media: abstract artwork in the hero gradient
  const mx = 20, my = 116, mw = CARD_W - 40, mh = 430;
  ctx.save(); rr(ctx, mx, my, mw, mh, 20); ctx.clip();
  const hg = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
  hg.addColorStop(0, C.g1); hg.addColorStop(0.38, C.g2); hg.addColorStop(0.72, C.g3); hg.addColorStop(1, C.g4);
  ctx.fillStyle = hg; ctx.fillRect(mx, my, mw, mh);
  ctx.fillStyle = 'rgba(237,249,255,0.9)'; ctx.beginPath(); ctx.arc(mx + mw * 0.72, my + mh * 0.32, 56, 0, Math.PI * 2); ctx.fill();
  const hill = (h0, amp, ph, col) => { ctx.beginPath(); ctx.moveTo(mx, my + mh); for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(mx + u * mw, my + mh * h0 - amp * Math.sin(u * Math.PI * 1.3 + ph)); } ctx.lineTo(mx + mw, my + mh); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  hill(0.78, 70, 0.3, 'rgba(10,108,255,0.55)'); hill(0.9, 50, 1.6, 'rgba(13,22,40,0.85)');
  hatch(ctx, () => { ctx.beginPath(); ctx.rect(mx, my + mh * 0.55, mw, mh * 0.45); }, [mx, my + mh * 0.55, mx + mw, my + mh], { key: 'media-h', color: 'rgba(3,6,16,0.35)', gap: 8, dens: shade([mx, my + mh * 0.55, mx + mw, my + mh], 0.1, 0.9) });
  ctx.restore();
  ctx.restore();
  // count + comment icon
  const liked = t >= T.tap + 0.05 && t < T.drain + T.drainDur * 0.7;
  text(ctx, liked ? '129 likes' : '128 likes', 168, 658, { size: 40, font: 'InterSB', align: 'left', color: C.white });
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = C.white; ctx.lineWidth = 5.5; ctx.lineJoin = 'round';
  rr(ctx, 560, 600, 76, 60, 22); ctx.stroke(); ctx.beginPath(); ctx.moveTo(578, 658); ctx.lineTo(572, 680); ctx.lineTo(598, 660); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(680, 640); ctx.lineTo(740, 610); ctx.lineTo(712, 668); ctx.lineTo(704, 642); ctx.closePath(); ctx.stroke();
  ctx.restore();
  ctx.restore();
  S.alpha = sa;
}
function requestCard(ctx, x, y, t, state, alpha = 1, sc = 1) {
  if (alpha <= 0) return;
  const w = 372, h = 88;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y);
  const sa = S.alpha; S.alpha = sa * alpha;
  panel(ctx, x - w / 2, y - h / 2, w, h, { r: h / 2, fill: C.navy2, key: 'req', stroke: state === 'rejected' ? C.white : 'rgba(10,108,255,0.9)', lw: 3, shadow: true, hatchK: 0.6 });
  heart(ctx, x - w / 2 + 46, y + 2, 40, { fill: 1, lw: 2.5, key: 'reqheart' });
  text(ctx, 'like', x - w / 2 + 80, y + 11, { size: 32, align: 'left', font: 'InterB' });
  if (state === 'pending') { text(ctx, 'pending', x + w / 2 - 66, y + 10, { size: 26, align: 'right', font: 'InterM', color: C.sec }); spinner(ctx, x + w / 2 - 38, y, 15, t, { color: C.g2, w: 4 }); }
  else if (state === 'rejected') { text(ctx, 'rejected', x + w / 2 - 66, y + 10, { size: 26, align: 'right', font: 'InterM', color: C.white }); badge(ctx, x + w / 2 - 36, y, 20, 'no'); }
  S.alpha = sa; ctx.restore();
}
function server(ctx, t, alpha) {
  if (alpha <= 0) return;
  const { cx, cy, w, h } = SERVER; const x = cx - w / 2, y = cy - h / 2;
  const sa = S.alpha; S.alpha = sa * alpha;
  panel(ctx, x, y, w, h, { r: 22, fill: C.navy2, key: 'server', stroke: 'rgba(216,227,245,0.5)', lw: 2.5 });
  const checking = t > T.arrive && t < T.decide;
  for (let i = 0; i < 3; i++) {
    const yy = y + 42 + i * 48;
    ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = 'rgba(216,227,245,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 26, yy + 22); ctx.lineTo(x + w - 26, yy + 22); ctx.stroke();
    const on = checking ? (Math.floor(t * 8 + i) % 2 === 0) : true;
    ctx.fillStyle = t >= T.decide && t < T.toTiles ? (i === 1 ? C.white : 'rgba(216,227,245,0.25)') : on ? C.g3 : 'rgba(133,236,237,0.25)';
    ctx.beginPath(); ctx.arc(x + w - 40, yy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(216,227,245,0.4)'; rr(ctx, x + 26, yy - 6, 90, 12, 6); ctx.fill(); ctx.restore();
  }
  text(ctx, 'server', x + w + 24, cy + 2, { size: 32, font: 'InterSB', color: C.sec, align: 'left' });
  S.alpha = sa;
}
function toast(ctx, t, alpha) {
  if (alpha <= 0) return;
  const k = back(ev(t, T.toast, 0.4)); if (k <= 0) return;
  const w = 470, h = 82, x = 540 - w / 2, y = 1052 + (1 - k) * 40;
  const sa = S.alpha; S.alpha = sa * alpha * clamp(k * 1.5);
  panel(ctx, x, y, w, h, { r: 22, fill: '#14213a', key: 'toast', stroke: C.white, lw: 2.5, hatchK: 0.4 });
  badge(ctx, x + 44, y + h / 2, 22, 'warn');
  text(ctx, "Couldn't like post", x + 80, y + h / 2 + 11, { size: 32, align: 'left', font: 'InterSB' });
  S.alpha = sa;
}
function tile(ctx, R, title, alpha, key) {
  if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  panel(ctx, R.x, R.y, R.w, R.h, { r: 30, key, fill: C.navy });
  text(ctx, title, R.x + R.w / 2, R.y + 78, { size: 46, font: 'InterB' });
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(R.x + 30, R.y + 116); ctx.lineTo(R.x + R.w - 30, R.y + 116); ctx.stroke(); ctx.restore();
  S.alpha = sa;
}
function undoArrow(ctx, cx, cy, r, frac, alpha = 1, color = C.g3) {
  // circular "undo" arrow around a point
  const a0 = -Math.PI * 0.15, a1 = a0 - Math.PI * 1.55 * clamp(frac);
  const pts = []; for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  polyline(ctx, pts, { w: 6, color, alpha });
  if (frac > 0.2) arrowHead(ctx, pts, { size: 20, color, alpha });
}
function payButton(ctx, t, cx, cy, alpha) {
  if (alpha <= 0) return;
  const w = 310, h = 104, x = cx - w / 2, y = cy - h / 2;
  const sa = S.alpha; S.alpha = sa * alpha;
  const sent = t >= T.sent && t < T.wait;
  const waiting = t >= T.wait;
  const press = win(t, T.sent - 0.08, T.sent + 0.08, 0.04, 0.06);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1 - 0.04 * press, 1 - 0.04 * press); ctx.translate(-cx, -cy);
  ctx.globalAlpha = S.alpha;
  ctx.fillStyle = sent ? C.blue : C.navy2; rr(ctx, x, y, w, h, 24); ctx.fill();
  if (t >= T.doubt && sent) { ctx.setLineDash([14, 10]); ctx.strokeStyle = C.white; ctx.lineWidth = 3.5; rr(ctx, x - 10, y - 10, w + 20, h + 20, 30); ctx.stroke(); ctx.setLineDash([]); }
  ctx.strokeStyle = sent ? C.white : 'rgba(216,227,245,0.6)'; ctx.lineWidth = 2.5; rr(ctx, x, y, w, h, 24); ctx.stroke();
  if (!sent && !waiting) text(ctx, 'Send', cx, cy + 13, { size: 38, font: 'InterB' });
  if (sent) { text(ctx, 'Sent', cx - 24, cy + 13, { size: 38, font: 'InterB' }); checkMark(ctx, cx + 54, cy + 2, 30, { color: C.white, w: 6 }); }
  if (waiting) { text(ctx, 'Confirming', cx + 18, cy + 11, { size: 32, font: 'InterSB' }); spinner(ctx, x + 40, cy, 15, t, { color: C.g2, w: 4.5 }); }
  ctx.restore();
  if (sent && t >= T.doubt) badge(ctx, x + w + 4, y - 4, 24, 'warn', { pop: back(ev(t, T.doubt, 0.3)) });
  S.alpha = sa;
}

// ---------------------------------------------------------------------------
// Captions (screen space). Inter SemiBold 50 px; ink inside y 350–470; <= 2 lines; width <= 880 px.
const CAPS = [
  { t0: VL('L1').t0, lines: ['You tap like, and the heart', 'lights up instantly.'] },
  { t0: VL('L2').t0, lines: ['Some apps update the screen'] },
  { t0: VW('L2', 'before'), lines: ['before the server', 'confirms the change.'] },
  { t0: VL('L3').t0, lines: ["That's called an", 'optimistic update.'] },
  { t0: VL('L4').t0, lines: ['It feels fast,'] },
  { t0: VW('L4', 'while'), lines: ['while the request travels', 'in the background.'] },
  { t0: VL('L5').t0, lines: ['If the server rejects it,'] },
  { t0: VW('L5', 'the', 2), lines: ['the app can roll the heart back', 'and show an error.'] },
  { t0: VL('L6').t0, lines: ['It suits reversible actions,'] },
  { t0: VW('L6', 'but'), lines: ["but it's risky where", 'a false success matters.'] },
  { t0: VL('L7').t0, lines: ['Fast feedback and confirmed', 'success are different things.'], tEnd: T.capEnd },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 50, CAPTION_LH = 58, CAPTION_TOP = 350, CAPTION_BOTTOM = 470, CAPTION_MAXW = 880;
const CAPTION_PAD = 4;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px InterSB`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH, width: ms[i].width }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.1);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, 540, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', color: C.white, alpha: a });
}
function drawSignature(ctx, t) {
  const k = ev(t, T.sign, 0.45); if (k <= 0) return;
  const w = textW(ctx, 'Tensorblue', 60, 'InterB');
  text(ctx, 'Tensorblue', 540 - 16, 432, { size: 60, font: 'InterB', alpha: easeOut(k) });
  ctx.save(); ctx.globalAlpha = easeOut(ev(t, T.sign + 0.25, 0.3)); ctx.fillStyle = C.blue;
  ctx.beginPath(); ctx.arc(540 - 16 + w / 2 + 24, 410, 11 * back(ev(t, T.sign + 0.25, 0.3)), 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------------------
// SFX events (each tied to an on-screen action)
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.05, 'swish', { soft: true }); add(T.tap, 'tap'); add(T.tap + 0.03, 'pop', { hi: true }); add(T.tap + 0.05, 'sparkle');
  add(T.toMini, 'swish'); add(T.emerge + 0.05, 'blip'); add(T.serverIn, 'blip', { lo: true });
  add(T.chip, 'blip', { hi: true });
  add(T.depart, 'swish', { long: true }); add(T.arrive, 'knock');
  add(T.forkIn, 'tick'); add(T.decide, 'reject');
  add(T.returnGo, 'swish', { rev: true }); add(T.drain, 'unpop'); add(T.drain + 0.4, 'tick');
  add(T.toast, 'toast');
  add(T.toTiles, 'swish'); add(T.payIn, 'swish', { soft: true });
  add(T.sent - 0.05, 'tap'); add(T.sent, 'blip', { hi: true }); add(T.doubt, 'warn'); add(T.wait, 'tick');
  add(T.toLanes, 'swish'); add(T.tap2, 'tap'); add(T.tap2 + 0.03, 'pop', { hi: true }); add(T.tap2 + 0.05, 'sparkle');
  add(T.lane1, 'draw'); add(T.lane2, 'draw'); add(T.confirm, 'confirm'); add(T.gap, 'draw');
  add(T.chime, 'chime'); add(T.sign, 'sparkle', { soft: true });
  return e;
}
export const CUES = T;

// ---------------------------------------------------------------------------
const bg = makeBackground();
const bgFade = (() => {
  const cv = createCanvas(W, FADE_BOTTOM + 2); const g = cv.getContext('2d'); g.drawImage(bg, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createLinearGradient(0, FADE_TOP, 0, FADE_BOTTOM); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, FADE_BOTTOM + 2); return cv;
})();

export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  const cam = camAt(t);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, WORLD_TOP, W, H - WORLD_TOP); ctx.clip();
  ctx.translate(540, SY); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy);
  drawWorld(ctx, t);
  ctx.restore();
  ctx.drawImage(bgFade, 0, 0);
  if (!process.env.NO_CAPTION) { drawCaption(ctx, t); drawSignature(ctx, t); }
}

function drawWorld(ctx, t) {
  const cutaway = 1 - ev(t, T.toTiles, 0.4);             // cutaway layer (server, routes, card)
  // ---- post card (screen layer) ----
  const cst = cardState(t);
  postCard(ctx, t, cst, 1 - ev(t, T.toTiles, 0.35));
  // ---- comparison tiles: reversible vs. false success ----
  const tl = ev(t, T.toTiles + 0.1, 0.45) * (1 - ev(t, T.toLanes, 0.4));
  if (tl > 0) {
    tile(ctx, TILE_L, 'Like', tl, 'tileL');
    const ua = ev(t, T.reversible, 0.5);
    undoArrow(ctx, TILE_L.x + TILE_L.w / 2, TILE_L.y + TILE_HEART_Y, 128, ua, tl, C.g3);
    text(ctx, 'easy to undo', TILE_L.x + TILE_L.w / 2, TILE_L.y + TILE_L.h - 70, { size: 36, font: 'InterSB', color: C.g3, alpha: tl * ev(t, T.reversible + 0.2, 0.3) });
    badge(ctx, TILE_L.x + TILE_L.w / 2, TILE_L.y + TILE_L.h - 150, 28, 'ok', { alpha: tl, pop: back(ev(t, T.reversible + 0.3, 0.3)) });
  }
  const tr = ev(t, T.payIn, 0.45) * (1 - ev(t, T.toLanes, 0.4));
  if (tr > 0) {
    const dx = (1 - easeOut(ev(t, T.payIn, 0.45))) * 420;
    ctx.save(); ctx.translate(dx, 0);
    tile(ctx, TILE_R, 'Payment', tr, 'tileR');
    payButton(ctx, t, TILE_R.x + TILE_R.w / 2, TILE_R.y + TILE_HEART_Y, tr);
    const hk = ev(t, T.risky, 0.3) * tr;
    text(ctx, 'hard to undo', TILE_R.x + TILE_R.w / 2, TILE_R.y + TILE_R.h - 70, { size: 36, font: 'InterSB', color: C.white, alpha: hk });
    badge(ctx, TILE_R.x + TILE_R.w / 2, TILE_R.y + TILE_R.h - 150, 28, 'warn', { alpha: hk, pop: back(ev(t, T.risky, 0.3)) });
    if (t >= T.wait) text(ctx, 'wait for the server', TILE_R.x + TILE_R.w / 2, TILE_R.y + TILE_HEART_Y + 110, { size: 30, font: 'InterM', color: C.sec, alpha: tr * ev(t, T.wait, 0.3) });
    ctx.restore();
  }

  // "screen" / "server" labels and the optimistic-update chip
  const lab = ev(t, T.toMini + 0.5, 0.4) * cutaway;
  text(ctx, 'screen', CARD_MINI.cx + CARD_W * CARD_MINI.s / 2 + 20, CARD_MINI.cy - 120, { size: 32, color: C.sec, align: 'left', alpha: lab * (1 - ev(t, T.chip, 0.3)) });
  server(ctx, t, ev(t, T.serverIn, 0.4) * cutaway);
  // server waiting state before the request arrives
  if (t >= T.serverIn + 0.2 && t < T.arrive) { text(ctx, 'not confirmed yet', SERVER.cx + SERVER.w / 2 + 24, SERVER.cy + 44, { size: 28, font: 'InterM', color: C.sec, align: 'left', alpha: ev(t, T.confirms - 0.1, 0.3) * cutaway }); }

  // ---- optimistic window chip ----
  const chip = ev(t, T.chip, 0.35) * (1 - ev(t, T.depart, 0.4));
  if (chip > 0) {
    const hp = heartPos(t); const cw = 380, ch = 70, cx = 600, cy = 690;
    const sa = S.alpha; S.alpha = sa * chip;
    polyline(ctx, [[cx - 150, cy + ch / 2 - 4], [hp.x + 12, hp.y - hp.s * 0.5]], { w: 3.5, color: C.blue });
    ctx.save(); ctx.globalAlpha = S.alpha; ctx.translate(cx, cy); ctx.scale(back(ev(t, T.chip, 0.35)), back(ev(t, T.chip, 0.35))); ctx.translate(-cx, -cy);
    ctx.fillStyle = C.blue; rr(ctx, cx - cw / 2, cy - ch / 2, cw, ch, ch / 2); ctx.fill(); ctx.strokeStyle = C.white; ctx.lineWidth = 2.5; rr(ctx, cx - cw / 2, cy - ch / 2, cw, ch, ch / 2); ctx.stroke();
    ctx.restore();
    text(ctx, 'optimistic update', cx, cy + 11, { size: 34, font: 'InterB', frac: ev(t, T.optimistic - 0.1, 0.45) });
    S.alpha = sa;
  }

  // ---- request card: born from the heart, parks, travels, gets an answer ----
  const hp0 = heartPos(Math.min(t, T.drain - 0.01));
  if (t >= T.emerge && t < T.toTiles + 0.4) {
    let x, y, sc = 1, state = 'pending', a = cutaway;
    if (t < T.emerge + 0.45) { const k = ease(ev(t, T.emerge, 0.45)); x = lerp(hp0.x, PARK[0], k); y = lerp(hp0.y, PARK[1], k); sc = lerp(0.25, 1, k); }
    else if (t < T.depart) { x = PARK[0]; y = PARK[1]; }
    else if (t < T.arrive) {
      const k = ease(ev(t, T.depart, T.travel)); [x, y] = pointAt(ROUTE_OUT, k);
    } else { [x, y] = ROUTE_OUT[ROUTE_OUT.length - 1]; }
    if (t >= T.decide) state = 'rejected';
    // after the decision the card shrinks into a token that rides the rejected arc home
    if (t >= T.returnGo) {
      const k = ease(ev(t, T.returnGo, T.returnDur));
      const end = [hp0.x, hp0.y];
      [x, y] = k < 0.85 ? pointAt([[...ROUTE_OUT[ROUTE_OUT.length - 1]], ...ARC_NO, end], k / 0.85) : end;
      sc = lerp(1, 0.35, k); a *= 1 - ev(t, T.returnGo + T.returnDur - 0.05, 0.12);
    }
    if (t < T.depart && t >= T.emerge + 0.45) {
      // dashed "outbox" route preview while pending
      polyline(ctx, ROUTE_OUT, { w: 3, color: 'rgba(216,227,245,0.35)', dash: [10, 12], frac: ev(t, T.emerge + 0.3, 0.6), alpha: cutaway });
    }
    if (t >= T.depart && t < T.returnGo) {
      polyline(ctx, ROUTE_OUT, { w: 4, color: 'rgba(10,108,255,0.9)', frac: ease(ev(t, T.depart, T.travel)), alpha: cutaway });
      if (t > T.background - 0.2) {
        const bgk = ev(t, T.background - 0.2, 0.35) * cutaway * (1 - ev(t, T.forkIn, 0.4));
        text(ctx, 'in the background', 790, 1150, { size: 30, font: 'InterM', color: C.sec, alpha: bgk });
      }
    }
    requestCard(ctx, x, y, t, state, a, sc);
  }

  // ---- accept / reject fork ----
  const fd = ev(t, T.forkIn, 0.35);           // draw-on
  const fk = fd * cutaway;                      // visibility (fades with the cutaway)
  if (fk > 0) {
    const decided = t >= T.decide;
    polyline(ctx, ARC_OK, { w: 4, color: C.g3, dash: decided ? [6, 14] : null, alpha: (decided ? 0.35 : 0.9) * cutaway, frac: fd });
    arrowHead(ctx, ARC_OK, { color: C.g3, alpha: (decided ? 0.35 : 0.9) * clamp(fd * 2 - 1) * cutaway });
    polyline(ctx, ARC_NO, { w: decided ? 6 : 4, color: C.white, alpha: (decided ? 1 : 0.6) * cutaway, frac: fd, dash: decided ? null : [10, 10] });
    arrowHead(ctx, ARC_NO, { color: C.white, alpha: clamp(fd * 2 - 1) * cutaway });
    badge(ctx, 150, 1170, 24, 'ok', { alpha: (decided ? 0.35 : 1) * fk });
    text(ctx, 'accepted', 150, 1232, { size: 28, font: 'InterM', color: C.g3, alpha: (decided ? 0.35 : 1) * fk });
    badge(ctx, 336, 1166, 24, 'no', { alpha: fk, pop: decided ? back(ev(t, T.decide, 0.3)) * 1.15 : 1 });
    text(ctx, 'rejected', 430, 1210, { size: 28, font: 'InterSB', color: C.white, align: 'left', alpha: fk * (decided ? 1 : 0.6) });
  }

  // ---- the heart (the constant) ----
  const hp = heartPos(t);
  const fill = heartFill(t);
  const pop = t >= T.tap && t < T.tap + 0.35 ? 1 + 0.18 * Math.sin(Math.PI * ev(t, T.tap, 0.35)) : t >= T.tap2 && t < T.tap2 + 0.35 ? 1 + 0.12 * Math.sin(Math.PI * ev(t, T.tap2, 0.35)) : 1;
  const shrink = t >= T.drain && t < T.drain + T.drainDur ? 1 - 0.08 * Math.sin(Math.PI * ev(t, T.drain, T.drainDur)) : 1;
  heart(ctx, hp.x, hp.y, hp.s * pop * shrink, { fill, key: 'hero-heart', lw: Math.max(3, hp.s * 0.055) });
  burst(ctx, hp.x, hp.y, hp.s * 1.1, ev(t, T.tap + 0.03, 0.55));
  burst(ctx, hp.x, hp.y, hp.s * 0.95, ev(t, T.tap2 + 0.03, 0.55));
  // rollback arrow around the heart
  const ra = ev(t, T.drain - 0.1, 0.5) * (1 - ev(t, T.toTiles, 0.3));
  if (ra > 0) undoArrow(ctx, hp.x, hp.y, hp.s * 0.95, ra, 1, C.white);
  toast(ctx, t, 1 - ev(t, T.toTiles, 0.3));

  // ---- thumb: taps the heart in the hook, and again for the takeaway ----
  const th1 = ev(t, 0.0, 0.62) * (1 - ev(t, 1.25, 0.6));
  const press1 = win(t, T.tap - 0.06, T.tap + 0.12, 0.05, 0.1);
  if (th1 > 0) { const hpA = heartPos(t); thumb(ctx, [hpA.x + 8, hpA.y + 14], 0.92, th1, press1, 'thumb1'); }
  const th2 = ev(t, T.tap2 - 0.55, 0.5) * (1 - ev(t, T.tap2 + 0.3, 0.5));
  const press2 = win(t, T.tap2 - 0.06, T.tap2 + 0.12, 0.05, 0.1);
  if (th2 > 0) { thumb(ctx, [HEART_END.x + 10, HEART_END.y + 30], 0.95, th2, press2, 'thumb2'); }

  // ---- takeaway lanes: feedback vs. confirmed ----
  const ln = ev(t, T.toLanes + 0.2, 0.4);
  if (ln > 0) {
    const { x0, x1, y1, y2, mark1, mark2 } = LANES;
    text(ctx, 'feedback', x0, y1 - 34, { size: 32, font: 'InterSB', align: 'left', color: C.g2, alpha: ev(t, T.lane1, 0.3) });
    polyline(ctx, [[x0, y1], [x1, y1]], { w: 4, color: 'rgba(145,187,255,0.6)', frac: ease(ev(t, T.lane1, 0.5)) });
    if (t >= T.lane1 + 0.2) heart(ctx, mark1, y1, 52, { fill: 1, key: 'lane-heart', lw: 3 });
    text(ctx, 'confirmed', x0, y2 - 34, { size: 32, font: 'InterSB', align: 'left', color: C.g3, alpha: ev(t, T.lane2, 0.3) });
    polyline(ctx, [[x0, y2], [x1, y2]], { w: 4, color: 'rgba(133,236,237,0.6)', frac: ease(ev(t, T.lane2, 0.5)) });
    if (t >= T.lane2 + 0.2 && t < T.confirm) badge(ctx, mark2, y2, 24, 'wait', { t });
    if (t >= T.confirm) badge(ctx, mark2, y2, 26, 'ok', { pop: back(ev(t, T.confirm, 0.3)) });
    // the gap between the two moments
    const gk = ev(t, T.gap, 0.45);
    if (gk > 0) {
      const yb = y2 + 70;
      polyline(ctx, [[mark1, yb - 18], [mark1, yb], [lerp(mark1, mark2, gk), yb]], { w: 3.5, color: C.white });
      if (gk >= 1) polyline(ctx, [[mark2, yb], [mark2, yb - 18]], { w: 3.5, color: C.white });
      text(ctx, 'not the same moment', (mark1 + mark2) / 2, yb + 52, { size: 30, font: 'InterM', color: C.sec, alpha: ev(t, T.gap + 0.25, 0.3) });
    }
    // the big heart's own status: pending until the server confirms
    const hb = HEART_END;
    if (t >= T.tap2 + 0.1 && t < T.confirm) badge(ctx, hb.x + hb.s * 0.42, hb.y + hb.s * 0.28, 30, 'wait', { t, pop: back(ev(t, T.tap2 + 0.1, 0.3)) });
    if (t >= T.confirm) {
      badge(ctx, hb.x + hb.s * 0.42, hb.y + hb.s * 0.28, 32, 'ok', { pop: back(ev(t, T.confirm, 0.3)) });
      const rk = ev(t, T.chime, 0.9);
      if (rk > 0 && rk < 1) { ctx.save(); ctx.globalAlpha = 1 - rk; ctx.strokeStyle = C.g3; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(hb.x, hb.y, hb.s * (0.62 + 0.3 * easeOut(rk)), 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    }
  }
}
