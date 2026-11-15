// Shots, acting, flask states and cameras for "A mirror for heat" (Recall, english-18). Everything is a pure function of t.
//
// Physics (OpenStax College Physics 2e §14.7; U. Illinois Physics Van "The Effectiveness of a Thermos"; HyperPhysics "Vacuum
// Flask"; Royal Institution "James Dewar's vacuum flask"): heat moves by conduction, convection and radiation; empty space
// allows no conduction or convection but radiation (mostly infrared at these temperatures) crosses it; a flask's two walls
// enclose a (partial) vacuum, and silvered walls reduce radiative transfer; heat can still pass through the top (neck and
// stopper). Arrow speeds, counts and sizes are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];
export const FLASK_POS = [0.09, 0.951, -0.2];
export const LID_POS = [0.23, 0.951, -0.12];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [2.4, 4.6, 27.7, 29.3];

  function person(t) {
    const q = { yaw: 0 };
    const peek = key(t, [[0, 0.6], [C.peek, 1], [C.why - 0.25, 1], [C.why + 0.2, 0]]);   // leans in to look into the flask, then up
    q.lean = 0.04 + 0.2 * peek; q.tilt = 0.03 * peek;
    q.headPitch = 0.42 * peek + key(t, [[0, 0], [26.38, 0], [27.2, -0.02], [30, -0.02]]);
    q.headYaw = 0.05 * peek; q.headRoll = key(t, [[0, 0], [C.why, 0], [C.why + 0.35, 0.08], [5, 0.08], [26.38, 0.02], [30, 0.03]]);
    q.look = peek > 0.5 ? [0.05, -0.7] : [0, 0.08];
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0.25 * peek;
    q.browL = key(t, [[0, 0.6], [C.why, 0.6], [C.why + 0.3, 1.0], [26.38, 0.5], [30, 0.5]]);
    q.browR = key(t, [[0, 0.6], [C.why, 0.6], [C.why + 0.3, 0.2], [26.38, 0.5], [30, 0.5]]);
    q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.2], [C.why, 0.2], [C.why + 0.3, 0.35], [26.38, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.1 * pulse(t, 1.6, 2.2); q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- flask states (giant shots)
  function flask(t, shot) {
    return {
      outerIn: shot === 'giant_ways' ? 0 : shot === 'giant_walls' ? seg(t, C.wallsIn, C.wallsIn + 1.1, E.io) : 1,
      gapAir: shot === 'giant_walls' ? 1 - seg(t, C.pump, C.pump + 0.9, E.in) : 0,
      mirror: ['hook_mirror', 'giant_mirror', 'giant_top'].includes(shot) ? (shot === 'giant_mirror' ? seg(t, C.mirror, C.mirror + 0.5) : 1) : 0,
      lidOn: shot === 'giant_top' ? seg(t, C.lidOn, C.lidOn + 0.5, E.out) : 0,
      block: shot === 'giant_noair' ? seg(t, C.block, C.block + 0.8, E.out) : 0,
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), fp = V(...FLASK_POS);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_mirror': return { pos: L(g(1.55, 2.8, 7.2), g(1.42, 2.8, 6.9)), target: g(0.05, 2.74, 0), fov: 40 };
      case 'react_peek': return { pos: L(V(0.24, 1.56, 0.6), V(0.22, 1.56, 0.51)), target: V(0.06, 1.5, -0.35), fov: 52 };
      case 'giant_ways': return { pos: L(g(1.3, 1.9, 6.1), g(1.1, 1.9, 5.7)), target: g(0.35, 1.55, 0), fov: 44 };
      case 'giant_walls': return { pos: L(g(1.1, 2.7, 7.2), g(0.95, 2.6, 6.8)), target: g(0.05, 2.25, 0), fov: 44 };
      case 'giant_noair': return { pos: L(g(1.45, 1.75, 3.3), g(1.32, 1.75, 3.0)), target: g(0.82, 1.6, 0), fov: 42 };
      case 'giant_ir': return { pos: L(g(1.35, 1.9, 4.4), g(1.15, 1.9, 4.1)), target: g(0.7, 1.7, 0), fov: 42 };
      case 'giant_mirror': return { pos: L(g(0.95, 2.0, 4.5), g(1.25, 2.0, 4.2)), target: g(0.6, 1.7, 0), fov: 42 };
      case 'giant_top': return { pos: L(g(0.95, 4.0, 3.8), g(0.82, 3.9, 3.45)), target: g(0.1, 3.3, 0), fov: 42 };
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      solidsTag: W('giant_ways', C.solids, C.air - 0.05), airTag: W('giant_ways', C.air, C.irWays - 0.05), irWaysTag: W('giant_ways', C.irWays),
      vacTag: W('giant_walls', C.vacTag), noAirTag: W('giant_noair', C.noAir), irTag: W('giant_ir', C.irTag), mirrorTag: W('giant_mirror', C.mirrorTag),
      weakTag: W('giant_top', C.weakTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, flask, camera, overlay, cues: C };
}
