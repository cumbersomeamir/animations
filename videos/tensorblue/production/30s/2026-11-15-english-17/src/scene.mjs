// Tensorblue 30s english-17 · episode 01 — "Two hands. One file." (how Figma's multiplayer orders edits)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`):
// a shared canvas on the bench with one blue shape, two people's cursors (Ana, Ben) and their instant local
// "ghost" views; edit cards fly to a server that puts them in one order; the last value for the same
// property wins everywhere; different properties (position, colour) both survive. Event logic and results
// come from demo/out/multiplayer-demo.json (our model of the design Figma's co-founder described in 2019).
// Colours: Tensorblue palette + tensorblue.com's own cyan-400 / green-400 / amber-400 tokens. Cues from voice-timing.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground,
} from './brt.mjs';
import { camera, project, drawBox, contactShadow, floor, bez, mix3 } from './stage3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the model's result -----------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/multiplayer-demo.json'), 'utf8'));
const ORDER = DEMO.server_arrival_order;
if (!DEMO.all_copies_identical || !DEMO.different_properties_both_kept || DEMO.final_server['shape.fill'] !== 'amber' || DEMO.final_server['shape.x'] !== 0 || ORDER[0][1] !== 'Ana' || ORDER[1][1] !== 'Ben' || ORDER[1][3] !== 2 || DEMO.ben_flickers_with_discard_rule !== 0 || DEMO.ben_flickers_naive_client !== 1) throw new Error('demo result changed');

// ---- colours: Tensorblue palette + tensorblue.com's own Tailwind tokens (cyan-400, green-400) ----
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610',
  cyan: '#00D3F2', green: '#05DF72' };
const ANA = SITE.cyan, BEN = SITE.green;

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  two: VW('L1', 'two'), drag1: VW('L1', 'drag'), once: VW('L1', 'once'), why: VW('L1', 'why'), file: VW('L1', 'file'), brk: VW('L1', 'break'),
  figmas: VW('L2', "figma's"), cofounder: VW('L2', 'co-founder'), trick: VW('L2', 'trick'),
  your: VW('L3', 'your'), drag3: VW('L3', 'drag'), screen: VW('L3', 'screen'), instantly: VW('L3', 'instantly'), before: VW('L3', 'before'), answers: VW('L3', 'answers'),
  then: VW('L4', 'then'), every: VW('L4', 'every'), edit: VW('L4', 'edit'), server4: VW('L4', 'server'), puts: VW('L4', 'puts'), one4: VW('L4', 'one'), order4: VW('L4', 'order'),
  same: VW('L5', 'same'), property: VW('L5', 'property'), last: VW('L5', 'last'), server5: VW('L5', 'server'), wins: VW('L5', 'wins'), everywhere: VW('L5', 'everywhere'),
  different: VW('L6', 'different'), like: VW('L6', 'like'), position: VW('L6', 'position'), color: VW('L6', 'color'), both: VW('L6', 'both'), survive: VW('L6', 'survive'),
  figma7: VW('L7', 'figma'), not: VW('L7', 'not'), crdt: VW('L7', 'crdt'), one7: VW('L7', 'one'), server7: VW('L7', 'server'), orders: VW('L7', 'orders'), change: VW('L7', 'change'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const FLY = 0.7;                                                               // card flight time
const CARDS = {
  anaPop: T.instantly + 0.3, anaFly: T.edit - 0.25, benPop: T.then + 0.45, benFly: T.edit + 0.2, sameGone: T.everywhere + 0.4,
  benPop2: T.position + 0.05, benFly2: T.position + 0.3, anaPop2: T.color + 0.05, anaFly2: T.color + 0.25, diffGone: T.survive + 0.45,
};
const LANDINGS = [CARDS.anaFly, CARDS.benFly, CARDS.benFly2, CARDS.anaFly2].map((x) => x + FLY);
const SHOTS = [0, T.figmas - 0.15, T.your - 0.15, T.then - 0.15, T.same - 0.15, T.different - 0.15, T.figma7 - 0.15, CTA_AT, 30.01];
const SH = { hook: 0, trick: 1, instant: 2, order: 3, same: 4, diff: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- camera ---------------------------------------------------------------------------------------
const POSES = [
  { eye: [0.0, 5.6, 7.6], at: [0.0, 0.0, 0.4], fov: 40 },          // hook: the shared shape, tugged both ways
  { eye: [0.0, 6.6, 9.8], at: [0.0, 0.9, -0.6], fov: 38 },         // pull back: the server pops up behind
  { eye: [-0.5, 6.2, 9.4], at: [-0.2, 0.8, -0.5], fov: 38 },       // Ana's drag: instant on her screen
  { eye: [0.0, 6.4, 9.6], at: [0.0, 1.0, -0.8], fov: 38 },         // edit cards land on the server in one order
  { eye: [0.3, 6.4, 9.6], at: [0.15, 0.9, -0.6], fov: 38 },         // same property: last value wins everywhere
  { eye: [0.8, 6.2, 9.2], at: [0.3, 0.8, -0.5], fov: 38 },         // different properties: both survive
  { eye: [0.0, 7.0, 10.8], at: [0.0, 1.9, -0.6], fov: 40 },        // payoff (slow crane)
];
const MOVE = [0, 0.8, 0.7, 0.7, 0.7, 0.7, 1.0];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) return camera(p.eye, p.at, p.fov);
  const q = POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [1.0, 7.6, 10.4], c * k); }
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- world ----------------------------------------------------------------------------------------
const BENCH = { x: 0, y: -0.6, z: -1.0, w: 22, h: 0.6, d: 16, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const CANVAS = { x: 0, y: 0, z: 1.0, w: 5.2, h: 0.14, d: 3.0 };
const SERVER = { x: 0, y: 0, z: -2.0, w: 3.2, h: 2.1, d: 1.2 };
const SHAPE_Z = 1.0, SHAPE_W = 1.25, SHAPE_H = 0.62;
const SX = (v) => v * 0.8;                                                     // model x (−2..2) → canvas x
const AMBER = '#FFB900';                                                       // tensorblue.com amber-400 (the new colour Ana picks)
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const CANVAS_TEX = cached('canvas', 520, 300, (g, w, h) => {
  g.fillStyle = '#EEF3FB'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#C9D6EC'; for (let x = 20; x < w; x += 40) for (let y = 30; y < h; y += 40) { g.beginPath(); g.arc(x, y, 2.4, 0, Math.PI * 2); g.fill(); }   // static dot grid
});
// server front: title + two inset slots (slot centres x = ±0.78, y 0.22..1.36 in world units)
const SLOT_X = [-0.78, 0.78], SLOT_Y = 0.22, CARD_W = 1.3, CARD_H = 1.08;
const SERVER_TEX = cached('server', 640, 420, (g, w, h) => {
  g.fillStyle = SITE.pale; g.fillRect(0, 0, w, h);
  g.fillStyle = SITE.ink; g.font = '74px IDXB'; g.textAlign = 'center'; g.fillText('SERVER', w / 2, 104);
  g.fillStyle = '#B9C8DF'; for (const sx of SLOT_X) { const cx = w / 2 + sx * 200; rr(g, cx - 140, 140, 280, 250, 28); g.fill(); }
});
function arrow(g, cx, cy, dir, len, col) {
  g.fillStyle = col; g.beginPath();
  const s = dir, hl = len * 0.42, hw = len * 0.34, sw = len * 0.12;
  g.moveTo(cx + s * len / 2, cy); g.lineTo(cx + s * (len / 2 - hl), cy - hw); g.lineTo(cx + s * (len / 2 - hl), cy - sw);
  g.lineTo(cx - s * len / 2, cy - sw); g.lineTo(cx - s * len / 2, cy + sw); g.lineTo(cx + s * (len / 2 - hl), cy + sw); g.lineTo(cx + s * (len / 2 - hl), cy + hw); g.closePath(); g.fill();
}
// an edit card: who sent it (colour band + name) and what it changes (move ← / → or a colour)
const cardTex = (kind, who) => cached(`card|${kind}|${who}`, 520, 432, (g, w, h) => {
  g.fillStyle = SITE.white; rr(g, 0, 0, w, h, 40); g.fill();
  g.save(); rr(g, 0, 0, w, h, 40); g.clip(); g.fillStyle = who === 'Ana' ? ANA : BEN; g.fillRect(0, 0, w, 96); g.restore();
  g.fillStyle = SITE.ink; g.font = '58px IDXB'; g.textAlign = 'center'; g.fillText(who, w / 2, 68);
  if (kind === 'color') { g.fillStyle = AMBER; rr(g, w / 2 - 95, 140, 190, 150, 30); g.fill(); }
  else arrow(g, w / 2, 215, kind === 'left' ? -1 : 1, 300, SITE.ink);
  g.fillStyle = '#5B6B86'; g.font = '56px IDXB'; g.fillText(kind === 'color' ? 'COLOR' : 'MOVE', w / 2, 388);
});
const mixHex = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join(''); };

// screen-space cursor: arrow + name chip (Ana's chip on the left, Ben's on the right), anchored to a 3D point
function cursor(ctx, cam, p, name, col, k, left, flip = 0) {
  if (k <= 0) return; const s = project(cam, p); if (s.z < 0.2) return;
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(s.x, s.y); ctx.scale(1.5, 1.5);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.lineTo(12, 35); ctx.lineTo(21, 54); ctx.lineTo(29, 50); ctx.lineTo(20, 32); ctx.lineTo(36, 32); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.strokeStyle = SITE.ink; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.font = '26px IDXB'; const tw = ctx.measureText(name).width, cx = left ? lerp(-tw - 34, 30, flip) : 30, cy = left ? -46 : 50;   // Ana's chip above (left, or right while Ben is left of her), Ben's below-right: never overlap
  ctx.fillStyle = col; rr(ctx, cx, cy, tw + 26, 40, 20); ctx.fill();
  ctx.fillStyle = SITE.ink; ctx.textAlign = 'left'; ctx.fillText(name, cx + 13, cy + 29);
  ctx.restore();
}
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

// ---- who sees what, over time (x in model units −2..2; c = how much of the new amber colour) ----------
// The file = the server's copy; Ana's / Ben's screens show their own edits at once (optimistic), then the
// server's value. Order and outcomes follow demo/out/multiplayer-demo.json.
function views(t) {
  const E = (t0, d) => ease(ev(t, t0, d));
  const file = { x: 0, c: 0, sq: 1 }, ana = { x: 0, c: 0 }, ben = { x: 0, c: 0 };
  if (t < SHOTS[SH.instant]) {
    const relax = E(SHOTS[SH.trick], 0.6);
    const pull = (1 - 0.1 * (1 - Math.cos(t * 4.6)) / 2 + 0.12 * Math.sin(Math.PI * ev(t, T.brk - 0.15, 0.4))) * (1 - relax);
    ana.x = -1.3 * pull; ben.x = 1.3 * pull; file.sq = 1 + 0.07 * pull; file.x = 0.03 * Math.sin(t * 11) * (1 - relax);
    return { file, ana, ben };
  }
  ana.x = -2 * E(T.drag3, 0.4);                                    // Ana drags left: her screen moves at once
  ben.x = 2 * E(T.then + 0.1, 0.4);                                // Ben drags right
  file.x = 2 * E(T.wins - 0.12, 0.5);                              // the server's last value (Ben's) is the file's value
  ana.x = lerp(ana.x, 2, E(T.everywhere, 0.45));                   // …and reaches Ana too
  ben.x = lerp(ben.x, 0, E(T.position - 0.05, 0.45));              // different properties: Ben moves it back
  ana.c = E(T.color - 0.05, 0.18);                                 // Ana recolours
  const both = E(T.both - 0.08, 0.5);
  file.x = lerp(file.x, 0, both); file.c = both; ana.x = lerp(ana.x, 0, both); ben.c = both;
  return { file, ana, ben };
}

// ---- edit cards: pop above the sender, fly into a server slot, then get absorbed -------------------
function cardsAt(t, v) {
  const out = [];
  const add = (kind, who, view, tPop, tFly, slot, tGone, o = {}) => {
    if (t < tPop || t > tGone + 0.45) return;
    const pop = back(ev(t, tPop, 0.3)), fly = ease(ev(t, tFly, FLY)), gone = ease(ev(t, tGone, 0.4));
    const sx = SX(view.x) + (who === 'Ana' ? -0.15 : 0.15);
    const p0 = [sx, CANVAS.h + SHAPE_H + 0.75, SHAPE_Z + 0.2];
    const p3 = [SERVER.x + SLOT_X[slot], o.srvY + SLOT_Y + gone * 0.2, SERVER.z + SERVER.d / 2 + 0.05];
    const pos = bez(p0, [p0[0], p0[1] + 1.4, p0[2] - 0.4], [p3[0], p3[1] + 1.5, p3[2] + 0.8], p3, fly);
    const sc = lerp(0.62, 1, fly) * pop * (o.pulse || 1) * (1 - 0.7 * gone);   // absorbed: shrinks into its slot
    out.push({ obj: { x: pos[0], y: pos[1], z: pos[2], w: CARD_W * sc, h: CARD_H * sc, d: 0.06, pitch: -(Math.PI / 2) * (1 - fly) * 0.85, yaw: 0.25 * Math.sin(Math.PI * fly) * (who === 'Ana' ? 1 : -1),
      color: SITE.white, colors: { back: SITE.gray, left: SITE.gray, right: SITE.gray, top: SITE.gray, bottom: SITE.gray }, tex: { front: cardTex(kind, who) }, alpha: (o.alpha ?? 1) * (1 - gone), ambient: 0.8, edge: 'rgba(3,6,16,0.2)' },
    landed: fly, slot, side: [SERVER.x + (slot ? 1 : -1) * SERVER.w / 2, p3[1] + CARD_H / 2, p3[2]] });
  };
  const srvY = LANDINGS.reduce((a, tl) => a + hop(t, tl, 0.1), 0) + hop(t, T.one7, 0.2);
  if (t < SHOTS[SH.diff]) {
    const dim = ev(t, T.last - 0.05, 0.3), same = 1 + 0.06 * Math.sin(Math.PI * ev(t, T.property - 0.05, 0.35)), pulse = same * (1 + 0.08 * Math.sin(Math.PI * ev(t, T.last - 0.05, 0.4)));
    add('left', 'Ana', v.ana, CARDS.anaPop, CARDS.anaFly, 0, CARDS.sameGone, { srvY, alpha: 1 - 0.65 * dim, pulse: same });
    add('right', 'Ben', v.ben, CARDS.benPop, CARDS.benFly, 1, CARDS.sameGone, { srvY, pulse });
  } else {
    add('left', 'Ben', v.ben, CARDS.benPop2, CARDS.benFly2, 0, CARDS.diffGone, { srvY });
    add('color', 'Ana', v.ana, CARDS.anaPop2, CARDS.anaFly2, 1, CARDS.diffGone, { srvY });
  }
  return { cards: out, srvY };
}

// ---- the world ------------------------------------------------------------------------------------
const hop = (t, t0, a = 0.18) => a * Math.sin(Math.PI * clamp((t - t0) / 0.35));
function shapeObj(view, fill, o = {}) {
  const sq = o.sq || 1, s = o.s || 1;
  return { x: SX(view.x), y: CANVAS.h + (o.lift || 0), z: SHAPE_Z, w: SHAPE_W * sq * s, h: SHAPE_H / Math.sqrt(sq) * (o.hs || 1), d: SHAPE_W * s / Math.sqrt(sq),
    color: fill, colors: { top: mixHex(fill, '#FFFFFF', 0.12) }, alpha: o.alpha ?? 1, edge: o.edge || 'rgba(255,255,255,0.35)', ambient: 0.6 };
}
function world(ctx, t) {
  const cam = camAt(t);
  floor(ctx, cam, BENCH, { at: [0, 0, 0.0], radius: 9, strength: 0.22 });
  const v = views(t), { cards, srvY } = cardsAt(t, v);
  const canvasObj = { ...CANVAS, color: SITE.gray, colors: { top: '#EEF3FB', front: '#C9D6EC', left: '#A7B8D2', right: '#A7B8D2' }, tex: { top: CANVAS_TEX }, edge: 'rgba(3,6,16,0.15)' };
  // the server pops up behind the canvas when the trick is introduced
  const rise = t < SHOTS[SH.trick] ? 0 : back(ev(t, SHOTS[SH.trick] + 0.15, 0.55));
  const server = { ...SERVER, y: srvY, h: SERVER.h * rise, color: SITE.gray, colors: { top: SITE.pale, front: SITE.pale, left: '#A7B8D2', right: SITE.gray }, tex: { front: SERVER_TEX }, edge: 'rgba(3,6,16,0.2)' };
  const fileFill = mixHex(SITE.blue, AMBER, v.file.c);
  const file = shapeObj(v.file, fileFill, { sq: v.file.sq, lift: hop(t, T.orders, 0.25) });
  contactShadow(ctx, cam, canvasObj, 0.5, 0.12);
  if (rise > 0.01) contactShadow(ctx, cam, server, 0.5, 0.3);
  drawBox(ctx, cam, canvasObj);
  if (rise > 0.01) drawBox(ctx, cam, server);
  contactShadow(ctx, cam, file, 0.45, 0.12, CANVAS.h);
  drawBox(ctx, cam, file);
  // each person's own screen, drawn over the file only where it differs (translucent, in their colour)
  const ghost = (view, col) => {
    const dx = Math.abs(view.x - v.file.x), dc = Math.abs(view.c - v.file.c);
    const a = Math.max(0.55 * clamp(dx / 0.5), 0.95 * clamp(dc / 0.15));
    if (a < 0.01) return;
    const fill = mixHex(mixHex(SITE.blue, AMBER, view.c), col, 0.4 * (1 - view.c));
    const paint = col === ANA ? 0.08 * Math.sin(Math.PI * ev(t, T.color - 0.05, 0.3)) : 0;   // a little pop when Ana repaints
    drawBox(ctx, cam, shapeObj(view, fill, { alpha: a, lift: 0.005, s: 1.03 + paint, hs: 1.03 + paint, edge: col }));
  };
  ghost(v.ben, BEN); ghost(v.ana, ANA);
  cards.sort((a, b) => project(cam, [b.obj.x, b.obj.y, b.obj.z]).z - project(cam, [a.obj.x, a.obj.y, a.obj.z]).z).forEach((c) => drawBox(ctx, cam, c.obj));
  // cursors grip each person's own copy
  const curOn = 1 - ev(t, CTA_AT - 0.6, 0.3), top = CANVAS.h + SHAPE_H * 0.9;
  const flip = t >= SHOTS[SH.diff] ? ease(ev(t, T.position - 0.05, 0.45)) - ease(ev(t, T.both - 0.08, 0.5)) : 0;   // Ben's copy slides under Ana's label: move it aside
  cursor(ctx, cam, [SX(v.ana.x) - 0.3, top, SHAPE_Z + 0.25 - 0.5 * flip], 'Ana', ANA, curOn, true, flip);
  cursor(ctx, cam, [SX(v.ben.x) + 0.25, top, SHAPE_Z + 0.25], 'Ben', BEN, curOn, false);
  // ---- large, brief labels (one idea at a time) ----
  const srvTop = [SERVER.x, SERVER.h + srvY, SERVER.z];
  tag(ctx, cam, [SX(-2), CANVAS.h, SHAPE_Z + 0.7], 'INSTANT', ev(t, T.instantly - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.order] - 0.15, 0.2)), { fill: ANA, dy: 70 });
  cards.forEach((c) => { if (t < SHOTS[SH.diff] && c.landed > 0.9) tag(ctx, cam, c.side, String(c.slot + 1), ev(c.landed, 0.9, 0.1) * (1 - ev(t, T.everywhere + 0.3, 0.3)), { size: 40, fill: SITE.blue, color: SITE.white, dx: c.slot ? 46 : -46 }); });
  tag(ctx, cam, srvTop, 'ONE ORDER', ev(t, T.one4 - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.same] - 0.1, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -120 });
  tag(ctx, cam, srvTop, 'SAME PROPERTY', ev(t, T.property - 0.1, 0.3) * (1 - ev(t, T.last - 0.2, 0.15)), { dy: -120 });
  tag(ctx, cam, srvTop, 'LAST ONE WINS', ev(t, T.last - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.diff] - 0.1, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -120 });
  tag(ctx, cam, [SX(0), CANVAS.h, CANVAS.z + CANVAS.d / 2], 'POSITION ✓', ev(t, T.both - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.1, 0.2)), { fill: BEN, dx: -150, dy: 70 });
  tag(ctx, cam, [SX(0), CANVAS.h, CANVAS.z + CANVAS.d / 2], 'COLOR ✓', ev(t, T.survive - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.1, 0.2)), { fill: AMBER, dx: 150, dy: 70 });
  tag(ctx, cam, srvTop, 'NOT A TRUE CRDT', ev(t, T.not - 0.05, 0.3) * (1 - ev(t, T.one7 - 0.25, 0.15)), { dy: -110 });
  // ---- kinetic type: frame-zero words (already on screen at t = 0), payoff ----
  if (t < T.figmas - 0.25) {
    const k = 1 - ev(t, T.figmas - 0.5, 0.25);
    text(ctx, 'TWO HANDS.', 540, 690, { size: 112, font: 'IDXB', alpha: k });
    text(ctx, 'ONE FILE.', 540, 812, { size: 112, font: 'IDXB', color: SITE.cyan, alpha: k });
  }
  kword(ctx, 'ONE SERVER,', 540, 690, 100, t, T.one7 - 0.05, { t1: CTA_AT });
  kword(ctx, 'ONE ORDER.', 540, 800, 104, t, T.orders - 0.05, { color: SITE.cyan, t1: CTA_AT });
}

// ---- captions ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Two people drag', 'one shape at once.'] },
  { t0: T.why, lines: ["Why doesn't the file break?"] },
  { t0: VL('L2').t0, lines: ["Figma's co-founder", 'explained the trick.'] },
  { t0: VL('L3').t0, lines: ['Your drag shows on your', 'screen instantly,'] },
  { t0: T.before, lines: ['before the server answers.'] },
  { t0: VL('L4').t0, lines: ['Then every edit', 'goes to the server,'] },
  { t0: VW('L4', 'which'), lines: ['which puts them', 'in one order.'] },
  { t0: VL('L5').t0, lines: ['Same property?'] },
  { t0: VW('L5', 'the'), lines: ['The last value the server', 'gets wins, everywhere.'] },
  { t0: VL('L6').t0, lines: ['Different properties,', 'like position and color?'] },
  { t0: T.both, lines: ['Both survive.'] },
  { t0: VL('L7').t0, lines: ["Figma says that's", 'not a true CRDT:'] },
  { t0: T.one7, lines: ['one server orders', 'every change.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (const c of CAPS) c.t0 -= 0.06;                                              // shift every start first,
for (let i = 0; i < CAPS.length; i++) if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0;   // then end each one where the next begins (no blank hand-off frame)
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

// ---- SFX ----
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.0, 'blip', { hi: true }); add(T.brk - 0.1, 'slide', { soft: true });                      // the tug
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(SHOTS[SH.trick] + 0.2, 'clack');                                                             // the server pops up
  add(T.drag3, 'slide', { soft: true }); add(T.instantly, 'blip');                                 // Ana's instant drag
  add(CARDS.anaPop, 'tap'); add(T.then + 0.1, 'slide', { soft: true }); add(CARDS.benPop, 'tap'); // Ben's drag, cards appear
  for (const tl of LANDINGS) add(tl, 'slot');                                                      // cards dock in the server
  add(T.one4, 'blip', { hi: true });
  add(T.property - 0.05, 'tap', { soft: true }); add(T.last - 0.05, 'match'); add(T.wins - 0.12, 'slide', { soft: true }); add(T.everywhere, 'blip', { hi: true });
  add(T.position - 0.05, 'slide', { soft: true }); add(T.color - 0.05, 'tap'); add(T.both - 0.08, 'match'); add(T.survive, 'blip', { hi: true });
  add(T.not, 'tap', { soft: true }); add(T.one7 - 0.05, 'type'); add(T.orders - 0.05, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame ----
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

// ---- thumbnail: frame zero + the wordmark ----
export function drawThumbnail(ctx) {
  const prev = process.env.NO_CAPTION; process.env.NO_CAPTION = '1';
  drawFrame(ctx, 0);
  if (prev === undefined) delete process.env.NO_CAPTION; else process.env.NO_CAPTION = prev;
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 372, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 424, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 424, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
