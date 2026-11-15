// Tensorblue 30s english-15 · episode 01 — "Was it really saved?" (write-ahead logs and durability)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`):
// a phone on a bench says "Saved ✓" as the power dies. Each save is first written as a physical slip in a
// LOG notebook (stamped COMMIT once it is on disk); the MAIN FILE cabinet is updated later; after a crash the
// committed slips are replayed into the cabinet. The test result (SQLite, app crash mid-save) is read from
// demo/out/wal-demo.json. Every cue is timed from the narration's word timings (voice-timing.json).
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

// ---- the real test (SQLite, WAL mode, app killed mid-save) --------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/wal-demo.json'), 'utf8'));
const NOTES = ['Pay rent Fri', 'Call Sam', 'Buy milk'];
const back2 = DEMO.notes_after_restart;
if (DEMO.journal_mode !== 'wal' || back2.join('|') !== 'Pay rent Fri|Call Sam' || DEMO.on_disk_after_crash.main_file_has['Pay rent Fri'] !== false
  || DEMO.on_disk_after_crash.wal_log_has['Pay rent Fri'] !== true || DEMO.on_disk_after_crash.wal_log_has['Buy milk'] !== false) throw new Error('demo result changed');

// ---- site colours (tensorblue.com CSS, re-checked 2026-11-11) ----------------------------------
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610' };
const DARK_BLUE = '#2757A6';

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  said: VW('L1', 'said'), saved1: VW('L1', 'saved'), then: VW('L1', 'then'), power1: VW('L1', 'power'), died: VW('L1', 'died'), is: VW('L1', 'is'), note: VW('L1', 'note'),
  good: VW('L2', 'good'), databases: VW('L2', 'databases'), write: VW('L2', 'write'), first: VW('L2', 'first'),
  each: VW('L3', 'each'), change: VW('L3', 'change'), log3: VW('L3', 'log'), disk: VW('L3', 'disk'), then3: VW('L3', 'then'), says: VW('L3', 'says'), saved3: VW('L3', 'saved'),
  the4: VW('L4', 'the'), main: VW('L4', 'main'), updated: VW('L4', 'updated'), later: VW('L4', 'later'), after: VW('L4', 'after'), crash4: VW('L4', 'crash'), replayed: VW('L4', 'replayed'),
  in5: VW('L5', 'in'), test: VW('L5', 'test'), sqlite: VW('L5', 'sqlite'), crashed: VW('L5', 'crashed'), both: VW('L5', 'both'), committed: VW('L5', 'committed'), came: VW('L5', 'came'),
  faster: VW('L6', 'faster'), settings: VW('L6', 'settings'), lose6: VW('L6', 'lose'), last: VW('L6', 'last'), commits: VW('L6', 'commits'), power6: VW('L6', 'power'), cut: VW('L6', 'cut'),
  so: VW('L7', 'so'), means: VW('L7', 'means'), logged: VW('L7', 'logged'), for7: VW('L7', 'for'), keep: VW('L7', 'keep'), full: VW('L7', 'full'), sync: VW('L7', 'sync'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, T.good - 0.15, T.each - 0.15, T.the4 - 0.15, T.in5 - 0.15, T.faster - 0.15, T.so - 0.15, CTA_AT, 30.01];
const SH = { hook: 0, first: 1, log: 2, later: 3, proof: 4, fast: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- camera: one pose per shot, eased moves between them (no idle drift) ------------------------
const POSES = [
  { eye: [-0.4, 4.6, 11.2], at: [-1.7, 4.4, 0.8], fov: 32 },       // hook: the phone in the dark (frame zero)
  { eye: [0.6, 6.6, 14.8], at: [0.8, 3.4, 0.0], fov: 36 },         // lights up: phone, LOG notebook, MAIN FILE cabinet
  { eye: [-0.2, 7.0, 10.4], at: [0.0, 1.8, 1.2], fov: 34 },        // the slip is written and stamped, then "saved"
  { eye: [1.6, 6.2, 11.4], at: [2.0, 1.8, 0.0], fov: 36 },         // the cabinet catches up later; crash; replay
  { eye: [0.4, 7.6, 12.6], at: [1.0, 1.6, 0.4], fov: 36 },         // our test: three slips, crash, two come back
  { eye: [1.6, 6.4, 9.8], at: [1.2, 1.6, 1.6], fov: 34 },          // faster setting: slips wait in memory, power cut
  { eye: [-0.6, 7.6, 15.6], at: [0.8, 2.8, 0.0], fov: 36 },        // payoff (slow crane)
];
const MOVE = [0, 1.0, 0.8, 0.8, 0.8, 0.8, 1.0];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) { const k = ease(ev(t, T.is - 0.1, 1.2)); return camera(mix3(p.eye, [-0.5, 4.55, 10.3], k), p.at, p.fov); } // slow push-in on the question
  const q = i === 1 ? { ...POSES[0], eye: [-0.5, 4.55, 10.3] } : POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [1.6, 8.8, 14.8], c * k); }
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- world objects --------------------------------------------------------------------------------
const BENCH = { x: 0.6, y: -0.6, z: -1.0, w: 22, h: 0.6, d: 15, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const PHONE = { x: -1.9, y: 0, z: 1.2, w: 2.6, h: 5.0, d: 0.32, pitch: -0.15, yaw: 0.18 };
const BODY = { top: '#1B2740', left: SITE.surface2, right: SITE.surface2, back: SITE.surface, front: SITE.surface };
const BOOK = { x: 1.2, y: 0, z: 1.5, w: 2.7, h: 0.22, d: 2.6, yaw: -0.1 };
const CAB = { x: 4.0, y: 0, z: -1.3, w: 2.3, h: 2.9, d: 1.5, yaw: -0.38 };
const SW = { x: 1.2, y: 0, z: 3.25, w: 1.6, h: 0.12, d: 0.55, yaw: -0.1 };
const SLIP = { w: 2.2, h: 0.06, d: 0.56 };
const yawPt = (o, lx, ly, lz) => { const c = Math.cos(o.yaw || 0), s = Math.sin(o.yaw || 0); return [o.x + lx * c + lz * s, o.y + ly, o.z - lx * s + lz * c]; };
const slotPos = (k) => yawPt(BOOK, 0, BOOK.h + 0.01, -0.93 + k * 0.62);            // four slip rows on the notebook page
const PHONE_OUT = [PHONE.x + 1.0, 2.8, PHONE.z + 0.5];
const drawerOpen = (k) => yawPt(CAB, 0, 1.15, CAB.d / 2 + 0.6 * k);

// textures -----------------------------------------------------------------------------------------
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const PHONE_TEX = createCanvas(520, 1000);
function phoneScreen(s) {
  const g = PHONE_TEX.getContext('2d'), w = 520, h = 1000;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  g.fillStyle = '#05080F'; rr(g, 0, 0, w, h, 60); g.fill();
  if (s.on <= 0) return PHONE_TEX;
  g.save(); g.globalAlpha = clamp(s.on); rr(g, 22, 22, w - 44, h - 44, 44); g.clip();
  g.fillStyle = SITE.pale; g.fillRect(0, 0, w, h);
  // status row: battery
  g.fillStyle = SITE.ink; g.font = '34px InterB'; g.textAlign = 'right'; g.fillText(s.battery, w - 96, 74);
  g.strokeStyle = SITE.ink; g.lineWidth = 4; rr(g, w - 88, 50, 46, 26, 6); g.stroke(); g.fillStyle = SITE.ink; g.fillRect(w - 85, 53, s.battery === '1%' ? 4 : 30, 20); g.fillRect(w - 41, 57, 4, 12);
  g.fillStyle = SITE.ink; g.font = '58px IDXB'; g.textAlign = 'left'; g.fillText('Notes', 48, 168);
  s.rows.forEach((r, i) => {
    const y = 210 + i * 150;
    g.fillStyle = r.hl ? '#BFD5FB' : SITE.white; rr(g, 40, y, w - 80, 124, 26); g.fill();
    g.fillStyle = SITE.ink; g.font = '54px InterB'; g.textAlign = 'left'; g.fillText(r.text, 76, y + 80);
  });
  if (s.badge > 0) {                                                                 // the "Saved ✓" badge
    const k = s.badge, sc = 1 + 0.12 * Math.sin(Math.PI * clamp(s.pulse));
    g.save(); g.globalAlpha *= clamp(k); g.translate(w / 2, 820); g.scale(sc, sc);
    g.fillStyle = s.saving ? SITE.ink : SITE.blue; rr(g, -190, -64, 380, 128, 64); g.fill();
    g.fillStyle = SITE.white; g.font = '62px IDXB'; g.textAlign = 'center'; g.fillText(s.saving ? 'Saving…' : 'Saved ✓', 0, 22); g.restore();
  }
  g.restore();
  return PHONE_TEX;
}
// a slip: the note text plus, once on disk, a COMMIT stamp
const slipTex = (text, stamp, faint) => cached(`slip|${text}|${stamp ? 1 : 0}|${faint ? 1 : 0}`, 520, 150, (g, w, h) => {
  g.fillStyle = faint ? '#E9EEF7' : SITE.white; rr(g, 0, 0, w, h, 20); g.fill();
  g.fillStyle = faint ? '#7D8AA3' : SITE.ink; g.font = '52px InterB'; g.textAlign = 'left'; g.fillText(text + (faint ? '…' : ''), 30, 92);
  if (stamp) { g.fillStyle = SITE.blue; rr(g, w - 196, 34, 170, 82, 41); g.fill(); g.fillStyle = SITE.white; g.font = '36px IDXB'; g.textAlign = 'center'; g.fillText('COMMIT', w - 111, 88); }
});
const BOOK_TEX = cached('book', 540, 520, (g, w, h) => {
  g.fillStyle = '#F2F5FB'; rr(g, 0, 0, w, h, 18); g.fill();
  g.fillStyle = SITE.ink; g.font = '54px IDXB'; g.textAlign = 'left'; g.fillText('LOG', 30, 62);
});
const CAB_TEX = cached('cab', 460, 580, (g, w, h) => {
  g.fillStyle = SITE.pale; g.fillRect(0, 0, w, h);
  g.fillStyle = SITE.ink; g.font = '58px IDXB'; g.textAlign = 'center'; g.fillText('MAIN FILE', w / 2, 82);
  [0, 1, 2].forEach((i) => { g.fillStyle = SITE.white; rr(g, 34, 120 + i * 150, w - 68, 128, 16); g.fill(); g.fillStyle = '#9AA9C2'; rr(g, w / 2 - 50, 170 + i * 150, 100, 24, 12); g.fill(); });
});
const DRAWER_TEX = cached('drawer', 400, 140, (g, w, h) => { g.fillStyle = SITE.white; rr(g, 0, 0, w, h, 16); g.fill(); g.fillStyle = '#9AA9C2'; rr(g, w / 2 - 50, 56, 100, 26, 13); g.fill(); });
const swTex = (fast) => cached('sw' + (fast ? 1 : 0), 420, 150, (g, w, h) => {
  g.fillStyle = '#1B2740'; rr(g, 0, 0, w, h, 26); g.fill();
  g.font = '44px IDXB'; g.textAlign = 'center';
  g.fillStyle = fast ? '#788396' : SITE.white; g.fillText('FULL', w * 0.27, 92);
  g.fillStyle = fast ? SITE.white : '#788396'; g.fillText('FAST', w * 0.73, 92);
});

// ---- screen-space label (large, brief) anchored to a 3D point --------------------------------
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

// ---- lighting: 1 = room lit, 0 = blackout -------------------------------------------------------
function lightAt(t) {
  if (t < SHOTS[SH.first]) return 0;                                                   // hook: the power is already out
  let L = ease(ev(t, SHOTS[SH.first] + 0.1, 0.7));
  const dip = (t0, t1) => { L = Math.min(L, 1 - ease(ev(t, t0, 0.12)) + ease(ev(t, t1, 0.4))); };
  dip(T.crash4 - 0.05, T.crash4 + 0.45);                                               // "after a crash"
  dip(T.crashed - 0.05, T.both - 0.35);                                                // our test: crashed mid-save
  dip(T.cut - 0.1, T.so - 0.3);                                                        // power cut (faster setting)
  return clamp(L);
}
// ---- the world ------------------------------------------------------------------------------------
const hop = (t, t0, a = 0.25) => a * Math.sin(Math.PI * clamp((t - t0) / 0.45));
function world(ctx, t) {
  const cam = camAt(t), light = lightAt(t);
  floor(ctx, cam, BENCH, { at: [0.2, 0, 0.6], radius: 9, strength: 0.22 });
  const objs = [];
  // phone screen state
  let scr = { on: 1, battery: '1%', rows: [{ text: 'Pay rent Fri', hl: true }], badge: 1, pulse: ev(t, T.saved1 - 0.05, 0.4), saving: false };
  if (t < SHOTS[SH.first]) scr.on = 1 - ev(t, T.died - 0.02, 0.1);                       // the power dies on "died"
  else if (t < SHOTS[SH.later]) {                                                         // the save, step by step
    const typedN = Math.round(12 * clamp((t - SHOTS[SH.log]) / 0.5));
    scr = { on: ev(t, SHOTS[SH.first] + 0.3, 0.4), battery: '1%', rows: [{ text: t < SHOTS[SH.log] ? 'Pay rent Fri' : 'Pay rent Fri'.slice(0, Math.max(1, typedN)), hl: true }],
      badge: t < SHOTS[SH.log] ? 0 : ev(t, T.change - 0.1, 0.2), saving: t < T.says - 0.05, pulse: ev(t, T.saved3 - 0.05, 0.4) };
  } else if (t < SHOTS[SH.proof]) scr = { on: 1, battery: '1%', rows: [{ text: 'Pay rent Fri' }], badge: 0, pulse: 0 };
  else if (t < SHOTS[SH.fast]) {                                                           // our test: after restart, the two committed notes
    const rest = t >= T.both - 0.2;
    scr = { on: t < T.crashed ? 1 : rest ? ev(t, T.both - 0.2, 0.3) : 0, battery: rest ? '64%' : '1%', rows: rest ? back2.map((x) => ({ text: x, hl: t < T.came + 0.8 })) : NOTES.map((x) => ({ text: x })), badge: 0, pulse: 0 };
  } else scr = { on: t < T.cut ? 1 : t < T.so - 0.3 ? 0 : ev(t, T.so - 0.3, 0.3), battery: '64%', rows: back2.map((x) => ({ text: x })), badge: 0, pulse: 0 };
  const phone = { ...PHONE, y: hop(t, T.keep), colors: BODY, color: SITE.surface, tex: { front: phoneScreen(scr) }, edge: 'rgba(183,199,223,0.35)' };
  objs.push(phone);
  objs.push({ ...BOOK, color: '#C9D6EC', colors: { top: '#F2F5FB', front: '#9AA9C2', left: '#9AA9C2', right: '#9AA9C2' }, tex: { top: BOOK_TEX }, edge: 'rgba(3,6,16,0.2)' });
  objs.push({ ...CAB, color: SITE.gray, colors: { top: SITE.pale, left: '#A7B8D2', right: SITE.gray, front: SITE.pale }, tex: { front: CAB_TEX }, edge: 'rgba(3,6,16,0.2)' });
  // ---- slips (the log) and the cabinet drawer ----
  const slip = (p, tex, o = {}) => ({ x: p[0], y: p[1], z: p[2], w: SLIP.w * (o.s ?? 1), h: SLIP.h, d: SLIP.d * (o.s ?? 1), yaw: o.yaw ?? BOOK.yaw, pitch: o.pitch || 0,
    color: SITE.white, colors: { front: SITE.gray, back: SITE.gray, left: SITE.gray, right: SITE.gray }, tex: { top: tex }, alpha: o.alpha ?? 1, edge: 'rgba(3,6,16,0.25)', kind: 'slip' });
  const arc = (p0, p3, s, lift = 1.6) => bez(p0, [p0[0], p0[1] + lift, p0[2]], [p3[0], p3[1] + lift, p3[2]], p3, s);
  let drawerK = 0;
  const intoDrawer = (p0, k) => arc(p0, drawerOpen(1), k, 1.2);
  if (t >= SHOTS[SH.log] - 0.2 && t < SHOTS[SH.proof]) {
    // one save: the slip leaves the phone, lands in the log, is stamped on "disk"; later replayed into the cabinet
    const k = ease(ev(t, T.change, 0.75)), stamp = t >= T.disk;
    const rk = ease(ev(t, T.replayed - 0.1, 0.8));
    if (k > 0) {
      let p = arc(PHONE_OUT, slotPos(0), k, 1.4); let alpha = 1;
      if (rk > 0) { p = intoDrawer(slotPos(0), rk); alpha = 1 - ev(rk, 0.8, 0.2); }
      objs.push(slip(p, slipTex(NOTES[0], stamp), { pitch: 0.5 * Math.sin(Math.PI * Math.max(rk, k < 1 ? k : 0)), alpha }));
      if (rk > 0 && rk < 1) objs.push(slip(slotPos(0), slipTex(NOTES[0], true), { alpha: 0.35 }));        // the log keeps its copy
      if (rk >= 1) objs.push(slip(slotPos(0), slipTex(NOTES[0], true)));
    }
    drawerK = ev(t, T.replayed - 0.25, 0.3) * (1 - ev(t, T.replayed + 0.75, 0.3));
  } else if (t >= SHOTS[SH.proof] && t < SHOTS[SH.fast]) {
    // our test: two committed slips + one unfinished; crash; the committed two are replayed, the unfinished one is dropped
    const rest = t >= T.both - 0.2;
    NOTES.forEach((n, i) => {
      const committed = i < 2, ik = ease(ev(t, SHOTS[SH.proof] + 0.15 + i * 0.25, 0.4));
      if (ik <= 0) return;
      let p = mix3([slotPos(i)[0], slotPos(i)[1] + 1.2, slotPos(i)[2]], slotPos(i), ik), alpha = committed ? 1 : 0.75;
      if (committed && rest) {
        const rk = ease(ev(t, T.both + i * 0.3, 0.75));
        if (rk > 0) { objs.push(slip(slotPos(i), slipTex(n, true), { alpha: 0.35 + 0.65 * ev(rk, 0.9, 0.1) })); p = intoDrawer(slotPos(i), rk); alpha = 1 - ev(rk, 0.8, 0.2); }
      }
      if (!committed && rest) { alpha *= 1 - ev(t, T.both - 0.2, 0.5); p = [p[0], p[1] + 0.3 * ev(t, T.both - 0.2, 0.5), p[2]]; }
      if (alpha > 0) objs.push(slip(p, slipTex(n, committed, !committed), { alpha }));
    });
    drawerK = ev(t, T.both - 0.15, 0.3) * (1 - ev(t, T.came + 0.6, 0.3));
  } else if (t >= SHOTS[SH.fast]) {
    // faster setting: the committed slips sit in the log; new ones wait above it in memory; the power cut loses them
    [0, 1].forEach((i) => objs.push(slip(slotPos(i), slipTex(NOTES[i], true))));
    const fresh = ['Book dentist', 'Pay Sam back'];
    fresh.forEach((n, j) => {
      const ak = ease(ev(t, T.settings + 0.1 + j * 0.35, 0.5)); if (ak <= 0) return;
      const hover = [slotPos(2 + j)[0] + (j ? 0.45 : -0.45), BOOK.h + 1.35 + j * 0.5, slotPos(2 + j)[2] - 0.2];
      const p = arc(PHONE_OUT, hover, ak, 0.8);
      let alpha = 1 - ev(t, T.cut - 0.05, 0.15);                                               // gone in the power cut
      if (t >= T.so - 0.3) {                                                                   // payoff: with full sync they land and are stamped
        const lk = ease(ev(t, T.full - 0.1 + j * 0.2, 0.5)); alpha = ev(t, T.full - 0.15, 0.2);
        if (alpha > 0) objs.push(slip(mix3(hover, slotPos(2 + j), lk), slipTex(n, lk >= 1), { alpha, yaw: BOOK.yaw, pitch: 0.35 * (1 - lk) }));   // face the camera until it lands
        return;
      }
      if (alpha > 0) objs.push(slip(p, slipTex(n, false), { alpha, pitch: 0.35, yaw: BOOK.yaw + j * 0.06 }));
    });
  }
  if (drawerK > 0) { const d = drawerOpen(ease(drawerK)); objs.push({ x: d[0], y: d[1] - 0.3, z: d[2] - 0.5, w: 1.9, h: 0.62, d: 1.0, yaw: CAB.yaw, color: SITE.gray, colors: { front: SITE.white, top: '#C9D6EC' }, tex: { front: DRAWER_TEX }, edge: 'rgba(3,6,16,0.25)' }); }
  // the sync switch (FULL ↔ FAST)
  const fast = t >= T.faster - 0.05 && t < T.full - 0.1;
  const swOn = ev(t, SHOTS[SH.fast] - 0.2, 0.3);
  if (swOn > 0) {
    objs.push({ ...SW, color: '#1B2740', tex: { top: swTex(fast) }, alpha: swOn });
    const knob = yawPt(SW, lerp(-0.42, 0.42, ease(ev(t, T.faster - 0.05, 0.25)) * (1 - ease(ev(t, T.full - 0.1, 0.25)))), SW.h, 0);
    objs.push({ x: knob[0], y: knob[1], z: knob[2], w: 0.7, h: 0.18, d: 0.5, yaw: SW.yaw, color: SITE.blue, colors: { top: '#5B9BFF' }, alpha: swOn, edge: 'rgba(255,255,255,0.3)' });
  }
  // draw: shadows, then objects far → near (slips just after the notebook they sit on)
  for (const o of objs) if (o.kind !== 'slip') contactShadow(ctx, cam, o, 0.5, o.h > 1 ? 0.3 : 0.12);
  const bookDepth = project(cam, [BOOK.x, BOOK.h / 2, BOOK.z]).z;              // slips lying on the page draw right after the notebook
  objs.map((o, i) => ({ o, z: o.kind === 'slip' && o.y < BOOK.h + 0.08 ? bookDepth - 0.01 - i * 1e-4 : project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z - (o.kind === 'slip' ? 0.5 : 0) }))
    .sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  // ---- blackout: darken the room; a lit phone screen still glows ----
  const dark = 1 - light;
  if (dark > 0.001) {
    ctx.save(); ctx.fillStyle = `rgba(1,3,10,${(t < SHOTS[SH.first] ? 0.95 : 0.86) * dark})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (scr.on > 0) {
      const c = project(cam, [PHONE.x, 2.6, PHONE.z]);
      const g = ctx.createRadialGradient(c.x, c.y, 40, c.x, c.y, 620); g.addColorStop(0, `rgba(59,130,246,${0.28 * dark * scr.on})`); g.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = dark * clamp(scr.on); drawBox(ctx, cam, { ...phone, skip: ['top', 'left', 'right', 'back', 'bottom'], ambient: 1 }); ctx.restore();
    }
  }
  // ---- large, brief labels (one idea at a time) ----
  const bookTop = yawPt(BOOK, 0, BOOK.h, 0), cabTop = yawPt(CAB, 0, CAB.h, 0), swPt = yawPt(SW, 0, 0, 0);
  tag(ctx, cam, bookTop, 'LOG', ev(t, T.log3 - 0.05, 0.3) * (1 - ev(t, T.disk - 0.2, 0.15)), { fill: SITE.blue, color: SITE.white, dy: -150 });
  tag(ctx, cam, bookTop, 'ON DISK ✓', ev(t, T.disk - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.later] - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -150 });
  tag(ctx, cam, cabTop, 'MAIN FILE: LATER', ev(t, T.later - 0.1, 0.3) * (1 - ev(t, T.after - 0.15, 0.2)), { fill: SITE.white, dy: -60 });
  tag(ctx, cam, cabTop, 'REPLAY', ev(t, T.replayed - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.proof] - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -60 });
  tag(ctx, cam, bookTop, 'OUR SQLITE TEST', ev(t, T.test - 0.05, 0.3) * (1 - ev(t, T.crashed - 0.15, 0.15)), { fill: SITE.white, dy: -200 });
  tag(ctx, cam, cabTop, 'COMMITTED: BACK', ev(t, T.committed - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.fast] - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: -60 });
  tag(ctx, cam, slotPos(2), 'UNFINISHED: GONE', ev(t, T.came - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.fast] - 0.15, 0.2)), { fill: SITE.white, dy: 110 });
  tag(ctx, cam, swPt, 'FASTER SETTING', ev(t, T.faster + 0.05, 0.3) * (1 - ev(t, T.last - 0.15, 0.15)), { fill: SITE.white, dy: 125 });
  tag(ctx, cam, swPt, 'NOT ON DISK YET', ev(t, T.last - 0.05, 0.3) * (1 - ev(t, T.cut - 0.1, 0.15)), { fill: SITE.white, dy: 125 });
  tag(ctx, cam, swPt, 'LOST', ev(t, T.cut + 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.05, 0.15)), { fill: SITE.blue, color: SITE.white, dy: 125 });
  // ---- kinetic type: frame-zero question (already on screen at t = 0), promise, payoff ----
  if (t < T.good - 0.3) {
    const a = 1 - ev(t, T.good - 0.55, 0.25);
    text(ctx, 'WAS IT REALLY', 540, 690, { size: 96, font: 'IDXB', alpha: a });
    text(ctx, 'SAVED?', 540, 820, { size: 130, font: 'IDXB', color: SITE.blue, alpha: a });
  }
  kword(ctx, 'WRITE IT DOWN', 540, 690, 96, t, T.write - 0.05, { t1: T.each - 0.3 });
  kword(ctx, 'FIRST.', 540, 800, 110, t, T.first - 0.05, { color: SITE.blue, t1: T.each - 0.3 });
  kword(ctx, 'SAVED = LOGGED.', 540, 690, 96, t, VW('L7', 'saved') - 0.05, { t1: T.for7 - 0.25 });
  kword(ctx, 'KEEP FULL SYNC.', 540, 720, 100, t, T.keep - 0.05, { color: SITE.blue, t1: CTA_AT });
}

// ---- captions (2026-11-11 rule: readable inside x 100–900; house band y 340–520, centred x 500) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['It said saved.'] },
  { t0: T.then, lines: ['Then the power died.'] },
  { t0: T.is, lines: ['Is your note still there?'] },
  { t0: VL('L2').t0, lines: ['Good databases', 'write it down first.'] },
  { t0: VL('L3').t0, lines: ['Each change goes into', 'a log on disk,'] },
  { t0: T.then3, lines: ['then the app says saved.'] },
  { t0: VL('L4').t0, lines: ['The main file', 'is updated later.'] },
  { t0: T.after, lines: ['After a crash,', 'the log is replayed.'] },
  { t0: VL('L5').t0, lines: ['In our test,', 'SQLite crashed mid-save.'] },
  { t0: T.both, lines: ['Both committed notes', 'came back.'] },
  { t0: VL('L6').t0, lines: ['Faster settings can lose', 'the last few commits'] },
  { t0: VW('L6', 'in'), lines: ['in a power cut.'] },
  { t0: VL('L7').t0, lines: ['So saved means logged.'] },
  { t0: T.for7, lines: ["For data you can't lose,", 'keep full sync.'], tEnd: VL('L8').t0 - 0.05 },
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
  add(0.0, 'blip', { hi: true }); add(T.saved1 - 0.05, 'blip'); add(T.died - 0.02, 'carve');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(SHOTS[SH.first] + 0.1, 'match');                                                  // lights back on
  add(T.write - 0.05, 'type'); add(T.first - 0.05, 'type');
  add(T.change, 'slide', { soft: true }); add(T.change + 0.75, 'clack'); add(T.disk, 'tap'); add(T.saved3 - 0.05, 'blip', { hi: true });
  add(T.crash4 - 0.05, 'carve'); add(T.crash4 + 0.45, 'match'); add(T.replayed - 0.1, 'slide'); add(T.replayed + 0.7, 'clack', { soft: true });
  add(SHOTS[SH.proof] + 0.15, 'clack', { soft: true }); add(SHOTS[SH.proof] + 0.4, 'clack', { soft: true }); add(SHOTS[SH.proof] + 0.65, 'clack', { soft: true });
  add(T.crashed - 0.05, 'carve'); add(T.both - 0.35, 'match'); add(T.both, 'slide'); add(T.both + 0.3, 'slide', { soft: true }); add(T.came, 'blip', { hi: true });
  add(T.faster - 0.05, 'tap'); add(T.settings + 0.1, 'slide', { soft: true }); add(T.settings + 0.45, 'slide', { soft: true }); add(T.cut - 0.1, 'carve');
  add(T.so - 0.3, 'match'); add(VW('L7', 'saved') - 0.05, 'type'); add(T.full - 0.1, 'tap'); add(T.full + 0.4, 'clack', { soft: true }); add(T.keep - 0.05, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame: the 3D world, then one blue wipe up into the accepted CTA -------------------------
const STAGE_TOP = 540, WIPE = 0.5;
const bg = makeBackground();
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  const k = (t - (CTA_AT - WIPE / 2)) / WIPE;
  const topTint = () => {                                                              // the blackout darkens the whole frame, not just the stage
    if (k >= 0) return; const dk = 1 - lightAt(t);
    if (dk > 0.001) { ctx.fillStyle = `rgba(1,3,10,${(t < SHOTS[SH.first] ? 0.95 : 0.86) * dk})`; ctx.fillRect(0, 0, W, STAGE_TOP); }
  };
  if (process.env.ONLY_BG) { topTint(); return; }                                       // QA reference: background + the same uniform tint
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  if (k < 0) world(ctx, t);
  else if (k >= 1) cta(ctx, t);
  else {
    const e = ease(k), band = 220, edge = lerp(H + band, STAGE_TOP - band, e);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); world(ctx, t); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); cta(ctx, t); ctx.restore();
    ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
  }
  ctx.restore();
  topTint();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}

// ---- thumbnail: frame zero itself (the brief: the first image works as the thumbnail) + the wordmark ----
export function drawThumbnail(ctx) {
  const prev = process.env.NO_CAPTION; process.env.NO_CAPTION = '1';
  drawFrame(ctx, 0);
  if (prev === undefined) delete process.env.NO_CAPTION; else process.env.NO_CAPTION = prev;
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 372, 54, 70);                                                 // wordmark in the empty top, clear of the phone
  text(ctx, 'Tensor', x0 + 70, 424, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 424, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
