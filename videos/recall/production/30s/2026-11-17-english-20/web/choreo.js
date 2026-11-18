// Shots, acting, refraction states and cameras for "This straw isn't broken" (Recall, english-20). Everything is a pure function
// of t.
//
// Physics (OpenStax College Physics 2e §25.3 "The Law of Refraction"; OpenStax University Physics Vol. 3 §2.3 "Images Formed by
// Refraction"; schoolphysics "Real and apparent depth"): light changes direction where its speed changes (n_water = 1.333, v = c/n);
// leaving water it speeds up and bends away from the perpendicular (the lawn-mower picture); the underwater part's image forms
// closer to the surface, so a straight rod looks bent and, seen from above, water looks about 3/4 of its real depth. The ray path in
// the giant section is computed with Snell's law; pulse speeds, sizes and the café glass's break offset are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];      // ray section
export const MOWER = [60, 0, 0];      // grass / pavement
export const POOL = [90, 0, 0];       // pool
export const GLASS_POS = [0.06, 0.951, -0.16];
export const TH1 = 35 * Math.PI / 180, TH2 = Math.asin(1.333 * Math.sin(TH1));   // mower headings (like light leaving water)

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [3.2, 4.3, 27.7, 29.3];

  function person(t) {
    const q = { yaw: 0 };
    const look = key(t, [[0, 1], [C.why + 0.6, 1], [C.why + 1.1, 0]]);
    q.lean = 0.04 + 0.12 * look; q.tilt = 0.02;
    q.headPitch = 0.38 * look + key(t, [[0, 0], [26.38, 0], [27.2, -0.02], [30, -0.02]]);
    q.headYaw = 0.05 * look; q.headRoll = key(t, [[0, 0.02], [C.why, 0.14], [C.why + 1.1, 0.06], [5, 0.08], [26.38, 0.02], [30, 0.03]]);
    q.look = look > 0.5 ? [0.0, -0.75] : [0, 0.08];
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0.3 * look;
    q.browL = key(t, [[0, 0.5], [C.why, 0.9], [C.why + 1.1, 1.0], [26.38, 0.5], [30, 0.5]]);
    q.browR = key(t, [[0, 0.5], [C.why, 0.9], [C.why + 1.1, 0.2], [26.38, 0.5], [30, 0.5]]);
    q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.15], [C.why + 1.1, 0.15], [C.why + 1.4, 0.4], [26.38, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.12 * pulse(t, 1.6, 2.2); q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // mower: position/heading on the ground (x > 0 is pavement), as a function of t
  function mower(t) {
    const t0 = tl.shots.find(s => s.id === 'mower').t0, v1 = 0.62, v2 = v1 * 1.333;
    const tc = C.cross;                                  // the front reaches the edge
    const start = V(-v1 * (tc - t0) * Math.cos(TH1) - 0.45, 0, v1 * (tc - t0) * Math.sin(TH1) + 0.4);
    const d1 = V(Math.cos(TH1), 0, -Math.sin(TH1)), d2 = V(Math.cos(TH2), 0, -Math.sin(TH2));
    if (t <= tc) return { pos: start.clone().addScaledVector(d1, v1 * (t - t0)), ang: TH1, speed: v1 };
    const blend = seg(t, tc, tc + 0.7, E.io), at = start.clone().addScaledVector(d1, v1 * (tc - t0));
    const dir = d1.clone().lerp(d2, blend).normalize(), sp = v1 + (v2 - v1) * blend;
    return { pos: at.addScaledVector(dir, sp * (t - tc)), ang: TH1 + (TH2 - TH1) * blend, speed: sp };
  }

  function camera(t) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), M = V(...MOWER), PO = V(...POOL), gp = V(...GLASS_POS);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_glass': return { pos: L(gp.clone().add(V(0.02, 0.1, 0.36)), gp.clone().add(V(0.015, 0.095, 0.3))), target: gp.clone().add(V(-0.005, 0.088, 0)), fov: 34 };
      case 'react_look': return { pos: L(V(0.22, 1.52, 0.62), V(0.2, 1.52, 0.53)), target: V(0.05, 1.42, -0.35), fov: 50 };
      case 'giant_rays': return { pos: L(g(0.65, 2.3, 9.7), g(0.55, 2.3, 9.25)), target: g(0.55, 2.1, 0), fov: 44 };
      case 'mower': { const m = mower(t).pos.add(M); return { pos: m.clone().add(V(-1.6, 4.2, 3.8)), target: m.clone().add(V(0.6, 0, -0.3)), fov: 46 }; }
      case 'giant_trace': return { pos: L(g(0.6, 2.35, 9.4), g(0.5, 2.3, 9.0)), target: g(0.5, 2.0, 0), fov: 44 };
      case 'proof_glass': return { pos: L(gp.clone().add(V(0.03, 0.12, 0.34)), gp.clone().add(V(0.03, 0.2, 0.28))), target: gp.clone().add(V(-0.005, 0.085, 0)), fov: 34 };
      case 'pool_wide': return { pos: L(PO.clone().add(V(4.6, 3.4, 5.4)), PO.clone().add(V(4.1, 3.2, 5.0))), target: PO.clone().add(V(0, -1.3, -1.5)), fov: 46 };
      case 'pool_depth': return { pos: L(PO.clone().add(V(-0.8, 0.4, 6.6)), PO.clone().add(V(-0.9, 0.35, 6.2))), target: PO.clone().add(V(-1.4, -0.9, -1.0)), fov: 46 };
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      fasterTag: W('giant_rays', C.fasterTag, C.bendTag - 0.05), bendTag: W('giant_rays', C.bendTag), sideTag: W('mower', C.sideTag),
      straightTag: W('giant_trace', C.straightTag, C.higherTag - 0.05), higherTag: W('giant_trace', C.higherTag),
      shallowTag: W('pool_wide', C.shallowTag), quarterTag: W('pool_depth', C.quarterTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, mower, camera, overlay, cues: C };
}
