// director.js: every object's state as a pure function of the frame number.
import { COL, clamp, ease, lerp, seg, track, wobble, rng } from './util.js';
import { BAL, pileSlots, COLUMN, CUP } from './props.js';

export function makeDirector(THREE, S, TL, mouthEnv) {
  const E = TL.events, fps = TL.fps;
  const sec = (f, k) => (f - k) / fps;
  const N_CUBES = 13;
  const PILE = pileSlots().slice(0, N_CUBES);
  const r = rng(3);
  const cubeSeed = Array.from({ length: N_CUBES }, () => ({ u: r() * 2 - 1, v: r() * 2 - 1, spin: r() * 6 - 3, side: r() > 0.5 ? 1 : -1, d: r() }));
  const BLINKS = [52, 132, 205, 262, 344, 428];

  // ---------------- balance tilt (deg, + = right pan down)
  function tilt(f) {
    if (f < E.mangoLand) return -9;                                   // Gram (100 g) alone on the left
    if (f < E.leap2Land) return 11 - 20 * Math.exp(-sec(f, E.mangoLand) * 3.2) * Math.cos(2 * Math.PI * 1.5 * sec(f, E.mangoLand));
    if (f < E.level) return 11 * Math.exp(-sec(f, E.leap2Land) * 4.6) * Math.cos(2 * Math.PI * 1.3 * sec(f, E.leap2Land));
    return 0;
  }
  const panY = (f, i) => {
    const a = (tilt(f) * Math.PI) / 180;
    return BAL.pivotY + (i ? -1 : 1) * BAL.arm * Math.sin(a) + BAL.post + 0.045;
  };
  const panX = (f, i) => (i ? 1 : -1) * BAL.arm * Math.cos((tilt(f) * Math.PI) / 180);

  // ---------------- camera
  function camera(f) {
    const pos = track(f, [[0, [0.0, 2.3, 10.4]], [72, [0.0, 2.35, 10.1]], [88, [0.5, 3.5, 6.7]], [132, [0.55, 3.5, 6.8]], [150, [0.0, 2.6, 10.4]], [180, [0.05, 2.9, 10.6]], [384, [0.12, 2.95, 9.85]], [406, [0.05, 2.5, 9.7]], [450, [0.05, 2.5, 9.5]]]);
    const look = track(f, [[0, [0.0, 2.1, 0]], [72, [0.0, 2.15, 0]], [88, [0.5, 1.6, 0]], [132, [0.55, 1.6, 0]], [150, [0.0, 2.2, 0]], [180, [0.05, 2.75, 0]], [384, [0.08, 2.75, 0]], [406, [0.05, 2.15, 0]], [450, [0.05, 2.15, 0]]]);
    return { pos, look };
  }

  // ---------------- mango + pieces + cubes
  const MANGO_Y = 0.36;
  function mango(f) {
    const st = { whole: false, pieces: false };
    const restY = panY(f, 1) + MANGO_Y;
    if (f < E.split) {
      const t = seg(f, -7, E.mangoLand);
      const y = f < E.mangoLand ? lerp(5.35, restY, ease.inQuad(t)) : restY;
      const sq = f >= E.mangoLand ? wobble(sec(f, E.mangoLand), 4, 9) * 0.18 : 0;
      st.whole = true;
      st.pos = [panX(f, 1), y - sq * 0.3, 0];
      st.rot = [0, -0.25, f < E.mangoLand ? (1 - t) * 0.6 : 0];
      st.scale = [1 + sq * 0.5, 1 - sq, 1 + sq * 0.5];
      return st;
    }
    st.pieces = true;
    const base = [panX(f, 1), restY, 0];
    const o = seg(f, E.split, E.split + 9);
    const oe = ease.outBack(o, 1.4);
    // cheeks open flesh-up, then (after the cubes pop out) the empty skins fly away
    const fly = ease.inQuad(seg(f, E.shellsFly, E.shellsFly + 16));
    st.front = { pos: [base[0] - 0.05 + fly * 2.4, base[1] - 0.13 * oe + fly * 1.8, 0.33 * oe + fly * 0.6], rot: [(Math.PI / 2) * oe + fly * 4, -0.25, fly * 3], cap: 1 - ease.inQuad(seg(f, E.burst, E.burst + 12)), vis: fly < 1 };
    st.back = { pos: [base[0] + 0.05 + fly * 2.8, base[1] - 0.13 * oe + fly * 2.2, -0.33 * oe - fly * 0.4], rot: [(-Math.PI / 2) * oe - fly * 4, -0.25, -fly * 3], cap: 1 - ease.inQuad(seg(f, E.burst, E.burst + 12)), vis: fly < 1 };
    const sf = seg(f, E.seedFly, E.seedFly + 22);
    st.mid = { pos: [base[0] + ease.inQuad(sf) * 3.0, base[1] + Math.sin(sf * Math.PI) * 1.3 + 0.15 * o - ease.inQuad(sf) * 1.2, 0], rot: [sf * 6, -0.25 + sf * 3, sf * 4], vis: sf < 1 };
    st.tags = { seed: sf, skin: seg(f, E.shellsFly, E.shellsFly + 16) };
    return st;
  }
  function cubes(f) {
    // returns per-cube [x,y,z,s,rx,ry,rz]
    const out = [];
    const right = [panX(f, 1), panY(f, 1), 0];
    for (let i = 0; i < N_CUBES; i++) {
      const c = cubeSeed[i];
      const t0 = E.burst + i * 1.2;
      const p = seg(f, t0, t0 + 12);
      if (f < E.burst) { out.push(null); continue; }
      const slot = PILE[i];
      const from = [right[0] + c.u * 0.32, right[1] + 0.12, c.side * 0.33 + c.v * 0.12];
      let x = lerp(from[0], right[0] + slot[0], ease.inOutQuad(p));
      let z = lerp(from[2], slot[2], ease.inOutQuad(p));
      let y = lerp(from[1], right[1] + slot[1], p) + Math.sin(p * Math.PI) * (0.55 + c.d * 0.35);
      let s = lerp(0.55, 1, ease.outBack(clamp(p * 1.5)));
      let rx = (1 - p) * c.spin, ry = 0.2 + (1 - p) * c.spin, rz = (1 - p) * c.spin * 0.5;
      // B3: melt into the column base
      const m = seg(f, E.melt + i * 0.9, E.melt + 10 + i * 0.9);
      if (m > 0) {
        x = lerp(x, right[0], ease.inQuad(m));
        z = lerp(z, 0, ease.inQuad(m));
        y = lerp(y, right[1] + 0.05, ease.inQuad(m));
        s *= 1 - ease.inQuad(m);
      }
      // B4: re-form inside the measuring cup
      const cp = seg(f, E.cup + i * 0.8, E.cup + 9 + i * 0.8);
      if (cp > 0 && i === 12) { out.push(null); continue; }   // 12 cubes fill the cup to the 0.6-cup line
      if (cp > 0) {
        const L = Math.floor(i / 4), k = i % 4;
        const cx = right[0] + (k % 2 ? 0.105 : -0.105), cz = (k < 2 ? 0.105 : -0.105);
        const cy = right[1] + 0.12 + L * 0.19 + (i === 12 ? -0.02 : 0);
        const tx = i === 12 ? right[0] + 0.02 : cx, tz = i === 12 ? 0.03 : cz;
        x = tx; z = tz;
        y = lerp(cy + 1.6, cy, ease.outBounce(cp));
        s = 0.97;
        rx = (1 - cp) * 2; ry = 0.15 * (i % 3); rz = 0;
      }
      out.push([x, y, z, s, rx, ry, rz]);
    }
    return out;
  }

  // ---------------- nutrient column + cup
  function column(f) {
    const on = f >= E.melt - 2 && f < E.cup + 10;
    const fade = 1 - seg(f, E.cup - 8, E.cup + 2);   // labels/stamp leave before the camera move to the cup
    return {
      on, fade,
      pos: [panX(f, 1), panY(f, 1), 0],
      glass: seg(f, E.melt - 2, E.melt + 8) * fade,
      water: ease.inOutQuad(seg(f, E.melt + 2, E.waterLabel + 4)) * fade,
      carbs: ease.outBounce(seg(f, E.carbsDrop, E.carbsLand)) * (fade > 0 ? 1 : 0),
      top: ease.outBounce(seg(f, E.topLand - 8, E.topLand)) * (fade > 0 ? 1 : 0),
      fibre: ease.outBack(seg(f, E.fibre, E.fibre + 12)),
      glow: Math.max(0, Math.exp(-Math.abs(sec(f, E.stamp)) * 3) * (f > E.glow ? 1 : 0)),
      scaleOut: 1 - ease.inBack(seg(f, E.cup, E.cup + 8)),
    };
  }
  function cup(f) {
    const p = seg(f, E.cup - 4, E.cup + 6);
    return { on: f >= E.cup - 4, pos: [panX(f, 1), panY(f, 1), 0], s: ease.outBack(p), line: seg(f, E.cupLand, E.cupLand + 8) };
  }

  // ---------------- Gram
  const talk = (f) => (mouthEnv ? mouthEnv[Math.min(mouthEnv.length - 1, Math.max(0, f))] || 0 : 0);
  const blink = (f) => BLINKS.reduce((b, k) => Math.max(b, 1 - Math.abs(f - k) / 2.5), 0);
  function gram(f) {
    const P = { x: panX(f, 0), y: panY(f, 0), z: 0.05, rotY: 0.25, crouch: 0, squash: 0, lean: 0, hands: null, feet: null };
    const F = { eyes: 'open', look: [0.3, 0], brows: 'none', mouth: 'smile', open: 0.4, blink: blink(f) };
    const H = { idle: [[-0.62, 0.24, 0.06], [0.62, 0.24, 0.06]], up: [[-0.55, 1.0, 0.15], [0.55, 1.0, 0.15]], hips: [[-0.5, 0.32, 0.18], [0.5, 0.32, 0.18]], shrug: [[-0.72, 0.62, 0.32], [0.72, 0.62, 0.32]] };
    let prop = null;
    if (f < E.mangoLand) {
      const a = seg(f, 0, E.mangoLand);
      P.crouch = 0.2 + 0.25 * a; P.hands = [[-0.62, 0.5 + 0.2 * a, 0.25], [0.62, 0.5 + 0.2 * a, 0.25]];
      Object.assign(F, { eyes: 'wide', look: [0.6, 0.9], brows: 'up', mouth: 'o', open: 0.2 + 0.4 * a });
    } else if (f < E.gramLand1) {
      // launched by the flipping beam
      const t = seg(f, E.mangoLand, E.gramLand1);
      const launchY = panY(E.mangoLand + 2, 0);
      P.y = lerp(launchY, panY(E.gramLand1, 0), t) + 4 * 0.72 * t * (1 - t);
      P.hands = [[-0.6, 1.05 + 0.2 * Math.sin(f), 0.2], [0.6, 1.05 + 0.2 * Math.cos(f), 0.2]];
      P.feet = [[0, 0.1, 0.12], [0, -0.1, 0.18]];
      P.lean = 10 * Math.sin(t * Math.PI * 2);
      Object.assign(F, { eyes: 'wide', look: [0, 0.6], brows: 'up', mouth: 'o', open: 1 });
    } else if (f < E.leap1) {
      const land = Math.exp(-sec(f, E.gramLand1) * 9);
      P.squash = 0.3 * land; P.crouch = 0.6 * land;
      const q = seg(f, 46, 56);
      P.hands = q > 0 ? [[-0.72, lerp(0.24, 0.62, ease.outBack(q)), 0.32], [0.72, lerp(0.24, 0.62, ease.outBack(q)), 0.32]] : H.idle;
      P.rotY = lerp(0.6, 0.15, seg(f, 40, 52));
      Object.assign(F, { eyes: 'open', look: f < 48 ? [0.8, 0.1] : [0, 0], brows: 'curious', mouth: 'smile', open: 0.4 });
    } else if (f < E.leap2Land) {
      // leap to the pivot, chop, watch, leap back
      const pivot = [0.02, BAL.pivotY + 0.06];
      if (f < E.leap1Land) {
        const t = seg(f, E.leap1, E.leap1Land);
        P.x = lerp(panX(E.leap1, 0), pivot[0], t);
        P.y = lerp(panY(E.leap1, 0), pivot[1], t) + 4 * 0.75 * t * (1 - t);
        P.hands = H.up; P.feet = [[0, 0.1, 0.1], [0, -0.05, 0.12]];
        P.rotY = lerp(0.25, 0.7, t);
        Object.assign(F, { eyes: 'happy', mouth: 'grin', open: 0.6 });
      } else if (f < E.leap2) {
        P.x = pivot[0]; P.y = pivot[1]; P.rotY = 0.7;
        const ant = seg(f, E.leap1Land + 2, E.chop - 1), hit = seg(f, E.chop - 1, E.chop + 2), rec = seg(f, E.chop + 4, E.chop + 16);
        P.squash = 0.2 * Math.exp(-sec(f, E.leap1Land) * 10);
        P.crouch = 0.2 * ant + 0.35 * hit - 0.3 * rec;
        P.lean = -10 * ant + 24 * hit - 14 * rec;
        const hR = [lerp(lerp(0.62, 0.32, ease.outCubic(ant)), 0.8, ease.inQuad(hit)), lerp(lerp(0.24, 1.3, ease.outCubic(ant)), 0.25, ease.inQuad(hit)), lerp(0.1, 0.42, hit)];
        P.hands = [[-0.62, 0.35 + 0.2 * ant, 0.1], [lerp(hR[0], 0.62, rec), lerp(hR[1], 0.5, rec), hR[2]]];
        if (f > E.chop + 10) P.hands = [[-0.66, 0.6, 0.2], [0.66, 0.6, 0.2]];
        Object.assign(F, f < E.chop ? { eyes: 'squint', brows: 'determined', mouth: 'flat', look: [0.8, -0.3] } : { eyes: 'happy', mouth: 'grin', open: 0.7, look: [0.8, -0.4], blush: 0.6 });
        if (f > E.burst) Object.assign(F, { eyes: 'open', look: [0.9, -0.5], brows: 'up', mouth: 'grin' });
      } else {
        const t = seg(f, E.leap2, E.leap2Land);
        P.x = lerp(pivot[0], panX(E.leap2Land, 0), t);
        P.y = lerp(pivot[1], panY(E.leap2Land, 0), t) + 4 * 0.7 * t * (1 - t);
        P.hands = H.up; P.feet = [[0, 0.1, 0.1], [0, -0.05, 0.12]];
        P.rotY = lerp(0.7, 0.25, t);
        Object.assign(F, { eyes: 'happy', mouth: 'grin', open: 0.5 });
      }
    } else {
      // on the left pan for the rest of the lesson
      const land = Math.exp(-sec(f, E.leap2Land) * 8);
      P.squash = 0.25 * land; P.crouch = 0.5 * land;
      P.rotY = 0.35;
      const bal = f < E.level ? wobble(sec(f, E.leap2Land), 1.3, 3) : 0;
      P.lean = 10 * bal;
      P.hands = f < E.level ? [[-0.8, 0.55 + 0.2 * bal, 0.1], [0.8, 0.55 - 0.2 * bal, 0.1]] : H.idle;
      Object.assign(F, f < E.level ? { eyes: 'wide', mouth: 'wavy', brows: 'worried', look: [0.3, -0.6] } : { eyes: 'happy', mouth: 'grin', open: 0.5, blush: 0.5 });
      if (f >= E.level + 8) Object.assign(F, { eyes: 'open', look: [0.7, 0.3], mouth: 'smile', brows: 'none' });
      // B3 watching + pointing
      if (f >= E.melt) {
        const pt = seg(f, E.waterLabel - 6, E.waterLabel + 2) * (1 - seg(f, E.carbsDrop - 4, E.carbsDrop + 2));
        P.hands = [[-0.62, 0.3, 0.1], [lerp(0.62, 0.95, pt), lerp(0.24, 0.72, pt), lerp(0.06, 0.3, pt)]];
        Object.assign(F, { eyes: f < E.waterLabel ? 'wide' : 'open', look: [0.9, 0.5], brows: f < E.waterLabel ? 'up' : 'none', mouth: f < E.waterLabel ? 'o' : 'smile', open: 0.5 });
      }
      if (f >= E.carbsDrop) {
        const duck = Math.exp(-Math.abs(sec(f, E.carbsLand)) * 6);
        P.crouch = 0.4 * duck; P.squash = 0.12 * duck;
        Object.assign(F, { eyes: f < E.carbsLand + 6 ? 'squint' : 'open', look: [0.9, 0.6], brows: 'up', mouth: f < E.carbsLand + 6 ? 'o' : 'grin', open: 0.6 });
        if (f > E.fibre) Object.assign(F, { eyes: 'open', brows: 'curious', mouth: 'smile', look: [0.9, 0.55] });
      }
      if (f >= E.glow - 10) {
        // stomp: anticipation, impact, recovery -> "60 kcal" stamp
        const ant = seg(f, E.glow - 10, E.stamp - 3), hit = seg(f, E.stamp - 3, E.stamp), rec = seg(f, E.stamp + 4, E.stamp + 16);
        P.crouch = 0.15 + 0.4 * ant - 0.45 * hit;
        P.y += 0.25 * Math.sin(clamp(ant) * Math.PI) * (1 - hit);
        P.squash = 0.3 * hit * (1 - rec);
        P.hands = [[-0.58, lerp(0.3, 1.25, ant) - 0.9 * hit, 0.2], [0.58, lerp(0.3, 1.25, ant) - 0.9 * hit, 0.2]];
        Object.assign(F, f < E.stamp ? { eyes: 'squint', brows: 'determined', mouth: 'grin', open: 0.3, look: [0.6, 0.4] } : { eyes: 'happy', mouth: 'grin', open: 0.8, blush: 0.8 });
      }
      if (f >= E.magnify - 8) {
        const m = ease.outBack(seg(f, E.magnify - 8, E.magnify + 4));
        P.crouch = 0; P.squash = 0;
        P.rotY = lerp(0.35, 0.55, m);
        P.hands = [[-0.6, 0.28, 0.1], [lerp(0.62, 0.42, m), lerp(0.3, 0.86, m), lerp(0.1, 0.5, m)]];
        prop = { kind: 'magnifier', amount: m };
        Object.assign(F, { eyes: f > E.vitc ? 'wide' : 'squint', look: [0.9, 0.7], brows: 'curious', mouth: f > E.vitc ? 'o' : 'flat', open: 0.4 });
      }
      if (f >= E.cup - 4) {
        const th = ease.outBack(seg(f, E.thumb - 6, E.thumb + 4));
        P.rotY = lerp(0.55, 0.2, seg(f, E.cup - 4, E.cup + 8));
        P.hands = [[-0.62, 0.3, 0.1], [lerp(0.62, 0.66, th), lerp(0.3, 0.82, th), lerp(0.1, 0.4, th)]];
        prop = th > 0.05 ? { kind: 'thumb', amount: th } : null;
        Object.assign(F, { eyes: f > E.thumb ? 'wink' : 'happy', look: [0.2, 0], brows: 'none', mouth: 'grin', open: 0.6, blush: 0.6 });
      }
    }
    // idle breathing + sway so Gram is never frozen between actions
    P.squash = (P.squash || 0) + 0.022 * Math.sin(f * 0.21);
    P.lean = (P.lean || 0) + 2.2 * Math.sin(f * 0.13);
    // lip sync from the narration envelope
    const k = talk(f);
    if (k > 0.06) {
      if (!['o', 'grin', 'open'].includes(F.mouth) || F.mouth === 'grin') F.mouth = 'open';
      F.open = clamp(0.15 + k * 1.1, 0, 1.2);
    }
    return { P, F, prop };
  }

  function needleLevel(f) { return Math.abs(tilt(f)) < 0.6; }
  return { tilt, panX, panY, camera, mango, cubes, column, cup, gram, needleLevel, N_CUBES };
}
