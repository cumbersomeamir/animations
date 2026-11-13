// Shots, acting, the elevator ride, scale readings, force arrows and cameras for "Why an elevator feels heavier as it starts
// rising" (Recall, english-13). Everything is a pure function of t.
//
// Physics (OpenStax College Physics 2e, Example 4.9): a 75.0 kg rider, elevator accelerating upward at 1.20 m/s², scale force
// F = m(g + a) = 825 N vs weight mg = 735 N (g = 9.80 m/s²). A kitchen-style bathroom scale shows F/g in kg: 84.2 kg while
// speeding up, 75.0 kg at constant speed, and (illustrative, same 1.20 m/s² while slowing) 65.8 kg while slowing.
// The ride's timing is compressed for the story: the car's speed profile (speed up → steady → slow down) is illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // the performer's café position (CTA)
export const SHAFT = [30, 0, 0];
const G = 9.80, M = 75.0, A = 1.20;
export const READ = { rest: M, up: M * (G + A) / G, slow: M * (G - A) / G };   // 75.0, 84.2, 65.8 (kg shown)
export const ARROW_K = 1.25;                       // metres of arrow per 735 N (the rider's weight)

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [2.9, 9.0, 15.2, 21.4, 27.6, 29.3];
  // ---------------- the ride: speed up (start → cruise), steady (cruise → slow), slow down (slow → stop); stops at floor 9
  const T1 = C.cruise - C.start, T2 = C.slow - C.cruise, T3 = C.stop - C.slow;
  const VMAX = (8 * 3.2) / (0.5 * T1 + T2 + 0.5 * T3);
  function ride(t) {
    if (t <= C.start) return { y: 0, v: 0, phase: 'rest' };
    if (t < C.cruise) { const u = t - C.start; return { y: 0.5 * (VMAX / T1) * u * u, v: VMAX * u / T1, phase: 'up' }; }
    const y1 = 0.5 * VMAX * T1;
    if (t < C.slow) return { y: y1 + VMAX * (t - C.cruise), v: VMAX, phase: 'steady' };
    const y2 = y1 + VMAX * T2;
    if (t < C.stop) { const u = t - C.slow; return { y: y2 + VMAX * u - 0.5 * (VMAX / T3) * u * u, v: VMAX * (1 - u / T3), phase: 'slow' }; }
    return { y: y2 + 0.5 * VMAX * T3, v: 0, phase: 'stopped' };
  }
  // ---------------- what the scale shows (kg), with short transitions
  function reading(t) {
    let r = READ.rest;
    r += (READ.up - READ.rest) * seg(t, C.start, C.jumpEnd, E.out);
    r += (READ.rest - READ.up) * seg(t, C.cruise, C.cruise + 0.25, E.io);
    r += (READ.slow - READ.rest) * seg(t, C.slow, C.slow + 0.25, E.io);
    r += (READ.rest - READ.slow) * seg(t, C.stop, C.stop + 0.25, E.io);
    return r;
  }

  // ---------------- performer
  function person(t, shot) {
    const q = { yaw: 0 };
    q.lean = 0.02;
    q.tilt = key(t, [[0, 0], [3.6, 0], [4.2, 0.05], [7.6, 0.03], [20.4, 0.0], [26.35, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.55], [1.1, 0.55], [3.4, 0.5], [4.4, 0.45], [5.6, 0.1], [6.8, 0.05], [7.58, 0.0], [20.3, -0.05], [21.0, 0.3], [23.0, 0.05], [26.35, 0.05], [27.2, 0.0], [30, 0]]);
    q.headYaw = key(t, [[0, 0], [6.8, 0]]) + 0.22 * Math.sin(2 * Math.PI * 2.2 * (t - C.no)) * win(t, C.no, C.no + 0.75, 0.08, 0.15) + key(t, [[7.58, 0], [12, 0.08], [16, -0.05], [20, 0], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [4.4, 0.0], [5.4, 0.1], [6.6, 0.08], [7.58, 0], [30, 0.02]]);
    q.look = key(t, [[0, [0, -0.55]], [4.4, [0, -0.5]], [5.4, [0, 0.12]], [7.58, [0, 0.12]], [8, [0.1, 0.25]], [20.3, [0.1, 0.25]], [21, [0, -0.4]], [23, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0;
    const brow = key(t, [[0, 0.2], [0.9, 0.2], [1.2, 1.0], [3.4, 0.9], [5.4, 1.0], [6.8, 0.5], [7.6, 0.3], [20.3, 0.3], [30, 0.4]]);
    q.browL = brow; q.browR = brow; q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.3], [1.1, 0.2], [3.4, 0.25], [6.85, 0.3], [7.3, 0.7], [7.6, 0.5], [20.3, 0.5], [21.5, 0.85], [26.35, 0.7], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.3 * pulse(t, 1.1, 1.6) + 0.2 * pulse(t, 5.4, 6.0);
    q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    q.belly = win(t, 5.35, 6.75, 0.25, 0.25);                  // right hand to the belly ("did you gain nine kilos?")
    return q;
  }

  // ---------------- force arrows (shaft shots): lengths in metres, drawn to scale (ARROW_K per 735 N)
  function arrows(t, shot) {
    const on = shot.startsWith('shaft');
    const N = reading(t) / M;                                  // scale force / weight
    return {
      push: on ? seg(t, C.pushArrow, C.pushArrow + 0.45, E.out) : 0, grav: on ? seg(t, C.gravArrow, C.gravArrow + 0.45, E.out) : 0,
      ratio: N, guide: on ? seg(t, C.extra - 0.2, C.extra + 0.3) : 0,
    };
  }

  // ---------------- cameras (every shot moves); W.car = the car's world position (floor centre)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, c = W.car;
    const L = (a, b, e = E.io) => c.clone().add(a.clone().lerp(b, e(u)));
    switch (s.id) {
      case 'hook_scale': return { pos: L(V(0.05, 0.66, 0.64), V(0.04, 0.56, 0.5)), target: c.clone().add(V(0, 0.07, 0.12)), fov: 40 };
      case 'react': return { pos: L(V(0.45, 1.05, 2.45), V(0.38, 1.1, 2.15)), target: c.clone().add(V(0.0, 1.58, 0.0)), fov: 46 };
      case 'shaft_up': return { pos: L(V(2.0, 1.5, 4.3), V(1.6, 1.45, 3.9)), target: c.clone().add(V(0.0, 1.15, 0.0)), fov: 48 };
      case 'shaft_cruise': return { pos: L(V(-1.6, 1.8, 4.2), V(-1.35, 1.7, 3.9)), target: c.clone().add(V(0.0, 1.15, 0.0)), fov: 48 };
      case 'shaft_slow': return { pos: L(V(0.9, 0.9, 3.9), V(0.7, 0.95, 3.6)), target: c.clone().add(V(0.0, 1.2, 0.0)), fov: 48 };
      case 'payoff': return { pos: L(V(0.25, 1.05, 3.4), V(0.15, 1.1, 3.05)), target: c.clone().add(V(0.0, 1.5, 0.0)), fov: 46 };
      case 'cafe_wide': { const a = s.u; return { pos: V(0.0, 1.72, 2.4).lerp(V(0.02, 1.82, 2.8), E.io(a)), target: V(-0.02, 1.36, -0.35).lerp(V(0.0, 1.4, -0.42), E.io(a)), fov: 46 }; }
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const shaft = shot.startsWith('shaft');
    return {
      chip: shaft ? win(t, 7.7, 20.33, 0.25, 0.05) : 0, reading: reading(t),
      pushTag: shot === 'shaft_up' ? win(t, C.pushArrow + 0.1, C.extra, 0.2, 0.2) : 0,
      gravTag: shot === 'shaft_up' ? win(t, C.gravArrow + 0.1, C.extra, 0.2, 0.2) : 0,
      extraTag: shot === 'shaft_up' ? win(t, C.extra + 0.1, 13.63, 0.2, 0.05) : 0,
      equalTag: shot === 'shaft_cruise' ? win(t, C.cruise + 0.4, 16.88, 0.2, 0.05) : 0,
      lessTag: shot === 'shaft_slow' ? win(t, C.slow + 0.4, 20.33, 0.2, 0.05) : 0,
      mass: shot === 'payoff' ? win(t, C.massTag, 26.35, 0.25, 0.05) : 0,
      graph: shot === 'payoff' ? [seg(t, C.graph, C.graph + 0.7), seg(t, C.graph + 0.8, C.graph + 1.5), seg(t, C.graph + 1.6, C.graph + 2.3)] : [0, 0, 0],
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, ride, reading, person, arrows, camera, overlay, cues: C, VMAX };
}
