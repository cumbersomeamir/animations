// Shots, acting, vessel/magnet paths and giant induction states for
// "इंडक्शन पर बर्तन गर्म कैसे होता है?" (Recall, Hindi episode 04). Everything is a pure function of t.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const STOVE_POS = [0.0, 0.951, -0.17];
export const GIANT = [30, 0, 0];
const COUNTER = 0.951;

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [1.0, 3.3, 9.0, 17.9, 23.0, 27.0, 29.3];
  const zone = V(STOVE_POS[0], STOVE_POS[1] + 0.053, STOVE_POS[2] - 0.02);

  // ---------------- props: where the pot, pan and magnet are; steam; stove LEDs
  function props(t) {
    const p = {};
    const potAside = V(-0.31, COUNTER, -0.12), panAside = V(0.31, COUNTER, -0.1);
    const potTest = V(-0.15, COUNTER, -0.08), panTest = V(0.15, COUNTER, -0.06);
    if (t < 17.35) { p.pot = zone.clone(); p.pan = panAside.clone(); }
    else if (t < 19.95) { p.pot = potAside.clone(); p.pan = zone.clone(); }
    else if (t < 22.6) { p.pot = potTest.clone(); p.pan = panTest.clone(); }
    else { p.pot = zone.clone(); p.pan = panAside.clone(); }
    p.potSteam = t < 17.35 ? seg(t, C.steam0, 2.2) : t >= 22.6 ? seg(t, C.steam2, 24.0) : 0;
    p.leds = t < 19.95 || t >= 22.6 ? 4 : 0;
    // magnet: in the hand -> on the aluminium pan (slides off) -> picked up -> sticks to the steel pot
    const aSide = (v, R, h) => v.clone().add(V(0, h, R + 0.006));
    const rest = V(0.24, COUNTER + 0.004, 0.02), hold = V(0.2, 1.06, 0.0);
    const onPan = aSide(panTest, 0.085, 0.022), onPot = aSide(potTest, 0.078, 0.035), floor = V(0.15, COUNTER + 0.014, 0.04);
    let m = rest.clone(), tilt = 0, inHand = false;
    if (t >= 19.95 && t < 22.6) {
      if (t < C.magAlu) { m = hold.clone().lerp(onPan, seg(t, 19.95, C.magAlu, E.io)); inHand = true; }
      else if (t < C.magSlip) { m = onPan.clone(); inHand = true; }
      else if (t < C.magSlip + 0.35) { const k = seg(t, C.magSlip, C.magSlip + 0.35, E.in); m = onPan.clone().lerp(floor, k); tilt = 1.3 * k; }
      else if (t < C.magPot) { const k = seg(t, C.magSlip + 0.45, C.magPot - 0.05, E.io); m = floor.clone().lerp(onPot, k); tilt = 1.3 * (1 - k); inHand = k > 0; }
      else { m = onPot.clone(); inHand = t < C.magStick + 0.1; }
      if (t >= C.magStick && t < C.magStick + 0.25) m.z += 0.004 * Math.sin((t - C.magStick) * 40) * (1 - (t - C.magStick) / 0.25);
    } else if (t >= 22.6) m = V(-0.33, COUNTER + 0.004, 0.06);
    p.magnet = m; p.magnetTilt = tilt; p.magnetInHand = inHand;
    p.cupInHand = t > C.sip - 0.4 && t < C.sip + 1.4;
    return p;
  }

  // ---------------- performer (continuous; shots cut around it)
  function person(t, W) {
    const q = { pos: ROOT };
    const peek = win(t, C.peek, 2.75, 0.35, 0.3);
    q.lean = key(t, [[0, 0.06], [30, 0.06]]) + 0.2 * peek + 0.08 * win(t, 17.35, 19.05, 0.3, 0.2) + 0.1 * win(t, 19.95, 22.6, 0.3, 0.3) - 0.05 * pulse(t, C.sip - 0.2, C.sip + 1.4);
    q.twist = 0;
    q.tilt = 0.12 * peek + key(t, [[0, 0], [19.05, 0], [19.4, 0.04], [19.95, 0], [30, 0]]);
    q.headPitch = 0.42 * peek + key(t, [[0, 0.3], [1.4, 0.2], [17.35, 0.25], [18.3, 0.12], [19.05, 0.0], [19.95, 0.38], [22.6, 0.3], [24.3, 0.05], [24.9, 0.0], [26.4, 0.25], [27.0, 0.0], [C.sip - 0.2, -0.12], [C.sip + 1.0, -0.1], [28.6, 0.02], [30, 0.0]]);
    q.headYaw = key(t, [[0, 0.05], [1.4, -0.06], [17.35, 0.1], [18.4, 0.0], [19.05, 0.0], [30, 0.04]]);
    q.headRoll = 0.1 * peek + key(t, [[0, 0], [17.35, 0], [18.2, 0.07], [19.05, 0.0], [24.4, 0.0], [24.9, 0.06], [25.8, 0.0], [29.0, 0.0], [29.4, 0.06], [30, 0.06]]);
    q.look = key(t, [[0, [0, -0.7]], [1.4, [0.1, -0.85]], [2.6, [0.1, -0.85]], [17.35, [0.15, -0.75]], [18.5, [0.2, -0.5]], [19.05, [0, 0.12]], [19.95, [0, -0.85]],
      [22.6, [0, -0.8]], [24.3, [0, 0.0]], [26.4, [0, -0.6]], [27.0, [0, 0.1]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14));
    q.blink = Math.max(bl, 0.9 * pulse(t, C.deadpanBlink, C.deadpanBlink + 0.42), 0.85 * win(t, C.sip + 0.1, C.sip + 0.7, 0.1, 0.1));
    q.squint = key(t, [[0, 0.1], [1.4, 0.35], [2.7, 0.3], [17.35, 0.2], [18.4, 0.35], [19.05, 0.42], [19.95, 0.4], [20.3, 0.1], [30, 0.0]]);
    const brow = key(t, [[0, 0.25], [1.4, 0.5], [2.7, 0.45], [17.35, 0.0], [18.4, -0.25], [19.95, -0.1], [20.3, 0.2], [21.9, 0.6], [22.6, 0.4], [24.6, 0.55], [30, 0.4]]);
    q.browL = brow + 0.4 * peek; q.browR = brow;
    q.browAngle = key(t, [[0, 0.1], [17.35, 0.0], [18.4, -0.5], [19.95, -0.1], [20.3, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.3], [1.4, 0.15], [2.7, 0.2], [17.35, 0.1], [18.4, 0.0], [19.95, 0.0], [21.9, 0.6], [22.6, 0.4], [C.smile, 1.0], [30, 0.9]]);
    q.open = 0.3 * pulse(t, 1.6, 2.3) + 0.3 * pulse(t, 21.9, 22.4);
    q.frown = key(t, [[0, 0], [17.35, 0.0], [18.4, 0.45], [19.95, 0.3], [20.3, 0.0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    // hands
    const p = props(t), restR = V(0.2, 1.02, -0.3), restL = V(-0.22, 0.985, -0.32);
    q.handR = p.magnetInHand ? p.magnet.clone().add(V(0.055, 0.02, 0.0)) : t >= 19.95 && t < 22.6 ? V(0.18, 1.12, -0.12) : restR;
    const tap = 0.012 * Math.abs(Math.sin((t - C.waitTap) * 9)) * win(t, C.waitTap, 19.0, 0.1, 0.1);
    q.handL = t >= 17.35 && t < 19.05 ? V(-0.16, 0.975 + tap, -0.2) : restL;
    if (p.cupInHand) q.handL = W.cupTarget(t);
    return q;
  }

  // ---------------- giant induction states
  function giant(t) {
    const g = { t };
    g.coilGlow = pulse(t, C.coilTag - 0.2, C.coilTag + 1.2);
    g.loops = t < 17.35 ? seg(t, C.field, C.field + 0.6) : 1;
    g.flip = Math.sign(Math.sin(2 * Math.PI * 0.9 * (t - C.flip))) || 1;
    g.pulse = Math.abs(Math.sin(2 * Math.PI * 0.9 * (t - C.flip)));
    g.potY = t < C.potDown ? 3 : key(t, [[C.potDown, 1.6], [C.potDown + 0.35, 0.0, E.in], [C.potDown + 0.5, 0.06, E.out], [C.potDown + 0.62, 0.0, E.in], [30, 0]]);
    g.potX = t < 15.25 ? 0 : -3.2 * seg(t, 15.25, 15.6, E.in);
    g.panX = t < 15.25 ? 4 : 3.2 * (1 - seg(t, 15.3, 15.75, E.out3));
    g.eddy = t < 15.25 ? seg(t, C.eddy, C.eddy + 0.5) : 0;
    g.eddyAlu = t >= 15.6 ? 0.22 * (0.5 + 0.5 * Math.sin(t * 17)) : 0;
    g.heat = t < 15.25 ? seg(t, C.heat, C.heat + 1.0) : 0;
    g.bubbles = t < 15.25 ? seg(t, C.bubbles, C.bubbles + 0.4) : 0;
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, UP = V(0, 1, 0);
    switch (s.id) {
      case 'stove_cu': return { pos: L(zone.clone().add(V(0.2, 0.27, 0.52)), zone.clone().add(V(0.16, 0.24, 0.44))), target: zone.clone().add(V(0, 0.03, 0.04)), fov: 36 };
      case 'react': return { pos: L(V(-0.26, 1.52, 0.52), V(-0.22, 1.52, 0.43)), target: head.clone().add(V(0, -0.02, 0)), fov: 34 };
      case 'pot_steam': return { pos: L(zone.clone().add(V(-0.09, 0.21, 0.23)), zone.clone().add(V(-0.07, 0.19, 0.19))), target: zone.clone().add(V(0, 0.085, 0)), fov: 34 };
      case 'giant_coil': return { pos: L(G.clone().add(V(2.3, 2.5, 3.8)), G.clone().add(V(1.7, 2.2, 3.1))), target: G.clone().add(V(0, 0.75, 0.2)), fov: 46 };
      case 'giant_field': return { pos: L(G.clone().add(V(-1.8, 1.7, 3.3)), G.clone().add(V(-1.35, 1.6, 2.8))), target: G.clone().add(V(0, 1.05, 0)), fov: 46 };
      case 'giant_eddy': return { pos: L(G.clone().add(V(1.5, 2.9, 3.0)), G.clone().add(V(1.1, 2.6, 2.5))), target: G.clone().add(V(0, 0.95, 0)), fov: 46 };
      case 'giant_heat': return { pos: L(G.clone().add(V(-0.5, 1.6, 3.3)), G.clone().add(V(-0.3, 1.45, 2.8))), target: G.clone().add(V(0, 1.05, 0)), fov: 46 };
      case 'giant_alu': return { pos: L(G.clone().add(V(1.1, 2.4, 3.3)), G.clone().add(V(0.8, 2.2, 2.8))), target: G.clone().add(V(0, 0.95, 0)), fov: 46 };
      case 'alu_real': return { pos: L(V(0.5, 1.62, 1.38), V(0.45, 1.62, 1.22)), target: V(-0.02, 1.45, -0.3), fov: 42 };
      case 'deadpan': return { pos: L(V(0.04, 1.66, 0.5), V(0.04, 1.66, 0.38), E.lin), target: head.clone().add(V(0, -0.02, 0)), fov: 30 };
      case 'magnet_test': {
        const pan = V(0.15, COUNTER + 0.03, -0.06), pot = V(-0.15, COUNTER + 0.04, -0.08);
        const tg = pan.clone().lerp(pot, seg(t, 21.3, 21.8, E.io));
        return { pos: tg.clone().add(V(0.03 - 0.03 * u, 0.07, 0.5 - 0.05 * u)), target: tg.clone().add(V(0, 0.015, 0)), fov: 38 };
      }
      case 'pot_back': return { pos: L(zone.clone().add(V(0.11, 0.21, 0.31)), zone.clone().add(V(0.085, 0.19, 0.26))), target: zone.clone().add(V(0, 0.06, 0)), fov: 36 };
      case 'smile': return { pos: L(V(-0.22, 1.62, 0.46), V(-0.17, 1.63, 0.34)), target: head.clone().add(V(0, -0.03, 0)), fov: 32 };
      case 'cafe_wide': return { pos: L(V(0.1, 1.7, 1.75), V(0.14, 1.8, 2.3)), target: L(V(0.0, 1.61, -0.35), V(0.0, 1.65, -0.42)), fov: 44 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      coilTag: win(t, C.coilTag, 7.25, 0.25, 0.05), fieldTag: win(t, 7.4, 9.15, 0.25, 0.05), eddyTag: win(t, C.eddyTag, 12.95, 0.25, 0.05),
      baseTag: win(t, 13.5, 15.25, 0.25, 0.05), glassTag: win(t, 14.2, 15.25, 0.25, 0.05), aluTag: win(t, C.aluTag + 0.2, 17.35, 0.25, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, props, person, giant, camera, overlay, cues: C, zone };
}
