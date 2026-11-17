// Shots, acting, cooker states and cameras for "Hotter than boiling water" (Recall, english-19). Everything is a pure function
// of t.
//
// Physics (OpenStax College Physics 2e §13.5 and §13.6; Penn State Extension "Preparing Meals with Pressure Cookers"; New Mexico
// State University Extension E-215 "High-Altitude Cooking"): water boils when its vapor pressure equals the pressure on it
// (1.00 atm → 100 °C at sea level; Table 13.5: 1.99×10^5 Pa ≈ 2 atm at 120 °C); a pressure cooker traps steam so the pressure
// rises and the water reaches about 120 °C (15 psi → 250 °F) and cooks food faster; at altitude the air pressure is lower, water
// boils below 100 °C and food needs more time. Bubble sizes, steam-dot counts and the 90 °C mountain reading (≈10,000 ft) are
// illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];
export const COOKER_POS = [0.1, 0.951, -0.2];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [2.4, 4.4, 27.7, 29.3];

  function person(t) {
    const q = { yaw: 0 };
    const look = key(t, [[0, 1], [C.why, 1], [C.why + 0.4, 0]]);   // eyes on the hissing valve, then to camera
    q.lean = 0.02 - 0.04 * look; q.tilt = 0.02;
    q.headPitch = 0.3 * look + key(t, [[0, 0], [26.38, 0], [27.2, -0.02], [30, -0.02]]);
    q.headYaw = 0.12 * look; q.headRoll = key(t, [[0, 0], [C.why, 0], [C.why + 0.35, 0.08], [5, 0.08], [26.38, 0.02], [30, 0.03]]);
    q.look = look > 0.5 ? [0.2, -0.6] : [0, 0.08];
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0;
    q.browL = key(t, [[0, 0.9], [C.why, 0.9], [C.why + 0.3, 1.0], [26.38, 0.5], [30, 0.5]]);
    q.browR = key(t, [[0, 0.9], [C.why, 0.9], [C.why + 0.3, 0.25], [26.38, 0.5], [30, 0.5]]);
    q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.1], [C.why, 0.1], [C.why + 0.3, 0.4], [26.38, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.35 * pulse(t, 1.5, 2.6); q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- cooker states (giant shots)
  function cooker(t, shot) {
    const lidOn = ['hook_cooker', 'giant_hot', 'giant_food'].includes(shot) ? 1 : shot === 'giant_lid' ? seg(t, C.lid, C.lidLock, E.in) : 0;
    const pressure = ['hook_cooker', 'giant_hot', 'giant_food'].includes(shot) ? 2 : shot === 'giant_lid' ? 1 + seg(t, C.pressureTag - 0.4, C.pressureTag + 0.8) : 1;
    const temp = shot === 'hook_cooker' || shot === 'giant_food' ? 120 : shot === 'giant_hot' ? 100 + 20 * seg(t, C.heatUp, C.t120 + 0.3) : shot.startsWith('payoff') ? 90 : 100;
    const boil = shot === 'giant_open' ? seg(t, C.bubble, C.bubble + 0.6) : shot === 'giant_lid' ? 1 - seg(t, C.pressureTag - 0.2, C.pressureTag + 0.5)
      : shot === 'giant_hot' ? seg(t, C.reboil, C.reboil + 0.5) : shot === 'hook_cooker' ? 0.6 : 1;
    return { lidOn, pressure, temp, boil, trapped: lidOn > 0.98, mountain: shot.startsWith('payoff'), cook: shot === 'giant_food' ? seg(t, C.food, C.food + 1.6, E.out) : 0 };
  }

  // ---------------- cameras (every shot moves)
  function camera(t) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), cp = V(...COOKER_POS);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_cooker': return { pos: L(g(1.5, 2.8, 6.8), g(1.36, 2.8, 6.5)), target: g(0.1, 2.35, 0), fov: 42 };
      case 'react_valve': return { pos: L(V(0.24, 1.56, 0.6), V(0.22, 1.56, 0.51)), target: V(0.06, 1.5, -0.35), fov: 52 };
      case 'giant_open': return { pos: L(g(1.2, 1.65, 4.7), g(1.05, 1.6, 4.35)), target: g(0, 1.05, 0), fov: 42 };
      case 'giant_100': return { pos: L(g(1.45, 2.95, 4.4), g(1.35, 2.93, 4.15)), target: g(0.62, 2.89, 0.35), fov: 40 };
      case 'giant_lid': return { pos: L(g(1.5, 2.45, 6.1), g(1.38, 2.4, 5.7)), target: g(0, 1.75, 0), fov: 42 };
      case 'giant_hot': return { pos: L(g(1.6, 2.6, 6.3), g(1.45, 2.58, 6.0)), target: g(0.3, 2.48, 0), fov: 40 };
      case 'giant_food': return { pos: L(g(0.9, 1.35, 3.7), g(0.8, 1.3, 3.35)), target: g(0, 0.8, 0), fov: 42 };
      case 'payoff_mountain': return { pos: L(g(2.2, 2.5, 8.6), g(1.9, 2.4, 8.1)), target: g(0, 2.3, -3), fov: 46 };
      case 'payoff_cool': return { pos: L(g(1.6, 2.6, 6.3), g(1.45, 2.58, 6.0)), target: g(0.3, 2.48, 0), fov: 40 };
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      vaporTag: W('giant_open', C.vaporTag, C.airTag - 0.05), airTag: W('giant_open', C.airTag), seaTag: W('giant_100', T1('giant_open') + 0.15),
      pressureTag: W('giant_lid', C.pressureTag), hotTag: W('giant_hot', C.t120), fasterTag: W('giant_food', C.fasterTag),
      coolerTag: W('payoff_cool', C.coolerTag, C.slowerTag - 0.05), slowerTag: W('payoff_cool', C.slowerTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, cooker, camera, overlay, cues: C };
}
