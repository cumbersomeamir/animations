// Shots, acting, phone-screen states, field model and cameras for "Why your phone compass points the wrong way near a
// speaker or a steel desk" (Recall, english-06). Everything is a pure function of t.
//
// Field model (illustrative, horizontal plane of the giant desk, north = -z): Earth's field is a uniform unit vector
// toward the north. A speaker's permanent magnet adds the field of a bar magnet (a + pole and a - pole along its axis).
// A steel plate has no field of its own; Earth's field magnetises it ("induced", soft iron), so it is modelled as a bar
// magnet aligned with Earth's field. Both fall off quickly with distance. Needles and the chip point along the total.
// The phone believes "north" is where the field points, so on a north-up map the direction beam turns the opposite way.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';
import { GPHONE } from './lowpoly.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const ROOT_AWAY = [-0.75, 0, -0.55];      // a few steps along the counter, away from the speaker
export const SPEAKER_POS = [0.42, 0.95, -0.12];  // real speaker on the counter (axis along x)
export const GIANT = [30, 0, 0];

// giant layout (relative to GIANT, table plane): speaker west of the phone, steel plate to the north-east
export const MAG_AT = [-2.05, -1.3], STEEL_AT = [0.75, -2.6], PHONE_AWAY = [0.35, 2.65];
const MAG_HALF = 0.3, STEEL_HALF = 0.5;

function poleField(px, pz, q, x, z) {
  const dx = x - px, dz = z - pz, r2 = dx * dx + dz * dz + 0.03, r3 = r2 * Math.sqrt(r2);
  return [q * dx / r3, q * dz / r3];
}
/** Total horizontal field at desk point (x, z) for state {mag:[x,z]|null, steel:[x,z]|null}. Earth = (0, -1). */
export function fieldAt(x, z, st, Q = QS) {
  let bx = 0, bz = -1;
  if (st.mag) {   // + pole on the far (west) end, - pole facing the phone: nearby needles point toward the speaker
    const a = poleField(st.mag[0] - MAG_HALF, st.mag[1], Q.mag, x, z), b = poleField(st.mag[0] + MAG_HALF, st.mag[1], -Q.mag, x, z);
    bx += a[0] + b[0]; bz += a[1] + b[1];
  }
  if (st.steel) { // induced along Earth's field: + pole at the north end, - pole at the south end
    const a = poleField(st.steel[0], st.steel[1] - STEEL_HALF, Q.steel, x, z), b = poleField(st.steel[0], st.steel[1] + STEEL_HALF, -Q.steel, x, z);
    bx += a[0] + b[0]; bz += a[1] + b[1];
  }
  return [bx, bz];
}
/** Deflection of the field from north (rad, + = clockwise seen from above / on a north-up map). */
export const deflect = ([bx, bz]) => Math.atan2(bx, -bz);
export const chipAt = (ph = GPHONE.pos) => [ph[0] + GPHONE.chip[0], ph[1] + GPHONE.chip[1]];
// pole strengths tuned so the chip swings ~80° next to the speaker and ~35° next to the steel plate
function solve(fn, target) { let lo = 0, hi = 50; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (Math.abs(fn(m)) < target ? (lo = m) : (hi = m)); } return (lo + hi) / 2; }
export const QS = { mag: 0, steel: 0 };
QS.mag = solve(q => deflect(fieldAt(...chipAt(), { mag: MAG_AT }, { mag: q, steel: 0 })), 74 * Math.PI / 180);
QS.steel = solve(q => deflect(fieldAt(...chipAt(), { steel: STEEL_AT }, { mag: 0, steel: q })), 32 * Math.PI / 180);

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [1.2, 5.0, 9.5, 20.4, 24.0, 27.6, 29.3];
  const rootX = t => ROOT[0] + (ROOT_AWAY[0] - ROOT[0]) * seg(t, 18.8, 20.6, E.io);
  const f8 = t => { const u = clamp((t - (C.fig8 + 0.1)) / (C.fig8End - C.fig8 - 0.1)), w = 2 * Math.PI * 2 * u; return { u, x: 0.11 * Math.sin(w), y: 0.055 * Math.sin(2 * w), on: t > C.fig8 && t < C.fig8End + 0.15 }; };

  // ---------------- performer (behind the counter; legs hidden)
  function person(t) {
    const rx = rootX(t), dx = rx - ROOT[0];
    const q = { pos: [rx, 0, ROOT[2]], yaw: 0 };
    const up = V(0.06 + dx, 1.22, -0.30), near = V(0.255, 1.055, -0.2);
    let hr;
    if (t < 2.4) hr = up.clone().lerp(near, E.io(seg(t, 0.1, 0.5, E.lin)) * (1 - seg(t, 1.75, 2.35)));
    else hr = up.clone();
    const F = f8(t);
    if (F.on) hr.add(V(F.x, F.y, 0.02 * Math.sin(F.u * Math.PI * 8)));
    q.handR = hr; q.phoneUp = 1;
    q.handL = V(-0.22 + dx, 0.985, -0.32);
    const follow = seg(t, C.follow, C.follow + 0.6, E.io) * (1 - seg(t, 4.2, 4.35));
    q.twist = 0.32 * follow;
    q.lean = key(t, [[0, 0.1], [0.5, 0.16], [1.8, 0.16], [2.4, 0.06], [30, 0.04]]);
    q.tilt = key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.07], [4.35, 0.07], [17.6, 0], [18.0, 0.03], [18.6, 0], [24.7, 0], [25.2, 0.05], [26.35, 0.02], [30, 0.03]]);
    const lookPhone = 0.42;
    q.headPitch = key(t, [[0, lookPhone], [0.5, 0.5], [1.8, 0.5], [2.4, lookPhone], [C.follow, 0.3], [C.puzzled, 0.1], [4.35, 0.1], [17.6, 0.02], [18.6, 0.02], [21.0, 0.32], [23.2, 0.36], [24.7, 0.05], [26.35, 0.0], [30, 0.0]]);
    q.headYaw = 0.45 * follow + key(t, [[0, 0], [4.35, 0], [24.7, 0], [25.3, 0.1], [26.35, 0.0], [30, 0.05]]);
    q.headRoll = key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.1], [4.35, 0.1], [17.6, 0], [30, 0.03]]);
    q.look = key(t, [[0, [0, -0.7]], [2.4, [0, -0.7]], [C.follow + 0.3, [0.6, -0.2]], [C.puzzled, [0.3, 0.1]], [4.35, [0.3, 0.1]], [17.6, [0, 0.1]], [18.6, [0, 0.1]], [21.0, [0, -0.6]], [24.7, [0, -0.6]], [25.0, [0, 0.12]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14));
    q.blink = Math.max(bl, 0.9 * pulse(t, C.deadpanBlink, C.deadpanBlink + 0.42));
    q.squint = key(t, [[0, 0.1], [0.6, 0.35], [2.4, 0.3], [C.puzzled, 0.4], [4.35, 0.35], [17.6, 0.45], [18.6, 0.4], [21.0, 0.2], [23.2, 0.0], [30, 0]]);
    const brow = key(t, [[0, 0.2], [0.6, 0.9], [1.6, 0.6], [C.puzzled, 0.1], [4.35, 0.0], [17.6, -0.15], [18.6, -0.15], [21.0, 0.2], [24.7, 0.3], [25.0, 0.9], [26.3, 0.5], [30, 0.4]]);
    q.browL = brow + key(t, [[0, 0], [C.puzzled, 0], [C.puzzled + 0.3, 0.6], [4.35, 0.6], [4.5, 0], [30, 0]]); q.browR = brow;
    q.browAngle = key(t, [[0, 0.1], [C.puzzled, 0.1], [C.puzzled + 0.3, -0.35], [4.35, -0.3], [17.6, -0.2], [18.6, -0.2], [21.0, 0.1], [30, 0.12]]);
    q.smile = key(t, [[0, 0.3], [0.5, 0.0], [17.6, 0.0], [18.6, 0.0], [21.0, 0.15], [22.9, 0.2], [C.smile, 0.5], [24.9, 0.95], [30, 0.9]]);
    q.open = 0.35 * pulse(t, 0.55, 1.1) + 0.2 * pulse(t, 24.85, 25.4);
    q.frown = key(t, [[0, 0], [0.6, 0.3], [2.4, 0.3], [C.puzzled, 0.4], [4.35, 0.35], [17.6, 0.25], [18.6, 0.25], [21.0, 0.05], [22.9, 0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  // ---------------- real phone screen (north-up map; dot fixed, beam follows the compass reading)
  function screen(t) {
    const near = win(t, 0.38, 18.8, 0.24, 0.01);
    const jit = 0.13 * Math.sin(t * 17.3) + 0.08 * Math.sin(t * 29.1 + 1);
    let ang = 1.65 * E.out3(clamp((t - 0.38) / 0.3)) + near * jit;   // away from the speaker, as on the giant desk
    let width = 0.3 + 0.28 * near;
    if (t >= 18.8) {   // after stepping away: close to right but wide (unsure) until the figure 8
      const cal = seg(t, C.fig8 + 0.2, C.fig8End, E.io);
      ang = (0.32 + 0.12 * Math.sin(t * 6)) * (1 - cal); width = 0.85 - 0.57 * cal;
      if (t < C.fig8) { ang = 0.32 + 0.12 * Math.sin(t * 6); width = 0.85; }
    }
    if (t < 0.38) ang = 0;
    const F = f8(t);
    return { ang, width, pulse: clamp((t - C.narrow) / 0.6) * (t < C.narrow + 0.6 ? 1 : 0) || clamp(t / 0.5) * (t < 0.5 ? 1 : 0), ok: seg(t, C.narrow + 0.2, C.narrow + 0.45, E.back), rot: F.on ? 0.25 * Math.sin(F.u * Math.PI * 8) : 0 };
  }

  // ---------------- giant desk states
  function giant(t) {
    const g = {};
    g.sat = win(t, 4.35, 6.62, 0.05, 0.25);
    g.beam = win(t, C.gps - 0.05, 6.6, 0.25, 0.2);
    g.pulseT = t - C.gps;
    g.dotPing = clamp((t - C.dotPing) / 0.7) * (t > C.dotPing && t < C.dotPing + 0.7 ? 1 : 0);
    g.chipLift = seg(t, C.sensor - 0.35, C.sensor + 0.2, E.back) * (1 - seg(t, 21.0, 21.2));
    g.chipGlow = Math.max(pulse(t, C.sensor - 0.1, C.sensor + 0.9), t > C.sensor && t < 21 ? 0.45 : 0);
    g.screenGlow = win(t, C.sensor - 0.2, 9.2, 0.2, 0.1);
    g.streaks = win(t, C.field - 0.1, 13.6, 0.35, 0.4) * (1 - 0.7 * seg(t, C.weak - 0.1, C.weak + 0.4));
    // speaker: slides in from the west, out again; present (already placed) when stepping away
    const mIn = seg(t, C.magnetIn, C.magnetIn + 0.55, E.out3), mOut = seg(t, C.magnetOut, C.magnetOut + 0.35, E.in);
    const away = t >= 18.6;
    g.magX = away ? MAG_AT[0] : MAG_AT[0] - 3.0 * (1 - mIn) - 3.0 * mOut;
    g.magOn = away || (t > C.magnetIn - 0.05 && t < C.magnetOut + 0.4);
    const sIn = seg(t, C.steelIn, C.steelIn + 0.5, E.out3);
    g.steelZ = away ? STEEL_AT[1] : STEEL_AT[1] - 3.4 * (1 - sIn);
    g.steelOn = away || (t > C.steelIn - 0.05 && t < 17.7);
    const mv = seg(t, C.away, C.awayDone, E.io);
    g.phone = [GPHONE.pos[0] + (PHONE_AWAY[0] - GPHONE.pos[0]) * mv, GPHONE.pos[1] + (PHONE_AWAY[1] - GPHONE.pos[1]) * mv];
    g.st = { mag: g.magOn ? [g.magX, MAG_AT[1]] : null, steel: g.steelOn ? [STEEL_AT[0], g.steelZ] : null };
    g.unsure = t >= C.away ? seg(t, C.away + 0.6, C.awayDone + 0.2) : 0;   // reading back near north, beam still wide
    g.trail = mv;
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, rx = rootX(t);
    switch (s.id) {
      case 'hook_cu': case 'fixed_cu': {
        const back = W.phoneNormal.clone().multiplyScalar(s.id === 'hook_cu' ? 0.44 - 0.05 * u : 0.5 - 0.07 * u);
        const tg = s.id === 'hook_cu' ? W.phone.clone().lerp(V(...SPEAKER_POS), 0.12) : W.phone.clone().add(V(0, 0.02, 0));
        return { pos: W.phone.clone().add(back).add(V(0, 0.03, 0)), target: tg, fov: 44 };
      }
      case 'react': return { pos: L(V(0.62, 1.4, 1.0), V(0.55, 1.42, 0.9)), target: L(V(0.14, 1.6, -0.5), V(0.1, 1.62, -0.5)), fov: 46 };
      case 'deadpan': return { pos: L(V(0.04, 1.66, 0.5), V(0.04, 1.66, 0.38), E.lin), target: head.clone().add(V(0, -0.02, 0)), fov: 30 };
      case 'smile': return { pos: L(V(rx + 0.2, 1.68, 0.5), V(rx + 0.15, 1.68, 0.4)), target: head.clone().add(V(0, -0.03, 0)), fov: 34 };
      case 'fig8': return { pos: L(V(rx + 0.2, 1.46, 1.25), V(rx + 0.15, 1.47, 1.12)), target: L(V(rx - 0.06, 1.5, -0.45), V(rx - 0.08, 1.5, -0.45)), fov: 44 };
      case 'giant_gps': return { pos: L(G.clone().add(V(-0.4, 2.4, 5.4)), G.clone().add(V(-0.5, 5.0, 3.6))), target: L(G.clone().add(V(0.1, 4.1, -2.6)), G.clone().add(V(-0.5, 0.55, -0.9))), fov: 50 };
      case 'giant_sensor': { const c = W.chip; return { pos: L(c.clone().add(V(1.3, 2.0, 2.5)), c.clone().add(V(1.1, 1.8, 2.2))), target: c.clone().add(V(0.3, -0.1, 0.55)), fov: 46 }; }
      case 'giant_field': return { pos: L(G.clone().add(V(-0.3, 6.6, 4.0)), G.clone().add(V(-0.4, 6.1, 3.4))), target: G.clone().add(V(-0.4, 0.5, -1.2)), fov: 50 };
      case 'giant_magnet': return { pos: L(G.clone().add(V(-1.15, 6.0, 3.6)), G.clone().add(V(-1.25, 5.5, 3.0))), target: G.clone().add(V(-1.25, 0.5, -1.2)), fov: 50 };
      case 'giant_steel': return { pos: L(G.clone().add(V(0.05, 6.0, 3.1)), G.clone().add(V(0.0, 5.5, 2.6))), target: G.clone().add(V(0.0, 0.5, -1.8)), fov: 50 };
      case 'giant_away': return { pos: L(G.clone().add(V(0.0, 9.6, 6.0)), G.clone().add(V(0.05, 9.1, 5.6))), target: G.clone().add(V(0.0, 0.5, -0.05)), fov: 56 };
      case 'cafe_wide': return { pos: L(V(rx + 0.58, 1.74, 3.0), V(rx + 0.6, 1.84, 3.35)), target: L(V(rx + 0.56, 1.36, -0.35), V(rx + 0.58, 1.4, -0.42)), fov: 50 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      gpsTag: win(t, 5.25, 6.6, 0.2, 0.05), chipTag: win(t, C.sensor, 9.2, 0.2, 0.05), fieldTag: win(t, C.field + 0.05, 11.5, 0.25, 0.05),
      weakTag: win(t, C.weak, 13.05, 0.2, 0.1), magTag: win(t, C.magnetSwing - 0.1, 14.6, 0.2, 0.05), steelTag: win(t, 15.0, 17.6, 0.2, 0.05),
      awayTag: win(t, C.away + 0.2, 21.0, 0.25, 0.05), fig8Tag: win(t, C.fig8 + 0.35, 23.2, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, screen, giant, camera, overlay, f8, rootX, cues: C };
}
