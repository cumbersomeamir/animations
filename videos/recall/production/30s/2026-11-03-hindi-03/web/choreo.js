// Shots, acting, finger/napkin paths, phone-screen states and giant touchscreen states for
// "गीली स्क्रीन अजीब क्यों चलती है?" (Recall, Hindi episode 03). Everything is a pure function of t.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { SCREEN_DROPS, wetPath, cleanPath } from './screen.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const PHONE_POS = [0.04, 0.951, -0.17];
export const GLASS_POS = [0.27, 0.95, -0.16];
export const NAPKIN_POS = [-0.17, 0.951, -0.14];
export const GIANT = [30, 0, 0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [1.2, 3.4, 9.0, 16.0, 23.4, 27.3, 29.2];

  // ---------------- what the real finger is doing (uv on the phone screen, or null)
  function fingerUV(t) {
    if (t >= C.draw1 && t < 2.45) return { uv: wetPath(seg(t, C.draw1, 2.4, E.lin)), down: 1 };
    if (t >= 2.45 && t < 3.85) return { uv: wetPath(1), down: 0.4 };
    if (t >= C.draw2 && t < 25.8) return { uv: cleanPath(seg(t, C.draw2, 25.6, E.lin)), down: 1 };
    if (t >= 25.8) { const tap = Math.max(pulse(t, 26.9, 27.25), pulse(t, 27.6, 27.95)); return { uv: [0.55, 0.45], down: tap }; }
    return null;
  }

  // ---------------- props
  function props(t) {
    const p = {};
    const f = fingerUV(t);
    p.screen = t < 2.45 || (t >= 2.45 && t < C.wipe) ? { mode: 'wet', p: seg(t, C.draw1, 2.4, E.lin), ghosts: SCREEN_DROPS.map((_, i) => seg(t, C.ghost1 + 0.18 * i, C.ghost1 + 0.18 * i + 0.12)), t }
      : t < C.draw2 ? { mode: 'idle', p: 0, ghosts: [], t } : { mode: 'clean', p: seg(t, C.draw2, 25.6, E.lin), ghosts: [], t };
    // napkin wipe sweeps across the screen (drops vanish as it passes), then the fingertip is dabbed dry
    p.wipeU = seg(t, C.wipe + 0.05, C.wipe + 0.6, E.io);
    p.dropVis = SCREEN_DROPS.map(([u]) => (t < C.wipe ? 1 : p.wipeU < u ? 1 : 0));
    p.napkinOnScreen = win(t, C.wipe - 0.1, C.wipe + 0.75, 0.12, 0.12);
    p.dab = win(t, C.dryFingers, C.dryFingers + 0.4, 0.1, 0.1);
    p.glassLift = win(t, C.lift, 0.95, 0.2, 0.15) * 0.04;
    p.finger = f;
    return p;
  }

  // ---------------- performer (continuous; shots cut around it)
  function person(t) {
    const q = { pos: ROOT };
    q.lean = key(t, [[0, 0.1], [0.95, 0.12], [2.45, 0.12], [2.7, 0.02], [3.85, 0.02], [21.2, 0.02], [21.95, 0.13], [25.8, 0.12], [26.4, 0.06], [30, 0.05]]);
    q.twist = key(t, [[0, -0.08], [0.95, 0.0], [30, 0]]);
    q.tilt = key(t, [[0, 0], [2.6, 0], [3.0, 0.07], [3.85, 0.07], [21.2, 0], [21.5, 0.03], [21.95, 0], [30, 0]]);
    q.headPitch = key(t, [[0, 0.36], [2.45, 0.42], [2.65, 0.08], [3.85, 0.05], [21.2, 0.02], [21.95, 0.4], [25.8, 0.4], [26.6, 0.28], [28.3, 0.3], [28.8, 0.02], [30, 0.0]]);
    q.headYaw = key(t, [[0, 0.05], [2.6, 0.0], [3.1, -0.06], [3.85, -0.06], [21.2, 0.0], [30, 0.04]]);
    q.headRoll = key(t, [[0, 0], [2.6, 0], [3.0, 0.08], [3.85, 0.08], [21.2, 0.0], [28.8, 0.0], [29.2, 0.06], [30, 0.06]]);
    q.look = key(t, [[0, [0.1, -0.85]], [2.45, [0, -0.85]], [2.7, [0.15, -0.45]], [3.3, [0.25, 0.05]], [3.85, [0.2, 0.05]], [21.2, [0, 0.1]], [21.95, [0, -0.85]],
      [25.8, [0, -0.8]], [28.5, [0, -0.7]], [28.9, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14));
    q.blink = Math.max(bl, 0.9 * pulse(t, C.deadpanBlink, C.deadpanBlink + 0.42));
    q.squint = key(t, [[0, 0.1], [2.5, 0.1], [2.8, 0.55], [3.85, 0.5], [21.2, 0.42], [21.95, 0.4], [22.3, 0.1], [25.2, 0.05], [30, 0.0]]);
    const brow = key(t, [[0, 0.2], [2.5, 0.2], [2.8, -0.15], [3.85, -0.1], [21.2, -0.1], [21.95, -0.1], [22.3, 0.2], [25.3, 0.5], [30, 0.45]]);
    q.browL = brow + key(t, [[0, 0], [2.7, 0], [3.0, 0.7], [3.85, 0.6], [4.0, 0], [30, 0]]); q.browR = brow;
    q.browAngle = key(t, [[0, 0.1], [2.7, 0.1], [3.0, -0.45], [3.85, -0.4], [21.2, -0.1], [21.95, -0.1], [22.3, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.25], [2.5, 0.2], [2.8, 0.0], [21.2, 0.0], [21.95, 0.0], [22.3, 0.15], [24.9, 0.3], [C.smile, 1.0], [30, 0.9]]);
    q.open = 0.25 * pulse(t, 2.75, 3.2);
    q.frown = key(t, [[0, 0.0], [2.6, 0.0], [2.85, 0.45], [3.85, 0.4], [21.2, 0.25], [21.95, 0.2], [22.3, 0.0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- giant touchscreen states
  function giant(t) {
    const g = { t };
    g.glassTag = win(t, C.glassTag, 6.35, 0.25, 0.05); g.gridTag = win(t, C.gridTag, 6.35, 0.25, 0.05);
    g.gridGlow = pulse(t, 5.3, 6.4);
    g.arcs = seg(t, C.field, C.field + 0.7);
    g.fingerY = t < C.fingerIn ? 3 : key(t, [[C.fingerIn, 2.0], [C.press, 0.0, E.out3], [21.25, 0.0], [23.55, 0.0], [23.68, 0.35], [C.cleanTouch, 0.0, E.out3], [30, 0.0]]);
    g.finger = t >= 8.4 && t < 21.2 ? 1 : t >= 23.15 ? 1 : 0;
    g.press = t >= C.press && t < 21.2 ? seg(t, C.change, C.change + 0.5) : t >= C.cleanTouch ? seg(t, C.cleanTouch, C.cleanTouch + 0.2) : 0;
    g.signal = t >= 21.2 ? (t >= C.cleanTouch ? seg(t, C.cleanTouch + 0.05, C.cleanTouch + 0.3) : 0) : seg(t, C.signal, C.signal + 0.5);
    g.locate = t < 21.2 ? seg(t, C.locate, C.locate + 0.35, E.back) * (1 - seg(t, C.lost, C.lost + 0.5)) * (t >= C.film ? 0.55 + 0.45 * Math.abs(Math.sin(t * 13)) : 1) : (t >= C.cleanTouch ? seg(t, C.cleanTouch + 0.1, C.cleanTouch + 0.4, E.back) : 0);
    g.dropT = [0, 1, 2].map(k => t - (C.drops + 0.22 * k));
    g.drops = t < C.cleanTouch ? 1 : 0;
    g.dropChange = t < 21.2 ? seg(t, C.dropChange - 0.4, C.dropChange + 0.3) : 0;
    g.fake = t < 21.2 ? seg(t, C.fake, C.fake + 0.35) : t < C.cleanTouch ? 1 : 0;
    g.film = t < 21.2 ? seg(t, C.film, C.film + 0.8, E.out) : t < C.cleanTouch ? 1 : 0;
    g.cloth = t >= C.wipeGiant - 0.1 && t < C.cleanTouch ? seg(t, C.wipeGiant - 0.1, C.wipeGiant + 0.45, E.io) : -1;
    g.wiped = t >= 21.2 ? clamp((g.cloth >= 0 ? g.cloth : 1)) : 0;
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, ph = V(...PHONE_POS), gl = V(...GLASS_POS), UP = V(0, 1, 0), FWD = V(0, 0, 1);
    switch (s.id) {
      case 'glass_cu': return { pos: L(gl.clone().add(V(-0.07, 0.11, 0.33)), gl.clone().add(V(-0.055, 0.1, 0.27))), target: gl.clone().add(V(0, 0.06, 0)), fov: 34, up: UP };
      case 'phone_wet': case 'phone_clean': return { pos: L(ph.clone().add(V(0.003, 0.37, -0.03)), ph.clone().add(V(0.0, 0.34, -0.026))), target: ph.clone().add(V(0, 0, 0.03)), fov: 34, up: FWD };
      case 'react': return { pos: L(V(-0.2, 1.62, 0.44), V(-0.16, 1.62, 0.33)), target: head.clone().add(V(0, -0.04, 0)), fov: 32, up: UP };
      case 'deadpan': return { pos: L(V(0.04, 1.66, 0.5), V(0.04, 1.66, 0.38), E.lin), target: head.clone().add(V(0, -0.02, 0)), fov: 30, up: UP };
      case 'wipe_cu': return { pos: L(ph.clone().add(V(-0.03, 0.42, -0.035)), ph.clone().add(V(-0.03, 0.39, -0.03))), target: ph.clone().add(V(-0.035, 0, 0.035)), fov: 42, up: FWD };
      case 'giant_layers': return { pos: L(G.clone().add(V(2.4, 2.4, 3.9)), G.clone().add(V(1.7, 2.05, 3.2))), target: G.clone().add(V(0, 0.8, 0.3)), fov: 46, up: UP };
      case 'giant_field': return { pos: L(G.clone().add(V(-1.1, 2.1, 3.1)), G.clone().add(V(-0.75, 1.85, 2.6))), target: G.clone().add(V(0, 0.95, 0)), fov: 44, up: UP };
      case 'giant_finger': return { pos: L(G.clone().add(V(1.7, 1.75, 2.8)), G.clone().add(V(1.3, 1.6, 2.3))), target: G.clone().add(V(0.5, 1.15, 0.15)), fov: 44, up: UP };
      case 'giant_locate': return { pos: L(G.clone().add(V(0.35, 4.8, 2.3)), G.clone().add(V(0.3, 4.35, 1.9))), target: G.clone().add(V(0.2, 0.9, 0)), fov: 46, up: UP };
      case 'giant_drops': return { pos: L(G.clone().add(V(-0.7, 2.7, 3.3)), G.clone().add(V(-0.45, 2.4, 2.8))), target: G.clone().add(V(0, 1.0, 0)), fov: 46, up: UP };
      case 'giant_fake': return { pos: L(G.clone().add(V(-0.2, 4.4, 2.7)), G.clone().add(V(-0.1, 4.05, 2.35))), target: G.clone().add(V(0, 0.95, 0)), fov: 48, up: UP };
      case 'giant_masked': return { pos: L(G.clone().add(V(1.4, 2.5, 2.5)), G.clone().add(V(1.05, 2.2, 2.1))), target: G.clone().add(V(0.45, 1.0, 0.1)), fov: 44, up: UP };
      case 'giant_clean': return { pos: L(G.clone().add(V(0.3, 3.8, 3.1)), G.clone().add(V(0.3, 3.45, 2.7))), target: G.clone().add(V(0.2, 0.95, 0)), fov: 48, up: UP };
      case 'cafe_wide': return { pos: L(V(0.12, 1.7, 1.75), V(0.16, 1.8, 2.3)), target: L(V(0.02, 1.61, -0.35), V(0.02, 1.65, -0.42)), fov: 44, up: UP };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35, up: UP };
    }
  }

  function overlay(t) {
    return {
      glassTag: win(t, C.glassTag, 6.35, 0.25, 0.05), gridTag: win(t, C.gridTag, 6.35, 0.25, 0.05), fieldTag: win(t, 6.8, 8.4, 0.25, 0.05),
      changeTag: win(t, 11.0, 11.4, 0.15, 0.03), locTag: win(t, C.locate + 0.2, 15.1, 0.25, 0.05), ghostTag: win(t, C.fake + 0.2, 19.4, 0.25, 0.05),
      lostTag: win(t, C.lost + 0.2, 21.2, 0.25, 0.05), cleanTag: win(t, C.cleanTouch + 0.25, 24.35, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, fingerUV, props, person, giant, camera, overlay, cues: C };
}
