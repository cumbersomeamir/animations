// Shots, acting, phone/screen states, accelerometer states and cameras for "Your phone has springs" (Recall, english-22).
// Everything is a pure function of t.
//
// Physics (NXP/Freescale AN3461 "Tilt Sensing Using a Three-Axis Accelerometer"; Agliolo Gallitto & Lupo, "A mechanical model of
// the smartphone's accelerometer", arXiv:1507.02224; Android Developers "Sensors overview" / "Motion sensors"; Apple Support
// 118226): a MEMS accelerometer's proof mass hangs on restoring springs; gravity deflects it, and the deflection is measured from
// the change in capacitance between the mass's fingers and fixed sensing plates (one gap narrows, the other widens). Gravity's
// direction in the chip's axes tells the phone which edge is down, which is how the display switches between portrait and
// landscape. The drawn deflection, the spring lag and the order "drawn centred, then sagging" are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { MEMS } from './lowpoly.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];    // MEMS die
export const BED = [60, 0, 0];      // bedroom POV
const HP = Math.PI / 2;

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [2.2, 4.6, 27.7, 29.3];

  // the performer's phone: rotation in its own plane (negative = clockwise as seen from the front) and the screen content angle
  function phoneRot(t) {
    if (t < 4.93) return -HP * seg(t, C.flip1, C.flip1 + 0.5, E.io);
    if (t < 17.45 || t >= 26.38) return 0;
    return -HP * seg(t, C.flip2, C.flip2 + 0.45, E.io) + HP * seg(t, C.back2, C.back2 + 0.45, E.io);
  }
  function ui(t, shot) {
    if (shot.startsWith('bed')) {   // lying on your side: the phone is upright for your eyes but sideways for gravity
      const flip = seg(t, C.bedFlip, C.bedFlip + 0.35, E.io), unlock = seg(t, C.lockTap + 0.15, C.lockTap + 0.5, E.io);
      return { rot: -HP * flip * (1 - unlock), lock: seg(t, C.lockTap - 0.05, C.lockTap + 0.1), tap: clamp((t - C.lockTap) / 0.5) };
    }
    if (t < 4.93) return { rot: -HP * seg(t, C.flip1 + 0.55, C.flip1 + 0.9, E.io) };
    if (t >= 17.45 && t < 26.38) return { rot: -HP * (seg(t, C.flip2 + 0.5, C.flip2 + 0.85, E.io) - seg(t, C.back2 + 0.5, C.back2 + 0.85, E.io)) };
    return { rot: 0 };
  }

  function person(t) {
    const q = { yaw: 0 };
    const face = key(t, [[0, 0], [3.95, 0], [4.05, 1], [4.93, 1], [4.94, 0], [26.38, 0], [26.6, 1], [30, 1]]);
    q.handR = t >= 26.38 ? V(0.13, 1.12, -0.24) : V(0.08, 1.3, -0.2); q.phoneUp = 1;
    q.handL = V(-0.22, 0.985, -0.32);
    q.lean = 0.05; q.tilt = key(t, [[0, 0], [C.why, 0.05], [5, 0.04], [26.38, 0.02], [30, 0.03]]);
    q.headPitch = 0.14 * (1 - face) + key(t, [[26.38, 0], [27.2, -0.02], [30, -0.02]]);
    q.headYaw = 0.02; q.headRoll = key(t, [[0, 0.02], [C.why, 0.13], [C.why + 0.8, 0.07], [26.38, 0.02], [30, 0.03]]);
    q.look = face > 0.5 ? [0, 0.08] : [0.05, -0.3];
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0.15 * (1 - face);
    q.browL = key(t, [[0, 0.5], [C.why, 1.0], [C.why + 0.8, 1.0], [26.38, 0.5], [30, 0.5]]);
    q.browR = key(t, [[0, 0.5], [C.why, 1.0], [C.why + 0.8, 0.25], [26.38, 0.5], [30, 0.5]]);
    q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.2], [C.why + 0.4, 0.45], [26.38, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.1 * pulse(t, 2.6, 3.1); q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  /** Die rotation (radians, negative = clockwise) and the proof-mass offset in the die's own axes. */
  function mems(t, shot) {
    const phi = shot === 'giant_turn' ? -HP * seg(t, C.turn, C.turn + 0.9, E.io) : 0;
    const lagPhi = shot === 'giant_turn' ? -HP * seg(t - 0.35, C.turn, C.turn + 0.9, E.io) : 0;   // the mass follows a moment later
    const amp = shot === 'giant_mass' ? 0 : shot === 'giant_gravity' ? seg(t, C.sag, C.sag + 0.55, E.out) : 1;
    // gravity (world -y) expressed in the die's axes after the die turns by lagPhi
    const gx = Math.sin(-lagPhi), gy = -Math.cos(-lagPhi);
    const j = 0.003 * Math.sin(t * 17);
    return { phi, dx: MEMS.A * amp * gx + (shot === 'hook_mems' ? j : 0), dy: MEMS.A * amp * gy + (shot === 'hook_mems' ? j * 0.6 : 0), amp };
  }

  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), B = V(...BED);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_mems': return { pos: L(g(0.95, -1.25, 8.0), g(0.88, -1.15, 7.6)), target: g(0.08, 0.62, 0), fov: 42 };
      case 'react_pov': case 'proof_pov': {
        const eye = W.head.clone().add(V(-0.01, -0.02, 0.06)), toPhone = W.phone.clone().sub(eye);
        const k = s.id === 'react_pov' ? 0.24 + 0.08 * u : 0.3 + 0.04 * u;
        return { pos: eye.clone().add(toPhone.clone().multiplyScalar(k)), target: W.phone.clone(), fov: 44 };
      }
      case 'react_face': return { pos: L(V(0.4, 1.48, 0.95), V(0.34, 1.5, 0.86)), target: L(V(0.06, 1.48, -0.42), V(0.04, 1.5, -0.42)), fov: 46 };
      case 'giant_mass': return { pos: L(g(0.6, 0.5, 7.4), g(0.4, 0.3, 6.1)), target: g(0, 0, 0), fov: 42 };
      case 'giant_gravity': return { pos: L(g(-1.1, 0.35, 5.6), g(-0.95, 0.3, 5.15)), target: g(0.35, -0.15, 0), fov: 42 };
      case 'giant_fingers': return { pos: L(g(1.38, -0.12, 2.75), g(1.35, -0.14, 2.45)), target: g(1.15, -0.22, 0.1), fov: 40 };
      case 'giant_turn': return { pos: L(g(0.1, 0.2, 8.9), g(0.05, 0.15, 8.3)), target: g(-0.2, 0, 0), fov: 50 };
      case 'bed_flip': case 'bed_lock': {
        const eye = B.clone().add(V(-0.25, 0.93, -0.85)), f = V(0.12, -0.07, 1).normalize();
        const push = s.id === 'bed_flip' ? 0.02 * u : 0.02 + 0.02 * u;
        return { pos: eye.clone().addScaledVector(f, push), target: eye.clone().addScaledVector(f, 2), fov: 52, up: V(-f.z, 0, f.x).normalize(), eye, f };
      }
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      springsTag: W('giant_mass', C.springsTag), gravityTag: W('giant_gravity', C.gravityTag), gapTag: W('giant_fingers', C.gapTag),
      shiftTag: W('giant_turn', C.shiftTag), screenTag: W('proof_pov', C.screenTag, C.back2 - 0.05), gravTag2: W('bed_flip', C.gravTag2), lockTag: W('bed_lock', C.lockTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, phoneRot, ui, mems, camera, overlay, cues: C };
}
