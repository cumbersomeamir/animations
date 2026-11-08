// Shots, acting, screen states, giant states and cameras for "Why does your phone ignore you once you put on gloves?"
// (Recall, english-09). Everything is a pure function of t.
//
// Model (illustrative): a capacitive screen senses the finger's charge through the glass (charge dots reach the sensor
// grid, the signal meter rises). A knit glove isolates the finger (dots stop at the yarn, meter stays low). A touchscreen
// glove's conductive thread carries the charge through (dots ride the lime thread). A resistive screen needs only a
// press: the flexible top sheet dents onto the lower layer between spacer dots and closes the circuit (finger or stylus).
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { ICON } from './screen.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const GIANT = [30, 0, 0];
export const PHONE_POS = [0.12, 0.9555, -0.05];
export const RES_A = [-0.32, 0.12], RES_B = [0.45, -0.12];   // resistive press points (stack-local x, z)

const press = (t, t0, a = 0.18, b = 0.24) => win(t, t0 - a, t0 + b, a * 0.8, b * 0.7);   // 0 -> 1 (contact) -> 0

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [2.9, 27.6, 29.3];

  // ---------------- real taps on the phone (finger height above the glass, 0 = contact)
  function taps(t) {
    const knitP = Math.max(press(t, C.tap1), press(t, C.tap2));
    return {
      knit: { vis: t < 2.2 ? 1 : 0, h: 0.04 * (1 - knitP), dx: 0.0 },
      bare: { vis: t > 1.05 && t < 2.2 ? 1 : 0, h: 0.04 * (1 - press(t, C.tapBare)) + 0.05 * (1 - seg(t, 1.05, 1.3, E.out)) },
      touch: { vis: t >= 24.7 && t < 26.35 ? 1 : 0, h: 0.04 * (1 - press(t, C.okTap)) + 0.05 * (1 - seg(t, 24.7, 24.85, E.out)) },
    };
  }
  function screen(t) {
    let ring = null, app = 0;
    for (const [c, ok] of [[C.tap1, false], [C.tap2, false], [C.tapBare, true], [C.okTap, true]]) {
      const u = (t - c) / (ok ? 0.45 : 0.35); if (u > 0 && u < 1) ring = { u, ok };
    }
    if (t < 24.7) app = seg(t, C.tapBare + 0.05, C.tapBare + 0.3, E.out);
    else app = seg(t, C.okTap + 0.05, C.okTap + 0.3, E.out);
    return { app, ring };
  }
  const tapPoint = () => V(PHONE_POS[0] + (ICON.u - 0.5) * 0.066, PHONE_POS[1] + 0.006, PHONE_POS[2] + (ICON.v - 0.5) * 0.1393);

  // ---------------- performer (behind the counter; in gloves)
  function person(t) {
    const q = { pos: ROOT, yaw: 0 };
    const look = win(t, 2.3, 3.3, 0.25, 0.1);
    q.handR = V(0.22, 0.985, -0.3).lerp(V(0.14, 1.28, -0.24), look); q.handL = V(-0.22, 0.985, -0.32).lerp(V(-0.06, 1.3, -0.24), look);
    const tap = press(t, 27.2, 0.25, 0.3); q.handR.add(V(-0.06 * tap, 0, 0.18 * tap));
    q.lean = key(t, [[0, 0.1], [3.25, 0.06], [26.35, 0.06], [30, 0.04]]);
    q.tilt = key(t, [[0, 0], [2.4, 0], [2.8, 0.07], [3.25, 0.07], [26.35, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.3], [2.3, 0.25], [2.6, 0.2], [3.25, 0.18], [26.35, 0.05], [27.0, 0.3], [27.6, 0.0], [30, 0.0]]);
    q.headYaw = key(t, [[0, 0], [2.6, 0.12], [3.25, -0.06], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [2.4, 0], [2.8, 0.09], [3.25, 0.09], [26.35, 0], [30, 0.03]]);
    q.look = key(t, [[0, [0, -0.6]], [2.3, [0.3, -0.4]], [2.75, [-0.3, -0.4]], [3.25, [0, 0.1]], [26.35, [0, 0.1]], [27.0, [0, -0.6]], [27.6, [0.05, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = key(t, [[0, 0.2], [2.4, 0.4], [3.25, 0.3], [26.35, 0], [30, 0]]);
    const brow = key(t, [[0, 0.2], [2.4, -0.2], [2.9, 0.8], [3.25, 0.6], [26.35, 0.4], [27.6, 0.9], [30, 0.5]]);
    q.browL = brow; q.browR = brow - key(t, [[0, 0], [2.6, 0.4], [3.25, 0.4], [3.4, 0], [30, 0]]);
    q.browAngle = key(t, [[0, 0.1], [2.45, -0.4], [3.25, -0.3], [26.35, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.1], [2.2, 0], [3.25, 0.0], [26.35, 0.6], [27.6, 0.95], [30, 0.9]]);
    q.open = 0.2 * pulse(t, 27.5, 28.0);
    q.frown = key(t, [[0, 0.2], [C.frown, 0.5], [3.25, 0.45], [26.35, 0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- giant states
  function giant(t, shot) {
    const g = { kind: 'bare', station: 'cap', fingerDrop: 1.6, signal: 0, flow: 0, blocked: 0, resA: 0, resB: 0 };
    if (shot === 'giant_cap') { g.kind = 'bare'; g.fingerDrop = 1.6 * (1 - seg(t, C.fingerDown, C.fingerDown + 0.6, E.out)); g.flow = seg(t, C.charge, C.charge + 0.3); g.signal = 0.88 * seg(t, C.charge + 0.2, C.charge + 1.0, E.out) + 0.15 * seg(t, C.fingerDown + 0.4, C.fingerDown + 0.8); }
    if (shot === 'giant_glove') { g.kind = 'knit'; g.fingerDrop = 1.6 * (1 - seg(t, C.gloveDown, C.gloveDown + 0.6, E.out)); g.blocked = seg(t, C.blocked - 0.3, C.blocked); g.signal = 0.04 + 0.03 * Math.sin(t * 9) * seg(t, C.gloveDown, C.gloveDown + 0.6); }
    if (shot === 'giant_thread') { g.kind = 'touch'; g.fingerDrop = 1.6 * (1 - seg(t, C.threadDown, C.threadDown + 0.6, E.out)); g.flow = seg(t, C.flow, C.flow + 0.3); g.signal = 0.05 + 0.8 * seg(t, C.flow + 0.2, C.flow + 1.0, E.out); }
    if (shot === 'giant_resistive') {
      g.station = 'res'; g.kind = 'knit';
      g.resA = seg(t, C.resPress - 0.25, C.resPress + 0.15, E.io) * (1 - seg(t, 21.6, 21.95, E.io));
      g.resB = seg(t, C.stylusPress - 0.4, C.stylusPress, E.io) * (1 - seg(t, 24.2, 24.6, E.io));
    }
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, ph = V(...PHONE_POS);
    switch (s.id) {
      case 'hook_pov': case 'ok_cu': return { pos: L(ph.clone().add(V(0.0, 0.31, 0.18)), ph.clone().add(V(0.0, 0.28, 0.15))), target: ph.clone().add(V(0, 0, -0.012)), fov: 42 };
      case 'react': return { pos: L(V(0.42, 1.44, 0.95), V(0.36, 1.46, 0.86)), target: L(V(0.06, 1.5, -0.42), V(0.04, 1.52, -0.42)), fov: 46 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      case 'giant_cap': return { pos: L(G.clone().add(V(1.6, 2.2, 5.7)), G.clone().add(V(1.5, 1.9, 4.9))), target: G.clone().add(V(1.5, 1.3, 0)), fov: 50 };
      case 'giant_glove': return { pos: L(G.clone().add(V(1.0, 2.0, 5.1)), G.clone().add(V(1.15, 1.8, 4.5))), target: G.clone().add(V(1.5, 1.35, 0)), fov: 50 };
      case 'giant_thread': return { pos: L(G.clone().add(V(2.1, 2.1, 5.3)), G.clone().add(V(1.9, 1.85, 4.6))), target: G.clone().add(V(1.45, 1.35, 0)), fov: 50 };
      case 'giant_resistive': return { pos: L(G.clone().add(V(-1.35, 1.3, 3.1)), G.clone().add(V(-1.6, 1.12, 2.6))), target: G.clone().add(V(-1.95, 0.95, 0.2)), fov: 50 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      glassTag: win(t, 3.6, 8.55, 0.2, 0.05), gridTag: win(t, 4.3, 8.55, 0.2, 0.05), chargeTag: win(t, C.charge + 0.2, 8.55, 0.2, 0.05), signalTag: win(t, C.charge + 0.6, 8.55, 0.2, 0.05),
      knitTag: win(t, C.blocked, 13.95, 0.2, 0.05), lowTag: win(t, C.blocked + 0.8, 13.95, 0.2, 0.05),
      threadTag: win(t, 15.3, 18.95, 0.2, 0.05), highTag: win(t, C.flow + 0.6, 18.95, 0.2, 0.05),
      sheetTag: win(t, 19.6, 24.7, 0.2, 0.05), contactTag: win(t, C.resPress + 0.1, 21.9, 0.2, 0.1), stylusTag: win(t, C.stylusPress - 0.2, 24.7, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, taps, screen, tapPoint, giant, camera, overlay, cues: C };
}
