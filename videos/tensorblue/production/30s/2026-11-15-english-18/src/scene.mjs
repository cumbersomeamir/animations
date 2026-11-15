// Tensorblue 30s english-18 · episode 01 — "Ten seconds. One song." (how Shazam's audio fingerprinting finds a recording)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`, unchanged).
// World A (café): a phone on a café table catches a 10-second "sound shard" — a glass plate whose spectrogram
// stands up as blue terrain; it collapses into star-like peak pegs; one pair of peaks becomes a hash card.
// World B (database): six songs lie as star-chart lanes (time runs away from us); the shard's hashes rain down as
// hit cubes, mostly at random spots, until 21 stack at one offset on track 3; the shard docks there and its song
// stars line up. A hummed version finds no stack. Every peak, hash, hit and offset comes from
// demo/out/fingerprint-demo.json (our implementation of the method in Wang 2003, on made-up music and café noise).
// Colours: Tensorblue palette + tensorblue.com's own cyan-400 / amber-400 tokens. Cues from voice-timing.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, back, ev, rr, text, textW, shadow, kword, makeBackground,
} from './brt.mjs';
import { camera, project, drawBox, contactShadow, floor, bez, mix3, shadeHex, norm, sub, dot } from './stage3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the test's result ------------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/fingerprint-demo.json'), 'utf8'));
const R = DEMO.result, VIS = DEMO.visual, EX = DEMO.example_hash;
const MATCH_TRACK = R.best_track, OFFSET = R.found_offset_s;
const ALIGNED = VIS.track_offsets_s[String(MATCH_TRACK)].filter((o) => Math.abs(o - OFFSET) <= 0.05).length;
if (MATCH_TRACK !== 3 || Math.abs(OFFSET - 37.02) > 0.01 || R.best_score !== 21 || ALIGNED !== 21 || R.runner_up_score !== 4 || DEMO.hum.best_score !== 2
  || EX.f1_hz !== 625 || EX.f2_hz !== 1242 || EX.gap_s !== 0.58) throw new Error('demo result changed');

// ---- colours: Tensorblue palette + tensorblue.com's own Tailwind tokens (cyan-400, amber-400) ----
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610',
  cyan: '#00D3F2', amber: '#FFB900' };
const mixHex = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join(''); };

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  ten: VW('L1', 'ten'), cafe: VW('L1', 'cafe'), and1: VW('L1', 'and'), shazam: VW('L1', 'shazam'), song: VW('L1', 'song'),
  trick: VW('L2', 'trick'), turn: VW('L2', 'turn'), sound: VW('L2', 'sound'), stars: VW('L2', 'stars'),
  shazams: VW('L3', "shazam's"), paper: VW('L3', 'paper'), keeps: VW('L3', 'keeps'), loudest: VW('L3', 'loudest'), peaks3: VW('L3', 'peaks'),
  pairs: VW('L4', 'pairs'), hashes: VW('L4', 'hashes'), two: VW('L4', 'two'), frequencies: VW('L4', 'frequencies'), gap: VW('L4', 'gap'), between: VW('L4', 'between'),
  look: VW('L5', 'look'), noise: VW('L5', 'noise'), random: VW('L5', 'random'), hits5: VW('L5', 'hits'),
  right: VW('L6', 'right'), recording6: VW('L6', 'recording'), the6: VW('L6', 'the', 2), share: VW('L6', 'share'), one: VW('L6', 'one'), offset: VW('L6', 'offset'),
  so: VW('L7', 'so'), matches: VW('L7', 'matches'), exact: VW('L7', 'exact'), humming: VW('L7', 'humming'), melody: VW('L7', 'melody-based'), search: VW('L7', 'search'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.15, VL('L3').t0 - 0.15, VL('L4').t0 - 0.15, VL('L5').t0 - 0.15, VL('L6').t0 - 0.1, T.matches + 0.1, CTA_AT, 30.01];   // the payoff pull-back waits for the docking close-up
const SH = { hook: 0, stars: 1, peaks: 2, hash: 3, lookup: 4, offset: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- camera (world A = café, shots 0–3; world B = database, shots 4–6) ----------------------------------
const POSES = [
  { eye: [0.0, 2.9, 7.6], at: [0.0, 1.5, 0.2], fov: 37 },          // hook: the café table, the phone, the sound shard
  { eye: [0.0, 2.5, 5.6], at: [0.0, 1.45, 0.0], fov: 40 },         // closer: sound → stars
  { eye: [0.0, 2.3, 4.9], at: [0.0, 1.4, 0.0], fov: 40 },          // the stars only (loudest peaks)
  { eye: [-0.3, 2.7, 5.2], at: [-0.1, 1.75, 0.0], fov: 40 },       // a pair of peaks → a hash card
  { eye: [0.0, 6.4, 9.6], at: [0.0, 0.0, -0.6], fov: 42 },         // database: hashes rain onto six songs
  { eye: [-1.2, 5.6, 5.4], at: [-0.5, 0.3, -2.4], fov: 40 },       // track 3: the hits stack at one offset; the shard docks
  { eye: [0.0, 7.2, 9.8], at: [0.0, 1.4, -1.2], fov: 42 },         // payoff (slow crane), hummed version
];
const MOVE = [0, 0.8, 0.7, 0.7, 0, 0.8, 0.9];
const CLOSE = { eye: [-0.5, 2.3, -0.2], at: [-0.5, 0.1, -3.5], fov: 40 };   // push-in on track 3 at the offset: the stars line up
const shotEnd = (i) => (i === SH.offset ? CLOSE : POSES[i]);
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0 || MOVE[i] === 0) return camera(p.eye, p.at, p.fov);
  const q = shotEnd(i - 1), k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k), at = mix3(q.at, p.at, k), fov = lerp(q.fov, p.fov, k);
  if (i === SH.offset) { const c = ease(ev(t, T.offset + 0.05, 0.7)); eye = mix3(eye, CLOSE.eye, c); at = mix3(at, CLOSE.at, c); fov = lerp(fov, CLOSE.fov, c); }
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [1.0, 7.6, 9.6], c * k); }
  return camera(eye, at, fov);
}

// ---- small helpers --------------------------------------------------------------------------------
const LIGHT = norm([-0.45, 0.85, 0.4]);
function poly(ctx, sp) { ctx.beginPath(); ctx.moveTo(sp[0].x, sp[0].y); for (let i = 1; i < sp.length; i++) ctx.lineTo(sp[i].x, sp[i].y); ctx.closePath(); }
// a vertical cylinder (n flat sides, lit like the box faces): table, saucer, cup
function drawCyl(ctx, cam, o) {
  const n = o.n || 32, amb = o.ambient ?? 0.6;
  const ring = (y, r = o.r) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [o.x + r * Math.cos(a), y, o.z + r * Math.sin(a)]; });
  const B = ring(o.y), Tp = ring(o.y + o.h), faces = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = ((i + 0.5) / n) * Math.PI * 2, nr = [Math.cos(a), 0, Math.sin(a)];
    const cen = [o.x + o.r * Math.cos(a), o.y + o.h / 2, o.z + o.r * Math.sin(a)];
    if (dot(nr, sub(cam.eye, cen)) <= 0) continue;
    faces.push({ pts: [Tp[i], Tp[j], B[j], B[i]], nr, z: dot(sub(cen, cam.eye), cam.f) });
  }
  faces.sort((p, q) => q.z - p.z);
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  for (const f of faces) {
    const sp = f.pts.map((p) => project(cam, p)); if (sp.some((p) => p.z < 0.2)) continue;
    ctx.fillStyle = shadeHex(o.side || o.color, amb + (1 - amb) * Math.max(0, dot(f.nr, LIGHT))); poly(ctx, sp); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();                         // hides seams between sides
  }
  if (cam.eye[1] > o.y + o.h) {
    ctx.fillStyle = shadeHex(o.top || o.color, amb + (1 - amb) * LIGHT[1]); poly(ctx, Tp.map((p) => project(cam, p))); ctx.fill();
    if (o.inner) { ctx.fillStyle = o.inner; poly(ctx, ring(o.y + o.h + 0.001, o.r * 0.84).map((p) => project(cam, p))); ctx.fill(); }
  }
  ctx.restore();
}
function cylShadow(ctx, cam, o, a = 0.4) {
  const pts = Array.from({ length: 24 }, (_, i) => { const q = (i / 24) * Math.PI * 2; return project(cam, [o.x + 0.12 + (o.r + 0.12) * Math.cos(q), o.y0 ?? 0.002, o.z + 0.1 + (o.r + 0.12) * Math.sin(q)]); });
  ctx.save(); ctx.filter = 'blur(10px)'; ctx.globalAlpha = a; ctx.fillStyle = '#000'; poly(ctx, pts); ctx.fill(); ctx.restore();
}
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
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
// café chatter: a pale speech bubble with "…" (screen-space, anchored to a 3D point)
function bubble(ctx, cam, p, k, t, phase, flip) {
  if (k <= 0) return; const s = project(cam, p); if (s.z < 0.2) return;
  const sc = (cam.focal / s.z) * 0.0042 * (1 + 0.06 * Math.sin(t * 7 + phase));
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(s.x, s.y); ctx.rotate(0.06 * Math.sin(t * 4 + phase)); ctx.scale(sc * back(k), sc * back(k));
  shadow(ctx, 0, 70, 80, 12, 0.35);
  ctx.fillStyle = SITE.gray; rr(ctx, -90, -50, 180, 100, 46); ctx.fill();
  ctx.beginPath(); const fx = flip ? -1 : 1; ctx.moveTo(fx * 18, 40); ctx.lineTo(fx * 52, 80); ctx.lineTo(fx * 52, 38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SITE.ink; [-38, 0, 38].forEach((x, i) => { ctx.beginPath(); ctx.arc(x, 2 - 6 * Math.max(0, Math.sin(t * 9 + phase + i)), 11, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

// ---- the sound shard: a glass plate holding the clip's spectrogram (terrain) or its peaks (stars) --------
const F_LO = 78, F_HI = 3437;
const vOf = (f) => clamp((f - F_LO) / (F_HI - F_LO));
const PEAKS = VIS.sample_peaks.map(([ts, f, song]) => ({ u: ts / 10, v: vOf(f), song, ts, f }));
const HUMP = VIS.hum_peaks.map(([ts, f]) => ({ u: ts / 10, v: vOf(f) }));
const ANCHOR = PEAKS.findIndex((p) => Math.abs(p.ts - EX.anchor_t_s) < 0.02 && p.f === EX.f1_hz);
const TARGET = PEAKS.findIndex((p) => Math.abs(p.ts - (EX.anchor_t_s + EX.gap_s)) < 0.04 && p.f === EX.f2_hz);
if (ANCHOR < 0 || TARGET < 0) throw new Error('example hash peaks not found');
const GRID = VIS.terrain_40x16;
function shardPt(P, u, v, w) {                     // u: time 0..1, v: frequency 0..1, w: height above the plate
  const lx = (u - 0.5) * P.L, lz = (0.5 - v) * P.D, ly = w + P.h;
  const cp = Math.cos(P.pitch || 0), sp = Math.sin(P.pitch || 0), cy = Math.cos(P.yaw || 0), sy = Math.sin(P.yaw || 0);
  const y1 = ly * cp - lz * sp, z1 = ly * sp + lz * cp;
  return [P.x + lx * cy + z1 * sy, P.y + y1, P.z - lx * sy + z1 * cy];
}
// draws the plate and everything standing on it; o: { terrain 0..1, stars 0..1, pegColor(i), pegH(i), pegAlpha(i), list }
function drawShard(ctx, cam, P, o) {
  const s = P.L / 3.0;
  drawBox(ctx, cam, { x: P.x, y: P.y, z: P.z, w: P.L, h: P.h, d: P.D, pitch: P.pitch, yaw: P.yaw, color: SITE.surface, colors: { top: SITE.deep }, alpha: P.alpha ?? 0.94, edge: 'rgba(216,227,245,0.85)', ambient: 0.9 });   // dark glass: the peaks read as stars
  const items = [];
  if (o.terrain > 0.01) {
    for (let i = 0; i < 40; i++) for (let j = 0; j < 16; j++) {
      const g = GRID[i][j]; const hh = g * 0.5 * s * o.terrain * (1 + (o.live || 0) * 0.14 * Math.sin(o.t * 6.5 + i * 0.55 + j * 0.3));
      if (hh < 0.012) continue;
      const pos = shardPt(P, (i + 0.5) / 40, (j + 0.5) / 16, 0);
      const col = mixHex(SITE.logo, SITE.cyan, g);
      items.push({ x: pos[0], y: pos[1], z: pos[2], w: (P.L / 40) * 0.84, h: hh, d: (P.D / 16) * 0.84, pitch: P.pitch, yaw: P.yaw, color: col, colors: { top: mixHex(col, SITE.white, 0.3) }, ambient: 0.62 });
    }
  }
  const list = o.list || PEAKS;
  if (o.stars > 0.001) list.forEach((pk, i) => {
    const k = o.stagger ? clamp((o.stars - pk.u * 0.35) / 0.65) : o.stars;
    const hh = (o.pegH ? o.pegH(i) : 0.07) * s * back(k); if (hh < 0.005) return;
    const pos = shardPt(P, pk.u, pk.v, 0), col = o.pegColor ? o.pegColor(i) : SITE.white;
    items.push({ x: pos[0], y: pos[1], z: pos[2], w: 0.058 * s * (o.pegW ? o.pegW(i) : 1), h: hh, d: 0.058 * s * (o.pegW ? o.pegW(i) : 1), pitch: P.pitch, yaw: P.yaw, color: mixHex(col, SITE.ink, 0.12), colors: { top: col }, alpha: o.pegAlpha ? o.pegAlpha(i) : 1, ambient: 0.75 });
  });
  items.map((b) => ({ b, z: project(cam, [b.x, b.y, b.z]).z })).sort((a, b) => b.z - a.z).forEach(({ b }) => drawBox(ctx, cam, b));
}

// ---- world A: the café ----------------------------------------------------------------------------
const BENCH = { x: 0, y: -0.6, z: -1.0, w: 26, h: 0.6, d: 22, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const TABLE = { x: 0, y: 0, z: 0.2, r: 2.5, h: 0.16, color: SITE.pale, top: SITE.pale, side: SITE.gray };
const PHONE = { x: 0.8, y: 0.16, z: 1.75, w: 0.86, h: 0.07, d: 1.7, yaw: -0.22 };
const CUP = { x: -1.75, z: 0.9 };
const PHONE_TEX = cached('phone', 344, 680, (g, w, h) => {
  g.fillStyle = SITE.deep; g.fillRect(0, 0, w, h);
  g.fillStyle = SITE.gray; g.font = '34px InterB'; g.textAlign = 'center'; g.fillText('LISTENING', w / 2, 170);
  g.fillStyle = SITE.white; g.font = '120px IDXB'; g.fillText('0:10', w / 2, 360);
  g.fillStyle = '#1A2740'; rr(g, 50, 430, w - 100, 22, 11); g.fill();
  g.fillStyle = SITE.cyan; rr(g, 50, 430, w - 100, 22, 11); g.fill();
});
const hashTex = cached('hash', 640, 400, (g, w, h) => {
  g.fillStyle = SITE.white; rr(g, 0, 0, w, h, 40); g.fill();
  g.save(); rr(g, 0, 0, w, h, 40); g.clip(); g.fillStyle = SITE.amber; g.fillRect(0, 0, w, 104); g.restore();
  g.fillStyle = SITE.ink; g.font = '68px IDXB'; g.textAlign = 'center'; g.fillText('HASH', w / 2, 76);
  g.font = '76px IDXB'; g.fillText(`${EX.f1_hz} + ${EX.f2_hz} Hz`, w / 2, 222);
  g.fillStyle = '#5B6B86'; g.font = '66px IDXB'; g.fillText(`gap ${EX.gap_s} s`, w / 2, 328);
});
function shardA(t) {                                // pose of the shard in the café
  const bob = 0.05 * Math.sin(t * 2.4);
  const P = { x: 0, y: 1.35 + bob, z: -0.1, L: 3.2, D: 1.5, h: 0.06, pitch: 1.15, yaw: 0, alpha: 0.94 };   // stands up like a spectrogram panel facing us
  const up = easeIn2(ev(t, SHOTS[SH.lookup] - 0.32, 0.3));           // leaves upward just before the wipe
  P.y += up * 3.2;
  return P;
}
const easeIn2 = (k) => k * k;
// a few hashes from the clip (song and café pairs) that pop up as mini cards: every pair makes one
const MINI = Array.from({ length: 12 }, (_, i) => PEAKS[(i * 97 + 13) % PEAKS.length]);
function worldA(ctx, t) {
  const cam = camAt(Math.min(t, SHOTS[SH.lookup] - 1e-3));
  floor(ctx, cam, BENCH, { at: [0, 0, 0.3], radius: 7, strength: 0.24 });
  cylShadow(ctx, cam, TABLE, 0.45);
  drawCyl(ctx, cam, TABLE);
  // cup on a saucer (black coffee = deep navy), phone
  drawCyl(ctx, cam, { x: CUP.x, y: 0.16, z: CUP.z, r: 0.56, h: 0.05, color: SITE.white, side: SITE.pale });
  drawBox(ctx, cam, { x: CUP.x + 0.43, y: 0.36, z: CUP.z, w: 0.16, h: 0.24, d: 0.08, color: SITE.white, ambient: 0.7 });
  drawCyl(ctx, cam, { x: CUP.x, y: 0.21, z: CUP.z, r: 0.36, h: 0.52, color: SITE.white, side: SITE.pale, inner: SITE.deep });
  contactShadow(ctx, cam, PHONE, 0.45, 0.06, 0.16);
  drawBox(ctx, cam, { ...PHONE, color: '#1A2740', colors: { top: SITE.deep }, tex: { top: PHONE_TEX }, edge: 'rgba(216,227,245,0.35)', ambient: 0.8 });
  // the sound shard (and its soft shadow on the table)
  const P = shardA(t);
  contactShadow(ctx, cam, { x: P.x, y: P.y, z: P.z + 0.15, w: P.L, h: 0.1, d: 0.7, alpha: 1 - ev(t, SHOTS[SH.lookup] - 0.32, 0.25) }, 0.35, 0.2, 0.16);
  const terrain = 1 - ease(ev(t, T.stars - 0.2, 0.45));
  const stars = ev(t, T.stars - 0.1, 0.6);
  const pair = ev(t, T.pairs - 0.05, 0.3), loud = Math.sin(Math.PI * ev(t, T.loudest - 0.05, 0.45));
  drawShard(ctx, cam, P, {
    t, terrain, live: 1 - ev(t, T.trick, 0.4), stars, stagger: true,
    pegColor: (i) => (i === ANCHOR || i === TARGET) && pair > 0 ? mixHex(SITE.white, SITE.amber, pair) : SITE.white,
    pegH: (i) => ((i === ANCHOR || i === TARGET) ? 0.07 + 0.08 * back(pair) : 0.07) * (1 + 0.8 * loud),
    pegW: (i) => (i === ANCHOR || i === TARGET) ? 1 + 1.2 * pair : 1,
  });
  // the hash card rises out of the pair, facing us
  const hk = back(ev(t, T.hashes - 0.15, 0.45));
  if (hk > 0.01) {
    const m = shardPt(P, (PEAKS[ANCHOR].u + PEAKS[TARGET].u) / 2, 1.0, 0), pulse = 1 + 0.06 * Math.sin(Math.PI * ev(t, T.two, 0.35)) + 0.06 * Math.sin(Math.PI * ev(t, T.gap, 0.35));
    const sc = hk * pulse * (1 - 0.8 * ease(ev(t, T.between + 0.12, 0.25)));
    drawBox(ctx, cam, { x: clamp(m[0], -0.6, 0.6), y: m[1] + 0.12 + 0.18 * hk, z: m[2] + 0.45, w: 1.5 * sc, h: 0.94 * sc, d: 0.06, color: SITE.white, colors: { back: SITE.gray, left: SITE.gray, right: SITE.gray, top: SITE.gray }, tex: { front: hashTex }, ambient: 0.85, edge: 'rgba(3,6,16,0.2)' });
  }
  // …and every other pair makes one too (small cards)
  MINI.forEach((pk, i) => {
    const k = back(ev(t, T.between + 0.02 + i * 0.02, 0.25)); if (k <= 0) return;
    const p = shardPt(P, pk.u, pk.v, 0.15 + 0.6 * ease(ev(t, T.between + 0.1 + i * 0.02, 0.6)));
    drawBox(ctx, cam, { x: p[0], y: p[1], z: p[2], w: 0.2 * k, h: 0.13 * k, d: 0.03, color: SITE.amber, ambient: 0.85 });
  });
  // café chatter
  const chat = 1 - ev(t, T.keeps, 0.4);
  bubble(ctx, cam, [-2.15, 1.55, -0.9], chat, t, 0.0, false);
  bubble(ctx, cam, [2.25, 1.3, -0.6], chat, t, 2.1, true);
  // labels
  const pl = shardPt(P, 0.5, 0, 0), ptop = shardPt(P, 0.5, 1, 0);
  tag(ctx, cam, pl, 'TIME →', ev(t, T.shazams, 0.3) * (1 - ev(t, T.loudest - 0.3, 0.2)), { dy: 60 });
  tag(ctx, cam, shardPt(P, 0, 0.5, 0), 'FREQUENCY ↑', ev(t, T.paper, 0.3) * (1 - ev(t, T.loudest - 0.3, 0.2)), { dx: -40 });
  tag(ctx, cam, ptop, 'LOUDEST PEAKS', ev(t, T.loudest - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.hash] - 0.1, 0.2)), { fill: SITE.white, dy: -60 });
  // frame-zero words (already on screen at t = 0)
  if (t < T.trick - 0.25) {
    const k = 1 - ev(t, T.trick - 0.6, 0.3);
    text(ctx, 'TEN SECONDS.', 540, 690, { size: 112, font: 'IDXB', alpha: k });
    text(ctx, 'ONE SONG.', 540, 812, { size: 112, font: 'IDXB', color: SITE.cyan, alpha: k });
  }
}

// ---- world B: the database of songs as star-chart lanes (time runs away from us) ---------------------
const N_LANES = 6, LANE_W = 0.72, LANE_H = 0.1, Z0 = 3.0, PER_S = 0.15, SEG_S = 5;
const laneX = (i) => -2.5 + i;                                  // i = 0..5 → tracks 1..6
const zOf = (sec) => Z0 - sec * PER_S;
const SEGMENTS = [];
for (let i = 0; i < N_LANES; i++) {
  const pk = VIS.track_peaks[String(i + 1)];
  for (let s0 = 0; s0 < 60; s0 += SEG_S) {
    const tex = createCanvas(144, SEG_S * 30), g = tex.getContext('2d');
    g.fillStyle = SITE.deep; g.fillRect(0, 0, 144, SEG_S * 30);
    g.fillStyle = 'rgba(216,227,245,0.85)';
    for (const [ts, f] of pk) if (ts >= s0 && ts < s0 + SEG_S) { g.beginPath(); g.arc((1 - vOf(f)) * 144, (s0 + SEG_S - ts) * 30, 2.6, 0, Math.PI * 2); g.fill(); }
    SEGMENTS.push({ lane: i, x: laneX(i), y: 0, z: zOf(s0 + SEG_S / 2), w: LANE_W, h: LANE_H, d: SEG_S * PER_S, color: SITE.surface2, colors: { top: SITE.deep }, tex: { top: tex }, ambient: 0.85 });
  }
}
// hits: every hash that found a match, at the offset it implies; piles per 0.1 s
function makeHits(offsetsBy, tStart, tEnd, seed, alignedLater) {
  const hits = [], piles = new Map();
  let r = seed; const rnd = () => ((r = (r * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (const [k, offs] of Object.entries(offsetsBy)) for (const o of offs) {
    if (o < 0) continue;                                    // would start before the song: chance hits, not drawn (counted in the notes)
    const lane = Number(k) - 1, aligned = alignedLater && lane === MATCH_TRACK - 1 && Math.abs(o - OFFSET) <= 0.05;
    const key = `${lane}|${aligned ? 'A' : Math.round(o / 0.1)}`, n = piles.get(key) || 0; piles.set(key, n + 1);
    hits.push({ lane, o: aligned ? OFFSET : o, n, aligned, r: rnd() });
  }
  const rand = hits.filter((h) => !h.aligned).sort((a, b) => a.r - b.r), al = hits.filter((h) => h.aligned).sort((a, b) => a.n - b.n);
  rand.forEach((h, i) => { h.t0 = tStart + (i / rand.length) * (tEnd - tStart); });
  return { rand, al };
}
const HITS = makeHits(VIS.track_offsets_s, T.look + 0.1, T.hits5 + 0.25, 7, true);
HITS.al.forEach((h, i) => { h.t0 = T.share - 0.45 + i * (1.0 / HITS.al.length); });
const HUMHITS = makeHits(VIS.hum_offsets_s, T.humming + 0.35, T.search - 0.1, 11, false);
const CUBE = 0.12;
const HOVER = { x: 0, y: 1.9, z: 2.6, L: 1.5, D: LANE_W, h: 0.03, pitch: 0, yaw: Math.PI / 2, alpha: 0.94 };
const DOCK = { ...HOVER, x: laneX(MATCH_TRACK - 1), y: LANE_H + 0.004, z: zOf(OFFSET) - HOVER.L / 2 };
function shardB(t) {
  const enter = ease(ev(t, SHOTS[SH.lookup], 0.45));
  const P = { ...HOVER, y: HOVER.y + (1 - enter) * 3 };
  const dk = ease(ev(t, T.offset + 0.25, 0.55));
  if (dk > 0) {
    const p = bez([HOVER.x, HOVER.y, HOVER.z], [HOVER.x, HOVER.y + 0.6, HOVER.z - 1.5], [DOCK.x, DOCK.y + 1.2, DOCK.z + 1.0], [DOCK.x, DOCK.y, DOCK.z], dk);
    P.x = p[0]; P.y = p[1]; P.z = p[2];
  }
  return { P, docked: ev(t, T.offset + 0.75, 0.25) };
}
function hitCube(h, t, src, color, flight = 0.45) {
  const k = ev(t, h.t0, flight); if (k <= 0) return null;
  const end = [laneX(h.lane), LANE_H + h.n * CUBE * 1.02, zOf(h.o)];
  const p = k >= 1 ? end : bez(src, [src[0], src[1] + 1.0, src[2]], [end[0], end[1] + 1.4, end[2] + 0.4], end, ease(k));
  const sz = h.aligned ? CUBE * 1.4 : CUBE;
  return { x: p[0], y: p[1], z: p[2], w: sz, h: CUBE, d: sz, color: k >= 1 ? color : SITE.amber, ambient: 0.7 };
}
function worldB(ctx, t) {
  const cam = camAt(Math.max(t, SHOTS[SH.lookup]));
  floor(ctx, cam, BENCH, { at: [0, 0, -1.2], radius: 8, strength: 0.22 });
  for (let i = 0; i < N_LANES; i++) {
    const glow = i === MATCH_TRACK - 1 ? ev(t, T.offset + 0.75, 0.3) : 0;
    drawBox(ctx, cam, { x: laneX(i), y: 0, z: zOf(30), w: LANE_W + 0.03, h: LANE_H - 0.004, d: 60 * PER_S + 0.03, color: SITE.surface2, edge: glow > 0 ? `rgba(0,211,242,${0.3 + 0.6 * glow})` : 'rgba(216,227,245,0.28)', ambient: 0.8 });
  }
  for (const sg of SEGMENTS) {
    drawBox(ctx, cam, sg);
  }
  const { P, docked } = shardB(t);
  // hit cubes (sink away when the shard docks)
  const sink = ev(t, T.offset + 0.2, 0.35), src = [HOVER.x, HOVER.y + 0.2, HOVER.z];
  const cubes = [];
  for (const h of HITS.rand) { const c = hitCube(h, t, src, SITE.blue); if (c) cubes.push({ ...c, y: c.y - sink * 0.5, alpha: 1 - sink }); }
  for (const h of HITS.al) { const c = hitCube(h, t, src, SITE.cyan, 0.35); if (c) cubes.push({ ...c, y: c.y - sink * 2.6, alpha: 1 - sink }); }
  const humOn = ev(t, T.humming - 0.1, 0.35), humGone = ev(t, CTA_AT - 0.5, 0.3);
  if (humOn > 0) for (const h of HUMHITS.rand) { const c = hitCube(h, t, [HOVER.x, HOVER.y + 0.2, HOVER.z], SITE.blue); if (c) cubes.push({ ...c, alpha: 1 - humGone }); }
  cubes.filter((c) => c.alpha > 0.01).map((c) => ({ c, z: project(cam, [c.x, c.y, c.z]).z })).sort((a, b) => b.z - a.z).forEach(({ c }) => drawBox(ctx, cam, c));
  // the clip's shard: hovers, then docks on track 3 at the offset; its song stars light up cyan
  drawShard(ctx, cam, P, {
    t, terrain: 0, stars: 1, pegW: () => 0.75,
    pegColor: (i) => mixHex(SITE.white, PEAKS[i].song ? SITE.cyan : SITE.gray, docked),
    pegAlpha: (i) => PEAKS[i].song ? 1 : 1 - 0.65 * docked,
    pegH: (i) => 0.07 * (PEAKS[i].song ? 1 + 1.2 * docked : 1 - 0.4 * docked),
  });
  // the hummed version: same tune, different stars
  if (humOn > 0) {
    const Ph = { ...HOVER, y: HOVER.y + (1 - ease(humOn)) * 2.5, alpha: 0.94 * (1 - humGone) };
    drawShard(ctx, cam, Ph, { t, terrain: 0, stars: back(humOn) * (1 - humGone), list: HUMP, pegColor: () => SITE.amber, pegW: () => 0.75 });
  }
  // labels
  const towerTop = [laneX(MATCH_TRACK - 1), LANE_H + 21 * CUBE, zOf(OFFSET)];
  tag(ctx, cam, [0, LANE_H, zOf(30)], 'RANDOM HITS', ev(t, T.random - 0.05, 0.3) * (1 - ev(t, T.right, 0.2)), { dy: -90 });
  tag(ctx, cam, towerTop, `${ALIGNED} HITS AT ${Math.round(OFFSET)} s`, ev(t, T.share + 0.5, 0.3) * (1 - ev(t, T.offset + 0.25, 0.2)), { fill: SITE.cyan, dy: -60 });
  tag(ctx, cam, [laneX(MATCH_TRACK - 1), LANE_H, zOf(OFFSET) + 0.05], `TRACK ${MATCH_TRACK} ✓`, ev(t, T.matches - 0.2, 0.3) * (1 - ev(t, T.humming - 0.2, 0.2)), { fill: SITE.cyan, dy: 80 });
  tag(ctx, cam, [HOVER.x, HOVER.y, HOVER.z], 'HUMMED', ev(t, T.humming - 0.05, 0.3) * (1 - ev(t, CTA_AT - 0.5, 0.2)), { fill: SITE.amber, dy: 120 });
  // payoff words
  kword(ctx, 'EXACT RECORDING,', 540, 690, 92, t, T.exact - 0.05, { t1: CTA_AT });
  kword(ctx, 'NOT THE TUNE.', 540, 800, 100, t, T.search - 0.1, { color: SITE.cyan, t1: CTA_AT });
}

// ---- captions ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Ten seconds in', 'a noisy cafe,'] },
  { t0: T.and1, lines: ['and Shazam', 'names the song.'] },
  { t0: VL('L2').t0, lines: ['The trick?'] },
  { t0: T.turn, lines: ['Turn sound into stars.'] },
  { t0: VL('L3').t0, lines: ["Shazam's 2003 paper"] },
  { t0: T.keeps, lines: ['keeps only the loudest', 'frequency peaks.'] },
  { t0: VL('L4').t0, lines: ['Pairs of peaks', 'become hashes:'] },
  { t0: T.two, lines: ['two frequencies', 'and the gap between.'] },
  { t0: VL('L5').t0, lines: ['Look them up, and noise', 'makes random hits,'] },
  { t0: VL('L6').t0, lines: ['but in the right recording,'] },
  { t0: T.the6, lines: ['the hits share', 'one time offset.'] },
  { t0: VL('L7').t0, lines: ['So it matches that', 'exact recording.'] },
  { t0: T.humming, lines: ['Humming needs a', 'melody-based search.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (const c of CAPS) c.t0 -= 0.06;                                              // shift every start first,
for (let i = 0; i < CAPS.length; i++) if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0;   // then end each one where the next begins
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
  add(0.0, 'blip', { hi: true }); add(T.cafe, 'tap', { soft: true }); add(T.song, 'tap');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.stars - 0.15, 'slide', { soft: true }); add(T.stars + 0.1, 'blip', { hi: true });          // terrain sinks, stars pop
  add(T.loudest, 'tap');
  add(T.pairs, 'tap'); add(T.hashes - 0.1, 'slot'); add(T.gap, 'tap', { soft: true }); add(T.between, 'type', { soft: true });
  for (let k = 0; k < 5; k++) add(T.look + 0.15 + k * 0.4, 'tap', { soft: true });                 // the rain of hashes
  add(T.random, 'blip', { lo: true });
  add(T.share - 0.3, 'type'); add(T.share + 0.3, 'type'); add(T.offset, 'match');                    // the stack builds
  add(T.offset + 1.0, 'slot');                                                                         // the shard docks
  add(T.matches, 'blip', { hi: true }); add(T.exact - 0.05, 'type');
  add(T.humming, 'slide', { soft: true }); add(T.humming + 0.6, 'tap', { soft: true }); add(T.humming + 1.0, 'tap', { soft: true });
  add(T.search - 0.1, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame ----
const STAGE_TOP = 540, WIPE = 0.5;
const bg = makeBackground();
function wipe(ctx, t, at, drawOld, drawNew) {
  const k = (t - (at - WIPE / 2)) / WIPE;
  if (k < 0) return drawOld(ctx, t);
  if (k >= 1) return drawNew(ctx, t);
  const e = ease(k), band = 220, edge = lerp(H + band, STAGE_TOP - band, e);
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); drawOld(ctx, t); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); drawNew(ctx, t); ctx.restore();
  ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
}
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  if (t < CTA_AT - WIPE / 2) wipe(ctx, t, SHOTS[SH.lookup], worldA, worldB);
  else wipe(ctx, t, CTA_AT, worldB, cta);
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
