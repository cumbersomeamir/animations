// Tensorblue 30s english-21 · episode 01 — "Why stuck?" (why a progress bar races to 99% and then waits)
// Blue Receipt Theatre kit (`brt.mjs`, unchanged) + 3D stage (`stage3d.mjs`, unchanged) + `toy3d.mjs` (from english-20).
// A playful parcel pipeline on a conveyor running into depth: DOWNLOAD hopper (far) → VERIFY gate → UNPACK (the
// parcel's lid flips and file cubes burst out) → INSTALL (cubes hop into a phone, near). A giant chunky progress bar
// floats above. The bytes-only bar fills only from the hopper, so it races to 99% and sits there while the real
// work goes on. The proof replays the real four-stage run (demo/out/stages-demo.json) with a bytes-only bar and a
// staged bar; the payoff gives every stage its share of one bar.
// Colours: Tensorblue palette + tensorblue.com's own amber-400 (verify), cyan-400 (unpack), green-400 (install / done),
// red-500 (stuck).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground } from './brt.mjs';
import { camera, project, floor, mix3 } from './stage3d.mjs';
import { extrude, rrectPts, circlePts, tickPts, dropShadow, lightPool, squash, hop } from './toy3d.mjs';

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

// ---- the real run -------------------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/stages-demo.json'), 'utf8'));
const RUN = DEMO.reported_run, BAR = DEMO.bars_every_0_05s, SHARE = DEMO.shares_from_calibration;
if (!RUN.ok || Math.abs(DEMO.bytes_only.reached_99_at_s - 3.0) > 0.1 || DEMO.bytes_only.stuck_at_99_s < 1.6 || DEMO.bytes_only.stuck_at_99_s >= 2.0
  || DEMO.package.files < 2000 || DEMO.staged.max_gap_from_elapsed_time_pts >= DEMO.bytes_only.max_gap_from_elapsed_time_pts) throw new Error('demo result changed');
const N_FILES = DEMO.package.files;

const K = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', blueDeep: '#2757A6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF',
  grayDark: '#788396', white: '#FFFFFF', ink: '#030610', amber: '#FFB900', red: '#FB2C36', cyan: '#00D3F2', green: '#05DF72' };
const STAGES = ['download', 'verify', 'unpack', 'install'];
const SCOL = { download: K.blue, verify: K.amber, unpack: K.cyan, install: K.green };

// ---- cues ----
const T = {
  raced: VW('L1', 'raced'), nn1: VW('L1', 'ninety-nine'), now: VW('L1', 'now'), stuck: VW('L1', 'stuck'), why: VW('L1', 'why'),
  bar2: VW('L2', 'bar'), counted: VW('L2', 'counted'), download: VW('L2', 'download'),
  verifies: VW('L3', 'verifies'), file: VW('L3', 'file'), unpacks: VW('L3', 'unpacks'), thousands: VW('L3', 'thousands'), installs: VW('L3', 'installs'),
  shouldnt: VW('L4', "shouldn't"), hundred: VW('L4', 'hundred'), done: VW('L4', 'done'), so4: VW('L4', 'so'), waits: VW('L4', 'waits'),
  test: VW('L5', 'test'), nn5: VW('L5', 'ninety-nine'), three: VW('L5', 'three'), then5: VW('L5', 'then'), sat: VW('L5', 'sat'), two5: VW('L5', 'two'),
  microsoft: VW('L6', "microsoft's"), guide: VW('L6', 'guide'), particularly: VW('L6', 'particularly'), annoying: VW('L6', 'annoying'),
  building: VW('L7', 'building'), give: VW('L7', 'give'), every: VW('L7', 'every'), share: VW('L7', 'share'), bar7: VW('L7', 'bar'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.08;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.14, VL('L3').t0 - 0.1, VL('L4').t0 - 0.12, VL('L5').t0 - 0.12, VL('L6').t0 - 0.12, VL('L7').t0 - 0.16, CTA_AT, 30.01];
const SH = { hook: 0, counted: 1, tour: 2, wait: 3, proof: 4, quote: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ================================= textures =================================
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const label = (str, w, h, bg, fg, size) => cached(`lab|${str}|${bg}|${w}x${h}`, w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `${size}px IDXB`; g.textAlign = 'center'; g.fillText(str, w / 2, h / 2 + size * 0.36); });
const pctTex = (p, col = K.white, fg = K.ink) => cached(`pct|${p}|${col}`, 300, 160, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = '112px IDXB'; g.textAlign = 'center'; g.fillText(`${p}%`, w / 2, 118); });
// the phone: a generic app-update screen (our own drawing)
const SCR_W = 520, SCR_H = 1020;
function phoneScreen(pct, state) {   // state: 'install' | 'done' | 'download'
  return cached(`ph|${pct}|${state}`, SCR_W, SCR_H, (g, w, h) => {
    g.fillStyle = K.surface; g.fillRect(0, 0, w, h);
    g.fillStyle = K.blue; rr(g, w / 2 - 110, 150, 220, 220, 52); g.fill();                 // the app's icon: a little parcel
    g.fillStyle = K.white; rr(g, w / 2 - 62, 222, 124, 96, 14); g.fill(); g.fillStyle = K.blue; g.fillRect(w / 2 - 62, 252, 124, 10); g.fillRect(w / 2 - 6, 222, 12, 96);
    g.fillStyle = K.white; g.font = '50px IDXB'; g.textAlign = 'center'; g.fillText('Updating app', w / 2, 460);
    const msg = state === 'done' ? 'Done ✓' : state === 'download' ? 'Downloading…' : 'Installing…';
    g.fillStyle = state === 'done' ? K.green : K.gray; g.font = '42px InterSB'; g.fillText(msg, w / 2, 540);
    g.fillStyle = 'rgba(216,227,245,0.18)'; rr(g, 50, 600, w - 100, 40, 20); g.fill();
    g.fillStyle = state === 'done' ? K.green : K.blue; rr(g, 50, 600, Math.max(40, (w - 100) * pct / 100), 40, 20); g.fill();
    g.fillStyle = K.white; g.font = '72px IDXB'; g.fillText(`${pct}%`, w / 2, 760);
  });
}
const parcelTex = cached('parcel', 260, 210, (g, w, h) => { g.fillStyle = K.blue; g.fillRect(0, 0, w, h); g.fillStyle = K.blueDeep; g.fillRect(w / 2 - 14, 0, 28, h); g.fillStyle = K.white; rr(g, 30, 120, w - 60, 60, 12); g.fill(); g.fillStyle = K.ink; g.font = '34px JBM'; g.textAlign = 'center'; g.fillText('update.zip', w / 2, 162); });
const fileTex = cached('file', 80, 80, (g, w, h) => { g.fillStyle = K.white; g.fillRect(0, 0, w, h); g.fillStyle = K.gray; g.fillRect(16, 22, 48, 7); g.fillRect(16, 38, 40, 7); g.fillRect(16, 54, 44, 7); });
const quoteTex = cached('quote', 820, 400, (g, w, h) => {
  g.fillStyle = K.white; g.fillRect(0, 0, w, h);
  g.fillStyle = K.ink; g.font = '74px IDXB'; g.textAlign = 'center';
  g.fillText('“particularly', w / 2, 120); g.fillText('uninformative', w / 2, 200); g.fillText('and annoying”', w / 2, 280);
  g.fillStyle = K.blue; g.font = '34px IDXB'; g.fillText('MICROSOFT DESIGN GUIDE', w / 2, 358);
});
function watchTex(sec) { return cached(`watch|${sec}`, 300, 300, (g, w) => { g.fillStyle = K.white; g.fillRect(0, 0, w, w); g.fillStyle = K.ink; g.font = '96px IDXB'; g.textAlign = 'center'; g.fillText(`${sec}`, w / 2, 168); g.fillStyle = K.grayDark; g.font = '40px IDXB'; g.fillText('SECONDS', w / 2, 230); }); }

// ================================= toys =================================
const BEAD = rrectPts(1.0, 1.0, 0.14, 3), FILE_PTS = rrectPts(0.16, 0.16, 0.03, 2), PH_PTS = rrectPts(1.04, 2.0, 0.15, 6);
function mixHex(a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function paint(ctx, cam, L) { L.sort((a, b) => project(cam, b.p).z - project(cam, a.p).z); for (const d of L) d.f(ctx); }
const box = (L, cam, p, o) => L.push({ p: o.zp || p, f: (ctx) => { if (o.shadow) dropShadow(ctx, cam, [p[0], 0, p[2]], o.shadow[0], o.shadow[1], 0.55); extrude(ctx, cam, { p, ...o }); } });

// the big progress bar: a dark trough, a chunky fill (one block, or one block per stage), a % badge on its right end
const BAR_W = 4.4, BAR_H = 0.62, BAR_D = 0.4, IN_W = 4.24;   // a scoreboard behind the DOWNLOAD hopper
function bigBar(L, cam, c, o) {
  const { pct = 0, staged = null, badge = null, badgeCol = K.white, badgeFg = K.ink, jig = 0, scale = 1, badgeImpact = 0 } = o;
  const p = [c[0] + Math.sin(jig * 40) * 0.03 * jig, c[1], c[2]];
  box(L, cam, p, { pts: rrectPts(BAR_W * scale, BAR_H * scale, 0.24 * scale, 5), depth: BAR_D * scale, color: '#0E1A2E', side: '#08101F', gloss: 0.12, edge: 'rgba(216,227,245,0.55)', edgeW: 3, noFog: true, zp: [p[0], p[1], p[2] - 0.05] });
  const left = p[0] - IN_W * scale / 2;
  const seg = (x0, w, col, k) => { if (w <= 0.004) return; box(L, cam, [x0 + w / 2, p[1], p[2] + 0.02 * scale], { pts: rrectPts(w, (BAR_H - 0.14) * scale, Math.min(0.16 * scale, w / 2), 4), depth: (BAR_D + 0.04) * scale, color: col, side: mixHex(col, '#000000', 0.35), gloss: 0.3, noFog: true, zp: [p[0], p[1], p[2] + 0.01 + k * 0.001] }); };
  if (staged) { let x = left; STAGES.forEach((s, i) => { const w = IN_W * scale * SHARE[s] * staged[s]; seg(x, w, SCOL[s], i); x += IN_W * scale * SHARE[s]; }); }
  else seg(left, IN_W * scale * clamp(pct / 100), pct >= 100 ? K.green : K.blue, 0);
  if (badge != null) { const [sx, sy] = squash(badgeImpact), bs = o.badgeScale ?? 1; const bp = o.badgeAbove ? [p[0] + (BAR_W / 2 - 0.2) * scale, p[1] + 0.5 * scale, p[2] + 0.15] : [p[0] + (BAR_W / 2 - 0.6) * scale, p[1] - 0.66 * scale, p[2] + 0.25]; box(L, cam, bp, { pts: rrectPts(1.25 * bs * scale, 0.66 * bs * scale, 0.2 * bs * scale, 4), sx, sy, depth: 0.18, color: badgeCol, side: mixHex(badgeCol, '#000000', 0.3), tex: pctTex(badge, badgeCol, badgeFg), texW: 1.25 * bs * scale, texH: 0.66 * bs * scale, gloss: 0.25, noFog: true }); }
}

// ================================= world =================================
const PITCH = -0.42;
const ME = { p: [-0.8, 0.93, 1.05], yaw: 0.32 };
const BELT = { x: 0.3, y: 0.45, z0: 0.55, z1: -5.5 };
const DL = [0.3, 1.75, -4.75], VF_Z = -3.05, UP = [0.3, BELT.y + 0.33, -1.45], BELT_END = [0.3, BELT.y + 0.12, 0.35];
const BAR_C = [0.3, 3.25, -5.3];
const SCRX = (u, v, dz = 0.12) => { const cp = Math.cos(PITCH), sp = Math.sin(PITCH), cy = Math.cos(ME.yaw), sy = Math.sin(ME.yaw); const y1 = v * cp - (0.05 + dz) * sp, z1 = v * sp + (0.05 + dz) * cp; return [ME.p[0] + u * cy + z1 * sy, ME.p[1] + y1, ME.p[2] - u * sy + z1 * cy]; };
const PHONE_IN = SCRX(0, 0.25, 0.1);
// file cubes: a deterministic burst pattern (32 shown; the label carries the real count)
const NSHOW = 32;
const FILES = Array.from({ length: NSHOW }, (_, i) => { const a = (i * 2.399963) % (Math.PI * 2), r = 0.18 + ((i * 37) % 11) / 11 * 0.42; return { dx: Math.cos(a) * r * 0.75, dz: Math.sin(a) * r * 0.5, h: 0.5 + ((i * 53) % 7) / 7 * 0.6, lane: i }; });

function phone(L, cam, scr, bounce = 0, glow = 0) {
  const [sx, sy] = squash(bounce), p = ME.p;
  L.push({ p, f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2] - 0.35], 0.75, 0.5, 0.6);
    if (glow > 0) lightPool(ctx, cam, [p[0], 0.01, p[2] + 0.4], 1.5, '5,223,114', 0.35 * glow);
    extrude(ctx, cam, { p: [p[0] - Math.sin(ME.yaw) * 0.55, 0.32, p[2] - Math.cos(ME.yaw) * 0.55], yaw: ME.yaw, pitch: 0.5, pts: rrectPts(0.5, 0.7, 0.08, 3), depth: 0.12, color: K.surface, side: K.surface2, gloss: 0 });
    extrude(ctx, cam, { p, yaw: ME.yaw, pitch: PITCH, sx, sy, pts: PH_PTS, depth: 0.1, color: '#101B30', side: '#0A1222', tex: scr, texW: 0.94, texH: 1.84, gloss: 0.12, edge: 'rgba(216,227,245,0.28)' });
  } });
}
function belt(ctx, cam) {   // drawn first: it is the base everything else sits on (one big object would mis-sort)
  const len = BELT.z0 - BELT.z1, zc = (BELT.z0 + BELT.z1) / 2;
  ({ f: (ctx) => {
    dropShadow(ctx, cam, [BELT.x, 0, zc], 0.9, len / 2, 0.5);
    extrude(ctx, cam, { p: [BELT.x, 0.2, zc], pitch: -Math.PI / 2, pts: rrectPts(1.25, len + 0.2, 0.12, 3), depth: 0.4, color: K.surface, side: K.surface2, gloss: 0.05 });
    extrude(ctx, cam, { p: [BELT.x, BELT.y - 0.03, zc], pitch: -Math.PI / 2, pts: rrectPts(1.0, len, 0.1, 3), depth: 0.06, color: '#1A2740', side: '#0E1729', gloss: 0.08 });
  } }).f(ctx);
}
function stations(L, cam, t, st) {
  // DOWNLOAD hopper (far)
  const [hx, hy] = squash(st.hopBounce || 0);
  box(L, cam, DL, { pts: [[-0.7, 0.42], [0.7, 0.42], [0.36, -0.42], [-0.36, -0.42]], depth: 0.9, sx: hx, sy: hy, color: K.pale, side: K.gray, tex: label('DOWNLOAD', 420, 150, K.pale, K.ink, 58), texW: 1.0, texH: 0.36, gloss: 0.2, shadow: [0.6, 0.45] });
  // VERIFY gate
  const glow = st.scan || 0;
  for (const sx of [-0.64, 0.64]) box(L, cam, [BELT.x + sx, 0.78, VF_Z], { pts: rrectPts(0.16, 1.56, 0.06, 3), depth: 0.18, color: K.gray, side: K.grayDark, gloss: 0.2, shadow: [0.12, 0.12] });
  box(L, cam, [BELT.x, 1.62, VF_Z], { pts: rrectPts(1.5, 0.34, 0.1, 3), depth: 0.22, color: glow > 0.02 ? mixHex(K.pale, K.amber, glow) : K.pale, side: K.gray, tex: label('VERIFY', 420, 96, glow > 0.5 ? K.amber : K.pale, K.ink, 62), texW: 1.4, texH: 0.32, gloss: 0.2 });
  if (glow > 0.02) box(L, cam, [BELT.x, 1.0, VF_Z], { pts: rrectPts(1.12, 1.0, 0.06, 2), depth: 0.04, color: K.amber, side: K.amber, alpha: 0.28 * glow, gloss: 0 });
  // UNPACK pad
  box(L, cam, [BELT.x + 0.95, 0.42, UP[2]], { pts: rrectPts(0.62, 0.3, 0.06, 3), depth: 0.5, color: K.pale, side: K.gray, tex: label('UNPACK', 300, 140, K.pale, K.ink, 54), texW: 0.62, texH: 0.3, gloss: 0.2, shadow: [0.35, 0.3] });
}
// the parcel (with a lid that can flip open)
function parcel(L, cam, p, o = {}) {
  const { lid = 0, impact = 0, alpha = 1, scale = 1 } = o; if (alpha <= 0.01 || scale <= 0.01) return;
  const [sx, sy] = squash(impact), s = scale;
  box(L, cam, p, { pts: rrectPts(0.62 * s, 0.5 * s, 0.06, 3), sx, sy, depth: 0.6 * s, color: K.blue, side: K.blueDeep, tex: parcelTex, texW: 0.62 * s, texH: 0.5 * s, gloss: 0.22, alpha, shadow: [0.38 * s, 0.38 * s] });
  const a = lid * 2.0, ly = p[1] + 0.25 * s * sy + 0.05 + Math.sin(a) * 0.3, lz = p[2] - 0.3 * s + Math.cos(a) * 0.3 * 0 - Math.sin(a) * 0.05;
  box(L, cam, [p[0], ly, lz + (1 - Math.min(1, lid * 1.4)) * 0.3 * s], { pts: rrectPts(0.66 * s, 0.07, 0.03, 2), pitch: -a, depth: 0.64 * s, color: '#5B97F8', side: K.blueDeep, gloss: 0.3, alpha });
}
function fileCube(L, cam, p, o = {}) {
  const { impact = 0, scale = 1, alpha = 1, spin = 0 } = o; if (alpha <= 0.01 || scale <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p, f: (ctx) => { dropShadow(ctx, cam, [p[0], 0, p[2]], 0.12 * scale, 0.1 * scale, 0.45); extrude(ctx, cam, { p, yaw: 0.25 + spin, sx: sx * scale, sy: sy * scale, pts: FILE_PTS, depth: 0.16, color: K.white, side: K.gray, tex: fileTex, texW: 0.16, texH: 0.16, gloss: 0.2, alpha }); } });
}

// ================================= the story (main world) =================================
const BELT_Y = BELT.y + 0.28;
const beltPos = (z) => [BELT.x, BELT_Y, z];
// one parcel trip on a time map: drop from the hopper, ride to VERIFY, scan, ride to UNPACK, open, burst, install
function trip(t, m) {
  const st = { parcel: null, files: [], scan: 0, hopBounce: 0, bytes: [], pct: 0, installed: 0 };
  const dropK = ev(t, m.drop, 0.45);
  if (t < m.drop) return { ...st, before: true };
  st.hopBounce = ev(t, m.drop, 0.1) * (1 - ev(t, m.drop + 0.1, 0.25));
  // bytes stream from the hopper up into the bar during the download window
  const dk = ev(t, m.drop, m.dlDur);
  st.pct = Math.min(99, Math.floor(dk * 100));
  for (let i = 0; i < 6; i++) { const k = (dk * 9 + i / 6) % 1; if (dk > 0 && dk < 0.99) st.bytes.push({ p: hop([DL[0] + (i - 2.5) * 0.08, DL[1] + 0.45, DL[2]], [BAR_C[0] - IN_W / 2 + IN_W * dk, BAR_C[1], BAR_C[2] + 0.3], 0.55, k), k }); }
  // the parcel
  let z = DL[2], y = BELT_Y, impact = 0;
  if (dropK < 1) { y = lerp(DL[1] - 0.2, BELT_Y, easeIn(dropK)); }
  else impact = ev(t, m.drop + 0.45, 0.01) * (1 - ev(t, m.drop + 0.45, 0.2));
  const r1 = ease(ev(t, m.toVerify, m.rideV)), r2 = ease(ev(t, m.toUnpack, m.rideU));
  z = lerp(DL[2], VF_Z, r1); z = lerp(z, UP[2], r2);
  st.scan = ev(t, m.scan, 0.2) * (1 - ev(t, m.scan + m.scanDur, 0.25));
  const lid = ease(ev(t, m.open, 0.35));
  const gone = ev(t, m.open + 0.5, 0.4);
  st.parcel = { p: [BELT.x, y, z], lid, impact, alpha: 1 - gone };
  // file cubes burst out, land on the belt, then hop one by one into the phone
  if (t >= m.open) {
    FILES.forEach((f, i) => {
      const b = ev(t, m.open + 0.05 + i * 0.008, 0.5);
      const land = [BELT.x + f.dx, BELT_Y - 0.15, UP[2] + 0.55 + f.dz + 0.35];
      const inst = m.install + (i / NSHOW) * m.instDur;
      if (t < inst) { const p = hop([BELT.x, BELT_Y + 0.2, UP[2]], land, f.h, b); st.files.push({ p, impact: b >= 1 ? 0 : 0, spin: b * 3 }); return; }
      const k = ev(t, inst, 0.38);
      if (k < 1) st.files.push({ p: hop(land, PHONE_IN, 0.55, k), scale: 1 - 0.6 * k, spin: k * 4 });
      else st.installed++;
    });
  }
  return st;
}
// hook / tour timing (real narration cues)
const TRIP_MAIN = { drop: T.bar2 - 0.05, dlDur: T.download + 0.4 - (T.bar2 - 0.05), toVerify: T.download + 0.35, rideV: 0.7, scan: T.verifies - 0.05, scanDur: 0.65,
  toUnpack: T.file + 0.05, rideU: 0.65, open: T.unpacks - 0.05, install: T.installs - 0.05, instDur: T.so4 - 0.35 - T.installs };
// frame zero shows the end of a trip: bar at 99, files hopping into the phone
const TRIP_HOOK = { drop: -9, dlDur: 1, toVerify: -8, rideV: 0.5, scan: -7.5, scanDur: 0.3, toUnpack: -7, rideU: 0.5, open: -6.5, install: -2.6, instDur: 9 };
// payoff run (fast): every stage feeds its own share of the bar
const TRIP_PAY = { drop: T.building + 0.2, dlDur: 0.85, toVerify: T.building + 0.95, rideV: 0.45, scan: T.building + 1.35, scanDur: 0.3, toUnpack: T.building + 1.65, rideU: 0.4,
  open: T.give - 0.05, install: T.every + 0.1, instDur: T.bar7 + 0.25 - (T.every + 0.1) };

const doneAt = (m) => m.install + ((NSHOW - 1) / NSHOW) * m.instDur + 0.38;
const DONE_MAIN = doneAt(TRIP_MAIN), DONE_PAY = doneAt(TRIP_PAY);
if (DONE_MAIN > SHOTS[SH.proof] - 0.4 || DONE_PAY > CTA_AT - 0.3) throw new Error('100% would land too late to be seen');

// ================================= cameras =================================
const CAM = {
  hook0: { eye: [0.5, 3.45, 3.75], at: [0.0, 1.95, -2.2] }, hook1: { eye: [0.45, 3.4, 3.45], at: [0.05, 2.0, -2.25] },
  counted: { eye: [0.5, 3.4, 0.6], at: [0.2, 2.2, -4.2] },
  tourV: { eye: [1.25, 3.3, 1.9], at: [0.25, 1.65, -3.2] }, tourU: { eye: [1.4, 3.1, 2.4], at: [0.15, 1.6, -2.2] },
  wait: { eye: [0.5, 3.45, 3.9], at: [0.05, 1.95, -2.1] },
  pay0: { eye: [0.7, 3.5, 4.2], at: [0.0, 2.05, -2.1] }, pay1: { eye: [0.45, 3.45, 4.5], at: [0.05, 2.1, -2.1] },
};
const mixCam = (A, B, k) => ({ eye: mix3(A.eye, B.eye, k), at: mix3(A.at, B.at, k) });
function camMain(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++;
  let c;
  if (i === SH.hook) c = mixCam(CAM.hook0, CAM.hook1, ease(ev(t, 0.2, 3.0)));
  else if (i === SH.counted) c = mixCam(CAM.hook1, CAM.counted, ease(ev(t, SHOTS[i], 0.75)));
  else if (i === SH.tour) { c = mixCam(CAM.counted, CAM.tourV, ease(ev(t, SHOTS[i], 0.8))); c = mixCam(c, CAM.tourU, ease(ev(t, T.file - 0.1, 0.8))); }
  else if (i === SH.wait) c = mixCam(CAM.tourU, CAM.wait, ease(ev(t, SHOTS[i], 0.7)));
  else c = mixCam(CAM.pay0, CAM.pay1, ease(ev(t, SHOTS[SH.payoff], CTA_AT - SHOTS[SH.payoff])));
  return camera(c.eye, c.at, 50);
}

function tag(ctx, cam, p, labelStr, k, o = {}) {
  if (k <= 0) return;
  const s = project(cam, p); if (s.z < 0.2) return;
  const size = o.size || 40, w = textW(ctx, labelStr, size, 'IDXB') + size * 1.2;
  const x = clamp(s.x + (o.dx || 0), 110 + w / 2, 890 - w / 2), y = clamp(s.y + (o.dy || 0), 600, 1470);
  const sc = back(k);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  shadow(ctx, 0, size * 0.95, w * 0.45, 10, 0.5);
  ctx.fillStyle = o.fill || K.white; rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  text(ctx, labelStr, 0, size * 0.36, { size, font: 'IDXB', color: o.color || K.ink }); ctx.restore();
}
const FLOOR = { x: 0.2, y: -0.6, z: -1.5, w: 30, h: 0.6, d: 30, colors: { top: K.surface, front: K.surface2, left: K.surface2, right: K.surface2 }, color: K.surface2 };
function horizonFog(ctx, cam) {
  const far = project(cam, [cam.eye[0] + cam.f[0] * 16, 0, cam.eye[2] + cam.f[2] * 16]), mid = project(cam, [cam.eye[0] + cam.f[0] * 8, 0, cam.eye[2] + cam.f[2] * 8]);
  if (far.z < 0.2 || mid.z < 0.2) return;
  const g = ctx.createLinearGradient(0, far.y - 40, 0, mid.y); g.addColorStop(0, 'rgba(3,6,16,1)'); g.addColorStop(1, 'rgba(3,6,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, mid.y));
}

function mainWorld(ctx, t, mode) {
  const cam = camMain(t);
  floor(ctx, cam, FLOOR, { at: [0.2, 0, -1.6], radius: 6.5, strength: 0.2 });
  horizonFog(ctx, cam);
  belt(ctx, cam);
  const L = [];
  let tr, barPct, staged = null, badge, badgeCol = K.white, badgeFg = K.ink, jig = 0, scr, done = false, badgeImpact = 0;
  if (mode === 'payoff') {
    tr = trip(t, TRIP_PAY);
    const fr = { download: tr.before ? 0 : ev(t, TRIP_PAY.drop, TRIP_PAY.dlDur), verify: ev(t, TRIP_PAY.scan, TRIP_PAY.scanDur), unpack: ev(t, TRIP_PAY.open, 0.5),
      install: clamp(tr.installed / NSHOW) };
    staged = fr;
    const tot = STAGES.reduce((a, s) => a + SHARE[s] * fr[s], 0);
    done = tr.installed >= NSHOW;
    badge = done ? 100 : Math.min(99, Math.floor(tot * 100)); badgeCol = done ? K.green : K.white;
    badgeImpact = done ? ev(t, DONE_PAY, 0.1) * (1 - ev(t, DONE_PAY + 0.1, 0.25)) : 0;
    scr = phoneScreen(badge, done ? 'done' : fr.install > 0 ? 'install' : 'download');
  } else if (t < SHOTS[SH.counted]) {
    tr = trip(t, TRIP_HOOK); barPct = 99; badge = 99;
    jig = ev(t, T.stuck - 0.05, 0.1) * (1 - ev(t, T.stuck + 0.35, 0.3));
    scr = phoneScreen(99, 'install');
  } else {
    const rw = ev(t, SHOTS[SH.counted], 0.35);                                   // rewind: the bar empties
    tr = trip(t, TRIP_MAIN);
    barPct = t < TRIP_MAIN.drop ? Math.round(99 * (1 - easeOut(rw))) : tr.pct;
    if (tr.pct >= 99 || t > TRIP_MAIN.drop + TRIP_MAIN.dlDur) barPct = 99;
    done = tr.installed >= NSHOW;
    badge = done ? 100 : barPct; badgeCol = done ? K.green : barPct >= 99 && t > T.download + 0.5 ? K.white : K.white;
    for (const c of [T.verifies, T.unpacks, T.installs, T.hundred]) jig = Math.max(jig, ev(t, c, 0.08) * (1 - ev(t, c + 0.3, 0.3)));
    badgeImpact = done ? ev(t, DONE_MAIN, 0.1) * (1 - ev(t, DONE_MAIN + 0.1, 0.25)) : 0;
    scr = phoneScreen(badge, done ? 'done' : t < TRIP_MAIN.open ? 'download' : 'install');
    if (tr.before) { tr.files = []; tr.parcel = { p: [BELT.x, DL[1] - 0.2, DL[2]], lid: 0, impact: 0, alpha: ev(t, SHOTS[SH.counted] + 0.2, 0.2) }; }
  }
  stations(L, cam, t, tr);
  if (tr.parcel) parcel(L, cam, tr.parcel.p, tr.parcel);
  for (const f of tr.files) fileCube(L, cam, f.p, f);
  for (const b of tr.bytes) L.push({ p: b.p, f: (ctx) => extrude(ctx, cam, { p: b.p, yaw: b.k * 5, sx: 0.12, sy: 0.12, pts: BEAD, depth: 0.12, color: K.blue, side: K.blueDeep, gloss: 0.3 }) });
  bigBar(L, cam, BAR_C, { pct: barPct, staged, badge, badgeCol, badgeFg, jig, badgeImpact });
  const dAt = mode === 'payoff' ? DONE_PAY : DONE_MAIN;
  phone(L, cam, scr, done ? ev(t, dAt, 0.1) * (1 - ev(t, dAt + 0.1, 0.25)) : 0, done ? 1 : 0);
  paint(ctx, cam, L);
  return { cam, tr, done };
}

// ================================= proof set: the real run, replayed =================================
const REPLAY_AT = T.test - 0.15, SPEED = 1.5;                                   // test seconds run 1.5× faster than video time
const simT = (t) => (t - REPLAY_AT) * SPEED;
function sampleAt(s) { const i = clamp(Math.floor(s / 0.05), 0, BAR.length - 1); return BAR[i]; }
const P_BAR1 = [-0.12, 3.05, 0], P_BAR2 = [-0.12, 2.15, 0];
function proofWorld(ctx, t, withQuote) {
  const k = ease(ev(t, SHOTS[SH.proof], SHOTS[SH.payoff] - SHOTS[SH.proof]));
  const cam = camera(mix3([0.8, 2.55, 5.9], [0.3, 2.4, 6.4], k), [0.05, 2.0, -0.2], 42);
  floor(ctx, cam, FLOOR, { at: [0, 0, 0.3], radius: 5.5, strength: 0.22 });
  horizonFog(ctx, cam);
  const L = [];
  // during the quote the same run replays behind the card (the behaviour the quote describes)
  const s = clamp(withQuote ? (t - (T.microsoft - 0.1)) * SPEED : simT(t), 0, RUN.total_s + 0.2), smp = sampleAt(s), stage = smp[1];
  const bytesPct = s >= RUN.total_s ? 100 : smp[2], stagedPct = s >= RUN.total_s ? 100 : smp[3];
  const stuck = bytesPct === 99 && s < RUN.total_s;
  // staged fractions from the sample
  const fr = {}; STAGES.forEach((st) => { const k2 = STAGES.indexOf(st), ks = STAGES.indexOf(stage === 'done' ? 'install' : stage); fr[st] = stage === 'done' || k2 < ks ? 1 : k2 > ks ? 0 : clamp((stagedPct / 100 - STAGES.slice(0, ks).reduce((a, x) => a + SHARE[x], 0)) / SHARE[st]); });
  if (s >= RUN.total_s) STAGES.forEach((x) => (fr[x] = 1));
  const appear = ev(t, SHOTS[SH.proof] + 0.1, 0.4);
  bigBar(L, cam, P_BAR1, { badgeAbove: true, badgeScale: 0.7, pct: bytesPct, badge: bytesPct, badgeCol: stuck ? K.red : bytesPct >= 100 ? K.green : K.white, badgeFg: stuck ? K.white : K.ink, scale: 0.64, jig: stuck ? 0.25 + 0.25 * Math.sin(t * 9) : 0 });
  bigBar(L, cam, P_BAR2, { badgeAbove: true, badgeScale: 0.7, staged: fr, badge: stagedPct, badgeCol: stagedPct >= 100 ? K.green : K.white, scale: 0.64 });
  // stopwatch (test seconds) and stage chips that light as the real run moves
  const sec = Math.min(RUN.total_s, s).toFixed(1), under = withQuote ? 1 - ev(t, T.microsoft, 0.3) * 0.75 : 1;
  box(L, cam, [-1.4, 1.15, 0.5], { pts: circlePts(0.42, 32), depth: 0.18, color: K.white, side: K.gray, tex: watchTex(sec), texW: 0.84, texH: 0.84, gloss: 0.25, shadow: [0.4, 0.3], alpha: under });
  STAGES.forEach((st, i) => {
    const on = stage === st, past = STAGES.indexOf(st) < STAGES.indexOf(stage === 'done' ? 'zz' : stage) || stage === 'done';
    const col = on ? SCOL[st] : past ? mixHex(SCOL[st], '#0B1423', 0.45) : '#1A2740';
    const [sx, sy] = squash(on ? 0.15 + 0.15 * Math.sin(t * 14) : 0);
    box(L, cam, [-0.58 + i * 0.64, 1.0 + (on ? 0.12 : 0), 0.55], { pts: rrectPts(0.6, 0.36, 0.1, 3), sx, sy, depth: 0.2, color: col, side: mixHex(col, '#000000', 0.35), tex: label(st.toUpperCase(), 300, 180, col, on || past ? K.ink : K.gray, 46), texW: 0.6, texH: 0.36, gloss: 0.25, shadow: [0.3, 0.18], alpha: under });
  });
  if (withQuote) {
    const qk = back(ev(t, T.microsoft - 0.05, 0.45)), drop = 1 - easeOut(ev(t, T.microsoft - 0.05, 0.45));
    const qi = ev(t, T.microsoft + 0.4, 0.1) * (1 - ev(t, T.microsoft + 0.5, 0.25));
    const [sx, sy] = squash(qi);
    if (qk > 0.01) box(L, cam, [0, 1.35 + drop * 1.2, 1.15], { pts: rrectPts(2.46, 1.2, 0.14, 4), sx: sx * clamp(qk), sy: sy * clamp(qk), pitch: -0.12, depth: 0.14, color: K.white, side: K.gray, tex: quoteTex, texW: 2.46, texH: 1.2, gloss: 0.15, shadow: [1.1, 0.4] });
  }
  paint(ctx, cam, L);
  // labels from the run
  const lk = appear * (1 - ev(t, SHOTS[SH.payoff] - 0.15, 0.15));
  tag(ctx, cam, [P_BAR1[0] - 0.9, P_BAR1[1] + 0.48, 0], 'BYTES ONLY', lk, { size: 34 });
  tag(ctx, cam, [P_BAR2[0] - 0.9, P_BAR2[1] + 0.48, 0], 'EVERY STAGE', lk, { size: 34, fill: K.cyan });
  if (!withQuote) {
    const t99 = REPLAY_AT + DEMO.bytes_only.reached_99_at_s / SPEED, tEnd = REPLAY_AT + RUN.total_s / SPEED;
    tag(ctx, cam, [0.25, 0.42, 0.9], `99% AT ${DEMO.bytes_only.reached_99_at_s.toFixed(1)} s`, ev(t, t99, 0.25) * (1 - ev(t, tEnd, 0.15)), { size: 40, fill: K.red, color: K.white });
    tag(ctx, cam, [0.25, 0.42, 0.9], `THEN STUCK ${DEMO.bytes_only.stuck_at_99_s.toFixed(1)} s`, ev(t, tEnd + 0.05, 0.25), { size: 40, fill: K.red, color: K.white });
  }
  return { cam };
}

// ================================= labels, kinetic words =================================
function labels(ctx, cam, t, tr) {
  const hookOut = 1 - ev(t, T.now - 0.2, 0.25);
  if (hookOut > 0) text(ctx, 'WHY STUCK?', 540, 690, { size: 124, font: 'IDXB', alpha: hookOut });
  tag(ctx, cam, [ME.p[0] + 0.1, 2.2, ME.p[2] - 0.2], 'STILL INSTALLING', ev(t, T.stuck - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.counted] - 0.1, 0.15)), { size: 36, fill: K.green });
  // counted: only the bytes
  tag(ctx, cam, [BAR_C[0] - 0.9, BAR_C[1] - 0.66, BAR_C[2] + 0.3], 'COUNTS ONLY THE DOWNLOAD', ev(t, T.counted - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.tour] + 0.4, 0.2)), { size: 32, fill: K.blue, color: K.white });
  // tour
  tag(ctx, cam, [BELT.x - 0.75, 1.2, VF_Z], 'VERIFY ✓', ev(t, T.verifies + 0.1, 0.3) * (1 - ev(t, T.file + 0.3, 0.2)), { size: 40, fill: K.amber, dx: -150 });
  tag(ctx, cam, [BELT.x + 0.4, 1.6, UP[2]], `${N_FILES.toLocaleString('en-US')} FILES`, ev(t, T.thousands - 0.05, 0.3) * (1 - ev(t, T.installs - 0.1, 0.2)), { size: 40, fill: K.cyan });
  tag(ctx, cam, [ME.p[0] + 0.3, 2.2, ME.p[2]], 'INSTALLING', ev(t, T.installs, 0.3) * (1 - ev(t, SHOTS[SH.wait] + 0.2, 0.2)), { size: 40, fill: K.green });
  tag(ctx, cam, [BAR_C[0] - 1.0, BAR_C[1] - 0.66, BAR_C[2] + 0.3], 'STILL 99%', ev(t, T.unpacks + 0.2, 0.3) * (1 - ev(t, SHOTS[SH.wait] + 0.1, 0.2)), { size: 36, fill: K.red, color: K.white });
  // wait
  tag(ctx, cam, [BAR_C[0] - 0.9, BAR_C[1] - 0.66, BAR_C[2] + 0.3], '100% ONLY WHEN DONE', ev(t, T.hundred - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.proof] - 0.2, 0.15)), { size: 34, fill: K.white });
  // payoff segment labels
  const pk = ev(t, T.give - 0.1, 0.3) * (1 - ev(t, CTA_AT - 0.3, 0.2));
  tag(ctx, cam, [BAR_C[0] - IN_W / 2 + IN_W * SHARE.download / 2, BAR_C[1] - 0.62, BAR_C[2] + 0.3], `DOWNLOAD ${Math.round(SHARE.download * 100)}%`, pk, { size: 30, fill: K.blue, color: K.white });
  tag(ctx, cam, [BAR_C[0] + IN_W / 2 - IN_W * SHARE.install / 2, BAR_C[1] - 1.3, BAR_C[2] + 0.3], `INSTALL ${Math.round(SHARE.install * 100)}%`, ev(t, T.share - 0.1, 0.3) * (1 - ev(t, CTA_AT - 0.3, 0.2)), { size: 30, fill: K.green, dx: 30 });
  kword(ctx, 'EVERY STAGE', 540, 652, 96, t, T.every - 0.08, { t1: CTA_AT });
  kword(ctx, 'GETS A SHARE.', 540, 754, 96, t, T.share - 0.12, { color: K.green, t1: CTA_AT });
}

const modeAt = (t) => (t >= SHOTS[SH.payoff] ? 'payoff' : t >= SHOTS[SH.quote] ? 'quote' : t >= SHOTS[SH.proof] ? 'proof' : 'main');
function world(ctx, t, mode = modeAt(t)) {
  if (mode === 'proof' || mode === 'quote') { proofWorld(ctx, t, mode === 'quote'); return; }
  const { cam, tr } = mainWorld(ctx, t, mode);
  labels(ctx, cam, t, tr);
}

// ---- captions ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['It raced to ninety-nine', 'percent.'] },
  { t0: T.now, lines: ["Now it's stuck. Why?"] },
  { t0: VL('L2').t0, lines: ['The bar only counted', 'the download.'] },
  { t0: VL('L3').t0, lines: ['But an update still', 'verifies the file,'] },
  { t0: T.unpacks, lines: ['unpacks thousands', 'of pieces,'] },
  { t0: VW('L3', 'and'), lines: ['and installs them.'] },
  { t0: VL('L4').t0, lines: ["A bar shouldn't say", 'a hundred'] },
  { t0: VW('L4', 'until'), lines: ["until it's all done,", 'so it waits.'] },
  { t0: VL('L5').t0, lines: ['Our test hit ninety-nine', 'in three seconds,'] },
  { t0: T.then5, lines: ['then sat there', 'almost two more.'] },
  { t0: VL('L6').t0, lines: ["Microsoft's design guide", 'calls that'] },
  { t0: T.particularly, lines: ['particularly uninformative', 'and annoying.'] },
  { t0: VL('L7').t0, lines: ['Building one?'] },
  { t0: T.give, lines: ['Give every stage', 'its share of the bar.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (const c of CAPS) c.t0 -= 0.06;
for (let i = 0; i < CAPS.length; i++) if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0;
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
  add(0.0, 'blip', { hi: true }); add(T.stuck - 0.05, 'reject');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(SHOTS[SH.counted] + 0.02, 'rewind');
  for (const m of [TRIP_MAIN, TRIP_PAY]) {
    add(m.drop + 0.45, 'clack'); add(m.scan, 'blip'); add(m.open, 'pop'); add(m.open + 0.12, 'pop'); add(m.toVerify, 'slide', { soft: true });
    for (let i = 0; i < NSHOW; i += 4) add(m.install + (i / NSHOW) * m.instDur + 0.36, 'hop', { hi: i % 8 === 0 });
  }
  for (let k = 0; k < 8; k++) add(TRIP_MAIN.drop + (k / 8) * TRIP_MAIN.dlDur, 'tap');                          // bytes ticking in
  add(T.verifies + 0.1, 'match'); add(DONE_MAIN, 'stamp'); add(DONE_MAIN + 0.1, 'chime');
  add(REPLAY_AT, 'slide', { soft: true }); add(REPLAY_AT + DEMO.bytes_only.reached_99_at_s / SPEED, 'reject'); add(REPLAY_AT + RUN.total_s / SPEED, 'match');
  add(T.microsoft - 0.1, 'rewind'); add(T.microsoft + 0.4, 'stamp'); add(T.microsoft - 0.1 + DEMO.bytes_only.reached_99_at_s / SPEED, 'reject');
  add(DONE_PAY, 'match');
  add(T.every - 0.08, 'type'); add(T.share - 0.12, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame ----
const STAGE_TOP = 540, WIPE = 0.5;
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
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  const tw1 = SHOTS[SH.proof], tw2 = SHOTS[SH.payoff];
  if (Math.abs(t - tw1) < WIPE / 2) wipeBetween(ctx, t, tw1, () => world(ctx, t, 'main'), () => world(ctx, t, 'proof'));
  else if (Math.abs(t - tw2) < WIPE / 2) wipeBetween(ctx, t, tw2, () => world(ctx, t, 'quote'), () => world(ctx, t, 'payoff'));
  else if (t < CTA_AT - WIPE / 2) world(ctx, t);
  else wipeBetween(ctx, t, CTA_AT, () => world(ctx, t), () => cta(ctx, t));
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
