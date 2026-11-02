// Aarambh education pilot 01 — frame renderer.
// Usage:
//   node src/render.mjs --out build/video.mp4            (full render, piped to ffmpeg, video only)
//   node src/render.mjs --stills qa/stills --times 0.5,3.2 (PNG stills at given seconds)
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { clamp, lerp, kf, span, prog, ease, wobble, smooth, invLerp, TAU } from './lib/core.mjs';
import { P, makeGrain, star4, rrect } from './lib/paint.mjs';
import { drawBindu, toLocal, idle } from './lib/bindu.mjs';
import { initWorkshop, drawWorkshopWorld, WS, needleDip, knobPos, drawSwatch } from './lib/workshop.mjs';
import { initMechanism, drawMechanismWorld, drawLens, M } from './lib/mechanism.mjs';
import { drawKicker, drawCaption, drawLabel, drawQuestion, drawBurst, drawBanner } from './lib/ui.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TL = JSON.parse(readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));
const W = TL.width, H = TL.height, FPS = TL.fps, N = Math.round(TL.duration * FPS);
const F = (f) => path.join(ROOT, 'node_modules/@fontsource', f);
GlobalFonts.registerFromPath(F('fraunces/files/fraunces-latin-800-normal.woff2'), 'Fraunces');
GlobalFonts.registerFromPath(F('inter/files/inter-latin-700-normal.woff2'), 'InterB');
GlobalFonts.registerFromPath(F('inter/files/inter-latin-800-normal.woff2'), 'InterX');
GlobalFonts.registerFromPath(F('inter/files/inter-latin-500-normal.woff2'), 'InterM');

// narration timing + lip-sync envelope from the audio build (falls back to estimates)
const timingPath = path.join(ROOT, 'audio/build/narration_timing.json');
const VOT = existsSync(timingPath) ? JSON.parse(readFileSync(timingPath, 'utf8')) : null;
const voLines = TL.vo.map((v, i) => {
  const tm = VOT?.lines?.[v.id];
  return { ...v, start: tm?.start ?? v.start, end: tm?.end ?? v.start + 1.8 };
});
const env = VOT?.envelope ?? null; // per-frame 0..1
const voEnv = (t) => (env ? env[clamp(Math.round(t * FPS), 0, env.length - 1)] : 0);

const grain = makeGrain(512, 11);
initWorkshop(grain);
initMechanism(grain);

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
const mechCanvas = createCanvas(W, H);
const mctx = mechCanvas.getContext('2d');

// static overlays
const vignette = createCanvas(W, H);
{
  const v = vignette.getContext('2d');
  const g = v.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.5, H * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,10,8,0.45)');
  v.fillStyle = g; v.fillRect(0, 0, W, H);
}

const S = TL.scenes, MC = TL.mech;
const camT = (c, cx, cy, z) => c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
const toScreen = (cam, p) => [W / 2 + (p[0] - cam.x) * cam.z, H / 2 + (p[1] - cam.y) * cam.z];

// ---------------- choreography: workshop ----------------
function crankPhi(t) {
  const c = TL.crank;
  if (t < c.rev1[0]) return kf(t, [[0, 0], [c.start, -0.28, 'outQuad'], [c.rev1[0], -0.28]]);
  if (t < c.rev2[0]) return lerp(-0.28, TAU, span(t, c.rev1, 'inOutSine'));
  return lerp(TAU, 2 * TAU, span(t, c.rev2, 'inOutSine'));
}

function workshopCam(t) {
  if (t < 2.2) return { x: lerp(540, 520, prog(t, 0, 2.2, 'inOutSine')), y: lerp(960, 990, prog(t, 0, 2.2, 'inOutSine')), z: lerp(1.0, 1.07, prog(t, 0, 2.2, 'inOutSine')) };
  if (t < 3.55) { const u = prog(t, 2.2, 3.35, 'inOutCubic'); return { x: lerp(520, 430, u), y: lerp(990, 1125, u), z: lerp(1.07, 1.42, u) }; }
  if (t < 6) { const u = prog(t, 3.55, 4.3, 'inCubic'); return { x: lerp(430, WS.P_hole[0], u), y: lerp(1125, WS.P_hole[1], u), z: lerp(1.42, 11, u) }; }
  // T2 exit and S5
  if (t < 12.8) { const u = prog(t, 12.22, 12.75, 'outCubic'); return { x: lerp(WS.P_hole[0], 520, u), y: lerp(WS.P_hole[1], 1075, u), z: lerp(11, 1.28, u) }; }
  const u = prog(t, 12.75, 15, 'inOutSine');
  return { x: 520, y: lerp(1075, 1090, u), z: lerp(1.28, 1.34, u) };
}


function binduWorkshop(t, s, st) {
  const id = idle(t, 0.3);
  const talk = voEnv(t);
  const base = { s: 0.95, flip: -1, ...id, mouthOpen: talk * 1.5, headTurn: 0.35 };
  // S1 crank
  if (t < 2.15) {
    const knob = knobPos(s.phi);
    const p = { ...base, x: WS.stool.x, y: WS.stool.top + 2, lean: 0 };
    p.lean = t < 0.35 ? -0.14 * prog(t, 0, 0.3, 'outQuad') : -0.05 * Math.cos(s.phi) - 0.04;
    p.handF = toLocal(p, [knob[0] - 2, knob[1] + 4]);
    p.handB = toLocal(p, [knob[0] + 14, knob[1] - 6]);
    p.bendF = 1; p.bendB = 1;
    p.eyes = 'open'; p.mouth = 'grin'; p.browB = 0.4; p.browF = 0.5;
    p.pupil = [0.9, 0.5];
    p.sweat = t > 1.3 ? 0.9 : 0;
    p.squash = 1 - 0.04 * Math.max(0, Math.cos(s.phi));
    if (talk < 0.05) p.mouth = 'grin';
    return p;
  }
  // hops to the table
  const hop = (t0, t1, a, b, h) => { const u = prog(t, t0, t1, 'inOutSine'); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - h * 4 * u * (1 - u)]; };
  const A = [WS.stool.x, WS.stool.top + 2], B = [820, 1330], C2 = [640, 1330];
  if (t < 2.85) {
    let pos, sq = 1, lean = 0;
    if (t < 2.2) { pos = A; sq = 1 - 0.18 * prog(t, 2.15, 2.2); }
    else if (t < 2.52) { pos = hop(2.2, 2.52, A, B, 120); sq = 1.08; lean = 0.15; }
    else if (t < 2.58) { pos = B; sq = 0.8 + 0.2 * prog(t, 2.52, 2.58); }
    else { pos = hop(2.58, 2.85, B, C2, 70); sq = 1.06; lean = 0.12; }
    return { ...base, x: pos[0], y: pos[1], squash: sq, lean, handB: [-70, -260], handF: [80, -250], eyes: 'open', mouth: 'smile', pupil: [1, 0.3] };
  }
  // pick up the stitched swatch, flip it: gold on top... cream underneath? puzzled
  if (t < 3.55) {
    const land = wobble(t, 2.85, 0.12, 3, 7);
    const crouch = kf(t, [[2.85, 0], [2.95, 1], [3.08, 0, 'outBack']]);
    const p = { ...base, x: C2[0], y: C2[1], squash: 1 - land - 0.12 * crouch, lean: 0.18 * crouch - (t > 3.3 ? 0.06 : 0) };
    p.handF = kf(t, [[2.85, [90, -120]], [2.95, [140, -40]], [3.08, [120, -180], 'outBack']]);
    p.handB = kf(t, [[2.85, [-60, -120]], [3.3, [-46, -96]]]);
    p.bendF = 1;
    const puzzled = t > 3.28;
    p.browB = puzzled ? -0.7 : 0.4; p.browF = puzzled ? 1 : 0.4;
    p.mouth = puzzled ? 'hmm' : 'o';
    p.pupil = [0.8, 0.5];
    p.headTilt = puzzled ? 0.12 : 0;
    p.headTurn = 0.5;
    p.swatch = { held: t > 2.95, flip: kf(t, [[3.08, 0], [3.3, Math.PI, 'outBack']]) };
    return p;
  }
  // dive into the needle hole, shrinking
  if (t < 4.2) {
    const u = prog(t, 3.52, 3.88, 'inOutQuad');
    const pos = [lerp(C2[0], WS.P_hole[0], u), lerp(C2[1], WS.P_hole[1], u) - 150 * 4 * u * (1 - u)];
    return { ...base, x: pos[0], y: pos[1], s: lerp(0.95, 0.02, prog(t, 3.55, 3.88, 'outQuad')), lean: lerp(0, -1.4, u), handB: [-30, -390], handF: [10, -395], eyes: 'happy', mouth: 'grin', alpha: t > 3.88 ? 0 : 1, shadow: false };
  }
  // S5: pop back to normal size on the table, holding the swatch
  const C5 = [720, 1332];
  const popK = prog(t, 12.68, 12.92, 'outBack');
  const p = { ...base, x: C5[0], y: C5[1], s: 0.95 * popK, alpha: popK > 0.02 ? 1 : 0, lean: 0 };
  const sw = prog(t, 12.75, 13.1, 'outBack');
  p.handF = kf(t, [[12.75, [80, -110]], [13.1, [120, -185], 'outBack']]);
  p.bendF = 1;
  p.handB = kf(t, [[12.75, [-70, -110]], [13.1, [-80, -300], 'outBack'], [13.4, [-60, -120]]]);
  const flip = kf(t, [[TL.s5.flap[0], 0], [TL.s5.flap[0] + 0.25, Math.PI, 'outBack'], [TL.s5.flap[1], Math.PI], [TL.s5.flap[1] + 0.25, 2 * Math.PI, 'outBack']]);
  p.swatch = { held: true, flip };
  const winkOn = t > TL.s5.wink && t < TL.s5.wink + 0.55;
  p.eyes = winkOn ? 'wink' : 'open';
  p.mouth = t > 13.95 ? 'grin' : 'smile';
  p.pupil = t > 14.0 ? [-1, -0.1] : t > 13.3 ? [0.8, 0.4] : [-0.2, -0.9];
  p.headTurn = t > 14.0 ? -0.15 : 0.4;
  p.browB = 0.5; p.browF = 0.5;
  p.headTilt = -0.06 * sw;
  if (talk > 0.05) p.mouthOpen = talk * 1.5;
  return p;
}

// swatch geometry relative to Bindu's front hand (world)
function swatchFromPose(bp) {
  const hand = [bp.x + bp.handF[0] * bp.s * bp.flip, bp.y + bp.handF[1] * bp.s];
  return { px: hand[0] + 6 * bp.flip, py: hand[1], w: 150 * bp.s, h: 92 * bp.s, dir: bp.flip };
}

// ---------------- choreography: mechanism ----------------
function mechState(t) {
  const s = {};
  // needle tip
  if (t < MC.needleDown[1]) s.tipY = lerp(M.needleTDC, M.needleBDC, span(t, MC.needleDown, 'inOutSine'));
  else if (t < MC.loopForm[1]) s.tipY = lerp(M.needleBDC, M.needleBDC - 45, span(t, MC.loopForm, 'outQuad'));
  else s.tipY = lerp(M.needleBDC - 45, M.needleTDC, span(t, MC.needleUp, 'inOutSine'));
  // hook angle: constant speed through catch, decelerates after cast-off
  const w = 1.926;
  if (t < MC.castOff[0]) s.theta = -2.6 + w * (t - 4.4);
  else { const d = Math.min(t - MC.castOff[0], 0.75); s.theta = -2.6 + w * (MC.castOff[0] - 4.4) + w * (d - (d * d) / (2 * 0.75)); }
  // loop mode
  if (t < MC.loopForm[0]) s.loop = 'none';
  else if (t < MC.hookCarry[0]) { s.loop = 'form'; s.loopForm = span(t, MC.loopForm, 'outQuad'); }
  else if (t < MC.castOff[0]) s.loop = 'carry';
  else if (t < MC.lockSnap) { s.loop = 'lasso'; s.lassoU = span(t, MC.takeUp, 'inOutCubic'); }
  else s.loop = 'locked';
  // lever angle (radians; positive = down)
  s.leverA = kf(t, [[4.4, -0.45], [5.0, -0.15], [5.75, 0.05], [8.2, 0.5], [MC.takeUp[0], 0.5], [MC.takeUp[1], -0.5, 'inOutCubic'], [12.2, -0.5]]);
  // thread flow (dash offsets)
  s.flowG = -(s.tipY - M.needleTDC) * 0.6 + (s.loop === 'lasso' ? 900 * smooth(s.lassoU) : 0) + (s.loop === 'locked' ? 900 : 0);
  s.flowB = s.loop === 'lasso' ? 60 * smooth(invLerp(0.7, 1, s.lassoU)) : s.loop === 'locked' ? 60 : 0;
  s.bobbinSpin = s.flowB * 0.01;
  s.shift = M.stitch * span(t, MC.feed, 'inOutCubic');
  s.sparkle = 1 + 0.25 * Math.sin(t * 9);
  return s;
}

function mechCam(t) {
  if (t < 4.4) { const u = prog(t, 3.8, 4.4, 'inOutCubic'); return { x: 540, y: lerp(M.clothTop + 50, 960, u), z: lerp(2.4, 1.0, u) }; }
  if (t < 6.2) return { x: 540, y: 960, z: 1.0 };
  if (t < 9.0) { const u = prog(t, 6.2, 7.0, 'inOutSine'); return { x: 540, y: lerp(960, 985, u), z: lerp(1.0, 1.04, u) }; }
  if (t < 12.2) { const u = prog(t, 9.0, 9.6, 'inOutSine'); const v = prog(t, 10.8, 11.3, 'inOutSine'); return { x: lerp(540, 520, v), y: lerp(985, 900, u) + lerp(0, -20, v), z: lerp(1.04, 1.02, u) + 0.06 * v }; }
  const u = prog(t, 12.22, 12.7, 'inCubic');
  return { x: 540 - 140 * 0, y: lerp(880, M.clothTop + 50, u), z: lerp(1.08, 2.6, u) };
}

function binduMech(t, ms, geo) {
  const id = idle(t, 1.1);
  const talk = voEnv(t);
  const BS = 0.58;
  const base = { s: BS, flip: -1, ...id, mouthOpen: talk * 1.6, headTurn: 0.3, shadow: true };
  const ground = M.clothTop;
  // drop in
  if (t < 4.75) {
    const u = prog(t, 4.0, 4.45, 'inQuad');
    const y = lerp(120, ground, u);
    const sq = t < 4.45 ? 1.1 : 1 - wobble(t, 4.45, 0.3, 2.6, 6);
    return { ...base, x: 780, y, squash: sq, handB: [-40, -380], handF: [20, -385], eyes: t < 4.45 ? 'happy' : 'open', mouth: t < 4.45 ? 'grin' : 'o', mouthOpen: 0.4, alpha: t < 4.0 ? 0 : 1, shadow: t > 4.3 };
  }
  // point at the loop forming
  if (t < 6.0) {
    const startle = t > MC.hookCarry[0] ? wobble(t, MC.hookCarry[0], 0.08, 3, 6) : 0;
    const p = { ...base, x: 780, y: ground, lean: 0.14, squash: 1 - startle };
    p.handF = kf(t, [[4.75, [60, -120]], [5.05, [118, -60], 'outBack']]);
    p.handB = [-60, -120];
    p.pupil = [0.7, 1]; p.browB = 0.4; p.browF = 0.5; p.mouth = 'smile';
    if (t > MC.hookCarry[0]) { p.eyes = 'wide'; p.browB = 1; p.browF = 1; }
    p.propF = (c, h) => { c.translate(h[0], h[1]); c.rotate(0.55); c.fillStyle = P.gold; c.strokeStyle = P.ink; c.lineWidth = 4; c.beginPath(); c.rect(0, -7, 64, 14); c.fill(); c.stroke(); c.fillStyle = P.cream2; c.beginPath(); c.moveTo(64, -7); c.lineTo(82, 0); c.lineTo(64, 7); c.closePath(); c.fill(); c.stroke(); };
    return p;
  }
  // watch the hook, trace the circle with a finger
  if (t < 8.6) {
    const th = ms.theta;
    const p = { ...base, x: 780, y: ground, lean: 0.08 };
    const head = [780, ground - 292 * BS];
    const B = geo.B ?? [540, 1000];
    const dx = B[0] - head[0], dy = B[1] - head[1], d = Math.hypot(dx, dy);
    p.pupil = [clamp(-dx / d * 1.2, -1, 1), clamp(dy / d * 1.2, -1, 1)]; // flipped: local x = -world x
    p.handF = [96 + 26 * Math.sin(th), -170 - 26 * Math.cos(th)];
    p.handB = [-50, -120];
    p.eyes = 'open'; p.browB = 0.6; p.browF = 0.3; p.mouth = 'smile';
    p.headTilt = 0.08 * Math.sin(th);
    return p;
  }
  // scurry left to the take-up lever and grab its eye
  const pv = M.leverPivot;
  const leverEye = (a) => [pv[0] + Math.cos(a) * M.leverLen, pv[1] + Math.sin(a) * M.leverLen];
  const eye = leverEye(ms.leverA);
  if (t < MC.takeUp[0]) {
    const u = prog(t, 8.6, 9.1, 'inOutSine');
    const x = lerp(780, eye[0] + 6, u);
    const stepB = Math.abs(Math.sin(u * Math.PI * 4)) * 26 * (u < 1 ? 1 : 0);
    const p = { ...base, x, y: ground - stepB * 0.4, lean: 0.12 * (u < 1 ? 1 : 0) };
    const reach = prog(t, 9.05, 9.22, 'outQuad');
    p.handF = kf(reach, [[0, [70, -150]], [1, toLocal(p, [eye[0] - 4, eye[1]])]]);
    p.handB = kf(reach, [[0, [-60, -150]], [1, toLocal(p, [eye[0] + 8, eye[1] + 2])]]);
    p.footB = [-24 - stepB * 0.5, -stepB]; p.footF = [24 + stepB * 0.3, 0];
    p.eyes = 'open'; p.mouth = 'grin'; p.pupil = [0.3, -1]; p.browB = 0.5; p.browF = 0.5;
    return p;
  }
  // lifted by the lever, then let go and drop to the cloth
  if (t < MC.drop[0]) {
    const dangle = Math.sin((t - MC.takeUp[0]) * 7) * 0.08 * (t < MC.lockSnap ? 1 : 0) + wobble(t, MC.lockSnap, 0.35, 1.8, 3.5);
    const hangLen = 372 * BS; // hands-to-feet in world px
    const p = { ...base, x: eye[0] + 4, y: eye[1] + hangLen, lean: dangle };
    p.handF = [6, -372]; p.handB = [-10, -370];
    p.bendF = 1; p.bendB = -1;
    const kick = Math.sin((t - 9.25) * 10) * 10;
    p.footB = [-20, -14 + kick]; p.footF = [26, -4 - kick];
    p.eyes = t < MC.lockSnap ? 'wide' : 'happy';
    p.mouth = t < MC.lockSnap ? 'o' : 'grin';
    p.browB = 1; p.browF = 1; p.pupil = [0.6, 1];
    if (talk > 0.05) p.mouthOpen = talk * 1.6;
    // since feet would sink below the cloth at the start, clamp to ground
    if (p.y > ground) p.y = ground;
    return p;
  }
  // drop + magnifier
  const dropU = prog(t, MC.drop[0], MC.drop[1] - 0.05, 'inQuad');
  const eyeTop = leverEye(-0.5);
  const fu = prog(t, MC.drop[0], MC.drop[1], 'linear');
  const fx = lerp(eyeTop[0] + 4, 720, fu);
  const fy = Math.min(ground, lerp(eyeTop[1] + 372 * BS, ground, fu) - 150 * 4 * fu * (1 - fu));
  const land = t > MC.drop[1] ? wobble(t, MC.drop[1], 0.22, 2.8, 6) : 0;
  const shift = ms.shift;
  const hopOut = prog(t, 12.18, 12.42, 'inQuad');
  const p = { ...base, x: fx - shift, y: fy - 700 * hopOut, flip: -1, squash: 1 - land + 0.12 * hopOut, lean: t < MC.drop[1] ? -0.3 * Math.sin(fu * Math.PI) : 0.06 };
  if (hopOut > 0) { p.handF = [20, -390]; p.handB = [-20, -385]; p.eyes = 'happy'; p.mouth = 'grin'; p.shadow = false; }
  p.handF = t < MC.drop[1] ? [40, -380] : [78, -118]; p.handB = t < MC.drop[1] ? [-30, -370] : [-56, -120];
  p.eyes = 'open'; p.mouth = 'smile'; p.pupil = [1, 0.7]; p.browB = 0.6; p.browF = 0.6; p.headTurn = 0.4;
  if (talk > 0.05) p.mouthOpen = talk * 1.6;
  return p;
}

// ---------------- labels in mechanism space ----------------
function mechLabels(c, t, ms, geo) {
  const fadeWin = (a, b, f = 0.2) => clamp(Math.min((t - a) / f, (b - t) / f));
  const eyeY = ms.tipY - 36;
  drawLabel(c, 'needle thread', [533, clamp(eyeY - 80, 680, 900)], [120, 890], P.gold, fadeWin(4.6, 8.7));
  const X = [626, 1062];
  drawLabel(c, 'bobbin thread', [lerp(548, X[0], 0.6), lerp(M.plateBot, X[1], 0.6)], [700, 880], P.bobbin, fadeWin(4.85, 8.7));
  drawLabel(c, 'hook', [M.C[0] + M.Rring * 0.92, M.C[1] + M.Rring * 0.38], [830, 1330], P.metalLight, fadeWin(6.35, 8.9));
  drawLabel(c, 'bobbin', [M.C[0] - 40, M.C[1] + 50], [96, 1330], P.bobbin, fadeWin(7.0, 8.9));
  const pv = M.leverPivot;
  const mid = [pv[0] + Math.cos(ms.leverA) * 80, pv[1] + Math.sin(ms.leverA) * 80];
  drawLabel(c, 'take-up lever', mid, [24, 590], P.metalLight, fadeWin(9.2, 10.9));
  if (ms.loop === 'form' || (ms.loop === 'carry' && t < 6.3)) drawLabel(c, 'loop', geo.tip ?? geo.B ?? [470, clamp(eyeY + 30, 700, 1100)], [150, 1040], P.gold, fadeWin(5.05, 6.3));
}

// ---------------- frame ----------------
function drawFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  const inMech = t >= 3.8 && t < 12.72;
  const inWorkshop = t < 4.4 || t >= 12.2;
  const st = {};
  let wcam = null;
  if (inWorkshop) {
    const s = { phi: crankPhi(Math.min(t, 3.0)), flap: 0 };
    if (t > 12) s.phi = 2 * TAU;
    wcam = workshopCam(t);
    camT(ctx, wcam.x, wcam.y, wcam.z);
    const ws = drawWorkshopWorld(ctx, s);
    const bp = binduWorkshop(t, s, st);
    // swatch lying on the table until picked up
    if (t < 2.95) drawSwatch(ctx, 420, 1342, 150 * 0.95, 92 * 0.95, 0, 1, 1);
    if (t > 12.66 && t < 13.1) drawBurst(ctx, 720, 1020, 110 * prog(t, 12.66, 12.9, 'outQuad'), 1 - prog(t, 12.85, 13.1), P.goldLight);
    if (t < 2.2) { drawBindu(ctx, bp, grain); ws.frontCrank(); }
    else { ws.frontCrank(); drawBindu(ctx, bp, grain); }
    if (bp.swatch?.held && bp.alpha !== 0 && bp.s > 0.05) {
      const sw = swatchFromPose(bp);
      drawSwatch(ctx, sw.px, sw.py, sw.w, sw.h, bp.swatch.flip, sw.dir, 0);
      // front hand on top of the swatch edge
      ctx.fillStyle = P.skin; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(sw.px - 4 * sw.dir, sw.py, 17 * bp.s, 16 * bp.s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // question pop above Bindu
    if (t > 3.22 && t < 3.62) {
      const qa = prog(t, 3.22, 3.4, 'outBack');
      drawQuestion(ctx, 650, 860, clamp(1 - prog(t, 3.5, 3.62)), qa * (1 - 0.3 * prog(t, 3.5, 3.62)), wobble(t, 3.22, 0.25, 2, 4));
    }
    if (t > 3.84 && t < 4.2) drawBurst(ctx, WS.P_hole[0], WS.P_hole[1] - 4, 22 * prog(t, 3.84, 4.0, 'outQuad'), 1 - prog(t, 4.0, 4.2), P.goldLight);
    // sparkle when Bindu pops back (S5)
  }
  if (inMech) {
    const ms = mechState(t);
    const mcam = mechCam(t);
    const c = inWorkshop ? mctx : ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    camT(c, mcam.x, mcam.y, mcam.z);
    const geo = drawMechanismWorld(c, ms);
    const bp = binduMech(t, ms, geo);
    // lock flash + lens
    if (t > MC.lockSnap - 0.02 && t < MC.lockSnap + 0.5) drawBurst(c, M.L[0] - ms.shift, M.L[1], 70 * prog(t, MC.lockSnap, MC.lockSnap + 0.25, 'outQuad'), 1 - prog(t, MC.lockSnap + 0.2, MC.lockSnap + 0.5), P.goldLight);
    const lensA = clamp(prog(t, MC.lens[0], MC.lens[0] + 0.25, 'outQuad') - prog(t, MC.lens[1] - 0.2, MC.lens[1]));
    if (lensA > 0) {
      const k = ease.outBack(clamp((t - MC.lens[0]) / 0.3));
      const hand = [bp.x + 78 * bp.s * bp.flip, bp.y - 118 * bp.s];
      const lc = [M.L[0] - ms.shift + 30, M.L[1] + 170];
      drawLens(c, ms, lc, 132 * Math.max(0.01, k), hand, lensA, 2.3);
      drawLabel(c, 'the lock', [lc[0] + 96, lc[1] + 70], [720, 1010], P.goldLight, lensA * clamp((t - MC.lens[0] - 0.3) / 0.2));
    }
    drawBindu(c, bp, grain);
    mechLabels(c, t, ms, geo);
    if (inWorkshop) {
      // iris composite
      let R;
      if (t < 5) R = 1350 * prog(t, 3.8, 4.4, 'inOutCubic');
      else R = 1350 * (1 - prog(t, 12.25, 12.7, 'inCubic'));
      const ctr = wcam ? toScreen(wcam, WS.P_hole) : [540, 960];
      const cc = [clamp(ctr[0], 0, W), clamp(ctr[1], 0, H)];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (R > 1) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cc[0], cc[1], R, 0, TAU); ctx.clip();
        ctx.drawImage(mechCanvas, 0, 0);
        ctx.restore();
        ctx.save();
        ctx.lineWidth = 14; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cc[0], cc[1], R, 0, TAU); ctx.stroke();
        ctx.lineWidth = 8; ctx.strokeStyle = P.cream; ctx.beginPath(); ctx.arc(cc[0], cc[1], R, 0, TAU); ctx.stroke();
        ctx.restore();
      }
    }
  }
  // ---- screen space overlays ----
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= 12.55) {
    const k = t < TL.s5.banner[1] ? kf(t, [[TL.s5.banner[0], 0], [TL.s5.banner[1], 1, 'outBack']]) : 1;
    drawBanner(ctx, clamp(k, 0, 1.08), grain);
  }
  ctx.drawImage(vignette, 0, 0);
  const tagA = clamp(prog(t, 4.2, 4.5) - prog(t, 12.2, 12.4));
  drawKicker(ctx, 1, tagA);
  // captions
  for (let i = 0; i < voLines.length; i++) {
    const v = voLines[i];
    const next = voLines[i + 1];
    const t0 = v.start - 0.08;
    const t1 = Math.min(v.end + 0.35, next ? next.start - 0.1 : TL.duration);
    if (t >= t0 && t < t1) {
      const a = clamp(Math.min((t - t0) / 0.12, (t1 - t) / 0.12));
      const pop = ease.outBack(clamp((t - t0) / 0.2));
      drawCaption(ctx, v.caption, TL.captionHighlight[v.id] ?? [], a, pop);
    }
  }
  // painterly grain over everything
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = ctx.createPattern(grain, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------------- main ----------------
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

async function main() {
  const stillsDir = arg('--stills', null);
  if (stillsDir) {
    const dir = path.resolve(ROOT, stillsDir);
    mkdirSync(dir, { recursive: true });
    const times = (arg('--times', '0.5,1.5,2.7,3.3,3.9,4.6,5.4,6.4,7.6,8.9,9.8,10.6,11.3,12.4,13.0,14.2')).split(',').map(Number);
    for (const t of times) {
      const t0 = Date.now();
      drawFrame(t);
      const f = path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`);
      writeFileSync(f, canvas.toBuffer('image/png'));
      console.log('still', f, Date.now() - t0, 'ms');
    }
    return;
  }
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4'));
  mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    const t = f / FPS;
    drawFrame(t);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (code) => (code === 0 ? r() : j(new Error('ffmpeg exit ' + code)))));
  console.log('wrote', out, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
main().catch((e) => { console.error(e); process.exit(1); });
