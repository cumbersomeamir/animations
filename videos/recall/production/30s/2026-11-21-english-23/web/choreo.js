// Shots, acting, props and cameras for "How does it see smoke?" (Recall, english-23). Everything is a pure function of t.
//
// Mechanism (US EPA "Photoelectric Technology", archived 2009; Nebraska State Fire Marshal "Photoelectric smoke alarms"; USFA
// "Smoke alarms" + pictograph "When to test smoke alarms"): in many alarms (photoelectric type) an LED shines across a chamber at an
// angle away from the photocell, so in clean air no light reaches it; smoke particles scatter some of the light in all directions
// and some reaches the photocell; when enough light reaches it, the alarm sounds. Steam can also set an alarm off (USFA). Test
// alarms at least once a month using the test button (USFA). Particle sizes, counts, ray lengths and timings are illustrative.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp, rng } from './anim.js';
import { ALARM, CH } from './smoke.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const GIANT = [30, 0, 0];
export const TOASTER = [0.45, 0.95, -0.12];
export const KETTLE = [-0.46, 0.95, -0.12];

// deterministic particle tables
const SMOKE = (() => { const r = rng(2311); return Array.from({ length: 60 }, (_, i) => ({ t0: i * 0.055 + r() * 0.04, x: -1.3 + r() * 1.5, y: 0.12 + r() * 0.7, ph: r() * 6.28, sp: 0.62 + r() * 0.25, rad: 0.05 + r() * 0.045, dir: r() })); })();
const STEAM = (() => { const r = rng(919); return Array.from({ length: 40 }, (_, i) => ({ t0: i * 0.04 + r() * 0.03, x: -1.3 + r() * 1.5, y: 0.15 + r() * 0.65, ph: r() * 6.28, sp: 0.8 + r() * 0.25, rad: 0.085 + r() * 0.05, dir: r() })); })();
const PUFF = (() => { const r = rng(77); return Array.from({ length: 130 }, (_, i) => ({ t0: -3.75 + i * 0.07 + r() * 0.04, ox: (r() - 0.5) * 0.08, oz: (r() - 0.5) * 0.06, ph: r() * 6.28, s: 0.05 + r() * 0.035 })); })();
const VAPOR = (() => { const r = rng(5); return Array.from({ length: 60 }, (_, i) => ({ t0: 18.6 + i * 0.025 + r() * 0.02, ox: (r() - 0.5) * 0.05, oz: (r() - 0.5) * 0.05, ph: r() * 6.28, s: 0.05 + r() * 0.04 })); })();

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const T1 = id => tl.shots.find(s => s.id === id).t1;
  const blinks = [2.1, 4.7, 21.9, 25.6, 28.4];

  /** broom: origin (brush end, held) and unit direction of the pole */
  function broom(t) {
    const B = ALARM.clone().add(V(0, -0.066, 0));                       // underside of the test button
    const aim = seg(t, C.broomUp, C.broomUp + 1.1, E.io) * (1 - seg(t, C.cta, C.cta + 0.6, E.io)), poke = pulse(t, C.press - 0.18, C.press + 0.35);
    const restO = V(0.3, 0.98, -0.2), restD = V(0.35, 0.93, 0.1).normalize();
    const aimD = B.clone().sub(V(-0.1, 1.12, -0.3)).normalize();
    const D = restD.clone().lerp(aimD, aim).normalize();
    const O = restO.clone().lerp(B.clone().addScaledVector(aimD, -1.35 - 0.035), aim).addScaledVector(aimD, 0.035 * poke * aim);
    return { O, D, press: clamp(poke * 1.4) };
  }

  function person(t) {
    const q = { yaw: 0 }, b = broom(t);
    const flinch = seg(t, C.screams, C.screams + 0.15, E.out) * (1 - seg(t, 3.4, 3.9));
    const startle = pulse(t, C.toastPop, C.toastPop + 0.5);
    q.lean = -0.06 * flinch + 0.03; q.tilt = key(t, [[0, 0], [3.3, 0], [3.7, 0.06], [5.25, 0.06], [20.65, 0], [30, 0.02]]);
    // where the head points
    const upToAlarm = t >= 3.25 && t < 5.25 ? 1 : t >= 20.65 && t < 21.35 ? 1 : t >= 22.2 && t < 26.45 ? 0.85 : 0;
    const atToast = t >= 1.45 && t < C.screams ? 1 : 0;
    q.headPitch = key(t, [[0, 0.05], [1.5, 0.05]]) + (atToast ? 0.28 : 0) - 0.42 * upToAlarm - 0.3 * flinch * (1 - upToAlarm);
    q.headYaw = atToast ? 0.45 : upToAlarm ? 0.22 : 0.02;
    q.headRoll = (t >= 3.25 && t < 5.25 ? 0.12 : 0) + (t >= 26.45 ? 0.03 : 0);
    q.look = upToAlarm ? [0.25, 0.7] : atToast ? [0.5, -0.4] : [0, 0.05];
    let bl = 0; for (const x of blinks) bl = Math.max(bl, pulse(t, x, x + 0.14)); q.blink = Math.max(bl, t >= 20.75 && t < 22.2 ? 0.42 : 0);   // deadpan: half-lidded
    q.squint = 0.6 * flinch + (t >= 3.25 && t < 5.25 ? 0.25 : 0);
    q.browL = 0.5 + 0.6 * startle + (t >= 3.25 && t < 5.25 ? 0.5 : 0) - (t >= 20.75 && t < 22.2 ? 0.4 : 0);
    q.browR = 0.5 + 0.6 * startle + (t >= 3.25 && t < 5.25 ? -0.15 : 0) - (t >= 20.75 && t < 22.2 ? 0.4 : 0);
    q.browAngle = 0.1 + 0.5 * flinch;
    q.smile = key(t, [[0, 0.15], [2.3, 0.15], [2.45, -0.1], [5.25, 0.1], [20.6, 0.1], [20.8, 0], [22.2, 0.1], [C.smile, 0.2], [C.smile + 0.4, 0.85], [26.45, 0.7], [C.smile2, 0.95], [30, 0.9]]);
    q.frown = 0.6 * flinch; q.open = 0.25 * startle + 0.15 * pulse(t, 3.4, 4.6);
    // hands
    const rest = [V(-0.24, 0.97, -0.33), V(0.24, 0.97, -0.33)];
    let L = rest[0], R = rest[1];
    if (t >= 1.45 && t < 3.6) { const ear = V(-0.11, 1.7, -0.55); L = rest[0].clone().lerp(ear, flinch); }   // covers an ear
    if (t >= 22.2 && t < 30) { L = b.O.clone().addScaledVector(b.D, 0.16); R = b.O.clone().addScaledVector(b.D, 0.46); }
    if (t >= 26.45) { const k = seg(t, 26.45, 26.9); L = L.clone().lerp(V(-0.2, 0.98, -0.33), k); R = R.clone().lerp(b.O.clone().addScaledVector(b.D, 0.35), 0); }
    q.handL = L; q.handR = R;
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  function toaster(t) { return seg(t, C.toastPop, C.toastPop + 0.12, E.out) + 0.15 * Math.max(0, Math.sin((t - C.toastPop) * 30)) * Math.exp(-(t - C.toastPop) * 9) * (t > C.toastPop ? 1 : 0); }

  /** café alarm: LED + blaring rings + press */
  function alarm(t, shot) {
    const blare = (t >= C.screams && t < 5.25) || shot === 'alarm_blare' || (shot === 'react_deadpan') ? 1 : 0;
    const flash = blare ? (Math.floor(t * 4) % 2 === 0 ? 1 : 0) : (Math.floor(t * 0.8) % 4 === 0 ? 0.6 : 0);   // standby blink when quiet
    const chirp = pulse(t, C.press, C.press + 0.4);
    return { ledOn: Math.max(flash, chirp > 0.05 ? 1 : 0), blare: Math.max(blare, chirp), t, press: broom(t).press };
  }

  /** puffs: café smoke from the toaster (always rising, spreading under the ceiling) and kettle steam (react_deadpan). */
  function puffs(t) {
    const out = [], top = ALARM.y - 0.12;
    const rise = (P, src, kind, t0off = 0) => {
      const age = t - P.t0 - t0off, life = kind === 'steam' ? 2.1 : 6; if (age < 0 || age > life) return;
      const vy = kind === 'steam' ? 0.75 : 0.55;
      const tUnder = Math.max(0, age - (top - src[1] - 0.18) / vy);
      const toAlarm = V(ALARM.x - src[0], 0, ALARM.z - src[2]);
      const spread = Math.min(1, tUnder * 0.6);
      const y = Math.min(src[1] + 0.18 + age * vy, top - 0.02 * (1 + Math.sin(age * 2 + P.ph)));   // rises, then spreads just under the ceiling
      const p = V(src[0] + P.ox + toAlarm.x * spread + Math.sin(age * 1.7 + P.ph) * 0.04 * (1 + age), y, src[2] + P.oz + toAlarm.z * spread + Math.cos(age * 1.3 + P.ph) * 0.035 * (1 + age));
      const s = P.s * (1 + age * 0.55) * (kind === 'steam' ? 0.9 * (1 - Math.min(1, Math.max(0, (age - life + 0.5) / 0.5))) : 1);   // steam shrinks away at the end of its life
      const a = Math.min(1, age * 3) * (1 - Math.max(0, (age - 4.5) / 1.5));
      out.push({ p, s, a, kind });
    };
    for (const P of PUFF) rise(P, TOASTER, 'smoke');
    for (const P of VAPOR) rise(P, [KETTLE[0] + 0.15, KETTLE[1], KETTLE[2]], 'steam');
    return out;
  }

  /** giant chamber state: cover lift, beam, particles + rays, sensor level */
  function chamber(t, shot) {
    const cover = shot === 'giant_open' ? seg(t, C.coverLift, C.coverLift + 1.1, E.io) : 1;
    const beam = shot === 'giant_open' ? seg(t, C.coverLift + 0.8, C.coverLift + 1.2) : 1;
    const parts = [], rays = [];
    const smoky = ['giant_scatter', 'giant_hit'].includes(shot), steamy = shot === 'steam_giant';
    const list = smoky ? SMOKE : steamy ? STEAM : [];
    const tin = smoky ? C.smokeIn - 0.7 : C.steamIn - 0.9;
    const hl = smoky ? seg(t, C.hit - 0.25, C.hit + 0.15) : 1;   // hit rays highlighted once the narration says so
    let lit = 0;
    list.forEach((P, i) => {
      const age = t - tin - P.t0; if (age < 0) return;
      const x = 2.5 - age * P.sp, z = P.x + 0.15 * Math.sin(age * 1.1 + P.ph), y = P.y + 0.08 * Math.sin(age * 1.7 + P.ph * 2);
      if (x < -2.3 || (shot === 'giant_hit' && z > 0.6)) return;   // no huge foreground blobs in the close shot
      const d = Math.hypot(y - CH.led.y, z - CH.led.z), inBeam = x > CH.led.x + 0.2 && x < CH.trap.x - 0.25 ? clamp(1 - (d - 0.12) / 0.22) : 0;
      const p = V(x, y, z);
      parts.push({ p, r: P.rad * (steamy ? 1 : 1), kind: steamy ? 'steam' : 'smoke', lit: inBeam });
      if (inBeam > 0.05) {
        lit += inBeam;
        const r = rng(1000 + i * 7 + Math.floor(t * 6));   // rays flicker a few times per second
        for (let k = 0; k < 4; k++) {
          const th = r() * Math.PI * 2, ph = (r() - 0.5) * 2.4, L = 0.35 + r() * 0.6;
          rays.push({ a: p, b: p.clone().add(V(Math.cos(th) * Math.cos(ph), Math.sin(ph) * 0.6, Math.sin(th) * Math.cos(ph)).multiplyScalar(L)), c: inBeam * 0.9 });
        }
        if ((i % 3) === 0) rays.push({ a: p, b: CH.sensor.clone().add(V(0, 0.05, -0.05)), c: inBeam, hit: hl > 0.5 });
      }
    });
    const level = clamp(lit / 4.5) * (smoky ? 0.2 + 0.8 * hl : 1) * (shot === 'giant_hit' ? 0.6 + 0.4 * seg(t, C.hit, C.blare2) : 1);
    return { cover, beam, parts, rays, level };
  }

  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u)), g = (x, y, z) => G.clone().add(V(x, y, z));
    const A = ALARM;
    switch (s.id) {
      case 'hook_alarm': return { pos: L(V(-0.4, 2.0, 0.5), V(-0.38, 2.04, 0.42)), target: L(V(-0.2, 2.66, -0.22), V(-0.2, 2.66, -0.2)), fov: 38 };
      case 'toast_react': return { pos: L(V(0.62, 1.42, 1.45), V(0.56, 1.44, 1.3)), target: V(0.25, 1.33, -0.38), fov: 44 };
      case 'face_q': return { pos: L(V(0.36, 1.42, 0.5), V(0.33, 1.44, 0.42)), target: V(0.06, 1.68, -0.5), fov: 42 };
      case 'giant_open': return { pos: L(g(0.2, 5.0, 6.6), g(0.1, 4.3, 5.7)), target: g(0, 0.5, 0), fov: 46 };
      case 'giant_miss': return { pos: L(g(-2.7, 2.0, 2.6), g(-2.3, 1.85, 2.75)), target: g(0.2, 0.42, -0.95), fov: 46 };
      case 'giant_scatter': return { pos: L(g(0.7, 3.0, 4.3), g(0.55, 2.75, 3.9)), target: g(0.25, 0.45, -0.8), fov: 44 };
      case 'giant_hit': return { pos: L(g(1.5, 1.6, 1.45), g(1.3, 1.45, 1.15)), target: g(0.2, 0.45, -1.35), fov: 44 };
      case 'steam_giant': return { pos: L(g(-0.6, 3.0, 4.3), g(-0.45, 2.75, 3.9)), target: g(0.25, 0.45, -0.8), fov: 44 };
      case 'alarm_blare': return { pos: L(V(0.0, 1.98, 0.62), V(0.04, 2.02, 0.5)), target: A.clone().add(V(0, -0.02, 0)), fov: 36 };
      case 'react_deadpan': return { pos: L(V(-0.75, 1.5, 1.3), V(-0.68, 1.52, 1.16)), target: V(-0.12, 1.92, -0.35), fov: 52 };
      case 'test_wide': return { pos: L(V(-0.75, 1.35, 1.75), V(-0.7, 1.4, 1.6)), target: V(-0.08, 1.95, -0.3), fov: 56 };
      case 'test_press': return { pos: L(V(-0.12, 1.98, 0.5), V(-0.08, 2.03, 0.42)), target: A.clone().add(V(0, -0.05, 0)), fov: 36 };
      case 'cafe_cta': return { pos: L(V(0.0, 1.72, 2.4), V(0.02, 1.82, 2.8)), target: L(V(-0.02, 1.36, -0.35), V(0.0, 1.4, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t, shot) {
    const W = (id, t0, t1) => (shot === id ? win(t, t0, t1 ?? T1(id), 0.2, 0.05) : 0);
    return {
      lightTag: W('giant_open', C.lightTag - 0.1), sensorTag: W('giant_miss', C.sensorTag), smokeTag: W('giant_scatter', C.smokeTag),
      hitTag: W('giant_hit', C.hit + 0.1), steamTag: W('steam_giant', C.steamTag), buttonTag: W('test_press', C.press - 0.35),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, broom, toaster, alarm, puffs, chamber, camera, overlay, cues: C };
}
