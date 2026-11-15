// Shots, acting, sound paths and cameras for "That is my voice?" (Recall, english-16). Everything is a pure function of t.
//
// Hearing science (Stenfelt 2011, Adv Otorhinolaryngol 71; Reinfeldt et al. 2010, JASA 128; Orepic et al. 2023, R Soc Open
// Sci 10; occlusion: Stenfelt & Reinfeldt 2007, Int J Audiol 46, and the 2023 earmold study in Int J Audiol): you hear your
// own voice by air conduction (mouth -> ear canal) and by bone conduction (skull vibrations -> cochlea); recordings lack the
// bone part; occluding the ear canal raises the bone-conducted low-frequency sound. Pulse speeds, sizes and paths are
// illustrative, and the anatomy is simplified.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { hp } from './lowpoly.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];
export const PHONE_HOLD = { pos: [0.165, 1.49, -0.31], face: [0.07, 1.67, -0.47] };            // hook: held up, screen turned to the face
export const PHONE_REST = { pos: [0.24, 0.9555, -0.12], rot: [-Math.PI / 2, 0, 0.5] };         // CTA: lying on the counter
export const GPHONE = { pos: [1.95, 1.95, 0.85], rot: [0, -0.5, 0], scale: 10 };                 // giant phone in front of the model

// model-local paths (profile points; z in model units, toward the camera)
export const AIR_PTS = [hp(0.37, 0.448, 0.08), hp(0.56, 0.47, 0.35), hp(0.52, 0.58, 0.8), hp(0.22, 0.665, 1.0), hp(-0.07, 0.625, 0.8),
  hp(-0.16, 0.565, 0.38), hp(-0.135, 0.55, 0.14), hp(-0.08, 0.55, 0.1), hp(-0.03, 0.535, 0.1)];
export const BONE_JAW = [hp(-0.018, 0.25, 0.09), hp(-0.03, 0.33, 0.09), hp(-0.005, 0.42, 0.09), hp(0.02, 0.5, 0.09), hp(-0.025, 0.533, 0.11)];
export const BONE_SPINE = [hp(-0.018, 0.25, 0.09), hp(-0.09, 0.27, 0.09), hp(-0.125, 0.40, 0.09), hp(-0.11, 0.49, 0.09), hp(-0.025, 0.533, 0.11)];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [2.6, 3.55, 20.0, 27.6, 29.3];

  function person(t, shot) {
    const q = { yaw: 0 };
    q.lean = key(t, [[0, 0.06], [3.12, 0.06], [21.1, 0.05], [26.38, 0.03]]);
    q.tilt = key(t, [[0, 0.02], [1.6, 0.05], [3.12, 0], [21.1, 0], [22.3, 0.03], [26.38, 0.02], [30, 0.03]]);
    q.headPitch = key(t, [[0, 0.12], [1.3, 0.14], [3.12, 0.02], [4.38, 0.02], [21.1, 0.04], [22.3, 0.1], [23.6, 0.02], [26.38, 0.04], [27.2, 0], [30, 0]]);
    q.headYaw = key(t, [[0, 0.1], [1.6, 0.06], [3.12, 0], [21.1, 0], [30, 0.04]]);
    q.headRoll = key(t, [[0, 0.04], [2.2, 0.1], [3.12, 0], [23.6, 0], [24.4, 0.07], [26.38, 0.02], [30, 0.03]]);
    q.look = key(t, [[0, [0.5, -0.5]], [2.0, [0.45, -0.45]], [3.12, [0, 0]], [4.38, [0, 0]], [21.1, [0, 0.05]], [30, [0.05, 0.1]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14));
    bl = Math.max(bl, win(t, C.hum - 0.1, C.humEnd, 0.15, 0.15));               // eyes closed while humming
    q.blink = bl; q.squint = key(t, [[0, 0], [2.0, 0], [2.6, 0.35], [3.12, 0.1], [4.38, 0], [30, 0]]);
    const brow = key(t, [[0, 1.0], [1.8, 0.9], [2.6, 0.55], [3.12, 0.1], [4.38, 0.1], [21.1, 0.3], [C.louder - 0.1, 0.3], [C.louder + 0.35, 1.0], [26.38, 0.5], [30, 0.45]]);
    q.browL = brow; q.browR = brow; q.browAngle = key(t, [[0, 0.1], [2.4, 0.1], [2.8, -0.6], [3.12, 0], [30, 0.1]]);
    q.smile = key(t, [[0, 0], [3.12, 0], [21.1, 0.15], [C.boneTag - 0.2, 0.2], [C.boneTag + 0.4, 0.85], [26.38, 0.7], [C.smile, 0.95], [30, 0.9]]);
    q.open = key(t, [[0, 0.7], [1.3, 0.62], [2.4, 0.3], [3.12, 0], [C.louder - 0.1, 0], [C.louder + 0.25, 0.3], [C.louder + 0.9, 0.05], [30, 0]]);
    q.frown = key(t, [[0, 0.55], [1.3, 0.5], [2.4, 0.4], [2.8, 0.5], [3.12, 0.35], [4.38, 0.3], [21.1, 0], [30, 0]]);
    q.gasp = key(t, [[0, 1], [1.3, 0.85], [2.4, 0.3], [3.12, 0], [C.louder - 0.1, 0], [C.louder + 0.25, 0.6], [C.louder + 0.9, 0], [30, 0]]);   // narrow 'O' mouth
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    q.plug = seg(t, C.plug, C.plugIn, E.io) * (1 - seg(t, 26.2, 26.38));          // hands to the ears (payoff only)
    q.humming = win(t, C.hum, C.humEnd + 1.2, 0.1, 0.3);
    return q;
  }

  // ---------------- model states (giant shots)
  function model(t) {
    return {
      speak: 1, air: seg(t, C.airGo - 0.2, C.airGo + 0.3), bone: seg(t, C.boneGo - 0.2, C.boneGo + 0.3), leave: seg(t, C.onlyGo, C.onlyGo + 0.6),
      mic: seg(t, C.micIn, C.micIn + 0.6, E.out),
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    switch (s.id) {
      case 'hook_phone': return { pos: L(V(0.24, 1.65, 0.62), V(0.22, 1.66, 0.52)), target: V(0.08, 1.672, -0.5), fov: 38 };
      case 'react': return { pos: L(V(0.07, 1.7, 0.12), V(0.07, 1.7, 0.02)), target: V(0.055, 1.69, -0.5), fov: 32 };
      case 'model_intro': return { pos: L(G.clone().add(V(1.6, 2.6, 6.4)), G.clone().add(V(1.2, 2.55, 5.8))), target: G.clone().add(V(0.1, 2.3, 0)), fov: 40 };
      case 'model_air': return { pos: L(G.clone().add(V(1.6, 2.7, 6.0)), G.clone().add(V(1.35, 2.7, 5.5))), target: G.clone().add(V(0.25, 2.4, 0.2)), fov: 42 };
      case 'model_bone': return { pos: L(G.clone().add(V(0.5, 2.2, 4.9)), G.clone().add(V(0.3, 2.25, 4.4))), target: G.clone().add(V(-0.05, 2.05, 0)), fov: 42 };
      case 'model_only': return { pos: L(G.clone().add(V(1.5, 2.5, 6.0)), G.clone().add(V(2.0, 2.55, 6.8))), target: G.clone().add(V(0.6, 2.05, 0)), fov: 44 };
      case 'model_mic': return { pos: L(G.clone().add(V(2.3, 2.6, 7.6)), G.clone().add(V(2.0, 2.55, 7.0))), target: G.clone().add(V(0.72, 2.15, 0.3)), fov: 46 };
      case 'model_plug': return { pos: L(G.clone().add(V(0.2, 2.4, 4.9)), G.clone().add(V(0.05, 2.4, 4.4))), target: G.clone().add(V(-0.2, 2.2, 0.2)), fov: 42 };
      case 'payoff_plug': return { pos: L(V(0.1, 1.68, 0.5), V(0.09, 1.69, 0.38)), target: V(0.055, 1.6, -0.5), fov: 44 };
      case 'cafe_wide': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    return {
      airTag: shot === 'model_air' ? win(t, C.airTag, tl.shots.find(s => s.id === 'model_air').t1, 0.2, 0.05) : 0,
      boneTag: shot === 'model_bone' ? win(t, C.boneTagM, C.inner - 0.05, 0.2, 0.15) : 0,
      innerTag: shot === 'model_bone' ? win(t, C.inner, tl.shots.find(s => s.id === 'model_bone').t1, 0.2, 0.05) : 0,
      onlyTag: shot === 'model_only' ? win(t, C.onlyTag, tl.shots.find(s => s.id === 'model_only').t1, 0.2, 0.05) : 0,
      micTag: shot === 'model_mic' ? win(t, C.micTag, tl.shots.find(s => s.id === 'model_mic').t1, 0.2, 0.05) : 0,
      bonePathTag: shot === 'model_plug' ? win(t, C.boneTag, tl.shots.find(s => s.id === 'model_plug').t1, 0.2, 0.05) : 0,
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, model, camera, overlay, cues: C };
}
