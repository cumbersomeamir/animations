// Frame composer for the NutriAI 30 s promo. Every timing comes from timeline.json.
import fs from 'node:fs';
import { C, D2R, TAU, arc, clamp, ease, lerp, lum, mix, ramp, rgba, rng, seg, smooth, spring, track, wobble } from './util.mjs';
import { resolve, mixPose, solve, drawStick, contactShadow, headTop, RIG } from './rig.mjs';
import * as P from './props.mjs';
import { drawPhone, anchor, toWorld, CARDS } from './phone.mjs';
import { headline, pill, text, setFrame } from './type.mjs';

export const TL = JSON.parse(fs.readFileSync(new URL('../timeline.json', import.meta.url)));
const E = TL.events;
export const W = TL.width, H = TL.height;
const GROUND = 1470;
const SC = 1.12;
const PH0 = { x: 795, y: 1050 };
const S = Object.fromEntries(TL.scenes.map((s) => [s.id, s]));

// ---------------------------------------------------------------- poses
const EX = (o = {}) => ({ eyes: 'open', mouth: 'smile', look: [0, 0], blink: 0, ...o });
const base = (x, o = {}) => ({ x, ground: GROUND, sc: SC, face: 1, torso: 0, head: 0, aB: [-12, -5], aF: [12, 5], lB: [-6, -2], lF: [6, 2], ...o, ex: EX(o.ex) });
const R = (p) => resolve(p);
const crouchLegs = (k) => ({ lF: [8 + 62 * k, 2 - 34 * k], lB: [-8 + 58 * k, -4 - 40 * k] });

function keyPose(f, keys) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const t = (keys[i][2] || ease.inOutCubic)(seg(f, keys[i - 1][0], keys[i][0]));
      return mixPose(keys[i - 1][1], keys[i][1], t);
    }
  }
  return keys[keys.length - 1][1];
}
function runLegs(ph, amp = 1) {
  const s = Math.sin(ph);
  const th = 46 * s * amp;
  const thB = -46 * s * amp;
  const knee = (v) => 70 * clamp(0.5 - 0.5 * Math.cos(v), 0, 1) * amp;
  return { lF: [th, th - knee(ph - 1.2)], lB: [thB, thB - knee(ph - 1.2 + Math.PI)] };
}
function walkLegs(ph, amp = 1) {
  const s = Math.sin(ph);
  return { lF: [24 * s * amp, 24 * s * amp - 26 * Math.max(0, -Math.cos(ph)) * amp], lB: [-24 * s * amp, -24 * s * amp - 26 * Math.max(0, Math.cos(ph)) * amp] };
}
const blinkAt = (f, frames) => frames.reduce((b, k) => Math.max(b, 1 - Math.abs(f - k) / 3), 0);
const bump = (f, k, w = 4) => clamp(1 - Math.abs(f - k) / w);

// ---------------------------------------------------------------- phone state
const CATCH = [E.catchPlate, E.catchGlass, E.catchScale, E.catchClock];
const TAPS = [E.tap1, E.tap2, E.tap3, E.tap4];
function minuteAngle(f) {
  if (f < E.push) return 0;
  if (f < E.release) return 95 * ease.inOutQuad(seg(f, E.push, E.release));
  return 95 + 175 * ease.outCubic(seg(f, E.release, E.spinEnd));
}
function phoneState(f, stickHand) {
  if (f < E.phoneRise) return null;
  const st = { x: PH0.x, y: PH0.y, s: 1, rot: 0 };
  const pr = seg(f, E.phoneRise, E.phoneSettle);
  st.y = lerp(PH0.y + 980, PH0.y, ease.outBack(pr, 1.25));
  st.squash = f >= E.phoneSettle ? wobble((f - E.phoneSettle) / 30, 3.2, 7) * 0.05 : 0;
  st.rot = (1 - pr) * 6;
  st.cards = CATCH.map((c) => seg(f, c, c + 9));
  st.pulse = [0, 0, 0, 0];
  CATCH.forEach((c, i) => { if (f >= c && f < c + 14) st.pulse[i] = seg(f, c, c + 14); });
  const pulseAt = (i, k) => { if (f >= k && f < k + 14) st.pulse[i] = seg(f, k, k + 14); };
  [E.tickB, E.tickL, E.tickD].forEach((k) => pulseAt(0, k));
  TAPS.forEach((k) => pulseAt(1, k));
  pulseAt(2, E.dotPop);
  pulseAt(3, E.chime);
  // active card per scene
  const act = [[S.S3, 0], [S.S4, 1], [S.S5, 2], [S.S6, 3]];
  st.active = -1;
  st.activeAmt = 0;
  for (const [sc, i] of act) {
    if (f >= sc.start && f < sc.end) {
      st.active = i;
      st.activeAmt = seg(f, sc.start, sc.start + 10) * (1 - seg(f, sc.end - 6, sc.end));
    }
  }
  st.meals = [E.tickB, E.tickL, E.tickD].map((k) => seg(f, k, k + 8));
  st.ring = [E.tickB, E.tickL, E.tickD].reduce((a, k) => a + ease.outCubic(seg(f, k, k + 10)) / 3, 0);
  st.water = TAPS.map((k) => ease.outCubic(seg(f, k, k + 9)));
  st.weightLine = seg(f, E.dotPop - 6, E.dotPop);
  st.weightDot = seg(f, E.dotPop, E.dotPop + 12);
  st.fasting = (minuteAngle(f) / 360) * 1.0;
  // S7: shrink into the stickman's hand
  if (f >= E.shrink && stickHand) {
    const p = ease.inOutCubic(seg(f, E.shrink, E.phoneCatch));
    const target = [stickHand[0] + 8, stickHand[1] - lerp(52, 4, seg(f, E.hug - 4, E.hug + 8))];
    const pos = arc([PH0.x, PH0.y], target, 120, p);
    st.x = pos[0];
    st.y = pos[1];
    st.s = lerp(1, 0.2, p);
    st.rot = lerp(0, -10, p) + (f >= E.phoneCatch ? wobble((f - E.phoneCatch) / 30, 3, 6) * 8 : 0);
    st.glow = bump(f, E.shrink + 6, 14) * 0.8;
    st.active = -1;
  }
  return st;
}

// ---------------------------------------------------------------- S1 tower
const TOWER = [
  { k: 'plate', fall: [-10, E.plateCatch], x0: 470, y0: 260, label: 'Meals', say: TL.narration[1].at[0] },
  { k: 'glass', fall: [E.glassLand - 20, E.glassLand], x0: 520, y0: -160, label: 'Water', say: TL.narration[1].at[1] },
  { k: 'scale', fall: [E.scaleLand - 20, E.scaleLand], x0: 380, y0: -160, label: 'Weight', say: TL.narration[1].at[2] },
  { k: 'clock', fall: [E.clockLand - 20, E.clockLand], x0: 560, y0: -180, label: 'Fasting', say: TL.narration[1].at[3] },
];
function towerTheta(f) {
  let th = 4 * wobble((f - E.plateCatch) / 30, 1.7, 3) + 6 * wobble((f - E.glassLand) / 30, 1.5, 2.6) - 7 * wobble((f - E.scaleLand) / 30, 1.3, 2.2) + 6 * wobble((f - E.clockLand) / 30, 1.2, 1.6);
  if (f > E.clockLand) th += 5 * Math.sin((f - E.clockLand) * 0.32) * seg(f, E.clockLand, E.topple);
  return th;
}
const rot2 = (v, deg) => { const a = deg * D2R; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };
const addv = (a, b) => [a[0] + b[0], a[1] + b[1]];
// positions of stacked objects relative to the plate base PB
function towerSlots(PB, th) {
  const plate = { p: PB, r: th, s: 0.82 };
  const gb = addv(PB, rot2([0, -3], th));
  const glass = { p: gb, r: th * 1.25, s: 0.9 };
  const sb = addv(gb, rot2([0, -101], glass.r));
  const scale = { p: sb, r: th * 1.55, s: 0.55 };
  const cb = addv(sb, rot2([0, -32 - 46], scale.r));
  const clock = { p: cb, r: th * 1.9, s: 0.62 };
  return [plate, glass, scale, clock];
}

// ---------------------------------------------------------------- stickman acting
function stickS1(f) {
  // run in, skid, catch overhead, then buckle under the growing tower
  const runX = track(f, [[0, 40], [13, 440, ease.outCubic]]);
  const load = 0.12 * seg(f, E.plateCatch, E.plateCatch + 6) + 0.16 * seg(f, E.glassLand, E.glassLand + 5) + 0.2 * seg(f, E.scaleLand, E.scaleLand + 5) + 0.22 * seg(f, E.clockLand, E.clockLand + 5);
  const th = towerTheta(f);
  const sway = th * 3.2;
  let p;
  if (f < 10) {
    p = R(base(runX, { torso: 16, ...runLegs(f * 0.95), aF: [-50 * Math.sin(f * 0.95) + 10, -50 * Math.sin(f * 0.95) + 80], aB: [50 * Math.sin(f * 0.95) - 10, 50 * Math.sin(f * 0.95) + 70], ex: EX({ mouth: 'grin', look: [0.6, -0.8], brows: 'determined' }) }));
  } else {
    const k = load + 0.08 * Math.max(0, Math.sin((f - E.clockLand) * 0.5)) * seg(f, E.clockLand, E.topple);
    const legs = crouchLegs(clamp(k, 0, 0.75));
    const skid = 1 - seg(f, 10, 20);
    const x = runX + sway + 4 * Math.sin(f * 0.2) * seg(f, E.scaleLand, E.topple);
    let ex;
    if (f < E.plateCatch + 22) ex = EX({ eyes: 'happy', mouth: 'grin', look: [0, -1], blush: 1 });
    else if (f < E.glassLand) ex = EX({ eyes: 'wide', mouth: 'o', mouthOpen: 0.4, look: [0.4, -1], brows: 'up' });
    else if (f < E.scaleLand) ex = EX({ eyes: 'wide', mouth: 'wavy', look: [0.6, -1], brows: 'worried' });
    else if (f < E.clockLand) ex = EX({ eyes: 'wide', mouth: 'wavy', look: [-0.4, -1], brows: 'worried' });
    else ex = EX({ eyes: 'squeeze', mouth: 'wavy', brows: 'worried' });
    ex.blink = blinkAt(f, [44]);
    p = base(x, { torso: -10 * skid + th * 0.6 - 3 * load, head: -8 - th * 0.4, lF: [legs.lF[0] + 18 * skid, legs.lF[1] + 10 * skid], lB: [legs.lB[0] - 14 * skid, legs.lB[1] - 6 * skid], ex });
    const J0 = solve(p);
    const PB = [J0.shoulder[0] + 6 + th * 1.2, J0.shoulder[1] - 150 + 6 * load];
    const reach = seg(f, 9, E.plateCatch);
    const hb = addv(PB, rot2([-44, 16], th)), hf = addv(PB, rot2([44, 16], th));
    const catchDip = wobble((f - E.plateCatch) / 30, 3, 6) * 18;
    p.aB = { t: [lerp(J0.shoulder[0] - 60, hb[0], reach), lerp(J0.shoulder[1] + 20, hb[1] + catchDip, reach)], bend: 1 };
    p.aF = { t: [lerp(J0.shoulder[0] + 70, hf[0], reach), lerp(J0.shoulder[1] - 40, hf[1] + catchDip, reach)], bend: -1 };
    p = R(p);
    p._PB = [PB[0], PB[1] + catchDip];
  }
  return p;
}

function stickS2(f) {
  const startX = stickS1(E.topple - 1).x;
  const knock = R(base(startX - 40, { torso: -24, head: -10, ...crouchLegs(0.25), aB: [-150, -120], aF: [150, 210], ex: EX({ eyes: 'wide', mouth: 'o', mouthOpen: 0.9, brows: 'up', look: [0.8, -1] }) }));
  const flail = (ff) => R(base(lerp(startX - 40, 320, seg(ff, E.topple, E.butt)), { torso: -26, head: -12, lF: [40, 70], lB: [-10, 20], aB: [-130 - 40 * Math.sin(ff * 0.9), -100], aF: [140 + 50 * Math.sin(ff * 0.9), 200], ex: EX({ eyes: 'wide', mouth: 'o', mouthOpen: 1, brows: 'up', look: [1, -0.6] }) }));
  const sit = (look, ex) => R({ x: 320, y: GROUND - 22, sc: SC, face: 1, torso: -14, head: 4, lF: [84, 92], lB: [74, 104], aB: { t: [252, GROUND - 6], bend: 1 }, aF: [40, 60], ex: EX({ look, ...ex }) });
  const stand = R(base(320, { ex: EX({ mouth: 'smile' }) }));
  if (f < E.butt) {
    const fl = flail(f);
    return mixPose(knock, fl, seg(f, E.topple, E.topple + 4));
  }
  if (f < E.getUp) {
    // follow the flying objects with the eyes
    const c = CATCH.findIndex((k) => f < k + 4);
    const look = c < 0 ? [1, 0.2] : [1, -0.6 + c * 0.35];
    const ex = f < E.catchClock + 6 ? { eyes: 'wide', mouth: 'o', mouthOpen: 0.6, brows: 'up' } : { eyes: 'happy', mouth: 'grin', blush: 1 };
    const sp = sit(look, ex);
    sp.squash = wobble((f - E.butt) / 30, 3, 6) * 0.14;
    sp.ex.blink = blinkAt(f, [190]);
    return sp;
  }
  const up = keyPose(f, [
    [E.getUp, sit([1, 0], { eyes: 'happy', mouth: 'grin' })],
    [E.getUp + 12, R(base(320, { torso: 10, ...crouchLegs(0.3), aB: [-30, -10], aF: [30, 10], ex: EX({ mouth: 'smile' }) })), ease.outCubic],
    [E.phew - 6, stand],
    [E.phew, R(base(320, { head: 6, aF: { t: [372, 1000], bend: -1 }, ex: EX({ eyes: 'closed', mouth: 'flat', brows: 'up' }) }))],
    [E.phew + 8, R(base(320, { head: -4, aF: { t: [270, 1000], bend: -1 }, ex: EX({ eyes: 'closed', mouth: 'o', mouthOpen: 0.4 }) }))],
    [E.phew + 16, R(base(320, { torso: 4, aF: [96, 92], aB: [-18, -10], ex: EX({ eyes: 'happy', mouth: 'grin', look: [1, 0], blush: 1 }) }))],
    [S.S2.end, R(base(322, { torso: 6, aF: [98, 94], aB: [-20, -12], ex: EX({ eyes: 'happy', mouth: 'grin', look: [1, 0], blush: 1 }) }))],
  ]);
  return up;
}

const TABLE_X = 352, TABLE_TOP = 1302;
const plateOnTable = () => [TABLE_X + 26, TABLE_TOP - 18];
function stickS3(f) {
  const x = 292;
  const st = R(base(x, { ex: EX({ look: [-0.6, 0.4] }) }));
  const J0 = solve(st);
  const mouth = [J0.head[0] + 34, J0.head[1] + 22];
  const toast = addv(plateOnTable(), [-30, -22]);
  const idle = R(base(x, { ex: EX({ look: [0.5, 0.6], mouth: 'smile' }) }));
  const reach = R(base(x, { torso: 12, aF: { t: toast, bend: -1 }, ex: EX({ look: [0.6, 1], mouth: 'o', mouthOpen: 0.4 }) }));
  const lift = R(base(x, { torso: 2, head: 4, aF: { t: mouth, bend: -1 }, ex: EX({ look: [0.4, 0.2], mouth: 'chomp', mouthOpen: 1.1, eyes: 'wide' }) }));
  const chomp = R(base(x, { torso: 2, head: 8, aF: { t: [mouth[0] + 6, mouth[1] + 6], bend: -1 }, ex: EX({ eyes: 'happy', mouth: 'chomp', mouthOpen: 0.1, blush: 1 }) }));
  const flickPrep = R(base(x, { torso: 8, aF: [34, 62], ex: EX({ eyes: 'happy', mouth: 'grin', look: [1, -0.2] }) }));
  const flickHit = R(base(x, { torso: 12, aF: [108, 132], ex: EX({ eyes: 'open', mouth: 'grin', look: [1, -0.4] }) }));
  const watch = R(base(x, { torso: 4, aF: [24, 30], ex: EX({ mouth: 'smile', look: [0.4, 0.8] }) }));
  const pump = R(base(x, { torso: -4, head: -6, aF: [146, 186], aB: [-30, -20], ex: EX({ eyes: 'happy', mouth: 'grin', blush: 1, look: [0.6, -0.4] }) }));
  let p = keyPose(f, [
    [S.S3.start, idle],
    [E.plateDrop, idle],
    [E.plateDrop + 4, reach],
    [E.chomp - 4, lift, ease.outCubic],
    [E.chomp, chomp, ease.outQuad],
    [E.flickB - 4, flickPrep],
    [E.flickB + 1, flickHit, ease.outExpo],
    [E.flickB + 8, watch],
    [E.flickL - 4, flickPrep],
    [E.flickL + 1, flickHit, ease.outExpo],
    [E.flickL + 7, watch],
    [E.flickD - 4, flickPrep],
    [E.flickD + 1, flickHit, ease.outExpo],
    [E.tickD, watch],
    [E.tickD + 6, pump, ease.outBack],
    [S.S3.end, pump],
  ]);
  if (f > E.chomp && f < E.flickB - 4) {
    p = { ...p, ex: { ...p.ex, mouthOpen: 0.15 + 0.35 * Math.abs(Math.sin((f - E.chomp) * 0.9)) } };
  }
  return p;
}

function stickS4(f) {
  const x0 = 292, x1 = 505;
  const catchPt = [400, 1030];
  const J0 = solve(R(base(x0)));
  const lookUp = R(base(x0, { aF: [60, 100], ex: EX({ look: [0.6, -1], mouth: 'o', mouthOpen: 0.3, brows: 'up' }) }));
  const reachUp = R(base(x0, { torso: 6, aF: { t: catchPt, bend: -1 }, ex: EX({ look: [0.6, -1], eyes: 'wide', mouth: 'o', mouthOpen: 0.5 }) }));
  const mouth = [J0.head[0] + 34, J0.head[1] + 30];
  const drink = (hd, mo) => R(base(x0, { torso: -6, head: hd, aF: { t: mouth, bend: -1 }, ex: EX({ eyes: 'closed', mouth: 'o', mouthOpen: mo, blush: 0.6 }) }));
  const ahh = R(base(x0, { torso: 0, head: 2, aF: { t: [x0 + 70, 1170], bend: -1 }, ex: EX({ eyes: 'happy', mouth: 'grin', mouthOpen: 0.9, blush: 1 }) }));
  let p = keyPose(f, [
    [S.S4.start, R(base(x0, { aF: [96, 94], ex: EX({ eyes: 'happy', mouth: 'grin' }) }))],
    [S.S4.start + 8, lookUp],
    [E.glassCatch - 3, reachUp],
    [E.glassCatch + 4, R(base(x0, { torso: 2, aF: { t: [catchPt[0] - 10, catchPt[1] + 40], bend: -1 }, ex: EX({ eyes: 'happy', mouth: 'grin' }) })), ease.outBack],
    [E.gulp1 - 6, drink(-14, 0.5)],
    [E.gulp1, drink(-22, 0.2)],
    [E.gulp1 + 6, drink(-16, 0.5)],
    [E.gulp2, drink(-26, 0.2)],
    [E.gulp2 + 5, drink(-20, 0.5)],
    [E.ahh, ahh, ease.outBack],
    [E.ahh + 4, ahh],
  ]);
  // walk to the phone, then tap the water card
  if (f > E.ahh + 4) {
    const wk = seg(f, E.ahh + 4, E.tap1 - 4);
    const x = lerp(x0, x1, ease.inOutQuad(wk));
    const walking = wk > 0 && wk < 1;
    const legs = walking ? walkLegs((f - E.ahh) * 0.75, 1) : { lF: [6, 2], lB: [-6, -2] };
    const target = toWorld({ ...PH0, s: 1, rot: 0 }, [-180 + 46, CARDS[1].y + 84]);
    const rest = [target[0] - 34, target[1] + 30];
    let tap = 0;
    for (const k of TAPS) tap = Math.max(tap, f <= k ? clamp(1 - (k - f) / 4) : clamp(1 - (f - k) / 5));
    const lean = 16 * seg(f, E.tap1 - 10, E.tap1 - 4);
    const hand = [lerp(rest[0], target[0], tap), lerp(rest[1], target[1], tap)];
    const reachAmt = seg(f, E.tap1 - 10, E.tap1 - 4);
    const pp = base(x, { torso: lean, ...legs, aB: { t: [x - 52, 1240], bend: 1 }, ex: EX({ eyes: f > E.tap4 + 2 ? 'happy' : 'open', mouth: 'grin', look: [1, -0.2], blush: f > E.tap4 + 2 ? 1 : 0 }) });
    if (reachAmt > 0) pp.aF = { t: [lerp(x + 60, hand[0], reachAmt), lerp(1180, hand[1], reachAmt)], bend: -1 };
    else pp.aF = { t: [x + 64, 1176], bend: -1 };
    p = R(pp);
  }
  return p;
}

const SCALE_X = 330;
const SCALE_TOP = GROUND - 58;
function stickS5(f) {
  const x0 = 505;
  const scaleArrive = seg(f, E.scaleIn, E.scaleStop);
  const idle = R(base(x0, { torso: 4, aF: [24, 18], ex: EX({ look: [-1, 0.4], mouth: 'o', mouthOpen: 0.3, brows: 'up' }) }));
  const crouch = R(base(x0, { torso: 18, ...crouchLegs(0.7), aB: [-60, -30], aF: [-40, -20], ex: EX({ look: [-1, 0.6], brows: 'determined', mouth: 'flat' }) }));
  let p;
  if (f < E.crouch) {
    p = mixPose(R(base(x0, { aF: [96, 94], ex: EX({ eyes: 'happy', mouth: 'grin' }) })), idle, seg(f, S.S5.start, S.S5.start + 8));
  } else if (f < E.jump) {
    p = mixPose(idle, crouch, ease.outCubic(seg(f, E.crouch, E.jump)));
  } else if (f < E.land) {
    const t = seg(f, E.jump, E.land);
    const x = lerp(x0, SCALE_X, ease.inOutQuad(t));
    const g = lerp(GROUND, SCALE_TOP, t);
    const lift = 4 * 170 * t * (1 - t);
    const air = R(base(x, { ground: g, lift, torso: -6, head: -4, lF: [40, -30], lB: [20, -60], aB: [-150, -170], aF: [150, 170], ex: EX({ eyes: 'happy', mouth: 'grin', blush: 1 }) }));
    p = mixPose(crouch, air, ease.outCubic(seg(f, E.jump, E.jump + 4)));
    p = { ...p, x, ground: g, lift };
  } else {
    const t = (f - E.land) / 30;
    const absorb = clamp(0.65 * Math.exp(-t * 4.5));
    const bal = wobble(t, 1.4, 2.2);
    const lookDot = seg(f, E.dotFly, E.dotPop);
    const on = R(base(SCALE_X, { ground: SCALE_TOP, torso: 8 * bal, head: 10 - 14 * lookDot, ...crouchLegs(absorb), aB: [-96 - 18 * bal, -70], aF: [96 - 18 * bal, 70], ex: EX({ eyes: f < E.dotFly ? 'wide' : 'happy', mouth: f < E.dotFly ? 'o' : 'grin', mouthOpen: 0.5, look: [lerp(0, 1, lookDot), lerp(1, -0.4, lookDot)], blush: f > E.dotPop ? 1 : 0 }) }));
    on.squash = wobble(t, 3, 7) * 0.16;
    p = on;
    if (f > E.stepOff) {
      const u = seg(f, E.stepOff, E.stepOff + 16);
      const x = lerp(SCALE_X, 440, ease.inOutQuad(u));
      const g = lerp(SCALE_TOP, GROUND, u);
      const lift = 4 * 60 * u * (1 - u);
      const off = R(base(x, { ground: g, lift, torso: 6, lF: [30, -10], lB: [-20, -30], aB: [-40, -20], aF: [40, 20], ex: EX({ eyes: 'happy', mouth: 'grin' }) }));
      const land = R(base(440, { aF: [20, 10], ex: EX({ mouth: 'smile', look: [0.6, 0] }) }));
      p = u < 1 ? mixPose(on, { ...off, x, ground: g, lift }, ease.outCubic(seg(f, E.stepOff, E.stepOff + 4))) : mixPose(off, land, seg(f, E.stepOff + 16, E.stepOff + 22));
    }
  }
  return p;
}

const CLOCK_X = 296, CLOCK_S = 1.8;
const CLOCK_Y = GROUND - (60 + 14) * CLOCK_S;
function clockState(f) {
  const drop = seg(f, E.clockDrop, E.clockStop);
  let y = lerp(-260, CLOCK_Y, ease.inQuad(drop));
  let sq = 0;
  if (f >= E.clockStop) { y = CLOCK_Y; sq = wobble((f - E.clockStop) / 30, 3, 6) * 0.12; }
  let x = CLOCK_X;
  if (f > S.S6.end - 8) x = lerp(CLOCK_X, -320, ease.inBack(seg(f, S.S6.end - 8, S.S6.end + 10)));
  const shake = f > E.release && f < E.spinEnd ? Math.sin(f * 2.2) * 0.25 * (1 - seg(f, E.release, E.spinEnd)) : 0;
  return { x, y, sq, shake, minA: minuteAngle(f) };
}
function stickS6(f) {
  const x0 = 440;
  const cs = clockState(f);
  const tip = P.clockTip(cs.x, cs.y, CLOCK_S, cs.minA, 40);
  const idle = R(base(x0, { aF: [20, 10], ex: EX({ mouth: 'smile', look: [-0.4, -0.4] }) }));
  const flinch = R(base(x0 + 10, { torso: -10, head: -6, aB: [-40, -60], aF: [40, 70], ex: EX({ eyes: 'wide', mouth: 'o', mouthOpen: 0.7, brows: 'up', look: [-1, -0.2] }) }));
  const crouchP = (t, effort) => R(base(x0 - 6, { ...crouchLegs(0.72), aF: { t, bend: 1 }, aB: [-40, -50], ex: EX(effort ? { eyes: 'squeeze', mouth: 'wavy', brows: 'determined', look: [-1, 0] } : { eyes: 'open', mouth: 'grin', look: [-1, 0.2], brows: 'determined' }) }));
  let p;
  if (f < E.clockStop) p = idle;
  else if (f < E.grab - 8) p = mixPose(flinch, idle, seg(f, E.clockStop + 4, E.grab - 8));
  else if (f < E.release) {
    const lean = -18 * seg(f, E.push, E.release);
    const cp = crouchP(tip, f >= E.push);
    cp.torso = lean - 8;
    const resolved = R({ ...cp, aF: { t: tip, bend: 1 } });
    p = f < E.grab ? mixPose(idle, resolved, ease.outCubic(seg(f, E.grab - 8, E.grab))) : resolved;
  } else {
    const after = R(base(x0, { torso: 10, head: -4, aF: [50, 80], aB: [-50, -80], ex: EX({ eyes: 'wide', mouth: 'o', mouthOpen: 0.6, brows: 'up', look: [-1, -0.3] }) }));
    const happy = R(base(x0, { torso: 2, aF: [30, 40], aB: [-20, -10], ex: EX({ eyes: 'happy', mouth: 'grin', blush: 1, look: [-0.6, 0] }) }));
    const yawn = R(base(x0, { torso: -4, head: -10, aB: [-158, -176], aF: [158, 176], ex: EX({ eyes: 'closed', mouth: 'o', mouthOpen: 1.3 }) }));
    const last = crouchP(P.clockTip(cs.x, cs.y, CLOCK_S, minuteAngle(E.release), 40), true);
    p = keyPose(f, [
      [E.release, R({ ...last, aF: [60, 40] })],
      [E.release + 8, after, ease.outBack],
      [E.chime, happy],
      [E.yawn, happy],
      [E.yawn + 10, yawn, ease.outCubic],
      [S.S6.end, yawn],
    ]);
  }
  return p;
}

function stickS7(f) {
  const x = 440;
  const yawn = R(base(x, { torso: -4, head: -10, aB: [-158, -176], aF: [158, 176], ex: EX({ eyes: 'closed', mouth: 'o', mouthOpen: 1.3 }) }));
  const J0 = solve(R(base(x)));
  const offer = R(base(x, { torso: 4, aF: { t: [x + 120, 1190], bend: -1 }, aB: [-16, -8], ex: EX({ look: [1, -0.6], mouth: 'o', mouthOpen: 0.4, brows: 'up' }) }));
  const look = R(base(x, { torso: 2, head: 10, aF: { t: [J0.head[0] + 92, J0.head[1] + 56], bend: -1 }, ex: EX({ look: [1, 0.6], eyes: 'happy', mouth: 'grin' }) }));
  const chest = [J0.shoulder[0] + 18, J0.shoulder[1] + 52];
  const hug = R(base(x, { torso: -3, head: -6, aF: { t: [chest[0] + 8, chest[1]], bend: -1 }, aB: { t: [chest[0] + 30, chest[1] + 10], bend: 1 }, ex: EX({ eyes: 'happy', mouth: 'grin', blush: 1, look: [0.4, 0] }) }));
  let p = keyPose(f, [
    [S.S7.start, yawn],
    [S.S7.start + 8, R(base(x, { aF: [30, 20], ex: EX({ look: [1, -0.6], mouth: 'smile' }) }))],
    [E.shrink + 8, offer],
    [E.phoneCatch, offer],
    [E.phoneCatch + 3, R({ ...offer, aF: R(base(x, { aF: { t: [x + 120, 1206], bend: -1 } })).aF })],
    [E.phoneCatch + 8, offer],
    [E.hug - 4, look],
    [E.hug + 8, hug, ease.outBack],
  ]);
  if (f > E.hug + 8) {
    const sw = Math.sin((f - E.hug) * 0.16) * 3;
    p = { ...p, torso: (p.torso ?? 0) + sw, head: (p.head ?? 0) - sw };
  }
  return p;
}

function stickS8(f) {
  const x = 540, g = 1612;
  const pop = ease.outBack(seg(f, E.wordIn + 4, E.wordIn + 18), 1.6);
  const hop = Math.max(0, Math.sin(clamp((f - E.press + 4) / 12) * Math.PI)) * 46;
  const pointing = seg(f, E.point - 4, E.point + 4);
  const wave = f > E.press + 10 ? Math.sin((f - E.press) * 0.55) * 22 : 0;
  const p = base(x, {
    ground: g + (1 - pop) * 420, lift: hop, sc: 0.68, torso: 0,
    aF: [lerp(14, 150, pointing) + wave, lerp(6, 182, pointing) + wave * 1.4],
    aB: [-14, -6],
    ...(hop > 1 ? crouchLegs(0.25) : {}),
    ex: EX({ eyes: f > E.press ? 'happy' : 'open', mouth: 'grin', look: [0.3, -1], blush: 1 }),
  });
  return R(p);
}

export function stickPose(f) {
  if (f < S.S2.start) return stickS1(f);
  if (f < S.S3.start) return stickS2(f);
  if (f < S.S4.start) return stickBlend(f, stickS2, stickS3, S.S3.start, 8);
  if (f < S.S5.start) return stickBlend(f, stickS3, stickS4, S.S4.start, 6);
  if (f < S.S6.start) return stickBlend(f, stickS4, stickS5, S.S5.start, 6);
  if (f < S.S7.start) return stickBlend(f, stickS5, stickS6, S.S6.start, 8);
  if (f < S.S8.start) return stickBlend(f, stickS6, stickS7, S.S7.start, 6);
  return stickS8(f);
}
function stickBlend(f, prevFn, nextFn, start, dur) {
  if (f < start) return prevFn(f);
  if (!dur || f >= start + dur) return nextFn(f);
  return mixPose(prevFn(start - 1), nextFn(f), ease.inOutQuad(seg(f, start - 1, start + dur)));
}

// ---------------------------------------------------------------- follow-through: leaf sprout spring
const SWAY = new Float32Array(TL.frames + 2);
let swayReady = false;
function buildSway() {
  const tops = [];
  for (let f = 0; f < TL.frames; f++) tops.push(headTop(solve(stickPose(f))));
  let th = 0, om = 0;
  for (let f = 0; f < TL.frames; f++) {
    const a = f >= 2 ? tops[f][0] - 2 * tops[f - 1][0] + tops[f - 2][0] : 0;
    const ay = f >= 2 ? tops[f][1] - 2 * tops[f - 1][1] + tops[f - 2][1] : 0;
    const acc = -0.16 * th - 0.16 * om - 1.25 * clamp(a, -40, 40) + 0.35 * clamp(ay, -40, 40) * Math.sign(th || 1);
    om += acc;
    th = clamp(th + om, -55, 55);
    SWAY[f] = th;
  }
  swayReady = true;
}

// ---------------------------------------------------------------- world
function tod(f) {
  if (f < S.S3.start) return 0;
  if (f < S.S4.start) return lerp(0.08, 0.3, seg(f, S.S3.start, S.S4.start));
  if (f < S.S5.start) return lerp(0.3, 0.48, seg(f, S.S4.start, S.S5.start));
  if (f < S.S6.start) return lerp(0.48, 0.62, seg(f, S.S5.start, S.S6.start));
  if (f < S.S7.start) return lerp(0.62, 0.97, ease.inOutSine(seg(f, S.S6.start, S.S6.start + 70)));
  return lerp(0.97, 1, seg(f, S.S7.start, S.S8.start));
}
const SKY = [[0, '#F4ECDC'], [0.08, '#F9E2BC'], [0.3, '#F6EBD3'], [0.48, '#EDF1DA'], [0.62, '#F6D9A8'], [0.74, '#E9A57E'], [0.84, '#6A6680'], [0.92, '#2D3A4A'], [1, '#22303C']];
const FAR = [[0, '#DCE6C6'], [0.5, '#CDE1AE'], [0.62, '#D8C792'], [0.76, '#B78E72'], [0.86, '#46505E'], [1, '#2B3A46']];
const NEAR = [[0, '#BBD893'], [0.5, '#A6CE7B'], [0.62, '#BDB273'], [0.76, '#9A7A5C'], [0.86, '#36443F'], [1, '#253339']];
const GRD = [[0, '#EDE2CB'], [0.6, '#EBDDBF'], [0.74, '#DDC09C'], [0.86, '#3D434B'], [1, '#1D2730']];

const STARS = (() => { const r = rng(42); return Array.from({ length: 22 }, () => [r() * 1040 + 20, 560 + r() * 680, 4 + r() * 6, r() * 6]); })();

function drawWorld(ctx, f, T) {
  const sky = ramp(SKY, T);
  ctx.fillStyle = sky;
  ctx.fillRect(-40, -40, W + 80, H + 80);
  // stars
  const starA = seg(T, 0.85, 0.97);
  if (starA > 0) for (const [x, y, r, ph] of STARS) P.drawStar(ctx, x, y, r, starA * (0.55 + 0.45 * Math.sin(f * 0.18 + ph)));
  // sun on an arc
  if (T > 0.05 && T < 0.86) {
    const th = lerp(-78, 80, (T - 0.06) / 0.76) * D2R;
    const sx = 540 + 600 * Math.sin(th), sy = 1330 - 690 * Math.cos(th);
    P.drawSun(ctx, sx, sy, 62, f, 1);
  }
  // moon
  const moonA = seg(f, S.S6.start + 20, S.S6.start + 60);
  if (moonA > 0 && f < S.S8.start + 20) P.drawMoon(ctx, 180, lerp(1150, 720, ease.outCubic(moonA)), 52, moonA, sky);
  // clouds
  const cloudA = 1 - seg(T, 0.72, 0.88);
  if (cloudA > 0) {
    P.drawCloud(ctx, 140 + f * 0.18, 712, 0.78, mix('#FFFFFF', sky, 0.15), cloudA);
    P.drawCloud(ctx, 1010 - f * 0.08, 600, 0.55, mix('#FFFFFF', sky, 0.15), cloudA * 0.9);
  }
  // hills
  const hill = (col, y0, amp, k, ph) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-40, GROUND + 10);
    for (let x = -40; x <= W + 40; x += 20) ctx.lineTo(x, y0 + Math.sin(x * k + ph) * amp + Math.sin(x * k * 2.3 + ph * 1.7) * amp * 0.35);
    ctx.lineTo(W + 40, GROUND + 10);
    ctx.closePath();
    ctx.fill();
  };
  hill(ramp(FAR, T), 1318, 34, 0.0062, 1.2);
  hill(ramp(NEAR, T), 1404, 22, 0.009, 2.6);
  // ground
  const g = ramp(GRD, T);
  ctx.fillStyle = g;
  ctx.fillRect(-40, GROUND, W + 80, H - GROUND + 40);
  ctx.strokeStyle = T > 0.8 ? rgba('#0E151A', 0.8) : C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-40, GROUND);
  ctx.lineTo(W + 40, GROUND);
  ctx.stroke();
  // floor texture: short paper dashes
  ctx.strokeStyle = rgba(T > 0.8 ? '#FFFFFF' : C.ink, 0.06);
  ctx.lineWidth = 3;
  const r = rng(9);
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = GROUND + 40 + r() * 380, l = 20 + r() * 60;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + l, y);
    ctx.stroke();
  }
  return sky;
}

function spotlight(ctx, x, y, r, a) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba('#F6E7C8', 0.95 * a));
  g.addColorStop(0.55, rgba('#F1DDB6', 0.6 * a));
  g.addColorStop(1, rgba('#F1DDB6', 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

const SHAKES = [[E.plateCatch, 7], [E.scaleLand, 5], [E.clockLand, 6], [E.topple, 8], [E.butt, 9], [E.phoneSettle, 5], [E.plateDrop, 4], [E.land, 13], [E.clockStop, 7], [E.phoneCatch, 3], [E.iconPop, 4]];
function shake(f) {
  let x = 0, y = 0;
  for (const [k, a] of SHAKES) {
    if (f >= k && f < k + 20) {
      const t = (f - k) / 30;
      x += a * wobble(t, 7, 9);
      y += a * wobble(t + 0.03, 9, 9);
    }
  }
  return [x, y];
}

// ---------------------------------------------------------------- captions
const HEADS = [
  { text: 'Your day moves fast.', hi: ['fast.'], in: 4, out: 110 },
  { text: 'It all piles up.', hi: ['piles', 'up.'], in: TL.narration[1].at[3], out: E.topple + 14, mode: 'drop', stagger: 5 },
  { kicker: 'NUTRIAI', text: 'Keep it all in one place.', hi: ['one', 'place.'], in: E.phoneSettle, out: S.S3.start - 2 },
  { kicker: 'MEALS', text: 'Log every meal.', hi: ['meal.'], in: S.S3.start + 6, out: S.S4.start - 2 },
  { kicker: 'WATER', text: 'Count every glass.', hi: ['glass.'], in: S.S4.start + 6, out: S.S5.start - 2 },
  { kicker: 'WEIGHT', text: 'Note your weight.', hi: ['weight.'], in: S.S5.start + 6, out: S.S6.start - 2 },
  { kicker: 'FASTING · OPTIONAL', text: 'If you fast, track that too.', hi: ['fast,'], in: S.S6.start + 6, out: S.S7.start - 2 },
  { kicker: 'PRIVACY', text: 'Private, on your Android device.', hi: ['Private,'], in: S.S7.start + 4, out: S.S8.start + 2 },
];

// ---------------------------------------------------------------- CTA
function drawCTA(ctx, f, icon) {
  const p = seg(f, E.iconPop, E.iconPop + 16);
  // soft disc behind the icon
  ctx.fillStyle = rgba(C.mint, 0.55);
  ctx.beginPath();
  ctx.arc(540, 640, 250 * ease.outBack(seg(f, E.wipe + 2, E.wipe + 18), 1.4), 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(C.leaf, 0.35);
  ctx.lineWidth = 4;
  ctx.setLineDash([4, 18]);
  ctx.beginPath();
  ctx.arc(540, 640, 300 * ease.outCubic(seg(f, E.wipe + 6, E.wipe + 22)), f * 0.01, f * 0.01 + TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  P.burst(ctx, f, E.iconPop + 4, { x: 540, y: 640, n: 18, seed: 77, kind: 'leaf', a0: -170, a1: -10, v0: 500, v1: 950, g: 1500, size: 15, life: 1.2 });
  if (p > 0) {
    const k = ease.outBack(p, 2.0);
    ctx.save();
    ctx.translate(540, 640);
    ctx.rotate((1 - ease.outCubic(p)) * -0.35);
    ctx.scale(k, k);
    ctx.fillStyle = 'rgba(28,38,32,0.14)';
    ctx.beginPath();
    ctx.roundRect(-150 + 8, -150 + 12, 300, 300, 66);
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.roundRect(-150, -150, 300, 300, 66);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-150, -150, 300, 300, 66);
    ctx.clip();
    ctx.drawImage(icon, -150, -150, 300, 300);
    ctx.restore();
    ctx.restore();
  }
  // wordmark
  ctx.save();
  ctx.font = '900 150px "NutriDisplay"';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const word = 'NutriAI';
  const tw = ctx.measureText(word).width;
  let x = 540 - tw / 2;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const cw = ctx.measureText(ch).width;
    const q = seg(f, E.wordIn + i * 2, E.wordIn + i * 2 + 12);
    if (q > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(q * 2);
      ctx.fillStyle = C.ink;
      text(ctx, ch, x, 935 + (1 - ease.outBack(q, 2.2)) * 70, 'cta');
      ctx.restore();
    }
    x += cw;
  }
  const sp = ease.outCubic(seg(f, E.subIn, E.subIn + 12));
  ctx.globalAlpha = sp;
  ctx.font = '600 50px "NutriText"';
  ctx.fillStyle = C.ink2;
  ctx.textAlign = 'center';
  text(ctx, 'Calorie Tracker', 540, 1010 + (1 - sp) * 24, 'cta');
  ctx.restore();
  // button
  const bp = seg(f, E.buttonIn, E.buttonIn + 14);
  if (bp > 0) {
    const press = f >= E.press ? 1 - 0.07 * Math.sin(clamp((f - E.press) / 8) * Math.PI) : 1;
    const k = ease.outBack(bp, 2.0) * press;
    ctx.save();
    ctx.translate(540, 1150);
    ctx.scale(k, k);
    ctx.fillStyle = 'rgba(28,38,32,0.18)';
    ctx.beginPath();
    ctx.roundRect(-370 + 6, -62 + 9, 740, 124, 62);
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.roundRect(-370, -62, 740, 124, 62);
    ctx.fill();
    ctx.fillStyle = C.lime;
    ctx.beginPath();
    ctx.arc(-370 + 64, 0, 13, 0, TAU);
    ctx.fill();
    ctx.font = '800 50px "NutriText"';
    ctx.fillStyle = C.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    text(ctx, 'Explore on Google Play', 22, 2, 'cta');
    ctx.restore();
    if (f >= E.press && f < E.press + 16) {
      const r = seg(f, E.press, E.press + 16);
      ctx.strokeStyle = rgba(C.leaf, 1 - r);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(540 - 370 - r * 30, 1150 - 62 - r * 30, 740 + r * 60, 124 + r * 60, 62 + r * 30);
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------- main
let ICON = null;
let GRAIN = null;
export function init(icon, grain) {
  ICON = icon;
  GRAIN = grain;
  if (!swayReady) buildSway();
}

export function drawFrame(ctx, f) {
  setFrame(f);
  const T = tod(f);
  const pose = stickPose(f);
  const J = solve(pose);
  const night = seg(T, 0.8, 0.92);
  const [sx, sy] = shake(f);
  ctx.save();
  ctx.translate(sx, sy);
  const sky = drawWorld(ctx, f, T);
  spotlight(ctx, 470, 1290, 560, night * (1 - seg(f, S.S8.start, S.S8.start + 10)));

  // S1 speed streaks (hook energy)
  if (f < 40) {
    const r = rng(3);
    for (let i = 0; i < 6; i++) {
      const y = 640 + r() * 760, len = 200 + r() * 260;
      const x = 1180 - ((f * (60 + r() * 40) + r() * 600) % 1700);
      ctx.strokeStyle = rgba(i % 2 ? C.honey : C.mint, 0.55 * (1 - seg(f, 24, 40)));
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
  }

  const hand = J.aF.end;
  const ph = phoneState(f, f >= E.shrink && f < S.S8.start ? hand : null);

  // ---- props behind the stickman
  // S5 scale
  if (f >= S.S5.start - 2 && f < S.S6.start + 16) {
    let x = lerp(-260, SCALE_X, ease.outBack(seg(f, E.scaleIn, E.scaleStop), 1.3));
    if (f >= S.S6.start) x = lerp(SCALE_X, -300, ease.inBack(seg(f, S.S6.start, S.S6.start + 14)));
    const sq = f >= E.land ? wobble((f - E.land) / 30, 3, 6) * 0.25 : 0;
    const needle = f < E.land ? -100 : -100 + 128 * spring((f - E.land) / 30, 1.5, 3.4);
    P.burst(ctx, f, E.scaleStop - 4, { x: x - 90, y: GROUND - 6, n: 7, seed: 11, kind: 'dust', a0: -170, a1: -120, v0: 120, v1: 260, g: 0, size: 14, life: 0.5 });
    ctx.fillStyle = 'rgba(28,38,32,0.14)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND + 4, 120, 12, 0, 0, TAU);
    ctx.fill();
    P.drawScale(ctx, x, GROUND, 1, { needle, squash: sq });
  }
  // S6 clock
  if (f >= E.clockDrop && f < S.S7.start + 12) {
    const cs = clockState(f);
    if (cs.y > -200) {
      ctx.fillStyle = 'rgba(28,38,32,0.14)';
      ctx.beginPath();
      ctx.ellipse(cs.x, GROUND + 4, 110 * clamp(1 - (CLOCK_Y - cs.y) / 1200, 0.3, 1), 12, 0, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.translate(cs.x, GROUND);
      ctx.scale(1 + cs.sq * 0.5, 1 - cs.sq);
      ctx.translate(-cs.x, -GROUND);
      P.drawClock(ctx, cs.x, cs.y, CLOCK_S, { minA: cs.minA, hourA: 300 + cs.minA / 12, shake: cs.shake, arc: cs.minA / 360, minCol: C.leafDark });
      ctx.restore();
      P.burst(ctx, f, E.clockStop, { x: cs.x, y: GROUND - 6, n: 9, seed: 21, kind: 'dust', a0: -175, a1: -5, v0: 140, v1: 320, g: 0, size: 16, life: 0.5, col: night > 0.5 ? '#4A5560' : '#E3D6BC' });
    }
  }

  // ---- phone (behind the stickman while it stands on the stage)
  const phoneBehind = ph && f < E.shrink + 6;
  if (phoneBehind) {
    drawPhone(ctx, ph, ICON);
  }
  if (ph && f < S.S7.start + 4) {
    ctx.save();
    ctx.globalAlpha = (1 - seg(f, S.S7.start - 6, S.S7.start + 4)) * seg(f, E.phoneSettle, E.phoneSettle + 10);
    ctx.font = '600 23px "NutriText"';
    ctx.fillStyle = night > 0.5 ? rgba(C.cream, 0.75) : rgba(C.ink2, 0.9);
    ctx.textAlign = 'center';
    text(ctx, 'Stylized illustration', PH0.x, GROUND + 44, 'footnote');
    ctx.restore();
  }

  // ---- S1 tower + callouts (drawn after the stickman so the plate sits on the hands)
  const drawTower = () => {
    if (f >= S.S2.start + 70) return;
    const PB = pose._PB || stickS1(f < E.plateCatch ? E.plateCatch : E.topple - 1)._PB;
    const th = f < E.topple ? towerTheta(f) : towerTheta(E.topple - 1);
    const slots = towerSlots(PB, th);
    TOWER.forEach((o, i) => {
      const [fs, fl] = o.fall;
      if (f < fs) return;
      let pos, r, s = slots[i].s, alpha = 1;
      if (f < fl) {
        const t = seg(f, fs, fl);
        pos = [lerp(o.x0, slots[i].p[0], ease.outQuad(t)), lerp(o.y0, slots[i].p[1], ease.inQuad(t))];
        r = lerp(i % 2 ? 40 : -50, slots[i].r, t);
        if (t < 0.95) P.speedLines(ctx, pos[0], pos[1] - 40 * s, 0, 1, 3, 0.35 * (1 - t));
      } else if (f < E.topple + i * 2) {
        pos = slots[i].p;
        r = slots[i].r;
      } else {
        // fly into the rising phone
        const rel = E.topple + i * 2;
        const t = seg(f, rel, CATCH[i]);
        if (t >= 1 || !ph) return;
        const start = towerSlots(PB, towerTheta(E.topple - 1) + 10)[i].p;
        const tgt = toWorld(ph, anchor('card', i));
        pos = arc(start, tgt, 220 + i * 70, ease.inOutQuad(t));
        r = slots[i].r + (i % 2 ? -1 : 1) * 300 * t;
        s = lerp(slots[i].s, slots[i].s * 0.5, ease.inQuad(t));
        alpha = 1 - seg(t, 0.82, 1);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      if (o.k === 'plate') P.drawPlate(ctx, pos[0], pos[1], s, r, 'breakfast', { f });
      if (o.k === 'glass') P.drawGlass(ctx, pos[0], pos[1], s, r, 0.72, { slosh: f > E.glassLand ? 3 * Math.exp(-(f - E.glassLand) / 20) : 0, f });
      if (o.k === 'scale') P.drawScale(ctx, pos[0], pos[1], s, { needle: -100 });
      if (o.k === 'clock') {
        const ringing = f >= E.clockLand && f < E.topple + 4 ? Math.sin(f * 2.6) * 0.5 : 0;
        P.drawClock(ctx, pos[0], pos[1], s, { rot: r, shake: ringing, minA: 50, hourA: 220 });
      }
      ctx.restore();
      // callout labels (editorial annotation), appear when the narrator names them
      const la = seg(f, o.say, o.say + 6) * (1 - seg(f, E.topple, E.topple + 6));
      if (la > 0 && f < E.topple + 6) {
        const ly = 1000 - i * 92;
        const lx = 70 + (1 - ease.outBack(la)) * -60;
        ctx.save();
        ctx.globalAlpha = clamp(la * 1.5) * (1 - seg(f, E.topple, E.topple + 6));
        const target = [pos[0] - 70 * s, pos[1] - (i === 0 ? 0 : i === 1 ? 50 : i === 2 ? 16 : 0)];
        const pl = pill(ctx, lx, ly, o.label, { dot: [C.honey, C.water, C.coral, C.lime][i] });
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3;
        ctx.setLineDash([2, 7]);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pl.left + pl.w + 6, ly);
        ctx.lineTo(target[0], target[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.arc(target[0], target[1], 6, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });
    // ringing marks + sweat
    if (f >= E.scaleLand && f < E.topple) {
      const hd = J.head;
      ctx.save();
      for (let k = 0; k < 2; k++) {
        const t = ((f - E.scaleLand) * 0.06 + k * 0.5) % 1;
        ctx.globalAlpha = Math.sin(t * Math.PI);
        P.drawDrop(ctx, hd[0] - 58 - k * 6, hd[1] - 30 + t * 50, 0.55, '#7CC8EE');
      }
      ctx.restore();
    }
    if (f >= E.plateCatch && f < E.plateCatch + 12) {
      P.burst(ctx, f, E.plateCatch, { x: PB[0], y: PB[1] - 10, n: 8, seed: 5, kind: 'spark', a0: -170, a1: -10, v0: 300, v1: 520, g: 600, size: 12, life: 0.4, col: C.honey });
    }
  };

  // ---- S3 table & food
  const tableX = f < S.S4.start ? lerp(-280, TABLE_X, ease.outBack(seg(f, E.tableIn, E.tableStop), 1.2)) : lerp(TABLE_X, -320, ease.inBack(seg(f, E.tableOut, E.tableOut + 14), 1.4));
  const tableOn = f >= S.S3.start && f < S.S4.start + 16;
  const food = f < E.spinL + 5 ? 'breakfast' : f < E.spinD + 4 ? 'lunch' : 'dinner';
  const spinX = (k) => (f >= k && f < k + 10 ? Math.cos(seg(f, k, k + 10) * TAU) : 1);
  const plateFall = seg(f, E.plateDrop - 8, E.plateDrop);
  const platePos = () => {
    const [px, py] = plateOnTable();
    const dx = tableX - TABLE_X;
    return [px + dx, lerp(py - 520, py, ease.inQuad(plateFall))];
  };
  const toastHeld = f >= E.plateDrop + 4 && f < E.flickB - 4;
  const drawTableFront = () => {
    if (!tableOn) return;
    P.drawTable(ctx, tableX, TABLE_TOP, 300, GROUND - TABLE_TOP);
    if (f >= E.plateDrop - 8) {
      const [px, py] = platePos();
      const sx = Math.min(spinX(E.spinL), 1) * Math.min(spinX(E.spinD), 1);
      const fd = sx < 0 ? 'empty' : food;
      P.drawPlate(ctx, px, py, 0.8, 0, fd, { f, spinX: Math.abs(sx) < 0.08 ? 0.08 : Math.abs(sx), noToast: toastHeld, toastBites: f >= E.chomp ? 1 : 0 });
      P.burst(ctx, f, E.plateDrop, { x: px, y: py, n: 8, seed: 31, kind: 'dust', a0: -170, a1: -10, v0: 120, v1: 260, g: 0, size: 12, life: 0.45 });
    }
  };

  // ---- draw stickman
  const sway = swayReady ? SWAY[Math.min(f, TL.frames - 1)] : 0;
  const ground = f >= S.S8.start ? 1612 : GROUND;
  if (f < S.S8.start + 2) {
    contactShadow(ctx, J, GROUND, night > 0.5 ? 0.3 : 0.16);
    drawStick(ctx, J, {
      sway,
      beforeFrontArm: (c, JJ) => {
        // S7: the phone is held in front of the chest but under the front arm
        if (ph && !phoneBehind) drawPhone(c, ph, ICON);
      },
    });
  }
  drawTableFront();
  // held items
  if (toastHeld) {
    const bites = f >= E.chomp ? 1 : 0;
    P.drawToast(ctx, hand[0] + 6, hand[1] - 14, 0.85, -20, bites);
    P.burst(ctx, f, E.chomp, { x: J.head[0] + 40, y: J.head[1] + 22, n: 12, seed: 8, kind: 'crumb', a0: -160, a1: 20, v0: 180, v1: 420, g: 1500, size: 9, life: 0.6 });
  }
  // S4 glass: falls, is caught, drunk, then held in the back hand
  if (f >= S.S4.start && f < S.S5.start + 8) {
    const fallStart = E.glassCatch - 16;
    let gx, gy, gr = 0, lvl;
    lvl = f < E.gulp1 ? 0.8 : f < E.gulp2 ? lerp(0.8, 0.46, seg(f, E.gulp1 - 2, E.gulp1 + 4)) : lerp(0.46, 0.12, seg(f, E.gulp2 - 2, E.gulp2 + 4));
    if (f < E.glassCatch) {
      const t = seg(f, fallStart, E.glassCatch);
      gx = 400;
      gy = lerp(-160, hand[1] + 36, ease.inQuad(t));
      gr = lerp(-30, 0, t);
      if (f >= fallStart) P.speedLines(ctx, gx, gy - 60, 0, 1, 3, 0.35);
    } else if (f < E.ahh + 6) {
      gx = hand[0] + 4;
      gy = hand[1] + 40;
      const drinking = seg(f, E.gulp1 - 8, E.gulp1 - 4) * (1 - seg(f, E.ahh - 4, E.ahh));
      gr = -62 * ease.inOutQuad(drinking);
      const a = gr * D2R;
      gx = hand[0] - 43 * Math.sin(a);
      gy = hand[1] + 43 * Math.cos(a);
    } else {
      const bh = J.aB.end;
      gx = bh[0];
      gy = bh[1] + 40;
    }
    if (f >= fallStart) P.drawGlass(ctx, gx, gy, 0.78, gr, lvl, { slosh: 2, f });
    for (const k of TAPS) {
      const tgt = toWorld(PH0, anchor('glass', TAPS.indexOf(k)));
      P.burst(ctx, f, k, { x: hand[0] + 4, y: hand[1], n: 7, seed: 50 + k, kind: 'drop', a0: -150, a1: -30, v0: 160, v1: 340, g: 1300, size: 10, life: 0.4 });
      // droplet hop from the fingertip into the glass icon
      const t = seg(f, k, k + 8);
      if (t > 0 && t < 1) {
        const p = arc([hand[0], hand[1]], tgt, 60, ease.inOutQuad(t));
        P.drawDrop(ctx, p[0], p[1], 0.55 * (1 - 0.3 * t));
      }
    }
  }
  // S5: reading dot flies from the dial to the chart
  if (f >= E.dotFly && f < E.dotPop) {
    const t = ease.inOutCubic(seg(f, E.dotFly, E.dotPop));
    const from = [SCALE_X, GROUND - 24];
    const to = toWorld(PH0, anchor('weightDot'));
    const pp = arc(from, to, 260, t);
    ctx.fillStyle = rgba(C.leaf, 0.25);
    for (let k = 1; k <= 4; k++) {
      const q = arc(from, to, 260, Math.max(0, t - k * 0.05));
      ctx.beginPath();
      ctx.arc(q[0], q[1], 12 - k * 2, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = C.leaf;
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pp[0], pp[1], 15, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  if (f >= E.land && f < E.land + 20) {
    P.burst(ctx, f, E.land, { x: SCALE_X - 110, y: GROUND - 8, n: 6, seed: 61, kind: 'dust', a0: -175, a1: -150, v0: 160, v1: 300, g: 0, size: 16, life: 0.55 });
    P.burst(ctx, f, E.land, { x: SCALE_X + 110, y: GROUND - 8, n: 6, seed: 62, kind: 'dust', a0: -30, a1: -5, v0: 160, v1: 300, g: 0, size: 16, life: 0.55 });
  }
  // S3: meal chips fly from plate to the phone rows
  [[E.flickB, E.tickB, 'Breakfast'], [E.flickL, E.tickL, 'Lunch'], [E.flickD, E.tickD, 'Dinner']].forEach(([a, b, label], i) => {
    if (f < a || f >= b) return;
    const t = seg(f, a, b);
    const [px, py] = platePos();
    const tgt = toWorld(PH0, anchor('mealRow', i));
    const p = arc([px, py - 40], [tgt[0] - 120, tgt[1]], 170, ease.inOutCubic(t));
    P.drawChip(ctx, p[0], p[1], lerp(0.9, 0.62, t), Math.sin(t * Math.PI) * -14, label, 'fork');
  });
  if (f >= E.tickD && f < E.tickD + 24) {
    const ring = toWorld(PH0, anchor('ring'));
    P.burst(ctx, f, E.tickD, { x: ring[0], y: ring[1], n: 12, seed: 71, kind: 'spark', a0: -180, a1: 0, v0: 260, v1: 520, g: 300, size: 13, life: 0.6 });
  }
  // S6 chime sparkle + fasting ring sparkle
  if (f >= E.chime && f < E.chime + 24) {
    const fr = toWorld(PH0, anchor('fastRing'));
    P.burst(ctx, f, E.chime, { x: fr[0], y: fr[1], n: 12, seed: 72, kind: 'spark', a0: -180, a1: 0, v0: 260, v1: 520, g: 300, size: 13, life: 0.6, col: '#F7EED6' });
  }
  // S7 padlock
  if (f >= E.lockPop - 2 && f < S.S8.start + 18) {
    const p = ease.outBack(seg(f, E.lockPop, E.lockPop + 12), 2.2);
    const closed = ease.outBack(seg(f, E.lockClick - 4, E.lockClick), 3);
    const glow = bump(f, E.lockClick + 4, 10);
    P.drawPadlock(ctx, 690, 1010 + Math.sin(f * 0.12) * 6, 1.25 * p, closed, glow);
    if (f >= E.lockClick) P.burst(ctx, f, E.lockClick, { x: 690, y: 970, n: 12, seed: 81, kind: 'spark', a0: -180, a1: 0, v0: 240, v1: 480, g: 200, size: 12, life: 0.6, col: C.lime });
  }

  drawTower();
  ctx.restore();

  // ---- captions (not shaken)
  const dark = lum(sky) < 0.42;
  const theme = dark ? { ink: C.cream, marker: '#3C7A2A', kicker: C.lime } : { ink: C.ink, marker: C.mint, kicker: C.leafDark };
  for (const h of HEADS) headline(ctx, f, h, theme);

  // ---- S8 wipe + end card
  if (f >= E.wipe) {
    const r = ease.inOutCubic(seg(f, E.wipe, E.wipe + 16)) * 2300;
    ctx.fillStyle = C.paper;
    ctx.beginPath();
    ctx.arc(690, 1010, r, 0, TAU);
    ctx.fill();
    if (f >= E.wipe + 2) {
      drawCTA(ctx, f, ICON);
      const J8 = solve(stickPose(f));
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(380, 1612);
      ctx.lineTo(700, 1612);
      ctx.stroke();
      contactShadow(ctx, J8, 1612, 0.16);
      drawStick(ctx, J8, { sway: SWAY[Math.min(f, TL.frames - 1)] });
    }
  }

  // ---- grain + vignette
  if (GRAIN) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    const g = GRAIN[f % GRAIN.length];
    ctx.drawImage(g, 0, 0, W, H);
    ctx.restore();
  }
  const vg = ctx.createRadialGradient(540, 960, 600, 540, 960, 1250);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(28,38,32,0.16)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}
