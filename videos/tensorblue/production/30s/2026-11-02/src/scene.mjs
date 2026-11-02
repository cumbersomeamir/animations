// Tensorblue 30s production 01 — "Why websites keep copies close to you"
// One continuous notebook scene: a sketched globe; original server -> two edge
// caches -> users; a stale copy is served, then refreshed by an expiry rule.
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, setFrame, RNG, hash, n1, clamp, lerp, ease, easeOut, easeIn, ev, back,
  resample, rectPts, circlePts, ellipsePts, quadPts, polyLen, pointAt, subPath, transformPts,
  ink, planDash, paint, hatchLines, stippleDots, lightDens, hand, handW, asterisk, heroDot, check,
  makePaper, makeGrainTile, HAND,
} from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
// start time of the n-th occurrence of `word` in line `id`
function VW(id, word, n = 1) {
  const l = LINE[id]; let k = 0;
  for (const w of l.words) if (w.w.toLowerCase().replace(/[^a-z0-9]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---------------------------------------------------------------------------
// World layout (world == screen at the default camera)
const G = { x: 540, y: 1045, r: 405 };
const O = { x: 385, y: 860 };              // original server (tower centre)
const A = { x: 222, y: 905 };              // a user near the origin (hook only)
const E1 = { x: 748, y: 1060 };            // edge cache, right
const E2 = { x: 290, y: 1150 };            // edge cache, left
const B = { x: 690, y: 1345 };             // "you" — near E1, far from origin
const Cu = { x: 440, y: 1365 };            // another user near E2
const CLOCK = { x: 860, y: 722, r: 48 };
const SHELF_Y = 655;                        // origin shelf (cards' top)

// ---------------------------------------------------------------------------
// Cues (seconds) — derived from narration words
const T = {};
T.cardsIn = 0.0;
T.same = VW('L1', 'same');
T.faster = VW('L1', 'faster');
T.city = VW('L1', 'city');
T.another = VW('L1', 'another');
T.l1end = VL('L1').t1;
T.eraseCards = T.l1end - 0.05;
T.reason = VW('L2', 'reason');
T.distance = VW('L2', 'distance');
T.cdn = VW('L3', 'content');
T.network = VW('L3', 'network');
T.copies = VW('L3', 'copies');
T.selected = VW('L3', 'selected');
T.images = VW('L3', 'images');
T.scripts = VW('L3', 'scripts');
T.closer = VW('L3', 'closer');
T.l3end = VL('L3').t1;
T.request = VW('L4', 'request');
T.nearby = VW('L4', 'nearby');
T.instead = VW('L4', 'instead');
T.distant = VW('L4', 'distant');
T.l4end = VL('L4').t1;
T.notEv = VW('L5', 'not');
T.cached = VW('L5', 'cached');
T.forever = VW('L5', 'forever');
T.l5end = VL('L5').t1;
T.changes = VW('L6', 'changes');
T.those = VW('L6', 'those');
T.rules = VW('L6', 'rules');
T.updating = VW('L6', 'updating');
T.l6end = VL('L6').t1;
T.faster2 = VW('L7', 'faster');
T.keeping = VW('L7', 'keeping');
T.correct = VW('L7', 'correct');
T.l7end = VL('L7').t1;

// derived story beats
T.shelfIn = T.cdn + 0.05;                  // origin's files appear
T.edgesIn = T.network - 0.15;              // edge caches drawn
T.planCopy = T.copies - 0.05;              // red-pencil plan of the copy routes
T.pick = T.selected + 0.05;                // image + script picked (page stays)
T.copyGo = T.selected + 0.55;              // copies travel
T.copyDur = 0.95;
T.copyLand = T.copyGo + T.copyDur;
T.clockIn = T.copyLand - 0.25;
T.usersIn = T.closer - 0.25;
T.longPlan = T.request + 0.15;             // the long way, as a plan
T.strike = T.nearby - 0.3;                 // strike the long way out
T.hop = T.nearby + 0.05;                   // hero hops to the nearby copy
T.hopDur = 0.55;
T.cHop = T.hop + 0.4;
T.t0905 = T.notEv - 0.05;                  // clock 09:00 -> 09:05
T.originUpd = T.notEv + 0.15;              // origin image changes to v2
T.staleReq = T.cached - 0.15;              // B asks again, gets the old copy
T.t0910 = T.changes - 0.25;                // clock -> 09:10, rule expires
T.reqExp = T.changes - 0.35;               // a request arrives after expiry
T.eraseE1 = T.changes + 0.2;
T.fetch = T.those - 0.2;                   // edge asks origin again
T.fetchDur = 0.5;
T.newCopy = T.fetch + T.fetchDur * 2 + 0.05;
T.backToB = T.updating + 0.1;
T.e2Refresh = T.l6end + 0.15;
T.checks = T.keeping;
T.chime = T.l7end + 0.1;
T.sign = 28.75;

// ---------------------------------------------------------------------------
// Camera keyframes [t, cx, cy, z]
const CAM = [
  [0.0, 540, 990, 1.0],
  [T.request - 0.2, 546, 1000, 1.012],
  [T.l4end - 0.1, 566, 1035, 1.06],
  [T.notEv + 0.55, 680, 1000, 1.28],
  [T.fetch + 0.35, 680, 1000, 1.28],
  [T.newCopy + 0.1, 778, 1012, 1.95],
  [T.backToB - 0.05, 778, 1012, 1.95],
  [T.l6end + 0.4, 540, 990, 1.0],
  [28.6, 552, 1010, 1.045],   // slow push-in through the takeaway hold
  [30.0, 546, 1000, 1.03],    // settle for the signature
];
function camAt(t) {
  if (t <= CAM[0][0]) return { cx: CAM[0][1], cy: CAM[0][2], z: CAM[0][3] };
  for (let i = 1; i < CAM.length; i++) {
    if (t <= CAM[i][0]) {
      const [t0, x0, y0, z0] = CAM[i - 1], [t1, x1, y1, z1] = CAM[i];
      const k = ease((t - t0) / (t1 - t0 || 1));
      // interpolate zoom in log space for an even push-in
      return { cx: lerp(x0, x1, k), cy: lerp(y0, y1, k), z: Math.exp(lerp(Math.log(z0), Math.log(z1), k)) };
    }
  }
  const l = CAM[CAM.length - 1]; return { cx: l[1], cy: l[2], z: l[3] };
}
export const SY = 990; // screen anchor for camera centre
export const WORLD_TOP = 472; // screen y where world drawing may start (hard limit)
export const FADE_TOP = 476, FADE_BOTTOM = 516; // world content fades into the paper here
function applyCam(ctx, cam) { ctx.translate(540, SY); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy); }
export function worldToScreen(cam, x, y) { return [540 + (x - cam.cx) * cam.z, SY + (y - cam.cy) * cam.z]; }

// ---------------------------------------------------------------------------
// Routes (flight arcs bulging away from the globe centre)
function arc(a, b, bulge = 0.22) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  let nx = mx - G.x, ny = my - G.y; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
  const L = Math.hypot(b.x - a.x, b.y - a.y);
  return quadPts([a.x, a.y], [mx + nx * L * bulge, my + ny * L * bulge], [b.x, b.y], 40);
}
const P = {
  OA: arc({ x: O.x - 52, y: O.y + 40 }, { x: A.x + 26, y: A.y - 40 }, 0.35),
  OB: arc({ x: O.x + 40, y: O.y + 72 }, { x: B.x - 6, y: B.y - 48 }, 0.16),
  OE1: arc({ x: O.x + 58, y: O.y - 30 }, { x: E1.x - 18, y: E1.y - 160 }, 0.22),
  OE2: arc({ x: O.x - 40, y: O.y + 72 }, { x: E2.x - 10, y: E2.y - 165 }, 0.3),
  BE1: arc({ x: B.x + 10, y: B.y - 48 }, { x: E1.x + 2, y: E1.y + 58 }, 0.2),
  BO: arc({ x: B.x - 16, y: B.y - 48 }, { x: O.x + 40, y: O.y + 74 }, 0.28),
  CE2: arc({ x: Cu.x - 14, y: Cu.y - 46 }, { x: E2.x + 10, y: E2.y + 58 }, 0.2),
  E1O: arc({ x: E1.x - 46, y: E1.y - 50 }, { x: O.x + 58, y: O.y + 10 }, 0.14),
};

// ---------------------------------------------------------------------------
// Static, cached layers (rendered at 2x world scale, one per boil phase)
const paper = makePaper();
// a strip of the same paper that fades out downward: drawn over the world so
// anything sliding up toward the caption zone dissolves into the page
const paperFade = (() => {
  const cv = createCanvas(W, FADE_BOTTOM + 2); const g = cv.getContext('2d');
  g.drawImage(paper, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createLinearGradient(0, FADE_TOP, 0, FADE_BOTTOM);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, FADE_BOTTOM + 2);
  return cv;
})();
const grain = [makeGrainTile(256, 'g0'), makeGrainTile(256, 'g1'), makeGrainTile(256, 'g2'), makeGrainTile(256, 'g3')];
const GLOBE_BOX = [110, 610, 990, 1530];
const GSCALE = 2;
const globeCache = new Map();
function globeLayer(phase) {
  if (globeCache.has(phase)) return globeCache.get(phase);
  const [x0, y0, x1, y1] = GLOBE_BOX;
  const cv = createCanvas((x1 - x0) * GSCALE, (y1 - y0) * GSCALE); const g = cv.getContext('2d');
  g.scale(GSCALE, GSCALE); g.translate(-x0, -y0);
  const keep = S.boil; S.boil = phase;
  drawGlobe(g);
  S.boil = keep;
  globeCache.set(phase, cv); return cv;
}
function blob(cx, cy, r, key, n = 90) {
  const seed = hash(key); const p = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.32 * n1(seed, Math.cos(a) * 1.6 + 5) + 0.18 * n1(seed + 3, Math.sin(a) * 3.1 + 9) + 0.08 * n1(seed + 7, a * 4);
    p.push([cx + Math.cos(a) * r * k * 1.12, cy + Math.sin(a) * r * k * 0.92]);
  }
  return p;
}
const LANDS = [
  blob(345, 880, 165, 'land-nw'),
  blob(780, 1050, 135, 'land-e'),
  blob(565, 1345, 175, 'land-s'),
  blob(275, 1170, 100, 'land-w'),
  blob(640, 830, 50, 'land-isle'),
];
function drawGlobe(g) {
  // cast shadow on the paper
  const sh = ellipsePts(G.x + 40, G.y + G.r + 18, G.r * 0.78, 26, 60);
  paint(g, sh, { fill: null, key: 'gshadow', outline: false, tex: [{ kind: 'hatch', angle: -0.35, gap: 6, w: 1.4, color: C.ink, alpha: 0.32, dens: (x) => clamp(0.85 - Math.abs(x - G.x - 40) / (G.r * 0.9)) }] });
  const disc = circlePts(G.x, G.y, G.r, 120);
  // ocean: pale sky pencil, darker toward the bottom-right
  paint(g, disc, {
    fill: '#e3e9e2', key: 'ocean', outline: false,
    tex: [
      { kind: 'pencil', angle: -0.62, color: C.sky, alpha: 0.75, dens: (x, y) => clamp(0.55 + ((x - G.x) + (y - G.y)) / (G.r * 3.2)) },
      { kind: 'hatch', angle: 0.75, gap: 8, w: 1.2, color: C.ink, alpha: 0.42, dens: (x, y) => clamp(((x - G.x) + (y - G.y)) / (G.r * 1.25) - 0.35) },
    ],
  });
  // land, clipped to the disc
  g.save();
  g.beginPath(); g.arc(G.x, G.y, G.r - 2, 0, Math.PI * 2); g.clip();
  LANDS.forEach((p, i) => {
    paint(g, p, {
      fill: '#dfe3c4', key: 'land' + i, w: 2.4, amt: 1.0,
      tex: [
        { kind: 'pencil', angle: -0.9, color: C.green, alpha: 0.55, dens: () => 0.75 },
        { kind: 'hatch', angle: -0.75, gap: 7, w: 1.25, color: '#2f4a2c', alpha: 0.5, dens: (x, y) => clamp(((x - G.x) + (y - G.y)) / (G.r * 1.4) + 0.05) },
        { kind: 'stipple', color: '#2f4a2c', step: 9, r: 1.1, alpha: 0.4, dens: (x, y) => clamp(((x - G.x) + (y - G.y)) / (G.r * 1.6)) },
      ],
    });
  });
  // graticule
  for (const la of [-0.95, -0.45, 0.05, 0.55]) {
    const yy = G.y + G.r * Math.sin(la), rx = G.r * Math.cos(la);
    ink(g, ellipsePts(G.x, yy, rx, rx * 0.16, 60, 0, Math.PI), { w: 1.3, alpha: 0.42, key: 'lat' + la, double: false, amt: 0.8 });
  }
  for (const lo of [-1.05, -0.45, 0.2, 0.85]) {
    const rx = Math.abs(G.r * Math.sin(lo));
    const a0 = lo < 0 ? Math.PI / 2 : -Math.PI / 2;
    ink(g, ellipsePts(G.x, G.y, rx, G.r, 60, a0, Math.PI), { w: 1.3, alpha: 0.42, key: 'lon' + lo, double: false, amt: 0.8 });
  }
  g.restore();
  // terminator: crosshatch crescent bottom-right
  g.save(); g.beginPath(); g.arc(G.x, G.y, G.r, 0, Math.PI * 2); g.clip();
  hatchLines(g, [G.x - G.r, G.y - G.r, G.x + G.r, G.y + G.r], { angle: -0.78, gap: 7, w: 1.3, alpha: 0.5, key: 'term1', dens: (x, y) => clamp((Math.hypot(x - (G.x - G.r * 0.35), y - (G.y - G.r * 0.35)) - G.r * 0.95) / (G.r * 0.45)) });
  hatchLines(g, [G.x - G.r, G.y - G.r, G.x + G.r, G.y + G.r], { angle: 0.79, gap: 8, w: 1.2, alpha: 0.42, key: 'term2', dens: (x, y) => clamp((Math.hypot(x - (G.x - G.r * 0.35), y - (G.y - G.r * 0.35)) - G.r * 1.15) / (G.r * 0.35)) });
  g.restore();
  // highlight glint top-left
  ink(g, circlePts(G.x - G.r * 0.48, G.y - G.r * 0.5, G.r * 0.22, 30, Math.PI * 1.05, Math.PI * 0.55), { w: 4, color: '#fbf6ea', alpha: 0.8, key: 'glint', double: false });
  // outline
  ink(g, disc, { w: 4.2, key: 'globe-outline', amt: 1.4 });
}

// ---------------------------------------------------------------------------
// Props
function tag(ctx, text, x, y, o = {}) {
  const { size = 34, frac = 1, alpha = 1, key = 'tag' + text, rot = -0.02, pin = null } = o;
  if (frac <= 0) return;
  const w = handW(ctx, text, size) + 22, h = size + 12;
  const sa = S.alpha; S.alpha = sa * alpha * clamp(frac * 3);
  const box = transformPts(rectPts(x - w / 2, y - h / 2, w, h), 0, 0, 1, rot, x, y);
  if (pin) ink(ctx, [[pin[0], pin[1]], [x, y + (pin[1] > y ? h / 2 : -h / 2)]], { w: 1.6, key: key + 'pin', double: false, alpha: 0.8 });
  paint(ctx, box, { fill: '#fbf5e6', key, w: 2, amt: 0.7, tex: [{ kind: 'hatch', angle: -0.8, gap: 6, w: 1, alpha: 0.18, base: 0, k: 0.7 }] });
  S.alpha = sa;
  hand(ctx, text, x, y + size * 0.34, { size, rot, frac, alpha, key });
}
function serverTower(ctx, x, y, w, h, o = {}) {
  const { frac = 1, key = 'srv', fill = C.wood, t = 0, leds = 3, alpha = 1 } = o;
  if (frac <= 0) return;
  const pts = rectPts(x - w / 2, y - h / 2, w, h);
  const sa = S.alpha; S.alpha = sa * alpha;
  if (frac >= 0.999) {
    paint(ctx, pts, { fill, key, w: 3.2, tex: [{ kind: 'pencil', angle: -0.9, color: '#b97f3f', alpha: 0.5, dens: () => 0.6 }, { kind: 'hatch', angle: -0.78, gap: 6, w: 1.3, alpha: 0.55, base: 0.15, k: 0.9 }] });
  } else {
    ink(ctx, pts, { w: 3.2, key: key + 'o', frac });
  }
  const slot = h / (leds + 1);
  for (let i = 0; i < leds; i++) {
    const yy = y - h / 2 + slot * (i + 0.75);
    ink(ctx, [[x - w / 2 + 8, yy + slot * 0.42], [x + w / 2 - 8, yy + slot * 0.42]], { w: 2, key: key + 'slot' + i, frac: clamp(frac * 1.5 - 0.4), double: false });
    if (frac >= 0.999) {
      const on = Math.floor(t * 3.1 + i * 1.7 + hash(key) % 5) % 3 !== 0;
      ctx.save(); ctx.globalAlpha = S.alpha * (on ? 1 : 0.35); ctx.fillStyle = on ? '#5de37a' : '#3f6b3c';
      ctx.beginPath(); ctx.arc(x + w / 2 - 14, yy + slot * 0.1, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
      ink(ctx, [[x - w / 2 + 9, yy + slot * 0.1], [x - w / 2 + 9 + w * 0.35, yy + slot * 0.1]], { w: 1.6, key: key + 'vent' + i, double: false, alpha: 0.7 });
    }
  }
  S.alpha = sa;
}
// picture on a file card: hills + sun (v1) or hills + moon & stars (v2)
function picture(ctx, x, y, w, h, kind, o = {}) {
  const { frac = 1, key = 'pic' } = o;
  if (frac <= 0) return;
  const hills = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24; hills.push([x + u * w, y + h * (0.72 - 0.16 * Math.sin(u * Math.PI * 1.6 + 0.4))]); }
  const hillShape = [...hills, [x + w, y + h], [x, y + h]];
  if (frac >= 0.999) paint(ctx, hillShape, { fill: '#cfe0b8', key: key + 'hill', w: 1.8, amt: 0.6, tex: [{ kind: 'pencil', angle: -0.9, color: C.green, alpha: 0.6, dens: () => 0.8 }, { kind: 'hatch', angle: -0.7, gap: 5, w: 1, alpha: 0.4, base: 0.1, k: 0.8 }] });
  else ink(ctx, hills, { w: 1.8, key: key + 'hl', frac });
  const sx = x + w * 0.68, sy = y + h * 0.32, r = Math.min(w, h) * 0.16;
  const f2 = clamp(frac * 1.6 - 0.5);
  if (kind === 'sun') {
    if (f2 > 0.98) paint(ctx, circlePts(sx, sy, r, 24), { fill: C.yellow, key: key + 'sun', w: 1.8, amt: 0.5, tex: [{ kind: 'hatch', angle: -0.7, gap: 4, w: 0.9, alpha: 0.35, base: 0, k: 1 }] });
    else ink(ctx, circlePts(sx, sy, r, 24), { w: 1.8, key: key + 'sunl', frac: f2 });
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ink(ctx, [[sx + Math.cos(a) * r * 1.35, sy + Math.sin(a) * r * 1.35], [sx + Math.cos(a) * r * 1.85, sy + Math.sin(a) * r * 1.85]], { w: 1.6, key: key + 'ray' + i, frac: clamp(f2 * 2 - 1), double: false });
    }
  } else {
    // crescent moon + two stars on a dusk sky
    if (f2 > 0.98) {
      const sky = rectPts(x, y, w, h * 0.62);
      paint(ctx, sky, { fill: '#2b3060', key: key + 'dusk', outline: false, tex: [{ kind: 'pencil', angle: -0.6, color: C.peri, alpha: 0.55, dens: () => 0.6 }] });
      // re-draw hills over the sky so they stay in front
      paint(ctx, hillShape, { fill: '#cfe0b8', key: key + 'hill2', w: 1.8, amt: 0.6, tex: [{ kind: 'pencil', angle: -0.9, color: C.green, alpha: 0.6, dens: () => 0.8 }, { kind: 'hatch', angle: -0.7, gap: 5, w: 1, alpha: 0.4, base: 0.1, k: 0.8 }] });
    }
    const moon = [];
    for (let i = 0; i <= 20; i++) { const a = -Math.PI * 0.75 + (i / 20) * Math.PI * 1.5; moon.push([sx + Math.cos(a) * r * 1.15, sy + Math.sin(a) * r * 1.15]); }
    for (let i = 20; i >= 0; i--) { const a = -Math.PI * 0.62 + (i / 20) * Math.PI * 1.24; moon.push([sx + r * 0.55 + Math.cos(a) * r * 0.95, sy + Math.sin(a) * r * 0.95]); }
    if (f2 > 0.98) paint(ctx, moon, { fill: '#fbeec0', key: key + 'moon', w: 1.8, amt: 0.4, tex: [{ kind: 'stipple', step: 4, r: 0.8, alpha: 0.6, base: 0.1, k: 0.8 }] });
    else ink(ctx, moon, { w: 1.8, key: key + 'moonl', frac: f2 });
    const sc = f2 > 0.98 ? '#f6e7b0' : C.ink;
    const st = (cx, cy, s) => { ink(ctx, [[cx - s, cy], [cx + s, cy]], { w: 1.6, key: key + 'st' + cx, frac: clamp(f2 * 2 - 1), double: false, color: sc }); ink(ctx, [[cx, cy - s], [cx, cy + s]], { w: 1.6, key: key + 'st2' + cx, frac: clamp(f2 * 2 - 1), double: false, color: sc }); };
    st(x + w * 0.22, y + h * 0.2, r * 0.45); st(x + w * 0.4, y + h * 0.38, r * 0.3);
  }
}
// a file card. kind: 'image' | 'script' | 'page'; optional timestamp strip `label`
function fileCard(ctx, x, y, w, h, kind, o = {}) {
  const { frac = 1, key = 'card', pic = 'sun', alpha = 1, rot = 0, ghost = null, ghostA = 0, label = null, labelFrac = 1, labelAlpha = 1, ghostLabel = null } = o;
  if (frac <= 0 || alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-(x + w / 2), -(y + h / 2));
  const pts = rectPts(x, y, w, h);
  if (frac >= 0.999) paint(ctx, pts, { fill: '#fbf6ea', key, w: 2.6, amt: 0.8, tex: [{ kind: 'hatch', angle: -0.8, gap: 6, w: 1, alpha: 0.2, base: 0, k: 0.6 }] });
  else ink(ctx, pts, { w: 2.6, key: key + 'ol', frac });
  const cf = clamp(frac * 1.4 - 0.3);
  const pad = Math.max(5, w * 0.07);
  const strip = label || ghostLabel ? Math.max(24, h * 0.28) : 0;
  const ih = h - strip;
  if (kind === 'image') {
    if (ghost && ghostA > 0) { const s2 = S.alpha; S.alpha = s2 * ghostA; picture(ctx, x + pad, y + pad, w - pad * 2, ih - pad * 2, ghost, { key: key + 'gh' }); S.alpha = s2; }
    picture(ctx, x + pad, y + pad, w - pad * 2, ih - pad * 2, pic, { frac: cf, key: key + 'p' });
    ink(ctx, rectPts(x + pad, y + pad, w - pad * 2, ih - pad * 2), { w: 1.5, key: key + 'frame', frac: cf, double: false, alpha: 0.85 });
  } else if (kind === 'script') {
    hand(ctx, '{ }', x + w / 2, y + ih * 0.5, { size: ih * 0.44, frac: cf, key: key + 'br' });
    for (let i = 0; i < 2; i++) ink(ctx, [[x + pad + i * 6, y + ih * (0.68 + i * 0.14)], [x + w - pad - (1 - i) * 12, y + ih * (0.68 + i * 0.14)]], { w: 1.7, key: key + 'ln' + i, frac: clamp(cf * 2 - 1), double: false, alpha: 0.85 });
  } else {
    hand(ctx, '</>', x + w / 2, y + ih * 0.44, { size: ih * 0.38, frac: cf, key: key + 'tg' });
    for (let i = 0; i < 3; i++) ink(ctx, [[x + pad, y + ih * (0.6 + i * 0.12)], [x + w - pad - (i % 2) * 14, y + ih * (0.6 + i * 0.12)]], { w: 1.6, key: key + 'ln' + i, frac: clamp(cf * 2 - 1), double: false, alpha: 0.85 });
  }
  if (strip) {
    ink(ctx, [[x + 3, y + ih], [x + w - 3, y + ih]], { w: 1.6, key: key + 'strip', frac: cf, double: false, alpha: 0.8 });
    const size = Math.min(strip * 0.88, w * 0.235);
    if (ghostLabel) hand(ctx, ghostLabel, x + w / 2, y + ih + strip * 0.74, { size, key: key + 'gl' + ghostLabel, alpha: GHOST });
    if (label) hand(ctx, label, x + w / 2, y + ih + strip * 0.74, { size, key: key + 'lab' + label, frac: labelFrac * cf, alpha: labelAlpha });
  }
  ctx.restore();
  S.alpha = sa;
}
function person(ctx, x, y, o = {}) {
  const { frac = 1, key = 'person', s = 1.25, shirt = C.sky } = o;
  if (frac <= 0) return;
  const pop = back(clamp(frac * 1.3));
  ctx.save(); ctx.translate(x, y); ctx.scale(pop * s, pop * s); ctx.translate(-x, -y);
  const body = [];
  for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; body.push([x + Math.cos(a) * 26, y + 18 + Math.sin(a) * 24]); }
  body.push([x + 26, y + 22], [x - 26, y + 22], [x - 26, y + 18]);
  paint(ctx, body, { fill: shirt, key: key + 'b', w: 2.6, tex: [{ kind: 'pencil', angle: -0.8, color: '#5f8fa6', alpha: 0.5, dens: () => 0.7 }, { kind: 'hatch', angle: -0.75, gap: 5, w: 1.1, alpha: 0.45, base: 0.1, k: 1 }] });
  paint(ctx, circlePts(x, y - 16, 14, 24), { fill: '#f1c9a5', key: key + 'h', w: 2.6, tex: [{ kind: 'hatch', angle: -0.75, gap: 4.5, w: 1, alpha: 0.4, base: 0, k: 1 }] });
  ctx.restore();
}
function phone(ctx, x, y, pic, o = {}) {
  const { frac = 1, key = 'phone', ghost = null, ghostA = 0, loading = 0 } = o;
  if (frac <= 0) return;
  const w = 80, h = 112;
  const pop = back(clamp(frac * 1.4));
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.rotate(0.05); ctx.translate(-x, -y);
  paint(ctx, rectPts(x - w / 2, y - h / 2, w, h), { fill: '#3b3a4a', key: key + 'b', w: 2.6, tex: [{ kind: 'hatch', angle: -0.8, gap: 4, w: 1, color: '#000', alpha: 0.35, base: 0.1, k: 0.9 }] });
  const sx = x - w / 2 + 6, sy = y - h / 2 + 10, sw = w - 12, sh = h - 22;
  paint(ctx, rectPts(sx, sy, sw, sh), { fill: '#fbf6ea', key: key + 's', w: 1.4, amt: 0.4, tex: [] });
  if (ghost && ghostA > 0) { const s2 = S.alpha; S.alpha = s2 * ghostA; picture(ctx, sx + 3, sy + 8, sw - 6, sh - 14, ghost, { key: key + 'gh' }); S.alpha = s2; }
  if (pic) picture(ctx, sx + 3, sy + 8, sw - 6, sh - 14, pic, { key: key + 'p' + pic });
  if (loading > 0) { // a pencil spinner
    const a0 = loading * 7;
    ink(ctx, circlePts(x, y - 2, 16, 20, a0, Math.PI * 1.3), { w: 2.8, key: key + 'spin', double: false });
  }
  ctx.restore();
}
function eraser(ctx, x, y, rot = -0.4) {
  const w = 74, h = 36;
  const pts = transformPts(rectPts(x - w / 2, y - h / 2, w, h), 0, 0, 1, rot, x, y);
  paint(ctx, pts, { fill: '#e8a7a1', key: 'eraser', w: 2.8, tex: [{ kind: 'pencil', angle: 0.3, color: C.rose, alpha: 0.6, dens: () => 0.7 }, { kind: 'hatch', angle: -0.7, gap: 5, w: 1.2, alpha: 0.4, base: 0.1, k: 0.9 }] });
  const sl = transformPts([[x - w / 2 + 22, y - h / 2], [x - w / 2 + 22, y + h / 2]], 0, 0, 1, rot, x, y);
  ink(ctx, sl, { w: 2, key: 'eraser-band', double: false });
}
// rubbing motion over a box during [t0, t0+d]; returns erased fraction
function rub(ctx, t, t0, d, box) {
  const k = ev(t, t0, d);
  if (k <= 0 || k >= 1) return k;
  const [x0, y0, x1, y1] = box;
  const ph = (t - t0) * 22;
  const ex = lerp(x0, x1, 0.5 + 0.42 * Math.sin(ph)), ey = lerp(y0, y1, 0.3 + 0.5 * k) + 6 * Math.cos(ph * 0.5);
  eraser(ctx, ex, ey - 8, -0.45 + 0.1 * Math.sin(ph));
  return k;
}
function crumbs(ctx, t, t0, box, key) {
  const k = ev(t, t0, 0.9);
  if (k <= 0 || k >= 1) return;
  const r = RNG(key); const [x0, , x1, y1] = box;
  for (let i = 0; i < 7; i++) {
    const x = lerp(x0, x1, r()), y = y1 + 4 + r() * 14 + easeIn(k) * 30;
    ink(ctx, [[x, y], [x + 5 + r() * 4, y + 2], [x + 3, y + 5]], { w: 1.4, color: '#a07f70', alpha: (1 - k) * 0.9, key: key + i, double: false });
  }
}
// erase-residue alpha: 1 before t0 -> ghost after erase
const GHOST = 0.13;
function erased(t, t0, d) { return 1 - (1 - GHOST) * ease(ev(t, t0, d)); }
function drawPencil(ctx, x, y, ang = -2.3, color = C.yellow) {
  // pencil whose graphite tip touches (x, y)
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const len = 150, wd = 18;
  paint(ctx, [[0, 0], [26, -wd / 2], [26, wd / 2], [0, 0]], { fill: '#e7c79a', key: 'pcone', w: 2, amt: 0.4, tex: [{ kind: 'hatch', angle: 0.3, gap: 4, w: 1, alpha: 0.4, base: 0.2, k: 0.6 }] });
  paint(ctx, [[0, 0], [8, -wd * 0.16], [8, wd * 0.16], [0, 0]], { fill: color === C.yellow ? '#3a3a3a' : C.red, key: 'ptip', w: 1.6, amt: 0.2 });
  paint(ctx, rectPts(26, -wd / 2, len, wd), { fill: color, key: 'pbody', w: 2.4, amt: 0.5, tex: [{ kind: 'hatch', angle: 0.1, gap: 5, w: 1.1, alpha: 0.45, dens: (xx, yy) => clamp((yy + wd / 2) / wd * 0.9) }] });
  ink(ctx, [[26, -wd * 0.12], [26 + len, -wd * 0.12]], { w: 1.2, key: 'pfacet', double: false, alpha: 0.6 });
  paint(ctx, rectPts(26 + len, -wd / 2, 16, wd), { fill: '#c9c4bb', key: 'pferr', w: 2, amt: 0.4, tex: [{ kind: 'hatch', angle: 1.57, gap: 4, w: 1, alpha: 0.5, dens: () => 0.8 }] });
  paint(ctx, rectPts(42 + len, -wd / 2, 18, wd), { fill: '#e8a7a1', key: 'prub', w: 2, amt: 0.4 });
  ctx.restore();
}
function clock(ctx, t, label, minutes, o = {}) {
  const { frac = 1 } = o;
  if (frac <= 0) return;
  const { x, y, r } = CLOCK;
  const pop = back(clamp(frac * 1.2));
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.translate(-x, -y);
  paint(ctx, circlePts(x, y, r, 40), { fill: '#fbf6ea', key: 'clock', w: 3.2, tex: [{ kind: 'hatch', angle: -0.78, gap: 6, w: 1.1, alpha: 0.4, base: -0.2, k: 1.1 }] });
  ink(ctx, circlePts(x, y, r + 6, 40), { w: 2, key: 'clock-rim', double: false, alpha: 0.7 });
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ink(ctx, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], { w: i % 3 === 0 ? 2.6 : 1.4, key: 'tick' + i, double: false }); }
  const hrA = -Math.PI / 2 + ((9 + minutes / 60) / 12) * Math.PI * 2;
  const mnA = -Math.PI / 2 + (minutes / 60) * Math.PI * 2;
  ink(ctx, [[x, y], [x + Math.cos(hrA) * r * 0.48, y + Math.sin(hrA) * r * 0.48]], { w: 3.6, key: 'hr', double: false });
  ink(ctx, [[x, y], [x + Math.cos(mnA) * r * 0.72, y + Math.sin(mnA) * r * 0.72]], { w: 2.6, key: 'mn', double: false });
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  hand(ctx, label, x, y - r - 22, { size: 42, align: 'center', key: 'clock-label' + label, frac: clamp(frac * 2 - 0.6) });
}
function packet(ctx, x, y, o = {}) {
  const { card = null, key = 'pk', r = 11 } = o;
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ink(ctx, circlePts(x, y, r + 2, 18), { w: 1.6, key: key + 'r', double: false, alpha: 0.6 });
  if (card) fileCard(ctx, x + 8, y - 50, 52, 40, card.kind, { pic: card.pic, key: key + 'c' });
}
// trail of ink behind a moving packet
function trail(ctx, pts, k, key, o = {}) {
  const a = clamp(k - 0.18), b = clamp(k);
  if (b <= a) return;
  const p = subPath(pts, b); const L = polyLen(p); const startL = polyLen(pts) * a;
  // keep the tail end only
  const q = []; let acc = 0;
  for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + d >= startL) q.push(p[i]); acc += d; }
  if (q.length > 1) ink(ctx, q, { w: o.w || 3, key, double: false, alpha: 0.55, color: o.color || C.ink });
}
function travel(ctx, t, t0, dur, pts, o = {}) {
  const k = ev(t, t0, dur);
  if (t < t0 || k >= 1) return k;
  const e = ease(k);
  trail(ctx, pts, e, (o.key || 'tr') + 't', { color: o.hero ? C.hero : C.ink, w: o.hero ? 5 : 3.4 });
  const [x, y] = pointAt(pts, e);
  if (o.hero) { heroDot(ctx, x, y, 19, o.key || 'hero'); if (o.card) fileCard(ctx, x + 10, y - 56, 54, 42, o.card.kind, { pic: o.card.pic, key: (o.key || 'h') + 'cc' }); }
  else packet(ctx, x, y, { card: o.card, key: o.key });
  return k;
}
function rulerTicks(ctx, pts, frac, key, every = 34) {
  const rs = resample(pts, every); const n = Math.floor((rs.length - 1) * clamp(frac));
  for (let i = 1; i <= n; i++) {
    const [x, y] = rs[i]; const [px, py] = rs[i - 1];
    let nx = -(y - py), ny = x - px; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    ink(ctx, [[x - nx * 8, y - ny * 8], [x + nx * 8, y + ny * 8]], { w: 2, key: key + i, double: false, color: C.ink, alpha: 0.75 });
  }
}
// scribble strike-out along a path
function strikeOut(ctx, pts, frac, key) {
  const rs = resample(pts, 12); const zz = [];
  for (let i = 0; i < rs.length; i++) {
    const [x, y] = rs[i]; const [px, py] = rs[Math.max(0, i - 1)];
    let nx = -(y - py), ny = x - px; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const s = (i % 2 ? 1 : -1) * 9;
    zz.push([x + nx * s, y + ny * s]);
  }
  ink(ctx, zz, { w: 2.6, key, frac, double: false, alpha: 0.85 });
}
function browserCard(ctx, x, y, w, h, o = {}) {
  const { frac = 1, key = 'bc', fill = 0, loading = -1, done = 0, alpha = 1 } = o;
  if (frac <= 0 || alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  const pts = rectPts(x, y, w, h);
  if (frac >= 0.999) paint(ctx, pts, { fill: '#fbf6ea', key, w: 3, tex: [{ kind: 'hatch', angle: -0.8, gap: 6, w: 1, alpha: 0.2, base: 0, k: 0.6 }] });
  else ink(ctx, pts, { w: 3, key: key + 'o', frac });
  const bf = clamp(frac * 1.5 - 0.4);
  ink(ctx, [[x, y + 30], [x + w, y + 30]], { w: 2.2, key: key + 'bar', frac: bf, double: false });
  for (let i = 0; i < 3; i++) ink(ctx, circlePts(x + 18 + i * 18, y + 15, 5, 12), { w: 1.8, key: key + 'dot' + i, frac: bf, double: false });
  ink(ctx, rectPts(x + 76, y + 8, w - 96, 15), { w: 1.6, key: key + 'url', frac: bf, double: false, alpha: 0.8 });
  // page content: picture + text lines, filling as `fill` goes 0..1
  const px = x + 14, py = y + 42, pw = w * 0.46, ph = h - 56;
  if (fill > 0) {
    picture(ctx, px, py, pw, ph, 'sun', { frac: clamp(fill * 1.6), key: key + 'pic' });
    ink(ctx, rectPts(px, py, pw, ph), { w: 1.6, key: key + 'pf', frac: clamp(fill * 1.6), double: false, alpha: 0.8 });
    for (let i = 0; i < 4; i++) ink(ctx, [[x + pw + 30, py + 14 + i * 26], [x + w - 18 - (i % 2) * 30, py + 14 + i * 26]], { w: 2, key: key + 'tl' + i, frac: clamp(fill * 2 - 0.6 - i * 0.12), double: false, alpha: 0.85 });
  }
  if (loading >= 0) {
    // hatched progress bar and a spinner where the page is still missing
    const bx = x + 18, by = y + h - 30, bw = w - 36;
    ink(ctx, rectPts(bx, by, bw, 14), { w: 1.8, key: key + 'pbo', double: false });
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw * loading, 14); ctx.clip();
    hatchLines(ctx, [bx, by, bx + bw, by + 14], { angle: -0.8, gap: 5, w: 1.6, alpha: 0.85, key: key + 'pbh', dens: () => 1 });
    ctx.restore();
    const a0 = (S.boil % 4) * 1.4;
    ink(ctx, circlePts(x + w * 0.5, y + h * 0.46, 22, 20, a0, Math.PI * 1.35), { w: 3, key: key + 'spin', double: false });
  }
  if (done > 0) check(ctx, x + w - 34, y + h - 34, 1.2, { frac: done, key: key + 'chk' });
  S.alpha = sa;
}

// ---------------------------------------------------------------------------
// Captions (screen space, text ink kept inside y 350–470, margins >= 80px)
const CAPS = [
  { t0: VL('L1').t0, lines: ['Why can the same website load', 'faster in one city than another?'] },
  { t0: VL('L2').t0, lines: ['One reason is distance.'] },
  { t0: VL('L3').t0, lines: ['A content delivery network', 'keeps copies of selected files,'] },
  { t0: VW('L3', 'like'), lines: ['like images and scripts,', 'closer to users.'] },
  { t0: VL('L4').t0, lines: ['Your request can reach', 'a nearby copy,'] },
  { t0: VW('L4', 'instead'), lines: ['instead of the distant', 'original server.'] },
  { t0: VL('L5').t0, lines: ['But not everything', 'can be cached forever.'] },
  { t0: VL('L6').t0, lines: ['When content changes,'] },
  { t0: VW('L6', 'those'), lines: ['those copies need', 'rules for updating.'] },
  { t0: VL('L7').t0, lines: ['Faster delivery also means', 'keeping copies correct.'], tEnd: 28.55 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0 - 0.0; }
export const CAPTION_SIZE = 56, CAPTION_LH = 56, CAPTION_TOP = 350, CAPTION_BOTTOM = 470;
const CAPTION_PAD = 4; // keeps boil jitter and anti-aliasing inside the band
export const CAPTIONS = CAPS;
export function captionAt(t) { return CAPS.find((c) => t >= c.t0 && t < c.tEnd) || null; }
export function captionLayout(ctx, cap) {
  // returns [{text, x, baseline}] with ink bounds inside the caption box
  ctx.save(); ctx.font = `${CAPTION_SIZE}px ${HAND}`;
  const ms = cap.lines.map((s) => ctx.measureText(s));
  ctx.restore();
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent));
  const desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const n = cap.lines.length;
  const blockH = asc + (n - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, x: 540, baseline: top + asc + i * CAPTION_LH, width: ms[i].width, asc: ms[i].actualBoundingBoxAscent, desc: ms[i].actualBoundingBoxDescent }));
}
function drawCaption(ctx, t) {
  const cap = captionAt(t);
  if (!cap) return;
  const a = clamp((t - cap.t0) / 0.12) * clamp((cap.tEnd - t) / 0.12);
  const lay = captionLayout(ctx, cap);
  for (const L of lay) hand(ctx, L.text, L.x, L.baseline, { size: CAPTION_SIZE, color: C.ink, alpha: a, key: 'cap' + L.text });
}

// ---------------------------------------------------------------------------
// SFX events (consumed by the audio mixer) — all tied to on-screen events
export function sfxEvents() {
  const e = [];
  const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.02, 'paper');
  add(0.08, 'scratch', { d: 0.7 });
  add(T.faster + 0.05, 'scratch', { d: 0.45 });
  add(T.faster + 0.75, 'tick');
  add(T.eraseCards, 'erase', { d: 0.4 });
  add(T.reason - 0.05, 'scratch', { d: 0.45, red: true });
  add(T.reason + 0.25, 'swish');
  add(T.reason + 0.25 + 0.55, 'pop');
  add(T.reason + 0.25 + 1.25, 'pop', { lo: true });
  add(T.shelfIn, 'scratch', { d: 0.6 });
  add(T.edgesIn, 'scratch', { d: 0.8 });
  add(T.planCopy, 'scratch', { d: 0.4, red: true });
  add(T.pick, 'tick');
  add(T.copyGo, 'swish');
  add(T.copyLand, 'stamp');
  add(T.clockIn + 0.1, 'clock');
  add(T.usersIn, 'pop');
  add(T.request, 'pop', { hi: true });
  add(T.longPlan, 'scratch', { d: 0.55, red: true });
  add(T.strike, 'scribble', { d: 0.3 });
  add(T.hop, 'swish', { hero: true });
  add(T.hop + T.hopDur, 'pop');
  add(T.hop + T.hopDur * 2 + 0.15, 'pop', { hi: true });
  add(T.t0905, 'clock');
  add(T.originUpd, 'erase', { d: 0.35 });
  add(T.originUpd + 0.4, 'scratch', { d: 0.4 });
  add(T.staleReq, 'swish', { hero: true });
  add(T.staleReq + 0.9, 'pop', { lo: true });
  add(T.t0910, 'clock');
  add(T.eraseE1, 'erase', { d: 0.4 });
  add(T.fetch, 'swish');
  add(T.fetch + T.fetchDur, 'pop', { lo: true });
  add(T.newCopy - 0.05, 'stamp');
  add(T.rules + 0.05, 'scratch', { d: 0.35 });
  add(T.backToB + 0.55, 'pop', { hi: true });
  add(T.e2Refresh, 'swish');
  add(T.e2Refresh + 0.85, 'stamp');
  add(T.checks + 0.05, 'tick'); add(T.checks + 0.35, 'tick'); add(T.checks + 0.65, 'tick');
  add(T.chime, 'chime');
  add(T.sign, 'scratch', { d: 0.7 });
  return e;
}
export const CUES = T;

// ---------------------------------------------------------------------------
// The frame
export function drawFrame(ctx, f) {
  setFrame(f);
  S.boil = Math.floor(f / 2) % 4; // a 4-drawing boil cycle, held on 2s
  S.alpha = 1;
  const t = (Math.floor(f / 2) * 2) / FPS; // motion on 2s
  const tc = f / FPS;                      // captions on 1s
  const cam = camAt(t);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(paper, 0, 0);

  if (process.env.ONLY_PAPER) { // QA: paper + grain only, same boil phase
    ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = ctx.createPattern(grain[S.boil], 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
    return;
  }
  ctx.save();
  // the world never draws over the caption zone or the clean top of the frame
  ctx.beginPath(); ctx.rect(0, WORLD_TOP, W, H - WORLD_TOP); ctx.clip();
  applyCam(ctx, cam);
  drawGrid(ctx, cam);
  // globe (cached per boil phase)
  const gl = globeLayer(S.boil);
  ctx.drawImage(gl, GLOBE_BOX[0], GLOBE_BOX[1], GLOBE_BOX[2] - GLOBE_BOX[0], GLOBE_BOX[3] - GLOBE_BOX[1]);
  drawWorld(ctx, t);
  ctx.restore();
  ctx.drawImage(paperFade, 0, 0);

  // paper grain over everything (screen space)
  ctx.save(); ctx.globalAlpha = 0.55;
  const gt = grain[S.boil];
  const pat = ctx.createPattern(gt, 'repeat');
  ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  if (!process.env.NO_CAPTION) drawCaption(ctx, tc);
  if (!process.env.NO_CAPTION) drawSignature(ctx, t);
}

function drawGrid(ctx, cam) {
  // faint graph-paper grid of the inventor's notebook, world-anchored,
  // faded out above the caption so the top of the frame stays clean
  const step = 54;
  const wx0 = cam.cx - 540 / cam.z, wx1 = cam.cx + 540 / cam.z;
  const wyTop = cam.cy + (330 - SY) / cam.z, wy1 = cam.cy + (H - SY) / cam.z;
  ctx.save(); ctx.strokeStyle = 'rgba(96,128,160,0.15)'; ctx.lineWidth = 1.2 / cam.z;
  ctx.beginPath();
  for (let x = Math.floor(wx0 / step) * step; x <= wx1; x += step) { ctx.moveTo(x, wyTop + 60 / cam.z); ctx.lineTo(x, wy1); }
  for (let y = Math.ceil((wyTop + 60 / cam.z) / step) * step; y <= wy1; y += step) { ctx.moveTo(wx0, y); ctx.lineTo(wx1, y); }
  ctx.stroke();
  ctx.restore();
}

function drawWorld(ctx, t) {
  // ---- hook: the same page in two cities (erased to faint residue) --------
  const cardsA = 1 - (1 - 0.07) * ease(ev(t, T.eraseCards, 0.4));
  const fA = ev(t, T.cardsIn + 0.05, 0.5), fB = ev(t, T.cardsIn + 0.25, 0.5);
  const leaderA = [[230, 698], [205, 785], [A.x - 6, A.y - 52]];
  const leaderB = [[850, 698], [905, 980], [B.x + 34, B.y - 58]];
  {
    const s0 = S.alpha; S.alpha = cardsA;
    ink(ctx, leaderA, { w: 2, key: 'leadA', frac: ev(t, 0.3, 0.4), double: false, alpha: 0.75 });
    ink(ctx, leaderB, { w: 2, key: 'leadB', frac: ev(t, 0.45, 0.5), double: false, alpha: 0.75 });
    const fillA = ev(t, T.faster - 0.05, 0.75);
    const loadB = 0.08 + 0.3 * ev(t, T.faster - 0.05, T.l1end - T.faster);
    browserCard(ctx, 90, 512, 380, 186, { frac: fA, key: 'cardA', fill: fillA, done: ev(t, T.faster + 0.75, 0.3) });
    browserCard(ctx, 610, 512, 380, 186, { frac: fB, key: 'cardB', loading: fB >= 1 ? loadB : -1 });
    S.alpha = s0;
  }
  if (t >= T.eraseCards && t < T.eraseCards + 0.4) { rub(ctx, t, T.eraseCards, 0.4, [100, 520, 460, 680]); rub(ctx, t, T.eraseCards + 0.02, 0.38, [620, 520, 980, 680]); }
  crumbs(ctx, t, T.eraseCards + 0.35, [120, 600, 440, 690], 'crumb-a');
  crumbs(ctx, t, T.eraseCards + 0.35, [640, 600, 960, 690], 'crumb-b');

  // ---- origin server and its shelf of files ---------------------------------
  serverTower(ctx, O.x, O.y, 110, 140, { key: 'origin', t, frac: 1, leds: 3 });
  tag(ctx, 'original server', O.x + 150, O.y + 52, { size: 34, key: 'tag-origin', pin: [O.x + 56, O.y + 40], rot: -0.03 });

  const sf = ev(t, T.shelfIn, 0.6);
  if (sf > 0) {
    ink(ctx, [[208, SHELF_Y + 104], [586, SHELF_Y + 104]], { w: 3.2, key: 'shelf', frac: sf });
    ink(ctx, [[O.x, SHELF_Y + 106], [O.x, O.y - 70]], { w: 2.2, key: 'shelf-post', frac: sf, double: false, alpha: 0.75 });
  }
  const pickK = ev(t, T.pick, 0.35);
  fileCard(ctx, 214, SHELF_Y + 8, 106, 92, 'page', { frac: ev(t, T.shelfIn + 0.05, 0.4), key: 'o-page', rot: -0.03 });
  fileCard(ctx, 330, SHELF_Y + 8, 106, 92, 'script', { frac: ev(t, T.shelfIn + 0.15, 0.4), key: 'o-script', rot: 0.02 });
  // the origin's image: v1 (sun) until it changes, then v2 (moon) over a ghost
  const upd = T.originUpd, updDone = upd + 0.35;
  const isV2 = t >= updDone;
  fileCard(ctx, 448, SHELF_Y - 6, 132, 106, 'image', {
    frac: ev(t, T.shelfIn + 0.25, 0.4), key: 'o-image', rot: -0.015,
    pic: isV2 ? 'moon' : 'sun', alpha: 1,
    ghost: isV2 ? 'sun' : null, ghostA: GHOST,
    label: isV2 ? 'v2 · 09:05' : 'v1 · 09:00',
    labelAlpha: isV2 ? 1 : 1 - 0.87 * ev(t, upd, 0.35),
    labelFrac: isV2 ? ev(t, updDone, 0.3) : ev(t, T.shelfIn + 0.5, 0.35),
    ghostLabel: isV2 ? 'v1 · 09:00' : null,
  });
  if (t >= upd && t < updDone) rub(ctx, t, upd, 0.35, [456, SHELF_Y, 572, SHELF_Y + 92]);
  crumbs(ctx, t, upd + 0.3, [456, SHELF_Y, 572, SHELF_Y + 100], 'crumb-o');
  if (pickK > 0) {
    check(ctx, 424, SHELF_Y + 2, 0.85, { frac: pickK, key: 'pick-s' });
    check(ctx, 570, SHELF_Y - 8, 0.85, { frac: ev(t, T.pick + 0.15, 0.3), key: 'pick-i' });
  }

  // users (A near origin, B far)
  person(ctx, A.x, A.y, { frac: ev(t, 0.15, 0.4), key: 'userA', s: 1.1, shirt: C.yellow });
  person(ctx, B.x, B.y, { frac: ev(t, 0.3, 0.4), key: 'userB' });

  // ---- distance: the same trip is short to A and long to B -----------------
  const dPlan = ev(t, T.reason - 0.05, 0.45);
  const dFade = 1 - 0.85 * ev(t, T.edgesIn, 0.6);
  if (dPlan > 0 && dFade > 0.05) {
    const s0 = S.alpha; S.alpha = dFade;
    planDash(ctx, P.OA, { frac: dPlan, key: 'pOA' });
    planDash(ctx, P.OB, { frac: dPlan, key: 'pOB' });
    rulerTicks(ctx, P.OA, ev(t, T.distance - 0.1, 0.4), 'rA', 30);
    rulerTicks(ctx, P.OB, ev(t, T.distance - 0.1, 0.8), 'rB', 30);
    S.alpha = s0;
  }
  // packets leave together at the same speed: the near one lands first
  const go = T.reason + 0.25, speed = 470; // world px per second (illustrative, not a measured speed)
  const dA = polyLen(P.OA) / speed, dB = polyLen(P.OB) / speed;
  travel(ctx, t, go, dA, P.OA, { key: 'pkA', card: { kind: 'page' } });
  travel(ctx, t, go, dB, P.OB, { key: 'pkB', card: { kind: 'page' } });
  if (t > go + dA) check(ctx, A.x + 40, A.y - 58, 1, { frac: ev(t, go + dA, 0.25), key: 'chkA', alpha: dFade });
  if (t > go + dB && t < T.request) check(ctx, B.x - 50, B.y - 62, 1, { frac: ev(t, go + dB, 0.25), key: 'chkB', alpha: 1 - ev(t, T.usersIn, 0.4) });

  // ---- edge caches ---------------------------------------------------------
  const e1f = ev(t, T.edgesIn, 0.55), e2f = ev(t, T.edgesIn + 0.25, 0.55);
  serverTower(ctx, E1.x, E1.y, 82, 106, { key: 'edge1', t, frac: e1f, leds: 2, fill: '#e9cf93' });
  serverTower(ctx, E2.x, E2.y, 82, 106, { key: 'edge2', t, frac: e2f, leds: 2, fill: '#e9cf93' });
  tag(ctx, 'edge copy', E1.x - 6, E1.y + 82, { size: 32, frac: ev(t, T.edgesIn + 0.4, 0.35), key: 'tag-e1' });
  tag(ctx, 'edge copy', E2.x + 4, E2.y + 82, { size: 32, frac: ev(t, T.edgesIn + 0.6, 0.35), key: 'tag-e2' });

  // plan of the copy routes (red pencil), then the copies travel in ink
  const cp = ev(t, T.planCopy, 0.45);
  const cpFade = 1 - 0.85 * ev(t, T.copyLand + 0.3, 0.5);
  if (cp > 0 && cpFade > 0.05) { const s0 = S.alpha; S.alpha = cpFade; planDash(ctx, P.OE1, { frac: cp, key: 'pOE1' }); planDash(ctx, P.OE2, { frac: cp, key: 'pOE2' }); S.alpha = s0; }
  travel(ctx, t, T.copyGo, T.copyDur, P.OE1, { key: 'cp1', card: { kind: 'image', pic: 'sun' } });
  travel(ctx, t, T.copyGo + 0.12, T.copyDur, P.OE2, { key: 'cp2', card: { kind: 'image', pic: 'sun' } });

  // edge shelves: image copy (with timestamp) + script copy
  const e1Img = { x: E1.x - 92, y: E1.y - 168, w: 112, h: 96 };
  const e2Img = { x: E2.x - 70, y: E2.y - 168, w: 112, h: 96 };
  const land1 = ev(t, T.copyLand, 0.3), land2 = ev(t, T.copyLand + 0.12, 0.3);
  const e1New = ev(t, T.newCopy, 0.4);
  const e1Fade = erased(t, T.eraseE1, 0.4);
  fileCard(ctx, e1Img.x, e1Img.y, e1Img.w, e1Img.h, 'image', {
    frac: land1, key: 'e1-img', rot: 0.03,
    pic: e1New > 0 ? 'moon' : 'sun', alpha: e1New > 0 ? 1 : e1Fade,
    ghost: e1New > 0 ? 'sun' : null, ghostA: GHOST,
    label: e1New > 0 ? 'v2 · 09:10' : 'v1 · 09:00', labelFrac: e1New > 0 ? e1New : ev(t, T.copyLand + 0.1, 0.35),
    ghostLabel: e1New > 0 ? 'v1 · 09:00' : null,
  });
  fileCard(ctx, e1Img.x + e1Img.w + 10, e1Img.y + 16, 64, 58, 'script', { frac: ev(t, T.scripts - 0.05, 0.35), key: 'e1-scr', rot: -0.03 });
  if (t >= T.eraseE1 && t < T.eraseE1 + 0.4) rub(ctx, t, T.eraseE1, 0.4, [e1Img.x, e1Img.y, e1Img.x + e1Img.w, e1Img.y + e1Img.h]);
  crumbs(ctx, t, T.eraseE1 + 0.35, [e1Img.x, e1Img.y, e1Img.x + e1Img.w, e1Img.y + e1Img.h], 'crumb-e1');
  const e2Ref = T.e2Refresh + 0.85;
  const e2New = ev(t, e2Ref, 0.35);
  fileCard(ctx, e2Img.x, e2Img.y, e2Img.w, e2Img.h, 'image', {
    frac: land2, key: 'e2-img', rot: -0.02,
    pic: e2New > 0 ? 'moon' : 'sun', alpha: e2New > 0 ? 1 : erased(t, T.e2Refresh + 0.45, 0.35),
    ghost: e2New > 0 ? 'sun' : null, ghostA: GHOST,
    label: e2New > 0 ? 'v2 · 09:10' : 'v1 · 09:00', labelFrac: e2New > 0 ? e2New : ev(t, T.copyLand + 0.2, 0.35),
    ghostLabel: e2New > 0 ? 'v1 · 09:00' : null,
  });
  fileCard(ctx, e2Img.x + e2Img.w + 10, e2Img.y + 16, 64, 58, 'script', { frac: ev(t, T.scripts + 0.05, 0.35), key: 'e2-scr', rot: 0.03 });
  if (t >= T.e2Refresh + 0.45 && t < T.e2Refresh + 0.8) rub(ctx, t, T.e2Refresh + 0.45, 0.35, [e2Img.x, e2Img.y, e2Img.x + e2Img.w, e2Img.y + e2Img.h]);
  // the rule on each edge copy: keep 10 min (timer pie)
  drawRule(ctx, t, E1.x + 50, E1.y - 26, 'e1', e1New > 0, T.copyLand + 0.15);
  drawRule(ctx, t, E2.x + 50, E2.y - 26, 'e2', e2New > 0, T.copyLand + 0.25);

  // world clock
  const minutes = t < T.t0905 ? 0 : t < T.t0910 ? 5 * ease(ev(t, T.t0905, 0.25)) : 5 + 5 * ease(ev(t, T.t0910, 0.25));
  const clab = minutes < 4.99 ? '09:00' : minutes < 9.99 ? '09:05' : '09:10';
  clock(ctx, t, clab, minutes, { frac: ev(t, T.clockIn, 0.4) });

  // ---- users near the edges ------------------------------------------------
  person(ctx, Cu.x, Cu.y, { frac: ev(t, T.usersIn, 0.4), key: 'userC', s: 1.15, shirt: C.rose });
  const nearK = ev(t, T.usersIn + 0.15, 0.5);
  if (nearK > 0 && t < T.request + 0.2) {
    rulerTicks(ctx, P.BE1, nearK, 'rBE1', 30);
    rulerTicks(ctx, P.CE2, nearK, 'rCE2', 30);
  }

  // ---- the request: the long way is planned, struck out; the hero hops near --
  const lp = ev(t, T.longPlan, 0.5);
  const lpFade = 1 - 0.8 * ev(t, T.l4end + 0.2, 0.6);
  if (lp > 0 && t < T.l5end) {
    const s0 = S.alpha; S.alpha = lpFade;
    planDash(ctx, P.BO, { frac: lp, key: 'pBO' });
    strikeOut(ctx, subPath(P.BO, 0.9), ev(t, T.strike, 0.3), 'strikeBO');
    S.alpha = s0;
  }
  if (t >= T.request && t < T.hop) heroDot(ctx, B.x + 6, B.y - 70 - 8 * back(ev(t, T.request, 0.3)), 19, 'hero-wait');
  const sp = ev(t, T.hop - 0.1, 0.35);
  if (sp > 0) ink(ctx, P.BE1, { w: 3.2, key: 'inkBE1', frac: sp, alpha: 0.8 });
  if (sp > 0) ink(ctx, P.CE2, { w: 3.2, key: 'inkCE2', frac: ev(t, T.cHop - 0.1, 0.35), alpha: 0.8 });
  travel(ctx, t, T.hop, T.hopDur, P.BE1, { hero: true, key: 'h1' });
  travel(ctx, t, T.hop + T.hopDur + 0.1, T.hopDur, [...P.BE1].reverse(), { hero: true, key: 'h1b', card: { kind: 'image', pic: 'sun' } });
  travel(ctx, t, T.cHop, T.hopDur, P.CE2, { hero: true, key: 'h2' });
  travel(ctx, t, T.cHop + T.hopDur + 0.1, T.hopDur, [...P.CE2].reverse(), { hero: true, key: 'h2b', card: { kind: 'image', pic: 'sun' } });

  // ---- phones: what each user actually sees ----------------------------------
  const bGot = T.hop + T.hopDur * 2 + 0.1;
  const bNew = T.backToB + 0.5;
  const bPic = t < bGot ? null : t < bNew ? 'sun' : 'moon';
  phone(ctx, B.x + 92, B.y - 26, bPic, { frac: ev(t, T.request - 0.1, 0.35), key: 'phB', loading: t < bGot ? t : 0, ghost: bPic === 'moon' ? 'sun' : null, ghostA: GHOST });
  const cGot = T.cHop + T.hopDur * 2 + 0.1;
  const cNew = T.e2Refresh + 1.4;
  const cPic = t < cGot ? null : t < cNew ? 'sun' : 'moon';
  phone(ctx, Cu.x + 88, Cu.y - 26, cPic, { frac: ev(t, T.request + 0.1, 0.35), key: 'phC', loading: t < cGot ? t : 0, ghost: cPic === 'moon' ? 'sun' : null, ghostA: GHOST });

  // ---- stale: the origin changed, B still gets the old copy -----------------
  travel(ctx, t, T.staleReq, 0.42, P.BE1, { hero: true, key: 'h3' });
  travel(ctx, t, T.staleReq + 0.5, 0.42, [...P.BE1].reverse(), { hero: true, key: 'h3b', card: { kind: 'image', pic: 'sun' } });
  const mm = ev(t, T.staleReq + 0.95, 0.3);
  if (mm > 0 && t < bNew) {
    tag(ctx, 'old copy', B.x + 96, B.y - 128, { size: 32, frac: mm, key: 'oldcopy', rot: 0.04 });
  }

  // ---- the rule fires: a request after expiry -> the edge asks the origin ----
  travel(ctx, t, T.reqExp, 0.4, P.BE1, { hero: true, key: 'h4' });
  if (t >= T.reqExp + 0.4 && t < T.backToB) heroDot(ctx, E1.x - 62, E1.y + 28 - 4 * Math.sin(t * 9), 17, 'hero-wait2');
  travel(ctx, t, T.fetch, T.fetchDur, P.E1O, { key: 'f1' });
  travel(ctx, t, T.fetch + T.fetchDur + 0.05, T.fetchDur, [...P.E1O].reverse(), { key: 'f1b', card: { kind: 'image', pic: 'moon' } });
  travel(ctx, t, T.backToB, 0.5, [...P.BE1].reverse(), { hero: true, key: 'h4b', card: { kind: 'image', pic: 'moon' } });

  // ---- E2 refresh during the takeaway ---------------------------------------
  travel(ctx, t, T.e2Refresh + 0.4, 0.42, [...P.OE2], { key: 'f2', card: { kind: 'image', pic: 'moon' } });
  travel(ctx, t, T.e2Refresh + 0.95, 0.42, [...P.CE2].reverse(), { hero: true, key: 'h5b', card: { kind: 'image', pic: 'moon' } });

  // ---- takeaway: every copy matches the origin -------------------------------
  if (t >= T.checks) {
    check(ctx, 596, SHELF_Y + 70, 1.1, { frac: ev(t, T.checks, 0.25), key: 'okO' });
    check(ctx, e1Img.x - 22, e1Img.y + 44, 1.1, { frac: ev(t, T.checks + 0.3, 0.25), key: 'okE1' });
    check(ctx, e2Img.x - 22, e2Img.y + 44, 1.1, { frac: ev(t, T.checks + 0.6, 0.25), key: 'okE2' });
  }
  // idle life in the hold: requests keep taking the short paths
  if (t > T.chime + 0.2 && t < 29.4) {
    const cyc = 1.6;
    const k1 = ((t - T.chime) % cyc) / cyc, k2 = ((t - T.chime + 0.75) % cyc) / cyc;
    const p1 = k1 < 0.5 ? P.BE1 : [...P.BE1].reverse(), p2 = k2 < 0.5 ? P.CE2 : [...P.CE2].reverse();
    const [x1, y1] = pointAt(p1, ease((k1 % 0.5) * 2)); const [x2, y2] = pointAt(p2, ease((k2 % 0.5) * 2));
    heroDot(ctx, x1, y1, 14, 'idle1'); heroDot(ctx, x2, y2, 14, 'idle2');
  }
  pencilAt(ctx, t);
}

function drawRule(ctx, t, x, y, key, refreshed, tShow) {
  const f = ev(t, tShow, 0.35);
  if (f <= 0) return;
  // timer pie: fills over the 10 illustrated minutes, resets on refresh
  let fill = 0;
  if (!refreshed) {
    if (t >= T.t0905) fill = 0.5 * ease(ev(t, T.t0905, 0.25));
    if (t >= T.t0910) fill = 0.5 + 0.5 * ease(ev(t, T.t0910, 0.25));
  }
  const cx = x + 20, cy = y + 4, r = 18;
  ink(ctx, circlePts(cx, cy, r, 24), { w: 2.4, key: key + 'pie', frac: f, double: false });
  if (fill > 0) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2); ctx.closePath(); ctx.clip();
    hatchLines(ctx, [cx - r, cy - r, cx + r, cy + r], { angle: -0.8, gap: 3.5, w: 1.5, alpha: 0.9, key: key + 'pieh', dens: () => 1 });
    ctx.restore();
  }
  hand(ctx, 'keep', x + 46, y - 4, { size: 30, align: 'left', frac: f, key: key + 'keep' });
  hand(ctx, '10 min', x + 46, y + 26, { size: 30, align: 'left', frac: f, key: key + '10m' });
  if (key === 'e1' && t >= T.rules) ink(ctx, [[x + 42, y + 36], [x + 128, y + 33]], { w: 2.6, key: 'rule-ul', frac: ev(t, T.rules, 0.3), double: false });
  if (key === 'e1' && fill >= 0.999) hand(ctx, 'expired', x + 4, y + 66, { size: 30, align: 'left', key: 'expired', frac: ev(t, T.t0910 + 0.25, 0.25), rot: -0.04 });
}

function pencilAt(ctx, t) {
  // follows the tip of the long-route plan and the edge-1 rule underline
  const spans = [
    [T.reason - 0.05, 0.45, () => pointAt(P.OB, ev(t, T.reason - 0.05, 0.45)), C.red],
    [T.longPlan, 0.5, () => pointAt(P.BO, ev(t, T.longPlan, 0.5)), C.red],
  ];
  for (const [t0, d, fn, col] of spans) {
    if (t >= t0 && t < t0 + d + 0.15) { const [x, y] = fn(); drawPencil(ctx, x, y, -2.25, col === C.red ? '#c8463a' : C.yellow); }
  }
}

function drawSignature(ctx, t) {
  // subtle channel signature: written on in the caption zone at the end
  const k = ev(t, T.sign, 0.7);
  if (k <= 0) return;
  hand(ctx, 'Tensorblue', 540, 432, { size: 64, frac: k, key: 'sig' });
  const w = handW(ctx, 'Tensorblue', 64);
  if (k > 0.6) { ink(ctx, [[540 - w / 2, 448], [540 + w / 2, 444]], { w: 2.6, key: 'sig-ul', frac: ev(t, T.sign + 0.45, 0.35), double: false }); }
  if (t > T.sign + 0.65) heroDot(ctx, 540 + w / 2 + 30, 412 - 10 * back(ev(t, T.sign + 0.65, 0.3)), 12, 'sig-dot');
}
