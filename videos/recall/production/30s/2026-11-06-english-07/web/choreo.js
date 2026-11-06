// Shots, acting, phone-screen states, charge model and cameras for "Why your phone rushes to 80%, then crawls"
// (Recall, english-07). Everything is a pure function of t.
//
// Charge model (illustrative, after TI SLAA287B and Apple's two-stage description): constant current until the battery
// voltage reaches its limit (here at the 80% ring), then the voltage is held and the current falls away exponentially,
// so the fill rate (proportional to current) slows down and the level creeps toward full.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const GIANT = [30, 0, 0];
export const PHONE_SUN = [0.2, 0.9555, -0.02], PHONE_SHADE = [-0.24, 0.9555, 0.07];
export const GLASS_POS = [-0.05, 0.95, -0.12], CARAFE_REST = [0.36, 0.95, -0.2], CHARGER_POS = [0.34, 0.95, -0.33];
export const SUN_AT = [0.2, 0.952, -0.02];

// constant current -> constant voltage (giant battery)
const T0 = 4.95, TCV = 10.1, L0 = 0.30, LCV = 0.80, TAU = 1.5, RATE = (LCV - L0) / (TCV - T0);
export function charge(t) {
  if (t < T0) return { level: L0, I: 1, V: 0.40 };
  if (t < TCV) { const u = (t - T0) / (TCV - T0); return { level: L0 + RATE * (t - T0), I: 1, V: 0.40 + 0.45 * (1 - (1 - u) ** 1.6) }; }
  const d = t - TCV, I = Math.exp(-d / TAU);
  return { level: LCV + RATE * TAU * (1 - I), I, V: 0.85 };
}

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [1.2, 3.6, 8.0, 12.4, 17.3, 20.8, 24.0, 27.6, 29.3];

  // ---------------- phone on the counter (slides into the shade in the takeaway)
  function phonePos(t) {
    const u = seg(t, C.slide, C.slideDone, E.io);
    const a = V(...PHONE_SUN), b = V(...PHONE_SHADE);
    const p = a.clone().lerp(b, u); p.z = a.z + (b.z - a.z) * seg(t, C.slide, C.slide + 0.35, E.io);
    return p;
  }
  // ---------------- carafe pour (13.1-15.7)
  const tiltAt = t => key(t, [[0, 0], [13.15, 0], [13.45, 1.12, E.out], [C.pourSlow, 1.12], [C.pourSlow + 0.5, 0.93], [15.15, 0.93], [15.5, 0.0, E.in], [30, 0]]);
  const lift = t => win(t, 12.9, 15.75, 0.25, 0.25);
  const glassLevel = t => 0.05 + 0.6 * seg(t, 13.45, C.pourSlow + 0.2, E.lin) + 0.27 * seg(t, C.pourSlow + 0.2, 15.2, E.out);
  const pourRate = t => (t < 13.42 || t > 15.2) ? 0 : t < C.pourSlow + 0.2 ? 1 : 0.28;

  // ---------------- performer (behind the counter; legs hidden)
  function person(t, W) {
    const q = { pos: ROOT, yaw: 0 };
    const restL = V(-0.22, 0.985, -0.32), restR = V(0.24, 0.985, -0.3);
    // left hand drums on the counter while waiting (react)
    const drum = win(t, C.drum - 0.2, 4.85, 0.2, 0.2);
    q.handL = restL.clone().add(V(0.02 * drum, 0.016 * drum * Math.max(0, Math.sin(2 * Math.PI * 5.5 * t)), 0.04 * drum));
    // right hand: carafe during the pour; touches the warm phone; slides it into the shade
    let hr = restR.clone();
    const L = lift(t);
    if (L > 0.001) hr = restR.clone().lerp(W.carafeHandle, E.io(L));
    const touch = win(t, C.touch - 0.25, C.touch + 0.55, 0.25, 0.2);
    if (touch > 0) hr = hr.lerp(W.phone.clone().add(V(0.03, 0.03 - 0.02 * pulse(t, C.touch, C.touch + 0.3), -0.075)), touch).add(V(0.02 * Math.sin(t * 40) * pulse(t, C.touch + 0.3, C.touch + 0.8), 0.04 * pulse(t, C.touch + 0.3, C.touch + 0.8), 0));
    const slideK = win(t, C.slide - 0.3, C.slideDone + 0.35, 0.3, 0.3);
    if (slideK > 0) hr = hr.lerp(W.phone.clone().add(V(0.02, 0.022, 0.05)), slideK);
    q.handR = hr;
    q.lean = key(t, [[0, 0.12], [2.3, 0.14], [4.85, 0.1], [13.1, 0.12], [15.7, 0.08], [18.7, 0.14], [21, 0.1], [23.6, 0.16], [25, 0.06], [30, 0.04]]);
    q.twist = key(t, [[0, 0], [13.1, -0.05], [15.7, 0], [23.6, 0.08], [24.4, -0.06], [25, 0], [30, 0]]);
    q.tilt = key(t, [[0, 0], [2.6, 0], [3.0, 0.06], [4.85, 0.06], [18.7, 0], [19.9, 0], [20.2, -0.05], [21, 0], [25.2, 0], [25.6, 0.05], [26.35, 0.02], [30, 0.03]]);
    const down = 0.45;
    q.headPitch = key(t, [[0, down], [2.3, down], [3.3, 0.3], [4.85, down], [13.1, 0.42], [15.7, 0.4], [18.7, 0.45], [19.95, 0.15], [20.6, 0.4], [23.6, 0.45], [24.6, 0.4], [25.0, 0.05], [26.35, 0.0], [30, 0.0]]);
    q.headYaw = key(t, [[0, 0], [3.3, 0.12], [4.0, -0.05], [4.85, 0], [19.95, 0.1], [20.6, 0], [25.4, 0.08], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [2.6, 0], [3.0, 0.08], [4.85, 0.08], [18.7, 0], [30, 0.03]]);
    q.look = key(t, [[0, [0, -0.7]], [2.3, [0, -0.7]], [3.3, [0.3, 0.1]], [3.9, [-0.2, 0.15]], [4.6, [0, -0.6]], [18.7, [0, -0.7]], [19.95, [0, 0.12]], [20.6, [0, -0.6]], [25.0, [0, -0.5]], [25.3, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = key(t, [[0, 0.15], [1.6, 0.0], [2.3, 0.35], [4.85, 0.4], [18.7, 0.2], [19.9, 0.0], [20.2, 0.5], [21, 0.3], [25, 0], [30, 0]]);
    const brow = key(t, [[0, 0.3], [1.2, 0.9], [1.7, 0.6], [2.3, -0.1], [4.85, -0.2], [18.7, 0.1], [19.85, 0.1], [20.0, 1.0], [20.6, 0.6], [21, 0.2], [25.0, 0.3], [25.3, 0.9], [26.35, 0.5], [30, 0.4]]);
    q.browL = brow + key(t, [[0, 0], [2.6, 0], [3.0, 0.5], [4.85, 0.5], [5, 0], [30, 0]]); q.browR = brow;
    q.browAngle = key(t, [[0, 0.1], [2.3, -0.3], [4.85, -0.35], [18.7, 0.1], [21, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.5], [1.6, 0.6], [2.3, 0.0], [4.85, 0.0], [13.1, 0.2], [15.7, 0.3], [18.7, 0.1], [19.9, 0.0], [20.6, 0.0], [23.6, 0.2], [C.smile, 0.5], [25.5, 0.95], [30, 0.9]]);
    q.open = 0.4 * pulse(t, 19.9, 20.45) + 0.2 * pulse(t, 25.3, 25.8);
    q.frown = key(t, [[0, 0], [2.3, 0.0], [2.8, 0.35], [4.85, 0.35], [18.7, 0], [20.2, 0.3], [21, 0.2], [23.6, 0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- real phone screen
  function screen(t) {
    let pct;
    if (t < 1.6) pct = 41 + 39 * E.out(clamp((t - 0.1) / 1.5));
    else pct = 80 + Math.min(2, Math.floor((t - 1.6) / 1.1));   // crawls: 80 -> 81 (2.7 s) -> 82 (3.8 s), then holds
    const warm = seg(t, 19.2, 20.3) * (1 - seg(t, C.slideDone, C.resume + 0.4));
    const paused = t > 20.5 && t < C.resume ? 1 : 0;
    return { pct: Math.floor(pct), charging: paused ? 0 : 1, paused, warm, ok: seg(t, C.resume, C.resume + 0.3, E.back) * (t < 26.35 ? 1 : 0) };
  }

  // ---------------- giant battery states
  function giant(t) {
    const c = charge(t), g = { ...c };
    if (t >= 21.0) {   // warm scenario: just past the 80% ring, too warm -> charging pauses
      g.level = 0.82; g.V = 0.85;
      g.warm = seg(t, C.heatStart, C.heatStart + 0.6);
      g.I = t < C.pause ? 0.18 : 0; g.paused = seg(t, C.pause, C.pause + 0.3, E.back);
    } else { g.warm = 0; g.paused = 0; }
    g.ring = 1;
    g.hold = t >= TCV && t < 21 ? 1 : 0;
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, ph = W.phone;
    switch (s.id) {
      case 'hook_cu': return { pos: L(ph.clone().add(V(0.0, 0.3, 0.16)), ph.clone().add(V(0.0, 0.27, 0.13))), target: ph.clone().add(V(0, 0, -0.01)), fov: 40 };
      case 'react': return { pos: L(V(0.5, 1.4, 0.98), V(0.44, 1.42, 0.9)), target: L(V(0.1, 1.56, -0.45), V(0.08, 1.58, -0.45)), fov: 46 };
      case 'pour_cu': return { pos: L(V(-0.5, 1.16, 0.52), V(-0.44, 1.14, 0.46)), target: V(GLASS_POS[0] + 0.07, 1.07, GLASS_POS[2]), fov: 42 };
      case 'sun_cu': return { pos: L(ph.clone().add(V(-0.12, 0.36, 0.34)), ph.clone().add(V(-0.1, 0.33, 0.3))), target: ph.clone().add(V(0.0, 0.03, -0.06)), fov: 44 };
      case 'shade_cu': return { pos: ph.clone().add(V(0.05 - 0.03 * u, 0.4, 0.36)), target: ph.clone().add(V(0.03, 0.0, -0.07)), fov: 48 };
      case 'smile': return { pos: L(V(0.24, 1.68, 0.5), V(0.18, 1.68, 0.4)), target: head.clone().add(V(0, -0.03, 0)), fov: 34 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      case 'giant_cc': return { pos: L(G.clone().add(V(0.5, 2.3, 8.2)), G.clone().add(V(0.25, 2.2, 7.5))), target: G.clone().add(V(0, 2.0, 0)), fov: 50 };
      case 'giant_cv': return { pos: L(G.clone().add(V(-0.6, 2.7, 7.0)), G.clone().add(V(-0.35, 2.75, 6.4))), target: G.clone().add(V(0.1, 2.15, 0)), fov: 50 };
      case 'giant_ease': return { pos: L(G.clone().add(V(0.7, 3.7, 3.1)), G.clone().add(V(0.5, 3.6, 2.6))), target: G.clone().add(V(0, 2.95, 0)), fov: 46 };
      case 'giant_heat': return { pos: L(G.clone().add(V(0.5, 2.5, 7.8)), G.clone().add(V(0.4, 2.45, 7.2))), target: G.clone().add(V(0.15, 2.15, 0)), fov: 50 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      curTag: win(t, 5.6, 9.2, 0.2, 0.05), voltTag: win(t, 6.4, 9.2, 0.2, 0.05), ringTag: win(t, 7.3, 9.2, 0.2, 0.05),
      holdTag: win(t, C.vHold, 13.1, 0.2, 0.05), shrinkTag: win(t, C.iShrink, 13.1, 0.2, 0.05),
      slowTag: win(t, C.pourSlow + 0.1, 15.7, 0.2, 0.05), gentleTag: win(t, 16.2, 18.7, 0.25, 0.05),
      warmTag: win(t, 19.3, 21.0, 0.2, 0.05), hotTag: win(t, C.heatStart + 0.3, 23.6, 0.2, 0.05), pauseTag: win(t, C.pause + 0.1, 23.6, 0.2, 0.05),
      shadeTag: win(t, C.slide + 0.2, 25.0, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, screen, giant, camera, overlay, phonePos, tiltAt, glassLevel, pourRate, cues: C };
}
