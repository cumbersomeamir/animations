// Shots, acting, window-section states and cameras for "That hole is on purpose" (Recall, english-17). Everything is a pure
// function of t.
//
// Engineering (FAA AC 25.775-1 "Windows and Windshields"; Airbus patent US 5,988,566 "Aircraft window construction"): cabin
// windows typically have two structural panes separated by an air gap (a main load-bearing outer pane and a fail-safe pane) plus
// inner facing panes; a small bore connects the gap to the cabin, so the cabin pressure acts between the panes and only the outer
// pane carries the pressure difference; the fail-safe pane is not loaded unless the main pane fails. The same connection lets
// moist cabin air into the gap, which can fog the panes (US 5,988,566). Dot counts, speeds, layer thicknesses and the hole marker
// size are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { WIN } from './lowpoly.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.12, -0.45, -0.03];   // seated in the window seat (the rig's torso sits on the cushion)
export const GIANT = [30, 0, 0];
export const HOLE = [WIN.x + WIN.middle, WIN.y + WIN.holeY, 0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [2.2, 3.95, 27.7, 29.3];

  function person(t, shot) {
    const q = { yaw: 0 };
    const lookWin = key(t, [[0, 0], [1.6, 0], [2.05, 1]]) * (1 - key(t, [[0, 0], [3.55, 0], [3.9, 1]]));   // turns to the window, then back
    q.lean = key(t, [[0, 0.02], [26.38, 0.02], [30, 0.03]]);
    q.tilt = -0.1 * lookWin;
    q.headYaw = 0.85 * lookWin; q.headPitch = 0.12 * lookWin + key(t, [[0, 0], [26.38, 0], [27.2, -0.02], [30, -0.02]]);
    q.headRoll = key(t, [[0, 0], [3.9, 0], [4.2, 0.09], [4.58, 0.09], [26.38, 0.02], [30, 0.03]]);
    q.look = lookWin > 0.5 ? [0.6, -0.2] : [0, 0.05];
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0.3 * lookWin;
    q.browL = key(t, [[0, 0.5], [2.0, 0.9], [3.9, 0.6], [4.1, 1.0], [26.38, 0.5], [30, 0.5]]);
    q.browR = key(t, [[0, 0.5], [2.0, 0.9], [3.9, 0.6], [4.1, 0.15], [26.38, 0.5], [30, 0.5]]);   // one raised brow at the camera
    q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.1], [3.9, 0.1], [4.2, 0.45], [26.38, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.12 * pulse(t, 2.0, 2.6); q.frown = 0;
    q.point = 0;   // (pointing was tried in preview; the blocky hand read badly, so the lean + look carry the beat)
    q.lean = key(t, [[0, 0.02], [1.6, 0.02], [2.1, 0.12], [3.55, 0.12], [3.9, 0.02], [30, 0.03]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- section states (giant shots)
  function section(t) {
    return {
      climb: seg(t, C.climb, C.climb + 2.6, E.io), load: seg(t, C.load, C.load + 0.5), flow: seg(t, C.flow, C.flow + 0.5),
      equal: seg(t, C.equal, C.equal + 0.5), backup: seg(t, C.backup, C.backup + 0.5),
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_window': return { pos: L(V(-0.24, 1.215, 0.07), V(-0.17, 1.21, 0.055)), target: V(0.5, 1.19, 0.0), fov: 36 };
      case 'react_point': return { pos: L(V(0.4, 1.3, 0.98), V(0.38, 1.3, 0.9)), target: V(0.24, 1.14, -0.02), fov: 44 };
      case 'giant_climb': return { pos: L(g(0.0, 2.45, 7.8), g(0.1, 2.45, 7.2)), target: g(-0.1, 2.3, 0), fov: 42 };
      case 'giant_outer': return { pos: L(g(0.95, 2.4, 4.7), g(0.8, 2.4, 4.3)), target: g(0.25, 2.25, 0), fov: 42 };
      case 'giant_hole': return { pos: L(g(-0.65, 1.8, 2.7), g(-0.52, 1.74, 2.35)), target: g(-0.28, 1.55, 0), fov: 40 };
      case 'giant_equal': return { pos: L(g(-0.5, 2.3, 4.7), g(-0.38, 2.3, 4.3)), target: g(-0.28, 2.2, 0), fov: 42 };
      case 'giant_backup': return { pos: L(g(0.6, 2.5, 6.8), g(0.4, 2.5, 6.3)), target: g(0.0, 2.25, 0), fov: 42 };
      case 'payoff_fog': return { pos: L(V(0.17, 1.08, 0.11), V(0.22, 1.07, 0.08)), target: V(0.555, 1.045, -0.005), fov: 38 };
      case 'payoff_moist': return { pos: L(V(0.36, 1.06, 0.07), V(0.4, 1.055, 0.05)), target: V(0.555, 1.024, -0.003), fov: 34 };
      case 'cabin_cta': return { pos: L(V(-0.78, 1.42, 1.28), V(-0.7, 1.44, 1.17)), target: V(0.14, 1.12, -0.05), fov: 44 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      thinTag: W('giant_climb', C.thinTag), outerTag: W('giant_outer', C.outerTag), holeTag: W('giant_hole', C.holeTag),
      noLoadTag: W('giant_equal', C.noLoadTag), backupTag: W('giant_backup', C.backupTag),
      fogTag: W('payoff_fog', C.fogTag), moistTag: W('payoff_moist', C.moistTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, section, camera, overlay, cues: C };
}
