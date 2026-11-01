// S1 hook (0-2.5s), S2 tangle (2.5-9s), S3 one home (9-12.5s): one continuous paper "desk" world.
import { C, W, H, GROUND, F, card, note, rr, line, circle, heart, icon, label, makePaper } from '../lib/paper.mjs';
import { ease, seg, prog, kf, wobble, shake, rng, lerp, clamp, qb, TAU } from '../lib/core.mjs';
import { geom, drawFig, walk, POSES, BASE } from '../lib/rig.mjs';
import { T } from '../cues.mjs';
import { reach, floor, pencil, phone, PHONE, stampMark, homeScreen } from './props.mjs';

const paper = makePaper(C.paper, 7, 0.1);
export const screenPaper = makePaper(C.screen, 11, 0.04);

// ---------------------------------------------------------------- wall items
const CENTER = { x: 540, y: 880 };
const KEY = {
  venue: { x: 255, y: 630, w: 290, h: 200, rot: -0.05, band: C.sageTint, title: 'VENUE' },
  budget: { x: 835, y: 640, w: 260, h: 240, rot: 0.05, band: C.roseTint, title: 'BUDGET' },
  guests: { x: 545, y: 890, w: 330, h: 240, rot: -0.02, band: C.rose, title: 'GUESTS' },
  caterer: { x: 835, y: 1080, w: 290, h: 200, rot: 0.04, band: C.butter, title: 'CATERER' },
};
const SMALL = [
  ['Photographer', 545, 590, 0.04, C.butter],
  ['DJ', 120, 845, -0.12, C.roseTint],
  ['Decor', 330, 830, 0.07, C.sageTint],
  ['Flowers', 975, 860, 0.1, C.butter],
  ['Seating', 150, 1060, 0.05, C.ivory],
  ['Invites', 385, 1090, -0.07, C.roseTint],
  ['Menu tasting', 615, 1130, 0.06, C.sageTint],
  ['Deposit due', 715, 765, -0.06, C.roseTint],
  ['Makeup', 95, 610, 0.08, C.sageTint],
  ['Playlist', 120, 1255, -0.05, C.butter],
  ['Mehendi Fri?', 690, 1265, -0.05, C.butter],
  ['RSVPs', 420, 1275, 0.06, C.ivory],
];
const EXTRA = ['Cake', 'Transport', 'Lights', 'Return gifts', 'Rings', 'Call aunty', 'Tent?', 'Sangeet', 'Haldi', 'Quotes',
  'Hotel', 'Shoes', 'Speeches', 'Favours', 'Car', 'Mandap', 'Songs', 'Budget??', 'Guest list v7', 'Seating v3'];

const R = rng(2026);
export const ITEMS = [];
Object.entries(KEY).forEach(([id, k], i) => ITEMS.push({ id, key: true, ...k, delay: i * 0.03, spin: (R() - 0.5) * 3, liftK: 0.6 + R() * 0.6 }));
SMALL.forEach(([labelT, x, y, rot, color], i) => ITEMS.push({ id: 'n' + i, key: false, label: labelT, x, y, rot, color, w: 200, h: 140, delay: 0.04 + R() * 0.16, spin: (R() - 0.5) * 6, liftK: 0.5 + R() }));
// pile placement (around A) and vacuum order
const A_X = 300;
ITEMS.forEach((it, i) => {
  const front = i % 2 === 1;
  const dx = (R() - 0.5) * (front ? 250 : 300);
  it.pile = { dx, y: GROUND - 55 - R() * (front ? 170 : 280) * (1 - Math.abs(dx) / 400), rot: (R() - 0.5) * 1.3, s: it.key ? 0.66 : 0.74, front };
  it.wrapDelay = 0.12 + R() * 0.55;
  it.vac = 0;
});
ITEMS.slice().sort((a, b) => a.pile.y - b.pile.y).forEach((it, k) => (it.vac = k));
const XTRA = EXTRA.map((l, i) => {
  const a = (i / EXTRA.length) * TAU + R() * 0.3;
  const sp = 1500 + R() * 900;
  return { label: l, a, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 600, spin: (R() - 0.5) * 10, color: [C.butter, C.roseTint, C.sageTint, C.ivory][i % 4], delay: R() * 0.12 };
});
const THREADS = [
  ['guests', 'venue', 'venuePull'], ['guests', 'budget', 'budgetPull'], ['guests', 'caterer', 'catererPull'],
  ['n0', 'budget'], ['n0', 'venue'], ['n1', 'n4'], ['n2', 'n3'], ['n5', 'n11'], ['n6', 'caterer'], ['n7', 'budget'],
  ['n8', 'venue'], ['n9', 'n4'], ['n10', 'caterer'], ['n2', 'guests'], ['n4', 'n5'], ['n3', 'caterer'], ['n0', 'n7'],
];

// ---------------------------------------------------------------- characters
const holdA = { x: 430, ground: GROUND, s: 1, face: 1 };
function poseA(t) {
  let P = { ...BASE, ...POSES.stand, ...holdA, time: t };
  if (t < T.burst) {
    P.x = 430;
    P.head = -0.35; P.lookY = -1; P.mood = 'surprised';
    P.aR = [0.9, 0.5];
    if (t > T.cardImpact) {
      const u = prog(t, T.cardImpact, T.cardImpact + 0.22);
      P.lift = Math.sin(Math.PI * u) * 26;
      P = { ...P, aL: [1.6, 1.5], aR: [-1.2, -1.4] };
      P.lean = -0.1 * Math.sin(Math.PI * u);
    }
    if (t > 0.55) { const u = seg(t, 0.55, 0.85); P.lean = 0.16 * u; P.head = lerp(-0.35, -0.15, u); P.mood = 'neutral'; P.aL = [lerp(1.6, 0.3, u), lerp(1.5, 0.4, u)]; P.aR = [lerp(-1.2, -0.2, u), lerp(-1.4, 0.3, u)]; }
    if (t > 0.8) { const u = seg(t, 0.8, T.burst); P = { ...P, ...mixP(P, POSES.crouch, u * 0.55) }; P.mood = 'surprised'; }
    if (t < T.cardImpact) P = reach(P, 'aR', { x: 540, y: 1400 }, 1, 1);
    return P;
  }
  if (t < 2.5) {
    const u = prog(t, T.burst, T.coupleLand);
    P.x = lerp(430, A_X, ease.outQuad(u));
    if (t < T.coupleLand) {
      P = { ...P, ...POSES.jump, lift: Math.sin(Math.PI * u) * 120, face: 1, mood: 'surprised', lean: -0.25 };
    } else {
      const v = prog(t, T.coupleLand, T.coupleLand + 0.35);
      const sq = Math.sin(Math.PI * Math.min(1, v * 1.2)) * (1 - v * 0.3);
      P = { ...P, ...mixP(POSES.stand, POSES.crouch, sq * 0.7), mood: t < 1.9 ? 'surprised' : 'worried', head: -0.25, lookY: -1 };
      if (t > 1.9) P = reach(P, 'aR', { x: A_X + 18, y: 1215 }, seg(t, 1.9, 2.15), -1);
    }
    return P;
  }
  // ---- S2
  P.x = A_X;
  if (t < T.wrap) {
    P.mood = 'neutral';
    if (t < T.pencilGrab + 0.3) {
      // turn, crouch to grab the pencil lying on the floor
      P.face = t < 2.62 ? 1 : -1;
      const c = Math.sin(Math.PI * prog(t, 2.6, T.pencilGrab + 0.28));
      P = { ...P, ...mixP(POSES.stand, POSES.crouch, c * 0.9), face: P.face, x: A_X, mood: 'determined' };
      P = reach(P, 'aR', { x: 205, y: GROUND - 18 - c * 0 }, c, 1);
    } else if (t < 4.05) {
      P.mood = 'determined'; P.lean = 0.12 * seg(t, 3.1, 3.3);
      P.head = -0.12;
    } else {
      P.mood = 'happy'; P.lean = 0.12 * (1 - seg(t, 4.05, 4.3));
      P.lift = Math.abs(Math.sin(Math.PI * prog(t, 4.08, 4.36))) * 16;
      if (t > T.venuePull) { P.mood = 'surprised'; P.face = -1; P.head = -0.3; P.lookY = -1; }
      if (t > T.catererPull) { P.face = 1; P.head = -0.1; P.lookY = 0; P.look = 1; }
      if (t > T.budgetPull) { P.mood = 'worried'; P.head = -0.3; P.lookY = -1; }
    }
    return P;
  }
  // wrapped
  if (t < 9.6) {
    const u = ease.outCubic(prog(t, T.wrap + 0.05, 7.6));
    P.spin = u * 3;
    P.aL = [0.07, 0]; P.aR = [-0.07, 0]; P.lL = [0.03, 0]; P.lR = [-0.03, 0];
    P.mood = t < 7.4 ? 'surprised' : 'worried';
    P.lift = Math.sin(Math.PI * prog(t, T.wrap, T.wrap + 0.3)) * 30;
    if (t > 7.6) { P.lean = Math.sin(t * 9) * 0.04 * (t < 8.6 ? 1 : 0.4); P.look = t > 8.2 ? 1 : 0.2; P.blink = (t > 8.0 && t < 8.08) ? 1 : 0; }
    return P;
  }
  // ---- S3 unwrap, freed, dive
  if (t < T.freed) {
    const u = ease.inOutCubic(prog(t, 9.62, T.freed));
    P.spin = 3 - u * 3;
    P.aL = [0.07 + u * 0.6, 0.2]; P.aR = [-0.07 - u * 0.6, -0.2];
    P.mood = 'surprised';
    return P;
  }
  if (t < T.diveJump) {
    const u = prog(t, T.freed, T.freed + 0.38);
    P.lift = Math.sin(Math.PI * u) * 70;
    if (t < T.freed + 0.38) P = { ...P, ...POSES.jump, mood: 'surprised' };
    else if (t < 11.78) { P.mood = 'dizzy'; P.spinEye = t * 14; P.lean = Math.sin(t * 11) * 0.14; P.head = Math.sin(t * 11 + 1) * 0.2; }
    else {
      P.mood = 'happy'; P.head = -0.2; P.lookY = -0.6;
      const c = seg(t, 11.9, T.diveJump, ease.inOutQuad);
      P = { ...P, ...mixP(POSES.stand, POSES.crouch, c * 0.8), mood: 'happy' };
    }
    return P;
  }
  return diveP(P, t, A_X, 520);
}

function poseB(t) {
  let P = { ...BASE, ...POSES.stand, x: 650, ground: GROUND, s: 1, face: -1, time: t };
  if (t < T.burst) {
    P.head = -0.35; P.lookY = -1; P.mood = 'surprised';
    if (t > T.cardImpact) {
      const u = prog(t, T.cardImpact, T.cardImpact + 0.22);
      P.lift = Math.sin(Math.PI * u) * 22;
      P = { ...P, aL: [1.4, 1.3], aR: [-1.4, -1.5] };
    }
    if (t > 0.55) { const u = seg(t, 0.55, 0.85); P.lean = 0.14 * u; P.mood = 'neutral'; P.head = lerp(-0.35, -0.1, u); P.aL = [lerp(1.4, 0.2, u), lerp(1.3, 0.3, u)]; P.aR = [lerp(-1.4, -0.2, u), lerp(-1.5, 0.2, u)]; }
    if (t > 0.8) { const u = seg(t, 0.8, T.burst); P = { ...P, ...mixP(P, POSES.crouch, u * 0.5) }; P.mood = 'surprised'; }
    if (t < T.cardImpact) P = reach(P, 'aR', { x: 540, y: 1400 }, 1, 1);
    return P;
  }
  const BX = 820;
  if (t < 2.5) {
    const u = prog(t, T.burst, T.coupleLand);
    P.x = lerp(650, BX, ease.outQuad(u));
    if (t < T.coupleLand) return { ...P, ...POSES.jump, lift: Math.sin(Math.PI * u) * 105, mood: 'surprised', lean: -0.25 };
    const v = prog(t, T.coupleLand, T.coupleLand + 0.35);
    const sq = Math.sin(Math.PI * Math.min(1, v * 1.2)) * (1 - v * 0.3);
    P = { ...P, ...mixP(POSES.stand, POSES.crouch, sq * 0.6), face: -1, mood: 'surprised', head: -0.2, lookY: -1 };
    const w = seg(t, 1.66, 1.86);
    return holdStack(P, w, t);
  }
  P.x = BX;
  if (t < T.stackDrop) {
    P.mood = t > T.budgetPull ? 'worried' : t > T.venuePull ? 'surprised' : 'neutral';
    P.head = t > T.venuePull ? -0.15 : 0;
    P.look = t > T.catererPull && t < T.budgetPull ? -0.4 : 0.8;
    return holdStack(P, 1, t);
  }
  if (t < 7.5) {
    // hands to cheeks
    P.mood = 'worried';
    const g = geom(P);
    const w = seg(t, T.stackDrop, T.stackDrop + 0.2);
    const sh = Math.sin(t * 30) * 2;
    P = reach(P, 'aR', { x: g.head.x - 34, y: g.head.y + 26 + sh }, w, -1);
    P = reach(P, 'aL', { x: g.head.x + 34, y: g.head.y + 26 - sh }, w, 1);
    return P;
  }
  if (t < 8.25) {
    const u = prog(t, 7.5, 8.25);
    const wk = walk(u * TAU * 1.5, 0.8);
    return { ...P, ...wk, x: lerp(BX, 740, ease.inOutSine(u)), mood: 'worried' };
  }
  P.x = 740;
  if (t < 8.55) { P.mood = 'determined'; P = reach(P, 'aR', { x: 700, y: 1170 }, seg(t, 8.28, 8.42), -1); P.lift = Math.sin(Math.PI * prog(t, 8.3, 8.5)) * 12; return P; }
  if (t < 8.92) { P.mood = 'determined'; P = { ...P, ...mixP(POSES.stand, POSES.crouch, 0.3 * seg(t, 8.55, 8.75)) }; return reach(P, 'aR', { x: 752, y: 1452 }, seg(t, 8.55, 8.75), 1); }
  if (t < T.diveJump) {
    P.mood = t < 11.1 ? 'determined' : 'happy';
    const out = seg(t, 8.92, 9.12, ease.outCubic);
    P.lean = -0.08 * out;
    // arm whips the phone up then points at it
    const tgt = t < 9.2 ? { x: lerp(752, 690, out), y: lerp(1452, 1180, out) } : { x: 650, y: 1230 + Math.sin(t * 5) * 6 };
    P = reach(P, 'aR', tgt, 1, -1);
    if (t > 11.9) { const c = seg(t, 11.9, T.diveJump); P = { ...P, ...mixP(P, POSES.crouch, c * 0.8), aR: P.aR }; }
    return P;
  }
  return diveP(P, t, 740, 560);
}

function holdStack(P, w, t) {
  const g = geom(P);
  const sx = g.hip.x - 46, sy = g.hip.y - 92;
  P = reach(P, 'aR', { x: sx - 30, y: sy + 10 }, w, -1);
  P = reach(P, 'aL', { x: sx + 34, y: sy + 16 }, w, 1);
  return P;
}

function diveP(P, t, x0, x1) {
  const u = prog(t, T.diveJump, 12.34);
  const e = ease.inOutQuad(u);
  return {
    ...P, ...POSES.jump, aL: [2.9, 0.1], aR: [2.6, 0.2], lL: [-0.5, -0.4], lR: [-0.8, -0.2],
    x: lerp(x0, x1, e), ground: lerp(GROUND, 990, e), lift: Math.sin(Math.PI * u) * 240, s: lerp(1, 0.12, ease.inQuad(u)),
    lean: 0.5 * e, face: x1 > x0 ? 1 : -1, mood: 'happy', alpha: 1 - prog(t, 12.22, 12.33),
  };
}

function mixP(a, b, u) {
  const o = { ...a };
  for (const k of ['aL', 'aR', 'lL', 'lR']) if (Array.isArray(a[k]) && Array.isArray(b[k])) o[k] = [lerp(a[k][0], b[k][0], u), lerp(a[k][1], b[k][1], u)];
  o.lean = lerp(a.lean ?? 0, b.lean ?? 0, u);
  return o;
}

const trailOf = (fn, t, t0) => [0, 1, 2, 3, 4, 5, 6].map((k) => geom(fn(Math.max(t0, t - k * 0.045))).neck);

// ---------------------------------------------------------------- item state
function itemState(it, t) {
  const tb = T.burst + it.delay;
  if (t < tb) return null;
  const st = { x: it.x, y: it.y, rot: it.rot, s: 1, alpha: 1, sx: 1, layer: 'wall' };
  const u = prog(t, tb, tb + 0.85);
  if (u < 1) {
    const e = ease.outBack(u, 1.25);
    st.x = lerp(CENTER.x, it.x, e);
    st.y = lerp(CENTER.y, it.y, e) - Math.sin(Math.PI * u) * 150 * it.liftK;
    st.rot = it.rot + it.spin * (1 - ease.outCubic(u));
    st.s = 0.3 + 0.7 * ease.outBack(Math.min(1, u * 1.5), 1.6);
  } else {
    st.rot += Math.sin(t * 1.7 + it.x) * 0.012;
  }
  // key card reactions
  if (it.key && it.id !== 'guests') {
    const pt = T[it.id + 'Pull'];
    if (t > pt) {
      const k = KEY.guests;
      const dx = k.x - it.x, dy = k.y - it.y, l = Math.hypot(dx, dy);
      const tug = ease.outCubic(prog(t, pt, pt + 0.12)) * 26 - wobble(t, pt + 0.12, 3, 5, 10);
      st.x += (dx / l) * tug; st.y += (dy / l) * tug;
      st.rot += wobble(t, pt, 2.6, 3.5, 0.16);
    }
    if (it.id === 'caterer') st.sx = Math.cos(Math.PI * seg(t, T.catererPull + 0.08, T.catererPull + 0.4, ease.inOutQuad));
  }
  if (it.key && it.id === 'guests' && t > T.scribble && t < T.write180 + 0.4) st.rot += Math.sin(t * 40) * 0.006;
  // reeled into the pile around A
  const tw = T.wrap + it.wrapDelay;
  if (t > tw) {
    const v = prog(t, tw, tw + 0.55);
    const e = ease.inBack(v, 1.2);
    const px = A_X + it.pile.dx, py = it.pile.y;
    st.x = lerp(st.x, px, e); st.y = lerp(st.y, py, e) - Math.sin(Math.PI * v) * 60;
    st.rot = lerp(st.rot, it.pile.rot, e); st.s = lerp(st.s, it.pile.s, e);
    st.sx = lerp(st.sx, 1, e);
    st.layer = it.pile.front ? 'front' : 'back';
    if (v >= 1) { st.x += Math.sin(t * 9 + it.x) * 2; st.rot += Math.sin(t * 7 + it.y) * 0.02; }
  }
  // vacuumed into the phone
  const tv = T.vacuum + 0.05 + it.vac * 0.065;
  if (t > tv) {
    const v = prog(t, tv, tv + 0.5);
    if (v >= 1) return null;
    const e = ease.inCubic(v);
    const target = { x: 540, y: 830 };
    const sx0 = st.x, sy0 = st.y;
    const side = it.vac % 2 ? 1 : -1;
    const ctrl = { x: lerp(sx0, target.x, 0.5) + side * 260, y: lerp(sy0, target.y, 0.5) + 80 };
    const p = qb({ x: sx0, y: sy0 }, ctrl, target, e);
    st.x = p.x; st.y = p.y; st.rot += e * side * 4; st.s *= 1 - e * 0.92; st.alpha = 1 - prog(v, 0.8, 1);
    st.layer = 'top';
  }
  return st;
}

function pinOf(it, st) {
  const ly = -it.h / 2 + 18;
  return { x: st.x - Math.sin(st.rot) * ly * st.s, y: st.y + Math.cos(st.rot) * ly * st.s };
}

function drawItem(ctx, it, st, t) {
  if (!it.key) {
    note(ctx, { x: st.x, y: st.y, rot: st.rot, sx: st.s * st.sx, sy: st.s, alpha: st.alpha, label: it.label, color: it.color, w: it.w, h: it.h });
    return;
  }
  const back = st.sx < 0;
  card(ctx, { x: st.x, y: st.y, w: it.w, h: it.h, rot: st.rot, sx: st.s * Math.abs(st.sx), sy: st.s, alpha: st.alpha, fill: C.ivory, r: 14 }, (g) => {
    g.fillStyle = it.band;
    rr(g, -it.w / 2, -it.h / 2, it.w, 54, 14); g.fill();
    g.fillRect(-it.w / 2, -it.h / 2 + 30, it.w, 24);
    label(g, it.title, 0, -it.h / 2 + 30, 25, C.ink, 0.2);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (it.id === 'guests') {
      g.fillStyle = C.ink; g.font = F.serif(92);
      g.fillText('150', -70, 40);
      const su = prog(t, T.scribble, T.write180 - 0.04);
      if (su > 0) {
        const pts = scribblePts(su);
        line(g, pts, C.thread, 9);
      }
      const wu = prog(t, T.write180, T.write180 + 0.4);
      if (wu > 0) {
        g.save(); g.beginPath(); g.rect(4, -60, 150 * wu, 160); g.clip();
        g.fillStyle = C.roseDeep; g.font = F.hand(104); g.fillText('180', 78, 36);
        g.restore();
      }
    } else if (it.id === 'venue') {
      g.save(); g.translate(-72, 28); icon.venue(g, 90); g.restore();
      g.fillStyle = C.ink; g.font = F.hand(50); g.fillText('fits 150', 58, 30);
      if (t > T.venueStamp) {
        const u = prog(t, T.venueStamp, T.venueStamp + 0.12);
        stampMark(g, 6, 18, 'TOO SMALL?', -0.16, lerp(1.7, 1, ease.outCubic(u)), u);
      }
    } else if (it.id === 'caterer') {
      g.save(); g.translate(-82, 30); icon.cloche(g, 84); g.restore();
      g.font = F.hand(46);
      if (!back) { g.fillStyle = C.ink; g.fillText('150 plates', 50, 32); }
      else { g.fillStyle = C.roseDeep; g.fillText('180 plates?', 50, 32); }
    } else if (it.id === 'budget') {
      const lost = t > T.budgetPull ? Math.min(4, Math.floor((t - T.budgetPull) / 0.1)) : 0;
      drawMiniJar(g, 0, 34, 7 - lost);
    }
  });
}

function scribblePts(u) {
  const pts = [];
  const n = 7;
  const total = Math.max(2, Math.floor(u * n * 6));
  for (let i = 0; i <= total; i++) {
    const k = i / 6;
    pts.push({ x: -130 + k * (150 / n) * 1.0 + Math.sin(k * Math.PI) * 4, y: (Math.floor(k) % 2 ? 6 : 64) + (k % 1) * ((Math.floor(k) % 2 ? 58 : -58)) });
  }
  return pts;
}

function drawMiniJar(g, x, y, coins) {
  g.strokeStyle = C.ink; g.lineWidth = 5;
  rr(g, x - 52, y - 58, 104, 120, 22); g.stroke();
  g.fillStyle = C.ink; rr(g, x - 38, y - 74, 76, 18, 5); g.fill();
  for (let i = 0; i < coins; i++) {
    const cx = x - 26 + (i % 3) * 26 + (Math.floor(i / 3) % 2) * 12, cy = y + 44 - Math.floor(i / 3) * 18;
    g.fillStyle = i % 2 ? C.goldDeep : C.gold; g.beginPath(); g.ellipse(cx, cy, 15, 7, 0, 0, TAU); g.fill();
  }
}

// ---------------------------------------------------------------- threads + coils
function drawThreads(ctx, t, states, gA) {
  if (t < T.threadsIn) return;
  const chest = { x: gA.hip.x, y: gA.hip.y - 70 };
  THREADS.forEach(([a, b, pull], i) => {
    const ia = ITEMS.find((x) => x.id === a), ib = ITEMS.find((x) => x.id === b);
    const sa = states[a], sb = states[b];
    if (!sa || !sb) return;
    let p0 = pinOf(ia, sa), p1 = pinOf(ib, sb);
    const draw = prog(t, T.threadsIn + i * 0.035, T.threadsIn + i * 0.035 + 0.32);
    if (draw <= 0) return;
    let taut = 0, vib = 0;
    if (pull && t > T[pull]) { taut = ease.outCubic(prog(t, T[pull], T[pull] + 0.08)); vib = shake(t, T[pull], 11, 6, 16); }
    // after the wrap starts, the far end of every thread is yanked to A
    const yank = ease.inOutCubic(prog(t, T.wrap, T.wrap + 0.3));
    if (yank > 0) { p1 = { x: lerp(p1.x, chest.x, yank), y: lerp(p1.y, chest.y, yank) }; taut = Math.max(taut, yank); }
    if (sa.layer === 'top' || sb.layer === 'top') return;
    const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const nx = -(p1.y - p0.y) / (len || 1), ny = (p1.x - p0.x) / (len || 1);
    const sag = len * 0.16 * (1 - taut * 0.92);
    const ctrl = { x: mx + nx * vib, y: my + sag + ny * vib };
    const pts = [];
    const steps = 18, upto = Math.ceil(steps * draw);
    for (let k = 0; k <= upto; k++) pts.push(qb(p0, ctrl, p1, Math.min(draw, k / steps)));
    line(ctx, pts, C.thread, pull ? 5 : 3.5);
  });
  // pins
  ITEMS.forEach((it) => {
    const st = states[it.id];
    if (!st || st.layer !== 'wall' || t < T.threadsIn) return;
    const p = pinOf(it, st);
    circle(ctx, p.x + 2, p.y + 3, 9, 'rgba(58,36,48,0.2)');
    circle(ctx, p.x, p.y, 9, C.roseDeep);
    circle(ctx, p.x - 3, p.y - 3, 3, 'rgba(255,255,255,0.7)');
  });
}

function coilCount(t) {
  if (t < T.wrap + 0.1) return 0;
  if (t < 9.7) return 9 * ease.outCubic(prog(t, T.wrap + 0.1, 7.5));
  return 9 * (1 - ease.inOutCubic(prog(t, 9.7, 10.9)));
}
function drawCoils(ctx, g, t, front) {
  const n = coilCount(t);
  if (n <= 0) return;
  ctx.strokeStyle = C.thread; ctx.lineCap = 'round';
  for (let i = 0; i < Math.ceil(n); i++) {
    const a = Math.min(1, n - i);
    const y = g.hip.y + 70 - i * 27;
    const cx = lerp(g.hip.x, g.neck.x, clamp((g.hip.y - y) / 150));
    const tilt = (i % 2 ? 0.14 : -0.12) + Math.sin(t * 6 + i) * 0.03;
    ctx.lineWidth = 6;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.ellipse(cx, y, 36, 11, tilt, front ? 0 : Math.PI, front ? Math.PI : TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- invitation card (S1)
function drawInvite(ctx, t) {
  if (t > T.burst + 0.14) return;
  let y, rot = -0.02, sx = 1, sy = 1, alpha = 1;
  if (t < T.cardImpact) {
    const u = t / T.cardImpact;
    y = lerp(260, 880, ease.inQuad(u));
    rot = lerp(-0.3, -0.02, u);
    // speed smear
    for (let k = 1; k <= 3; k++) {
      card(ctx, { x: 540, y: y - k * 70, w: 600, h: 400, rot, alpha: 0.12 / k, fill: C.ivory, shadow: 0 });
    }
  } else {
    y = 880;
    const sq = wobble(t, T.cardImpact, 3.2, 7, 1);
    sx = 1 + 0.12 * sq; sy = 1 - 0.14 * sq;
    if (t > 0.55) {
      const u = prog(t, 0.55, T.burst);
      rot += Math.sin(t * 70) * 0.03 * u * u;
      sx *= 1 + 0.05 * u * u; sy *= 1 + 0.05 * u * u;
    }
    if (t > T.burst) { const u = prog(t, T.burst, T.burst + 0.14); sx *= 1 + 0.3 * u; sy *= 1 + 0.3 * u; alpha = 1 - u; }
  }
  card(ctx, { x: 540, y, w: 600, h: 400, rot, sx, sy, alpha, fill: C.ivory, r: 10 }, (g) => {
    g.strokeStyle = C.rose; g.lineWidth = 6; rr(g, -276, -176, 552, 352, 6); g.stroke();
    g.lineWidth = 2; rr(g, -262, -162, 524, 324, 4); g.stroke();
    label(g, 'SAVE THE DATE', 0, -104, 28, C.roseDeep, 0.25);
    g.fillStyle = C.ink; g.font = F.serifI(64); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText("We're getting", 0, -22);
    g.fillText('married!', 0, 52);
    circle(g, -20, 126, 22, null, C.gold, 7);
    circle(g, 16, 126, 22, null, C.goldDeep, 7);
  });
  // impact dust
  if (t > T.cardImpact && t < T.cardImpact + 0.5) {
    const u = prog(t, T.cardImpact, T.cardImpact + 0.5);
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1, k = i % 4;
      circle(ctx, 540 + side * (300 + u * (60 + k * 40)), 1080 - k * 14 - u * 30, (14 + k * 6) * (1 - u * 0.4), `rgba(234,223,207,${0.9 * (1 - u)})`);
    }
  }
  if (t > T.burst && t < T.burst + 0.3) {
    const u = prog(t, T.burst, T.burst + 0.3);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      const r0 = 330 + u * 160, r1 = r0 + 70 * (1 - u);
      line(ctx, [{ x: 540 + Math.cos(a) * r0, y: 880 + Math.sin(a) * r0 * 0.75 }, { x: 540 + Math.cos(a) * r1, y: 880 + Math.sin(a) * r1 * 0.75 }], C.roseDeep, 8 * (1 - u));
    }
  }
}

function drawExtras(ctx, t) {
  if (t < T.burst || t > T.burst + 1.6) return;
  XTRA.forEach((x) => {
    const tau = t - T.burst - x.delay;
    if (tau < 0) return;
    const drag = (1 - Math.exp(-2.2 * tau)) / 2.2;
    const px = 540 + x.vx * drag, py = 880 + x.vy * drag + 1500 * tau * tau;
    if (py > H + 200 || px < -300 || px > W + 300) return;
    note(ctx, { x: px, y: py, rot: x.spin * tau, sx: 0.8, sy: 0.8, label: x.label, color: x.color, w: 200, h: 140 });
  });
}

// B's stack of notes (caught in S1, dropped in S2)
function drawStack(ctx, t, gB) {
  const labels = ['Florist', 'Vows', 'Sweets'];
  labels.forEach((l, i) => {
    let x, y, rot;
    const hold = { x: (gB.handL.x + gB.handR.x) / 2, y: (gB.handL.y + gB.handR.y) / 2 - 18 - i * 16 };
    if (t < T.stackCatch) {
      const u = prog(t, 1.45 + i * 0.07, T.stackCatch);
      if (u <= 0) return;
      x = lerp(700 - i * 30, hold.x, ease.inQuad(u)); y = lerp(-120, hold.y, ease.inQuad(u)); rot = (1 - u) * (2 + i);
    } else if (t < T.stackDrop) {
      x = hold.x + Math.sin(t * 3 + i) * 2; y = hold.y; rot = 0.05 * (i - 1);
    } else {
      const u = prog(t, T.stackDrop + i * 0.04, T.stackDrop + 0.5 + i * 0.04);
      if (t > T.vacuum + 0.3) {
        const v = prog(t, T.vacuum + 0.3 + i * 0.1, T.vacuum + 0.8 + i * 0.1);
        if (v >= 1) return;
        const p = qb({ x: 780 + (i - 1) * 60, y: GROUND - 20 }, { x: 900, y: 1000 }, { x: 540, y: 830 }, ease.inCubic(v));
        note(ctx, { x: p.x, y: p.y, rot: v * 5, sx: 0.75 * (1 - v * 0.9), sy: 0.75 * (1 - v * 0.9), label: l, color: [C.roseTint, C.sageTint, C.butter][i], w: 200, h: 140, alpha: 1 - prog(v, 0.8, 1) });
        return;
      }
      x = lerp(gB.hip.x - 40, 780 + (i - 1) * 60, ease.outQuad(u)); y = lerp(1330, GROUND - 20, ease.inQuad(u)); rot = lerp(0, (i - 1) * 0.8 + 0.3, u);
    }
    note(ctx, { x, y, rot, sx: 0.75, sy: 0.75, label: l, color: [C.roseTint, C.sageTint, C.butter][i], w: 200, h: 140 });
  });
}

// pencil prop for A
function pencilState(t, gA) {
  const lying = { hand: { x: 120, y: GROUND - 16 }, tip: { x: 440, y: GROUND - 14 } };
  if (t < T.pencilGrab) return lying;
  if (t < 3.15) {
    const u = seg(t, T.pencilGrab, 3.15);
    const hand = gA.handR;
    const ang = lerp(0, -1.1, u);
    return { hand, tip: { x: hand.x + Math.cos(ang) * 330, y: hand.y + Math.sin(ang) * 330 } };
  }
  if (t < T.pencilDrop - 0.4) {
    return { hand: gA.handR, tip: null };
  }
  const u = prog(t, T.pencilDrop - 0.4, T.pencilDrop);
  const ang = lerp(-1.2, 0.05, ease.inQuad(u));
  const hx = lerp(390, 230, u), hy = lerp(1330, GROUND - 14, ease.inQuad(u));
  return { hand: { x: hx, y: hy }, tip: { x: hx + Math.cos(ang) * 330, y: hy + Math.sin(ang) * 330 }, free: true };
}

// pencil tip target during writing (world coords)
function tipTarget(t) {
  const k = KEY.guests;
  const toW = (lx, ly) => ({ x: k.x + lx * Math.cos(k.rot) - ly * Math.sin(k.rot), y: k.y + lx * Math.sin(k.rot) + ly * Math.cos(k.rot) });
  if (t < T.scribble) return toW(-130, 30);
  if (t < T.write180) { const pts = scribblePts(prog(t, T.scribble, T.write180 - 0.04)); const p = pts[pts.length - 1]; return toW(p.x, p.y); }
  if (t < T.write180 + 0.42) { const u = prog(t, T.write180, T.write180 + 0.4); return toW(20 + 140 * u, 30 + Math.sin(u * TAU * 3) * 26); }
  const u = seg(t, T.write180 + 0.42, 4.4);
  return { x: lerp(toW(160, 30).x, 470, u), y: lerp(toW(160, 30).y, 1180, u) };
}

// ---------------------------------------------------------------- phone (S3)
function phoneState(t, gB) {
  if (t < 8.98) return null;
  if (t < 9.12) return { x: gB.handR.x, y: gB.handR.y - 20, s: 0.13, rot: -0.4 };
  const u = prog(t, 9.12, T.phoneLand);
  const e = ease.outBack(u, 1.4);
  const fl = t > T.phoneLand ? Math.sin((t - T.phoneLand) * 2.4) * 5 * (1 - prog(t, 11.7, 12.1)) : 0;
  return { x: lerp(gB.handR.x, 540, ease.outCubic(u)), y: lerp(gB.handR.y - 20, 830, ease.outCubic(u)) + fl, s: lerp(0.13, 1, e), rot: lerp(-0.4, 0, ease.outCubic(u)) };
}

// ---------------------------------------------------------------- camera
function camera(t) {
  const push = seg(t, 6.7, 7.7, ease.inOutCubic) * (1 - seg(t, 8.85, 9.45, ease.inOutCubic));
  let vw = 1080 / (1 + 0.035 * seg(t, 2.5, 6.7, ease.inOutSine) * (1 - push) + 0.34 * push);
  let cx = lerp(540, 560, push), cy = lerp(960, 1290, push);
  const z = ease.inOutCubic(prog(t, T.zoomIn, T.s4));
  if (z > 0) {
    const vw0 = vw, vw1 = PHONE.sw * 0.9; // overshoot so the rounded screen corners leave frame
    vw = vw0 * Math.pow(vw1 / vw0, z);
    const m = (vw0 - vw) / (vw0 - vw1);
    cx = lerp(cx, 540, m); cy = lerp(cy, 830, m);
  }
  let sx = shake(t, T.cardImpact, 13, 9, 14) + shake(t, T.venueStamp, 15, 12, 5) + shake(t, T.wrap, 9, 6, 9);
  let sy = shake(t, T.cardImpact + 0.02, 11, 9, 18) + shake(t, T.burst, 12, 10, 8);
  return { vw, cx: cx + sx * (vw / 1080), cy: cy + sy * (vw / 1080) };
}

// ---------------------------------------------------------------- frame
export function drawDesk(ctx, t) {
  const cam = camera(t);
  const k = 1080 / cam.vw;
  ctx.save();
  ctx.setTransform(k, 0, 0, k, 540 - cam.cx * k, 960 - cam.cy * k);
  ctx.drawImage(paper, -60, -100, W + 120, H + 200);
  floor(ctx);

  const PA = poseA(t), PB = poseB(t);
  const gA = geom(PA), gB = geom(PB);
  const states = {};
  ITEMS.forEach((it) => (states[it.id] = itemState(it, t)));

  // wall layer: small notes first, key cards on top
  ITEMS.filter((it) => !it.key).forEach((it) => states[it.id]?.layer === 'wall' && drawItem(ctx, it, states[it.id], t));
  ITEMS.filter((it) => it.key).forEach((it) => states[it.id]?.layer === 'wall' && drawItem(ctx, it, states[it.id], t));
  drawThreads(ctx, t, states, gA);
  drawCoinsFlying(ctx, t);
  ITEMS.forEach((it) => states[it.id]?.layer === 'back' && drawItem(ctx, it, states[it.id], t));

  // characters + props
  const pz = pencilState(t, gA);
  if (pz && (pz.free || t < T.pencilGrab)) pencil(ctx, pz.hand, pz.tip, 1);
  drawCoils(ctx, gA, t, false);
  let PA2 = PA;
  if (t >= 3.15 && t < T.pencilDrop - 0.4) {
    // IK: keep pencil tip on the target while the hand holds the other end
    const tip = tipTarget(t);
    const sh = gA.sh;
    const d = Math.hypot(tip.x - sh.x, tip.y - sh.y);
    const L = 330;
    const hand = { x: tip.x - ((tip.x - sh.x) / d) * Math.min(L, d - 60), y: tip.y - ((tip.y - sh.y) / d) * Math.min(L, d - 60) };
    PA2 = reach(PA, 'aR', hand, t < T.wrap ? 1 : 0, -1);
    const g2 = geom(PA2);
    if (t < T.wrap) pencil(ctx, g2.handR, tip, 1);
    drawFig(ctx, g2, { who: 'A', trail: trailOf(poseA, t, 0) });
  } else if (t < T.diveJump) {
    if (pz && !pz.free && t >= T.pencilGrab && t < 3.15) pencil(ctx, gA.handR, pz.tip, 1);
    const alpha = PA.alpha ?? 1;
    ctx.save(); ctx.globalAlpha = alpha;
    drawFig(ctx, gA, { who: 'A', trail: trailOf(poseA, t, 0) });
    ctx.restore();
  }
  drawCoils(ctx, gA, t, true);
  if (t < T.diveJump) drawFig(ctx, gB, { who: 'B' });
  drawStack(ctx, t, gB);
  if (t > T.bIdea && t < T.bIdea + 0.4) {
    const u = prog(t, T.bIdea, T.bIdea + 0.4);
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.4; const r0 = 70 + u * 30; line(ctx, [{ x: gB.head.x + Math.cos(a) * r0, y: gB.head.y + Math.sin(a) * r0 }, { x: gB.head.x + Math.cos(a) * (r0 + 22 * (1 - u)), y: gB.head.y + Math.sin(a) * (r0 + 22 * (1 - u)) }], C.gold, 6); }
  }
  ITEMS.forEach((it) => states[it.id]?.layer === 'front' && drawItem(ctx, it, states[it.id], t));

  // phone + vacuum
  const ph = phoneState(t, gB);
  if (ph) {
    phone(ctx, ph.x, ph.y, ph.s, ph.rot, (g, r) => {
      g.drawImage(screenPaper, r.x, r.y, r.w, r.h);
      const fadeUI = 1 - prog(t, 12.12, 12.32);
      if (t > T.vacuum - 0.2 && t < T.freed + 0.2) {
        const u = prog(t, T.vacuum - 0.2, T.freed + 0.2);
        for (let i = 0; i < 4; i++) {
          const rr0 = ((1 - ((u * 3 + i / 4) % 1)) * 260);
          circle(g, 0, 40, rr0, null, `rgba(192,108,128,${0.35 * (1 - rr0 / 260)})`, 8);
        }
      }
      homeScreen(g, r, t, T.tiles, fadeUI);
    });
    if (t > 9.3 && t < 12.1) {
      ctx.save(); ctx.globalAlpha = seg(t, 9.4, 9.7) * (1 - prog(t, 11.9, 12.1));
      ctx.fillStyle = C.inkSoft; ctx.font = F.sans(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Stylized illustration', 540, 1252);
      ctx.restore();
    }
  }
  ITEMS.forEach((it) => states[it.id]?.layer === 'top' && drawItem(ctx, it, states[it.id], t));
  // diving figures drawn above the phone so they visibly jump into the screen
  if (t >= T.diveJump && t < 12.45) {
    ctx.save(); ctx.globalAlpha = PB.alpha ?? 1; drawFig(ctx, gB, { who: 'B' }); ctx.restore();
    ctx.save(); ctx.globalAlpha = PA.alpha ?? 1; drawFig(ctx, gA, { who: 'A' }); ctx.restore();
  }
  drawInvite(ctx, t);
  drawExtras(ctx, t);
  ctx.restore();
}

function drawCoinsFlying(ctx, t) {
  if (t < T.budgetPull || t > T.budgetPull + 1.4) return;
  const k = KEY.budget;
  for (let i = 0; i < 4; i++) {
    const t0 = T.budgetPull + 0.06 + i * 0.1;
    const tau = t - t0;
    if (tau < 0) continue;
    const vx = [-260, 180, -120, 300][i], vy = [-700, -820, -600, -760][i];
    let x = k.x + vx * tau, y = k.y - 10 + vy * tau + 1600 * tau * tau;
    if (y > GROUND - 14) y = GROUND - 14;
    ctx.save(); ctx.globalAlpha = 1 - prog(t, T.budgetPull + 1.0, T.budgetPull + 1.3); ctx.translate(x, y); ctx.rotate(tau * 8);
    ctx.scale(Math.cos(tau * 12), 1);
    icon.coin(ctx, 56); ctx.restore();
  }
}
