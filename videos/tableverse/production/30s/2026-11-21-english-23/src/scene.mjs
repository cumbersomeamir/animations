// "Is It Time Yet?" (the cloud train leaves when the big hand reaches 3: three jumps of five minutes, 3 × 5 = 15) —
// Pop-up Counting Storybook (english-23). Entertainment first: a sleepy dragon squashed under an absurd giant pillow keeps
// waking as the station clock jumps five minutes at a time, jams the pillow in the train door, then squeezes aboard.
// Beat-synced hard cuts between the clock, the dragon and the platform; the stage is drawn at camera scale (sharp).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import { drawDragon, drawPillow } from './dragon.mjs';
import { drawRobot } from './robot.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import {
  C, FONT, applyGrain, cutPoly, cutCircle, roundRectPts, pathFrom, piece, withShadow, noShadow, scoreLine, splitPin,
  sparkle, label, measure, starCookieSprite,
} from './craft.mjs';
import { drawBaker } from './baker.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}


// ------------------------------------------------------------------ layout (world px)
const CX = 500; // caption centre (captions live in x 100–900)
const CAP_Y = 372; // caption centre: the upper band y ≈ 280–460
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const RES = 2; // cached page texture at 2× so the close-ups stay sharp
const CLOCK = { x: 540, y: 720, r: 165 };
const SIGN_Y = 912; // payoff sign hinge (hangs below, under the clock)
const RAIL_Y = 1290;
const CAR = { x0: 330, x1: 850, top: 1060, bot: 1272 }; // the boarding carriage
const DOORX = 590, DOOR_HW = 60, DOOR_TOP = 1130;
const DRAGON_HOME = [390, 1462];
const ROBOT = { x: 860, y: 1474, s: 0.55 };
const BAKER = { x: 250, y: 1690, s: 0.74 };

// ------------------------------------------------------------------ helpers
const TEX = {};
function texCanvas(key, w, h) {
  if (!TEX[key]) TEX[key] = createCanvas(w, h);
  const c = TEX[key];
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, w, h);
  return c;
}
function pulse(f, f0, len = 18) {
  const t = f - f0;
  return t >= 0 && t < len ? Math.sin((Math.PI * t) / len) : 0;
}
function cardTex(key, w, h, draw, fill = C.cream, border = C.violet) {
  const c = texCanvas(key, w, h);
  const x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(3, 3, w - 6, h - 6, 26), key.length * 7, 1.1, 14), border, { grainA: 0.06 });
  piece(x, cutPoly(roundRectPts(10, 10, w - 20, h - 20, 20), key.length * 7 + 1, 0.9, 14), fill, { grainA: 0.06 });
  draw(x);
  return c;
}
function eqText(x, parts, cx, cy, size) {
  x.save();
  x.font = `700 ${size}px ${FONT}`;
  const ws = parts.map(([t]) => x.measureText(t).width);
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  x.textBaseline = 'middle';
  parts.forEach(([t, col], i) => { x.fillStyle = col; x.fillText(t, px, cy); px += ws[i]; });
  x.restore();
}
function cloudPuff(ctx, cx, cy, w, h, col, seed) {
  // a cut-paper cloud: overlapping circles along a flat base
  const r = rng(seed);
  ctx.beginPath();
  const n = Math.max(3, Math.round(w / (h * 0.9)));
  for (let i = 0; i < n; i++) {
    const px = cx - w / 2 + (w * (i + 0.5)) / n, pr = h * (0.45 + 0.25 * r());
    ctx.moveTo(px + pr, cy); ctx.arc(px, cy - pr * 0.3, pr, 0, Math.PI * 2);
  }
  ctx.rect(cx - w / 2 + h * 0.3, cy - h * 0.3, w - h * 0.6, h * 0.6);
  ctx.fillStyle = col; ctx.fill();
}

// ------------------------------------------------------------------ camera: one shot per beat-synced cut
function camera(f) {
  const s = T.SHOTS.find((sh) => f >= sh.from && f < sh.to) || T.SHOTS[T.SHOTS.length - 1];
  const u = E.inOutSine(prog(s.from, s.to, f));
  return { z: lerp(s.z[0], s.z[1], u), fx: lerp(s.f[0][0], s.f[1][0], u), fy: lerp(s.f[0][1], s.f[1][1], u) };
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  const fx = 540 + (cam.fx - 540) * factor, fy = 960 + (cam.fy - 960) * factor;
  ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-fx, -fy);
}

// ------------------------------------------------------------------ states
/** minutes past the hour shown by the big hand (with a little spring on each jump) */
function minutes(f) {
  let m = 0;
  for (let k = 0; k < 3; k++) if (f >= T.TICKS[k]) m = 5 * (k + 1) + 5 * (E.outBack(prog(T.TICKS[k], T.TICKS[k] + 7, f)) - 1);
  for (let k = 0; k < T.MORE.length; k++) if (f >= T.MORE[k]) m = 15 + 5 * (k + 1) + 5 * (E.outBack(prog(T.MORE[k], T.MORE[k] + 7, f)) - 1);
  return m;
}
const departX = (f) => 950 * E.inQuad(prog(T.DEPART[0], T.DEPART[1], f));
function doorOpen(f) {
  if (f < T.DOOR_SHUT[0]) return 1;
  return 1 - E.inOutCubic(prog(T.DOOR_SHUT[0], T.DOOR_SHUT[1], f));
}

function dragonState(f) {
  const d = { x: DRAGON_HOME[0], y: DRAGON_HOME[1], s: 1.12, eyes: 'closed', mouth: 'snore', armL: 30, armR: 30, wing: 0, tail: 10 * Math.sin(f * 0.1), rot: -90, layer: 'under' };
  const p = { x: 470, y: 1376, w: 480, h: 228, rot: -4, sx: 1, sy: 1, show: true, held: false };
  const breathe = 0.03 * Math.sin(f * 0.18);
  p.sy = 1 + breathe; p.y = 1376 - 6 * breathe;
  if (f < T.RUSH[0]) {
    if (f >= T.PEEK && f < T.FLOP[0]) { d.eyes = 'peek'; d.mouth = 'smile'; }
    if (f >= T.YAWN[0] && f < T.YAWN[1]) { d.mouth = 'yawn'; d.eyes = 'closed'; d.armL = 150; }
    if (f >= T.TICKS[0] && f < T.FLOP[0]) { d.eyes = 'open'; d.mouth = 'o'; d.look = [0.5, -1]; }
    if (f >= T.FLOP[0] && f < T.FLOP[1]) { const u = prog(T.FLOP[0], T.FLOP[1], f); d.eyes = 'sleepy'; d.mouth = 'yawn'; p.y -= 30 * Math.sin(Math.PI * u); }
    if (f >= T.FLOP[1]) { d.eyes = 'closed'; d.mouth = 'snore'; }
    if (f >= T.TICKS[1] && f < T.RUSH[0]) { d.eyes = 'wide'; d.mouth = 'o'; d.look = [0.8, -1]; }
    d.zzz = f < T.TICKS[0] || (f >= T.FLOP[1] && f < T.TICKS[1]);
    return { d, p };
  }
  // the early rush: stands up with the pillow overhead and charges the door
  d.rot = 0; d.layer = 'front'; d.s = 1.0;
  if (f < T.JAM) {
    const u = prog(T.RUSH[0], T.JAM, f), e = E.inQuad(u);
    d.x = lerp(DRAGON_HOME[0], DOORX - 40, e); d.y = lerp(DRAGON_HOME[1], 1420, e); d.hop = 18 * Math.abs(Math.sin(u * Math.PI * 4));
    d.eyes = 'wide'; d.mouth = 'grin'; d.armL = d.armR = 170; d.wing = 20 * Math.sin(f * 0.9);
    p.held = true; p.x = d.x; p.y = d.y - 330 * d.s - d.hop; p.rot = 0; p.w = 400; p.h = 190;
    return { d, p };
  }
  if (f < T.BOUNCE[1]) {
    // jammed: the pillow squashes against the door frame, everything springs back onto the platform
    const u = prog(T.BOUNCE[0], T.BOUNCE[1], f);
    const k = Math.exp(-(f - T.JAM) / 5);
    d.x = lerp(DOORX - 40, DRAGON_HOME[0] + 20, E.outQuad(u)); d.y = lerp(1420, DRAGON_HOME[1], E.outQuad(u)); d.hop = 60 * Math.sin(Math.PI * u);
    d.eyes = 'wide'; d.mouth = 'o'; d.armL = d.armR = 170; d.rot = -20 * Math.sin(Math.PI * u);
    p.held = true; p.x = d.x + 30 * k; p.y = d.y - 330 - d.hop; p.w = 400; p.h = 190; p.sx = 1 - 0.3 * k; p.sy = 1 + 0.2 * k; p.rot = 6 * Math.sin(f * 0.8) * k;
    return { d, p };
  }
  if (f < T.SQUEEZE[0]) {
    // sits on the pillow, grumpy, then hops up at "All aboard!"
    d.x = DRAGON_HOME[0] + 20; d.y = 1388; d.eyes = 'sleepy'; d.mouth = 'o'; d.armL = 40; d.armR = 40; d.layer = 'onpillow';
    p.x = DRAGON_HOME[0] + 30; p.y = 1420; p.w = 420; p.h = 150; p.rot = 0;
    if (f >= T.TICKS[2]) { d.eyes = 'wide'; d.mouth = 'grin'; d.hop = 8 * Math.abs(Math.sin(f * 0.5)); }
    if (f >= T.WHISTLE - 10) { const u = prog(T.WHISTLE - 10, T.SQUEEZE[0], f); d.x = lerp(DRAGON_HOME[0] + 20, DOORX - 150, u); d.y = lerp(1388, 1440, u); d.layer = 'front'; p.held = true; p.x = d.x + 120; p.y = 1300; p.w = 400; p.h = 190; d.armL = d.armR = 95; d.eyes = 'happy'; d.mouth = 'grin'; }
    return { d, p };
  }
  if (f < T.POP + 10) {
    // pushes the pillow into the door: it squeezes like toothpaste, then pops inside; the dragon hops in after it
    const u = prog(T.SQUEEZE[0], T.SQUEEZE[1], f);
    d.x = DOORX - 150 + 70 * u; d.y = 1440; d.armL = d.armR = 95; d.eyes = u > 0.5 ? 'closed' : 'happy'; d.mouth = 'grin'; d.squashX = 1 + 0.08 * Math.sin(f * 1.4); d.layer = 'front';
    p.held = true; p.x = DOORX - 30 + 30 * u; p.y = 1300 - 10 * u; p.w = 400; p.h = 190; p.sx = lerp(1, 0.28, E.inOutSine(u)); p.sy = lerp(1, 1.18, u); p.squeezing = true;
    if (f >= T.POP) { p.show = false; const v = prog(T.POP, T.POP + 10, f); d.x = lerp(DOORX - 80, DOORX, v); d.y = lerp(1440, RAIL_Y - 4, v); d.hop = 50 * Math.sin(Math.PI * v); d.s = lerp(1, 0.8, v); d.layer = v > 0.6 ? 'inside' : 'front'; d.eyes = 'happy'; d.armL = d.armR = 170; }
    return { d, p };
  }
  // aboard: waves from the window as the train leaves; the pillow bulges out of the next window
  d.layer = 'window'; p.show = false; d.eyes = 'happy'; d.mouth = 'grin';
  return { d, p };
}

function robotState(f) {
  const r = { x: ROBOT.x, y: ROBOT.y, s: ROBOT.s, hat: 'conductor', face: 'open', armL: 15, armR: 15, elbL: 0, elbR: 0, look: -0.3, t: f, bob: 2 * Math.sin(f * 0.15) };
  if (f >= T.TICKS[0] && f < T.TICKS[0] + 20) { r.armR = 150; r.elbR = 40; r.face = 'happy'; } // points at the clock
  if (f >= T.WAG[0] && f < T.WAG[1]) { r.armR = 150; r.elbR = 30 + 30 * Math.sin((f - T.WAG[0]) * 0.7); r.face = 'think'; r.look = -1; }
  if (f >= T.TICKS[2] - 4 && f < T.WHISTLE + 30) { r.armL = 160; r.elbL = 60; r.face = 'happy'; }
  if (f >= T.WHISTLE && f < T.WHISTLE + 30) { r.armR = 120; r.elbR = 80; r.bulb = 0.8; }
  if (f >= T.DEPART[0]) { r.armR = 150 + 20 * Math.sin(f * 0.7); r.face = 'happy'; r.look = 0.6; }
  return r;
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  if (camera(f).z > 1.3) st.rise = 0; // the pop-up baker lies folded flat during the close shots
  if (f >= T.DEPART[0] && f < T.DEPART[1]) { st.aR = 150; st.fR = 30 + 20 * Math.sin(f * 0.6); st.eyes = 'happy'; st.mouth = 'open'; }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ stage pieces
function drawClock(ctx, f) {
  const { x, y, r } = CLOCK;
  // hanging rods from the page top
  ctx.strokeStyle = C.brassDk; ctx.lineWidth = 6;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * 70, BOOK.y + 4); ctx.lineTo(x + sx * 70, y - r * 0.9); ctx.stroke(); splitPin(ctx, x + sx * 70, BOOK.y + 12, 5); }
  ctx.save(); withShadow(ctx, 12, 0.35);
  ctx.beginPath(); ctx.arc(x, y, r + 14, 0, Math.PI * 2);
  const rg = ctx.createLinearGradient(x - r, y - r, x + r, y + r); rg.addColorStop(0, '#F2CB61'); rg.addColorStop(1, '#A87420');
  ctx.fillStyle = rg; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#FFF8EC'; ctx.fill();
  // five-minute wedges filled so far (12 -> 1 -> 2 -> 3, then the demo steps)
  const m = minutes(f);
  const filled = Math.floor((m + 0.01) / 5);
  for (let k = 0; k < Math.min(filled, 7); k++) {
    const a0 = -Math.PI / 2 + (k * Math.PI) / 6, a1 = a0 + Math.PI / 6;
    const glow = k < 3 ? pulse(f, T.WEDGES[k], 18) : 0;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r - 8, a0, a1); ctx.closePath();
    ctx.fillStyle = k < 3 ? `rgba(249,227,14,${0.45 + 0.4 * glow})` : 'rgba(209,152,250,0.5)'; ctx.fill();
    ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 3; ctx.stroke();
  }
  // dots + the four numerals
  for (let k = 0; k < 12; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 6;
    const px = x + Math.cos(a) * (r - 26), py = y + Math.sin(a) * (r - 26);
    if (k % 3 === 0) { label(ctx, String(k === 0 ? 12 : k), x + Math.cos(a) * (r - 40), y + Math.sin(a) * (r - 40) + 2, 46, { fill: C.deep }); }
    else { ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = C.violet; ctx.fill(); }
  }
  // hands: hour (short) and the big minute hand
  const hourA = -Math.PI / 2 + ((9 + m / 60) * Math.PI) / 6, minA = -Math.PI / 2 + (m * Math.PI) / 30;
  const hand = (a, L, w, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
    withShadow(ctx, 5, 0.3);
    piece(ctx, [[-w / 2, 14], [w / 2, 14], [w * 0.2, -L], [0, -L - 10], [-w * 0.2, -L]], 9301 + L, 0, { margin: 2.5, grainA: 0.03 });
    ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(-w / 2, 14); ctx.lineTo(w / 2, 14); ctx.lineTo(w * 0.2, -L); ctx.lineTo(0, -L - 10); ctx.lineTo(-w * 0.2, -L); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  };
  hand(hourA, r * 0.48, 22, C.deep);
  hand(minA, r * 0.8, 16, C.purple);
  // a quick orange second hand spins between the jumps (time passing, cartoon-style)
  if (f < T.DEPART[0]) { const sa = f * 0.35; ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(sa) * (r - 30), y + Math.sin(sa) * (r - 30)); ctx.stroke(); }
  splitPin(ctx, x, y, 9);
}
function drawSign(ctx, f) {
  if (f < T.SIGN[0]) return;
  const u = E.outBack(prog(T.SIGN[0], T.SIGN[1], f));
  const theta = (Math.PI / 2) * (1 - u);
  if (Math.cos(theta) < 0.03) return;
  const tex = cardTex('sign', 380, 100, (x) => eqText(x, [['3 × 5 = ', C.ink], ['15', C.purple]], 190, 53, 70), '#FFF6C9');
  drawPlane(ctx, tex, { x: CLOCK.x - 190, w: 380, hingeY: SIGN_Y, h: 100, theta, dir: 1, F: 1600, shadow: 0.8, warm: 0.3 * pulse(f, T.SIGN[1], 20) });
  ctx.strokeStyle = 'rgba(42,22,80,0.55)'; ctx.lineWidth = 3;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(CLOCK.x + sx * 150, CLOCK.y + CLOCK.r + 10); ctx.lineTo(CLOCK.x + sx * 150, SIGN_Y + 4); ctx.stroke(); splitPin(ctx, CLOCK.x + sx * 150, SIGN_Y + 4, 5); }
}
function drawTrain(ctx, f, st) {
  const dx = departX(f);
  ctx.save();
  ctx.beginPath(); ctx.rect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y); ctx.clip();
  ctx.translate(dx, 0);
  const carBody = (x0, x1, seed) => {
    withShadow(ctx, 8, 0.3);
    piece(ctx, cutPoly(roundRectPts(x0, CAR.top, x1 - x0, CAR.bot - CAR.top, 22), seed, 0.8, 14), C.lilac, { margin: 3, grainA: 0.07 });
    noShadow(ctx);
    piece(ctx, cutPoly(roundRectPts(x0 - 12, CAR.top - 24, x1 - x0 + 24, 40, 18), seed + 1, 0.6, 12), C.orange, { margin: 3, grainA: 0.06 });
    ctx.fillStyle = C.violet; ctx.fillRect(x0 + 6, CAR.bot - 46, x1 - x0 - 12, 14);
    // cloud-puff wheels
    for (const wx of [x0 + 60, x1 - 60]) { const sp = f * 0.4 * (f >= T.DEPART[0] ? 1 : 0); for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(wx - 22 + 44 * i, RAIL_Y - 14, 22, 0, Math.PI * 2); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.strokeStyle = C.violet; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.moveTo(wx - 22 + 44 * i, RAIL_Y - 14); ctx.lineTo(wx - 22 + 44 * i + Math.cos(sp) * 18, RAIL_Y - 14 + Math.sin(sp) * 18); ctx.stroke(); } }
  };
  const windowAt = (wx, lit = 1) => { ctx.beginPath(); ctx.arc(wx, CAR.top + 62, 32, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,226,150,${0.6 + 0.3 * lit})`; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.brass; ctx.stroke(); };
  // rear carriage + boarding carriage + locomotive
  carBody(40, CAR.x0 - 20, 9401); windowAt(110); windowAt(240);
  ctx.strokeStyle = C.deep; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(CAR.x0 - 22, CAR.bot - 40); ctx.lineTo(CAR.x0 + 2, CAR.bot - 40); ctx.stroke();
  carBody(CAR.x0, CAR.x1, 9411); windowAt(420); windowAt(760);
  // the doorway (dark inside) + sliding door panel
  ctx.fillStyle = '#3A1E96'; ctx.fillRect(DOORX - DOOR_HW, DOOR_TOP, 2 * DOOR_HW, CAR.bot - DOOR_TOP);
  if (st.p.squeezing && st.p.show) { ctx.fillStyle = 'rgba(255,226,150,0.5)'; ctx.fillRect(DOORX - DOOR_HW, DOOR_TOP, 2 * DOOR_HW, CAR.bot - DOOR_TOP); }
  const o = doorOpen(f);
  ctx.save(); ctx.beginPath(); ctx.rect(DOORX - DOOR_HW, DOOR_TOP, 2 * DOOR_HW, CAR.bot - DOOR_TOP); ctx.clip();
  ctx.fillStyle = '#E9E0FF'; ctx.fillRect(DOORX - DOOR_HW + 2 * DOOR_HW * o, DOOR_TOP, 2 * DOOR_HW, CAR.bot - DOOR_TOP);
  ctx.strokeStyle = 'rgba(57,12,214,0.4)'; ctx.lineWidth = 3; ctx.strokeRect(DOORX - DOOR_HW + 2 * DOOR_HW * o + 8, DOOR_TOP + 8, 2 * DOOR_HW - 16, CAR.bot - DOOR_TOP - 16);
  ctx.restore();
  ctx.strokeStyle = C.brass; ctx.lineWidth = 7; ctx.strokeRect(DOORX - DOOR_HW, DOOR_TOP, 2 * DOOR_HW, CAR.bot - DOOR_TOP);
  // the dragon inside: waving from the window; the pillow bulging out of the other window
  if (st.d.layer === 'window') {
    ctx.save(); ctx.beginPath(); ctx.arc(760, CAR.top + 62, 30, 0, Math.PI * 2); ctx.clip();
    drawDragon(ctx, { x: 760, y: CAR.top + 62 + 150 * 0.45, s: 0.45, eyes: 'happy', mouth: 'grin', armL: 20, armR: 160 });
    ctx.restore();
    drawPillow(ctx, 420, CAR.top + 50, 120, 70, { rot: -8 + 6 * Math.sin(f * 0.4), seed: 9120 });
  }
  // locomotive (front to the right): violet with a yellow star lamp and a cloud chimney
  withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly([[CAR.x1 + 18, CAR.bot], [CAR.x1 + 18, CAR.top + 10], [CAR.x1 + 110, CAR.top + 10], [CAR.x1 + 110, CAR.top + 70], [CAR.x1 + 200, CAR.top + 92], [CAR.x1 + 214, CAR.bot]], 9421, 0.8, 12), C.violet, { margin: 3, grainA: 0.07 });
  piece(ctx, cutPoly(roundRectPts(CAR.x1 + 140, CAR.top + 18, 34, 74, 10), 9422, 0.5, 8), C.deep, { margin: 2.5, grainA: 0.04 });
  noShadow(ctx);
  windowAt(CAR.x1 + 64);
  sparkle(ctx, CAR.x1 + 200, CAR.top + 140, 26, C.yellow);
  for (const wx of [CAR.x1 + 70, CAR.x1 + 170]) { ctx.beginPath(); ctx.arc(wx, RAIL_Y - 16, 26, 0, Math.PI * 2); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.strokeStyle = C.violet; ctx.lineWidth = 3; ctx.stroke(); }
  // chimney puffs (bigger while leaving)
  const chug = f >= T.DEPART[0] ? 1 : 0.35;
  for (let i = 0; i < 4; i++) {
    const u = ((f * (0.03 + 0.03 * chug) + i / 4) % 1);
    ctx.save(); ctx.globalAlpha = (1 - u) * 0.9;
    cloudPuff(ctx, CAR.x1 + 157 - 60 * u * chug, CAR.top + 10 - 40 - 120 * u, 40 + 60 * u, 26 + 30 * u, '#FFFFFF', 9430 + i);
    ctx.restore();
  }
  ctx.restore();
}
function drawPlatform(ctx) {
  // puffy cut-paper cloud bank the characters stand on (in front of the train wheels)
  ctx.save(); withShadow(ctx, 10, 0.25);
  cloudPuff(ctx, 540, 1330, 1040, 90, '#FFFFFF', 9501);
  ctx.restore();
  ctx.fillStyle = '#F4ECFF'; ctx.fillRect(BOOK.x, 1336, BOOK.w, BOOK.bot - 1336);
  ctx.fillStyle = 'rgba(209,152,250,0.35)'; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.ellipse(80 + k * 115, 1420 + (k % 2) * 40, 60, 16, 0, 0, Math.PI * 2); ctx.fill(); }
}
function drawZzz(ctx, f, x, y) {
  for (let i = 0; i < 3; i++) {
    const u = ((f + i * 14) % 42) / 42;
    ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u);
    label(ctx, 'z', x + 30 * u + i * 8, y - 80 * u, 34 + 10 * i, { fill: C.violet });
    ctx.restore();
  }
}
function drawStage(ctx, f) {
  const st = dragonState(f);
  drawClock(ctx, f);
  drawSign(ctx, f);
  drawTrain(ctx, f, st);
  drawPlatform(ctx);
  const { d, p } = st;
  // the giant pillow and the dragon (order depends on who is on top)
  if (d.layer === 'under') { drawDragon(ctx, d); if (p.show) drawPillow(ctx, p.x, p.y, p.w, p.h, { rot: p.rot, squashX: p.sx, squashY: p.sy }); }
  else if (d.layer === 'onpillow') { drawPillow(ctx, p.x, p.y, p.w, p.h, { rot: p.rot, squashX: p.sx, squashY: p.sy }); drawDragon(ctx, d); }
  else if (d.layer === 'front' || d.layer === 'inside') {
    if (p.show && p.squeezing) {
      // the squeezing pillow is clipped to the doorway on its inner side
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, DOORX + DOOR_HW, H); ctx.clip(); drawPillow(ctx, p.x, p.y, p.w, p.h, { rot: p.rot, squashX: p.sx, squashY: p.sy }); ctx.restore();
    }
    drawDragon(ctx, d);
    if (p.show && p.held && !p.squeezing) drawPillow(ctx, p.x, p.y, p.w, p.h, { rot: p.rot, squashX: p.sx, squashY: p.sy });
  }
  if (d.zzz) drawZzz(ctx, f, 200, 1320);
  // pop puff when the pillow shoots inside
  const pp = prog(T.POP, T.POP + 14, f);
  if (pp > 0 && pp < 1) { ctx.save(); ctx.globalAlpha = 1 - pp; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; cloudPuff(ctx, DOORX + Math.cos(a) * 70 * pp, 1200 + Math.sin(a) * 50 * pp, 50, 30, '#FFFFFF', 9600 + i); } ctx.restore(); }
  // jam stars
  const jp = pulse(f, T.JAM, 14);
  if (jp > 0) for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; sparkle(ctx, DOORX - 60 + Math.cos(a) * 110, 1120 + Math.sin(a) * 60, 20 * jp, C.yellow); }
  drawRobot(ctx, robotState(f));
}

// ------------------------------------------------------------------ perspective hinge renderer
/**
 * Draw `tex` as a rigid card hinged on a horizontal line at hingeY.
 * dir +1: card hangs below the hinge; dir -1: card stands above it. theta: rotation toward the viewer (rad).
 * Pinhole projection about (x + w/2, hingeY) with focal length F. Returns the far edge {y, k}.
 */
function drawPlane(ctx, tex, o) {
  const { x, w, hingeY, h, theta, dir = 1, F = 1500, n = 64, shade = 0, warm = 0, shadow = 0, sx = 0, sy = 0 } = o;
  const sw = o.sw ?? tex.width, sh = o.sh ?? tex.height;
  const cx = x + w / 2;
  const c = Math.cos(theta), s = Math.sin(theta);
  const proj = (d) => { const k = F / (F - d * s); return [hingeY + dir * d * c * k, k]; };
  const far = proj(h);
  if (Math.abs(far[0] - hingeY) < 0.5 && Math.abs(c) < 0.02) return { y: far[0], k: far[1] };
  const quad = [[cx - w / 2, hingeY], [cx + w / 2, hingeY], [cx + (w * far[1]) / 2, far[0]], [cx - (w * far[1]) / 2, far[0]]];
  if (shadow > 0) {
    ctx.save();
    ctx.filter = `blur(${Math.round(10 + shadow * 10)}px)`;
    ctx.fillStyle = `rgba(40,16,60,${0.32 * shadow})`;
    ctx.beginPath();
    quad.forEach((p, i) => (i ? ctx.lineTo(p[0] + 10 * shadow, p[1] + 18 * shadow) : ctx.moveTo(p[0] + 10 * shadow, p[1] + 18 * shadow)));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  let prev = proj(0);
  for (let i = 0; i < n; i++) {
    const p1 = proj((h * (i + 1)) / n);
    const km = (prev[1] + p1[1]) / 2;
    const ww = w * km;
    const srcH = sh / n;
    const srcY = dir > 0 ? sy + srcH * i : sy + sh - srcH * (i + 1);
    const top = Math.min(prev[0], p1[0]);
    const hh = Math.abs(p1[0] - prev[0]);
    if (hh > 0.05) ctx.drawImage(tex, sx, srcY, sw, srcH, cx - ww / 2, top - 0.3, ww, hh + 0.8);
    prev = p1;
  }
  if (shade > 0 || warm > 0) {
    ctx.save();
    ctx.beginPath(); quad.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
    ctx.clip();
    if (shade > 0) { ctx.fillStyle = `rgba(30,12,50,${shade})`; ctx.fillRect(0, Math.min(hingeY, far[0]) - 5, W, Math.abs(far[0] - hingeY) + 10); }
    if (warm > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,214,120,${warm})`; ctx.fillRect(0, Math.min(hingeY, far[0]) - 5, W, Math.abs(far[0] - hingeY) + 10); }
    ctx.restore();
  }
  return { y: far[0], k: far[1] };
}

// ------------------------------------------------------------------ cached layers
let BG = null;
function background() {
  // blurred bakery interior behind the book (depth of field); oversize for parallax
  if (BG) return BG;
  const bw = 1300, bh = 2140;
  const c = createCanvas(bw, bh), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, bh);
  g.addColorStop(0, '#F7E3EE'); g.addColorStop(0.5, '#EED7F2'); g.addColorStop(1, '#D9B98F');
  x.fillStyle = g; x.fillRect(0, 0, bw, bh);
  const r = rng(13);
  x.filter = 'blur(14px)';
  // window light
  x.fillStyle = 'rgba(255,250,235,0.9)'; x.fillRect(820, 260, 360, 520);
  x.fillStyle = 'rgba(200,170,230,0.7)'; x.fillRect(990, 260, 18, 520); x.fillRect(820, 510, 360, 16);
  // shelves with bread loaves, jars, rolling pins (no cookies: counted objects stay in the boxes only)
  for (const sy of [700, 1080]) {
    x.fillStyle = '#B98A56'; x.fillRect(0, sy, 760, 26);
    for (let k = 0; k < 6; k++) {
      const px = 40 + k * 120 + r() * 30;
      if (k % 3 === 0) { x.fillStyle = '#D79A55'; x.beginPath(); x.ellipse(px, sy - 34, 52, 34, 0, Math.PI, 0); x.fill(); }
      else if (k % 3 === 1) { x.fillStyle = 'rgba(185,150,240,0.85)'; x.fillRect(px - 26, sy - 90, 52, 90); x.fillStyle = '#7E5BD8'; x.fillRect(px - 28, sy - 100, 56, 16); }
      else { x.fillStyle = '#E8C08A'; x.fillRect(px - 60, sy - 26, 120, 22); }
    }
  }
  // warm string-light bokeh
  for (let k = 0; k < 16; k++) {
    const px = 40 + k * 80 + r() * 20, py = 120 + Math.sin(k * 0.8) * 40 + r() * 30;
    const rg = x.createRadialGradient(px, py, 0, px, py, 46);
    rg.addColorStop(0, 'rgba(255,214,140,0.95)'); rg.addColorStop(1, 'rgba(255,214,140,0)');
    x.fillStyle = rg; x.beginPath(); x.arc(px, py, 46, 0, Math.PI * 2); x.fill();
  }
  x.filter = 'none';
  // tabletop
  const t = x.createLinearGradient(0, 1540, 0, bh);
  t.addColorStop(0, '#E9C79A'); t.addColorStop(1, '#D3A673');
  x.fillStyle = t; x.fillRect(0, 1560, bw, bh - 1560);
  applyGrain(x, 0, 0, bw, bh, 0.05);
  BG = c;
  return c;
}

let BOOKART = null;
function bookArt() {
  // backdrop page print + page stack; floor page with perspective checker (static)
  if (BOOKART) return BOOKART;
  const c = createCanvas(W, H), x = c.getContext('2d');
  // page stack + violet boards
  x.save(); withShadow(x, 24, 0.3);
  x.fillStyle = C.violet; x.fillRect(BOOK.x - 14, BAR_Y + 10, BOOK.w + 28, BOOK.bot - BAR_Y);
  x.restore();
  for (let k = 3; k >= 1; k--) { x.fillStyle = k % 2 ? '#EFE3CF' : '#FFF8EC'; x.fillRect(BOOK.x - 3 * k, BOOK.y + 2, BOOK.w + 6 * k, BOOK.bot - BOOK.y + k); }
  // floor page (perspective)
  const fq = [[BOOK.x, BOOK.bot], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x + BOOK.w + 90, H + 40], [BOOK.x - 90, H + 40]];
  x.save(); withShadow(x, 18, 0.25);
  pathFrom(x, fq.map((p, i) => [p[0] + (i < 2 ? 0 : (i === 2 ? 12 : -12)), p[1]])); x.fillStyle = C.violet; x.fill();
  x.restore();
  pathFrom(x, fq); x.fillStyle = C.cream; x.fill();
  x.save(); pathFrom(x, fq); x.clip();
  const vx = CX, vy = BOOK.bot - 1500;
  const rows = [];
  for (let k = 0; k <= 6; k++) rows.push(BOOK.bot + (H + 40 - BOOK.bot) * Math.pow(k / 6, 1.3));
  for (let k = 0; k < 6; k++) for (let q = -10; q < 10; q++) {
    if ((q + k) % 2 === 0) continue;
    const pts = [[q, rows[k]], [q + 1, rows[k]], [q + 1, rows[k + 1]], [q, rows[k + 1]]].map(([qq, yy]) => {
      const xb = CX + qq * 130; const u = (yy - vy) / (H + 40 - vy); return [vx + (xb - vx) * u, yy];
    });
    pathFrom(x, pts); x.fillStyle = 'rgba(209,152,250,0.26)'; x.fill();
  }
  const gg = x.createLinearGradient(0, BOOK.bot, 0, BOOK.bot + 60);
  gg.addColorStop(0, 'rgba(60,30,80,0.35)'); gg.addColorStop(1, 'rgba(60,30,80,0)');
  x.fillStyle = gg; x.fillRect(0, BOOK.bot, W, 60);
  applyGrain(x, 0, BOOK.bot, W, H - BOOK.bot, 0.08);
  x.restore();
  BOOKART = c;
  return c;
}

let PAGEPRINT = null;
function pagePrint() {
  // the upright backdrop page: an enchanted cloud-station sky — dawn gradient, a paper sun, layered cloud banks,
  // floating cloud islands and a few twinkles (2× texture for the close-ups)
  if (PAGEPRINT) return PAGEPRINT;
  const c = createCanvas(W * RES, (BOOK.bot + 4) * RES), x = c.getContext('2d'); x.scale(RES, RES);
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 900, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, BOOK.bot);
  g.addColorStop(0, '#CDB8FF'); g.addColorStop(0.55, '#F6D3EC'); g.addColorStop(1, '#FFE3C8');
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y);
  const r = rng(93);
  for (let k = 0; k < 18; k++) sparkle(x, BOOK.x + 30 + r() * (BOOK.w - 60), BOOK.y + 30 + r() * 380, 6 + r() * 8, 'rgba(255,253,248,0.8)');
  // paper sun, low on the left
  x.save(); withShadow(x, 8, 0.2); piece(x, cutCircle(150, 1010, 70, 70, 9701, 1.0, 40), C.yellow, { margin: 3, grainA: 0.05 }); x.restore();
  // floating cloud islands
  for (const [cx, cy, w, h] of [[150, 640, 210, 70], [930, 600, 230, 76], [880, 900, 160, 54]]) { x.save(); withShadow(x, 6, 0.18); cloudPuff(x, cx, cy, w, h, '#FFFFFF', 9710 + cx); x.restore(); }
  // layered cloud banks toward the horizon (lilac -> white)
  for (const [cy, col, seed] of [[1040, '#E7D6FF', 9720], [1100, '#F2E8FF', 9721], [1170, '#FFFFFF', 9722]]) { x.save(); withShadow(x, 5, 0.12); cloudPuff(x, 540, cy, 1060, 110, col, seed); x.fillStyle = col; x.fillRect(BOOK.x, cy, BOOK.w, BOOK.bot - cy); x.restore(); }
  // the cloud rails
  x.fillStyle = C.lilac; x.fillRect(BOOK.x, RAIL_Y - 4, BOOK.w, 10);
  x.fillStyle = C.violet; for (let px = BOOK.x + 10; px < BOOK.x + BOOK.w; px += 46) x.fillRect(px, RAIL_Y + 6, 26, 6);
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.06);
  x.restore();
  PAGEPRINT = c;
  return c;
}

let CTAPAGE = null;
function ctaPageArt() {
  if (CTAPAGE) return CTAPAGE;
  const c = createCanvas(W, BOOK.bot + 4), x = c.getContext('2d');
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 901, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, BOOK.bot);
  g.addColorStop(0, '#24107E'); g.addColorStop(1, C.deep);
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y);
  const r = rng(41);
  for (let k = 0; k < 70; k++) sparkle(x, BOOK.x + r() * BOOK.w, BOOK.y + r() * (BOOK.bot - BOOK.y), 4 + r() * 9, k % 4 ? 'rgba(209,152,250,0.45)' : 'rgba(249,227,14,0.7)');
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.06);
  x.restore();
  CTAPAGE = c;
  return c;
}



// ------------------------------------------------------------------ frame-0 headline (hook words, folds away)
function drawHeadline(ctx, f) {
  if (f >= T.HEADLINE_OUT[1]) return;
  const th = (Math.PI / 2) * E.inCubic(prog(T.HEADLINE_OUT[0], T.HEADLINE_OUT[1], f));
  const tex = texCanvas('headline', 820, 196);
  const x = tex.getContext('2d');
  piece(x, cutPoly(roundRectPts(6, 6, 808, 184, 32), 1501, 1.4, 16), '#FFFDF8', { margin: 0, grainA: 0.05, edge: 'rgba(57,12,214,0.45)' });
  x.fillStyle = C.violet; x.fillRect(26, 20, 8, 156);
  const line = (t, y, col) => { x.save(); x.font = `700 84px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = '#FFFFFF'; x.strokeText(t, 420, y); x.fillStyle = col; x.fillText(t, 420, y); x.restore(); };
  line('IS IT', 58, C.deep);
  line('TIME YET?', 140, C.purple);
  drawPlane(ctx, tex, { x: CX - 410, w: 820, hingeY: 278, h: 196, theta: th, dir: 1, F: 2200, shadow: 0.8, shade: 0.3 * Math.sin(th) });
}

function drawLamp(ctx, f) {
  // hanging paper lamp, top-right (beside the window): motivates the warm key light
  const lx = 990, sw = Math.sin(f * 0.05) * 0.04;
  ctx.save(); ctx.translate(lx, BAR_Y + 38); ctx.rotate(sw);
  ctx.strokeStyle = 'rgba(42,22,80,0.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 64); ctx.stroke();
  const g = ctx.createRadialGradient(0, 120, 4, 0, 120, 120);
  g.addColorStop(0, 'rgba(255,224,140,0.55)'); g.addColorStop(1, 'rgba(255,224,140,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 120, 120, 0, Math.PI * 2); ctx.fill();
  withShadow(ctx, 6, 0.25);
  piece(ctx, cutPoly([[-46, 112], [46, 112], [26, 64], [-26, 64]], 1201, 0.8, 8), C.orange, { margin: 2.5, grainA: 0.06 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(255,240,180,0.95)'; ctx.beginPath(); ctx.arc(0, 118, 11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

let FLOORPROPS = null;
function floorProps() {
  // pop-up rolling pin + flour sack on the floor page, bottom-right (decor, not counted objects)
  if (FLOORPROPS) return FLOORPROPS;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.save(); withShadow(x, 10, 0.3);
  piece(x, cutPoly([[790, 1720], [930, 1720], [950, 1590], [900, 1560], [820, 1560], [770, 1590]], 1301, 1.4, 12), '#F3E3C3', { margin: 3, grainA: 0.12 });
  x.restore();
  x.fillStyle = C.violet; x.fillRect(776, 1626, 168, 26);
  x.fillStyle = 'rgba(255,255,255,0.8)'; for (const [px, py] of [[835, 1580], [870, 1574], [852, 1592]]) { x.beginPath(); x.arc(px, py, 9, 0, Math.PI * 2); x.fill(); }
  x.save(); withShadow(x, 8, 0.3); x.translate(640, 1760); x.rotate(-0.12);
  piece(x, cutPoly(roundRectPts(-120, -20, 240, 40, 20), 1302, 0.8, 12), '#E7C38E', { margin: 2.5, grainA: 0.12 });
  piece(x, cutPoly(roundRectPts(-170, -10, 52, 20, 10), 1303, 0.5, 8), C.purple, { margin: 2, grainA: 0.05 });
  piece(x, cutPoly(roundRectPts(118, -10, 52, 20, 10), 1304, 0.5, 8), C.purple, { margin: 2, grainA: 0.05 });
  x.restore();
  FLOORPROPS = c;
  return c;
}

function drawCTA(ctx, f) {
  ctx.drawImage(ctaPageArt(), 0, 0);
  const s = E.outBack(prog(T.CTA_POP, T.CTA_POP + 14, f));
  const cx = CX, cy = 840, sz = 330;
  if (s > 0.01) {
    // icon card on a V-fold: rises from the page on its base hinge
    const tex = texCanvas('icon', sz + 24, sz + 24);
    const x = tex.getContext('2d');
    piece(x, cutPoly(roundRectPts(2, 2, sz + 20, sz + 20, 78), 12, 1, 14), '#FFFFFF', { grainA: 0.03 });
    x.save(); pathFrom(x, roundRectPts(12, 12, sz, sz, 70)); x.clip(); x.drawImage(ICON, 12, 12, sz, sz); x.restore();
    drawPlane(ctx, tex, { x: cx - (sz + 24) / 2, w: sz + 24, hingeY: cy + sz / 2 + 12, h: sz + 24, theta: -(Math.PI / 2) * (1 - s), dir: -1, shadow: 0.9 });
  }
  const word = 'TableVerse', size = 122;
  ctx.save(); ctx.font = `700 ${size}px ${FONT}`;
  const ws = [...word].map((ch) => ctx.measureText(ch).width);
  ctx.restore();
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  [...word].forEach((ch, i) => {
    const t = f - (T.CTA_POP + 8 + i * 2);
    const sc = t < 0 ? 0 : E.outBack(clamp(t / 8));
    if (sc > 0) {
      ctx.save(); ctx.translate(px + ws[i] / 2, 1130); ctx.scale(sc, sc);
      ctx.font = `700 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#FFFDF8'; ctx.strokeText(ch, 0, 0);
      const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, C.yellow); g.addColorStop(1, C.orange);
      ctx.fillStyle = g; ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    px += ws[i];
  });
  const ps = E.outBack(prog(T.CTA_POP + 26, T.CTA_POP + 36, f));
  if (ps > 0.01) {
    ctx.save(); ctx.translate(cx, 1255); ctx.scale(ps, ps);
    withShadow(ctx, 8, 0.4, '5,0,30');
    piece(ctx, cutPoly(roundRectPts(-210, -38, 420, 76, 38), 13, 0.9, 12), C.cream, { margin: 3, grainA: 0.05 });
    noShadow(ctx); label(ctx, 'on Google Play', 0, 2, 48, { fill: C.deep });
    ctx.restore();
  }
}

function drawHingeBar(ctx) {
  ctx.save(); withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly(roundRectPts(BOOK.x - 20, BAR_Y, BOOK.w + 40, 40, 14), 500, 1, 16), C.violet, { grainA: 0.1 });
  ctx.restore();
  for (let k = 0; k < 8; k++) {
    const rx = BOOK.x + 70 + k * ((BOOK.w - 140) / 7);
    ctx.lineWidth = 7; ctx.strokeStyle = C.brassDk; ctx.beginPath(); ctx.ellipse(rx, BAR_Y + 34, 9, 20, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = '#F2CB61'; ctx.stroke();
  }
}

function drawCaptions(ctx, f) {
  for (let ci = 0; ci < T.CAPTIONS.length; ci++) {
    const [lines, a, b] = T.CAPTIONS[ci];
    if (f < a || f >= b) continue;
    // a caption that continues the previous one (same first line, back-to-back) updates without re-popping
    const prev = T.CAPTIONS[ci - 1], next = T.CAPTIONS[ci + 1];
    const contIn = prev && prev[2] === a && lines[0].startsWith(prev[0][0]);
    const contOut = next && next[1] === b && next[0][0].startsWith(lines[0]);
    const pin = contIn ? 1 : E.outBack(clamp((f - a) / 7));
    const aIn = contIn ? 1 : clamp((f - a) / 4), aOut = contOut || b >= T.FRAMES ? 1 : 1 - clamp((f - (b - 5)) / 5);
    const size = 54, lh = 64;
    const wmax = Math.max(...lines.map((l) => measure(ctx, l, size)));
    const bw = Math.min(800, wmax + 64), bh = lines.length * lh + 28;
    ctx.save();
    ctx.globalAlpha *= aIn * aOut;
    ctx.translate(CX, CAP_Y);
    ctx.scale(0.93 + 0.07 * pin, 0.93 + 0.07 * pin);
    withShadow(ctx, 8, 0.25);
    piece(ctx, cutPoly(roundRectPts(-bw / 2, -bh / 2, bw, bh, 22), 700 + ci, 1.1, 16), '#FFFDF8', { grainA: 0.05, edge: 'rgba(57,12,214,0.35)' });
    noShadow(ctx);
    ctx.fillStyle = C.violet; ctx.fillRect(-bw / 2 + 16, -bh / 2 + 8, 6, bh - 16);
    lines.forEach((ln, k) => label(ctx, ln, 6, (k - (lines.length - 1) / 2) * lh + 3, size, { fill: C.ink }));
    ctx.restore();
  }
}

function drawBunting(ctx, f) {
  const cols = [C.violet, C.cream, C.purple, C.lilac, C.orange, C.cream, C.violet, C.yellow, C.purple, C.lilac, C.cream];
  const sway = Math.sin(f * 0.05) * 5;
  const yAt = (x) => 70 + 60 * (1 - Math.pow((x - 540) / 600, 2)) + sway * Math.sin((x / 1080) * Math.PI);
  ctx.strokeStyle = 'rgba(42,22,80,0.4)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); for (let x = -20; x <= 1100; x += 20) (x === -20 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x))); ctx.stroke();
  for (let k = 0; k < 11; k++) {
    const x0 = 20 + k * 96, x1 = x0 + 70, y0 = yAt(x0), y1 = yAt(x1);
    ctx.save(); withShadow(ctx, 5, 0.18);
    piece(ctx, cutPoly([[x0, y0], [x1, y1], [(x0 + x1) / 2 + Math.sin(f * 0.08 + k) * 4, (y0 + y1) / 2 + 64]], 600 + k, 0.8, 9), cols[k], { margin: 2, grainA: 0.06 });
    ctx.restore();
  }
}

let FG = null;
function foreground() {
  // out-of-focus cloud puffs at the bottom corners (closest depth layer)
  if (FG) return FG;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.filter = 'blur(9px)';
  for (const [cx, cy, w, h, col] of [[60, 1850, 360, 150, 'rgba(255,255,255,0.95)'], [170, 1930, 300, 110, 'rgba(231,214,255,0.95)'], [1040, 1840, 380, 160, 'rgba(255,255,255,0.95)'], [930, 1940, 280, 100, 'rgba(242,232,255,0.95)']]) cloudPuff(x, cx, cy, w, h, col, Math.round(cx + cy));
  x.filter = 'none';
  FG = c;
  return c;
}

// ------------------------------------------------------------------ main
let PAGEBUF = null;
export function drawFrame(ctx, f) {
  if (!PAGEBUF) PAGEBUF = createCanvas(W, BOOK.bot + 4);
  const cam = camera(f);
  // background (blurred, slow parallax)
  ctx.save(); applyCam(ctx, cam, 0.35); ctx.drawImage(background(), -110, -110); ctx.restore();
  ctx.save(); applyCam(ctx, cam, 0.6); drawBunting(ctx, f); ctx.restore();

  // book (boards, stack, floor) + pages
  ctx.save(); applyCam(ctx, cam, 1.0);
  ctx.drawImage(bookArt(), 0, 0);
  const turning = f >= T.PAGE_TURN[0];
  if (turning) drawCTA(ctx, f);
  if (f < T.PAGE_TURN[1]) {
    const b = PAGEBUF.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, W, BOOK.bot + 4);
    if (!turning) { ctx.drawImage(pagePrint(), 0, 0, W, BOOK.bot + 4); drawStage(ctx, f); }
    else {
      b.drawImage(pagePrint(), 0, 0, W, BOOK.bot + 4);
      drawStage(b, f);
      const p = E.inOutSine(prog(T.PAGE_TURN[0], T.PAGE_TURN[1], f));
      const th = p * 89.5 * D2R;
      drawPlane(ctx, PAGEBUF, { x: 0, w: W, hingeY: BOOK.y, h: BOOK.bot - BOOK.y + 4, theta: th, dir: 1, F: 4000, n: 120, sy: BOOK.y, sh: BOOK.bot - BOOK.y + 4, shadow: 0.8, shade: 0.35 * p, warm: 0.15 * p });
    }
  }
  drawHingeBar(ctx);
  drawLamp(ctx, f);
  ctx.drawImage(floorProps(), 0, 0);
  drawBaker(ctx, bakerState(f));
  ctx.restore();

  // closest layer
  ctx.save(); applyCam(ctx, cam, 1.25); ctx.drawImage(foreground(), 0, 0); ctx.restore();

  // warm key light from the top-right + vignette
  const lg = ctx.createRadialGradient(780, 520, 80, 640, 900, 1250);
  lg.addColorStop(0, 'rgba(255,240,205,0.16)'); lg.addColorStop(0.6, 'rgba(255,240,205,0)'); lg.addColorStop(1, 'rgba(50,20,70,0.28)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  drawCaptions(ctx, f);
  drawHeadline(ctx, f);
  applyGrain(ctx, 0, 0, W, H, 0.03, 'overlay');
}

// ------------------------------------------------------------------ thumbnail = frame 0 (the hook image)
export function drawThumbnail(ctx) {
  drawFrame(ctx, 0);
}
