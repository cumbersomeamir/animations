// Illustrative heating model for "Why a microwave leaves cold patches" (Recall round 02).
// Not a physics simulation of a real oven: it encodes the sourced ideas visually.
//  * Standing waves leave fixed strong and weak spots in the cavity (TU Delft, ShowingPhysics demo 15.15).
//  * The turntable carries food through that fixed pattern (TU Delft).
//  * In thick food the waves mostly heat the outer layers; the middle heats mainly by conduction (FDA).
//  * Stirring and standing time let heat distribute evenly (Clemson Cooperative Extension HGIC 3586).
import { clamp } from './anim.js';

// giant cavity (metres, centred on the turntable axis): width x, height y, depth z
export const CAV = { W: 3.4, H: 2.1, D: 2.6 };

/** Field strength 0..1 on the food plane at cavity coords (x, z). A node (weak spot) sits on the turntable axis. */
export function field(x, z) {
  const { W, D } = CAV;
  const a = Math.sin(4 * Math.PI * (x + W / 2) / W) ** 2 * Math.sin(4 * Math.PI * (z + D / 2) / D) ** 2;
  const b = Math.sin(3 * Math.PI * (x + W / 2) / W) ** 2 * Math.sin(5 * Math.PI * (z + D / 2) / D) ** 2;
  return 0.86 * a + 0.14 * b;
}

/** Antinode positions (strong spots) inside the cavity for the glowing pattern. */
export function antinodes() {
  const { W, D } = CAV, out = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = -W / 2 + (i + 0.5) * W / 4, z = -D / 2 + (j + 0.5) * D / 4;
    out.push({ x, z, s: field(x, z) });
  }
  return out;
}

/** Bowl profile (scale-free, rim radius 1): outer/inner radius as a function of height, used by both bowls. */
export const BOWL = { h: 0.72, rb: 0.46, wall: 0.07, base: 0.08, food: 0.6 };
export const rOut = y => BOWL.rb + (1 - BOWL.rb) * Math.pow(clamp(y / BOWL.h), 0.62);
export const rIn = y => Math.max(0, rOut(y) - BOWL.wall);

/** Food top height at radius r (0..1); mound in the middle until it is spread flat. */
export const foodTop = (r, mound) => BOWL.food + mound * 0.14 * Math.max(0, 1 - r * r / 0.7);

// ---------------------------------------------------------------- top-surface heat map (turntable shot)
export const NR = 22, NS = 72;
/** Simulates heating of the food surface while the turntable turns: returns T[NR*NS] in 0..1. */
export function topHeat(t, t0, omega, R) {
  const T = new Float32Array(NR * NS);
  if (t <= t0) return T;
  const dt = 1 / 60, steps = Math.min(400, Math.round((t - t0) / dt));
  const tmp = new Float32Array(NR * NS);
  for (let s = 0; s < steps; s++) {
    const th = omega * s * dt, c = Math.cos(th), sn = Math.sin(th);
    for (let i = 0; i < NR; i++) {
      const r = (i + 0.5) / NR, g = 0.42 + 1.05 * r * r * r;     // thin food near the rim heats through faster
      for (let j = 0; j < NS; j++) {
        const a = 2 * Math.PI * j / NS, x = r * R * Math.cos(a), z = r * R * Math.sin(a);
        T[i * NS + j] += 1.5 * dt * field(c * x - sn * z, sn * x + c * z) * g;
      }
    }
    if (s % 6 === 5) {   // gentle conduction along the surface
      tmp.set(T);
      for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) {
        const k = i * NS + j, l = i * NS + (j + NS - 1) % NS, rr = i * NS + (j + 1) % NS;
        const up = i < NR - 1 ? k + NS : k, dn = i > 0 ? k - NS : k;
        T[k] = tmp[k] * 0.84 + 0.04 * (tmp[l] + tmp[rr] + tmp[up] + tmp[dn]);
      }
    }
  }
  for (let k = 0; k < T.length; k++) T[k] = clamp(T[k]);
  return T;
}

// ---------------------------------------------------------------- vertical cross-section heat field
/**
 * T at (rho, y) in bowl units (rho -1..1, y 0..1) for the section shots.
 * st = { shell (0..1, heating of the outer layers), depth (penetration of the warm band), mix (0..1, stirred),
 *        even (0..1, standing time), mound }
 */
export function sectionT(rho, y, st) {
  const r = Math.abs(rho), top = foodTop(r, st.mound);
  const dTop = top - y, dWall = rIn(y) - r, dBot = y - BOWL.base;
  const d = Math.max(0, Math.min(dTop, dWall * 0.9, dBot * 0.9));
  let T = st.shell * Math.exp(-d / st.depth);
  if (st.mix > 0) {   // stirred: hot and cold folded together into a marbled swirl around the mean
    const mean = 0.55, sw = 0.5 + 0.5 * Math.sin(9 * rho + 14 * y + 5 * Math.sin(4 * rho * y));
    const marbled = mean + (sw - 0.5) * 0.7;
    T = T + (marbled - T) * st.mix;
  }
  if (st.even > 0) T = T + (0.68 - T) * st.even;
  return clamp(T);
}

// ---------------------------------------------------------------- colour map (cold blue-grey -> warm -> hot)
const STOPS = [[0, [0.40, 0.55, 0.66]], [0.3, [0.62, 0.71, 0.74]], [0.55, [0.93, 0.78, 0.52]], [0.8, [0.93, 0.52, 0.22]], [1, [0.80, 0.25, 0.15]]];
export function heatRGB(T) {
  for (let i = 1; i < STOPS.length; i++) if (T <= STOPS[i][0]) {
    const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], u = (T - a) / (b - a);
    return [ca[0] + (cb[0] - ca[0]) * u, ca[1] + (cb[1] - ca[1]) * u, ca[2] + (cb[2] - ca[2]) * u];
  }
  return STOPS[STOPS.length - 1][1];
}
