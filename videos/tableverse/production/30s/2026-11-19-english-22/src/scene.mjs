// "Too Many Aliens!" (3 lifts × 4 seats = 12; the 13th alien is left over) — Pop-up Counting Storybook (english-22).
// Entertainment first: an impatient tiny alien squeezes into lift after full lift; the doors open on three lifts of
// four, and twelve seats for thirteen aliens leave exactly one left over. Beat-synced hard cuts between shots.
// Every hinge is drawn with real perspective (strip-projected planes), the background has depth of field,
// camera moves are motivated and parallaxed, and planes are lit by a warm key light from the top-right (lamp + window).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import { drawAlien } from './alien.mjs';
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
const CAP_Y = 372; // caption centre: the brief's upper band y ≈ 280–460
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const LX = [215, 500, 785]; // lift centres
const DOOR = { top: 1010, bot: 1300, hw: 115 }; // doorway (the car interior shows through it); low ceiling = packed cars
const FRAME = { top: 978, hw: 138 };
const RES = 2; // cached page / lift / door textures at 2× so the close-ups stay sharp
const FLOOR_Y = 1300;
const SEAT = [[-55, 1182], [55, 1182], [-55, 1300], [55, 1300]]; // seat j: [dx, feet y]; back row raised on a step
const GS = 1.0; // guest scale
const TS = 0.68; // the tiny alien
const SIGN_Y = 560; // payoff sign hinge (hangs below)
const BAKER = { x: 250, y: 1690, s: 0.74 };

// ------------------------------------------------------------------ textures
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
let LIFTART = null;
function liftArt() {
  // static parts of one lift, drawn around (0, 0) = doorway bottom centre: car interior (back wall, step) and the frame
  if (LIFTART) return LIFTART;
  const w = 2 * FRAME.hw + 40, h = FLOOR_Y - FRAME.top + 90;
  const ox = w / 2, oy = h - 20; // canvas coords of the doorway bottom centre
  const inside = createCanvas(w * RES, h * RES), frame = createCanvas(w * RES, h * RES);
  let x = inside.getContext('2d'); x.scale(RES, RES);
  const dt = DOOR.top - FLOOR_Y; // negative
  const g = x.createLinearGradient(0, oy + dt, 0, oy);
  g.addColorStop(0, '#5A36C8'); g.addColorStop(1, '#3A1E96');
  x.fillStyle = g; x.fillRect(ox - DOOR.hw, oy + dt, 2 * DOOR.hw, -dt);
  // warm ceiling light + wall panels
  const lg = x.createLinearGradient(0, oy + dt, 0, oy + dt + 120);
  lg.addColorStop(0, 'rgba(255,226,150,0.55)'); lg.addColorStop(1, 'rgba(255,226,150,0)');
  x.fillStyle = lg; x.fillRect(ox - DOOR.hw, oy + dt, 2 * DOOR.hw, 120);
  x.fillStyle = 'rgba(255,240,200,0.9)'; x.fillRect(ox - 60, oy + dt + 6, 120, 8);
  x.strokeStyle = 'rgba(209,152,250,0.35)'; x.lineWidth = 2;
  for (const px of [-60, 0, 60]) { x.beginPath(); x.moveTo(ox + px, oy + dt + 30); x.lineTo(ox + px, oy - 140); x.stroke(); }
  // the step the back row sits on
  x.fillStyle = '#2A1470'; x.fillRect(ox - DOOR.hw, oy + (SEAT[0][1] - FLOOR_Y) + 6, 2 * DOOR.hw, FLOOR_Y - SEAT[0][1] - 6);
  x.fillStyle = 'rgba(209,152,250,0.4)'; x.fillRect(ox - DOOR.hw, oy + (SEAT[0][1] - FLOOR_Y) + 6, 2 * DOOR.hw, 4);
  applyGrain(x, ox - DOOR.hw, oy + dt, 2 * DOOR.hw, -dt, 0.08);
  // frame: brass surround with the doorway cut out, rounded top
  x = frame.getContext('2d'); x.scale(RES, RES);
  const outer = roundRectPts(ox - FRAME.hw, oy + (FRAME.top - FLOOR_Y), 2 * FRAME.hw, FLOOR_Y - FRAME.top + 10, 26);
  x.save(); withShadow(x, 10, 0.35);
  pathFrom(x, cutPoly(outer, 8101, 0.9, 14));
  x.rect(ox - DOOR.hw, oy + dt, 2 * DOOR.hw, -dt + 30); // hole (even-odd)
  const bg = x.createLinearGradient(ox - FRAME.hw, 0, ox + FRAME.hw, 0);
  bg.addColorStop(0, '#B9862E'); bg.addColorStop(0.5, '#F2CB61'); bg.addColorStop(1, '#A87420');
  x.fillStyle = bg; x.fill('evenodd');
  x.restore();
  x.strokeStyle = '#FFFDF8'; x.lineWidth = 3; x.strokeRect(ox - DOOR.hw - 2, oy + dt - 2, 2 * DOOR.hw + 4, -dt + 2);
  for (const [px, py] of [[-FRAME.hw + 14, dt - 14], [FRAME.hw - 14, dt - 14], [-FRAME.hw + 14, -12], [FRAME.hw - 14, -12]]) splitPin(x, ox + px, oy + py, 5);
  LIFTART = { inside, frame, ox, oy, w, h };
  return LIFTART;
}
let DOORTEX = null;
function doorTex() {
  if (DOORTEX) return DOORTEX;
  const w = DOOR.hw + 4, h = DOOR.bot - DOOR.top;
  const c = createCanvas(w * RES, h * RES), x = c.getContext('2d'); x.scale(RES, RES);
  const g = x.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#C9B8F2'); g.addColorStop(0.5, '#E9E0FF'); g.addColorStop(1, '#B4A2E6');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(57,12,214,0.35)'; x.lineWidth = 3; x.strokeRect(10, 14, w - 20, h - 28);
  // porthole window in each door
  x.beginPath(); x.arc(w / 2, 90, 26, 0, Math.PI * 2); x.fillStyle = 'rgba(30,14,80,0.75)'; x.fill(); x.lineWidth = 6; x.strokeStyle = C.brass; x.stroke();
  x.fillStyle = C.violet; x.fillRect(0, h - 70, w, 12);
  applyGrain(x, 0, 0, w, h, 0.08);
  DOORTEX = c;
  return c;
}
function drawSeat(ctx, x, y, glow) {
  ctx.save(); withShadow(ctx, 3, 0.25);
  piece(ctx, cutPoly(roundRectPts(x - 40, y - 14, 80, 18, 8), 8201 + Math.round(x), 0.5, 10), C.purple, { margin: 2, grainA: 0.06 });
  ctx.restore();
  if (glow > 0.01) { ctx.save(); ctx.globalAlpha = Math.min(1, glow); ctx.lineWidth = 5; ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.roundRect(x - 44, y - 18, 88, 26, 10); ctx.stroke(); ctx.restore(); }
}

// ------------------------------------------------------------------ label textures
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
/** how far lift k's doors are open (0 shut .. 1 open) */
function doorOpen(k, f) {
  const sm = (a, b) => E.inOutCubic(prog(a, b, f));
  if (k === 0) {
    if (f < T.POP1) return 0.74 - 0.05 * Math.abs(Math.sin(f * 0.45)) - 0.12 * prog(T.POP1 - 14, T.POP1, f);
    let o = 0.62 * (1 - sm(T.DOORS1_SHUT[0], T.DOORS1_SHUT[1]));
    o = Math.max(o, sm(T.DINGS[0], T.DINGS[0] + 14) * (1 - sm(T.DOORS_SHUT[0], T.DOORS_SHUT[1])));
    if (f >= T.OPEN1) o = sm(T.OPEN1, T.OPEN1 + 14);
    return o;
  }
  if (k === 1) {
    let o = 1 - 0.85 * sm(T.SQUEEZE2[0], T.SQUEEZE2[1]);
    if (f >= T.POP2) o = 0.15 * (1 - sm(T.POP2, T.POP2 + 8));
    if (f >= T.DINGS[1]) o = sm(T.DINGS[1], T.DINGS[1] + 14) * (1 - sm(T.DOORS_SHUT[0], T.DOORS_SHUT[1]));
    return o;
  }
  let o = 1 - 0.97 * sm(T.SQUEEZE3[0], T.SQUEEZE3[1]);
  if (f >= T.STRETCH3[1]) o = 0.03 * (1 - sm(T.STRETCH3[1], T.STRETCH3[1] + 4));
  if (f >= T.DINGS[2]) o = sm(T.DINGS[2], T.DINGS[2] + 14) * (1 - sm(T.DOORS_SHUT[0], T.DOORS_SHUT[1]));
  return o;
}
const liftEmpty = (k, f) => k === 0 && f >= T.DOWN1[0];
const countedLift = (f) => T.COUNTS.filter((c) => f >= c).length;

function tinyState(f) {
  const a = { kind: 'tiny', x: 520, y: 1450, s: TS, eyes: 'open', mouth: 'smile', armL: 20, armR: 20, layer: 'floor', look: [0, -0.5] };
  const fly = (p0, p1, u, h, spin) => { const e = E.outQuad(u); a.x = lerp(p0[0], p1[0], e); a.y = lerp(p0[1], p1[1], u) - h * Math.sin(Math.PI * u); a.rot = spin * u; };
  const land = (t) => { const k = Math.exp(-t / 4); a.squashX = 1 + 0.25 * k; a.squashY = 1 - 0.25 * k; };
  const dash = (p0, p1, u) => { a.x = lerp(p0[0], p1[0], E.inOutSine(u)); a.y = lerp(p0[1], p1[1], E.inOutSine(u)); a.hop = 16 * Math.abs(Math.sin(u * Math.PI * 3)); a.armL = 120; a.armR = 120; a.eyes = 'cross'; a.mouth = 'grin'; };
  const P1 = [300, 1445], P2 = [600, 1445], P3 = [700, 1452];
  // ---- lift 1: wedged in the doors
  if (f < T.POP1) {
    Object.assign(a, { x: LX[0] + 3 * Math.sin(f * 0.9), y: FLOOR_Y, squashX: 0.72 + 0.03 * Math.sin(f * 0.9), squashY: 1.12, eyes: 'squint', mouth: 'o', armL: 155, armR: 150, cheeks: 1, layer: 0 });
    if (f > T.POP1 - 12) { a.squashX = 0.62; a.squashY = 1.2; }
    return a;
  }
  if (f < T.LAND1) { fly([LX[0], FLOOR_Y], P1, prog(T.POP1, T.LAND1, f), 150, -360); a.eyes = 'wide'; a.mouth = 'open'; a.armL = a.armR = 160; return a; }
  if (f < T.DASH2[0]) { [a.x, a.y] = P1; land(f - T.LAND1); a.eyes = 'cross'; a.mouth = 'frown'; a.armL = a.armR = 40; return a; }
  // ---- lift 2: dash in, belly-bounce out
  if (f < T.SQUEEZE2[0]) { dash(P1, [LX[1], FLOOR_Y], prog(T.DASH2[0], T.DASH2[1], f)); a.layer = prog(T.DASH2[0], T.DASH2[1], f) > 0.85 ? 1 : 'floor'; return a; }
  if (f < T.POP2) { const u = prog(T.SQUEEZE2[0], T.SQUEEZE2[1], f); Object.assign(a, { x: LX[1], y: FLOOR_Y, squashX: 1 - 0.3 * u, squashY: 1 + 0.12 * u, eyes: 'squint', mouth: 'o', armL: 150, armR: 150, cheeks: u, layer: 1 }); return a; }
  if (f < T.LAND2) { fly([LX[1], FLOOR_Y], P2, prog(T.POP2, T.LAND2, f), 160, 360); a.eyes = 'wide'; a.mouth = 'open'; a.armL = a.armR = 160; return a; }
  if (f < T.DASH3[0]) { [a.x, a.y] = P2; land(f - T.LAND2); a.eyes = 'cross'; a.mouth = 'frown'; return a; }
  // ---- lift 3: the doors catch its antenna
  if (f < T.SQUEEZE3[0]) { dash(P2, [LX[2], FLOOR_Y], prog(T.DASH3[0], T.DASH3[1], f)); a.layer = prog(T.DASH3[0], T.DASH3[1], f) > 0.85 ? 2 : 'floor'; return a; }
  if (f < T.STRETCH3[0]) { const u = prog(T.SQUEEZE3[0], T.SQUEEZE3[1], f); Object.assign(a, { x: LX[2], y: FLOOR_Y, squashX: 1 - 0.32 * u, squashY: 1 + 0.12 * u, eyes: 'squint', mouth: 'o', armL: 150, armR: 150, cheeks: u, layer: 2 }); return a; }
  if (f < T.STRETCH3[1]) {
    const u = E.inOutSine(prog(T.STRETCH3[0], T.STRETCH3[1], f));
    Object.assign(a, { x: LX[2] + 10 * u, y: lerp(FLOOR_Y, 1405, u), eyes: 'squint', mouth: 'grin', armL: 60, armR: 60, layer: 'floor', squashY: 1 - 0.06 * u });
    // the right antenna stays caught at the door seam while the body pulls away
    const tip = [LX[2], FLOOR_Y - (96 + 30) * TS];
    const base = [a.x + 18 * TS, a.y - 96 * TS];
    const dx = tip[0] - base[0], dy = tip[1] - base[1];
    a.antR = (Math.atan2(dx, -dy) * 180) / Math.PI - 14; a.antStretch = Math.max(0, Math.hypot(dx, dy) / TS - 30);
    a.caught = tip;
    return a;
  }
  if (f < T.LAND3) { fly([LX[2] + 10, 1405], P3, prog(T.STRETCH3[1], T.LAND3, f), 120, -300); a.eyes = 'wide'; a.mouth = 'open'; a.armL = a.armR = 170; a.antR = 25 * Math.sin((f - T.STRETCH3[1]) * 1.6); return a; }
  if (f < T.STOMP[0]) { [a.x, a.y] = P3; land(f - T.LAND3); a.sit = 1; a.eyes = 'dizzy'; a.dizzyT = f * 0.6; a.mouth = 'o'; a.armL = a.armR = 70; return a; }
  // ---- impatient: stomps to the middle, arms crossed, foot tapping on the beat
  if (f < T.STOMP[1]) { const u = prog(T.STOMP[0], T.STOMP[1], f); a.x = lerp(P3[0], 520, u); a.y = lerp(P3[1], 1450, u); a.hop = 10 * Math.abs(Math.sin(u * Math.PI * 4)); a.crossed = true; a.eyes = 'cross'; a.mouth = 'frown'; return a; }
  if (f < T.DINGS[0]) {
    a.crossed = true; a.eyes = 'cross'; a.mouth = 'frown';
    const tp = T.TAPS.reduce((m, t) => Math.max(m, pulse(f, t - 4, 10)), 0);
    a.rot = -5 * tp; a.hop = 4 * tp; a.steam = f >= 250;
    return a;
  }
  // ---- the reveal and the count: looks at each lift
  if (f < T.HOP13) {
    const k = f < T.DINGS[1] ? 0 : f < T.DINGS[2] ? 1 : 2;
    const ck = countedLift(f);
    const look = f >= T.COUNTS[0] && f < T.SEATS_GLOW ? Math.max(0, ck - 1) : k;
    a.look = [(LX[look] - 520) / 280, -1]; a.eyes = f >= T.DINGS[0] && f < T.DINGS[0] + 10 ? 'wide' : 'open'; a.mouth = 'o';
    if (f >= T.SEATS_GLOW) { a.look = [0, -1]; a.mouth = 'frown'; }
    return a;
  }
  // ---- "one more alien makes thirteen": hops into the light, one hand up, proud
  if (f < T.ZOOM_IN[0]) {
    const u = prog(T.HOP13, T.HOP13 + 12, f);
    a.x = 520 - 10 * u; a.y = lerp(1450, 1462, u); a.hop = 40 * Math.sin(Math.PI * u);
    a.armR = 170; a.armL = 30; a.eyes = 'happy'; a.mouth = 'grin';
    if (f >= T.LEFTOVER - 4 && f < T.DOORS_SHUT[0]) { const sh = pulse(f, T.LEFTOVER, 24); a.armL = lerp(30, 95, sh); a.armR = lerp(170, 95, sh); a.eyes = 'open'; a.mouth = 'o'; a.look = [0, 0]; }
    if (f >= T.DOORS_SHUT[0]) { a.armR = 150 + 20 * Math.sin(f * 0.6); a.armL = 20; a.eyes = 'open'; a.mouth = 'smile'; a.look = [-0.8, -1]; }
    if (f >= T.OPEN1) { a.eyes = 'wide'; a.mouth = 'open'; a.look = [-1, -1]; }
    return a;
  }
  // ---- the empty lift: zooms in and sprawls across the seats
  if (f < T.SPRAWL) { fly([510, 1462], [LX[0], 1290], prog(T.ZOOM_IN[0], T.ZOOM_IN[1], f), 70, -20); a.eyes = 'happy'; a.mouth = 'open'; a.armL = a.armR = 170; a.layer = prog(T.ZOOM_IN[0], T.ZOOM_IN[1], f) > 0.7 ? 0 : 'floor'; a.speed = true; return a; }
  Object.assign(a, { x: LX[0] + 40, y: 1272, rot: -78, eyes: 'happy', mouth: 'grin', armL: 160, armR: 120 + 30 * Math.sin(f * 0.5), layer: 0, sit: 1 });
  a.hop = 3 * Math.abs(Math.sin(f * 0.4));
  if (f >= T.WINK - 3) a.eyes = 'wink';
  return a;
}

function guestState(k, j, f) {
  const [dx, fy] = SEAT[j];
  const a = { kind: 'guest', x: LX[k] + dx, y: fy - 14, s: GS, sit: 1, eyes: 'open', mouth: 'smile', armL: 20, armR: 20, look: [0, 0] };
  if (j < 2) { a.antL = -18; a.antR = 18; } // back row: antennae bent against the low ceiling
  const ph = k * 1.7 + j * 0.9;
  a.hop = 2 * Math.abs(Math.sin(f * 0.11 + ph));
  if (j < 2) a.look = [0, 0.2];
  // squished by the tiny alien (lift 1 at the start, lift 2 during its squeeze)
  if ((k === 0 && f < T.POP1 + 4) || (k === 1 && f >= T.SQUEEZE2[0] && f < T.POP2 + 4) || (k === 2 && f >= T.SQUEEZE3[0] && f < T.STRETCH3[0])) {
    a.cheeks = 1; a.eyes = 'squint'; a.mouth = j % 2 ? 'o' : 'frown'; a.squashX = 0.9; a.squashY = 1.06;
    if (j >= 2) a.x += (j === 2 ? -8 : 8);
  }
  if (k === 1 && pulse(f, T.POP2 - 4, 10) > 0 && j === 3) { a.squashX = 1.25; a.squashY = 0.88; } // the belly bounce
  // waves when its lift opens; bounces when its lift is counted
  const d = pulse(f, T.DINGS[k] + 6, 22);
  if (d > 0) { a.armR = lerp(20, 165, d); a.eyes = 'happy'; a.mouth = 'open'; }
  const c = pulse(f, T.COUNTS[k], 14);
  if (c > 0) { a.hop += 16 * c; a.eyes = 'happy'; a.mouth = 'open'; }
  if (f >= 364 && f < 406) a.armL = lerp(20, 120, pulse(f, 364 + j * 3 + k * 5, 26));
  // everyone turns to look at number thirteen
  if (f >= T.HOP13 && f < T.DOORS_SHUT[0]) { const tx = 510 - a.x, ty = 1400 - a.y; a.look = [tx / 200, ty / 200]; a.mouth = f < T.SIGN[0] ? 'o' : 'smile'; }
  if (f >= T.DOORS_SHUT[0] - 10 && f < T.DOORS_SHUT[1]) { a.armR = 150 + 20 * Math.sin(f * 0.8 + ph); a.eyes = 'happy'; }
  return a;
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  // the pop-up baker lies folded flat during the close-ups (he would loom over the hook) and stands in the wide shots
  if (camera(f).z > 1.8) st.rise = 0;
  for (const g of [T.SIGN[0] + 8]) { const c = pulse(f, g, 18); if (c > 0) { st.aL = lerp(st.aL, 155, c); st.aR = lerp(st.aR, 155, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ stage
function drawIndicator(ctx, k, f) {
  const cx = LX[k], y = FRAME.top - 30;
  ctx.save(); withShadow(ctx, 5, 0.3);
  piece(ctx, cutPoly(roundRectPts(cx - 44, y - 22, 88, 40, 12), 8301 + k, 0.6, 10), '#2A1650', { margin: 2.5, grainA: 0.05 });
  ctx.restore();
  const up = f >= T.UP[0] && f < T.UP[1] + (k === 0 ? 0 : 200) ? 0.5 + 0.5 * Math.sin(f * 0.9) : 0;
  const down = k === 0 && f >= T.DOWN1[0] && f < T.OPEN1 + 10 ? 0.5 + 0.5 * Math.sin(f * 0.9) : 0;
  const ding = Math.max(pulse(f, T.DINGS[k], 14), k === 0 ? pulse(f, T.DOWN1[1] - 2, 14) : 0);
  const tri = (x0, dir, lit) => {
    ctx.beginPath(); ctx.moveTo(x0, y - 2 - 10 * dir); ctx.lineTo(x0 - 11, y - 2 + 8 * dir); ctx.lineTo(x0 + 11, y - 2 + 8 * dir); ctx.closePath();
    ctx.fillStyle = lit > 0.05 ? `rgba(249,227,14,${0.4 + 0.6 * lit})` : 'rgba(209,152,250,0.35)'; ctx.fill();
  };
  tri(cx - 18, 1, up); tri(cx + 18, -1, down);
  if (ding > 0) { ctx.save(); ctx.globalAlpha = ding; sparkle(ctx, cx + 54, y - 8, 22 * ding, C.yellow); ctx.restore(); }
}
function drawLift(ctx, k, f, tiny) {
  const art = liftArt();
  const cx = LX[k];
  ctx.drawImage(art.inside, cx - art.ox, FLOOR_Y - art.oy, art.w, art.h);
  // seats + passengers: back row first
  const seatsGlow = pulse(f, T.SEATS_GLOW, 26);
  const empty = liftEmpty(k, f);
  for (const row of [[0, 1], [2, 3]]) {
    for (const j of row) drawSeat(ctx, cx + SEAT[j][0], SEAT[j][1], seatsGlow);
    if (!empty) for (const j of row) {
      const g = guestState(k, j, f);
      const glow = pulse(f, T.COUNTS[k], 16) + 0.8 * seatsGlow;
      if (glow > 0.01) { const rg = ctx.createRadialGradient(g.x, g.y - 60, 10, g.x, g.y - 60, 90); rg.addColorStop(0, `rgba(255,236,150,${0.6 * Math.min(1, glow)})`); rg.addColorStop(1, 'rgba(255,236,150,0)'); ctx.fillStyle = rg; ctx.fillRect(g.x - 90, g.y - 150, 180, 180); }
      drawAlien(ctx, g);
    }
  }
  if (tiny && tiny.layer === k) drawAlien(ctx, tiny);
  // sliding doors, clipped to the doorway
  const o = doorOpen(k, f);
  if (o < 0.995) {
    const tex = doorTex(), slide = DOOR.hw * o;
    ctx.save(); ctx.beginPath(); ctx.rect(cx - DOOR.hw, DOOR.top, 2 * DOOR.hw, DOOR.bot - DOOR.top); ctx.clip();
    withShadow(ctx, 6, 0.3);
    const dw = DOOR.hw + 4, dh = DOOR.bot - DOOR.top;
    ctx.drawImage(tex, cx - DOOR.hw - slide - 2, DOOR.top, dw, dh);
    ctx.save(); ctx.translate(cx + DOOR.hw + slide + 2, DOOR.top); ctx.scale(-1, 1); ctx.drawImage(tex, 0, 0, dw, dh); ctx.restore();
    noShadow(ctx);
    ctx.fillStyle = 'rgba(30,12,60,0.5)'; ctx.fillRect(cx - 1.5, DOOR.top, 3, DOOR.bot - DOOR.top); // seam
    ctx.restore();
  }
  ctx.drawImage(art.frame, cx - art.ox, FLOOR_Y - art.oy, art.w, art.h);
  drawIndicator(ctx, k, f);
}
function drawGroups(ctx, f) {
  // each lift's four get a dashed group outline on its count ("Four! Eight! Twelve!"); all three pulse at the payoff
  if (f < T.COUNTS[0] || f >= T.DOORS_SHUT[0] + 4) return;
  const out = 1 - prog(T.DOORS_SHUT[0] - 6, T.DOORS_SHUT[0] + 4, f);
  for (let k = 0; k < 3; k++) {
    if (f < T.COUNTS[k]) continue;
    const s = E.outBack(prog(T.COUNTS[k], T.COUNTS[k] + 10, f)) * out;
    const pz = 1 + 0.05 * (pulse(f, T.GROUPS, 20) + pulse(f, T.COUNTS[k], 12));
    const cx = LX[k], cy = (DOOR.top + DOOR.bot) / 2 - 4, hw = (DOOR.hw + 6) * (0.9 + 0.1 * s) * pz, hh = ((DOOR.bot - DOOR.top) / 2 + 8) * (0.9 + 0.1 * s) * pz;
    ctx.save(); ctx.globalAlpha = clamp(s * 1.3);
    ctx.beginPath(); ctx.roundRect(cx - hw, cy - hh, 2 * hw, 2 * hh, 22);
    ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,253,248,0.95)'; ctx.stroke();
    ctx.setLineDash([22, 14]); ctx.lineDashOffset = -f * 1.5; ctx.lineWidth = 7; ctx.strokeStyle = C.yellow; ctx.stroke();
    ctx.restore();
  }
}
function drawLeftover(ctx, f, a) {
  if (f < T.LEFTOVER || f >= T.ZOOM_IN[0]) return;
  const s = E.outBack(prog(T.LEFTOVER, T.LEFTOVER + 12, f)) * (1 - prog(T.ZOOM_IN[0] - 8, T.ZOOM_IN[0], f));
  ctx.save(); ctx.globalAlpha = clamp(s * 1.3);
  ctx.beginPath(); ctx.ellipse(a.x, a.y - 44, 66 * (0.8 + 0.2 * s), 70 * (0.8 + 0.2 * s), 0, 0, Math.PI * 2);
  ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(255,253,248,0.9)'; ctx.stroke();
  ctx.setLineDash([18, 12]); ctx.lineDashOffset = f * 1.5; ctx.lineWidth = 6; ctx.strokeStyle = C.orange; ctx.stroke();
  ctx.restore();
}
function drawSign(ctx, f) {
  if (f < T.SIGN[0]) return;
  const u = E.outBack(prog(T.SIGN[0], T.SIGN[1], f));
  const theta = (Math.PI / 2) * (1 - u);
  if (Math.cos(theta) < 0.03) return;
  const tex = cardTex('sign', 520, 108, (x) => eqText(x, [['3 × 4 = ', C.ink], ['12', C.purple]], 260, 57, 78), '#FFF6C9');
  drawPlane(ctx, tex, { x: 540 - 260, w: 520, hingeY: SIGN_Y, h: 108, theta, dir: 1, F: 1600, shadow: 0.8, warm: 0.3 * pulse(f, T.SIGN[1], 20) });
  ctx.strokeStyle = 'rgba(42,22,80,0.55)'; ctx.lineWidth = 3;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + sx * 200, BOOK.y + 6); ctx.lineTo(540 + sx * 200, SIGN_Y + 4); ctx.stroke(); splitPin(ctx, 540 + sx * 200, SIGN_Y + 4, 5); }
}
function drawStage(ctx, f) {
  const tiny = tinyState(f);
  // light pool for "thirteen" (behind the characters)
  const lp = f >= T.HOP13 && f < T.ZOOM_IN[0] ? clamp(prog(T.HOP13, T.HOP13 + 8, f)) * (1 - prog(T.ZOOM_IN[0] - 8, T.ZOOM_IN[0], f)) : 0;
  for (let k = 0; k < 3; k++) drawLift(ctx, k, f, tiny);
  drawGroups(ctx, f);
  if (lp > 0) {
    const g = ctx.createRadialGradient(510, 1462, 10, 510, 1462, 150);
    g.addColorStop(0, `rgba(255,236,150,${0.75 * lp})`); g.addColorStop(1, 'rgba(255,236,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(510, 1462, 150, 42, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (tiny.layer === 'floor') {
    if (tiny.speed) { ctx.strokeStyle = 'rgba(255,253,248,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(tiny.x + 40 + i * 6, tiny.y - 30 - i * 18); ctx.lineTo(tiny.x + 120 + i * 10, tiny.y - 10 - i * 18); ctx.stroke(); } }
    drawAlien(ctx, tiny);
  }
  drawLeftover(ctx, f, tiny);
  // steam puffs from an impatient antenna
  if (tiny.steam) for (let i = 0; i < 3; i++) {
    const u = ((f + i * 9) % 27) / 27;
    ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u) * 0.9; ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(tiny.x + (i - 1) * 16 + 10 * u * (i - 1), tiny.y - 115 - 50 * u, 8 + 8 * u, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  // dizzy dots after the twang
  if (f >= T.LAND3 && f < T.STOMP[0] + 4) for (let i = 0; i < 3; i++) {
    const an = f * 0.3 + (i * Math.PI * 2) / 3;
    ctx.beginPath(); ctx.arc(tiny.x + Math.cos(an) * 40, tiny.y - 120 + Math.sin(an) * 12, 6, 0, Math.PI * 2);
    ctx.fillStyle = i === 1 ? C.lilac : C.cyan; ctx.fill(); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 2; ctx.stroke();
  }
  if (f >= T.HOP13 && f < T.HOP13 + 16) { const u = prog(T.HOP13, T.HOP13 + 16, f); ctx.save(); ctx.globalAlpha = 1 - u; for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI * 2; sparkle(ctx, tiny.x + Math.cos(an) * 80 * u, tiny.y - 50 + Math.sin(an) * 60 * u, 14, C.yellow); } ctx.restore(); }
  const wg = pulse(f, T.WINK, 14);
  if (wg > 0) sparkle(ctx, tiny.x - 20, tiny.y - 110, 26 * wg, 'rgba(255,255,255,0.95)');
  drawSign(ctx, f);
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
  // the upright backdrop page: a moon-hotel lobby — violet wall, porthole windows (stars + Earth), crescent emblem,
  // a moon-rock floor with paper craters
  if (PAGEPRINT) return PAGEPRINT;
  const c = createCanvas(W * RES, (BOOK.bot + 4) * RES), x = c.getContext('2d'); x.scale(RES, RES);
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 900, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, FLOOR_Y);
  g.addColorStop(0, '#2B157E'); g.addColorStop(1, '#4A2BB5');
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, FLOOR_Y - BOOK.y);
  const r = rng(91);
  for (let k = 0; k < 60; k++) { x.fillStyle = `rgba(209,152,250,${0.12 + 0.12 * r()})`; x.beginPath(); x.arc(BOOK.x + r() * BOOK.w, BOOK.y + r() * (FLOOR_Y - BOOK.y), 1.5 + r() * 2.5, 0, Math.PI * 2); x.fill(); }
  // porthole windows with stars and a small Earth
  for (const [wx, wy, earth] of [[110, 650, false], [930, 650, true]]) {
    x.save(); withShadow(x, 8, 0.35);
    x.beginPath(); x.arc(wx, wy, 70, 0, Math.PI * 2); x.fillStyle = C.brass; x.fill(); x.restore();
    x.save(); x.beginPath(); x.arc(wx, wy, 56, 0, Math.PI * 2); x.clip();
    x.fillStyle = '#0B0533'; x.fillRect(wx - 60, wy - 60, 120, 120);
    for (let k = 0; k < 14; k++) { x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(wx - 50 + r() * 100, wy - 50 + r() * 100, 1 + r() * 1.8, 0, Math.PI * 2); x.fill(); }
    if (earth) { x.beginPath(); x.arc(wx + 8, wy - 6, 24, 0, Math.PI * 2); x.fillStyle = '#3A8EE8'; x.fill(); x.fillStyle = '#4FA34A'; x.beginPath(); x.ellipse(wx + 2, wy - 12, 10, 7, 0.4, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(wx + 16, wy + 4, 7, 5, -0.3, 0, Math.PI * 2); x.fill(); }
    x.restore();
    splitPin(x, wx, wy - 64, 4); splitPin(x, wx, wy + 64, 4);
  }
  // crescent-moon emblem above the middle lift (no lettering)
  x.save(); withShadow(x, 6, 0.3);
  x.beginPath(); x.arc(LX[1], 750, 38, 0, Math.PI * 2); x.fillStyle = C.yellow; x.fill();
  x.restore();
  x.beginPath(); x.arc(LX[1] + 16, 740, 32, 0, Math.PI * 2); x.fillStyle = '#3A21A0'; x.fill();
  for (const [sx, sy, s] of [[LX[1] + 52, 712, 9], [LX[1] - 58, 780, 7], [LX[1] + 64, 786, 6]]) sparkle(x, sx, sy, s * 1.6, C.yellow);
  // moon-rock floor with paper craters
  const fg = x.createLinearGradient(0, FLOOR_Y, 0, BOOK.bot);
  fg.addColorStop(0, '#C8C1E2'); fg.addColorStop(1, '#A79DCB');
  x.save(); withShadow(x, 6, 0.2); x.fillStyle = fg; x.fillRect(BOOK.x, FLOOR_Y, BOOK.w, BOOK.bot - FLOOR_Y); x.restore();
  for (const [cx2, cy2, rx] of [[120, 1360, 46], [360, 1480, 34], [690, 1350, 28], [930, 1430, 52], [560, 1495, 40]]) {
    x.beginPath(); x.ellipse(cx2, cy2, rx, rx * 0.32, 0, 0, Math.PI * 2); x.fillStyle = 'rgba(90,70,150,0.28)'; x.fill();
    x.beginPath(); x.ellipse(cx2, cy2 - 3, rx * 0.8, rx * 0.22, 0, Math.PI, 0); x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 2; x.stroke();
  }
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.07);
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
  line('TOO MANY', 58, C.deep);
  line('ALIENS!', 140, C.purple);
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
  // out-of-focus moon rocks at the bottom corners (closest depth layer)
  if (FG) return FG;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.filter = 'blur(8px)';
  const rock = (px, py, rx, ry, a, col) => { x.save(); x.translate(px, py); x.rotate(a); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); x.fillStyle = col; x.fill();
    x.fillStyle = 'rgba(60,40,110,0.35)'; for (const [dx, dy, r] of [[-rx * 0.3, -ry * 0.2, rx * 0.16], [rx * 0.25, ry * 0.1, rx * 0.11]]) { x.beginPath(); x.ellipse(dx, dy, r, r * 0.6, 0, 0, Math.PI * 2); x.fill(); } x.restore(); };
  rock(30, 1850, 190, 110, -0.3, 'rgba(150,138,196,0.95)'); rock(150, 1930, 140, 80, 0.2, 'rgba(110,96,170,0.95)');
  rock(1080, 1840, 200, 120, 0.4, 'rgba(176,164,214,0.95)'); rock(960, 1940, 130, 70, -0.2, 'rgba(120,104,180,0.95)');
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
