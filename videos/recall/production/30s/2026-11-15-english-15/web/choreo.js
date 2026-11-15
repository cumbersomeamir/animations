// Shots, acting, the iced glass, the giant vapor/drop states and cameras for "Where's this water from?" (Recall,
// english-15). Everything is a pure function of t.
//
// Physics (NOAA "Sweatin' to the Coldies"; Penn State METEO 101 "Making Do with Dew Points"; OpenStax College Physics 2e
// §13.6): air in contact with the cold glass is cooled below its dew point and water vapor condenses on the glass (molecules
// stick faster than they leave); more humid air (higher dew point) means more water on the glass. The insulated cup's dry
// outer wall is an inference from the same principle. Molecule speeds, counts and drop sizes are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GLASS_POS = [0.02, 0.951, -0.12];
export const CUP_POS = [0.17, 0.951, -0.16];
export const GIANT = [30, 0, 0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [5.0, 22.9, 27.8, 29.4];

  // ---------------- finger wipe / tumbler lift timing: kept for reference, unused since preview review (no hand close-up)
  const wipe = t => seg(t, C.wipe, C.wipeEnd, E.io);                   // 0..1 down the glass
  const fingerOn = t => win(t, C.wipe - 0.35, C.wipeEnd + 1.6, 0.3, 0.35);
  const lift = t => seg(t, C.lift, C.lift + 0.6, E.io);

  function person(t, shot) {
    const q = { yaw: 0 };
    q.lean = key(t, [[0, 0.1], [4.98, 0.08], [21.88, 0.08], [26.35, 0.03]]);
    q.tilt = key(t, [[0, 0], [21.9, 0], [23.5, 0.05], [26.35, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.3], [4.98, 0.3], [21.88, 0.3], [24.0, 0.15], [25.0, 0.05], [26.35, 0.05], [27.2, 0.0], [30, 0]]);
    q.headYaw = key(t, [[0, 0], [24.5, 0.1], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [24.5, 0.08], [26.35, 0.02], [30, 0.03]]);
    q.look = key(t, [[0, [0, -0.4]], [24.2, [0.1, -0.2]], [25.0, [0.05, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0;
    const brow = key(t, [[0, 0.3], [24.0, 0.3], [24.6, 0.8], [26.35, 0.4], [30, 0.4]]);
    q.browL = brow; q.browR = brow; q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.4], [24.2, 0.5], [24.8, 0.9], [26.35, 0.7], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.15 * pulse(t, 24.6, 25.1);
    q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- giant states
  function giant(t) {
    return {
      cool: seg(t, C.cool, C.cool + 0.8), stick: seg(t, C.stick, C.stick + 0.5), grow: seg(t, C.grow, C.grow + 4.5, E.out),
      humid: seg(t, C.humid, C.humid + 1.2, E.io),
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), gp = V(...GLASS_POS);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    switch (s.id) {
      case 'hook_glass': return { pos: L(gp.clone().add(V(0.05, 0.125, 0.4)), gp.clone().add(V(0.035, 0.115, 0.32))), target: gp.clone().add(V(0.0, 0.082, 0.0)), fov: 36 };
      case 'giant_air': return { pos: L(G.clone().add(V(4.2, 2.4, 5.6)), G.clone().add(V(3.8, 2.4, 5.1))), target: G.clone().add(V(0.9, 2.8, 0.0)), fov: 48 };
      case 'giant_cool': return { pos: L(G.clone().add(V(2.9, 2.3, 4.6)), G.clone().add(V(2.6, 2.3, 4.2))), target: G.clone().add(V(0.4, 2.8, 0.2)), fov: 48 };
      case 'giant_stick': return { pos: L(G.clone().add(V(2.1, 2.6, 4.4)), G.clone().add(V(1.85, 2.6, 4.0))), target: G.clone().add(V(0.15, 2.8, 0.4)), fov: 46 };
      case 'giant_humid': return { pos: L(G.clone().add(V(4.4, 2.5, 5.8)), G.clone().add(V(4.0, 2.5, 5.3))), target: G.clone().add(V(0.8, 2.8, 0.0)), fov: 50 };
      case 'payoff_cup': return { pos: L(gp.clone().add(V(0.03, 0.17, 0.62)), gp.clone().add(V(0.13, 0.165, 0.58))), target: gp.clone().add(V(0.08, 0.088, -0.02)), fov: 46 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    return {
      orangeTag: shot === 'hook_glass' ? win(t, C.orangeTag, 4.98, 0.2, 0.05) : 0,
      clearTag: shot === 'hook_glass' ? win(t, C.clearTag, 4.98, 0.2, 0.05) : 0,
      vaporTag: shot === 'giant_air' ? win(t, C.vapor + 0.5, 8.33, 0.2, 0.05) : 0,
      dewTag: shot === 'giant_cool' ? win(t, C.cool + 0.9, 11.88, 0.2, 0.05) : 0, glassTag: shot === 'giant_cool' ? win(t, 8.5, 11.88, 0.2, 0.05) : 0,
      stickTag: shot === 'giant_stick' ? win(t, C.stick + 0.5, 17.38, 0.2, 0.05) : 0,
      humidTag: shot === 'giant_humid' ? win(t, C.humid + 0.5, 21.88, 0.2, 0.05) : 0,
      dryTag: shot === 'payoff_cup' ? win(t, C.cupIn + 0.5, 26.35, 0.2, 0.05) : 0,
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, wipe, fingerOn, lift, person, giant, camera, overlay, cues: C };
}
