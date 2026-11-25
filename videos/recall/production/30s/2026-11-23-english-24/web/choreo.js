// Shots, acting, microwave states and the giant door cut-away for "This window is a metal net" (Recall, english-24).
// Everything is a pure function of t.
//
// Physics (HyperPhysics "Microwave Ovens"; NASA Science "Microwaves", "Visible Light"; FDA "Microwave Oven Radiation"; 21 CFR 1030.10):
// the ~12 cm oven microwaves are ~120 times longer than the ~1 mm screen holes, so the screen acts like solid metal to them and
// metal reflects microwaves back inside; visible light (~0.0005 mm) is ~2000 times smaller than the holes and passes; a bent door or
// one that doesn't close firmly can leak (FDA advice: don't use it). The oven's interlocks stop it when the door opens, so the oven is
// never shown running with the door open. Wave speed on screen, amplitudes and the gap size are illustrative; the wave-to-hole size
// ratio in the giant shots is to scale (6.0 vs 0.05 units = 120 : 1). Light rays are drawn as rays, not to scale.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { GD } from './door.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];
export const MW_POS = [0.6, 0.95, -0.12], MW_ROT = -1.15;       // the english-11 microwave, turned so its door faces the performer
export const PLUG_POS = [0.16, 0.95, -0.34], PLUG_ROT = -0.3;
const MWM = new THREE.Matrix4().compose(V(...MW_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, MW_ROT, 0)), V(1, 1, 1));
export const mwL = (x, y, z) => V(x, y, z).applyMatrix4(MWM);
const PLM = new THREE.Matrix4().compose(V(...PLUG_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PLUG_ROT, 0)), V(1, 1, 1));
const plugL = (x, y, z) => V(x, y, z).applyMatrix4(PLM);
const WIN = [-0.085, 0.15, 0.214];   // window centre in microwave-local coordinates
const SPEED = 4.5;                   // drawn wave speed (units/s), illustrative

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1, T0 = id => tl.shots.find(s => s.id === id).t0;
  const blinks = [2.2, 4.2, 23.4, 25.8, 28.4];

  function microwave(t) {
    const run = t < 21.9, ajar = t >= 21.9 ? 0.1 : 0;
    const rem = Math.max(0, 45 - Math.floor(t));
    return { run, turn: run ? t * 1.1 : 1.1 * 21.9, doorAjar: ajar, text: run ? `0:${String(rem).padStart(2, '0')}` : '' };
  }
  const plugOut = t => seg(t, C.unplug, C.unplug + 0.35, E.out);

  function person(t, shot) {
    const q = { yaw: 0 }, peer = t >= 1.6 && t < 4.6, turned = seg(t, C.turnToCam, C.turnToCam + 0.35, E.out);
    const lookMw = peer ? 1 - turned : (t >= 23.8 && t < 26.45 ? key(t, [[23.8, 0], [24.0, 1], [24.45, 1], [24.6, 0.4], [25.1, 0], [26.45, 0]]) : 0);
    q.lean = 0.03 + 0.16 * (peer ? 1 - turned * 0.7 : 0) + 0.06 * lookMw * (t >= 23.8 ? 1 : 0);
    q.twist = 0.3 * (peer ? 1 - turned : 0) + 0.25 * (t >= 23.8 && t < 26.45 ? lookMw : 0);
    q.tilt = key(t, [[0, 0], [C.turnToCam, 0], [C.turnToCam + 0.4, 0.08], [4.6, 0.08], [26.45, 0.02], [30, 0.03]]);
    q.headYaw = 0.55 * lookMw;
    q.headPitch = 0.12 * lookMw - 0.02;
    q.headRoll = peer ? 0.12 * turned : 0.02;
    q.look = lookMw > 0.5 ? [0.6, -0.3] : [0, 0.05];
    let bl = 0; for (const x of blinks) bl = Math.max(bl, pulse(t, x, x + 0.14)); q.blink = bl;
    const notice = t >= C.notice && t < C.unplug + 0.6 ? 1 : 0;
    q.squint = 0.25 * (peer ? 1 - turned : 0) + 0.3 * notice;
    q.browL = 0.5 + (peer ? 0.6 * turned : 0) - 0.3 * notice; q.browR = 0.5 + (peer ? -0.1 * turned : 0) - 0.3 * notice;
    q.browAngle = 0.1 + 0.5 * notice;
    q.smile = key(t, [[0, 0.2], [C.turnToCam, 0.2], [C.turnToCam + 0.4, 0.35], [4.6, 0.3], [23.8, 0.2], [C.notice, -0.2], [C.unplug + 0.6, -0.1], [25.4, 0.4], [26.45, 0.7], [C.smile2, 0.95], [30, 0.9]]);
    q.frown = 0.5 * notice; q.open = 0.12 * pulse(t, C.turnToCam + 0.2, C.turnToCam + 1.2);
    const rest = [V(-0.24, 0.97, -0.33), V(0.24, 0.97, -0.33)];
    let R = rest[1];
    if (t >= 23.8 && t < 26.6) {
      const plugTop = plugL(-0.07, 0.1, 0), lifted = plugL(-0.11, 0.22, 0.05);
      const reach = seg(t, C.unplug - 0.45, C.unplug - 0.05), pull = plugOut(t), back = seg(t, 25.6, 26.4);
      R = rest[1].clone().lerp(plugTop, reach).lerp(lifted, pull).lerp(rest[1], back);
    }
    q.handL = rest[0]; q.handR = R;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  /** giant door state */
  function door(t, shot) {
    const s = { inc: null, ref: null, leak: null, solid: 0, rays: 0, gap: 0, lam: 0, hole: 0 };
    const phase = z => (2 * Math.PI) * (z - SPEED * t) / GD.lambda;
    const zf = shot === 'giant_wave' ? Math.min(0, -14 + (t - T0('giant_wave')) * SPEED * 1.35) : 0;
    if (['giant_wave', 'giant_holes', 'giant_solid', 'giant_bounce', 'door_gap'].includes(shot)) s.inc = { z0: -16, z1: zf, phase };
    if (shot === 'giant_bounce') { const zr = -Math.min(16, (t - T0('giant_bounce') + 0.25) * SPEED * 1.6); s.ref = { z0: 0, z1: zr }; }
    if (shot === 'giant_solid') s.solid = 0.32 * seg(t, C.solidTag - 0.4, C.solidTag + 0.2);
    if (shot === 'giant_bounce') s.solid = 0.32 * (1 - seg(t, T1('giant_bounce') - 0.5, T1('giant_bounce')));
    if (shot === 'light_rays') s.rays = seg(t, T0('light_rays'), T0('light_rays') + 0.6);
    if (shot === 'door_gap') s.gap = seg(t, C.gapOpen, C.gapOpen + 0.5, E.io);
    s.lam = shot === 'giant_wave' ? seg(t, C.waveTag - 0.35, C.waveTag) : 0;
    s.hole = shot === 'giant_holes' ? seg(t, C.mmTag - 0.3, C.mmTag) : 0;
    return s;
  }

  function camera(t) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    const w = mwL(...WIN);
    switch (s.id) {
      case 'hook_mesh': return { pos: L(mwL(WIN[0] + 0.03, WIN[1] + 0.03, WIN[2] + 0.27), mwL(WIN[0] + 0.025, WIN[1] + 0.025, WIN[2] + 0.22)), target: L(mwL(WIN[0], WIN[1] - 0.01, 0.0), mwL(WIN[0], WIN[1] - 0.012, 0.0)), fov: 40 };
      case 'peer_react': return { pos: L(V(-0.3, 1.46, 0.92), V(-0.25, 1.47, 0.8)), target: L(V(0.17, 1.33, -0.34), V(0.16, 1.34, -0.36)), fov: 48 };
      case 'giant_wave': return { pos: L(g(0.5, 7.2, -16.8), g(0.4, 6.7, -15.2)), target: g(0, 2.3, -1.2), fov: 46 };
      case 'giant_holes': return { pos: L(g(0.42, 3.26, -0.72), g(0.34, 3.2, -0.58)), target: g(0.02, 3.0, 0.0), fov: 38 };
      case 'giant_solid': return { pos: L(g(2.6, 6.2, -10.8), g(2.3, 5.8, -9.8)), target: g(0, 2.6, -0.6), fov: 46 };
      case 'giant_bounce': return { pos: L(g(-2.6, 6.6, -11.4), g(-2.3, 6.2, -10.4)), target: g(0, 2.6, -1.6), fov: 46 };
      case 'light_rays': return { pos: L(g(0.72, 3.26, 1.15), g(0.6, 3.22, 0.95)), target: g(0.0, 3.0, -0.6), fov: 42 };
      case 'peer_pov': return { pos: L(mwL(WIN[0] + 0.03, WIN[1] + 0.05, WIN[2] + 0.42), mwL(WIN[0] + 0.02, WIN[1] + 0.04, WIN[2] + 0.34)), target: mwL(WIN[0] + 0.02, 0.07, -0.02), fov: 42 };
      case 'door_gap': return { pos: L(g(7.4, 13.6, 4.6), g(7.2, 13.1, 4.2)), target: g(6.2, 3.0, -0.3), fov: 46 };
      case 'unplug': return { pos: L(V(-0.5, 1.38, 1.0), V(-0.44, 1.39, 0.88)), target: L(V(0.3, 1.1, -0.26), V(0.28, 1.11, -0.28)), fov: 48 };
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: w, fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      waveTag: W('giant_wave', C.waveTag), mmTag: W('giant_holes', C.mmTag), solidTag: W('giant_solid', C.solidTag),
      bounceTag: W('giant_bounce', C.bounce), lightTag: W('light_rays', C.lightTag), gapTag: W('door_gap', C.gapTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, microwave, plugOut, door, camera, overlay, cues: C };
}
