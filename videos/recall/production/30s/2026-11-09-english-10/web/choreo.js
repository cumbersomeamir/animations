// Shots, acting, screen states, giant states and cameras for "Sunglasses on, and your phone goes black" (Recall,
// english-10). Everything is a pure function of t.
//
// Model (illustrative): the screen's light leaves its top filter vibrating one way (horizontal when the phone is upright);
// polarized sunglasses pass only one direction (vertical) to cut glare, which bounces off water and roads vibrating
// sideways. Through the lens, the screen's brightness follows cos^2 of the angle between the two directions (Malus), so an
// upright phone looks black and a phone turned 90 degrees looks normal.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const GIANT = [30, 0, 0];
export const PHONE_FLAT = [0.1, 0.9555, -0.08];
/** brightness through a vertical-axis lens for a screen whose filter is rotated by phi from horizontal */
export const throughLens = phi => Math.sin(phi) ** 2;

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [4.2, 24.9, 27.6, 29.3];

  // phone rotation in the hand (0 = upright, pi/2 = sideways)
  function phoneRot(t) {
    if (t < C.rotate1) return 0.09 * Math.sin(2 * Math.PI * 2.6 * (t - 1.25)) * win(t, 1.25, 2.35, 0.15, 0.15);   // puzzled little shake
    if (t < 19.15) return (Math.PI / 2) * seg(t, C.rotate1, C.rotate1 + 0.5, E.io);
    if (t < 20.95) return (Math.PI / 2) * seg(t, C.rotate2, C.rotate2 + 1.4, E.io);
    return Math.PI / 2;
  }
  const glassesOn = t => (t < 19.15 ? seg(t, C.glassesOn, C.glassesOn + 0.25, E.out) : 1);
  function screen(t) {
    const g = glassesOn(t), phi = phoneRot(t);
    return { bright: (1 - g) + g * throughLens(phi), rot: phi };
  }

  const testHand = t => test(t).hand;
  // ---------------- performer (behind the counter; sunglasses on the head except in the test shot)
  function person(t) {
    const q = { pos: ROOT, yaw: 0 };
    const test = (t >= 20.95 && t < 23.95) ? 1 : 0;   // the test shot is its own cut
    q.handR = test > 0.5 ? testHand(t) : V(0.08, 1.3, -0.2); q.phoneUp = 1;
    q.handL = V(-0.22, 0.985, -0.32);
    q.lean = key(t, [[0, 0.06], [20.95, 0.14], [23.95, 0.06], [30, 0.04]]);
    q.tilt = key(t, [[0, 0], [3.6, 0], [3.9, 0.06], [4.9, 0.06], [23.95, 0], [24.5, 0.05], [26.35, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.35], [3.6, 0.3], [3.85, 0.05], [4.9, 0.12], [20.95, 0.4], [23.95, 0.3], [24.8, 0.25], [26.35, 0.05], [30, 0.0]]);
    q.headYaw = key(t, [[0, 0], [3.85, 0.1], [4.9, 0.0], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [3.6, 0.0], [3.9, 0.12], [4.9, 0.1], [23.95, 0], [30, 0.03]]);
    q.look = key(t, [[0, [0, -0.5]], [3.6, [0, -0.5]], [3.85, [0, 0.12]], [4.9, [0.1, 0.1]], [23.95, [0, -0.5]], [25.0, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = key(t, [[0, 0.1], [30, 0]]);
    const brow = key(t, [[0, 0.2], [3.6, 0.2], [3.8, 1.0], [4.9, 0.7], [23.95, 0.3], [30, 0.4]]);
    q.browL = brow; q.browR = brow; q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.2], [3.6, 0.3], [3.9, 0.7], [4.9, 0.6], [23.95, 0.4], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.35 * pulse(t, 3.6, 4.2) + 0.2 * pulse(t, 24.7, 25.2);
    q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- test shot: sunglasses held over the phone lying flat, one lens over the screen, rotated from aligned
  // (clear) to crossed (dark) about that lens. Rotation (XYZ) = (-pi/2, 0, yaw): local x -> world (cos yaw, 0, -sin yaw).
  const LENS_OVER = [PHONE_FLAT[0], PHONE_FLAT[1] + 0.075, PHONE_FLAT[2] + 0.004];
  function test(t) {
    const r = seg(t, C.testRot, C.testRot + 0.75, E.io);
    const yaw = (Math.PI / 2) * (1 - r);            // pi/2: lens axis along the phone's filter (clear); 0: crossed (dark)
    const c = Math.cos(yaw), s = Math.sin(yaw), at = d => V(LENS_OVER[0] + d * c, LENS_OVER[1], LENS_OVER[2] - d * s);
    return { yaw, dark: 1 - Math.sin(yaw) ** 2, lens: V(...LENS_OVER), group: at(0.036), hand: at(0.125).add(V(0, 0.012, 0)) };
  }

  // ---------------- giant states
  function giant(t, shot) {
    return {
      panel: seg(t, C.backlight, C.backlight + 0.4), before: seg(t, C.backlight + 0.2, C.backlight + 0.7), after: seg(t, C.filter, C.filter + 0.9, E.out),
      sun: seg(t, C.sun, C.sun + 0.5), incoming: seg(t, C.sun + 0.3, C.sun + 1.0), glare: seg(t, C.glare, C.glare + 0.6, E.out),
      phoneLight: seg(t, C.cross - 0.4, C.cross + 0.2), turn: seg(t, C.turnGiant, C.turnGiant + 0.5, E.io), pass: seg(t, C.turnGiant + 0.45, C.turnGiant + 1.0, E.out),
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, ph = V(...PHONE_FLAT);
    switch (s.id) {
      case 'hook_pov': case 'rotate_pov': {
        const eye = W.head.clone().add(V(-0.01, -0.02, 0.06)), toPhone = W.phone.clone().sub(eye);
        const side = clamp(phoneRot(t) / (Math.PI / 2), 0, 1);
        const k = s.id === 'hook_pov' ? 0.22 + 0.13 * seg(t, 0.4, C.rotate1, E.io) - 0.26 * side : 0.27 - 0.22 * side + 0.03 * u;   // hook: slow push-in
        return { pos: eye.clone().add(toPhone.clone().multiplyScalar(k)), target: W.phone.clone(), fov: 44 };
      }
      case 'react': return { pos: L(V(0.4, 1.48, 0.95), V(0.34, 1.5, 0.86)), target: L(V(0.06, 1.52, -0.42), V(0.04, 1.54, -0.42)), fov: 46 };
      case 'take_cu': return { pos: L(V(0.3, 1.62, 0.6), V(0.24, 1.62, 0.52)), target: head.clone().add(V(0.02, -0.12, 0)), fov: 40 };
      case 'test_cu': return { pos: L(ph.clone().add(V(0.012, 0.43, 0.12)), ph.clone().add(V(0.008, 0.40, 0.11))), target: ph.clone().add(V(0.012, 0, -0.012)), fov: 44 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      case 'giant_screen': return { pos: L(G.clone().add(V(1.2, 3.5, 3.8)), G.clone().add(V(1.0, 3.4, 3.5))), target: G.clone().add(V(-1.6, 1.55, -0.15)), fov: 46 };
      case 'giant_glare': return { pos: L(G.clone().add(V(3.9, 2.4, 5.2)), G.clone().add(V(3.75, 2.35, 4.95))), target: G.clone().add(V(1.95, 1.7, 0.9)), fov: 52 };
      case 'giant_cross': return { pos: L(G.clone().add(V(3.0, 4.3, 3.9)), G.clone().add(V(2.85, 4.15, 3.65))), target: G.clone().add(V(1.35, 1.72, -0.4)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    return {
      lens: (shot === 'hook_pov' || shot === 'rotate_pov') ? glassesOn(t) : 0,
      allTag: win(t, 5.4, 9.25, 0.2, 0.05), filterTag: win(t, 6.0, 9.25, 0.2, 0.05), oneTag: win(t, 6.6, 9.25, 0.2, 0.05),
      lensTag: win(t, 9.6, 14.75, 0.2, 0.05), glareTag: win(t, C.glare + 0.2, 14.75, 0.2, 0.05), blockTag: win(t, C.blocked, 14.75, 0.2, 0.05),
      crossTag: win(t, 15.4, C.turnGiant, 0.2, 0.15), passTag: win(t, C.turnGiant + 0.6, 19.15, 0.2, 0.05),
      testTag: win(t, C.testRot + 0.8, 23.95, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, phoneRot, screen, glassesOn, test, giant, camera, overlay, cues: C };
}
