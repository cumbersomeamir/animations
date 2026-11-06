// Shots, acting, screen states, infrared bursts and cameras for "Why can your phone camera see a remote's light?"
// (Recall, english-08). Everything is a pure function of t.
//
// Infrared model (illustrative): while a button is held, the remote's LED sends bursts in a repeating on/off code (NASA:
// ~940 nm, just past visible red; Vishay: the receiver's demodulated output is decoded by a microprocessor). The light is
// invisible to the eye (drawn as dim ghost rings); many camera sensors respond to it, so it shows up on screen as a
// violet-white flash. With flat batteries the LED stays dark.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const GIANT = [30, 0, 0];
export const TV_POS = [-0.62, 0.95, -0.3], TV_YAW = 0.75, REM_DOWN = [0.0, 0.95 + 0.0105, -0.06];
const BITS = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0], BIT = 0.07;

/** Is the LED emitting at time t?  (button held + working batteries + code bit on) */
export function pressedAt(t, C) {
  const P = [[0.0, 4.2, true], [4.6, 9.2, true], [9.2, 11.6, true], [11.6, 16.6, true], [C.press1, C.press1 + 0.7, false], [C.press2, C.press2 + 1.1, false],
    [C.press3, 25.0, true], [C.tvPress, C.tvPress + 0.9, true]];
  for (const [a, b, ok] of P) if (t >= a && t < b) return { held: true, ok, t0: a };
  return { held: false, ok: false, t0: 0 };
}
export function irOn(t, C) {
  const p = pressedAt(t, C);
  if (!p.held || !p.ok) return 0;
  const u = (t - p.t0) / BIT, b = BITS[Math.floor(u) % BITS.length];
  return b && (u % 1) < 0.72 ? 1 : 0;
}

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [1.6, 5.0, 12.4, 18.6, 22.9, 27.6, 29.3];
  const aimTV = t => win(t, 16.6, 18.0, 0.12, 0.15) || win(t, 25.0, 26.35, 0.15, 0.2);
  const swap = t => win(t, 20.4, 23.6, 0.15, 0.15);

  // ---------------- performer: phone in the right hand (screen to the eyes), remote in the left hand
  function person(t) {
    const q = { pos: ROOT, yaw: 0 };
    const phoneUp = V(0.13, 1.33, -0.17), phoneLow = V(0.24, 1.06, -0.36);
    const remoteAtPhone = V(-0.03, 1.29, -0.29), remoteAtTV = V(-0.3, 1.25, -0.2), remoteSwap = V(-0.12, 1.0, -0.2);
    const tvK = aimTV(t), swK = swap(t);
    q.handR = phoneUp.clone().lerp(phoneLow, Math.max(tvK, swK));
    if (swK > 0) q.handR = phoneLow.clone().lerp(V(0.07 + 0.03 * Math.sin(t * 2.5), 1.02, -0.12), swK);   // the free hand works on the remote (phone set down on the counter)
    let hl = remoteAtPhone.clone().lerp(remoteAtTV, tvK).lerp(remoteSwap, swK);
    const shake = pulse(t, 17.4, 17.95); hl.add(V(0.02 * Math.sin(t * 38) * shake, 0.012 * Math.sin(t * 31) * shake, 0));
    q.handL = hl; q.phoneUp = 1;
    q.lean = key(t, [[0, 0.1], [4.6, 0.1], [16.6, 0.06], [18, 0.1], [20.4, 0.14], [23.6, 0.1], [30, 0.05]]);
    q.twist = 0.18 * tvK;
    q.tilt = key(t, [[0, 0], [3.35, 0], [3.7, 0.07], [4.6, 0.07], [17.4, 0], [17.7, -0.05], [18, 0], [25.4, 0], [25.8, 0.05], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.3], [2.3, 0.3], [C.lookRemote, 0.42], [C.lookPhone, 0.22], [4.6, 0.22], [16.6, 0.12], [18, 0.3], [20.4, 0.5], [23.6, 0.3], [25, 0.12], [26.35, 0.02], [30, 0]]);
    q.headYaw = key(t, [[0, 0], [C.lookRemote, 0.18], [C.lookPhone, -0.08], [4.6, -0.05], [16.6, 0.42], [18, 0.0], [25, 0.42], [25.9, 0.1], [26.35, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [3.35, 0], [3.7, 0.08], [4.6, 0.08], [17.4, 0], [17.7, -0.06], [18, 0], [30, 0.02]]);
    q.look = key(t, [[0, [0, -0.4]], [C.lookRemote, [0.5, -0.7]], [C.lookPhone, [-0.3, -0.2]], [4.6, [-0.3, -0.2]], [16.6, [0.6, 0.0]], [18, [0, -0.4]], [20.4, [0, -0.8]], [23.6, [0, -0.4]], [25, [0.6, 0.0]], [26.0, [0.1, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = key(t, [[0, 0.1], [C.lookRemote, 0.5], [C.lookPhone, 0.0], [4.6, 0], [17.4, 0.4], [18, 0.2], [20.4, 0.1], [30, 0]]);
    const brow = key(t, [[0, 0.3], [C.lookRemote, 0.0], [C.lookPhone, 1.0], [4.0, 0.7], [4.6, 0.6], [16.6, 0.2], [17.4, -0.2], [18, -0.1], [20.4, 0.2], [24.0, 0.9], [25.0, 0.6], [30, 0.4]]);
    q.browL = brow; q.browR = brow - key(t, [[0, 0], [C.lookRemote, 0.3], [C.lookPhone, 0], [30, 0]]);
    q.browAngle = key(t, [[0, 0.1], [17.4, -0.4], [18, -0.3], [20.4, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.2], [C.lookRemote, 0.0], [C.lookPhone, 0.3], [4.6, 0.3], [16.6, 0.1], [17.4, 0.0], [20.4, 0.1], [23.6, 0.4], [C.smile, 0.6], [26.0, 0.95], [30, 0.9]]);
    q.open = 0.45 * pulse(t, C.lookPhone, C.lookPhone + 0.6) + 0.2 * pulse(t, 25.9, 26.3);
    q.frown = key(t, [[0, 0], [C.lookRemote, 0.3], [C.lookPhone, 0], [16.6, 0], [17.4, 0.45], [18, 0.35], [20.4, 0.1], [23.6, 0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- phone camera preview (selfie camera sees the remote's tip)
  function preview(t) {
    const p = pressedAt(t, C);
    return { glow: irOn(t, C), held: p.held ? 1 : 0, dead: p.held && !p.ok ? 1 : 0, ok: seg(t, C.press3 + 0.4, C.press3 + 0.7, E.back) * (t > C.press3 && t < 25.0 ? 1 : 0) };
  }
  // ---------------- TV volume (counter TV and giant TV)
  function tvVolume(t) {
    if (t >= 9.2 && t < 11.6) return { show: 1, level: Math.min(8, 3 + Math.floor((t - 9.35) / (BIT * BITS.length))) };
    if (t >= C.tvPress && t < 30) return { show: t < C.tvPress + 2.2 ? 1 : 0, level: Math.min(9, 4 + Math.floor((t - C.tvPress) / (BIT * BITS.length))) };
    return { show: 0, level: 4 };
  }
  // ---------------- battery swap (remote held back-up in the left hand)
  function batteries(t) {
    return { cover: seg(t, C.coverOff, C.coverOff + 0.3, E.io) * (1 - seg(t, C.coverOn, C.coverOn + 0.3, E.io)),
      oldOut: seg(t, C.oldOut, C.oldOut + 0.4, E.out), newIn: seg(t, C.newIn, C.newIn + 0.5, E.io), swapping: swap(t) > 0.01 };
  }
  // ---------------- giant states
  function giant(t) {
    return {
      remoteToSensor: t >= 11.6, irMark: seg(t, C.ir, C.ir + 0.3), eyeBr: seg(t, C.eyes, C.eyes + 0.35, E.back), camBr: seg(t, C.sensor + 0.3, C.sensor + 0.65, E.back),
      screenGlow: seg(t, C.screenGlow, C.screenGlow + 0.3),
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head;
    switch (s.id) {
      case 'hook_pov': case 'test_pov': case 'win_pov': {
        const eye = W.head.clone().add(V(-0.02, -0.03, 0.05)), toPhone = W.phone.clone().sub(eye);
        const tg = W.phone.clone().lerp(W.remoteTip, 0.3);
        return { pos: eye.clone().add(toPhone.clone().multiplyScalar(0.06 + 0.06 * u)).add(V(0.0, 0.03, 0)), target: tg, fov: 46 };
      }
      case 'react': return { pos: L(V(0.42, 1.44, 0.95), V(0.36, 1.46, 0.86)), target: L(V(0.04, 1.5, -0.42), V(0.02, 1.52, -0.42)), fov: 46 };
      case 'tv_fail': case 'tv_ok': return { pos: L(V(-0.18, 1.42, 1.25), V(-0.22, 1.44, 1.12)), target: L(V(-0.28, 1.22, -0.35), V(-0.3, 1.24, -0.35)), fov: 54 };
      case 'battery_cu': { const r = V(...REM_DOWN); return { pos: L(r.clone().add(V(0.0, 0.3, 0.16)), r.clone().add(V(0.0, 0.26, 0.13))), target: r.clone().add(V(0.0, 0.0, -0.01)), fov: 46 }; }
      case 'cafe_wide': return { pos: L(V(-0.26, 1.72, 2.6), V(-0.24, 1.82, 3.0)), target: L(V(-0.26, 1.32, -0.35), V(-0.24, 1.36, -0.42)), fov: 46 };
      case 'giant_spectrum': return { pos: L(G.clone().add(V(0.9, 2.2, 6.4)), G.clone().add(V(0.6, 2.4, 5.6))), target: L(G.clone().add(V(0.3, 1.9, -0.4)), G.clone().add(V(0.15, 2.3, -0.6))), fov: 50 };
      case 'giant_code': return { pos: L(G.clone().add(V(0.6, 2.1, 4.4)), G.clone().add(V(0.9, 2.0, 4.0))), target: G.clone().add(V(1.9, 1.15, 0.3)), fov: 50 };
      case 'giant_sensor': return { pos: L(G.clone().add(V(0.9, 2.1, 3.0)), G.clone().add(V(0.6, 2.0, 2.6))), target: L(G.clone().add(V(-2.0, 1.4, 0.0)), G.clone().add(V(-2.1, 1.45, -0.25))), fov: 50 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      irTag: win(t, C.ir + 0.1, 9.2, 0.2, 0.05), eyeTag: win(t, C.eyes + 0.2, 9.2, 0.2, 0.05), codeTag: win(t, 9.6, 11.6, 0.2, 0.05),
      camTag: win(t, C.sensor + 0.4, 16.6, 0.2, 0.05), eyeNoTag: win(t, 13.6, 16.6, 0.2, 0.05),
      deadTag: win(t, C.press2 + 0.4, 20.4, 0.2, 0.05), newTag: win(t, C.newIn + 0.2, 23.6, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, preview, tvVolume, batteries, giant, camera, overlay, irOn: t => irOn(t, C), pressedAt: t => pressedAt(t, C), cues: C };
}
