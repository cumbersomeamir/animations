// Choreography for "Can you beat this fifth-grade science question?" — time t -> full scene state.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp, lerp, wobble } from './anim.js';
import * as PH from './physics.js';
import { TABLE_Y } from './set.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const KR = [0, TABLE_Y + 0.3, -0.47];
const BALL_HOLD = [-0.31, 0.8, -0.03];
const SHIP_HOLD = [0.31, 0.84, 0.0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const beat = 60 / tl.bpm;
  const onBeat = t => { const ph = (t / beat) % 1; return Math.exp(-ph * 9); };   // 1 on each beat, decays

  // ---------------- ball (left chamber)
  function ball(t) {
    const yHit = PH.TANK.level0 + PH.BALL_R, yFloor = PH.TANK.floor + PH.BALL_R;
    let y;
    if (t < C.drop) y = BALL_HOLD[1] + key(t, [[0, 0], [0.32, 0.03, E.io], [C.drop, 0.03]]);
    else if (t < C.splash) { const x = t - C.drop, g = 2 * (BALL_HOLD[1] + 0.03 - yHit) / (C.splash - C.drop) ** 2; y = BALL_HOLD[1] + 0.03 - 0.5 * g * x * x; }
    else if (t < C.ballFloor) y = lerp(yHit, yFloor, seg(t, C.splash, C.ballFloor, E.out));
    else { const x = t - C.ballFloor; y = yFloor + 0.012 * Math.abs(Math.sin(2 * Math.PI * 3.4 * x)) * Math.exp(-10 * x); }
    return [BALL_HOLD[0], y, BALL_HOLD[2]];
  }

  // ---------------- ship (right chamber): lower, float, flood, founder, sink, replay
  const touchY = PH.TANK.level0 + PH.HULL.D / 2;
  function floodState(t) {
    // inside water rises after the plug is pulled; the chamber level stays put while afloat (water only moves inside)
    if (t < C.plugPull + 0.05) return { w: 0, y: null, level: PH.LEVEL_SHIP, phase: 'float' };
    if (t < C.founder) {
      const w = PH.W_MAX * seg(t, C.plugPull + 0.05, C.founder, E.out);
      return { w, y: PH.shipYWithInsideWater(w), level: PH.LEVEL_SHIP, phase: 'filling' };
    }
    const y0 = PH.shipYWithInsideWater(PH.W_MAX);
    const u = seg(t, C.founder, C.sunk, E.in);
    const x = t - C.sunk;
    const bounce = t > C.sunk ? 0.01 * Math.abs(Math.sin(2 * Math.PI * 3 * x)) * Math.exp(-9 * x) : 0;
    return {
      w: PH.W_MAX, y: lerp(y0, PH.SUNK_Y, u) + bounce,
      level: lerp(PH.LEVEL_SHIP, PH.LEVEL_SUNK, seg(t, C.founder, C.sunk - 0.1, E.io)), phase: t < C.sunk ? 'sinking' : 'sunk',
      tilt: 0.09 * Math.sin(Math.PI * u),
    };
  }
  function ship(t) {
    let y, level, phase = 'held', w = 0, tilt = 0;
    if (t < C.shipLower) { y = SHIP_HOLD[1] + 0.012 * Math.sin(t * 5); level = PH.TANK.level0; }
    else if (t < C.shipTouch) { y = lerp(SHIP_HOLD[1], touchY, seg(t, C.shipLower, C.shipTouch, E.io)); level = PH.TANK.level0; }
    else if (t < C.plugPull + 0.05 || (t >= C.replayEnd)) {
      const x = t - C.shipTouch, wv = 2 * Math.PI * 1.3, z = 0.25;
      y = PH.SHIP_REST_Y + (touchY - PH.SHIP_REST_Y) * Math.exp(-z * wv * x) * Math.cos(wv * Math.sqrt(1 - z * z) * x);
      if (t >= C.replayEnd) y = PH.SHIP_REST_Y + wobble(t, C.replayEnd, 0.008, 1.3, 2.5) + 0.002 * Math.sin(t * 2.4);
      else y += 0.0015 * Math.sin(t * 2.4);
      level = PH.shipLevelEmpty(y); phase = 'float';
    } else if (t < C.replay) {
      const f = floodState(t); y = f.y; level = f.level; phase = f.phase; w = f.w; tilt = f.tilt || 0;
    } else {
      // instant replay: run the flood backwards (sunk -> refloats empty)
      const u = seg(t, C.replay, C.replayEnd, E.io);
      const tb = Math.max(C.plugPull + 0.0501, lerp(C.sunk + 0.1, C.plugPull + 0.05, u));
      const f = floodState(tb); y = f.y; level = f.level; phase = 'replay'; w = f.w; tilt = f.tilt || 0;
    }
    return { pos: [SHIP_HOLD[0], y, SHIP_HOLD[2]], level, phase, w, tilt };
  }

  // ---------------- camera: locked frontal home frame with beat-locked push-ins (safe-area preserving)
  const BASE = { pos: [0, 0.98, 5.35], target: [0, 0.745, 0] };
  function camera(t) {
    const zoom = key(t, [[0, 0.06], [0.5, 0, E.out3], [8.5, 0], [8.6, 0.012, E.out], [9.2, 0, E.io],
      [18.5, 0], [19.0, 0.05, E.io3], [21.4, 0.05], [21.55, 0, E.out3], [26.5, 0], [26.7, 0.03, E.out], [27.5, 0, E.io],
      [29.0, 0], [30.0, -0.025, E.io]]);
    const shiftX = key(t, [[0, 0], [18.5, 0], [19.0, 0.06, E.io3], [21.4, 0.06], [21.55, 0, E.out3], [30, 0]]);
    const d = BASE.pos[2] * (1 - zoom);
    return { pos: [BASE.pos[0] + shiftX, BASE.pos[1], d], target: [BASE.target[0] + shiftX, BASE.target[1], 0], fov: 30 };
  }

  // ---------------- Kip (silent performer; the narrator is the off-screen host)
  const blinks = [1.3, 3.9, 6.1, 7.6, 9.9, 12.2, 14.6, 17.2, 19.6, 22.2, 24.4, 27.0, 28.9];
  function kip(t, b, s) {
    const p = {};
    const idle = (t > C.fuseStart && t < C.answer) ? 0.03 * onBeat(t) : 0.012 * onBeat(t);
    const hop = 0.06 * pulse(t, C.stampShip - 0.05, C.stampShip + 0.3) + 0.012 * pulse(t, C.answer, C.answer + 0.35)
      + 0.035 * pulse(t, C.thumbs, C.thumbs + 0.34);   // small hops keep the helmet below the UI row (y >= 612)
    p.root = [KR[0], KR[1] + hop, KR[2]];
    p.yaw = key(t, [[0, 0], [C.drop, -0.15], [C.shipLower, 0.2], [C.stampShip, 0.1], [C.sameTags, 0], [C.markers, 0.12],
      [C.push, 0], [C.fill, 0.25], [C.sunk, 0.2], [C.weights, -0.1], [C.notLighter, 0.1], [C.shape, 0], [30, 0]]);
    p.lean = key(t, [[0, 0.05], [C.shipLower, 0.08], [C.shipTouch, 0.22], [C.stampShip, 0.05], [C.guess, 0.0], [C.answer, 0.05],
      [C.fill, 0.05], [C.plugPull - 0.1, 0.28], [C.plugPull + 0.4, 0.05], [C.founder, 0.12], [C.sunk, 0.2], [C.weights, 0.1], [30, 0.04]]);
    p.sway = key(t, [[0, 0], [C.shrug, 0], [C.shrug + 0.3, 0.07], [C.guess, 0], [C.fuseStart, -0.04], [C.answer, 0.03],
      [C.balanced - 0.3, 0.1], [C.balanced, 0], [C.thumbs, 0], [C.thumbs + 0.3, -0.07], [30, 0.03]]);
    let sq = 1 - idle - 0.07 * pulse(t, C.splash, C.splash + 0.2) - 0.05 * pulse(t, C.sunk, C.sunk + 0.2);
    sq += -0.07 * pulse(t, C.answer - 0.12, C.answer + 0.02) + 0.06 * pulse(t, C.answer + 0.02, C.answer + 0.35);
    sq += -0.07 * pulse(t, C.thumbs - 0.12, C.thumbs + 0.02) + 0.05 * pulse(t, C.thumbs + 0.02, C.thumbs + 0.34);
    p.squash = sq;
    p.headYaw = key(t, [[0, -0.2], [C.splash, -0.35], [C.shipLower, 0.35], [C.stampShip + 0.3, 0.15], [C.sameTags, 0],
      [C.shrug + 0.2, 0], [C.fuseStart, -0.15], [C.answer, 0], [C.ghost, 0.35], [C.markers + 1, 0.1], [C.push, 0],
      [C.shipWeight, 0.25], [C.fill, 0.3], [C.sunk, 0.25], [C.weights + 0.2, -0.35], [C.notLighter - 0.1, 0.35],
      [C.notLighter + 0.1, -0.2], [C.notLighter + 0.3, 0.2], [C.notLighter + 0.5, -0.15], [C.notLighter + 0.7, 0], [30, 0.05]]);
    p.headPitch = key(t, [[0, 0.12], [C.splash + 0.2, 0.28], [C.shipTouch, 0.25], [C.stampShip, 0], [C.guess, -0.05],
      [C.fuseStart, -0.12], [C.answer, 0], [C.markers, 0.2], [C.push, 0.12], [C.fill, 0.25], [C.sunk + 0.2, 0.25], [C.weights, 0.15],
      [C.shape, 0], [C.replayEnd, 0.1], [C.thumbs, -0.05], [30, -0.05]]);
    p.headRoll = key(t, [[0, 0], [C.shrug, 0], [C.shrug + 0.3, 0.18], [C.guess, 0], [C.fuseStart + 0.2, -0.15], [C.answer, 0],
      [C.thumbs, 0], [C.thumbs + 0.3, 0.12], [30, 0.08]]);
    p.look = key(t, [[0, [-0.6, -0.4]], [C.splash, [-0.7, -0.9]], [C.shipLower, [0.7, -0.7]], [C.stampShip, [0.4, 0.1]],
      [C.sameTags, [0, -0.3]], [C.shrug, [0, 0.2]], [C.guess, [0, 0]], [C.fuseStart + 0.1, [-0.6, 0.8]], [C.answer - 0.1, [-0.6, 0.8]],
      [C.answer, [0, 0]], [C.ghost, [0.7, -0.6]], [C.markers + 0.5, [0.8, -0.4]], [C.push, [0.2, -0.6]], [C.shipWeight, [0.7, -0.6]],
      [C.fill, [0.7, -0.9]], [C.founder, [0.6, -0.8]], [C.sunk, [0.6, -1]], [C.weights, [-0.7, -0.7]], [C.notLighter - 0.1, [0.7, -0.7]],
      [C.shape, [0, 0]], [C.replay, [0.5, 0.4]], [C.replayEnd, [0.6, -0.6]], [C.thumbs, [0, 0]], [30, [0, 0.05]]]);
    let bl = 0; for (const x of blinks) bl = Math.max(bl, pulse(t, x, x + 0.14)); p.blink = bl;
    const surprise = Math.max(pulse(t, C.splash, C.splash + 0.5), pulse(t, C.founder + 0.1, C.sunk + 0.5));
    p.browRaiseL = key(t, [[0, 0.3], [C.stampShip, 0.9], [C.sameTags, 0.3], [C.shrug, 1], [C.guess, 0.6], [C.fuseStart, 0.2],
      [C.answer, 1], [C.ghost, 0.5], [C.push, 0.4], [C.balanced, 0.9], [C.fill, 0.2], [C.weights, 0.4], [C.shape, 0.6], [C.thumbs, 1], [30, 0.8]]) + 0.5 * surprise;
    p.browRaiseR = key(t, [[0, 0.3], [C.stampShip, 0.9], [C.sameTags, 0.3], [C.shrug, 1], [C.guess, 0.6], [C.fuseStart, 0.9],
      [C.answer, 1], [C.ghost, 0.5], [C.push, 0.4], [C.balanced, 0.9], [C.fill, 0.2], [C.weights, 0.4], [C.shape, 0.6], [C.thumbs, 1], [30, 0.8]]) + 0.5 * surprise;
    p.browAngle = key(t, [[0, 0.1], [C.fuseStart, 0.35], [C.answer, 0], [C.fill, -0.4], [C.plugPull + 0.4, -0.2], [C.founder, 0.6], [C.weights, 0.2], [C.shape, 0], [30, 0]]);
    p.smile = key(t, [[0, 0.5], [C.splash, 0.1], [C.stampShip, 1], [C.sameTags, 0.4], [C.shrug, -0.1], [C.guess, 0.7], [C.fuseStart, 0.1],
      [C.answer, 1], [C.ghost, 0.7], [C.balanced, 1], [C.fill, 0.6], [C.founder, -0.3], [C.weights, 0.2], [C.shape, 0.7], [C.thumbs, 1], [30, 1]]) * (1 - surprise);
    p.mouthOpen = clamp(0.5 * surprise + 0.35 * pulse(t, C.answer, C.answer + 0.6) + 0.3 * pulse(t, C.thumbs, C.thumbs + 0.8));
    p.mouthRound = clamp(surprise * 1.4);

    // hands (world targets or Kip-local functions)
    const K = (x, y, z) => k => k.local(x, y, z);
    const Bp = (x, y, z) => k => k.bodyPoint(x, y, z);
    const ballHand = [b[0] + 0.0, b[1] + PH.BALL_R + 0.045, b[2]];
    const sp = s.pos;
    const shipRim = [sp[0] - 0.02, sp[1] + PH.HULL.D / 2 + 0.035, sp[2] - PH.HULL.b + 0.03];
    const plugLocal = [-0.1, -PH.HULL.D / 2 + PH.HULL.t + 0.03, 0];
    const plugIn = [sp[0] + plugLocal[0], sp[1] + plugLocal[1] + 0.04, sp[2]];
    const plugUp = [0.16, 0.9, -0.08];
    const rimL = [-0.45, 0.66, -0.2], rimR = [0.45, 0.66, -0.2];
    const twirl = k => { const c = k.local(0.24, 0.62, 0.16), a = 2 * Math.PI * 2.4 * (t - C.replay); return c.add(V(0.035 * Math.cos(a), 0.035 * Math.sin(a), 0)); };
    const lift = (side, base) => k => k.local(0.3 * side, base + 0.18 * pulse(t, C.push + 0.05, C.push + 0.55) + 0.18 * pulse(t, C.push + 0.55, C.push + 1.05), 0.16);
    const L = [
      [0, ballHand], [C.drop, ballHand], [C.drop + 0.15, [-0.31, 0.92, -0.03], E.out3], [C.splash + 0.2, K(-0.28, 0.42, 0.1)],
      [C.shipLower, rimL], [C.stampShip, rimL], [C.sameTags + 0.2, [-0.33, 0.76, -0.02]], [C.shrug, [-0.33, 0.76, -0.02]],
      [C.shrug + 0.3, K(-0.38, 0.62, 0.12), E.back], [C.guess, K(-0.3, 0.3, 0.1)], [C.fuseStart, K(-0.28, 0.24, 0.08)],
      [C.answer - 0.05, K(-0.28, 0.24, 0.08)], [C.answer + 0.2, K(-0.36, 0.7, 0.1), E.out3], [C.answer + 0.7, rimL],
      [C.weightTags - 0.2, rimL], [C.weightTags + 0.2, K(-0.3, 0.42, 0.22)], [C.push, K(-0.3, 0.42, 0.18)], [C.push + 0.05, lift(-1, 0.36)],
      [C.push + 1.1, lift(-1, 0.36)], [C.shipWeight, K(-0.38, 0.52, 0.12)], [C.shipWeight + 0.25, K(-0.4, 0.36, 0.12)],
      [C.balanced, K(-0.4, 0.46, 0.12)], [C.fill, rimL], [C.founder, rimL], [C.founder + 0.4, Bp(-0.13, 0.36, 0.2), E.out3],
      [C.sunk + 0.4, Bp(-0.13, 0.36, 0.2)], [C.weights + 0.1, [-0.31, 0.7, 0.0]], [C.notLighter - 0.2, [-0.31, 0.7, 0.0]],
      [C.notLighter, rimL], [C.shape, K(-0.12, 0.45, 0.3)], [C.shape + 0.7, K(-0.34, 0.62, 0.22)], [C.replay - 0.1, rimL],
      [C.thumbs, rimL], [30, rimL],
    ];
    const R = [
      [0, shipRim], [C.shipTouch, shipRim], [C.shipTouch + 0.35, K(0.3, 0.55, 0.12), E.out3], [C.stampShip, rimR],
      [C.sameTags + 0.2, [0.33, 0.78, -0.02]], [C.shrug, [0.33, 0.78, -0.02]], [C.shrug + 0.3, K(0.38, 0.62, 0.12), E.back],
      [C.guess - 0.05, K(0.38, 0.62, 0.12)], [C.guess + 0.25, K(0.16, 0.5, 0.42), E.out3], [C.fuseStart - 0.1, K(0.16, 0.5, 0.42)],
      [C.fuseStart + 0.2, Bp(0.04, 0.27, 0.235)], [C.answer - 0.05, Bp(0.04, 0.27, 0.235)], [C.answer + 0.2, K(0.36, 0.7, 0.1), E.out3],
      [C.ghost - 0.2, rimR], [C.ghost + 0.2, [0.3, 0.76, 0.02], E.out3], [C.weightTags - 0.2, [0.3, 0.76, 0.02]],
      [C.weightTags + 0.2, K(0.3, 0.42, 0.22)], [C.push, K(0.3, 0.42, 0.18)], [C.push + 0.05, lift(1, 0.36)], [C.push + 1.1, lift(1, 0.36)],
      [C.shipWeight, K(0.38, 0.4, 0.12)], [C.shipWeight + 0.25, K(0.4, 0.56, 0.12)], [C.balanced, K(0.4, 0.46, 0.12)],
      [C.floatsTick, K(0.3, 0.5, 0.2)], [C.fill, rimR], [C.plugPull - 0.15, plugIn, E.io], [C.plugPull + 0.05, plugIn],
      [C.plugPull + 0.45, plugUp, E.out3], [C.founder, plugUp], [C.founder + 0.4, Bp(0.13, 0.36, 0.2), E.out3],
      [C.sunk + 0.4, Bp(0.13, 0.36, 0.2)], [C.notLighter - 0.2, Bp(0.13, 0.36, 0.2)], [C.notLighter + 0.1, [0.31, 0.7, 0.0]],
      [C.shape - 0.1, [0.31, 0.7, 0.0]], [C.shape, K(0.12, 0.45, 0.3)], [C.shape + 0.7, K(0.34, 0.62, 0.22)],
      [C.replay - 0.1, K(0.24, 0.62, 0.16)], [C.replay, twirl], [C.replayEnd - 0.1, twirl], [C.replayEnd + 0.2, rimR],
      [C.thumbs - 0.15, rimR], [C.thumbs + 0.1, K(0.27, 0.52, 0.2), E.back], [30, K(0.27, 0.54, 0.2)],
    ];
    const resolve = tr => k => {
      const f = x => (typeof x === 'function' ? x(k) : V(...x));
      if (t <= tr[0][0]) return f(tr[0][1]);
      for (let i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
        const [t0, a] = tr[i - 1], [t1, bb, e] = tr[i];
        return f(a).lerp(f(bb), (e || E.io)((t - t0) / Math.max(1e-6, t1 - t0)));
      }
      return f(tr[tr.length - 1][1]);
    };
    p.handL = resolve(L); p.handR = resolve(R);
    p.fistR = key(t, [[0, 0], [C.thumbs - 0.1, 0], [C.thumbs + 0.05, 1]]);
    p.thumbUpR = key(t, [[0, 0], [C.floatsTick - 0.1, 0], [C.floatsTick + 0.1, 1, E.back], [C.fill - 0.1, 1], [C.fill + 0.1, 0],
      [C.thumbs - 0.1, 0], [C.thumbs + 0.08, 1, E.back]]);
    p.elbowR = [1, -0.6, 0.2]; p.elbowL = [-1, -0.6, 0.2];
    return p;
  }

  // ---------------- overlay / fx state
  function fx(t, s) {
    const o = {};
    o.ballGhost = win(t, C.ghost, C.push, 0.25, 0.3);
    o.shipGhost = win(t, C.ghost, C.push, 0.35, 0.3);
    o.markers = Math.max(win(t, C.markers, C.fill, 0.3, 0.3), win(t, C.stampSunk, 30.5, 0.3, 0.1));
    o.shipMark = s.phase === 'sunk' || (s.phase === 'replay' && t < C.replay + 0.5) ? '1×' : '≈8×';
    o.sameTags = win(t, C.sameTags, C.guess + 0.1, 0.25, 0.2);
    o.pushArrows = win(t, C.push, C.fill, 0.3, 0.3);
    o.shipWeight = win(t, C.shipWeight, C.fill, 0.3, 0.3);
    o.balanced = win(t, C.balanced, C.fill, 0.15, 0.3);
    o.weights = win(t, C.weights, C.replay, 0.3, 0.25);
    o.weightsEq = win(t, C.notLighter, C.replay, 0.2, 0.25);
    o.fuse = win(t, C.fuseStart - 0.15, C.answer + 0.3, 0.15, 0.25);
    o.fuseU = seg(t, C.fuseStart, C.answer, E.lin);
    o.chips = win(t, C.guess + 0.6, C.ghost - 0.3, 0.2, 0.25);
    o.chipReveal = seg(t, C.answer, C.answer + 0.12);
    o.badge = Math.max(win(t, 0.6, C.guess + 0.6, 0.2, 0.2), win(t, C.ghost - 0.1, 26.4, 0.25, 0.12));
    o.badgeDone = false;
    o.stampBall = t >= C.stampBall && t < C.stampsOut ? seg(t, C.stampBall, C.stampBall + 0.1) : 0;
    o.stampShip = t >= C.stampShip && t < C.stampsOut ? seg(t, C.stampShip, C.stampShip + 0.1) : 0;
    o.stampSunk = t >= C.stampSunk && t < C.weights ? seg(t, C.stampSunk, C.stampSunk + 0.1) : 0;
    o.stampFinalBall = t >= C.stampFinal ? seg(t, C.stampFinal, C.stampFinal + 0.1) : 0;
    o.stampFinalShip = t >= C.stampFinal + 0.25 ? seg(t, C.stampFinal + 0.25, C.stampFinal + 0.35) : 0;
    o.stampsOutU = seg(t, C.stampsOut, C.stampsOut + 0.2, E.in);
    o.replayGlyph = win(t, C.replay, C.replayEnd, 0.1, 0.15);
    o.sig = seg(t, C.end, C.end + 0.35, E.io);
    o.beat = onBeat(t);
    o.shipPush = s.phase === 'float' ? PH.envelopeBelow(s.level - (s.pos[1] - PH.HULL.D / 2)) / PH.DISPLACED_FLOAT : 1;
    return o;
  }

  function frame(t) {
    const b = ball(t), s = ship(t);
    const ballLevel = PH.ballLevel(b[1]);
    return { t, ball: b, ballLevel, ship: s, cam: camera(t), kip: kip(t, b, s), fx: fx(t, s), cues: C, beat };
  }
  return { frame, cues: C };
}
