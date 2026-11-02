// Choreography: "Which is heavier: a kilo of steel or feathers?" (question asked in terms of MASS).
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp, lerp } from './anim.js';
import * as PH from './physics.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const KR = [0, 0.12, -0.44];

export function makeChoreo(tl) {
  const C = tl.cues, beat = 60 / tl.bpm;
  const onBeat = t => Math.exp(-((t / beat) % 1) * 9);
  const MT = PH.BAL.maxTilt;

  // which contents are on the pans (1 = 1 kg each, 2 = same-size boxes) and the swap pop
  const swaps = [[C.swap1, 2], [C.tog1, 1], [C.tog2, 2], [C.tog3, 1]];
  function contents(t) {
    let round = 1, last = -9;
    for (const [ts, r] of swaps) if (t >= ts) { round = r; last = ts; }
    const x = t - last;
    const pop = x < 0.18 ? (x < 0.09 ? 0.75 + 0.45 * E.out(x / 0.09) : 1.2 - 0.2 * E.io((x - 0.09) / 0.09)) : 1;
    // previous contents shrink away in the 0.1 s before each swap
    let out = null;
    for (const [ts, r] of swaps) if (t < ts && t > ts - 0.1) out = { round: round, s: 1 - E.in((t - (ts - 0.1)) / 0.1), next: r };
    return { round, pop, out };
  }

  function tilt(t) {
    if (t < C.pinOut1) return 0;
    if (t < C.pinIn) { const x = t - C.pinOut1; return 0.035 * Math.exp(-3.5 * x) * Math.sin(2 * Math.PI * 1.6 * x); }
    if (t < C.pinOut2) return 0;
    const slam = x => {
      if (x < 0.28) return MT * E.in(x / 0.28);
      const y = x - 0.28; return MT - 0.045 * Math.abs(Math.sin(2 * Math.PI * 2.8 * y)) * Math.exp(-6 * y);
    };
    const settle = (x, from) => from * Math.exp(-5.5 * x) * Math.cos(2 * Math.PI * 1.4 * x);
    if (t < C.tog1) return slam(t - C.pinOut2);
    if (t < C.tog2) return settle(t - C.tog1, MT);
    if (t < C.tog3) return slam(t - C.tog2);
    return settle(t - C.tog3, MT);
  }

  const BASE = { pos: [0, 0.98, 5.35], target: [0, 0.8, 0] };
  function camera(t) {
    const zoom = key(t, [[0, 0.05], [0.5, 0, E.out3], [8.0, 0], [8.1, 0.015, E.out], [8.8, 0, E.io], [16.0, 0], [16.1, 0.02, E.out],
      [16.7, 0, E.io], [19.3, 0], [19.4, 0.02, E.out], [20.1, 0, E.io], [29.0, 0], [30.0, -0.02, E.io]]);
    return { pos: [BASE.pos[0], BASE.pos[1], BASE.pos[2] * (1 - zoom)], target: [...BASE.target], fov: 30 };
  }

  const blinks = [1.2, 3.9, 6.2, 7.4, 10.1, 12.8, 15.2, 17.4, 20.6, 22.4, 24.6, 27.3, 29.3];
  function kip(t, th, P) {
    const p = {};
    const hop = 0.03 * pulse(t, C.thumbs, C.thumbs + 0.34) + 0.015 * pulse(t, C.answer + 0.4, C.answer + 0.75);
    p.root = [KR[0], KR[1] + hop, KR[2]];
    p.yaw = key(t, [[0, 0], [C.cubePlace, -0.2], [C.sackPlace, 0.25], [C.guess, 0], [C.volume, 0.15], [C.flip, -0.15], [C.sameSize, 0],
      [C.weigh2, 0.1], [C.recap, 0], [30, 0]]);
    p.lean = key(t, [[0, 0.05], [C.cubePlace, 0.18], [C.sackPlace, 0.18], [C.guess, 0.02], [C.answer, 0.05], [C.pile, 0.15], [C.flip, 0.15],
      [C.sameSize, 0.05], [C.slam, 0.12], [C.recap, 0.05], [30, 0.04]]);
    p.sway = key(t, [[0, 0], [C.guess, 0], [C.fuseStart + 0.3, -0.05], [C.answer, 0.04], [C.recap, 0], [C.thumbs, 0], [C.thumbs + 0.3, -0.07], [30, 0.03]]);
    let sq = 1 - 0.014 * onBeat(t) - (t > C.fuseStart && t < C.answer ? 0.02 * onBeat(t) : 0);
    sq += -0.06 * pulse(t, C.slam, C.slam + 0.2) - 0.05 * pulse(t, C.sackPlace, C.sackPlace + 0.2);
    for (const tt of [C.flip, C.tog1, C.tog2, C.tog3]) sq -= 0.04 * pulse(t, tt - 0.05, tt + 0.15);
    sq += -0.06 * pulse(t, C.thumbs - 0.12, C.thumbs + 0.02) + 0.04 * pulse(t, C.thumbs + 0.02, C.thumbs + 0.34);
    p.squash = sq;
    p.headYaw = key(t, [[0, -0.1], [C.cubePlace, -0.4], [C.sackPlace - 0.3, 0.4], [C.guess, 0], [C.fuseStart + 0.5, -0.3], [C.fuseStart + 1.5, 0.3],
      [C.fuseStart + 2.5, 0], [C.answer + 0.3, 0], [C.volume, 0.35], [C.volume + 0.8, -0.35], [C.pile, 0.35], [C.flip, -0.2], [C.sameSize, 0],
      [C.slam, -0.35], [C.stampSteel + 1, -0.3], [C.recap, 0], [C.tog1, -0.2], [C.tog2, 0.2], [C.tog3, 0], [30, 0.05]]);
    p.headPitch = key(t, [[0, 0.15], [C.cubePlace, 0.25], [C.sackPlace, 0.2], [C.guess, -0.05], [C.fuseStart, -0.12], [C.answer, 0.1],
      [C.volume, 0.15], [C.flip, 0.2], [C.slam, 0.25], [C.recap, 0.05], [C.thumbs, -0.05], [30, -0.05]]);
    p.headRoll = key(t, [[0, 0], [C.fuseStart, 0], [C.fuseStart + 0.3, -0.15], [C.answer, 0], [C.thumbs, 0], [C.thumbs + 0.3, 0.12], [30, 0.08]]);
    p.look = key(t, [[0, [-0.6, -0.5]], [C.cubePlace, [-0.8, -0.8]], [C.sackPlace - 0.3, [0.8, -0.6]], [C.guess, [0, 0]],
      [C.fuseStart + 0.5, [-0.8, -0.3]], [C.fuseStart + 1.5, [0.8, -0.3]], [C.fuseStart + 2.4, [0, 0.6]], [C.answer, [0, 0]],
      [C.volume, [0.7, -0.4]], [C.volume + 0.8, [-0.7, -0.6]], [C.pile, [0.7, -0.4]], [C.flip, [-0.5, -0.8]], [C.sameSize, [0, -0.6]],
      [C.slam, [-0.8, -0.9]], [C.recap, [0, 0]], [C.tog1, [-0.5, -0.6]], [C.tog2, [0.5, -0.6]], [C.tog3, [0, -0.3]], [C.thumbs, [0, 0]], [30, [0, 0.05]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); p.blink = bl;
    const surprise = Math.max(pulse(t, C.answer + 0.1, C.answer + 0.7), pulse(t, C.slam, C.slam + 0.6));
    const browBase = key(t, [[0, 0.3], [C.guess, 0.6], [C.fuseStart, 0.2], [C.answer, 1], [C.volume, 0.5], [C.flip, 0.3], [C.slam, 1], [C.recap, 0.4], [C.thumbs, 1], [30, 0.8]]);
    p.browRaiseL = browBase + 0.4 * surprise; p.browRaiseR = browBase + 0.4 * surprise + (t > C.fuseStart && t < C.answer ? 0.6 : 0);
    p.browAngle = key(t, [[0, 0.1], [C.fuseStart, 0.35], [C.answer, 0], [C.flip, -0.3], [C.weigh2, -0.2], [C.slam, 0.3], [C.recap, 0], [30, 0]]);
    p.smile = key(t, [[0, 0.5], [C.guess, 0.7], [C.fuseStart, 0.1], [C.answer, 1], [C.volume, 0.6], [C.flip, 0.6], [C.slam, 0.2], [C.stampSteel + 0.5, 0.8],
      [C.recap, 0.6], [C.thumbs, 1], [30, 1]]) * (1 - surprise);
    p.mouthOpen = clamp(0.45 * surprise + 0.3 * pulse(t, C.thumbs, C.thumbs + 0.8));
    p.mouthRound = clamp(1.4 * surprise);

    // hands
    const K = (x, y, z) => k => k.local(x, y, z);
    const Bp = (x, y, z) => k => k.bodyPoint(x, y, z);
    const pans = PH.panPositions(th);
    const cubeHold = [-0.3, 0.6, 0.0], sackHold = [0.36, 0.78, 0.04];
    const cubeOnPan = [pans.panL[0], pans.panL[1] + PH.CUBE + 0.035, 0.0];
    const sackOnPan = [pans.panR[0], pans.panR[1] + PH.SACK.h * 0.93 + 0.03, 0.04];
    const ring = [PH.BAL.pivot[0] + 0.115, PH.BAL.pivot[1], PH.BAL.pivot[2] + 0.05];
    const pinPulled = [0.27, 0.62, 0.02];
    const button = [-0.17, 0.12, -0.04], buttonUp = [-0.2, 0.3, -0.02];
    const restL = K(-0.3, 0.28, 0.12), restR = K(0.3, 0.28, 0.12);
    const slap = (t0) => [[t0 - 0.25, buttonUp], [t0 - 0.03, button, E.in], [t0 + 0.2, buttonUp, E.out3]];
    const L = [[0, cubeHold], [1.5, cubeHold], [C.cubePlace, cubeOnPan, E.io], [C.cubePlace + 0.15, cubeOnPan], [C.cubePlace + 0.6, restL],
      [C.guess, restL], [C.guess + 0.4, K(-0.28, 0.28, 0.1)], [C.answer + 0.3, K(-0.28, 0.28, 0.1)], [C.answer + 0.6, K(-0.42, 0.5, 0.15), E.out3],
      [C.volume - 0.2, K(-0.42, 0.5, 0.15)], [C.volume + 0.3, [-0.5, 0.36, 0.1]], [C.volume + 0.9, [-0.46, 0.33, 0.08]], [C.pile, K(-0.32, 0.36, 0.15)],
      ...slap(C.flip), [C.sameSize - 0.2, buttonUp], [C.sameSize + 0.2, [-0.6, 0.55, 0.1]], [C.weigh2, [-0.6, 0.55, 0.1]], [C.weigh2 + 0.3, restL],
      [C.stampSteel + 1.2, restL], [C.stampSteel + 1.6, [-0.5, 0.5, 0.15], E.out3], [C.recap, restL], ...slap(C.tog1), ...slap(C.tog2), ...slap(C.tog3),
      [C.tog3 + 0.5, restL], [30, restL]];
    const sackTop = [pans.panR[0] - 0.05, pans.panR[1] + PH.SACK.h * 0.8, 0.12];
    const R = [[0, sackHold], [2.6, sackHold], [C.sackPlace, sackOnPan, E.io], [C.sackPlace + 0.15, sackOnPan], [C.sackPlace + 0.6, restR],
      [C.guess, restR], [C.guess + 0.3, Bp(0.04, 0.27, 0.235)], [C.answer - 0.5, Bp(0.04, 0.27, 0.235)], [C.answer - 0.15, ring, E.io], [C.pinOut1, ring],
      [C.pinOut1 + 0.35, pinPulled, E.out3], [C.answer + 0.9, pinPulled], [C.answer + 1.3, K(0.42, 0.5, 0.15), E.out3], [C.volume - 0.2, K(0.42, 0.5, 0.15)],
      [C.volume + 0.3, [0.72, 0.62, 0.1]], [C.volume + 0.9, [0.7, 0.5, 0.1]], [C.pile - 0.2, sackTop], [C.pile + 0.1, [sackTop[0] - 0.03, sackTop[1] - 0.04, sackTop[2]], E.in],
      [C.pile + 0.4, sackTop, E.out], [C.pinIn - 0.4, pinPulled], [C.pinIn, ring, E.io], [C.pinIn + 0.3, restR], [C.sameSize - 0.2, restR],
      [C.sameSize + 0.2, [0.6, 0.55, 0.1]], [C.weigh2 - 0.25, ring], [C.pinOut2, ring], [C.pinOut2 + 0.3, pinPulled, E.out3], [C.slam + 0.6, pinPulled],
      [C.slam + 1.0, restR], [C.recap, restR], [C.thumbs - 0.15, restR], [C.thumbs + 0.1, K(0.27, 0.52, 0.2), E.back], [30, K(0.27, 0.54, 0.2)]];
    const resolve = tr => k => {
      const f = x => (typeof x === 'function' ? x(k) : V(...x));
      if (t <= tr[0][0]) return f(tr[0][1]);
      for (let i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
        const [t0, a] = tr[i - 1], [t1, b, e] = tr[i];
        return f(a).lerp(f(b), (e || E.io)((t - t0) / Math.max(1e-6, t1 - t0)));
      }
      return f(tr[tr.length - 1][1]);
    };
    p.handL = resolve(L); p.handR = resolve(R);
    p.fistR = key(t, [[0, 0], [C.thumbs - 0.1, 0], [C.thumbs + 0.05, 1]]);
    p.thumbUpR = key(t, [[0, 0], [C.thumbs - 0.1, 0], [C.thumbs + 0.08, 1, E.back]]);
    p.elbowR = [1, -0.6, 0.2]; p.elbowL = [-1, -0.6, 0.2];
    return p;
  }

  function fx(t, th, ct) {
    const o = {};
    const r1 = ct.round === 1;
    o.locked = (t >= C.lockShow && t < C.pinOut1) || (t >= C.pinIn && t < C.pinOut2) ? 1 : 0;
    o.kgTags = r1 ? win(t, C.sackPlace - 0.2, 99, 0.2, 0.1) : 0;
    o.sameMass = r1 ? Math.max(win(t, C.sameMass, C.volume - 0.3, 0.2, 0.25), win(t, C.tog3 + 0.3, 31, 0.25, 0.1)) : 0;
    o.volumes = win(t, C.volume, C.flip, 0.25, 0.15);
    o.pile = win(t, C.pile, C.flip, 0.25, 0.15);
    o.formula = win(t, C.pile + 0.1, C.flip - 0.05, 0.2, 0.15);
    o.sameSize = !r1 ? Math.max(win(t, C.sameSize, C.recap, 0.25, 0.25), 0) : 0;
    o.stampSteel = t >= C.stampSteel && t < C.recap ? seg(t, C.stampSteel, C.stampSteel + 0.1) : 0;
    o.stampSame = 0;
    o.chips = win(t, C.guess + 0.4, C.answer + 1.4, 0.2, 0.25);
    o.chipReveal = seg(t, C.answer, C.answer + 0.12);
    o.fuse = win(t, C.fuseStart - 0.15, C.answer + 0.3, 0.15, 0.25);
    o.fuseU = seg(t, C.fuseStart, C.answer, E.lin);
    o.recap = win(t, C.recap, 31, 0.25, 0.1);
    o.recapActive = r1 ? 0 : 1;
    o.badge = Math.max(win(t, 0.6, C.guess + 0.4, 0.2, 0.2), win(t, C.answer + 1.4, C.pile + 0.1, 0.2, 0.2), win(t, C.flip, C.recap, 0.2, 0.2));
    o.sig = seg(t, C.end, C.end + 0.35, E.io);
    o.beat = onBeat(t);
    return o;
  }

  function frame(t) {
    const th = tilt(t), ct = contents(t);
    return { t, tilt: th, contents: ct, cam: camera(t), kip: kip(t, th), fx: fx(t, th, ct), cues: C };
  }
  return { frame, cues: C };
}
