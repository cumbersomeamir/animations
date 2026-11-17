// Tensorblue 30s english-19 · episode 01 — "Blurry, not frozen." (how adaptive streaming picks each chunk's quality)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`, unchanged).
// A phone plays an original little film. Beside it stands a glass BUFFER tower: each tile is a 4-second chunk, its
// colour and sharpness its quality (HD cyan, 720p blue, SD amber). Coloured bands on the tower's back wall are the
// buffer-based rate map: the band the stack reaches decides the next chunk. A shelf holds the same chunks in three
// qualities; tiles fly from it into the tower as they download (slowly when the signal is weak). The proof replays
// demo/out/abr-demo.json: an "always HD" player freezes; the adaptive player drops quality and keeps playing.
// Colours: Tensorblue palette + tensorblue.com's own cyan-400 / amber-400 / red-500 tokens. Cues from voice-timing.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, back, ev, rr, text, textW, shadow, kword, makeBackground,
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

// ---- the test's result ------------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/abr-demo.json'), 'utf8'));
const FIX = DEMO.always_hd, ADA = DEMO.adaptive, CHUNK = DEMO.params.chunk_s;
if (FIX.frozen_seconds !== 11.6 || ADA.frozen_seconds !== 0 || CHUNK !== 4 || DEMO.params.buffer_max_s !== 20
  || !ADA.chunk_qualities.includes('SD') || !ADA.chunk_qualities.includes('HD')) throw new Error('demo result changed');
const bw = (t) => (t < 14 || t >= 40 ? 8 : 1.2);                          // must match demo/abr_demo.py
if (DEMO.params.network_mbps !== '8 until 14 s, 1.2 from 14 to 40 s, 8 after') throw new Error('network trace changed');
const MB = Object.fromEntries(DEMO.params.ladder_mbps.map(([q, r]) => [q, r * CHUNK]));

// ---- colours: Tensorblue palette + tensorblue.com's own Tailwind tokens ----
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610',
  cyan: '#00D3F2', amber: '#FFB900', red: '#FB2C36' };
const QCOL = { HD: SITE.cyan, '720p': SITE.blue, SD: SITE.amber };
const QRES = { HD: 1, '720p': 0.28, SD: 0.09 };                            // render scale → softness on screen
const QSZ = { HD: 1, '720p': 0.8, SD: 0.62 };                               // fewer bits → a physically smaller tile

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  blurry: VW('L1', 'blurry'), freezing: VW('L1', 'freezing'), the1: VW('L1', 'the'), chose1: VW('L1', 'chose'),
  but: VW('L2', 'but'), switch: VW('L2', 'switch'), mid: VW('L2', 'mid-video'),
  streaming: VW('L3', 'streaming'), cut: VW('L3', 'cut'), chunks3: VW('L3', 'chunks'), each3: VW('L3', 'each'), several: VW('L3', 'several'), qualities: VW('L3', 'qualities'),
  player: VW('L4', 'player'), picks: VW('L4', 'picks'), next: VW('L4', 'next'), by: VW('L4', 'by'), full: VW('L4', 'full'), buffer4: VW('L4', 'buffer'),
  weak: VW('L5', 'weak'), drains: VW('L5', 'drains'), so5: VW('L5', 'so'), grabs: VW('L5', 'grabs'), smaller: VW('L5', 'smaller'),
  test: VW('L6', 'test'), alwayshd: VW('L6', 'always-hd'), froze1: VW('L6', 'froze'), for6: VW('L6', 'for'), twelve: VW('L6', 'twelve'), adaptive: VW('L6', 'adaptive'), never: VW('L6', 'never'),
  so7: VW('L7', 'so'), blurry7: VW('L7', 'blurry'), the7: VW('L7', 'the'), keep: VW('L7', 'keep'), playing: VW('L7', 'playing'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.15, VL('L3').t0 - 0.15, VL('L4').t0 - 0.15, VL('L5').t0 - 0.15, VL('L6').t0 - 0.15, VL('L7').t0 - 0.15, CTA_AT, 30.01];
const SH = { hook: 0, switch: 1, chunks: 2, buffer: 3, weak: 4, proof: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- simulation clock: video time → test time (the signal drop lands on "Weak") -----------------------
const V0 = VL('L4').t0, V1 = T.weak, V2 = VL('L6').t1, V3 = CTA_AT;
function simT(t) {
  if (t < V0) return -1;
  if (t < V1) return 14 * (t - V0) / (V1 - V0);
  if (t < V2) return 14 + 26 * (t - V1) / (V2 - V1);
  return Math.min(DEMO.params.watch_s - 0.1, 40 + 6 * (t - V2) / (V3 - V2));
}
const vidT = (s) => (s < 14 ? V0 + (s / 14) * (V1 - V0) : s < 40 ? V1 + ((s - 14) / 26) * (V2 - V1) : V2 + ((s - 40) / 6) * (V3 - V2));
const FREEZE_V = FIX.frozen_spans.map(([a, b]) => [vidT(a), vidT(b)]);

// ---- camera ---------------------------------------------------------------------------------------
const POSES = [
  { eye: [1.1, 1.7, 4.9], at: [1.1, 1.5, 0.0], fov: 40 },          // hook: the phone (blurry, playing) + its buffer tower
  { eye: [1.45, 1.45, 3.2], at: [1.5, 1.15, 0.0], fov: 40 },       // closer: it switches mid-video
  { eye: [0.0, 3.3, 2.6], at: [0.0, 3.4, -2.2], fov: 48 },         // the shelf: chunks, three qualities
  { eye: [0.85, 2.3, 4.4], at: [0.85, 1.35, -0.2], fov: 40 },      // lane A: the player picks by buffer level
  { eye: [0.6, 2.5, 4.6], at: [0.8, 1.4, -0.2], fov: 40 },         // weak signal: smaller chunks
  { eye: [0.0, 2.3, 6.3], at: [0.0, 1.15, -0.2], fov: 42 },        // both players: always-HD freezes
  { eye: [0.0, 2.5, 6.6], at: [0.0, 1.65, -0.2], fov: 42 },        // payoff (slow crane)
];
const MOVE = [0, 0.7, 0.8, 0.8, 0.7, 0.9, 0.9];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) return camera(p.eye, p.at, p.fov);
  const q = POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [0.6, 2.8, 6.4], c * k); }
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- the little film (original): dusk sea, sun, mountains, a sailboat crossing ------------------------
function film(g, w, h, vt) {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, SITE.deep); sky.addColorStop(0.55, SITE.logo); sky.addColorStop(1, SITE.pale);
  g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.62);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 26; i++) { const x = ((i * 97) % 100) / 100 * w, y = ((i * 53) % 41) / 100 * h; g.fillRect(x, y, Math.max(1, w * 0.008), Math.max(1, w * 0.008)); }
  g.fillStyle = SITE.white; g.beginPath(); g.arc(w * 0.7, h * 0.36, w * 0.11, 0, Math.PI * 2); g.fill();
  g.fillStyle = SITE.surface; g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w * 0.18, h * 0.45); g.lineTo(w * 0.38, h * 0.62); g.closePath(); g.fill();
  g.fillStyle = SITE.surface2; g.beginPath(); g.moveTo(w * 0.22, h * 0.62); g.lineTo(w * 0.5, h * 0.41); g.lineTo(w * 0.8, h * 0.62); g.closePath(); g.fill();
  const sea = g.createLinearGradient(0, h * 0.62, 0, h); sea.addColorStop(0, SITE.blue); sea.addColorStop(1, SITE.deep);
  g.fillStyle = sea; g.fillRect(0, h * 0.62, w, h * 0.38);
  g.fillStyle = 'rgba(216,227,245,0.55)'; for (let i = 0; i < 6; i++) g.fillRect(((i * 0.19 + vt * 0.01) % 1) * w, h * (0.68 + i * 0.045), w * 0.16, Math.max(1, h * 0.006));
  const bx = (((vt / 60) * 1.3 + 0.05) % 1.3 - 0.15) * w, by = h * 0.63, s = w * 0.11;   // sailboat crossing
  g.fillStyle = SITE.white; g.beginPath(); g.moveTo(bx, by - s * 1.6); g.lineTo(bx, by - s * 0.15); g.lineTo(bx + s * 0.9, by - s * 0.15); g.closePath(); g.fill();
  g.fillStyle = SITE.cyan; g.beginPath(); g.moveTo(bx - s * 0.05, by - s * 1.3); g.lineTo(bx - s * 0.7, by - s * 0.15); g.lineTo(bx - s * 0.05, by - s * 0.15); g.closePath(); g.fill();
  g.fillStyle = SITE.ink; g.beginPath(); g.moveTo(bx - s * 0.8, by - s * 0.1); g.lineTo(bx + s * 1.0, by - s * 0.1); g.lineTo(bx + s * 0.75, by + s * 0.25); g.lineTo(bx - s * 0.6, by + s * 0.25); g.closePath(); g.fill();
}
// the film at a quality: draw small, then scale up smoothly (lower quality = softer)
const SCR_W = 270, SCR_H = 480;
const lowCv = createCanvas(SCR_W, SCR_H), lowG = lowCv.getContext('2d');
function filmAt(g, x, y, w, h, vt, q) {
  const k = QRES[q] ?? 1;
  if (k >= 1) { g.save(); g.translate(x, y); film(g, w, h, vt); g.restore(); return; }
  const lw = Math.max(4, Math.round(w * k)), lh = Math.max(6, Math.round(h * k));
  lowG.clearRect(0, 0, lw, lh); film(lowG, lw, lh, vt);
  g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(lowCv, 0, 0, lw, lh, x, y, w, h); g.restore();
}
// a phone screen: film + quality badge + progress, frozen = dimmed with a pause sign
function makeScreen() { const cv = createCanvas(SCR_W + 30, SCR_H + 30); return { cv, g: cv.getContext('2d') }; }
function paintScreen(scr, vt, q, frozen) {
  const g = scr.g, w = SCR_W, h = SCR_H, m = 15;
  g.fillStyle = SITE.ink; g.fillRect(0, 0, w + 30, h + 30);
  g.save(); rr(g, m, m, w, h, 26); g.clip();
  filmAt(g, m, m, w, h, vt, q || 'HD');
  if (frozen) {
    g.fillStyle = 'rgba(3,6,16,0.58)'; g.fillRect(m, m, w, h);
    g.fillStyle = SITE.white; rr(g, m + w / 2 - 34, m + h / 2 - 40, 24, 80, 8); g.fill(); rr(g, m + w / 2 + 10, m + h / 2 - 40, 24, 80, 8); g.fill();
  }
  if (q) { g.font = '30px IDXB'; const tw = g.measureText(q).width; g.fillStyle = QCOL[q]; rr(g, m + 16, m + 18, tw + 26, 44, 22); g.fill(); g.fillStyle = SITE.ink; g.textAlign = 'left'; g.fillText(q, m + 29, m + 51); }
  g.fillStyle = 'rgba(216,227,245,0.35)'; rr(g, m + 18, m + h - 34, w - 36, 10, 5); g.fill();
  g.fillStyle = frozen ? SITE.gray : SITE.cyan; rr(g, m + 18, m + h - 34, Math.max(10, (w - 36) * clamp(vt / 60)), 10, 5); g.fill();
  g.restore();
  return scr.cv;
}
const SCR = { A: makeScreen(), B: makeScreen() };

// ---- textures ---------------------------------------------------------------------------------------
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const tileTex = (i, q) => cached(`tile|${i % 15}|${q}`, 220, 100, (g, w, h) => {
  g.fillStyle = QCOL[q]; g.fillRect(0, 0, w, h);
  g.save(); rr(g, 8, 8, w - 16, h - 16, 10); g.clip(); filmAt(g, 8, 8, w - 16, h - 16 + 120, (i % 15) * 4 + 2, q); g.restore();
});
const BAND_SD = 8 + 8 * (1.75 - 0.235) / (5 - 0.235);                           // buffer level where the rate map reaches 720p (s)
const bandTex = cached('bands', 160, 480, (g, w, h) => {                       // back wall of a tower: the rate map (0..24 s)
  const y = (s) => h - (s / 24) * h;
  g.fillStyle = SITE.deep; g.fillRect(0, 0, w, h);
  [[0, BAND_SD, SITE.amber, 'SD'], [BAND_SD, 16, SITE.blue, '720p'], [16, 24, SITE.cyan, 'HD']].forEach(([a, b, col, lab]) => {
    g.globalAlpha = 0.32; g.fillStyle = col; g.fillRect(0, y(b), w, y(a) - y(b));
    g.globalAlpha = 1; g.fillStyle = col; g.font = '34px IDXB'; g.textAlign = 'center'; g.fillText(lab, w / 2, y((a + b) / 2) + 12);
  });
});

// ---- the world ------------------------------------------------------------------------------------
const BENCH = { x: 0, y: -0.6, z: -1.0, w: 24, h: 0.6, d: 20, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const LANE = { A: { tower: 0.55, phone: 1.6 }, B: { tower: -0.55, phone: -1.6 } };
const PH_W = 1.0, PH_H = 1.95, TILE_H = 0.25, TW = 0.74, TD = 0.56, BASE = 0.1;
const SHELF = { z: -2.2, rows: { HD: 3.75, '720p': 3.15, SD: 2.55 }, xs: [-1.6, -0.8, 0, 0.8, 1.6] };
const towerTopY = (secs) => BASE + (secs / CHUNK) * TILE_H;

function bytesBy(t0, t1) { let mb = 0; for (let t = t0; t < t1; t += 0.01) mb += bw(t) * Math.min(0.01, t1 - t); return mb; }
// the state of one player at test time s: tiles in its tower (bottom = playing), the chunk in flight, the screen
function playerState(P, s) {
  const smp = P.samples_every_0_1s[clamp(Math.round(s * 10), 0, P.samples_every_0_1s.length - 1)];
  const [, buf, state, qOn, played] = smp;
  const nDone = P.chunks.filter((c) => c.t_done <= s).length;
  const cur = Math.floor(played / CHUNK + 1e-6), rem = 1 - (played / CHUNK - cur);
  const tiles = [];
  for (let i = cur; i < nDone; i++) tiles.push({ i, q: P.chunks[i].q, h: i === cur ? rem : 1 });
  const dl = P.chunks.find((c) => c.t_req <= s && s < c.t_done);
  const flight = dl ? { i: dl.i, q: dl.q, k: clamp(bytesBy(dl.t_req, s) / MB[dl.q]) } : null;
  return { tiles, flight, frozen: state === 'frozen', qOn, played, buf };
}
// before the test plays (hook + switch): a staged tower: SD playing, two HD chunks queued
function stagedA(t) {
  const melt = ease(ev(t, T.switch - 0.25, 0.45));
  const tiles = [{ i: 3, q: 'SD', h: 1 - melt }, { i: 4, q: 'HD', h: 1 }, { i: 5, q: 'HD', h: 1 }].filter((x) => x.h > 0.01);
  return { tiles, flight: null, frozen: false, qOn: melt < 0.98 ? 'SD' : 'HD', played: 12 + t * 0.6 };
}
function drawLane(ctx, cam, lane, st, t, appear, s) {
  const L = LANE[lane], lift = (1 - ease(appear)) * -0.35, A = clamp(appear);
  if (A <= 0.01) return;
  // the phone
  const phone = { x: L.phone, y: lift, z: 0, w: PH_W, h: PH_H, d: 0.09, color: SITE.surface2, colors: { front: SITE.ink }, edge: 'rgba(216,227,245,0.35)', ambient: 0.85, alpha: A };
  contactShadow(ctx, cam, { ...phone, y: 0 }, 0.5, 0.12);
  const vt = st.played;
  phone.tex = { front: paintScreen(SCR[lane], vt, st.qOn, st.frozen) };
  drawBox(ctx, cam, phone);
  // the tower: base, back wall with the rate map, tiles, glass
  const tx = L.tower;
  drawBox(ctx, cam, { x: tx, y: lift, z: 0, w: TW + 0.08, h: BASE, d: TD + 0.08, color: SITE.surface2, colors: { top: SITE.surface }, edge: 'rgba(216,227,245,0.3)', alpha: A });
  drawBox(ctx, cam, { x: tx, y: lift + BASE, z: -TD / 2 - 0.02, w: TW, h: 6 * TILE_H, d: 0.03, color: SITE.deep, tex: { front: bandTex }, ambient: 1, alpha: A });
  st.tiles.reduce((y, tl) => {
    const hh = TILE_H * tl.h;
    const sz = QSZ[tl.q];
    drawBox(ctx, cam, { x: tx, y: lift + y, z: 0.02 + (1 - sz) * (TD - 0.08) / 2, w: (TW - 0.08) * sz, h: hh * 0.94, d: (TD - 0.08) * sz, color: QCOL[tl.q], tex: { front: tileTex(tl.i, tl.q) }, ambient: 0.7, edge: 'rgba(3,6,16,0.35)', alpha: A });
    return y + hh;
  }, BASE);
  // the chunk in flight: from its row on the shelf to the top of the stack (slow when the signal is weak)
  if (st.flight) {
    const f = st.flight, top = BASE + st.tiles.reduce((a, x) => a + x.h, 0) * TILE_H;
    const drop = ev(t, SHOTS[SH.payoff] - 0.2, 0.4);                                       // payoff: the shelf is gone, chunks drop in from just above
    const p0 = mix3([SHELF.xs[f.i % 5], SHELF.rows[f.q] + 0.1, SHELF.z], [tx, lift + top + 0.7, 0.02], drop), p3 = [tx, lift + top + 0.05, 0.02];
    const p = bez(p0, [p0[0], p0[1] + 0.6, p0[2] + 0.6], [p3[0], p3[1] + 1.0, p3[2]], p3, f.k);
    const sz = QSZ[f.q];
    drawBox(ctx, cam, { x: p[0], y: p[1], z: p[2], w: (TW - 0.08) * sz, h: TILE_H * 0.94, d: (TD - 0.08) * sz, color: QCOL[f.q], tex: { front: tileTex(f.i, f.q) }, ambient: 0.75, edge: 'rgba(3,6,16,0.35)', alpha: A });
  }
  drawBox(ctx, cam, { x: tx, y: lift + BASE, z: 0.0, w: TW, h: 6 * TILE_H, d: TD, color: SITE.pale, alpha: 0.12 * A, edge: 'rgba(216,227,245,0.55)', skip: ['bottom'] });
}

// the shelf: the video as one strip, cut into chunks, each saved in three qualities
function drawShelf(ctx, cam, t) {
  const on = ev(t, SHOTS[SH.chunks] - 0.2, 0.4) * (1 - ev(t, SHOTS[SH.payoff], 0.4)); if (on <= 0.01) return;
  const cutK = ease(ev(t, T.cut, 0.5)), rows = ease(ev(t, T.several - 0.1, 0.6));
  for (const q of ['SD', '720p', 'HD']) {
    const yRow = lerp(SHELF.rows['720p'], SHELF.rows[q], rows);
    if (q !== '720p' && rows <= 0.01) continue;
    drawBox(ctx, cam, { x: 0, y: yRow - 0.06, z: SHELF.z, w: 4.4, h: 0.06, d: 0.75, color: SITE.surface2, colors: { top: SITE.surface }, edge: 'rgba(216,227,245,0.25)', alpha: q === '720p' ? on : rows * on });
    SHELF.xs.forEach((x, i) => {
      const gap = cutK * 0.1, w = lerp(0.8, 0.8 - gap, cutK) * (q === '720p' && rows < 0.01 ? 1 : 1);
      const hq = q === 'HD' ? TILE_H * 1.25 : q === 'SD' ? TILE_H * 0.65 : TILE_H;                 // more bits = a bigger tile
      const sz = rows < 0.5 && q === '720p' ? 1 : QSZ[q];
      drawBox(ctx, cam, { x, y: yRow, z: SHELF.z, w: w * 0.92 * sz, h: hq, d: 0.5 * sz, color: QCOL[q], tex: { front: tileTex(i, q === '720p' && rows < 0.5 ? 'HD' : q) }, ambient: 0.75, edge: 'rgba(3,6,16,0.35)', alpha: q === '720p' ? on : rows * on });
    });
  }
}
// the shared network: three signal bars (8 Mb/s → 1.2 Mb/s → 8 Mb/s)
function drawSignal(ctx, cam, t, s) {
  const on = ev(t, V0 - 0.3, 0.4) * (1 - ev(t, SHOTS[SH.payoff], 0.4)); if (on <= 0.01) return;
  const weak = s >= 14 && s < 40 ? 1 : 0, k = ease(ev(t, weak ? V1 - 0.1 : V2, 0.3)), lvl = weak ? k : 1 - k;
  [0.16, 0.3, 0.44].forEach((hh, i) => {
    const dim = i > 0 ? lvl : 0, col = weak && k > 0.5 ? (i === 0 ? SITE.amber : SITE.surface) : SITE.cyan;
    drawBox(ctx, cam, { x: -0.22 + i * 0.22, y: 1.85, z: -0.2, w: 0.16, h: hh * (1 - 0.75 * dim), d: 0.16, color: col, ambient: 0.8, edge: 'rgba(216,227,245,0.4)', alpha: on });
  });
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

function world(ctx, t) {
  const cam = camAt(t), s = simT(t);
  floor(ctx, cam, BENCH, { at: [0.6, 0, 0], radius: 7, strength: 0.24 });
  drawShelf(ctx, cam, t);
  drawSignal(ctx, cam, t, s);
  const stA = s < 0 ? stagedA(t) : playerState(ADA, s);
  drawLane(ctx, cam, 'A', stA, t, 1 - ev(t, SHOTS[SH.chunks] + 0.3, 0.3) * (1 - ev(t, SHOTS[SH.buffer], 0.4)), s);
  const appearB = ease(ev(t, SHOTS[SH.proof] + 0.1, 0.6));
  if (s >= 0) drawLane(ctx, cam, 'B', playerState(FIX, s), t, appearB, s);
  // ---- labels ----
  tag(ctx, cam, [SHELF.xs[2], SHELF.rows['720p'] + 0.5, SHELF.z], 'CHUNKS', ev(t, T.chunks3 - 0.05, 0.3) * (1 - ev(t, T.several - 0.25, 0.2)), { dy: -40 });
  [['HD', SITE.cyan], ['720p', SITE.blue], ['SD', SITE.amber]].forEach(([q, col], i) => tag(ctx, cam, [-2.2, SHELF.rows[q] + 0.12, SHELF.z], q, ev(t, T.qualities - 0.1 + i * 0.12, 0.3) * (1 - ev(t, SHOTS[SH.buffer] + 0.4, 0.2)), { fill: col, color: q === '720p' ? SITE.white : SITE.ink, dx: -10 }));
  tag(ctx, cam, [LANE.A.tower, BASE + 6 * TILE_H + 0.1, 0], 'BUFFER', ev(t, T.buffer4 - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.weak] + 0.6, 0.2)), { dy: -40 });
  const weakTag = s >= 14 && s < 40;
  tag(ctx, cam, [0, 2.0, -0.2], weakTag ? '1.2 Mb/s' : '8 Mb/s', ev(t, V0, 0.3) * (1 - ev(t, SHOTS[SH.payoff], 0.2)), { fill: weakTag ? SITE.amber : SITE.cyan, dy: -26, size: 36 });
  tag(ctx, cam, [LANE.A.tower - 0.42, 0.9, 0.3], 'SMALLER CHUNKS', ev(t, T.smaller - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.proof], 0.2)), { fill: SITE.amber, dx: -60 });
  tag(ctx, cam, [LANE.B.tower - 0.5, 0, 0.4], 'ALWAYS HD', appearB * (1 - ev(t, CTA_AT - 0.4, 0.2)), { dy: 60, size: 34 });
  tag(ctx, cam, [LANE.A.tower + 0.5, 0, 0.4], 'ADAPTIVE', appearB * (1 - ev(t, CTA_AT - 0.4, 0.2)), { fill: SITE.cyan, dy: 60, size: 34 });
  // the freeze counter on always-HD: counts the test's frozen seconds as they happen
  let frozenSoFar = 0; for (const [a, b] of FIX.frozen_spans) frozenSoFar += clamp(s - a, 0, b - a);
  const fk = ev(t, FREEZE_V[0][0] - 0.05, 0.25) * (1 - ev(t, CTA_AT - 0.4, 0.2));
  tag(ctx, cam, [LANE.B.phone, PH_H + 0.15, 0], `FROZEN ${frozenSoFar.toFixed(1)} s`, fk, { fill: SITE.red, color: SITE.white, dy: -30 });
  tag(ctx, cam, [LANE.A.phone, PH_H + 0.15, 0], 'FROZEN 0 s', ev(t, T.never - 0.1, 0.3) * (1 - ev(t, CTA_AT - 0.4, 0.2)), { fill: SITE.cyan, dy: -30 });
  // frame-zero words (already on screen at t = 0), payoff words
  if (t < T.but - 0.25) {
    const k = 1 - ev(t, T.but - 0.55, 0.3);
    text(ctx, 'BLURRY,', 540, 690, { size: 112, font: 'IDXB', alpha: k });
    text(ctx, 'NOT FROZEN.', 540, 812, { size: 112, font: 'IDXB', color: SITE.cyan, alpha: k });
  }
  kword(ctx, 'BLURRY,', 540, 690, 100, t, T.blurry7 - 0.05, { t1: CTA_AT });
  kword(ctx, 'BUT PLAYING.', 540, 800, 100, t, T.keep - 0.1, { color: SITE.cyan, t1: CTA_AT });
}

// ---- captions ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Your video went blurry', 'instead of freezing.'] },
  { t0: T.the1, lines: ['The app chose that.'] },
  { t0: VL('L2').t0, lines: ['But how does it', 'switch mid-video?'] },
  { t0: VL('L3').t0, lines: ['Streaming apps cut video', 'into short chunks,'] },
  { t0: T.each3, lines: ['each saved in', 'several qualities.'] },
  { t0: VL('L4').t0, lines: ['The player picks', 'each next chunk'] },
  { t0: T.by, lines: ['by how full', 'its buffer is.'] },
  { t0: VL('L5').t0, lines: ['Weak signal drains', 'the buffer,'] },
  { t0: T.so5, lines: ['so it grabs', 'smaller chunks.'] },
  { t0: VL('L6').t0, lines: ['In our test, always-HD', 'froze for nearly'] },
  { t0: T.twelve, lines: ['twelve seconds.'] },
  { t0: T.adaptive, lines: ['Adaptive never froze.'] },
  { t0: VL('L7').t0, lines: ['So a blurry moment', 'means the app chose'] },
  { t0: T.keep - 0.15, lines: ['to keep playing.'], tEnd: VL('L8').t0 - 0.05 },
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
  add(0.0, 'blip', { hi: true }); add(T.freezing, 'tap', { soft: true });
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.switch - 0.2, 'slide', { soft: true }); add(T.switch + 0.25, 'blip', { hi: true });          // SD melts, HD on screen
  add(T.cut, 'carve'); add(T.several, 'slide', { soft: true }); add(T.qualities, 'tap');
  for (const c of ADA.chunks) { const v = vidT(c.t_done); if (v > V0 && v < V3 - 0.3) add(v, 'slot', {}); }   // adaptive chunks land
  add(T.weak - 0.05, 'drop'); add(T.smaller - 0.1, 'tap');
  add(FREEZE_V[0][0], 'strike'); add(T.never - 0.05, 'match');
  add(T.blurry7 - 0.05, 'type'); add(T.keep - 0.1, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  const out = e.sort((a, b) => a.t - b.t);
  return out.filter((x, i) => x.type !== 'slot' || !out.slice(0, i).some((y) => y.type === 'slot' && x.t - y.t < 0.25));   // no slot clatter
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
