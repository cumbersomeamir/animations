// 15 s origami-world story: an invitation folds into a crane, and each pass of the crane
// unfolds one part of a coordinated wedding world; the world folds flat into the end card.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, person, pillar, canopy, cake, tulips, camera, tag, strip, check, box, coin, envelope, plane, pennant } from './models.mjs';
import { T } from './cues.mjs';

const FLOOR = 1450, RISER = 1268;
const grain = makeGrain(5);
let icon = null;
export async function init() { icon = await loadImage('assets/app-icon-play.png'); }

// ---------------------------------------------------------------- stepped camera (cx, cy, zoom)
const CAM = [
  [0, 540, 960, 1], [T.cam1, 540, 960, 1], [T.cam1 + 0.42, 540, 1190, 1.68],
  [T.cam2, 540, 1190, 1.68], [T.cam2 + 0.38, 225, 1420, 1.85],
  [T.cam3, 225, 1420, 1.85], [T.cam3 + 0.38, 860, 1450, 1.8],
  [T.cam4, 860, 1450, 1.8], [T.cam4 + 0.38, 540, 1170, 1.3],
  [T.cam5, 540, 1170, 1.3], [T.cam5 + 0.5, 540, 960, 1],
];
function cam(t) {
  for (let i = 1; i < CAM.length; i++) {
    if (t <= CAM[i][0]) {
      const [t0, x0, y0, z0] = CAM[i - 1], [t1, x1, y1, z1] = CAM[i];
      const u = ease.inOut(prog(t, t0, t1));
      // interpolate zoom in log space so the move feels even
      return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), z: Math.exp(lerp(Math.log(z0), Math.log(z1), u)) };
    }
  }
  const l = CAM[CAM.length - 1];
  return { x: l[1], y: l[2], z: l[3] };
}

// ---------------------------------------------------------------- pop-up timing with world fold-down
const rise = (t, t0, dur = 0.34) => (t < t0 ? 0 : t < t0 + dur ? ease.back(prog(t, t0, t0 + dur), 2.2) : 1);
const folddown = (t, x) => 1 - seg(t, T.foldDown + (x / W) * 0.32, T.foldDown + (x / W) * 0.32 + 0.3, ease.in);
const up = (t, t0, x, dur) => rise(t, t0, dur) * folddown(t, x);

// ---------------------------------------------------------------- backdrop
const WALL = (() => {
  const r = rng(11), pts = [];
  const cols = 5, rows = 6;
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pts.push([(-200 + i * (1480 / cols)) + (i % cols ? (r() - 0.5) * 120 : 0), -300 + j * (2000 / rows) + (j % rows ? (r() - 0.5) * 120 : 0)]);
  const tris = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = pts[j * (cols + 1) + i], b = pts[j * (cols + 1) + i + 1], c = pts[(j + 1) * (cols + 1) + i], d = pts[(j + 1) * (cols + 1) + i + 1];
    tris.push({ pts: [a, b, d], c: P.blush, tone: 0.1 + (r() - 0.5) * 0.14 }, { pts: [a, d, c], c: P.blush, tone: -0.04 + (r() - 0.5) * 0.14 });
  }
  return tris;
})();
function wall(ctx) {
  for (const f of WALL) { path(ctx, f.pts); ctx.fillStyle = shade(f.c, f.tone); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,250,244,0.35)'; ctx.lineWidth = 2;
  for (const f of WALL) { path(ctx, f.pts); ctx.stroke(); }
}
function floor(ctx) {
  facets(ctx, [
    { pts: [[-400, FLOOR], [540, FLOOR], [-400, 2600]], c: P.cream, tone: 0.08 },
    { pts: [[540, FLOOR], [1480, FLOOR], [1480, 2600], [-400, 2600]], c: P.cream, tone: -0.04 },
    { pts: [[540, FLOOR], [1480, 2000], [1480, 2600]], c: P.creamDeep, tone: 0.0 },
  ], { shadow: false, outline: false });
  ctx.strokeStyle = 'rgba(74,30,38,0.12)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-400, FLOOR); ctx.lineTo(1480, FLOOR); ctx.stroke();
}
function riser(ctx, t) {
  const u = up(t, T.riser, 540, 0.4);
  popup(ctx, 0, FLOOR, u, (g) => {
    const h = FLOOR - RISER;
    const list = [];
    for (let i = -3; i < 12; i++) {
      const x0 = i * 120, x1 = x0 + 120;
      list.push({ pts: [[x0, 0], [x1, 0], [x1, -h + 14], [x0, -h + 14]], c: P.creamDeep, tone: i % 2 ? -0.14 : 0.06 });
    }
    list.push({ pts: [[-400, -h + 14], [1480, -h + 14], [1480, -h], [-400, -h]], c: P.cream, tone: 0.35 });
    facets(g, list, { blur: 18, sx: 0, sy: 10 });
  });
}

// ---------------------------------------------------------------- the invitation (beat 1)
const CARD = { x: 540, y: 880, w: 700, h: 500 };
function invitation(ctx, t) {
  if (t >= T.squash) return;
  const j = jit(t, 1, 1.4);
  ctx.save(); ctx.translate(j.x, j.y);
  const { x, y, w, h } = CARD;
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  const front = (g, x0, x1) => {
    facets(g, [{ pts: [[x0, tp], [x1, tp], [x1, bt], [x0, bt]], c: P.cream, tone: x0 < x ? 0.12 : -0.02 }], { blur: 22, sx: 8, sy: 14 });
  };
  const content = (g) => {
    g.save(); g.beginPath(); g.rect(l, tp, w, h); g.clip();
    g.strokeStyle = P.goldLight; g.lineWidth = 4; g.strokeRect(l + 22, tp + 22, w - 44, h - 44);
    g.fillStyle = P.ink; g.font = F.serifI(88); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText("You're invited", x, y - 30);
    g.font = F.sansB(32); g.fillStyle = P.rasp; g.fillText('SAVE THE DATE', x, y + 62);
    g.restore();
    heart(g, x, y + 150, 26, P.gold, { blur: 6 });
  };
  // fold A: right half hinges over the left half (vertical crease at x)
  const a = seg(t, T.foldA, T.foldA + 0.36, ease.inOut);
  const thA = a * Math.PI;
  // fold B: top corners of the half-card fold down along diagonals
  const b = seg(t, T.foldB, T.foldB + 0.3, ease.inOut);
  if (b <= 0) {
    front(ctx, l, x);
    ctx.save(); ctx.beginPath(); ctx.rect(l - 10, tp - 10, w / 2 + 10, h + 20); ctx.clip(); content(ctx); ctx.restore();
    const k = Math.cos(thA);
    if (k >= 0) {
      ctx.save(); ctx.translate(x, 0); ctx.scale(k, 1); ctx.translate(-x, 0);
      front(ctx, x, r);
      ctx.save(); ctx.beginPath(); ctx.rect(x, tp - 10, w / 2 + 10, h + 20); ctx.clip(); content(ctx); ctx.restore();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,250,242,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, tp); ctx.lineTo(x, bt); ctx.stroke();
    } else {
      // back of the card is raspberry: the reverse face shows as it folds over
      facets(ctx, [{ pts: [[x, tp], [x + (r - x) * k, tp], [x + (r - x) * k, bt], [x, bt]], c: P.raspLight, tone: 0.1 - 0.3 * (1 + k) }], { blur: 14, sx: 5, sy: 9 });
    }
  } else {
    // half card (raspberry face up) with two corner flaps folding down
    const hw = w / 2;
    const L0 = [l, tp], R0 = [x, tp], ml = [l, tp + hw / 2], mr = [x, tp + hw / 2], mid = [l + hw / 2, tp];
    facets(ctx, [{ pts: [[l, tp + 1], [x, tp + 1], [x, bt], [l, bt]], c: P.raspLight, tone: 0.0 }], { blur: 20, sx: 8, sy: 14 });
    const th = b * Math.PI * 0.98;
    const f1 = hinge([L0, mid, ml], ml, mid, th), f2 = hinge([R0, mr, mid], mid, mr, th);
    for (const f of [f1, f2]) facets(ctx, [{ pts: f.pts, c: f.front ? P.raspLight : P.cream, tone: f.front ? 0.2 * f.k : 0.25 * -f.k - 0.05 }], { blur: 10, sx: 4, sy: 8 });
    ctx.strokeStyle = 'rgba(255,250,242,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(...ml); ctx.lineTo(...mid); ctx.lineTo(...mr); ctx.stroke();
  }
  ctx.restore();
  // the ribbon slides off first (immediate motion on frame 0)
  const rb = seg(t, 0, 0.34, ease.in);
  if (rb < 1) {
    const ox = rb * 900, oy = rb * rb * 260, rot = rb * 0.6;
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot * 0.2);
    ribbon(ctx, [l - 40, y + 70], [r + 40, y + 40], 46, P.rasp);
    star4(ctx, x + 120, y + 52, 30, P.rasp, P.raspDark);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- crane path
function craneState(t) {
  if (t < T.squash) return null;
  if (t < T.flap1) return { x: 540, y: 905, s: lerp(1.55, 1.4, prog(t, T.squash, T.morphEnd)), m: seg(t, T.squash + 0.06, T.morphEnd, ease.inOut), phi: 0.5, dir: 1, sp: 'world' };
  if (t < T.cam1) {
    const u = prog(t, T.flap1, T.cam1);
    return { x: 540 + u * 90, y: 905 - u * 170, s: 1.4, m: 1, phi: flapPhi(t, T.flap1), dir: 1, sp: 'world' };
  }
  const swoop = (t0, a, b, c, s0, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s: s0, m: 1, phi: flapPhi(t, t0), dir, sp: 'screen', rot: dir * (u - 0.5) * 0.3 }; };
  if (t < T.cam1 + 0.55) return swoop(T.cam1, [630, 735], [300, 520], [-420, 980], 1.9, -1);
  if (t > 2.9 && t < 4.2) { const u = prog(t, 2.9, 4.2); return { x: lerp(-120, 1200, u), y: 820 + Math.sin(u * Math.PI) * -90, s: 0.3, m: 1, phi: flapPhi(t, 2.9), dir: 1, sp: 'world' }; }
  if (t >= T.cam2 - 0.05 && t < T.cam2 + 0.5) return swoop(T.cam2 - 0.05, [1450, 700], [700, 1000], [-450, 820], 1.8, -1);
  if (t >= T.cam3 - 0.05 && t < T.cam3 + 0.5) return swoop(T.cam3 - 0.05, [-450, 820], [400, 1050], [1500, 640], 1.8, 1);
  if (t >= T.cam4 - 0.05 && t < T.cam4 + 0.5) return swoop(T.cam4 - 0.05, [1450, 620], [600, 900], [-450, 700], 1.8, -1);
  if (t >= T.cam5 && t < T.foldDown + 0.1) {
    const u = ease.out(prog(t, T.cam5, T.perch));
    const landed = t >= T.perch;
    return { x: lerp(-120, 545, u), y: lerp(640, 862, u) + (landed ? 0 : -Math.sin(u * Math.PI) * 80), s: 0.34, m: 1, phi: landed ? 0.15 + 0.12 * Math.sin(t * 9) * (t < T.perch + 0.3 ? 1 : 0) : flapPhi(t, T.cam5), dir: 1, sp: 'world' };
  }
  if (t >= T.foldDown + 0.1) {
    const u = ease.inOut(prog(t, T.foldDown + 0.1, T.cardPerch));
    const landed = t >= T.cardPerch;
    // arc out to the right so the crane never crosses the emblem or title
    const qx = (1 - u) * (1 - u) * 545 + 2 * (1 - u) * u * 1010 + u * u * 760, qy = (1 - u) * (1 - u) * 862 + 2 * (1 - u) * u * 700 + u * u * 322;
    return { x: qx, y: qy, s: lerp(0.34, 0.44, u), m: 1, phi: landed ? 0.18 : flapPhi(t, T.foldDown), dir: 1, sp: 'world' };
  }
  return null;
}
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25; // fast wing beats; stepping makes them read as poses

// ---------------------------------------------------------------- arch (beat 2)
function arch(ctx, t) {
  popup(ctx, 0, FLOOR, up(t, T.pillarL, 405, 0.36), (g) => pillar(g, 405, 450));
  popup(ctx, 0, FLOOR, up(t, T.pillarR, 675, 0.36), (g) => pillar(g, 675, 450));
  const cu = seg(t, T.canopy, T.canopy + 0.4, ease.out) * folddown(t, 540);
  canopy(ctx, 360, 720, FLOOR - 470, 74, cu);
  const hu = up(t, T.archHeart, 540, 0.3);
  if (hu > 0.03) {
    ctx.save(); ctx.translate(540, 950); ctx.scale(hu, hu); ctx.translate(-540, -950);
    heart(ctx, 540, 925, 62);
    ribbon(ctx, [474, 962], [608, 908], 20, P.rasp);
    ctx.restore();
  }
  const fu = up(t, T.archFlower, 540, 0.3);
  if (fu > 0.03) star4(ctx, 540, 852, 30 * fu, P.rasp, P.raspDark);
}

// ---------------------------------------------------------------- vendors (beat 3)
function vendors(ctx, t) {
  const j = (id) => jit(t, id, 1.2);
  popup(ctx, 120 + j(11).x, 1505, up(t, T.cake, 150, 0.34), (g) => cake(g));
  popup(ctx, 335 + j(12).x, 1532, up(t, T.tulips, 312, 0.34), (g) => tulips(g));
  popup(ctx, 205 + j(13).x, 1648, up(t, T.camera, 205, 0.34), (g) => camera(g));
  const tg = (x, y, s, id) => popup(ctx, x, y, up(t, T.tags + id * 0.06, x, 0.25), (g) => tag(g, s, 28));
  tg(120, 1548, 'Caterer', 0); tg(335, 1574, 'Decor', 1); tg(205, 1712, 'Photographer', 2);
  // save favourites: folded hearts pop above two vendors
  [[T.fav1, 330, 1676], [T.fav2, 408, 1538]].forEach(([tf, x, y], i) => {
    const u = up(t, tf, x, 0.3);
    if (u < 0.03) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.rotate(-0.1 + i * 0.2);
    heart(ctx, 0, 0, 24, P.rasp, { blur: 8 });
    ctx.restore();
    // burst lines on the pop
    if (t > tf && t < tf + 0.3) {
      const v = prog(t, tf, tf + 0.3);
      ctx.strokeStyle = P.raspLight; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (40 + v * 30), y + Math.sin(a) * (40 + v * 30)); ctx.lineTo(x + Math.cos(a) * (52 + v * 40), y + Math.sin(a) * (52 + v * 40)); ctx.stroke(); }
    }
  });
}

// ---------------------------------------------------------------- checklist + budget (beat 4)
const ITEMS = ['Book venue', 'Pick vendors', 'Send invites'];
const DY = 230;
function checklist(ctx, t) {
  const fd = folddown(t, 860);
  if (t < T.strip0 - 0.1 || fd <= 0) return;
  ctx.save(); ctx.translate(0, DY); // hangs in front of the riser so the guests above stay visible
  ctx.translate(0, 1062); ctx.scale(1, fd); ctx.translate(0, -1062);
  // gold header tab
  facets(ctx, [
    { pts: [[720, 1040], [1000, 1040], [1000, 1080], [720, 1080]], c: P.gold, tone: 0.15 },
    { pts: [[740, 1040], [980, 1040], [960, 1018], [760, 1018]], c: P.gold, tone: 0.4 },
  ], { blur: 10, sx: 4, sy: 8 });
  ctx.fillStyle = P.cream; ctx.font = F.sansB(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('CHECKLIST', 860, 1061);
  ITEMS.forEach((s, i) => {
    const th = (1 - seg(t, T.strip0 + i * 0.15, T.strip0 + i * 0.15 + 0.25, ease.out)) * Math.PI * 0.98;
    const ck = up(t, [T.check0, T.check1, T.check2][i], 860, 0.22); // invites tick once they are sent
    strip(ctx, 860, 1084 + i * 86, 280, 84, i, s, th, ck);
  });
  ctx.restore();
  popup(ctx, 870, 1770, up(t, T.box, 870, 0.3), (g) => box(g, 220, 118, 'Budget'));
  // a gold coin folds down into the budget box after each check
  [T.check0, T.check1].forEach((tc, i) => {
    const u = prog(t, tc + 0.05, tc + 0.33);
    if (u <= 0) return;
    const yEnd = 1690 - i * 14;
    if (u < 1) coin(ctx, 990 - u * 90, lerp(1170 + DY + i * 86, yEnd, u * u), 26, u * 3);
  });
  const n = (t > T.check0 + 0.33 ? 1 : 0) + (t > T.check1 + 0.33 ? 1 : 0);
  const fb = folddown(t, 870);
  for (let i = 0; i < n; i++) if (fb > 0.2) coin(ctx, 850 + i * 40, 1690 - i * 6, 24 * fb, i);
}

// ---------------------------------------------------------------- invitations + guests (beat 5)
const GUESTS = [90, 185, 280, 800, 895, 990].map((x, i) => ({ x, col: [P.raspLight, P.gold, P.blushDeep, P.goldLight, P.rasp, P.goldPale][i], kind: i % 2 ? 'B' : 'A' }));
const arrive = (i) => T.planes + i * T.planeGap + T.flight;
function guests(ctx, t) {
  GUESTS.forEach((g, i) => {
    const u = up(t, arrive(i), g.x, 0.3) * up(t, T.riser, g.x, 0.4);
    if (u <= 0.03) return;
    popup(ctx, g.x, RISER, u, (c) => {
      const raise = clamp((t - arrive(i) - 0.15) / 0.2);
      const hands = person(c, 0, 0, 150, g.kind, { col: g.col, arms: [0.2, -0.2 - raise * 2.6] });
      if (raise > 0) {
        const hnd = hands[1];
        c.save(); c.translate(hnd[0], hnd[1]);
        facets(c, [{ pts: [[-4, 0], [-4, -46], [36, -36], [-4, -24]], c: P.cream, tone: 0.2 }], { blur: 6, sx: 2, sy: 4 });
        c.restore();
        check(c, hnd[0] + 12, hnd[1] - 36, 14 * raise);
      }
    });
  });
}
function invites(ctx, t) {
  const eu = up(t, T.envelope, 540, 0.3);
  const fl = seg(t, T.flap, T.flap + 0.2, ease.out) * Math.PI * (1 - seg(t, 10.6, 10.9));
  popup(ctx, 540, 1452, eu * (1 - seg(t, 10.9, 11.15)), (g) => envelope(g, 150, 100, fl));
  GUESTS.forEach((gst, i) => {
    const t0 = T.planes + i * T.planeGap;
    const u = prog(t, t0, t0 + T.flight);
    if (u <= 0 || u >= 1) return;
    const a = [540, 1360], c = [lerp(540, gst.x, 0.5), 950 - (i % 3) * 40], b = [gst.x, RISER - 110];
    const q = (v) => [lerp(lerp(a[0], c[0], v), lerp(c[0], b[0], v), v), lerp(lerp(a[1], c[1], v), lerp(c[1], b[1], v), v)];
    const p0 = q(ease.inOut(u)), p1 = q(ease.inOut(Math.min(1, u + 0.05)));
    plane(ctx, p0[0], p0[1], 1.15, Math.atan2(p1[1] - p0[1], p1[0] - p0[0]));
  });
}

// ---------------------------------------------------------------- couple + pennants (beat 6)
function couple(ctx, t) {
  const hand = seg(t, T.hands, T.hands + 0.2);
  popup(ctx, 500, FLOOR, up(t, T.couple, 500, 0.32), (g) => person(g, 0, 0, 250, 'A', { arms: [0.2, -0.2 - hand * 0.9], look: 1 }));
  popup(ctx, 582, FLOOR, up(t, T.couple + 0.1, 582, 0.32), (g) => person(g, 0, 0, 250, 'B', { arms: [0.2 + hand * 0.9, -0.2], look: -1 }));
}
function pennants(ctx, t) {
  if (t < T.pennants) return;
  const fd = folddown(t, 540);
  if (fd < 0.35) return;
  const runs = [[[372, 1000], [-40, 1080]], [[708, 1000], [1120, 1080]]];
  runs.forEach(([a, b], r) => {
    const sag = 60;
    const q = (v) => [lerp(a[0], b[0], v), lerp(a[1], b[1], v) + Math.sin(v * Math.PI) * sag];
    const n = 7;
    ctx.strokeStyle = P.raspDark; ctx.lineWidth = 3;
    ctx.beginPath(); for (let k = 0; k <= 20; k++) { const p = q(k / 20); k ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke();
    for (let k = 1; k <= n; k++) {
      const v = k / (n + 1), p = q(v);
      const open = seg(t, T.pennants + k * 0.06, T.pennants + k * 0.06 + 0.2, ease.out) * fd;
      if (open > 0.04) pennant(ctx, p[0], p[1], 20, (1 - open) * Math.PI * 0.97, k % 2 ? P.rasp : P.goldLight);
    }
  });
}

// ---------------------------------------------------------------- captions: folded paper strips
const CAPS = [
  [0.25, 2.0, 'One invitation…'], [2.5, 4.25, 'A venue to book'], [4.72, 6.45, 'Vendors to choose'],
  [6.95, 8.65, 'Checklist & budget'], [9.15, 10.8, 'Invites out. RSVPs in.'], [11.0, 12.4, 'All folded into one plan.'],
];
function captions(ctx, t) {
  for (const [a, b, text] of CAPS) {
    if (t < a || t > b + 0.25) continue;
    const u = seg(t, a, a + 0.25, ease.out) * (1 - seg(t, b, b + 0.25, ease.in));
    if (u <= 0.02) continue;
    ctx.font = F.serif(78);
    const tw = ctx.measureText(text).width;
    const w = Math.min(1000, tw + 110), h = 118, x = 540, y = 300;
    const j = jit(t, 99, 1);
    ctx.save(); ctx.translate(x + j.x, y + j.y); ctx.rotate(j.r - 0.01);
    // two panels opening from the centre crease like a folded strip
    const k = Math.sin(u * Math.PI / 2);
    const half = (side) => {
      const xs = side * (w / 2) * k;
      return [
        { pts: [[0, -h / 2], [xs, -h / 2 + 4], [xs, 0], [0, 0]], c: P.cream, tone: side < 0 ? 0.32 : 0.16 },
        { pts: [[0, 0], [xs, 0], [xs, h / 2 - 4], [0, h / 2]], c: P.cream, tone: side < 0 ? 0.06 : -0.1 },
      ];
    };
    // notched ribbon tails behind
    const tail = (side) => ({ pts: [[side * (w / 2 - 20) * k, -h / 2 + 22], [side * (w / 2 + 46) * k, -h / 2 + 22], [side * (w / 2 + 24) * k, 8], [side * (w / 2 + 46) * k, h / 2 + 4], [side * (w / 2 - 20) * k, h / 2 + 4]], c: P.rasp, tone: -0.15 });
    facets(ctx, [tail(-1), tail(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [...half(-1), ...half(1)], { blur: 16, sx: 5, sy: 10 });
    if (k > 0.55) {
      ctx.save(); ctx.scale(k, 1);
      ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 4);
      ctx.restore();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- end card (beat 7)
const EC = { x: 540, y: 930, w: 880, h: 1180 };
function endCard(ctx, t) {
  if (t < T.card) return;
  const { x, y, w, h } = EC;
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  const slide = 1 - ease.out(prog(t, T.card, T.card + 0.2));
  ctx.save(); ctx.translate(0, slide * 900);
  const open = seg(t, T.card + 0.15, T.card + 0.45, ease.inOut);
  const th = (1 - open) * Math.PI;
  const k = Math.cos(th);
  const content = (g) => {
    // emblem: icon motif (gold heart, raspberry ribbon, four-petal flower) in folded paper
    const eu = rise(t, T.card + 0.4, 0.3);
    if (eu > 0.03) {
      g.save(); g.translate(x, 600); g.scale(eu, eu); g.translate(-x, -600);
      heart(g, x, 590, 92);
      ribbon(g, [x - 150, 640], [x + 150, 560], 30, P.rasp);
      star4(g, x, 455, 40, P.rasp, P.raspDark);
      g.restore();
    }
    const line = (s, yy, t0, px) => {
      const v = rise(t, t0, 0.24);
      if (v <= 0.03) return;
      g.save(); g.translate(0, yy - px * 0.7); g.scale(1, Math.min(1, v)); g.translate(0, -(yy - px * 0.7));
      g.fillStyle = P.ink; g.font = F.serif(px); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillText(s, x, yy);
      g.restore();
    };
    line('Plan My', 860, T.title, 150);
    line('Wedding', 1000, T.title + 0.12, 150);
    const su = seg(t, T.sub, T.sub + 0.25, ease.out);
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(36); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Venues · Vendors · Budget · Guests', x, 1080); g.globalAlpha = 1; }
  };
  // left half (always facing us)
  facets(ctx, [{ pts: [[l, tp], [x, tp], [x, bt], [l, bt]], c: P.cream, tone: 0.16 }], { blur: 30, sx: 10, sy: 18 });
  if (k >= 0) {
    ctx.save(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.001), 1); ctx.translate(-x, 0);
    facets(ctx, [{ pts: [[x, tp], [r, tp], [r, bt], [x, bt]], c: P.cream, tone: 0.02 }], { blur: 30, sx: 10, sy: 18 });
    ctx.restore();
    // content split across the crease: right half compressed with the fold
    ctx.save(); ctx.beginPath(); ctx.rect(l, tp, w / 2, h); ctx.clip(); content(ctx); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(x, tp, (w / 2) * k, h); ctx.clip(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.001), 1); ctx.translate(-x, 0); content(ctx); ctx.restore();
    ctx.strokeStyle = 'rgba(255,250,242,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, tp + 4); ctx.lineTo(x, bt - 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(74,30,38,0.10)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 3, tp + 4); ctx.lineTo(x + 3, bt - 4); ctx.stroke();
  } else {
    facets(ctx, [{ pts: [[x, tp], [x + (r - x) * k, tp], [x + (r - x) * k, bt], [x, bt]], c: P.blush, tone: 0.1 + 0.2 * k }], { blur: 18, sx: 6, sy: 12 });
  }
  // CTA: folded raspberry ribbon banner with the verified app icon
  const bu = rise(t, T.banner, 0.3);
  if (bu > 0.03) {
    const by = 1240, bw = 760 * Math.min(1, bu), bh = 132;
    ctx.save(); ctx.translate(x, by);
    const tails = (s) => ({ pts: [[s * (bw / 2 - 30), -bh / 2 + 26], [s * (bw / 2 + 50), -bh / 2 + 26], [s * (bw / 2 + 26), 12], [s * (bw / 2 + 50), bh / 2 + 10], [s * (bw / 2 - 30), bh / 2 + 10]], c: P.raspDark, tone: 0 });
    facets(ctx, [tails(-1), tails(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [
      { pts: [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, 0], [-bw / 2, 0]], c: P.rasp, tone: 0.18 },
      { pts: [[-bw / 2, 0], [bw / 2, 0], [bw / 2, bh / 2], [-bw / 2, bh / 2]], c: P.rasp, tone: -0.08 },
    ], { blur: 18, sx: 6, sy: 12 });
    if (bu > 0.7) {
      const ix = -bw / 2 + 30, is = 88;
      ctx.save(); ctx.beginPath(); roundRect(ctx, ix, -is / 2, is, is, 20); ctx.clip(); ctx.drawImage(icon, ix, -is / 2, is, is); ctx.restore();
      ctx.strokeStyle = P.cream; ctx.lineWidth = 3; roundRect(ctx, ix, -is / 2, is, is, 20); ctx.stroke();
      ctx.fillStyle = P.cream; ctx.font = F.sansB(46); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Explore on Google Play', 52, 2);
    }
    ctx.restore();
  }
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// ---------------------------------------------------------------- frame
export function drawFrame(ctx, tReal) {
  const t = stepT(tReal); // whole picture advances on the 12 fps stop-motion grid
  const c = cam(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = P.blush; ctx.fillRect(0, 0, W, H);
  // wall: parallax layer (moves less than the stage)
  const zw = 1 + (c.z - 1) * 0.4;
  ctx.setTransform(zw, 0, 0, zw, 540 - (540 + (c.x - 540) * 0.4) * zw, 960 - (960 + (c.y - 960) * 0.4) * zw);
  wall(ctx);
  // stage
  ctx.setTransform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  floor(ctx);
  riser(ctx, t);
  guests(ctx, t);
  pennants(ctx, t);
  arch(ctx, t);
  const cs = craneState(t);
  if (cs && cs.sp === 'world' && t > T.cam5 - 0.1 && t < T.card) drawCrane(ctx, cs, t);
  checklist(ctx, t);
  vendors(ctx, t);
  invites(ctx, t);
  couple(ctx, t);
  if (cs && cs.sp === 'world' && t <= T.cam5 - 0.1) drawCrane(ctx, cs, t);
  invitation(ctx, t);
  // screen space
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  endCard(ctx, t);
  if (cs && cs.sp === 'world' && t >= T.card) { ctx.setTransform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z); drawCrane(ctx, cs, t); ctx.setTransform(1, 0, 0, 1, 0, 0); }
  if (cs && cs.sp === 'screen') drawCrane(ctx, cs, t);
  captions(ctx, t);
  // paper grain over everything
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.55;
  ctx.drawImage(grain, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
function drawCrane(ctx, cs, t) {
  const j = jit(t, 7, 1.5);
  ctx.save();
  ctx.translate(cs.x + j.x, cs.y + j.y);
  if (cs.rot) ctx.rotate(cs.rot);
  crane(ctx, 0, 0, cs.s, cs.m, cs.phi, cs.dir, cs.sp === 'screen' ? { blur: 30, shx: 18, shy: 30 } : {});
  ctx.restore();
}
