// Tensorblue 30s english-13 · episode 01 — "Wrong card? Undo." (how undo brings a mistake back)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`):
// a miniature "time-machine" bench: a phone running a generic Tasks board, a history machine where every
// change lands as a physical entry tile, and an OUT door for things that leave the app. Board states, the
// entry (card, from, to), the restore, the 100-entry limit and the send window come from demo/out/undo-demo.json.
// Every cue is timed from the narration's word timings (voice-timing.json).
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

// ---- the demo (our minimal undo model) -----------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/undo-demo.json'), 'utf8'));
const E = DEMO.entry;
if (!DEMO.restored || E.card !== 'Invoice' || E.from.col !== 'To do' || E.to.col !== 'Done' || DEMO.limit.undos_possible !== 100 || DEMO.limit.oldest_dropped !== 1 || DEMO.send_window.in_undo_history !== false) throw new Error('demo result changed');

// ---- site colours (tensorblue.com CSS, re-checked 2026-11-11) ----------------------------------
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610' };
const DARK_BLUE = '#2757A6';

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  wrong: VW('L1', 'wrong'), card1: VW('L1', 'card'), screen: VW('L1', 'screen'), moved: VW('L1', 'moved'), undo1: VW('L1', 'undo'), brings: VW('L1', 'brings'), back1: VW('L1', 'back'),
  how: VW('L2', 'how'), remember: VW('L2', 'remember'),
  every: VW('L3', 'every'), change3: VW('L3', 'change'), saves: VW('L3', 'saves'), entry3: VW('L3', 'entry'), which: VW('L3', 'which'), where1: VW('L3', 'where'), where2: VW('L3', 'where', 2), went: VW('L3', 'went'),
  undo4: VW('L4', 'undo'), takes: VW('L4', 'takes'), newest: VW('L4', 'newest'), entry4: VW('L4', 'entry'), runs: VW('L4', 'runs'), backwards: VW('L4', 'backwards'),
  history: VW('L5', 'history'), limited: VW('L5', 'limited'), office: VW('L5', 'office'), last: VW('L5', 'last'), hundred: VW('L5', 'hundred'), actions5: VW('L5', 'actions'), dflt: VW('L5', 'default'),
  actions6: VW('L6', 'actions'), leave: VW('L6', 'leave'), harder: VW('L6', 'harder'), gmail: VW('L6', "gmail's"), send6: VW('L6', 'send'), lasts: VW('L6', 'lasts'), seconds: VW('L6', 'seconds'),
  undo7: VW('L7', 'undo'), short: VW('L7', 'short'), played: VW('L7', 'played'), reverse: VW('L7', 'reverse'), use: VW('L7', 'use'), soon: VW('L7', 'soon'), before: VW('L7', 'before'), send7: VW('L7', 'send'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, T.how - 0.15, T.every - 0.2, T.undo4 - 0.2, T.history - 0.2, T.actions6 - 0.2, T.undo7 - 0.2, CTA_AT, 30.01];
const SH = { hook: 0, remember: 1, entry: 2, undo: 3, limit: 4, leave: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- camera: one pose per shot, eased moves between them (no idle drift) ------------------------
const POSES = [
  { eye: [0.0, 5.2, 15.0], at: [0.15, 3.6, -0.6], fov: 34 },       // hook: the phone, the history machine beside it
  { eye: [1.0, 7.2, 16.0], at: [1.0, 3.4, -0.6], fov: 34 },        // pull back: phone + history machine
  { eye: [3.0, 6.4, 10.5], at: [1.1, 2.8, 0.4], fov: 34 },         // the entry prints out and lands on the stack
  { eye: [2.4, 5.8, 11.0], at: [0.9, 2.9, 0.4], fov: 34 },         // undo: the newest entry lifts, flips, runs back
  { eye: [5.0, 3.6, 8.6], at: [2.5, 1.5, 0.0], fov: 30 },          // low on the stack: limit, the oldest drops off
  { eye: [1.6, 6.4, 13.6], at: [3.0, 2.2, -1.0], fov: 38 },        // the OUT door: a sent email leaves the app
  { eye: [1.2, 8.6, 16.8], at: [2.2, 2.8, -1.0], fov: 38 },        // payoff: the whole bench (slow crane)
];
const MOVE = [0, 0.9, 0.8, 0.7, 0.9, 0.9, 1.0];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) return camera(p.eye, p.at, p.fov);
  const q = POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [1.2, 10.0, 15.5], c * k); } // slow crane on the payoff only
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- world objects --------------------------------------------------------------------------------
const BENCH = { x: 0.6, y: -0.6, z: -1.2, w: 22, h: 0.6, d: 15, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const PHONE = { x: -1.3, y: 0, z: 1.0, w: 2.6, h: 5.0, d: 0.32, pitch: -0.18, yaw: 0.16 };
const BODY = { top: '#1B2740', left: SITE.surface2, right: SITE.surface2, back: SITE.surface, front: SITE.surface };
const MACHINE = { x: 2.4, y: 0, z: 0.5, w: 2.7, h: 0.55, d: 2.0, yaw: -0.22 };   // the history machine's base
const TILE_H = 0.17, TW = 2.1, TD = 1.45;
const DOOR = { x: 6.8, y: 0, z: -2.4, w: 2.6, h: 3.2, d: 0.7, yaw: -0.6 };
const SCREEN_AT = [-1.3 + 0.0, 2.6, 1.35];                                        // ~centre of the phone's screen

// textures ---------------------------------------------------------------------------------------
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const PHONE_TEX = createCanvas(520, 1000);
function cardRect(g, x, y, w, h, label, o = {}) {
  g.fillStyle = o.fill || SITE.white; rr(g, x, y, w, h, 22); g.fill();
  g.fillStyle = o.color || SITE.ink; g.font = '44px InterB'; g.textAlign = 'center'; g.fillText(label, x + w / 2, y + h / 2 + 16);
}
// the phone screen: board / calendar / mail pages side by side, slid by `page` (0 board, 1 calendar, 2 mail)
function phoneScreen(s) {
  const g = PHONE_TEX.getContext('2d'), w = 520, h = 1000;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  g.fillStyle = '#05080F'; rr(g, 0, 0, w, h, 60); g.fill();
  g.save(); rr(g, 22, 22, w - 44, h - 44, 44); g.clip();
  g.fillStyle = SITE.pale; g.fillRect(0, 0, w, h);
  const off = -s.page * w;
  // board page
  g.save(); g.translate(off, 0);
  g.fillStyle = SITE.ink; g.font = '56px IDXB'; g.textAlign = 'left'; g.fillText('Tasks', 48, 116);
  const uk = s.undoPress;                                                          // the undo button (↶)
  g.save(); g.translate(w - 92, 98); g.scale(1 + 0.25 * Math.sin(Math.PI * uk), 1 + 0.25 * Math.sin(Math.PI * uk));
  g.fillStyle = uk > 0 && uk < 1 ? SITE.blue : SITE.ink; g.beginPath(); g.arc(0, 0, 40, 0, Math.PI * 2); g.fill();
  g.strokeStyle = SITE.white; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(4, 4, 18, Math.PI * 1.05, Math.PI * 2.35); g.stroke();
  g.fillStyle = SITE.white; g.beginPath(); g.moveTo(-26, -6); g.lineTo(-6, -6); g.lineTo(-18, 12); g.closePath(); g.fill();
  g.restore();
  const colX = [40, 270], colW = 210;
  ['To do', 'Done'].forEach((c, i) => {
    g.fillStyle = '#C5D3EA'; rr(g, colX[i], 160, colW, 760, 26); g.fill();
    g.fillStyle = SITE.ink; g.font = '38px InterB'; g.textAlign = 'left'; g.fillText(c, colX[i] + 22, 214);
  });
  const slot = (col, i) => [colX[col] + 12, 248 + i * 150];
  // Logo stays in Done slot 0; Slides moves up when Invoice leaves To do; Invoice travels with p (0 To do#1 → 1 Done#2)
  cardRect(g, ...slot(1, 0), colW - 24, 124, 'Logo');
  const sp = s.p; const sl = mix2(slot(0, 1), slot(0, 0), ease(clamp(sp * 1.4 - 0.2)));
  cardRect(g, sl[0], sl[1], colW - 24, 124, 'Slides');
  const a = slot(0, 0), b = slot(1, 1), q = ease(sp);
  const x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q) - Math.sin(Math.PI * q) * 70;
  cardRect(g, x, y, colW - 24, 124, 'Invoice', { fill: s.hl ? SITE.blue : SITE.white, color: s.hl ? SITE.white : SITE.ink });
  if (s.check > 0) { g.globalAlpha = clamp(s.check); g.fillStyle = SITE.blue; g.beginPath(); g.arc(a[0] + colW - 40, a[1] + 8, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = SITE.white; g.font = '34px InterB'; g.textAlign = 'center'; g.fillText('✓', a[0] + colW - 40, a[1] + 20); g.globalAlpha = 1; }
  if (s.replay > 0) { g.globalAlpha = clamp(s.replay); g.fillStyle = SITE.ink; rr(g, w / 2 - 110, 870, 220, 70, 35); g.fill(); g.fillStyle = SITE.white; g.font = '36px InterB'; g.textAlign = 'center'; g.fillText('REPLAY', w / 2, 917); g.globalAlpha = 1; }
  g.restore();
  // calendar page
  g.save(); g.translate(off + w, 0);
  g.fillStyle = SITE.ink; g.font = '56px IDXB'; g.textAlign = 'left'; g.fillText('Calendar', 48, 116);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    const n = r * 4 + c + 1; g.fillStyle = n === 13 ? SITE.blue : SITE.white; rr(g, 46 + c * 110, 170 + r * 140, 96, 120, 18); g.fill();
    g.fillStyle = n === 13 ? SITE.white : SITE.ink; g.font = '40px InterB'; g.textAlign = 'center'; g.fillText(String(n), 94 + c * 110, 244 + r * 140);
  }
  g.restore();
  // mail page (generic compose screen)
  g.save(); g.translate(off + 2 * w, 0);
  g.fillStyle = SITE.ink; g.font = '56px IDXB'; g.textAlign = 'left'; g.fillText('New email', 48, 116);
  [['To', 'Sam'], ['Subject', 'Invoice']].forEach(([k, v], i) => { g.fillStyle = SITE.white; rr(g, 40, 170 + i * 130, w - 80, 104, 22); g.fill(); g.fillStyle = '#5B6B86'; g.font = '34px InterB'; g.fillText(k, 66, 232 + i * 130); g.fillStyle = SITE.ink; g.font = '42px InterB'; g.fillText(v, 210, 234 + i * 130); });
  g.fillStyle = SITE.white; rr(g, 40, 440, w - 80, 300, 22); g.fill();
  g.fillStyle = '#9AA9C2'; [0, 1, 2].forEach((i) => { rr(g, 70, 480 + i * 70, (w - 160) * [0.9, 0.75, 0.5][i], 26, 13); g.fill(); });
  const sk = s.sendPress;
  g.save(); g.translate(w / 2, 830); g.scale(1 + 0.2 * Math.sin(Math.PI * sk), 1 + 0.2 * Math.sin(Math.PI * sk));
  g.fillStyle = s.sent ? '#788396' : s.sending ? SITE.ink : SITE.blue; rr(g, -170, -50, 340, 100, 50); g.fill();
  g.fillStyle = SITE.white; g.font = '44px IDXB'; g.textAlign = 'center'; g.fillText(s.sent ? 'Sent' : s.sending ? 'Sending…' : 'Send', 0, 16); g.restore();
  g.restore();
  g.restore();
  return PHONE_TEX;
}
const mix2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// an entry tile: card name + from → to; `hl` highlights one part; `rev` draws the reversed side
function tileTex(name, from, to, o = {}) {
  const key = ['tile', name, from, to, o.hl || '', o.rev ? 1 : 0].join('|');
  return cached(key, 420, 290, (g, w, h) => {
    g.fillStyle = o.rev ? SITE.blue : SITE.white; rr(g, 0, 0, w, h, 30); g.fill();
    const fg = o.rev ? SITE.white : SITE.ink, hlFill = o.rev ? SITE.white : '#BFD5FB';
    g.font = '66px IDXB'; const nw = g.measureText(name).width;
    if (o.hl === 'name') { g.fillStyle = hlFill; rr(g, w / 2 - nw / 2 - 16, 46, nw + 32, 90, 20); g.fill(); }
    g.fillStyle = o.hl === 'name' && o.rev ? SITE.blue : fg; g.textAlign = 'center'; g.fillText(name, w / 2, 114);
    g.font = '50px InterB'; const arrow = '  →  ', fw = g.measureText(from).width, aw = g.measureText(arrow).width, tw = g.measureText(to).width;
    let x = w / 2 - (fw + aw + tw) / 2; const y = 214;
    if (o.hl === 'from') { g.fillStyle = hlFill; rr(g, x - 12, y - 48, fw + 24, 66, 16); g.fill(); }
    if (o.hl === 'to') { g.fillStyle = hlFill; rr(g, x + fw + aw - 12, y - 48, tw + 24, 66, 16); g.fill(); }
    g.textAlign = 'left'; g.fillStyle = fg; g.fillText(from, x, y); g.fillText(arrow, x + fw, y); g.fillText(to, x + fw + aw, y);
  });
}
const plainRev = (label) => cached('rev|' + label, 420, 290, (g, w, h) => {
  g.fillStyle = SITE.blue; rr(g, 0, 0, w, h, 30); g.fill();
  g.fillStyle = SITE.white; g.font = '62px IDXB'; g.textAlign = 'center'; g.fillText(label, w / 2, 118);
  g.font = '46px InterB'; g.fillText('undone', w / 2, 210);
});
const plainTex = (label, sub) => cached('plain|' + label + sub, 420, 290, (g, w, h) => {
  g.fillStyle = SITE.white; rr(g, 0, 0, w, h, 30); g.fill();
  g.fillStyle = SITE.ink; g.font = '62px IDXB'; g.textAlign = 'center'; g.fillText(label, w / 2, 118);
  g.fillStyle = '#5B6B86'; g.font = '46px InterB'; g.fillText(sub, w / 2, 210);
});
const MACHINE_TEX = cached('machine', 700, 160, (g, w, h) => {
  g.fillStyle = SITE.pale; g.fillRect(0, 0, w, h);
  g.fillStyle = SITE.ink; g.font = '70px IDXB'; g.textAlign = 'center'; g.fillText('HISTORY', w / 2, 106);
});
const DOOR_TEX = cached('door', 520, 640, (g, w, h) => {
  g.fillStyle = '#1B2740'; g.fillRect(0, 0, w, h);
  g.fillStyle = SITE.white; g.font = '78px IDXB'; g.textAlign = 'center'; g.fillText('OUT', w / 2, 112);
  g.fillStyle = '#01030A'; rr(g, 70, 160, w - 140, 440, 28); g.fill();
});
const SENT_TEX = cached('sent', 360, 440, (g, w, h) => {
  g.fillStyle = SITE.gray; rr(g, 0, 0, w, h, 20); g.fill();
  g.fillStyle = SITE.ink; g.font = '72px IDXB'; g.textAlign = 'center'; g.fillText('SENT', w / 2, h / 2 + 26);
});
const ENVELOPE_TEX = cached('env', 420, 290, (g, w, h) => {
  g.fillStyle = SITE.white; rr(g, 0, 0, w, h, 24); g.fill();
  g.strokeStyle = '#9AA9C2'; g.lineWidth = 10; g.lineJoin = 'round'; g.beginPath(); g.moveTo(26, 30); g.lineTo(w / 2, 150); g.lineTo(w - 26, 30); g.stroke();
  g.fillStyle = SITE.ink; g.font = '56px IDXB'; g.textAlign = 'center'; g.fillText('Invoice', w / 2, 240);
});

// ---- helpers ------------------------------------------------------------------------------------
const hop = (t, t0, a = 0.3) => a * Math.sin(Math.PI * clamp((t - t0) / 0.45));
const yawPt = (o, lx, ly, lz) => { const c = Math.cos(o.yaw || 0), s = Math.sin(o.yaw || 0); return [o.x + lx * c + lz * s, o.y + ly, o.z - lx * s + lz * c]; };
const tile = (p, tex, o = {}) => {
  const a = o.flip || 0;                                                       // flip about the tile's x axis, keep its centre
  const y = p[1] + TILE_H * (1 - Math.cos(a)) / 2;
  return { x: p[0], y, z: p[2], w: TW * (o.s ?? 1), h: TILE_H, d: TD * (o.s ?? 1), yaw: o.yaw ?? MACHINE.yaw, pitch: a,
    color: o.blue ? SITE.blue : SITE.white, colors: { front: SITE.gray, back: SITE.gray, left: SITE.gray, right: SITE.gray },
    tex: { top: tex, ...(o.back ? { bottom: o.back } : {}) }, alpha: o.alpha ?? 1, edge: 'rgba(3,6,16,0.22)' };
};
const arc = (p0, p3, s, lift = 2.4) => bez(p0, [p0[0], p0[1] + lift, p0[2]], [p3[0], p3[1] + lift, p3[2]], p3, s);

// ---- screen-space label (large, brief) anchored to a 3D point --------------------------------
function tag(ctx, cam, p, label, k, o = {}) {
  if (k <= 0) return;
  const s = project(cam, p); if (s.z < 0.2) return;
  const size = o.size || 40, w = textW(ctx, label, size, 'IDXB') + size * 1.2;
  const x = clamp(s.x, 110 + w / 2, 890 - w / 2), y = clamp(s.y + (o.dy || 0), 600, 1480);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  shadow(ctx, 0, size * 0.9, w * 0.45, 10, 0.5);
  ctx.fillStyle = o.fill || SITE.white; rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  text(ctx, label, 0, size * 0.36, { size, font: 'IDXB', color: o.color || SITE.ink }); ctx.restore();
}

// ---- state over time ------------------------------------------------------------------------------
// Invoice position on the board: 0 = To do (slot 1), 1 = Done (slot 2)
function invoiceP(t) {
  if (t < SHOTS[SH.entry]) return ease(ev(t, T.card1 - 0.2, 0.45)) * (1 - ease(ev(t, T.brings - 0.05, 0.45)));   // hook: mistake, then undo
  if (t < SHOTS[SH.undo]) return ease(ev(t, T.change3, 0.45));                                                    // replay: the change
  if (t < SHOTS[SH.limit]) return 1 - ease(ev(t, T.backwards - 0.1, 0.5));                                       // undo runs it backwards
  return 0;
}
function page(t) {
  if (t < SHOTS[SH.entry]) return ease(ev(t, T.screen - 0.05, 0.4)) * (1 - ease(ev(t, T.undo1 + 0.1, 0.35)));    // the screen moved on, then back
  if (t >= SHOTS[SH.leave] - 0.1 && t < SHOTS[SH.payoff]) return 2 * ease(ev(t, SHOTS[SH.leave] - 0.1, 0.45));   // compose an email
  return 0;
}

// the history stack: older entries (bottom → top), then this round's entry on top
const OLDER = [['+ Logo', 'new card'], ['Logo', 'To do → Done'], ['Rename', 'board'], ['+ Slides', 'new card'], ['Sort', 'by date']];
const BURST = [['Slides', 'edited'], ['+ Notes', 'new card'], ['Logo', 'edited'], ['Notes', 'To do → Done'], ['+ Ideas', 'new card']];
const burstAt = (i) => (i < BURST.length - 1 ? T.limited + 0.1 + i * 0.14 : T.hundred - 0.4);   // the last one is the entry that pushes the oldest out

// ---- the world ------------------------------------------------------------------------------------
function world(ctx, t) {
  const cam = camAt(t);
  floor(ctx, cam, BENCH, { at: [1.0, 0, -0.2], radius: 9, strength: 0.22 });
  const objs = [];
  const pP = invoiceP(t), pg = page(t);
  const phoneS = {
    page: pg, p: pP, hl: (t >= T.which && t < T.went + 0.6) || (t >= T.backwards - 0.1 && t < T.backwards + 0.8) || (t >= T.card1 - 0.2 && t < T.card1 + 0.6),
    undoPress: ev(t, T.undo1 - 0.05, 0.35), check: ev(t, T.back1, 0.2) * (1 - ev(t, T.how - 0.2, 0.3)) + ev(t, T.backwards + 0.4, 0.2) * (1 - ev(t, SHOTS[SH.limit] + 0.3, 0.3)),
    replay: ev(t, SHOTS[SH.entry] + 0.05, 0.2) * (1 - ev(t, T.change3 + 0.5, 0.25)),
    sendPress: ev(t, T.actions6 - 0.05, 0.35), sending: t >= T.actions6 + 0.15, sent: t >= T.seconds + 0.9,
  };
  const phone = { ...PHONE, y: hop(t, T.soon), colors: BODY, color: SITE.surface, tex: { front: phoneScreen(phoneS) }, edge: 'rgba(183,199,223,0.35)' };
  const mach = { ...MACHINE, y: hop(t, T.short, 0.2), color: SITE.gray, colors: { top: '#C9D6EC', front: SITE.pale, left: '#A7B8D2', right: SITE.gray }, tex: { front: MACHINE_TEX }, edge: 'rgba(3,6,16,0.2)' };
  objs.push(phone, mach);
  const baseTop = MACHINE.h + mach.y;
  // stack contents: older entries + burst (limit shot) ; the bottom one leaves on "hundred"
    const dropK = ease(ev(t, T.hundred - 0.05, 0.55));              // the oldest slides out
  const settle = ease(ev(t, T.hundred + 0.35, 0.3));              // the rest drop by one tile
  const stack = [...OLDER.map((x) => plainTex(...x))];
  const jit = (i) => [Math.sin(i * 2.3) * 0.06, Math.cos(i * 1.7) * 0.05, Math.sin(i * 3.1) * 0.03];
  const nOld = stack.length;
  for (let i = 0; i < nOld; i++) {
    const j = jit(i);
    let p = yawPt(MACHINE, j[0], 0, j[1]); p[1] = baseTop + i * TILE_H - (i > 0 ? settle * TILE_H : 0);
    if (i === 0 && dropK > 0) { // the oldest entry slides out sideways and falls off the machine
      const out = yawPt(MACHINE, 1.6 * dropK, 0, -0.7 * dropK); p = [out[0], baseTop - (baseTop - 0.02) * easeIn(ev(dropK, 0.45, 0.55)), out[2]];
      objs.push(tile(p, stack[i], { yaw: MACHINE.yaw + j[2] - dropK * 0.35, alpha: 1 - 0.5 * ev(t, T.dflt, 0.4) * (t < SHOTS[SH.leave] ? 1 : 0) - (t >= SHOTS[SH.leave] ? 1 : 0) }));
      continue;
    }
    objs.push(tile(p, stack[i], { yaw: MACHINE.yaw + j[2] }));
  }
  // payoff flourish: the top tiles flip like a rewind
  const level = nOld;
  // this round's entry: prints out of the phone (hook: quickly; replay: slowly), sits on top, undo lifts it back
  const top = () => { const p = yawPt(MACHINE, 0, 0, 0); p[1] = baseTop + level * TILE_H; return p; };
  const printFrom = [PHONE.x + 0.4, PHONE.h + 0.3, PHONE.z - 0.4];
  const entryTex = (hl) => tileTex(E.card, E.from.col, E.to.col, { hl });
  const revTex = tileTex(E.card, E.to.col, E.from.col, { rev: true });
  const hlNow = t >= T.went - 0.05 ? 'to' : t >= T.where1 - 0.05 ? 'from' : t >= T.which - 0.05 ? 'name' : '';
  if (t < SHOTS[SH.entry]) {
    // hook: a small entry flies phone → stack on the mistake, then back into the phone on "Undo"
    const k1 = ease(ev(t, T.card1, 0.6)), k2 = ease(ev(t, T.undo1 + 0.05, 0.55));
    if (k1 > 0 && k2 < 1) {
      const side = [PHONE.x + 1.3, 3.0, PHONE.z + 0.1];
      const p = k2 > 0 ? arc(top(), side, k2, 0.7) : arc(side, top(), k1, 0.7);
      objs.push(tile(p, k2 > 0.25 ? revTex : entryTex(''), { flip: Math.PI * ease(ev(k2, 0, 0.35)) + 0.5 * Math.sin(Math.PI * (k2 > 0 ? k2 : k1)), back: revTex, s: 1 - 0.4 * k2, alpha: 1 - ev(k2, 0.8, 0.2) }));
    }
  } else if (t < SHOTS[SH.limit]) {
    const k1 = ease(ev(t, T.saves, 0.8));                               // replay: print + land
    const lift = ease(ev(t, T.takes - 0.05, 0.5));                     // undo: lift toward the camera
    const fl = ease(ev(t, T.entry4 - 0.1, 0.55));                       // flip to the reversed side
    const run = ease(ev(t, T.runs - 0.05, 0.6));                        // run into the phone
    if (k1 > 0 && run < 1) {
      let p = arc(printFrom, top(), k1, 1.0);
      if (lift > 0) p = mix3(top(), [top()[0] - 0.5, top()[1] + 1.6, top()[2] + 0.9], lift);
      if (run > 0) p = arc(p, SCREEN_AT, run, 0.6);
      const sc = 1 + 0.25 * lift - 0.55 * run;
      objs.push(tile(p, entryTex(hlNow), { flip: Math.PI * fl + 0.45 * lift * (1 - run) + 0.6 * Math.sin(Math.PI * k1) * (lift > 0 ? 0 : 1), back: revTex, s: sc, alpha: 1 - ev(run, 0.75, 0.25), yaw: MACHINE.yaw - 0.1 * lift }));
    }
  } else if (t < SHOTS[SH.payoff]) {
    // limit: a burst of newer entries lands on top
    for (let i = 0; i < BURST.length; i++) {
      const k = ease(ev(t, burstAt(i), 0.32)); if (k <= 0) continue;
      const pTop = yawPt(MACHINE, jit(nOld + i)[0], 0, jit(nOld + i)[1]); pTop[1] = baseTop + (nOld + i) * TILE_H - settle * TILE_H;
      const p = mix3([pTop[0] + 0.3, pTop[1] + 1.1, pTop[2] + 0.5], pTop, k);
      objs.push(tile(p, plainTex(...BURST[i]), { yaw: MACHINE.yaw + jit(nOld + i)[2], flip: 0.7 * (1 - k) }));
    }
  } else {
    for (let i = 0; i < BURST.length; i++) {
      const pTop = yawPt(MACHINE, jit(nOld + i)[0], 0, jit(nOld + i)[1]); pTop[1] = baseTop + (nOld + i - 1) * TILE_H;
      const fk = ease(ev(t, T.played - 0.1 + (BURST.length - 1 - i) * 0.12, 0.35)) * (1 - ease(ev(t, T.use - 0.4 + (BURST.length - 1 - i) * 0.06, 0.35)));
      objs.push(tile(pTop, plainTex(...BURST[i]), { yaw: MACHINE.yaw + jit(nOld + i)[2], flip: Math.PI * fk, back: plainRev(BURST[i][0]) }));
    }
  }
  // the OUT door + a sent email
  const door = { ...DOOR, y: hop(t, T.send7, 0.22), color: '#1B2740', colors: { top: '#22324F', left: SITE.surface2, right: SITE.surface2 }, tex: { front: DOOR_TEX }, edge: 'rgba(183,199,223,0.3)' };
  objs.push(door);
  const doorMouth = yawPt(DOOR, 0, 1.25, DOOR.d / 2 + 0.05), doorIn = yawPt(DOOR, 0, 1.25, -0.2);
  const ek = ease(ev(t, T.actions6 + 0.1, 0.9));                                     // email leaves the phone, waits at the door
  const ein = ease(ev(t, T.seconds + 0.25, 0.45));                                   // then goes through (window over)
  if (ek > 0 && ein < 1 && t < SHOTS[SH.payoff] + 0.5) {
    let p = arc(printFrom, doorMouth, ek, 1.6); if (ein > 0) p = mix3(doorMouth, doorIn, ein);
    objs.push({ ...tile(p, ENVELOPE_TEX, { yaw: DOOR.yaw, alpha: 1 - ev(ein, 0.4, 0.5) }), pitch: 0.6 + 0.6 * ek, h: 0.08 });
  }
  // the undo window: a blue slab that drains, then a shutter closes the door
  const wk = easeOut(ev(t, T.gmail - 0.05, 0.3)) * (1 - ev(t, SHOTS[SH.payoff], 0.4)), drain = ev(t, T.lasts - 0.1, 0.75);
  if (wk > 0 && drain < 1) { const p = yawPt(DOOR, -0.9 * drain, 0, DOOR.d / 2 + 0.55); objs.push({ x: p[0], y: 0, z: p[2], w: 1.8 * (1 - drain), h: 0.14 * wk, d: 0.32, yaw: DOOR.yaw, color: DARK_BLUE, colors: { top: SITE.blue }, alpha: clamp(wk) }); }
  const sk = ease(ev(t, T.seconds + 0.55, 0.35));
  if (sk > 0) { const p = yawPt(DOOR, 0, 0.3 + 2.0 * (1 - sk), DOOR.d / 2 + 0.04); objs.push({ x: p[0], y: p[1] + door.y, z: p[2], w: 1.85, h: 2.05, d: 0.06, yaw: DOOR.yaw, color: SITE.gray, tex: { front: SENT_TEX }, edge: 'rgba(3,6,16,0.25)' }); }
  // draw: shadows, then objects far → near
  for (const o of objs) contactShadow(ctx, cam, o, o === mach || o === door ? 0.55 : 0.45, o.h > 1 ? 0.3 : 0.12);
  objs.map((o) => ({ o, z: project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z - (o.h < 0.3 && o !== mach ? 0.3 : 0) }))
    .sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  // ---- large, brief labels (one idea at a time) ----
  const stackTop = [MACHINE.x, baseTop + (level + 1) * TILE_H, MACHINE.z];
  tag(ctx, cam, stackTop, 'HISTORY ENTRY', ev(t, T.entry3 - 0.05, 0.3) * (1 - ev(t, T.which - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -150 });
  tag(ctx, cam, [MACHINE.x - 0.5, MACHINE.h + (nOld + 1) * TILE_H + 1.9, MACHINE.z + 0.9], 'NEWEST', ev(t, T.newest - 0.05, 0.3) * (1 - ev(t, T.runs - 0.2, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -120 });
  tag(ctx, cam, SCREEN_AT, 'RUN BACKWARDS', ev(t, T.runs - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.limit] - 0.15, 0.2)), { fill: SITE.white, dy: 330 });
  tag(ctx, cam, [MACHINE.x, baseTop + 11 * TILE_H, MACHINE.z], 'OFFICE: LAST 100', ev(t, T.office - 0.05, 0.3) * (1 - ev(t, burstAt(BURST.length - 1) - 0.2, 0.15)), { fill: SITE.blue, color: SITE.white, dy: -120 });
  tag(ctx, cam, yawPt(MACHINE, 1.6, 0.1, -0.7), 'OLDEST DROPS OFF', ev(t, T.actions5 - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.leave] - 0.15, 0.2)), { fill: SITE.white, dy: 120 });
  tag(ctx, cam, yawPt(DOOR, 0, DOOR.h, 0), 'LEAVES THE APP', ev(t, T.leave - 0.05, 0.3) * (1 - ev(t, T.gmail - 0.25, 0.2)), { fill: SITE.white, dy: -70 });
  tag(ctx, cam, yawPt(DOOR, 0, DOOR.h, 0), 'UNDO SEND: 5–30 s', ev(t, T.gmail - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -70 });
  // ---- kinetic type: hook, question, payoff (never with a label paragraph) ----
  kword(ctx, 'WRONG CARD.', 540, 680, 104, t, T.wrong + 0.05, { t1: T.how - 0.3 });
  kword(ctx, 'UNDO.', 540, 790, 104, t, T.undo1 - 0.05, { color: SITE.blue, t1: T.how - 0.3 });
  kword(ctx, 'HOW DOES IT', 540, 680, 96, t, T.how - 0.05, { t1: T.every - 0.35 });
  kword(ctx, 'REMEMBER?', 540, 790, 104, t, T.remember - 0.05, { color: SITE.blue, t1: T.every - 0.35 });
  kword(ctx, 'SHORT HISTORY', 540, 680, 96, t, T.short - 0.05, { t1: T.use - 0.3 });
  kword(ctx, 'IN REVERSE.', 540, 790, 104, t, T.reverse - 0.05, { color: SITE.blue, t1: T.use - 0.3 });
  kword(ctx, 'UNDO SOON.', 540, 730, 120, t, T.use - 0.05, { color: SITE.blue, t1: CTA_AT });
}

// ---- captions (2026-11-11 rule: readable inside x 100–900; house band y 340–520, centred x 500) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Wrong card.', 'The screen moved on.'] },
  { t0: T.undo1, lines: ['Undo brings it back.'] },
  { t0: VL('L2').t0, lines: ['How does the app', 'remember?'] },
  { t0: VL('L3').t0, lines: ['Every change', 'saves an entry:'] },
  { t0: T.which, lines: ['which card, where it was,', 'where it went.'] },
  { t0: VL('L4').t0, lines: ['Undo takes the newest entry', 'and runs it backwards.'] },
  { t0: VL('L5').t0, lines: ['History is limited:'] },
  { t0: T.office, lines: ['Office keeps the last 100', 'actions by default.'] },
  { t0: VL('L6').t0, lines: ['Actions that leave the app', 'are harder:'] },
  { t0: T.gmail, lines: ["Gmail's Undo Send", 'lasts seconds.'] },
  { t0: VL('L7').t0, lines: ['Undo is a short history', 'played in reverse:'] },
  { t0: T.use, lines: ['use it soon,', 'before you hit send.'], tEnd: VL('L8').t0 - 0.05 },
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
  add(T.card1 - 0.2, 'slide'); add(T.card1 + 0.4, 'clack', { soft: true }); add(T.screen - 0.05, 'slide', { soft: true });
  add(T.undo1 - 0.05, 'tap'); add(T.brings, 'slide'); add(T.back1, 'blip', { hi: true });
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.how - 0.05, 'type'); add(T.remember - 0.05, 'type');
  add(T.change3, 'slide', { soft: true }); add(T.saves + 0.75, 'clack'); add(T.which, 'blip'); add(T.where1, 'blip'); add(T.went, 'blip');
  add(T.takes, 'slide', { soft: true }); add(T.entry4 - 0.1, 'match'); add(T.runs, 'slide'); add(T.backwards + 0.4, 'blip', { hi: true });
  for (let i = 0; i < 5; i++) add(burstAt(i) + 0.3, 'clack', { soft: true });
  add(T.hundred, 'slide'); add(T.actions5 + 0.2, 'carve');
  add(T.actions6 - 0.05, 'tap'); add(T.leave, 'slide', { soft: true }); add(T.gmail, 'blip'); add(T.seconds + 0.3, 'slide'); add(T.seconds + 0.85, 'clack');
  add(T.played, 'type', { soft: true }); add(T.use - 0.05, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
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

// ---- thumbnail: the hook as one still, 3 large words -------------------------------------------
export function drawThumbnail(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
  const cam = camera([0.6, 5.0, 12.2], [0.5, 3.0, -0.4], 34, 540, 1130);
  floor(ctx, cam, BENCH, { at: [0.6, 0, 0.4], radius: 7, strength: 0.3 });
  const ph = { ...PHONE, colors: BODY, color: SITE.surface, tex: { front: phoneScreen({ page: 0, p: 0.22, hl: true, undoPress: 0.5, check: 0, replay: 0, sendPress: 0, sending: false, sent: false }) }, edge: 'rgba(183,199,223,0.35)' };
  const mach = { ...MACHINE, color: SITE.gray, colors: { top: '#C9D6EC', front: SITE.pale, left: '#A7B8D2', right: SITE.gray }, tex: { front: MACHINE_TEX } };
  const objs = [ph, mach];
  OLDER.forEach((x, i) => { const p = yawPt(MACHINE, 0, 0, 0); p[1] = MACHINE.h + i * TILE_H; objs.push(tile(p, plainTex(...x))); });
  const revTex = tileTex(E.card, E.to.col, E.from.col, { rev: true });
  objs.push(tile([1.5, 2.9, 2.2], revTex, { flip: Math.PI + 0.85, back: revTex, yaw: -0.12, s: 1.15 }));
  for (const o of objs) contactShadow(ctx, cam, o, 0.5, o.h > 1 ? 0.3 : 0.12);
  objs.map((o) => ({ o, z: project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z })).sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  text(ctx, 'WRONG', 540, 430, { size: 150, font: 'IDXB' });
  text(ctx, 'CARD?', 540, 590, { size: 150, font: 'IDXB' });
  text(ctx, 'UNDO.', 540, 750, { size: 150, font: 'IDXB', color: SITE.blue });
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 1712, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 1764, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 1764, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
