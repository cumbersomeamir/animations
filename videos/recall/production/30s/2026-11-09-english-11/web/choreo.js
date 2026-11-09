// Shots, acting, prop states, giant states and cameras for "Why is the food steaming but the plate still cool?" (Recall,
// english-11). Everything is a pure function of t.
//
// Model (illustrative): microwaves are absorbed by the water in food (dielectric heating: the field tugs the water
// molecules back and forth); a glass or microwave-safe ceramic plate barely absorbs them, so it warms by conduction from
// the hot food; porous clay that has soaked up water, or an iron-rich glaze, absorbs them and heats the pottery itself.
// The molecule wiggle is slowed down enormously (the real field reverses billions of times a second).
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const GIANT = [30, 0, 0];
export const PLATE_POS = [0.0, 0.951, -0.1];      // the plate of food on the counter (hook)
export const MW_POS = [0.5, 0.95, -0.08], MW_ROT = -0.75;
export const RIM_R = [0.07, 0.024, -0.095], RIM_L = [-0.075, 0.024, -0.09];   // where the hands hold the rim (plate-local)

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [2.6, 13.0, 24.4, 27.8, 29.4];

  // ---------------- the plate of food: on the counter, then lifted and held at chest height
  function plate(t) {
    const rest = V(...PLATE_POS), held = V(0.04, 1.16, -0.3);
    const l = seg(t, C.lift, C.lift + 0.55, E.io);
    const p = rest.clone().lerp(held, l);
    p.y += 0.006 * Math.sin(t * 2.1) * l;                       // a little life while held
    return { pos: p, tilt: -0.12 * l, held: l > 0 };
  }
  const grab = t => seg(t, C.grab - 0.3, C.grab, E.out);

  // ---------------- performer (behind the counter)
  function person(t) {
    const q = { pos: ROOT, yaw: 0 };
    q.lean = key(t, [[0, 0.12], [C.lift + 0.6, 0.05], [30, 0.04]]);
    q.tilt = key(t, [[0, 0], [2.2, 0], [2.6, 0.08], [3.2, 0.06], [26.35, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.45], [C.lift + 0.4, 0.35], [2.2, 0.32], [2.7, 0.18], [3.28, 0.2], [26.35, 0.1], [27.2, 0.0], [30, 0.0]]);
    q.headYaw = key(t, [[0, 0], [2.4, 0.06], [3.2, -0.04], [26.35, 0], [30, 0.04]]);
    q.headRoll = key(t, [[0, 0], [2.3, 0], [2.7, 0.12], [3.28, 0.1], [26.35, 0.02], [30, 0.04]]);
    q.look = key(t, [[0, [0, -0.5]], [2.3, [0, -0.45]], [2.6, [0.05, 0.1]], [3.28, [0.05, 0.1]], [26.35, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0;
    const brow = key(t, [[0, 0.2], [2.2, 0.25], [2.5, 1.0], [3.28, 0.8], [26.35, 0.4], [30, 0.4]]);
    q.browL = brow; q.browR = brow * 0.8; q.browAngle = 0.12;
    q.smile = key(t, [[0, 0.3], [2.3, 0.35], [2.7, 0.6], [3.28, 0.6], [26.35, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.28 * pulse(t, 2.45, 2.95) + 0.15 * pulse(t, 27.3, 27.8);
    q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    q.grab = grab(t);                                           // main.js puts the hands on the rim
    return q;
  }

  // ---------------- the dish test in the microwave
  function micro(t) {
    const door = (t < 19.9 || t >= 26.35) ? 0 : 1 - seg(t, C.doorClose, C.doorClose + 0.3, E.in) + seg(t, C.doorOpen, C.doorOpen + 0.35, E.back);   // open only for the test
    const run = t >= C.doorClose + 0.25 && t < C.doorOpen;
    const rem = 60 * (1 - seg(t, C.timer, C.timerEnd, E.lin));
    let text = '';
    if (t >= C.timer - 0.05 && t < C.doorOpen + 0.05) text = rem > 0.5 ? `${Math.floor(Math.ceil(rem) / 60)}:${String(Math.ceil(rem) % 60).padStart(2, '0')}` : 'END';
    if (t >= C.doorOpen + 0.05 && t < 26.35) text = 'END';
    return { door: clamp(door, 0, 1.05), lamp: run || (door > 0.05 && t > 20), text, run, turn: run ? (t - C.doorClose) * 1.2 : 0 };
  }

  // ---------------- giant states
  function giant(t) {
    return {
      waves: seg(t, C.waves, C.waves + 0.8), tug: seg(t, C.tug, C.tug + 0.6), heat: seg(t, C.heat, C.heat + 1.6, E.out),
      pass: seg(t, C.pass, C.pass + 0.9), conduct: seg(t, C.conduct, C.conduct + 1.6, E.out),
      soak: seg(t, C.soak, C.soak + 1.8, E.lin), potWaves: seg(t, C.potWaves, C.potWaves + 0.7), potGlow: seg(t, C.potGlow, C.potGlow + 1.4, E.out),
    };
  }

  // ---------------- thermal view (hook and the test result): wipe progress top → bottom
  function thermal(t, shot) {
    if (shot === 'hook_thermal') return seg(t, C.wipe, C.wipe + 0.5, E.io);
    if (shot === 'test_out') return seg(t, C.wipe2, C.wipe2 + 0.45, E.io);
    return 0;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const pl = V(...PLATE_POS), head = W.head;
    switch (s.id) {
      case 'hook_thermal': return { pos: L(pl.clone().add(V(0.07, 0.34, 0.34)), pl.clone().add(V(0.05, 0.3, 0.29))), target: pl.clone().add(V(0.0, 0.03, -0.03)), fov: 42 };
      case 'react': return { pos: L(V(0.36, 1.25, 1.15), V(0.31, 1.27, 1.02)), target: L(V(0.05, 1.5, -0.4), V(0.05, 1.51, -0.42)), fov: 52 };
      case 'giant_food': return { pos: L(G.clone().add(V(-0.75, 2.1, 5.2)), G.clone().add(V(-0.9, 2.0, 4.75))), target: G.clone().add(V(-1.4, 1.1, 0.4)), fov: 44 };
      case 'giant_plate': return { pos: L(G.clone().add(V(0.45, 1.35, 4.1)), G.clone().add(V(0.35, 1.3, 3.75))), target: G.clone().add(V(-0.25, 0.78, 0.45)), fov: 50 };
      case 'giant_pottery': return { pos: L(G.clone().add(V(2.9, 2.4, 6.0)), G.clone().add(V(2.75, 2.3, 5.5))), target: G.clone().add(V(2.0, 1.3, 0.0)), fov: 44 };
      case 'test_in': case 'test_out': return { pos: L(W.mwLocal(0.12, 0.36, 1.08), W.mwLocal(0.1, 0.34, 0.98)), target: W.mwLocal(0.05, 0.12, 0.0), fov: 40 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(0.05, 1.34, -0.35), V(0.05, 1.38, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    return {
      hotTag: win(t, 0.6, 2.0, 0.2, 0.05), coolTag: win(t, 0.9, 2.0, 0.2, 0.05),
      waveTag: win(t, C.waves + 0.3, 8.78, 0.2, 0.05), molTag: win(t, C.tug + 0.2, 8.78, 0.2, 0.05), dielTag: win(t, C.heat + 0.5, 8.78, 0.2, 0.05),
      passTag: win(t, C.pass + 0.6, 14.28, 0.2, 0.05), condTag: win(t, C.conduct + 0.3, 14.28, 0.2, 0.05), rimTag: win(t, C.conduct + 0.9, 14.28, 0.2, 0.05),
      soakTag: win(t, C.soak + 0.4, 20.03, 0.2, 0.05), ironTag: win(t, C.iron, 20.03, 0.2, 0.05), selfTag: win(t, C.potGlow + 0.5, 20.03, 0.2, 0.05),
      dishTag: win(t, 20.35, C.doorClose, 0.2, 0.15), cupTag: win(t, 21.9, C.doorClose, 0.2, 0.15), minTag: win(t, C.timer, C.doorOpen, 0.15, 0.1),
      safeTag: win(t, C.safeTag, 26.35, 0.2, 0.05), warmTag: win(t, C.warmTag, 26.35, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, plate, person, micro, giant, thermal, camera, overlay, cues: C };
}
