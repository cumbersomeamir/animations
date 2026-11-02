// Shots, acting, phone-screen states and giant-QR states for "Why QR codes still scan with a logo".
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp, lerp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];
export const CARD_POS = [0.02, 0.95, -0.12];
export const GIANT = [30, 0, 0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };

  // ---------------- person performance (continuous; shots cut around it)
  const blinks = [1.1, 3.9, 6.0, 9.8, 12.9, 15.6, 18.7, 21.95, 24.0, 27.8, 29.4];
  function person(t, W) {
    const q = { pos: ROOT };
    const phoneUp = V(0.06, 1.22, -0.30), phoneHip = V(0.3, 1.0, -0.44), restL = V(-0.2, 0.985, -0.3);
    const shake = t > C.shake && t < C.shake + 0.7 ? 0.025 * Math.sin((t - C.shake) * 40) * pulse(t, C.shake, C.shake + 0.7) : 0;
    const scan = (a, b) => win(t, a, b, 0.3, 0.35);
    const up = Math.max(scan(C.raise, 4.3), scan(9.0, 17.95), scan(18.3, 26.4));
    const hr = phoneHip.clone().lerp(phoneUp, E.io(up)).add(V(shake, shake * 0.4, 0));
    q.handR = hr; q.phoneUp = up;
    // left hand: rest -> thumb on top-left marker -> slap sticker -> peel -> coffee
    const thumbP = W.cardPoint(505, 300, 0.03), stickP = W.cardPoint(300, 515, 0.025);
    const tracks = [
      [0, restL], [C.thumb - 0.35, restL], [C.thumb, thumbP, E.out3], [17.9, thumbP], [18.25, restL],
      [C.slap - 0.3, V(-0.25, 1.15, -0.25)], [C.slap, stickP, E.in], [C.slap + 0.25, V(-0.18, 1.08, -0.28), E.out3], [C.peel - 0.25, V(-0.18, 1.08, -0.28)],
      [C.peel, stickP, E.io], [C.peel + 0.45, V(-0.42, 1.3, -0.25), E.out3], [C.peel + 0.8, restL],
      [C.sip - 0.45, restL], [C.sip - 0.1, V(-0.43, 1.0, -0.1)], [C.sip + 0.55, V(-0.02, 1.52, -0.36)], [C.sip + 1.3, V(-0.02, 1.52, -0.36)],
      [C.sip + 1.9, V(-0.25, 1.05, -0.2)], [30, V(-0.25, 1.05, -0.2)],
    ];
    q.handL = trackV(tracks, t);
    q.cupInHand = t > C.sip - 0.1 && t < C.sip + 1.9;
    q.lean = key(t, [[0, 0.16], [1.5, 0.12], [3.3, 0.02], [3.6, -0.05], [4.1, 0.04], [14.3, 0.08], [C.thumb, 0.16], [17.9, 0.06], [C.slap, 0.14],
      [21.3, 0.0], [C.peel, 0.14], [24.2, 0.06], [26.1, 0.02], [30, 0.0]]);
    q.twist = key(t, [[0, 0], [C.thumb, -0.12], [17.9, 0], [C.slap, -0.15], [20.2, 0], [C.peel, -0.15], [23.6, 0], [30, 0]]);
    q.tilt = key(t, [[0, 0], [18.4, 0], [18.8, 0.05], [21.3, 0], [21.8, 0.06], [22.6, 0], [28.6, 0], [29.0, 0.05], [30, 0.05]]);
    q.headPitch = key(t, [[0, 0.32], [1.5, 0.28], [2.0, 0.42], [3.2, 0.42], [3.45, -0.06, E.out3], [4.0, 0.0], [12.3, 0.42], [14.4, 0.38], [C.thumb, 0.36],
      [17.9, 0.32], [18.6, 0.02], [19.0, 0.3], [20.2, 0.32], [21.3, 0.0], [22.7, 0.0], [23.0, 0.36], [24.2, 0.4], [25.4, 0.0], [25.7, 0.12], [25.9, 0.0],
      [C.sip + 0.4, -0.12], [C.sip + 1.4, -0.1], [28.4, 0.02], [30, 0.0]]);
    q.headYaw = key(t, [[0, -0.12], [1.6, -0.05], [3.3, 0.0], [3.6, 0.12], [4.0, 0.0], [17.9, 0.1], [18.6, -0.05], [19.0, 0.0], [21.3, 0.0], [22.7, 0.0], [28.4, 0.05], [30, 0.1]]);
    q.headRoll = key(t, [[0, 0.1], [1.6, 0.04], [3.3, 0.0], [3.6, -0.08], [4.0, 0.0], [21.3, 0.0], [21.9, 0.1], [22.6, 0.1], [22.8, 0.0], [28.6, 0.0], [29.1, 0.09], [30, 0.09]]);
    const look = key(t, [[0, [0.1, -0.8]], [1.7, [0, -0.8]], [3.3, [0, -0.6]], [3.5, [0, 0.1]], [4.0, [0, 0]], [12.2, [0, -0.7]], [17.9, [0, -0.7]], [18.6, [0, 0.15]],
      [19.0, [-0.3, -0.7]], [21.3, [0, 0.12]], [22.7, [0, 0.12]], [22.9, [-0.3, -0.7]], [24.2, [0, -0.7]], [25.3, [0, 0.0]], [28.4, [0, 0.15]], [30, [0.05, 0.15]]]);
    q.look = look;
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14)); bl = Math.max(bl, 0.85 * pulse(t, 21.8, 22.35)); q.blink = bl;
    const surprise = pulse(t, 3.25, 4.1);
    q.squint = key(t, [[0, 0.45], [1.6, 0.4], [2.8, 0.35], [3.0, 0], [14.4, 0], [C.thumb, 0.3], [17.9, 0.5], [18.6, 0.1], [21.3, 0.25], [22.7, 0], [30, 0]]);
    const browBase = key(t, [[0, 0.1], [1.7, 0.2], [3.0, 0.2], [3.3, 1.0], [4.0, 0.5], [17.9, -0.2], [18.6, -0.4], [19.0, 0.6], [20.1, 0.2], [21.3, -0.1], [22.7, -0.1],
      [24.55, 0.3], [24.8, 0.9], [25.8, 0.5], [30, 0.4]]);
    q.browL = browBase + key(t, [[0, 0.6], [1.6, 0.4], [3.0, 0], [30, 0]]); q.browR = browBase - key(t, [[0, 0.3], [1.6, 0.2], [3.0, 0], [30, 0]]);
    q.browAngle = key(t, [[0, 0.2], [3.0, 0.1], [17.9, -0.6], [18.6, -0.5], [19.0, 0.2], [21.3, 0.0], [30, 0.1]]);
    q.smile = key(t, [[0, 0.0], [2.8, 0.0], [3.6, 0.7], [4.0, 0.5], [12.3, 0.3], [14.4, 0.2], [17.9, 0], [19.0, 0.5], [20.1, 0.3], [21.3, 0], [22.7, 0], [24.55, 0.2],
      [24.9, 1.0], [26.0, 0.9], [30, 0.9]]) * (1 - surprise);
    q.open = clamp(0.55 * surprise + 0.25 * pulse(t, 24.6, 25.4));
    q.frown = key(t, [[0, 0.25], [1.6, 0.15], [2.8, 0], [17.9, 0.0], [18.2, 0.9], [18.9, 0.7], [19.0, 0], [21.3, 0.35], [22.7, 0.35], [22.9, 0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }
  function trackV(tr, t) {
    if (t <= tr[0][0]) return tr[0][1].clone();
    for (let i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
      const [t0, a] = tr[i - 1], [t1, b, e] = tr[i];
      return a.clone().lerp(b, (e || E.io)((t - t0) / Math.max(1e-6, t1 - t0)));
    }
    return tr[tr.length - 1][1].clone();
  }

  // ---------------- phone screen
  function screen(t) {
    const s = { t, scanT: t, rot: 0, zoom: 1, lock: 0, lockFail: 0, result: 0, searching: 0, variant: 'small' };
    if (t >= C.thumb && t < 17.95) s.variant = 'thumb';
    if (t >= C.slap && t < C.peel + 0.4) s.variant = 'big';
    s.result = Math.max(seg(t, C.decode1, C.decode1 + 0.25, E.out3) * (t < 4.2 ? 1 : 0), seg(t, C.decode2, C.decode2 + 0.25, E.out3) * (t < 26.2 ? 1 : 0));
    s.lock = t >= C.lockPhone && t < 14.4 ? clamp((t - C.lockPhone) / 0.45) * (1 - 0.85 * pulse(t, C.rotate, C.rotate + 0.6)) : 0;
    s.rot = key(t, [[0, 0], [C.rotate, 0], [C.rotate + 0.6, Math.PI / 2, E.io3], [30, Math.PI / 2]]) * (t < 14.4 ? 1 : 0);
    s.lockFail = t >= C.lockFail && t < 17.95 ? clamp((t - C.lockFail) / 0.3) : 0;
    s.searching = Math.max(win(t, C.thumb + 0.2, 17.95, 0.2, 0.1), win(t, C.slap + 0.3, C.peel + 0.4, 0.2, 0.1));
    return s;
  }

  // ---------------- giant QR states
  function giant(t) {
    return {
      ec: win(t, C.ecGlow, 9.45, 0.9, 0.05),
      ecWave: seg(t, C.ecGlow, C.ecGlow + 1.1, E.lin),
      dataTag: win(t, 5.0, 6.75, 0.25, 0.2),
      lift: seg(t, C.lift, C.lift + 0.45, E.out3) * (t < 9.45 ? 1 : 0),
      rebuild: seg(t, C.rebuild0, C.rebuild1, E.lin),
      particles: t >= C.rebuild0 - 0.3 && t < C.rebuild1 + 0.2 ? (t - (C.rebuild0 - 0.3)) / (C.rebuild1 + 0.5 - C.rebuild0) : -1,
      finder: [C.finder0, C.finder1, C.finder2].map(f => (t >= f && t < 12.25 ? Math.min(1, (t - f) / 0.2) : 0) + (t >= 16.2 && t < 17.95 ? 1 : 0)),
      lockLines: t >= C.lockGiant && t < 12.25 ? seg(t, C.lockGiant, C.lockGiant + 0.35) : 0,
      covered: t >= 16.2 && t < 17.95 ? 1 : 0,
      big: t >= 20.05 && t < 21.35 ? 1 : 0,
      bigSlam: seg(t, C.bigSlam - 0.12, C.bigSlam, E.in),
      bigTry: t >= C.bigSlam + 0.2 && t < 21.35 ? (t - C.bigSlam - 0.2) / 0.9 : -1,
      t,
    };
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, phone = W.phone, phoneN = W.phoneNormal, card = W.cardCenter;
    switch (s.id) {
      case 'card_cu': return { pos: L(V(0.1, 1.065, 0.32), V(0.08, 1.055, 0.22)), target: card.clone().setZ(-0.1).setY(1.037), fov: 36 };
      case 'person_cu': return { pos: L(V(0.3, 1.6, 0.5), V(0.24, 1.62, 0.4)), target: head.clone().add(V(0, -0.03, 0)), fov: 32 };
      case 'react': return { pos: L(V(0.2, 1.7, 0.42), V(0.17, 1.7, 0.3)), target: head.clone().add(V(0, 0.02, 0)), fov: 30 };
      case 'frustrated': return { pos: L(V(-0.32, 1.66, 0.48), V(-0.26, 1.66, 0.38)), target: head.clone().add(V(0, -0.05, 0)), fov: 34 };
      case 'deadpan': return { pos: L(V(0.05, 1.7, 0.5), V(0.05, 1.7, 0.36), E.lin), target: head.clone().add(V(0, 0.02, 0)), fov: 30 };
      case 'smile': return { pos: L(V(0.24, 1.68, 0.46), V(0.19, 1.68, 0.34)), target: head.clone().add(V(0, 0.0, 0)), fov: 32 };
      case 'phone_scan': case 'phone_orient': case 'phone_success': {
        const back = phoneN.clone().multiplyScalar(0.42 - 0.035 * u);
        const pos = phone.clone().add(back);
        return { pos, target: phone.clone().add(V(0, 0.054, 0)), fov: 34 };
      }
      case 'thumb_ots': case 'sticker_ots': case 'peel_ots': {
        const k = s.id === 'thumb_ots' ? 0 : s.id === 'sticker_ots' ? 1 : 2;
        if (k === 0) return { pos: L(V(0.36, 1.32, -0.44), V(0.36, 1.32, -0.44).lerp(card, 0.15)), target: card.clone().add(V(-0.02, 0.01, 0)), fov: 37 };
        const from = [V(0.4, 1.27, -0.42), V(0.4, 1.28, -0.42), V(0.39, 1.27, -0.42)][k];
        return { pos: L(from, from.clone().lerp(card, 0.18)), target: card.clone().add(V(0, 0.02, 0)), fov: 36 };
      }
      case 'giant_ec': {
        const a = seg(t, s.t0, 6.7, E.io), b = seg(t, 6.7, s.t1, E.io);
        const p1 = G.clone().add(V(1.6, 3.1, 3.0)), p2 = G.clone().add(V(0.5, 2.6, 2.5)), p3 = G.clone().add(V(0.35, 1.55, 1.45));
        const pos = b > 0 ? p2.clone().lerp(p3, b) : p1.clone().lerp(p2, a);
        const target = G.clone().add(V(0, 0, 0.15)).lerp(G.clone().add(V(0, 0.1, 0)), b);
        return { pos, target, fov: 38 };
      }
      case 'giant_finders': return { pos: L(G.clone().add(V(-2.2, 0.75, -0.2)), G.clone().add(V(-0.9, 2.5, 2.6))), target: L(G.clone().add(V(-1.1, 0, -1.0)), G.clone().add(V(-0.35, 0, -0.25))), fov: 40 };
      case 'giant_covered': return { pos: L(G.clone().add(V(0.85, 3.0, 1.7)), G.clone().add(V(0.35, 4.5, 3.3))), target: L(G.clone().add(V(0.75, 0, -0.75)), G.clone().add(V(0.1, 0, -0.15))), fov: 46 };
      case 'giant_big': return { pos: L(G.clone().add(V(0.4, 2.5, 2.4)), G.clone().add(V(0.25, 2.1, 1.9))), target: G.clone().add(V(0, 0, 0.1)), fov: 40 };
      case 'cafe_wide': return { pos: L(V(0.5, 1.68, 1.35), V(0.85, 1.8, 2.25)), target: L(V(0.0, 1.6, -0.4), V(-0.08, 1.6, -0.5)), fov: 36 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      ecTag: win(t, 5.0, 9.4, 0.3, 0.05), dataTag: win(t, 5.4, 9.4, 0.3, 0.05),
      rebuiltTag: win(t, 7.9, 9.4, 0.25, 0.05), missingTag: win(t, C.lift + 0.2, 7.9, 0.2, 0.15),
      finderTag: win(t, 10.3, 12.2, 0.3, 0.05), coveredTag: win(t, 16.45, 17.9, 0.2, 0.05), bigTag: win(t, 20.45, 21.3, 0.2, 0.05),
      brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, screen, giant, camera, overlay, cues: C };
}
