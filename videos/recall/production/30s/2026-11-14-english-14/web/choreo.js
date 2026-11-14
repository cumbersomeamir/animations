// Shots, acting, the café fridge, thermometer, giant fridge loop, air conditioner and cameras for "Why an open fridge makes
// the kitchen warmer" (Recall, english-14). Everything is a pure function of t.
//
// Physics (OpenStax College Physics 2e §15.5; Physics Van, U. Illinois; Energy Education, U. Calgary): a refrigerator moves
// heat from its cold inside to the warmer room (Q_h = Q_c + W): refrigerant evaporates in the inside coils (absorbing heat),
// a compressor raises its pressure and temperature above the room's, and the outside coils release the heat; with the door
// open the moved heat returns to the room and the motor's work is added, so the room's average temperature rises a little.
// An air conditioner's condenser (hot side) is outdoors. Needle movements, particle counts and speeds are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];                      // the performer's café position (CTA)
export const HOOK_POS = [-1.45, 0, -0.72];                 // beside the café fridge
export const FRIDGE_POS = [-2.2, 0, -1.22];
export const THERMO_POS = [-0.95, 1.5, -1.562];            // a window thermometer stuck on the glass
export const GIANT = [30, 0, 0], ACG = [42, 0, 0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [3.0, 5.4, 27.7, 29.4];

  // ---------------- café fridge door (0 closed .. 1 open ~105°), mist, thermometer (0 cold .. 1 hot)
  const door = t => (t < 26.35 ? seg(t, C.doorOpen, C.doorOpen + 0.55, E.out) : 0);
  const thermo = t => key(t, [[0, 0.62], [C.thermo, 0.62], [6.2, 0.7], [26.35, 0.62], [30, 0.62]]);

  // ---------------- performer
  function person(t, shot) {
    const q = { yaw: key(t, [[0, -0.35], [0.9, -0.15], [4.0, 0.25], [6.23, 0.2], [26.35, 0], [30, 0]]) };
    q.lean = 0.03;
    q.tilt = key(t, [[0, 0], [1.2, 0.04], [4.0, 0.0], [4.6, 0.06], [6.2, 0.04], [26.35, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.05], [1.0, 0.0], [2.2, -0.05], [4.03, 0.0], [5.2, 0.05], [6.23, 0.0], [26.35, 0.05], [27.2, 0.0], [30, 0]]);
    q.headYaw = key(t, [[0, -0.5], [0.9, -0.3], [2.2, 0.1], [3.2, 0.5], [4.3, 0.55], [5.3, 0.1], [6.23, 0.0], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [3.2, 0.08], [4.6, 0.12], [6.2, 0.05], [26.35, 0.02], [30, 0.03]]);
    q.look = key(t, [[0, [-0.4, -0.1]], [0.9, [-0.3, 0]], [2.6, [0.4, 0.05]], [4.4, [0.5, 0.1]], [5.3, [0.05, 0.12]], [26.35, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = key(t, [[0, 0.3], [1.0, 0.0], [3.0, 0.2], [26.35, 0], [30, 0]]);
    const brow = key(t, [[0, 0.3], [0.9, 0.5], [2.4, 0.2], [3.2, 0.9], [4.4, 1.0], [6.2, 0.6], [26.35, 0.4], [30, 0.4]]);
    q.browL = brow; q.browR = brow * 0.85; q.browAngle = key(t, [[0, -0.2], [2.6, -0.1], [3.2, 0.25], [6.2, 0.2], [26.35, 0.1]]);
    q.smile = key(t, [[0, 0.2], [0.9, 0.55], [2.0, 0.6], [3.0, 0.1], [4.4, 0.0], [6.2, 0.1], [26.35, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.2 * pulse(t, 0.6, 1.1) + 0.25 * pulse(t, 4.3, 4.9);
    q.frown = key(t, [[0, 0], [2.8, 0], [3.4, 0.5], [5.6, 0.4], [6.2, 0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    q.grabDoor = win(t, 0.0, 0.95, 0.05, 0.3);               // left hand on the handle while the door swings open
    q.fan = win(t, 1.0, 4.0, 0.3, 0.3);                      // right hand fans the face (hot day)
    return q;
  }

  // ---------------- giant states
  function giant(t) {
    return {
      door: seg(t, C.loopDoor, C.loopDoor + 0.7, E.out) * (t < 22.93 ? 1 : 0), loop: seg(t, C.loop, C.loop + 0.6), motor: seg(t, C.motor, C.motor + 0.5),
      squeeze: Math.max(0, Math.sin(2 * Math.PI * 1.6 * t)) * seg(t, C.squeeze, C.squeeze + 0.4), release: seg(t, C.release, C.release + 0.6),
      thermo: key(t, [[0, 0.55], [C.loop, 0.55], [22.9, 0.72]]), acThermo: key(t, [[0, 0.75], [C.acOn + 0.3, 0.75], [26.3, 0.42]]),
      acOn: seg(t, C.acOn, C.acOn + 0.4), acOut: seg(t, C.acOut, C.acOut + 0.6),
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), A = V(...ACG);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    switch (s.id) {
      case 'hook_fridge': return { pos: L(V(-1.05, 1.45, 2.7), V(-1.15, 1.42, 2.35)), target: L(V(-1.6, 1.18, -0.9), V(-1.55, 1.2, -0.9)), fov: 46 };
      case 'react': return { pos: L(V(-1.2, 1.58, 1.65), V(-1.22, 1.57, 1.45)), target: V(-1.25, 1.5, -0.9), fov: 48 };
      case 'giant_pump': return { pos: L(G.clone().add(V(7.6, 2.8, 0.2)), G.clone().add(V(7.0, 2.75, -0.1))), target: G.clone().add(V(0, 2.35, -0.6)), fov: 48 };
      case 'giant_inside': return { pos: L(G.clone().add(V(3.0, 3.0, 0.6)), G.clone().add(V(2.7, 2.95, 0.35))), target: G.clone().add(V(0, 2.75, -0.25)), fov: 46 };
      case 'giant_back': return { pos: L(G.clone().add(V(3.6, 1.95, -0.6)), G.clone().add(V(3.3, 2.0, -0.95))), target: G.clone().add(V(0, 1.85, -1.15)), fov: 48 };
      case 'giant_loop': return { pos: L(G.clone().add(V(7.4, 3.0, 2.4)), G.clone().add(V(7.0, 2.95, 2.0))), target: G.clone().add(V(0, 2.5, 0.0)), fov: 50 };
      case 'giant_ac': return { pos: L(A.clone().add(V(1.8, 2.7, 8.4)), A.clone().add(V(1.75, 2.65, 7.8))), target: A.clone().add(V(1.75, 2.25, -0.9)), fov: 48 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    return {
      warmTag: shot === 'hook_fridge' ? win(t, 2.4, 4.03, 0.2, 0.05) : 0,
      outTag: shot === 'giant_pump' ? win(t, C.heatFlow + 0.8, 9.08, 0.2, 0.05) : 0,
      evapTag: shot === 'giant_inside' ? win(t, C.evap + 0.6, 13.73, 0.2, 0.05) : 0,
      compTag: shot === 'giant_back' ? win(t, C.squeeze + 0.2, C.release + 0.3, 0.2, 0.2) : 0,
      hotTag: shot === 'giant_back' ? win(t, C.release + 0.3, 19.08, 0.2, 0.05) : 0,
      motorTag: shot === 'giant_loop' ? win(t, C.motor + 0.2, 22.93, 0.2, 0.05) : 0,
      acTag: shot === 'giant_ac' ? win(t, C.acOut + 0.4, 26.35, 0.2, 0.05) : 0,
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, door, thermo, person, giant, camera, overlay, cues: C };
}
