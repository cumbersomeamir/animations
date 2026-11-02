// Choreography: time t -> complete scene state (camera, Kip pose, steel piece, water, overlays).
import * as THREE from 'three';
import { E, key, seg, wobble, pulse, win, clamp, lerp } from './anim.js';
import {
  TANK, BALL_R, HULL, RHO_STEEL, RISE_BALL, RISE_HULL, HULL_REST_Y,
  levelWithBall, levelWithHull, submergedVolume, DISPLACED_FLOAT,
} from './physics.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const KR = [0.12, 0.62, -0.42];       // Kip stands on the step behind the tank
const HOLD = [0.0, 0.95, -0.03];             // where Kip holds the ball
const G1 = 2 * (1.03 - (TANK.level0 + BALL_R)) / (0.29 * 0.29);

export function makeChoreo(tl) {
  const C = tl.cues;

  // ---------- steel piece (ball -> hull) ----------
  function steel(t) {
    let pos, morph = 0, mode = 'ball', squishPhase = 0;
    const touchY = TANK.level0 + HULL.D / 2;
    if (t < C.drop) {
      const lift = key(t, [[0, 0], [0.38, 0.08, E.io], [C.drop, 0.08]]);
      pos = [HOLD[0], HOLD[1] + lift, HOLD[2]];
    } else if (t < C.splash) {
      const x = t - C.drop; pos = [HOLD[0], 1.03 - 0.5 * G1 * x * x, HOLD[2]];
    } else if (t < C.floor) {
      const y0 = TANK.level0 + BALL_R, y1 = TANK.floor + BALL_R;
      pos = [HOLD[0], lerp(y0, y1, seg(t, C.splash, C.floor, E.out)), HOLD[2]];
    } else if (t < C.rewind) {
      const x = t - C.floor;
      pos = [HOLD[0], TANK.floor + BALL_R + 0.016 * Math.abs(Math.sin(2 * Math.PI * 3.2 * x)) * Math.exp(-9 * x), HOLD[2]];
    } else if (t < C.unpause) {
      pos = [HOLD[0], lerp(TANK.floor + BALL_R, 0.27, seg(t, C.rewind, C.pause, E.io)), HOLD[2]];
    } else if (t < C.rewindSplash) {
      pos = [HOLD[0], lerp(0.27, TANK.level0 + RISE_BALL + BALL_R, seg(t, C.unpause, C.rewindSplash, E.in)), HOLD[2]];
    } else if (t < C.catch) {
      const x = C.catch - t, g2 = 2 * (HOLD[1] - (TANK.level0 + BALL_R)) / ((C.catch - C.rewindSplash) ** 2);
      pos = [HOLD[0], HOLD[1] - 0.5 * g2 * x * x, HOLD[2]];
    } else if (t < C.lowerStart) {
      // in Kip's hands: squish into a hull, then present it
      morph = key(t, [[7.0, 0], [C.squish1 + 0.18, 0.3, E.out3], [C.squish2 + 0.18, 0.62, E.out3], [C.squish3 + 0.18, 0.9, E.out3], [C.morphEnd, 1, E.io]]);
      squishPhase = 3 * pulse(t, 7.0, C.morphEnd);
      const y = key(t, [[C.catch, HOLD[1]], [7.0, HOLD[1] - 0.02], [C.morphEnd, 0.82], [C.present + 0.12, 0.86, E.out3], [C.lowerStart, 0.85]]);
      const z = key(t, [[C.catch, HOLD[2]], [C.morphEnd, 0.0]]);
      pos = [0, y, z];
      if (morph > 0.999) mode = 'hull';
    } else if (t < C.touch) {
      morph = 1; mode = 'hull';
      pos = [0, lerp(0.85, touchY, seg(t, C.lowerStart, C.touch, E.io)), 0];
    } else {
      morph = 1; mode = 'hull';
      const x = t - C.touch, w = 2 * Math.PI * 1.25, z = 0.24;
      let y = HULL_REST_Y + (touchY - HULL_REST_Y) * Math.exp(-z * w * x) * Math.cos(w * Math.sqrt(1 - z * z) * x);
      y += wobble(t, C.flagPlant, -0.006, 1.4, 4);
      pos = [0, y, 0];
    }
    return { pos, morph, mode, squishPhase };
  }

  function waterLevel(st) {
    if (st.mode === 'hull' && st.pos[1] - HULL.D / 2 < TANK.level0 + 0.12) return levelWithHull(st.pos[1]);
    if (st.mode === 'ball') return levelWithBall(st.pos[1]);
    return TANK.level0;
  }

  // ---------- camera ----------
  function camera(t) {
    const pos = key(t, [
      [0, [0.06, 1.36, 4.5]], [3.55, [0.03, 1.3, 4.2], E.io],
      [4.35, [0.1, 0.97, 3.85], E.io3], [6.3, [0.08, 0.96, 3.75], E.lin],
      [7.0, [0.04, 1.34, 4.05], E.io3], [8.75, [0.02, 1.3, 3.95], E.lin],
      [9.6, [0.02, 1.36, 4.45], E.io3], [10.85, [0.06, 1.36, 4.35], E.lin],
      [12.0, [0.58, 1.7, 4.15], E.io3], [15, [0.48, 1.66, 4.0], E.lin],
    ]);
    const target = key(t, [
      [0, [0.0, 0.98, 0]], [3.55, [0.0, 0.96, 0], E.io],
      [4.35, [0.05, 0.8, 0], E.io3], [6.3, [0.05, 0.8, 0], E.lin],
      [7.0, [0.03, 1.04, 0], E.io3], [8.75, [0.02, 1.0, 0], E.lin],
      [9.6, [0.0, 0.9, 0], E.io3], [10.85, [0.0, 0.88, 0], E.lin],
      [12.0, [0.0, 0.98, 0.0], E.io3], [15, [0.0, 0.98, 0.0], E.lin],
    ]);
    // tiny impact shakes
    const sh = 0.006 * (Math.exp(-14 * Math.max(0, t - C.splash)) * (t > C.splash ? Math.sin(70 * (t - C.splash)) : 0)
      + Math.exp(-14 * Math.max(0, t - C.touch)) * (t > C.touch ? Math.sin(60 * (t - C.touch)) : 0));
    pos[1] += sh;
    return { pos, target, fov: 30 };
  }

  // ---------- Kip ----------
  const blinkTimes = [1.62, 3.42, 5.78, 8.62, 10.9, 12.25, 14.35];
  function kip(t, st, mouthAmp) {
    const p = {};
    const hop = t > C.thumbs ? 0.07 * pulse(t, C.thumbs, C.thumbs + 0.34) : 0;
    p.root = [KR[0], KR[1] + hop, KR[2]];
    p.yaw = key(t, [[0, 0], [C.lookShip - 0.1, 0], [C.lookShip + 0.25, -0.5, E.out3], [C.chin - 0.1, -0.45], [C.chin + 0.2, 0, E.io],
      [C.flagGrab, 0], [C.flagGrab + 0.25, -0.25], [C.flagPlant + 0.3, -0.15], [C.thumbs, 0.1], [15, 0.05]]);
    p.lean = key(t, [[0, 0.02], [C.splash, 0.02], [C.splash + 0.3, 0.3, E.out3], [C.lookShip - 0.1, 0.28], [C.lookShip + 0.2, 0.0],
      [C.twirl, 0.0], [C.pause + 0.1, 0.42], [6.05, 0.42], [C.catch, 0.08], [C.morphEnd, 0.1], [C.present + 0.1, 0.0],
      [C.lowerStart, 0.05], [C.touch, 0.36], [9.6, 0.18], [10.3, 0.26], [10.85, 0.24], [11.9, 0.12], [C.flagPlant, 0.3], [C.thumbs, 0.0], [15, 0.0]]);
    p.sway = key(t, [[0, 0], [C.lookShip + 0.2, 0.08], [C.chin + 0.2, -0.06], [C.twirl + 0.3, 0.05], [C.pause + 0.4, 0],
      [C.thumbs, 0], [C.thumbs + 0.3, -0.08], [14.2, 0.04], [15, 0.0]]);
    // squash & stretch: anticipation, startle, squishes, hop
    let sq = 1 + key(t, [[0, 0], [0.3, -0.05], [C.drop, 0.05, E.out], [0.6, 0]]);
    sq += -0.07 * pulse(t, C.splash, C.splash + 0.18) + 0.05 * pulse(t, C.splash + 0.12, C.splash + 0.36);
    for (const s of [C.squish1, C.squish2, C.squish3]) sq -= 0.06 * pulse(t, s, s + 0.26);
    sq += -0.06 * pulse(t, C.catch - 0.02, C.catch + 0.16);
    sq += -0.08 * pulse(t, C.thumbs - 0.12, C.thumbs + 0.04) + 0.06 * pulse(t, C.thumbs + 0.04, C.thumbs + 0.34);
    p.squash = sq;

    p.headYaw = key(t, [[0, 0.1], [C.splash, 0.0], [C.lookShip - 0.1, 0], [C.lookShip + 0.25, -0.75, E.out3], [C.chin - 0.1, -0.7],
      [C.chin + 0.2, 0.0], [C.twirl + 0.4, 0.15], [C.pause + 0.3, -0.12], [6.0, -0.1], [C.catch, 0.0], [C.morphEnd, 0.0],
      [C.present + 0.15, 0.18], [C.touch, 0.0], [10.2, 0.0], [11.0, -0.2], [C.flagPlant, -0.25], [C.thumbs, 0.25], [15, 0.3]]);
    p.headPitch = key(t, [[0, -0.12], [C.drop, -0.1], [C.splash + 0.2, 0.22], [C.lookShip, 0.18], [C.lookShip + 0.3, -0.12],
      [C.chin + 0.2, 0.05], [C.twirl + 0.3, -0.05], [C.pause + 0.3, 0.2], [6.1, 0.2], [C.catch, 0.05], [C.morphEnd, 0.15],
      [C.present + 0.1, -0.05], [C.touch, 0.2], [10.2, 0.12], [10.85, 0.0], [C.flagPlant, 0.18], [C.thumbs, -0.08], [15, -0.06]]);
    p.headRoll = key(t, [[0, 0], [C.chin, 0], [C.chin + 0.3, 0.16], [C.twirl + 0.1, 0.0], [C.balanced, 0], [C.balanced + 0.3, -0.1],
      [11.6, 0.0], [C.thumbs + 0.3, 0.12], [15, 0.1]]);
    p.look = key(t, [[0, [-0.2, 0.9]], [C.drop, [0, 0.6]], [C.splash + 0.15, [0, -1]], [C.lookShip, [0, -0.9]], [C.lookShip + 0.2, [-1, 0.6]],
      [C.chin - 0.1, [-0.9, 0.5]], [C.chin + 0.2, [0.2, 0.1]], [C.twirl + 0.2, [0.7, 0.6]], [C.pause + 0.2, [-0.3, -0.9]],
      [6.0, [-0.2, -0.8]], [6.4, [0, -0.6]], [C.catch, [0, -0.5]], [C.morphEnd, [0, -0.6]], [C.present + 0.1, [0.2, 0.2]],
      [C.touch, [0, -0.9]], [10.3, [0, -0.6]], [10.9, [0, 0.0]], [11.4, [-0.4, -0.6]], [C.flagPlant, [-0.7, -0.6]],
      [C.thumbs - 0.1, [0.1, 0.1]], [15, [0.1, 0.1]]]);
    let blink = 0; for (const b of blinkTimes) blink = Math.max(blink, pulse(t, b, b + 0.14));
    p.blink = blink;
    // expressions
    p.browRaiseL = key(t, [[0, 0.4], [C.splash, 0.4], [C.splash + 0.08, 1.0, E.out], [1.6, 0.5], [C.lookShip + 0.3, 0.6],
      [C.chin + 0.2, -0.4], [C.twirl + 0.1, 0.6], [C.pause + 0.2, 0.3], [6.2, 0.3], [C.catch, 0.5], [7.0, -0.3],
      [C.morphEnd, -0.2], [C.present + 0.1, 0.9], [C.touch, 0.4], [C.balanced, 1.0], [11.2, 0.4], [C.thumbs, 1.0], [15, 0.7]]);
    p.browRaiseR = key(t, [[0, 0.4], [C.splash, 0.4], [C.splash + 0.08, 1.0, E.out], [1.6, 0.5], [C.lookShip + 0.3, 0.6],
      [C.chin + 0.2, 0.9], [C.twirl + 0.1, 0.6], [C.pause + 0.2, 0.3], [6.2, 0.3], [C.catch, 0.5], [7.0, -0.3],
      [C.morphEnd, -0.2], [C.present + 0.1, 0.9], [C.touch, 0.4], [C.balanced, 1.0], [11.2, 0.4], [C.thumbs, 1.0], [15, 0.7]]);
    p.browAngle = key(t, [[0, 0.2], [C.splash + 0.1, 0.5], [1.6, 0.5], [C.chin + 0.2, 0.3], [C.twirl, -0.1], [C.pause + 0.2, 0.2],
      [7.0, -0.6], [C.morphEnd, -0.5], [C.present + 0.1, 0.1], [C.balanced, 0.2], [15, 0.1]]);
    p.smile = key(t, [[0, 0.45], [C.splash, 0.4], [C.splash + 0.1, -0.2], [1.6, -0.1], [C.lookShip + 0.3, 0.1], [C.chin + 0.2, -0.2],
      [C.twirl + 0.2, 0.6], [C.pause + 0.3, 0.2], [6.2, 0.4], [C.catch, 0.5], [7.0, 0.6], [C.morphEnd, 0.6], [C.present + 0.1, 1.0],
      [C.touch, 0.6], [C.balanced, 1.0], [11.4, 0.7], [C.thumbs, 1.0], [15, 1.0]]);
    const oh = 0.55 * pulse(t, C.splash + 0.02, C.splash + 0.35);   // startled "oh!"
    p.mouthOpen = clamp(0.95 * mouthAmp + oh);
    p.mouthRound = clamp(oh * 1.6 + 0.2 * mouthAmp);

    // hands
    const ball = st.pos;
    const kipLocal = (x, y, z) => k => k.local(x, y, z);
    const bodyLocal = (x, y, z) => k => k.bodyPoint(x, y, z);
    const twirlR = k => {
      const c = k.local(0.27, 0.68, 0.16), a = 2 * Math.PI * 2.2 * (t - C.twirl);
      return c.add(V(0.035 * Math.cos(a), 0.035 * Math.sin(a), 0));
    };
    const twirl2R = k => {
      const c = k.local(0.27, 0.66, 0.16), a = 2 * Math.PI * 2.2 * (t - C.twirl2);
      return c.add(V(0.03 * Math.cos(a), 0.03 * Math.sin(a), 0));
    };
    const spread = st.morph > 0 ? lerp(BALL_R, HULL.a, E.out(Math.min(1, st.morph * 1.08))) : BALL_R;
    const press = 0.018 * (pulse(t, C.squish1, C.squish1 + 0.26) + pulse(t, C.squish2, C.squish2 + 0.26) + pulse(t, C.squish3, C.squish3 + 0.26));
    const holdL = [ball[0] - spread - 0.032 + press, ball[1] + 0.01 - press * 0.6, ball[2] + 0.015];
    const holdR = [ball[0] + spread + 0.032 - press, ball[1] + 0.01 - press * 0.6, ball[2] + 0.015];
    const catchL = [HOLD[0] - BALL_R - 0.032, HOLD[1] + 0.01, HOLD[2] + 0.015];
    const catchR = [HOLD[0] + BALL_R + 0.032, HOLD[1] + 0.01, HOLD[2] + 0.015];
    const rimL = [-HULL.a - 0.02, ball[1] + HULL.D / 2 - 0.01, 0.0];
    const rimR = [HULL.a + 0.02, ball[1] + HULL.D / 2 - 0.01, 0.0];
    const shipPoint = k => {
      const sh = k.bodyPoint(-0.178, 0.26, 0);
      return sh.add(V(-0.4, 0.26, -0.12));
    };
    const tankBackL = [-0.14, 0.81, -0.215], tankBackR = [0.38, 0.81, -0.215];
    const flagHold = k => k.local(-0.32, 0.3, -0.12);
    const sternRim = [-HULL.a + 0.06, st.pos[1] + HULL.D / 2 + 0.03, 0.03];

    const L = [], R = [];
    // [time, target, ease]; targets may be arrays or functions
    L.push([0, holdL], [C.drop, holdL], [C.drop + 0.12, kipLocal(-0.3, 0.52, 0.2), E.out3], [C.splash + 0.02, kipLocal(-0.28, 0.5, 0.2)],
      [C.splash + 0.2, bodyLocal(-0.13, 0.36, 0.2), E.out3], [C.splash + 0.5, tankBackL, E.io], [C.lookShip - 0.05, tankBackL],
      [C.lookShip + 0.3, shipPoint, E.out3], [C.chin - 0.05, shipPoint], [C.chin + 0.25, kipLocal(-0.26, 0.22, 0.08)],
      [C.pause, tankBackL], [6.25, tankBackL], [C.catch - 0.12, catchL], [C.catch, holdL, E.lin], [C.lowerStart, holdL],
      [C.lowerStart + 0.12, rimL], [C.touch, rimL], [C.touch + 0.25, kipLocal(-0.3, 0.55, 0.25), E.out3],
      [10.15, kipLocal(-0.3, 0.5, 0.22)], [10.6, tankBackL], [11.85, tankBackL], [C.flagGrab + 0.2, flagHold],
      [C.flagPlant - 0.05, sternRim, E.io], [C.flagPlant + 0.2, sternRim], [C.thumbs, kipLocal(-0.28, 0.24, 0.1)], [15, kipLocal(-0.28, 0.24, 0.1)]);
    R.push([0, holdR], [C.drop, holdR], [C.drop + 0.12, kipLocal(0.3, 0.52, 0.2), E.out3], [C.splash + 0.02, kipLocal(0.28, 0.5, 0.2)],
      [C.splash + 0.2, bodyLocal(0.13, 0.36, 0.2), E.out3], [C.splash + 0.5, tankBackR, E.io], [C.lookShip + 0.3, tankBackR],
      [C.chin - 0.1, tankBackR], [C.chin + 0.2, bodyLocal(0.04, 0.27, 0.235), E.out3], [C.twirl - 0.02, bodyLocal(0.04, 0.27, 0.235)],
      [C.twirl + 0.12, twirlR, E.out3], [C.pause - 0.02, twirlR], [C.pause + 0.25, 'MAG', E.io], [C.twirl2 - 0.1, 'MAG'],
      [C.twirl2 + 0.1, twirl2R, E.io], [C.unpause + 0.1, twirl2R], [C.catch - 0.12, catchR, E.io], [C.catch, holdR, E.lin], [C.lowerStart, holdR],
      [C.lowerStart + 0.12, rimR], [C.touch, rimR], [C.touch + 0.25, kipLocal(0.3, 0.55, 0.25), E.out3],
      [10.15, kipLocal(0.3, 0.5, 0.22)], [10.6, tankBackR], [10.95, tankBackR], [11.4, kipLocal(0.2, 0.42, 0.34), E.io],
      [C.flagPlant - 0.1, kipLocal(0.26, 0.3, 0.16)], [C.thumbs - 0.15, kipLocal(0.26, 0.3, 0.16)],
      [C.thumbs + 0.1, kipLocal(0.27, 0.5, 0.2), E.back], [15, kipLocal(0.27, 0.52, 0.2)]);
    const magPoint = k => { const e = k.eyeWorld(1); return e.add(V(0.0, -0.13, 0.09)); };
    const resolveTrack = (tr) => k => {
      const f = x => (x === 'MAG' ? magPoint(k) : typeof x === 'function' ? x(k) : V(...x));
      if (t <= tr[0][0]) return f(tr[0][1]);
      for (let i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
        const [t0, a] = tr[i - 1], [t1, b, e] = tr[i];
        const u = (e || E.io)((t - t0) / Math.max(1e-6, t1 - t0));
        return f(a).lerp(f(b), u);
      }
      return f(tr[tr.length - 1][1]);
    };
    p.handL = resolveTrack(L);
    p.handR = resolveTrack(R);
    p.fistR = key(t, [[0, 0], [C.thumbs - 0.1, 0], [C.thumbs + 0.05, 1]]);
    p.thumbUpR = key(t, [[0, 0], [C.thumbs - 0.1, 0], [C.thumbs + 0.08, 1, E.back]]);
    p.elbowR = [1, -0.6, 0.2];
    p.elbowL = [-1, -0.6, 0.2];
    return p;
  }

  // ---------- overlays & effects ----------
  function fx(t, st, level) {
    const o = {};
    o.paused = t >= C.pause && t < C.unpause;
    o.pauseAmt = win(t, C.pause, C.unpause, 0.08, 0.1);
    o.rewindAmt = Math.max(win(t, C.twirl + 0.05, C.pause + 0.05, 0.08, 0.1), win(t, C.twirl2 + 0.05, C.catch, 0.08, 0.1));
    o.ballGhost = st.mode === 'ball' ? win(t, C.ghostOut, C.unpause + 0.12, 0.12, 0.15) : 0;
    o.ballGhostSlide = seg(t, C.ghostOut, C.ghostOut + 0.45, E.out3) * (1 - seg(t, C.unpause - 0.05, C.unpause + 0.12, E.in));
    o.ballArrows = win(t, C.arrowsBall, C.unpause + 0.05, 0.25, 0.12);
    o.hullGhost = win(t, C.ghostHull, C.declutter + 0.3, 0.35, 0.3);
    o.hullArrows = win(t, C.arrowsHull, C.declutter + 0.3, 0.3, 0.3);
    o.markBall = t >= C.markBall ? smooth01(t, C.markBall, 0.2) * (1 - 0.0 * seg(t, 14, 15)) : 0;
    o.markHull = t >= C.markHull ? smooth01(t, C.markHull, 0.25) : 0;
    o.gauge = win(t, C.pause, 15.5, 0.25, 0.1) * (1 - 0.55 * seg(t, C.declutter, C.declutter + 0.5));
    o.labelSteel = win(t, C.labelSteel, 15.5, 0.25, 0.1);
    o.labelAir = win(t, C.labelAir, 15.5, 0.25, 0.1);
    o.sig = seg(t, C.sig, C.sig + 0.5, E.io);
    // buoyancy (upward push) relative to weight: weight of displaced water / weight of steel
    if (st.mode === 'ball') o.pushRatio = 1 / RHO_STEEL;
    else o.pushRatio = clamp(submergedVolume(level - (st.pos[1] - HULL.D / 2)) / DISPLACED_FLOAT, 0, 1.6);
    o.balanceGlow = pulse(t, C.balanced - 0.05, C.balanced + 0.5);
    return o;
  }
  const smooth01 = (t, a, d) => clamp((t - a) / d);

  function frame(t, mouthAmp) {
    const st = steel(t);
    const level = waterLevel(st);
    return { t, st, level, cam: camera(t), kip: kip(t, st, mouthAmp), fx: fx(t, st, level) };
  }
  return { frame, cues: C };
}

export { RISE_BALL, RISE_HULL };
