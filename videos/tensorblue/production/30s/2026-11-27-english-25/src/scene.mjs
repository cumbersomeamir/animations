// Tensorblue 30s english-25 · episode 01 — "Just played. Up again?" (why Spotify's 2025 "Fewer Repeats" shuffle makes
// several random orders and keeps the freshest one; and what app builders can borrow from it)
// Blue Receipt Theatre kit (`brt.mjs`, unchanged) + `stage3d.mjs` (unchanged) + `toy3d.mjs` (english-20, unchanged).
// A toy listening room: a floating "up next" queue whose rows are songs; just-played songs carry an amber tag; five
// coins flip to heads; ten random candidate queues fan out with freshness badges that lose points for amber rows near
// the top; the freshest rises; two trays of twelve tiles compare our measured rates; a die rolls three candidate feeds.
// Every number shown comes from our own simulation (demo/out/shuffle-test.json): pure shuffle opened with a just-played
// song 24.6 % of the time, the freshest of ten random orders 8.1 %. No Spotify UI, logo, cover art or song titles.
// Colours: Tensorblue palette + tensorblue.com's own amber-400 (just played) and green-400 (fresh / winner).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground } from './brt.mjs';
import { camera, project, floor, mix3 } from './stage3d.mjs';
import { extrude, rrectPts, circlePts, dropShadow, lightPool, squash, hop } from './toy3d.mjs';

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

// ---- the real simulation ------------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/shuffle-test.json'), 'utf8'));
const STD = DEMO.standard, FR = DEMO.fewer_repeats, EX = DEMO.example;
if (DEMO.candidates !== 10 || Math.abs(STD.first_song_just_played_pct - 25) > 1.5 || Math.abs(FR.first_song_just_played_pct - 8.1) > 1
  || EX.candidates.length !== 10 || EX.winner_index !== 8) throw new Error('demo result changed');
const RECENT = DEMO.just_played;                                         // song -> hours ago
const AGO = (s) => { const h = RECENT[s]; return h === undefined ? null : h < 1 ? `${Math.round(h * 60)} min ago` : h < 24 ? `${Math.round(h)} h ago` : '1 day ago'; };
const SCORES = EX.candidates.map((c) => Math.round(c.freshness));     // 61 76 65 60 74 80 62 71 82 70
const WIN = EX.winner_index;
const songNo = (s) => Number(s.slice(1));

// ---- colours / cues ----
const K = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', blueDeep: '#2757A6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF',
  grayDark: '#788396', white: '#FFFFFF', ink: '#030610', amber: '#FFB900', amberDeep: '#B07F00', green: '#05DF72', greenDeep: '#039752', desk: '#0E1A2E' };
const T = {
  spotify: VW('L1', "spotify's"), random1: VW('L1', 'random'), felt: VW('L1', 'felt'), repetitive: VW('L1', 'repetitive'),
  five: VW('L2', 'five'), heads: VW('L2', 'heads'), random2: VW('L2', 'random'), so: VW('L2', 'so'), changed: VW('L2', 'changed'),
  since: VW('L3', 'since'), makes: VW('L3', 'makes'), several: VW('L3', 'several'), orders: VW('L3', 'orders'),
  each: VW('L4', 'each'), freshness: VW('L4', 'freshness'), score: VW('L4', 'score'),
  songs5: VW('L5', 'songs'), played5: VW('L5', 'played'), lose: VW('L5', 'lose'), top5: VW('L5', 'top'),
  freshest6: VW('L6', 'freshest'), wins: VW('L6', 'wins'),
  test: VW('L7', 'test'), first7: VW('L7', 'first'), four: VW('L7', 'four'), freshest7: VW('L7', 'freshest'), twelve: VW('L7', 'twelve'),
  building: VW('L8', 'building'), feed: VW('L8', 'feed'), keep: VW('L8', 'keep'), random8: VW('L8', 'random'), pick: VW('L8', 'pick'), freshest8: VW('L8', 'freshest'), few: VW('L8', 'few'),
  follow: VW('L9', 'follow'), tb: VW('L9', 'tensorblue'),
};
const CTA_AT = VL('L9').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.12, VL('L3').t0 - 0.12, VL('L4').t0 - 0.12, VL('L5').t0 - 0.12, VL('L6').t0 - 0.12, VL('L7').t0 - 0.12, VL('L8').t0 - 0.12, CTA_AT, 30.01];
const SH = { hook: 0, coins: 1, cands: 2, score: 3, lose: 4, win: 5, proof: 6, payoff: 7, cta: 8 };
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
    if (x0 < 6 || x0 + m.width > w - 6) throw new Error(`texture text overflows ${key}: "${str}"`); ft(str, x, y); };
  draw(g, w, h); TEXC.set(key, cv); return cv;
}
const COVERS = [K.blue, K.blueDeep, '#5B8FE0', K.logo, '#2C4F86', '#7FA6E6'];
function noteGlyph(g, x, y, s, col) {          // a simple drawn note (no font glyph needed)
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y + s * 0.62, s * 0.2, s * 0.15, -0.4, 0, Math.PI * 2); g.fill();
  g.fillRect(x + s * 0.13, y - s * 0.25, s * 0.07, s * 0.85); g.beginPath(); g.moveTo(x + s * 0.2, y - s * 0.25); g.quadraticCurveTo(x + s * 0.5, y - s * 0.05, x + s * 0.42, y + s * 0.25); g.lineTo(x + s * 0.36, y + s * 0.2); g.quadraticCurveTo(x + s * 0.4, y, x + s * 0.2, y - s * 0.08); g.fill();
}
// a queue row: cover + "Song 11" + optional amber "3 h ago" pill
const ROW_W = 2.3, ROW_H = 0.36;
const rowTex = (s, big = true) => cached(`row|${s}|${big}`, 1600, 250, (g, w, h) => {
  const ago = AGO(s);
  g.fillStyle = K.white; g.fillRect(0, 0, w, h);
  if (ago) { g.fillStyle = K.amber; g.fillRect(0, 0, 26, h); }
  g.fillStyle = COVERS[songNo(s) % COVERS.length]; rr(g, 50, 25, 200, 200, 26); g.fill(); noteGlyph(g, 128, 90, 110, K.white);
  g.fillStyle = K.ink; g.font = '104px IDXB'; g.textAlign = 'left'; g.fillText(`Song ${songNo(s)}`, 300, 162);
  if (ago) { g.font = '76px IDXB'; const pw = g.measureText(ago).width + 64; g.fillStyle = K.amber; rr(g, w - 50 - pw, 62, pw, 126, 63); g.fill(); g.fillStyle = K.ink; g.fillText(ago, w - 50 - pw + 32, 152); }
});
// a mini row for the candidate columns (cover + just-played mark)
const MINI_W = 0.62, MINI_H = 0.16;
const miniTex = (s) => cached(`mini|${s}`, 620, 160, (g, w, h) => {
  const ago = AGO(s); g.fillStyle = ago ? K.amber : K.white; g.fillRect(0, 0, w, h);
  g.fillStyle = COVERS[songNo(s) % COVERS.length]; rr(g, 16, 16, 128, 128, 18); g.fill(); noteGlyph(g, 66, 48, 70, K.white);
  g.fillStyle = K.ink; g.font = '74px IDXB'; g.textAlign = 'left'; g.fillText(`${songNo(s)}`, 172, 108);
});
const badgeTex = (n, win) => cached(`badge|${n}|${win}`, 400, 260, (g, w, h) => {
  g.fillStyle = win ? K.green : K.white; g.fillRect(0, 0, w, h); g.fillStyle = K.ink; g.textAlign = 'center';
  g.font = '170px JBM'; g.fillText(String(n), w / 2, 188);
});
const coinTex = cached('coinH', 400, 400, (g, w, h) => {
  g.fillStyle = K.pale; g.fillRect(0, 0, w, h); g.strokeStyle = K.blue; g.lineWidth = 22; g.beginPath(); g.arc(w / 2, h / 2, 170, 0, Math.PI * 2); g.stroke();
  g.fillStyle = K.blueDeep; g.font = '250px IDXB'; g.textAlign = 'center'; g.fillText('H', w / 2, 290);
});
const tileTex = (s, amber) => cached(`tile|${s}|${amber}`, 300, 300, (g, w, h) => {
  g.fillStyle = amber ? K.amber : COVERS[songNo(s) % COVERS.length]; g.fillRect(0, 0, w, h); noteGlyph(g, 120, 90, 150, amber ? K.ink : K.white);
});
const trayTex = (title, pct, col) => cached(`tray|${title}|${pct}`, 1400, 400, (g, w, h) => {
  g.fillStyle = K.surface; g.fillRect(0, 0, w, h); g.fillStyle = K.gray; g.font = '118px IDXB'; g.textAlign = 'center'; g.fillText(title, w / 2, 140);
  g.fillStyle = col; g.font = '190px JBM'; g.fillText(pct, w / 2, 340);
});
const feedTex = (k) => cached(`feed|${k}`, 600, 760, (g, w, h) => {      // a generic feed card: image block + text bars (illustrative)
  g.fillStyle = K.white; g.fillRect(0, 0, w, h);
  g.fillStyle = COVERS[k % COVERS.length]; rr(g, 30, 30, w - 60, 400, 30); g.fill(); noteGlyph(g, 260, 160, 180, K.white);
  g.fillStyle = K.gray; rr(g, 30, 470, w - 60, 56, 28); g.fill(); rr(g, 30, 560, (w - 60) * 0.7, 56, 28); g.fill(); rr(g, 30, 650, (w - 60) * 0.45, 56, 28); g.fill();
});
const dieFace = cached('die', 300, 300, (g, w, h) => {
  g.fillStyle = K.pale; g.fillRect(0, 0, w, h); g.fillStyle = K.blueDeep;
  for (const [x, y] of [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]]) { g.beginPath(); g.arc(x * w, y * h, 32, 0, Math.PI * 2); g.fill(); }
});

// ================================= world helpers =================================
function paint(ctx, cam, L) { for (const d of L) if (d.base) d.f(ctx); const R = L.filter((d) => !d.base); R.sort((a, b) => project(cam, b.p).z - project(cam, a.p).z); for (const d of R) d.f(ctx); }
function box(L, cam, p, o) {
  const { w, h, depth = 0.1, tex = null, color = K.white, side = K.gray, yaw = 0, pitch = 0, roll = 0, scale = 1, alpha = 1, shadowK = 0.4, gloss = 0.3, edge, pts } = o;
  if (alpha <= 0.01 || scale <= 0.01) return;
  L.push({ p, f: (ctx) => { if (shadowK > 0 && p[1] < 3) dropShadow(ctx, cam, [p[0], 0, p[2]], 0.5 * w * scale, 0.16 * scale + 0.04, shadowK * Math.max(0, 1 - p[1] / 3.2));
    extrude(ctx, cam, { p, yaw, pitch, roll, sx: scale, sy: scale, pts: pts || rrectPts(w, h, Math.min(w, h) * 0.16, 3), depth, color, side, tex, texW: w, texH: h, gloss, alpha, edge }); } });
}

// ================================= story pieces =================================
const QUEUE = EX.standard_order.slice(0, 5);                            // the real first-draw pure shuffle: Song 11 (3 h ago) at #2
const Q_POS = (k) => [-0.16, 2.25 - k * 0.47, 0.2];
function buildHook(L, cam, t) {
  QUEUE.forEach((s, k) => {
    const amber = !!AGO(s);
    const settle = ev(t, -1.1 + k * 0.12, 0.7);                          // the shuffle has just landed at frame 0
    const p0 = [((k * 37) % 5 - 2) * 0.5, 1.2 + k * 0.15, -0.6], p1 = Q_POS(k);
    let p = hop(p0, p1, 0.25, easeOut(settle));
    let scale = 1, yaw = 0;
    if (amber) {                                                          // the just-played song lifts out of the list towards you
      const lift = ease(ev(t, 0.0, 0.5)), bump = ev(t, T.repetitive, 0.08) * (1 - ev(t, T.repetitive + 0.08, 0.3));
      p = mix3(p, [p1[0] - 0.05, p1[1] + 0.02, p1[2] + 0.42], lift); scale = 1 + 0.06 * bump; yaw = 0.06 * lift;   // lifts forward but stays clear of the right-side controls
      L.push({ p: [p[0], 0.01, p[2]], base: true, f: (ctx) => lightPool(ctx, cam, [p[0], 0.01, p[2] + 0.2], 1.0, '255,185,0', 0.18 * lift) });
    }
    box(L, cam, p, { w: ROW_W, h: ROW_H, depth: 0.1, tex: rowTex(s), side: amber ? K.amberDeep : K.gray, scale, yaw, shadowK: k === 4 ? 0.35 : 0 });
  });
}
const COIN_AT = (k) => T.heads - 0.05 + k * 0.24;
function buildCoins(L, cam, t) {
  for (let k = 0; k < 5; k++) {
    const t0 = COIN_AT(k) - 0.55, kk = ev(t, t0, 0.55);
    const dst = [-1.2 + k * 0.6, 0.05, 0.6];
    if (kk <= 0) { box(L, cam, [dst[0], 0.05, dst[2]], { w: 0.6, h: 0.6, depth: 0.08, pts: circlePts(0.3, 28), tex: coinTex, color: K.pale, side: K.gray, pitch: -Math.PI / 2, alpha: 0.25, shadowK: 0 }); continue; }
    const p = hop([dst[0], 0.05, dst[2]], dst, 0.9, kk);
    const spin = (1 - easeOut(kk)) * Math.PI * 6;                         // flips, then lands face up (heads)
    const land = ev(t, COIN_AT(k), 0.05) * (1 - ev(t, COIN_AT(k) + 0.05, 0.2)), [sx] = squash(land);
    box(L, cam, p, { w: 0.6, h: 0.6, depth: 0.08, pts: circlePts(0.3, 28), tex: coinTex, color: K.pale, side: K.gray, pitch: -Math.PI / 2 + spin, scale: sx, shadowK: 0.5, gloss: 0.4 });
    if (kk >= 1) L.push({ p: [dst[0], 0.01, dst[2]], base: true, f: (ctx) => lightPool(ctx, cam, [dst[0], 0.01, dst[2]], 0.45, '59,130,246', 0.14) });
  }
}
// ten candidate queues as a deck of panels receding into depth; the winner slides out to the front
const MINI_W2 = 0.74, MINI_H2 = 0.17, PANEL_W = 0.9, PANEL_H = 1.42;
const DECK = (j) => [-0.72 + j * 0.37, 0.92 + j * 0.2, 1.0 - j * 0.55];   // a rising staircase so every badge shows
const WIN_FRONT = [0.1, 1.15, 1.6];
function buildCandidates(L, cam, t, i) {
  const fan = ease(ev(t, T.several - 0.2, 0.9));                       // one stacked queue fans out into ten
  const appear = back(ev(t, SHOTS[SH.cands] + 0.05, 0.45));
  const winK = i >= SH.win ? ease(ev(t, T.freshest6 - 0.05, 0.6)) : 0;
  const drop = i >= SH.lose ? ease(ev(t, T.lose - 0.05, (T.top5 + 0.3) - (T.lose - 0.05))) : 0;
  EX.candidates.forEach((c, j) => {
    const isWin = j === WIN, d = DECK(j);
    const fanK = clamp(fan * 1.25 - j * 0.03);
    let p = mix3(DECK(0), d, fanK);
    if (isWin) p = mix3(p, WIN_FRONT, winK);
    const sink = isWin ? 0 : winK;
    p = [p[0], p[1] - 1.0 * sink * (0.4 + 0.06 * j), p[2]];
    const sc = appear * (isWin ? 1 + 0.12 * winK : 1);
    const yaw = Math.atan2(cam.eye[0] - p[0], cam.eye[2] - p[2]) * 0.6;
    const alpha = 1 - 0.9 * sink;
    if (alpha <= 0.02) return;
    const green = isWin && winK > 0.5;
    box(L, cam, [p[0], p[1], p[2]], { w: PANEL_W, h: PANEL_H, depth: 0.04, color: K.surface, side: K.surface2, yaw, scale: sc, alpha, shadowK: 0.45 * alpha, gloss: 0.05, edge: green ? 'rgba(5,223,114,0.9)' : 'rgba(59,130,246,0.55)' });
    const ux = Math.cos(yaw), uz = -Math.sin(yaw), nx = Math.sin(yaw), nz = Math.cos(yaw);   // panel right / normal
    c.order.slice(0, 5).forEach((s, k) => {
      const amber = !!AGO(s), flash = i === SH.lose && amber ? Math.max(0, Math.sin((t - T.lose) * 10)) : 0;
      const y = p[1] + sc * (0.36 - k * 0.22);
      box(L, cam, [p[0] + nx * 0.035 * sc, y, p[2] + nz * 0.035 * sc], { w: MINI_W2, h: MINI_H2, depth: 0.04, tex: miniTex(s), color: amber ? K.amber : K.white, side: amber ? K.amberDeep : K.gray, scale: sc * (1 + 0.08 * flash), yaw, shadowK: 0, alpha });
    });
    if (i >= SH.score) {                                                  // the freshness badge counts down from 100 as amber rows cost points
      const b = back(ev(t, T.freshness - 0.1 + j * 0.035, 0.35));
      const val = Math.round(100 - (100 - SCORES[j]) * drop);
      box(L, cam, [p[0] + nx * 0.04 * sc, p[1] + sc * 0.6, p[2] + nz * 0.04 * sc], { w: 0.5, h: 0.32, depth: 0.05, tex: badgeTex(val, green), color: green ? K.green : K.white, side: green ? K.greenDeep : K.gray, scale: b * sc, yaw, shadowK: 0, alpha });
    }
    if (isWin && winK > 0.01) L.push({ p: [p[0], 0.01, p[2]], base: true, f: (ctx) => lightPool(ctx, cam, [p[0], 0.01, p[2] + 0.3], 1.0, '5,223,114', 0.25 * winK) });
  });
}
// proof: two trays of 12 first-songs each; amber = a just-played song came first (≈ our measured rates)
const TRAY_AMBER = [Math.round(12 * STD.first_song_just_played_pct / 100), Math.round(12 * FR.first_song_just_played_pct / 100)];   // 3 and 1
function buildProof(L, cam, t) {
  [0, 1].forEach((side) => {
    const cx = side ? 1.05 : -1.05, t0 = side ? T.freshest7 - 0.1 : SHOTS[SH.proof] + 0.02;
    const tray = back(ev(t, t0, 0.45));
    if (tray <= 0.01) return;
    box(L, cam, [cx, 0.9, 0.0], { w: 1.8, h: 1.75, depth: 0.08, color: K.surface, side: K.surface2, scale: tray, shadowK: 0.5, gloss: 0.06, edge: side ? 'rgba(5,223,114,0.45)' : 'rgba(255,185,0,0.45)' });
    box(L, cam, [cx, 2.12, 0.0], { w: 1.8, h: 0.52, depth: 0.06, tex: trayTex(side ? 'freshest of 10' : 'pure shuffle', `${(side ? FR : STD).first_song_just_played_pct}%`, side ? K.green : K.amber), color: K.surface, side: K.surface2, scale: tray, shadowK: 0 });
    const amberIdx = side ? [5] : [1, 6, 10];
    if (amberIdx.length !== TRAY_AMBER[side]) throw new Error('tray amber count does not match the measured rate');
    for (let n = 0; n < 12; n++) {
      const r = Math.floor(n / 4), c = n % 4, kk = ev(t, t0 + 0.15 + n * (side ? 0.05 : 0.09), 0.3);
      if (kk <= 0) continue;
      const amber = amberIdx.includes(n), dst = [cx - 0.6 + c * 0.4, 1.42 - r * 0.42, 0.07];
      const p = hop([cx, 2.6, 0.4], dst, 0.2, easeOut(kk));
      box(L, cam, p, { w: 0.34, h: 0.34, depth: 0.05, tex: tileTex(`S${(n * 7 + side * 3) % 20 + 1}`, amber), color: amber ? K.amber : K.blue, side: amber ? K.amberDeep : K.blueDeep, scale: back(Math.min(1, kk * 1.5)), shadowK: 0, gloss: 0.35 });
    }
  });
}
// payoff: a die rolls, three candidate feeds land, scores appear, the freshest slides forward
const FEED_SCORE = [58, 87, 71];
function buildPayoff(L, cam, t) {
  const roll = ev(t, SHOTS[SH.payoff] + 0.1, 0.8), dieP = hop([-2.3, 0.36, 0.9], [-0.62, 0.36, 1.45], 0.7, easeOut(roll));
  box(L, cam, dieP, { w: 0.72, h: 0.72, depth: 0.72, tex: dieFace, color: K.pale, side: K.gray, yaw: (1 - easeOut(roll)) * 5 + 0.5, roll: (1 - easeOut(roll)) * 4, pitch: -0.25, shadowK: 0.6, gloss: 0.3 });
  const pickK = ease(ev(t, T.pick - 0.1, 0.5));
  for (let k = 0; k < 3; k++) {
    const kk = ev(t, T.random8 - 0.15 + k * 0.12, 0.45); if (kk <= 0) continue;
    const win = k === 1, dst = [-0.85 + k * 0.95, 1.05, -0.2];
    let p = hop([dieP[0], 0.4, dieP[2]], dst, 0.5, easeOut(kk));
    if (win) p = mix3(p, [dst[0] + 0.05, 1.2, 0.85], pickK);
    const sink = win ? 0 : pickK;
    box(L, cam, [p[0], p[1] - 0.6 * sink, p[2]], { w: 0.72, h: 0.92, depth: 0.06, tex: feedTex(k + 2), side: win && pickK > 0.5 ? K.greenDeep : K.gray, scale: back(Math.min(1, kk * 1.6)) * (1 + 0.25 * (win ? pickK : 0)), shadowK: 0.4, alpha: 1 - 0.7 * sink, yaw: (k - 1) * -0.12 });
    const sb = back(ev(t, T.pick - 0.35 + k * 0.05, 0.3));
    if (sb > 0.01) box(L, cam, [p[0], p[1] + 0.62 * (1 + 0.25 * (win ? pickK : 0)) - 0.6 * sink, p[2] + 0.02], { w: 0.42, h: 0.27, depth: 0.05, tex: badgeTex(FEED_SCORE[k], win && pickK > 0.5), color: win && pickK > 0.5 ? K.green : K.white, side: K.gray, scale: sb * (1 + 0.25 * (win ? pickK : 0)), shadowK: 0, alpha: 1 - 0.7 * sink, yaw: (k - 1) * -0.12 });
  }
  if (pickK > 0.01) L.push({ p: [0.1, 0.01, 0.9], base: true, f: (ctx) => lightPool(ctx, cam, [0.1, 0.01, 1.0], 0.9, '5,223,114', 0.22 * pickK) });
}

// ================================= cameras =================================
const mixCam = (a, b, k) => ({ eye: mix3(a.eye, b.eye, k), at: mix3(a.at, b.at, k) });
const CAM = {
  hook0: { eye: [0.2, 1.55, 4.4], at: [-0.05, 1.3, 0.2] }, hook1: { eye: [0.05, 1.5, 4.15], at: [-0.05, 1.3, 0.2] },
  coins0: { eye: [0.0, 2.7, 4.4], at: [0.0, 0.25, 0.5] }, coins1: { eye: [0.12, 2.5, 4.1], at: [0.0, 0.25, 0.5] },
  cands: { eye: [-0.9, 1.35, 4.8], at: [0.55, 1.12, -1.6] },
  score: { eye: [-0.85, 1.35, 4.6], at: [0.55, 1.17, -1.6] },
  lose: { eye: [-0.6, 1.3, 4.1], at: [0.35, 1.05, -1.0] },
  win: { eye: [-0.3, 1.4, 4.6], at: [0.2, 1.25, -0.2] },
  proof0: { eye: [0.0, 1.5, 5.4], at: [0.0, 1.15, 0.0] }, proof1: { eye: [0.1, 1.45, 4.95], at: [0.0, 1.15, 0.0] },
  pay0: { eye: [0.25, 1.75, 4.9], at: [0.0, 0.95, 0.4] }, pay1: { eye: [0.05, 1.65, 4.55], at: [0.0, 1.0, 0.4] },
};
const CAM_CY = 1250;                                                    // content sits in the lower stage, under the headline
function camAt(t) {
  const i = wShot(t); let c, fov = 44;
  if (i === SH.hook) c = mixCam(CAM.hook0, CAM.hook1, ease(ev(t, 0, SHOTS[1])));
  else if (i === SH.coins) c = mixCam(CAM.coins0, CAM.coins1, ease(ev(t, SHOTS[i], SHOTS[i + 1] - SHOTS[i])));
  else if (i === SH.cands) c = mixCam(CAM.coins1, CAM.cands, ease(ev(t, SHOTS[i], 0.9)));
  else if (i === SH.score) c = mixCam(CAM.cands, CAM.score, ease(ev(t, SHOTS[i], 0.6)));
  else if (i === SH.lose) c = mixCam(CAM.score, CAM.lose, ease(ev(t, SHOTS[i], 0.6)));
  else if (i === SH.win) c = mixCam(CAM.lose, CAM.win, ease(ev(t, SHOTS[i], 0.6)));
  else if (i === SH.proof) c = mixCam(CAM.proof0, CAM.proof1, ease(ev(t, SHOTS[i], SHOTS[i + 1] - SHOTS[i])));
  else c = mixCam(CAM.pay0, CAM.pay1, ease(ev(t, SHOTS[i], CTA_AT - SHOTS[i])));
  return camera(c.eye, c.at, fov, 540, CAM_CY);
}
const FLOOR = { x: 0, y: -0.6, z: -2.5, w: 40, h: 0.6, d: 40, colors: { top: K.desk, front: K.surface2, left: K.surface2, right: K.surface2 }, color: K.surface2 };
function horizonFog(ctx, cam) {
  const far = project(cam, [cam.eye[0] + cam.f[0] * 18, 0, cam.eye[2] + cam.f[2] * 18]), mid = project(cam, [cam.eye[0] + cam.f[0] * 9, 0, cam.eye[2] + cam.f[2] * 9]);
  if (far.z < 0.2 || mid.z < 0.2) return;
  const g = ctx.createLinearGradient(0, far.y - 60, 0, mid.y); g.addColorStop(0, 'rgba(3,6,16,1)'); g.addColorStop(1, 'rgba(3,6,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, mid.y));
}
function world(ctx, t) {
  const i = wShot(t), cam = camAt(t);
  floor(ctx, cam, FLOOR, { at: [0, 0, 0], radius: 7, strength: 0.2 });
  horizonFog(ctx, cam);
  const L = [];
  if (i === SH.hook) buildHook(L, cam, t);
  else if (i === SH.coins) buildCoins(L, cam, t);
  else if (i <= SH.win) buildCandidates(L, cam, t, i);
  else if (i === SH.proof) buildProof(L, cam, t);
  else buildPayoff(L, cam, t);
  paint(ctx, cam, L);
  return { cam, i };
}

// ================================= headlines (one at a time) =================================
const HEAD_CX = 500, HEAD_MAXW = 700, HEAD_OUT = 0.32;   // a headline's 0.3 s exit finishes before its shot cuts
function headlines(ctx, t) {
  if (t < SHOTS[SH.coins] + 0.25) {
    const k = 1 - ev(t, SHOTS[SH.coins] - HEAD_OUT, 0.3);
    ctx.save(); ctx.shadowColor = 'rgba(3,6,16,0.95)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 4;
    text(ctx, 'JUST PLAYED.', HEAD_CX, 600, { size: 104, font: 'IDXB', color: K.amber, alpha: k });
    text(ctx, 'UP AGAIN?', HEAD_CX, 712, { size: 104, font: 'IDXB', alpha: k });
    ctx.restore();
  }
  const hl = (str, y, size, t0, o) => { const w = textW(ctx, str, size, 'IDXB', -1); kword(ctx, str, HEAD_CX, y, w > HEAD_MAXW ? size * HEAD_MAXW / w : size, t, t0, o); };
  hl('5 HEADS. STILL RANDOM.', 620, 92, T.heads - 0.06, { t1: SHOTS[SH.cands] - HEAD_OUT });
  hl('FEWER REPEATS', 620, 104, T.since - 0.04, { t1: SHOTS[SH.score] - HEAD_OUT, color: K.blue });
  hl('FRESHNESS SCORE', 620, 96, T.each - 0.02, { t1: SHOTS[SH.lose] - HEAD_OUT });
  hl('JUST PLAYED = −POINTS', 620, 88, T.songs5 - 0.04, { t1: SHOTS[SH.win] - HEAD_OUT, color: K.amber });
  hl(`${SCORES[WIN]} WINS`, 620, 120, T.freshest6 - 0.04, { t1: SHOTS[SH.proof] - HEAD_OUT, color: K.green });
  hl('1 IN 4  →  1 IN 12', 620, 100, T.four - 0.1, { t1: SHOTS[SH.payoff] - HEAD_OUT, color: K.green });
  hl('RANDOM, THEN FRESHEST', 612, 84, T.keep - 0.06, { t1: CTA_AT, color: K.green });
}

// ---- captions (upper safe band y 280-460) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ["Spotify's shuffle was", 'truly random.'] },
  { t0: T.felt - 0.15, lines: ['It felt repetitive.'] },
  { t0: VL('L2').t0, lines: ['Five heads in a row', 'is random too.'] },
  { t0: T.so, lines: ['So what changed?'] },
  { t0: VL('L3').t0, lines: ['Since 2025, it makes', 'several random orders.'] },
  { t0: VL('L4').t0, lines: ['Each gets a', 'freshness score.'] },
  { t0: VL('L5').t0, lines: ['Songs you just played', 'lose points near the top.'] },
  { t0: VL('L6').t0, lines: ['The freshest order wins.'] },
  { t0: VL('L7').t0, lines: ['Our test: just-played songs', 'came first one time in four.'] },
  { t0: T.freshest7, lines: ['Freshest of ten:', 'one in twelve.'] },
  { t0: VL('L8').t0, lines: ['Building a feed?'] },
  { t0: T.keep, lines: ['Keep it random, then pick', 'the freshest of a few.'], tEnd: VL('L9').t0 - 0.05 },
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

// ---- SFX (impacts kept off the narration where they land on a word's tail) ----
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.0, 'blip', { hi: true }); add(0.05, 'slide', { soft: true }); add(T.repetitive, 'pop');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  for (let k = 0; k < 5; k++) add(COIN_AT(k), 'clack', { soft: k % 2 === 1 });
  add(T.heads - 0.06, 'type');
  for (let j = 0; j < 10; j += 2) add(T.several - 0.25 + j * 0.06, 'hop', { hi: j % 4 === 0 });
  add(T.several - 0.06, 'type');
  for (let j = 0; j < 10; j += 3) add(T.freshness - 0.1 + j * 0.04, 'pop');
  for (let k = 0; k < 6; k++) add(T.lose - 0.05 + k * ((T.top5 + 0.3 - T.lose) / 6), 'tick');
  add(T.freshest6 - 0.05, 'swish2', { soft: true }); add(VL('L6').t1 + 0.03, 'chime');
  add(T.test - 0.05, 'slot'); for (let n = 0; n < 12; n += 3) add(T.test + 0.1 + n * 0.09, 'tap');
  add(T.freshest7 - 0.1, 'slot'); add(T.four - 0.1, 'type');
  add(SHOTS[SH.payoff] + 0.1, 'hop'); add(SHOTS[SH.payoff] + 0.8, 'clack');
  for (let k = 0; k < 3; k++) add(T.random8 - 0.15 + k * 0.12, 'hop', { hi: k === 1 });
  add(T.pick - 0.1, 'swish2', { soft: true }); add(VL('L8').t1 + 0.03, 'confirm');
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
