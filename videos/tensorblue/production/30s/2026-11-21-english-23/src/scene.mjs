// Tensorblue 30s english-23 · episode 01 — "Leaked. Never sent." (how an app checks a password against breaches
// without sending it: the k-anonymity range check of Have I Been Pwned's Pwned Passwords, used by 1Password)
// Blue Receipt Theatre kit (`brt.mjs`, unchanged) + `stage3d.mjs` (unchanged) + `toy3d.mjs` (english-20).
// A toy desk world: a phone in a glass case, a HASH press that stamps a 40-tile hash strip receding into depth, a
// capsule that carries ONLY the first five tiles to a far BREACH LIST vault, a drawer that fires back a fan of
// look-alike strips which stack into a tower, and the one matching strip lifting out in red. Every value shown comes
// from a real query to the public range API (demo/out/breach-check.json): CBFDA sent, 2,078 suffixes back,
// password123 seen 2,266,677 times; a fresh random password (DE4AD…) not found.
// Colours: Tensorblue palette + tensorblue.com's own red-500 (leaked / match) and green-400 (not found).
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

// ---- the real query ----------------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/breach-check.json'), 'utf8'));
const WK = DEMO.weak, ST = DEMO.strong;
if (WK.sent_to_service !== 'CBFDA' || !WK.found || WK.times_seen_in_breaches < 2e6 || WK.hash_length !== 40 || WK.sent_characters !== 5
  || Math.abs(WK.returned_suffixes_total - 2000) > 300 || ST.found || ST.sent_characters !== 5) throw new Error('demo result changed');
const HASH = WK.shown_hash;                                         // CBFDAC6008F9CAB4083784CBD1874F76618D2A97
const fmt = (n) => n.toLocaleString('en-US');

// ---- colours / cues ----
const K = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', blueDeep: '#2757A6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF',
  grayDark: '#788396', white: '#FFFFFF', ink: '#030610', red: '#FB2C36', green: '#05DF72', desk: '#0E1A2E' };
const T = {
  leaked: VW('L1', 'leaked'), knows: VW('L1', 'knows'), never: VW('L1', 'never'), sent1: VW('L1', 'sent'),
  apps: VW('L2', 'apps'), one: VW('L2', 'one'), how: VW('L2', 'how'),
  first3: VW('L3', 'first'), becomes: VW('L3', 'becomes'), forty: VW('L3', 'forty-character'), hash3: VW('L3', 'hash'),
  only: VW('L4', 'only'), five: VW('L4', 'five'), leave: VW('L4', 'leave'), phone4: VW('L4', 'phone'),
  breach: VW('L5', 'breach'), returns: VW('L5', 'returns'), every: VW('L5', 'every'), same: VW('L5', 'same'), compares: VW('L5', 'compares'),
  test: VW('L6', 'test'), thousand: VW('L6', 'thousand'), lookalikes: VW('L6', 'look-alikes'), pw6: VW('L6', 'password'), appeared: VW('L6', 'appeared'), million: VW('L6', 'million'),
  building: VW('L7', 'building'), signup: VW('L7', 'sign-up'), check: VW('L7', 'check'), never7: VW('L7', 'never'), leaves7: VW('L7', 'leaves'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.08;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.12, VL('L3').t0 - 0.12, VL('L4').t0 - 0.1, VL('L5').t0 - 0.1, VL('L6').t0 - 0.12, VL('L7').t0 - 0.12, CTA_AT, 30.01];
const SH = { hook: 0, how: 1, hash: 2, five: 3, vault: 4, proof: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS, ctaAt: CTA_AT };
const shotAt = (t) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++; return i; };
const wShot = (t) => Math.min(shotAt(t), SH.payoff);

// ================================= textures =================================
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const tileTex = (ch, sent) => cached(`tile|${ch}|${sent}`, 120, 160, (g, w, h) => { g.fillStyle = sent ? K.blue : K.pale; g.fillRect(0, 0, w, h); g.fillStyle = sent ? K.white : K.ink; g.font = '110px JBM'; g.textAlign = 'center'; g.fillText(ch, w / 2, 118); });
const labelTex = (str, bg, fg, w = 400, h = 120, size = 70, font = 'IDXB') => cached(`lab|${str}|${bg}|${w}x${h}|${size}`, w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `${size}px ${font}`; g.textAlign = 'center'; g.fillText(str, w / 2, h / 2 + size * 0.36); });
const stripTex = (i, match) => cached(`strip|${i}|${match}`, 420, 120, (g, w, h) => { g.fillStyle = match ? K.red : K.white; g.fillRect(0, 0, w, h); g.fillStyle = match ? K.white : K.grayDark; g.font = '40px JBM'; g.textAlign = 'center'; g.fillText(match ? HASH.slice(5, 16) + '…' : WK.example_returned_lines[i % 3].slice(0, 11) + '…', w / 2, 76); });
// the phone: a generic "password check" screen (our own drawing; mirrors the demo's real result, no buttons)
const SCR_W = 520, SCR_H = 1020;
function phoneScreen(mode) {   // 'leaked' | 'checking' | 'signup' | 'clear'
  return cached(`ph|${mode}`, SCR_W, SCR_H, (g, w, h) => {
    const ft = g.fillText.bind(g); g.fillText = (str, x, y) => { const wd = g.measureText(str).width; if (x + wd > w - 60) throw new Error(`phone text overflows card: "${str}" ends at ${Math.round(x + wd)} > ${w - 60}`); ft(str, x, y); };
    g.fillStyle = K.surface; g.fillRect(0, 0, w, h);
    g.fillStyle = K.white; g.font = '46px IDXB'; g.textAlign = 'left'; g.fillText(mode === 'signup' || mode === 'clear' ? 'New password' : 'Password check', 40, 130);
    g.fillStyle = '#16233A'; rr(g, 40, 180, w - 80, 110, 22); g.fill();
    g.fillStyle = K.white; g.font = mode === 'signup' || mode === 'clear' ? '52px InterB' : '46px JBM';
    g.fillText(mode === 'signup' || mode === 'clear' ? '••••••••••••••' : 'password123', 70, 254);
    if (mode === 'leaked') {
      g.fillStyle = K.red; rr(g, 40, 340, w - 80, 220, 26); g.fill();
      g.fillStyle = K.white; g.font = '44px IDXB'; g.fillText('Found in', 76, 418); g.fillText('breach data', 76, 474);
      g.font = '34px InterSB'; g.fillText(`seen ${fmt(WK.times_seen_in_breaches)} times`, 76, 528);
    } else if (mode === 'clear') {
      g.fillStyle = K.green; rr(g, 40, 340, w - 80, 220, 26); g.fill();
      g.fillStyle = K.ink; g.font = '44px IDXB'; g.fillText('Not found in', 76, 418); g.fillText('breach data', 76, 474);
      g.font = '34px InterSB'; g.fillText('only 5 characters sent', 76, 528);
    } else if (mode === 'checking' || mode === 'signup') {
      g.fillStyle = '#16233A'; rr(g, 40, 340, w - 80, 220, 26); g.fill();
      g.fillStyle = K.gray; g.font = '40px IDXB'; g.fillText('Checking…', 76, 462);
    }
    g.fillStyle = K.grayDark; g.font = '30px InterSB'; g.fillText('Only the first 5 hash', 40, 680); g.fillText('characters are sent.', 40, 722);
  });
}
const vaultTex = cached('vault', 600, 720, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E4ECF8'); gr.addColorStop(1, K.gray); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = K.ink; g.font = '64px IDXB'; g.textAlign = 'center'; g.fillText('BREACH', w / 2, 96); g.fillText('LIST', w / 2, 164);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { g.fillStyle = 'rgba(3,6,16,0.13)'; rr(g, 50 + c * 260, 220 + r * 120, 240, 96, 16); g.fill(); g.fillStyle = 'rgba(3,6,16,0.35)'; rr(g, 140 + c * 260, 262 + r * 120, 60, 12, 6); g.fill(); }
});

// ================================= world =================================
const ME = { p: [-0.95, 0.95, 1.35], yaw: 0.42, pitch: -0.28 };
const PRESS = [0.25, 0.32, 1.15];
const VAULT = { p: [2.7, 1.6, -6.6], w: 2.4, h: 3.2, d: 1.5 };
const DRAWER = [VAULT.p[0] - 0.62, 1.15, VAULT.p[2] + VAULT.d / 2 + 0.05];
const STACK = [0.55, 0, 2.05];
const TILE = (i) => [0.62 + i * 0.075, 0.2, 0.75 - i * 0.205];          // the hash strip recedes into depth
const PH_PTS = rrectPts(1.04, 2.0, 0.15, 6), TILE_PTS = rrectPts(0.17, 0.23, 0.04, 2), STRIP_PTS = rrectPts(0.7, 0.2, 0.04, 2);
function mixHex(a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function paint(ctx, cam, L) { for (const d of L) if (d.base) d.f(ctx); const R = L.filter((d) => !d.base); R.sort((a, b) => project(cam, b.p).z - project(cam, a.p).z); for (const d of R) d.f(ctx); }

function phone(L, cam, scr, bounce = 0, caseA = 1) {
  const [sx, sy] = squash(bounce), p = ME.p;
  L.push({ p, f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2] - 0.3], 0.8, 0.5, 0.6);
    extrude(ctx, cam, { p: [p[0] - Math.sin(ME.yaw) * 0.5, 0.33, p[2] - Math.cos(ME.yaw) * 0.5], yaw: ME.yaw, pitch: 0.5, pts: rrectPts(0.5, 0.7, 0.08, 3), depth: 0.12, color: K.surface, side: K.surface2, gloss: 0 });
    extrude(ctx, cam, { p, yaw: ME.yaw, pitch: ME.pitch, sx, sy, pts: PH_PTS, depth: 0.1, color: '#101B30', side: '#0A1222', tex: scr, texW: 0.94, texH: 1.84, gloss: 0.14, edge: 'rgba(216,227,245,0.3)' });
  } });
  if (caseA > 0.01) L.push({ p: [p[0], 0.9, p[2] + 0.42], f: (ctx) => {   // the glass case: the password stays inside
    extrude(ctx, cam, { p: [p[0], 0.02, p[2]], yaw: ME.yaw, pitch: -Math.PI / 2, pts: rrectPts(1.5, 1.0, 0.12, 4), depth: 0.04, color: K.blue, side: K.blueDeep, alpha: 0.35 * caseA, gloss: 0 });
    extrude(ctx, cam, { p: [p[0] + Math.sin(ME.yaw) * 0.45, 1.0, p[2] + Math.cos(ME.yaw) * 0.45], yaw: ME.yaw, pts: rrectPts(1.5, 2.0, 0.16, 4), depth: 0.03, color: K.pale, side: K.pale, alpha: 0.05 * caseA, gloss: 0.25, edge: `rgba(216,227,245,${0.45 * caseA})`, edgeW: 2.5 });
  } });
}
function press(L, cam, punch = 0) {
  const [sx, sy] = squash(punch);
  L.push({ p: PRESS, f: (ctx) => {
    dropShadow(ctx, cam, [PRESS[0], 0, PRESS[2]], 0.5, 0.4, 0.6);
    extrude(ctx, cam, { p: [PRESS[0], 0.32 * sy, PRESS[2]], sx, sy, pts: rrectPts(0.8, 0.64, 0.1, 3), depth: 0.6, color: '#E2EAF6', side: K.gray, tex: labelTex('HASH', '#E2EAF6', K.ink, 400, 320, 120), texW: 0.8, texH: 0.64, gloss: 0.25 });
  } });
}
function tile(L, cam, p, ch, o = {}) {
  const { sent = false, scale = 1, alpha = 1, impact = 0, yaw = 0.18, roll = 0 } = o; if (alpha <= 0.01 || scale <= 0.01) return;
  const [sx, sy] = squash(impact);
  L.push({ p, f: (ctx) => { if (p[1] < 0.6) dropShadow(ctx, cam, [p[0], 0, p[2]], 0.12 * scale, 0.08 * scale, 0.45);
    extrude(ctx, cam, { p, yaw, roll, sx: sx * scale, sy: sy * scale, pts: TILE_PTS, depth: 0.08, color: sent ? K.blue : K.pale, side: sent ? K.blueDeep : K.gray, tex: tileTex(ch, sent), texW: 0.17, texH: 0.23, gloss: 0.3, alpha }); } });
}
function capsule(L, cam, p, label, k = 1) {
  if (k <= 0.01) return;
  L.push({ p, f: (ctx) => { dropShadow(ctx, cam, [p[0], 0, p[2]], 0.4, 0.2, 0.4);
    extrude(ctx, cam, { p, yaw: 0.2, sx: k, sy: k, pts: rrectPts(0.98, 0.34, 0.17, 4), depth: 0.26, color: K.blue, side: K.blueDeep, tex: labelTex(label, K.blue, K.white, 560, 190, 120, 'JBM'), texW: 0.98, texH: 0.34, gloss: 0.4 }); } });
}
function vault(L, cam, drawerK, label) {
  L.push({ p: [VAULT.p[0], VAULT.p[1], VAULT.p[2] - 0.3], f: (ctx) => {
    dropShadow(ctx, cam, [VAULT.p[0], 0, VAULT.p[2]], 1.6, 1.0, 0.7);
    lightPool(ctx, cam, [VAULT.p[0], 0.01, VAULT.p[2] + 1.3], 2.2, '59,130,246', 0.2);
    extrude(ctx, cam, { p: [VAULT.p[0], 0, VAULT.p[2]], pts: rrectPts(VAULT.w, VAULT.h, 0.18, 4).map(([u, v]) => [u, v + VAULT.h / 2]), depth: VAULT.d, color: '#E2EAF6', side: K.gray, tex: vaultTex, texW: VAULT.w, texH: VAULT.h, gloss: 0.18, ambient: 0.62 });
  } });
  if (drawerK > 0.01) L.push({ p: [DRAWER[0], DRAWER[1], DRAWER[2] + 0.5 * drawerK], f: (ctx) => extrude(ctx, cam, { p: [DRAWER[0], DRAWER[1] - 0.1, DRAWER[2] + 0.45 * drawerK], pts: rrectPts(0.9, 0.36, 0.06, 3), depth: 0.9, color: K.blue, side: K.blueDeep, tex: labelTex(label, K.blue, K.white, 450, 180, 110, 'JBM'), texW: 0.9, texH: 0.36, gloss: 0.3 }) });
}
function strip(L, cam, p, i, o = {}) {
  const { match = false, alpha = 1, yaw = 0.15, roll = 0, scale = 1, pitch = 0 } = o; if (alpha <= 0.01) return;
  L.push({ p, f: (ctx) => extrude(ctx, cam, { p, yaw, roll, pitch, sx: scale, sy: scale, pts: STRIP_PTS, depth: 0.05, color: match ? K.red : K.white, side: match ? '#A11A22' : K.gray, tex: stripTex(i, match), texW: 0.7, texH: 0.2, gloss: 0.3, alpha, noFog: match }) });
}

// ================================= the story =================================
const N_BACK = 26;                                                            // strips drawn for the ~2,000 returned
function state(t, i) {
  const s = { scr: 'leaked', tiles: [], capsule: null, drawer: 0, strips: [], stackN: 0, match: 0, caseA: 1, punch: 0, phoneBounce: 0, label: 'CBFDA', hashSrc: HASH };
  const pay = i === SH.payoff;
  if (pay) { s.label = ST.sent_to_service; s.scr = 'signup'; }
  // timeline anchors (story time) — the payoff replays the same choreography faster with the strong password
  const A = pay ? { hash: T.signup - 0.3, five: T.check - 0.2, launch: T.check + 0.15, arrive: T.check + 0.85, back: T.check + 1.0, land: T.never7 - 0.1, verdict: T.leaves7 }
    : { hash: T.first3 - 0.05, five: T.five - 0.15, launch: T.leave - 0.05, arrive: T.returns - 0.35, back: T.every - 0.1, land: T.compares + 0.25, verdict: T.compares + 0.15 };
  if (!pay && t < SHOTS[SH.hash]) { s.scr = 'leaked'; s.match = 1 - ev(t, SHOTS[SH.how] + 0.2, 0.4); return s; }
  if (!pay && t < A.verdict) s.scr = 'checking';
  if (!pay && t >= A.verdict) s.scr = 'leaked';
  if (pay && t >= A.verdict) s.scr = 'clear';
  s.punch = ev(t, A.hash, 0.12) * (1 - ev(t, A.hash + 0.12, 0.3));
  // the hash strip pops out tile by tile
  const chars = pay ? (ST.sent_to_service + 'X'.repeat(35)) : HASH;
  for (let j = 0; j < 40; j++) {
    const k = ev(t, A.hash + 0.05 + j * (pay ? 0.012 : 0.045), 0.22);
    if (k <= 0) continue;
    let p = hop(PRESS.map((v, q) => (q === 1 ? 0.5 : v)), TILE(j), 0.35, easeOut(k)), sent = j < 5, scale = 1, alpha = 1, impact = k < 1 ? 0 : ev(t, A.hash + 0.27 + j * 0.03, 0.01) * 0;
    if (sent) {
      const lift = ev(t, A.five, 0.3);
      p = mix3(p, [TILE(j)[0], 0.55 + 0.05 * Math.sin(t * 6 + j), TILE(j)[2]], ease(lift));
      const pack = ev(t, A.launch - 0.25, 0.25);
      if (pack > 0) { p = mix3(p, [1.0, 0.75, 0.55], easeIn(pack)); scale = 1 - 0.7 * pack; alpha = 1 - pack; }
    } else {
      const stay = ev(t, A.five + 0.15, 0.4);                                 // the other 35 slide home under the glass
      if (stay > 0 && !pay) p = mix3(p, [ME.p[0] + 0.25 + (j % 12) * 0.07, 0.08 + Math.floor((j - 5) / 12) * 0.0, ME.p[2] + 0.4 - Math.floor((j - 5) / 12) * 0.09], ease(stay) * 0);
    }
    if (pay && !sent) alpha = 0;                                               // payoff: the strong hash is never shown, only its 5 sent characters
    s.tiles.push({ p, ch: pay && !sent ? '•' : chars[j], sent, scale, alpha });
  }
  // the capsule flies to the vault
  const fly = ev(t, A.launch, A.arrive - A.launch);
  if (fly > 0 && fly < 1) s.capsule = { p: hop([1.0, 0.75, 0.55], [DRAWER[0], DRAWER[1] + 0.5, DRAWER[2] + 0.4], CAPSULE_HOP, ease(fly)), k: back(Math.min(1, fly * 5)) };   // low arc: stays under the headline
  s.drawer = ease(ev(t, A.arrive - 0.05, 0.35)) * (1 - ev(t, (pay ? CTA_AT : SHOTS[SH.proof] + 0.3), 0.4));
  // the look-alikes fly back and stack into a tower
  for (let j = 0; j < N_BACK; j++) {
    const k = ev(t, A.back + j * ((A.land - A.back - 0.5) / N_BACK), 0.55);
    if (k <= 0) continue;
    const top = [STACK[0] + Math.sin(j * 2.1) * 0.03, 0.03 + j * 0.055, STACK[2] + Math.cos(j * 1.7) * 0.03];
    if (k < 1) s.strips.push({ p: hop([DRAWER[0], DRAWER[1], DRAWER[2] + 0.6], top, 0.8, ease(k)), i: j, roll: (1 - k) * 0.6, flat: ease(Math.max(0, k - 0.6) / 0.4) });
    else s.strips.push({ p: top, i: j, roll: 0, flat: 1, yaw: Math.sin(j * 1.3) * 0.12 });
  }
  s.stackN = s.strips.filter((x) => x.roll === 0).length;
  if (!pay) s.match = ease(ev(t, A.verdict - 0.05, 0.45));
  s.phoneBounce = ev(t, A.verdict, 0.1) * (1 - ev(t, A.verdict + 0.1, 0.25));
  return s;
}

// ================================= cameras =================================
const mixCam = (a, b, k) => ({ eye: mix3(a.eye, b.eye, k), at: mix3(a.at, b.at, k) });
const CAM = {
  hook0: { eye: [0.55, 1.85, 5.3], at: [-0.35, 1.18, 0.5] }, hook1: { eye: [0.45, 1.8, 4.95], at: [-0.4, 1.2, 0.5] },
  how: { eye: [2.1, 2.5, 5.4], at: [0.45, 0.75, -1.6] },
  hash: { eye: [1.9, 1.05, 2.6], at: [0.6, 0.3, -1.6] },
  five: { eye: [1.55, 1.15, 2.3], at: [0.75, 0.45, 0.2] },
  vault: { eye: [3.6, 2.6, 0.2], at: [1.8, 1.0, -4.8] }, vaultBack: { eye: [2.2, 2.4, 5.0], at: [0.3, 0.85, -0.5] },
  proof: { eye: [1.9, 2.1, 4.6], at: [0.0, 1.0, 1.2] },
  pay0: { eye: [1.0, 2.25, 5.5], at: [-0.15, 1.0, -0.5] }, pay1: { eye: [0.8, 2.2, 5.9], at: [-0.15, 1.05, -0.5] },
};
function camAt(t) {
  const i = wShot(t); let c, fov = 44;
  if (i === SH.hook) c = mixCam(CAM.hook0, CAM.hook1, ease(ev(t, 0.2, SHOTS[1] - 0.2)));
  else if (i === SH.how) c = mixCam(CAM.hook1, CAM.how, ease(ev(t, SHOTS[i], 1.1)));
  else if (i === SH.hash) { c = mixCam(CAM.how, CAM.hash, ease(ev(t, SHOTS[i], 0.6))); fov = 46; }
  else if (i === SH.five) { c = mixCam(CAM.hash, CAM.five, ease(ev(t, SHOTS[i], 0.5))); fov = 46; }
  else if (i === SH.vault) { c = mixCam(CAM.five, CAM.vault, ease(ev(t, SHOTS[i], 0.8))); c = mixCam(c, CAM.vaultBack, ease(ev(t, T.every - 0.2, 1.2))); }
  else if (i === SH.proof) c = mixCam(CAM.vaultBack, CAM.proof, ease(ev(t, SHOTS[i], 0.8)));
  else c = mixCam(CAM.pay0, CAM.pay1, ease(ev(t, SHOTS[i], CTA_AT - SHOTS[i])));
  return camera(c.eye, c.at, fov);
}

const FLOOR = { x: 0.8, y: -0.6, z: -2.5, w: 40, h: 0.6, d: 40, colors: { top: K.desk, front: K.surface2, left: K.surface2, right: K.surface2 }, color: K.surface2 };
function horizonFog(ctx, cam) {
  const far = project(cam, [cam.eye[0] + cam.f[0] * 18, 0, cam.eye[2] + cam.f[2] * 18]), mid = project(cam, [cam.eye[0] + cam.f[0] * 9, 0, cam.eye[2] + cam.f[2] * 9]);
  if (far.z < 0.2 || mid.z < 0.2) return;
  const g = ctx.createLinearGradient(0, far.y - 60, 0, mid.y); g.addColorStop(0, 'rgba(3,6,16,1)'); g.addColorStop(1, 'rgba(3,6,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, mid.y));
}
function world(ctx, t) {
  const i = wShot(t), cam = camAt(t), s = state(t, i);
  floor(ctx, cam, FLOOR, { at: [0.3, 0, 0.5], radius: 7, strength: 0.2 });
  horizonFog(ctx, cam);
  const L = [];
  phone(L, cam, phoneScreen(s.scr), s.phoneBounce, s.caseA);
  press(L, cam, s.punch);
  vault(L, cam, s.drawer, s.label);
  for (const x of s.tiles) tile(L, cam, x.p, x.ch, { sent: x.sent, scale: x.scale, alpha: x.alpha });
  if (s.capsule) capsule(L, cam, s.capsule.p, s.label, s.capsule.k);
  for (const x of s.strips) strip(L, cam, x.p, x.i, { roll: x.roll, pitch: -1.45 * x.flat, yaw: x.yaw ?? 0.15 });
  if (s.match > 0.01) { const mp = i <= SH.how ? [0.05, 1.12 + 0.03 * Math.sin(t * 4), 2.05] : mix3([STACK[0], 0.03 + 13 * 0.055, STACK[2]], [STACK[0] + 0.55, 1.05, STACK[2] + 0.5], ease(s.match)); L.push({ p: mp, base: false, f: (ctx) => lightPool(ctx, cam, [mp[0], 0.01, mp[2]], 0.35, '251,44,54', 0.12 * s.match) }); strip(L, cam, mp, 99, { match: true, scale: i <= SH.how ? 0.95 * s.match : 1 + 0.35 * s.match, yaw: i <= SH.how ? 0.25 : 0.05, roll: i <= SH.how ? -0.12 : 0, pitch: i <= SH.how ? 0 : -1.45 * (1 - ease(s.match)) }); }
  paint(ctx, cam, L);
  return { cam, s, i };
}

// ================================= headlines (one at a time) =================================
const HEAD_CX = 500, HEAD_MAXW = 700, CAPSULE_HOP = Number(process.env.CAPSULE_HOP || 0.5);
function headlines(ctx, t, info) {
  if (t < SHOTS[SH.how] + 0.25) {
    const k = 1 - ev(t, SHOTS[SH.how] - 0.05, 0.25);
    ctx.save(); ctx.shadowColor = 'rgba(3,6,16,0.95)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 4;
    text(ctx, 'LEAKED.', HEAD_CX, 590, { size: 110, font: 'IDXB', color: K.red, alpha: k });
    text(ctx, 'NEVER SENT.', HEAD_CX, 704, { size: 110, font: 'IDXB', alpha: k });
    ctx.restore();
  }
  // stage headlines: centred on the caption axis (x 500) and fitted to 700 px so they clear the vault on the right
  const hl = (str, y, size, t0, o) => { const w = textW(ctx, str, size, 'IDXB', -1); kword(ctx, str, HEAD_CX, y, w > HEAD_MAXW ? size * HEAD_MAXW / w : size, t, t0, o); };
  hl('HOW?', 640, 150, T.how - 0.06, { t1: SHOTS[SH.hash] - 0.15, color: K.blue });
  hl('40 CHARACTERS', 620, 84, T.forty - 0.08, { t1: SHOTS[SH.five] - 0.15 });
  hl('ONLY 5 LEAVE.', 620, 104, SHOTS[SH.five] + 0.15, { t1: T.leave + 0.05, color: K.blue });   // gone before the capsule rises through this zone
  hl('PHONE COMPARES', 620, 84, T.compares - 0.06, { t1: SHOTS[SH.proof] - 0.15 });
  hl(`${fmt(WK.returned_suffixes_total)} BACK`, 620, 110, T.thousand - 0.08, { t1: T.pw6 - 0.25 });
  hl(`SEEN ${fmt(WK.times_seen_in_breaches)}×`, 620, 92, T.appeared - 0.1, { t1: SHOTS[SH.payoff] - 0.15, color: K.red });
  hl('CHECK, DON\'T SEND.', 612, 84, T.check - 0.06, { t1: CTA_AT, color: K.green });
}

// ---- captions (upper safe band y 280-460) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['This password leaked.'] },
  { t0: VW('L1', 'your'), lines: ['Your app knows,', 'but never sent it.'] },
  { t0: VL('L2').t0, lines: ['Apps like 1Password', 'do this. How?'] },
  { t0: VL('L3').t0, lines: ['First, the password becomes', 'a forty-character hash.'] },
  { t0: VL('L4').t0, lines: ['Only the first five characters', 'leave your phone.'] },
  { t0: VL('L5').t0, lines: ['The breach list returns', 'every hash'] },
  { t0: VW('L5', 'that'), lines: ['that starts the same,'] },
  { t0: VW('L5', 'and'), lines: ['and your phone compares.'] },
  { t0: VL('L6').t0, lines: ['Our test got two', 'thousand look-alikes,'] },
  { t0: VW('L6', 'and'), lines: ['and password123 appeared', 'over two million times.'] },
  { t0: VL('L7').t0, lines: ['Building sign-up?'] },
  { t0: T.check, lines: ['Check this way, and the', 'password never'] },
  { t0: T.leaves7, lines: ['leaves the phone.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
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
  add(0.0, 'blip', { hi: true }); add(T.leaked - 0.05, 'reject'); add(T.never - 0.05, 'slot');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.how - 0.06, 'type');
  add(T.first3 - 0.05, 'stamp'); for (let j = 0; j < 40; j += 4) add(T.first3 + j * 0.045 + 0.2, 'tap');
  add(T.five - 0.15, 'pop'); add(T.leave - 0.05, 'hop', { hi: true });
  add(T.returns - 0.4, 'slot'); add(T.every - 0.1, 'slide');
  for (let j = 0; j < 26; j += 3) add(T.every - 0.1 + j * ((T.compares + 0.25 - (T.every - 0.1) - 0.5) / 26) + 0.55, 'clack', { soft: true });
  add(T.compares + 0.15, 'reject');
  add(T.thousand - 0.08, 'type'); add(T.appeared - 0.1, 'type');
  add(T.signup - 0.3, 'stamp'); add(T.check + 0.15, 'hop', { hi: true }); add(T.leaves7, 'match'); add(T.chime, 'chime');
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
