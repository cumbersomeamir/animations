// scene.mjs — Ideaverse AI tips #03 "Turn a messy voice note into a clear to-do list".
// Restores the production-01 riso Prompt Press (same press, palette, plates, print/reveal motion); everyday workflow:
// voice note -> exact prompt -> checklist with empty boxes -> check against the note -> tear off the list.
import { GlobalFonts } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { W, H, Sheet, Layer, PITCH, roughRect, wob } from './riso.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FD = path.join(HERE, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(path.join(FD, 'space-grotesk/files/space-grotesk-latin-700-normal.woff2'), 'SG7');
GlobalFonts.registerFromPath(path.join(FD, 'jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'), 'JBM');

export const FPS = 30, N = 900;
export const NARR = [
  { id: 's1', t: 0.30 }, { id: 's2', t: 3.35 }, { id: 's3', t: 9.2 },
  { id: 's4', t: 14.3 }, { id: 's5', t: 19.6 }, { id: 's6', t: 23.4 },
];
export const CAPS = [
  [0.25, 3.0, ['Your head is full, but', 'your to-do list is empty.']],
  [3.3, 5.0, ['Record a quick voice note:']],
  [5.0, 8.9, ['email the client, buy groceries,', 'book the dentist next week.']],
  [9.15, 11.6, ['In an AI tool that', 'supports voice input, say:']],
  [11.6, 13.95, ['“Turn this into a checklist.']],
  [14.25, 15.5, ['Keep every task,']],
  [15.5, 19.3, ['use only deadlines I mentioned,', 'and flag anything unclear.”']],
  [19.55, 21.4, ['Now you have a list you can use.']],
  [21.4, 23.25, ['Check it against your note.']],
  [23.35, 27.4, ['The AI organised your tasks;', 'it hasn’t done them.']],
];
export const CUE = {
  rec: 3.5, scraps: [5.09, 5.81, 7.09], padAway: 3.35, feed: [8.6, 9.7],
  flip: [12.26, 14.3, 17.5], line: [[12.26, 13.3], [14.3, 14.85], [15.56, 16.9], [17.5, 18.45]],
  copyTag: 18.6, shrink: [19.25, 19.75], list: [19.6, 20.6], tag: 20.75,
  side: [21.4, 22.1], links: [22.3, 22.6, 22.9], boxes: 25.6, tear: [26.3, 28.0], stop: [28.0, 29.2], regMark: 29.05,
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inv = (a, b, x) => clamp((x - a) / (b - a));
const outBack = (k) => { const s = 1.8; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
const outCubic = (k) => 1 - Math.pow(1 - k, 3);
const inOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const kick = (t, t0, amp, dec = 0.12, f = 38) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) / dec) * Math.sin((t - t0) * f));
const NAVY = { navy: 1 };
const SLOTS = [[125, 575, 240, 120], [420, 575, 240, 120], [715, 575, 240, 120]];
const layer = new Layer(), capLayer = new Layer();
let FIELD = null;
const T = (L, s, x, y, size, tones, o = {}) => L.text(s, x, y, `700 ${size}px ${o.mono ? 'JBM' : 'SG7'}`, tones, o);
const box = (L, r, tones, seed, B, rad = 12) => L.fill(roughRect(r[0], r[1], r[2], r[3], rad, seed, B), tones);
const rim = (L, r, tones, seed, B, rad = 12, w = 4) => L.stroke(roughRect(r[0], r[1], r[2], r[3], rad, seed, B, 1.8), tones, w);
const card = (L, r, seed, B) => { box(L, r, {}, seed, B, 14); rim(L, r, NAVY, seed + 1, B, 14, 4); L.stroke(roughRect(r[0] + 3, r[1] + 2, r[2] - 4, r[3] - 3, 14, seed + 2, B, 2.2), { navy: 0.7 }, 1.8); };
const tf = (L, fn) => L.transform(fn), reset = (L) => L.transform((c) => c.setTransform(1, 0, 0, 1, 0, 0));

function fieldSheet() {
  if (FIELD) return FIELD;
  const s = new Sheet().fromPaper();
  layer.begin([0, 0, W, H]);
  layer.fill((c) => { c.beginPath(); c.rect(0, 0, W, H); }, { amber: 0.06 });
  layer.fill((c) => { c.beginPath(); c.rect(0, 1580, W, 340); }, { amber: 0.2, navy: 0.06 });
  layer.print(s, PITCH.field, 0);
  FIELD = s; return s;
}

// ---------------------------------------------------------------- the production-01 press (restored)
function press(L, t, B) {
  box(L, [150, 1505, 780, 62], { navy: 0.85, mint: 0.15 }, 11, B, 14);
  for (const x of [190, 850]) box(L, [x, 1560, 40, 95], { navy: 0.9, amber: 0.25 }, 12 + x, B, 8);
  box(L, [360, 1520, 360, 34], { navy: 1, mint: 0.35 }, 13, B, 8);
  T(L, 'IDEAVERSE · AI TIPS', 540, 1545, 20, {}, { mono: true, align: 'center', knock: true, ls: 4 });
  for (const x of [92, 966]) box(L, [x, 790, 22, 720], { navy: 0.8, mint: 0.25 }, 20 + x, B, 8);
  box(L, [90, 538, 900, 252], { navy: 0.9, mint: 0.35, amber: 0.15 }, 1, B, 26);
  SLOTS.forEach(([x, y, w, h], i) => { box(L, [x - 6, y - 6, w + 12, h + 12], {}, 30 + i, B, 14); L.stroke(roughRect(x - 6, y - 6, w + 12, h + 12, 14, 40 + i, B, 2), { navy: 0.6 }, 3); });
  box(L, [390, 708, 300, 34], { navy: 1, mint: 0.35 }, 14, B, 8);
  T(L, 'PROMPT PRESS', 540, 733, 22, {}, { mono: true, align: 'center', knock: true, ls: 6 });
  const run = t < CUE.stop[0] ? t : CUE.stop[0] + (1 - Math.pow(1 - inv(CUE.stop[0], CUE.stop[1], t), 2)) * (CUE.stop[1] - CUE.stop[0]) * 0.5;
  box(L, [115, 790, 850, 52], { navy: 0.7, mint: 0.2 }, 2, B, 24);
  for (let k = 0; k < 14; k++) { const x = 130 + ((k * 64 + run * 220) % 832); L.stroke((c) => { c.beginPath(); c.moveTo(x, 796); c.lineTo(x + 18, 836); }, { mint: 1 }, 7); }
  for (const x of [115, 965]) { L.fill((c) => { c.beginPath(); c.arc(x, 816, 32, 0, 7); }, { mint: 0.85, navy: 0.4 }); L.fill((c) => { c.beginPath(); c.arc(x, 816, 10, 0, 7); }, {}); }
}

// plates: GOAL / CONTEXT / OUTPUT (production-01) flip to SORT / KEEP TASKS / FLAG UNCLEAR as the prompt is spoken
function plate(L, i, t, B) {
  const [x, y, w, h] = SLOTS[i], f = CUE.flip[i];
  const fk = inv(f - 0.2, f + 0.2, t), sy = Math.abs(Math.cos(fk * Math.PI)), flipped = fk >= 0.5;
  const tone = [{ mint: 1 }, { navy: 1 }, { amber: 1 }][i], knock = i === 1;
  const cy = y + h / 2 + kick(t, f + 0.2, 5);
  tf(L, (c) => { c.translate(x + w / 2, cy); c.scale(1, Math.max(0.04, sy)); c.translate(-(x + w / 2), -cy); });
  box(L, [x, cy - h / 2, w, h], tone, 50 + i, B);
  const lab = flipped ? [['SORT'], ['KEEP', 'TASKS'], ['FLAG', 'UNCLEAR']][i] : [['GOAL'], ['CONTEXT'], ['OUTPUT']][i];
  const size = lab.length > 1 ? 30 : 36, tx = x + w / 2 + 30, tones = knock ? {} : NAVY;
  lab.forEach((s, j) => T(L, s, tx, cy + (lab.length > 1 ? (j ? 30 : -6) : 13), size, tones, { align: 'center', knock }));
  // icons
  const ix = x + 40, icol = knock ? {} : NAVY;
  if (!flipped) {
    if (i === 0) for (const r of [24, 15, 6]) L.stroke((c) => { c.beginPath(); c.arc(ix, cy, r, 0, 7); }, NAVY, 4);
    if (i === 1) { L.fill((c) => { c.beginPath(); c.moveTo(ix - 22, cy); c.lineTo(ix, cy - 20); c.lineTo(ix + 22, cy); c.lineTo(ix + 22, cy + 22); c.lineTo(ix - 22, cy + 22); c.closePath(); }, {}); L.fill((c) => { c.beginPath(); c.rect(ix - 6, cy + 6, 12, 16); }, NAVY); }
    if (i === 2) for (let r = 0; r < 3; r++) for (let q = 0; q < 2; q++) L.stroke((c) => { c.beginPath(); c.rect(ix - 22 + q * 22, cy - 18 + r * 12, 22, 12); }, NAVY, 2.5);
  } else {
    if (i === 0) for (let r = 0; r < 3; r++) { L.stroke((c) => { c.beginPath(); c.rect(ix - 22, cy - 22 + r * 16, 10, 10); }, NAVY, 2.5); L.stroke((c) => { c.beginPath(); c.moveTo(ix - 6, cy - 17 + r * 16); c.lineTo(ix + 22, cy - 17 + r * 16); }, NAVY, 4); }
    if (i === 1) { L.fill((c) => { c.beginPath(); c.arc(ix, cy - 8, 13, 0, 7); }, {}); L.stroke((c) => { c.beginPath(); c.moveTo(ix, cy + 4); c.lineTo(ix, cy + 24); }, {}, 5, { knock: true }); }
    if (i === 2) { L.stroke((c) => { c.beginPath(); c.moveTo(ix - 14, cy + 24); c.lineTo(ix - 14, cy - 24); }, NAVY, 4); L.fill((c) => { c.beginPath(); c.moveTo(ix - 12, cy - 24); c.lineTo(ix + 22, cy - 14); c.lineTo(ix - 12, cy - 2); c.closePath(); }, icol, { over: true }); }
  }
  reset(L);
}

// ---------------------------------------------------------------- hook: microphone + tangled speech ribbon
function ribbonPts(t) {
  const n = 90, pts = [];
  const straight = inOut(inv(CUE.rec, CUE.feed[0], t)), feed = inOut(inv(CUE.feed[0], CUE.feed[1], t));
  const grow = outCubic(inv(-0.3, 1.2, t));
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * grow;
    // tangled loops (hook)
    const a = u * 18 + t * 1.2;
    const tx = 330 + u * 520 + 70 * Math.cos(a) + 30 * Math.cos(a * 2.3);
    const ty = 1010 + 90 * Math.sin(a * 0.9) + 40 * Math.sin(a * 2.1) - u * 60;
    // straightened tape heading up into the drum (setup -> feed)
    const sx = 330 + u * 480, sy = 1000 - u * 120 + 18 * Math.sin(u * 9 + t * 3);
    let x = tx + (sx - tx) * straight, y = ty + (sy - ty) * straight;
    y += (-240 * feed) * (0.4 + u);                                   // pulled up into the press
    pts.push([x, Math.max(y, 845)]);
  }
  return pts;
}
function microphone(L, t, B) {
  const away = inv(CUE.feed[0], CUE.feed[1] + 0.4, t); if (away >= 1) return;
  const dx = -380 * outCubic(away);
  const mx = 230 + dx, my = 1080;
  // stand
  L.stroke((c) => { c.beginPath(); c.arc(mx, my + 10, 96, 0.1 * Math.PI, 0.9 * Math.PI); }, NAVY, 10);
  L.stroke((c) => { c.beginPath(); c.moveTo(mx, my + 106); c.lineTo(mx, my + 250); }, NAVY, 12);
  box(L, [mx - 90, my + 246, 180, 28], { navy: 1, mint: 0.3 }, 200, B, 12);
  // capsule
  box(L, [mx - 62, my - 130, 124, 210], { navy: 1, mint: 0.4 }, 201, B, 62);
  for (let k = 0; k < 6; k++) L.stroke((c) => { c.beginPath(); c.moveTo(mx - 40, my - 92 + k * 24); c.lineTo(mx + 40, my - 92 + k * 24); }, {}, 5, { knock: true });
  // REC light pulses while recording
  if (t >= CUE.rec && t < CUE.feed[0]) { const on = Math.floor(t * 3) % 2 === 0; L.fill((c) => { c.beginPath(); c.arc(mx + 76, my - 118, 15, 0, 7); }, on ? { amber: 1, navy: 0.2 } : { amber: 0.4 }); T(L, 'REC', mx + 100, my - 110, 24, NAVY, { mono: true }); }
}
function speechRibbon(L, t, B) {
  if (t >= CUE.feed[1] + 0.2) return;
  const pts = ribbonPts(t);
  const path = (c) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
  L.stroke(path, { mint: 1, navy: 0.15 }, 30);
  L.stroke(path, { navy: 0.55 }, 4);
  // word fragments riding the ribbon: jumbled in the hook, readable once recorded
  const st = inv(CUE.rec, CUE.feed[0], t);
  const words = st < 0.5 ? ['email…', 'uh,', 'groceries', 'dentist?', 'next week'] : ['email the client', 'buy groceries', 'book dentist next week'];
  if (t < CUE.scraps[0] - 0.1) words.forEach((w, i) => {
    const p = pts[Math.min(pts.length - 1, Math.floor(((i + 0.6) / words.length) * pts.length))];
    const j = wob(300 + i, B, 2)();
    if (p[1] < 860) return;
    T(L, w, p[0] + j, p[1] - 30, st < 0.5 ? 26 : 28, NAVY, { mono: true, align: 'center' });
  });
}
function emptyPad(L, t, B) {
  const k = inv(CUE.padAway, CUE.padAway + 0.4, t); if (k >= 1) return;
  const x = 600 + 500 * outCubic(k), y = 1190;
  card(L, [x, y, 340, 270], 210, B);
  T(L, 'TO-DO', x + 28, y + 52, 32, NAVY);
  for (let i = 0; i < 3; i++) { L.stroke(roughRect(x + 30, y + 86 + i * 58, 30, 30, 5, 211 + i, B), NAVY, 3); L.stroke((c) => { c.beginPath(); c.moveTo(x + 76, y + 114 + i * 58); c.lineTo(x + 300, y + 114 + i * 58); }, { navy: 0.35 }, 3); }
}

// ---------------------------------------------------------------- setup: three task scraps on the press desk
const SCRAP = [
  { x: 130, y: 1000, w: 380, h: 170, rot: -0.07, lab: ['email', 'the client'], icon: 'mail' },
  { x: 570, y: 975, w: 380, h: 170, rot: 0.06, lab: ['buy', 'groceries'], icon: 'bag' },
  { x: 300, y: 1240, w: 470, h: 190, rot: -0.03, lab: ['book the dentist', 'next week'], icon: 'tooth' },
];
function scraps(L, t, B) {
  SCRAP.forEach((s, i) => {
    const a = CUE.scraps[i], k = inv(a - 0.05, a + 0.3, t); if (k <= 0) return;
    const fk = inv(CUE.feed[0] + i * 0.12, CUE.feed[0] + 0.55 + i * 0.12, t); if (fk >= 1) return;
    const sc = outBack(k) * (1 - 0.7 * fk), cx = s.x + s.w / 2, cy = s.y + s.h / 2 - 300 * fk * fk;
    tf(L, (c) => { c.translate(cx, cy); c.rotate(s.rot * (1 - fk)); c.scale(sc, sc); c.translate(-s.w / 2, -s.h / 2); });
    card(L, [0, 0, s.w, s.h], 220 + i * 5, B);
    // icon block
    const ix = 26, iy = 30, tone = [{ mint: 1 }, { amber: 1 }, { navy: 1 }][i];
    box(L, [ix, iy, 110, 110], tone, 240 + i, B, 14);
    if (s.icon === 'mail') { L.fill((c) => { c.beginPath(); c.rect(ix + 18, iy + 30, 74, 52); }, {}); L.stroke((c) => { c.beginPath(); c.moveTo(ix + 18, iy + 30); c.lineTo(ix + 55, iy + 60); c.lineTo(ix + 92, iy + 30); }, NAVY, 5); L.stroke((c) => { c.beginPath(); c.rect(ix + 18, iy + 30, 74, 52); }, NAVY, 4); }
    if (s.icon === 'bag') { L.fill((c) => { c.beginPath(); c.moveTo(ix + 22, iy + 42); c.lineTo(ix + 88, iy + 42); c.lineTo(ix + 80, iy + 96); c.lineTo(ix + 30, iy + 96); c.closePath(); }, {}); L.stroke((c) => { c.beginPath(); c.arc(ix + 55, iy + 42, 18, Math.PI, 0); }, NAVY, 5); L.fill((c) => { c.beginPath(); c.arc(ix + 46, iy + 66, 11, 0, 7); }, { mint: 1 }); L.fill((c) => { c.beginPath(); c.arc(ix + 66, iy + 72, 10, 0, 7); }, { amber: 1, mint: 0.6 }); }
    if (s.icon === 'tooth') { L.fill((c) => { c.beginPath(); c.moveTo(ix + 24, iy + 40); c.bezierCurveTo(ix + 24, iy + 14, ix + 86, iy + 14, ix + 86, iy + 40); c.lineTo(ix + 80, iy + 92); c.lineTo(ix + 66, iy + 92); c.lineTo(ix + 56, iy + 66); c.lineTo(ix + 46, iy + 92); c.lineTo(ix + 32, iy + 92); c.closePath(); }, {}); }
    T(L, s.lab[0], 156, 78, 38, NAVY); T(L, s.lab[1], 156, 126, 38, i === 2 ? { navy: 1, amber: 1 } : NAVY);
    if (i === 2) { L.stroke((c) => { c.beginPath(); c.moveTo(156, 140); c.lineTo(340, 140); }, { amber: 1 }, 7); }
    reset(L);
  });
}

// ---------------------------------------------------------------- mechanism: the exact prompt prints
const PROMPT = [
  ['Turn this into a checklist.', { mint: 0.5 }, { mint: 1 }, 'S'],
  ['Keep every task.', { navy: 1 }, { navy: 1 }, 'K'],
  ['Use only deadlines I mentioned.', { navy: 1 }, { navy: 1 }, 'K'],
  ['Flag anything unclear.', { amber: 0.6 }, { amber: 1 }, 'F'],
];
function promptCard(L, t, B) {
  if (t < CUE.feed[1] - 0.1) return;
  const appear = outCubic(inv(CUE.feed[1] - 0.1, CUE.feed[1] + 0.35, t));
  const sh = inOut(inv(CUE.shrink[0], CUE.shrink[1], t));            // shrinks up to make room for the checklist
  const side = inOut(inv(CUE.side[0], CUE.side[1], t));
  if (side >= 1) return;
  const x0 = 110, y0 = 870, w = 860, h = 400, s = (1 - 0.5 * sh) * appear, X = x0 + (w * (1 - s)) / 2, Y = y0 - 10 * sh;
  tf(L, (c) => { c.translate(X, Y); c.scale(s, s); });
  card(L, [0, 0, w, h], 260, B);
  // header: say it (voice input) + copy this prompt
  box(L, [26, 22, 54, 54], { navy: 1 }, 261, B, 27); L.fill((c) => { c.beginPath(); c.roundRect(44, 32, 18, 28, 9); }, {}); L.stroke((c) => { c.beginPath(); c.arc(53, 52, 15, 0.15 * Math.PI, 0.85 * Math.PI); }, {}, 3.5, { knock: true });
  T(L, 'SAY OR TYPE THIS PROMPT', 96, 58, 24, NAVY, { mono: true, ls: 2 });
  if (t >= CUE.copyTag) { const k = outBack(inv(CUE.copyTag, CUE.copyTag + 0.25, t)); box(L, [w - 250, 20, 226 * k + 1, 50], { amber: 1 }, 262, B, 10); if (k > 0.8) T(L, 'COPY THIS PROMPT', w - 137, 53, 22, NAVY, { mono: true, align: 'center' }); }
  const vk = 1 - inv(CUE.line[0][0] - 0.2, CUE.line[0][0] + 0.1, t);
  if (vk > 0) {
    box(L, [120, 120, 96, 150], { navy: 1, mint: 0.4 }, 263, B, 48);
    for (let q = 0; q < 4; q++) L.stroke((c) => { c.beginPath(); c.moveTo(140, 150 + q * 28); c.lineTo(196, 150 + q * 28); }, {}, 5, { knock: true });
    L.stroke((c) => { c.beginPath(); c.arc(168, 230, 74, 0.12 * Math.PI, 0.88 * Math.PI); }, NAVY, 8);
    for (let q = 0; q < 16; q++) { const hh = 20 + 70 * Math.abs(Math.sin(q * 1.7 + t * 9)) * vk; box(L, [290 + q * 32, 200 - hh / 2, 18, hh], { mint: 1, navy: 0.3 }, 264 + q, B, 9); }
    box(L, [290, 290, 300, 48], { mint: 1 }, 290, B, 10); T(L, 'VOICE INPUT', 440, 323, 24, NAVY, { mono: true, align: 'center', ls: 3 });
  }
  PROMPT.forEach(([str, band, solid, chip], i) => {
    const [a, b] = CUE.line[i], k = inv(a, b, t); if (k <= 0) return;
    const ly = 140 + i * 74, tx = 96, knock = chip === 'K';
    box(L, [26, ly - 42, 52, 52], solid, 270 + i, B, 8);
    T(L, chip, 52, ly - 3, 32, knock ? {} : NAVY, { align: 'center', knock });
    L.cx.navy.font = '700 48px SG7'; const rw = (L.cx.navy.measureText(str).width + 26) * outCubic(k);
    L.fill(roughRect(tx - 12, ly - 46, rw, 60, 6, 280 + i, B), band, { over: !knock });
    L.each((c, key) => {
      if (!knock && key !== 'navy' && key !== 'mask') return;
      c.beginPath(); c.rect(tx - 14, ly - 56, rw + 4, 80); c.clip(); c.font = '700 48px SG7';
      if (knock) c.fillStyle = key === 'mask' ? '#fff' : '#000'; else { c.fillStyle = '#fff'; c.globalCompositeOperation = 'lighten'; }
      c.fillText(str, tx, ly);
    });
  });
  reset(L);
}

// ---------------------------------------------------------------- result: checklist with empty boxes
const ITEMS = [['Email the client', null], ['Buy groceries', null], ['Book dentist', 'next week']];
function checklist(L, t, B, o = {}) {
  const k = inv(CUE.list[0], CUE.list[1], t); if (k <= 0) return;
  const side = inOut(inv(CUE.side[0], CUE.side[1], t));
  const tear = inv(CUE.tear[0], CUE.tear[1], t);
  // main position -> right column when shown side by side with the note
  const W0 = 860, H0 = 420, s = 1 - 0.47 * side;
  let X = 110 + (555 - 110) * side, Y = 1075 - 85 * side;
  let rot = 0, lift = 0;
  if (tear > 0) { const e = inOut(inv(0.25, 1, tear)); lift = e; rot = 0.12 * e; X += -150 * e; Y += -40 * e; }
  const sc = s * (1 + 0.3 * lift);
  tf(L, (c) => { c.translate(X + (W0 * s) / 2, Y + (H0 * s) / 2); c.rotate(rot); c.scale(sc, sc); c.translate(-W0 / 2, -H0 / 2); });
  card(L, [0, 0, W0, H0], 300, B);
  // perforated top edge (tear line)
  for (let q = 0; q < 26; q++) L.fill((c) => { c.beginPath(); c.arc(24 + q * 32.5, 74, 4, 0, 7); }, { navy: 0.6 });
  box(L, [26, 18, 170, 40], { mint: 1 }, 301, B, 8); T(L, 'CHECKLIST', 111, 46, 22, NAVY, { mono: true, align: 'center', ls: 2 });
  T(L, 'example', 214, 46, 22, NAVY, { mono: true });
  ITEMS.forEach(([lab, dl], i) => {
    const rk = inv(CUE.list[0] + i * 0.2, CUE.list[0] + i * 0.2 + 0.3, t); if (rk <= 0) return;
    const ry = [148, 262, 362][i];
    const pulse = t >= CUE.boxes && t < CUE.boxes + 1.2 ? 1 : 0;
    L.stroke(roughRect(34, ry - 40, 50, 50, 8, 310 + i, B), pulse ? { navy: 1, amber: 1 } : NAVY, pulse ? 7 : 5);   // empty box
    T(L, lab, 112, ry, 50, NAVY);
    if (dl) { T(L, '— next week', 112 + 330, ry, 50, NAVY); L.stroke((c) => { c.beginPath(); c.moveTo(112 + 372, ry + 12); c.lineTo(112 + 640, ry + 12); }, { amber: 1 }, 7); }
    if (i === 0 && t >= CUE.tag) { const kk = outBack(inv(CUE.tag, CUE.tag + 0.25, t)); box(L, [112, ry + 18, 430 * kk + 1, 46], { amber: 1 }, 320, B, 10); if (kk > 0.8) T(L, 'UNCLEAR? ASK: which client?', 128, ry + 51, 26, NAVY, { mono: true }); }
  });
  reset(L);
  if (tear > 0.15 && tear < 1) { // the torn-off stub stays on the desk
    const ex = 110 + 445 * side, ey = 1075 - 85 * side;
    L.stroke((c) => { c.beginPath(); for (let q = 0; q <= 18; q++) c.lineTo(ex + 20 + q * 22 * s, ey + (74 + (q % 2 ? 8 : -6)) * s); }, NAVY, 3);
  }
}

// ---------------------------------------------------------------- payoff: original note beside the checklist
function noteCard(L, t, B) {
  const k = outCubic(inv(CUE.side[0], CUE.side[1], t)); if (k <= 0) return;
  const x = 100 - 500 * (1 - k), y = 1000, w = 420, h = 470;
  card(L, [x, y, w, h], 330, B);
  box(L, [x + 22, y + 18, 230, 40], { navy: 1 }, 331, B, 8); T(L, 'VOICE NOTE', x + 137, y + 46, 22, {}, { mono: true, align: 'center', knock: true, ls: 2 });
  T(L, 'example', x + 266, y + 46, 22, NAVY, { mono: true });
  const lines = [['“email the client,', 0], ['buy groceries,', 1], ['book the dentist', 2], ['next week.”', 2]];
  lines.forEach(([s, task], i) => {
    const ly = y + 128 + i * 72, lit = t >= CUE.links[task];
    if (lit) L.fill(roughRect(x + 20, ly - 40, w - 40, 56, 6, 340 + i, B), [{ mint: 0.5 }, { mint: 0.5 }, { amber: 0.55 }][task], { over: true });
    T(L, s, x + 32, ly, 34, NAVY);
  });
  // links: each task in the note -> its line on the checklist
  CUE.links.forEach((tl, i) => {
    const kk = outCubic(inv(tl, tl + 0.25, t)); if (kk <= 0 || t >= CUE.tear[0]) return;
    const y0 = y + 116 + [0, 1, 2.5][i] * 72, x0 = x + w - 10, x1 = 600, y1 = 990 + [148, 262, 362][i] * 0.53 - 12;
    L.stroke((c) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + (x1 - x0) * kk, y0 + (y1 - y0) * kk); }, { navy: 1, mint: 0.6 }, 6);
  });
  if (t >= CUE.links[2] + 0.4) { const kk = outBack(inv(CUE.links[2] + 0.4, CUE.links[2] + 0.65, t)); box(L, [x + 22, y + h - 70, 260 * kk + 1, 48], { mint: 1 }, 350, B, 10); if (kk > 0.8) T(L, '3/3 TASKS KEPT', x + 152, y + h - 38, 24, NAVY, { mono: true, align: 'center' }); }
}

// a printed hand that tears the list off
function hand(L, t, B) {
  const k = inv(CUE.tear[0] - 0.3, CUE.tear[1], t); if (k <= 0 || t > CUE.tear[1] + 0.6) return;
  const reach = outCubic(inv(0, 0.3, k)), pull = inOut(inv(0.3, 1, k)), leave = inv(CUE.tear[1], CUE.tear[1] + 0.6, t);
  const gx = 555 + 455 * 0.53 * 0.5, gy = 1000 - 10;
  const x = 1100 - (1100 - (gx + 120)) * reach - 150 * pull + 400 * leave, y = gy - 40 * pull - 200 * leave;
  tf(L, (c) => { c.translate(x, y); c.rotate(-0.5); });
  box(L, [40, -40, 110, 80], { mint: 1 }, 360, B, 14);                          // cuff
  L.fill((c) => { c.beginPath(); c.roundRect(-70, -46, 120, 92, 40); }, { navy: 1, mint: 0.3 });   // palm
  for (let f = 0; f < 3; f++) L.fill((c) => { c.beginPath(); c.roundRect(-110, -40 + f * 28, 60, 24, 12); }, { navy: 1, mint: 0.3 });
  L.fill((c) => { c.beginPath(); c.roundRect(-40, 30, 50, 26, 13); }, { navy: 1, mint: 0.3 });
  reset(L);
}

function regMark(L, t) {
  const k = inv(CUE.regMark, CUE.regMark + 0.5, t); if (k <= 0) return;
  const cx = 540, cy = 1630, r = 26, all = { navy: 1, mint: 1, amber: 1 };
  L.stroke((c) => { c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); }, all, 4);
  if (k > 0.5) L.stroke((c) => { c.beginPath(); c.moveTo(cx - 44, cy); c.lineTo(cx + 44, cy); c.moveTo(cx, cy - 44); c.lineTo(cx, cy + 44); }, all, 3);
}

// ---------------------------------------------------------------- captions (navy key plate, printed type)
function captionAt(t) { return CAPS.find(([a, b]) => t >= a && t < b); }
function fitSize(lines) { let size = 58; capLayer.cx.navy.font = `700 ${size}px SG7`; while (Math.max(...lines.map((l) => capLayer.cx.navy.measureText(l).width)) > 920 && size > 46) { size -= 2; capLayer.cx.navy.font = `700 ${size}px SG7`; } return size; }
function printCaption(sheet, t, B) {
  const cap = captionAt(t); if (!cap) return;
  const [a, b, lines] = cap, k = Math.min(inv(a, a + 0.15, t), 1 - inv(b - 0.12, b, t)); if (k <= 0) return;
  capLayer.begin([60, 330, W - 120, 170]);
  const size = fitSize(lines), base = lines.length === 1 ? [428] : [398, 456];
  lines.forEach((l, i) => capLayer.text(l, W / 2, base[i] + (1 - k) * 10, `700 ${size}px SG7`, { navy: k > 0.6 ? 1 : 0.55 }, { align: 'center' }));
  capLayer.print(sheet, PITCH.fine, B);
}

// ---------------------------------------------------------------- frame
const out = new Sheet();
export function renderFrame(f) {
  const B = Math.floor(f / 2), t = (B * 2) / FPS;
  out.copyFrom(fieldSheet());
  layer.begin([60, 520, W - 120, 1180]);
  press(layer, t, B);
  for (let i = 0; i < 3; i++) plate(layer, i, t, B);
  emptyPad(layer, t, B);
  microphone(layer, t, B);
  scraps(layer, t, B);
  speechRibbon(layer, t, B);
  promptCard(layer, t, B);
  noteCard(layer, t, B);
  checklist(layer, t, B);
  hand(layer, t, B);
  regMark(layer, t);
  const jolt = 1 + 1.2 * Math.max(0, ...CUE.flip.map((h) => (t >= h + 0.2 && t < h + 0.4 ? 1 - (t - h - 0.2) / 0.2 : 0)));
  layer.print(out, PITCH.world, B, jolt);
  printCaption(out, t, B);
  return out.toRGBA();
}
