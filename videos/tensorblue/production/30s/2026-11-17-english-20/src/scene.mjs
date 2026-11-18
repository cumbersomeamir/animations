// Tensorblue 30s english-20 · episode 01 — "One tick. Where is it?" (how WhatsApp's ticks map a store-and-forward journey)
// Blue Receipt Theatre kit (`brt.mjs`, unchanged) + the 3D stage (`stage3d.mjs`, unchanged) + new `toy3d.mjs`
// (thick extruded toys, fog, depth of field, squash-and-stretch) for the 2026-11-18 "more 3D depth, more fun" feedback.
// A playful miniature world: your phone (on a stand), three floating stepping pads (the bad connection), a SERVER tower
// with a glass window, and your friend's phone far behind. A chunky 3D speech bubble hops pad to pad; every stop keeps
// its copy until the next stop confirms, and confirmations come back as hopping tick tokens. The proof replays the real
// UDP test log (demo/out/delivery-demo.json) on two lanes: send-once vs store-and-forward.
// Colours: Tensorblue palette + tensorblue.com's own amber-400 (clock), red-500 (lost), cyan-400 (online), green-400 (✓ all).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground } from './brt.mjs';
import { camera, project, floor, mix3 } from './stage3d.mjs';
import { extrude, rrectPts, bubblePts, circlePts, tickPts, dropShadow, lightPool, squash, hop, blurred, fogK } from './toy3d.mjs';

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

// ---- the test's result (real UDP run) ---------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/delivery-demo.json'), 'utf8'));
const ONCE = DEMO.send_once, SAF = DEMO.store_and_forward;
if (ONCE.sent !== 20 || ONCE.friend_received !== 3 || SAF.friend_received !== 20 || SAF.lost !== 0 || SAF.server_copies_at_end !== 0
  || SAF.final_ticks.some((k) => k !== 2) || DEMO.params.drop_pct !== 33) throw new Error('demo result changed');

// ---- colours ----
const K = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', blueDeep: '#2757A6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF',
  grayDark: '#788396', white: '#FFFFFF', ink: '#030610', amber: '#FFB900', red: '#FB2C36', cyan: '#00D3F2', green: '#05DF72' };

// ---- cues ----
const T = {
  gray: VW('L1', 'gray'), tick1: VW('L1', 'tick'), two1: VW('L1', 'two'), where: VW('L1', "where's"), now: VW('L1', 'now'),
  each: VW('L2', 'each'), marks: VW('L2', 'marks'), handoff: VW('L2', 'hand-off'),
  clock: VW('L3', 'clock'), still: VW('L3', 'still'), phone3: VW('L3', 'phone'), not3: VW('L3', 'not'), sent3: VW('L3', 'sent'),
  one4: VW('L4', 'one'), sent4: VW('L4', 'sent'), friend: VW('L4', 'friend'), offline: VW('L4', 'offline'), whatsapps: VW('L4', "whatsapp's"),
  keep: VW('L4', 'keep'), encrypted: VW('L4', 'encrypted'), up: VW('L4', 'up'), thirty: VW('L4', 'thirty'),
  phone5: VW('L5', 'phone'), on5: VW('L5', 'on'), two5: VW('L5', 'two'), delivered5: VW('L5', 'delivered'), and5: VW('L5', 'and'), server5: VW('L5', 'server'), deletes: VW('L5', 'deletes'), copy: VW('L5', 'copy'),
  our: VW('L6', 'our'), send6: VW('L6', 'send'), three: VW('L6', 'three'), twenty1: VW('L6', 'twenty'), saf: VW('L6', 'store-and-forward'), all: VW('L6', 'all'), twenty2: VW('L6', 'twenty', 2),
  building: VW('L7', 'building'), hold: VW('L7', 'hold'), until: VW('L7', 'until'), next: VW('L7', 'next'), confirms: VW('L7', 'confirms'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.08;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.14, VL('L3').t0 - 0.1, VL('L4').t0 - 0.14, VL('L5').t0 - 0.11, VL('L6').t0 - 0.14, VL('L7').t0 - 0.16, CTA_AT, 30.01];
const SH = { hook: 0, map: 1, clock: 2, tick: 3, deliver: 4, proof: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ================================= textures =================================
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
function tickGlyph(g, x, y, s, col, n = 1) {
  g.save(); g.strokeStyle = col; g.lineWidth = s * 0.2; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const ox = x + i * s * 0.55; g.beginPath(); g.moveTo(ox - s * 0.45, y); g.lineTo(ox - s * 0.12, y + s * 0.32); g.lineTo(ox + s * 0.48, y - s * 0.36); g.stroke(); }
  g.restore();
}
function clockGlyph(g, x, y, r, col) {
  g.save(); g.strokeStyle = col; g.lineWidth = r * 0.28; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - r * 0.6); g.moveTo(x, y); g.lineTo(x + r * 0.45, y + r * 0.1); g.stroke(); g.restore();
}
function status(g, x, y, s, st) {   // status mark at the end of an outgoing bubble
  if (st === 'clock') clockGlyph(g, x, y, s * 0.42, '#B07F00');
  else if (st === 'tick1') tickGlyph(g, x - s * 0.1, y, s * 0.8, K.grayDark, 1);
  else if (st === 'tick2') tickGlyph(g, x - s * 0.35, y, s * 0.8, K.grayDark, 2);
}
// your phone's screen (generic chat UI, our own drawing — not any app's)
const SCR_W = 520, SCR_H = 1020;
function myScreen(st) {
  return cached(`me|${st}`, SCR_W, SCR_H, (g, w, h) => {
    g.fillStyle = K.surface; g.fillRect(0, 0, w, h);
    g.fillStyle = K.surface2; g.fillRect(0, 0, w, 150);
    g.fillStyle = K.gray; g.beginPath(); g.arc(70, 92, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = K.ink; g.font = '34px IDXB'; g.textAlign = 'center'; g.fillText('S', 70, 104);
    g.fillStyle = K.white; g.font = '40px IDXB'; g.textAlign = 'left'; g.fillText('Sam', 122, 106);
    // one signal bar (the bad connection)
    [0, 1, 2, 3].forEach((i) => { g.fillStyle = i === 0 ? K.amber : 'rgba(183,199,223,0.25)'; rr(g, 410 + i * 20, 70 - i * 12, 13, 22 + i * 12, 3); g.fill(); });
    // incoming
    g.fillStyle = K.white; rr(g, 26, 196, 352, 112, 28); g.fill();
    g.fillStyle = K.ink; g.font = '44px InterSB'; g.fillText('Dinner later?', 54, 268);
    if (st !== 'none') {   // outgoing: big enough to read the tick on a phone
      g.fillStyle = K.pale; rr(g, 92, 352, 402, 176, 30); g.fill();
      g.fillStyle = K.ink; g.font = '50px InterB'; g.fillText('See you at 8!', 122, 428);
      status(g, 440, 488, 64, st);
    }
  });
}
function friendScreen(st) {   // 'off' | 'on' | 'got'
  return cached(`fr|${st}`, SCR_W, SCR_H, (g, w, h) => {
    if (st === 'off') {
      g.fillStyle = '#02040A'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(183,199,223,0.35)'; g.lineWidth = 14; g.lineCap = 'round';
      g.beginPath(); g.arc(w / 2, 470, 70, -Math.PI * 0.32, Math.PI * 1.32); g.stroke(); g.beginPath(); g.moveTo(w / 2, 380); g.lineTo(w / 2, 470); g.stroke();
      g.fillStyle = 'rgba(183,199,223,0.45)'; g.font = '52px IDXB'; g.textAlign = 'center'; g.fillText('OFF', w / 2, 640);
      return;
    }
    g.fillStyle = K.surface; g.fillRect(0, 0, w, h);
    g.fillStyle = K.surface2; g.fillRect(0, 0, w, 150);
    g.fillStyle = K.blue; g.beginPath(); g.arc(70, 92, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = K.white; g.font = '34px IDXB'; g.textAlign = 'center'; g.fillText('A', 70, 104);
    g.fillStyle = K.white; g.font = '40px IDXB'; g.textAlign = 'left'; g.fillText('Alex', 122, 106);
    g.fillStyle = K.pale; rr(g, 142, 196, 352, 112, 28); g.fill();
    g.fillStyle = K.ink; g.font = '44px InterSB'; g.fillText('Dinner later?', 170, 268);
    if (st === 'got') { g.fillStyle = K.white; rr(g, 26, 352, 402, 150, 30); g.fill(); g.fillStyle = K.ink; g.font = '50px InterB'; g.fillText('See you at 8!', 56, 446); }
  });
}
// the 3D bubble's face: the message, its status mark, or scrambled (encrypted) bytes
const BUB_W = 1.0, BUB_H = 0.46;
function bubbleFace(st, enc) {
  return cached(`bub|${st}|${enc}`, 400, 184, (g, w, h) => {
    g.fillStyle = K.pale; g.fillRect(0, 0, w, h);
    if (enc) { g.fillStyle = K.blueDeep; g.font = '46px JBM'; g.textAlign = 'center'; g.fillText('9f2c a71e', w / 2 - 14, 108); }
    else { g.fillStyle = K.ink; g.font = '52px IDXB'; g.textAlign = 'left'; g.fillText('See you at 8!', 26, 104); }
    status(g, w - 48, 150, 44, st);
  });
}
const serverTex = cached('server', 540, 690, (g, w, h) => {      // 300 px per unit on a 1.8 × 2.3 front
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E4ECF8'); gr.addColorStop(1, K.gray);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = K.ink; g.font = '62px IDXB'; g.textAlign = 'center'; g.fillText('SERVER', w / 2, 100);
  g.fillStyle = K.deep; rr(g, 50, 150, w - 100, 270, 34); g.fill();                         // glass window (held messages sit in front of it)
  const gl = g.createLinearGradient(0, 150, 0, 420); gl.addColorStop(0, 'rgba(59,130,246,0.35)'); gl.addColorStop(1, 'rgba(59,130,246,0.05)');
  g.fillStyle = gl; rr(g, 50, 150, w - 100, 270, 34); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(3,6,16,0.16)'; rr(g, 70, 470 + i * 50, w - 140, 28, 14); g.fill(); g.fillStyle = i < 2 ? K.blue : 'rgba(3,6,16,0.25)'; g.beginPath(); g.arc(w - 100, 484 + i * 50, 9, 0, Math.PI * 2); g.fill(); }
});
const clockFace = cached('clockface', 200, 200, (g, w) => { g.fillStyle = K.amber; g.fillRect(0, 0, w, w); clockGlyph(g, w / 2, w / 2, 62, K.ink); });
const padlockFace = cached('lockface', 200, 170, (g, w, h) => { g.fillStyle = K.blue; g.fillRect(0, 0, w, h); g.fillStyle = K.white; g.beginPath(); g.arc(w / 2, 70, 22, 0, Math.PI * 2); g.fill(); rr(g, w / 2 - 10, 78, 20, 52, 6); g.fill(); });
const calFace = cached('cal', 300, 240, (g, w, h) => { g.fillStyle = K.white; g.fillRect(0, 0, w, h); g.fillStyle = K.amber; g.fillRect(0, 0, w, 64); g.fillStyle = K.ink; g.font = '120px IDXB'; g.textAlign = 'center'; g.fillText('30', w / 2, 196); g.font = '34px IDXB'; g.fillText('DAYS', w / 2, 50); });

// ================================= world =================================
const PITCH = -0.42;
const PH = { w: 1.04, h: 2.0, d: 0.1, r: 0.15 };
const PHONE_PTS = rrectPts(PH.w, PH.h, PH.r, 6), PAD_PTS = rrectPts(0.46, 0.46, 0.12, 4), BUB_PTS = bubblePts(BUB_W, BUB_H, 0.17, 1, 5);
const TICK_PTS = tickPts(0.5), CIRC = circlePts(0.2, 28), LOCK_BODY = rrectPts(0.3, 0.25, 0.05, 3), CAL_PTS = rrectPts(0.5, 0.4, 0.06, 3);
const LOCK_U = (() => { const p = [[0.11, 0], [0.11, 0.06]]; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; p.push([0.11 * Math.cos(a), 0.06 + 0.11 * Math.sin(a)]); } p.push([-0.11, 0], [-0.065, 0], [-0.065, 0.06]); for (let i = 10; i >= 0; i--) { const a = (i / 10) * Math.PI; p.push([0.065 * Math.cos(a), 0.06 + 0.065 * Math.sin(a)]); } p.push([0.065, 0]); return p; })();
// layout: a zigzag into depth for the vertical frame — your phone near-left, the server mid-right, your friend far-left
const ME = { p: [-0.78, 0.93, 2.4], yaw: 0.22 }, FR = { p: [-0.6, 0.93, -3.7], yaw: 0.2 };
const SRV = { p: [0.95, 1.15, -0.9], w: 1.8, h: 2.3, d: 1.1 };
const WIN = [0.95, 1.35, -0.35 + 0.16];                                          // where a held message sits (in front of the window)
const SCRX = (who, u, v, dz = 0.12) => { const P = who === 'me' ? ME : FR; const cp = Math.cos(PITCH), sp = Math.sin(PITCH), cy = Math.cos(P.yaw), sy = Math.sin(P.yaw);
  const y1 = v * cp - (PH.d / 2 + dz) * sp, z1 = v * sp + (PH.d / 2 + dz) * cp; return [P.p[0] + u * cy + z1 * sy, P.p[1] + y1, P.p[2] - u * sy + z1 * cy]; };
const ME_BUB = SCRX('me', 0.12, 0.1, 0.18), FR_BUB = SCRX('fr', -0.12, 0.1, 0.18), ME_EXIT = SCRX('me', 0.12, 0.25, 0.55);
const ME_HOVER = [ME_EXIT[0] + 0.12, ME_EXIT[1] + 0.72, ME_EXIT[2] + 0.12];
const PAD_UP = 0.3;                                                               // a bubble resting on a pad sits this far above it
const PADS_A = [0.28, 0.53, 0.77].map((f) => { const q = mix3(ME_EXIT, WIN, f); return [q[0], q[1] - PAD_UP - 0.05 + 0.1 * Math.sin(f * Math.PI), q[2]]; });   // the bad link (pad 2 is the flaky one)
const PADS_B = [[-0.3, 1.0, -0.75], [-0.5, 0.98, -2.0]];                          // round the server's left side to the friend
const ON = (p) => [p[0], p[1] + PAD_UP, p[2]];

// drawables are collected then painted far → near
function phone(L, cam, who, scr, glow = 0, lift = 0, bounce = 0) {
  const P = who === 'me' ? ME : FR, [sx, sy] = squash(bounce), p = [P.p[0], P.p[1] + lift, P.p[2]];
  L.push({ p, f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2] - 0.35], 0.75, 0.5, 0.6);
    if (glow > 0) lightPool(ctx, cam, [p[0], 0.01, p[2] + 0.4], 1.6, who === 'me' ? '59,130,246' : '0,211,242', 0.32 * glow);
    // the little stand behind the phone
    extrude(ctx, cam, { p: [p[0] - Math.sin(P.yaw) * 0.55, 0.32, p[2] - Math.cos(P.yaw) * 0.55], yaw: P.yaw, pitch: 0.5, pts: rrectPts(0.5, 0.7, 0.08, 3), depth: 0.12, color: K.surface, side: K.surface2, gloss: 0 });
    extrude(ctx, cam, { p, yaw: P.yaw, pitch: PITCH, sx, sy, pts: PHONE_PTS, depth: PH.d, color: '#101B30', side: '#0A1222', tex: scr, texW: 0.94, texH: 1.84, gloss: 0.12, edge: 'rgba(216,227,245,0.28)' });
  } });
}
function pad(L, cam, p, scale = 1, glow = 0, col = K.blue) {
  if (scale <= 0.02) return;
  L.push({ p, f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2]], 0.28 * scale, 0.28 * scale, 0.45);
    extrude(ctx, cam, { p, pitch: -Math.PI / 2, sx: scale, sy: scale, pts: PAD_PTS, depth: 0.09, color: glow > 0 ? mixHex(col, K.white, glow * 0.4) : col, side: K.blueDeep, gloss: 0.25 });
  } });
}
function server(L, cam, glow = 0, bounce = 0) {
  const [sx, sy] = squash(bounce), p = [SRV.p[0], SRV.p[1] * sy, SRV.p[2]];
  L.push({ p: [p[0], p[1], p[2] - 0.2], f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2]], 1.25, 0.85, 0.7);
    lightPool(ctx, cam, [p[0], 0.01, p[2] + 0.9], 1.9, '59,130,246', 0.18 + 0.25 * glow);
    extrude(ctx, cam, { p, sx, sy, pts: rrectPts(SRV.w, SRV.h, 0.16, 4), depth: SRV.d, color: '#E2EAF6', side: K.gray, tex: serverTex, texW: SRV.w, texH: SRV.h, gloss: 0.2, ambient: 0.62 });
  } });
}
// the hero message bubble (3D)
function bubble(L, cam, p, o = {}) {
  const { st = 'tick1', enc = false, scale = 1, impact = 0, yaw = 0.2, roll = 0, alpha = 1, shadowOn = true, tint = false } = o;
  if (alpha <= 0 || scale <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p, f: (ctx) => {
    if (shadowOn) dropShadow(ctx, cam, [p[0], 0, p[2]], 0.5 * scale, 0.3 * scale, 0.5);
    extrude(ctx, cam, { p, yaw, roll, sx: sx * scale, sy: sy * scale, pts: BUB_PTS, depth: 0.17, color: tint ? K.red : K.pale, side: tint ? '#A11A22' : K.gray, tex: tint ? null : bubbleFace(st, enc), texW: BUB_W, texH: BUB_H, gloss: 0.3, alpha, ambient: 0.6 });
  } });
}
function tickToken(L, cam, p, o = {}) {
  const { n = 1, scale = 1, yaw = 0.2, alpha = 1, impact = 0 } = o;
  if (alpha <= 0 || scale <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p, f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2]], 0.3 * scale, 0.2 * scale, 0.45);
    for (let i = 0; i < n; i++) extrude(ctx, cam, { p: [p[0] + (i - (n - 1) / 2) * 0.24 * scale, p[1], p[2] + i * 0.01], yaw, sx: sx * scale, sy: sy * scale, pts: TICK_PTS, depth: 0.12, color: K.white, side: K.gray, gloss: 0.3, alpha, ambient: 0.65 });
  } });
}
function clockToken(L, cam, p, scale, alpha = 1) {
  if (scale <= 0.01) return;
  L.push({ p, f: (ctx) => extrude(ctx, cam, { p, yaw: 0.2, sx: scale, sy: scale, pts: CIRC, depth: 0.1, color: K.amber, side: '#B07F00', tex: clockFace, texW: 0.4, texH: 0.4, gloss: 0.3, alpha }) });
}
function padlock(L, cam, p, scale, alpha = 1, impact = 0) {
  if (scale <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p: [p[0], p[1], p[2] + 0.05], f: (ctx) => {
    extrude(ctx, cam, { p: [p[0], p[1] + 0.12 * scale * sy, p[2]], yaw: 0.2, sx: scale * sx, sy: scale * sy, pts: LOCK_U, depth: 0.06, color: K.gray, side: K.grayDark, gloss: 0.3, alpha });
    extrude(ctx, cam, { p, yaw: 0.2, sx: scale * sx, sy: scale * sy, pts: LOCK_BODY, depth: 0.1, color: K.blue, side: K.blueDeep, tex: padlockFace, texW: 0.3, texH: 0.25, gloss: 0.3, alpha });
  } });
}
function calendar(L, cam, p, scale, impact = 0) {
  if (scale <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p, f: (ctx) => extrude(ctx, cam, { p, yaw: 0.15, sx: scale * sx, sy: scale * sy, pts: CAL_PTS, depth: 0.1, color: K.white, side: K.gray, tex: calFace, texW: 0.5, texH: 0.4, gloss: 0.25 }) });
}
function mixHex(a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function paint(ctx, cam, L) {
  L.sort((a, b) => { const za = project(cam, a.p).z, zb = project(cam, b.p).z; return zb - za; });
  for (const d of L) d.f(ctx);
}

// ================================= the story =================================
// hop along a list of points: progress k (0..1) over n segments; returns position and a landing impact
function along(pts, k, h = 0.45) {
  const n = pts.length - 1, x = clamp(k) * n, i = Math.min(n - 1, Math.floor(x)), u = x - i;
  const p = hop(pts[i], pts[i + 1], h, u);
  const impact = (i > 0 && u < 0.18) ? (1 - u / 0.18) : 0;
  return { p, impact, seg: i, u };
}
const PATH_A = [ME_EXIT, ...PADS_A.map(ON), WIN];
const PATH_B = [WIN, ...PADS_B.map(ON), FR_BUB];
const BACK_A = [...PATH_A].reverse(), BACK_B = [...PATH_B].reverse();
// pad 2 (the flaky one): gone while a copy is in the air in the clock shot; back from "One tick"
function pad2Scale(t) {
  if (t < T.not3 - 0.25) return 1;
  if (t < T.one4 - 0.1) return 1 - back(ev(t, T.not3 - 0.25, 0.25));
  return back(ev(t, T.one4 - 0.1, 0.35));
}

// state of the main world at time t
function story(t) {
  const s = { me: 'tick1', fr: 'off', frOn: 0, srvHeld: 1, heldEnc: true, heldScale: 1, lock: 1, cal: 0, bub: [], ticks: [], clock: null, srvBounce: 0, meBounce: 0, frBounce: 0, pad2: pad2Scale(t) };
  // --- hook / map: frame zero state (message kept on the server, one tick on your phone)
  if (t < SHOTS[SH.clock]) {
    // L2: two tick tokens hop to show the hand-offs (phone→server, server→friend)
    const k1 = ev(t, T.marks - 0.1, 0.55), k2 = ev(t, T.handoff - 0.05, 0.6);
    if (k1 > 0 && k1 < 1) s.ticks.push({ ...along(BACK_A, k1, 0.35), n: 1 });
    if (k2 > 0 && k2 < 1) s.ticks.push({ ...along(BACK_B, k2, 0.35), n: 2 });
    s.srvBounce = ev(t, T.where, 0.2) * (1 - ev(t, T.where + 0.2, 0.25));
    return s;
  }
  // --- rewind into the clock shot: the held message zips back to your phone
  const rw = ev(t, SHOTS[SH.clock], 0.45);
  if (t < T.one4 - 0.1) {
    s.me = rw < 0.98 ? 'tick1' : 'clock'; s.srvHeld = 0; s.lock = 0;
    if (rw < 1) { const a = along(BACK_A, easeIn(rw), 0.2); s.bub.push({ p: a.p, st: 'tick1', scale: 0.8 }); }
    // the original pops up out of the screen with a clock and stays there
    const up = back(ev(t, T.still - 0.1, 0.35));
    if (up > 0) { const p = mix3(ME_BUB, ME_HOVER, up); p[1] += 0.05 * Math.sin((t - T.still) * 5); s.bub.push({ p, st: 'clock', scale: lerp(0.5, 0.95, up) }); s.clock = { p: [p[0] + 0.5, p[1] + 0.24, p[2] + 0.05], scale: up * 0.9 }; }
    // a copy tries the bad link and falls through the missing pad
    const cp = ev(t, T.not3 - 0.15, 0.55);
    if (cp > 0) {
      if (cp < 0.62) { const a = along([ME_EXIT, ON(PADS_A[0]), ON(PADS_A[1])], cp / 0.62, 0.4); s.bub.push({ p: a.p, st: 'clock', scale: 0.82, impact: a.impact }); }
      else {   // falls through the missing pad, bumps the floor and fades
        const tf = (t - (T.not3 - 0.15 + 0.55 * 0.62)), y0 = PADS_A[1][1] + PAD_UP, yy = Math.max(0.2, y0 - 9.8 * 0.5 * tf * tf * 0.8), landed = yy <= 0.2;
        const fade = landed ? ev(t, T.not3 + 0.75, 0.5) : 0;
        s.bub.push({ p: [PADS_A[1][0] + tf * 0.15, yy, PADS_A[1][2] + tf * 0.2], st: 'clock', scale: 0.82 * (1 - 0.3 * fade), roll: Math.min(1.2, tf * 2.4), alpha: 1 - fade, tint: true });
        s.lost = { p: [PADS_A[1][0], 0.6, PADS_A[1][2]], k: ev(t, T.not3 + 0.3, 0.25) * (1 - ev(t, T.one4 - 0.4, 0.2)) };
      }
    }
    return s;
  }
  // --- one tick: the resend crosses, the server keeps a copy and sends a tick back
  s.me = 'clock';
  const go = ev(t, T.one4 - 0.1, 0.75);
  if (go < 1) { const a = along(PATH_A, go, 0.42); s.bub.push({ p: a.p, st: 'clock', impact: a.impact, scale: 0.9 }); s.srvHeld = 0; }
  else { s.srvHeld = 1; s.srvBounce = ev(t, T.one4 + 0.65, 0.15) * (1 - ev(t, T.one4 + 0.8, 0.25)); }
  s.heldEnc = t >= T.encrypted + 0.05 && t < T.phone5 + 99;
  s.heldEnc = ev(t, T.encrypted, 0.3) >= 1;
  s.lock = back(ev(t, T.encrypted - 0.15, 0.35)); s.lockImpact = ev(t, T.encrypted + 0.2, 0.1) * (1 - ev(t, T.encrypted + 0.3, 0.2));
  s.cal = back(ev(t, T.thirty - 0.1, 0.35)) * (1 - ev(t, SHOTS[SH.deliver] + 0.2, 0.3));
  s.calImpact = ev(t, T.thirty + 0.25, 0.1) * (1 - ev(t, T.thirty + 0.35, 0.2));
  const tk = ev(t, T.sent4 - 0.05, 0.6);
  if (tk > 0 && tk < 1) s.ticks.push({ ...along(BACK_A, tk, 0.35), n: 1 });
  if (tk >= 1) { s.me = 'tick1'; s.meBounce = ev(t, T.sent4 + 0.55, 0.1) * (1 - ev(t, T.sent4 + 0.65, 0.25)); }
  if (t < SHOTS[SH.deliver]) return s;
  // --- delivered: the friend's phone comes back on, a copy hops over, a two-tick token comes back, the server deletes its copy
  s.frOn = ease(ev(t, T.on5 - 0.15, 0.3)); s.fr = s.frOn > 0.5 ? 'on' : 'off'; s.frBounce = ev(t, T.on5 + 0.15, 0.1) * (1 - ev(t, T.on5 + 0.25, 0.25));
  const cp2 = ev(t, T.two5 - 0.55, 0.7);
  if (cp2 > 0 && cp2 < 1) { const a = along(PATH_B, cp2, 0.4); s.bub.push({ p: a.p, st: 'tick1', enc: true, impact: a.impact, scale: 0.85 }); }
  if (cp2 >= 1) { s.fr = 'got'; }
  const tk2 = ev(t, T.delivered5 - 0.25, 0.55), tk3 = ev(t, T.delivered5 + 0.35, 0.65);
  if (tk2 > 0 && tk2 < 1) s.ticks.push({ ...along(BACK_B, tk2, 0.35), n: 2 });
  if (tk3 > 0 && tk3 < 1) s.ticks.push({ ...along(BACK_A, tk3, 0.35), n: 2 });
  if (tk3 >= 1) { s.me = 'tick2'; s.meBounce = ev(t, T.delivered5 + 1.0, 0.1) * (1 - ev(t, T.delivered5 + 1.1, 0.25)); }
  const del = ev(t, T.deletes - 0.05, 0.4);
  s.heldScale = 1 - easeIn(del); s.lock = s.lock * (1 - easeIn(del));
  s.poof = ev(t, T.deletes + 0.25, 0.5);
  return s;
}

// ================================= cameras =================================
const POSES = [
  { eye: [0.4, 3.0, 6.9], at: [-0.05, 1.6, -1.0], fov: 36 },      // 0 hook: your phone (one tick), the server holding it, your friend far behind
  { eye: [1.9, 5.4, 7.0], at: [0.1, 0.85, -0.8], fov: 42 },       // 1 map: the whole relay from above
  { eye: [0.05, 2.85, 5.6], at: [-0.5, 1.55, 1.15], fov: 46 },    // 2 clock: your phone and the bad link
];
const CAM = {
  tickA: { eye: [1.2, 2.9, 4.9], at: [0.35, 1.3, 0.6] }, tickB: { eye: [-1.7, 2.5, 1.2], at: [-0.55, 1.15, -3.4] }, tickC: { eye: [1.35, 1.95, 2.7], at: [0.92, 1.45, -0.3] },
  frA: { eye: [-1.45, 2.3, -0.75], at: [-0.6, 1.1, -3.7] }, wide: { eye: [0.6, 3.5, 5.5], at: [0.05, 1.15, -0.9] },
  pay0: { eye: [1.3, 3.9, 6.1], at: [0.05, 1.15, -1.0] }, pay1: { eye: [0.55, 3.4, 6.5], at: [0.05, 1.25, -1.0] },
};
const mixCam = (A, B, k) => ({ eye: mix3(A.eye, B.eye, k), at: mix3(A.at, B.at, k) });
function camMain(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++;
  let c;
  if (i === SH.hook) c = mixCam(POSES[0], { eye: [0.3, 2.8, 6.3], at: [-0.05, 1.55, -1.0] }, ease(ev(t, 0.3, 2.8)));
  else if (i === SH.map) c = mixCam({ eye: [0.3, 2.8, 6.3], at: [-0.05, 1.55, -1.0] }, POSES[1], ease(ev(t, SHOTS[i], 0.7)));
  else if (i === SH.clock) c = mixCam(POSES[1], POSES[2], ease(ev(t, SHOTS[i], 0.55)));
  else if (i === SH.tick) {
    c = mixCam(POSES[2], CAM.tickA, ease(ev(t, SHOTS[i], 0.6)));
    c = mixCam(c, CAM.tickB, ease(ev(t, T.friend - 0.3, 0.6)));
    c = mixCam(c, CAM.tickC, ease(ev(t, T.whatsapps - 0.5, 0.7)));
  } else if (i === SH.deliver) {
    c = mixCam(CAM.tickC, CAM.frA, ease(ev(t, SHOTS[i], 0.6)));
    c = mixCam(c, CAM.wide, ease(ev(t, T.delivered5 - 0.1, 0.8)));
  } else c = mixCam(CAM.pay0, CAM.pay1, ease(ev(t, SHOTS[SH.payoff], CTA_AT - SHOTS[SH.payoff])));
  const fov = i === SH.hook ? 36 : i === SH.map ? lerp(36, 42, ease(ev(t, SHOTS[i], 0.7))) : i === SH.clock ? 42 : i === SH.payoff ? 42 : 42;
  return camera(c.eye, c.at, fov);
}

function tag(ctx, cam, p, label, k, o = {}) {
  if (k <= 0) return;
  const s = project(cam, p); if (s.z < 0.2) return;
  const size = o.size || 40, w = textW(ctx, label, size, 'IDXB') + size * 1.2;
  const x = clamp(s.x + (o.dx || 0), 110 + w / 2, 890 - w / 2), y = clamp(s.y + (o.dy || 0), 600, 1470);
  const sc = back(k);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  shadow(ctx, 0, size * 0.95, w * 0.45, 10, 0.5);
  ctx.fillStyle = o.fill || K.white; rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  text(ctx, label, 0, size * 0.36, { size, font: 'IDXB', color: o.color || K.ink }); ctx.restore();
}
const FLOOR = { x: 0.4, y: -0.6, z: -1.5, w: 30, h: 0.6, d: 30, colors: { top: K.surface, front: K.surface2, left: K.surface2, right: K.surface2 }, color: K.surface2 };
function horizonFog(ctx, cam) {   // the floor fades into the navy far away (atmospheric depth)
  const far = project(cam, [cam.eye[0] + cam.f[0] * 16, 0, cam.eye[2] + cam.f[2] * 16]), mid = project(cam, [cam.eye[0] + cam.f[0] * 8, 0, cam.eye[2] + cam.f[2] * 8]);
  if (far.z < 0.2 || mid.z < 0.2) return;
  const g = ctx.createLinearGradient(0, far.y - 40, 0, mid.y); g.addColorStop(0, 'rgba(3,6,16,1)'); g.addColorStop(1, 'rgba(3,6,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, mid.y));
}

function mainWorld(ctx, t) {
  const cam = camMain(t), s = story(t);
  floor(ctx, cam, FLOOR, { at: [0.3, 0, -0.8], radius: 6.5, strength: 0.22 });
  horizonFog(ctx, cam);
  const L = [];
  phone(L, cam, 'me', myScreen(s.me), 1, 0, s.meBounce);
  phone(L, cam, 'fr', friendScreen(s.fr), s.frOn, 0, s.frBounce);
  server(L, cam, s.srvHeld, s.srvBounce);
  PADS_A.forEach((p, i) => pad(L, cam, p, i === 1 ? s.pad2 : 1));
  PADS_B.forEach((p) => pad(L, cam, p, 1));
  if (s.srvHeld > 0 && s.heldScale > 0.01) bubble(L, cam, WIN, { st: 'tick1', enc: s.heldEnc, scale: 0.78 * s.heldScale, yaw: 0, shadowOn: false });
  if (s.lock > 0.01 && s.srvHeld > 0) padlock(L, cam, [WIN[0] + 0.36, WIN[1] + 0.22, WIN[2] + 0.12], s.lock * 0.95, 1, s.lockImpact || 0);
  if (s.cal > 0.01) calendar(L, cam, [SRV.p[0] + 0.48, 0.62, -0.35 + 0.2], s.cal * 1.1, s.calImpact || 0);
  for (const b of s.bub) bubble(L, cam, b.p, { st: b.st, enc: b.enc, scale: b.scale ?? 1, impact: b.impact || 0, roll: b.roll || 0, alpha: b.alpha ?? 1, shadowOn: !b.noShadow, tint: b.tint });
  for (const k of s.ticks) tickToken(L, cam, [k.p[0], k.p[1] + 0.1, k.p[2]], { n: k.n, scale: 1, impact: k.impact });
  if (s.clock) clockToken(L, cam, s.clock.p, s.clock.scale);
  paint(ctx, cam, L);
  return { cam, s };
}

// ================================= proof set (two lanes, the real log) =================================
const LANES = { once: -1.0, saf: 1.0 };
const PR = { phoneZ: 2.05, pads: [[0, 0.5, 1.15], [0, 0.55, 0.45], [0, 0.58, -0.25]], srvZ: -1.25, frZ: -2.35, frOut: 0.95 };
const MINI_PH = rrectPts(0.62, 1.15, 0.1, 4), MINI_PAD = rrectPts(0.38, 0.38, 0.08, 3), MINI_BUB = bubblePts(0.5, 0.24, 0.08, 1, 3), MINI_SRV = rrectPts(1.0, 1.05, 0.1, 3);
const P0 = T.our + 0.05, SCALE_RT = 2.4;                                            // real seconds → video seconds (same for both lanes)
const vt = (r) => P0 + r * SCALE_RT;
const HOPV = 0.5;                                                                  // video seconds for a hop phone → server
function fates(R, design) {
  const by = {};
  for (const e of R.events) { if (e.id == null) continue; (by[e.id] ||= []).push(e); }
  const onAt = R.events.find((e) => e.what === 'phone_on').t;
  const out = [];
  for (let id = 0; id < R.sent; id++) {
    const evs = by[id] || [];
    const attempts = evs.filter((e) => e.what === 'sent_attempt').map((e) => e.t);
    const dropped = new Set(evs.filter((e) => e.what === 'dropped' && e.kind === 'msg').map((e) => e.attempt));
    const tries = attempts.map((t0, j) => ({ t0, lost: dropped.has(j + 1) }));
    const stored = evs.find((e) => e.what === 'stored'), recv = evs.find((e) => e.what === 'received'), noKeep = evs.find((e) => e.what === 'nowhere_to_keep');
    out.push({ id, tries, stored: stored && stored.t, recv: recv && recv.t, noKeep: !!noKeep, design });
  }
  return { list: out, onAt };
}
const F_ONCE = fates(ONCE, 'once'), F_SAF = fates(SAF, 'saf');
function laneObjs(L, cam, x, t, F, label) {
  const fx = x + Math.sign(x) * PR.frOut, ph = [x, 0.5, PR.phoneZ], fr = [fx, 0.58, PR.frZ], srv = [x, 0.53, PR.srvZ];
  const frOn = ev(t, vt(F.onAt), 0.2);
  L.push({ p: ph, f: (ctx) => { dropShadow(ctx, cam, [x, 0, PR.phoneZ - 0.2], 0.45, 0.3, 0.6); extrude(ctx, cam, { p: ph, pitch: -0.75, pts: MINI_PH, depth: 0.07, color: '#101B30', side: '#0A1222', tex: myScreen('tick1'), texW: 0.56, texH: 1.08, gloss: 0.12, edge: 'rgba(216,227,245,0.3)' }); } });
  L.push({ p: fr, f: (ctx) => { dropShadow(ctx, cam, [fx, 0, PR.frZ - 0.15], 0.45, 0.3, 0.6); if (frOn > 0) lightPool(ctx, cam, [fx, 0.01, PR.frZ + 0.4], 1.1, '0,211,242', 0.3 * frOn); extrude(ctx, cam, { p: fr, pitch: -0.3, yaw: -Math.sign(x) * 0.35, pts: MINI_PH, depth: 0.07, color: '#101B30', side: '#0A1222', tex: friendScreen(frOn > 0.5 ? 'on' : 'off'), texW: 0.56, texH: 1.08, gloss: 0.12, edge: 'rgba(216,227,245,0.3)' }); } });
  L.push({ p: srv, f: (ctx) => { dropShadow(ctx, cam, [x, 0, PR.srvZ], 0.7, 0.5, 0.65); extrude(ctx, cam, { p: srv, pts: MINI_SRV, depth: 0.7, color: '#E2EAF6', side: K.gray, tex: serverTex, texW: 1.0, texH: 1.05 * 1.0, gloss: 0.2, ambient: 0.62 }); } });
  PR.pads.forEach((p) => { const q = [x + p[0], p[1], p[2]]; L.push({ p: q, f: (ctx) => { dropShadow(ctx, cam, [q[0], 0, q[2]], 0.2, 0.2, 0.4); extrude(ctx, cam, { p: q, pitch: -Math.PI / 2, pts: MINI_PAD, depth: 0.07, color: K.blue, side: K.blueDeep, gloss: 0.25 }); } }); });
  // messages
  const path1 = [[x, 0.95, PR.phoneZ - 0.15], ...PR.pads.map((p) => [x + p[0], p[1] + 0.12, p[2]]), [x, 1.0, PR.srvZ + 0.42]];
  let held = 0, got = 0;
  for (const m of F.list) {
    for (const tr of m.tries) {
      const v0 = vt(tr.t0), k = (t - v0) / HOPV;
      if (k <= 0) continue;
      if (tr.lost) {
        if (k < 0.5) { const a = along(path1.slice(0, 3), k / 0.5, 0.25); miniBub(L, cam, a.p, 1, a.impact); }
        else { const f = (k - 0.5) * 1.6; if (f < 1.4) miniBub(L, cam, [path1[2][0], path1[2][1] - 1.6 * f * f, path1[2][2]], clamp(1 - f), 0, f * 3, K.red); }
        continue;
      }
      if (k < 1) { const a = along(path1, k, 0.25); miniBub(L, cam, a.p, 1, a.impact); continue; }
      // reached the server
      if (m.design === 'once') {
        if (m.noKeep) { const f = (k - 1) * 1.4; if (f < 1.3) miniBub(L, cam, [x + 0.35 + f * 0.5, 1.0 + 0.6 * f - 1.8 * f * f, PR.srvZ + 0.42], clamp(1 - f * 0.9), 0, -f * 3, K.red); continue; }
        const kk = (k - 1) / 0.9; if (kk < 1) { const a = along([[x, 1.0, PR.srvZ + 0.42], [x + Math.sign(x) * 0.6, 1.2, PR.srvZ - 0.2], [fx, 0.85, PR.frZ + 0.2]], kk, 0.25); miniBub(L, cam, a.p, 1, a.impact); } else got++;
        continue;
      }
      break;
    }
    if (m.design === 'saf' && m.stored != null) {
      const vs = vt(m.stored) + HOPV, vr = m.recv != null ? Math.max(vs + 0.05, vt(m.recv) + HOPV) : 1e9;
      if (t >= vs && t < vr) held++;
      if (t >= vr) { const kk = (t - vr) / 0.9; if (kk < 1) { const a = along([[x, 1.0, PR.srvZ + 0.42], [x + Math.sign(x) * 0.6, 1.2, PR.srvZ - 0.2], [fx, 0.85, PR.frZ + 0.2]], kk, 0.25); miniBub(L, cam, a.p, 1, a.impact); } else got++; }
    }
  }
  // held pile in the server's window
  for (let i = 0; i < Math.min(held, 20); i++) { const q = [x - 0.3 + (i % 4) * 0.2, 0.62 + Math.floor(i / 4) * 0.1, PR.srvZ + 0.4]; miniBub(L, cam, q, 0.62, 0, 0, null, false); }
  return { got, held, frOn, fr };
}
function miniBub(L, cam, p, a = 1, impact = 0, roll = 0, tint = null, shadowOn = true) {
  if (a <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p, f: (ctx) => { if (shadowOn) dropShadow(ctx, cam, [p[0], 0, p[2]], 0.18, 0.1, 0.35); extrude(ctx, cam, { p, yaw: 0, roll, sx, sy, pts: MINI_BUB, depth: 0.08, color: tint || K.pale, side: tint ? mixHex(tint, '#000000', 0.35) : K.gray, gloss: 0.3, alpha: a, ambient: 0.6 }); } });
}
function proofCam(t) { const k = ease(ev(t, SHOTS[SH.proof], SHOTS[SH.payoff] - SHOTS[SH.proof])); return camera(mix3([0, 2.75, 4.7], [0, 3.0, 4.9], k), mix3([0, 0.75, -0.9], [0, 0.7, -1.0], k), 50); }
function proofWorld(ctx, t) {
  const cam = proofCam(t);
  floor(ctx, cam, FLOOR, { at: [0, 0, -0.3], radius: 6, strength: 0.2 });
  horizonFog(ctx, cam);
  const L = [];
  const A = laneObjs(L, cam, LANES.once, t, F_ONCE), B = laneObjs(L, cam, LANES.saf, t, F_SAF);
  paint(ctx, cam, L);
  // labels + counters (only from the log)
  tag(ctx, cam, [LANES.once, 0, PR.phoneZ + 0.2], 'SEND-ONCE', ev(t, SHOTS[SH.proof] + 0.2, 0.3) * (1 + 0.15 * (ev(t, T.send6 - 0.1, 0.12) - ev(t, T.send6 + 0.1, 0.2))), { size: 38, fill: K.white, dy: 10 });
  tag(ctx, cam, [LANES.saf, 0, PR.phoneZ + 0.2], 'STORE-AND-FORWARD', ev(t, SHOTS[SH.proof] + 0.3, 0.3) * (1 + 0.15 * (ev(t, T.saf - 0.1, 0.12) - ev(t, T.saf + 0.1, 0.2))), { size: 34, fill: K.cyan, dy: 10 });
  const cA = ev(t, P0 + 0.2, 0.3), cB = ev(t, P0 + 0.2, 0.3);
  tag(ctx, cam, [LANES.once - PR.frOut, 1.6, PR.frZ - 0.1], `${A.got} / 20`, cA, { size: 52, fill: A.got === 3 && t > T.three - 0.1 ? K.red : K.white, color: A.got === 3 && t > T.three - 0.1 ? K.white : K.ink });
  tag(ctx, cam, [LANES.saf + PR.frOut, 1.6, PR.frZ - 0.1], `${B.got} / 20`, cB, { size: 52, fill: B.got === 20 ? K.green : K.white });
  if (B.held > 0) tag(ctx, cam, [LANES.saf + 0.62, 1.25, PR.srvZ], `HOLDING ${B.held}`, 1, { size: 30, fill: K.blue, color: K.white, dx: 40 });
  return { cam };
}

// ================================= labels, kinetic words =================================
function labels(ctx, cam, t, s) {
  const hookOut = 1 - ev(t, T.where - 0.25, 0.25);
  // map shot: the three stops
  const mk = ev(t, SHOTS[SH.map] + 0.15, 0.3) * (1 - ev(t, SHOTS[SH.clock] - 0.1, 0.15));
  tag(ctx, cam, [ME.p[0], 2.25, ME.p[2]], 'YOU', mk, { size: 36 });
  tag(ctx, cam, [SRV.p[0], SRV.h + 0.35, SRV.p[2]], 'SERVER', mk, { size: 36, fill: K.blue, color: K.white });
  tag(ctx, cam, [FR.p[0], 2.25, FR.p[2]], 'FRIEND', mk, { size: 36 });
  // clock shot
  tag(ctx, cam, [ME.p[0] - 0.1, 0.35, ME.p[2] + 0.5], 'STILL ON YOUR PHONE', ev(t, T.phone3 - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.tick] + 0.2, 0.2)), { size: 34, fill: K.amber });
  if (s.lost) tag(ctx, cam, [s.lost.p[0], s.lost.p[1] - 0.2, s.lost.p[2]], 'LOST ON THE WAY', s.lost.k, { size: 32, fill: K.red, color: K.white, dy: 40 });
  // one tick shot
  tag(ctx, cam, [WIN[0], WIN[1] + 0.75, WIN[2]], 'SENT ✓', ev(t, T.sent4 - 0.05, 0.3) * (1 - ev(t, T.friend - 0.3, 0.2)), { size: 40 });
  tag(ctx, cam, [FR.p[0], 2.3, FR.p[2]], 'OFFLINE', ev(t, T.offline - 0.1, 0.3) * (1 - ev(t, T.whatsapps - 0.35, 0.2)), { size: 40, fill: K.amber });
  tag(ctx, cam, [WIN[0], WIN[1] - 0.62, WIN[2] + 0.1], 'KEPT ON THE SERVER', ev(t, T.keep - 0.1, 0.3) * (1 - ev(t, T.encrypted - 0.2, 0.2)), { size: 34, fill: K.blue, color: K.white });
  tag(ctx, cam, [WIN[0], WIN[1] - 0.62, WIN[2] + 0.1], 'ENCRYPTED', ev(t, T.encrypted, 0.3) * (1 - ev(t, T.up - 0.15, 0.2)), { size: 38, fill: K.blue, color: K.white });
  tag(ctx, cam, [SRV.p[0] - 0.3, 0.5, -0.35 + 0.3], 'UP TO 30 DAYS', ev(t, T.thirty, 0.3) * (1 - ev(t, SHOTS[SH.deliver] + 0.1, 0.2)), { size: 38, fill: K.amber });
  // deliver shot
  tag(ctx, cam, [FR.p[0], 2.35, FR.p[2]], 'BACK ONLINE', ev(t, T.on5 - 0.05, 0.3) * (1 - ev(t, T.two5 - 0.1, 0.2)), { size: 38, fill: K.cyan });
  tag(ctx, cam, [FR.p[0], 2.35, FR.p[2]], 'DELIVERED ✓✓', ev(t, T.delivered5 - 0.05, 0.3) * (1 - ev(t, T.and5 - 0.1, 0.2)), { size: 38, fill: K.green });
  tag(ctx, cam, [WIN[0], WIN[1], WIN[2]], 'COPY DELETED', ev(t, T.deletes + 0.1, 0.3) * (1 - ev(t, SHOTS[SH.proof] - 0.15, 0.15)), { size: 38, fill: K.white });
  // payoff: each stop lights as it holds
  // frame-zero words (fully drawn on frame 0), payoff words
  if (hookOut > 0) {
    text(ctx, 'ONE TICK.', 540, 668, { size: 112, font: 'IDXB', alpha: hookOut });
    text(ctx, 'WHERE IS IT?', 540, 788, { size: 112, font: 'IDXB', color: K.blue, alpha: hookOut });
  }
  kword(ctx, 'HOLD IT', 540, 668, 108, t, T.hold - 0.08, { t1: CTA_AT });
  kword(ctx, 'UNTIL CONFIRMED.', 540, 780, 92, t, T.confirms - 0.12, { color: K.cyan, t1: CTA_AT });
}

// payoff: one message runs the whole relay, every stop holding it until the tick comes back
function payoffStory(t) {
  const s = { me: 'tick2', fr: 'got', frOn: 1, srvHeld: 0, heldEnc: true, heldScale: 1, lock: 0, cal: 0, bub: [], ticks: [], clock: null, srvBounce: 0, meBounce: 0, frBounce: 0, pad2: 1 };
  const t0 = T.hold - 0.2;
  const k1 = ev(t, t0, 0.8), k2 = ev(t, t0 + 0.85, 0.5), k3 = ev(t, t0 + 1.45, 0.8), k4 = ev(t, t0 + 2.3, 0.5);
  if (t < t0) { s.me = 'tick2'; return s; }
  s.me = k2 >= 1 ? (k4 >= 1 ? 'tick2' : 'tick1') : 'clock';
  if (k1 > 0 && k1 < 1) { const a = along(PATH_A, k1, 0.42); s.bub.push({ p: a.p, st: 'clock', impact: a.impact, scale: 0.9 }); }
  if (k1 >= 1) s.srvHeld = 1 - ev(t, t0 + 2.85, 0.3);
  s.heldEnc = false; s.heldScale = 1 - easeIn(ev(t, t0 + 2.85, 0.3));
  if (k2 > 0 && k2 < 1) s.ticks.push({ ...along(BACK_A, k2, 0.35), n: 1 });
  if (k3 > 0 && k3 < 1) { const a = along(PATH_B, k3, 0.4); s.bub.push({ p: a.p, st: 'tick1', impact: a.impact, scale: 0.85 }); }
  s.fr = k3 >= 1 ? 'got' : 'on';
  if (k4 > 0 && k4 < 1) s.ticks.push({ ...along(BACK_B, k4, 0.35), n: 2 });
  s.glowMe = 1 - ev(t, t0 + 0.85, 0.3); s.glowSrv = ev(t, t0 + 0.7, 0.2) * (1 - ev(t, t0 + 2.85, 0.3));
  return s;
}

const modeAt = (t) => (t >= SHOTS[SH.payoff] ? 'payoff' : t >= SHOTS[SH.proof] ? 'proof' : 'main');
function world(ctx, t, mode = modeAt(t)) {
  if (mode === 'proof') { proofWorld(ctx, t); return; }
  if (mode === 'payoff') {
    const cam = camMain(t), s = payoffStory(t);
    floor(ctx, cam, FLOOR, { at: [0.3, 0, -0.8], radius: 6.5, strength: 0.22 });
    horizonFog(ctx, cam);
    const L = [];
    phone(L, cam, 'me', myScreen(s.me), 0.4 + 0.6 * (s.glowMe || 0));
    phone(L, cam, 'fr', friendScreen(s.fr), 1);
    server(L, cam, s.glowSrv || 0);
    PADS_A.forEach((p) => pad(L, cam, p, 1)); PADS_B.forEach((p) => pad(L, cam, p, 1));
    if (s.srvHeld > 0.01) bubble(L, cam, WIN, { st: 'tick1', scale: 0.78 * s.heldScale, yaw: 0, shadowOn: false });
    for (const b of s.bub) bubble(L, cam, b.p, { st: b.st, scale: b.scale, impact: b.impact });
    for (const k of s.ticks) tickToken(L, cam, [k.p[0], k.p[1] + 0.1, k.p[2]], { n: k.n, impact: k.impact });
    paint(ctx, cam, L);
    labels(ctx, cam, t, s);
    return;
  }
  const { cam, s } = mainWorld(ctx, t);
  labels(ctx, cam, t, s);
}

// ---- captions ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['One gray tick, not two.'] },
  { t0: T.where, lines: ["Where's your message", 'right now?'] },
  { t0: VL('L2').t0, lines: ['Each tick marks', 'a hand-off.'] },
  { t0: VL('L3').t0, lines: ['A clock: still on your phone,', 'not sent yet.'] },
  { t0: VL('L4').t0, lines: ['One tick: sent.'] },
  { t0: T.friend, lines: ['Friend offline?'] },
  { t0: T.whatsapps, lines: ["WhatsApp's servers", 'keep it, encrypted,'] },
  { t0: T.up, lines: ['up to thirty days.'] },
  { t0: VL('L5').t0, lines: ['Phone back on?'] },
  { t0: T.two5, lines: ['Two ticks: delivered,'] },
  { t0: T.and5, lines: ['and the server', 'deletes its copy.'] },
  { t0: VL('L6').t0, lines: ['Our bad-link test:'] },
  { t0: T.send6, lines: ['send-once delivered', 'three of twenty;'] },
  { t0: T.saf, lines: ['store-and-forward,', 'all twenty.'] },
  { t0: VL('L7').t0, lines: ['Building chat?'] },
  { t0: T.hold, lines: ['Hold every message until', 'the next stop confirms it.'], tEnd: VL('L8').t0 - 0.05 },
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
  add(0.0, 'blip', { hi: true }); add(T.where, 'clack', { soft: true });
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.marks - 0.1, 'hop'); add(T.handoff - 0.05, 'hop');
  add(SHOTS[SH.clock] + 0.02, 'rewind');
  add(T.still - 0.1, 'pop'); add(T.not3 - 0.15, 'hop'); add(T.not3 + 0.2, 'fall');
  add(T.one4 - 0.1, 'hop'); add(T.one4 + 0.2, 'hop', { hi: true }); add(T.one4 + 0.45, 'hop', { hi: true }); add(T.one4 + 0.65, 'stamp');
  add(T.sent4 + 0.55, 'tap');
  add(T.encrypted - 0.05, 'slot'); add(T.thirty, 'clack');
  add(T.on5 - 0.15, 'blip', { hi: true }); add(T.two5 - 0.55, 'hop'); add(T.two5 + 0.1, 'hop', { hi: true }); add(T.delivered5 + 1.0, 'match');
  add(T.deletes, 'unpop');
  // proof: one soft tick per message arrival from the real log (thinned), a fall per lost message
  for (const [F, x] of [[F_ONCE, 'once'], [F_SAF, 'saf']]) for (const m of F.list) for (const tr of m.tries) if (tr.lost) add(vt(tr.t0) + HOPV * 0.55, 'fall', { soft: true });
  add(T.three, 'reject'); add(T.twenty2, 'match');
  add(T.hold - 0.08, 'type'); add(T.confirms - 0.12, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  const out = e.sort((a, b) => a.t - b.t);
  return out.filter((x, i) => x.type !== 'fall' || !x.soft || !out.slice(0, i).some((y) => y.type === 'fall' && x.t - y.t < 0.22));
}

// ---- frame ----
const STAGE_TOP = 540, WIPE = 0.5;
const bg = makeBackground();
function wipeBetween(ctx, t, tw, drawA, drawB, dir = 1) {
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
  else if (Math.abs(t - tw2) < WIPE / 2) wipeBetween(ctx, t, tw2, () => world(ctx, t, 'proof'), () => world(ctx, t, 'payoff'));
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
