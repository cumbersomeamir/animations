// Tensorblue 30s english-12 · episode 01 — "Offline. Still working." (local-first apps)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + this round's original 3D stage (stage3d.mjs):
// a tactile miniature workbench with two phones, a server, a physical cable, a local-copy drawer and a
// queue tray, filmed by a perspective camera that changes shot on the narration. Lists, queued-change
// counts and the merge / conflict outcome are the real results in demo/out/sync-demo.json (Automerge).
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, pill, makeBackground,
} from './brt.mjs';
import { camera, project, drawBox, contactShadow, tube, floor, bez, mix3 } from './stage3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the real demo (Automerge) ---------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/sync-demo.json'), 'utf8'));
const FINAL = DEMO.after_sync.server, WIN = DEMO.same_item_conflict.winner;
const LOSE = DEMO.same_item_conflict.values_kept.find((v) => v !== WIN);
const QA_ = DEMO.queued_changes.A, QB_ = DEMO.queued_changes.B;
if (!DEMO.after_sync.all_copies_identical || DEMO.offline.server.join() !== 'bread' || FINAL.length !== 3 || !LOSE) throw new Error('demo result changed');

// ---- site colours (tensorblue.com CSS, re-checked 2026-11-11) ----------------------------------
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610' };

// ---- cues -----------------------------------------------------------------------------
const T = {
  no: VW('L1', 'no'), edit: VW('L1', 'edit'), still: VW('L1', 'still'), saves: VW('L1', 'saves'),
  now: VW('L2', 'now'), two: VW('L2', 'two'), change2: VW('L2', 'change'), offline: VW('L2', 'offline'), who: VW('L2', 'who'), wins: VW('L2', 'wins'),
  apps: VW('L3', 'apps'), keep: VW('L3', 'keep'), copy3: VW('L3', 'copy'), phone3: VW('L3', 'phone'), save3: VW('L3', 'save'), first: VW('L3', 'first'),
  each: VW('L4', 'each'), change4: VW('L4', 'change'), waits: VW('L4', 'waits'), queue4: VW('L4', 'queue'),
  back: VW('L5', 'back'), online: VW('L5', 'online'), syncs: VW('L5', 'syncs'), server5: VW('L5', 'server'),
  additions: VW('L6', 'additions'), merge: VW('L6', 'merge'), same6: VW('L6', 'same'), item: VW('L6', 'item'), rule: VW('L6', 'rule'), picks: VW('L6', 'picks'), every: VW('L6', 'every'),
  thats: VW('L7', "that's"), local: VW('L7', 'local-first'), main: VW('L7', 'main'), phone7: VW('L7', 'phone'), servers: VW('L7', 'servers'), sync7: VW('L7', 'sync'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
// shot starts (camera changes) — also the music's scene boundaries
const SHOTS = [0, T.now - 0.1, T.apps - 0.2, T.each - 0.2, T.back - 0.1, T.additions - 0.2, T.every - 0.3, T.thats - 0.2, CTA_AT, 30.01];
const SH = { hook: 0, two: 1, local: 2, queue: 3, sync: 4, merge: 5, every: 6, payoff: 7, cta: 8 };
export const CUES = { ...T, scenes: SHOTS };

// ---- camera: one pose per shot, eased moves between them (no idle drift) ------------------------
const POSES = [
  { eye: [-1.2, 4.6, 14.0], at: [-0.6, 3.4, -0.6], fov: 34 },      // hook: phone A, its cable to the server
  { eye: [0.0, 7.0, 16.5], at: [0.3, 2.4, 0.0], fov: 34 },         // two phones, server between them
  { eye: [-9.4, 6.0, 10.2], at: [-4.2, 2.2, 0.2], fov: 30 },       // phone A from the front-left: the local-copy drawer
  { eye: [-4.2, 10.4, 14.0], at: [-3.1, 2.0, 1.8], fov: 29 },      // down onto the queue tray
  { eye: [-0.7, 9.2, 15.2], at: [-0.45, 2.3, -0.6], fov: 38 },        // wide: cables back, changes fly to the server
  { eye: [0.0, 9.0, 1.6], at: [0.0, 2.1, -4.4], fov: 34 },         // dolly over the phones onto the server: merge + rule
  { eye: [0.0, 7.0, 16.5], at: [0.3, 2.4, 0.0], fov: 34 },         // back to the two-phone frame: same everywhere
  { eye: [0.0, 9.4, 14.5], at: [0.15, 1.8, -1.0], fov: 38 },       // payoff: the whole bench (slow crane)
];
const MOVE = [0, 0.9, 0.9, 0.7, 0.9, 1.0, 0.8, 1.1];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) return camera(p.eye, p.at, p.fov);
  const q = POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [0.0, 10.8, 13.6], c * k); } // slow crane on the payoff only
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- world objects (a miniature bench: two phones in front, the server between them at the back) ----
const BENCH = { x: 0.3, y: -0.6, z: -1.2, w: 22, h: 0.6, d: 15, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const PHONE_A = { x: -2.3, y: 0, z: 1.2, w: 2.4, h: 4.6, d: 0.32, pitch: -0.2, yaw: 0.14 };
const PHONE_B = { x: 2.3, y: 0, z: 1.2, w: 2.4, h: 4.6, d: 0.32, pitch: -0.2, yaw: -0.14 };
const SERVER = { x: 0, y: 0, z: -4.4, w: 2.8, h: 2.6, d: 2.0, yaw: 0 };
// cables loop out beside each phone (visible on the bench) and plug into the server's side
const CABLE_A = [[-1.3, 0.1, 1.0], [1.6, 0.1, 2.5], [-2.6, 0.1, -2.0], [-1.4, 0.42, -4.2]];
const CABLE_B = [[1.3, 0.1, 1.0], [-1.6, 0.1, 2.5], [2.6, 0.1, -2.0], [1.4, 0.42, -4.2]];
const BODY = { top: '#1B2740', left: SITE.surface2, right: SITE.surface2, back: SITE.surface, front: SITE.surface };
// where synced changes land in front of the server (A's on the left, B's on the right)
// additions hover in the front row, the two edits of the same item in the back row; the conflict steps forward later
const LAND = { A: [[-0.9, 3.3, -3.8], [-0.9, 4.1, -4.7]], B: [[0.9, 3.3, -3.8], [0.9, 4.1, -4.7]] };
const LAND_PITCH = 0.35;

// textures (redrawn per frame)
const TEX = { A: createCanvas(520, 1000), B: createCanvas(520, 1000), S: createCanvas(720, 660) };
function screen(cv, s) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  g.fillStyle = '#05080F'; rr(g, 0, 0, w, h, 60); g.fill();                       // bezel
  g.fillStyle = SITE.pale; rr(g, 22, 22, w - 44, h - 44, 44); g.fill();            // screen
  const on = s.status !== 'OFFLINE';                                               // connection chip, own row
  g.fillStyle = on ? SITE.blue : SITE.ink; rr(g, w / 2 - 140, 60, 280, 80, 40); g.fill();
  g.fillStyle = SITE.white; g.font = '40px InterB'; g.textAlign = 'center'; g.fillText(s.status, w / 2, 114);
  g.fillStyle = SITE.ink; g.font = '58px IDXB'; g.textAlign = 'left'; g.fillText('Groceries', 60, 228);
  s.rows.forEach((r, i) => {
    const y = 270 + i * 150;
    g.fillStyle = r.hl ? '#BFD5FB' : SITE.white; rr(g, 50, y, w - 100, 124, 26); g.fill();
    g.fillStyle = SITE.ink; g.font = '60px InterB'; g.textAlign = 'left'; g.fillText(r.text, 88, y + 84);
  });
  if (s.toast > 0) {
    g.globalAlpha = clamp(s.toast); g.fillStyle = SITE.ink; rr(g, 70, h - 210, w - 140, 110, 55); g.fill();
    g.fillStyle = SITE.white; g.font = '46px InterB'; g.textAlign = 'center'; g.fillText('✓ Saved', w / 2, h - 138); g.globalAlpha = 1;
  }
  return cv;
}
function serverScreen(cv, s) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  g.fillStyle = SITE.pale; g.fillRect(0, 0, w, h);
  g.fillStyle = SITE.ink; g.font = '64px IDXB'; g.textAlign = 'left'; g.fillText('SERVER', 50, 100);
  g.fillStyle = s.online ? SITE.blue : '#788396'; g.beginPath(); g.arc(w - 80, 78, 26, 0, Math.PI * 2); g.fill();
  s.rows.forEach((r, i) => {
    const y = 150 + i * 150;
    g.fillStyle = r.hl ? '#BFD5FB' : SITE.white; rr(g, 40, y, w - 80, 124, 24); g.fill();
    g.fillStyle = SITE.ink; g.font = '62px InterB'; g.fillText(r.text, 80, y + 86);
  });
  return cv;
}
const CARD_TEX = new Map();
function cardTex(label, blue = false) {
  const key = label + blue; if (CARD_TEX.has(key)) return CARD_TEX.get(key);
  const cv = createCanvas(400, 252), g = cv.getContext('2d');
  g.fillStyle = blue ? SITE.blue : SITE.white; rr(g, 0, 0, 400, 252, 32); g.fill();
  g.fillStyle = blue ? SITE.white : SITE.ink; g.font = '62px InterB'; g.textAlign = 'center'; g.fillText(label, 200, 148);
  CARD_TEX.set(key, cv); return cv;
}
const card = (p, label, o = {}) => ({ x: p[0], y: p[1], z: p[2], w: 1.6, h: 0.1, d: 1.0, yaw: o.yaw || 0, pitch: o.pitch || 0, color: o.blue ? SITE.blue : SITE.white, colors: { front: o.blue ? '#2757A6' : SITE.gray, left: o.blue ? '#2757A6' : SITE.gray, right: o.blue ? '#2757A6' : SITE.gray, back: SITE.gray }, tex: { top: cardTex(label, o.blue) }, alpha: o.alpha ?? 1, edge: 'rgba(3,6,16,0.25)' });
// the phone's local copy of the list, as one physical sheet
function sheetTex(rows) {
  const key = 'sheet:' + rows.join('|'); if (CARD_TEX.has(key)) return CARD_TEX.get(key);
  const cv = createCanvas(420, 316), g = cv.getContext('2d');
  g.fillStyle = SITE.white; rr(g, 0, 0, 420, 316, 30); g.fill();
  rows.forEach((r, i) => { g.fillStyle = '#E6EEFB'; rr(g, 26, 34 + i * 136, 368, 112, 22); g.fill(); g.fillStyle = SITE.ink; g.font = '58px InterB'; g.textAlign = 'left'; g.fillText(r, 56, 34 + i * 136 + 76); });
  CARD_TEX.set(key, cv); return cv;
}
const RULE_TEX = (() => {
  const cv = createCanvas(300, 300), g = cv.getContext('2d');
  g.fillStyle = SITE.blue; g.fillRect(0, 0, 300, 300);
  g.fillStyle = SITE.white; g.font = '86px IDXB'; g.textAlign = 'center'; g.fillText('RULE', 150, 182); return cv;
})();
// a high arc from p0 to p3 (lifts over the phones)
const arc = (p0, p3, s, lift = 3.2) => bez(p0, [p0[0], p0[1] + lift, p0[2]], [p3[0], p3[1] + lift, p3[2] + 1.0], p3, s);

// ---- state over time ------------------------------------------------------------------------
const typed = (s, t, t0, dur) => s.slice(0, Math.round(s.length * clamp((t - t0) / dur)));
function phoneRows(t, who) {
  if (t >= T.every) return FINAL.map((x) => ({ text: x, hl: t < T.every + 0.9 }));
  if (who === 'A') {
    const rows = [{ text: t >= T.change2 ? (typed('rye bread', t, T.change2, 0.5) || 'bread') : 'bread', hl: t >= T.change2 && t < T.change2 + 1.2 }];
    if (t >= T.edit - 0.15) rows.push({ text: typed('milk', t, T.edit - 0.15, 0.35), hl: t < T.saves + 0.9 });
    return rows;
  }
  const rows = [{ text: t >= T.change2 + 0.15 ? (typed('brown bread', t, T.change2 + 0.15, 0.55) || 'bread') : 'bread', hl: t >= T.change2 + 0.15 && t < T.change2 + 1.3 }];
  if (t >= T.offline) rows.push({ text: typed('eggs', t, T.offline, 0.3), hl: t < T.offline + 1.0 });
  return rows;
}
const status = (t) => (t < 0.75 ? 'ONLINE' : t < T.back + 0.6 ? 'OFFLINE' : 'ONLINE');
function serverRows(t) {
  if (t < T.merge + 0.25) return [{ text: 'bread' }];
  const rows = [{ text: t >= T.picks + 0.4 ? WIN : 'bread', hl: t >= T.picks + 0.4 && t < T.picks + 1.4 }];
  for (const x of FINAL.slice(1)) rows.push({ text: x, hl: t < T.merge + 1.3 });
  return rows;
}

// ---- screen-space label (large, brief) anchored to a 3D point --------------------------------
function tag(ctx, cam, p, label, k, o = {}) {
  if (k <= 0) return;
  const s = project(cam, p); if (s.z < 0.2) return;
  const size = o.size || 40, w = textW(ctx, label, size, 'IDXB') + size * 1.2;
  const x = clamp(s.x, 110 + w / 2, 890 - w / 2), y = s.y + (o.dy || 0);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  shadow(ctx, 0, size * 0.9, w * 0.45, 10, 0.5);
  ctx.fillStyle = o.fill || SITE.white; rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  text(ctx, label, 0, size * 0.36, { size, font: 'IDXB', color: o.color || SITE.ink }); ctx.restore();
}

// ---- the world ------------------------------------------------------------------------------
const mixHex = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`; };
const hop = (t, t0) => 0.35 * Math.sin(Math.PI * clamp((t - t0) / 0.5));          // a small physical "this one" hop
function world(ctx, t) {
  const cam = camAt(t);
  floor(ctx, cam, BENCH, { at: [0.0, 0, -0.6], radius: 9, strength: 0.22 });
  const objs = [];
  // phones and server with their live state; phone B is set down on "two phones"
  const bk = ev(t, T.two - 0.15, 0.45);
  const A = { ...PHONE_A, y: hop(t, T.main), colors: BODY, color: SITE.surface, tex: { front: screen(TEX.A, { status: status(t), rows: phoneRows(t, 'A'), toast: ev(t, T.saves - 0.05, 0.2) * (1 - ev(t, T.saves + 1.4, 0.3)) + ev(t, T.save3, 0.2) * (1 - ev(t, T.save3 + 1.0, 0.3)) }) }, edge: 'rgba(183,199,223,0.35)' };
  const B = { ...PHONE_B, y: 3.4 * (1 - easeIn(bk)) * (1 - easeIn(bk)) + hop(t, T.main + 0.08), alpha: clamp(bk * 4), colors: BODY, color: SITE.surface, tex: { front: screen(TEX.B, { status: status(t), rows: phoneRows(t, 'B'), toast: 0 }) }, edge: 'rgba(183,199,223,0.35)' };
  const Sv = { ...SERVER, y: hop(t, T.servers), color: SITE.gray, colors: { top: SITE.pale, left: '#A7B8D2', right: SITE.gray, front: SITE.pale }, tex: { front: serverScreen(TEX.S, { online: t >= T.syncs + 0.9 || t < 0.75, rows: serverRows(t) }) }, edge: 'rgba(3,6,16,0.2)' };
  objs.push(A, Sv); if (bk > 0) objs.push(B);
  // local-copy drawer: slides out from behind phone A, takes the copy, shuts on "save there first"
  const dk = ease(ev(t, T.keep - 0.1, 0.6)) * (1 - ease(ev(t, T.save3 + 0.15, 0.5)));
  const DRAWER = { x: lerp(-2.3, -5.0, dk), y: 0, z: -0.2, w: 2.4, h: 0.8, d: 2.4, yaw: 0.14, color: SITE.gray, colors: { top: SITE.pale, front: SITE.white, left: SITE.gray, right: SITE.gray }, edge: 'rgba(3,6,16,0.2)' };
  if (dk > 0.001) {
    objs.push(DRAWER);
    const k = ease(ev(t, T.copy3, 0.6));
    if (k > 0) {
      const p = mix3([-2.3, 2.8, 1.5], [DRAWER.x, 0.86, DRAWER.z], k); p[1] += Math.sin(k * Math.PI) * 1.4;
      objs.push({ x: p[0], y: p[1], z: p[2], w: 2.0, h: 0.08, d: 1.5, yaw: -0.45, color: SITE.white, colors: { front: SITE.gray, left: SITE.gray, right: SITE.gray }, tex: { top: sheetTex(['rye bread', 'milk']) }, edge: 'rgba(3,6,16,0.25)' });
    }
  }
  // queue tray in front of phone A: the changes the server has not seen yet
  const qk = easeOut(ev(t, T.each - 0.25, 0.4)) * (1 - ev(t, SHOTS[SH.merge], 0.4));
  if (qk > 0) objs.push({ x: -2.3, y: 0, z: 3.3, w: 4.0, h: 0.28, d: 1.5, yaw: 0.06, color: '#2757A6', colors: { top: SITE.blue }, alpha: qk });
  // queued changes: A's land in the tray; on "syncs" every queued change flies to the server
  const fly = (i) => (t >= T.syncs ? clamp(ease(ev(t, T.syncs, 1.2)) * 1.3 - i * 0.15) : 0);
  const atServer = t >= SHOTS[SH.merge] - 0.3;
  const QUEUED = { A: [['+ milk', 0], ['rye bread', 1]], B: [['+ eggs', 0], ['brown bread', 1]] };
  for (const who of ['A', 'B']) for (const [lab, i] of QUEUED[who]) {
    const s = fly(i + (who === 'B' ? 0.5 : 0));
    let p, pitch = LAND_PITCH * s, yaw = 0.06, alpha = 1;
    if (who === 'A') {
      const k = ease(ev(t, T.change4 + i * 0.25, 0.45)); if (k <= 0) continue;
      const slot = [-3.2 + i * 1.8, 0.3, 3.35];
      p = s > 0 ? arc(slot, LAND.A[i], s) : mix3([-2.3, 2.4, 1.6], slot, k);
      if (s <= 0) p[1] += Math.sin(k * Math.PI) * 0.8;
    } else {
      if (s <= 0) continue;
      p = arc([2.3, 2.6, 1.6], LAND.B[i], s); alpha = clamp(s * 6); yaw = -0.06;
    }
    if (s >= 1 || atServer) { p = LAND[who][i]; pitch = LAND_PITCH; yaw = 0; }
    // at the server: additions drop in; the two edits of the same item meet the rule
    if (i === 0) {
      const mk = ease(ev(t, T.merge - 0.1, 0.5)); if (mk >= 1) continue;
      p = mix3(p, [p[0] * 0.4, 2.45, -4.0], mk); alpha *= 1 - ev(mk, 0.6, 0.4);
    } else {
      const conflict = t >= T.same6 - 0.1, pk = ev(t, T.picks - 0.05, 0.8);
      const fwd = ease(ev(t, T.same6 - 0.25, 0.5)); p = mix3(p, LAND[who][0], fwd);
      if (lab === WIN) {
        if (pk >= 1) continue;
        const sink = ease(ev(pk, 0.4, 0.6)); p = [p[0], lerp(p[1], 2.45, sink), p[2]]; alpha *= 1 - ev(sink, 0.6, 0.4);
      } else if (pk > 0) {
        const f = ease(clamp(pk / 0.8)); p = mix3(p, [-1.7, 0.06, -2.7], f); p[1] += Math.sin(f * Math.PI) * 0.6; pitch = LAND_PITCH * (1 - f); alpha *= (1 - 0.45 * f) * (1 - ev(t, T.every, 0.4));
      }
      objs.push(card(p, lab, { pitch, yaw, alpha, blue: conflict && !(lab !== WIN && pk > 0.3) }));
      continue;
    }
    objs.push(card(p, lab, { pitch, yaw, alpha }));
  }
  // the rule: a stamp that drops in over the two edits, then presses the chosen one into the server
  const rk = ev(t, T.rule - 0.15, 0.4);
  if (rk > 0) {
    const pk = ev(t, T.picks - 0.05, 0.8), winX = LAND.A[1][0] * (WIN === QUEUED.A[1][0] ? 1 : -1);
    const mv = ease(clamp(pk / 0.4)), sink = ease(ev(pk, 0.4, 0.6));
    const y = lerp(lerp(6.2, 4.4, back(rk)), 3.42, mv) - (3.42 - 2.5) * sink;
    objs.push({ x: lerp(0, winX, mv), y, z: LAND.A[0][2], w: 1.1, h: 0.8, d: 0.8, color: '#2757A6', colors: { top: SITE.blue }, tex: { front: RULE_TEX }, edge: 'rgba(255,255,255,0.3)', alpha: clamp(rk * 3) * (1 - ev(sink, 0.75, 0.25)) });
  }
  // draw: contact shadows, cables, then objects far → near
  for (const o of objs) contactShadow(ctx, cam, o, o === Sv ? 0.55 : 0.45, o.h > 1 ? 0.3 : 0.12);
  const cA = t < 0.3 ? [0, 1] : t < T.back ? [ease(ev(t, 0.3, 0.9)), 1] : [1 - ease(ev(t, T.back, 0.6)), 1];
  const cB = t < T.back + 0.15 ? null : [1 - ease(ev(t, T.back + 0.15, 0.6)), 1];
  // cables glow blue while data moves (hook, sync, "keep copies in sync") and dim to navy when idle
  const act = Math.max(1 - ev(t, T.syncs + 1.3, 0.5), ev(t, T.servers, 0.4));
  const cc = mixHex('#1A2A48', SITE.blue, act), cd = mixHex('#0B1423', '#1E3F7A', act), hi = 0.08 + 0.27 * act;
  tube(ctx, cam, CABLE_A, cA[0], cA[1], 0.12, cc, cd, cA[0] >= 0.999 ? 0 : 1, hi);
  if (cB) tube(ctx, cam, CABLE_B, cB[0], cB[1], 0.12, cc, cd, 1, hi);
  objs.map((o) => ({ o, z: project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z - (o.h < 0.2 ? 0.6 : 0) }))
    .sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  // ---- large, brief labels (one idea at a time) ----
  tag(ctx, cam, [-2.3, 0, 1.6], 'Phone A', ev(t, T.two, 0.3) * (1 - ev(t, T.apps - 0.3, 0.2)), { size: 38, dy: 60 });
  tag(ctx, cam, [2.3, 0, 1.6], 'Phone B', ev(t, T.two + 0.3, 0.3) * (1 - ev(t, T.apps - 0.3, 0.2)), { size: 38, dy: 60 });
  tag(ctx, cam, [DRAWER.x, 0.8, DRAWER.z + 1.2], 'LOCAL COPY', ev(t, T.copy3 - 0.1, 0.3) * (1 - ev(t, T.save3 + 0.3, 0.2)), { dy: 80, fill: SITE.blue, color: SITE.white });
  tag(ctx, cam, [-2.3, 0.3, 4.1], `QUEUE · ${QA_} waiting`, ev(t, T.queue4 - 0.15, 0.3) * (1 - ev(t, SHOTS[SH.sync] - 0.1, 0.2)), { dy: 70, fill: SITE.blue, color: SITE.white, size: 44 });
  tag(ctx, cam, [0, SERVER.h + 0.9, SERVER.z], 'SYNC', ev(t, T.syncs - 0.1, 0.3) * (1 - ev(t, SHOTS[SH.merge] - 0.2, 0.2)), { fill: SITE.blue, color: SITE.white });
  tag(ctx, cam, [0, SERVER.h + 1.4, SERVER.z], 'SAME ON EVERY COPY', ev(t, T.every - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.1, 0.2)), { fill: SITE.blue, color: SITE.white, size: 40 });
  tag(ctx, cam, [0, 0, 2.2], 'MAIN COPY: ON YOUR PHONE', ev(t, T.main - 0.1, 0.3) * (1 - ev(t, T.servers - 0.3, 0.2)), { fill: SITE.blue, color: SITE.white, size: 36, dy: 40 });
  tag(ctx, cam, [0, 0, 2.2], 'SERVER: KEEPS COPIES IN SYNC', ev(t, T.servers - 0.1, 0.3), { fill: SITE.white, size: 34, dy: 40 });
  // ---- kinetic type: hook, question, payoff (never with a label paragraph) ----
  kword(ctx, 'OFFLINE.', 540, 680, 108, t, 0.45, { t1: T.now - 0.3 });
  kword(ctx, 'STILL WORKING.', 540, 790, 96, t, T.still - 0.05, { color: SITE.blue, t1: T.now - 0.3 });
  kword(ctx, 'WHO WINS?', 540, 700, 104, t, T.who - 0.05, { color: SITE.blue, t1: T.apps - 0.35 });
  kword(ctx, 'LOCAL-FIRST', 540, 690, 104, t, T.local - 0.05, { color: SITE.blue, t1: CTA_AT });
}

// ---- captions (2026-11-11 rule: readable inside x 100–900; house band y 340–520, centred x 500) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['No internet.', 'The edit still saves.'] },
  { t0: VL('L2').t0, lines: ['Now two phones change', 'the same list offline.'] },
  { t0: T.who, lines: ['Who wins?'] },
  { t0: VL('L3').t0, lines: ['Apps built for this keep', 'a copy of your data'] },
  { t0: VW('L3', 'on'), lines: ['on the phone and', 'save there first.'] },
  { t0: VL('L4').t0, lines: ['Each change waits', 'in a queue.'] },
  { t0: VL('L5').t0, lines: ['Back online, the queue', 'syncs through the server.'] },
  { t0: VL('L6').t0, lines: ['Additions merge.'] },
  { t0: VW('L6', 'if'), lines: ['If both changed', 'the same item,'] },
  { t0: VW('L6', 'a'), lines: ['a rule picks one,', 'the same on every copy.'] },
  { t0: VL('L7').t0, lines: ["That's local-first:"] },
  { t0: VW('L7', 'the'), lines: ['the main copy lives', 'on your phone;'] },
  { t0: T.servers, lines: ['servers just keep', 'copies in sync.'], tEnd: VL('L8').t0 - 0.05 },
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
  add(0.25, 'slide'); add(0.45, 'type'); add(T.edit - 0.15, 'tap'); add(T.still - 0.05, 'type'); add(T.saves - 0.05, 'blip', { hi: true });
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.two + 0.3, 'clack'); add(T.change2, 'tap'); add(T.change2 + 0.15, 'tap'); add(T.who - 0.05, 'type');
  add(T.keep - 0.1, 'slide'); add(T.copy3, 'clack', { soft: true }); add(T.copy3 + 0.22, 'clack', { soft: true }); add(T.save3, 'blip');
  add(T.change4, 'slot'); add(T.change4 + 0.25, 'slot');
  add(T.back, 'match'); add(T.syncs, 'slide', { soft: true }); add(T.syncs + 0.9, 'blip', { hi: true });
  add(T.merge - 0.1, 'clack'); add(T.rule - 0.1, 'carve'); add(T.picks - 0.05, 'match'); add(T.every - 0.05, 'blip', { hi: true });
  add(T.local - 0.05, 'type'); add(T.chime, 'chime');
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
  const cam = camera([-1.0, 4.8, 13.2], [-0.5, 3.1, -0.6], 34, 540, 1110);
  floor(ctx, cam, BENCH, { at: [-1.0, 0, 0.4], radius: 7, strength: 0.3 });
  const A = { ...PHONE_A, colors: BODY, color: SITE.surface, tex: { front: screen(TEX.A, { status: 'OFFLINE', rows: [{ text: 'bread' }, { text: 'milk', hl: true }], toast: 1 }) }, edge: 'rgba(183,199,223,0.35)' };
  const Sv = { ...SERVER, color: SITE.gray, colors: { top: SITE.pale, left: '#A7B8D2', right: SITE.gray, front: SITE.pale }, tex: { front: serverScreen(TEX.S, { online: false, rows: [{ text: 'bread' }] }) } };
  contactShadow(ctx, cam, Sv, 0.5, 0.3); contactShadow(ctx, cam, A, 0.5, 0.3);
  tube(ctx, cam, CABLE_A, 0.1, 1, 0.12, SITE.blue, '#1E3F7A');   // unplugged: the free end lies on the bench
  drawBox(ctx, cam, Sv); drawBox(ctx, cam, A);
  text(ctx, 'OFFLINE.', 540, 430, { size: 150, font: 'IDXB' });
  text(ctx, 'STILL', 540, 590, { size: 150, font: 'IDXB', color: SITE.blue });
  text(ctx, 'WORKING.', 540, 750, { size: 150, font: 'IDXB', color: SITE.blue });
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 1712, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 1764, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 1764, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
