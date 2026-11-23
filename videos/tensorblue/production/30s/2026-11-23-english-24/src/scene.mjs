// Tensorblue 30s english-24 · episode 01 — "Same millisecond. No repeats." (how Twitter's Snowflake (2010) gave every
// tweet a unique, time-sorted ID from many servers without a central counter, and why apps keep those IDs as strings)
// Blue Receipt Theatre kit (`brt.mjs`, unchanged) + `stage3d.mjs` (unchanged) + `toy3d.mjs` (english-20, unchanged).
// A toy server room: three server towers fire white ID plates; a central counter sinks away; one plate splits into
// three blocks sized by their bits (TIME 41 | MACHINE 10 | COUNTER 12); nine plates land in a sorted wall; in the
// payoff two plates flip to strings (distinct) and then to JavaScript Numbers (identical) and merge.
// Every number shown comes from our own test (demo/out/snowflake-test.json): our re-implementation of the documented
// 2010 layout, three machines, one real clock reading, 12 IDs all distinct, and 12 IDs -> 6 values as JS Numbers.
// Colours: Tensorblue palette + tensorblue.com's own red-500 (collision) and green-400 (time-sorted / strings OK).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground } from './brt.mjs';
import { camera, project, floor, mix3 } from './stage3d.mjs';
import { extrude, rrectPts, dropShadow, lightPool, squash, hop } from './toy3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
GlobalFonts.registerFromPath(path.resolve(HERE, '../../../../assets/fonts/jetbrains-mono/JetBrainsMono-Bold.ttf'), 'JBM');
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the real test ------------------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/snowflake-test.json'), 'utf8'));
const JS = DEMO.js;
if (DEMO.count !== 12 || DEMO.distinct !== 12 || !DEMO.sorted_by_number_is_time_order || !DEMO.decode_round_trip_ok
  || DEMO.layout_bits.time !== 41 || DEMO.layout_bits.machine !== 10 || DEMO.layout_bits.sequence !== 12
  || !JS || !JS.showcase.numbers_equal || JS.showcase.bigint_equal || JS.distinct_after_Number >= JS.test_ids) throw new Error('demo result changed');
const SAME_MS = DEMO.ids.filter((x) => x.ms === DEMO.ids[0].ms);       // the nine IDs made in one millisecond
if (SAME_MS.length !== 9 || new Set(SAME_MS.map((x) => x.id)).size !== 9) throw new Error('expected 9 distinct same-ms IDs');
const HERO = DEMO.sample;                                               // machine 2, counter 0
const fmt = (n) => Number(n).toLocaleString('en-US');
const PAIR = [JS.showcase.a, JS.showcase.b];                            // machine 1, counter 0 and 1: equal as JS Numbers
const PAIR_NUM = JS.showcase.number_a;                                  // what both become

// ---- colours / cues ----
const K = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', blueDeep: '#2757A6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF',
  grayDark: '#788396', white: '#FFFFFF', ink: '#030610', red: '#FB2C36', redDeep: '#A11A22', green: '#05DF72', greenDeep: '#039752', desk: '#0E1A2E' };
const T = {
  twitter: VW('L1', 'twitter'), thousand: VW('L1', 'thousand'), ids1: VW('L1', 'ids'),
  repeats: VW('L2', 'repeats'), without: VW('L2', 'without'), servers: VW('L2', 'servers'), how: VW('L2', 'how'),
  built: VW('L3', 'built'), snowflake: VW('L3', 'snowflake'), one3: VW('L3', 'one'), three3: VW('L3', 'three'), parts: VW('L3', 'parts'),
  first: VW('L4', 'first'), time: VW('L4', 'time'), ms4: VW('L4', 'millisecond'),
  machine5: VW('L5', 'machine'), made: VW('L5', 'made'),
  counter: VW('L6', 'counter'), ids6: VW('L6', 'ids'), same6: VW('L6', 'same'), ms6: VW('L6', 'millisecond'),
  test: VW('L7', 'test'), machines7: VW('L7', 'machines'), same7: VW('L7', 'same'), nine: VW('L7', 'nine'), zero: VW('L7', 'zero'), repeats7: VW('L7', 'repeats'),
  js: VW('L8', 'javascript'), keep: VW('L8', 'keep'), strings: VW('L8', 'strings'), or8: VW('L8', 'or'), different: VW('L8', 'different'), become: VW('L8', 'become'), number8: VW('L8', 'number'),
  follow: VW('L9', 'follow'), tb: VW('L9', 'tensorblue'),
};
const CTA_AT = VL('L9').t0 - 0.4;
const HIT = VL('L8').t1 + 0.03;                                         // the two Numbers clash just after "number" ends (keeps the word clean)
// cuts sit just before each line, except: the parts shot cuts 0.3 s into L3 so HOW? can land, and the counter shot cuts on L6's first word
const SHOTS = [0, VL('L2').t0 - 0.12, VL('L3').t0 + 0.3, VL('L4').t0 - 0.12, VL('L5').t0 - 0.12, VL('L6').t0, VL('L7').t0 - 0.12, VL('L8').t0 - 0.12, CTA_AT, 30.01];
const SH = { hook: 0, how: 1, parts: 2, time: 3, machine: 4, counter: 5, proof: 6, payoff: 7, cta: 8 };
export const CUES = { ...T, scenes: SHOTS, ctaAt: CTA_AT };
const shotAt = (t) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++; return i; };
const wShot = (t) => Math.min(shotAt(t), SH.payoff);

// ================================= textures =================================
const TEXC = new Map();
function cached(key, w, h, draw) {
  if (TEXC.has(key)) return TEXC.get(key);
  const cv = createCanvas(w, h), g = cv.getContext('2d');
  const ft = g.fillText.bind(g);                                         // every texture line must fit its face
  g.fillText = (str, x, y) => { const m = g.measureText(str), a = g.textAlign; const x0 = a === 'center' ? x - m.width / 2 : a === 'right' ? x - m.width : x;
    if (x0 < 8 || x0 + m.width > w - 8) throw new Error(`texture text overflows ${key}: "${str}"`); ft(str, x, y); };
  draw(g, w, h); TEXC.set(key, cv); return cv;
}
// an ID plate: full digits, optional tail highlight, optional pill (string / Number)
const PL_W = 2.5, PL_H = 0.42;
function plateTex(str, o = {}) {
  const { tail = 0, tailColor = K.blue, bg = K.white, fg = K.ink, pill = null, pillBg = K.green, pillFg = K.ink, size = 92 } = o;
  return cached(`pl|${str}|${tail}|${bg}|${pill}|${size}`, 1500, 252, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    let x0 = 60;
    if (pill) { g.font = '58px IDXB'; const pw = g.measureText(pill).width + 56; g.fillStyle = pillBg; rr(g, 40, h / 2 - 50, pw, 100, 50); g.fill(); g.fillStyle = pillFg; g.textAlign = 'left'; g.fillText(pill, 68, h / 2 + 21); x0 = 40 + pw + 34; }
    g.font = `${size}px JBM`; g.textAlign = 'left';
    const head = str.slice(0, str.length - tail), tl = str.slice(str.length - tail);
    const wAll = g.measureText(str).width, x = pill ? x0 : (w - wAll) / 2;
    g.fillStyle = fg; g.fillText(head, x, h / 2 + size * 0.36);
    if (tail) { g.fillStyle = tailColor; g.fillText(tl, x + g.measureText(head).width, h / 2 + size * 0.36); }
  });
}
// a short "tail" plate for the sorted wall
const TP_W = 0.98, TP_H = 0.31;
const tailTex = (str, hl) => cached(`tp|${str}|${hl}`, 1000, 300, (g, w, h) => {
  g.fillStyle = K.white; g.fillRect(0, 0, w, h); g.font = '132px JBM'; g.textAlign = 'center';
  const head = str.slice(0, -hl), tl = str.slice(-hl), wa = g.measureText(str).width, x = (w - wa) / 2;
  g.textAlign = 'left'; g.fillStyle = K.ink; g.fillText(head, x, h / 2 + 48); g.fillStyle = K.blue; g.fillText(tl, x + g.measureText(head).width, h / 2 + 48);
});
// the three parts (face sizes follow their bit widths: 0.04 world units per bit)
const BIT = 0.04, SEG_H = 0.62, SEG_D = 0.42;
const SEGS = [
  { key: 'time', title: 'TIME', bits: 41, color: K.blue, side: K.blueDeep, fg: K.white },
  { key: 'machine', title: 'MACHINE', bits: 10, color: K.pale, side: K.gray, fg: K.ink },
  { key: 'counter', title: 'COUNT', bits: 12, color: K.green, side: K.greenDeep, fg: K.ink },
];
const SEG_GAP = 0.06, BAR_W = SEGS.reduce((a, s) => a + s.bits * BIT, 0) + 2 * SEG_GAP;
const segTex = (s, value, sub) => cached(`seg|${s.key}|${value}|${sub}`, Math.round(s.bits * BIT * 1000), Math.round(SEG_H * 1000), (g, w, h) => {
  g.fillStyle = s.color; g.fillRect(0, 0, w, h); g.fillStyle = s.fg; g.textAlign = 'center';
  const fit = (str, size, font) => { g.font = `${size}px ${font}`; const m = g.measureText(str).width; return m > w - 56 ? Math.floor(size * (w - 56) / m) : size; };
  const ts = fit(s.title, s.key === 'time' ? 120 : 92, 'IDXB'); g.font = `${ts}px IDXB`; g.fillText(s.title, w / 2, 150);
  if (value !== '') { const vs = fit(value, s.key === 'time' ? 150 : 200, 'JBM'); g.font = `${vs}px JBM`; g.fillText(value, w / 2, 330 + vs * 0.36); }
  const ss = fit(sub, s.key === 'time' ? 62 : 54, 'InterSB'); g.font = `${ss}px InterSB`; g.globalAlpha = 0.8; g.fillText(sub, w / 2, 560); g.globalAlpha = 1;
});
const towerTex = (n) => cached(`tw|${n}`, 900, 2200, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E4ECF8'); gr.addColorStop(1, K.gray); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = K.blue; rr(g, 230, 120, 440, 380, 60); g.fill();
  g.fillStyle = K.white; g.font = '330px IDXB'; g.textAlign = 'center'; g.fillText(String(n), w / 2, 440);
  g.fillStyle = K.ink; g.font = '96px IDXB'; g.fillText('SERVER', w / 2, 660);
  for (let r = 0; r < 6; r++) { g.fillStyle = 'rgba(3,6,16,0.12)'; rr(g, 110, 790 + r * 210, 680, 150, 26); g.fill(); g.fillStyle = 'rgba(3,6,16,0.32)'; rr(g, 160, 852 + r * 210, 200, 26, 13); g.fill(); }
});
const counterTex = cached('central', 1000, 900, (g, w, h) => {
  g.fillStyle = '#E4ECF8'; g.fillRect(0, 0, w, h); g.fillStyle = K.ink; g.textAlign = 'center';
  g.font = '110px IDXB'; g.fillText('ONE', w / 2, 200); g.fillText('COUNTER', w / 2, 320);
  g.fillStyle = K.ink; rr(g, 120, 440, 760, 280, 40); g.fill(); g.fillStyle = K.white; g.font = '200px JBM'; g.fillText('0042', w / 2, 650);
});

// ================================= world =================================
const TOWER = { w: 0.95, h: 2.2, d: 0.95, z: -1.8, xs: [-1.55, 0, 1.55] };
const HERO_P = [0, 1.05, 0.9];                                          // the plate that splits into three parts
const WALL = { z: 0.55, y0: 1.5, dy: 0.42, xs: [-1.08, 0, 1.08] };    // the sorted 3x3 wall (rows = machines, columns = counter)
const PLATE_PTS = rrectPts(PL_W, PL_H, 0.07, 3), TP_PTS = rrectPts(TP_W, TP_H, 0.06, 3);
function paint(ctx, cam, L) { for (const d of L) if (d.base) d.f(ctx); const R = L.filter((d) => !d.base); R.sort((a, b) => project(cam, b.p).z - project(cam, a.p).z); for (const d of R) d.f(ctx); }

function mixHex(a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function tower(L, cam, idx, o = {}) {
  const { punch = 0, glow = 0, dx = 0, dim = 0 } = o, [sx, sy] = squash(punch), x = TOWER.xs[idx] + dx;
  L.push({ p: [x, 1.1, TOWER.z], f: (ctx) => {
    dropShadow(ctx, cam, [x, 0, TOWER.z + 0.2], 0.75, 0.55, 0.7);
    if (glow > 0.01) lightPool(ctx, cam, [x, 0.01, TOWER.z + 0.9], 1.0, '59,130,246', 0.28 * glow);
    extrude(ctx, cam, { p: [x, TOWER.h / 2 * sy, TOWER.z], sx, sy, pts: rrectPts(TOWER.w, TOWER.h, 0.12, 4), depth: TOWER.d, color: mixHex('#E2EAF6', K.surface, dim), side: mixHex(K.gray, K.surface2, dim), tex: dim > 0.5 ? null : towerTex(idx + 1), texW: TOWER.w, texH: TOWER.h, gloss: 0.2 * (1 - dim), ambient: 0.6 });
  } });
}
function plate(L, cam, p, tex, o = {}) {
  const { yaw = 0, pitch = 0, roll = 0, scale = 1, alpha = 1, shadowK = 0.45, pts = PLATE_PTS, w = PL_W, h = PL_H, depth = 0.09, side = K.gray, color = K.white, noFog = false } = o;
  if (alpha <= 0.01 || scale <= 0.01) return;
  L.push({ p, f: (ctx) => { if (shadowK > 0 && p[1] < 2.4) dropShadow(ctx, cam, [p[0], 0, p[2]], 0.5 * w / PL_W * scale, 0.16 * scale, shadowK * (1 - p[1] / 3));
    extrude(ctx, cam, { p, yaw, pitch, roll, sx: scale, sy: scale, pts, depth, color, side, tex, texW: w, texH: h, gloss: 0.3, alpha, noFog }); } });
}
function centralCounter(L, cam, k) {     // k: 1 = standing, 0 = sunk into the floor
  if (k <= 0.01) return;
  const hgt = 1.6, y = -hgt / 2 + (hgt / 2 + 0.0) * 1 - (1 - k) * (hgt + 0.1);
  L.push({ p: [0, 0.8, -0.6], f: (ctx) => {
    ctx.save(); ctx.beginPath(); const fl = project(cam, [0, 0, -0.6]); ctx.rect(0, 0, W, fl.y + 40); ctx.clip();   // hide what has sunk below the floor
    extrude(ctx, cam, { p: [0, y + hgt / 2, -0.6], pts: rrectPts(1.1, hgt, 0.12, 4), depth: 0.7, color: '#E2EAF6', side: K.gray, tex: counterTex, texW: 1.1, texH: 0.99, gloss: 0.2, ambient: 0.6 });
    ctx.restore();
  } });
}
function segBlock(L, cam, s, p, o = {}) {
  const { value = '', sub = '', lift = 0, dim = 0, punch = 0, scale = 1 } = o; if (scale <= 0.01) return;
  const [sx, sy] = squash(punch), w = s.bits * BIT;
  const q = [p[0], p[1] + lift, p[2]];
  L.push({ p: q, f: (ctx) => {
    dropShadow(ctx, cam, [q[0], 0, q[2]], 0.55 * w + 0.1, 0.2, 0.5 * (1 - dim * 0.6));
    if (lift > 0.02) lightPool(ctx, cam, [q[0], 0.01, q[2] + 0.2], 0.6 + w * 0.3, s.key === 'counter' ? '5,223,114' : '59,130,246', 0.22 * Math.min(1, lift / 0.25));
    extrude(ctx, cam, { p: q, sx: sx * scale, sy: sy * scale, pts: rrectPts(w, SEG_H, 0.06, 3), depth: SEG_D, color: s.color, side: s.side, tex: segTex(s, value, sub), texW: w, texH: SEG_H, gloss: 0.3, alpha: 1 - 0.6 * dim, ambient: 0.55 });
  } });
}
const SPREAD = 0.3;
function segX(j, spread) {                // centre x of part j; spread 0 = touching (one bar), 1 = exploded
  let x = -BAR_W / 2 - spread * SPREAD;
  for (let i = 0; i < j; i++) x += SEGS[i].bits * BIT + SEG_GAP + spread * SPREAD;
  return x + SEGS[j].bits * BIT / 2;
}

// ================================= the story =================================
// hook: the nine same-millisecond IDs fly from their towers past the camera (staggered, already in flight at frame 0)
const HOOK_FLY = [...SAME_MS].sort((a, b) => a.seq - b.seq || a.machine - b.machine).map((x, k) => {   // interleaved: 1, 2, 3, 1, 2, 3, …
  const m = x.machine - 1, te = -1.35 + k * 0.3;
  const side = [-1, 0.25, 1][m], lane = [0.0, 0.55, -0.35][x.seq];
  return { id: x.id, m, te, a: [TOWER.xs[m], 1.25, TOWER.z + 0.6], b: [side * 0.5 + lane * 0.2, -0.9, 3.0 + lane * 0.3] };
});
function hookPlates(t) {
  const out = [];
  for (const f of HOOK_FLY) {
    const k = (t - f.te) / 1.35; if (k <= 0 || k >= 1) continue;
    out.push({ p: hop(f.a, f.b, 0.55, k), tex: plateTex(f.id, { tail: 4 }), yaw: -0.12 * f.b[0], pitch: -0.25 * k, roll: 0.05 * (f.m - 1), scale: back(Math.min(1, k * 4)) * 0.62 });
  }
  return out;
}
function launches(t) { return HOOK_FLY.filter((f) => t >= f.te && t < f.te + 0.25).map((f) => f.m); }

// ================================= cameras =================================
const mixCam = (a, b, k) => ({ eye: mix3(a.eye, b.eye, k), at: mix3(a.at, b.at, k) });
const segC = (j) => [segX(j, 1), HERO_P[1], HERO_P[2]];
const CAM = {
  hook0: { eye: [0.0, 0.7, 4.5], at: [0, 1.05, -1.0] }, hook1: { eye: [0.12, 0.72, 4.25], at: [0, 1.05, -1.0] },
  how: { eye: [0.3, 2.7, 4.6], at: [0, 0.75, -1.2] },
  parts: { eye: [-1.1, 1.6, 4.85], at: [-0.04, 0.95, 0.75] },
  time: { eye: [segC(0)[0] - 0.55, 1.45, 3.75], at: [segC(0)[0] + 0.1, 1.0, 0.9] },
  machine: { eye: [segC(1)[0] - 0.25, 1.4, 3.15], at: [segC(1)[0] + 0.05, 1.0, 0.9] },
  counter: { eye: [segC(2)[0] + 0.45, 1.4, 3.25], at: [segC(2)[0] + 0.05, 1.0, 1.1] },
  proof0: { eye: [0.0, 1.8, 5.7], at: [0, 1.05, -0.2] }, proof1: { eye: [0.1, 1.55, 4.95], at: [0, 1.05, 0.0] },
  pay0: { eye: [0.0, 1.25, 4.75], at: [0, 1.0, 0.9] }, pay1: { eye: [-0.1, 1.25, 4.5], at: [0, 1.0, 0.9] },
};
function camAt(t) {
  const i = wShot(t); let c, fov = 44;
  if (i === SH.hook) c = mixCam(CAM.hook0, CAM.hook1, ease(ev(t, 0, SHOTS[1])));
  else if (i === SH.how) c = mixCam(CAM.hook1, CAM.how, ease(ev(t, SHOTS[i], 1.0)));
  else if (i === SH.parts) c = mixCam(CAM.how, CAM.parts, ease(ev(t, SHOTS[i], 0.8)));
  else if (i === SH.time) c = mixCam(CAM.parts, CAM.time, ease(ev(t, SHOTS[i], 0.6)));
  else if (i === SH.machine) c = mixCam(CAM.time, CAM.machine, ease(ev(t, SHOTS[i], 0.55)));
  else if (i === SH.counter) c = mixCam(CAM.machine, CAM.counter, ease(ev(t, SHOTS[i], 0.55)));
  else if (i === SH.proof) c = mixCam(mixCam(CAM.counter, CAM.proof0, ease(ev(t, SHOTS[i], 0.8))), CAM.proof1, ease(ev(t, SHOTS[i] + 0.8, 3.5)));
  else c = mixCam(CAM.pay0, CAM.pay1, ease(ev(t, SHOTS[i], CTA_AT - SHOTS[i])));
  return camera(c.eye, c.at, fov, 540, CAM_CY);
}
const CAM_CY = 1250;                                                    // content sits in the lower stage, under the headline

const FLOOR = { x: 0, y: -0.6, z: -2.5, w: 40, h: 0.6, d: 40, colors: { top: K.desk, front: K.surface2, left: K.surface2, right: K.surface2 }, color: K.surface2 };
function horizonFog(ctx, cam) {
  const far = project(cam, [cam.eye[0] + cam.f[0] * 18, 0, cam.eye[2] + cam.f[2] * 18]), mid = project(cam, [cam.eye[0] + cam.f[0] * 9, 0, cam.eye[2] + cam.f[2] * 9]);
  if (far.z < 0.2 || mid.z < 0.2) return;
  const g = ctx.createLinearGradient(0, far.y - 60, 0, mid.y); g.addColorStop(0, 'rgba(3,6,16,1)'); g.addColorStop(1, 'rgba(3,6,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, mid.y));
}

// ---- per-shot world builders ----
function buildHookHow(L, cam, t, i) {
  const fire = launches(t);
  const sep = i === SH.how ? ease(ev(t, T.without, 0.6)) : 0;
  for (let m = 0; m < 3; m++) {
    const lastLaunch = Math.max(-9, ...HOOK_FLY.filter((f) => f.m === m && f.te <= t).map((f) => f.te));
    const punch = ev(t, lastLaunch, 0.06) * (1 - ev(t, lastLaunch + 0.06, 0.22));
    tower(L, cam, m, { punch, glow: fire.includes(m) ? 1 : 0.25, dx: (m - 1) * 0.35 * sep });
  }
  if (i === SH.hook) for (const x of hookPlates(t)) plate(L, cam, x.p, x.tex, { yaw: x.yaw, pitch: x.pitch, roll: x.roll, scale: x.scale, shadowK: x.p[1] > 0 ? 0.3 : 0 });
  if (i === SH.how) {
    const rise = back(ev(t, SHOTS[SH.how] + 0.05, 0.4)), sink = easeIn(ev(t, T.without + 0.05, 0.55));
    centralCounter(L, cam, rise * (1 - sink));
  }
}
function buildParts(L, cam, t, i) {
  const sil = i === SH.parts ? ease(ev(t, T.three3, 0.6)) : 1;
  for (let m = 0; m < 3; m++) tower(L, cam, m, { glow: m === 1 ? 0.6 * (1 - sil) : 0, dim: 0.85 * sil, dx: (m - 1) * 0.35 });
  // shot 3: the hero plate pops out of server 2, glows on "one number", splits on "three parts"
  const pop = ev(t, SHOTS[SH.parts] + 0.1, 0.55), split = ev(t, T.three3 - 0.05, 0.3);
  const spread = i === SH.parts ? ease(ev(t, T.parts - 0.05, 0.4)) : 1;
  if (i === SH.parts && split < 1) {
    const p = hop([0, 1.3, TOWER.z + 0.6], HERO_P, 0.45, easeOut(pop));
    plate(L, cam, p, plateTex(HERO.id, { size: 96 }), { scale: back(Math.min(1, pop * 2)) * (1 + 0.06 * ev(t, T.one3, 0.12) * (1 - ev(t, T.one3 + 0.12, 0.3))), w: PL_W, pts: rrectPts(BAR_W, PL_H, 0.07, 3), alpha: 1 - split });
  }
  if (split <= 0) return;
  const focus = i === SH.time ? 0 : i === SH.machine ? 1 : i === SH.counter ? 2 : -1;
  const ctrStep = i === SH.counter ? (t >= T.ms6 - 0.05 ? 2 : t >= T.same6 - 0.05 ? 1 : 0) : 0;
  for (let j = 0; j < 3; j++) {
    const s = SEGS[j], lift = focus === j ? 0.22 * back(ev(t, SHOTS[i] + 0.15, 0.4)) : 0;
    let value = '', sub = `${s.bits} bits`;
    if (j === 0 && i >= SH.time) { const land = ev(t, T.time - 0.1, (T.ms4 + 0.35) - (T.time - 0.1)); const v = HERO.ms_since_epoch - Math.round((1 - easeOut(land)) * 4321); value = fmt(v); sub = 'ms since 4 Nov 2010'; }
    if (j === 1 && i >= SH.machine) value = String(HERO.machine);
    if (j === 2 && i >= SH.counter) value = String(ctrStep);
    if (j === 2 && i > SH.counter) value = '0';
    const punch = (j === 2 && i === SH.counter) ? Math.max(...[T.counter, T.same6, T.ms6].map((c) => ev(t, c - 0.05, 0.06) * (1 - ev(t, c + 0.01, 0.22)))) : 0;
    segBlock(L, cam, s, [segX(j, spread), HERO_P[1], HERO_P[2]], { value, sub, lift, dim: focus >= 0 && focus !== j ? 0.45 : 0, punch, scale: back(Math.min(1, split * 1.4)) });
  }
  // shot 6: three plates from the same machine and millisecond pop out, counter 0, 1, 2
  if (i === SH.counter) {
    const ids = SAME_MS.filter((x) => x.machine === HERO.machine);
    [T.counter, T.same6, T.ms6].forEach((c, k) => {
      const kk = ev(t, c - 0.05, 0.45); if (kk <= 0) return;
      const c2 = segC(2), p = hop([c2[0], c2[1] + 0.4, c2[2] - 0.3], [c2[0] - 0.06 + k * 0.1, 0.8 - k * 0.14, c2[2] + 0.4 + k * 0.05], 0.3, easeOut(kk));   // a floating fan under the COUNT block
      plate(L, cam, p, tailTex('…' + ids[k].id.slice(-7), 1), { pts: TP_PTS, w: TP_W, h: TP_H, scale: 0.5 * back(Math.min(1, kk * 2)), yaw: -0.12, shadowK: 0.35 });
    });
  }
}
function buildProof(L, cam, t) {
  for (let m = 0; m < 3; m++) {
    const lt = [0, 1, 2].map((s) => T.test + 0.35 + (m * 3 + s) * 0.33 * ((T.zero - 0.2 - T.test - 0.35) / (9 * 0.33)));
    const punch = Math.max(...lt.map((c) => ev(t, c, 0.06) * (1 - ev(t, c + 0.06, 0.2))));
    tower(L, cam, m, { punch, glow: lt.some((c) => t > c && t < c + 0.3) ? 1 : 0.2, dx: (m - 1) * 0.35 });
  }
  // the wall frame (a base board behind the plates)
  const rise = back(ev(t, SHOTS[SH.proof] + 0.1, 0.5)), by = (WALL.y0 - WALL.dy) * rise - 1.6 * (1 - rise);
  if (rise > 0.01) L.push({ p: [0, WALL.y0 - WALL.dy, WALL.z - 0.3], base: false, f: (ctx) => {
    ctx.save(); const fl = project(cam, [0, 0, WALL.z]); ctx.beginPath(); ctx.rect(0, 0, W, fl.y + 30); ctx.clip();    // rises out of the floor
    extrude(ctx, cam, { p: [0, by, WALL.z - 0.12], pts: rrectPts(3.42, 1.4, 0.12, 4), depth: 0.08, color: K.surface, side: K.surface2, gloss: 0.08, edge: 'rgba(59,130,246,0.35)', edgeW: 2 });
    ctx.restore(); } });
  const span = (T.zero - 0.2) - (T.test + 0.35);
  SAME_MS.forEach((x, k) => {
    const m = x.machine - 1, s = x.seq, t0 = T.test + 0.35 + k * span / 9, kk = ev(t, t0, 0.5);
    if (kk <= 0) return;
    const dst = [WALL.xs[s], WALL.y0 - m * WALL.dy, WALL.z];
    const p = hop([TOWER.xs[m] + (m - 1) * 0.35, 1.3, TOWER.z + 0.6], dst, 0.4, easeOut(kk));
    const land = ev(t, t0 + 0.5, 0.06) * (1 - ev(t, t0 + 0.56, 0.2));
    const ok = ev(t, T.zero - 0.05, 0.3);
    plate(L, cam, p, tailTex('…' + x.id.slice(-7), m === 1 ? 5 : 4), { pts: TP_PTS, w: TP_W, h: TP_H, scale: 1 - 0.12 * land, shadowK: 0, side: ok > 0.5 ? K.greenDeep : K.gray });
  });
}
function buildPayoff(L, cam, t) {
  const A = PAIR[0], B = PAIR[1];
  const inK = ev(t, SHOTS[SH.payoff] + 0.05, 0.45);
  const toStr = ev(t, T.strings - 0.15, 0.4), toNum = ev(t, T.become - 0.25, 0.4), merge = ease(ev(t, HIT - 0.35, 0.35));
  const flip = (k) => Math.PI * k;              // half-turn flip about the vertical axis; texture swaps when edge-on
  const yA = 1.3, yB = 0.72;
  const texFor = (id, stage) => stage === 0 ? plateTex(id, { tail: 3 }) : stage === 1 ? plateTex(`"${id}"`, { tail: 4, tailColor: K.greenDeep, pill: 'string', pillBg: K.green })
    : plateTex(PAIR_NUM, { tail: 3, tailColor: K.red, pill: 'Number', pillBg: K.red, pillFg: K.white });
  const one = (id, y, which) => {
    let yaw = 0, stage = 0;
    if (toNum > 0) { stage = toNum < 0.5 ? 1 : 2; yaw = flip(toNum < 0.5 ? toNum : toNum - 1); }
    else if (toStr > 0) { stage = toStr < 0.5 ? 0 : 1; yaw = flip(toStr < 0.5 ? toStr : toStr - 1); }
    const yy = which === 1 ? lerp(y, yA, merge) : y, zz = which === 1 ? HERO_P[2] - 0.02 * merge : HERO_P[2];
    const hitK = which === 0 ? ev(t, HIT, 0.06) * (1 - ev(t, HIT + 0.06, 0.25)) : 0;
    const [sx] = squash(hitK);
    plate(L, cam, [0, yy - (1 - easeOut(inK)) * 1.2, zz], texFor(id, stage), { yaw, scale: back(Math.min(1, inK * 1.6)) * sx, pts: rrectPts(PL_W, PL_H, 0.07, 3), side: stage === 2 ? K.redDeep : stage === 1 ? K.greenDeep : K.gray, shadowK: 0.35 });
  };
  one(B, yB, 1); one(A, yA, 0);
  if (merge > 0.01) L.push({ p: [0, 0.01, HERO_P[2]], base: true, f: (ctx) => lightPool(ctx, cam, [0, 0.01, HERO_P[2] + 0.3], 1.1, '251,44,54', 0.16 * merge) });
}
function world(ctx, t) {
  const i = wShot(t), cam = camAt(t);
  floor(ctx, cam, FLOOR, { at: [0, 0, 0], radius: 7, strength: 0.2 });
  horizonFog(ctx, cam);
  const L = [];
  if (i <= SH.how) buildHookHow(L, cam, t, i);
  else if (i <= SH.counter) buildParts(L, cam, t, i);
  else if (i === SH.proof) buildProof(L, cam, t);
  else buildPayoff(L, cam, t);
  paint(ctx, cam, L);
  return { cam, i };
}

// ================================= headlines (one at a time) =================================
const HEAD_CX = 500, HEAD_MAXW = 700, HEAD_OUT = 0.32;   // a headline's 0.3 s exit finishes before its shot cuts
function headlines(ctx, t) {
  if (t < SHOTS[SH.how] + 0.25) {
    const k = 1 - ev(t, SHOTS[SH.how] - 0.05, 0.25);
    ctx.save(); ctx.shadowColor = 'rgba(3,6,16,0.95)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 4;
    const fit = (s, z) => Math.min(z, z * HEAD_MAXW / textW(ctx, s, z, 'IDXB'));
    text(ctx, 'SAME MILLISECOND.', HEAD_CX, 600, { size: fit('SAME MILLISECOND.', 96), font: 'IDXB', alpha: k });
    text(ctx, 'NO REPEATS.', HEAD_CX, 712, { size: 110, font: 'IDXB', color: K.blue, alpha: k });
    ctx.restore();
  }
  const hl = (str, y, size, t0, o) => { const w = textW(ctx, str, size, 'IDXB', -1); kword(ctx, str, HEAD_CX, y, w > HEAD_MAXW ? size * HEAD_MAXW / w : size, t, t0, o); };
  hl('HOW?', 640, 150, T.how - 0.06, { t1: SHOTS[SH.parts] - HEAD_OUT, color: K.blue });
  hl('SNOWFLAKE, 2010', 620, 92, T.snowflake - 0.06, { t1: SHOTS[SH.time] - HEAD_OUT });
  hl('TIME FIRST', 620, 104, T.first - 0.06, { t1: SHOTS[SH.machine] - HEAD_OUT, color: K.blue });
  hl('WHICH MACHINE', 620, 92, VL('L5').t0 - 0.02, { t1: SHOTS[SH.counter] - HEAD_OUT });
  hl('COUNT 0, 1, 2', 620, 100, T.counter - 0.06, { t1: SHOTS[SH.proof] - HEAD_OUT, color: K.green });
  hl('9 IDs. 0 REPEATS.', 620, 96, T.nine - 0.06, { t1: SHOTS[SH.payoff] - HEAD_OUT, color: K.green });
  hl('KEEP IDs AS STRINGS', 612, 84, T.keep - 0.06, { t1: CTA_AT, color: K.green });
}

// ---- captions (upper safe band y 280-460) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Twitter needed ten', 'thousand IDs a second.'] },
  { t0: VL('L2').t0, lines: ['No repeats, without', 'servers coordinating. How?'] },
  { t0: VL('L3').t0, lines: ['In 2010 they built Snowflake:', 'one number, three parts.'] },
  { t0: VL('L4').t0, lines: ['First, the time,', 'to the millisecond.'] },
  { t0: VL('L5').t0, lines: ['Then, which', 'machine made it.'] },
  { t0: VL('L6').t0, lines: ['Then a counter, for IDs', 'in the same millisecond.'] },
  { t0: VL('L7').t0, lines: ['Our test: three machines,', 'the same millisecond,'] },
  { t0: T.nine, lines: ['nine IDs, zero repeats.'] },
  { t0: VL('L8').t0, lines: ['In JavaScript, keep', 'IDs as strings,'] },
  { t0: T.or8, lines: ['or different IDs can', 'become one number.'], tEnd: VL('L9').t0 - 0.05 },
  { t0: VL('L9').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (const c of CAPS) c.t0 -= 0.06;
for (let i = 0; i < CAPS.length; i++) if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0;
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 284, CAPTION_BOTTOM = 456, CAPTION_MAXW = 760, CAPTION_CX = 500;
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

// ---- CTA — the accepted English end card, unchanged ----
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
  add(0.0, 'blip', { hi: true });
  for (const f of HOOK_FLY) if (f.te >= 0 && f.te < SHOTS[1]) add(f.te, 'hop', { hi: f.m === 1 });
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(SHOTS[SH.how] + 0.05, 'pop'); add(T.without + 0.05, 'slide'); add(T.how - 0.06, 'type');
  add(SHOTS[SH.parts] + 0.1, 'hop'); add(T.snowflake - 0.06, 'type'); add(T.three3 - 0.05, 'stamp'); add(T.parts - 0.05, 'slide', { soft: true });
  add(T.time - 0.06, 'type'); for (let k = 0; k < 6; k++) add(T.time + k * ((T.ms4 + 0.35 - T.time) / 6), 'tick');
  add(T.machine5 - 0.06, 'pop');
  for (const c of [T.counter, T.same6, T.ms6]) { add(c - 0.05, 'clack'); add(c + 0.1, 'hop'); }
  const span = (T.zero - 0.2) - (T.test + 0.35);
  for (let k = 0; k < 9; k++) { add(T.test + 0.35 + k * span / 9, 'hop', { hi: k % 3 === 1 }); add(T.test + 0.85 + k * span / 9, 'clack', { soft: true }); }
  add(T.nine - 0.06, 'type'); add(T.zero - 0.05, 'chime');
  add(SHOTS[SH.payoff] + 0.05, 'pop'); add(T.keep - 0.06, 'type'); add(T.strings - 0.15, 'swish2', { soft: true }); add(T.strings + 0.1, 'confirm');
  add(T.become - 0.25, 'swish2', { soft: true }); add(HIT, 'reject');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame ----
const STAGE_TOP = 480, WIPE = 0.5;
const bg = makeBackground();
function wipeBetween(ctx, t, tw, drawA, drawB) {
  const k = (t - (tw - WIPE / 2)) / WIPE;
  if (k < 0) { drawA(); return; }
  if (k >= 1) { drawB(); return; }
  const e = ease(k), band = 220, edge = lerp(H + band, STAGE_TOP - band, e);
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); drawA(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); drawB(); ctx.restore();
  ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
}
function scene(ctx, t) { const info = world(ctx, t); if (!process.env.NO_HEADLINE) headlines(ctx, t, info); }
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  if (t < CTA_AT - WIPE / 2) scene(ctx, t);
  else wipeBetween(ctx, t, CTA_AT, () => scene(ctx, t), () => cta(ctx, t));
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}

// ---- thumbnail: frame zero + the wordmark ----
export function drawThumbnail(ctx) {
  const prev = process.env.NO_CAPTION; process.env.NO_CAPTION = '1';
  drawFrame(ctx, 0);
  if (prev === undefined) delete process.env.NO_CAPTION; else process.env.NO_CAPTION = prev;
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 330, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 382, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 382, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
