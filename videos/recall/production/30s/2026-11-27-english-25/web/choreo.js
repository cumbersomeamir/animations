// Shots, acting, pencil-case states and the giant zipper cut-away for "Same slider, opposite jobs" (Recall, english-25).
// Everything is a pure function of t.
//
// Mechanism (Sundback, US 1,219,881 "Separable fastener"; YKK Americas, pin-lock vs auto-lock sliders): the slider's chamber has
// slanted side walls and a tongue (wedge) that splits it into two branch channels (a Y); moving the slider toward the open end pushes
// the two staggered rows together so each tooth's projection nests in the next tooth's recess; moving it back drives the wedge between
// them and splits them into the two arms; joined teeth have practically no sideways separation; an auto-lock slider stays put unless
// the tab is pulled. Chain speed, sizes and the drawn catch are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];
export const NEST = [60, 0, 0];
export const CASE_POS = [0.12, 0.95, -0.2], CASE_ROT = 0.15;
const CASEM = new THREE.Matrix4().compose(V(...CASE_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, CASE_ROT, 0)), V(1, 1, 1));
const caseL = (x, y, z) => V(x, y, z).applyMatrix4(CASEM);

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T0 = id => tl.shots.find(s => s.id === id).t0, T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [2.4, 4.4, 25.2, 27.9, 29.4];

  /** pencil case zip state: 1 closed, 0 open; tab lift */
  function zipCase(t) {
    const u = key(t, [[0, 0], [C.zipClose, 0], [C.lockWord + 0.05, 1, E.io], [C.zipOpen, 1], [C.zipOpen + 0.7, 0, E.io], [23.9, 0.0],
      [23.95, 1], [C.tabPull, 1], [C.tabPull + 0.9, 0.15, E.io], [30, 0.15]]);
    const lift = t >= 24.0 && t < 26.45 ? seg(t, C.tabPull - 0.25, C.tabPull) : 0;
    return { u, lift };
  }
  const L = 0.24, sliderX = u => (L / 2 - 0.01) + ((-L / 2 + 0.01) - (L / 2 - 0.01)) * u;

  function person(t) {
    const q = { yaw: 0 }, zipping = (t >= 2.0 && t < 5.0) || (t >= 24.0 && t < 26.45);
    const z = zipCase(t), hand = caseL(sliderX(z.u), 0.1, 0.03);
    const lookCase = zipping && t < C.how - 0.1 ? 1 : 0;
    q.lean = 0.05 + 0.08 * lookCase; q.twist = 0; q.tilt = key(t, [[0, 0], [C.how, 0], [C.how + 0.3, 0.09], [5.75, 0.09], [26.45, 0.02], [30, 0.03]]);
    q.headPitch = 0.28 * lookCase - 0.02; q.headYaw = 0.12 * lookCase; q.headRoll = t >= C.how && t < 5.75 ? 0.12 : 0.02;
    q.look = lookCase ? [0.2, -0.6] : [0, 0.05];
    let bl = 0; for (const x of blinks) bl = Math.max(bl, pulse(t, x, x + 0.14)); q.blink = bl;
    q.squint = t >= C.how && t < 5.75 ? 0.25 : 0;
    q.browL = 0.5 + (t >= C.how && t < 5.75 ? 0.6 : 0); q.browR = 0.5 + (t >= C.how && t < 5.75 ? -0.1 : 0); q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.3], [C.lockWord, 0.45], [C.how, 0.2], [5.75, 0.3], [24.0, 0.4], [26.45, 0.7], [C.smile2, 0.95], [30, 0.9]]);
    q.open = 0.15 * pulse(t, C.how, C.how + 0.5); q.frown = 0;
    const rest = [V(-0.24, 0.97, -0.33), V(0.24, 0.97, -0.33)];
    const grip = zipping ? 1 : 0;
    q.handR = grip ? hand : rest[1];
    q.handL = grip ? caseL(0.1, 0.06, -0.02) : rest[0];   // the other hand steadies the case
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  /** giant zipper state */
  function zip(t, shot) {
    const s = { c: 0, sy: 0, strain: 0, catchDown: 0, tabUp: 0, cover: 0, coverAlpha: 1, glowWalls: 0, glowWedge: 0, gap: 1, arrowY: -4.4 };
    if (shot === 'hook_giant') s.c = -0.9 * t;                                      // closing slowly (rows join below the slider)
    if (shot === 'giant_y') { s.c = -0.9 * T0('giant_y'); s.cover = seg(t, C.coverLift, C.coverLift + 1.0, E.io); }
    if (shot === 'giant_close') { s.c = -0.9 * T0('giant_y') - 1.6 * (t - T0('giant_close')); s.cover = 1; s.glowWalls = 0.6 * seg(t, C.wallsTag - 0.3, C.wallsTag + 0.2); }
    if (shot === 'pull_test') { s.sy = 16; s.strain = seg(t, C.pullApart - 0.3, C.pullApart + 0.3) * (1 - 0.2 * Math.max(0, Math.sin((t - C.pullApart) * 9)) * (t > C.pullApart ? 1 : 0)); s.cover = 1; }
    if (shot === 'giant_open') { s.c = 1.6 * (t - T0('giant_open')); s.cover = 1; s.glowWedge = 0.7 * seg(t, C.wedgeTag - 0.3, C.wedgeTag + 0.2); }
    if (shot === 'lock_catch') { s.c = 0; s.cover = 0; s.coverAlpha = 0.3; s.catchDown = 1; s.strain = 0.8 * seg(t, C.catchTag - 0.3, C.catchTag + 0.2); s.arrowY = -2.2; }
    if (shot === 'tooth_parts') s.gap = 1;
    if (shot === 'tooth_nest') s.gap = 1 - seg(t, C.nest - 0.35, C.nest + 0.35, E.io);
    return s;
  }

  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), Nn = V(...NEST);
    const Lp = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z)), n = (x, y, z) => Nn.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_giant': return { pos: Lp(g(2.6, 0.6, 12.0), g(2.4, 0.7, 11.2)), target: g(0, 0.8, 0), fov: 46 };
      case 'pouch_react': return { pos: Lp(V(-0.42, 1.52, 1.08), V(-0.37, 1.53, 0.96)), target: Lp(V(0.08, 1.3, -0.35), V(0.07, 1.31, -0.37)), fov: 46 };
      case 'giant_y': return { pos: Lp(g(1.8, 2.6, 6.2), g(1.4, 2.3, 5.4)), target: g(0, 0.5, 0), fov: 46 };
      case 'giant_close': return { pos: Lp(g(-2.1, 1.4, 5.4), g(-1.8, 1.2, 4.8)), target: g(0, 0.1, 0), fov: 46 };
      case 'tooth_parts': return { pos: Lp(n(2.3, -3.2, 4.4), n(2.0, -2.9, 4.0)), target: n(0, 0.3, 0), fov: 44 };
      case 'tooth_nest': return { pos: Lp(n(2.0, -1.3, 4.4), n(1.8, -1.0, 4.0)), target: n(0, 0.0, 0), fov: 44 };
      case 'pull_test': return { pos: Lp(g(0.7, -4.2, 8.2), g(0.6, -4.3, 7.6)), target: g(0, -4.4, 0), fov: 46 };
      case 'giant_open': return { pos: Lp(g(1.9, 2.2, 5.2), g(1.6, 1.9, 4.6)), target: g(0, 0.7, 0), fov: 46 };
      case 'lock_catch': return { pos: Lp(g(1.3, -1.7, 3.7), g(1.15, -1.6, 3.4)), target: g(0, -1.2, 0), fov: 46 };
      case 'pull_tab': { const c = caseL(0, 0.08, 0); return { pos: Lp(c.clone().add(V(-0.24, 0.38, 0.62)), c.clone().add(V(-0.2, 0.34, 0.55))), target: c.clone().add(V(0.0, 0.03, 0)), fov: 44 }; }
      case 'cafe_cta': return { pos: Lp(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: Lp(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      yTag: W('giant_y', C.yTag - 0.1), wallsTag: W('giant_close', C.wallsTag), bumpTag: W('tooth_parts', C.bumpTag), hollowTag: W('tooth_parts', C.hollowTag),
      nestTag: W('tooth_nest', C.nest + 0.3), holdsTag: W('pull_test', C.pullApart + 0.3), wedgeTag: W('giant_open', C.wedgeTag), lockTag: W('lock_catch', C.catchTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, zipCase, zip, camera, overlay, cues: C };
}
