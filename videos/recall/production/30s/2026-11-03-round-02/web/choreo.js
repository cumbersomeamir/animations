// Shots, acting, spoon path, microwave + display states and giant-oven states for
// "Why a microwave leaves cold patches in food" (Recall round 02). Everything is a pure function of t.
import * as THREE from 'three';
import { E, key, seg, pulse, win, clamp } from './anim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const ROOT = [0.05, 0, -0.55];            // same performer position as feedback round 01
export const BOWL_POS = [0.0, 0.95, -0.2];
export const MW_POS = [-0.7, 0.95, -0.22], MW_ROT = 0.5;
export const GIANT = [30, 0, 0];

export function makeChoreo(tl) {
  const C = tl.cues;
  const shotAt = t => { const s = tl.shots.find(x => t >= x.t0 && t < x.t1) || tl.shots[tl.shots.length - 1]; return { ...s, u: (t - s.t0) / (s.t1 - s.t0), lt: t - s.t0 }; };
  const blinks = [1.0, 4.0, 16.4, 19.9, 23.5, 27.9, 29.3];

  // ---------------- performer (continuous; shots cut around it)
  function person(t) {
    const q = { pos: ROOT };
    const restL = V(-0.22, 0.985, -0.32), holdBowl = V(-0.085, 1.02, -0.22);
    const nearBowl = (a, b) => win(t, a, b, 0.25, 0.25);
    const hold = Math.max(nearBowl(1.0, 2.6), nearBowl(18.8, 20.85), nearBowl(23.0, 24.5), nearBowl(26.8, 28.0));
    q.handL = restL.clone().lerp(holdBowl, E.io(hold));
    const shiver = t > C.cold && t < C.cold + 0.75 ? 0.045 * Math.sin((t - C.cold) * 46) * (1 - (t - C.cold) / 0.75) : 0;
    q.lean = key(t, [[0, 0.14], [2.45, 0.14], [2.8, 0.03], [C.cold, 0.0], [3.6, -0.05], [4.2, 0.0], [17.1, 0.02], [18.6, 0.14], [20.8, 0.12],
      [23.0, 0.14], [24.4, 0.12], [24.8, 0.03], [26.3, 0.02], [26.9, 0.12], [27.5, 0.04], [30, 0.03]]);
    q.twist = key(t, [[0, 0], [30, 0]]);
    q.tilt = shiver * 0.5 + key(t, [[0, 0], [17.15, 0], [17.5, 0.04], [18.2, 0.0], [30, 0]]);
    q.headPitch = key(t, [[0, 0.4], [2.45, 0.4], [2.8, 0.06], [C.cold, 0.02], [3.7, -0.04], [4.2, 0.0], [17.1, 0.05], [17.5, 0.0], [18.6, 0.42],
      [20.8, 0.4], [23.0, 0.42], [24.4, 0.4], [24.8, 0.04], [25.4, 0.0], [25.55, 0.1], [25.75, -0.02], [25.95, 0.08], [26.2, 0.0], [26.9, 0.32], [27.5, 0.05], [30, 0.02]]);
    q.headYaw = key(t, [[0, -0.08], [2.6, 0.0], [17.15, 0.0], [17.5, 0.05], [18.2, 0.0], [30, 0.05]]);
    q.headRoll = shiver + key(t, [[0, 0.05], [2.6, 0.0], [17.15, 0.0], [17.6, 0.07], [18.2, 0.0], [25.2, 0.0], [25.5, 0.06], [26.3, 0.0], [30, 0.04]]);
    q.look = key(t, [[0, [0, -0.85]], [2.5, [0, -0.85]], [2.7, [0, -0.3]], [3.3, [0.2, 0.1]], [4.2, [0, 0]], [17.15, [0, -0.4]], [17.45, [0, 0.12]],
      [18.2, [0, 0.12]], [18.6, [0, -0.85]], [23.0, [0, -0.85]], [24.45, [0, -0.6]], [24.7, [0, -0.2]], [25.3, [0, 0.1]], [26.9, [0, -0.6]], [27.5, [0, 0.1]], [30, [0.05, 0.12]]]);
    let bl = 0; for (const b of blinks) bl = Math.max(bl, pulse(t, b, b + 0.14));
    bl = Math.max(bl, 0.9 * pulse(t, C.deadpanBlink, C.deadpanBlink + 0.42), 0.88 * win(t, 24.9, 25.2, 0.08, 0.08)); q.blink = bl;
    q.squint = key(t, [[0, 0.1], [2.8, 0.0], [C.cold, 0.0], [3.4, 0.6], [4.2, 0.45], [17.1, 0.4], [18.2, 0.4], [18.6, 0.15], [23.0, 0.1], [25.2, 0.0], [30, 0.0]]);
    const brow = key(t, [[0, 0.35], [2.7, 0.45], [C.cold, 0.3], [3.4, -0.35], [4.2, -0.3], [17.1, -0.1], [18.2, -0.1], [18.6, 0.1], [23.0, 0.35], [25.2, 0.5], [26.3, 0.6], [30, 0.4]]);
    q.browL = brow + key(t, [[0, 0.35], [2.6, 0.2], [3.2, 0.0], [30, 0]]); q.browR = brow;
    q.browAngle = key(t, [[0, 0.15], [C.cold, 0.1], [3.4, -0.65], [4.2, -0.55], [17.1, -0.1], [18.2, -0.1], [18.6, 0.05], [30, 0.12]]);
    q.smile = key(t, [[0, 0.35], [2.6, 0.3], [C.cold, 0.1], [3.4, 0.0], [17.1, 0.0], [18.2, 0.0], [18.6, 0.2], [23.0, 0.3], [24.8, 0.2], [25.3, 1.0], [26.3, 0.95], [30, 0.85]]);
    q.open = Math.max(0.42 * win(t, 2.6, 2.95, 0.1, 0.1), 0.35 * win(t, 24.55, 24.9, 0.1, 0.1), 0.35 * win(t, 27.55, 27.85, 0.1, 0.1));
    q.frown = key(t, [[0, 0.0], [C.cold, 0.0], [3.4, 0.9], [4.2, 0.75], [17.1, 0.25], [18.2, 0.2], [18.6, 0.0], [30, 0]]);
    q.pole = [[-0.8, -0.4, -0.5], [0.8, -0.5, -0.5]];
    return q;
  }

  /** Spoon tip + handle direction; ctx = { food (world food-centre), mouth (world), R (food radius) } */
  function spoon(t, ctx) {
    const F = ctx.food, M = ctx.mouth, R = ctx.R;
    const Db = V(0.35, 0.78, -0.52).normalize(), Dm = V(0.45, -0.75, 0.45).normalize(), Dc = V(0.3, -0.75, 0.6).normalize();
    const above = F.clone().add(V(0.035, 0.085, 0.01)), edge = F.clone().add(V(0.012, 0.004, 0.78 * R)), mid = F.clone().add(V(0, 0.006, 0));
    const mouth = M.clone(), chin = M.clone().add(V(0.01, -0.07, 0.1)), chest = M.clone().add(V(0.06, -0.2, 0.16));
    const ks = [
      [0, above, Db], [1.25, above, Db], [1.5, edge, Db], [1.75, edge.clone().add(V(0, 0.02, 0)), Db], [2.05, mid, Db], [2.3, mid, Db],
      [2.55, mid.clone().add(V(0, 0.08, 0.02)), Db], [2.85, mouth, Dm], [3.4, mouth, Dm], [3.9, chin, Dc], [18.2, chin, Dc], [18.85, above, Db],
    ];
    // stir (circles) then spread (outward strokes)
    if (t >= 18.85 && t < C.stir0) return { tip: above.clone().lerp(F.clone().add(V(0.03, 0.004, 0)), seg(t, 18.85, C.stir0)), dir: Db };
    if (t >= C.stir0 && t < C.stir1) { const a = 2 * Math.PI * 2.4 * seg(t, C.stir0, C.stir1, E.lin); return { tip: F.clone().add(V(0.03 * Math.cos(a), 0.004, 0.03 * Math.sin(a))), dir: Db }; }
    if (t >= C.stir1 && t < C.spread1) {
      const u = seg(t, C.stir1, C.spread1, E.lin) * 3, k = Math.min(2, Math.floor(u)), f = u - k, ang = [0.4, 2.5, 4.4][k];
      const r = R * (0.1 + 0.75 * E.io(f)); return { tip: F.clone().add(V(r * Math.cos(ang), 0.003 + 0.01 * Math.sin(Math.PI * f), r * Math.sin(ang))), dir: Db };
    }
    if (t >= C.spread1 && t < 23.4) return { tip: F.clone().add(V(0.02, 0.003, 0.02)).lerp(above, seg(t, C.spread1, 20.75)), dir: Db };
    const late = [
      [23.4, above, Db], [C.dipMid, mid, Db], [24.1, mid.clone().add(V(0, 0.07, 0.02)), Db], [24.8, mouth, Dm], [25.25, mouth, Dm], [25.7, chest, Dc],
      [26.9, chest, Dc], [27.15, mid, Db], [27.35, mid, Db], [27.7, mouth, Dm], [28.1, mouth, Dm], [28.6, chest, Dc], [30, chest, Dc],
    ];
    const list = t < 18.85 ? ks : late;
    if (t <= list[0][0]) return { tip: list[0][1].clone(), dir: list[0][2].clone() };
    for (let i = 1; i < list.length; i++) if (t <= list[i][0]) {
      const [t0, a, da] = list[i - 1], [t1, b, db] = list[i], u = E.io((t - t0) / (t1 - t0));
      return { tip: a.clone().lerp(b, u), dir: da.clone().lerp(db, u).normalize() };
    }
    const l = list[list.length - 1]; return { tip: l[1].clone(), dir: l[2].clone() };
  }

  // ---------------- props: microwave door/display, bowl placement, food shape, steam
  function props(t) {
    const p = {};
    p.door = Math.max(seg(t, C.doorOpen, C.doorOpen + 0.32, E.back) * (t < 17.5 ? 1 : 0), seg(t, 18.45, 18.75, E.back) * (t < 24.0 ? 1 : 0));
    p.lamp = t < 1.2 || (t >= 18.2 && t < 18.95) ? 1 : 0;
    p.bowlIn = t < 1.1 || (t >= 18.2 && t < 18.9);
    p.plateRot = t * 0.55;
    p.display = t < 1.2 ? { word: 'END', progress: null, blink: pulse(t, 0.02, 0.3) }
      : t >= 18.2 && t < 18.95 ? { word: 'PAUSED', progress: 0.5, blink: 0.5 * pulse(t, 18.62, 18.8) }
        : t >= 26.35 ? { word: 'END', progress: null, blink: 0 } : { word: '', progress: null, blink: 0 };
    p.mound = 1 - 0.85 * seg(t, C.stir1, C.spread1);
    p.stirAng = 2 * Math.PI * 2.4 * seg(t, C.stir0, C.stir1, E.lin) * 0.6;
    p.spreadOut = seg(t, C.stir1, C.spread1);
    p.steamEdge = t < 18.9 ? 1 : 0;                       // before stirring: steam only off the hot rim
    p.steam = t < 18.9 ? 0.9 : t < 23.0 ? 0.6 : 1.0;
    p.steamAll = t >= 23.0 ? 1 : 0;
    return p;
  }

  // ---------------- giant cavity states
  function giant(t) {
    const g = { t };
    g.port = Math.max(pulse(t, 4.35, 5.3), 0.35 * win(t, 4.35, 6.6, 0.1, 0.3));
    g.rays = win(t, C.waves, 6.75, 0.1, 0.45);
    g.raysS = Array.from({ length: 8 }, (_, k) => 2.4 * (t - (C.waves + 0.1 * k)));
    g.pattern = seg(t, C.pattern, C.pattern + 0.75) * (t < 11.25 ? 1 : 0);
    g.theta = 1.8 * Math.max(0, Math.min(t, 11.25) - C.turn);
    g.top = t >= C.turn && t < 11.25;
    g.section = (t >= 11.25 && t < 17.15) || (t >= 20.75 && t < 23.1);
    const stand = t >= 20.75;
    g.st = stand ? { shell: 1, depth: 0.23, mix: seg(t, 20.75, 21.0), even: seg(t, C.stand0, C.stand1), mound: 0.15 }
      : { shell: seg(t, C.shell0, C.shell1), depth: 0.15 + 0.08 * seg(t, C.core0, C.core1, E.lin), mix: 0, even: 0, mound: 1 };
    g.arrows = win(t, C.core0 + 0.15, 17.15, 0.3, 0.05);
    g.arrowU = seg(t, C.core0, C.core1, E.lin);
    return g;
  }

  // ---------------- cameras (every shot moves)
  function camera(t, W) {
    const s = shotAt(t), u = s.u, G = V(...GIANT);
    const L = (a, b, e = E.io) => a.clone().lerp(b, e(u));
    const head = W.head, bowl = W.bowl;
    switch (s.id) {
      case 'mw_open': return { pos: L(W.mwLocal(0.25, 0.2, 0.98), W.mwLocal(0.22, 0.19, 0.88)), target: W.mwLocal(0.095, 0.165, 0.19), fov: 36 };
      case 'bowl_edge': return { pos: L(bowl.clone().add(V(0.1, 0.27, 0.34)), bowl.clone().add(V(0.07, 0.24, 0.27))), target: bowl.clone().add(V(0, 0.03, 0)), fov: 34 };
      case 'taste_cold': return { pos: L(V(-0.2, 1.62, 0.44), V(-0.16, 1.62, 0.33)), target: head.clone().add(V(0, -0.04, 0)), fov: 32 };
      case 'deadpan': return { pos: L(V(0.04, 1.66, 0.5), V(0.04, 1.66, 0.38), E.lin), target: head.clone().add(V(0, -0.02, 0)), fov: 30 };
      case 'taste_smile': return { pos: L(V(-0.22, 1.62, 0.46), V(-0.17, 1.63, 0.34)), target: head.clone().add(V(0, -0.03, 0)), fov: 32 };
      case 'panel_pause': return { pos: L(W.disp.clone().add(W.mwN.clone().multiplyScalar(0.62)).add(V(0, -0.02, 0)), W.disp.clone().add(W.mwN.clone().multiplyScalar(0.56)).add(V(0, -0.02, 0))), target: W.disp.clone().add(V(0, -0.026, 0)), fov: 30 };
      case 'stir_spread': return { pos: L(bowl.clone().add(V(-0.16, 0.3, 0.26)), bowl.clone().add(V(-0.1, 0.27, 0.2))), target: bowl.clone().add(V(0, 0.02, 0)), fov: 36 };
      case 'bowl_steam': return { pos: L(bowl.clone().add(V(-0.12, 0.25, 0.32)), bowl.clone().add(V(-0.08, 0.23, 0.25))), target: bowl.clone().add(V(0, 0.04, 0)), fov: 34 };
      case 'giant_waves': return { pos: L(G.clone().add(V(1.1, 2.4, 7.2)), G.clone().add(V(0.7, 2.2, 6.3))), target: G.clone().add(V(0.25, 1.05, -0.2)), fov: 56 };
      case 'giant_pattern': return { pos: L(G.clone().add(V(-0.6, 3.6, 3.9)), G.clone().add(V(-0.3, 3.3, 3.3))), target: G.clone().add(V(0, 0.5, -0.05)), fov: 50 };
      case 'giant_turn': { const a = 0.6 - 0.55 * E.io(u), r = 3.3 - 0.3 * u; return { pos: G.clone().add(V(r * Math.sin(a), 2.9 - 0.2 * u, r * Math.cos(a))), target: G.clone().add(V(0, 0.5, 0)), fov: 46 }; }
      case 'giant_section': return { pos: L(G.clone().add(V(0.45, 1.25, 3.9)), G.clone().add(V(0.2, 1.1, 3.3))), target: G.clone().add(V(0, 0.5, 0)), fov: 48 };
      case 'giant_core': return { pos: L(G.clone().add(V(-0.3, 0.8, 2.7)), G.clone().add(V(-0.15, 0.72, 2.25))), target: G.clone().add(V(0, 0.42, 0)), fov: 44 };
      case 'giant_stand': return { pos: L(G.clone().add(V(-0.55, 1.2, 3.7)), G.clone().add(V(-0.3, 1.05, 3.15))), target: G.clone().add(V(0, 0.48, 0)), fov: 48 };
      case 'cafe_wide': return { pos: L(V(-0.3, 1.66, 1.85), V(-0.22, 1.76, 2.4)), target: L(V(-0.3, 1.52, -0.35), V(-0.3, 1.56, -0.42)), fov: 46 };
      default: return { pos: V(0, 1.5, 1.5), target: V(0, 1.2, 0), fov: 35 };
    }
  }

  function overlay(t) {
    return {
      wallTag: win(t, 4.9, 6.6, 0.25, 0.08), strongTag: win(t, 7.2, 8.95, 0.2, 0.05), weakTag: win(t, 7.95, 8.95, 0.2, 0.05),
      turnTag: win(t, 9.3, 11.25, 0.25, 0.05), outerTag: win(t, 12.6, 14.95, 0.25, 0.05), midTag: win(t, 15.1, 17.15, 0.25, 0.05),
      evenTag: win(t, 21.4, 23.1, 0.25, 0.05), brand: seg(t, C.cta + 0.25, C.cta + 0.7, E.io),
    };
  }

  return { shotAt, person, spoon, props, giant, camera, overlay, cues: C };
}
