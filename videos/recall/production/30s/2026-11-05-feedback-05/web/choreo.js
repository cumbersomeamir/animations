// Shots, acting, wave states and cameras for "ANC: steady hum vs sudden voices" (Recall, feedback-05, Hindi).
// Everything is a pure function of t. Wave model (illustrative, from the sources' mechanism): the anti-wave is the
// inverted noise but formed a little late (same delay DELAY in both cases). For a slow, long hum wave the late
// anti-wave still nearly matches; for a voice's short, fast waves the same delay spoils the match, so the voice gets
// through. Wavelengths are chosen so the voice is NOT amplified (residual ≈ original), only not reduced.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const AC_POS = [-0.42, 2.2, -1.48];
export const GIANT = [30, 0, 0];
export const LANE = { x0: -1.55, x1: 1.55, amp: 0.26, slowL: 2.4, fastL: 0.72, DELAY: 0.12, speed: 0.9 };

/** Wave clock: quarter speed while the delay is being pointed out (11.65–14.0 s) so a crest stays in view. */
export function waveTime(t) { return t < 11.65 ? t : t < 14.0 ? 11.65 + 0.25 * (t - 11.65) : 11.65 + 0.25 * 2.35 + (t - 14.0); }
/** Slow-hum phase so a crest sits at panel x = -0.15 when the delay is named (12.6 s). */
export const SLOW_PH = (() => { const te = waveTime(12.6); return LANE.slowL / 4 - LANE.speed * te + 0.15; })();   // crest: x = λ/4 − PH − v·t = −0.15
/** Noise wave in panel x at time t (wave clock). kind 'slow' (steady hum) or 'fast' (voice: short waves in sudden bursts). */
export function noise(x, t, kind) {
  const { amp, slowL, fastL, speed } = LANE;
  if (kind === 'slow') return amp * Math.sin(2 * Math.PI * (x + SLOW_PH + speed * t) / slowL);
  const u = x + speed * 1.6 * t, env = 0.35 + 0.65 * Math.max(0, Math.sin(2 * Math.PI * u / 2.2)) ** 0.6;
  return amp * env * (0.75 * Math.sin(2 * Math.PI * u / fastL) + 0.25 * Math.sin(2 * Math.PI * u / (fastL * 0.62) + 1.3));
}

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [2.6, 5.0, 9.5, 18.2, 24.5, 27.4, 29.3];

  // ---------------- performer
  function person(t) {
    const q = { pos: ROOT };
    const turn = seg(t, C.turn, C.turn + 0.25, E.out3) * (1 - seg(t, 3.3, 3.75));
    q.lean = key(t, [[0, 0.03], [30, 0.03]]);
    q.twist = -0.18 * turn;
    q.tilt = key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.06], [3.75, 0.06], [17.95, 0], [18.3, 0.04], [18.8, 0], [23.1, 0], [23.6, 0.03], [25.8, 0.03], [30, 0.02]]);
    q.headPitch = key(t, [[0, 0.05], [30, 0.02]]) - 0.08 * win(t, C.relax, 25.8, 0.4, 0.3);
    q.headYaw = -0.55 * turn + key(t, [[0, 0], [3.75, 0], [17.95, 0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.09], [3.75, 0.09], [17.95, 0.0], [18.4, 0.05], [18.8, 0], [23.4, 0.0], [23.9, 0.06], [24.6, -0.04], [25.3, 0.05], [25.8, 0.0], [30, 0.04]]);
    q.look = key(t, [[0, [0.1, 0.05]], [0.3, [0.25, 0.3]], [C.turn, [-0.9, 0.05]], [1.4, [-0.9, 0.05]], [1.8, [0.2, 0.1]], [C.puzzled, [0.35, 0.35]], [3.75, [0.3, 0.3]], [17.95, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14));
    q.blink = Math.max(bl, 0.9 * pulse(t, C.deadpanBlink, C.deadpanBlink + 0.42), 0.85 * win(t, C.relax + 0.3, 25.6, 0.2, 0.2));
    q.squint = key(t, [[0, 0.1], [C.puzzled, 0.1], [C.puzzled + 0.3, 0.35], [3.75, 0.3], [17.95, 0.4], [18.8, 0.3], [19.2, 0.0], [30, 0.0]]);
    const brow = key(t, [[0, 0.2], [C.turn, 0.3], [C.turn + 0.2, 0.9], [1.5, 0.7], [C.puzzled, 0.2], [3.75, 0.0], [17.95, -0.1], [18.8, -0.1], [19.2, 0.2], [23.1, 0.3], [30, 0.4]]);
    q.browL = brow + key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.6], [3.75, 0.6], [4.0, 0], [30, 0]]); q.browR = brow;
    q.browAngle = key(t, [[0, 0.1], [C.puzzled, 0.1], [C.puzzled + 0.3, -0.35], [3.75, -0.3], [17.95, -0.1], [18.8, -0.1], [19.2, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.45], [C.tap, 0.6], [C.turn, 0.1], [1.4, 0.0], [17.95, 0.0], [18.8, 0.0], [23.1, 0.3], [C.relax + 0.4, 0.9], [30, 0.9]]);
    q.open = 0.35 * pulse(t, C.turn, C.turn + 0.45);
    q.frown = key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.35], [3.75, 0.3], [17.95, 0.2], [18.8, 0.15], [19.1, 0.0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    // left hand taps the left ear cup (ANC on), again when puzzled
    const restL = V(-0.22, 0.985, -0.32), cup = W_CUP;
    const tapK = Math.max(win(t, C.tap - 0.25, C.tap + 0.35, 0.2, 0.25), win(t, C.puzzled - 0.1, 3.2, 0.25, 0.35));
    q.handL = restL.clone().lerp(cup, E.io(tapK));
    q.handR = V(0.2, 1.02, -0.3);
    return q;
  }
  const W_CUP = V(-0.12, 1.66, -0.5);

  // ---------------- real-world wave ribbons + ANC LED
  function hook(t) {
    return {
      humVis: t < 3.75 || (t >= C.relax && t < 25.8) ? 1 : 0,
      anc: t >= C.ancOn ? 1 : seg(t, C.ancOn - 0.1, C.ancOn),
      voiceVis: win(t, C.are, 1.55, 0.06, 0.15),
      ledOn: t >= C.ancOn,
    };
  }

  // ---------------- giant states
  function giant(t) {
    const g = { t };
    g.humIn = seg(t, C.humIn, C.humIn + 0.5);
    g.voiceTease = t < 6.0 ? win(t, C.voiceIn, 5.9, 0.2, 0.2) : 0;
    g.mic = Math.max(pulse(t, C.mic - 0.1, C.mic + 0.9), t >= C.mic && t < 18 ? 0.5 : 0);
    g.driver = t >= C.speaker && t < 18 ? 0.5 + 0.5 * Math.sin(t * 40) : 0;
    g.anti = t < C.anti ? 0 : seg(t, C.anti, C.anti + 0.6);
    g.sum = t < C.cancel ? 0 : seg(t, C.cancel, C.cancel + 0.4);
    g.bracket = t >= C.delayMark && t < 17.95 ? seg(t, C.delayMark, C.delayMark + 0.3, E.back) : 0;
    g.kind = t >= 15.95 && t < 18 ? 'fast' : 'slow';
    g.sources = [C.plane, C.train, C.ac].map(c => seg(t, c, c + 0.35, E.back));
    g.quiet = seg(t, C.allQuiet - 0.6, C.allQuiet + 0.4);
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head;
    switch (s.id) {
      case 'hook_cu': return { pos: L(V(-0.3, 1.76, 0.66), V(-0.25, 1.75, 0.55)), target: L(V(-0.12, 1.9, -0.8), V(-0.1, 1.88, -0.8)), fov: 42 };
      case 'react': return { pos: L(V(-0.3, 1.66, 0.64), V(-0.25, 1.66, 0.52)), target: head.clone().add(V(0, -0.04, 0)), fov: 32 };
      case 'deadpan': return { pos: L(V(0.04, 1.66, 0.5), V(0.04, 1.66, 0.38), E.lin), target: head.clone().add(V(0, -0.02, 0)), fov: 30 };
      case 'relax': return { pos: L(V(0.22, 1.68, 0.5), V(0.17, 1.68, 0.38)), target: head.clone().add(V(0, -0.02, 0)), fov: 34 };
      case 'giant_cup': return { pos: L(G.clone().add(V(-0.2, 2.2, 5.6)), G.clone().add(V(-0.9, 1.9, 4.4))), target: L(G.clone().add(V(0.0, 1.55, 0)), G.clone().add(V(-1.3, 1.6, 0))), fov: 46 };
      case 'giant_anti': return { pos: L(G.clone().add(V(-0.4, 1.9, 4.6)), G.clone().add(V(0.1, 1.85, 4.1))), target: L(G.clone().add(V(-0.6, 1.55, 0)), G.clone().add(V(0.6, 1.55, 0))), fov: 46 };
      case 'giant_delay': return { pos: L(G.clone().add(V(1.0, 1.85, 3.0)), G.clone().add(V(1.05, 1.8, 2.6))), target: G.clone().add(V(1.0, 1.75, -0.2)), fov: 44 };
      case 'giant_slow': case 'giant_fast': return { pos: L(G.clone().add(V(1.2, 1.7, 3.3)), G.clone().add(V(1.1, 1.65, 3.0))), target: G.clone().add(V(1.15, 1.55, -0.2)), fov: 46 };
      case 'giant_sources': return { pos: L(G.clone().add(V(0.2, 2.2, 6.6)), G.clone().add(V(-0.05, 2.05, 5.9))), target: G.clone().add(V(0.4, 1.65, 0.6)), fov: 48 };
      case 'cafe_wide': return { pos: L(V(0.1, 1.7, 1.75), V(0.14, 1.8, 2.3)), target: L(V(0.0, 1.61, -0.35), V(0.0, 1.65, -0.42)), fov: 44 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      bubble: win(t, C.are, 1.55, 0.08, 0.15),
      noiseTag: win(t, C.humIn + 0.3, 7.9, 0.25, 0.05), micTag: win(t, C.mic, 7.9, 0.2, 0.05), spkTag: win(t, C.speaker, 9.4, 0.2, 0.1),
      antiTag: win(t, C.anti + 0.2, 11.65, 0.25, 0.05), earTag: win(t, C.cancel + 0.2, 11.65, 0.25, 0.05), delayTag: win(t, C.delayMark + 0.2, 14.0, 0.25, 0.05),
      slowTag: win(t, C.slow, 15.95, 0.2, 0.05), quietTag: win(t, C.slow + 0.6, 15.95, 0.25, 0.05),
      fastTag: win(t, C.fast, 17.95, 0.2, 0.05), leftTag: win(t, C.fast + 0.6, 17.95, 0.25, 0.05),
      planeTag: win(t, C.plane + 0.1, 23.1, 0.2, 0.05), trainTag: win(t, C.train + 0.1, 23.1, 0.2, 0.05), acTag: win(t, C.ac + 0.1, 23.1, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, hook, giant, camera, overlay, cues: C };
}
