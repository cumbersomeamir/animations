// Tensorblue 30s english-16 · episode 01 — "Your route just changed." (how a maps app reroutes before the jam)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`):
// a miniature city on the bench. Streets are a graph whose segments cost minutes; live traffic raises one
// segment (2 → 7 min, red jam); a shortest-time search from the car settles intersections in the real order
// from demo/out/route-demo.json and the route switches from the avenue (blue) to the side streets (cyan).
// Colours: the Tensorblue palette, plus the red-500 / cyan-400 / green-400 tokens that tensorblue.com's own
// stylesheet uses (checked 2026-11-15). Every cue is timed from the narration's word timings.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground,
} from './brt.mjs';
import { camera, project, drawBox, contactShadow, floor, mix3 } from './stage3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the real routing test (Dijkstra on the miniature city) ---------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/route-demo.json'), 'utf8'));
const OLD = DEMO.before.route, NEW = DEMO.after.route, ORDER = DEMO.after.settle_order;
if (OLD.join() !== 'C,A1,A2,A3,D' || NEW.join() !== 'C,B1,B2,B3,D' || DEMO.before.minutes !== 9 || DEMO.after.minutes !== 10 || DEMO.after.old_route_now_minutes !== 14) throw new Error('demo result changed');

// ---- colours: Tensorblue palette + tensorblue.com's own Tailwind tokens (red-500, cyan-400, green-400) ----
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610',
  red: '#FB2C36', cyan: '#00D3F2', green: '#05DF72' };

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  your: VW('L1', 'your'), changed: VW('L1', 'changed'), reached: VW('L1', 'reached'), jam: VW('L1', 'jam'),
  how: VW('L2', 'how'), know: VW('L2', 'know'), first: VW('L2', 'first'),
  to: VW('L3', 'to'), streets: VW('L3', 'streets'), graph: VW('L3', 'graph'), each: VW('L3', 'each'), costs: VW('L3', 'costs'), travel: VW('L3', 'travel'), now: VW('L3', 'now'),
  live: VW('L4', 'live'), traffic4: VW('L4', 'traffic'), raised: VW('L4', 'raised'), two: VW('L4', 'two'), seven: VW('L4', 'seven'),
  it5: VW('L5', 'it'), reruns: VW('L5', 'reruns'), search5: VW('L5', 'search'), spot: VW('L5', 'spot'), old: VW('L5', 'old'), fourteen: VW('L5', 'fourteen'), detour: VW('L5', 'detour'), ten: VW('L5', 'ten'),
  google: VW('L6', 'google'), maps: VW('L6', 'maps'), live6: VW('L6', 'live'), predicted: VW('L6', 'predicted'),
  so: VW('L7', 'so'), fresh: VW('L7', 'fresh'), fast: VW('L7', 'fast'), search7: VW('L7', 'search'), rerun: VW('L7', 'rerun'), drive: VW('L7', 'drive'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, T.how - 0.15, T.to - 0.15, T.live - 0.15, T.it5 - 0.15, T.google - 0.15, T.so - 0.15, CTA_AT, 30.01];
const SH = { hook: 0, know: 1, graph: 2, jam: 3, search: 4, google: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- camera: one pose per shot, eased moves between them (no idle drift) ------------------------
const POSES = [
  { eye: [1.3, 12.0, 9.6], at: [1.3, 0.0, -3.8], fov: 36 },        // hook (frame zero): behind the car, the whole city ahead
  { eye: [-0.6, 9.4, 7.6], at: [0.4, 0.0, -3.4], fov: 32 },        // how did it know? closer, toward the jam ahead
  { eye: [1.3, 15.0, 6.4], at: [1.3, 0.0, -0.6], fov: 38 },        // high: streets become a graph with costs
  { eye: [-1.6, 9.0, 8.4], at: [0.7, 0.0, -0.8], fov: 30 },        // on the jammed segment: 2 → 7
  { eye: [1.3, 15.2, 6.8], at: [1.3, 0.0, -0.6], fov: 38 },        // high: the search, the old route, the detour
  { eye: [4.8, 9.6, 9.6], at: [1.3, 0.0, -1.4], fov: 36 },         // the city from the side: live + predicted
  { eye: [2.4, 12.6, 10.6], at: [1.3, 0.0, -4.0], fov: 34 },       // payoff: the car drives the detour
];
const MOVE = [0, 0.9, 1.0, 0.8, 0.9, 0.9, 1.0];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) return camera(p.eye, p.at, p.fov);
  const q = POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [2.8, 13.4, 9.6], c * k); }
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- the city -------------------------------------------------------------------------------------------
const BENCH = { x: 1.3, y: -0.6, z: -0.3, w: 22, h: 0.6, d: 18, colors: { top: SITE.surface2, front: SITE.deep, left: SITE.deep, right: SITE.deep }, color: SITE.deep };
const N = { C: [0, 3.8], A1: [0, 1.8], A2: [0, -0.4], A3: [0, -2.6], B1: [2.6, 1.8], B2: [2.6, -0.4], B3: [2.6, -2.6], D: [1.3, -4.4] };
// street geometry (polylines on the ground), keyed "a-b"
const POLY = {
  'C-A1': [N.C, N.A1], 'A1-A2': [N.A1, N.A2], 'A2-A3': [N.A2, N.A3], 'A3-D': [N.A3, [0, -4.4], N.D],
  'C-B1': [N.C, [2.6, 3.8], N.B1], 'B1-B2': [N.B1, N.B2], 'B2-B3': [N.B2, N.B3], 'B3-D': [N.B3, [2.6, -4.4], N.D],
  'A1-B1': [N.A1, N.B1], 'A2-B2': [N.A2, N.B2], 'A3-B3': [N.A3, N.B3],
};
const COST = Object.fromEntries(DEMO.streets.map(([a, b, w]) => [`${a}-${b}`, w]));
const polyFor = (a, b) => POLY[`${a}-${b}`] || POLY[`${b}-${a}`].slice().reverse();
const routePoly = (r) => r.slice(1).reduce((acc, n, i) => { const seg = polyFor(r[i], n); return acc.concat(i ? seg.slice(1) : seg); }, []);
const segLen = (p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
function along(p, d) {                                                       // point + heading at distance d along a polyline
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= L || i === p.length - 1) { const k = clamp(d / L); return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) }; }
    d -= L;
  }
}
const OLD_P = routePoly(OLD), NEW_P = routePoly(NEW);
const ROAD_W = 0.8;
const ROADS = [];
for (const p of Object.values(POLY)) for (let i = 1; i < p.length; i++) {
  const a = p[i - 1], b = p[i], cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, horiz = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
  ROADS.push({ x: cx, y: 0, z: cz - (horiz ? 0 : Math.abs(b[1] - a[1]) / 2) * 0, w: horiz ? Math.abs(b[0] - a[0]) + ROAD_W : ROAD_W, h: 0.03, d: horiz ? ROAD_W : Math.abs(b[1] - a[1]) + ROAD_W, color: '#16223A', colors: { top: '#1B2944' } });
}
for (const r of ROADS) r.z = r.z;                                             // boxes pivot at bottom centre (x, z centre) — already centred
const BLDG = [
  [1.3, 2.8, 0.7], [1.3, 0.7, 1.1], [1.3, -1.5, 0.6], [-1.5, 2.8, 0.9], [-1.5, 0.7, 0.6], [-1.5, -1.5, 1.3], [-1.5, -3.5, 0.8],
  [4.1, 2.8, 0.5], [4.1, 0.7, 1.2], [4.1, -1.5, 0.7], [4.1, -3.5, 1.0], [1.3, -3.5, 0.4],
].map(([x, z, h]) => ({ x, y: 0, z, w: 1.6, h, d: 1.3, color: SITE.gray, colors: { top: SITE.pale, front: '#C9D6EC', left: '#A7B8D2', right: SITE.gray }, edge: 'rgba(3,6,16,0.18)' }));

// ribbons: the part of a route polyline from 0 to frac, as flat strips on the road
function ribbon(p, frac, color, y = 0.05, w = 0.36, alpha = 1) {
  const out = []; let left = segLen(p) * clamp(frac);
  for (let i = 1; i < p.length && left > 1e-4; i++) {
    const a = p[i - 1], b = p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), l = Math.min(L, left); left -= l;
    const e = [lerp(a[0], b[0], l / L), lerp(a[1], b[1], l / L)], horiz = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
    out.push({ x: (a[0] + e[0]) / 2, y, z: (a[1] + e[1]) / 2, w: horiz ? Math.abs(e[0] - a[0]) + w : w, h: 0.02, d: horiz ? w : Math.abs(e[1] - a[1]) + w, color, colors: { top: color }, ambient: 0.9, alpha, kind: 'flat' });
  }
  return out;
}
const car = (pos, color, o = {}) => {
  const body = { x: pos.x, y: o.y || 0.03, z: pos.z, w: 0.46, h: 0.26, d: 0.8, yaw: pos.yaw, color, colors: { top: color }, edge: 'rgba(3,6,16,0.35)', alpha: o.alpha ?? 1, kind: 'car' };
  const roof = { x: pos.x - Math.sin(pos.yaw) * 0.04, y: (o.y || 0.03) + 0.26, z: pos.z - Math.cos(pos.yaw) * 0.04, w: 0.38, h: 0.16, d: 0.42, yaw: pos.yaw, color: o.roof || SITE.white, alpha: o.alpha ?? 1, kind: 'car' };
  return [body, roof];
};

// ---- screen-space label (large, brief) anchored to a 3D point --------------------------------
function tag(ctx, cam, p, label, k, o = {}) {
  if (k <= 0) return;
  const s = project(cam, p); if (s.z < 0.2) return;
  const size = o.size || 40, w = textW(ctx, label, size, 'IDXB') + size * 1.2;
  const x = clamp(s.x + (o.dx || 0), 110 + w / 2, 890 - w / 2), y = clamp(s.y + (o.dy || 0), 600, 1480);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  shadow(ctx, 0, size * 0.9, w * 0.45, 10, 0.5);
  ctx.fillStyle = o.fill || SITE.white; rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  text(ctx, label, 0, size * 0.36, { size, font: 'IDXB', color: o.color || SITE.ink }); ctx.restore();
}
const mid = (key) => { const p = POLY[key]; const L = segLen(p); const q = along(p, L / 2); return [q.x, 0.35, q.z]; };

// ---- the world ------------------------------------------------------------------------------------
const hop = (t, t0, a = 0.18) => a * Math.sin(Math.PI * clamp((t - t0) / 0.4));
function world(ctx, t) {
  const cam = camAt(t);
  floor(ctx, cam, BENCH, { at: [1.4, 0, -0.4], radius: 8, strength: 0.2 });
  const objs = [], flats = [];
  // state: is the jam there, which route is shown?
  const inHook = t < SHOTS[SH.graph];
  const jamK = inHook ? 1 : ease(ev(t, T.live - 0.05, 0.5));
  const newK = inHook ? 1 : ease(ev(t, T.detour - 0.1, 1.0));                  // the detour grows on "detour"
  const oldA = inHook ? 0.5 : t < T.detour - 0.1 ? 1 : 1 - 0.7 * ease(ev(t, T.detour - 0.1, 0.6));
  flats.push(...ROADS.map((r) => ({ ...r, kind: 'flat' })));
  flats.push(...ribbon(OLD_P, 1, SITE.blue, 0.05, 0.34, oldA));
  if (newK > 0) flats.push(...ribbon(NEW_P, newK, SITE.cyan, 0.06, 0.36));
  // the search: intersections settle in the real order, each glowing pad shows its time from the car
  const sk = (i) => ev(t, T.reruns - 0.05 + i * 0.22, 0.25);
  const showPads = !inHook && t >= T.graph - 0.1;
  if (showPads) for (const [n, [x, z]] of Object.entries(N)) {
    const oi = ORDER.findIndex(([m]) => m === n), lit = oi >= 0 && t >= SHOTS[SH.search] - 0.1 ? sk(oi) : 0;
    objs.push({ x, y: 0.03, z, w: 0.62, h: 0.08 + 0.1 * back(ev(t, T.graph - 0.05 + (n.charCodeAt(0) % 5) * 0.05, 0.35)), d: 0.62, color: lit > 0.5 ? SITE.cyan : SITE.white, colors: { top: lit > 0.5 ? '#7AEAFF' : SITE.white }, edge: 'rgba(3,6,16,0.3)', alpha: ev(t, T.graph - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff], 0.4)) });
  }
  // buildings and the destination pin
  objs.push(...BLDG);
  objs.push({ x: N.D[0], y: 0, z: N.D[1], w: 0.12, h: 0.75, d: 0.12, color: SITE.white });
  objs.push({ x: N.D[0], y: 0.75, z: N.D[1], w: 0.5, h: 0.5, d: 0.5, color: SITE.blue, colors: { top: '#5B9BFF' }, edge: 'rgba(255,255,255,0.3)' });
  // the jam: red cars queued on A1 → A2
  if (jamK > 0) for (let i = 0; i < 5; i++) {
    const dz = 1.35 - i * 0.42, drop = (1 - back(clamp(jamK * 1.4 - i * 0.08))) * 1.6;
    objs.push(...car({ x: (i % 2 ? 0.12 : -0.12), z: dz, yaw: Math.PI + (i % 2 ? 0.08 : -0.06) }, SITE.red, { y: 0.03 + Math.max(0, drop) + hop(t, T.jam + i * 0.05, 0.12), alpha: clamp(jamK * 3), roof: '#FFB3B6' }));
  }
  // the user's car: waits at C (it hasn't reached the jam); in the payoff it drives the detour
  const driveK = ease(ev(t, T.fresh - 0.2, CTA_AT - T.fresh));
  const cpos = t >= SHOTS[SH.payoff] ? along(NEW_P, segLen(NEW_P) * driveK * 0.98) : { x: N.C[0], z: N.C[1] + 0.25, yaw: Math.PI };
  objs.push(...car({ ...cpos, yaw: t >= SHOTS[SH.payoff] && driveK > 0 ? cpos.yaw : Math.PI }, SITE.blue, { y: 0.03 + hop(t, T.your, 0.1), roof: SITE.white }));
  // draw: floor items (roads, ribbons) first, then shadows, then boxes far → near
  for (const f of flats) drawBox(ctx, cam, f);
  for (const o of objs) contactShadow(ctx, cam, o, o.kind === 'car' ? 0.4 : 0.5, o.h > 1 ? 0.25 : 0.1);
  objs.map((o) => ({ o, z: project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z })).sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  // ---- large, brief labels (one idea at a time) ----
  const chipsK = ev(t, T.costs - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.search] + 0.2, 0.25)) * (inHook ? 0 : 1);
  if (chipsK > 0) for (const key of Object.keys(POLY)) {
    const jammed = key === 'A1-A2' && t >= T.seven - 0.05;
    const v = jammed ? 7 : COST[key];
    const only = key === 'A1-A2' ? 1 : 1 - ev(t, SHOTS[SH.jam] - 0.1, 0.3);              // the jam shot keeps just the jammed segment's cost
    if (only > 0) tag(ctx, cam, mid(key), `${v} min`, chipsK * only, { size: key === 'A1-A2' && t >= SHOTS[SH.jam] ? 40 : 30, fill: jammed ? SITE.red : SITE.white, color: jammed ? SITE.white : SITE.ink, dx: key === 'A1-A2' && t >= SHOTS[SH.jam] ? 120 : 0 });
  }
  tag(ctx, cam, [1.4, 0, 5.4], 'STREETS = GRAPH', ev(t, T.graph - 0.05, 0.3) * (1 - ev(t, T.costs - 0.25, 0.15)), { fill: SITE.blue, color: SITE.white, dy: 40 });
  tag(ctx, cam, [0, 0.4, 0.6], 'LIVE TRAFFIC', ev(t, T.traffic4 - 0.05, 0.3) * (1 - ev(t, T.raised - 0.15, 0.15)), { fill: SITE.red, color: SITE.white, dy: -150 });
  // search: time-from-car on each settled intersection, then the two results
  if (t >= SHOTS[SH.search] && t < SHOTS[SH.google] + 0.2) ORDER.forEach(([n, d], i) => {
    const k = sk(i) * (1 - ev(t, T.old - 0.25, 0.2)); if (k > 0) tag(ctx, cam, [N[n][0], 0.4, N[n][1]], String(d), k, { size: 30, fill: SITE.cyan, color: SITE.ink });
  });
  tag(ctx, cam, mid('A2-A3'), 'OLD: 14 MIN', ev(t, T.old - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.google] - 0.1, 0.2)), { fill: SITE.red, color: SITE.white, dx: -150 });
  tag(ctx, cam, mid('B2-B3'), 'DETOUR: 10 MIN', ev(t, T.detour + 0.2, 0.3) * (1 - ev(t, SHOTS[SH.google] - 0.1, 0.2)), { fill: SITE.green, color: SITE.ink, dx: 120 });
  tag(ctx, cam, [0, 0.5, 0.7], 'LIVE TRAFFIC', ev(t, T.live6 - 0.05, 0.3) * (1 - ev(t, T.predicted - 0.2, 0.15)), { fill: SITE.white, dy: -110 });
  tag(ctx, cam, [0, 0.5, 0.7], '+ PREDICTED', ev(t, T.predicted - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.05, 0.2)), { fill: SITE.cyan, color: SITE.ink, dy: -110 });
  // ---- kinetic type: frame-zero words (already on screen at t = 0), the question, the payoff ----
  if (t < T.how - 0.25) {
    const a = 1 - ev(t, T.how - 0.5, 0.25);
    text(ctx, 'YOUR ROUTE', 540, 690, { size: 110, font: 'IDXB', alpha: a });
    text(ctx, 'JUST CHANGED.', 540, 810, { size: 104, font: 'IDXB', color: SITE.cyan, alpha: a });
  }
  kword(ctx, 'HOW DID IT KNOW?', 540, 690, 88, t, T.how - 0.05, { color: SITE.cyan, t1: T.to - 0.3 });
  kword(ctx, 'FRESH TIMES', 540, 690, 100, t, T.fresh - 0.05, { t1: CTA_AT });
  kword(ctx, '+ FAST SEARCH.', 540, 800, 100, t, T.fast - 0.05, { color: SITE.cyan, t1: CTA_AT });
}

// ---- captions (2026-11-11 rule: readable inside x 100–900; house band y 340–520, centred x 500) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Your route just changed,'] },
  { t0: VW('L1', 'and'), lines: ["and you haven't even", 'reached the jam.'] },
  { t0: VL('L2').t0, lines: ['How did the app know first?'] },
  { t0: VL('L3').t0, lines: ['To the app,', 'streets are a graph.'] },
  { t0: T.each, lines: ['Each segment costs', 'its travel time now.'] },
  { t0: VL('L4').t0, lines: ['Live traffic just', 'raised this one'] },
  { t0: VW('L4', 'from'), lines: ['from 2 minutes to 7.'] },
  { t0: VL('L5').t0, lines: ['It reruns a shortest-time', 'search from your spot:'] },
  { t0: T.old, lines: ['old route 14, detour 10.'] },
  { t0: VL('L6').t0, lines: ['Google says', 'Maps reroutes'] },
  { t0: VW('L6', 'using'), lines: ['using live and', 'predicted traffic.'] },
  { t0: VL('L7').t0, lines: ['So a reroute is', 'fresh travel times'] },
  { t0: VW('L7', 'plus'), lines: ['plus a fast search,', 'rerun as you drive.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 760, CAPTION_CX = 500;
const CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px InterSB`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, CAPTION_CX, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', alpha: a });
}

// ---- CTA — the accepted English end card, unchanged ------------------------------------------
function cta(ctx, t) {
  const lk = back(ev(t, CTA_AT + 0.05, 0.5));
  if (lk > 0) {
    const h = 300 * lk, w = h * 200 / 260;
    shadow(ctx, 540, 1020, 120 * lk, 18, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(lk); ctx.drawImage(LOGO, 540 - w / 2, 690 + (300 - h), w, h); ctx.restore();
  }
  const size = 128, w1 = textW(ctx, 'Tensor', size, 'IDXB', -2), w2 = textW(ctx, 'blue', size, 'IDXB', -2);
  const x0 = 540 - (w1 + w2) / 2;
  kword(ctx, 'Tensor', x0, 1160, size, t, T.tb - 0.1, { align: 'left' });
  kword(ctx, 'blue', x0 + w1, 1160, size, t, T.tb - 0.02, { align: 'left', color: C.blue });
  kword(ctx, 'software explained simply', 540, 1250, 50, t, T.tb + 0.5, { font: 'IDB', color: C.gray });
  const fk = back(ev(t, T.follow - 0.05, 0.35));
  if (fk > 0) {
    ctx.save(); ctx.translate(540, 1370); ctx.scale(fk, fk); ctx.translate(-540, -1370);
    ctx.fillStyle = C.blue; rr(ctx, 540 - 150, 1370 - 50, 300, 100, 50); ctx.fill();
    text(ctx, 'Follow', 540, 1388, { size: 50, font: 'IDXB' });
    ctx.restore();
  }
}

// ---- SFX (each tied to an on-screen action) ---------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.0, 'blip', { hi: true }); add(T.jam, 'clack', { soft: true });
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.how - 0.05, 'type'); add(T.know - 0.05, 'type');
  add(T.graph - 0.05, 'slot'); add(T.costs - 0.1, 'blip');
  add(T.live - 0.05, 'clack'); add(T.live + 0.25, 'clack', { soft: true }); add(T.seven - 0.05, 'carve');
  ORDER.forEach((_, i) => add(T.reruns - 0.05 + i * 0.22, 'tap', { soft: true }));
  add(T.old - 0.05, 'blip'); add(T.detour - 0.1, 'slide'); add(T.ten, 'blip', { hi: true });
  add(T.live6 - 0.05, 'blip'); add(T.predicted - 0.05, 'blip');
  add(T.fresh - 0.2, 'slide', { soft: true }); add(T.fresh - 0.05, 'type'); add(T.fast - 0.05, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame: the 3D world, then one blue wipe up into the accepted CTA -------------------------
const STAGE_TOP = 540, WIPE = 0.5;
const bg = makeBackground();
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  const k = (t - (CTA_AT - WIPE / 2)) / WIPE;
  if (k < 0) world(ctx, t);
  else if (k >= 1) cta(ctx, t);
  else {
    const e = ease(k), band = 220, edge = lerp(H + band, STAGE_TOP - band, e);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); world(ctx, t); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); cta(ctx, t); ctx.restore();
    ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
  }
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}

// ---- thumbnail: frame zero itself (it is composed to work as the thumbnail) + the wordmark ----
export function drawThumbnail(ctx) {
  const prev = process.env.NO_CAPTION; process.env.NO_CAPTION = '1';
  drawFrame(ctx, 0);
  if (prev === undefined) delete process.env.NO_CAPTION; else process.env.NO_CAPTION = prev;
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 372, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 424, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 424, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
