// Shots, acting, drop states and cameras for "This drop is floating" (Recall, english-21). Everything is a pure function of t.
//
// Physics (J. Walker, "Boiling and the Leidenfrost Effect", Cleveland State University; Mathijssen et al., "Culinary fluid
// mechanics and other currents in food science", Rev. Mod. Phys. 2023 / arXiv:2201.12128; Brown University 2019; Emory University
// 2021): on a warm pan a drop spreads, boils and is gone within seconds; above the Leidenfrost point the drop's underside vaporises
// at once, the vapour layer (~0.1 mm) holds the drop up and, because vapour conducts heat far worse than liquid water, it slows the
// drop's evaporation, so it beads up and skates for up to a minute or more; cooks use this as a "water test" for a hot pan.
// The cushion's thickness, fall speeds and wander paths are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { PAN } from './lowpoly.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];        // giant pan section
export const PAN_POS = [0.06, 0.951, -0.16];   // café hotplate base (counter top)
const HAND0 = V(0.24, 1.0, -0.36);
const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [3.6, 4.3, 27.7, 29.3];
  // café drop events: the performer flicks or sprinkles water onto the pan (hot = beads skate; warm = drops sizzle away)
  const EVENTS = [{ tf: C.flick, hot: true }, { tf: 18.0, hot: true, offscreen: true, until: 20.38 }, { tf: C.sprinkle1, hot: false }, { tf: C.sprinkle1 + 1.45, hot: false }, { tf: C.sprinkle2, hot: true }];
  const flicks = EVENTS.filter(e => !e.offscreen).map(e => e.tf);

  function handR(t) {
    for (const tf of flicks) {
      if (t > tf - 0.6 && t < tf + 0.7) return V(...key(t, [[tf - 0.6, HAND0.toArray()], [tf - 0.15, [0.13, 1.13, -0.23]], [tf + 0.05, [0.1, 1.1, -0.13], E.out], [tf + 0.7, HAND0.toArray()]]));
    }
    return HAND0.clone();
  }

  function person(t) {
    const q = { yaw: 0 };
    const look = key(t, [[0, 1], [C.why + 0.5, 1], [C.why + 1.0, 0], [20.38, 0], [20.6, 1], [26.38, 1], [26.39, 0]]);
    q.lean = 0.04 + 0.12 * look; q.tilt = 0.02;
    q.headPitch = 0.4 * look + key(t, [[0, 0], [26.38, 0], [27.2, -0.02], [30, -0.02]]);
    q.headYaw = 0.04 * look; q.headRoll = key(t, [[0, 0.02], [C.why, 0.14], [C.why + 1.0, 0.07], [5, 0.08], [26.38, 0.02], [30, 0.03]]);
    q.look = look > 0.5 ? [0.0, -0.75] : [0, 0.08];
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); q.blink = bl;
    q.squint = 0.25 * look;
    q.browL = key(t, [[0, 0.5], [C.why, 0.95], [C.why + 1.0, 1.0], [26.38, 0.5], [30, 0.5]]);
    q.browR = key(t, [[0, 0.5], [C.why, 0.95], [C.why + 1.0, 0.2], [26.38, 0.5], [30, 0.5]]);
    q.browAngle = 0.1;
    q.smile = key(t, [[0, 0.2], [C.why + 1.0, 0.2], [C.why + 1.3, 0.45], [26.38, 0.6], [C.smile, 0.95], [30, 0.9]]);
    q.open = 0.12 * pulse(t, 2.6, 3.2); q.frown = 0;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  /** Café drop i (0..7) at time t: world position, scale and visibility (latest event only). */
  function cafeDrop(i, t) {
    const ev = [...EVENTS].reverse().find(e => t >= e.tf - 0.05);
    if (!ev || (ev.until && t >= ev.until)) return null;
    const ts = ev.tf + 0.035 * i, fall = 0.24;
    if (t < ts) return null;
    const H = ev.offscreen ? V(PAN_POS[0], 1.15, PAN_POS[2]) : handR(ev.tf + 0.05);
    H.x += (rnd(i, 1) - 0.5) * 0.03; H.z += (rnd(i, 2) - 0.5) * 0.03;
    const r = 0.012 + 0.065 * rnd(i, 3), a = 2 * Math.PI * rnd(i, 4), floor = PAN_POS[1] + 0.04;
    const Lp = V(PAN_POS[0] + r * Math.cos(a), floor, PAN_POS[2] + r * Math.sin(a));
    if (t < ts + fall) { const u = (t - ts) / fall; return { pos: V(H.x + (Lp.x - H.x) * u, H.y + (Lp.y + 0.005 - H.y) * u * u, H.z + (Lp.z - H.z) * u), s: [0.9, 1.15, 0.9], puff: 0 }; }
    const tl2 = t - ts - fall;
    if (ev.hot) {
      const ph = 6.28 * rnd(i, 5), w1 = 1.6 + rnd(i, 6), w2 = 2.3 + rnd(i, 7);
      let x = Lp.x - PAN_POS[0] + 0.028 * Math.sin(w1 * tl2 + ph) - 0.028 * Math.sin(ph), z = Lp.z - PAN_POS[2] + 0.024 * Math.sin(w2 * tl2 + 2 * ph) - 0.024 * Math.sin(2 * ph);
      const rr = Math.hypot(x, z); if (rr > 0.088) { x *= 0.088 / rr; z *= 0.088 / rr; }
      const sc = 1 - 0.1 * clamp(tl2 / 6), j = 1 + 0.06 * Math.sin(tl2 * 23 + ph);
      return { pos: V(PAN_POS[0] + x, floor + 0.0012 + 0.0058 * 0.8 * sc, PAN_POS[2] + z), s: [1.05 * sc * j, 0.8 * sc / j, 1.05 * sc * j], puff: 0 };
    }
    const fl = clamp(tl2 / 0.12), sh = 1 - clamp((tl2 - 0.25) / 0.9);
    if (sh <= 0.02) return null;
    return { pos: V(Lp.x, floor + 0.0058 * (1 - 0.65 * fl) * sh, Lp.z), s: [(1 + 0.9 * fl) * sh, (1 - 0.65 * fl) * sh, (1 + 0.9 * fl) * sh], puff: clamp(tl2 / 0.2) * (1 - clamp((tl2 - 1.0) / 0.3)) };
  }

  /** Giant drop (local to the giant set): centre, scale, cushion gap, vapour amount, heat level, boiling amount. */
  function giant(t, id) {
    const R = PAN.R, top = PAN.top, hov = (gap, x = 0) => ({ pos: V(x, top + gap + R * 0.82 + 0.012 * Math.sin(t * 9), 0), s: [1.08 + 0.02 * Math.sin(t * 13), 0.82 - 0.02 * Math.sin(t * 13), 1.08], gap, vapor: 1, boil: 0, flat: 0 });
    let st;
    if (id === 'hook_drop') st = { ...hov(0.11), heat: 1 };
    else if (id === 'giant_warm') {
      const u = seg(t, C.dropWarm, C.land, E.in), y0 = 3.6, yc = top + R;
      if (t < C.land) st = { pos: V(0.15, y0 + (yc - y0) * u, 0), s: [0.95, 1.08, 0.95], gap: 0, vapor: 0, boil: 0, flat: 0 };
      else {
        const fl = seg(t, C.land, C.land + 0.18, E.out), sh = 1 - seg(t, C.land + 0.9, 8.45, E.in);
        st = { pos: V(0.15, top + R * (1 - 0.68 * fl) * Math.max(sh, 0.001) + 0.002, 0), s: [(1 + 0.85 * fl) * sh, (1 - 0.68 * fl) * sh, (1 + 0.85 * fl) * sh], gap: 0, vapor: 0, boil: seg(t, C.land + 0.15, C.land + 0.5) * (sh > 0.03 ? 1 : 0), flat: fl };
      }
      st.heat = 0.32;
    } else if (id === 'giant_hot') {
      const y0 = 3.6, yh = top + 0.13 + R * 0.82;
      if (t < C.flash) { const u = seg(t, C.dropHot, C.flash, E.in); st = { pos: V(-0.1, y0 + (yh + 0.04 - y0) * u, 0), s: [0.95, 1.08, 0.95], gap: 0.13, vapor: 0, boil: 0, flat: 0 }; }
      else { const b = 0.08 * Math.exp(-(t - C.flash) * 5) * Math.sin((t - C.flash) * 18); st = hov(0.13, -0.1); st.pos.y += b + 0.04 * Math.exp(-(t - C.flash) * 6); st.vapor = seg(t, C.flash, C.flash + 0.12, E.out); }
      st.heat = 0.32 + 0.68 * seg(t, 8.9, 9.5);
    } else if (id === 'cushion_lift' || id === 'cushion_heat') st = { ...hov(0.26), heat: 1 };
    else if (id === 'giant_skate') { const x = -1.7 + 3.4 * seg(t, C.skate, 18.45, E.io); st = { ...hov(0.13, x), heat: 1 }; st.vel = 3.4 / (18.45 - C.skate); }
    else st = { ...hov(0.13), heat: 1 };
    return st;
  }

  function camera(t) {
    const s = shotAt(t), u = s.u, G = V(...GIANT), pp = V(...PAN_POS);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    switch (s.id) {
      case 'hook_drop': return { pos: L(g(0.3, 2.05, 3.6), g(0.25, 1.98, 3.25)), target: g(0, 1.42, 0), fov: 40 };
      case 'react_pan': { const k = seg(t, 2.55, 3.25, E.io); return { pos: V(0.2, 1.4 + 0.08 * k, 0.5 - 0.04 * u), target: V(0.06, 1.0, -0.18).lerp(V(0.05, 1.56, -0.45), k), fov: 44 }; }
      case 'giant_warm': return { pos: L(g(0.3, 2.0, 6.6), g(0.2, 1.9, 6.1)), target: g(0.1, 1.2, 0), fov: 44 };
      case 'giant_hot': return { pos: L(g(-0.35, 2.0, 6.4), g(-0.2, 1.9, 5.8)), target: g(-0.05, 1.2, 0), fov: 44 };
      case 'cushion_lift': return { pos: L(g(0.4, 1.42, 3.1), g(0.32, 1.38, 2.8)), target: g(0, 1.12, 0), fov: 40 };
      case 'cushion_heat': return { pos: L(g(-0.4, 1.38, 3.0), g(-0.3, 1.34, 2.7)), target: g(0, 1.1, 0), fov: 40 };
      case 'giant_skate': { const x = giant(t, 'giant_skate').pos.x; return { pos: g(0.35 * x, 2.4, 7.4), target: g(0.45 * x, 1.15, 0), fov: 44 }; }
      case 'proof_pan': return { pos: L(V(0.2, 1.075, 0.13), V(0.17, 1.065, 0.085)), target: pp.clone().add(V(0, 0.05, 0)), fov: 34 };
      case 'test_sizzle': return { pos: L(V(0.075, 1.42, 0.2), V(0.072, 1.38, 0.17)), target: pp.clone().add(V(0, 0.03, -0.02)), fov: 42 };
      case 'test_skate': return { pos: L(V(0.072, 1.38, 0.17), V(0.07, 1.35, 0.14)), target: pp.clone().add(V(0, 0.03, -0.02)), fov: 42 };
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      warmTag: W('giant_warm', C.warmTag, C.sizzleTag - 0.05), sizzleTag: W('giant_warm', C.sizzleTag),
      hotTag: W('giant_hot', C.hotTag, C.steamTag - 0.05), steamTag: W('giant_hot', C.steamTag),
      liftTag: W('cushion_lift', C.liftTag), heatTag: W('cushion_heat', C.heatTag), skateTag: W('giant_skate', C.skateTag),
      proofTag: W('proof_pan', C.proofTag), notYetTag: W('test_sizzle', C.notYetTag), readyTag: W('test_skate', C.readyTag),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, handR, cafeDrop, giant, camera, overlay, cues: C };
}
